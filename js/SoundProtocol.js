const { protocol, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { SOUND_SCHEME, isValidSoundFilename } = require('./soundFilename');

function getSoundsDirectory() {
  let soundsDir = path.join(app.getAppPath(), 'assets', 'sounds');
  if (soundsDir.includes('app.asar')) {
    soundsDir = soundsDir.replace('app.asar', 'app.asar.unpacked');
  }
  return soundsDir;
}

function resolveSoundPath(filename) {
  if (!isValidSoundFilename(filename)) {
    return null;
  }

  const soundsDir = getSoundsDirectory();
  const soundPath = path.join(soundsDir, filename);
  if (!soundPath.startsWith(soundsDir + path.sep)) {
    return null;
  }

  if (!fs.existsSync(soundPath)) {
    return null;
  }

  return soundPath;
}

function registerSoundScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: SOUND_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        bypassCSP: true,
      },
    },
  ]);
}

function registerSoundProtocol() {
  protocol.registerFileProtocol(SOUND_SCHEME, (request, callback) => {
    try {
      const prefix = `${SOUND_SCHEME}://local/`;
      if (!request.url.startsWith(prefix)) {
        callback({ error: -2 });
        return;
      }

      const filename = decodeURIComponent(request.url.slice(prefix.length));
      const soundPath = resolveSoundPath(filename);
      if (!soundPath) {
        callback({ error: -6 });
        return;
      }

      callback({ path: soundPath });
    } catch (error) {
      console.error('Sound protocol error:', error);
      callback({ error: -2 });
    }
  });
}

function listAvailableSounds() {
  try {
    const soundsDir = getSoundsDirectory();
    if (!fs.existsSync(soundsDir)) {
      return [];
    }

    return fs.readdirSync(soundsDir).filter(isValidSoundFilename);
  } catch (error) {
    console.error('Failed to list available sounds:', error);
    return [];
  }
}

module.exports = {
  registerSoundScheme,
  registerSoundProtocol,
  listAvailableSounds,
};
