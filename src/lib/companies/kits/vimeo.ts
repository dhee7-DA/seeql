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
    "Preparation strategy: the pools file carries no Vimeo section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: trial-to-paid funnels, two-grain account censuses, tie-heavy upgrade leaderboards, plan-band CASE logic and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {sky:plan-change register} billing ops works from during an upgrade wave, the other rebuilds the {violet:3,000-line concentration list} finance reads at every pricing review. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i"],
    },
    {
      name: "Two-grain account censuses",
      why: "Cycles and accounts are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Joining accounts to cycles",
      why: "Accounts carry region and created_at; cycles inherit them through joins, and the join type decides who survives. A cycle without an account is corruption; an account without cycles is a dormant signup — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employee-bonus"],
    },
    {
      name: "Upgrade leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 cycles each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer creators, not syntax.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries"],
    },
    {
      name: "Plan-band CASE logic",
      why: "Plan tiers are CASE-classified — the Basic-to-Enterprise ladder with fixed edges the pricing page publishes, and the 55-line usage split (268 units at 31.01 average line price versus 230 at 115.85) is the canonical fold. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "the-category-of-each-member-in-the-store", "calculate-special-bonus"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month billing spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — active under churned, this quarter beside last — and EXCEPT answers 'which booked cycles never stamped'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: fold per-account cycle counts, then judge them against a computed platform mean (6.44 cycles here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets active, upgrading, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Active is not collected — the finance tables (28 billing statements, 27 rail settlements, INTEGER cents) are where the creator world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
