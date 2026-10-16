require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { electronStub } = require('./helpers/electron-stub');
const { clampZoom, zoomPercent, setZoom, stepZoom, ZOOM_STEP } = require('../js/ZoomController');
const MenuBuilder = require('../js/MenuBuilder');

function makeSettingsManager(zoomLevel = 0) {
  let settings = { ui: { showButtonPanel: true, hideMenuBar: false, zoomLevel } };
  return {
    get: (path) => (path ? path.split('.').reduce((value, key) => value?.[key], settings) : settings),
    set: (path, value) => {
      const keys = path.split('.');
      let current = settings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return value;
    },
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

test('clampZoom keeps the level within bounds', () => {
  assert.equal(clampZoom(0), 0);
  assert.equal(clampZoom(10), 5);
  assert.equal(clampZoom(-10), -5);
});

test('zoomPercent converts levels to percentages', () => {
  assert.equal(zoomPercent(0), 100);
  assert.equal(zoomPercent(1), 120);
  assert.equal(zoomPercent(-1), 83);
});

test('setZoom applies the level to the window and persists it', () => {
  const settingsManager = makeSettingsManager(0);
  const win = new electronStub.BrowserWindow({});

  const level = setZoom(settingsManager, win, 3);

  assert.equal(level, 3);
  assert.deepEqual(win.webContents.zoomLevels, [3]);
  assert.equal(settingsManager.get('ui.zoomLevel'), 3);
});

test('stepZoom moves from the saved level and clamps at the limits', () => {
  const settingsManager = makeSettingsManager(4);
  const win = new electronStub.BrowserWindow({});

  assert.equal(stepZoom(settingsManager, win, ZOOM_STEP), 4.5);
  assert.equal(stepZoom(settingsManager, win, ZOOM_STEP), 5);
  assert.equal(stepZoom(settingsManager, win, ZOOM_STEP), 5); // clamped
  assert.equal(stepZoom(settingsManager, win, -ZOOM_STEP), 4.5);
});

test('the Zoom menu adjusts the level and notifies on change', () => {
  const settingsManager = makeSettingsManager(0);
  let zoomChanges = 0;
  const builder = new MenuBuilder(
    settingsManager,
    { isOpen: () => false, create: () => {}, window: { focus: () => {} } },
    () => { zoomChanges += 1; },
  );
  const win = new electronStub.BrowserWindow({});
  const template = builder.createMenu(win, null);

  assert.ok(template.some((item) => item.label === 'Zoom'), 'expected a top-level Zoom menu');

  findMenuItem(template, 'Zoom In').click();
  assert.equal(settingsManager.get('ui.zoomLevel'), ZOOM_STEP);
  assert.equal(zoomPercent(settingsManager.get('ui.zoomLevel')), 110);
  assert.equal(zoomChanges, 1);

  findMenuItem(template, 'Zoom Out').click();
  assert.equal(settingsManager.get('ui.zoomLevel'), 0);
  assert.equal(zoomChanges, 2);
});
