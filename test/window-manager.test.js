require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { WindowManager, GAME_URL, GAME_ORIGIN } = require('../js/WindowManager');
const { loadedUrls } = require('./helpers/electron-stub');

function makeSettingsManager() {
  let settings = {
    ui: { hideMenuBar: false, zoomLevel: 2 },
    window: { width: 1280, height: 800 },
    // Leftover value that must now be ignored in favour of the hardcoded URL.
    game: { startUrl: 'https://evil.example' },
    timers: { activeTimers: [] },
    buttons: { customButtons: [] },
  };

  return {
    get: (path) => (path ? path.split('.').reduce((value, key) => value?.[key], settings) : settings),
    set: (path, value) => {
      const keys = path.split('.');
      let current = settings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return value;
    },
    subscribe: () => () => {},
  };
}

test('the hardcoded URL targets the Genesis origin', () => {
  assert.equal(GAME_URL, 'https://www.genesismud.org/play');
  assert.equal(GAME_ORIGIN, 'https://www.genesismud.org');
});

test('create() loads the hardcoded game URL and ignores any configured one', () => {
  loadedUrls.length = 0;

  const manager = new WindowManager(makeSettingsManager(), { createMenu: () => ({}) }, null);
  manager.create();

  assert.deepEqual(loadedUrls, [GAME_URL]);
});

test('create() applies the saved zoom level', () => {
  const manager = new WindowManager(makeSettingsManager(), { createMenu: () => ({}) }, null);
  const win = manager.create();

  assert.deepEqual(win.webContents.zoomLevels, [2]);
});

test('zoom is re-applied once the page finishes loading', () => {
  const manager = new WindowManager(makeSettingsManager(), { createMenu: () => ({}) }, null);
  const win = manager.create();

  win.webContents.zoomLevels.length = 0;
  win.webContents.emit('did-finish-load');

  assert.deepEqual(win.webContents.zoomLevels, [2]);
});

test('ctrl + wheel zoom steps the level and persists it', () => {
  const settingsManager = makeSettingsManager();
  const manager = new WindowManager(settingsManager, { createMenu: () => ({}) }, null);
  const win = manager.create();

  win.webContents.emit('zoom-changed', {}, 'in');
  assert.equal(settingsManager.get('ui.zoomLevel'), 3);
  assert.equal(win.webContents.getZoomLevel(), 3);

  win.webContents.emit('zoom-changed', {}, 'out');
  // The immediate second event is inside the throttle window and is ignored.
  assert.equal(settingsManager.get('ui.zoomLevel'), 3);
});
