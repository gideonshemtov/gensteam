require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const TimerManager = require('../js/TimerManager');

// TimerManager runs inside the renderer in production; provide the globals it touches.
const savedPayloads = [];
global.window = {
  electronAPI: {
    saveTimerSettings: (timers) => {
      savedPayloads.push(timers);
      return Promise.resolve({ success: true });
    },
  },
};
global.document = { getElementById: () => null };

const originalLog = console.log;
test.before(() => { console.log = () => {}; });
test.after(() => { console.log = originalLog; });
test.beforeEach(() => { savedPayloads.length = 0; });

function makeManager() {
  const settings = { timers: { activeTimers: [] } };
  const manager = new TimerManager();
  manager.init(settings);
  return { manager, settings };
}

test('createTimer() adds a timer and persists only the timers slice', () => {
  const { manager, settings } = makeManager();

  const id = manager.createTimer(3600, 'look', 'Look Around');

  assert.equal(typeof id, 'number');
  assert.equal(manager.getAllTimers().length, 1);

  const [timer] = manager.getAllTimers();
  assert.equal(timer.name, 'Look Around');
  assert.equal(timer.command, 'look');
  assert.equal(timer.interval, 3600);

  assert.equal(settings.timers.activeTimers[0].command, 'look');
  const payload = savedPayloads.at(-1);
  assert.deepEqual(Object.keys(payload), ['activeTimers']);
  assert.equal(payload.activeTimers[0].command, 'look');

  manager.destroy();
});

test('startTimer()/stopTimer() toggle the running state and persist it', () => {
  const { manager, settings } = makeManager();
  const id = manager.createTimer(3600, 'who', 'Who');

  manager.startTimer(id, 3600, 'who');
  assert.equal(manager.getAllTimers()[0].isRunning, true);
  assert.equal(settings.timers.activeTimers[0].isActive, true);

  manager.stopTimer(id);
  assert.equal(manager.getAllTimers()[0].isRunning, false);
  assert.equal(settings.timers.activeTimers[0].isActive, false);

  manager.destroy();
});

test('deleteTimer() removes the timer from memory and settings', () => {
  const { manager, settings } = makeManager();
  const id = manager.createTimer(3600, 'inventory', 'Inv');

  manager.deleteTimer(id);

  assert.equal(manager.getAllTimers().length, 0);
  assert.equal(settings.timers.activeTimers.length, 0);

  manager.destroy();
});

test('init() restores previously active timers', () => {
  const settings = {
    timers: {
      activeTimers: [
        { id: 7, name: 'Restored', interval: 3600, command: 'score', isActive: true, createdAt: 1 },
        { id: 8, name: 'Paused', interval: 3600, command: 'look', isActive: false },
      ],
    },
  };

  const manager = new TimerManager();
  manager.init(settings);

  assert.equal(manager.getAllTimers().length, 2);
  const active = manager.getActiveTimers();
  assert.equal(active.length, 1);
  assert.equal(active[0].name, 'Restored');
  assert.equal(active[0].isActive, true);

  manager.destroy();
});
