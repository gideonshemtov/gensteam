const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parseEnv, renderTemplate, detectExecutables, resolveConfig } = require('../steam/upload');
const { tempDir } = require('./helpers/test-utils');

test('parseEnv reads key/value pairs and ignores comments/blanks', () => {
  const env = parseEnv(`
    # a comment
    STEAM_APP_ID=1234560
    STEAM_DEPOT_ID="1234561"

    STEAM_SETLIVE='beta'
    MALFORMED
  `);

  assert.equal(env.STEAM_APP_ID, '1234560');
  assert.equal(env.STEAM_DEPOT_ID, '1234561');
  assert.equal(env.STEAM_SETLIVE, 'beta');
  assert.equal('MALFORMED' in env, false);
});

test('renderTemplate replaces every occurrence of each token', () => {
  const rendered = renderTemplate('a __X__ b __X__ c __Y__', { __X__: '1', __Y__: '2' });
  assert.equal(rendered, 'a 1 b 1 c 2');
});

test('detectExecutables finds the game binary but not Chromium helpers', (t) => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, 'GenesisClient'), 'x', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'chrome-sandbox'), 'x', { mode: 0o4755 });
  fs.writeFileSync(path.join(dir, 'chrome_crashpad_handler'), 'x', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'libEGL.so'), 'x', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'resources'), 'x', { mode: 0o644 });

  assert.deepEqual(detectExecutables(dir), ['GenesisClient']);
});

test('detectExecutables finds the .exe on windows', (t) => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, 'GenesisClient.exe'), 'x');
  fs.writeFileSync(path.join(dir, 'chrome_crashpad_handler.exe'), 'x');
  fs.writeFileSync(path.join(dir, 'ffmpeg.dll'), 'x');

  assert.deepEqual(detectExecutables(dir, 'windows'), ['GenesisClient.exe']);
});

test('resolveConfig picks the platform-specific depot and source', () => {
  const config = resolveConfig({
    STEAM_APP_ID: '4022530',
    STEAM_DEPOT_ID_LINUX: '4022533',
    STEAM_DEPOT_ID_WINDOWS: '4022537',
    STEAM_PLATFORM: 'windows',
  });

  assert.equal(config.platform, 'windows');
  assert.equal(config.depotId, '4022537');
  assert.ok(config.sourceDir.endsWith(path.join('dist', 'win-unpacked')));
});

test('resolveConfig defaults to linux and falls back to STEAM_DEPOT_ID', () => {
  const config = resolveConfig({ STEAM_APP_ID: '1', STEAM_DEPOT_ID: '2' });

  assert.equal(config.platform, 'linux');
  assert.equal(config.depotId, '2');
  assert.ok(config.sourceDir.endsWith(path.join('dist', 'linux-unpacked')));
});

test('the VDF templates contain the expected placeholders', () => {
  const appTemplate = fs.readFileSync(path.join(__dirname, '..', 'steam', 'app_build.vdf.template'), 'utf8');
  const depotTemplate = fs.readFileSync(path.join(__dirname, '..', 'steam', 'depot_build.vdf.template'), 'utf8');

  for (const token of ['__APP_ID__', '__DEPOT_ID__', '__CONTENT_ROOT__', '__BUILD_OUTPUT__', '__SETLIVE__', '__DEPOT_VDF__']) {
    assert.ok(appTemplate.includes(token), `app template is missing ${token}`);
  }
  assert.ok(depotTemplate.includes('__DEPOT_ID__'));
  assert.ok(depotTemplate.includes('__CONTENT_ROOT__'));
});
