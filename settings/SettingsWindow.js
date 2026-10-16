// settings/SettingsWindow.js
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Overlay injected into the game window while preferences are open, so the
// dimmed background signals that it is inactive. Uses DOM rather than
// setOpacity() because window opacity is not supported on Linux.
const INACTIVE_OVERLAY_ID = 'genesis-inactive-overlay';

function runInWindow(win, code) {
  if (!win || !win.webContents || win.isDestroyed?.()) {
    return;
  }
  win.webContents.executeJavaScript(code).catch(() => {
    // Ignore failures if the page is not ready or the window is gone.
  });
}

class SettingsWindow {
  constructor() {
    this.window = null;
    this.setupWindowHandlers();
  }

  setupWindowHandlers() {
    ipcMain.handle('window:close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.close();
      }
    });

    ipcMain.handle('window:force-close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.destroy();
      }
    });
  }

  create(parentWindow) {
    if (this.window) {
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      title: 'Genesis Client - Settings',
      autoHideMenuBar: true,
      // Behave like a modal dialog: block interaction with the game window
      // until preferences are closed.
      parent: parentWindow || undefined,
      modal: Boolean(parentWindow),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'settings-preload.js')
      }
    });

    // Load the settings UI
    this.window.loadFile(path.join(__dirname, 'settings.html'));

    // Dim the game window to show it is inactive.
    this.dimParent(parentWindow);

    // Handle window close attempt (before closing)
    this.window.on('close', (e) => {
      // Let the renderer handle unsaved changes
      e.preventDefault();
      this.window.webContents.send('window:close-requested');
    });

    // Handle window closed
    this.window.on('closed', () => {
      this.undimParent(parentWindow);
      this.window = null;
    });

    // Open dev tools in development
    if (process.env.NODE_ENV === 'development') {
      this.window.webContents.openDevTools();
    }

    return this.window;
  }

  dimParent(parentWindow) {
    runInWindow(parentWindow, `
      (function () {
        if (document.getElementById('${INACTIVE_OVERLAY_ID}')) return;
        const overlay = document.createElement('div');
        overlay.id = '${INACTIVE_OVERLAY_ID}';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '2147483647';
        overlay.style.background = 'rgba(0, 0, 0, 0.45)';
        overlay.style.pointerEvents = 'none';
        document.documentElement.appendChild(overlay);
      })();
    `);
  }

  undimParent(parentWindow) {
    runInWindow(parentWindow, `
      (function () {
        const overlay = document.getElementById('${INACTIVE_OVERLAY_ID}');
        if (overlay) overlay.remove();
      })();
    `);
  }

  close() {
    if (this.window) {
      this.window.close();
    }
  }

  isOpen() {
    return this.window && !this.window.isDestroyed();
  }
}

module.exports = SettingsWindow;

