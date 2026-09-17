// Case wave w7b — Module 5 Type & cast (lesson 29), second half, cs-1443…cs-1460.
// 18 cases: 6 easy / 6 medium / 6 hard, all topic "w7". Spine: CAST AS
// INTEGER/REAL/TEXT, typeof() storage classes, cents↔money via /100.0 vs /100
// integer division, string↔number coercion, PRINTF plates vs CAST truncation,
// float dust round-tripping, and text-affinity sort traps.
// Every figure traces to committed probe receipts:
// scripts/m5-facts-w7.out + m5-facts-w7b.out (this wave's own probes, the
// latter carrying per-id fills and distractor landings for cs-1443…cs-1460).
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW7b: CaseStudy[] = [
  {
    id: "cs-1443",
    tier: "medium",
    topic: "w7",
    universe: "month-close",
    title: "The pending pool's type stamp",
    brief:
      "From: Controller. Re: the close binder's status page.\n\nThe status page prints each order-status pool's money with a storage-class stamp beside it, so the reconciliation tool can tell true dollars from headcounts wearing money labels. The draft lost both the money fold and its counter, and the ticket pin wandered off. Rebuild it for the pool carrying exactly fourteen tickets.",
    ask: "One query: the status pool holding exactly 14 tickets, stamped with the storage class of its money total.",
    template:
      "SELECT status, typeof({1}(total)) AS cls, {2} AS tickets\nFROM orders\nGROUP BY status\nHAVING tickets = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the money fold",
        why: "Pool money is a sum: SUM(total) folds each status to 15571.07 / 11996.72 / 6113 / 1152.49 and every one stamps real, because totals are REAL. COUNT(total) would fold to the row counts 52/30/14/7 and stamp integer — headcounts wearing dollar labels." },
      { answer: "COUNT(*)", kind: "keyword", label: "the ticket counter",
        why: "Tickets are rows: COUNT(*) counts each pool's orders — pending's pool holds 14. The bare chip COUNT without parentheses is just a column name to the engine, and no such column exists." },
      { answer: "14", kind: "number", label: "the pending ticket pin",
        why: "Probed census: pending carries exactly 14 tickets against delivered 52, shipped 30, cancelled 7 — the pin selects the pending row alone. Pin 7 and the assert grabs cancelled's pool instead." },
    ],
    distractors: ["COUNT", "LENGTH", "7"],
    walkthrough:
      "GROUP BY status folds the 103 orders into four pools, and the whole lesson is the stamp column: typeof(SUM(total)) reads real because SUM over REAL totals stays real — 15571.07 delivered, 11996.72 shipped, 6113 pending, 1152.49 cancelled. Swap the fold for COUNT(total) and the stamps flip to integer, because counts are always integers — the reconciliation tool would now file headcounts as money. The counter slot is COUNT(*), the one aggregator that counts rows rather than values; bare COUNT is not a function call but a missing column. The pin 14 lands on pending — the one pool with exactly fourteen tickets — while 7 would drag in cancelled. One row out: pending, real, 14.",
  },
  {
    id: "cs-1444",
    tier: "easy",
    topic: "w7",
    universe: "pricing",
    title: "The whole-dollar survivors",
    brief:
      "From: Pricing lead. Re: the clean-tag shelf.\n\nThe clean-tag shelf lists every SKU whose price carries no cents at all — price equal to its own integer cast, byte for byte. The draft's cast target and both census pins were wiped in a refactor. Rebuild the census: how many survivors, and the cheapest survivor's price.",
    ask: "One query: the count of products priced exactly at their integer cast, with the floor survivor's price.",
    template:
      "SELECT COUNT(*) AS keepers, MIN(price) AS floor_price\nFROM products\nWHERE price = CAST(price AS {1})\nHAVING keepers = {2} AND floor_price = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the clean-tag cast",
        why: "The test is price = CAST(price AS INTEGER): ten of the sixteen prices carry cents (89.99, 34.5, …) and fail their own integer cast, leaving the 6 whole-dollar keepers. Cast to TEXT and the comparison crosses affinities — REAL never equals TEXT — so the shelf empties." },
      { answer: "6", kind: "number", label: "the survivor count pin",
        why: "Probed: exactly 6 of 16 products survive — 129, 119, 79, 65, 49, 32 — the whole-dollar wall. Pin 16 and the assert demands the whole catalog, which the cast test itself just rejected." },
      { answer: "32", kind: "number", label: "the floor survivor's price",
        why: "Probed: the cheapest keeper is Yoga Mat Eco 6mm at 32 — the floor of the whole-dollar shelf. 49 is the USB-C Hub's tag, two rungs up." },
    ],
    distractors: ["TEXT", "REAL", "16"],
    walkthrough:
      "The cast test is a mirror: price = CAST(price AS INTEGER) keeps a row only when the price is already whole. Ten prices carry cents — the fractional crowd from 89.99 down — so exactly 6 SKUs survive: 4K Webcam Pro 129, Studio Desktop Mic 119, Fitness Band X2 79, Cycling Jersey Pro 65, USB-C Hub 49, Yoga Mat 32, and the floor pin grabs the cheapest, 32. Cast to TEXT instead and the test is dead on arrival: in SQLite's cross-type ordering every REAL sorts below every TEXT, so nothing can equal its own text image and the shelf empties. Cast to REAL and the mirror turns tautological — all 16 prices equal their own REAL cast — so keepers reads 16 and the HAVING pin rejects the inflated census. The count and the floor together prove the shelf is the whole-dollar six, not the catalog.",
  },
  {
    id: "cs-1445",
    tier: "easy",
    topic: "w7",
    universe: "supplier",
    title: "The rating's integer badge",
    brief:
      "From: Procurement. Re: the partner scorecard row.\n\nThe scorecard prints Alpine Audio GmbH's rating four ways: raw, storage class, CAST stars for the sort key, and a PRINTF badge for the wall board — and the wall board disagrees with the sort key by one star. Restore the row so both builders are present and the disagreement is visible.",
    ask: "One query: Alpine's rating with its typeof class, its CAST-to-INTEGER stars, and its PRINTF '%.0f' badge.",
    template:
      "SELECT name, rating, typeof(rating) AS cls, CAST(rating AS {1}) AS stars,\n{2}('%.0f', rating) AS badge\nFROM suppliers\nWHERE name = 'Alpine Audio GmbH' AND rating = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the stars cast",
        why: "CAST(rating AS INTEGER) truncates 4.8 to 4 stars — the sort key the shelf uses. Cast to TEXT and stars becomes the string '4.8', useless for numeric shelves; cast to REAL and nothing changes, 4.8 again." },
      { answer: "PRINTF", kind: "keyword", label: "the badge builder",
        why: "PRINTF('%.0f', 4.8) rounds to 5 — the wall-board badge that disagrees with the stars' 4. MAX in that seat returns '%.0f' itself, because any TEXT outranks any REAL in SQLite's comparisons; ABS has the wrong arity and is refused outright." },
      { answer: "4.8", kind: "number", label: "the top rating pin",
        why: "Probed: Alpine Audio GmbH tops the six-supplier league at 4.8 — the league's only 4.8, ahead of Nordic's 4.6. Pin 4.6 and the name filter finds no such partner row." },
    ],
    distractors: ["TEXT", "REAL", "MAX", "ABS", "4.6"],
    walkthrough:
      "One row, four readings, one disagreement worth teaching: rating 4.8 stamps typeof real, CAST(rating AS INTEGER) truncates toward zero to 4 stars, and PRINTF('%.0f', rating) rounds half-up to a badge of 5 — same number, two builders, one star apart, which is exactly why the scorecard prints both. Put MAX where PRINTF belongs and the 'badge' becomes the format string '%.0f': in a TEXT-versus-REAL comparison SQLite always crowns the TEXT, so the literal beats 4.8. ABS('%.0f', rating) dies at the door with an arity error. And the cast target matters both ways: TEXT would make stars the string '4.8' — a shelf key that sorts like a word — while REAL is a no-op. The pin 4.8 selects Alpine's row alone; Nordic's 4.6 fails the name and the rating at once.",
  },
  {
    id: "cs-1446",
    tier: "medium",
    topic: "w7",
    universe: "month-close",
    title: "August's cash, down to the half dollar",
    brief:
      "From: Treasury. Re: the August cash reconciliation.\n\nAugust's cash outflow is the one month in the ledger that lands on a half dollar, and the reconciliation sheet must show it exactly: 6254.5, not a clipped 6254. The draft's cents-to-dollars divisor lost its decimal point and the account filter drifted. Rebuild the staged row with its type stamp.",
    ask: "One query: August's cash outflow in dollars, exact to the half, with the cents storage class stamped.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents\nFROM ledger_entries WHERE account = {1} GROUP BY mon)\nSELECT mon, dollars, cls FROM (SELECT mon, cents / {2} AS dollars, typeof(cents) AS cls FROM m)\nWHERE mon = '2024-08' AND dollars = {3};",
    slots: [
      { answer: "'cash'", kind: "keyword", label: "the account filter",
        why: "The outflow sheet reads the cash account: probed, cash's August debits fold to 625450 cents. The operating_expenses account is a different book — its August lands on 3210, and the pin finds no such dollars." },
      { answer: "100.0", kind: "keyword", label: "the cents divisor",
        why: "cents / 100.0 is REAL division: 625450 becomes 6254.5, the half dollar the sheet quotes. Drop the decimal — cents / 100 — and SQLite divides integers, clipping August to exactly 6254 and the pin to an empty sheet." },
      { answer: "6254.5", kind: "number", label: "the August dollars pin",
        why: "Probed: August cash = 625450 cents = 6254.5 dollars — the ledger's lone half-dollar month. Pin the clipped 6254 and the assert contradicts the very division the slot is supposed to protect." },
    ],
    distractors: ["100", "6254", "'operating_expenses'"],
    walkthrough:
      "The pipeline stages twice on purpose: the first CTE folds each month's cash debits into integer cents (August: 625450, stamped typeof integer — SUM over INTEGER debit_cents stays integer), and the derived table converts to dollars before the pin. The divisor is the whole case: 100.0 forces REAL division and August lands on 6254.5, the figure the treasury sheet quotes; plain 100 makes it integer division, 625450 / 100 = 6254, and the half dollar silently vanishes — the classic cents-to-money bug. The pin knows the difference: dollars = 6254.5 keeps the row, 6254 empties it, and a 6254 chip in the divisor seat wrecks the arithmetic from the other side. Filter operating_expenses instead of cash and you reconcile the wrong book entirely — August opex is 3210, nowhere near the pin.",
  },
  {
    id: "cs-1447",
    tier: "medium",
    topic: "w7",
    universe: "expense",
    title: "The three-bill month, typed",
    brief:
      "From: Finance partner. Re: the burn ledger's spike row.\n\nThe burn ledger buckets bills by month and stamps each bucket's dollar conversion with a storage class, so the audit tool can catch integer-division drift. One month is billed exactly three times and burns 3210 dollars. The draft lost its month pin, its bill count and its cents figure. Restore the row.",
    ask: "One query: the expense month billed exactly 3 times, showing its cents pot and the storage class of its dollar conversion.",
    template:
      "SELECT strftime('%Y-%m', spent_on) AS mon, COUNT(*) AS bills, SUM(amount_cents) AS cents,\ntypeof(SUM(amount_cents) / 100.0) AS cls\nFROM expenses\nGROUP BY mon\nHAVING mon = {1} AND bills = {2} AND cents = {3};",
    slots: [
      { answer: "'2024-08'", kind: "keyword", label: "the spike month",
        why: "Probed: 2024-08 is the three-bill month — the burn ledger's spike at 3210 dollars. Its neighbour 2024-09 carries only 2 bills, so the bills pin would reject it even if the month matched." },
      { answer: "3", kind: "number", label: "the bill-count pin",
        why: "Probed: exactly 3 bills land in 2024-08 (Rent, Ads, Travel) against the ledger's usual single Rent-plus-Ads cadence. Pin 2 and no month qualifies at that bill count with this cents pot." },
      { answer: "321000", kind: "number", label: "the cents pot pin",
        why: "Probed: SUM(amount_cents) = 321000 for August — the raw integer pot before the /100.0 conversion. Pin 3210 and the assert demands the converted dollars figure from a cents column, which never matches." },
    ],
    distractors: ["'2024-09'", "2", "3210"],
    walkthrough:
      "The bucket-and-stamp shape: strftime('%Y-%m', spent_on) folds 36 bills into fourteen monthly buckets, COUNT(*) counts them, SUM(amount_cents) folds the integer cents, and the stamp divides by 100.0 before calling typeof — 321000 / 100.0 = 3210.0, which reads real, proof the conversion stayed in REAL arithmetic. The triple pin locks the row from three sides: the month literal '2024-08', the bill count 3, and the raw cents pot 321000. The seductive wrong chip is 3210 — the dollar figure everyone quotes — pinned against a cents column, where it matches nothing. '2024-09' fails on bill count before it even reaches the pot, and 2 as the count pin has no month waiting for it. One row out: 2024-08, 3 bills, 321000 cents, real.",
  },
  {
    id: "cs-1448",
    tier: "easy",
    topic: "w7",
    universe: "growth",
    title: "The 2023 cohort's zero floor",
    brief:
      "From: Growth lead. Re: the acquisition cohort sheet.\n\nThe cohort sheet cuts signups by signup year — the year sliced out of the timestamp as text, then cast so it sorts like a number — and floors each cohort's activation rate to an integer for the summary bar. Rebuild the 2023 row: signups, activations, and the floored rate.",
    ask: "One query: the 2023 cohort with its signup count, activated count, and the integer-floored activation rate.",
    template:
      "SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS signups,\nSUM(active) AS activated, CAST(AVG(active) AS {1}) AS floored\nFROM customers\nGROUP BY yr\nHAVING yr = {2} AND activated = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the floor cast",
        why: "CAST(AVG(active) AS INTEGER) floors the cohort's 0.75 activation rate to 0 — the summary bar's blunt whole number, truncation rather than rounding. Cast to REAL or TEXT and the bar prints 0.75, a rate sitting where the sheet promises a whole count." },
      { answer: "2023", kind: "number", label: "the cohort year pin",
        why: "Probed: the 2023 cohort holds 4 signups against 2024's 12 — the smaller, older wave the sheet pins. Pin 2024 and the activated pin at 3 rejects it, since 2024 activated 11." },
      { answer: "3", kind: "number", label: "the activated pin",
        why: "Probed: 3 of the 4 signups in 2023 are active — the cohort's headline. 11 is 2024's activation figure wearing 2023's clothes; pinned together the asserts contradict and the row empties." },
    ],
    distractors: ["REAL", "TEXT", "2024", "11"],
    walkthrough:
      "Two casts do the work. The first is baked into the stage: SUBSTR(created_at, 1, 4) slices '2023' out of the timestamp and CAST AS INTEGER makes the group key a number the year pin can match. The slotted cast is the floor: AVG(active) over the cohort reads 3/4 = 0.75, and CAST AS INTEGER truncates it to 0 — the summary bar's blunt integer, truncation not rounding. Cast the floor to REAL or TEXT instead and the bar reads 0.75, a rate where the sheet promises a whole count. The pins select 2023's row: 4 signups, 3 activated, 0 floored. 2024's row (12 signups, 11 activated, 0.9166 floored to 0 as well) is rejected by the activated pin — both cohorts floor to zero, but only one of them is 2023's.",
  },
  {
    id: "cs-1449",
    tier: "hard",
    topic: "w7",
    universe: "fraud",
    title: "Where the balance lands, typed",
    brief:
      "From: Internal audit. Re: the ledger walk.\n\nThe fraud spot-check walks the ledger entry by entry — a running balance of debits minus credits, ordered by date then id — and asserts the storage class of the balance at a chosen rung, because a text-poisoned memo would flip the walk's arithmetic. Rebuild the walk pinned at entry 79 with its dollar figure.",
    ask: "One query: the running ledger balance at entry id 79, exact in dollars, with the balance's storage class stamped.",
    template:
      "WITH walk AS (SELECT id, entry_date, {1}(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) AS bal_cents\nFROM ledger_entries)\nSELECT id, entry_date, dollars, cls\nFROM (SELECT id, entry_date, bal_cents / 100.0 AS dollars, typeof(bal_cents) AS cls FROM walk)\nWHERE id = {2} AND dollars = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the balance walker",
        why: "The balance is a running SUM of debit minus credit over (ORDER BY entry_date, id). COUNT walks row numbers instead — at entry 79 it reads 79, dollars 0.79, and the pin starves. ABS cannot walk at all: the engine refuses it as a window function." },
      { answer: "79", kind: "number", label: "the pinned entry",
        why: "Probed: entry 79 is dated 2025-02-28 and carries the walk's last non-zero balance — 707600 cents. Its neighbours 78 and 80 both sit at exactly 0, so pinning 80 demands 7076 dollars from a zero rung." },
      { answer: "7076", kind: "number", label: "the balance in dollars",
        why: "Probed: bal_cents 707600 / 100.0 = 7076 at the pinned rung, stamped integer because the walk sums INTEGER cents. The figure is the audit's anchor: everything before it nets to zero, everything after starts from it." },
    ],
    distractors: ["COUNT", "ABS", "80"],
    walkthrough:
      "The walk is a window over raw entries, not a fold: SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) carries the balance forward entry by entry, and because cents are INTEGERs the running value stamps typeof integer all the way — the fraud check's first assurance that no text poisoned the arithmetic. The derived layer converts to dollars with / 100.0 and the pin lands on entry 79: dated 2025-02-28, balance 707600 cents, 7076 dollars. The neighbourhood is the story — rungs 78 and 80 both sit at exactly 0, the ledger closing itself out around this lone non-zero rung, which is why pinning 80 with 7076 finds nothing. Swap the walker for COUNT and the 'balance' becomes a row counter: 79 rows walked, 0.79 dollars, arithmetic that executes but audits nothing. ABS is refused as a window function outright — subtraction inside SUM is the only honest walk.",
  },
  {
    id: "cs-1450",
    tier: "medium",
    topic: "w7",
    universe: "refund-audit",
    title: "January's cancelled dust, printed",
    brief:
      "From: Refunds desk. Re: the cancellation bucket sheet.\n\nThe sheet buckets cancelled orders by month and prints each bucket's pot through PRINTF so the float dust never reaches the page — January's raw sum is 358.71000000000004 in the engine, and the desk refuses to ship that string. Rebuild the two-order buckets with their printed pots and the raw storage class.",
    ask: "One query: every month holding exactly 2 cancelled orders, with the pot printed to two decimals and the raw class stamped.",
    template:
      "SELECT strftime({1}, created_at) AS mo, COUNT(*) AS n, PRINTF({2}, SUM(total)) AS pot,\ntypeof(SUM(total)) AS cls\nFROM orders\nWHERE status = 'cancelled'\nGROUP BY mo\nHAVING n = {3};",
    slots: [
      { answer: "'%m'", kind: "keyword", label: "the month slicer",
        why: "strftime('%m', created_at) folds the 7 cancellations into month buckets — probed, the n = 2 buckets are 01, 07 and 11. Slice '%d' and the buckets become days: the surviving pair is 02 with pot 242.87, a different sheet." },
      { answer: "'%.2f'", kind: "keyword", label: "the pot printer",
        why: "PRINTF('%.2f', …) prints January's raw 358.71000000000004 as 358.71 — the dust never ships. '%.0f' would round the pot to 359 and the desk's reconciliation breaks by a cent-and-a-half." },
      { answer: "2", kind: "number", label: "the bucket-size pin",
        why: "Probed: three months hold exactly 2 cancellations — 2024-01 (358.71), 2024-07 (115.82), 2024-11 (541.85). Pin 1 and the assert grabs March's lone 136.11 instead of the pair buckets." },
    ],
    distractors: ["'%d'", "1", "'%.0f'", "'%Y'"],
    walkthrough:
      "The cancelled book is tiny — 7 orders — which makes it perfect for reading buckets precisely. '%m' folds them into five month buckets, and the n = 2 pin keeps the pairs: January 358.71, July 115.82, November 541.85, each with typeof(SUM(total)) stamped real because the totals are REAL and SUM keeps them REAL — dust included. That dust is the case's reason to exist: January's raw pot is 358.71000000000004 in the engine, binary float residue from adding cents-bearing totals, and PRINTF('%.2f', …) is the plate that rounds it to the two decimals the desk ships. '%.0f' would print 359 — a pot nobody can reconcile. Slice by '%d' instead and the buckets are days of the month, surviving with a different pair and pot (02, 242.87); slice by '%Y' and only two year buckets exist, neither holding exactly 2. Pin 1 and March's lone cancellation takes the sheet.",
  },
  {
    id: "cs-1451",
    tier: "medium",
    topic: "w7",
    universe: "catalog",
    title: "Cast first, sum second",
    brief:
      "From: Catalog ops. Re: the shelf-value reconciliation.\n\nThe reconciliation compares two readings of the catalog's whole-dollar value: cast the summed prices, versus sum the cast prices. They disagree by the float dust, and the audit wants both figures on one row with the raw sum's storage class. The draft lost the fold order and both pins.",
    ask: "One query: the catalog's cast-sum versus sum-cast comparison, with the SKU count and raw sum class asserted.",
    template:
      "SELECT COUNT(*) AS skus, CAST({1}(price) AS INTEGER) AS cast_sum,\nSUM(CAST(price AS INTEGER)) AS sum_cast, typeof(SUM(price)) AS cls\nFROM products\nHAVING skus = {2} AND cast_sum = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the cast-first fold",
        why: "CAST(SUM(price) AS INTEGER) sums first — 1148.43 — then truncates to 1148. MAX would truncate the priciest tag alone (199) and AVG the mean (71); neither can reach the pin 1148." },
      { answer: "16", kind: "number", label: "the SKU count pin",
        why: "Probed: the catalog holds 16 products — the denominator both readings cover. Pin 10 and the assert claims a fraction of the shelf that was never summed." },
      { answer: "1148", kind: "number", label: "the cast-sum pin",
        why: "Probed: SUM(price) = 1148.43, and the cast of that sum truncates to 1148 — one float dust above the 1140 the per-row cast collects. Pin 1140 and the assert confuses the two readings." },
    ],
    distractors: ["MAX", "AVG", "ROUND", "1140", "10"],
    walkthrough:
      "One row, two orders of operations, 8.43 apart. Sum first, cast second: SUM(price) folds all sixteen tags into 1148.43 — stamped real, because REAL sums stay real — and CAST truncates the dust to 1148. Cast first, sum second: each price is truncated before folding, ten fractional tags each surrender their cents, and the per-row cast collects only 1140. The 8.43 gap is the catalog's accumulated dust, and the row exists to show both readings side by side so nobody quotes one as the other. The pins hold the frame: 16 SKUs, cast_sum 1148 — and the seductive wrong pin is 1140, the other column's figure, which would fail cast_sum's seat and pass only where sum_cast lives. MAX and AVG in the fold seat produce 199 and 71, truncations of the wrong aggregate entirely; ROUND(price) is a scalar wrapped around a bare column in an aggregate query — legal, but it folds nothing.",
  },
  {
    id: "cs-1452",
    tier: "hard",
    topic: "w7",
    universe: "refund-audit",
    title: "The void invoice's text crown",
    brief:
      "From: Billing ops. Re: the invoice plate board.\n\nThe board prints every invoice's dollar figure as a zero-padded plate and crowns the biggest plate — but plates are TEXT, so the crown follows text order, not money order. Pin the board's true top plate at the void invoice, with the league's numeric ceiling painted beside it for proof.",
    ask: "One query: the top plate under a text DESC sort, with the invoice's dollars, its storage class and the numeric max painted on.",
    template:
      "WITH league AS (SELECT number, status, amount_cents / 100.0 AS dollars,\nPRINTF({1}, amount_cents / 100.0) AS plate, typeof(amount_cents / 100.0) AS cls,\nMAX(amount_cents / 100.0) OVER () AS true_max FROM invoices)\nSELECT number, status, dollars, plate, cls, true_max FROM league\nWHERE true_max = {2}\nORDER BY plate {3}\nLIMIT {4};",
    slots: [
      { answer: "'%.2f'", kind: "keyword", label: "the plate format",
        why: "PRINTF('%.2f', …) plates every invoice as fixed two-decimal text — 925.00 for the void invoice. '%.0f' strips the decimals: the void invoice still tops the text sort, but every plate ships bare — 925, not 925.00 — and stops matching the board's two-decimal spec." },
      { answer: "6148", kind: "number", label: "the painted numeric max",
        why: "Probed: the league's numeric ceiling is 6148.00 — invoice INV-2025-025 — painted onto every row by MAX() OVER () as proof the text crown is not the money crown. Pin 925 and the assert demands the ceiling equal the crown's own figure." },
      { answer: "DESC", kind: "keyword", label: "the text-sort direction",
        why: "ORDER BY plate DESC sorts TEXT: '925.00' outranks '1295.00' because '9' beats '1' character-wise — the trap that crowns the void invoice. ASC hands the crown to the open 1295.00 invoice, the mirror-image mistake." },
      { answer: "1", kind: "number", noVerify: true, label: "the crown-row limit",
        why: "The board crowns one row: LIMIT 1 after the text sort keeps exactly the top plate. LIMIT 3 would ship the whole podium — 925.00, 873.00, 6148.00 — as if all three were crowned." },
    ],
    distractors: ["'%.0f'", "ASC", "3", "925"],
    walkthrough:
      "The trap is affinity, printed in plain sight. The stage divides amount_cents by 100.0 — dollars read real — and plates them with PRINTF('%.2f', …), which returns TEXT; the moment the board sorts by the plate, '9' beats '1' and '925.00' sits above '1295.00', so the void invoice INV-2024-011 at 925.00 wears a crown that numerically belongs to 6148.00. That is why MAX(amount_cents / 100.0) OVER () paints the true numeric ceiling — 6148, probed, from INV-2025-025 — onto every row: the board shows crown and ceiling together, and the pin true_max = 6148 proves the ceiling was computed, not assumed. DESC is the direction that produces the text crown; ASC crowns the open 1295.00 invoice instead, the same trap pointed the other way. LIMIT 1 keeps the podium to one plate — 3 would ship three rows under one crown. The storage class column stamps real on the division, the last assurance the plate's TEXT clothing never touched the arithmetic.",
  },
  {
    id: "cs-1453",
    tier: "easy",
    topic: "w7",
    universe: "funnel",
    title: "The EU rate's floor and its round",
    brief:
      "From: Lifecycle marketing. Re: the activation funnel readout.\n\nThe funnel readout shows each region's activation rate twice — floored by CAST for the gauge, rounded by ROUND for the footnote — and the EU row is the one where the two builders drift furthest apart. Rebuild it: customers, activated, the floored rate, the rounded rate.",
    ask: "One query: the EU region's activation row with the rate floored by CAST and rounded to two decimals.",
    template:
      "WITH r AS (SELECT region, COUNT(*) AS customers, SUM(active) AS activated, AVG(active) AS rate\nFROM customers GROUP BY region)\nSELECT region, customers, activated, rate_floor, rounded\nFROM (SELECT region, customers, activated, CAST(rate AS {1}) AS rate_floor,\nROUND(rate, {2}) AS rounded FROM r)\nWHERE region = 'EU' AND activated = {3} AND rounded = {4};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the gauge cast",
        why: "CAST(0.875 AS INTEGER) floors the EU rate to 0 for the gauge — truncation, not rounding. Cast to TEXT and the gauge reads '0.875', a string; cast to REAL and the floor never happens, 0.875 again." },
      { answer: "2", kind: "keyword", label: "the footnote rounding",
        why: "ROUND(0.875, 2) prints 0.88 — probed beside its neighbours: 1 decimal gives 0.9, 0 decimals gives 1. The footnote's two decimals are what separate 0.88 from the gauge's 0." },
      { answer: "7", kind: "number", label: "the activated pin",
        why: "Probed: EU holds 8 customers with 7 active — the 0.875 rate. APAC activates 4 of 5, so pinning 4 with the EU filter finds no row at all." },
      { answer: "0.88", kind: "number", label: "the rounded rate pin",
        why: "Probed: the EU rate 7/8 = 0.875 rounds to 0.88 at two decimals — the footnote figure. Pin 0.9 and the assert demands the one-decimal reading from a two-decimal column." },
    ],
    distractors: ["TEXT", "REAL", "4", "0.9", "1"],
    walkthrough:
      "One rate, three readings, two builders. AVG(active) over EU's 8 customers reads 0.875; CAST(0.875 AS INTEGER) truncates toward zero to 0 — the gauge's blunt needle, showing the funnel as empty when it is seven-eighths full — while ROUND(0.875, 2) keeps 0.88 for the footnote. The probes put the neighbours on record: one decimal reads 0.9, zero decimals reads 1, so the digits slot is not cosmetic. The pins hold the EU row from two sides: activated 7 (APAC's 4 fails the region filter) and rounded 0.88 (0.9 would be the one-decimal figure, 1 the integer one). Cast the gauge to TEXT and the cell becomes the string '0.875' — a gauge that sorts like a word; cast to REAL and the truncation silently never happens. Floored 0, rounded 0.88: the two builders' full disagreement on one row.",
  },
  {
    id: "cs-1454",
    tier: "easy",
    topic: "w7",
    universe: "supplier",
    title: "The four-star partners, counted",
    brief:
      "From: Procurement. Re: the star-shelf census.\n\nThe partner wall groups suppliers into integer star shelves by casting their fractional ratings, then counts each shelf and prints its best rating. The draft's cast target and both census pins fell out in a refactor. Rebuild the four-star shelf.",
    ask: "One query: the four-star shelf's partner count and top rating, cast from the fractional ratings.",
    template:
      "WITH s AS (SELECT name, rating, CAST(rating AS {1}) AS stars FROM suppliers)\nSELECT stars, COUNT(*) AS partners, {2}(rating) AS top_rating\nFROM s GROUP BY stars\nHAVING stars = {3} AND top_rating = {4};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the star cast",
        why: "CAST(rating AS INTEGER) truncates each fractional rating onto a whole-star shelf — 4.8, 4.6, 4.4, 4.1 and 4.0 all land on shelf 4. Cast to TEXT and the shelves become strings that never equal the numeric pin 4; the census starves." },
      { answer: "MAX", kind: "keyword", label: "the shelf-top builder",
        why: "MAX(rating) prints the shelf's best raw rating — 4.8, Alpine's — proving the four-star shelf still holds a near-five partner. AVG would print the shelf's mean 4.38, MIN its floor 4.0; neither is the top." },
      { answer: "4", kind: "number", label: "the shelf pin",
        why: "Probed: shelf 4 holds 5 of the 6 suppliers — everyone but Pacific, whose 3.9 casts onto shelf 3. Pin 3 and the assert demands Pacific's lone shelf with a top rating of 4.8 it never had." },
      { answer: "4.8", kind: "number", label: "the top rating pin",
        why: "Probed: the four-star shelf's best raw rating is 4.8 — Alpine Audio GmbH. 4.6 is Nordic's figure, one rung down the same shelf; pinning it contradicts the MAX the slot is meant to check." },
    ],
    distractors: ["TEXT", "AVG", "MIN", "3", "4.6"],
    walkthrough:
      "The cast builds the shelves: CAST(rating AS INTEGER) truncates 4.8, 4.6, 4.4, 4.1 and 4.0 all onto shelf 4 — five partners on one star — while 3.9 drops alone to shelf 3. That cliff is the census's point: shelf 4's count reads 5, shelf 3's reads 1, and the truncation (not rounding) is what puts a 3.9 partner on a three-star shelf. MAX(rating) beside the count proves shelf 4 still holds a 4.8 — the raw rating survives the cast only in this column, since the shelf key itself has already forgotten the fraction. The double pin locks the row: stars 4 with top_rating 4.8; pin 3 and you demand Pacific's shelf carry Alpine's rating, which it cannot. Cast to TEXT and the group keys become '4' and '3' as strings — SQLite compares TEXT above INTEGER, the pin never matches, the wall goes blank. AVG and MIN in the top seat print 4.38 and 4.0, honest figures for questions the wall never asked.",
  },
  {
    id: "cs-1455",
    tier: "hard",
    topic: "w7",
    universe: "expense",
    title: "Thirteen cash months over the line",
    brief:
      "From: Finance partner. Re: the cash-out board.\n\nThe board stages every account-month's cents, converts to dollars, and keeps only the months at or over the review line — and it stamps each row's cents class so a reviewer can catch a /100 integer clip. Rebuild the cash board: thirteen rows, exact dollars, types stamped.",
    ask: "One query: every cash month at or above the 1959-dollar review line, in exact dollars with the cents class stamped.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents\nFROM ledger_entries WHERE account = {1} GROUP BY mon),\nd AS (SELECT mon, cents / {2} AS dollars, typeof(cents) AS cls FROM m)\nSELECT mon, dollars, cls FROM d WHERE dollars >= {3};",
    slots: [
      { answer: "'cash'", kind: "keyword", label: "the account stage",
        why: "The board reads cash: probed, thirteen of cash's fourteen months clear the line. The operating_expenses stage is the distractor board — only its August (3210), November (1974) and January 2025 (1959) clear 1959." },
      { answer: "100.0", kind: "keyword", label: "the dollars divisor",
        why: "cents / 100.0 keeps REAL dollars — August reads 6254.5 with its half dollar intact. Plain 100 is integer division: 625450 clips to 6254 and the board's audit stamp (typeof still integer on cents) can no longer be reconciled against the dollars column." },
      { answer: "1959", kind: "number", noVerify: true, label: "the review line",
        why: "The review line is a threshold literal — probed, it never appears in the cash result cells, which start at 1982. It is lifted from the opex ledger's January 2025 figure, chosen so cash keeps thirteen months and opex only three." },
    ],
    distractors: ["'operating_expenses'", "2430", "2000", "ABS"],
    walkthrough:
      "Two stages, one line. The first CTE folds each month's cash debits into integer cents — typeof stamps integer, because debit_cents are INTEGERs and SUM keeps them so. The second converts with / 100.0, REAL division, and the difference is visible on the board: August reads 6254.5, the lone half-dollar month; swap in plain 100 and the same stage hands back 6254, a clipped board nobody can tie to the cents column. The threshold pin keeps dollars >= 1959, and probed that keeps thirteen of cash's fourteen months — every month clears the line except January 2024. Point the stage at operating_expenses instead and the board shrinks to three rows (August 3210, November 1974, January 1959 — the line's own namesake), a different book entirely. Raise the line to 2000 and even 1982 falls off, twelve rows. ABS in the class seat replaces the stamp with a cent figure — a board that audits nothing.",
  },
  {
    id: "cs-1456",
    tier: "medium",
    topic: "w7",
    universe: "growth",
    title: "2025's pot, dust and all",
    brief:
      "From: Growth board. Re: the year-end revenue split.\n\nThe board's year table casts the signup-year slice to an integer, folds each year's ticket count and revenue pot, then prints the pot through PRINTF — because 2025's raw pot carries float dust the deck refuses to show. Rebuild the 2025 row: tickets, raw pot, printed pot, class.",
    ask: "One query: the 2025 order year with its ticket count, raw pot, two-decimal printed pot and the pot's storage class.",
    template:
      "WITH y AS (SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, {4} AS tickets, SUM(total) AS pot\nFROM orders GROUP BY yr)\nSELECT yr, tickets, pot, PRINTF({1}, pot) AS plate, {2}(pot) AS cls\nFROM y WHERE yr = {3};",
    slots: [
      { answer: "'%.2f'", kind: "keyword", label: "the pot printer",
        why: "PRINTF('%.2f', pot) prints the raw 4060.0299999999997 as 4060.03 — the only form the deck ships. '%.1f' would print 4060.0, clipping the three cents the year actually earned." },
      { answer: "typeof", kind: "keyword", label: "the class stamp",
        why: "typeof(pot) stamps real — SUM over REAL totals stays real, dust included. ROUND in that seat would stamp 4060, an integer where a storage class belongs; ABS is subtler — it stamps 4060.03, the same value but as a bare number, and the type audit reads a figure instead of a type." },
      { answer: "2025", kind: "number", label: "the year pin",
        why: "Probed: 2025 holds 13 tickets with a pot of 4060.0299999999997 — the dusty tail beside 2024's clean-looking 90-ticket year. Pin 2024 and the board ships the other row entirely." },
      { answer: "COUNT(*)", kind: "keyword", label: "the ticket counter",
        why: "Tickets are rows: COUNT(*) counts 2025's 13 orders into the board. SUM in that seat is no fold at all — bare SUM is just a missing column to the parser, no such column: SUM — and the board never runs." },
    ],
    distractors: ["2024", "ROUND", "'%.1f'", "SUM"],
    walkthrough:
      "The year table is a cast-then-fold pipeline: SUBSTR slices '2025' out of created_at, CAST AS INTEGER makes the group key numeric, and GROUP BY yr folds 103 orders into two rows — 2024 with 90 tickets and 30773.25, 2025 with 13 tickets and a pot the engine stores as 4060.0299999999997. That dust is the row's whole story: binary float residue from summing cents-bearing totals, stamped real by typeof because SUM never leaves REAL arithmetic. PRINTF('%.2f', pot) is the plate that makes it shippable — 4060.03, probed — while '%.1f' would print 4060.0 and quietly delete the year's trailing cents. The seductive wrong chip is ROUND in the class seat: it executes, but it stamps the integer 4060 where a storage class belongs; ABS is subtler still — it stamps 4060.03, the same value, but as a bare number instead of the word real. Either way the board's type audit reads a figure where it needs a type. And the ticket counter is COUNT(*) for a reason: SUM in that seat is not a fold but a missing column, and the board never runs.",
  },
  {
    id: "cs-1457",
    tier: "easy",
    topic: "w7",
    universe: "inventory",
    title: "The hub's clipped half-bin",
    brief:
      "From: Warehouse ops. Re: the split-bin worksheet.\n\nOdd-stock SKUs split into two uneven bins, and the worksheet shows both readings of the half: the quick integer division the pickers use, and the exact REAL cast the reorder tool needs. The hub row (stock 85) is the audit's example. Rebuild it with both readings and the quick reading's class.",
    ask: "One query: the stock-85 hub with its integer per-bin figure, its exact half, and the per-bin storage class.",
    template:
      "WITH odd AS (SELECT name, stock, stock / {1} AS per_bin, CAST(stock AS {2}) / 2 AS exact\nFROM products WHERE stock % 2 = {3})\nSELECT name, stock, per_bin, exact, typeof(per_bin) AS cls\nFROM odd WHERE stock = {4};",
    slots: [
      { answer: "2", kind: "keyword", label: "the bin divisor",
        why: "stock / 2 is INTEGER division — 85 becomes 42, the pickers' clipped bin, stamped typeof integer. Divide by 2.0 and the quick reading turns into the exact one: 42.5, real — the worksheet's two columns collapse into each other." },
      { answer: "REAL", kind: "keyword", label: "the exact-reading cast",
        why: "CAST(stock AS REAL) / 2 keeps the half — 42.5 for the hub's 85. Cast to INTEGER instead and the 'exact' column clips to 42 too, and the worksheet shows the same clipped number twice with no half anywhere." },
      { answer: "1", kind: "keyword", label: "the odd-stock mask",
        why: "stock % 2 = 1 keeps the three odd-stock SKUs — probed: the Mic at 45, the Hub at 85, the Fitness Band at 95. Mask 0 and the stage flips to the thirteen even-stock SKUs, none of which is the hub." },
      { answer: "85", kind: "number", label: "the hub stock pin",
        why: "Probed: the USB-C Hub 7-in-1 holds 85 units — 42 per bin plus one. 95 is the Fitness Band's stock, the audit's next example down the same worksheet." },
    ],
    distractors: ["INTEGER", "2.0", "0", "95"],
    walkthrough:
      "One row carries the worksheet's whole lesson. The stage keeps odd-stock SKUs — stock % 2 = 1 selects exactly three: Studio Desktop Mic 45, USB-C Hub 85, Fitness Band X2 95 — and the pin lands on the hub. Its two readings diverge by half a unit: stock / 2 with an INTEGER divisor is SQLite's integer division, 85 / 2 = 42, stamped typeof integer; CAST(stock AS REAL) / 2 preserves the half, 42.5. Both matter — pickers bin 42 and hold one, the reorder tool plans for 42.5 — and the worksheet exists because collapsing them is how stock goes missing. The traps are adjacent: divisor 2.0 turns the quick reading into 42.5 real, making the columns identical; cast target INTEGER clips the exact reading to 42, making them identical the other way; mask 0 swaps the roster to the thirteen even-stock SKUs, where no hub exists. 42 and 42.5 on one row, classes integer and real: that is the audit.",
  },
  {
    id: "cs-1458",
    tier: "hard",
    topic: "w7",
    universe: "pricing",
    title: "The text-sorted tag podium",
    brief:
      "From: Merchandising. Re: the clean-tag podium.\n\nThe podium lists the whole-dollar SKUs — price equal to its own integer cast — ranked by their printed two-decimal tags. But the tags are TEXT, and nobody noticed the podium is sorted in text order, not price order. Rebuild the board exactly as it ships, trap included, and prove it with the storage class column.",
    ask: "One query: the top three whole-dollar products under a DESC sort on the printed tag text, with each tag's class stamped.",
    template:
      "WITH keep AS (SELECT name, price, CAST(price AS INTEGER) AS shelf, PRINTF({1}, price) AS tag\nFROM products WHERE price = CAST(price AS INTEGER))\nSELECT name, price, shelf, tag, typeof(tag) AS cls\nFROM keep ORDER BY {2} DESC LIMIT {3};",
    slots: [
      { answer: "'%.2f'", kind: "keyword", label: "the tag printer",
        why: "PRINTF('%.2f', price) prints each keeper's tag as two-decimal text — 79.00, 65.00, 49.00 on the podium — and typeof stamps the plate text. '%.0f' would print bare 79/65/49 and the shipped tags stop matching the board's spec." },
      { answer: "tag", kind: "keyword", label: "the text sort key",
        why: "ORDER BY tag DESC sorts the TEXT plates: '79' beats '129' because '7' outranks '1' character-wise, so the podium is Fitness 79, Cycling 65, Hub 49 — not the numeric 129/119/79. Sorting by price or name ships a different podium under the same headline." },
      { answer: "3", kind: "number", noVerify: true, label: "the podium size",
        why: "The board ships three rows: LIMIT 3 after the text sort. LIMIT 1 would crown Fitness Band alone and hide the trap the podium exists to demonstrate." },
    ],
    distractors: ["'%.0f'", "price", "name", "1"],
    walkthrough:
      "The stage keeps the six whole-dollar keepers — price = CAST(price AS INTEGER) admits 129, 119, 79, 65, 49, 32 and rejects the ten cent-bearing tags — then prints each as a two-decimal TEXT plate. The trap is the sort: ORDER BY tag DESC compares strings, and '79.00' outranks '129.00' because '7' beats '1' in the first character, so the podium reads Fitness Band 79.00, Cycling Jersey 65.00, USB-C Hub 49.00 — three of the catalog's cheaper tags standing where 129 and 119 should be. typeof(tag) stamps text on every row, the board's own confession that it sorted words. Sort by price instead and the numeric podium appears — 129.00, 119.00, 79.00 — a correct-looking board that no longer matches what shipped; sort by name and Yoga Mat's 32.00 leads. The probes recorded the full divergence: all six keepers change position between text and price order. '%.0f' would strip the decimals the spec calls for, and LIMIT 1 would crown Fitness Band before the trap is even visible.",
  },
  {
    id: "cs-1459",
    tier: "hard",
    topic: "w7",
    universe: "refund-audit",
    title: "July's cancelled pair, whole and plated",
    brief:
      "From: Refunds desk. Re: the July cancellation card.\n\nThe desk's month card shows each cancelled order three ways: raw total, integer-whole for the aging bucket, and the printed plate — biggest first. July holds exactly two cancellations. Rebuild the card with the cast, the month filter and the sort direction restored.",
    ask: "One query: July's cancelled orders with CAST-whole figures and printed plates, biggest total first.",
    template:
      "WITH j AS (SELECT id, total, CAST(total AS {1}) AS whole, PRINTF('%.2f', total) AS plate,\ntypeof(total) AS cls\nFROM orders WHERE status = 'cancelled' AND strftime('%Y-%m', created_at) = {2})\nSELECT id, total, whole, plate, cls FROM j ORDER BY total {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the whole-figure cast",
        why: "CAST(total AS INTEGER) truncates 90.35 to 90 and 25.47 to 25 — the aging buckets' whole dollars, dust discarded. Cast to TEXT and whole becomes '90.35', a string bucket key; cast to REAL and nothing is whole." },
      { answer: "'2024-07'", kind: "keyword", label: "the month filter",
        why: "Probed: July 2024 holds exactly two cancellations — ids 50 (90.35) and 51 (25.47). November's pair (397.99 and 143.86) is the mirror distractor: same shape, wrong month, wrong card." },
      { answer: "DESC", kind: "keyword", label: "the card direction",
        why: "The card reads biggest first: DESC puts 90.35 above 25.47. ASC flips the pair and ships the smaller cancellation as the card's lead, the opposite reading of the same two rows." },
    ],
    distractors: ["TEXT", "REAL", "'2024-11'", "ASC"],
    walkthrough:
      "The month filter is strftime('%Y-%m', created_at) = '2024-07', and probed it admits exactly two rows: id 50 at 90.35 and id 51 at 25.47 — July's whole cancellation book on one card. Each row shows the total three ways: raw (stamped real by typeof — the totals are REAL and pass through untouched), CAST(total AS INTEGER) truncated to the aging buckets' 90 and 25, and PRINTF('%.2f', …) plating 90.35 and 25.47 as shippable text. The cast is truncation, not rounding — 25.47's bucket is 25, not 26 — and casting to TEXT would make the bucket keys strings that sort like words. DESC orders the card biggest-first; ASC ships 25.47 as the lead, the same two rows telling the opposite story. The '2024-11' chip is the trap with a pedigree: November also holds exactly two cancellations (397.99, 143.86), so a wrong month still yields a well-formed two-row card — just not July's.",
  },
  {
    id: "cs-1460",
    tier: "hard",
    topic: "w7",
    universe: "fraud",
    title: "The zero-proof grand total",
    brief:
      "From: Internal audit. Re: the books-balance proof.\n\nThe zero proof folds each ledger account to its net cents, paints the grand total across every row with a window, and asserts the books net to exactly zero — any other figure is a posting bug. Pin the biggest account row with the proof painted on. The draft lost the painter, the direction and the cut.",
    ask: "One query: the largest net account with its cents, dollars, class and the zero-proof grand total painted on.",
    template:
      "WITH nets AS (SELECT account, SUM(debit_cents - credit_cents) AS net_cents\nFROM ledger_entries GROUP BY account),\np AS (SELECT account, net_cents, net_cents / 100.0 AS dollars, typeof(net_cents) AS cls,\n{1}(net_cents) OVER () AS grand FROM nets)\nSELECT account, net_cents, dollars, cls, grand FROM p\nORDER BY net_cents {2} LIMIT {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the zero-proof painter",
        why: "SUM(net_cents) OVER () paints 0 onto every row — cash 4419600, AR 1644000, opex 2541600 and revenue −8605200 cancel exactly, the double-entry proof. COUNT paints 4, the account count, and the proof reads as a headcount." },
      { answer: "DESC", kind: "keyword", label: "the board direction",
        why: "The proof pins the biggest net first: DESC puts cash's 4419600 on top. ASC surfaces sales_revenue's −8605200 — the deepest negative — and the board would read as if the revenue account were the headline." },
      { answer: "1", kind: "number", noVerify: true, label: "the proof-row cut",
        why: "The board shows one proof row: LIMIT 1. LIMIT 2 would ship cash and operating_expenses together and blur which row carries the headline." },
    ],
    distractors: ["COUNT", "ABS", "ASC", "2"],
    walkthrough:
      "The proof is a paint, not a fold: the nets CTE folds 80 ledger entries into four account nets — cash 4419600, accounts_receivable 1644000, operating_expenses 2541600, sales_revenue −8605200, all stamped typeof integer because SUM over INTEGER cents stays integer — and SUM(net_cents) OVER () paints their grand total, 0, onto every row. Zero is the audit's whole point: debits and credits cancel to the cent, and any other grand is a posting bug. DESC orders the board so cash's 4419600 tops it with the zero painted beside it — the headline row carrying its own proof. COUNT in the painter seat executes but paints 4, the account count, turning a balance proof into a headcount; ABS is refused as a window function outright. ASC crowns sales_revenue's −8605200 instead, the mirror reading, and LIMIT 2 ships two rows under one headline. One row out: cash, 4419600 cents, 44196 dollars, integer, grand 0.",
  },
];
