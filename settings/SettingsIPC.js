const { ipcMain } = require('electron');

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
  }
}

module.exports = SettingsIPC;
