# PROGRESS

## 2026-09-29 — Ported seal toggle, proforma invoice and weighing unit from micbac-invoice

**Done** (one commit each)
- Proforma invoice: Invoice Type select on step 1. Proforma prints "PROFORMA INVOICE" title/footer, no packing list, logged to the Sheet as `docType: proforma`; button label and email subject/body follow the type.
- "Include seal & signature" checkbox (beside the document-type bar) for invoice, quotation and letterhead. Off → blank box the same size as the signature image (648×220) so it can be stamped/signed by hand.
- Quotation weighing unit dropdown (MT / KGS / LBS) on the Goods step. Applies to weights only: goods-table Gross Wt header, Quotation Details gross/net labels, and those weights in the file. Qty is always MT and rate always RATE/MT. Invoice weights stay KGS. Legacy drafts with free-text units are mapped onto the dropdown.
- Top button renamed "Commercial Invoice" → "Invoice" (the type is chosen on step 1).

**Decisions / deviations**
- Scope of this first session was the three features only; the micbac bug fixes were ported in the next session (below). The dead-code cleanup was NOT ported.
- `buildDoc` (jsPDF) is still uncalled dead code here; jsPDF itself is still needed by the payment receipt, so the scripts stay.
- Proformas share the invoice numbering sequence (as before this change).
- The seal toggle does not affect the Payment Receipt (jsPDF, has no signature image).

**Open / next** — the micbac bug audit is ported below.

## 2026-09-29 — Ported the micbac bug audit (one commit each)

**Done** (92 browser checks + 12 unit tests pass)
- Amount in words → `js/amount-words.js` (lakh/crore for INR; was "undefined HUNDRED THOUSAND" from 2,000,000). Qty totals → `js/quantities.js` (no float noise, totalled per unit). Both unit-tested: `node --test`.
- Escaped user/Sheet data in the document builders, step-4 summary, goods table, Records table (currency, ids) and named-draft list.
- Ports: drafts, Sheet records **and the address book** all nested "INCCU — …" into the port on each reload; now matched by label (repairs existing data). Empty record port clears the picker instead of keeping the previous one.
- Letter: placeholder no longer printed, empty letter can't be downloaded; letter fields now saved in drafts (body sanitised on restore); date dd.mm.yyyy.
- Records: no duplicate Sheet row per re-download (FNV fingerprint in localStorage `ck_saved_fp`).
- Numbering: separate series `CKLLP/` invoice, `CKLLP/PI/` proforma, `CKLLP/QT/` quotation; new FY restarts at 001; Clone asks the Sheet; numbers upper-cased.
- Quotation: cleared Tolerance stays cleared. Named consignee prints its own name/address (tax code moved under notify party); addresses keep line breaks.
- Progress-bar jumps validate skipped steps. Preview shows the packing list. Email Draft opens one window with an "Open Gmail draft" toolbar link (second popup was blocked).
- `todayISO()` local-time helper (toISOString is UTC).

**Decisions / deviations**
- Invoice numbering with nothing to continue from still defaults to `CKLLP/007/26-27` (previous hard-coded value); other series and other FYs start at 001.
- Already there in CK, so not needed: Agent/Distributor printing, hiding notify address for "to the order", preview "undefined" guard, records-table port escaping.
- Duplicate-record guard is per browser; a different device can still add a row (would need a server-side upsert in Code.gs + redeploy).
- First re-download of each already-saved doc after deploy adds one more row (fingerprint shape changed).
- Not ported: dead-code cleanup (`buildDoc` still unused; jsPDF still needed for the payment receipt).

**Open / next**
- Invoice RATE column always says "/MT", even for rows in another unit (e.g. BAGS).


## 2026-11-25 — Free-text container type, optional PI/LC fields

**Done**
- Container Type is a free-text input with the old four values as datalist suggestions.
- Optional Proforma Invoice No./Dated, LC Number/Date, LC Issuing Bank on step 1. Only filled fields print (invoice + packing list ship grid, after Payment Terms); saved in drafts/records.

**Decisions / deviations**
- Not added to the Quotation. Also added to the unused jsPDF `buildDoc` so it stays consistent if revived.
- Rebased onto the ported micbac fixes; verified in the browser before the rebase, syntax-checked after (local server preview was not available).

## 2026-11-25 — Invoice/packing list/quotation always print on one A4 page

- Long addresses + PI/LC rows pushed the footer onto an almost-blank page 2. Each sheet's content is now wrapped in `.fit`; `ckFit()` (in the generated document) shrinks it with CSS `zoom` until it fits 297mm minus padding. Runs on load, fonts ready, invoice/packing toggle and `beforeprint`. Short documents are untouched (zoom 1).
- Checked in the browser: the SENA invoice fits at ~96%; a 12-row invoice fits at ~58%, still full width. Not checked: an actual print dialog (Chrome/Safari) and Firefox (needs ≥126 for `zoom`).

## 2026-11-25 — Bank account selector (DBS / YES Bank), as in micbac-invoice

- `BANK_INFO` → `BANKS` map + "Bank Account" select above the bank preview on step 1. Chosen account prints in the invoice/packing list Payment Details (and the unused jsPDF `buildDoc`). Saved in drafts/records; drafts without it load as DBS.
- YES Bank (Uditnagar): A/C 008127000000363, IFSC YESB0000081, SWIFT YESBINBBCHN. DBS stays the default.
