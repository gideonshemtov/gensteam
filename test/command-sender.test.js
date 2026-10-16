const test = require('node:test');
const assert = require('node:assert/strict');
const { muteConsole } = require('./helpers/test-utils');

// CommandSender runs in the game page; provide the globals it touches.
const restoreConsole = muteConsole();
test.after(() => restoreConsole());

function setupDom({ withInput = true } = {}) {
  const input = {
    value: '',
    dispatched: [],
    dispatchEvent(event) { this.dispatched.push(event); },
  };
  global.KeyboardEvent = class {
    constructor(type, init) { Object.assign(this, { type, ...init }); }
  };
  global.document = { getElementById: (id) => (id === 'input' && withInput ? input : null) };
  global.window = {};
  return { input };
}

test('sends via the MUD API when available', () => {
  const { input } = setupDom();
  const sent = [];
  global.window.mudAPI = { send: (command) => { sent.push(command); return true; } };

  const sendCommand = require('../js/CommandSender');
  const ok = sendCommand('look');

  assert.equal(ok, true);
  assert.deepEqual(sent, ['look']);
  assert.equal(input.dispatched.length, 0);
});

test('falls back to the input field when the API fails', () => {
  const { input } = setupDom();
  global.window.mudAPI = { send: () => false };

  const sendCommand = require('../js/CommandSender');
  const ok = sendCommand('who');

  assert.equal(ok, true);
  assert.equal(input.value, 'who');
  assert.equal(input.dispatched.length, 1);
  assert.equal(input.dispatched[0].key, 'Enter');
});

test('returns false when there is no input field and no API', () => {
  setupDom({ withInput: false });

  const sendCommand = require('../js/CommandSender');

  assert.equal(sendCommand('look'), false);
});

test('restores previous input when restoreInput is set', async () => {
  const { input } = setupDom();
  const sendCommand = require('../js/CommandSender');

  input.value = 'half typed';
  sendCommand('look', { restoreInput: true });
  assert.equal(input.value, 'look');

  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.equal(input.value, 'half typed');
});
