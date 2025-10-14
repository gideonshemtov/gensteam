// settings/settings-preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    getSchema: () => ipcRenderer.invoke('settings:getSchema'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
    reset: () => ipcRenderer.invoke('settings:reset'),
    resetSection: (section) => ipcRenderer.invoke('settings:resetSection', section),
    exportJson: () => ipcRenderer.invoke('settings:exportJson'),
    importJson: (jsonString) => ipcRenderer.invoke('settings:importJson', jsonString),
    getPath: () => ipcRenderer.invoke('settings:getPath')
  },
  
  // Sound testing API for settings window
  playSound: (filename, volume = 1.0) => ipcRenderer.invoke('play-sound', filename, volume),
  getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),
  
  // Window control
  closeWindow: () => ipcRenderer.invoke('window:close'),
  onCloseRequested: (callback) => ipcRenderer.on('window:close-requested', callback),
  forceClose: () => ipcRenderer.invoke('window:force-close')
});
