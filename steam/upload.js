#!/usr/bin/env node
// steam/upload.js
// Prepare a Steam depot from the unpacked electron-builder output (Linux,
// Windows, or macOS) and upload it to Steam with SteamPipe. Configuration is
// read from .env.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const STEAM_DIR = __dirname;
const CONTENT_DIR = path.join(STEAM_DIR, 'content');
const BUILD_DIR = path.join(STEAM_DIR, 'build');
const OUTPUT_DIR = path.join(STEAM_DIR, 'output');

function parseEnv(text) {
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadEnv(envPath = path.join(REPO_ROOT, '.env')) {
  if (!fs.existsSync(envPath)) {
    fail('Missing .env file. Copy .env.example to .env and set STEAM_APP_ID and STEAM_DEPOT_ID.');
  }
  return parseEnv(fs.readFileSync(envPath, 'utf8'));
}

function renderTemplate(templateText, replacements) {
  let text = templateText;
  for (const [token, value] of Object.entries(replacements)) {
    text = text.split(token).join(value);
  }
  return text;
}

// Files at the content root that are executables but not the game binary.
const NON_GAME_EXECUTABLES = new Set([
  'chrome-sandbox',
  'chrome_crashpad_handler',
  'chrome_crashpad_handler.exe',
]);

// Default electron-builder output directory per platform. The first existing
// candidate wins; the macOS directory depends on the built architecture.
const PLATFORM_SOURCE = {
  linux: ['dist/linux-unpacked'],
  windows: ['dist/win-unpacked'],
  mac: ['dist/mac-universal', 'dist/mac-arm64', 'dist/mac'],
};

// npm script that produces the unpacked build for each platform.
const PLATFORM_BUILD_SCRIPT = {
  linux: 'dist:linux:dir',
  windows: 'dist:win:dir',
  mac: 'dist:mac:dir',
};

function isExecutable(filePath) {
  try {
    return (fs.statSync(filePath).mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

// macOS builds ship a single .app bundle. Steam must be pointed at the bundle
// itself in the launch option: pointing at the inner binary
// (GenesisClient.app/Contents/MacOS/GenesisClient) makes Steam launch it in its
// x86_64/Rosetta context on Apple Silicon, which crashes Electron apps.
// Returns the bundle name relative to the content root, e.g. "GenesisClient.app".
function detectMacExecutables(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.endsWith('.app'))
    .filter((entry) => fs.existsSync(path.join(dir, entry.name, 'Contents', 'MacOS')))
    .map((entry) => entry.name);
}

// The game binary at the root of the build, excluding Chromium helpers/libraries.
function detectExecutables(dir, platform = 'linux') {
  if (platform === 'mac') {
    return detectMacExecutables(dir);
  }

  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !NON_GAME_EXECUTABLES.has(name));

  if (platform === 'windows') {
    return files.filter((name) => name.toLowerCase().endsWith('.exe'));
  }

  return files
    .filter((name) => !name.includes('.'))
    .filter((name) => isExecutable(path.join(dir, name)));
}

// steamcmd caches the login (sentry + config.vdf) under
// $HOME/Library/Application Support/Steam on macOS (and $HOME/.steam on Linux).
// When that is the Steam client's directory the running client clobbers the
// cache, so the password / Steam Guard are requested on every upload. Run
// steamcmd with its own HOME so the cache persists. Override with STEAMCMD_HOME.
function resolveSteamcmdHome(env) {
  const configured = (env.STEAMCMD_HOME || '').trim();
  return configured ? path.resolve(REPO_ROOT, configured) : path.join(os.homedir(), '.genesis-steamcmd');
}

// Resolve the build directory for a platform, honoring STEAM_CONTENT_SOURCE.
function resolveSourceDir(env, platform) {
  if (env.STEAM_CONTENT_SOURCE) {
    return path.resolve(REPO_ROOT, env.STEAM_CONTENT_SOURCE);
  }
  const candidates = PLATFORM_SOURCE[platform].map((dir) => path.resolve(REPO_ROOT, dir));
  return candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
}

// Resolve the platform-specific config from .env.
function resolveConfig(env) {
  const platform = (env.STEAM_PLATFORM || 'linux').trim().toLowerCase();
  if (!PLATFORM_SOURCE[platform]) {
    fail(`Unknown STEAM_PLATFORM "${platform}" (expected one of: ${Object.keys(PLATFORM_SOURCE).join(', ')}).`);
  }

  const appId = (env.STEAM_APP_ID || '').trim();
  if (!appId) fail('STEAM_APP_ID is not set in .env');

  const depotId = (env[`STEAM_DEPOT_ID_${platform.toUpperCase()}`] || env.STEAM_DEPOT_ID || '').trim();
  if (!depotId) {
    fail(`STEAM_DEPOT_ID (or STEAM_DEPOT_ID_${platform.toUpperCase()}) is not set in .env`);
  }

  return {
    platform,
    appId,
    depotId,
    sourceDir: resolveSourceDir(env, platform),
  };
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  // verbatimSymlinks keeps symlinks verbatim. Without it Node rewrites them to
  // the resolved absolute path, so a macOS .app's relative framework symlinks
  // (e.g. .../Electron Framework.framework/Versions/Current -> A) end up
  // pointing at the build machine and the app fails on every other machine.
  fs.cpSync(src, dest, { recursive: true, verbatimSymlinks: true });
}

function fail(message) {
  console.error(`\n\u2716 ${message}\n`);
  process.exit(1);
}

// Log in to Steam (and quit) without uploading, to seed/verify the cached login.
function login(env) {
  const steamcmd = env.STEAMCMD || 'steamcmd';
  const steamcmdHome = resolveSteamcmdHome(env);
  fs.mkdirSync(steamcmdHome, { recursive: true });

  const loginArgs = env.STEAM_USERNAME ? ['+login', env.STEAM_USERNAME] : ['+login'];
  const args = [...loginArgs, '+quit'];

  console.log(`SteamCMD HOME  : ${steamcmdHome}`);
  console.log(`Running: ${steamcmd} ${args.join(' ')}\n`);
  const result = spawnSync(steamcmd, args, {
    stdio: 'inherit',
    env: { ...process.env, HOME: steamcmdHome },
  });

  if (result.error) {
    fail(`Could not run "${steamcmd}". Install SteamCMD or set STEAMCMD in .env.\n${result.error.message}`);
  }
  process.exit(result.status || 0);
}

function main() {
  const env = loadEnv();

  // Allow `node steam/upload.js --platform=mac` to override STEAM_PLATFORM.
  const platformFlag = process.argv.find((arg) => arg.startsWith('--platform='));
  if (platformFlag) {
    env.STEAM_PLATFORM = platformFlag.slice('--platform='.length);
  }

  // Login-only mode: seed/verify the cached login without preparing or uploading.
  if (process.argv.includes('--login')) {
    login(env);
    return;
  }

  const { platform, appId, depotId, sourceDir } = resolveConfig(env);

  if (!fs.existsSync(sourceDir) || fs.readdirSync(sourceDir).length === 0) {
    fail(`${platform} build not found at ${sourceDir}.\nRun "pnpm run ${PLATFORM_BUILD_SCRIPT[platform]}" first.`);
  }

  console.log(`Platform       : ${platform}`);
  console.log(`Content source : ${sourceDir}`);
  console.log('Preparing depot content...');
  copyDir(sourceDir, CONTENT_DIR);

  const executables = detectExecutables(CONTENT_DIR, platform);
  if (executables.length) {
    console.log(`Steam launch option: ${executables.join(', ')}`);
  } else {
    console.warn('Warning: no launch executable detected in the content root.');
  }

  fs.mkdirSync(BUILD_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const replacements = {
    __APP_ID__: appId,
    __DEPOT_ID__: depotId,
    __CONTENT_ROOT__: CONTENT_DIR.replace(/\\/g, '/'),
    __BUILD_OUTPUT__: OUTPUT_DIR.replace(/\\/g, '/'),
    __DESC__: env.STEAM_BUILD_DESC || `GenesisClient ${platform} ${new Date().toISOString().slice(0, 10)}`,
    __SETLIVE__: env.STEAM_SETLIVE || '',
    __DEPOT_VDF__: `depot_build_${depotId}.vdf`,
  };

  const depotTemplate = fs.readFileSync(path.join(STEAM_DIR, 'depot_build.vdf.template'), 'utf8');
  fs.writeFileSync(
    path.join(BUILD_DIR, replacements.__DEPOT_VDF__),
    renderTemplate(depotTemplate, replacements),
  );

  const appTemplate = fs.readFileSync(path.join(STEAM_DIR, 'app_build.vdf.template'), 'utf8');
  const appBuildPath = path.join(BUILD_DIR, `app_build_${appId}.vdf`);
  fs.writeFileSync(appBuildPath, renderTemplate(appTemplate, replacements));

  console.log(`\nGenerated ${appBuildPath}`);
  console.log(`Generated ${path.join(BUILD_DIR, replacements.__DEPOT_VDF__)}\n`);

  if (!replacements.__SETLIVE__) {
    console.log('Note: STEAM_SETLIVE is empty - the build will be uploaded but NOT set live on');
    console.log('      any branch. Set it live in Steamworks to test, then promote it.\n');
  }

  const prepareOnly = process.argv.includes('--prepare') || process.env.STEAM_PREPARE_ONLY === '1';
  if (prepareOnly) {
    console.log('Prepared depot content and VDFs (skipping upload).');
    console.log(`Run: steamcmd +login <user> +run_app_build ${appBuildPath} +quit`);
    return;
  }

  const steamcmd = env.STEAMCMD || 'steamcmd';
  // steamcmd prompts for the password / Steam Guard code the first time; with a
  // stable, private HOME the login is cached for later runs.
  const loginArgs = env.STEAM_USERNAME ? ['+login', env.STEAM_USERNAME] : ['+login'];
  const args = [...loginArgs, '+run_app_build', appBuildPath, '+quit'];

  const steamcmdHome = resolveSteamcmdHome(env);
  fs.mkdirSync(steamcmdHome, { recursive: true });
  console.log(`SteamCMD HOME  : ${steamcmdHome}`);
  console.log(`Running: ${steamcmd} ${args.join(' ')}\n`);
  const result = spawnSync(steamcmd, args, {
    stdio: 'inherit',
    env: { ...process.env, HOME: steamcmdHome },
  });

  if (result.error) {
    fail(`Could not run "${steamcmd}". Install SteamCMD or set STEAMCMD in .env.\n${result.error.message}`);
  }
  process.exit(result.status || 0);
}

module.exports = { parseEnv, loadEnv, renderTemplate, detectExecutables, resolveConfig, resolveSteamcmdHome, copyDir };

if (require.main === module) {
  main();
}
