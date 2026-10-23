// WebClientHook.js - inject a small command bridge into the official web client.
//
// The official client creates its `gwc` object inside the minified entry module.
// That object is not on `window`, so the Electron wrapper cannot call
// `gwc.connection.send()` directly. This module rewrites the app bundle while it
// is being downloaded and adds a narrow `window.genesisClient` facade in the
// same scope, right next to `gwc`.
//
// It is intentionally small and defensive: if the bundle layout changes, the
// injection returns null and the wrapper falls back to its other send paths.

const { GAME_ORIGIN } = require('./game');

const APP_JS_PATH = /^\/play\/app(?:\.[^/]+)?\.js$/;
const HOOK_MARKER = 'window.$=window.jQuery=';
const HOOK_SENTINEL = 'window.genesisClient=';

// The minifier renames these variables, so locate them by their shape rather
// than assuming N/Z/st.
const NAME_PATTERNS = {
  gwc: /var\s+([A-Za-z_$][\w$]*)=\{connection:\{send:function\(/,
  alias: /([A-Za-z_$][\w$]*)=\{aliases:\[\],save:function\(\)\{var t=JSON\.stringify\(this\.aliases/,
  client: /([A-Za-z_$][\w$]*)=\{connect:function\(\)\{return console\.log\("Connection is opening"\)/,
};

// A session can only have one `https` protocol handler, and installing it twice
// would replace the first one. Keep track of the sessions we already handled.
const installedSessions = new WeakSet();

function isGameAppUrl(url, origin = GAME_ORIGIN) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.origin === origin && APP_JS_PATH.test(parsed.pathname);
}

function findClientNames(source, before) {
  const names = {};
  for (const [key, pattern] of Object.entries(NAME_PATTERNS)) {
    const match = pattern.exec(source);
    if (!match || match.index > before) {
      return null;
    }
    names[key] = match[1];
  }
  return names;
}

function buildHook({ gwc, alias, client }) {
  return [
    ';window.genesisClient={',
    `send:function(c){return ${gwc}.connection.send(String(c),!0)},`,
    `sendRaw:function(c){return ${gwc}.connection.send(String(c))},`,
    `sendTyped:function(c){var t=String(c).trim();`,
    `if(${alias}&&${alias}.execute(t)){${client}.InputHistory.push(t)}`,
    `else{${client}.Process.outgoing(t)}return!0},`,
    `isConnected:function(){return ${client}.is_connected()}`,
    '};',
  ].join('');
}

// Insert a `window.genesisClient` facade after the client has declared its
// internal `gwc`, alias manager and client objects. Returns null (and leaves the
// source untouched) when the bundle does not look like the expected layout.
function injectGenesisClientHook(source) {
  if (typeof source !== 'string' || source.includes(HOOK_SENTINEL)) {
    return null;
  }

  const markerIndex = source.lastIndexOf(HOOK_MARKER);
  if (markerIndex === -1) {
    return null;
  }

  const names = findClientNames(source, markerIndex);
  if (!names) {
    return null;
  }

  const semicolon = source.indexOf(';', markerIndex);
  if (semicolon === -1) {
    return null;
  }

  return source.slice(0, semicolon + 1) + buildHook(names) + source.slice(semicolon + 1);
}

function rewrittenHeaders(headers) {
  const result = new Headers(headers);
  // The body is read as text by Response.text(), so the original encoding
  // headers no longer describe it.
  result.delete('content-encoding');
  result.delete('content-length');
  result.delete('transfer-encoding');
  return result;
}

// Rewrite only the official app bundle. Everything else is passed straight
// through to Chromium's network stack.
async function installWebClientHook({ session, net, origin = GAME_ORIGIN, logger = console }) {
  if (!session || !net) {
    throw new Error('installWebClientHook requires a session and net');
  }
  if (installedSessions.has(session)) {
    return false;
  }
  installedSessions.add(session);

  // The web client registers a service worker. Drop any previously cached
  // bundle so an older, unpatched copy cannot bypass the rewrite on first load.
  try {
    await session.clearStorageData({
      origin,
      storages: ['serviceworkers', 'cachestorage'],
    });
    await session.clearCache();
  } catch (error) {
    logger.warn?.('Could not clear the game cache:', error);
  }

  const handler = async (request) => {
    if (!isGameAppUrl(request.url, origin)) {
      return net.fetch(request, { bypassCustomProtocolHandlers: true });
    }

    const response = await net.fetch(request, { bypassCustomProtocolHandlers: true });
    if (!response.ok) {
      return response;
    }

    const source = await response.text();
    const patched = injectGenesisClientHook(source);
    if (!patched) {
      logger.error?.(`Could not inject the client bridge into ${request.url}`);
      return new Response(source, {
        status: response.status,
        headers: rewrittenHeaders(response.headers),
      });
    }

    logger.log?.(`Injected the client bridge into ${request.url}`);
    return new Response(patched, {
      status: response.status,
      headers: rewrittenHeaders(response.headers),
    });
  };

  try {
    await session.protocol.handle('https', handler);
  } catch (error) {
    installedSessions.delete(session);
    throw error;
  }

  return true;
}

module.exports = {
  injectGenesisClientHook,
  isGameAppUrl,
  installWebClientHook,
};
