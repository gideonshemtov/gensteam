const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const {
  injectGenesisClientHook,
  isGameAppUrl,
  installWebClientHook,
  USERDATA_PROTECTION_MARKER,
} = require('../js/WebClientHook');

// A tiny stand-in for the minified entry module. It has the same shapes the
// injector looks for, so the test exercises the same insertion point.
const CLIENT_SOURCE = `
var b={available:!1,token:void 0,character:void 0,check_availability:function(){},requests:[],
  request:function(url,opts){
    var r={url:url,opts:opts||{},doneHandlers:[],failHandlers:[],alwaysHandlers:[]};
    r.done=function(fn){r.doneHandlers.push(fn);return r};
    r.fail=function(fn){r.failHandlers.push(fn);return r};
    r.always=function(fn){r.alwaysHandlers.push(fn);return r};
    r.resolve=function(value){r.doneHandlers.forEach(function(fn){fn(value)});r.alwaysHandlers.forEach(function(fn){fn()})};
    r.reject=function(error){r.failHandlers.forEach(function(fn){fn(error)});r.alwaysHandlers.forEach(function(fn){fn()})};
    b.requests.push(r);
    return r;
  }};
var x={data:{},json:"",loaded:!1,save:function(){var t=JSON.stringify(this.data,null,"  ");t!==self.json&&(self.json=t,b.request("userdata.json",{type:"POST",contentType:"application/octet-stream",data:t}))},load:function(){var t=this;b.request("userdata.json",{dataType:"json"}).done(function(e){r.a.extend(!0,t.data,e),t.json=JSON.stringify(e,null,"  "),Object.keys(t.data).length>0&&st.Output.write_notification("Loaded user data"),t.loaded=!0}).fail(function(e,i,n){404!==e.status?(st.Output.write_notification("Failed to load user data"),t.loaded=!1):t.loaded=!0})},clear:function(){this.data={},this.loaded=!1}};
var r={a:{extend:function(deep,target,source){for(var k in source)target[k]=source[k];return target}}};
var N={connection:{send:function(t,e){N.sent.push([t,e])}},sent:[]},
    Z={aliases:[],save:function(){var t=JSON.stringify(this.aliases)},execute:function(t){return this.alias&&this.alias.execute(t)}},
    st={connect:function(){return console.log("Connection is opening")},is_connected:function(){return true},history:[],outgoing:[],InputHistory:{push:function(v){st.history.push(v)}},Process:{outgoing:function(v){st.outgoing.push(v)}},Output:{write_notification:function(){}}};
N.userdata=x.data;
window.$=window.jQuery={};
`;

// The pre-userdata layout: the bridge must still work if the manager cannot be
// found (for example after a web client deploy changes the minified shapes).
const LEGACY_CLIENT_SOURCE = `
var N={connection:{send:function(t,e){N.sent.push([t,e])}},sent:[]},
    Z={aliases:[],save:function(){var t=JSON.stringify(this.aliases)},execute:function(t){return this.alias&&this.alias.execute(t)}},
    st={connect:function(){return console.log("Connection is opening")},is_connected:function(){return true},history:[],outgoing:[],InputHistory:{push:function(v){st.history.push(v)}},Process:{outgoing:function(v){st.outgoing.push(v)}}};
window.$=window.jQuery={};
`;

function evaluatePatched(source) {
  const patched = injectGenesisClientHook(source);
  assert.ok(patched);
  const context = { window: {}, console };
  vm.runInNewContext(patched, context);
  return { context, bridge: context.window.genesisClient };
}

function last(array) {
  return array[array.length - 1];
}

function postRequests(requests) {
  return requests.filter((request) => request.opts.type === 'POST');
}

test('matches only the official app bundle URL', () => {
  assert.equal(
    isGameAppUrl('https://www.genesismud.org/play/app.c1cfe3a86c7dc76a4cf6.min.js'),
    true,
  );
  assert.equal(isGameAppUrl('https://www.genesismud.org/play/app.js'), true);
  assert.equal(
    isGameAppUrl('https://www.genesismud.org/play/chunks/vendors~app.abc.js'),
    false,
  );
  assert.equal(isGameAppUrl('https://evil.example/play/app.abc.js'), false);
  assert.equal(isGameAppUrl('http://www.genesismud.org/play/app.abc.js'), false);
  assert.equal(isGameAppUrl('not a url'), false);
});

