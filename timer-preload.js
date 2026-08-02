// timer-preload.js - Preload script for timer IPC communication
const { contextBridge, ipcRenderer } = require('electron');

const SOUND_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.(wav|mp3|ogg|m4a|aac|flac)$/i;

function getSoundUrl(filename) {
  if (typeof filename !== 'string' || !SOUND_FILENAME_PATTERN.test(filename)) {
    return null;
  }
  return `genesis-sound://local/${encodeURIComponent(filename)}`;
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveTimerSettings: (settings) => ipcRenderer.invoke('save-timer-settings', settings),
  getSoundUrl,
  getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),
});
