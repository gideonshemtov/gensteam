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

  createWindow();

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
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