test('injects the client bridge with the expected methods', () => {
  const { bridge } = evaluatePatched(CLIENT_SOURCE);

  assert.ok(bridge);
  assert.deepEqual(Object.keys(bridge), [
    'send',
    'sendRaw',
    'sendTyped',
    'isConnected',
    'isUserdataLoaded',
  ]);
  assert.equal(bridge.isUserdataLoaded(), false);
});

test('injects the bridge without userdata helpers when the layout is older', () => {
  const { bridge } = evaluatePatched(LEGACY_CLIENT_SOURCE);

  assert.ok(bridge);
  assert.deepEqual(Object.keys(bridge), ['send', 'sendRaw', 'sendTyped', 'isConnected']);
});

test('send runs the alias-aware client path', () => {
  const { context, bridge } = evaluatePatched(CLIENT_SOURCE);

  bridge.send('look');

  assert.deepEqual(Array.from(context.N.sent, (entry) => Array.from(entry)), [['look', true]]);
});

test('sendRaw stays raw', () => {
  const { context, bridge } = evaluatePatched(CLIENT_SOURCE);

  bridge.sendRaw('look');

  assert.deepEqual(Array.from(context.N.sent, (entry) => Array.from(entry)), [['look', undefined]]);
});

test('sendTyped records alias matches in history', () => {
  const { context, bridge } = evaluatePatched(CLIENT_SOURCE);
  context.Z.alias = { execute: () => true };

  bridge.sendTyped('gr');

  assert.deepEqual(Array.from(context.st.history), ['gr']);
  assert.deepEqual(Array.from(context.st.outgoing), []);
});

test('sendTyped sends when no alias matches', () => {
  const { context, bridge } = evaluatePatched(CLIENT_SOURCE);

  bridge.sendTyped('gr');

  assert.deepEqual(Array.from(context.st.history), []);
  assert.deepEqual(Array.from(context.st.outgoing), ['gr']);
});

test('isConnected reports the client connection state', () => {
  const { bridge } = evaluatePatched(CLIENT_SOURCE);

  assert.equal(bridge.isConnected(), true);
});

test('userdata stays bound to the live manager object', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);
  const exposed = context.N.userdata;

  assert.equal(exposed, context.x.data);

  context.x.data = { replacement: true };

  assert.equal(context.N.userdata, context.x.data);
  assert.deepEqual({ ...context.N.userdata }, { replacement: true });
});

test('clear keeps the userdata object identity and drops character keys', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);
  const exposed = context.N.userdata;
  context.x.data.oldKey = true;
  context.x.loaded = true;

  context.x.clear();

  assert.equal(context.N.userdata, exposed);
  assert.deepEqual({ ...exposed }, {});
  assert.equal(context.x.loaded, false);
});

test('load starts from a clean object so a missed disconnect cannot leak keys', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);
  const exposed = context.N.userdata;
  context.x.data.oldCharacter = true;

  context.x.load();

  assert.deepEqual({ ...exposed }, {});

  last(context.b.requests).resolve({ newCharacter: true });

  assert.deepEqual({ ...context.N.userdata }, { newCharacter: true });
  assert.equal(context.x.loaded, true);
});

test('a stale load response cannot overwrite the next character', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);

  context.x.load();
  const staleRequest = last(context.b.requests);

  context.x.clear();
  context.x.data.nextCharacter = 'mine';
  staleRequest.resolve({ previousCharacter: true });

  assert.deepEqual({ ...context.N.userdata }, { nextCharacter: 'mine' });
  assert.equal(context.x.loaded, false);
});

test('does not POST before the server copy has loaded', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);

  context.x.load();
  const loadRequest = last(context.b.requests);
  context.x.data.earlyWrite = true;
  context.x.save();

  assert.equal(postRequests(context.b.requests).length, 0);
  assert.equal(context.x.pending, true);

  loadRequest.resolve({ fromServer: true });

  const posts = postRequests(context.b.requests);
  assert.equal(posts.length, 1);
  assert.deepEqual(JSON.parse(posts[0].opts.data), { earlyWrite: true, fromServer: true });
});

