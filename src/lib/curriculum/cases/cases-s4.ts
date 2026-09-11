// Case batch S4 — Module 3 (set ops & CASE) cases cs-751…cs-800.
// 50 cases: 17 easy / 16 medium / 17 hard across topics s1 (UNION stacks,
// finishers), s5 (Set chains), s6 (CASE WHEN). Every figure was probed
// against the live seed db (scripts/m3-facts*.ts) and is mechanically
// re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesS4: CaseStudy[] = [
  {
    id: "cs-751",
    tier: "easy",
    topic: "s1",
    universe: "fraud",
    title: "Lifecycle words meet spend words",
    brief:
      "From: Fraud analyst. Re: the controlled vocabulary audit.\n\nThe glossary claims fulfillment words and expense categories never collide. Prove the count: one deduplicated pile of order statuses and expense categories.",
    ask: "Stack order statuses with expense categories, deduplicated.",
    template: `SELECT status AS v FROM orders
{3}
SELECT {1} FROM {2};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "arm 2's word column",
        why: "Four spend words (Ads, Rent, Tools, Travel) join the four lifecycle words.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 2's table",
        why: "The spend vocabulary's home table — 36 bookings across four category words.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "One glossary entry per word: UNION appends both arms and collapses whole-row duplicates.",
      },
    ],
    distractors: ["SUM", "name", "INTERSECT"],
    walkthrough:
      "Eight rows: the two vocabularies are disjoint, so nothing dedups away — no lifecycle word is a spend word. That cleanliness is the glossary's claim, now proven. expenses has no name column for a wrong pick to read, and SUM(*) is not SQL — the pile is built from columns, not aggregates.",
  },
  {
    id: "cs-752",
    tier: "easy",
    topic: "s1",
    universe: "month-close",
    title: "Regions meet billing states",
    brief:
      "From: Controller. Re: the label inventory.\n\nThe close binder inventories its labels: customer regions and invoice statuses in one deduplicated column. Count what the inventory holds.",
    ask: "Stack customer regions with invoice statuses, deduplicated.",
    template: `SELECT region AS v FROM customers
{3}
SELECT status FROM {1}
ORDER BY v {2};`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Three billing words (open, paid, void) join the four region words.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Uppercase regions sort first, then the lowercase billing words — the inventory's reading order.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The inventory lists each label once; UNION appends and dedups.",
      },
    ],
    distractors: ["payments", "DESC", "INTERSECT"],
    walkthrough:
      "Seven rows: APAC, EU, LATAM, US sort first, then open, paid, void — two vocabularies, zero collisions. payments would swap the two till words in for the three billing states (six rows) and answer a different inventory line, and n is not a column the compound outputs. Seven is the label inventory's count.",
  },
  {
    id: "cs-753",
    tier: "easy",
    topic: "s1",
    universe: "supplier",
    title: "Vendors and customers, one list",
    brief:
      "From: Supplier auditor. Re: the payee master list.\n\nThe audit's master list merges expense vendors with customer names — one deduplicated, sorted column of every name we pay or get paid by.",
    ask: "Stack expense vendors with customer names, deduplicated and sorted.",
    template: `SELECT vendor AS v FROM expenses
{3}
SELECT {1} FROM {2}
ORDER BY v;`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "arm 2's name column",
        why: "Sixteen customer names join the four vendor names.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "Customer names live on the customers dimension — the demand side of the master list.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The master list keeps every name once; UNION collapses any repeat.",
      },
    ],
    distractors: ["city", "suppliers", "INTERSECT"],
    walkthrough:
      "Twenty rows: four vendors plus sixteen customers with zero overlap — the payee master list in one column, sorted. suppliers would swap the six supply-side names in (ten rows) and answer the other master list, and the compound outputs no city to stack. Twenty names is the audit's full universe of payees and payers.",
  },
  {
    id: "cs-754",
    tier: "easy",
    topic: "s1",
    universe: "expense",
    title: "Three ceilings, one column",
    brief:
      "From: Finance partner. Re: the ceiling stack.\n\nThe budget letter opens with three stacked ceilings: the biggest order, the biggest invoice, the biggest expense. Three scalar arms, dollars each.",
    ask: "Stack the MAX of order totals, invoice amounts and expense amounts.",
    template: `SELECT ROUND(MAX(total), 2) AS ceiling FROM orders
UNION ALL
SELECT {1}(amount_cents)/100.0 FROM {2}
UNION ALL
SELECT ROUND(MAX(amount_cents)/100.0, 2) FROM {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "arm 2's aggregate",
        why: "The biggest single invoice: 6,148.00 — the ceiling the letter quotes for billing.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Invoice money lives in amount_cents on the invoices ledger.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 3's table",
        why: "The spend ledger's biggest single booking: 1,680.00 in travel.",
      },
    ],
    distractors: ["MIN", "payments", "customers"],
    walkthrough:
      "Three ceilings: orders 1,088.44, invoices 6,148.00, expenses 1,680.00 — the budget letter's opening numbers. The invoice ceiling dwarfs the order ceiling because invoices bundle multiple orders per customer; that contrast is the letter's talking point. MIN would print floors instead of ceilings, and payments would swap the till's biggest receipt (a different document class) into the middle row.",
  },
  {
    id: "cs-755",
    tier: "easy",
    topic: "s5",
    universe: "catalog",
    title: "Chain receipt: spend, minus statuses, plus till",
    brief:
      "From: Data engineer. Re: runbook — the warm-down chain.\n\nThe chain table's warm-down line: expense categories EXCEPT order statuses UNION payment methods. Log the count.",
    ask: "Count categories EXCEPT statuses UNION payment methods.",
    template: `SELECT {1}(*) AS n FROM (
  SELECT category FROM expenses
  EXCEPT
  SELECT status FROM orders
  {2}
  SELECT {3} FROM payments);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt the runbook logs for the warm-down line.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "Left-to-right: the subtraction completes, then the till words append.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "Two till words (card, wire) join the 4 surviving categories.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "vendor"],
    walkthrough:
      "Left to right: categories ∖ statuses = 4 (disjoint vocabularies), then ∪ methods = 6 — the wrapped count's receipt. INTERSECT would read the append as a junction and collapse to 0, vendor would stack four payee names in for the categories, and SUM(*) is not SQL. Six is the warm-down line.",
  },
  {
    id: "cs-756",
    tier: "easy",
    topic: "s5",
    universe: "month-close",
    title: "Regions, till, billing — merged",
    brief:
      "From: Copy editor. Re: the ops glossary's middle page.\n\nThe glossary merges customer regions, payment methods and invoice statuses. Three vocabularies, one deduplicated list — verify the count.",
    ask: "Count the deduplicated merge of regions, payment methods and invoice statuses.",
    template: `SELECT {1}(*) AS vocab FROM (
  SELECT region FROM customers
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
        why: "The chain reads left to right; billing states append last.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "Three billing words (open, paid, void) complete the page.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "orders"],
    walkthrough:
      "Nine lines: 4 regions, 2 till words, 3 billing states — disjoint vocabularies, nothing dedups away. INTERSECT at arm 3 would annihilate the pile, orders would swap four lifecycle words in for the three billing states (ten lines), and SUM(*) is not SQL. Nine is the middle page's line count.",
  },
  {
    id: "cs-757",
    tier: "easy",
    topic: "s5",
    universe: "catalog",
    title: "Cities, statuses, till — the big pile",
    brief:
      "From: Copy editor. Re: the appendix's longest list.\n\nThe appendix merges cities, order statuses and payment methods into one deduplicated column. Confirm the line count before print.",
    ask: "Count the deduplicated merge of cities, order statuses and payment methods.",
    template: `SELECT COUNT(*) AS vocab FROM (
  SELECT city FROM customers
  UNION
  SELECT status FROM orders
  {1}
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; the till words append last.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "card and wire enter the pile — no collisions with cities or statuses.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 3's table",
        why: "Methods live on payments — card and wire are the two till words that complete the pile.",
      },
    ],
    distractors: ["INTERSECT", "region", "suppliers"],
    walkthrough:
      "Twenty-two lines: 16 cities, 4 lifecycle words, 2 till words — the appendix's longest list, with no word appearing twice. INTERSECT at arm 3 would collapse the pile to 0, region would stack the four region words in for the statuses, and suppliers has no method column. Twenty-two is the print run's number.",
  },
  {
    id: "cs-758",
    tier: "easy",
    topic: "s5",
    universe: "fraud",
    title: "Chain receipt: statuses, minus regions, plus billing",
    brief:
      "From: Data engineer. Re: runbook — the billing-chain line.\n\nThe chain table gains: order statuses EXCEPT customer regions UNION invoice statuses. Log the count this engine returns.",
    ask: "Count statuses EXCEPT regions UNION invoice statuses.",
    template: `SELECT {3}(*) AS n FROM (
  SELECT status FROM orders
  EXCEPT
  SELECT region FROM customers
  {1}
  SELECT status FROM {2});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "Left-to-right: the subtraction completes, then billing states append.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "Three billing words join the 4 surviving statuses — the two status vocabularies never collide.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: seven proves both operators ran as briefed.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "payments"],
    walkthrough:
      "Left to right: statuses ∖ regions = 4, then ∪ invoice statuses = 7 — the wrapped count's receipt, with the two status vocabularies never colliding. INTERSECT would junction the append and collapse to 0, and payments would swap two till words for the three billing states (six rows). Seven is the billing-chain line.",
  },
  {
    id: "cs-759",
    tier: "easy",
    topic: "s6",
    universe: "month-close",
    title: "The lifecycle buckets",
    brief:
      "From: Close analyst. Re: the three-bucket view.\n\nThe close reports orders as open (pending), closed (shipped or delivered) or dead (cancelled) using a simple CASE. Build the bucket census.",
    ask: "Bucket orders with a simple CASE into open, closed and dead; count each.",
    template: `SELECT CASE status WHEN {2} THEN 'open' WHEN 'cancelled' THEN 'dead' ELSE {1} END AS bucket,
       {3}(*) AS n
FROM orders
GROUP BY bucket
ORDER BY n DESC;`,
    slots: [
      {
        answer: "'closed'",
        kind: "keyword",
        label: "the ELSE label",
        why: "Everything that is not pending or cancelled — shipped and delivered — falls through to closed: 82 orders.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the first WHEN's status",
        why: "Pending maps to the open bucket: fourteen orders at the lifecycle's start.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bucket counter",
        why: "The census counts rows per bucket: closed 82, open 14, dead 7.",
      },
    ],
    distractors: ["SUM", "'shipped'", "MAX"],
    walkthrough:
      "Three buckets: closed 82 (shipped 30 + delivered 52), open 14, dead 7 — the lifecycle at a glance. The simple CASE maps one column against literal values and lets ELSE catch the rest, which is why only two WHENs are needed. SUM would add the '*' placeholder into an error, and a 'shipped' label would split the closed bucket the brief explicitly merges.",
  },
  {
    id: "cs-760",
    tier: "easy",
    topic: "s6",
    universe: "fraud",
    title: "The order-size bands",
    brief:
      "From: Fraud analyst. Re: the band census.\n\nThe runbook bands orders by size: big (200 and up), mid (80 to 200), small (under 80). Build the searched-CASE census.",
    ask: "Band orders by total with a searched CASE; count each band.",
    template: `SELECT CASE WHEN total >= {1} THEN 'big' WHEN total >= {3} THEN 'mid' ELSE 'small' END AS size,
       {2}(*) AS n
FROM orders
GROUP BY size
ORDER BY n DESC;`,
    slots: [
      {
        answer: "200",
        kind: "number",
        noVerify: true,
        label: "the big-band threshold",
        why: "Sixty-five orders reach 200 or more — the top band.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the band counter",
        why: "The census counts rows per band: big 65, mid 27, small 11.",
      },
      {
        answer: "80",
        kind: "number",
        noVerify: true,
        label: "the mid-band threshold",
        why: "Twenty-seven orders land between 80 and 200 — the tested-sequentially middle band.",
      },
    ],
    distractors: ["20", "SUM", "90"],
    walkthrough:
      "Three bands: big 65, mid 27, small 11 — the runbook's size census. The searched CASE tests WHENs top-down, so the 200 line must come first or the 80 line would swallow it (the classic first-match trap). A 20 threshold would leave only two bands' worth of separation and blur the census, and SUM would add the band labels instead of counting rows.",
  },
  {
    id: "cs-761",
    tier: "easy",
    topic: "s6",
    universe: "month-close",
    title: "The ELSE that NULLs",
    brief:
      "From: Data engineer. Re: runbook — the no-ELSE receipt.\n\nA CASE without ELSE returns NULL when nothing matches, and SUM quietly skips NULLs. Document both behaviors side by side for the pending counter.",
    ask: "Compare SUM(CASE with no ELSE) against the zero-filled variant.",
    template: `SELECT SUM(CASE WHEN status = 'pending' THEN 1 END) AS {1},
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE {2} END) AS zeroed
FROM {3};`,
    slots: [
      {
        answer: "nullable",
        kind: "keyword",
        label: "the no-ELSE column's alias",
        why: "The no-ELSE form returns NULL for the 89 non-pending rows — but SUM ignores them, so the printed figure is still 14.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the zero-fill value",
        why: "The ELSE 0 variant fills non-matches with zero — the same 14 survives the sum.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "Both idioms scan the same 103 order rows.",
      },
    ],
    distractors: ["1", "WHEN", "ORDER"],
    walkthrough:
      "Both columns print 14 — the pending count — but for different reasons: the no-ELSE CASE yields NULL on 89 rows and SUM skips NULLs, while ELSE 0 adds harmless zeros. The receipt documents why both idioms work and why COUNT(CASE … END) equals SUM(CASE … ELSE 0 END). An ELSE of 1 would count every order (103), and neither a keyword nor an aggregate survives as a column alias or an ELSE value.",
  },
  {
    id: "cs-762",
    tier: "easy",
    topic: "s6",
    universe: "fraud",
    title: "The NULL comparison trap",
    brief:
      "From: Data engineer. Re: runbook — the trap page.\n\nThe trap page needs the receipt: CASE WHEN shipped_at = NULL never fires, CASE WHEN shipped_at IS NULL always does. Print both counts.",
    ask: "Compare the = NULL CASE against the IS NULL CASE.",
    template: `SELECT SUM(CASE WHEN shipped_at = NULL THEN 1 ELSE 0 END) AS never,
       SUM(CASE WHEN shipped_at IS {1} THEN 1 ELSE {2} END) AS works
FROM {3};`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the predicate's keyword",
        why: "IS NULL is the only predicate that fires on NULL: 21 unshipped orders.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the ELSE fill",
        why: "The ELSE 0 keeps the sum at 21 — only the IS NULL rows contribute a one.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "The 103 orders carry 21 NULL shipping stamps.",
      },
    ],
    distractors: ["NOT", "1", "invoices"],
    walkthrough:
      "never 0, works 21 — the trap page's receipt. In SQL, = NULL evaluates to UNKNOWN for every row (even the NULL rows themselves), so the first CASE's ELSE 0 fires 103 times; IS NULL is the designed test and catches all 21 pending-and-cancelled unshipped orders. NOT would test inequality (still never matching NULL), and a 0 literal would make the predicate IS 0 — a syntax-level nonsense.",
  },
  {
    id: "cs-763",
    tier: "easy",
    topic: "s6",
    universe: "month-close",
    title: "The lifecycle reading order",
    brief:
      "From: Close analyst. Re: the report's sort.\n\nAlphabetical status order scrambles the lifecycle. Sort the status census by a CASE that ranks pending first, then shipped, delivered, cancelled.",
    ask: "Print the status census sorted by the CASE-defined lifecycle order.",
    template: `SELECT status, COUNT(*) AS n FROM orders
GROUP BY status
ORDER BY CASE {3} WHEN {1} THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 {2};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the first-ranked status",
        why: "Pending (14) leads the report — the lifecycle's starting gate.",
      },
      {
        answer: "END",
        kind: "keyword",
        label: "the CASE terminator",
        why: "Every CASE expression closes with END; without it the statement will not parse.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the CASE's tested column",
        why: "The sort key maps each row's status to its lifecycle rank before ordering.",
      },
    ],
    distractors: ["ASC", "THEN", "'region'"],
    walkthrough:
      "The census prints pending 14, shipped 30, delivered 52, cancelled 7 — the lifecycle in reading order rather than alphabetical scramble. The CASE maps each status to a rank and ORDER BY sorts on that computed value. ASC would tie-break the equal ranks arbitrarily after the CASE already ordered them, and THEN inside the sort expression is a syntax error — CASE keywords only live inside the CASE.",
  },
  {
    id: "cs-764",
    tier: "easy",
    topic: "s6",
    universe: "catalog",
    title: "The parity receipt",
    brief:
      "From: Data engineer. Re: runbook — the modulo trick.\n\nA quick determinism check: count orders with even ids using CASE. The receipt anchors the runbook's modulo page.",
    ask: "Count orders whose id is even, via CASE.",
    template: `SELECT SUM(CASE WHEN id % 2 = {1} THEN 1 ELSE 0 END) AS even_ids,
       {2}(*) AS total
FROM {3};`,
    slots: [
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the even remainder",
        why: "id % 2 = 0 marks even ids — 51 of the 103 orders.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the total counter",
        why: "The pairing figure: 103 total orders, 51 even and 52 odd.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "The receipt runs over the 103 order ids.",
      },
    ],
    distractors: ["1", "SUM", "invoices"],
    walkthrough:
      "even_ids 51 against a total of 103 — the modulo receipt, and the odd side is simply 103 − 51 = 52. A remainder of 1 would count the odd ids instead (52), and the second column needs COUNT(*) because SUM has already consumed the CASE: nesting aggregates or reusing SUM would count nothing meaningful. The trick generalizes to any bucketed-by-arithmetic split.",
  },
  {
    id: "cs-765",
    tier: "easy",
    topic: "s6",
    universe: "expense",
    title: "Fixed versus variable spend",
    brief:
      "From: Controller. Re: the cost-structure split.\n\nRent is the only fixed line; everything else is variable. Build the two-bucket view with CASE and count the bookings per side.",
    ask: "Split expense bookings into fixed (Rent) and variable (everything else).",
    template: `SELECT CASE WHEN category = {1} THEN 'fixed' ELSE 'variable' END AS kind,
       {2}(*) AS n
FROM {3}
GROUP BY kind
ORDER BY n DESC;`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the fixed-line test",
        why: "Fourteen monthly 1,200.00 bookings — the fixed side.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the side counter",
        why: "Fixed 14, variable 22 (Ads 14, Tools 5, Travel 3).",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the scanned table",
        why: "The 36 bookings split fourteen-and-twenty across the line.",
      },
    ],
    distractors: ["'rent'", "SUM", "products"],
    walkthrough:
      "Two buckets: fixed 14, variable 22 — the cost structure in one glance, with variable spend outweighing the anchor lease. CASE is case-sensitive on strings, so 'rent' would match nothing and every row would fall to variable (36) — the classic literal trap. SUM would add category names into an error rather than counting bookings.",
  },
  {
    id: "cs-766",
    tier: "easy",
    topic: "s6",
    universe: "pricing",
    title: "The two-counter idiom",
    brief:
      "From: Pricing lead. Re: the size split.\n\nOne scan, two counters: orders at or above 150, orders below. The idiom uses two SUM(CASE) columns — build it.",
    ask: "Count orders at or above 150 and below 150 with two CASE counters.",
    template: `SELECT SUM(CASE WHEN total >= {1} THEN 1 ELSE 0 END) AS big,
       SUM(CASE WHEN total < 150 THEN 1 ELSE 0 {2}) AS small
FROM {3};`,
    slots: [
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the size line",
        why: "Seventy-three orders reach 150 or more — the big side of the split.",
      },
      {
        answer: "END",
        kind: "keyword",
        label: "the second CASE's terminator",
        why: "Each SUM(CASE …) closes with END before the next column — both counters scan the same rows once.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "The pair reconciles the 103 orders: 73 big, 30 small.",
      },
    ],
    distractors: ["15", "THEN", "invoices"],
    walkthrough:
      "big 73, small 30 — and the pair reconciles the 103 orders exactly. The two-counter idiom needs no GROUP BY: each CASE is a per-row flag and SUM adds the flags. A 15 line would put 100 orders in the big bucket and wreck the reconciliation, and THEN outside a CASE expression is a parse error — the idiom lives and dies on well-formed CASE … END blocks.",
  },
  {
    id: "cs-767",
    tier: "easy",
    topic: "s6",
    universe: "growth",
    title: "Active versus churned",
    brief:
      "From: Growth analyst. Re: the retention snapshot.\n\nThe customers table stores retention as a 0/1 flag. Translate it to words with CASE: active or churned, counted.",
    ask: "Label customers active or churned via CASE; count each.",
    template: `SELECT CASE active WHEN {1} THEN {2} ELSE 'churned' END AS state,
       {3}(*) AS n
FROM customers
GROUP BY state
ORDER BY n DESC;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag value",
        why: "Fourteen customers carry active = 1 — the retained majority the snapshot leads with.",
      },
      {
        answer: "'active'",
        kind: "keyword",
        label: "the active label",
        why: "The word the snapshot prints for the fourteen retained customers.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the state counter",
        why: "Active 14, churned 2 — the retention snapshot.",
      },
    ],
    distractors: ["2", "'inactive'", "SUM"],
    walkthrough:
      "Two rows: active 14, churned 2 — the retention snapshot with words instead of flags. The simple CASE compares the integer column against the integer 1; a quoted '1' would be a text literal and match nothing under type affinity, silently labeling everyone churned. SUM would add flag values (14) where a headcount belongs — close here, catastrophically wrong once the flag means something else.",
  },
  {
    id: "cs-768",
    tier: "medium",
    topic: "s1",
    universe: "catalog",
    title: "Product names meet their own categories",
    brief:
      "From: Copy editor. Re: the catalog's self-audit.\n\nThe catalog stacks product names with product categories — one column, deduplicated. Verify no product shares its name with a category before the print run.",
    ask: "Stack product names with product categories, deduplicated.",
    template: `SELECT name AS v FROM {1}
{3}
SELECT {2} FROM products
ORDER BY v;`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "arm 1's table",
        why: "Sixteen product names open the pile — the catalog's own vocabulary.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "arm 2's word column",
        why: "Seven category words join the sixteen product names.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The self-audit keeps one row per word; UNION collapses any repeat.",
      },
    ],
    distractors: ["suppliers", "name", "INTERSECT"],
    walkthrough:
      "Twenty-three rows: 16 product names plus 7 category words with zero overlap — no product is named like its own category, and the print run is safe. suppliers would swap six supplier names in for the product names (13 rows), and n is not a column the compound outputs. Twenty-three is the self-audit's count.",
  },
  {
    id: "cs-769",
    tier: "medium",
    topic: "s1",
    universe: "expense",
    title: "Three averages, one column",
    brief:
      "From: Finance partner. Re: the mean stack.\n\nThe budget letter's second figure stacks the average order, the average invoice and the average expense. Three scalar arms, rounded to cents.",
    ask: "Stack the AVG of order totals, invoice amounts and expense amounts.",
    template: `SELECT ROUND(AVG(total), 2) AS mean FROM orders
UNION ALL
SELECT {1}(amount_cents)/100.0 FROM invoices
UNION ALL
SELECT ROUND({2}(amount_cents)/100.0, 2) FROM {3};`,
    slots: [
      {
        answer: "ROUND",
        kind: "keyword",
        label: "arm 2's rounding wrapper",
        why: "The invoice mean is 3,106.32 — rounded to cents like the other arms.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "arm 3's aggregate",
        why: "The expense mean is exactly 706.00 — the 25,416.00 total divides evenly over 36 bookings.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 3's table",
        why: "The spend ledger supplies the third mean.",
      },
    ],
    distractors: ["MAX", "SUM", "payments"],
    walkthrough:
      "Three means: orders 338.19, invoices 3,106.32, expenses 706.00 — and the letter notes the invoice mean towers over the order mean because invoices bundle demand. MAX would print ceilings where means belong, SUM would print totals, and payments would swap the till's mean receipt into the third row. The stack is UNION ALL: three different statistics, each kept.",
  },
  {
    id: "cs-770",
    tier: "medium",
    topic: "s1",
    universe: "month-close",
    title: "Cities meet billing states",
    brief:
      "From: Close analyst. Re: the geography-billing pile.\n\nThe binder's odd-page union stacks customer cities with invoice statuses. Verify the pile size — geography and billing must not collide.",
    ask: "Stack customer cities with invoice statuses, deduplicated.",
    template: `SELECT city AS v FROM customers
{3}
SELECT status FROM {1}
ORDER BY v {2};`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 2's table",
        why: "Three billing words join the sixteen cities.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The briefed reverse reading: lowercase billing words first, then the cities backwards.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The odd page's pile keeps each word once.",
      },
    ],
    distractors: ["orders", "ASC", "INTERSECT"],
    walkthrough:
      "Nineteen rows: 16 cities plus 3 billing states, zero collisions — the odd page's pile holds. orders would swap four lifecycle words in for the billing states (twenty rows), and ORDER BY 1 ASC would print the cities alphabetically first instead of the briefed reverse. Nineteen is the pile's count.",
  },
  {
    id: "cs-771",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "Spend, books, billing — one pile",
    brief:
      "From: Fraud analyst. Re: the finance-vocabulary merge.\n\nThe fraud glossary merges expense categories, ledger accounts and invoice statuses. Three vocabularies, one pile — verify nothing collides.",
    ask: "Count the deduplicated merge of expense categories, ledger accounts and invoice statuses.",
    template: `SELECT {1}(*) AS vocab FROM (
  SELECT category FROM expenses
  UNION
  SELECT account FROM ledger_entries
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
        why: "Three billing words complete the glossary.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "payments"],
    walkthrough:
      "Eleven lines: 4 categories, 4 accounts, 3 billing states — the finance vocabularies are pairwise disjoint, so nothing dedups away. INTERSECT at arm 3 would annihilate the pile, payments would swap two till words for the three billing states (ten lines), and SUM(*) is not SQL. Eleven is the fraud glossary's line count.",
  },
  {
    id: "cs-772",
    tier: "medium",
    topic: "s5",
    universe: "supplier",
    title: "Till, regions, cities — the geography pile",
    brief:
      "From: Expansion analyst. Re: the label pile.\n\nThe map deck merges payment methods, customer regions and customer cities into one deduplicated column. Count the pile.",
    ask: "Count the deduplicated merge of payment methods, regions and cities.",
    template: `SELECT COUNT(*) AS pile FROM (
  SELECT method FROM payments
  UNION
  SELECT region FROM customers
  {1}
  SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; cities append last.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names join the 2 till words and 4 regions.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 3's table",
        why: "Both regions and cities live on the customers dimension.",
      },
    ],
    distractors: ["INTERSECT", "status", "orders"],
    walkthrough:
      "Twenty-two words: 2 till words, 4 regions, 16 cities — the geography pile, with till words sorting first under binary order. INTERSECT at arm 3 would annihilate the pile (no city is a till word), orders would swap four lifecycle words in for the cities, and customers has no status column. Twenty-two is the map deck's label count.",
  },
  {
    id: "cs-773",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "Chain receipt: statuses, till, minus billing",
    brief:
      "From: Data engineer. Re: runbook — the subtractive chain.\n\nThe chain table adds: order statuses UNION payment methods EXCEPT invoice statuses. Log the count — the subtraction runs last.",
    ask: "Count statuses UNION methods EXCEPT invoice statuses.",
    template: `SELECT {3}(*) AS n FROM (
  SELECT status FROM orders
  UNION
  SELECT method FROM payments
  {1}
  SELECT status FROM {2});`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "arm 3's operator",
        why: "Left-to-right: (statuses ∪ methods) completes, then billing states subtract.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "The three billing words are what gets subtracted — and they collide with nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: six words survive.",
      },
    ],
    distractors: ["INTERSECT", "payments", "SUM"],
    walkthrough:
      "Left to right: statuses ∪ methods = 6 words, then ∖ billing states removes nothing (disjoint) — the wrapped count prints 6. INTERSECT would junction the last arm and collapse to 0, and payments has no status column for the subtraction's right side. Six is the subtractive chain's receipt.",
  },
  {
    id: "cs-774",
    tier: "medium",
    topic: "s5",
    universe: "fraud",
    title: "Chain receipt: cities, minus statuses, plus regions",
    brief:
      "From: Data engineer. Re: runbook — the geography chain.\n\nThe chain table logs: customer cities EXCEPT order statuses UNION customer regions. Log the count.",
    ask: "Count cities EXCEPT statuses UNION customer regions.",
    template: `SELECT {3}(*) AS n FROM (
  SELECT city FROM customers
  EXCEPT
  SELECT status FROM orders
  {1}
  SELECT {2} FROM customers);`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "Left-to-right: the subtraction completes, then the regions append.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "arm 3's column",
        why: "Four region words join the 16 surviving cities.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: twenty proves the append ran.",
      },
    ],
    distractors: ["INTERSECT", "city", "SUM"],
    walkthrough:
      "Left to right: cities ∖ statuses = 16 (disjoint), then ∪ regions = 20 — the wrapped count's receipt. INTERSECT would junction the append and collapse to 0, and city in the third arm would self-union the surviving pile (still 16, a different receipt). Twenty is the geography chain's line.",
  },
  {
    id: "cs-775",
    tier: "medium",
    topic: "s5",
    universe: "catalog",
    title: "Chain receipt: books, minus spend, plus statuses",
    brief:
      "From: Data engineer. Re: runbook — the account chain.\n\nThe chain table logs: ledger accounts EXCEPT expense categories UNION order statuses. Log the count.",
    ask: "Count accounts EXCEPT expense categories UNION order statuses.",
    template: `SELECT {3}(*) AS n FROM (
  SELECT account FROM ledger_entries
  EXCEPT
  SELECT category FROM expenses
  {1}
  SELECT status FROM {2});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "Left-to-right: the subtraction completes, then the statuses append.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 3's table",
        why: "The four lifecycle words complete the pile.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: eight words survive.",
      },
    ],
    distractors: ["INTERSECT", "expenses", "SUM"],
    walkthrough:
      "Left to right: accounts ∖ categories = 4 (disjoint), then ∪ statuses = 8 — the wrapped count's receipt, accounts and statuses never colliding. INTERSECT would junction the append and collapse to 0, and expenses has no status column for the third arm. Eight is the account chain's line.",
  },
  {
    id: "cs-776",
    tier: "medium",
    topic: "s5",
    universe: "month-close",
    title: "The split that rebuilds itself",
    brief:
      "From: Data engineer. Re: runbook — the exhaustive split.\n\nA chain whose arms partition the same table must rebuild it exactly: orders at or above 150 UNION orders below 150. Count the reunion.",
    ask: "Count the union of the big-order and small-order status piles.",
    template: `SELECT COUNT(*) AS reunited FROM (
  SELECT id FROM orders WHERE status = {1}
  {3}
  SELECT id FROM orders WHERE status {2} 'pending');`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Fourteen order ids sit on the pending side of the partition.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "arm 2's comparison",
        why: "The complement side: every order that is not pending — eighty-nine ids.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the reunion operator",
        why: "The deduplicated reunion of a partition is its parent: all 103 order ids.",
      },
    ],
    distractors: ["shipped_at", "=", "INTERSECT"],
    walkthrough:
      "One hundred three rows: the union of the pending ids and the not-pending ids rebuilds the entire orders table — the runbook's exhaustive-split receipt. The two arms tile every order exactly once, so the union can only be the parent. An equality in the second arm would union pending with itself (fourteen), a nonsense status literal would empty arm 1 (eighty-nine survive), and INTERSECT would leave only the fourteen pending ids.",
  },
  {
    id: "cs-777",
    tier: "medium",
    topic: "s5",
    universe: "supplier",
    title: "The vendor master list, printed",
    brief:
      "From: Supplier auditor. Re: the full payee print.\n\nThe audit's appendix prints every vendor and supplier name in one deduplicated, alphabetical column — ten names, verified.",
    ask: "List expense vendors unioned with supplier names, sorted.",
    template: `SELECT v FROM (
  SELECT vendor AS v FROM {1}
  {3}
  SELECT {2} FROM suppliers)
ORDER BY v;`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 1's table",
        why: "Four vendor names open the list — the payees the books already know.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "arm 2's name column",
        why: "Six supplier names complete the ten-name print.",
      },
      {
        answer: "UNION",
        kind: "keyword",
        label: "the deduplicating operator",
        why: "The master list keeps each name once; the two vocabularies never collide.",
      },
    ],
    distractors: ["suppliers", "vendor", "INTERSECT"],
    walkthrough:
      "Ten rows: four vendors and six suppliers, alphabetized from AdWorks Media to Skyline Travel — the payee print's complete set, zero overlap. suppliers in arm 1 would self-union the supply side (six rows) and drop the vendors, and ORDER BY 1 would work identically here but the audit wants the named key. Ten names is the appendix's count.",
  },
  {
    id: "cs-778",
    tier: "medium",
    topic: "s5",
    universe: "refund-audit",
    title: "The covered universe",
    brief:
      "From: Refund auditor. Re: the coverage receipt.\n\nUnion the settled-payment customers with the delivered-order customers. If the union is the whole customer table, every relationship is covered by at least one side.",
    ask: "Count paid customers unioned with delivered-order customers.",
    template: `SELECT {1}(*) AS covered FROM (
  SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id = i.id
  UNION
  SELECT DISTINCT customer_id FROM orders WHERE status = {2} AND customer_id IS NOT {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The coverage receipt is one figure: sixteen names, the whole customer table.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "Fifteen customers hold delivered orders — the fulfillment side.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the IS NOT probe",
        why: "IS NOT NULL on the join key is always true here — a harmless explicitness the audit welcomes.",
      },
    ],
    distractors: ["SUM", "pending", "price"],
    walkthrough:
      "Sixteen rows — the union covers the ENTIRE customer table: every customer has either settled a payment or received a delivery. The receipt is the coverage proof the audit closes on. SUM(*) is not SQL, and 'pending' would swap the eight pending-order customers in, shrinking the union to twelve and breaking the coverage claim.",
  },
  {
    id: "cs-779",
    tier: "medium",
    topic: "s6",
    universe: "month-close",
    title: "The first-match trap, run",
    brief:
      "From: Data engineer. Re: runbook — the trap, executed.\n\nThe trap page runs the banding mistake on purpose: WHEN total >= 80 first, WHEN total >= 200 second. The second WHEN never fires. Print the proof.",
    ask: "Run the overlapping-band CASE and show which branch wins.",
    template: `SELECT CASE WHEN total >= {1} THEN 'a-80plus' WHEN total >= 200 THEN 'b-200plus-never' ELSE {2} {3} AS band,
       COUNT(*) AS n
FROM orders
GROUP BY band
ORDER BY n {4};`,
    slots: [
      {
        answer: "80",
        kind: "number",
        noVerify: true,
        label: "the greedy first line",
        why: "The first WHEN at 80 swallows every 200-plus order: 92 orders land in a-80plus.",
      },
      {
        answer: "'c-under80'",
        kind: "keyword",
        label: "the ELSE label",
        why: "Eleven orders fall through both WHENs to the under-80 band.",
      },
      {
        answer: "END",
        kind: "keyword",
        label: "the CASE terminator",
        why: "The expression closes with END before the alias — the parse depends on it.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "a-80plus (92) prints above c-under80 (11) — biggest band first.",
      },
    ],
    distractors: ["200", "'c-200plus'", "THEN", "ASC"],
    walkthrough:
      "Two bands print: a-80plus 92, c-under80 11 — and b-200plus-never is nowhere, the trap's proof. Searched CASE evaluates WHENs top-down and commits to the first match, so every 200-plus order is claimed by the 80 line first; only 11 orders fall through to ELSE. A 200 first line would print the honest three bands, and THEN in the terminator slot is a parse error. First-match ordering is the whole lesson.",
  },
  {
    id: "cs-780",
    tier: "medium",
    topic: "s6",
    universe: "month-close",
    title: "COUNT versus SUM, reconciled",
    brief:
      "From: Data engineer. Re: runbook — the wrapper page.\n\nTwo idioms count the pending orders: COUNT of the no-ELSE CASE (NULL-skipping) and SUM of the zero-filled CASE. Print both and reconcile.",
    ask: "Compare COUNT(CASE no-ELSE) against SUM(CASE ELSE 0) on pending orders.",
    template: `SELECT {1}(CASE WHEN status = 'pending' THEN 1 END) AS cnt,
       {3}(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS summed
FROM {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the NULL-skipping counter",
        why: "COUNT ignores the 89 NULL yields and prints 14 — the same figure as the zero-filled sum.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "Both wrappers scan the same 103 order rows in one pass.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the zero-filled counter",
        why: "The ELSE 0 variant sums ones and harmless zeros — fourteen again.",
      },
    ],
    distractors: ["AVG", "invoices", "MAX"],
    walkthrough:
      "cnt 14, summed 14 — the wrapper page's reconciliation: COUNT(CASE no-ELSE) ≡ SUM(CASE ELSE 0), two routes to one figure. COUNT counts non-NULL yields; SUM adds ones and skips NULLs; both land on the 14 pending orders. SUM in the first slot would print NULL (no ELSE to zero-fill), AVG would print 1 (fourteen ones over fourteen non-NULL), and MAX would print 1 — the largest single flag, a meaningless receipt.",
  },
  {
    id: "cs-781",
    tier: "medium",
    topic: "s6",
    universe: "pricing",
    title: "IIF, the two-way shorthand",
    brief:
      "From: Pricing lead. Re: the shorthand receipt.\n\nSQLite's IIF(cond, a, b) is CASE with two branches. Prove equivalence on the 150 line: the IIF counter must match the CASE counter.",
    ask: "Count orders at or above 150 with IIF and confirm it matches CASE.",
    template: `SELECT SUM(IIF(total >= {1}, 1, 0)) AS via_iif,
       SUM(CASE WHEN total >= 150 THEN 1 ELSE {3} END) AS via_case
FROM {2};`,
    slots: [
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the IIF's line",
        why: "The same 150 line the CASE tests — seventy-three orders.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "Both counters scan the same 103 orders — the equivalence is row-for-row.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the CASE's ELSE fill",
        why: "The zero fill keeps the CASE counter at seventy-three, matching IIF exactly.",
      },
    ],
    distractors: ["15", "invoices", "1"],
    walkthrough:
      "via_iif 73, via_case 73 — the shorthand equivalence receipt: IIF(cond, 1, 0) is exactly CASE WHEN cond THEN 1 ELSE 0 END. The pair reconciles because both scan the same rows under the same line. A 15 line would print 100 in the first column against the CASE's 73 — a visible mismatch that exposes the typo. invoices would run both counters over a table without a total column and fail to prepare.",
  },
  {
    id: "cs-782",
    tier: "medium",
    topic: "s6",
    universe: "month-close",
    title: "CASE inside WHERE",
    brief:
      "From: Close analyst. Re: the filter idiom.\n\nCASE is not just for SELECT lists — it can drive a WHERE. Filter orders to pending using a CASE that yields 1 for pending and 0 otherwise, then compare against the row count.",
    ask: "Filter orders with a CASE-in-WHERE predicate to the pending rows.",
    template: `SELECT COUNT(*) AS pending FROM {3}
WHERE CASE WHEN status = {1} THEN 1 ELSE 0 END = {2};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the CASE's tested status",
        why: "The predicate yields 1 on the fourteen pending orders.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the matched value",
        why: "WHERE keeps rows whose CASE yields 1 — the fourteen pending orders.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the filtered table",
        why: "The idiom filters the 103 orders down to their pending fourteen.",
      },
    ],
    distractors: ["'shipped'", "0", "invoices"],
    walkthrough:
      "The count prints 14 — the CASE-in-WHERE idiom filtering exactly the pending rows. The pattern generalizes to predicates no plain comparison can express (ranked priority, multi-column branching), which is why the runbook teaches it. A 'shipped' test would print 30, and matching on 0 would invert the filter to the 89 non-pending rows — the idiom's off-by-inversion trap.",
  },
  {
    id: "cs-783",
    tier: "medium",
    topic: "s6",
    universe: "month-close",
    title: "The region lifecycle grid",
    brief:
      "From: Close analyst. Re: the two-column pivot.\n\nOne row per region, two CASE counters as columns: pending orders and delivered orders. The grid reads the lifecycle across the map without a second query.",
    ask: "Pivot pending and delivered order counts by region with two CASE columns.",
    template: `SELECT c.region,
       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN o.status = {1} THEN {2} ELSE 0 END) AS delivered
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
ORDER BY {3};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the second counter's status",
        why: "Delivered orders: EU 24, APAC 21, US 5, LATAM 2.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the counter's flag value",
        why: "Each delivered order contributes exactly one to its region's count.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the grid's sort key",
        why: "ORDER BY region alphabetizes the map rows.",
      },
    ],
    distractors: ["2", "money", "email"],
    walkthrough:
      "Four rows: APAC 5/21, EU 6/24, LATAM 0/2, US 3/5 — the lifecycle grid, pending and delivered side by side per region. LATAM's zero pending is the receipt the funnel quotes. A 'shipped' test would print the shipped column where delivered belongs, a flag of 2 would double the delivered counts, and the grid has no money or email column to sort by. The two SUM(CASE) columns are the pivot's whole trick.",
  },
  {
    id: "cs-784",
    tier: "hard",
    topic: "s1",
    universe: "month-close",
    title: "The five-ledger census",
    brief:
      "From: Controller. Re: the full-width census.\n\nThe binder's front matter counts every ledger at once: orders, invoices, payments, expenses, ledger postings — five labeled rows, one stack.",
    ask: "Stack labeled row counts for all five tables, biggest first.",
    template: `SELECT 'orders' AS src, COUNT(*) AS n FROM orders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'expenses', COUNT(*) FROM {1}
UNION ALL
SELECT 'ledger', COUNT(*) FROM {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "arm 4's table",
        why: "The spend ledger: 36 bookings — the third-largest census in the stack.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 5's table",
        why: "The books: 80 postings — the largest after orders.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY n DESC ranks 103, 80, 36, 28, 27 — orders, books, spend, invoices, cash.",
      },
    ],
    distractors: ["suppliers", "products", "money"],
    walkthrough:
      "Five rows: orders 103, ledger 80, expenses 36, invoices 28, payments 27 — the front matter's full-width census, biggest first. The stack is UNION ALL because the five arms are five different ledgers, not duplicates to collapse. Neither suppliers nor products appears in the briefed five, and money is not a column this compound outputs.",
  },
  {
    id: "cs-785",
    tier: "hard",
    topic: "s1",
    universe: "catalog",
    title: "Categories, statuses, cities — the wide pile",
    brief:
      "From: Copy editor. Re: the appendix's widest pile.\n\nThe appendix's widest pile merges expense categories, order statuses and customer cities. Confirm the line count — twenty-four is the claim.",
    ask: "Count the deduplicated merge of expense categories, order statuses and cities.",
    template: `SELECT {1}(*) AS pile FROM (
  SELECT category FROM expenses
  UNION
  SELECT status FROM orders
  {2}
  SELECT {3} FROM customers);`,
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
        why: "The chain reads left to right; cities append last.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "arm 3's column",
        why: "Sixteen city names complete the 24-word pile.",
      },
    ],
    distractors: ["SUM", "INTERSECT", "shipped_at"],
    walkthrough:
      "Twenty-four lines: 4 categories, 4 lifecycle words, 16 cities — the widest pile, disjoint by construction. INTERSECT at arm 3 would annihilate the pile, shipped_at is not a customers column for a wrong arm to read, and SUM(*) is not SQL. Twenty-four is the print run's number, exactly as claimed.",
  },
  {
    id: "cs-786",
    tier: "hard",
    topic: "s5",
    universe: "catalog",
    title: "Three category vocabularies, one list",
    brief:
      "From: Copy editor. Re: the category glossary.\n\nThe glossary merges all three category vocabularies — product families, expense categories, ledger accounts. Fifteen lines is the claim; verify it.",
    ask: "Count the deduplicated merge of product, expense and ledger categories.",
    template: `SELECT {3}(*) AS gloss FROM (
  SELECT category FROM products
  UNION
  SELECT category FROM expenses
  {1}
  SELECT account FROM {2});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; the account names append last.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 3's table",
        why: "Four account words complete the fifteen-line glossary.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The verification is one line-count figure: fifteen.",
      },
    ],
    distractors: ["INTERSECT", "expenses", "SUM"],
    walkthrough:
      "Fifteen lines: 7 product families, 4 expense categories, 4 account names — three vocabularies that share no word, so the glossary keeps every line. INTERSECT at arm 3 would collapse the pile to 0, expenses would self-union the spend side (eleven lines), and payments has no account column. Fifteen is the category glossary's verified count.",
  },
  {
    id: "cs-787",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "Fulfillment, till, billing — the state pile",
    brief:
      "From: Fraud analyst. Re: the state-vocabulary merge.\n\nThe fraud glossary merges all three state vocabularies — order statuses, payment methods, invoice statuses. Verify the nine-line claim.",
    ask: "Count the deduplicated merge of order statuses, methods and invoice statuses.",
    template: `SELECT {3}(*) AS pile FROM (
  SELECT status FROM orders
  {1}
  SELECT method FROM payments
  UNION
  SELECT status FROM {2});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 2's operator",
        why: "The chain reads left to right; the till words append second.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "arm 3's table",
        why: "Three billing words complete the nine-line pile.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The verification is one line-count figure: nine.",
      },
    ],
    distractors: ["INTERSECT", "customers", "SUM"],
    walkthrough:
      "Nine lines: 4 lifecycle words, 2 till words, 3 billing states — the state pile, pairwise disjoint, nothing deduped away. INTERSECT at arm 2 would annihilate the pile before the third arm ever ran, and customers has no method or status to contribute a state vocabulary. Nine is the state glossary's count.",
  },
  {
    id: "cs-788",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "The chain that ends in subtraction",
    brief:
      "From: Data engineer. Re: runbook — the three-append chain.\n\nThe runbook's longest chain: categories UNION accounts UNION methods EXCEPT invoice statuses. Log the count — three appends, one subtraction, left to right.",
    ask: "Count categories UNION accounts UNION methods EXCEPT invoice statuses.",
    template: `SELECT {3}(*) AS n FROM (
  SELECT category FROM expenses
  UNION
  SELECT account FROM ledger_entries
  UNION
  SELECT {1} FROM payments
  EXCEPT
  SELECT status FROM {2});`,
    slots: [
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's column",
        why: "Two till words join the 8-word spend pile.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the subtraction's table",
        why: "Three billing states subtract from a pile they cannot touch.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The chain's row count is the receipt: ten words survive.",
      },
    ],
    distractors: ["INTERSECT", "payments", "SUM"],
    walkthrough:
      "Left to right: 4 + 4 + 2 = 10 words, then ∖ billing states removes nothing — the wrapped count prints 10, the runbook's longest-chain receipt. INTERSECT in the third arm's slot would junction against the methods column and collapse, and payments has no status column for the subtraction. Ten is the chain table's new entry.",
  },
  {
    id: "cs-789",
    tier: "hard",
    topic: "s5",
    universe: "expense",
    title: "The three-calendar pile",
    brief:
      "From: Finance partner. Re: the date pile.\n\nThe audit merges three calendars — expense dates, posting dates, order dates — into one deduplicated pile. Count it: the figure shows how much of the year the business actually moved.",
    ask: "Count the deduplicated merge of expense, posting and order dates.",
    template: `SELECT {3}(*) AS days FROM (
  SELECT spent_on FROM expenses
  UNION
  SELECT entry_date FROM ledger_entries
  {1}
  SELECT created_at FROM {2});`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 3's operator",
        why: "The chain reads left to right; the order calendar joins last.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 3's table",
        why: "Eighty-four distinct order dates — the pile's biggest contributor.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The activity figure is one number: one hundred twenty-seven distinct dates.",
      },
    ],
    distractors: ["INTERSECT", "invoices", "SUM"],
    walkthrough:
      "One hundred twenty-seven distinct dates: 36 spend days, 80 posting days, 84 order days, with overlaps deduplicated away by the unions — the days the business actually moved. INTERSECT at arm 3 would collapse to the shared days instead of the merged calendar, and invoices has no created_at column to contribute. One hundred twenty-seven is the audit's activity figure.",
  },
  {
    id: "cs-790",
    tier: "hard",
    topic: "s5",
    universe: "refund-audit",
    title: "Pending or settled, the union",
    brief:
      "From: Refund auditor. Re: the exposure union.\n\nUnion the pending-order customers with the settled-payment customers. The overlap is exactly the stuck-and-paying paradox the audit flags; the union is the watchlist size.",
    ask: "Count pending-order customers unioned with settled-payment customers.",
    template: `SELECT {1}(*) AS watchlist FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
  UNION
  SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.id IS NOT {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wrapper's counter",
        why: "The watchlist size is one figure: twelve deduplicated names.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's status filter",
        why: "Eight customers hold the fourteen pending orders.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the IS NOT probe",
        why: "IS NOT NULL on an id is always true — a harmless explicitness the audit welcomes.",
      },
    ],
    distractors: ["SUM", "refunded", "total"],
    walkthrough:
      "Twelve rows: eight pending-order customers plus eight settled customers, overlapping on four — the watchlist, deduplicated by the union. The four in both lists are the paradox entries: goods pending, history of paying. SUM(*) is not SQL, and 'shipped' would swap the ten shipped-order customers in for the pending eight, resizing the watchlist to fourteen and misfiling the exposure.",
  },
  {
    id: "cs-791",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "The six-vocabulary master list",
    brief:
      "From: Copy editor. Re: the master list, final form.\n\nEvery controlled vocabulary the business runs — statuses, regions, categories, accounts, methods, billing states — merges into one master list. Twenty-one is the claim; verify it.",
    ask: "Count the six-vocabulary master pile.",
    template: `SELECT COUNT(*) AS master FROM (
  SELECT status FROM orders
  UNION SELECT region FROM customers
  UNION SELECT category FROM expenses
  UNION SELECT account FROM ledger_entries
  {1} SELECT {3} FROM {2}
  UNION SELECT status FROM invoices);`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 5's operator",
        why: "The chain reads left to right; the till words append fifth.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 5's table",
        why: "card and wire are the fifth vocabulary — the two words the till speaks.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 5's column",
        why: "The till exposes its two words through the method column.",
      },
    ],
    distractors: ["INTERSECT", "customers", "region"],
    walkthrough:
      "Twenty-one words: 4 statuses, 4 regions, 4 categories, 4 accounts, 2 methods, 3 billing states — the master list, disjoint by design across all six vocabularies. INTERSECT at arm 5 would junction the till words against an eight-word pile and zero the whole chain, and customers has no method column for the fifth arm. Twenty-one is the master list's verified size.",
  },
  {
    id: "cs-792",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "The geography chain, three operators",
    brief:
      "From: Data engineer. Re: runbook — the geography gauntlet.\n\nThe gauntlet: cities EXCEPT statuses EXCEPT regions UNION methods. Two subtractions and an append, left to right. Log the count.",
    ask: "Count cities EXCEPT statuses EXCEPT regions UNION payment methods.",
    template: `SELECT {3}(*) AS n FROM (
  SELECT city FROM customers
  EXCEPT
  SELECT status FROM orders
  EXCEPT
  SELECT region FROM customers
  {1}
  SELECT {2} FROM payments);`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "arm 4's operator",
        why: "The gauntlet reads left to right; the till words append last.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 4's column",
        why: "Two till words join the sixteen surviving cities.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the runbook sizer",
        why: "The gauntlet's row count is the receipt: eighteen words survive.",
      },
    ],
    distractors: ["INTERSECT", "city", "SUM"],
    walkthrough:
      "Left to right: 16 cities ∖ statuses = 16, ∖ regions = 16 (neither vocabulary touches geography), then ∪ methods = 18 — the gauntlet's receipt. INTERSECT at the final slot would junction the till words against the cities and zero the pile, and city in arm 4 would self-union the survivors (still 16). Eighteen is the gauntlet's line.",
  },
  {
    id: "cs-793",
    tier: "hard",
    topic: "s6",
    universe: "fraud",
    title: "The status-size grid",
    brief:
      "From: Fraud analyst. Re: the full pivot.\n\nOne row per order status, two CASE counters: orders at or above 150 and below. The grid exposes which lifecycle stages carry the big tickets.",
    ask: "Pivot big (>=150) and small (<150) order counts by status.",
    template: `SELECT status,
       SUM(CASE WHEN total >= {1} THEN 1 ELSE 0 END) AS big,
       SUM(CASE WHEN total < 150 THEN {2} ELSE 0 END) AS small
FROM orders
GROUP BY status
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the size line",
        why: "Both counters split at the same 150 line — seventy-three big, thirty small.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the counter's flag value",
        why: "Each small order contributes exactly one to its status's count.",
      },
      {
        answer: "big",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY big DESC ranks delivered 34, shipped 24, pending 12, cancelled 3.",
      },
    ],
    distractors: ["15", "small", "email"],
    walkthrough:
      "Four rows: delivered 34/18, shipped 24/6, pending 12/2, cancelled 3/4 — the pivot exposes that cancellation is the only stage where small orders outnumber big ones. A 15 line would put a hundred orders in the big column, ranking by the small column would float cancellation above pending, and the grid has no email column to sort by.",
  },
  {
    id: "cs-794",
    tier: "hard",
    topic: "s6",
    universe: "expense",
    title: "The spend-band grid",
    brief:
      "From: Controller. Re: the booking-band pivot.\n\nOne row per expense category, two CASE counters: bookings at or above 1,000.00 and below. The grid shows which lines book big and which book often.",
    ask: "Pivot big (>=100000 cents) and small booking counts by category.",
    template: `SELECT category,
       SUM(CASE WHEN amount_cents >= {1} THEN 1 ELSE 0 END) AS big,
       SUM(CASE WHEN amount_cents < 100000 THEN {2} ELSE 0 END) AS small
FROM expenses
GROUP BY category
ORDER BY {3};`,
    slots: [
      {
        answer: "100000",
        kind: "number",
        noVerify: true,
        label: "the band line in cents",
        why: "Fifteen bookings reach 1,000.00 — all of them Rent plus one Travel booking.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the counter's flag value",
        why: "Each small booking contributes exactly one to its category's count.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the grid's sort key",
        why: "ORDER BY category alphabetizes the grid rows.",
      },
    ],
    distractors: ["10000", "2", "money"],
    walkthrough:
      "Four rows: Ads 0/14, Rent 14/0, Tools 0/5, Travel 1/2 — the spend-band grid, showing Rent books big and exclusive while Ads books small and constant; Travel is the only mixed line. A 10,000-cent line would pull small ads and tools into the big column, the other alias would drift from the brief's wording, and money is not a column this grid outputs.",
  },
  {
    id: "cs-795",
    tier: "hard",
    topic: "s6",
    universe: "pricing",
    title: "The premium grid",
    brief:
      "From: Pricing lead. Re: the category-price pivot.\n\nOne row per product category, two CASE counters: premium (100 and up) and basic (under 100). The grid shows which families carry the premium tier.",
    ask: "Pivot premium (>=100) and basic product counts by category.",
    template: `SELECT category,
       SUM(CASE WHEN price >= {1} THEN 1 ELSE 0 END) AS premium,
       SUM(CASE WHEN price < 100 THEN {2} ELSE 0 END) AS basic
FROM products
GROUP BY category
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "Four products reach 100 or more: the premium tier.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the counter's flag value",
        why: "Each basic product contributes exactly one to its family's count.",
      },
      {
        answer: "premium",
        kind: "keyword",
        label: "the sort key",
        why: "ORDER BY premium DESC puts Audio's two premium products on top.",
      },
    ],
    distractors: ["10", "basic", "category"],
    walkthrough:
      "Seven rows: Accessories 0/3, Apparel 0/2, Audio 2/1, Electronics 0/3, Fitness 0/1, Video 1/1, Wearables 1/1 — only Audio, Video and Wearables reach the premium tier. A 10 line would make every product premium, ranking by the basic column would float Electronics above Audio, and alphabetical order would bury the premium story the deck leads with.",
  },
  {
    id: "cs-796",
    tier: "hard",
    topic: "s6",
    universe: "month-close",
    title: "The till-band grid",
    brief:
      "From: Controller. Re: the receipt-band pivot.\n\nOne row per payment method, two CASE counters: receipts at or above 3,000.00 and below. The grid splits each channel into large and standard payments.",
    ask: "Pivot large (>=300000 cents) and standard receipt counts by method.",
    template: `SELECT method,
       SUM(CASE WHEN amount_cents >= {1} THEN 1 ELSE 0 END) AS large,
       SUM(CASE WHEN amount_cents < 300000 THEN {2} ELSE 0 END) AS standard
FROM payments
GROUP BY method
ORDER BY {3};`,
    slots: [
      {
        answer: "300000",
        kind: "number",
        noVerify: true,
        label: "the band line in cents",
        why: "Six receipts reach 3,000.00 — two by card, four by wire.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the counter's flag value",
        why: "Each standard receipt contributes exactly one to its channel's count.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "the grid's sort key",
        why: "ORDER BY method alphabetizes card before wire.",
      },
    ],
    distractors: ["30000", "standard", "money"],
    walkthrough:
      "Two rows: card 2/14, wire 4/7 — wire handles the large receipts two-to-one despite fewer total payments, the till-band grid's headline. A 30,000-cent line would leave both channels nearly empty of large receipts, ranking by the standard column would float wire above card, and the grid has no money column to sort by.",
  },
  {
    id: "cs-797",
    tier: "hard",
    topic: "s6",
    universe: "expense",
    title: "The account classes",
    brief:
      "From: Finance partner. Re: the classification view.\n\nThe books classify by CASE: cash and receivables are assets, operating_expenses is expense, sales_revenue is revenue. Count the postings per class.",
    ask: "Classify ledger accounts with CASE; count postings per class.",
    template: `SELECT CASE WHEN account IN ({1}) THEN 'asset' WHEN account = 'operating_expenses' THEN 'expense' ELSE 'revenue' END AS klass,
       {2}(*) AS n
FROM {3}
GROUP BY klass
ORDER BY n DESC;`,
    slots: [
      {
        answer: "'cash','accounts_receivable'",
        kind: "keyword",
        label: "the asset pair",
        why: "Fifty-three postings sit on the asset accounts (cash 27, receivables 26).",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the class counter",
        why: "Asset 53, expense 14, revenue 13 — the books' shape.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "the scanned table",
        why: "The books' 80 postings classify into three buckets.",
      },
    ],
    distractors: ["'sales_revenue'", "SUM", "payments"],
    walkthrough:
      "Three classes: asset 53, expense 14, revenue 13 — the books' shape in one view, with the asset accounts carrying two-thirds of all postings. Listing sales_revenue among the assets would misclassify the revenue side and print asset 66 / revenue 0 — a balance sheet that cannot balance. SUM would add account names into an error instead of counting postings.",
  },
  {
    id: "cs-798",
    tier: "hard",
    topic: "s6",
    universe: "month-close",
    title: "The invoice-size bands",
    brief:
      "From: Controller. Re: the paper-size census.\n\nThe binder bands invoices: jumbo (3,000.00 and up), mid (1,000.00 to 3,000.00), small (under 1,000.00). Build the searched-CASE census.",
    ask: "Band invoices by amount with a searched CASE; count each band.",
    template: `SELECT CASE WHEN amount_cents >= {1} THEN 'jumbo' WHEN amount_cents >= 100000 THEN 'mid' ELSE 'small' END AS band,
       {2}(*) AS n
FROM {3}
GROUP BY band
ORDER BY n DESC;`,
    slots: [
      {
        answer: "300000",
        kind: "number",
        noVerify: true,
        label: "the jumbo line in cents",
        why: "Thirteen invoices reach 3,000.00 — the jumbo band the binder leads with.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the band counter",
        why: "Jumbo 13, mid 13, small 2 — the paper-size census.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the scanned table",
        why: "The 28 documents split into three bands.",
      },
    ],
    distractors: ["30000", "SUM", "orders"],
    walkthrough:
      "Three bands: jumbo 13, mid 13, small 2 — the billing paper is either large or tiny, with almost nothing between. The searched CASE tests the 3,000.00 line first, then the 1,000.00 line; reversed, the 1,000.00 line would swallow the jumbos (the first-match trap again). A 30,000-cent line would leave only two bands, and SUM would add the ELSE labels into an error.",
  },
  {
    id: "cs-799",
    tier: "hard",
    topic: "s6",
    universe: "month-close",
    title: "The buckets, with money",
    brief:
      "From: Controller. Re: the lifecycle census, funded.\n\nThe lifecycle census grows a money column: per bucket, the count AND the total. The closed bucket's money should reconcile to shipped plus delivered.",
    ask: "Pivot bucket counts and money with a simple CASE plus SUM.",
    template: `SELECT CASE status WHEN 'pending' THEN 'open' WHEN 'cancelled' THEN 'dead' ELSE 'closed' END AS bucket,
       COUNT(*) AS n, ROUND(SUM({1}), 2) AS money
FROM {3}
GROUP BY bucket
ORDER BY n {2};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the money column",
        why: "Closed 27,567.79, open 6,113.00, dead 1,152.49 — the funded census.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the row order",
        why: "ORDER BY n DESC ranks closed 82, open 14, dead 7 — biggest first.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the scanned table",
        why: "The 103 orders carry both the lifecycle labels and the money.",
      },
    ],
    distractors: ["customer_id", "ASC", "invoices"],
    walkthrough:
      "Three rows: closed (82, 27,567.79), open (14, 6,113.00), dead (7, 1,152.49) — and the money column reconciles: 27,567.79 is exactly shipped 11,996.72 plus delivered 15,571.07. Summing customer_id would pour id integers into the money column, and ASC would flip the census to dead-first — reading order the brief forbids. The simple CASE plus grouped SUM is the pivot's two-column trick.",
  },
  {
    id: "cs-800",
    tier: "hard",
    topic: "s5",
    universe: "fraud",
    title: "The capstone: a CASE arm joins the chain",
    brief:
      "From: Data engineer. Re: runbook — the mixed arm.\n\nThe chain table's finale: order statuses UNION a CASE-banded arm (big/small by the 150 line). Set ops and CASE in one statement — the module's whole toolkit.",
    ask: "Count statuses unioned with the CASE-banded size labels.",
    template: `SELECT COUNT(*) AS n FROM (
  SELECT status FROM orders
  UNION
  SELECT {1} WHEN total >= 150 THEN 'big' ELSE 'small' {2} FROM {3});`,
    slots: [
      {
        answer: "CASE",
        kind: "keyword",
        label: "arm 2's opener",
        why: "The banding arm is a searched CASE: two labels, one line at 150.",
      },
      {
        answer: "END",
        kind: "keyword",
        label: "the CASE's terminator",
        why: "The arm closes with END before FROM — the compound parses only when the CASE is complete.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 2's table",
        why: "The banding arm scans the same 103 orders the status arm reads.",
      },
    ],
    distractors: ["IIF", "THEN", "invoices"],
    walkthrough:
      "Six rows: four lifecycle words plus the two band labels big and small — the vocabularies never collide, so the union keeps all six. The banding arm emits exactly two values (73 big orders, 30 small), which the union then treats as ordinary words. IIF would leave the arm's two labels without a searched form that fits the template's WHEN layout, and THEN in the terminator slot is a parse error. Set ops and CASE, one statement — the toolkit complete.",
  },
];
