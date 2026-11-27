// Goods-row maths shared by the form and the documents.
// Loaded by index.html as a plain <script> (defines globals) and by the node
// tests via module.exports.
//
// A row is either a goods row ({qty, rate, ...}) or a charge row
// ({charge: true, rate, amount}) such as freight. A charge row has no qty of
// its own, so it must not count towards the tonnage or appear on the packing
// list. Its amount is rate x goods tonnage when a per-MT rate is given (e.g.
// freight $20/MT on 78 MT = $1,560), otherwise the lump-sum amount typed in.
(function (root) {
  function num(s) { return parseFloat(String(s == null ? '' : s).replace(/,/g, '')) || 0; }

  function isCharge(row) { return !!(row && row.charge); }

  // Total qty of goods rows only (charges excluded).
  function goodsQty(rows) {
    return rows.reduce((s, r) => s + (isCharge(r) ? 0 : num(r.qty)), 0);
  }

  // Line amount, in document currency, before any GST.
  function lineAmount(row, rows) {
    if (!isCharge(row)) return num(row.qty) * num(row.rate);
    return num(row.rate) > 0 ? num(row.rate) * goodsQty(rows) : num(row.amount);
  }

  function linesTotal(rows) {
    return rows.reduce((s, r) => s + lineAmount(r, rows), 0);
  }

  root.isCharge = isCharge;
  root.goodsQty = goodsQty;
  root.lineAmount = lineAmount;
  root.linesTotal = linesTotal;
  if (typeof module !== 'undefined' && module.exports) module.exports = { isCharge, goodsQty, lineAmount, linesTotal };
})(typeof window !== 'undefined' ? window : globalThis);
