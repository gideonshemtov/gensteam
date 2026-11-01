const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAppActivator,
  GUARDED_ACTIVATION_DELAYS,
} = require('../js/AppActivation');

function makeWindow() {
  const calls = [];
  return {
    calls,
    destroyed: false,
    minimized: false,
    isDestroyed() { return this.destroyed; },
    isMinimized() { return this.minimized; },
    restore() {
      calls.push('restore');
      this.minimized = false;
    },
    show() { calls.push('show'); },
    showInactive() { calls.push('showInactive'); },
    focus() { calls.push('focus'); },
    moveTop() { calls.push('moveTop'); },
  };
}

function makeApp(overrides = {}) {
  const app = {
    isPackaged: true,
    focusCalls: [],
    policyCalls: [],
    dockShowCalls: 0,
    focus(options) { this.focusCalls.push(options); },
    setActivationPolicy(policy) { this.policyCalls.push(policy); },
    dock: {
      show: () => {
        app.dockShowCalls += 1;
        return Promise.resolve();
      },
    },
  };
  return Object.assign(app, overrides);
}

function makeTimers() {
  const timers = [];
  return {
    timers,
    setTimer(fn, delay) {
      timers.push({ fn, delay });
      return timers.length;
    },
    runAll() {
      for (const timer of timers) {
        timer.fn();
      }
    },
  };
}

function frontmostSequence(...ids) {
  let index = 0;
  return () => ids[Math.min(index++, ids.length - 1)];
}

function makeActivator({
  platform = 'darwin',
  app = makeApp(),
  bundleId = 'org.example.app',
  frontmost = () => 'com.valvesoftware.steam',
  log = () => {},
  timers = makeTimers(),
} = {}) {
  const launchServicesCalls = [];
  return {
    app,
    timers,
    launchServicesCalls,
    activator: createAppActivator({
      app,
      bundleId,
      platform,
      log,
      getFrontmostBundleId: frontmost,
      runLaunchServices: (id) => launchServicesCalls.push(id),
      setTimer: timers.setTimer,
    }),
  };
}

test('launch activation is scheduled across the guarded retry window', () => {
  const { activator, timers } = makeActivator();

  activator.activateAtLaunch(makeWindow());

  assert.deepEqual(
    timers.timers.map((timer) => timer.delay),
    GUARDED_ACTIVATION_DELAYS,
  );
});

test('a normal launch comes to the front and stays idle while it remains frontmost', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    frontmost: frontmostSequence('com.valvesoftware.steam', 'org.example.app'),
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  assert.deepEqual(win.calls, ['showInactive']);

  timers.runAll();

  assert.deepEqual(win.calls, ['showInactive', 'show', 'focus', 'moveTop']);
  assert.deepEqual(app.focusCalls, [{ steal: true }]);
  assert.deepEqual(app.policyCalls, ['regular']);
  assert.equal(app.dockShowCalls, 0);
  assert.deepEqual(launchServicesCalls, ['org.example.app']);
});

test('reclaims the front when Steam takes it back during launch', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    frontmost: frontmostSequence(
      'com.valvesoftware.steam',
      'org.example.app',
      'com.valvesoftware.steam',
      'org.example.app',
    ),
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.deepEqual(win.calls, [
    'showInactive',
    'show',
    'focus',
    'moveTop',
    'show',
    'focus',
    'moveTop',
  ]);
  assert.deepEqual(app.focusCalls, [{ steal: true }, { steal: true }]);
  assert.deepEqual(launchServicesCalls, ['org.example.app', 'org.example.app']);
});

test('a launch where the player already switched away does not activate', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    frontmost: () => 'com.apple.Safari',
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.deepEqual(win.calls, ['showInactive']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, ['regular']);
  assert.deepEqual(launchServicesCalls, []);
});

test('switching to Finder during startup also stops activation', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    frontmost: () => 'com.apple.finder',
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.deepEqual(win.calls, ['showInactive']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(launchServicesCalls, []);
});

test('switching away after the first attempt stops further activation', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    frontmost: frontmostSequence('com.valvesoftware.steam', 'com.apple.Safari'),
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.deepEqual(win.calls, ['showInactive', 'show', 'focus', 'moveTop']);
  assert.deepEqual(app.focusCalls, [{ steal: true }]);
  assert.deepEqual(launchServicesCalls, ['org.example.app']);
});

test('an unknown frontmost app is treated as a reason to stop', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    frontmost: () => null,
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.deepEqual(win.calls, ['showInactive']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(launchServicesCalls, []);
});

test('non-macOS launch keeps the normal show and focus behaviour', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    platform: 'linux',
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);

  assert.deepEqual(win.calls, ['show', 'focus']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, []);
  assert.equal(timers.timers.length, 0);
  assert.deepEqual(launchServicesCalls, []);
});

test('an unpackaged development run never asks LaunchServices to activate', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator({
    app: makeApp({ isPackaged: false }),
  });
  const win = makeWindow();

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.equal(app.focusCalls.length, GUARDED_ACTIVATION_DELAYS.length);
  assert.deepEqual(launchServicesCalls, []);
});

test('user-initiated activation shows and focuses the existing window', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator();
  const win = makeWindow();

  activator.activate(win);

  assert.deepEqual(win.calls, ['show', 'focus', 'moveTop']);
  assert.deepEqual(app.focusCalls, [{ steal: true }]);
  assert.deepEqual(app.policyCalls, ['regular']);
  assert.equal(timers.timers.length, 0);
  assert.deepEqual(launchServicesCalls, []);
});

test('a minimized window is restored before it is shown', () => {
  const { activator, timers } = makeActivator();
  const win = makeWindow();
  win.minimized = true;

  activator.activateAtLaunch(win);
  timers.runAll();

  assert.equal(win.calls[0], 'restore');
  assert.equal(win.calls[1], 'showInactive');
  assert.equal(win.minimized, false);
});

test('a destroyed window is ignored', () => {
  const { activator, app, timers, launchServicesCalls } = makeActivator();
  const win = makeWindow();
  win.destroyed = true;

  activator.activateAtLaunch(win);
  activator.activate(win);
  timers.runAll();

  assert.deepEqual(win.calls, []);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, []);
  assert.deepEqual(launchServicesCalls, []);
});

test('ensureForegroundApp does not call dock.show()', () => {
  const { activator, app } = makeActivator();

  activator.ensureForegroundApp();

  assert.deepEqual(app.policyCalls, ['regular']);
  assert.equal(app.dockShowCalls, 0);
});
