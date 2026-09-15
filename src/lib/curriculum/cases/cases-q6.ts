// Case batch Q6 — Module 4 (subqueries & CTEs) cases cs-1151…cs-1200, wave 6.
import type { CaseStudy } from "./types";

export const casesQ6: CaseStudy[] = [
  {
    id: "cs-1151",
    tier: "easy",
    topic: "q5",
    universe: "month-close",
    title: "The status census, staged",
    brief:
      "From: Billing lead. Re: the mix report.\n\nThe mix report starts from a census: how many orders sit in each status. Stage that census in a derived table first, then count the statuses whose census line runs past seven — the derived stage does the grouping so the outer query can judge it.",
    ask: "Count order statuses that occur more than seven times.",
    template: `SELECT {1}(*) AS busy_statuses
FROM (
  SELECT status, COUNT(*) AS n FROM orders GROUP BY {2}
)
WHERE n > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census tally",
        why: "The deliverable is how many statuses clear the bar. COUNT(*) collapses the staged rows to that number.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the census key",
        why: "The census is one line per status: the stage groups by the status column. Grouping by created_at would census days instead.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the census bar",
        why: "More than seven orders makes a status busy. The bar is a filter constant and never appears in the output cells.",
      },
    ],
    distractors: ["AVG", "5", "created_at"],
    walkthrough:
      "The staged census holds four lines — 52 delivered, 30 shipped, 14 pending, 7 cancelled — and three of them clear the seven-order bar; only the cancelled census line sits under it. Lowering the bar to 5 lets the cancelled line through for 4; grouping the stage by created_at censuses days, where every line is a 1; and AVG(*) is not a census the outer query can count.",
  },
  {
    id: "cs-1152",
    tier: "easy",
    topic: "q5",
    universe: "funnel",
    title: "The month league, staged",
    brief:
      "From: Growth lead. Re: the seasonality read.\n\nThe order book spans more than a year, and the league table wants to know how many distinct months actually played. Stage the month buckets with one derived table — strftime chops created_at into months — and count the buckets.",
    ask: "Count the distinct months in which orders were placed.",
    template: `SELECT {1}(*) AS active_months
FROM (
  SELECT strftime('%Y-{2}', created_at) AS mo, COUNT(*) AS n
  FROM orders
  GROUP BY {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the league tally",
        why: "The deliverable is how many month buckets exist. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: "%m",
        kind: "keyword",
        label: "the month chop",
        why: "The format '%Y-%m' keys a bucket per calendar month. '%d' would chop by day-of-month and scramble months together.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the bucket key",
        why: "The stage must group by its own month bucket. Grouping by customer_id would league customers, not months.",
      },
    ],
    distractors: ["SUM", "%d", "%%", "customer_id"],
    walkthrough:
      "Fourteen month buckets come back — the book has been playing for fourteen straight months. Chopping with '%d' instead folds every first-of-month into one bucket and the league shrinks; a bare '%%' formats to a literal and leagues the whole book into a single line; grouping by customer_id leagues accounts, not time; and SUM(*) cannot count buckets.",
  },
  {
    id: "cs-1153",
    tier: "easy",
    topic: "q5",
    universe: "catalog",
    title: "The showcase shelf",
    brief:
      "From: Catalog manager. Re: the endcap decision.\n\nThe endcap goes to the shelf that moves in the fewest distinct baskets — the product that needs the spotlight. Stage the per-category basket counts in a derived table, then let the outer query pick the floor.",
    ask: "Print the category with the fewest distinct baskets.",
    template: `SELECT {1}
FROM (
  SELECT p.category AS category, COUNT(DISTINCT o.id) AS n
  FROM order_items oi
  JOIN products p ON p.id = {2}
  JOIN orders o ON o.id = oi.order_id
  GROUP BY p.category
)
ORDER BY n {3}
LIMIT 1;`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf name",
        why: "The endcap needs the shelf's name: the outer query projects the staged category column.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the catalog bridge",
        why: "Line items reach the shelf through product_id — the key that joins baskets to categories.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the floor sort",
        why: "The fewest baskets sits at the bottom of the league: ASC sorts the stage's counts upward and LIMIT 1 takes the floor.",
      },
    ],
    distractors: ["name", "oi.id", "DESC"],
    walkthrough:
      "The staged league counts distinct baskets per shelf — from Accessories' 54 down to Fitness' 13 — and the floor is Fitness: 13 distinct baskets, the shelf that earns the endcap. Sorting DESC hands the endcap to Accessories' 54 instead; joining products on oi.id mis-keys baskets to line-item ids; and the staged table has no name column to project.",
  },
  {
    id: "cs-1154",
    tier: "easy",
    topic: "q5",
    universe: "expense",
    title: "The premium vendor atlas",
    brief:
      "From: Spend analyst. Re: the four-figure vendor note.\n\nVendors bill in different rhythms, and the note wants the ones whose AVERAGE line clears 400 euros. Stage the per-vendor averages in a derived table, then count the vendors above the mark.",
    ask: "Count vendors whose average expense line tops 400 euros.",
    template: `SELECT {1}(*) AS premium_vendors
FROM (
  SELECT vendor, AVG(amount_cents) AS a FROM expenses GROUP BY {2}
)
WHERE a > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the atlas tally",
        why: "The note wants how many vendors average above the mark. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: "vendor",
        kind: "keyword",
        label: "the staging key",
        why: "One staged line per vendor: the stage groups by the vendor column.",
      },
      {
        answer: "40000",
        kind: "number",
        noVerify: true,
        label: "the premium mark, in cents",
        why: "400 euros is 40000 cents in the ledger's storage. The mark is a filter constant and never appears in the output.",
      },
    ],
    distractors: ["MAX", "20000", "id"],
    walkthrough:
      "Two vendors average above 400 euros a line: Atlas Property at 1,200 and Skyline Travel at 840.33. Halving the mark to 200 euros lets AdWorks (326.43) and DevTools (305) through for 4; grouping the stage by id averages each line against itself and seventeen lines clear; and MAX(*) cannot stage averages.",
  },
  {
    id: "cs-1155",
    tier: "easy",
    topic: "q5",
    universe: "month-close",
    title: "The five-figure accounts",
    brief:
      "From: Billing lead. Re: the key-account list.\n\nTen thousand euros of lifetime invoicing separates the key accounts from the long tail. Stage each account's invoice total in a derived table, then count the accounts whose staged sum crosses the mark.",
    ask: "Count customers with lifetime invoicing above 10,000 euros.",
    template: `SELECT {1}(*) AS six_figures
FROM (
  SELECT customer_id, {2}(amount_cents) AS s FROM invoices GROUP BY customer_id
)
WHERE s > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the key-account tally",
        why: "The list's size is the deliverable. COUNT(*) counts the staged accounts clearing the bar.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime stage",
        why: "Lifetime invoicing is a SUM per account, staged once in the derived table. MAX would stage the single biggest invoice instead.",
      },
      {
        answer: "1000000",
        kind: "number",
        noVerify: true,
        label: "the key-account bar, in cents",
        why: "10,000 euros is 1,000,000 cents in the ledger's storage. The bar is a filter constant, never an output figure.",
      },
    ],
    distractors: ["MAX", "AVG", "3000000"],
    walkthrough:
      "Three accounts have crossed ten thousand euros of lifetime invoicing — Alice at 26,629 heads them. Staging MAX instead asks who holds the single biggest invoice, and most of the book does at this scale; staging AVG asks whose typical invoice is five figures, a different and larger club; and lifting the bar to 30,000 euros empties the list — even Alice tops out at 26,629.",
  },
  {
    id: "cs-1156",
    tier: "medium",
    topic: "q5",
    universe: "growth",
    title: "The shipped map, staged twice",
    brief:
      "From: Growth lead. Re: the regional fulfillment map.\n\nThe map colors regions by shipped revenue, and the callout goes to regions clearing 4,000 euros. That takes two stages: an inner stage pairing each order with its region, and an outer stage summing per region — then the callout list falls out.",
    ask: "List regions with shipped revenue above 4,000 euros.",
    template: `SELECT {1} FROM (
  SELECT region, SUM(t) AS s FROM (
    SELECT c.region AS region, o.total AS t
    FROM customers c JOIN orders o ON o.customer_id = c.id
    WHERE o.status = {2}
  ) GROUP BY region
) WHERE s > {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the map key",
        why: "The callout names regions: the outermost projection prints the staged region column.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the fulfillment gate",
        why: "The map is drawn from shipped revenue only — the inner stage filters before any grouping happens.",
      },
      {
        answer: "4000",
        kind: "number",
        noVerify: true,
        label: "the callout bar",
        why: "Regions above 4,000 shipped euros make the callout. The bar is a map constant, never an output figure.",
      },
    ],
    distractors: ["AVG", "5000", "2500"],
    walkthrough:
      "The inner stage pairs every shipped order with its region; the outer stage sums to EU 5,262.94, US 4,226.10 and APAC 2,507.68 — and two regions clear the 4,000 callout: EU and US. Lifting the bar to 5,000 leaves EU alone; dropping it to 2,500 adds APAC for three; and AVG in the projection seat prints a number where a region name belongs.",
  },
  {
    id: "cs-1157",
    tier: "medium",
    topic: "q5",
    universe: "funnel",
    title: "The busy regulars",
    brief:
      "From: Growth lead. Re: the habituation cut.\n\nA premium average means little from a one-order wonder. Stage each customer's average ticket AND order count, then keep the accounts that clear 400 euros with more than one order — the busy premium cut.",
    ask: "Count customers averaging above 400 euros across more than one order.",
    template: `SELECT {1}(*) AS busy_premium
FROM (
  SELECT customer_id, AVG(total) AS a, COUNT(*) AS c
  FROM orders
  GROUP BY customer_id
)
WHERE a > {2} AND c > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the cut tally",
        why: "The cut's size is the deliverable. COUNT(*) counts the staged accounts passing both gates.",
      },
      {
        answer: "400",
        kind: "number",
        noVerify: true,
        label: "the premium gate",
        why: "A 400-euro average ticket makes an account premium. The gate is a metric constant, never an output figure.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the busy gate",
        why: "More than one order makes the average a habit rather than a fluke. The gate is part of the cut's definition.",
      },
    ],
    distractors: ["350", "450", "0"],
    walkthrough:
      "Four accounts clear both gates — a 400-euro average built on real repeat business. Loosening the premium gate to 350 admits a fifth; tightening to 450 thins the cut to 2; and dropping the busy gate to zero lets the one-order wonders back in for 6 — the exact flukes the cut exists to exclude.",
  },
  {
    id: "cs-1158",
    tier: "medium",
    topic: "q5",
    universe: "expense",
    title: "The squeeze band",
    brief:
      "From: Spend analyst. Re: the mid-tier vendor note.\n\nThe vendor book has giants and minnows; the note wants the middle. Stage each vendor's single biggest claim, then keep the vendors whose ceiling sits between 400 and 1,300 euros — the squeeze band.",
    ask: "List vendors whose largest claim sits between 400 and 1,300 euros.",
    template: `SELECT {1} FROM (
  SELECT vendor, MAX(amount_cents) AS mx FROM expenses GROUP BY vendor
) WHERE mx > {2} AND mx < {3};`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the note's name column",
        why: "The note names vendors: the outer query projects the staged vendor column.",
      },
      {
        answer: "40000",
        kind: "number",
        noVerify: true,
        label: "the band floor, in cents",
        why: "400 euros is 40000 cents in the ledger's storage. The band floor is a filter constant, never an output figure.",
      },
      {
        answer: "130000",
        kind: "number",
        noVerify: true,
        label: "the band ceiling, in cents",
        why: "1,300 euros is 130000 cents. The ceiling excludes the giants from the mid-tier note.",
      },
    ],
    distractors: ["AVG", "30000", "200000"],
    walkthrough:
      "The staged ceilings run Atlas 1,200, Skyline 1,680, AdWorks 450 and DevTools 329 — and two vendors sit inside the band: Atlas and AdWorks. Widening the floor to 300 euros adds DevTools for three; lifting the ceiling past 200,000 cents lets Skyline's 1,680 giant into a mid-tier note; and AVG in the projection seat prints a number where a vendor belongs.",
  },
  {
    id: "cs-1159",
    tier: "medium",
    topic: "q5",
    universe: "month-close",
    title: "The repeat-billing accounts",
    brief:
      "From: Billing lead. Re: the relationship read.\n\nOne invoice is a transaction; several are a relationship. Stage each account's invoice count in a derived table, then count the accounts that have been billed more than once.",
    ask: "Count customers holding more than one invoice.",
    template: `SELECT {1}(*) AS repeat_accounts
FROM (
  SELECT customer_id, COUNT(*) AS n FROM invoices GROUP BY {2}
)
WHERE n > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the relationship tally",
        why: "The read wants how many accounts hold multiple invoices. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account key",
        why: "The stage is one line per account: grouping by customer_id counts each account's invoices.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the repeat bar",
        why: "More than one invoice makes the account a repeat. The bar is a definition constant, never an output figure.",
      },
    ],
    distractors: ["status", "issued_on", "2"],
    walkthrough:
      "Eight accounts have been billed more than once — 28 invoices spread across 14 customers, with the repeats carrying most of the book. Tightening the bar to two invoices drops the count to 5; grouping the stage by status instead counts the three status lines, where only the paid book repeats; and grouping by issued_on censuses days, where almost nothing repeats.",
  },
  {
    id: "cs-1160",
    tier: "medium",
    topic: "q5",
    universe: "catalog",
    title: "The deep benches, staged",
    brief:
      "From: Supplier auditor. Re: the stockout-readiness note.\n\nA deep bench absorbs a stockout. Stage each supplier's product count in a derived table, then count the suppliers stocking three or more products.",
    ask: "Count suppliers stocking at least three products.",
    template: `SELECT {1}(*) AS deep_benches
FROM (
  SELECT supplier_id, COUNT(*) AS n FROM products GROUP BY {2}
)
WHERE n >= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the readiness tally",
        why: "The note wants how many suppliers run deep benches. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the bench key",
        why: "One staged line per supplier: the stage groups by the supplier key.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the depth bar",
        why: "Three or more products makes a bench deep. The bar is a policy constant, never an output figure.",
      },
    ],
    distractors: ["id", "price", "2"],
    walkthrough:
      "Four of the six suppliers stock at least three products — the deep benches. Grouping the stage by id instead counts one product per line and nothing clears the bar; grouping by price benches every distinct price point, also singleton lines; and lowering the bar to 2 counts every supplier, since nobody stocks just one.",
  },
  {
    id: "cs-1161",
    tier: "hard",
    topic: "q5",
    universe: "funnel",
    title: "The delivered pyramid",
    brief:
      "From: Growth lead. Re: the self-referencing bar.\n\nHere is the subtle version of the pace check: the bar is not the storewide average — it is the average of the STAGED totals themselves. Build the delivered-spend stage, then compare every staged total against the average OF that stage. Two queries, one derived table reused by the bar.",
    ask: "Count customers whose delivered-order spend tops the staged average.",
    template: `SELECT {1}(*) AS above_staged
FROM (
  SELECT customer_id, SUM(total) AS s
  FROM orders WHERE status = {2}
  GROUP BY customer_id
)
WHERE s > (SELECT {3}(s) FROM (
  SELECT customer_id, SUM(total) AS s
  FROM orders WHERE status = 'delivered'
  GROUP BY customer_id
));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pyramid tally",
        why: "The deliverable is how many staged totals clear the stage's own mean. COUNT(*) returns it.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the stage gate",
        why: "The pyramid is built from the delivered book — both the stage and its bar read the same slice.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the staged mean",
        why: "The bar is the average of the staged totals themselves. MAX would stage the biggest total, which nothing beats.",
      },
    ],
    distractors: ["'shipped'", "MAX", "MIN"],
    walkthrough:
      "Five delivered-book totals clear the stage's own mean — the pyramid's tip. Rebuilding both stages from the shipped book asks the same question of a different slice; staging MAX as the bar makes it each total against the champion, which nobody strictly beats; and staging MIN drops the bar to the smallest total, letting nearly every account through.",
  },
  {
    id: "cs-1162",
    tier: "hard",
    topic: "q5",
    universe: "month-close",
    title: "The settled pyramid",
    brief:
      "From: Billing lead. Re: the settled-heavy read.\n\nThe book-wide per-account norm is the average of EVERY account's invoiced total — all statuses blended. Which settled accounts carry a paid total above that blended norm? Stage the paid sums, stage the blended mean, and count the accounts above it.",
    ask: "Count customers whose paid total tops the blended per-account average.",
    template: `SELECT {1}(*) AS settled_heavy
FROM (
  SELECT customer_id, SUM(amount_cents) AS s
  FROM invoices WHERE status = {2}
  GROUP BY customer_id
)
WHERE s > (SELECT {3}(s) FROM (
  SELECT SUM(amount_cents) AS s FROM invoices GROUP BY customer_id
));`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the settled tally",
        why: "The read wants the size of the settled-heavy club. COUNT(*) returns it.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled gate",
        why: "The stage reads the paid book only — the blended norm is deliberately computed from all statuses.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the blended norm",
        why: "The norm is the average account total across the whole book. MAX would stage the largest account total, which nothing beats.",
      },
    ],
    distractors: ["'open'", "MAX", "MIN"],
    walkthrough:
      "Four settled accounts carry a paid total above the blended per-account norm — the settled pyramid's body. Swapping the gate to the open book finds nobody: every open holder's in-flight total sits under the blended norm; staging MAX as the norm makes the bar unbeatable; and staging MIN drops it to the smallest account total, which all eight settled accounts clear.",
  },
  {
    id: "cs-1163",
    tier: "hard",
    topic: "q5",
    universe: "fraud",
    title: "The ledger-line tier",
    brief:
      "From: Fraud analyst. Re: the vendor-tier screen.\n\nThe ledger's typical line is its average claim. Vendors whose AVERAGE line runs above that typical line are the tier worth watching — stage the per-vendor averages, scale the ledger line, and list the tier.",
    ask: "Count vendors averaging above the ledger's typical line.",
    template: `SELECT {1}(*) AS tier_vendors
FROM (
  SELECT vendor, AVG(amount_cents) AS a FROM expenses GROUP BY {2}
)
WHERE a > {3} * (SELECT AVG(amount_cents) FROM expenses);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tier tally",
        why: "The screen reports how many vendors make the tier. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: "vendor",
        kind: "keyword",
        label: "the stage key",
        why: "One staged line per vendor: the stage groups by the vendor column.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the tier multiplier",
        why: "The tier is defined against the ledger line itself — a multiplier of one. Scaling is a screen constant, never an output figure.",
      },
    ],
    distractors: ["MAX", "1.2", "1.5"],
    walkthrough:
      "The ledger's typical line is 706 euros, and two vendors average above it: Atlas Property at 1,200 and Skyline Travel at 840.33. Scaling the line by 1.2 lifts it to 847 and drops Skyline for a one-vendor tier; scaling by 1.5 keeps only Atlas; and grouping the stage by anything else builds the wrong rows entirely.",
  },
  {
    id: "cs-1164",
    tier: "hard",
    topic: "q5",
    universe: "catalog",
    title: "The price pyramid",
    brief:
      "From: Catalog manager. Re: the mid-shelf supplier note.\n\nEach supplier's shelf has a ceiling — its priciest product. The note wants the suppliers whose ceiling sits in the mid band: above 60 euros, below 150. Stage the ceilings, then band them.",
    ask: "List suppliers whose priciest product sits between 60 and 150 euros.",
    template: `SELECT {1} FROM (
  SELECT supplier_id, MAX(price) AS mx FROM products GROUP BY supplier_id
) WHERE mx > {2} AND mx < {3};`,
    slots: [
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the note's key",
        why: "The note references suppliers by key: the outer query projects the staged supplier_id.",
      },
      {
        answer: "60",
        kind: "number",
        noVerify: true,
        label: "the band floor",
        why: "The mid band opens at 60 euros. The floor is a note constant, never an output figure.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the band ceiling",
        why: "The band closes below 150 euros, excluding the two premium-ceiling suppliers.",
      },
    ],
    distractors: ["AVG", "30", "200"],
    walkthrough:
      "The staged ceilings run 199.99, 149.99, 119, 79, 65 and 39.99 — four suppliers sit inside the band: the 149.99, 119, 79 and 65 shelves. Dropping the floor to 30 lets the 39.99 shelf in for five; lifting the ceiling to 200 adds the 199.99 giant for five; and AVG in the key seat prints a number where a supplier belongs.",
  },
  {
    id: "cs-1165",
    tier: "hard",
    topic: "q5",
    universe: "month-close",
    title: "The split settlements",
    brief:
      "From: Finance ops. Re: the partial-payment audit.\n\nAn invoice settled in one payment is clean; an invoice split across several payments deserves a look. Stage the per-invoice payment counts, then count the invoices settled more than once.",
    ask: "Count invoices settled with more than one payment.",
    template: `SELECT {1}(*) AS split_bills
FROM (
  SELECT invoice_id, COUNT(*) AS n FROM payments GROUP BY {2}
)
WHERE n > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audit tally",
        why: "The audit wants how many invoices were settled in pieces. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: "invoice_id",
        kind: "keyword",
        label: "the stage key",
        why: "One staged line per invoice: the stage groups by the invoice key.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the split bar",
        why: "More than one payment makes the settlement split. The bar is an audit constant, never an output figure.",
      },
    ],
    distractors: ["method", "paid_on", "2"],
    walkthrough:
      "Five invoices were settled in more than one payment — the split settlements the audit flags. Grouping the stage by method instead counts two settlement channels; grouping by paid_on censuses days, where almost nothing repeats; and tightening the bar to two extra payments empties the flag list — no invoice needed three.",
  },
  {
    id: "cs-1166",
    tier: "easy",
    topic: "q6",
    universe: "funnel",
    title: "The big buckets, chained",
    brief:
      "From: Growth lead. Re: the mix report, CTE edition.\n\nThe status census works better as a named stage: a WITH clause builds the census once, and the main query judges it. Count the statuses whose bucket holds more than twenty orders.",
    ask: "Count order statuses holding more than twenty orders.",
    template: `WITH s AS (
  SELECT status, COUNT(*) AS n FROM orders GROUP BY {1}
)
SELECT {2}(*) AS big_buckets FROM s WHERE n > {3};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the bucket key",
        why: "The CTE builds one bucket per status: it groups by the status column.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bucket tally",
        why: "The main query counts the buckets clearing the bar. COUNT(*) over the CTE returns it.",
      },
      {
        answer: "20",
        kind: "number",
        noVerify: true,
        label: "the bucket bar",
        why: "More than twenty orders makes a bucket big. The bar is a metric constant, never an output figure.",
      },
    ],
    distractors: ["created_at", "MAX", "10"],
    walkthrough:
      "The CTE stages four buckets — 52, 30, 14 and 7 — and two of them hold more than twenty orders: delivered and shipped. Grouping by created_at buckets the census by day, where nothing tops twenty; lowering the bar to ten admits the pending bucket for three; and MAX(*) cannot count buckets.",
  },
  {
    id: "cs-1167",
    tier: "easy",
    topic: "q6",
    universe: "funnel",
    title: "The February crest",
    brief:
      "From: Growth lead. Re: the seasonality headline.\n\nThe headline month is the one that moved the most orders. Chain a CTE that buckets orders by month, then read off the crest — the top bucket after sorting.",
    ask: "Print the month with the most orders, with its count.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS mo, {1}(*) AS n
  FROM orders GROUP BY mo
)
SELECT mo, n FROM m ORDER BY {2} {3} LIMIT 1;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bucket builder",
        why: "Each month's bucket holds its order count: the CTE aggregates with COUNT(*).",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the crest sort key",
        why: "The crest is found by sorting the staged counts — the CTE's n column — not the month labels.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the top-down read",
        why: "The biggest month comes first under DESC. ASC would crown the emptiest month the headline.",
      },
    ],
    distractors: ["SUM", "mo", "ASC"],
    walkthrough:
      "February 2024 is the crest: 9 orders, the busiest bucket in the book. Sorting by the month label instead reads the calendar and crowns the latest month; sorting ASC hands the headline to the emptiest bucket; and SUM in the builder seat has no column to add — the bucket is a count of rows.",
  },
  {
    id: "cs-1168",
    tier: "easy",
    topic: "q6",
    universe: "expense",
    title: "The leanest book, chained",
    brief:
      "From: Spend analyst. Re: the efficiency shout-out.\n\nThe vendor league usually reads top-down; this note flips it. Stage the per-vendor totals in a CTE, then shout out the leanest book — the smallest lifetime total in the ledger.",
    ask: "Print the vendor with the smallest lifetime expense total.",
    template: `WITH v AS (
  SELECT vendor, SUM(amount_cents) AS s FROM expenses GROUP BY vendor
)
SELECT {1} FROM v ORDER BY s {2} LIMIT {3};`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the shout-out name",
        why: "The shout-out names the vendor: the main query projects the staged vendor column.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the bottom-up read",
        why: "The leanest book sits at the bottom of the league: ASC sorts the staged totals upward.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the shout-out depth",
        why: "One vendor takes the shout-out. The depth is a presentation constant, never an output figure.",
      },
    ],
    distractors: ["category", "DESC", "2"],
    walkthrough:
      "DevTools Inc runs the leanest book: 1,525 euros of lifetime claims against Atlas's 16,800. Sorting DESC would shout out the giant instead; deepening the shout-out to two vendors drags AdWorks onto the note; and the staged league has no category column — the CTE projects vendor and total only.",
  },
  {
    id: "cs-1169",
    tier: "easy",
    topic: "q6",
    universe: "catalog",
    title: "The bench census, chained",
    brief:
      "From: Supplier auditor. Re: the named-bench list.\n\nThe bench census reads better with names than keys. Chain a CTE that joins products to suppliers and counts each named bench, then keep the benches running at least three products, best-first.",
    ask: "List suppliers with at least three products, widest bench first.",
    template: `WITH b AS (
  SELECT s.name AS name, COUNT(*) AS n
  FROM products p JOIN suppliers s ON s.id = p.supplier_id
  GROUP BY s.name
)
SELECT {1} FROM b WHERE n >= {2} ORDER BY {3} DESC, name;`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the named row",
        why: "The list prints supplier names: the CTE already joined the catalog to the supplier roll, so the name is staged and ready.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the depth bar",
        why: "At least three products makes the list. The bar is a policy constant, never an output figure.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the width sort",
        why: "Widest bench first means sorting by the staged count — the CTE's n column — with the name breaking ties.",
      },
    ],
    distractors: ["supplier_id", "2", "s.id"],
    walkthrough:
      "Four suppliers clear the three-product bar — Nordic Gadgets, Midwest Hardware, Shenzhen Electro and Pacific Textiles, three products apiece, listed alphabetically inside the tie. Lowering the bar to two drags the two-product benches onto the list; and the CTE stages names, not ids — supplier_id and s.id exist nowhere in b.",
  },
  {
    id: "cs-1170",
    tier: "easy",
    topic: "q6",
    universe: "month-close",
    title: "The open pot, chained",
    brief:
      "From: Billing lead. Re: the in-flight money read.\n\nThe in-flight read needs two figures off the same slice: how many open invoices are in flight, and what they add up to. One CTE stages the open book; the main query reads both figures off it.",
    ask: "Print the open-invoice count and the open pot.",
    template: `WITH o AS (
  SELECT amount_cents FROM invoices WHERE status = {1}
)
SELECT {2}(*) AS open_rows, {3}(amount_cents) AS pot FROM o;`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the in-flight badge",
        why: "The staged slice is the open book. 'paid' would stage the settled book and the read becomes history.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "The first figure is how many invoices are in flight: COUNT(*) over the staged rows.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot builder",
        why: "The second figure is what they add up to: SUM over the staged amounts. AVG would print the typical invoice instead.",
      },
    ],
    distractors: ["'paid'", "MAX", "AVG"],
    walkthrough:
      "The open book stages 6 invoices worth 19,609.00 euros in flight. Staging the paid book instead reads 21 settled rows and a 66,443-euro pot — history, not exposure; MAX in the pot seat prints the single biggest open invoice, 6,148, not the pot; and AVG prints the typical open invoice where the total belongs.",
  },
  {
    id: "cs-1171",
    tier: "medium",
    topic: "q6",
    universe: "funnel",
    title: "The above-par club, chained",
    brief:
      "From: Growth lead. Re: the parity read.\n\nThe chain works in two links: one CTE stages every customer's lifetime total, the next collapses those totals into the par value. Then the main query counts who clears par — two CTEs, one join between them.",
    ask: "Count customers whose lifetime spend tops the per-account average.",
    template: `WITH t AS (
  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id
), a AS (
  SELECT AVG(s) AS v FROM t
)
SELECT {1}(*) AS above_par FROM t, a WHERE s > {2} * {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the club tally",
        why: "The read wants the size of the above-par club. COUNT(*) returns it.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the parity factor",
        why: "Par is the staged average itself — a factor of one. Scaling is a read constant, never an output figure.",
      },
      {
        answer: "v",
        kind: "keyword",
        label: "the par column",
        why: "The second CTE stages the average under the name v: the comparison reads that column, joined in from a.",
      },
    ],
    distractors: ["a", "2", "MAX"],
    walkthrough:
      "Five customers clear par — their lifetime totals beat the staged average of 2,177.08. Doubling the factor asks who clears twice par and the club thins to 3; reading a column named a confuses the CTE's name with its column and the query falls over; and MAX has no seat in either the tally or the product.",
  },
  {
    id: "cs-1172",
    tier: "medium",
    topic: "q6",
    universe: "month-close",
    title: "The settlement gap, chained",
    brief:
      "From: Billing lead. Re: the settled-versus-inflight read.\n\nTwo CTEs, two pots: one collapses the paid book, the other the open book. The read is the gap — how far the settled pot runs ahead of the in-flight pot, computed entirely from the staged slices.",
    ask: "Print the gap between the paid pot and the open pot.",
    template: `WITH o AS (
  SELECT SUM(amount_cents) AS s FROM invoices WHERE status = 'open'
), p AS (
  SELECT SUM(amount_cents) AS s FROM invoices WHERE status = {1}
)
SELECT (SELECT s FROM {2}) - (SELECT s FROM {3}) AS gap;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled badge",
        why: "The second CTE collapses the paid book — the badge decides which slice the p stage holds.",
      },
      {
        answer: "p",
        kind: "keyword",
        label: "the settled stage",
        why: "The gap's left side reads the settled pot out of the p CTE by name.",
      },
      {
        answer: "o",
        kind: "keyword",
        label: "the in-flight stage",
        why: "The gap's right side reads the open pot out of the o CTE — settled minus in-flight is the headline.",
      },
    ],
    distractors: ["'open'", "void", "o"],
    walkthrough:
      "The settled pot runs 46,834.00 euros ahead of the in-flight pot — 66,443 settled against 19,609 open. Pointing the second CTE at the open book zeroes the gap entirely; pointing it at the void book flips the gap negative, 92.50 against 19,609; and reading the o stage on the left subtracts the open pot from itself.",
  },
  {
    id: "cs-1173",
    tier: "medium",
    topic: "q6",
    universe: "growth",
    title: "The region podium, chained",
    brief:
      "From: Growth lead. Re: the revenue map headline.\n\nThe map's headline region takes one CTE: join orders to customers, sum per region, sort, and take the top step of the podium. The join key inside the CTE is what pairs every order with its region.",
    ask: "Print the region with the highest total order revenue.",
    template: `WITH r AS (
  SELECT c.region AS region, {1}(o.total) AS s
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region
)
SELECT {2} FROM r ORDER BY s DESC LIMIT {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue builder",
        why: "The headline ranks regions by TOTAL revenue: the CTE sums every order's total per region.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the headline name",
        why: "The headline names the region: the main query projects the staged region column.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the podium step",
        why: "The headline takes the top step only. The step count is a presentation constant, never an output figure.",
      },
    ],
    distractors: ["AVG", "name", "2"],
    walkthrough:
      "EU tops the revenue map at 15,089.23 total — the headline region on sheer volume. Building the CTE with AVG instead hands the crown to LATAM, whose two orders average a lofty 426.22; the staged league holds regions, not customer names; and widening the podium to two steps drags APAC's 11,605.45 under the headline.",
  },
  {
    id: "cs-1174",
    tier: "medium",
    topic: "q6",
    universe: "catalog",
    title: "The busy shelves, chained",
    brief:
      "From: Catalog manager. Re: the shelf-traffic read.\n\nShelf traffic is distinct baskets, not line items. Chain a CTE that counts DISTINCT baskets per shelf — joining line items to catalog to orders — then count the shelves whose traffic clears twenty.",
    ask: "Count categories with more than twenty distinct baskets.",
    template: `WITH b AS (
  SELECT p.category AS category, COUNT(DISTINCT o.id) AS n
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  GROUP BY {1}
)
SELECT {2}(*) AS busy_shelves FROM b WHERE n > {3};`,
    slots: [
      {
        answer: "p.category",
        kind: "keyword",
        label: "the shelf key",
        why: "The CTE buckets traffic per shelf: it groups by the joined category column.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf tally",
        why: "The main query counts the shelves clearing the traffic bar. COUNT(*) over the CTE returns it.",
      },
      {
        answer: "20",
        kind: "number",
        noVerify: true,
        label: "the traffic bar",
        why: "More than twenty distinct baskets makes a shelf busy. The bar is a read constant, never an output figure.",
      },
    ],
    distractors: ["p.name", "MIN", "25"],
    walkthrough:
      "The staged league runs from Accessories' 54 baskets down to Fitness' 13 — and five shelves clear twenty: Accessories, Audio, Electronics, Video and Wearables. Grouping by product name instead buckets per product, where only one headset tops twenty; lifting the bar to 25 drops Wearables' 23 for four; and MIN(*) cannot tally shelves.",
  },
  {
    id: "cs-1175",
    tier: "medium",
    topic: "q6",
    universe: "supplier",
    title: "The mid-bench band, chained",
    brief:
      "From: Supplier auditor. Re: the mid-priced bench note.\n\nThe bench read needs the middle: suppliers whose AVERAGE product price sits above 60 euros but at most 100. Stage the per-supplier averages in a CTE, then band them.",
    ask: "Count suppliers averaging above 60 and at most 100 euros.",
    template: `WITH b AS (
  SELECT supplier_id, AVG(price) AS a FROM products GROUP BY supplier_id
)
SELECT {1}(*) AS mid_bench FROM b WHERE a > {2} AND a <= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the band tally",
        why: "The note wants how many suppliers sit in the band. COUNT(*) over the CTE returns it.",
      },
      {
        answer: "60",
        kind: "number",
        noVerify: true,
        label: "the band floor",
        why: "The band opens above 60 euros. The floor is a note constant, never an output figure.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the band ceiling",
        why: "The band closes at most 100 euros — the ceiling is inclusive by design.",
      },
    ],
    distractors: ["MAX", "30", "74"],
    walkthrough:
      "Three suppliers average inside the band — benches at 72.00, 69.50 and 74.83 euros a product. Dropping the floor to 30 drags the 43- and 31-euro benches in for five; tightening the ceiling to 74 sheds the 74.83 bench for two; and MAX(*) cannot band averages.",
  },
  {
    id: "cs-1176",
    tier: "hard",
    topic: "q6",
    universe: "funnel",
    title: "The whale tier, chained",
    brief:
      "From: Growth lead. Re: the whale definition.\n\nA whale is not someone above par — it is someone at TWICE the per-account average. Chain three CTEs: totals, the average of the totals, then the filtered tier. The chain reads top-down and each link feeds the next.",
    ask: "Count customers whose lifetime spend tops twice the per-account average.",
    template: `WITH t AS (
  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id
), m AS (
  SELECT {1}(s) AS v FROM t
), big AS (
  SELECT customer_id, s FROM t, m WHERE s > {2} * v
)
SELECT {3}(*) AS whales FROM big;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the par builder",
        why: "The middle link collapses every staged total into one par value: AVG over the first CTE.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the whale factor",
        why: "Twice par makes a whale. The factor is a definition constant, never an output figure.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tier tally",
        why: "The final link's size is the deliverable: COUNT(*) over the whale CTE.",
      },
    ],
    distractors: ["MAX", "1", "SUM"],
    walkthrough:
      "Par is 2,177.08, so the whale line sits at 4,354.17 — and three customers clear it: the book's three heaviest accounts. Building par with MAX instead stages the champion total as the bar, which nothing twice-clears; dropping the factor to one redefines the whole above-par club as whales for five; and SUM as the par builder stages the book's entire mass, which no single account doubles.",
  },
  {
    id: "cs-1177",
    tier: "hard",
    topic: "q6",
    universe: "expense",
    title: "The vendor podium, chained",
    brief:
      "From: Spend analyst. Re: the top-two note.\n\nThe podium note takes two names: stage the vendor totals in a CTE, sort the league, and keep the top two steps. The depth limit lives in the main query; the staging lives in the WITH.",
    ask: "Print the two vendors with the highest lifetime totals.",
    template: `WITH v AS (
  SELECT vendor, category, SUM(amount_cents) AS s FROM expenses GROUP BY vendor
)
SELECT {1} FROM v ORDER BY {2} {3} LIMIT 2;`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the note's name column",
        why: "The note names vendors: the main query projects the staged vendor column — the stage also carries category for context.",
      },
      {
        answer: "s",
        kind: "keyword",
        label: "the league sort key",
        why: "The podium ranks by the staged total — the CTE's s column — not by name.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the top-down sort",
        why: "The top two need the biggest totals first: DESC sorts the staged league downward.",
      },
    ],
    distractors: ["category", "ASC", "name"],
    walkthrough:
      "The podium holds Atlas Property at 16,800 and AdWorks Media at 4,570 — the two heaviest books in the ledger. Projecting category instead hands the note shelf names; sorting by the vendor name alphabetizes the league and serves the wrong two; and sorting ASC serves the two leanest books.",
  },
  {
    id: "cs-1178",
    tier: "hard",
    topic: "q6",
    universe: "month-close",
    title: "The settlement spread, chained",
    brief:
      "From: Finance ops. Re: the channel note.\n\nThe close note profiles the settlement channels: stage each method's average ticket and volume, then keep the channels whose average settlement tops 2,000 euros with at least two settlements on record.",
    ask: "List methods averaging above 2,000 euros with at least two settlements.",
    template: `WITH p AS (
  SELECT method, {1}(amount_cents) AS a, COUNT(*) AS n FROM payments GROUP BY method
)
SELECT {2} FROM p WHERE a > 200000 AND n >= {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the ticket builder",
        why: "The channel profile is built on the AVERAGE settlement: AVG over the staged amounts.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "the channel name",
        why: "The note names channels: the main query projects the staged method column.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the volume floor",
        why: "At least two settlements makes the average meaningful. The floor is a note constant, never an output figure.",
      },
    ],
    distractors: ["COUNT", "status", "12"],
    walkthrough:
      "Both channels qualify: wires average 2,931.64 across 11 settlements and cards 2,335.25 across 16 — the note lists wire and card. Staging COUNT as the ticket prints settlement volumes of 16 and 11, which clear no 2,000-euro bar; the staged table holds no status column; and lifting the volume floor to 12 keeps only the card channel.",
  },
  {
    id: "cs-1179",
    tier: "hard",
    topic: "q6",
    universe: "fraud",
    title: "The status pots, chained",
    brief:
      "From: Fraud analyst. Re: the heaviest slice.\n\nThe invoice book splits into status pots. Stage each pot's total in a CTE, then read off the heaviest slice — one sort, one limit, and the answer names where the money actually sits.",
    ask: "Print the invoice status with the highest total amount.",
    template: `WITH inv AS (
  SELECT status, COUNT(*) AS n, SUM(amount_cents) AS s FROM invoices GROUP BY status
)
SELECT {1} FROM inv ORDER BY {2} {3} LIMIT 1;`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the slice name",
        why: "The answer names the slice: the main query projects the staged status column.",
      },
      {
        answer: "s",
        kind: "keyword",
        label: "the pot sort key",
        why: "The heaviest slice is found by sorting the staged totals — the CTE's s column — not the invoice counts.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "The heaviest pot comes first under DESC. ASC would name the emptiest slice the heaviest.",
      },
    ],
    distractors: ["customer_id", "ASC", "SUM"],
    walkthrough:
      "The paid pot is the heaviest slice: 66,443 euros settled, against 19,609 open and 92.50 void. The staged league holds no customer_id to sort or project; sorting ASC crowns the void pot — 92.50 euros, the book's rounding error; and SUM is an aggregate the staged league already collapsed — it is not a column anymore.",
  },
  {
    id: "cs-1180",
    tier: "hard",
    topic: "q6",
    universe: "catalog",
    title: "The mid-price shelves, chained",
    brief:
      "From: Catalog manager. Re: the shelf-average band.\n\nThe repricing band targets shelves whose AVERAGE product price sits between 50 and 100 euros. Stage the per-shelf averages in a CTE, band them, and print the qualifiers priciest-first.",
    ask: "List categories averaging above 50 and below 100 euros.",
    template: `WITH c AS (
  SELECT category, AVG(price) AS a FROM products GROUP BY category
)
SELECT {1} FROM c WHERE a > {2} AND a < {3} ORDER BY a DESC;`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf name",
        why: "The band lists shelves by name: the main query projects the staged category column.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the band floor",
        why: "The band opens above 50 euros. The floor is a repricing constant, never an output figure.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the band ceiling",
        why: "The band closes below 100 euros. The ceiling is a repricing constant, never an output figure.",
      },
    ],
    distractors: ["name", "40", "110"],
    walkthrough:
      "Two shelves average inside the band: Video at 84.50 and Electronics at 57.83 — printed priciest-first. Dropping the floor to 40 drags Apparel's 41.75 in for three; lifting the ceiling to 110 adds Audio's 109.66 for three; and the staged league has category names, not product names.",
  },
  {
    id: "cs-1181",
    tier: "easy",
    topic: "q7",
    universe: "funnel",
    title: "The countdown ladder",
    brief:
      "From: Growth lead. Re: the sprint countdown.\n\nThe sprint board counts down from twenty in steps of three until it drops below the floor. A recursive CTE walks that ladder: a seed row, an arm that subtracts, a guard that stops it. Count the rungs.",
    ask: "Count the rungs of the countdown from 20 in steps of 3, stopping above 3.",
    template: `WITH RECURSIVE c(n) AS (
  SELECT {1} UNION ALL
  SELECT n {2} FROM c WHERE n > {3}
)
SELECT COUNT(*) AS rungs FROM c;`,
    slots: [
      {
        answer: "20",
        kind: "number",
        noVerify: true,
        label: "the seed value",
        why: "The ladder starts at twenty — the recursive CTE's first row is the seed select.",
      },
      {
        answer: "- 3",
        kind: "keyword",
        label: "the descending arm",
        why: "Each rung subtracts three: the arm must move DOWN the number line or the guard never trips.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the guard floor",
        why: "The walk continues while the current rung exceeds three. The guard is what makes the recursion stop.",
      },
    ],
    distractors: ["15", "- 1", "10"],
    walkthrough:
      "The ladder runs 20, 17, 14, 11, 8, 5, 2 — seven rungs, stopping because 2 fails the guard. Seeding at 15 shortens the walk to five; arming the step at minus one grinds down one at a time for eighteen rungs; raising the guard to ten stops the walk after five; and any arm that climbs instead of descends would never trip the guard at all.",
  },
  {
    id: "cs-1182",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The doubling ladder",
    brief:
      "From: Growth lead. Re: the growth-curve demo.\n\nThe deck's compounding slide needs the doubling ladder: start at one, keep doubling while the value stays under one hundred, then count every rung the walk touched — including the one that overshot.",
    ask: "Count the rungs of doubling from 1 while under 100.",
    template: `WITH RECURSIVE d(n) AS (
  SELECT {1} UNION ALL
  SELECT n {2} FROM d WHERE n < {3}
)
SELECT COUNT(*) AS rungs FROM d;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the seed value",
        why: "Compounding starts from one — the seed select lays the first rung.",
      },
      {
        answer: "* 2",
        kind: "keyword",
        label: "the doubling arm",
        why: "Each rung doubles: the arm multiplies by two, climbing until the guard trips.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the guard ceiling",
        why: "The walk keeps doubling while the current rung sits under one hundred. The guard stops the climb.",
      },
    ],
    distractors: ["2", "* 3", "63"],
    walkthrough:
      "The walk touches 1, 2, 4, 8, 16, 32, 64 and 128 — eight rungs, with 128 the overshoot the guard allowed before tripping. Seeding at two skips the first rung for seven; trebling instead lands 1, 3, 9, 27, 81, 243 for six; and lowering the guard to sixty-three stops the walk at 64 for seven.",
  },
  {
    id: "cs-1183",
    tier: "easy",
    topic: "q7",
    universe: "month-close",
    title: "The monthly ticks",
    brief:
      "From: Billing lead. Re: the statement calendar.\n\nStatements go out on the fifteenth, month after month, through January 2025. A recursive CTE ticks the calendar: seed the first statement date, arm the next-month modifier, guard the horizon. Count the statement dates.",
    ask: "Count monthly ticks from 2024-01-15 through 2025-01-15.",
    template: `WITH RECURSIVE m(d) AS (
  SELECT '2024-01-15' UNION ALL
  SELECT date(d, {1}) FROM m WHERE d < {2}
)
SELECT {3}(*) AS ticks FROM m;`,
    slots: [
      {
        answer: "'+1 month'",
        kind: "keyword",
        label: "the monthly arm",
        why: "Each tick advances one month: the arm is a quoted date modifier the engine understands.",
      },
      {
        answer: "'2025-01-15'",
        kind: "keyword",
        label: "the horizon guard",
        why: "The walk continues while the current date sits before the horizon. The guard is what stops the calendar.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tick counter",
        why: "The deliverable is how many statement dates the walk touched. COUNT(*) over the recursive rows returns it.",
      },
    ],
    distractors: ["'+1 day'", "'+1 year'", "'2024-06-15'"],
    walkthrough:
      "The calendar ticks thirteen times: January 2024 through January 2025, one statement a month. Arming a daily tick walks 367 dates before the guard trips; arming a yearly tick touches just two; and pulling the horizon back to June 2024 stops the walk after six statements — the guard, not the arm, decides when the recursion ends.",
  },
  {
    id: "cs-1184",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "The doubling peak",
    brief:
      "From: Growth lead. Re: the capacity curve.\n\nThe capacity curve doubles from one while the load stays at or under five hundred — and the deck wants the PEAK the curve actually reached, overshoot included. The guard uses at-or-under, so the first value past the line still lands.",
    ask: "Find the peak value doubling from 1 while at most 500.",
    template: `WITH RECURSIVE o(n) AS (
  SELECT {1} UNION ALL
  SELECT n * 2 FROM o WHERE n <= {2}
)
SELECT {3}(n) AS peak FROM o;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the seed value",
        why: "The curve starts from one — the seed select lays the base rung.",
      },
      {
        answer: "500",
        kind: "number",
        noVerify: true,
        label: "the guard ceiling",
        why: "The walk keeps doubling while the current value is at most five hundred — the overshoot still lands.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak reader",
        why: "The deliverable is the highest rung the walk touched: MAX over the recursive rows reads the peak.",
      },
    ],
    distractors: ["3", "100", "MIN"],
    walkthrough:
      "The walk touches 1 through 512: the guard allows 500, so 512 lands as the overshoot and is the peak. Seeding at three shifts the whole curve to 3 through 768; lowering the guard to one hundred stops the walk at 128; and MIN reads the seed, not the peak — the lowest rung the walk touched.",
  },
  {
    id: "cs-1185",
    tier: "medium",
    topic: "q7",
    universe: "fraud",
    title: "The halving decay",
    brief:
      "From: Fraud analyst. Re: the decay trace.\n\nA shrinking balance halves every period from five thousand until it bottoms out at one. The trace is a recursive walk: seed the balance, arm the halving, guard the floor. Count the rows the trace printed.",
    ask: "Count the rungs halving 5000 until the floor of 1.",
    template: `WITH RECURSIVE h(n) AS (
  SELECT 5000 UNION ALL
  SELECT n / {1} FROM h WHERE n > {2}
)
SELECT {3}(*) AS rungs FROM h;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the halving divisor",
        why: "Each rung halves the balance: the arm divides by two, always moving DOWN toward the floor.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the guard floor",
        why: "The walk continues while the balance exceeds one. The guard stops the decay at the bottom rung.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the trace counter",
        why: "The trace's length is the deliverable: COUNT(*) over the recursive rows.",
      },
    ],
    distractors: ["/ 3", "0", "10"],
    walkthrough:
      "The trace prints thirteen rows: 5000 halving down 2500, 1250, 625, 312, 156, 78, 39, 19, 9, 4, 2, 1 — integer division rounds 312 down and the floor of one stops the walk. Trebling instead decays faster, nine rows; dropping the guard to zero walks one rung further to the zero row; and raising it to ten stops at nineteen.",
  },
  {
    id: "cs-1186",
    tier: "medium",
    topic: "q7",
    universe: "funnel",
    title: "The weekly stamps",
    brief:
      "From: Growth lead. Re: the release calendar.\n\nThe release train ships weekly from January first, and the calendar asks how many ship dates the first quarter actually holds. A recursive CTE ticks the weeks — seed, arm, guard — and the count is the calendar.",
    ask: "Count weekly ticks from 2024-01-01 through 2024-03-01.",
    template: `WITH RECURSIVE w(d) AS (
  SELECT '2024-01-01' UNION ALL
  SELECT date(d, {1}) FROM w WHERE d < {2}
)
SELECT {3}(*) AS stamps FROM w;`,
    slots: [
      {
        answer: "'+7 day'",
        kind: "keyword",
        label: "the weekly arm",
        why: "Each stamp advances one week: the arm is the quoted seven-day modifier.",
      },
      {
        answer: "'2024-03-01'",
        kind: "keyword",
        label: "the quarter guard",
        why: "The walk continues while the current stamp sits before March first. The guard bounds the calendar.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the stamp counter",
        why: "The calendar's length is the deliverable: COUNT(*) over the recursive rows.",
      },
    ],
    distractors: ["'+1 day'", "'+14 day'", "'2024-02-15'"],
    walkthrough:
      "Ten weekly stamps land between January first and March first — the last one stepping past the guard into March, because the guard checks the current date before arming the next. A daily arm would walk sixty-one dates; a fortnightly arm lands six; and pulling the guard to mid-February trims the calendar to eight.",
  },
  {
    id: "cs-1187",
    tier: "hard",
    topic: "q7",
    universe: "expense",
    title: "The handshake total",
    brief:
      "From: Spend analyst. Re: the pairing arithmetic.\n\nThe classic accumulator walks two columns at once: the counter climbs one at a time while the running total absorbs each new count. Walk it from one to ten — the final total is the handshake number every pairing diagram knows.",
    ask: "Find the running total after counting 1 through 10.",
    template: `WITH RECURSIVE t(n, s) AS (
  SELECT {1}, 1 UNION ALL
  SELECT n {2}, s + n + 1 FROM t WHERE n < {3}
)
SELECT s FROM t ORDER BY n DESC LIMIT 1;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the seed pair",
        why: "The walk starts at count one with total one — the seed select lays both columns' first row.",
      },
      {
        answer: "+ 1",
        kind: "keyword",
        label: "the counter arm",
        why: "The counter climbs one per step: the arm adds one to n while the total column absorbs the climb.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the count guard",
        why: "The walk continues while the counter sits under ten. The guard bounds the accumulation.",
      },
    ],
    distractors: ["3", "+ 2", "5"],
    walkthrough:
      "The running total lands on 55 — one plus two plus three, through ten: the handshake number. Seeding the walk at three skips the early climb and lands on 50; arming the counter to jump two steps counts only the odd rungs and lands on 31; and pulling the guard to five stops the walk at fifteen.",
  },
  {
    id: "cs-1188",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "The yearly marks",
    brief:
      "From: Growth lead. Re: the anniversary read.\n\nThe anniversary walk marks January first year after year toward 2030, and the read wants the LAST mark the walk touched — the newest date in the ladder, overshoot included.",
    ask: "Find the last yearly mark from 2024-01-01 toward 2030.",
    template: `WITH RECURSIVE y(d) AS (
  SELECT '2024-01-01' UNION ALL
  SELECT date(d, {1}) FROM y WHERE d < {2}
)
SELECT {3}(*) AS marks FROM y;`,
    slots: [
      {
        answer: "'+1 year'",
        kind: "keyword",
        label: "the yearly arm",
        why: "Each mark advances one year: the arm is the quoted year modifier.",
      },
      {
        answer: "'2030-01-01'",
        kind: "keyword",
        label: "the horizon guard",
        why: "The walk continues while the current mark sits before 2030. The guard bounds the ladder.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the mark counter",
        why: "The anniversary read wants how many January firsts the walk touched: COUNT(*) over the recursive rows.",
      },
    ],
    distractors: ["'+1 month'", "'+5 year'", "MIN"],
    walkthrough:
      "The walk marks seven January firsts, 2024 through 2030, with the guard letting the horizon mark land on its way out. A monthly arm marks seventy-three dates on the same horizon; a five-year arm touches three; and MIN(*) cannot tally rows.",
  },
  {
    id: "cs-1189",
    tier: "hard",
    topic: "q7",
    universe: "month-close",
    title: "The decay floor",
    brief:
      "From: Billing lead. Re: the write-down ladder.\n\nA stale balance writes down to a third of itself each pass, from nine hundred, while it still exceeds one hundred. The ladder is a recursive walk with a division arm — count the rungs the write-down printed.",
    ask: "Count the rungs dividing 900 by 3 while above 100.",
    template: `WITH RECURSIVE h(n) AS (
  SELECT {1} UNION ALL
  SELECT n / {2} FROM h WHERE n > {3}
)
SELECT COUNT(*) AS rungs FROM h;`,
    slots: [
      {
        answer: "900",
        kind: "number",
        noVerify: true,
        label: "the seed balance",
        why: "The write-down starts from nine hundred — the seed select lays the first rung.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the decay divisor",
        why: "Each pass keeps a third: the arm divides by three, always moving DOWN toward the floor.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the guard floor",
        why: "The walk continues while the balance exceeds one hundred. The guard stops the write-down.",
      },
    ],
    distractors: ["1200", "2", "50"],
    walkthrough:
      "The ladder prints three rungs: 900, 300, 100 — the guard allows 100 because it checks the current rung before arming the next, and 100 divided by three would land below the floor anyway. Seeding at twelve hundred walks 400 and 133 for four rungs; arming a halving decay reaches 112 then 56 for four rungs; and lowering the guard to fifty lets one more rung land.",
  },
  {
    id: "cs-1190",
    tier: "medium",
    topic: "q7",
    universe: "catalog",
    title: "The reach ladder",
    brief:
      "From: Catalog manager. Re: the stockout drill.\n\nThe stockout drill walks two columns at once: a day counter climbing one at a time and a reach doubling from one. The drill runs six days — the reach on the final row is how far a one-unit shortage could spread.",
    ask: "Find the reach after doubling daily for six days.",
    template: `WITH RECURSIVE x(n, m) AS (
  SELECT 1, 1 UNION ALL
  SELECT n + 1, m {1} FROM x WHERE n < {2}
)
SELECT {3}(m) AS reach FROM x;`,
    slots: [
      {
        answer: "* 2",
        kind: "keyword",
        label: "the doubling arm",
        why: "The reach doubles every day: the arm multiplies the m column by two while the day counter climbs.",
      },
      {
        answer: "6",
        kind: "number",
        noVerify: true,
        label: "the drill guard",
        why: "The drill runs while the day counter sits under six — six days, six climbs.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the reach reader",
        why: "The deliverable is the final reach: MAX over the recursive rows reads the widest rung.",
      },
    ],
    distractors: ["* 3", "+ 2", "5"],
    walkthrough:
      "The drill walks six rows — days one through six with reach 1, 2, 4, 8, 16, 32 — and MAX reads 32: the shortage's spread after six doublings. Trebling the reach lands on 243; arming an additive climb of two reaches only 11; and cutting the drill to five days reads 16, one doubling short.",
  },
  {
    id: "cs-1191",
    tier: "easy",
    topic: "q8",
    universe: "month-close",
    title: "The paid-billing podium",
    brief:
      "From: Billing lead. Re: the settled-revenue crown.\n\nThe crown belongs to the account with the biggest PAID invoice total — settled money, not promises. Stage the paid book per account in a CTE, sort it, and read the top step.",
    ask: "Print the customer with the highest paid invoice total.",
    template: `WITH p AS (
  SELECT c.name AS name, SUM(i.amount_cents) AS s
  FROM customers c JOIN invoices i ON i.customer_id = c.id
  WHERE i.status = {1}
  GROUP BY c.name
)
SELECT name, s FROM p ORDER BY s {2} LIMIT {3};`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled badge",
        why: "The crown is settled money: the CTE stages the paid book only. 'open' crowns promises instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown sort",
        why: "The top step needs the biggest total first: DESC sorts the staged podium downward.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the podium depth",
        why: "One name takes the crown. The depth is a presentation constant, never an output figure.",
      },
    ],
    distractors: ["'open'", "ASC", "2"],
    walkthrough:
      "Alice Chen takes the crown at 20,481 euros of settled invoicing. Staging the open book instead crowns her in-flight 6,148 — a promise, not a settlement; sorting ASC hands the crown to the smallest payer; and deepening the podium to two drags the runner-up under the crown.",
  },
  {
    id: "cs-1192",
    tier: "easy",
    topic: "q8",
    universe: "month-close",
    title: "The split bills",
    brief:
      "From: Finance ops. Re: the partial-payment audit.\n\nThe audit cross-checks settlement discipline: stage each invoice's payment count in a CTE, then count the invoices that took more than one payment to settle.",
    ask: "Count invoices settled with more than one payment.",
    template: `WITH pp AS (
  SELECT invoice_id, COUNT(*) AS n FROM payments GROUP BY invoice_id
)
SELECT {1}(*) AS split_bills FROM pp WHERE n {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audit tally",
        why: "The audit wants how many invoices were split. COUNT(*) over the staged rows returns it.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the split test",
        why: "A split means MORE than one payment: the comparison points up. '=' would count the clean single-payment invoices.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-payment mark",
        why: "One payment is the clean case the audit measures against. The mark is a definition constant, never an output figure.",
      },
    ],
    distractors: ["<", "=", "MAX"],
    walkthrough:
      "Five invoices took more than one payment to settle — the split bills the audit flags. Flipping the test to '=' counts the seventeen clean single-payment invoices instead; '<' finds nobody, since no invoice settled in zero payments; and MAX(*) cannot tally staged rows.",
  },
  {
    id: "cs-1193",
    tier: "easy",
    topic: "q8",
    universe: "funnel",
    title: "The Pacific whales, chained",
    brief:
      "From: Growth lead. Re: the regional whale count.\n\nWhales are accounts with four-figure lifetime spend. The Pacific read stages every account's total in a CTE, then counts the APAC rows that clear the bar — the region gate rides in the main query.",
    ask: "Count APAC customers with lifetime spend above 1,000 euros.",
    template: `WITH spend AS (
  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id
)
SELECT {1}(*) AS pacific_whales
FROM customers c, spend
WHERE c.id = spend.customer_id AND c.region = {2} AND s > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the whale tally",
        why: "The read wants how many Pacific accounts make the whale cut. COUNT(*) returns it.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region gate",
        why: "The sweep is scoped to the Pacific chapter. 'EU' counts the home region's whales instead.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the whale bar",
        why: "Four figures of lifetime spend makes a whale. The bar is a definition constant, never an output figure.",
      },
    ],
    distractors: ["'EU'", "MAX", "2000"],
    walkthrough:
      "Four APAC accounts clear four figures of lifetime spend — the Pacific whale pod, paced by Maya Patel and Farid Nasser. Gating on 'EU' instead finds three whales in the home region; lifting the bar to 2,000 euros thins the pod to just two; and MAX(*) cannot count a staged join — it has no rows to reduce.",
  },
  {
    id: "cs-1194",
    tier: "easy",
    topic: "q8",
    universe: "expense",
    title: "The double-norm claims",
    brief:
      "From: Fraud analyst. Re: the outlier screen, capstone cut.\n\nThe screen flags claims worth more than TWICE the ledger's typical line. Stage the ledger in a CTE, build the norm from the same stage, and count the claims that clear double.",
    ask: "Count expenses worth more than twice the ledger's average line.",
    template: `WITH e AS (
  SELECT vendor, amount_cents FROM expenses
)
SELECT {1}(*) AS outliers FROM e
WHERE amount_cents > {2} * (SELECT {3}(amount_cents) FROM e);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the screen tally",
        why: "The screen reports how many claims clear double the norm. COUNT(*) returns it.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the outlier factor",
        why: "Twice the norm makes an outlier. The factor is a screen constant, never an output figure.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the norm builder",
        why: "The norm is the ledger's average claim, read off the staged rows. MAX would stage the biggest claim as the norm.",
      },
    ],
    distractors: ["MAX", "MIN", "3"],
    walkthrough:
      "One claim clears twice the 706-euro norm: Skyline's 1,680-euro trip — Atlas's rents land just under the double bar. Tripling the norm empties the screen entirely; building the norm with MIN drops it to 220 and flags seventeen claims; and MAX in the norm seat stages 1,680, which nothing twice-clears.",
  },
  {
    id: "cs-1195",
    tier: "medium",
    topic: "q8",
    universe: "funnel",
    title: "The US delivery audit",
    brief:
      "From: Growth lead. Re: the regional delivery audit.\n\nThe audit cross-references the fulfillment log with the region roll: stage the US account keys in a CTE, then count the delivered orders belonging to them.",
    ask: "Count delivered orders belonging to US customers.",
    template: `WITH us AS (
  SELECT id FROM customers WHERE region = {1}
)
SELECT {2}(*) AS audited
FROM orders WHERE customer_id IN (SELECT id FROM us) AND status = {3};`,
    slots: [
      {
        answer: "'US'",
        kind: "keyword",
        label: "the audit region",
        why: "The audit is scoped to the US chapter: the CTE stages its account keys.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audit tally",
        why: "The audit wants how many delivered orders the US accounts hold. COUNT(*) returns it.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the milestone badge",
        why: "The audit reads the delivered stage of the funnel. 'shipped' audits an earlier milestone.",
      },
    ],
    distractors: ["'APAC'", "'shipped'", "SUM"],
    walkthrough:
      "Five delivered orders belong to the two US accounts — the audit's headline, and every one of the US book's deliveries is accounted for. Scoping the CTE to APAC instead audits twenty-one delivered orders; reading the shipped milestone counts ten US shipments in flight; and SUM(*) cannot audit a membership test — it has nothing to add.",
  },
  {
    id: "cs-1196",
    tier: "medium",
    topic: "q8",
    universe: "expense",
    title: "The ledger-line tier, chained",
    brief:
      "From: Spend analyst. Re: the vendor tier, staged.\n\nThe tier holds vendors whose AVERAGE line runs above the ledger's own typical line. Stage the per-vendor averages in a CTE, scale the ledger line, sort the tier heaviest-first.",
    ask: "List vendors averaging above the ledger's typical line, heaviest first.",
    template: `WITH v AS (
  SELECT vendor, AVG(amount_cents) AS a FROM expenses GROUP BY vendor
)
SELECT {1} FROM v WHERE a > {2} * (SELECT AVG(amount_cents) FROM expenses) ORDER BY a {3};`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the tier name",
        why: "The tier is a list of vendor names: the main query projects the staged vendor column.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the tier factor",
        why: "The tier line is the ledger average itself — a factor of one. Scaling is a screen constant, never an output figure.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "The tier reads heaviest first: DESC sorts the staged averages downward.",
      },
    ],
    distractors: ["category", "1.2", "ASC"],
    walkthrough:
      "Two vendors clear the ledger's 706-euro line: Atlas Property at 1,200 and Skyline Travel at 840.33, printed heaviest-first. Scaling the line by 1.2 lifts it to 847 and drops Skyline for a one-vendor tier; sorting ASC prints the same tier upside down; and the staged league holds vendor names, not shelf names.",
  },
  {
    id: "cs-1197",
    tier: "hard",
    topic: "q8",
    universe: "fraud",
    title: "The staged sweep",
    brief:
      "From: Fraud analyst. Re: the cross-ledger probe, staged edition.\n\nThe cent-collision probe now stages the invoice ledger in a CTE first — a named slice the EXISTS probe reads like a table. The trap is unchanged: qualify the outer column, or the probe eats its own tail.",
    ask: "Count expenses matching an invoice amount, via a staged ledger.",
    template: `WITH ledger AS (
  SELECT amount_cents FROM invoices
)
SELECT {1}(*) AS parked
FROM expenses
WHERE {2} (
  SELECT 1 FROM ledger WHERE ledger.amount_cents = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the collision tally",
        why: "The probe reports how many expense lines have an invoice twin. COUNT(*) returns that number — zero.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the twin probe",
        why: "The test is whether a matching amount exists in the staged ledger. NOT EXISTS sweeps the complement instead.",
      },
      {
        answer: "expenses.amount_cents",
        kind: "keyword",
        label: "the qualified outer column",
        why: "The correlation must reach outward to the expense row. Unqualified, the name binds to the staged ledger's own column and the probe degenerates.",
      },
    ],
    distractors: ["amount_cents", "ledger.amount_cents", "NOT EXISTS"],
    walkthrough:
      "Zero expense lines find a twin in the staged ledger — the honest headline, third telling, same truth. The trap lives in the correlation: an unqualified amount_cents — or ledger.amount_cents outright — reads the STAGED column, turning the probe into a tautology that matches all 36 lines; only the table-qualified expenses.amount_cents reaches outward; and NOT EXISTS sweeps the 36 unmatched lines.",
  },
  {
    id: "cs-1198",
    tier: "hard",
    topic: "q8",
    universe: "funnel",
    title: "The whale cohort, staged",
    brief:
      "From: Growth lead. Re: the whale census.\n\nThe census needs two figures off one staged slice: stage every account's lifetime total, filter the whale line in a second CTE, then read the cohort's size AND its combined pot off the same stage.",
    ask: "Print the count and combined spend of accounts above 1,000 euros.",
    template: `WITH spend AS (
  SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id
), vip AS (
  SELECT s FROM spend WHERE s > {1}
)
SELECT (SELECT {2}(*) FROM vip) AS members,
       (SELECT {3}(s) FROM vip) AS pot;`,
    slots: [
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the whale bar",
        why: "Four figures of lifetime spend makes the cohort. The bar is a definition constant, never an output figure.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the cohort size",
        why: "The first figure is how many accounts make the cohort: COUNT(*) over the staged rows.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the cohort pot",
        why: "The second figure is what the cohort spends combined: SUM over the staged totals, read twice off one CTE.",
      },
    ],
    distractors: ["2000", "MAX", "AVG"],
    walkthrough:
      "Eight accounts make the whale cohort, and together they carry 29,033.37 euros of lifetime spend — the census reads both figures off one staged slice. Lifting the bar to 2,000 trims the cohort to five and the pot to 24,789.63; MAX in the size seat cannot count; and AVG prints the cohort's typical spend where the combined pot belongs.",
  },
  {
    id: "cs-1199",
    tier: "hard",
    topic: "q8",
    universe: "month-close",
    title: "The open premium, chained",
    brief:
      "From: Billing lead. Re: the exposure read.\n\nThe exposure read asks how much of the OPEN book bills above the storewide norm. Stage the norm in a CTE, join it into the main query, and count the open invoices clearing it — the bar comes from the stage, not a hand-typed number.",
    ask: "Count open invoices above the storewide invoice average.",
    template: `WITH bar AS (
  SELECT AVG(amount_cents) AS v FROM invoices
)
SELECT {1}(*) AS open_above
FROM invoices, bar
WHERE status = {2} AND amount_cents > {3} * bar.v;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the exposure tally",
        why: "The read wants how many open invoices run above the norm. COUNT(*) returns it.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the exposure badge",
        why: "The read is about in-flight money. 'paid' measures the settled book against the same bar.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the norm factor",
        why: "Above the norm means a factor of one. Scaling is a read constant, never an output figure.",
      },
    ],
    distractors: ["'paid'", "MAX", "1.5"],
    walkthrough:
      "Three open invoices bill above the storewide norm of 3,106.32 — the exposure headline. Reading the paid book instead finds nine settled invoices above the same bar; scaling the norm by 1.5 thins the open count to two; and MAX in the tally seat cannot count a staged join.",
  },
  {
    id: "cs-1200",
    tier: "hard",
    topic: "q8",
    universe: "catalog",
    title: "The closing audit, chained",
    brief:
      "From: Catalog manager. Re: the double-bench outlier.\n\nThe final audit: which products cost more than TWICE their own supplier's average? Stage every supplier's bench average in a CTE, join it back to the catalog, and count the products clearing double — the module's last correlated read.",
    ask: "Count products priced above twice their supplier's average.",
    template: `WITH bench AS (
  SELECT supplier_id, AVG(price) AS v FROM products GROUP BY supplier_id
)
SELECT {1}(*) AS doubles
FROM products p, bench
WHERE p.price > {2} * bench.v AND p.supplier_id = bench.{3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audit tally",
        why: "The audit reports how many products outrun double their bench. COUNT(*) returns it.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the doubling factor",
        why: "Twice the bench average makes the outlier. The factor is an audit constant, never an output figure.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the bench key",
        why: "The join pairs each product with its OWN supplier's staged average: the key is supplier_id on both sides.",
      },
    ],
    distractors: ["MAX", "3", "id"],
    walkthrough:
      "One product costs more than twice its supplier's bench — the catalog's lone double-bench outlier. Tripling the factor empties the audit; joining on id keys products against bench rows that carry no id; and MAX in the tally seat cannot count the staged join.",
  },
];