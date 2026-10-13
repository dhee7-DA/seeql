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
// all 46 sql slugs in this kit (30 topic + 16 problem) are theme-curated
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
    "Preparation strategy: the pools carry **0 tagged rows for Dropbox** — every one of this kit's 46 slugs is theme-curated to known storage-SaaS screens: two-grain seat censuses, utilization ratios, footprint ladders, dormancy anti-joins and seat-billing reconciliation. Then run both case studies on the live db: one rebuilds the storage-footprint board infra reviews on Mondays, the other rebuilds the plan-band pricing memo the catalog team prices from. The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
  ],

  dayInLife: [
    "**08:15 —** The morning starts on provisioning health. A data analyst on the infra pod opens the latency dashboard before the ops standup: did last night's provisioned cohort cross its sync threshold, does the {emerald:active} count (52 of 103) reconcile with what seat billing invoiced, and did the US cohort's latency drift again — **3.07 days** against the 2.98 platform average is the line on the slide? The first query is almost always a reconciliation — active counts versus the seat-billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:30 —** Midday is footprint surgery. The infra review wants the storage-line ladder refreshed — workspaces folded from `order_items`, gated to real footprints, ranked heaviest-first with the tie policy in the comment: 50, 46, 34, 30, then the 8-line trio sharing rank 8. A regional lead wants the two-grain census re-cut (EU: 45 periods from 8 workspaces — intensity 5.6); a capacity planner wants units and billed value side by side, because 'the workspace is busy' means nothing until lines price into value. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**16:00 —** The afternoon tilts toward the seat book and the writeup that keeps tomorrow's numbers defensible. Billing close walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected worth 15,217 — and asks the only question that matters at close: *do the classes sum back to the invoice base?* The anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the {rose:void} bill with one (#11, 925.00) — and the ledger tie prints 181,080 = 181,080. The rhythm to internalize: Dropbox SQL exists to prove that seats, storage and billing agree — *the sync event and the seat invoice are the same story told at two grains.*",
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
  ],

  topics: [
    {
      name: "Seat-census grains",
      why: "Every Dropbox screen opens with a fold: storage lines, seat periods, workspaces — grouped and counted without letting the grain blur. COUNT(*) counts lines, COUNT(DISTINCT customer_id) counts workspaces; 251 lines come from just 103 periods across 16 workspaces, and the census is where candidates prove which grain they're standing on.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "books-with-null-ratings"],
    },
    {
      name: "License-utilization ratios",
      why: "Active, provisioned, awaiting, deactivated — every utilization rate here is a conditional count over a license state, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL periods, with the 100.0 before the division, is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "hopper-company-queries-ii", "friend-requests-i-overall-acceptance-rate"],
    },
    {
      name: "Joining workspaces to seat periods",
      why: "Seat periods inherit workspace attributes through joins to the workspaces table, and the join type decides who survives: a period with no workspace is corruption; a workspace with no period is a dormant license. Choosing INNER versus LEFT is a business statement.",
      slugs: ["employee-bonus", "replace-employee-id-with-unique-identifier", "sales-person"],
    },
    {
      name: "Per-SKU storage value folds",
      why: "Storage lines carry plan SKUs and per-line prices, and the footprint story is a join-then-weigh fold: quantity × unit_price per line, billed value rolled per workspace (the top workspace carries 7,262.35 on 50 lines). The per-SKU census is what gets a plan repriced or retired.",
      slugs: ["product-sales-analysis-ii", "products-worth-over-invoices", "average-selling-price"],
    },
    {
      name: "The usage calendar",
      why: "Seat usage is calendar arithmetic: STRFTIME('%Y-%m') buckets over periods against the 3,731.97 peak and the 1,193.86 floor. Dropbox drills the month-bucket idiom because every capacity chart hangs on that spine — and a '%m'-without-year fold merges two Januaries into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Seat-count two-grain reads",
      why: "Storage SaaS growth is a two-sided read: periods per workspace (depth) against workspaces per cohort (spread). The two-grain shapes here — seat counts, active-workspace counts, depth-versus-breadth ratios — are how expansion gets measured without double-counting.",
      slugs: ["find-the-team-size", "number-of-times-a-driver-was-a-passenger", "count-student-number-in-departments"],
    },
    {
      name: "Dormancy & deactivated anti-joins",
      why: "Silence reads are anti-joins: workspaces with no recent period, seat bills with no payments (6 on this db). On this db the never-used-workspace anti-join returns 0 — and proving a confident zero is the job. The survival rule of the join IS the query.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Footprint leaderboards & tie policy",
      why: "Infra boards rank workspaces by storage lines, and ties are real: three workspaces sit at exactly 8 lines. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "second-most-recent-activity", "department-top-three-salaries"],
    },
    {
      name: "Sync-gap windows & LAG transitions",
      why: "Provisioning gaps and usage decay are window work: the gap between a workspace's sync events, the drift between consecutive periods — ordered, partitioned, NULL-aware. The 2.98-day provisioning average is itself a LAG-shaped read from order stamp to provision stamp.",
      slugs: ["biggest-window-between-events", "find-emotionally-consistent-users", "second-day-confirmation"],
    },
    {
      name: "Seat billing & cents discipline",
      why: "Storage is not revenue until the seat book closes: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where storage-SaaS interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "count-salary-categories", "ar-aging-schedule"],
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
  ],
};
