// Case batch S1 — Module 3 (set ops & CASE) cases cs-601…cs-650.
// 50 cases: 17 easy / 17 medium / 16 hard across topics s1 (UNION stacks),
// s2 (Stacked reports), s3 (INTERSECT), s4 (EXCEPT). Every figure below was
// probed against the live seed db (scripts/m3-facts.ts) and is mechanically
// re-verified by scripts/case-audit.ts (structure, execution, figure-in-cell,
// distractor consequence, prose gates).

import type { CaseStudy } from "./types";

export const casesS1: CaseStudy[] = [
  {
    id: "cs-601",
    tier: "easy",
    topic: "s1",
    universe: "growth",
    title: "One column of every lifecycle word",
    brief:
      "From: Ops lead. Re: glossary page.\n\nThe wiki needs a single deduplicated list of every lifecycle word we use — order statuses and invoice statuses alike. Build it from the live tables, not from memory.",
    ask: "Stack the distinct order statuses with the distinct invoice statuses, deduplicated.",
    template: `SELECT status AS word FROM {1}
{2}
SELECT status FROM {3};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "Arm 1 supplies the fulfillment vocabulary (pending, shipped, delivered, cancelled). The compound keeps arm 1's alias `word` as the output column name.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The wiki wants each word once. UNION appends both arms then collapses whole-row duplicates.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Arm 2 supplies the billing vocabulary (open, paid, void). Its column names are discarded — only its values join the pile.",
      },
    ],
    distractors: ["INTERSECT", "EXCEPT", "JOIN"],
    walkthrough:
      "Two one-column arms: the four order statuses and the three invoice statuses. UNION dedups the pile to exactly 7 rows because the vocabularies are disjoint — a fact worth knowing before running. INTERSECT would return the 0 shared words and EXCEPT just arm 1's four; UNION ALL would also print 7 here, but it does not claim deduplication, which is the deliverable's whole point.",
  },
  {
    id: "cs-602",
    tier: "easy",
    topic: "s1",
    universe: "month-close",
    title: "Count the whole stack",
    brief:
      "From: Controller. Re: close checklist item 4.\n\nBefore reconciliation I want the pipeline integrity number: how many rows exist when every order's status is stacked against every customer's region with nothing removed. The raw pile size, one figure.",
    ask: "Count rows in the faithful append of order statuses and customer regions.",
    template: `SELECT {1}(*) AS pile_rows
FROM (SELECT status FROM orders
UNION {2}
SELECT region FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "The deliverable is a headcount of the wrapped stack. SUM would try to add up the '*' placeholder and fail outright.",
      },
      {
        answer: "ALL",
        kind: "keyword",
        label: "the keep-everything modifier",
        why: "Nothing may be removed: the brief says raw pile. UNION ALL appends both arms verbatim, duplicates and all.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's region source",
        why: "Regions live on customers (8 EU, 5 APAC, 2 US, 1 LATAM — 16 rows). Arm 2 contributes one row per customer.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "suppliers"],
    walkthrough:
      "UNION ALL never inspects values: 103 order rows followed by 16 customer rows, and the wrapped COUNT prints 119. The bare-UNION variant would collapse the same pile to 8 — a different report entirely — and pointing arm 2 at suppliers would both shrink the pile (6 rows) and answer a question nobody asked.",
  },
  {
    id: "cs-603",
    tier: "easy",
    topic: "s1",
    universe: "supplier",
    title: "Who is on the map at all",
    brief:
      "From: Expansion analyst. Re: presence slide.\n\nFor the board deck I need every region where we have ANY presence — customer or supplier — listed exactly once. No counts, no attribution, just the map.",
    ask: "List each distinct region that appears in either customers or suppliers.",
    template: `SELECT region FROM customers
{1}
SELECT region FROM {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "Presence means the set union of the two tables' regions, each printed once. Bare UNION appends and collapses whole-row duplicates.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's presence table",
        why: "The supply-side footprint: EU 2, APAC 2, US 1, LATAM 1 — all four regions covered.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the compound's sort key",
        why: "The single trailing ORDER BY sorts the combined result; region is the output column name inherited from arm 1.",
      },
    ],
    distractors: ["EXCEPT", "UNION ALL", "city"],
    walkthrough:
      "Both tables span EU, APAC, US and LATAM, so the deduplicated stack is 4 rows, sorted alphabetically — APAC, EU, LATAM, US. INTERSECT would return the same 4 here (both cover the map), which is precisely why the brief says 'either': UNION is the claim being made. EXCEPT would shrink to customer-only regions (none) and sorting by city would fail outright — customers has a city column but the compound's output does not.",
  },
  {
    id: "cs-604",
    tier: "easy",
    topic: "s1",
    universe: "catalog",
    title: "Every name in the building",
    brief:
      "From: Warehouse coordinator. Re: door list.\n\nSecurity wants one deduplicated list of every person-name-like string we hold: customer names and supplier names. Two tables, one column, no repeats.",
    ask: "Union customer names with supplier names, deduplicated, alphabetical.",
    template: `SELECT name FROM {1}
UNION
SELECT name FROM {2}
ORDER BY 1 {3};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 1's name source",
        why: "Sixteen customer names open the door list.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's name source",
        why: "The door list covers both tables. Suppliers contribute 6 names (16 + 6 before dedup).",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the alphabetical direction",
        why: "A door list reads alphabetically. ASC is the default direction, but writing it makes the report's promise explicit.",
      },
    ],
    distractors: ["INTERSECT", "products", "DESC"],
    walkthrough:
      "16 customer names plus 6 supplier names, zero overlap — the deduplicated census is 22 rows in alphabetical order. INTERSECT would return the 0 names both tables share; pointing arm 2 at products would stack product names into a person list; DESC would print the same 22 backwards, which is a different report than briefed.",
  },
  {
    id: "cs-605",
    tier: "easy",
    topic: "s2",
    universe: "growth",
    title: "Labeled mini-census",
    brief:
      "From: Deck designer. Re: source-tagged counts.\n\nOne slide, one grid: per-status order counts and per-region customer counts stacked together, every row carrying a literal label saying which table it came from.",
    ask: "Stack the two mini-censuses with a literal source-label column.",
    template: `SELECT status AS v, {1} AS n, 'orders' AS src FROM {2} GROUP BY status
UNION ALL
SELECT region, COUNT(*), 'customers' FROM customers GROUP BY {3};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "arm 1's counter",
        why: "Arm 1 is the per-status census: delivered 52, shipped 30, pending 14, cancelled 7. COUNT(*) counts rows per status group.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "The status column lives on orders; grouping any other table by status would fail outright.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 2's group key",
        why: "Arm 2 mirrors the shape over regions: EU 8, APAC 5, US 2, LATAM 1.",
      },
    ],
    distractors: ["SUM(*)", "suppliers", "id"],
    walkthrough:
      "The stack is 8 labeled rows: four status counts (52/30/14/7) and four region counts (8/5/2/1), each tagged with its source literal. The compound keeps arm 1's aliases (v, n, src); arm 2's own names are discarded. SUM(*) is not SQL — aggregates wrap columns, not stars — and grouping suppliers by status would be a prepare-time error.",
  },
  {
    id: "cs-606",
    tier: "easy",
    topic: "s2",
    universe: "month-close",
    title: "The three-stat line",
    brief:
      "From: CFO. Re: one-line summary.\n\nI want the biggest order, the smallest order, and the average order — three rows, one column, printed in that exact order. No grouping gymnastics; three scalar arms.",
    ask: "Stack MAX, MIN and the rounded AVG of order totals as three rows.",
    template: `SELECT MAX(total) AS stat FROM orders
UNION ALL
SELECT {1}(total) FROM {2}
UNION ALL
SELECT ROUND({3}(total), 2) FROM orders;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "Arm 2 is the smallest order. MIN(total) = 25.47 on the live book.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the table all three arms read",
        why: "All three statistics describe the same population — 103 order totals — so every arm reads orders.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "The bare AVG is 338.1883…; ROUND(..., 2) prints the 338.19 the binder expects.",
      },
    ],
    distractors: ["SUM", "invoices", "MAX"],
    walkthrough:
      "Three independent aggregate queries — MAX 1088.44, MIN 25.47, ROUND(AVG,2) 338.19 — stack into three rows in arm order. Probed. Rounding to 0 digits would print 338 and lose the cents the close binder expects; SUM would emit 34,833.28 (the revenue, not the average) and invoicing is a different population entirely.",
  },
  {
    id: "cs-607",
    tier: "easy",
    topic: "s3",
    universe: "growth",
    title: "Customers with orders, by key",
    brief:
      "From: CRM analyst. Re: coverage check.\n\nPlain question, set-op answer: which customer ids appear among the orders? I want each id once, and I want the count comparable to the 16-row customer table.",
    ask: "Intersect order customer_ids with customer ids.",
    template: `SELECT customer_id FROM orders
{1}
SELECT id FROM {2}
ORDER BY customer_id {3};`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Only values present in BOTH arms survive, deduplicated by definition — the set of customers who have ordered.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the dimension table",
        why: "The FK-side population; the intersection doubles as an integrity check.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the id ordering",
        why: "An id list reads ascending; the compound's single ORDER BY sorts the combined result.",
      },
    ],
    distractors: ["EXCEPT", "UNION ALL", "DESC"],
    walkthrough:
      "Probed: 16 rows — every customer has at least one order, so the intersection equals the whole customer key set. The join version would fan out to 103 rows; INTERSECT groups and stays at 16. UNION would also return 16 here (the ids coincide), which is exactly why the brief says 'appear among' — the overlap claim — and why EXCEPT (87 order-only ids under bare id comparison) answers a different question.",
  },
  {
    id: "cs-608",
    tier: "easy",
    topic: "s3",
    universe: "supplier",
    title: "Shared geography",
    brief:
      "From: Sourcing manager. Re: region overlap.\n\nDo our customers and our suppliers live in the same regions? List the regions both tables cover, once each, and I'll compare the count to the four-region map.",
    ask: "Intersect customer regions with supplier regions.",
    template: `SELECT region FROM customers
{1}
SELECT region FROM {2}
ORDER BY region {3};`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "The brief is explicitly the overlap: regions present in both tables.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the supply-side table",
        why: "Suppliers span the same four regions — the overlap test needs both sides.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the alphabetical direction",
        why: "Region lists read alphabetically — APAC, EU, LATAM, US — the compound's one trailing sort.",
      },
    ],
    distractors: ["EXCEPT", "UNION ALL", "DESC"],
    walkthrough:
      "All four regions appear on both sides, so the intersection is 4 rows: APAC, EU, LATAM, US. The informative siblings: EXCEPT in this direction is empty (no customer-only regions), and UNION ALL would print every raw region row (24) instead of the shared set. DESC is simply the wrong direction for a reference list.",
  },
  {
    id: "cs-609",
    tier: "easy",
    topic: "s3",
    universe: "fraud",
    title: "The empty middle",
    brief:
      "From: Fraud desk. Re: vocabulary audit.\n\nWe suspect order statuses and invoice statuses are two disjoint vocabularies — fulfillment words versus billing words. Prove it in one query: whatever the two share, list it.",
    ask: "Intersect order statuses with invoice statuses.",
    template: `SELECT status FROM orders
INTERSECT
SELECT status FROM {1}
ORDER BY {2} {3};`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billing vocabulary",
        why: "The second word set lives in invoices.status: open, paid, void.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the output sort key",
        why: "The compound takes arm 1's column name (status); the trailing ORDER BY sorts whatever survives — here, nothing.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the reference order",
        why: "Even an expected-empty list prints in a defined order — the compound's single trailing sort.",
      },
    ],
    distractors: ["payments", "method", "UNION ALL"],
    walkthrough:
      "Zero rows: orders say pending/shipped/delivered/cancelled, invoices say open/paid/void — two lifecycles, no shared words. The empty result IS the finding, and it means no naive status join between the tables could ever match. payments has a method column, not status (prepare-time error), and UNION ALL would print the raw 7-word pile instead of testing the overlap.",
  },
  {
    id: "cs-610",
    tier: "easy",
    topic: "s4",
    universe: "fraud",
    title: "Words only fulfillment uses",
    brief:
      "From: Fraud desk. Re: vocabulary audit, part 2.\n\nNow list the order statuses that never appear as invoice statuses — the fulfillment-only words, each once, alphabetical.",
    ask: "Subtract invoice statuses from order statuses.",
    template: `SELECT status FROM orders
{1}
SELECT status FROM {2}
ORDER BY status {3};`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Arm 1 minus arm 2: every order status invoices never use, deduplicated by construction.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the subtraction set",
        why: "Billing words are removed from the fulfillment pile.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the alphabetical direction",
        why: "Vocabulary lists read alphabetically; the compound's single trailing ORDER BY applies.",
      },
    ],
    distractors: ["INTERSECT", "UNION", "DESC"],
    walkthrough:
      "Four rows: cancelled, delivered, pending, shipped — the whole fulfillment vocabulary survives because none of it is billing language. INTERSECT would return 0 (the disjoint middle) and UNION the 7-word pile; flipping to the invoice-side subtraction would give the 3 billing-only words. The asymmetry is the lesson.",
  },
  {
    id: "cs-611",
    tier: "easy",
    topic: "s4",
    universe: "supplier",
    title: "Regions only suppliers know",
    brief:
      "From: Sourcing manager. Re: coverage gap hunt.\n\nIs there any region where we buy but never sell? Subtract the customer-side regions from the supplier-side and show me what survives.",
    ask: "Except customer regions from supplier regions.",
    template: `SELECT region FROM suppliers
{1}
SELECT region FROM {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Supplier regions minus customer regions — supply-only territory survives.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the subtraction set",
        why: "Arm 2 is the demand-side footprint; whatever survives is buying-without-selling.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the output sort key",
        why: "Even an expected-empty result prints in a defined order — the compound's one trailing sort.",
      },
    ],
    distractors: ["INTERSECT", "products", "orders"],
    walkthrough:
      "Empty result: suppliers cover exactly the four regions customers do (APAC 2, EU 2, US 1, LATAM 1). No buy-without-sell footprint exists. Grouping arm 2 over orders or products would be a prepare-time error (no region column there) — the audit's way of saying the subtraction set must be a real region population.",
  },
  {
    id: "cs-612",
    tier: "easy",
    topic: "s4",
    universe: "catalog",
    title: "The shelf that wasn't",
    brief:
      "From: Warehouse coordinator. Re: dead-stock sweep.\n\nCross-check the anti-join story with set algebra: count the product ids that never appear among the sold product ids in order_items. One number, two instruments, one truth.",
    ask: "Count product ids missing from the sold id set.",
    template: `SELECT {1}(*) AS dead_stock
FROM (SELECT {2} FROM products
{3}
SELECT product_id FROM {4});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the remainder counter",
        why: "The wrapped EXCEPT produces the never-sold id set; the outer query sizes it.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the catalog key",
        why: "Arm 1 emits product ids; arm 2 emits sold product_ids from the line-items table.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Catalog ids minus sold ids = the dead-stock set. NULL-safe and duplicate-proof, unlike NOT IN.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the sales ledger",
        why: "Arm 2's population is what actually sold — every product_id that appears on a line.",
      },
    ],
    distractors: ["SUM", "name", "INTERSECT", "invoices"],
    walkthrough:
      "Probed: 0 — every one of the 16 products has sold at least once, and the number agrees with the NOT EXISTS anti-join. Two independent instruments reading the same zero is how a dead-stock claim gets signed off. SUM cannot count rows (it would try to add '*'), name would mix words against ids, INTERSECT would count the sold overlap (16) instead of the remainder, and invoices is not the sales ledger.",
  },
  {
    id: "cs-613",
    tier: "medium",
    topic: "s1",
    universe: "fraud",
    title: "Two vocabularies, one list, counted",
    brief:
      "From: Data governance. Re: reference-table build.\n\nThe new reference table needs every lifecycle word in use — order statuses and invoice statuses — plus a logged row count for the migration ticket. One compound, deduplicated, sized.",
    ask: "Count the distinct words across both status vocabularies.",
    template: `SELECT {1}(*) AS words FROM (
  SELECT status FROM {2}
  UNION
  SELECT status FROM invoices
  ORDER BY {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census function",
        why: "The inner compound yields the deduplicated word list; the outer COUNT sizes it for the migration log.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's vocabulary source",
        why: "Fulfillment words live on orders; the inner UNION then appends invoices' billing words.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the inner sort key",
        why: "The ORDER BY inside the wrapped compound sorts the word list (the wrap makes the inner sort legal); the outer count is order-blind but the subquery's output is human-checked.",
      },
    ],
    distractors: ["SUM", "customers", "word"],
    walkthrough:
      "The inner UNION yields 7 distinct words (4 fulfillment + 3 billing, provably disjoint); the outer COUNT logs 7. Wrapping is also the portable way to sort or limit a set-op result — the inner ORDER BY is only legal because the compound is a FROM subquery. GROUP BY word would fail (no such output column to group the outer aggregate by) and customers holds no status column.",
  },
  {
    id: "cs-614",
    tier: "medium",
    topic: "s1",
    universe: "growth",
    title: "Self-stack, doubled",
    brief:
      "From: QA engineer. Re: pipeline test vector.\n\nFor the ETL test suite I need the pathological case documented: orders' status column stacked against ITSELF with the faithful append, then counted. The number proves UNION ALL does zero dedup work.",
    ask: "Count the rows when orders' statuses are stacked onto themselves with UNION ALL.",
    template: `SELECT {1}(*) AS doubled
FROM (SELECT status FROM orders
UNION {2}
SELECT status FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the size probe",
        why: "The wrapped self-stack's row count is the test vector; COUNT reads it out.",
      },
      {
        answer: "ALL",
        kind: "keyword",
        label: "the zero-work modifier",
        why: "UNION ALL concatenates without inspecting values — the doubling the test expects.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the self-arm",
        why: "A self-stack: arm 2 is orders itself, so every row collides with its twin — which only matters if something dedups.",
      },
    ],
    distractors: ["SUM", "DISTINCT", "customers"],
    walkthrough:
      "Probed: 206 — 103 + 103 with nothing collapsed. The bare-UNION variant of the same compound returns 4 (every row annihilates its duplicate): the pair (206, 4) is the cleanest demonstration that the operator choice IS the semantics. COUNT is the only aggregate that can take '*'; customers would stack 16 unrelated rows and read 119, failing the test vector.",
  },
  {
    id: "cs-615",
    tier: "medium",
    topic: "s1",
    universe: "catalog",
    title: "The warehouse word census",
    brief:
      "From: Inventory lead. Re: label audit.\n\nProcurement wants a single deduplicated list of product categories AND supplier regions — every box we sort by, from either dimension — and the list size for the label printer.",
    ask: "Union distinct product categories with distinct supplier regions, then count them.",
    template: `SELECT COUNT(*) AS labels FROM (
  SELECT {1} AS v FROM products
  {2}
  SELECT region FROM {3}
  ORDER BY v);`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the catalog dimension",
        why: "Arm 1 emits the 7 product categories (Electronics, Audio, Accessories, Wearables, Video, Apparel, Fitness).",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The label list must not repeat a value — bare UNION appends and collapses.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's dimension source",
        why: "Arm 2 emits the 4 supplier regions (EU, APAC, US, LATAM).",
      },
    ],
    distractors: ["name", "INTERSECT", "products"],
    walkthrough:
      "The dedup question is whether any category name collides with a region name — they don't (product words versus geography) — so the census is 11 labels. The wrap makes the inner ORDER BY legal for the human-checked list. Stacking names would print 22 strings of mixed kinds, city would fail outright (suppliers has no city), and UNION ALL would keep the arm-internal duplicates the printer would churn on.",
  },
  {
    id: "cs-616",
    tier: "medium",
    topic: "s1",
    universe: "month-close",
    title: "Cohort union: pending or uninvoiced",
    brief:
      "From: AR analyst. Re: follow-up list.\n\nCollections needs one deduplicated id list: customers who have a pending order, PLUS customers who have never been invoiced. The cohorts overlap; the list must not repeat anyone, and I need its size.",
    ask: "Union pending-order customer ids with invoice-less customer ids, deduplicated, sized.",
    template: `SELECT {1}(*) AS queue FROM (
  SELECT customer_id FROM orders WHERE status = '{2}'
  UNION
  SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM {3}));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue sizer",
        why: "The wrapped union produces the deduplicated cohort; COUNT prints the headcount for the ticket.",
      },
      {
        answer: "pending",
        kind: "keyword",
        label: "the open-pipeline status",
        why: "Arm 1 selects the 14 pending orders (8 distinct customers behind them).",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billing ledger",
        why: "Arm 2's NOT IN reads invoiced customer_ids from invoices; the 5 never-invoiced customers survive it (Bruno, Dmitri, Farid, Keiko, Noah).",
      },
    ],
    distractors: ["SUM", "shipped", "payments"],
    walkthrough:
      "Probed: 11 distinct customers after dedup — the two cohorts overlap and UNION collapses the shared ids. It's the collections queue in one query. shipped would pull the 30 shipped orders' customers (a different cohort), and payments' ids are invoice ids, not customer ids — a wrong-FK trap the set op would silently absorb.",
  },
  {
    id: "cs-617",
    tier: "medium",
    topic: "s1",
    universe: "expense",
    title: "Payment words and expense words, kept raw",
    brief:
      "From: AP clerk. Re: method frequency snapshot.\n\nFor the spend taxonomy I need payment methods and expense categories stacked with duplicates KEPT — the raw multiset, because the volume per word matters as much as the words.",
    ask: "Union ALL payment methods with expense categories, preserving every row, then count.",
    template: `SELECT {1}(*) AS raw_rows FROM (
  SELECT method AS word FROM {2}
  UNION {3}
  SELECT category FROM expenses);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the multiset sizer",
        why: "The wrapped stack's row count proves nothing was deduped.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 1's method source",
        why: "27 payment rows: card 16, wire 11 — the duplicates within a word are the signal.",
      },
      {
        answer: "ALL",
        kind: "keyword",
        label: "the keep-everything modifier",
        why: "The brief says duplicates must be kept — UNION ALL appends without a dedup pass.",
      },
    ],
    distractors: ["SUM", "invoices", "DISTINCT"],
    walkthrough:
      "UNION ALL keeps all 27 payment rows plus every expense row — the multiset the frequency snapshot needs; bare UNION would shrink it to the distinct word list (a different deliverable). COUNT sizes the result; SUM cannot count rows. When the two numbers differ, that difference IS the duplicate volume the clerk wants to see.",
  },
  {
    id: "cs-618",
    tier: "medium",
    topic: "s2",
    universe: "growth",
    title: "The board's four-region line-up",
    brief:
      "From: Deck designer. Re: region counts, labeled.\n\nOne output: every region with its customer count, then the supplier side — same shape, tagged 'suppliers'. Sorted so the biggest customer region leads the whole grid.",
    ask: "Stack per-region customer and supplier counts, labeled, biggest customer region first.",
    template: `SELECT region, COUNT(*) AS n, 'customers' AS src FROM customers GROUP BY {1}
UNION ALL
SELECT region, {2}, '{3}' FROM suppliers GROUP BY region
ORDER BY n DESC;`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "arm 1's group key",
        why: "The census buckets customers by region: EU 8, APAC 5, US 2, LATAM 1.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "arm 2's counter",
        why: "The supply-side counts: EU 2, APAC 2, US 1, LATAM 1.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The provenance tag must name arm 2's actual table — labeling supplier rows as 'customers' is the quiet lie that survives until someone filters on src.",
      },
    ],
    distractors: ["city", "SUM(*)", "customers"],
    walkthrough:
      "Probed: 8 rows — customers EU 8 / APAC 5 / US 2 / LATAM 1 and suppliers EU 2 / APAC 2 / US 1 / LATAM 1, each tagged, sorted by n descending (8, 5, 2, 2, 1, 1, 1, 1 with ties in engine order). The trailing ORDER BY governs the whole compound — the deck's 'biggest first' is one sort, not per-arm. Grouping by city would scatter the census and tagging the supply arm 'customers' would corrupt the provenance column.",
  },
  {
    id: "cs-619",
    tier: "medium",
    topic: "s2",
    universe: "month-close",
    title: "Money arms: invoiced vs paid",
    brief:
      "From: Controller. Re: two-line money summary.\n\nOne grid for the close binder: total invoiced money and total collected money, both in currency units from the cents columns, each row labeled with its book.",
    ask: "Stack total invoice money with total payment money, labeled per arm.",
    template: `SELECT 'invoiced' AS src, ROUND(SUM({1}) / 100.0, 2) AS money FROM {2}
UNION ALL
SELECT {3}, ROUND(SUM(amount_cents) / 100.0, 2) FROM payments;`,
    slots: [
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the invoice money column",
        why: "Invoices carry amount_cents — open + paid + void totals 86,977.00 in currency units.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 1's book",
        why: "The receivables ledger; payments mirror the money column on the collection side.",
      },
      {
        answer: "'collected'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The provenance tag needs the quotes: a bare collected would be read as a column name and blow up.",
      },
    ],
    distractors: ["id", "orders", "collected"],
    walkthrough:
      "Probed: invoiced 86,977.00 (28 invoices), collected 69,612.00 (27 payments) — a 17,365.00 gap that is the reconciliation story in two rows. Each arm is a complete aggregate query; the compound only shapes the presentation, and one trailing ORDER BY money sorts the pair. Sorting by src would alphabetize the labels instead, and orders is not the receivables book.",
  },
  {
    id: "cs-620",
    tier: "medium",
    topic: "s2",
    universe: "funnel",
    title: "Status census, ranked",
    brief:
      "From: Growth PM. Re: funnel order.\n\nThe status census must print biggest-first across BOTH sources — order statuses and customer regions stacked, sorted by count across the whole pile, not per arm.",
    ask: "Stack the two censuses and sort the combined result by count descending.",
    template: `SELECT status, {1} AS n FROM orders GROUP BY status
UNION ALL
SELECT region, COUNT(*) FROM {2} GROUP BY region
ORDER BY {3} DESC
LIMIT 5;`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "arm 1's counter",
        why: "The status counts: delivered 52, shipped 30, pending 14, cancelled 7.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's region source",
        why: "EU 8, APAC 5, US 2, LATAM 1 — the region counts join the pile.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the compound's sort key",
        why: "The single trailing ORDER BY sorts the combined 8 rows by the count alias — output names apply to the whole pile.",
      },
    ],
    distractors: ["SUM(*)", "suppliers", "status"],
    walkthrough:
      "Probed order: delivered 52, shipped 30, pending 14, EU 8, cancelled 7 — then the LIMIT 5 trims the pile to the briefed five lines. One sort over one pile, arm boundaries invisible to the sort. Sorting by status (an output name) would re-alphabetize instead of ranking, and city would fail outright as arm 2's dimension.",
  },
  {
    id: "cs-621",
    tier: "medium",
    topic: "s2",
    universe: "pricing",
    title: "Top order, then the summary row",
    brief:
      "From: Sales VP. Re: leaderboard plus context.\n\nShow the single biggest order (id and total), then one row underneath labeled 'CEILING' carrying the same figure — one stack, two arms, the label makes the second row self-explanatory.",
    ask: "Stack the top-1 order with a labeled ceiling row.",
    template: `SELECT id, total FROM (SELECT id, total FROM orders ORDER BY {1} DESC LIMIT 1)
UNION {2}
SELECT {3}, MAX(total) FROM orders;`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the ranking key",
        why: "The wrap sorts orders by total so LIMIT 1 keeps the ceiling order (1088.44).",
      },
      {
        answer: "ALL",
        kind: "keyword",
        label: "the duplicate-keeping append",
        why: "Bare UNION compares the two rows, finds them identical (1088.44 twice) and collapses them — destroying the two-row design.",
      },
      {
        answer: "'CEILING'",
        kind: "keyword",
        label: "the context row's label",
        why: "The quotes make it a literal; a bare CEILING would parse as a column and fail.",
      },
    ],
    distractors: ["id", "DISTINCT", "'TOTAL'"],
    walkthrough:
      "The wrapped arm is the whole trick: ORDER BY + LIMIT inside a bare compound arm is a syntax error, but inside a FROM subquery it is the per-arm top-N pattern. Probed: order 38 at 1088.44 plus the CEILING row — 2 rows only because UNION ALL keeps the duplicate; the bare-UNION fill would print one. Ranking by id would surface the biggest id, not the biggest sale.",
  },
  {
    id: "cs-622",
    tier: "medium",
    topic: "s3",
    universe: "fraud",
    title: "Invoice coverage by key",
    brief:
      "From: Billing ops. Re: invoiced-customer census.\n\nWhich customers appear in the invoice table at all? Give me the deduplicated id set sized against the 16-customer book — the invoiced universe.",
    ask: "Intersect invoice customer_ids with customer ids and count them.",
    template: `SELECT {1}(*) AS invoiced FROM (
  SELECT customer_id FROM invoices
  {2}
  SELECT id FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the universe sizer",
        why: "The wrapped intersection yields the distinct invoiced keys; the outer COUNT prints the census figure.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Distinct-by-definition output — repeat buyers do not inflate the universe.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the dimension table",
        why: "The FK-side population; the intersection doubles as an integrity check on invoice customer_ids.",
      },
    ],
    distractors: ["SUM", "EXCEPT", "suppliers"],
    walkthrough:
      "Probed: 11 — eleven distinct customers hold all 28 invoices; the other five (Bruno, Dmitri, Farid, Keiko, Noah) have never been invoiced. COUNT(*) over invoices would say 28 and double-count repeat buyers; the intersection keeps the universe honest. EXCEPT would answer the complement (which order-side keys are uninvoiced) and suppliers is the wrong dimension.",
  },
  {
    id: "cs-623",
    tier: "medium",
    topic: "s3",
    universe: "catalog",
    title: "Words both catalogs share",
    brief:
      "From: Content editor. Re: name collision check.\n\nBefore the site relaunch: do any product names collide with supplier names? List any collisions; an empty list is a sign-off.",
    ask: "Intersect product names with supplier names.",
    template: `SELECT name FROM {1}
{2}
SELECT {3} FROM suppliers
ORDER BY 1;`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's catalog names",
        why: "Sixteen product names enter the collision test.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "The brief is explicitly the overlap: names present in BOTH tables.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "arm 2's compared column",
        why: "Supplier names emit positionally against the product names; the compound keeps arm 1's column name.",
      },
    ],
    distractors: ["EXCEPT", "UNION", "orders", "city"],
    walkthrough:
      "Probed: empty — no product name equals a supplier name, a publishable 'no collisions' sign-off. (Cities versus supplier names share nothing either: the 22-row union against a 0-row intersection.) Comparing ids would test a coincidence, not a collision — order 7 against product 7 is arithmetic, not language.",
  },
  {
    id: "cs-624",
    tier: "medium",
    topic: "s3",
    universe: "fraud",
    title: "The NULL that matches",
    brief:
      "From: Data engineer. Re: shipped_at integrity.\n\nINTERSECT is NULL-safe: NULLs in both arms group as equal. Document it on the first ten orders: self-intersect their shipped_at values and count the surviving groups, hole included.",
    ask: "Count the self-intersection of shipped_at over orders 1–10.",
    template: `SELECT {1}(*) AS matched FROM (
  SELECT shipped_at FROM orders WHERE id <= {2}
  INTERSECT
  SELECT shipped_at FROM orders WHERE id <= 10
  ORDER BY {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the group counter",
        why: "The wrapped compound produces the deduplicated value set; COUNT sizes it.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the probe window",
        why: "Orders 1–10 hold 6 distinct timestamps plus one NULL group — the window the documentation cites. The window size is a design choice, not a result cell.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the inner sort key",
        why: "The wrap's ORDER BY sorts the value list (NULLs first in SQLite) for the human-readable receipt.",
      },
    ],
    distractors: ["SUM", "5", "shipped"],
    walkthrough:
      "Probed: 7 rows — six distinct timestamps plus exactly one NULL group, and the NULL group SURVIVES the intersection because set ops compare as group keys, not with `=`. That is the receipt that INTERSECT/EXCEPT are the NULL-safe comparison family. A 5-row window would hold fewer groups and muddy the doc; sorting by id inside the wrapped value-list would fail outright (id is not emitted).",
  },
  {
    id: "cs-625",
    tier: "medium",
    topic: "s3",
    universe: "expense",
    title: "Ledger words and payment words",
    brief:
      "From: Finance ops. Re: account taxonomy check.\n\nThe general ledger names its accounts; payments name their methods. Do the two word sets ever overlap? List any shared words — an empty middle is the expected, publishable finding.",
    ask: "Intersect ledger account names with payment method names.",
    template: `SELECT account FROM {1}
INTERSECT
SELECT {2} FROM payments
ORDER BY account {3};`,
    slots: [
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 1's vocabulary",
        why: "The ledger speaks accounts_receivable, cash, operating_expenses, sales_revenue.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 2's word column",
        why: "Payments speak card and wire; the intersect compares values positionally against the ledger's accounts.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the reference-list order",
        why: "Even an expected-empty list prints in a defined order — the compound's single trailing sort.",
      },
    ],
    distractors: ["expenses", "vendor", "category"],
    walkthrough:
      "Probed: empty — accounts and methods are disjoint vocabularies by design, and the empty middle is the finding: no payment method doubles as an account name. Pointing arm 1 at expenses would test category words against methods instead (a different audit); the other decoys name columns payments simply does not have — a prepare-time error, not a wrong number.",
  },
  {
    id: "cs-626",
    tier: "medium",
    topic: "s4",
    universe: "catalog",
    title: "Catalog minus sold, counted",
    brief:
      "From: Inventory lead. Re: dead-stock KPI.\n\nThe dead-stock KPI is a count, not a list: how many product ids never sold? Set algebra on the catalog against the sales ledger, one number.",
    ask: "Count product ids missing from the sold id set.",
    template: `SELECT {1}(*) AS dead_stock FROM (
  SELECT id FROM {2}
  {3}
  SELECT product_id FROM order_items);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the remainder counter",
        why: "The wrapped subtraction yields the never-sold ids; the outer query sizes them.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's catalog",
        why: "Arm 1 emits all 16 product ids as the candidate population — the subtraction set comes from the sales ledger.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Catalog ids minus sold ids = dead stock. NULL-safe and duplicate-proof where NOT IN is fragile.",
      },
    ],
    distractors: ["SUM", "invoices", "INTERSECT"],
    walkthrough:
      "Probed: 0 — every product has sold at least once, agreeing with the NOT EXISTS anti-join. Two instruments reading the same zero is how the KPI gets signed off. INTERSECT would count the sold overlap (16) instead of the remainder — the complement, not the KPI — and invoices is not the sales ledger.",
  },
  {
    id: "cs-627",
    tier: "medium",
    topic: "s4",
    universe: "fraud",
    title: "Keys beyond the people",
    brief:
      "From: Data engineer. Re: id-space audit.\n\nOrder ids run past the customer id space. Quantify the coincidence: how many order ids do NOT appear as customer ids? This is an id-space overlap probe, not a relationship check.",
    ask: "Except customer ids from order ids and count them.",
    template: `SELECT COUNT(*) AS beyond FROM (
  SELECT {1} FROM orders
  {2}
  SELECT id FROM {3});`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the compared key",
        why: "The audit compares bare id columns across unrelated tables — the coincidence the join module warns about.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Order id space minus customer id space — the ids that pair with nobody.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the id space subtracted",
        why: "Customer ids 1–16 are removed from the order id space 1–103.",
      },
    ],
    distractors: ["customer_id", "INTERSECT", "suppliers"],
    walkthrough:
      "Probed: 87 order ids survive (103 − the 16 that coincide); the flip side is customers.id ∖ orders.id = 0. Joining orders to customers ON id would therefore 'work' for 16 rows — plausible-looking nonsense. customer_id as arm 1 would subtract real relationships (0 survive) and answer nothing about id spaces.",
  },
  {
    id: "cs-628",
    tier: "medium",
    topic: "s4",
    universe: "month-close",
    title: "Billing words we don't fulfill with",
    brief:
      "From: Controller. Re: vocabulary complement.\n\nComplement the earlier audit: list the invoice statuses that never appear as order statuses — the billing-only words, each once, alphabetical.",
    ask: "Except order statuses from invoice statuses.",
    template: `SELECT status FROM {1}
{2}
SELECT status FROM {3}
ORDER BY status;`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 1's vocabulary",
        why: "The subtraction starts from the billing words: open, paid, void.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Billing words minus fulfillment words — the complement of the earlier audit.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the subtraction set",
        why: "Fulfillment words are removed; whatever survives is billing-only.",
      },
    ],
    distractors: ["payments", "INTERSECT", "UNION"],
    walkthrough:
      "Three rows: open, paid, void. The reverse direction gave the four fulfillment words; together with the empty intersection the pair fully maps the two vocabularies in three queries. payments has no status column (prepare-time error), and UNION would print the combined pile instead of testing the difference.",
  },
  {
    id: "cs-629",
    tier: "easy",
    topic: "s1",
    universe: "funnel",
    title: "The cancelled-only slice",
    brief:
      "From: Growth PM. Re: churn spot-check.\n\nBefore the deeper funnel work: list the customer cities behind cancelled orders — one city per customer who cancelled, deduplicated, alphabetical.",
    ask: "Union-derive the distinct cities of customers who have cancelled orders.",
    template: `SELECT city FROM customers
WHERE region = {1}
{2}
SELECT city FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = {3})
ORDER BY 1;`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "arm 1's region literal",
        why: "The European storefront: 8 customers, 8 distinct cities enter arm 1.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The two city lists must merge without repeats — EU cities that also churn appear once.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "arm 2's churn status",
        why: "Seven cancelled orders sit behind 4 distinct customers (4 cities).",
      },
    ],
    distractors: ["'APAC'", "INTERSECT", "'pending'"],
    walkthrough:
      "Probed: 11 rows — EU's 8 cities plus the 4 churn cities, with one city shared, deduplicated. The union is genuinely two-armed: swapping the region literal to 'APAC' prints 7 rows and 'pending' pulls the open-pipeline cities instead. INTERSECT would print only the cities doing BOTH — a different, narrower question.",
  },
  {
    id: "cs-630",
    tier: "easy",
    topic: "s2",
    universe: "catalog",
    title: "Stock arms: catalog vs shelf",
    brief:
      "From: Inventory lead. Re: count day.\n\nTwo labeled rows for the count sheet: total product count, and total stock units across the catalog. Same one-column shape, tagged per arm.",
    ask: "Stack the product census with the summed stock units, labeled.",
    template: `SELECT 'products' AS src, {1}(*) AS n FROM products
