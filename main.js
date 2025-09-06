// main.js
const { app, BrowserWindow, shell, session, Menu } = require('electron');
const path = require('path');
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
              (function() {
                const buttonBar = document.getElementById('custom-button-bar');
                const mainDiv = document.getElementById('main');
                if (buttonBar && mainDiv) {
                  if (${!currentValue}) {
                    buttonBar.style.display = 'flex';
                    mainDiv.style.width = 'calc(60% - ${settings.ui.buttonPanelWidth}px)';
                    mainDiv.style.marginLeft = '${settings.ui.buttonPanelWidth}px';
                  } else {
                    buttonBar.style.display = 'none';
                    mainDiv.style.width = '60%';
                    mainDiv.style.marginLeft = '0px';
                  }
                }
              })();
            `).catch(err => {
              console.error('Failed to toggle button panel:', err);
            });
            
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
    autoHideMenuBar: false, // Show menu bar so users can access preferences
    webPreferences: {
      // Keep the remote site sandboxed for safety
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
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

    // Update button panel in renderer if settings changed
    win.webContents.executeJavaScript(`
      if (typeof updateButtonsFromSettings === 'function') {
        updateButtonsFromSettings(${JSON.stringify(newSettings)});
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
      
      // Add custom button bar after page loads
      function addCustomButtonBar(settingsOverride) {
        // Check if button bar already exists
        if (document.getElementById('custom-button-bar')) {
          return;
        }
        
        const currentSettings = settingsOverride || ${JSON.stringify(settings)};
        const clientDiv = document.getElementById('client');
        const mainDiv = document.getElementById('main');
        
        if (clientDiv && mainDiv) {
          // Create the vertical button bar container
          const buttonBar = document.createElement('div');
          buttonBar.id = 'custom-button-bar';
          buttonBar.style.cssText = \`
            position: absolute;
            left: 8px;
            top: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.9);
            padding: 6px 2px 6px 2px;
            border-radius: 6px;
            border: 1px solid #555;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
            width: \${currentSettings.ui.buttonPanelWidth}px;
          \`;
          
          // Add the button bar to the body (fixed positioning)
          document.body.appendChild(buttonBar);
          
          // Create buttons using the shared function
          createButtons(buttonBar, currentSettings.buttons.customButtons, currentSettings);
          
          // Set initial state based on settings
          if (currentSettings.ui.showButtonPanel) {
            buttonBar.style.display = 'flex';
            mainDiv.style.width = \`calc(60% - \${currentSettings.ui.buttonPanelWidth}px)\`;
            mainDiv.style.marginLeft = \`\${currentSettings.ui.buttonPanelWidth}px\`;
          } else {
            buttonBar.style.display = 'none';
            mainDiv.style.width = '60%';
            mainDiv.style.marginLeft = '0px';
          }
        } else {
          setTimeout(() => addCustomButtonBar(settingsOverride), 500);
        }
      }

      // Function to create buttons (moved outside addCustomButtonBar for reusability)
      function createButtons(buttonBar, buttons, settings) {
        buttonBar.innerHTML = '';
        buttons.forEach((btnConfig, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.id = \`custom-btn-\${index}\`;
          button.title = btnConfig.title;
          button.innerHTML = \`\${btnConfig.icon}\`;
          
          // Base button styling
          button.style.cssText = \`
            width: \${settings.ui.buttonPanelWidth - 4}px;
            height: \${settings.ui.buttonPanelWidth - 4}px;
            background: #333;
            color: #fff;
            border: 2px solid \${btnConfig.color};
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          \`;
          
          // Add click event handler
          button.addEventListener('click', function() {
            const input = document.getElementById('input');
            if (input) {
              input.value = btnConfig.command;
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
              });
              input.dispatchEvent(enterEvent);
            }
            
            // Visual feedback
            const originalBg = button.style.background;
            button.style.background = btnConfig.color;
            button.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
              button.style.background = originalBg;
              button.style.transform = 'scale(1)';
            }, 200);
          });
          
          // Hover effects
          button.addEventListener('mouseenter', function() {
            button.style.background = btnConfig.color;
            button.style.transform = 'scale(1.05)';
          });
          
          button.addEventListener('mouseleave', function() {
            button.style.background = '#333';
            button.style.transform = 'scale(1)';
          });
          
          buttonBar.appendChild(button);
        });
      }

      // Function to update buttons from settings changes
      window.updateButtonsFromSettings = function(newSettings) {
        const buttonBar = document.getElementById('custom-button-bar');
        const mainDiv = document.getElementById('main');
        
        if (!buttonBar || !mainDiv) {
          // If button bar doesn't exist, recreate it
          setTimeout(() => addCustomButtonBar(newSettings), 100);
          return;
        }
        
        // Update visibility and layout
        if (newSettings.ui.showButtonPanel) {
          buttonBar.style.display = 'flex';
          mainDiv.style.width = \`calc(60% - \${newSettings.ui.buttonPanelWidth}px)\`;
          mainDiv.style.marginLeft = \`\${newSettings.ui.buttonPanelWidth}px\`;
          
          // Update button panel width
          buttonBar.style.width = \`\${newSettings.ui.buttonPanelWidth}px\`;
          
          // Recreate buttons with new settings
          createButtons(buttonBar, newSettings.buttons.customButtons, newSettings);
        } else {
          buttonBar.style.display = 'none';
          mainDiv.style.width = '60%';
          mainDiv.style.marginLeft = '0px';
        }
      };
      
      // Wait a bit for the page to fully render, then add the button bar
      setTimeout(addCustomButtonBar, 1500);
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

