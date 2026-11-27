// Run: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { isCharge, goodsQty, lineAmount, linesTotal } = require('../js/line-items.js');

const carbon = { desc: 'ACTIVATED CARBON', qty: 78, rate: 290 };

test('goods row amount is qty x rate', () => {
  assert.equal(lineAmount(carbon, [carbon]), 22620);
});

test('per-MT freight uses goods tonnage, not a qty of its own', () => {
  const freight = { charge: true, desc: 'FREIGHT COST', rate: 20, qty: 999 };
  const rows = [carbon, freight];
  assert.equal(lineAmount(freight, rows), 1560);
  assert.equal(linesTotal(rows), 24180);
});

test('charge rows do not add to tonnage', () => {
  const rows = [carbon, { charge: true, rate: 20 }, { desc: 'B', qty: '2,000.5', rate: 1 }];
  assert.equal(goodsQty(rows), 2078.5);
});

test('lump-sum charge when no rate is given', () => {
  const freight = { charge: true, rate: '', amount: '1,250.50' };
  assert.equal(lineAmount(freight, [carbon, freight]), 1250.5);
});

test('rate wins over a stale lump-sum amount', () => {
  const freight = { charge: true, rate: 10, amount: 5000 };
  assert.equal(lineAmount(freight, [carbon, freight]), 780);
});

test('empty and malformed values count as zero', () => {
  assert.equal(lineAmount({ qty: '', rate: 'abc' }, []), 0);
  assert.equal(lineAmount({ charge: true }, []), 0);
  assert.equal(linesTotal([]), 0);
  assert.equal(isCharge({}), false);
});
