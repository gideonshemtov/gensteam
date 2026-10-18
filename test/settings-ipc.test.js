require('./helpers/electron-stub');

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ipcHandlers } = require('./helpers/electron-stub');
const SettingsIPC = require('../settings/SettingsIPC');

// Registers the IPC handlers on the stubbed ipcMain.
new SettingsIPC({ get: () => ({}), getSchema: () => ({}), getSettingsPath: () => '' });

const getPartial = ipcHandlers.get('settings:getPartial');

test('returns the markup for a known section', () => {
  const expected = fs.readFileSync(
    path.join(__dirname, '..', 'settings', 'sections', 'ui.html'),
    'utf8',
  );
  assert.equal(getPartial(null, 'ui'), expected);
});

test('rejects names that could escape the sections directory', () => {
  for (const name of ['../package', 'a/b', 'a\\b', 'UI', 'ui.html', '', null, undefined, 42, 'foo;bar']) {
    assert.equal(getPartial(null, name), null, `expected ${JSON.stringify(name)} to be rejected`);
  }
});

test('returns null for an unknown but well-formed section', () => {
  assert.equal(getPartial(null, 'does-not-exist'), null);
});
