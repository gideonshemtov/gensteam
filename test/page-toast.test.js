const test = require('node:test');
const assert = require('node:assert/strict');

const createPageToast = require('../js/PageToast');

function makeFakeDom() {
  const elements = {};
  const doc = {
    getElementById: (id) => elements[id] || null,
    createElement: () => ({ id: '', style: {}, textContent: '' }),
    documentElement: {
      appendChild: (element) => { elements[element.id] = element; },
    },
  };
  return { doc, elements };
}

test('creates a toast element and shows the message', () => {
  const { doc, elements } = makeFakeDom();
  const win = {};
  const toast = createPageToast(win, doc);

  toast('110%');

  const element = elements.__genesis_page_toast;
  assert.ok(element, 'expected a toast element to be created');
  assert.equal(element.textContent, '110%');
  assert.equal(element.style.opacity, '1');
  assert.match(element.style.cssText, /position:fixed/);
  assert.match(element.style.cssText, /top:12px/);
  assert.match(element.style.cssText, /right:12px/);

  clearTimeout(win.__genesisToastTimer);
});

test('reuses one element and applies variants', () => {
  const { doc, elements } = makeFakeDom();
  const win = {};
  const toast = createPageToast(win, doc);

  toast('first');
  toast('second', { variant: 'error' });

  assert.equal(Object.keys(elements).length, 1);
  assert.equal(elements.__genesis_page_toast.textContent, 'second');
  assert.notEqual(elements.__genesis_page_toast.style.background, 'rgba(20, 20, 20, 0.85)');

  clearTimeout(win.__genesisToastTimer);
});

test('fades out after the given duration', async () => {
  const { doc, elements } = makeFakeDom();
  const toast = createPageToast({}, doc);

  toast('bye', { duration: 10 });

  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(elements.__genesis_page_toast.style.opacity, '0');
});
