// SoundManager.js - Manages sound configuration and playback via Chromium Audio API
class SoundManager {
  constructor(settings = {}) {
    this.settings = settings;
    this.init();
  }

  init() {
    console.log('🔊 SoundManager initialized');
  }

  updateSettings(newSettings) {
    this.settings = newSettings;
    console.log('🔊 SoundManager settings updated');
  }

  getMasterVolume() {
    const volume = this.settings.sounds?.masterVolume ?? 1.0;
    return Math.min(1, Math.max(0, volume));
  }

  getSoundUrl(filename) {
    if (window.electronAPI?.getSoundUrl) {
      return window.electronAPI.getSoundUrl(filename);
    }
    return null;
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

    return await this.playSoundFile(soundConfig.filename);
  }

  // Play a sound file directly
  async playSoundFile(filename, volume = 1.0) {
    if (!this.settings.sounds?.enabled) {
      return false;
    }

    const url = this.getSoundUrl(filename);
    if (!url) {
      console.warn(`🔊 Invalid or unavailable sound file: ${filename}`);
      return false;
    }

    const finalVolume = Math.min(1, Math.max(0, this.getMasterVolume() * volume));

    try {
      const audio = new Audio(url);
      audio.volume = finalVolume;
      await audio.play();
      console.log(`🔊 Played sound: ${filename}`);
      return true;
    } catch (error) {
      console.error(`🔊 Error playing sound ${filename}:`, error);
      return false;
    }
  }

  // Get list of available sound files
  async getAvailableSounds() {
    try {
      if (window.electronAPI?.getAvailableSounds) {
        return await window.electronAPI.getAvailableSounds();
      }
      return [];
    } catch (error) {
      console.error('🔊 Error getting available sounds:', error);
      return [];
    }
  }

  getSoundSettings() {
    return this.settings.sounds || {
      enabled: false,
      masterVolume: 1.0,
      soundMappings: [],
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundManager;
}
