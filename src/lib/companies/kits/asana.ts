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
  ],

  dayInLife: [
    "**08:30 —** The day starts with the activation funnel refresh. A growth analyst opens the renewal dashboard before standup: did overnight bookings land, did any workspace get its `shipped_at` stamp without a rollout owner, does the one-pass status census reconcile — 52 renewed + 30 activated + 14 pending + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If activation latency drifts off the **2.98-day** norm, the rollout queue gets pulled before marketing's weekly read ships.",
    "**11:30 —** Midday is the expansion read. Customer success wants the engagement leaderboard with the four-way tie at 4 renewals handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus workspaces; a regional VP wants renewals per workspace beside workspace counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
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
  ],
};
