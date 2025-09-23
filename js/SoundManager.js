// SoundManager.js - Manages sound configuration and playback
class SoundManager {
  constructor(settings = {}) {
    this.settings = settings;
    this.audioCache = new Map();
    this.init();
  }

  init() {
    console.log('🔊 SoundManager initialized');
  }

  updateSettings(newSettings) {
    this.settings = newSettings;
    console.log('🔊 SoundManager settings updated');
  }

  // Play a sound by its configured name
  async playSound(soundName) {
    if (!this.settings.sounds?.enabled) {
      console.log(`🔇 Sounds disabled, skipping: ${soundName}`);
      return false;
    }

    const soundConfig = this.settings.sounds?.soundMappings?.find(s => s.name === soundName);
    if (!soundConfig) {
      console.warn(`🔊 Sound mapping not found: ${soundName}`);
      return false;
    }

    return await this.playSoundFile(soundConfig.filename, soundConfig.volume);
  }

  // Play a sound file directly
  async playSoundFile(filename, volume = 1.0) {
    try {
      // Request the main process to play the sound
      if (window.electronAPI && window.electronAPI.playSound) {
        const success = await window.electronAPI.playSound(filename, volume);
        if (success) {
          console.log(`🔊 Played sound: ${filename} (volume: ${volume})`);
        } else {
          console.warn(`🔊 Failed to play sound: ${filename}`);
        }
        return success;
      } else {
        console.warn('🔊 electronAPI.playSound not available');
        return false;
      }
    } catch (error) {
      console.error(`🔊 Error playing sound ${filename}:`, error);
      return false;
    }
  }

  // Get list of available sound files
  async getAvailableSounds() {
    try {
      if (window.electronAPI && window.electronAPI.getAvailableSounds) {
        return await window.electronAPI.getAvailableSounds();
      }
      return [];
    } catch (error) {
      console.error('🔊 Error getting available sounds:', error);
      return [];
    }
  }

  // Test a sound
  async testSound(soundName) {
    console.log(`🔊 Testing sound: ${soundName}`);
    return await this.playSound(soundName);
  }

  // Get current sound settings
  getSoundSettings() {
    return this.settings.sounds || {
      enabled: false,
      masterVolume: 1.0,
      soundMappings: []
    };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundManager;
}