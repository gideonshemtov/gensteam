const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const rendererSource = fs.readFileSync(path.join(repo, 'settings', 'settings-renderer.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'settings', 'settings.html'), 'utf8');

test('settings renderer never builds HTML from settings values', () => {
  for (const sink of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write']) {
    assert.equal(rendererSource.includes(sink), false, `settings-renderer.js should not use ${sink}`);
  }
});

test('settings renderer renders dynamic values as text', () => {
  assert.ok(rendererSource.includes('textContent'), 'expected textContent-based rendering');
  assert.ok(rendererSource.includes('addEventListener'), 'expected listener-based interaction');
});

test('settings page ships a CSP that forbids inline scripts', () => {
  const match = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
  assert.ok(match, 'settings.html is missing a Content-Security-Policy meta tag');

  const directives = match[1].split(';').map((part) => part.trim());
  const scriptSrc = directives.find((directive) => directive.startsWith('script-src'));
  assert.ok(scriptSrc, 'CSP is missing a script-src directive');
  assert.equal(scriptSrc.includes("'unsafe-inline'"), false, 'script-src must not allow inline scripts');
  assert.equal(scriptSrc.includes("'unsafe-eval'"), false, 'script-src must not allow eval');
});

test('custom buttons can be configured from the UI', () => {
  assert.ok(html.includes('id="addButtonBtn"'), 'settings.html is missing the Add Button control');
  assert.equal(html.includes('edit in JSON mode'), false, 'button editing should not require JSON mode');
  assert.ok(rendererSource.includes('addCustomButton'), 'renderer is missing addCustomButton()');
  assert.ok(rendererSource.includes('removeCustomButton'), 'renderer is missing removeCustomButton()');
});

test('hotkeys can be configured from the UI', () => {
  assert.ok(html.includes('id="addHotkeyBtn"'), 'settings.html is missing the Add Hotkey control');
  assert.ok(html.includes('data-path="hotkeys.enabled"'), 'settings.html is missing the hotkey enable toggle');
  assert.ok(rendererSource.includes('addHotkey'), 'renderer is missing addHotkey()');
  assert.ok(rendererSource.includes('recordHotkey'), 'renderer is missing recordHotkey()');
});
