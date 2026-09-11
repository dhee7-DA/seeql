// Case batch S3 — Module 3 (set ops & CASE) cases cs-701…cs-750.
// 50 cases: 17 easy / 17 medium / 16 hard across topics s2 (Stacked reports),
// s3 (INTERSECT), s4 (EXCEPT), s5 (Set chains). Every figure was probed
// against the live seed db (scripts/m3-facts*.ts) and is mechanically
// re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesS3: CaseStudy[] = [
  {
    id: "cs-701",
    tier: "easy",
    topic: "s2",
    universe: "expense",
    title: "Card money over wire money",
    brief:
      "From: Finance partner. Re: till mix.\n\nThe till report opens with two labeled money rows: everything collected by card and everything collected by wire, exact dollars. No other slicing — the mix at a glance.",
    ask: "Stack card money over wire money as labeled rows.",
    template: `SELECT {1} AS pay, ROUND(SUM(amount_cents)/100.0, 2) AS money
FROM payments WHERE method = 'card'
UNION ALL
SELECT {2}, ROUND(SUM(amount_cents)/100.0, 2)
FROM payments WHERE {3} = 'wire';`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "arm 1's label literal",
        why: "The card line: 16 receipts totalling 37,364.00.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The wire line: 11 receipts totalling 32,248.00.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 2's filter column",
        why: "Payments expose their channel through method — the column both WHERE clauses test.",
      },
    ],
    distractors: ["paid_on", "invoices", "COUNT"],
    walkthrough:
      "Two labeled rows: card 37,364.00 and wire 32,248.00 — a 69,612.00 till that leans card. The literals keep each row self-describing, which is what the mix report needs. Filtering on paid_on would compare dates to the word 'wire' and return nothing (a NULL money row), invoices has no method column to filter, and COUNT inside the money expression would divide receipts by 100 instead of summing cents.",
  },
  {
    id: "cs-702",
    tier: "easy",
    topic: "s2",
    universe: "month-close",
    title: "Billing states over till words",
    brief:
      "From: Controller. Re: the vocabulary volume grid.\n\nOne grid, both sides: invoice counts per billing state stacked over payment counts per till word — five rows, biggest volume first.",
    ask: "Stack the invoice status census over the payment method census, biggest first.",
    template: `SELECT status AS v, COUNT(*) AS n FROM invoices
GROUP BY status
UNION ALL
SELECT method, COUNT(*) FROM {1}
GROUP BY {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 2's table",
        why: "The till side: card 16 and wire 11 receipts.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 2's group column",
        why: "The till census groups by method — two buckets, card and wire.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC ranks paid 21, card 16, wire 11, open 6, void 1 — one descending ladder.",
      },
    ],
    distractors: ["region", "customers", "money"],
    walkthrough:
      "Five rows ranked by volume: paid 21, card 16, wire 11, open 6, void 1 — billing states and till words in one descending ladder. Arm 1's alias v names the label column for the whole compound; arm 2's own column name is discarded. Neither customers nor invoices carries a region column to group or sort by, and money is not a column this compound outputs.",
  },
  {
    id: "cs-703",
    tier: "easy",
    topic: "s3",
    universe: "refund-audit",
    title: "The double-risk customers",
    brief:
      "From: Refund auditor. Re: the stuck cohort.\n\nThe worst cohort sits in two lists at once: customers with a pending order who have ALSO never been invoiced. Count them — these are the accounts that can stall a close.",
    ask: "Count customers who are both pending-order holders and never invoiced.",
    template: `SELECT {1}(*) AS double_risk FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
  {2}
  SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM {3}));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The deliverable is one cohort-size figure.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the both-lists operator",
        why: "In both lists at once is the definition of INTERSECT.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the never-invoiced source",
        why: "The NOT IN subquery reads invoices.customer_id to find customers absent from billing.",
      },
    ],
    distractors: ["SUM", "EXCEPT", "payments"],
    walkthrough:
      "Eight pending customers meet five never-invoiced customers: exactly 2 appear in both lists (Farid Nasser and Keiko Sato) — the double-risk cohort. EXCEPT would count pending customers who ARE invoiced (6 — the healthy rest of the pending pile), and payments has no customer_id column to feed the NOT IN. Two names is the whole stuck list the close needs to chase.",
  },
  {
    id: "cs-704",
    tier: "easy",
    topic: "s3",
    universe: "catalog",
    title: "No orphan lines, proven",
    brief:
      "From: Warehouse coordinator. Re: grain integrity receipt.\n\nEvery order is supposed to carry at least one item line. Prove it without a join: intersect order ids with the order ids referenced by order_items and count.",
    ask: "Count order ids that also appear as order_items.order_id.",
    template: `SELECT {1}(*) AS with_lines FROM (
  SELECT id FROM orders
  {2}
  SELECT order_id FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The integrity receipt is a single figure.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the both-sides operator",
        why: "Ids present as orders AND referenced by lines — the intersection.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "arm 2's table",
        why: "The line table references its parent through order_id — 251 lines over the same id space.",
      },
    ],
    distractors: ["SUM", "EXCEPT", "products"],
    walkthrough:
      "All 103 order ids survive the intersection — every order has at least one line, and the receipt prints 103 with no join involved. EXCEPT would answer the opposite audit (orphan orders) and print 0, products has no order_id column, and SUM(*) is not SQL. The 103-vs-251 contrast is the grain story: same parents, many lines.",
  },
  {
    id: "cs-705",
    tier: "easy",
    topic: "s4",
    universe: "expense",
    title: "The month spend beat billing",
    brief:
      "From: Finance partner. Re: calendar gap.\n\nExpenses started before invoicing did. List the months that carry expense bookings but no issued invoice — the billing calendar's blind spot.",
    ask: "Except invoice months from expense months.",
    template: `SELECT substr({1}, 1, 7) AS m FROM expenses
{2}
SELECT substr(issued_on, 1, 7) FROM {3}
ORDER BY 1;`,
    slots: [
      {
        answer: "spent_on",
        kind: "keyword",
        label: "arm 1's date column",
        why: "Expenses date bookings in spent_on; substr truncates to the YYYY-MM month bucket.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Expense months absent from the invoice calendar — a textbook EXCEPT.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Billing dates its documents in issued_on — the comparison calendar.",
      },
    ],
    distractors: ["created_at", "INTERSECT", "payments"],
    walkthrough:
      "One month survives: 2024-01 — the blind spot where spend moved but billing had not started. Every month from 2024-02 on appears in both calendars, so the subtraction keeps exactly one bucket. INTERSECT would print the 13 aligned months instead, expenses has no created_at column, and payments has no issued_on to subtract.",
  },
  {
    id: "cs-706",
    tier: "easy",
    topic: "s4",
    universe: "supplier",
    title: "Cities that are not regions",
    brief:
      "From: Expansion analyst. Re: label hygiene.\n\nThe dimension table carries cities and regions in different columns, and the slide template accidentally unions them. Quantify the damage first: how many city names are not region words?",
    ask: "Count customer cities absent from customer regions.",
    template: `SELECT COUNT(*) AS still_cities FROM (
  SELECT city FROM customers
  {1}
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "City names minus region words — the contamination count.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the subtracted column",
        why: "The four region words (EU, APAC, US, LATAM) are what cities are checked against.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Both columns live on the same dimension — a self-subtraction.",
      },
    ],
    distractors: ["INTERSECT", "status", "orders"],
    walkthrough:
      "All 16 city names survive — no city is named like a region, so the accidental union would print 20 contaminated rows. INTERSECT would count the 0 shared words (accidentally 'clean'), customers has no status column, and orders has no region column — both wrong picks fail at prepare. Sixteen survivors is the damage number the slide template needs to hear.",
  },
  {
    id: "cs-707",
    tier: "easy",
    topic: "s5",
    universe: "catalog",
    title: "Three vocabularies, ten words",
    brief:
      "From: Copy editor. Re: the controlled list, expanded.\n\nThe catalog's controlled vocabulary grows a third arm: expense categories, ledger accounts and payment methods, merged and deduplicated. Verify the new line count.",
    ask: "Count the deduplicated merge of expense categories, ledger accounts and payment methods.",
    template: `SELECT {1}(*) AS vocab FROM (
  SELECT {2} FROM expenses
  UNION
  SELECT account FROM ledger_entries
  {3}
  SELECT method FROM payments);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The verification is one line-count figure.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 1's word column",
        why: "Four expense categories (Ads, Rent, Tools, Travel) open the pile.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right: dedup after arm 2, then arm 3 appends and dedups again.",
      },
    ],
    distractors: ["SUM", "name", "INTERSECT"],
    walkthrough:
      "Three disjoint vocabularies — 4 categories, 4 accounts, 2 methods — merge to exactly 10 words; the controlled list grows by 6. INTERSECT at arm 3 would annihilate the pile to 0 (no account word is a payment method), vendor would swap the 4 vendor names in for the 4 categories, and SUM(*) is not SQL. Ten is the number the back matter prints.",
  },
  {
    id: "cs-708",
    tier: "easy",
    topic: "s2",
    universe: "inventory",
    title: "Deep stock over the rest",
    brief:
      "From: Inventory coordinator. Re: the two-line shelf report.\n\nThe count-day card wants the shelf split two ways: products with deep stock (100 or more) and everything else. Two labeled count rows, nothing between.",
    ask: "Stack the deep-stock count over the sub-100 count.",
    template: `SELECT {3} AS band, COUNT(*) AS n FROM products WHERE stock >= 100
UNION ALL
SELECT {1}, COUNT(*) FROM products WHERE stock < {2};`,
    slots: [
      {
        answer: "'ok'",
        kind: "keyword",
        label: "arm 2's band label",
        why: "The complement bucket: 6 products below the deep-stock line.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "arm 2's threshold",
        why: "The same 100-unit line that defines deep stock, approached from below.",
      },
      {
        answer: "'deep'",
        kind: "keyword",
        label: "arm 1's band label",
        why: "Ten products hold 100 or more units — the deep band that anchors the shelf card's top line.",
      },
    ],
    distractors: ["'low'", "50", "200"],
    walkthrough:
      "Two rows: deep 10, ok 6 — the shelf's whole story in one glance. The thresholds must mirror each other (>= 100 and < 100) or the buckets overlap or gap: dropping arm 2's line to 50 would silently shrink the ok bucket to 2, and raising it to 200 would swallow the deep band's own ten products. The band labels keep the card readable when the buckets are ordered arms, not sorted rows.",
  },
  {
    id: "cs-709",
    tier: "easy",
    topic: "s2",
    universe: "pricing",
    title: "The price ladder, three rungs",
    brief:
      "From: Pricing lead. Re: catalog shape.\n\nThe pricing deck needs the catalog cut into three price rungs — premium (100+), core (50 to 100), budget (under 50) — as three labeled count rows.",
    ask: "Stack the premium, core and budget product counts.",
    template: `SELECT 'premium' AS band, COUNT(*) AS n FROM products WHERE price >= {1}
UNION ALL
SELECT 'core', COUNT(*) FROM products WHERE price >= 50 AND price < 100
UNION ALL
SELECT {2}, COUNT(*) FROM products WHERE price < 50
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "arm 1's price line",
        why: "Premium starts at 100 — the top rung's lower bound.",
      },
      {
        answer: "'budget'",
        kind: "keyword",
        label: "arm 3's band label",
        why: "Eight products sit under 50 — the widest rung.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC ranks budget 8, then the two tied 4s by scan order (premium, core).",
      },
    ],
    distractors: ["200", "band", "money"],
    walkthrough:
      "Three labeled rows: budget 8, premium 4, core 4 — the catalog leans cheap, with a premium quarter. The rungs must tile the line without gaps: 100 and 50 meet exactly, so every one of the 16 products lands in exactly one bucket. A 200 line would empty the premium rung, and the sort needs the count column (n), not the band labels, to rank budget first.",
  },
  {
    id: "cs-710",
    tier: "easy",
    topic: "s4",
    universe: "month-close",
    title: "Billing words the books lack",
    brief:
      "From: Controller. Re: glossary cross-check.\n\nThe books speak in accounts, billing speaks in states. Count the invoice statuses that never appear as ledger account names — the vocabulary the glossary must annotate.",
    ask: "Count invoice statuses absent from ledger accounts.",
    template: `SELECT {1}(*) AS n FROM (
  SELECT status FROM invoices
  EXCEPT
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The cross-check is a single figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "account",
        kind: "keyword",
        label: "arm 2's column",
        why: "Ledger vocabulary lives in account — four names, none of them billing states.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 2's table",
        why: "The books' 80 postings carry the account vocabulary.",
      },
    ],
    distractors: ["SUM", "method", "payments"],
    walkthrough:
      "open, paid and void share nothing with the four account names, so the wrapped count prints 3 — every billing state is foreign to the books. The ledger instead speaks of cash, receivables, expenses and revenue, which is why the glossary annotates rather than translates. payments has no account column to compare against, and SUM(*) is not SQL.",
  },
  {
    id: "cs-711",
    tier: "easy",
    topic: "s3",
    universe: "refund-audit",
    title: "Billed and settled",
    brief:
      "From: Refund auditor. Re: the healthy set.\n\nRefund exposure needs a control group: customers who hold invoices AND have actually settled one through a payment. Count them as the baseline cohort.",
    ask: "Count customers with invoices who also appear behind a settled payment.",
    template: `SELECT {1}(*) AS settled FROM (
  SELECT DISTINCT {2} FROM invoices
  INTERSECT
  SELECT DISTINCT i.customer_id FROM invoices i JOIN {3} p ON p.invoice_id = i.id);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The baseline is a single cohort figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "arm 1's key column",
        why: "Invoices point at customers through customer_id — the id both arms compare.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 2's joined table",
        why: "Settlement is proven by a payment row joined back to its invoice.",
      },
    ],
    distractors: ["SUM", "amount_cents", "invoices"],
    walkthrough:
      "Eleven customers hold invoices; eight of them have settled at least one through a payment — the healthy baseline prints 8. Intersecting invoice ids instead of customer ids would compare 1–28 against a customer-id space and print a meaningless 16, and self-joining invoices on invoice_id fails because invoices has no such column. Eight is the control number the exposure report quotes.",
  },
  {
    id: "cs-712",
    tier: "easy",
    topic: "s2",
    universe: "month-close",
    title: "Region invoices, then the total",
    brief:
      "From: Controller. Re: the billing map.\n\nThe billing map stacks invoice money per region, then one footer row holding the ledger total. Four rows, exact dollars, biggest first.",
    ask: "Stack per-region invoice money plus a grand-total footer, biggest first.",
    template: `SELECT region, ROUND(SUM({1})/100.0, 2) AS money
FROM invoices i JOIN customers c ON c.id = i.customer_id
GROUP BY region
UNION ALL
SELECT {2}, ROUND(SUM(amount_cents)/100.0, 2) FROM invoices
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 1's money column",
        why: "Invoice money is amount_cents: EU 47,933.00, APAC 22,369.00, US 16,675.00.",
      },
      {
        answer: "'all'",
        kind: "keyword",
        label: "the footer's label",
        why: "The footer row holds the 86,977.00 ledger total under the label 'all'.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY money DESC prints the footer first (86,977.00), then EU, APAC, US.",
      },
    ],
    distractors: ["total", "sum", "region"],
    walkthrough:
      "Four rows: the 'all' footer at 86,977.00, then EU 47,933.00, APAC 22,369.00, US 16,675.00 — and LATAM is absent from the region rows because its customer never billed, which is exactly why the footer exists. invoices has no total column to sum, a literal 'sum' label would print where the figure belongs, and sorting by region would alphabetize the map instead of ranking the money.",
  },
  {
    id: "cs-713",
    tier: "easy",
    topic: "s5",
    universe: "supplier",
    title: "Chain receipt: categories, then the till",
    brief:
      "From: Data engineer. Re: runbook — chain warm-up.\n\nLog the simplest two-operator chain: expense categories EXCEPT ledger accounts, then UNION payment methods. The count proves the subtract-then-append reading.",
    ask: "Count categories EXCEPT accounts UNION payment methods.",
    template: `SELECT {1}(*) AS n FROM (
  SELECT category FROM expenses
  EXCEPT
  SELECT account FROM ledger_entries
  {2}
  SELECT {3} FROM payments);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt the runbook logs for the subtract-then-append line.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "Left-to-right: the subtraction completes first, then the append.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "Two payment words (card, wire) join the 4 surviving categories.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "name"],
    walkthrough:
      "Left to right: categories ∖ accounts = 4 (the vocabularies are disjoint), then ∪ methods = 6 — the wrapped count's receipt. INTERSECT in the operator slot would read the append as a junction and collapse everything to 0, expenses has no name column for the first arm, and SUM(*) is not SQL. Six is the warm-up line in the runbook's chain table.",
  },
  {
    id: "cs-714",
    tier: "easy",
    topic: "s3",
    universe: "fraud",
    title: "No spendless order month",
    brief:
      "From: Fraud analyst. Re: the coverage check.\n\nA month with orders but zero expense bookings would smell like unrecorded overhead. Run the negative check: count order months that never appear in the expense calendar.",
    ask: "Count order months absent from expense months.",
    template: `SELECT COUNT(*) AS spendless FROM (
  SELECT substr(created_at, 1, 7) FROM {1}
  {2}
  SELECT substr({3}, 1, 7) FROM expenses);`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "Orders stamp their rows with created_at — 14 distinct month buckets.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Order months absent from the expense calendar — the negative check.",
      },
      {
        answer: "spent_on",
        kind: "keyword",
        label: "arm 2's date column",
        why: "Expenses date bookings in spent_on — the comparison calendar.",
      },
    ],
    distractors: ["INTERSECT", "issued_on", "invoices"],
    walkthrough:
      "The wrapped count prints 0: every month that saw an order also saw spend booked — the coverage check passes. INTERSECT would count the 14 aligned months (the positive proof), issued_on belongs to invoices not orders, and invoices has no spent_on column. Zero is the clean answer the fraud log records.",
  },
  {
    id: "cs-715",
    tier: "easy",
    topic: "s2",
    universe: "expense",
    title: "Category bookings, then the total",
    brief:
      "From: Controller. Re: the spend footer.\n\nThe spend sheet stacks booking counts per category, then a footer row holding the ledger's row count. Five rows, biggest count first.",
    ask: "Stack per-category booking counts plus a grand-total footer, biggest first.",
    template: `SELECT category, COUNT(*) AS n FROM expenses
GROUP BY category
UNION ALL
SELECT {1}, COUNT(*) FROM {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "'all'",
        kind: "keyword",
        label: "the footer's label",
        why: "The footer carries the 36-row ledger total under the label 'all'.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the footer's table",
        why: "The footer recounts the same table without grouping.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC ranks all 36, then Rent 14, Ads 14, Tools 5, Travel 3.",
      },
    ],
    distractors: ["vendor", "suppliers", "category"],
    walkthrough:
      "Five rows: all 36, Rent 14, Ads 14, Tools 5, Travel 3 — the footer reconciles with the category sums, which is the sheet's whole point. suppliers has no category column to group, sorting by category would alphabetize instead of ranking, and a literal vendor label would put a payee name where the footer belongs. The Rent–Ads tie (14 vs 14) reads in scan order under the count sort.",
  },
  {
    id: "cs-716",
    tier: "easy",
    topic: "s5",
    universe: "month-close",
    title: "Chain receipt: till, statuses, regions",
    brief:
      "From: Data engineer. Re: runbook — the reverse chain.\n\nThe chain table's other direction: payment methods UNION order statuses EXCEPT customer regions. Log the count this engine returns.",
    ask: "Count methods UNION statuses EXCEPT regions.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT method FROM payments
  UNION
  SELECT status FROM orders
  {1}
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right: (methods ∪ statuses) completes, then regions subtract.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 3's column",
        why: "The four region words are the subtraction's right side.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 3's table",
        why: "Regions live on customers — the four region words are the subtraction's right side.",
      },
    ],
    distractors: ["INTERSECT", "orders", "payments"],
    walkthrough:
      "Left to right: methods ∪ statuses = 6 words, then ∖ regions removes nothing (disjoint vocabularies) — the wrapped count prints 6. INTERSECT would read the last arm as a junction and collapse the pile to 0, and neither orders nor payments carries a region column for the third arm. Six is the reverse-chain line the runbook logs beside the forward chain's variants.",
  },
  {
    id: "cs-717",
    tier: "easy",
    topic: "s4",
    universe: "catalog",
    title: "Categories the books never name",
    brief:
      "From: Finance partner. Re: the spend glossary.\n\nThe glossary lists expense categories that never collide with ledger account names. Print them, alphabetical — the appendix's short list.",
    ask: "Except ledger accounts from expense categories, sorted.",
    template: `SELECT {1} FROM {2}
EXCEPT
SELECT account FROM ledger_entries
ORDER BY {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "arm 1's column",
        why: "Four category words (Ads, Rent, Tools, Travel) form the left side.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 1's table",
        why: "The spend vocabulary's home table: 36 bookings across four category words.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the ordinal sort key",
        why: "ORDER BY 1 alphabetizes: Ads, Rent, Tools, Travel.",
      },
    ],
    distractors: ["name", "payments", "2"],
    walkthrough:
      "All four categories survive — the books name accounts, not categories — and the appendix prints Ads, Rent, Tools, Travel in alphabetical order. expenses has no name column, payments has no account column to subtract, and ORDER BY 2 asks for a second output column the one-column compound does not produce. Four words is the spend glossary's entry set.",
  },
  {
    id: "cs-718",
    tier: "medium",
    topic: "s2",
    universe: "month-close",
    title: "Region volume, both ledgers",
    brief:
      "From: Controller. Re: the demand-vs-billing map.\n\nOne grid, both ledgers: order counts per region stacked over invoice counts per region — seven rows, so the reader sees where billing lags demand by region.",
    ask: "Stack per-region order counts over per-region invoice counts, region-sorted.",
    template: `SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
UNION ALL
SELECT c.region, COUNT(*) FROM {1} i JOIN customers c ON c.id = i.customer_id
GROUP BY c.region
ORDER BY {2}, {3};`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "The billing side: EU 14, APAC 8, US 6 — and no LATAM row, because its customer never billed.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the region sort ordinal",
        why: "ORDER BY 1 groups the pairs region-first: APAC, EU, LATAM, US.",
      },
      {
        answer: "2",
        kind: "keyword",
        label: "the count tie-break",
        why: "ORDER BY 2 then ranks the two rows of each region — orders before invoices by scan order on ties of region.",
      },
    ],
    distractors: ["payments", "3", "money"],
    walkthrough:
      "Seven rows: APAC 37 then 8, EU 45 then 14, LATAM 2 alone, US 19 then 6 — demand outpaces billing in every region, and LATAM's missing second row is the loudest cell on the grid. The compound keeps arm 1's output names; both arms group their own table by the joined region. payments has no customer_id to join on, ORDER BY 3 is an out-of-range ordinal, and money is not a column this compound outputs.",
  },
  {
    id: "cs-719",
    tier: "medium",
    topic: "s3",
    universe: "refund-audit",
    title: "Delivered and paid, proven",
    brief:
      "From: Refund auditor. Re: the clean-chain receipt.\n\nThe healthiest cohort: customers whose orders were delivered AND who appear behind a settled (paid) invoice. Count them without assuming the join does the work.",
    ask: "Count customers with delivered orders who also hold a paid, settled invoice.",
    template: `SELECT COUNT(*) AS clean_chain FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
  {1}
  SELECT DISTINCT i.customer_id FROM {2} i JOIN {3} p ON p.invoice_id = i.id);`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the both-sides operator",
        why: "Delivered AND settled is an intersection of two customer-id sets.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's billing table",
        why: "Settlement is proven through invoices joined to their payments.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 2's cash table",
        why: "The payment rows carry invoice_id — the settlement evidence.",
      },
    ],
    distractors: ["EXCEPT", "order_items", "customers"],
    walkthrough:
      "Fifteen customers have delivered orders; eight have settled a paid invoice; seven appear in both sets — the clean-chain receipt. EXCEPT would answer the exposure question instead (8 delivered-but-never-settled), order_items has no customer_id for the second arm, and joining customers on invoice_id fails outright. Seven is the control group the refund desk trusts.",
  },
  {
    id: "cs-720",
    tier: "medium",
    topic: "s4",
    universe: "refund-audit",
    title: "Pending but billable",
    brief:
      "From: Refund auditor. Re: the chaseable set.\n\nPending orders are the exposure; never-invoiced customers are the stuck tail. The chaseable set is pending-order customers who HAVE been invoiced before. Count them.",
    ask: "Count pending-order customers who are not in the never-invoiced set.",
    template: `SELECT {1}(*) AS chaseable FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
  {2}
  SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM {3}));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The deliverable is one chaseable-cohort figure.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Pending customers minus the never-invoiced tail — a textbook EXCEPT.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the never-invoiced source",
        why: "The NOT IN subquery reads invoices.customer_id to build the stuck tail.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "payments"],
    walkthrough:
      "Eight pending customers minus the two who were never invoiced: 6 remain — the chaseable cohort with a billing history to lean on. INTERSECT would answer the opposite question (2 double-risk names), payments has no customer_id for the NOT IN, and SUM(*) is not SQL. Six plus the stuck two reconciles the whole pending pile of eight.",
  },
  {
    id: "cs-721",
    tier: "medium",
    topic: "s4",
    universe: "fraud",
    title: "Delivered but never settled",
    brief:
      "From: Fraud analyst. Re: the exposure receipt.\n\nGoods went out (delivered) but the customer never settled a payment. Count the delivered-order customers absent from the settled-payment customer set.",
    ask: "Count delivered-order customers who never appear behind a payment.",
    template: `SELECT {1}(*) AS gap FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
  EXCEPT
  SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The exposure receipt is a single figure.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Fifteen customers hold the 52 delivered orders — the left side of the subtraction.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "arm 2's settlement filter",
        why: "Only settled invoices count: paid invoices joined to their payments.",
      },
    ],
    distractors: ["SUM", "shipped_at", "refunded"],
    walkthrough:
      "Fifteen delivered-order customers minus the eight who settled a paid invoice: 8 remain — goods out, cash never seen. The wrapped count prints the gap the fraud desk opens a file for. 'refunded' is not an order status (empty arm, gap of 0), shipped_at is a column name where a status literal belongs, and SUM(*) is not SQL. Eight minus the seven clean names reconciles the delivered fifteen.",
  },
  {
    id: "cs-722",
    tier: "medium",
    topic: "s3",
    universe: "fraud",
    title: "Timestamps in both states",
    brief:
      "From: Data engineer. Re: the data-quality oddity.\n\nA shipped_at timestamp should belong to exactly one lifecycle transition. Check for reuse: count timestamps that appear on both shipped and delivered orders.",
    ask: "Count shipping timestamps shared by shipped and delivered orders.",
    template: `SELECT COUNT(*) AS shared_stamps FROM (
  SELECT shipped_at FROM orders WHERE status = {1}
  {2}
  SELECT shipped_at FROM orders WHERE status = {3});`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "The 30 shipped orders stamp 29 distinct timestamps.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the reuse detector",
        why: "Timestamps present in both arms are the reuse the check hunts.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "The 52 delivered orders stamp 49 distinct timestamps.",
      },
    ],
    distractors: ["'pending'", "UNION", "EXCEPT"],
    walkthrough:
      "Three timestamps appear on both sides of the fence — the data-quality oddity the runbook logs (a batch job stamped two transitions at once). 'pending' would intersect an all-NULL arm against real stamps and print 0, UNION would merge the calendars (75 distinct stamps) instead of detecting reuse, and EXCEPT would count shipped-only stamps (26). Three is the anomaly count.",
  },
  {
    id: "cs-723",
    tier: "medium",
    topic: "s2",
    universe: "expense",
    title: "The merged calendar",
    brief:
      "From: Finance partner. Re: the fiscal spine.\n\nThe report's spine is one deduplicated month list built from BOTH the expense calendar and the invoice calendar. Count the months the merged spine holds.",
    ask: "Count the deduplicated union of expense months and invoice months.",
    template: `SELECT COUNT(*) AS months FROM (
  SELECT substr({1}, 1, 7) FROM expenses
  {2}
  SELECT substr(issued_on, 1, 7) FROM {3});`,
    slots: [
      {
        answer: "spent_on",
        kind: "keyword",
        label: "arm 1's date column",
        why: "Expenses span 14 month buckets, starting 2024-01.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "One spine row per month even when both calendars carry it — 13 months are shared.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Invoices span 13 month buckets, starting 2024-02.",
      },
    ],
    distractors: ["created_at", "UNION ALL", "payments"],
    walkthrough:
      "The merged spine holds 14 months — 2024-01 through 2025-02 — because the 13 shared months dedup to one each and expenses' early start (2024-01) contributes the fourteenth. UNION ALL would print the raw 27-row pile and defeat the spine's purpose, expenses has no created_at column, and payments has no issued_on. Fourteen is the spine's line count.",
  },
  {
    id: "cs-724",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "Double subtraction receipt",
    brief:
      "From: Data engineer. Re: runbook — chained subtractions.\n\nThe chain table adds the two-subtraction line: statuses EXCEPT regions EXCEPT cities. Log what survives when the pile is subtracted twice.",
    ask: "Count statuses EXCEPT regions EXCEPT cities.",
    template: `SELECT {1}(*) AS n FROM (
  SELECT status FROM orders
  EXCEPT
  SELECT region FROM customers
  {2}
  SELECT {3} FROM customers);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt the runbook logs for the double-subtraction line.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the second subtraction",
        why: "Left-to-right: (statuses ∖ regions) completes, then cities subtract.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names subtract from a pile they cannot touch.",
      },
    ],
    distractors: ["SUM", "UNION", "shipped_at"],
    walkthrough:
      "Left to right: statuses ∖ regions = 4, then ∖ cities removes nothing (no city is a status word) — all 4 statuses survive and the wrapped count prints 4. UNION in the second slot would append 16 cities for a pile of 20, and shipped_at is not a customers column — the chain would not prepare. Four is the double-subtraction line.",
  },
  {
    id: "cs-725",
    tier: "medium",
    topic: "s5",
    universe: "supplier",
    title: "The self-intersect warm-up",
    brief:
      "From: Data engineer. Re: runbook — no-op junctions.\n\nA set intersected with itself changes nothing, and the chain that follows still reads left to right. Document it: regions INTERSECT regions UNION cities, counted.",
    ask: "Count regions INTERSECT regions UNION customer cities.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT region FROM customers
  {1}
  SELECT region FROM customers
  {2}
  SELECT {3} FROM customers);`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the no-op junction",
        why: "Regions ∩ regions = regions — the self-intersect changes nothing.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The 4 surviving regions then append the 16 city names.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names join the pile under the same one-column shape.",
      },
    ],
    distractors: ["EXCEPT", "status", "method"],
    walkthrough:
      "Left to right: regions ∩ regions = 4 (the no-op the runbook documents), then ∪ cities = 20 — the wrapped count's receipt. EXCEPT in the first slot would self-subtract to 0 and the pile would end at 16, status in arm 3 would grow the pile to 8 (4 regions + 4 statuses), and method is not a customers column — the chain would not prepare. Twenty is the no-op line's receipt.",
  },
  {
    id: "cs-726",
    tier: "medium",
    topic: "s3",
    universe: "expense",
    title: "Spend days vs posting days",
    brief:
      "From: Finance partner. Re: the coincidence check.\n\nExpense bookings carry spend days; ledger postings carry posting dates. If the two ever coincide, the double-entry story needs a second look. Count the coincidences.",
    ask: "Count dates that appear in both expenses and ledger_entries.",
    template: `SELECT {1}(*) AS coincidences FROM (
  SELECT spent_on FROM expenses
  {2}
  SELECT entry_date FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The coincidence check is a single figure.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the coincidence operator",
        why: "Dates present in both calendars — the definition of INTERSECT.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 2's table",
        why: "The books date their 80 postings in entry_date.",
      },
    ],
    distractors: ["SUM", "EXCEPT", "payments"],
    walkthrough:
      "Zero coincidences: the 36 spend days and the posting calendar share no date — bookings and postings live on different days by design (spend first, month-end posting after). EXCEPT would print all 36 spend days as the 'unposted' complement, payments has no entry_date column, and SUM(*) is not SQL. Zero is the clean bill the check exists to catch failing.",
  },
  {
    id: "cs-727",
    tier: "medium",
    topic: "s2",
    universe: "growth",
    title: "Cohort years, both sides",
    brief:
      "From: Growth analyst. Re: the acquisition vs activity grid.\n\nThe grid stacks customer signup years over order activity years — four labeled rows showing when we acquired versus when demand actually landed.",
    ask: "Stack customer-year counts over order-year counts, year-sorted.",
    template: `SELECT substr(created_at, 1, 4) AS y, COUNT(*) AS n FROM {1}
GROUP BY y
{2}
SELECT substr(created_at, 1, 4), COUNT(*) FROM customers
GROUP BY 1
ORDER BY {3};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "Demand years: 2024 carried 90 orders, 2025 carried 13.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stacking operator",
        why: "The two (year, count) pairs for 2024 are different rows — dedup would wrongly drop one.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the year sort ordinal",
        why: "ORDER BY 1 lines the years up: 2023, 2024, 2024, 2025.",
      },
    ],
    distractors: ["INTERSECT", "suppliers", "2"],
    walkthrough:
      "Four rows: 2023 (4 signups, no orders), 2024 twice (12 signups, 90 orders), 2025 (13 orders, no signups) — acquisition ran ahead of demand, then demand ran alone. INTERSECT on the (year, count) pairs would return nothing (the censuses share no row), suppliers has no created_at column, and ORDER BY 2 would rank by counts instead of years. The tie on 2024 reads in scan order: orders first, signups second.",
  },
  {
    id: "cs-728",
    tier: "medium",
    topic: "s4",
    universe: "month-close",
    title: "Invoiced months, all collected",
    brief:
      "From: Controller. Re: the cash coverage check.\n\nA month we invoiced but never collected would be a red flag. Run it: count invoice months that never appear in the payment calendar.",
    ask: "Count invoice months absent from payment months.",
    template: `SELECT {1}(*) AS n FROM (
  SELECT substr(issued_on, 1, 7) FROM invoices
  {2}
  SELECT substr({3}, 1, 7) FROM payments);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The coverage check is a single figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Invoice months absent from the payment calendar — the red-flag test.",
      },
      {
        answer: "paid_on",
        kind: "keyword",
        label: "arm 2's date column",
        why: "Payments date receipts in paid_on — the cash calendar.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "entry_date"],
    walkthrough:
      "The wrapped count prints 0: every month that saw an invoice also saw cash — the coverage check passes cleanly. INTERSECT would count the 13 aligned months instead, entry_date belongs to the ledger not payments, and SUM(*) is not SQL. Zero is the figure the close binder staples to the cash section.",
  },
  {
    id: "cs-729",
    tier: "medium",
    topic: "s3",
    universe: "month-close",
    title: "Order days on invoice paper",
    brief:
      "From: Close analyst. Re: the same-day receipt.\n\nWhich order dates coincide with invoice issue dates — days where demand and billing moved together? Count them for the close binder.",
    ask: "Count dates present in both orders and invoices.",
    template: `SELECT COUNT(*) AS days FROM (
  SELECT created_at FROM orders
  {1}
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the same-day operator",
        why: "Dates in both calendars — the same-day receipt.",
      },
      {
        answer: "issued_on",
        kind: "keyword",
        label: "arm 2's date column",
        why: "Invoices date their issue in issued_on — 28 documents across 13 months.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "The billing calendar's home table — 28 issued documents across 13 months.",
      },
    ],
    distractors: ["shipped_at", "EXCEPT", "expenses"],
    walkthrough:
      "Seven of the 84 order dates coincide with an invoice issue date — the same-day receipt proving billing usually lags by days, not weeks. shipped_at timestamps collide with nothing here (0), EXCEPT would answer the lag side (77 order days without paper), and expenses has no issued_on column. Seven is the binder's same-day line.",
  },
  {
    id: "cs-730",
    tier: "medium",
    topic: "s5",
    universe: "catalog",
    title: "Books, till, billing — one list",
    brief:
      "From: Copy editor. Re: the finance glossary.\n\nThe finance glossary merges three vocabularies — ledger accounts, payment methods, invoice statuses — into one deduplicated list. Verify the line count.",
    ask: "Count the deduplicated merge of accounts, methods and invoice statuses.",
    template: `SELECT {1}(*) AS vocab FROM (
  SELECT account FROM ledger_entries
  UNION
  SELECT method FROM payments
  {2}
  SELECT status FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The verification is one line-count figure.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; the third arm appends and dedups again.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "Three billing words (open, paid, void) complete the glossary.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "orders"],
    walkthrough:
      "Three disjoint vocabularies — 4 accounts, 2 methods, 3 billing states — merge to exactly 9 glossary lines. INTERSECT at arm 3 would annihilate the pile (no account word is a billing state), orders would swap the four lifecycle words in for the three billing words (10 lines), and SUM(*) is not SQL. Nine is the finance glossary's line count.",
  },
  {
    id: "cs-731",
    tier: "medium",
    topic: "s2",
    universe: "supplier",
    title: "Vendors over categories",
    brief:
      "From: Supplier auditor. Re: the money mirror.\n\nEach vendor maps to exactly one expense category, so vendor money and category money tell the same story twice. Stack both censuses and watch the pairs double up.",
    ask: "Stack vendor money over category money, biggest first.",
    template: `SELECT vendor AS v, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM expenses
GROUP BY vendor
{1}
SELECT category, ROUND(SUM(amount_cents)/100.0, 2)
FROM expenses GROUP BY {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the keep-both-copies operator",
        why: "The four money values appear twice by design (vendor lens, category lens) — ALL keeps the mirror honest.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 2's group key",
        why: "The second lens groups by category: Ads 4,570.00, Rent 16,800.00, Tools 1,525.00, Travel 2,521.00.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY money DESC ranks 16,800.00 twice, then 4,570.00 twice, then the 2,521.00 pair, then the 1,525.00 pair.",
      },
    ],
    distractors: ["EXCEPT", "spent_on", "line"],
    walkthrough:
      "Eight rows in four tied pairs: Atlas/Rent 16,800.00, AdWorks/Ads 4,570.00, Skyline/Travel 2,521.00, DevTools/Tools 1,525.00 — the mirror is exact because each vendor books exactly one category. EXCEPT would keep only the vendor lens (4 rows) and drop the category mirror, grouping by spent_on would shred into 36 day buckets, and line is not a column this compound outputs.",
  },
  {
    id: "cs-732",
    tier: "medium",
    topic: "s4",
    universe: "growth",
    title: "Active accounts, no paper",
    brief:
      "From: Growth analyst. Re: the reactivation list.\n\nActive customers who have never been invoiced are the reactivation list — relationships alive, revenue never started. Count them.",
    ask: "Count active customers absent from the invoiced set.",
    template: `SELECT COUNT(*) AS chased FROM (
  SELECT id FROM customers WHERE active = {1}
  {2}
  SELECT DISTINCT customer_id FROM {3});`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag value",
        why: "Fourteen of the sixteen customers carry active = 1.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Active customers minus the ever-invoiced — the reactivation set.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Invoices.customer_id lists everyone billing has ever touched.",
      },
    ],
    distractors: ["0", "INTERSECT", "payments"],
    walkthrough:
      "Fourteen active customers minus the eleven who have been invoiced: 3 remain — the reactivation list. Five customers were never invoiced, but two of them are flagged inactive, so they are deliberately out of scope. INTERSECT would count the 11 invoiced-and-active (the opposite list), payments has no customer_id column to subtract, and flipping the flag to 0 would shrink the list to the 2 inactive never-billed accounts.",
  },
  {
    id: "cs-733",
    tier: "medium",
    topic: "s3",
    universe: "expense",
    title: "Books and till, month aligned",
    brief:
      "From: Finance partner. Re: the posting calendar check.\n\nLedger postings and till receipts should cover the same months. Count the months both calendars share.",
    ask: "Count months present in both ledger_entries and payments.",
    template: `SELECT COUNT(*) AS aligned FROM (
  SELECT substr({1}, 1, 7) FROM ledger_entries
  {2}
  SELECT substr(paid_on, 1, 7) FROM {3});`,
    slots: [
      {
        answer: "entry_date",
        kind: "keyword",
        label: "arm 1's date column",
        why: "The books date postings in entry_date — 14 month buckets.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the alignment operator",
        why: "Months in both calendars — the alignment count.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 2's table",
        why: "The till dates receipts in paid_on — 13 month buckets.",
      },
    ],
    distractors: ["debit_cents", "EXCEPT", "invoices"],
    walkthrough:
      "Thirteen months align — 2024-02 through 2025-02 — with the books' early 2024-01 posting unmatched by any receipt. The alignment receipt is 13 of 14. EXCEPT would answer the gap side (the one unmatched month), substr on debit_cents would produce digit strings that intersect nothing, and invoices has no paid_on column. Thirteen is the posting-calendar check's answer.",
  },
  {
    id: "cs-734",
    tier: "medium",
    topic: "s5",
    universe: "catalog",
    title: "The junction that must stay empty",
    brief:
      "From: Data engineer. Re: runbook — the control junction.\n\nA control check in set form: spend vocabulary (categories ∪ accounts) must never intersect the till vocabulary. Log the junction's size as the control receipt.",
    ask: "Count (expense categories UNION ledger accounts) INTERSECT payment methods.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT category FROM expenses
  UNION
  SELECT account FROM ledger_entries
  {1}
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the control junction",
        why: "The junction the control wants empty: spend words ∩ till words.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "Two till words (card, wire) are the probe set.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's table",
        why: "Methods live on payments — card and wire are the two words the junction tests against the spend vocabulary.",
      },
    ],
    distractors: ["EXCEPT", "region", "customers"],
    walkthrough:
      "The junction prints 0 — the control holds: no spend word (category or account) equals a till word. Left to right, the union builds an 8-word spend vocabulary and the junction tests it against card and wire. EXCEPT would answer the complement instead (8 words survive subtracting the till), and neither customers nor payments carries a region column for the third arm. Zero is the control receipt.",
  },
  {
    id: "cs-735",
    tier: "hard",
    topic: "s2",
    universe: "month-close",
    title: "Three ledgers, counts and money",
    brief:
      "From: Controller. Re: the spine, full width.\n\nThe close binder's spine goes full width this quarter: for orders, invoices and expenses print the row count AND the money total, labeled per source. Three rows, six figures, one stack.",
    ask: "Stack labeled count-and-money rows for orders, invoices and expenses.",
    template: `SELECT 'orders' AS src, COUNT(*) AS n, ROUND(SUM(total), 2) AS money FROM orders
UNION ALL
SELECT {1}, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM {2}
UNION ALL
SELECT 'expenses', {3}(*), ROUND(SUM(amount_cents)/100.0, 2) FROM expenses;`,
    slots: [
      {
        answer: "'invoices'",
        kind: "keyword",
        label: "arm 2's label literal",
        why: "The paper ledger: 28 documents holding 86,977.00.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Invoices carry their money in amount_cents.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "arm 3's counter",
        why: "The expense side counts its 36 bookings — COUNT is the row counter.",
      },
    ],
    distractors: ["payments", "ledger_entries", "SUM"],
    walkthrough:
      "Three rows: orders (103 rows, 34,833.28), invoices (28 rows, 86,977.00), expenses (36 rows, 25,416.00) — the spine's full width. The pattern per arm is identical: label, COUNT, money expression. Pointing arm 2 at payments would print the till's 27 receipts and 69,612.00 where billing belongs, ledger_entries would print the books' 80 postings, and SUM(*) is not SQL — the counter must be COUNT.",
  },
  {
    id: "cs-736",
    tier: "hard",
    topic: "s2",
    universe: "expense",
    title: "The double-entry mirror",
    brief:
      "From: Finance partner. Re: debits face credits.\n\nThe books balance because every account posts on both sides — or doesn't. Stack each account's debit money over its credit money, side-labeled, biggest first, and let the asymmetries show.",
    ask: "Stack labeled debit and credit money per ledger account, biggest first.",
    template: `SELECT {1} AS side, account, ROUND(SUM(debit_cents)/100.0, 2) AS money
FROM ledger_entries GROUP BY account
{2}
SELECT {3}, account, ROUND(SUM(credit_cents)/100.0, 2)
FROM ledger_entries GROUP BY account
ORDER BY money DESC;`,
    slots: [
      {
        answer: "'debit'",
        kind: "keyword",
        label: "arm 1's side label",
        why: "Debit money: receivables 86,052.00, cash 69,612.00, expenses 25,416.00, revenue 0.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the mirror-preserving operator",
        why: "Debit and credit rows are different rows even when money ties — ALL keeps both sides visible.",
      },
      {
        answer: "'credit'",
        kind: "keyword",
        label: "arm 2's side label",
        why: "Credit money: revenue 86,052.00, receivables 69,612.00, cash 25,416.00, expenses 0.",
      },
    ],
    distractors: ["INTERSECT", "EXCEPT", "entry_date"],
    walkthrough:
      "Eight rows in mirror pairs: the 86,052.00 that leaves receivables on debit returns to revenue on credit; cash's 69,612.00 debit mirrors receivables' 69,612.00 credit; the books balance at 181,080.00 per side. operating_expenses shows money only on the debit side, sales_revenue only on the credit — the asymmetries the partner reads first. INTERSECT or EXCEPT in an operator slot is a parse error, and entry_date is a label where a side word belongs.",
  },
  {
    id: "cs-737",
    tier: "hard",
    topic: "s3",
    universe: "refund-audit",
    title: "The stuck list, by name",
    brief:
      "From: Refund auditor. Re: names for the chase queue.\n\nThe double-risk cohort needs names, not counts: customers with a pending order who have never been invoiced. Print the names, alphabetical, for the chase queue.",
    ask: "List the names of customers who are both pending-order holders and never invoiced.",
    template: `SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE o.status = {1}
{2}
SELECT name FROM customers WHERE id NOT IN (SELECT {3} FROM invoices)
ORDER BY 1;`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Eight customers hold the 14 pending orders.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the both-lists operator",
        why: "Names in both lists — and INTERSECT also dedups arm 1's join for free.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the NOT IN probe column",
        why: "invoices.customer_id is the billing footprint the NOT IN checks.",
      },
    ],
    distractors: ["shipped_at", "EXCEPT", "id"],
    walkthrough:
      "Two names survive the intersection and print alphabetically: Farid Nasser, Keiko Sato — the chase queue in full. The join translates pending customer ids into names before the compound runs. EXCEPT would print the six billable pending names instead, probing invoices.id in the NOT IN would empty the invoiceless set entirely (every customer id sits under 28), and a status literal of shipped_at matches nothing.",
  },
  {
    id: "cs-738",
    tier: "hard",
    topic: "s3",
    universe: "fraud",
    title: "Reuse vs the NULL pile",
    brief:
      "From: Data engineer. Re: runbook — the timestamp page.\n\nOne row, two receipts: how many stamps are reused across shipped and delivered, and what the union reports for the two never-shipped statuses (where every stamp is NULL). The pair anchors the timestamp page.",
    ask: "Count shipped∩delivered timestamps and the pending∪cancelled stamp union.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT shipped_at FROM orders WHERE status = 'shipped'
    {1} SELECT shipped_at FROM orders WHERE status = 'delivered')) AS reused,
  (SELECT COUNT(*) FROM (SELECT shipped_at FROM orders WHERE status = 'pending'
    {2} SELECT shipped_at FROM orders WHERE status = {3})) AS null_pile;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the reuse probe's operator",
        why: "Shared stamps between shipped and delivered — the reuse count is 3.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the NULL-pile's operator",
        why: "Two all-NULL arms union to exactly one NULL row — the dedup receipt is 1.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the NULL-pile's second status",
        why: "Cancelled orders are also never shipped — the second all-NULL arm.",
      },
    ],
    distractors: ["EXCEPT", "delivered", "shipped"],
    walkthrough:
      "One row, two receipts: reused 3 (the batch job that stamped two transitions) and null_pile 1 (21 NULLs across pending and cancelled collapse to a single NULL row under UNION). The pair teaches the page's two laws: INTERSECT detects real reuse, and set semantics NULL-group rather than NULL-drop. EXCEPT would count shipped-only stamps (26), and pointing the second probe at a shipped status would fetch real stamps instead of the NULL pile.",
  },
  {
    id: "cs-739",
    tier: "hard",
    topic: "s3",
    universe: "refund-audit",
    title: "Clean and gap, reconciled",
    brief:
      "From: Refund auditor. Re: the delivered cohort, split.\n\nThe delivered cohort splits two ways: customers who settled a paid invoice (clean) and customers who never did (gap). Print both figures in one row and reconcile them against the cohort size.",
    ask: "Count delivered customers who settled a paid invoice, and those who did not.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
    {1} SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = {2})) AS clean,
  (SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
    {3} SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'paid')) AS gap;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the clean probe's operator",
        why: "Delivered AND settled — the clean count is 7.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settlement filter",
        why: "Only paid invoices joined to payments prove settlement.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the gap probe's operator",
        why: "Delivered minus settled — the gap count is 8.",
      },
    ],
    distractors: ["UNION", "open", "shipped_at"],
    walkthrough:
      "One row: clean 7, gap 8 — and the pair reconciles to the delivered cohort's 15 distinct customers (7 + 8 = 15). The gap list is the refund desk's worklist; the clean seven are the baseline. UNION would print the merged 15 in the clean column, an 'open' filter would empty arm 2 (no settled evidence at all), and shipped_at is a column name where a status literal belongs.",
  },
  {
    id: "cs-740",
    tier: "hard",
    topic: "s3",
    universe: "catalog",
    title: "Lines and orphans, one row",
    brief:
      "From: Warehouse coordinator. Re: the grain receipt, compact.\n\nThe grain audit in one row: how many order ids carry item lines, and how many are orphans. Both probes run without a join — set semantics only.",
    ask: "Count order ids with item lines and orphan order ids in one row.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT id FROM orders {1} SELECT order_id FROM order_items)) AS with_lines,
  (SELECT COUNT(*) FROM (SELECT id FROM orders {2} SELECT order_id FROM {3})) AS orphans;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the with-lines operator",
        why: "Order ids referenced by lines — the count is 103.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the orphan operator",
        why: "Order ids no line references — the orphan count is 0.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the orphan probe's table",
        why: "The line table's order_id column is the reference set.",
      },
    ],
    distractors: ["UNION ALL", "products", "shipped_at"],
    walkthrough:
      "One row: with_lines 103, orphans 0 — every order carries at least one line, and the pair reconciles trivially: 103 + 0 = 103. The two probes are the same two arms with opposite operators, which is why the audit reads them together. UNION ALL would print the raw 206-row pile in the first column, products has no order_id column, and shipped_at is a column name where a table belongs.",
  },
  {
    id: "cs-741",
    tier: "hard",
    topic: "s4",
    universe: "refund-audit",
    title: "The pending pile, split",
    brief:
      "From: Refund auditor. Re: the pending split, compact.\n\nThe pending cohort splits by billing history: customers we have invoiced before (chaseable) and customers we never invoiced (stuck). Print both figures in one row.",
    ask: "Count pending customers minus the never-invoiced, and pending customers intersected with them.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
    {1} SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))) AS chaseable,
  (SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
    {2} SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM {3}))) AS stuck;`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the chaseable operator",
        why: "Pending minus never-invoiced — the chaseable count is 6.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the stuck operator",
        why: "Pending AND never-invoiced — the stuck count is 2.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the never-invoiced source",
        why: "Both probes build the stuck tail from invoices.customer_id.",
      },
    ],
    distractors: ["UNION", "payments", "shipped"],
    walkthrough:
      "One row: chaseable 6, stuck 2 — and the pair reconciles the pending cohort: 6 + 2 = 8 distinct pending customers. The stuck two (never billed, goods pending) go to the special queue; the six with billing history chase normally. UNION would merge the lists to 11, payments has no customer_id for the NOT IN, and 'shipped' as a literal in either operator slot is a parse error.",
  },
  {
    id: "cs-742",
    tier: "hard",
    topic: "s4",
    universe: "expense",
    title: "The pre-billing month, printed",
    brief:
      "From: Finance partner. Re: the calendar gap, verbatim.\n\nThe gap check found exactly one month where spend moved before billing started. Print it verbatim for the audit trail — the month bucket, nothing else.",
    ask: "List the expense months absent from the invoice calendar.",
    template: `SELECT substr({1}, 1, 7) AS m FROM expenses
{2}
SELECT substr(issued_on, 1, 7) FROM {3}
ORDER BY 1;`,
    slots: [
      {
        answer: "spent_on",
        kind: "keyword",
        label: "arm 1's date column",
        why: "Expenses date bookings in spent_on; substr truncates to the YYYY-MM bucket.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the gap operator",
        why: "Expense months absent from the invoice calendar.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Billing dates its documents in issued_on.",
      },
    ],
    distractors: ["created_at", "INTERSECT", "payments"],
    walkthrough:
      "One row prints: 2024-01 — the month the audit trail records as pre-billing spend. Every later month appears on both calendars, so the subtraction keeps exactly one bucket. expenses has no created_at column, INTERSECT would print the 13 aligned months instead of the gap, and payments has no issued_on to subtract. One row, one month, one clean audit line.",
  },
  {
    id: "cs-743",
    tier: "hard",
    topic: "s4",
    universe: "supplier",
    title: "Spend words vs the till, both probes",
    brief:
      "From: Supplier auditor. Re: the disjointness pair.\n\nThe disjointness control gets its compact form: subtract the till words from the spend vocabulary (what survives) and intersect them (what must be nothing). One row, two receipts.",
    ask: "Count spend words minus till words, and spend words intersected with till words.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT category FROM expenses UNION SELECT account FROM ledger_entries
    {1} SELECT method FROM payments)) AS alone,
  (SELECT COUNT(*) FROM (SELECT category FROM expenses {2} SELECT account FROM ledger_entries
    {3} SELECT method FROM payments)) AS shared;`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the alone probe's operator",
        why: "Spend vocabulary minus till words — all 8 survive, the count is 8.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the vocabulary builder",
        why: "The second probe must build the same 8-word spend vocabulary before its junction.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the shared probe's junction",
        why: "Spend words ∩ till words must be empty — the control holds at 0.",
      },
    ],
    distractors: ["UNION", "shipped_at", "region"],
    walkthrough:
      "One row: alone 8 (the spend vocabulary minus card and wire keeps everything — disjoint vocabularies), shared 0 (the junction the control wants empty). The pair is the disjointness receipt in compact form. UNION in the first slot would build a 10-word pile instead of subtracting, and neither region nor shipped_at exists on the expenses or ledger tables the probes read.",
  },
  {
    id: "cs-744",
    tier: "hard",
    topic: "s4",
    universe: "fraud",
    title: "The label triage",
    brief:
      "From: Data engineer. Re: runbook — the dimension label page.\n\nOne row, three probes over the customers dimension: cities minus regions, regions minus cities, and the city-plus-status pile. The trio anchors the label-hygiene page.",
    ask: "Count cities∖regions, regions∖cities, and the city∪status pile.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT city FROM customers {1} SELECT region FROM customers)) AS words,
  (SELECT COUNT(*) FROM (SELECT region FROM customers EXCEPT SELECT city FROM customers)) AS map,
  (SELECT COUNT(*) FROM (SELECT city FROM customers {2} SELECT status FROM {3})) AS pile;`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the words probe's operator",
        why: "Cities minus regions keeps all 16 — the vocabularies are disjoint.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the pile probe's operator",
        why: "Cities plus statuses merge to the 20-word pile the template would print.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the pile probe's second table",
        why: "The four lifecycle words live on orders — the pile's second source.",
      },
    ],
    distractors: ["INTERSECT", "shipped_at", "method"],
    walkthrough:
      "One row, three receipts: words 16 (every city survives subtracting regions), map 4 (every region survives subtracting cities — both directions are 'everything survives', the disjointness proof), and pile 20 (the accidental template's contaminated line count). INTERSECT would zero all three probes, and shipped_at and method are not columns of the customers dimension — the probes would not prepare.",
  },
  {
    id: "cs-745",
    tier: "hard",
    topic: "s5",
    universe: "catalog",
    title: "The alphabet's first four words",
    brief:
      "From: Copy editor. Re: the merged list's head.\n\nThe catalog merges cities, order statuses and payment methods into one sorted column, but the appendix only prints the first four words. Build the pile, sort it, cap it.",
    ask: "List the first four words of the sorted cities∪statuses∪methods pile.",
    template: `SELECT v FROM (
  SELECT city AS v FROM customers
  UNION
  SELECT status FROM orders
  {1}
  SELECT {2} FROM {3})
ORDER BY v
LIMIT {4};`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; the third arm appends the till words.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "card and wire enter the pile — but sort far below the capitalized cities.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's table",
        why: "Methods live on payments — the till words enter the pile but sort below every capitalized city.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the head cap",
        why: "The appendix caps the list at four words — LIMIT applies to the whole compound after its sort.",
      },
    ],
    distractors: ["INTERSECT", "region", "2"],
    walkthrough:
      "Capitalized city names sort ahead of every lowercase word (binary order), so the pile's head reads Austin, Berlin, Chicago, Cork — the appendix's four lines. The lowercase statuses and till words trail far behind and never surface at the cap. INTERSECT at arm 3 would annihilate the pile to 0 rows (no till word is a city or status), payments has no region column, and LIMIT 2 would print only Austin and Berlin.",
  },
  {
    id: "cs-746",
    tier: "hard",
    topic: "s5",
    universe: "catalog",
    title: "Spend and fulfillment, one vocabulary",
    brief:
      "From: Copy editor. Re: the ops glossary's final count.\n\nThe ops glossary merges expense categories, order statuses and invoice statuses. Two arms share the word 'status' but never the same values. Verify the line count.",
    ask: "Count the deduplicated merge of expense categories, order statuses and invoice statuses.",
    template: `SELECT {1}(*) AS vocab FROM (
  SELECT category FROM expenses
  UNION
  SELECT status FROM orders
  {2}
  SELECT status FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The verification is one line-count figure.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; billing states append last.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "Three billing words (open, paid, void) complete the glossary.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "payments"],
    walkthrough:
      "Eleven lines: 4 categories, 4 lifecycle words, 3 billing states — no word collides across the three vocabularies, so nothing dedups away. The two arms both say 'status' and the compound happily takes arm 1's column name while unioning all the values. INTERSECT at arm 3 would collapse to 0, payments would swap two till words for the three billing states (10 lines), and SUM(*) is not SQL.",
  },
  {
    id: "cs-747",
    tier: "hard",
    topic: "s4",
    universe: "funnel",
    title: "Settled pairs, subtracted",
    brief:
      "From: Funnel analyst. Re: the pair-wise receipt.\n\nSet operations compare whole rows, not columns. Prove it: subtract the (region, pending money) pairs from the (region, delivered money) pairs — because the money values differ, every delivered pair survives.",
    ask: "Count delivered (region, money) pairs absent from pending (region, money) pairs.",
    template: `SELECT c.region, ROUND(SUM(o.total), 2) AS money
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = {1}
GROUP BY c.region
{2}
SELECT c.region, ROUND(SUM(o.total), 2)
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
GROUP BY c.region
ORDER BY {3}, 2 DESC;`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Delivered money pairs: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the pair subtraction",
        why: "Pairs are compared whole — no delivered pair equals a pending pair, so all 4 survive.",
      },
      {
        answer: "1",
        kind: "keyword",
        label: "the region sort ordinal",
        why: "ORDER BY 1 sorts the surviving pairs region-first.",
      },
    ],
    distractors: ["UNION", "INTERSECT", "shipped"],
    walkthrough:
      "Four rows survive — APAC 6,617.68, EU 6,656.18, LATAM 852.44, US 1,444.77 — because EXCEPT compares whole (region, money) rows and no delivered money equals its region's pending money. The lesson: subtracting pairs is stricter than subtracting columns. UNION would print all 7 pairs, INTERSECT would return 0 (no pair matches), and shipped pairs would subtract pending to 3 survivors.",
  },
  {
    id: "cs-748",
    tier: "hard",
    topic: "s3",
    universe: "expense",
    title: "Billing calendar vs spend calendar",
    brief:
      "From: Finance partner. Re: the alignment pair.\n\nOne row, two figures: months the invoice and expense calendars share, and months only expenses carry. The pair reconciles the 14-month window.",
    ask: "Count invoice∩expense months and expense∖invoice months in one row.",
    template: `SELECT
  (SELECT COUNT(*) FROM (SELECT substr(issued_on, 1, 7) FROM invoices
    {1} SELECT substr(spent_on, 1, 7) FROM expenses)) AS shared,
  (SELECT COUNT(*) FROM (SELECT substr(spent_on, 1, 7) FROM expenses
    {2} SELECT substr(issued_on, 1, 7) FROM {3})) AS spend_only;`,
    slots: [
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the shared probe's operator",
        why: "Thirteen months carry both invoices and spend.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the spend-only probe's operator",
        why: "Exactly one month (2024-01) carries spend without billing.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the gap probe's subtracted table",
        why: "The invoice calendar is what gets subtracted from the spend calendar.",
      },
    ],
    distractors: ["UNION", "UNION ALL", "payments"],
    walkthrough:
      "One row: shared 13, spend_only 1 — and the pair reconciles the window: 13 + 1 = 14 months of spend history. The single spend-only month (2024-01) is the pre-billing gap the close notes in its footnotes. UNION would print the merged 14 in the shared column, UNION ALL the raw 27-row pile, and payments has no spent_on column for the gap probe.",
  },
  {
    id: "cs-749",
    tier: "hard",
    topic: "s5",
    universe: "month-close",
    title: "The exposure ladder",
    brief:
      "From: Controller. Re: the three-rung exposure ladder.\n\nThe ladder stacks the three exposure buckets: pending order money, open invoice money, void invoice money. Three labeled arms, exact dollars, in that order — the close reads top to bottom.",
    ask: "Stack pending order money, open invoice money and void invoice money.",
    template: `SELECT {1} AS src, ROUND(SUM(total), 2) AS money
FROM orders WHERE status = 'pending'
{2}
SELECT 'open_invoices', ROUND(SUM(amount_cents)/100.0, 2)
FROM invoices WHERE status = 'open'
UNION ALL
SELECT 'void_invoices', ROUND({3}(amount_cents)/100.0, 2)
FROM invoices WHERE status = 'void';`,
    slots: [
      {
        answer: "'pending_orders'",
        kind: "keyword",
        label: "arm 1's label literal",
        why: "The demand-side exposure: 14 pending orders holding 6,113.00.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "arm 2's operator",
        why: "The ladder stacks three distinct buckets — nothing to dedup, nothing to drop.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "arm 3's aggregator",
        why: "The void rung sums its single 925.00 document.",
      },
    ],
    distractors: ["INTERSECT", "EXCEPT", "COUNT"],
    walkthrough:
      "Three rungs: pending_orders 6,113.00, open_invoices 19,609.00, void_invoices 925.00 — the exposure ladder the close reads top to bottom. The two invoice rungs are deliberately separate: open money is chased, void money is written off. INTERSECT or EXCEPT between rungs would collapse the ladder to one rung or none, and COUNT would print 0.01 where the void rung's 925.00 belongs.",
  },
  {
    id: "cs-750",
    tier: "hard",
    topic: "s5",
    universe: "month-close",
    title: "The wrap that saves the subtraction",
    brief:
      "From: Data engineer. Re: runbook — the wrap, final form.\n\nSQLite refuses parentheses around compound arms, so grouping moves inside a subquery. Document the final wrap: statuses EXCEPT the wrap of (methods UNION invoice statuses), counted.",
    ask: "Count statuses minus the subquery-wrapped union of payment methods and invoice statuses.",
    template: `SELECT {1}(*) AS surviving FROM (
  SELECT status FROM orders
  EXCEPT
  SELECT v FROM (
    SELECT method AS v FROM payments
    {2}
    SELECT status AS v FROM {3}));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The wrap receipt is one figure, so the compound is wrapped in COUNT(*).",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the wrap's operator",
        why: "Inside the wrap, methods and billing states merge into a 5-word pile first.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the wrap's second table",
        why: "Billing states (open, paid, void) complete the wrapped pile.",
      },
    ],
    distractors: ["SUM", "JOIN", "WHERE"],
    walkthrough:
      "The wrap builds methods ∪ billing states = 5 words; statuses subtract that pile and all 4 survive (no lifecycle word is a till word or billing state) — the wrapped count prints 4. The parenthesis version would be a syntax error; the wrap is the portable form the runbook mandates. JOIN or WHERE in the wrap's operator slot are parse errors, orders has no method column, and SUM(*) is not SQL.",
  },
];

