// Airtable — Wave-9 (Task 98), saas domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12).
// The database-for-everyone story: the storefront db read as an Airtable world —
// customers are workspace accounts (region = market), orders are base activity
// periods (delivered = active-billed workspace-month, shipped = current period
// with shipped_at as the period-open stamp, pending = trial/pending upgrade,
// cancelled = downgraded), order_items are usage line records (records created,
// automation runs, API call packs: quantity = units, unit_price = per-unit
// rate), products are plan SKUs (Free/Team/Business/Enterprise + add-ons),
// suppliers are integration/marketplace partners, invoices are billing
// statements, payments are billing rails, expenses are platform opex,
// ledger_entries are the GL — all money tables INTEGER cents. Bases ARE tables;
// the kit leans on that: base activity as the unit of work, record-level
// telemetry, automation runs, and expansion via seats + API calls.
// Pool provenance: company-pools.md carries NO Airtable section (0 tagged
// rows, none SQL-graded), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu — sql rows only, no w*/d*/f*
// rows — and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: airtable is NOT yet in registry
// COMPANY_META — wire id "airtable", domainId "saas", name "Airtable", tagline
// "The database for everyone: bases, records, automation runs", accent
// "text-amber-300" to match this header exactly.

import type { CompanyKit } from "../types";

