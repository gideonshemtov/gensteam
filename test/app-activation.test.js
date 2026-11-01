const test = require('node:test');
const assert = require('node:assert/strict');

const { createAppActivator } = require('../js/AppActivation');

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

function makeApp() {
  const app = {
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
  return app;
}

function makeActivator({ platform = 'darwin', app = makeApp(), log = () => {} } = {}) {
  return {
    app,
    activator: createAppActivator({ app, platform, log }),
  };
}

test('macOS launch shows the window inactive and never activates the app', () => {
  const { activator, app } = makeActivator();
  const win = makeWindow();

  activator.showAtLaunch(win);

  assert.deepEqual(win.calls, ['showInactive']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, ['regular']);
  assert.equal(app.dockShowCalls, 0);
});

test('non-macOS launch keeps the normal show and focus behaviour', () => {
  const { activator, app } = makeActivator({ platform: 'linux' });
  const win = makeWindow();

  activator.showAtLaunch(win);

  assert.deepEqual(win.calls, ['show', 'focus']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, []);
});

test('user-initiated activation shows and focuses the existing window', () => {
  const { activator, app } = makeActivator();
  const win = makeWindow();

  activator.activate(win);

  assert.deepEqual(win.calls, ['show', 'focus', 'moveTop']);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, ['regular']);
});

test('non-macOS user activation does not move the window', () => {
  const { activator } = makeActivator({ platform: 'linux' });
  const win = makeWindow();

  activator.activate(win);

  assert.deepEqual(win.calls, ['show', 'focus']);
});

test('a minimized window is restored before it is shown', () => {
  const { activator } = makeActivator();
  const win = makeWindow();
  win.minimized = true;

  activator.showAtLaunch(win);

  assert.deepEqual(win.calls, ['restore', 'showInactive']);
  assert.equal(win.minimized, false);
});

test('a destroyed window is ignored', () => {
  const { activator, app } = makeActivator();
  const win = makeWindow();
  win.destroyed = true;

  activator.showAtLaunch(win);
  activator.activate(win);

  assert.deepEqual(win.calls, []);
  assert.deepEqual(app.focusCalls, []);
  assert.deepEqual(app.policyCalls, []);
});

test('ensureForegroundApp makes the app regular without focusing it', () => {
  const { activator, app } = makeActivator();

  activator.ensureForegroundApp();

  assert.deepEqual(app.policyCalls, ['regular']);
  assert.deepEqual(app.focusCalls, []);
  assert.equal(app.dockShowCalls, 0);
});
