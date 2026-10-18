require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { electronStub } = require('./helpers/electron-stub');
const HotkeyManager = require('../js/HotkeyManager');

function makeSettings(overrides = {}) {
  return {
    hotkeys: {
      enabled: true,
      bindings: [{ keys: 'F1', command: 'look' }],
      ...overrides,
    },
  };
}

function makeManager(settings) {
  const manager = new HotkeyManager({ get: () => settings });
  const win = new electronStub.BrowserWindow({});
  manager.attach(win);
  return { manager, win };
}

function press(win, input) {
  let prevented = false;
  win.webContents.emit(
    'before-input-event',
    { preventDefault: () => { prevented = true; } },
    { type: 'keyDown', isAutoRepeat: false, isComposing: false, control: false, alt: false, shift: false, meta: false, ...input },
  );
  return prevented;
}

test('a matching hotkey sends its command and consumes the key', () => {
  const { win } = makeManager(makeSettings());

  const prevented = press(win, { key: 'F1' });

  assert.equal(prevented, true);
  assert.equal(win.executedScripts.length, 1);
  assert.ok(win.executedScripts[0].includes('"look"'));
  assert.ok(win.executedScripts[0].includes('window.sendCommand'));
});

test('a non-matching key is left alone', () => {
  const { win } = makeManager(makeSettings());

  const prevented = press(win, { key: 'F2' });

  assert.equal(prevented, false);
  assert.equal(win.executedScripts.length, 0);
});

test('hotkeys can be disabled', () => {
  const { win } = makeManager(makeSettings({ enabled: false }));

  assert.equal(press(win, { key: 'F1' }), false);
  assert.equal(win.executedScripts.length, 0);
});

test('unsafe bindings (plain keys) are ignored so typing still works', () => {
  const { win } = makeManager({
    hotkeys: { enabled: true, bindings: [{ keys: 'l', command: 'look' }] },
  });

  assert.equal(press(win, { key: 'l' }), false);
  assert.equal(win.executedScripts.length, 0);
});

test('key repeat and key-up events do not re-fire hotkeys', () => {
  const { win } = makeManager(makeSettings());

  press(win, { key: 'F1', isAutoRepeat: true });
  press(win, { key: 'F1', type: 'keyUp' });

  assert.equal(win.executedScripts.length, 0);
});

test('modifier hotkeys match with the right modifier state', () => {
  const { win } = makeManager({
    hotkeys: { enabled: true, bindings: [{ keys: 'Ctrl+1', command: 'who' }] },
  });

  assert.equal(press(win, { key: '1' }), false, 'plain 1 should not match');
  assert.equal(press(win, { key: '1', control: true }), true);
  assert.equal(win.executedScripts.length, 1);
});

test('an empty command is not dispatched', () => {
  const { win } = makeManager({
    hotkeys: { enabled: true, bindings: [{ keys: 'F1', command: '   ' }] },
  });

  assert.equal(press(win, { key: 'F1' }), false);
  assert.equal(win.executedScripts.length, 0);
});

test('detach makes the manager inert', () => {
  const { manager, win } = makeManager(makeSettings());

  assert.equal(press(win, { key: 'F1' }), true);
  manager.detach();
  assert.equal(press(win, { key: 'F1' }), false);
  assert.equal(win.executedScripts.length, 1);
});
