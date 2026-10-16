require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const SettingsWindow = require('../settings/SettingsWindow');
const MenuBuilder = require('../js/MenuBuilder');
const { electronStub } = require('./helpers/electron-stub');

function makeSettingsManager() {
  const settings = { ui: { showButtonPanel: true, hideMenuBar: false } };
  return {
    get: (path) => (path ? path.split('.').reduce((v, k) => v?.[k], settings) : settings),
  };
}

function findMenuItem(template, label) {
  for (const item of template) {
    if (item.label === label) return item;
    if (item.submenu) {
      const found = findMenuItem(item.submenu, label);
      if (found) return found;
    }
  }
  return null;
}

test('preferences opens as a modal child of the game window', () => {
  const settingsWindow = new SettingsWindow();
  const parent = { id: 'game-window' };

  const win = settingsWindow.create(parent);

  assert.equal(win.options.parent, parent);
  assert.equal(win.options.modal, true);
});

test('without a parent the window is not modal', () => {
  const settingsWindow = new SettingsWindow();
  const win = settingsWindow.create();

  assert.equal(win.options.parent, undefined);
  assert.equal(win.options.modal, false);
});

test('create() focuses the existing window instead of opening a second one', () => {
  const settingsWindow = new SettingsWindow();
  const parent = { id: 'game-window' };

  const first = settingsWindow.create(parent);
  const second = settingsWindow.create(parent);

  assert.equal(second, first);
});

test('dims the game window while preferences are open and restores it on close', () => {
  const settingsWindow = new SettingsWindow();
  const parent = new electronStub.BrowserWindow({});

  const child = settingsWindow.create(parent);

  assert.ok(
    parent.executedScripts.some((code) => code.includes('genesis-inactive-overlay')),
    'expected an inactive overlay to be injected into the game window',
  );

  child.emit('closed');

  assert.ok(
    parent.executedScripts.some((code) => code.includes('.remove()')),
    'expected the inactive overlay to be removed when preferences close',
  );
});

test('the Preferences menu item passes the game window to the settings window', () => {
  let createdWith = null;
  const settingsWindow = {
    isOpen: () => false,
    create: (parent) => { createdWith = parent; },
    window: { focus: () => {} },
  };

  const builder = new MenuBuilder(makeSettingsManager(), settingsWindow);
  const gameWindow = { id: 'game-window' };
  const template = builder.createMenu(gameWindow, null);

  findMenuItem(template, 'Preferences...').click();

  assert.equal(createdWith, gameWindow);
});

test('an already-open Preferences window is focused rather than recreated', () => {
  let focused = false;
  let created = false;
  const settingsWindow = {
    isOpen: () => true,
    create: () => { created = true; },
    window: { focus: () => { focused = true; } },
  };

  const builder = new MenuBuilder(makeSettingsManager(), settingsWindow);
  const template = builder.createMenu({ id: 'game-window' }, null);

  findMenuItem(template, 'Preferences...').click();

  assert.equal(focused, true);
  assert.equal(created, false);
});
