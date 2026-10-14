// Medium — Wave-9 (Task 98), media domain (Streaming & Social), 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Long-form reading SQL: the storefront db read as a Medium membership sandbox — customers are
// members (region = market), orders are membership billing periods (delivered = active-paid month,
// shipped = current metered window with shipped_at as the period-open stamp, pending = trial
// awaiting payment, cancelled = lapsed), order_items are engagement line records (quantity = read
// units, unit_price = the per-unit earnings bucket that flows to writers under the Partner
// Program), products are the story & membership catalog the meter prices, suppliers are partner
// publications hosting writers, and invoices/payments are the month-close billing books in INTEGER
// cents (card rails = member charges, wire rails = partner settlements). Paywall funnels with
// stated populations, two-grain market censuses, tie-heavy engagement ladders, the 14-month
// billing spine, and the statement coverage ledger that sits under "active-paid". Pool provenance:
// company-pools.md carries NO Medium section — 0 tagged rows — so all 10 topic slug sets and all
// 16 problems are theme-curated from the pools file's SQL rows and say so. Case briefs quote probed
// figures from scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const mediumKit: CompanyKit = {
  id: "medium",
  domainId: "media",
  name: "Medium",
  tagline: "The read-time economy behind the metered paywall",
  accent: "text-lime-300",

  brief: [
    "**Medium** is the long-form reading and writing platform — millions of stories behind a metered paywall: non-members get a handful of free reads, members pay 5 a month for unlimited access, and the Partner Program pays writers from the member pool by member read time, not by clicks. Publications host stables of writers; tags and the clap/highlight engagement layer decide what surfaces. This kit maps the storefront db onto that world: the 16 customers rows are members (region = market), the 103 orders are membership billing periods worth **34,833.28**, and the 251 order_items rows are engagement line records — quantity = read units, unit_price = the per-unit earnings bucket that flows to writers. The status map is fixed: delivered = {emerald:active-paid month} (52, 50.5%), shipped = {sky:metered window open} (30, 29.1%), pending = trial awaiting payment (14, 13.6%), cancelled = {rose:lapsed} (7, 6.8%).",
    "The data org runs three loops and they read the same spine at different grains. Paywall growth watches the meter: a period books at created_at, and `shipped_at` is stamped the day the member's metered window actually opens — **82 of 103 periods** carry the stamp, opening at a **2.98-day** average with a 2–4 day spread, while the 14 trials have none yet (a population definition, not a cleanup job). The partner-program pod owns the read-time economics: engagement lines fold into publication earnings — the top publication carries 32% of the pool — and every payout question starts from member read time, not story clicks. Money sits one layer down: statements and legs in INTEGER cents, where the dollar read is `amount_cents / 100.0` — card rails moved 37,364 across 16 settlements, wire rails 32,248 across 11. Concentration is the third story: **63.5%** of the book sits with members whose lifetime spend crosses 3,000 (71.2% above 2,000) — one heavy reader lapsing moves a quarter.",
    "Interview screens are census-then-denominator, with a paywall twist. A typical loop opens with a **two-grain market census** — EU runs 45 periods from just 8 members (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a trial period count in your base?'*), then into the engagement ladder where four members sit tied at 4 periods and rank semantics become a payout-policy call. Late rounds walk the {sky:14-month billing spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or dip into the statement book where a paid-status statement with zero settlement rows (#28, 1,756.00) is waiting to be caught. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Medium section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: paywall censuses, two-grain market reads, tie-heavy ladders, earnings-per-unit CASE bands, month-spine walks and the cents-safe billing book. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:paywall status census} growth ops opens Monday with, the other rebuilds the {sky:statement coverage ledger} finance reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every coverage fold foot to the 28-statement book.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the meter refresh. A paywall-growth analyst opens the funnel dashboard before standup: did overnight windows open on schedule, did any trial age past its grace window, does the one-pass status census reconcile — 52 active-paid + 30 metered-open + 14 trials + 7 lapsed = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If period-open latency drifts off the **2.98-day** norm, the trial queue gets pulled before the acquisition read ships — {rose:trials aging past grace} are revenue leaking in plain sight.",
    "**11:30 —** Midday is the partner-program read. The earnings pod wants the publication fold re-cut — the top publication still carries **32%** of the payout pool — while a regional lead wants periods per member beside member counts (EU 45-from-8 versus US 19-from-2), and retention wants the engagement ladder with the four-way tie at 4 handled honestly: *shared rungs, named policy*. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-settled statements worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; the rails mix reads card 37,364 against wire 32,248 for the finance note. Then the anomaly walk, line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Membership book", what: "Total billing-period value booked: 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 period outweighs the smallest 42 combined." },
    { name: "Active-paid rate", what: "Delivered periods ÷ ALL periods booked: 52 of 103 (50.5%). 'Active-paid' is a status-filtered conditional count, and the denominator — trials and metered windows included — is the whole interview." },
    { name: "Metered-open share", what: "Periods with shipped_at stamped ÷ all booked: 30 of 103 (29.1%). The metered window is where free reads convert to paid months; its population definition ships with the number." },
    { name: "Lapsed share", what: "Cancelled share of booked periods: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn cohort map that drives the winback and dunning calendars." },
    { name: "Period-open latency", what: "Booking to metered-window open (created_at → shipped_at) over opened periods only: 2.98-day average, range 2–4. The population definition ships with the number — 82 of 103 stamped; trials have no window yet." },
    { name: "Engagement line depth", what: "Engagement lines ÷ periods: 251 order_items across 103 periods. Read depth shows up here first — each line carries read units × the per-unit earnings bucket that funds writer payouts." },
    { name: "Member concentration", what: "Share of the book from members spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The top member alone runs 24 periods worth 7,262.35 — the number that staffs the winback pod." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact settlements (65,612), 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join the billing pod refreshes every close, footed against a ledger that must read 181,080 = 181,080." },
  ],

  topics: [
    {
      name: "Paywall funnel counts",
      why: "Every Medium growth screen opens with the meter: periods booked, active-paid months, metered windows open, trials pending, lapsed members. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a metered-open period 'paid' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain member censuses",
      why: "Periods and members are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining members to periods",
      why: "Members carry market and signup date; periods inherit them through joins, and the join type decides who survives. A period without a member is corruption; a member without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Read-time leaderboards",
      why: "Partner-program reporting is rank-window work: top publications by earnings, top members by read depth, and ties are guaranteed — four members sit at 4 periods each on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a payout policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Tier banding with CASE",
      why: "Membership tiers and earnings-per-unit buckets are CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the payout report, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month billing spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — metered under lapsed, this quarter beside last — and EXCEPT answers 'which trials never converted'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Above-the-mean gates",
      why: "Screens escalate into staging: fold per-member period counts, then judge them against a computed platform mean (6.44 here — exactly four logos clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets active-paid, metered, trial and lapsed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "medium-t1",
      q: "Your member report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A billing report joins periods to members: a period with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from members: the members with no billing periods ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-billing members — all 16 members appear in the period table somewhere — and proving that zero is itself the analyst's job. Say the survival rule out loud before you pick the join type; the panel is grading the habit, not the keyword.",
      tag: "joins",
    },
    {
      id: "medium-t2",
      q: "Four members tie at 4 billing periods on the engagement ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose member-success pod gets the winback budget. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer members (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a platform whose ladder feeds payout-eligibility cutoffs, an unstated tie policy is a payout dispute waiting to happen.",
      tag: "windows",
    },
    {
      id: "medium-t3",
      q: "The census shows 103 billing periods and 16 members; EU shows 45 periods from 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per member-month, so a member with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and billing momentum, members measure installed base and paywall coverage. The ratio — 5.6 periods per member in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for engagement lines and COUNT(*) silently counts engagement lines, not periods — 251 of them. On a read-time economy that confusion is not academic: engagement lines are how writers get paid, and counting them as billing events misstates both the funnel and the payout base. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "medium-t4",
      q: "shipped_at is NULL until a member's metered window opens. What is your policy for the period-open latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only opened windows have a latency, so the report measures booking-to-open for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the opened subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 lapsed rows, which is a feature, not a bug: those periods have no metered window by definition. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day opens for windows that never opened, and on a metered paywall it makes the trial cohort look like instant conversions. A report whose WHERE clause is doing definitional work without saying so is exactly what a Medium reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "medium-t5",
      q: "The paywall review wants active-paid value per market for markets carrying at least ten billing periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards metered, trial and lapsed rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a funnel line and an error, and between a threshold applied to periods versus to dollars. On this db the per-member floor keeps the logos with 24, 17, 14, 13 and 5 periods — five members whose combined book is the 63.5% concentration story. The strong answer places every filter by asking: is this a fact about one period, or about a market?",
      tag: "pipeline",
    },
    {
      id: "medium-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 billing periods always produce a mean — 338.19 on this db — and the above-the-mean cohort is a real, non-empty read led by the heavy readers. On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS member's average) re-runs per outer row and answers a different question — is this member's month above their own norm, the churn-signal read — at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "medium-t7",
      q: "The billing trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when metered windows roll over. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine itself tells the paywall's story: the book opens at 3,731.97, troughs at 1,193.86 in July, and no month carries fewer than 6 periods. Date discipline is billing discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "medium-t8",
      q: "Finance says a billing statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "medium-mcq-1",
      prompt: "A billing period's status reads 'delivered'. In this kit's Medium stage map, what happened?",
      choices: ["Active-paid — the member's month completed and counts as paid", "Metered window currently open, not yet at month end", "Lapsed — membership cancelled", "Trial awaiting payment"],
      answer: 0,
      why: "The stage map is fixed: delivered = active-paid month (52 of 103 periods, 50.5%). It is the only status where money has settled for a completed member-month.",
      notes: [
        { choice: 1, why: "Metered-open is 'shipped' — 30 periods inside the meter but not at month end. Calling them active-paid inflates the paid core before a single window closes." },
        { choice: 3, why: "Trial-awaiting-payment is 'pending' — 14 periods. Pending is not lapsed and not paid; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-2",
      prompt: "Period-open rate is shipped_at IS NOT NULL over which population? The db holds 82 opened, 14 trial and 7 lapsed of 103 booked.",
      choices: ["Opened + lapsed only (82/89 = 92.1%)", "All periods booked (82/103 = 79.6%)", "Delivered periods only (52/82)", "Distinct members (82/16)"],
      answer: 1,
      why: "The house definition: opened ÷ ALL periods booked — trials stay in the denominator because 'not yet opened' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 trials inflates the rate to 92.1% by deleting the population still in the funnel — the rows the meter exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is month completion, shipped_at is the window opening. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-3",
      prompt: "EU carries 45 billing periods from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 periods per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to lapsed periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the lapsed share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the lapsed map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-5",
      prompt: "Keep only members carrying at least 10 billing periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY member HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 periods — clears a 10-period bar per member.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 periods, then FOUR members tied at 4. Under RANK, what rank do the two 3-period members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-period members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency periods — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The trial periods double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-8",
      prompt: "A staging-table lapsed list uses member_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
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
      id: "medium-mcq-9",
      prompt: "An ops board stacks active-paid periods under lapsed periods in one layout, built with UNION. A reviewer says one member's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same member, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same member, same counts, no market or branch label — collapse into one, and the board loses a member with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-10",
      prompt: "The partner-program fold reads SUM(oi.quantity * oi.unit_price) per publication. A colleague's version reads COUNT(*) per publication. What is the actual difference?",
      choices: ["Same result — every engagement line is worth one unit", "COUNT(*) counts engagement lines; the SUM folds each line's read units at its per-unit earnings bucket, so the two diverge on any multi-unit line", "COUNT(*) is always larger; SUM drops NULL lines", "The SUM double-counts; COUNT(*) is the correct payout base"],
      answer: 1,
      why: "The fold is the payout base: quantity times unit_price per line, summed per publication — Nordic's 11,130.25 is a fold, not a row count. COUNT(*) counts the 251 engagement lines regardless of units or rate, which is a load metric, not money. Grain first: 'one row per what, and what does each row weigh?'",
      notes: [
        { choice: 0, why: "The two aggregates agree only where every line carries one unit at one rate — the db's lines carry up to 3 units across per-unit buckets, and all six publication ladders diverge from their line counts immediately." },
        { choice: 3, why: "The fold IS the payout base — dropping it for a row count misstates every publication's earnings and the 34,833.28 book the six folds must foot to." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-medium-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The paywall status census",
      brief:
        "Medium-flavored brief on the storefront db: Monday's paywall review opens with the meter census — billing periods booked, active-paid months, metered windows currently open, trials awaiting payment, and the lapsed share — and growth ops is explicit that every arm is a status filter over the same 103 periods, with the denominator stated on the slide. Probed facts: the four arms read 52 active-paid, 30 metered-open, 14 trial, 7 lapsed = 103 by construction; by market the grid runs EU 45/24/12/6, APAC 37/21/8/5, US 19/5/10/3, LATAM 2/2/0/0, and the lapsed share rounds to 6.7 / 8.1 / 5.3 / 0. The review reads the biggest book first.",
      ask: "Return each market with its period count, active-paid, metered-open, trialing and lapsed counts, plus lapsed share to 1 decimal, biggest book first.",
      template:
        "WITH arms AS (\n  SELECT c.region AS market,\n         COUNT(*) AS periods,\n         COUNT(*) FILTER (WHERE o.status = {1}) AS active_paid,\n         COUNT(*) FILTER (WHERE o.status = {2}) AS metered_open,\n         COUNT(*) FILTER (WHERE o.status = {3}) AS trialing,\n         COUNT(*) FILTER (WHERE o.status = {4}) AS lapsed\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY {5}\n)\nSELECT market, periods, active_paid, metered_open, trialing, lapsed,\n       ROUND(100.0 * lapsed / periods, {6}) AS lapsed_pct\nFROM arms\nORDER BY periods DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the active-paid arm",
          why: "Delivered = the active-paid month: 52 platform-wide, reading 24 in EU, 21 in APAC, 5 in the US, 2 in LATAM. 'shipped' would count the 30 metered-open periods and the paid core of the funnel inflates before a single window closes.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the metered-open arm",
          why: "Shipped = the metered window currently open, stamped at period open: 30 platform-wide, 12 in EU and 10 in the US. 'pending' would count the 14 trials instead and the funnel reads backwards.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial arm",
          why: "Pending = trial awaiting payment: 14 platform-wide, 6 in EU and 5 in APAC. 'cancelled' here would print the 7 lapsed members as trials and the paywall's own top-of-funnel disappears.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lapsed arm",
          why: "Cancelled = lapsed membership: 7 platform-wide, concentrated 3 in EU, 3 in APAC and 1 in the US. 'delivered' would divide the active-paid months by the book and the share reads 50.5 instead of 6.7.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market fold key",
          why: "GROUP BY c.region folds periods into the four markets the paywall board reports. GROUP BY 'lapsed' collapses everything into one row; GROUP BY 2 points the fold at the periods column and errors on the aggregate.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Lapsed share reports to 1 decimal: EU 6.7, APAC 8.1, US 5.3, LATAM 0 — the exact cells the weekly board quotes. Precision 2 prints 6.67/8.11/5.26 and the census stops reconciling with the published shares.",
        },
      ],
      distractors: ["'lapsed'", "'trial'", "SUM", "2", "COUNT"],
      walkthrough:
        "Two stages: fold the four status arms per market, then compute the share. The CTE joins every billing period to its member's market and folds one FILTER branch per status — EU reads 45 periods carrying 24 active-paid, 12 metered-open, 6 trialing and 3 lapsed; APAC 37/21/8/5/3; US 19/5/10/3/1; LATAM 2/2/0/0/0 — and the outer pass divides lapsed by periods at 1-decimal precision: 6.7, 8.1, 5.3, 0. The arms reconcile upward to the platform census (52 + 30 + 14 + 7 = 103) by construction, which is the whole point of a one-pass census. The distractors fail honestly: 'lapsed' or 'trial' in a status slot zeroes that arm (the US lapsed count reads 0 instead of 1 and the share collapses); SUM or COUNT in a status slot errors — a literal is being compared, not aggregated; 2 in the market slot turns GROUP BY 2 into an aggregate reference and dies; 2 in the precision slot prints 6.67/8.11/5.26 and the map stops matching the 8.1/6.7/5.3 shares ops quotes.",
    },
    {
      id: "cs-medium-2",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The statement coverage ledger",
      brief:
        "Medium-flavored brief on the storefront db: the month-close billing ledger reads every statement against its settlement legs — fully settled, never settled, partially settled — before finance signs the close. Probed facts: 28 statements; the coverage census reads 21 exact foots to 65,612 billed and settled (the void-but-settled #11 at 925.00 lands here because settled equals billed), 6 never-settled worth 15,217 with zero legs (the paid-status #28 at 1,756.00 among them — a status that lies), and 1 partial where statement #25 settled 4,000 of its 6,148. Rails context: card carried 16 legs for 37,364, wire 11 legs for 32,248.",
      ask: "Return each coverage bucket with its statement count, billed total and settled total in dollars to 2 decimals, biggest statement count first.",
      template:
        "WITH folds AS (\n  SELECT i.id AS statement_id,\n         ROUND(i.amount_cents / {1}, 2) AS billed,\n         COALESCE(ROUND(SUM(p.amount_cents) / 100.0, 2), {2}) AS settled\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = {3}\n  GROUP BY i.id\n)\nSELECT CASE WHEN settled = billed THEN {4}\n            WHEN settled = 0 THEN 'no payment'\n            ELSE 'partial' END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(billed), 2) AS billed_total,\n       ROUND(SUM(settled), 2) AS settled_total\nFROM folds\nGROUP BY coverage\nORDER BY statements DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Statements and legs carry INTEGER cents; the dollar read is amount_cents / 100.0. The raw cents read bills statement #25 at 614,800 instead of 6,148 and every bucket total inflates a hundredfold.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the no-leg fallback",
          why: "COALESCE(..., 0) makes settled a total function: the 6 never-settled statements read 0 and land in their own bucket. NULL there would re-bucket all 6 as partial and the AR anti-join reads empty.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "Legs attach to their own statement: p.invoice_id = i.id. p.id joins a leg toward the wrong row and the fold scatters; i.amount_cents compares the key to the billed amount and every statement reads no legs.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the fully-settled label",
          why: "Settled = billed is the exact bucket: 21 statements foots to 65,612 — the void-but-settled #11 (925.00) lands here because settled equals billed. 'paid' would rename the bucket and confuse a status claim with a settled state.",
        },
      ],
      distractors: ["p.id", "i.amount_cents", "NULL", "1", "'paid'", "'void'"],
      walkthrough:
        "Two stages: fold settlement legs per statement, then classify. The CTE LEFT JOINs payments to invoices on the statement key, folds each statement's settled cents with the /100.0 dollar read, and COALESCEs the no-leg statements to 0 so the classification is a total function: settled = billed reads 'exact' (21 statements foots to 65,612 — the fully-settled paid book plus the void-but-settled #11 at 925.00), settled = 0 reads 'no payment' (6 statements worth 15,217, including the paid-status #28 at 1,756.00 whose zero legs are the lie the anti-join exists to catch), and everything else reads 'partial' (exactly #25, 4,000 of 6,148). The buckets reconcile to the 28-statement book by construction. The distractors fail honestly: p.id or i.amount_cents (or a NULL key) in the join slot mis-keys the fold and the buckets blur or empty; NULL in the fallback turns the 6 never-settled statements into NULL settled and re-buckets them as partial; 1 in the divider reads raw cents and every billed total inflates a hundredfold; 'paid' or 'void' in the label slot reprints the bucket names and the ledger stops speaking the finance vocabulary.",
    },
  ],

  problems: [
    { slug: "game-play-analysis-iv", why: "First-read analysis: which members come back within a day of signup is the paywall's conversion seed — a subquery-plus-join shape the activation read uses weekly." },
    { slug: "immediate-food-delivery-ii", why: "Windows read on time versus late: the share of metered windows that opened within the promised span is this problem's conditional-rate shape, denominator stated." },
    { slug: "movie-rating", why: "Two boards, one stack: the most-read story and the most active member side by side is a UNION of two aggregates — the ops board's exact layout." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Series affinity with an exclusion: members who finished series A and B but never touched C — conditional aggregation with a NOT branch, the cross-sell read." },
    { slug: "find-followers-count", why: "Writer follower counts per publication feed the partner-program's reach tables — a plain GROUP BY with a business meaning attached." },
    { slug: "number-of-comments-per-post", why: "Responses per story is a self-join over the story graph — the engagement-mix read that decides what the homepage promotes next." },
    { slug: "article-views-ii", why: "Stories whose read volume clears a threshold is the HAVING gate behind every 'trending now' cut on the homepage." },
    { slug: "user-purchase-platform", why: "Streak detection: members reading on consecutive days is the habit signal the retention pod tracks — window logic over daily activity." },
    { slug: "monthly-transactions-i", why: "Per-month folds over a date-filtered window: the billing trend read that opens every month-close review." },
    { slug: "sellers-with-no-sales", why: "Publications with no reads in a period — the anti-join the partner team runs before cutting a newsletter cycle." },
    { slug: "confirmation-rate", why: "COALESCE over a LEFT JOIN: attribution rates where the denominator includes never-confirmed rows — the same NULL policy the funnel reports use." },
    { slug: "products-with-three-or-more-orders-in-two-consecutive-years", why: "Catalog retention: stories earning reads in two consecutive years are the evergreen cohort — a two-year conditional fold." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Most periods per member: the argmax-with-ties shape behind 'who is our heaviest reader' — and the ties are real on this db." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness is the daily-reading habit metric — a trailing-window ratio whose denominator definition is the whole interview." },
    { slug: "null-blank-audit", why: "Story metadata hygiene: untitled or untagged catalog rows silently split reads in every per-story report — the audit that runs before any vertical cut." },
    { slug: "week-over-week-churn", why: "LAG churn: lapsed members week over week is the winback trigger — a lag-flag shape the retention pod ships every Monday." },
  ],
};
