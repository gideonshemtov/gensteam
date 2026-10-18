// settings/settings-preload.js
const { contextBridge, ipcRenderer } = require('electron');

const SOUND_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.(wav|mp3|ogg|m4a|aac|flac)$/i;

function getSoundUrl(filename) {
  if (typeof filename !== 'string' || !SOUND_FILENAME_PATTERN.test(filename)) {
    return null;
  }
  return `genesis-sound://local/${encodeURIComponent(filename)}`;
}

contextBridge.exposeInMainWorld('electronAPI', {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    getSchema: () => ipcRenderer.invoke('settings:getSchema'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
    reset: () => ipcRenderer.invoke('settings:reset'),
    resetSection: (section) => ipcRenderer.invoke('settings:resetSection', section),
    exportJson: () => ipcRenderer.invoke('settings:exportJson'),
    importJson: (jsonString) => ipcRenderer.invoke('settings:importJson', jsonString),
    getPath: () => ipcRenderer.invoke('settings:getPath'),
  },

  getSoundUrl,
  getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),

  hotkeys: {
    record: (descriptor) => ipcRenderer.invoke('hotkeys:record', descriptor),
  },

  // Section markup partials (settings/sections/<name>.html), read by the main
  // process because the renderer is sandboxed.
  getPartial: (name) => ipcRenderer.invoke('settings:getPartial', name),

  closeWindow: () => ipcRenderer.invoke('window:close'),
  onCloseRequested: (callback) => ipcRenderer.on('window:close-requested', callback),
  forceClose: () => ipcRenderer.invoke('window:force-close'),
});
