const SOUND_SCHEME = 'genesis-sound';
const SOUND_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.(wav|mp3|ogg|m4a|aac|flac)$/i;

function isValidSoundFilename(filename) {
  return typeof filename === 'string' && SOUND_FILENAME_PATTERN.test(filename);
}

function getSoundUrl(filename) {
  if (!isValidSoundFilename(filename)) {
    return null;
  }
  return `${SOUND_SCHEME}://local/${encodeURIComponent(filename)}`;
}

module.exports = { SOUND_SCHEME, isValidSoundFilename, getSoundUrl };
