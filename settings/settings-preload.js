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
  }
});
