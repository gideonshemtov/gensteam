const { ipcMain } = require('electron');
const fs = require('fs');

class TimerIPC {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
  }

  setupHandlers() {
    ipcMain.handle('save-timer-settings', (event, newSettings) => {
      return this.saveTimerSettings(newSettings);
    });
  }

  saveTimerSettings(newSettings) {
    try {
      const settingsPath = this.settingsManager.getSettingsPath();

      if (this.settingsManager.validate && !this.settingsManager.validate(newSettings)) {
        throw new Error('Invalid timer settings');
      }

      fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
      this.settingsManager.settings = newSettings;

      return { success: true };
    } catch (error) {
      console.error('Failed to save timer settings:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TimerIPC;
