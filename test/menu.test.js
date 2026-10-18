require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { electronStub } = require('./helpers/electron-stub');
const { findMenuItem, fakeSettings } = require('./helpers/test-utils');
const MenuBuilder = require('../js/MenuBuilder');

function buildTemplate() {
  const settingsManager = fakeSettings({ ui: { showButtonPanel: true, hideMenuBar: false, zoomLevel: 0 } });
  const settingsWindow = { isOpen: () => false, create: () => {}, window: { focus: () => {} } };
  const builder = new MenuBuilder(settingsManager, settingsWindow, () => {});
  return builder.createMenu(new electronStub.BrowserWindow({}), null);
}

// Tests run on Linux, i.e. the non-macOS branch (File menu instead of the app menu).
const template = buildTemplate();
const labels = template.map((item) => item.label);

test('the menu bar is ordered File, Edit, View, Window, Help', () => {
  assert.deepEqual(labels, ['File', 'Edit', 'View', 'Window', 'Help']);
});

test('File holds Preferences and a Quit/Exit item', () => {
  const file = findMenuItem(template, 'File');
  assert.ok(file, 'expected a File menu');

  assert.ok(findMenuItem(file.submenu, 'Preferences...'), 'File should contain Preferences');

  const quit = file.submenu.find((item) => item.role === 'quit');
  assert.ok(quit, 'File should contain a quit item');
  assert.equal(typeof quit.click === 'function' || quit.role === 'quit', true);
});

test('View only contains view-related items', () => {
  const view = findMenuItem(template, 'View');
  assert.ok(view, 'expected a View menu');

  for (const label of [
    'Reload',
    'Toggle Developer Tools',
    'Zoom In',
    'Zoom Out',
    'Reset Zoom',
    'Find...',
    'Show Button Panel',
    'Hide Menu Bar (Press Alt to show)',
  ]) {
    assert.ok(findMenuItem(view.submenu, label), `View should contain ${label}`);
  }

  assert.equal(findMenuItem(view.submenu, 'Preferences...'), null, 'Preferences belongs in File, not View');
});

test('Edit provides the standard clipboard roles', () => {
  const edit = findMenuItem(template, 'Edit');
  const roles = edit.submenu.map((item) => item.role).filter(Boolean);

  for (const role of ['undo', 'redo', 'cut', 'copy', 'paste', 'selectAll']) {
    assert.ok(roles.includes(role), `Edit should provide the ${role} role`);
  }
});

test('Help contains About', () => {
  const help = findMenuItem(template, 'Help');
  assert.ok(findMenuItem(help.submenu, 'About'), 'Help should contain About');
});
