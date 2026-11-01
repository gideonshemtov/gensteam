const test = require('node:test');
const assert = require('node:assert/strict');

const { createAppActivator, LAUNCH_SERVICES } = require('../js/AppActivation');

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

function makeSpawn({ fail = false } = {}) {
  const calls = [];
  const spawn = (command, args, options) => {
    const call = { command, args, options, unrefCalled: false };
    calls.push(call);
    if (fail) {
      throw new Error('spawn failed');
    }
    return {
      unref() { call.unrefCalled = true; },
    };
  };
  spawn.calls = calls;
  return spawn;
}

function makeActivator({
  platform = 'darwin',
  app = makeApp(),
  spawn = makeSpawn(),
  bundleId = 'org.example.app',
  log = () => {},
} = {}) {
  return {
    app,
    spawn,
    activator: createAppActivator({ app, spawn, bundleId, platform, log }),
  };
}

test('the initial launch asks LaunchServices to activate the app once', () => {
  const { activator, app, spawn } = makeActivator();
  const win = makeWindow();

  activator.activate(win, { allowLaunchServices: true });

  assert.deepEqual(win.calls, ['show', 'focus', 'moveTop']);
  assert.deepEqual(app.focusCalls, [{ steal: true }]);
  assert.deepEqual(app.policyCalls, ['regular']);
  assert.equal(app.dockShowCalls, 0);
  assert.equal(spawn.calls.length, 1);
  assert.equal(spawn.calls[0].command, LAUNCH_SERVICES);
  assert.deepEqual(spawn.calls[0].args, ['-b', 'org.example.app']);
  assert.equal(spawn.calls[0].unrefCalled, true);
});

test('LaunchServices is not requested again on a later activation', () => {
  const { activator, spawn } = makeActivator();
  const win = makeWindow();

  activator.activate(win, { allowLaunchServices: true });
  activator.activate(win, { allowLaunchServices: true });

  assert.equal(spawn.calls.length, 1);
});

test('user-initiated activation does not use LaunchServices', () => {
  const { activator, app, spawn } = makeActivator();
  const win = makeWindow();

  // Default is the Dock/relaunch path: raise our own window only.
  activator.activate(win);

  assert.deepEqual(win.calls, ['show', 'focus', 'moveTop']);
  assert.deepEqual(app.focusCalls, [{ steal: true }]);
  assert.equal(spawn.calls.length, 0);
});

test('non-macOS platforms only show and focus the window', () => {
  const { activator, app, spawn } = makeActivator({ platform: 'linux' });
  const win = makeWindow();

  activator.activate(win, { allowLaunchServices: true });

  assert.deepEqual(win.calls, ['show', 'focus']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, []);
  assert.equal(spawn.calls.length, 0);
});

test('LaunchServices is skipped when the app is not packaged', () => {
  const { activator, spawn } = makeActivator({ app: makeApp({ isPackaged: false }) });
  const win = makeWindow();

  activator.activate(win, { allowLaunchServices: true });

  assert.equal(spawn.calls.length, 0);
});

test('a minimized window is restored before it is shown', () => {
  const { activator } = makeActivator();
  const win = makeWindow();
  win.minimized = true;

  activator.activate(win);

  assert.deepEqual(win.calls, ['restore', 'show', 'focus', 'moveTop']);
  assert.equal(win.minimized, false);
});

test('a destroyed window is ignored', () => {
  const { activator, app, spawn } = makeActivator();
  const win = makeWindow();
  win.destroyed = true;

  activator.activate(win, { allowLaunchServices: true });

  assert.deepEqual(win.calls, []);
  assert.deepEqual(app.focusCalls, []);
  assert.equal(spawn.calls.length, 0);
});

test('ensureForegroundApp does not call dock.show()', () => {
  const { activator, app } = makeActivator();

  activator.ensureForegroundApp();

  assert.deepEqual(app.policyCalls, ['regular']);
  assert.equal(app.dockShowCalls, 0);
});

test('a failed LaunchServices spawn does not break activation or retry', () => {
  const { activator, spawn } = makeActivator({ spawn: makeSpawn({ fail: true }) });
  const win = makeWindow();

  assert.doesNotThrow(() => activator.activate(win, { allowLaunchServices: true }));
  assert.doesNotThrow(() => activator.activate(win, { allowLaunchServices: true }));

  assert.deepEqual(win.calls, ['show', 'focus', 'moveTop', 'show', 'focus', 'moveTop']);
  assert.equal(spawn.calls.length, 1);
});
