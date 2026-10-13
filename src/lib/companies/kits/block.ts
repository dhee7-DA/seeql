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
    "Preparation strategy: the registry tags one problem for Block (`chargeback-rate-ranking`) — start there, because {rose:dispute-rate} math is the platform's risk spine. The rest of the pool is theme-curated from the SQL band toward the seller workflows: register folds, basket and AOV math, catalog joins, seller anti-joins, ranking ladders, and cents-safe bookkeeping reads. Then run both case studies on the live storefront db: one rebuilds the **operating-spend census** the seller's books close on, the other rebuilds the **GMV-per-seller rollup** the platform's commerce review opens with.",
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
  ],

  topics: [
    {
      name: "The register fold",
      why: "A day of commerce is a fold: line items grouped by transaction date, stitched or summed, per seller or per store. Square screens open here because the fold is where grain dies — COUNT versus SUM versus COUNT(DISTINCT transaction) over a 251-row line-item stream is the first fork in every read.",
      slugs: ["group-sold-products-by-the-date", "product-sales-analysis-ii", "top-earners"],
    },
    {
      name: "Basket & ticket math",
      why: "Average basket, items per basket, value per line — the merchant's dashboard is ratios over two grains. The tested habit: aggregate each grain first (value fold, transaction count), then divide with a REAL numerator, because a per-row division or an integer division turns the AOV into noise.",
      slugs: ["basket-depth-aov", "sales-analysis-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Catalog joins (listings to sales)",
      why: "Every seller read is a chain: seller → catalog → line items. Square drills the join-enrichment basics first — attach listing attributes to sales, keep unmatched sides visible — before escalating to the full three-table fold where the fan-out lives.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Idle-catalog anti-joins",
      why: "Catalog hygiene is a platform workflow: listings that never rang up, sellers with no sales in the window, buyers who browsed but never bought. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is the 'find the idle inventory' question — and on a healthy platform, zero results is itself the finding.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Top-seller ladders & ranking windows",
      why: "The commerce deck leads with ladders: top sellers by GPV, top listings by units, per-category crowns. Ties are everywhere at real price points, so the rank trio — with a deterministic tie-break and an explicit ties-share-a-rung decision — is the drilled reflex.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "CASE banding for ticket tiers",
      why: "Merchandising thinks in bands: budget shelf, mid shelf, premium shelf; small tickets vs large. The CASE census — bands as groups, count and average per band, boundary arms exhaustive — is the tested shape, and the boundary placement is a business decision someone must own.",
      slugs: ["count-salary-categories", "calculate-orders-within-each-interval", "spend-histogram"],
    },
    {
      name: "Dispute & ratio gates",
      why: "Dispute rates are ratios with a survival rule: rate per seller, but only sellers above a volume gate — a HAVING after the rate, not a WHERE before it. Square drills the ratio-plus-gate shape because ungated rates read noise as risk.",
      slugs: ["chargeback-rate-ranking", "low-quality-problems", "returns-rate-by-category"],
    },
    {
      name: "NULL policy on open tickets",
      why: "A register transaction can carry a NULL completion stamp (still open), a listing can carry a NULL sale attribute, a bonus-eligible field can be empty. Square screens check whether the NULL is treated as a population to report, coalesced for display, or excluded with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Set ops for the books",
      why: "Month-close stitches populations into one deliverable: card-rail vs transfer-rail settlements, spend-in vs spend-out packets. UNION ALL's no-dedupe cheapness and the column-position discipline are the tested reflexes — a packet that silently dedupes masks the double-count the close exists to catch.",
      slugs: ["monthly-transactions-ii", "team-scores-in-football-tournament", "count-apples-and-oranges"],
    },
    {
      name: "Cents-safe money math",
      why: "Every money column in the billing, settlement, expense and ledger tables is INTEGER cents — 16800 rent cents, 37364 card-settlement cents — so every dollar read is amount_cents / 100.0 and every ratio sits one forgotten .0 away from a truncation leak. Reconciliation reads (trial-balance eyes, per-account folds) are the kit's finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "total-traveled-distance"],
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
  ],
};
