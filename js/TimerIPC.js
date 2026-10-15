const { ipcMain } = require('electron');
const { GAME_ORIGIN } = require('./WindowManager');

class TimerIPC {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
  }

  setupHandlers() {
    ipcMain.handle('save-timer-settings', (event, timers) => {
      if (!this.isTrustedSender(event)) {
        console.warn('Rejected save-timer-settings from untrusted sender');
        return { success: false, error: 'Untrusted sender' };
      }
      return this.saveTimerSettings(timers);
    });
  }

  // Only accept calls from the top-level frame of the game client page.
  isTrustedSender(event) {
    const frame = event.senderFrame;
    if (!frame || frame.parent) {
      return false;
    }
    try {
      return new URL(frame.url).origin === GAME_ORIGIN;
    } catch {
      return false;
    }
  }

  // Persist only the timers slice; any other settings in the payload are ignored.
  saveTimerSettings(timers) {
    try {
      const activeTimers = this.validateTimers(timers);

      const newSettings = JSON.parse(JSON.stringify(this.settingsManager.get()));
      newSettings.timers = { activeTimers };
      this.settingsManager.save(newSettings);

      return { success: true };
    } catch (error) {
      console.error('Failed to save timer settings:', error);
      return { success: false, error: error.message };
    }
  }

  validateTimers(timers) {
    if (!timers || !Array.isArray(timers.activeTimers)) {
      throw new Error('Invalid timer settings');
    }

    return timers.activeTimers.map((timer) => {
      if (
        typeof timer !== 'object' ||
        timer === null ||
        typeof timer.id !== 'number' ||
        typeof timer.name !== 'string' ||
        typeof timer.interval !== 'number' ||
        timer.interval < 1 ||
        timer.interval > 3600 ||
        typeof timer.command !== 'string' ||
        typeof timer.isActive !== 'boolean'
      ) {
        throw new Error('Invalid timer settings');
      }

      const validated = {
        id: timer.id,
        name: timer.name,
        interval: timer.interval,
        command: timer.command,
        isActive: timer.isActive
      };

      if (typeof timer.createdAt === 'number') {
        validated.createdAt = timer.createdAt;
      }

      return validated;
    });
  }
}

module.exports = TimerIPC;
