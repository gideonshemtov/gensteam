// main.js
const { app, BrowserWindow, shell, session, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const SettingsManager = require('./settings/SettingsManager');
const SettingsWindow = require('./settings/SettingsWindow');

// Initialize settings manager
let settingsManager;
let settingsWindow;

const START_URL = 'https://www.genesismud.org/play';

// Create menu template
function createMenu(win) {
  const settings = settingsManager.get();
  
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Show Button Panel',
          type: 'checkbox',
          checked: settings.ui.showButtonPanel,
          click: () => {
            const currentValue = settingsManager.get('ui.showButtonPanel');
            settingsManager.set('ui.showButtonPanel', !currentValue);
            
            // Toggle the button panel visibility
            win.webContents.executeJavaScript(`
              if (typeof window.buttonPanel !== 'undefined') {
                window.buttonPanel.settings.ui.showButtonPanel = ${!currentValue};
                window.buttonPanel.updateLayout();
              }
            `).catch(err => {
              console.error('Failed to toggle button panel:', err);
            });
            
            // Update the menu item
            const menu = createMenu(win);
            Menu.setApplicationMenu(menu);
          }
        },
        {
          label: 'Hide Menu Bar',
          type: 'checkbox',
          checked: settings.ui.hideMenuBar,
          click: () => {
            const currentValue = settingsManager.get('ui.hideMenuBar');
            const newValue = !currentValue;
            settingsManager.set('ui.hideMenuBar', newValue);
            
            // Apply the change immediately
            win.setAutoHideMenuBar(newValue);
            if (newValue) {
              win.setMenuBarVisibility(false);
            } else {
              win.setMenuBarVisibility(true);
            }
            
            // Update the menu item
            const menu = createMenu(win);
            Menu.setApplicationMenu(menu);
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
          click: () => {
            if (!settingsWindow.isOpen()) {
              settingsWindow.create();
            } else {
              settingsWindow.window.focus();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            win.reload();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            win.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            win.minimize();
          }
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            win.close();
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => {
            if (!settingsWindow.isOpen()) {
              settingsWindow.create();
            } else {
              settingsWindow.window.focus();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    });
  }

  return Menu.buildFromTemplate(template);
}

function createWindow() {
  const settings = settingsManager.get();
  
  const win = new BrowserWindow({
    width: settings.window.width,
    height: settings.window.height,
    backgroundColor: '#000000',
    autoHideMenuBar: settings.ui.hideMenuBar, // Use setting to control menu bar visibility
    webPreferences: {
      // Keep the remote site sandboxed for safety
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'timer-preload.js')
    },
  });

  // Set up the menu
  const menu = createMenu(win);
  Menu.setApplicationMenu(menu);

  // Load Genesis web client
  win.loadURL(settings.game.startUrl);

  // Listen for settings changes to update UI
  settingsManager.subscribe((newSettings, oldSettings) => {
    // Update menu if button panel setting changed
    if (newSettings.ui.showButtonPanel !== oldSettings.ui.showButtonPanel) {
      const menu = createMenu(win);
      Menu.setApplicationMenu(menu);
    }

    // Update menu bar visibility if setting changed
    if (newSettings.ui.hideMenuBar !== oldSettings.ui.hideMenuBar) {
      win.setAutoHideMenuBar(newSettings.ui.hideMenuBar);
      // Force menu bar to update immediately
      if (newSettings.ui.hideMenuBar) {
        win.setMenuBarVisibility(false);
      } else {
        win.setMenuBarVisibility(true);
      }
    }

    // Update button panel with new settings
    win.webContents.executeJavaScript(`
      if (typeof window.buttonPanel !== 'undefined' && window.buttonPanel.isInitialized) {
        window.buttonPanel.updateSettings(${JSON.stringify(newSettings)});
      }
    `).catch(() => {
      // Ignore errors if page not ready
    });
  });

  // Disable beforeunload handlers that might prevent closing
  win.webContents.once('did-finish-load', () => {
    // Read the ButtonPanel and TimerManager class files
    const buttonPanelCode = require('fs').readFileSync(path.join(__dirname, 'js/ButtonPanel.js'), 'utf8');
    const timerManagerCode = require('fs').readFileSync(path.join(__dirname, 'js/TimerManager.js'), 'utf8');
    
    win.webContents.executeJavaScript(`
      // Override beforeunload to prevent it from blocking window close
      window.addEventListener('beforeunload', function(e) {
        e.preventDefault = function() {};
        delete e.returnValue;
      }, true);
      
      // Also override the onbeforeunload property
      window.onbeforeunload = null;
      
      // Load TimerManager class first
      ${timerManagerCode}
      
      // Load ButtonPanel class
      ${buttonPanelCode}
      
      // Initialize button panel
      window.buttonPanel = new ButtonPanel();
      
      // Wait for page to be ready, then initialize
      function initButtonPanel() {
        const clientDiv = document.getElementById('client');
        const mainDiv = document.getElementById('main');
        
        if (clientDiv && mainDiv) {
          window.buttonPanel.init(${JSON.stringify(settings)});
        } else {
          setTimeout(initButtonPanel, 500);
        }
      }
      
      setTimeout(initButtonPanel, 10);
    `);
  });

  // Open all new windows/links in the external browser (not inside the app)
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent unexpected navigations away from Genesis; open externals outside
  win.webContents.on('will-navigate', (event, url) => {
    const allowedOrigin = new URL(settings.game.startUrl).origin;
    if (!url.startsWith(allowedOrigin)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  return win;
}

app.whenReady().then(() => {
  // Initialize settings manager and settings window
  settingsManager = new SettingsManager();
  settingsWindow = new SettingsWindow(settingsManager);
  
  // Set up IPC handlers for timer settings
  ipcMain.handle('save-timer-settings', (event, newSettings) => {
    try {
      settingsManager.save(newSettings);
      return { success: true };
    } catch (error) {
      console.error('Failed to save timer settings:', error);
      return { success: false, error: error.message };
    }
  });
  
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

