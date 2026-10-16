// Retool — Wave-10 (Task 100), saas domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Internal-tools SQL: the storefront db read as a build-and-govern sandbox — customers are
// workspace accounts (region = market buckets), orders are subscription/billing periods
// (delivered = active seats billed 52, shipped = expansion in flight with shipped_at as the
// seat-change stamp 30, pending = trial/PoC 14, cancelled = churned 7), order_items are
// seat/usage line records (quantity = seats, unit_price = per-seat rate), products are plan
// SKUs, suppliers are data-source/integration partners, invoices are subscription billing
// statements, payments are payment rails, expenses are platform opex, ledger_entries the GL.
// Finance tables store INTEGER cents (dollar read = amount_cents / 100.0); orders.total and
// order_items.unit_price are REAL dollars. Angle kept DISTINCT from miro (visual collaboration)
// and airtable (database-for-everyone): internal-app velocity, the governance/audit read
// (admin console claims vs the activity log), and power-user seat concentration.
// Pool provenance: company-pools.md carries NO Retool section (0 tagged rows) — all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's theme menu
// (sql rows only, no w*/d*/f* rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12, canonical cells 2026-10-16); every case slot
// is mechanically verified against db/custom.db by scripts/case-audit.ts (probe receipts in
// the worklog).

import type { CompanyKit } from "../types";

