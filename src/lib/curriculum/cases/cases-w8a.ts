// Case wave w8a — Module 5 toolkit capstone, first half (lesson 39), cs-1461…cs-1480.
// 20 cases: 6 easy / 7 medium / 7 hard, all topic "w8". The w8 spine is the
// full pipeline — slice (strftime/SUBSTR buckets) → fold (GROUP BY) → stage
// (CTE) → measure (windows: running totals, LAG/LEAD, NTILE, paint-over-fold,
// HAVING-before-window law) — with cast/text/date tools mixed in and
// reconciliation-as-audit asserts on ops-calendar deliverables.
// Every figure traces to committed probe receipts:
// scripts/m5-facts-w8.out (this wave's shared probes) and
// scripts/m5-facts-w8a.out (this half's distractor-landing probes).
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW8a: CaseStudy[] = [
  {
    id: "cs-1461",
    tier: "easy",
    topic: "w8",
    universe: "month-close",
    title: "The close calendar's landing row",
    brief:
      "From: Controller. Re: the close calendar.\n\nThe close calendar walks month buckets in order and lands on February to sign the quarter off: each row shows the month's revenue and the running total behind it, and the landing row must print both so the reviewer sees the 2,390.53 month against the full 34,833.28 climb. The draft lost its date code, its landing month and its assert figure. Rebuild the landing row.",
    ask: "One query: the 2025-02 bucket with its month revenue and the running total asserted at 34833.28.",
    template:
      "WITH m AS (SELECT strftime({1}, created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),\nr AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM m)\nSELECT mon, ROUND(rev, 2) AS rev, ROUND(running, 2) AS running FROM r WHERE mon = {2} AND running = {3};",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the month slicer",
        why: "strftime('%Y-%m', created_at) slices 103 orders into the 14 zero-padded month buckets the calendar walks — probed landing: 2025-02 carries 2390.53. '%d' would slice into day-of-month labels, '2025-02' would never match a bucket, and the pin would empty." },
      { answer: "'2025-02'", kind: "keyword", label: "the landing month",
        why: "February 2025 is the calendar's final bucket — probed: its row reads rev 2390.53 with the running line complete. Pin '2024-12' instead and the assert grabs a mid-year rung: rev 2101.47, running 30773.25 — six tickets short of the close." },
      { answer: "34833.28", kind: "number", label: "the asserted running total",
        why: "Probed: the last rung of SUM(rev) OVER (ORDER BY mon) is 34833.28 — the lifetime pot the close checklist reconciles against. 32442.75 is the January 2025 rung, one month early; pinned together with the February key the asserts contradict and the row empties." },
    ],
    distractors: ["'%d'", "'2024-12'", "32442.75"],
    walkthrough:
      "This is the close calendar in miniature — slice, fold, stage, measure. strftime('%Y-%m', created_at) slices the 103 orders into 14 sortable buckets; GROUP BY folds each bucket to one revenue figure (…2101.47 for 2024-12, 2390.53 for 2025-02); the stage hands those rows to SUM(rev) OVER (ORDER BY mon), which walks the running total 3731.97 → … → 34833.28. The outer pin lands on the final bucket and asserts both truths at once: the month's own 2390.53 and the completed climb 34833.28. Slice by day ('%d') and the month key can never match a bucket; land on December and you sign off on 30773.25 — a close that stops six tickets early. The double print is the audit: month money and cumulative money on one row, reconciled by the assert.",
  },
  {
    id: "cs-1462",
    tier: "easy",
    topic: "w8",
    universe: "growth",
    title: "The runner-up's shadow figure",
    brief:
      "From: Growth lead. Re: the leaderboard appendix.\n\nThe board deck's leaderboard appendix prints the champion and the runner-up, and the runner-up row carries a shadow figure: the spend of the customer directly ahead of them, pulled back by LAG so the gap reads without a second query. The draft lost its walk direction and its pin. Rebuild the runner-up's row with the shadow attached.",
    ask: "One query: Emma Wilson's row on the spend walk with the previous spender's 7262.35 as her shadow figure.",
    template:
      "WITH s AS (SELECT c.name AS name, ROUND(SUM(o.total), 2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id),\nl AS (SELECT name, spend, LAG(spend) OVER (ORDER BY spend {1}) AS prev FROM s)\nSELECT name, spend, prev FROM l WHERE name = {2} AND spend = {3} AND prev = {4};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the walk direction",
        why: "The leaderboard reads biggest-first, so LAG must walk spend DESC — probed: Emma's row then carries prev 7262.35, Alice's crown. Under ASC Emma's shadow is 4574.23 (Grace, the spender just below) and the assert on 7262.35 empties the row." },
      { answer: "'Emma Wilson'", kind: "keyword", label: "the pinned runner-up",
        why: "Emma is the deck's runner-up at 6640.56 — probed second on the sixteen-row league. Pin 'Grace Kim' and the pin collides with the spend assert: Grace sits at 4574.23, third place, not the row the appendix prints." },
      { answer: "6640.56", kind: "number", label: "the runner-up's spend",
        why: "Probed: 6640.56 is Emma's lifetime figure across 17 orders — the number the appendix quotes beside her name. 4574.23 is Grace's; pinned as the spend assert it describes the wrong customer and the row empties." },
      { answer: "7262.35", kind: "number", label: "the shadow figure",
        why: "Probed: LAG over the DESC walk hands Emma the spender directly ahead — Alice's 7262.35 — so the gap to the crown reads in one row. 4574.23 is the ASC shadow (Grace's figure behind Emma); the double assert spend = 6640.56 AND prev = 7262.35 is what pins the direction." },
    ],
    distractors: ["ASC", "100.0", "4574.23"],
    walkthrough:
      "The fold comes first: 103 orders collapse to sixteen customer spends, Alice 7262.35, Emma 6640.56, Grace 4574.23 at the top. Then the window measures: LAG(spend) OVER (ORDER BY spend DESC) walks the league biggest-first and hands each row its predecessor's figure — the shadow. On Emma's row the shadow is 7262.35, Alice's crown, which is the whole point of the appendix: runner-up and target on one line. Flip the walk to ASC and the same LAG hands Emma 4574.23 — Grace, the spender just below — a shadow from the wrong side of the ladder; the triple assert (name, spend, prev) is built to catch exactly that flip. The staging matters too: the window must run over the full fold, so the pin lives in the outer query, not inside the staged SELECT where it would leave LAG reading a one-row league.",
  },
  {
    id: "cs-1463",
    tier: "easy",
    topic: "w8",
    universe: "refund-audit",
    title: "The dunning list's riding pot",
    brief:
      "From: Collections. Re: the dunning list header.\n\nCollections works the dunning list top-down: every at-risk customer ranked by exposure, with the whole uncollectible pot painted on each row so the collector sees their share of the total at a glance. Farid's line is the sample row for the SOP. The draft lost its status pool, its pin and its rank. Rebuild Farid's dunning row.",
    ask: "One query: Farid Nasser's exposure row, ranked 4th, with the 7265.49 at-risk pot painted alongside.",
    template:
      "WITH e AS (SELECT c.name AS name, ROUND(SUM(o.total), 2) AS exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ({1}) GROUP BY c.id),\np AS (SELECT name, exposure, RANK() OVER (ORDER BY exposure DESC) AS rk, SUM(exposure) OVER () AS pot FROM e)\nSELECT name, exposure, rk, ROUND(pot, 2) AS pot FROM p WHERE name = {2} AND rk = {3};",
    slots: [
      { answer: "'pending','cancelled'", kind: "keyword", label: "the at-risk status pool",
        why: "Uncollectible exposure means pending plus cancelled — probed: that pool folds to 8 customers worth 7265.49, Farid at 1088.44 rank 4. Shrink the pool to 'pending' alone and Farid climbs to rank 3 (Alice drops out of the top four); widen it with 'shipped' and he reads rank 1 — neither is the dunning list." },
      { answer: "'Farid Nasser'", kind: "keyword", label: "the sample dunning row",
        why: "Farid is the SOP's sample: 1088.44 of exposure, mid-list, where the pot paint shows its value. Pin 'Alice Chen' and the rank assert breaks — she reads rank 3 at 1283.65, not the pinned 4." },
      { answer: "4", kind: "number", label: "the asserted rank",
        why: "Probed ladder: Emma 1615.29, Chloe 1309.92, Alice 1283.65, then Farid 1088.44 at rank 4 — the assert pins his exact rung. Under a pending-only pool Farid sits at rank 3, so the assert is what detects a mis-scoped status pool." },
    ],
    distractors: ["'pending'", "'pending','shipped'", "1"],
    walkthrough:
      "Slice the orders by risk first: WHERE status IN ('pending','cancelled') keeps the 21 uncollectible tickets, and the fold collapses them to eight customer exposures — Emma 1615.29 on top, Farid 1088.44 fourth. The stage then paints two windows over the fold: RANK() orders the dunning ladder, and SUM(exposure) OVER () rides the full 7265.49 pot onto every row without collapsing it — each collector sees their line and the whole book together. The pin asserts Farid at rank 4, which doubles as the pool audit: drop 'cancelled' from the pool and Farid's rank shifts to 3 (probed pending-only ladder), add 'shipped' and it collapses to 1 — the assert empties either way. Rank 1 would pin Emma, whose exposure is the worst case, not the sample mid-list row the SOP walks new collectors through.",
  },
  {
    id: "cs-1464",
    tier: "easy",
    topic: "w8",
    universe: "catalog",
    title: "The bin-label wall's painted shelf",
    brief:
      "From: Warehouse ops. Re: the bin-label print run.\n\nBin labels print from the catalog ranked by name length — longest names get the widest labels first — and every print row carries the shelf size painted on it so the print job can reconcile against the full 16-SKU catalog. The 23-character headset is the longest label and the sample row. The draft lost its direction, its pin and its length. Rebuild the sample label row.",
    ask: "One query: the Noise-Canceling Headset row with its name length 23, its rank 1, and the 16-SKU shelf painted on it.",
    template:
      "WITH w AS (SELECT name, LENGTH(name) AS len, RANK() OVER (ORDER BY LENGTH(name) {1}) AS rk, COUNT(*) OVER () AS shelf FROM products)\nSELECT name, len, rk, shelf FROM w WHERE name = {2} AND len = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the label direction",
        why: "Widest labels print first, so the walk sorts LENGTH(name) DESC — probed: the 23-character headset takes rank 1. ASC flips the same walk and hands it rank 16, last in the print run, which the rk column exposes on the pinned row." },
      { answer: "'Noise-Canceling Headset'", kind: "keyword", label: "the sample label row",
        why: "The headset is the catalog's longest name at 23 characters — probed rank 1 under DESC, ahead of the 22-character pair. Pin 'Mechanical Keyboard K1' and the length assert breaks: that name is 22, not the pinned 23." },
      { answer: "23", kind: "number", label: "the asserted name length",
        why: "Probed: LENGTH('Noise-Canceling Headset') = 23, the catalog's max (min is 13). 22 is the length of the Mechanical Keyboard and Bluetooth Speaker pair — pinned against the headset's name it contradicts the row and empties it." },
    ],
    distractors: ["ASC", "16", "22"],
    walkthrough:
      "One pass, two windows, no fold needed: LENGTH(name) measures each of the 16 names, RANK() OVER (ORDER BY LENGTH(name) DESC) builds the print order — 23, then the 22 pair at rank 2, the 21 at rank 4 — and COUNT(*) OVER () paints 16, the whole shelf, onto every row so the print job reconciles itself against the catalog. The pin lands on the headset: len 23, rank 1, shelf 16. Flip the direction and the query still runs, but the rk column quietly reads 16 — the headset at the back of the print run, the opposite of widest-first; that rk cell is the audit. The length assert does the other half: 22 belongs to the keyboard/speaker pair, and pinning it beside the headset's name empties the row instead of printing a mis-measured label.",
  },
  {
    id: "cs-1465",
    tier: "easy",
    topic: "w8",
    universe: "expense",
    title: "The burn line's opener anchor",
    brief:
      "From: Finance partner. Re: the burn review.\n\nThe burn review reads the expense calendar month by month and anchors every row on the opener: the first month's burn, painted by FIRST_VALUE so February's finish can be judged against where the year started. The draft lost its painter, its landing month and its anchor figure. Rebuild February's row with the 1719 anchor attached.",
    ask: "One query: the 2025-02 expense bucket with its 1650 spend and the 1719 opening-month anchor painted on it.",
    template:
      "WITH e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spent FROM expenses GROUP BY mon),\na AS (SELECT mon, spent, {1}(spent) OVER (ORDER BY mon) AS anchor FROM e)\nSELECT mon, spent/100.0 AS spend, anchor/100.0 AS anchor FROM a WHERE mon = {2} AND anchor/100.0 = {3};",
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", label: "the anchor painter",
        why: "The anchor is the walk's opening month, so FIRST_VALUE(spent) OVER (ORDER BY mon) paints 1719 — January 2024's burn — onto every row, probed. LAST_VALUE with the same window degenerates to the current row and paints 1650 on February: the anchor becomes February judging itself." },
      { answer: "'2025-02'", kind: "keyword", label: "the landing month",
        why: "February 2025 closes the calendar at 1650 — probed final bucket of the 14-month expense walk. Pin '2025-01' and the row lands a month early: spend 1959, anchor still 1719, a different line of the review." },
      { answer: "1719", kind: "number", label: "the asserted anchor",
        why: "Probed: the calendar's opening bucket is 2024-01 at 1719, and FIRST_VALUE carries it to every row including February's. 1650 is February's own spend — the LAST_VALUE degeneration — and asserting it as the anchor means the row was never anchored at all." },
    ],
    distractors: ["LAST_VALUE", "'2025-01'", "1650"],
    walkthrough:
      "The expense calendar is slice-fold-stage-measure: strftime('%Y-%m', spent_on) slices 36 receipts into 14 buckets, GROUP BY folds each to its cents, and the stage walks them in month order. FIRST_VALUE reads the frame's first row — 2024-01's 1719 — and paints it down the whole walk, which is what lets the review say 'February finished at 1650 against a 1719 opener' in one row. Swap the painter for LAST_VALUE and the frame's last row is the current row itself under the default frame, so the anchor collapses to February's own 1650 — the trap the assert is built to catch: anchor = 1719 fails the moment the painter forgets its job. Land on January 2025 instead and the row reads 1959 against the same 1719 anchor — a true row, but not the closing month the review pins.",
  },
  {
    id: "cs-1466",
    tier: "easy",
    topic: "w8",
    universe: "supplier",
    title: "The rating tile's painted band count",
    brief:
      "From: Procurement. Re: the supplier scorecard's tier map.\n\nThe scorecard deals the six suppliers into three rating tiles — top third, middle third, bottom third — and the tile table must carry the band count painted on it so a reader can tell a three-tile map from a two-tile halves map at a glance. The top tile should read two suppliers with a 4.6 floor. The draft lost its tile count, its direction and its band pin. Rebuild the top tile row.",
    ask: "One query: rating tile 1 of a three-tile deal — 2 suppliers, floor 4.6, ceiling 4.8 — with the 3-tile count painted on it.",
    template:
      "WITH b AS (SELECT rating, NTILE({1}) OVER (ORDER BY rating {2}) AS band FROM suppliers),\nx AS (SELECT band, COUNT(*) AS n, MIN(rating) AS lo, MAX(rating) AS hi, COUNT(*) OVER () AS bands FROM b GROUP BY band)\nSELECT band, n, lo, hi, bands FROM x WHERE band = {3} AND lo = 4.6;",
    slots: [
      { answer: "3", kind: "number", label: "the tile count",
        why: "The scorecard deals six suppliers into thirds — probed: NTILE(3) DESC reads 2/2/2, and the painted bands column stamps 3 on every tile row. Deal into 2 instead and the top tile becomes three suppliers with a 4.4 floor — a halves map, not the thirds map the pin demands." },
      { answer: "DESC", kind: "keyword", label: "the rating direction",
        why: "Tile 1 must hold the best ratings, so the deal sorts rating DESC — probed top tile {4.8, 4.6}, floor 4.6. ASC deals from the bottom up and tile 1 becomes {3.9, 4.0} with floor 3.9: the same query crowning the worst suppliers." },
      { answer: "1", kind: "number", label: "the pinned band",
        why: "The scorecard's headline tile is band 1 — probed: n 2, lo 4.6, hi 4.8, bands 3. Pin band 2 and the floor assert grabs the middle tile at 4.1, and band 3 grabs 3.9; only band 1 matches lo = 4.6." },
    ],
    distractors: ["0", "ASC", "2"],
    walkthrough:
      "NTILE is the dealer: NTILE(3) OVER (ORDER BY rating DESC) deals the six ratings 4.8, 4.6, 4.4, 4.1, 4.0, 3.9 into three tiles of two — remainder rows go to the front tiles, so the deal is exactly 2/2/2. The fold then describes each tile (n, floor, ceiling) and COUNT(*) OVER () paints the bucket count 3 onto every tile row — the painted bands stamp that distinguishes a thirds map from a halves map. The assert pins tile 1 by its floor: lo = 4.6 only holds when the deal is DESC thirds; deal ASC and tile 1 floors at 3.9, deal halves and the top tile floors at 4.4 with three members (probed) — the assert empties both times. And NTILE(0) isn't a smaller deal, it's an engine error: the dealer demands a positive integer.",
  },
  {
    id: "cs-1467",
    tier: "medium",
    topic: "w8",
    universe: "fraud",
    title: "The modal ship day's fleet reconciliation",
    brief:
      "From: Fraud spot-check lead. Re: the shipping-speed baseline.\n\nBefore we chase ghost-shipment claims we baseline the real fulfillment rhythm: bucket shipped orders by whole-day transit lag, and the modal bucket must reconcile against the shipped fleet — its painted fleet column reads 82, not the 103-order catalog, because 21 orders never shipped. The draft lost its bucket key and both pins. Rebuild the modal row.",
    ask: "One query: the 3-day transit bucket — 30 orders — with the 82-order shipped fleet painted on it.",
    template:
      "WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY {1})\nSELECT days, n, shipped_total FROM d WHERE days = {2} AND n = {3};",
    slots: [
      { answer: "days", kind: "keyword", label: "the transit bucket key",
        why: "The fleet must fold by the computed whole-day lag — probed census: exactly three buckets, 2 days × 27, 3 days × 30, 4 days × 25. Fold by created_at instead and the CAST lag lands in 66 per-timestamp buckets where no bucket holds 30, and the modal pin empties." },
      { answer: "3", kind: "number", label: "the modal transit lag",
        why: "Probed: 3 whole days is the modal lag — 30 of the 82 shipped orders, ahead of 2 days (27) and 4 days (25). Pin 2 and the count assert grabs 27, a bucket the fraud baseline doesn't headline." },
      { answer: "30", kind: "number", label: "the modal bucket count",
        why: "Probed: the 3-day bucket holds 30 orders — the biggest fold the shipped fleet produces. 21 is the unshipped pile's size (103 minus 82): no transit bucket holds 21, so pinning it means the WHERE fence quietly failed to keep the never-shipped rows out." },
    ],
    distractors: ["created_at", "2", "21"],
    walkthrough:
      "The pipeline is cast → fence → fold → paint: julianday(shipped_at) − julianday(created_at) measures each transit in fractional days, CAST … AS INTEGER floors it to whole days, WHERE shipped_at IS NOT NULL fences the 21 never-shipped orders out, and the fold produces exactly three buckets — 27, 30, 25. The window paint is the reconciliation: SUM(COUNT(*)) OVER () stamps 82, the shipped fleet, onto every bucket, and the fraud check is that 82 ≠ 103 — the 21-ticket gap is the pile the baseline can't vouch for. Fold by created_at and the lag column shatters into 66 timestamp buckets (probed), none with 30 members; pin the 2-day bucket and you headline 27 orders the memo never claimed. The double pin (days 3 AND n 30) is what makes the modal row provably the modal row.",
  },
  {
    id: "cs-1468",
    tier: "medium",
    topic: "w8",
    universe: "inventory",
    title: "The thin-stock tail's last rung",
    brief:
      "From: Ops manager. Re: the reorder walk.\n\nThe reorder walk climbs the thin shelf — every SKU at or under the 70-unit fence — accumulating stock as it goes, and the walk's last rung is the reconciliation: the whole thin pile in one number, printed on the fence's boundary row. The draft lost its accumulator, its fence value and its landing row. Rebuild the last rung.",
    ask: "One query: the 4K Webcam Pro row of the ≤70 stock walk, with the 215-unit pile asserted as its running total.",
    template:
      "WITH tail AS (SELECT name, stock, {1}(stock) OVER (ORDER BY stock, id) AS running FROM products WHERE stock <= {2})\nSELECT name, stock, ROUND(running, 2) AS running FROM tail WHERE name = {3} AND running = {4};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the pile accumulator",
        why: "The rung must carry the accumulated pile, so SUM(stock) OVER (ORDER BY stock, id) — probed rungs 40, 85, 145, 215. AVG with the same walk reads means, not money: 53.75 on the last rung (215 ÷ 4), a number no reorder note would print as a pile." },
      { answer: "70", kind: "number", label: "the thin-stock fence",
        why: "The thin pile is everything at or under 70 — probed: exactly four SKUs (40, 45, 60, 70), and the walk's rungs end at 215. Drop the fence to 50 and the tail is {40, 45} only: the boundary row never enters the walk and the pin empties." },
      { answer: "'4K Webcam Pro'", kind: "keyword", label: "the boundary landing row",
        why: "The webcam sits exactly on the fence at 70 units, so its rung is the walk's last — probed 215. Pin 'Smart Watch S' and the assert collides with the running pin: that row's rung is 40, the walk's first, not its last." },
      { answer: "215", kind: "number", label: "the asserted pile figure",
        why: "Probed: 40 + 45 + 60 + 70 = 215 lands on the fence row — the whole thin pile in one rung. 145 is the third rung (the 60-unit headset's), one SKU short of the reconciliation; the assert is what proves the walk reached the fence." },
    ],
    distractors: ["AVG", "MIN", "50"],
    walkthrough:
      "The fence comes first because it defines the pile: WHERE stock <= 70 keeps exactly four SKUs — Smart Watch 40, Desktop Mic 45, Noise-Canceling Headset 60, 4K Webcam 70. Then the walk: SUM(stock) OVER (ORDER BY stock, id) accumulates in shelf order — 40, 85, 145, 215 — and the tie-break by id keeps the walk deterministic if two SKUs ever share a stock level. The last rung is the deliverable: on the boundary row the accumulator prints the entire thin pile, 215, which is the number the reorder note carries. Swap the accumulator for AVG and the same walk prints means (53.75 at the top rung, 48.33 at the headset's — probed), a smoothing line, not a pile; tighten the fence to 50 and the webcam never enters the walk at all. The running pin = 215 is the reconciliation that the walk covered every fenced SKU.",
  },
  {
    id: "cs-1469",
    tier: "medium",
    topic: "w8",
    universe: "funnel",
    title: "The funnel map's APAC row",
    brief:
      "From: Growth marketing. Re: the regional funnel map.\n\nThe funnel map ranks the four regions by booked revenue and paints each row's slice of the 34,833.28 pot, so the deck can show share and rank side by side. APAC is the row the deck zooms: 37 orders, 11,605.45 booked, second on the map. The draft lost its direction, its region pin and its revenue assert. Rebuild the APAC row.",
    ask: "One query: the APAC funnel row — 37 orders, 11605.45 revenue — with its 33.3 percent share and rank 2 painted on it.",
    template:
      "WITH f AS (SELECT c.region AS region, COUNT(*) AS n, ROUND(SUM(o.total), 2) AS rev FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region),\nx AS (SELECT region, n, rev, ROUND(100.0*rev/SUM(rev) OVER (), 1) AS pct, RANK() OVER (ORDER BY rev {1}) AS rk FROM f)\nSELECT region, n, rev, pct, rk FROM x WHERE region = {2} AND rev = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the map direction",
        why: "The funnel map reads biggest-revenue-first, so the rank window sorts rev DESC — probed: EU 15089.23 at rank 1, APAC 11605.45 at rank 2. ASC re-deals the podium and APAC drops to rank 3 behind US, which the pinned row's rk cell exposes." },
      { answer: "'APAC'", kind: "keyword", label: "the pinned region",
        why: "APAC is the zoom row — probed: 37 orders folding to 11605.45, a 33.3 share. The revenue assert doubles as the pin check: 'EU' holds 15089.23, so pinning EU against rev = 11605.45 empties the row rather than mislabeling the wedge." },
      { answer: "11605.45", kind: "number", label: "the asserted booked revenue",
        why: "Probed: APAC's 37 orders sum to 11605.45 — 33.3 of the 34833.28 pot, second only to EU. 15089.23 is EU's figure; pinned beside APAC's name the asserts contradict and the deck row would print a wedge nobody drew." },
    ],
    distractors: ["ASC", "37", "15089.23"],
    walkthrough:
      "Slice by region, fold, then let the stage do the deck work: the fold produces four rows (EU 45 orders / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44), the share window divides each by the painted whole pot — 33.3 for APAC — and RANK() OVER (ORDER BY rev DESC) stamps the podium order. The pinned row carries all of it: 37 orders, 11605.45, 33.3, rank 2. Flip the direction and the same window re-deals the podium — LATAM 1, US 2, APAC 3 — which is the map answering 'smallest first'; the rk cell on the pinned row is the audit. The 37 chip is the region's own order count, the classic funnel mix-up of tickets for money: pinned as the revenue assert it empties the row, because 37 dollars is no region's book.",
  },
  {
    id: "cs-1470",
    tier: "medium",
    topic: "w8",
    universe: "pricing",
    title: "The crown SKU's distance from the mean",
    brief:
      "From: Pricing review. Re: the premium memo.\n\nThe pricing memo anchors on one figure: how far the catalog's crown SKU sits above the mean shelf price — the paint is AVG(price) OVER () carried to every row, and the crown's gap is the headline. The draft lost its painter and both pins. Rebuild the crown's gap row: 199.99 priced, 128.21 above the mean.",
    ask: "One query: the Smart Watch S row with its 199.99 price and its 128.21 gap above the mean shelf price.",
    template:
      "WITH g AS (SELECT name, price, ROUND(price - {1}(price) OVER (), 2) AS gap FROM products)\nSELECT name, price, gap FROM g WHERE gap = {2} AND price = {3};",
    slots: [
      { answer: "AVG", kind: "keyword", label: "the mean painter",
        why: "The gap is measured against the average shelf price, so AVG(price) OVER () paints 71.78 onto all 16 rows — probed: the watch's gap is 199.99 − 71.78 = 128.21. MAX(price) OVER () paints the crown's own 199.99, every gap reads against the watch itself, and the 128.21 assert finds zero rows (probed)." },
      { answer: "128.21", kind: "number", label: "the asserted gap",
        why: "Probed: the biggest above-mean gap in the catalog is 128.21 — the watch's distance over the 71.78 mean. 71.78 itself pins the mean, where no product sits (probed: zero rows), and −22.78 pins the hub BELOW the mean, the wrong side of the memo." },
      { answer: "199.99", kind: "number", label: "the crown's price",
        why: "Probed: 199.99 is the shelf's ceiling — the Smart Watch S — and the only price whose gap reads 128.21. The double pin (gap AND price) is what names the crown row instead of trusting the gap alone." },
    ],
    distractors: ["MAX", "71.78", "-22.78"],
    walkthrough:
      "The mean-gap paint is the pattern: AVG(price) OVER () walks the 16-row catalog ungrouped and stamps 71.78 (1148.43 ÷ 16) on every row, so each product's gap is its price minus the shelf mean — six SKUs sit above it, and the crown sits furthest: 199.99 − 71.78 = 128.21 (probed). The pin asserts the pair — gap 128.21 AND price 199.99 — which names the Smart Watch S row beyond doubt. The MAX painter is the classic substitution: it paints the ceiling instead of the mean, every 'gap' collapses to price-minus-itself, and the crown's own row reads 0 while the 128.21 assert finds nothing (probed zero rows). The 71.78 chip pins the mean line, where no SKU lives, and −22.78 pins the USB-C Hub at 49 — 22.78 BELOW the mean, the memo's bargain footnote, not its headline.",
  },
  {
    id: "cs-1471",
    tier: "medium",
    topic: "w8",
    universe: "month-close",
    title: "The unshipped pile's two-row fold",
    brief:
      "From: Controller. Re: the close checklist's exposure line.\n\nThe close checklist carries one exposure line: the unshipped pile folded by status, with the whole pile's pot painted on each surviving row. The checklist's filter logic is deliberately loose — keep any status worth 7 or 14 tickets — because the two surviving rows must both carry the 7265.49 pot for the reconciliation. The draft lost its painter, its fence and its count pin. Rebuild the two-row fold.",
    ask: "One query: pending and cancelled rows with counts 14 and 7, each carrying the 7265.49 unshipped pot.",
    template:
      "SELECT status, COUNT(*) AS n, ROUND({1}(SUM(total)) OVER (), 2) AS pot\nFROM orders WHERE {2} GROUP BY status\nHAVING COUNT(*) = 7 OR COUNT(*) = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the pot painter",
        why: "The painted figure is the whole pile's money, so SUM(SUM(total)) OVER () over the two folded rows paints 7265.49 (1152.49 + 6113) — probed. AVG paints 3632.74, a per-status mean no reconciliation quotes, and MAX paints 6113, the pending bucket alone (probed)." },
      { answer: "shipped_at IS NULL", kind: "keyword", label: "the unshipped fence",
        why: "The exposure line is the never-shipped pile, so the fence is shipped_at IS NULL — probed: 21 orders, folding to pending 14 / cancelled 7. Flip to IS NOT NULL and the fold holds shipped 52 / delivered 30: no bucket matches the 7-or-14 filter and the checklist line empties." },
      { answer: "14", kind: "number", label: "the pending count pin",
        why: "Probed: pending is the pile's big half at 14 tickets — the OR-arm that keeps both rows in the checklist. Swap it for 21 (the whole pile's ticket count) and only the cancelled row survives, printing a 1152.49 pot (probed) instead of the reconciled 7265.49." },
    ],
    distractors: ["AVG", "shipped_at IS NOT NULL"],
    walkthrough:
      "This fold hides the wave's sharpest law: HAVING runs before the window. WHERE shipped_at IS NULL trims 103 orders to the 21 unshipped; GROUP BY folds them to cancelled 7 / pending 14; the HAVING keeps both rows via the 7-or-14 arms; and only then does SUM(SUM(total)) OVER () walk the two survivors, painting 7265.49 on each — the inner SUM is the fold's per-status money, the outer SUM the window's pot. The reconciliation is the paint itself: both rows carrying the identical 7265.49 proves the window ran after the fold, over the whole pile. Flip the fence to IS NOT NULL and the fold describes the fulfilled fleet (52 and 30) — nothing matches the 7-or-14 arms and the line goes dark. Loosen the count pin to 21 and the HAVING eats the pending row, leaving a lone 1152.49: a half-pile masquerading as the exposure line. And note what the fence does NOT do: a bare-constant fence (WHERE 21) is always true, yet the fold still lands on the same two survivors — the 7-or-14 arms re-pin them — which is exactly why the fence chip has to be the honest shipped_at test rather than a number.",
  },
  {
    id: "cs-1472",
    tier: "medium",
    topic: "w8",
    universe: "refund-audit",
    title: "The aging ladder's October rung",
    brief:
      "From: Support lead. Re: the aging report's milestone.\n\nThe aging report walks the unshipped backlog month by month, accumulating tickets as it climbs, and October is the milestone row: the month the backlog crossed into double digits-plus, holding 2 new tickets at a 14-ticket rung. The draft lost its date column, its accumulator and its month pin. Rebuild the October rung.",
    ask: "One query: the 2024-10 bucket of the unshipped aging walk — 2 new tickets, cumulative 14 — with the rung asserted.",
    template:
      "WITH u AS (SELECT strftime('%Y-%m', {1}) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon),\nr AS (SELECT mon, n, {2}(n) OVER (ORDER BY mon) AS aging FROM u)\nSELECT mon, n, aging FROM r WHERE mon = {3} AND aging = 14;",
    slots: [
      { answer: "created_at", kind: "keyword", label: "the backlog date column",
        why: "Backlog age is measured from order creation, so the slicer reads created_at — probed: ten buckets from 2024-01 (3 tickets) to 2025-02 (1). Slicing shipped_at feeds NULLs to strftime (every unshipped row has one) and collapses the walk to a single NULL bucket the October pin can't find." },
      { answer: "SUM", kind: "keyword", label: "the aging accumulator",
        why: "Aging accumulates, so SUM(n) OVER (ORDER BY mon) — probed rungs 3, 4, 7, 9, 12, 14 … 21. COUNT with the same window counts buckets, not tickets: 6 at October (probed), a month-count wearing an aging label, and the 14 rung never appears." },
      { answer: "'2024-10'", kind: "keyword", label: "the milestone month",
        why: "October is the milestone: probed row 2024-10, n 2, aging 14 — the rung the report headlines. Pin '2024-11' and the assert grabs the next rung at 17 (3 new tickets); the 14 pin only holds on October." },
    ],
    distractors: ["shipped_at", "COUNT", "'2024-11'"],
    walkthrough:
      "The aging walk is slice → fence → fold → measure: WHERE shipped_at IS NULL fences the 21 never-shipped orders, strftime('%Y-%m', created_at) slices them into ten month buckets (some months contribute nothing), the fold counts each, and SUM(n) OVER (ORDER BY mon) climbs the ladder 3 → 4 → 7 → 9 → 12 → 14 → 17 → 18 → 20 → 21. October's rung is the milestone the SOP quotes: 2 new tickets, cumulative 14. The COUNT substitution is the subtle one — COUNT(n) OVER (ORDER BY mon) is legal SQL that counts buckets, so it prints 6 at October (probed): a plausible-looking number that is not an aging figure, which is exactly why the 14 rung is asserted. And the date column is a schema fact, not a preference: the backlog ages on created_at, while shipped_at is NULL on every row the fence kept, and strftime of NULL melts the whole walk into one bucket.",
  },
  {
    id: "cs-1473",
    tier: "medium",
    topic: "w8",
    universe: "growth",
    title: "The activity board's bronze row",
    brief:
      "From: Growth lead. Re: the activity board.\n\nThe activity board ranks customers by order count and paints each row's slice of the 103-ticket pot, and the bronze row is the sanity check the deck re-runs every cycle: 14 orders, 13.6 percent, third on the board. The draft lost its direction, its customer pin and its share assert. Rebuild the bronze row.",
    ask: "One query: Grace Kim's activity row — 14 orders, 13.6 percent share — painted and ranked 3 on the board.",
    template:
      "WITH b AS (SELECT c.name AS name, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id),\nx AS (SELECT name, n, ROUND(100.0*n/SUM(n) OVER (), 1) AS pct, RANK() OVER (ORDER BY n {1}) AS rk FROM b)\nSELECT name, n, pct, rk FROM x WHERE name = {2} AND pct = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the board direction",
        why: "The board reads most-active-first, so the rank window sorts n DESC — probed: Alice 24 at rank 1, Emma 17 at rank 2, Grace 14 at rank 3. ASC flips the deal and hands Grace rank 14 (probed, staged over the full fold) — the bronze row reading from the bottom." },
      { answer: "'Grace Kim'", kind: "keyword", label: "the pinned bronze row",
        why: "Grace is the board's bronze — probed 14 orders, 13.6 share, rank 3. Pin 'Alice Chen' and the share assert breaks immediately: the crown's slice is 23.3, not the 13.6 the bronze row carries." },
      { answer: "13.6", kind: "number", label: "the asserted share",
        why: "Probed: 14 of 103 tickets reads 13.6 — Grace's slice of the pot, painted by 100.0*n/SUM(n) OVER (). 23.3 is Alice's crown share; pinned against Grace's name the asserts contradict and the row empties." },
    ],
    distractors: ["ASC", "14", "23.3"],
    walkthrough:
      "Fold, paint, rank — the board in one stage stack: GROUP BY c.id folds 103 orders into sixteen activity counts; SUM(n) OVER () paints the ticket pot so each row reads its share (Alice 24 → 23.3, Emma 17 → 16.5, Grace 14 → 13.6); RANK() OVER (ORDER BY n DESC) stamps the podium. The pin asserts the bronze pair — name Grace Kim AND share 13.6 — because the deck quotes them together. The direction flip is the board's classic failure mode: ASC keeps every number alive but re-deals the podium, and the staged rank quietly reads 14 for Grace (probed) — a bronze row printed from the cellar. The 14 chip is the trap of quoting the count where the share belongs: pinned into the pct assert it finds no such slice, because 13.6 is the only number the bronze row's paint produces.",
  },
  {
    id: "cs-1474",
    tier: "hard",
    topic: "w8",
    universe: "pricing",
    title: "The premium tile's 52.1 percent",
    brief:
      "From: Pricing review. Re: the shelf's quartile map.\n\nThe review deals the 16-SKU shelf into four price tiles, folds each tile's money, and the premium tile's row is the map's headline: 597.98 of shelf value in four SKUs — 52.1 percent of everything on the shelf, painted by a window over the folded tiles. The draft lost its deal direction and both pins. Rebuild the premium tile row.",
    ask: "One query: price tile 1 of the DESC deal — 597.98 tile value, 52.1 percent share — with both figures asserted.",
    template:
      "WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price {1}) AS band FROM products),\ns AS (SELECT band, ROUND(SUM(price), 2) AS tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (), 1) AS pct FROM t GROUP BY band)\nSELECT band, tile_price, pct FROM s WHERE band = {2} AND pct = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the deal direction",
        why: "Tile 1 must hold the premium shelf, so the deal sorts price DESC — probed: band 1 sums 597.98, a 52.1 share. ASC deals from the bargain bin and band 1 becomes the 90.48 tile (probed) — same query, inverted map, and the 52.1 assert empties." },
      { answer: "1", kind: "number", label: "the pinned band",
        why: "The headline is the premium tile — probed band 1: 597.98 at 52.1. Pin band 4 and the assert grabs the bargain tile: 90.48 at 7.9 (probed), the deal's smallest quarter, not the map's headline." },
      { answer: "52.1", kind: "number", label: "the asserted share",
        why: "Probed: 100.0 × 597.98 / 1148.43 reads 52.1 — more than half the shelf's value in four SKUs, the map's whole argument. 7.9 is the bargain tile's share; pinned against band 1 it contradicts the tile price and the row empties." },
    ],
    distractors: ["ASC", "4", "7.9"],
    walkthrough:
      "Deal, fold, paint — the quartile map in three moves. NTILE(4) OVER (ORDER BY price DESC) deals 16 prices into four tiles of four, premium first: the top tile holds 199.99, 149.99, 129.00-class tags summing to 597.98. The fold prices each tile (597.98 / 293.98 / 165.99 / 90.48 — probed ladder), and the paint is window-over-fold: SUM(SUM(price)) OVER () carries the 1148.43 shelf pot onto every tile row, so each band's pct is its share of the whole shelf — 52.1 for the premium tile, more than half the map in one quarter. The direction is the map's identity: ASC keeps the arithmetic but deals the bargain bin into band 1, whose row reads 90.48 and 7.9 (probed) — the premium tile's mirror image, caught by the double pin (band 1 AND pct 52.1). This is the tile version of the spend-concentration story, and the painted share is what makes the four tiles comparable at a glance.",
  },
  {
    id: "cs-1475",
    tier: "hard",
    topic: "w8",
    universe: "inventory",
    title: "The stock quartile wall's fleet count",
    brief:
      "From: Ops manager. Re: the warehouse wall.\n\nThe warehouse wall deals the 16-SKU catalog into four stock tiles and folds each tile's ceiling; the audit twist is the painted fleet column, which must read 16 — the SKU fleet — before the wall ships, because last quarter a draft painted 103, the order count, and the wall compared shelves to tickets. The draft lost its direction and both pins. Rebuild tile 2's row.",
    ask: "One query: stock tile 2 of the DESC deal — 4 SKUs, ceiling 220 — with the 16-SKU fleet painted on it.",
    template:
      "WITH t AS (SELECT stock, NTILE(4) OVER (ORDER BY stock {1}) AS band FROM products),\nx AS (SELECT band, COUNT(*) AS n, MAX(stock) AS hi, SUM(COUNT(*)) OVER () AS fleet FROM t GROUP BY band)\nSELECT band, n, hi, fleet FROM x WHERE band = {2} AND hi = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the deal direction",
        why: "The wall reads deepest-stock-first, so the deal sorts stock DESC — probed: band 2 holds 4 SKUs with ceiling 220. ASC flips the deal and band 2's ceiling becomes 120 (probed) — same wall, re-dealt shelves, and the 220 assert empties." },
      { answer: "2", kind: "number", label: "the pinned tile",
        why: "The audit samples tile 2 — probed: n 4, hi 220, fleet 16. Pin tile 3 and the ceiling assert grabs 120, the mid-shelf tile's ceiling; the hi pin is what keeps the sample row on the right shelf." },
      { answer: "220", kind: "number", label: "the asserted tile ceiling",
        why: "Probed: the DESC deal's tile 2 tops out at 220 — the second-deepest shelf boundary (tile 1's is 500). 103 is the ORDER count, the exact mis-paint the fleet column exists to catch: no stock tile ceilings at 103, so the pin also fires if the wrong fleet ever leaks in." },
    ],
    distractors: ["ASC", "3", "103"],
    walkthrough:
      "Deal the shelf, fold the tiles, paint the fleet — and make the paint prove which fleet it describes. NTILE(4) OVER (ORDER BY stock DESC) deals 16 stocks into four tiles of four, deepest first (ceilings 500 / 220 / 120 / 70 — probed). The fold sizes and ceilings each tile, and SUM(COUNT(*)) OVER () paints 16 on every tile row — the SKU fleet, because the window runs after the fold and sums the four per-tile counts. That painted column is the audit: 16 is shelves, 103 is tickets, and a wall that prints 103 next to stock ceilings has folded the wrong table in its head (the exact error the memo recounts). The pin samples tile 2 under the DESC deal — n 4, hi 220, fleet 16 — and the direction flip is caught by the ceiling assert alone: ASC re-deals so tile 2 ceilings at 120 (probed), a legal row that is simply not this wall's tile 2.",
  },
  {
    id: "cs-1476",
    tier: "hard",
    topic: "w8",
    universe: "funnel",
    title: "The two-bucket year split",
    brief:
      "From: Growth marketing. Re: the runway memo.\n\nThe runway memo splits the book by year and must show the bucket count painted on every row — two buckets, and that 2 is the memo's proof the split is yearly, not monthly — with 2025's row carrying its 13 orders, 4060.03 spend and 11.7 share. The draft lost its date code, its year pin and its spend assert. Rebuild the 2025 row.",
    ask: "One query: the '2025' bucket — 13 orders, 4060.03 spend, 11.7 share — with the 2-bucket count painted on it.",
    template:
      "WITH y AS (SELECT strftime({1}, created_at) AS yr, COUNT(*) AS n, SUM(total) AS spend FROM orders GROUP BY yr),\np AS (SELECT yr, n, ROUND(spend, 2) AS spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) AS pct, COUNT(n) OVER () AS buckets FROM y)\nSELECT yr, n, spend, pct, buckets FROM p WHERE yr = {2} AND spend = {3};",
    slots: [
      { answer: "'%Y'", kind: "keyword", label: "the year slicer",
        why: "The memo splits by year, so the slicer is '%Y' — probed: exactly two buckets, 2024 and 2025. '%m' slices into twelve month labels ('01' … '12'), no bucket named '2025' survives, and the pin empties — the merged-calendar failure the bucket count exists to expose." },
      { answer: "'2025'", kind: "keyword", label: "the pinned year bucket",
        why: "2025 is the runway row — probed: 13 orders, 4060.03 spend, 11.7 share. Pin '2024' and the assert grabs the other bucket: 90 orders, 30773.25, 88.3 — last year's book, not the runway line." },
      { answer: "4060.03", kind: "number", label: "the asserted 2025 spend",
        why: "Probed: 2025's 13 orders carry 4060.03 — 11.7 of the 34833.28 book, painted by the share window. 13.2 is what the same row reads if the painter is swapped for MAX (probed), a re-based share against 2025 itself instead of the whole book." },
    ],
    distractors: ["'%m'", "'2024'", "13.2"],
    walkthrough:
      "The split is slice → fold → paint, with the paint carrying two different proofs. strftime('%Y', created_at) slices 103 orders into two year buckets — the fold gives 2024: 90 orders / 30773.25, 2025: 13 / 4060.03. The share window divides each by the painted whole book (34833.28): 88.3 and 11.7. And COUNT(n) OVER () paints 2 on every row — the bucket count, which is the memo's audit that this is a yearly split: a '%m' draft produces twelve buckets and no '2025' row at all, the merged-calendar bug in its purest form. The spend assert pins the runway row against the 4060.03 figure, and the 13.2 chip documents the painter trap: MAX(spend) OVER () re-bases every share on the biggest bucket, and 2025's share of itself reads 13.2 (probed) — a share of the wrong denominator that survives every other check.",
  },
  {
    id: "cs-1477",
    tier: "hard",
    topic: "w8",
    universe: "supplier",
    title: "The procurement league's shadow column",
    brief:
      "From: Procurement. Re: the supplier scorecard's league table.\n\nThe scorecard ranks the six suppliers by catalog value and carries a shadow column — the value of the supplier directly above — so each row shows what it trails by without a second query. Nordic's crown row is the audit row: rank 1 with an empty shadow, because nobody sits above the crown. The draft lost its direction, its painter and both pins. Rebuild the crown row.",
    ask: "One query: Nordic Gadgets AB's league row — 418.98 value, rank 1 — with a NULL shadow column proving nobody sits above.",
    template:
      "WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id),\nl AS (SELECT name, value, RANK() OVER (ORDER BY value {1}) AS rk, {2}(value) OVER (ORDER BY value DESC) AS prev FROM v)\nSELECT name, value, rk, prev FROM l WHERE name = {3} AND rk = {4};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "The league reads biggest-catalog-first, so the rank window sorts value DESC — probed: Nordic 418.98 at rank 1. ASC re-ranks the same six values and hands Nordic rank 6 (probed, staged over the full fold) — the crown printed from the cellar." },
      { answer: "LAG", kind: "keyword", label: "the shadow painter",
        why: "The shadow is the supplier above, so LAG(value) OVER (ORDER BY value DESC) paints NULL on the crown — probed. FIRST_VALUE with the same window paints Nordic's own 418.98 on every row including the crown: the audit row's empty shadow, the proof nobody sits above, is destroyed." },
      { answer: "'Nordic Gadgets AB'", kind: "keyword", label: "the pinned crown row",
        why: "Nordic tops the value league at 418.98 — probed 36.5 of the 1148.43 catalog. Pin 'Alpine Audio GmbH' and the rank assert breaks: Alpine reads rank 3 at 143.99, not the pinned 1." },
      { answer: "1", kind: "number", label: "the asserted rank",
        why: "Probed ladder: Nordic 418.98, Midwest 224.49, Alpine 143.99, Andes 138.99, Pacific 128.99, Shenzhen 92.99 — the crown's rank is 1 and the NULL shadow rides with it. Pin 6 (Nordic's ASC rung, probed) and the direction flip is caught on the pinned row itself." },
    ],
    distractors: ["ASC", "FIRST_VALUE", "units"],
    walkthrough:
      "The league is fold → rank → shadow: the fold prices each supplier's catalog (six rows, 418.98 down to 92.99 — probed, no ties), RANK() OVER (ORDER BY value DESC) stamps the podium, and LAG(value) OVER (ORDER BY value DESC) paints the shadow — each row's upstairs neighbor. The crown row is the audit: rank 1 with a NULL shadow, the only row where 'trailing nobody' is provable from the output. That NULL is also the painter test — FIRST_VALUE over the same window paints the crown's own 418.98 everywhere, so the empty shadow fills with a self-portrait and the 'nobody above' proof dies (probed). The direction flip is caught by the staged rank: under ASC the same values re-rank Nordic to 6 (probed), and the rk = 1 pin empties. Keep the shadow window's DESC hardcoded and the direction slot only in the rank: two windows, one flip, and the assert still catches it — that's the discipline the scorecard's league table runs on.",
  },
  {
    id: "cs-1478",
    tier: "hard",
    topic: "w8",
    universe: "expense",
    title: "The ledger's August opex wedge",
    brief:
      "From: Controller. Re: the ledger-side close.\n\nThe ledger close re-derives the August spend story from ledger_entries, not the expense sheet: slice the operating_expenses account by entry month, fold each month's debits, and paint each month's share of the 25416 opex pot. August's wedge is the line the audit quotes: 3210 spent, 12.6 percent. The draft lost its date column, its account pin, its month pin and its share assert. Rebuild the August wedge.",
    ask: "One query: the 2024-08 operating_expenses bucket — 3210 spend, 12.6 percent share — from the ledger.",
    template:
      "WITH e AS (SELECT strftime('%Y-%m', {1}) AS mon, SUM(debit_cents)/100.0 AS spend FROM ledger_entries WHERE account = {2} GROUP BY mon),\np AS (SELECT mon, spend, ROUND(100.0*spend/SUM(spend) OVER (), 1) AS pct FROM e)\nSELECT mon, ROUND(spend, 2) AS spend, pct FROM p WHERE mon = {3} AND pct = {4};",
    slots: [
      { answer: "entry_date", kind: "keyword", label: "the ledger date column",
        why: "The ledger stamps its rows with entry_date — the expense sheet's spent_on does not exist on this table (probed: 'no such column: spent_on'), and the slice dies before the fold. The capstone lesson: same business fact, different schema, and the slicer must match the table in the FROM." },
      { answer: "'operating_expenses'", kind: "keyword", label: "the account fence",
        why: "Opex lives in the operating_expenses account — probed: 14 entries folding to 14 month buckets, 25416 pot. Fence on 'sales_revenue' instead and August reads 0 spend (probed): revenue credits carry no debits, and the 12.6 share assert empties." },
      { answer: "'2024-08'", kind: "keyword", label: "the pinned month",
        why: "August is the spike month — probed: 3210 in debits, the calendar's biggest bucket. Pin '2024-09' and the assert grabs the correction month: 1545 spend, 6.1 share (probed) — the month August's overshoot was paid back." },
      { answer: "12.6", kind: "number", label: "the asserted share",
        why: "Probed: 100.0 × 3210 / 25416 reads 12.6 — August's wedge of the opex pot, painted by the share window over the folded months. The share is the reconciliation: it only reads 12.6 when the fence, the slicer and the fold are all the ledger's own." },
    ],
    distractors: ["spent_on", "'sales_revenue'", "'2024-09'"],
    walkthrough:
      "Same spike, stricter books: the ledger version of the August story must be re-derived from ledger_entries, where the column is entry_date (spent_on isn't on this table — probed engine error) and the account fence does the slicing the expense sheet did by table. The pipeline: fence to operating_expenses, slice entry_date into 14 month buckets, fold the debits (… 1794, 3210, 1545 …), and paint each month's share of the 25416 pot — August reads 3210 and 12.6, the wedge the audit quotes. The pins are stacked deliberately: the account fence fails soft (sales_revenue's August is a flat 0 — probed — so the share assert empties rather than misquoting), the month pin has a true neighbor to catch it (September's 1545 / 6.1 — probed — the payback month), and the 12.6 assert only survives when every layer is the ledger's own. Cross-schema reconciliation is the close's whole job: the ledger's 25416 opex pot must equal the expense sheet's, month by month.",
  },
  {
    id: "cs-1479",
    tier: "hard",
    topic: "w8",
    universe: "fraud",
    title: "The tie-break that moves the last twin",
    brief:
      "From: Fraud spot-check lead. Re: the burst-census audit.\n\nThe burst census counts same-timestamp order pairs — cloned entries logged on the same created_at. The count itself is tie-break-stable at 19, but the audit's fingerprint is the last twin's id, which MOVES with the ORDER BY's second key: id-order fingerprints 102, total-order fingerprints 101. The draft lost its tie-break key and both census pins. Rebuild the id-order census.",
    ask: "One query: the same-timestamp census — 19 twins with last twin id 102 — under the created_at-then-id walk.",
    template:
      "WITH w AS (SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, {1}) AS prev FROM orders),\nk AS (SELECT id, created_at, prev FROM w WHERE created_at = prev)\nSELECT COUNT(*) AS twins, MAX(id) AS last_twin FROM k HAVING COUNT(*) = {2} AND MAX(id) = {3};",
    slots: [
      { answer: "id", kind: "keyword", label: "the tie-break key",
        why: "The audit walk is created_at then id, so ties break by insertion order — probed fingerprint: 19 twins, last twin 102. Break ties by total instead and the census still counts 19 but the fingerprint moves: last twin 101 (probed) — the assert is what proves which walk ran." },
      { answer: "19", kind: "number", label: "the asserted twin count",
        why: "Probed: 17 created_at dates are shared by multiple orders, producing 19 same-timestamp pairs — the count is the stable half of the fingerprint. The HAVING pins it so a mis-keyed walk cannot silently change the census size." },
      { answer: "102", kind: "number", label: "the asserted last-twin fingerprint",
        why: "Probed: under ORDER BY created_at, id the last surviving twin is id 102; under the total tie-break it is 101. The fingerprint is the audit: same count, different walk — only the id-order walk passes MAX(id) = 102." },
    ],
    distractors: ["total", "LEAD", "PRINTF"],
    walkthrough:
      "The walk reads orders by created_at with a tie-break, LAG(created_at) hands each order its predecessor's timestamp, and the survivors of created_at = prev are the same-timestamp twins — 17 shared dates producing 19 pairs. The fraud-audit insight is that the census has two halves: the count 19, which every reasonable tie-break reproduces, and the fingerprint MAX(id), which does not — id-order walks end at twin 102, total-order walks at 101 (probed). That's why the HAVING pins both: COUNT(*) = 19 alone would pass a walk the SOP never sanctioned, but the pair (19, 102) is the id-order signature. The stage discipline matters as much: LAG must run over all 103 orders, so the twin filter lives in the second CTE — filter first and the window reads a pre-trimmed walk, the wave's recurring staging law applied to burst detection.",
  },
  {
    id: "cs-1480",
    tier: "hard",
    topic: "w8",
    universe: "catalog",
    title: "The invoice year stack, split by cast",
    brief:
      "From: Billing ops. Re: the invoice registry's year stack.\n\nThe registry's invoice numbers hide their year in characters 5 through 8, so the year split must SUBSTR the key out and CAST it to a real number before folding — text years sort wrong and numeric years audit right. The 2025 row is the reconciliation row: 5 invoices, with the full 28-invoice stack painted on it. The draft lost its slice start and both pins. Rebuild the 2025 row.",
    ask: "One query: the 2025 invoice bucket — 5 invoices, stack 28 — sliced by SUBSTR start 5 and cast to integer.",
    template:
      "WITH y AS (SELECT CAST(SUBSTR(number, {1}, 4) AS INTEGER) AS yr FROM invoices),\nf AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER (ORDER BY yr) AS running, SUM(COUNT(*)) OVER () AS stack FROM y GROUP BY yr)\nSELECT yr, n, running, stack FROM f WHERE yr = {2} AND stack = {3};",
    slots: [
      { answer: "5", kind: "number", label: "the slice start",
        why: "'INV-2024-001' keeps its year at characters 5–8, so SUBSTR(number, 5, 4) is the key — probed split: 2024 × 23, 2025 × 5. Start 6 shaves the '2' and folds buckets 24 and 25 (probed): no bucket named 2025, the pin empties. Start 23 reads past the text and casts nothing to a 0 bucket (probed)." },
      { answer: "2025", kind: "number", label: "the pinned year bucket",
        why: "2025 is the reconciliation row — probed: 5 invoices with running and stack both at 28. The cast matters here: the bucket key is a real integer after CAST, so yr = 2025 matches numerically; a text year would still compare, but the ORDER BY yr walk would sort it as text." },
      { answer: "28", kind: "number", label: "the asserted stack figure",
        why: "Probed: the 2025 row carries stack 28 — the whole registry painted by SUM(COUNT(*)) OVER (), with the running window also meeting 28 there because 2025 is the walk's last bucket. 23 is the 2024 bucket's own count, a per-year figure the stack pin must not confuse." },
    ],
    distractors: ["6", "23", "2024"],
    walkthrough:
      "Text keys audit badly, so the registry casts before it folds: SUBSTR(number, 5, 4) lifts the year from 'INV-2025-025', CAST … AS INTEGER turns '2025' into a number, and the fold splits the registry 2024 × 23 / 2025 × 5 (probed). The stage then paints two windows over the fold — SUM(COUNT(*)) OVER (ORDER BY yr) walks the running stack and SUM(COUNT(*)) OVER () paints the whole 28 — and on the last bucket all three figures meet: 5 invoices, running 28, stack 28. That triple is the reconciliation: the running line catching the stack at the final bucket proves the walk covered every invoice. The slice start is the fragile half: start 6 shaves the leading '2' and folds the registry into buckets 24 and 25 (probed), while start 23 reads past the number entirely and casts an empty string to a 0 bucket holding all 28 (probed) — both land flat in the yr = 2025 pin. The count pin's 5 versus the 2024 bucket's 23 is the last guard against pinning the wrong year's row.",
  },
];
