// Block (Square) — kit 5 of the Fintech & Payments domain (Batch D).
// Seller tooling: Square's register and POS rails, the seller ecosystem
// (GMV per seller, catalog depth, basket math), Square Loans underwriting,
// and the consumer wallet on the other side. No scale pretense — the pool
// is mostly theme-curated: 1 tagged sql row in scripts/company-pools.md
// (chargeback-rate-ranking) + theme-menu fills, every problem mirroring a
// workflow Block's seller analytics, risk and books teams are known to probe.
// Case studies run on the storefront db, mapped honestly as
// suppliers = sellers on the platform (each with a catalog), products = the
// seller's listings, orders = register transactions, order_items = card-
// present line items, invoices = the billing book, payments = settled money
// movement (INTEGER CENTS — divide by 100.0), expenses = the seller's
// operating spend (INTEGER CENTS), ledger_entries = the double-entry books —
// with probed figures from scripts/company-facts.md only.

import type { CompanyKit } from "../types";

export const blockKit: CompanyKit = {
  id: "block",
  domainId: "fintech",
  name: "Block (Square)",
  tagline: "Seller tooling and consumer payments",
  accent: "text-orange-400",

  brief: [
    "Block builds the tooling that turns a counter, a phone and a card reader into a business: **Square**'s register and POS rails move card-present money for millions of sellers, **Square Loans** underwrites the sellers themselves off their own transaction streams, and the **Cash App** wallet serves the consumer side. The analyst's lens is the seller, end to end — **GMV per seller**, catalog depth, basket size, dispute rates — and then one level down, the seller's own books: what the business earned, what it spent, and whether the two reconcile. That two-layer view is the company's actual product promise: the platform knows the seller's money well enough to lend against it, so the SQL that proves a number is the same SQL that prices a loan.",
    "The data org splits along that seam. Seller analytics owns the commerce surface: per-seller GMV rollups across the catalog-to-line-item chain, basket and attachment reads, top-seller ladders with ties admitted. Risk and underwriting own the money-integrity surface: settlement completeness, {rose:chargeback} and dispute rates, AR aging on the billing book. Finance owns the books — and the schema shows it: every money column (billing, settlements, operating spend, ledger) is **INTEGER cents**, so 16800 rent cents print as 168.00 dollars only after an explicit `/100.0`, and the ledger's closing proof is a {emerald:zero-delta} check (**181,080** cents of debits against 181,080 of credits) that runs before any dashboard ships.",
    "Interview style is seller-grounded and cents-aware. A typical screen walks from a warm-up join to a commerce fold (GMV per seller across **three tables** — the **fan-out** between transactions, line items and listings is the trap), then escalates into either a `CASE`-band census (ticket-size bands, spend categories) or an anti-join (listings that never rang up, sellers with idle catalogs). Follow-ups probe units and populations out loud: *'is that cents or dollars?'*, 'does your denominator include the sellers who did not sell this month?'. Candidates who state the grain of every COUNT before writing it consistently outperform.",
    "Preparation strategy: the registry tags one problem for Block (`chargeback-rate-ranking`) — start there, because {rose:dispute-rate} math is the platform's risk spine. The rest of the pool is theme-curated from the SQL band toward the seller workflows: register folds, basket and AOV math, catalog joins, seller anti-joins, ranking ladders, and cents-safe bookkeeping reads. Then run all six case studies on the live storefront db: one rebuilds the **operating-spend census** the seller's books close on, the other rebuilds the **GMV-per-seller rollup** the platform's commerce review opens with, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting...",
    "The second interview lane is the money-integrity surface, and it has its own canon. Settlement completeness first: 27 payment legs on two rails — 16 card legs worth **$37,364.00** and 11 wire legs worth $32,248.00 — must tie to the ledger's 69,612.00 cash credit, and the coverage census reads 21 exact, 1 partial ({amber:4,000.00 of a 6,148.00 statement}), 6 never-settled worth 15,217.00. Then the two standing anomalies the risk team quotes from memory: statement #11 is {rose:void} with a live 925.00 leg, #28 is {emerald:paid} with zero legs — *labels are claims; legs are evidence*. A candidate who can narrate those two rows without notes is demonstrating the exact skill the underwriting model depends on.",
    "Round two of prep drills the money-read conventions until they are reflexes: every fold in cents, one /100.0 at the display edge, `JULIANDAY` for any duration (raw TEXT stamps subtract to 0 — the **2.98-day** ship average exists only after conversion). Then run all six case studies on the live db and re-derive each figure from the probe before trusting it: the region×category grid (23 combos, **APAC Audio 5162.4** at 44.5% of its region), the status census (82 {emerald:fulfilled} of 103 tickets), the 14-month revenue spine with LAG deltas, and the six listings priced above the catalog's **71.78** average. The habit the whole kit rewards: state the grain, state the units, then let the number argue.",
  ],

  dayInLife: [
    "**08:00 —** The morning starts on the commerce surface: did yesterday's register activity land complete, does settled value match captured value per seller, are dispute rates inside band? The first query is usually the GMV rollup — sellers joined through their catalogs to line items, revenue folded at the line grain — because that one number feeds the commerce review, the risk banding and the loan underwriting funnel alike. The fan-out is the daily trap: **103 transactions become 251 line items**, and the analyst who cannot say whether a COUNT counts transactions or line items is the one who ships a {rose:double-counted} morning read.",
    "**11:00 —** Midday goes to the seller's own economics. An underwriting request wants the operating-spend census — where the seller's money goes, by category, with the small categories gated by a **minimum-volume rule** so the memo is readable. A merchandising partner wants the ticket-size bands: how many baskets land under 50, between 50 and the mid band, and above. A books request wants the expense calendar by month. Every read is a `GROUP BY` with a `CASE` band or a `HAVING` gate, every money column is integer cents, and the dollar conversion happens exactly once, at the display edge.",
    "**15:00 —** The afternoon is stakeholder translation: {rose:dispute-rate} ladders for the risk review (rate per seller with a minimum-volume gate, because a seller with two transactions and one dispute is not a risk signal — it is noise wearing a rate), top-seller ladders for the commerce deck with `DENSE_RANK` so tied rungs read honestly. Every rate leaves the room with its gate and its grain stated out loud.",
    "**17:30 —** EOD is the books pass and the writeup: trial balance zero-delta, spend reconciled to the ledger, the billing book's {emerald:paid} / {sky:open} / {rose:void} distribution cross-checked against actual settlement rows. The rhythm to internalize: Block SQL exists to make a seller's money legible — *to the seller, to the platform, and to the underwriting model that will trust both*.",
  ],

  metrics: [
    { name: "GPV per seller", what: "Gross payment value folded per seller across the catalog-to-line-item chain. The platform's headline — 11130.25 for the top seller here — and a three-table join with a fan-out test built in." },
    { name: "Catalog depth", what: "Listings per seller. The supply-side signal behind GPV — and the COUNT(DISTINCT) that keeps a 251-line-item join honest at the seller grain." },
    { name: "Average basket", what: "Transaction value ÷ transactions. The merchant's favorite number and a classic aggregate-then-divide test: divide the folds, never the rows." },
    { name: "Attachment rate", what: "Line items ÷ transactions. The basket-depth read that turns a register stream into a merchandising decision." },
    { name: "Chargeback / dispute rate", what: "Disputes ÷ settled transactions, per seller, with a minimum-volume gate. The risk KPI this kit's tagged problem drills — denominator honesty is the entire interview." },
    { name: "Operating-spend mix", what: "Seller expense share by category — rent, ads, travel, tools. The books-side census this kit's first case rebuilds: 14 rent entries vs 3 travel entries tells two different business stories." },
    { name: "Loan take-up & effective cost", what: "Share of eligible sellers taking Square Loans, and the fee burden vs GPV. The underwriting funnel's conversion read — a rate over a gated population." },
    { name: "Books integrity delta", what: "Ledger debits minus credits — must be zero (181080 vs 181080 here). The pass that gates every close, and the data-quality question hiding behind every rate." },
    { name: "Settlement completeness", what: "Settled value vs captured value per rail: 16 card legs worth $37,364.00 and 11 wire legs worth $32,248.00 must tie to the ledger's cash credit of 69,612.00 — the completeness check that opens every money-integrity review." },
    { name: "Average selling price", what: "Revenue-weighted price per listing — and a grain trap: the trusted-bench avg-price cells (139.66 / 72.00) are averages over supplier rows, not lines-weighted folds (133.55 / 62.59). ASP is only honest once the grain is named." },
    { name: "Stock cover", what: "Units remaining vs units sold per listing — Desk Mat Extended holds 213 of 260 after selling 47, Smart Watch S is down to 17 of 40. The restock-clock read merchandising sorts by." },
    { name: "Cancellation rate by market", what: "Cancelled share of placed orders — APAC 8.1, EU 6.7, US 5.3, LATAM 0. The funnel-health rate that always ships with its denominator (placed, not settled)." },
  ],

  topics: [
    {
      name: "The register fold",
      why: "A day of commerce is a fold: line items grouped by transaction date, stitched or summed, per seller or per store. Square screens open here because the fold is where grain dies — COUNT versus SUM versus COUNT(DISTINCT transaction) over a 251-row line-item stream is the first fork in every read.",
      slugs: ["group-sold-products-by-the-date", "product-sales-analysis-ii", "top-earners", "monthly-transactions-i", "warehouse-manager", "maximum-transaction-each-day", "active-businesses", "customer-order-frequency", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Basket & ticket math",
      why: "Average basket, items per basket, value per line — the merchant's dashboard is ratios over two grains. The tested habit: aggregate each grain first (value fold, transaction count), then divide with a REAL numerator, because a per-row division or an integer division turns the AOV into noise.",
      slugs: ["basket-depth-aov", "sales-analysis-i", "percentage-of-users-attended-a-contest", "ar-aging-schedule"],
    },
    {
      name: "Catalog joins (listings to sales)",
      why: "Every seller read is a chain: seller → catalog → line items. Square drills the join-enrichment basics first — attach listing attributes to sales, keep unmatched sides visible — before escalating to the full three-table fold where the fan-out lives.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Idle-catalog anti-joins",
      why: "Catalog hygiene is a platform workflow: listings that never rang up, sellers with no sales in the window, buyers who browsed but never bought. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is the 'find the idle inventory' question — and on a healthy platform, zero results is itself the finding.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "sales-analysis-ii"],
    },
    {
      name: "Top-seller ladders & ranking windows",
      why: "The commerce deck leads with ladders: top sellers by GPV, top listings by units, per-category crowns. Ties are everywhere at real price points, so the rank trio — with a deterministic tie-break and an explicit ties-share-a-rung decision — is the drilled reflex.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary", "product-sales-analysis-iv", "average-selling-price"],
    },
    {
      name: "CASE banding for ticket tiers",
      why: "Merchandising thinks in bands: budget shelf, mid shelf, premium shelf; small tickets vs large. The CASE census — bands as groups, count and average per band, boundary arms exhaustive — is the tested shape, and the boundary placement is a business decision someone must own.",
      slugs: ["count-salary-categories", "calculate-orders-within-each-interval", "spend-histogram", "rfm-segmentation"],
    },
    {
      name: "Dispute & ratio gates",
      why: "Dispute rates are ratios with a survival rule: rate per seller, but only sellers above a volume gate — a HAVING after the rate, not a WHERE before it. Square drills the ratio-plus-gate shape because ungated rates read noise as risk.",
      slugs: ["chargeback-rate-ranking", "low-quality-problems", "returns-rate-by-category", "card-launch-success"],
    },
    {
      name: "NULL policy on open tickets",
      why: "A register transaction can carry a NULL completion stamp (still open), a listing can carry a NULL sale attribute, a bonus-eligible field can be empty. Square screens check whether the NULL is treated as a population to report, coalesced for display, or excluded with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Set ops for the books",
      why: "Month-close stitches populations into one deliverable: card-rail vs transfer-rail settlements, spend-in vs spend-out packets. UNION ALL's no-dedupe cheapness and the column-position discipline are the tested reflexes — a packet that silently dedupes masks the double-count the close exists to catch.",
      slugs: ["monthly-transactions-ii", "team-scores-in-football-tournament", "count-apples-and-oranges", "number-of-rich-customers"],
    },
    {
      name: "Cents-safe money math",
      why: "Every money column in the billing, settlement, expense and ledger tables is INTEGER cents — 16800 rent cents, 37364 card-settlement cents — so every dollar read is amount_cents / 100.0 and every ratio sits one forgotten .0 away from a truncation leak. Reconciliation reads (trial-balance eyes, per-account folds) are the kit's finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "total-traveled-distance", "the-number-of-users-that-are-eligible-for-discount"],
    },
    {
      name: "Running totals & window frames",
      why: "Cumulative GMV to date and the running ledger balance are the dashboard's two spine charts, and both are window frames: SUM() OVER (ORDER BY date) with the frame declared. The drill is frame literacy — RANGE folds peers together, ROWS folds row by row, and the difference shows up the moment two register events share a timestamp.",
      slugs: ["account-balance", "game-play-analysis-iii", "find-cumulative-salary-of-an-employee", "balance-rollforward", "bank-account-summary"],
    },
    {
      name: "Seller cadence & recency clocks",
      why: "Cadence is the seller-health signal underwriting reads: days between orders, repeat-purchase windows, most-recent activity per listing. The drills pair date math (JULIANDAY deltas, seven-day repeat windows) with argmax windows that must break ties deterministically.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "the-most-recent-orders-for-each-product", "sales-analysis-iii", "repeat-purchase-rate"],
    },
    {
      name: "Loan-book & velocity risk",
      why: "Square Loans underwrites off the transaction stream, so the risk lane's two drills are the loan-book fold (amortization schedules, NPV of a payment stream) and the velocity scan (bursts of consecutive activity on a card rail). Both are staged reads: a WITH spine, then windows or recursion on top.",
      slugs: ["loan-amortization-schedule", "npv-queries", "transaction-velocity", "suspicious-bank-account-transactions"],
    },
    {
      name: "Staged subqueries & derived folds",
      why: "Deeper reads stage a fold and compare against it: who beats their cohort's average, who came back the day after install. The drill is subquery hygiene — scalar for one number, derived for a staged fold, EXISTS for presence — plus knowing which shape the planner runs once versus per row.",
      slugs: ["market-analysis-i", "game-play-analysis-iv", "managers-with-at-least-5-direct-reports", "sales-by-day-of-the-week", "same-day-sale"],
    },
    {
      name: "Catalog hygiene & dedupe passes",
      why: "Catalogs rot: duplicate listings, missing attributes, stale latest records. The drills are the dedupe census (GROUP BY … HAVING COUNT(*) > 1), the LEFT JOIN completeness check, and the keep-only-latest fold that feeds every current-catalog view.",
      slugs: ["duplicate-emails", "employees-with-missing-information", "find-latest-salaries", "product-price-at-a-given-date"],
    },
  ],

  theory: [
    {
      id: "block-t1",
      q: "Walk me through the three-table chain behind GPV per seller. Where does the fan-out bite, and which join types keep the read honest?",
      a: "The chain is seller → catalog → line items: sellers JOIN products ON seller_id, products JOIN order_items ON product_id, and only then GROUP BY seller. The fan-out bites between the last two hops: one listing appears in many line items, so after the join one row means one LINE, not one listing and not one transaction — COUNT(*) counts 251 line items where COUNT(DISTINCT p.id) counts listings and COUNT(DISTINCT o.order_id) would count transactions. INNER is honest for the revenue fold (a listing with no sales contributes zero rows and zero revenue either way), but the idle-catalog question needs the LEFT JOIN FROM the seller side — the unmatched listings ARE the answer, and filtering the sales table in WHERE would delete them. Say what one row means after each hop; every aggregate downstream inherits that meaning.",
      tag: "joins",
    },
    {
      id: "block-t2",
      q: "GMV per seller: why is SUM(unit_price * quantity) computed at the line grain the correct fold — and what does summing the transaction total at the wrong grain do?",
      a: "The line item carries the economic truth of the sale: unit_price × quantity, per line, summed per seller — on this db that fold reproduces the probed seller revenue exactly (11130.25 at the top, 34833.28 across all six). The wrong-grain traps are symmetric: joining transactions to line items and summing the transaction total per line multiplies every multi-line transaction's total by its line count — revenue inflates silently; and aggregating at the transaction grain while the question is per-seller loses the catalog dimension entirely. The discipline the interviewer grades: pick the grain the business question lives at (seller), walk the fold down to that grain explicitly, and verify the fold against a known total — if your per-seller folds don't sum to the platform's GMV, a join multiplied something it shouldn't have.",
      tag: "aggregation",
    },
    {
      id: "block-t3",
      q: "The commerce deck's top-seller ladder has two sellers tied at the boundary. What are the three rank options, and what does each imply for the deck?",
      a: "ROW_NUMBER() assigns arbitrary distinct positions through the tie — the tie is erased, and the deck shows a winner the engine chose. RANK() gives tied sellers the same rung and skips the next (1, 2, 3, 4, 4, 6) — the gap implies a missing fifth seller that does not exist. DENSE_RANK() shares the rung and keeps the ladder compact (1, 2, 3, 4, 4, 5) — ties admitted, no phantom gaps. The choice is a business decision, not a syntax preference: merchandising slots usually want ROW_NUMBER plus a deterministic tie-break (listing id ASC) so the pick is reproducible; fairness-minded reads (loan tiers, dispute bands) want DENSE_RANK so no tied seller is silently differentiated. The wrong answer is nudging LIMIT until the tie disappears. At Block the ladder feeds real allocations, so 'who shares a rung' is a question someone must own — the strong candidate names it before the interviewer does.",
      tag: "windows",
    },
    {
      id: "block-t4",
      q: "A register transaction's completion stamp is NULL. How do NULLs behave in filters, joins and aggregates here — and what is your policy?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — WHERE completed_at < cutoff silently drops still-open tickets, which may be exactly right (they have no completion yet) or a silent leak (the open-ticket count you were asked for). Joins: NULL keys never match — a line item whose listing reference is NULL vanishes from INNER joins and survives only as a LEFT-join payload. Aggregates: AVG and COUNT(col) skip NULLs while COUNT(*) keeps the row — so 'average ticket value' over open-and-closed tickets quietly measures only the closed ones. The policy: state the population first. 'Completed tickets only' is a legitimate report — say it in the title and the WHERE; 'all tickets with open ones flagged' is a COALESCE/CASE report. What is never acceptable is letting NULL semantics make the population decision invisibly — on a seller's books, an invisible exclusion is a misstated balance.",
      tag: "nulls",
    },
    {
      id: "block-t5",
      q: "The dispute-rate report should cover only sellers above a volume gate. Where does the gate live, and what breaks if it lives in the wrong clause?",
      a: "The gate is a property of the GROUP (the seller's transaction count), so it lives in HAVING, after the fold that computes both the rate and the volume: SELECT seller, 100.0 * disputes / settled_transactions AS rate … GROUP BY seller HAVING COUNT(*) >= 30. In WHERE the gate is impossible — the count doesn't exist before aggregation, and a hard error is the lucky outcome; the unlucky one is gating on a raw column that means something else entirely. The reverse trap is putting ROW-level filters (status = 'settled') in HAVING: it can work syntactically after a GROUP BY on that same column, but it reads as group logic and hides the population rule. The Block framing that makes it stick: a seller with two transactions and one dispute is a 50% rate that means nothing — the HAVING gate is what keeps the risk ladder from promoting noise, and the gate value is a business decision someone must be able to quote.",
      tag: "filtering",
    },
    {
      id: "block-t6",
      q: "Which sellers beat the platform's average GPV? Compare the scalar-subquery shape with a window — and what happens when the inner fold is empty?",
      a: "The scalar shape: WHERE gmv > (SELECT AVG(gmv) FROM per_seller) — the inner fold is contractually 0-or-1 rows. On the full seller table it always returns a row (six sellers, a stable average), but on a filtered staging slice — one category, one month — an empty inner fold yields NULL, every comparison against NULL is UNKNOWN, and the report returns zero rows with no error: the above-average question silently dissolves. The window shape, gmv > AVG(gmv) OVER (), folds the platform average onto every row in the same pass — no second scan, no empty-inner failure mode, and the comparison is visible per row for debugging. The correlated cousin (average within the seller's category) answers a different question at a different cost. Saying which population the inner fold covers — and what happens when it's empty — is precisely what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "block-t7",
      q: "Expense and settlement rows carry TEXT timestamps. How do you build the seller's monthly books calendar, and where does it lie if careless?",
      a: "STRFTIME('%Y-%m', spent_on) — or SUBSTR(spent_on, 1, 7) on fixed-width ISO text — builds the month spine: bucket, then fold SUM(amount_cents) per month, converting to dollars once at the end (1650 cents prints 16.50, not 16). The calendar lies three ways: half-open intervals — spent_on >= '2025-01-01' AND < '2025-02-01' — are mandatory because BETWEEN on the last day drops the month-end burst; the SUBSTR shortcut dies the day the feed's format changes width, mis-bucketing everything after it; and TEXT dates sort lexicographically, which is correct only while the format stays ISO. The Block-specific discipline: the expense calendar must reconcile against the ledger's monthly folds — a month whose spend total disagrees with the books is a data-quality fire, and the calendar query is how you find which month to open first.",
      tag: "dates",
    },
    {
      id: "block-t8",
      q: "Before the seller's books close, what does your data-quality pass check — and what does a voided entry with live money tell you about trusting labels?",
      a: "Three gates, in order. Units: every money column in billing, settlements, expenses and the ledger is INTEGER cents — amount_cents / 100.0 with the .0, or 16800 rent cents print as 168 and every ratio downstream inherits the truncation. Ledger proof: debits must equal credits (181080 against 181080, delta 0 here) — the trial balance is the pass that licenses every other number. Label-versus-movement: the books contain a voided entry that still carries a live payment and a paid entry with no payment rows at all — status is a claim, the money-movement table is evidence, and a rate computed over labels alone absorbs the lie silently. The strong candidate runs all three as one scan — units normalized, delta zeroed, labels cross-checked against movement — and only then ships the spend census, the GPV ladder, or the underwriting memo. Data quality is the query before the queries.",
      tag: "data-quality",
    },
    {
      id: "block-t9",
      q: "Walk me through SQL's logical pipeline. Where do WHERE, HAVING and window functions actually sit — and which filters fail where?",
      a: "The engine runs FROM/JOIN, then WHERE, then GROUP BY, then HAVING, then window functions, then SELECT, then ORDER BY/LIMIT — while humans write top-down, which is where every trap lives. You cannot filter on an aggregate in WHERE (COUNT does not exist until after GROUP BY — that is HAVING's job), and you cannot use a window function in WHERE at all: windows evaluate at SELECT time, so a top-3-per-group filter must wrap the ranked query in a derived table and filter outside. One SQLite-specific wrinkle to name out loud: a SELECT alias IS visible in WHERE and HAVING here, while Postgres refuses it — portability cuts both ways. On the Block surface this order is load-bearing: the dispute ladder's volume gate lives in HAVING after the rate fold, and the top-listing-per-category read only works because the rank is computed in an inner SELECT and filtered in the outer one. Write the pipeline as a comment before the query; the interviewer grades the discipline before the SQL.",
      tag: "pipeline",
    },
    {
      id: "block-t10",
      q: "You write a running total with OVER (ORDER BY ts). What frame did you just get — and what happens when two events share a timestamp?",
      a: "With ORDER BY inside OVER() and no frame clause, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats peers (rows sharing the ORDER BY value) as one fold: two transactions with the same timestamp both receive the cumulative value including the other, so the curve jumps by the whole tie group at once. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW folds strictly row by row and splits the tie. On a seller dashboard the cumulative-GMV line is a RANGE frame wearing a ROWS assumption: same-second register events — batch imports produce them constantly — read as plateaus-then-jumps that look like fraud to whoever is watching the chart. The drilled habit is to say the frame out loud whenever you write a running total, and to reach for ROWS when the grain is the row and RANGE only when the grain genuinely is the ORDER BY value. Block's register streams are exactly where the two disagree.",
      tag: "frames",
    },
    {
      id: "block-t11",
      q: "The month-close packet stitches card-rail and wire-rail settlements. UNION or UNION ALL — and what do INTERSECT and EXCEPT actually compare?",
      a: "UNION dedupes; UNION ALL does not — and on a close packet that difference is the bug: ALL keeps both legs of a split settlement (five invoice cycles here settle on BOTH card and wire), while bare UNION silently collapses identical rows and the close under-counts by exactly the duplicates it needed. INTERSECT and EXCEPT also dedupe their outputs, and all three set ops compare by COLUMN POSITION, not by name — the second SELECT's columns align to the first's positions, so a packet that reorders columns mid-build merges amounts into labels with no error raised. EXCEPT is also the cleanest anti-join you are not using: legs-without-statements falls out as one operator, and set ops treat NULLs as comparable members, dodging the NOT IN three-valued-logic trap entirely. The Block framing: a packet is an evidence bag — UNION ALL because every row is evidence, position-aligned columns because the bag has no labels.",
      tag: "setops",
    },
    {
      id: "block-t12",
      q: "Which listings beat their own category's average revenue? Compare the correlated subquery, the derived-table join and the window — including what each costs.",
      a: "The correlated shape references the outer row and re-runs per row: WHERE revenue > (SELECT AVG(revenue) FROM per_listing WHERE category = p.category) — correct, readable, and a re-scan per row on a naive planner: fine at 16 listings, a fire at 16 million. The derived-table rewrite computes the per-category fold once and joins it back — same answer, one scan, and it is the shape that scales. The window shape, AVG() OVER (PARTITION BY category), computes the same group statistic in a single pass and stamps it on every row, at the cost of keeping every row (filter outside). The semi-join cousin — WHERE EXISTS (SELECT 1 FROM sales WHERE sales.key = a.key) — checks presence without the fan-out a real join would add, which is exactly why Block's seller-grain reads use EXISTS against the line-item chain: joining would fan the fold back out to lines. Name the execution model, then name the rewrite; that pairing is the entire question.",
      tag: "correlated",
    },
    {
      id: "block-t13",
      q: "When do you stage a query as a CTE instead of a nested subquery — and what does WITH actually cost in SQLite?",
      a: "A WITH clause stages a fold under a name so the main query reads like the business question: WITH per_seller AS (seller, listings, gmv), then ranking or shares on top. The craft rules: one CTE per concept, chained rather than nested three deep, and filters pushed INTO the earliest stage so later folds handle fewer rows. The performance honesty part: in SQLite a CTE is an inlined view, not a materialized temp table, so referencing it twice can run the fold twice — check EXPLAIN QUERY PLAN (MATERIALIZED hints exist in newer SQLite) instead of assuming, and duplicate the fold explicitly when reuse is expensive. The trap CTEs fix: the three-hop GPV chain reads top-down instead of as one tangled join; the trap they create: analysts who treat them as free and stack five stages where one derived table would do. On the month-close packet, one CTE per rail — card legs, wire legs — is what makes the UNION ALL readable at review.",
      tag: "ctes",
    },
    {
      id: "block-t14",
      q: "COUNT(*), COUNT(col), COUNT(DISTINCT col) — over the same 251 line items these return different numbers. Walk me through which is which and where each is the honest denominator.",
      a: "COUNT(*) counts rows; COUNT(col) counts non-NULL values of that column; COUNT(DISTINCT col) collapses repeats to distinct values; and a multi-key census needs COUNT(DISTINCT a || '-' || b) or a pre-aggregated fold. The interview form is a denominator question: attachment rate is lines per transaction, so the numerator is COUNT(*) over order_items and the denominator is COUNT(DISTINCT order_id) — 251 lines over 103 transactions reads 2.44, while a careless COUNT(order_id) reads 251/251 = 1.0 because every line carries an id. COUNT(col) drifts exactly when the column is nullable: COUNT(shipped_at) over orders is 82 while COUNT(*) is 103, and a completion rate built as COUNT(shipped_at)/COUNT(*) is only accidentally correct because the NULL genuinely means 'no ship stamp yet'. The graded answer is not the syntax — it is saying which population each counter measures and why the NULLs mean what you claim. On a seller's books, an unexplained denominator is a misstated ratio.",
      tag: "counts",
    },
    {
      id: "block-t15",
      q: "Ship latency, settlement days, AR aging — how do you compute durations from TEXT timestamps without lying to yourself?",
      a: "Durations need JULIANDAY: julianday(shipped_at) - julianday(created_at) averages 2.98 days across the 82 shipped-or-delivered orders here, range 2 to 4. Subtract the raw TEXT stamps instead and you get 0 for every row — ISO strings coerce to numbers whose leading digits cancel — a silent zero that flattens every latency chart. The variants worth knowing: STRFTIME('%s', x) - STRFTIME('%s', y) gives whole seconds and loses sub-day precision; DATE(x, '+1 month') walks calendar months but drifts across month-ends (Jan 31 plus one month is not Feb 31); and aging buckets are julianday(reference) - julianday(event) CASE-banded, which is how the billing book's 30-day terms surface the outliers — the settlement clock averages 28.4 days to pay, 13 fastest, 84 slowest. The discipline to state: convert to a numeric timeline once, at the start, and keep every duration computation on that timeline; mixing TEXT arithmetic and JULIANDAY in one column is how a report ships with two incompatible units.",
      tag: "durations",
    },
    {
      id: "block-t16",
      q: "Why does this platform store money as INTEGER cents — and where exactly must the /100.0 live?",
      a: "INTEGER cents exist because binary floats cannot hold 0.1: store 16800 and the ledger balances to the cent, store 168.00 and every SUM accumulates representation drift that a reconciliation gate eventually trips over. So the policy writes itself: money columns stay INTEGER through every fold — SUM(amount_cents), HAVING, comparisons, joins on amounts — and the /100.0 happens exactly once, in the outermost SELECT, with the .0 on the divisor, because INTEGER / 100 truncates (4570 / 100 prints 45, not 45.70 — the Ads book leaks 0.70 a month to integer math). Beware the ROUND(x, 2) cents-fold that looks right: on this book every statement-group cent sum is a whole-euro multiple, so a bare ROUND reproduces dollar digits by coincidence and hides the missing conversion until the first odd-cent entry arrives. The one-conversion rule also makes audits legible: any dollar figure you cannot trace to exactly one /100.0 is a bug you have not found yet — and that reflex is what Block's books team is actually screening for.",
      tag: "money",
    },
    {
      id: "block-t17",
      q: "Nothing here is big enough to be slow. What performance instincts are you actually screening for, and how do you hunt a slow query?",
      a: "At 103 orders nothing is slow, so the screen is instincts, not heroics. The drilled list: make predicates sargable (a range compare on the raw column beats a STRFTIME or LIKE wrapper that defeats the index), filter before joining where the planner allows it, aggregate early and join the fold back instead of re-folding a fan-out per row, never SELECT * into an application path, and treat DISTINCT as a smell — it usually papers over a hidden fan-out you should fix instead. The hunt starts with EXPLAIN QUERY PLAN, not with new indexes: SCAN on the big table while an index sits unused is the classic finding, and the fix is usually the predicate shape. Then say the honest part out loud: at this scale correctness beats microseconds, and the habit being graded is writing the query you could still debug at a billion rows — staged folds, filters early, named grains, declared frames. Performance reviews at Block are code reviews with a plan file attached.",
      tag: "performance",
    },
    {
      id: "block-t18",
      q: "The end-of-day register summary stitches each transaction's items into one cell. How does GROUP_CONCAT behave — and when is it the wrong tool?",
      a: "GROUP_CONCAT folds rows into one string cell: GROUP_CONCAT(p.name) per transaction gives the seller's stitched EOD summary. The nondeterminism trap: the default order is unspecified, so the cell changes between runs until you order inside the aggregate — GROUP_CONCAT(p.name, ', ' ORDER BY p.name) on SQLite 3.44+, or an ordered subquery on older builds. The silent-failure list: the result is TEXT with an engine-defined length limit, so long catalogs truncate without an error; the separator is the second argument and a NULL separator silently reverts to the comma default; and NULL members are skipped entirely, so stitching a nullable column under-counts. It pairs beautifully with the register fold — transaction id, ticket total, items-as-one-cell in one GROUP BY — and it is the wrong tool the moment someone SPLITs the cell back into rows downstream: then the right answer was a join, and the comma was a bad schema decision. Saying that second half is what separates a syntax user from an engineer.",
      tag: "concat",
    },
    {
      id: "block-t19",
      q: "One scan, many books: how do you count cancellations, bands and coverage classes in a single pass — and what does COUNT(status = 'cancelled') actually count?",
      a: "The one-pass shape is SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) beside COUNT(*) in the same GROUP BY — the status census, the ticket-band census and the coverage census (exact / partial / none per statement) are all this one shape. The canonical bug: COUNT(status = 'cancelled') counts the BOOLEAN — every non-NULL comparison result, i.e. all 103 rows — so it equals COUNT(*) and quietly reports zero cancellations forever; COUNT(CASE WHEN … THEN 1 END) works only because the ELSE NULL is skipped. Second bug: a missing ELSE arm yields NULL, which SUM skips, so a numerator built on it drifts downward. Third: SQLite's FILTER clause says the same thing with clearer intent — COUNT(*) FILTER (WHERE status = 'cancelled') — where the runtime supports it. The Block framing: the ELSE arm is where the boundary lives, and an implicit ELSE NULL band in a shipped report is how a bucket of unexplained rows reaches the commerce review with nobody owning it.",
      tag: "conditional",
    },
    {
      id: "block-t20",
      q: "Build the month-over-month revenue delta. What does LAG give you on the first row, and which three bugs corrupt the trend column?",
      a: "LAG(revenue) OVER (ORDER BY month) fetches the previous row's value so the delta is revenue - LAG(revenue): 2024-02's 3609.64 against 2024-01's 3731.97 reads -122.33, and the 14-month spine shows the year's shape — the July trough at 1193.86, the August rebound of +1158.21, the November slide of -1326.87. Bug one, the first row: LAG returns NULL there — display it as an em dash via CASE, but never COALESCE the raw LAG to 0 before subtracting, or you fabricate a fake-flat opening month. Bug two, the missing partition: without PARTITION BY seller the running delta leaks across sellers — seller B's January compares against seller A's December. Bug three, the sort direction: ORDER BY month DESC inside OVER makes LAG fetch the NEXT month, a sign-flipped trend that survives every eyeball check because the magnitudes look plausible. The dashboard framing: a WoW column is LAG plus a stated grain, and the first row is labeled '—', never 0.",
      tag: "lag",
    },
    {
      id: "block-t21",
      q: "Find the invoices with no payment legs. Compare LEFT JOIN … IS NULL, NOT EXISTS and NOT IN — and tell me which one can silently return an empty report.",
      a: "Three shapes, one population. LEFT JOIN … WHERE b.id IS NULL keeps unmatched left rows and carries their columns for free. NOT EXISTS (SELECT 1 FROM b WHERE b.key = a.key) reads the same population as a join-shaped predicate and plans the same with an index. NOT IN (SELECT key FROM b) is the trap: if the subquery list contains one NULL, every row's comparison is UNKNOWN — x NOT IN (1, NULL) can never be TRUE — and the whole report returns empty with no error, the morning after an ETL job adds a bad row. The verified case here: 6 invoices worth 15,217.00 have no payment legs — the dunning queue — and the LEFT JOIN shape earns its keep because the report wants the unpaid side's amount, status and age anyway. Performance: NOT EXISTS and LEFT JOIN plan alike with the right index; NOT IN materializes the whole list. What the interviewer grades: can you explain WHY NOT IN breaks (three-valued logic), and would you catch the empty report in review before the dunning email ships to nobody?",
      tag: "antijoins",
    },
    {
      id: "block-t22",
      q: "Defend a KPI definition end to end — take chargeback rate. What are the numerator, denominator, gate and the failure mode of the obvious wrong version?",
      a: "A KPI definition is a population plus a fold plus a denominator, written down before the number exists. Chargeback rate: numerator is disputes in the window; denominator is SETTLED transactions in the same window and the same population — not all placed tickets; the gate is a per-seller volume floor enforced in HAVING, because a seller with two transactions and one dispute posts a 50% rate and tops the risk ladder on noise. The failure mode of the wrong version is structural: ungated rates promote small sellers exactly when their evidence is weakest, and a denominator of placed tickets hides the settled-vs-placed gap — 14 of 103 tickets here are still pending and cannot generate disputes yet. The interview drill is to defend the definition out loud: numerator, denominator, population filter, gate value, and who owns the gate. At Block this is load-bearing twice over — the same definitions feed the underwriting model, so a KPI quietly redefined between decks is a model eating a drifted input. The strong candidate brings definitions and asks which committee owns them.",
      tag: "kpi",
    },
    {
      id: "block-t23",
      q: "Top listing per category. How does PARTITION BY differ from GROUP BY, and where does the window-over-aggregate shape become mandatory?",
      a: "PARTITION BY is GROUP BY that keeps every row: the window computes the group statistic — category total, region total, count of peers — and stamps it onto each detail row instead of collapsing the detail away. The canonical Block read is top-listing-per-category: ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) = 1 — the partition slices the ladder per category, the ORDER BY ranks within the slice, and the outer query filters the crown rows. The mandatory shape appears when the statistic must aggregate first: shares of category revenue after a GROUP BY need SUM(SUM(x)) OVER (PARTITION BY category) — a window over the folded aggregate — because the window evaluates after GROUP BY and can fold the folded. Traps: forgetting PARTITION BY computes one global ladder; partitioning by the wrong key (listing instead of category) makes every rung a rung of one; and the window does not reduce rows, so a later SUM over it double-counts unless staged. GROUP BY answers 'what did the category do'; PARTITION BY answers 'where does this listing sit inside it' — concentration shares, within-group ranks, gaps to the leader.",
      tag: "partition",
    },
    {
      id: "block-t24",
      q: "A settlement feed renames amount_cents to amount_dollars overnight. What breaks, what does not, and what is your standing defense?",
      a: "Every fold reads the new column as dollars-shaped numbers wearing a cents costume: a 100× understatement flows into GPV, coverage and the books, and the tell is the trial balance refusing to reconcile — which is exactly why the zero-delta check runs before any dashboard ships. The sneaky part is what does NOT break: the query runs, the row counts match, and ROUND(x, 2) still prints plausible digits — drift hides from syntax checks by design. Timestamp drift is the sibling case: a feed widening ISO-date to ISO-datetime keeps SUBSTR(x, 1, 7) month buckets intact but starts dropping rows from BETWEEN '2024-03-31' filters that now sort past midnight; a status vocabulary that grows a new value turns every exhaustive CASE census into an implicit NULL band. The standing defense is a schema census that runs on every load — PRAGMA table_info for columns and types, DISTINCT value domains, null rates, row-count freshness — compared against a stored contract, with the trial balance as the backstop. The analyst who can detect drift in one query is the one whose KPIs survive the vendor's next migration.",
      tag: "drift",
    },
  ],

  mcqs: [
    {
      id: "block-mcq-1",
      prompt: "sellers ⋈ products ⋈ order_items, then GROUP BY seller. After the join, what does one row mean?",
      choices: [
        "One seller",
        "One listing",
        "One line item of one listing of one seller",
        "One transaction",
      ],
      answer: 2,
      why: "The chain fans out at every hop: a seller with three listings that sold in 40 transactions contributes 40+ rows. Every COUNT and SUM downstream inherits that grain — COUNT(*) counts line items, COUNT(DISTINCT p.id) counts listings.",
      notes: [
        { choice: 1, why: "A listing with 20 sales contributes 20 rows. The listing grain died at the second hop — DISTINCT is what brings it back." },
        { choice: 3, why: "A transaction with three line items contributes three rows. Transaction grain needs COUNT(DISTINCT order_id) — or a pre-aggregated fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-2",
      prompt: "Which expression computes each seller's GMV correctly from order_items?",
      choices: [
        "COUNT(oi.unit_price * oi.quantity)",
        "SUM(oi.unit_price * oi.quantity)",
        "SUM(oi.unit_price) * SUM(oi.quantity)",
        "AVG(oi.unit_price) * COUNT(*)",
      ],
      answer: 1,
      why: "Revenue is value per line folded: SUM(price × quantity) per seller — on this db it reproduces the probed seller GMV (11130.25 at the top). The product must live INSIDE the sum so each line's economics fold exactly.",
      notes: [
        { choice: 0, why: "COUNT counts non-NULL rows — it returns line counts where dollars were asked. Units and question both drift." },
        { choice: 2, why: "Sum of prices times sum of quantities multiplies two aggregates that were never paired per line — a mathematically confident wrong answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-3",
      prompt: "expenses.amount_cents is INTEGER: Rent totals 16800 cents over 14 entries. Which SELECT prints the correct dollar total?",
      choices: [
        "SELECT SUM(amount_cents) / 100 FROM expenses WHERE category = 'Rent'",
        "SELECT SUM(amount_cents) / 100.0 FROM expenses WHERE category = 'Rent'",
        "SELECT SUM(amount_cents / 100) FROM expenses WHERE category = 'Rent'",
        "SELECT SUM(amount_cents) FROM expenses WHERE category = 'Rent'",
      ],
      answer: 1,
      why: "Fold in cents, convert once with a REAL divisor: 16800 / 100.0 = 168.00. INTEGER division truncates; per-row integer division corrupts every odd-cent entry before the fold even starts.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER truncates toward zero — here it lands on 168 by luck of a round total, but 4570 / 100 = 45, not 45.70: the Ads line leaks." },
        { choice: 3, why: "That prints 16800 — cents wearing a dollar costume. The most expensive missing /100.0 in the file." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-4",
      prompt: "Two sellers tie at 47 units for the top rung, the next has 46. Which window keeps the ladder honest — ties share a rung, no phantom gap?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY units DESC)",
        "RANK() OVER (ORDER BY units DESC)",
        "DENSE_RANK() OVER (ORDER BY units DESC)",
        "LIMIT 1 OFFSET 1 on an ORDER BY",
      ],
      answer: 2,
      why: "DENSE_RANK reads 1, 1, 2 — tied sellers share the rung and the next distinct value follows without a gap. RANK reads 1, 1, 3 (phantom gap); ROW_NUMBER erases the tie; OFFSET picks an arbitrary seller.",
      notes: [
        { choice: 1, why: "RANK's gap (1, 1, 3) implies a missing second seller that doesn't exist — the deck would show a hole where a rung should be." },
        { choice: 0, why: "ROW_NUMBER hands the crown to whichever row the engine saw first — a reproducibility bug wearing a ranking." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-5",
      prompt: "The dispute-rate report must cover only sellers with at least 5 transactions. Where does the gate go?",
      choices: [
        "WHERE COUNT(*) >= 5, before GROUP BY",
        "HAVING COUNT(*) >= 5, after the fold that computes the rate",
        "LIMIT 5 per seller",
        "WHERE disputes >= 5",
      ],
      answer: 1,
      why: "Volume is a group property: it exists only after GROUP BY, so the gate is HAVING. WHERE cannot see COUNT(*); LIMIT caps rows, not per-seller volume; gating on the dispute count answers a different question entirely.",
      notes: [
        { choice: 0, why: "COUNT(*) doesn't exist before aggregation — WHERE runs on rows. This is a syntax error that usefully defines the pipeline order." },
        { choice: 3, why: "That finds heavy-dispute sellers, not adequately-volumeed sellers — a 1-dispute seller with 5 transactions passes a 5-transaction seller with 0 disputes. Different population." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-6",
      prompt: "A basket census bands transactions as 'small' (under 50) and 'standard' (50 and up). Which GROUP BY arm is exhaustive?",
      choices: [
        "CASE WHEN total < 50 THEN 'small' END — one arm suffices",
        "CASE WHEN total >= 50 THEN 'standard' WHEN total < 50 THEN 'small' END",
        "CASE WHEN total > 50 THEN 'standard' ELSE 'small' END",
        "WHERE total >= 50 UNION ALL WHERE total < 50",
      ],
      answer: 2,
      why: "The ELSE arm catches everything the first arm missed — total > 50 for standard, ELSE small (including exactly 50, per the definition). Two explicit arms also work when the boundary is stated in one of them; a single-arm CASE sends NULL-band rows into a silent bucket.",
      notes: [
        { choice: 0, why: "Standard-band rows fall into the implicit ELSE NULL — the census ships a NULL band nobody can explain in the review." },
        { choice: 2, why: "Careful: total > 50 puts a 50.00 ticket in 'small' — the boundary landed on the wrong side of the stated definition. Boundary placement IS the test." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-7",
      prompt: "Which WHERE clause captures every March 2024 expense, including '2024-03-31 23:59:59'?",
      choices: [
        "WHERE spent_on BETWEEN '2024-03-01' AND '2024-03-31'",
        "WHERE spent_on >= '2024-03-01' AND spent_on < '2024-04-01'",
        "WHERE STRFTIME('%Y-%m', spent_on) = '2024-03'",
        "WHERE spent_on LIKE '2024-03%'",
      ],
      answer: 1,
      why: "The half-open interval [Mar 1, Apr 1) admits every timestamp in the month. Note STRFTIME also works as a filter — but range comparison is sargable and survives format drift; LIKE defeats indexes and dies on padding changes.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — '2024-03-31 23:59:59' > '2024-03-31' (midnight), so the month's last entries vanish from the books." },
        { choice: 3, why: "LIKE works only while the format never changes and can't use an index — the calendar spine deserves a range predicate." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-8",
      prompt: "products LEFT JOIN order_items to find listings that never sold. A colleague adds WHERE oi.quantity > 0. What happened?",
      choices: [
        "Nothing — the filter is redundant",
        "The LEFT JOIN became an INNER JOIN: the never-sold listings were deleted",
        "The query now returns only sold listings with NULL quantities",
        "It errors — you cannot filter the right table of a LEFT JOIN",
      ],
      answer: 1,
      why: "Never-sold listings carry NULL oi columns; NULL > 0 is UNKNOWN, so the WHERE discards them — collapsing the LEFT JOIN to an INNER and deleting exactly the rows the anti-join exists to find. The predicate belongs in ON (or use NOT EXISTS).",
      notes: [
        { choice: 1, why: "Not an error — a silently changed join type. The query still runs and still looks plausible; the idle-catalog list is just empty now." },
        { choice: 2, why: "NULL payloads fail any comparison, so they never survive to be returned. The result is the sold set only." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-9",
      prompt: "The ledger has 80 entries. Which single query proves the books balance?",
      choices: [
        "SELECT COUNT(*) FROM ledger_entries",
        "SELECT SUM(debit_cents) - SUM(credit_cents) FROM ledger_entries — must read 0",
        "SELECT MAX(debit_cents), MAX(credit_cents) FROM ledger_entries",
        "SELECT account, SUM(debit_cents) FROM ledger_entries GROUP BY account",
      ],
      answer: 1,
      why: "The trial-balance proof: total debits minus total credits must be exactly zero (here 181080 − 181080). A conditional-SUM variant computes the same delta in one pass; per-account folds are the follow-up, not the proof.",
      notes: [
        { choice: 0, why: "80 rows prove nothing about balance — a ledger can be complete and wrong. Count is a freshness check, not an integrity check." },
        { choice: 2, why: "Maxima compare the largest single entries — two unrelated numbers whose equality means nothing about the books." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-10",
      prompt: "You fold per-seller GMV and it sums to 69,666.56 — but the platform's GMV is 34,833.28. What class of bug is this?",
      choices: [
        "Rounding error — add ROUND at the end",
        "A fan-out double-count: some join multiplied rows (e.g. transactions joined to line items before summing the transaction total)",
        "Integer-cent truncation",
        "NULL handling — COALESCE the totals",
      ],
      answer: 1,
      why: "Exactly 2× the true GMV is the signature of a doubled fold — the classic is summing orders.total after joining to order_items, multiplying each multi-line transaction's total by its line count. Rounding and cents bugs produce drift, not clean multiples.",
      notes: [
        { choice: 0, why: "Rounding produces off-by-cents noise, never a clean 2×. The doubling is structural — find the join that multiplied." },
        { choice: 2, why: "Truncation LOSES cents (downward), it never doubles. Units bugs and fan-out bugs are different species — learn to tell them apart." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-11",
      prompt: "The month spine is STRFTIME('%Y-%m', created_at). Which WHERE clause returns March 2024's 8 register transactions?",
      choices: [
        "WHERE STRFTIME('%Y-%m', created_at) = 2024-03",
        "WHERE STRFTIME('%Y-%m', created_at) = '2024-03'",
        "WHERE STRFTIME('%Y-%m', created_at) = 3",
        "WHERE SUBSTR(created_at, 1, 4) = '2024-03'",
      ],
      answer: 1,
      why: "STRFTIME returns TEXT, so the comparison must be against TEXT: '2024-03' matches the 8 March transactions. The unquoted token is parsed as the arithmetic expression 2024 minus 3 = 2021, and no month string ever equals 2021.",
      notes: [
        { choice: 0, why: "Verified on this db: the numeric form matches 0 rows — not an error, just an empty report. STRFTIME-vs-number is the quietest filter bug in the kit." },
        { choice: 2, why: "Months are '2024-01'..'2025-02' text — nothing equals the bare integer 3. TEXT columns compare to TEXT." },
        { choice: 3, why: "SUBSTR(created_at, 1, 4) yields '2024' — the year, never '2024-03'. Wrong slice width, empty result." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-12",
      prompt: "orders has 103 rows; shipped_at is stamped on 82. A colleague builds 'tickets with ship stamps' as COUNT(o.shipped_at) and 'all tickets' as COUNT(*). Which claim is true?",
      choices: [
        "Both read 103 — COUNT(col) counts NULLs too",
        "COUNT(shipped_at) reads 82, COUNT(*) 103 — the 21 unstamped (14 pending, 7 cancelled) are the gap",
        "COUNT(shipped_at) reads 103 but COUNT(*) errors on NULLs",
        "Both read 82 — COUNT(*) drops rows with any NULL column",
      ],
      answer: 1,
      why: "COUNT(col) counts non-NULL values only: 82 stamped stamps. COUNT(*) counts rows: 103. The difference — 14 pending plus 7 cancelled — is exactly the population whose ship stamp does not exist yet or never will.",
      notes: [
        { choice: 0, why: "That's COUNT(*) semantics pasted onto COUNT(col). The col form's NULL-skip is the whole point — a completion rate built from it is only honest if NULL means 'not yet'." },
        { choice: 3, why: "COUNT(*) counts rows regardless of content; only COUNT(col) skips NULLs. Reversed semantics produce plausible-looking wrong numbers." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-13",
      prompt: "What does a window with PARTITION BY category give you that GROUP BY category does not?",
      choices: [
        "Faster execution — SQLite optimizes it differently",
        "It also removes duplicate category rows",
        "Every detail row is kept, each stamped with its category's group statistic",
        "Nothing — they are interchangeable in every query",
      ],
      answer: 2,
      why: "PARTITION BY computes the group statistic and STAMPS it on every row — the detail survives, so you can rank within the group or compare a row to its group total. GROUP BY collapses the detail away.",
      notes: [
        { choice: 1, why: "That's GROUP BY's behavior. The window's entire value is keeping the row while showing where it sits — e.g. each listing beside its category total." },
        { choice: 3, why: "They overlap only when you discard detail. The moment the question is 'where does this row rank inside its group', GROUP BY cannot answer at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-14",
      prompt: "The month-close packet stitches card-rail and wire-rail settlement folds into one result set. Which operator guarantees every leg survives?",
      choices: [
        "UNION — dedupe makes the packet clean",
        "UNION ALL — no dedupe, every row is evidence",
        "INTERSECT — only legs present in both rails",
        "JOIN ON rail — one row per rail pair",
      ],
      answer: 1,
      why: "UNION ALL appends without dedupe. Five invoice cycles here settle on BOTH card and wire — identical rows across rails are legitimate evidence, and bare UNION would silently collapse them, under-counting the close.",
      notes: [
        { choice: 0, why: "UNION's dedupe is a bug in an evidence bag: it removes exactly the split-settlement legs the reconciliation exists to catch." },
        { choice: 2, why: "INTERSECT returns rows present in BOTH sets — for two disjoint rails that's an empty packet." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-15",
      prompt: "In the seller ladder (gmv folded per seller), which column computes each seller's share of platform GMV?",
      choices: [
        "100.0 * gmv / SUM(gmv) OVER ()",
        "100.0 * gmv / MAX(gmv) OVER ()",
        "gmv / COUNT(*)",
        "AVG(gmv) OVER () / gmv",
      ],
      answer: 0,
      why: "The share denominator is the platform total — SUM(gmv) OVER () folds every row's gmv onto each seller in one pass. Six sellers fold to 34833.28, and the shares sum to 100.",
      notes: [
        { choice: 1, why: "That's share-of-the-LEADER — Nordic's 32% would print as 100 and every share would be inflated. Denominator is the total, not the max." },
        { choice: 2, why: "COUNT(*) is the seller count (6) — gmv/6 is a nonsense unit. The fan-out-era reflex of dividing by row count dies here." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-16",
      prompt: "The commerce deck wants sellers ranked 6 through 10 by GMV. Which clause pages them out of the full ladder?",
      choices: [
        "ORDER BY gmv DESC LIMIT 5 OFFSET 5",
        "ORDER BY gmv DESC LIMIT 5, 10",
        "ORDER BY gmv DESC OFFSET 5 LIMIT 5",
        "ORDER BY gmv DESC LIMIT 10 OFFSET 6",
      ],
      answer: 0,
      why: "OFFSET 5 skips the top five rungs, LIMIT 5 takes the next five — ranks 6-10 exactly. The page is a window into a deterministic sort, so the tie-break rule matters as much as the clause.",
      notes: [
        { choice: 1, why: "SQLite's comma form is LIMIT offset, count — '5, 10' skips 5 and returns TEN rows: ranks 6-15. A page-and-a-half of the deck." },
        { choice: 3, why: "LIMIT 10 OFFSET 6 skips six and takes ten — ranks 7-16, off by one at both ends." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-17",
      prompt: "The packet pairs SELECT rail, cents FROM card_legs with UNION ALL SELECT method, amount FROM wire_legs. A reviewer flags the second SELECT's column names. What actually breaks?",
      choices: [
        "The names must match or the union errors",
        "Nothing — set ops align by column POSITION; output names come from the first SELECT",
        "The second SELECT's names overwrite the first's",
        "Both name sets appear, doubling the columns",
      ],
      answer: 1,
      why: "UNION/UNION ALL/EXCEPT/INTERSECT pair columns positionally and ignore names — the packet's headers come from the first SELECT. Renaming the second leg changes nothing; REORDERING its columns would merge rails into amounts silently.",
      notes: [
        { choice: 0, why: "That's the instinct from joins — but set ops never look at names. The real hazard is the one nobody flags: column ORDER." },
        { choice: 2, why: "Names of later legs are discarded entirely. If the reviewer's rename came with a column swap, THAT would be the bug worth flagging." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-18",
      prompt: "The unpaid-invoice report — WHERE id NOT IN (SELECT invoice_id FROM payments) — ships EMPTY one morning after an ETL job lands one row with a NULL invoice_id. Why?",
      choices: [
        "NOT IN ignores NULL rows, so the report loses one invoice only",
        "The join dropped all rows — NOT IN is an inner join in disguise",
        "One NULL in the list makes every NOT IN comparison UNKNOWN — the whole report returns zero rows",
        "The subquery now returns duplicates and SQLite errors",
      ],
      answer: 2,
      why: "x NOT IN (1, 2, NULL) can never be TRUE — three-valued logic turns the whole predicate UNKNOWN for every row, and the 6 unpaid invoices worth 15,217.00 vanish silently. NOT EXISTS or LEFT JOIN … IS NULL are the NULL-safe shapes.",
      notes: [
        { choice: 0, why: "Wishful thinking — one NULL poisons the ENTIRE list, not its own row. The empty dunning report is the classic production incident." },
        { choice: 3, why: "SQLite doesn't error; it happily returns the empty set. Silent emptiness is worse than an error — nobody is paged." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-19",
      prompt: "The WoW delta column — ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) — is NULL on the first month. What is the defensible handling?",
      choices: [
        "COALESCE(delta, 0) so charts never show gaps",
        "COALESCE(LAG(revenue), revenue) before subtracting so the first delta reads 0",
        "Leave the NULL and label the first row '—' — there is no prior month to subtract",
        "Filter WHERE delta IS NOT NULL inside the same SELECT",
      ],
      answer: 2,
      why: "The first row has no prior month — NULL is the honest value. Display it as a dash via CASE; if a chart truly needs a number, wrap the ranked query in a derived table and drop the first row there, explicitly.",
      notes: [
        { choice: 0, why: "Zero means 'flat month'. A fabricated flat opening month reads as data — underwriting models eat the difference." },
        { choice: 3, why: "Windows evaluate after WHERE — the filter can't see delta in the same SELECT. It needs the wrap-around query, at which point dropping the row explicitly is cleaner." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-20",
      prompt: "WHERE RANK() OVER (ORDER BY gmv DESC) <= 3 throws a syntax error. What is the fix?",
      choices: [
        "Move the condition into HAVING",
        "Wrap the ranked query in a derived table or CTE and filter the rank outside",
        "Add the window to GROUP BY first",
        "QUALIFY RANK() OVER (...) <= 3 — standard in every SQLite build",
      ],
      answer: 1,
      why: "Window functions evaluate at SELECT time — WHERE runs before they exist. Rank in an inner SELECT, filter WHERE rank <= 3 in the outer one; the staged shape is also how top-N-per-group reads compose.",
      notes: [
        { choice: 0, why: "HAVING is still before SELECT — the window doesn't exist there either. Same error, one clause later." },
        { choice: 3, why: "QUALIFY is real (Snowflake, DuckDB, newer dialects) but not portable SQLite — knowing your engine is part of the answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-21",
      prompt: "The EOD stitched summary — GROUP_CONCAT(p.name) per transaction — returns items in a different order on every run. The fix?",
      choices: [
        "Add DISTINCT: GROUP_CONCAT(DISTINCT p.name) sorts them",
        "Set the separator: GROUP_CONCAT(p.name, ', ') defines the order",
        "Order inside the aggregate: GROUP_CONCAT(p.name, ', ' ORDER BY p.name) (or an ordered subquery on older SQLite)",
        "Wrap it in UPPER() — case normalization fixes ordering",
      ],
      answer: 2,
      why: "GROUP_CONCAT's default order is unspecified — only an ORDER BY inside the aggregate (SQLite 3.44+) or a pre-sorted subquery makes the cell deterministic. The separator argument changes the glue, never the sequence.",
      notes: [
        { choice: 0, why: "DISTINCT dedupes but does not sort. Deterministic-looking output from DISTINCT is coincidence, not a contract." },
        { choice: 3, why: "UPPER changes case, not sequence. The cell will shuffle again tomorrow — nondeterminism is a spec problem, not a formatting one." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-22",
      prompt: "A colleague writes SELECT (SELECT customer_id FROM orders) AS x — a scalar subquery over 103 rows. What does SQLite do?",
      choices: [
        "Errors: 'subquery returned more than one row'",
        "Returns NULL — scalar subqueries must return exactly one row",
        "Silently returns the FIRST row's value and moves on",
        "Concatenates all 103 values into one cell",
      ],
      answer: 2,
      why: "SQLite is lenient where Postgres and MySQL error: a multi-row scalar subquery quietly yields the first row. Verified on this db — the query runs and prints one customer id. The safe shapes are a fold (MAX/MIN) or LIMIT 1 with a deliberate ORDER BY.",
      notes: [
        { choice: 0, why: "That's the OTHER databases' behavior — the portability trap. Code that 'works' locally can move to a stricter engine and explode, or worse, keep working wrong here." },
        { choice: 2, why: "Exactly the danger: it looks fine in every code review because it never errors. An undocumented arbitrary row is a bug wearing a result." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-23",
      prompt: "Which expression counts cancelled transactions over orders?",
      choices: [
        "COUNT(status = 'cancelled')",
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)",
        "COUNT(status)",
        "SUM(status = 'cancelled')",
      ],
      answer: 1,
      why: "The conditional-SUM shape: 1 for cancelled, 0 otherwise, folded — reads 7. COUNT(status = 'cancelled') counts the BOOLEAN results, which are non-NULL for all 103 rows, so it equals COUNT(*) and reports zero cancellations forever.",
      notes: [
        { choice: 0, why: "The classic. COUNT counts non-NULLs and 'false' is not NULL — verified: 103. The mechanism to remember is NULL-skipping, not counting." },
        { choice: 3, why: "SUM over booleans works here (true folds as 1) but returns NULL on an all-false group unless wrapped in COALESCE — the CASE shape states the intent and the zero explicitly." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-24",
      prompt: "The coverage census classifies each statement exact / partial / none against its payment legs. Where does the classification live?",
      choices: [
        "WHERE SUM(p.amount_cents) = i.amount_cents, before grouping",
        "In the JOIN's ON clause, comparing legs to statements row by row",
        "After a LEFT JOIN + GROUP BY: CASE over the folded SUM(p.amount_cents) vs i.amount_cents",
        "A correlated subquery per payment row, classified before folding",
      ],
      answer: 2,
      why: "Coverage is a property of the FOLDED legs per statement: LEFT JOIN keeps the 6 no-leg statements (15,217.00), GROUP BY folds, then CASE compares folded sum to amount — reading 21 exact, 1 partial (4,000.00 of 6,148.00), 6 none.",
      notes: [
        { choice: 0, why: "Aggregates don't exist before GROUP BY — and even as HAVING it would drop the 'none' bucket, the census's whole point." },
        { choice: 3, why: "Per-row classification mislabels the 5 split statements that settle on both rails — a leg-level verdict on a statement-level question." },
      ],
      difficulty: "medium",
    },
    {
      id: "block-mcq-25",
      prompt: "One scan must count paid, open and void statements side by side. Which shape is SQLite-native?",
      choices: [
        "Three scalar subqueries, one per status",
        "COUNT(*) FILTER (WHERE status = 'paid') next to its siblings",
        "A UNION of three single-status counts",
        "It cannot be done in one pass",
      ],
      answer: 1,
      why: "FILTER (WHERE …) counts conditionally inside one aggregate pass — COUNT(*) FILTER (WHERE status = 'pending') reads 14 over the 103 tickets. The one-scan census is the status fold in its clearest grammar.",
      notes: [
        { choice: 0, why: "Three subqueries re-scan the table three times — correct output, triple the work, and it stops scaling the day the table does." },
        { choice: 2, why: "A UNION stacks ROWS (one row per status), not columns. Different shape entirely — the reviewer asked for a side-by-side census." },
      ],
      difficulty: "easy",
    },
    {
      id: "block-mcq-26",
      prompt: "A running total uses SUM(v) OVER (ORDER BY ts) and two events share a timestamp. What does the default frame do?",
      choices: [
        "Folds strictly row by row — each tie gets its own increment",
        "Folds all peers together — both tied rows receive the cumulative value including the whole tie group",
        "Errors on duplicate ORDER BY values",
        "Skips the tied rows entirely",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE treats peers as one fold — verified: two tied rows both read the cumulative value including each other. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the strict row-by-row frame.",
      notes: [
        { choice: 0, why: "That's ROWS semantics. The RANGE default is why cumulative charts show plateau-then-jump steps on same-second register events." },
        { choice: 2, why: "Duplicate ORDER BY keys are perfectly legal — they define PEERS, not errors. The frame decides whether peers fold together." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-27",
      prompt: "shipped_at - created_at (both TEXT) returns 0 for every one of the 82 shipped orders. Why, and what is the correct latency read?",
      choices: [
        "The columns are identical strings, so subtraction is legitimately 0",
        "TEXT minus TEXT coerces to numbers whose leading digits cancel — use JULIANDAY(shipped_at) - JULIANDAY(created_at), which averages 2.98 days",
        "SQLite cannot subtract TEXT at all — cast to INTEGER first",
        "The 0 is correct; latency must come from a separate audit table",
      ],
      answer: 1,
      why: "ISO strings coerce to numerics whose overlapping leading digits cancel — a silent zero that flattens every latency chart. JULIANDAY converts each stamp to a real number of days; the 2.98 average (range 2-4) only exists after conversion.",
      notes: [
        { choice: 0, why: "'2024-01-04' minus '2024-01-01' coerces to 20240104 - 20240101 = 3, not 0 — and datetime stamps cancel differently. Either way TEXT arithmetic is never latency." },
        { choice: 2, why: "Casting '2024-01-04' to INTEGER yields 2024 — year-grain noise. The conversion that preserves time is JULIANDAY (or STRFTIME('%s') for seconds)." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-28",
      prompt: "A latency ladder ORDER BY julianday(shipped_at) - julianday(created_at) ASC leads with which rows — and why is that a lie?",
      choices: [
        "The slowest delivered orders — correct behavior",
        "The 21 NULL-stamped tickets (pending and cancelled) — NULLs sort first in ASC, and they have no latency at all",
        "The fastest orders — correct behavior",
        "It errors — you cannot ORDER BY an expression containing NULLs",
      ],
      answer: 1,
      why: "SQLite treats NULL as smallest, so every unstamped ticket — 14 pending, 7 cancelled — lines up ahead of all real latencies. The ladder's top rows are tickets that never shipped, wearing rank 1. Filter WHERE shipped_at IS NOT NULL or add NULLS LAST.",
      notes: [
        { choice: 0, why: "The slowest REAL latency is 4 days — but the query never gets there: 21 NULLs outrank everything in ASC order." },
        { choice: 3, why: "NULLs order fine — silently, first. The lack of an error is exactly what lets the lie ship." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-29",
      prompt: "Which shape returns settlement legs whose (statement, amount) pair matches NO statement row — legs without statements?",
      choices: [
        "SELECT invoice_id, amount_cents FROM payments INTERSECT SELECT id, amount_cents FROM invoices",
        "SELECT invoice_id, amount_cents FROM payments EXCEPT SELECT id, amount_cents FROM invoices",
        "WHERE invoice_id NOT IN (SELECT id FROM invoices) alone, on amount too",
        "INNER JOIN payments to invoices ON amount_cents",
      ],
      answer: 1,
      why: "EXCEPT returns rows of the first set with no match in the second, comparing positionally and NULL-safely — the set-op anti-join. Column count and ORDER must align on both sides or the comparison silently mispairs.",
      notes: [
        { choice: 0, why: "INTERSECT returns the MATCHING legs — the opposite population. Adjacent keywords, opposite questions." },
        { choice: 2, why: "NOT IN on ids alone finds legs whose statement id is absent, but ignores amount mismatches — a partial-payment leg on a valid statement slips through." },
      ],
      difficulty: "hard",
    },
    {
      id: "block-mcq-30",
      prompt: "A per-seller running revenue chart uses SUM(gmv) OVER (ORDER BY month) over the seller-month fold. What is wrong for a per-seller chart?",
      choices: [
        "Nothing — the chart is correct",
        "The frame needs ROWS to be deterministic",
        "Missing PARTITION BY seller — the running total never resets, leaking across sellers",
        "ORDER BY month must be DESC for running totals",
      ],
      answer: 2,
      why: "Without PARTITION BY seller the window is one partition over all sellers: each seller's line starts at the previous seller's running value and the last seller's final point equals platform GMV — the telltale that the fold leaked. PARTITION BY seller resets the frame per seller.",
      notes: [
        { choice: 0, why: "The magnitudes look plausible, which is why this ships. The sum-back check — per-seller finals should equal per-seller GMV, not platform total — catches it." },
        { choice: 1, why: "ROWS vs RANGE matters for ties, not for cross-group leakage. Wrong diagnosis, real bug still standing." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-block-1",
      tier: "easy",
      topic: "l8",
      universe: "expense",
      title: "The operating-spend census",
      brief:
        "Block books brief on the storefront db: the seller's books close on the operating-spend census — where the money goes, by category, with the small categories gated by a minimum-volume rule so the memo stays readable. The units rule is explicit: expenses.amount_cents is INTEGER cents, so the dollar read is the fold divided by 100.0 — never an integer division. Probed facts: 36 expense rows across four categories — Rent 14 entries totalling 16800 cents ($168.00), Ads 14 entries totalling 4570 cents ($45.70), Travel 3 entries totalling 2521 cents ($25.21), Tools 5 entries totalling 1525 cents ($15.25). The gate is fixed at 5 entries: Travel's 3-entry book is real spend but below the memo's readability bar, and the census must say so by exclusion, not by silence.",
      ask: "Return categories with at least 5 entries: category, entry count and dollar total (2 decimals), biggest spend first.",
      template:
        "SELECT category,\n       {1}(*) AS entries,\n       ROUND({2}(amount_cents) / 100.0, 2) AS dollars\nFROM expenses\nGROUP BY category\nHAVING COUNT(*) >= {3}\nORDER BY dollars {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the entry counter",
          why: "COUNT(*) counts rows per category — 14, 14, 5 after the gate, matching the probe. SUM(*) does not exist and AVG(*) is a syntax error: only COUNT takes the star to count rows.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the cents fold",
          why: "SUM(amount_cents) folds each category's cents — 16800, 4570, 1525 — and the /100.0 prints real dollars (168.00, 45.70, 15.25). COUNT would divide a row count by 100 and print 0.14: cents-shaped noise.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the memo gate",
          noVerify: true,
          why: "The gate is fixed at 5 entries: Rent, Ads and Tools qualify; Travel's 3-entry book drops by rule. The gate value is a business decision the memo must be able to quote — which is why it lives in the query, not in a footnote.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The close reads biggest spend first: Rent 168.00, Ads 45.70, Tools 15.25. ASC would open the memo with the smallest line — a correct query leading with the least important book.",
        },
      ],
      distractors: ["AVG", "MAX", "3", "ASC"],
      walkthrough:
        "A books census with a gate and a units rule. GROUP BY category folds 36 expense rows into four books; COUNT(*) counts entries per book (14 rent, 14 ads, 3 travel, 5 tools) and HAVING COUNT(*) >= 5 enforces the memo's readability rule — Travel's 3-entry book is excluded by rule, visibly, not by accident. SUM(amount_cents) folds the cents (16800, 4570, 1525) and the single /100.0 converts to dollars exactly once at the display edge: 168.00, 45.70, 15.25 — the probe's figures with odd cents intact. MAX in the fold slot would print each category's largest single expense (rent's biggest month, not rent's book), and AVG would print the per-entry mean — both plausible numbers that answer nobody's question. The gate value 3 would read Travel back in, doubling the memo's length for a 25.21 book. ORDER BY dollars DESC leads with the rent story the close exists to tell. The habit being graded: cents stay integer until one conversion, and every exclusion is a stated rule with a number attached.",
    },
    {
      id: "cs-block-2",
      tier: "medium",
      topic: "j3",
      universe: "growth",
      title: "The GMV-per-seller rollup",
      brief:
        "Block commerce-review brief on the storefront db: the platform's sellers are the supply side — each seller owns a catalog of listings, each listing rings up as line items — and the review opens with GMV per seller: revenue folded at the line grain across the three-table chain seller → catalog → line items. Probed facts: six sellers, 251 line items, platform GMV 34833.28 — Nordic Gadgets AB 11130.25 across 3 listings, Midwest Hardware Co 9294.93 across 3, Alpine Audio GmbH 4765.63 across 2, Andes Naturals SA 3613.25 across 2, Shenzhen Electro 3049.07 across 3, Pacific Textiles 2980.15 across 3. The grain rule: revenue folds from line items (unit_price × quantity), listings count as COUNT(DISTINCT product), and the per-seller folds must sum back to the platform total — they do.",
      ask: "Return each seller with listing count (DISTINCT) and GMV in dollars (2 decimals), biggest GMV first.",
      template:
        "SELECT s.name,\n       {1}(DISTINCT p.id) AS listings,\n       ROUND({2}(oi.unit_price * oi.quantity), 2) AS gmv\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.id\nORDER BY gmv {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the listing counter",
          why: "COUNT(DISTINCT p.id) counts listings per seller — 3, 3, 2, 2, 3, 3, matching the probe. SUM would add up listing ids (Nordic's three listings sum to 23): a number with no meaning on any commerce deck.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the revenue fold",
          why: "SUM over unit_price × quantity folds each line's economics into the seller's GMV — 11130.25 at the top, and the six folds sum to the platform's 34833.28. COUNT would return line counts where dollars were asked.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review leads with the GMV leader: Nordic 11130.25 down to Pacific 2980.15. ASC would open the deck with the smallest seller — a correct query aimed at the wrong end of the ranking.",
        },
      ],
      distractors: ["AVG", "MAX", "MIN", "ASC"],
      walkthrough:
        "The three-table chain is the whole test. seller → catalog → line items fans out at the second hop — one listing appears in many line items, so after the join one row is one LINE; the fold must respect that grain or the read doubles. COUNT(DISTINCT p.id) cuts through the fan-out to count listings (3/3/2/2/3/3 — the probe's supply-side column), and SUM(unit_price × quantity) folds each line's economics into GMV: 11130.25, 9294.93, 4765.63, 3613.25, 3049.07, 2980.15 — the probe's seller revenue exactly, summing to the platform's 34833.28. The classic corruption is joining orders and summing orders.total per line: every multi-line transaction's total multiplied by its line count, GMV inflating silently — the sum-back-to-total check is what catches it. AVG would print the mean line value per seller — a merchandising stat, not GMV — and MIN the cheapest line. GROUP BY s.id with s.name along for the ride keeps the fold per seller. The habit being graded: name the grain after every hop — seller, listing, line — and let the aggregates say which one they are counting.",
    },
    {
      id: "cs-block-3",
      tier: "medium",
      topic: "t6",
      universe: "catalog",
      title: "The region × category concentration grid",
      brief:
        "Block commerce-review brief on the storefront db: the platform reads concentration per market — for each region×category cell, revenue folded at the line grain and that cell's share of its REGION's revenue. Probed facts: the grid is 23 cells; the leaders are APAC Audio 5162.4 (44.5% of its region), EU Audio 5102.4 (33.8%), EU Wearables 3886.3 (25.8%), and the tail is LATAM Accessories 26.03 (3.1%) — LATAM's whole book is three cells, Electronics 468.9, Audio 357.51 and that one Accessories sliver. The share denominator is the REGION fold, computed as SUM(SUM(...)) OVER (PARTITION BY region) — a window over the folded aggregate — and shares render at one decimal. The review reads the top of the grid, biggest revenue cell first.",
      ask: "Return the top 12 region × category cells: region, category, revenue (2 decimals) and share of the cell's region (1 decimal), biggest revenue first.",
      template:
        "SELECT c.region,\n       p.category,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue,\n       ROUND({1} * SUM(oi.unit_price * oi.quantity) / SUM(SUM(oi.unit_price * oi.quantity)) OVER ({2} BY c.region), 1) AS pct_of_region\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nGROUP BY c.region, p.category\nORDER BY revenue {3}\nLIMIT {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent scaler",
          why: "A share is the cell's fold times 100 over the region fold — the .0 matters in principle because INTEGER division truncates (here the fold is REAL so bare 100 survives by luck, but the scaler belongs in the query with its decimal). 1000 would rescale the grid to per-mille shares: 445 instead of 44.5.",
        },
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the per-region window shim",
          why: "SUM(SUM(...)) OVER (PARTITION BY c.region) makes the denominator each region's own total — APAC shares sum to 100 within APAC. ORDER BY instead runs a CUMULATIVE denominator down the grid (EU Audio's share becomes 19.1), and GROUP is not window grammar: syntax error.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-cell-first direction",
          why: "The review leads with the heaviest cell: APAC Audio 5162.4 down through the 23-cell grid. ASC would open the deck on LATAM Accessories 26.03 — a correct query aimed at the wrong end of the concentration story.",
        },
        {
          answer: "12",
          kind: "number",
          noVerify: true,
          label: "the top-cell cut",
          why: "The deck reads the top 12 of 23 cells — every region's heavy hitters plus the mid tail (EU Accessories 1108.03 closes the cut). The cut is a presentation decision the memo must be able to quote; 15 would drag in APAC Apparel 755.8 and dilute the lead.",
        },
      ],
      distractors: ["1000", "15", "GROUP", "ORDER", "ASC"],
      walkthrough:
        "A window over a fold — the shape that makes per-group shares possible after GROUP BY. The four-table chain fans out at every hop, so one row is one LINE; GROUP BY region, category folds 251 lines into 23 cells, and ROUND(SUM(unit_price × quantity), 2) is each cell's revenue: 5162.4, 5102.4, 3886.3, 2260.79, 1885.98, 1855.02 — the probe's leaders in order. The share line is the test: SUM(SUM(...)) OVER (PARTITION BY c.region) re-folds the folded per region, so APAC Audio's 5162.4 reads 44.5 against APAC's 11595.49 — 100.0 * cell / region at one decimal, and the shares inside each region sum to 100. PARTITION is what scopes the denominator; the ORDER distractor turns it into a running cumulative denominator (EU Audio reads 19.1, mid-fold nonsense that still executes), and GROUP is a syntax error. LIMIT 12 keeps the deck's cut; 15 dilutes it with APAC Apparel. 1000 rescales every share tenfold. The habit being graded: a window over an aggregate is legal and precise — declare the partition, and the shares reconcile to 100 per region.",
    },
    {
      id: "cs-block-4",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The register status census",
      brief:
        "Block seller-health brief on the storefront db: the register funnel opens with a status census — every transaction banded into fulfilled (delivered plus shipped), open (pending) or cancelled, with each bucket's share of the 103 tickets. Probed facts: delivered 52 (50.5% of placed), shipped 30 (29.1%), pending 14 (13.6%), cancelled 7 (6.8%) — so the bands read 82 fulfilled (79.6% of the book), 14 open, 7 cancelled. One scan, one CASE, and the share denominator is the whole book computed as a fold over the same pass — no second query, no subquery.",
      ask: "Return each status bucket with ticket count and share of all 103 tickets (1 decimal), biggest bucket first.",
      template:
        "SELECT CASE\n         WHEN status {1} ('delivered', 'shipped') THEN 'fulfilled'\n         WHEN status = 'pending' THEN 'open'\n         ELSE 'cancelled'\n       END AS bucket,\n       {2}(*) AS tickets,\n       ROUND({3} * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share\nFROM orders\nGROUP BY {4}\nORDER BY tickets DESC;",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the band membership test",
          why: "status IN ('delivered', 'shipped') folds two statuses into one arm — the fulfilled band. LIKE against a list is not SQL ('row value misused'), and the two-status arm is what makes the census three buckets instead of four.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the ticket counter",
          why: "COUNT(*) counts tickets per bucket: 82, 14, 7 — matching the probe. SUM(*) does not exist, and the counter must take the star: this is a row census, not a value fold.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent scaler",
          why: "Share = bucket count × 100.0 over the book fold (SUM(COUNT(*)) OVER () = 103): 79.6, 13.6, 6.8. The .0 is real here — bare 100 leaves INTEGER × INTEGER over 103, and integer division shaves the census to 79, 13, 6.",
        },
        {
          answer: "bucket",
          kind: "keyword",
          label: "the census group",
          why: "GROUP BY bucket folds by the CASE band, not the raw status — three rows where GROUP BY status gives four (delivered and shipped split). SQLite resolves the alias; the band is the grain the memo reports.",
        },
      ],
      distractors: ["LIKE", "SUM", "status", "100"],
      walkthrough:
        "One scan, one CASE, one fold. The CASE maps four raw statuses onto three business buckets — IN ('delivered', 'shipped') makes fulfilled one arm, pending is open, and the ELSE arm catches cancelled, which is why the census can never leak an unexplained band. COUNT(*) counts tickets per bucket: 82, 14, 7 — the probe's numbers exactly, 52 + 30 folded into 82. The share column is a window over the fold: SUM(COUNT(*)) OVER () stamps the book total 103 onto every row, so 100.0 × 82 / 103 reads 79.6 — and the scaler needs its .0, because bare 100 computes 8200 / 103 in INTEGER math and prints 79, 13, 6. GROUP BY bucket is the band grain; GROUP BY status would ship four rows and split the fulfilled book the stakeholder asked to see joined. LIKE in the arm slot, SUM in the counter slot, and status in the scaler slot each fail to parse in place — a census that runs and reads 79.6 everywhere is the only fill that survives every slot.",
    },
    {
      id: "cs-block-5",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The month-over-month revenue spine",
      brief:
        "Block month-close brief on the storefront db: the close opens with the 14-month revenue spine — monthly folds of register value, each month hung beside its delta against the month before. Probed facts: 2024-01 opens at 3731.97, 2024-02 dips to 3609.64 (a -122.33 month), July is the year's trough at 1193.86, August rebounds to 2352.07 (+1158.21), and November slides hardest, 1648.8 against October's 2975.67 (-1326.87). The spine is staged: one CTE folds the month buckets off the transaction timestamps, the outer read computes the delta with LAG over the calendar order, and the first month's delta is NULL by design — *there is no prior month to subtract*.",
      ask: "Return each month with revenue (2 decimals) and its delta vs the prior month (2 decimals), calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, {2}, 7) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       revenue,\n       ROUND(revenue - {1}(revenue) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month fetch",
          why: "LAG(revenue) OVER (ORDER BY month) carries each month's predecessor beside it, so the subtraction is the delta. LEAD fetches the FOLLOWER — the whole trend flips sign — and AVG(revenue) OVER (ORDER BY month) builds a running mean whose 'deltas' are drift against an average, not month-over-month change.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the month-spine cursor",
          why: "SUBSTR(created_at, 1, 7) takes seven characters from the first: 'YYYY-MM', the month spine. From position 2 the slice is '024-01' — fourteen buckets with corrupt names — and the spine must start at the first character of the ISO stamp.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the calendar order",
          why: "ORDER BY month keeps the spine in calendar order — 2024-01 first, the opening delta honestly NULL. Ordering by delta puts the NULL first (SQLite sorts NULLs first ASC) and by revenue scrambles the calendar entirely: a trend column in a non-trend order.",
        },
      ],
      distractors: ["LEAD", "AVG", "2", "delta", "revenue"],
      walkthrough:
        "Two stages, then a window. Stage one folds the spine: SUBSTR(created_at, 1, 7) buckets 103 transactions into 14 months, SUM(total) folds each — 3731.97, 3609.64, 2617.08, … 2390.53 — the probe's monthly trend verbatim. Stage two hangs the delta: LAG(revenue) OVER (ORDER BY month) fetches the predecessor and revenue − LAG rounds to -122.33 for February, +1158.21 for the August rebound, -1326.87 for the November slide — the close's trend column. The traps grade the staging: LEAD flips every sign (a trough that reads as a peak); AVG(revenue) OVER (ORDER BY month) computes a running mean, so its output is drift against an average — plausible magnitudes, wrong question; the cursor 2 slices '024-01' and renames every month; ORDER BY delta puts the honest NULL at the top of a SQLite ASC sort, and ORDER BY revenue trades the calendar for a value ladder. The first row's NULL is the feature: it says 'no prior month' instead of fabricating a flat opening. The habit being graded: stage the fold, then window the stage — and let the window's ORDER BY be the calendar.",
    },
    {
      id: "cs-block-6",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The premium-shelf census",
      brief:
        "Block pricing brief on the storefront db: merchandising wants the premium-shelf census — listings priced above the catalog's own average, each stamped with that average for context. Probed facts: the catalog averages 71.78 across 16 listings, and exactly six clear the bar — Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119, Mechanical Keyboard K1 89.99, Fitness Band X2 79. Band context: the mid band (50-200) holds 8 listings averaging 111.5 and the budget band 8 averaging 32.06 — there is no premium band above 200, the ladder tops out at 199.99. The average is computed once in a scalar subquery and reused as both the filter threshold and a display column.",
      ask: "Return each listing priced above the catalog average: name, category, price and the 71.78 average, priciest first.",
      template:
        "SELECT p.name,\n       p.category,\n       p.price,\n       ROUND((SELECT AVG(price) FROM products), 2) AS catalog_avg\nFROM products p\nWHERE p.price {1} (SELECT {2}(price) FROM products)\nORDER BY p.price {3};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-bar test",
          why: "The shelf is priced ABOVE the catalog average: p.price > (SELECT AVG(price) ...) keeps exactly the six premium listings. '=' matches nothing (no listing sits exactly on 71.776875), '<' returns the ten below the bar, and each wrong operator answers a different merchandising question.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the catalog mean",
          why: "AVG(price) over all 16 listings is the bar: 71.78 rounded for display. MIN (14.99) lets fifteen listings through, COUNT(price) is a row count (16) used as a price threshold, and SUM (1148.43) empties the shelf — three plausible aggregates, three wrong censuses.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-first direction",
          why: "The pricing review opens at the top of the shelf: Smart Watch S 199.99 down to Fitness Band X2 79. ASC would open the deck on the cheapest premium listing — a correct census aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["MIN", "COUNT", "SUM", "<", "=", "ASC"],
      walkthrough:
        "A scalar subquery used twice, computed once. The inner fold SELECT AVG(price) FROM products reads 71.776875 — the whole catalog's bar — and the outer query keeps every listing that clears it: exactly six rows, 199.99 down to 79, with ROUND(..., 2) stamping 71.78 beside each as context. The distractors map the failure space of the threshold: MIN returns 14.99 and the census admits fifteen listings; COUNT(price) is 16 — a row count masquerading as a price — and fifteen clear it too; SUM returns 1148.43 and the shelf goes empty; '=' returns nothing because no listing sits exactly on the mean; '<' answers the budget question instead. Each is a real query with a real result — none is the premium shelf. The scalar shape is honest here because the inner fold is contractually one row over one table; the moment the bar becomes per-category, the scalar re-runs per row and the derived-table or window shape takes over. The habit being graded: name what the threshold computes, then check the census against a known count — six is the number the review can quote.",
    },
  ],

  problems: [
    { slug: "chargeback-rate-ranking", why: "Tagged for Block in the registry pool. Dispute rate per seller with a volume gate and a ranking — the risk ladder Square's seller-quality review runs, denominator honesty included." },
    { slug: "product-sales-analysis-ii", why: "Per-listing totals from line items — the SKU census behind every merchandising call on the register." },
    { slug: "group-sold-products-by-the-date", why: "The daily register fold with items stitched into one cell — the end-of-day summary Square's seller dashboard prints by default." },
    { slug: "basket-depth-aov", why: "Basket depth and average order value in one fold — the merchant's favorite pair, computed at two grains without dividing per row." },
    { slug: "sales-analysis-iii", why: "Per-listing totals split by period — the before/after read a seller runs after changing price or placement." },
    { slug: "product-sales-analysis-iv", why: "Most popular item per buyer — the recommendation-engine seed query, argmax discipline with ties to break." },
    { slug: "repeat-purchase-rate", why: "Share of buyers with 2+ transactions — the retention signal Square surfaces to sellers, computed as an honest conditional count." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary tiles — the seller CRM segmentation Square's marketing tools ship, NTILE-band grammar included." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the books-integrity proof (181080 vs 181080 here) that gates every close." },
    { slug: "bank-account-summary-ii", why: "Settlement account rollup — money in, money out, net per account, cents handled honestly end to end." },
    { slug: "total-traveled-distance", why: "Conditional SUM over a flag — the settled-vs-open value split, the same CASE-SUM muscle the books census uses." },
    { slug: "ar-aging-schedule", why: "AR aging buckets — the billing book's overdue spine (30/60/90+), the closest read this band has to Square's invoice-chasing workflows." },
    { slug: "find-customers-with-positive-revenue-this-year", why: "HAVING-gated positive books — which sellers cleared a revenue bar this year: the underwriting funnel's first filter." },
    { slug: "balance-rollforward", why: "Beginning balance plus movements equals ending balance — the rollforward discipline that makes a seller's books auditable." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a failure count alongside — the seller's monthly statement shape, status-aware to the last row." },
    { slug: "warehouse-manager", why: "Catalog-to-sales mapping per location — which listings sit where and what moved: the inventory-vs-register join in its simplest form." },
    { slug: "average-selling-price", why: "ASP per listing window — the pricing read behind Square's seller analytics: revenue over units across a priced window, denominator named before the number ships." },
    { slug: "product-price-at-a-given-date", why: "The as-of price lookup — what a listing cost on the day a dispute claims it sold; the receipt-reconstruction read Block's chargeback desk runs." },
    { slug: "maximum-transaction-each-day", why: "Peak ticket per day — the register's daily high-water mark the seller dashboard prints; window argmax with ties that must break deterministically." },
    { slug: "sales-by-day-of-the-week", why: "Day-of-week pivot — the daypart read that drives Square's staffing and promotion nudges; CASE-as-columns grammar over the register stream." },
    { slug: "number-of-rich-customers", why: "Big-ticket buyer census — baskets above a value bar; the premium-tier read whose count lives at the buyer grain, not the order grain." },
    { slug: "bank-account-summary", why: "Per-account settlement legs — deposits, withdrawals, net per rail; the cents-honest fold every money column in this kit lives on." },
    { slug: "card-launch-success", why: "Card launch funnel — activation share of issued cards; the Cash App Card growth read as a gated ratio, denominator stated." },
    { slug: "same-day-sale", why: "Same-day resale — buy and sell inside one window; the velocity shape Block's risk team flags on card-present streams." },
    { slug: "active-businesses", why: "Sellers active across dimensions — the multi-segment activity census behind 'how many sellers actually sold this month'." },
    { slug: "find-churn-risk-customers", why: "No-activity-in-window flags — the dormant-seller reactivation list Square's retention campaigns run on." },
    { slug: "customer-order-frequency", why: "Order-cadence HAVING gate — buyers above a frequency bar in a window; the cohort-sizing reflex behind seller CRM." },
    { slug: "list-the-products-ordered-in-a-period", why: "Catalog sold in a window — the period supply read merchandising opens with, volume-gated in HAVING." },
    { slug: "sales-analysis-ii", why: "Sold-vs-never-sold join census — the catalog hygiene LEFT JOIN, sibling to this kit's idle-listing anti-join." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly distinct orders vs buyers — the two-denominator month spine; COUNT(DISTINCT) discipline at month grain." },
    { slug: "suspicious-bank-account-transactions", why: "Consecutive-transaction scan — the LAG-over-window velocity flag Block's fraud screens run on payment streams." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "Eligibility census at the right grain — COUNT(DISTINCT) over a fan-out; the discount-eligible buyer read." },
  ],
};
