// Vimeo — Wave-10 (Task 100), media domain, no Vimeo section in pools — theme-curated; facts from scripts/company-facts.md.
// Professional-video-hosting SQL: the storefront db read as a subscription-video SaaS — customers are
// creator+viewer accounts (region = market buckets), orders are subscription/billing cycles
// (delivered = active paid cycle 52, shipped = upgrade in flight with shipped_at as the plan-change
// stamp 30, pending = trial 14, cancelled = churned 7), order_items are subscription/usage line
// records (quantity = bandwidth GB / add-on units, unit_price = line rate), products = plan SKUs
// (Basic/Plus/Pro/Business/Enterprise; db category codes = plan families), suppliers = CDN/encoding
// partners, invoices = subscription billing statements (finance tables INTEGER cents — dollar read =
// amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars), payments = payment
// rails (card 16 legs / 37,364.00 vs wire 11 / 32,248.00), expenses = platform opex, ledger_entries = GL.
// Angle kept DISTINCT from twitch (live sessions/chat firehose) and the ad-funded feed kits: B2B video
// SaaS — the tier ladder, bandwidth economics, the upgrade engine and the enterprise OTT book. Trial
// funnels, two-grain account censuses, tie-heavy upgrade leaderboards, the 55-line plan-price ladder
// (268 units @ 31.01 vs 230 @ 115.85 — the figma canonical cell), the 14-month billing spine. Pool
// provenance: company-pools.md carries NO Vimeo section — 0 tagged rows — so all 10 topic slug sets and
// all 16 problems are theme-curated from the pools file's theme menu (sql rows only, no w*/d*/f* rows)
// and say so. Case briefs quote probed figures from scripts/company-facts.md (incl. the wave-8+9
// probe-derived canonical cells); every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const vimeoKit: CompanyKit = {
  id: "vimeo",
  domainId: "media",
  name: "Vimeo",
  tagline: "Pro-grade video hosting: the plan ladder, the bandwidth bill, the OTT book",
  accent: "text-sky-300",

  brief: [
    "**Vimeo** is professional-grade video hosting — the subscription platform creators, agencies and businesses run when video is the product, not a feed slot. Where ad-funded social monetizes attention, Vimeo monetizes the **tier ladder**: Basic, Plus, Pro, Business and Enterprise, each step buying more bandwidth, more storage and more OTT control. This kit maps the storefront db onto that world: the 16 customers rows are creator+viewer accounts (region = the four market buckets), the 103 orders are subscription/billing cycles, and the 251 order_items rows are usage lines — the bandwidth and add-on lines each cycle ships across. The status map is fixed: delivered = {emerald:active paid cycle} (52 of 103, 50.5%), shipped = {sky:upgrade in flight} (30, 29.1%), pending = trial (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org splits into growth (trial conversion, the upgrade engine), monetization (the plan ladder, bandwidth overage) and a small billing pod, and all three read the same spine at different grains. The upgrade funnel is the heartbeat: a cycle books at created_at, and shipped_at is stamped the day the plan change actually lands — **82 of 103 cycles** carry the stamp, averaging **2.98 days** from booking to change with a 2–4 day spread, and the 14 trials have none yet (a population definition, not a cleanup job). Money sits one layer down: billing statements and rail settlements in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with creators whose lifetime spend crosses 3,000 (71.2% above 2,000) — one enterprise logo moving moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain account census** — EU runs 45 cycles from just 8 accounts (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'do trials count in your upgrade rate?'*), then into the upgrade leaderboard where four accounts sit tied at 4 cycles and rank semantics become a business decision. Late rounds walk the {sky:14-month billing spine} (2024-01 to 2025-02) with `LAG` deltas — the 1,193.86 July trough, the +1,158.21 August jump — and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Vimeo section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: trial-to-paid funnels, two-grain account censuses, tie-heavy upgrade leaderboards, plan-band CASE logic and the cents-safe billing spine. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {sky:plan-change register} billing ops works from during an upgrade wave, the {violet:3,000-line concentration list} finance reads at every pricing review, the 14-month billing spine walk, the never-collected dunning register, the one-pass stage census and the 1,088.44 top-of-ladder read. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the upgrade-funnel refresh. A growth analyst opens the billing dashboard before standup: did overnight cycles land, did any upgrade get its `shipped_at` stamp without an owner on the migration queue, does the one-pass status census reconcile — 52 active + 30 upgrading + 14 trials + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If plan-change latency drifts off the **2.98-day** norm, the migration queue gets pulled before the morning read ships.",
    "**11:30 —** **The expansion read.** Customer success wants the upgrade leaderboard with the four-way tie at 4 cycles handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus accounts; a regional VP wants cycles per account beside account counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pricing-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected billing statements worth 15,217** — before a single dunning email goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the chase list; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Upgrade stamp rate", what: "Cycles with the shipped_at plan-change stamp ÷ all cycles booked: 82 of 103 (79.6%). The top-of-funnel number growth reads every Monday — the 14 trials are 'not yet', never a silent zero." },
    { name: "Plan-change latency", what: "Booking to plan change (created_at → shipped_at) over stamped cycles only: 2.98-day average, range 2–4. The population definition ships with the number — unstamped trials have no cycle yet and must not dilute it." },
    { name: "Active-cycle rate", what: "Delivered ÷ ALL cycles booked: 52 of 103 (50.5%). 'Active paid' is a status-filtered conditional count, and the denominator — upgrading cycles included — is the whole interview." },
    { name: "Churn share", what: "Cancelled share of booked cycles: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The churn cohort map that drives the win-back and downgrade-offer calendars." },
    { name: "Subscription book", what: "Total cycle value booked: 34,833.28 across 103 cycles, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — Basic-volume volume at one end, a 1,088.44 enterprise cycle at the other." },
    { name: "Usage lines per cycle", what: "Usage lines ÷ cycles: 251 order_items across 103 cycles (2.44 lines per cycle, 498 units total). Bandwidth overage shows up here first — a new GB line is a new order_items row, not a new cycle." },
    { name: "Creator concentration", what: "Share of the book from accounts with 3,000-plus lifetime spend: 63.5% (71.2% above 2,000). The number that staffs the enterprise pod and sizes the OTT sales team." },
    { name: "Billing coverage", what: "Booked versus settled: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the billing pod refreshes every close." },
  ],

  topics: [
    {
      name: "Trial-to-paid funnel counts",
      why: "Every Vimeo growth screen opens with the funnel: cycles booked, stamped (shipped_at carrying the plan change), active to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight upgrade 'active' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i", "game-play-analysis-iv", "immediate-food-delivery-ii"],
    },
    {
      name: "Two-grain account censuses",
      why: "Cycles and accounts are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "students-and-examinations"],
    },
    {
      name: "Joining accounts to cycles",
      why: "Accounts carry region and created_at; cycles inherit them through joins, and the join type decides who survives. A cycle without an account is corruption; an account without cycles is a dormant signup — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employee-bonus", "customer-who-visited-but-did-not-transact", "sellers-with-no-sales", "confirmation-rate"],
    },
    {
      name: "Upgrade leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 cycles each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer creators, not syntax.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries", "top-earners", "classes-more-than-5-students", "second-highest-salary"],
    },
    {
      name: "Plan-band CASE logic",
      why: "Plan tiers are CASE-classified — the Basic-to-Enterprise ladder with fixed edges the pricing page publishes, and the 55-line usage split (268 units at 31.01 average line price versus 230 at 115.85) is the canonical fold. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "calculate-special-bonus", "count-salary-categories", "product-sales-analysis-i", "average-selling-price"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month billing spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "movie-rating", "capital-gain-loss"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — active under churned, this quarter beside last — and EXCEPT answers 'which booked cycles never stamped'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: fold per-account cycle counts, then judge them against a computed platform mean (6.44 cycles here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "queries-quality-and-percentage"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets active, upgrading, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Active is not collected — the finance tables (28 billing statements, 27 rail settlements, INTEGER cents) are where the creator world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule"],
    },
  ],

  theory: [
    {
      id: "vimeo-t1",
      q: "Your account report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins cycles to accounts: a cycle with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no cycles ARE the answer (a dormant signup, a trial that never converted), arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the dormant list vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-billing accounts, and proving that zero is itself the analyst's job: all 16 accounts appear in the cycles table somewhere.",
      tag: "joins",
    },
    {
      id: "vimeo-t2",
      q: "Four accounts tie at 4 cycles on the upgrade leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the enterprise pod's attention this week. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "vimeo-t3",
      q: "The census shows 103 cycles and 16 accounts; EU shows 45 cycles and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per cycle, so an account with 24 cycles contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 cycles collapse to 8 logos. Neither is wrong: cycles measure load and billing momentum, accounts measure installed base and coverage. The ratio — 5.6 cycles per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for usage lines and COUNT(*) silently counts lines, not cycles — 251 of them, carrying 498 units. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "vimeo-t4",
      q: "shipped_at is NULL until a plan change lands. What is your policy for the plan-change latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped cycles have a latency, so the report measures booking-to-plan-change for the 82 of 103 cycles that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day plan changes for trials that have not started. A report whose WHERE clause is doing definitional work without saying so is exactly what a Vimeo reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "vimeo-t5",
      q: "The growth review wants active-cycle value per market for markets carrying at least ten cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards upgrading, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to cycles versus to dollars. The strong answer places every filter by asking: is this a fact about one cycle, or about a market?",
      tag: "pipeline",
    },
    {
      id: "vimeo-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce a mean (6.4375 cycles per account, 6.44 rounded — exactly four accounts clear it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each cycle to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "vimeo-t7",
      q: "The billing trend buckets cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's cycles, and quarter-end is exactly when enterprise renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's story here: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August — those deltas are how bandwidth-commit conversations start.",
      tag: "dates",
    },
    {
      id: "vimeo-t8",
      q: "Finance says a billing statement is 'paid' but the settlements table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlements, keep the settlement id NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and settlements carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "vimeo-t9",
      q: "The board packet stacks 'cycles booked' beside 'cycles stamped'. Walk me through the set operations you reach for — and which one silently deletes rows.",
      a: "EXCEPT answers the board's real question — 'which booked cycles never stamped' — by keeping rows of the first branch that do not appear in the second: orders EXCEPT the stamped subset returns the 21 unstamped rows (14 trials plus 7 churned). INTERSECT keeps only rows in both — the 82 stamped — and UNION stacks both populations, collapsing exact duplicate rows silently. That collapse is the trap: two branches that emit byte-identical rows lose one of them with no warning, so UNION ALL plus a written reason why duplicates are impossible is the house discipline. The direction also matters: stamped EXCEPT booked returns empty, because every stamped cycle is a booked cycle — nested populations are not symmetric under EXCEPT.",
      tag: "setops",
    },
    {
      id: "vimeo-t10",
      q: "The ops board needs active, upgrading, trial and churned counts in ONE scan that reconciles to 103 by construction. How do you build it?",
      a: "One scan, four conditional aggregates: COUNT(*) FILTER (WHERE status = 'delivered') for active, the same shape for 'shipped', 'pending' and 'cancelled', plus COUNT(*) as the denominator — one row, and the four branches foot to 103 by construction because the statuses partition the table. SUM(CASE WHEN status = '...' THEN 1 ELSE 0 END) is the portable twin when a warehouse lacks FILTER, and both beat four sequential queries, which are four chances to drift on the WHERE clause. The reconciliation identity is the deliverable, not a nicety: if the four branches do not sum to COUNT(*), a status value outside the map has landed in the data. The interviewer is grading whether the census shape or the identity comes first — the identity does.",
      tag: "groupby",
    },
    {
      id: "vimeo-t11",
      q: "The usage read joins cycles to line items to plan SKUs. Walk me through the grains that join chain multiplies — and what COUNT(*) counts at the end of it.",
      a: "Customers joins to orders at cycle grain — 103 rows — then to order_items at line grain, which multiplies: 251 usage lines, and every cycle's row repeats once per line it carries. COUNT(*) at the end of the chain counts LINES, not cycles — 251, carrying 498 bandwidth/add-on units. The two-grain census habit exists precisely for this: COUNT(DISTINCT o.id) beside COUNT(*) keeps the cycle count honest next to the line count, and SUM(oi.quantity) is a third number again. Grain discipline also decides the fold: revenue per market wants cycle grain (orders.total), usage per market wants line grain. Saying 'one row per what?' at every stage of the chain is the habit the panel grades.",
      tag: "joins",
    },
    {
      id: "vimeo-t12",
      q: "Each cycle row must carry its market's total book beside it, so a share column can divide safely. What window frame does that, and what does omitting ORDER BY mean?",
      a: "SUM(o.total) OVER (PARTITION BY c.region) with no ORDER BY: the default frame when there is no ORDER BY is the whole partition, so every row inside a market carries that market's full book — 19 cycles each see the US total, 45 see the EU total. Adding ORDER BY changes everything: the frame collapses to running semantics and the column silently becomes a cumulative. The share is then total / the partition sum — 100.0 * o.total / SUM(...) OVER (...) — with the multiplier before the division for the integer-truncation reasons the churn map already teaches. This is the denominator-safe way to build shares: no self-join, no correlated subquery, and the partition key IS the population definition printed in the query.",
      tag: "windows",
    },
    {
      id: "vimeo-t13",
      q: "Account metadata arrives full of gaps — optional company names, missing regions on imported rows. What is your NULL policy for the account report, and how do you test for NULLs in SQL?",
      a: "Policy first: NULL means 'not known', never zero and never an empty string wearing a disguise, so every report states whether gaps are kept (as NULL) or bucketed (COALESCE(region, 'unassigned') into an explicit arm). The mechanics people fail: region = NULL is UNKNOWN even when region IS NULL — the only honest test is IS NULL / IS NOT NULL, and a filter on region = NULL silently empties the report. COALESCE is for presentation and bucketing, not for laundering: COALESCE(latency, 0) invents same-day plan changes for trials, while COALESCE(company_name, 'Independent') names a real population honestly. The line between the two — inventing a value versus naming a gap — is the answer the panel wants.",
      tag: "nulls",
    },
    {
      id: "vimeo-t14",
      q: "The top-cycles worklist prints ten rows. Two cycles share a total at the boundary and the list shuffles between runs. What is happening and how do you ship it deterministically?",
      a: "ORDER BY total alone leaves tied rows in engine-dependent order, so rows at the LIMIT boundary swap between runs — the worklist is nondeterministic and nobody can reproduce what the requester saw. The fix is a named tie-breaker: ORDER BY total DESC, o.id ASC — id is stable, and the query comment records that the tie policy is arbitrary-but-fixed, which is what the business actually needs. LIMIT then cuts a deterministic prefix; note that LIMIT without ORDER BY is worse than either, it is a random sample wearing a leaderboard's clothes. On tie-heavy data — four accounts tied at 4 cycles on this db — the tie-breaker is not styling, it is the difference between a reproducible register and a support ticket.",
      tag: "pipeline",
    },
    {
      id: "vimeo-t15",
      q: "Growth wants accounts carrying more cycles than the platform average. Compare the scalar, correlated and CTE shapes — and name the empty-case behavior of each.",
      a: "The scalar shape computes the mean once — 6.4375 cycles per account on this db — and compares each account's count to it: fast, and empty-safe here because 16 accounts always produce a mean. The correlated shape compares each account to a mean recomputed per row, which answers a different question (above ITS market's mean, say) at a different cost, and inherits the same empty-inner behavior when the market filter empties the inner fold — the comparison goes UNKNOWN and rows vanish silently. The CTE shape folds per-account counts first, then compares — the readable production shape, and the one that composes with the watchlist (four accounts clear the mean: 24, 17, 14, 13). Every shape gets the same unprompted disclosure: the inner fold's population and its zero-row behavior.",
      tag: "subqueries",
    },
    {
      id: "vimeo-t16",
      q: "The plan-change latency histogram buckets 2–4 day stamps. julianday or STRFTIME — what does each buy, and where does month-end arithmetic bite?",
      a: "They answer different questions. julianday(shipped_at) - julianday(created_at) yields a fractional-day duration — the 2.98 average and the 2–4 spread live here — and it is NULL exactly when a stamp is missing, which is the feature the population filter relies on. STRFTIME shapes calendar keys: '%Y-%m' builds the 14-month spine, '%Y-%m-%d' the daily view, and the zero-padding is what keeps February sorting after January. Month-end bites two ways: BETWEEN '2024-01-01' AND '2024-01-31' drops the last night's cycles while a half-open window — >= first day AND < first day of next month — keeps them, and enterprise renewals land exactly on that edge. Durations use julianday; bucketing uses STRFTIME; the histogram that mixes them up reports day-counts as durations.",
      tag: "dates",
    },
    {
      id: "vimeo-t17",
      q: "The book averages 338.19 per cycle, yet the four biggest accounts average far more per cycle. Same data — why do the two 'averages' disagree, and which belongs on the slide?",
      a: "They disagree because they average different populations. 338.19 is the per-CYCLE mean — SUM(total) over 103 cycle rows — so a 24-cycle account contributes 24 equally-weighted rows. The per-ACCOUNT mean folds first: each account's book summed, then averaged over 16 accounts, which hands a 24-cycle account one vote instead of 24 and lifts the number toward the enterprise logos. Neither is wrong; they answer 'typical cycle' versus 'typical account'. The slide must name its grain — average cycle value 338.19 on the revenue slide, per-account books on the concentration slide — because the 63.5% concentration story only exists at account grain. AVG vs SUM/COUNT over folded aggregates is exactly the arithmetic that decides which one prints.",
      tag: "aggregation",
    },
    {
      id: "vimeo-t18",
      q: "The anomaly list has two mirror errors: a void statement that settled (#11, 925.00) and a paid statement that never settled (#28, 1,756.00). Why does each need its own query, and what does that say about status columns?",
      a: "Because the errors fail in opposite directions. The anti-join — statements LEFT JOIN settlements kept on NULL settlement id — catches #28: a 'paid' claim with no settlement rows, a status that lies. The join-side flip — a void status WITH settlement rows — never appears in that anti-join, because #11 drew a leg; it needs its own scan settled-by-void-status. Together they prove the rule: status is a claim, settlement rows are the ledger of record, and every reconciliation reads the ledger, then audits the claims against it in both directions. A single 'find bad statements' query cannot exist — the error space is two-sided — which is why the coverage split ships as a census (21 exact / 1 partial / 6 none) with the anomalies attached, not as one confident number.",
      tag: "quality",
    },
    {
      id: "vimeo-t19",
      q: "Imports split one enterprise account into two — 'studio north' and 'Studio North'. Walk me through the hygiene pass you run before any name-keyed join.",
      a: "Names are display strings, not keys — the hygiene pass runs before the join, not after the damage. TRIM strips the leading/trailing whitespace that makes 'Studio North ' a different account, UPPER (or LOWER) collapses case drift so both rows fold into one identity, and the pass logs how many rows it changed, because a silent rewrite is a new anomaly. After normalizing, GROUP BY the cleaned key and count — a count that drops proves the split is healed; a count that stays two means the difference is real characters (a trailing digit, an HTML entity), not case. Longer term the fix is an account id, not name matching: the LIKE 'studio%' scan that finds the near-duplicates is a one-time tool, and LIKE with a leading wildcard is also the scan that cannot use an index. The interview point: name-keyed joins are a data-quality decision wearing a string-function costume.",
      tag: "strings",
    },
    {
      id: "vimeo-t20",
      q: "Each account shows up in the usage ledger many times — the register must keep ONE row per account, the latest. How do you dedupe, and why not GROUP BY?",
      a: "ROW_NUMBER over a per-account partition, ordered by the recency column DESC, then keep rn = 1: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) — deterministic once a tie-breaker (id) is named. GROUP BY with MAX(created_at) gets the newest timestamp but cannot carry the rest of that row's columns honestly; joining MAX back to the base table is the two-step the window does in one pass. The dedupe discipline: state what 'latest' means (created_at, then id), and state what happens to ties — ROW_NUMBER picks one row, which is a policy you wrote down, not an accident you shipped. This is the same keep-latest shape that powers per-account latest-cycle reads and per-SKU latest-line reads in the billing pod's registers.",
      tag: "windows",
    },
    {
      id: "vimeo-t21",
      q: "Beyond the ten-cycle bar, growth wants accounts whose usage spans at least three distinct plan SKUs. Where does each floor live and how do distinct floors differ from count floors?",
      a: "Both are group-level facts, so both live in HAVING — HAVING COUNT(*) >= 10 for the cycle bar, HAVING COUNT(DISTINCT product_id) >= 3 for the SKU-spread bar, which can sit in the same clause because HAVING judges groups after they form. The distinct floor is a different animal: an account with 30 lines of ONE SKU fails COUNT(DISTINCT ...) = 1 while sailing past the count bar, so the two conditions select different populations and the board prints both. WHERE cannot host either — aggregates do not exist before grouping — and a nested query is only needed when the threshold is itself computed, like the 6.44 platform mean. The escalation the interviewer wants: name which bar is breadth (distinct SKUs) and which is depth (cycle count), because the upsell list reads breadth.",
      tag: "groupby",
    },
    {
      id: "vimeo-t22",
      q: "The billing pod standardized on EXISTS over NOT IN for the dunning list. Make the case — what does NOT IN do that EXISTS never does?",
      a: "NOT IN materializes the subquery's list and compares every outer row against it under three-valued logic: x NOT IN (...) is UNKNOWN the moment one NULL enters the list, so a single NULL invoice_id in the settlements side empties the dunning register while the query looks valid. NOT EXISTS short-circuits on the first match, never materializes a list, and treats NULLs correctly — a NULL leg matches nothing, which is the truth. It also composes with the correlation the dunning list needs (legs for THIS statement), which NOT IN cannot express per-row without another trap. The house rule on this db: EXISTS for existence, IN for short literal lists, NOT IN only over a column that has been NULL-guarded and the guard is visible in the query. The candidate who says 'they're equivalent' has never shipped an empty report.",
      tag: "subqueries",
    },
    {
      id: "vimeo-t23",
      q: "Growth wants next month's position on the spine, not last month's. How does LEAD differ from LAG on the 14-month walk, and what does the last row print?",
      a: "LAG(booked) OVER (ORDER BY month) looks backward — the delta column reads current minus prior, so January 2024, the spine's first row, prints NULL: there is no prior, it is the baseline. LEAD(booked) OVER (ORDER BY month) looks forward — each month carries next month's value, which is the forecast-facing shape, and now it is the LAST row (2025-02) that prints NULL: there is no next. The symmetric trap is coalescing the edge NULL to zero — it reads as a flat month at exactly the edge where the board's eye lands, so the row ships as NULL with a 'baseline' / 'no forward month' label. Same partition, same order, opposite edge; the interviewer wants you to say which edge your query leaves NULL before they ask.",
      tag: "dates",
    },
    {
      id: "vimeo-t24",
      q: "The close ships only when the ledger trial balance reads 181,080 against 181,080. Write the check out loud — and the cents rule the check depends on.",
      a: "The check: SUM(debit_cents) and SUM(credit_cents) over ledger_entries must return equal integers — 181,080 dollars in cents terms — and the query prints both sums and their delta; delta zero ships, anything else blocks the close. The cents rule underneath: the finance tables store INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 forces real division before any ROUND, because SUM(cents)/100 in integer arithmetic truncates the tail cents off every odd-cent group and ROUND cannot recover them after the fact. Comparing in cents, not dollars, is the second half of the discipline: no rounding noise can flip the identity. This is the same claim-versus-ledger culture as the settlement census — 21 exact / 1 partial / 6 never-collected — just at the GL layer, where the identity is the artifact.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "vimeo-mcq-1",
      prompt: "A cycle row's status reads 'shipped'. In this kit's Vimeo stage map, what happened?",
      choices: ["Upgrade in flight — the plan change is stamped and moving", "Active paid cycle — the term completed", "Churned — cancelled mid-term", "Trial — awaiting conversion"],
      answer: 0,
      why: "The stage map is fixed: shipped = upgrade in flight (30 of 103 cycles, 29.1%), with shipped_at as the plan-change stamp. It is the status billing ops staffs the migration queue from.",
      notes: [
        { choice: 1, why: "Active paid is 'delivered' — 52 cycles at term. Calling in-flight upgrades active inflates the kept rate before the plan change actually lands." },
        { choice: 3, why: "Trial is 'pending' — 14 cycles with no stamp yet. Pending is not churn and not active; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-2",
      prompt: "The upgrade stamp rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 stamped, 14 trials and 7 churned of 103 booked.",
      choices: ["Stamped + churned only (82/89 = 92.1%)", "All cycles booked (82/103 = 79.6%)", "Active cycles only (52/82)", "Distinct accounts (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL cycles booked — trials stay in the denominator because 'not yet stamped' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 trials inflates the rate to 92.1% by deleting the population still converting — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, shipped_at is the plan change landing. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-3",
      prompt: "EU carries 45 cycles from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 cycles per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is cycles AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to churned cycles only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the churn map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-5",
      prompt: "Keep only accounts carrying at least 10 cycles. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE cycles >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 cycles — clears a 10-cycle bar per account.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'cycles' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-6",
      prompt: "The upgrade ladder runs 24, 17, 14, 13, 5 cycles, then FOUR accounts tied at 4. Under RANK, what rank do the two 3-cycle accounts carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-cycle accounts share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The growth board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The trials double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 cycles.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-8",
      prompt: "A staging win-back list uses account_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the win-back list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every cycle carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-9",
      prompt: "A board stack puts upgrading cycles under churned cycles in one layout, built with UNION. A reviewer says one account's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same account, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same account, same counts, no region or branch label — collapse into one, and the board loses an account with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-10",
      prompt: "A dashboard walks subscription revenue cycle by cycle: SUM(total) OVER (ORDER BY booked_at). Two cycles share a booked_at second, and the cumulative 'jumps two cycles at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on booked_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at cycle grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-11",
      prompt: "The ops board wants active, upgrading, trial and churned counts in one row from one scan. Which shape delivers that?",
      choices: ["COUNT(*) FILTER (WHERE status = 'delivered') beside the same shape for 'shipped', 'pending' and 'cancelled'", "Four sequential queries pasted into one spreadsheet row", "GROUP BY status with COUNT(*)", "A UNION stack of four scans, one per status"],
      answer: 0,
      why: "FILTER (WHERE …) branches per aggregate over a single scan — one row, four stages, and COUNT(*) beside them makes the 52 + 30 + 14 + 7 = 103 reconciliation visible by construction. SUM(CASE …) is the portable twin.",
      notes: [
        { choice: 1, why: "Four sequential queries are four chances to drift on the WHERE clause — the identity must hold in one scan or it holds nowhere." },
        { choice: 2, why: "GROUP BY status is fine SQL but flips the grain to one row per status — the board layout wants the census as one row, and the reconciliation is then an assertion, not inherited." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-12",
      prompt: "The billing spine groups cycles by STRFTIME('%m', created_at) and prints 12 buckets. What is wrong?",
      choices: ["Nothing — there are 12 months", "'%m' drops the year, so January 2024 merges with January 2025 — the spine needs '%Y-%m' and its 14 buckets", "'%m' returns the minute, not the month", "STRFTIME cannot run on TEXT timestamps"],
      answer: 1,
      why: "'%m' is month-only, so the two Januaries fold into one bucket and the trend reads flat across the year boundary. '%Y-%m' is year plus zero-padded month — 14 buckets on this db, 2024-01 through 2025-02.",
      notes: [
        { choice: 0, why: "The db spans 14 calendar months — 12 buckets is the smell, not the spec. Bucket count is a reconciliation check on the spine." },
        { choice: 2, why: "'%M' (capital) is the minute; '%m' is the month. Case matters, and the lowercase form is the right tool used wrong here." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-13",
      prompt: "A quarter cut uses BETWEEN '2024-03-01' AND '2024-03-31' on created_at. Which cycles can it silently drop?",
      choices: ["None — BETWEEN is inclusive on both ends", "Cycles booked on the last night whose timestamp carries a time component after '2024-03-31 00:00:00' — the half-open window (>= first day AND < next month) is the safe cut", "The first day's cycles — BETWEEN is exclusive on the lower edge", "Only cancelled cycles, because they book late"],
      answer: 1,
      why: "'2024-03-31' as a TEXT comparison means '2024-03-31 00:00:00', so March 31st's later timestamps fall outside the range. Half-open windows — >= month start AND < next month start — are the house rule, and quarter-end is exactly when enterprise renewals land.",
      notes: [
        { choice: 0, why: "Inclusivity is not the issue — timestamp granularity is. The end literal is a midnight, not a day." },
        { choice: 2, why: "The lower edge is fine; '2024-03-01' captures the first night's midnight and everything after it." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-14",
      prompt: "MAX(total) over orders returns 1,088.44. What status does that biggest cycle on the book carry?",
      choices: ["'delivered' — the biggest value must be a completed cycle", "'pending' — the peak booking is a trial-stage cycle, which is why MAX(total) is a booked-value fact, not a revenue fact", "'shipped' — upgrades carry the largest bookings", "It depends on the market — the max differs per region"],
      answer: 1,
      why: "The 1,088.44 ceiling is cycle #74, status 'pending' — booked value, not collected revenue. Spread metrics quote the booking ladder (25.47 to 1,088.44), and the slide says 'booked', not 'active'.",
      notes: [
        { choice: 0, why: "Assuming the peak is a completed cycle is exactly the status-blindness the funnel census exists to fix — the top two bookings on this db are both pending." },
        { choice: 2, why: "The largest shipped cycle is 845.92 — real, but not the ceiling. MAX over the unfiltered table answers one question only." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-15",
      prompt: "A plan-band CASE classifies usage lines but omits the ELSE arm for the Basic band. What lands in the report for those lines?",
      choices: ["The query errors — CASE arms must be exhaustive", "NULL — the rows survive with a NULL band, and every fold or join keyed on the band silently drops them", "The first WHEN arm absorbs them", "An empty string, which sorts first"],
      answer: 1,
      why: "CASE without a matching WHEN and without ELSE returns NULL — not an error, not a default. A hole in the CASE is a hole in the forecast: the band-fold's totals stop reconciling to the 251-line ledger exactly by the size of the missing arm.",
      notes: [
        { choice: 0, why: "That it runs is the trap. A silent NULL band passes staging and breaks the reconciliation two queries later." },
        { choice: 2, why: "CASE evaluates WHENs in order but never absorbs unmatched rows into an earlier arm — that would require the predicate to match." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-16",
      prompt: "The ingest health check folds each day's upload manifest into one cell. Which expression produces a readable, named-separator list?",
      choices: ["GROUP_CONCAT(name)", "GROUP_CONCAT(name, ' | ')", "CONCAT(name, ' | ')", "STRING_AGG(DISTINCT name) ORDER BY name"],
      answer: 1,
      why: "SQLite's GROUP_CONCAT takes an optional second argument as the separator — GROUP_CONCAT(name, ' | ') folds the day's manifest into one readable cell. The default separator is a bare comma, which collides with names that contain commas.",
      notes: [
        { choice: 0, why: "Runs, but the comma default makes 'Pro, Bandwidth' style names ambiguous in the cell — the manifest becomes unparseable exactly when it matters." },
        { choice: 2, why: "CONCAT joins a known number of arguments — it cannot fold a variable number of rows. Wrong function family for the manifest." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-17",
      prompt: "Same ladder as before — 24, 17, 14, 13, 5, then four accounts tied at 4. Under DENSE_RANK, what rank do the two 3-cycle accounts carry?",
      choices: ["10", "7", "6", "9"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the next distinct count lands on 7. The RANK answer is 10 — same tie, different policy about the phantom positions.",
      notes: [
        { choice: 0, why: "10 is the RANK semantics — gaps included. Publishing DENSE_RANK numbers on a RANK board (or the reverse) shifts every account below the tie." },
        { choice: 2, why: "6 is the tie block's rung, not the next distinct count's. Off-by-one on the block boundary again — the tie consumes 6, the 3s sit on 7." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-18",
      prompt: "The coverage split reads 21 exact / 1 partial / 6 none. What does 'exact' compare, per statement?",
      choices: ["COUNT(settlement rows) = 1", "SUM of that statement's settlement legs against the statement's amount_cents — folded per statement, in cents", "The statement's status = 'paid'", "MAX(paid_on) is not NULL"],
      answer: 1,
      why: "Exact means the legs sum to the claim: SUM(p.amount_cents) = i.amount_cents per statement, computed in cents to avoid rounding noise. A statement can draw two legs that together settle exactly — leg COUNT was never the test.",
      notes: [
        { choice: 0, why: "Leg count is coverage-of-anything, not coverage-of-the-claim — five partial legs would still read 'exact'. The sum is the ledger." },
        { choice: 2, why: "Status is the claim, not the evidence — paid-status #28 (1,756.00) has zero legs and still reads 'paid'. That lie is why the census exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-19",
      prompt: "The dunning list must return the 6 never-collected statements worth 15,217. Which query actually returns them?",
      choices: ["SELECT * FROM invoices WHERE status = 'open'", "Invoices LEFT JOIN payments kept on NULL payment id — the anti-join over settlement legs", "Invoices INNER JOIN payments WHERE amount_cents > 0", "SELECT * FROM invoices WHERE status = 'paid'"],
      answer: 1,
      why: "Never-collected is a LEDGER fact: no settlement leg exists. The LEFT JOIN + IS NULL anti-join returns exactly the 6 — including paid-status #28 (1,756.00), the claim that lies — and excludes void-but-settled #11, which drew a leg.",
      notes: [
        { choice: 0, why: "Returns 6 open statements — but the wrong 6: it includes partially-settled #25 (4,000 of 6,148) and misses paid-status #28. Status is a claim, not the ledger." },
        { choice: 2, why: "An INNER JOIN keeps only statements WITH legs — it deletes precisely the rows the dunning list exists to find." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-20",
      prompt: "Each market's priciest cycle feeds a regional escalation list. Which expression flags exactly one row per market?",
      choices: ["MAX(total) with GROUP BY region", "ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC) = 1", "RANK() OVER (ORDER BY total DESC) = 1", "total = MAX(total) over the whole table"],
      answer: 1,
      why: "ROW_NUMBER numbers rows inside each region partition, so = 1 selects one row per market — four markets, four flags, ties broken by the named tie-breaker. MAX with GROUP BY returns the value but cannot carry the cycle's identity columns honestly.",
      notes: [
        { choice: 0, why: "Right aggregate, wrong shape for the list — the value alone cannot carry the cycle id and account into the escalation email without a second join." },
        { choice: 2, why: "RANK over the whole table without PARTITION BY ranks across markets — = 1 keeps only the single global peak, one row, not four." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-21",
      prompt: "EU runs 45 cycles from 8 accounts, US runs 19 from 2, APAC runs 37 from 5. Which market reads the highest cycles-per-account intensity?",
      choices: ["EU — the biggest cycle base wins", "US — 19/2 = 9.5, the concentrated intensity crown", "APAC — 37/5 = 7.4", "They tie at the platform mean of 6.44"],
      answer: 1,
      why: "Intensity is cycles per DISTINCT account: US 9.5, APAC 7.4, EU 5.6. The US concentrates 19 cycles in 2 logos — the two-grain census exists so this ratio is computed, not guessed from the bigger EU base.",
      notes: [
        { choice: 0, why: "45 cycles is load, not intensity. EU's 8 accounts dilute it to 5.6 — the lowest of the three, which is the broadening signal." },
        { choice: 3, why: "6.44 is the platform mean of per-account counts — no market's intensity lands on it, and a tie would erase the targeting story." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-22",
      prompt: "A churn-staging report runs WHERE total > (SELECT AVG(total) FROM orders WHERE region = 'LATAM' AND status = 'cancelled') and returns nothing — though LATAM books 2 cycles. Why?",
      choices: ["The outer WHERE is wrong — it needs the same LATAM filter", "LATAM has zero cancelled cycles, so the inner fold is empty, the scalar returns NULL, and total > NULL is UNKNOWN — every row drops silently", "SQLite caches the empty subquery as 0, so nothing clears the comparison", "The report needs HAVING, not WHERE"],
      answer: 1,
      why: "The empty-inner-query bug, live: LATAM's 2 cycles are both active, the cancelled-arm mean has no population, the scalar returns NULL instead of erroring, and UNKNOWN comparisons quietly empty the report. The fix is naming the population and handling the empty case on purpose.",
      notes: [
        { choice: 0, why: "Mirroring the filter changes the question. The bug is the inner fold's empty population, not a missing predicate on the outside." },
        { choice: 2, why: "No caching, no zero — an empty scalar subquery returns NULL, and NULL comparisons are UNKNOWN. That is why nothing errors and nothing ships." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-23",
      prompt: "Which EXCEPT answers 'which booked cycles never stamped'?",
      choices: ["stamped EXCEPT booked", "booked EXCEPT stamped", "booked UNION stamped", "booked INTERSECT stamped"],
      answer: 1,
      why: "EXCEPT keeps rows of the first branch absent from the second — booked EXCEPT stamped leaves the 21 unstamped (14 trials + 7 churned). The reversed direction returns empty, because every stamped cycle is a booked cycle.",
      notes: [
        { choice: 0, why: "Nested populations are not symmetric: stamped is a subset of booked, so reversed EXCEPT is structurally empty — a report of nothing that runs clean." },
        { choice: 3, why: "INTERSECT keeps rows in BOTH — the 82 stamped. The opposite of the question, wearing the same syntax." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-24",
      prompt: "The census says 2.44 usage lines per cycle. Which pair computes it?",
      choices: ["COUNT(order_items.id) ÷ COUNT(DISTINCT order_items.order_id) over the joined ledger", "SUM(quantity) ÷ COUNT(*)", "COUNT(*) ÷ COUNT(DISTINCT customer_id)", "AVG(order_items.quantity)"],
      answer: 0,
      why: "251 lines ÷ 103 distinct cycles = 2.44 — line rows over the distinct cycles that carry them. The join multiplies cycles into lines, so the denominator must fold back with DISTINCT.",
      notes: [
        { choice: 1, why: "That is units per line (498/251 ≈ 1.98) — a third, real metric wearing the wrong name. Grain again." },
        { choice: 2, why: "Lines over accounts mixes three grains — 251/16 reads 15.7 and is nobody's metric." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-25",
      prompt: "COUNT(*) returns 103; COUNT(shipped_at) returns 82. What does the gap of 21 represent?",
      choices: ["Data loss — 21 rows were dropped in ETL", "The 21 unstamped cycles — 14 trials plus 7 churned, where NULL means 'no plan change yet'", "Duplicate cycles that DISTINCT would remove", "Cycles with totals below the 338.19 average"],
      answer: 1,
      why: "COUNT(column) skips NULLs, so the gap is exactly the not-yet-stamped population — a feature the latency report's denominator policy is built on, not a data-quality incident.",
      notes: [
        { choice: 0, why: "The rows are all there — COUNT(*) proves it. Treating the gap as loss triggers a false ETL incident at 8am." },
        { choice: 2, why: "DISTINCT dedups whole rows, and cycles are unique by id — the gap is NULLs, not duplicates." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-26",
      prompt: "The top-cycles worklist is ORDER BY total DESC LIMIT 10, and two cycles tie exactly at the boundary. What prints, and what is the fix?",
      choices: ["Both ties always appear — LIMIT expands for ties", "Engine-dependent order among ties — name a deterministic tie-breaker (total DESC, o.id ASC) and say so in the comment", "An error — LIMIT requires a unique sort key", "Ties are impossible on REAL columns"],
      answer: 1,
      why: "LIMIT cuts a prefix of an ordered list; ties inside the prefix have engine-dependent order unless a tie-breaker is named. The fix is a stable secondary key plus a written tie policy — the same discipline the four-way-at-4 leaderboard runs on.",
      notes: [
        { choice: 0, why: "That is FETCH-with-TIES behavior — SQLite's LIMIT does not expand for ties, and assuming it does drops real cycles off the worklist." },
        { choice: 2, why: "LIMIT runs fine on any ORDER BY. Nondeterminism is not an error — it is worse: a report that changes between reruns with no exception raised." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-27",
      prompt: "The spine's first delta — January 2024 — prints NULL. What ships?",
      choices: ["Coalesce it to 0 so the chart is continuous", "Ship it as NULL (or label it 'baseline') — there is no prior month, and a zero would read as a flat month", "Drop the row — the walk starts in February", "Backfill it with the February value"],
      answer: 1,
      why: "LAG has no row before the first, so the first movement is NULL by definition — the baseline, not a datapoint. Coalescing to zero invents a flat opening month at exactly the edge where the board's eye lands.",
      notes: [
        { choice: 0, why: "The classic launder: 3,731.97 booked against a fake 0 delta reads as 'flat January' and misframes the whole walk." },
        { choice: 2, why: "Dropping the row loses the baseline value itself — the 3,731.97 opening is the reference every later delta is judged against." },
      ],
      difficulty: "easy",
    },
    {
      id: "vimeo-mcq-28",
      prompt: "SUM(total) OVER (PARTITION BY region) — no ORDER BY — sits beside each cycle row. What does the column mean?",
      choices: ["A running total within the market", "The market's full book repeated on every one of its rows — the whole-partition frame — ready as a share denominator", "The global 34,833.28 book on every row", "A per-row average of the market's cycles"],
      answer: 1,
      why: "Without ORDER BY the default frame is the whole partition, so every US row carries the US book (19 cycles' worth), every EU row the EU book — the denominator-safe way to build market shares. Adding ORDER BY would silently turn it into a running sum.",
      notes: [
        { choice: 0, why: "Running semantics need ORDER BY (and then a ROWS/RANGE frame). The frame is part of the metric definition, not a styling choice." },
        { choice: 2, why: "The global book would need an empty OVER () — no partition. PARTITION BY region scopes the frame to the market." },
      ],
      difficulty: "hard",
    },
    {
      id: "vimeo-mcq-29",
      prompt: "ROUND(SUM(amount_cents) / 100, 2) prints 879 for a group that should read 879.03. Why?",
      choices: ["ROUND cannot handle money — cast to TEXT first", "INTEGER cents ÷ INTEGER 100 is integer division, which truncates BEFORE ROUND runs — the .0 (or a CAST) must force real division first", "SQLite stores SUM as INTEGER and caps it", "The group has odd cents that SQLite drops on write"],
      answer: 1,
      why: "cents/100 in integer arithmetic truncates to 879 and the damage is done before ROUND sees it — ROUND(x, 2) of an integer is that integer. SUM(amount_cents) / 100.0 promotes to real division, then ROUND presents it: 879.03.",
      notes: [
        { choice: 0, why: "Casting to TEXT preserves the truncated value and prints it prettier — presentation cannot recover arithmetic that already lost the cents." },
        { choice: 3, why: "The cents are all in storage — INTEGER columns hold them exactly. The loss happens in the division, which is why the .0 is policy." },
      ],
      difficulty: "medium",
    },
    {
      id: "vimeo-mcq-30",
      prompt: "The spine shows the August jump as +1,158.21. Which expression computes that column?",
      choices: ["ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY month), 2)", "ROUND(SUM(total) OVER (ORDER BY month), 2)", "LAG(ROUND(SUM(total), 2)) placed in WHERE", "ROUND(total - LAG(total) OVER (ORDER BY created_at), 2) over the raw rows"],
      answer: 0,
      why: "The delta is current month minus prior month at the FOLDED grain: LAG(SUM(total)) inside OVER (ORDER BY month) carries the previous bucket's aggregate up to the current row — 2,352.07 minus 1,193.86 in August. The first row prints NULL baseline.",
      notes: [
        { choice: 1, why: "That is the cumulative walk — every month carries the running book. Right function family, different metric on the same slide." },
        { choice: 3, why: "LAG over raw rows walks cycle to cycle, not month to month — the deltas would be per-cycle moves, and the monthly story dissolves into 103 noisy steps." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-vimeo-1",
      tier: "easy",
      topic: "j2",
      universe: "funnel",
      title: "The plan-change register",
      brief:
        "Vimeo-flavored brief on the storefront db: an upgrade wave is moving through the base and billing ops works from the plan-change register — every cycle whose plan change is in flight, with the market it bills in, the value it carries and the day its shipped_at stamp landed. Probed facts: 30 of 103 cycles are upgrading (status 'shipped', 29.1%) carrying 11,996.72 of the book; the market split reads EU 12, APAC 8, US 10, LATAM 0 — LATAM's 2 cycles are both active, none upgrading. The register reads biggest cycle value first so the migration queue can be staffed from the top.",
      ask: "Return each upgrading cycle with its market, cycle value and plan-change stamp, biggest cycle value first.",
      template:
        "SELECT c.region AS market,\n       o.total AS cycle_value,\n       o.shipped_at AS plan_change_stamp\nFROM orders o\nJOIN customers c ON c.id = {1}\nWHERE o.status = {2}\nORDER BY {3} {4};",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the account join column",
          why: "Cycles attach to accounts through o.customer_id = c.id. Joining on o.id pairs each cycle with whoever shares its row number and silently reassigns every market's rows — a register of nothing that still renders.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the upgrade-in-flight literal",
          why: "Upgrading cycles are status 'shipped' — 30 rows, split EU 12, APAC 8, US 10, LATAM 0. 'delivered' swaps the register to the 52 completed cycles and the migration queue staffs itself from the wrong population.",
        },
        {
          answer: "cycle_value",
          kind: "keyword",
          label: "the biggest-first sort key",
          why: "The register reads biggest cycle value first — the queue gets staffed from the top. Sorting by the stamp timestamps the queue instead of pricing it, and the highest-value upgrade scrolls off the top of the worklist.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC puts the priciest upgrade on top. ASC opens the worklist on the smallest cycle — a correct query aimed at the wrong end of the queue, with the enterprise logo that pays for the wave buried at row thirty.",
        },
      ],
      distractors: ["c.customer_id", "c.id", "'delivered'", "'pending'", "o.id", "ASC"],
      walkthrough:
        "One join, one filter, one sort — a worklist, not a fold. The join attaches every cycle to its account's market, the WHERE keeps only the 30 upgrading rows (EU 12, APAC 8, US 10, LATAM 0 — matching the probed market split), and ORDER BY cycle_value DESC prices the migration queue from the top so the highest-value plan change gets an owner first. The stamp column ships with every row: plan changes landed 2 to 4 days after booking on this db, averaging 2.98 — which is why the register is a daily artifact during a wave, not a quarterly one. The chips each guard a failure: c.customer_id is no column and the query errors; c.id joins cycles to every account at once and the register explodes past the base; 'delivered' swaps in the 52 completed cycles and the queue staffs from finished work; 'pending' swaps in the 14 trials, none of which have a stamp to show; o.id sorts by cycle number and jumbles the value order the worklist exists for; ASC buries the enterprise logo at the bottom. The read underneath: the US carries 10 of its 19 cycles in flight — an upgrade-heavy market — while EU's 12 in flight ride a 45-cycle base.",
    },
    {
      id: "cs-vimeo-2",
      tier: "medium",
      topic: "q1",
      universe: "growth",
      title: "The 3,000-line concentration list",
      brief:
        "Finance memo on the storefront db: the pricing review opens with the concentration list — which creators' lifetime subscription books cross the 3,000 line — because enterprise retention is the quarter. Probed facts: the book totals 34,833.28 over 103 cycles; the 3,000-plus cohort is four creators — Alice Chen (EU, 24 cycles, 7,262.35), Emma Wilson (US, 17, 6,640.56), Grace Kim (APAC, 14, 4,574.23) and Maya Patel (APAC, 13, 3,644.56) — footing 22,121.70, 63.5% of the book across 68 of 103 cycles. Next below the line: Chloe Dubois at 2,667.93. The list reads biggest book first.",
      ask: "Return each 3,000-plus creator with market, cycle count and lifetime book to 2 decimals, biggest book first.",
      template:
        "SELECT c.name AS creator,\n       c.region AS market,\n       COUNT(*) AS cycles,\n       ROUND({1}(o.total), {2}) AS lifetime_book\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.customer_id IN (\n  SELECT customer_id FROM orders\n  GROUP BY customer_id\n  HAVING SUM(total) >= {3}\n)\nGROUP BY c.id\nORDER BY lifetime_book {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the lifetime-book fold",
          why: "The lifetime book is SUM(o.total) per creator — 7,262.35 for Alice Chen. AVG folds to per-cycle averages (~302) and the whole list drops below the line it is named for; COUNT prints cycle counts wearing dollar clothes.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the book's precision",
          noVerify: true,
          why: "Book values report to 2 decimals — 7,262.35, 6,640.56. ROUND(…, 1) prints 7,262.4 and the cells stop reconciling with the 34,833.28 book finance quotes on the same slide.",
        },
        {
          answer: "3000",
          kind: "number",
          label: "the concentration threshold",
          noVerify: true,
          why: "The line is 3,000: exactly four creators clear it and the cohort carries 63.5% of the book. 2,000 admits a fifth creator (2,667.93) and the share silently climbs; 10,000 empties the list and the pricing review has no head to read.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The list reads biggest book first — Alice Chen's 7,262.35 on top. ASC opens on the barely-above-line tail and the enterprise logo that pays for the quarter scrolls to row four.",
        },
      ],
      distractors: ["AVG", "COUNT", "MAX", "c.customer_id", "ASC", "0"],
      walkthrough:
        "A cohort gate, then a fold. The IN subquery folds orders by customer and keeps the ids whose SUM(total) clears 3,000 — four creators on this db — and the outer query joins those ids back to accounts, folds each creator's cycles (24, 17, 14, 13) under GROUP BY c.id, and rounds the lifetime book to 2 decimals: Alice Chen EU 7,262.35, Emma Wilson US 6,640.56, Grace Kim APAC 4,574.23, Maya Patel APAC 3,644.56, ordered biggest first. The four books foot to 22,121.70 — 63.5% of the 34,833.28 book across 68 of 103 cycles — which is the concentration number the pricing review actually reads; the next creator below the line, Chloe Dubois at 2,667.93, is exactly why the threshold is stated on the slide. The chips each break differently: AVG in the fold keeps the same four creators but prints per-cycle averages (~302.60) and the list stops being about lifetime value; COUNT prints 24/17/14/13 wearing dollar clothes; MAX prints each creator's largest single cycle (the 1,088.44 ceiling lives here) and the books shrink; c.customer_id is no column and errors; 0 in the gate admits all sixteen accounts and the list drowns; 0 in the precision slot truncates 7,262.35 to 7,262 and the cells stop reconciling with the slide; ASC reads the tail first. The threshold is a definition, not a constant: state it, then fold.",
    },
    {
      id: "cs-vimeo-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The 14-month billing spine",
      brief:
        "Growth-call brief on the storefront db: every month-close walks the 14-month billing spine — booked value per month, prior month beside current, delta rounded — because the upgrade engine's story lives in the deltas. Probed facts: the spine runs 2024-01 through 2025-02; the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August (2,352.07), then takes its steepest hit, -1,326.87, into November (1,648.80). The walk reads top to bottom with the first delta printed as NULL — the baseline, never a zero.",
      ask: "Return each month with booked value to 2 decimals and its month-over-month delta, in calendar order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({1}, created_at) AS month, SUM(total) AS booked\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       ROUND(booked, 2) AS booked,\n       ROUND(booked - {2}(booked) OVER (ORDER BY month), 2) AS delta\nFROM spine\nORDER BY month {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "'%Y-%m' is year plus zero-padded month — 14 buckets, 2024-01 to 2025-02, sorting correctly as text. '%m' alone merges the two Januaries into one bucket and the spine collapses to 12 lying rows; '%Y-%M' grabs minutes, which are zero on date-only strings, and buckets by year alone.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back window function",
          why: "LAG(booked) carries the previous month's aggregate onto the current row — the delta is current minus prior. LEAD compiles and runs, but flips every sign: August prints -1,158.21 and November turns into a gain, the walk reads backwards to the board.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar-order direction",
          why: "The walk reads top to bottom in calendar order, and the LAG frame's ORDER BY month fixes the walk's direction inside the window too — ASC keeps the first row the NULL baseline. DESC prints February 2025 first with the deltas in reversed sign order.",
        },
      ],
      distractors: ["'%m'", "'%Y-%M'", "LEAD", "DESC"],
      walkthrough:
        "Stage the spine, then walk it. The CTE folds orders into 14 month buckets at the '%Y-%m' key — zero-padded, so the text sort is the calendar sort — and sums booked value per bucket; the outer query rounds to 2 decimals and takes the delta with LAG over the month-ordered spine: the book opens at 3,731.97 with a NULL delta (no prior — the baseline), sags to the 1,193.86 July trough, jumps +1,158.21 into August, then loses the most, -1,326.87, into November's 1,648.80 before the walk ends at 2,390.53 in 2025-02. Those three deltas ARE the growth call: trough, jump, drop. The chips each break differently: '%m' merges the two Januaries (12 buckets, trend fiction), '%Y-%M' buckets by year because minutes are zero, LEAD flips every delta's sign so the trough reads as a peak, and DESC hands the board the walk upside-down. The first row's NULL is the artifact the interviewer probes: it ships as NULL with a 'baseline' label, never coalesced to zero.",
    },
    {
      id: "cs-vimeo-4",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-collected register",
      brief:
        "Mid-month dunning brief on the storefront db: billing works the never-collected register before a single reminder email goes out — statements that drew NO settlement leg, whatever their status claims. Probed facts: 28 billing statements, 22 drew at least one settlement leg, so the register holds 6 worth 15,217.00 — five open claims footing 13,461.00 and one paid-status statement, #28 at 1,756.00, whose claim lies. The void-but-settled #11 (925.00) and the partially-settled open #25 (4,000.00 of 6,148.00) both drew legs, so both fold OUT by construction. Statements and legs carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each claim status in the register with its statement count and owed total in dollars to 2 decimals, biggest exposure first.",
      template:
        "SELECT i.status AS claim,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / {1}, 2) AS owed_usd\nFROM invoices i\nLEFT JOIN payments s ON s.{2} = i.id\nWHERE s.id IS NULL\nGROUP BY i.status\nORDER BY {3} DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 13,461.00 and 1,756.00. The .0 is policy, not decoration — bare 100 is integer division and truncates the tail cents off any odd-cent group before ROUND can look at them.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the settlement key",
          why: "Legs join statements on s.invoice_id — the foreign key that says which claim a payment settles. s.id joins payment ids to statement ids, a wrong-grain coincidence that matches some rows by accident and reshuffles the register of exactly the wrong statements.",
        },
        {
          answer: "owed_usd",
          kind: "keyword",
          label: "the biggest-exposure sort key",
          why: "The dunning list reads biggest exposure first: open 5 / 13,461.00 on top, then the paid lie at 1,756.00. Sorting by statements puts the 1-statement anomaly on top and the 5-statement block the team actually works scrolls down.",
        },
      ],
      distractors: ["id", "ASC", "10", "1000"],
      walkthrough:
        "The anti-join IS the register. LEFT JOIN keeps every statement and hands NULL payloads to the ones without legs; WHERE s.id IS NULL keeps exactly those — 6 rows, because legs are the ledger of record and status is only a claim. GROUP BY status rolls them into two lines and the cents read through the /100.0 divider: open 5 / 13,461.00, paid 1 / 1,756.00 — footing to the probed 15,217.00 exposure. The composition is the lesson: void-but-settled #11 (925.00) and partial open #25 (4,000.00 of 6,148.00) both drew legs, so the anti-join removes them by construction — the register is no-legs, not unpaid-status — and the one paid-status row it keeps (#28) is precisely the claim that lies, which is why the dunning email goes to the ledger answer and the anomaly list, not to the status column. The distractors each break differently: s.id joins payment ids to statement ids and the register reshuffles; ASC opens the list on the 1,756.00 lie; /10 or /1000 print 134,610.00 or 1,346.10 — exposure off by an order of magnitude either way.",
    },
    {
      id: "cs-vimeo-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass stage census",
      brief:
        "The 08:15 standup brief on the storefront db: billing ops opens every day with the one-pass stage census — active, upgrading, trial and churned counts from ONE scan, reconciling to 103 by construction. Probed facts: 103 cycles booked — 52 delivered (active paid, 50.5%), 30 shipped (upgrade in flight, 29.1%), 14 pending (trial, 13.6%), 7 cancelled (churned, 6.8%). Four sequential queries are four ways to drift on the WHERE clause; the identity must hold in the same scan that reports the parts. The board reads the stages in funnel order: active, upgrading, trial, churned.",
      ask: "Return one row with total cycles booked and the four stage counts — active, upgrading, trial, churned — in that column order.",
      template:
        "SELECT COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE status = {1}) AS active_cycles,\n       COUNT(*) FILTER (WHERE status = {2}) AS upgrading,\n       COUNT(*) FILTER (WHERE status = {3}) AS trials,\n       COUNT(*) FILTER (WHERE status = {4}) AS churned\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the active-stage literal",
          why: "Active paid cycles are status 'delivered' — 52 of 103. 'paid' is not a status on this db: the filter compiles, reads 0, and the census's biggest stage silently empties while the query looks fine.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the upgrading-stage literal",
          why: "Upgrading cycles are status 'shipped' — 30 of 103, the population the migration queue staffs from. 'in-flight' or 'upgrade' are stage NAMES, not stored values — both run and print 0.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial-stage literal",
          why: "Trials are status 'pending' — 14 cycles with no shipped_at stamp yet. Reading them as 'trial' prints 0 and the trial arm of the funnel disappears from the reconciliation.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the churned-stage literal",
          why: "Churned cycles are status 'cancelled' — 7 of 103, the denominator of the 6.8% churn share. 'churned' is the board's word, not the column's value; the arm runs and reads 0.",
        },
      ],
      distractors: ["'paid'", "'in-flight'", "'trial'", "'churned'", "'active'"],
      walkthrough:
        "One scan, five columns, zero drift. COUNT(*) is the 103 denominator; each FILTER (WHERE …) branch is a conditional count over the same scan — 52 delivered, 30 shipped, 14 pending, 7 cancelled — and the four branches foot to 103 by construction because the statuses partition the table. That identity is the deliverable: if any branch drifts off its literal, the sum breaks and a status value outside the map has landed in the data. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin when a warehouse lacks FILTER; four sequential queries are four chances to drift and are banned at standup. The distractors all fail the same honest way — they are stage NAMES ('paid', 'in-flight', 'trial', 'churned', 'active'), not stored status values, so each branch compiles, prints 0, and silently empties its stage of the census. The board's read underneath: 50.5% of the book is at term, but 29.1% is mid-upgrade — calling shipped 'active' is the 30-versus-52 error the funnel exists to catch.",
    },
    {
      id: "cs-vimeo-6",
      tier: "easy",
      topic: "l5",
      universe: "pricing",
      title: "The spread ends: the 1,088.44 cycle",
      brief:
        "Pricing-review brief on the storefront db: the tiering story is the spread — booked cycle values run 25.47 to 1,088.44 — and every pricing deck opens on the top of that ladder. Probed facts: the top five cycles book 1,088.44 (#74, pending), 945.21 (#43, pending), 845.92 (#39, shipped), 826.03 (#15, shipped) and 785.79 (#57, shipped); three of the five are mid-upgrade or trial-stage, which is why the slide says 'booked', never 'collected'. The review reads biggest cycle first, ties broken deterministically so the deck reruns identically.",
      ask: "Return the top 5 cycles by booked value — cycle id, status and total — biggest first.",
      template:
        "SELECT id, status, total\nFROM orders\nORDER BY {1} {2}\nLIMIT {3};",
      slots: [
        {
          answer: "total",
          kind: "keyword",
          label: "the booked-value sort key",
          why: "The spread ladder is built on total — orders.total is the booked cycle value in REAL dollars. Sorting by status alphabetizes ('cancelled', 'delivered', …) and the ladder dissolves; sorting by id walks booking order, which is history, not value.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review reads the 1,088.44 ceiling first. ASC opens on the 25.47 floor — a correct query aimed at the wrong end of the ladder, with the cycle the deck exists to discuss buried at row 99.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the top-of-ladder cut",
          why: "Five rows is the deck's top-of-ladder panel — 1,088.44 down to 785.79. LIMIT 1 keeps only the ceiling and the 'three of five are mid-flight' composition fact, the slide's real point, disappears.",
        },
      ],
      distractors: ["status", "created_at", "ASC", "1"],
      walkthrough:
        "One table, one sort, one cut — the query is trivial so the interview lives in the framing. ORDER BY total DESC lines the book up from the 1,088.44 ceiling down, LIMIT 5 cuts the panel, and the printout — #74 pending 1,088.44, #43 pending 945.21, #39 shipped 845.92, #15 shipped 826.03, #57 shipped 785.79 — is the slide. The composition is the story: three of the five biggest bookings are NOT active cycles (two trials, one mid-upgrade), which is why the deck labels the column 'booked value' and the funnel census, not MAX(total), carries the revenue truth. The distractors each break differently: sorting by status alphabetizes the table and the ladder dissolves; created_at walks booking order, which surfaces whatever booked last, not what books biggest; ASC opens on the 25.47 floor; LIMIT 1 keeps only the ceiling and loses the composition. The tie discipline rides along: two cycles sharing a total would need a named tie-breaker (total DESC, id ASC) so the deck reruns identically.",
    },
  ],

  problems: [
    { slug: "analyze-subscription-conversion", why: "Trial to paid with the never-converted arm named via LEFT JOIN: the 14 trial rows are 'not yet', not an artifact — the exact shape of the tier-conversion read Vimeo's growth pod ships weekly." },
    { slug: "plan-migration-paths", why: "LAG over a creator's cycle history to classify Basic→Plus→Pro moves — the upgrade engine IS plan-migration paths, and this problem drills the transition table behind the 30 in-flight rows." },
    { slug: "mrr-waterfall", why: "New, upgraded, churned movement decomposed in one pass — the subscription-revenue waterfall beneath every number this kit quotes, and the deck finance opens every pricing review with." },
    { slug: "net-revenue-retention", why: "Expansion (upgrades, bandwidth add-ons) versus churn rolled into NRR — the metric the monetization pod actually manages for the enterprise OTT book, cohort revenue walked with LAG." },
    { slug: "usage-tier-percentiles", why: "PERCENT_RANK banding of accounts by usage — bandwidth tiers are exactly this read: which lines sit in the top quintile of the 55-line ladder and owe overage." },
    { slug: "cohort-retention-matrix", why: "Accounts bucketed by signup month and tracked forward — the retention matrix that decides whether a tier's pricing change compounded or leaked." },
    { slug: "week-over-week-churn", why: "Churned cycles walked week over week with LAG — the pulse that fires the win-back and downgrade-offer calendars before a creator finishes cancelling." },
    { slug: "winback-recovery", why: "Churned creators who came back — the win-back window measured over timestamps, the reactivation calendar's core query for a book that is 63.5% concentrated." },
    { slug: "median-time-to-convert", why: "Trial-to-paid latency measured at the median — the honest companion to the 2.98-day plan-change average, robust to the one 84-day settlement-style outlier." },
    { slug: "dau-wau-stickiness", why: "Creator dashboard opens as a habit read — DAU over WAU is how Vimeo knows a Pro subscriber actually uses the analytics suite they upgraded for." },
    { slug: "rolling-7d-actives", why: "Rolling distinct viewer counts over a 7-day frame — embed/player traffic folded without drift, the audience half of the creator+viewer graph." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Accounts on Plus AND Pro features but not Business — the upsell-target query, conditional aggregation over the plan ladder with the C-arm excluded deliberately." },
    { slug: "group-sold-products-by-the-date", why: "The daily upload manifest folded into one string per day — GROUP_CONCAT with a named separator, the ingest health check the encoding team reads each morning." },
    { slug: "invalid-tweets", why: "Length-gated metadata validation — video titles and descriptions carry field budgets, enforced with LENGTH before anything joins; a broken title breaks the OTT feed, not just the row." },
    { slug: "fix-names-in-a-table", why: "Creator name hygiene before any join: imports arrive title-case-broken, and 'studio north' versus 'Studio North' silently splits one enterprise account into two." },
    { slug: "email-engagement-funnel", why: "The weekly product digest's open and click stages with denominators printed per step — how growth reads whether creators see the new tier features that drive upgrades." },
    { slug: "queries-quality-and-percentage", why: "Plan-change quality as a ratio with the denominator printed beside it — the same division discipline the 2.98-day clock's population statement runs on." },
    { slug: "ar-aging-schedule", why: "Billing statements age into buckets by days outstanding — the aging spine the dunning calendar hangs on, reading the same 15,217 never-collected register." },
    { slug: "second-highest-salary", why: "Rung two of the upgrade ladder — the 17-cycle account behind the 24 — is exactly the N-th-place window read, and tie policy rides along." },
    { slug: "count-salary-categories", why: "CASE-banded counts with exhaustive, ordered arms — the plan-band census drill; a hole in the arms is a hole in the forecast." },
    { slug: "average-selling-price", why: "Per-unit rate folds with weighted denominators — the arithmetic behind the 31.01 versus 115.85 band averages every pricing review quotes." },
    { slug: "top-earners", why: "Chart cut with LIMIT and a tie at the boundary — on a db where four accounts tie at 4 cycles, the tie conversation IS the test." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Dormant-surface anti-join from the account side — signed up, never booked a cycle; the whitespace read with the confident-zero proof attached." },
    { slug: "sellers-with-no-sales", why: "The dormant-surface shape from the catalog side — plan SKUs that never drew a usage line, the inventory-hygiene query billing runs quarterly." },
    { slug: "students-and-examinations", why: "Accounts beside their cycles with both grains counted — the census-prep drill behind every 45-from-8 versus 19-from-2 read." },
    { slug: "game-play-analysis-iv", why: "First event per account anchors every cohort this kit builds — the trial-start read via MIN over a partition, NULLs named not laundered." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders immediate versus scheduled — a conditional rate over a timestamp, the stamp-rate drill's sibling shape." },
    { slug: "movie-rating", why: "Joins across events with newest-first ordering — the recency walk behind latest-cycle and latest-stamp reads on the billing spine." },
    { slug: "confirmation-rate", why: "COALESCE turns missing review data into an explicit rate instead of a silent NULL — the denominator-honesty drill the funnel census runs on." },
    { slug: "capital-gain-loss", why: "Ordered in/out algebra over movement rows — the same math plan migrations use: units upgraded in, cycles churned out, one net number." },
    { slug: "product-sales-analysis-i", why: "Per-SKU units and revenue beside each other at line grain — the add-on read that shows bandwidth economics before any fold." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor — which accounts carry at least N cycles — the group-level gate behind every targeting list in this kit." },
  ],
};
