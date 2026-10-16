// settings/SettingsWindow.js
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class SettingsWindow {
  constructor() {
    this.window = null;
    this.setupWindowHandlers();
  }

  setupWindowHandlers() {
    ipcMain.handle('window:close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.close();
      }
    });

    ipcMain.handle('window:force-close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.destroy();
      }
    });
  }

  create(parentWindow) {
    if (this.window) {
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      title: 'Genesis Client - Settings',
      autoHideMenuBar: true,
      // Behave like a modal dialog: block interaction with the game window
      // until preferences are closed.
      parent: parentWindow || undefined,
      modal: Boolean(parentWindow),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'settings-preload.js')
      }
    });

    // Load the settings UI
    this.window.loadFile(path.join(__dirname, 'settings.html'));

    // Handle window close attempt (before closing)
    this.window.on('close', (e) => {
      // Let the renderer handle unsaved changes
      e.preventDefault();
      this.window.webContents.send('window:close-requested');
    });

    // Handle window closed
    this.window.on('closed', () => {
      this.window = null;
    });

    // Open dev tools in development
    if (process.env.NODE_ENV === 'development') {
      this.window.webContents.openDevTools();
    }

    return this.window;
  }

  close() {
    if (this.window) {
      this.window.close();
    }
  }

  isOpen() {
    return this.window && !this.window.isDestroyed();
  }
}

module.exports = SettingsWindow;