test('a failed save is retried on the next change', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);
  context.x.loaded = true;
  context.x.json = '';
  context.x.data.value = 1;

  context.x.save();
  const first = last(postRequests(context.b.requests));
  assert.ok(first);

  first.reject({ status: 500 });
  assert.equal(context.x.json, '');

  context.x.data.value = 2;
  context.x.save();

  const posts = postRequests(context.b.requests);
  assert.equal(posts.length, 2);
  assert.deepEqual(JSON.parse(posts[1].opts.data), { value: 2 });
});

test('serialises saves so an older snapshot cannot land last', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);
  context.x.loaded = true;
  context.x.json = '';
  context.x.data.value = 1;

  context.x.save();
  const first = last(postRequests(context.b.requests));

  context.x.data.value = 2;
  context.x.save();

  assert.equal(postRequests(context.b.requests).length, 1);

  first.resolve();

  const posts = postRequests(context.b.requests);
  assert.equal(posts.length, 2);
  assert.deepEqual(JSON.parse(posts[1].opts.data), { value: 2 });
});

test('a save that finishes after a disconnect cannot affect the next character', () => {
  const { context } = evaluatePatched(CLIENT_SOURCE);
  context.x.loaded = true;
  context.x.json = '';
  context.x.data.value = 1;

  context.x.save();
  const first = last(postRequests(context.b.requests));

  context.x.clear();
  context.x.data.nextCharacter = true;
  first.resolve();

  assert.equal(context.x.json, '');
  assert.equal(context.x.saving, false);
  assert.equal(postRequests(context.b.requests).length, 1);
});

test('returns null when the bundle layout is not recognised', () => {
  assert.equal(injectGenesisClientHook('var something = 1;'), null);
  assert.equal(injectGenesisClientHook(null), null);
  assert.equal(
    injectGenesisClientHook('window.$=window.jQuery={}; window.genesisClient=1;'),
    null,
  );
});

test('installWebClientHook rewrites the app bundle and passes other URLs through', async () => {
  const session = {
    cleared: [],
    async clearStorageData(options) {
      this.cleared.push(options);
    },
    async clearCache() {
      this.cleared.push('cache');
    },
    protocol: {
      async handle(scheme, handler) {
        session.scheme = scheme;
        session.handler = handler;
      },
    },
  };

  const net = {
    async fetch(request) {
      if (request.url.includes('/play/app.')) {
        return new Response(CLIENT_SOURCE, {
          status: 200,
          headers: {
            'content-type': 'application/javascript',
            'content-encoding': 'gzip',
          },
        });
      }
      return new Response('passthrough', { status: 200 });
    },
  };

  const logs = [];
  const logger = {
    log: (message) => logs.push(message),
    warn: (message) => logs.push(message),
    error: (message) => logs.push(message),
  };

  const installed = await installWebClientHook({
    session,
    net,
    origin: 'https://www.genesismud.org',
    logger,
  });

  assert.equal(installed, true);
  assert.equal(session.scheme, 'https');
  assert.equal(session.cleared.length, 2);
  assert.equal(session.cleared[0].origin, 'https://www.genesismud.org');
  assert.deepEqual(session.cleared[0].storages, ['serviceworkers', 'cachestorage']);

  const appResponse = await session.handler({
    url: 'https://www.genesismud.org/play/app.abc.min.js',
  });
  assert.equal(appResponse.headers.get('content-encoding'), null);
  const body = await appResponse.text();
  assert.match(body, /window\.genesisClient=/);
  assert.ok(body.includes(USERDATA_PROTECTION_MARKER));
  assert.ok(logs.some((message) => message.includes('userdata protection on')));

  const otherResponse = await session.handler({
    url: 'https://www.genesismud.org/play/other.js',
  });
  assert.equal(await otherResponse.text(), 'passthrough');

  assert.equal(
    await installWebClientHook({
      session,
      net,
      origin: 'https://www.genesismud.org',
      logger,
    }),
    false,
  );
});

test('installWebClientHook requires a session and net', async () => {
  await assert.rejects(installWebClientHook({}), /requires a session and net/);
});
