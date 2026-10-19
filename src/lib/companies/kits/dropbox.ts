// Dropbox — kit 12 of the SaaS & Enterprise domain (Batch L, wave 7).
// Storage-SaaS SQL: the storefront db read as a seat-and-storage ledger —
// customers are team workspaces, orders are seat/license periods (delivered =
// active, shipped = provisioned-awaiting-first-sync, pending = awaiting
// provisioning, cancelled = deactivated), shipped_at = the provisioning
// stamp, order_items = storage-line items, products = plan SKUs (price =
// per-seat list), suppliers = storage/integration partners, regions = team
// cohorts. Invoices/payments are seat billings in INTEGER cents (/100.0).
// Angle: license utilization, storage footprints, workspace dormancy.
// Pool provenance: Dropbox carries 0 tagged LC rows in company-pools.md —
// all 77 sql slugs in this kit (45 topic + 32 problem) are theme-curated
// from the theme menu and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12, re-probed per slot against
// db/custom.db); every case slot is mechanically verified by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const dropboxKit: CompanyKit = {
  id: "dropbox",
  domainId: "saas",
  name: "Dropbox",
  tagline: "Storage SaaS: teams, seats and usage",
  accent: "text-blue-400",

  brief: [
    "**Dropbox** is storage SaaS in its purest form: seats on a sync engine, sold to teams that either fill their footprint or quietly vanish. The analytics reality is the *utilization ledger* — which workspaces are actively syncing, which are provisioned but dark, and which deactivated outright. On this storefront db the mapping is honest: 16 team workspaces generate 103 seat periods folded from 251 storage-line items, worth 34,833.28 of billed value at a 338.19 average. The status mix reads like a license funnel — 52 {emerald:active} (50.5%), 30 provisioned-sync-pending (29.1%), 14 {amber:awaiting provisioning} (13.6%), 7 {rose:deactivated} (6.8%).",
    "The data org splits three ways. Infra analytics owns provisioning: 82 of 103 periods carry a stamp, averaging **2.98 days** from order to provisioned with a 2-to-4 range — the US cohort the slowest at 3.07. Growth owns the footprint ladder: storage lines per workspace run 50, 46, 34, 30, 14, 13, 10 before a three-way tie at 8, and **63.5%** of billed value sits above the 3,000 line — the expansion cohort every board deck prices. Billing owns the seat book: 28 `invoices` against 27 `payments`, INTEGER cents throughout, with 6 never-settled bills worth 15,217 — one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it.",
    "Interview style is census-then-denominator, then the footprint join. A screen opens with a two-grain census (EU carries 45 seat periods from just 8 workspaces; the US, 19 from 2), escalates into a conditional-count utilization rate with the denominator asked out loud ('do {rose:deactivated} periods sit in your base?'), then the footprint board — where the storage-line ladder, not the period ladder, is the load metric. Follow-ups probe the month spine (2024-01 opens at 8 periods and **3,731.97** of billed value; 2024-07 floors at 1,193.86) and the cents rule on every seat bill.",
    "Preparation strategy: the pools carry **0 tagged rows for Dropbox** — every one of this kit's 46 slugs is theme-curated to known storage-SaaS screens: two-grain seat censuses, utilization ratios, footprint ladders, dormancy anti-joins and seat-billing reconciliation. Then run all six case studies on the live db: one rebuilds the storage-footprint board infra reviews on Mondays, the other rebuilds the plan-band pricing memo the catalog team prices from, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
    "Under the seat ledger sits the billing spine, and it carries one house rule every storage-SaaS close lives by: money is stored as INTEGER cents, so the dollar read is `amount_cents / 100.0` — skip the `.0` and every odd-cent bill quietly leaks its change. The objects are small enough to memorize and dirty enough to matter: 28 seat bills against 27 settlement rows, coverage split **21 exact / 1 partial / 6 never-collected** — the partial settled 4,000 of 6,148, the six silent bills carry 15,217 — with rails split card 16 payments / 37,364 against wire 11 / 32,248. Settlement runs **28.4 days** against flat 30-day terms, fastest 13, slowest 84 — *the slowest bill is 54 days past terms before anyone says the word dunning*. The anomalies are mirrors, and both reconcile: bill #28 claims {emerald:paid} with zero settlement rows behind it, {rose:void} bill #11 carries one settlement (925.00), and the ledger still ties 181,080 = 181,080.",
    "At full depth this kit runs **fifteen topics, twenty-four theory drills, thirty MCQs and six audited case studies** on the storefront db. The two originals rebuild the storage-footprint board infra reviews on Mondays and the plan-band pricing memo the catalog team prices from; the four additions walk the seat-billing month spine ({sky:LAG} deltas from the 2024-07 floor at 1,193.86), the {rose:dark-SKU} anti-join (plan SKUs with no storage lines in the trailing month), the one-pass regional utilization census (`FILTER` counts with the denominator printed in the same row) and the peak-workspace argmax board (per-workspace folds joined back to their own maxima). The 32-problem pool stays theme-curated — Dropbox carries **0 tagged rows** in the registry — and the bar to clear is unchanged: *state the grain, the denominator and the cents rule before you compute anything.*",
  ],

  dayInLife: [
    "**08:15 —** The morning starts on provisioning health. A data analyst on the infra pod opens the latency dashboard before the ops standup: did last night's provisioned cohort cross its sync threshold, does the {emerald:active} count (52 of 103) reconcile with what seat billing invoiced, and did the US cohort's latency drift again — **3.07 days** against the 2.98 platform average is the line on the slide? The first query is almost always a reconciliation — active counts versus the seat-billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:30 —** Midday is footprint surgery. The infra review wants the storage-line ladder refreshed — workspaces folded from `order_items`, gated to real footprints, ranked heaviest-first with the tie policy in the comment: 50, 46, 34, 30, then the 8-line trio sharing rank 8. A regional lead wants the two-grain census re-cut (EU: 45 periods from 8 workspaces — intensity 5.6); a capacity planner wants units and billed value side by side, because 'the workspace is busy' means nothing until lines price into value. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**16:00 —** The afternoon tilts toward the seat book and the writeup that keeps tomorrow's numbers defensible. Billing close walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected worth 15,217 — and asks the only question that matters at close: *do the classes sum back to the invoice base?* The anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the {rose:void} bill with one (#11, 925.00) — and the ledger tie prints 181,080 = 181,080. The rhythm to internalize: Dropbox SQL exists to prove that seats, storage and billing agree — *the sync event and the seat invoice are the same story told at two grains.*",
    "**20:45 —** Month-end close nights belong to the seat book. The analyst runs the AR anti-join first — **6 never-settled bills worth 15,217**, one of them claiming {emerald:paid} with nothing behind it — then the coverage split: 21 exact, 1 partial at 4,000 of 6,148, and the open balance dunning chases tomorrow morning, never tonight. Settlement speed gets its read too: 20 paid bills averaging **28.4 days** against flat 30-day terms, fastest 13, slowest 84 — *the slowest bill is 54 days past terms, and the account team hears it before the customer does*. The night ends the way every close here ends: the ledger trial balance printing 181,080 against 181,080, delta zero — or the morning starts with an incident.",
  ],

  metrics: [
    { name: "Seat utilization rate", what: "Active ÷ ALL seat periods: 52 of 103 (50.5%). The denominator is the interview — 52 of 89 engaged periods is a different metric with a different name." },
    { name: "Storage-footprint ladder", what: "Storage lines per workspace: 50, 46, 34, 30, 14, 13, 10, then three workspaces tied at 8. Load is lines, not periods — the ladder infra staffs against." },
    { name: "Two-grain team census", what: "Periods AND workspaces per cohort — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Load versus audience in one query." },
    { name: "Provisioning latency", what: "Days from order to provisioning stamp: 82 of 103 periods stamped, avg 2.98, range 2-to-4 — US cohort slowest at 3.07, EU 2.94, APAC 2.93." },
    { name: "Expansion concentration", what: "Share of billed value from the heaviest workspaces: 63.5% above the 3,000 line, 71.2% above 2,000. Where seat-expansion revenue actually lives." },
    { name: "Usage calendar", what: "Monthly spine over seat periods: 2024-01 opens at 8 periods and 3,731.97 of billed value; 2024-07 floors at 1,193.86. The seasonality read every capacity plan borrows." },
    { name: "Unsettled seat AR", what: "Seat bills with no payment rows: 6 worth 15,217 — one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the dunning cycle runs on." },
    { name: "Seat settlement speed", what: "Days from issue to first payment on settled bills: 20 settle in 28.4 days on average, fastest 13, slowest 84 — against uniform 30-day terms." },
    { name: "Payment-rails mix", what: "Card versus wire on the settled seat book: 16 card payments worth 37,364 against 11 wires worth 32,248 — per-settlement averages run 2,335.25 and 2,931.64, so wire carries fewer, larger bills. The enterprise-cohort tell on the rails split." },
    { name: "Coverage classes", what: "Every seat bill classified by its settlement rows: 21 exact, 1 partial (4,000 of 6,148 settled), 6 with no rows at all. The class split IS the dunning queue — and the internal audit that the classes sum back to the 28-bill base." },
    { name: "Regional deactivation share", what: "Cancelled share of seat periods per cohort: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 on just 2 periods. The n travels with every rate — a zero on a 2-period base is absence of evidence, not a winning streak." },
    { name: "Attach depth", what: "Storage lines per seat period: 251 lines across 103 periods, 2.4 to 1. Expansion shows up here before it shows up in seats — the cross-sell read that sits under every footprint board." },
  ],

  topics: [
    {
      name: "Seat-census grains",
      why: "Every Dropbox screen opens with a fold: storage lines, seat periods, workspaces — grouped and counted without letting the grain blur. COUNT(*) counts lines, COUNT(DISTINCT customer_id) counts workspaces; 251 lines come from just 103 periods across 16 workspaces, and the census is where candidates prove which grain they're standing on.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "books-with-null-ratings", "customers-who-bought-all-products", "net-revenue-retention", "active-users", "cohort-retention-matrix", "unique-orders-and-customers-per-month"],
    },
    {
      name: "License-utilization ratios",
      why: "Active, provisioned, awaiting, deactivated — every utilization rate here is a conditional count over a license state, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL periods, with the 100.0 before the division, is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "hopper-company-queries-ii", "friend-requests-i-overall-acceptance-rate", "trial-to-paid-funnel", "analyze-subscription-conversion", "repeat-purchase-rate", "server-utilization-time", "confirmation-rate"],
    },
    {
      name: "Joining workspaces to seat periods",
      why: "Seat periods inherit workspace attributes through joins to the workspaces table, and the join type decides who survives: a period with no workspace is corruption; a workspace with no period is a dormant license. Choosing INNER versus LEFT is a business statement.",
      slugs: ["employee-bonus", "replace-employee-id-with-unique-identifier", "sales-person", "customers-who-bought-a-and-b-not-c", "dormant-reactivation"],
    },
    {
      name: "Per-SKU storage value folds",
      why: "Storage lines carry plan SKUs and per-line prices, and the footprint story is a join-then-weigh fold: quantity × unit_price per line, billed value rolled per workspace (the top workspace carries 7,262.35 on 50 lines). The per-SKU census is what gets a plan repriced or retired.",
      slugs: ["product-sales-analysis-ii", "products-worth-over-invoices", "average-selling-price", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "The usage calendar",
      why: "Seat usage is calendar arithmetic: STRFTIME('%Y-%m') buckets over periods against the 3,731.97 peak and the 1,193.86 floor. Dropbox drills the month-bucket idiom because every capacity chart hangs on that spine — and a '%m'-without-year fold merges two Januaries into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "mrr-waterfall", "plan-migration-paths", "growth-accounting", "median-time-to-convert"],
    },
    {
      name: "Seat-count two-grain reads",
      why: "Storage SaaS growth is a two-sided read: periods per workspace (depth) against workspaces per cohort (spread). The two-grain shapes here — seat counts, active-workspace counts, depth-versus-breadth ratios — are how expansion gets measured without double-counting.",
      slugs: ["find-the-team-size", "number-of-times-a-driver-was-a-passenger", "count-student-number-in-departments", "basket-depth-aov", "new-users-daily-count"],
    },
    {
      name: "Dormancy & deactivated anti-joins",
      why: "Silence reads are anti-joins: workspaces with no recent period, seat bills with no payments (6 on this db). On this db the never-used-workspace anti-join returns 0 — and proving a confident zero is the job. The survival rule of the join IS the query.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Footprint leaderboards & tie policy",
      why: "Infra boards rank workspaces by storage lines, and ties are real: three workspaces sit at exactly 8 lines. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "second-most-recent-activity", "department-top-three-salaries", "usage-tier-percentiles"],
    },
    {
      name: "Sync-gap windows & LAG transitions",
      why: "Provisioning gaps and usage decay are window work: the gap between a workspace's sync events, the drift between consecutive periods — ordered, partitioned, NULL-aware. The 2.98-day provisioning average is itself a LAG-shaped read from order stamp to provision stamp.",
      slugs: ["biggest-window-between-events", "find-emotionally-consistent-users", "second-day-confirmation", "dau-wau-stickiness", "week-over-week-churn", "null-blank-audit", "rolling-7d-actives"],
    },
    {
      name: "Seat billing & cents discipline",
      why: "Storage is not revenue until the seat book closes: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where storage-SaaS interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "count-salary-categories", "ar-aging-schedule"],
    },
    {
      name: "Payment rails & method folds",
      why: "Settlements arrive on two rails — card (16 payments, 37,364) and wire (11, 32,248) — and the finance pod folds the seat book per rail before any close conversation. The trap is grain: five bills were settled in two rows, so a naive join to payments double-counts bill money. Fold payments first, then talk rails.",
      slugs: ["monthly-transactions-ii", "number-of-rich-customers", "queries-quality-and-percentage", "winback-recovery"],
    },
    {
      name: "CASE-band cohort screens",
      why: "License states and plan bands are CASE classifications all the way down — the pricing memo bands the catalog at 50 and 200, and settlement-age screens bucket bills the same way. Dropbox drills the exhaustive-arm, ordered-WHEN shape because a hole in the CASE is a hole in the cohort.",
      slugs: ["weather-type-in-each-country", "type-of-triangle", "delinquency-buckets", "spend-histogram"],
    },
    {
      name: "Set-op state stacks",
      why: "State boards stack arm censuses — an active stack, a provisioned stack, a deactivated stack — and month-close appends a TOTAL row by UNION ALL. UNION's dedupe pass is not decoration: two arms with identical rows collapse silently, and the stack stops reconciling with the fold.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "league-statistics", "keep-latest-dedupe"],
    },
    {
      name: "Subquery shapes on the workspace tree",
      why: "The expansion screens are subquery work: workspaces above the platform mean, second-heaviest footprints, latest-period lookups. Scalar, correlated and IN shapes answer different questions at different costs — and the empty-inner-query bug ships exactly when a filtered staging table comes back empty.",
      slugs: ["managers-with-at-least-5-direct-reports", "second-highest-salary", "game-play-analysis-iv", "active-businesses"],
    },
    {
      name: "Date math & renewal windows",
      why: "Renewal and provisioning windows are half-open ranges — BETWEEN '2024-03-31' silently drops the last night's syncs, and month-end is exactly when renewals land. The 2.98-day provisioning average is julianday arithmetic over stamped periods only, and the decimals are the story.",
      slugs: ["rising-temperature", "users-that-actively-request-confirmation-messages", "friday-purchases-i", "users-with-two-purchases-within-seven-days", "find-zombie-sessions"],
    },
  ],

  theory: [
    {
      id: "dropbox-t1",
      q: "Your dormancy report joins team workspaces to their seat periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An activity report joins periods to workspaces: a period with no workspace is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from workspaces: the workspaces with no recent periods ARE the finding — a provisioned seat that stopped syncing is the churn signal — arriving with NULL period columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT JOIN quietly became an INNER and the dormant workspaces vanished. The fix is moving the predicate into ON or an outer query. On this db the never-used anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "dropbox-t2",
      q: "The seat census shows 251 storage lines, 103 seat periods and 16 workspaces. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts storage-line items — 251; COUNT(DISTINCT o.id) folds them back to seat periods — 103; COUNT(DISTINCT customer_id) folds further to workspaces — 16. None is wrong: lines measure storage-event volume, periods measure the license calendar, workspaces measure the installed base. The ratios are the reads — 2.4 lines per period, 6.4 periods per workspace — and they decide whether growth is broadening (more workspaces) or deepening (more storage per workspace), which is THE storage-SaaS question. The trap that catches candidates is quoting a line count as a workspace count in a trend; one period with three storage lines is one license row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "dropbox-t3",
      q: "The infra review wants workspaces with at least thirty storage lines. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The license-state rule is a row-level fact — status = 'delivered' discards awaiting and deactivated periods before any fold, in WHERE; putting it in HAVING is impossible because states no longer exist once rows are grouped. The thirty-line floor is a group-level fact — HAVING COUNT(*) >= 30 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a footprint-qualified board and an error, and between a threshold applied to lines versus to periods. On this db only the ladder tops — 50, 46, 34, 30 lines — clear the thirty-line bar. The strong answer places every filter by asking: is this a fact about one storage line, or about a workspace's whole fold?",
      tag: "pipeline",
    },
    {
      id: "dropbox-t4",
      q: "You rank workspaces by storage lines and three of them tie at exactly 8. RANK, DENSE_RANK or ROW_NUMBER for the infra board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied workspaces the same rank and skips — the trio at 8 lines shares rank 8, and the next distinct depth lands at rank 11, implying phantom workspaces that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 8, 8, 8 and the next distinct depth is 9. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which workspace's capacity ticket jumps the queue. On this db the ladder runs 50, 46, 34, 30, 14, 13, 10, then the trio at 8 — the tie is structural. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "dropbox-t5",
      q: "A seat period has no provisioning stamp yet. What is your NULL policy for the time-to-provision report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only provisioned periods have a provisioning latency, so the report measures provisioned seats and says so — on this db 82 of 103 periods carry a stamp (52 active plus 30 provisioned-pending-first-sync), averaging 2.98 days from creation to provisioning stamp, range 2 to 4; 14 are awaiting provisioning, 7 deactivated. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(provisioning_stamp) counts the provisioned subset; the gap between it and COUNT(*) IS the not-yet-provisioned count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant provisioning for workspaces still waiting, and a capacity report built that way is a lie with decimals.",
      tag: "nulls",
    },
    {
      id: "dropbox-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce the 338.19 average. On filtered staging tables — one cohort, one plan SKU, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "dropbox-t7",
      q: "The usage trend buckets seat periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; SUBSTR to month-only would merge January 2024 with January 2025 and the capacity curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's syncs, and month-end is exactly when renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a growth walk. The spine's headline is probed: 2024-01 opens at 8 periods and 3,731.97 of billed value.",
      tag: "dates",
    },
    {
      id: "dropbox-t8",
      q: "The billing desk says a paid seat invoice has no settlement rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1756 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the product's usage ledger and the seat book — the trial balance ties 181,080 to 181,080 — and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "dropbox-t9",
      q: "You write HAVING dark_skus >= 2 and it works, but moving the same predicate to WHERE errors. Same column, different clause — walk me through why.",
      a: "The logical pipeline runs FROM/JOIN, then WHERE, then GROUP BY, then HAVING, then SELECT, then ORDER BY — and SELECT aliases are assigned at the SELECT step. HAVING and ORDER BY sit after SELECT, so they can see the alias; WHERE sits before, sees only raw columns, and dark_skus does not exist yet. The deeper reason: WHERE filters rows before groups form, HAVING judges groups after — dark_skus is a fold output, a property of the category's whole fold, not of any one storage line. SQLite is famously lenient and lets GROUP BY see aliases too, but the portable habit is to repeat the expression or stage a CTE. On the dark-SKU screen the gate lives in HAVING because 'dark' is defined at the fold: the category's date-scoped join found no line. Pipeline order is not syntax trivia here — it is where the gate is allowed to live.",
      tag: "pipeline",
    },
    {
      id: "dropbox-t10",
      q: "The running-billed-value walk uses SUM(billed) OVER (ORDER BY periods DESC), and two workspaces tie at 8 lines. Why does the running total jump by BOTH values at the first tied row?",
      a: "Because the default frame with an ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE is value-based, not row-based: it includes every peer row sharing the current ORDER BY value. The first 8-line workspace's running sum already absorbs its twin, and the twin's row re-absorbs the pair — the ladder's capacity math double-counts exactly at the structural ties this db has (three workspaces at 8 lines). Two fixes: name a physical frame — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — or make the ORDER BY unique with a tie-breaker column so no peers exist. The interview point is that the frame is a definition: running capacity on a tie is either 'including all peers so far' or 'rows so far', and the two differ by a whole workspace's footprint. Say which one the board is buying before you ship the walk.",
      tag: "windows",
    },
    {
      id: "dropbox-t11",
      q: "Month-close stacks the active, provisioned and deactivated censuses and appends a TOTAL row. UNION or UNION ALL — and what silently breaks with the wrong pick?",
      a: "UNION ALL, and not only for speed. The arms are disjoint by construction — a period holds exactly one license state — so dedupe buys nothing, and UNION's dedupe pass is a real hazard: two arms printing identical (state, count) rows collapse to one and the stack silently undercounts a cohort. UNION ALL also skips the sort the dedupe implies, which matters when the stack is a standing board rebuilt on every close. The TOTAL row is itself an arm — an aggregate row appended by UNION ALL — and the audit is arithmetic, not vibes: the arms must sum to the TOTAL and back to the 103-period base. The failure mode candidates miss is not an error; it is a board that reconciles on most months and quietly loses a row on the one month two cohorts coincidentally match. Deterministic stacks use UNION ALL and prove disjointness in a comment.",
      tag: "setops",
    },
    {
      id: "dropbox-t12",
      q: "'Seat bills with no settlement rows' — you can write it with EXCEPT or with LEFT JOIN ... IS NULL. Same answer, so does the choice matter?",
      a: "On a single column both find the same six unpaid bills — and then they diverge. EXCEPT returns DISTINCT rows of the left set absent from the right: duplicate values collapse (two bills with the same amount print once) and you lose every payload column — status, amount, issue date — unless you widen the set, which changes the semantics again. LEFT JOIN + IS NULL keeps row multiplicity and any columns you want, which is why the dunning list, the anomaly queue and the fraud screen are all anti-joins, not set diffs. On this db the unpaid six carry distinct amounts, so EXCEPT looks correct — until the day two bills settle at the same cents and one vanishes from the queue. The rule: anti-joins for lists you act on row by row, set operations for set semantics you can defend. Candidates who can say WHEN each breaks, not just that both run, are the ones who get the follow-up.",
      tag: "setops",
    },
    {
      id: "dropbox-t13",
      q: "Compare each seat period's value to its workspace's average. Correlated subquery or derived table — what actually changes between the two shapes?",
      a: "The question changes, then the cost. A correlated subquery re-runs its inner fold for every outer row — one fold per seat period, 103 of them on this db — and that is exactly what makes it able to answer per-row questions: each period judged against ITS workspace's average, a mixed-grain comparison a single derived fold cannot express without a join-back. The derived/CTE shape computes the fold once and joins — same numbers when the question is global (above the platform mean), radically cheaper, and the join-back variant is how you get per-workspace context at fold cost. The trap is cargo-culting correlated shapes: an above-average screen written correlated still returns the right rows, just re-folding the same workspace average 24 times for Alice Chen's periods. State which population the inner fold should see, then pick the shape that evaluates it that many times — once or per row. That sentence is the answer.",
      tag: "subqueries",
    },
    {
      id: "dropbox-t14",
      q: "The dormancy list is written with NOT IN (SELECT customer_id FROM archived_periods) and comes back empty — but the subquery has rows. What happened?",
      a: "One NULL in the NOT IN list poisons the entire predicate. x NOT IN (1, 2, NULL) can never be TRUE: the comparison against NULL is UNKNOWN, so every row fails the test and the list is silently empty — no error, no warning, a report that ships looking authoritative. This db's customer_id is NOT NULL today, which makes the shape safe today; one orphan import in the archive table and the dormancy board goes blank and nobody notices for a week. The NULL-safe shapes are NOT EXISTS — correlated, stops at the first match, NULL-blind by design — or the LEFT JOIN + IS NULL anti-join this kit's fraud screen uses. The broader discipline is the one this kit teaches everywhere: an empty result is a finding only if you can prove the query could have returned rows. Interrogate the empty set before you ship it; NOT IN is the single most common way an empty set lies.",
      tag: "nulls",
    },
    {
      id: "dropbox-t15",
      q: "Provisioning latency is julianday(shipped_at) - julianday(created_at) and prints 2.958333. A teammate CASTs the delta to INTEGER to clean up the report. What breaks?",
      a: "julianday returns fractional days — the time-of-day component lives in the decimals — so the delta carries real signal that CAST to INTEGER truncates toward zero: 2.958 becomes 2, and a 4.2-day outlier becomes 4 while a 2.9 becomes 2. The platform average 2.98 collapses to about 2, the 2-to-4 range flattens to 2-to-3, and the latency histogram lies without an error on the slide. Policy: keep decimals through the fold, ROUND(x, 2) at the display edge — the 2.98 average is a rounded display of an exact fractional fold. Two disciplines ride along: the population is stamped periods only — 82 of 103 here, the 21 unstamped drop out of any julianday average, which is the definition, not a bug — and CAST is for day-bucket counts, never for durations. The candidate who says 'truncation before aggregation' in one sentence has the job.",
      tag: "dates",
    },
    {
      id: "dropbox-t16",
      q: "A month with no seat bills: what does SUM(amount_cents) return for it, and what is your display policy for that cell?",
      a: "SUM over zero rows returns NULL, not zero — COUNT returns 0, but SUM, AVG, MIN and MAX all return NULL on an empty fold. In a stacked monthly report the empty month prints NULL, chart libraries drop the point, and a month with genuinely zero billing looks identical to a month that was never measured — two facts the CFO needs to distinguish. The policy is two layers: the measure layer keeps NULL so 'no rows' stays distinct from 'sum of zeros'; the display layer coalesces to 0 with the semantics stated — COALESCE(SUM(amount_cents), 0) labeled as such. What never happens is coalescing inside the measure and then feeding the ledger: a fabricated zero is a display convention, not money. On this db every month from 2024-01 to 2025-02 carries billing, so the edge case is theoretical here and load-bearing the day the calendar extends. Empty-set semantics are the interview question hiding inside a formatting question.",
      tag: "nulls",
    },
    {
      id: "dropbox-t17",
      q: "A teammate joins invoices straight to payments to show billed value and the total comes back higher than 66,443. Why, and what is the fix?",
      a: "The join fanned out. Five bills on this db were settled in two payment rows each, and one carries a single partial row — so invoices JOIN payments produces 27 rows for 28 bills' worth of claims, and SUM over the invoice side counts the five split bills twice. The fix is fold-then-join: aggregate payments per invoice first — 27 rows folding to one settled-amount per bill — then join that fold to the invoice table, or better, keep the two folds separate and reconcile at the class level: 21 exact, 1 partial at 4,000 of 6,148, 6 with no rows. The general law: one row per bill in any billed-value fold, and the join budget spent after folding, not before. The number that betrayed the teammate is the tell — a total that drifts UP from the book is fan-out; a total that drifts DOWN is a filter eating rows. Diagnose by direction before you rewrite anything.",
      tag: "joins",
    },
    {
      id: "dropbox-t18",
      q: "How do you pick a HAVING floor like the 30-line footprint gate so the board survives pushback in the review?",
      a: "A gate is a definition, so you pick it between real cohorts and defend the boundary out loud. The storage-line ladder runs 50, 46, 34, 30, then 14 — a floor at 30 keeps exactly the heavy four INCLUDING the boundary workspace, because HAVING COUNT(*) >= 30 is inclusive; a floor at 31 amputates a quarter of the board without changing the story; a floor at 14 admits the long tail and the review drowns in rows nobody staffs against. The interview move has three parts: state the semantics (>=, not >, and say which workspace sits exactly on the line), name what the gate includes and excludes in business terms, and know the next gate down — 14 here, the number that would double the board. What you never do is tune the floor to flatter the result; the ladder is measured, the gate is chosen, and the two must stay separable in the writeup or the board's history stops being comparable.",
      tag: "aggregation",
    },
    {
      id: "dropbox-t19",
      q: "Define monthly active workspaces for this business — and the stickiness number you would put next to it.",
      a: "Monthly active workspaces = COUNT(DISTINCT workspace) with at least one sync-bearing period in the calendar month — workspace grain, never period grain: 103 periods is not 103 actives, it is 103 license rows that must be folded before anyone says 'active'. Stickiness then needs a stated denominator, and the two honest candidates measure different things: actives over the installed base (16 workspaces) is the churn-adjacent read that the board prices; actives over provisioned-only is the engagement read that says how well the provisioned fleet actually syncs. This db makes the two-grain point structural — EU carries 45 periods from just 8 workspaces, a 5.6 intensity that no single-grain metric shows. The rule this kit grades: every activation number ships with its grain and its denominator in the same breath, because 'active' without 'of what' is a claim, not a metric.",
      tag: "kpi",
    },
    {
      id: "dropbox-t20",
      q: "Growth asks for trial-to-paid conversion and MRR. Define both so the numbers survive the meeting.",
      a: "Trial-to-paid conversion: workspaces that crossed from the awaiting-provisioning (trial) state to active, over the awaiting cohort that had the chance to cross — the denominator is the cohort, not the 103-period base and not the installed 16, and mixing those in is how a conversion rate gets inflated on a slide. The paired discipline is naming the window: crossed within the trailing month, or ever — the two numbers answer different questions and both are real. MRR: the recurring run-rate of the seat book — the active billings normalized per month, which means dividing the book by the months it covers rather than summing one-off lines, and always with a collected twin, because billed is not collected: on this book 21 of 28 bills settled exact, 1 partial, 6 never. The pairing — definition plus collected twin — is what finance actually asks for; a growth number with no AR shadow is a forecast wearing a metric's clothes.",
      tag: "kpi",
    },
    {
      id: "dropbox-t21",
      q: "The monthly spine is built with SUBSTR(created_at, 1, 7) = '2025-02' in the WHERE and the dashboard is slow. What is the performance instinct?",
      a: "Wrapping the column in a function defeats any index on created_at — the engine must materialize SUBSTR for every row before it can compare, a full scan dressed as a filter. The sargable shape is the half-open range: created_at >= '2025-02-01' AND created_at < '2025-03-01' — index-seekable, same bucket, no function on the column. The distinction to articulate: SUBSTR as a GROUP BY key is fine — it is computed once per row during the fold you asked for; SUBSTR in a filter is the anti-pattern, because it converts a seek into a scan on the exact predicate the dashboard runs most. The half-open boundary also fixes the correctness bug BETWEEN carries — it drops no end-of-month rows. Instinct in one line: functions belong in display and fold keys, never in filters, and the range form is free correctness on top of the speed.",
      tag: "performance",
    },
    {
      id: "dropbox-t22",
      q: "The footprint board joins storage lines to seat periods to workspaces and THEN filters to heavy workspaces, and it is slow. Restructure it.",
      a: "Fold early, join late. The current plan drags 251 line rows through the attribute joins before any reduction; the restructure folds first — join lines to periods, GROUP BY workspace to per-workspace counts (16 folds), apply the HAVING floor — and only then joins the decorative attributes (name, region) onto the handful of surviving rows. Two reductions compound: filtering early, the status rules that define which lines count, shrinks the fold's input; folding before the attribute join shrinks the expensive join from 251 rows times attributes to 16 folds times attributes, and after a 30-line gate, to 4. The numbers are identical — the plan is not, and that is the point: aggregation is a row-count decision, and every join you defer happens on fewer rows. The one-line shorthand for the interview: aggregate before you decorate. Boards ship the same way — the fold is the fact, the attributes are the presentation.",
      tag: "performance",
    },
    {
      id: "dropbox-t23",
      q: "SUM(ROUND(amount_cents / 100.0, 2)) and ROUND(SUM(amount_cents) / 100.0, 2) disagree by a cent across 28 bills. Which is right, and what is the policy?",
      a: "Round once at the edge: ROUND(SUM(amount_cents) / 100.0, 2). Folding INTEGER cents is exact — integers sum without drift — and one division at the display edge is exact to the cent. The per-row version rounds every bill BEFORE the fold, and each rounding pushes up to half a cent of error into the total; across 28 bills, odd-cent rows accumulate the drift you are now chasing. The policy generalizes: measure in the storage type — INTEGER cents here — round only for humans, and never round a value you intend to re-aggregate. It is also the only policy under which reconciliation is provable: the ledger tie 181,080 = 181,080 holds in raw cents; a rounded ledger cannot tie because its inputs no longer sum to its outputs. The candidate's one-liner: the fold is the math, the ROUND is the cosmetics, and the two must never swap places.",
      tag: "quality",
    },
    {
      id: "dropbox-t24",
      q: "Regional utilization reads 53.3, 56.8, 26.3 and 100.0. Why does the platform line print 50.5 and not the average of those four numbers?",
      a: "Because the platform number is pooled: the sum of numerators over the sum of denominators — 52 active over 103 periods, 50.5 — weighting every cohort by its size. The average of regional rates, 59.1, lets LATAM's 100% on 2 periods vote as loudly as EU's 53.3% on 45; it is Simpson's paradox in miniature, and it is not wrong so much as answering a different question — 'what does the typical cohort look like' rather than 'what share of all periods are active'. Only the pooled ratio reconciles with the funnel: 52 of 103 is checkable, the average of rates is not. The policy: ratios of sums for platform lines, per-cohort rates for the breakdown, and never the two in one column — a blended table where the total row is an average of rates is the classic ship-wreck. Name which one you printed and the denominator argument ends before it starts.",
      tag: "kpi",
    },
  ],

  mcqs: [
    {
      id: "dropbox-mcq-1",
      prompt: "A seat period's status column reads 'shipped'. In this kit's license funnel, what is it?",
      choices: ["Active and syncing", "Provisioned — awaiting the first sync verification", "Awaiting provisioning — trial state", "Deactivated / workspace deleted"],
      answer: 1,
      why: "The funnel map is fixed: delivered = active (52 of 103 periods), shipped = provisioned with the stamp already applied (30), pending = awaiting provisioning (14), cancelled = deactivated (7). 'Shipped' is the provisioned-but-unverified state — the seat exists and carries a stamp, but sustained sync hasn't been confirmed.",
      notes: [
        { choice: 0, why: "Active is 'delivered' — 52 periods. Counting provisioned-unverified as active inflates every utilization number on the board." },
        { choice: 2, why: "Awaiting provisioning is 'pending' — 14 periods that carry NO stamp. Provisioned-unverified is a different, later stage; confusing them corrupts the latency report's denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-2",
      prompt: "Seat utilization rate is defined as active ÷ which population? The db holds 52 active and 7 deactivated of 103 seat periods.",
      choices: ["Active + deactivated only (52/59 = 88.1%)", "All seat periods (52/103 = 50.5%)", "Provisioned periods only", "Distinct workspaces (52/16)"],
      answer: 1,
      why: "The house definition: active ÷ ALL periods, awaiting and provisioned-pending included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-funnel utilization rate — a legitimate separate metric, but calling it 'the utilization rate' inflates 50.5% to 88.1% by quietly deleting 14 awaiting and 30 provisioned periods. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is active periods per workspace — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-3",
      prompt: "EU carries 45 seat periods from 8 workspaces. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between the columns — 5.6 periods per workspace — is the intensity read that separates load from audience.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a workspace. Without DISTINCT both columns read 45 and the census loses the spread story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts cohorts, not workspaces — a third grain nobody asked for. The census is periods AND workspaces." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued periods", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every cohort's utilization share truncates toward 0 and the whole funnel map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-5",
      prompt: "Keep only workspaces with at least 30 storage lines. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 30, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 30", "WHERE storage_lines >= 30 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A line-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the footprint ladder — 50, 46, 34, 30 lines — clears such a bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'storage_lines' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-6",
      prompt: "A seat invoice row reads amount_cents = 175600. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 1,756.00 — the exact value on the infamous #28 bill. The .0 is the entire fix; integer ÷ integer truncates, and every odd-cent seat bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "175600 / 100 is integer division = 1756 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 17,560,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-7",
      prompt: "The dormancy list is built as workspaces LEFT JOIN seat periods WHERE the period id IS NULL. What happens if a teammate rewrites it with INNER JOIN?",
      choices: ["Same list, faster — INNER JOIN is equivalent here", "Empty list — the workspaces with no periods fail the join and vanish", "All 16 workspaces — the join direction flips", "An error — INNER JOIN cannot be combined with IS NULL"],
      answer: 1,
      why: "The dormancy list IS the anti-join: workspaces whose join finds no period survive only under LEFT JOIN + IS NULL. INNER JOIN drops exactly those rows — on this db that list is empty (every workspace has usage), and the rewrite hides the fact that the check ran at all.",
      notes: [
        { choice: 0, why: "INNER and LEFT differ precisely on the unmatched rows — which are the entire answer here. The rewrite deletes the finding, not the bug; a confident zero still needs the LEFT JOIN to be believable." },
        { choice: 2, why: "Join type never flips direction — it changes row survival. All 16 would need a CROSS JOIN, a different (and wrong) tool." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-8",
      prompt: "A teammate builds the monthly storage trend with SUBSTR(created_at, 6, 2) AS month. The db spans 2024-01 to 2025-02. What does the chart show?",
      choices: ["A correct 14-bucket trend", "12 buckets — every January merged into one, every February merged into one", "14 buckets but sorted wrong", "An error — SUBSTR cannot parse timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) grabs the two-digit month with no year: January 2024 (8 periods, 3,731.97) and January 2025 (6 periods, 1,669.50) collapse into one bucket. The spine must be '%Y-%m' — year plus zero-padded month — or the seasonality curve is fiction.",
      notes: [
        { choice: 0, why: "The db spans two calendar years — month-only bucketing silently merges same-month pairs. 14 real months compress to 12 fictional ones." },
        { choice: 3, why: "SUBSTR parses fine — that's the trap. The bug is semantic (lost year), not mechanical, so nothing errors and the chart just quietly lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-9",
      prompt: "RANK() OVER (ORDER BY COUNT(*) DESC) ranks the storage-line ladder 50, 46, 34, 30, 14, 13, 10, 8, 8, 8. What rank does the FIRST of the three tied 8-line workspaces hold?",
      choices: ["8", "7", "10", "Whatever ROW_NUMBER assigned it"],
      answer: 0,
      why: "RANK gives every tied row the same rank — the trio shares rank 8 (after 1 through 7) — and reserves rank 11 for the next distinct depth. All three tied workspaces are rank 8, by policy, not accident.",
      notes: [
        { choice: 1, why: "Rank 7 belongs to the workspace at 10 lines. The tie starts at 8 — counting tied rows as separate rungs is exactly the phantom-rank bug." },
        { choice: 3, why: "ROW_NUMBER would arbitrarily order the trio 8, 9, 10 — a silent judgment call about which workspace's capacity ticket jumps the queue. If you use it, name the tie-breaker." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-10",
      prompt: "A month-over-month storage walk uses LAG(revenue) OVER (ORDER BY month) on the 14-month spine. What is honest to do with the first row's NULL delta?",
      choices: ["Coalesce it to 0 — the first month has no growth", "Coalesce it to the first month's revenue — that's the baseline", "Report it as NULL or label it 'baseline' — there is no prior month to differ from", "Drop the first row entirely so no NULL appears"],
      answer: 2,
      why: "The first row's prior value does not exist: LAG returns NULL and the delta is NULL by definition, not by failure. Coalescing to zero fabricates a flat month into a growth walk; dropping the row hides the spine's opening (2024-01: 8 periods, 3,731.97).",
      notes: [
        { choice: 0, why: "Zero means 'no change from last month' — a factual claim about a month that has no last month. Baseline is a label, not a zero." },
        { choice: 1, why: "Setting the delta equal to the month's own revenue invents a +100% growth month. The edge row is where growth walks most often lie." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-11",
      prompt: "A teammate rewrites the footprint board's GROUP BY month as GROUP BY 1. The board still builds and prints the same rows today. What is the standing risk?",
      choices: ["None — ordinal and name grouping are identical forever", "The ordinal pins to column position — reshuffling the SELECT list silently regroups the fold", "Ordinals only work in ORDER BY, so it will error on the next run", "SQLite forbids ordinal GROUP BY — it only worked by accident"],
      answer: 1,
      why: "GROUP BY 1 means 'the first SELECT column'. It groups by month today because month is first — but any SELECT reshuffle (adding a label column, reordering for a chart) regroups the fold silently, and the board keeps printing plausible-looking wrong numbers with no error to catch it.",
      notes: [
        { choice: 0, why: "They are identical only while the SELECT list stays frozen. The risk is precisely that nothing visible breaks — the failure is silent regrouping after an innocent-looking edit." },
        { choice: 2, why: "SQLite supports ordinals in both GROUP BY and ORDER BY. The danger is not syntax, it is the positional coupling to a SELECT list someone will edit." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-12",
      prompt: "Month-close stacks the state censuses and a TOTAL row via UNION (not UNION ALL). Two arms happen to print identical (state, count) rows this month. What ships?",
      choices: ["Both rows — UNION keeps duplicates", "One row — UNION's dedupe collapses them and the stack undercounts by a cohort", "An error — UNION rejects duplicate rows", "The TOTAL row doubles"],
      answer: 1,
      why: "Bare UNION dedupes its result set: two legitimately identical arm rows print once, the stack stops reconciling with the 103-period base, and nothing errors. Disjoint-by-construction arms are the argument for UNION ALL — no dedupe pass, no silent collapse, cheaper too.",
      notes: [
        { choice: 0, why: "That is UNION ALL's behavior. The whole point of the distinction: dedupe is the ONE thing bare UNION adds, and here it deletes a true row." },
        { choice: 2, why: "Duplicate rows are perfectly legal input to UNION — they just collapse to one. A silently short board is worse than an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-13",
      prompt: "SUM(billed) OVER (ORDER BY periods DESC) walks the footprint ladder, and two workspaces tie at 8 lines. What does the SECOND tied row's running sum include?",
      choices: ["Only its own value — running sums are row-local", "Its value AND its twin's — the default RANGE frame includes peer rows sharing the ORDER BY value", "It resets to zero at the tie", "An error — ties break window ORDER BY"],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE is value-based: peers with equal ORDER BY values all fall inside each other's frames. The first tied row's running sum already absorbs its twin — exactly the double-count the capacity walk must avoid on this db's structural 8-line trio.",
      notes: [
        { choice: 0, why: "That is ROWS semantics. The default is RANGE — the fix is naming ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW or making the ORDER BY unique." },
        { choice: 2, why: "Frames never reset mid-partition without a new PARTITION BY. The tie widens the frame; it does not close it." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-14",
      prompt: "The dormancy list runs WHERE customer_id NOT IN (SELECT customer_id FROM archived_periods). One archived row carries a NULL customer_id. The list returns:",
      choices: ["Every workspace with no archived periods", "Nothing — x NOT IN (…, NULL) is never TRUE, so every row fails", "Everything — NULL compares as a match", "An error — NOT IN rejects NULL inputs"],
      answer: 1,
      why: "One NULL poisons the whole list: comparing against NULL yields UNKNOWN, UNKNOWN OR FALSE is UNKNOWN, and the predicate can never be TRUE. The dormancy board silently goes empty — no error, no warning. The NULL-safe shapes are NOT EXISTS or LEFT JOIN + IS NULL.",
      notes: [
        { choice: 0, why: "That is the shape WITHOUT the NULL row. The poison is exactly one orphan import away — which is why the empty result must be interrogated, not shipped." },
        { choice: 3, why: "NOT IN with NULLs is legal SQL that returns a silent empty set. Silent failure is the bug class this kit keeps grading." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-15",
      prompt: "Compare each of 103 seat periods to its workspace's average value, written as a correlated subquery. How many times does the inner fold run?",
      choices: ["Once for the whole query", "Once per workspace — 16 times", "Once per outer row — up to 103 times", "Zero — the optimizer always rewrites correlated forms"],
      answer: 2,
      why: "A correlated subquery re-evaluates for every outer row: 103 seat periods means up to 103 folds of the workspace average. That per-row cost is also its power — each period can be judged against ITS workspace, a mixed-grain comparison a single derived fold cannot express without a join-back.",
      notes: [
        { choice: 0, why: "Once-per-query is the derived-table/CTE shape. Same numbers on a global question, radically cheaper — pick the shape that matches the population you need." },
        { choice: 1, why: "The fold runs per OUTER ROW — a period row — not per workspace. Alice Chen's 24 periods re-fold her workspace's average 24 times." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-16",
      prompt: "'Bills with no settlement rows' — written as EXCEPT or as LEFT JOIN + IS NULL, both return six bills today. The difference that bites first:",
      choices: ["EXCEPT is always faster", "EXCEPT returns DISTINCT rows — duplicate values collapse and payload columns vanish", "EXCEPT includes matched rows too", "They are byte-identical here and forever"],
      answer: 1,
      why: "EXCEPT works on set semantics: distinct rows, single-column sets unless you widen it — and widening changes the answer. The anti-join keeps row multiplicity and every payload column, which is why dunning lists are LEFT JOIN + IS NULL. The day two bills share an amount, the EXCEPT queue loses one.",
      notes: [
        { choice: 0, why: "Performance is engine-dependent and beside the point — the semantic difference (dedupe, column loss) is what breaks a queue." },
        { choice: 2, why: "EXCEPT subtracts; INTERSECT would keep matched values. Confusing the two is the classic set-op slip." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-17",
      prompt: "Provisioning latency averages 2.98 days via julianday(shipped_at) - julianday(created_at). A teammate CASTs each delta to INTEGER before averaging. The report now reads:",
      choices: ["2.98 — the CAST happens after the average", "About 2 — truncation flattens every fractional day before the fold", "3 — CAST rounds to nearest", "An error — julianday returns TEXT"],
      answer: 1,
      why: "julianday differences are fractional days; CAST to INTEGER truncates toward zero before the AVG ever runs. A 2.9-day latency and a 2.0 both become 2, the 2.98 average collapses to roughly 2, and the 2-to-4 range flattens — the histogram lies without an error.",
      notes: [
        { choice: 0, why: "The CAST sits BEFORE the AVG in the argument — the damage happens per row, then the fold averages the truncated values." },
        { choice: 2, why: "CAST truncates toward zero; it never rounds. Keep decimals through the fold and ROUND(x, 2) at the display edge." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-18",
      prompt: "SELECT SUM(i.amount_cents) FROM invoices i JOIN payments p ON p.invoice_id = i.id returns MORE than the 66,443 paid book. Why?",
      choices: ["Payments carry processing fees on top", "Five bills were settled in two payment rows — the join fans them out and the bill side double-counts", "The void bill inflates the total", "INTEGER cents overflowed"],
      answer: 1,
      why: "Five bills carry two settlement rows each: the join produces 27 rows for 28 bills' worth of claims, and the invoice side is counted once per matching payment row. The fix is fold-then-join — aggregate payments per invoice first, or reconcile at the class level (21 exact / 1 partial / 6 none).",
      notes: [
        { choice: 2, why: "Void bill #11 has exactly one payment row — one count, no inflation. The splits are the fan-out." },
        { choice: 0, why: "No fees are modeled on this ledger. A total drifting UP from the book is fan-out; drifting DOWN is a filter eating rows — diagnose by direction." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-19",
      prompt: "The footprint ladder runs 50, 46, 34, 30, then 14 storage lines. The board gates 'at least 30 lines'. Does the 30-line workspace survive?",
      choices: ["No workspace sits exactly at 30", "Yes — HAVING COUNT(*) >= 30 is inclusive, and the boundary workspace is exactly the point", "No — HAVING gates are exclusive at the boundary", "The gate errors when a group sits exactly on the threshold"],
      answer: 1,
      why: ">= is inclusive: the 30-line workspace (Maya Patel) is IN the heavy four, and the gate was chosen at 30 precisely to include it. A 31 floor amputates a quarter of the board with no change in story; the semantics of the boundary are the definition the review debates.",
      notes: [
        { choice: 2, why: "> 30 would be exclusive and would drop it — which is why stating >= versus > out loud is part of the gate's definition, not pedantry." },
        { choice: 0, why: "The ladder has exactly one workspace at 30 lines — boundary cases are where gate definitions get tested, which is why the probe quotes them." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-20",
      prompt: "Regional utilization reads EU 53.3, APAC 56.8, US 26.3, LATAM 100.0. The platform line prints 50.5. Why?",
      choices: ["It is the median of the four cohort rates", "Pooled: 52 active ÷ 103 periods — cohorts weight by size, so LATAM's 2 periods do not outvote EU's 45", "It is the minimum cohort rate", "Rounding drift across the four cells"],
      answer: 1,
      why: "The platform number is the ratio of sums — every period in one denominator — so big cohorts dominate and the 2-period LATAM cohort cannot drag the line up. The unweighted average of the four rates is 59.1: a real but different metric that answers 'typical cohort', not 'share of all periods'.",
      notes: [
        { choice: 0, why: "The average of the four is 59.1, not 50.5 — and averages of ratios are the classic Simpson's-paradox trap this board is built to avoid." },
        { choice: 2, why: "26.3 (US) is the minimum, not 50.5. The pooled ratio reconciles with the funnel: 52 of 103 is checkable, an average of rates is not." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-21",
      prompt: "WHERE SUBSTR(created_at, 1, 7) = '2025-02' versus created_at >= '2025-02-01' AND created_at < '2025-03-01'. Why does the dashboard prefer the second?",
      choices: ["Shorter SQL parses faster", "The range shape is sargable — it can use an index on created_at; the SUBSTR form scans", "SUBSTR cannot compare TEXT values", "They select different day ranges"],
      answer: 1,
      why: "A function wrapped around the column must be materialized per row, defeating any index — a full scan dressed as a filter. The half-open range keeps the column bare, seeks the index, and selects exactly the same month. Functions belong in fold keys and display, not in filters.",
      notes: [
        { choice: 2, why: "SUBSTR compares fine — the cost is the per-row function, not the comparison. The bug class is performance plus the false confidence of an unchanged result." },
        { choice: 3, why: "Built correctly they are identical buckets — and the range form is additionally safe from BETWEEN's end-of-month drop." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-22",
      prompt: "Card: 16 payments worth 37,364. Wire: 11 payments worth 32,248. Which claim about the seat book's rails survives scrutiny?",
      choices: ["Card is the enterprise rail — it carries the biggest total", "Wire carries fewer, larger settlements — 2,931.64 average against card's 2,335.25", "The per-settlement averages are identical", "Wire has the higher payment count"],
      answer: 1,
      why: "Averages per settlement: 32,248 / 11 = 2,931.64 against 37,364 / 16 = 2,335.25 — wire is the fewer-but-bigger rail, the enterprise tell. Card leads on total AND count, which is exactly how the two claims get confused in a meeting.",
      notes: [
        { choice: 0, why: "Card leads totals (37,364) but loses per-bill — quoting the total as 'the enterprise rail' is the average/total mix-up the rails split exists to catch." },
        { choice: 2, why: "2,931.64 versus 2,335.25 — a 25% gap. Averages of the same money over different counts are never identical unless the counts are." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-23",
      prompt: "Growth wants trial-to-paid conversion for seat workspaces. The honest denominator is:",
      choices: ["All 103 seat periods", "The awaiting-provisioning cohort that had the chance to cross — 14 periods, not the whole funnel", "Active periods only — 52", "All 16 workspaces"],
      answer: 1,
      why: "Conversion is crossings over the population AT RISK: the awaiting-provisioning cohort — 14 periods on this db — is who could convert. The 103-period base dilutes with people who were never in the trial state; the active-only base inverts the ratio into something else entirely.",
      notes: [
        { choice: 0, why: "Mixing the whole funnel into the denominator is how a conversion rate gets inflated downward into meaninglessness — denominator choice IS the metric definition." },
        { choice: 3, why: "A grain flip: the cohort can be periods or workspaces, but it must be the trial-state population, not everyone. Name the grain with the rate." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-24",
      prompt: "Seat bills settle in 28.4 days on average against flat 30-day terms. What must ship alongside that average?",
      choices: ["Nothing — the average is the number", "The tail: fastest 13, slowest 84 — the slowest breaches terms by 54 days and the average hides it", "The mode of the settlement days", "The currency conversion"],
      answer: 1,
      why: "An average of 28.4 looks terms-compliant while the slowest bill sits 54 days past terms — the distribution, not the mean, is what collections acts on. Every settlement metric here ships with fastest and slowest attached; the tail is the dunning trigger.",
      notes: [
        { choice: 0, why: "The average is exactly where the lie lives: 20 bills averaging 28.4 include one at 84. Compliance conversations run on tails." },
        { choice: 2, why: "The mode says nothing about the breach. Fastest/slowest (13/84) is the pair that travels with the mean by house policy." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-25",
      prompt: "A bill shows 4,000 settled against 6,148 billed. The coverage classifier that reads 'partial' is:",
      choices: ["status = 'partial' — the bill's status column says so", "0 < SUM(payments) < amount — the settlement fold decides, not a status column", "paid_on IS NOT NULL", "COUNT(payments) = 1"],
      answer: 1,
      why: "Coverage is computed from the settlement rows folded per bill: exact when the fold equals the amount, partial when it is strictly between zero and the amount, none when no rows exist. There is no 'partial' status on this book — statuses are open, paid, void, and one of them (#28) is a claim the rows contradict.",
      notes: [
        { choice: 0, why: "That bill is status 'open' — the classifier must come from the rows. Status-as-truth is the exact bug the #28 anomaly exists to teach." },
        { choice: 3, why: "A row count of 1 says 'single settlement', not 'shortfall' — 21 exact bills also carry rows. Only the folded sum against the amount classifies coverage." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-26",
      prompt: "The walk needs each month's delta versus the PRIOR month only, on a spine whose ORDER BY key can repeat. Which frame guarantees one row?",
      choices: ["The default frame — it is always exactly one row back", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW — physical rows, immune to value ties", "RANGE BETWEEN 1 PRECEDING AND CURRENT ROW — includes value-peers as needed", "No frame can be forced to one row"],
      answer: 1,
      why: "ROWS counts physical rows: 1 PRECEDING is exactly one row back no matter what the values do. RANGE is value-based — a tie widens the frame to include the peer, which silently turns a one-month delta into a two-row blend the moment the spine carries duplicate keys.",
      notes: [
        { choice: 0, why: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — the whole partition-so-far, peers included. Nothing about it is one row." },
        { choice: 2, why: "RANGE with 1 PRECEDING reaches one VALUE back — on ties that is multiple physical rows. Value-frames are for 'peers so far' questions, not deltas." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-27",
      prompt: "SUM(ROUND(amount_cents / 100.0, 2)) and ROUND(SUM(amount_cents) / 100.0, 2) disagree by a cent across the 28-bill book. The house rule and why:",
      choices: ["Per-row rounding — every cell should be self-consistent", "Round once at the edge — INTEGER cents fold exactly, and one division at display cannot drift", "Average the two answers and split the difference", "Whichever matches the exported CSV"],
      answer: 1,
      why: "Fold integer cents exactly, divide once at the display edge. Per-row rounding pushes up to half a cent of error into every odd-cent row before the fold, and the drift accumulates. It is also the only policy under which the 181,080 = 181,080 ledger tie is provable — rounded inputs cannot be made to tie.",
      notes: [
        { choice: 0, why: "Self-consistent cells that cannot reconcile as a set — the drift IS the inconsistency, just distributed where nobody looks." },
        { choice: 2, why: "Averaging two arithmetic results means neither is trusted — and the tie you must prove is in raw cents, where no disagreement exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "dropbox-mcq-28",
      prompt: "The peak-workspace board joins per-workspace folds back to per-region MAX(storage_value). Two workspaces tie at their region's peak. The board shows:",
      choices: ["One of them — the join picks arbitrarily and drops the twin", "Both — the join-back keeps every row whose value matches the peak, which is the tie policy made visible", "An error — MAX cannot be joined back on", "The average of the two values"],
      answer: 1,
      why: "The join-back predicate p.peak_value = f.storage_value matches on VALUE, so every fold row carrying the peak survives — two tied workspaces both print. That is not a bug, it is the tie policy: argmax-by-value is deterministic, visible, and needs an explicit tie-breaker only if the board demands one row.",
      notes: [
        { choice: 0, why: "Nothing arbitrary happens — both rows match and both print. Silently hiding one would be a policy decision nobody made." },
        { choice: 2, why: "MAX folds fine and joins back fine on its value. The only question is multiplicity, and the answer is: ties both survive." },
      ],
      difficulty: "medium",
    },
    {
      id: "dropbox-mcq-29",
      prompt: "After joining storage lines to periods, COUNT(*) OVER (PARTITION BY region) reads 45 for EU — but the census wanted 8 workspaces. The fix:",
      choices: ["COUNT(DISTINCT customer_id) OVER (…) — windows can fold", "Windows cannot COUNT DISTINCT — fold to per-workspace rows first, then window or join the fold", "Add LIMIT to cap the rows", "Divide the window count by 5.6"],
      answer: 1,
      why: "Windows count the rows they see — post-join, EU is 45 line rows — and SQLite windows cannot apply DISTINCT. The two-grain census needs the fold: COUNT(DISTINCT customer_id) in a GROUP BY, or a per-workspace CTE that the window then counts at workspace grain.",
      notes: [
        { choice: 0, why: "COUNT(DISTINCT …) is not allowed inside a window function in SQLite — the attempt is the error you would hit first." },
        { choice: 2, why: "LIMIT truncates output rows; it never changes what a window counted. The grain mismatch is upstream of any row cap." },
      ],
      difficulty: "easy",
    },
    {
      id: "dropbox-mcq-30",
      prompt: "WHERE mom_delta < 0 on a LAG-walk CTE errors before the walk even stages. Why — and the SQLite shape that works?",
      choices: ["mom_delta is a reserved word", "Windows evaluate after WHERE — stage the walk in the CTE, then filter the alias in the outer query", "Use HAVING mom_delta < 0 instead", "SQLite has a QUALIFY clause for exactly this"],
      answer: 1,
      why: "The logical pipeline computes windows after WHERE, so the alias does not exist when WHERE runs. The working shape is the one the walk already uses: stage the windowed columns in a CTE (or derived table), then filter mom_delta in the outer query where the column is real.",
      notes: [
        { choice: 2, why: "HAVING judges groups after aggregation — a window alias is neither. Same wall, different clause." },
        { choice: 3, why: "SQLite has no QUALIFY (that is Snowflake/DuckDB). In SQLite, CTE staging is the idiom — which is why every walk in this kit is staged." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-dropbox-1",
      tier: "medium",
      topic: "j3",
      universe: "growth",
      title: "The team storage-footprint board",
      brief:
        "Dropbox-flavored brief on the storefront db: Monday's infra review opens with the storage-footprint board — every team workspace with its seat periods, raw storage lines and billed storage value, gated to real footprints. Probed facts: 251 storage lines fold into 103 seat periods across 16 workspaces; the line ladder runs 50, 46, 34, 30, 14, 13, 10 before a three-way tie at 8; the top workspace (Alice Chen, EU) carries 24 periods and 7,262.35 of storage value across 100 units. The board gates at a 30-line floor so only heavy workspaces make the review — and the board must show both grains, lines and distinct periods, or the census lies.",
      ask: "Return each qualifying workspace with its distinct seat periods, raw storage lines, units and billed storage value — heaviest storage value first.",
      template:
        "SELECT c.name AS workspace,\n       c.region AS region,\n       COUNT({2} o.id) AS periods,\n       COUNT(*) AS storage_lines,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS storage_value\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {1}\nORDER BY storage_value {3};",
      slots: [
        {
          answer: "30",
          kind: "number",
          label: "the footprint floor",
          why: "The 30-line floor keeps exactly the ladder tops — 50, 46, 34, 30 lines — and 30 appears as the fourth workspace's storage_lines cell, so the gate value itself shows up in the result. A 14 floor lets Chloe Dubois (2,667.93) in and dilutes the review; a 46 floor amputates half the board.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the distinct-period fold",
          why: "COUNT(*) and COUNT(o.id) both count storage lines — 50 for the top workspace — while COUNT(DISTINCT o.id) folds them back to the 24 seat periods that actually carried them. Dropping DISTINCT makes the two grains identical and the footprint census loses its license read.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The board ranks billed storage value descending — 7,262.35 takes row 1. ASC would crown the smallest footprint (444.80) as the top storage consumer and the capacity conversation would start from the wrong end of the ladder.",
        },
      ],
      distractors: ["14", "46", "50", "ALL", "ASC"],
      walkthrough:
        "Two grains, one fold, one gate. Storage lines join to seat periods and to workspaces, fold per workspace, and the HAVING floor at 30 keeps four boards-qualified rows: Alice Chen (EU) at 24 distinct periods but 50 raw lines and 100 units for 7,262.35; Emma Wilson (US) at 17 periods, 46 lines, 98 units, 6,640.56; Grace Kim (APAC) at 14, 34, 67 for 4,574.23; Maya Patel (APAC) at 13, 30, 62 for 3,644.56 — the gap between the periods and lines columns (50 vs 24) is the fan-out read, 2.1 lines per period at the top of the ladder. The distractors each break differently: a 14 floor admits Chloe Dubois at 2,667.93 and turns a heavy-footprint review into a long tail; 46 keeps two rows; 50 keeps one; ALL makes the periods column a copy of storage_lines and the census loses its license grain; ASC crowns Olivia Brown's 444.80 as the heaviest footprint. The lesson under the lesson: on storage SaaS boards, load is lines and license is periods — a board that reports only one grain answers only half the capacity question.",
    },
    {
      id: "cs-dropbox-2",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "Plan bands on the seat catalog",
      brief:
        "Dropbox-flavored brief on the storefront db: the pricing memo classifies the 16 plan SKUs by per-seat list price into three bands — basic below 50, standard from 50 up to but not including 200, business at 200 and above. Probed facts: the basic band holds 8 SKUs averaging 32.06; the standard band holds 8 SKUs averaging 111.5; the business band is EMPTY — the catalog ceiling is the 199.99 top SKU. The memo only reports bands that clear an 8-SKU assortment floor, so the honest result is two rows and one conspicuous absence: there is no business tier on this catalog, and the memo must say so out loud instead of letting the missing band pass silently.",
      ask: "Return each plan band with its SKU count and average per-seat price — biggest bands first, band name as tie-break.",
      template:
        "SELECT CASE WHEN price >= {3} THEN 'business'\n            WHEN price >= {2} THEN 'standard'\n            ELSE 'basic' END AS plan_band,\n       COUNT(*) AS plans,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY plan_band\nHAVING COUNT(*) >= {1}\nORDER BY plans DESC, plan_band;",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the assortment floor",
          why: "Both surviving bands hold exactly 8 SKUs, so the floor value appears twice in the plans column. A 9 floor empties the memo — no band clears it — and that empty result IS the honest answer to 'do we have a business tier?'.",
        },
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the basic/standard boundary",
          why: "50 is the catalog's basic-band ceiling: 8 SKUs sit below it averaging 32.06. Slide it and bands relabel silently — a 9 boundary swallows every SKU into standard, a 32.06 boundary reclassifies the 32.00 yoga-mat SKU and the band averages drift without an error.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the business-band floor",
          why: "200 is where the catalog goes empty — the ceiling is 199.99, so no SKU qualifies and the business band never appears. That absence is the finding: the pricing memo states the ceiling honestly instead of inventing a tier the catalog cannot staff.",
        },
      ],
      distractors: ["9", "16", "111.5", "32.06"],
      walkthrough:
        "One table, one CASE, one honest zero. The CASE cuts price at 50 and 200: basic folds to 8 SKUs averaging 32.06, standard folds to 8 averaging 111.5, and business — the band the memo was asked about — never forms, because the ceiling SKU prices at 199.99. The HAVING floor at 8 keeps both surviving bands and prints the floor value itself in every plans cell. The distractors each break differently: a 9 floor empties the memo entirely; 16 empties it too while looking like a stricter bar; 111.5 as a boundary creates a 4-SKU standard band averaging up-market and a 12-SKU basic band — real rows that answer a question nobody asked; 32.06 as a boundary slices basic down to 4 SKUs and standard up to 12. The lesson under the lesson: band boundaries are definitions, not decorations — move a boundary and you have not rounded, you have re-segmented the catalog, and the premium-band void (max 199.99) is a finding the memo must carry, not a row the query must invent.",
    },
    {
      id: "cs-dropbox-3",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The month-spine recovery walk",
      brief:
        "Dropbox-flavored brief on the storefront db: month-close ships the billing spine as a walk, not a bar chart — every month's billed revenue beside its prior month and the delta between them. Probed facts: the spine runs 14 months, opening 2024-01 at 3,731.97 and flooring 2024-07 at 1,193.86 (down from 2024-06's 2,047.43); 2025-01 closes the trail at 1,669.50 and 2025-02 recovers to 2,390.53. The close deck gates the page to months billing at least the 2025-01 line, so the two sub-floor months drop off — but the deltas must still be staged against the full uncut spine, or the rebound off the floor loses its base.",
      ask:
        "Return every month at or above the 1,669.50 gate with its billed revenue, prior-month revenue and MoM delta — oldest first, deltas staged against all 14 months.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, {1}) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n),\nwalk AS (\n  SELECT month,\n         revenue,\n         LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n         ROUND({2} - LAG(revenue) OVER (ORDER BY month), 2) AS mom_delta\n  FROM monthly\n)\nSELECT month, revenue, prev_revenue, mom_delta\nFROM walk\nWHERE revenue >= {3}\nORDER BY month;",
      slots: [
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the month-bucket width",
          why: "SUBSTR(created_at, 1, 7) is the '%Y-%m' spine — width IS the grain. A 4 folds the two calendar years into two buckets (30,773.25 and 4,060.03); a 10 explodes the spine into 84 day rows. The facts file buckets months at exactly this width.",
        },
        {
          answer: "revenue",
          kind: "keyword",
          label: "the delta's current-month operand",
          why: "The walk reads current minus prior: revenue minus its own LAG, so the 2024-08 rebound off the 1,193.86 floor prints +1,158.21 and 2025-02's close prints +721.03. Any other operand inverts or garbles every sign on the page.",
        },
        {
          answer: "1669.5",
          kind: "number",
          label: "the floor-line gate",
          why: "2025-01 bills exactly 1,669.50, so the boundary month survives its own gate and the figure prints as a revenue cell. The gate drops only 2024-07 (1,193.86) and 2024-11 (1,648.80) — and because it sits on the outer query, the deltas stay staged against the full 14-month spine.",
        },
      ],
      distractors: ["4", "10", "1193.86", "2390.53", "prev_revenue"],
      walkthrough:
        "Stage, walk, gate — in that order. The monthly CTE folds ROUND(SUM(total), 2) per month bucket at width 7: 14 rows from 2024-01 (3,731.97) to 2025-02 (2,390.53). The walk CTE computes LAG(revenue) OVER (ORDER BY month) as prev_revenue and the delta as the current-month operand minus it: 2024-08's rebound prints +1,158.21, 2025-02 prints +721.03, and the first row's delta is NULL by definition — there is no month before the spine's opening. The gate lives in the OUTER query, after staging, so it trims the page without touching the deltas: WHERE revenue >= 1,669.50 keeps twelve months and drops exactly 1,193.86 (2024-07) and 1,648.80 (2024-11), while 2025-01 rides the boundary at 1,669.50. The distractors each break differently: width 4 merges the spine into two year buckets (30,773.25 / 4,060.03); width 10 shatters it into 84 day rows; 1,193.86 as the gate keeps all 14 months; 2,390.53 keeps 8; and prev_revenue in the operand slot errors outright — an alias cannot be read inside the SELECT that defines it, which is the wall the CTE staging exists to avoid.",
    },
    {
      id: "cs-dropbox-4",
      tier: "hard",
      topic: "j5",
      universe: "catalog",
      title: "The dark-SKU trailing-month screen",
      brief:
        "Dropbox-flavored brief on the storefront db: the catalog pod's month-end sweep brands a plan SKU dark when the trailing month left it without a single storage line. Probed facts: the trailing month (2025-02) holds 7 seat periods that billed 2,390.53, and the catalog still lists 16 SKUs — the 199.99 Smart Watch S at the ceiling. Each dark SKU still pairs with all 7 trailing periods in the join; what it lacks is lines. The sweep has to PROVE the zero per SKU — count the lines each SKU's trailing fold attached — not read a status column, because on this catalog dark is an absence, not a flag.",
      ask:
        "Return every plan SKU with zero trailing-month storage lines — id, SKU, category, list price, trailing periods seen and lines — heaviest list price first.",
      template:
        "SELECT p.id,\n       p.name AS plan_sku,\n       p.category,\n       p.price,\n       COUNT(o.id) AS trailing_periods_seen,\n       COUNT(oi.id) AS trailing_storage_lines\nFROM products p\nLEFT JOIN orders o ON o.created_at >= '{1}'\nLEFT JOIN order_items oi ON oi.order_id = o.id AND oi.product_id = p.id\nGROUP BY p.id, p.name, p.category, p.price\nHAVING COUNT({2}) = {3}\nORDER BY p.price DESC;",
      slots: [
        {
          answer: "2025-02-01",
          kind: "keyword",
          label: "the trailing-month boundary",
          why: "The trailing month is 2025-02: 7 seat periods created on or after 2025-02-01, with the db ending 2025-02-27. Slide the boundary to 2025-01-01 and the window widens to 13 periods — the dark list collapses to the lone 59.99 speaker.",
        },
        {
          answer: "oi.id",
          kind: "keyword",
          label: "the dark-side count",
          why: "Darkness is the absence of storage LINES, so the count must run on the order_items side. COUNT(o.id) counts seat periods — 7 per SKU, never 0 — and COUNT(p.id) counts the SKU itself; either choice empties the screen.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the dark threshold",
          why: "The sweep is a proven-zero screen: the HAVING keeps the folds that counted zero trailing lines, and 0 prints in every trailing_storage_lines cell of the six-row result. A 1 rebuilds the board as one-line SKUs — the 199.99 Smart Watch S leading a different six.",
        },
      ],
      distractors: ["2025-01-01", "2025-03-01", "o.id", "p.id", "1"],
      walkthrough:
        "The anti-join is aggregate-shaped: the orders leg joins on the date alone, so every plan SKU pairs with every trailing period; the items leg attaches only lines belonging to BOTH the period and the SKU; the HAVING keeps folds that counted zero attachments. Fill 2025-02-01, oi.id and 0 and six SKUs survive, priced 119.00 down to 14.99 — Studio Desktop Mic, Cycling Jersey Pro, Bluetooth Speaker Mini, USB-C Hub 7-in-1, Ring Light 14\" and HDMI 2.1 Cable 2m — each showing trailing_periods_seen 7: the periods exist, the lines do not. The distractors each break differently: 2025-01-01 widens to a 13-period window where only the 59.99 speaker stays dark; 2025-03-01 empties the join window and brands all 16 SKUs dark; o.id counts periods (7, never 0) and empties the screen; p.id counts the SKU itself — also never 0; and a threshold of 1 returns the one-line board the sweep was built to separate from dark. The lesson: on a catalog with no dead stock all-time, darkness is a dated fold — prove the zero or do not claim it.",
    },
    {
      id: "cs-dropbox-5",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass regional utilization census",
      brief:
        "Dropbox-flavored brief on the storefront db: the growth board's utilization page is a one-pass census — every cohort's seat periods, all four license-state counts, the denominator and the rate in the same row. Probed facts: the platform pools to 52 active of 103 periods (50.5), but the cohort cut is the story — EU runs 24 active of 45 (53.3), APAC 21 of 37 (56.8), US 5 of 19 (26.3), LATAM 2 of 2 (100.0). The US cohort's 26.3 is the line provisioning has to explain: 10 of its 19 periods sit provisioned-but-unconfirmed. No four-query stack, no second pass — FILTER counts every arm inside the fold that prints the denominator.",
      ask:
        "Return per cohort: seat periods, active/provisioned/awaiting/deactivated counts in one pass, and the active share on the 0-100 scale — heaviest cohort first.",
      template:
        "SELECT region,\n       periods,\n       active,\n       provisioned,\n       awaiting,\n       deactivated,\n       ROUND({1} * active / periods, 1) AS utilization\nFROM (SELECT c.region,\n             COUNT(*) AS periods,\n             COUNT(*) FILTER (WHERE o.status = '{2}') AS active,\n             COUNT(*) FILTER (WHERE o.status = 'shipped') AS provisioned,\n             COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting,\n             COUNT(*) FILTER (WHERE o.status = 'cancelled') AS deactivated\n      FROM orders o\n      JOIN customers c ON c.id = o.customer_id\n      GROUP BY {3})\nORDER BY periods DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the 0-100 scale factor",
          why: "The multiplier promotes the ratio to real arithmetic before any integer truncation — LATAM's cell prints 100.0 only because the factor is 100.0. A 1.0 prints shares (0.5, 0.6, 0.3, 1.0) that no board expects.",
        },
        {
          answer: "delivered",
          kind: "keyword",
          label: "the active-state definition",
          why: "The funnel maps delivered = active — 24 of EU's 45 periods. Fill 'shipped' and the census rebrands the provisioned-pending-sync arm (12 in EU) as active, and every utilization cell moves with it.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the cohort grain",
          why: "The census is a regional fold — EU 45 periods down to LATAM 2, four rows heaviest-first. Fold by o.status instead and the board becomes 4 state rows where the delivered row reads 100.0 and everything else 0.0 — a census of states, not cohorts.",
        },
      ],
      distractors: ["shipped", "1.0", "c.city", "o.status"],
      walkthrough:
        "One fold, staged, then the ratio. The inner fold prints the denominator beside every arm: EU 45 periods splitting 24 active / 12 provisioned / 6 awaiting / 3 deactivated, APAC 37 into 21/8/5/3, US 19 into 5/10/3/1, LATAM 2 into 2/0/0/0. The rate is computed OUTSIDE the fold — 100.0 times active over periods, rounded to one decimal — because a SELECT cannot read its own aliases: stage the arms, then divide, printing 53.3, 56.8, 26.3 and 100.0. The pooled platform line is 52 of 103 = 50.5, which no average of the four cohort rates reproduces — the Simpson's-paradox wall the board's total row must respect. The distractors each break differently: shipped rebrands the provisioned arm as active (EU's active cell would read 12 and its rate 26.7); 1.0 prints shares no slide expects; c.city re-grains the census to 16 workspace cities; and o.status as the fold key collapses the board to 4 state rows — delivered 100.0, everything else 0.0 — answering 'what are the states' when the board asked 'who is active'.",
    },
    {
      id: "cs-dropbox-6",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The peak-workspace argmax board",
      brief:
        "Dropbox-flavored brief on the storefront db: the expansion deck crowns each region's peak workspace — the account carrying that region's largest billed value — by folding per-workspace value and joining the fold back to its own maxima. Probed facts: billed value folds to Alice Chen 7,262.35 (EU), Emma Wilson 6,640.56 (US), Grace Kim 4,574.23 (APAC) and Bruno Silva 852.44 (LATAM, a one-account cohort of 2 periods). The board ships only regions whose peak clears the APAC line — 4,574.23 — so LATAM reads as noise until it grows; the argmax join matches on VALUE, so a tie at a peak would print both workspaces rather than pick one.",
      ask:
        "Return each qualifying region's peak workspace with its billed value and the region's peak value — heaviest peak first.",
      template:
        "SELECT c.name AS workspace,\n       c.region,\n       f.billed_value,\n       p.peak_value\nFROM (SELECT o.customer_id AS ws,\n             ROUND(SUM(o.total), 2) AS billed_value\n      FROM orders o\n      GROUP BY o.{1}) f\nJOIN customers c ON c.id = f.ws\nJOIN (SELECT c2.region AS region,\n             MAX(f2.billed_value) AS peak_value\n      FROM (SELECT o2.customer_id AS ws2,\n                   ROUND(SUM(o2.total), 2) AS billed_value\n            FROM orders o2\n            GROUP BY o2.customer_id) f2\n      JOIN customers c2 ON c2.id = f2.ws2\n      GROUP BY c2.region\n      HAVING MAX(f2.billed_value) >= {2}) p\n  ON p.region = c.region AND p.peak_value {3} f.billed_value\nORDER BY f.billed_value DESC;",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the workspace fold grain",
          why: "Billed value is a per-workspace fold: GROUP BY o.customer_id folds 103 seat periods to 16 accounts. Group by o.id and the fold is per period, whose 1,088.44 ceiling can never meet a regional peak — the board empties.",
        },
        {
          answer: "4574.23",
          kind: "number",
          label: "the regional-peak gate",
          why: "4,574.23 is the APAC peak and sits in the HAVING as a boundary: Grace Kim's row survives its own threshold, and the figure prints in both the billed_value and peak_value cells. An 852.44 gate admits LATAM's single-account peak; 7,262.35 keeps only the EU crown.",
        },
        {
          answer: "=",
          kind: "keyword",
          label: "the argmax match operator",
          why: "The join-back matches fold rows whose value EQUALS the region's peak — argmax by value, tie-safe by construction. Strict > excludes every peak row on its own region and returns only the also-rans; <> is the same also-ran list.",
        },
      ],
      distractors: ["o.id", "status", "852.44", "7262.35", ">", "<>"],
      walkthrough:
        "Fold, fold, join back. The inner derived folds 103 seat periods to 16 per-workspace billed values; the peak derived refolds those 16 to one MAX per region and gates the regions — HAVING peak >= 4,574.23 keeps EU, US and APAC and drops LATAM, whose whole cohort is one account billing 852.44 across 2 periods. The join-back then matches each surviving fold row to its region's peak on VALUE: Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23 — three rows, heaviest first, billed_value equal to peak_value on every row. The distractors each break differently: o.id re-grains the fold to per-period values whose 1,088.44 ceiling never meets a regional peak, and the board empties; status folds by license state, and the workspace join finds no account behind the state names; 852.44 lets LATAM's peak onto the board (4 rows); 7,262.35 keeps only Alice; and > or <> in the match slot return the 12 also-ran workspaces instead of the peaks. Argmax-by-value is the tie policy made visible: two workspaces tied at a regional peak would both print, and the board would say so.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The seat-trial conversion funnel — awaiting-provisioning workspaces that cross to active, counted conditionally with the denominator named: the board metric Dropbox growth reviews open with." },
    { slug: "analyze-subscription-conversion", why: "LEFT JOIN + IS NULL conversion grammar — workspaces whose join finds no upgraded plan are the expansion backlog, the exact shape of the dormancy list." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-product adoption logic — workspaces with seats AND sync but no storage add-on: the attach-gap list the expansion pod works on Mondays." },
    { slug: "customers-who-bought-all-products", why: "Relational division — full-suite adoption: workspaces holding every plan SKU, the completeness check behind the 'whole-team deployment' claim." },
    { slug: "active-businesses", why: "Per-group averages against the global mean — workspaces whose storage intensity beats the platform average, the utilization flag infra staffs against." },
    { slug: "keep-latest-dedupe", why: "Keep-latest ROW_NUMBER dedupe — one current license state per workspace from a messy period history, the dedupe the seat book runs nightly." },
    { slug: "net-revenue-retention", why: "Cohort revenue retention — billed value this period versus last per workspace cohort: the NRR read storage boards price expansion on." },
    { slug: "mrr-waterfall", why: "LAG movement waterfall — new, expanded, contracted, churned billed value month over month: the growth walk the finance pod rebuilds every close." },
    { slug: "plan-migration-paths", why: "LAG tier transitions — workspaces moving basic to standard across period history: the upgrade path that justifies the plan-band catalog." },
    { slug: "usage-tier-percentiles", why: "PERCENT_RANK usage tiers — workspaces sliced into utilization bands by storage value: the tiering the capacity plan is drawn from." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — sync-day actives against weekly actives per workspace: the engagement depth read that separates heavy seats from idle ones." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Date-math within a window — workspace events within 7 days of each other: the rapid-reuse signal that a seat is genuinely deployed, not parked." },
    { slug: "week-over-week-churn", why: "Week-over-week churn walk — deactivated seats tracked as a movement rate: the early-warning line the retention pod watches." },
    { slug: "null-blank-audit", why: "Null & blank audit — workspace records missing region or plan attributes: the data-quality sweep before any cohort census is believed." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV — storage lines per seat period against the 338.19 average: the attach-depth read behind every footprint board." },
    { slug: "repeat-purchase-rate", why: "Repeat purchase rate — workspaces renewing seat periods period over period: the renewal share the seat book is actually graded on." },
    { slug: "active-users", why: "MAU at sync grain — accounts with a renewal or activation event in the trailing month, folded from period rows to account rows before anyone says 'active': the monthly-active-workspaces number the growth board prices against the 16-account installed base." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — a trailing-window distinct-count fold per account: the stickiness read that separates seats in daily sync from seats renewed but idle, and the reason trailing windows must re-fold DISTINCT at every step." },
    { slug: "find-zombie-sessions", why: "Zombie sessions — provisioned-but-never-synced seats, the dark-seat ledger: shipped_at stamped (82 of 103 periods carry one) while engagement never followed, the cohort the 30 provisioned-awaiting periods represent." },
    { slug: "dormant-reactivation", why: "Dormant reactivation risk — accounts whose renewal history went quiet without a deactivation: the winback list sitting between active and deactivated in the license funnel, ranked by days since last renewal." },
    { slug: "cohort-retention-matrix", why: "Cohort retention matrix — renewal cohorts tracked month by month after first activation: the retention curve the regional deactivation shares (APAC 8.1, EU 6.7, US 5.3) are far too coarse to draw." },
    { slug: "growth-accounting", why: "Growth accounting — new, expanded, contracted and churned billed value in one LAG pass over the month spine: the movement ledger behind the +1,158.21 rebound off the 1,193.86 floor." },
    { slug: "median-time-to-convert", why: "Median time to convert — days from trial (awaiting provisioning) to first activation stamp: the 2.98-day provisioning average retold as a conversion story, with the 2-to-4 range as the honest spread." },
    { slug: "winback-recovery", why: "Winback recovery — deactivated seats that later renewed: the recovery cohort hiding inside the 7 deactivated periods, and the churn line's only good news when it moves." },
    { slug: "server-utilization-time", why: "Storage utilization span vs sum — provisioning-to-activation spans folded without double-counting overlaps: the capacity read that treats the 2.98-day latency as load on the provisioning queue, not trivia." },
    { slug: "confirmation-rate", why: "Activation confirmation rate — provisioned seats whose first sync confirmed, per cohort: the shipped-to-delivered ratio the provisioning pod owns, and the US cohort's 26.3 utilization in the making." },
    { slug: "new-users-daily-count", why: "First-activation cohorts — accounts by the day their first seat period activated: the activation spine growth overlays onto the 2024-01 opening cohort, and the base every D-number needs." },
    { slug: "unique-orders-and-customers-per-month", why: "Two-grain month census — seat periods AND distinct accounts per month side by side: the depth-versus-breadth fold (EU runs 45 periods from 8 workspaces) at calendar grain, no double-counting." },
    { slug: "list-the-products-ordered-in-a-period", why: "Lit-SKU list — plan SKUs with at least one storage line inside the trailing month: the complement of the dark-SKU sweep, the assortment the month actually sold, date-scoped and deduped." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Heaviest renewal cadence — the account with the most seat periods (24 on this book): argmax by count, the workspace living closest to its plan ceiling and first in line for an expansion call." },
    { slug: "duplicate-charge-pairs", why: "Duplicate settlement pairs — two payment rows settling one bill: the split-settlement QA (5 split bills on this seat book) that keeps the 21-exact / 1-partial / 6-none coverage classes honest." },
    { slug: "spend-histogram", why: "Footprint histogram — accounts bucketed by billed value bands: the distribution view under the 63.5% concentration figure, showing exactly how few workspaces carry the book." },
  ],
};
