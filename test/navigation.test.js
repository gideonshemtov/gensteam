require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { WindowManager, openExternalSafely, GAME_ORIGIN } = require('../js/WindowManager');
const { openExternalCalls } = require('./helpers/electron-stub');

test.beforeEach(() => {
  openExternalCalls.length = 0;
});

// Capture the handlers registered by setupNavigationHandlers on a fake window.
function createNavigationHarness() {
  const handlers = {};
  const win = {
    webContents: {
      on: (event, callback) => {
        handlers[event] = callback;
      },
      setWindowOpenHandler: (callback) => {
        handlers.windowOpen = callback;
      },
    },
  };

  const manager = new WindowManager({}, {}, null);
  manager.win = win;
  manager.setupNavigationHandlers({});

  return handlers;
}

const handlers = createNavigationHarness();

function navigate(url) {
  let prevented = false;
  handlers['will-navigate']({ preventDefault: () => { prevented = true; } }, url);
  return prevented;
}

test('allows navigation within the game origin', () => {
  assert.equal(navigate(`${GAME_ORIGIN}/some/path`), false);
  assert.deepEqual(openExternalCalls, []);
});

test('blocks look-alike domains such as genesismud.org.attacker.example', () => {
  assert.equal(navigate('https://www.genesismud.org.attacker.example/'), true);
});

test('blocks other origins and hands safe ones to the browser', () => {
  assert.equal(navigate('https://evil.example/'), true);
  assert.deepEqual(openExternalCalls, ['https://evil.example/']);
});

test('blocked navigations with unsafe schemes never reach the OS', () => {
  assert.equal(navigate('file:///etc/passwd'), true);
  assert.deepEqual(openExternalCalls, []);
});

test('malformed URLs are blocked', () => {
  assert.equal(navigate('not a url'), true);
});

test('window.open is denied and safe links open externally', () => {
  const result = handlers.windowOpen({ url: 'https://example.com/' });
  assert.deepEqual(result, { action: 'deny' });
  assert.deepEqual(openExternalCalls, ['https://example.com/']);
});

test('window.open with an unsafe scheme is denied without hitting the OS', () => {
  handlers.windowOpen({ url: 'smb://attacker/share' });
  assert.deepEqual(openExternalCalls, []);
});

test('openExternalSafely allows only http, https, and mailto', () => {
  for (const url of ['https://a.example', 'http://a.example', 'mailto:a@b.example']) {
    openExternalSafely(url);
  }
  assert.equal(openExternalCalls.length, 3);

  openExternalCalls.length = 0;
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'smb://x/y', 'tel:123', 'not a url']) {
    openExternalSafely(url);
  }
  assert.deepEqual(openExternalCalls, []);
});
