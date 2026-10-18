const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { formatHotkey, isSafeHotkey } = require('../js/hotkeyKeys');

class SettingsIPC {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.setupHandlers();
  }

  setupHandlers() {
    const settingsManager = this.settingsManager;

    ipcMain.handle('settings:get', () => settingsManager.settings);

    ipcMain.handle('settings:getSchema', () => settingsManager.getSchema());

    ipcMain.handle('settings:save', async (_event, newSettings) => {
      try {
        settingsManager.save(newSettings);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('settings:reset', () => {
      settingsManager.reset();
      return settingsManager.settings;
    });

    ipcMain.handle('settings:resetSection', (_event, section) => {
      settingsManager.resetSection(section);
      return settingsManager.settings;
    });

    ipcMain.handle('settings:exportJson', () => settingsManager.exportSettings());

    ipcMain.handle('settings:importJson', async (_event, jsonString) => {
      try {
        settingsManager.importSettings(jsonString);
        return { success: true, settings: settingsManager.settings };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('settings:getPath', () => settingsManager.getSettingsPath());

    // Turn a raw keydown descriptor from the preferences recorder into the
    // canonical hotkey string and report whether it is safe to dispatch.
    ipcMain.handle('hotkeys:record', (_event, descriptor) => {
      const keys = formatHotkey(descriptor);
      if (!keys) {
        return null;
      }
      return { keys, safe: isSafeHotkey(keys) };
    });

    // Return the markup for a preferences section. The name is restricted to a
    // safe slug so it cannot escape settings/sections/.
    ipcMain.handle('settings:getPartial', (_event, name) => {
      if (typeof name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(name)) {
        return null;
      }
      try {
        return fs.readFileSync(path.join(__dirname, 'sections', `${name}.html`), 'utf8');
      } catch {
        return null;
      }
    });
  }
}

module.exports = SettingsIPC;
