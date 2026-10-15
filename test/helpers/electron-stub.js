// Minimal `electron` stub so main-process modules can be unit tested in plain Node.
// The test runner loads each file in its own process, so patching `require` here
// does not leak into other test files.
const Module = require('module');
const os = require('os');

const openExternalCalls = [];
const ipcHandlers = new Map();
const loadedUrls = [];

class BrowserWindow {
  constructor(options) {
    this.options = options;
    this.webContents = {
      on: () => {},
      once: () => {},
      setWindowOpenHandler: () => {},
      executeJavaScript: () => Promise.resolve(),
    };
  }
  maximize() {}
  loadURL(url) {
    loadedUrls.push(url);
  }
  on() {}
  setAutoHideMenuBar() {}
  setMenuBarVisibility() {}
}

const electronStub = {
  app: {
    getPath: () => os.tmpdir(),
    whenReady: () => Promise.resolve(),
    on: () => {},
  },
  BrowserWindow,
  Menu: { setApplicationMenu: () => {} },
  shell: {
    openExternal: (url) => {
      openExternalCalls.push(url);
    },
  },
  ipcMain: {
    handle: (channel, handler) => {
      ipcHandlers.set(channel, handler);
    },
    on: (channel, handler) => {
      ipcHandlers.set(channel, handler);
    },
  },
  contextBridge: { exposeInMainWorld: () => {} },
  ipcRenderer: { invoke: () => Promise.resolve({ success: true }) },
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'electron') {
    return electronStub;
  }
  return originalRequire.apply(this, arguments);
};

module.exports = { electronStub, openExternalCalls, ipcHandlers, loadedUrls };
