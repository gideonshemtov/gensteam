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

app.whenReady().then(() => {
  registerSoundProtocol();

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
  // open behind the Steam window, so activate and steal focus once it is ready.
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
    if (process.platform === 'darwin') {
      app.focus({ steal: true });
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
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
