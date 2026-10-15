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
