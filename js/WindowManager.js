// WindowManager.js
const { BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { applyZoom, stepZoom, ZOOM_STEP, zoomPercent } = require('./ZoomController');
const { sameOrigin } = require('./origin');
const { GAME_URL, GAME_ORIGIN } = require('./game');

// Only these schemes may be handed to the operating system
const SAFE_EXTERNAL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

// Open a URL in the user's default browser, but only for safe schemes.
// Untrusted page content must never be able to reach arbitrary OS protocol handlers.
function openExternalSafely(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return; // Ignore malformed URLs
  }
  if (!SAFE_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
    return;
  }
  shell.openExternal(url);
}

// Function to initialize button panel, timer manager, sound manager, and MUD connector
function initializeButtonPanelAndTimers(win, settings) {
  // Read the class files
  const commandSenderCode = fs.readFileSync(path.join(__dirname, 'CommandSender.js'), 'utf8');
  const pageToastCode = fs.readFileSync(path.join(__dirname, 'PageToast.js'), 'utf8');
  const buttonPanelCode = fs.readFileSync(path.join(__dirname, 'ButtonPanel.js'), 'utf8');
  const timerManagerCode = fs.readFileSync(path.join(__dirname, 'TimerManager.js'), 'utf8');
  const soundManagerCode = fs.readFileSync(path.join(__dirname, 'SoundManager.js'), 'utf8');
  const mudConnectorCode = fs.readFileSync(path.join(__dirname, 'MudConnector.js'), 'utf8');
  
  return win.webContents.executeJavaScript(`
    // Shared helpers (must be defined before the classes that use them)
    ${pageToastCode}
    ${commandSenderCode}
    
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
    this.webClientBridge = null;
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

    // Load Genesis web client
    this.win.loadURL(GAME_URL);

    // Apply the saved zoom level (affects game text size)
    applyZoom(this.win, settings.ui.zoomLevel ?? 0);

    // Build the menu now so the zoom percentage reflects the applied level.
    this.refreshMenu();

    // Ctrl + mouse wheel emits 'zoom-changed'; Electron does not apply the
    // zoom itself, so step and remember it here.
    this.setupZoomHandler();

    // Set up settings change listener
    this.setupSettingsListener();

    // Set up page load handler
    this.setupPageLoadHandler(settings);

    // Set up navigation handlers
    this.setupNavigationHandlers();

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
      // Re-apply the saved zoom after navigation: Chromium restores its own
      // per-host zoom level on load, which can override the value set at create.
      applyZoom(this.win, settings.ui.zoomLevel ?? 0);

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
      initializeButtonPanelAndTimers(this.win, settings)
        .then(() => this.checkWebClientBridge())
        .catch(err => {
          console.error('Failed to initialize button panel:', err);
        });
    });
  }

  // Report whether the command bridge injected by WebClientHook.js made it into
  // the page. Buttons, hotkeys and timers use it to run the web client's aliases.
  checkWebClientBridge() {
    if (!this.win || this.win.isDestroyed?.()) {
      return;
    }

    this.win.webContents
      .executeJavaScript(`
        ({
          genesisClient: typeof window.genesisClient !== 'undefined',
          methods: window.genesisClient ? Object.keys(window.genesisClient) : []
        })
      `)
      .then((status) => {
        if (!status) {
          return;
        }
        this.webClientBridge = status;
        if (!status.genesisClient) {
          console.warn(
            'Genesis client bridge was not injected; commands will use the fallback send path.',
          );
        } else {
          console.log('🧩 Genesis client bridge:', status);
        }
      })
      .catch(() => {
        // Ignore if the page is navigating or the window is gone.
      });
  }

  setupNavigationHandlers() {
    // Open all new windows/links in the external browser
    this.win.webContents.setWindowOpenHandler(({ url }) => {
      openExternalSafely(url);
      return { action: 'deny' };
    });

    // Prevent unexpected navigations away from Genesis
    this.win.webContents.on('will-navigate', (event, url) => {
      // Compare parsed origins exactly so look-alike domains
      // (e.g. https://www.genesismud.org.attacker.example) are rejected.
      if (!sameOrigin(url, GAME_ORIGIN)) {
        event.preventDefault();
        openExternalSafely(url);
      }
    });
  }

  setupCloseHandler() {
    this.win.on('closed', () => {
      this.findBarManager.close();
    });
  }

  setupZoomHandler() {
    let lastZoomAt = 0;
    this.win.webContents.on('zoom-changed', (_event, direction) => {
      // Collapse burst/duplicate events so one wheel notch is one step.
      const now = Date.now();
      if (now - lastZoomAt < 50) {
        return;
      }
      lastZoomAt = now;
      stepZoom(this.settingsManager, this.win, direction === 'in' ? ZOOM_STEP : -ZOOM_STEP);
      this.showZoomBadge();
    });
  }

  // Show a boxed zoom-percentage badge in the top-right of the game window,
  // fading out shortly after the last change.
  showZoomBadge() {
    const percent = zoomPercent(this.settingsManager.get('ui.zoomLevel') ?? 0);
    this.win.webContents.executeJavaScript(
      `if (window.pageToast) { window.pageToast('${percent}%'); }`,
    ).catch(() => {
      // Ignore if the page is not ready.
    });
  }

  // Rebuild the application menu so the top-level zoom percentage stays current.
  refreshMenu() {
    const findBar = this.findBarManager ? this.findBarManager.get() : null;
    const menu = this.menuBuilder.createMenu(this.win, findBar);
    Menu.setApplicationMenu(menu);
  }

  setupFindBar() {
    if (this.findBarManager) {
      // Create the find bar
      this.findBarManager.create();
      this.findBarManager.setupIPCHandlers();

      // Update the menu with find bar reference
      this.refreshMenu();
    }
  }

  getWindow() {
    return this.win;
  }
}

module.exports = { WindowManager, initializeButtonPanelAndTimers, GAME_URL, GAME_ORIGIN, openExternalSafely };
