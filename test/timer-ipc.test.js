require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const TimerIPC = require('../js/TimerIPC');
const { ipcHandlers } = require('./helpers/electron-stub');
const { GAME_ORIGIN } = require('../js/WindowManager');

function setup() {
  const saved = [];
  const settingsManager = {
    settings: {
      ui: { showButtonPanel: true },
      buttons: { customButtons: [{ icon: 'x', title: 'x', command: 'x', color: '#000000' }] },
      timers: { activeTimers: [] },
    },
    get() {
      return this.settings;
    },
    save(next) {
      this.settings = next;
      saved.push(next);
    },
  };

  const ipc = new TimerIPC(settingsManager);
  ipc.setupHandlers();

  return { settingsManager, saved, handler: ipcHandlers.get('save-timer-settings') };
}

const trustedEvent = () => ({ senderFrame: { url: `${GAME_ORIGIN}/play`, parent: null } });

// The handlers log expected rejections; keep the test output clean.
function silenceConsole(t) {
  const original = { error: console.error, warn: console.warn };
  console.error = () => {};
  console.warn = () => {};
  t.after(() => {
    console.error = original.error;
    console.warn = original.warn;
  });
}

test('accepts validated timers from the game frame', () => {
  const { handler, settingsManager } = setup();
  const result = handler(trustedEvent(), {
    activeTimers: [{ id: 1, name: 't', interval: 5, command: 'look', isActive: true }],
  });

  assert.equal(result.success, true);
  assert.deepEqual(settingsManager.settings.timers.activeTimers[0], {
    id: 1, name: 't', interval: 5, command: 'look', isActive: true,
  });
});

test('rejects untrusted senders', (t) => {
  silenceConsole(t);
  const { handler, saved } = setup();

  assert.equal(handler({ senderFrame: { url: 'https://evil.example/', parent: null } }, { activeTimers: [] }).success, false);
  assert.equal(handler({ senderFrame: { url: `${GAME_ORIGIN}/play`, parent: { url: GAME_ORIGIN } } }, { activeTimers: [] }).success, false);
  assert.equal(handler({ senderFrame: null }, { activeTimers: [] }).success, false);
  assert.equal(saved.length, 0);
});

test('ignores non-timer settings smuggled into the payload', () => {
  const { handler, settingsManager } = setup();

  handler(trustedEvent(), {
    activeTimers: [{ id: 2, name: 't2', interval: 10, command: 'who', isActive: false, admin: true }],
    ui: { showButtonPanel: false },
    buttons: { customButtons: [] },
  });

  // Only the timers slice is applied; other fields are untouched and extras dropped.
  assert.equal(settingsManager.settings.ui.showButtonPanel, true);
  assert.equal(settingsManager.settings.buttons.customButtons.length, 1);
  assert.deepEqual(
    Object.keys(settingsManager.settings.timers.activeTimers[0]).sort(),
    ['command', 'id', 'interval', 'isActive', 'name'],
  );
});

test('rejects invalid timer payloads', (t) => {
  silenceConsole(t);
  const { handler, saved } = setup();

  const invalidPayloads = [
    { activeTimers: 'nope' },
    {},
    { activeTimers: [{ id: 1, name: 't', interval: 0, command: 'x', isActive: true }] },
    { activeTimers: [{ id: 1, name: 't', interval: 99999, command: 'x', isActive: true }] },
    { activeTimers: [{ id: '1', name: 't', interval: 5, command: 'x', isActive: true }] },
    { activeTimers: [{ id: 1, name: 't', interval: 5, command: 'x', isActive: 'yes' }] },
    { activeTimers: [{ name: 't', interval: 5, command: 'x', isActive: true }] },
  ];

  for (const payload of invalidPayloads) {
    assert.equal(handler(trustedEvent(), payload).success, false);
  }
  assert.equal(saved.length, 0);
});

test('preserves optional createdAt on timers', () => {
  const { handler, settingsManager } = setup();

  handler(trustedEvent(), {
    activeTimers: [{ id: 1, name: 't', interval: 5, command: 'look', isActive: true, createdAt: 123 }],
  });

  assert.equal(settingsManager.settings.timers.activeTimers[0].createdAt, 123);
});
