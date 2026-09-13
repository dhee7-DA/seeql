// Case batch S5 — Module 3 (set ops & CASE) cases cs-801…cs-850.
// 50 cases: 16 easy / 17 medium / 17 hard across topics s1 (UNION stacks),
// s2 (Stacked reports), s3 (INTERSECT), s4 (EXCEPT), s5 (Set chains),
// s6 (CASE WHEN). Every figure was probed against the live seed db
// (scripts/m3-facts-s5w.ts + m3-facts-w2.ts) and is mechanically
// re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesS5: CaseStudy[] = [
  {
    id: "cs-801",
    tier: "easy",
    topic: "s1",
    universe: "fraud",
    title: "Five till words, three billing words",
    brief:
      "From: Fraud analyst. Re: the payment vocabulary audit.\n\nTwo controlled vocabularies need merging into one deduplicated list: the ways money comes in, and the states a bill can sit in. Stack them and count what the combined glossary holds.",
    ask: "Stack payment methods with invoice statuses, deduplicated and sorted.",
    template: `SELECT method AS v FROM {1}
{3}
SELECT status FROM invoices
ORDER BY v {2};`,
    slots: [
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 1's table",
        why: "The till vocabulary lives on payments — card and wire, two method words.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Alphabetical reads card, open, paid, void, wire — the glossary's filing order.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "One entry per word: UNION appends both arms and collapses any repeat.",
      },
    ],
    distractors: ["expenses", "DESC", "INTERSECT"],
    walkthrough:
      "Five rows: card, open, paid, void, wire. The two vocabularies share no word, so nothing dedups away — two till words plus three billing states. expenses would reach for spend words that have no method column and error out, INTERSECT would keep only shared words (there are none — zero rows), and DESC would file wire first. Five is the combined glossary's count.",
  },
  {
    id: "cs-802",
    tier: "easy",
    topic: "s1",
    universe: "catalog",
    title: "Two counters, one pile",
    brief:
      "From: Catalog lead. Re: the shelf-vs-supply snapshot.\n\nThe open slide needs two numbers stacked in one column: how many products we stock, how many suppliers feed them. Two labeled count arms, biggest first.",
    ask: "Stack the product count with the supplier count, largest first.",
    template: `SELECT 'catalog' AS src, COUNT(*) AS n FROM {1}
UNION ALL
SELECT 'supply', COUNT(*) FROM {2}
ORDER BY n {3};`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's table",
        why: "Sixteen products on the shelf — the catalog arm of the snapshot.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Six suppliers behind them — the supply arm of the snapshot.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC puts the sixteen catalog rows above the six supply rows.",
      },
    ],
    distractors: ["orders", "order_items", "ASC"],
    walkthrough:
      "Two rows: catalog 16, supply 6 — the whole snapshot in one column, biggest arm first. orders would count 103 fulfillment lines into the catalog arm and swamp the slide, customers would pad the supply arm to 16, and ASC would flip the reading order to 6 then 16. The 16-vs-6 spread is the shelf's leverage over its supply base.",
  },
  {
    id: "cs-803",
    tier: "easy",
    topic: "s1",
    universe: "growth",
    title: "Live and churned, stacked",
    brief:
      "From: Growth lead. Re: the account health split.\n\nThe board prep wants the customer base split into one stacked pair: accounts flagged live versus accounts flagged churned. Two arms, one column, labels included.",
    ask: "Stack the live-account count with the churned-account count.",
    template: `SELECT 'live' AS k, COUNT(*) AS n FROM {3} WHERE active = {1}
UNION ALL
SELECT 'churned', COUNT(*) FROM customers WHERE active = {2}
ORDER BY k;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        label: "the live flag",
        noVerify: true,
        why: "active = 1 marks accounts still buying — fourteen of them.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the churned flag",
        noVerify: true,
        why: "active = 0 marks the two accounts that stopped.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 1's table",
        why: "The active flag lives on the customers dimension — both arms read it there.",
      },
    ],
    distractors: ["2", "1", "orders"],
    walkthrough:
      "Two rows: churned 2, live 14 — the whole base split by the flag, filed alphabetically. Filling 2 for the live flag empties that arm (no account carries 2), filling 1 for the churned flag would brand all fourteen live accounts as churned, and orders has no active column to filter at all. 14-to-2 is the retention story in one stack.",
  },
  {
    id: "cs-804",
    tier: "easy",
    topic: "s1",
    universe: "month-close",
    title: "Ceiling and floor",
    brief:
      "From: Controller. Re: the range line for the close deck.\n\nThe close commentary opens with the widest single order of the period and the narrowest — the range the fulfillment team worked within. Two scalar arms stacked into one column.",
    ask: "Stack the biggest order total with the smallest.",
    template: `SELECT 'ceiling' AS k, ROUND(MAX(total), 2) AS v FROM orders
UNION ALL
SELECT {3}, ROUND({1}(total), 2) FROM {2}
ORDER BY v;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "arm 2's aggregate",
        why: "The floor line: the smallest order of the period, 25.47.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 2's table",
        why: "Order totals live on orders — the same table as the ceiling arm.",
      },
      {
        answer: "'floor'",
        kind: "keyword",
        label: "arm 2's label",
        why: "The stack reads ceiling above floor once sorted by value.",
      },
    ],
    distractors: ["SUM", "MAX", "order_items"],
    walkthrough:
      "Two rows: ceiling 1088.44, floor 25.47 — the full range of single-order sizes, smallest on top once sorted. SUM would collapse all 103 orders into 34833.28 and answer a totals question, MAX would mirror the ceiling line into the floor slot, and order_items has no total column to aggregate. A 43x spread between the two arms is the range line.",
  },
  {
    id: "cs-805",
    tier: "easy",
    topic: "s1",
    universe: "fraud",
    title: "Seven lifecycle words, one column",
    brief:
      "From: Fraud analyst. Re: the fulfillment-plus-billing glossary.\n\nThe glossary's second section merges fulfillment states with billing states — every lifecycle word the business uses, deduplicated, filed A to Z.",
    ask: "Stack order statuses with invoice statuses, deduplicated and sorted.",
    template: `SELECT status AS v FROM {1}
{3}
SELECT status FROM invoices
ORDER BY v {2};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "Four fulfillment words (pending, shipped, delivered, cancelled) live on orders.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Alphabetical files cancelled through void — the glossary's reading order.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "One row per word: UNION appends the two vocabularies and collapses repeats.",
      },
    ],
    distractors: ["expenses", "DESC", "INTERSECT"],
    walkthrough:
      "Seven rows: cancelled, delivered, open, paid, pending, shipped, void — four fulfillment words over three billing words, zero collisions. expenses carries no status column and errors, INTERSECT keeps only words both vocabularies share (none — the pile empties), and DESC files void first. Seven distinct words is the lifecycle glossary's full extent.",
  },
  {
    id: "cs-806",
    tier: "easy",
    topic: "s1",
    universe: "supplier",
    title: "Everyone we pay, A to Z",
    brief:
      "From: Supplier auditor. Re: the payee roll.\n\nThe audit opens with one deduplicated roll of every payee name: expense vendors and supplier companies merged into a single sorted column.",
    ask: "Stack expense vendors with supplier names, deduplicated and sorted.",
    template: `SELECT vendor AS v FROM expenses
{2}
SELECT {3} FROM suppliers
ORDER BY v {1};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z files AdWorks Media first and Skyline Travel last.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The roll lists each payee once; UNION appends and collapses any repeat.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "arm 2's name column",
        why: "Six supplier company names join the four vendor names.",
      },
    ],
    distractors: ["DESC", "INTERSECT", "region"],
    walkthrough:
      "Ten rows: four vendors plus six supplier companies with zero overlap, filed AdWorks Media through Skyline Travel. DESC would run the roll Z to A, INTERSECT keeps only names both sides share (none — the roll empties), and region would stack four region codes in place of six company names for a different roll of eight. Ten payees is the audit's full outbound money map.",
  },
  {
    id: "cs-807",
    tier: "easy",
    topic: "s2",
    universe: "expense",
    title: "The fixed floor and the growth line",
    brief:
      "From: Finance partner. Re: the fixed-vs-growth spend line.\n\nThe spend report leads with the two biggest recurring lines stacked together: what the office costs versus what promotion costs, labeled, biggest first.",
    ask: "Stack the Rent total with the Ads total, largest first.",
    template: `SELECT 'rent' AS k, ROUND(SUM(amount_cents)/100.0, 2) AS v FROM expenses WHERE category = {1}
UNION ALL
SELECT {3}, ROUND(SUM(amount_cents)/100.0, 2) FROM expenses WHERE category = {2}
ORDER BY v DESC;`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "arm 1's category filter",
        why: "Fourteen rent bookings to Atlas Property total 16,800.00.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "arm 2's category filter",
        why: "Fourteen ad bookings total 4,570.00 — the growth line.",
      },
      {
        answer: "'ads'",
        kind: "keyword",
        label: "arm 2's label",
        why: "The label names the line so the stack reads rent, then ads.",
      },
    ],
    distractors: ["'Tools'", "'Travel'", "'rent'"],
    walkthrough:
      "Two rows: rent 16,800.00, ads 4,570.00 — the fixed floor costs nearly four times the growth line. Tools would swap in 1,525.00 and Travel 2,521.00, both answering a different pair, and labeling the second arm 'rent' would file two identical labels in one stack. The 3.7x gap between the arms is the report's headline.",
  },
  {
    id: "cs-808",
    tier: "easy",
    topic: "s2",
    universe: "month-close",
    title: "The till ties out",
    brief:
      "From: Controller. Re: the collections tie-out line.\n\nThe close binder proves the till: card collections, wire collections, and the till total stacked in one column — where the third row must equal the first two added together.",
    ask: "Stack card money, wire money and the till total.",
    template: `SELECT 'card' AS k, ROUND(SUM(amount_cents)/100.0, 2) AS v FROM payments WHERE method = 'card'
UNION ALL
SELECT 'wire', ROUND(SUM(amount_cents)/100.0, 2) FROM payments WHERE method = {1}
UNION ALL
SELECT 'till total', ROUND(SUM(amount_cents)/100.0, 2) FROM {2}
ORDER BY v {3};`,
    slots: [
      {
        answer: "'wire'",
        kind: "keyword",
        label: "arm 2's method filter",
        why: "Eleven wire payments collected 32,248.00.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's table",
        why: "The till total is every payment row — no method filter at all.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files the 69,612.00 total first, then the two method arms.",
      },
    ],
    distractors: ["'card'", "invoices", "ASC"],
    walkthrough:
      "Three rows: till total 69,612.00, card 37,364.00, wire 32,248.00 — and the tie-out holds, because 37,364 plus 32,248 is exactly 69,612. Filling 'card' twice would list the card arm as both methods, invoices would sum billing money instead of collections for a different third row, and ASC would bury the total at the bottom. The binder's tie-out line is proven in three rows.",
  },
  {
    id: "cs-809",
    tier: "easy",
    topic: "s3",
    universe: "catalog",
    title: "Do the vocabularies touch?",
    brief:
      "From: Catalog lead. Re: the naming-collision check.\n\nMarketing claims shelf categories and spend categories never share a word. The check is one query: intersect the two vocabularies and count what survives.",
    ask: "Count the categories that appear in both products and expenses.",
    template: `SELECT {3} AS shared FROM (SELECT DISTINCT category FROM {1} INTERSECT SELECT DISTINCT category FROM {2});`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's table",
        why: "Seven shelf words — Accessories through Wearables — live on products.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "Four spend words — Ads, Rent, Tools, Travel — live on expenses.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the tally",
        why: "The deliverable is a count of shared words, not the words themselves.",
      },
    ],
    distractors: ["orders", "payments", "SUM(*)"],
    walkthrough:
      "One row: shared 0. The seven shelf words and four spend words are disjoint vocabularies, so the intersection is empty — marketing's claim holds. orders and payments have no category column to intersect and error out, and SUM(*) is not a legal tally of a word list. Zero is the cleanest possible audit answer.",
  },
  {
    id: "cs-810",
    tier: "easy",
    topic: "s3",
    universe: "funnel",
    title: "Regions both sides sell in",
    brief:
      "From: Growth lead. Re: the coverage map.\n\nThe board asks where our supply base and our customer base overlap geographically. Intersect the two region lists and file the answer A to Z.",
    ask: "List the regions shared by suppliers and customers, sorted.",
    template: `SELECT region AS v FROM suppliers
{2}
SELECT region FROM {1}
ORDER BY v {3};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Customer regions come from the demand side of the map.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Only regions present on BOTH sides survive the intersect.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z files APAC, EU, LATAM, US — the map's reading order.",
      },
    ],
    distractors: ["EXCEPT", "orders", "DESC"],
    walkthrough:
      "Four rows: APAC, EU, LATAM, US — the supply base and the demand base cover exactly the same four regions, so every supplier region survives the intersect. EXCEPT would flip the question to supplier regions absent from customers (none — zero rows), orders has no region to intersect, and DESC files US first. Full geographic overlap is the coverage story.",
  },
  {
    id: "cs-811",
    tier: "easy",
    topic: "s3",
    universe: "month-close",
    title: "Sixteen cities, mirrored",
    brief:
      "From: Controller. Re: the city dedup check.\n\nThe close binder's city appendix must list each shipping city once. The quickest proof: intersect the city list with itself and count what the mirror keeps.",
    ask: "Count the cities that survive when the city list is intersected with itself.",
    template: `SELECT COUNT(*) AS n FROM (SELECT {3} FROM customers {2} SELECT city FROM {1});`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "The mirror image of the city list is the same table, customers.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "A set intersected with itself keeps every distinct value once.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 1's column",
        why: "Sixteen distinct shipping cities are the appendix's raw material.",
      },
    ],
    distractors: ["UNION ALL", "EXCEPT", "suppliers"],
    walkthrough:
      "One row: n 16 — every customer sits in a distinct city, so the self-intersect keeps all sixteen, deduplicated. UNION ALL would stack both lists for 32, EXCEPT would keep what the first list has that the second lacks (nothing — zero), and suppliers has no city column to mirror. Sixteen distinct cities is the appendix's count.",
  },
  {
    id: "cs-812",
    tier: "easy",
    topic: "s4",
    universe: "refund-audit",
    title: "Billing words the warehouse never says",
    brief:
      "From: Refund auditor. Re: the vocabulary drift memo.\n\nBilling grew its own states — open, paid, void — while fulfillment kept pending, shipped, delivered, cancelled. Isolate the billing-only words in one query.",
    ask: "List the invoice statuses that never appear as order statuses.",
    template: `SELECT status AS v FROM {1}
{2}
SELECT status FROM orders
ORDER BY v {3};`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 1's table",
        why: "The billing vocabulary lives on the invoices ledger.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the difference operator",
        why: "EXCEPT keeps billing words that no order status shares.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z files open, paid, void — the memo's word list.",
      },
    ],
    distractors: ["payments", "INTERSECT", "DESC"],
    walkthrough:
      "Three rows: open, paid, void — the entire billing vocabulary is foreign to fulfillment, so every invoice status survives the difference. payments has no status column and errors, INTERSECT keeps only shared words (none — the list empties), and DESC files void first. Three orphaned words is the drift memo's whole point.",
  },
  {
    id: "cs-813",
    tier: "easy",
    topic: "s4",
    universe: "catalog",
    title: "Spend words the shelf never stocks",
    brief:
      "From: Catalog lead. Re: the category-wall check.\n\nThe wall chart wants the spend-only vocabulary: expense categories that no product on the shelf carries. One difference query, filed A to Z.",
    ask: "List the expense categories that never appear as product categories.",
    template: `SELECT category AS v FROM {1}
{2}
SELECT category FROM products
ORDER BY v {3};`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 1's table",
        why: "Ads, Rent, Tools, Travel — the spend words come from expenses.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the difference operator",
        why: "EXCEPT strips any spend word that a shelf category shares.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z files Ads, Rent, Tools, Travel on the chart.",
      },
    ],
    distractors: ["suppliers", "INTERSECT", "DESC"],
    walkthrough:
      "Four rows: Ads, Rent, Tools, Travel — the shelf's seven categories share no word with the spend ledger, so all four survive. suppliers has no category column and errors, INTERSECT would keep the shared words (none — the chart empties), and DESC files Travel first. Four spend-only words is the wall chart's answer.",
  },
  {
    id: "cs-814",
    tier: "easy",
    topic: "s6",
    universe: "funnel",
    title: "Who's still on, by region",
    brief:
      "From: Growth lead. Re: the regional health grid.\n\nThe grid needs one row per region with two flag-driven columns: accounts still live, accounts gone. A CASE inside SUM counts each flag without a single join.",
    ask: "Pivot customers by region into live and gone columns.",
    template: `SELECT region,
       SUM(CASE WHEN active = {1} THEN 1 ELSE 0 END) AS live,
       SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS gone
FROM customers
GROUP BY {2}
ORDER BY region {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        label: "the live flag",
        why: "active = 1 marks the fourteen live accounts the live column counts.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the grouping key",
        why: "One row per region — the grid's row axis.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z files APAC, EU, LATAM, US down the grid.",
      },
    ],
    distractors: ["0", "2", "city", "DESC"],
    walkthrough:
      "Four rows: APAC 4 live / 1 gone, EU 7 / 1, LATAM 1 / 0, US 2 / 0. Filling 0 would make the live column count churned accounts instead, filling 2 counts nobody, grouping by city would shred the grid into sixteen rows, and DESC files US first. EU's seven live accounts carry the board's regional story.",
  },
  {
    id: "cs-815",
    tier: "easy",
    topic: "s6",
    universe: "expense",
    title: "Big tickets vs the rest",
    brief:
      "From: Finance partner. Re: the spend-shape line.\n\nOne banding line for the report: bookings of 1,000.00 or more versus everything below. A two-way CASE buckets all 36 bookings into exactly two rows.",
    ask: "Bucket expenses into big (1,000.00+) and small, with counts.",
    template: `SELECT CASE WHEN amount_cents >= {3} THEN 'big' ELSE {2} END AS band, COUNT(*) AS n FROM expenses GROUP BY {1} ORDER BY band;`,
    slots: [
      {
        answer: "band",
        kind: "keyword",
        label: "the grouping key",
        why: "Grouping by the CASE output collapses 36 bookings into two buckets.",
      },
      {
        answer: "'small'",
        kind: "keyword",
        label: "the else label",
        why: "Twenty-one bookings land under the 1,000.00 line and file as small.",
      },
      {
        answer: "100000",
        kind: "number",
        label: "the big-ticket threshold",
        noVerify: true,
        why: "1,000.00 in cents — the line above which fifteen bookings sit.",
      },
    ],
    distractors: ["amount_cents", "'tiny'", "1000000"],
    walkthrough:
      "Two rows: big 15, small 21 — the spend ledger's shape in one line. Grouping by amount_cents would refuse to collapse anything into buckets (36 rows), renaming the else label to 'tiny' changes the report's vocabulary, and a threshold of 10,000.00 leaves no big ticket at all. Fifteen big bookings carry over 60% of the ledger's money.",
  },
  {
    id: "cs-816",
    tier: "easy",
    topic: "s6",
    universe: "growth",
    title: "First half vs second half",
    brief:
      "From: Growth lead. Re: the seasonality split.\n\nThe deck splits the order book at mid-year: everything booked through June in one bucket, the rest in the other, with booked money per bucket.",
    ask: "Split orders into H1 (months 01–06) and H2 with summed totals.",
    template: `SELECT CASE WHEN substr(created_at, 6, 2) <= {1} THEN 'H1' ELSE 'H2' END AS half,
       ROUND(SUM(total), 2) AS money
FROM {3}
GROUP BY half
ORDER BY half {2};`,
    slots: [
      {
        answer: "'06'",
        kind: "keyword",
        label: "the mid-year cutoff",
        why: "Month 06 is June — orders booked through it land in H1.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Chronological files H1 before H2 — the split reads forward.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the table",
        why: "Booked money lives on orders — 103 rows to split.",
      },
    ],
    distractors: ["'08'", "DESC", "order_items"],
    walkthrough:
      "Two rows: H1 21,445.37, H2 13,387.91 — the first half carries about 62% of the year's bookings. Moving the cutoff to month 08 pulls the third quarter into H1 (28,107.34), DESC flips the reading order, and order_items has no created_at timeline to split. The first-half tilt is the seasonality headline.",
  },
  {
    id: "cs-817",
    tier: "medium",
    topic: "s1",
    universe: "refund-audit",
    title: "Paid, open, void — and the whole book",
    brief:
      "From: Refund auditor. Re: the billing-state reconciliation.\n\nThe reconciliation stacks all three billing states' money and then the book total, so the first three rows must add to the fourth. Four arms, one column, largest first.",
    ask: "Stack paid, open and void invoice money, then the invoiced total.",
    template: `SELECT {1} AS k, ROUND(SUM(amount_cents)/100.0, 2) AS v FROM invoices WHERE status = 'paid'
UNION ALL
SELECT 'open', ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE status = 'open'
UNION ALL
SELECT 'void', ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE {2} = 'void'
UNION ALL
SELECT 'all in', ROUND(SUM(amount_cents)/100.0, 2) FROM invoices
ORDER BY v {3};`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Twenty-one paid invoices hold 66,443.00 — the collected line.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "arm 3's filter column",
        why: "The void line filters on status — one booking, 925.00, written off.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files the 86,977.00 book total first, states underneath.",
      },
    ],
    distractors: ["'open'", "due_on", "ASC"],
    walkthrough:
      "Four rows: all in 86,977.00, paid 66,443.00, open 19,609.00, void 925.00 — and the tie-out holds: 66,443 plus 19,609 plus 925 is exactly 86,977. Labeling the paid arm 'open' would duplicate the open line and break the stack's grammar, filtering voids on due_on matches no date string (NULL money), and ASC buries the total last. The billing book reconciles to the cent.",
  },
  {
    id: "cs-818",
    tier: "medium",
    topic: "s1",
    universe: "growth",
    title: "Two vintages and the whole flow",
    brief:
      "From: Growth lead. Re: the cohort vintage note.\n\nThe funnel deck dates every order: 2024 bookings, 2025 bookings, and the unsplit flow total stacked beneath them as the control line.",
    ask: "Stack 2024 orders, 2025 orders and the all-time count.",
    template: `SELECT 'y2024' AS k, COUNT(*) AS n FROM orders WHERE created_at LIKE {1}
UNION ALL
SELECT 'y2025', COUNT(*) FROM orders WHERE created_at LIKE '2025%'
UNION ALL
SELECT 'every line', COUNT(*) FROM {2}
ORDER BY n {3};`,
    slots: [
      {
        answer: "'2024%'",
        kind: "keyword",
        label: "arm 1's year pattern",
        why: "The 2024 pattern matches ninety of the 103 bookings.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 3's table",
        why: "The control line counts every order row — no year filter.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files the 103-line control first, vintages underneath.",
      },
    ],
    distractors: ["'2025%'", "customers", "ASC"],
    walkthrough:
      "Three rows: every line 103, y2024 90, y2025 13 — the control line equals the two vintages added, 90 plus 13. Matching '2025%' in the first arm would duplicate the 2025 line and break the stack, counting customers instead of orders answers a different control (16), and ASC buries the control at the bottom. 2024 carried the year: 90 of 103 bookings.",
  },
  {
    id: "cs-819",
    tier: "medium",
    topic: "s2",
    universe: "inventory",
    title: "Four regions, counted per arm",
    brief:
      "From: Inventory controller. Re: the demand-map stack.\n\nThe stock plan weights each region by order volume. Four labeled arms — one per region — each joining orders to customers on its own aliases, largest first.",
    ask: "Stack per-region order counts for EU, APAC, US and LATAM.",
    template: `SELECT 'EU' AS k, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU'
UNION ALL
SELECT 'APAC', COUNT(*) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE c2.region = {1}
UNION ALL
SELECT 'US', COUNT(*) FROM orders o3 JOIN customers c3 ON c3.id = {2} WHERE c3.region = 'US'
UNION ALL
SELECT 'LATAM', COUNT(*) FROM orders o4 JOIN customers c4 ON c4.id = o4.customer_id WHERE c4.region = 'LATAM'
ORDER BY n {3};`,
    slots: [
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "arm 2's region filter",
        why: "APAC customers booked 37 orders — the second-largest arm.",
      },
      {
        answer: "o3.customer_id",
        kind: "keyword",
        label: "arm 3's join key",
        why: "Each arm must join order customer to customer id — o3.customer_id = c3.id.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files EU 45 first, LATAM 2 last — the demand map's order.",
      },
    ],
    distractors: ["'EU'", "o3.id", "ASC"],
    walkthrough:
      "Four rows: EU 45, APAC 37, US 19, LATAM 2 — 103 bookings split by demand geography. Filling 'EU' in the APAC arm would double-count Europe and leave Asia missing, joining on o3.id would match order ids to customer ids (a coincidence, not a relationship — at most two stray rows), and ASC would file LATAM first. EU plus APAC hold 80% of demand.",
  },
  {
    id: "cs-820",
    tier: "medium",
    topic: "s2",
    universe: "month-close",
    title: "Regions and lifecycles, one ledger",
    brief:
      "From: Controller. Re: the two-axis money note.\n\nOne stack carries both cuts of booked money: four region rows, then four lifecycle rows, each labeled with its kind. Eight rows, richest first.",
    ask: "Stack order money by region, then by status, labeled per kind.",
    template: `SELECT 'region' AS kind, region AS key, ROUND(SUM(total), 2) AS money FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY {3}
UNION ALL
SELECT {1}, status, ROUND(SUM(total), 2) FROM orders GROUP BY status
ORDER BY money {2};`,
    slots: [
      {
        answer: "'lifecycle'",
        kind: "keyword",
        label: "arm 2's kind label",
        why: "The second arm's four rows file under 'lifecycle' so kinds stay distinct.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC surfaces delivered 15,571.07 — the stack's biggest line.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 1's grouping key",
        why: "Four region groups feed the stack's first half.",
      },
    ],
    distractors: ["'region'", "ASC", "city"],
    walkthrough:
      "Eight rows: delivered 15,571.07, EU 15,089.23, shipped 11,996.72, APAC 11,605.45, US 7,286.16, pending 6,113.00, cancelled 1,152.49, LATAM 852.44. Labeling the second arm 'region' would blur the two cuts into twelve ambiguous rows, ASC would start from LATAM's 852.44, and grouping by city would shred the region cut into sixteen lines. Two axes, one ledger, delivered on top.",
  },
  {
    id: "cs-821",
    tier: "medium",
    topic: "s2",
    universe: "expense",
    title: "The books balance, three ways",
    brief:
      "From: Finance partner. Re: the double-entry proof line.\n\nThe close binder proves the books balance with one stacked line: money moved in, money moved out, and what physically left cash — where the first two must agree.",
    ask: "Stack total debits, total credits and the cash outflow.",
    template: `SELECT 'moved_in' AS k, ROUND(SUM(CASE WHEN debit_cents > 0 THEN debit_cents ELSE 0 END)/100.0, 2) AS v FROM {3}
UNION ALL
SELECT 'moved_out', ROUND(SUM(CASE WHEN credit_cents > 0 THEN credit_cents ELSE 0 END)/100.0, 2) FROM ledger_entries
UNION ALL
SELECT {4}, ROUND(SUM(CASE WHEN account = {1} THEN debit_cents ELSE 0 END)/100.0, 2) FROM ledger_entries
ORDER BY v {2};`,
    slots: [
      {
        answer: "'cash'",
        kind: "keyword",
        label: "the cash account filter",
        why: "Cash debits — 69,612.00 — are the money that physically left the till.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files the two 181,080.00 book lines above the cash line.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 1's table",
        why: "All eighty double-entry rows live on ledger_entries.",
      },
      {
        answer: "'cash_out'",
        kind: "keyword",
        label: "arm 3's label",
        why: "The cash line files under 'cash_out' so the three reads stay distinct.",
      },
    ],
    distractors: ["'sales_revenue'", "'operating_expenses'", "ASC", "expenses"],
    walkthrough:
      "Three rows: moved_in 181,080.00, moved_out 181,080.00, cash_out 69,612.00 — the first two tie to the cent, which is the double-entry proof itself. Revenue debits nothing (a 0.00 cash line), operating_expenses would price the outflow at 25,416.00, ASC would lead with the smallest line, and expenses has no debit_cents column to sum. The books balance, and the till shows through.",
  },
  {
    id: "cs-822",
    tier: "medium",
    topic: "s3",
    universe: "growth",
    title: "Waiting on a repeat",
    brief:
      "From: Growth lead. Re: the re-order signal.\n\nThe re-order signal counts customers sitting in two states at once: a delivered order in the past, a pending order right now. Two distinct-customer arms, intersected.",
    ask: "Count customers who have both a delivered and a pending order.",
    template: `SELECT COUNT(*) AS both_kinds FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = {1}
  {3}
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
);`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 1's status",
        why: "The past: customers with at least one delivered order — fifteen of them.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 2's status",
        why: "The present: eight customers currently wait on a pending order.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Only customer ids present in BOTH arms count as the signal.",
      },
    ],
    distractors: ["'shipped'", "'cancelled'", "UNION"],
    walkthrough:
      "One row: both_kinds 8 — every waiting customer has also completed an order, so the overlap equals the whole pending crowd. Shipped-and-pending overlaps five, cancelled-and-pending four, and UNION would count the combined crowd of 15 — a bigger, wrong number. The signal is total: all eight waiters are repeat buyers.",
  },
  {
    id: "cs-823",
    tier: "medium",
    topic: "s3",
    universe: "fraud",
    title: "Four accounts order, then cancel",
    brief:
      "From: Fraud analyst. Re: the cancel-pattern cohort.\n\nThe pattern to isolate: customers who completed at least one order AND also cancelled one — buyers who flipped. Two arms, intersected, tallied.",
    ask: "Count customers with both a cancelled and a delivered order.",
    template: `SELECT COUNT(*) AS repeat_offenders FROM (
  SELECT DISTINCT {3} AS v FROM orders WHERE status = {1}
  {2}
  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
);`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "arm 1's status",
        why: "The flip: four customers carry a cancelled order.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "The cohort needs BOTH marks — cancelled and delivered.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "arm 1's identity column",
        why: "Customers are keyed by customer_id — ids would count orders, not people.",
      },
    ],
    distractors: ["'pending'", "UNION", "id"],
    walkthrough:
      "One row: repeat_offenders 4 — customers 1, 5, 11 and 13 both bought and bailed. Pending-and-delivered overlaps eight (a different cohort), UNION would count fifteen combined customers, and selecting raw id would intersect order ids — a different id space that shares nobody. Four flippers is the pattern's size.",
  },
  {
    id: "cs-824",
    tier: "medium",
    topic: "s3",
    universe: "supplier",
    title: "The top shared id",
    brief:
      "From: Supplier auditor. Re: the id-collision ceiling.\n\nCustomer and supplier records both number from 1, so some ids collide. The audit's headline: the highest id both tables share.",
    ask: "Find the largest id that exists in both customers and suppliers.",
    template: `SELECT {3}(v) AS top FROM (SELECT id AS v FROM customers {2} SELECT id FROM {1});`,
    slots: [
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Six supplier rows, ids 1–6, form the smaller id space.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Only ids present in BOTH tables survive the intersect.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the headline aggregate",
        why: "The ceiling of the shared range — not its floor or its sum.",
      },
    ],
    distractors: ["orders", "EXCEPT", "MIN", "SUM"],
    walkthrough:
      "One row: top 6 — supplier ids 1 through 6 all collide with customer ids, so the shared range tops out at 6. Intersecting orders instead widens the shared range to 16 (order ids cover 1–103), EXCEPT keeps customer-only ids and tops out at 16 too, MIN sinks the headline to 1, and SUM answers 21 — the range's total, not its ceiling.",
  },
  {
    id: "cs-825",
    tier: "medium",
    topic: "s4",
    universe: "growth",
    title: "Quiet days on the calendar",
    brief:
      "From: Growth lead. Re: the ops-calendar note.\n\nOrders booked on 84 distinct dates; expenses hit 36. The note counts the order dates where no expense ever landed — days the books stayed quiet on the spend side.",
    ask: "Count order dates that never coincide with an expense date.",
    template: `SELECT COUNT(*) AS quiet FROM (SELECT DISTINCT {3} AS v FROM orders {1} SELECT spent_on FROM {2});`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the difference operator",
        why: "Quiet days are order dates MINUS the dates expenses landed.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "Expense dates live on the expenses ledger — 36 bookings.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "arm 1's date column",
        why: "Order booking dates come from created_at — 84 distinct values.",
      },
    ],
    distractors: ["INTERSECT", "payments", "id"],
    walkthrough:
      "One row: quiet 77 — only seven order dates ever coincide with a spend date (2024-01-01 through 2025-01-01), leaving 84 minus 7 quiet days. INTERSECT answers the opposite question (7 shared dates), payments has no spent_on column to differ with, and order ids instead of dates would answer 103. 77 quiet days is the calendar note.",
  },
  {
    id: "cs-826",
    tier: "medium",
    topic: "s4",
    universe: "month-close",
    title: "Till words the bill never speaks",
    brief:
      "From: Controller. Re: the vocabulary gap line.\n\nThe close binder flags vocabulary drift between the till and the ledger: method words that never appear as invoice statuses. Two survive — name them.",
    ask: "List the payment methods that never appear as invoice statuses.",
    template: `SELECT v FROM (SELECT method AS v FROM {1} {2} SELECT status FROM invoices) ORDER BY v {3};`,
    slots: [
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 1's table",
        why: "Method words — card, wire — come from the payments till.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the difference operator",
        why: "The gap is methods MINUS the words billing uses.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "A to Z files card, then wire — the gap line's order.",
      },
    ],
    distractors: ["orders", "INTERSECT", "UNION", "DESC"],
    walkthrough:
      "Two rows: card, wire — neither till word ever labels an invoice, whose vocabulary stops at open, paid, void. orders has no method column and errors, INTERSECT keeps only shared words (none — zero rows), UNION merges both vocabularies into five, and DESC files wire first. Two orphaned till words is the drift line.",
  },
  {
    id: "cs-827",
    tier: "medium",
    topic: "s4",
    universe: "refund-audit",
    title: "Billed and calm",
    brief:
      "From: Refund auditor. Re: the low-drama cohort.\n\nThe audit's calm cohort: customers who have been billed at least once but currently hold no pending order — money settled, nothing in flight.",
    ask: "Count invoiced customers with no pending order.",
    template: `SELECT COUNT(*) AS billed_calm FROM (
  SELECT DISTINCT {3} AS v FROM {1}
  {2}
  SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
);`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 1's table",
        why: "Eleven customers have been billed — the cohort's base.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the difference operator",
        why: "Calm means billed MINUS the eight currently waiting.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "arm 1's identity column",
        why: "Billing attaches to customers through customer_id.",
      },
    ],
    distractors: ["orders", "INTERSECT", "id"],
    walkthrough:
      "One row: billed_calm 5 — of eleven billed customers, six currently wait on a pending order, leaving five calm. Counting orders instead of invoices widens the base to all sixteen customers (eight calm by that reckoning), INTERSECT answers the in-flight crowd (six), and invoice ids instead of customer ids would count 20 billing documents. Five calm accounts is the cohort's size.",
  },
  {
    id: "cs-828",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "The sweep at the end",
    brief:
      "From: Fraud analyst. Re: the ALL-chain trap.\n\nThree identical status arms ride UNION ALL into a huge pile — then one final UNION hits a second vocabulary and sweeps the whole accumulation deduplicated. What survives the sweep?",
    ask: "Count the distinct words after three ALL-chained status arms meet supplier regions.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT status FROM orders
  UNION ALL
  SELECT status FROM orders
  UNION ALL
  SELECT status FROM orders
  {1}
  SELECT {3} FROM {2}
);`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "the sweeping operator",
        why: "The final UNION dedups the ENTIRE accumulated pile, not just its neighbor.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 4's table",
        why: "Supplier regions join the pile — six rows over four region words.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 4's column",
        why: "Four region words (EU, US, APAC, LATAM) ride in on the last arm.",
      },
    ],
    distractors: ["UNION ALL", "expenses", "name"],
    walkthrough:
      "One row: n 8 — four status words plus four region words. The three ALL-chained arms pile up 309 rows, but the trailing UNION sweeps the whole left side at once: pure ALL all the way would leave 315 raw rows. expenses and orders carry no region column and error out, and supplier names would ride in instead for a pile of ten. The sweep is global — that is the ALL-chain lesson.",
  },
  {
    id: "cs-829",
    tier: "medium",
    topic: "s5",
    universe: "month-close",
    title: "Where engines disagree",
    brief:
      "From: Controller. Re: the portability landmine.\n\nOne chain — order statuses UNION supplier-style regions INTERSECT something city-sized — returns different answers on different engines. On THIS database, run it as SQLite reads it: strictly left to right.",
    ask: "Evaluate statuses UNION regions INTERSECT cities the SQLite way.",
    template: `SELECT COUNT(*) AS sqlite_says FROM (
  SELECT status AS v FROM orders
  UNION
  SELECT region FROM customers
  {1}
  SELECT {2} FROM {3}
);`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the chain's second operator",
        why: "The landmine: UNION then INTERSECT in one unparenthesized chain.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city words form the arm the INTERSECT must survive.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 3's table",
        why: "The sixteen city words live on the customers dimension.",
      },
    ],
    distractors: ["EXCEPT", "region", "suppliers"],
    walkthrough:
      "One row: sqlite_says 0. SQLite folds left to right — (statuses ∪ regions) ∩ cities — and no status or region word is a city name, so the intersect empties everything. A standards-first engine would read statuses ∪ (regions ∩ cities) and answer 4. EXCEPT would keep eight words, and intersecting regions instead of cities survives with four. Same text, two engines, two answers — never ship a mixed chain.",
  },
  {
    id: "cs-830",
    tier: "medium",
    topic: "s5",
    universe: "supplier",
    title: "Two regions out of the roll",
    brief:
      "From: Supplier auditor. Re: the coverage gap chain.\n\nThe roll of customer names shrinks twice in one chain: first Europe's names drop, then Asia-Pacific's. Whoever survives sits in the smallest regions.",
    ask: "Count customers outside both EU and APAC via one EXCEPT chain.",
    template: `SELECT COUNT(*) AS leftovers FROM (
  SELECT name FROM customers
  {3}
  SELECT name FROM customers WHERE region = {1}
  EXCEPT
  SELECT name FROM customers WHERE region = {2}
);`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "arm 2's region filter",
        why: "Eight European customers drop out first.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "arm 3's region filter",
        why: "Five Asia-Pacific customers drop out second.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the chain's first operator",
        why: "Each EXCEPT strips its arm's names from the surviving roll.",
      },
    ],
    distractors: ["'US'", "'LATAM'", "UNION", "INTERSECT"],
    walkthrough:
      "One row: leftovers 3 — Bruno Silva, Emma Wilson and Jamal Wright live outside both stripped regions (the two US accounts and one LATAM account). Filling 'US' would strip the wrong two first, 'LATAM' likewise, UNION would grow the roll back to all sixteen, and INTERSECT would keep only names in BOTH regions — nobody. A two-step EXCEPT chain is the coverage gap in one query.",
  },
  {
    id: "cs-831",
    tier: "medium",
    topic: "s6",
    universe: "pricing",
    title: "Three shelves for sixteen products",
    brief:
      "From: Pricing lead. Re: the ladder check.\n\nThe price ladder has three shelves: premium at 100.00 and up, core from 50.00, budget below. A two-threshold CASE sorts all sixteen products in one pass.",
    ask: "Band products into premium (100+), core (50+) and budget, with counts.",
    template: `SELECT CASE WHEN price >= {1} THEN 'premium' WHEN price >= {2} THEN 'core' ELSE 'budget' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY {3};`,
    slots: [
      {
        answer: "100",
        kind: "number",
        label: "the premium threshold",
        noVerify: true,
        why: "Four products price at 100.00 or more — the top shelf.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the core threshold",
        noVerify: true,
        why: "Four more products sit between 50.00 and 100.00 — the middle shelf.",
      },
      {
        answer: "band",
        kind: "keyword",
        label: "the sort key",
        why: "Sorting by the CASE output files budget, core, premium up the ladder.",
      },
    ],
    distractors: ["200", "10", "n"],
    walkthrough:
      "Three rows: budget 8, core 4, premium 4 — the shelf's shape, filed up the ladder. Moving the top threshold to 200.00 empties the premium shelf (nothing prices that high), dropping the middle to 10.00 empties budget entirely, and sorting by count would float the four-item shelves above the eight-item floor. Eight budget items are the volume; the four premium items are the margin.",
  },
  {
    id: "cs-832",
    tier: "medium",
    topic: "s6",
    universe: "inventory",
    title: "Stock depth bands",
    brief:
      "From: Inventory controller. Re: the restock triage.\n\nTriage sorts the shelf three ways: deep stock at 200 units and up, mid from 100, lean below. One CASE bands all sixteen products for the restock list.",
    ask: "Band products into deep (200+), mid (100+) and lean stock, with counts.",
    template: `SELECT CASE WHEN stock >= {1} THEN 'deep' WHEN stock >= {2} THEN 'mid' ELSE {3} END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY band DESC;`,
    slots: [
      {
        answer: "200",
        kind: "number",
        label: "the deep threshold",
        noVerify: true,
        why: "Six products hold 200 units or more — the deep shelf.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the mid threshold",
        noVerify: true,
        why: "Four more products sit between 100 and 200 units.",
      },
      {
        answer: "'lean'",
        kind: "keyword",
        label: "the else label",
        why: "Six products run below 100 units and file as lean.",
      },
    ],
    distractors: ["300", "40", "'thin'"],
    walkthrough:
      "Three rows: lean 6, mid 4, deep 6 — filed heavy-side first by the DESC. A 300-unit deep line would empty the top shelf (nothing stocks that deep), a 40-unit mid line would swallow the lean shelf entirely (ten mid, zero lean), and renaming the else label to 'thin' breaks the triage's vocabulary. Six lean items head the restock list.",
  },
  {
    id: "cs-833",
    tier: "medium",
    topic: "s6",
    universe: "month-close",
    title: "Billing's two halves",
    brief:
      "From: Controller. Re: the half-year billing split.\n\nThe close binder splits all 28 invoices at mid-year: count and money per half, filed H1 then H2. One CASE on the issue month does the split.",
    ask: "Split invoices into H1 and H2 with counts and summed money.",
    template: `SELECT CASE WHEN substr(issued_on, 6, 2) <= {1} THEN 'H1' ELSE 'H2' END AS half,
       COUNT(*) AS n, ROUND(SUM({3})/100.0, 2) AS money
