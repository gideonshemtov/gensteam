// AppActivation.js - keep window activation explicit and never steal focus.
//
// On macOS a regular app is only frontmost (and owns the menu bar) while it is
// the active application. Steam launches the client as a child process without
// activating it, so this policy does not ask the OS to activate the app at all:
//
//   * At launch the window is shown inactive. The game may open behind Steam;
//     the first click on the window or Dock icon activates it natively.
//   * `activate()` is only called from user-initiated paths (Dock icon or
//     relaunch), so showing and focusing our own window cannot steal focus from
//     another app.
//
// `ensureForegroundApp` only sets the activation policy. Do not call
// app.dock.show() here: on macOS 27 it activates the app roughly four seconds
// into startup and pulls focus back from whichever app the player switched to.
// The bundle is already a regular foreground app via Info.plist, so it has a
// Dock icon without that call.

function createAppActivator({ app, platform = process.platform, log = () => {} }) {
  function ensureForegroundApp() {
    if (platform !== 'darwin') {
      return;
    }
    try {
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

  // Show the window on screen at launch without activating the application.
  // On non-macOS platforms there is no separate application activation step,
  // so a normal show/focus is the existing behaviour.
  function showAtLaunch(win) {
    if (!prepare(win)) {
      return;
    }
    if (platform === 'darwin') {
      win.showInactive();
      return;
    }
    win.show();
    win.focus();
  }

  // Called only when the user explicitly activates the app (Dock icon or
  // relaunch). macOS has already made the app active by then, so this only
  // raises and focuses our own window.
  function activate(win) {
    if (!prepare(win)) {
      return;
    }
    win.show();
    win.focus();
    if (platform === 'darwin') {
      win.moveTop();
    }
  }

  return { activate, showAtLaunch, ensureForegroundApp };
}

module.exports = { createAppActivator };
