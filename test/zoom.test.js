require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');

const { electronStub } = require('./helpers/electron-stub');
const { findMenuItem, fakeSettings } = require('./helpers/test-utils');
const { clampZoom, zoomPercent, setZoom, stepZoom, ZOOM_STEP } = require('../js/ZoomController');
const MenuBuilder = require('../js/MenuBuilder');

const makeSettingsManager = (zoomLevel = 0) =>
  fakeSettings({ ui: { showButtonPanel: true, hideMenuBar: false, zoomLevel } });

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

test('the View menu zoom items adjust the level and notify on change', () => {
  const settingsManager = makeSettingsManager(0);
  let zoomChanges = 0;
  const builder = new MenuBuilder(
    settingsManager,
    { isOpen: () => false, create: () => {}, window: { focus: () => {} } },
    () => { zoomChanges += 1; },
  );
  const win = new electronStub.BrowserWindow({});
  const template = builder.createMenu(win, null);

  const view = template.find((item) => item.label === 'View');
  assert.ok(view, 'expected a top-level View menu');
  assert.ok(findMenuItem(view.submenu, 'Zoom In'), 'expected zoom items in the View menu');

  findMenuItem(template, 'Zoom In').click();
  assert.equal(settingsManager.get('ui.zoomLevel'), ZOOM_STEP);
  assert.equal(zoomPercent(settingsManager.get('ui.zoomLevel')), 110);
  assert.equal(zoomChanges, 1);

  findMenuItem(template, 'Zoom Out').click();
  assert.equal(settingsManager.get('ui.zoomLevel'), 0);
  assert.equal(zoomChanges, 2);
});