FROM invoices GROUP BY {2} ORDER BY half;`,
    slots: [
      {
        answer: "'06'",
        kind: "keyword",
        label: "the mid-year cutoff",
        why: "Month 06 is June — invoices issued through it file as H1.",
      },
      {
        answer: "half",
        kind: "keyword",
        label: "the grouping key",
        why: "Grouping by the CASE output collapses 28 invoices into two halves.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "Invoice money lives in amount_cents — divided by 100 for dollars.",
      },
    ],
    distractors: ["'01'", "issued_on", "id"],
    walkthrough:
      "Two rows: H1 14 invoices for 46,699.00, H2 14 for 40,278.00 — a perfect count split with the first half also richer by 6,421.00. Cutting at month 01 would leave H1 empty (no January invoices exist), grouping by the raw issued_on date would refuse to collapse anything (fourteen groups), and summing ids instead of amounts answers 4.06. H1 leads on money despite the dead-even count.",
  },
  {
    id: "cs-834",
    tier: "hard",
    topic: "s1",
    universe: "month-close",
    title: "Three ceilings, one ladder",
    brief:
      "From: Controller. Re: the exposure ladder.\n\nThe close deck stacks the single biggest artifact of each ledger — biggest order, biggest invoice, biggest expense — one labeled arm each, tallest first.",
    ask: "Stack the MAX of order totals, invoice amounts and expense amounts.",
    template: `SELECT 'order' AS k, ROUND(MAX(total), 2) AS v FROM orders
