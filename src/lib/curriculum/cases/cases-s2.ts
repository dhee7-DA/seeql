// Case batch S2 — Module 3 (set ops & CASE) cases cs-651…cs-700.
// 50 cases: 17 easy / 17 medium / 16 hard across topics s1 (UNION stacks),
// s2 (Stacked reports), s3 (INTERSECT), s4 (EXCEPT), s5 (Set chains).
// Every figure was probed against the live seed db (scripts/m3-facts.ts,
// scripts/m3-facts-w2.ts, scripts/m3-facts-s2.ts) and is mechanically
// re-verified by scripts/case-audit.ts (structure, execution, figure-in-cell,
// distractor consequence, prose gates).

import type { CaseStudy } from "./types";

export const casesS2: CaseStudy[] = [
  {
    id: "cs-651",
    tier: "easy",
    topic: "s1",
    universe: "growth",
    title: "Fulfillment words, payment words",
    brief:
      "From: Ops lead. Re: checkout glossary v2.\n\nThe glossary page shipped last quarter with lifecycle words only. Support wants the payment vocabulary on the same page: one deduplicated column holding every order status and every payment method we actually use.",
    ask: "Stack the distinct order statuses with the distinct payment methods, deduplicated and sorted.",
    template: `SELECT status AS v FROM orders
{1}
SELECT {2} FROM payments
ORDER BY {3};`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "One glossary entry per word: UNION appends both arms then collapses whole-row duplicates.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 2's emitted column",
        why: "Payments carry their vocabulary in the method column (card, wire). Its values join the pile under arm 1's alias v.",
      },
      {
        answer: "v",
        kind: "keyword",
        label: "the compound's sort key",
        why: "A compound takes its output names from arm 1, so the trailing ORDER BY sorts the merged result by v.",
      },
    ],
    distractors: ["INTERSECT", "EXCEPT", "invoices"],
    walkthrough:
      "Four fulfillment words (pending, shipped, delivered, cancelled) meet two payment words (card, wire) in a disjoint pile: the deduplicated union is exactly 6 rows, sorted cancelled, card, delivered, pending, shipped, wire. INTERSECT would return the 0 words both sides share, and EXCEPT would keep only arm 1's four statuses — both answer a different question than 'every word we use'. Pointing arm 2 at invoices fails outright because invoices has no method column; the compound would not even prepare.",
  },
  {
    id: "cs-652",
    tier: "easy",
    topic: "s1",
    universe: "catalog",
    title: "Cities plus lifecycle words",
    brief:
      "From: Copy editor. Re: appendix word count.\n\nThe catalog appendix lists 'every shipping city and every fulfillment status word' as one deduplicated list. Before we print it, management wants the exact line count of that list as a single figure.",
    ask: "Count the deduplicated stack of customer cities and order statuses.",
    template: `SELECT {1}(*) AS vocab FROM (
  SELECT city FROM customers
  {2}
  SELECT {3} FROM orders);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the headcounter",
        why: "The deliverable is one figure — the size of the wrapped stack. SUM would try to add up the '*' placeholder and fail.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The appendix lists each word once. UNION appends the arms and collapses whole-row duplicates before the wrapper counts.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "arm 2's word column",
        why: "Orders carry the lifecycle words in status; cities live on customers in arm 1.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "region"],
    walkthrough:
      "16 distinct cities plus 4 lifecycle words with zero overlap: the wrapped COUNT prints 20 — the appendix line count. INTERSECT would count the 0 words the two lists share, and arm 2 pointed at region would both read the wrong column (orders has no region) and break the prepare step. The 20-vs-16 contrast is the whole reason this figure gets requested before print.",
  },
  {
    id: "cs-653",
    tier: "easy",
    topic: "s2",
    universe: "expense",
    title: "The spend envelope, three rows",
    brief:
      "From: Finance partner. Re: budget letter.\n\nFor the annual budget letter I want the spending envelope of the expense ledger as three stacked rows: the biggest expense, the smallest expense, and the average expense — each in dollars, one column, nothing else.",
    ask: "Stack MAX, MIN and AVG of expense amounts as three rows in dollars.",
    template: `SELECT {1}(amount_cents)/100.0 AS stat FROM expenses
UNION ALL
SELECT {2}(amount_cents)/100.0 FROM expenses
UNION ALL
SELECT {3}(amount_cents)/100.0 FROM expenses;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "arm 1's aggregate",
        why: "The biggest single expense: 1680.00 (a Skyline Travel booking). MAX scans the whole column for the ceiling.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "arm 2's aggregate",
        why: "The smallest single expense: 220.00. MIN is the floor of the same column.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "arm 3's aggregate",
        why: "The mean expense: exactly 706.00 — the ledger's 25,416.00 total spread over 36 rows divides evenly.",
      },
    ],
    distractors: ["SUM", "COUNT", "ROUND"],
    walkthrough:
      "Three scalar arms over the same column: 1680.00, 220.00 and 706.00 — the envelope the budget letter quotes. SUM would print the 25,416.00 grand total where the maximum belongs, COUNT would print 36 three times (collapsed to one row by the compound), and bare ROUND would try to round per-row values instead of computing a statistic. The three figures are distinct, so UNION ALL keeps all three rows.",
  },
  {
    id: "cs-654",
    tier: "easy",
    topic: "s2",
    universe: "inventory",
    title: "Two catalogs, one headcount",
    brief:
      "From: Inventory coordinator. Re: source-tagged counts.\n\nThe count-day binder opens with a tiny grid: how many product rows and how many supplier rows we hold, each row labeled with the table it came from. Labeled literals, raw counts, no filtering.",
    ask: "Stack labeled counts of the products and suppliers tables.",
    template: `SELECT 'products' AS src, COUNT(*) AS n FROM {1}
UNION ALL
SELECT 'suppliers', COUNT(*) FROM {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's table",
        why: "The catalog side of the grid: 16 product rows.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's table",
        why: "The supply side: 6 supplier rows (EU 2, APAC 2, US 1, LATAM 1).",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC puts the bigger census (16) on top. The compound inherits arm 1's alias n for the count column.",
      },
    ],
    distractors: ["SUM", "region", "expenses"],
    walkthrough:
      "Two one-row arms: products 16, suppliers 6 — sorted big-to-small by the inherited alias n. The literals make each row self-describing, which is what a binder grid needs. SUM is an aggregate, not a sort key (misuse error), ORDER BY region references a column the compound does not output, and pointing either arm at expenses would quietly swap in 36 spend rows that belong to a different binder page.",
  },
  {
    id: "cs-655",
    tier: "easy",
    topic: "s2",
    universe: "expense",
    title: "Rent and ads, side by side",
    brief:
      "From: Controller. Re: fixed-vs-variable slide.\n\nThe slide contrasts our two recurring spend lines: everything booked to Rent and everything booked to Ads this period. Two labeled money rows, exact dollars, no other categories.",
    ask: "Stack the Rent total and the Ads total as labeled money rows.",
    template: `SELECT 'rent' AS line, ROUND(SUM(amount_cents)/100.0, 2) AS money
FROM expenses WHERE category = {1}
UNION ALL
SELECT 'ads', ROUND({2}(amount_cents)/100.0, 2)
FROM expenses WHERE category = {3};`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "arm 1's category filter",
        why: "Rent is 14 rows of 1200.00 each — 16,800.00 in total, the anchor of the fixed-cost side.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "arm 2's aggregator",
        why: "The ads line needs its rows added up: 14 bookings totalling 4,570.00.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "arm 2's category filter",
        why: "Filters arm 2 to the advertising vendor bookings (AdWorks Media).",
      },
    ],
    distractors: ["MAX", "Travel", "COUNT"],
    walkthrough:
      "Two labeled money rows: rent 16,800.00 (fourteen identical 1,200.00 bookings from Atlas Property GmbH) and ads 4,570.00. MAX would print the biggest single booking (1,200.00) where the category total belongs, and COUNT would print row counts (14) divided by 100 — not money. Filtering either arm to Travel pulls the 2,521.00 travel line into a report that was briefed as fixed-vs-variable only.",
  },
  {
    id: "cs-656",
    tier: "easy",
    topic: "s2",
    universe: "month-close",
    title: "The billing pile by state",
    brief:
      "From: Controller. Re: close checklist item 2.\n\nI need the invoice ledger split into its three states — open, paid, void — as three stacked money rows, exact dollars each. This is the reconciliation anchor for the close binder.",
    ask: "Stack invoice money by status: one row each for open, paid and void.",
    template: `SELECT ROUND(SUM(amount_cents)/100.0, 2) AS money FROM invoices WHERE status = {1}
UNION ALL
SELECT ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE status = {2}
UNION ALL
SELECT ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE status = {3};`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Six open invoices holding 19,609.00 — the receivables the close chases.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "Twenty-one paid invoices totalling 66,443.00 — the collected bulk.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "arm 3's status filter",
        why: "Exactly one void invoice (925.00) — the single row that must reconcile to zero impact.",
      },
    ],
    distractors: ["'refunded'", "'shipped'", "total"],
    walkthrough:
      "Three scalar arms over the same filter pattern: open 19,609.00, paid 66,443.00, void 925.00 — and the three should sum to the 86,977.00 ledger total, which they do. 'refunded' and 'shipped' are not invoice statuses, so their arms aggregate an empty set and print a NULL row that visibly breaks the stack; total is not a column on invoices and fails to prepare. The stack is deliberately UNION ALL: the three states are disjoint, and the binder wants one row per state regardless.",
  },
  {
    id: "cs-657",
    tier: "easy",
    topic: "s3",
    universe: "supplier",
    title: "Shared ground on the map",
    brief:
      "From: Expansion analyst. Re: presence overlap.\n\nBefore we brief the board, I want proof of the overlap claim: the regions where we simultaneously have customers AND suppliers. One deduplicated column, alphabetical, no counts.",
    ask: "Intersect customer regions with supplier regions.",
    template: `SELECT region FROM {1}
INTERSECT
SELECT region FROM {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 1's table",
        why: "The demand side: all four regions have customers (EU 8, APAC 5, US 2, LATAM 1).",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's table",
        why: "The supply side: 6 suppliers also cover all four regions (EU 2, APAC 2, US 1, LATAM 1).",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the ordinal sort key",
        why: "ORDER BY 1 sorts the compound's single output column — the intersection itself — alphabetically.",
      },
    ],
    distractors: ["UNION", "city", "2"],
    walkthrough:
      "Both tables cover the full map, so the intersection is all 4 regions — APAC, EU, LATAM, US — and the slide can say 'fully overlapping footprint'. UNION would print the same 4 rows here, which is exactly why the brief says 'simultaneously': INTERSECT is the claim being made. ORDER BY 2 asks for a second output column that does not exist (out-of-range error), and city is not carried by the compound.",
  },
  {
    id: "cs-658",
    tier: "easy",
    topic: "s3",
    universe: "fraud",
    title: "The id-space accident",
    brief:
      "From: Fraud analyst. Re: surrogate-key warning.\n\nOrders and customers both use integer ids starting at 1, so some numbers exist in both tables while meaning different things. I want the size of that accidental overlap as one figure for the runbook.",
    ask: "Count the ids that appear in both orders and customers.",
    template: `SELECT {1}(*) AS shared FROM (
  SELECT id FROM orders
  {2}
  SELECT id FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The deliverable is a single overlap figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "INTERSECT keeps only values present in both arms — the definition of the id-space accident.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Customers supply the second id space (ids 1–16); orders supply ids 1–103.",
      },
    ],
    distractors: ["SUM", "EXCEPT", "payments"],
    walkthrough:
      "Orders run ids 1–103, customers ids 1–16: the shared band is exactly 16 ids — every customer id collides with some order id. The wrapped count prints 16. EXCEPT would count ids in orders but not customers (87 — the complement, a different runbook line), and payments (ids 1–27) would raise the apparent overlap to 27. Same-shaped columns, unrelated meanings — the runbook's whole point.",
  },
  {
    id: "cs-659",
    tier: "easy",
    topic: "s4",
    universe: "month-close",
    title: "Fulfillment words billing never uses",
    brief:
      "From: Close analyst. Re: vocabulary gap.\n\nThe close binder claims the fulfillment and billing systems share a status vocabulary. Disprove or confirm mechanically: list the order statuses that do NOT appear as invoice statuses.",
    ask: "Except invoice statuses from order statuses, sorted.",
    template: `SELECT status FROM {1}
{2}
SELECT status FROM invoices
ORDER BY {3};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "The fulfillment vocabulary (pending, shipped, delivered, cancelled) is the left side of the subtraction.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "EXCEPT keeps arm-1 values that never appear in arm 2 — the vocabulary gap the binder claims is empty.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the ordinal sort key",
        why: "The compound outputs one column inherited from arm 1; ORDER BY 1 sorts it alphabetically.",
      },
    ],
    distractors: ["INTERSECT", "UNION", "2"],
    walkthrough:
      "The two vocabularies are fully disjoint, so the subtraction keeps all four order statuses — cancelled, delivered, pending, shipped — and the binder's 'shared vocabulary' claim is dead. INTERSECT would return the 0 shared words (the opposite verdict) and UNION the 7-word merged pile. ORDER BY 2 is an out-of-range ordinal on a one-column compound and fails to prepare.",
  },
  {
    id: "cs-660",
    tier: "easy",
    topic: "s4",
    universe: "funnel",
    title: "Payment words the ledger lacks",
    brief:
      "From: Funnel analyst. Re: method vocabulary audit.\n\nOur payment methods live in the payments table, our invoice states in invoices. For the method audit I need the payment words that never appear as invoice statuses, printed newest-sort (reverse alphabetical).",
    ask: "Except invoice statuses from payment methods, reverse-sorted.",
    template: `SELECT {1} FROM payments
EXCEPT
SELECT status FROM {2}
ORDER BY 1 {3};`,
    slots: [
      {
        answer: "method",
        kind: "keyword",
        label: "arm 1's word column",
        why: "Payments expose their vocabulary through method (card, wire).",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "The billing vocabulary (open, paid, void) is the subtraction's right side.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the reverse direction",
        why: "The audit sheet reads reverse-alphabetical, so the two surviving words print wire, card.",
      },
    ],
    distractors: ["region", "customers", "ASC"],
    walkthrough:
      "card and wire share nothing with open/paid/void, so both survive the subtraction — printed wire, card under the reverse sort. The two vocabularies being disjoint is what makes this a quick audit: nothing gets filtered. ASC would flip the order to card, wire (a different print than briefed), payments has no region column, and customers has no status column — both wrong-table picks fail at prepare time.",
  },
  {
    id: "cs-661",
    tier: "easy",
    topic: "s4",
    universe: "pricing",
    title: "Product families finance never sees",
    brief:
      "From: Pricing lead. Re: category coverage memo.\n\nThe pricing deck claims every product family shows up somewhere in the expense sheet (tools, ads, travel...). Fact-check it: count the product categories that never appear as an expense category.",
    ask: "Count product categories absent from the expense categories.",
    template: `SELECT COUNT(*) AS product_only FROM (
  SELECT category FROM {1}
  {2}
  SELECT {3} FROM expenses);`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's table",
        why: "The seven product families (Electronics, Audio, Accessories, Wearables, Video, Apparel, Fitness) form the left side.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "We want categories present in products but absent from expenses — a textbook EXCEPT.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 2's column",
        why: "Expenses also name their grouping column category, so the arms align shape-wise.",
      },
    ],
    distractors: ["INTERSECT", "suppliers", "name"],
    walkthrough:
      "The two category vocabularies share nothing: all 7 product families survive the subtraction and the wrapped count prints 7 — the memo's claim is false. INTERSECT would count the 0 shared families (accidentally 'confirming' the memo), suppliers has no category column to subtract, and expenses has no name column. Seven families, zero overlap: the pricing deck needs a footnote.",
  },
  {
    id: "cs-662",
    tier: "easy",
    topic: "s4",
    universe: "supplier",
    title: "Vendors the supply chain doesn't know",
    brief:
      "From: Supplier auditor. Re: vendor onboarding list.\n\nExpenses are booked to four vendors. The onboarding team only tracks suppliers. List the expense vendors that are not supplier-table names, biggest-name-first (reverse alphabetical).",
    ask: "Except supplier names from expense vendors, reverse-sorted.",
    template: `SELECT vendor FROM {1}
EXCEPT
SELECT name FROM {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 1's table",
        why: "The four expense vendors (AdWorks Media, Atlas Property GmbH, DevTools Inc, Skyline Travel) are the left side.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's table",
        why: "The six supplier names form the subtraction's right side.",
      },
      {
        answer: "vendor",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY vendor DESC prints the survivors newest-name-first: Skyline Travel, DevTools Inc, Atlas Property GmbH, AdWorks Media.",
      },
    ],
    distractors: ["INTERSECT", "ledger_entries", "city"],
    walkthrough:
      "Vendor names and supplier names do not overlap at all, so all four vendors survive — the onboarding list is short and the auditor's suspicion is confirmed. INTERSECT would return the 0 shared names, the ledger speaks in accounts rather than vendor names (no name column to subtract), and the compound's output carries no city to sort by. Four untracked vendors is exactly the gap the onboarding team was hired to close.",
  },
  {
    id: "cs-663",
    tier: "easy",
    topic: "s4",
    universe: "refund-audit",
    title: "Billing words fulfillment never prints",
    brief:
      "From: Refund auditor. Re: state-machine mismatch.\n\nRefund tickets get stuck when agents assume orders and invoices share status words. Count the invoice-only statuses — the billing words that never appear on an order.",
    ask: "Count invoice statuses absent from order statuses.",
    template: `SELECT {1}(*) AS billing_words FROM (
  SELECT status FROM invoices
  EXCEPT
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The deliverable is a single mismatch figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "arm 2's column",
        why: "Orders also call their state column status — the arms align and the subtraction is well-formed.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 2's table",
        why: "The fulfillment vocabulary (pending/shipped/delivered/cancelled) is what the billing words are checked against.",
      },
    ],
    distractors: ["INTERSECT", "region", "customers"],
    walkthrough:
      "open, paid and void appear on no order, so the wrapped count prints 3 — every billing word is foreign to the order state machine, and the ticket macro needs rewriting. INTERSECT would count the 0 words the machines share; orders has no region column; customers has no status column. Three foreign words is the whole mismatch story in one figure.",
  },
  {
    id: "cs-664",
    tier: "easy",
    topic: "s5",
    universe: "growth",
    title: "The three-vocabulary page",
    brief:
      "From: Deck designer. Re: master word list.\n\nThe deck's appendix merges three controlled vocabularies — order statuses, customer regions and payment methods — into one deduplicated, alphabetized column. Three arms, one pile.",
    ask: "Union order statuses, customer regions and payment methods into one sorted column.",
    template: `SELECT status AS v FROM orders
UNION
SELECT region FROM {1}
{2}
SELECT {3} FROM payments
ORDER BY v;`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Regions live on customers: EU, APAC, US, LATAM join the pile second.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right: dedup after arm 2, then arm 3 appends and dedups again.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's word column",
        why: "Payments contribute card and wire through the method column.",
      },
    ],
    distractors: ["INTERSECT", "EXCEPT", "city"],
    walkthrough:
      "Three disjoint vocabularies merge to exactly 10 rows — APAC, EU, LATAM, US sort first (uppercase before lowercase in binary order), then cancelled, card, delivered, pending, shipped, wire. Nothing dedups away (no collisions), but UNION is still the right claim: the page promises each word once. INTERSECT after arm 2 would annihilate the pile to 0, EXCEPT would keep only the statuses, and payments has no city column.",
  },
  {
    id: "cs-665",
    tier: "easy",
    topic: "s1",
    universe: "month-close",
    title: "Flags meet billing words",
    brief:
      "From: Close analyst. Re: column audit.\n\nA junior stacked the customers' active flag against invoice statuses and got five odd rows. Reproduce the honest version: one deduplicated column of active-flag values and invoice statuses, sorted.",
    ask: "Union the active flag values with invoice statuses, sorted.",
    template: `SELECT {1} AS v FROM customers
UNION
SELECT status FROM {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "active",
        kind: "keyword",
        label: "arm 1's flag column",
        why: "The active flag holds the integers 0 and 1 — two customers are flagged inactive.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Invoices contribute the three billing words: open, paid, void.",
      },
      {
        answer: "v",
        kind: "keyword",
        label: "the compound's sort key",
        why: "The output column is named by arm 1's alias v; sorting by it orders 0, 1 before the words.",
      },
    ],
    distractors: ["region", "payments", "city"],
    walkthrough:
      "Type-mixing is the lesson: the pile holds integers and text side by side — 0, 1, open, paid, void — five rows sorted with numbers first. Nothing errors: SQLite compares by affinity, and dedup treats 1 (integer) and 'paid' (text) as different rows. Swapping arm 1 to region would print a seven-row pile of regions and billing words instead, payments has no status column, and the compound outputs no city to sort by.",
  },
  {
    id: "cs-666",
    tier: "easy",
    topic: "s2",
    universe: "growth",
    title: "The transaction census, labeled",
    brief:
      "From: Growth analyst. Re: funnel volume grid.\n\nThe board grid needs three labeled volume rows: how many orders, how many invoices, how many payments we hold. Literal source tags, raw counts, biggest first.",
    ask: "Stack labeled counts of orders, invoices and payments, biggest first.",
    template: `SELECT 'orders' AS src, COUNT(*) AS n FROM {1}
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "The demand side: 103 order rows, the biggest pile in the stack.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's table",
        why: "The cash side: 27 payment rows — fewer receipts than the 28 invoices they settle.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC ranks the piles 103, 28, 27 — the grid's big-to-small reading.",
      },
    ],
    distractors: ["SUM", "customers", "src"],
    walkthrough:
      "Three labeled one-row arms: orders 103, invoices 28, payments 27. The 103-to-28 gap is the funnel's first story (not every order is invoiced — that is a different report), and invoices-to-payments (28 vs 27) hints at unpaid paper. SUM in the ORDER BY slot is an aggregate misuse error, customers would substitute a 16-row census for a transaction count, and sorting by src prints payments, invoices, orders — alphabetically honest, brief-wise wrong.",
  },
  {
    id: "cs-667",
    tier: "easy",
    topic: "s5",
    universe: "catalog",
    title: "The four-ledger vocabulary",
    brief:
      "From: Copy editor. Re: controlled-vocabulary count.\n\nThe catalog's back matter claims the business uses exactly fourteen distinct 'label words' across expense categories, ledger accounts, payment methods and order statuses. Verify with one deduplicated, sorted list.",
    ask: "Union the four label vocabularies into one sorted column and confirm 14 rows.",
    template: `SELECT category AS v FROM expenses
UNION
SELECT account FROM ledger_entries
UNION
SELECT method FROM payments
UNION
SELECT {1} FROM {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "arm 4's word column",
        why: "Orders contribute the four lifecycle words — the pile's last arm.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 4's table",
        why: "The lifecycle vocabulary lives on orders.",
      },
      {
        answer: "v",
        kind: "keyword",
        label: "the compound's sort key",
        why: "Arm 1's alias v names the output; the trailing ORDER BY v alphabetizes the merged pile.",
      },
    ],
    distractors: ["INTERSECT", "region", "name"],
    walkthrough:
      "Four disjoint vocabularies — 4 categories, 4 accounts, 2 methods, 4 statuses — merge to exactly 14 rows, confirming the back matter. Uppercase sorts first, so Ads, Rent, Tools, Travel lead; the lowercase block reads accounts_receivable, cancelled, card, cash, delivered, operating_expenses, pending, sales_revenue, shipped, wire. INTERSECT at arm 4 would collapse everything to 0, and orders carries no region or name column for the other picks.",
  },
  {
    id: "cs-668",
    tier: "medium",
    topic: "s2",
    universe: "funnel",
    title: "Money lens, two dimensions",
    brief:
      "From: Funnel analyst. Re: revenue lens grid.\n\nThe grid stacks order money cut two ways: by customer region and by order status. Both arms are money rollups over the same orders table, labeled so the reader knows which lens each row came from.",
    ask: "Stack the region money rollup over the status money rollup, both labeled.",
    template: `SELECT 'region' AS kind, c.region AS key, ROUND(SUM(o.total), 2) AS money
FROM orders o {1} customers c ON c.id = o.customer_id
GROUP BY c.{2}
UNION ALL
SELECT 'status', status, ROUND(SUM(total), 2)
FROM orders
GROUP BY {3};`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "arm 1's table link",
        why: "Regions live on customers, so arm 1 joins orders to customers on the customer key before grouping.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 1's grouping column",
        why: "The region lens: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "arm 2's grouping column",
        why: "The status lens: delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49.",
      },
    ],
    distractors: ["INNER", "city", "email"],
    walkthrough:
      "Eight labeled rows: four region buckets (EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44) then four status buckets (delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49). Both lenses sum to the same 34,833.28 — a reconciliation worth stating out loud. INNER alone is not a join keyword and fails to parse, and grouping by city or email would shred the four-region lens into sixteen label rows.",
  },
  {
    id: "cs-669",
    tier: "medium",
    topic: "s3",
    universe: "expense",
    title: "Days we both sold and spent",
    brief:
      "From: Finance partner. Re: calendar overlap check.\n\nBefore we claim 'we book spend on selling days', verify it: count the calendar days that appear both as an order date and as an expense date. One figure.",
    ask: "Count dates present in both orders and expenses.",
    template: `SELECT {1}(*) AS shared_days FROM (
  SELECT created_at FROM orders
  {2}
  SELECT {3} FROM {4});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The deliverable is one overlap figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Shared days means values present in both arms — the definition of INTERSECT.",
      },
      {
        answer: "spent_on",
        kind: "keyword",
        label: "arm 2's date column",
        why: "Expenses date their bookings in spent_on; orders date theirs in created_at.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "The spend calendar comes from the expenses ledger (36 dated bookings).",
      },
    ],
    distractors: ["SUM", "EXCEPT", "entry_date", "ledger_entries"],
    walkthrough:
      "84 distinct order dates meet 36 expense dates: exactly 7 days exist on both calendars — the intersection the partner asked about, and the claim survives only because 7 > 0. EXCEPT would count the 77 order days with no spend booked (the opposite audit), entry_date belongs to the ledger table not expenses, and pointing arm 2 at ledger_entries fails because that table dates its rows entry_date, not spent_on.",
  },
  {
    id: "cs-670",
    tier: "medium",
    topic: "s4",
    universe: "funnel",
    title: "Selling days with no spend",
    brief:
      "From: Funnel analyst. Re: quiet-spend days.\n\nMarketing wants the complement of the overlap check: how many distinct order dates never carried an expense booking. Those are the days revenue moved while the spend ledger stayed silent.",
    ask: "Count order dates absent from the expense calendar.",
    template: `SELECT COUNT(*) AS order_only_days FROM (
  SELECT {1} FROM orders
  {2}
  SELECT spent_on FROM {3});`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "arm 1's date column",
        why: "Orders stamp their rows with created_at — 84 distinct dates.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Days present in orders but absent from expenses is a textbook EXCEPT.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "The expense calendar (36 dates) is what gets subtracted from the order calendar.",
      },
    ],
    distractors: ["shipped_at", "INTERSECT", "payments"],
    walkthrough:
      "84 order dates minus the 7 shared days: 77 dates saw orders but no expense booking — the quiet-spend list. EXCEPT also quietly deduplicates arm 1 for free, so no DISTINCT is needed. INTERSECT would answer the overlap question (7) instead of the complement (77), shipped_at is a different column whose datetime values collide with nothing (76 distinct values incl. NULL survive), and payments has no spent_on column.",
  },
  {
    id: "cs-671",
    tier: "medium",
    topic: "s2",
    universe: "expense",
    title: "Categories, then the grand total",
    brief:
      "From: Controller. Re: spend sheet footer.\n\nThe spend sheet lists each expense category's money, then one extra row labeled 'all' holding the grand total. Five rows, exact dollars, biggest money first.",
    ask: "Stack per-category spend totals plus a grand-total row, biggest first.",
    template: `SELECT category AS line, ROUND(SUM({1})/100.0, 2) AS money FROM expenses
GROUP BY {2}
UNION ALL
SELECT 'all', ROUND(SUM(amount_cents)/100.0, 2) FROM expenses
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 1's summed column",
        why: "Category money is the sum of amount_cents: Rent 16,800.00, Ads 4,570.00, Travel 2,521.00, Tools 1,525.00.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 1's group key",
        why: "Four buckets, one per expense category — the partition the sheet is briefed on.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY money DESC prints the total first (25,416.00), then Rent, Ads, Travel, Tools.",
      },
    ],
    distractors: ["id", "spent_on", "city"],
    walkthrough:
      "Five rows: the four categories (Rent 16,800.00, Ads 4,570.00, Travel 2,521.00, Tools 1,525.00) plus the 'all' footer at 25,416.00 — which must equal the category sums, and does. The footer is just another ALL-arm with no GROUP BY. Summing id would pour row numbers into a money column, grouping by spent_on would shred the sheet into 36 day buckets, and sorting by a column the compound does not output fails at prepare time.",
  },
  {
    id: "cs-672",
    tier: "medium",
    topic: "s1",
    universe: "fraud",
    title: "The NULL that counts once",
    brief:
      "From: Data engineer. Re: dedup receipt — timestamps.\n\nFor the dedup runbook: orders.shipped_at repeats values and holds NULLs. Count the distinct shipping timestamps when NULLs are treated as one group — the number UNION reports for a self-stack of that column.",
    ask: "Count the self-union of orders.shipped_at (NULLs collapsed to one).",
    template: `SELECT {1}(*) AS n FROM (
  SELECT {2} FROM orders
  {3}
  SELECT shipped_at FROM orders);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The runbook wants the size of the deduplicated pile as one figure.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "arm 1's column",
        why: "The timestamp column under test: 82 filled rows carrying 75 distinct values, plus 21 NULLs.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "UNION treats NULL as a value: all 21 NULLs collapse to a single row in the pile.",
      },
    ],
    distractors: ["SUM", "id", "UNION ALL"],
    walkthrough:
      "The self-stack dedups to 76: 75 distinct timestamps plus one surviving NULL — the runbook's receipt that UNION NULL-groups rather than dropping. UNION ALL would print the raw 206 rows (103 + 103) and never dedup. Arm 1 pointed at id would union integers with timestamps into 179 unrelated values. And COUNT is the wrapper because SUM(*) is not SQL — aggregates wrap columns, never the star placeholder.",
  },
  {
    id: "cs-673",
    tier: "medium",
    topic: "s2",
    universe: "catalog",
    title: "Key ranges, table by table",
    brief:
      "From: Warehouse coordinator. Re: id-range card.\n\nThe count-day card opens with each table's id span so volunteers can spot out-of-range stickers. Stack min and max id for orders, customers and order_items, widest span first.",
    ask: "Stack MIN/MAX id ranges for the three tables, widest span first.",
    template: `SELECT {1}(id) AS lo, MAX(id) AS hi FROM orders
UNION ALL
SELECT MIN(id), MAX(id) FROM {2}
UNION ALL
SELECT MIN(id), MAX(id) FROM order_items
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "arm 1's lower bound",
        why: "Every table's ids start at 1, so MIN prints 1 in all three rows.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Customers span ids 1–16 — the smallest range on the card.",
      },
      {
        answer: "hi",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY hi DESC ranks spans 251, 103, 16 — order_items widest, orders middle, customers tightest.",
      },
    ],
    distractors: ["SUM", "suppliers", "lo"],
    walkthrough:
      "Three range rows: order_items 1–251 (251 line rows), orders 1–103, customers 1–16 — sorted widest-first by the hi column. The card doubles as a grain reminder: one order can hold several item lines, which is why the item table outspans its parent. SUM would print id sums (5356 for orders) where a boundary belongs, suppliers would swap in the 1–6 range, and sorting by lo orders three tied 1s into scan order instead of span order.",
  },
  {
    id: "cs-674",
    tier: "medium",
    topic: "s4",
    universe: "expense",
    title: "Accounts the till never touches",
    brief:
      "From: Finance partner. Re: bookkeeping vocabulary.\n\nThe general ledger speaks in account names; the till speaks in payment methods. For the glossary footnote, list the ledger accounts that never appear as payment methods, sorted alphabetically.",
    ask: "Except payment methods from ledger accounts, sorted.",
    template: `SELECT account FROM ledger_entries
{1}
SELECT {2} FROM payments
ORDER BY {3};`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Accounts absent from the method vocabulary — a textbook EXCEPT.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 2's column",
        why: "Payments expose card and wire through method — the till's whole vocabulary.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the ordinal sort key",
        why: "The compound outputs one column (account, inherited from arm 1); ORDER BY 1 alphabetizes it.",
      },
    ],
    distractors: ["INTERSECT", "status", "city"],
    walkthrough:
      "All four accounts survive — accounts_receivable, cash, operating_expenses, sales_revenue — because the till only ever says card or wire. The footnote writes itself: ledger vocabulary and till vocabulary are disjoint. INTERSECT would print the 0 shared words, UNION would merge both piles into 6 rows, and neither status nor city exists on the payments side to subtract or sort by.",
  },
  {
    id: "cs-675",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "Chain receipt: subtract, then append",
    brief:
      "From: Data engineer. Re: runbook — two-operator chains.\n\nDocument how SQLite reads statuses EXCEPT regions UNION cities. Standard SQL and SQLite disagree on precedence, so the runbook needs the row count SQLite actually returns for this chain.",
    ask: "Count the chain: order statuses EXCEPT customer regions UNION customer cities.",
    template: `SELECT {1}(*) AS ltr FROM (
  SELECT status FROM orders
  EXCEPT
  SELECT region FROM customers
  UNION
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: 20 proves left-to-right reading.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names append after the subtraction, and none collide with status or region words.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 3's table",
        why: "Cities live on customers, the same dimension that supplied arm 2's regions.",
      },
    ],
    distractors: ["SUM", "region", "suppliers"],
    walkthrough:
      "SQLite reads the chain left to right: (statuses ∖ regions = 4) ∪ cities = 4 + 16 = 20 — the wrapped count's receipt. A standard-grammar engine would evaluate the UNION's neighbour differently only when INTERSECT is involved; here plain left-assoc reading is the story. Pointing arm 3 at region instead collapses the tail to the 4 regions already in play (total 4), and suppliers has no city column — the chain would not prepare.",
  },
  {
    id: "cs-676",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "The wrap that groups first",
    brief:
      "From: Data engineer. Re: runbook — forced grouping.\n\nParentheses around a compound arm are a syntax error in SQLite, so grouping must move INSIDE a subquery. Document the portable pattern: statuses EXCEPT the wrap of (regions UNION cities), counted.",
    ask: "Count statuses minus the subquery-wrapped union of regions and cities.",
    template: `SELECT COUNT(*) AS grouped FROM (
  SELECT status FROM orders
  EXCEPT
  SELECT v FROM (
    SELECT region AS v FROM customers
    {1}
    SELECT {2} AS v FROM {3}));`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "the wrap's operator",
        why: "Inside the wrap, the union merges regions and cities into one 20-value pile before the outer EXCEPT consumes it.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the wrap's second arm",
        why: "Sixteen city names join the regions under the shared alias v.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the wrap's source table",
        why: "Both wrap arms read the customers dimension.",
      },
    ],
    distractors: ["JOIN", "WHERE", "status"],
    walkthrough:
      "The wrap builds regions ∪ cities = 20 values first; statuses subtract that pile and all 4 survive (no lifecycle word is a city or region) — the wrapped count prints 4. The direct parenthesis version fails with a syntax error, which is why the runbook teaches the wrap. Dropping in status as the wrap's second arm is the trap: the subtraction then meets its own vocabulary and annihilates to 0. JOIN or WHERE in the operator slot are parse errors, and suppliers has no city column.",
  },
  {
    id: "cs-677",
    tier: "medium",
    topic: "s2",
    universe: "refund-audit",
    title: "Paper money vs collected cash",
    brief:
      "From: Refund auditor. Re: gap sizing.\n\nRefund exposure starts with the invoiced-vs-collected gap. Stack two labeled money rows: everything invoiced to date, everything actually collected through payments.",
    ask: "Stack invoiced money over collected money.",
    template: `SELECT 'invoiced' AS line, ROUND({1}(amount_cents)/100.0, 2) AS money
FROM {2}
UNION ALL
SELECT 'collected', ROUND(SUM(amount_cents)/100.0, 2) FROM {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "arm 1's aggregator",
        why: "Invoiced money is the sum of all 28 invoice amounts: 86,977.00.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 1's table",
        why: "The paper side of the ledger: 28 invoices across three statuses.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 2's table",
        why: "The cash side: 27 payments totalling 69,612.00.",
      },
    ],
    distractors: ["COUNT", "MAX", "expenses"],
    walkthrough:
      "Two rows: invoiced 86,977.00 against collected 69,612.00 — a 17,365.00 gap that is exactly the open-invoice balance the refund team watches. The stack is UNION ALL because the two arms are conceptually different ledgers, not duplicate rows to dedup. COUNT would divide the money by 100 into row counts, MAX would print the biggest single document, and expenses would quietly substitute 25,416.00 of spend for either side.",
  },
  {
    id: "cs-678",
    tier: "medium",
    topic: "s2",
    universe: "refund-audit",
    title: "Status census over region census",
    brief:
      "From: Refund auditor. Re: aligned mini-grids.\n\nThe refund playbook's grid stacks the per-status order census over the per-region customer census — eight labeled counts in one result, sorted by the label column so the two grids read alphabetically.",
    ask: "Stack the status counts over the region counts, sorted by label.",
    template: `SELECT {1} AS v, COUNT(*) AS n FROM orders
GROUP BY status
UNION ALL
SELECT region, COUNT(*) FROM customers
GROUP BY {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "arm 1's group column",
        why: "Four lifecycle buckets: delivered 52, shipped 30, pending 14, cancelled 7.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 2's group column",
        why: "Four region buckets: EU 8, APAC 5, US 2, LATAM 1.",
      },
      {
        answer: "v",
        kind: "keyword",
        label: "the compound's sort key",
        why: "ORDER BY v alphabetizes the eight labels — uppercase regions first, then lowercase statuses.",
      },
    ],
    distractors: ["src", "kind", "n"],
    walkthrough:
      "Eight rows in two visual grids: APAC 5, EU 8, LATAM 1, US 2, then cancelled 7, delivered 52, pending 14, shipped 30. Arm 1's alias v names the output column, so the trailing sort can reference it even though arm 2's own column name is discarded. Sorting by n would shuffle the rows into count order and destroy the grid reading, chips that are not output columns fail the sort at prepare time, and either wrong group column fails because the other table has no such column.",
  },
  {
    id: "cs-679",
    tier: "medium",
    topic: "s3",
    universe: "fraud",
    title: "One row, both directions",
    brief:
      "From: Fraud analyst. Re: id-space receipt, compact form.\n\nThe runbook wants the id-overlap story in a single row: how many ids orders and customers share, and how many are order-only. Two wrapped subqueries, one result row.",
    ask: "Print shared order/customer ids and order-only ids in one row.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT id FROM orders {1} SELECT id FROM customers)) AS shared,
  (SELECT COUNT(*) FROM (SELECT id FROM orders {2} SELECT id FROM {3})) AS only_orders;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the shared-side operator",
        why: "The shared count is the id-space intersection: 16.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the only-side operator",
        why: "Order-only ids are orders ∖ customers: 87.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the complement's table",
        why: "The 16 customer ids are what gets subtracted from the 103 order ids.",
      },
    ],
    distractors: ["UNION", "payments", "shipped_at"],
    walkthrough:
      "One row, two receipts: shared 16 (ids 1–16 exist in both id spaces), only_orders 87 (the 103 − 16 complement). The pair reconciles: 16 + 87 = 103, every order id accounted for. UNION in either slot would blow the subquery up to the 103-value merged pile, payments would swap the complement's right side to a 1–27 id space (76 left over), and shipped_at is a column name, not a table — the subquery would not prepare.",
  },
  {
    id: "cs-680",
    tier: "medium",
    topic: "s1",
    universe: "month-close",
    title: "The trailing operator that dedups everything",
    brief:
      "From: Controller. Re: pile-size surprise.\n\nA junior appended four arms with UNION ALL, then tacked a final region arm on with bare UNION — and the pile collapsed from 180 rows to 13. Rebuild that exact query so the close binder documents the surprise.",
    ask: "Stack four UNION ALL arms plus a final UNION arm; count the result.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT status FROM orders
  UNION ALL
  SELECT region FROM customers
  UNION ALL
  SELECT status FROM invoices
  UNION ALL
  SELECT {1} FROM {2}
  {3}
  SELECT region FROM suppliers);`,
    slots: [
      {
        answer: "method",
        kind: "keyword",
        label: "arm 4's column",
        why: "Payment methods (card, wire) are the fourth vocabulary in the pile.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 4's table",
        why: "Methods live on payments — 27 rows enter the ALL pile.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the final arm's operator",
        why: "The bare UNION dedups the ENTIRE accumulated left side at once: 180 raw rows collapse to 13 distinct words.",
      },
    ],
    distractors: ["city", "customers", "UNION ALL"],
    walkthrough:
      "The raw ALL pile holds 103 + 16 + 28 + 27 + 6 = 180 rows; the final bare UNION dedups the whole accumulated left side in one stroke: 4 statuses + 4 regions + 3 invoice states + 2 methods = 13 distinct words (suppliers add no new region). That asymmetry — ALL preserves, bare UNION sweeps everything — is the binder's lesson. UNION ALL in the last slot would print the honest 180, and neither city nor customers exists on payments.",
  },
  {
    id: "cs-681",
    tier: "medium",
    topic: "s5",
    universe: "supplier",
    title: "Chain receipt: append, then subtract",
    brief:
      "From: Expansion analyst. Re: runbook — mixed chain.\n\nSame pile, opposite order: statuses UNION regions EXCEPT cities. Log the count SQLite returns so the runbook can contrast it with the subtract-first variant.",
    ask: "Count the chain: order statuses UNION customer regions EXCEPT customer cities.",
    template: `SELECT {1}(*) AS ltr FROM (
  SELECT status FROM orders
  UNION
  SELECT region FROM customers
  EXCEPT
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: 8 proves the append happened before the subtraction.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "The subtraction's right side is the 16 city names — none of which appear in the appended pile.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 3's table",
        why: "Cities live on customers, same as arm 2's regions.",
      },
    ],
    distractors: ["SUM", "status", "suppliers"],
    walkthrough:
      "Left to right: statuses ∪ regions = 8, then ∖ cities removes nothing (no city is named like a status or region) — the wrapped count prints 8. Subtracting the statuses themselves instead (arm 3 = status) would cut the pile to the 4 regions, which is exactly the contrast the runbook logs against the subtract-first variant's 20. And suppliers has no city column, so the chain would not prepare.",
  },
  {
    id: "cs-682",
    tier: "medium",
    topic: "s2",
    universe: "refund-audit",
    title: "Pending money over delivered money",
    brief:
      "From: Refund auditor. Re: exposure snapshot.\n\nRefund exposure lives in pending orders; delivered orders are the settled baseline. Stack the two money buckets as labeled rows so the snapshot shows both figures side by side.",
    ask: "Stack pending-order money over delivered-order money.",
    template: `SELECT 'pending' AS bucket, ROUND(SUM({1}), 2) AS money FROM orders WHERE status = {2}
UNION ALL
SELECT 'delivered', ROUND(SUM(total), 2) FROM orders WHERE status = {3};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "arm 1's money column",
        why: "Pending exposure is the sum of pending totals: 6,113.00 across 14 orders.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Filters arm 1 to the 14 pending orders holding the exposure.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "The settled baseline: 52 delivered orders worth 15,571.07.",
      },
    ],
    distractors: ["customer_id", "shipped", "cancelled"],
    walkthrough:
      "Two labeled rows: pending 6,113.00 (exposure) and delivered 15,571.07 (baseline) — the snapshot the refund desk quotes. Summing customer_id would add id integers into a money column, and swapping either status literal moves the wrong bucket in: shipped would print 11,996.72 under the pending label, cancelled would print 1,152.49 under the delivered one. The literal labels are what keep the snapshot honest.",
  },
  {
    id: "cs-683",
    tier: "medium",
    topic: "s3",
    universe: "refund-audit",
    title: "The FK receipt, set-op edition",
    brief:
      "From: Refund auditor. Re: referential integrity proof.\n\nBefore refunding against invoices, prove every order's customer_id points at a real customer — without a join. Set semantics can do it: intersect order customer ids with customer ids and count.",
    ask: "Count order customer_ids that exist in the customers id space.",
    template: `SELECT {1}(*) AS fk_holds FROM (
  SELECT {2} FROM orders
  INTERSECT
  SELECT id FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The integrity receipt is a single figure.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "arm 1's key column",
        why: "Orders reference customers through customer_id — the foreign key under test.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "The referenced id space: 16 customer ids.",
      },
    ],
    distractors: ["SUM", "shipped_at", "suppliers"],
    walkthrough:
      "All 16 customers have ordered, so the intersection of order customer_ids with customer ids is the full 16 — the FK receipt prints intact and refunds can proceed. Intersecting shipped_at timestamps with integer ids would return 0 (different type spaces, still 'no orphans' for the wrong reason), and suppliers' 1–6 id space would shrink the receipt to 6. The audit's honest answer needs both arms to speak about the same key.",
  },
  {
    id: "cs-684",
    tier: "medium",
    topic: "s3",
    universe: "month-close",
    title: "Accounts that post both ways",
    brief:
      "From: Controller. Re: ledger shape check.\n\nDouble-entry sanity: which ledger accounts carry BOTH debits and credits (they get intersected), and which are debit-only (they survive a subtraction)? One row, two figures.",
    ask: "Count accounts posting both sides and accounts posting debit-only.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT account FROM ledger_entries WHERE {1} > 0
    {2} SELECT account FROM ledger_entries WHERE credit_cents > 0)) AS both_sides,
  (SELECT COUNT(*) FROM (SELECT account FROM ledger_entries WHERE debit_cents > 0
    {3} SELECT account FROM ledger_entries WHERE credit_cents > 0)) AS debit_only;`,
    slots: [
      {
        answer: "debit_cents",
        kind: "keyword",
        label: "the first probe's column",
        why: "Debit activity is marked by debit_cents > 0 (40 rows across the ledger).",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the both-sides operator",
        why: "Accounts present in BOTH the debit set and the credit set: accounts_receivable and cash — 2.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the debit-only operator",
        why: "Debit accounts minus credit accounts leaves operating_expenses alone — 1.",
      },
    ],
    distractors: ["credit_cents", "UNION", "id"],
    walkthrough:
      "One row, two receipts: both_sides 2 (accounts_receivable and cash post both ways — the flow-through accounts) and debit_only 1 (operating_expenses only ever drains). sales_revenue is the mirror image: credit-only, invisible to both probes. Probing credit_cents in the first slot would intersect credit with credit (3), UNION in either operator slot would count the merge (4) instead of the shared or exclusive set, and id > 0 passes every account.",
  },
  {
    id: "cs-685",
    tier: "hard",
    topic: "s1",
    universe: "fraud",
    title: "Chain receipt: intersect, then append",
    brief:
      "From: Data engineer. Re: runbook — the third mixed chain.\n\nComplete the precedence table: statuses INTERSECT regions UNION cities. Standard SQL would read the INTERSECT first; SQLite must not. Log the count this engine returns.",
    ask: "Count the chain: order statuses INTERSECT customer regions UNION customer cities.",
    template: `SELECT {1}(*) AS ltr FROM (
  SELECT status FROM orders
  {2}
  SELECT region FROM customers
  UNION
  SELECT {3} FROM customers);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the grammar receipt.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the chain's first operator",
        why: "Under left-to-right reading, (statuses ∩ regions) collapses to 0 before the UNION appends.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names append into an already-empty junction — none collide with anything.",
      },
    ],
    distractors: ["SUM", "EXCEPT", "region"],
    walkthrough:
      "SQLite reads left to right: statuses ∩ regions = 0 (disjoint vocabularies), then ∪ cities = 16 — the wrapped count's receipt. Standard SQL's INTERSECT-first reading would give statuses ∪ (regions ∩ cities) = 4 + 0 = 4, so the 16-vs-4 contrast is the runbook's proof of which grammar is running. EXCEPT in the first slot appends after subtracting (4 ∖ 4 = 0, then + 16 = 20), arm 3 pointed at region re-adds the 4 regions for a total of 4, and SUM(*) is not SQL.",
  },
  {
    id: "cs-686",
    tier: "hard",
    topic: "s1",
    universe: "month-close",
    title: "The quiet tail of the census",
    brief:
      "From: Controller. Re: binder appendix figure.\n\nThe appendix merges the per-status order census with the per-region customer census and prints the three SMALLEST buckets — the quiet tail management reviews each close. Sort by count ascending, break ties by label, keep the top three.",
    ask: "Stack both censuses, order by count asc then label, keep the top 3.",
    template: `SELECT status AS v, COUNT(*) AS n FROM orders
GROUP BY status
UNION ALL
SELECT {1}, COUNT(*) FROM customers
GROUP BY region
ORDER BY 2 ASC, {2}
LIMIT {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "arm 2's label column",
        why: "The region census contributes EU 8, APAC 5, US 2, LATAM 1 to the merged pile.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the tie-break ordinal",
        why: "ORDER BY 2 ASC, 1 ranks by count, then alphabetically by the label column on ties.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the row cap",
        noVerify: true,
        why: "LIMIT 3 keeps the appendix figure to the three quietest buckets.",
      },
    ],
    distractors: ["city", "email", "created_at"],
    walkthrough:
      "The merged pile's quiet tail reads LATAM 1, US 2, APAC 5 — with cancelled (7) the first runner-up. Every arm-2 row surfaces here because ascending order dives past the 52 delivered orders straight to the small buckets; label the arm wrong and the tail prints city or email values instead of region names. The tie-break ordinal is written for reproducibility even though this eight-row pile happens to have no tied counts. LIMIT applies to the whole compound after its sort — a per-arm LIMIT would be a syntax error.",
  },
  {
    id: "cs-687",
    tier: "hard",
    topic: "s1",
    universe: "growth",
    title: "The exposure cohort, stacked",
    brief:
      "From: Growth analyst. Re: churn-risk list size.\n\nThe churn-risk cohort is everyone with a pending order UNION everyone the billing system has never invoiced. Dedup matters — some customers sit in both lists. One figure for the deck.",
    ask: "Count pending-order customers unioned with never-invoiced customers.",
    template: `SELECT {1}(*) AS cohort FROM (
  SELECT customer_id FROM orders WHERE status = {2}
  UNION
  SELECT id FROM customers
  WHERE id NOT IN (SELECT customer_id FROM {3}));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The deck wants the cohort's size as one figure.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Eight distinct customers hold the 14 pending orders.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the NOT IN source",
        why: "Five customers never appear in invoices.customer_id — the never-invoiced tail.",
      },
    ],
    distractors: ["SUM", "shipped", "payments"],
    walkthrough:
      "Pending customers (8) and never-invoiced customers (5) overlap by 2, so the deduplicated UNION prints 11 — the cohort size. Bare UNION is the honest operator here precisely because the lists overlap; UNION ALL would double-count the two people in both lists (14). Pointing arm 1 at shipped instead grows the pile to 14 (ten shipped customers plus the five un-invoiced, overlap three), and payments has no customer_id column to feed the NOT IN.",
  },
  {
    id: "cs-688",
    tier: "hard",
    topic: "s3",
    universe: "expense",
    title: "Shared accounting months",
    brief:
      "From: Finance partner. Re: calendar alignment proof.\n\nExpenses and ledger entries both span a fiscal window. Prove the two calendars align month-for-month: count the months that appear in BOTH the expense ledger and the general ledger.",
    ask: "Count months present in both expenses and ledger_entries.",
    template: `SELECT {1}(*) AS shared_months FROM (
  SELECT substr({2}, 1, 7) FROM expenses
  INTERSECT
  SELECT substr(entry_date, 1, 7) FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The alignment proof is a single figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "spent_on",
        kind: "keyword",
        label: "arm 1's date column",
        why: "Expenses date bookings in spent_on; substr(...,1,7) truncates to the YYYY-MM bucket.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 2's table",
        why: "The general ledger dates its rows in entry_date — the other calendar.",
      },
    ],
    distractors: ["SUM", "issued_on", "invoices"],
    walkthrough:
      "Both ledgers span 2024-01 through 2025-02 with no gaps: the intersection is exactly 14 months — full alignment, the proof the partner wanted. The month-bucket trick (substr to 7 characters) is what makes a date intersection meaningful; comparing full dates would collapse the answer to the 7 shared days. issued_on belongs to invoices, not expenses, and invoices has no entry_date — either wrong pick fails at prepare time.",
  },
  {
    id: "cs-689",
    tier: "hard",
    topic: "s2",
    universe: "month-close",
    title: "Three ledgers, three sums",
    brief:
      "From: Controller. Re: the reconciliation spine.\n\nThe close binder's spine is a three-row stack: gross order money, invoiced money, collected money — each labeled with its source, exact dollars. The three numbers tell the conversion story at a glance.",
    ask: "Stack labeled money sums for orders, invoices and payments.",
    template: `SELECT 'orders' AS src, ROUND(SUM(total), 2) AS money FROM orders
UNION ALL
SELECT 'invoices', ROUND({1}(amount_cents)/100.0, 2) FROM {2}
UNION ALL
SELECT 'payments', ROUND(SUM(amount_cents)/100.0, 2) FROM {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "arm 2's aggregator",
        why: "Invoiced money is the full 86,977.00 across all 28 invoices, void included.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "The paper ledger: 28 documents holding 86,977.00.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's table",
        why: "The cash ledger: 27 receipts totalling 69,612.00.",
      },
    ],
    distractors: ["COUNT", "MAX", "expenses"],
    walkthrough:
      "Three labeled rows: orders 34,833.28, invoices 86,977.00, payments 69,612.00. The story reads top to bottom: the storefront booked 34.8k gross, billing issued 87.0k across the period (invoices cover more than the displayed order window), and cash collected 69.6k — the 17.4k gap is the open balance. COUNT would print row counts divided by 100, MAX the single biggest document, and expenses would swap 25,416.00 of spend into a money ledger where it does not belong.",
  },
  {
    id: "cs-690",
    tier: "hard",
    topic: "s3",
    universe: "supplier",
    title: "Shared map vs raw pile",
    brief:
      "From: Expansion analyst. Re: footprint math.\n\nTwo figures for the slide: how many regions BOTH customers and suppliers cover (the shared map), and how many region rows exist if we just append the two tables raw. The contrast sells the dedup story.",
    ask: "Print the customers∩suppliers region count and the raw appended region rows.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT region FROM customers {1} SELECT region FROM {2})) AS shared_map,
  (SELECT COUNT(*) FROM (SELECT region FROM customers {3} SELECT region FROM suppliers)) AS raw_pile;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the shared-map operator",
        why: "Both tables cover all four regions, so the intersection is 4.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the shared probe's table",
        why: "Six suppliers spread across the same four regions.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the raw-pile operator",
        why: "Raw append keeps every row: 16 customer rows + 6 supplier rows = 22.",
      },
    ],
    distractors: ["EXCEPT", "payments", "city"],
    walkthrough:
      "One row, two figures: shared_map 4 (both sides cover EU, APAC, US, LATAM) and raw_pile 22 (16 + 6 unmerged rows). The slide's punchline: a bare UNION would collapse that 22-row pile right back to 4 — dedup erases 18 rows of repetition. EXCEPT in the first slot answers the complement (0 regions one side has and the other lacks), payments carries no region column, and city is not a table the compound could read from.",
  },
  {
    id: "cs-691",
    tier: "hard",
    topic: "s4",
    universe: "month-close",
    title: "Subtraction, both directions",
    brief:
      "From: Close analyst. Re: asymmetric vocabulary receipt.\n\nCities and order statuses are disjoint, but the binder wants the asymmetry quantified: how many customer cities are not status words, and how many status words are not cities. One row, two EXCEPTs.",
    ask: "Count cities∖statuses and statuses∖cities in one row.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT {1} FROM customers {2} SELECT {3} FROM orders)) AS keep,
  (SELECT COUNT(*) FROM (SELECT status FROM {4} EXCEPT SELECT city FROM customers)) AS lose;`,
    slots: [
      {
        answer: "city",
        kind: "keyword",
        label: "the keep probe's column",
        why: "Sixteen city names form the left side of the first subtraction.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the keep probe's operator",
        why: "Cities minus statuses keeps all 16 — the vocabularies share nothing.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the subtracted column",
        why: "The four lifecycle words are what the first probe removes.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the lose probe's table",
        why: "Statuses live on orders; their subtraction against cities keeps all 4.",
      },
    ],
    distractors: ["UNION", "region", "payments"],
    walkthrough:
      "One row, two receipts: keep 16 (every city survives subtracting status words) and lose 4 (every status word survives subtracting cities). Both directions are 'everything survives' — the definition of disjoint — but writing both proves it mechanically instead of by assertion. UNION would merge the piles (20) instead of subtracting, region swapped into the first probe shrinks it to the 4 regions, and payments has no status column for the second probe.",
  },
  {
    id: "cs-692",
    tier: "hard",
    topic: "s3",
    universe: "catalog",
    title: "Category vocabularies, three probes",
    brief:
      "From: Pricing lead. Re: the footnote, quantified.\n\nThe pricing memo's footnote needs all three numbers: how many product categories appear as expense categories (shared), how many are product-only, and — for the walkthrough — the deduplicated merge. Two probes in one row.",
    ask: "Count product∩expense categories and product-only categories in one row.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT category FROM products {1} SELECT category FROM {2})) AS shared,
  (SELECT COUNT(*) FROM (SELECT category FROM products {3} SELECT category FROM expenses)) AS product_only;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the shared probe's operator",
        why: "The two category vocabularies share nothing — the intersection is 0.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the shared probe's table",
        why: "Expense categories (Rent, Ads, Travel, Tools) are the comparison vocabulary.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the only probe's operator",
        why: "Products minus expenses keeps all 7 product families — 7.",
      },
    ],
    distractors: ["UNION", "suppliers", "UNION ALL"],
    walkthrough:
      "One row: shared 0, product_only 7 — the footnote's whole claim in two figures, with the deduplicated merge (11 = 7 + 4) quoted in the memo text. The zero intersection is what makes 'product-only' equal 'all of them': with no overlap, EXCEPT keeps everything. UNION in either probe would count the 11-value merge, UNION ALL the raw 52-row pile, and suppliers has no category column to compare against.",
  },
  {
    id: "cs-693",
    tier: "hard",
    topic: "s4",
    universe: "supplier",
    title: "The onboarding list, printed",
    brief:
      "From: Supplier auditor. Re: final print.\n\nThe audit closes with the onboarding list itself: every expense vendor that is not a supplier-table name, printed reverse-alphabetically for the sign-off sheet.",
    ask: "List expense vendors absent from supplier names, reverse-sorted.",
    template: `SELECT {1} FROM {2}
EXCEPT
SELECT name FROM suppliers
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "arm 1's column",
        why: "Expenses carry their payee in vendor — four distinct names.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 1's table",
        why: "The payee side of the audit: 36 bookings spread across four distinct vendors.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the ordinal sort key",
        why: "ORDER BY 1 DESC prints the survivors newest-name-first: Skyline Travel, DevTools Inc, Atlas Property GmbH, AdWorks Media.",
      },
    ],
    distractors: ["orders", "2", "src"],
    walkthrough:
      "Four rows in reverse alphabetical order: Skyline Travel, DevTools Inc, Atlas Property GmbH, AdWorks Media — the sign-off sheet's onboarding list. The zero overlap with supplier names is what makes every vendor survive. orders has no vendor column to read from, and the sort rejects both an out-of-range ordinal (2) and a chip that is not an output column (src).",
  },
  {
    id: "cs-694",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "The grammar probe, side by side",
    brief:
      "From: Data engineer. Re: runbook — the portable receipt.\n\nThe precedence page needs the comparison in ONE row: what SQLite returns for statuses UNION regions INTERSECT cities, next to the 4 the standard grammar promises. The gap is the receipt.",
    ask: "Print SQLite's reading of the mixed chain next to the standard's promised 4.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT status FROM orders
    UNION SELECT region FROM customers
    {1} SELECT {2} FROM customers)) AS sqlite_reading,
  {3} AS standard_reading;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the chain's mixed operator",
        why: "The junction under test: SQLite appends it AFTER the union, reading left to right.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names intersect the 8-value pile down to 0 — no city is named like a status or region.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the standard's promise",
        why: "Standard SQL reads INTERSECT first: statuses ∪ (regions ∩ cities) = 4 ∪ 0 = 4.",
      },
    ],
    distractors: ["EXCEPT", "region", "shipped_at"],
    walkthrough:
      "One row, the whole grammar story: sqlite_reading 0 (left-to-right: 8 ∩ 16 cities annihilates) against standard_reading 4 (INTERSECT-first would spare the regions). The 0-vs-4 gap is why the runbook bans mixed chains without subquery wraps. EXCEPT in the operator slot reads (8 ∖ 16) = 8, intersecting region instead of city keeps the 4 regions alive (8 ∩ 4 = 4), and shipped_at is not a customers column — the chain would not prepare.",
  },
  {
    id: "cs-695",
    tier: "hard",
    topic: "s5",
    universe: "month-close",
    title: "Three ledgers, one ranking",
    brief:
      "From: Controller. Re: the volume ranking.\n\nThe binder ranks every labeled bucket across three censuses — order statuses, customer regions, invoice statuses — by volume. Eleven rows, biggest first, alphabetical on ties.",
    ask: "Stack the three labeled censuses and rank by count desc, then label.",
    template: `SELECT {1} AS v, COUNT(*) AS n FROM orders
GROUP BY status
UNION ALL
SELECT {2}, COUNT(*) FROM customers
GROUP BY region
UNION ALL
SELECT status, COUNT(*) FROM {3}
GROUP BY status
ORDER BY n DESC, v;`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "arm 1's label column",
        why: "Delivered 52, shipped 30, pending 14, cancelled 7 open the ranking.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 2's label column",
        why: "EU 8, APAC 5, US 2, LATAM 1 slot in mid-table.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "Paid 21, open 6, void 1 complete the eleven-bucket ranking.",
      },
    ],
    distractors: ["region", "status", "payments"],
    walkthrough:
      "Eleven rows, biggest first: delivered 52, shipped 30, paid 21, pending 14, EU 8, cancelled 7, open 6, APAC 5, US 2, then the two 1s — LATAM before void on the alphabetical tie-break. The ranking's shape is the close's headline: fulfillment dominates volume, billing sits in the middle, and the tail ties need the label rule to be deterministic. Swapping either label column fails at prepare (the other table lacks it), and payments would trade the three invoice states for two methods, dropping the pile to ten rows.",
  },
  {
    id: "cs-696",
    tier: "hard",
    topic: "s4",
    universe: "funnel",
    title: "The region that never pends",
    brief:
      "From: Funnel analyst. Re: the LATAM receipt.\n\nLATAM orders always complete — no pending ever. Prove it with set semantics: subtract the pending-order regions from the delivered-order regions and count what survives.",
    ask: "Count delivered-order regions absent from pending-order regions.",
    template: `SELECT c.{1} FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = {2}
{3}
SELECT c.region FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
ORDER BY 1;`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "arm 1's output column",
        why: "The probe asks about regions, so both arms emit c.region.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Delivered orders span all four regions — including LATAM's two completed orders.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Delivered regions minus pending regions leaves exactly LATAM.",
      },
    ],
    distractors: ["city", "shipped", "INTERSECT"],
    walkthrough:
      "One row survives: LATAM — the region receipt that pending count there is zero (its 2 orders are both delivered). EU, APAC and US all cancel because pending orders exist in each. The join is what carries region onto orders; without it the compound has nothing to subtract. Swapping in shipped empties the answer (shipped also never touched LATAM — 0 regions survive), city would subtract cities and leave 7 of them, and INTERSECT would list the three always-pending regions instead.",
  },
  {
    id: "cs-697",
    tier: "hard",
    topic: "s1",
    universe: "month-close",
    title: "Status money, both ledgers",
    brief:
      "From: Controller. Re: the two-ledger status grid.\n\nOne grid, both ledgers: per-status order counts with their money, then per-status invoice counts with theirs — seven rows, biggest count first.",
    ask: "Stack the order status grid over the invoice status grid, biggest count first.",
    template: `SELECT status, COUNT(*) AS n, ROUND(SUM({1}), 2) AS money FROM orders
GROUP BY status
UNION ALL
SELECT status, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM {2}
GROUP BY status
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "arm 1's money column",
        why: "Order money lives in total: delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "The billing grid: open 6/19,609.00, paid 21/66,443.00, void 1/925.00.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC ranks by count: 52, 30, 21, 14, 7, 6, 1 — no ties to break.",
      },
    ],
    distractors: ["customer_id", "payments", "money"],
    walkthrough:
      "Seven rows: delivered 52, shipped 30, paid 21, pending 14, cancelled 7, open 6, void 1 — each carrying its ledger's money. The grid shows at a glance that the two status vocabularies never collide (four fulfillment words, three billing words) yet rank cleanly together. Summing customer_id would pour id integers into the money column, payments would swap the billing grid for two method rows, and sorting by money instead of count puts paid's 66,443.00 on top — a money ranking, not the briefed volume ranking.",
  },
  {
    id: "cs-698",
    tier: "hard",
    topic: "s4",
    universe: "expense",
    title: "The account roll call",
    brief:
      "From: Finance partner. Re: glossary appendix.\n\nThe appendix prints the ledger's account vocabulary verbatim — the four account names, none of which ever appear as an expense category. Alphabetical, exact, no counts.",
    ask: "List ledger accounts absent from expense categories, sorted.",
    template: `SELECT account FROM {1}
EXCEPT
SELECT category FROM {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 1's table",
        why: "The account vocabulary lives in ledger_entries across 80 postings.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "Expense categories (Rent, Ads, Travel, Tools) are the comparison set.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the ordinal sort key",
        why: "ORDER BY 1 alphabetizes: accounts_receivable, cash, operating_expenses, sales_revenue.",
      },
    ],
    distractors: ["INTERSECT", "payments", "2"],
    walkthrough:
      "Four rows: accounts_receivable, cash, operating_expenses, sales_revenue — the appendix's account roll call, untouched by the subtraction because ledger accounts and expense categories share no word. INTERSECT would print the 0 shared names and gut the appendix, payments has no account column, and ORDER BY 2 references a second output column that does not exist on a one-column compound.",
  },
  {
    id: "cs-699",
    tier: "hard",
    topic: "s3",
    universe: "supplier",
    title: "Till words, ledger words",
    brief:
      "From: Supplier auditor. Re: the disjointness receipt.\n\nThe audit's control check: payment methods and ledger accounts must stay disjoint vocabularies. Print the shared count and the merged-vocabulary count in one row — the pair proves the control holds.",
    ask: "Count payment methods ∩ ledger accounts and their deduplicated union.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT method FROM payments {1} SELECT account FROM {2})) AS shared,
  (SELECT COUNT(*) FROM (SELECT method FROM payments {3} SELECT account FROM ledger_entries)) AS vocab;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the shared probe's operator",
        why: "card and wire appear in no account name — the intersection is 0.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "the shared probe's table",
        why: "The account vocabulary: four names across 80 postings.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the vocab probe's operator",
        why: "The deduplicated merge: 2 methods + 4 accounts = 6 words.",
      },
    ],
    distractors: ["EXCEPT", "invoices", "UNION ALL"],
    walkthrough:
      "One row: shared 0 (the control holds — till words never equal account words) and vocab 6 (the full deduplicated vocabulary the glossary prints). The pair is the audit: zero sharing plus a six-word merge means no confusion is possible between what the till says and what the books say. EXCEPT in the first probe would answer 'methods absent from accounts' (2), UNION ALL would inflate the merge to the raw 107 rows (27 + 80), and invoices has no account column to probe.",
  },
  {
    id: "cs-700",
    tier: "hard",
    topic: "s5",
    universe: "month-close",
    title: "The pile that NULL keeps",
    brief:
      "From: Data engineer. Re: runbook — NULL groups.\n\nPending and cancelled orders have never shipped: both arms of this stack emit nothing but NULLs. Count what UNION returns for the two-NULL-pile stack — the receipt that NULL is a value set semantics dedups, not a row it drops.",
    ask: "Count the union of pending and cancelled shipping timestamps.",
    template: `SELECT {1}(*) AS n FROM (
  SELECT shipped_at FROM orders WHERE status = {2}
  UNION
  SELECT shipped_at FROM orders WHERE status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The runbook receipt is the size of the deduplicated pile.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "All 14 pending orders have shipped_at NULL — the first all-NULL arm.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "All 7 cancelled orders are also unshipped — the second all-NULL arm.",
      },
    ],
    distractors: ["SUM", "delivered", "shipped"],
    walkthrough:
      "The wrapped count prints 1: UNION treats the NULLs of both arms as one group, so 14 + 7 raw NULL rows collapse to a single NULL row. That is the runbook's receipt — set semantics NULL-groups, never NULL-drops. Pointing either arm at delivered or shipped would fetch real timestamps (those statuses are always shipped) and the pile would grow to their distinct counts plus the NULL. And SUM(*) is not SQL — the wrapper must be COUNT.",
  },
];

