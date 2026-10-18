const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'settings', 'settings.html'), 'utf8');
const sectionsDir = path.join(repo, 'settings', 'sections');

function readSection(name) {
  return fs.readFileSync(path.join(sectionsDir, `${name}.js`), 'utf8');
}

// Every file that renders the preferences UI: the shell plus one file per section.
const rendererSources = [
  fs.readFileSync(path.join(repo, 'settings', 'settings-renderer.js'), 'utf8'),
  ...fs.readdirSync(sectionsDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => fs.readFileSync(path.join(sectionsDir, file), 'utf8')),
];

function readPartial(name) {
  return fs.readFileSync(path.join(sectionsDir, `${name}.html`), 'utf8');
}

test('settings renderers never build HTML from settings values', () => {
  for (const source of rendererSources) {
    for (const sink of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write']) {
      assert.equal(source.includes(sink), false, `a settings renderer should not use ${sink}`);
    }
  }
});

test('settings renderers render dynamic values as text', () => {
  const combined = rendererSources.join('\n');
  assert.ok(combined.includes('textContent'), 'expected textContent-based rendering');
  assert.ok(combined.includes('addEventListener'), 'expected listener-based interaction');
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

test('the shell loads section registry and every section file', () => {
  assert.ok(html.includes('src="sections/registry.js"'), 'settings.html should load the section registry');
  for (const id of ['ui', 'buttons', 'hotkeys', 'sounds', 'window', 'json']) {
    assert.ok(html.includes(`src="sections/${id}.js"`), `settings.html should load the ${id} section`);
  }
});

test('section markup is read by the main process, not inlined in the renderer', () => {
  const shell = fs.readFileSync(path.join(repo, 'settings', 'settings-renderer.js'), 'utf8');
  const preload = fs.readFileSync(path.join(repo, 'settings', 'settings-preload.js'), 'utf8');
  const ipc = fs.readFileSync(path.join(repo, 'settings', 'SettingsIPC.js'), 'utf8');

  assert.ok(shell.includes('getPartial'), 'the shell should request partials through the preload API');
  assert.ok(preload.includes('settings:getPartial'), 'the preload should expose the partial reader');
  assert.ok(ipc.includes("'settings:getPartial'"), 'the main process should serve section partials');
});

test('custom buttons can be configured from the UI', () => {
  const buttons = readPartial('buttons');
  assert.ok(buttons.includes('id="addButtonBtn"'), 'buttons partial is missing the Add Button control');
  assert.ok(readSection('buttons').includes('addButtonBtn'), 'buttons section is missing its add handler');
  assert.equal(html.includes('edit in JSON mode'), false, 'button editing should not require JSON mode');
});

test('hotkeys can be configured from the UI', () => {
  const hotkeys = readPartial('hotkeys');
  assert.ok(hotkeys.includes('id="addHotkeyBtn"'), 'hotkeys partial is missing the Add Hotkey control');
  assert.ok(hotkeys.includes('data-path="hotkeys.enabled"'), 'hotkeys partial is missing the enable toggle');
  assert.ok(readSection('hotkeys').includes('recordHotkey'), 'hotkeys section is missing recordHotkey()');
});
