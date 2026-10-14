// Miro — Wave-9 (Task 98), saas domain, NO tagged pool in company-pools.md — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12).
// Collaborative-work SQL: the storefront db read as a collaboration-telemetry sandbox —
// customers are workspace/team accounts, orders are subscription periods (delivered =
// active-billed team-month, shipped = period open with shipped_at as the period-open
// stamp, pending = trial, cancelled = churned), order_items are usage line records
// (quantity = units: boards created, collaborators, Talktrack sessions; unit_price =
// per-unit rate), products are the plan-SKU shelf (Free/Starter/Business/Enterprise
// packaging; the db's category codes stand for add-on families), suppliers are
// template/Miroverse creator partners & integrations, invoices/payments are the
// billing books (INTEGER cents), expenses are platform opex, ledger_entries the GL.
// Pool provenance: company-pools.md carries NO Miro section (0 tagged rows) — all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's theme
// menu (sql rows only, no w*/d*/f* rows) and say so. Case briefs quote probed figures
// from scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts (probe receipts in the worklog).

import type { CompanyKit } from "../types";

export const miroKit: CompanyKit = {
  id: "miro",
  domainId: "saas",
  name: "Miro",
  tagline: "Visual collaboration: boards, workshops, seat expansion",
  accent: "text-yellow-300",

  brief: [
    "**Miro** is the visual collaboration platform behind the 'innovation workspace' pitch — boards of sticky notes and frames, facilitated workshops and meetings (retros, planning, brainstorming), a template library supercharged by Miroverse creator content, and Talktrack guided sessions that walk a team through a practice step by step. It monetizes seat by seat, and guest collaborators multiply usage without adding a paid logo — which means every growth number in the building is a conditional count over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are subscription periods worth **34,833.28**, and the 251 order_items rows are usage lines — quantity = units (boards created, collaborators, Talktrack sessions), unit_price = per-unit rate. The status map is fixed: delivered = {emerald:active-billed} (52, 50.5%), shipped = {sky:period open} (30, 29.1%), pending = trial (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org splits into growth, monetization and a small workshops-telemetry pod, and they read the same spine at different grains. The activation funnel is the heartbeat: a period books at created_at, and `shipped_at` is stamped the day the workspace's period actually opens — **82 of 103 periods** carry the stamp, averaging **2.98 days** to open with a 2–4 day spread, and the 14 trials pending have none (a population definition, not a cleanup job). Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0` — 28 statements against 27 payment legs, with the coverage split (21 exact / 1 partial / 6 none) as the close's reconciliation spine. Concentration is the third story: **63.5%** of the book sits with workspaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain workspace census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'do trials count in your base?'*), then into the collaboration leaderboard where the team-month ladder runs 24, 17, 14, 13, 5 with a four-way tie at 4 and rank semantics become a business decision. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or dip into the template funnel: Nordic's creator bench alone carries **32%** of the book's revenue.",
    "Preparation strategy: the pools file carries no Miro section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fate funnels, two-grain censuses, tie-heavy ladders, CASE plan bands and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:creator bench} the template-funnel team opens with, the other rebuilds the {sky:collaboration ladder} the expansion review reads. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the collaboration-funnel refresh. A growth analyst opens the period dashboard before standup: did overnight bookings land, did any workspace get its `shipped_at` stamp without an owner, does the one-pass fate census reconcile — 52 active-billed + 30 period-open + 14 trials + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If period-open latency drifts off the **2.98-day** norm, the trial queue gets pulled before the workshops pod's weekly read ships.",
    "**11:30 —** Midday is the expansion read. Customer success wants the collaboration leaderboard with the four-way tie at 4 team-months handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus workspaces; a regional VP wants periods beside workspace counts (EU 45-from-8 versus US 19-from-2). The template-funnel team drops in too: Nordic's creator bench still holds **32%** of template-funnel revenue and Midwest 26.7% — two partners, more than half the shelf. Each ask is a join, a conditional aggregate and one judgment call about statuses; the analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Active-billed rate", what: "Delivered periods ÷ ALL periods booked: 52 of 103 (50.5%). The number growth reads every Monday — 'active-billed' is a status-filtered conditional count, and the denominator (trials included) is the whole interview." },
    { name: "Period-open latency", what: "Booking to period open (created_at → shipped_at) over the 82 of 103 periods that carry the stamp: 2.98-day average, range 2–4. The population definition ships with the number — open periods and trials have no cycle yet." },
    { name: "Trial share", what: "Pending periods ÷ all booked: 14 of 103 (13.6%). Trials are 'not yet', never a silent zero — they stay in every funnel denominator until they convert or wash out." },
    { name: "Workspace churn", what: "Cancelled share of booked periods: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn cohort map that drives the winback calendar." },
    { name: "Collaboration book", what: "Total period value booked: 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the plan-tiering story — one 1,088.44 period outweighs the smallest 42 combined." },
    { name: "Usage-line expansion", what: "Usage lines ÷ periods: 251 order_items across 103 periods. Expansion shows up here first — extra boards, collaborators and Talktrack sessions are new line records on existing periods, not new bookings." },
    { name: "Workspace concentration", what: "Share of the book from workspaces spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs customer success and sizes the enterprise pod." },
    { name: "Creator-partner mix", what: "Template-funnel revenue share by creator bench: Nordic 32%, Midwest 26.7%, Alpine 13.7%, Andes 10.4%, Shenzhen 8.8%, Pacific 8.6%. Two partners carry ~59% of the shelf — a vendor-risk conversation waiting to happen." },
  ],

  topics: [
    {
      name: "Team-month fate funnels",
      why: "Every Miro growth screen opens with the fate funnel: periods booked, opened (shipped_at stamped), billed to term, washed out. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a period-open row 'active-billed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "funnel-step-conversion"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "number-of-rich-customers", "article-views-ii"],
    },
    {
      name: "Workspaces to periods",
      why: "Workspace accounts carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without a workspace is corruption; a workspace without periods is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employees-with-missing-information"],
    },
    {
      name: "Collaboration leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 team-months each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax.",
      slugs: ["rank-scores", "top-travellers", "second-highest-salary"],
    },
    {
      name: "Plan-tier CASE banding",
      why: "Workspace tiers are CASE-classified — enterprise, business, starter, free — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the expansion forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "loan-types"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["growth-accounting", "biggest-window-between-events", "second-day-confirmation"],
    },
    {
      name: "Cohort set algebra",
      why: "Board packets stack populations — opened periods under churned, this quarter beside last — and EXCEPT answers 'which signed workspaces never opened a period'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["monthly-transactions-ii", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Seat-expansion nested folds",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean — exactly four logos clear it on this db. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets active-billed, period-open, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "miro-t1",
      q: "Your workspace report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A billing report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no periods ARE the answer, arriving with NULL payload columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. And mind the third grain: join order_items for usage lines and COUNT(*) silently counts lines, not periods — 251 against 103 on this db. On the clean core the never-opened-workspace anti-join returns a confident zero, and proving that zero is itself the analyst's job: all 16 workspaces appear in the period table somewhere.",
      tag: "joins",
    },
    {
      id: "miro-t2",
      q: "Four workspaces tie at 4 team-months on the collaboration leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose customer-success pod gets the headcount. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces (RANK or DENSE_RANK), or an explicitly named tie-breaker like usage_value then workspace id — and writing the policy in the query comment where the expansion review can see it.",
      tag: "windows",
    },
    {
      id: "miro-t3",
      q: "The census shows 103 periods and 16 workspaces; EU shows 45 periods and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per team-month, so a workspace with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and seat momentum, workspaces measure installed base and coverage. The ratio — 5.6 periods per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating, and it is exactly the read Miro's expansion pod manages seats by. The trap that catches candidates is a third grain: join order_items for usage lines and COUNT(*) silently counts usage lines — 251 of them — boards, collaborators and Talktrack sessions folded into a number wearing the period census's name. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "miro-t4",
      q: "shipped_at is NULL until a workspace's period actually opens. What is your policy for the period-open latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only opened periods have a latency, so the report measures booking-to-open for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the opened subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 churned rows, which is a feature, not a bug — that gap is the un-opened cohort the funnel exists to watch. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day openings for trials that have not started, and it poisons the 2.98-day norm the trial-queue alert runs on. A report whose WHERE clause is doing definitional work without saying so is exactly what a Miro reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "miro-t5",
      q: "The expansion review wants booked value per region for workspaces carrying at least five team-months. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards period-open, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The five-team-month floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an expansion line and an error, and between a threshold applied to periods versus to dollars. The strong answer places every filter by asking: is this a fact about one team-month, or about a workspace? On this db the five-period floor keeps exactly five logos — Alice Chen, Emma Wilson, Grace Kim, Maya Patel, Chloe Dubois — and they carry 63.5% of the 34,833.28 book, which is why the floor is also a business decision, not just a syntax gate.",
      tag: "pipeline",
    },
    {
      id: "miro-t6",
      q: "WHERE usage_value > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and usage_value > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.44 periods per workspace, and exactly four logos clear that bar on this db). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. And when the subquery feeds NOT IN, one NULL in the inner list poisons every comparison and empties the report — EXISTS is the honest shape for existence tests. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "miro-t7",
      q: "The growth trend buckets team-months by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when planning workshops convert. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine tells Miro's story honestly: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, then drops -1,326.87 into November — every one of those cells is a fold over the same 14 buckets, and a wrong month key corrupts all of them at once.",
      tag: "dates",
    },
    {
      id: "miro-t8",
      q: "Finance says a statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here ends at the GL: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "miro-mcq-1",
      prompt: "A period row's status reads 'shipped'. In this kit's Miro stage map, what happened?",
      choices: ["Active-billed — the term completed and counts as kept", "Period open — the workspace is live, not yet billed to term", "Churned — cancelled mid-term", "Trial — awaiting conversion"],
      answer: 1,
      why: "The stage map is fixed: shipped = period open (30 of 103 periods, 29.1%), with shipped_at as the period-open stamp. Only 'delivered' (52) means the term completed and the period counts as active-billed.",
      notes: [
        { choice: 0, why: "Active-billed is 'delivered' — 52 periods. Calling the 30 period-open rows active-billed inflates the kept rate before a single term finishes." },
        { choice: 2, why: "Churned is 'cancelled' — 7 periods. Churn is a final state; period-open is mid-flight and still recoverable." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-2",
      prompt: "Active-billed rate is delivered periods ÷ which population? The db holds 52 delivered, 30 period-open, 14 trials and 7 churned of 103 booked.",
      choices: ["Delivered + period-open only (52/82 = 63.4%)", "All periods booked (52/103 = 50.5%)", "Non-churned periods (52/96 = 54.2%)", "Distinct workspaces (52/16)"],
      answer: 1,
      why: "The house definition: active-billed ÷ ALL periods booked — trials and period-open rows stay in the denominator because 'not yet billed to term' is exactly what the funnel measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 21 un-stamped periods inflates the rate to 63.4% by deleting the population the funnel exists to watch — trials and in-flight periods are the point." },
        { choice: 2, why: "Excluding churn pre-declares the metric a success story — churn belongs in the base, or the 6.8% churn share and the 50.5% kept rate stop reconciling to the same 103." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-3",
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
      id: "miro-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to churned periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the churn map reads zero everywhere and LATAM's real 0 becomes indistinguishable from a bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-5",
      prompt: "Keep only workspaces carrying at least 5 team-months. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 5", "WHERE periods >= 5 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A team-month floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps exactly five workspaces — 24, 17, 14, 13 and 5 periods.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-6",
      prompt: "The collaboration ladder runs 24, 17, 14, 13, 5 team-months, then FOUR workspaces tied at 4. Under RANK, what rank does the next distinct count (3) carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-team-month workspaces share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The trials double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-8",
      prompt: "A staging-table trial list uses workspace_id NOT IN (SELECT customer_id FROM periods WHERE status = 'trial') and returns ZERO rows. First suspicion?",
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
      id: "miro-mcq-9",
      prompt: "A board stack puts period-open workspaces under churned workspaces in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
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
      id: "miro-mcq-10",
      prompt: "A dashboard walks booked collaboration value period by period: SUM(total) OVER (ORDER BY period_open). Two periods share a period-open second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on period_open join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total (34,833.28 here), which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-miro-1",
      tier: "easy",
      topic: "j3",
      universe: "supplier",
      title: "The Miroverse creator bench",
      brief:
        "Miro-flavored brief on the storefront db: the template-funnel review opens with the Miroverse creator bench — which creator partners carry trusted catalogs (rating 4.5-plus) onto the plan shelf, how many plan SKUs each lists, and what those SKUs have billed in usage lines. Probed facts: Nordic Gadgets AB rates 4.6 with 3 listings and 11,130.25 in usage revenue — 32% of the whole 34,833.28 book; Alpine Audio GmbH rates 4.8 with 2 listings and 4,765.63 (13.7%). The other four creators — Midwest 4.4, Andes 4.0, Shenzhen 4.1, Pacific 3.9 — all sit under the trust floor. The bench reads biggest revenue first.",
      ask: "Return each trusted creator partner with region, rating, distinct plan-SKU listings and usage revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS creator_studio,\n       s.region AS region,\n       s.rating AS rating,\n       COUNT({1} p.id) AS listings,\n       ROUND(SUM(oi.{2} * oi.unit_price), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = {3}\nJOIN order_items oi ON oi.product_id = {4}\nWHERE s.rating >= {5}\nGROUP BY s.name\nORDER BY revenue {6};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds the usage-line fan-out back to plan SKUs: Nordic reads 3, not its 43 usage lines. Plain COUNT(p.id) counts lines — a number the slide never published — while SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id, neither of which is a catalog count.",
        },
        {
          answer: "quantity",
          kind: "keyword",
          label: "the usage unit",
          why: "Usage revenue is units × per-unit rate: SUM(oi.quantity * oi.unit_price). Swapping in unit_price multiplies the rate by itself and invents revenue; id multiplies row numbers into the fold. The probed cells — Nordic 11,130.25, Alpine 4,765.63 — only reproduce from the quantity fold.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the catalog join key",
          why: "products.supplier_id = s.id attaches each plan SKU to its creator studio. p.supplier_id makes the ON clause a tautology — every creator pairs with every SKU — and the fold fans out to the whole 16-SKU shelf under every name.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the usage join key",
          why: "order_items.product_id = p.id attaches each usage line to the SKU that billed it. s.id would silently re-key usage onto supplier ids — overlapping 1-6 ranges make it LOOK plausible while charging one creator's book to another.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the trust floor",
          noVerify: true,
          why: "rating >= 4.5 keeps exactly Nordic (4.6) and Alpine (4.8) — the two-partner bench. Dropping the floor to 4 waves Midwest (4.4) and Andes (4.0) into a bench the template team does not trust; raising it to 4.8 leaves Alpine alone on the slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue-first direction",
          why: "The review reads the bench by revenue: Nordic 11,130.25 over Alpine 4,765.63. ASC opens the meeting on the 13.7% partner and buries the 32% creator below the fold — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "4", "unit_price"],
      walkthrough:
        "Three tables, one fold. The chain runs creator studio → plan SKU → usage line: two INNER JOINs attach Nordic's and Alpine's SKUs to the lines that billed them, the rating floor keeps 2 of the 6 creators, and GROUP BY s.name collapses the fan-out. COUNT(DISTINCT p.id) reads listings at catalog grain — Nordic 3, Alpine 2 — while SUM(quantity × unit_price) reads revenue at usage grain: Nordic 11,130.25 (32% of the 34,833.28 book), Alpine 4,765.63 (13.7%), both straight from the probed bench. The distractors fail honestly: SUM and MAX inside COUNT are aggregate-nesting errors; 1 re-keys the catalog join to supplier 1 alone and the usage join to product 1 alone — either way the cells stop matching the facts; 4 in the floor admits Midwest (4.4) and Andes (4.0) onto a bench they have not earned; unit_price squares the rate instead of multiplying by units; ASC flips the read order and Alpine leads. The two-grain pairing is the read: 3 SKUs producing 11,130.25 says Nordic's shelf earns 3,710.08 per SKU while Alpine's 2 earn 2,382.82 — concentration the vendor-risk review can name.",
    },
    {
      id: "cs-miro-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The collaboration ladder",
      brief:
        "Miro-flavored brief on the storefront db: the expansion review wants the collaboration ladder — workspaces ranked by lifetime usage value, restricted to accounts carrying at least 5 team-months, because the tie-heavy tail below that floor (four workspaces sit at 4 team-months each) belongs to CS outreach, not the board deck. Probed facts: the ladder is Alice Chen (EU) 24 team-months / 7,262.35, Emma Wilson (US) 17 / 6,640.56, Grace Kim (APAC) 14 / 4,574.23, Maya Patel (APAC) 13 / 3,644.56, Chloe Dubois (EU) 5 / 2,667.93 — and workspaces above 3,000 carry 63.5% of the 34,833.28 book (71.2% above 2,000). The five spends are distinct, so no rung is shared on this slide.",
      ask: "Return each workspace over the 5-team-month floor with region, team-month count, usage value to 2 decimals and a usage rank, rank 1 first.",
      template:
        "WITH workspace_usage AS (\n  SELECT c.name AS workspace,\n         c.region AS region,\n         COUNT(*) AS team_months,\n         ROUND(SUM(o.total), 2) AS usage_value\n  FROM customers c\n  JOIN orders o ON o.customer_id = {1}\n  GROUP BY c.id, c.name, c.region\n  HAVING COUNT(*) >= {2}\n)\nSELECT workspace,\n       region,\n       team_months,\n       usage_value,\n       RANK() OVER (ORDER BY usage_value {3}) AS usage_rank\nFROM workspace_usage\nORDER BY usage_rank {4};",
      slots: [
        {
          answer: "c.id",
          kind: "keyword",
          label: "the workspace join key",
          why: "o.customer_id = c.id attaches each team-month to its workspace before the fold. c.name compares an INTEGER id to TEXT — the comparison never matches and the ladder empties; a self-referential key like o.customer_id = o.customer_id is a tautology that fans every workspace out to every period.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the expansion floor",
          why: "HAVING COUNT(*) >= 5 keeps exactly the five probed logos — 24, 17, 14, 13 and 5 team-months (the '5' is verifiable in Chloe's own row). Lowering it to 4 admits the four-way tie at 4 and doubles the deck; raising it to 10 trims to four logos and drops Chloe Dubois, the newest expansion win.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rank direction",
          why: "RANK() OVER (ORDER BY usage_value DESC) hands rank 1 to Alice Chen's 7,262.35. ASC hands rank 1 to the smallest spender on the board — Chloe at 2,667.93 — and the expansion narrative inverts while every cell stays technically correct.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the board order",
          why: "ORDER BY usage_rank ASC prints the ladder top-down: ranks 1 through 5. DESC prints Chloe's rank-5 row first — the slide reads bottom-up and the meeting opens on the tail instead of the concentration story.",
        },
      ],
      distractors: ["4", "10", "c.name", "SUM", "MAX"],
      walkthrough:
        "Two stages: fold, then rank. The CTE joins 103 team-months to their 16 workspaces, GROUP BY c.id folds each account to one row (team_months beside ROUND(SUM(o.total), 2)), and the HAVING floor keeps five — the tie-heavy block at 4 team-months (Pedro Alvarez, Keiko Sato, Isabella Rossi, Noah Meyer) stays below the cut by design. The outer SELECT ranks by usage_value DESC: Alice Chen EU 24 / 7,262.35 / rank 1, Emma Wilson US 17 / 6,640.56 / 2, Grace Kim APAC 14 / 4,574.23 / 3, Maya Patel APAC 13 / 3,644.56 / 4, Chloe Dubois EU 5 / 2,667.93 / 5 — the probed ladder verbatim, and those five logos are the 63.5% concentration story. The distractors each break differently: 4 in the floor admits the tie block (nine rows, ranks 6/6/6/6 under shared rungs); 10 drops Chloe and the newest win; c.name in the join key compares INTEGER to TEXT and the ladder empties; SUM and MAX are aggregate misuses in the ON, HAVING and ORDER BY positions — the engine rejects them outright. Below the floor the tie policy matters: RANK shares rungs and skips to 10, DENSE_RANK shares without gaps — name the policy on the slide, or the four-way tie becomes an argument.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Share of workspaces that ran their first board inside the trial window out of all signed — the template-funnel's weekly pulse, a distinct-count share with the denominator stated." },
    { slug: "immediate-food-delivery-i", why: "Periods opened within the promised activation window versus late ones — the same conditional rate Miro's period-open SLA read uses on the 82 stamped team-months." },
    { slug: "game-play-analysis-iv", why: "Fraction of workspaces with a billed period the day after signing — Miro's D1 activation read over the 103-period book, denominator questions included." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Which workspace books the most team-months — the argmax at the top of the collaboration ladder (Alice Chen, 24 on this db)." },
    { slug: "find-followers-count", why: "Guest-collaborator counts per board — Miro's famous guest access is a plain GROUP BY fold over the usage-line records." },
    { slug: "queries-quality-and-percentage", why: "Per-unit rates beside share-of-total — the Talktrack read: guided sessions folded beside their percentage of the workshop book." },
    { slug: "average-time-of-process-per-machine", why: "Period-open latency per plan family — booking stamp to go-live stamp, the 2.98-day average sliced by SKU." },
    { slug: "list-the-products-ordered-in-a-period", why: "Which plan SKUs moved in a given month window — the monthly template-funnel restock read the shelf team runs on the 14-month spine." },
    { slug: "game-play-analysis-v", why: "Day-by-day retention after a workspace's first board — the engagement window the workshops pod reads after every launch cohort." },
    { slug: "confirmation-rate", why: "Adoption share per workspace with LEFT JOIN plus conditional average — did the invited collaborator actually join the board." },
    { slug: "department-top-three-salaries", why: "Top-three usage workspaces per region — the regional expansion shortlist customer success builds every quarter." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Workspaces active in the trailing window — the WAU-style engagement cut the workshops pod opens Mondays with." },
    { slug: "feature-adoption-windows", why: "Did the workspace run a Talktrack session within N days of rollout — adoption-window conditional counts, Miro's onboarding health check." },
    { slug: "plan-migration-paths", why: "Starter to Business tier moves as LAG transitions — seat expansion seen as a plan-path problem, not a booking event." },
    { slug: "net-revenue-retention", why: "Seat expansion and contraction walk into NRR — the board metric the monetization pod rebuilds every close from the same period spine." },
    { slug: "bank-account-summary", why: "Billing statements LEFT JOINed to settlement legs per workspace — deposits and withdrawals folded cents-safe, the Miro billing book's daily shape." },
  ],
};
