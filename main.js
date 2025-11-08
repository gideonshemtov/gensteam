// main.js
const { app, BrowserWindow, session } = require('electron');
const SettingsManager = require('./settings/SettingsManager');
const SettingsWindow = require('./settings/SettingsWindow');
const MenuBuilder = require('./js/MenuBuilder');
const FindBarManager = require('./js/FindBarManager');
const SoundIPC = require('./js/SoundIPC');
const { WindowManager } = require('./js/WindowManager');

// Initialize managers
let settingsManager;
let settingsWindow;
let menuBuilder;
let findBarManager;
let soundIPC;
let windowManager;

app.whenReady().then(() => {
  // Initialize settings manager and settings window
  settingsManager = new SettingsManager();
  settingsWindow = new SettingsWindow(settingsManager);
  
  // Initialize menu builder
  menuBuilder = new MenuBuilder(settingsManager, settingsWindow);
  
  // Set up IPC handlers for sound functionality
  soundIPC = new SoundIPC(settingsManager);
  soundIPC.setupHandlers();
  
  // Deny any permission prompts by default (camera/mic/etc.)
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));

  // Create main window with all managers
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function createWindow() {
  // Initialize window manager first (without find bar)
  windowManager = new WindowManager(settingsManager, menuBuilder, null);
  
  // Create the main window
  const win = windowManager.create();
  
  // Now create find bar manager with the window
  findBarManager = new FindBarManager(win);
  
  // Update window manager with find bar manager
  windowManager.findBarManager = findBarManager;
  windowManager.setupFindBar();
  
  // Close settings window when main window is closed
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

