// AppActivation.js - bring the game window to the front without taking focus
// back from another app once the player has switched away.
//
// The app is built as a regular foreground app, so macOS gives it its own menu
// bar as soon as it is active. Activation itself only needs two cases:
//
//   1. The initial launch. Steam starts the process as a child, and AppKit can
//      ignore a normal app.focus() in that situation, so the launch activation
//      may ask LaunchServices (`open -b`) to activate the running bundle.
//   2. A user-initiated activation later on (Dock icon or relaunch). That only
//      raises our own window.
//
// `open -b` is fire-and-forget and can activate the app a moment after it is
// called, so request it at most once, for the initial launch. Requesting it
// again on a later activation could pull focus back from whatever app the
// player switched to.
const LAUNCH_SERVICES = '/usr/bin/open';

function createAppActivator({
  app,
  spawn,
  bundleId,
  platform = process.platform,
  log = () => {},
}) {
  let launchServicesRequested = false;

  function ensureForegroundApp() {
    if (platform !== 'darwin') {
      return;
    }
    try {
      app.setActivationPolicy('regular');
      const shown = app.dock && app.dock.show ? app.dock.show() : null;
      if (shown && typeof shown.catch === 'function') {
        shown.catch(() => {});
      }
      log('ensureForegroundApp: setActivationPolicy(regular) + dock.show()');
    } catch (err) {
      log(`ensureForegroundApp failed: ${err && err.message}`);
    }
  }

  function requestLaunchServicesActivation() {
    if (launchServicesRequested || platform !== 'darwin' || !app.isPackaged || !bundleId) {
      return false;
    }

    // Mark it before spawning: even a failed attempt must not be retried later
    // from a user-initiated activation.
    launchServicesRequested = true;
    try {
      spawn(LAUNCH_SERVICES, ['-b', bundleId], { stdio: 'ignore' }).unref();
      log(`activateApp: asked LaunchServices to activate ${bundleId}`);
      return true;
    } catch {
      return false;
    }
  }

  function activate(win, { allowLaunchServices = false } = {}) {
    if (!win || win.isDestroyed()) {
      return;
    }

    if (win.isMinimized()) {
      win.restore();
    }

    ensureForegroundApp();
    win.show();
    win.focus();

    if (platform !== 'darwin') {
      return;
    }

    win.moveTop();
    app.focus({ steal: true });

    if (allowLaunchServices) {
      requestLaunchServicesActivation();
    }
  }

  return { activate, ensureForegroundApp };
}

module.exports = { createAppActivator, LAUNCH_SERVICES };
