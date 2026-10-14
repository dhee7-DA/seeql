// Strava — Wave-9 (Task 98), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// The social network for athletes: the storefront db read as an activity-telemetry + engagement sandbox.
// customers = athletes (region = market), orders = activity uploads (delivered = processed-and-public 52,
// shipped = processing with shipped_at as the ingest stamp 30, pending = queued device sync 14,
// cancelled = discarded upload 7), order_items = the split/lap line records inside each upload
// (quantity = units, unit_price = pace/power bucket value), products = the gear & membership catalog,
// suppliers = gear/brand partners (clubs' sponsors), orders.total reads as the activity's Relative Effort
// score, and invoices/payments are the subscription billing books in INTEGER cents (/100.0 for dollars).
// Pool provenance: company-pools.md carries NO Strava section — fewer than 2 tagged rows, none SQL-graded —
// so all 10 topic slug sets and all 16 problems are theme-curated from the theme menu's sql rows
// (no w*/d*/f* rows). Case briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12);
// every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const stravaKit: CompanyKit = {
  id: "strava",
  domainId: "media",
  name: "Strava",
  tagline: "Activity uploads, segments and the kudos loop",
  accent: "text-emerald-400",

  brief: [
    "**Strava** is the social network for athletes — the app where a run, ride or swim becomes a *feed post*: the file leaves a Garmin or Wahoo, lands on the activity feed, collects kudos from clubmates, and every athlete races the same named stretches of road through segments, each with its own permanent leaderboard and a {orange:KOM} crown. It is a subscription business wrapped around a telemetry firehose, which makes it a media company that behaves like a sensor network. This kit maps the storefront db onto that world: the 16 customers rows are athletes across four markets, the 103 orders are activity uploads, and the 251 `order_items` rows are the line records inside each upload — split and lap entries where quantity = units and unit_price = the pace/power bucket. The status map is fixed: delivered = {emerald:processed-and-public} (52, 50.5%), shipped = processing with an ingest stamp (30), pending = queued device sync (14), cancelled = {rose:discarded upload} (7, 6.8%).",
    "The data org runs three loops off the same spine. Telemetry owns the ingest pipeline: an upload books at created_at (the activity's start) and `shipped_at` is stamped the day the file clears processing — **82 of 103 uploads** carry the stamp, averaging **2.98 days** on the db's day-clock, and the 14 pending rows are the device-sync queue, *a population definition, not a cleanup job*. Growth owns the engagement loops — kudos, comments, clubs, segment efforts — where the unit of retention is the athlete who uploads again. The scoreboard currency is Relative Effort: the book totals **34,833.28** across 103 uploads, averaging 338.19 per activity against a 25.47 to 1,088.44 spread. Money sits one layer down: 28 invoices and 27 payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU logs 45 uploads from 8 athletes (intensity 5.6) while the US logs 19 from 2 (9.5) — then escalates into the discard map (cancel share APAC 8.1% versus EU 6.7%), then into a segment-style leaderboard where four athletes sit tied at 4 uploads each and rank semantics become a policy argument about shared KOM rungs. Late rounds walk the {sky:14-month upload spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or pivot to the billing pod's coverage split: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth **15,217**. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Strava section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: upload funnels, two-grain censuses, tie-heavy leaderboards, CASE effort bands, calendar spines and the cents-safe billing tables. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:annual effort roll-up} that ops closes every month with, the other rebuilds the {sky:partner gear audit} the hardware-partnerships team reads quarterly. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the sync queue. A telemetry analyst opens the ingest dashboard before standup: did overnight device uploads land, is any athlete's file stuck between `created_at` and its `shipped_at` stamp, does the one-pass status census reconcile — 52 processed-and-public + 30 processing + 14 queued + 7 discarded = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If ingest latency drifts off the **2.98-day** norm — or the queue climbs past its 14-file steady state — the device-sync pipeline gets pulled before growth's weekly kudos read ships.",
    "**11:30 —** Midday is the engagement read. Growth wants the upload leaderboard with the four-way tie at 4 handled honestly — shared rungs, named policy, *because segment KOMs train athletes to expect exactly that*; trust & safety wants the discard map re-cut (7 discards, 2 in July and 2 in November, APAC 8.1% versus EU 6.7%); a market lead wants uploads beside athletes (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the leaderboard-policy argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before billing sends a single subscription reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Processed-and-public share", what: "Delivered ÷ ALL uploads: 52 of 103 (50.5%). The top-of-feed number growth reads every Monday — the only status where the activity is actually live on the feed and eligible for kudos." },
    { name: "Ingest latency", what: "Activity start to ingest stamp (created_at → shipped_at) over stamped uploads only: 82 of 103, averaging 2.98 days with a 2–4 day spread. The population definition ships with the number — queued uploads have no latency yet." },
    { name: "Sync queue depth", what: "Pending uploads ÷ all uploads: 14 of 103 (13.6%). Queued device syncs awaiting ingest — watched as a depth gauge, never coalesced into the latency average or treated as a silent zero." },
    { name: "Discard rate", what: "Cancelled share of uploads: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3% — and by month: 2 land in July and 2 in November. The discard map trust & safety reads before any leaderboard trust call." },
    { name: "Effort book", what: "Total Relative Effort across uploads: 34,833.28 over 103 activities, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the athlete-mix story — one 1,088.44 ultra outweighs the smallest 42 combined." },
    { name: "Market intensity", what: "Uploads per athlete by market: EU 45-from-8 (5.6) versus US 19-from-2 (9.5). Concentration rides alongside: 63.5% of the effort book sits with athletes whose lifetime effort crosses 3,000 (71.2% above 2,000)." },
    { name: "Billing coverage", what: "Processed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The subscription AR anti-join the billing pod refreshes every close." },
    { name: "Rails & settlement", what: "Card carries 16 payments / 37,364 against wire's 11 / 32,248, and settled statements average 28.4 days (fastest 13, slowest 84) against flat 30-day terms. The rail mix that decides which reminder fires first." },
  ],

  topics: [
    {
      name: "The upload funnel & conditional counts",
      why: "Every Strava growth screen opens with the funnel: uploads booked, processed-and-public, ingest-stamped. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a processing upload 'public' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Uploads and athletes are different grains of the same join, and every census here reports both: EU logs 45 uploads from 8 athletes while the US logs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining athletes to uploads",
      why: "Athletes carry market and signup date; uploads inherit them through joins, and the join type decides who survives. An upload without an athlete is corruption; an athlete without uploads is lapsed — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Segment leaderboards & rank policy",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four athletes sit at 4 uploads each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer athletes, not syntax. Strava athletes live on segment boards; the KOM tie policy is a product decision you will be asked to encode.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Effort banding with CASE",
      why: "Pace and power buckets are CASE-classified — recovery, tempo, threshold — with fixed edges the training page publishes, and subscription tiers band the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the training-load report, and a reordered WHEN quietly re-bands every athlete.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Gear chains: partners to SKUs to line records",
      why: "Gear is a three-table genealogy — brand partner, catalog SKU, then the split/lap line records that reference it — and the audit questions all run that chain. Which partner's gear carries the community's effort, at what listings count, is the quarterly partnerships read; the join path decides whether you count SKUs or line records.",
      slugs: ["students-and-examinations", "sales-person", "number-of-trusted-contacts-of-a-customer"],
    },
    {
      name: "Month spines & calendar buckets",
      why: "The annual effort heatmap is a month-keyed spine — SUBSTR(created_at, 1, 7) over 14 buckets from 2024-01 to 2025-02 — and every trend report here starts by building it correctly. '%m' alone merges January 2024 with January 2025; half-open date windows keep the last night's uploads; the calendar is where heatmap screens go wrong.",
      slugs: ["convert-date-format", "the-latest-login-in-2020", "rising-temperature"],
    },
    {
      name: "Windows over the activity stream",
      why: "Engagement is window math: month-over-month upload deltas with LAG, running effort totals per athlete, rolling averages over training weeks. The first row's LAG is NULL by definition — the baseline, never a zero — and frame semantics decide whether a cumulative effort walk steps row by row or absorbs tied timestamps in one jump.",
      slugs: ["biggest-window-between-events", "running-total-for-different-genders", "rolling-average-steps"],
    },
    {
      name: "Set ops & the grand-total stack",
      why: "The month-close packet stacks per-month rows under a labelled TOTAL row — UNION ALL, never UNION, because the dedup can silently eat a month that happens to match. Board packets that stack populations (this quarter beside last, processed beside discarded) live and die on the ALL.",
      slugs: ["team-scores-in-football-tournament", "league-statistics", "the-airport-with-the-most-flights"],
    },
    {
      name: "Billing & cents discipline",
      why: "Processed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the athlete world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning calendar.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "strava-t1",
      q: "Your athlete report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter an upload column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A kudos-per-upload report joins uploads to athletes: an upload with no athlete row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A lapsed-athlete report must be LEFT from athletes: the athletes with no recent uploads ARE the answer, arriving with NULL upload columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload athlete row — the LEFT quietly became an INNER and the lapsed cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-uploading athletes — all 16 appear in the uploads table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table silently returns nothing when a NULL sneaks in.",
      tag: "joins",
    },
    {
      id: "strava-t2",
      q: "Four athletes tie at 4 uploads on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 4, 4, 4, 4 and the next distinct count is 5th in sequence, no gaps. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which athlete's club gets the highlight. Strava athletes are segment nerds: they know what a shared KOM looks like, and a leaderboard that hands one of four tied athletes a unique crown reads as a bug. The right answer is picking a policy — shared rungs for peers (RANK or DENSE_RANK), or an explicitly named tie-breaker like earliest upload, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "strava-t3",
      q: "The census shows 103 uploads and 16 athletes; EU shows 45 uploads and 8 athletes. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts upload rows after the join — one row per activity, so an athlete with 24 uploads contributes 24. COUNT(DISTINCT customer_id) folds those rows back to athletes — EU's 45 uploads collapse to 8 logos. Neither is wrong: uploads measure telemetry load and engagement momentum, athletes measure installed base and coverage. The ratio — 5.6 uploads per athlete in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the split/lap line records and COUNT(*) silently counts line records, not uploads — 251 of them. On a social-athletics product that third grain is tempting precisely because line records are where pace and power buckets live. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "strava-t4",
      q: "shipped_at is NULL until an upload clears ingest. What is your policy for the ingest-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only processed uploads have a latency, so the report measures start-to-stamp for the 82 of 103 uploads that carry the mark — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL uploads returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 discarded rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day ingests for device syncs that have not run. The 14 pending rows are the sync queue, a population the dashboard exists to watch; folding them into an average is how a queue problem hides for a quarter. A report whose WHERE clause is doing definitional work without saying so is exactly what a Strava reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "strava-t5",
      q: "The growth review wants processed-and-public effort per market for markets carrying at least ten uploads. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards processing, queued and discarded rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-upload floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to uploads versus to effort. On this db the ten-upload floor keeps EU (45), APAC (37) and the US (19) and drops only LATAM's 2 — a survivor set the review should name out loud before the query runs, because a floor that keeps every market you intended to discuss is a floor you did not think about. The strong answer places every filter by asking: is this a fact about one upload, or about a market?",
      tag: "pipeline",
    },
    {
      id: "strava-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 uploads always produce a mean (338.19 on this db). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: filter to a month with only discarded uploads and the mean is NULL, so the whole panel goes blank instead of erroring. The correlated cousin (compare each upload to ITS athlete's average effort) re-runs per outer row and answers a different question — 'whose workouts beat their own baseline' — which is the personal-records read, not the platform read. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "strava-t7",
      q: "The annual effort heatmap buckets uploads by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the heatmap becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's uploads, and month-end is exactly when the long rides land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Then the ordering discipline: ORDER BY month ASC keeps the year walking forward and drops any appended TOTAL row last, because 'T' sorts after every '2…' month key. Date discipline is heatmap discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "strava-t8",
      q: "Finance says a subscription invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "strava-mcq-1",
      prompt: "An upload row's status reads 'shipped'. In this kit's Strava stage map, what happened?",
      choices: ["Processed — ingest stamped, not yet public on the feed", "Processed-and-public — live on the feed", "Discarded — thrown out at validation", "Queued — still waiting on the device sync"],
      answer: 0,
      why: "The stage map is fixed: shipped = processed with shipped_at as the ingest stamp — 30 of 103 uploads. The file cleared the pipeline but is not yet public; only 'delivered' (52) is live on the feed.",
      notes: [
        { choice: 1, why: "Processed-and-public is 'delivered' — 52 uploads. Calling the 30 processing uploads public inflates the feed-eligible base before kudos can even accrue." },
        { choice: 3, why: "Queued is 'pending' — 14 uploads with no shipped_at yet. Pending is not processing and not discarded; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-2",
      prompt: "Ingest share is stamped uploads ÷ which population? The db holds 82 stamped, 14 queued and 7 discarded of 103 booked.",
      choices: ["Stamped + discarded only (82/89 = 92.1%)", "All uploads booked (82/103 = 79.6%)", "Delivered uploads only (52/82)", "Distinct athletes (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL uploads booked — the 14 queued stay in the denominator because 'not yet ingested' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 queued inflates the rate to 92.1% by deleting the population still in the sync queue — the rows the gauge exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is feed-public, shipped_at is the ingest stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-3",
      prompt: "EU logs 45 uploads from 8 athletes. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts upload rows (45); COUNT(DISTINCT customer_id) folds repeats back to athletes (8). The gap between them — 5.6 uploads per athlete — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every upload has an athlete. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not athletes — a third grain nobody asked for. The census is uploads AND athletes." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to discarded uploads only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the discard share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between EU's 6.7% and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.067 to 0 first, then scales — the discard map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-5",
      prompt: "Keep only athletes carrying at least 5 uploads. How many athletes survive on this db (the per-athlete ladder runs 24, 17, 14, 13, 5, then fours and below)?",
      choices: ["5", "9", "4", "16"],
      answer: 0,
      why: "The ladder reads 24, 17, 14, 13, 5 at the top — exactly five athletes clear a 5-upload floor. The next tier is the four-way tie at 4, which fails the gate.",
      notes: [
        { choice: 1, why: "9 counts the 4-upload tier in — but HAVING COUNT(*) >= 5 is strict; the four athletes at exactly 4 do not survive a >= 5 floor." },
        { choice: 2, why: "4 is the tie size, not the survivor count — a classic off-by-one between reading the ladder and applying the gate." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-6",
      prompt: "The ladder runs 24, 17, 14, 13, 5 uploads, then FOUR athletes tied at 4. Under RANK, what rank do the two 3-upload athletes carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-upload athletes share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The segment-board policy is RANK semantics, gaps included, mirroring how athletes expect KOM boards to behave." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The queued uploads double-counted their activity start day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 uploads.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-8",
      prompt: "A staging-table lapsed-athlete list uses athlete_id NOT IN (SELECT customer_id FROM uploads WHERE created_at >= '2025-01-01') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the lapsed list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every upload carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-9",
      prompt: "The month-close packet stacks 14 monthly rows under a labelled TOTAL row with UNION. A reviewer says one month's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches emitted byte-identical rows somewhere (same month, same counts) and UNION deduplicated them silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. A monthly row that matches another row byte-for-byte — no distinguishing label, identical counts — collapses into one, and the packet loses a month with no error anywhere. The discipline: UNION ALL for grand-total stacks, plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On a stack whose whole job is to foot 14 months plus a TOTAL, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-10",
      prompt: "A dashboard walks cumulative effort per athlete: SUM(total) OVER (ORDER BY created_at). Two uploads share a start second, and the running total 'jumps two uploads at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at upload grain, mass-synced devices guarantee them.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the athlete's grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-strava-1",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "The annual effort roll-up",
      brief:
        "Strava-flavored brief on the storefront db: the month-close packet opens with the annual effort roll-up — uploads, Relative Effort and discarded uploads per month, with a grand TOTAL row appended so the packet foots to the year on one screen. Probed facts: the spine runs 2024-01 to 2025-02 (14 buckets, 6–9 uploads each); the book opens at 3,731.97 in January 2024, troughs at 1,193.86 in July, and closes the window at 2,390.53 in February 2025; discards concentrate in July and November — 2 each of the 7 total. The TOTAL row must read 103 uploads / 34,833.28 effort / 7 discards, reconciling the whole grid by construction.",
      ask: "Return each month with upload count, effort to 2 decimals and discarded uploads, plus a TOTAL row labelled 'TOTAL', months oldest first.",
      template:
        "SELECT SUBSTR(created_at, {1}, 7) AS month,\n       COUNT(*) AS uploads,\n       ROUND(SUM(total), 2) AS effort,\n       SUM(CASE WHEN status = {2} THEN 1 ELSE 0 END) AS discards\nFROM orders\nGROUP BY month\nUNION ALL\nSELECT {3}, COUNT(*), ROUND(SUM(total), 2),\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)\nFROM orders\nORDER BY month {4};",
      slots: [
        {
          answer: "1",
          kind: "number",
          label: "the month-key start",
          why: "SUBSTR(created_at, 1, 7) keeps YYYY-MM: 2024-01. Starting at 2 shifts the window to 024-01 and the spine silently re-keys — every downstream month-over-month comparison misses while the chart still renders.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the discard literal",
          why: "Discarded uploads are status 'cancelled' — 7 on the db, 2 in July and 2 in November. 'shipped' would count the 30 processing uploads as discards and the trust picture inverts exactly where the sync pipeline succeeded.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The appended row's label must be the 'TOTAL' literal the packet's footer matches on. '2025-03' would sort into the month spine and impersonate a real fifteenth month, hiding the grand row in plain sight.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first direction",
          why: "The close reads oldest month first so the eye walks the year forward and TOTAL lands last ('T' sorts after every '2…' month key). DESC would open the packet on the TOTAL row and run the year backwards.",
        },
      ],
      distractors: ["'shipped'", "'delivered'", "'2025-03'", "DESC", "MAX"],
      walkthrough:
        "Two branches, one spine. The first SELECT folds 103 uploads into 14 monthly buckets keyed by SUBSTR(created_at, 1, 7): uploads (8, 9, 8, 7…), effort at cents precision (3,731.97 opening January 2024, the 1,193.86 July trough, 2,390.53 closing February 2025) and a discard count that reads 2 in July and 2 in November against 7 total. The second branch appends the grand row — label 'TOTAL', 103 uploads, 34,833.28 effort, 7 discards — and because 'T' sorts after every '2…' month key, ORDER BY month ASC drops it last: the packet foots, the grid closes. The distractors each break differently: 'shipped' or 'delivered' in the discard literal recount the 30 processing or 52 public uploads as discards; '2025-03' as the label impersonates a real month and sorts into the spine; DESC opens the packet on the TOTAL row and runs the year backwards; MAX as the month-key start or the label errors out. One scan, one stack, one TOTAL — the packet foots to 103 / 34,833.28 / 7 or it does not ship.",
    },
    {
      id: "cs-strava-2",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The partner gear audit",
      brief:
        "Strava-flavored brief on the storefront db: the hardware-partnerships team reads the gear audit quarterly — for each brand partner, how many SKUs sit in the catalog (listings) and how much effort the community has logged on that gear, folded from the activity line records that reference each product. Probed facts: six partners carry the 16-SKU catalog; Nordic Gadgets AB pulls 11,130.25 of effort (32% of the book) on 3 listings, Midwest Hardware Co 9,294.93 (26.7%) on 3, and the three-listing bench closes with Shenzhen Electro at 3,049.07 and Pacific Textiles at 2,980.15. The audit ladder keeps partners with at least three listings — which drops Alpine Audio GmbH (4,765.63 on just 2 listings) despite its 4.8 partner rating, the highest on the bench.",
      ask: "Return each partner with region, listing count and effort logged on its gear to 2 decimals, keeping only partners with at least 3 listings, biggest effort first.",
      template:
        "SELECT s.name AS partner,\n       s.region AS region,\n       COUNT({1} p.id) AS listings,\n       ROUND(SUM({2} * oi.unit_price), 2) AS gear_effort\nFROM suppliers s\nJOIN products p ON p.supplier_id = {3}\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.id\nHAVING COUNT(DISTINCT p.id) >= {4}\nORDER BY gear_effort {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) counts catalog SKUs once per partner — Nordic reads 3. COUNT(oi.id) counts line records instead (one per split referencing the gear) and the listings column inflates into an activity-volume count.",
        },
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the units fold",
          why: "Effort on gear folds as SUM(oi.quantity * oi.unit_price): units times the bucket value — Nordic's 11,130.25. Swap in oi.order_id or s.name and the fold multiplies ids or text into the buckets, and every ladder rung lands on a nonsense number.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner key",
          why: "products.supplier_id = s.id is the honest partner-to-SKU edge. Joining on oi.order_id references a table not yet in scope and errors; any other key quietly attaches the wrong catalog to every partner row.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the listing gate",
          why: "The audit keeps at-least-three-listing partners: 3 keeps Nordic, Midwest, Shenzhen and Pacific — every kept row reads 3 listings. A floor of 2 lets Alpine (4,765.63) and Andes (3,613.25) back onto the ladder: six rows instead of four.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-pull-first direction",
          why: "The partnership read goes biggest gear pull first: Nordic 11,130.25, Midwest 9,294.93, Shenzhen 3,049.07, Pacific 2,980.15. ASC opens the ladder on the smallest partner and buries the concentration story.",
        },
      ],
      distractors: ["SUM", "ASC", "oi.order_id", "s.name", "2"],
      walkthrough:
        "One chain, three tables, two grains. suppliers → products → order_items is the gear genealogy: the first JOIN attaches each SKU to its brand partner on products.supplier_id = s.id, the second attaches the line records that reference those SKUs on oi.product_id = p.id. GROUP BY s.id folds to partners; COUNT(DISTINCT p.id) reads listings (3 on every kept row — the gate's whole point) and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads effort logged on that gear. The HAVING COUNT(DISTINCT p.id) >= 3 gate keeps Nordic 11,130.25, Midwest 9,294.93, Shenzhen 3,049.07 and Pacific 2,980.15 — and deliberately drops Alpine Audio, whose 4,765.63 on 2 listings carries the bench's best 4.8 rating: volume is the audit's lens, not sentiment. ORDER BY gear_effort DESC reads biggest pull first. The distractors fail honestly: SUM or ASC in the COUNT arm errors on syntax; oi.order_id in the units fold turns effort into id arithmetic; s.name multiplies text into the buckets and every rung lands on nonsense; 2 in the gate re-admits Alpine and Andes. Four rows, two grains, one concentration read: 32% plus 26.7% of the effort book sits on two partners' gear.",
    },
  ],

  problems: [
    { slug: "game-play-analysis-i", why: "First activity per athlete — the onboarding moment every activation curve starts from. This problem drills the earliest-event fold Strava's growth team runs to time first-upload dates." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The most prolific uploader — on this db one athlete logs 24 activities while the median logs 3. Finding the volume leader is the KOM-chaser screen, asked in every engagement round." },
    { slug: "article-views-ii", why: "The kudos magnet: which uploads clear the engagement bar worth featuring. A conditional count with a HAVING gate — the exact shape of the weekly 'most engaging activities' digest." },
    { slug: "find-followers-count", why: "Follower counts per athlete — the social graph read that sizes club recommendations and feed ranking. Strava is a social network first; this is its count-the-edges exercise." },
    { slug: "number-of-comments-per-post", why: "Kudos and comments per upload — the engagement loop counted per activity. Fan-out from the activity grain to its reactions is the shape of every engagement-health query here." },
    { slug: "reported-posts", why: "Flagged uploads — trust & safety's cheating screen. Segment leaderboards only work if implausible activities get flagged; this is the moderation count that feeds that queue." },
    { slug: "reported-posts-ii", why: "Flag rate per market — where implausible uploads cluster relative to volume. A ratio with an honest denominator, exactly how the discard map is argued in review." },
    { slug: "find-churn-risk-customers", why: "Churn-risk athletes — no recent upload, no kudos momentum. The winback list Strava's lifecycle team mails every week is this anti-join with a freshness window bolted on." },
    { slug: "game-play-analysis-iv", why: "Day-1 retention: who uploads again the day after joining. First-week upload cadence is Strava's strongest early predictor of subscription conversion — this is that query." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Consecutive PBs — monotonic improvements across an athlete's segment efforts. LAG-flag logic over the activity stream, the personal-records screen athletes actually brag about." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "The 30-day activity window — engagement health over a rolling month. Date-filtered conditional counts are the weekly pulse report for the whole growth org." },
    { slug: "active-users", why: "Streaking athletes — consecutive-day uploaders. Streak detection over the activity stream is both a retention feature and the window-function screen this team loves." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU-style stickiness for uploads: daily actives over weekly actives. The ratio that decides whether growth is broadening the base or deepening the obsession of the same athletes." },
    { slug: "growth-accounting", why: "Growth accounting — new, retained, resurrected and churned athletes by upload month. LAG over the month spine, the exact quick-and-dirty view behind the quarterly engagement board." },
    { slug: "bank-account-summary", why: "The subscription billing LEFT JOIN: statements with and without settlement legs, folded per athlete. The cents-safe summary that anchors every AR conversation at close." },
    { slug: "null-blank-audit", why: "The activity-stream quality audit — NULL and blank hygiene on athlete and upload fields before any leaderboard ships. Leaderboards amplify dirty data; this audit runs first." },
  ],
};
