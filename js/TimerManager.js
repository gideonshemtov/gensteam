// TimerManager.js - Handle recurring command timers
class TimerManager {
  constructor() {
    this.timers = new Map(); // Map<timerId, { interval, command, isActive }>
    this.settings = null;
    this.isInitialized = false;
    this.nextTimerId = 1;
  }

  init(settings) {
    this.settings = settings;
    this.isInitialized = true;
    
    // Restore any previously configured timers
    if (this.settings.timers && this.settings.timers.activeTimers) {
      this.settings.timers.activeTimers.forEach(timerConfig => {
        if (timerConfig.isActive) {
          this.startTimer(timerConfig.id, timerConfig.interval, timerConfig.command);
        }
      });
    }
  }

  createTimer(interval, command, name = '') {
    if (!this.isInitialized) {
      console.error('TimerManager not initialized');
      return null;
    }

    const timerId = this.nextTimerId++;
    const timerConfig = {
      id: timerId,
      name: name || `Timer ${timerId}`,
      interval: interval,
      command: command,
      isActive: false,
      createdAt: Date.now()
    };

    // Add to settings
    if (!this.settings.timers) {
      this.settings.timers = { activeTimers: [] };
    }
    
    this.settings.timers.activeTimers.push(timerConfig);
    this.saveSettings();

    return timerId;
  }

  startTimer(timerId, interval, command) {
    // Stop existing timer if running
    this.stopTimer(timerId);

    const intervalId = setInterval(() => {
      this.executeCommand(command);
    }, interval * 1000);

    this.timers.set(timerId, {
      intervalId: intervalId,
      interval: interval,
      command: command,
      isActive: true
    });

    // Update settings
    this.updateTimerInSettings(timerId, { isActive: true });

    console.log(`Timer ${timerId} started: "${command}" every ${interval}s`);
    return true;
  }

  stopTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (timer) {
      clearInterval(timer.intervalId);
      timer.isActive = false;
      this.timers.set(timerId, timer);
      
      // Update settings
      this.updateTimerInSettings(timerId, { isActive: false });
      
      console.log(`Timer ${timerId} stopped`);
      return true;
    }
    return false;
  }

  deleteTimer(timerId) {
    // Stop the timer first
    this.stopTimer(timerId);
    
    // Remove from memory
    this.timers.delete(timerId);
    
    // Remove from settings
    if (this.settings.timers && this.settings.timers.activeTimers) {
      this.settings.timers.activeTimers = this.settings.timers.activeTimers.filter(
        timer => timer.id !== timerId
      );
      this.saveSettings();
    }
    
    console.log(`Timer ${timerId} deleted`);
    return true;
  }

  executeCommand(command) {
    // Try to use MUD Connector API if available
    if (typeof window !== 'undefined' && window.mudAPI && window.mudAPI.send) {
      console.log(`⏰ Timer executing: "${command}" via MUD Connector`);
      const success = window.mudAPI.send(command);
      if (success) {
        return; // Successfully sent via MUD Connector
      }
      console.warn('MUD Connector send failed, falling back to input method');
    }
    
    // Fallback to the old input field method
    const input = document.getElementById('input');
    if (input) {
      console.log(`⏰ Timer executing: "${command}" via input field`);
      // Store current input value to restore later
      const currentValue = input.value;
      
      input.value = command;
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      input.dispatchEvent(enterEvent);
      
      // Restore previous input after a short delay
      setTimeout(() => {
        if (input.value === command) {
          input.value = currentValue;
        }
      }, 100);
    }
  }

  updateTimerInSettings(timerId, updates) {
    if (!this.settings.timers || !this.settings.timers.activeTimers) return;
    
    const timerIndex = this.settings.timers.activeTimers.findIndex(t => t.id === timerId);
    if (timerIndex !== -1) {
      Object.assign(this.settings.timers.activeTimers[timerIndex], updates);
      this.saveSettings();
    }
  }

  saveSettings() {
    // This will be called by the main process through window.buttonPanel
    if (window.electronAPI && window.electronAPI.saveTimerSettings) {
      window.electronAPI.saveTimerSettings(this.settings).then(result => {
        if (!result.success) {
          console.error('Failed to save timer settings:', result.error);
        }
      }).catch(err => {
        console.error('Error saving timer settings:', err);
      });
    }
  }

  getActiveTimers() {
    const activeTimers = [];
    this.timers.forEach((timer, timerId) => {
      if (timer.isActive) {
        const settingsTimer = this.settings.timers?.activeTimers?.find(t => t.id === timerId);
        activeTimers.push({
          id: timerId,
          name: settingsTimer?.name || `Timer ${timerId}`,
          interval: timer.interval,
          command: timer.command,
          isActive: true
        });
      }
    });
    return activeTimers;
  }

  getAllTimers() {
    if (!this.settings.timers || !this.settings.timers.activeTimers) {
      return [];
    }
    
    return this.settings.timers.activeTimers.map(timerConfig => ({
      ...timerConfig,
      isRunning: this.timers.has(timerConfig.id) && this.timers.get(timerConfig.id).isActive
    }));
  }

  updateSettings(newSettings) {
    this.settings = newSettings;
    
    // Stop all current timers
    this.timers.forEach((timer, timerId) => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    });
    this.timers.clear();
    
    // Restart active timers from new settings
    if (newSettings.timers && newSettings.timers.activeTimers) {
      newSettings.timers.activeTimers.forEach(timerConfig => {
        if (timerConfig.isActive) {
          this.startTimer(timerConfig.id, timerConfig.interval, timerConfig.command);
        }
      });
    }
  }

  destroy() {
    // Stop all timers
    this.timers.forEach(timer => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    });
    this.timers.clear();
    this.isInitialized = false;
  }
}

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimerManager;
}
