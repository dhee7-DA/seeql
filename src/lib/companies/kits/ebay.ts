// eBay — kit 5 of the E-commerce & Marketplace domain, closing Batch B and
// taking the E-commerce domain to 5/5 live kits. The auction/listing
// marketplace: buyer-seller trust graphs, per-seller leaderboards and
// anti-join reads. The pool is 16 of eBay's 19 registry-tagged problems —
// the strongest tagged pool in the domain after Amazon. Case studies run on
// the storefront db with probed figures (scripts/tmp-ecom-facts*.ts).
//
// EXPANDED to the 3x kit (batch E2 expansion, append-only): 6 brief paras,
// 4 day-in-life paras, 12 metrics, 15 topics, 24 theory (t1–t24), 30 MCQs,
// 6 cases (cs-ebay-3..6 added on topic families t5/t3/j5/t7 — distinct from
// the original j7/s6), 32 problems. eBay's 16 tagged sql rows were already
// fully consumed by the original pool; the 16 appended problems and the new
// topic slugs are theme-curated from other tagged pools and the theme menu
// in scripts/company-pools.md (sql rows only). New-case figures come from
// scripts/company-facts.md; note the facts file's invoice figures are
// dollars — raw finance columns are integer cents (divide by 100.0).

import type { CompanyKit } from "../types";

