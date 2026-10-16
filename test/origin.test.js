const test = require('node:test');
const assert = require('node:assert/strict');

const { sameOrigin } = require('../js/origin');

test('matches exact origins only', () => {
  assert.equal(sameOrigin('https://a.example/path', 'https://a.example'), true);
  assert.equal(sameOrigin('https://a.example.attacker.example/', 'https://a.example'), false);
  assert.equal(sameOrigin('https://b.example/', 'https://a.example'), false);
  assert.equal(sameOrigin('not a url', 'https://a.example'), false);
});
