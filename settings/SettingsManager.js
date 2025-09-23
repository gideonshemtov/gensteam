// settings/SettingsManager.js
const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

class SettingsManager {
  constructor() {
    this.userDataPath = app.getPath('userData');
    this.settingsPath = path.join(this.userDataPath, 'settings.json');
    this.ajv = new Ajv();
    this.schema = this.getSettingsSchema();
    this.validate = this.ajv.compile(this.schema);
    this.settings = this.load();
    this.subscribers = new Set();
    
    // Ensure settings directory exists
    const settingsDir = path.dirname(this.settingsPath);
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }
  }

  getSettingsSchema() {
    return {
      type: 'object',
      properties: {
        ui: {
          type: 'object',
          properties: {
            showButtonPanel: {
              type: 'boolean',
              default: true,
              description: 'Show the custom button panel on the left side'
            },
            buttonPanelWidth: {
              type: 'number',
              default: 50,
              minimum: 30,
              maximum: 100,
              description: 'Width of the button panel in pixels'
            },
            hideMenuBar: {
              type: 'boolean',
              default: false,
              description: 'Hide the menu bar (press Alt to show temporarily)'
            }
          },
          additionalProperties: false
        },
        game: {
          type: 'object',
          properties: {
            startUrl: {
              type: 'string',
              default: 'https://www.genesismud.org/play',
              description: 'Default URL to load when the application starts'
            }
          },
          additionalProperties: false
        },
        buttons: {
          type: 'object',
          properties: {
            customButtons: {
              type: 'array',
              default: [
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
                  command: 'stats',
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
              ],
              items: {
                type: 'object',
                properties: {
                  icon: { type: 'string' },
                  title: { type: 'string' },
                  command: { type: 'string' },
                  color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
                },
                required: ['icon', 'title', 'command', 'color'],
                additionalProperties: false
              },
              description: 'Custom command buttons configuration'
            },
            showTooltips: {
              type: 'boolean',
              default: true,
              description: 'Show tooltips when hovering over buttons'
            }
          },
          additionalProperties: false
        },
        window: {
          type: 'object',
          properties: {
            width: {
              type: 'number',
              default: 1280,
              minimum: 800,
              maximum: 3840,
              description: 'Default window width'
            },
            height: {
              type: 'number',
              default: 800,
              minimum: 600,
              maximum: 2160,
              description: 'Default window height'
            }
          },
          additionalProperties: false
        },
        timers: {
          type: 'object',
          properties: {
            activeTimers: {
              type: 'array',
              default: [],
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  interval: { type: 'number', minimum: 1, maximum: 3600 },
                  command: { type: 'string' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'number' }
                },
                required: ['id', 'name', 'interval', 'command', 'isActive'],
                additionalProperties: false
              },
              description: 'List of configured command timers'
            }
          },
          additionalProperties: false
        },
        sounds: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: true,
              description: 'Enable/disable sound playback'
            },
            masterVolume: {
              type: 'number',
              default: 1.0,
              minimum: 0.0,
              maximum: 1.0,
              description: 'Master volume for all sounds (0.0 to 1.0)'
            },
            soundMappings: {
              type: 'array',
              default: [
                {
                  name: 'alert',
                  filename: 'alert.wav',
                  volume: 1.0,
                  description: 'General alert sound'
                },
                {
                  name: 'combat',
                  filename: 'combat.wav',
                  volume: 0.8,
                  description: 'Combat-related notifications'
                },
                {
                  name: 'whisper',
                  filename: 'whisper.wav',
                  volume: 0.9,
                  description: 'Private message notifications'
                },
                {
                  name: 'death',
                  filename: 'death.wav',
                  volume: 1.0,
                  description: 'Character death sound'
                },
                {
                  name: 'level',
                  filename: 'level.wav',
                  volume: 1.0,
                  description: 'Level up notification'
                }
              ],
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Unique name for the sound trigger'
                  },
                  filename: {
                    type: 'string',
                    description: 'Sound file name (relative to assets/sounds/)'
                  },
                  volume: {
                    type: 'number',
                    minimum: 0.0,
                    maximum: 1.0,
                    default: 1.0,
                    description: 'Volume level for this sound (0.0 to 1.0)'
                  },
                  description: {
                    type: 'string',
                    description: 'Human-readable description of what triggers this sound'
                  }
                },
                required: ['name', 'filename', 'volume'],
                additionalProperties: false
              },
              description: 'Sound name to file mappings'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    };
  }

  getDefaults() {
    const extractDefaults = (schema) => {
      const defaults = {};
      if (schema.type === 'object' && schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          if (prop.default !== undefined) {
            defaults[key] = prop.default;
          } else if (prop.type === 'object') {
            defaults[key] = extractDefaults(prop);
          }
        }
      }
      return defaults;
    };
    return extractDefaults(this.schema);
  }

  load() {
    console.log('Loading settings from', this.settingsPath);
    try {
      if (fs.existsSync(this.settingsPath)) {
        const raw = fs.readFileSync(this.settingsPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const merged = this.mergeWithDefaults(this.getDefaults(), parsed);
        
        // Validate the merged settings
        if (this.validate(merged)) {
          return merged;
        } else {
          console.warn('Settings validation failed, using defaults:', this.validate.errors);
          return this.getDefaults();
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return this.getDefaults();
  }

  mergeWithDefaults(defaults, userSettings) {
    const result = { ...defaults };
    for (const [key, value] of Object.entries(userSettings)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.mergeWithDefaults(defaults[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  save(newSettings = this.settings) {
    try {
      // Validate before saving
      if (!this.validate(newSettings)) {
        throw new Error('Settings validation failed: ' + JSON.stringify(this.validate.errors, null, 2));
      }

      fs.writeFileSync(this.settingsPath, JSON.stringify(newSettings, null, 2));
      const oldSettings = this.settings;
      this.settings = newSettings;
      
      // Notify subscribers of changes
      this.notifySubscribers(oldSettings, newSettings);
      
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  get(path = null) {
    if (!path) return this.settings;
    
    const keys = path.split('.');
    let value = this.settings;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    const newSettings = JSON.parse(JSON.stringify(this.settings));
    
    let current = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    this.save(newSettings);
  }

  reset() {
    this.save(this.getDefaults());
  }

  resetSection(section) {
    const defaults = this.getDefaults();
    if (defaults[section]) {
      this.set(section, defaults[section]);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(oldSettings, newSettings) {
    for (const callback of this.subscribers) {
      try {
        callback(newSettings, oldSettings);
      } catch (error) {
        console.error('Error in settings subscriber:', error);
      }
    }
  }

  getSettingsPath() {
    return this.settingsPath;
  }

  getSchema() {
    return this.schema;
  }

  exportSettings() {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.save(imported);
      return true;
    } catch (error) {
      throw new Error('Invalid JSON format: ' + error.message);
    }
  }
}

module.exports = SettingsManager;
