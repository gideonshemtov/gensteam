// settings/SettingsWindow.js
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class SettingsWindow {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.window = null;
    this.setupIpcHandlers();
  }

  setupIpcHandlers() {
    // Get current settings
    ipcMain.handle('settings:get', () => {
      return this.settingsManager.settings;
    });

    // Get settings schema
    ipcMain.handle('settings:getSchema', () => {
      return this.settingsManager.getSchema();
    });

    // Save settings
    ipcMain.handle('settings:save', async (event, newSettings) => {
      try {
        this.settingsManager.save(newSettings);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Reset settings
    ipcMain.handle('settings:reset', () => {
      this.settingsManager.reset();
      return this.settingsManager.settings;
    });

    // Reset section
    ipcMain.handle('settings:resetSection', (event, section) => {
      this.settingsManager.resetSection(section);
      return this.settingsManager.settings;
    });

    // Get settings as JSON
    ipcMain.handle('settings:exportJson', () => {
      return this.settingsManager.exportSettings();
    });

    // Import settings from JSON
    ipcMain.handle('settings:importJson', async (event, jsonString) => {
      try {
        this.settingsManager.importSettings(jsonString);
        return { success: true, settings: this.settingsManager.settings };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Get settings file path
    ipcMain.handle('settings:getPath', () => {
      return this.settingsManager.getSettingsPath();
    });

    // Close window
    ipcMain.handle('window:close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.close();
      }
    });

    // Force close window (bypass close handler)
    ipcMain.handle('window:force-close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.destroy();
      }
    });
  }

  create() {
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
