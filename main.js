// main.js
const { app, BrowserWindow, shell, session, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const SettingsManager = require('./settings/SettingsManager');
const SettingsWindow = require('./settings/SettingsWindow');

// Initialize settings manager
let settingsManager;
let settingsWindow;
let isUpdatingMenu = false; // Flag to prevent recursive menu updates

const START_URL = 'https://www.genesismud.org/play';

// Function to initialize button panel, timer manager, sound manager, and MUD introspector
function initializeButtonPanelAndTimers(win, settings) {
  // Read the ButtonPanel, TimerManager, SoundManager, and MudConnector class files
  const buttonPanelCode = require('fs').readFileSync(path.join(__dirname, 'js/ButtonPanel.js'), 'utf8');
  const timerManagerCode = require('fs').readFileSync(path.join(__dirname, 'js/TimerManager.js'), 'utf8');
  const soundManagerCode = require('fs').readFileSync(path.join(__dirname, 'js/SoundManager.js'), 'utf8');
  const mudConnectorCode = require('fs').readFileSync(path.join(__dirname, 'js/MudConnector.js'), 'utf8');
  
  return win.webContents.executeJavaScript(`
    // Load TimerManager class first
    ${timerManagerCode}
    
    // Load SoundManager class
    ${soundManagerCode}
    
    // Load ButtonPanel class
    ${buttonPanelCode}
    
    // Load MudConnector class
    ${mudConnectorCode}
    
    // Initialize MUD connector first (to analyze the page)
    window.mudConnector = new MudConnector();
    window.mudConnector.init();
    
    // Initialize sound manager
    window.soundManager = new SoundManager(${JSON.stringify(settings)});
    
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
}

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
            if (isUpdatingMenu) return; // Prevent recursive updates
            
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
            
            // Update menu immediately for this specific change
            isUpdatingMenu = true;
            setTimeout(() => {
              try {
                const menu = createMenu(win);
                Menu.setApplicationMenu(menu);
              } finally {
                isUpdatingMenu = false;
              }
            }, 10);
          }
        },
        {
          label: 'Hide Menu Bar (Press Alt to show)',
          type: 'checkbox',
          checked: settings.ui.hideMenuBar,
          click: () => {
            if (isUpdatingMenu) return; // Prevent recursive updates
            
            const currentValue = settingsManager.get('ui.hideMenuBar');
            const newValue = !currentValue;
            settingsManager.set('ui.hideMenuBar', newValue);
            
            // Apply the change immediately without updating the full menu
            win.setAutoHideMenuBar(newValue);
            if (newValue) {
              win.setMenuBarVisibility(false);
            } else {
              win.setMenuBarVisibility(true);
            }
            
            // Don't update menu for menu bar changes - it causes loops
            // The setting is persisted, menu will be correct on next app start
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
            
            // Re-setup everything after reload
            win.webContents.once('did-finish-load', () => {
              // Get current settings
              const currentSettings = settingsManager.get();
              
              win.webContents.executeJavaScript(`
                // Override beforeunload to prevent it from blocking window close
                window.addEventListener('beforeunload', function(e) {
                  e.preventDefault = function() {};
                  delete e.returnValue;
                }, true);
                
                // Also override the onbeforeunload property
                window.onbeforeunload = null;
              `).catch(err => {
                console.error('Failed to setup beforeunload handlers after reload:', err);
              });
              
              // Reinitialize button panel and timer manager after a short delay
              setTimeout(() => {
                initializeButtonPanelAndTimers(win, currentSettings).then(() => {
                  // Update the menu to reflect current settings after button panel is initialized
                  setTimeout(() => {
                    if (!isUpdatingMenu) {
                      isUpdatingMenu = true;
                      try {
                        const menu = createMenu(win);
                        Menu.setApplicationMenu(menu);
                      } finally {
                        isUpdatingMenu = false;
                      }
                    }
                  }, 500);
                }).catch(err => {
                  console.error('Failed to reinitialize button panel after reload:', err);
                });
              }, 100);
            });
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
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const { dialog } = require('electron');
            const packageJson = require('./package.json');
            
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'GenesisClient',
              message: `GenesisClient v${packageJson.version}`,
              detail: `${packageJson.description}\n\nA desktop wrapper for Genesis MUD built with Electron.\n\nAuthor: ${packageJson.author}\nLicense: ${packageJson.license}`,
              buttons: ['OK'],
              defaultId: 0,
              icon: path.join(__dirname, 'assets/icon.png')
            });
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
    // Update menu bar visibility if setting changed
    if (newSettings.ui.hideMenuBar !== oldSettings.ui.hideMenuBar) {
      win.setAutoHideMenuBar(newSettings.ui.hideMenuBar);
      // Force menu bar to update immediately
      if (newSettings.ui.hideMenuBar) {
        win.setMenuBarVisibility(false);
      } else {
        win.setMenuBarVisibility(true);
      }
      
      // Don't update the menu itself - just the visibility
      // The menu checkbox state will be correct on next access
    }

    // Update button panel with new settings
    win.webContents.executeJavaScript(`
      if (typeof window.buttonPanel !== 'undefined' && window.buttonPanel.isInitialized) {
        window.buttonPanel.updateSettings(${JSON.stringify(newSettings)});
      }
      if (typeof window.soundManager !== 'undefined') {
        window.soundManager.updateSettings(${JSON.stringify(newSettings)});
      }
    `).catch(() => {
      // Ignore errors if page not ready
    });
  });

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
    
    // Initialize button panel and timer manager
    initializeButtonPanelAndTimers(win, settings).catch(err => {
      console.error('Failed to initialize button panel:', err);
    });
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

  // Close settings window when main window is closed
  win.on('closed', () => {
    if (settingsWindow && settingsWindow.isOpen()) {
      settingsWindow.close();
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
      // Save timer settings without triggering full UI updates
      const fs = require('fs');
      const settingsPath = settingsManager.getSettingsPath();
      
      // Validate the settings first
      if (settingsManager.validate && !settingsManager.validate(newSettings)) {
        throw new Error('Invalid timer settings');
      }
      
      // Write settings directly to avoid subscriber loops
      fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
      
      // Update the in-memory settings without triggering subscribers
      settingsManager.settings = newSettings;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save timer settings:', error);
      return { success: false, error: error.message };
    }
  });

  // Set up IPC handlers for sound functionality
  ipcMain.handle('play-sound', async (event, filename, volume = 1.0) => {
    try {
      const soundPath = path.join(__dirname, 'assets', 'sounds', filename);
      
      // Check if file exists
      if (!fs.existsSync(soundPath)) {
        console.warn(`Sound file not found: ${soundPath}`);
        return false;
      }

      // Get current sound settings
      const soundSettings = settingsManager.get('sounds');
      if (!soundSettings?.enabled) {
        console.log('Sounds are disabled in settings');
        return false;
      }

      // Calculate final volume (individual volume * master volume)
      const finalVolume = Math.min(1.0, volume * (soundSettings.masterVolume || 1.0));

      // Play the sound using shell command (works on most systems)
      const { exec } = require('child_process');
      let command;
      
      if (process.platform === 'win32') {
        // Windows - use built-in media player
        command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
      } else if (process.platform === 'darwin') {
        // macOS - use afplay
        command = `afplay "${soundPath}" -v ${finalVolume}`;
      } else {
        // Linux - try multiple players
        command = `paplay "${soundPath}" || aplay "${soundPath}" || ffplay -nodisp -autoexit "${soundPath}" 2>/dev/null || echo "No audio player available"`;
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Sound playback error: ${error.message}`);
        }
      });

      console.log(`🔊 Playing sound: ${filename} at volume ${finalVolume}`);
      return true;
    } catch (error) {
      console.error('Failed to play sound:', error);
      return false;
    }
  });

  ipcMain.handle('get-available-sounds', async () => {
    try {
      const soundsDir = path.join(__dirname, 'assets', 'sounds');
      if (!fs.existsSync(soundsDir)) {
        return [];
      }

      const files = fs.readdirSync(soundsDir);
      const soundFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.wav', '.mp3', '.ogg', '.m4a', '.aac', '.flac'].includes(ext);
      });

      return soundFiles;
    } catch (error) {
      console.error('Failed to get available sounds:', error);
      return [];
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