export const retoolKit: CompanyKit = {
  id: "retool",
  domainId: "saas",
  name: "Retool",
  tagline: "Internal tools in hours: apps on live data, seat expansion, governance",
  accent: "text-teal-300",

  brief: [
    "**Retool** is the internal-tools platform — drag-and-drop app canvases wired straight to live databases, APIs and admin panels, so an ops team ships a refund console or a provisioning dashboard in an afternoon instead of a sprint quarter. Governance is the second product: permission groups decide who runs what, and the audit log records everything the apps touch. It monetizes seat by seat on usage, so every growth number in the building is a conditional count over the same small object set. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are subscription periods worth **34,833.28**, and the 251 order_items rows are seat/usage lines — quantity = seats, unit_price = the per-seat rate. The stage map is fixed: delivered = {emerald:seats billed} (52, 50.5%), shipped = expansion in flight (30) with `shipped_at` as the seat-change stamp, pending = trial/PoC (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org splits into a build-velocity pod, a governance/audit pod and a small billing-analytics group, and all three read the same spine at different grains. Go-live is the heartbeat: a period books at `created_at`, and `shipped_at` is stamped the day the workspace's seats actually change — **82 of 103 periods** carry the stamp (79.6% go-live coverage), averaging **2.98 days** booking-to-go-live with a 2–4 day spread, and the 14 trial/PoC rows have none yet (a population definition, not a cleanup job). Money sits one layer down: 28 billing statements and 27 payment legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with workspaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter.",
    "Interview screens are census-then-denominator, with an audit twist. A typical loop opens with a **two-grain workspace census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do PoC trials count in your base?'*), then into the power-user ladder where four workspaces sit tied at 4 periods and rank semantics become a policy call. Late rounds walk the {sky:14-month billing spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Retool's signature screen is the {rose:claim-vs-log probe}: an invoice marked 'paid' while the payment log holds zero rows — candidates who trust the admin console over the activity log fail the round.",
    "Preparation strategy: the pools file carries no Retool section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: go-live funnels, two-grain censuses, tie-heavy power-user ladders, CASE permission bands and the cents-safe billing register. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:one-pass governance census} the audit console runs at every close, the other rebuilds the {violet:seat-band concentration audit} the monetization pod reads before every pricing call. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the go-live refresh. A platform-analytics analyst opens the admin dashboard before standup: did overnight bookings land, did any workspace get its seat-change stamp without a provisioning owner, does the one-pass status census reconcile — 52 billed + 30 in flight + 14 trials + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. The {rose:stalled-PoC queue} (14 periods worth 6,113.00) routes to solutions engineering before the meeting starts, and if time-to-go-live drifts off the **2.98-day** norm, the rollout pod gets paged before the governance packet ships.",
    "**11:30 —** Midday is the seat read. The monetization pod wants the {violet:seat-band re-cut} — **230 power seats averaging 115.85** against 268 occasional seats at 31.01 — to argue where expansion actually lives; a regional VP wants periods beside workspace counts (EU 45-from-8 versus US 19-from-2); a manager wants the ladder's four-way tie at 4 handled honestly. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pricing-review argument*.",
    "**15:30 —** The afternoon tilts toward money and the audit. The {rose:unbilled register} refreshes first — 6 statements worth **15,217.00** with zero settlement legs, one of them claiming 'paid' (#28, 1,756.00) — before any number reaches the close packet; the void-but-settled mirror (#11, 925.00) goes to billing as the matching anomaly. Then the billing spine walks month over month on LAG deltas — the **3,731.97** January peak against the 1,193.86 July floor — with the first row's NULL stated as baseline. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — the close ships or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Go-live coverage", what: "Periods with a seat-change stamp ÷ all periods booked: 82 of 103 (79.6%). The top-of-funnel number the build-velocity pod reads every Monday — the 14 trial/PoC rows are 'not yet live', never a silent zero." },
    { name: "Time-to-go-live", what: "Booking to seat change (created_at → shipped_at) over stamped periods only: 2.98-day average, range 2–4. The population definition ships with the number — open trials have no rollout yet and must not dilute it." },
    { name: "Stalled-PoC backlog", what: "Trial/PoC periods (status 'pending'): 14 of 103 worth 6,113.00 — EU 6, APAC 5, US 3, LATAM confidently 0. The queue that routes to solutions engineering before anything else ships." },
    { name: "Market intensity", what: "Periods per workspace at two grains: EU 45-from-8 (5.6) versus US 19-from-2 (9.5), APAC 37-from-5, LATAM 2-from-1. Load versus coverage — the census that decides where the platform teams build next." },
    { name: "Logo churn", what: "Cancelled share of booked periods: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The churn-cohort map behind the winback calendar; LATAM's 0 rides on a 2-period base." },
    { name: "Seat depth", what: "Seat/usage lines per period: 251 lines across 103 periods (2.44), 498 seats billed. Expansion shows up as new lines on existing periods before it shows up anywhere else." },
    { name: "Seat-band mix", what: "Seats under the 55 rate line versus over: 268 occasional seats averaging 31.01 against 230 power seats averaging 115.85 — power carries 26,605.51 of the 34,833.28 book (76.4%) on 46% of the seats." },
    { name: "Unbilled exposure", what: "Statements with zero settlement legs: 6 worth 15,217.00 — 5 genuinely open (13,461.00) plus one claiming 'paid' (#28, 1,756.00). The register the governance pod walks into every close." },
  ],

  topics: [
    {
      name: "Go-live funnels & conditional counts",
      why: "Every Retool screen opens with the build funnel: periods booked, seats changed (shipped_at stamped), billed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight expansion 'billed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "game-play-analysis-iv"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Workspaces joined to activity",
      why: "Workspace accounts carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without a workspace is corruption; a workspace without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Power-user leaderboards & ties",
      why: "Seat concentration is leaderboard reporting: which workspaces carry the periods and the seats. The ladder on this db runs 24, 17, 14, 13, 5 with a four-way tie at 4 below it, and RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung — a policy about peer workspaces, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "Permission bands with CASE",
      why: "Retool ships access as permission groups — admin, builder, end-user — and every tier read is CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the governance report, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Billing spine & LAG deltas",
      why: "The 14-month billing spine (2024-01 to 2025-02) is the close call's home turf: prior month beside current, delta rounded, the 3,731.97 January peak and the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Governance packets stack populations — in-flight under churned, this quarter beside last — and EXCEPT answers 'which signed workspaces never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & seat gates",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean (6.44 here — exactly four workspaces clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The audit console gets billed, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift out of agreement with the console.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Billing register & cents discipline",
      why: "Booked is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the app world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the unbilled register.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "retool-t1",
      q: "Your governance report joins workspace accounts to billing periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a stamped column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering shipped_at IS NOT NULL in WHERE after the LEFT JOIN kills every NULL-payload row — the LEFT quietly became an INNER and the never-live cohort vanished while the query looked valid. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero — all 16 workspaces appear in the period table somewhere — and proving that zero is itself the analyst's job, because in a governance culture absence of activity is a finding, not an empty cell.",
      tag: "joins",
    },
    {
      id: "retool-t2",
      q: "Four workspaces tie at 4 periods on the power-user ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which workspace's admin gets the builder-seat upsell email first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment where the governance review can see it. On a ladder that feeds seat-allocation calls, an arbitrary tie split is a pricing decision made by accident.",
      tag: "windows",
    },
    {
      id: "retool-t3",
      q: "The census shows 103 periods and 16 workspaces; EU shows 45 periods and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per period, so a workspace with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and billing cadence, workspaces measure installed base and coverage. The ratio — 5.6 periods per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items and COUNT(*) silently counts seat/usage lines — 251 of them — and SUM(quantity) climbs again to 498 seats. Retool's seat model lives exactly on that distinction: lines are app activity, seats are humans being billed, and conflating the two misprices the account. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "retool-t4",
      q: "shipped_at is NULL until the workspace's seats actually change. What is your policy for the time-to-go-live report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a go-live latency, so the report measures booking-to-seat-change for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the live subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day go-lives for rollouts that never started, and a fabricated stamp is precisely what an audit log exists to catch. On this db the 14 pending rows are a defined population ('not yet live'), not missing data to impute. A report whose WHERE clause is doing definitional work without saying so is exactly what a Retool reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "retool-t5",
      q: "The monetization review wants booked value per region for workspaces carrying at least five periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The five-period floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an expansion line and an error, and between a threshold applied to periods versus to dollars. On this db the five-period floor keeps exactly five workspaces — the 24, 17, 14, 13, 5 ladder — and they carry 63.5% of the 34,833.28 book, which is why the floor is a business decision, not just a syntax gate: drop it to 4 and the four-way tie floods the board with workspaces that together move far less revenue.",
      tag: "pipeline",
    },
    {
      id: "retool-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.44 periods per workspace, and exactly four workspaces clear that bar on this db). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. And when the subquery feeds NOT IN, one NULL in the inner list poisons every comparison and empties the report — EXISTS is the honest shape for existence tests, and staging tables full of partial audit exports are exactly where that NULL comes from. State the inner fold's population and its empty-case behavior unprompted; that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "retool-t7",
      q: "The billing trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when seat changes and renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine tells the whole story on this db: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, then drops -1,326.87 into November — and every one of those cells is a fold over the same 14 buckets, so a wrong month key corrupts all of them at once.",
      tag: "dates",
    },
    {
      id: "retool-t8",
      q: "Finance says a statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the admin console is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; the coverage split must read 21 exact / 1 partial (4,000.00 of 6,148.00) / 6 never-collected. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture ends at the GL: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "retool-mcq-1",
      prompt: "A period row's status reads 'shipped'. In this kit's Retool stage map, what happened?",
      choices: ["Seats billed — the term completed", "Expansion in flight — the seats changed, term not finished", "Churned — cancelled mid-term", "Trial/PoC — awaiting go-live"],
      answer: 1,
      why: "The stage map is fixed: shipped = expansion in flight (30 of 103 periods), with shipped_at as the seat-change stamp. Only 'delivered' (52) means the term completed and the seats count as billed.",
      notes: [
        { choice: 0, why: "Seats billed is 'delivered' — 52 periods. Calling the 30 in-flight expansions billed inflates the installed base before a single term finishes." },
        { choice: 3, why: "Trial/PoC is 'pending' — 14 periods with no seat-change stamp. Pending is a defined 'not yet' cohort, not mid-flight expansion." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-2",
      prompt: "Go-live coverage is stamped periods ÷ which population? The db holds 82 stamped, 14 trial/PoC and 7 churned of 103 booked.",
      choices: ["Stamped + churned only (82/89 = 92.1%)", "All periods booked (82/103 = 79.6%)", "Delivered periods only (52/82)", "Distinct workspaces (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods booked — trial/PoC rows stay in the denominator because 'not yet live' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population the funnel exists to watch — the rollout queue is the point." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, shipped_at is the seat-change stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-3",
      prompt: "EU carries 45 periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to churned periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the churn map reads zero everywhere and LATAM's real 0 becomes indistinguishable from a bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-5",
      prompt: "Keep only workspaces carrying at least 10 periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the top of the ladder — 24, 17, 14 and 13 periods — clears a 10-period bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-6",
      prompt: "The power-user ladder runs 24, 17, 14, 13, 5 periods, then FOUR workspaces tied at 4. Under RANK, what rank do the two 3-period workspaces carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-period workspaces share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending periods double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-8",
      prompt: "A staging-table churn list uses workspace_id NOT IN (SELECT customer_id FROM periods WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But staging tables are exactly where NULLs sneak in via partial audit exports, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-9",
      prompt: "A governance packet stacks in-flight periods under churned periods in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no market or branch label — collapse into one, and the packet loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-10",
      prompt: "A dashboard walks booked value period by period: SUM(total) OVER (ORDER BY created_at). Two periods share a created_at second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-retool-1",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass governance census",
      brief:
        "Retool-flavored brief on the storefront db: month-end close opens with the governance census the audit console runs in ONE pass — booked periods, seats billed, expansions in flight, trial/PoC rows, churned rows, and the booked value the census must foot to. Probed facts: 103 periods booked; 52 delivered (seats billed), 30 shipped (expansion in flight), 14 pending (trial/PoC), 7 cancelled (churned); the book totals 34,833.28. The close packet rejects any census whose branches do not reconcile to 103 by construction — four sequential queries are four ways to drift out of agreement with the console.",
      ask: "Return the one-pass census: booked periods, seats billed, in-flight expansions, trials, churned, and booked value to 2 decimals, in that column order.",
      template:
        "SELECT COUNT(*) AS periods,\n       COUNT(*) FILTER (WHERE status = {1}) AS seats_billed,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS in_flight,\n       COUNT(*) FILTER (WHERE status = {2}) AS trials,\n       COUNT(*) FILTER (WHERE status = {3}) AS churned,\n       ROUND({4}(total), {5}) AS book_value\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the seats-billed literal",
          why: "Seats billed are status 'delivered' — 52 of 103. 'shipped' here would count the 30 in-flight expansions as billed and overstate the installed base; the census must read 52 to reconcile.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial literal",
          why: "Trial/PoC rows are status 'pending' — 14 with no seat-change stamp yet. 'open' is an invoice status, not an order status: the arm would read zero and silently lose the entire trial queue.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the churned literal",
          why: "Churned periods are status 'cancelled' — 7 on the db. 'shipped' here would classify healthy in-flight expansions as churn and page customer success about accounts that are actually expanding.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book-value fold",
          why: "Booked value folds with SUM(total) — 34,833.28 across 103 periods. AVG prints the 338.19 mean and COUNT prints 103: real numbers wearing the census's name, and neither is money.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money precision",
          why: "Money reports to 2 decimals — 34,833.28. ROUND(…, 1) prints 34,833.3 and the census stops tying to the billing register the close packet ships beside it.",
        },
      ],
      distractors: ["'shipped'", "'open'", "AVG", "COUNT", "MAX", "1"],
      walkthrough:
        "One scan, six cells, zero joins. FILTER (WHERE …) branches the status census inside a single aggregate pass — 52 seats billed + 30 in flight + 14 trials + 7 churned reconciles to the 103 booked COUNT(*) by construction, which is the property the close packet demands before anything ships. The money cell folds SUM(total) to 34,833.28 at 2-decimal precision. The distractors each break differently: 'shipped' in a literal arm swaps a healthy population in — 30 expansions masquerading as billed or churned; 'open' is an invoice status that zeroes the arm and silently drops a queue; 1 in a literal arm compares text to a number and zeroes it the same way; AVG prints the 338.19 mean where the 34,833.28 book belongs; COUNT prints 103 twice and the value column stops being money; MAX reports the single biggest period (1,088.44) as the whole book; and 1 in the precision slot rounds past the register. The census discipline is Retool's own: one pass, one truth, branches that must sum to the COUNT(*) — the console and the query cannot be allowed to disagree.",
    },
    {
      id: "cs-retool-2",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The seat-band concentration audit",
      brief:
        "Retool-flavored brief on the storefront db: before the pricing call, the monetization pod reads the seat-band audit — every seat/usage line CASE-banded at the 55 rate line the pricing page publishes, folded per band into lines, seats, average rate and billed value. Probed facts: the power band (unit_price >= 55) carries 118 lines, 230 seats at a 115.85 average rate, billing 26,605.51 — 76.4% of the 34,833.28 book; the occasional band carries 133 lines, 268 seats at 31.01, billing 8,227.77. The read is power-first: the band that carries the money leads the page.",
      ask: "Return each seat band with its line count, seat count, average rate to 2 decimals and billed value to 2 decimals, biggest average rate first.",
      template:
        "WITH seat_lines AS (\n  SELECT quantity,\n         unit_price,\n         CASE WHEN unit_price {1} {2} THEN {3} ELSE 'occasional' END AS band\n  FROM order_items\n)\nSELECT band,\n       COUNT(*) AS lines,\n       SUM(quantity) AS seats,\n       ROUND(AVG(unit_price), {4}) AS avg_rate,\n       ROUND(SUM(quantity * unit_price), 2) AS billed\nFROM seat_lines\nGROUP BY band\nORDER BY avg_rate {5};",
      slots: [
        {
          answer: ">=",
          kind: "keyword",
          label: "the power-band edge",
          why: "The published power band starts AT the 55 line — unit_price >= 55 captures the 115.85-rate seats. '<' flips the bands outright and '!=' silently swaps the labels while both rows still print — the silent lie.",
        },
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the policy threshold",
          why: "55 is the pricing page's band edge — a policy constant, not a figure the result computes. Moving it to 50 drags the 59.99-rate SKUs into the power band and the concentration story inflates.",
        },
        {
          answer: "'power'",
          kind: "keyword",
          label: "the band label",
          why: "The high-rate arm is labeled 'power' — 118 lines carrying 230 seats at 115.85. 'occasional' here would swap the labels so the 26,605.51 power bill prints on the 31.01 band and the pricing call reads upside down.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Rates report to 2 decimals — 31.01 against 115.85, the two cells the pricing call quotes. ROUND(…, 1) prints 31.0 and 115.9, and the band averages stop matching the price list the page publishes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the power-first direction",
          why: "The read is power-first: 115.85 on top, 31.01 below — the concentration story leads. ASC would open the pricing call on the 8,227.77 occasional band and bury the 76.4% headline.",
        },
      ],
      distractors: ["<", "=", "!=", "'occasional'", "1", "ASC"],
      walkthrough:
        "Stage the banding, then fold. The CTE stamps every one of the 251 seat/usage lines with a band at the 55 edge; the outer SELECT folds per band: the power arm reads 118 lines, 230 seats, a 115.85 average rate and 26,605.51 billed; the occasional arm reads 133 lines, 268 seats, 31.01 and 8,227.77 — the two billed cells footing exactly to the 34,833.28 book, with power carrying 76.4% of it on 46% of the seats. That inversion is the whole pricing story: seats are broad, dollars are concentrated. The distractors each break differently: '<' flips the bands so 31.01 prints on top wearing 'power'; '=' empties the power arm because nothing is priced exactly at the edge; '!=' swaps the labels while both rows still print; 'occasional' in the label slot relabels the 26,605.51 arm and the deck argues against itself; 1 in the threshold slot bands every line as power and deletes the occasional row; 1 in the precision slot rounds the rates past the price list; ASC buries the 115.85 headline under the 31.01 tail. Ordering by average rate DESC is the read: the band that carries the money leads the page.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Adoption share: what fraction of a workspace's invited users actually touched an app this week? A distinct-actor share with the denominator stated — the weekly pulse the build-velocity pod ships." },
    { slug: "immediate-food-delivery-ii", why: "Rollouts promised inside the window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the same shape as Retool's go-live SLA read." },
    { slug: "fix-names-in-a-table", why: "Data-source naming hygiene before any join: 'Prod DB' versus 'prod db' silently splits one source into two, and with it every app built on top of it." },
    { slug: "find-users-with-high-token-usage", why: "Power-user detection: which users run query volumes far above the workspace norm? A fold-then-threshold read — the exact shape of a builder-seat upsell list." },
    { slug: "usage-tier-percentiles", why: "Seat tiers cut by percentiles, not guesswork: which users land in the top usage quintile? NTILE banding is how the pricing team stages power versus occasional seats." },
    { slug: "net-revenue-retention", why: "Seat expansion and contraction roll up to NRR — the metric the pricing call actually manages. Cohort revenue walks with LAG are exactly this problem's shape." },
    { slug: "mrr-waterfall", why: "Close calls argue in movements — new, expansion, contraction, churn. Classifying period-over-period deltas into movement buckets is the LAG-waterfall shape this problem drills." },
    { slug: "growth-accounting", why: "The build board reads new minus churned with expansion in between — the accounting identity every period must satisfy. LAG-status classification is the engine behind it." },
    { slug: "week-over-week-churn", why: "The churn walk feeds the winback calendar: 7 churned periods on this db, concentrated 2 each in July and November. Weekly churn pivots are exactly this problem's shape." },
    { slug: "cohort-retention-matrix", why: "Build cohorts: workspaces that signed together, retained together? Cohort-offset pivots turn the period table into the retention matrix leadership argues over." },
    { slug: "keep-latest-dedupe", why: "Audit logs and usage syncs arrive duplicated across retries; the latest event wins. ROW_NUMBER dedupe with a tiebreak is the hygiene pass every audit export needs before it feeds a report." },
    { slug: "null-blank-audit", why: "The claim-vs-log lesson at column scale: which rows claim a state the log cannot support? Conditional SUMs over NULL and blank arms are the audit that catches them — the unbilled register's daily cousin." },
    { slug: "duplicate-charge-pairs", why: "Two settlement legs inside the same window on one statement: duplicate or split? Self-join window pairing over timestamps is how billing separates the 5 legitimate split-rail statements from double charges." },
    { slug: "customer-order-frequency", why: "Usage cadence per workspace — periods per month, workspaces going quiet. Conditional HAVING folds over billing periods are the cadence screen the platform team runs on every account plan." },
    { slug: "customers-who-bought-all-products", why: "Full plan-family coverage: which workspaces touch every SKU family they subscribe to? Relational division is the coverage-audit shape behind 'is this workspace single-threaded on one app?'." },
    { slug: "dau-wau-stickiness", why: "App stickiness — active weeks over active days — is how internal adoption is graded. Trailing-window distinct counts are exactly this shape." },
  ],
};
