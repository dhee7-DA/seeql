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
    "Preparation strategy: the pools file carries no Miro section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fate funnels, two-grain censuses, tie-heavy ladders, CASE plan bands and the cents-safe billing spine. Do the topics in order, then run all six case studies on the live storefront db — spaced practice rather than one sitting: the {emerald:creator bench} the template-funnel team opens with, the {sky:collaboration ladder} the expansion review reads, the Monday one-pass fate census, the never-collected dunning stack, the above-the-mean intensity fold, and the shelf roster the catalog team quotes. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "funnel-step-conversion", "new-users-daily-count", "winback-recovery"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "number-of-rich-customers", "article-views-ii", "dau-wau-stickiness", "find-bursty-behavior"],
    },
    {
      name: "Workspaces to periods",
      why: "Workspace accounts carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without a workspace is corruption; a workspace without periods is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employees-with-missing-information", "dormant-reactivation"],
    },
    {
      name: "Collaboration leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 team-months each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax.",
      slugs: ["rank-scores", "top-travellers", "second-highest-salary", "usage-tier-percentiles"],
    },
    {
      name: "Plan-tier CASE banding",
      why: "Workspace tiers are CASE-classified — enterprise, business, starter, free — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the expansion forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "loan-types", "rfm-segmentation"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["growth-accounting", "biggest-window-between-events", "second-day-confirmation", "sessionize-events", "week-over-week-churn"],
    },
    {
      name: "Cohort set algebra",
      why: "Board packets stack populations — opened periods under churned, this quarter beside last — and EXCEPT answers 'which signed workspaces never opened a period'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["monthly-transactions-ii", "the-airport-with-the-most-flights", "customers-who-never-order", "cohort-retention-matrix", "cohort-repeat-revenue"],
    },
    {
      name: "Seat-expansion nested folds",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean — exactly four logos clear it on this db. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i", "mrr-waterfall"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets active-billed, period-open, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-i", "rolling-7d-actives"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices", "deferred-revenue", "ar-aging-schedule", "trial-balance-check"],
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
    {
      id: "miro-t9",
      q: "The deck wants a 3-month moving book beside each month on the period spine. How do you frame the window, and what happens at the edges?",
      a: "The frame says it out loud: AVG(book) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — a strict three-row window, not the default RANGE, which would silently absorb tied months into the same step. The edges are the honest part: the first month has no two preceding rows, so its 'moving average' is a one-row average, the second averages two — the window never invents history, and the deck either labels those rows 'warming up' or pins the frame and accepts the shortfall. ROWS walks row by row; on the month spine ties are rare, but the discipline is the same one the cumulative walk needs. The moving read answers 'what is the trend' while LAG answers 'what just happened' — a Miro review wants both columns and refuses to let one impersonate the other.",
      tag: "windows",
    },
    {
      id: "miro-t10",
      q: "When do you reach for UNION, INTERSECT or EXCEPT instead of a join — and what does each silently do to duplicate rows?",
      a: "Set operators compare whole result rows at one grain; joins compare keys and can fan out. UNION stacks branches and dedups whole rows silently — two byte-identical rows collapse into one and the board loses a workspace with no error, which is why the house rule is UNION ALL plus a comment stating why duplicates are impossible. INTERSECT answers 'which workspaces appear in both sets' — opened a period AND joined a workshop roster. EXCEPT answers the board packet's favorite: 'which signed workspaces never opened a period' — on this clean core a confident zero, all 16 workspaces appear somewhere, and proving that zero is the deliverable. Both sides of any set operator must project the same column count with comparable types; the names do not matter, position does.",
      tag: "sets",
    },
    {
      id: "miro-t11",
      q: "GROUP BY only emits groups that exist. What does that mean for the month-by-status grid, and how do you fill the holes honestly?",
      a: "A month where no period churned produces no churned cell — the group never forms, so the grid simply omits it, and a blank cell in a board deck reads as 'query broken' rather than 'zero churn'. Two honest fills: CASE-pivot arms that END with ELSE 0 turn absent flags into explicit zeros inside a group that does exist, and a LEFT JOIN against a calendar spine — a generated month list — keeps months whose entire row would otherwise vanish. What is never acceptable is inventing rows with NULL counts, or deleting months with zeros, which hides exactly the improvement the churn workstream claims. On the 14-month spine (2024-01 to 2025-02) the churned column is zero in seven months; the deck shows those zeros and says so.",
      tag: "groupby",
    },
    {
      id: "miro-t12",
      q: "'Workspaces above the platform mean' — walk me through the three SQL shapes that answer it and the failure mode each carries.",
      a: "Three shapes, one answer. The derived-table shape: fold per-workspace period counts in a CTE, then filter WHERE team_months > (SELECT AVG(team_months) FROM that CTE) — one pass over the fold, and the mean is computed once (6.44 here, with exactly four logos above it). The correlated shape re-runs an average per outer row — correct, but O(rows × groups) and easy to point at the wrong inner population. The window shape computes AVG(team_months) OVER () beside every row and compares in an outer query, because window output is invisible to WHERE in the same SELECT. The shared failure mode: an empty inner fold returns NULL, the comparison goes UNKNOWN, and the report silently returns nothing — which is why the strong candidate states the inner fold's population and its empty-case behavior unprompted.",
      tag: "subqueries",
    },
    {
      id: "miro-t13",
      q: "Pair every two workspaces that opened a period in the same month — once per pair, not twice. How does the self-join go?",
      a: "Join the period table to itself on the shared month key and kill the mirrors with a strict ordering inequality: ON o1.month = o2.month AND o1.customer_id < o2.customer_id. The inequality does three jobs at once — it kills self-pairs (a workspace paired with itself), kills mirror duplicates ((A,B) surviving but (B,A) not), and leaves every co-activation pair exactly once. An equi-join on month alone delivers every pair twice plus self-pairs; a CROSS JOIN filtered later is the same query with the cost paid up front. The count discipline carries over from the census: after the join, COUNT(*) counts pairs and COUNT(DISTINCT o1.customer_id) counts participating workspaces — two grains the pairing read must keep apart, or the co-activation slide double-counts the fleet.",
      tag: "joins",
    },
    {
      id: "miro-t14",
      q: "Why does the house anti-join use NOT EXISTS (or LEFT JOIN … IS NULL) instead of NOT IN — and what zeros are you prepared to defend on this db?",
      a: "NOT IN compares against a materialized list, and one NULL in that list turns every comparison UNKNOWN — the whole result silently empties while looking valid. NOT EXISTS short-circuits on the first match and is immune to NULLs; LEFT JOIN with the IS NULL keep is the same anti-join at a different shape, and both are honest where NOT IN is a coin flip. The zeros worth defending here: the never-opened-workspace anti-join returns a confident zero — all 16 workspaces appear in the period table — and proving that zero is the analyst's job; the settlement anti-join against the same shape returns 6 never-collected statements worth 15,217. Same query shape, different tables, opposite answers — which is exactly why the zero is always reported with its row count, never assumed.",
      tag: "joins",
    },
    {
      id: "miro-t15",
      q: "Walk me through the period-open latency metric: what does julianday give you, which rows are in the population, and what must the title say?",
      a: "julianday() turns the TEXT stamps into real day numbers so the difference is arithmetic: julianday(shipped_at) - julianday(created_at) — booking to period open. The population is definitional: only the 82 of 103 periods that carry a shipped_at stamp have a latency at all; the 14 trials and 7 churned rows have no cycle to measure, so AVG's NULL-skipping happens to give the right number over the wrong name unless the WHERE clause states the filter. The title carries it: 'booking-to-open over the 82 stamped periods, 2.98-day average, 2-4 day spread'. What is banned is IFNULL-ing the latency to zero to 'include everyone' — that invents same-day openings for trials that never started and drags the 2.98-day norm the trial-queue alert runs on. The COUNT(shipped_at) versus COUNT(*) gap — 21 rows — is the un-opened cohort the funnel exists to watch, reported as a number, not a rounding note.",
      tag: "dates",
    },
    {
      id: "miro-t16",
      q: "A teammate joins two staging tables on workspace NAME and the fold halves. What happened, and what is the key-hygiene policy?",
      a: "Names are labels, not keys: 'Alice Chen', 'alice chen', 'Alice  Chen ' (double space) are three different strings and split one workspace into three fold rows — the census drops from 16 workspaces to more, and no error fires anywhere. The policy: joins run on surrogate ids (customers.id, orders.customer_id), and names are attached for display after the fold; if a name-keyed join is unavoidable, the ingest step normalizes first — TRIM the edges, collapse inner whitespace, agree on case — and the query says so in a comment. Region codes get the same treatment: the census trusts 'EU'/'US'/'APAC'/'LATAM' because they are system-assigned, never typed. The staging copy is exactly where this bites — a re-import with different casing ships a fold that reconciles on the dev box and halves in production.",
      tag: "casing",
    },
    {
      id: "miro-t17",
      q: "The tiering review wants the 16 workspaces sliced into quartiles by lifetime usage. How do NTILE and PERCENT_RANK do it, and what are their edges?",
      a: "NTILE(4) OVER (ORDER BY usage_value DESC) splits the fleet into four row-count tiles — 16 divides evenly here, four workspaces per tile, so no bucket stretches; on uneven counts the earlier tiles absorb the remainder one row at a time, top tile first. NTILE sizes by rows, never by value share — the top tile holding four logos is a population claim, and the separate fact that those logos carry 63.5% of the book needs its own SUM window. PERCENT_RANK() is the continuous cousin: each row's (rank-1)/(rows-1), spanning 0 to 1 across the fleet, which is how the deck says 'this logo sits at the 90th percentile of usage'. Both are window functions — they keep every row, which is why the tiering review can show each workspace WITH its tile instead of collapsing to per-tile averages and losing the spread.",
      tag: "windows",
    },
    {
      id: "miro-t18",
      q: "The ops board needs active-billed, period-open, trial and churned counts in ONE scan. How does FILTER do it, and what makes the result trustworthy?",
      a: "One scan, four branches: COUNT(*) FILTER (WHERE status = 'delivered'), the same for 'shipped', 'pending' and 'cancelled' — each branch counts inside its own predicate while COUNT(*) is the audit anchor. The trustworthiness is the identity: 52 + 30 + 14 + 7 = 103 by construction, because every row lands in exactly one branch and the branches were cut from one pass — four sequential queries are four chances for a WHERE to drift and a census to stop reconciling. The portable twin is SUM(CASE WHEN status = '...' THEN 1 ELSE 0 END) — same one-pass shape for engines without FILTER, with the ELSE 0 arm doing the zero-fill honesty. Money branches ride the same grammar: SUM(o.total) FILTER (WHERE status = 'delivered') folds kept value to 66.5 hundred for EU alone, and the census reconciles in dollars the same way it reconciles in rows.",
      tag: "aggregation",
    },
    {
      id: "miro-t19",
      q: "'Which workspace holds the single biggest period?' — MAX, ORDER BY/LIMIT, or a window? What changes when two workspaces tie?",
      a: "Three shapes, one trap. MAX(total) returns the value 1,088.44 but not its owner — the moment the slide needs a name, you need a row. ORDER BY total DESC LIMIT 1 returns a row but silently resolves ties by scan order — unreproducible, and it hides the tie instead of naming it. ROW_NUMBER() OVER (ORDER BY total DESC, created_at ASC, id ASC) makes the tie-break explicit and deterministic. When two workspaces tie on the biggest period, the policy question is business, not syntax: does the tile show both (RANK semantics, shared rung) or one with a stated rule? The Miro answer: name the tie-break in the query comment and print the tied rows side by side — an argmax that hides a tie is a silent edit of the board's story.",
      tag: "windows",
    },
    {
      id: "miro-t20",
      q: "The latency query is slow on the staging copy. Walk me through how you check whether the index is actually being used.",
      a: "EXPLAIN QUERY PLAN first, instinct never: SEARCH orders o USING INDEX idx_orders_created means the planner walked the index; SCAN orders means it read the whole table. The sargability rule decides which one you get: predicates that reference the raw column — created_at >= '2025-01-01' AND created_at < '2025-02-01' — can walk an index on created_at, while the same logic wrapped in a function (julianday(created_at) > ..., SUBSTR(created_at, 1, 7) = '2025-01') hides the column from the planner and forces a scan no matter what indexes exist. The fix is reshaping the predicate to a half-open range on the raw column, not adding more indexes. And the honesty caveat: 103 rows scans instantly, so this db can't prove performance — it is where the habit is drilled before it matters at fleet scale.",
      tag: "indexes",
    },
    {
      id: "miro-t21",
      q: "The leaderboard's order flips between runs when workspaces tie. What is the fix, and what do you write down?",
      a: "The flip is unresolved ties: ORDER BY usage_value DESC leaves equal rows to scan order, which is not a contract. The fix is a deterministic secondary key — ORDER BY usage_value DESC, workspace ASC — so every run, on every replica, prints the same ladder; ids beat names when names can collide, and the sort key should be a column that exists, not a rounded expression that can merge distinct values. Then write the policy down: a one-line comment above the ORDER BY stating the tie rule, because the expansion review reads rank positions as CS-coverage assignments and 'it was scan order' is not a defensible answer. The deeper habit: reproducibility is part of the deliverable — a leaderboard that can be re-run to a byte-identical result is the only kind a close review accepts.",
      tag: "aggregation",
    },
    {
      id: "miro-t22",
      q: "Where does COALESCE belong in a fold, and when does IFNULL actively lie?",
      a: "COALESCE belongs at the fold: COALESCE(SUM(o.total), 0) wraps the aggregate so a group with no rows reads 0 in the board cell instead of NULL — the empty-region case, not the empty-row case. Per-row COALESCE inside the aggregate is a different tool and often the wrong one: COALESCE(total, 0) inside SUM is harmless on totals but does nothing for an EMPTY group, because the NULL came from zero rows, not from a NULL cell. IFNULL actively lies when it launders a definitional NULL into data — latency IFNULL'd to 0 invents same-day openings for trials that never started; a churned-value NULL (a region with no cancellations) IFNULL'd to 0 is honest ONLY if the deck says 'zero because none occurred', not 'zero because we filled it'. And the guard cousin: NULLIF(denominator, 0) protects every share computation — a 0 denominator would otherwise print an error or an infinity depending on the engine.",
      tag: "nulls",
    },
    {
      id: "miro-t23",
      q: "Walk me through the month-close ritual on the billing tables — which identities must read green before the close ships?",
      a: "Three gates, read in order. Coverage: the invoice-by-payment census must read 21 exact / 1 partial (statement #25, 4,000.00 of 6,148.00 settled) / 6 never-collected worth 15,217 — and the anti-join behind it catches the status that lies: #28 marked 'paid' with zero payment legs. Anomaly mirrors: a void statement WITH a leg (#11, 925.00) never appears in the never-collected anti-join — the two error modes point in opposite directions and both land on the row-level anomaly list, not on vibes. Then the GL: the ledger trial balance must land at 181,080 debits against 181,080 credits, delta zero — a penny of drift means the close does not ship and tomorrow starts with an incident. Every one of those is a fold over INTEGER cents, so the dollar read is amount_cents / 100.0 all the way through — the close's arithmetic has no room for an integer-division truncation.",
      tag: "quality",
    },
    {
      id: "miro-t24",
      q: "The interviewer asks for 'activation rate'. What do you say before you write a single line of SQL?",
      a: "You define the denominator out loud, because 'activation rate' is a family of numbers, not one. Which rows are in the base — all 103 booked periods, or only the 82 that carry a shipped_at stamp, or only the 96 non-churned? Which event counts as activated — period opened (the stamp), first usage line booked, or a Talktrack session run? Which grain does the slide report — workspace logos (16) or period rows (103)? The house habit is to state the definition, state the population, then compute — 52 delivered of 103 booked is a 50.5% active-billed rate with trials and in-flight periods deliberately left in the denominator, and saying that sentence before writing SQL is what the panel is actually grading. The follow-up trap is always the same: change the denominator silently and every comparison on the deck stops reconciling to the same 103.",
      tag: "pipeline",
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
    {
      id: "miro-mcq-11",
      prompt: "A slide wants the top 5 workspaces by lifetime usage. The analyst writes SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name LIMIT 5 — no ORDER BY. What ships?",
      choices: ["An arbitrary five — without ORDER BY the rows arrive in scan order, so 'top 5' is whichever five the planner hands over first", "A syntax error — LIMIT requires ORDER BY in SQLite", "The five smallest workspaces — LIMIT takes from the end", "Exactly the top five, because GROUP BY sorts by the fold key"],
      answer: 0,
      why: "LIMIT caps how many rows, never which rows. Without ORDER BY the five are scan-order luck, and the slide's 'top workspaces' changes between runs and replicas. The fix is ORDER BY SUM(o.total) DESC before LIMIT 5 — the sort defines the claim.",
      notes: [
        { choice: 1, why: "LIMIT without ORDER BY is legal everywhere in SQLite — that is exactly what makes it dangerous: the query runs and the answer is still wrong." },
        { choice: 3, why: "GROUP BY orders by the grouping key at best (never guaranteed), and the fold key here is the workspace name — nothing about it sorts usage value." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-12",
      prompt: "An analyst joins order_items to orders for a usage read and reports SUM(o.total) = 103,244.55. The period book is 34,833.28. What happened?",
      choices: ["The join fanned each period out to its usage lines — every period's total repeats once per line (251 lines over 103 periods), inflating the fold", "Floating-point rounding accumulated across 251 rows", "order_items carries shadow copies of the period totals", "Churned periods leaked into the SUM"],
      answer: 0,
      why: "After the join there is one row per usage line, and each row carries its period's full total — SUM(o.total) counts every period once per line. The 3x inflation is structural, not arithmetic; period-level totals need the periods table alone or a DISTINCT-by-period fold.",
      notes: [
        { choice: 1, why: "Rounding noise is cents; the gap here is 68,411 — a join-grain problem, not a float problem." },
        { choice: 3, why: "Statuses filter rows; they cannot fix a fan-out. Filtering to 'delivered' still repeats each kept period once per usage line." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-13",
      prompt: "The catalog team asks how many plan families the SKU shelf carries. Which query is right, and what does it print?",
      choices: ["SELECT COUNT(category) FROM products — 16", "SELECT COUNT(DISTINCT category) FROM products — 7", "SELECT COUNT(DISTINCT id) FROM products — 7", "SELECT SUM(DISTINCT category) FROM products — 7"],
      answer: 1,
      why: "The shelf holds 16 SKUs across 7 category codes; COUNT(DISTINCT category) folds SKUs to families and prints 7. COUNT(category) counts SKU rows — a different grain wearing the same word.",
      notes: [
        { choice: 2, why: "COUNT(DISTINCT id) is 16 — SKUs, not families. The DISTINCT is doing nothing: every id is already unique." },
        { choice: 3, why: "SUM over TEXT codes returns 0.0 — aggregate misuse, not a fold. Text folds with COUNT(DISTINCT), never SUM." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-14",
      prompt: "A trend query buckets the period spine with STRFTIME('%m', created_at) and returns two rows. Diagnosis?",
      choices: ["'%m' extracts the bare month — January 2024 and January 2025 merge into one bucket; the key needs the year too ('%Y-%m' or SUBSTR(created_at, 1, 7))", "STRFTIME cannot parse date-only TEXT", "The spine really has two months of data", "Missing ORDER BY collapsed the buckets"],
      answer: 0,
      why: "'%m' alone produces '01'…'12', so all 2024 Januaries and 2025 Januaries fold together — the 14-month spine (2024-01 to 2025-02) collapses to a 12-row or 2-row fiction depending on the data. The year must ride in the key.",
      notes: [
        { choice: 1, why: "STRFTIME parses 'YYYY-MM-DD …' TEXT fine — the format string is the bug, not the input." },
        { choice: 3, why: "ORDER BY never changes how many groups exist. GROUP BY is where the collapse happened." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-15",
      prompt: "A teammate rewrites the kept census as COUNT(status = 'delivered') instead of SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) and prints 103 instead of 52. Why?",
      choices: ["COUNT counts non-NULL values, and the boolean yields 0 or 1 — both non-NULL — so every row counts; the flag needs SUM or COUNT(CASE WHEN … THEN 1 END)", "COUNT ignores boolean expressions and counts rows where status is not NULL", "SQLite coerces the comparison to the string 'delivered'", "The query is missing GROUP BY"],
      answer: 0,
      why: "COUNT(expr) skips only NULLs. status = 'delivered' never returns NULL — it returns 0 or 1, both countable — so the census prints the whole table (103). SUM adds the flags and reads 52; COUNT(CASE WHEN status = 'delivered' THEN 1 END) works because the ELSE arm is NULL and skipped.",
      notes: [
        { choice: 1, why: "It IS counting non-NULL values — the point is that 0 is non-NULL too. The misconception is 'COUNT = filtered count'." },
        { choice: 3, why: "GROUP BY would split the error across rows, not fix it. The boolean trap is orthogonal to grouping." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-16",
      prompt: "The deck wants each month beside the NEXT month's book to preview momentum. The analyst uses LAG and February's 'next' column shows January. Which function is right, and what does the last row show?",
      choices: ["LEAD — it reads the following row; under LEAD the last month's next-book is NULL, just as the first row's prior-book is NULL under LAG", "LEAD — and the last row shows the grand total", "LAG is correct — February's next IS January because the spine sorts DESC", "Neither — neighbor reads need a self-join on month"],
      answer: 0,
      why: "LAG looks backward, LEAD forward — the edge row in the peek's direction has no neighbor and prints NULL by definition, the honest 'no next month yet'. Swapping the function flips every row into its neighbor; no sort order fixes that.",
      notes: [
        { choice: 1, why: "SUM OVER builds a running total, not a neighbor peek — a different metric wearing the same column slot." },
        { choice: 2, why: "Direction is set by the function, not the sort. And the house spine sorts ASC — February's neighbor in time is March, never January." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-17",
      prompt: "WHERE RANK() OVER (ORDER BY total) <= 5 to keep the five biggest periods — the engine answers 'misuse of window function'. Why, and what is the fix?",
      choices: ["Window functions evaluate after WHERE, so the rank does not exist yet — rank in a CTE or derived table and filter in the outer query", "RANK requires PARTITION BY before it can be filtered", "The comparison must be = not <= for window columns", "SQLite reserves RANK for HAVING only"],
      answer: 0,
      why: "The logical pipeline runs WHERE before the SELECT's window computations — the rank is not computable at filter time, and SQLite rejects it outright. The house shape stages the ranked set (CTE or subquery) and applies the threshold one layer out.",
      notes: [
        { choice: 1, why: "PARTITION BY is optional and unrelated to evaluation order — the error is about pipeline phase, not window scope." },
        { choice: 2, why: "ROW_NUMBER errors identically in WHERE — same phase problem. The comparison operator was never the issue." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-18",
      prompt: "The shelf roster folds SKUs with GROUP_CONCAT(p.name) per family. Re-run on a staging copy, the names arrive in a different order inside the cell. What is the discipline?",
      choices: ["GROUP_CONCAT's order is unspecified — feed it a sorted subquery or sort in the reader, and never publish an unordered concat as the canonical roster", "GROUP_CONCAT alphabetizes by default; the staging copy has different collation", "Declare a separator or the order drifts", "Add DISTINCT to stabilize the order"],
      answer: 0,
      why: "SQLite concatenates in scan order and promises nothing — the same db copy can yield different orders after a VACUUM or plan change. Canonical rosters come from folding a deterministically ordered subquery (ORDER BY inside the FROM) or sorting client-side; the roster's order is part of the deliverable.",
      notes: [
        { choice: 1, why: "There is no default alphabetization to lose — the promise never existed, which is the actual hazard." },
        { choice: 3, why: "DISTINCT dedups values; it says nothing about order. And none of these SKUs repeat within a family anyway." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-19",
      prompt: "Compare each period to ITS workspace's average period value. Which shape answers that, and at what cost?",
      choices: ["A correlated subquery — the workspace-average fold re-runs for every outer row; correct but O(rows × groups), with the window twin (AVG OVER PARTITION BY workspace) cheaper on the same db", "A scalar subquery over the whole orders table — one average for everyone", "A GROUP BY with HAVING — averages belong in HAVING", "A CROSS JOIN to the averages table"],
      answer: 0,
      why: "The question is per-workspace context, so the inner fold must reference the outer row's workspace — that is correlation, and it re-executes per row. The window twin computes the same per-workspace average once per partition; both are correct, and naming the cost difference is the senior part of the answer.",
      notes: [
        { choice: 1, why: "The platform mean (338.19) answers 'above the house average' — a different question. Every workspace's own mean is what 'ITS workspace's' asks for." },
        { choice: 2, why: "HAVING filters whole groups after folding — it cannot compare each period row to its group's mean row by row." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-20",
      prompt: "Statement #25 shows 4,000.00 settled against 6,148.00 due, in INTEGER cents. An analyst computes paid/amount as 400000/614800 and publishes 0 percent coverage. Fix?",
      choices: ["Promote to real arithmetic before the division — 400000.0/614800.0 or 100.0*paid/amount — because INTEGER/INTEGER truncates to 0 first", "ROUND(400000/614800, 2) restores the decimals", "CAST the result to REAL after dividing", "Divide both sides by 100 first"],
      answer: 0,
      why: "The division happens in integer space and truncates before any later ROUND or CAST sees it — 400000/614800 is 0, full stop. The cents-safe read multiplies by 100.0 first or writes one side as a REAL, printing the honest 65.1 percent.",
      notes: [
        { choice: 1, why: "ROUND receives the already-truncated 0 and rounds it to 0 — the damage is upstream of rounding." },
        { choice: 3, why: "4000/6148 is still INTEGER/INTEGER — same truncation, smaller numbers. Type, not scale, is the bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-21",
      prompt: "'Which signed workspaces never opened a period?' ships as an EXCEPT. What does it return on this db, and what must both sides share?",
      choices: ["A confident zero — all 16 workspaces appear in the period table; EXCEPT requires both sides to project the same column count with comparable types", "Six workspaces — mirroring the never-collected statements", "One workspace — the smallest account", "An error — EXCEPT needs identical table names on both sides"],
      answer: 0,
      why: "SELECT id FROM customers EXCEPT SELECT customer_id FROM orders compares whole rows: 16 signed ids minus every id that appears in orders. On the clean core that is a proven zero — and proving the zero is the deliverable, because the same shape against invoices/payments returns 6 rows, not 0.",
      notes: [
        { choice: 1, why: "6 / 15,217 is the settlement anti-join — a different table pair. The workspace anti-join is the confident zero." },
        { choice: 2, why: "Set operators match positionally, never by name — the projections just need the same shape, which is why the query is legal at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-22",
      prompt: "Which predicate can walk an index on orders.created_at, and why?",
      choices: ["created_at >= '2025-01-01' AND created_at < '2025-02-01' — a range on the raw column; julianday(created_at) > … or SUBSTR(created_at, 1, 7) = '2025-01' hide the column and force a scan", "Both — the planner rewrites julianday automatically", "Neither — 103 rows always scan", "The julianday version — functions pre-sort better"],
      answer: 0,
      why: "Sargability: the index stores raw created_at values, so only predicates referencing the raw column can seek into it. Function-wrapped columns are opaque to the planner — the fix is reshaping to a half-open range on the raw stamp, not adding more indexes.",
      notes: [
        { choice: 1, why: "No rewrite happens — expression-wrapped columns are unsargable in SQLite, period. This is the habit that breaks at fleet scale." },
        { choice: 2, why: "Size is irrelevant to the principle. The 103-row db is where the habit is drilled, not where it pays." },
      ],
      difficulty: "hard",
    },
    {
      id: "miro-mcq-23",
      prompt: "Pair every two workspaces that opened a period in the same month — each pair exactly once. Which shape is right?",
      choices: ["A self-join with a strict ordering inequality: o1.customer_id < o2.customer_id on the shared month — it kills self-pairs and mirrors in one move", "An equi-self-join on month alone — then dedupe in the client", "GROUP_CONCAT over the month — pairs fold into a string", "A CROSS JOIN filtered by created_at equality"],
      answer: 0,
      why: "The inequality a.id < b.id is the pair-once idiom: it removes self-pairs, keeps exactly one direction of each mirror pair, and leaves every co-activation pair counted once. An equi-join on month alone delivers every pair twice plus the self-pairs — double-counting the co-activation read.",
      notes: [
        { choice: 1, why: "Client-side dedup of (A,B)/(B,A) is the same logic done downstream — slower, and one forgotten key doubles the slide's numbers." },
        { choice: 2, why: "Strings are presentation, not pairing logic — you cannot join on a folded string without losing who paired with whom." },
      ],
      difficulty: "hard",
    },
    {
      id: "miro-mcq-24",
      prompt: "One deck prints average period value as 338.19, another as 370.15 — both over the same orders table. Reconcile.",
      choices: ["338.19 is the per-period mean over all 103 rows; 370.15 is the mean of the 16 per-workspace means — big multi-period workspaces pull the row-level mean down; name the grain before publishing either", "One of them rounded wrong", "370.15 excludes churned periods", "338.19 is the median"],
      answer: 0,
      why: "Average-of-averages weights every workspace equally; the row-level mean weights every period equally. Alice Chen's 24 periods at 302.60 average drag the row mean toward her book while counting once in the workspace mean — both numbers are honest about different grains, and only one belongs on a given slide.",
      notes: [
        { choice: 2, why: "Both folds include every status — nothing was filtered. The gap is weighting, not population." },
        { choice: 3, why: "Neither is a median — the spread runs 25.47 to 1,088.44 and the means sit nowhere near the middle row." },
      ],
      difficulty: "hard",
    },
    {
      id: "miro-mcq-25",
      prompt: "Two workspaces tie on usage value and the leaderboard's order flips between runs. The fix?",
      choices: ["Add a deterministic secondary key — ORDER BY usage_value DESC, workspace ASC — and write the tie policy in the query comment", "Wrap the sort column in ROUND", "Switch RANK to ROW_NUMBER", "Nothing — ORDER BY is deterministic by definition"],
      answer: 0,
      why: "Unresolved ties fall to scan order, which is not a contract — replicas and re-runs can both flip. A secondary key that always differs (name, then id) makes the output byte-identical every run, and the comment makes the policy reviewable rather than accidental.",
      notes: [
        { choice: 1, why: "ROUND cannot break a tie between equal values — rounding equal inputs yields equal outputs." },
        { choice: 3, why: "Sort stability is never guaranteed; treating it as deterministic is how 'it changed between runs' bugs ship." },
      ],
      difficulty: "hard",
    },
    {
      id: "miro-mcq-26",
      prompt: "Slice the 16 workspaces into usage quartiles for the tiering review. What does NTILE(4) OVER (ORDER BY usage_value DESC) return?",
      choices: ["Four row-count tiles of 4 workspaces each — 16 divides evenly; on uneven counts the earlier tiles absorb the remainder one row at a time", "Four tiles sized by value — the top tile holds 63.5% of the book", "One tile per region", "An error — NTILE requires PARTITION BY"],
      answer: 0,
      why: "NTILE is a row-count splitter: it sizes tiles by population, not by value. The top quartile being four logos is a population claim — the separate fact that those four carry 63.5% of the 34,833.28 book needs its own SUM window and its own line on the slide.",
      notes: [
        { choice: 1, why: "Value share is a different metric — concentration, not tiling. NTILE never weights by the ORDER BY expression's magnitude." },
        { choice: 3, why: "PARTITION BY is optional; without it the whole fleet is one partition, which is exactly what a quartile cut wants." },
      ],
      difficulty: "hard",
    },
    {
      id: "miro-mcq-27",
      prompt: "A region with no cancelled periods prints NULL in the churned-value column. Where does COALESCE belong?",
      choices: ["At the fold — COALESCE(SUM(...), 0) wraps the aggregate so the empty branch reads 0 without inventing zeros for underlying rows", "Per row — COALESCE(total, 0) inside the SUM", "In the WHERE clause", "Nowhere — NULL is fine in a board cell"],
      answer: 0,
      why: "The NULL comes from zero rows, not from a NULL cell — only wrapping the aggregate fixes it. At the fold, the board cell reads 0 and the deck can label it 'zero because none occurred'; per-row COALESCE does nothing here because no rows ever arrived to coalesce.",
      notes: [
        { choice: 1, why: "Per-row COALESCE is harmless on totals but structurally cannot help an empty group — the classic wrong-tool fix." },
        { choice: 3, why: "A blank churned cell reads as 'query broken' in a review. The honest zero, labeled, is the deliverable." },
      ],
      difficulty: "easy",
    },
    {
      id: "miro-mcq-28",
      prompt: "The quarter cut uses BETWEEN '2024-03-01' AND '2024-03-31' on TEXT timestamps that carry times. What does it drop?",
      choices: ["The last night — '2024-03-31 14:32:00' sorts after '2024-03-31', so March 31st's afternoon bookings fall outside; the house shape is half-open: >= '2024-03-01' AND < '2024-04-01'", "The first day of the quarter", "Nothing — BETWEEN is inclusive on both ends", "Nothing — TEXT timestamps cannot carry times"],
      answer: 0,
      why: "BETWEEN is inclusive of the literal endpoints, and '2024-03-31' as a TEXT prefix sorts before every same-day timestamp with a time component — everything after midnight on the 31st is dropped. Month-end is exactly when planning workshops convert, so the house rule is half-open ranges: lower-inclusive, upper-exclusive.",
      notes: [
        { choice: 2, why: "Inclusivity is the bug, not the feature — the upper bound matches the day's midnight, not its bookings." },
        { choice: 3, why: "The db stores 'YYYY-MM-DD HH:MM:SS' TEXT — the time suffix is what breaks the naive BETWEEN." },
      ],
      difficulty: "hard",
    },
    {
      id: "miro-mcq-29",
      prompt: "The ops board needs active-billed, period-open, trial and churned counts in one scan. What is the accepted shape, and why not four queries?",
      choices: ["COUNT(*) FILTER (WHERE status = …) per branch — SUM(CASE WHEN … THEN 1 ELSE 0 END) as the portable twin — one pass, one GROUP BY, reconciling to 103 by construction", "FILTER is presentation sugar with no aggregate semantics", "Four queries — simpler, and the results always agree", "MAX(CASE …) per status"],
      answer: 0,
      why: "FILTER branches are real aggregates — each counts within its own predicate during one pass over one GROUP BY. The trust argument is the identity: 52 + 30 + 14 + 7 = 103 by construction. Four sequential queries re-scan four times and drift the moment one gains a WHERE the others miss.",
      notes: [
        { choice: 1, why: "FILTER inside COUNT/SUM is the aggregate itself — that is the whole point, not decoration." },
        { choice: 3, why: "MAX of a 0/1 flag is 1 on any non-empty group — a census of nothing. The branch functions are COUNT or SUM." },
      ],
      difficulty: "medium",
    },
    {
      id: "miro-mcq-30",
      prompt: "The month-by-status grid omits every month with zero churned periods. What is the honest fix?",
      choices: ["Fill with structure, not silence — ELSE 0 arms inside the CASE pivot for in-group zeros, a LEFT JOIN to a calendar spine for absent months, and a deck label that says 'no churned periods'", "Insert rows with NULL counts to mark the missing months", "Drop months with any zero from the deck", "ORDER BY hides the gap well enough"],
      answer: 0,
      why: "GROUP BY only emits groups that exist — a month with no churned row produces no churned cell. The grid fills those holes with explicit zeros (ELSE 0 inside groups that do exist) and a calendar spine for months that would vanish entirely, labeled as zeros-because-none — never NULL placeholders, never deletion.",
      notes: [
        { choice: 1, why: "NULL counts invent data — they read as 'we did not measure' when the truth is 'we measured zero'." },
        { choice: 2, why: "Deleting zero-months hides exactly the improvement the churn workstream is claiming credit for." },
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
    {
      id: "cs-miro-3",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Miro-flavored brief on the storefront db: the Monday growth check is one query over the whole period book, folded per region — periods booked, active-billed, period-open, trials, and the dollar value of what actually kept — every branch cut from a single pass so the census reconciles to 103 by construction. Probed facts: EU runs 45 periods (24 active-billed, 12 period-open, 6 trials, kept value 6,656.18), APAC 37 (21 / 8 / 5 / 6,617.68), US 19 (5 / 10 / 3 / 1,444.77), LATAM 2 (both active-billed, nothing open, nothing in trial, 852.44). The read is the youngest-fleet story: the US books 5 of 19 at term while 10 sit period-open. The review reads the biggest period base first and keeps every region — the floor sits low on purpose, because a region vanishing from the census is exactly the incident this query exists to catch.",
      ask: "Return each region with its period count, active-billed count, period-open count, trial count and kept value to 2 decimals, biggest period base first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS periods,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS at_term,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS live_open,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS trials,\n       ROUND({2}(o.total) FILTER (WHERE o.status = 'delivered'), 2) AS kept_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY periods {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the active-billed literal",
          why: "Active-billed is status 'delivered' — 24 EU, 21 APAC, 5 US, 2 LATAM (52 platform-wide). 'shipped' would copy the period-open column underneath it (12, 8, 10, 0) and the review would book activations before a single term finished; 'pending' would report the 14 trials as kept contracts.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the kept-value folder",
          why: "SUM(o.total) folds kept periods into dollars — 6,656.18 / 6,617.68 / 1,444.77 / 852.44. COUNT would print row counts (24, 21, 5, 2) wearing a money name, and the expansion budget would be sized in periods instead of dollars.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the keep-everyone floor",
          why: "HAVING COUNT(*) >= 2 keeps all four regions — LATAM's 2 periods included, because a region dropping out of the census IS the finding. 20 would cut the US and LATAM rows and the review would open on a fleet that looks two regions larger than it is.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-base-first direction",
          why: "The review reads biggest period base on top: 45, 37, 19, 2. ASC would open the meeting on LATAM's two periods — a correct census aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "COUNT", "MAX", "20", "ASC"],
      walkthrough:
        "One scan, four branches, one identity. The join attaches every period to its workspace's region, GROUP BY region folds 103 rows into four, and each FILTER branch counts inside the same pass: at_term reads 24 / 21 / 5 / 2 (the 52 active-billed), live_open reads 12 / 8 / 10 / 0 (the 30 period-open), trials reads 6 / 5 / 3 / 0 (the 14 pending), and the money arm SUMs kept value to 6,656.18 / 6,617.68 / 1,444.77 / 852.44. COUNT(*) is the audit anchor — 45 / 37 / 19 / 2, summing to 103 by construction, which is the identity the Monday check exists to enforce. The distractors each break differently: 'shipped' in the term slot makes at_term a copy of the live_open column and quietly deletes the 52-period kept story; 'cancelled' reports churn counts where kept contracts belong; COUNT in the money slot prints period counts where the winback dollars belong; MAX prints one period's value; 20 in the floor slot deletes the US and LATAM rows — a census that sheds regions between runs is precisely the drift the one-pass construction was chosen to prevent; ASC flips the read order. The read the review wants: the US runs the youngest fleet (5 of 19 at term but 10 live) while LATAM kept everything it ever booked — and owns zero trials.",
    },
    {
      id: "cs-miro-4",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-collected statements",
      brief:
        "Miro-flavored brief on the storefront db: billing's morning rule is that payment rows are the ledger of record and the invoice status is a claim — so before any reminder goes out, the dunning list is the anti-join of statements against settlement legs. Probed facts: 6 statements worth 15,217 have never been touched by a payment leg — Emma Wilson (US) #24 at 4,937.00 open, Liam O'Brien (EU) #26 at 3,562.00, Isabella Rossi (EU) #27 at 2,794.00, Hiro Tanaka (APAC) #28 at 1,756.00 — marked 'paid' with zero legs: a status that lies — Chloe Dubois (EU) #21 at 1,295.00, and Pedro Alvarez (EU) #18 at 873.00. The mirror anomaly sits the other way: statement #11 is void at 925.00 and still carries a leg, so it never appears in this list. The list reads biggest amount first.",
      ask: "Return each never-collected statement with its workspace, region, claimed status and amount due to 2 decimals, biggest amount first.",
      template:
        "SELECT c.name AS workspace,\n       c.region AS region,\n       i.status AS claimed_status,\n       ROUND(i.amount_cents / {1}, 2) AS amount_due\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nJOIN customers c ON c.id = {3}\nWHERE p.id IS {4}\nORDER BY amount_due {5};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Statements carry INTEGER cents, so the dollar read is amount_cents / 100.0 — printing 4,937.00 instead of 493700. Dividing by 1000 shrinks every amount tenfold; dividing by the customer id re-keys money to account numbers; an integer 100 truncates nothing here but skips the .0 that keeps every odd-cent row honest.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "payments.invoice_id = i.id attaches each settlement leg to the statement it settles. c.id would attempt to match legs against account ids — coincidental overlaps fabricate coverage while real duns vanish from the list.",
        },
        {
          answer: "i.customer_id",
          kind: "keyword",
          label: "the account join key",
          why: "customers.id = i.customer_id names the workspace behind the statement. c.id = c.id pairs every statement with every account (28 × 16 rows) and the dunning list becomes a cartesian fiction; p.invoice_id in this position compares account ids to leg ids and drops every row.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the never-collected keep",
          why: "p.id IS NULL keeps only statements with no matching leg — the 6-row dunning list. NOT NULL flips the read to the 22 settled statements and bills the wrong population; the anti-join's NULL test is the whole point of the LEFT JOIN.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-amount-first direction",
          why: "Dunning works biggest-first: Emma's 4,937.00 tops the list, Pedro's 873.00 closes it. ASC opens the run on the smallest balance and buries the four-figure exposures below the fold.",
        },
      ],
      distractors: ["1000", "c.id", "NOT NULL", "ASC"],
      walkthrough:
        "An anti-join with a money conversion. The LEFT JOIN carries every statement's legs across, the WHERE p.id IS NULL keeps only the statements no leg ever touched — 6 of 28 — and the customers INNER JOIN names each account without losing a row, because every statement carries a valid customer_id. The list reads exactly as probed: Emma Wilson US 4,937.00, Liam O'Brien EU 3,562.00, Isabella Rossi EU 2,794.00, Hiro Tanaka APAC 1,756.00 — claimed 'paid', zero legs, the status that lies — Chloe Dubois EU 1,295.00, Pedro Alvarez EU 873.00; 15,217 total against the book's settlement spine of 21 exact-covered and 1 partial (statement #25, 4,000.00 of 6,148.00). The distractors each break differently: 1000 divides cents by a thousand and shrinks every balance tenfold; c.id re-keys the statement join to account ids and the account join to a cartesian mirror; NOT NULL flips the anti-join into the settled list; ASC buries the four-figure duns. The mirror check closes the read: void statement #11 (925.00) carries a leg and never appears here — the two error modes point in opposite directions, which is why the anomaly list is row-level, never inferred from this one query.",
    },
    {
      id: "cs-miro-5",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The above-the-mean fold",
      brief:
        "Growth-board brief, in-world: the expansion review's first filter is intensity — which workspaces carry MORE team-months than the platform's own mean, computed from the same fold and not pasted in from a spreadsheet. Probed on the storefront db: 103 periods fold to 16 workspaces, mean 6.44 team-months (6.4375 unrounded), and exactly four logos clear it — Alice Chen (EU) 24 team-months / 7,262.35 usage value, Emma Wilson (US) 17 / 6,640.56, Grace Kim (APAC) 14 / 4,574.23, Maya Patel (APAC) 13 / 3,644.56. Chloe Dubois sits at 5 — below the mean despite a 2,667.93 book, which is why the threshold is periods, not dollars. The slide reads biggest fold first.",
      ask: "Return each workspace whose team-month count beats the computed platform mean, with region, count and usage value to 2 decimals, biggest count first.",
      template:
        "WITH workspace_folds AS (\n  SELECT c.name AS workspace,\n         c.region AS region,\n         COUNT(*) AS team_months,\n         ROUND(SUM(o.total), 2) AS usage_value\n  FROM customers c\n  JOIN orders o ON o.customer_id = {1}\n  GROUP BY c.id, c.name, c.region\n)\nSELECT workspace, region, team_months, usage_value\nFROM workspace_folds\nWHERE team_months {2} (SELECT {3}(team_months) FROM workspace_folds)\nORDER BY team_months {4};",
      slots: [
        {
          answer: "c.id",
          kind: "keyword",
          label: "the workspace join key",
          why: "o.customer_id = c.id attaches each team-month to its workspace before the fold. c.name compares an INTEGER id to TEXT and the fold empties; o.id re-keys periods to their own ids and the counts collapse to fictions.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-mean operator",
          why: "The brief says MORE than the mean — strict >. = asks for workspaces exactly AT the mean (none exist: the mean is 6.4375 and counts are integers) and returns zero rows; < returns the twelve below-mean logos, the opposite slide.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the computed threshold",
          why: "The mean of the 16 folds is 6.44 — the threshold the brief demands be computed, not pasted. MAX sets the bar at 24 and only Alice clears it; MIN sets it at 1 and everyone qualifies; COUNT returns 16 and the filter keeps nobody.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-fold-first direction",
          why: "The slide reads biggest fold on top: 24, 17, 14, 13. ASC opens on Maya's 13 and the intensity story reads backwards.",
        },
      ],
      distractors: ["c.name", "o.id", "<", "=", "MAX", "ASC"],
      walkthrough:
        "Stage the fold, then judge it against its own mean. The CTE joins 103 team-months to their 16 workspaces and GROUP BY c.id folds each account to one row — the only grain the mean makes sense at. The outer SELECT filters team_months against (SELECT AVG(team_months) FROM workspace_folds): a computed scalar, 6.4375, over the same staged fold — one pass, no pasted constant, no drift between threshold and data. Four rows survive: Alice Chen EU 24 / 7,262.35, Emma Wilson US 17 / 6,640.56, Grace Kim APAC 14 / 4,574.23, Maya Patel APAC 13 / 3,644.56 — the probed intensity set, and the same four logos that anchor the 63.5% concentration read. The distractors each break differently: c.name and o.id in the join key empty the fold or re-key it to nonsense; < returns the twelve below-mean workspaces — the anti-slide; = returns zero because no integer count equals a 6.4375 mean; MAX moves the threshold to Alice's own 24 and the review reads one row; ASC flips the read order. The empty-inner-query caveat is the senior beat: filter the staging fold to one region and the mean still computes, but the population silently changes — state what the inner fold holds, or the threshold lies.",
    },
    {
      id: "cs-miro-6",
      tier: "easy",
      topic: "x1",
      universe: "catalog",
      title: "The plan-SKU shelf roster",
      brief:
        "Catalog-team brief, in-world: the shelf review opens with one query over the plan-SKU shelf — per add-on family, how many SKUs list, WHICH SKUs they are (folded into one roster cell), what the family's shelf lists for, and the average list. Probed on the storefront db: 16 SKUs across 7 families — Audio leads at 328.98 shelf value (3 SKUs, ceiling 149.99), Wearables 278.99 (2, ceiling 199.99), Electronics 173.49 (3), Video 168.99 (2, ceiling 129), Apparel 83.50 (2), Accessories 82.48 (3), Fitness 32.00 (1 SKU, the Yoga Mat alone). The roster cell is the deliverable merch quotes from — which listings actually sit on the shelf, family by family. The review reads biggest shelf value first.",
      ask: "Return each family with its SKU count, the folded roster of SKU names, shelf value to 2 decimals, average list price to 2 decimals and the family ceiling, biggest shelf value first.",
      template:
        "SELECT p.category AS family,\n       COUNT(*) AS skus_listed,\n       {1}(p.name) AS shelf_roster,\n       ROUND(SUM(p.price), {2}) AS shelf_value,\n       ROUND(AVG(p.price), 2) AS avg_list,\n       MAX(p.price) AS list_ceiling\nFROM products p\nGROUP BY p.category\nORDER BY shelf_value {3};",
      slots: [
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the roster folder",
          why: "GROUP_CONCAT folds each family's SKU names into one cell — the roster merch quotes from. COUNT would print the SKU count twice under two names; SUM over names returns 0.0 per family; MAX returns one name, not a shelf.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the shelf precision",
          why: "Shelf value prints to 2 decimals — Audio's 328.98. One decimal rounds the Accessories shelf to 82.5 and the folio stops reconciling with the catalog team's copy to the cent.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-shelf-first direction",
          why: "The review reads biggest shelf value on top: 328.98, 278.99, 173.49, 168.99, 83.50, 82.48, 32.00. ASC opens the meeting on the single-SKU Fitness shelf.",
        },
      ],
      distractors: ["COUNT", "SUM", "MAX", "1", "ASC"],
      walkthrough:
        "One table, one fold, a string cell done honestly. GROUP BY family folds the 16-SKU shelf into seven rows; GROUP_CONCAT(p.name) carries the roster per family — Audio reads Noise-Canceling Headset, Studio Desktop Mic, Bluetooth Speaker Mini — and the money columns ride the same pass: ROUND(SUM(p.price), 2) at 328.98 / 278.99 / 173.49 / 168.99 / 83.50 / 82.48 / 32.00, AVG at 109.66 / 139.50 / 57.83 / 84.50 / 41.75 / 27.49 / 32.00, and the ceiling per family (149.99, 199.99, 89.99, 129, 65, 42.50, 32). The counts pair with the money: Electronics lists 3 SKUs for 173.49 while Fitness lists 1 for 32.00 — shelf breadth and shelf value are different stories, and this query refuses to let one impersonate the other. The distractors each break differently: COUNT in the roster slot prints the count twice under two names; SUM over TEXT names returns 0.0 per family; MAX prints one name where a shelf belongs; 1 in the precision slot drifts every shelf value off the cents-honest folio; ASC inverts the read order and the meeting opens on the 32.00 single. The roster's internal order is scan-order by SQLite's rules — canonical rosters fold a sorted subquery, and the catalog team says so on the slide.",
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
    { slug: "dau-wau-stickiness", why: "Weekly-over-daily active ratio with honest active definitions — the stickiness read behind Miro's claim that boards are a daily habit, not a monthly visit." },
    { slug: "rolling-7d-actives", why: "Trailing-window actives over the workspace fleet, zeros included — the rolling frame behind the Monday engagement tile the workshops pod opens with." },
    { slug: "sessionize-events", why: "Stitching usage lines into board sessions by gap length — the telemetry shape behind every time-to-first-board claim Miro's onboarding team makes." },
    { slug: "find-bursty-behavior", why: "Burst detection across workshop weeks — activity spikes hard during facilitated sessions and the calm weeks between them are the denominator trap." },
    { slug: "usage-tier-percentiles", why: "Percentile tiering of workspace usage — which tile a logo sits in decides CS coverage, and the tie handling needs a named policy." },
    { slug: "rfm-segmentation", why: "Recency-frequency-value CASE bands over workspaces — the segment grid behind Miro's expansion queues and win-back calendars." },
    { slug: "new-users-daily-count", why: "First-board cohorts counted by day — activation measured on the day it happens, with the sign-base denominator stated." },
    { slug: "cohort-retention-matrix", why: "Sign-month by activity-month retention grid — the cohort matrix growth reviews open with, zero months filled honestly." },
    { slug: "cohort-repeat-revenue", why: "Repeat revenue attached to the sign cohort that earned it — expansion dollars traced back to the month of first booking." },
    { slug: "dormant-reactivation", why: "Workspaces whose boards went quiet and came back — the reactivation anti-join read that sizes Miro's win-back calendar." },
    { slug: "winback-recovery", why: "Churned-to-recovered walks over the period spine — the recovery rate CS reports after every win-back wave, LAG deltas and all." },
    { slug: "week-over-week-churn", why: "Week-over-week churn deltas — the LAG walk with the first row's NULL kept honest, exactly the house rule on the 14-month spine." },
    { slug: "mrr-waterfall", why: "Expansion, contraction and churn stacked into a waterfall over the period book — Miro's seat-expansion story in one fold." },
    { slug: "deferred-revenue", why: "Billed-versus-earned splits over subscription periods — the cents-safe shape that keeps Miro's billing book honest at the close." },
    { slug: "ar-aging-schedule", why: "Statements bucketed by age — the dunning ladder billing refreshes before any reminder ships (6 statements, 15,217 never-collected on this db)." },
    { slug: "trial-balance-check", why: "Debits-equal-credits verification — the 181,080-against-181,080 gate this kit's close ritual hangs on." },
  ],
};