UNION ALL
SELECT 'invoice', ROUND({1}(amount_cents)/100.0, 2) FROM invoices
UNION ALL
SELECT {4}, ROUND(MAX({2})/100.0, 2) FROM {3}
ORDER BY v DESC;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "arm 2's aggregate",
        why: "The biggest single invoice: 6,148.00 — the ladder's top rung.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 3's money column",
        why: "Expense money lives in amount_cents — divided by 100 for dollars.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 3's table",
        why: "The third ceiling comes from the expenses ledger.",
      },
      {
        answer: "'expense'",
        kind: "keyword",
        label: "arm 3's label",
        why: "Each rung names its ledger — order, invoice, expense.",
      },
    ],
    distractors: ["MIN", "id", "order_items", "'invoice'"],
    walkthrough:
      "Three rows: invoice 6,148.00, expense 1,680.00, order 1,088.44 — billing towers over both operating ledgers. MIN would floor the invoice rung at 8.73, taking MAX of ids instead of amounts would price the biggest expense at 0.36, order_items has no amount_cents to stack, and a second 'invoice' label would file two rungs under one name. The ladder's read: billing dwarfs everything.",
  },
  {
    id: "cs-835",
    tier: "hard",
    topic: "s2",
    universe: "growth",
    title: "The whole ledger of records",
    brief:
      "From: Growth lead. Re: the data-inventory appendix.\n\nThe appendix counts every table in one stack — orders, invoices, payments, expenses, the double-entry ledger — then trims to the three biggest piles.",
    ask: "Stack all five table counts, largest first, keep the top three.",
    template: `SELECT 'orders' AS src, COUNT(*) AS n FROM orders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'expenses', COUNT(*) FROM {1}
UNION ALL
SELECT {4}, COUNT(*) FROM ledger_entries
ORDER BY n {2}
LIMIT {3};`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 4's table",
        why: "Thirty-six spend bookings — the middle pile of the five.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC lines the pile up 103, 80, 36, 28, 27 before trimming.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the appendix cap",
        noVerify: true,
        why: "LIMIT 3 keeps orders, ledger and expenses — the three biggest piles.",
      },
      {
        answer: "'ledger'",
        kind: "keyword",
        label: "arm 5's label",
        why: "The eighty double-entry rows file under 'ledger'.",
      },
    ],
    distractors: ["order_items", "ASC", "1", "customers"],
    walkthrough:
      "Three rows: orders 103, ledger 80, expenses 36. The full stack reads 103, 80, 36, 28, 27 across the five tables — the appendix trims the two smallest. Counting order_items would flood the stack with 251 line rows, ASC would keep the three SMALLEST piles, LIMIT 1 would keep only orders, and customers would mislabel a sixteen-row pile as the ledger. Five piles, trimmed to three.",
  },
  {
    id: "cs-836",
    tier: "hard",
    topic: "s2",
    universe: "expense",
    title: "Big money by category",
    brief:
      "From: Finance partner. Re: the two-column spend grid.\n\nThe grid splits each expense category's money at the 1,000.00 line — big bookings in one column, small in the other — with a grand-total line pinned to the bottom.",
    ask: "Pivot expenses by category into big and small money, plus the grand total.",
    template: `SELECT category,
       ROUND(SUM(CASE WHEN amount_cents >= 100000 THEN amount_cents ELSE 0 END)/100.0, 2) AS big_money,
       ROUND(SUM(CASE WHEN amount_cents < 100000 THEN {1} ELSE 0 END)/100.0, 2) AS small_money
FROM {2}
GROUP BY {3}
UNION ALL
SELECT 'grand', ROUND(SUM(amount_cents)/100.0, 2), 0 FROM expenses
ORDER BY {4} DESC;`,
    slots: [
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the small column's measure",
        why: "Both columns measure the same money — only the CASE side differs.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 1's table",
        why: "All thirty-six spend bookings live on the expenses ledger.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 1's grouping key",
        why: "One row per spend category feeds the grid's four category rows.",
      },
      {
        answer: "big_money",
        kind: "keyword",
        label: "the sort key",
        why: "Ranking by the big column puts the grand line and Rent on top.",
      },
    ],
    distractors: ["id", "ledger_entries", "spent_on", "small_money"],
    walkthrough:
      "Five rows: grand 25,416.00, Rent 16,800.00 big / 0 small, Travel 1,680.00 / 8.41, Ads 0 / 4,570.00, Tools 0 / 15.25. Rent is all big (fourteen 1,200.00 bookings), Ads all small. Measuring ids instead of cents prices everything at cents-on-the-dollar, ledger_entries has no category to group, grouping by spent_on would shred four rows into thirty-seven, and sorting by the small column buries Rent at zero. Rent's monopoly on big money is the grid's story.",
  },
  {
    id: "cs-837",
    tier: "hard",
    topic: "s3",
    universe: "catalog",
    title: "Three id spaces, one overlap",
    brief:
      "From: Catalog lead. Re: the collision matrix.\n\nCustomers, suppliers and products all number from 1. The matrix wants the triple overlap — ids present in ALL THREE tables at once — as one count.",
    ask: "Count ids shared by customers, suppliers and products.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT {4} FROM customers
  {1}
  SELECT id FROM {2}
  INTERSECT
  SELECT id FROM {3}
);`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the chain's first operator",
        why: "Each INTERSECT narrows the id set to what ALL arms share.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Supplier ids 1–6 form the first narrowing.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "arm 3's table",
        why: "Product ids 1–16 form the final narrowing.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "arm 1's identity column",
        why: "Every arm must contribute the same id space for the intersect to bite.",
      },
    ],
    distractors: ["EXCEPT", "name", "region"],
    walkthrough:
      "One row: n 6 — ids 1 through 6 exist in all three tables, so the triple intersect holds six. EXCEPT in the first link would gut the set to customer-only ids, orders as the second arm widens the overlap to 16 (its ids cover 1–103), a third customers arm widens it to 16 likewise, and names in the first arm would intersect words against numbers — nothing. Six is the collision matrix's densest cell.",
  },
  {
    id: "cs-838",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "One sweep, four piles",
    brief:
      "From: Fraud analyst. Re: the vocabulary census.\n\nThe census unions four vocabularies in one chain — spend categories, ledger accounts, till methods, lifecycle statuses — and counts every distinct word the business uses across all four.",
    ask: "Count the distinct words across expense, ledger, payment and order vocabularies.",
    template: `SELECT COUNT(*) AS vocabulary FROM (
  SELECT {4} AS v FROM expenses
  UNION
  SELECT account FROM {1}
  UNION
  SELECT {2} FROM payments
  UNION
  SELECT status FROM {3}
);`,
    slots: [
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 2's table",
        why: "Four account words — cash, sales_revenue, accounts_receivable, operating_expenses.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "Two till words — card, wire — join the census.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 4's table",
        why: "Four lifecycle words ride in last from orders.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 1's column",
        why: "Four spend words open the census — Ads, Rent, Tools, Travel.",
      },
    ],
    distractors: ["invoices", "paid_on", "expenses", "spent_on"],
    walkthrough:
      "One row: vocabulary 14 — 4 spend words plus 4 accounts plus 2 methods plus 4 statuses, all pairwise disjoint. Invoice statuses instead of order statuses would swap in open, paid, void for a census of 13, payment DATES would flood the pile with wordless timestamps, expenses as the fourth table contributes nothing new, and spent_on dates would flood it likewise. Fourteen words is the business's working vocabulary.",
  },
  {
    id: "cs-839",
    tier: "hard",
    topic: "s5",
    universe: "growth",
    title: "The pile, trimmed to three",
    brief:
      "From: Growth lead. Re: the region-first footer.\n\nOne chain merges regions, lifecycle words and till methods, sorts the pile, and trims to three. Because code sorts before lowercase, the top three are all uppercase — name them.",
    ask: "List the first three words of the regions-statuses-methods pile, sorted.",
    template: `SELECT v FROM (
  SELECT region AS v FROM customers
  UNION
  SELECT {1} FROM orders
  UNION
  SELECT method FROM payments
)
ORDER BY v {3}
LIMIT {2};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "arm 2's column",
        why: "Four lowercase lifecycle words join the pile behind the region codes.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the trim",
        noVerify: true,
        why: "LIMIT 3 keeps the footer to the pile's first three words.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Ascending runs APAC, EU, LATAM — code points before lowercase.",
      },
    ],
    distractors: ["id", "created_at", "1", "EXCEPT"],
    walkthrough:
      "Three rows: APAC, EU, LATAM. Uppercase code points sort below every lowercase word, so the four region codes claim the top — and the trim keeps three. Order ids would sort numerically FIRST (numbers precede text in SQLite) and put 1, 2, 3 on top; booking dates start with digits too and would lead the pile; LIMIT 1 keeps only APAC; EXCEPT would strip statuses from regions before the merge. The footer is the three easiest region codes.",
  },
  {
    id: "cs-840",
    tier: "hard",
    topic: "s6",
    universe: "month-close",
    title: "Till methods, split at 3,000",
    brief:
      "From: Controller. Re: the payment-size grid.\n\nThe grid splits each till method's payments at 3,000.00 — count and money on each side — so treasury can see which channel carries the big tickets.",
    ask: "Pivot payments by method into big (3,000.00+) and standard money.",
    template: `SELECT method, COUNT(*) AS n,
       ROUND(SUM(CASE WHEN amount_cents >= {3} THEN {4} ELSE 0 END)/100.0, 2) AS big_money,
       ROUND(SUM(CASE WHEN amount_cents < 300000 THEN amount_cents ELSE 0 END)/100.0, 2) AS std_money
FROM payments
GROUP BY {1}
ORDER BY big_money {2};`,
    slots: [
      {
        answer: "method",
        kind: "keyword",
        label: "the grouping key",
        why: "One row per till method — card and wire are the grid's rows.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC surfaces wire's 14,828.00 big-ticket money first.",
      },
      {
        answer: "300000",
        kind: "number",
        label: "the big-ticket threshold",
        noVerify: true,
        why: "3,000.00 in cents — six payments clear it, four by wire.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the big column's measure",
        why: "Both money columns measure amount_cents — only the CASE side differs.",
      },
    ],
    distractors: ["paid_on", "ASC", "400000", "id"],
    walkthrough:
      "Two rows: wire 11 payments, 14,828.00 big / 17,420.00 standard; card 16 payments, 7,091.00 big / 30,273.00 standard. Grouping by paid_on would shred the grid into payment dates, ASC would lead with card's smaller big-money, a 4,000.00 line would almost empty the big column (one 4,015.00 payment survives), and summing ids would price the grid in cents-on-the-dollar. Wire owns the big tickets; card owns the frequency.",
  },
  {
    id: "cs-841",
    tier: "hard",
    topic: "s6",
    universe: "growth",
    title: "Four quarters, booked and labeled",
    brief:
      "From: Growth lead. Re: the quarterly money line.\n\nThe board line books every order into its quarter with a four-branch CASE on the month, then sums money per quarter, filed Q1 through Q4.",
    ask: "Bucket orders into Q1–Q4 by booking month, with summed totals.",
    template: `SELECT CASE WHEN substr(created_at, 6, 2) IN ({2}) THEN {1}
            WHEN substr(created_at, 6, 2) IN ({3}) THEN 'Q2'
            WHEN substr(created_at, 6, 2) IN ('07','08','09') THEN {4}
            ELSE 'Q4' END AS q,
       ROUND(SUM(total), 2) AS money
FROM orders
GROUP BY q
ORDER BY q;`,
    slots: [
      {
        answer: "'Q1'",
        kind: "keyword",
        label: "the first branch's label",
        why: "January–March bookings file as Q1 — 14,018.72, the heaviest quarter.",
      },
      {
        answer: "'01','02','03'",
        kind: "keyword",
        label: "the first branch's months",
        why: "The IN list catches the first quarter's three month codes.",
      },
      {
        answer: "'04','05','06'",
        kind: "keyword",
        label: "the second branch's months",
        why: "The April-to-June month codes file as Q2 — 7,426.65 in booked money.",
      },
      {
        answer: "'Q3'",
        kind: "keyword",
        label: "the third branch's label",
        why: "July–September bookings file as Q3 — 6,661.97.",
      },
    ],
    distractors: ["'q1'", "'04','05','07'", "'H2'", "'1','2','3'"],
    walkthrough:
      "Four rows: Q1 14,018.72, Q2 7,426.65, Q3 6,661.97, Q4 6,725.94 — the year front-loaded, Q1 heavier than Q2 and Q3 combined. A lowercase 'q1' would split the labels into two vocabularies, slipping month 07 into either early branch would shift July's money forward, 'H2' breaks the quarter scheme, and unpadded '1','2','3' match no zero-padded month code so Q1 empties. Q1 carries 40% of the book.",
  },
  {
    id: "cs-842",
    tier: "hard",
    topic: "s6",
    universe: "month-close",
    title: "Every state, every region, one grid",
    brief:
      "From: Controller. Re: the fulfillment grid.\n\nThe close binder's centerpiece: one row per region, four CASE-driven columns counting pending, shipped, delivered and cancelled orders — delivered first in the ranking.",
    ask: "Pivot orders by region into pending, shipped, delivered and cancelled counts.",
    template: `SELECT c.region,
       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS waiting,
       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS moving,
       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS done,
       SUM(CASE WHEN o.status = {4} THEN 1 ELSE 0 END) AS lost
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY {2}
ORDER BY done {3};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the done column's state",
        why: "Delivered is the ranking column — EU's 24 lead the grid.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping key",
        why: "One row per region — the grid's row axis.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files EU 24, APAC 21, US 5, LATAM 2 down the grid.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the lost column's state",
        why: "Cancelled orders are the lost column — EU and APAC three each.",
      },
    ],
    distractors: ["'shipped'", "'refunded'", "c.city", "ASC"],
    walkthrough:
      "Four rows: EU 6/12/24/3, APAC 5/8/21/3, US 3/10/5/1, LATAM 0/0/2/0 — waiting, moving, done, lost. Measuring done by shipped instead would crown EU's 12 but misread the pipeline, 'refunded' is a word fulfillment never says (the lost column zeroes out), grouping by city would shred the grid into sixteen rows, and ASC would bury EU's 24 under LATAM's 2. 103 orders, four states, one grid.",
  },
  {
    id: "cs-843",
    tier: "hard",
    topic: "s6",
    universe: "pricing",
    title: "Price tier against stock depth",
    brief:
      "From: Pricing lead. Re: the premium-parity check.\n\nThe check pairs each price tier with its stocking: how many premium items sit deep versus lean, and the same for standard. Two CASE columns answer it.",
    ask: "Pivot products by price tier into deep (100+) and lean stock counts.",
    template: `SELECT CASE WHEN price >= {1} THEN {3} ELSE 'standard' END AS tier,
       SUM(CASE WHEN stock >= 100 THEN 1 ELSE 0 END) AS deep,
       SUM(CASE WHEN stock < 100 THEN 1 ELSE 0 END) AS lean
FROM products
GROUP BY {4}
ORDER BY deep {2};`,
    slots: [
      {
        answer: "100",
        kind: "number",
        label: "the premium price line",
        noVerify: true,
        why: "Four products price at 100.00 or more — the premium tier.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files standard (ten deep) above premium (zero deep).",
      },
      {
        answer: "'premium'",
        kind: "keyword",
        label: "the tier label",
        why: "The 100.00-and-up tier files under 'premium'.",
      },
      {
        answer: "tier",
        kind: "keyword",
        label: "the grouping key",
        why: "One row per price tier — the check's row axis.",
      },
    ],
    distractors: ["50", "ASC", "'high'", "price"],
    walkthrough:
      "Two rows: standard 10 deep / 2 lean, premium 0 deep / 4 lean — every premium item runs lean, every deep item is standard. Dropping the line to 50.00 would pull four core items into premium (eight rows in the tier), renaming the label breaks the check's vocabulary, grouping by raw price would refuse to collapse sixteen products into two tiers, and ASC would lead with premium's zero. Premium is starved of depth — the parity check fails.",
  },
  {
    id: "cs-844",
    tier: "hard",
    topic: "s6",
    universe: "supplier",
    title: "Rating shelves for six suppliers",
    brief:
      "From: Supplier auditor. Re: the vendor scorecard.\n\nThe scorecard shelves all six suppliers: elite at 4.5 and up, solid from 4.0, basic below. One two-threshold CASE sorts the roster in a single pass.",
    ask: "Band suppliers into elite (4.5+), solid (4.0+) and basic, with counts.",
    template: `SELECT CASE WHEN rating >= {1} THEN {3} WHEN rating >= {2} THEN 'solid' ELSE 'basic' END AS band,
       COUNT(*) AS n
FROM suppliers GROUP BY band ORDER BY band;`,
    slots: [
      {
        answer: "4.5",
        kind: "number",
        label: "the elite threshold",
        noVerify: true,
        why: "Two suppliers rate 4.5 or better — 4.8 and 4.6.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the solid threshold",
        noVerify: true,
        why: "Three more rate 4.0 to 4.4 — the solid shelf.",
      },
      {
        answer: "'elite'",
        kind: "keyword",
        label: "the top shelf's label",
        why: "The scorecard's top shelf files under 'elite'.",
      },
    ],
    distractors: ["4.8", "4.4", "'top'"],
    walkthrough:
      "Three rows: basic 1, elite 2, solid 3 — one supplier (3.9) falls below the line, two clear 4.5. Raising the elite line to 4.8 would strand the 4.6 supplier on the solid shelf (elite 1, solid 4), dropping the solid line to 4.4 would push 4.1 and 4.0 down to basic (solid 1, basic 3), and renaming the top shelf breaks the scorecard's language. Two elites carry the roster's reputation.",
  },
  {
    id: "cs-845",
    tier: "hard",
    topic: "s1",
    universe: "expense",
    title: "Out the door, back from the book",
    brief:
      "From: Finance partner. Re: the cash-circle note.\n\nThe note stacks three money lines: everything spent, what left cash per the books, and what collections returned through receivables — where the last two should agree.",
    ask: "Stack total spend, cash debits and receivable credits from the books.",
    template: `SELECT {4} AS k, ROUND(SUM(amount_cents)/100.0, 2) AS v FROM expenses
UNION ALL
SELECT 'paid_out', ROUND(SUM(debit_cents)/100.0, 2) FROM ledger_entries WHERE account = {1}
UNION ALL
SELECT 'collected_in', ROUND(SUM(credit_cents)/100.0, 2) FROM ledger_entries WHERE account = {2}
ORDER BY v {3};`,
    slots: [
      {
        answer: "'cash'",
        kind: "keyword",
        label: "arm 2's account",
        why: "Cash debits — 69,612.00 — are the money that physically left.",
      },
      {
        answer: "'accounts_receivable'",
        kind: "keyword",
        label: "arm 3's account",
        why: "Receivable credits — 69,612.00 — are the collections that came back.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC puts the two 69,612.00 book lines above the 25,416.00 spend.",
      },
      {
        answer: "'spent'",
        kind: "keyword",
        label: "arm 1's label",
        why: "The spend line files under 'spent' — 25,416.00 across 36 bookings.",
      },
    ],
    distractors: ["'sales_revenue'", "'operating_expenses'", "ASC", "'burned'"],
    walkthrough:
      "Three rows: paid_out 69,612.00, collected_in 69,612.00, spent 25,416.00 — the book lines agree to the cent, every dollar collected through receivables also left cash. Revenue debits nothing (0.00 would hollow the paid_out line), operating_expenses credits nothing (0.00 for collected_in), ASC would lead with the spend line, and a 'burned' label would file the stack in a vocabulary nobody audits. The cash circle closes at 69,612.00.",
  },
  {
    id: "cs-846",
    tier: "hard",
    topic: "s3",
    universe: "growth",
    title: "The overlap, bracketed",
    brief:
      "From: Growth lead. Re: the shared-date window.\n\nOrders and expenses collided on seven dates. The brief wants the window bracketed: the first shared date, the last, and the count — one intersect, three columns.",
    ask: "Show the first, last and count of dates shared by orders and expenses.",
    template: `SELECT {3}({4}) AS first_overlap, MAX(v) AS last_overlap, COUNT(*) AS n FROM (
  SELECT DISTINCT created_at AS v FROM orders
  {2}
  SELECT spent_on FROM {1}
);`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "Expense booking dates live on the expenses ledger.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Only dates present in BOTH ledgers survive the intersect.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the opening bracket",
        why: "MIN of the overlap is 2024-01-01 — the window's first day.",
      },
      {
        answer: "v",
        kind: "keyword",
        label: "the date column",
        why: "The intersected dates ride out of the subquery as column v.",
      },
    ],
    distractors: ["orders", "UNION", "COUNT", "created_at"],
    walkthrough:
      "One row: 2024-01-01, 2025-01-01, 7 — the shared window runs New Year's Day to New Year's Day across two years, seven dates in all. Mirroring orders against themselves would widen the count to 84, UNION would merge both calendars into 113 dates, COUNT in the opening bracket would put a bare 7 where a date belongs, and created_at does not exist on the intersected output. The window brackets the year.",
  },
  {
    id: "cs-847",
    tier: "hard",
    topic: "s4",
    universe: "inventory",
    title: "Lean, but affordable",
    brief:
      "From: Inventory controller. Re: the restock shortlist.\n\nThe shortlist: items running lean (under 100 units) that are NOT premium priced (100.00 and up) — cheap products about to run out. Two arms, one difference.",
    ask: "List products with stock under 100 that are not premium-priced.",
    template: `SELECT {3} FROM products WHERE stock < {1}
{2}
SELECT name FROM products WHERE price >= 100
ORDER BY name;`,
    slots: [
      {
        answer: "100",
        kind: "number",
        label: "the lean-stock line",
        noVerify: true,
        why: "Under 100 units — six products run lean, four of them premium.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the difference operator",
        why: "The shortlist is lean items MINUS the premium four.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "arm 1's column",
        why: "The shortlist names products — both arms must output names.",
      },
    ],
    distractors: ["200", "INTERSECT", "category"],
    walkthrough:
      "Two rows: Fitness Band X2, USB-C Hub 7-in-1 — the only lean items that are not premium. Loosening the line to 200 units would add six mid-stock names for a list of six, INTERSECT answers the opposite list (the four lean premium items), and categories in place of names would file category words where product names belong. Two affordable items head the restock run.",
  },
  {
    id: "cs-848",
    tier: "hard",
    topic: "s2",
    universe: "refund-audit",
    title: "Every state, counted and priced",
    brief:
      "From: Refund auditor. Re: the billing-state table.\n\nThe audit's table stacks all three billing states plus the book line — count and money per row — ordered by money so the heaviest state leads.",
    ask: "Stack open, paid and void invoices with counts and money, plus the book total.",
    template: `SELECT 'open' AS k, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM invoices WHERE status = 'open'
UNION ALL
SELECT 'paid', COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE status = {1}
UNION ALL
SELECT 'void', COUNT(*), ROUND(SUM({2})/100.0, 2) FROM invoices WHERE status = 'void'
UNION ALL
SELECT {4}, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM invoices
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "Twenty-one paid invoices — 66,443.00, the book's heaviest state.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 3's money column",
        why: "The void line prices its single 925.00 booking from amount_cents.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort key",
        why: "Ordering by money files 86,977.00, 66,443.00, 19,609.00, 925.00.",
      },
      {
        answer: "'every'",
        kind: "keyword",
        label: "arm 4's label",
        why: "The unfiltered fourth row files under 'every' — 28 invoices.",
      },
    ],
    distractors: ["'open'", "k", "'all'"],
    walkthrough:
      "Four rows: every 28 / 86,977.00, paid 21 / 66,443.00, open 6 / 19,609.00, void 1 / 925.00 — and the states sum to the book: 66,443 plus 19,609 plus 925. Labeling the paid arm 'open' would double the open line, ordering by the label column would file void first and the book last, and 'all' vs 'every' is the audit's own vocabulary. The table reconciles to the cent.",
  },
  {
    id: "cs-849",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "Strip the regions, keep the cities",
    brief:
      "From: Fraud analyst. Re: the word-pile audit.\n\nOne chain builds a pile: lifecycle words minus region codes, then city names merged in. Count every word the finished pile holds.",
    ask: "Count the pile: order statuses except regions, then cities unioned in.",
    template: `SELECT COUNT(*) AS pile FROM (
  SELECT status AS v FROM {3}
  {2}
  SELECT region FROM customers
  UNION
  SELECT {1} FROM {4}
);`,
    slots: [
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names ride in on the final UNION.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the chain's first operator",
        why: "The first EXCEPT strips region-shaped words from the status pile.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "Four lifecycle words open the chain from orders.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 3's table",
        why: "The sixteen city words live on the customers dimension.",
      },
    ],
    distractors: ["UNION", "INTERSECT", "region", "suppliers"],
    walkthrough:
      "One row: pile 20 — four status words (regions strip nothing they aren't) plus sixteen city names. Unioning regions instead of differencing them would grow the pile to 24, intersecting would empty the status arm before the cities arrive (16), stacking region codes instead of cities keeps the pile at eight, and suppliers has no city column to merge. Twenty words is the audited pile.",
  },
  {
    id: "cs-850",
    tier: "hard",
    topic: "s6",
    universe: "expense",
    title: "The ledger's own reading order",
    brief:
      "From: Finance partner. Re: the report's custom sort.\n\nThe report refuses alphabetical order: Rent leads, Ads follows, and everything else trails sorted by spend. A CASE in ORDER BY draws up the sequence.",
    ask: "Order expense categories Rent, Ads, then the rest by spend, with totals.",
    template: `SELECT category, ROUND(SUM(amount_cents)/100.0, 2) AS spend
FROM expenses
GROUP BY {3}
ORDER BY CASE WHEN category = {1} THEN 0 WHEN category = {4} THEN 1 ELSE 2 END, spend {2};`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the lead category",
        why: "Rent books 16,800.00 and takes the report's first line.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the tail's sort direction",
        why: "The tail sorts cheap-first: Tools 15.25 before Travel 25.21.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the grouping key",
        why: "One row per spend category — the report's row axis.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "the second category",
        why: "Ads books 4,570.00 and takes the report's second line.",
      },
    ],
    distractors: ["'Travel'", "DESC", "spent_on", "'Media'"],
    walkthrough:
      "Four rows: Rent 16,800.00, Ads 4,570.00, Tools 15.25, Travel 25.21 — the fixed pair leads, the tail files cheap-first. Leading with Travel would demote Rent to the tail's big spender, DESC would file Travel's 25.21 above Tools' 15.25, grouping by spent_on would shred four rows into thirty-six, and a 'Media' rule matches nothing so Ads would fall into the tail. The ledger reads in the order finance insists on.",
  },
];
