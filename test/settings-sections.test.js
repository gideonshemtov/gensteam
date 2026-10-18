const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sectionsDir = path.resolve(__dirname, '..', 'settings', 'sections');

// Load order matches the <script> tags in settings.html; it also defines the
// sidebar order.
const files = ['registry', 'ui', 'buttons', 'hotkeys', 'sounds', 'window', 'json'];

// Section files only touch `window` at load time (their DOM work lives inside
// setup/populate), so a minimal sandbox can load them without a real DOM.
function loadRegistry() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const name of files) {
    const file = path.join(sectionsDir, `${name}.js`);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  return sandbox.window.GenesisSettings;
}

test('every section registers a complete definition in sidebar order', () => {
  const registry = loadRegistry();

  assert.deepEqual(
    Array.from(registry.sections, (section) => section.id),
    ['ui', 'buttons', 'hotkeys', 'sounds', 'window', 'json'],
  );

  for (const section of registry.sections) {
    assert.equal(typeof section.title, 'string', `${section.id} is missing a title`);
    assert.equal(typeof section.icon, 'string', `${section.id} is missing an icon`);
    assert.equal(typeof section.template, 'string', `${section.id} is missing a template`);
    assert.ok(section.template.trim().length > 0, `${section.id} has an empty template`);
  }
});

test('the JSON section is the only one with a custom container class', () => {
  const registry = loadRegistry();
  const json = registry.sections.find((section) => section.id === 'json');
  assert.equal(json.containerClass, 'json-editor-container');

  const others = registry.sections.filter((section) => section.id !== 'json');
  assert.ok(others.every((section) => section.containerClass === undefined));
});

test('sections expose the lifecycle hooks their content needs', () => {
  const registry = loadRegistry();
  const byId = Object.fromEntries(registry.sections.map((section) => [section.id, section]));

  assert.equal(typeof byId.buttons.populate, 'function');
  assert.equal(typeof byId.buttons.setup, 'function');
  assert.equal(typeof byId.hotkeys.populate, 'function');
  assert.equal(typeof byId.hotkeys.beforeSave, 'function');
  assert.equal(typeof byId.sounds.populate, 'function');
  assert.equal(typeof byId.sounds.setup, 'function');
  assert.equal(typeof byId.json.setup, 'function');
});

test('data-path inputs cover the editable settings', () => {
  const registry = loadRegistry();
  const paths = registry.sections
    .map((section) => section.template)
    .join('\n')
    .match(/data-path="([^"]+)"/g)
    .map((match) => match.slice('data-path="'.length, -1));

  for (const path of [
    'ui.showButtonPanel',
    'ui.buttonPanelWidth',
    'ui.hideMenuBar',
    'buttons.showTooltips',
    'hotkeys.enabled',
    'sounds.enabled',
    'sounds.masterVolume',
    'window.width',
    'window.height',
  ]) {
    assert.ok(paths.includes(path), `no input is bound to ${path}`);
  }
});
