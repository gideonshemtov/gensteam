require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { electronStub } = require('./helpers/electron-stub');
const SettingsManager = require('../settings/SettingsManager');

const tempDirs = [];

const originalLog = console.log;
test.before(() => { console.log = () => {}; });
test.after(() => { console.log = originalLog; });

function makeManager() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gensteam-settings-'));
  tempDirs.push(dir);
  electronStub.app.getPath = () => dir;
  return { sm: new SettingsManager(), dir };
}

test.after(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('loads defaults when no settings file exists', () => {
  const { sm } = makeManager();
  const settings = sm.get();

  assert.equal(settings.ui.showButtonPanel, true);
  assert.equal(settings.ui.buttonPanelWidth, 50);
  assert.equal(settings.window.width, 1280);
  assert.deepEqual(settings.timers.activeTimers, []);
  assert.equal(settings.sounds.enabled, true);
  assert.ok(!('game' in settings), 'game settings should be gone');
});

test('the schema no longer exposes a game section', () => {
  const { sm } = makeManager();
  assert.ok(!('game' in sm.getSchema().properties));
});

test('set() writes nested values and reloads them from disk', () => {
  const { sm, dir } = makeManager();

  sm.set('ui.showButtonPanel', false);
  sm.set('window.width', 1920);

  // A fresh manager pointed at the same directory should see the saved values.
  electronStub.app.getPath = () => dir;
  const reloaded = new SettingsManager();
  assert.equal(reloaded.get('ui.showButtonPanel'), false);
  assert.equal(reloaded.get('window.width'), 1920);
});

test('set() notifies subscribers with the new settings', () => {
  const { sm } = makeManager();

  let received = null;
  sm.subscribe((next) => { received = next; });
  sm.set('ui.buttonPanelWidth', 80);

  assert.ok(received);
  assert.equal(received.ui.buttonPanelWidth, 80);
});

test('resetSection() restores defaults for that section only', () => {
  const { sm } = makeManager();

  sm.set('ui.showButtonPanel', false);
  sm.set('ui.buttonPanelWidth', 90);
  sm.set('window.width', 1600);

  sm.resetSection('ui');

  assert.equal(sm.get('ui.showButtonPanel'), true);
  assert.equal(sm.get('ui.buttonPanelWidth'), 50);
  assert.equal(sm.get('window.width'), 1600);
});

test('migrates legacy settings that still contain game.startUrl', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gensteam-settings-'));
  tempDirs.push(dir);
  electronStub.app.getPath = () => dir;

  fs.writeFileSync(
    path.join(dir, 'settings.json'),
    JSON.stringify({ game: { startUrl: 'https://evil.example' }, ui: { showButtonPanel: false } }),
  );

  const sm = new SettingsManager();
  const settings = sm.get();

  assert.ok(!('game' in settings), 'legacy game section should be dropped');
  assert.equal(settings.ui.showButtonPanel, false, 'other settings should be preserved');
});

test('export/import round-trips the settings', () => {
  const { sm } = makeManager();

  const exported = JSON.parse(sm.exportSettings());
  exported.ui.showButtonPanel = false;
  exported.ui.buttonPanelWidth = 70;

  sm.importSettings(JSON.stringify(exported));

  assert.equal(sm.get('ui.showButtonPanel'), false);
  assert.equal(sm.get('ui.buttonPanelWidth'), 70);
});
