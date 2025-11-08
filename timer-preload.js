// timer-preload.js - Preload script for timer IPC communication
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  saveTimerSettings: (settings) => ipcRenderer.invoke('save-timer-settings', settings),
  
  // Sound-related APIs
  playSound: (filename) => ipcRenderer.invoke('play-sound', filename),
  getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),
});
