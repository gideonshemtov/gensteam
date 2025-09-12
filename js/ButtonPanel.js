// ButtonPanel.js - Clean button panel management
class ButtonPanel {
  constructor() {
    this.panel = null;
    this.settings = null;
    this.isInitialized = false;
    this.timerManager = null;
    this.showingTimerPanel = false;
    this.clickOutsideHandler = null;
  }

  init(settings) {
    this.settings = settings;
    this.injectStyles();
    this.createPanel();
    this.updateLayout();
    
    // Initialize timer manager
    if (typeof TimerManager !== 'undefined') {
      this.timerManager = new TimerManager();
      this.timerManager.init(settings);
    }
    
    this.isInitialized = true;
  }

  injectStyles() {
    // Inject CSS if not already present
    if (!document.getElementById('button-panel-styles')) {
      const style = document.createElement('style');
      style.id = 'button-panel-styles';
      style.textContent = `
        .custom-button-bar {
          position: fixed;
          left: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.9);
          padding: 0.5rem;
          border-radius: 0.75rem;
          border: 1px solid #555;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .custom-button-bar.hidden {
          display: none !important;
        }

        .timer-panel {
          position: fixed;
          left: calc(var(--button-panel-width) + 1.5rem);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid #555;
          border-radius: 0.75rem;
          padding: 1rem;
          min-width: 300px;
          max-width: 400px;
          z-index: 1001;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
          color: #fff;
          font-size: 0.9rem;
        }

        .timer-panel.hidden {
          display: none !important;
        }

        .timer-panel h3 {
          margin: 0 0 1rem 0;
          color: #fff;
          font-size: 1.1rem;
          border-bottom: 1px solid #555;
          padding-bottom: 0.5rem;
        }

        .timer-controls {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          border: 1px solid #444;
        }

        .timer-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .timer-input-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .timer-input-row label {
          min-width: 80px;
          font-size: 0.85rem;
          color: #ccc;
        }

        .timer-input {
          flex: 1;
          padding: 0.4rem 0.6rem;
          background: #333;
          border: 1px solid #555;
          border-radius: 0.25rem;
          color: #fff;
          font-size: 0.85rem;
        }

        .timer-input:focus {
          outline: none;
          border-color: #007ACC;
          background: #404040;
        }

        .timer-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .timer-btn {
          padding: 0.4rem 0.8rem;
          border: 1px solid;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          flex: 1;
        }

        .timer-btn.primary {
          background: #007ACC;
          color: white;
          border-color: #007ACC;
        }

        .timer-btn.primary:hover {
          background: #005a9e;
        }

        .timer-btn.secondary {
          background: #666;
          color: white;
          border-color: #666;
        }

        .timer-btn.secondary:hover {
          background: #777;
        }

        .timer-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .timer-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #444;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .timer-item.active {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.1);
        }

        .timer-info {
          flex: 1;
          font-size: 0.8rem;
        }

        .timer-name {
          font-weight: bold;
          color: #fff;
        }

        .timer-details {
          color: #ccc;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .timer-item-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .timer-item-btn {
          padding: 0.2rem 0.4rem;
          font-size: 0.7rem;
          border: 1px solid;
          border-radius: 0.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .timer-item-btn.start {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .timer-item-btn.stop {
          background: #f44336;
          color: white;
          border-color: #f44336;
        }

        .timer-item-btn.delete {
          background: #9E9E9E;
          color: white;
          border-color: #9E9E9E;
        }

        .custom-button {
          background: #333;
          color: #fff;
          border: 2px solid;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          user-select: none;
          outline: none;
        }

        .custom-button:hover {
          transform: scale(1.05);
          background: var(--button-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .custom-button:active {
          transform: scale(0.95);
        }

        .game-content-adjusted {
          margin-left: calc(var(--button-panel-width) + 0.5rem) !important;
          width: calc(60% - var(--button-panel-width) - 2rem) !important;
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }

  createPanel() {
    // Remove existing panel
    const existing = document.getElementById('custom-button-bar');
    if (existing) existing.remove();

    // Create new panel
    this.panel = document.createElement('div');
    this.panel.id = 'custom-button-bar';
    this.panel.className = 'custom-button-bar';
    
    // Set CSS custom properties for dynamic sizing
    document.documentElement.style.setProperty('--button-panel-width', `${this.settings.ui.buttonPanelWidth}px`);
    
    this.createButtons();
    document.body.appendChild(this.panel);
  }

  createButtons() {
    if (!this.panel) return;

    this.panel.innerHTML = '';
    
    // Add timer button at the top
    const timerButton = document.createElement('button');
    timerButton.className = 'custom-button';
    timerButton.id = 'timer-toggle-btn';
    timerButton.innerHTML = '⏰';
    timerButton.title = this.settings.buttons.showTooltips ? 'Toggle Timer Panel' : '';
    timerButton.style.setProperty('--button-color', '#FF9800');
    timerButton.style.borderColor = '#FF9800';
    
    const size = this.calculateButtonSize();
    timerButton.style.width = size;
    timerButton.style.height = size;
    
    timerButton.addEventListener('click', () => this.toggleTimerPanel());
    this.panel.appendChild(timerButton);
    
    // Add separator
    const separator = document.createElement('div');
    separator.style.height = '1px';
    separator.style.background = '#555';
    separator.style.margin = '0.5rem 0';
    this.panel.appendChild(separator);
    
    // Add regular command buttons
    this.settings.buttons.customButtons.forEach((btnConfig, index) => {
      const button = document.createElement('button');
      button.className = 'custom-button';
      button.id = `custom-btn-${index}`;
      button.innerHTML = btnConfig.icon;
      button.title = this.settings.buttons.showTooltips ? btnConfig.title : '';
      
      // Set button color as CSS custom property
      button.style.setProperty('--button-color', btnConfig.color);
      button.style.borderColor = btnConfig.color;
      
      // Dynamic sizing based on panel width
      button.style.width = size;
      button.style.height = size;
      
      // Add click handler
      button.addEventListener('click', () => this.handleButtonClick(btnConfig));
      
      this.panel.appendChild(button);
    });
  }

  calculateButtonSize() {
    const width = this.settings.ui.buttonPanelWidth;
    // Calculate size with proper spacing
    return `${Math.max(width - 16, 24)}px`;
  }

  handleButtonClick(btnConfig) {
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
  }

  updateSettings(newSettings) {
    this.settings = newSettings;
    document.documentElement.style.setProperty('--button-panel-width', `${newSettings.ui.buttonPanelWidth}px`);
    
    if (this.panel) {
      this.createButtons();
    }
    
    if (this.timerManager) {
      this.timerManager.updateSettings(newSettings);
    }
    
    this.updateLayout();
  }

  toggleTimerPanel() {
    this.showingTimerPanel = !this.showingTimerPanel;
    
    if (this.showingTimerPanel) {
      this.createTimerPanel();
    } else {
      this.hideTimerPanel();
    }
  }

  createTimerPanel() {
    // Remove existing timer panel
    const existing = document.getElementById('timer-panel');
    if (existing) existing.remove();

    const timerPanel = document.createElement('div');
    timerPanel.id = 'timer-panel';
    timerPanel.className = 'timer-panel';
    
    timerPanel.innerHTML = `
      <h3>⏰ Command Timers</h3>
      
      <div class="timer-controls">
        <div class="timer-input-group">
          <div class="timer-input-row">
            <label>Name:</label>
            <input type="text" id="timer-name" class="timer-input" placeholder="Timer name" value="">
          </div>
          <div class="timer-input-row">
            <label>Interval:</label>
            <input type="number" id="timer-interval" class="timer-input" placeholder="5" min="1" max="3600" value="30">
            <span style="color: #ccc; font-size: 0.8rem; margin-left: 0.5rem;">seconds</span>
          </div>
          <div class="timer-input-row">
            <label>Command:</label>
            <input type="text" id="timer-command" class="timer-input" placeholder="look" value="">
          </div>
        </div>
        
        <div class="timer-buttons">
          <button class="timer-btn primary" id="create-timer-btn">Create Timer</button>
          <button class="timer-btn secondary" id="close-timer-panel-btn">Close</button>
        </div>
      </div>

      <div class="timer-list" id="timer-list">
        <!-- Timer items will be populated here -->
      </div>
    `;

    document.body.appendChild(timerPanel);

    // Add event listeners
    document.getElementById('create-timer-btn').addEventListener('click', () => this.createNewTimer());
    document.getElementById('close-timer-panel-btn').addEventListener('click', () => this.toggleTimerPanel());
    
    // Add enter key support for inputs
    const inputs = timerPanel.querySelectorAll('.timer-input');
    inputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.createNewTimer();
        }
      });
    });

    // Add click outside to close functionality
    this.setupClickOutsideHandler();

    this.updateTimerList();
  }

  createNewTimer() {
    const nameInput = document.getElementById('timer-name');
    const intervalInput = document.getElementById('timer-interval');
    const commandInput = document.getElementById('timer-command');

    const name = nameInput.value.trim() || `Timer ${Date.now()}`;
    const interval = parseInt(intervalInput.value) || 30;
    const command = commandInput.value.trim();

    if (!command) {
      alert('Please enter a command for the timer.');
      return;
    }

    if (interval < 1 || interval > 3600) {
      alert('Interval must be between 1 and 3600 seconds.');
      return;
    }

    if (this.timerManager) {
      const timerId = this.timerManager.createTimer(interval, command, name);
      if (timerId) {
        // Clear inputs
        nameInput.value = '';
        commandInput.value = '';
        intervalInput.value = '30';
        
        this.updateTimerList();
      }
    }
  }

  updateTimerList() {
    const timerList = document.getElementById('timer-list');
    if (!timerList || !this.timerManager) return;

    const timers = this.timerManager.getAllTimers();
    
    if (timers.length === 0) {
      timerList.innerHTML = '<div style="text-align: center; color: #888; padding: 1rem;">No timers created</div>';
      return;
    }

    timerList.innerHTML = timers.map(timer => `
      <div class="timer-item ${timer.isRunning ? 'active' : ''}">
        <div class="timer-info">
          <div class="timer-name">${timer.name}</div>
          <div class="timer-details">"${timer.command}" every ${timer.interval}s</div>
        </div>
        <div class="timer-item-buttons">
          ${timer.isRunning 
            ? `<button class="timer-item-btn stop" onclick="window.buttonPanel.stopTimer(${timer.id})">Stop</button>`
            : `<button class="timer-item-btn start" onclick="window.buttonPanel.startTimer(${timer.id})">Start</button>`
          }
          <button class="timer-item-btn delete" onclick="window.buttonPanel.deleteTimer(${timer.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  startTimer(timerId) {
    if (this.timerManager) {
      const timer = this.timerManager.getAllTimers().find(t => t.id === timerId);
      if (timer) {
        this.timerManager.startTimer(timerId, timer.interval, timer.command);
        this.updateTimerList();
      }
    }
  }

  stopTimer(timerId) {
    if (this.timerManager) {
      this.timerManager.stopTimer(timerId);
      this.updateTimerList();
    }
  }

  deleteTimer(timerId) {
    if (this.timerManager) {
      this.timerManager.deleteTimer(timerId);
      this.updateTimerList();
    }
  }

  hideTimerPanel() {
    const timerPanel = document.getElementById('timer-panel');
    if (timerPanel) {
      timerPanel.remove();
    }
    this.showingTimerPanel = false;
    
    // Remove the click outside handler
    this.removeClickOutsideHandler();
  }

  setupClickOutsideHandler() {
    // Remove any existing handler first
    this.removeClickOutsideHandler();
    
    // Create the handler function
    this.clickOutsideHandler = (event) => {
      const timerPanel = document.getElementById('timer-panel');
      const timerButton = document.getElementById('timer-toggle-btn');
      
      if (timerPanel && 
          !timerPanel.contains(event.target) && 
          !timerButton.contains(event.target)) {
        this.toggleTimerPanel();
      }
    };
    
    // Add the event listener with a small delay to avoid immediate closing
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler, true);
    }, 100);
  }

  removeClickOutsideHandler() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler, true);
      this.clickOutsideHandler = null;
    }
  }

  // Callback for timer manager to save settings
  onTimerSettingsChanged(settings) {
    // This will be used to sync timer settings back to main process
    if (window.electronAPI && window.electronAPI.saveTimerSettings) {
      window.electronAPI.saveTimerSettings(settings).then(result => {
        if (!result.success) {
          console.error('Failed to save timer settings:', result.error);
        }
      }).catch(err => {
        console.error('Error saving timer settings:', err);
      });
    }
  }

  updateLayout() {
    const mainDiv = document.getElementById('main');
    if (!mainDiv) return;

    if (this.settings.ui.showButtonPanel) {
      this.show();
      mainDiv.classList.add('game-content-adjusted');
    } else {
      this.hide();
      mainDiv.classList.remove('game-content-adjusted');
    }
  }

  show() {
    if (this.panel) {
      this.panel.classList.remove('hidden');
    }
  }

  hide() {
    if (this.panel) {
      this.panel.classList.add('hidden');
    }
  }

  toggle() {
    if (this.panel) {
      const isHidden = this.panel.classList.contains('hidden');
      if (isHidden) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    
    if (this.timerManager) {
      this.timerManager.destroy();
      this.timerManager = null;
    }
    
    this.hideTimerPanel();
    this.removeClickOutsideHandler();
    
    const mainDiv = document.getElementById('main');
    if (mainDiv) {
      mainDiv.classList.remove('game-content-adjusted');
    }
    
    this.isInitialized = false;
  }
}

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonPanel;
}
