const test = require('node:test');
const assert = require('node:assert/strict');

const pkg = require('../package.json');
const BUNDLE_ID = require('../js/bundleId');

test('the runtime bundle id matches build.appId', () => {
  assert.equal(BUNDLE_ID, pkg.build.appId);
});
