const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatHotkey,
  normalizeHotkey,
  isSafeHotkey,
  matchesHotkey,
} = require('../js/hotkeyKeys');

test('formatHotkey builds a canonical string from a keydown descriptor', () => {
  assert.equal(formatHotkey({ key: 'F1' }), 'F1');
  assert.equal(formatHotkey({ key: 'k', control: true }), 'Ctrl+K');
  assert.equal(formatHotkey({ key: 'K', control: true, shift: true }), 'Ctrl+Shift+K');
  assert.equal(formatHotkey({ key: '1', meta: true }), 'Cmd+1');
  assert.equal(formatHotkey({ key: ' ', control: true }), 'Ctrl+Space');
  assert.equal(formatHotkey({ key: 'ArrowUp' }), 'Up');
  assert.equal(formatHotkey({ key: 'Escape' }), 'Escape');
});

test('formatHotkey rejects modifier-only and unnameable keys', () => {
  assert.equal(formatHotkey({ key: 'Control', control: true }), null);
  assert.equal(formatHotkey({ key: 'Shift', shift: true }), null);
  assert.equal(formatHotkey({ key: 'CapsLock' }), null);
  assert.equal(formatHotkey({ key: 'Dead' }), null);
  assert.equal(formatHotkey({}), null);
  assert.equal(formatHotkey(null), null);
});

test('normalizeHotkey resolves aliases and orders modifiers', () => {
  assert.equal(normalizeHotkey('control+shift+k'), 'Ctrl+Shift+K');
  assert.equal(normalizeHotkey('Shift+Ctrl+K'), 'Ctrl+Shift+K');
  assert.equal(normalizeHotkey('CmdOrCtrl+A', 'linux'), 'Ctrl+A');
  assert.equal(normalizeHotkey('CmdOrCtrl+A', 'darwin'), 'Cmd+A');
  assert.equal(normalizeHotkey('CommandOrControl+A', 'darwin'), 'Cmd+A');
  assert.equal(normalizeHotkey('f5'), 'F5');
  assert.equal(normalizeHotkey('bogus'), null);
  assert.equal(normalizeHotkey('Ctrl+'), null);
});

test('isSafeHotkey requires a non-shift modifier or a bare function/navigation key', () => {
  assert.equal(isSafeHotkey('Ctrl+1'), true);
  assert.equal(isSafeHotkey('Cmd+K'), true);
  assert.equal(isSafeHotkey('Alt+X'), true);
  assert.equal(isSafeHotkey('F1'), true);
  assert.equal(isSafeHotkey('Escape'), true);
  assert.equal(isSafeHotkey('Up'), true);

  // These would swallow ordinary typing.
  assert.equal(isSafeHotkey('L'), false);
  assert.equal(isSafeHotkey('Shift+L'), false);
  assert.equal(isSafeHotkey('Enter'), false);
  assert.equal(isSafeHotkey('Tab'), false);
  assert.equal(isSafeHotkey('/'), false);
});

test('matchesHotkey compares a stored hotkey against a keydown descriptor', () => {
  const ctrlK = { key: 'k', control: true };
  const ctrlShiftK = { key: 'K', control: true, shift: true };

  assert.equal(matchesHotkey('Ctrl+K', ctrlK), true);
  assert.equal(matchesHotkey('control+k', ctrlK), true);
  assert.equal(matchesHotkey('Ctrl+K', ctrlShiftK), false);
  assert.equal(matchesHotkey('Ctrl+Shift+K', ctrlShiftK), true);
  assert.equal(matchesHotkey('F1', { key: 'F1' }), true);
  assert.equal(matchesHotkey('F1', { key: 'F2' }), false);
  assert.equal(matchesHotkey('nonsense', ctrlK), false);
});
