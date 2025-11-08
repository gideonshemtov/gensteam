// MenuBuilder.js
const { Menu, dialog, app } = require('electron');
const path = require('path');

class MenuBuilder {
  constructor(settingsManager, settingsWindow) {
    this.settingsManager = settingsManager;
    this.settingsWindow = settingsWindow;
    this.isUpdatingMenu = false;
  }

  createMenu(win, findBar) {
    const settings = this.settingsManager.get();
    
    const template = [
      {
        label: 'View',
        submenu: [
          {
            label: 'Show Button Panel',
            type: 'checkbox',
            checked: settings.ui.showButtonPanel,
            click: () => {
              if (this.isUpdatingMenu) return;
              
              const currentValue = this.settingsManager.get('ui.showButtonPanel');
              this.settingsManager.set('ui.showButtonPanel', !currentValue);
              
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
              this.isUpdatingMenu = true;
              setTimeout(() => {
                try {
                  const menu = this.createMenu(win, findBar);
                  Menu.setApplicationMenu(menu);
                } finally {
                  this.isUpdatingMenu = false;
                }
              }, 10);
            }
          },
          {
            label: 'Hide Menu Bar (Press Alt to show)',
            type: 'checkbox',
            checked: settings.ui.hideMenuBar,
            click: () => {
              if (this.isUpdatingMenu) return;
              
              const currentValue = this.settingsManager.get('ui.hideMenuBar');
              const newValue = !currentValue;
              this.settingsManager.set('ui.hideMenuBar', newValue);
              
              // Apply the change immediately without updating the full menu
              win.setAutoHideMenuBar(newValue);
              if (newValue) {
                win.setMenuBarVisibility(false);
              } else {
                win.setMenuBarVisibility(true);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Find...',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
              if (!win || !findBar) return;
              if (findBar.isVisible()) {
                findBar.hide();
              } else {
                findBar.show();
                findBar.webContents.send('focus-input');
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences...',
            accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
            click: () => {
              if (!this.settingsWindow.isOpen()) {
                this.settingsWindow.create();
              } else {
                this.settingsWindow.window.focus();
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
                const currentSettings = this.settingsManager.get();
                
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
                  const { initializeButtonPanelAndTimers } = require('./WindowManager');
                  initializeButtonPanelAndTimers(win, currentSettings).then(() => {
                    // Update the menu to reflect current settings after button panel is initialized
                    setTimeout(() => {
                      if (!this.isUpdatingMenu) {
                        this.isUpdatingMenu = true;
                        try {
                          const menu = this.createMenu(win, findBar);
                          Menu.setApplicationMenu(menu);
                        } finally {
                          this.isUpdatingMenu = false;
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
              const packageJson = require('../package.json');
              
              dialog.showMessageBox(win, {
                type: 'info',
                title: 'GenesisClient',
                message: `GenesisClient v${packageJson.version}`,
                detail: `${packageJson.description}\n\nA desktop wrapper for Genesis MUD built with Electron.\n\nAuthor: ${packageJson.author}\nLicense: ${packageJson.license}`,
                buttons: ['OK'],
                defaultId: 0,
                icon: path.join(__dirname, '..', 'assets', 'icon.png')
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
              if (!this.settingsWindow.isOpen()) {
                this.settingsWindow.create();
              } else {
                this.settingsWindow.window.focus();
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
}

module.exports = MenuBuilder;
