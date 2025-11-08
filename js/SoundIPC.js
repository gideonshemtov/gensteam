// SoundIPC.js
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

class SoundIPC {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
  }

  setupHandlers() {
    // Set up IPC handlers for sound functionality
    ipcMain.handle('play-sound', async (event, filename) => {
      return this.playSound(filename);
    });

    ipcMain.handle('get-available-sounds', async () => {
      return this.getAvailableSounds();
    });

    // Set up IPC handlers for timer settings
    ipcMain.handle('save-timer-settings', (event, newSettings) => {
      return this.saveTimerSettings(newSettings);
    });
  }

  async playSound(filename) {
    try {
      // Use __dirname.replace('app.asar', 'app.asar.unpacked') to access unpacked files
      let soundPath = path.join(__dirname, '..', 'assets', 'sounds', filename);
      
      // In production, check if we need to use the unpacked path
      if (soundPath.includes('app.asar')) {
        soundPath = soundPath.replace('app.asar', 'app.asar.unpacked');
      }
      
      // Check if file exists
      if (!fs.existsSync(soundPath)) {
        console.warn(`Sound file not found: ${soundPath}`);
        return false;
      }

      // Get current sound settings
      const soundSettings = this.settingsManager.get('sounds');
      if (!soundSettings?.enabled) {
        console.log('Sounds are disabled in settings');
        return false;
      }

      // Use master volume directly
      const finalVolume = soundSettings.masterVolume || 1.0;
      const volumePercent = Math.round(finalVolume * 100);

      // Play the sound using shell command (works on most systems)
      let command;
      
      if (process.platform === 'win32') {
        // Windows - use PowerShell with volume control
        command = `powershell -c "Add-Type -AssemblyName presentationCore; $mediaPlayer = New-Object system.windows.media.mediaplayer; $mediaPlayer.Volume = ${finalVolume}; $mediaPlayer.open('${soundPath}'); $mediaPlayer.Play(); Start-Sleep -Milliseconds 100; while($mediaPlayer.NaturalDuration.HasTimeSpan -eq $false) { Start-Sleep -Milliseconds 100 }; $duration = $mediaPlayer.NaturalDuration.TimeSpan.TotalMilliseconds; Start-Sleep -Milliseconds $duration"`;
      } else if (process.platform === 'darwin') {
        // macOS - use afplay with volume
        command = `afplay "${soundPath}" -v ${finalVolume}`;
      } else {
        // Linux - use paplay with volume or ffplay
        command = `paplay --volume=${Math.round(finalVolume * 65536)} "${soundPath}" 2>/dev/null || ffplay -nodisp -autoexit -volume ${volumePercent} "${soundPath}" 2>/dev/null || aplay "${soundPath}"`;
      }

      exec(command, (error) => {
        if (error) {
          console.error(`Sound playback error: ${error.message}`);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to play sound:', error);
      return false;
    }
  }

  async getAvailableSounds() {
    try {
      const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
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
  }

  saveTimerSettings(newSettings) {
    try {
      const settingsPath = this.settingsManager.getSettingsPath();
      
      // Validate the settings first
      if (this.settingsManager.validate && !this.settingsManager.validate(newSettings)) {
        throw new Error('Invalid timer settings');
      }
      
      // Write settings directly to avoid subscriber loops
      fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
      
      // Update the in-memory settings without triggering subscribers
      this.settingsManager.settings = newSettings;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save timer settings:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SoundIPC;
