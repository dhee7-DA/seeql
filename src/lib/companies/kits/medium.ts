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
// 32 problems are theme-curated from the pools file's SQL rows and say so. Case briefs quote probed
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
    "Preparation strategy: the pools file carries no Medium section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: paywall censuses, two-grain market reads, tie-heavy ladders, earnings-per-unit CASE bands, month-spine walks and the cents-safe billing book. Do the topics in order, then run the **six case studies** on the live storefront db: the {emerald:paywall status census} growth ops opens Monday with, the {sky:statement coverage ledger} finance reads at every close, the engagement ladder with its four-way tie handled honestly, the partner-program publication fold, the membership-tier band audit, and the lapsed-member roster the winback pod mails from. This expanded kit is built for spaced practice rather than one sitting — run each case, then re-run it a week later from a blank editor; *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every coverage fold foot to the 28-statement book.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "analyze-subscription-conversion", "group-sold-products-by-the-date"],
    },
    {
      name: "Two-grain member censuses",
      why: "Periods and members are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "cohort-repeat-revenue", "basket-depth-aov"],
    },
    {
      name: "Joining members to periods",
      why: "Members carry market and signup date; periods inherit them through joins, and the join type decides who survives. A period without a member is corruption; a member without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "employee-bonus", "find-the-team-size"],
    },
    {
      name: "Read-time leaderboards",
      why: "Partner-program reporting is rank-window work: top publications by earnings, top members by read depth, and ties are guaranteed — four members sit at 4 periods each on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a payout policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "rfm-segmentation"],
    },
    {
      name: "Tier banding with CASE",
      why: "Membership tiers and earnings-per-unit buckets are CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the payout report, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month billing spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "net-revenue-retention", "rolling-7d-actives", "running-total-for-different-genders"],
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
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "mrr-waterfall", "ar-aging-schedule", "deferred-revenue"],
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
    {
      id: "medium-t9",
      q: "A retried ingestion duplicated some member rows. Walk me through the keep-latest dedupe you write — and the tie-breaker question you must answer before it is safe.",
      a: "ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC, id DESC) AS rn, keep rn = 1. Two decisions make it safe: the natural key (the ingested id, or the business key if ids collide across retries) and the tie-breaker — when two copies share an updated_at, the freshest is undefined unless id DESC settles it. Detect first with GROUP BY the key HAVING COUNT(*) > 1 so the repair has a receipt, then filter rn > 1. On this core db every member row is unique — the shape exists for the staging tables where pipeline retries actually land, and the same three lines guard engagement-line double-counts that would silently double a writer's payout.",
      tag: "windows",
    },
    {
      id: "medium-t10",
      q: "Periods, members, engagement lines — the census counts three things over the same two tables. Which COUNT do you reach for in each, and what does each number mean to the business?",
      a: "COUNT(*) at the period grain reads 103 booked billing periods — load and billing momentum. COUNT(DISTINCT customer_id) folds the repeats back to members — 16 platform-wide, 8 in EU against its 45 periods — which is coverage and installed base. Join order_items and COUNT(*) silently becomes 251 engagement lines, a third grain: read depth. The ratios only mean something once the grains are named: 45/8 = 5.6 periods per member is EU's intensity signal, 251/103 = 2.44 lines per period is read depth. The habit being graded is saying 'one row per what?' out loud for every COUNT before you defend the number.",
      tag: "aggregation",
    },
    {
      id: "medium-t11",
      q: "The winback exclusion needs members with no lapsed periods. IN, NOT IN, EXISTS, NOT EXISTS — which is safe here, and what is the trap?",
      a: "NOT EXISTS is the safe shape: it is correlated, NULL-immune, and reads as the sentence the business asked for. NOT IN over a subquery that returns even one NULL customer_id turns every comparison UNKNOWN and the winback list silently empties — a report that parses fine and ships wrong. IN is fine for positive existence tests. On this clean core db every orders.customer_id is populated, so NOT IN works today — and staging tables are exactly where it detonates. The db's own anti-join returns a confident zero never-billing members (all 16 appear in the period table somewhere); proving that zero, then choosing the NULL-safe shape for staging, is the complete answer.",
      tag: "subqueries",
    },
    {
      id: "medium-t12",
      q: "Period-open latency: how do you compute the average, state the population, and build the day buckets — and why do the buckets reconcile to the population?",
      a: "Population first: only the 82 of 103 periods with a shipped_at stamp have a latency — the 14 trials have no window yet, and that is a definition, not missing data. AVG(julianday(shipped_at) - julianday(created_at)) over that population reads 2.98 days. Buckets: CAST(julianday(shipped_at) - julianday(created_at) AS INT) — on this db every latency is an exact whole-day 2, 3 or 4, so the buckets read 27 / 30 / 25 and foot to 82 by construction. State the population in the report title, and never COALESCE a NULL latency to zero to 'fix' the average — that invents same-day opens for windows that never opened.",
      tag: "dates",
    },
    {
      id: "medium-t13",
      q: "Finance wants the never-settled statement numbers that are NOT falsely marked paid. Which set operator, and what does each wrong one return?",
      a: "EXCEPT: the left set is the 6 never-settled numbers, the right set is the paid-status numbers, and EXCEPT keeps left rows that never appear on the right — 5 honest open numbers (INV-2025-024, INV-2025-026, INV-2025-027, INV-2024-021, INV-2024-018). The paid-status #28 (1,756.00 with zero legs) drops out of the list because it IS in the right set — and it is exactly the anomaly the ledger chases on its own row-level walk. INTERSECT returns #28 alone (the in-both set), UNION merges everything back together, and both answer a different question. Set operators dedupe whole rows by default — harmless here because statement numbers are unique, and worth saying out loud.",
      tag: "setops",
    },
    {
      id: "medium-t14",
      q: "Market names arrive from a partner feed as 'eu ', 'EU', 'Eu'. What breaks, and how do you normalize before the census joins?",
      a: "GROUP BY on raw text splits one market into three buckets — the census stops reconciling to 103 and the intensity read (EU 45-from-8) becomes three smaller, wrongER reads. Normalize at the edge, once: TRIM then UPPER into a staging column (or better, normalize on load) so every downstream join and fold sees one canonical 'EU'. The same hygiene applies to GROUP_CONCAT rosters — decide the separator (the default comma breaks the moment a name contains one) and, pre-3.44, order the fold through an ordered subquery because GROUP_CONCAT order is not guaranteed. Cleaning text in SQL without breaking the key you group on later is the skill the screen checks.",
      tag: "strings",
    },
    {
      id: "medium-t15",
      q: "Membership tiers band periods at 100 / 250 / 500 total. Walk me through writing the CASE so the band report cannot silently re-band.",
      a: "Ordered, exhaustive arms straight from the pricing page, most-specific first: WHEN total >= 500 THEN 'studio', WHEN total >= 250 THEN 'premium', WHEN total >= 100 THEN 'standard', ELSE 'starter' — on this db that reads 25 / 34 / 29 / 15 periods and foots to 103. The ELSE is the exhaustiveness guarantee: delete an arm instead and those periods print NULL tiers, the band counts stop footing, and nothing errors. Edge discipline: every bound is half-open in intent — a 499.99 period is premium, a 500.00 period is studio — and there are no exact-edge totals on this book to mask an off-by-one. Reordering the WHEN arms is the quiet bug: the first matching arm wins, so the same bands in the wrong order re-band the base without a single error.",
      tag: "case",
    },
    {
      id: "medium-t16",
      q: "Annotate every period row with its market's book value, without collapsing rows. Why a window and not GROUP BY?",
      a: "SUM(total) OVER (PARTITION BY region) computes each market's fold once and stamps it on every row: all 45 EU periods carry EU's 15,089.23 book, all 103 rows survive. GROUP BY would return 4 rows and destroy the roster columns — member, status, period id — the memo needs beside the annotation. The two shapes answer different asks: 'one row per market' is a GROUP BY question; 'every row, annotated' is a window question. The same shape powers team-size enrichment and per-publication pool size on the partner-program side, and the cost is one extra pass rather than a join.",
      tag: "windows",
    },
    {
      id: "medium-t17",
      q: "Find the statements that settled on two legs. Why is a self-join the tool, and what does the p2.id > p1.id guard buy you?",
      a: "The payments table meets itself on invoice_id — same statement, two leg rows — so the pairing lives inside one table. Without an orientation guard every pair prints twice (A,B and B,A); p2.id > p1.id keeps exactly one row per unordered pair and the strict inequality rules out the self-pair. The method comparison (rail_1 <> rail_2) then classifies splits, and on this book the 5 two-leg statements (1, 5, 12, 19, 22) all turn out cross-rail, each footing exactly to its billed amount. Swap the guard to >= and the 5 self-pairs walk in as phantom 'splits' — the false positive the sweep exists to rule out.",
      tag: "joins",
    },
    {
      id: "medium-t18",
      q: "How do you detect duplicate engagement lines before they inflate the payout fold — detect AND repair?",
      a: "Detect at the line's natural key: GROUP BY order_id, product_id HAVING COUNT(*) > 1 — that is the duplicate-emails shape and it produces the receipt finance can look at. Repair with the window dedupe: ROW_NUMBER() OVER (PARTITION BY order_id, product_id ORDER BY id DESC) and keep rn = 1, never a bare DELETE that removes both copies. The payout fold SUM(quantity * unit_price) is exactly where a duplicated line silently doubles writer money: the honest fold foots to 34,833.28 over 251 lines, and every reconciliation starts by proving that population. Detection without a keep-newest tie-breaker is half the job; the other half is writing the tie-breaker down.",
      tag: "quality",
    },
    {
      id: "medium-t19",
      q: "The ops board wants category rows plus a labelled TOTAL row in one result. How do you build it, and why that way?",
      a: "Two branches over the same table, stacked with UNION ALL: the detail branch GROUP BY category (Rent 16,800 / Ads 4,570 / Tools 1,525 / Travel 2,521 in cents), the TOTAL branch re-scanning the unfiltered table with a literal 'TOTAL' label — 36 entries, 25,416.00. UNION ALL, never UNION: the branches cannot collide here, and ALL states that argument instead of asking a dedupe pass to silently enforce it. The outer ORDER BY sorts the stack (the TOTAL row carries the biggest cents and floats to the top). Keep the arithmetic in INTEGER cents end to end and divide by 100.0 only at the display layer — the grand row is where a hundredfold inflation hides best.",
      tag: "aggregation",
    },
    {
      id: "medium-t20",
      q: "COALESCE, IFNULL, NULLIF — three NULL tools. Where does each earn its keep in the coverage fold and the share calculation?",
      a: "COALESCE(SUM(legs), 0) makes the settled column a total function: the 6 never-settled statements read 0 and classify into 'no payment' instead of drifting into 'partial' as NULLs. IFNULL is the two-argument twin — same job, shorter signature. NULLIF(x, 0) guards division: the platform-wide lapsed share divides by COUNT(*) which cannot be 0 here, but a per-market share on a staging slice can be — NULLIF turns the division-by-zero error into a NULL you then label honestly. The policy line interviewers wait for: COALESCE is for reporting defaults; it is never for laundering meaning — a NULL latency or NULL delta means something, and zeroing it erases the meaning.",
      tag: "nulls",
    },
    {
      id: "medium-t21",
      q: "The month-over-month pulse needs monthly folds, then a window over the folds. Why stage in a CTE instead of one flat query?",
      a: "Because window output is not visible to WHERE or to sibling expressions in the same SELECT — the fold and the LAG cannot legally live in one layer. The CTE computes the 14 monthly folds once (SUBSTR(created_at,1,7) month key, COUNT(*), SUM(total)); the outer SELECT layers LAG(cycles) OVER (ORDER BY month) and the delta over the folded grain. One fold, one window layer, and the pipeline reads top-down: FROM, fold, window, cut. Nested derived tables work too but read bottom-up, which is exactly the wrong direction for a reviewer under close pressure. On the spine the first row's LAG is NULL by definition — the CTE boundary is also where you decide to label it 'baseline' rather than coalesce it.",
      tag: "pipeline",
    },
    {
      id: "medium-t22",
      q: "Growth wants a 3-month rolling booked-value average over the spine. Write the frame, and explain ROWS versus RANGE here.",
      a: "AVG(booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — a three-row frame over the monthly fold. Spine months are unique, so ROWS and RANGE agree row-for-row here; they diverge when the ORDER BY key ties — RANGE absorbs all peers into one step (calendar-true on duplicate timestamps), ROWS counts rows and needs a tie-breaker to be deterministic. Say which you chose and why; that sentence is the interview. And narrate the edges: the first two rows have partial windows, so either label them honestly or accept that a '3-month average' over one row is just that row wearing a trend name.",
      tag: "windows",
    },
    {
      id: "medium-t23",
      q: "The period mean is 338.19; the mean of per-member averages is 370.15. Which belongs on the slide, and what is the trap?",
      a: "They answer different questions, so the slide names the grain. 338.19 is the period-grain mean — 34,833.28 over 103 periods — where heavy members' 24 periods weigh 24 times, dragging the mean toward the heavy side. 370.15 is the member-grain mean — the average of the 16 per-member averages — where every member weighs once, a member-experience read. The trap is averaging averages silently: (SUM of member means)/16 is NOT SUM(total)/SUM(n) — it is a different statistic that happens to be computable. Pick by question: billing momentum and funnel reads take the period grain; winback and member-experience reads take the member grain — and the slide says which.",
      tag: "aggregation",
    },
    {
      id: "medium-t24",
      q: "A staging month with zero bookings drops out of the GROUP BY spine and the trend lies by omission. How do you guarantee a continuous 14-month spine?",
      a: "A recursive CTE date spine: seed the minimum month, add one month per iteration until the maximum, LEFT JOIN the folds onto the spine, COALESCE the counts and sums to 0. On this db every spine month carries 6 to 9 periods, so the omission never shows — but filter to one status or slice to a staging table and a zero-month vanishes, and the chart invents a smooth decline where the truth is a gap. Zero-fill is the honesty rule for every trend the paywall publishes: the same rule fills the funnel's empty stages and the band report's empty tiers. The audit question that catches it: does every row count foot, and are the month buckets consecutive?",
      tag: "dates",
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
    {
      id: "medium-mcq-11",
      prompt: "Growth ops says the paywall is carrying '44 open meters'. The status census reads 52 delivered, 30 shipped, 14 pending, 7 cancelled. Which two arms are they counting?",
      choices: ["delivered + pending — paid months plus trials", "shipped + pending — metered windows open plus trials awaiting payment", "delivered + shipped — every period that has reached the meter", "shipped + cancelled — open windows plus lapsed"],
      answer: 1,
      why: "Shipped = metered window currently open (30) and pending = trial awaiting payment (14) — together the 44 periods where money has not settled at month end. Delivered is the settled core (52), whose meter has closed; cancelled is the 7 lapsed, out of the funnel entirely.",
      notes: [
        { choice: 0, why: "Trials are not meters — a pending period carries no shipped_at stamp at all. Folding trials into 'open meters' invents windows that never opened." },
        { choice: 2, why: "Delivered is a completed paid month — its meter already closed. Counting it as 'open' double-counts the funnel and reads 96, not 44." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-12",
      prompt: "The billing spine runs 2024-01 to 2025-02. A colleague buckets periods with SUBSTR(created_at, 6, 2) AS month. What does the trend chart show?",
      choices: ["14 monthly buckets, one per spine month", "12 buckets — January 2024 and January 2025 merge into one '01' bucket", "13 buckets — February is dropped as malformed", "One bucket — SUBSTR returns NULL on TEXT timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) keeps only the month digits '01'..'12' and amputates the year, so the 14 spine months fold into 12 buckets — January 2024's 3,731.97 merges with January 2025's 1,669.50 and the trend becomes fiction. The spine key is SUBSTR(created_at, 1, 7): year plus zero-padded month.",
      notes: [
        { choice: 0, why: "14 buckets require the 7-character '%Y-%m' key. The 6-character month key cannot distinguish the two Januaries it merges." },
        { choice: 2, why: "Nothing is malformed — SQLite groups '01' twice without complaint. The damage is silent mis-merging, not an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-13",
      prompt: "'Members who never billed' runs customers LEFT JOIN orders ... WHERE o.id IS NULL and returns ZERO rows on the core db. The honest read?",
      choices: ["The query is broken — every membership base has at least one never-billed member", "Zero is the answer: all 16 members carry at least one period — whitespace is proven absent, not assumed", "LEFT JOIN cannot return zero rows; switch to NOT IN", "The join key is wrong — customers.id never matches anything"],
      answer: 1,
      why: "On this db every one of the 16 members appears in orders at least once, so the anti-join legitimately returns nothing. A confident zero is a result — the analyst's job is to prove it (count both sides) and to re-prove it on staging tables, where one NULL customer_id can turn a real cohort into a fake zero.",
      notes: [
        { choice: 0, why: "This is exactly the reflex the screen tests: treating an empty result as a bug instead of auditing the population. Zero is the db's truth here." },
        { choice: 2, why: "LEFT JOIN + IS NULL returns zero rows whenever no unmatched rows exist. NOT IN would be the fragile version, not the fix." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-14",
      prompt: "The census joins orders to order_items for read-unit context, then reports COUNT(*) per market as 'periods'. Platform-wide the true period count is 103. What does the query actually count?",
      choices: ["103 — the join is one-to-one", "251 — one row per engagement line; the join fans periods out to lines", "16 — one row per member", "It errors — COUNT(*) is ambiguous after a join"],
      answer: 1,
      why: "order_items fans each period out to its engagement lines — 251 platform-wide, averaging 2.44 per period — so COUNT(*) counts lines, not periods. Touching that table is legitimate for SUM(quantity), the read-units fold; the census must count at the period grain and keep the line join out of it.",
      notes: [
        { choice: 0, why: "Joins multiply when the right side repeats — no clause collapses the fan-out back. The 103 becomes 251 the moment the join lands." },
        { choice: 2, why: "16 is the member grain, reached with COUNT(DISTINCT customer_id). Adding customers does not change what COUNT(*) counts after the line fan-out." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-15",
      prompt: "The concentration memo needs the single heaviest billing period on the book. Which query returns it?",
      choices: ["SELECT MAX(COUNT(*)) FROM orders", "SELECT id, total FROM orders ORDER BY total DESC LIMIT 1", "SELECT id, total FROM orders WHERE total = AVG(total)", "SELECT customer_id FROM orders GROUP BY customer_id LIMIT 1"],
      answer: 1,
      why: "ORDER BY total DESC LIMIT 1 is the argmax shape — it lands on the 1,088.44 period. The alternatives aggregate without grouping, compare every row to the mean, or return an arbitrary group's first row — none of them is 'the biggest single period'.",
      notes: [
        { choice: 0, why: "MAX(COUNT(*)) nests an aggregate without GROUP BY — a syntax error, and even the intended form returns the max period COUNT (24), not the heaviest value." },
        { choice: 2, why: "total = AVG(total) is the exactly-average cohort (nobody hits 338.19 exactly) — a filter, not an argmax." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-16",
      prompt: "Concentration: 63.5% of the book sits with members whose lifetime spend crosses 3,000. How many members does HAVING SUM(total) >= 3000 keep?",
      choices: ["1", "4", "8", "16"],
      answer: 1,
      why: "The lifetime ladder reads 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56 — exactly four members clear 3,000, and their 22,121.70 is the 63.5% concentration cohort. The next member sits at 2,667.93 and drops; the floor is a value floor, not a count floor.",
      notes: [
        { choice: 2, why: "8 is close to the members above the mean PERIOD COUNT — a different cut on a different column. Concentration is judged on value." },
        { choice: 0, why: "The heaviest member (24 periods, 7,262.35) heads the cohort but is not the whole body — three more clear the floor behind them." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-17",
      prompt: "Growth wants Q1-2024 only (January through March). Which WHERE clause keeps March 31's late-night bookings?",
      choices: ["WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'", "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'", "WHERE SUBSTR(created_at,1,7) IN ('2024-01','2024-02')", "WHERE created_at LIKE '2024-0%'"],
      answer: 1,
      why: "Half-open intervals — >= Jan 1 AND < Apr 1 — keep every timestamp on March 31 including 23:59:59. BETWEEN '2024-03-31' compares against that day-prefix as midnight, so the last night's bookings sort after it and vanish — and month-end is exactly when metered windows roll over.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive at both ends, but '2024-03-31' means '2024-03-31 00:00:00' — the day itself is amputated from below." },
        { choice: 2, why: "Drops March entirely — a quarter is three months, and the missing month is invisible unless you reconcile counts to the platform census." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-18",
      prompt: "The month-over-month delta column reads NULL for 2024-01 and a stakeholder asks you to 'fix' it to 0. What do you answer?",
      choices: ["Coalesce it — a NULL in a delta column is always a bug", "Keep the NULL: January 2024 has no prior month on the spine, so no delta exists — a 0 would claim 'flat', which the data cannot say", "Drop the first row — the trend starts in February anyway", "Replace NULL with the month's own value — self-comparison is the honest baseline"],
      answer: 1,
      why: "LAG over the 14-month spine returns NULL on the first row because no prior row exists — that is the definition of a baseline, not a defect. Zero would print 'no change' for a month whose change is undefined; the spine opens at 3,731.97 and every later delta is judged against that anchor.",
      notes: [
        { choice: 2, why: "Deleting the edge row hides the opening level — the deck loses the anchor, and the reader cannot tell a truncated spine from a flat start." },
        { choice: 3, why: "Self-comparison makes every first row read 0% — indistinguishable from a genuinely flat month, which is the exact lie the fix would tell." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-19",
      prompt: "The engagement ladder under a HAVING COUNT(*) >= 4 floor keeps 24, 17, 14, 13, 5, then four members tied at 4. Under which function pair is the OUTPUT identical — and why?",
      choices: ["RANK and DENSE_RANK — the tie block sits at the bottom, so the gap RANK would leave never materializes", "RANK and ROW_NUMBER — no ties survive the floor", "DENSE_RANK and ROW_NUMBER — both are gapless by construction", "All three agree — ties never change ranks when ORDER BY is deterministic"],
      answer: 0,
      why: "RANK only skips when a LATER distinct value exists to receive the skipped rank. With the tie at the bottom, RANK prints 1,2,3,4,5,6,6,6,6 — identical to DENSE_RANK. Lower the floor to 3 and the two 3-period members expose the difference: RANK 10,10 versus DENSE_RANK 7,7.",
      notes: [
        { choice: 1, why: "Four members tie at 4 — the floor does not remove ties, it removes everything AFTER them, which is exactly why RANK and DENSE_RANK converge." },
        { choice: 2, why: "ROW_NUMBER splits the four-way tie arbitrarily as 6,7,8,9 — never identical when a tie exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-20",
      prompt: "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) prints the 14 trial periods. A teammate deletes the ELSE 0 branch. What does the count become?",
      choices: ["14 — CASE without ELSE yields NULL on non-matches, and SUM ignores NULLs", "89 — non-matching rows count as 1", "0 — a missing ELSE makes the whole aggregate NULL", "Parse error — ELSE is mandatory in SQLite"],
      answer: 0,
      why: "CASE returns NULL when no arm fires and no ELSE exists; SUM skips NULL inputs, so the pending count stays 14. The subtlety worth saying out loud: the same deletion poisons everything downstream that expects a 0 — a flag column of NULLs breaks ratios and window sums that the 0/1 version survives.",
      notes: [
        { choice: 1, why: "Only rows matching an arm contribute. Non-matches are NULL, not 1 — the flag never counts the other 89 periods." },
        { choice: 2, why: "Aggregates skip NULL inputs rather than turning NULL — SUM only returns NULL when EVERY input is NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-21",
      prompt: "A split settlement leg stores 236,150 cents. ROUND(amount_cents / 100, 2) prints 2,361.00 but the true value is 2,361.50. Why?",
      choices: ["ROUND rounds down when the second decimal is 5", "INTEGER / INTEGER is integer division in SQLite — the cents truncate before ROUND sees them; the real divider is amount_cents / 100.0", "The column is TEXT and SQLite coerces it to a whole number", "236,150 is stored wrong — the leg should have been 236,100"],
      answer: 1,
      why: "SQLite's / between two integers is integer division: 236150/100 truncates to 2361 and ROUND cannot recover the 50 cents already lost. Dividing by the REAL literal 100.0 promotes the arithmetic first. The db's split legs (statements 12 and 22) settle at half-hundred values — exactly where the truncation bites.",
      notes: [
        { choice: 0, why: "The damage happens before ROUND is called — truncation, not rounding. No rounding mode can restore digits that never existed." },
        { choice: 2, why: "amount_cents is INTEGER; the coercion story hides the real issue, which is the operator's type rule, not the storage." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-22",
      prompt: "The winback roster runs GROUP_CONCAT(c.name) per market over lapsed periods. Alice Chen lapses three times in EU. What does the EU roster cell show — and the one-token fix?",
      choices: ["'Alice Chen' once — GROUP_CONCAT dedups by default", "'Alice Chen,Alice Chen,Alice Chen' — GROUP_CONCAT concatenates every row; GROUP_CONCAT(DISTINCT c.name) is the fix", "NULL — three identical values collapse to NULL", "'Alice Chen' — SQLite errors on repeated values"],
      answer: 1,
      why: "GROUP_CONCAT folds every row's value with a comma separator — three lapsed periods print the same name three times. The DISTINCT variant folds to the distinct lapsed members: EU just Alice Chen, APAC 'Maya Patel,Keiko Sato', US 'Emma Wilson' — 4 people from the 7 lapsed periods.",
      notes: [
        { choice: 0, why: "Dedup is never the default — COUNT needs DISTINCT explicitly and so does GROUP_CONCAT. The repetition is data: she really lapsed three times." },
        { choice: 2, why: "Aggregates never collapse valid text to NULL; they skip NULL inputs, and 'Alice Chen' is not NULL." },
      ],
      difficulty: "easy",
    },
    {
      id: "medium-mcq-23",
      prompt: "'Members beating their own average' runs WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id). What is the cost profile, and the set-based fix at scale?",
      choices: ["One scan — the optimizer hoists the subquery", "The subquery re-runs per outer row; the fix folds per-member averages once in a CTE (or AVG() OVER (PARTITION BY customer_id)) and joins back", "Correlated subqueries are always faster — fewer rows touched", "The fix is DISTINCT — duplicates are the cost problem"],
      answer: 1,
      why: "The correlation re-executes the inner AVG once per outer period — 103 evaluations here, millions at partner-program scale. A GROUP BY customer_id CTE computes each baseline once; AVG(total) OVER (PARTITION BY customer_id) attaches it without collapsing rows. Same answer, one pass.",
      notes: [
        { choice: 0, why: "Only a decorrelating optimizer hoists — never assume it. Narrate the per-row re-run; that narration IS the interview answer." },
        { choice: 2, why: "Backwards: correlation trades repetition for expressiveness — clarity on small data, a scalability problem at partner-pool scale." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-24",
      prompt: "A running book total runs SUM(total) OVER (ORDER BY created_at). Two periods share the same created_at timestamp. What does the default frame do?",
      choices: ["ROWS semantics — each row accumulates separately in arbitrary tie order", "RANGE semantics — tied timestamps are peers: the frame absorbs all of them at once and both rows print the same running total through the tie", "The query errors — ORDER BY keys must be unique for window frames", "The later rowid wins; SQLite breaks ties silently by rowid"],
      answer: 1,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY peers as one step — both tied periods print the total including each other. Switch to ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (plus an id tie-breaker) to accumulate row by row deterministically.",
      notes: [
        { choice: 0, why: "That is explicit-ROWS behavior, not the default. The silent surprise IS that the default is RANGE." },
        { choice: 3, why: "SQLite does not secretly re-order the frame; peers are peers until you change the frame or add a tie-breaker to the ORDER BY." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-25",
      prompt: "Month-close wants the never-settled statement numbers EXCLUDING the one falsely marked paid. 6 statements never settled; #28 (1,756.00) carries status 'paid'. Which query returns the 5 honest opens?",
      choices: ["never_settled INTERSECT paid_status", "never_settled EXCEPT paid_status", "never_settled UNION paid_status", "never_settled WHERE number NOT LIKE 'INV-2025%'"],
      answer: 1,
      why: "EXCEPT keeps left-side rows absent from the right: 6 never-settled minus the paid-status #28 leaves the 5 open numbers (INV-2025-024/026/027, INV-2024-021/018). #28 is the anomaly the ledger chases separately, not a member of the honest list.",
      notes: [
        { choice: 0, why: "INTERSECT answers 'in both' — here that is precisely the lying statement you are excluding, returned alone." },
        { choice: 2, why: "UNION merges both sides — the anomaly walks back in, the opposite of the ask." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-26",
      prompt: "A retried pipeline ingested some member rows twice. Keep the freshest copy per member. Which snippet is the keep-latest dedupe?",
      choices: ["SELECT DISTINCT customer_id FROM members", "ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) rn ... WHERE rn = 1", "GROUP BY customer_id HAVING COUNT(*) > 1, then DELETE both copies", "RANK() OVER (ORDER BY updated_at DESC) = 1"],
      answer: 1,
      why: "ROW_NUMBER per natural key, newest first, keep rn = 1 — exactly one survivor per key and it is the freshest ingest. The GROUP BY form detects duplicates but deleting both copies destroys good data; RANK ranks globally, not per key; DISTINCT collapses columns and loses the row entirely.",
      notes: [
        { choice: 0, why: "DISTINCT deduplicates values, not copies-with-history — you lose every attribute of the row you were trying to keep." },
        { choice: 2, why: "Detection is half the job. A deletion with no keep-newest tie-breaker is the bug this drill exists to prevent." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-27",
      prompt: "The split-rail sweep self-joins payments on invoice_id to find two-leg statements. Why must the join carry p2.id > p1.id on top of the statement key?",
      choices: ["It speeds the join by pre-sorting legs", "Without it every pair prints twice in both orientations (A,B and B,A) — and the strict inequality also rules out a leg pairing with itself", "It filters NULL legs that would crash the fold", "It enforces that both legs use the same payment method"],
      answer: 1,
      why: "An unguarded self-join pairs every leg with every leg on the same statement: each split reports twice, and the self-pair reports once more with >=. The orientation guard p2.id > p1.id keeps exactly one row per unordered pair — the 5 split statements (1, 5, 12, 19, 22). Cross-rail versus same-rail is decided separately by comparing methods.",
      notes: [
        { choice: 0, why: "The guard changes the RESULT, not the plan — 5 rows instead of 10 (15 with >=). Performance is not the point; correctness is." },
        { choice: 3, why: "Method comparison is the fraud test in the WHERE clause. The orientation guard is pure pair-deduplication and knows nothing about rails." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-28",
      prompt: "On a one-market staging table, 'periods above the platform average' returns zero rows — but the market has expensive periods. First diagnosis?",
      choices: ["The market genuinely has no above-average periods", "The staging fold is empty or filtered: the scalar subquery returned NULL, total > NULL is UNKNOWN, and every row silently dropped — audit the inner AVG's population first", "AVG over REAL totals is unsupported; CAST the column", "The WHERE clause needs DISTINCT to compare fairly"],
      answer: 1,
      why: "A scalar subquery over an empty or fully-filtered fold returns NULL, and any comparison with NULL is UNKNOWN — the report empties while parsing fine. On the full book the mean is 338.19 and the above-average cohort is real; on staging, state the inner population and its empty case before trusting an empty result.",
      notes: [
        { choice: 0, why: "Possible on a deliberately cheap slice — but 'empty because TRUE' is the conclusion you reach after auditing the subquery, never the assumption you start from." },
        { choice: 2, why: "AVG over REAL is bread-and-butter SQLite. The failure is three-valued logic, not typing." },
      ],
      difficulty: "hard",
    },
    {
      id: "medium-mcq-29",
      prompt: "The market memo wants every period row annotated with its market's book value, all 103 rows intact. Which shape delivers it?",
      choices: ["GROUP BY region with the annotation in SELECT", "SUM(total) OVER (PARTITION BY region) — the window folds and stamps without collapsing rows", "A CROSS JOIN of orders to regions, filtered later", "DISTINCT region, total — one row per market is fine"],
      answer: 1,
      why: "SUM(total) OVER (PARTITION BY region) computes each market's fold once and stamps every row: all 45 EU periods carry EU's 15,089.23, and the 103 rows survive. GROUP BY answers 'one row per market' — a different ask that destroys the roster columns the memo needs.",
      notes: [
        { choice: 0, why: "GROUP BY delivers 4 rows — period id, member and status are gone, which is exactly the collapse the memo ruled out." },
        { choice: 2, why: "A cross join multiplies 103 x 4 and only becomes correct with an equality filter — which is a join wearing a disguise, at worse cost." },
      ],
      difficulty: "medium",
    },
    {
      id: "medium-mcq-30",
      prompt: "Period-open latency averages 2.98 days over the 82 stamped periods; the bucket report reads 27 / 30 / 25 for days 2 / 3 / 4. Why do the buckets foot to 82 while no bucket shows a 2.98?",
      choices: ["CAST rounds each latency to the nearest day, so buckets and average disagree", "Every latency is an exact whole-day 2, 3 or 4, so the buckets count them cleanly — the 2.98 average lives BETWEEN buckets, a property of the population, not of any row", "The 21 unstamped periods quietly fill a missing bucket", "The buckets are wrong — they should read 28 / 30 / 24 to average 2.98"],
      answer: 1,
      why: "julianday diffs on this db are whole days — 27 periods open at day 2, 30 at day 3, 25 at day 4 — so CAST truncates nothing and the buckets foot to 82 by construction. The 2.98 is a population-level average: no single period runs 2.98 days, and expecting it in a bucket is a grain confusion.",
      notes: [
        { choice: 0, why: "Nothing rounds — the diffs are already whole days. And even with fractional diffs, CAST truncates toward zero; it does not round." },
        { choice: 2, why: "Unstamped periods have NULL latency and land in no bucket — COUNT over the bucket query proves the 82-row population, which is the audit." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-medium-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement ladder",
      brief:
        "Growth-board brief, in-world: the partner-program review opens with the member engagement ladder — billing periods per member, ranked, with ties handled by the board's published policy (shared rungs, no phantom gaps). Probed on the storefront db: the ladder runs 24 / 17 / 14 / 13 / 5, then FOUR members tied at 4 periods, then two at 3. The floor in the query keeps everyone at 3 or more, so the tie block is followed by a real, distinct count — the exact configuration where rank semantics become visible in the output. Eleven members survive the floor.",
      ask: "Return member name, period count, and a shared-rung, gap-free ladder rank for every member with at least 3 periods, heaviest first.",
      template:
        "SELECT c.name AS member,\n       COUNT(*) AS periods,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY o.customer_id\nHAVING COUNT(*) >= {3}\nORDER BY ladder_rank, member;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the shared-rung, gap-free ranker",
          why: "DENSE_RANK gives the four 4-period members rank 6 and the two 3-period members rank 7 — shared rungs, no gaps, the board's published policy. RANK would stamp the 3s as rank 10, implying five phantom ladder positions between 7 and 9 that no member occupies.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "A ladder ranks from the top: the window ORDER BY runs descending so the 24-period member takes rank 1. ASC would crown the two 3-period members and bury the heavy readers the payout review actually argues about.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "HAVING COUNT(*) >= 3 keeps eleven members — 24, 17, 14, 13, 5, the four-way tie at 4, and the two 3s whose ranks expose the tie policy. The threshold judges a per-member aggregate, which is why it lives in HAVING, not WHERE.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "5"],
      walkthrough:
        "A census, a floor, and a ladder. GROUP BY o.customer_id folds 103 periods into 16 members; HAVING COUNT(*) >= 3 keeps eleven — Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5, the four-way tie at 4 (Pedro Alvarez, Noah Meyer, Keiko Sato, Isabella Rossi), and the two 3s (Hiro Tanaka, Farid Nasser). The window ranks the folded counts: DENSE_RANK packs the tie as 6,6,6,6 and hands the 3s rank 7 — shared rungs, no invented strata, which is the payout-policy reason the board publishes the function in its own docs. RANK would print 10,10 for the 3s (phantom ranks 8 and 9), ROW_NUMBER would split the four-way tie arbitrarily — a silent judgment about whose winback pod gets the credit — and ASC would hand rank 1 to the lightest members. When a ladder feeds payout eligibility, the function IS the policy.",
    },
    {
      id: "cs-medium-4",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The publication payout fold",
      brief:
        "Partner-program brief, in-world: the payout meeting reads publications, not stories — engagement lines fold through the story catalog up to the six partner publications that host the writers. Probed on the storefront db: the six-fold reads Nordic Gadgets AB 11,130.25 / Midwest Hardware Co 9,294.93 / Alpine Audio GmbH 4,765.63 / Andes Naturals SA 3,613.25 / Shenzhen Electro 3,049.07 / Pacific Textiles 2,980.15, footing to the 34,833.28 pool — Nordic alone carries 31.9%, the '32%' concentration stat the pod quotes. The memo's cut keeps every publication earning 4,000 or more, which lands three.",
      ask: "Return each publication with its engagement-line count, read units and folded earnings in dollars to 2 decimals, for publications earning at least 4,000, biggest earnings first.",
      template:
        "SELECT s.name AS publication,\n       COUNT(*) AS lines,\n       {1}(oi.quantity) AS read_units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS earnings\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = {2}\nGROUP BY s.name\nHAVING SUM(oi.quantity * oi.unit_price) >= {3}\nORDER BY earnings DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the read-units adder",
          why: "Read units fold with SUM(oi.quantity): Nordic 82, Midwest 109, Alpine 77. COUNT would print the line counts (43 / 56 / 40) in a column named units — load wearing a depth label, and the payout math that uses the column divides by the wrong population.",
        },
        {
          answer: "p.supplier_id",
          kind: "keyword",
          label: "the catalog-to-partner key",
          why: "Stories attach to their publication through s.id = p.supplier_id. s.id = p.id pairs products with whatever partner happens to share their row number — the fold scatters across the wrong publishers and every earnings figure is fiction that still foots to something.",
        },
        {
          answer: "4000",
          kind: "number",
          label: "the payout-meeting cut",
          noVerify: true,
          why: "The memo's floor keeps Nordic 11,130.25, Midwest 9,294.93 and Alpine 4,765.63 — three publications, 25,190.81 of the pool. Lower it to 3,000 and Andes walks in at 3,613.25; the meeting's agenda is defined by where this bar sits.",
        },
      ],
      distractors: ["COUNT", "MAX", "p.id", "3000"],
      walkthrough:
        "A two-hop fold at partner grain. order_items joins products (each engagement line knows its story), products join suppliers (each story knows its publication), and GROUP BY s.name folds 251 lines into six partner rows. The earnings column is the payout base — SUM(quantity x unit_price) — and the six folds foot to 34,833.28, which is the reconciliation the meeting opens with: Nordic 11,130.25 (43 lines, 82 units), Midwest 9,294.93 (56 / 109), Alpine 4,765.63 (40 / 77), Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15. HAVING judges the folded earnings — a group-level fact that cannot live in WHERE — and the 4,000 floor keeps exactly three. The distractors fail honestly: COUNT in the units slot prints line counts wearing a units name; MAX prints one line's biggest quantity; p.id mis-keys the second hop and scatters the fold; 3000 silently re-invites Andes onto an agenda built for three.",
    },
    {
      id: "cs-medium-5",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The membership-tier band audit",
      brief:
        "Pricing-review brief, in-world: the pricing page publishes four membership tiers with fixed edges — starter under 100, standard from 100, premium from 250, studio from 500 — and the review re-bands the actual billing periods against those published edges to prove the page and the book agree. Probed on the storefront db: the four bands read studio 25 periods / 17,379.43, premium 34 / 11,938.70, standard 29 / 4,646.49, starter 15 / 868.66 — footing to 103 periods and the 34,833.28 book by construction. No period lands exactly on an edge, so the bands are clean; the CASE arms must still be ordered most-specific first or the audit re-bands everything.",
      ask: "Return each tier with its period count, booked value to 2 decimals, and its share of periods to 1 decimal, biggest booked value first.",
      template:
        "SELECT CASE WHEN total >= {1} THEN 'studio'\n            WHEN total >= 250 THEN 'premium'\n            WHEN total >= 100 THEN 'standard'\n            ELSE 'starter' END AS tier,\n       COUNT(*) AS periods,\n       ROUND({2}(total), 2) AS booked,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS period_share\nFROM orders\nGROUP BY tier\nORDER BY booked {3};",
      slots: [
        {
          answer: "500",
          kind: "number",
          label: "the studio edge",
          noVerify: true,
          why: "The pricing page's top edge is 500: 25 periods at 17,379.43 land in studio. Move the edge to 250 and the first two arms overlap — premium fires for nobody, the 59 big periods all read studio, and the audit stops reconciling with the published page.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the booked-value fold",
          why: "Booked value per band is the fold SUM(total): 17,379.43 / 11,938.70 / 4,646.49 / 868.66. AVG would print a per-period mean inside a column the deck reads as value, and the band totals would stop footing to 34,833.28.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first direction",
          why: "The review reads the biggest band first: studio 17,379.43 on top, down to starter's 868.66. ASC opens the deck on the 15 smallest periods — a correct query presenting the tail as the headline.",
        },
      ],
      distractors: ["250", "AVG", "MAX", "ASC"],
      walkthrough:
        "Classify, fold, share. The CASE arms run most-specific first — >= 500 studio, >= 250 premium, >= 100 standard, ELSE starter — and GROUP BY tier folds 103 periods into four bands: studio 25 / 17,379.43, premium 34 / 11,938.70, standard 29 / 4,646.49, starter 15 / 868.66. The share column divides each band's count by the grand COUNT via SUM(COUNT(*)) OVER () — the grouped-query form of a grand total — printing 24.3 / 33.0 / 28.2 / 14.6, and the four shares foot to 100.1 with the rounding, which the deck states rather than hides. The band counts foot to 103 and the booked column to 34,833.28: two reconciliations, by construction. The distractors fail honestly: 250 in the edge slot makes the first two arms overlap so premium empties and studio absorbs 59 periods; AVG turns value into a per-period mean and the footing breaks; MAX prints each band's single biggest period as its 'value'; ASC inverts the read so the deck opens on the tail.",
    },
    {
      id: "cs-medium-6",
      tier: "easy",
      topic: "x1",
      universe: "growth",
      title: "The lapsed-member roster",
      brief:
        "Winback-pod brief, in-world: before billing sends a single reminder, the lifecycle pod wants the lapsed roster by market — who lapsed, how many lapsed periods the market carries, and how many actual people that is, because the mail merge sends to people, not periods. Probed on the storefront db: 7 lapsed periods across exactly 4 members — EU's 3 lapsed periods are ALL Alice Chen (the 24-period heavy reader, three times over), APAC's 3 split between Maya Patel (2) and Keiko Sato (1), and the US carries Emma Wilson once. LATAM is clean. The roster reads biggest lapsed load first, alphabetical within ties.",
      ask: "Return each market with its lapsed-period count, distinct lapsed-member count, and the member names folded into one cell, biggest lapsed load first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS lapsed_periods,\n       COUNT(DISTINCT c.name) AS lapsed_members,\n       {1}(DISTINCT c.name) AS member_roster\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = {2}\nGROUP BY c.region\nORDER BY lapsed_periods {3}, market;",
      slots: [
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the roster folder",
          why: "GROUP_CONCAT folds the member names into one cell per market — 'Maya Patel,Keiko Sato' for APAC. SUM over text returns a meaningless 0.0, COUNT would print a number in a names column, and the mail merge needs the actual list.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lapsed filter",
          why: "Cancelled = lapsed in the stage map: 7 periods. 'delivered' would roster the 52 active-paid months — the exact population a winback email must never touch — and 'pending' would mail the 14 trials instead.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-load-first direction",
          why: "The pod works the biggest lapsed load first: EU and APAC (3 periods each) ahead of the US (1). ASC would open the queue on the single-US-member row and bury the Alice Chen cluster the pod argues about most.",
        },
      ],
      distractors: ["SUM", "COUNT", "'delivered'", "ASC"],
      walkthrough:
        "One scan, one roster. The WHERE keeps the 7 cancelled periods, GROUP BY c.region folds them into three markets — EU 3 periods / 1 member / 'Alice Chen', APAC 3 / 2 / 'Maya Patel,Keiko Sato', US 1 / 1 / 'Emma Wilson' — and the two-grain columns do the teaching: EU carries 3 lapsed periods from ONE member (the heavy reader lapsing three times over — the concentration risk in miniature), APAC 3 from two, US 1 from one. DISTINCT inside the GROUP_CONCAT is the difference between a roster and a period log: without it, EU's cell reads 'Alice Chen,Alice Chen,Alice Chen' and the mail merge sends her three copies. The counts foot to 7 periods and 4 members — two reconciliations for the price of one scan. The distractors fail honestly: SUM over names prints 0.0 in a names column, COUNT prints numbers where the merge needs text, 'delivered' rosters the active-paid book (52 periods), and ASC inverts the queue.",
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
    { slug: "trial-to-paid-funnel", why: "The meter's stage counts with the denominator stated: trial-to-paid is the paywall funnel in miniature, and the interviewer's first question is always what the base holds." },
    { slug: "analyze-subscription-conversion", why: "Trial to active-paid with the conversion rate computed, not eyeballed — the activation read the paywall team quotes in every growth review." },
    { slug: "group-sold-products-by-the-date", why: "Reads folded per day with GROUP_CONCAT-style lists — the daily-catalog view behind the 'what the membership read this week' digest." },
    { slug: "cohort-repeat-revenue", why: "Repeat-buyer revenue at two grains — the exact shape of this kit's concentration story, where 63.5% of the book sits with four members." },
    { slug: "basket-depth-aov", why: "Lines per period and value per period are Medium's depth reads (251 lines over 103 periods) — a ratio drill whose denominators decide the payout story." },
    { slug: "rfm-segmentation", why: "Recency-frequency-value banding of members — the segmentation pass behind every winback tier and the 'heavy reader lapsing' alert." },
    { slug: "second-highest-salary", why: "Second-highest publication earnings: the tie trap on a ladder this platform quotes constantly — DENSE_RANK or MAX-below-MAX, said out loud." },
    { slug: "find-the-team-size", why: "Publication stables enriched onto every story without collapsing rows — COUNT() OVER (PARTITION BY ...) is the partner-program's shape." },
    { slug: "net-revenue-retention", why: "NRR over the month spine: retained, expanded and lapsed value month over month — the LAG walk the billing review actually runs." },
    { slug: "rolling-7d-actives", why: "Rolling weekly reading windows over the booking stream — frame discipline (ROWS vs RANGE) on a spine whose timestamps can tie." },
    { slug: "running-total-for-different-genders", why: "Running book value per segment over the month spine — the cumulative read growth shows beside the LAG deltas." },
    { slug: "mrr-waterfall", why: "New, retained and lapsed value bridging month to month — the subscription waterfall in storefront-db clothes, cents-safe throughout." },
    { slug: "ar-aging-schedule", why: "Statements bucketed by age outstanding — the dunning calendar's source query, and this kit's 28-statement book is the practice ledger." },
    { slug: "deferred-revenue", why: "Booked versus earned across metered windows — the timing question the paywall model is built on, drilled as a fold with the denominator named." },
    { slug: "count-salary-categories", why: "CASE bands that must print empty tiers as zero — the studio-tier-is-empty lesson generalized, exactly this kit's band audit shape." },
    { slug: "find-golden-hour-customers", why: "Which members' windows open in the golden span — a latency-window screen this kit's 2.98-day norm turns into a population-definition question." },
  ],
};
