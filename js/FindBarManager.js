// FindBarManager.js
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class FindBarManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.findBar = null;
  }

  create() {
    if (this.findBar) return this.findBar;
    
    if (!this.mainWindow) {
      throw new Error('FindBarManager: mainWindow must be set before creating find bar');
    }
    
    const mainBounds = this.mainWindow.getBounds();
    
    this.findBar = new BrowserWindow({
      parent: this.mainWindow,
      width: 400,
      height: 50,
      x: mainBounds.width - 420,
      y: 10,
      frame: false,
      transparent: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    
    this.findBar.loadFile(path.join(__dirname, '..', 'find-bar.html'));
    this.findBar.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    // Reposition find bar when main window moves or resizes
    const updateFindBarPosition = () => {
      if (this.findBar && !this.findBar.isDestroyed()) {
        const bounds = this.mainWindow.getBounds();
        this.findBar.setBounds({
          x: bounds.x + bounds.width - 420,
          y: bounds.y + 10,
          width: 400,
          height: 50,
        });
      }
    };
    
    this.mainWindow.on('move', updateFindBarPosition);
    this.mainWindow.on('resize', updateFindBarPosition);
    
    return this.findBar;
  }

  setupIPCHandlers() {
    // Set up find in page IPC handlers
    ipcMain.on('find-in-page', (event, text, options) => {
      if (text) {
        this.mainWindow.webContents.findInPage(text, options || {});
      } else {
        this.mainWindow.webContents.stopFindInPage('clearSelection');
      }
    });

    ipcMain.on('stop-find-in-page', (event, action) => {
      this.mainWindow.webContents.stopFindInPage(action || 'clearSelection');
    });

    ipcMain.on('hide-find-bar', () => {
      if (this.findBar && !this.findBar.isDestroyed()) {
        this.findBar.hide();
      }
    });

    this.mainWindow.webContents.on('found-in-page', (event, result) => {
      if (this.findBar && !this.findBar.isDestroyed()) {
        this.findBar.webContents.send('found-in-page', result);
      }
    });
  }

  close() {
    if (this.findBar && !this.findBar.isDestroyed()) {
      this.findBar.close();
    }
  }

  get() {
    return this.findBar;
  }
}

module.exports = FindBarManager;
