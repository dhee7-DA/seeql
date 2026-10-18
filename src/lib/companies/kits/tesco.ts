// Tesco — Wave-9 (Task 98), food domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12).
// UK grocery at store-format scale: the storefront db read as a grocer's
// trading sandbox — customers are Clubcard members (region = UK-region bucket,
// carried as the db's EU/APAC/US/LATAM codes), orders are baskets
// (delivered = completed basket — online order or store till take, shipped =
// online order out for delivery with shipped_at as the van-dispatch stamp,
// pending = click+collect awaiting pickup, cancelled = abandoned basket),
// order_items are basket lines (quantity = units, unit_price = shelf price;
// Clubcard Prices ride as promo variants), products are grocery SKUs by aisle
// (category), suppliers are FMCG suppliers, invoices are supplier settlement
// statements, payments are tender/settlement legs, all money tables INTEGER
// cents. Pool provenance: company-pools.md carries NO Tesco section (0 tagged
// rows, none SQL-graded), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu — sql rows only, no w*/d*/f*
// rows — and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const tescoKit: CompanyKit = {
  id: "tesco",
  domainId: "food",
  name: "Tesco",
  tagline: "UK grocery at format scale — Clubcard, vans, aisles",
  accent: "text-blue-400",

  brief: [
    "**Tesco** is the UK's largest grocer — a network that runs from Extra hypermarkets down through Superstores, Metros and Express convenience stores, plus the Tesco Online delivery business and Whoosh rapid delivery, with F&F clothing riding alongside the food. The loyalty engine is Clubcard: points on every shop, and {amber:Clubcard Prices} — member-only shelf prices that make the same SKU print two different numbers at the till. That duality is the analyst's daily reality here: *the shelf price and the paid price are different facts*, and baskets, not visits, are the unit of trade. This kit maps the storefront db onto that world: the 16 customers rows are Clubcard members, the 103 orders are baskets worth **34,833.28**, and the 251 order_items rows are basket lines — quantity = units, unit_price = the line price actually paid. The status map is fixed: delivered = {emerald:completed basket} (52, 50.5% — till take or landed online order), shipped = {sky:out for delivery} (30, 29.1%, shipped_at = the van-dispatch stamp), pending = click+collect awaiting pickup (14, 13.6%), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits the way a grocer's P&L does. Commercial analysts own aisles and suppliers — category revenue folds, the weekly **promo/price audit**, and the {amber:Clubcard Prices} effective-price read. Network analytics own the vans and the slots: shipped_at is the dispatch stamp, and the **82 of 103** stamped baskets average **2.98 days** created-to-dispatch with a 2–4 day spread — the latency number that decides whether the online promise holds. Clubcard and CRM analytics own segments and coupon response — **63.5%** of revenue sits with members whose lifetime spend crosses 3,000 (71.2% above 2,000), so one lapsed household moves a region. Finance ops own the supplier settlement book: 28 statements and 27 settlement legs in INTEGER cents, where the dollar read is `amount_cents / 100.0` — the missing .0 is how a settlement quietly leaks half-pennies on every odd-cent line.",
    "Interview screens are census-then-denominator, grocery-flavored. A typical loop opens with a **two-grain regional read** — EU runs 45 baskets from just 8 members while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'does an abandoned basket count in your base?'*), then into a status census where the four branches must reconcile to 103 by construction. Late rounds walk the {sky:14-month trading spine} (2024-01 to 2025-02), band the range into value versus standard with `CASE`, or rank the Clubcard ladder where four members sit tied at 4 baskets and rank semantics become a business decision. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Tesco section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: basket-status censuses, two-grain store reads, aisle revenue folds, promo price-band `CASE` work, and the cents-safe settlement spine. Do the topics in order, then run the six case studies on the live storefront db, spaced out rather than in one sitting: the {emerald:basket-status census} regional ops opens the Monday trade meeting with, the {amber:shelf-band promo audit} commercial runs before a price move, the {rose:never-settled statement list} finance chases at month-end, the {sky:double-points calendar} the loyalty desk plans from the trading spine, the {violet:program-spend stack} with its grand-total row, and the {emerald:shelf-cover board} availability analysts walk before the weekend. Re-run each a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the 32-problem pool and the theory bank below, and treat the walkthroughs as the real content: they narrate what each wrong chip does to the read. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the overnight online read. A network analyst opens the van dashboard before the trade meeting: did the overnight `shipped_at` stamps land, is any click+collect order aging past its promised slot, does the one-pass status census reconcile — 52 completed + 30 out for delivery + 14 awaiting pickup + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If dispatch latency drifts off the **2.98-day** norm — regional reads run EU 2.94, APAC 2.93, US 3.07 — the slot plan gets pulled before the morning read ships.",
    "**11:30 —** Midday is the commercial read. The price-promo pod wants the shelf-band audit refreshed — the range splits **8 value SKUs averaging 32.06** and **8 standard SKUs averaging 111.5**, ceiling 199.99 with the 200-plus band empty — and a category manager wants aisle revenue re-cut two ways: shelf price versus the price shoppers actually paid with {amber:Clubcard Prices} live. The Clubcard desk wants the ladder re-ranked with the four-way tie at 4 baskets handled honestly — shared rungs, named policy. Each ask is a join, a conditional aggregate and one judgment call about statuses; the analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the trade-meeting argument*.",
    "**15:45 —** The afternoon tilts toward the settlement book. The AR anti-join refreshes first — **6 never-settled statements worth 15,217** — before supplier services sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Basket completion mix", what: "Completed baskets (store till take or online landed) ÷ all baskets: 52 of 103 (50.5%). The headline every Monday trade meeting opens with — a status-filtered conditional count with the denominator built in." },
    { name: "Online dispatch share", what: "Baskets out for delivery (status shipped) ÷ all: 30 of 103 (29.1%), with shipped_at as the van-dispatch stamp. The online-versus-store split that drives slot capacity and van fleet planning." },
    { name: "Click+collect queue", what: "Baskets awaiting pickup (status pending): 14 of 103 (13.6%). 'Not yet' is a population, never a silent zero — these rows have no van stamp and no completion yet." },
    { name: "Abandoned-basket share", what: "Abandoned baskets ÷ all, per region: EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0.0. The honest-denominator metric — numerator and denominator must fold over the same basket base." },
    { name: "Basket value & AOV", what: "Total basket value 34,833.28 across 103 baskets, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the mission story — the 1,088.44 trolley outweighs the 25.47 smallest basket 42 times over." },
    { name: "Van dispatch latency", what: "Created_at to shipped_at over dispatched baskets only: 82 stamped, 2.98-day average, range 2–4. The population ships with the number — awaiting and abandoned baskets have no latency yet." },
    { name: "Clubcard concentration", what: "Share of revenue from members whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The number that staffs the CRM pod and sizes the coupon budget — one lapsed household moves a region." },
    { name: "Supplier concentration", what: "Share of the 34,833.28 shelf book by FMCG supplier: the top bench carries 32% (Nordic, rated 4.6) and 26.7% (Midwest, rated 4.4). Supplier terms and settlement priority follow this ranking." },
  ],

  topics: [
    {
      name: "Basket-status conditional counting",
      why: "Every Tesco trade read starts from the same fold: completed, out for delivery, awaiting pickup, abandoned — one status column, four business meanings. Each branch is a conditional count, and the interviewer's first question is what the denominator holds. The trap is calling an out-for-delivery order 'completed' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "percentage-of-users-attended-a-contest", "immediate-food-delivery-iii", "human-traffic-of-stadium"],
    },
    {
      name: "Two-grain store reads",
      why: "Baskets and members are different grains of the same join, and every regional read reports both: EU runs 45 baskets from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "find-the-median", "user-purchase-platform"],
    },
    {
      name: "Shelf-to-basket joins",
      why: "Aisle reporting means attaching category, supplier and shelf price to every basket line — joins across the product and demand tables where the mapping is the point. Tesco's follow-up is always about survival: does a SKU missing its supplier row still count in the aisle fold, and which join type answers honestly?",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier", "warehouse-manager"],
    },
    {
      name: "Aisle revenue folds",
      why: "Category revenue is the commercial heartbeat: fold basket lines by aisle, round to the penny, and rank. The audits here drill exactly the join-then-aggregate shape the Monday pack is built from — with the discipline that 251 lines fold into 103 baskets, not the other way round.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "students-and-examinations", "fifo-inventory-cogs"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets completed, dispatched, awaiting and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. This kit's first case study is exactly this census.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "CASE banding on the shelf",
      why: "The range is banded — value under 50, standard at 50-plus, the premium band provably empty — and every price-tier read is a CASE classification with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the promo forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-winner-university", "calculate-product-final-price", "count-salary-categories", "transactions-per-visit-histogram"],
    },
    {
      name: "Ranking the Clubcard ladder",
      why: "Top members by basket count and lifetime spend is leaderboard reporting where ties are guaranteed — four members sit at 4 baskets on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer households, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary", "compute-the-rank-as-a-percentage", "usage-tier-percentiles", "the-most-recent-three-orders", "second-most-recent-activity"],
    },
    {
      name: "NULL policy at the dispatch stamp",
      why: "A basket carries a NULL shipped_at until the van rolls — 82 of 103 do, and the 14 awaiting plus 7 abandoned never will. Tesco screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "confirmation-rate", "books-with-null-ratings"],
    },
    {
      name: "Promo windows & date math",
      why: "Promo windows make date arithmetic a daily tool: units moved in a period, the last shop before a price change, baskets inside the Clubcard Prices window. Tesco probes half-open intervals — BETWEEN on timestamps loses the last night of the promo.",
      slugs: ["list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "users-with-two-purchases-within-seven-days", "seasonal-sales-analysis", "friday-purchases-i", "calculate-orders-within-each-interval"],
    },
    {
      name: "Basket folds & shelf-label hygiene",
      why: "The daily basket read folds each day's lines into one comma-separated cell per trade date, and shelf-label feeds arrive messy: product names in mixed case, member names in ALL CAPS. String reshaping — GROUP_CONCAT folds, case normalization, SUBSTR extraction — is the warm-up round, because a join on a dirty key silently splits one SKU into two.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "fix-names-in-a-table"],
    },
  ],

  theory: [
    {
      id: "tesco-t1",
      q: "Your aisle P&L joins basket lines to Clubcard members through the SKU table. When do you INNER and when do you LEFT — and what silently breaks if you filter a basket column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An aisle-revenue report joins basket lines to products and members: a line with no product row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A 'members who registered but never scanned' report must be LEFT from members: the unmatched members ARE the answer, arriving with NULL basket columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the lapsed-member list vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-bought members — all 16 appear in the basket table somewhere — and proving that zero is itself the analyst's job. Join type is a decision about who survives, not a habit.",
      tag: "joins",
    },
    {
      id: "tesco-t2",
      q: "Four Clubcard members sit tied at 4 baskets on the frequency ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose household gets the voucher budget. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer households (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "tesco-t3",
      q: "The regional read shows 103 baskets and 16 members; EU shows 45 baskets from 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts basket rows after the join — one row per basket, so a member with 24 baskets contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 baskets collapse to 8 households. Neither is wrong: baskets measure load on tills and vans, members measure installed base and reach. The ratio — 5.6 baskets per member in EU versus 9.5 in the US on this db — is the intensity signal that says US demand concentrates in two heavy households. The trap that catches candidates is a third grain: join order_items for basket lines and COUNT(*) silently counts lines, not baskets — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "tesco-t4",
      q: "shipped_at is NULL until a van is dispatched. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched baskets have a latency, so the report measures created_at to shipped_at for the 82 of 103 baskets that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL baskets returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 awaiting pickup plus 7 abandoned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for click+collect orders that have not been picked. A report whose WHERE clause is doing definitional work without saying so is exactly what a Tesco reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "tesco-t5",
      q: "Ops wants abandoned-basket share per region, but only for regions carrying at least ten baskets. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards completed, dispatched and awaiting rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-basket floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a regional map and an error, and between a threshold applied to baskets versus to pounds. The strong answer places every filter by asking: is this a fact about one basket, or about a region? On this db the floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2.",
      tag: "pipeline",
    },
    {
      id: "tesco-t6",
      q: "Which members beat the platform-average basket value? Walk me through the scalar subquery — what is it allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison — on this db the platform mean is 338.19 across 103 baskets — and zero rows return NULL, not an error, so total > NULL is UNKNOWN and the above-average list silently returns nothing while looking valid. On the full table that is theoretical; on filtered staging tables — one region, one status, one promo month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each basket to ITS member's average) re-runs per outer row and answers a different question at a different cost — habituals against their own norm, not the platform's. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "tesco-t7",
      q: "The trading calendar buckets baskets by month on TEXT timestamps. How do you build the spine, cut a promo window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The promo window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's baskets, and promo-end is exactly when the online shop spikes. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is trading discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "tesco-t8",
      q: "Finance says a supplier settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats half-pennies on every odd-cent line. The close's identity: coverage must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 against 181,080 — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "tesco-t9",
      q: "Store ops wants one row per trading date with every basket's status folded into a single cell. Walk me through GROUP_CONCAT — what it returns, what it does NOT guarantee, and when you would not use it.",
      a: "GROUP_CONCAT is the fold that turns many rows into one TEXT cell: GROUP BY created_at with GROUP_CONCAT(status) prints every basket's fate for the day joined by commas — the daily basket read the pick list and the Monday pack both start from. What it does NOT guarantee is order: the concatenation sequence is unspecified unless you feed it ordered rows from a subquery, so never present the cell as a sequence. It also silently drops NULLs, so a status column that can be NULL folds shorter than the group's row count — compare against COUNT(*) when completeness matters. And it is a one-way door: the cell is display-shaped, not query-shaped, so anything downstream that needs to filter or count by status must go back to the rows. Use it for the hand-off cell, not the source of truth.",
      tag: "groupby",
    },
    {
      id: "tesco-t10",
      q: "The van clock and the trading spine both come from the same TEXT timestamps. When do you reach for julianday and when for STRFTIME, and what breaks if you swap them?",
      a: "julianday converts a timestamp into a real number of days, so differences are arithmetic: julianday(shipped_at) - julianday(created_at) is the dispatch latency — the 2.98-day average over the 82 stamped baskets, fractional days and all. STRFTIME('%Y-%m', created_at) is a bucketing tool: it folds timestamps into 'YYYY-MM' TEXT keys and the 14-month spine falls out of a GROUP BY. Swap them and both reads break: julianday of a month bucket measures nothing (and a bucket minus a timestamp is meaningless), while subtracting STRFTIME strings does text arithmetic that looks numeric and isn't. The pairing rule: julianday for durations and windows, STRFTIME for the spine and its ORDER BY — and the zero-padding in '%Y-%m' is what keeps January 2025 from merging into January 2024.",
      tag: "dates",
    },
    {
      id: "tesco-t11",
      q: "The range is banded value / standard / premium. Walk me through writing that CASE so the promo forecast cannot silently lose a SKU — what are the rules for the arms?",
      a: "Three rules. Exhaustive: every shelf price must land somewhere — here value is under 50, standard is 50 up to 200, and premium is the ELSE, so nothing can fall through; a missing ELSE returns NULL, and a NULL band is a SKU the promo forecast cannot see. Ordered and non-overlapping: the arms are checked top to bottom, so put the narrower edge first — WHEN price < 50, WHEN price < 200 — and a SKU at exactly 49.99 or 50 lands where the published pricing page says it does. Stable labels: the arms print the published band names, because the promo calendar joins on those strings — 'value' versus 'standard' is a key, not a caption. On this db the premium arm is provably empty (ceiling 199.99), and knowing that from the CASE — rather than discovering a missing band row in the deck — is exactly the discipline the banding exercise grades.",
      tag: "case-when",
    },
    {
      id: "tesco-t12",
      q: "Commercial wants members who bought from the Audio aisle but never touched Video. Compare the three shapes — EXCEPT, LEFT JOIN + IS NULL, NOT EXISTS — and say which you would ship.",
      a: "All three can answer it, but they fail differently. EXCEPT is the set-algebra read: SELECT member FROM audio-baskets EXCEPT SELECT member FROM video-baskets — directional, deduped, and it requires both sides to project the same columns; flip the operands and you answer the opposite question. LEFT JOIN + IS NULL is the grain-preserving workhorse: LEFT from the Audio side, attach Video lines, keep the NULL payload — it composes with other columns in the same query, which is why it is the everyday shape. NOT EXISTS is the NULL-proof one: a correlated existence test that cannot be poisoned by a NULL in the compared column the way NOT IN can. On this db the Audio-only list is a real cohort, and I would ship NOT EXISTS or the LEFT JOIN: both keep the member grain and survive the messy staging tables where EXCEPT's strict column contracts and NOT IN's three-valued logic bite.",
      tag: "setops",
    },
    {
      id: "tesco-t13",
      q: "What is your COALESCE policy at Tesco — when is replacing a NULL legitimate, and when does it manufacture data?",
      a: "COALESCE is legitimate for display: a share column that would print NULL for a region with no abandoned baskets reads better as 0.0, because zero abandons is a measured fact and the reader should not parse NULL as 'no data'. It is legitimate for defaults the business actually holds: a missing optional attribute whose absence means 'none'. It manufactures data the moment it fills a NULL that means 'not yet' — COALESCE(shipped_at, created_at) makes every click+collect and abandoned basket claim same-day dispatch, the latency average collapses off the 2.98-day norm, and the van plan is built on trips that never happened. The test I say out loud: does the NULL mean none (safe to default) or not-yet / never (data to report)? If it is not-yet, the NULL stays in the query and the population statement goes in the report title.",
      tag: "nulls",
    },
    {
      id: "tesco-t14",
      q: "CRM wants the Clubcard book split into spend quartiles for the next coupon drop. How do you build the tiles, and what do you check before the list ships?",
      a: "NTILE(4) OVER (ORDER BY lifetime_spend) cuts the 16 members into four equal bands — tile 1 is the lowest-spending quartile, tile 4 the highest — and the ORDER BY direction decides which end is which, so state it: biggest spenders in tile 4 for the premium drop. The checks before the list ships: ties at a boundary — NTILE assigns ties by arbitrary order unless you add a tie-breaker like spend, then member id, and two households with identical spend can straddle tiles 2 and 3, which the CRM pod must sign off on because it decides who gets which coupon; and the grain — the window runs over members, so the input must already be one row per member, folded from baskets first. NTILE versus hand-rolled percentiles: NTILE promises equal COUNTS, not equal spend ranges — tile 4 holds a quarter of the members, not a quarter of the book's value, and on a concentrated book (63.5% of revenue from 3,000-plus spenders) that distinction is the whole brief.",
      tag: "windows",
    },
    {
      id: "tesco-t15",
      q: "GROUP BY month works when month is a SELECT alias on this spine. What is actually happening, and why is alias-in-GROUP-BY a habit to treat carefully?",
      a: "SQLite resolves SELECT aliases in GROUP BY (and HAVING and ORDER BY), so GROUP BY month where month is the STRFTIME alias folds the rows on the folded expression — convenient, and the tesco spine leans on it. The caution: most engines either reject aliases in GROUP BY or resolve them differently, and the alias can shadow a real column of the same name, so a query that runs here can fail on the warehouse or silently group by the wrong thing. The portable habit is grouping by the full expression — GROUP BY STRFTIME('%Y-%m', created_at) — or staging the spine in a CTE where month is a real column of the derived table, then grouping on it downstream. What I never do is mix both: an alias that matches a base column name plus GROUP BY on that name is exactly how one basket's month quietly becomes two. Alias-GROUP-BY is a convenience, not a standard, and I name it as one in the query comment.",
      tag: "groupby",
    },
    {
      id: "tesco-t16",
      q: "A shelf-label feed lands with 'cycling jersey pro', 'CYCLING JERSEY PRO' and 'Cycling Jersey Pro' for one SKU. What breaks, and what is the cleaning pass before any join?",
      a: "The join key splits: group by the raw name and one SKU becomes three rows, the aisle fold undercounts every downstream revenue figure, and nothing errors — the numbers are just quietly wrong. The cleaning pass: normalize case first (UPPER or LOWER for a comparison key; UPPER-plus-LOWER only when a display name needs title case), TRIM the padding that copy-paste feeds carry, and collapse whitespace before the strings ever meet a join or a GROUP BY. Do it in a staged CTE — clean, then join — so the analysis query reads clean keys and the cleaning rules are auditable in one place. Then prove the fold: COUNT(DISTINCT cleaned_name) should return one row for this SKU, and the aisle totals must still foot to the 34,833.28 book. Casing is not cosmetics here; a dirty key is a silent fan-out, and the interviewer wants the cleaning stated as a step, not assumed.",
      tag: "casing",
    },
    {
      id: "tesco-t17",
      q: "Compare each basket to the platform mean (338.19) and compare each basket to its OWN member's mean. Two subquery shapes — walk me through both and when each is the right tool.",
      a: "The platform read is a scalar subquery: (SELECT AVG(total) FROM orders) evaluates once, returns one number — 338.19 — and every row compares against the same constant; it is uncorrelated, cheap, and answers 'which baskets are big for the store?'. The per-member read is a correlated subquery: (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) re-runs for every outer row and compares each basket to its own household's norm — a 24-basket habitual against their 302.60 average is a different signal than the same basket against 338.19. The correlated shape answers 'who is shopping off-pattern?', which is the Clubcard save-campaign question; the scalar shape answers 'who is heavy for the platform?', which is the trade question. The follow-up I expect to get: what happens when the inner fold is empty — the scalar returns NULL, the comparison goes UNKNOWN, and the report silently narrows; on staging tables that is where above-average filters go to hide.",
      tag: "subqueries",
    },
    {
      id: "tesco-t18",
      q: "The aisle pack wants every basket line to carry its share of its region's revenue — without collapsing the line grain. Why a window and not a GROUP BY?",
      a: "GROUP BY region would fold 103 baskets into 4 rows and destroy the line detail the pack prints beside every share; a window computes the denominator without collapsing anything. SUM(total) OVER (PARTITION BY region) rides every row and holds that region's revenue total, so the share expression 100.0 * total / that window divides each line by ITS region's book — EU lines divide by 15,089.23, US lines by 7,286.16 — while every basket keeps its row. The distinction I state out loud: GROUP BY changes the grain, a window keeps the grain and adds a column. PARTITION BY region is the GROUP BY's non-destructive twin, and the same pattern extends to moving denominators — SUM(revenue) OVER (PARTITION BY region, month) for a month-within-region share. The one trap: the window's total includes cancelled baskets unless the filter is applied before the window sees the rows, so the denominator's definition ships with the query, same as any aggregate.",
      tag: "windows",
    },
    {
      id: "tesco-t19",
      q: "The settlement book is INTEGER cents; the basket book is REAL dollars. Explain the two money conventions and the one rule that keeps them honest in the same report.",
      a: "The basket book (orders.total, order_items.unit_price) is REAL dollars already — sum it and round at the end. The finance book (invoices.amount_cents, payments.amount_cents, expenses.amount_cents) is INTEGER cents, and the dollar read is amount_cents / 100.0. The rule is the .0: integer ÷ integer truncates, so 92550 / 100 prints 925 and every odd-cent line quietly loses its half-pennies — the .0 promotes the division to real arithmetic before any damage. The compounding trap is ROUND: ROUND(amount_cents, 2) folds nothing (the cents are already integers) and ROUND after a truncated division cannot recover the digits it ate. And never mix conventions in one expression: SUM(total) + SUM(amount_cents)/100.0 is fine, SUM(total) + SUM(amount_cents) is a 100× lie in one term. The close's identity — ledger trial balance 181,080 against 181,080 — only reconciles when every cent read is the /100.0 read.",
      tag: "money",
    },
    {
      id: "tesco-t20",
      q: "The CRM list paginates the ladder with ORDER BY lifetime_spend DESC LIMIT 20 OFFSET 20. What breaks on ties, and how do you make pagination reproducible?",
      a: "LIMIT/OFFSET cuts positions, not values, and positions among tied rows are arbitrary — four members tied at 4 baskets straddle a page boundary differently on every run unless the sort is total. The fix is a deterministic ORDER BY: lifetime_spend DESC, then a named tie-breaker (member id, or created_at, then id), so every run orders identically and OFFSET lands on the same rows. The honest alternative for ladders is a rank window — RANK or DENSE_RANK over the spend — and paginate on the rank, so a tie block travels together and the page cut cannot split peer households. Two more habits: OFFSET without LIMIT is meaningless, and deep OFFSET re-scans everything it skips, so big exports should keyset (WHERE (spend, id) < last-row) instead. The interviewer's follow-up is 'what does page 2 mean when rank 20 is shared four ways?' — and the answer is the named tie-breaker policy, written in the query comment.",
      tag: "ordering",
    },
    {
      id: "tesco-t21",
      q: "The ops board gets completed, dispatched, awaiting and abandoned in one pass. Compare FILTER (WHERE …) with SUM(CASE …) — which do you ship, and why does one scan beat four queries?",
      a: "Both count conditionally in one pass: COUNT(*) FILTER (WHERE status = 'delivered') and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) produce the same 52 over the same rows — FILTER is the readable dialect form, SUM(CASE) is the portable one that runs anywhere, and I match the form to the team's engine. One scan beats four queries for the reason the trade meeting cares about: shared denominators. Four separate queries run at four moments against four snapshots of the data, and the four branches stop summing to 103 — the reconciliation identity fails and the census is no longer provable. In one pass the branches partition the same rows, the identity holds by construction, and any rate built from sibling branches cannot drift. The same logic applies to shares: the abandoned share divides the cancelled FILTER by COUNT(*) from the same scan — the denominator is the numerator's sibling, not a separate query's answer.",
      tag: "case-when",
    },
    {
      id: "tesco-t22",
      q: "DISTINCT versus GROUP BY — when does deduplicating and folding do the same job, and when do they diverge?",
      a: "On one column with no aggregates they coincide: SELECT DISTINCT region FROM orders and SELECT region FROM orders GROUP BY region print the same four rows. They diverge the moment anything else enters. Add a second column and DISTINCT dedups the PAIR — region with status prints every combination present, not one row per region — while GROUP BY region with an aggregate folds to the region grain. Add an aggregate and DISTINCT cannot do the job at all: COUNT(DISTINCT customer_id) is an aggregate over a deduplicated set inside the fold, which is how 45 baskets collapse to 8 members — DISTINCT inside the counter, not in front of the SELECT. The habit the panel grades: name the grain first. 'One row per region' is a GROUP BY; 'which regions exist' is a DISTINCT; 'how many members' is COUNT(DISTINCT). Reaching for DISTINCT in front of a SELECT to 'remove duplicates' usually means the join fanned out and the real bug is upstream.",
      tag: "distinct",
    },
    {
      id: "tesco-t23",
      q: "The regional read wants only regions whose abandoned share exceeds 5% — a threshold on a computed ratio. Where does that filter live, and why can't you just write WHERE abandon_pct > 5?",
      a: "The share is an aggregate expression — a folded numerator over a folded denominator — so it does not exist until after GROUP BY, and WHERE runs before any folding: WHERE abandon_pct > 5 errors, and filtering on the raw status in WHERE answers a different question (baskets, not regions). The threshold lives in HAVING: GROUP BY region, then HAVING 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) > 5 — written out, because the SELECT alias abandon_pct is not portable into HAVING on every engine even where SQLite tolerates it. On this db the threshold keeps EU 6.7 and APAC 8.1 and drops US 5.3 and LATAM 0.0 — a one-line change that rewrites the abandonment map, which is why the threshold's home is part of the definition. The staged alternative: fold the shares in a CTE, then WHERE on the folded column in the outer query — same result, and the pipeline reads top to bottom.",
      tag: "pipeline",
    },
    {
      id: "tesco-t24",
      q: "Your month spine stages in a CTE, then the outer query layers LAG and the percentage. Why stage at all instead of writing one query — and what does the CTE buy when the reviewer asks 'how do you know?'",
      a: "Because the window layer cannot see what WHERE is about to do, and WHERE cannot see what the window computed — the two layers have to be sequenced, and a CTE is the sequencer. The inner fold builds the spine: 14 monthly buckets, trips and revenue per bucket, grain one row per month. The outer query then walks it: LAG(revenue) OVER (ORDER BY month) reads the prior bucket, the percentage divides the delta by that same LAG, and the first month's NULL is the honest baseline. In one flat query those references would be repeated three times, the fold and the window would blur, and the reviewer's 'how do you know?' would land on a wall of nested parentheses instead of two named stages. The CTE also buys testability — run the spine alone and check it foots to 103 baskets and 34,833.28 before any window touches it — and reuse, because the same spine feeds the trend deck, the double-points calendar and the close pack. Name the CTE for its grain (monthly, not t1) and the query narrates itself.",
      tag: "ctes",
    },
  ],

  mcqs: [
    {
      id: "tesco-mcq-1",
      prompt: "A basket row's status reads 'shipped'. In this kit's Tesco stage map, what happened?",
      choices: ["Completed — the shop is done and counted", "Out for delivery — online order on the van, not yet landed", "Click+collect awaiting pickup", "Abandoned basket"],
      answer: 1,
      why: "The stage map is fixed: shipped = online order out for delivery — 30 of 103 baskets (29.1%) — with shipped_at as the van-dispatch stamp. The shop is NOT complete until it lands as 'delivered'.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 of 103 (50.5%). Counting the 30 van loads as completed inflates the till before a single order lands, and the completion mix stops tying to the 103-basket base." },
        { choice: 2, why: "Click+collect is 'pending' — 14 baskets awaiting pickup. Those orders never get a van stamp; confusing the two populations corrupts both the latency read and the slot plan." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-2",
      prompt: "The click+collect queue is which status, and how many baskets sit in it on this db?",
      choices: ["pending — 14 baskets (13.6%)", "shipped — 30 baskets (29.1%)", "cancelled — 7 baskets (6.8%)", "delivered — 52 baskets (50.5%)"],
      answer: 0,
      why: "Click+collect awaiting pickup maps to 'pending' — 14 of 103. These baskets exist, have value, and must stay in every denominator; they simply have no van stamp yet.",
      notes: [
        { choice: 1, why: "30 shipped baskets are on vans — the online-dispatch population. Reading the van fleet as the collect queue doubles the slot problem and empties the dispatch board." },
        { choice: 2, why: "7 cancelled baskets are abandoned demand — gone, not waiting. Treating abandons as a queue turns a demand-quality metric into a fake ops backlog." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-3",
      prompt: "EU runs 45 baskets from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts basket rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 baskets per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every basket has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "SUM(total)/COUNT(*) is AOV — a value metric, not a census. It answers 'how big is the trolley', not 'how many households'." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned baskets only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandoned share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandoned map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-5",
      prompt: "Keep only regions carrying at least 10 baskets. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE baskets >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A basket-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'baskets' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The click+collect baskets double-counted their created day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 baskets.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-7",
      prompt: "The Clubcard ladder runs 24, 17, 14, 13, 5 baskets, then FOUR members tied at 4. Under RANK, what rank do the two 3-basket members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-basket members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The published CRM policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-8",
      prompt: "A staging-table lapsed-member list uses member_id NOT IN (SELECT customer_id FROM baskets WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every basket carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty lapsed-member lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-9",
      prompt: "A board stack puts value-band SKUs under standard-band SKUs in one layout, built with UNION. A reviewer says one SKU's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same SKU, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same SKU, same counts, no band or branch label — collapse into one, and the board loses a SKU with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-10",
      prompt: "A dashboard walks basket value transaction by transaction: SUM(total) OVER (ORDER BY created_at). Two baskets share a created_at second, and the cumulative 'jumps two baskets at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at basket grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-11",
      prompt: "Store ops wants one row per trading date with every basket's status folded into a single cell: `SELECT created_at, GROUP_CONCAT(status) FROM orders GROUP BY created_at`. What does the second column hold?",
      choices: [
        "One arbitrary status per date",
        "Every basket's status joined into one comma-separated TEXT cell — order within the cell not guaranteed",
        "The four status counts for the date, summed",
        "NULL — GROUP_CONCAT cannot run on a TEXT column",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds the group's values into one delimited TEXT cell — the daily basket read ops starts from. The spec does not guarantee the order of values inside the cell, so it is a hand-off cell, not a sequence.",
      notes: [
        { choice: 0, why: "One arbitrary value per group is MAX(status) or ANY_VALUE behavior — GROUP_CONCAT folds ALL of them, which is the entire point of the pick-list fold." },
        { choice: 3, why: "TEXT is exactly what GROUP_CONCAT is built for. The real limitations are silent NULL-dropping and unordered output — neither is an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-12",
      prompt: "The van clock is `julianday(shipped_at) - julianday(created_at)` over dispatched baskets. What is one unit of the result?",
      choices: [
        "Seconds between booking and dispatch",
        "Days — whole and fractional — between booking and van dispatch, so the 2.98 average reads in days",
        "The count of baskets dispatched",
        "Hours, always rounded to the nearest hour",
      ],
      answer: 1,
      why: "julianday converts a timestamp to a real number of days, so a difference reads in fractional days — the 82 stamped baskets average 2.98. One unit is one day; 0.5 is half a day.",
      notes: [
        { choice: 0, why: "Seconds would need ×86,400. Reading 2.98 as seconds would make the promise clock wrong by five orders of magnitude — and nothing errors to warn you." },
        { choice: 2, why: "The count of dispatched baskets is COUNT(shipped_at) — 82. The julianday difference is a duration measure, not a census." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-13",
      prompt: "The trading spine is built with `SUBSTR(created_at, 1, 7) AS month`. Why slice 7 characters instead of `SUBSTR(created_at, 6, 2)` for the month alone?",
      choices: [
        "The month alone is enough — every basket is in the same year",
        "Month alone merges January 2024 with January 2025; year-plus-month keeps all 14 buckets distinct and sortable",
        "SUBSTR cannot slice TEXT timestamps without a CAST",
        "Position 6 is off by one and returns the wrong digits",
      ],
      answer: 1,
      why: "The log spans 2024-01 through 2025-02 — 14 distinct months. A month-only key merges the two Januarys into one bucket and the trend becomes fiction; the year prefix is what makes the spine a spine.",
      notes: [
        { choice: 0, why: "The data itself disproves this: 2024-01 and 2025-01 both exist. A month-only key folds them into one 14-basket bucket." },
        { choice: 2, why: "SUBSTR is a TEXT function — no cast needed. The trap in this question is the bucket MERGE, not the type system." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-14",
      prompt: "The census counts click+collect baskets inline: `COUNT(*) FILTER (WHERE status = 'pending')`. What is the portable twin that runs on any SQL engine?",
      choices: [
        "COUNT(status = 'pending')",
        "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)",
        "COUNT(*) WHERE status = 'pending'",
        "SUM(pending)",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is dialect sugar; the portable form branches each row to a 1/0 flag and sums — same 14 baskets, any engine. Both are one-scan conditional counts over a shared denominator.",
      notes: [
        { choice: 0, why: "COUNT takes an expression and counts non-NULLs — status = 'pending' evaluates to 1 or 0, and COUNT counts both, printing the group size. The flag never zeroes a row out." },
        { choice: 3, why: "There is no 'pending' column — the branch is a predicate over status. SUM needs the CASE to build its own 1/0 flags." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-15",
      prompt: "Monday's census prints completed 52 + online 30 + collect 14 + abandoned 7. What identity must every regional row satisfy before the pack ships?",
      choices: [
        "Each branch must equal 25.75 — the platform average",
        "The four FILTER branches must sum to that region's COUNT(*) — the census reconciles by construction",
        "The abandoned branch must be the smallest in every region",
        "The completed branch must exceed 50% in every region",
      ],
      answer: 1,
      why: "The four branches partition the same rows, so their sum equals the region's basket count — EU 24+12+6+3 = 45. That identity is what makes the census provable; a branch that fails it means the WHERE clauses stopped being a partition.",
      notes: [
        { choice: 2, why: "US abandons (1) are smaller than its collects (3), but the identity is about the SUM, not the ordering — and the claim is false on EU too (abandons tie APAC's)." },
        { choice: 3, why: "US runs 5 completed of 19 — 26.3%, under half. The identity is the invariant, not any one branch's share." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-16",
      prompt: "Statement #11 settles at 92,550 cents. Which expression prints 925.50 honestly?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents, 2)",
        "amount_cents / 100.0",
        "SUM(amount_cents)",
      ],
      answer: 2,
      why: "Integer ÷ integer truncates: 92550 / 100 reads 925 and the half-penny is gone. The .0 promotes the division to real arithmetic first — the cents-safe rule the whole settlement book runs on.",
      notes: [
        { choice: 1, why: "ROUND folds nothing — the cents are already integers, and rounding cannot recover digits a truncated division already ate." },
        { choice: 0, why: "This is the exact bug: on round-cent statements it looks fine, and on every odd-cent line it silently leaks. The leak is found at the trial balance, not at this row." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-17",
      prompt: "A Clubcard Prices promo runs March 1–31. `WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'` — what is wrong?",
      choices: [
        "Nothing — BETWEEN is inclusive on both ends by design",
        "It drops the promo's last night — end-of-month baskets carry times after 00:00; the half-open form is `created_at >= '2024-03-01' AND created_at < '2024-04-01'`",
        "It includes April's baskets too",
        "BETWEEN cannot compare TEXT timestamps",
      ],
      answer: 1,
      why: "'2024-03-31' as a bound means midnight at the START of March 31 — every basket stamped later that day is outside, and promo-end is exactly when online shops spike. Half-open intervals keep the whole window.",
      notes: [
        { choice: 0, why: "Inclusive on both ends is the bug, not the feature: the upper bound includes only March 31 00:00:00, not the day." },
        { choice: 2, why: "BETWEEN is inclusive — April baskets need created_at >= '2024-04-01', which this query excludes. The leak is at the END of March, not the start of April." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-18",
      prompt: "Commercial wants members who bought from the Audio aisle but never touched Video. Which shape answers it?",
      choices: [
        "UNION of the Audio-buyer list and the Video-buyer list",
        "INTERSECT of the two buyer lists",
        "EXCEPT: Audio-buyers EXCEPT Video-buyers — set difference keeps Audio-only shoppers",
        "A FULL OUTER JOIN of the two lists",
      ],
      answer: 2,
      why: "Never-touched is set difference: A EXCEPT B keeps members in A with no row in B, deduped. UNION answers 'either', INTERSECT answers 'both' — three set ops, three different commercial questions.",
      notes: [
        { choice: 1, why: "INTERSECT finds members who bought BOTH — the cross-aisle cohort, the opposite of 'never touched'." },
        { choice: 3, why: "FULL OUTER JOIN shows both lists side by side including the misses — a Venn diagram, not the subtraction the ask needs." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-19",
      prompt: "The aisle pack wants each basket line to carry its share of ITS region's revenue: `ROUND(100.0 * total / SUM(total) OVER (?), 1)`. What goes in the parens?",
      choices: [
        "Nothing — a bare OVER() already scopes the denominator per region",
        "PARTITION BY region — each line divides by its own region's total",
        "GROUP BY region",
        "ORDER BY region",
      ],
      answer: 1,
      why: "PARTITION BY region computes SUM over each region's rows without collapsing them — EU lines divide by 15,089.23, US lines by 7,286.16. A bare OVER() sums the whole 34,833.28 book, and every regional share under-reads.",
      notes: [
        { choice: 0, why: "A bare OVER() is the whole-table window — one denominator for all 103 baskets. That is the platform share, not the region share." },
        { choice: 2, why: "GROUP BY is not window syntax — it collapses the rows the pack needs to print. The window is how you keep the grain AND scope the denominator." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-20",
      prompt: "The heaviest-trolley read is `SELECT id FROM orders ORDER BY total DESC LIMIT 1`. A re-run after tomorrow's trading finds two baskets tied at the top. What does the query return?",
      choices: [
        "Both baskets",
        "One of them — arbitrarily; argmax-by-LIMIT needs a named tie-breaker to be reproducible",
        "An error — ties are illegal under ORDER BY",
        "The average of the two totals",
      ],
      answer: 1,
      why: "LIMIT 1 cuts after the sort, and the engine's order among tied rows is unspecified — one basket wins by accident. The fix is a named tie-breaker (earlier created_at, then id) or a RANK window that shares rungs deliberately.",
      notes: [
        { choice: 0, why: "LIMIT 1 returns exactly one row — that is its contract. Two shared rungs need RANK, not LIMIT." },
        { choice: 2, why: "Ties sort fine; what is unspecified is their relative order. The failure is reproducibility, not a crash — worse, because the deck ships anyway." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-21",
      prompt: "The trading spine's first row prints prev_revenue = NULL and the deck wants a number in that cell. What is the honest move?",
      choices: [
        "COALESCE to 0 — January opens flat",
        "COALESCE to the row's own revenue — a 0% opening change",
        "Leave it NULL or label the cell 'baseline' — no prior month exists, and inventing one fabricates a movement",
        "Drop the first row from the spine",
      ],
      answer: 2,
      why: "The NULL is information: January 2024 has no in-log prior month, so a month-over-month change is undefined, not zero. Labeling it 'baseline' keeps the spine honest; coalescing to 0 invents a jump, coalescing to self invents a flat month.",
      notes: [
        { choice: 0, why: "0 as prior revenue turns the opening month into +∞% (or an error) — the single most-worn band on the trend deck." },
        { choice: 3, why: "Dropping the row loses the baseline month everyone anchors against. The spine is 14 buckets including the one with no prior." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-22",
      prompt: "The spine's month keys are TEXT — '2024-01' … '2025-02'. Does `ORDER BY month` produce chronological order?",
      choices: [
        "No — TEXT needs a CAST to sort chronologically",
        "Yes — zero-padded 'YYYY-MM' keys sort chronologically as text; that is exactly why the padding matters",
        "Only if an index exists on month",
        "No — SQLite falls back to rowid order for TEXT keys",
      ],
      answer: 1,
      why: "Lexicographic order on zero-padded 'YYYY-MM' keys IS chronological order — '2024-12' < '2025-01' sorts correctly as text. Drop the padding (or slice month alone) and December merges into position 1, breaking both the fold and the sort.",
      notes: [
        { choice: 0, why: "The zero-padding is what makes the CAST unnecessary — this is the whole reason the spine uses '%Y-%m' rather than '%Y-%-m'." },
        { choice: 2, why: "An index changes speed, not sort semantics. TEXT keys order by collation, which for digits-and-dashes is lexicographic — chronological here." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-23",
      prompt: "A reviewer wants months whose revenue beats the platform monthly average. You try `WHERE revenue > AVG(revenue)` inside the spine query and it errors. Why — and what is the fix?",
      choices: [
        "AVG needs an ORDER BY to aggregate; add one",
        "WHERE runs before aggregates and windows exist — fold the spine in a CTE, then filter the folded column in the outer SELECT (or HAVING the raw aggregate)",
        "SQLite allows WHERE on SELECT aliases; the error is elsewhere",
        "Move AVG into the GROUP BY",
      ],
      answer: 1,
      why: "The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY: at WHERE time no group, no aggregate, no window exists to compare against. Stage the fold in a CTE and the outer query filters a real column — the same reason the MoM walk is staged.",
      notes: [
        { choice: 0, why: "AVG over a column needs no ORDER BY. The error is the pipeline stage, not the aggregate's syntax." },
        { choice: 2, why: "Even where SQLite tolerates aliases in WHERE, AVG(revenue) as a bare aggregate over the un-fanned rows is still illegal without GROUP BY — the stage order is the real lesson." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-24",
      prompt: "CRM builds Clubcard spend quartiles: `NTILE(4) OVER (ORDER BY lifetime_spend DESC)` over the 16 members. What does tile 1 hold?",
      choices: [
        "The four lowest-spending members",
        "The four highest-spending members — DESC puts the top spenders in tile 1",
        "One member from each region",
        "NULL — NTILE requires a PARTITION BY",
      ],
      answer: 1,
      why: "NTILE(4) cuts ordered rows into four equal-count bands, and the ORDER BY direction decides which end lands in tile 1: DESC makes tile 1 the top spenders, tile 4 the lightest. Equal counts, not equal value — tile 1 holds a quarter of the MEMBERS, not a quarter of the book.",
      notes: [
        { choice: 0, why: "That is the ASC answer. Direction is a business decision here — the coupon drop targets the top band, so getting it backwards mails premium vouchers to the lightest baskets." },
        { choice: 2, why: "NTILE ignores everything but the ORDER BY within its partition — no PARTITION BY means the whole book is one partition of 16, cut 4/4/4/4." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-25",
      prompt: "After `FROM order_items oi JOIN orders o ON o.id = oi.order_id`, three counters run: COUNT(*), COUNT(DISTINCT o.id), COUNT(DISTINCT o.customer_id). On this db they read —",
      choices: ["103, 103, 16", "251, 103, 16", "251, 251, 103", "16, 103, 251"],
      answer: 1,
      why: "The join fans 103 baskets out to 251 basket lines: COUNT(*) counts the joined rows (251), COUNT(DISTINCT o.id) folds back to baskets (103), COUNT(DISTINCT o.customer_id) folds back to members (16). Three counters, three grains — the two-grain habit at line grain.",
      notes: [
        { choice: 0, why: "That is the un-joined census. The fan-out is the entire point: after the join, COUNT(*) counts lines, not baskets." },
        { choice: 2, why: "Backwards: DISTINCT o.id cannot exceed the raw count of joined rows, and customers fold SMALLER than baskets, not larger." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-26",
      prompt: "A staging feed can carry NULL ids. Which two anti-join shapes survive a stray NULL in the compared column?",
      choices: [
        "NOT IN and NOT EXISTS",
        "NOT EXISTS and LEFT JOIN … IS NULL",
        "NOT IN and LEFT JOIN … IS NULL",
        "All three behave identically on NULLs",
      ],
      answer: 1,
      why: "NOT IN is the one that breaks: x NOT IN (…, NULL) is UNKNOWN for every row, and the report silently empties. NOT EXISTS judges existence row by row, and LEFT JOIN + IS NULL reads the NULL payload directly — both are NULL-proof.",
      notes: [
        { choice: 0, why: "NOT IN is exactly the poisoned one — one NULL in the subquery and every comparison goes UNKNOWN. Pairing it with NOT EXISTS as 'the two safe ones' is backwards." },
        { choice: 2, why: "LEFT JOIN + IS NULL is safe; NOT IN is not. One NULL in the list and the anti-join returns zero rows while looking valid." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-27",
      prompt: "The coupon pod wants members who bought from BOTH the Audio and Accessories aisles this quarter. The honest set shape is —",
      choices: [
        "UNION of the two buyer lists",
        "INTERSECT of the two buyer lists — members present in both, deduped",
        "WHERE aisle = 'Audio' AND aisle = 'Accessories'",
        "A CROSS JOIN of the two lists",
      ],
      answer: 1,
      why: "Both-aisles membership is set intersection: dedup each buyer list, then keep members present in both. A single row cannot hold two aisle values, which is why the AND-in-WHERE shape returns nothing.",
      notes: [
        { choice: 0, why: "UNION answers 'either aisle' — the broad-reach cohort. It cannot express the AND the coupon targets." },
        { choice: 2, why: "One row, one aisle value — aisle can never equal two different strings at once. This is the classic single-row vs set-membership confusion." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-28",
      prompt: "`SELECT name, total, (SELECT AVG(total) FROM orders) AS platform_mean FROM orders` — how many times does the inner query run, and what does platform_mean hold?",
      choices: [
        "Once per row — each basket compared to its own member's mean",
        "Once for the whole query — every row carries the same 338.19 platform mean",
        "Once per distinct total value",
        "It errors — subqueries cannot appear in SELECT",
      ],
      answer: 1,
      why: "The subquery is uncorrelated — it references no outer column — so SQLite evaluates it once and the constant rides every row: 338.19 across all 103. Per-member means need a correlated subquery or a window with PARTITION BY customer_id.",
      notes: [
        { choice: 0, why: "That describes the CORRELATED shape, which needs a WHERE matching the outer member. Without the correlation, one evaluation serves all rows." },
        { choice: 3, why: "Scalar subqueries in SELECT are standard SQL — the constant column is their bread-and-butter use." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-29",
      prompt: "LATAM ran 2 baskets, 0 abandoned. The abandoned-share expression still prints 0.0 for the region. Why?",
      choices: [
        "The CASE returns NULL when its branch never fires",
        "The 0/1 flags still fold over the region's 2 rows — SUM of all-zeros is 0, and 0.0 is the honest measured share",
        "SQLite substitutes 0 for missing groups",
        "LATAM's row was filtered out and ROUND invented a zero",
      ],
      answer: 1,
      why: "The share is an aggregate over the region's rows: two rows, both flag 0, SUM = 0, 100.0 × 0 / 2 = 0.0. The branch firing zero times still participates in the fold — an all-zero share is a measured fact, not a missing one.",
      notes: [
        { choice: 0, why: "The CASE fires per row and returns 0 for non-cancelled rows — it never returns NULL here, because the ELSE 0 catches them." },
        { choice: 3, why: "The row is in the fold — it IS the fold. Nothing was filtered; the zero comes from the arithmetic, which is what makes it defensible in the meeting." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-30",
      prompt: "To 'fix' the latency average someone writes `AVG(julianday(COALESCE(shipped_at, created_at)) - julianday(created_at))`. What actually happens?",
      choices: [
        "NULLs drop out more cleanly and the average is unchanged",
        "Every un-dispatched basket now reads 0 days — 14 click+collect and 7 abandoned baskets invent same-day dispatches and the average collapses below the 2.98 norm",
        "The average doubles",
        "SQLite errors on the nested function",
      ],
      answer: 1,
      why: "COALESCE substitutes created_at for the missing van stamp, so those baskets measure zero elapsed days and ride the average — the 82-basket truth is diluted by 21 invented same-day dispatches. The fix is the population filter (WHERE shipped_at IS NOT NULL), not a default value.",
      notes: [
        { choice: 0, why: "The opposite: NULLs were being EXCLUDED before; now they are included as zeros. Same number is exactly what the no-WHERE AVG trap looks like — this variant actively corrupts it." },
        { choice: 3, why: "COALESCE nests fine — that is the danger. The corruption is semantic, silent, and prints a plausible number." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-tesco-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The basket-status census",
      brief:
        "Tesco-flavored brief on the storefront db: Monday's trade meeting opens with the basket-status census — completed baskets, online orders out for delivery, click+collect awaiting pickup, abandoned — plus the abandoned share with the population stated on the slide. Probed facts: 103 baskets worth 34,833.28; the regional grid reads EU 45 = 24 completed + 12 online + 6 collect + 3 abandoned, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1 (the only region where van loads beat tills — 10 of 19 out for delivery), LATAM 2 = 2/0/0/0; abandoned share reads EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0.0. The meeting reads biggest basket count first.",
      ask: "Return each region with its basket count, the four status branches and the abandoned share to 1 decimal, biggest basket count first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS baskets,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS online_out,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS collect_wait,\n       COUNT(*) FILTER (WHERE o.status = {4}) AS abandoned,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), {5}) AS abandon_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY baskets {6};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-basket status",
          why: "Completed baskets are status 'delivered' — 52 of 103 (50.5%), till takes and landed online orders alike. 'shipped' would print the 30 van loads into the completed column and the census overstates the till before the meeting opens.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the van-dispatch status",
          why: "shipped = online order out for delivery, shipped_at as the van-dispatch stamp — 30 of 103 (29.1%). 'pending' would read the 14 click+collect baskets as van loads and the dispatch board empties while the collect queue doubles.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the click+collect status",
          why: "pending = click+collect awaiting pickup — 14 baskets (13.6%). 'delivered' here double-counts the completed column and breaks the reconciliation identity every branch must satisfy against COUNT(*).",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandoned-basket status",
          why: "cancelled = abandoned basket — 7 of 103 (6.8%), concentrated 3 in EU and 3 in APAC. 'shipped' would count van loads as abandons and the share reads 29.1% — a demand-quality crisis that does not exist.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The abandoned share prints to 1 decimal — EU 6.7, APAC 8.1, US 5.3 — matching the regional table ops quotes. ROUND(…, 2) prints 6.67 and the census stops tying to the deck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-basket-first direction",
          why: "The trade meeting reads biggest first: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's 2 baskets — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "COUNT", "AVG", "ASC", "2"],
      walkthrough:
        "One scan, four FILTER branches, one share — the whole census in a single pass. The join attaches every basket to its member's region, GROUP BY folds four rows, and each FILTER (WHERE o.status = …) branch counts its own fate: EU reads 45 baskets = 24 completed + 12 online + 6 collect + 3 abandoned, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0 — every row reconciles to its basket count by construction, which is the identity the meeting checks first. The abandoned share folds 'cancelled' a second time as its own FILTER because a sibling column alias cannot be referenced mid-row: ROUND(100.0 * … / COUNT(*), 1) reads 6.7 / 8.1 / 5.3 / 0.0, straight from the probed regional table. The business beat is the US row: 10 of 19 baskets are out with the vans — the only online-majority region — while EU's 45 baskets run 24 from tills. The distractors fail honestly: SUM, COUNT and AVG in a status slot compare o.status to a function name and error; ASC reverses the read onto LATAM; 2 in the precision slot drifts the share to 6.67 and breaks the tie to the deck.",
    },
    {
      id: "cs-tesco-2",
      tier: "medium",
      topic: "t6",
      universe: "pricing",
      title: "The shelf-band promo audit",
      brief:
        "Tesco-flavored brief on the storefront db: the commercial team audits where each aisle's money sits before a price move — shelf price classifies the SKU into its band, basket lines price what shoppers actually paid once Clubcard Prices and promo variants are live, so band revenue can drift from shelf expectation and the share column is where the leak shows. Probed facts: the range splits 8 value SKUs under 50 (avg shelf 32.06) and 8 standard SKUs at 50-plus (avg 111.5), ceiling 199.99 with the 200-plus premium band empty; aisle revenue folds into the 34,833.28 basket book over 251 lines. The audit reads biggest revenue first.",
      ask: "Return each aisle x shelf band with its revenue and share of the aisle's revenue to 1 decimal, biggest revenue first.",
      template:
        "WITH band AS (\n  SELECT p.category AS aisle,\n         CASE WHEN p.price < {1} THEN {2} ELSE {3} END AS band,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM products p\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY p.category, band\n)\nSELECT aisle,\n       band,\n       revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (PARTITION BY {4}), 1) AS aisle_share\nFROM band\nORDER BY revenue {5};",
      slots: [
        {
          answer: "50",
          kind: "number",
          label: "the value-line price ceiling",
          noVerify: true,
          why: "The value band is shelf price under 50 — 8 SKUs averaging 32.06 per the range audit. A 100 ceiling re-bands the 89.99 keyboard into value and re-cuts every aisle share in the audit.",
        },
        {
          answer: "'value'",
          kind: "keyword",
          label: "the value-band label",
          why: "The under-50 arm is the value band — 8 SKUs, 32.06 average shelf price. Mislabeling it 'premium' does not change the fold but poisons every downstream join to the pricing calendar, which keys on the published band names.",
        },
        {
          answer: "'standard'",
          kind: "keyword",
          label: "the standard-band label",
          why: "The 50-plus arm is the standard band — 8 SKUs averaging 111.5. Both arms reading the same label merges two band rows per aisle and the fold loses the split the audit exists to see.",
        },
        {
          answer: "aisle",
          kind: "keyword",
          label: "the partition key",
          why: "The share is of the AISLE: SUM(revenue) OVER (PARTITION BY aisle). 'category' is out of scope past the CTE — the alias is aisle — and errors; a constant partitions the whole range and every share prints 100.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-revenue-first direction",
          why: "The audit reads biggest revenue first: Audio/standard 11,744.01 leads, Fitness/value 863.91 trails. ASC buries the two heavyweight rows under ten rows of detail.",
        },
      ],
      distractors: ["'premium'", "SUM", "ASC", "100", "category"],
      walkthrough:
        "Two stages: fold, then share. The CTE joins products to basket lines, bands each SKU at the 50 shelf ceiling, and folds 251 lines into ten aisle x band rows rounded to the penny; the outer SELECT adds SUM(revenue) OVER (PARTITION BY aisle) so each band carries its share of its own aisle. The probed read: Audio/standard 11,744.01 at 100 — Audio sells entirely in the standard band — and Accessories/value 3,294.29 at 100, its mirror image in value; Video splits 3,989.97 standard / 1,208.44 value (76.8 / 23.2), Electronics is the most balanced aisle at 2,558.26 / 2,260.35 (53.1 / 46.9), Apparel runs 1,384.15 / 600.78 (69.7 / 30.3), and Fitness/value 863.91 at 100. Mono-band aisles print 100 — a share, not a bug. Everything foots: the ten revenues sum back into the 34,833.28 basket book. Note the shelf-versus-paid drift is live here — bands classify by shelf price while lines price what was paid with Clubcard Prices on, which is exactly the promo leak the audit hunts. The distractors each break differently: 100 re-bands the range at the wrong ceiling and re-cuts every share; 'premium' relabels the value arm (breaking the pricing-calendar join) or, in the ELSE slot, merges nothing and relabels standard; SUM and ASC error in their slots; category is out of scope past the CTE and errors the partition.",
    },
    {
      id: "cs-tesco-3",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The never-settled statement list",
      brief:
        "Month-end brief, in-world: before supplier services sends a single dunning letter, finance ops runs the never-settled read — settlement statements (invoices) LEFT JOINed to their settlement legs (payments), keeping only the statements with NO legs at all. Probed on the storefront db: 28 statements, 27 settlement legs, and the anti-join keeps 6 statements claiming 15,217.00 in INTEGER cents — five open statements (INV-2025-024 at 4,937.00, INV-2025-026 at 3,562.00, INV-2025-027 at 2,794.00, INV-2024-021 at 1,295.00, INV-2024-018 at 873.00 = 13,461.00) plus the paid-status lie INV-2025-028 at 1,756.00, marked paid with zero legs. The read prints one row: the claim total and the statement count.",
      ask: "Return one row: the total claim (dollars to 2 decimals via the cents read) on never-settled statements, and how many statements that is.",
      template:
        "SELECT {1}(i.amount_cents) / 100.0 AS claimed,\n       COUNT(*) AS statements\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {3} NULL;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the claim adder",
          why: "SUM folds the 6 statements' cents into the 15,217.00 claim — money, added. COUNT would count cents-bearing rows and print 6.0 wearing a dollars name; AVG prints the mean claim and the dunning pack under-recovers five statements' worth.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 legless ones a NULL payload the WHERE can catch. INNER JOIN deletes exactly those 6 rows — including the paid-status lie INV-2025-028, the anomaly this read exists to expose — and the anti-join returns a confident, wrong zero.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the NULL-payload test",
          why: "p.id IS NULL is the anti-join predicate: no settlement leg ever matched. p.id = NULL is UNKNOWN for every row (NULL equality is never TRUE) and returns nothing; p.id NOT NULL flips the read to the 22 settled statements — the mirror image.",
        },
      ],
      distractors: ["COUNT", "AVG", "INNER", "NOT", "="],
      walkthrough:
        "The anti-join is the close's first query. LEFT JOIN keeps every statement: 22 match settlement legs, 6 arrive with a NULL payload. WHERE p.id IS NULL keeps the legless six, and the outer fold prints their claim: SUM over INTEGER cents (1,521,700) through the /100.0 read = 15,217.00, with COUNT(*) confirming 6 statements. The list is the work: five open statements worth 13,461.00 go to dunning, and the sixth — INV-2025-028, marked 'paid' with zero legs at 1,756.00 — goes to the anomaly list, because payment rows are the ledger of record and the status column is only a claim. Swap SUM for COUNT and the claim column prints 6 — a count wearing a dollars name; INNER JOIN deletes the very rows the read exists to find and returns a confident zero; = NULL is UNKNOWN everywhere and empties the result; NOT NULL flips to the 22 settled statements and the dunning letters go to the wrong book. Every distractor fails a different promise of the close.",
    },
    {
      id: "cs-tesco-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The double-points calendar",
      brief:
        "Growth brief, in-world: the loyalty desk schedules its double-Clubcard-points weekends into the soft months, and the soft months come from the trading spine — each month's basket value beside the prior month's, with the month-over-month percentage, so the fade rows announce themselves. Probed on the storefront db: 14 months of baskets, 2024-01 to 2025-02, worth 34,833.28; the spine opens 3,731.97 → 3,609.64 (-3.3) → 2,617.08 (-27.5) → 2,468.91 (-5.7) → 2,910.31 (+17.9) → 2,047.43 (-29.6) over the first six — the May→June fade is the calendar's headline row. LAG carries the prior month; the first month's change is honestly NULL — no baseline exists.",
      ask: "Return the first six months of the spine: month, basket count, revenue, the prior month's revenue, and the month-over-month percentage to 1 decimal.",
      template:
        "WITH monthly AS (\n  SELECT {1}('%Y-%m', created_at) AS month,\n         COUNT(*) AS trips,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       trips,\n       revenue,\n       {2}(revenue) OVER (ORDER BY month) AS prev_revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / LAG(revenue) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "STRFTIME",
          kind: "keyword",
          label: "the month bucket key",
          why: "STRFTIME('%Y-%m', created_at) folds timestamps into zero-padded 'YYYY-MM' TEXT keys — 14 sortable buckets. SUBSTR(created_at, '%Y-%m') coerces the format to 0 and slices per-day buckets (103 of them); DATE('%Y-%m', created_at) reads the arguments backwards and returns NULL for every row.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(revenue) walks the window backwards one bucket — February's prev_revenue is January's 3,731.97. LEAD reads forward and hands February March's number, silently re-labeling the future as history; SUM piles a running total into prev_revenue. The first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month read is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC presents the newest month first with its baseline below — the numbers survive, the story doesn't, and the percentage column reads backwards.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the calendar cut",
          why: "LIMIT 6 returns the opening run the calendar quotes — six months ending on the -29.6 May→June fade, whose June basket count (6) sits in the output. The double-points weekend lands in the soft months this cut exposes.",
        },
      ],
      distractors: ["SUBSTR", "DATE", "LEAD", "SUM", "DESC", "3"],
      walkthrough:
        "Staged windows on the spine. The CTE folds 103 baskets into 14 monthly buckets via STRFTIME('%Y-%m', …) — trips and revenue per bucket, footed to 34,833.28 before any window touches it. The outer query walks the spine: LAG(revenue) OVER (ORDER BY month) brings January's 3,731.97 into February's row, and the percentage divides the delta by that same LAG — -3.3 for the quiet February, -27.5 for the March drop, then the +17.9 May lift and the -29.6 May→June fade the calendar quotes. The first month is NULL by design: no prior bucket, no invented movement — the loyalty desk labels it baseline. The two-step matters because window output is not visible to WHERE and sibling expressions cannot see each other mid-SELECT, so the CTE stages the grain and the outer SELECT layers the walk. SUBSTR with the format string slices per-day buckets (103 rows of noise); DATE with swapped arguments returns NULL for every month; LEAD re-labels the future; SUM piles a running total into prev_revenue; DESC tells the story backwards; LIMIT 3 amputates the fade the calendar exists to catch. Every chip changes where the double-points weekend lands.",
    },
    {
      id: "cs-tesco-5",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The program-spend stack",
      brief:
        "Spend-report brief, in-world: the ops partner wants the program-spend categories (Travel, Tools — in-world: fleet trials and store-fit tooling) pulled out of the expense ledger with a grand TOTAL row underneath — one query, one stack, no spreadsheet math. Probed on the storefront db: 36 expenses totaling 25,416.00; Travel runs 3 entries for 2,521.00 and Tools 5 for 1,525.00, so the program categories carry 4,046.00 of the 25,416.00 (15.9%) against the fixed costs (Rent 14/16,800.00, Ads 14/4,570.00) that dominate the book. Finance stores expenses as INTEGER cents, and the TOTAL branch must scan the unfiltered ledger.",
      ask: "Return entries and spend (dollars via the cents read) per program category, plus a labelled TOTAL row for the whole ledger.",
      template:
        "SELECT category, COUNT(*) AS entries, SUM(amount_cents) / 100.0 AS spend\nFROM expenses\nWHERE category {1} ('Travel', 'Tools')\nGROUP BY category\n{2}\nSELECT 'TOTAL', {3}, SUM(amount_cents) / 100.0\nFROM expenses\nORDER BY spend DESC;",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the program-cost filter",
          why: "IN ('Travel','Tools') keeps exactly the two program categories — 8 of the 36 entries. NOT IN flips the stack to Rent and Ads, the fixed costs the stakeholder explicitly excluded from this memo.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the category rows without a dedupe pass — the honest stack for a report where every row belongs. A bare UNION adds a distinct sort for nothing here, EXCEPT returns only the detail rows and drops the TOTAL, and INTERSECT of disjoint branches empties the report.",
        },
        {
          answer: "36",
          kind: "number",
          label: "the all-in entry count",
          why: "The TOTAL row must count the whole ledger — 36 expense entries, not the filtered 8 — because its cents column (25,416.00) is the unfiltered grand total. Pinning the count keeps the row honest even if the detail filter upstream changes.",
        },
      ],
      distractors: ["NOT IN", "14", "EXCEPT", "INTERSECT", "MAX(amount_cents)"],
      walkthrough:
        "Two branches, one stack. The detail branch filters to the program pair with IN and GROUP BY category folds 8 entries into two rows — Travel 3/2,521.00, Tools 5/1,525.00. The TOTAL branch re-scans the unfiltered expenses table: 36 entries and 25,416.00, so the report shows the program categories against the whole ledger (4,046.00 program = 15.9% of spend) without a second query — and against the fixed-cost giants the ops partner is really negotiating. UNION ALL is the join between grains — no dedupe, and the outer ORDER BY spend DESC floats the TOTAL row (2,541,600 cents) to the top. NOT IN serves Rent and Ads instead of the program costs; 14 in the TOTAL slot undercounts entries to a single fixed category's worth; EXCEPT keeps the detail and silently deletes the TOTAL; INTERSECT of two disjoint branches returns nothing; MAX(amount_cents) puts the largest single bill in the entries column. Every distractor breaks a different promise of the memo.",
    },
    {
      id: "cs-tesco-6",
      tier: "medium",
      topic: "s6",
      universe: "inventory",
      title: "The shelf-cover board",
      brief:
        "Inventory brief, in-world: availability analysts walk the range before the weekend — per SKU, units sold against stock on hand, and the remaining cover banded into reorder (fewer than 30 units left), watch (30–100) and healthy (over 100). Probed on the storefront db over the 251 scanned basket lines: three SKUs sit in reorder — Noise-Canceling Headset 14 remaining, Studio Desktop Mic 15, Smart Watch S 17; five sit in watch — 4K Webcam Pro 39, USB-C Hub 64, Fitness Band X2 65, Cycling Jersey Pro 89, Mechanical Keyboard K1 92; eight are healthy, led by HDMI 2.1 Cable at 462 remaining. The board reads most-exposed SKU first.",
      ask: "Return each SKU with its stock, units sold, remaining cover and the band label, most-exposed (fewest remaining) first.",
      template:
        "SELECT p.name AS sku,\n       p.stock,\n       {1}(oi.quantity) AS units_sold,\n       p.stock - SUM(oi.quantity) AS remaining,\n       CASE WHEN p.stock - SUM(oi.quantity) < {2} THEN {3}\n            WHEN p.stock - SUM(oi.quantity) <= 100 THEN 'watch'\n            ELSE 'healthy' END AS cover\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY p.id, p.name, p.stock\nORDER BY remaining {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units adder",
          why: "SUM(oi.quantity) adds UNITS — 46 headset units across its basket lines. COUNT would count lines scanned, not units moved, and every multi-unit basket line under-counts the demand the cover math depends on.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the reorder line",
          noVerify: true,
          why: "The band edge is 30: fewer than 30 remaining goes to reorder — exactly the Headset (14), Mic (15) and Watch S (17). At 50 the Webcam (39) joins the fire list and the depot picks units the range did not need.",
        },
        {
          answer: "'reorder'",
          kind: "keyword",
          label: "the exposed-band label",
          why: "The sub-30 arm prints 'reorder' — the label the depot's pick list joins on. 'watch' would fold the three fire-list SKUs into the calm middle band and the weekend's availability incident ships as a watch item.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the most-exposed-first direction",
          why: "Most-exposed first means ascending remaining — 14, 15, 17 on top. DESC opens the board on the HDMI cable's 462 and the fire list is buried under eight rows of healthy stock.",
        },
      ],
      distractors: ["COUNT", "AVG", "'watch'", "DESC", "50"],
      walkthrough:
        "A cover census at SKU grain. The join fans each SKU out to its basket lines, GROUP BY p.id folds them, and SUM(oi.quantity) reads units moved against p.stock — remaining is the difference the band reads. The CASE bands the cover in one pass: sub-30 prints 'reorder' (Headset 14, Mic 15, Watch S 17 — the three-row fire list), 30–100 prints 'watch' (Webcam 39, Hub 64, Band 65, Jersey 89, Keyboard 92), and the ELSE 'healthy' catches the eight deep-stock SKUs down to the HDMI cable's 462. The arms are ordered and exhaustive — narrow edge first, ELSE as the catch-all — so no SKU can fall through unlabeled, and ORDER BY remaining ASC puts the fire list on top where the depot expects it. COUNT would read lines instead of units and shrink every multi-unit demand figure; AVG averages line quantities into a units column; 'watch' in the label slot merges the fire list into the calm band; 50 widens the edge to four SKUs and the depot over-picks; DESC buries the fire list under healthy stock. Every chip changes what the depot does before the weekend.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Basket depth and AOV are the trolley read: lines per basket beside value per basket. This problem drills the two-metric fold Tesco's trade pack opens with — online baskets versus store tills included." },
    { slug: "repeat-purchase-rate", why: "Clubcard's whole promise is that the weekly shop comes back. Share of members with 2+ baskets in a window is the repeat rate the CRM pod reports weekly — a distinct-count ratio with the denominator stated." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary segments decide who gets the next Clubcard coupon drop. NTILE quintiles over basket recency, frequency and value are exactly the segmentation query this kit's ladder topics build toward." },
    { slug: "returns-rate-by-category", why: "Waste and returns by aisle decide next season's buying. A per-aisle rate with the category denominator handled honestly is the same shape as the abandoned-share read." },
    { slug: "weeks-of-supply", why: "Shelf cover in weeks turns a stock table into a replenishment decision. Tesco's availability analysts run this fold daily across the range — stock divided by trailing demand, per SKU." },
    { slug: "customers-who-never-order", why: "Members who registered for Clubcard but never scanned is the lapsed-list question — the LEFT JOIN + IS NULL anti-join. On this db the honest answer is a confident zero, and proving it is part of the job." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The weekly-shop household: which member carries the most baskets. An argmax over a grouped count — the opening query of every Clubcard engagement review." },
    { slug: "immediate-food-delivery-ii", why: "Whoosh and online slots live or die on the promised-window share: orders delivered within the promised window versus late. A conditional rate over a timestamp comparison — the delivery-SLA query at grocery scale." },
    { slug: "monthly-transactions-ii", why: "The month-close tender stack: completed versus abandoned baskets per month, stacked into one layout. UNION ALL branches with a status rule each — the month-end pack's core move." },
    { slug: "average-selling-price", why: "Shelf price versus what shoppers actually paid once Clubcard Prices are live — the effective-price audit. A weighted per-SKU fold where the denominator (units) makes or breaks the number." },
    { slug: "sales-by-day-of-the-week", why: "The Friday/weekend shop is the grocery rhythm: a day-of-week pivot over basket dates. CASE columns per weekday over a grouped fold — exactly the traffic-shape query store ops runs weekly." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Habitual staples: the most-bought SKU per household. Per-member argmax over basket lines — the personalization query behind Clubcard coupon targeting." },
    { slug: "product-price-at-a-given-date", why: "Price as-of a date, when promos overwrite shelf prices: the latest price at or before the promo window. A window-argmax over price history — the promo-audit screens' favorite escalation." },
    { slug: "find-churn-risk-customers", why: "Members whose shopping cadence is slipping are the churn-risk list before the lapse happens. Recency-gapped member reads over basket timestamps — the CRM save-campaign query." },
    { slug: "bank-account-summary-ii", why: "The supplier settlement book in one query: statements beside settled amounts, cents-safe. INTEGER cents and the /100.0 rule make this exact practice for the settlement true-up." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Footfall without a basket: store visits that never converted. The browse-versus-buy anti-join is the conversion question every format team asks after a promo weekend." },
    { slug: "calculate-product-final-price", why: "Clubcard Prices make one SKU print two prices at the till — shelf versus what the member paid. A rule-stacked final-price fold is the effective-price audit the promo/price pod runs weekly." },
    { slug: "fifo-inventory-cogs", why: "Grocery stock rotates first-in-first-out or it dates. Layered cost folds turn a stock table into the cost-of-goods read the depot valuation needs — cents-safe by habit." },
    { slug: "warehouse-manager", why: "The depot read: stock held per warehouse beside what moved. A per-site stock census is the availability analyst's opening query before the weekend wave." },
    { slug: "seasonal-sales-analysis", why: "The UK grocery year is seasonal — Christmas, barbecue summer, back-to-school. A season-versus-baseline fold over the trading spine is how the promo calendar earns its slots." },
    { slug: "friday-purchases-i", why: "The Friday/weekend shop is the grocery rhythm — a named-day cut over basket dates is the staffing and slot-plan query store ops runs weekly." },
    { slug: "calculate-orders-within-each-interval", why: "Delivery slots live in intervals: baskets bucketed into time windows per period. Interval folding is the slot-utilization read network analytics ships every week." },
    { slug: "immediate-food-delivery-iii", why: "The online promise: orders delivered on the first promised slot versus bumped. A per-order promise check with a customer-level rate is the van-SLA read this kit's status map feeds." },
    { slug: "the-most-recent-three-orders", why: "The last three shops per member is the recency CRM reads before any coupon drop. A per-member top-3 by date — ROW_NUMBER with a named tie-breaker — is the ladder drill at household grain." },
    { slug: "second-most-recent-activity", why: "Cadence needs the last TWO shops, not one: the second-most-recent basket is how a slipping weekly shop is caught before the lapse. Per-member second-latest is the churn-risk list's first query." },
    { slug: "count-salary-categories", why: "Value bands with the empty band printed as zero, not missing — the premium band is provably empty on this range, and the honest-zero discipline is exactly this drill." },
    { slug: "transactions-per-visit-histogram", why: "Spend-per-visit histograms need their empty bins printed — a zero-filled band read over basket values, the distribution behind the AOV headline." },
    { slug: "find-the-median", why: "The median basket sits below the 338.19 mean on a book this concentrated — a median read via window counts is the central-tendency check the two-grain census pairs with." },
    { slug: "user-purchase-platform", why: "Online vans versus store tills is the channel split behind the status map. A platform-preference fold per member is the channel-mix query the format teams argue over." },
    { slug: "compute-the-rank-as-a-percentage", why: "The Clubcard ladder reads better in percentiles: each member's rank as a share of the book. A rank-to-percentage window is the ladder drill the four-way-tie tie policy feeds." },
    { slug: "usage-tier-percentiles", why: "Spend tiles (NTILE) cut the book into coupon-sized bands — the segmentation query the CRM pod ships weekly, and this kit's ladder topics in one move." },
    { slug: "human-traffic-of-stadium", why: "Three consecutive trading days above the footfall bar is a streak question: gaps-and-islands over daily baskets, the same machinery the stockout-window drill uses." },
  ],
};
