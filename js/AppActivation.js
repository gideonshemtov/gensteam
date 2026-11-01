// AppActivation.js - bring the game window forward at launch without taking
// focus back from another app after the player has switched away.
//
// Steam launches the client as a child process and can leave it behind the
// Steam window. The launch activation is therefore guarded: before each attempt
// we check which app is frontmost. Steam and the client itself are part of the
// launch handoff and may be replaced by the game; anything else (Safari, Finder,
// Discord, ...) means the player has switched away, so activation stops.
//
// `open -b` is fire-and-forget, and Steam briefly takes the front back about a
// second after the game first appears. Keep the guarded attempts running for a
// few seconds: if the game is already frontmost we do nothing, but if Steam has
// taken the front back we reclaim it. Every retry re-checks the frontmost app
// first, which is what prevents the old focus-stealing loop.
const { execFileSync } = require('child_process');

const GUARDED_ACTIVATION_DELAYS = [0, 500, 1500, 3000];

// Apps that are frontmost as part of launching the game from Steam. Finder is
// deliberately excluded: if the player clicks the desktop during startup, that
// is a switch away from the launch handoff, not a reason to grab focus.
const LAUNCH_FRONTMOST_BUNDLE_IDS = new Set([
  'com.valvesoftware.steam',
  'com.valvesoftware.steam.helper',
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

  // Returns:
  //   "activate" - the launch handoff is frontmost, bring the game forward
  //   "idle"     - the game is already frontmost, do nothing but keep watching
  //   "stop"     - another app has focus, the player switched away
  function activationDecision() {
    if (platform !== 'darwin' || !app.isPackaged) {
      return 'activate';
    }

    const frontmost = getFrontmostBundleId();
    if (frontmost === bundleId) {
      log('activateAtLaunch: already frontmost');
      return 'idle';
    }
    if (!frontmost || !LAUNCH_FRONTMOST_BUNDLE_IDS.has(frontmost)) {
      log(`activateAtLaunch: skipped (frontmost=${frontmost || 'unknown'})`);
      return 'stop';
    }

    log(`activateAtLaunch: frontmost=${frontmost}`);
    return 'activate';
  }

  // Returns "idle" or "activated" to keep watching, "stop" to end the retries.
  function attemptActivation(win) {
    const decision = activationDecision();
    if (decision !== 'activate') {
      return decision;
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

    return 'activated';
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
        if (attemptActivation(win) === 'stop') {
          stopped = true;
        }
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
