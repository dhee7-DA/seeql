// Asana — Wave-8 (Task 96), saas domain, <2 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Work-management SQL: the storefront db read as a work-graph sandbox — customers are
// workspaces, orders are subscription renewals (delivered = renewed to term, shipped =
// activated and running with shipped_at as the activation stamp, pending = rollout
// scheduled, cancelled = churned mid-term), order_items are the seat lines on each
// renewal (quantity = seats, unit_price = per-seat price). Activation funnels with
// stated populations, two-grain workspace censuses, tie-heavy engagement leaderboards,
// the 14-month renewal spine, and the billing tables (INTEGER cents) that sit under
// "renewed". Pool provenance: company-pools.md carries NO Asana section — fewer than
// 2 tagged rows and none SQL-graded — so all 10 topic slug sets and all 16 problems
// are theme-curated from the pools file's theme menu and say so. Case briefs quote
// probed figures from scripts/company-facts.md (probed 2026-10-12); every case slot
// is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const asanaKit: CompanyKit = {
  id: "asana",
  domainId: "saas",
  name: "Asana",
  tagline: "Work management graphs, tasks to goals",
  accent: "text-rose-300",

  brief: [
    "**Asana** is the work-management platform that turned coordination into a graph — tasks roll up to projects, projects into portfolios, portfolios into goals, and cross-team dependencies stitch the work across every team in a workspace. It monetizes seat by seat, so every growth number in the building is a conditional count over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are workspaces, the 103 orders are subscription renewals worth **34,833.28**, and the 251 order_items rows are seat lines — quantity = seats, unit_price = per-seat price. The status map is fixed: delivered = {emerald:renewed} (52, 50.5%), shipped = {sky:activated} (30, 29.1%), pending = rollout scheduled (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org splits into growth, monetization and a small billing-analytics pod, and they read the same spine at different grains. The activation funnel is the heartbeat: a renewal books at created_at, and `shipped_at` is stamped the day the workspace actually goes live — **82 of 103 renewals** carry the stamp, averaging **2.98 days** to activate with a 2–4 day spread, and the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with workspaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain workspace census** — EU runs 45 renewals from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a churned renewal count in your base?'*), then into the engagement leaderboard where four workspaces sit tied at 4 renewals and rank semantics become a business decision. Late rounds walk the {sky:14-month renewal spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Asana section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: activation funnels, two-grain censuses, tie-heavy leaderboards, CASE tier bands and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:activation census} growth ops opens Monday with, the other rebuilds the {sky:renewal ARR walk} finance reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "Money is its own beat, and the billing pod runs it on four tables — 28 invoices, 27 payments, 36 expenses, 80 ledger entries, all INTEGER cents — where the Monday read is reconciliation, not reporting: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth **15,217**, plus the row-level rogues — #11 void-but-debited at 925.00 and #28 paid-with-no-legs at 1,756.00. Five statement cycles settle on both card and wire legs, so the pod pre-aggregates `payments` before any join — *a fan-out you don't fold is money you invented*. The gate never moves: {emerald:181,080 debits} against {emerald:181,080 credits}, delta zero, or the close does not ship.",
    "The senior rounds go deeper than the day-one screen, and this expansion tracks them: {sky:window frames} for the trailing-ARR reads, {rose:set-op} stacks for board packets, anti-join idiom choice for the AR chases, fan-out discipline for anything touching `payments`, and the seats-versus-renewals grain check that keeps expansion math honest — **2.44 lines per renewal**, max line quantity 3. Run the four appended cases on the live db — the ladder rebuild, the never-remitted chase list, the close-day census, the seat-band fold — and keep the day-one bar: *state the population, state the denominator, reconcile by construction*.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the activation funnel refresh. A growth analyst opens the renewal dashboard before standup: did overnight bookings land, did any workspace get its `shipped_at` stamp without a rollout owner, does the one-pass status census reconcile — 52 renewed + 30 activated + 14 pending + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If activation latency drifts off the **2.98-day** norm, the rollout queue gets pulled before marketing's weekly read ships.",
    "**11:30 —** Midday is the expansion read. Customer success wants the engagement leaderboard with the four-way tie at 4 renewals handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus workspaces; a regional VP wants renewals per workspace beside workspace counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**17:45 —** The close gate gets walked one last time before the writeup goes out. The stage census has to reconcile — 52 + 30 + 14 + 7 = **103 by construction** — and the intensity column gets a second read: EU's 45-from-8 (5.6) against the US's 19-from-2 (9.5) is the concentration sentence leadership actually quotes. Then the definition log ships with the deck: *activated-only latency over its 82-row base, kept rate over all 103* — tomorrow's launch review inherits today's denominators. The last tab is always the ledger: {emerald:delta zero} or the incident template comes out.",
  ],

  metrics: [
    { name: "Activation rate", what: "Renewals with shipped_at stamped ÷ all renewals booked: 82 of 103 (79.6%). The top-of-funnel number growth reads every Monday — the 14 pending rows are 'not yet', never a silent zero." },
    { name: "Time-to-activate", what: "Booking to go-live (created_at → shipped_at) over activated renewals only: 2.98-day average, range 2–4. The population definition ships with the number — open renewals have no cycle yet and must not dilute it." },
    { name: "Renewal kept rate", what: "Delivered ÷ ALL renewals booked: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count, and the denominator — engaged rollouts included — is the whole interview." },
    { name: "Logo churn", what: "Cancelled share of booked renewals: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%. The churn cohort map that drives the winback and dunning calendars." },
    { name: "Renewal book (ARR)", what: "Total renewal value booked: 34,833.28 across 103 renewals, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 renewal outweighs the smallest 42 combined." },
    { name: "Seats per renewal", what: "Seat lines ÷ renewals: 251 order_items across 103 renewals. Expansion shows up here first — seats added mid-term are new line items, not new renewals." },
    { name: "Workspace concentration", what: "Share of the book from workspaces spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs customer success and sizes the enterprise pod." },
    { name: "Collections coverage", what: "Renewed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the billing pod refreshes every close." },
    { name: "Renewal intensity", what: "Renewals ÷ distinct workspaces per region: EU 45-from-8 reads 5.6, APAC 37-from-5 reads 7.4, US 19-from-2 reads 9.5, LATAM 2-from-1 reads 2. Load and coverage in one column — the ratio that says whether growth is broadening or concentrating." },
    { name: "Seat depth", what: "Seat lines ÷ renewals: 251 lines across 103 renewals = 2.44 lines each, max line quantity 3. Seat expansion lands at line grain first — new lines on existing renewals — before it ever lands as a new renewal." },
    { name: "Settlement clock", what: "Issue-to-first-payment over the paid book: 28.4-day average, 13 fastest, 84 slowest. The dunning calendar's tempo — statements that clear in two weeks versus three months get chased by different hands." },
    { name: "Opex burn mix", what: "The expense ledger beside the renewal book: Rent 16,800 across 14 lines, Ads 4,570 across 14, Travel 2,521 across 3, Tools 1,525 across 5. The spend side every board pack shows under the ARR walk." },
  ],

  topics: [
    {
      name: "Activation funnel counts",
      why: "Every Asana growth screen opens with the funnel: renewals booked, activated (shipped_at stamped), renewed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an activated renewal 'renewed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Renewals and workspaces are different grains of the same join, and every census here reports both: EU runs 45 renewals from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining workspaces to renewals",
      why: "Workspaces carry region and created_at; renewals inherit them through joins, and the join type decides who survives. A renewal without a workspace is corruption; a workspace without renewals is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Engagement leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 renewals each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Tier banding with CASE",
      why: "Workspace tiers are CASE-classified — enterprise, advanced, starter — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month renewal spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — activated under churned, this quarter beside last — and EXCEPT answers 'which signed workspaces never activated'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-workspace renewal counts, then judge them against a computed platform mean (6.44 here — exactly four logos clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets renewed, activated, pending and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Renewed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Window frames & trailing ARR",
      why: "Running sums and moving averages are how growth smooths the 14-month spine — and the frame IS the metric: a 3-month trailing average and a cumulative walk answer different questions. The first rows of a trailing frame compute over short windows, and the candidate who charts them at full weight invents trend at the left edge.",
      slugs: ["find-cumulative-salary-of-an-employee", "budget-pacing", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "As-of & date-math reads",
      why: "Price-as-of-activation, two renewals within seven days, golden-hour onboarding — timestamp deltas with half-open windows are the senior screens. BETWEEN's last-night trap lives here, and ISO TEXT ordering is what makes the range form both sargable and correct.",
      slugs: ["product-price-at-a-given-date", "users-with-two-purchases-within-seven-days", "find-golden-hour-customers"],
    },
    {
      name: "Anti-join idiom lab",
      why: "The AR chase is an anti-join, and there are three idioms — LEFT JOIN IS NULL, NOT EXISTS, NOT IN — with different NULL behavior and different review stories. Picking one is a correctness statement, and proving a confident zero (never-renewing workspaces) is part of the job.",
      slugs: ["sales-person", "sellers-with-no-sales", "employees-with-missing-information"],
    },
    {
      name: "Fan-out & pre-aggregation",
      why: "Five statement cycles settle on both card and wire legs — join payments raw and SUM invents money. The drill is sequencing: pre-aggregate the many side per key, then join, then verify the join's COUNT against the left table before trusting any SUM.",
      slugs: ["average-selling-price", "find-stores-with-inventory-imbalance", "warehouse-manager"],
    },
    {
      name: "Cohort activation & seat walks",
      why: "NRR cohorts and first-activation-month reads — which month's workspaces activated, which expanded seats — are first-occurrence queries over shipped_at with a cohort fold underneath. The seat walk rides the 251-line grain, not the 103-renewal grain.",
      slugs: ["game-play-analysis-iv", "new-users-daily-count", "customers-with-strictly-increasing-purchases"],
    },
  ],

  theory: [
    {
      id: "asana-t1",
      q: "Your workspace report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a renewal column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins renewals to workspaces: a renewal with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no renewals ARE the answer, arriving with NULL renewal columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-renewing workspaces, and proving that zero is itself the analyst's job: all 16 workspaces appear in the renewal table somewhere.",
      tag: "joins",
    },
    {
      id: "asana-t2",
      q: "Four workspaces tie at 4 renewals on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose customer-success pod gets headcount. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "asana-t3",
      q: "The census shows 103 renewals and 16 workspaces; EU shows 45 renewals and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts renewal rows after the join — one row per renewal, so a workspace with 24 renewals contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 renewals collapse to 8 logos. Neither is wrong: renewals measure load and seat momentum, workspaces measure installed base and coverage. The ratio — 5.6 renewals per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for seat lines and COUNT(*) silently counts seat lines, not renewals — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "asana-t4",
      q: "shipped_at is NULL until a workspace activates. What is your policy for the time-to-activate report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only activated renewals have a latency, so the report measures booking-to-go-live for the 82 of 103 renewals that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL renewals returns the activated-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the activated subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day activations for rollouts that have not started. A report whose WHERE clause is doing definitional work without saying so is exactly what an Asana reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "asana-t5",
      q: "The growth review wants renewed value per region for regions carrying at least ten renewals. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards activated, pending and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-renewal floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to renewals versus to dollars. The strong answer places every filter by asking: is this a fact about one renewal, or about a region?",
      tag: "pipeline",
    },
    {
      id: "asana-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 renewals always produce a mean (6.4375 per workspace, 6.44 rounded — exactly four logos clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each renewal to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "asana-t7",
      q: "The renewal trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is growth discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "asana-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "asana-t9",
      q: "Growth wants a 3-month trailing average of monthly renewal ARR on the 14-month spine. Write the window — and tell me what the first two rows compute.",
      a: "The frame is the metric. SUM(arr_booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) over the monthly fold gives the trailing read — and the first two rows are honest about being short: January averages itself alone, February averages two months, and only March onward is a true three-month window. Candidates who chart those early rows at full weight are the ones who ship a 'smoothing' column that invents a trend at the left edge. State the frame in the column name or the slide footer, because a trailing average and a cumulative sum answer different questions — one is momentum, the other is scale. And if the spine ever carries tied keys, RANGE would pull peers into the frame together; on a month spine that is theoretical, but at renewal grain it is a live bug worth naming.",
      tag: "frames",
    },
    {
      id: "asana-t10",
      q: "The board packet stacks 'renewed this quarter' over 'renewed last quarter', and a reviewer says a workspace row is missing. Beyond dedup, what else do you check on a set-op stack?",
      a: "Column contracts first: every branch must emit the same number of columns, in the same order, with comparable types — SQLite rejects mismatched arity outright, and it will glue a TEXT to an INTEGER where affinity lets it, which is worse because the stack looks fine. Then NULL semantics: UNION, INTERSECT and EXCEPT treat NULLs as equal when comparing tuples — one of the few places NULL equals NULL in SQL — so two branches each carrying a NULL-region row fold together instead of staying apart. And the stack takes exactly one ORDER BY, at the very end, sorting the combined set — a branch-level ORDER BY is an error in SQLite, not a hint. The packet discipline: label every branch with a literal source column so reviewers can trace which population each row came from, and prefer UNION ALL plus a stated impossibility-of-duplicates comment over a silent dedup you did not mean.",
      tag: "setops",
    },
    {
      id: "asana-t11",
      q: "Three idioms find 'invoices with no payment legs': LEFT JOIN … IS NULL, NOT EXISTS, NOT IN. Which do you reach for, and what does each do with a NULL?",
      a: "LEFT JOIN … IS NULL is the audit-friendly shape — it keeps unmatched left rows visible and counts them with the same fold as the rest of the report, which is why the AR chase uses it: 6 never-collected invoices worth 15,217, one query, reconciling upward to the coverage census. NOT EXISTS is the NULL-proof one — half-join semantics, stops at the first match, and a NULL in the inner table cannot poison it because existence is evaluated row by row. NOT IN is the fragile one: x NOT IN (list) goes UNKNOWN the moment a NULL enters the list and the whole report silently empties — safe only when the column is NOT NULL by schema or the subquery is guarded. The habit the panel wants: name the idiom, name its NULL behavior, and say which one you would defend in review. On this clean core db all three agree; staging tables are where they diverge, and staging is where empty reports ship from.",
      tag: "exists",
    },
    {
      id: "asana-t12",
      q: "Your per-region cancelled share divides by the region's renewal count. How do you keep an empty segment from either crashing the query or printing a fake zero?",
      a: "Two different problems, two different tools. Division with an empty denominator is a correctness problem: NULLIF(COUNT(*), 0) turns the zero into NULL, the rate reads NULL, and the row truthfully says 'no population, no rate' — zero cancelled out of zero renewals is not a zero percent churn rate, it is a missing segment. Printing 0 there manufactures a fact about a population that does not exist. COALESCE is the display-layer tool: COALESCE(rate, 0.0) only when the board genuinely wants blanks rendered as zeros, and only at the outermost SELECT, never buried inside the definition — hiding the empty segment from the very people who should be asking why it is empty. The rule: NULLIF guards arithmetic, COALESCE guards presentation, and neither belongs where the metric is defined.",
      tag: "nulls",
    },
    {
      id: "asana-t13",
      q: "Customer success wants each workspace's renewal ids folded into one cell for the review email. Which aggregate, and what are its sharp edges?",
      a: "GROUP_CONCAT is the fold — GROUP_CONCAT(id, ', ') over renewals grouped by workspace turns one row per id into one cell per workspace, which is exactly a dependency manifest or a chase list. The edges: order inside the fold is not guaranteed on this engine, so feed it an ordered subquery when the ids must read low-to-high and say so in the comment; the default separator is a bare comma with no space, so pass the separator explicitly; and the cell silently grows — a 24-renewal workspace produces a long cell, and downstream tools that assume short strings break in ways SQL never warns about. The deeper point is grain: the manifest is a workspace-grain cell living inside a renewal-grain report, and a reviewer who re-joins it one-to-many fans their own query back out. Name the grain in the column name or the comment.",
      tag: "concat",
    },
    {
      id: "asana-t14",
      q: "February 2025 reads 2,390.53 booked against January's 1,669.50 and everyone calls it a rebound. What is wrong with that sentence, and how do you compute the trend honestly?",
      a: "February is incomplete — the data runs to 2025-02-27, so the bucket is a partial month compared against full months, and the 'rebound' is mostly cutoff artifact. Honest trend work flags partial periods in the query or the title, or annualizes with an explicit, stated assumption — never silently. The mechanics underneath: timestamps are ISO TEXT, so lexicographic comparison does real date work — created_at >= '2025-02-01' AND created_at < '2025-03-01' is a correct half-open month window; and day-level deltas ride JULIANDAY, which returns the fractional day activation latency needs. The discipline is the same one the funnel already teaches: every time bucket carries a population statement, and a bucket whose window is clipped says so on the slide, not in a footnote the CFO reads in March.",
      tag: "dates",
    },
    {
      id: "asana-t15",
      q: "You need each workspace's renewal count ranked, with a platform-mean flag beside it. Walk me through staging the query — and why one flat SELECT cannot do it.",
      a: "Because the pipeline runs once: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — a window function or a comparison against a fold needs the fold to already exist, and a flat SELECT has nowhere to put it. So stage it: a CTE (or derived table) computes the per-workspace fold — customer_id, renewal count — and the outer query hangs RANK and the mean-comparison off it; the platform mean is 6.44 renewals per workspace on this db, exactly four logos above it. The staging layer is where correctness lives: name the stage for what it holds, keep one fold per stage, and test the inner query alone before the outer one. SQLite inlines CTEs rather than materializing them, so a stage referenced twice re-computes twice — fine at this scale, worth knowing at scale. The failure mode of skipping the stage is mixing grains: a renewal-count column next to a platform-mean column that silently restarts per group.",
      tag: "staging",
    },
    {
      id: "asana-t16",
      q: "The ops board wants renewed, activated, pending and churned counts per region in one scan. FILTER or SUM(CASE) — and what makes either version trustworthy?",
      a: "Both are one-pass conditional folds: COUNT(*) FILTER (WHERE status = 'shipped') and SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) produce the same numbers — FILTER reads like prose and is the modern shape; SUM(CASE) is the portable twin that folds non-count aggregates just as cleanly. What makes either trustworthy is the identity: renewed + activated + pending + churned must equal COUNT(*), 103 on this db, by construction — if the branches drift from the total, a status is misspelled or an arm is missing, and the census catches it instead of the board meeting. The habit it replaces is four sequential queries with four WHERE clauses: four chances to drift four populations. State the identity in the query comment; a census that reconciles is the cheapest data-quality gate the team owns, and the close gate here is exactly that check run per region.",
      tag: "census",
    },
    {
      id: "asana-t17",
      q: "A staging payment feed lands with duplicate legs — same invoice, same paid_on, same cents. How do you detect and remove duplicates without losing a legitimate split?",
      a: "Detection first: GROUP BY the full business key — invoice_id, paid_on, amount_cents — HAVING COUNT(*) > 1, and read the hits before deleting anything, because the definition of duplicate decides the answer. A true duplicate is identical on every column; a legitimate split shares an invoice but differs on paid_on, method or amount — this db has 5 statement cycles settling on both card and wire legs, and a naive dedupe on invoice_id would erase real money. Removal is a staging pattern: ROW_NUMBER() OVER (PARTITION BY the business key ORDER BY a deterministic tiebreaker) in a CTE, keep rn = 1 — and because window functions run after WHERE, the rn filter must live in an outer query, which is exactly the staging structure. The comment names the business key; six months from now that comment is the only thing standing between the feed and a silent dedupe of real legs.",
      tag: "quality",
    },
    {
      id: "asana-t18",
      q: "Define NRR for this book, then tell me which grain the query has to run at.",
      a: "Net revenue retention walks a cohort of renewals from one period to the next: opening ARR, kept ARR, plus expansion, minus contraction, over the opening base — 52 of 103 renewals renew to term here, and the seats tell the rest of the story. The grain is the trap: expansion is seat lines, not renewals — a workspace adds seats mid-term as new order_items on an existing renewal, 251 lines across 103 renewals at 2.44 lines per renewal — so an NRR query at renewal grain reads flat while the business grows. Stage it: cohort the opening renewals, join their renewal-grain ARR, then fold line-grain seat deltas per renewal before the ratio. The number the board manages is a ratio of two populations — the kept cohort, and the same cohort after seats moved — and both populations must be named in the query or the metric becomes whatever the join happened to produce. Denominator: opening cohort. Always.",
      tag: "kpi",
    },
    {
      id: "asana-t19",
      q: "The monthly report scans orders with WHERE SUBSTR(created_at, 1, 7) = '2024-07'. What do you say when someone calls it slow — and does it matter at this scale?",
      a: "The honest answer has two layers. The instinct layer: wrapping the column in a function — SUBSTR, UPPER, CAST — defeats any index on created_at, because the predicate is no longer a range the index can seek; the sargable rewrite is half-open — created_at >= '2024-07-01' AND created_at < '2024-08-01' — same bucket, seekable. The scale layer: on 103 rows it is immeasurable, and saying so out loud is the senior move — spending a review cycle optimizing a full scan of ten rows is how teams learn to ignore performance advice. What carries at this scale is the habit: write the range form because it is also the correct boundary form (no last-night BETWEEN trap), and reach for EXPLAIN when a report goes from instant to slow, not before. Performance discipline is proportionality plus the right default shape.",
      tag: "performance",
    },
    {
      id: "asana-t20",
      q: "You join invoices to payments to report collected dollars and the total comes back 69,612 — but the exact-covered book is 65,612. What happened and what is the fix?",
      a: "Fan-out. Five statement cycles on this book settle on both card and wire legs — 27 payment rows against 28 invoices — so the join duplicates each multi-leg invoice once per leg, and SUM over the joined rows counts the invoice's amount once per leg, inventing money. The fix is sequencing, not cleverness: pre-aggregate payments to invoice grain first — invoice_id, SUM(amount_cents), leg count — then join that one-row-per-invoice fold to the invoices table, and SUM the folded column. The check that catches it next time: run COUNT(*) on the join and compare against the left table's row count before trusting any SUM — 28 joined rows against 28 invoices means clean, 33 means five statements doubled. Fold-then-join is the default order for one-to-many money joins; join-then-fold is only safe once you have proven the many side is actually one.",
      tag: "fanout",
    },
    {
      id: "asana-t21",
      q: "For churn-risk work, you want each renewal's gap to the NEXT renewal for the same workspace. Write it — and tell me what the last row means.",
      a: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) hangs the next booking beside the current one, and the gap is JULIANDAY(next) - JULIANDAY(current) — per workspace, not per table, which is why PARTITION BY is non-negotiable: without it the 'next renewal' belongs to whichever workspace booked next, and the gap column measures nothing. The last row of every partition carries a NULL next value — no further booking — and that NULL is the honest state 'still open', the same baseline rule as the month spine's first LAG: never coalesce it to zero, because zero days means re-booked the same day. Two habits finish the answer: order by created_at, id so tied timestamps resolve deterministically, and state the population — all 103 booked renewals, every status — because a filtered version measures gaps only for survivors, which is survivorship bias wearing a window function.",
      tag: "windows",
    },
    {
      id: "asana-t22",
      q: "Workspace names arrive from an export as 'acme corp', 'Acme Corp' and ' ACME CORP '. What is your hygiene pass before these names join anything?",
      a: "Normalize at the read layer, once, in a CTE everyone reuses: TRIM the whitespace, UPPER or LOWER to one case, and only then join — because 'acme corp' and 'Acme Corp' are one workspace wearing two strings, and an un-normalized join splits it in two, splitting its 24 renewals with it. The same pass covers month keys — SUBSTR(created_at, 1, 7) is a text slice, and '2024-1' would sort after '2024-02' if zero-padding ever slipped, which is why STRFTIME's '%Y-%m' is the key shape. CAST is the other edge: numeric-looking TEXT does not sort or compare like the number it looks like, so cast explicitly at the boundary and never rely on affinity to guess. The rule the panel wants: text hygiene is a correctness pass, not cosmetics — it runs before joins, it is named in the comment, and it never mutates the source.",
      tag: "text",
    },
    {
      id: "asana-t23",
      q: "AVG(unit_price) over the trusted-bench suppliers reads 139.66 and 72. A colleague computes a 'weighted' version and gets 133.55 and 62.59. Who is right?",
      a: "Both — they are measuring different grains, and the interview answer is naming the grain before defending the number. The 139.66/72 pair averages supplier rows: each supplier's mean listing price, averaged across suppliers — Nordic's three listings count once. The 133.55/62.59 pair is lines-weighted: every order line pulls its unit_price in, so a component bought forty times weighs forty times more than one bought once — the honest platform read if the question is 'what does the average buyer pay', and the wrong one if the question is 'what does the average supplier list'. The shapes: AVG(price) at supplier grain, SUM(qty * unit_price) / SUM(qty) at line grain. SQLite gives you AVG and makes you build the weighted mean yourself — which is exactly why the grain statement belongs in the query comment and on the slide, not in the follow-up question.",
      tag: "aggregation",
    },
    {
      id: "asana-t24",
      q: "Expansion is up — or is it? Renewals are flat at 103, but seat lines went 231 to 251. Where does seat expansion actually live in this schema, and how do you report it?",
      a: "At the line grain, not the renewal grain. A workspace that adds seats mid-term does not book a new renewal — it adds order_items rows on the existing one: quantity is seats, unit_price the per-seat price, and the 251 lines across 103 renewals at 2.44 lines per renewal, max line quantity 3, are the expansion ledger. The report discipline follows: renewals and seat lines ship as two separate columns at two named grains — the two-grain census habit — never blended into one count, and never inferred by dividing money by an assumed price. When the ask is growth, the line delta over time is the expansion curve; when the ask is pricing, the per-line unit_price bands — the 55.00 edge splitting 268 seats at 31.01 from 230 at 115.85 — are the tiering story. Candidates who blend the grains produce one number that answers neither question; candidates who pass produce two numbers and say which is which.",
      tag: "grain",
    },
  ],

  mcqs: [
    {
      id: "asana-mcq-1",
      prompt: "A renewal row's status reads 'delivered'. In this kit's Asana stage map, what happened?",
      choices: ["Renewed — the term completed and counts as kept", "Activated — running, not yet renewed", "Churned — cancelled mid-term", "Rollout scheduled — activation pending"],
      answer: 0,
      why: "The stage map is fixed: delivered = renewed (52 of 103 renewals, 50.5%). It is the only status where the term has actually completed.",
      notes: [
        { choice: 1, why: "Activated is 'shipped' — 30 renewals live but not at term end. Calling them renewed inflates the kept rate before a single contract finishes." },
        { choice: 3, why: "Rollout-scheduled is 'pending' — 14 renewals with no shipped_at yet. Pending is not churn and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-2",
      prompt: "Activation rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 activated, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Activated + cancelled only (82/89 = 92.1%)", "All renewals booked (82/103 = 79.6%)", "Delivered renewals only (52/82)", "Distinct workspaces (82/16)"],
      answer: 1,
      why: "The house definition: activated ÷ ALL renewals booked — pending rollouts stay in the denominator because 'not yet activated' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still in rollout — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, shipped_at is activation. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-3",
      prompt: "EU carries 45 renewals from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts renewal rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 renewals per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every renewal has a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not workspaces — a third grain nobody asked for. The census is renewals AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled renewals only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the churn map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-5",
      prompt: "Keep only workspaces carrying at least 10 renewals. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 10", "WHERE renewals >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A renewal-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 renewals — clears a 10-renewal bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'renewals' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 renewals, then FOUR workspaces tied at 4. Under RANK, what rank do the two 3-renewal workspaces carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-renewal workspaces share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending renewals double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the activated-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 renewals.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-8",
      prompt: "A staging-table churn list uses workspace_id NOT IN (SELECT customer_id FROM renewals WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every renewal carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-9",
      prompt: "A board stack puts activated renewals under churned renewals in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no region or branch label — collapse into one, and the board loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-10",
      prompt: "A dashboard walks booked ARR renewal by renewal: SUM(renewal_value) OVER (ORDER BY booked_at). Two renewals share a booked_at second, and the cumulative 'jumps two renewals at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on booked_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at renewal grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-11",
      prompt: "The 2025-02 bucket reads 2,390.53 booked versus 2025-01's 1,669.50, and the room calls a rebound. What must the analyst check about the February bucket first?",
      choices: ["Whether the February window is clipped — the data runs only to 2025-02-27, so the month is partial", "Whether ROUND was applied to the revenue column before the monthly fold", "Whether cancelled renewals were excluded from both months' sums", "Whether the month key came from STRFTIME instead of SUBSTR"],
      answer: 0,
      why: "The spine runs 2024-01 to 2025-02-27 — February is a clipped bucket compared against full months, so the 'rebound' is mostly cutoff artifact. Partial periods get flagged on the slide or annualized with a stated assumption, never silently compared.",
      notes: [
        { choice: 1, why: "ROUND is presentation, not population — it cannot change which rows land in a bucket. The bias lives in the window's end date, not the digits." },
        { choice: 2, why: "Cancelled renewals are 7 of 103 with 0-2 per month — excluding them redefines the metric, it does not repair a clipped window. Both months' definitions must match AND both windows must be complete." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-12",
      prompt: "A per-segment churn share divides by the segment's renewal count, and one segment's filter returns zero rows. Which expression keeps the report alive and honest?",
      choices: ["CASE WHEN COUNT(*) = 0 THEN 0 ELSE 100.0 * SUM(flag) / COUNT(*) END — empty segments read 0%", "100.0 * SUM(flag) / NULLIF(COUNT(*), 0) — the rate prints NULL, meaning 'no population'", "100.0 * SUM(flag) / COALESCE(COUNT(*), 1) — one is a safe default denominator", "Filter out empty segments in WHERE so the division never sees a zero"],
      answer: 1,
      why: "NULLIF(COUNT(*), 0) makes the rate NULL for an empty population — the honest read: no renewals, no rate. Printing 0% invents a fact about a segment that has no data at all.",
      notes: [
        { choice: 0, why: "The CASE prints 0% for empty segments — a defined lie. Zero churn out of zero renewals is not a churn rate; it is a missing population wearing a number." },
        { choice: 2, why: "A default denominator of one manufactures a rate out of nothing. NULLIF guards arithmetic; COALESCE belongs at the display layer, if anywhere." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-13",
      prompt: "For the review email, each workspace's renewal ids must fold into a single comma-separated cell. Which aggregate does that in one pass?",
      choices: ["GROUP_CONCAT(id, ', ') over rows grouped by workspace", "CONCAT_WS(', ', id) over rows ordered by workspace", "STRING_AGG(DISTINCT id) — the SQLite spelling of the same fold", "SUM(id) with a CAST to TEXT so the ids read as a string"],
      answer: 0,
      why: "GROUP_CONCAT(id, ', ') is SQLite's fold-to-string: one row per workspace, every id in one cell. The separator is passed explicitly because the default is a bare comma with no space.",
      notes: [
        { choice: 1, why: "CONCAT_WS is not SQLite — the spelling fails here. And a scalar string function cannot fold a group: aggregates fold, scalars shape." },
        { choice: 3, why: "SUM adds the ids into one number — a checksum, not a manifest. The ids are a list, and lists need GROUP_CONCAT." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-14",
      prompt: "A board stack runs 'this quarter's renewed workspaces' EXCEPT 'last quarter's renewed workspaces' and the query errors before returning a row. Most likely cause?",
      choices: ["EXCEPT requires both branches to select the same number of columns, aligned by position", "EXCEPT cannot compare two queries over the same table", "EXCEPT needs DISTINCT written in every branch", "EXCEPT only works on numeric columns"],
      answer: 0,
      why: "Set ops compare tuples positionally: same column count, comparable types, same order. An arity mismatch is a hard parse-time error — the stack never runs at all.",
      notes: [
        { choice: 1, why: "EXCEPT between two queries on the same table is the textbook shape — 'signed but never activated' is exactly this. The failure is shape, not source." },
        { choice: 2, why: "Set ops dedupe by default; DISTINCT is implied in UNION, INTERSECT and EXCEPT. Writing it changes nothing about arity." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-15",
      prompt: "Which operator returns workspaces that BOTH activated at some point AND churned at some point — membership in both populations?",
      choices: ["INTERSECT", "UNION", "EXCEPT", "CROSS JOIN"],
      answer: 0,
      why: "INTERSECT keeps rows present in both sets — the 'activated AND churned' population. UNION is either-or; EXCEPT is in-the-first-not-the-second; CROSS JOIN pairs rows, it does not intersect them.",
      notes: [
        { choice: 1, why: "UNION answers 'activated OR churned' — a bigger set that includes workspaces with only one of the two flags." },
        { choice: 3, why: "CROSS JOIN multiplies — every activated row paired with every churned row. It builds combinations, not overlap." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-16",
      prompt: "Collected dollars are reported by joining invoices to payments and summing — but 5 of the 28 invoices settle on both card and wire legs. What does the raw join do to the sum?",
      choices: ["Nothing — SUM collapses duplicate invoices automatically", "It counts each multi-leg invoice once per leg, overstating collected dollars — pre-aggregate payments to invoice grain, then join", "It undercounts by the number of wire legs", "It errors — SQLite refuses to aggregate over a joined one-to-many"],
      answer: 1,
      why: "27 payment legs against 28 invoices means the join fans out: a two-leg invoice appears twice, and SUM(amount_cents) counts its full amount twice. The fix is sequencing — fold payments per invoice first, then join the one-row-per-invoice aggregate.",
      notes: [
        { choice: 0, why: "SUM never deduplicates rows — it adds what the join hands it. The 69,612 leg-level total versus the 65,612 exact-covered read is exactly this gap." },
        { choice: 2, why: "The bias is upward, not downward — every extra leg duplicates the invoice's amount. Undercounting would require losing rows, and joins never do that silently." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-17",
      prompt: "A payment feed has duplicate legs. Someone writes ROW_NUMBER() OVER (PARTITION BY invoice_id, paid_on, amount_cents ORDER BY method) AS rn … WHERE rn = 1 in one flat SELECT. What breaks?",
      choices: ["Nothing — window functions evaluate before WHERE, so the filter works inline", "The WHERE fails — window functions run after WHERE, so the rn filter must live in an outer query or CTE", "ROW_NUMBER cannot take multiple partition columns", "The engine silently rewrites it as DISTINCT and the dedupe is lossy"],
      answer: 1,
      why: "Windows run after WHERE in the pipeline — rn does not exist yet where the filter sits. The pattern is ROW_NUMBER in a CTE or derived table, then SELECT … WHERE rn = 1 outside it.",
      notes: [
        { choice: 0, why: "That is the classic stage-order mistake: WHERE runs first, windows after SELECT, ORDER BY last. The filter errors on an unknown column — or ports to an engine with different semantics." },
        { choice: 2, why: "PARTITION BY takes a column list fine — invoice_id, paid_on, amount_cents is exactly how a business key is defined for the dedupe." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-18",
      prompt: "A monthly report filters WHERE SUBSTR(created_at, 1, 7) = '2024-07'. What is the sargable rewrite — and why bother on 103 rows?",
      choices: ["WHERE created_at >= '2024-07-01' AND created_at < '2024-08-01' — half-open range keeps the column bare so an index can seek; at this scale it is habit-building, not speed", "WHERE strftime('%Y-%m', created_at) = '2024-07' — that function is index-friendly", "WHERE created_at LIKE '2024-07%' with a leading wildcard — LIKE is always optimized", "WHERE created_at BETWEEN '2024-07-01' AND '2024-07-31' — BETWEEN is the sargable form"],
      answer: 0,
      why: "Wrapping the column in a function defeats any index; the half-open range predicate keeps created_at bare and seekable — and it is also the correct boundary shape, with no last-night clip. On 103 rows the win is the habit, and saying so is the senior part of the answer.",
      notes: [
        { choice: 3, why: "BETWEEN '2024-07-01' AND '2024-07-31' drops the last night's bookings — renewals land at month ends, exactly where the clip bites. Half-open is sargable AND correct." },
        { choice: 1, why: "strftime is still a function on the column — same scan, prettier spelling. Sargability is about leaving the column bare, not which function you call." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-19",
      prompt: "Churn-risk work wants each renewal's gap to the NEXT renewal for the same workspace. Which window is correct — and what does the last row's NULL mean?",
      choices: ["LEAD(created_at) OVER (ORDER BY created_at) — table-wide next booking; NULL means the table is exhausted", "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) — next booking per workspace; the partition's last row reads NULL: still open", "LAG(created_at) OVER (PARTITION BY customer_id) — prior booking; NULL means the gap is unknown", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) — self-join the result back for the gap"],
      answer: 1,
      why: "PARTITION BY confines 'next' to the same workspace; LEAD fetches the following booking; ordering by created_at, id breaks timestamp ties deterministically. The final row per workspace has no next booking — NULL is the honest 'still open', never coalesce it to zero.",
      notes: [
        { choice: 0, why: "Without PARTITION BY, the 'next renewal' can belong to a different workspace — the gap measures nothing. That NULL is a table artifact, not a workspace state." },
        { choice: 3, why: "ROW_NUMBER plus a self-join is the pre-window work-around: two scans, a join to get wrong, zero frame guarantees. LEAD is the primitive built for exactly this." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-20",
      prompt: "The trusted bench (rating >= 4.5) reads 139.66 and 72 as supplier-row average listing prices. A colleague's lines-weighted version reads 133.55 and 62.59. Which statement is correct?",
      choices: ["The colleague is wrong — AVG is the definition of average price", "Both are right at different grains: 139.66/72 average supplier rows; 133.55/62.59 weight every order line, so high-volume components dominate", "The difference is rounding — both queries compute the same quantity", "Lines-weighted averages are invalid because order lines are not independent observations"],
      answer: 1,
      why: "Grain decides. Averaging supplier rows treats Nordic's three listings the same as Alpine's two; weighting by lines lets a component bought forty times outweigh one bought once — the honest 'what buyers actually pay' read, and a different question from 'what suppliers list'. Name the grain, then defend the number.",
      notes: [
        { choice: 0, why: "AVG(unit_price) is A grain — the supplier-row mean. The weighted mean is not a correction of it; it answers a different question, and both belong in the toolkit." },
        { choice: 2, why: "Six points of gap (139.66 vs 133.55) is not rounding — it is weighting. The cells only coincide when volumes are uniform, which no catalog is." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-21",
      prompt: "You need each workspace's renewal count ranked, with the platform mean (6.44) flagged beside it. Why does this take two stages — and what are the stages?",
      choices: ["One SELECT suffices: compute COUNT(*) and the mean in the same GROUP BY, then rank", "Stage 1: a CTE folds renewals per workspace; stage 2: the outer query hangs RANK and the mean-comparison off the fold — the fold must exist before it can be judged", "Stage 1: rank in a subquery; stage 2: GROUP BY the ranks", "Two stages are only needed when the result exceeds 1,000 rows"],
      answer: 1,
      why: "The pipeline runs once: a flat SELECT cannot compare an aggregate to another aggregate at a different grain. Stage the per-workspace fold, then rank and flag against the platform mean — 6.44 renewals per workspace, exactly four logos above it — in the outer query.",
      notes: [
        { choice: 0, why: "Mixing COUNT(*) per workspace with the all-workspace mean in one GROUP BY produces one workspace's mean repeated — a grain error, not a shortcut." },
        { choice: 2, why: "Grouping by ranks inverts the pipeline — the rank needs the fold first. Stages go fold → judge, never judge → fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-22",
      prompt: "The ops census must return renewed, activated, pending and churned per region in ONE scan. Which branch shape counts the activated stage?",
      choices: ["COUNT(*) FILTER (WHERE status = 'shipped')", "COUNT(status = 'shipped')", "COUNT(*) WHERE status = 'shipped'", "SUM(status) WHERE status = 'shipped'"],
      answer: 0,
      why: "FILTER (WHERE …) is the one-pass branch: each aggregate keeps only the rows passing its predicate, all branches sharing the same scan. The census identity — stages summing to COUNT(*), 103 by construction — makes it self-checking.",
      notes: [
        { choice: 1, why: "COUNT(expr) counts non-NULL results — status = 'shipped' evaluates 0/1, never NULL, so it counts every row. The condition does not filter; it just evaluates." },
        { choice: 2, why: "WHERE cannot attach to an aggregate mid-SELECT — it filters whole rows before grouping, killing the other branches. One-pass means FILTER or SUM(CASE), not four queries." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-23",
      prompt: "A CASE bands activation latency: fast under 3 days, standard 3 to 4, everything else. Where does the not-yet-activated population (shipped_at IS NULL, 14 pending rows) land?",
      choices: ["In 'everything else' automatically — NULL fails both earlier arms, so the final ELSE catches it", "Nowhere — NULL rows vanish from CASE output entirely", "In whichever arm compares equal to NULL", "The query errors — CASE cannot evaluate NULL comparisons"],
      answer: 0,
      why: "NULL >= 3 and NULL < 3 both read UNKNOWN, so a pending row falls through every comparison arm into the final ELSE — the band exists, but it is 'unclassified', not 'standard'. Naming that arm explicitly (WHEN shipped_at IS NULL THEN 'not_activated') is the honest census.",
      notes: [
        { choice: 1, why: "CASE never drops rows — every row takes some arm. Rows vanish only if you FILTER or WHERE them out first, which is a population decision, not CASE mechanics." },
        { choice: 2, why: "Nothing equals NULL — not even NULL. An arm like WHEN latency = NULL is dead code; the NULL test is IS NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-24",
      prompt: "The leaderboard splits the four-way tie at 4 renewals with ROW_NUMBER. What makes the split defensible in review?",
      choices: ["Nothing — ROW_NUMBER should never be used with ties", "A named, deterministic tiebreaker in the ORDER BY — renewals DESC, then created_at ASC, then id — written in the query comment as the policy", "Ordering by customer_id DESC so the largest workspace id wins", "Random ordering is acceptable because ties have no business meaning"],
      answer: 1,
      why: "ROW_NUMBER forces a policy the business never voted on — so the policy must be named and deterministic: renewals DESC, then a stable secondary key, then id as the final guarantee. The comment turns an arbitrary split into an auditable rule.",
      notes: [
        { choice: 0, why: "ROW_NUMBER is legitimate — pagination and 'pick one' asks need it. What is indefensible is an unnamed split that flips when the engine's scan order changes." },
        { choice: 2, why: "customer_id is arbitrary too — and the deeper bug is determinism: without a final unique key (id), 'equal' rows can still flip between runs. Deterministic means every position is reproducible." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-25",
      prompt: "The board pack appends a grand-total row to the regional renewal table using UNION ALL with a 'TOTAL' literal. Why UNION ALL — and what column discipline does the total row demand?",
      choices: ["UNION ALL is faster; the total row can carry fewer columns because it is last", "UNION ALL preserves both branches exactly — and the total row must match the detail row's column count and types, with a placeholder in the region column, or the stack misaligns", "UNION would be wrong only because it sorts the output; UNION ALL keeps the total on top", "Either works — the difference is purely stylistic"],
      answer: 1,
      why: "UNION ALL keeps every row from both branches — no silent dedup of a detail row that happens to equal the total. The stack aligns tuples positionally: the grand row needs the same column count and types, a placeholder where the region goes, and a literal label that lets reviewers tell detail from total.",
      notes: [
        { choice: 2, why: "UNION ALL does not sort anything — ordering comes from the stack's single trailing ORDER BY. The reason for UNION ALL is correctness (no dedup), not sequence." },
        { choice: 0, why: "Fewer columns in the total row is a parse-time arity error — set ops align positionally. 'Faster' is true but irrelevant next to a stack that will not run." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-26",
      prompt: "Billing needs the never-collected statements — invoices with zero payment rows (6 of them, worth 15,217). Which query is the audit-grade shape?",
      choices: ["invoices LEFT JOIN payments … WHERE p.id IS NULL", "invoices INNER JOIN payments … WHERE COUNT(p.id) = 0", "invoices CROSS JOIN payments … WHERE p.invoice_id IS NULL", "SELECT * FROM invoices WHERE NOT IN (SELECT invoice_id FROM payments)"],
      answer: 0,
      why: "LEFT JOIN … IS NULL keeps every statement and surfaces the unmatched ones — it composes with the rest of the report and counts with the same fold. It is the shape the AR chase and the 15,217 read are built on.",
      notes: [
        { choice: 1, why: "INNER JOIN drops the very rows you are hunting — unmatched invoices have no payment row to join. An aggregate in WHERE is not even valid there." },
        { choice: 3, why: "NOT IN without a column is a syntax error — and written correctly, NOT IN over a nullable column is the silent-empty trap: one NULL in the subquery and the report returns nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-27",
      prompt: "MIN(created_at) on the renewals table returns '2024-01-01'. Why does a text min work as a date min here?",
      choices: ["ISO-8601 strings sort lexicographically in the same order as the dates they encode", "SQLite detects date-shaped text and casts it automatically on aggregates", "MIN always converts to Julian day before comparing", "It only works because every timestamp also carries a time component"],
      answer: 0,
      why: "Fixed-width ISO text compares character by character into true chronological order — '2024-01-01' < '2024-02-27' as strings and as dates. That is why TEXT stamps make BETWEEN and range predicates safe on this spine.",
      notes: [
        { choice: 1, why: "There is no implicit date detection — the ordering falls out of lexicographic comparison, which is also why a non-ISO format like '01/02/2024' would break it." },
        { choice: 3, why: "The time component is irrelevant — date-only ISO strings order correctly too. What matters is fixed-width, zero-padded, big-endian format." },
      ],
      difficulty: "easy",
    },
    {
      id: "asana-mcq-28",
      prompt: "Find the second-highest DISTINCT renewal total (the ladder tops out at 1,088.44). Which shape answers honestly?",
      choices: ["SELECT MAX(total) FROM orders WHERE total < (SELECT MAX(total) FROM orders) — largest total strictly under the top; tie-proof by construction", "SELECT total FROM orders ORDER BY total DESC LIMIT 1 OFFSET 1 — OFFSET skips duplicate values correctly", "SELECT MAX(total) FROM orders — the second-highest is implied by the aggregate", "SELECT MIN(total) FROM orders WHERE total >= (SELECT AVG(total) FROM orders) — the smallest above-average total is the second-highest by definition"],
      answer: 0,
      why: "The WHERE-below-the-max shape computes the largest total strictly under the top — tie-proof, and NULL-safe when the inner fold has no second value (everything reads NULL, the honest 'no second value'). The 1,088.44 top is unique here, but the shape is the point.",
      notes: [
        { choice: 1, why: "OFFSET skips the second ROW, not the second VALUE — a tie at the top pushes the true second value to OFFSET 2, and the answer moves with tie structure." },
        { choice: 3, why: "The smallest above-average total is a different statistic — against a 25.47 to 1,088.44 spread with a 338.19 mean, it lands nowhere near the second-highest value." },
      ],
      difficulty: "medium",
    },
    {
      id: "asana-mcq-29",
      prompt: "A 3-month trailing average runs SUM(arr) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) on the 14-month spine. What do the first two rows compute — and what do you do about it?",
      choices: ["They error — the frame needs three rows to exist", "They compute over short windows — one row, then two; the honest treatment is labeling them partial or starting the series at month three, never silently charting them as full averages", "They wrap around to the last two months of the prior year", "They repeat the third row's value — SQLite backfills short frames"],
      answer: 1,
      why: "A frame is bounded by the rows that exist: January averages itself, February averages two months, March onward is a true three-month window. A smoothing column that charts those partials at full weight invents trend at the left edge — label the partials or start at month three, and say which on the slide.",
      notes: [
        { choice: 0, why: "Frames clip to available rows — no error. The danger is the opposite: a clean-looking number from a window you did not know was short." },
        { choice: 3, why: "Nothing backfills — windows carry no state across the frame edge. Assuming backfill is how a partial month becomes a fake plateau." },
      ],
      difficulty: "hard",
    },
    {
      id: "asana-mcq-30",
      prompt: "Platform average renewal value is 338.19. A dashboard flags workspaces 'above platform average' using the AVG of per-workspace averages. Why can that flag the wrong workspaces?",
      choices: ["It cannot — the average of averages equals the platform average", "The mean of per-workspace means weights every workspace equally, while the platform mean weights every renewal — with renewal counts running 1 to 24 per workspace, the two diverge and the flag drifts", "The difference is only rounding at the second decimal", "AVG ignores NULLs, which is what causes the drift"],
      answer: 1,
      why: "Mean-of-means is an unweighted read over 16 workspaces; the platform mean folds 103 renewals. One workspace with 24 renewals moves the platform mean 24 times as much as a one-renewal workspace — the two numbers differ, and 'above average' flips for logos sitting between them. Fold first, then compare against the fold.",
      notes: [
        { choice: 3, why: "NULL handling is real but incidental here — totals are never NULL on this book. The drift is weighting, and it exists even in a perfectly clean table." },
        { choice: 0, why: "They coincide only when every group carries equal weight — 16 workspaces holding 1 to 24 renewals is the textbook case where they split." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-asana-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The activation census",
      brief:
        "Asana-flavored brief on the storefront db: Monday's growth review opens with the activation census — renewals booked, distinct workspaces covered, and average days from booking to activation — and growth ops is explicit that the latency average is computed over activated renewals only, with the population stated on the slide. Probed facts: 103 renewals worth 34,833.28; 82 activated (shipped_at stamped), averaging 2.98 days with a 2–4 day spread; the regional split reads EU 36 activations from 8 workspaces at 2.94 days, APAC 29 from 5 at 2.93, US 15 from 2 at 3.07, LATAM 2 from 1 at 3.5. The review reads biggest activation count first.",
      ask: "Return each region with its activated renewal count, distinct workspace count and average activation days to 2 decimals, biggest activation count first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS activations,\n       COUNT({1} o.customer_id) AS workspaces,\n       ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), {2}) AS avg_activation_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS {3} NULL\nGROUP BY c.region\nORDER BY activations {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the workspace deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat renewals back to workspaces: EU reads 8, not 36. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the latency precision",
          why: "Latency reports to 2 decimals — EU's 2.94. ROUND(…, 1) prints 2.9 and the regional map stops reconciling with the 2.98-day platform average growth ops quotes on the same slide.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the activation guard",
          why: "shipped_at IS NOT NULL keeps only the 82 activated renewals — the 14 pending have no stamp yet and no latency to average. Dropping NOT flips the filter to IS NULL and the census suddenly reads the 21 never-activated rows instead.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest activation count on top: EU 36, APAC 29, US 15, LATAM 2. ASC would open the meeting on LATAM's 2 activations — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "NULL"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every renewal to its workspace's region — the WHERE keeps only the 82 activated rows — and GROUP BY region folds them into four rows where COUNT(*) reads activations (36 / 29 / 15 / 2), COUNT(DISTINCT o.customer_id) reads workspace coverage (8 / 5 / 2 / 1), and ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) reads latency (2.94 / 2.93 / 3.07 / 3.5) — all straight from the probed census, reconciling upward to the 2.98-day platform average over the stated 82-row population. The 14 pending renewals never enter: no stamp, no activation, no latency. The distractors fail honestly: SUM in the workspace slot adds customer ids together and MAX reports the largest id — a census of nothing; 1 in the precision slot truncates to one decimal so the map drifts off the 2.98 average; dropping NOT flips the filter to IS NULL and the deck suddenly counts the 21 never-activated rows; ASC opens the review on LATAM. The two-grain pairing is the read: EU's 36-from-8 (4.5 activations per workspace) versus the US's 15-from-2 (7.5) says US activation is concentrated while EU's is broad — one query, two business claims.",
    },
    {
      id: "cs-asana-2",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The renewal ARR walk",
      brief:
        "Asana-flavored brief on the storefront db: the finance-facing growth board wants the monthly renewal spine — ARR booked per month, churned renewals per month, and the month-over-month step delta — with the first month's delta left NULL, not zero, because there is no prior month to compare. Probed facts: the spine runs 2024-01 to 2025-02 (14 buckets, every month carrying 6–9 renewals); the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and the largest single-month jump is +1,158.21 into August while the steepest drop is -1,326.87 into November. Churned renewals concentrate in July and November — 2 each of the 7 total.",
      ask: "Return each month with ARR booked, churned renewals and the step delta vs the prior month to 2 decimals, oldest month first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, {1}, 7) AS month,\n         ROUND(SUM(total), 2) AS arr_booked,\n         SUM(CASE WHEN status = {2} THEN 1 ELSE 0 END) AS churned_renewals\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       arr_booked,\n       churned_renewals,\n       ROUND(arr_booked - {3}(arr_booked) OVER (ORDER BY month), 2) AS step_delta\nFROM monthly\nORDER BY month;",
      slots: [
        {
          answer: "1",
          kind: "number",
          label: "the month-key start",
          why: "SUBSTR(created_at, 1, 7) keeps YYYY-MM: 2024-01. Starting at 2 shifts the window to 024-01 and the spine silently re-keys — every downstream join to the finance calendar misses while the chart still renders.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the churn literal",
          why: "Churned renewals are status 'cancelled' — 7 on the db, concentrated 2 in July and 2 in November. 'shipped' would count the 30 activations into the churn column and the board reads an invented churn spike exactly where onboarding succeeded.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookback",
          why: "LAG(arr_booked) OVER (ORDER BY month) fetches the previous bucket so each delta is row-local. LEAD looks forward and flips every delta's sign; SUM builds a running total instead of a step — a different report wearing the same column name.",
        },
      ],
      distractors: ["2", "'shipped'", "LEAD", "SUM"],
      walkthrough:
        "Two stages: build the month spine, then walk it. The CTE folds 103 renewals into 14 monthly buckets keyed by SUBSTR(created_at, 1, 7) — ARR booked rounded to cents, plus a churned-renewal count that reads 2 in July and 2 in November against 7 total — and the outer SELECT adds LAG(arr_booked) OVER (ORDER BY month) so each row carries its own prior month. The step deltas tell the quarter's story: the book opens at 3,731.97, slides to the 1,193.86 July trough, then jumps +1,158.21 into August — the largest single-month gain — before the steepest drop, -1,326.87, lands in November. The first row's delta is NULL by construction: there is no prior month to fetch, and NULL is the baseline, never a zero to be coalesced away. The distractors each break differently: 2 in the SUBSTR start re-keys every month to '024-01' so every calendar join misses; 'shipped' in the status literal counts the 30 activations as churn and invents a spike; LEAD flips every delta's sign by looking forward; SUM replaces the step with a running total. The board's rule holds: a step walk is LAG over a month spine, with the first row's NULL stated on the slide.",
    },
    // Wave-3x expansion (Task 103): cs-asana-3..6. Families t5 / j4 / s6 / x2 — distinct from
    // the kit's j7 + t7 and from each other. Every figure verbatim from scripts/company-facts.md
    // or probe-verified readonly against db/custom.db (probe-derived cells: band line counts
    // 118/133, multi-seat line counts 72/86, APAC intensity 7.4, LATAM intensity 2, chase-list
    // cells 4,937.00 / 3,562.00 / 2,794.00 / 1,756.00, tie-block workspace ids 9/11/14/16 and 6/8).
    {
      id: "cs-asana-3",
      tier: "easy",
      topic: "t5",
      universe: "growth",
      title: "The engagement ladder rebuild",
      brief:
        "Growth ops memo for the engagement board: the workspace ladder is the season opener, and the tie policy is the headline. Probed on the storefront db: 16 workspaces carry the 103 renewals; the ladder runs 24, 17, 14, 13, 5 — then a four-way tie at 4 renewals (workspace ids 9, 11, 14, 16) and a two-way tie at 3 (ids 6, 8). The board's published policy is shared rungs with gaps — RANK semantics — and today's cut keeps every workspace carrying at least 3 renewals, the embedded-tier floor, so the tie block has followers beneath it. Read biggest book first; ties share their rung and the next distinct count skips.",
      ask: "Return each workspace with its renewal count and shared-rung rank, keeping workspaces with at least 3 renewals, biggest book first with the tie policy applied.",
      template:
        "WITH per_ws AS (\n  SELECT customer_id,\n         COUNT(*) AS renewals\n  FROM orders\n  GROUP BY customer_id\n  HAVING COUNT(*) >= {1}\n)\nSELECT customer_id,\n       renewals,\n       {2}() OVER (ORDER BY renewals {3}) AS rnk\nFROM per_ws\nORDER BY rnk, customer_id;",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the embedded-tier floor",
          why: "The floor keeps the embedded tier in view: 11 workspaces carry 3 or more renewals, so the four-way tie at 4 has the two 3-renewal logos right beneath it — the rows that make RANK's skip visible. A floor of 4 cuts them and the leaderboard stops being a tie-policy read.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rungs-then-skip ranker",
          why: "The board's policy is RANK: the four-way tie at 4 consumes ranks 6 through 9 and the two 3-renewal workspaces land on 10 together. DENSE_RANK would hand them 7 — shared rungs without gaps, a different policy printed as a different number.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The ladder reads 24, 17, 14, 13, 5 from the top. ASC flips it and the review opens on the two 3-renewal workspaces — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "NTILE", "ASC", "4"],
      walkthrough:
        "Two stages: fold the 103 renewals to one row per workspace, then hang the rank window off the fold. The CTE keeps the 11 workspaces carrying at least 3 renewals; RANK() OVER (ORDER BY renewals DESC) prints the board's shared-rungs-then-skip policy: 24, 17, 14, 13, 5 on ranks 1 through 5, the four-way tie at 4 (workspaces 9, 11, 14, 16) consuming ranks 6 through 9, and the two 3-renewal workspaces (6, 8) landing together on 10 — the skip made visible by the followers beneath the tie. The distractors each break the read: DENSE_RANK prints 7, 7 for that last pair — shared rungs, no gaps — which is a different policy wearing the same column name; ROW_NUMBER splits the tie arbitrarily with no stated rule; NTILE() errors because the function demands an argument; ASC flips the ladder and opens the review on the smallest books; and a floor of 4 cuts the two 3-renewal workspaces, leaving nine rows where the tie block is terminal and the skip invisible. Ranks and renewals are two columns of one claim: who carries the book, and who sits in the tier beneath it.",
    },
    {
      id: "cs-asana-4",
      tier: "hard",
      topic: "j4",
      universe: "month-close",
      title: "The never-remitted chase list",
      brief:
        "Month-close memo from the billing pod: the dunning list ships before a single reminder does, and it is built as an anti-join — statements with zero payment legs, dollars read through the cents fold. Probed on the storefront db: 6 never-remitted statements worth 15,217.00 — five open blocks (18/873.00, 21/1,295.00, 24/4,937.00, 26/3,562.00, 27/2,794.00) plus one status lie, #28 marked paid with no legs at 1,756.00. Today's cut chases every block at or above the paid lie's size — the floor that keeps the chase list to statements worth a real dunning call — biggest first, statement id as the tiebreaker.",
      ask: "Return each never-remitted statement worth at least 1,756.00 with its id, status and chase amount in dollars to 2 decimals, biggest amount first.",
      template:
        "SELECT i.id AS invoice,\n       i.status AS status,\n       ROUND(i.amount_cents / {1}, 2) AS chase_amount\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\n  AND i.amount_cents / 100.0 >= {3}\nORDER BY chase_amount {4}, i.id;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents fold divisor",
          why: "Invoices carry INTEGER cents; the dollar read is amount_cents / 100.0 — 493,700 cents prints 4,937.00 only under that divisor. A bare /1 keeps raw cents, the top block reads 493,700, and every dunning letter inherits the inflated number; the .0 is what makes the division real instead of integer.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-the-invoice join",
          why: "LEFT JOIN keeps every statement and lets the unmatched surface as NULL legs — the anti-join that IS the chase list. INNER would drop all six before the WHERE ever sees them: an empty report that looks like good news.",
        },
        {
          answer: "1756",
          kind: "number",
          label: "the paid-lie floor",
          why: "The floor is the paid lie's size: 1,756.00. Statements at or above it keep the chase to 24/4,937.00, 26/3,562.00, 27/2,794.00 and the lie itself — four rows worth a call; 1,295.00 and 873.00 fall to tomorrow's small-block pass.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-block-first direction",
          why: "Dunning works biggest-first: 4,937.00, then 3,562.00, then 2,794.00, then the 1,756.00 lie. ASC opens the queue on the smallest block and the morning goes to the wrong calls.",
        },
      ],
      distractors: ["INNER", "CROSS", "2794", "1295", "ASC", "1"],
      walkthrough:
        "The anti-join is the chase list: LEFT JOIN payments keeps every statement, the NULL-leg filter keeps only the six never-remitted ones — five open blocks plus the one paid-status lie — and the cents fold prints their dollars: 4,937.00 (statement 24), 3,562.00 (26), 2,794.00 (27) and 1,756.00 (28) clear the 1,756.00 floor; 1,295.00 and 873.00 fall to tomorrow's small-block pass. Every figure reconciles: the six blocks together are the probed 15,217.00. The distractors break honestly: INNER JOIN drops all six statements before the WHERE ever sees them — an empty report that reads as good news; CROSS JOIN with an ON clause is a parse error; /1 keeps raw cents and the top block prints 493,700; 2,794 or 1,295 as the floor re-cuts the list to three or five rows; ASC queues the smallest block first; and the divisor's digits matter because they are the cents-to-dollars read. Statement grain, cents fold, anti-join, floor — the four moves every dunning query shares.",
    },
    {
      id: "cs-asana-5",
      tier: "hard",
      topic: "s6",
      universe: "month-close",
      title: "The close-day stage census",
      brief:
        "Close-day memo: the stage census is the gate the close passes through, and it must reconcile by construction — renewed + activated + rollout + churned = COUNT(*), 103 on the nose. Probed on the storefront db: EU runs 45 renewals from 8 workspaces (intensity 5.6), APAC 37 from 5 (7.4), US 19 from 2 (9.5), LATAM 2 from 1 (2.0); the stage grid reads EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0. The close cut keeps regions carrying at least 19 renewals — LATAM's two renewals stay on the all-regions census, not this one — biggest region first.",
      ask: "Return each region with its four stage counts, renewal count, workspace count and intensity to 1 decimal, keeping regions with at least 19 renewals, biggest first.",
      template:
        "SELECT c.region AS region,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS renewed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS activated,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS rollout,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS churned,\n       COUNT(*) AS renewals,\n       COUNT(DISTINCT o.customer_id) AS workspaces,\n       ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT o.customer_id), {2}) AS intensity\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY renewals {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the renewed literal",
          why: "Renewed is status 'delivered' — 52 across the book, 24 of them in EU. 'shipped' would count the 30 activations as renewals and the census invents a kept-rate the close cannot reconcile.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the intensity precision",
          why: "Intensity reports to 1 decimal — EU 5.6, APAC 7.4, US 9.5 — the exact figures growth quotes on the same slide. Precision 2 reprints EU as 5.63 and the close deck stops matching the growth deck it replaces.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the region floor",
          why: "The floor is the US book: 19 renewals. It keeps EU 45, APAC 37 and US 19, and leaves LATAM's two-renewal census to the all-regions view — a two-row region on a close gate is noise pretending to be a trend.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-region-first direction",
          why: "The close reads EU 45, APAC 37, US 19 from the top. ASC opens on the two-renewal region and the gate meeting starts with the exception instead of the book.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "2", "20", "ASC", "0"],
      walkthrough:
        "One scan, five conditional folds, one identity: renewed + activated + rollout + churned must equal COUNT(*) — EU 24 + 12 + 6 + 3 = 45, APAC 21 + 8 + 5 + 3 = 37, US 5 + 10 + 3 + 1 = 19 — and the floor keeps regions carrying at least 19 renewals, so LATAM's two-renewal census stays on the all-regions view. The intensity column is the second read: EU 5.6 renewals per workspace, APAC 7.4, US 9.5 — concentration hiding inside load. The distractors corrupt the gate honestly: 'shipped' in the renewed literal counts the 30 activations as renewals and the identity still sums but to the wrong book; 'pending' does the same with rollouts; status = 2 or 20 never matches a TEXT status and every stage column reads zero; 'ASC' in any numeric slot is a parse error; ROUND to 0 or 2 digits reprints 5.6 as 6 or 5.63 and the deck stops reconciling; a floor of 2 drags LATAM back in; a floor of 20 drops the US book. The gate ships only when the census reconciles to 103 by construction.",
    },
    {
      id: "cs-asana-6",
      tier: "medium",
      topic: "x2",
      universe: "pricing",
      title: "The seat-band fold",
      brief:
        "Pricing memo for the seat-band review: the catalog splits at the 55.00 per-seat edge the pricing page publishes, and the fold is one pass — lines, seats and average line price per band, with the multi-seat lines called out. Probed on the storefront db: 251 seat lines carry 498 units; the starter band (under 55.00) holds 133 lines / 268 seats at 31.01 average line price, the enterprise band (55.00 and up) holds 118 lines / 230 seats at 115.85. Max line quantity is 3, so the multi-seat cut at 2 separates add-a-seat lines from the single-seat baseline.",
      ask: "Return each band with its line count, seat sum, average line price to 2 decimals and multi-seat line count (quantity 2 or more), starter band last.",
      template:
        "SELECT CASE WHEN oi.unit_price >= {1} THEN 'enterprise_band' ELSE 'starter_band' END AS band,\n       COUNT(*) AS lines,\n       SUM(oi.{2}) AS seats,\n       ROUND(AVG(oi.unit_price), 2) AS avg_line_price,\n       COUNT(*) FILTER (WHERE oi.quantity >= {3}) AS multi_seat_lines\nFROM order_items oi\nGROUP BY {4}\nORDER BY band;",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the band edge",
          why: "The pricing page's edge is 55.00 per seat: 133 lines and 268 seats sit under it at 31.01 average, 118 lines and 230 seats at or above at 115.85. Nudge the edge and the bands re-cut — 54.99 is starter, 55.00 is enterprise, and the fold has no room for judgment.",
        },
        {
          answer: "quantity",
          kind: "keyword",
          label: "the seat column",
          why: "Seats are quantity — 498 units across 251 lines. SUM(unit_price) would add dollar prices into a seats column and the expansion read dies quietly: a number with the right shape and the wrong meaning.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the multi-seat threshold",
          why: "Max line quantity is 3, so the multi-seat cut is quantity >= 2 — the add-a-seat lines that flag expansion at line grain. A threshold of 3 would count only the triple-seat lines and understate the expansion cohort.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the band group key",
          why: "The fold groups by the band the CASE just built — two rows, one per pricing band. Grouping by unit_price explodes the fold back to one row per distinct price and the band summary disappears into noise.",
        },
      ],
      distractors: ["unit_price", "order_id", "product_id", "region", "3", "id"],
      walkthrough:
        "The band edge is the pricing page's 55.00: the CASE stamps each of the 251 seat lines, GROUP BY folds them into two rows, and the FILTER branch counts multi-seat lines inside the same pass — enterprise band 118 lines, 230 seats, 115.85 average line price, 72 of them adding seats; starter band 133 lines, 268 seats, 31.01 average, 86 multi-seat. Units reconcile: 230 + 268 = the probed 498 across 251 lines. The distractors each break the fold: SUM(unit_price) adds dollar prices into the seats column — a number with the right shape and the wrong meaning; GROUP BY unit_price explodes the two-band summary back to one row per distinct price; unit_price >= unit_price compares the price to itself and empties the enterprise arm; the price compared to order_id or product_id silently re-bands the catalog on an unrelated number; quantity >= 3 shrinks the multi-seat cut to triple-seat lines only; and an edge of 3 drags every line — the cheapest seat is 14.99 — into the enterprise band. Two bands, five measures, one scan: the seat-band fold the pricing review opens with.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "The activation funnel is Asana's headline read — workspace signed, project live, task completed. This problem drills the conditional-count shape the funnel report uses every single week." },
    { slug: "feature-adoption-windows", why: "Workflow automation (Rules) adoption is measured in windows — did the workspace run an automated rule within N days of rollout? Conditional averages over adoption windows are exactly this shape." },
    { slug: "immediate-food-delivery-ii", why: "Renewals activated within the promised rollout window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the same shape as Asana's onboarding-SLA read." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of workspaces that hit the activation milestone (first task completed) out of all signed — a distinct-count share with the denominator stated, the funnel's weekly pulse." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain census — renewals booked AND workspaces active per month — is the chart growth ops opens every review with; this problem is that chart at practice scale." },
    { slug: "combine-two-tables", why: "Workspaces LEFT JOINed to renewals: the whitespace read. A workspace with no renewal is whitespace, a renewal with no workspace is corruption — choosing the join type is the business statement." },
    { slug: "rank-scores", why: "The engagement leaderboard ranks workspaces by renewals with guaranteed ties — four workspaces sit at 4 on this db. Shared rungs versus gaps is a policy decision this problem forces you to make." },
    { slug: "weather-type-in-each-country", why: "Workspace tier bands (enterprise, advanced, starter) are CASE-classified per region — exhaustive, ordered arms that partition the base without holes. Same shape, different labels." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Span-of-control reads: which workspaces or teams carry at least N reports. Asana screens reframe it as 'which teams hold at least five open cross-team dependencies'." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Seat expansion reads: which renewals carry seat lines above the platform-average seat count. A two-stage fold — compute the mean, then filter against it — exactly the tier-gate screen." },
    { slug: "active-businesses", why: "One-pass status censuses: renewed, activated, pending, churned in a single scan whose branches must reconcile to COUNT(*). Four sequential queries drift; one pass cannot." },
    { slug: "bank-account-summary-ii", why: "The billing pod's monthly rollup: per-month folds with cents-safe arithmetic. INTEGER cents and the /100.0 rule make this exact practice for the true-up reports." },
    { slug: "second-day-confirmation", why: "Collaboration telemetry: did the workspace complete tasks on consecutive days? Streak logic over daily activity is how adoption health is actually measured here." },
    { slug: "biggest-window-between-events", why: "Dormancy detection: the largest gap between workspace touches flags the churn-risk cohort before the renewal date arrives. Window math over event timestamps." },
    { slug: "fix-names-in-a-table", why: "Workspace name hygiene before any join: exports arrive title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one workspace into two." },
    { slug: "net-revenue-retention", why: "Seat expansion and contraction roll up to NRR — the metric Asana's board actually manages. Cohort revenue walks with LAG are exactly this problem's shape." },
    { slug: "funnel-step-conversion", why: "The activation funnel as step conversion — signed to activated to renewed — each step a conditional rate with its denominator named. This drills the stage-by-stage ratio shape growth ops ships weekly." },
    { slug: "portfolio-concentration-hhi", why: "The 63.5%-of-book concentration read, quantified: share-of-total math over workspace revenue. Asana screens love asking how concentrated the book is and why one lost logo moves a quarter." },
    { slug: "running-total-for-different-genders", why: "Cumulative ARR walks by month — the running total finance reads beside the trough-and-jump narrative on the 14-month spine. Same shape, different split key." },
    { slug: "find-the-team-size", why: "Each renewal carrying its workspace's renewal count beside it — COUNT(*) OVER (PARTITION BY ...) is the drill. Asana stamps every task with its project's load the same way." },
    { slug: "the-most-recent-three-orders", why: "Latest three renewals per workspace — the recency cut customer success reads before a renewal call. Window-picked top-N per group, exactly this shape." },
    { slug: "game-play-analysis-v", why: "First-activation-month cohorts: which month's workspaces activated and kept going. The retention-date fold is the cohort spine under Asana's NRR walks." },
    { slug: "market-analysis-i", why: "White-space logos: workspaces with a single renewal or outsized spend — the account list expansion sales actually works from. A two-branch filter over folds, exactly this." },
    { slug: "confirmation-rate", why: "Rollout confirmation rates with NULL-safe folds — COALESCE over the unmatched rows. The activation read dies without exactly this NULL discipline." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Workspaces that activated AND renewed but never churned — multi-flag conditional aggregation over statuses. The expansion-cohort definition is this query." },
    { slug: "most-common-course-pairs", why: "Most co-used feature pairs across projects — self-join pairing with counts, the dependency-graph read Asana's product analytics runs on cross-team links." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Renewal values rising renewal over renewal — LAG-flagged streaks. Expansion momentum reads are exactly this flag-and-streak shape." },
    { slug: "spend-histogram", why: "Renewal-value histogram — the 25.47 to 1,088.44 spread cut into bands. Bucket-and-count over money is the tiering story's first draft." },
    { slug: "count-student-number-in-departments", why: "Zero-fill LEFT JOIN counts — workspaces with no activations still need their zero on the census. The anti-join's cousin: proving the zero, not dropping the row." },
    { slug: "compute-the-rank-as-a-percentage", why: "Engagement as percentile — each workspace's renewal count ranked as a share of the field. Percentile framing is how the leaderboard becomes a distribution." },
    { slug: "calculate-salaries", why: "Per-region max renewal stamped beside every renewal — window MAX over a partition. The 'is this my region's biggest book' read is exactly this." },
    { slug: "symmetric-pairs", why: "Mutual cross-team dependency pairs via EXISTS — if A depends on B and B on A, that is a blocked deadlock. Graph reads over pairs are core Asana territory." },
  ],
};