export const ebayKit: CompanyKit = {
  id: "ebay",
  domainId: "ecom",
  name: "eBay",
  tagline: "Auctions, listings and buyer-seller trust",
  accent: "text-rose-400",

  brief: [
    "**eBay** is the original online marketplace — a quarter-century of auctions, fixed-price listings and the trust machinery (ratings, guarantees, returns) that lets strangers trade at scale. Its data shape is distinct from first-party retail: eBay doesn't own the inventory, sellers do, so every analytical question is **two-sided** — buyer demand on one side, seller supply and reputation on the other. The tables reflect it: listings (with their sellers), transactions, feedback events, and the bridge tables between them. An analyst here spends the day moving between the two sides of that graph, and the SQL is correspondingly join-heavy: per-seller leaderboards, trust-tier censuses, and the famous {rose:'sellers with no sales'} anti-join family.",
    "The data org pairs a long-tenured analytics culture with modern platform investment. Category teams (motors, fashion, collectibles, electronics) own their demand reads; trust teams own the feedback and disputes graphs; pricing and search-relevance teams live on experiment readouts. Because the marketplace is two-sided, a recurring analytical discipline is **population honesty**: when you report seller performance, which sellers are IN the report — *everyone with a listing, or only those with a transaction?* eBay's screens test exactly that instinct, because a leaderboard that silently drops {rose:never-sold sellers} changes the business conclusion it feeds.",
    "Interview style is classic and drill-heavy — eBay's tagged pool in interview-prep circles is one of the deepest anywhere, and this app's registry carries **19** of them. Screens run the canon: sales-analysis joins, per-group top-N with ties, anti-joins for the never-transacted, `CASE` classifications, and rounded-rate arithmetic. The interviewers are fluent in the follow-ups: *'what if two sellers tie on the boundary?'*, 'does your percentage divide by placed or completed?', 'your `INNER JOIN` — did the missing sellers vanish on purpose?'. Candidates who know the canon AND narrate the grain consistently outperform.",
    "Preparation strategy: this is the kit to drill canon problems on — **sixteen of eBay's tagged problems** are curated below, spanning the full arc from first join to window escalation. Work the topics in order, then run all six case studies on the live storefront db: one rebuilds the {emerald:trusted-seller bench} report its trust reviews open with, the other rebuilds the {amber:price-band ladder} its category teams ship to merchandising, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting...",
    "The finance machinery is the quieter half of the marketplace and the sharper half of the SQL. eBay moved payments in-house (managed payments), so the settlement pipeline — invoices issued, payments settled, final-value fees taken, refunds routed — is internal data now, and its reconciliation discipline is exactly what the storefront db models: **28 invoices against 27 payment rows**, where the coverage census finds {emerald:21 exact}, one partial (4,000.00 of 6,148.00), and {rose:six invoices with no payment row at all} — including one marked 'paid' with zero payment rows behind it. The ledger's trial balance (**debits 181080 = credits 181080, delta 0**) proves the books fold; *it does not prove they're clean*. Analysts here learn two habits from that table pair: every money column is integer cents until divided by 100.0, and every 'paid' claim is checked against the rows that back it.",
    "Preparation strategy at full depth: the kit now spans the whole arc — **fifteen topics** from first join to clinic moves, **twenty-four theory questions**, **thirty graded MCQs**, and **six case studies** on the live storefront db. The four new cases extend the topic families: a tie-honest buyer leaderboard (ranking windows), the ship-latency read by region (date math), the unpaid-invoice sweep (the finance anti-join), and the month-over-month revenue delta (`LAG` over a staged monthly fold). Work the topics in order, then the new theory — pipeline order, window frames, set verbs, NULL policy, performance instincts — and run all six cases against the db until the population question ('who is IN this report?') is reflex. The interviewers' follow-ups never change; the prepared candidate has already answered them inside the query.",
  ],

  dayInLife: [
    "**09:00 —** The day opens with the marketplace census. An analyst on a category team runs the standing folds: active listings, sold-through per category, new sellers onboarded versus lapsed — each a `GROUP BY` over the listing and transaction tables, each with a population definition someone will ask about. The first fire of the day is usually a bridge mismatch: transactions that reference listings missing from the catalog feed, or sellers whose feedback events arrive before their onboarding rows. The analyst who can write the failure census — which side is missing, how many rows, since when — *owns the morning*.",
    "**11:30 —** Midday is two-sided analytics. A trust partner wants the distribution of seller ratings by category with the {rose:never-rated sellers} counted as their own bucket; a merchandising manager wants the **price-band ladder** — how many listings live under 50, between 50 and 150, above — to plan a fee promotion; a search partner wants per-seller sell-through with a minimum-listing threshold so hobby accounts don't dominate the read. Each ask is a join, a fold and a population decision — and the analyst writes the definition into the query itself, because at eBay *the phrase 'all sellers' is a claim that gets audited*.",
    "**15:00 —** The afternoon tilts toward trust machinery and experiments. Feedback graphs get folded: ratings per seller, averages with tie-aware ranks, disputes per thousand transactions. A/B readouts compare promoted-listing lift with honest control populations. The weekly rhythm ends in the category review where **every leaderboard has a tie-breaker rule stated in its footer**. The best-prepared candidate knows this rhythm: eBay SQL is two-sided SQL — every question has a buyer-side and a seller-side answer, and *the population you choose decides which one you gave*.",
    "**16:30 —** On month-end days this hour belongs to the close, and the close is a reconciliation festival. The analyst runs the AR sweep — {rose:six invoices without a payment row}, 15,217.00 in dollars, one of them marked 'paid' — then the coverage census (**21 exact**, one partial, six none), then the ledger's trial balance, where debits and credits must fold to zero before any deck ships. Expense folds go out with it: 36 expense rows across rent, ads, travel and tools, month-bucketed against the order trend so burn and {amber:GMV} land on the same calendar axis. The close's lesson is the kit's thesis in miniature: *the numbers that survive review are the ones whose populations, units and joins were written into the query from the start*.",
  ],

  metrics: [
    { name: "GMV", what: "Gross merchandise volume across all listings — the marketplace headline, folded from transactions rather than owned inventory." },
    { name: "Sell-through rate", what: "Sold listings ÷ active listings, per category and seller. The two-sided health metric — a ratio whose denominator population is always the first interview follow-up." },
    { name: "Seller rating", what: "Average feedback score per seller, with the never-rated counted deliberately. The trust graph's headline — and a tie-aware ranking drill in production." },
    { name: "Trusted-seller share", what: "Sellers above the rating threshold ÷ all sellers with listings. The case study rebuilds its bench on the live db." },
    { name: "AOV", what: "Average transaction value per order — watched per category and price band; the auction mix makes medians matter as much as means here." },
    { name: "Listing freshness", what: "Share of listings created in the last 30 days. The supply-pipeline metric that predicts category health before sales do." },
    { name: "Dispute rate", what: "Disputes per thousand transactions, per seller tier. The trust-cost metric — a conditional count ratio with a per-thousand scale." },
    { name: "Price-band mix", what: "Listing count per price band (budget / mid / premium). The case study rebuilds its ladder — a CASE-classified census merchandising consumes." },
    { name: "Take rate", what: "Fee revenue ÷ GMV — the marketplace's own slice of two-sided volume. Final value fees vary by category and seller standing, so the take-rate read is a conditional fold per band, never one division." },
    { name: "Buyer concentration", what: "Share of GMV from the top of the spend curve. On the live db, buyers whose lifetime spend clears 3,000.00 are 63.5% of revenue — a Pareto read that decides where loyalty spend goes." },
    { name: "AR exposure", what: "Invoices with no payment behind them — count and dollars. The close runs it as an anti-join (6 invoices, 15,217.00 on the live db) and reads the ones marked 'paid' as anomalies, not accidents." },
    { name: "Ship latency", what: "Created→shipped days on orders that actually shipped: average 2.98, range 2–4. The fulfillment clock — julianday math with the NULL guard that keeps pending and cancelled out of the population." },
  ],

  topics: [
    {
      name: "Listing-to-sale joins at two grains",
      why: "The daily bread: transactions joined to listings joined to sellers, where the listing grain and the transaction grain differ. eBay opens screens here because the first follow-up — 'one row per what?' — decides whether the whole report means anything.",
      slugs: ["product-sales-analysis-i", "sales-analysis-i", "sales-person"],
    },
    {
      name: "Seller leaderboards & the volume argmax",
      why: "Top seller by transactions, best-rated per category, most listings moved — leaderboard reads are eBay's signature. The drill is choosing the fold key deliberately and resisting LIMIT until the sort is honest.",
      slugs: ["sales-analysis-ii", "customer-placing-the-largest-number-of-orders", "rank-scores", "repeat-purchase-rate"],
    },
    {
      name: "Per-group top-N and the tie-proof cut",
      why: "Top two years per product, top three sellers per category — the aggregate-then-rank escalation eBay runs on every leaderboard, with ties as the real test: ROW_NUMBER for exact cuts, DENSE_RANK for tiers, RANK for everyone-at-the-rank.",
      slugs: ["product-sales-analysis-iii", "department-top-three-salaries", "sales-analysis-iii"],
    },
    {
      name: "Anti-joins: sellers with no sales",
      why: "The famous question and a real workflow: listings that never transacted, sellers with zero sales, buyers who registered and vanished. LEFT JOIN + IS NULL (or NOT EXISTS) is eBay's most-asked missing-data shape.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "NULL policy on the trust graph",
      why: "A seller with no rating yet, a transaction with no feedback, a buyer with no verified address — legitimate NULLs everywhere. eBay checks whether you report them as their own bucket or lose them to a careless WHERE.",
      slugs: ["employee-bonus", "confirmation-rate", "calculate-special-bonus"],
    },
    {
      name: "CASE classification & trust tiers",
      why: "Trusted / standard / watch tiers, price bands, condition buckets — eBay's reports classify before they count. The CASE-when GROUP BY axis is a signature shape, and the bucket edges must be half-open and exhaustive.",
      slugs: ["tree-node", "count-salary-categories", "type-of-triangle", "weather-type-in-each-country", "rfm-segmentation"],
    },
    {
      name: "Ratios & rounded shares",
      why: "Confirmation rates, sold-through percentages, dispute rates per thousand — eBay's ratios punish integer division and drifting denominators. The house habit: 100.0 (or 1000.0) before the division, population fixed before the ratio, ROUND last.",
      slugs: ["queries-quality-and-percentage", "percentage-of-users-attended-a-contest", "average-selling-price", "basket-depth-aov"],
    },
    {
      name: "Range joins & banded comparisons",
      why: "Listing price bands against transaction amounts, fee schedules applied by tier — eBay's operations questions join on RANGES, not keys. The non-equi join band shape is a favorite escalation.",
      slugs: ["rectangle-area", "second-highest-salary", "article-views-ii"],
    },
    {
      name: "Aggregation with business formulas",
      why: "Points, penalties, weighted scores — eBay's category metrics bolt formulas onto grouped counts. The drill is computing the formula at the right grain: per row, per group, or per league table.",
      slugs: ["team-scores-in-football-tournament", "the-category-of-each-member-in-the-store", "apples-and-oranges"],
    },
    {
      name: "Attribution & multi-touch credit",
      why: "Which touchpoint sold the item — eBay's ads questions spread credit across interactions. The linear-credit fold is a conditional-sum over manufactured pairs, and the denominator conversation is where candidates separate.",
      slugs: ["linear-multi-touch", "first-last-touch-attribution", "email-engagement-funnel"],
    },
    {
      name: "Month buckets & the marketplace calendar",
      why: "Marketplace reads live on the calendar: monthly GMV folds, weekday traffic mixes, 30-day listing-freshness windows. The drill is bucketing text timestamps into 'YYYY-MM' (SUBSTR or STRFTIME), then folding and sorting the buckets honestly — including the months where cancellations spike. eBay's screens escalate bucket → fold → delta, and the calendar axis is where date-grain bugs hide.",
      slugs: ["list-the-products-ordered-in-a-period", "sales-by-day-of-the-week", "find-golden-hour-customers"],
    },
    {
      name: "Sequential reads: LAG, LEAD and the row before",
      why: "Month-over-month deltas, reactivation gaps, next-order intervals — every trend read at eBay compares a row with the row before it. LAG/LEAD keep every row while adding the neighbor, and the first/last NULLs must be presented deliberately, not papered over with zeros. The drill: compute the delta at the right grain — per month, per seller, per buyer — and guard the sparse-calendar lie where a missing month fakes a collapse.",
      slugs: ["week-over-week-churn", "growth-accounting", "product-price-at-a-given-date"],
    },
    {
      name: "Set thinking: stacks, overlaps and differences",
      why: "Two-sided marketplaces are set-shaped: the buyer leaderboard and the seller leaderboard are different populations over the same events. UNION ALL stacks honest raw legs, UNION dedupes (and lies by a row when one account is both), INTERSECT finds the overlap, EXCEPT finds who's missing. eBay drills the set verbs because 'which population is NOT in this report' is the trust question written in SQL.",
      slugs: ["movie-rating", "monthly-transactions-ii", "customers-who-bought-a-and-b-not-c", "keep-latest-dedupe"],
    },
    {
      name: "Subqueries & WITH staging",
      why: "The escalation tier: compare each order to the marketplace-wide AOV (a scalar subquery), find buyers whose spend crosses a threshold (IN/EXISTS), stage a monthly fold before ranking it (derived table or CTE). eBay's mid-screens assume you can nest without losing the population, and the follow-up is always 'what does the inner query return?' — narrate it before you nest it.",
      slugs: ["market-analysis-i", "game-play-analysis-iv", "immediate-food-delivery-ii", "product-sales-analysis-ii"],
    },
    {
      name: "One-pass censuses & string folds",
      why: "Operational reports count four statuses, three bands and two populations in a single scan — FILTER (WHERE) and SUM(CASE) are the one-pass forms, and GROUP_CONCAT folds a seller's catalog into one cell for the merch sheet. The drill is keeping every metric on the SAME fold and population, so the census's columns can't quietly disagree with each other.",
      slugs: ["group-sold-products-by-the-date", "reformat-department-table", "null-blank-audit", "article-views-i"],
    },
  ],

  theory: [
    {
      id: "ebay-t1",
      q: "Two-sided population honesty: your 'seller performance' report joined sellers to transactions with an INNER JOIN. Which sellers vanished, and is that the report the business asked for?",
      a: "The INNER JOIN keeps only sellers with at least one transaction — every never-sold seller vanished, and with them the marketplace's actual health question. 'Seller performance' for a two-sided marketplace usually means performance OF THE BENCH: sellers with sales measured on their sales, sellers without sales present as zero-sale rows (LEFT JOIN from sellers, COALESCE the transaction columns, GROUP BY keeps them via a NULL bucket or an explicit zero). The eBay-flavored rule: decide the population FIRST — 'all sellers with listings' versus 'sellers with transactions this period' — and make the join type express that decision. The interview killer is the casual answer 'I used INNER because it's a performance report': the missing sellers are often the story (supply oversupply, churn risk), and dropping them launders the marketplace's problem out of the report.",
      tag: "joins",
    },
    {
      id: "ebay-t2",
      q: "The top-two-sellers query returns three sellers. Explain the tie mechanics, then give the two legitimate fixes and when each is right.",
      a: "Two sellers tie at the second-place value, and ORDER BY + LIMIT 2 keeps both (or cuts one arbitrarily under an unstable sort) — LIMIT cuts POSITIONS, not ties. Fix one: deterministic exact cut — ROW_NUMBER() OVER (ORDER BY metric DESC, seller_id) = 2 keeps exactly one seller per rank with a declared tie-breaker; right when the business needs exactly N rows (payout slots, display limits). Fix two: everyone-at-the-rank — RANK() <= 2 or DENSE_RANK() <= 2 returns all tied sellers deliberately; right when the metric is the point (everyone with the second-best score belongs in a 'top tier'). The wrong fix is nudging LIMIT to 3 or 1. eBay drills this because seller leaderboards tie constantly, and 'exactly two' versus 'everyone at rank two' is a policy a product manager owns — the candidate's job is to surface the choice, not to guess it.",
      tag: "windows",
    },
    {
      id: "ebay-t3",
      q: "Compute each seller's sold-through rate: transactions ÷ active listings. Where do the two sides live, and what are the two denominator decisions that change the number?",
      a: "Two populations, two folds, one ratio. The numerator folds the transactions table by seller (COUNT of that seller's transactions); the denominator folds the listings table by seller (COUNT of active listings); the ratio joins the two folds back on seller_id — or builds both as conditional counts over one joined grain if the schema allows. Decision one: the denominator's population — ALL listings ever, or ACTIVE listings (unsold and unexpired)? The active-only denominator makes the rate read high for sellers whose expired listings vanish from the count. Decision two: the time window's alignment — numerator and denominator must cover the SAME window, or the rate mixes periods. The strong answer states both decisions out loud and offers the population query that shows how many sellers each choice includes. eBay's trust teams ship this exact ratio weekly; the disputes are always about the denominator, never the arithmetic.",
      tag: "aggregation",
    },
    {
      id: "ebay-t4",
      q: "A seller has listings but zero transactions. Trace that seller through LEFT JOIN, INNER JOIN, and NOT IN — what happens in each, and which shape survives?",
      a: "LEFT JOIN from sellers: the seller survives with NULL transaction columns — COUNT(transaction_id) reads 0, COUNT(*) on the joined row reads 1 (the seller row itself), and the IS NULL test finds them directly. INNER JOIN: the seller vanishes before any aggregation — the zero-sale sellers are gone from every downstream count, silently. NOT IN against the sold-seller subquery: correct ONLY if the subquery can't return NULL — one NULL in the list and the NOT IN returns nothing at all (UNKNOWN poisons the membership test). The surviving shapes: LEFT JOIN + IS NULL, or NOT EXISTS (NULL-immune by construction). eBay asks this exact trace because 'sellers with no sales' is on its tagged list and in its weekly reports — and the NOT IN trap has emptied real dashboards. Naming the COUNT(*)-on-a-LEFT-JOIN-reads-1 subtlety is the detail that separates drilled candidates from lucky ones.",
      tag: "joins",
    },
    {
      id: "ebay-t5",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) on a seller's feedback table — assign each a trust-graph meaning.",
      a: "COUNT(*) counts feedback events — the seller's transaction-adjacent volume. COUNT(rating) counts NON-NULL ratings — the rated subset; the gap between them is the unrated share, itself a trust signal (buyers who don't rate may be the unhappy ones). COUNT(DISTINCT buyer_id) counts unique raters — the protection against one buyer submitting fifty feedbacks and owning the average. The trust-graph twist: 'rating' as a metric usually wants the DISTINCT-buyer denominator, and the naive COUNT(*) average can be gamed or skewed by repeat buyers. The strong answer assigns each form a named meaning — volume, rated volume, unique voices — and notes WHERE the unrated live: excluded from AVG automatically (NULL inputs skipped), visible only if the report computes the gap deliberately.",
      tag: "aggregation",
    },
    {
      id: "ebay-t6",
      q: "Build the price-band ladder: listings under 50, 50 to under 150, 150 and above. Why is CASE the right GROUP BY axis, and what makes the ladder auditable?",
      a: "CASE builds the classification inline — CASE WHEN price < 50 THEN 'budget' WHEN price < 150 THEN 'mid' ELSE 'premium' END — and GROUP BY on that expression (or its alias) folds every listing into exactly one band. Auditable means three properties, said aloud: half-open edges (price < 150 is 'mid', not BETWEEN 50 AND 149.99 — no rounding gaps at the seam), exhaustive coverage (the ELSE guarantees every price lands somewhere — without it, NULL prices vanish from the ladder silently), and a reconciliation check (SUM of the band counts must equal COUNT(*) of the table — one query, instant unit test). The eBay-flavored trap: NULL prices — CASE comparisons against NULL are UNKNOWN, so a NULL price falls through every WHEN and lands in the ELSE unless you test IS NULL first. Decide whether NULL prices are a band ('unpriced') or excluded, and say which.",
      tag: "aggregation",
    },
    {
      id: "ebay-t7",
      q: "Your percentage column reads 0 for every row. Diagnose the two classic causes and fix both in one expression.",
      a: "Cause one: integer division — numerator and denominator are both integers (counts), so 3/45 truncates to 0 before any multiplication; the fix promotes FIRST: 100.0 * numerator / denominator (the 100.0 multiplier forces real arithmetic on the left edge of the expression). Cause two: population drift — the WHERE clause filtered the rows the denominator needed (e.g., 'completed only' applied before the fold that should count all placed), so the ratio divides by the wrong population and can read as 0 or 100 pathologically. The one-expression fix: compute numerator and denominator as conditional aggregates over the SAME fold — 100.0 * SUM(CASE WHEN completed THEN 1 ELSE 0 END) / COUNT(*) — with the population filter (if any) stated in WHERE for both sides identically. eBay drills this because its rates are the marketplace's public face; a zero-everywhere column has shipped to more than one executive review.",
      tag: "aggregation",
    },
    {
      id: "ebay-t8",
      q: "Ratings average 4.6 for two sellers and 4.8 for one. The trust team wants a 'top tier' threshold query. Which ranking function and threshold shape do you use, and why not LIMIT?",
      a: "Tier logic wants DENSE_RANK with a rank threshold: DENSE_RANK() OVER (ORDER BY rating DESC) <= 1 keeps every seller AT the top rating (4.8), and a threshold of <= 2 keeps the 4.6 pair as a second tier — compact sequence, no gaps, ties share their tier. RANK would insert gaps after ties (4.8 → 1, 4.6 → 3), which breaks a tier COUNT ('we have two tiers' would be false); ROW_NUMBER would split the tied 4.6 sellers arbitrarily. LIMIT is the wrong tool at the definition level: 'top tier' is a METRIC threshold, not a row-count quota — LIMIT 3 would include a hypothetical 4.5 seller just to fill the quota, while DENSE_RANK <= threshold includes exactly the sellers who earned it. The strong answer also handles the NULL-rating sellers explicitly — excluded from the rank (NULL sorts by engine default) but stated as excluded, because eBay's trust reports never let a population disappear silently.",
      tag: "windows",
    },
    {
      id: "ebay-t9",
      q: "Walk the logical pipeline of a SELECT with a JOIN, a WHERE, a GROUP BY, a HAVING and a window function. At eBay, why does the placement of one filter decide whether the report is believed?",
      a: "The pipeline runs FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT (where window functions evaluate) → ORDER BY → LIMIT, and each clause sees only what survived the one before. WHERE judges rows before folding — it cannot see aggregates or window results; HAVING judges groups after the fold; window functions compute over whatever HAVING left. The eBay stakes: filter placement IS the population. A rating threshold on the preserved (left) table can live in WHERE or ON identically, but the same-literal filter on the right table in WHERE silently converts the LEFT JOIN to INNER — the zero-sale sellers vanish and the bench report lies. And an alias built in SELECT works in ORDER BY (and GROUP BY on SQLite) but not in WHERE, because WHERE runs first. Strong candidates narrate the pipeline aloud before writing: 'fold sellers, keep groups with three-plus listings, then rank what survived' — the sentence IS the query's skeleton.",
      tag: "filtering",
    },
    {
      id: "ebay-t10",
      q: "Your cumulative-GMV running total jumps by three orders' worth on one row. Explain the default window frame, then give the frame that fixes it.",
      a: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE treats peer rows (rows sharing the ORDER BY value, say three orders timestamped in the same second) as one frame boundary. All three land inside the frame together, so each of the three rows reports the sum including ALL its peers — the running total triple-jumps and reads double-counted. The fix is the physical frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which walks strictly row by row, each order's total added exactly once. Keep RANGE deliberately when peers SHOULD share a value (group-level reads), and say which you chose: on a marketplace order feed, same-timestamp rows are common (batched transactions), so the silent RANGE default has shipped more than one inflated GMV chart. The three-second answer that wins the follow-up: 'RANGE is value-framed, ROWS is row-framed, and peers are the difference.'",
      tag: "windows",
    },
    {
      id: "ebay-t11",
      q: "When do you stack with UNION versus UNION ALL, and what are INTERSECT and EXCEPT for on a two-sided marketplace?",
      a: "UNION concatenates two shaped-alike result sets and then DEDUPLICATES the stack; UNION ALL appends raw. Default to UNION ALL — it's cheaper and honest — unless duplicates would be lies, and never as a dedupe hack: a row collapsing because it exists in both legs (one account is a top-5 buyer AND a top-5 seller) is a silent population change, not a convenience. INTERSECT answers 'in both populations' — accounts active on both sides of the marketplace; EXCEPT answers 'in the left, absent from the right' — months that delivered but never cancelled, listings live but never transacted (set-form of the anti-join). The traps are mechanical and gradeable: both legs must have the same column count and compatible types (SQLite will coerce silently — a REAL and a TEXT column 'stack' into mush), ORDER BY belongs only on the last leg and sorts the whole stack, and column names come from the first leg. eBay drills set verbs because its questions are constantly 'which population, and who's missing from it?'",
      tag: "set-ops",
    },
    {
      id: "ebay-t12",
      q: "Name the four subquery shapes and give the eBay question each one answers.",
      a: "Scalar: a single value computed once, used as a constant — every order compared against the marketplace-wide average order value (338.19 on the live db) in the WHERE clause. IN-list: membership against a folded set — buyers whose orders ever exceeded 1,000.00. EXISTS: the semi-join — sellers with at least one open invoice, where you care about existence, not the values, and the engine can stop at the first match. Derived table / CTE: a staged fold — monthly revenue computed in a subquery, then ranked with LAG outside it, because windows can't sit on top of aggregates in one level. The discipline that eBay's follow-ups hunt: state what the inner query returns (how many rows, what grain) BEFORE nesting it — 'a scalar subquery returns exactly one row or the query fails' is the sentence that separates drilled candidates. Correlated subqueries re-run per outer row; fine at 103 orders, a plan-killer at a billion — the escalation to WITH is a performance decision, not a style one.",
      tag: "subqueries",
    },
    {
      id: "ebay-t13",
      q: "Orders carry text timestamps. How do you build month buckets and ship-latency math you'd defend in a review?",
      a: "Buckets: SUBSTR(created_at, 1, 7) slices the 'YYYY-MM' prefix — it groups correctly, sorts correctly as text (a quiet gift of ISO dates), and pairs with STRFTIME('%Y-%m', created_at) as the format-driven twin; pick one and use it everywhere so the bucket axis matches across reports. Latency: julianday(shipped_at) − julianday(created_at) gives fractional days — on the live db the average is 2.98 over the 82 orders that shipped, range 2–4. The guards matter more than the math: shipped_at is NULL for the 14 pending and 7 cancelled orders, so the latency read carries WHERE shipped_at IS NOT NULL — not because AVG would break (it skips NULLs) but because every count, share and denominator computed alongside the average must exclude them too. And state the boundary convention out loud: julianday differences count full 24-hour spans; 'calendar days' is a different number with a different definition — eBay's ops reviews have fought over less.",
      tag: "dates",
    },
    {
      id: "ebay-t14",
      q: "AVG(rating) over the seller table returns 4.3 while the deck says 4.47. What NULL behaviors did you just meet, and what's your standing NULL policy?",
      a: "Every aggregate except COUNT(*) skips NULLs: AVG divides by the non-NULL count only, so one unrated seller shrinks the denominator silently — COUNT(*)/COUNT(rating) exposes the gap as the unrated share, itself a trust signal. The eBay NULL policy, stated as policy: one — NULLs are a population, so COUNT them before you COALESCE them (COUNT(*) vs COUNT(rating) is the census). two — in LEFT JOIN reports, COALESCE the payload to explicit zeros so 'never sold' reads as 0, not as absence. three — guard every rate's denominator with NULLIF: NULLIF(active_listings, 0) turns a zero denominator into NULL instead of a division error or an infinity, and NULL propagates honestly. four — never NOT IN over a nullable column; one NULL poisons the whole list (three-valued logic) — NOT EXISTS is the immune shape. The deck's 4.47 versus your 4.3 is almost certainly population, not arithmetic: different NULL handling IS a different metric.",
      tag: "nulls",
    },
    {
      id: "ebay-t15",
      q: "'GMV was 34,833.28 last period.' What did you actually measure — and which four populations could that number legally be?",
      a: "On the live db, SUM(total) over all 103 orders is 34,833.28 — that's the PLACED number: cancelled (7) and pending (14) demand included. The four legal populations: placed (everything), fulfillable (pending + shipped + delivered — the ops view), completed (delivered only, 52 orders — the revenue-that-happened view), and net-of-returns (the finance view, which needs the refunds table this db doesn't model). None is wrong; mixing them unannounced is fraud-adjacent sloppiness in a review. The eBay-grade habit is a status-aware conditional fold — SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) — with the definition in the query, the column name, and the chart footer. The two-sided twist: buyer-side GMV and seller-side GMV must reconcile (every order has both a buyer and a seller), so a mismatch between the two folds is a join-grain bug, not a business surprise. When an interviewer asks 'does your denominator include cancelled?' they're asking which of the four populations you chose — have the answer before the query.",
      tag: "metrics",
    },
    {
      id: "ebay-t16",
      q: "Your per-seller revenue query takes minutes on production scale. Walk your performance instincts for join-heavy marketplace SQL.",
      a: "First instinct: find the fan-out. Joining orders to order_items multiplies rows (103 orders become 251 on the live db) — SUM over the joined grain double-counts everything the fan-out touched, and it also burns memory. Fold at the grain the metric lives on: order totals from orders alone, line revenue as SUM(unit_price × quantity) from items alone, then join the two folds. Second: keep predicates sargable — SUBSTR(created_at,1,7) = '2024-01' in a WHERE can't use an index on created_at; a range predicate created_at >= '2024-01-01' AND < '2024-02-01' can. Buckets in GROUP BY, ranges in WHERE. Third: aggregate BEFORE you join when the dimension is small — fold 251 items to 16 products, then attach names. Fourth: COUNT(DISTINCT) after a wide join is expensive; count distinct ids on the narrowest legal table. Fifth: SELECT * on a five-table join drags every payload column through the shuffle — name the columns the report needs. The eBay framing: 'cheap' isn't the goal — the goal is that the analyst BEFORE you can read the query and predict its cost.",
      tag: "performance",
    },
    {
      id: "ebay-t17",
      q: "The merch sheet wants each seller's catalog as one cell — names, priciest first. What does GROUP_CONCAT make you decide?",
      a: "GROUP_CONCAT(p.name ORDER BY p.price DESC) folds the listing names per seller into one comma-joined cell — and the ORDER BY inside the aggregate is the decision most candidates miss: without it, the order is arbitrary, and a cell that reshuffles between runs breaks every diff and every eyeball comparison. Decide the separator explicitly (the default is a comma, but names with commas inside them will corrupt the cell — use a pipe or newline when the payload is free text), decide the ordering, and know the failure mode: SQLite has no built-in length cap, but downstream tools do, and a 5,000-listing seller produces a cell that kills the spreadsheet. The population caveat is the eBay signature: GROUP_CONCAT over an INNER JOIN silently drops sellers with no listings — zero-catalog sellers should appear as an empty string or a stated NULL, not vanish from the merch sheet. Say all three decisions aloud — order, separator, population — and this question becomes a pass.",
      tag: "strings",
    },
    {
      id: "ebay-t18",
      q: "One scan of the orders table must yield delivered, shipped, pending, cancelled counts plus total — four columns, one pass. Compare the two idioms.",
      a: "Idiom one: conditional aggregation — SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) per column, four CASEs over one fold. Idiom two: the FILTER clause — COUNT(*) FILTER (WHERE status = 'delivered'), the declarative form of the same computation. They're semantically equivalent on this db (52 delivered, 30 shipped, 14 pending, 7 cancelled over 103 orders), and both guarantee the property the report needs: every column computed over the SAME fold and population, so the columns can't drift into disagreement the way four separate queries can (different run times, different WHERE edits). The house-style argument: FILTER reads as a census — each column states its own population inline — while CASE generalizes to SUMs of money and weighted scores, not just counts. Pick one idiom per codebase and keep it; a census that mixes idioms invites the per-column WHERE edit that breaks population honesty. The ELSE 0 on the CASE form matters: without it, cancelled-less folds return NULL, and NULL plus anything is NULL.",
      tag: "aggregation",
    },
    {
      id: "ebay-t19",
      q: "The catalog feed re-sends snapshots with duplicate listing ids and updated_at values that tie. How do you build one-row-per-listing that survives the audit?",
      a: "Keep-latest dedupe: ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY updated_at DESC) = 1, then filter to rank 1 — the pattern is only as deterministic as its ORDER BY, so add the tie-breaker: ORDER BY updated_at DESC, snapshot_id DESC. Two snapshots landing in the same tick is not hypothetical (batched feeds); without the tie-breaker, 'the latest row' is whichever the engine felt like, and the dedupe is unreproducible — the audit flag. The deeper eBay discipline: make the dedupe PROVE itself. The audit query counts the orphans — rows that should have vanished: SELECT listing_id, COUNT(*) FROM (deduped) GROUP BY listing_id HAVING COUNT(*) > 1 must return zero rows, and the population statement ('16 products, 16 deduped rows') goes in the footer. And note what dedupe is NOT: MAX(updated_at) per group gives you the timestamp, not the row — joining back on it re-fans-out exactly where ties exist. Window-dedupe or nothing.",
      tag: "data-quality",
    },
    {
      id: "ebay-t20",
      q: "LAG looks simple until the calendar is sparse. Where does the month-over-month delta lie, and how do you make it tell the truth?",
      a: "LAG(revenue) OVER (ORDER BY month) pairs each month with its neighbor IN THE RESULT — not in the calendar. If a month has no orders, it has no row, no bucket in the fold, and the delta silently spans two months: October's revenue compared against August's, reading as a collapse that never happened. The fix is the calendar spine: build the full month sequence (a months CTE — distinct months across the estate, or WITH RECURSIVE for a generated range), LEFT JOIN the fold onto it, COALESCE the missing revenue to 0 — now every bucket exists and LAG pairs neighbors honestly. Then the edge: the first month's LAG is legitimately NULL (no prior), and revenue − NULL is NULL — report it as NULL with a footnote ('no prior month'), never as 0, which reads as 'flat'. On the live db the 14-bucket spine (2024-01..2025-02) happens to be gap-free, but the habit is for the day a category with one order in March vanishes from the fold. LEAD is the same tool forward-facing — next-order intervals, reactivation gaps — with the NULL at the far edge.",
      tag: "windows",
    },
    {
      id: "ebay-t21",
      q: "The loyalty program wants buyers banded into spend quartiles. Compare NTILE, PERCENT_RANK and the CASE-ladder approach — which do you ship?",
      a: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) splits the ordered population into four near-equal buckets — 16 buyers become four quartiles of exactly four — and returns the bucket number per buyer: the segmentation the loyalty team ships. PERCENT_RANK returns each row's relative position 0..1 — more precise, less legible to a marketing stakeholder; use it to sanity-check NTILE's cutpoints, not as the deliverable. The CASE ladder (CASE WHEN spend >= 3000 THEN 'top' …) is the third option and the only one with STABLE, communicable thresholds — but it hardcodes edges the data will outgrow. The tie and sparsity caveats decide it: NTILE with ties at a boundary splits them arbitrarily (say so, or add a deterministic tie-breaker to the ORDER BY), and NTILE on a sparse population (five buyers, four tiles) produces buckets of one — the function divides what exists, not what you wish existed. The strong answer ships NTILE for the census AND prints the bucket edges, so 'quartile 1' has a dollar meaning the next review can audit — on this db, top-spenders-over-3,000 is already 63.5% of revenue, which is exactly the kind of fact the bands must survive.",
      tag: "windows",
    },
    {
      id: "ebay-t22",
      q: "Reconciliation hour: which invoices have no payment behind them, and how does the query prove the 'paid' status wrong?",
      a: "The anti-join, finance edition: FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL — every invoice survives the LEFT JOIN, the ones with at least one payment row fail the IS NULL test, and the survivors ARE the AR exposure: on the live db, six invoices totalling 15,217.00 dollars (amount_cents / 100.0 — the columns are integer cents). The audit-grade twist is the status disagreement: one survivor is marked status = 'paid' with zero payment rows behind it — the anti-join just caught a reconciliation anomaly the status column alone would have blessed. NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) is the NULL-immune twin and the better shape on big tables; both beat NOT IN here, which dies if invoice_id in the subquery can be NULL. Follow the sweep with the coverage census — per invoice: exact (paid = owed), partial (paid > 0 and < owed — invoice 25's 4,000.00 against 6,148.00), none — and the CASE ordering matters: test exact FIRST, or the any-payment branch swallows fully-paid invoices. The close ships all three numbers or it ships nothing.",
      tag: "joins",
    },
    {
      id: "ebay-t23",
      q: "The trend chart must show all fourteen months even where a category sold nothing. Build the spine.",
      a: "The fold only produces buckets that exist — a category with zero March orders contributes no March row, and the chart silently loses a month. The fix: build the calendar spine first (SELECT DISTINCT SUBSTR(created_at,1,7) FROM orders across the whole estate — or WITH RECURSIVE date-spine for a generated, gap-free range), then LEFT JOIN the category fold onto the spine ON month = month, and COALESCE(sales, 0) so the missing month reads as an honest zero. Three properties make the spine auditable: it's gap-free by construction (the recursion or the estate-wide DISTINCT guarantees the axis), the LEFT JOIN runs FROM the spine (spine rows are the preserved population — reversing the join silently re-deletes the empty months), and the zero is explicit (bare SUM over no rows is NULL, which chart libraries render as a gap or drop entirely). On the live db the 14 buckets 2024-01..2025-02 happen to be gap-free at marketplace grain — the spine is for the category and seller grain, where empty months are the norm, not the exception.",
      tag: "dates",
    },
    {
      id: "ebay-t24",
      q: "The churn watchlist wants each seller's longest consecutive-month selling streak. How do you turn a transaction log into streaks?",
      a: "Gaps-and-islands on a calendar grain. Stage one: fold transactions to seller-month presence (DISTINCT seller_id, month bucket). Stage two: group the islands — ROW_NUMBER() OVER (PARTITION BY seller_id ORDER BY month) minus the month's ordinal position is constant WITHIN a consecutive run and changes at every gap: subtract it (grp = month_index − row_number) and every island shares a key. Stage three: GROUP BY seller_id, grp and take MIN(month), MAX(month), COUNT(*) — the longest streak per seller is MAX(COUNT(*)) with a deterministic tie-breaker on seller_id. The discipline eBay grades: consecutive means gap-free in CALENDAR terms, so the month key must be a true sequence (YYYY-MM sorts correctly as text, but 2024-12 → 2025-01 needs the year in the arithmetic — the row_number-minus-index trick survives it because both sides skip together). Present the edge honestly: a seller whose only sales are two years apart has a longest streak of 1 — the metric is about continuity, not volume, which is precisely why the trust team wants it on the watchlist.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "ebay-mcq-1",
      prompt: "6 suppliers exist; 2 have rating >= 4.5 (with 3 and 2 listings). What does the trusted-seller report return when suppliers with NO products are also in the table?",
      choices: [
        "Only the 2 trusted suppliers",
        "The 2 trusted plus any zero-listing suppliers rated >= 4.5",
        "All 6 suppliers",
        "Zero rows — the join eliminates unmatched suppliers",
      ],
      answer: 1,
      why: "The report filters suppliers on rating, then LEFT JOINs products — trusted suppliers with zero listings survive as NULL-payload rows (COUNT(p.id) = 0). That's population honesty: the bench includes everyone who qualifies.",
      notes: [
        { choice: 3, why: "An INNER JOIN would do that — and silently delete qualifying sellers whose catalogs are empty. LEFT keeps them; that's the point of the shape." },
        { choice: 0, why: "Only true if the rating filter AND the join are both INNER — the report then can't distinguish 'not trusted' from 'trusted but empty-catalog'." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-2",
      prompt: "Two sellers tie at rating 4.6, the next is 4.8. `RANK() OVER (ORDER BY rating DESC)` assigns the 4.8 seller rank…",
      choices: ["2", "3", "4", "1"],
      answer: 1,
      why: "RANK: ties share the rank, gaps kept — 4.6 → 1 (twice), 4.8 → 3. DENSE_RANK would say 2; ROW_NUMBER would say 3 with an arbitrary tie order.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK — compact, no gaps. RANK skips the tied positions: two sellers at rank 1 push the next distinct value to 3." },
        { choice: 2, why: "Ranks reach 4 only with four distinct values present. Three positions here: 1, 1, 3." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-3",
      prompt: "Which query finds sellers with ZERO transactions — NULL-safe and fan-out-safe?",
      choices: [
        "WHERE seller_id NOT IN (SELECT seller_id FROM transactions)",
        "LEFT JOIN transactions … WHERE t.id IS NULL",
        "INNER JOIN transactions … WHERE t.id IS NULL",
        "HAVING COUNT(t.id) = 0 after an INNER JOIN",
      ],
      answer: 1,
      why: "LEFT JOIN from sellers + IS NULL is the canonical anti-join: unmatched sellers survive with NULL payloads and the IS NULL test selects them. NOT IN dies on one NULL in the subquery; INNER removes the sellers you're looking for.",
      notes: [
        { choice: 0, why: "One NULL seller_id in transactions and the NOT IN returns zero rows forever — the comparison can't be TRUE against UNKNOWN." },
        { choice: 3, why: "After an INNER JOIN the zero-sale sellers don't exist in the result — HAVING can only judge groups that survived the join." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-4",
      prompt: "Price bands: <50 'budget', <150 'mid', else 'premium'. A listing has price = NULL. Where does CASE put it?",
      choices: [
        "'budget' — NULL sorts lowest",
        "'mid' — NULL fails both < tests and falls through",
        "'premium' — the ELSE catches every row no WHEN accepted",
        "Nowhere — CASE drops the row from the ladder",
      ],
      answer: 2,
      why: "NULL comparisons are UNKNOWN — every WHEN fails — so the ELSE takes the row: it COUNTS, but as a lie. An unpriced listing reported as 'premium' corrupts the band totals; the auditable ladder adds WHEN price IS NULL THEN 'unpriced' first, because where NULLs live is a decision to make out loud.",
      notes: [
        { choice: 3, why: "CASE never drops rows — the ELSE guarantees every row lands somewhere. The danger is mislabeling, not vanishing." },
        { choice: 0, why: "NULL doesn't sort lowest in CASE evaluation — each WHEN comparison is UNKNOWN and fails. Only an explicit IS NULL branch gives NULL a home." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-5",
      prompt: "187 line items across 103 transactions; seller_id is on the product. To rank sellers by revenue, the fold key is…",
      choices: [
        "GROUP BY order_id",
        "GROUP BY seller (via the product join) with SUM(unit_price × quantity)",
        "GROUP BY product_id",
        "SUM over the whole table with no grouping",
      ],
      answer: 1,
      why: "The revenue metric is line-item money folded to SELLER grain — the join carries seller onto each line, then GROUP BY seller sums it. The fold key is the report's subject, and the grain narration is the habit being tested.",
      notes: [
        { choice: 2, why: "That folds to products — sixteen product totals, not seller revenue. One hop short of the subject." },
        { choice: 3, why: "No GROUP BY means one row for the whole marketplace — the total, not a leaderboard. Ranking needs the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-6",
      prompt: "sold_through = transactions / active_listings. Which version survives integer arithmetic?",
      choices: [
        "COUNT(t.id) / COUNT(l.id)",
        "ROUND(COUNT(t.id) / COUNT(l.id), 2)",
        "100.0 * COUNT(t.id) / COUNT(l.id)",
        "CAST(COUNT(t.id) AS REAL) AFTER dividing",
      ],
      answer: 2,
      why: "The 100.0 leads the expression: integer ÷ integer happens only after promotion, so a 12.5% rate stays 12.5. Casting after division casts the already-truncated 0.",
      notes: [
        { choice: 1, why: "ROUND doesn't rescue truncation — the division already collapsed to 0 or 1 before ROUND sees it." },
        { choice: 3, why: "CAST after the fact preserves the damage. Promote BEFORE the division (or cast the numerator) — placement is everything." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-7",
      prompt: "The trust team wants EVERY seller rated 4.5+, including those with zero listings. The WHERE clause reads `WHERE s.rating >= 4.5` and the join is LEFT. Where does the filter go — and why does it matter?",
      choices: [
        "WHERE is fine — LEFT JOIN keeps unmatched sellers regardless",
        "The rating filter is on the LEFT table, so WHERE is correct; putting it in ON would change nothing for LEFT-table columns",
        "It must go in the ON clause or zero-listing sellers drop",
        "Filters never matter after a LEFT JOIN",
      ],
      answer: 1,
      why: "Predicates on the LEFT (preserved) table work identically in WHERE or ON — s.rating >= 4.5 filters sellers before matching either way. The WHERE-in-ON subtlety bites only on RIGHT-table columns, where WHERE destroys the LEFT-ness.",
      notes: [
        { choice: 2, why: "That's the right instinct for the WRONG table — RIGHT-table predicates (p.category = 'x') must live in ON to preserve unmatched sellers. LEFT-table predicates are safe in WHERE." },
        { choice: 3, why: "Filters absolutely matter — a right-table predicate in WHERE silently converts the join to INNER. The left-table rating filter is the safe case, not a no-op." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-8",
      prompt: "Which single query returns each seller's rating, listing count, and average listing price — sellers with 3+ listings only?",
      choices: [
        "SELECT s.name, s.rating, COUNT(p.id), AVG(p.price) FROM suppliers s JOIN products p … GROUP BY s.id HAVING COUNT(p.id) >= 3",
        "… WHERE COUNT(p.id) >= 3 …",
        "… GROUP BY s.id WHERE COUNT(p.id) >= 3 …",
        "SELECT s.name, s.rating, COUNT(p.id), AVG(p.price) … (no grouping) HAVING COUNT(*) >= 3",
      ],
      answer: 0,
      why: "The threshold judges a per-seller aggregate — it lives in HAVING, after GROUP BY folds the listings per seller. WHERE judges rows before folding and can't see COUNT.",
      notes: [
        { choice: 1, why: "COUNT in WHERE is a syntax-level error — groups don't exist at filter time. The pipeline order teaches the clause placement." },
        { choice: 3, why: "Without GROUP BY there's one group (the whole table) — HAVING judges the marketplace, not each seller." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-9",
      prompt: "A dispute rate is 'disputes per thousand transactions'. Which expression is correct and honestly scaled?",
      choices: [
        "1000 * COUNT(dispute_id) / COUNT(*)",
        "COUNT(dispute_id) / COUNT(*) * 1000",
        "1000.0 * SUM(CASE WHEN disputed THEN 1 ELSE 0 END) / COUNT(*)",
        "COUNT(*) / 1000",
      ],
      answer: 2,
      why: "The conditional sum counts disputes at the same fold as COUNT(*) counts transactions, and 1000.0 promotes to real arithmetic before division — per-thousand scale, no truncation. Note COUNT(dispute_id) also works when disputes are a nullable column — but only if the flag is never 0-marked.",
      notes: [
        { choice: 1, why: "Integer division first (unless flags promote it): disputes/transactions truncates to 0 for any rate under 1 per thousand — multiplying the 0 by 1000 keeps it 0." },
        { choice: 3, why: "That's transactions divided by a thousand — a quantity, not a rate. The numerator and scale are both wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-10",
      prompt: "You need the SECOND-highest seller rating, and ties exist (4.8, 4.6, 4.6, 4.4). Which answer is 4.4 — and which is the 'second DISTINCT rating'?",
      choices: [
        "LIMIT 1 OFFSET 1 gives 4.6; the second distinct is also 4.6",
        "DENSE_RANK = 2 gives 4.4; OFFSET picks an arbitrary 4.6 row",
        "MAX(rating) - 0.2 gives 4.6 — the second distinct",
        "ROW_NUMBER = 2 gives 4.4 deterministically",
      ],
      answer: 1,
      why: "The second-highest DISTINCT rating is 4.4 — DENSE_RANK() = 2 finds it tie-proof. OFFSET 1 walks ROWS (the second 4.6), not distinct values; arithmetic on MAX assumes a gap that ties break.",
      notes: [
        { choice: 0, why: "OFFSET skips one ROW among the tied 4.6s — the result is 4.6, which is the HIGHEST distinct value, not the second." },
        { choice: 3, why: "ROW_NUMBER orders ROWS arbitrarily within ties — 'second row' is 4.6, and even with a deterministic tie-breaker it's still a row, not a distinct value." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-11",
      prompt: "Category leads want sellers with 3+ listings whose average listing price tops 100. Where do the two conditions live?",
      choices: [
        "Both in WHERE — filters belong in WHERE",
        "Both in HAVING — each judges a per-seller aggregate after GROUP BY s.id",
        "The count in WHERE, the average in HAVING",
        "Either clause works — SQLite relocates them automatically",
      ],
      answer: 1,
      why: "Both conditions judge per-seller aggregates (COUNT, AVG), which only exist after GROUP BY folds — HAVING is the only clause that sees groups. WHERE filters rows pre-fold and cannot evaluate COUNT or AVG at all.",
      notes: [
        { choice: 0, why: "WHERE dies on aggregates — COUNT(p.id) doesn't exist until after the fold. The pipeline is FROM→WHERE→GROUP BY→HAVING, and each clause only sees what survived the one before." },
        { choice: 2, why: "The split feels intuitive but WHERE can't host the count either — any aggregate-condition lives in HAVING, full stop." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-12",
      prompt: "The growth deck stacks the top-5 buyers and top-5 sellers into one leaderboard via UNION — and shows 9 rows, not 10. What do you check first?",
      choices: [
        "UNION deduplicates — an account appears in both top-5s with identical selected columns, collapsing to one row",
        "UNION ALL was used and silently dropped a row",
        "LIMIT ran before the UNION and ate a leg",
        "The second leg lost its column types",
      ],
      answer: 0,
      why: "UNION applies DISTINCT across the stacked result — a row present in both legs ships once. One account being a top buyer AND a top seller turns 10 rows into 9; the fix is UNION ALL when the legs are meant to be raw populations.",
      notes: [
        { choice: 1, why: "UNION ALL never dedupes — it appends everything; if anything it would show MORE rows, not fewer." },
        { choice: 2, why: "LIMIT applies per leg (or after the stack) — it can't selectively remove exactly the one overlapping row." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-13",
      prompt: "EU region: 45 orders from 8 buyers. Which expression pair puts 45 and 8 in the same row of the regional census?",
      choices: [
        "COUNT(*), COUNT(*)",
        "COUNT(*), COUNT(customer_id)",
        "COUNT(*), COUNT(DISTINCT customer_id)",
        "SUM(order_id), SUM(customer_id)",
      ],
      answer: 2,
      why: "COUNT(*) counts order rows; COUNT(DISTINCT customer_id) counts people — after the join, a buyer with 10 orders contributes 10 rows but one distinct id. That pairing IS the two-grain census eBay opens reviews with.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL rows — after an INNER join that's still 45, just spelled differently. DISTINCT is the whole difference." },
        { choice: 3, why: "SUM over id columns sums keys — a number that grows with the catalog and means nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-14",
      prompt: "Flag every order whose total beats the marketplace-wide average order value (338.19 on the live db). Which shape is correct?",
      choices: [
        "WHERE total > AVG(total)",
        "WHERE total > (SELECT AVG(total) FROM orders)",
        "HAVING total > AVG(total) with no GROUP BY",
        "WHERE total > MAX(total) / 2",
      ],
      answer: 1,
      why: "The average must be computed over ALL orders while the outer query walks them row by row — a scalar subquery computes 338.19 once and the outer WHERE compares each row to it. Mixing aggregate and row scope in one query level is a syntax error.",
      notes: [
        { choice: 0, why: "An aggregate in bare WHERE fails — aggregates live in HAVING or inside a subquery, never in row-level WHERE." },
        { choice: 2, why: "Without GROUP BY, HAVING sees one global group — it can't judge each row against the average." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-15",
      prompt: "Which WHERE clause isolates January 2024 orders when created_at holds '2024-01-15 10:30:00'-style timestamps?",
      choices: [
        "WHERE created_at = '2024-01'",
        "WHERE SUBSTR(created_at, 1, 7) = '2024-01'",
        "WHERE created_at LIKE '%2024%'",
        "WHERE MONTH(created_at) = 1",
      ],
      answer: 1,
      why: "SUBSTR(created_at,1,7) slices the 'YYYY-MM' prefix — the same bucket axis the monthly trend uses in its GROUP BY. It's the month-bucket idiom on text timestamps, and it pairs with the bucket expression so filter and fold agree.",
      notes: [
        { choice: 0, why: "Equality against a 7-char bucket never matches a full timestamp — zero rows, silently." },
        { choice: 3, why: "MONTH() is MySQL — SQLite has no MONTH function; the query errors instead of filtering." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-16",
      prompt: "The month-over-month delta column is NULL for 2024-01, the first bucket. What's the honest treatment?",
      choices: [
        "COALESCE it to 0 — a delta with no prior is zero",
        "Leave it NULL and say so — there is no prior month in the window",
        "Fill it with the last month's delta so the column is complete",
        "Drop the first row from the report",
      ],
      answer: 1,
      why: "NULL here MEANS 'no prior row' — that's information. LAG returns NULL at the window's edge, and the strong report preserves it with a footnote rather than manufacturing a 0 that reads like 'flat month'.",
      notes: [
        { choice: 0, why: "0 rewrites 'no comparison' as 'no change' — a stakeholder reading the delta column draws the wrong story from the very first row." },
        { choice: 3, why: "Dropping the row hides the first month's revenue too — the bucket vanished, not just its delta." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-17",
      prompt: "Cumulative revenue: SUM(total) OVER (ORDER BY created_at) reports numbers that look double-counted on days with several same-timestamp orders. Why — and which frame fixes it?",
      choices: [
        "The default frame is RANGE — peer rows sharing the ORDER BY value are framed together; ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row",
        "The default frame is ROWS — switch to RANGE to deduplicate",
        "ORDER BY created_at needs DESC for cumulative math",
        "Nothing is wrong — cumulative totals always double-count ties",
      ],
      answer: 0,
      why: "With RANGE (the default), peers sharing the ORDER BY value are all inside the frame — each row's running total includes its whole peer group, so the total jumps by the group at once. ROWS ... UNBOUNDED PRECEDING AND CURRENT ROW makes the walk strictly per-row, each order added exactly once.",
      notes: [
        { choice: 1, why: "Inverted — the default IS RANGE; ROWS is the fix, not the problem. Marketplace feeds batch transactions into the same second, so peers are common." },
        { choice: 2, why: "Direction changes the story's start, not the frame semantics — DESC just accumulates from the newest row." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-18",
      prompt: "Buyers whose every order shipped: WHERE id NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NULL). One orders row has customer_id = NULL (a data bug). What happens?",
      choices: [
        "It works — NULL rows are excluded from the list automatically",
        "The NOT IN returns zero rows — nothing can be NOT-IN a list containing NULL",
        "Only the NULL-customer's rows drop out",
        "SQLite rewrites it to NOT EXISTS automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN against NULL for every candidate row. NOT EXISTS (or a LEFT JOIN + IS NULL) is the NULL-immune anti-join shape on a nullable column.",
      notes: [
        { choice: 0, why: "'Automatic exclusion' is exactly the trap — the NULL poisons the LIST semantics, not just its own row." },
        { choice: 3, why: "No rewrite happens — three-valued logic is standard; the query faithfully returns nothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-19",
      prompt: "Coverage census: exact / partial / none per invoice. Invoice 25 owes 6148.00 and has one payment of 4000.00. Which CASE reads it as 'partial'?",
      choices: [
        "WHEN SUM(p.amount_cents) > 0 THEN 'partial' WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact' ELSE 'none' END",
        "WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact' WHEN SUM(p.amount_cents) > 0 THEN 'partial' ELSE 'none' END",
        "WHEN p.amount_cents IS NOT NULL THEN 'exact' ELSE 'none' END",
        "WHEN COUNT(p.id) = 1 THEN 'partial' ELSE 'exact' END",
      ],
      answer: 1,
      why: "CASE evaluates WHENs in order — test exact equality FIRST, then the any-payment branch, and let ELSE catch 'none'. Reordering makes every paid invoice read 'partial' before the exact test is ever reached.",
      notes: [
        { choice: 0, why: "The > 0 branch fires first — fully-paid invoices label 'partial'; branch order is the whole bug." },
        { choice: 2, why: "Any single payment row marks 'exact' — the 4000-of-6148 shortfall disappears from the census." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-20",
      prompt: "Fold each seller's listing names into one cell, priciest first. Which fragment is right?",
      choices: [
        "GROUP_CONCAT(p.name ORDER BY p.price DESC)",
        "GROUP_CONCAT(p.name, p.price DESC)",
        "GROUP_CONCAT(p.name) ORDER BY p.price",
        "STRING_AGG(p.name) — the standard name works in SQLite",
      ],
      answer: 0,
      why: "GROUP_CONCAT accepts ORDER BY inside the parentheses in SQLite — the fold is ordered per group, default separator a comma. The outer ORDER BY sorts output rows; it cannot order the contents of a folded cell.",
      notes: [
        { choice: 1, why: "Two arguments to GROUP_CONCAT means (value, separator) — this passes 'p.price DESC' as a separator string, silently producing garbage." },
        { choice: 3, why: "STRING_AGG isn't in SQLite's vocabulary — the query errors before it folds." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-21",
      prompt: "One scan of orders must yield delivered, shipped and total counts. What is the honest relationship between COUNT(*) FILTER (WHERE status='delivered') and SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END)?",
      choices: [
        "They're equivalent conditional counts over the same fold — pick one idiom and keep it house-wide",
        "FILTER can only attach to SUM",
        "FILTER forces a second scan of the table",
        "CASE counts are integers; FILTER counts are floats",
      ],
      answer: 0,
      why: "Both are conditional counts computed during the same scan over the same population — FILTER (WHERE) is the declarative form of the CASE trick. The risk isn't correctness, it's drift: a census that mixes idioms invites per-column WHERE edits that break population honesty.",
      notes: [
        { choice: 1, why: "FILTER attaches to any aggregate — COUNT, SUM, AVG alike; it's an aggregate modifier, not a SUM special." },
        { choice: 2, why: "FILTER filters rows INTO the aggregate during the same pass — no second scan exists in the plan." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-22",
      prompt: "Revenue check: SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id returns far more than the true 34833.28. Why?",
      choices: [
        "The join fans orders out to the item grain — 251 items over 103 orders duplicates each order's total once per line, ~2.4x inflation",
        "order_items contains cancelled orders only",
        "SUM ignores NULLs, losing money on the way up",
        "The join should have been a LEFT JOIN",
      ],
      answer: 0,
      why: "The one-to-many join multiplies rows — an order with 5 lines contributes its total 5 times. Fold money at the grain it lives on: order totals from orders alone, or line revenue as SUM(unit_price × quantity) at the item grain — never the hybrid.",
      notes: [
        { choice: 3, why: "LEFT JOIN keeps the fan-out — duplication, not join direction, is the bug." },
        { choice: 2, why: "NULL-dropping SHRINKS sums; it can't inflate them. The inflation is row multiplication." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-23",
      prompt: "Invoice 28 stores amount_cents = 175600. Which expression prints 1756.0, and what does the integer-division version lose?",
      choices: [
        "amount_cents / 100.0 promotes to real arithmetic; amount_cents / 100 is integer division and truncates any cent remainder (92550 → 925, losing 0.50)",
        "amount_cents / 100 — same result; SQLite auto-promotes integer division",
        "amount_cents % 100 is the dollars part",
        "ROUND(amount_cents / 100) is safer than any float math",
      ],
      answer: 0,
      why: "The .0 divisor forces real arithmetic BEFORE the division — the cents discipline on every finance table (invoices, payments, expenses, ledger all store integer cents). INTEGER/INTEGER truncates toward zero, shaving real money off odd-cent amounts.",
      notes: [
        { choice: 1, why: "SQLite does NOT auto-promote — INTEGER/INTEGER stays integer: 92550/100 = 925." },
        { choice: 2, why: "% is the remainder operator — 92550 % 100 = 50, the cents, not the dollars." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-24",
      prompt: "Segment 16 buyers into spend quartiles. What does NTILE(4) OVER (ORDER BY spend DESC) return per buyer?",
      choices: [
        "1, 2, 3 or 4 — four near-equal buckets, top spenders in bucket 1",
        "The buyer's percentile rank as a percentage",
        "A running sum of spend per quartile",
        "NULL for every row — NTILE needs a GROUP BY",
      ],
      answer: 0,
      why: "NTILE(n) divides the ordered population into n near-equal buckets — 16 buyers become four quartiles of exactly four — and returns the bucket number. It's the RFM-style banding read the loyalty program ships.",
      notes: [
        { choice: 1, why: "PERCENT_RANK gives relative position 0..1; NTILE gives the bucket number." },
        { choice: 3, why: "NTILE is a window function over the result set — no GROUP BY needed or wanted." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-25",
      prompt: "Which months saw delivered orders but never a cancellation? The set shape is…",
      choices: [
        "SELECT month FROM orders WHERE status='delivered' INTERSECT SELECT month FROM orders WHERE status='cancelled'",
        "SELECT month FROM orders WHERE status='delivered' EXCEPT SELECT month FROM orders WHERE status='cancelled'",
        "SELECT month FROM orders WHERE status='delivered' UNION SELECT month FROM orders WHERE status='cancelled'",
        "SELECT month FROM orders WHERE status != 'cancelled'",
      ],
      answer: 1,
      why: "EXCEPT keeps the left set minus the right — delivered-months with the five cancellation-months (2024-01, 2024-03, 2024-07, 2024-11, 2025-01) removed, leaving nine clean months on the live db. It's the set-form of 'which population is NOT in this report'.",
      notes: [
        { choice: 0, why: "INTERSECT keeps months that had BOTH — the exact opposite question." },
        { choice: 3, why: "The status filter is row-level, not month-level — a month with one cancelled and seven delivered orders still shows." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-26",
      prompt: "Ship latency = julianday(shipped_at) − julianday(created_at); the live-db average is 2.98 days. What breaks without WHERE shipped_at IS NOT NULL?",
      choices: [
        "Nothing — AVG ignores the pending and cancelled rows anyway",
        "The average survives (AVG skips NULLs), but COUNT(*) inflates to 103 and every count, share and denominator alongside it now includes the 21 non-shipped orders",
        "The average becomes 0",
        "julianday(NULL) returns 0, dragging the average down",
      ],
      answer: 1,
      why: "The trap is subtler than the average: pending (14) and cancelled (7) orders contribute NULL latency rows that AVG skips — so 2.98 survives — but any count, share or per-region rate computed in the same query now spans the wrong population. The guard protects the report, not just the average.",
      notes: [
        { choice: 0, why: "'Nothing' is the half-right answer that ships broken dashboards — the mean survives, the census doesn't." },
        { choice: 3, why: "julianday(NULL) is NULL, never 0 — SQLite doesn't coerce." },
      ],
      difficulty: "easy",
    },
    {
      id: "ebay-mcq-27",
      prompt: "The monthly trend LEFT JOINs a 14-month spine; one month has no orders. What do COALESCE(SUM(o.total), 0) and the bare SUM render?",
      choices: [
        "0 for the empty month versus NULL — which chart libraries draw as a gap or drop entirely",
        "Both render 0",
        "NULL and 0 respectively",
        "COALESCE renders the string 'none'",
      ],
      answer: 0,
      why: "SUM over no rows is NULL, not 0 — the calendar spine's LEFT JOIN preserves the month, and COALESCE gives it an honest zero so the 14-bucket trend stays continuous.",
      notes: [
        { choice: 1, why: "Bare SUM on an empty group is NULL — the classic missing-bar bug, not a zero." },
        { choice: 3, why: "COALESCE returns 0 the number, not a string." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-28",
      prompt: "A report shows spend_rank computed OVER (ORDER BY spend DESC) but displays rows alphabetically. What controls what?",
      choices: [
        "The window's ORDER BY defines the rank values only; the outer ORDER BY controls display order — they are independent",
        "The window ORDER BY also sorts the display rows",
        "You cannot ORDER BY differently inside and outside a window",
        "The outer ORDER BY recomputes the ranks",
      ],
      answer: 0,
      why: "Window ORDER BY defines who is 'before' whom for the computation; the outer ORDER BY is presentation. Alphabetical display with honest rank columns is a legitimate — and common — shipping shape.",
      notes: [
        { choice: 1, why: "The window clause never sorts output rows — it assigns rank numbers over its frame." },
        { choice: 2, why: "Independence is the design; conflating them is how 'sorted' dashboards lose their rank columns' meaning." },
      ],
      difficulty: "medium",
    },
    {
      id: "ebay-mcq-29",
      prompt: "One row per listing: keep the latest catalog snapshot, and updated_at ties exist. Which shape is tie-proof?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY updated_at DESC, snapshot_id DESC) = 1 — the second key breaks ties deterministically",
        "MAX(updated_at) GROUP BY listing_id, selecting the matching row",
        "WHERE updated_at = (SELECT MAX(updated_at) …) — ties are impossible in practice",
        "ROW_NUMBER() OVER (ORDER BY updated_at DESC) = 1",
      ],
      answer: 0,
      why: "Partition per listing, order newest-first with a deterministic tie-breaker, keep row 1 — exactly one winner per listing even when two snapshots land in the same tick.",
      notes: [
        { choice: 1, why: "MAX gives the timestamp, not the row — joining back on it re-fans-out exactly where ties exist." },
        { choice: 3, why: "Without PARTITION BY, row 1 is the latest snapshot in the whole table — one row total, not one per listing." },
      ],
      difficulty: "hard",
    },
    {
      id: "ebay-mcq-30",
      prompt: "The close's last query: SUM(debit_cents) − SUM(credit_cents) over ledger_entries reads 181080 − 181080 = 0 on the live db. What does the zero prove — and what does it NOT prove?",
      choices: [
        "The books fold to balance; it does NOT prove the data is clean — a void-but-paid invoice (925.00) and a paid-status invoice with zero payment rows (1756.00) coexist with delta 0",
        "A non-zero delta would mean rounding drift — cents tables never mis-balance",
        "Delta 0 proves revenue is positive",
        "Delta 0 certifies there are no data-quality anomalies anywhere in the finance tables",
      ],
      answer: 0,
      why: "The trial balance is a global gate — it proves the fold balances, not that every document is backed by its rows. Only per-account and per-invoice drills (cash nets +44196, receivables +16440 on the live db) surface the anomalies the global delta hides.",
      notes: [
        { choice: 1, why: "Balance is exactness, not cleanliness — balanced books can hide wrong-account entries." },
        { choice: 3, why: "The close's real catches (status-vs-rows disagreements) pass a balanced trial balance happily — the gate is necessary, not sufficient." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-ebay-1",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The trusted-seller bench",
      brief:
        "eBay-flavored brief on the storefront db: the trust review opens with the bench — every seller rated 4.5 or above, with how many listings they carry and at what average price, because promotion slots target trusted sellers with real catalogs. Probed facts: six sellers total; two clear the bar — Nordic Gadgets AB (4.6, three listings, average price 139.66) and Alpine Audio GmbH (4.8, two listings, average 72.0). The rest sit at 4.4 and below and stay off the bench — and the report says the threshold out loud, because 'trusted' is a definition, not a vibe.",
      ask: "Return every seller rated 4.5 or above: seller name, rating, listing count, and average listing price (two decimals), most listings first.",
      template:
        "SELECT s.name, s.rating, COUNT(p.id) AS listings,\n       ROUND({1}(p.price), 2) AS avg_price\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nWHERE s.rating >= {2}\nGROUP BY s.id\nORDER BY listings {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the price averager",
          why: "AVG(p.price) per seller is the bench's pricing read — Nordic's three listings average 139.66. SUM would print total-catalog value wearing an average's name; MAX would print one cherry-picked listing.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the trust threshold",
          noVerify: true,
          why: "The definition is rating >= 4.5 — Nordic (4.6) and Alpine (4.8) clear it, Midwest (4.4) misses by a tenth. The threshold IS the report: 4.7 would bench Alpine too.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the catalog-first direction",
          why: "The bench reads deepest-catalog first: Nordic's three listings above Alpine's two. ASC would open the review with the smallest catalog — a correct query, an upside-down bench.",
        },
      ],
      distractors: ["SUM", "MAX", "4.7", "ASC"],
      walkthrough:
        "A definition-first leaderboard. WHERE s.rating >= 4.5 filters the PRESERVED table (sellers) before any matching — the two trusted sellers enter the fold, the 4.4-and-below stay out, and the threshold is visible in the query for the audit that always comes. The join carries each seller's listings in; GROUP BY s.id folds them per seller; COUNT(p.id) is catalog depth (3, 2) and AVG(p.price) is the pricing read (139.66, 72.0) with the ROUND at the end. ORDER BY listings DESC reads the bench deepest-catalog first. The distractors are the report's failure modes: SUM and MAX corrupt the pricing column; 4.7 silently benches Alpine and the trust team loses their best-rated seller; ASC flips the reading order and buries the catalog leader. One threshold, one direction — both are definitions someone owns, which is the two-sided-marketplace lesson: 'trusted' is a query parameter, and writing it down is the deliverable.",
    },
    {
      id: "cs-ebay-2",
      tier: "easy",
      topic: "s6",
      universe: "catalog",
      title: "The price-band ladder",
      brief:
        "eBay-flavored brief on the storefront db: merchandising wants the price-band ladder — how many listings live in each band — to plan a fee promotion targeting the middle of the market. The bands are fixed by the fee schedule: under 50 is 'budget', 50 to under 150 is 'mid', 150 and above is 'premium'. Probed facts: sixteen listings — 8 budget, 7 mid, 1 premium. The middle band is the promotion target, and the ladder's ELSE clause is what makes the premium count trustworthy: no listing vanishes between the bands.",
      ask: "Return the three price bands with their listing counts, deepest band first.",
      template:
        "SELECT {1} WHEN price < 50 THEN 'budget'\n       WHEN price < 150 THEN 'mid'\n       ELSE 'premium' END AS band,\n       COUNT(*) AS listings\nFROM products\nGROUP BY {2}\nORDER BY listings {3};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the band builder",
          why: "CASE constructs the classification axis inline — three half-open bands from one expression. No other SQL keyword can build a labeled bucket inside a SELECT, which is why every band ladder in production SQL is a CASE.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the band fold",
          why: "GROUP BY band folds the sixteen listings into the three labeled buckets — 8 / 7 / 1. GROUP BY price would fold to sixteen one-row bands: a price list wearing a ladder's name.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-first direction",
          why: "The ladder reads biggest first: budget 8, mid 7, premium 1. ASC would open with premium's lonely listing — and the fee-promotion decision would anchor on the emptiest band.",
        },
      ],
      distractors: ["WHERE", "price", "ASC"],
      walkthrough:
        "Classification as a fold axis. CASE evaluates each listing's price against half-open edges — price < 50 is budget, price < 150 (and at least 50) is mid, everything else is premium — and the ELSE guarantees exhaustiveness: all sixteen listings land in a band, which is why the ladder's counts total to the table count (8 + 7 + 1 = 16 — the instant unit test). GROUP BY band folds on the built axis; COUNT(*) counts each bucket; ORDER BY listings DESC reads the ladder deepest first. The half-open edges are the quiet star: BETWEEN 50 AND 149.99 would leak every price from 149.99 to 150 into budget-by-accident, and rounding at the seams is how band reports drift. The nullable-column caveat belongs in the same breath: a NULL price fails every WHEN and lands in the ELSE — counted, but mislabeled as premium — so a production ladder tests IS NULL first and gives NULLs a named band. GROUP BY price instead of band produces sixteen rows — technically a ladder, functionally a phone book. And the ASC flip is the merchandising mistake in miniature: the fee promotion reads the deep bands first, because that's where the listings — and the fees — actually live.",
    },
    {
      id: "cs-ebay-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The volume-rank bench",
      brief:
        "eBay-flavored brief on the storefront db: the growth review ranks buyers by order volume, with lifetime spend carried alongside, because the loyalty program targets high-frequency buyers first — and the rank must be tie-honest, since several buyers sit at the same order count. Probed facts: all 16 customers have ordered (the never-ordered anti-join is empty); ten buyers clear the 3-order bench; Alice Chen leads with 24 orders ($7,262.35 lifetime), and four buyers tie at 4 orders. The bench ships standard competition ranking — ties share the rank and the next rank leaves the gap.",
      ask: "Return each buyer with at least 3 orders: name, order count, lifetime spend (two decimals), and their competition rank by order count — most orders first, ties sharing a rank.",
      template:
        "SELECT c.name,\n       COUNT(o.id) AS orders,\n       ROUND(SUM(o.total), 2) AS spend,\n       {1}() OVER (ORDER BY COUNT(o.id) {2}) AS volume_rank\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING COUNT(o.id) >= {3}\nORDER BY volume_rank;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the competition ranker",
          why: "RANK gives ties the shared rank AND keeps the gap — four buyers at rank 6, next at rank 10. DENSE_RANK compresses the gap (next becomes 7); ROW_NUMBER breaks the ties arbitrarily.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the volume direction",
          why: "Most orders = rank 1, so the window's ordering descends. ASC crowns the one-order buyers — a correct query that promotes the churn risk instead of the loyalty target.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the bench threshold",
          why: "The bench is buyers with 3+ orders — ten of sixteen qualify. The threshold is a definition the loyalty team owns: 4 would drop Hiro Tanaka (3 orders, 829.09) and Farid Nasser (3 orders, 1458.97).",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A tie-honest leaderboard. The fold is per buyer — GROUP BY c.id over the customer-order join — carrying order count and ROUND(SUM(total),2) (Alice Chen: 24 orders, 7262.35). The window ranks by count descending, and the ties are the test: four buyers sit at 4 orders (Pedro Alvarez 1686.17, Keiko Sato 1098.6, Isabella Rossi 985.65, Noah Meyer 737.68), so RANK gives all four rank 6 and jumps to 10 for the two 3-order buyers. DENSE_RANK would compact the sequence to 7 — the wrong answer when the report promises competition ranking; ROW_NUMBER would split the four arbitrarily into 6/7/8/9, an unreproducible bench. The HAVING threshold keeps the bench at ten buyers — a population definition, not a sort. The distractors are the leaderboard's classic failures: DENSE_RANK erases the gap the business asked to see, ROW_NUMBER makes ties random, ASC inverts the crown, and threshold 4 shrinks the bench by dropping the two 3-order buyers. One rank function, one direction, one threshold — all three are definitions someone owns.",
    },
    {
      id: "cs-ebay-4",
      tier: "easy",
      topic: "t3",
      universe: "funnel",
      title: "The ship-latency read",
      brief:
        "eBay-flavored brief on the storefront db: the ops review opens with the fulfillment clock — created→shipped days, per region. Probed facts: 82 of 103 orders have shipped_at (52 delivered + 30 shipped); latency averages 2.98 days, range 2–4. The regional cut: LATAM 2 orders at 3.50 days, US 15 at 3.07, EU 36 at 2.94, APAC 29 at 2.93. The 14 pending and 7 cancelled orders carry no shipped_at — they must be excluded or the report's whole population drifts.",
      ask: "Return per region: shipped-order count and average created→shipped latency in days (two decimals), slowest region first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS shipped_orders,\n       ROUND({1}(julianday(o.shipped_at) - julianday(o.created_at)), 2) AS avg_days\nFROM orders o\nJOIN customers c ON o.customer_id = c.{2}\nWHERE o.shipped_at IS NOT {3}\nGROUP BY c.region\nORDER BY avg_days {4};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the latency averager",
          why: "AVG of the julianday delta is the mean fulfillment clock — EU's 36 shipped orders average 2.94. SUM would print total days consumed (LATAM's two orders: 7.00); MAX would print the 4-day worst case wearing an average's name.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the customer key",
          why: "Region lives on customers, so the join must carry it through the key — c.id. Joining on city instead fragments the fold into sixteen city rows, and the regional census disappears.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the shipped-only guard",
          why: "IS NOT NULL keeps the 82 orders that actually shipped — the 14 pending and 7 cancelled carry no shipped_at and would poison every count computed beside the average, even though AVG itself skips NULLs.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "The ops review opens on the problem: LATAM's 3.50 before APAC's 2.93. ASC opens with the fastest region — a correct query that buries the escalation.",
        },
      ],
      distractors: ["SUM", "MAX", "city", "ASC"],
      walkthrough:
        "A guarded date-math read. julianday(o.shipped_at) − julianday(o.created_at) is fractional-days latency per order; WHERE shipped_at IS NOT NULL fixes the population at the 82 shipped orders (the pending 14 and cancelled 7 have NULL shipped_at — and while AVG would skip their NULLs, every count beside the average would still lie). The join carries region in through the customer key; GROUP BY c.region folds to the four regions; AVG rounds to the probed cut — LATAM 3.50 (two orders), US 3.07 (15), EU 2.94 (36), APAC 2.93 (29) — and ORDER BY avg_days DESC opens the review with the slowest region. The distractors are the read's failure modes: SUM prints region day-totals (7.00 for LATAM's two orders) instead of a per-order clock; MAX prints the 4-day worst case; joining on city instead of id shatters the regional fold into sixteen city rows; ASC buries LATAM at the bottom of a report that exists to escalate it. One function, one key, one guard, one direction — each is a definition the ops review owns.",
    },
    {
      id: "cs-ebay-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The unpaid-invoice sweep",
      brief:
        "eBay-flavored brief on the storefront db: the month-close opens with the AR sweep — every invoice with no payment row behind it. Probed facts: 28 invoices against 27 payment rows; the coverage census finds 21 exact, one partial (4,000.00 of 6,148.00), and six with NO payment row — five open (873.00, 1295.00, 4937.00, 3562.00, 2794.00) and one marked status 'paid' with zero payment rows behind it (1756.00, invoice 28) — 15,217.00 in total, matching the reconciliation memo's unpaid_amount. The sweep is where the anti-join earns its keep: status columns claim, payment rows prove.",
      ask: "Return every invoice with no payment row: id, number, status, and amount in dollars (two decimals), lowest id first.",
      template:
        "SELECT i.id,\n       i.number,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS amount\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY i.id;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Finance columns are integer cents — invoice 18's row holds 87300, and /100.0 promotes to real dollars (873.00). Integer /100 truncates odd-cent amounts; /1000 mis-scales by a factor of ten.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the preserving join",
          why: "LEFT keeps every invoice and hands the unmatched ones NULL payment payloads — exactly the AR. INNER keeps only paid invoices: the sweep returns zero rows and the receivables vanish from the close.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched test",
          why: "p.id IS NULL selects the survivors of the anti-join — invoices whose payment side never matched. IS NOT NULL returns the opposite census: the 22 invoices that DO have payment rows.",
        },
      ],
      distractors: ["AVG", "INNER", "NOT NULL", "1000"],
      walkthrough:
        "The finance anti-join. LEFT JOIN preserves all 28 invoices; the 22 with at least one payment row fail WHERE p.id IS NULL, and the six survivors ARE the AR exposure — five open (873.00, 1295.00, 4937.00, 3562.00, 2794.00) plus invoice 28, status 'paid', zero payment rows: the reconciliation anomaly the status column alone would have blessed. The unit discipline is part of the answer: amount_cents is integer cents, so /100.0 promotes to dollars before ROUND — /1000 would print 87.30 for an 8,730-cent invoice. The partial payer (invoice 25, 4,000.00 of 6,148.00) correctly stays OUT of the sweep — it has a payment row; it belongs to the coverage census, not the AR. The distractors are the sweep's classic failures: INNER erases the receivables entirely (zero rows — the close ships without its headline); NOT NULL inverts the census to the paid side; AVG isn't a divisor (the query fails); and the wrong scale quietly understates every amount by ten. Population, join type, NULL test, unit — four decisions, one sweep.",
    },
    {
      id: "cs-ebay-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month revenue delta",
      brief:
        "eBay-flavored brief on the storefront db: the growth review needs the revenue trend WITH its deltas — each month's revenue beside the prior month's, and the difference. Probed facts: fourteen buckets, 2024-01 through 2025-02; revenue opens 3731.97 → 3609.64 (−122.33), dips to the July trough 1193.86 (two cancellations that month), posts the largest drop into November (−1326.87) and the sharpest recovery after it (+1158.21). The fold must be staged before the window: rank the buckets after the fold exists, and let the first month's delta be NULL — there is no prior.",
      ask: "Return each month bucket with its revenue (two decimals), the prior month's revenue, and the delta (two decimals), in calendar order.",
      template:
        "WITH monthly AS (\n  SELECT {3} AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       revenue,\n       {1}(revenue) OVER ({2}) AS prev_revenue,\n       ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month;",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-row lookup",
          why: "LAG(revenue) pairs each month with the one before it IN THE RESULT — the prior-revenue column the delta needs. LEAD looks forward (next month's revenue); ROW_NUMBER takes no argument at all.",
        },
        {
          answer: "ORDER BY month",
          kind: "keyword",
          label: "the window's calendar order",
          why: "The window must walk months in calendar sequence or 'prior' means nothing — ORDER BY month inside OVER. ORDER BY revenue pairs every month with its richest neighbor instead.",
        },
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month bucket axis",
          why: "SUBSTR(created_at,1,7) slices the 'YYYY-MM' prefix — fourteen buckets the alias GROUP BY folds on. Bare created_at buckets per-timestamp (103 one-order buckets); STRFTIME('%Y-%m', …) is the equivalent twin, this template pins the SUBSTR form.",
        },
      ],
      distractors: ["LEAD", "ORDER BY revenue", "ROW_NUMBER", "created_at"],
      walkthrough:
        "Window math over a staged fold. The CTE folds 103 orders into fourteen month buckets (SUBSTR(created_at,1,7), revenue ROUNDed — 3731.97 for 2024-01 down to the 1193.86 July trough); the outer SELECT walks the fold with LAG(revenue) OVER (ORDER BY month) for prior revenue and revenue − LAG(...) for the delta — −122.33 into February, −992.56 into March, −1326.87 into November, +1158.21 into August. The first month's prev and delta are legitimately NULL — no prior row exists; the report footnotes it rather than faking a 0. Two structural lessons ride along: windows compute AFTER aggregation, so the fold must be staged (CTE or derived table) before LAG can walk it; and the window's ORDER BY is the definition of 'prior' — order by revenue instead and every month compares against the 3731.97 peak, producing deltas that measure nothing. The distractors are the trend-read's failures: LEAD points the comparison at the future, ROW_NUMBER can't carry a revenue argument, ORDER BY revenue scrambles the pairing, and a per-timestamp bucket shatters the fourteen-month fold.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-i", why: "The join warm-up eBay opens with: transaction lines joined to products — the listing-to-sale bridge at its simplest grain." },
    { slug: "product-sales-analysis-ii", why: "Per-product totals by year — the aggregate-then-rank escalation eBay runs on every leaderboard, tagged directly." },
    { slug: "product-sales-analysis-iii", why: "Top two periods per product — the per-group top-N with ties, eBay's most-drilled escalation shape." },
    { slug: "article-views-i", why: "Distinct-author reads on a content table — the DISTINCT-fold vocabulary check, tagged by eBay." },
    { slug: "article-views-ii", why: "Views seen by EVERYONE — relational division over the audience set, the exclusive-fanout read eBay tags." },
    { slug: "sales-person", why: "The two-sided mapping: salespeople against accounts, with the unpaired side surfaced — trust-graph reading in canonical form." },
    { slug: "sales-analysis-i", why: "Seller totals joined to a dimension — the per-seller fold that opens every eBay screen's leaderboard act." },
    { slug: "sales-analysis-ii", why: "Salespeople with only local sales — a two-condition anti-join over the bridge table, tagged by eBay." },
    { slug: "sales-analysis-iii", why: "Top-2 per salesperson by year — the aggregate-then-window composition on the seller grain." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume argmax: who transacts most, decided on a grouped count — the buyer-side leaderboard, tagged by eBay." },
    { slug: "sellers-with-no-sales", why: "THE eBay question: sellers whose listings never transacted — the anti-join canon, tagged directly." },
    { slug: "tree-node", why: "CASE classification over self-referencing structure — root/inner/leaf buckets, the CASE-axis drill eBay tags." },
    { slug: "rectangle-area", why: "Non-equi range joins covering covered cells — the banded-comparison escalation in eBay's tagged pool." },
    { slug: "weather-type-in-each-country", why: "CASE-classified aggregates across a three-table chain — classification + join composition, tagged by eBay." },
    { slug: "team-scores-in-football-tournament", why: "Business formulas over grouped matches — points computed at the right grain, the eBay ops-read staple." },
    { slug: "linear-multi-touch", why: "Credit split across touchpoints as conditional sums — the attribution fold from eBay's tagged pool, and the denominator conversation it forces." },
    { slug: "confirmation-rate", why: "Rate math over a nullable behavior column with a COALESCE guard — the buyer-side twin of eBay's trust rates, where non-confirmers stay in the denominator on purpose." },
    { slug: "average-selling-price", why: "ASP over date-bounded joins — what a listing actually sold for inside its window, folded at the join's grain; the marketplace pricing read." },
    { slug: "list-the-products-ordered-in-a-period", why: "A period-bounded sales census — one month's sold listings with quantities and totals; the month-close catalog read eBay category teams run on the calendar axis." },
    { slug: "find-golden-hour-customers", why: "Buyers' golden hours — the date-part fold that says WHEN demand actually transacts; eBay's session-clock read on event timestamps." },
    { slug: "week-over-week-churn", why: "LAG-driven week-over-week status changes — the repeat-buyer drift read; when last week's buyers stop ordering, the delta column is the alarm." },
    { slug: "growth-accounting", why: "New / reactivating / lapsed classification per period — growth accounting on the seller bench: is the marketplace adding sellers or recycling them?" },
    { slug: "product-price-at-a-given-date", why: "The as-of price read — what a listing cost on a given day when prices move; eBay's fee-schedule lookups are exactly this shape." },
    { slug: "movie-rating", why: "A two-leg leaderboard stacked with UNION — newest here, most-active there; the stacked-population read behind eBay's buyer-vs-seller boards." },
    { slug: "count-salary-categories", why: "Zero-filled tier counts via UNION ALL — the trust-tier census that must show EMPTY tiers as zeros, not absent rows." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Bought A and B but not C — set membership as conditional aggregation; the basket-pair logic behind eBay's 'completes the collection' merchandising." },
    { slug: "market-analysis-i", why: "Buyer-and-seller census with subqueries — two populations, one joined-by-nothing market; the two-sided onboarding read in canonical form." },
    { slug: "repeat-purchase-rate", why: "Share of buyers who came back — the repeat-purchase fold on the order grain; eBay's loyalty story starts at this denominator." },
    { slug: "basket-depth-aov", why: "Items per order and AOV in one fold — basket depth; 251 items across 103 orders on the live db is exactly this read at the right grain." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary bands via NTILE — the buyer quartiles the loyalty program targets, cut from the spend census." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — one row per listing from a stream of snapshots; catalog dedupe in canonical form." },
    { slug: "null-blank-audit", why: "The NULL-and-blank census — conditional sums over nullable columns that count the gaps instead of dropping them; the trust graph's hygiene check." },
  ],
};
