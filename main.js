// main.js
const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

const START_URL = 'https://www.genesismud.org/play';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      // Keep the remote site sandboxed for safety
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Load Genesis web client
  win.loadURL(START_URL);

  // Disable beforeunload handlers that might prevent closing
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      // Override beforeunload to prevent it from blocking window close
      window.addEventListener('beforeunload', function(e) {
        e.preventDefault = function() {};
        delete e.returnValue;
      }, true);
      
      // Also override the onbeforeunload property
      window.onbeforeunload = null;
    `);
  });

  // Open all new windows/links in the external browser (not inside the app)
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent unexpected navigations away from Genesis; open externals outside
  win.webContents.on('will-navigate', (event, url) => {
    const allowedOrigin = new URL(START_URL).origin;
    if (!url.startsWith(allowedOrigin)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  return win;
}

app.whenReady().then(() => {
  // Deny any permission prompts by default (camera/mic/etc.)
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

