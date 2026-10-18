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
    "Preparation strategy: OYO has no tagged pool in this app's registry — zero sql rows carry the tag — so the kit curates all thirty-two problems from the theme menu and says so. Do the ten topics in order, then rebuild all {amber:six case files} on the live db: the **franchise supply audit** (per-operator listings, quality rating and gross revenue over a three-table chain), the **one-pass room-category census** (budget-band counts via `FILTER`, stock cover and average rate per category), the **band-boundary census** (a `CASE`-classified budget-versus-mid fold), the **repeat-guest cadence read** (a `LEAD`-window ledger for the network's most frequent guest), the **per-class demand fold** (seven room classes, line-item money folded to the class grain) and the **settlement calendar** (cleared dollars by month on the %Y-%m spine). This kit is built for spaced practice rather than one sitting: run each case, then re-run it a week later from a blank editor — *the second pass is where recall actually forms* — and treat the walkthroughs as the real content: they narrate what every wrong chip breaks.",
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
      slugs: ["warehouse-manager", "find-stores-with-inventory-imbalance", "product-sales-analysis-ii", "product-sales-analysis-i", "product-sales-analysis-v"],
    },
    {
      name: "Quality scores & audit gates",
      why: "Standardization lives or dies on the score: ratings histograms, operators above the 4.5 bench, categories above a threshold. HAVING is the audit gate — and the gate goes on the FOLD, never on the raw rows.",
      slugs: ["ratings-histogram", "customer-order-frequency", "classes-more-than-5-students", "big-countries", "daily-leads-and-partners"],
    },
    {
      name: "Standard checks as CASE branches",
      why: "Every standardized audit is a branching decision: pass, fail, borderline. CASE WHEN turns the audit rubric into a column — and the boundary placement (at 50, at 4.5) is a definition someone must own out loud.",
      slugs: ["type-of-triangle", "weather-type-in-each-country", "calculate-special-bonus", "recyclable-and-low-fat-products", "not-boring-movies", "immediate-food-delivery-i"],
    },
    {
      name: "Budget-band bucketing",
      why: "The brand promise is budget-first, so price bands are the pricing org's daily fold: under 50 is budget (8 categories, avg 32.06), 50-200 is mid (8, avg 111.5), and the premium band is empty — a fact worth stating because an empty band is a finding, not a bug.",
      slugs: ["spend-histogram", "create-a-session-bar-chart", "calculate-orders-within-each-interval", "calculate-product-final-price"],
    },
    {
      name: "Sell-through & stock cover",
      why: "Rooms stocked versus room-nights sold is the network's heartbeat: 46 of 60 in one class versus 21 of 210 in another is the difference between pushing inventory and pulling it. Two grains, one honest ratio, denominator stated first.",
      slugs: ["weeks-of-supply", "find-books-with-no-available-copies", "unpopular-books", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Franchise chain joins",
      why: "Operator → room category → booking line is the three-table chain every revenue read rides on. The follow-up is always survival: an operator with no bookings, a category never sold — who appears, who vanishes, and which join type makes that a decision instead of an accident.",
      slugs: ["top-travellers", "average-selling-price", "project-employees-i", "combine-two-tables", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Supply-side anti-joins",
      why: "Network hygiene is anti-join work: operators whose listings never moved, properties with zero bookings in a window. On this training db every category has sold, so the honest zero-row result is itself the lesson — the pattern is drilled on general data, the empty result is reported, not forced.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "dormant-reactivation", "customers-who-never-order"],
    },
    {
      name: "Audit cadence & calendar math",
      why: "Audits run on a calendar: inspections due, scores refreshed, latency to first booking. Date bucketing and day-over-day comparisons are the cadence tools — and the trap is always the same: BETWEEN on the last day of the audit window.",
      slugs: ["rising-temperature", "convert-date-format", "the-latest-login-in-2020", "unique-orders-and-customers-per-month", "the-most-recent-orders-for-each-product", "group-sold-products-by-the-date"],
    },
    {
      name: "Sister-property pairings",
      why: "Paired reads are a network skill: two properties in one market sharing a booking date, seats or rooms sold together, twin categories priced against each other. Self-joins with role-named aliases and a tie rule keep the pairing honest.",
      slugs: ["consecutive-available-seats", "apples-and-oranges", "tree-node", "article-views-i"],
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
    {
      id: "oyo-t9",
      q: "The renewal pack wants each operator's listing manifest on one row — room categories folded into a single cell. How does GROUP_CONCAT do it, and where does it bite?",
      a: "GROUP_CONCAT(p.name) folds the joined rows of each operator into one comma-joined string — Nordic Gadgets AB's three categories become 'HDMI Cable,USB-C Hub,Smart Watch' on a single scorecard row, which is the shape the pack inserts into the slide. The default separator is a comma; GROUP_CONCAT(p.name, ' | ') makes it legible. The bites: the fold is unordered unless you add ORDER BY inside the OVER-less aggregate (SQLite 3.44+), and with a join in play the fan-out duplicates rows before the fold — one operator's category can print twice. At OYO the manifest is the audit's table of contents: the string is a display cell, never a join key — anyone parsing it back apart has made the grain worse.",
      tag: "aggregation",
    },
    {
      id: "oyo-t10",
      q: "The supply packet stacks the budget-band census on top of the mid-band census. UNION or UNION ALL — and what does the wrong one hide?",
      a: "UNION ALL. The two branches are disjoint by construction (a category prices either under 50 or not), so dedupe buys nothing — and if a definition bug ever makes the branches overlap, UNION deletes the duplicate row and the packet still balances, hiding the evidence. UNION ALL keeps both rows, is cheaper (no dedupe pass), and the per-branch literals ('budget'/'mid') make the stack self-documenting. The mechanics: both branches must project the same columns in the same order — column NAMES come from the first branch — and ORDER BY sits outside the stack, sorting the combined result. At OYO the stacked packet is the review artifact: a dedupe that silently 'fixes' overlap is a standard drifting without an incident report.",
      tag: "setops",
    },
    {
      id: "oyo-t11",
      q: "Two operators report the same property as 'Nordic Gadgets AB' and 'nordic gadgets ab '. How do you make the join and the group survive the case drift?",
      a: "Normalize at the comparison, not in the table: JOIN ON UPPER(TRIM(s.name)) = UPPER(TRIM(feed.name)) and GROUP BY UPPER(TRIM(s.name)) — both sides folded to the same canonical shape, so the drift collapses into one group instead of splitting into two thin ones. TRIM first (trailing spaces survive UPPER), then UPPER — order matters because 'ab ' uppercased is still 'ab '. The honest caveats: the predicate is unsarggable (no index use on the raw column), and normalization is a finding to report upstream — the durable fix is a canonical operator table with one spelling. At OYO the rule is: the SQL finding is evidence; the standard lives in the reference data, and the query that tolerates drift is a stopgap with an expiry date.",
      tag: "casing",
    },
    {
      id: "oyo-t12",
      q: "Guest emails sit in one column — 'ana@gmail.com'. How do you split the domain for the partner-marketing read, and what breaks on malformed rows?",
      a: "SUBSTR(email, INSTR(email, '@') + 1) — INSTR finds the @ position, SUBSTR slices everything after it, and the +1 is the whole expression: forget it and the domain starts with the @. GROUP BY that expression folds guests by mail provider for the co-marketing read. The breaks: a row with no @ gives INSTR = 0, so SUBSTR(email, 1) returns the ENTIRE address as a 'domain' — a malformed row becomes its own fake provider; multiple @s split at the first, which is the correct behavior but worth saying. The policy at OYO: count the no-@ rows first (WHERE email NOT LIKE '%@%'), report them as a hygiene class, and never let the silent full-address bucket masquerade as a provider in the deck.",
      tag: "strings",
    },
    {
      id: "oyo-t13",
      q: "Which operators have never had a booking through the network? Compare NOT IN, NOT EXISTS and LEFT JOIN … IS NULL — and what does a NULL in the inner set do to NOT IN?",
      a: "Three shapes, one trap. LEFT JOIN … WHERE o.id IS NULL is the workhorse: unmatched operators survive with NULL order columns, and the IS NULL test finds them — every operator is visible in the query's own logic. NOT EXISTS (SELECT 1 FROM orders … WHERE customer = c.id) is equivalent and handles NULLs correctly by never comparing them. NOT IN (SELECT customer_id FROM orders) is the trap: if the subquery returns even one NULL, x NOT IN (…) evaluates UNKNOWN for every row and the answer is silently ZERO operators — the network report prints a clean sheet while properties sit idle. On this training db every operator has bookings, so the honest result is zero rows either way — the lesson is reporting the empty result and being able to say which shapes would have lied. Anti-joins are network hygiene: the query must be NULL-proof by construction.",
      tag: "subqueries",
    },
    {
      id: "oyo-t14",
      q: "A failed audit schedules a follow-up inspection 7 days out. How do you compute that date in SQL, and where does the arithmetic get fragile?",
      a: "DATE(inspected_on, '+7 days') — SQLite's modifier arithmetic returns the ISO date shifted, and '+7 days' respects month lengths (Jan 28 → Feb 4) where hand-rolled day math doesn't. JULIANDAY arithmetic answers the twin question in days: JULIANDAY(follow_up) − JULIANDAY(inspected_on) = 7.0 for the on-schedule rows, and the fractional results flag the late ones. The fragility: modifiers are strings — '+07 days' works, '+ 7 days' errors — and the base must be a real date, so a NULL inspected_on propagates a NULL due date (which is correct: nothing to schedule from). At OYO the follow-up window is a promise to the property: compute it once in the query, print it beside the original date, and let the difference column be the SLA report — no spreadsheet round-trips.",
      tag: "dates",
    },
    {
      id: "oyo-t15",
      q: "The ops review wants day-over-day bookings per market. How does LAG do it, and what does the first row print?",
      a: "LAG(o.created_at) OVER (PARTITION BY c.region ORDER BY o.created_at) puts the previous booking's timestamp on the current row, and JULIANDAY(current) − JULIANDAY(previous) is the gap in days — a delta column built without a self-join. The first row of each partition has no previous, so LAG returns NULL and the gap is NULL — correct, and it must be SAID: a NULL gap means 'first booking in window', not missing data; COALESCE would falsify it into a fake zero-day gap. PARTITION BY decides the comparison scope — without it the lag crosses markets and the delta compares Berlin to Osaka. At OYO the cadence read is per market because that's the unit the supply plan moves; the window's PARTITION clause is where that business definition lives in code.",
      tag: "windows",
    },
    {
      id: "oyo-t16",
      q: "Growth wants the operator roster split into four quartiles by revenue. Why NTILE, and what does the tile boundary do on ties?",
      a: "NTILE(4) OVER (ORDER BY revenue DESC) assigns each row a bucket number 1-4 with counts balanced across tiles — with 6 operators the tiles hold 2/2/1/1, which is the honest shape of 'quartiles' on a small roster and worth stating out loud. Ties at a tile boundary are cut arbitrarily (NTILE is positional, not value-aware), so a tie split across tiers 1 and 2 needs either a tie-breaker in the ORDER BY or a RANK-based tier definition instead. The follow-up is always the same at OYO: is the banding a definition (fixed thresholds — budget under 50) or a distribution (NTILE)? Quartiles recompute as the network grows; the 4.5 quality bench does not. The query that can't say which it implements is the one that starts the argument in the review.",
      tag: "windows",
    },
    {
      id: "oyo-t17",
      q: "Your dispatch report prints '82 of 103 bookings shipped'. Which counts produced each number, and why does the pair matter?",
      a: "COUNT(*) counts rows — 103 bookings placed; COUNT(shipped_at) counts non-NULL values — 82 dispatched, because shipped_at stays NULL until fulfilment. Printed together they ARE the report: the 21-row gap is the in-flight population, visible without a second query, and any latency average over shipped_at is automatically computed over the 82 (AVG skips NULLs) — which is right, provided the metric name says 'average dispatch latency of fulfilled bookings'. The failure mode is printing one number: COUNT(*) as 'bookings shipped' overstates by the pending stockpile; COUNT(shipped_at) as 'bookings' hides it. At OYO every population statement is a pair — the denominator count beside the qualifying count — because an audit meeting can reconcile a stated gap but cannot reconcile a number that hides one.",
      tag: "aggregation",
    },
    {
      id: "oyo-t18",
      q: "The cancellation share per market came back 100% everywhere. What clause placement bug does that pattern point to?",
      a: "The cancelled rows were filtered in WHERE — WHERE status = 'cancelled' — before the fold, so every group's denominator is only its cancellations and the share is 100% by construction. A share needs both sides of the ratio from the same rows: drop the WHERE filter and compute the numerator inside a conditional aggregate — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — with 100.0 forcing real division before truncation. WHERE keeps legitimate row-level scope (a market filter, a date window); the status branch belongs in SELECT because the definition of the metric includes the rows it counts against. At OYO the 6.8% network share with 8.1% worst-market is the read that survives the audit meeting, and it survives because the denominator never left the query.",
      tag: "pipeline",
    },
    {
      id: "oyo-t19",
      q: "Average rate prints 32.06 in one report and 32 in another. Same query — what's different, and which is 'right'?",
      a: "The display layer: ROUND(AVG(p.price), 2) keeps two decimals; CAST(AVG(p.price) AS INTEGER) truncates to 32 — and CAST truncates, it never rounds, so 32.9 also prints 32. Neither is wrong math; they are different contracts with the reader, and the report that mixes them arbitrarily is the bug. The OYO discipline: compute the full-precision aggregate, round ONCE at the edge with an explicit ROUND(x, n) that matches the metric's stated precision, and never CAST a REAL to INTEGER for display — a truncated average is a rounding decision disguised as a type change. Rates feed the band boundary (32.06 budget vs 111.5 mid), so a one-decimal drift compounds: state the precision in the metric name and let the query carry it.",
      tag: "types",
    },
    {
      id: "oyo-t20",
      q: "Two operators tie on revenue and the scorecard reorders between runs. How do you make the order deterministic?",
      a: "Extend the sort key past the business metric: ORDER BY gross_revenue DESC, s.name ASC — the tie-break is a stable attribute (name, or better the immutable id) so equal-revenue rows always print in the same order. A bare ORDER BY on a tied column leaves the order to the engine's scan plan, which changes with data layout, indexes and version — the scorecard 'flips' without any data changing, and the renewal meeting loses trust in the artifact. The habit at OYO: every leaderboard ships with a stated secondary key, every paginated report (LIMIT/OFFSET) needs it or rows duplicate and vanish across pages, and the audit log expects re-run stability — determinism isn't cosmetic, it's the property that makes two queries on two days comparable.",
      tag: "ordering",
    },
    {
      id: "oyo-t21",
      q: "The daily scorecard is slow and the plan shows a full scan of order_items. When is that fine, and when do you add an index?",
      a: "Read the plan first: EXPLAIN QUERY PLAN shows the scan and where a covering index could replace it. A fold over ALL 251 line items for the network scorecard scans everything by definition — an index changes nothing because every row qualifies; that query is 'slow' only in wall-clock and is fine to run on the nightly refresh. An index earns its keep on selective predicates: oi.product_id lookups from the product side (the join's probe path), a composite (product_id, order_id) if the covering read skips the table entirely. The cost is real: every index taxes the writes and the booking feed is hot. At OYO the rule is honest workloads — batch folds scan, interactive lookups index — and the analysis starts with the plan, not with CREATE INDEX.",
      tag: "indexes",
    },
    {
      id: "oyo-t22",
      q: "Before you trust a grouped result, what's the one sentence you should be able to say about it?",
      a: "One row per what? Every GROUP BY produces a result with a grain — per operator, per category, per market-month — and the sentence must be sayable BEFORE reading any number. The joins that feed the fold decide whether the grain is honest: suppliers → products → order_items lands at line grain, so per-operator money needs SUM over lines with COUNT(DISTINCT p.id) for listings, and forgetting the fold prints 251 lines where 16 categories belong. The test is mechanical: pick one row of the output, name its subject, and recount its inputs by hand — Nordic's 3 listings, its 11130.25 revenue. If the sentence is 'one row per operator, mostly' — the 'mostly' is the bug. At OYO the grain statement opens the audit writeup, because a scorecard whose grain is implicit is a scorecard nobody can defend.",
      tag: "groupby",
    },
    {
      id: "oyo-t23",
      q: "Two properties in the same market sold bookings on the same night and growth wants them paired. How does a self-join do the pairing without doubling rows?",
      a: "Join the table to itself under two role-named aliases — FROM orders a JOIN orders b ON a.region-pair = b.region-pair AND a.id < b.id — and the id comparison is what keeps each pair once: without it, every pair prints twice (A-B and B-A) and every row pairs with itself. The role names carry the meaning (a = 'first stay', b = 'second stay'), because inside a self-join every column exists twice and the ON clause is the only place the roles get defined. Same-market, same-date predicates go in the ON (the pairing rule), not WHERE-after-LEFT-JOIN where they'd silently inner-join. At OYO the pairing read powers the sister-property analysis — twin categories priced against each other, neighboring properties sharing demand — and the tie rule (which of the pair sorts first) is part of the definition, stated in the ORDER BY.",
      tag: "joins",
    },
    {
      id: "oyo-t24",
      q: "The same scorecard query run twice on the same data prints different totals. Walk me through your verification pass.",
      a: "Treat it as an incident with a checklist. Determinism first: is there an ORDER BY with a stable tie-break, or are two tied rows swapping positions (totals identical, rows reordered — read both outputs before crying 'data bug')? Then scope: did the WHERE window drift — a BETWEEN on a timestamp boundary, a 'today' that moved — pulling different row sets on each run? Then duplicates: a join fan-out that doubles rows when a second settlement lands (COUNT(*) up, SUM up) — verify with COUNT(*) versus COUNT(DISTINCT id) on both runs and diff the grain. Only after the query is exonerated do you suspect the data, and then row-level diffing finds the changed rows. At OYO the re-run discipline is the audit trail: same input, same SQL, same output — the writeup exists precisely so 'different' is provable and not a feeling.",
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
    {
      id: "oyo-mcq-11",
      prompt: "The dispatch report says '82 of 103 bookings shipped'. Which pair of expressions produced those two numbers from the same table?",
      choices: [
        "COUNT(shipped_at) and COUNT(*)",
        "COUNT(*) and COUNT(DISTINCT *)",
        "SUM(shipped_at) and COUNT(*)",
        "COUNT(shipped_at) and COUNT(shipped_at) IS NOT NULL",
      ],
      answer: 0,
      why: "COUNT(shipped_at) skips NULLs — 82 fulfilled bookings — while COUNT(*) keeps every row — 103 placed. The pair IS the report: the 21-row gap is the in-flight population, visible for free.",
      notes: [
        { choice: 2, why: "SUM over a date column adds timestamps (or errors) — a date is never a quantity. The shipped count is a non-NULL census, not an addition." },
        { choice: 3, why: "COUNT(expr IS NOT NULL) counts the boolean's non-NULL results — which is every row, so it prints 103 twice. The filter-inside-count needs a CASE, or just COUNT(shipped_at)." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-12",
      prompt: "Which WHERE clause finds the bookings that have NOT yet been dispatched, without touching the dispatched ones?",
      choices: [
        "WHERE shipped_at = NULL",
        "WHERE shipped_at IS NULL",
        "WHERE NOT shipped_at",
        "WHERE shipped_at != 'x'",
      ],
      answer: 1,
      why: "NULL never equals anything — the only test that finds unfulfilled bookings is IS NULL. Every comparison form silently returns zero rows because NULL comparisons evaluate UNKNOWN, not TRUE.",
      notes: [
        { choice: 0, why: "= NULL is the classic: it's UNKNOWN for every row, dispatched or not, so the census prints empty and the pending stockpile stays invisible." },
        { choice: 2, why: "NOT on a NULL is still UNKNOWN — and shipped_at is a date, not a boolean, so the expression is semantically wrong even where it parses." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-13",
      prompt: "Six operators sit across the db's four markets. Which query prints the per-market operator census — APAC 2, EU 2, US 1, LATAM 1?",
      choices: [
        "SELECT region, COUNT(*) FROM suppliers GROUP BY region",
        "SELECT region, SUM(region) FROM suppliers GROUP BY region",
        "SELECT region, COUNT(region) FROM suppliers ORDER BY region",
        "SELECT DISTINCT region, COUNT(*) FROM suppliers",
      ],
      answer: 0,
      why: "GROUP BY region folds the 6 rows into 4 markets and COUNT(*) counts each fold — the census with one row per market. It's the supply-geography read every expansion screen opens with.",
      notes: [
        { choice: 2, why: "No GROUP BY: COUNT(region) is one grand total (6) on one row, sorted by region — the fold never happens and the per-market grain is lost." },
        { choice: 3, why: "SELECT DISTINCT with an ungrouped COUNT mixes a per-row distinct with a grand aggregate — not the per-market census, and in stricter engines not even legal." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-14",
      prompt: "The 16 room categories roll up into 7 room classes (Audio, Wearables, Video, Electronics, Accessories, Apparel, Fitness). Which query lists the classes without duplicates?",
      choices: [
        "SELECT category FROM products HAVING category",
        "SELECT DISTINCT category FROM products",
        "SELECT UNIQUE category FROM products",
        "SELECT category FROM products GROUP category",
      ],
      answer: 1,
      why: "DISTINCT collapses the 16 rows to their 7 distinct class values — the cheapest census in SQL, no aggregation needed. It's the roll-up map that tells you what 'per class' will mean in every later fold.",
      notes: [
        { choice: 2, why: "UNIQUE isn't a SELECT modifier in SQLite (it's a constraint keyword) — the query fails to parse. DISTINCT is the operator, and GROUP BY is the heavier alternative." },
        { choice: 3, why: "GROUP category is a syntax error (missing BY) — and even GROUP BY category needs a second column or it's just DISTINCT with extra machinery." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-15",
      prompt: "A partner feed spells the operator 'NORDIC GADGETS AB' while the suppliers table says 'Nordic Gadgets AB'. Which join predicate matches the rows despite the case drift?",
      choices: [
        "ON f.name = s.name",
        "ON UPPER(f.name) = UPPER(s.name)",
        "ON f.name LIKE s.name",
        "ON LOWER(f.name) = s.name",
      ],
      answer: 1,
      why: "UPPER on BOTH sides folds both spellings to one canonical key — the join matches, the fold counts one operator, not two thin ones. Normalize at the comparison when you can't fix the feed.",
      notes: [
        { choice: 0, why: "The equality fails on case — SQLite's = is case-sensitive for TEXT — so every feed row silently misses its operator and the reconciliation reads as all-drift." },
        { choice: 3, why: "One-sided normalization: LOWER(f.name) is 'nordic gadgets ab' but s.name keeps its capitals — the comparison still fails. Fold both sides or fold neither." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-16",
      prompt: "The renewal pack wants each operator's room categories folded into one readable cell. Which expression produces 'HDMI Cable | USB-C Hub | Smart Watch'?",
      choices: [
        "GROUP_CONCAT(p.name, ' | ')",
        "CONCAT(p.name, ' | ')",
        "p.name || ' | '",
        "JOIN(p.name, ' | ')",
      ],
      answer: 0,
      why: "GROUP_CONCAT is the fold: one row per operator, all its category names joined with the given separator. The plain string operators concatenate WITHIN a row — they can't fold a group into one cell.",
      notes: [
        { choice: 2, why: "|| concatenates only the row's single p.name value with the literal — every row keeps its own cell. Folding many rows into one cell is an aggregate's job." },
        { choice: 3, why: "JOIN is a table keyword, not an aggregate — this is a syntax error. The trap is thinking 'join' when the operation is 'fold'." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-17",
      prompt: "Find every operator whose name starts with 'Nordic'. Which predicate is precise — and which over-matches?",
      choices: [
        "name = 'Nordic'",
        "name LIKE 'Nordic%'",
        "name LIKE '%Nordic%'",
        "name IN ('Nordic')",
      ],
      answer: 1,
      why: "LIKE 'Nordic%' anchors the prefix: the % covers whatever follows ('Nordic Gadgets AB'), nothing before. It's the listing-search shape the supply console uses for autocomplete.",
      notes: [
        { choice: 2, why: "%Nordic% matches 'NOT-Nordic Ltd' and 'Brand Nordic' — the unanchored pattern silently widens the roster. Anchors are the definition." },
        { choice: 3, why: "IN is exact membership — 'Nordic' alone matches nothing, because no operator is named just 'Nordic'. Prefix search is LIKE's job." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-18",
      prompt: "Average dispatch latency over the 82 fulfilled bookings is 2.98 days. Which expression computes it — and which silently rounds per booking first?",
      choices: [
        "AVG(julianday(shipped_at) - julianday(created_at))",
        "ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2)",
        "AVG(ROUND(julianday(shipped_at) - julianday(created_at)))",
        "SUM(julianday(shipped_at) - julianday(created_at)) / 82",
      ],
      answer: 1,
      why: "Fold the raw fractional diffs, average, then round ONCE at the edge — 2.98. The ROUND's position is the discipline: inside the AVG it rounds each booking first and the average drifts by accumulated rounding.",
      notes: [
        { choice: 0, why: "Right math, unbounded display: the client prints 2.9804347826… and the scorecard disagrees with the deck to the third decimal. Rounding is a display decision, made once." },
        { choice: 3, why: "The magic constant 82 duplicates the population the query already knows (COUNT of fulfilled rows) — one status change and the denominator lies. Let COUNT do the counting." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-19",
      prompt: "June's audit window is June 1 through June 30, timestamps included. Which WHERE keeps every June inspection?",
      choices: [
        "WHERE inspected_on BETWEEN '2024-06-01' AND '2024-06-30'",
        "WHERE inspected_on >= '2024-06-01' AND inspected_on < '2024-07-01'",
        "WHERE inspected_on LIKE '2024-06'",
        "WHERE MONTH(inspected_on) = 6",
      ],
      answer: 1,
      why: "The half-open interval includes every moment of June 30 — BETWEEN '2024-06-30' stops at midnight and drops that day's inspections. The last day of an audit window is where BETWEEN bites.",
      notes: [
        { choice: 0, why: "BETWEEN's upper bound is 2024-06-30 00:00:00 — any inspection timestamped later that day vanishes from the compliance pack. The drop is silent." },
        { choice: 2, why: "LIKE '2024-06' matches only the exact string — '2024-06-15' does NOT match a prefix pattern without the %, so the window prints nearly empty." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-20",
      prompt: "Two operators tie on revenue in the scorecard, and the board must print identically every morning. Which ORDER BY guarantees it?",
      choices: [
        "ORDER BY gross_revenue DESC",
        "ORDER BY gross_revenue DESC, s.name ASC",
        "ORDER BY RANDOM()",
        "ORDER BY rowid",
      ],
      answer: 1,
      why: "The secondary key on a stable attribute (name) settles every tie the same way on every run — the board is deterministic. Revenue ties alone leave the order to the engine's scan plan.",
      notes: [
        { choice: 0, why: "Tied revenue rows can print in either order depending on scan path — the artifact 'flips' with no data change, and the renewal meeting notices." },
        { choice: 2, why: "RANDOM() is the opposite of determinism — fine for sampling, never for a scorecard anyone reconciles between runs." },
      ],
      difficulty: "easy",
    },
    {
      id: "oyo-mcq-21",
      prompt: "The hygiene query uses `WHERE p.id NOT IN (SELECT product_id FROM order_items)` to find never-sold categories. One order_items row has product_id NULL. What does the query return?",
      choices: [
        "The never-sold categories, correctly",
        "Zero rows — every NOT IN comparison turns UNKNOWN against a NULL in the set",
        "An error about NULL in the subquery",
        "Only the categories with NULL ids",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: if x matches nothing else the comparison is still UNKNOWN, so WHERE drops every row — the report prints a clean sheet. NOT EXISTS or LEFT JOIN … IS NULL is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "That's the trap: it works on clean data for months. One NULL key and the anti-join silently dies — the missing-query-result IS the incident." },
        { choice: 2, why: "SQLite doesn't raise — the query runs and returns nothing. Error-based expectations are exactly why this bug survives code review." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-22",
      prompt: "A scorecard computes `avg_rate > (SELECT AVG(price) FROM products WHERE category = 'Villas')` — but no 'Villas' category exists. What does the report print?",
      choices: [
        "Every category — an empty comparison is TRUE",
        "Zero rows, silently — the scalar subquery returns NULL and every comparison is UNKNOWN",
        "A 'no such category' error",
        "The categories with NULL rates",
      ],
      answer: 1,
      why: "A scalar subquery over zero rows yields NULL, not an error — and x > NULL is UNKNOWN, so the WHERE passes nothing. The blank report lands exactly where the network question is loudest.",
      notes: [
        { choice: 0, why: "Comparison against NULL is never TRUE — the empty-set contract, not comparison logic, is the mechanism. 'Silently blank' is the symptom to memorize." },
        { choice: 2, why: "The category simply matches no rows — SQLite has no schema-level category validation. The failure is semantic, so nothing raises." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-23",
      prompt: "The supply packet stacks a budget-band branch and a mid-band branch, disjoint by definition. What does UNION (instead of UNION ALL) risk?",
      choices: [
        "A syntax error — UNION needs identical column names",
        "Silent dedupe — if a definition bug ever makes branches overlap, UNION deletes the evidence and the packet still balances",
        "Slower execution only — results are identical",
        "Column misalignment — UNION stacks columns, not rows",
      ],
      answer: 1,
      why: "UNION dedupes full rows across the whole stack. On disjoint branches it changes nothing today — which is the risk: it also cleans up tomorrow's overlap bug, and the packet never stops balancing.",
      notes: [
        { choice: 0, why: "UNION requires matching column COUNTS and compatible types — names come from the first branch, so differing aliases are fine. The stack runs either way." },
        { choice: 2, why: "The results are identical today, yes — that's the point. UNION ALL is chosen for what it refuses to hide, not for what it computes." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-24",
      prompt: "Day-over-day bookings per market: `LAG(created_at) OVER (ORDER BY created_at)` with no PARTITION BY. What went wrong?",
      choices: [
        "LAG needs a GROUP BY to work",
        "The lag crosses markets — Berlin's gap compares to Osaka's booking",
        "LAG returns the NEXT row, not the previous",
        "The first row errors out instead of returning NULL",
      ],
      answer: 1,
      why: "Without PARTITION BY the window is one ladder over the whole table — the delta column mixes markets. The comparison scope is the PARTITION clause's job, and the business definition lives there.",
      notes: [
        { choice: 2, why: "LAG looks back, LEAD looks forward — direction isn't the bug. Either way the missing partition corrupts the pairing." },
        { choice: 3, why: "The first row returns NULL for the lag — legal and expected. NULL means 'first in window', not an error to fix with COALESCE." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-25",
      prompt: "Per-market cancellation share: one analyst adds `WHERE status != 'cancelled'`... wait — they DIDN'T filter, and used `100.0 * SUM(status = 'cancelled') / COUNT(*)`. Their colleague filtered cancelled rows in WHERE instead. What did the colleague's version print?",
      choices: [
        "The same shares",
        "100% in every market — the denominator became only the cancellations",
        "0% in every market — the numerator became zero",
        "A division-by-zero error",
      ],
      answer: 1,
      why: "Filtering cancelled rows in WHERE removes them from BOTH numerator and denominator — each market's group holds only its cancellations, so the share is 100% by construction. A share's numerator must ride a CASE inside the fold, with the denominator's rows kept whole.",
      notes: [
        { choice: 0, why: "Same rows in, different populations counted — the filtered version computes share-of-cancellations-that-are-cancellations. The 6.8% network read and the 100% bug are one clause apart." },
        { choice: 3, why: "Every market has at least one cancelled booking on this db, so no group is empty — no zero-division, just a confident, wrong 100%." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-26",
      prompt: "The deck prints the budget-band average rate as 32. Another report says 32.06. The expression was `CAST(AVG(price) AS INTEGER)`. What happened?",
      choices: [
        "CAST rounds to the nearest integer — 32.06 legitimately rounds to 32",
        "CAST truncates — 32.06 becomes 32, and 32.9 would ALSO print 32",
        "AVG returned an integer because price is REAL",
        "The CAST silently failed and returned NULL",
      ],
      answer: 1,
      why: "CAST AS INTEGER truncates toward zero — it never rounds. Two decimals of rate precision died in a type change; the fix is ROUND(AVG(price), 2) at the display edge, once, deliberately.",
      notes: [
        { choice: 0, why: "Rounding and casting are different contracts: ROUND(32.06, 0) is 32.0, CAST is 32 — but for 32.9, ROUND gives 33 while CAST still gives 32. The band averages differ." },
        { choice: 2, why: "AVG over REAL returns REAL — 32.0625 stays REAL until something throws the decimals away. The CAST is that something." },
      ],
      difficulty: "hard",
    },
    {
      id: "oyo-mcq-27",
      prompt: "The operator scorecard paginates 2 per page. Which query returns the SECOND page (operators 3 and 4 by revenue)?",
      choices: [
        "LIMIT 2 OFFSET 2",
        "LIMIT 2, 2 — same thing, older syntax",
        "LIMIT 2 SKIP 2",
        "LIMIT 4",
      ],
      answer: 0,
      why: "LIMIT 2 OFFSET 2 skips the first two rows and returns the next two — the second page, provided the ORDER BY is deterministic (a tie-break), or pages overlap and drop rows as ties swap.",
      notes: [
        { choice: 1, why: "LIMIT 2, 2 means LIMIT offset=2, count=2 in SQLite — numerically identical here, but the argument ORDER flips in MySQL and the habit travels badly. Write LIMIT n OFFSET m." },
        { choice: 3, why: "LIMIT 4 returns pages one AND two — the report duplicates rows the recipient already has. Pagination without OFFSET is a re-send." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-28",
      prompt: "The latency report must show every booking's effective dispatch date — the shipped date, or the booking date as a placeholder when it hasn't shipped. Which expression does it?",
      choices: [
        "COALESCE(shipped_at, created_at)",
        "shipped_at OR created_at",
        "ISNULL(shipped_at, created_at)",
        "NVL(shipped_at, created_at)",
      ],
      answer: 0,
      why: "COALESCE returns the first non-NULL argument — the shipped date when it exists, the booking date as the stated placeholder when it doesn't. The placeholder policy is visible in the query, which is what makes it audit-safe.",
      notes: [
        { choice: 1, why: "OR is boolean logic, not a value selector — on TEXT dates this is a type joke that evaluates to 0 or 1. Fallbacks are COALESCE's contract." },
        { choice: 3, why: "NVL is Oracle/MySQL dialect — SQLite speaks COALESCE (and IFNULL). Dialect shopping is how a query dies on the first portable run." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-29",
      prompt: "A failed inspection gets a follow-up exactly 7 days out. Which expression computes the follow-up date from inspected_on?",
      choices: [
        "inspected_on + 7",
        "DATE(inspected_on, '+7 days')",
        "inspected_on + INTERVAL 7 DAY",
        "ADD_DAYS(inspected_on, 7)",
      ],
      answer: 1,
      why: "SQLite's DATE() with the '+7 days' modifier does calendar-aware arithmetic — Jan 28 becomes Feb 4, month lengths respected. The modifier string is the dialect; the function is the portability boundary.",
      notes: [
        { choice: 0, why: "Adding 7 to '2024-01-28' does string-to-numeric coercion and yields 2031 — a date that doesn't exist. TEXT dates need DATE(), not arithmetic." },
        { choice: 2, why: "INTERVAL is Postgres/MySQL syntax — SQLite has no INTERVAL keyword. The query fails to parse on the first non-portable run." },
      ],
      difficulty: "medium",
    },
    {
      id: "oyo-mcq-30",
      prompt: "The settlement feed logs 27 payment rows but the fold shows 26 distinct invoices. Which count pair exposes the double settlement?",
      choices: [
        "COUNT(*) and COUNT(DISTINCT invoice_id)",
        "SUM(amount_cents) and COUNT(*)",
        "MAX(invoice_id) and MIN(invoice_id)",
        "COUNT(DISTINCT amount_cents) twice",
      ],
      answer: 0,
      why: "COUNT(*) counts rows (27), COUNT(DISTINCT invoice_id) counts invoices (26) — the 1-row gap is the split settlement, found without naming which invoice. The pair is the reconciliation's first probe.",
      notes: [
        { choice: 1, why: "The dollar sum is the same whether one invoice paid twice or not — money doesn't reveal row duplication. Row counts do." },
        { choice: 3, why: "Distinct amounts can collide legitimately (two invoices, same cents) and misses the identical double-payment — the id is the grain, not the value." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-oyo-3",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The band-boundary census",
      brief:
        "OYO-flavored brief on the storefront db: revenue management wants the band census as a CASE-classified fold — every room category dropped into its band by the boundary the pricing lead owns, then folded per band: how many categories, how many rooms stocked, what the average rate prints. The boundary is fixed in advance and quoted verbatim: budget is price strictly under 50, everything else is mid — there is no premium band on this network (the most expensive category tops out at 199.99), and the 49.00 category stays budget by definition. Probed facts: budget holds 8 categories worth 2095 rooms at an average rate of 32.06; mid holds 8 categories worth 750 rooms at 111.5. Budget-first is the brand promise — the census either proves it or the band definitions move.",
      ask: "Return one row per band: band label, room_categories, rooms_stocked and avg_rate (2dp), budget row first.",
      template:
        "SELECT CASE WHEN p.price < {1} THEN 'budget' ELSE '{2}' END AS band,\n       COUNT(*) AS room_categories,\n       SUM(p.stock) AS rooms_stocked,\n       ROUND(AVG(p.price), 2) AS avg_rate\nFROM products p\nGROUP BY band\nORDER BY band {3};",
      slots: [
        {
          answer: "50",
          kind: "number",
          label: "the band boundary",
          noVerify: true,
          why: "The boundary the pricing lead owns, quoted verbatim: budget is price strictly under 50. Dropped to 40, the 49.00 category flees to mid and the budget census loses a row; raised to 200, everything is budget and the census proves nothing.",
        },
        {
          answer: "mid",
          kind: "keyword",
          label: "the upper-band label",
          why: "The ELSE branch is the complement band — 'mid' is what the revenue team calls it. A stray label ('economy', 'other') rebrands the band in every downstream slide, and a label that collides with 'budget' would collapse the census to one row.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the budget-first direction",
          why: "Alphabetically 'budget' sorts before 'mid', so ASC leads the read with the brand's home band — budget 8 / 2095 / 32.06, then mid 8 / 750 / 111.5. DESC would open the pack with the band the brand is NOT.",
        },
      ],
      distractors: ["40", "200", "economy", "DESC"],
      walkthrough:
        "A single-table fold where the CASE is the definition. The CASE WHEN drops all 16 room categories into two bands at the boundary the pricing lead fixed — strictly under 50 is budget, the ELSE catches the rest — and GROUP BY band folds the result: budget 8 categories / 2095 rooms stocked / 32.06 average rate, mid 8 / 750 / 111.5. COUNT(*) counts categories, SUM(p.stock) counts rooms, and AVG(p.price) rounded once is the band's average rate — the numbers the brand promise is judged against. The distractors die honestly: the threshold 40 demotes the 49.00 category to mid (7 and 9, averages drifting with it); 200 sweeps every category into budget because the network tops out at 199.99 — a one-band census that proves nothing; a different ELSE label rebrands the mid band everywhere it's quoted; DESC leads the pack with the mid band the brand deliberately undersells. Note the boundary is strict: no category prices at exactly 50 today, but the definition still says < — the day one lands at 50.00, the census must not move it.",
    },
    {
      id: "cs-oyo-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The repeat-guest cadence read",
      brief:
        "OYO-flavored brief on the storefront db: the growth review wants the repeat-guest cadence — for the network's most frequent guest, the gap in days between consecutive bookings, because repeat demand is the demand the supply plan can actually bank on. The guest is unambiguous: one traveler accounts for 24 of the db's 103 bookings (the next is at 17). Probed facts for that guest's ledger: 24 bookings running 2024-01-02 through 2025-02-19; the gaps between consecutive stays run 20, 29, 5, 9, 13, 18, 12, 25, 36, 34, 12, 22, 13, 1, 14, 51, 21, 11, 3, 20, 21, 17, 7 days — average 18.0, the longest lull 51 days (2024-09-21 to 2024-11-11), the tightest turnaround 1 day. The first stay has no previous booking — its gap prints NULL and that NULL is the honest 'start of ledger', not a bug.",
      ask: "Return the guest's first five stays: stay_date and gap_days to the NEXT booking (1dp), earliest stay first.",
      template:
        "SELECT o.created_at AS stay_date,\n       ROUND(JULIANDAY({1}(o.created_at) OVER (ORDER BY o.created_at)) - JULIANDAY(o.created_at), 1) AS gap_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.name = '{2}'\nORDER BY stay_date {3}\nLIMIT {4};",
      slots: [
        {
          answer: "LEAD",
          kind: "keyword",
          label: "the next-stay window",
          why: "LEAD fetches the FOLLOWING stay's date onto the current row, so the gap reads forward — 'how long until they came back'. LAG would measure 'how long since the previous stay': the same ledger shifted one row, with the NULL migrating to the first stay and every gap reassigned.",
        },
        {
          answer: "Alice Chen",
          kind: "keyword",
          label: "the top-repeat guest",
          why: "The guest with 24 bookings — the network's most bankable repeat demand. Any other name changes the ledger: Emma Wilson's 17 bookings print a different cadence entirely, and the growth review is asking about THIS traveler's rhythm.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the ledger-forward direction",
          why: "The cadence reads like a diary: earliest stay first, gaps growing and shrinking as the guest returns. DESC prints the ledger backwards — the window inside the query still walks forward, so the output rows would contradict the gap column's own direction.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the five-stay cut",
          noVerify: true,
          why: "The review asked for the first five stays — a sample of the cadence, not the whole 24-row ledger. LIMIT 3 under-delivers a ledger the reviewer will just re-run; no LIMIT floods the slide with 24 rows.",
        },
      ],
      distractors: ["LAG", "Emma Wilson", "DESC", "3"],
      walkthrough:
        "A window over one guest's ledger, where direction is the definition. The join keeps only the top-repeat guest's rows — 24 bookings — and LEAD(created_at) OVER (ORDER BY created_at) lays the NEXT stay's date on each row; the gap is JULIANDAY(next) minus JULIANDAY(current), rounded once at the edge. Ordered ASC and cut at 5, the output reads 2024-01-02 gap 20, then 29, 5, 9, 13 — a guest who comes back within a month and twice within a week. The distractors all change the story: LAG shifts the whole column one row down — every gap reassigns to the wrong stay and the NULL lands on the ledger's first row where the 20-day gap belongs; Emma Wilson's ledger is a different cadence with 17 bookings; DESC fights the window's internal ORDER BY, printing rows backwards while the gaps still read forward; LIMIT 3 amputates the sample the review asked for. The NULL on the last row (no next stay yet) is the honest 'still to return' — report it, never COALESCE it into a fake zero-day gap.",
    },
    {
      id: "cs-oyo-5",
      tier: "medium",
      topic: "j7",
      universe: "catalog",
      title: "The per-class demand fold",
      brief:
        "OYO-flavored brief on the storefront db: the category review wants demand folded at the room-CLASS grain — the 16 room categories roll into 7 classes (Audio, Wearables, Video, Electronics, Accessories, Apparel, Fitness), and the supply plan reads one row per class: how many distinct room categories it holds, how many room-nights sold, what gross revenue moved through it. The read rides the two-hop chain products → order_items, and the money lives in the line items: SUM(unit_price × quantity) per class. Probed facts: Audio leads revenue at 11744.01 on 97 room-nights from 3 listings; Accessories moves the most room-nights (121) but only 3294.29 in revenue — the low-rate/high-turnover class; Fitness is the tail: 1 listing, 27 room-nights, 863.91. The seven classes sum to the network's 34833.28 — the fold either reconciles to that or the grain is wrong.",
      ask: "Return one row per room class: room_class, listings (distinct categories), room_nights, gross_revenue (2dp); biggest revenue first, top 3 classes.",
      template:
        "SELECT p.category AS room_class,\n       {1}(DISTINCT p.id) AS listings,\n       {2}(oi.quantity) AS room_nights,\n       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS gross_revenue\nFROM products p\nJOIN order_items oi ON oi.product_id = {3}\nGROUP BY p.category\nORDER BY gross_revenue {4}\nLIMIT {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the listings census",
          why: "COUNT(DISTINCT p.id) folds the line-item fan-out back to distinct room categories per class — Audio 3, Fitness 1. AVG(DISTINCT p.id) executes but averages id VALUES (a meaningless number), and SUM would add ids the same way: only COUNT is a census.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the room-nights adder",
          why: "SUM(oi.quantity) adds the units on every line item — Accessories 121, Audio 97. COUNT(oi.quantity) would count LINES (a booking with quantity 3 counts once, not three room-nights) — the demand read would undercount every multi-unit stay.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the chain's join key",
          why: "The chain is products → order_items ON oi.product_id = p.id — category → its line items. Joining on p.supplier_id instead matches line items against operator ids: a different (and wrong) demand fold that happens to still run.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the revenue-leader direction",
          why: "The review ranks classes by stake: Audio 11744.01, Wearables 6929.12, Video 5198.41 lead. ASC would crown Fitness (863.91) — a correct query answering the opposite question, and the supply plan would push inventory into the tail.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the top-three cut",
          noVerify: true,
          why: "The review takes the three revenue-leading classes. LIMIT 4 drags Electronics (4818.61) onto a slide nobody budgeted; LIMIT 2 drops Video and the mid-table never gets read.",
        },
      ],
      distractors: ["AVG", "p.supplier_id", "ASC", "4"],
      walkthrough:
        "The two-hop chain folded at the class grain, with every aggregate defending its own column. Products join their line items on p.id; GROUP BY p.category folds 251 line items into 7 class rows. Then the columns part ways: COUNT(DISTINCT p.id) is listings (3/2/2/3/3/2/1), SUM(oi.quantity) is room-nights (Audio 97, Accessories 121 — turnover and revenue lead different classes, which is the point of printing both), and SUM(unit_price × quantity) rounded once is gross revenue, reconciling to 34833.28 across all seven. ORDER BY gross_revenue DESC + LIMIT 3 crowns Audio, Wearables, Video. The distractors die honestly: AVG(DISTINCT p.id) runs and prints averaged ids where listings belong — a legal query lying legally; joining on p.supplier_id matches line items to operator ids and quietly folds a different network (every cell changes); ASC inverts the review to crown the 863.91 tail; LIMIT 4 pads the cut. The follow-up the interview is waiting for: one class has a single listing — concentration, not a bug, but the kind of row the supply review exists to notice.",
    },
    {
      id: "cs-oyo-6",
      tier: "hard",
      topic: "t4",
      universe: "month-close",
      title: "The settlement calendar",
      brief:
        "OYO-flavored brief on the storefront db: finance close wants the settlement calendar — payments bucketed by the month they CLEARED, one row per month: how many settlements moved, how many dollars cleared, printed from integer cents with the /100.0 discipline. The calendar is the reconciliation spine: the close ties each month's cleared dollars to the operator statements, and the %Y-%m spine is what makes 2024 and 2025 comparable instead of collapsed. Probed facts: 27 settlements clear across 13 months, 2024-02 through 2025-02; the busiest dollar month is 2024-09 at 8420.5 (3 settlements), the quietest 2024-02 at 2430.0 (1 settlement); the first three months of the ledger clear 2430.0, 7993.0 and 4231.0. The trap the close keeps catching: '%m' alone folds January-2024 with January-2025 into one bucket — the cross-year leak that makes the tie-out lie.",
      ask: "Return the first three settlement months: month, settlements and dollars (2dp), earliest month first.",
      template:
        "SELECT STRFTIME('{1}', paid_on) AS month,\n       COUNT(*) AS settlements,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS dollars\nFROM payments\nGROUP BY month\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the year-bearing bucket",
          why: "STRFTIME('%Y-%m', paid_on) yields '2024-02' — year and month together, 13 distinct buckets across the ledger. '%m' alone yields '02' — 12 buckets with both Februaries folded, the cross-year leak that corrupts the tie-out.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar-forward direction",
          why: "The close reads the calendar forward: 2024-02 first (2430.0), then 2024-03 (7993.0), 2024-04 (4231.0). DESC opens on 2025-02 — the newest month first is a different report than the one the close reconciles against.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the three-month cut",
          noVerify: true,
          why: "The close samples the first three cleared months as the tie-out anchor. LIMIT 5 pads the pack with months the reconciliation hasn't budgeted; LIMIT 1 drops the comparison months that make a tie-out meaningful.",
        },
      ],
      distractors: ["%m", "%Y", "DESC", "5"],
      walkthrough:
        "A single-table fold where the bucket string is the whole audit. STRFTIME('%Y-%m', paid_on) slices the clearing date into year-bearing months — 13 distinct buckets, 2024-02 through 2025-02 — and GROUP BY month folds 27 payment rows into them: COUNT(*) is the settlement census, SUM(amount_cents)/100.0 rounded once is the cleared dollars, the .0 inside the division doing the cents-to-dollars discipline the close is built on. Ordered ASC and cut at 3, the pack prints 2024-02 / 1 / 2430.0, 2024-03 / 3 / 7993.0, 2024-04 / 2 / 4231.0. The distractors die honestly: '%m' collapses the two Februaries (and any other shared month) into one bucket — 12 rows that silently double-count months and break the tie-out; '%Y' folds the whole ledger into 2 rows, a calendar with no months in it; DESC reverses the spine and opens on 2025-02; LIMIT 5 pads the sample. The habit being graded: the bucket IS the definition of 'month' — and a definition that can't tell 2024-02 from 2025-02 is a reconciliation waiting to be wrong.",
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
    { slug: "product-sales-analysis-i", why: "Line-item revenue joined back to listings — the per-category money fold that opens every category review at this network." },
    { slug: "product-sales-analysis-v", why: "Category demand with filters stacked on the fold — the sell-through drill where the WHERE's population decides the ratio." },
    { slug: "calculate-product-final-price", why: "Discounted-rate computation per listing — the realized-rate read behind the band census: list price is not what the guest paid." },
    { slug: "customers-who-never-order", why: "Zero-demand anti-join — guests who never booked, the demand-side twin of the never-sold listing hygiene read." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax over booking counts — finding the network's most frequent guest, the top of the repeat-demand ledger." },
    { slug: "unique-orders-and-customers-per-month", why: "Month-grain double census — bookings and distinct guests per month, the cadence read the calendar fold starts from." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest-event per listing — recency per room category, the freshness column the audit cadence report carries." },
    { slug: "recyclable-and-low-fat-products", why: "Two-flag predicate census — the standard-checks drill: listings passing BOTH audit flags, AND logic at row grain." },
    { slug: "big-countries", why: "Threshold floor with a population statement — supply above a floor: which markets clear the bar and which the census reports as under." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share-of-population math with honest rounding — the coverage-percentage shape behind every quality-gate report." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT manifest per day — the nightly bookings manifest: one row per night, every listing folded into a readable cell." },
    { slug: "daily-leads-and-partners", why: "Per-partner census with condition flags — the operator scorecard's warm-up: counts, shares and the no-special-offer style flags." },
    { slug: "immediate-food-delivery-i", why: "Immediate-versus-scheduled share — the instant-booking read: share of stays booked same-day, folded with the right denominator." },
    { slug: "not-boring-movies", why: "Compound row filters with exclusions — the listing-hygiene drill: exclude the boring rows and prove what survives." },
    { slug: "combine-two-tables", why: "LEFT JOIN basics with NULL payloads — the always-visible-roster join: every operator appears, demanded or not." },
    { slug: "article-views-i", why: "Distinct-actor census on a shared resource — repeat-viewer reads: which guests touched the same property, deduped honestly." },
  ],
};
