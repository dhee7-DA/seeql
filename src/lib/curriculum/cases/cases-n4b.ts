// Case batch N4B — thin-spot patch: FIRST_VALUE & LAST_VALUE (lesson 61,
// topic n4 "Frames & running math"), cs-2013…cs-2022. Hand-authored
// read-only rebuilds in the p1/p2 style — every template is a single
// SELECT (no subqueries: the n-topic harness rule), WINDOW clauses sit
// after WHERE (SQLite grammar), DISTINCT queries sort only by result
// columns. Figures anchored live: customer 1 = 24 orders, first 152.52 /
// last 125.88; customer 2 = 752.96 → 99.48; month openers 2024-01 =
// 752.96, closers 2024-12 = 160.30; product prices 14.99–199.99, Audio
// shelf = 3 products; 16 customers all carry a first-order flag; January
// 2024 = 8 orders.
import type { CaseStudy } from "./types";

export const casesN4B: CaseStudy[] = [
  {
    id: "cs-2013",
    tier: "easy",
    topic: "n4",
    universe: "month-close",
    title: "The running opener",
    brief:
      "From: Month-end close. Re: customer 1's ledger.\n\nThe close review wants customer 1's orders in timeline order with the account's opening order value echoed on every row — the analyst's \"where did this customer start\" stamp. FIRST_VALUE does it without a self-join. Rebuild the ledger: id, the account, total, and first_total stamped per row.",
    ask: "Customer 1's orders with FIRST_VALUE(total) stamped on every row, timeline order.",
    template: `SELECT id, customer_id, ROUND(total, 2) AS total,
  ROUND({1}(total) OVER (PARTITION BY {2} ORDER BY created_at, id), 2) AS first_total
FROM orders
WHERE customer_id = {3}
ORDER BY created_at, id;`,
    slots: [
      {
        answer: "FIRST_VALUE",
        kind: "keyword",
        label: "the opener function",
        why: "FIRST_VALUE reads the frame START — and the default frame starts at the partition's beginning, so it's safe without any frame spelling. LAST_VALUE would echo the CURRENT row (the default frame ends there), MAX would run a running maximum — different columns entirely.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the partition wall",
        why: "Partitions must restart per customer — customer_id builds those walls. Partitioning by id would make every row its own partition (the opener echoes itself); by status would slice the account by order state instead of by account.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the account filter",
        why: "Customer 1's ledger — 24 orders from 152.52 down the timeline. The audit checks the figure against the result cells: customer_id 1 sits on every row.",
      },
    ],
    distractors: ["LAST_VALUE", "MAX", "id", "status"],
    walkthrough:
      "SELECT id, customer_id, ROUND(total,2), ROUND(FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id), 2) FROM orders WHERE customer_id = 1 ORDER BY created_at, id — twenty-four rows, each stamped 152.52, the account's opening order (id 7, 2024-01-02). FIRST_VALUE is the safe twin: the default frame's start IS the partition start, so no frame clause is needed. LAST_VALUE would need ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING — or it lies. One function call, zero joins, and the ledger reads like the close wants it.",
  },
  {
    id: "cs-2014",
    tier: "medium",
    topic: "n4",
    universe: "growth",
    title: "The honest end",
    brief:
      "From: Growth board. Re: the customer-2 spot check.\n\nTwo orders tell the whole arc: 752.96 in January, 99.48 in March. The board wants BOTH bookends stamped on every row — the opener AND the true closer. LAST_VALUE will lie unless you extend its frame; this rebuild spells the honest version. Rebuild it: id, total, and last_total that actually reads 99.48 on both rows.",
    ask: "Customer 2's two orders with FIRST_VALUE and a full-frame LAST_VALUE bookending every row.",
    template: `SELECT id, ROUND(total, 2) AS total,
  ROUND({1}(total) OVER (PARTITION BY customer_id ORDER BY created_at, id
    {2}), 2) AS true_last
FROM {3}
WHERE customer_id = 2
ORDER BY created_at, id;`,
    slots: [
      {
        answer: "LAST_VALUE",
        kind: "keyword",
        label: "the closer function",
        why: "The closer is LAST_VALUE — with the full frame below it reads the partition's END (99.48). FIRST_VALUE would print 752.96 in both columns; MAX would print the running maximum.",
      },
      {
        answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        kind: "keyword",
        label: "the full frame",
        why: "The default frame ENDS at the current row — that's the lie. Extending the end bound to UNBOUNDED FOLLOWING lets LAST_VALUE see the whole partition, so both rows read the true closer. Any shorter frame keeps the lie (or invents a windowed one).",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "The ledger lives in orders — total, created_at, customer_id are its columns. products and customers lack the ordering spine (created_at) and the measure (total): the query dies on 'no such column'.",
      },
    ],
    distractors: [
      "FIRST_VALUE",
      "MAX",
      "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
      "products",
    ],
    walkthrough:
      "SELECT id, ROUND(total,2), ROUND(LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) FROM orders WHERE customer_id = 2 ORDER BY created_at, id — two rows: (6, 752.96, 99.48) and (23, 99.48, 99.48). The frame clause is the whole lesson: default frames end at the current row, so LAST_VALUE without the extension reports the row you're ON. Spell the full frame and the closer becomes honest — 99.48 stamped on both rows, the March order that ended customer 2's story.",
  },
  {
    id: "cs-2015",
    tier: "easy",
    topic: "n4",
    universe: "refund-audit",
    title: "The lying default",
    brief:
      "From: Refund audit. Re: suspicious column flagged.\n\nA teammate's report stamps \"last order value\" on customer 1's 24 rows — but every row shows its OWN total in the stamp. That's the default-frame lie, and the audit needs it demonstrated, not fixed: rebuild the suspicious column exactly as the lie produces it, so the walkthrough can show why it happens.",
    ask: "Customer-partitioned LAST_VALUE over orders with the DEFAULT frame — the version whose output equals each row's own total.",
    template: `SELECT id, customer_id, ROUND(total, 2) AS total,
  ROUND(LAST_VALUE({1}) OVER (PARTITION BY customer_id ORDER BY created_at, id), 2) AS suspicious
FROM orders
WHERE {2} = {3}
ORDER BY id;`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the measured column",
        why: "The report claims LAST ORDER VALUE, so LAST_VALUE measures total — and under the default frame it reads back each row's own total, which is exactly the lie. Measuring id or created_at would stamp different-looking (but equally useless) values.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the filtered column",
        why: "The sweep targets customer 1: WHERE customer_id = 1. Filtering by status or id changes (or empties) the row set the audit compares — the account sweep is the report's whole premise.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the account number",
        why: "Customer 1 — 24 orders of lie-stamped history. The figure appears in the customer_id cells the audit scans; any other account changes the rows.",
      },
    ],
    distractors: ["id", "created_at", "status", "2", "99"],
    walkthrough:
      "SELECT id, customer_id, ROUND(total,2), ROUND(LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id), 2) FROM orders WHERE customer_id = 1 ORDER BY id — run it and the suspicious column equals total on EVERY row: the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so LAST_VALUE reads the row you're standing on. Customer 1's ledger proves the pattern row after row — every stamp is the row's own value, never the account's true closer (125.88). The fix is one phrase — ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING — but the audit wanted the disease documented: this is exactly the bug the lesson-61 trap diagram warns about.",
  },
  {
    id: "cs-2016",
    tier: "medium",
    topic: "n4",
    universe: "funnel",
    title: "The month openers",
    brief:
      "From: Marketing funnel. Re: first-order value by month.\n\nFourteen months of storefront history, and the funnel deck wants one line per month: the FIRST order value that opened it. No GROUP BY collapse, no self-join — a month partition and FIRST_VALUE, collapsed to distinct pairs. Rebuild it: month key from created_at, the opening total, sorted by month.",
    ask: "One row per month: SUBSTR month key and the FIRST_VALUE total that opened it.",
    template: `SELECT DISTINCT SUBSTR({1}, 1, 7) AS m,
  ROUND({2}(total) OVER (PARTITION BY SUBSTR(created_at, 1, 7) ORDER BY created_at, id), 2) AS month_open
FROM {3}
ORDER BY m;`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "the month source",
        why: "The month key is SUBSTR(created_at, 1, 7) — 'YYYY-MM' off the order timestamp. shipped_at is riddled with NULLs (pending orders) and would invent a NULL month; SUBSTR on status slices order states, not months.",
      },
      {
        answer: "FIRST_VALUE",
        kind: "keyword",
        label: "the opener function",
        why: "Month openers are FIRST_VALUE: the frame start within each month partition. LAST_VALUE under the default frame reads the current row — DISTINCT would keep nearly every row instead of collapsing to 14 openers.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "created_at and total are orders columns — products and customers lack both, and the query fails before the window even runs.",
      },
    ],
    distractors: ["shipped_at", "status", "LAST_VALUE", "MAX", "products", "customers"],
    walkthrough:
      "SELECT DISTINCT SUBSTR(created_at,1,7), ROUND(FIRST_VALUE(total) OVER (PARTITION BY SUBSTR(created_at,1,7) ORDER BY created_at, id), 2) FROM orders ORDER BY m — fourteen rows, one per month, from 2024-01's 752.96 onward. The window computes BEFORE DISTINCT: every order row carries its month's opener, then the distinct pair-collapse keeps one line per month (same-timestamp ties share an opener, so some months collapse extra rows — the ordering spine created_at, id is what keeps it reproducible). The funnel deck gets its opening line without a single correlated subquery.",
  },
  {
    id: "cs-2017",
    tier: "medium",
    topic: "n4",
    universe: "supplier",
    title: "Bookends on a named window",
    brief:
      "From: Supplier audit. Re: reusable window specs.\n\nThe audit team writes the same window five times a day, so this one is spelled ONCE in a WINDOW clause and reused by both bookend functions. Customer 2 — the two-order account — is the demo: 752.96 open, 99.48 close, both stamped per row. Rebuild it with the named-window shape.",
    ask: "Customer 2's orders with FIRST_VALUE and LAST_VALUE sharing one WINDOW definition, full frame on the closer.",
    template: `SELECT id, customer_id,
  ROUND(FIRST_VALUE(total) OVER w, 2) AS first_total,
  ROUND({1}(total) OVER w, 2) AS last_total
FROM orders
WHERE customer_id = {2}
WINDOW {3} AS (PARTITION BY customer_id ORDER BY created_at, id
  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
ORDER BY id;`,
    slots: [
      {
        answer: "LAST_VALUE",
        kind: "keyword",
        label: "the closer function",
        why: "The shared window ends at UNBOUNDED FOLLOWING, so LAST_VALUE reads the partition's true end — 99.48 on both rows. FIRST_VALUE would duplicate the opener into the closer column; MAX would print the partition maximum (752.96 — this customer's own open).",
      },
      {
        answer: "2",
        kind: "number",
        label: "the demo account",
        why: "Customer 2 — the two-order arc the audit demos with. The figure appears in the customer_id cells the audit scans; any other customer changes the row set the audit compares.",
      },
      {
        answer: "w",
        kind: "keyword",
        label: "the window name",
        why: "The WINDOW clause defines w and both OVERs reference it — the single-definition habit. Renaming the definition (w2) leaves the OVER w references pointing at a window that doesn't exist: 'no such window: w'.",
      },
    ],
    distractors: ["FIRST_VALUE", "MAX", "AVG", "w2", "1", "3"],
    walkthrough:
      "SELECT id, customer_id, ROUND(FIRST_VALUE(total) OVER w, 2), ROUND(LAST_VALUE(total) OVER w, 2) FROM orders WHERE customer_id = 2 WINDOW w AS (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) ORDER BY id — two rows: (6, 2, 752.96, 99.48) and (23, 2, 99.48, 99.48). The WINDOW clause is the DRY move: one spec, two functions, zero drift between them (and it sits after WHERE in the grammar — clause order is part of the contract). Named windows shine exactly here — bookend pairs, running-and-total pairs, any spec you'd otherwise copy-paste and eventually update in one place but not the other.",
  },
  {
    id: "cs-2018",
    tier: "easy",
    topic: "n4",
    universe: "catalog",
    title: "The price bookends",
    brief:
      "From: Catalog review. Re: the Audio shelf.\n\nThe category review stamps each Audio product with its shelf's floor and ceiling prices — bookends computed inside the category, not across the catalog. The floor is safe by default; the ceiling needs the full frame. Rebuild the shelf view: id, name, price, floor_price, ceiling_price.",
    ask: "Audio products stamped with the category's FIRST_VALUE floor and full-frame LAST_VALUE ceiling.",
    template: `SELECT id, name, ROUND(price, 2) AS price,
  ROUND(FIRST_VALUE(price) OVER (ORDER BY price, id), 2) AS floor_price,
  ROUND(LAST_VALUE(price) OVER (ORDER BY price, id {1}), 2) AS ceiling_price
FROM {2}
WHERE category = {3}
ORDER BY price, id;`,
    slots: [
      {
        answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        kind: "keyword",
        label: "the ceiling's frame",
        why: "Without the extension the default frame ends at the current row — ceiling_price would echo the row's own price and the column lies. The full frame lets LAST_VALUE see the whole shelf, which is what a ceiling means.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the shelf's table",
        why: "price, name, category live on products. orders has no price column at all; suppliers lack price and category — the engine stops the query on 'no such column'.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the category filter",
        why: "The brief scopes to the Audio shelf — three products stamped with their shared floor and ceiling. 'Video' or 'Fitness' rebuild a different shelf; an unknown category returns an empty set the audit flags.",
      },
    ],
    distractors: [
      "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
      "orders",
      "suppliers",
      "'Video'",
      "'Fitness'",
    ],
    walkthrough:
      "SELECT id, name, ROUND(price,2), ROUND(FIRST_VALUE(price) OVER (ORDER BY price, id), 2), ROUND(LAST_VALUE(price) OVER (ORDER BY price, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) FROM products WHERE category = 'Audio' ORDER BY price, id — three rows, each stamped with the same two numbers: the shelf floor (the cheapest Audio item) and the shelf ceiling (its priciest). FIRST_VALUE needed no frame — the default start IS the partition start. LAST_VALUE needed the full frame — the default end is the current row. Same query, one asymmetry, and that asymmetry is the lesson's whole trap in one rebuild.",
  },
  {
    id: "cs-2019",
    tier: "medium",
    topic: "n4",
    universe: "growth",
    title: "The month closers",
    brief:
      "From: Growth board. Re: the other bookend.\n\nThe funnel deck had the openers (cs-2016); the board wants the CLOSERS — each month's last order value, one line per month. December 2024 closes at 160.30; every month closes somewhere. Same shape as the openers, mirrored function, honest frame. Rebuild it.",
    ask: "One row per month: the month key and the full-frame LAST_VALUE that closed it.",
    template: `SELECT DISTINCT SUBSTR(created_at, 1, 7) AS m,
  ROUND(LAST_VALUE({1}) OVER (PARTITION BY SUBSTR(created_at, 1, 7)
    ORDER BY created_at, id {2}), 2) AS month_close
FROM orders
ORDER BY {3};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the measured column",
        why: "The closer stamps order VALUE: LAST_VALUE(total). id or customer_id would close each month with a number that means nothing in money terms — different values, different deck.",
      },
      {
        answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        kind: "keyword",
        label: "the full frame",
        why: "Closers need the frame to END at the partition's end — any frame ending at CURRENT ROW makes LAST_VALUE read the row you're on, and the DISTINCT collapse turns one-line-per-month into many. The full frame is the honest spelling.",
      },
      {
        answer: "m",
        kind: "keyword",
        label: "the deck's sort",
        why: "ORDER BY m walks the months chronologically — the alias from SUBSTR(created_at, 1, 7). Sorting by a column outside the DISTINCT result errors out or scrambles the timeline the board reads.",
      },
    ],
    distractors: [
      "customer_id",
      "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING",
      "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
    ],
    walkthrough:
      "SELECT DISTINCT SUBSTR(created_at,1,7), ROUND(LAST_VALUE(total) OVER (PARTITION BY SUBSTR(created_at,1,7) ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) FROM orders ORDER BY m — fourteen month lines, closing values from January's opener-month close to December's 160.30. Mirror of the openers case, one dial turned: LAST_VALUE only tells the truth when the frame ends at UNBOUNDED FOLLOWING. Same-timestamp ties collapse the same way — the created_at, id spine keeps the closer reproducible when two orders share a final day.",
  },
  {
    id: "cs-2020",
    tier: "easy",
    topic: "n4",
    universe: "month-close",
    title: "The opener's shadow",
    brief:
      "From: Month-end close. Re: January's drift report.\n\nThe close team reads January as drift-from-open: every order's total minus the value that opened the month (752.96, order 6). The first order drifts by zero by definition; everything after earns its offset. FIRST_VALUE plus arithmetic — rebuild January's drift report.",
    ask: "January orders with vs_open = total minus the month-partitioned FIRST_VALUE, id order.",
    template: `SELECT id,
  ROUND(total - {1}(total) OVER (PARTITION BY SUBSTR(created_at, 1, 7)
    ORDER BY {2}, id), 2) AS vs_open
FROM orders
WHERE created_at LIKE {3}
ORDER BY id;`,
    slots: [
      {
        answer: "FIRST_VALUE",
        kind: "keyword",
        label: "the anchor function",
        why: "Drift-from-open anchors on FIRST_VALUE — the month's first total, safe under the default frame. LAST_VALUE under the default frame reads the current row (every drift would be 0.00); MAX anchors on the running maximum, a different report.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the timeline order",
        why: "The anchor is the FIRST order in TIME: ORDER BY created_at, id inside the window. Ordering by id alone rewrites 'first' as lowest-id (ids aren't chronological here); by status anchors on an arbitrary row — the drift numbers all move.",
      },
      {
        answer: "'2024-01%'",
        kind: "keyword",
        label: "the month filter",
        why: "January 2024 is a prefix pattern: created_at LIKE '2024-01%' — eight orders, opener included. '%2024%' sweeps the whole year; '2024-12%' rebuilds December; a spelled-wrong month matches nothing.",
      },
    ],
    distractors: ["LAST_VALUE", "MAX", "id", "status", "'2024-12%'", "'%2024%'"],
    walkthrough:
      "SELECT id, ROUND(total - FIRST_VALUE(total) OVER (PARTITION BY SUBSTR(created_at,1,7) ORDER BY created_at, id), 2) FROM orders WHERE created_at LIKE '2024-01%' ORDER BY id — eight rows; order 6 opens the month at drift 0.00 (752.96 minus itself), and the remaining seven carry their offset from that anchor. Windows compose with arithmetic directly: subtract the window call from the column, no CTE, no self-join. The same shape powers quarter-to-date drifts and year-open deltas — anchor function, timeline order, month filter.",
  },
  {
    id: "cs-2021",
    tier: "medium",
    topic: "n4",
    universe: "funnel",
    title: "The first-order flag",
    brief:
      "From: Funnel analytics. Re: acquisition audit.\n\nThe acquisition audit marks each order 'first' or 'later' — a customer's opening order starts their story, everything else continues it. All sixteen customers have at least one 'first' row. CASE + FIRST_VALUE does the flagging in one pass. Rebuild the flagged ledger, flagged rows on top.",
    ask: "Every order flagged first/later by comparing total to the customer-partitioned FIRST_VALUE, flags leading.",
    template: `SELECT id, customer_id, total,
  CASE WHEN {1} = {2}(total) OVER (PARTITION BY {3} ORDER BY created_at, id)
       THEN 'first' ELSE 'later' END AS flag
FROM orders
ORDER BY flag, id;`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the compared column",
        why: "The flag compares the row's total against the partition's opening total — total = FIRST_VALUE(total) … Comparing id or created_at against a money value can never be true: every row would flag 'later' and the audit loses its sixteen acquisitions.",
      },
      {
        answer: "FIRST_VALUE",
        kind: "keyword",
        label: "the opener function",
        why: "The opening order's value is FIRST_VALUE(total) under the default frame — the partition start. LAST_VALUE (default frame) reads the current row and flags EVERYTHING first; MIN reads the running minimum, which drifts below the opener as cheaper orders arrive.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the partition wall",
        why: "'First order' is per CUSTOMER: PARTITION BY customer_id. Partitioning by status flags each status's first row (four flags); by id flags every row; by created_at flags first-of-timestamp — none of these is the acquisition audit.",
      },
    ],
    distractors: ["id", "created_at", "LAST_VALUE", "MIN", "MAX", "status"],
    walkthrough:
      "SELECT id, customer_id, total, CASE WHEN total = FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) THEN 'first' ELSE 'later' END FROM orders ORDER BY flag, id — the sixteen 'first' rows lead (one per customer, all sixteen accounts active), the 87 later rows follow. The CASE evaluates after the window: one pass, no self-join, no correlated probe. Comparison direction matters too — the row's total against the anchor, never the reverse reading. This flag is the seed of cohort analyses: first-purchase value, first-purchase month, repeat-rate denominators.",
  },
  {
    id: "cs-2022",
    tier: "hard",
    topic: "n4",
    universe: "growth",
    title: "The bookend board",
    brief:
      "From: Growth board. Re: the one-row-per-account rollup.\n\nThe board's account card wants both bookends on one row — customer 1's card reads open 152.52, close 125.88, from 24 orders. The team standardizes on a named WINDOW with the full frame so neither function can drift. Rebuild the card: both functions over the shared window, one row out.",
    ask: "Customer 1's bookend card: FIRST_VALUE open and full-frame LAST_VALUE close over a shared named window, one row.",
    template: `SELECT customer_id,
  ROUND({1}(total) OVER w, 2) AS first_total,
  ROUND(LAST_VALUE(total) OVER w, 2) AS last_total
FROM orders
WHERE customer_id = 1
WINDOW w AS (PARTITION BY {2} ORDER BY created_at, id
  ROWS BETWEEN {3} AND UNBOUNDED FOLLOWING)
ORDER BY id
LIMIT 1;`,
    slots: [
      {
        answer: "FIRST_VALUE",
        kind: "keyword",
        label: "the open function",
        why: "The card's opener is FIRST_VALUE: 152.52, the account's first order. LAST_VALUE would echo the closer into the open column; MAX/MIN would print the account's extreme order, not its opening one.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the partition wall",
        why: "One account, one partition: PARTITION BY customer_id. Partitions of id reduce every row to itself — open and close would both read the row's own total; status partitions cross account lines.",
      },
      {
        answer: "UNBOUNDED PRECEDING",
        kind: "keyword",
        label: "the frame's start bound",
        why: "The full frame starts at UNBOUNDED PRECEDING — the whole partition, so LAST_VALUE's end (UNBOUNDED FOLLOWING, spelled in the template) sees the true closer. CURRENT ROW collapses the frame to one row and the card reads its own totals.",
      },
    ],
    distractors: ["LAST_VALUE", "MAX", "MIN", "id", "status", "CURRENT ROW"],
    walkthrough:
      "SELECT customer_id, ROUND(FIRST_VALUE(total) OVER w, 2), ROUND(LAST_VALUE(total) OVER w, 2) FROM orders WHERE customer_id = 1 WINDOW w AS (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) ORDER BY id LIMIT 1 — one row: (1, 152.52, 125.88). Twenty-four orders opened at 152.52 and closed at 125.88; the full frame makes both functions partition-wide, so LIMIT 1 is safe (every row carries the same bookends) — and the WINDOW clause sits where the grammar puts it, after WHERE. This is the pattern behind account cards, cohort boards, and any one-row summary that must show both ends of a story — one window, two readers, zero drift.",
  },
];
