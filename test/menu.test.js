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

const isMac = process.platform === 'darwin';
// macOS uses its application menu (About/Preferences/Quit) where other
// platforms use a File menu.
const primaryMenuLabel = isMac ? 'GenesisClient' : 'File';

const template = buildTemplate();
const labels = template.map((item) => item.label);

test('the menu bar is ordered File, Edit, View, Window, Help', () => {
  const expected = isMac
    ? ['GenesisClient', 'Edit', 'View', 'Window', 'Help']
    : ['File', 'Edit', 'View', 'Window', 'Help'];
  assert.deepEqual(labels, expected);
});

test('the primary menu holds Preferences and a Quit/Exit item', () => {
  const primary = findMenuItem(template, primaryMenuLabel);
  assert.ok(primary, `expected a ${primaryMenuLabel} menu`);

  assert.ok(
    findMenuItem(primary.submenu, 'Preferences...'),
    `${primaryMenuLabel} should contain Preferences`,
  );

  const quit = primary.submenu.find((item) => item.role === 'quit');
  assert.ok(quit, `${primaryMenuLabel} should contain a quit item`);
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