export const airtableKit: CompanyKit = {
  id: "airtable",
  domainId: "saas",
  name: "Airtable",
  tagline: "The database for everyone: bases, records, automation runs",
  accent: "text-amber-300",

  brief: [
    "**Airtable** is the no-code connected-apps platform — the product that put a relational database in front of everyone and made the base the unit of work: tables, fields, views and records, stitched together by linked records and set in motion by scripts, automations and the API. Monetization rides seats and usage, so every growth number in the building is a conditional count over the same small object set. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are base activity periods worth **34,833.28**, and the 251 order_items rows are usage line records — records created, automation runs, API call packs, where quantity = units and unit_price = the per-unit rate. The status map is fixed: delivered = {emerald:active-billed} (52, 50.5%), shipped = {sky:current period} (30, 29.1%, shipped_at = the period-open stamp), pending = trial or pending upgrade (14, 13.6%), cancelled = {rose:downgraded} (7, 6.8%).",
    "The data org splits into growth, usage monetization and a small enterprise-governance pod, and all three read the same spine at different grains. Usage telemetry is the heartbeat: a period books at created_at, and `shipped_at` is stamped the day the period actually opens — **82 of 103 periods** carry the stamp, averaging **2.98 days** booking-to-open with a 2–4 day spread, and the 14 trial rows have none yet (a population definition, not a cleanup job). Money sits one layer down: 28 billing statements and 27 payment legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of billed value sits with workspaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter.",
    "Interview screens are census-then-denominator, base-flavored. A typical loop opens with a **two-grain market census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a downgraded period count in your base?'*), then into the usage ladder where three SKUs sit tied at 30 units and rank semantics become a business decision. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or pivot the fate grid with `CASE` arms that must reconcile to 103 by construction. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Airtable section — no tagged rows at all — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: activation funnels, two-grain workspace censuses, tie-heavy usage ladders, `CASE` fate pivots and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:workspace-month fate pivot} growth ops opens Monday with, the other rebuilds the {violet:linked-usage pair census} the template team runs before shipping a new base template. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the usage telemetry refresh. A growth analyst opens the base-activity dashboard before standup: did overnight periods book, did any workspace get its `shipped_at` stamp without an owner on the upgrade, does the one-pass fate census reconcile — 52 active-billed + 30 current + 14 trial + 7 downgraded = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If period-open latency drifts off the **2.98-day** norm — the regional reads run EU 2.94, APAC 2.93, US 3.07 — the trial follow-up queue gets pulled before marketing's weekly read ships.",
    "**11:30 —** Midday is the expansion read. The monetization pod wants the usage ladder re-ranked with the three-way tie at 30 units handled honestly — shared rungs, named policy; the {amber:governance} pod wants the concentration re-cut, {rose:63.5% of billed value} from 3,000-plus workspaces; a regional VP wants periods beside workspaces (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-paid statement (#11, 925.00) and a paid-status statement with zero payment legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Active-billed rate", what: "Delivered periods ÷ all periods booked: 52 of 103 (50.5%). The workspace-month that actually billed to term — the conditional count the growth review opens with." },
    { name: "Period-open latency", what: "Booking to period-open (created_at → shipped_at) over the 82 stamped periods only: 2.98-day average, range 2–4. Open periods have no cycle yet and must not dilute the average." },
    { name: "Trial backlog", what: "Pending periods: 14 of 103 (13.6%) with no period-open stamp yet. Trials are 'not yet', never a silent zero — they stay in every denominator the funnel reports." },
    { name: "Downgrade share", what: "Downgraded periods ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn-cohort map behind the winback calendar." },
    { name: "Billed value book", what: "Total billed across periods: 34,833.28 over 103 periods, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the plan-tiering story." },
    { name: "Usage-line depth", what: "Usage line records ÷ periods: 251 lines across 103 workspace-months. Expansion shows up here first — an automation run or API pack is a new line, not a new workspace." },
    { name: "Workspace concentration", what: "Share of billed value from workspaces spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs customer success and sizes the enterprise pod." },
    { name: "Collections coverage", what: "Billed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the billing pod refreshes every close." },
  ],

  topics: [
    {
      name: "Trial-to-paid activation funnels",
      why: "Every Airtable growth screen opens with the funnel: period booked, trial parked, period opened (shipped_at stamped), billed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a current period 'active-billed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "game-play-analysis-iv"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "find-followers-count", "students-and-examinations"],
    },
    {
      name: "Workspaces joined to base activity",
      why: "Workspaces carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without a workspace is corruption; a workspace without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employees-with-missing-information"],
    },
    {
      name: "Usage leaderboards & rank ties",
      why: "Usage-based expansion is leaderboard reporting: which plan SKUs and add-on packs carry the usage units. The ladder on this db ties constantly — 36 and 36, then 30 three times, then 21 three times — and RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung, which is a policy about peer SKUs, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "Plan-tier banding with CASE",
      why: "Workspaces sit on Free, Team, Business and Enterprise with add-on packs riding alongside, and every tier read is CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "running-total-for-different-genders"],
    },
    {
      name: "Set algebra for segment stacks",
      why: "Board packets stack populations — current periods under downgraded, this quarter beside last — and EXCEPT answers 'which signed workspaces never opened a period'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "monthly-transactions-ii"],
    },
    {
      name: "Nested folds & usage gates",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean (6.44 here — exactly four logos clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets active-billed, current, trial and downgraded in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "airtable-t1",
      q: "Your workspace report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A billed-value report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no base activity ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-active workspaces, and proving that zero is itself the analyst's job: all 16 workspace accounts appear in the period table somewhere. In an Airtable world that proof matters twice — a signed workspace with zero base activity is the expansion pipeline's raw material, and losing it from the report is losing the lead list.",
      tag: "joins",
    },
    {
      id: "airtable-t2",
      q: "Three SKUs tie at 30 usage units on the expansion ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the usage ladder runs 47, 46, 38, then a two-way tie at 36, 33, 31, then the three-way tie at 30: RANK gives all three the same rank 8 and the next distinct count (28) lands on rank 11 — implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — 8, 8, 8 and the next distinct count is 9. ROW_NUMBER splits ties arbitrarily, which silently decides whose add-on pack gets the roadmap slot. Below that, another three-way tie at 21 repeats the whole question at rank 14. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer SKUs (RANK or DENSE_RANK), or an explicitly named tie-breaker like category then id — and writing it in the query comment so the template team can reproduce the ladder.",
      tag: "windows",
    },
    {
      id: "airtable-t3",
      q: "The census shows 103 base activity periods and 16 workspaces; EU shows 45 periods and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per workspace-month, so a workspace with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and usage momentum, workspaces measure installed base and coverage. The ratio — 5.6 periods per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for usage lines and COUNT(*) silently counts usage records, not periods — 251 of them. In Airtable terms that is the difference between 'workspaces active', 'bases billed' and 'records created', and a dashboard that blurs them reports three different businesses under one heading. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "airtable-t4",
      q: "shipped_at is NULL until a base period actually opens. What is your policy for the period-open latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only opened periods have a latency, so the report measures booking-to-open for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. The 14 trial rows have no stamp because no cycle has started; that is a population definition, not missing data to clean. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the opened subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 downgrades, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day period opens for cycles that have not started, and it poisons the 2.98-day norm the trial follow-up queue is staffed against.",
      tag: "nulls",
    },
    {
      id: "airtable-t5",
      q: "The growth review wants active-billed value per market for markets carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards current, trial and downgraded rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor bites: EU's 45, APAC's 37 and the US's 19 periods clear it while LATAM's 2 drop out — and the report must say so, because a market vanishing from the slide reads as a data gap when it is a threshold decision. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to periods versus to billed value.",
      tag: "pipeline",
    },
    {
      id: "airtable-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.4375 periods per workspace, 6.44 rounded — exactly four logos clear it, the 24/17/14/13 ladder). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. And the NOT IN variant carries its own landmine: one NULL in the inner list poisons every comparison and the whole result empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "airtable-t7",
      q: "The growth trend buckets billing by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when upgrade-driven periods land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Then read the walk like an analyst: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August and drops -1,326.87 into November — and each of those numbers is only as honest as the spine keying it.",
      tag: "dates",
    },
    {
      id: "airtable-t8",
      q: "Finance says a billing statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "airtable-mcq-1",
      prompt: "A base activity period's status reads 'shipped'. In this kit's Airtable stage map, what happened?",
      choices: ["Current period — running, opened at shipped_at, not yet billed to term", "Active-billed — the workspace-month billed in full", "Downgraded — the workspace stepped down a plan", "Trial — awaiting first payment"],
      answer: 0,
      why: "The stage map is fixed: shipped = current period (30 of 103 periods, 29.1%), with shipped_at as the period-open stamp. It is 'running now', not 'billed to term'.",
      notes: [
        { choice: 1, why: "Active-billed is 'delivered' — 52 periods (50.5%) that billed to term. Calling current periods active-billed inflates the kept rate before a single cycle completes." },
        { choice: 3, why: "Trial is 'pending' — 14 periods with no period-open stamp yet. Trials are 'not yet', not 'running', and they stay in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-2",
      prompt: "Period-open latency averages 2.98 days. Over which population is that number computed? The db holds 82 stamped periods, 14 trials and 7 downgrades of 103 booked.",
      choices: ["All 103 booked periods", "The 82 periods carrying a shipped_at stamp", "The 52 active-billed periods only", "Distinct workspaces (82/16)"],
      answer: 1,
      why: "Only opened periods have a latency: the average runs over the 82 stamped rows — 2.98 days, range 2–4 — and the population ships with the number. Trials have no cycle to measure.",
      notes: [
        { choice: 0, why: "AVG ignores NULLs, so dividing by 103 never actually happens — the unstated version returns the same 2.98 over a silently shrunken population. The fix is saying the filter out loud." },
        { choice: 2, why: "52/82 mixes two funnel steps — active-billed is term completion, shipped_at is period-open. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-3",
      prompt: "EU carries 45 base activity periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to downgraded periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the downgrade share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the downgrade map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-5",
      prompt: "Keep only markets carrying at least 10 base activity periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US (19) clear the bar; LATAM's 2 periods drop out — and the report should say so.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-6",
      prompt: "The usage ladder reads 47, 46, 38, 36, 36, 33, 31, then THREE SKUs tied at 30. Under RANK, what rank does the next SKU (28 units) carry?",
      choices: ["11", "9", "8", "10"],
      answer: 0,
      why: "RANK shares rungs and then skips: the tie block consumes ranks 8, 9 and 10, so the next distinct count lands on 11. Every 30-unit SKU shows rank 8.",
      notes: [
        { choice: 1, why: "9 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 3, why: "10 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-7",
      prompt: "A whitespace report runs workspaces LEFT JOIN periods, then filters WHERE status = 'delivered' to keep it 'revenue-honest'. Signed-but-inactive workspaces vanish. Why?",
      choices: ["The workspaces genuinely have no delivered periods — the zero is correct", "Filtering a period column in WHERE after a LEFT JOIN discards the NULL-payload rows — the LEFT quietly became an INNER", "LEFT JOIN cannot carry a WHERE clause at all", "The report needs DISTINCT to preserve unmatched workspaces"],
      answer: 1,
      why: "The whitespace rows survive the LEFT JOIN with NULL period columns; status = 'delivered' is UNKNOWN against NULL, so those rows die in WHERE. Move the predicate into ON (or an outer query) and the whitespace returns — all of it, which on this db means proving the confident zero of never-active workspaces.",
      notes: [
        { choice: 0, why: "The zero CAN be correct — but this db has workspaces whose periods exist in other statuses, and the WHERE filter deletes them from consideration, not from reality." },
        { choice: 3, why: "DISTINCT dedups rows; it cannot resurrect rows the WHERE clause already discarded. Wrong tool for a predicate-placement bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-8",
      prompt: "A staging-table downgrade list uses workspace_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-9",
      prompt: "A board stack puts current periods under downgraded periods in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no market or branch label — collapse into one, and the board loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-10",
      prompt: "A dashboard walks billed value period by period: SUM(total) OVER (ORDER BY booked_at). Two periods share a booked_at second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on booked_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-airtable-1",
      tier: "easy",
      topic: "s7",
      universe: "funnel",
      title: "The workspace-month fate pivot",
      brief:
        "Airtable-flavored brief on the storefront db: Monday's growth review opens with the workspace-month fate pivot — every base activity period lands in exactly one fate (active-billed to term, still in its current period, parked in trial, or downgraded a plan) — and the review reads the pivot per market with the downgrade share beside it, population stated on the slide. Probed facts: 103 periods worth 34,833.28; the market grid reads EU 45 = 24 active-billed + 12 current + 6 trial + 3 downgraded, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0; downgrade share reads EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0. The review reads biggest period count first.",
      ask: "Return each market with its period count, the four fate branches and the downgrade share to 1 decimal, biggest period count first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS periods,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS active_billed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS current_period,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS trials,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS downgrades,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {4}) AS downgrade_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY periods {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the active-billed fate",
          why: "Active-billed workspace-months are status 'delivered' — 52 of 103 (50.5%). 'shipped' would print the 30 current periods into the active column and the census overstates the billed book before the review opens.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial fate",
          why: "Trials are status 'pending' — 14 periods with no period-open stamp yet, all still in the denominator. 'delivered' would read the 24/21/5/2 active arm into the trial column and invent a trial surge exactly where billing succeeded.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the downgrade fate",
          why: "Downgrades are status 'cancelled' — 7 total, concentrated APAC 3 / EU 3 / US 1. The share column folds the same literal, so a wrong chip here breaks both the downgrade arm and the 6.7/8.1/5.3 shares the review quotes.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Downgrade share reports to 1 decimal — EU 6.7, APAC 8.1 — and the US's single downgrade (1 of 19) anchors the digit in the cells. ROUND(…, 2) prints 6.67 and the slide stops reconciling with the 6.7 the review quotes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest period count on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on LATAM's 2 periods — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'void'", "0", "ASC", "2"],
      walkthrough:
        "One join, one fold, five columns at two grains. The join attaches every period to its workspace's market, GROUP BY folds 103 periods into four market rows, and the four CASE arms split each market's fate grid: EU 45 = 24 active-billed + 12 current + 6 trial + 3 downgraded, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0 — reconciling to the platform census 52 + 30 + 14 + 7 = 103 by construction. The share column runs 100.0 BEFORE the division so the downgrade share survives as real arithmetic: EU 6.7, APAC 8.1, US 5.3, LATAM 0 — and the US's single downgrade (1 of 19) is the cell that anchors the 1-decimal digit. The distractors fail honestly: 'shipped' fills the active arm with the 30 current periods; 'void' matches no status and zeroes the arm; 0 as a status literal never matches a TEXT status and zeroes the arms, while 0 as the precision truncates the shares to 7/8/5/0; ASC opens the review on LATAM; and 2 in the precision slot prints 6.67 where the deck quotes 6.7. The pivot is the read: LATAM bills both of its periods and never downgrades, while APAC carries the highest downgrade share at 8.1 — one query, two business claims.",
      },
    {
      id: "cs-airtable-2",
      tier: "medium",
      topic: "j6",
      universe: "catalog",
      title: "The linked-usage pair census",
      brief:
        "Airtable-flavored brief on the storefront db: linked records are Airtable's product DNA, and the usage-data twin is the pair census — which workload families ride together inside the same base activity period. Probed facts: the usage spine carries 251 line records across 103 workspace-months; the family fan-out reads Accessories touched in 54 periods, Audio 46, Electronics 40, Video 30, Wearables 23, Apparel 22, Fitness 13. The template team wants the recurring pairings — families sharing at least 5 workspace-months — ranked biggest first, so one-off collisions do not drive base-template decisions.",
      ask: "Return each workload-family pair with its count of shared workspace-months, keeping pairs that share at least 5, biggest count first.",
      template:
        "SELECT p1.category AS family_a,\n       p2.category AS family_b,\n       COUNT({1} a.order_id) AS shared_periods\nFROM order_items a\nJOIN order_items b\n  ON b.order_id = a.order_id\n AND a.product_id {2} b.product_id\nJOIN products p1 ON p1.id = a.product_id\nJOIN products p2 ON p2.id = {3}\nGROUP BY p1.category, p2.category\nHAVING COUNT(DISTINCT a.order_id) >= {4}\nORDER BY shared_periods {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the period deduplicator",
          why: "COUNT(DISTINCT a.order_id) folds pair-rows back to workspace-months: a period carrying three co-usage lines reads 1, not 3. Bare COUNT counts pair-rows and inflates every cell by its line depth — a different census wearing the same column name.",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the pair canonicalizer",
          why: "a.product_id < b.product_id keeps every pair to one orientation, so Audio-before-Accessories is never also counted as Accessories-before-Audio. '>' mirrors the whole census, '=' collapses it to same-SKU pairs, and '<>' re-admits same-SKU line pairs the census deliberately excludes.",
        },
        {
          answer: "b.product_id",
          kind: "keyword",
          label: "the second family's join key",
          why: "p2 must join to b's product for family_b to be the co-rider. 'a.product_id' joins both sides to the same product so every pair becomes a family paired with itself; 'p1.id' clones p1 into p2 and the off-diagonal rows collapse into diagonals.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the recurring-pair floor",
          why: "Pairs sharing at least 5 workspace-months make the template cut — and the floor is visible in the result: three pairs ride exactly at 5 (Accessories×Fitness, Video×Wearables, Wearables×Apparel). Floor 6 trims the board to 14 pairs and drops those three ties.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-pair-first direction",
          why: "The template team reads strongest pairings on top: Audio×Accessories 25 leads, then the 17/17 tie. ASC would open on the 5-cell floor ties — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", ">", "=", "p1.id", "ASC"],
      walkthrough:
        "The self-join is the linked-records move: order_items aliased twice over the same period, ON b.order_id = a.order_id AND a.product_id < b.product_id, so each co-usage pair appears once in a canonical orientation. COUNT(DISTINCT a.order_id) counts workspace-months, not pair-rows, and the census reads: Audio rides with Accessories in 25 of the 103 workspace-months — a cell re-derived independently by intersecting the two period sets, 25 both ways — then Electronics×Accessories 17 and Electronics×Audio 17 tied at rank 2, Video×Accessories 13, and the diagonals are real: Accessories×Accessories 8 means two different Accessories SKUs attached in the same month, while Fitness's single SKU makes a Fitness diagonal impossible. The HAVING floor >= 5 keeps 17 of the 27 raw pairs, anchored by the three 5-cell ties. The distractors fail honestly: SUM and MAX inside COUNT are aggregate-in-aggregate errors; '>' mirrors every pair; '=' keeps only same-SKU pairings; 'p1.id' clones family_a into family_b and collapses the off-diagonal rows; ASC flips the board onto its floor ties. Read as product: the Accessories gravity (54 periods touched, 25 shared with Audio alone) is where base templates bolt on add-ons.",
      },
    ],

  problems: [
    { slug: "immediate-food-delivery-i", why: "Periods opening within the promised window versus late ones — the onboarding-SLA read is a conditional rate over a timestamp comparison, exactly the shape Airtable's trial follow-up queue runs." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of workspaces that created their first record within N days of signup out of all signed — a distinct-count share with the denominator stated, the activation funnel's weekly pulse." },
    { slug: "customers-who-never-order", why: "Workspaces with zero base activity: the anti-join is whitespace hunting — and on a clean db the honest answer is a confident zero, which proving is itself the exercise." },
    { slug: "feature-adoption-windows", why: "Automation (Rules) adoption is measured in windows — did the workspace run an automated rule within N days of rollout? Conditional counts over adoption windows are the governance pod's core read." },
    { slug: "plan-migration-paths", why: "Free → Team → Business → Enterprise moves, upgrades and downgrades alike. LAG over a workspace's period history is exactly how the plan-migration report is built here." },
    { slug: "net-revenue-retention", why: "Seat adds plus usage packs roll up to NRR — the metric Airtable's board actually manages. Cohort billed-value walks with LAG are this problem's shape." },
    { slug: "mrr-waterfall", why: "Billed-value movements — new, expansion, downgrade — decompose the book month by month. A CASE-classified movement fold over the 14-month spine is the monetization pod's standing deliverable." },
    { slug: "deferred-revenue", why: "Annual plans bill upfront and earn down monthly — the statement book (28 statements, INTEGER cents) is where deferred balances live. Cents-safe folds are non-negotiable here." },
    { slug: "ltv-cac-payback", why: "Payback on acquisition spend per workspace: lifetime billed value against acquisition cost, cohort by cohort. Ratio discipline with honest denominators is the whole exercise." },
    { slug: "winback-recovery", why: "Downgraded workspaces that come back — the winback cohort is the cancelled-status read followed over time. Same anti-join-plus-window shape the CS pod ships weekly." },
    { slug: "fix-names-in-a-table", why: "Workspace name hygiene before any join: exports arrive title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one workspace into two." },
    { slug: "consecutive-numbers", why: "Consecutive billed months — streak logic over the period spine flags the never-missed cohort that expansion offers target first." },
    { slug: "repeat-purchase-rate", why: "Renewal repeat: workspaces carrying 2+ periods in a window out of all active. The 16-workspace base makes every repeat read a conditional distinct count." },
    { slug: "basket-depth-aov", why: "Usage lines per period beside average billed value — 251 lines across 103 periods is the depth story that separates seats-driven growth from usage-driven growth." },
    { slug: "trial-balance-check", why: "The close ritual: ledger debits must read 181,080 against 181,080, delta zero. A conditional-sum footing drill is exactly how the governance pod proves it." },
    { slug: "keep-latest-dedupe", why: "Record revisions pile up — keeping the latest version per record id is Airtable's revision history as a SQL drill, and a fan-out bug here double-counts billed value." },
  ],
};