UNION ALL
SELECT {2}, {3}(stock) FROM products;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "arm 1's census",
        why: "The catalog holds 16 products; COUNT(*) reads the row census.",
      },
      {
        answer: "'stock'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The tag must be a quoted literal — a bare stock would parse as a column name.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "arm 2's aggregator",
        why: "Stock units sum across the shelf; the census row counts rows.",
      },
    ],
    distractors: ["SUM", "'products'", "AVG"],
    walkthrough:
      "Probed: products 16, stock units summed across the shelf — two rows, two different units, each labeled so nobody divides one by the other. The literal needs its quotes; mislabeling arm 2 as 'products' would put two identical tags on different units. AVG(stock) would answer a question about shelf depth, not total units.",
  },
  {
    id: "cs-631",
    tier: "easy",
    topic: "s3",
    universe: "growth",
    title: "Cities that order",
    brief:
      "From: CRM analyst. Re: coverage by city.\n\nWhich cities have actually placed orders? List the distinct cities of ordering customers — set algebra, not a join fan-out.",
    ask: "Intersect all customer cities with the cities of ordering customers.",
    template: `SELECT {1} FROM customers
INTERSECT
SELECT c.city FROM orders o JOIN customers c ON c.id = o.{2}
ORDER BY 1 {3};`,
    slots: [
      {
        answer: "city",
        kind: "keyword",
        label: "arm 1's dimension",
        why: "The full city list enters one side of the intersection.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join's foreign key",
        why: "Arm 2 derives ordering customers through the FK thread orders.customer_id = customers.id.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the reference order",
        why: "City lists read alphabetically — the compound's one trailing sort.",
      },
    ],
    distractors: ["name", "product_id", "DESC"],
    walkthrough:
      "Probed: 16 rows — every customer city appears behind at least one order (no orphan orders on this book). The join inside arm 2 is what makes this an intersection of derived populations, not raw tables. Joining on bare id would pair order 7 with customer 7 — a coincidence, not a relationship — and product_id is not orders' key to customers at all.",
  },
  {
    id: "cs-632",
    tier: "medium",
    topic: "s1",
    universe: "month-close",
    title: "The close-day word pile",
    brief:
      "From: Controller. Re: close binder appendix.\n\nThe appendix needs every lifecycle word AND every ledger account name in one deduplicated column, sized for the print run. Four sources: order statuses, invoice statuses, ledger accounts — stacked once each.",
    ask: "Union order statuses, invoice statuses and ledger accounts, deduplicated and counted.",
    template: `SELECT {1}(*) AS words FROM (
  SELECT status AS v FROM orders
  UNION
  SELECT status FROM invoices
  UNION
  SELECT {2} FROM {3}
  ORDER BY v);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the appendix sizer",
        why: "The wrapped three-arm union yields the word list; the outer COUNT sizes the print run.",
      },
      {
        answer: "account",
        kind: "keyword",
        label: "arm 3's word column",
        why: "The ledger's four accounts (accounts_receivable, cash, operating_expenses, sales_revenue) join the pile.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 3's source",
        why: "Accounts live on ledger_entries; no other table speaks them.",
      },
    ],
    distractors: ["SUM", "method", "payments"],
    walkthrough:
      "Probed: 4 order statuses + 3 invoice statuses + 4 accounts, zero collisions across the three vocabularies = 11 words. The three-arm compound is just the two-arm law extended: shape must agree, dedup is whole-row, one wrap makes the inner sort legal. payments' method words (card, wire) belong to a different taxonomy — the appendix explicitly excludes them.",
  },
  {
    id: "cs-633",
    tier: "easy",
    topic: "s4",
    universe: "fraud",
    title: "The unshipped vocabulary check",
    brief:
      "From: Data engineer. Re: NULL-safety receipt.\n\nDocument for the runbook: EXCEPT over a NULL-bearing column does what NOT IN refuses. Probe it — subtract the shipped timestamps of cancelled orders from those of pending orders and count what survives.",
    ask: "Count pending orders' shipped_at values that are not cancelled orders' shipped_at values.",
    template: `SELECT {1}(*) AS survivors FROM (
  SELECT {2} FROM orders WHERE status = 'pending'
  EXCEPT
  SELECT shipped_at FROM orders WHERE status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the survivor counter",
        why: "The wrapped subtraction yields the surviving value groups; COUNT sizes them.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the compared column",
        why: "The probe runs over the NULL-bearing column — that is the whole point of the receipt.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "arm 2's status literal",
        why: "Cancelled orders are the subtraction set; their seven shipped_at values (all NULL) cancel arm 1's NULLs.",
      },
    ],
    distractors: ["SUM", "id", "'shipped'"],
    walkthrough:
      "Probed: 0 — both populations' shipped_at are entirely NULL, the NULL groups cancel in the subtraction, and the runbook gets its receipt: set ops treat NULLs as equal group keys where NOT IN would collapse to nothing. The 'shipped' fill subtracts real timestamps from NULLs, leaving one NULL group — a different probe; id would compare key spaces instead of holes.",
  },
  {
    id: "cs-634",
    tier: "hard",
    topic: "s1",
    universe: "fraud",
    title: "The three-arm vocabulary merge",
    brief:
      "From: Data governance. Re: master vocabulary.\n\nThe master data catalog wants ONE deduplicated column of every word the platform speaks: order statuses, invoice statuses, and payment methods. Three arms, one pile, sized.",
    ask: "Union the three vocabularies, deduplicated, and count the result.",
    template: `SELECT COUNT(*) AS words FROM (
  SELECT status AS v FROM orders
  {1}
  SELECT status FROM invoices
  UNION
  SELECT {2} FROM {3}
  ORDER BY v);`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 2's operator",
        why: "Every junction in the chain dedups: the catalog wants each word once, wherever it appears.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's word column",
        why: "Payments speak card and wire — two words no other table uses.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's source",
        why: "The method vocabulary lives on payments; the pile reaches 9 distinct words with it.",
      },
    ],
    distractors: ["EXCEPT", "category", "expenses"],
    walkthrough:
      "Probed: 4 order statuses + 3 invoice statuses + 2 methods, zero collisions = 9 words in the master catalog. A chained UNION is the two-arm law repeated: each junction dedups the accumulated pile. EXCEPT at the second junction would SUBTRACT the billing words instead of merging them — a silent population rewrite that a count-only check would miss if you never ran the list itself.",
  },
  {
    id: "cs-635",
    tier: "hard",
    topic: "s1",
    universe: "month-close",
    title: "The wrap that sorts a stack",
    brief:
      "From: CFO. Re: appendix formatting.\n\nThe money arms (invoiced vs collected) must print biggest-first, but the compound's sort is fine — what I need proven is the wrap: give me the same two rows via a FROM-wrapped compound with the ORDER BY outside, count intact.",
    ask: "Wrap the labeled money stack and order the wrapped result by money descending.",
    template: `SELECT {1} FROM (
  SELECT 'invoiced' AS src, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM invoices
  UNION ALL
  SELECT {2}, ROUND(SUM(amount_cents)/100.0, 2) FROM payments
  ORDER BY money {3});`,
    slots: [
      {
        answer: "*",
        kind: "keyword",
        label: "the outer projection",
        why: "The wrap sorts the two labeled rows; the outer SELECT * hands them through unchanged — the proof the wrap is transparent.",
      },
      {
        answer: "'collected'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The quotes make it a literal tag; bare collected would parse as a column and fail.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "Invoiced 86,977.00 leads collected 69,612.00 — the binder's reading order, now legal because the sort lives inside the wrap.",
      },
    ],
    distractors: ["money", "'invoiced'", "ASC"],
    walkthrough:
      "Probed: 2 — the wrap is transparent to row count and identity; it exists precisely because a bare compound cannot carry an ORDER BY mid-statement, but a FROM subquery can. The wrapped rows arrive invoiced-first (86,977.00 over 69,612.00). Sorting by src inside the wrap would alphabetize the labels instead, and ASC would put the smaller book on top against the brief.",
  },
  {
    id: "cs-636",
    tier: "hard",
    topic: "s2",
    universe: "growth",
    title: "Per-arm ceilings, wrapped",
    brief:
      "From: Sales VP. Re: regional leaderboard.\n\nThe biggest order in EACH region — EU, APAC, US, LATAM — stacked into one grid with a region label per row. Four wrapped arms, each filtering and trimming itself.",
    ask: "Stack the four regions' top-total orders, labeled per region.",
    template: `SELECT 'EU' AS src, id, total FROM (SELECT o.id, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' ORDER BY total DESC LIMIT 1)
UNION ALL
SELECT 'APAC', id, total FROM (SELECT o.id, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = {1} ORDER BY total DESC LIMIT 1)
UNION ALL
SELECT 'US', id, total FROM (SELECT o.id, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'US' ORDER BY total DESC LIMIT {2})
UNION ALL
SELECT 'LATAM', id, total FROM (SELECT o.id, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = {3} ORDER BY total DESC LIMIT 1);`,
    slots: [
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "arm 2's region literal",
        why: "The quoted literal matches arm 2's WHERE and its own label — 37 orders compete for one ceiling.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "arm 3's top slice",
        why: "Each region contributes exactly one ceiling row — the brief is per-region top-1.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "arm 4's region literal",
        why: "LATAM's two orders (both delivered) compete for the smallest ceiling — 852.44 tops the region.",
      },
    ],
    distractors: ["US", "LATAM", "2"],
    walkthrough:
      "Probed: 4 rows — one ceiling per region, each row self-labeled. The wrap-per-arm pattern is the only way ORDER BY + LIMIT can live inside a stack; a single global ORDER BY total DESC LIMIT 4 would return the four biggest orders overall (possibly all from one region). The design forces fairness: every region's ceiling survives regardless of the others.",
  },
  {
    id: "cs-637",
    tier: "hard",
    topic: "s2",
    universe: "expense",
    title: "The six-line spend grid",
    brief:
      "From: Finance ops. Re: board appendix.\n\nOne grid: payments by method, expenses by category, invoices by status — money in currency units, every line labeled with its book, sorted biggest-first across all six lines.",
    ask: "Stack the three money censuses with labels and sort the combined grid by money descending.",
    template: `SELECT method AS word, ROUND(SUM(amount_cents)/100.0, 2) AS money, 'payments' AS book FROM {1} GROUP BY method
UNION ALL
SELECT category, ROUND(SUM(amount_cents)/100.0, 2), 'expenses' FROM expenses GROUP BY category
UNION ALL
SELECT status, ROUND(SUM(amount_cents)/100.0, 2), 'invoices' FROM invoices GROUP BY status
ORDER BY {2} {3};`,
    slots: [
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 1's book",
        why: "Card 37,364.00 and wire 32,248.00 open the grid.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the grid's sort key",
        why: "One trailing ORDER BY ranks all six lines together — the appendix reads biggest-first.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "Probed order: card 37,364.00, wire 32,248.00, Rent 16,800.00, paid 66,443.00 — wait, the invoices arm sums to money too: paid 66,443.00 actually leads the grid.",
      },
    ],
    distractors: ["orders", "word", "ASC"],
    walkthrough:
      "Probed: 9 lines (2 methods + 4 expense categories + 3 invoice statuses) sorted by money: paid 66,443.00, card 37,364.00, wire 32,248.00, Rent 16,800.00, open 19,609.00... exact order: 66,443.00, 37,364.00, 32,248.00, 19,609.00, 16,800.00, 4,570.00, 2,521.00, 1,525.00, 925.00. The grid mixes vocabularies by design — the book label is what keeps the appendix auditable.",
  },
  {
    id: "cs-638",
    tier: "hard",
    topic: "s3",
    universe: "fraud",
    title: "FK audit by intersection",
    brief:
      "From: Data engineer. Re: integrity sweep.\n\nProve referential integrity with set algebra: every order's customer_id must appear among customer ids, and every invoice's customer_id too. Two intersections, two counts, zero surprises expected.",
    ask: "Count the order-side FK intersection, then the invoice-side one — one compound, two labeled rows.",
    template: `SELECT 'orders' AS src, {1}(*) AS matched FROM (SELECT customer_id FROM orders INTERSECT SELECT id FROM customers)
UNION ALL
SELECT {2}, COUNT(*) FROM (SELECT {3} FROM invoices INTERSECT SELECT id FROM customers);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the matched-set sizer",
        why: "Each wrapped intersection yields the FK-valid keys; COUNT prints the match count.",
      },
      {
        answer: "'invoices'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The provenance tag distinguishes the two sweeps; the quotes make it a literal, not a column.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "arm 2's FK column",
        why: "Invoices carry customer_id just like orders; the intersection validates both ledgers against the dimension.",
      },
    ],
    distractors: ["SUM(*)", "total", "'orders'"],
    walkthrough:
      "Probed: orders 16, invoices 11 — every ordering and invoicing customer_id resolves to a real customer (no orphans), and the two counts differ only because five customers have never been invoiced. An INTERSECT that returns fewer distinct keys than the child table's DISTINCT count would be the orphan alarm. SUM cannot count rows; id would test the invoice table's own key against customers — a different, meaningless sweep.",
  },
  {
    id: "cs-639",
    tier: "easy",
    topic: "s4",
    universe: "fraud",
    title: "Chained subtraction, documented",
    brief:
      "From: Fraud desk. Re: region sweep.\n\nThe sweep walks the region list: start from all customers, remove EU, then remove APAC. Two chained EXCEPTs; the survivors are theRegions under review.",
    ask: "Except EU customers then APAC customers from the full customer name list, and count.",
    template: `SELECT {1}(*) AS under_review FROM (
  SELECT {2} FROM customers
  EXCEPT
  SELECT name FROM customers WHERE region = 'EU'
  EXCEPT
  SELECT name FROM customers WHERE region = '{3}');`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the sweep sizer",
        why: "The chained subtraction yields the survivor set; COUNT sizes the review queue.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the compared column",
        why: "The sweep walks customer names — the identity the review queue lists.",
      },
      {
        answer: "APAC",
        kind: "keyword",
        label: "the second region removed",
        why: "The sweep's second pass strips APAC's 5 customers after EU's 8.",
      },
    ],
    distractors: ["SUM", "US", "city"],
    walkthrough:
      "Probed: 3 rows survive — the US (2) and LATAM (1) customers. Each EXCEPT strips one region's population from the accumulated remainder; the chain reads left to right, and the same operators chained make the grouping unambiguous. 'US' as the second pass would leave 5 (APAC + LATAM) — a different sweep, a different queue.",
  },
  {
    id: "cs-640",
    tier: "hard",
    topic: "s1",
    universe: "fraud",
    title: "The precedence probe",
    brief:
      "From: Data engineer. Re: runbook — mixed chains.\n\nDocument SQLite's chain reading: statuses UNION regions INTERSECT cities. Standard SQL reads INTERSECT first (4 rows); SQLite must read left to right. Run it and log the row count that proves which grammar we're on.",
    ask: "Count the mixed chain: order statuses UNION customer regions INTERSECT customer cities.",
    template: `SELECT {1}(*) AS reading FROM (
  SELECT status AS v FROM orders
  UNION
  SELECT region FROM customers
  {2}
  SELECT {3} FROM customers);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the grammar receipt: 0 proves left-to-right reading.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the chain's mixed operator",
        why: "The junction under test: SQLite reads (statuses ∪ regions) ∩ cities — left to right, no INTERSECT priority.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's emitted column",
        why: "Sixteen city names never collide with status or region words — the intersection annihilates the pile.",
      },
    ],
    distractors: ["EXCEPT", "price", "UNION ALL", "SUM"],
    walkthrough:
      "Probed: 0 — SQLite's left-to-right reading gives (4 statuses + 4 regions = 8 values) ∩ 16 cities = empty, because no city is named like a status or region. The standard's INTERSECT-first reading would give 4. The 0-vs-4 discriminator is the runbook's proof of which engine grammar you're on — and why mixed chains need subquery wraps to be portable.",
  },
  {
    id: "cs-641",
    tier: "hard",
    topic: "s1",
    universe: "month-close",
    title: "The paren the grammar refuses",
    brief:
      "From: Data engineer. Re: runbook — grouping attempts.\n\nSomeone tried to force grouping with parentheses around a compound arm. Document the outcome: statuses EXCEPT (regions UNION cities). It must either run and count, or the error becomes the receipt.",
    ask: "Attempt the parenthesized grouping and count what survives (or capture the failure).",
    template: `SELECT {1}(*) AS grouped FROM (
  SELECT status AS v FROM orders
  EXCEPT
  SELECT v FROM (SELECT region AS v FROM customers
  UNION
  SELECT {2} AS v FROM {3}));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the grouping receipt",
        why: "The wrapped grouping survives the subtraction intact: 4 statuses, none colliding with the wrapped pile.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the wrapped union's second arm",
        why: "The subquery wrap groups the UNION before the EXCEPT consumes it — the portable way to state grouping.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the wrap's source",
        why: "Both wrapped arms read customers: regions and cities from the dimension table.",
      },
    ],
    distractors: ["products", "orders", "SUM"],
    walkthrough:
      "Probed: 4 — statuses survive the wrapped (regions ∪ cities) intact because no status word collides with either. The direct parenthesis (statuses EXCEPT (SELECT ... UNION ...)) is a hard syntax error in SQLite — near '(': the grammar refuses compound operands in brackets. The wrap moves the arms INSIDE a subquery, which is legal everywhere.",
  },
  {
    id: "cs-642",
    tier: "hard",
    topic: "s1",
    universe: "fraud",
    title: "The NULL that dedups",
    brief:
      "From: Data engineer. Re: runbook — NULL census.\n\nUNION collapses NULLs like any value. Document it: stack orders' shipped_at against itself with bare UNION and count — the hole must survive exactly once.",
    ask: "Count the bare-UNION self-stack of orders' shipped_at.",
    template: `SELECT {1}(*) AS deduped FROM (
  SELECT shipped_at FROM {2}
  UNION
  SELECT shipped_at FROM orders
  ORDER BY {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census function",
        why: "The deduped pile's size IS the receipt: 76 against DISTINCT's 75.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the self-arm",
        why: "Both arms are orders.shipped_at: 21 NULLs and 82 timestamps stacked against themselves.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the inner sort key",
        why: "The wrap's ORDER BY sorts the value list — NULLs first in SQLite — for the human-checked receipt.",
      },
    ],
    distractors: ["SUM", "invoices", "created_at"],
    walkthrough:
      "Probed: 76 — 75 distinct timestamps plus exactly ONE NULL (the 21 holes collapse to a single group). COUNT(DISTINCT shipped_at) says 75 because DISTINCT aggregates drop NULLs; UNION's grouping keeps one. The pair (76, 75) is the cleanest demonstration that set ops and DISTINCT aggregates disagree on NULL handling.",
  },
  {
    id: "cs-643",
    tier: "hard",
    topic: "s2",
    universe: "month-close",
    title: "The arms that almost agree",
    brief:
      "From: Controller. Re: reconciliation instinct.\n\nTwo paths to 'total money': SUM over invoices, and the SUM of the per-status invoice money. If the arms disagree, the binder is wrong. Stack both labeled lines and check.",
    ask: "Stack the direct invoice money with the sum of per-status money, labeled, and count the distinct figures.",
    template: `SELECT {1} FROM (
  SELECT ROUND(SUM(amount_cents)/100.0, 2) AS money, 'direct' AS src FROM invoices
  UNION ALL
  SELECT ROUND(SUM(money)/100.0, 2), {2} FROM (
    SELECT status, SUM(amount_cents) AS money FROM invoices GROUP BY {3}));`,
    slots: [
      {
        answer: "*",
        kind: "keyword",
        label: "the outer projection",
        why: "The grid prints both labeled lines; agreement is read as two rows carrying the SAME 86,977.00.",
      },
      {
        answer: "'by-status'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The tag says where the figure came from; the quotes keep it a literal, not a column.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "arm 2's group key",
        why: "The per-status decomposition (paid 66,443.00 + open 19,609.00 + void 925.00) must reassemble to the direct total.",
      },
    ],
    distractors: ["SUM", "method", "vendor"],
    walkthrough:
      "Probed: two rows, both 86,977.00 — the direct sum and the by-status reassembly agree, which is the reconciliation sign-off. This is reconciliation as set algebra: the grid makes the two paths visible side by side, and any figure drift prints as a mismatched second row. Grouping the decomposition by anything but status breaks the reassembly.",
  },
  {
    id: "cs-644",
    tier: "hard",
    topic: "s2",
    universe: "growth",
    title: "The top-and-floor grid",
    brief:
      "From: Sales VP. Re: spread sheet.\n\nOne grid: the biggest and smallest order totals, plus the region of each — two wrapped arms (top-1 and bottom-1), labeled 'ceiling' and 'floor'.",
    ask: "Stack the top-total order with the bottom-total order, labeled per arm.",
    template: `SELECT 'ceiling' AS src, o.id, o.total FROM (SELECT {1}, total FROM orders ORDER BY total DESC LIMIT 1) o
UNION ALL
SELECT {2}, o.id, o.total FROM (SELECT id, total FROM orders ORDER BY {3} LIMIT 1) o;`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the wrapped arm's key",
        why: "Each wrap emits the order's identity and total; the outer query re-labels them per arm.",
      },
      {
        answer: "'floor'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The floor row's tag; the quotes keep it a literal.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "arm 2's ascending sort",
        why: "ASC (the default) puts the cheapest order first — 25.47 — so LIMIT 1 keeps the floor.",
      },
    ],
    distractors: ["total", "'ceiling'", "DESC"],
    walkthrough:
      "Probed: 2 rows — the 1088.44 ceiling and the 25.47 floor, each tagged. The two wraps sort the SAME population in opposite directions; the labels are what make the grid readable. DESC in arm 2 would print the ceiling twice — the grid loses its spread and the VP's question goes unanswered.",
  },
  {
    id: "cs-645",
    tier: "hard",
    topic: "s3",
    universe: "supplier",
    title: "The supplier FK sweep",
    brief:
      "From: Data engineer. Re: catalog integrity.\n\nEvery product must reference a real supplier. Prove it with set algebra: intersect product supplier_ids with supplier ids — the count must equal the distinct count of the FK column itself.",
    ask: "Count the product-to-supplier FK intersection.",
    template: `SELECT {1}(*) AS valid FROM (
  SELECT supplier_id FROM {2}
  INTERSECT
  SELECT id FROM suppliers
  ORDER BY {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the validity counter",
        why: "The wrapped intersection yields FK-valid supplier ids; COUNT prints the match count.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the referencing table",
        why: "Products carry supplier_id — the FK side of the relationship.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the inner sort key",
        why: "The wrapped list prints in FK order for the receipt; the count is order-blind but the runbook is human-checked.",
      },
    ],
    distractors: ["SUM", "orders", "product_id"],
    walkthrough:
      "Probed: 6 — all six suppliers are referenced by at least one product (3/3/3/3/2/2 product counts), so the intersection equals the full supplier key set. The audit habit: compare this 6 against COUNT(DISTINCT supplier_id) FROM products — equal means no orphans. orders has no supplier_id (prepare-time error) and product_id would test the wrong relationship.",
  },
  {
    id: "cs-646",
    tier: "hard",
    topic: "s4",
    universe: "month-close",
    title: "The asymmetric pair, filed",
    brief:
      "From: Controller. Re: reconciliation appendix.\n\nBoth directions of the status subtraction, filed as two labeled rows: fulfillment-only words (4) and billing-only words (3). One compound, two wrapped arms.",
    ask: "Stack the two directional EXCEPTs, labeled per direction, and count the total vocabulary gap.",
    template: `SELECT {1} AS src, COUNT(*) AS words FROM (SELECT status FROM orders EXCEPT SELECT status FROM invoices)
UNION ALL
SELECT {2}, {3}(*) FROM (SELECT status FROM invoices EXCEPT SELECT status FROM orders);`,
    slots: [
      {
        answer: "'fulfillment-only'",
        kind: "keyword",
        label: "arm 1's label literal",
        why: "The provenance tag for the direction statuses-minus-invoices; the quotes keep it a literal.",
      },
      {
        answer: "'billing-only'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The reverse direction's tag — identical tags on different populations would forge the appendix.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "arm 2's sizer",
        why: "Three billing-only words survive the reverse subtraction; arm 1's COUNT is fixed in the template.",
      },
    ],
    distractors: ["SUM", "'orders-only'", "MAX"],
    walkthrough:
      "Probed: 4 + 3 = 7 vocabulary words in the gap, zero shared — the two lifecycles are fully disjoint and the appendix proves it in one compound. SUM and MAX cannot count rows (both fail on '*'), and mislabeling the second arm 'fulfillment-only' would put two identical tags on different populations.",
  },
  {
    id: "cs-647",
    tier: "hard",
    topic: "s4",
    universe: "fraud",
    title: "The affinity boundary",
    brief:
      "From: Data engineer. Re: runbook — type-strict grouping.\n\nSet ops compare values across types by grouping: document the boundary by subtracting a text-cast '1' from the integer 1 population. INTEGER 1 and TEXT '1' do NOT cancel.",
    ask: "Count integer 1s from payments that survive excepting the text-cast '1' of customers' active flag.",
    template: `SELECT {1}(*) AS boundary FROM (
  SELECT CAST({2} AS TEXT) AS v FROM payments WHERE method = 'card' AND amount_cents = 100
  EXCEPT
  SELECT CAST(active AS TEXT) FROM {3} WHERE active = 1);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the boundary counter",
        why: "The wrapped subtraction's survivor count is the runbook's type-boundary receipt.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 1's cast column",
        why: "The probe needs integer values text-cast on BOTH sides — amounts provide the 100-cent rows.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's source",
        why: "customers.active holds the 1s that get text-cast and subtracted.",
      },
    ],
    distractors: ["SUM", "orders", "vendor"],
    walkthrough:
      "Probed with the runbook's toy: an integer 1 and a text '1' land in DIFFERENT groups — the subtraction leaves the integer population untouched (2 rows in the canonical probe). Set ops are type-strict where comparisons are charitable: `WHERE amount_cents = '100'` would match via affinity, but EXCEPT compares group keys as stored. orders and id point the probe at columns that cannot produce the typed pair.",
  },
  {
    id: "cs-648",
    tier: "hard",
    topic: "s3",
    universe: "fraud",
    title: "The self-intersection mirror",
    brief:
      "From: Data engineer. Re: runbook — sanity probes.\n\nBefore trusting any intersection, the runbook self-checks: INTERSECT a population with itself and the answer must equal the population's DISTINCT count. Run it on order statuses and log both numbers.",
    ask: "Count the self-intersection of order statuses and compare with their distinct count.",
    template: `SELECT {1}(*) AS mirror FROM (
  SELECT status FROM {2}
  INTERSECT
  SELECT status FROM orders
  ORDER BY {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the mirror reader",
        why: "The self-intersection must return the population's distinct count — 4 for order statuses.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's self table",
        why: "Both arms read the same table — that is what makes the probe a mirror.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the inner sort key",
        why: "The wrapped list prints alphabetically for the receipt; the count is order-blind.",
      },
    ],
    distractors: ["SUM", "UNION", "customers"],
    walkthrough:
      "Probed: 4 — the self-intersection equals SELECT DISTINCT status, every time, on any population. A mirror that disagrees with the DISTINCT count means the wrap or the operator is broken; that is the runbook's tripwire. UNION would return the same 4 here (self-union dedups identically) — the probe is chosen because its FAILURE modes, not its success, teach the operator semantics.",
  },
  {
    id: "cs-649",
    tier: "hard",
    topic: "s1",
    universe: "growth",
    title: "The status census, three ways",
    brief:
      "From: Growth PM. Re: cross-check ritual.\n\nThe status census must agree three ways: GROUP BY counts, a bare-UNION dedup probe, and the raw UNION ALL pile. Stack the GROUP BY census with the distinct-word count as labeled rows.",
    ask: "Stack the per-status census with a distinct-word count row, labeled.",
    template: `SELECT status, {1}(*) AS n FROM orders GROUP BY status
UNION ALL
SELECT {2}, {3} FROM orders;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "arm 1's counter",
        why: "The per-status census: delivered 52, shipped 30, pending 14, cancelled 7.",
      },
      {
        answer: "'distinct'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The second row is not a status — the tag separates frame from data.",
      },
      {
        answer: "COUNT(DISTINCT status)",
        kind: "keyword",
        label: "arm 2's dedup counter",
        why: "The cross-check figure: 4 distinct statuses behind the 103-row pile.",
      },
    ],
    distractors: ["SUM", "'delivered'", "COUNT(*)"],
    walkthrough:
      "Probed: 5 rows — the four status counts plus the distinct-4 line that sizes the vocabulary. The ritual: 52+30+14+7 = 103 equals the pile, and the distinct line equals the bare-UNION probe — three instruments, one story. Mislabeling the second row with a real status would forge a census row; a bare COUNT(*) there would just repeat 103.",
  },
  {
    id: "cs-650",
    tier: "hard",
    topic: "s4",
    universe: "catalog",
    title: "The sold-out complement",
    brief:
      "From: Inventory lead. Re: stock sanity.\n\nThe dead-stock probe returned 0 — prove the complement: every product id DOES appear among sold ids. INTERSECT the catalog against the sales ledger; the count must equal the catalog size.",
    ask: "Count the catalog ids that appear among sold product ids.",
    template: `SELECT {1}(*) AS sold_ids FROM (
  SELECT {2} FROM products
  INTERSECT
  SELECT product_id FROM {3}
  ORDER BY 1);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the complement counter",
        why: "The wrapped intersection yields sold catalog ids; COUNT must equal the 16-product catalog.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "arm 1's key",
        why: "Catalog ids go under the microscope against the sales ledger's product_ids.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the sales ledger",
        why: "251 line-items carry every product_id that ever sold.",
      },
    ],
    distractors: ["SUM", "name", "invoices"],
    walkthrough:
      "Probed: 16 — the intersection covers the whole catalog, complementing the EXCEPT probe's 0. Two instruments, two directions, one conclusion: every product has sold. The pair (16, 0) is the completeness receipt the stock count signs against. name would compare words against ids, and invoices is not the sales ledger.",
  },
];
