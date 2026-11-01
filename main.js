// main.js
const { app, BrowserWindow, session, ipcMain, Menu, net } = require('electron');
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
const { createAppActivator } = require('./js/AppActivation');
const { WindowManager } = require('./js/WindowManager');
const { installWebClientHook } = require('./js/WebClientHook');
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
// Used on macOS to ask LaunchServices to activate the running app. Keep this in
// sync with build.appId; the packaged package.json has the build config pruned.
const BUNDLE_ID = require('./js/bundleId');

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

// Activation is explicit: the game window is brought forward once at launch,
// and afterwards only when the player asks for it (Dock icon or relaunch). The
// macOS LaunchServices fallback is limited to the launch activation because
// `open -b` is fire-and-forget and can move focus back later.
const {
  activate: activateApp,
  ensureForegroundApp,
} = createAppActivator({
  app,
  spawn,
  bundleId: BUNDLE_ID,
  platform: process.platform,
  log: logStartup,
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Another instance was started (e.g. by relaunching the app). Focus the
    // window we already have instead; only the initial launch may ask
    // LaunchServices to activate the app.
    const win = windowManager && windowManager.getWindow();
    if (win && !win.isDestroyed()) {
      activateApp(win);
    }
  });

  app.whenReady().then(async () => {
    registerSoundProtocol();

    // Make sure the app is a regular foreground app (Dock icon + its own menu
    // bar) even when Steam started it as a child process.
    ensureForegroundApp();

    // Add a narrow bridge to the official web client so the desktop UI can send
    // commands through the client's alias engine instead of the raw WebSocket.
    try {
      const installed = await installWebClientHook({
        session: session.defaultSession,
        net,
      });
      logStartup(`genesisClient bridge: ${installed ? 'installed' : 'already installed'}`);
    } catch (err) {
      logStartup(`genesisClient bridge failed: ${err && err.message}`);
    }

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

    // Bring the game window to the front exactly once. When launched from
    // Steam the app can open behind the Steam window; activating it here also
    // gives it its own menu bar (the app is built as a regular foreground app).
    // The LaunchServices fallback is allowed only for this initial activation.
    // Everything after this is left to the player: the client must never pull
    // focus back from another app while it is starting or running.
    logStartup(
      `started packaged=${app.isPackaged} parent=${parentProcessName()} name=${app.getName()} menu=[${menuLabels()}]`,
    );

    activateApp(win, { allowLaunchServices: true });

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
