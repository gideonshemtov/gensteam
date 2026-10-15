require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { WindowManager, GAME_URL, GAME_ORIGIN } = require('../js/WindowManager');
const { loadedUrls } = require('./helpers/electron-stub');

function makeSettingsManager() {
  return {
    get: () => ({
      ui: { hideMenuBar: false },
      window: { width: 1280, height: 800 },
      // Leftover value that must now be ignored in favour of the hardcoded URL.
      game: { startUrl: 'https://evil.example' },
      timers: { activeTimers: [] },
      buttons: { customButtons: [] },
    }),
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
