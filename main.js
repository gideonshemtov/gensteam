// main.js
const { app, BrowserWindow, session, ipcMain } = require('electron');
const SettingsManager = require('./settings/SettingsManager');
const SettingsWindow = require('./settings/SettingsWindow');
const SettingsIPC = require('./settings/SettingsIPC');
const MenuBuilder = require('./js/MenuBuilder');
const FindBarManager = require('./js/FindBarManager');
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
let timerIPC;
let windowManager;

// Steam can activate its own window just after handing the launch off to the
// game, which leaves the game behind the Steam client. On macOS that also means
// the menu bar keeps showing Steam's menus instead of ours, because the
// application menu is global and belongs to the active app. Re-assert
// activation for a short while so the game wins that race.
const MAC_ACTIVATION_RETRY_DELAYS = [250, 750, 1500];

function bringToFront(win) {
  if (!win || win.isDestroyed()) {
    return;
  }
  win.show();
  win.focus();
  if (process.platform === 'darwin') {
    win.moveTop();
    app.focus({ steal: true });
  }
}

app.whenReady().then(() => {
  registerSoundProtocol();

  if (process.platform === 'darwin') {
    // Make sure the app is a regular foreground app (Dock icon + its own menu
    // bar) even when Steam started it as a child process.
    app.setActivationPolicy('regular');
  }

  ipcMain.handle('get-available-sounds', () => listAvailableSounds());

  settingsManager = new SettingsManager();
  new SettingsIPC(settingsManager);
  settingsWindow = new SettingsWindow();

  menuBuilder = new MenuBuilder(settingsManager, settingsWindow, () => windowManager && windowManager.showZoomBadge());

  timerIPC = new TimerIPC(settingsManager);
  timerIPC.setupHandlers();

  session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));

  const win = createWindow();

  // Bring the game window to the front. When launched from Steam the app can
  // open behind the Steam window, so activate and steal focus once it is ready,
  // then retry briefly in case Steam activates itself again afterwards.
  win.once('ready-to-show', () => {
    bringToFront(win);

    if (process.platform === 'darwin') {
      for (const delay of MAC_ACTIVATION_RETRY_DELAYS) {
        setTimeout(() => {
          if (!win.isDestroyed() && !win.isFocused()) {
            bringToFront(win);
          }
        }, delay);
      }
    }
  });

  app.on('activate', () => {
    const existing = BrowserWindow.getAllWindows()[0];
    if (existing) {
      bringToFront(existing);
    } else {
      createWindow();
    }
  });
});

function createWindow() {
  windowManager = new WindowManager(settingsManager, menuBuilder, null);

  const win = windowManager.create();

  findBarManager = new FindBarManager(win);

  windowManager.findBarManager = findBarManager;
  windowManager.setupFindBar();

  win.on('closed', () => {
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
