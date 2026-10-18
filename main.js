// main.js
const { app, BrowserWindow, session, ipcMain, Menu } = require('electron');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const SettingsManager = require('./settings/SettingsManager');
const SettingsWindow = require('./settings/SettingsWindow');
const SettingsIPC = require('./settings/SettingsIPC');
const MenuBuilder = require('./js/MenuBuilder');
const FindBarManager = require('./js/FindBarManager');
const HotkeyManager = require('./js/HotkeyManager');
const TimerIPC = require('./js/TimerIPC');
const { WindowManager } = require('./js/WindowManager');
const {
  registerSoundScheme,
  registerSoundProtocol,
  listAvailableSounds,
} = require('./js/SoundProtocol');

registerSoundScheme();

let settingsManager;
let settingsWindow;
let menuBuilder;
let findBarManager;
let hotkeyManager;
let timerIPC;
let windowManager;

// Application identifier from the build config (see package.json "build.appId").
// Used on macOS to ask LaunchServices to activate the running app.
const BUNDLE_ID = require('./package.json').build && require('./package.json').build.appId;

// Steam activates its own window just after handing the launch off to the game,
// which leaves the game behind the Steam client. On macOS that also means the
// menu bar keeps showing Steam's menus instead of ours, because the application
// menu is global and belongs to the active app. Re-assert activation for a
// short while so the game wins that race.
const MAC_ACTIVATION_RETRY_DELAYS = [200, 600, 1200, 2500];

// If asking LaunchServices to activate the app ever starts a second instance
// (which the single-instance lock rejects) we stop using that fallback to avoid
// a launch/quit loop.
let launchServicesActivationFailed = false;

// Startup diagnostics. Steam launches the game as a child process, and on macOS
// the client's menus only appear while it is the active application, so when
// they do not show up this log is the fastest way to see what the app observed.
// Appended to startup.log in the app's user data directory; never throws.
function logStartup(message) {
  try {
    fs.appendFileSync(
      path.join(app.getPath('userData'), 'startup.log'),
      `${new Date().toISOString()} ${message}\n`,
    );
  } catch {
    // Diagnostics must never break startup.
  }
}

function menuLabels() {
  try {
    const menu = Menu.getApplicationMenu();
    return menu ? menu.items.map((item) => item.label).filter(Boolean).join(' | ') : '(none)';
  } catch {
    return '(error)';
  }
}

function parentProcessName() {
  try {
    return execFileSync('ps', ['-o', 'comm=', '-p', String(process.ppid)]).toString().trim();
  } catch {
    return String(process.ppid);
  }
}

// macOS only: make sure the app is a regular, foreground app. An accessory
// ("UIElement") app has no menu bar of its own, so macOS keeps showing the
// previously active app's menus — e.g. Steam's — even while our window is in
// front. `setActivationPolicy` alone has proven unreliable here, so also ask for
// the Dock icon, which forces the regular policy.
function ensureForegroundApp() {
  if (process.platform !== 'darwin') {
    return;
  }
  try {
    app.setActivationPolicy('regular');
    const shown = app.dock && app.dock.show ? app.dock.show() : null;
    if (shown && typeof shown.catch === 'function') {
      shown.catch(() => {});
    }
    logStartup('ensureForegroundApp: setActivationPolicy(regular) + dock.show()');
  } catch (err) {
    logStartup(`ensureForegroundApp failed: ${err && err.message}`);
  }
}

function activateApp(win, { allowLaunchServices = true } = {}) {
  if (!win || win.isDestroyed()) {
    return;
  }
  if (win.isMinimized()) {
    win.restore();
  }
  ensureForegroundApp();
  win.show();
  win.focus();

  if (process.platform !== 'darwin') {
    return;
  }

  win.moveTop();
  app.focus({ steal: true });

  // app.focus() relies on the deprecated activateIgnoringOtherApps path, which
  // macOS can ignore when the app was started by another process (Steam).
  // Asking LaunchServices to open the already-running bundle activates it
  // reliably instead. The single-instance lock stops a duplicate if the running
  // process is not registered with LaunchServices for any reason.
  if (allowLaunchServices && !launchServicesActivationFailed && app.isPackaged && BUNDLE_ID) {
    try {
      spawn('/usr/bin/open', ['-b', BUNDLE_ID], { stdio: 'ignore' }).unref();
    } catch {
      // The plain focus calls above already ran; nothing more to do.
    }
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Another instance was started (e.g. by LaunchServices). Focus the window we
    // already have instead; do not use the LaunchServices fallback again.
    launchServicesActivationFailed = true;
    const win = windowManager && windowManager.getWindow();
    if (win && !win.isDestroyed()) {
      activateApp(win, { allowLaunchServices: false });
    }
  });

  app.whenReady().then(() => {
    registerSoundProtocol();

    // Make sure the app is a regular foreground app (Dock icon + its own menu
    // bar) even when Steam started it as a child process.
    ensureForegroundApp();

    ipcMain.handle('get-available-sounds', () => listAvailableSounds());

    settingsManager = new SettingsManager();
    new SettingsIPC(settingsManager);
    settingsWindow = new SettingsWindow();

    menuBuilder = new MenuBuilder(settingsManager, settingsWindow, () => windowManager && windowManager.showZoomBadge());

    hotkeyManager = new HotkeyManager(settingsManager);

    timerIPC = new TimerIPC(settingsManager);
    timerIPC.setupHandlers();

    session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));

    const win = createWindow();

    // Bring the game window to the front. When launched from Steam the app can
    // open behind the Steam window, and "ready-to-show" can be many seconds away
    // while the game page loads (until the app is active macOS keeps showing
    // Steam's menu bar), so activate immediately and then retry briefly in case
    // Steam activates itself again afterwards.
    logStartup(
      `started packaged=${app.isPackaged} parent=${parentProcessName()} name=${app.getName()} menu=[${menuLabels()}]`,
    );

    activateApp(win);

    if (process.platform === 'darwin') {
      for (const delay of MAC_ACTIVATION_RETRY_DELAYS) {
        setTimeout(() => {
          if (win.isDestroyed()) {
            return;
          }
          if (!win.isFocused()) {
            activateApp(win);
          }
          logStartup(`retry ${delay}ms focused=${win.isFocused()}`);
        }, delay);
      }
    }

    win.once('ready-to-show', () => {
      if (!win.isDestroyed() && !win.isFocused()) {
        activateApp(win);
      }
    });

    // The game page can take a moment to paint; make sure we are still in front
    // once it has finished loading.
    win.webContents.on('did-finish-load', () => {
      if (process.platform === 'darwin' && !win.isDestroyed() && !win.isFocused()) {
        activateApp(win);
      }
    });

    app.on('activate', () => {
      const existing = windowManager && windowManager.getWindow();
      if (existing && !existing.isDestroyed()) {
        activateApp(existing);
      } else if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

function createWindow() {
  windowManager = new WindowManager(settingsManager, menuBuilder, null);

  const win = windowManager.create();

  findBarManager = new FindBarManager(win);

  windowManager.findBarManager = findBarManager;
  windowManager.setupFindBar();

  // Configurable keyboard shortcuts that send commands while the game is focused.
  hotkeyManager.attach(win);

  win.on('closed', () => {
    hotkeyManager.detach();
    if (settingsWindow && settingsWindow.isOpen()) {
      settingsWindow.close();
    }
  });

  return win;
}

// This is a game client launched from Steam: closing the window ends the
// session, so Steam stops reporting the game as running (the macOS convention
// of keeping the app alive with no windows is confusing here).
app.on('window-all-closed', () => {
  app.quit();
});
