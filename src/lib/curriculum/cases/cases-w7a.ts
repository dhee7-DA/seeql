// Case wave w7a — Module 5 type & cast (lesson 29), cs-1425…cs-1442.
// 18 cases: 6 easy / 6 medium / 6 hard, all topic "w7" (CAST AS INTEGER/REAL/TEXT,
// typeof() stamps, cents↔money via /100.0 vs /100 integer-division clips,
// string↔number coercion, printf plates, float-dust round-trips).
// Every figure traces to committed probe receipts:
// scripts/m5-facts-w7.out + m5-facts-w7b.out (per-id fills and distractor
// landings for exactly cs-1425…cs-1460; the w7b agent used 1443–1460).
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW7a: CaseStudy[] = [
  {
    id: "cs-1425",
    tier: "medium",
    topic: "w7",
    universe: "catalog",
    title: "The whole-dollar floor stamp",
    brief:
      "From: Catalog lead. Re: the premium shelf audit.\n\nThe warehouse system only accepts whole-dollar floor prices, so the priciest SKU on the shelf needs its REAL price truncated to an INTEGER stamp — with the storage class diagnosed alongside so we know what went in. Rebuild the one-row audit for the flagship camera helper.",
    ask: "One query: the flagship 199.99 product with its INTEGER price floor and the raw price's typeof stamp.",
    template:
      "SELECT name, price, CAST(price AS {1}) AS shelf, typeof(price) AS cls\nFROM products WHERE price = {2} AND typeof(price) = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the floor cast",
        why: "CAST(price AS INTEGER) truncates toward zero — probed: 199.99 lands at 199, and the 149.99 headset floors to 149 the same way. CAST AS TEXT would hand the warehouse the string '199.99', which is not a floor at all." },
      { answer: "199.99", kind: "number", label: "the flagship price pin",
        why: "The priciest SKU sits at 199.99 — probed: Smart Watch S is the only product at that price, flooring to 199. Pin 149.99 instead and the audit rows the Noise-Canceling Headset (149.99 → 149), a different shelf entirely." },
      { answer: "'real'", kind: "keyword", label: "the storage-class stamp",
        why: "typeof(price) reads 'real' on every catalog price — the 199.99 shelf value is stored as a float, which is exactly why the floor cast is needed. 'integer' would describe the stamped output, not the raw column, and filters the row away." },
    ],
    distractors: ["149.99", "TEXT", "REAL", "BOOLEAN"],
    walkthrough:
      "The catalog stores prices as REAL, and the warehouse intake only takes whole dollars — so the audit shows both truths on one row. CAST(price AS INTEGER) does the truncation: 199.99 → 199, dropping the 99 cents rather than rounding up. typeof(price) is the diagnosis half: it reads 'real', proving the raw column is a float and justifying the cast. The price pin 199.99 isolates Smart Watch S, the one 199.99 SKU; aim the pin at 149.99 and you audit the Noise-Canceling Headset instead (149.99 → 149). CAST AS REAL is a no-op here — it hands back 199.99, the very thing the warehouse rejects — and CAST AS TEXT produces the string '199.99', a label where a number belongs.",
  },
  {
    id: "cs-1426",
    tier: "easy",
    topic: "w7",
    universe: "inventory",
    title: "The fleet average, floored",
    brief:
      "From: Warehouse ops. Re: the board deck's headline.\n\nThe board wants one whole-unit figure for average stock per SKU, but the true average carries a fraction the deck must not print. The draft query lost its floor cast, its headline figure and the raw value it was floored from. Rebuild it.",
    ask: "One query: the raw average stock, its INTEGER floor, and the typeof class — floored to the board's headline.",
    template:
      "SELECT AVG(stock) AS raw, CAST(AVG(stock) AS {1}) AS floored, typeof(AVG(stock)) AS cls\nFROM products HAVING floored = {2} AND raw = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the floor cast",
        why: "CAST(AVG(stock) AS INTEGER) truncates 177.8125 to 177 — the whole-unit headline the board prints. TEXT would floor nothing, delivering '177.8125' as a string, and REAL returns the raw fraction unchanged." },
      { answer: "177", kind: "number", label: "the board headline",
        why: "Probed: the 16-SKU stock average is 177.8125, which floors to 177 — the assert pins the headline. 178 is what ROUND would print, not CAST; pinning 178 makes the assert demand a number the floor never produces." },
      { answer: "177.8125", kind: "number", label: "the raw average",
        why: "The unfloored mean across 16 products is 177.8125 — the assert keeps the raw figure on the row so the floor's cost (0.8125 units) is visible. Pin any other raw value and the deck's headline detaches from its source." },
    ],
    distractors: ["TEXT", "REAL", "178"],
    walkthrough:
      "AVG(stock) over the 16-product catalog returns 177.8125 — a REAL, as typeof confirms. The board wants whole units, so CAST(AVG(stock) AS INTEGER) truncates the fraction: 177, not 178 (rounding is ROUND's job — probed, ROUND(AVG(stock)) prints 178). The HAVING assert ties the row together: floored = 177 AND raw = 177.8125, so the deck can show the headline and the exact source side by side. Cast to TEXT and the 'floor' is the string '177.8125' — nothing truncated, assert empty. Cast to REAL and nothing changes but the label. And notice the assert pins 177, not 178: the whole point of this figure is that it floors, it doesn't round.",
  },
  {
    id: "cs-1427",
    tier: "hard",
    topic: "w7",
    universe: "refund-audit",
    title: "One debit, two dollars",
    brief:
      "From: Refund desk. Re: the disputed August debit.\n\nA customer is disputing ledger entry 43, and the reply needs both dollar readings of the same debit: the clipped whole-dollar figure the ledger summary prints and the exact cents-and-half figure the bank statement shows. The draft lost the exact divisor and the entry's type stamp. Rebuild the dispute row.",
    ask: "One query: ledger entry 43 with its debit in cents, both dollar readings, and the cents column's typeof stamp.",
    template:
      "SELECT id, entry_date, debit_cents, typeof(debit_cents) AS cls,\n       debit_cents / 100 AS whole_dollars, debit_cents / {1} AS exact_dollars\nFROM ledger_entries WHERE id = {2} AND debit_cents = {3} AND typeof(debit_cents) = {4};",
    slots: [
      { answer: "100.0", kind: "keyword", label: "the exact divisor",
        why: "Dividing by 100.0 forces REAL division — probed: 625450 / 100.0 = 6254.5, the bank's exact figure. The bare 100 runs SQLite's integer division and clips the half dollar: 6254, which is precisely the mismatch the customer is disputing." },
      { answer: "43", kind: "number", label: "the disputed entry",
        why: "Entry 43 is the disputed debit — probed: dated 2024-08-31, 625450 cents. Entry 49 carries the other half-dollar debit (842050 → 8420.5) but pinning it alongside debit_cents = 625450 selects nothing." },
      { answer: "625450", kind: "number", label: "the debit in cents",
        why: "The ledger stores cents as INTEGER — probed: entry 43 holds 625450 cents, and typeof reads 'integer'. The pin keeps both dollar readings honest: 6254 clipped, 6254.5 exact, off the same 625450." },
      { answer: "'integer'", kind: "keyword", label: "the cents stamp",
        why: "typeof(debit_cents) reads 'integer' — the ledger's cent columns are whole-number storage, which is why /100 clips instead of dividing. 'real' would describe the /100.0 output, not the raw column, and empties the assert." },
    ],
    distractors: ["49", "100", "'real'"],
    walkthrough:
      "This is the cents↔money trap in one row. debit_cents is INTEGER storage — typeof says so — so SQLite picks the operator by the divisor: / 100 runs integer division and clips (625450 → 6254), while / 100.0 promotes to REAL and keeps the half (6254.5). The dispute turns on exactly that half dollar: the ledger summary prints 6254, the bank says 6254.5, and both readings belong on the audit row. The pins hold it together — entry 43, 625450 cents, 'integer' stamp — and entry 49 (the other 842050-cent half-dollar debit) shows the same disease if you mispin. Swap the exact divisor back to bare 100 and both columns read 6254: the summary's version, and the reason the customer is still angry.",
  },
  {
    id: "cs-1428",
    tier: "medium",
    topic: "w7",
    universe: "fraud",
    title: "The crown that text stole",
    brief:
      "From: Risk desk. Re: the flag-rule regression.\n\nThe fraud scanner is supposed to crown the biggest order, but someone wrapped the totals in a plate formatter and the crown moved to a row that isn't the whale. The fixed rule needs both crowns side by side — numeric and text — so the regression is visible. Rebuild the comparison.",
    ask: "One query: the numeric MAX of order totals next to the text MAX of the two-decimal plates.",
    template:
      "SELECT MAX(total) AS num_max, {2}(PRINTF({1}, total)) AS text_max, typeof(MAX(total)) AS cls\nFROM orders HAVING num_max = {3};",
    slots: [
      { answer: "'%.2f'", kind: "keyword", label: "the plate format",
        why: "PRINTF('%.2f', total) renders every total as a two-decimal text plate — probed: the whale 1088.44 plates to '1088.44'. '%.0f' would strip the cents the scanner compares, moving the text crown again." },
      { answer: "MAX", kind: "keyword", label: "the crown operator",
        why: "MAX over the plates compares TEXT, and text order crowns '99.48' — the probe's regression. MIN crowns the text cellar instead, COUNT returns the 103-row headcount, and SUM coerces the plates back to numbers, erasing the trap being audited." },
      { answer: "1088.44", kind: "number", label: "the numeric crown",
        why: "Probed: the largest order total is 1088.44 — the crown the numeric rule returns and typeof stamps 'real'. The assert pins it so the regression is measurable: numeric 1088.44 against the text crown's 99.48 on one row." },
    ],
    distractors: ["MIN", "COUNT", "SUM", "'%.0f'"],
    walkthrough:
      "Aggregate MAX changes personality with its input's type. MAX(total) walks REAL values and crowns 1088.44 — the true whale. MAX(PRINTF('%.2f', total)) walks TEXT values, so comparison is alphabetical: '9' beats '8' and '1', and '99.48' — a 99-dollar order — steals the crown from 1088.44. That is the whole regression: the plate formatter silently re-typed the column. typeof(MAX(total)) stamps 'real' as the control. Swap the operator to MIN and you crown the text cellar instead; SUM would coerce the plates back to numbers (~34833) and hide the bug; '%.0f' re-renders the plates without cents and moves the crown yet again. The assert on 1088.44 keeps the honest crown pinned while the stolen one sits beside it.",
  },
  {
    id: "cs-1429",
    tier: "easy",
    topic: "w7",
    universe: "pricing",
    title: "Tickets priced whole",
    brief:
      "From: Pricing team. Re: the whole-dollar promo audit.\n\nThe promo only pays out on orders whose total is already a whole-dollar amount, and finance wants the audit row for the first such ticket. The draft lost the cast that defines 'whole' and the ticket's own figures. Rebuild it.",
    ask: "One query: the whole-dollar order at id 35 with its total, its INTEGER cast, and the total's typeof stamp.",
    template:
      "SELECT id, total, CAST(total AS {1}) AS whole, typeof(total) AS cls\nFROM orders WHERE total = {2} AND total = CAST(total AS INTEGER) AND id = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the whole-dollar cast",
        why: "CAST(total AS INTEGER) is the test: a total equal to its own integer cast is already whole — probed, only two orders pass (373 and 149). TEXT would compare 373 to the string '373.0', and REAL is the column's own type, matching every row." },
      { answer: "373", kind: "number", label: "the whole total",
        why: "Probed: order 35 totals exactly 373 — the first whole-dollar ticket. Pinning 149 grabs order 94, the other passer, and pinning any fractional total fails the cast test and returns nothing." },
      { answer: "35", kind: "number", label: "the first passer",
        why: "Order 35 is the audit's subject — probed row: 35 | 373 | 373 | real, the total equal to its own floor. Id 94 is the second whole-dollar order (149), not the first." },
    ],
    distractors: ["94", "149", "TEXT"],
    walkthrough:
      "'Whole-dollar' is a type question, so the query answers it with a cast: total = CAST(total AS INTEGER) keeps only rows whose REAL total survives truncation unchanged. Probed, exactly two orders pass — id 35 at 373 and id 94 at 149 — and the promo audit wants the first. The row shows the mechanism: total 373, the cast 373, and typeof(total) = 'real' reminding you the column is float storage that happens to hold a whole value. Pin id 94 and you audit the second passer; pin total = 149 and the id pin still filters it out. Cast to TEXT and the comparison becomes 373 = '373.0' — affinity converts the string back to 373, the row survives, but the 'whole' column prints text, which the payout file rejects.",
  },
  {
    id: "cs-1430",
    tier: "easy",
    topic: "w7",
    universe: "supplier",
    title: "The near-miss tier",
    brief:
      "From: Procurement. Re: the partner tiering review.\n\nPartner tiers come from CAST-ing each rating to a whole-star level, and the review board only sees the four-star crowd — procurement wants the near-miss tier documented too, the partners whose fractional rating truncates below the line. Rebuild the tail row.",
    ask: "One query: the truncated star level with exactly one partner, counted.",
    template:
      "SELECT CAST(rating AS {1}) AS stars, COUNT(*) AS partners\nFROM suppliers GROUP BY stars HAVING stars = {2} AND partners = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the truncating cast",
        why: "CAST(rating AS INTEGER) truncates each rating to its star floor — probed census: five partners truncate to 4 and one to 3. TEXT would group by the raw strings ('4.8', '4.6', … six groups), and REAL wouldn't truncate at all." },
      { answer: "3", kind: "number", label: "the near-miss level",
        why: "Probed: only Pacific Textiles (3.9) truncates to the 3-star tier — stars 3, partners 1. The 4-star tier holds five partners; pinning stars = 4 lands the crowd the board already sees, not the near-miss row." },
      { answer: "1", kind: "number", label: "the tail count",
        why: "The 3-star tier has exactly one partner — the census's proof that a 3.9 rating casts below the line. Partners = 4 matches nobody, and 5 is the four-star crowd's count, not the tail's." },
    ],
    distractors: ["TEXT", "REAL", "4", "5"],
    walkthrough:
      "Tiering by stars is CAST(rating AS INTEGER): truncation, not rounding — 3.9 drops to 3, which is why Pacific Textiles misses the four-star crowd despite rounding to it. The probed census has two tiers: stars 4 with five partners (Alpine 4.8, Nordic 4.6, Midwest 4.4, Shenzhen 4.1, Andes 4.0) and stars 3 with the lone 3.9. The HAVING pins the tail: stars = 3 AND partners = 1. Cast to TEXT and the groups become the raw rating strings — six groups, no truncation, no tail. Cast to REAL and nothing groups. Pin stars 4 or partners 5 and you've rebuilt the board's four-star row, the one view procurement already has.",
  },
  {
    id: "cs-1431",
    tier: "medium",
    topic: "w7",
    universe: "growth",
    title: "The year that wasn't a number",
    brief:
      "From: Growth board. Re: the cohort ticket count.\n\nThe board's cohort chart groups orders by signup-year, but someone built the year by slicing text, and the chart silently grouped a string. Finance wants the slice's storage class stamped next to the count so the shortcut is on the record. Rebuild the 2024 row.",
    ask: "One query: the 2024 cohort's ticket count, grouped by the INTEGER-cast year slice, with the raw slice's typeof stamp.",
    template:
      "SELECT typeof(SUBSTR(created_at, 1, 4)) AS raw_cls,\n       CAST(SUBSTR(created_at, 1, {1}) AS INTEGER) AS yr, COUNT(*) AS tickets\nFROM orders GROUP BY yr HAVING yr = {2} AND tickets = {3};",
    slots: [
      { answer: "4", noVerify: true, kind: "number", label: "the year-slice width",
        why: "Four characters is the whole year — '2024' casts to 2024. Slice 3 and every timestamp yields '202', one 202 group with no 2024 row; slice 2 yields '20'. The width never prints in the result, so it's asserted by consequence." },
      { answer: "2024", kind: "number", label: "the cohort year",
        why: "Probed: the cast groups orders into 2024 and 2025, and 2024 holds 90 tickets. Pinning 2025 grabs the 13-ticket tail; pinning anything below 2024 selects nothing because the cast made real integers." },
      { answer: "90", kind: "number", label: "the 2024 ticket count",
        why: "Probed: 90 of the 103 orders were created in 2024 — the chart's headline bar. The assert pairs it with yr = 2024 so the slice width can't quietly change the grouping without emptying the row." },
    ],
    distractors: ["1", "2", "3"],
    walkthrough:
      "SUBSTR hands back TEXT — typeof stamps it — and GROUP BY on that text would sort '2025' beside '2024' as strings. The fix is CAST(SUBSTR(created_at, 1, {1}) AS INTEGER): the slice becomes a real number, and the probed census lands 2024 | 90 and 2025 | 13. The assert pins the 2024 row at 90 tickets. Watch the slice width: at 4 you get the year; at 3 every timestamp — 2024 and 2025 alike — collapses to '202', one 103-row group with no 2024 member; at 2 it's '20'. That's why the width sits in the template rather than the prose: it changes the group key, and only 4 survives the assert. The raw_cls column keeps the confession on the record — the slice was text before the cast.",
  },
  {
    id: "cs-1432",
    tier: "medium",
    topic: "w7",
    universe: "month-close",
    title: "The delivered pot, booked whole",
    brief:
      "From: Controller. Re: the revenue line item.\n\nThe close books delivered revenue at whole dollars, so the reconciliation must show the exact pool and the booked figure side by side — and prove the booking is a truncation, not the pool itself. The draft lost the cast and the pool's status filter. Rebuild the line item.",
    ask: "One query: the delivered pool's exact sum next to its INTEGER booking, filtered to the delivered status.",
    template:
      "SELECT status, SUM(total) AS pool, CAST(SUM(total) AS {1}) AS booked\nFROM orders GROUP BY status HAVING status = {2} AND booked = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the booking cast",
        why: "CAST(SUM(total) AS INTEGER) truncates 15571.07 to 15571 — the booked figure. TEXT books the string '15571.07', and the BOOLEAN cast probed on this very pool returns 15571.07 unchanged, which would book the cents the close strips." },
      { answer: "'delivered'", kind: "keyword", label: "the pool filter",
        why: "The revenue line reconciles the delivered pool — probed: 15571.07 across 52 tickets. 'pending' pools 6113 and 'shipped' pools 11996.72; either filter books a different line and the close fails to tie." },
      { answer: "15571", kind: "number", label: "the booked figure",
        why: "Probed: the delivered pool truncates to 15571 — the assert pins the booked value so the reconciliation shows both truths: pool 15571.07, booked 15571, seven cents and change clipped." },
    ],
    distractors: ["'pending'", "TEXT", "BOOLEAN", "REAL"],
    walkthrough:
      "Month-end books whole dollars, and the honest way to show it is both columns on one row: SUM(total) = 15571.07 for the delivered pool, CAST(SUM(total) AS INTEGER) = 15571 for the booking. The assert pins 15571, so if the cast ever stopped truncating, the row would vanish. That's not hypothetical — probed on this pool, CAST AS BOOLEAN falls back to numeric affinity and returns 15571.07, booking the cents right back. TEXT 'books' a string. And the filter matters as much as the cast: the same query over 'pending' pools 6113 and over 'shipped' 11996.72 — the close's revenue line would tie to nothing. Filter, fold, truncate, assert: four moves, one line item.",
  },
  {
    id: "cs-1433",
    tier: "hard",
    topic: "w7",
    universe: "pricing",
    title: "The keyboard's two-cent ghost",
    brief:
      "From: Pricing team. Re: the cents-accuracy complaint.\n\nA marketplace seller swears our shelf math loses their cents, and the keyboard is the case study: its price minus its own floor doesn't print what arithmetic class predicts. Rebuild the dust row — price, floor, and the rounded dust — plus the flag on the digits.",
    ask: "One query: product 1 with its price, INTEGER shelf floor, and the price-minus-floor dust rounded to two decimals.",
    template:
      "SELECT id, name, price, CAST(price AS {1}) AS shelf,\n       ROUND(price - CAST(price AS INTEGER), {2}) AS dust\nFROM products WHERE id = {3};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the shelf floor cast",
        why: "CAST(price AS INTEGER) floors 89.99 to 89 — probed shelf cell. TEXT yields the string '89.99' (and a zero dust), REAL yields 89.99 unchanged; only the INTEGER cast creates the 0.99 ghost the seller is complaining about." },
      { answer: "2", kind: "keyword", label: "the dust rounding digits",
        why: "Two digits print the merchant's truth: probed dust = 0.99. Zero digits collapse it to 1 — a whole phantom dollar. Any wider setting (3, 4) still prints 0.99, so only 0 or 1 change the cell, and both misstate the ghost." },
      { answer: "1", kind: "number", label: "the case-study row",
        why: "Product 1 is the Mechanical Keyboard K1 at 89.99 — probed row: 89 shelf, 0.99 dust, raw float 0.9899999999999949. Id 3 is the hub at 49, whose dust is a flat 0 and proves nothing." },
    ],
    distractors: ["TEXT", "REAL", "0"],
    walkthrough:
      "The ghost is float dust. 89.99 stored as REAL is really 89.99000000000000909; subtract its floor 89 and the raw dust prints 0.9899999999999949 — probed, not 0.99. That's why the audit rounds: ROUND(dust, 2) = 0.99, the merchant's truth, while the raw cell keeps the confession. The floor cast matters symmetrically: CAST AS TEXT gives shelf '89.99' and dust 0 (string minus itself), CAST AS REAL gives 89.99 and dust 0 — only INTEGER creates the 99-cent gap. The digits flag is the tripwire: at 0 the dust prints 1, a phantom dollar the seller would quote back at us; at 2 it prints 0.99 and the complaint resolves. The probed cents check closes the loop: price * 100 = 8999, so the wire cents were never lost — only the subtraction dust was noisy.",
  },
  {
    id: "cs-1434",
    tier: "easy",
    topic: "w7",
    universe: "funnel",
    title: "The region at one hundred",
    brief:
      "From: Lifecycle marketing. Re: the activation story.\n\nOne region activated every single customer it signed, and the funnel deck wants that perfect row — headcount, activations, and the floored rate that proves the hundred percent. The draft lost the region pin and both census figures. Rebuild it.",
    ask: "One query: the fully-activated region with its customer count, activation count, and integer activation percent.",
    template:
      "SELECT region, COUNT(*) AS customers, SUM(active) AS activated,\n       CAST(AVG(active) AS INTEGER) AS rate_floor,\n       CAST(100.0 * SUM(active) / COUNT(*) AS INTEGER) AS active_pct\nFROM customers GROUP BY region HAVING region = {1} AND activated = {2} AND active_pct = {3};",
    slots: [
      { answer: "'LATAM'", kind: "keyword", label: "the perfect region",
        why: "Probed: LATAM is the only region at a full 100 — 1 of 1 customers active. 'US' also reads 100 percent but on 2 of 2, so its activated count 2 fails the assert; 'APAC' sits at 80 percent and never passes." },
      { answer: "1", kind: "number", label: "the activation count",
        why: "LATAM's census is 1 customer, 1 activated — the tiny cohort is the story: perfect coverage, sample of one. The assert pins activated = 1, which 'US' (2 activated) cannot meet." },
      { answer: "100", kind: "number", label: "the activation percent",
        why: "Probed: 100.0 * 1 / 1 = 100 — the deck's headline. APAC's percent is 80 and EU's 87, so pinning 100 keeps only the perfect row; pinning 80 resurrects APAC instead." },
    ],
    distractors: ["'US'", "2", "80"],
    walkthrough:
      "The funnel deck's best stat is also its smallest: LATAM signed one customer and activated that customer — census 1 | 1, rate floor 1, percent 100. The two percent columns disagree on purpose: CAST(AVG(active) AS INTEGER) floors the ratio (1.0 → 1), while the scaled form CAST(100.0 * SUM/COUNT AS INTEGER) prints the percent the slide quotes (100). The assert demands all three: region 'LATAM', activated 1, percent 100 — which 'US' cannot pass (2 of 2 activates 2, not 1) and 'APAC' never could (probed 80 percent, 4 of 5). It's a one-row census, but the type lesson is real: floor the float mean and you get 1; scale before you cast and you get the 100 the deck prints.",
  },
  {
    id: "cs-1435",
    tier: "easy",
    topic: "w7",
    universe: "inventory",
    title: "The even-shelf census",
    brief:
      "From: Warehouse ops. Re: the cycle-count plan.\n\nThe counter pairs SKUs whose stock divides evenly, so the plan starts by counting them — with the storage class of stock stamped so nobody re-argues whether the count is float math. Rebuild the census row for the counter.",
    ask: "One query: the count of SKUs whose integer stock divides evenly by two, with stock's typeof stamped.",
    template:
      "SELECT COUNT(*) AS even_shelf FROM products\nWHERE typeof(stock) = {1} AND stock % {2} = 0 HAVING even_shelf = {3};",
    slots: [
      { answer: "'integer'", kind: "keyword", label: "the stock stamp",
        why: "typeof(stock) reads 'integer' on every shelf count — probed alongside the AVG at 177.8125, whose REAL-ness came from AVG, not the column. 'real' would filter every row away and the census would report zero." },
      { answer: "2", noVerify: true, kind: "number", label: "the pairing divisor",
        why: "Pairs split two ways, so evenness is stock % 2 = 0 — probed: 13 of 16 SKUs qualify (the odd three carry 45, 85, 95 units). The divisor never prints in the census row, so the audit checks it by consequence." },
      { answer: "13", kind: "number", label: "the even-SKU count",
        why: "Probed: 13 SKUs have stock divisible by 2 — the counter's starting pool. The assert pins it: if the stamp or divisor changed the pool, the count would move off 13 and the plan would know." },
    ],
    distractors: ["'real'", "'text'", "3", "12"],
    walkthrough:
      "The census is one cell, but it settles two arguments. First, typeof(stock) = 'integer': stock is whole-number storage, so the 177.8125 average the board saw was float dust created by AVG, not by the shelf. Second, stock % 2 = 0: 13 of the 16 SKUs split into even pairs — probed — leaving the three odd holders (45, 85, 95 units) for the manual count. Swap the stamp to 'real' or 'text' and the WHERE empties: the census reports nothing, which is how you know the stamp was load-bearing. Change the divisor to 3 or 12 and the pool shifts off 13 — different cycle-count plans entirely. The assert on 13 keeps the count honest even though the divisor itself never prints.",
  },
  {
    id: "cs-1436",
    tier: "medium",
    topic: "w7",
    universe: "fraud",
    title: "The invoice that adds to zero",
    brief:
      "From: Risk desk. Re: the numeric-field sweep.\n\nA sweep for numeric-looking keys flagged invoice 1: its number adds zero to itself, which no real number does. That's the signature of text wearing a number's coat, and the sweep row must show the stamp, the zero-sum, and the row it came from. Rebuild it.",
    ask: "One query: invoice 1's number with its typeof stamp and the number-plus-zero probe that exposes the coercion.",
    template:
      "SELECT id, number, typeof(number) AS cls, number + {1} AS num\nFROM invoices WHERE id = {2} AND typeof(number) = {3};",
    slots: [
      { answer: "0", kind: "number", label: "the zero-sum probe",
        why: "number + 0 probed on invoice 1 returns 0 — SQLite coerced the whole text key to 0 before adding, the sweep's smoking gun. Adding 1 returns 1, and 10 returns 10: the text never contributed a digit." },
      { answer: "1", kind: "number", label: "the flagged invoice",
        why: "Invoice 1 is the sweep's case study — probed row: INV-2024-001, typeof 'text', probe result 0. The id pin keeps the audit row single; another id either empties the sweep or flags a different key." },
      { answer: "'text'", kind: "keyword", label: "the storage stamp",
        why: "typeof(number) reads 'text' — the invoice key never was a number, which is why adding zero annihilates it. 'integer' would describe a column that doesn't exist here and filters the flagged row out." },
    ],
    distractors: ["2", "10", "integer"],
    walkthrough:
      "The sweep's trick is that arithmetic exposes storage class. INV-2024-001 is TEXT — typeof says so — and when SQLite is asked to add, it coerces the text to a number: leading letters convert to 0, so number + 0 = 0. A numeric column would return its own value; this one vanishes into zero, which is the flag. The probed landing proves the mechanism is the coercion, not the zero: number + 1 = 1 and number + 10 = 10 — the invoice text contributes nothing either way. The typeof filter keeps only genuine text keys in the sweep (pin 'integer' and the row disappears), and the id pin holds the case study. Bare word chips like the stamp's opposite error out — the sweep row needs quotes because typeof returns text.",
  },
  {
    id: "cs-1437",
    tier: "hard",
    topic: "w7",
    universe: "month-close",
    title: "Rung two's floating dust",
    brief:
      "From: Controller. Re: the running-total spot check.\n\nThe close's running revenue walk prints clean two-decimal rungs, but the spot check found the second rung's raw cell carrying float garbage. Finance wants the rung rebuilt with the accumulator, the landing id, and the cleaned figure asserted — plus its storage class. Rebuild the spot check.",
    ask: "One query: the running revenue at order 2, rounded to two decimals, with the rung's typeof stamp.",
    template:
      "WITH w AS (SELECT id, total, {1}(total) OVER (ORDER BY id) AS rung FROM orders)\nSELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls\nFROM w WHERE id = {2} AND clean = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the walk accumulator",
        why: "SUM(total) OVER (ORDER BY id) accumulates — probed rung two: 576.54 + 416.81. AVG freezes the rung at the running mean 496.67, MIN holds the running low 416.81, and COUNT walks a headcount (2), none of which is a revenue walk." },
      { answer: "2", kind: "number", label: "the spot-check rung",
        why: "Rung two is where the dust lives — probed: the raw cell reads 993.3499999999999. Rung three is clean (1760.99), so pinning id 3 hides the bug the spot check exists to catch." },
      { answer: "993.35", kind: "number", label: "the cleaned rung",
        why: "Probed: ROUND(993.3499999999999, 2) = 993.35 — the two-decimal figure the close prints. The assert pins the cleaned value so the walk must run, round, and land exactly there." },
    ],
    distractors: ["AVG", "MIN", "COUNT", "3"],
    walkthrough:
      "The walk is SUM(total) OVER (ORDER BY id): every row carries the revenue to date. Rung one is 576.54, rung two is 576.54 + 416.81 — and the raw cell prints 993.3499999999999, float dust from adding two REALs. The close never shows that: ROUND(rung, 2) = 993.35, the printed figure, and typeof(rung) = 'real' explains why the dust was possible — the walk runs in float storage. The assert pins the cleaned 993.35 at id 2, the one rung where dust shows. Swap the accumulator and the walk changes species: AVG lands 496.67 (a mean, not a sum), MIN sits at the running low 416.81, COUNT counts rows. Pin id 3 instead and you assert 1760.99 — a clean rung that proves nothing about the dust.",
  },
  {
    id: "cs-1438",
    tier: "medium",
    topic: "w7",
    universe: "refund-audit",
    title: "The refund reserve, clipped",
    brief:
      "From: Support lead. Re: the reserve funding request.\n\nThe reserve request books whole dollars against the cancelled pool, so the funding memo must carry the exact pool and the clipped booking on one row — with the status filter provably the cancelled one. The draft lost the cast, the filter and both figures. Rebuild the request row.",
    ask: "One query: the cancelled pool's ticket count, exact sum, and INTEGER booking, pinned to the cancelled status.",
    template:
      "SELECT COUNT(*) AS tickets, SUM(total) AS pool, CAST(SUM(total) AS {1}) AS booked\nFROM orders WHERE status = {2} HAVING pool = {3} AND booked = {4};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the booking cast",
        why: "CAST(SUM(total) AS INTEGER) truncates 1152.49 to 1152 — the funded figure. Probed on this pool: a bogus cast target falls back to numeric affinity and returns 1152.49 (nothing clipped), and TEXT books a string. Only INTEGER clips." },
      { answer: "'cancelled'", kind: "keyword", label: "the reserve filter",
        why: "The reserve funds cancelled tickets — probed: 7 tickets pooling 1152.49. 'shipped' empties the assert (its pool is 11996.72), and the other statuses book different pools entirely." },
      { answer: "1152.49", kind: "number", label: "the exact pool",
        why: "Probed: the cancelled pool sums to 1152.49 — the exposure the memo quotes. The assert keeps it beside the booking so the 49 clipped cents stay visible to whoever signs the request." },
      { answer: "1152", kind: "number", label: "the booked figure",
        why: "Probed: the pool truncates to 1152 — what actually gets funded. Pin 1152.49 in this slot and the assert demands the booking equal the pool, which only a non-clipping cast would produce." },
    ],
    distractors: ["'shipped'", "ROUND", "TEXT", "6"],
    walkthrough:
      "The funding memo needs three numbers and one proof. The numbers: 7 cancelled tickets, pool 1152.49, booking 1152 — the cast's 49 clipped cents are the gap between exposure and funding. The proof: the assert pins both pool and booking, so the row only survives if the cast truly truncates. That's not paranoia — probed, a junk cast target silently falls back to numeric affinity and returns 1152.49, failing the booked = 1152 assert; TEXT books the string '1152.49'. The status filter is the other half of the proof: 'shipped' pools 11996.72 and empties the assert, so the filter can't drift unnoticed. Filter, fold, cast, assert — the same skeleton as the revenue line, pointed at refunds.",
  },
  {
    id: "cs-1439",
    tier: "hard",
    topic: "w7",
    universe: "funnel",
    title: "The basket mean, three ways",
    brief:
      "From: Lifecycle marketing. Re: the basket-size bullet.\n\nThe funnel deck's basket bullet needs one number, but the draft printed three different 'averages' and nobody could say which was which. Rebuild the comparison row: the raw mean, its floor, its two-decimal rounding, and the anchors that prove the row is the full funnel.",
    ask: "One query: the raw average order total, its INTEGER floor, its 2-decimal round, plus the heaviest order and ticket count.",
    template:
      "SELECT AVG(total) AS raw_mean, CAST(AVG(total) AS {1}) AS floored,\n       ROUND(AVG(total), {2}) AS cents, MAX(total) AS heaviest, COUNT(total) AS tickets\nFROM orders HAVING floored = {3} AND heaviest = {4};",
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the floor cast",
        why: "CAST(AVG(total) AS INTEGER) truncates the mean to 338 — the probed floor. TEXT floors nothing ('338.1871844660194' as a string) and REAL returns the raw mean; neither produces the whole-number bullet." },
      { answer: "2", kind: "keyword", label: "the rounding digits",
        why: "Two digits print the deck's cent figure — probed: 338.19. One digit gives 338.2 and zero gives 338; the three renderings only tell the truth apart when the digits flag is 2." },
      { answer: "338", kind: "number", label: "the floored bullet",
        why: "Probed: the 103-order mean is 338.1871844660194, floored to 338 — the assert pins the bullet so the floor can't silently become a round (178-style drift showed up in the stock audit)." },
      { answer: "1088.44", kind: "number", label: "the heaviest anchor",
        why: "Probed: the largest order is 1088.44 across 103 tickets — the anchors prove the mean covers the full funnel, not a filtered slice. Any other heaviest figure empties the assert." },
    ],
    distractors: ["TEXT", "REAL", "1", "0"],
    walkthrough:
      "One mean, three printings, and the anchors that keep it honest. AVG(total) over all 103 orders is 338.1871844660194 — raw float, dust and all. CAST to INTEGER floors it: 338, the whole-dollar bullet. ROUND to 2 digits: 338.19, the cents figure — and the digits flag is the tripwire, since 1 digit prints 338.2 and 0 prints 338, three defensible-looking numbers from one mean. The anchors prove scope: MAX(total) = 1088.44 and COUNT(total) = 103 — the full funnel, no filter. Cast to TEXT and the 'floor' is a string that never equals 338; cast to REAL and nothing truncates, so the floored assert empties. The row exists so the deck can quote 338.19 while everyone can see it came from flooring and rounding the same 338.187.",
  },
  {
    id: "cs-1440",
    tier: "easy",
    topic: "w7",
    universe: "expense",
    title: "The rent pot's printed plate",
    brief:
      "From: Finance partner. Re: the fixed-cost plate.\n\nThe spend report prints every category pot as a two-decimal plate, and rent is the template row: fourteen bills folded to dollars and plated. The draft lost the format string, the category filter and the bill count. Rebuild the plate row.",
    ask: "One query: the rent category's bill count, dollar pot, storage class, and two-decimal PRINTF plate.",
    template:
      "SELECT COUNT(*) AS bills, SUM(amount_cents) / 100.0 AS dollars,\n       typeof(SUM(amount_cents) / 100.0) AS cls, PRINTF({1}, SUM(amount_cents) / 100.0) AS plate\nFROM expenses WHERE category = {2} HAVING bills = {3};",
    slots: [
      { answer: "'%.2f'", kind: "keyword", label: "the plate format",
        why: "PRINTF('%.2f', …) renders the probed plate '16800.00' — two decimals, text. '%.0f' would strip the plate's cents and print '16800', breaking the report's plate convention on its template row." },
      { answer: "'Rent'", kind: "keyword", label: "the fixed-cost filter",
        why: "Rent is the template category — probed: 14 bills folding to 16800 dollars. 'Ads' pools 4570 across its own 14 bills, and 'Travel' has only 3 bills, failing the count assert outright." },
      { answer: "14", kind: "number", label: "the bill count",
        why: "Probed: rent bills 14 monthly charges (120000 cents each in the sampled months) — the assert pins the count so the fold covers every bill, not a subset." },
    ],
    distractors: ["'%.0f'", "'Ads'", "'Travel'"],
    walkthrough:
      "The plate row is the report's type lesson in miniature. SUM(amount_cents) folds 14 rent bills to 1680000 cents; / 100.0 converts to dollars without clipping — 16800, and typeof stamps it 'real' so everyone remembers the division promoted to float. PRINTF('%.2f', …) then renders the report's plate: '16800.00', text with the two decimals the convention demands. The assert pins bills = 14, the fold's completeness check. Aim the filter at 'Ads' and the same query plates 4570.00 — right machinery, wrong row; 'Travel' fails the count assert with 3 bills. Swap the format to '%.0f' and the plate loses its cents, which is exactly the kind of drift the template row exists to catch.",
  },
  {
    id: "cs-1441",
    tier: "hard",
    topic: "w7",
    universe: "growth",
    title: "The year in k-units",
    brief:
      "From: Growth board. Re: the annual revenue bar.\n\nThe board's bar chart prints annual revenue in k-units, and the 2024 bar must survive an audit: ticket count, year key, and the k-figure all asserted, with the scale divisor on record. The draft's divisor drifted once already. Rebuild the audited bar row.",
    ask: "One query: the 2024 cohort's ticket count and k-unit revenue, keyed by the cast year slice.",
    template:
      "SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets,\n       CAST(SUM(total) / {1} AS INTEGER) AS k_usd\nFROM orders GROUP BY yr HAVING COUNT(*) = {2} AND yr = {3};",
    slots: [
      { answer: "1000", noVerify: true, kind: "number", label: "the k-unit scale",
        why: "k-units means thousands — probed: 30773.25 / 1000 casts to 30, the 2024 bar. The divisor drifted once to 100 (printing 307) and to 10000 (printing 3); it never prints itself, so the audit checks it by consequence." },
      { answer: "90", kind: "number", label: "the 2024 ticket count",
        why: "Probed: 2024 holds 90 of the 103 orders — the assert pins the cohort size so the bar can't be rebuilt on a filtered slice. 13 is the 2025 tail's count and pairs with no 2024 row." },
      { answer: "2024", kind: "number", label: "the bar's year key",
        why: "The cast slice makes yr a true integer — probed groups: 2024 (90 orders) and 2025 (13). Pinning 2025 grabs the tail bar, whose k-figure is 4, not 30." },
    ],
    distractors: ["100", "10000", "13", "2025"],
    walkthrough:
      "The bar row is three audited facts: the year key is a real integer (CAST of the 4-character slice — probed groups 2024 | 90 and 2025 | 13), the cohort size is 90, and the k-figure is CAST(SUM(total) / 1000 AS INTEGER) = 30 off the 30773.25 pot. The divisor is the interesting slot: it never appears in the output, only in the outcome — probed, / 100 prints 307 (hundreds, not k), / 10000 prints 3 (ten-k), and only / 1000 prints 30. That's why it's noVerify'd: the audit checks the consequence, not the cell. The assert pairs yr = 2024 with tickets = 90, so pinning the 2025 tail (13 tickets, k-figure 4) empties the row instead of quietly re-keying the bar.",
  },
  {
    id: "cs-1442",
    tier: "hard",
    topic: "w7",
    universe: "supplier",
    title: "The price decade's weight",
    brief:
      "From: Procurement. Re: the bin-weight check.\n\nSlotting assigns SKUs to price decades by truncating price divided by ten, and the warehouse wants the third decade's bin verified: SKU count and total unit weight. The draft lost the truncating divisor and both bin figures. Rebuild the bin row.",
    ask: "One query: the price-decade bin holding exactly three SKUs and 670 stock units, with SKU count and unit weight pinned.",
    template:
      "SELECT CAST(price / {1} AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units\nFROM products GROUP BY band HAVING skus = {2} AND units = {3};",
    slots: [
      { answer: "10", noVerify: true, kind: "number", label: "the decade divisor",
        why: "Decades come from price / 10 — probed: the divisor builds 12 bands across the catalog. Drift it to 1 and every price is its own band; to 2 and the decades halve. The divisor never prints, so the audit checks its consequence." },
      { answer: "3", kind: "number", label: "the bin's SKU count",
        why: "Probed: band 3 holds exactly 3 SKUs — the 32-dollar mat, the 34.50 mouse and the 39.99 ring light (their prices truncate to 3). One or two SKUs describe a different bin." },
      { answer: "670", kind: "number", label: "the bin's unit weight",
        why: "Probed: those three SKUs' stock sums to 670 units — the weight the slotting check verifies. The assert pairs it with skus = 3 so the bin is pinned from both sides." },
    ],
    distractors: ["1", "2", "5"],
    walkthrough:
      "Binning by decade is CAST(price / 10 AS INTEGER): real division by ten, then truncation — 32 → 3, 34.5 → 3, 39.99 → 3, so band 3 collects the low-thirties shelf. The probed bin: 3 SKUs, 670 stock units, pinned from both sides by the HAVING. The divisor is the audit's real subject: at 10 the bands are decades (probed 12 of them); at 1 every price is its own band and no band holds 3 SKUs with 670 units; at 2 the decades halve and the trio splits across bands. At 5 the three band-3 SKUs scatter into 6s and a 7. The assert can't be gamed by nudging the divisor — units 670 and skus 3 only co-occur in the true decade bin, which is what makes the weight check trustworthy.",
  },
];
