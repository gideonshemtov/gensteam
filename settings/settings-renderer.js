// settings/settings-renderer.js
class SettingsRenderer {
  constructor() {
    this.currentSettings = {};
    this.originalSettings = {};
    this.currentSection = 'ui';
    this.hasUnsavedChanges = false;
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadSettings();
    this.populateUI();
    this.setupSearch();
  }

  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.switchSection(section);
      });
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.cancelSettings();
    });

    // Reset all button
    document.getElementById('resetAllBtn').addEventListener('click', () => {
      this.showResetModal();
    });

    // Reset modal
    document.getElementById('cancelResetBtn').addEventListener('click', () => {
      this.hideResetModal();
    });

    document.getElementById('confirmResetBtn').addEventListener('click', () => {
      this.resetAllSettings();
    });

    // JSON editor buttons
    document.getElementById('saveJsonBtn').addEventListener('click', () => {
      this.saveJsonSettings();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportSettings();
    });

    document.getElementById('importBtn').addEventListener('click', () => {
      this.importSettings();
    });

    // Setting inputs change detection
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('setting-input')) {
        this.handleSettingChange(e.target);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('setting-input')) {
        this.handleSettingChange(e.target);
      }
      // Keep the volume percentage label in sync while dragging
      if (e.target.id === 'volumeSlider') {
        this.updateVolumeDisplay(e.target.value);
      }
    });

    // Handle close request from main process
    if (window.electronAPI && window.electronAPI.onCloseRequested) {
      window.electronAPI.onCloseRequested(() => {
        this.handleWindowCloseRequest();
      });
    }

    // Prevent accidental window close with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  async loadSettings() {
    try {
      if (!window.electronAPI?.settings?.get) {
        throw new Error('Settings API is not available. The preload script may have failed to load.');
      }
      this.currentSettings = await window.electronAPI.settings.get();
      this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
    } catch (error) {
      this.showError('Failed to load settings: ' + error.message);
    }
  }

  populateUI() {
    // Populate form inputs
    document.querySelectorAll('.setting-input').forEach(input => {
      const path = input.dataset.path;
      if (path) {
        const value = this.getNestedValue(this.currentSettings, path);
        
        if (input.type === 'checkbox') {
          input.checked = Boolean(value);
        } else {
          input.value = value ?? '';
        }
      }
    });

    // Update volume display
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
      this.updateVolumeDisplay(volumeSlider.value);
    }

    // Populate button list
    this.populateButtonList();

    // Populate sound list
    this.populateSoundList();

    // Populate JSON editor
    this.updateJsonEditor();
  }

  updateVolumeDisplay(value) {
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) {
      const percentage = Math.round(value * 100);
      volumeValue.textContent = `${percentage}%`;
    }
  }

  populateButtonList() {
    const buttonList = document.getElementById('buttonList');
    const buttons = this.currentSettings.buttons?.customButtons || [];

    buttonList.textContent = '';
    buttons.forEach((button) => {
      const color = this.getSafeColor(button.color);

      const buttonItem = document.createElement('div');
      buttonItem.className = 'button-item';

      const preview = document.createElement('div');
      preview.className = 'button-preview';
      preview.style.background = color;
      preview.style.border = `1px solid ${color}`;
      preview.textContent = button.icon ?? '';

      const info = document.createElement('div');
      info.className = 'button-info';

      const title = document.createElement('div');
      title.className = 'button-title';
      title.textContent = button.title ?? '';

      const command = document.createElement('div');
      command.className = 'button-command';
      command.textContent = button.command ?? '';

      info.append(title, command);
      buttonItem.append(preview, info);
      buttonList.appendChild(buttonItem);
    });
  }

  // Only accept well-formed hex colors; anything else falls back to a neutral grey.
  getSafeColor(color) {
    return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#888888';
  }

  updateJsonEditor() {
    const editor = document.getElementById('jsonEditor');
    editor.value = JSON.stringify(this.currentSettings, null, 2);
  }

  switchSection(section) {
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.settings-section, .json-editor-container').forEach(section => {
      section.classList.remove('active');
    });
    
    const targetSection = document.querySelector(`.settings-section[data-section="${section}"], .json-editor-container[data-section="${section}"]`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    this.currentSection = section;

    // Update JSON editor when switching to JSON section
    if (section === 'json') {
      this.updateJsonEditor();
    }
  }

  handleSettingChange(input) {
    const path = input.dataset.path;
    if (!path) return;

    let value;
    if (input.type === 'checkbox') {
      value = input.checked;
    } else if (input.type === 'number') {
      value = parseInt(input.value, 10);
    } else if (input.type === 'range') {
      value = parseFloat(input.value);
    } else {
      value = input.value;
    }

    this.setNestedValue(this.currentSettings, path, value);
    this.markAsChanged();

    // Update button list if buttons changed
    if (path.startsWith('buttons.')) {
      this.populateButtonList();
    }

    // Update sound list if sounds changed
    if (path.startsWith('sounds.')) {
      this.populateSoundList();
    }

    // Update JSON editor if not in JSON section
    if (this.currentSection !== 'json') {
      this.updateJsonEditor();
    }
  }

  async saveSettings() {
    try {
      const result = await window.electronAPI.settings.save(this.currentSettings);
      
      if (result.success) {
        this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
        this.hasUnsavedChanges = false;
        this.showSuccess('Settings saved successfully!');
        this.updateSaveButtonState();
      } else {
        this.showError('Failed to save settings: ' + result.error);
      }
    } catch (error) {
      this.showError('Failed to save settings: ' + error.message);
    }
  }

  handleWindowCloseRequest() {
    if (this.hasUnsavedChanges) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to close without saving?');
      if (!confirmCancel) {
        return; // Don't close the window
      }
    }
    
    // Force close the window
    if (window.electronAPI && window.electronAPI.forceClose) {
      window.electronAPI.forceClose();
    }
  }

  cancelSettings() {
    if (this.hasUnsavedChanges) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to cancel and lose these changes?');
      if (!confirmCancel) {
        return;
      }
      
      // Revert all changes back to original settings
      this.currentSettings = JSON.parse(JSON.stringify(this.originalSettings));
      this.hasUnsavedChanges = false;
      this.populateUI(); // Update the UI to show the reverted values
    }
    
    // Close the settings window
    if (window.electronAPI && window.electronAPI.forceClose) {
      window.electronAPI.forceClose();
    } else {
      // Fallback: try to close the window
      window.close();
    }
  }

  async saveJsonSettings() {
    try {
      const editor = document.getElementById('jsonEditor');
      const jsonText = editor.value;
      
      // Parse JSON to validate
      const parsedSettings = JSON.parse(jsonText);
      
      const result = await window.electronAPI.settings.save(parsedSettings);
      
      if (result.success) {
        this.currentSettings = parsedSettings;
        this.originalSettings = JSON.parse(JSON.stringify(parsedSettings));
        this.hasUnsavedChanges = false;
        this.populateUI();
        this.showSuccess('Settings saved successfully!');
        this.updateSaveButtonState();
      } else {
        this.showError('Failed to save settings: ' + result.error);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.showError('Invalid JSON syntax: ' + error.message);
      } else {
        this.showError('Failed to save settings: ' + error.message);
      }
    }
  }

  async resetAllSettings() {
    try {
      const newSettings = await window.electronAPI.settings.reset();
      this.currentSettings = newSettings;
      this.originalSettings = JSON.parse(JSON.stringify(newSettings));
      this.hasUnsavedChanges = false;
      this.populateUI();
      this.hideResetModal();
      this.showSuccess('All settings have been reset to defaults!');
      this.updateSaveButtonState();
    } catch (error) {
      this.showError('Failed to reset settings: ' + error.message);
    }
  }

  async exportSettings() {
    try {
      const jsonString = await window.electronAPI.settings.exportJson();
      
      // Create and trigger download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'genesis-client-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showSuccess('Settings exported successfully!');
    } catch (error) {
      this.showError('Failed to export settings: ' + error.message);
    }
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const result = await window.electronAPI.settings.importJson(text);
        
        if (result.success) {
          this.currentSettings = result.settings;
          this.originalSettings = JSON.parse(JSON.stringify(result.settings));
          this.hasUnsavedChanges = false;
          this.populateUI();
          this.showSuccess('Settings imported successfully!');
          this.updateSaveButtonState();
        } else {
          this.showError('Failed to import settings: ' + result.error);
        }
      } catch (error) {
        this.showError('Failed to read file: ' + error.message);
      }
    };
    
    input.click();
  }

  setupSearch() {
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });
  }

  performSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      // Show all settings
      document.querySelectorAll('.setting-item').forEach(item => {
        item.style.display = 'block';
      });
      return;
    }

    document.querySelectorAll('.setting-item').forEach(item => {
      const label = item.querySelector('.setting-label')?.textContent.toLowerCase() || '';
      const description = item.querySelector('.setting-description')?.textContent.toLowerCase() || '';
      
      if (label.includes(normalizedQuery) || description.includes(normalizedQuery)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  populateSoundList() {
    const soundList = document.getElementById('soundList');
    const sounds = this.currentSettings.sounds?.soundMappings || [];

    soundList.textContent = '';
    sounds.forEach((sound) => {
      const soundItem = document.createElement('div');
      soundItem.className = 'button-item'; // Reuse button item styling

      const preview = document.createElement('div');
      preview.className = 'button-preview';
      preview.style.background = '#4a90e2';
      preview.style.border = '1px solid #4a90e2';
      preview.style.fontSize = '12px';
      preview.textContent = '🔊';

      const info = document.createElement('div');
      info.className = 'button-info';

      const title = document.createElement('div');
      title.className = 'button-title';
      title.textContent = `${sound.name ?? ''} (${sound.filename ?? ''})`;

      const description = document.createElement('div');
      description.className = 'button-command';
      description.textContent = sound.description || 'No description';

      info.append(title, description);

      const testButton = document.createElement('button');
      testButton.className = 'btn';
      testButton.textContent = 'Test';
      testButton.style.marginLeft = '10px';
      testButton.style.padding = '4px 8px';
      testButton.style.fontSize = '11px';
      testButton.addEventListener('click', () => this.playSound(sound.name));

      soundItem.append(preview, info, testButton);
      soundList.appendChild(soundItem);
    });
  }

  async playSound(soundName) {
    try {
      const sounds = this.currentSettings.sounds?.soundMappings || [];
      const sound = sounds.find(s => s.name === soundName);
      if (!sound) {
        this.showError(`Sound mapping not found: ${soundName}`);
        return;
      }

      if (!window.electronAPI?.getSoundUrl) {
        this.showError('Sound testing not available');
        return;
      }

      const url = window.electronAPI.getSoundUrl(sound.filename);
      if (!url) {
        this.showError(`Failed to play sound: ${soundName}. Check if the file exists in assets/sounds/`);
        return;
      }

      const masterVolume = this.currentSettings.sounds?.masterVolume ?? 1.0;
      const audio = new Audio(url);
      audio.volume = Math.min(1, Math.max(0, masterVolume));
      await audio.play();
      this.showSuccess(`Played sound: ${soundName}`);
    } catch (error) {
      this.showError('Error testing sound: ' + error.message);
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  markAsChanged() {
    this.hasUnsavedChanges = true;
    this.updateSaveButtonState();
  }

  updateSaveButtonState() {
    const saveBtn = document.getElementById('saveBtn');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    
    if (this.hasUnsavedChanges) {
      saveBtn.textContent = 'Save*';
      saveJsonBtn.textContent = 'Save JSON*';
      saveBtn.style.background = '#cc6633';
      saveJsonBtn.style.background = '#cc6633';
    } else {
      saveBtn.textContent = 'Save';
      saveJsonBtn.textContent = 'Save JSON';
      saveBtn.style.background = '#0e639c';
      saveJsonBtn.style.background = '#0e639c';
    }
  }

  showResetModal() {
    document.getElementById('resetModal').classList.add('active');
  }

  hideResetModal() {
    document.getElementById('resetModal').classList.remove('active');
  }

  showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = message;
    successEl.style.display = 'block';
    
    setTimeout(() => {
      successEl.style.display = 'none';
    }, 3000);
  }
}

// Initialize the settings renderer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.settingsRenderer = new SettingsRenderer();
});
