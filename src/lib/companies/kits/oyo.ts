// OYO — kit 4 of the Travel & Hospitality domain (Batch G).
// Standardized budget hotels at network scale: franchise supply, property
// quality scores and standardized audits — where the asset-light model makes
// supply-side SQL (operators, room categories, stock cover) the daily read.
// Pool provenance: OYO has NO registry tags in this app's pools — zero tagged
// sql rows — so every problem and topic slug is theme-curated from
// scripts/company-pools.md's theme menu, mirroring workflows OYO screens are
// known to probe (supply audits, quality gates, band pricing, sell-through).
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as suppliers=property operators,
// products=room categories, orders=bookings, customers=guests, region=market.

import type { CompanyKit } from "../types";

export const oyoKit: CompanyKit = {
  id: "oyo",
  domainId: "travel",
  name: "OYO",
  tagline: "Standardized budget hotels at network scale",
  accent: "text-rose-300",

  brief: [
    "OYO is one of the world's largest hotel chains by room count, and the way it got there is the whole analytics story: it owns almost none of the buildings. The **asset-light model** standardizes thousands of budget properties — franchise and leased — under one brand, one quality bar and one pricing stack, which means the company's hardest problems are supply-side: onboard operators, audit them, score them, and keep the promised standard from drifting across a network. In this app's training db the mapping is honest: `suppliers` are property operators, products are room categories, orders are bookings, customers are guests, and region is market. Probed scale: **6 operators carrying 16 room categories** between them (2-3 listings each), 103 bookings worth 34833.28 across 251 line items, quality ratings spanning 3.9 to 4.8.",
    "The data org mirrors the model. Supply growth owns onboarding and the listings funnel; quality science owns the audit pipeline — property scores, standard checks, the trusted bench (rating **4.5+** is exactly two of six operators on the db: Nordic Gadgets AB at 4.6 and Alpine Audio GmbH at 4.8, while Pacific Textiles sits at 3.9). Revenue management owns band pricing — the db's 16 room categories split evenly into a {amber:budget band} under 50 (8 categories, averaging 32.06) and a {sky:mid band} 50-200 (8 categories, averaging 111.5) — and there is no premium band at all: the most expensive category tops out at **199.99**, because budget-first is the brand, not an accident. Finance analytics reconciles operator settlements where money is stored as integer cents.",
    "Interview style is standardization-first. Screens walk from a supply-chain join to a **quality gate** (operators above a rating floor, categories above a stock threshold), then into a banding question (budget versus mid, a `CASE` boundary at exactly 50) or a sell-through fold where units and stock live at different grains. The follow-ups are audit-flavored: which rows survive your join, does an operator with zero bookings still appear, is your share computed per category or per listing. Candidates who treat *the audit score as a filter to set and the standard as a definition to state* are the ones who clear the bar.",
    "Preparation strategy: OYO has no tagged pool in this app's registry — zero sql rows carry the tag — so the kit curates all sixteen problems from the theme menu and says so. Do the ten topics in order, then rebuild both case files on the live db: the **franchise supply audit** (per-operator listings, quality rating and gross revenue over a three-table chain) and the **one-pass room-category census** (budget-band counts via `FILTER`, stock cover and average rate per category, top categories by rooms stocked).",
  ],

  dayInLife: [
    "**08:30 —** The morning starts on the network health board, and the first query is always a supply reconciliation: did last night's bookings land against every operator, do row counts sit inside the 7-day band, did any property's audit score {rose:drift} outside its band. The listings fold refreshes — 6 operators, 16 room categories, 2-3 listings each on the training db — and the {amber:quality exceptions} queue gets its daily sweep: anything below the 4.5 bench triggers a standardized-audit workflow. A **bookings-versus-settlements mismatch** is the day's first fire, and the analyst who can write the diff query — which operator, which rows, how many cents — is the one everyone waits on.",
    "**11:15 —** Midday is revenue management and supply growth. A pricing analyst wants the band read: {amber:budget} versus {sky:mid} room categories per market, average rates inside each band (**32.06 versus 111.5** on the db), and where discounting is eroding the band boundary. A supply lead wants the operator scorecard before a renewal call — listings, quality rating, gross revenue (Nordic's **11130.25** against Pacific Textiles' 2980.15) — and the stock-cover read that decides which room categories get inventory pushed before the weekend. Each ask is a join, a conditional aggregate and a grain decision, and the strong habit is writing the query twice: once to answer, once with the definition printed so the number survives the audit meeting.",
    "**14:00 —** The afternoon tilts to audit and exception cycles. The weekly network review wants the **one-pass census** — per category: listings, budget-band count, rooms stocked, average rate — because the audit cadence is query-budgeted and four sequential scans don't fit the window. The finance side runs settlements: cents-to-dollars reads, partial-payment detection, and the {rose:void-but-paid} row the reconciliation is expected to catch before close.",
    "**17:30 —** Rituals hold it together: every scorecard ships with its SQL attached, *a standard that drifted is treated as an incident*, and the last hour is handoff — the two numbers tomorrow morning must **reconcile, in writing**. The handoff note carries the exception queue's state, the band-boundary reads and the settlement diffs, so the morning sweep starts from tonight's ledger instead of re-deriving it. A standard is only as strong as its last audit — and the audit trail is the writeup.",
  ],

  metrics: [
    { name: "Property quality score", what: "The audit rating each operator carries — 3.9 to 4.8 on the db, with the trusted bench at 4.5+ holding exactly two operators. The score that decides renewals, and the filter most quality questions start from." },
    { name: "Listings per operator", what: "Room categories each property carries — 2-3 on the db. Supply breadth is the growth metric: a thin operator is a churn risk, a fat one is a concentration risk." },
    { name: "Budget-band share", what: "Share of room categories priced under the budget boundary — 8 of 16 on the db, averaging 32.06 against the mid band's 111.5. Budget-first is the brand promise, and the band boundary is a CASE edge an interviewer will probe." },
    { name: "Room-nights sold", what: "Units moved per room category — 97 in the biggest category on the db, 21 in the smallest. The demand read at line grain, folded from the 251 line items under 103 bookings." },
    { name: "Sell-through", what: "Units sold against rooms stocked, per category — the Noise-Canceling Headset class moved 46 of its 60 units while others sit near half. The two-grain fold that turns an orders table into a supply decision." },
    { name: "Operator concentration", what: "Revenue share held by the top operator — Nordic's 11130.25 is 32% of db revenue. The network-risk metric that decides how hard supply growth pushes diversification." },
    { name: "Cancellation share", what: "Cancelled bookings ÷ placed bookings — 7 of 103 (6.8%) on the db, worst market 8.1%. A standardized network is judged on the cancellation curve its weakest property sets." },
    { name: "Turnaround latency", what: "julianday(shipped_at) − julianday(created_at) over the 82 dispatched bookings: 2.98 days average, 2..4 range. The standardization clock — every property against the same bar." },
  ],

  topics: [
    {
      name: "Operator supply folds",
      why: "The network IS the supply table: operators, their room categories and their stock are the rows everything else joins to. Folding listings and stock per operator — with the join chain that reaches bookings — is the first read of every supply review.",
      slugs: ["warehouse-manager", "find-stores-with-inventory-imbalance", "product-sales-analysis-ii"],
    },
    {
      name: "Quality scores & audit gates",
      why: "Standardization lives or dies on the score: ratings histograms, operators above the 4.5 bench, categories above a threshold. HAVING is the audit gate — and the gate goes on the FOLD, never on the raw rows.",
      slugs: ["ratings-histogram", "customer-order-frequency", "classes-more-than-5-students"],
    },
    {
      name: "Standard checks as CASE branches",
      why: "Every standardized audit is a branching decision: pass, fail, borderline. CASE WHEN turns the audit rubric into a column — and the boundary placement (at 50, at 4.5) is a definition someone must own out loud.",
      slugs: ["type-of-triangle", "weather-type-in-each-country", "calculate-special-bonus"],
    },
    {
      name: "Budget-band bucketing",
      why: "The brand promise is budget-first, so price bands are the pricing org's daily fold: under 50 is budget (8 categories, avg 32.06), 50-200 is mid (8, avg 111.5), and the premium band is empty — a fact worth stating because an empty band is a finding, not a bug.",
      slugs: ["spend-histogram", "create-a-session-bar-chart", "calculate-orders-within-each-interval"],
    },
    {
      name: "Sell-through & stock cover",
      why: "Rooms stocked versus room-nights sold is the network's heartbeat: 46 of 60 in one class versus 21 of 210 in another is the difference between pushing inventory and pulling it. Two grains, one honest ratio, denominator stated first.",
      slugs: ["weeks-of-supply", "find-books-with-no-available-copies", "unpopular-books"],
    },
    {
      name: "Franchise chain joins",
      why: "Operator → room category → booking line is the three-table chain every revenue read rides on. The follow-up is always survival: an operator with no bookings, a category never sold — who appears, who vanishes, and which join type makes that a decision instead of an accident.",
      slugs: ["top-travellers", "average-selling-price", "project-employees-i"],
    },
    {
      name: "Supply-side anti-joins",
      why: "Network hygiene is anti-join work: operators whose listings never moved, properties with zero bookings in a window. On this training db every category has sold, so the honest zero-row result is itself the lesson — the pattern is drilled on general data, the empty result is reported, not forced.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "dormant-reactivation"],
    },
    {
      name: "Audit cadence & calendar math",
      why: "Audits run on a calendar: inspections due, scores refreshed, latency to first booking. Date bucketing and day-over-day comparisons are the cadence tools — and the trap is always the same: BETWEEN on the last day of the audit window.",
      slugs: ["rising-temperature", "convert-date-format", "the-latest-login-in-2020"],
    },
    {
      name: "Sister-property pairings",
      why: "Paired reads are a network skill: two properties in one market sharing a booking date, seats or rooms sold together, twin categories priced against each other. Self-joins with role-named aliases and a tie rule keep the pairing honest.",
      slugs: ["consecutive-available-seats", "apples-and-oranges", "tree-node"],
    },
    {
      name: "Cents-safe settlement folds",
      why: "Operator settlements are stored as integer cents, so every dollar read is amount_cents / 100.0 and every truncated total is a leak. Conditional SUMs — credits versus debits, paid versus unpaid — are the reconciliation reflex this kit's finance tables reward.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "total-traveled-distance"],
    },
  ],

  theory: [
    {
      id: "oyo-t1",
      q: "Walk me through the operator → room category → booking line join. Where does the grain change, and what does each JOIN type do to an operator with zero bookings?",
      a: "Three tables, two hops, one grain change each. suppliers → products is one-to-many (6 operators fan to 16 categories), products → order_items is the second fan (categories fan to the 251 line items). After both joins, the row grain is LINE ITEM — so COUNT(*) counts lines, COUNT(DISTINCT p.id) counts categories, COUNT(DISTINCT s.id) counts operators, and a revenue fold must SUM(unit_price * quantity) before anyone calls it per-operator money. INNER JOIN drops an operator with zero bookings entirely — the network report silently loses a property; LEFT JOIN from suppliers keeps it with NULL revenue columns, which is the honest shape for a supply-first report, provided you read the NULLs as 'no demand yet', not as missing data. The OYO habit: name the grain after every hop, and choose the join type by asking who must survive — the network report's answer is 'every operator, always'.",
      tag: "joins",
    },
    {
      id: "oyo-t2",
      q: "Your sell-through report divides units sold by rooms stocked per category. What are the three ways that ratio lies, and how do you pin each one?",
      a: "Three lies, three pins. Integer division: units and stock are both integers, so units/stock in raw integer math truncates toward zero — 46 of 60 prints 0. The pin is 100.0 * SUM(units) / SUM(stock), the .0 before the division, always. Denominator drift: if the units fold is filtered to one status but the stock fold isn't (or vice versa), the ratio compares two different populations — the pin is folding both sides from the same rows, one GROUP BY, no asymmetric WHERE. Fan-out: joining line items to stock inflates stock by lines per booking — 60 rooms counted three times reads as 180. The pin is staging: fold units per category in a derived table, keep stock in its own fold, join the aggregates. On this db the classes run 46/60 hot against 21/210 cold, and the decision those numbers drive — push inventory or pull it — is only as good as the denominator nobody argued about.",
      tag: "aggregation",
    },
    {
      id: "oyo-t3",
      q: "The network review wants the top room category per market by rooms stocked. Where does the window run in the pipeline, and what's the safe way to stage it?",
      a: "Windows execute after GROUP BY — RANK() OVER (ORDER BY SUM(p.stock) DESC) is legal because the window's ORDER BY sees the folded groups. The danger is the grain mix: adding a bare per-line column to a grouped SELECT is tolerated by SQLite (it picks an arbitrary row's value) and errors in stricter engines, and either way it annotates the leaderboard with a value that belongs to some random line. The safe shape stages the fold: a derived table or CTE computes category, market, SUM(stock) grouped by both, and the outer query ranks PARTITION BY market over that — two grains, two layers, one job each, and the partition boundary is visible in the code. At OYO this is the weekly scorecard shape — top category per market, top operator per region — and a leaderboard that can't say which layer every column lives in is a scorecard the audit meeting will not sign.",
      tag: "windows",
    },
    {
      id: "oyo-t4",
      q: "An audit column can be NULL — the inspection hasn't run yet. What's your policy for NULLs in the quality report, and what does each aggregate do with them?",
      a: "Policy first, mechanics second. Filters: NULL fails both x = value and x != value — WHERE rating < 4.5 silently drops UNAUDITED properties alongside failing ones, which hides exactly the rows the audit pipeline needs. To find the un-audited you must ask for NULL explicitly (IS NULL), never NOT IN a value list. Aggregates: AVG(rating) and COUNT(rating) skip NULLs — the network average is computed over audited properties only, which is right, but it must be SAID: 'average of 6 rated operators'; COUNT(*) keeps every row, so rated-versus-total is the coverage gap, and on this db the bench at 4.5+ is 2 of 6 operators. Joins: NULL keys never match, so a property with a NULL region vanishes from market reports. The OYO policy: NULL means 'standard not yet verified' — report it as its own class, never coalesce it to a passing score, and never let a WHERE clause turn unaudited into invisible.",
      tag: "nulls",
    },
    {
      id: "oyo-t5",
      q: "The renewal list needs operators with at least 2 listings and revenue above 3000. Where does each condition live — WHERE or HAVING — and why does the alias rule follow?",
      a: "The pipeline order decides: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. 'At least 2 listings' is a property of the FOLD (COUNT of joined rows per operator), so it lives in HAVING — WHERE executes before grouping, when the count doesn't exist yet; COUNT(DISTINCT p.id) >= 2 in HAVING is the gate. 'Revenue above 3000' is the same: a group-level SUM, so HAVING again. Row-level facts — an operator's region, a category's price band — belong in WHERE, where they shrink the input before the fold. The alias rule is the same story: SELECT aliases are born at SELECT, after WHERE, so the engine rejects them there (SQLite leniently resolves aliases in GROUP BY, HAVING and ORDER BY, Postgres is stricter) — the portable habit is writing the underlying expression in HAVING and the alias only in ORDER BY. At OYO the distinction is the audit itself: row filters are standards applied to properties, HAVING gates are standards applied to operators, and a renewal list that mixes them up renews the wrong network.",
      tag: "pipeline",
    },
    {
      id: "oyo-t6",
      q: "Which operators clear the network-average revenue? Compare the IN-subquery, EXISTS and scalar-subquery shapes — cost, edge cases, and what happens when the inner fold is empty.",
      a: "Stage one is the average itself: SELECT AVG(revenue) folded per operator — a derived table or CTE, because per-operator revenue is already an aggregate and averaging aggregates needs the fold staged first. Stage two compares. The scalar shape — WHERE rev > (SELECT AVG(rev) FROM staged) — is contractually 0-or-1 rows: on the full db it's fine, but on a filtered staging slice an empty inner fold yields NULL and every comparison goes UNKNOWN, so the report silently prints nothing. The EXISTS shape (HAVING SUM … > all values in a set) and the IN shape both handle emptiness more gracefully — empty IN means no rows match, which is at least visible. The correlated variant — each operator against the average of its MARKET, not the network — re-runs per outer row: a different question (local vs network standard) at a different cost, and at OYO that distinction is the whole audit philosophy: a 3.9 operator fails the network bar and passes its local one; which bar applies is a business decision, and the SQL shape encodes it.",
      tag: "subqueries",
    },
    {
      id: "oyo-t7",
      q: "Audit inspections carry dates; bookings carry timestamps. How do you bucket by month, diff days between an audit and its follow-up, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', inspected_on) or SUBSTR(inspected_on, 1, 7) both yield '2024-06' — the SUBSTR shortcut only survives fixed-width ISO text; one '2024-6-5' row mis-buckets silently. Diffs: JULIANDAY(follow_up) − JULIANDAY(inspected_on) gives fractional days — round once at the END, never per row, or the average drifts by a rounding per property. Windows: half-open intervals — inspected_on >= '2024-06-01' AND < '2024-07-01' — never BETWEEN on the last day, which drops the month's final audits. The deeper breaks: TEXT dates carry no timezone declaration, so 'day' is a convention someone owns, and a NULL follow-up date means 'not yet revisited' — a population to report separately, not a row to silently drop. At OYO the audit cadence is a promise to the network: state the window convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "oyo-t8",
      q: "Standardization drift: two operators report the same room category under slightly different names, and one settlement shows a payment on a voided invoice. How does your SQL catch both?",
      a: "Both are comparisons of two things that should agree. The naming drift: GROUP BY on a normalized key — UPPER(TRIM(category)) — or a GROUP_CONCAT fold per operator lists what each one actually reports, and the mismatch falls out as two rows where one should be; the deeper fix is upstream (a canonical category table), and the SQL finding is the evidence, not the cure. The voided-but-paid settlement: status and payment existence are two definitions of settled — LEFT JOIN payments and count rows per invoice; a void invoice with a payment row (like the db's void-but-paid #11 at 92500 cents = 925.00) is the diff, and it's found by comparing COUNT of payments against the status class, not by eyeballing totals that tie out. The OYO reflex being graded: duplicates are detected with an aggregate (HAVING COUNT(*) > 1) or a normalization fold, anomalies are two queries that must print the same number, and the deliverable is always which rows differ — not the fact that they differ.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "oyo-mcq-1",
      prompt: "Six operators carry 16 room categories between them. Which expression counts each operator's listings correctly after the suppliers→products join?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT p.id)",
        "SUM(p.id)",
        "COUNT(DISTINCT s.id)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT p.id) folds the joined rows back to distinct room categories per operator — 3, 3, 2, 2, 3, 3 on this db. It's the listings column the scorecard needs.",
      notes: [
        { choice: 0, why: "After joining order_items the row grain is LINES — COUNT(*) then counts booking lines (up to 251 rows' worth), not listings. Grain after every hop, or the fold lies." },
        { choice: 2, why: "SUM over an id column adds id VALUES — a number that grows with catalog size and id ordering. Aggregating an id is always a smell." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-2",
      prompt: "The budget band is defined as price strictly under 50. How many of the db's 16 room categories qualify, and which WHERE catches them all?",
      choices: [
        "8 — WHERE p.price < 50",
        "7 — WHERE p.price <= 50",
        "9 — WHERE p.price < 50 OR p.price = 50",
        "8 — WHERE p.price LIKE '4%'",
      ],
      answer: 0,
      why: "Exactly 8 categories price under 50 (avg 32.06) and 8 sit at 50-200 (avg 111.5); the strict < keeps the 49.00 category in budget and the 50-and-above in mid — the boundary is a definition, stated once.",
      notes: [
        { choice: 1, why: "<= 50 pulls the boundary category into budget — the band counts become 9 and 7 and the budget-average drifts. Boundary arithmetic at exactly 50 is the trap." },
        { choice: 3, why: "LIKE '4%' matches 40-49.99 but also 4.00, and misses nothing at 49 — it's a pattern guess standing in for a definition. Bands are numeric predicates." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-3",
      prompt: "Ratings are REAL (3.9 to 4.8). Which expression prints the network average quality score to one decimal?",
      choices: [
        "AVG(rating) AS avg_score",
        "ROUND(AVG(rating), 1) AS avg_score",
        "ROUND(SUM(rating) / 6, 1) AS avg_score",
        "CAST(AVG(rating) AS INTEGER) AS avg_score",
      ],
      answer: 1,
      why: "AVG over REAL already returns real arithmetic; ROUND(..., 1) bounds the display once, at the end — the scorecard's one-decimal convention applied in exactly one place.",
      notes: [
        { choice: 0, why: "It computes the right number and prints every trailing digit — 4.283333333 in the deck. Not wrong math, wrong presentation layer; rounding belongs at the edge, deliberately." },
        { choice: 3, why: "CAST to INTEGER truncates 4.28 to 4 — a scorecard where every operator reads as 4 hides the 3.9-versus-4.8 spread the audit exists to surface." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-4",
      prompt: "The renewal gate: operators with at least 3 listings. Where does the condition live in the grouped query?",
      choices: [
        "WHERE COUNT(DISTINCT p.id) >= 3",
        "HAVING COUNT(DISTINCT p.id) >= 3",
        "LIMIT COUNT(DISTINCT p.id) >= 3",
        "GROUP BY s.name HAVING p.id >= 3",
      ],
      answer: 1,
      why: "The listing count is a property of the FOLD — it exists only after GROUP BY — so the gate is HAVING. WHERE executes before grouping and cannot see a count.",
      notes: [
        { choice: 0, why: "WHERE COUNT(...) is the classic error: the aggregate doesn't exist yet where WHERE runs. The gate on a fold is always HAVING." },
        { choice: 3, why: "p.id is a row-level value, not the group's count — this gates on a single arbitrary id per operator, which is a different (and meaningless) filter." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-5",
      prompt: "One room category stocked 60 units and sold 46. Which expression prints sell-through as 76.7%?",
      choices: [
        "46 / 60",
        "100.0 * 46 / 60",
        "100 * 46 / 60",
        "46.0 / 100 * 60",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division: 76.666… rounds to 76.7. The .0 is the whole expression — without it integer division truncates, with plain 100 it still divides integers first.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER in SQLite floors: 46/60 prints 0. The report reads as zero demand on the db's hottest class." },
        { choice: 2, why: "100 * 46 = 4600, then / 60 is STILL integer division on integers — 76. Same bug wearing a bigger numerator; the .0 must touch the division itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-6",
      prompt: "You LEFT JOIN operators to their bookings and one operator shows NULL revenue. Filtering with `WHERE revenue > 0` — what did you just do?",
      choices: [
        "Nothing — NULL revenue just sorts last",
        "Removed the zero-demand operator — the LEFT JOIN silently became an INNER JOIN",
        "Kept the operator with revenue shown as 0",
        "Made the report error out on NULL comparison",
      ],
      answer: 1,
      why: "NULL > 0 is UNKNOWN, so the row fails WHERE — the operator you LEFT-joined to protect is gone, and the 'network report' quietly covers only active operators. The predicate belongs in the ON clause or the NULL must be handled deliberately.",
      notes: [
        { choice: 0, why: "Sort order isn't the issue — survival is. The row fails the WHERE comparison and vanishes before ORDER BY ever runs." },
        { choice: 2, why: "Nothing coerces NULL to 0 here — COALESCE would, but it isn't in the query. The row is dropped, not displayed as zero." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-7",
      prompt: "The audit rubric: score ≥ 4.5 'trusted', 4.0-4.4 'watch', below 4.0 'intervene'. Which CASE is audit-correct on this db's operators (4.8, 4.6, 4.4, 4.1, 4.0, 3.9)?",
      choices: [
        "CASE WHEN rating >= 4.5 THEN 'trusted' WHEN rating >= 4.0 THEN 'watch' ELSE 'intervene' END",
        "CASE WHEN rating > 4.5 THEN 'trusted' WHEN rating > 4.0 THEN 'watch' ELSE 'intervene' END",
        "CASE WHEN rating >= 4.5 THEN 'trusted' WHEN rating < 4.0 THEN 'intervene' ELSE 'watch' END",
        "IF(rating >= 4.5, 'trusted', 'watch')",
      ],
      answer: 0,
      why: "Ascending thresholds with >= are unambiguous: 4.8/4.6 trusted, 4.4/4.1/4.0 watch, 3.9 intervene. The boundary at exactly 4.5 and exactly 4.0 lands where the rubric says it does.",
      notes: [
        { choice: 1, why: "Strict > demotes the 4.5 operator to watch and the 4.0 operator to intervene — the boundary operators flip class. Audits live and die on boundary ownership." },
        { choice: 3, why: "Two branches: the 4.0-4.4 'watch' band disappears into 'trusted-or-watch', and SQLite has no two-argument IF() — this isn't even valid SQL." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-8",
      prompt: "Rank operators by revenue within each market, keeping every operator row. Which window shape is right?",
      choices: [
        "RANK() OVER (ORDER BY revenue DESC)",
        "ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC)",
        "RANK() OVER (PARTITION BY region ORDER BY revenue DESC)",
        "GROUP BY region, RANK() OVER (revenue)",
      ],
      answer: 2,
      why: "PARTITION BY region restarts the ranking per market — the per-market leaderboard — and RANK keeps ties sharing a rung. No partition means one global ladder; ROW_NUMBER means ties get arbitrary separate ranks.",
      notes: [
        { choice: 0, why: "No PARTITION BY: one network-wide ranking, so each market's report shows at most one operator. The per-market restart is the entire ask." },
        { choice: 3, why: "Windows don't nest inside GROUP BY like that — the fold must be staged (derived table/CTE), then the window runs over the folded rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-9",
      prompt: "One query must print, per category: listings, budget-band listings (price < 50) and mid-band listings — and the three columns must reconcile. Which shape?",
      choices: [
        "Three separate GROUP BY queries joined on category",
        "COUNT(*) with two COUNT(*) FILTER (WHERE …) branches in one pass",
        "SUM(price < 50) and SUM(price >= 50) as two queries UNIONed",
        "COUNT(CASE WHEN price < 50 THEN 1 END) — the ELSE NULL handles the rest",
      ],
      answer: 1,
      why: "FILTER (WHERE …) branches count inside one scan, and each branch plus its complement reconciles against COUNT(*) by construction — the one-pass census the audit window is budgeted for.",
      notes: [
        { choice: 0, why: "Three scans and two joins to reassemble — works, but it's the query-budget killer, and a category present in one scan and not another prints NULL instead of 0." },
        { choice: 2, why: "UNION stacks ROWS, not columns — the output shape is a long table (category, band, count), not the wide census the scorecard needs. And SUM of a boolean is the COUNT bug in disguise." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-10",
      prompt: "An operator settlement totals 401500 cents. Which read prints 4015.00 dollars — and which print(s) 4015, losing the cents on odd-amount rows?",
      choices: [
        "amount_cents / 100 — and it's fine because 401500 divides evenly",
        "ROUND(amount_cents / 100.0, 2) — the .0 makes the division real before any truncation",
        "CAST(amount_cents AS REAL) / CAST(100 AS REAL) — types fixed at the end",
        "amount_cents / 100.0 — division is real, rounding is implicit",
      ],
      answer: 1,
      why: "The .0 inside the division promotes the arithmetic before truncation can bite, and ROUND bounds the display once. On even hundreds both reads agree — which is exactly why the bug ships: it only eats odd-cent rows.",
      notes: [
        { choice: 0, why: "The trap in one sentence: 'it's fine because it divides evenly this time'. One 92550-cent row and the fold truncates to 925 — a silent half-dollar leak per odd row." },
        { choice: 3, why: "Right math, unbounded display: 4015.0 prints as 4015.0 in some clients and 4015 in others, and the missing ROUND is how two reports of the same settlement disagree at the fourth column." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-oyo-1",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The franchise supply audit",
      brief:
        "OYO-flavored brief on the storefront db: the supply review wants the operator scorecard before renewal calls — per property operator: listings carried, quality rating, and gross revenue booked through the network. The supply lead is explicit: 'listings tell me breadth, the rating tells me risk, revenue tells me stake. All three per operator or the meeting can't rank them.' Probed facts: 6 operators carry 16 room categories (2-3 listings each); ratings run 3.9 (Pacific Textiles) to 4.8 (Alpine Audio GmbH), with the 4.5+ trusted bench holding exactly two operators — Nordic Gadgets AB (4.6) and Alpine (4.8). Revenue via products → order_items: Nordic 11130.25 (32% of the network's 34833.28), Midwest Hardware Co 9294.93, down to Pacific Textiles 2980.15. The db's 103 bookings fan to 251 line items — the revenue fold rides that chain.",
      ask: "Return per operator: name, rating, listings (distinct room categories) and gross_revenue (2dp), biggest revenue first, top operator only.",
      template:
        "SELECT s.name,\n       s.rating,\n       {1}(DISTINCT p.id) AS listings,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS gross_revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name, s.rating\nORDER BY gross_revenue {2}\nLIMIT {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the breadth counter",
          why: "COUNT(DISTINCT p.id) counts distinct room categories per operator — Nordic 3, Alpine 2. SUM(DISTINCT p.id) is legal SQL but sums id VALUES (a meaningless number), and AVG(DISTINCT p.id) averages ids: only COUNT is a census.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the stake-first direction",
          why: "The renewal meeting ranks by stake: Nordic 11130.25 first, Pacific Textiles 2980.15 last. ASC would open on the smallest operator — a correct query answering the opposite question.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the top-operator cut",
          noVerify: true,
          why: "The ask is THE top operator by revenue — one row, Nordic Gadgets AB. LIMIT 2 would hand the review a runner-up nobody requested.",
        },
      ],
      distractors: ["SUM", "AVG", "ASC", "2"],
      walkthrough:
        "A three-table chain, one grain decision per hop. suppliers → products fans 6 operators to 16 room categories; products → order_items fans to the 251 booking lines where money lives. After both hops the row grain is LINE ITEM, so listings must be COUNT(DISTINCT p.id) — folding lines back to categories — while revenue is SUM(unit_price * quantity) rounded once at the end. GROUP BY s.name, s.rating folds per operator; ORDER BY gross_revenue DESC + LIMIT 1 crowns Nordic at 11130.25. The distractors die honestly: SUM(DISTINCT p.id) executes and prints summed id values (11, not 3) — a legal query lying legally; AVG(DISTINCT p.id) averages ids the same way; SUM or AVG in the ORDER BY slot is a syntax error; ASC re-ranks the meeting smallest-first; LIMIT 2 dilutes the ask to a runner-up. Note what the INNER joins did: an operator with zero bookings would vanish from this scorecard entirely — on this db every operator has revenue, but the LEFT JOIN question is the follow-up the interview is waiting to ask.",
    },
    {
      id: "cs-oyo-2",
      tier: "hard",
      topic: "x2",
      universe: "inventory",
      title: "The one-pass room-category census",
      brief:
        "OYO-flavored brief on the storefront db: the audit window is query-budgeted, so the category census must be ONE scan: per room category — listings, budget-band listings (price strictly under 50), rooms stocked, average rate. The revenue-management lead fixed the band boundary in advance: budget is price < 50, mid is 50-200, and there is no premium band on this network (the most expensive category tops out at 199.99) — budget-first is the brand promise, 8 of 16 categories budget (avg 32.06) and 8 mid (avg 111.5). Probed per-product stock runs 40 to 500 units (the HDMI Cable class holds 500 rooms, the Smart Watch class 40). The read that matters: which categories hold the most rooms stocked, best categories first, top three only.",
      ask: "One scan per category: listings, budget_listings, rooms_stocked and avg_rate (2dp), most rooms stocked first, top 3 categories.",
      template:
        "SELECT p.category,\n       COUNT(*) AS listings,\n       COUNT(*) FILTER (WHERE p.price < {1}) AS budget_listings,\n       SUM(p.stock) AS rooms_stocked,\n       ROUND({2}(p.price), 2) AS avg_rate\nFROM products p\nGROUP BY p.category\nORDER BY rooms_stocked {3}\nLIMIT {4};",
      slots: [
        {
          answer: "50",
          kind: "number",
          label: "the band boundary",
          noVerify: true,
          why: "The budget band is price strictly under 50 — the boundary the pricing lead fixed. At 49 the USB-C Hub class stays budget; bump the threshold to 4 and every category reads zero budget listings: a different network.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the rate fold",
          why: "AVG(p.price) is the category's average rate — Accessories 27.49, Apparel 41.75, Electronics 57.83. COUNT would print listing counts into a money column and SUM would print the price of buying the whole category once.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The read is stock cover: Accessories 940, Apparel 510, Electronics 505 lead the network. ASC would surface the thinnest categories — the opposite of the restocking question.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the top-three cut",
          noVerify: true,
          why: "The audit window reviews the three heaviest categories. LIMIT 4 drags in a fourth nobody budgeted for; LIMIT 2 drops Electronics at 505.",
        },
      ],
      distractors: ["COUNT", "SUM", "ASC", "4"],
      walkthrough:
        "One scan, four branches, no join. FILTER (WHERE …) counts the budget band inside the same pass as COUNT(*) — the complement reconciles by construction, which is the whole point of a one-pass census: listings minus budget_listings is the mid-band count, and no second query can disagree with the first. SUM(p.stock) is rooms stocked (940 / 510 / 505 lead), AVG(p.price) is the average rate, each rounded once at the end; ORDER BY rooms_stocked DESC + LIMIT 3 hands the review the heaviest categories. The distractors: COUNT in the rate slot prints listing counts (3, 2, 3) where money belongs — a legal read of the wrong grain; SUM in the rate slot prices the entire category; COUNT and SUM in the threshold slot are syntax errors (aggregates need parentheses); ASC inverts the review to the thinnest categories; LIMIT 4 pads the cut. The empty-band honesty note: no category prices at 200 or above, so a premium branch would count zero everywhere — an empty band is a finding about the network, not a bug in the query.",
    },
  ],

  problems: [
    { slug: "warehouse-manager", why: "Stock folds per location — rooms stocked per property per category, the supply-census shape the whole network read runs on." },
    { slug: "ratings-histogram", why: "Review-score buckets — the audit-score histogram: how the network distributes against the 4.5 trusted bench." },
    { slug: "customer-order-frequency", why: "HAVING-gated booking counts — operators and guests above an activity floor, the renewal-gate pattern before any scorecard ships." },
    { slug: "type-of-triangle", why: "CASE rubric with boundary classes — the audit banding exercise: trusted / watch / intervene, decided at exactly 4.5." },
    { slug: "spend-histogram", why: "Rate-band bucketing — the budget-versus-mid census, where the band edge at 50 is a definition someone owns." },
    { slug: "weeks-of-supply", why: "Stock against run-rate — the sell-through lens that turns rooms-stocked into weeks of cover before the weekend push." },
    { slug: "find-books-with-no-available-copies", why: "Zero-availability census — the sold-out class read: which categories have nothing left to sell tonight." },
    { slug: "average-selling-price", why: "Revenue-per-unit with a weighting choice — the rate-realization read where weighting by volume changes the answer." },
    { slug: "top-travellers", why: "Per-guest demand folds over the booking chain — the operator-side scorecard's demand twin, joined through three tables." },
    { slug: "sellers-with-no-sales", why: "Supply-side anti-join — operators whose listings never moved, the network-hygiene read every expansion screen includes." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Browsed-but-didn't-book — the abandoned-audit-read anti-join, with the LEFT JOIN + IS NULL shape said out loud." },
    { slug: "convert-date-format", why: "Audit-date reshaping — inspection timestamps reformatted for the compliance pack, SUBSTR/STRFTIME discipline in graded form." },
    { slug: "consecutive-available-seats", why: "Consecutive-availability pairing — the room-blocking read: which units can be held together, found with a self-join." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the settlement reconciliation reflex, checked before close every time." },
    { slug: "bank-account-summary-ii", why: "Per-account credit/debit folds with cents handled — operator settlement statements: money in, money out, net per property." },
    { slug: "product-sales-analysis-ii", why: "Per-category demand totals from line items — the room-nights fold at the right grain: categories, not lines, not bookings." },
  ],
};
