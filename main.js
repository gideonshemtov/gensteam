// main.js
const { app, BrowserWindow, shell, session, Menu } = require('electron');
const path = require('path');

const START_URL = 'https://www.genesismud.org/play';

// Store preferences
let preferences = {
  showButtonPanel: true
};

// Create menu template
function createMenu(win) {
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Show Button Panel',
          type: 'checkbox',
          checked: preferences.showButtonPanel,
          click: () => {
            preferences.showButtonPanel = !preferences.showButtonPanel;
            // Toggle the button panel visibility
            win.webContents.executeJavaScript(`
              (function() {
                const buttonBar = document.getElementById('custom-button-bar');
                const mainDiv = document.getElementById('main');
                if (buttonBar && mainDiv) {
                  if (${preferences.showButtonPanel}) {
                    buttonBar.style.display = 'flex';
                    mainDiv.style.width = 'calc(60% - 50px)';
                    mainDiv.style.marginLeft = '50px';
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
            // Could open a preferences window here
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
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
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
      
      // Add custom button bar after page loads
      function addCustomButtonBar() {
        // Check if button bar already exists
        if (document.getElementById('custom-button-bar')) {
          return;
        }
        
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
            width: 38px;
          \`;
          
          // Button configurations with MUD commands
          const buttons = [
            {
              icon: '💎',
              title: 'Look Around',
              command: 'look',
              color: '#9C27B0'
            },
            {
              icon: '🔥',
              title: 'Check Inventory',
              command: 'inventory',
              color: '#FF5722'
            },
            {
              icon: '🪄',
              title: 'Check Stats',
              command: 'score',
              color: '#673AB7'
            },
            {
              icon: '❤️',
              title: 'Check Health',
              command: 'health',
              color: '#E91E63'
            },
            {
              icon: '⚡',
              title: 'Who Online',
              command: 'who',
              color: '#FFC107'
            }
          ];
          
          // Create each button
          buttons.forEach((btnConfig, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.id = \`custom-btn-\${index}\`;
            button.title = btnConfig.title;
            button.innerHTML = \`\${btnConfig.icon}\`;
            
            // Base button styling
            button.style.cssText = \`
              width: 38px;
              height: 38px;
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
              console.log(\`Button clicked: \${btnConfig.title} - Command: \${btnConfig.command}\`);
              
              // Use input simulation method (since that's what's working)
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
                console.log(\`Sent command: \${btnConfig.command}\`);
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
          
          // Add the button bar to the body (fixed positioning)
          document.body.appendChild(buttonBar);
          
          // Set initial state based on preferences
          // Note: Since this runs in renderer, we always start with buttons visible
          // The menu toggle will control visibility after creation
          mainDiv.style.width = 'calc(60% - 50px)';
          mainDiv.style.marginLeft = '50px';
          
          console.log('Custom button bar added successfully!');
        } else {
          console.log('Client or main div not found, retrying...');
          setTimeout(addCustomButtonBar, 500);
        }
      }
      
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

