// origin.js - small URL origin helper shared by navigation and IPC checks.
function sameOrigin(url, origin) {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

module.exports = { sameOrigin };
