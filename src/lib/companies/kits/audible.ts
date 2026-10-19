// Audible — Wave-10 (Task 100-audible), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Subscription-audio SQL: the storefront db read as a credit-bank economy — customers are
// members (region = market buckets), orders are membership/billing cycles (delivered = active
// paid month 52, shipped = plan-change in flight with shipped_at as the plan-change stamp 30,
// pending = trial 14, cancelled = churned 7), order_items are credit/redemption line records
// (quantity = credits pulled, unit_price = the per-title a-la-carte line price), products are
// plan SKUs + catalog titles (category = catalog family; Audio is the audiobook crown at
// 11,744.01), suppliers are publisher/studio partners, invoices are membership statements,
// payments are payment rails (card 16/37,364.00 vs wire 11/32,248.00), expenses are platform
// opex, ledger_entries are the GL. Finance tables store INTEGER cents — the dollar read is
// amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars. Angle kept
// DISTINCT from the media siblings (duolingo's session streaks, substack's publishing
// cadence, medium's metered paywall, vimeo's plan ladder): credit-bank economics — the
// rollover entitlement, listening-depth cohorts, catalog churn and title-acquisition ROI on
// the publisher bench. Pool provenance: company-pools.md carries NO Audible section (0
// tagged rows) — all 10 topic slug sets and all 16 problems are theme-curated from the pools
// file's theme menu (sql rows only, no w*/d*/f* rows); 46 distinct slugs (30 topic + 16
// problem, zero topic/problem overlap), grep-verified present as pools rows. Case briefs
// quote probed figures from scripts/company-facts.md (incl. the wave-8+9 canonical-cells
// section) or probe-verified against a readonly copy of db/custom.db; every case slot is
// mechanically verified by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const audibleKit: CompanyKit = {
  id: "audible",
  domainId: "media",
  name: "Audible",
  tagline: "Credit-bank economics: rollover credits, listening depth, catalog churn",
  accent: "text-amber-300",

  brief: [
    "**Audible** is subscription audio: members pay a monthly fee, the fee mints an entitlement of credits, and credits convert into audiobooks — a library members feel they own rather than rent. Every growth number in the building is a conditional count over the same small object set. This kit maps the storefront db onto that world: the 16 customers rows are members, the 103 orders are membership/billing cycles worth **34,833.28**, and the 251 order_items rows are credit/redemption lines — quantity = credits pulled, unit_price = the per-title a-la-carte price. The status map is fixed: delivered = {emerald:active paid month} (52, 50.5%), shipped = {sky:plan-change in flight} (30, 29.1%), pending = trial (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org runs three pods on the same spine. Growth reads the trial-to-paid funnel and the listening-depth cohorts — 251 redemption lines across 103 cycles is **2.44 lines per cycle**, 498 titles pulled. Monetization owns the credit economics: a plan-change cycle stamps shipped_at the day the new plan goes live, and **82 of 103 cycles** carry the stamp — a **2.98-day** plan-to-live average with a 2–4 day spread, while the 14 trials have none yet (a population definition, not a cleanup job). Catalog owns the shelf: the Plus catalog (the always-included budget band) versus the a-la-carte premium titles, and the publisher bench that supplies both. Money sits one layer down: statements and settlement legs in INTEGER cents, where the dollar read is `amount_cents / 100.0` — and concentration is the third story: **63.5%** of the book sits with members whose lifetime spend crosses 3,000 (71.2% above 2,000).",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain member census** — EU runs 45 cycles from just 8 members (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a trial cycle count in your base?'*), then into the listening leaderboard where four members sit tied at 4 cycles and rank semantics become a business decision. Late rounds walk the {sky:14-month cycle spine} (2024-01 to 2025-02) with `LAG` deltas — the **1,193.86** July trough, the +1,158.21 jump into August — and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Audible section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: credit-funnel censuses, two-grain member reads, tie-heavy listening leaderboards, plan-band CASE logic and the cents-safe statement spine. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {rose:credit-float register} the billing pod opens Monday with, the other rebuilds the {violet:premium a-la-carte bench} acquisitions reads before every title buy, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "The third pod is platform ops, and its db read is the expense-and-ledger spine: **36 expense rows worth 25,416** — Rent runs 14 lines at 16,800, more than Ads (4,570), Travel (2,521) and Tools (1,525) combined — while `ledger_entries` folds to a hard close gate of **181,080 debits against 181,080 credits**, cash netting 44,196 and accounts receivable 16,440. The rails story lives one table over: card carries 16 settlement legs for 37,364.00 against wire's 11 legs for 32,248.00, and five statements settle on BOTH rails — the split-settlement pattern a self-join surfaces before any close. *Ops reads this db like a P&L with row-level receipts*, and every dollar figure is still `amount_cents / 100.0`.",
    "Late-round screens go deeper than the census: window frames (`ROWS` versus the default `RANGE`, three-month trailing averages over the cycle spine), percentile tiles that band listening depth into equal tiers, `GROUP_CONCAT` shelf lists folded per member, and staging-table dedupe where keep-latest ROW_NUMBER logic decides which plan row is truth. The prep path mirrors it: run the four case studies on the live db — the two-grain market census, the redemption leaderboard, the {violet:plus-shelf band split} and the Q4 month walk — then rehearse the performance and data-quality answers out loud. *The bar never moves: definition, denominator, then SQL* — every senior loop here ends with 'what population is this number over?', and the candidate who answers before typing wins the room.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the cycle-funnel refresh. A growth analyst opens the membership dashboard before standup: did overnight cycles land, did any plan-change get its `shipped_at` stamp without a plan owner, does the one-pass status census reconcile — 52 active + 30 in flight + 14 trials + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the depth read: redemption lines per cycle against the **2.44** norm, and the churn map by market — if plan-to-live latency drifts off the 2.98-day average, the plan-migration queue gets pulled before the morning revenue read ships.",
    "**11:30 —** Midday is the member read. The catalog pod wants the shelf re-cut — Plus-catalog volume against the a-la-carte premium titles, publisher by publisher; the growth lead wants the listening leaderboard with the four-way tie at 4 cycles handled honestly (shared rungs, named policy, the **24/17/14/13/5** ladder above); a regional VP wants cycles per member beside member counts ({sky:EU 45-from-8} versus {rose:US 19-from-2}). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the catalog-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The statement anti-join refreshes first — **6 never-settled statements worth 15,217** — before a single dunning email goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the collections draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**18:30 —** The EOD writeup closes the loop. The analyst drafts tomorrow's catalog buy memo — the redemption leaderboard with its rungs (Desk Mat's **47 units** on top, the two-way tie at 36, the three-way tie at 30), the plus-shelf band split (**268 units @ 31.01** against 230 @ 115.85) and the Q4 walk with its **-1,326.87** November drop — then pins the definition under every number so the morning debate starts from shared denominators. *If the ledger still ties and the census still reconciles to 103, the notebook closes clean.* Last click: queue the staging-dedupe audit against tomorrow's member import, because that feed is exactly where the NULL `customer_id` bugs breed.",
  ],

  metrics: [
    { name: "Active-month rate", what: "Delivered ÷ ALL cycles booked: 52 of 103 (50.5%). The headline the growth pod reads every Monday — 'did the member get their paid month' is a status-filtered conditional count, and the denominator is the whole interview." },
    { name: "Plan-change stamp rate", what: "Cycles with shipped_at stamped ÷ all cycles: 82 of 103 (79.6%). The stamp lands when the new plan goes live; the 14 trials are 'not yet', never a silent zero." },
    { name: "Plan-to-live latency", what: "Plan-change booking to go-live (created_at → shipped_at) over stamped cycles only: 2.98-day average, range 2–4. The population definition ships with the number — trials have no plan change to time." },
    { name: "Churn share", what: "Cancelled share of booked cycles: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn cohort map that drives the winback and pause-offer calendars." },
    { name: "Cycle book", what: "Total cycle value booked: 34,833.28 across 103 cycles, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the plan-tier story — budget Plus months at one end, a 1,088.44 flagship cycle at the other." },
    { name: "Listening depth", what: "Redemption lines ÷ cycles: 251 order_items across 103 cycles = 2.44 lines per cycle, 498 titles pulled, max 3 credits on a single line. Depth shows up here first — a heavier listening month is more lines, not more cycles." },
    { name: "Member concentration", what: "Share of the book from members spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The cycle-count ladder runs 24 / 17 / 14 / 13 / 5 with a four-way tie at 4 — one lost power-listener moves a quarter." },
    { name: "Statement coverage", what: "Booked versus settled: 21 exact settlements (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00. The finance anti-join billing refreshes every close, on card 16 / 37,364.00 versus wire 11 / 32,248.00 rails." },
    { name: "Market intensity", what: "Cycles per member by market: EU 45 from 8 (5.6), APAC 37 from 5 (7.4), US 19 from 2 (9.5), LATAM 2 from 1 (2.0). The broadening-versus-concentrating dial — two columns from one GROUP BY, and the ratio is the line the board deck opens with." },
    { name: "Audio crown share", what: "Audio's grip on the catalog book: 11,744.01 of 34,833.28 line revenue (33.7%), with 46 of 103 cycles touching an Audio title. When this share slips, the a-la-carte acquisition conversation starts — the crown funds the bench." },
    { name: "Publisher concentration", what: "Revenue share by publisher: Nordic 32%, Midwest 26.7%, Alpine 13.7% — the top three carry 72.4% of the catalog book. One partner negotiation moves a third of the shelf, which is why acquisitions reads this cut before every title buy." },
    { name: "Settlement clock", what: "Days from statement issue to first settlement leg over the statement book: 28.4 average, 13 fastest, 84 slowest, with 22 statements carrying legs. The dunning cadence is tuned to this clock — a statement aging past 30 days hits the collections queue." },
  ],

  topics: [
    {
      name: "Trial-to-paid funnel counts",
      why: "Every Audible growth screen opens with the funnel: cycles booked, plans live (shipped_at stamped), active paid months. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a plan-change in flight 'active' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i", "most-frequently-ordered-product-per-customer", "ar-aging-schedule", "first-last-touch-attribution"],
    },
    {
      name: "Two-grain member censuses",
      why: "Cycles and members are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is listening volume and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining members to cycles",
      why: "Members carry region and created_at; cycles inherit them through joins, and the join type decides who survives. A cycle without a member is corruption; a member without cycles is a dormant subscription — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employee-bonus"],
    },
    {
      name: "Listening leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four members sit at 4 cycles each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about power listeners, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "rolling-7d-actives", "feature-adoption-windows"],
    },
    {
      name: "Plan banding with CASE",
      why: "Plan tiers are CASE-classified — premium, standard, trial offer — with fixed edges the pricing page publishes, and the a-la-carte shelf reads the same way at the title level. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the entitlement forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "winback-recovery", "trial-balance-check", "credit-utilization-bands", "gl-reconciliation"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month cycle spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "week-over-week-churn", "growth-accounting", "null-blank-audit", "mrr-waterfall"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — active under churned, this quarter beside last — and EXCEPT answers 'which booked cycles never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Nested folds & cohort gates",
      why: "Screens escalate into staging: fold per-member cycle counts, then judge them against a computed platform mean (6.44 here — exactly four members clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "median-time-to-convert", "cohort-retention-matrix"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets active, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "find-churn-risk-customers"],
    },
    {
      name: "Statement rails & cents discipline",
      why: "Active is not collected — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Window frames & running math",
      why: "Cumulative credit-bank value and trailing listening averages are frame questions: the default RANGE frame pulls tie rows into the running sum, ROWS walks strictly row by row, and a three-month trailing average needs an explicit frame on the month spine. Audible's trend decks are full of running math, and the frame is where the numbers quietly lie.",
      slugs: ["find-cumulative-salary-of-an-employee", "rolling-average-steps", "running-total-for-different-genders", "dau-wau-stickiness", "amount-anomaly-zscore"],
    },
    {
      name: "Grand-total stacks & rollups",
      why: "Board packets want the detail rows AND the total in one grid, and SQLite has no GROUPING SETS — the house pattern is UNION ALL with a literal 'TOTAL' label row. The trap is column alignment: every branch must project the same shape or the stack tears, and a silent UNION would eat legitimate repeated rows.",
      slugs: ["count-salary-categories", "league-statistics", "count-apples-and-oranges"],
    },
    {
      name: "Ratio gates & share math",
      why: "Churn share by market (8.1% APAC down to 0 LATAM) and premium-shelf share of revenue are ratio reads: 100.0 before the division, ROUND after, and the rate gate itself lives in HAVING because the denominator only exists post-fold. Screens love asking why the rate column can't be referenced in WHERE.",
      slugs: ["percentage-of-users-attended-a-contest", "ads-performance", "hopper-company-queries-ii", "deferred-revenue", "ab-test-conversion-lift", "roas-by-campaign", "ltv-cac-payback"],
    },
    {
      name: "Percentile bands & tiles",
      why: "Listening-depth tiers are percentile cuts: NTILE buckets members into equal tiers, PERCENT_RANK locates a member's depth against the 2.44-lines-per-cycle norm, and the tile edges are where the offer tiers get drawn. The interview question is always who lands on a boundary — and what the tie policy there is.",
      slugs: ["top-percentile-fraud", "rfm-segmentation", "station-median", "usage-tier-percentiles", "basket-depth-aov", "delinquency-buckets"],
    },
    {
      name: "Duplicate detection & dedupe",
      why: "Staging imports breed double-charged members and re-imported cycles; the screens test GROUP BY/HAVING COUNT(*) > 1 census shapes and keep-latest ROW_NUMBER dedupe that decides which row is truth. Audible's billing pod runs this drill every close before the credit-float register is trusted.",
      slugs: ["duplicate-emails", "keep-latest-dedupe", "find-latest-salaries", "net-revenue-retention", "duplicate-charge-pairs", "customers-who-bought-all-products", "find-loyal-customers"],
    },
  ],

  theory: [
    {
      id: "audible-t1",
      q: "Your member report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins cycles to members: a cycle with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from members: the members with no cycles ARE the answer (a subscribed-but-silent account), arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the dormant list vanished. The fix is moving the predicate into ON or an outer query. The same discipline guards the settlement side: statements LEFT JOINed to their payment legs keep the six never-settled rows alive, and any cycle column filter in WHERE would erase exactly the rows the credit-float register exists to show. On this db the member anti-join returns a confident zero — all 16 members appear in the cycle table somewhere — and proving that zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "audible-t2",
      q: "Four members tie at 4 cycles on the listening leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which power listener's cohort gets the retention offer. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer members (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. Leaderboards feed winback budgets here, so an arbitrary split is not a style flaw; it is money allocated by accident.",
      tag: "windows",
    },
    {
      id: "audible-t3",
      q: "The census shows 103 cycles and 16 members; EU shows 45 cycles and 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per cycle, so a member with 24 cycles contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 cycles collapse to 8 accounts. Neither is wrong: cycles measure listening load and billing momentum, members measure installed base and coverage. The ratio — 5.6 cycles per member in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for redemption lines and COUNT(*) silently counts credit lines, not cycles — 251 of them, carrying 498 pulled titles. Saying 'one row per what?' for every COUNT is the habit the panel grades, because listening depth (2.44 lines per cycle) is exactly the metric this company manages, and it lives one grain below the cycle.",
      tag: "aggregation",
    },
    {
      id: "audible-t4",
      q: "shipped_at is NULL until a plan change goes live. What is your policy for the plan-to-live report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only plan-changes that went live have a latency, so the report measures booking-to-go-live for the 82 of 103 cycles that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day plan changes for trials that have not converted. A report whose WHERE clause is doing definitional work without saying so is exactly what an Audible reviewer hunts for: the credit bank's entitlement math depends on knowing which cycles were actually live, and a diluted average quietly re-prices the whole plan ladder.",
      tag: "nulls",
    },
    {
      id: "audible-t5",
      q: "The growth review wants active-month value per market for markets carrying at least ten cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to cycles versus to dollars. The strong answer places every filter by asking: is this a fact about one cycle, or about a market? On this db the ten-cycle floor keeps only the power markets, and the status filter decides whether the number underneath is the 52 active months or the whole 103-cycle book — two different decks wearing one query.",
      tag: "pipeline",
    },
    {
      id: "audible-t6",
      q: "Acquisitions wants publishers that carry at least one a-la-carte title priced 100-plus. Why is EXISTS the right shape, and what happens when the inner query comes back empty?",
      a: "EXISTS asks a per-row question — 'does THIS publisher hold any qualifying title' — and stops at the first match, which is exactly the acquisition gate: the premium shelf is an any-titles property, not a fold. The correlation (pp.supplier_id = s.id) is the whole query: drop it and every publisher qualifies against the global shelf. On this db the gate keeps Nordic (199.99 and 129 on the shelf), Midwest (149.99) and Alpine (119), and excludes Andes, Shenzhen and Pacific, whose catalogs top out below 100. The scalar-subquery cousin behaves differently: it is contractually 0-or-1 rows, and zero rows return NULL — not an error — so price > (SELECT …) with an empty inner silently returns nothing while looking valid. That is the empty-inner-query bug, and the panel fishes for you to state it unprompted. EXISTS with an empty inner simply returns false — a row excluded, a report intact. Choosing between them is a statement about which failure mode your report can afford.",
      tag: "subqueries",
    },
    {
      id: "audible-t7",
      q: "The cycle trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and billing-period edges are exactly when cycle bookings land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The deltas tell the story on this book: the spine opens at 3,731.97, slides to the 1,193.86 July trough, jumps +1,158.21 into August, and drops -1,326.87 into November. Date discipline is growth discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "audible-t8",
      q: "Finance says a membership statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settled leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and settlement legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact (65,612.00) / 1 partial (4,000.00 of 6,148.00) / 6 never-settled (15,217.00), and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "audible-t9",
      q: "Your running-sum chart of cycle value jumps two cycles at once whenever bookings share a timestamp. Explain the window frame semantics, how you'd fix the chart — and when the tie behavior is actually what you want.",
      a: "With ORDER BY in the OVER, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats peers as one unit: rows tied on the ordering value all enter the running sum together, which is exactly the two-cycle jump. The fix is naming the frame — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly one row at a time, so each cycle's value lands on its own line. But RANGE is not a bug: on a daily or monthly fold there are no ties by construction, and when you WANT tied rows to share a boundary — a per-day cumulative that must reflect the whole day — RANGE is the honest frame. The same choice governs moving averages: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW gives a strict three-month trailing average over the cycle spine, while the RANGE twin would average over distinct month values, silently re-weighting months that share an edge. State the frame out loud in every window query you ship here; the credit-bank trend deck is built on these sums, and a frame you didn't choose is a number you can't defend.",
      tag: "windows",
    },
    {
      id: "audible-t10",
      q: "The ops board wants active, in-flight, trial and churned counts — plus churn share — all in one scan. Compare FILTER (WHERE …) with SUM(CASE …) and tell me which you'd ship and why.",
      a: "Both are one-pass conditional aggregates: COUNT(*) FILTER (WHERE status = 'delivered') and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) read the same 52, 30, 14, 7 census that reconciles to 103 by construction, and on SQLite they produce identical query plans — this is readability, not performance. FILTER wins on intent: the predicate sits next to the aggregate it governs, so a reviewer can verify each branch against the status map without tracing a CASE's ELSE arm. SUM(CASE) wins on portability — it runs on any engine, and it generalizes to non-count branches (SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END) for churned value). My ship rule here: FILTER for pure censuses that stay on SQLite, SUM(CASE) the moment a branch computes anything but a count — and either way the four branches must plus to 103 or the census is wrong, which is the real gate, not the syntax.",
      tag: "aggregation",
    },
    {
      id: "audible-t11",
      q: "'Which booked cycles never went live?' — give me three SQL shapes that answer it and defend the one you'd ship in review.",
      a: "Shape one: EXCEPT — SELECT id FROM orders EXCEPT SELECT id FROM orders WHERE shipped_at IS NOT NULL — set algebra that returns booked-minus-live whole rows. Shape two: NOT EXISTS (SELECT 1 FROM stamped s WHERE s.id = o.id), a per-row predicate that short-circuits at the first match. Shape three: LEFT JOIN plus WHERE s.id IS NULL, the zero-fill anti-join that keeps the unmatched rows in view. They agree here — 21 rows, the 30 in-flight plus 14 trials against the 82 stamped — but their failure modes differ. NOT IN is the one I ban: one NULL in the inner list poisons every comparison and the report silently empties. EXCEPT is elegant but dedups, which hides a duplicate-key corruption you wanted to see. I ship NOT EXISTS — it states the question in the same words the stakeholder used, survives NULLs by design, and the correlation makes the intent reviewable. The LEFT JOIN shape earns its keep when the ask grows a count of matched legs beside each survivor.",
      tag: "sets",
    },
    {
      id: "audible-t12",
      q: "The close packet wants every statement row AND a grand-total line in one grid. How do you build that in SQLite, and what goes wrong when a branch drifts?",
      a: "SQLite has no GROUPING SETS or ROLLUP, so the house pattern is a UNION ALL stack: the detail branch projects statement id, status, amount; the total branch selects 'TOTAL' as the id literal and SUM(amount) over the whole book, with the same column names and types in both arms. UNION ALL, never UNION — the detail rows here are unique, but if the day comes when two branches legitimately emit identical rows, a bare UNION would dedup one of them silently and the packet would lose money with no error. The drift failure is shape mismatch: one arm rounds to 2 decimals while the other ships raw cents, or the label column lands second instead of first, and the stack tears into misaligned columns that still print. Guard it by keeping the two SELECTs column-for-column identical and by asserting the total row equals the fold of the details — 86,977.00 against 86,977.00 — before the packet ships.",
      tag: "sets",
    },
    {
      id: "audible-t13",
      q: "A junior's member report takes seconds per page: a correlated subquery re-runs for every member row. Walk me through why that happens and your rewrite instincts.",
      a: "A correlated subquery references the outer row — 'this member's cycle count versus the platform mean of 6.44' — so the engine conceptually executes it once per outer row: 16 members, 16 scans, and the pattern that was fine on a laptop demo dies at production scale. The rewrites, in the order I reach for them: fold and join — GROUP BY customer_id in a derived table, then join it back, so the fold happens once; window it — AVG(COUNT(*)) OVER () computes the mean beside every row without a second pass; or flip the shape to EXISTS when the subquery is an existence test, since it short-circuits at the first match. Correlation is not automatically a crime: on a small outer set with an indexed inner key it's the clearest expression of the question, and clearing the gate 'does THIS publisher hold a 100-plus title' is naturally a correlated EXISTS. The instinct I grade is that the candidate notices the per-row cost before the profiler does — and can say which rewrite preserves the empty-inner-query semantics they're relying on.",
      tag: "subqueries",
    },
    {
      id: "audible-t14",
      q: "When do you stage a read in a WITH clause instead of a derived table, and what's the risk of a chain of five CTEs?",
      a: "WITH earns its keep when the read has named business stages: fold the cycles per member, then judge them against the mean, then rank — three CTEs named member_cycles, depth_bench, ranked_ladder read like the memo they implement, and each stage is independently testable by selecting from it alone. A derived table does the same work in one statement but nests readability: two levels are fine, three and the indentation becomes the documentation. The five-CTE risk is twofold. First, materialization: depending on the engine and version, CTEs may be evaluated once into a temp structure — fine — or re-expanded per reference, which turns a 'clean' pipeline into repeated scans; SQLite historically inlines, so the chain is a readability construct, not a performance one. Second, drift: each stage's assumptions (the status filter, the denominator) hide one level down, and a reviewer who edits stage three without rereading stage one ships a wrong census with a clean-looking diff. My rule: CTEs for stages a stakeholder could name, comments on every stage's population, and the final SELECT says what the whole pipeline claims.",
      tag: "subqueries",
    },
    {
      id: "audible-t15",
      q: "Plan-to-live latency: why JULIANDAY for the difference and not STRFTIME, and how would you report the distribution, not just the 2.98-day average?",
      a: "JULIANDAY converts a timestamp to a real number of days, so the difference is arithmetic: julianday(shipped_at) - julianday(created_at) yields 2.0 to 4.0 on this book, average 2.98 over the 82 stamped cycles. STRFTIME returns TEXT — substraction of '%Y-%m-%d' strings coerces through a path you don't want to defend, and even '%d' differences break across month edges. The distribution matters because the average hides the shape: with a 2-to-4-day range the meaningful report is a small histogram — cycles per latency day via GROUP BY the julianday delta, or CAST(... AS INTEGER) buckets — plus min and max beside the mean, and the population printed in the title: stamped cycles only, 82 of 103, trials excluded because a trial has no plan change to time. One more discipline: compute latency from the same pair of columns every time (created_at to shipped_at), because the day someone substitutes order date the 2.98 becomes unreproducible and the plan-migration SLA conversation starts from zero.",
      tag: "dates",
    },
    {
      id: "audible-t16",
      q: "A conversion-rate column errored out for one cohort. What happened, and what's your guard pattern?",
      a: "Almost certainly a divide-by-zero: the cohort's denominator folded to zero — a first-cycle month with zero second-cycle conversions — and the rate expression blew up while every other cohort printed. The guard is NULLIF: NULLIF(denominator, 0) turns the zero into NULL, the division returns NULL instead of erroring, and NULL is the honest value — 'no denominator, no rate' — unlike a displayed 0.0%, which claims conversions were measured and came out flat. The full pattern: 100.0 * conversions / NULLIF(base, 0), wrapped in COALESCE(..., '-') only at the presentation layer if the deck needs a glyph — never bake the display substitution into the metric, because a downstream average over '-' becomes a type error and an average over 0 becomes a lie. The review question I'd add: is the zero-cohort itself correct, or is it a missing-rows bug? A rate that's NULL for the right reason is a finding; the same NULL from an empty fold nobody checked is an incident.",
      tag: "nulls",
    },
    {
      id: "audible-t17",
      q: "The catalog memo wants one row per member with their redeemed titles folded into a readable list. How do you build it, and what are the sharp edges?",
      a: "GROUP_CONCAT(title) with GROUP BY customer_id folds each member's redemption lines into one comma-joined cell — 16 rows out of 251 lines. The sharp edges, in the order they bite: order is not guaranteed by default — SQLite concatenates in scan order unless the build supports GROUP_CONCAT(expr ORDER BY …), so a list that shuffles between runs needs the rows pre-ordered in a staged subquery or the ordered form explicitly; the separator defaults to a comma but titles contain commas, so pass a safe one ('; ') explicitly; length limits exist in some engines for very long folds — a power member with 24 cycles and dozens of lines can overflow what a dashboard cell renders; and the fold destroys the grain, so any count beside it must be COUNT(DISTINCT product_id) or it silently counts lines instead of titles. My ship rule: GROUP_CONCAT for human memos, never for machine reads — the moment a downstream query needs to split that string back apart, the design has failed and the right shape is one row per line again.",
      tag: "strings",
    },
    {
      id: "audible-t18",
      q: "The board wants 'markets where churn share beats 5%'. Why does the rate have to be rebuilt in HAVING, and why can't you reference the SELECT alias?",
      a: "Pipeline order: WHERE filters rows before GROUP BY exists, HAVING filters groups after the fold — and churn share (7 of 103 overall, 8.1% APAC down to 0 LATAM) is a property of the folded group, not of any row, so the comparison can only live in HAVING. The alias fails for the same reason: SELECT computes after HAVING in the logical pipeline, so churn_share doesn't exist yet when groups are judged — you rebuild the full expression, 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) > 5. SQLite is famously lenient and will often resolve an alias in HAVING, but writing the portable form is the habit that survives the engine change and, more importantly, forces you to write the denominator explicitly — which is the sentence the interviewer actually wants to hear. One rounding note: gate on the unrounded rate. ROUND to 1 decimal for display, but a market at 5.04% fails a '> 5' gate on the true value and passes it on the rounded one — pick the semantics before the presentation.",
      tag: "pipeline",
    },
    {
      id: "audible-t19",
      q: "This db is tiny — why would I still care about your indexes and sargability? Show me the instincts on a query from our own screens.",
      a: "Because habits ship with you, and the storefront db is where they form. Take the two-grain census: it joins orders to customers on customer_id, so the join keys want indexes — orders(customer_id) turns a scan-per-market into a lookup, and customers(id) already has one as the primary key. Sargability is the subtler trap: WHERE STRFTIME('%Y-%m', created_at) = '2024-10' wraps the column in a function, which defeats any index on created_at because the predicate must be evaluated per row — the sargable form is a half-open range, created_at >= '2024-10-01' AND created_at < '2024-11-01', which the index can seek. Same numbers, different plan. SELECT * drags every column through the pipe when the memo needs three; EXPLAIN QUERY PLAN is free and says 'SCAN' versus 'SEARCH' out loud. On 103 rows all of this is invisible; on the production member-event stream it is the difference between a dashboard that refreshes and one that times out — and the interviewer is watching whether you'd carry the discipline either way.",
      tag: "performance",
    },
    {
      id: "audible-t20",
      q: "Staging loaded 106 cycles against a core count of 103. Find the duplicates and pick the survivors — walk me through both queries.",
      a: "Query one is the census: GROUP BY the natural key — the member, booking timestamp, total tuple that should be unique per cycle — with HAVING COUNT(*) > 1, plus COUNT(*) to show multiplicity; that prints the suspect groups, 3 extras hiding among them. Query two picks survivors: ROW_NUMBER() OVER (PARTITION BY member_id, booking_key ORDER BY updated_at DESC) AS rn staged in a CTE, then keep WHERE rn = 1 — latest-loaded row wins, because the freshest load timestamp is the one the pipeline vouched for. The judgment calls are the interview: which column defines 'latest truth' (an updated_at beats a created_at that duplicates identically across re-loads), what to do with near-duplicates that differ in total (those aren't dupes, they're corrections — different queue), and the hard rule that the delete ships with the census query in the same PR so a reviewer sees 106 against 103 before a single row leaves. On the core db this returns clean — which is the point: the drill exists so the staging layer never gets to corrupt the credit-float register.",
      tag: "quality",
    },
    {
      id: "audible-t21",
      q: "Define listening-depth cohorts and compute their month-over-month retention on this db — denominators included.",
      a: "A listening-depth cohort groups members by their first paid-cycle month: January's cohort is the members whose earliest delivered or shipped cycle books in 2024-01, and depth is their redemption lines per cycle against the platform norm of 2.44. Retention then reads: cohort members with at least one cycle in month N+1 divided by the cohort's alive base at month N — COUNT(DISTINCT customer_id) in both numerator and denominator, at the member grain, not the cycle grain, or a heavy listener counts as three retentions. The denominators are the whole answer: trials (14 pending cycles) never enter a paid cohort base because they haven't converted; churned members stay in the base of the month they churned in and drop out after, which is what makes the curve fall; and the alive base shrinks month over month, so a flat retention percentage still means recovered absolute members. On this db the cohorts are small — 16 members over a 14-month spine — so the honest presentation is the matrix plus a caveat about sample size, not a trend line the deck interpolates.",
      tag: "kpi",
    },
    {
      id: "audible-t22",
      q: "Acquisitions wants the top-redeemed title per catalog family, all families in one report. How does PARTITION BY change the rank you already know?",
      a: "The global leaderboard ranks every title against the whole shelf — 47 units at rung 1 overall. PARTITION BY category restarts the race inside each family: RANK() OVER (PARTITION BY category ORDER BY SUM(oi.quantity) DESC) hands Audio its own rung 1 (the Noise-Canceling Headset at 46), Accessories its own (Desk Mat Extended at 47), and so on for all seven families — six titles can each claim a rung 1 in the same report. The trap is the boundary between the two frames: the per-family winner is not necessarily the global leader, so a WHERE rank = 1 filter returns seven rows, not one, and tying families return two rows each — ties share the rung exactly as the global policy says, but now per partition, and the memo has to say which policy it invoked. The classic completion is the join-back: stage the ranked fold in a CTE and keep rank <= 1 for the winners, or rank <= 3 for the shelf-shortlist shape. PARTITION BY is how one query serves both the board (global ladder) and acquisitions (family winners) without two pipelines drifting apart.",
      tag: "windows",
    },
    {
      id: "audible-t23",
      q: "Pricing wants members bucketed into four listening-depth tiers of equal headcount. Which function, and where do the edges bite?",
      a: "NTILE(4) OVER (ORDER BY depth) — it divides the ordered rows into four tiles of near-equal count, so 16 members cut into 4/4/4/4 cleanly, and depth itself is the per-member fold (redemption lines per cycle) staged in a CTE first. The edges bite exactly where ties live: NTILE counts rows, not values, so when two members share a depth at a tile boundary the tie is split by whatever row order the engine chose — one lands tier 2, the other tier 3, and a pricing rule keyed to tiers just treated two identical listeners differently. The defenses, in order: a total ORDER BY — depth, then member_id — so the assignment is at least deterministic and reproducible; PERCENT_RANK instead when the ask is 'where does this member sit' rather than 'which tile', because it returns a continuous position and lets the tie share a percentile; and a policy note on the tile edges themselves, because four tiers of equal headcount on a book where the ladder runs 24, 17, 14, 13, 5 and then a four-way tie at 4 means the top tile is carrying a disproportionate share of listening — headcount-equal is not value-equal, and the deck should say which one it priced.",
      tag: "windows",
    },
    {
      id: "audible-t24",
      q: "A market filter matches zero rows. What does each aggregate print — and what do you owe the reader of the dashboard?",
      a: "Without GROUP BY, aggregates always return exactly one row: COUNT prints 0 — the empty-set identity for counts — while SUM, AVG, MIN and MAX print NULL, because there is no value to aggregate. With GROUP BY, the empty set returns zero rows: the market vanishes from the report entirely rather than showing as a zero. Both behaviors leak into dashboards unless you decide the policy: charts want 0 (a flat line is a truth — 'no cycles booked'), tables often want the row present with 0.00, and 'no data' versus 'measured zero' is a distinction the credit-float register already encodes — COALESCE(SUM(p.amount_cents), 0) turns the six never-settled statements into a countable 0.00 float instead of NULL-shaped holes. What I never do is coalesce blindly everywhere: a NULL average means 'no population', and rendering it as 0 days fabricates a measurement. The owe-the-reader summary: say which cells are true zeros, which are zero-filled for display, and which are NULL because nothing was there — three different cells that print identically after a careless COALESCE.",
      tag: "nulls",
    },
  ],

  mcqs: [
    {
      id: "audible-mcq-1",
      prompt: "A membership cycle's status reads 'delivered'. In this kit's Audible stage map, what happened?",
      choices: ["Active paid month — the member got what they paid for", "Plan-change in flight — new plan live, not yet at month end", "Churned — cancelled mid-cycle", "Trial awaiting first paid month"],
      answer: 0,
      why: "The stage map is fixed: delivered = active paid month (52 of 103 cycles, 50.5%). It is the only status where the member actually received the paid entitlement.",
      notes: [
        { choice: 1, why: "Plan-change in flight is 'shipped' — 30 cycles live on a new plan but not at month end. Calling them active inflates the kept rate before a single billing month closes." },
        { choice: 3, why: "Trial is 'pending' — 14 cycles with no shipped_at stamp yet. A trial is not churn and not active; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-2",
      prompt: "Plan-change stamp rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 stamped, 14 trials and 7 churned of 103 booked.",
      choices: ["Stamped + churned only (82/89 = 92.1%)", "All cycles booked (82/103 = 79.6%)", "Delivered cycles only (52/82)", "Distinct members (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL cycles booked — trials stay in the denominator because 'not yet live' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 trials inflates the rate to 92.1% by deleting the population still in flight — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is month completion, shipped_at is the plan-change stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-3",
      prompt: "EU carries 45 cycles from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 cycles per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is cycles AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-4",
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
      id: "audible-mcq-5",
      prompt: "Keep only members carrying at least 10 cycles. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY member HAVING COUNT(*) >= 10", "WHERE cycles >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the power tier — 24, 17, 14 and 13 cycles — clears a 10-cycle bar per member.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'cycles' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-6",
      prompt: "The listening ladder runs 24, 17, 14, 13, 5 cycles, then FOUR members tied at 4. Under RANK, what rank do the two 3-cycle members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-cycle members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The trial cycles double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 cycles.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-8",
      prompt: "A staging-table dormancy list uses member_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every cycle carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "audible-mcq-9",
      prompt: "A board stack puts plan-change cycles under churned cycles in one layout, built with UNION. A reviewer says one member's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same member, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same member, same counts, no status or branch label — collapse into one, and the board loses a member with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "audible-mcq-10",
      prompt: "A dashboard walks booked cycle value cycle by cycle: SUM(total) OVER (ORDER BY booked_at). Two cycles share a booked_at second, and the cumulative 'jumps two cycles at once'. What is happening?",
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
      id: "audible-mcq-11",
      prompt: "SUBSTR(created_at, 1, 7) = 2024-01 returns ZERO rows on the 14-month cycle spine. Why?",
      choices: [
        "SUBSTR cannot return a year-month; only STRFTIME('%Y-%m', …) can",
        "2024-01 unquoted folds to 2024 − 01 = 2023 — a number, and text never equals a number in SQLite, so the comparison must be = '2024-01'",
        "The month spine starts in February 2024",
        "SUBSTR needs a third argument to return the month",
      ],
      answer: 1,
      why: "'2024-01' is text; the bare literal computes 2024 − 01 = 2023, and a text column never equals a numeric — the quoted comparison '2024-01' returns all 14 buckets correctly. STRFTIME returns text the same way; quoting is the fix either way.",
      notes: [
        { choice: 0, why: "SUBSTR works fine — the bug is the bare literal, and quoting repairs it. STRFTIME is a style twin, not a repair." },
        { choice: 3, why: "The third argument is optional — SUBSTR(x, 1, 7) already carves 'YYYY-MM'. The failure is type, not arity." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-12",
      prompt: "COUNT(*) reads 103 on the cycle table. What does COUNT(shipped_at) read, and what is the gap?",
      choices: [
        "103 — COUNT(*) and COUNT(col) are identical on any table",
        "82 — COUNT(col) skips NULLs, so the 14 trials and 7 churned cycles without stamps drop out",
        "89 — only the churned cycles drop",
        "0 — COUNT ignores any column containing NULLs",
      ],
      answer: 1,
      why: "COUNT(column) counts non-NULL values only: 82 stamped cycles, a 21-row gap from the 14 trials plus 7 churned. That gap is exactly the stamp-rate denominator conversation — 82 of 103, 79.6% — and why the census pairs the two counts.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rows; COUNT(col) counts values. On a fully-populated column they agree — shipped_at is precisely the column where they cannot." },
        { choice: 2, why: "Trials drop too — 14 pending cycles carry no stamp. 103 − 14 − 7 = 82, and each drop has its own business meaning." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-13",
      prompt: "A plan-band CASE reads: WHEN price >= 50 THEN 'standard', WHEN price >= 100 THEN 'a_la_carte', ELSE 'budget'. What lands in a_la_carte?",
      choices: [
        "Every title priced 100 or more",
        "Nothing — the first arm swallows them all",
        "Only titles priced exactly 100",
        "Titles priced between 50 and 100",
      ],
      answer: 1,
      why: "CASE arms evaluate in order and first match wins: a 199.99 title clears >= 50 first and bands standard, so the >= 100 arm is dead code and the premium band silently vanished into standard. Arms must run most-specific first: >= 100, then >= 50, then ELSE.",
      notes: [
        { choice: 0, why: "That is the intended read, not the written one — arm order IS the semantics, and the shelf re-bands itself the moment the WHENs swap." },
        { choice: 3, why: "The 50-to-99.99 titles band standard here; the >= 100 arm never fires at all. Reordering the arms re-bands the whole shelf in one edit." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-14",
      prompt: "A month-walk report prints each month's delta on the WRONG line — February's change shows on January's row. Which LAG/LEAD mixup is the classic cause?",
      choices: [
        "LEAD was used where LAG belongs — LAG parks the prior value on the current row so current − LAG lands on the month that moved; LEAD reads forward",
        "LAG requires a PARTITION BY to work across months",
        "The delta must be computed with a self-join, not a window function",
        "LEAD and LAG are interchangeable aliases",
      ],
      answer: 0,
      why: "LAG(SUM(total)) OVER (ORDER BY month) puts the previous month's value on the current row, so 1,648.80 − 2,975.67 = -1,326.87 prints on November's line. Computing with LEAD shifts every movement one row up and puts NULL on the last row instead of the first.",
      notes: [
        { choice: 1, why: "PARTITION BY is for per-group walks — the month spine is one partition. It does nothing for a direction bug." },
        { choice: 3, why: "They are directional opposites: LAG reads the previous row, LEAD the next. Which row carries the NULL tells you which one ran." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-15",
      prompt: "'Booked cycles EXCEPT live cycles' returns 21 rows; 'live cycles EXCEPT booked cycles' returns 0. What does the asymmetry tell the reviewer?",
      choices: [
        "EXCEPT is buggy on small sets — both sides must match",
        "EXCEPT is directional: left-only rows. 21 booked-but-not-live rows exist (in-flight + trial + churned), and zero live rows lack a booking — which is the referential sanity the check exists for",
        "The two queries must return the same row count for the stack to be valid",
        "EXCEPT deduplicates, so one side is missing rows",
      ],
      answer: 1,
      why: "EXCEPT keeps rows in the left query that never appear in the right. Booked-minus-live = 21 is the not-yet-live population; live-minus-booked = 0 proves every live cycle has a booking. The asymmetry IS the finding, not a defect.",
      notes: [
        { choice: 2, why: "They measure different populations by design — expecting symmetry misreads the operator." },
        { choice: 3, why: "EXCEPT dedups whole rows within each side; that is a separate hygiene question. State the key columns so dedup can never hide a duplicate-key bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-16",
      prompt: "SELECT region, churn_share FROM markets WHERE churn_share > 5 fails. Why?",
      choices: [
        "WHERE cannot see SELECT aliases — the rate must be rebuilt in HAVING or repeated as a full expression",
        "churn_share is a reserved word in SQLite",
        "GROUP BY is required before any WHERE clause",
        "WHERE cannot compare decimal values",
      ],
      answer: 0,
      why: "WHERE runs before SELECT in the logical pipeline: the alias does not exist yet when rows are filtered. Rebuild the rate inside HAVING (groups exist there) or repeat the full expression — the failure is evaluation order, not naming.",
      notes: [
        { choice: 1, why: "SQLite accepts the identifier happily — the error is about the unknown column at filter time, not the spelling." },
        { choice: 3, why: "Decimal comparison is fine in WHERE — price >= 100 ships daily on the shelf queries. The alias is the problem." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-17",
      prompt: "A revenue report joins orders to order_items and the book grows from 34,833.28 to well over 80,000. Diagnosis?",
      choices: [
        "The join fanned cycles out to credit lines — one cycle with 3 lines multiplies its total by 3; fold one side first or SUM strictly at the line grain (quantity * unit_price)",
        "ROUND accumulated rounding error across the join",
        "The status filter dropped delivered cycles",
        "SUM ignores duplicate rows automatically",
      ],
      answer: 0,
      why: "orders → order_items is one-to-many: 103 cycles fan out to 251 lines, so SUM(o.total) counts a 3-line cycle three times. Aggregate the many-side separately or fold strictly at the line grain — mixing grains in one SUM is the classic double-count.",
      notes: [
        { choice: 2, why: "A row filter shrinks numbers; this is multiplication. The 2.44 lines-per-cycle norm is exactly the inflation factor." },
        { choice: 3, why: "SUM adds every surviving row, duplicates included — fan-out IS duplicate cycle rows from the fold's point of view." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-18",
      prompt: "A self-join surfaces statement pairs settled on the same day, but the output lists both (1,5) and (5,1). The fix?",
      choices: [
        "Add DISTINCT to the SELECT",
        "Canonicalize the pair — ON a.id < b.id keeps exactly one orientation per pair",
        "GROUP BY both id columns",
        "Use UNION instead of the self-join",
      ],
      answer: 1,
      why: "An equality self-join meets every pair twice, once in each orientation, and (1,5) ≠ (5,1) as rows. The a.id < b.id predicate canonicalizes to one row per pair — the same discipline that surfaces the five split-settlement statements on this book without doubling them.",
      notes: [
        { choice: 0, why: "DISTINCT does nothing — the two orientations are different rows, so both survive the dedup." },
        { choice: 2, why: "GROUP BY a.id, b.id still keeps both orientations as separate groups. Grouping is not orientation dedup." },
      ],
      difficulty: "hard",
    },
    {
      id: "audible-mcq-19",
      prompt: "The listening leaderboard prints tied members in a different order on every run. What is missing?",
      choices: [
        "A deterministic tiebreaker — ORDER BY cycles DESC, member_id as the second key",
        "RANK instead of ROW_NUMBER",
        "A PARTITION BY on region",
        "DISTINCT on the member column",
      ],
      answer: 0,
      why: "Tied sort keys leave row order to the engine. A secondary key makes the ladder reproducible — and on a tie-heavy board like the four-way at 4 cycles, it is the difference between a stable report and a coin flip the stakeholder screenshots.",
      notes: [
        { choice: 1, why: "RANK changes rung labels, not row order among ties — the shuffle survives either function." },
        { choice: 2, why: "PARTITION BY restarts ranks per region; it does not order rows inside a tie." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-20",
      prompt: "price > (SELECT AVG(price) FROM products) works, but price = (SELECT price FROM products WHERE category = 'Audio') errors. Why?",
      choices: [
        "AVG is not allowed inside subqueries",
        "The bare comparison needs a scalar — exactly one row, one value. AVG guarantees one row; the Audio filter returns 3 titles and the comparison is undefined. IN (or MAX) restores a defined read",
        "Equality cannot be used with subqueries",
        "The outer query needs GROUP BY first",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows: Audio's 3 titles (199.99, 149.99, 119) raise the classic 'more than one row returned by a subquery' error. IN handles many, and AVG/MAX fold many to one — shape, not operator, is the contract.",
      notes: [
        { choice: 2, why: "Equality with a scalar-shaped subquery is legal and common — the row count is what broke it." },
        { choice: 3, why: "GROUP BY does not shrink a subquery's row count; the filter does. And the empty-inner case is worth stating: a scalar subquery over zero rows returns NULL, and the comparison silently returns nothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-21",
      prompt: "NTILE(4) over 16 members' listening depth yields 4/4/4/4 — but two members tied at the tile-3 edge land in different tiers. What happened?",
      choices: [
        "NTILE is nondeterministic and needs a database patch",
        "NTILE assigns tiles by row position after ORDER BY — tied depth values do not co-locate unless the ORDER BY is total, so the tile boundary can fall inside a tie",
        "NTILE(4) requires DISTINCT depth values",
        "The tie means the query must switch to GROUP BY",
      ],
      answer: 1,
      why: "NTILE counts rows, not values: with a non-total ORDER BY, tied rows sit in arbitrary relative order and the boundary can split them. Add a deterministic tiebreaker (depth, then member_id) — or accept and document the edge — before tiers become offer tiers.",
      notes: [
        { choice: 0, why: "It is deterministic given the input order — what is unspecified is the order among ties. Same trap, different layer." },
        { choice: 2, why: "DISTINCT depth values would collapse the member grain — one row per depth is a different report entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "audible-mcq-22",
      prompt: "A rank column reads 1, 2, 3, 1, 2, 3 down the report instead of 1 through 6. Which clause is responsible?",
      choices: [
        "ORDER BY is missing from the window",
        "PARTITION BY — the window is splitting rows into per-group partitions and restarting the rank inside each",
        "GROUP BY is missing",
        "DISTINCT collapsed duplicate ranks",
      ],
      answer: 1,
      why: "RANK() OVER (PARTITION BY market ORDER BY cycles) restarts at 1 in every partition — correct for per-market leaderboards, wrong when a global ladder was intended. The clause is doing per-group work the caller did not ask for.",
      notes: [
        { choice: 0, why: "ORDER BY is present — the ranks are not random, they restart. The PARTITION is the restart." },
        { choice: 2, why: "GROUP BY would collapse rows entirely; here every row survives, so the restart comes from the window's PARTITION clause." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-23",
      prompt: "GROUP_CONCAT(title) per member returns a list whose order changes between runs. The fix?",
      choices: [
        "GROUP_CONCAT has no guaranteed order — pre-order the rows in a staged subquery/CTE and fold there, or use the ORDER BY form where the build supports it",
        "Wrap the expression in UPPER to stabilize it",
        "Add DISTINCT to the aggregate",
        "Cast the result to TEXT",
      ],
      answer: 0,
      why: "SQLite concatenates in scan order unless the version supports GROUP_CONCAT(expr ORDER BY …). The stable pattern stages rows ordered inside a CTE (or uses the ordered form), then folds — a shelf list that shuffles is not a memo, it is a bug report generator.",
      notes: [
        { choice: 1, why: "UPPER changes the case, not the sequence — the underlying scan order still rules the fold." },
        { choice: 2, why: "DISTINCT dedups values but fixes no order; the scan still decides which survivor leads the list." },
      ],
      difficulty: "hard",
    },
    {
      id: "audible-mcq-24",
      prompt: "'Top five titles' via ORDER BY units DESC LIMIT 5 lands on two titles tied at the cut — one is dropped arbitrarily. The honest fix?",
      choices: [
        "Raise LIMIT to 6",
        "Rank with RANK()/DENSE_RANK() and keep every title inside the value cut — ties share the rung and both appear",
        "Sort ASC instead",
        "Replace LIMIT with MAX",
      ],
      answer: 1,
      why: "LIMIT cuts by row count, not by value: a tie at the boundary drops a peer silently. Rank, then filter on the rank (or the tied value), makes the boundary a stated policy — exactly how the title leaderboard's rung-8 three-way tie should be handled.",
      notes: [
        { choice: 0, why: "LIMIT 6 works only until the next tie appears — the fix is value-based, not count-based." },
        { choice: 2, why: "ASC returns the bottom of the ladder, and the tie problem remains untouched." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-25",
      prompt: "SELECT '5' + 3 prints 8 on this SQLite build. What does that imply for the status column in arithmetic?",
      choices: [
        "Text coerces to number — 'delivered' + 1 silently becomes 1, so accidental arithmetic on text columns prints plausible garbage instead of erroring",
        "SQLite errors on text-plus-number",
        "Only quoted numeric strings coerce",
        "The plus sign concatenates text",
      ],
      answer: 0,
      why: "SQLite coerces by affinity: numeric-looking text becomes a number, non-numeric text becomes 0. That is why SUM(status) on the cycle table returns 0.0 instead of an error — a census that runs can still be wrong, which is why type checks precede fold checks.",
      notes: [
        { choice: 1, why: "No error anywhere — that is precisely the danger. The permissive typing is a feature you design around defensively." },
        { choice: 3, why: "|| concatenates; + coerces and adds. '5' || 3 prints '53', '5' + 3 prints 8 — knowing which is which saves a memo." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-26",
      prompt: "A market filter matches zero cycles. What does SELECT region, SUM(total) FROM … WHERE region = 'ANTARCTICA' print — no GROUP BY?",
      choices: [
        "Nothing — zero rows",
        "One row: ANTARCTICA, NULL",
        "One row: ANTARCTICA, 0",
        "An error — SUM over an empty set is undefined",
      ],
      answer: 1,
      why: "Ungrouped aggregates always return one row, and SUM's empty-set identity is NULL, not 0. Only COUNT returns 0 — which is exactly why the census column and the value column disagree on empty filters, and why the zero-fill (COALESCE(SUM(...), 0)) is a deliberate display decision.",
      notes: [
        { choice: 0, why: "Zero rows is the GROUP BY answer — ungrouped aggregates print exactly one row even over nothing." },
        { choice: 2, why: "SUM returns NULL on empty; only COUNT returns 0. The dashboard that shows 0.00 got it from a COALESCE someone wrote on purpose." },
      ],
      difficulty: "easy",
    },
    {
      id: "audible-mcq-27",
      prompt: "COUNT(DISTINCT customer_id || '-' || product_id) returns 245 distinct member-title pairs — but two pairs share a member id ending in 1 and a product id starting with 2. The bug?",
      choices: [
        "Separator collision — '11' || '-' || '23' and '1' || '-' || '123' both build '11-23'; use a separator that cannot appear in the ids, or GROUP BY both columns and COUNT",
        "COUNT DISTINCT cannot take an expression",
        "The dash is a reserved character in SQLite expressions",
        "The true count must be 251",
      ],
      answer: 0,
      why: "Concatenated keys collide whenever one id's tail plus separator equals another's head. A separator like '|' that never appears in ids — or a GROUP BY customer_id, product_id with COUNT(*) — restores the true pair census that fan-out audits depend on.",
      notes: [
        { choice: 1, why: "COUNT(DISTINCT expr) is legal SQLite — the failure is key construction, not the function." },
        { choice: 3, why: "251 is line rows, not distinct pairs — the target depends on the grain being audited, which is exactly why the collision matters." },
      ],
      difficulty: "hard",
    },
    {
      id: "audible-mcq-28",
      prompt: "SUM(oi.quantity * p.price) prints NULL for one catalog family while the others print. First suspicion?",
      choices: [
        "One row's factor is NULL — NULL propagates through arithmetic, so quantity * price goes NULL and SUM silently skips that line",
        "SUM caps at the column width",
        "The family has too many rows",
        "p.price needs an explicit CAST",
      ],
      answer: 0,
      why: "NULL is contagious in arithmetic: any NULL quantity or price turns the whole expression NULL and SUM drops the row. If the NULLs are legitimate absences, COALESCE the factor deliberately; if not, they are a data-quality finding, not a formatting fix.",
      notes: [
        { choice: 1, why: "SUM has no width cap — the empty-looking cell is the NULL skip, and one skipped line can shift a family's whole read." },
        { choice: 3, why: "CAST converts types but NULL passes through every cast unchanged — the fix is COALESCE or upstream repair, not casting." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-29",
      prompt: "created_at BETWEEN '2024-01-01' AND '2024-03-31' runs and looks right. What is the exposure?",
      choices: [
        "Text timestamps cannot be compared with BETWEEN",
        "The closed upper bound drops everything after midnight on March 31 — the half-open >= '2024-01-01' AND < '2024-04-01' keeps the last night's cycles",
        "BETWEEN needs DATE() wrappers to work on text",
        "It double-counts rows at both boundaries",
      ],
      answer: 1,
      why: "ISO-8601 text sorts chronologically, which is why the comparison works at all — and why the closed AND boundary silently amputates '2024-03-31 14:00:00'. Billing-period edges are exactly when cycle bookings land, so quarter windows ship half-open.",
      notes: [
        { choice: 0, why: "They compare fine — ISO text ordering is the very property the trap hides behind." },
        { choice: 3, why: "BETWEEN under-counts, never double-counts — it amputates the upper edge. The fix widens to < next period start." },
      ],
      difficulty: "medium",
    },
    {
      id: "audible-mcq-30",
      prompt: "COUNT(CASE WHEN status = 'cancelled' THEN 1 END) versus SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) — when do they DIFFER?",
      choices: [
        "Never — they are identical on any input",
        "They agree here (both read 7 of 103), but they diverge when the THEN branch can emit NULL — a THEN column reference makes COUNT skip and SUM add; know which behavior the census needs before writing the ELSE",
        "SUM always reads exactly 1 higher",
        "COUNT ignores the CASE entirely and counts all rows",
      ],
      answer: 1,
      why: "With THEN 1 both print 7 cancelled cycles. The semantics differ at the edges: COUNT(expr) counts non-NULL results wherever they come from; SUM adds the values. A THEN arm that references a nullable column makes COUNT skip the NULL rows and SUM add them — two different censuses wearing one shape.",
      notes: [
        { choice: 0, why: "Identical on this literal shape, yes — but the equivalence silently depends on the THEN arm never being NULL, which is exactly the assumption that breaks a report later." },
        { choice: 2, why: "Neither is uniformly higher — on this census both print 7. The difference appears only with NULL-bearing THEN arms." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-audible-1",
      tier: "easy",
      topic: "t2",
      universe: "refund-audit",
      title: "The credit-float register",
      brief:
        "Audible-flavored brief on the storefront db: billing opens Monday with the credit-float register — every membership statement beside the settlement legs actually booked under it, with never-settled statements zero-filled to 0.00 so the float is countable, not NULL-shaped. Probed facts: the statement book is 28 statements worth 86,977.00; 21 settle exactly (65,612.00), one is partial (#25: 4,000.00 of 6,148.00), and six carry 15,217.00 with zero legs — 24/4,937.00, 26/3,562.00, 27/2,794.00, 21/1,295.00, 18/873.00 open, plus #28 at 1,756.00 which CLAIMS paid while holding no settlement rows at all. The register reads float-on-top, biggest claim first within ties.",
      ask: "Return every membership statement with its claim status, statement value and settled-to-date dollars to 2 decimals, never-settled float on top and biggest claim first within ties.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS claim,\n       ROUND(i.amount_cents / 100.0, 2) AS statement_value,\n       ROUND(COALESCE(SUM(p.amount_cents), {1}) / 100.0, 2) AS settled_to_date\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nGROUP BY i.id\nORDER BY settled_to_date {3}, statement_value {4};",
      slots: [
        {
          answer: "0",
          kind: "number",
          label: "the zero-fill fallback",
          why: "COALESCE(SUM(p.amount_cents), 0) turns the six never-settled groups from NULL into 0.00 — a countable float. A nonzero fallback pads the float with fake money, and leaving the COALESCE out leaves NULLs the register cannot sum or sort against.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join column",
          why: "Legs attach to statements through p.invoice_id = i.id. Re-keying to p.id matches a payment's own id against invoice ids and scatters settlements across the wrong accounts; i.customer_id matches legs to members — both fold a clean register into fiction.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the float-on-top direction",
          why: "ASC puts the six 0.00-settled statements first — the dunning block billing acts on. DESC buries the float under 21 fully-settled rows and the collections meeting opens on money that needs nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-claim-first tiebreak",
          why: "Within the zero block the register reads 4,937.00 down to 873.00 — biggest exposure first. ASC would open the review on the smallest open balance and let the 4,937.00 age another day.",
        },
      ],
      distractors: ["100", "100.0", "p.id", "i.customer_id", "NULL", "1"],
      walkthrough:
        "One LEFT JOIN, one fold, one zero-fill. The join hangs each statement's settlement legs off p.invoice_id = i.id; GROUP BY i.id folds them; COALESCE(SUM(p.amount_cents), 0) prints 0.00 for the six statements with no legs at all, and the cents divider 100.0 renders both columns in honest dollars. The top block is the dunning list, verbatim: 24/4,937.00, 26/3,562.00, 27/2,794.00, then #28 — 1,756.00 claimed 'paid' with zero legs, the status that lies — then 21/1,295.00 and 18/873.00: six rows, 15,217.00 of float. Below the float sit the mirrors: #11 void-but-settled at 925.00, #25 partial at 4,000.00 of 6,148.00, and the 21 exact settlements. The distractors fail honestly: 100 or 100.0 in the fallback slot pads every never-settled statement to a fake 100.00; p.id or i.customer_id in the join slot re-keys the leg match and scatters settlements; NULL as the fallback leaves the float NULL-shaped — unsortable, unsumable; 1 in the join slot matches only invoice 1's legs and zeroes 27 statements of real history; numbers in either ORDER BY slot are syntax errors. The register's rule: the settled column is the ledger of record, the claim column is a claim.",
    },
    {
      id: "cs-audible-2",
      tier: "medium",
      topic: "q3",
      universe: "inventory",
      title: "The premium a-la-carte bench",
      brief:
        "Audible-flavored brief on the storefront db: the catalog pod and acquisitions co-own the a-la-carte shelf, and before every title buy they read the publisher bench — which publisher partners hold at least one premium title priced 100 or more, folded with the redemption lines those catalogs earned. Probed facts: the shelf holds 4 premium titles (199.99, 149.99, 129, 119); the bench reads Nordic Gadgets AB — EU, 3 titles, 82 units, 11,130.25; Midwest Hardware Co — US, 3 titles, 109 units, 9,294.93; Alpine Audio GmbH — EU, 2 titles, 77 units, 4,765.63 — a 25,190.81 foot, 72.3% of the 34,833.28 line-revenue book. Andes (4.0), Shenzhen (4.1) and Pacific (3.9) sit below the premium line; the trusted bench at 4.5-plus is Nordic and Alpine only — Midwest clears the shelf at 4.4. Read biggest revenue first.",
      ask: "Return each publisher carrying at least one title priced 100 or more, with its distinct title count, redeemed units and a-la-carte revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS publisher,\n       s.region AS region,\n       COUNT({1} p.id) AS titles,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS a_la_carte_revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nLEFT JOIN order_items oi ON oi.product_id = p.id\nWHERE EXISTS (SELECT 1 FROM products pp\n              WHERE pp.supplier_id = s.{4} AND pp.price >= {2})\nGROUP BY s.id\nORDER BY a_la_carte_revenue {3};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the title deduplicator",
          why: "COUNT(DISTINCT p.id) counts titles once even though the order_items join fans each title out to one row per redemption line. Bare COUNT(p.id) counts redemption lines, not titles — the fold reads 3/3/2 only under DISTINCT.",
        },
        {
          answer: "100",
          kind: "number",
          noVerify: true,
          label: "the premium shelf line",
          why: "The premium a-la-carte line is a published price edge — 100-plus is where the shelf starts on this book (199.99, 149.99, 129, 119 qualify; the next title down is 89.99). Threshold constants never appear in the result cells, so they are flagged noVerify by convention.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue-first direction",
          why: "The bench reads Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63 — biggest book first. ASC would open the review on the smallest partner and read the concentration story backwards.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the EXISTS correlation column",
          why: "The subquery asks about THIS publisher: pp.supplier_id = s.id. Dropping the correlation to s.name or s.region compares a numeric id to text, matches nothing, and empties the bench — the gate dies quietly while the query still runs.",
        },
      ],
      distractors: ["SUM", "MAX", "50", "150", "ASC", "region"],
      walkthrough:
        "The gate is an any-titles property, so the shape is a correlated EXISTS: for each publisher, does any catalog title clear the 100 line? On this book exactly four titles do — 199.99 and 129 (both Nordic), 149.99 (Midwest), 119 (Alpine) — so the bench is three publishers, and the correlation pp.supplier_id = s.id is what keeps each publisher judged on its own shelf. The fold underneath is a fan-out story: titles join to redemption lines, so COUNT(DISTINCT p.id) is required for titles (3 / 3 / 2) while SUM(oi.quantity) reads redeemed units (82 / 109 / 77 — Midwest pulls the most credits despite the smaller book) and ROUND(SUM(quantity * unit_price), 2) reads revenue (11,130.25 / 9,294.93 / 4,765.63), footing to 25,190.81 — 72.3% of the 34,833.28 book. The exclusions are the narrative: Andes, Shenzhen and Pacific hold zero 100-plus titles, and Shenzhen's whole catalog tops out at 39.99. The distractors fail honestly: SUM or MAX inside COUNT is a syntax error; 50 widens the bench to five publishers by dragging in a sub-premium catalog; 150 narrows it to Nordic alone; ASC reads the bench upside-down; region in the correlation column compares ids to text and empties the bench entirely. The read acquisitions takes away: premium shelf, not rating, is what separates the bench — Midwest clears at 4.4 while the 4.5-plus trusted pair stays Alpine and Nordic.",
    },
    {
      id: "cs-audible-3",
      tier: "easy",
      topic: "j7",
      universe: "growth",
      title: "The two-grain market census",
      brief:
        "Growth memo, Monday board prep: the deck opens on the market grid — cycles, members and value per market in one fold — and the VP wants both grains on every row: listening load beside installed base. Probed facts: EU runs 45 cycles from 8 members worth 15,089.23 (avg 335.32); APAC 37 from 5 worth 11,605.45 (313.66); US 19 from 2 worth 7,286.16 (383.48); LATAM 2 from 1 worth 852.44 (426.22). The book foots to 34,833.28 across all 103 cycles. Intensity — cycles per member — is the derived read the memo leads with: US 9.5 against EU 5.6. Sort biggest value first.",
      ask: "Return each market's cycle count, distinct member count, total cycle value and average cycle value to 2 decimals, biggest value first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS cycles,\n       COUNT(DISTINCT o.customer_id) AS members,\n       ROUND(SUM({1}), 2) AS cycle_value,\n       ROUND(AVG(o.total), {2}) AS avg_cycle\nFROM orders o\nJOIN customers c ON c.{3} = o.customer_id\nGROUP BY c.region\nORDER BY cycle_value {4};",
      slots: [
        {
          answer: "o.total",
          kind: "keyword",
          label: "the value fold column",
          why: "SUM(o.total) folds cycle value per market — EU's 45 cycles into 15,089.23. A text column like o.status folds to 0.00, and any line-grain column drags the read off the cycle grain the memo mandates.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the average display precision",
          why: "ROUND(AVG(o.total), 2) prints the 335.32 / 313.66 / 383.48 / 426.22 ladder exactly as the memo quotes it. A display constant never appears in the result cells, so the slot ships noVerify by convention.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key",
          why: "Cycles inherit their market through c.id = o.customer_id. Re-keying to c.name compares text to a numeric id, matches nothing, and the census empties while the query still runs — the quietest way to lose a board deck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first direction",
          why: "DESC lands EU (15,089.23) on top and LATAM (852.44) at the foot. ASC opens the board on the smallest market and reads the concentration story backwards.",
        },
      ],
      distractors: ["o.status", "1", "name", "ASC", "oi.quantity"],
      walkthrough:
        "Two grains, one fold. The join is c.id = o.customer_id; GROUP BY c.region folds 103 cycles into four markets; COUNT(*) reads cycles (45 / 37 / 19 / 2) while COUNT(DISTINCT o.customer_id) folds repeats back to members (8 / 5 / 2 / 1) — the gap between the columns is the intensity headline, US 9.5 cycles per member against EU 5.6. ROUND(SUM(o.total), 2) prints 15,089.23 / 11,605.45 / 7,286.16 / 852.44, footing to the 34,833.28 book, and ROUND(AVG(o.total), 2) prints 335.32 / 313.66 / 383.48 / 426.22. The distractors fail honestly: o.status in the fold slot sums text to 0.00 and scrambles the row order; 1 demotes the average to one decimal (335.3) so the cells stop matching the memo; name in the join slot compares text to a numeric id and empties the grid; ASC flips the read smallest-first; oi.quantity references a table the query never joined and errors outright. Board rule: every census row carries both grains, and the number the deck quotes is the one whose denominator was said out loud.",
    },
    {
      id: "cs-audible-4",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The redemption leaderboard rungs",
      brief:
        "Catalog memo, title-buy prep: the redemption leaderboard — every catalog title ranked by credits pulled — decides which shelf slots get renewed and which bench titles get acquired. Probed facts: Desk Mat Extended leads at 47 units, Noise-Canceling Headset 46, HDMI 2.1 Cable 2m 38; then a two-way tie at 36 (Laptop Stand Aluminum, Wireless Mouse M3), 33, 31, and a three-way tie at 30 (Fitness Band X2, Ring Light 14\", Studio Desktop Mic); the tail ties again at 21 three ways. The published rung policy is RANK: shared rungs on ties, gaps after. The memo reads the top ten titles only, biggest first.",
      ask: "Return the top ten titles by redeemed units with their unit counts and rank rungs, biggest first, ties sharing a rung with gaps after.",
      template:
        "SELECT p.name AS title,\n       SUM(oi.quantity) AS units,\n       {1}() OVER (ORDER BY SUM(oi.quantity) DESC) AS unit_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.{2}\nGROUP BY p.{3}\nORDER BY units {4}, title ASC\nLIMIT {5};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie policy function",
          why: "RANK shares rungs and skips after: 1, 2, 3, 4, 4, 6 … The published policy names RANK; DENSE_RANK packs the rungs (4, 4, 5 — no gap) and ROW_NUMBER splits ties arbitrarily — an acquisition decision made by accident.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the line-to-title key",
          why: "Lines attach to titles through oi.product_id = p.id. Re-keying to oi.quantity joins ids to quantities and the leaderboard fills with garbage folds — 267 units attributed to a title that actually sold 21.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the title grouping column",
          why: "GROUP BY p.id folds the 251 lines to 16 title totals. p.category collapses the board to 7 family rows — a different report entirely — and the rank restarts inside each family.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC lands Desk Mat's 47 units on top of the top-ten cut. ASC serves the 21-unit tail as the memo's headline and the buy conversation starts from the wrong end of the shelf.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the top-ten cut",
          why: "LIMIT 10 caps the memo at ten rows and the boundary is clean — rank 11 sits at 28 units, so no tie straddles the cut. Row-count constants never appear in the result cells, so the slot ships noVerify by convention.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "category", "quantity", "5"],
      walkthrough:
        "One join, one fold, one window. The join keys lines to titles (oi.product_id = p.id), GROUP BY p.id folds the 251-line book into 16 title totals, and RANK() OVER (ORDER BY SUM(oi.quantity) DESC) paints the rungs the memo publishes: Desk Mat 47 at rung 1, Headset 46 at 2, HDMI 38 at 3, the two-way 36 tie sharing rung 4, then the gap to 6 (33), 7 (31), and the three-way 30 tie all on rung 8 — LIMIT 10 cuts cleanly before rank 11's 28. The distractors fail honestly: DENSE_RANK repacks the rungs (4, 4, then 5) and contradicts the published policy; ROW_NUMBER splits the 36-tie into 4-and-5 and hands one title a phantom edge; ASC inverts the board to the 21-unit tail; category collapses 16 titles into 7 family rows with HDMI's 121 units atop a different ladder; quantity re-keys the join to ids-equal-quantities and folds fiction (267 units on the USB-C hub); 5 truncates the memo to half its rows. The rung policy is a business decision — the query just has to say which one it made.",
    },
    {
      id: "cs-audible-5",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The plus-shelf band split",
      brief:
        "Pricing memo before the shelf reset: the redemption book splits into the always-included plus band and the premium a-la-carte band, and the reset needs the pulled units and average line price of each arm. Probed facts: lines priced under 55 carry 268 pulled units at a 31.01 average line price; lines at 55-plus carry 230 units at 115.85. That is 498 pulled units footing the 251-line book — 53.8% of credits move through the plus shelf. The plus arm prints first, biggest unit load on top.",
      ask: "Return the two shelf bands with their pulled units and average line price to 2 decimals, plus arm first.",
      template:
        "SELECT CASE WHEN oi.unit_price {1} 55 THEN 'plus_shelf' ELSE 'a_la_carte' END AS band,\n       SUM(oi.quantity) AS units,\n       ROUND(AVG(oi.unit_price), {2}) AS avg_line_price\nFROM order_items oi\nGROUP BY {3}\nORDER BY units {4};",
      slots: [
        {
          answer: "<",
          kind: "keyword",
          label: "the band edge operator",
          why: "The band edge is 55: unit_price < 55 is the plus shelf (268 units @ 31.01), everything else a-la-carte (230 @ 115.85). Flipping to >= labels the arms backwards — the premium band would claim the 268-unit plus book and the reset budgets the wrong shelf.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the average display precision",
          why: "ROUND(AVG(oi.unit_price), 2) prints 31.01 and 115.85 exactly as the memo quotes them. A display constant never appears in the result cells, so the slot ships noVerify by convention.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the band grouping column",
          why: "GROUP BY band folds the 251 lines into the two arms — one row per shelf. Grouping by the average price instead explodes the grid to one row per distinct value: no arms, no split, no memo.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the plus-arm-first direction",
          why: "DESC puts the 268-unit plus arm on top. ASC leads with the premium arm and the shelf-mix read starts from the smaller book — 53.8% of credits hidden below the fold.",
        },
      ],
      distractors: [">", ">=", "3", "MAX", "ASC"],
      walkthrough:
        "One CASE, one fold. The band CASE cuts at 55 — 'plus_shelf' under, 'a_la_carte' at and above — GROUP BY band folds the 251-line book into two arms, and the cells land exactly on the probed figures: plus 268 units @ 31.01, a-la-carte 230 @ 115.85, 498 units footing the book, 53.8% of credits through the plus shelf. The distractors fail honestly: >= (and >, since no line prices at exactly 55) relabels the arms — the premium band claims the 268-unit plus book; 3 in the precision slot prints 31.014, a cell the memo cannot quote; 3 in the band slot asks SQLite to group by an aggregate expression and errors; MAX as a precision argument resolves to no column and errors; ASC flips the read premium-first. Denominator note the memo carries: the split is over LINES priced per band, not members — one member can pull from both shelves in a single cycle, so the arms do not sum to member counts.",
    },
    {
      id: "cs-audible-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The Q4 cycle-spine walk",
      brief:
        "Month-close memo from the growth lead: the board walk covers the last five cycles of the book — October 2024 through February 2025 — with each month's booked value beside its movement versus the prior month. Probed facts: the spine reads 2,975.67 (2024-10), 1,648.80 (2024-11), 2,101.47 (2024-12), 1,669.50 (2025-01), 2,390.53 (2025-02). November's drop is the number the deck circles: -1,326.87, the book's steepest single-month fall; December recovers +452.67. The first row's movement is NULL by definition — there is no September inside the window to diff against. Months run oldest first, and the window must be half-open so February's late bookings stay in.",
      ask: "Return the five months' booked cycle value and month-over-month delta to 2 decimals, oldest first, first delta NULL.",
      template:
        "SELECT SUBSTR(o.created_at, 1, {1}) AS month,\n       ROUND(SUM(o.total), 2) AS cycle_value,\n       ROUND(SUM(o.total) - {2}(SUM(o.total)) OVER (ORDER BY SUBSTR(o.created_at, 1, 7)), 2) AS delta\nFROM orders o\nWHERE o.created_at >= {3}\nGROUP BY month\nORDER BY month {4};",
      slots: [
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the month-bucket length",
          why: "SUBSTR(created_at, 1, 7) carves 'YYYY-MM' buckets — seven characters. Ten would bucket by full date and the walk becomes a 28-row day spine no board reads. Format constants never appear in the cells, so the slot ships noVerify by convention.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back function",
          why: "LAG(sum) OVER (ORDER BY month) parks the prior month's value on the current row, so the delta lands on the month that moved: 1,648.80 − 2,975.67 = -1,326.87 on November's line. LEAD computes the next month's value and every delta shifts one row up.",
        },
        {
          answer: "'2024-10-01'",
          kind: "keyword",
          label: "the quoted window edge",
          why: "The window opens at the quoted literal '2024-10-01'. Unquoted, 2024-10-01 folds to 2024 − 10 − 01 = 2013, and text-vs-number comparison lets every cycle through — the walk silently widens to all 14 months instead of five.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first direction",
          why: "ASC runs the spine oldest first so each delta reads top-down and the NULL baseline sits on the first row. DESC opens on February and the story reads backwards — recovery before the drop it recovered from.",
        },
      ],
      distractors: ["LEAD", "FIRST_VALUE", "DESC", "10", "'2024-11-01'", "2024-10-01"],
      walkthrough:
        "Window math on a text spine. SUBSTR(created_at, 1, 7) carves the five 'YYYY-MM' buckets; the half-open >= '2024-10-01' window keeps February's full book; GROUP BY month folds to one row per month; and LAG(SUM(total)) OVER (ORDER BY month) parks the prior value on the current row so ROUND(sum − lag, 2) prints the movement where it happened: 2,975.67 (delta NULL), 1,648.80 (-1,326.87 — the drop the deck circles), 2,101.47 (+452.67), 1,669.50 (-431.97), 2,390.53 (+721.03). The distractors fail honestly: LEAD shifts every delta one row up and prints NULL on the last row instead of the first; FIRST_VALUE diffs every month against October and turns the walk into a distance-from-baseline chart (first delta 0.00); 10 in the bucket slot rebuilds the spine as 28 day-rows; the unquoted 2024-10-01 folds to 2013 and the text-vs-number comparison widens the walk to all 14 months; '2024-11-01' amputates October and the -1,326.87 headline vanishes; DESC reads the story backwards. And the first row's NULL is the baseline, not a bug — coalescing it to zero would fabricate a flat October.",
    },
  ],

  problems: [
    { slug: "median-time-to-convert", why: "How long a trial member sits before the first paid cycle is a monetization-planning number; median emulation over a booking-to-conversion clock is exactly this problem's shape, and the 14 pending cycles are the population it watches." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "The Plus-catalog AND a-la-carte cross-tier read: members who pulled catalog titles AND bought premium titles but never mixed both is the exact conditional-cohort census the catalog pod builds for the shelf-mix review." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Favorite-shelf attribution: the title a member redeems most is the recommendation seed; argmax over a redemption fold with tie handling is exactly this problem's shape." },
    { slug: "list-the-products-ordered-in-a-period", why: "Period catalog reads — which titles moved in a bounded billing window — are the weekly shelf report; date-bucketed conditional aggregation is the same grammar." },
    { slug: "find-churn-risk-customers", why: "Dormancy detection: members whose last cycle crossed the cold line are the churn-risk cohort the winback calendar is built from; anti-join plus date math is exactly this shape." },
    { slug: "week-over-week-churn", why: "Catalog churn is watched weekly — cancelled cycles against the prior week with LAG — and this problem is that movement read at practice scale." },
    { slug: "cohort-retention-matrix", why: "Listening-depth cohorts are read as a retention matrix: members bucketed by first-cycle month, survived months across the columns; the cohort-offset pivot is exactly this drill." },
    { slug: "growth-accounting", why: "Member-movement accounting — new, retained, reactivated, churned per month with LAG classification — is how the growth pod reconciles the 103-cycle book into its waterfall." },
    { slug: "winback-recovery", why: "The churned 7 and the pause-offer calendar live on winback windows: members who came back inside N cycles of cancelling, with the recovery rate as the read." },
    { slug: "net-revenue-retention", why: "Credit economics roll up to NRR: expansion through deeper redemption lines, contraction through churn, all over a cohort base — the metric the board actually manages." },
    { slug: "usage-tier-percentiles", why: "Listening-depth tiers are percentile cuts: PERCENT_RANK over per-member redemption depth turns the 2.44-lines-per-cycle norm into the heavy-listener bands the pricing team prices against." },
    { slug: "basket-depth-aov", why: "Depth and value in one fold — lines per cycle beside average cycle value (251 lines over 103 cycles, 338.19 average) is exactly this problem, and it is the depth read Audible ships weekly." },
    { slug: "null-blank-audit", why: "Stamp hygiene: unstamped shipped_at cells and blank claim fields are exactly the NULL/blank arms the credit-float register's zero-fill stands on — audit them before any funnel math." },
    { slug: "duplicate-charge-pairs", why: "Split-settlement hygiene: five statements on this book settle on BOTH card and wire legs, and self-join window logic is how duplicate or split legs get surfaced before the close." },
    { slug: "trial-balance-check", why: "The close ships only when the ledger ties — 181,080 debits against 181,080 credits, delta zero; conditional SUM over a GL is exactly this problem, and it is Audible's last query every month." },
    { slug: "ar-aging-schedule", why: "The float register's twin: statements bucketed by days-outstanding — the six never-settled rows worth 15,217.00 age at the top — is an aging pivot the collections pod reads every close." },
    { slug: "credit-utilization-bands", why: "Credit-bank utilization is this kit's home metric read as bands: credits pulled against credits minted per member, bucketed into light/healthy/heavy — the same classify-and-band shape, and the churn-risk tier the lifecycle pod prices against." },
    { slug: "deferred-revenue", why: "A prepaid membership month is deferred revenue until the delivered cycle closes: recognizing the 34,833.28 book cycle by cycle, with pending trials as unredeemed liability, is exactly this recognition walk at storefront scale." },
    { slug: "plan-migration-paths", why: "Plan changes stamp shipped_at — 82 of 103 cycles carry it — and the migration read (which plan moves to which, LAG over the member's cycle sequence) is exactly this transitions problem, and it prices the plan ladder." },
    { slug: "mrr-waterfall", why: "The membership book reconciles as a movement waterfall — new cycles, retained, plan-change uplift, churned — and this LAG-classification waterfall is how the growth pod turns the 103-cycle spine into the board's monthly bridge." },
    { slug: "customers-who-bought-all-products", why: "Full-family collectors: members who pulled every title in a catalog family are relational division over the redemption lines — the completeness cohort the catalog pod rewards and the recommendation engine seeds from." },
    { slug: "find-loyal-customers", why: "Consecutive-month listening streaks — members with an unbroken run of billed cycles across the 14-month spine — are gaps-and-islands over booking months, and the streak length is the retention KPI the lifecycle pod ships quarterly." },
    { slug: "rolling-7d-actives", why: "Rolling windows de-noise the listening spine: distinct members with a cycle in any trailing 7-day window is exactly this rolling-distinct drill, and it is the engagement line the growth dashboard draws under the raw daily count." },
    { slug: "dau-wau-stickiness", why: "Stickiness is the ratio of narrow to wide windows — cycles per week against cycles per month, EU 45-from-8 intensity in ratio form; this problem drills the two-window fold the listening-health report is built on." },
    { slug: "ab-test-conversion-lift", why: "The pause-offer and winback emails run as experiments: trial-to-paid lift between holdout and treatment arms is this rates problem, and the 14-trial population is exactly the base the experiment teams argue about." },
    { slug: "feature-adoption-windows", why: "New listening features roll out in waves, and the adoption read — which members touch the feature within N days of launch — is this adoption-windows shape, the same drill the product pod runs for every catalog-facing launch." },
    { slug: "first-last-touch-attribution", why: "Trial starts carry marketing touchpoints, and first/last-touch credit over the sign-up path is this FIRST_VALUE problem — the attribution frame the growth pod quotes when it defends the acquisition spend." },
    { slug: "roas-by-campaign", why: "Acquisition spend against booked cycle value per campaign is this ROAS fold, and it is the read that decides which member-acquisition channel survives the quarterly budget cut." },
    { slug: "ltv-cac-payback", why: "Member economics: lifetime cycle value (the 3,000-plus concentration band) against acquisition cost and the payback month is this unit-economics problem — the scoreboard behind every pricing-page change." },
    { slug: "amount-anomaly-zscore", why: "The 25.47-to-1,088.44 cycle spread invites outlier math: z-scores over booked cycle value flag the flagship cycles worth a manual look, and this anomaly drill is exactly how the finance pod screens the book before a close." },
    { slug: "delinquency-buckets", why: "Dunning buckets the float: the six never-settled statements (15,217.00) plus the partial (4,000.00 of 6,148.00) aged into current/30/60/60-plus bands is this DPD-bucket shape, and it drives the collections calendar." },
    { slug: "gl-reconciliation", why: "The close ends where this problem starts: ledger_entries reconciled against statements and payments until debits read 181,080 against 181,080 credits, delta zero — the general-ledger tie-out that ships every month." },
  ],
};
