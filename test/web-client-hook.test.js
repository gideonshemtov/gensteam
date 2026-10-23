const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const {
  injectGenesisClientHook,
  isGameAppUrl,
  installWebClientHook,
} = require('../js/WebClientHook');

// A tiny stand-in for the minified entry module. It has the same shapes the
// injector looks for, so the test exercises the same insertion point.
const CLIENT_SOURCE = `
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
  assert.match(await appResponse.text(), /window\.genesisClient=/);
  assert.ok(logs.some((message) => message.includes('Injected the client bridge')));

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
