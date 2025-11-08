// WindowManager.js
const { BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Function to initialize button panel, timer manager, sound manager, and MUD connector
function initializeButtonPanelAndTimers(win, settings) {
  // Read the class files
  const buttonPanelCode = fs.readFileSync(path.join(__dirname, 'ButtonPanel.js'), 'utf8');
  const timerManagerCode = fs.readFileSync(path.join(__dirname, 'TimerManager.js'), 'utf8');
  const soundManagerCode = fs.readFileSync(path.join(__dirname, 'SoundManager.js'), 'utf8');
  const mudConnectorCode = fs.readFileSync(path.join(__dirname, 'MudConnector.js'), 'utf8');
  
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

class WindowManager {
  constructor(settingsManager, menuBuilder, findBarManager) {
    this.settingsManager = settingsManager;
    this.menuBuilder = menuBuilder;
    this.findBarManager = findBarManager;
    this.win = null;
  }

  create() {
    const settings = this.settingsManager.get();
    
    this.win = new BrowserWindow({
      width: settings.window.width,
      height: settings.window.height,
      backgroundColor: '#000000',
      autoHideMenuBar: settings.ui.hideMenuBar,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, '..', 'timer-preload.js')
      },
    });

    // Maximize the window on start
    this.win.maximize();

    // Set up the menu (find bar will be set up later)
    const menu = this.menuBuilder.createMenu(this.win, null);
    Menu.setApplicationMenu(menu);

    // Load Genesis web client
    this.win.loadURL(settings.game.startUrl);

    // Set up settings change listener
    this.setupSettingsListener();

    // Set up page load handler
    this.setupPageLoadHandler(settings);

    // Set up navigation handlers
    this.setupNavigationHandlers(settings);

    // Set up window close handler
    this.setupCloseHandler();

    return this.win;
  }

  setupSettingsListener() {
    this.settingsManager.subscribe((newSettings, oldSettings) => {
      // Update menu bar visibility if setting changed
      if (newSettings.ui.hideMenuBar !== oldSettings.ui.hideMenuBar) {
        this.win.setAutoHideMenuBar(newSettings.ui.hideMenuBar);
        if (newSettings.ui.hideMenuBar) {
          this.win.setMenuBarVisibility(false);
        } else {
          this.win.setMenuBarVisibility(true);
        }
      }

      // Update button panel with new settings
      this.win.webContents.executeJavaScript(`
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
  }

  setupPageLoadHandler(settings) {
    this.win.webContents.once('did-finish-load', () => {
      this.win.webContents.executeJavaScript(`
        // Override beforeunload to prevent it from blocking window close
        window.addEventListener('beforeunload', function(e) {
          e.preventDefault = function() {};
          delete e.returnValue;
        }, true);
        
        // Also override the onbeforeunload property
        window.onbeforeunload = null;
      `);
      
      // Initialize button panel and timer manager
      initializeButtonPanelAndTimers(this.win, settings).catch(err => {
        console.error('Failed to initialize button panel:', err);
      });
    });
  }

  setupNavigationHandlers(settings) {
    // Open all new windows/links in the external browser
    this.win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Prevent unexpected navigations away from Genesis
    this.win.webContents.on('will-navigate', (event, url) => {
      const allowedOrigin = new URL(settings.game.startUrl).origin;
      if (!url.startsWith(allowedOrigin)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  }

  setupCloseHandler() {
    this.win.on('closed', () => {
      this.findBarManager.close();
    });
  }

  setupFindBar() {
    if (this.findBarManager) {
      // Create the find bar
      this.findBarManager.create();
      this.findBarManager.setupIPCHandlers();

      // Update the menu with find bar reference
      const menu = this.menuBuilder.createMenu(this.win, this.findBarManager.get());
      Menu.setApplicationMenu(menu);
    }
  }

  getWindow() {
    return this.win;
  }
}

module.exports = { WindowManager, initializeButtonPanelAndTimers };
