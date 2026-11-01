// AppActivation.js - bring the game window forward at launch without taking
// focus back from another app after the player has switched away.
//
// Steam launches the client as a child process and can leave it behind the
// Steam window. The launch activation is therefore guarded: before each attempt
// we check which app is frontmost. Steam, Finder and the client itself are part
// of the launch handoff and may be replaced by the game; anything else means the
// player has switched away, so activation stops immediately.
//
// `open -b` is fire-and-forget, so we also keep retrying briefly in case Steam
// takes the front back during its own launch. Every retry re-checks the
// frontmost app first, which is what prevents the old focus-stealing loop.
const { execFileSync } = require('child_process');

const GUARDED_ACTIVATION_DELAYS = [0, 500, 1500, 3000, 5000];

// Apps that are frontmost as part of launching the game.
const LAUNCH_FRONTMOST_BUNDLE_IDS = new Set([
  'com.valvesoftware.steam',
  'com.valvesoftware.steam.helper',
  'com.apple.finder',
]);

function defaultRunLaunchServices(bundleId) {
  execFileSync('/usr/bin/open', ['-b', bundleId], {
    stdio: 'ignore',
    timeout: 2000,
  });
}

function defaultFrontmostBundleId() {
  try {
    const front = execFileSync('/usr/bin/lsappinfo', ['front'], {
      encoding: 'utf8',
      timeout: 1000,
    }).trim();
    if (!front) {
      return null;
    }

    const info = execFileSync(
      '/usr/bin/lsappinfo',
      ['info', '-only', 'bundleID', front],
      { encoding: 'utf8', timeout: 1000 },
    );
    const match = /bundleID="([^"]+)"/.exec(info);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function createAppActivator({
  app,
  bundleId,
  platform = process.platform,
  log = () => {},
  getFrontmostBundleId = defaultFrontmostBundleId,
  runLaunchServices = defaultRunLaunchServices,
  setTimer = setTimeout,
}) {
  function ensureForegroundApp() {
    if (platform !== 'darwin') {
      return;
    }
    try {
      // Do not call app.dock.show() here: on macOS 27 it activates the app
      // several seconds into startup and pulls focus back from whichever app
      // the player switched to. The bundle is already a regular foreground app
      // via Info.plist, so it has a Dock icon without that call.
      app.setActivationPolicy('regular');
      log('ensureForegroundApp: setActivationPolicy(regular)');
    } catch (err) {
      log(`ensureForegroundApp failed: ${err && err.message}`);
    }
  }

  function prepare(win) {
    if (!win || win.isDestroyed()) {
      return false;
    }
    if (win.isMinimized()) {
      win.restore();
    }
    ensureForegroundApp();
    return true;
  }

  // Returns true when the current frontmost app is safe to replace with the
  // game, false when activation should stop (another app has focus, or the
  // game is already frontmost).
  function isSafeToActivate() {
    if (platform !== 'darwin' || !app.isPackaged) {
      return true;
    }

    const frontmost = getFrontmostBundleId();
    if (frontmost === bundleId) {
      log('activateAtLaunch: already frontmost');
      return false;
    }
    if (!frontmost || !LAUNCH_FRONTMOST_BUNDLE_IDS.has(frontmost)) {
      log(`activateAtLaunch: skipped (frontmost=${frontmost || 'unknown'})`);
      return false;
    }

    log(`activateAtLaunch: frontmost=${frontmost}`);
    return true;
  }

  // Returns true to keep retrying, false once activation should stop.
  function attemptActivation(win) {
    if (!isSafeToActivate()) {
      return false;
    }

    win.show();
    win.focus();
    win.moveTop();
    app.focus({ steal: true });

    // app.focus() can be ignored when Steam started the process, so also ask
    // LaunchServices to activate the running bundle. This is still guarded by
    // the frontmost check above.
    if (app.isPackaged && bundleId) {
      try {
        runLaunchServices(bundleId);
        log('activateAtLaunch: asked LaunchServices');
      } catch {
        log('activateAtLaunch: LaunchServices failed');
      }
    }

    return true;
  }

  // Launch path: show the window inactive first, then try to bring it forward
  // only while the launch handoff is still frontmost.
  function activateAtLaunch(win) {
    if (!prepare(win)) {
      return;
    }
    if (platform !== 'darwin') {
      win.show();
      win.focus();
      return;
    }

    win.showInactive();

    let stopped = false;
    for (const delay of GUARDED_ACTIVATION_DELAYS) {
      setTimer(() => {
        if (stopped || win.isDestroyed()) {
          return;
        }
        stopped = !attemptActivation(win);
      }, delay);
    }
  }

  // Called only when the user explicitly activates the app (Dock icon or
  // relaunch). The user asked for the window, so raising it cannot steal focus.
  function activate(win) {
    if (!prepare(win)) {
      return;
    }
    win.show();
    win.focus();
    if (platform === 'darwin') {
      win.moveTop();
      app.focus({ steal: true });
    }
  }

  return { activate, activateAtLaunch, ensureForegroundApp };
}

module.exports = {
  createAppActivator,
  defaultFrontmostBundleId,
  GUARDED_ACTIVATION_DELAYS,
  LAUNCH_FRONTMOST_BUNDLE_IDS,
};
