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
//
// The same rewrite also protects player userdata on the desktop client. The web
// client replaces its userdata object on disconnect but keeps exposing the old
// object to scripts as `gwc.userdata`, so after a quit/reconnect scripts can see
// (and write to) the previous character's data. It also starts saving before the
// server copy has loaded. Both are fixed here, without touching the server.

const { GAME_ORIGIN } = require('./game');

const APP_JS_PATH = /^\/play\/app(?:\.[^/]+)?\.js$/;
const HOOK_MARKER = 'window.$=window.jQuery=';
const HOOK_SENTINEL = 'window.genesisClient=';
const USERDATA_PROTECTION_MARKER = '/*genesis-userdata-protection*/';

// The minifier renames these variables, so locate them by their shape rather
// than assuming N/Z/st.
const NAME_PATTERNS = {
  gwc: /var\s+([A-Za-z_$][\w$]*)=\{connection:\{send:function\(/,
  alias: /([A-Za-z_$][\w$]*)=\{aliases:\[\],save:function\(\)\{var t=JSON\.stringify\(this\.aliases/,
  client: /([A-Za-z_$][\w$]*)=\{connect:function\(\)\{return console\.log\("Connection is opening"\)/,
};

// The player-file storage manager and the userdata manager. They are looked up
// separately so the command bridge still works if either shape changes.
const USERDATA_NAME_PATTERNS = {
  storage:
    /([A-Za-z_$][\w$]*)=\{available:(?:!1|false),token:void 0,character:void 0,check_availability:function\(\)/,
  userdata:
    /([A-Za-z_$][\w$]*)=\{data:\{\},json:"",loaded:(?:!1|false),save:function\(\)\{var t=JSON\.stringify\(this\.data,null,"  "\)/,
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

function findUserDataNames(source, before) {
  const names = {};
  for (const [key, pattern] of Object.entries(USERDATA_NAME_PATTERNS)) {
    const match = pattern.exec(source);
    if (!match || match.index > before) {
      return null;
    }
    names[key] = match[1];
  }
  return names;
}

function buildHook({ gwc, alias, client, userdata }) {
  const members = [
    `send:function(c){return ${gwc}.connection.send(String(c),!0)}`,
    `sendRaw:function(c){return ${gwc}.connection.send(String(c))}`,
    `sendTyped:function(c){var t=String(c).trim();if(${alias}&&${alias}.execute(t)){` +
      `${client}.InputHistory.push(t)}else{${client}.Process.outgoing(t)}return!0}`,
    `isConnected:function(){return ${client}.is_connected()}`,
  ];
  if (userdata) {
    members.push(`isUserdataLoaded:function(){return ${userdata}.loaded}`);
  }
  return `;window.genesisClient={${members.join(',')}};`;
}

// A save that:
// - waits until the server copy has loaded, so an early timer/alias cannot
//   overwrite the file with a partial object
// - compares against this character's loaded JSON instead of the global
//   `self.json`
// - only marks the data saved once the POST succeeds, so failures retry
// - serialises POSTs so an older snapshot cannot land after a newer one
function buildProtectedSave(storage) {
  return [
    'save:function(){',
    'if(!this.loaded){this.pending=!0;return}',
    'if(this.saving){this.pending=!0;return}',
    'var t=JSON.stringify(this.data,null,"  ");',
    'if(t===this.json){this.pending=!1;return}',
    `var s=this,c=${storage}.character,token=(s.saveToken=(s.saveToken||0)+1);`,
    's.saving=!0;',
    `${storage}.request("userdata.json",{type:"POST",contentType:"application/octet-stream",data:t})`,
    '.done(function(){if(s.saveToken===token)s.json=t})',
    '.fail(function(){if(s.saveToken===token)s.json=""})',
    '.always(function(){',
    'if(s.saveToken!==token)return;',
    's.saving=!1;',
    `if(${storage}.character===c&&s.pending){s.pending=!1;s.save()}`,
    '})',
    '}',
  ].join('');
}

// Patch the userdata manager in place. Every replacement is optional and only
// applied when its source shape is found exactly once, so a future web client
// deploy degrades to the old behaviour instead of serving a broken bundle.
function protectUserData(source, names) {
  if (!names || !names.gwc || !names.userdata || !names.storage) {
    return { source, applied: false };
  }

  const { gwc, userdata, storage } = names;
  let patched = source;
  let applied = false;

  const replaceOnce = (search, replacement) => {
    const first = patched.indexOf(search);
    if (first === -1 || patched.indexOf(search, first + 1) !== -1) {
      return;
    }
    patched = patched.slice(0, first) + replacement + patched.slice(first + search.length);
    applied = true;
  };

  // Keep `gwc.userdata` pointing at the manager's current data object, even if
  // the manager replaces it. This must stay an expression: it replaces one part
  // of the client's comma expression (`gwc.userdata=... , gwc.gmcp.data=...`).
  replaceOnce(
    `${gwc}.userdata=${userdata}.data`,
    `void function(){try{Object.defineProperty(${gwc},"userdata",{get:function(){return ${userdata}.data},` +
      `set:function(v){${userdata}.data=v},enumerable:!0,configurable:!0})}` +
      `catch(e){${gwc}.userdata=${userdata}.data}}()`,
  );

  // Clear the existing object instead of replacing it. Scripts that already
  // hold a reference to `gwc.userdata` keep seeing the live data.
  replaceOnce(
    'clear:function(){this.data={},this.loaded=!1}',
    'clear:function(){for(var k in this.data)delete this.data[k];' +
      'this.loaded=!1,this.saving=!1,this.pending=!1,' +
      'this.saveToken=(this.saveToken||0)+1,' +
      'this.loadToken=(this.loadToken||0)+1,this.json=""}',
  );

  // Start every load from an empty object, so a missed disconnect cannot leak
  // the previous character's keys into the next character's file.
  replaceOnce(
    `load:function(){var t=this;${storage}.request("userdata.json",{dataType:"json"})`,
    `load:function(){var t=this;for(var k in t.data)delete t.data[k];` +
      't.loaded=!1,t.saving=!1,t.pending=!1,' +
      't.saveToken=(t.saveToken||0)+1;' +
      `var lt=t.loadToken=(t.loadToken||0)+1;${storage}.request("userdata.json",{dataType:"json"})`,
  );

  // Ignore responses that belong to a previous connection.
  replaceOnce(
    `${storage}.request("userdata.json",{dataType:"json"}).done(function(e){`,
    `${storage}.request("userdata.json",{dataType:"json"}).done(function(e){if(t.loadToken!==lt)return;`,
  );
  replaceOnce(
    '.fail(function(e,i,n){404!==e.status?',
    '.fail(function(e,i,n){if(t.loadToken!==lt)return;404!==e.status?',
  );

  // If a script wrote while the load was in flight, persist the merged result.
  replaceOnce(
    't.loaded=!0}).fail(',
    't.loaded=!0;if(t.pending){t.pending=!1;t.save()}}).fail(',
  );
  replaceOnce(
    ':t.loaded=!0})}',
    ':(t.loaded=!0,t.pending&&(t.pending=!1,t.save()))})}',
  );

  replaceOnce(
    `save:function(){var t=JSON.stringify(this.data,null,"  ");t!==self.json&&(self.json=t,` +
      `${storage}.request("userdata.json",{type:"POST",contentType:"application/octet-stream",data:t}))}`,
    buildProtectedSave(storage),
  );

  return { source: patched, applied };
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

  const userdataNames = findUserDataNames(source, markerIndex);

  const semicolon = source.indexOf(';', markerIndex);
  if (semicolon === -1) {
    return null;
  }

  const withHook =
    source.slice(0, semicolon + 1) +
    buildHook({ ...names, userdata: userdataNames && userdataNames.userdata }) +
    source.slice(semicolon + 1);

  const protectedSource = protectUserData(withHook, {
    ...names,
    ...(userdataNames || {}),
  });

  return protectedSource.applied
    ? USERDATA_PROTECTION_MARKER + protectedSource.source
    : protectedSource.source;
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

    if (patched.includes(USERDATA_PROTECTION_MARKER)) {
      logger.log?.(`Injected the client bridge into ${request.url} (userdata protection on)`);
    } else {
      logger.warn?.(`Injected the client bridge into ${request.url} without userdata protection`);
    }
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
  USERDATA_PROTECTION_MARKER,
};
