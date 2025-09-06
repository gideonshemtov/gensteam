// ButtonPanel.js - Clean button panel management
class ButtonPanel {
  constructor() {
    this.panel = null;
    this.settings = null;
    this.isInitialized = false;
  }

  init(settings) {
    this.settings = settings;
    this.injectStyles();
    this.createPanel();
    this.updateLayout();
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
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.9);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #555;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .custom-button-bar.hidden {
          display: none !important;
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
          margin-left: calc(var(--button-panel-width) + 2rem) !important;
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
      const size = this.calculateButtonSize();
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
    
    this.updateLayout();
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
