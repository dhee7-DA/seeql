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
    "Preparation strategy: the pools file carries no Strava section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: upload funnels, two-grain censuses, tie-heavy leaderboards, CASE effort bands, calendar spines and the cents-safe billing tables. Do the topics in order, then run the six case studies on the live storefront db: the {emerald:annual effort roll-up} ops closes every month with, the {sky:partner gear audit} the hardware-partnerships team reads quarterly, the {rose:dunning anti-join} billing refreshes before reminders fire, the one-pass {violet:market census} growth opens reviews with, the {orange:upload leaderboard} where the four-way tie becomes a policy argument, and the {sky:trust grid} read before any leaderboard call. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction. This expanded kit is built for spaced practice rather than one sitting: run each case once, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "funnel-step-conversion", "fifteen-days-of-learning"],
    },
    {
      name: "Two-grain market censuses",
      why: "Uploads and athletes are different grains of the same join, and every census here reports both: EU logs 45 uploads from 8 athletes while the US logs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "popularity-percentage", "bank-account-summary"],
    },
    {
      name: "Joining athletes to uploads",
      why: "Athletes carry market and signup date; uploads inherit them through joins, and the join type decides who survives. An upload without an athlete is corruption; an athlete without uploads is lapsed — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "find-the-team-size", "game-play-analysis-i", "article-views-ii", "find-followers-count", "number-of-comments-per-post", "reported-posts", "reported-posts-ii", "find-churn-risk-customers", "game-play-analysis-iv"],
    },
    {
      name: "Segment leaderboards & rank policy",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four athletes sit at 4 uploads each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer athletes, not syntax. Strava athletes live on segment boards; the KOM tie policy is a product decision you will be asked to encode.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "top-percentile-fraud", "friend-requests-ii-who-has-the-most-friends", "compute-the-rank-as-a-percentage", "customer-placing-the-largest-number-of-orders", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Effort banding with CASE",
      why: "Pace and power buckets are CASE-classified — recovery, tempo, threshold — with fixed edges the training page publishes, and subscription tiers band the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the training-load report, and a reordered WHEN quietly re-bands every athlete.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "create-a-session-bar-chart", "growth-accounting"],
    },
    {
      name: "Gear chains: partners to SKUs to line records",
      why: "Gear is a three-table genealogy — brand partner, catalog SKU, then the split/lap line records that reference it — and the audit questions all run that chain. Which partner's gear carries the community's effort, at what listings count, is the quarterly partnerships read; the join path decides whether you count SKUs or line records.",
      slugs: ["students-and-examinations", "sales-person", "number-of-trusted-contacts-of-a-customer", "the-most-recent-orders-for-each-product", "average-selling-price", "null-blank-audit"],
    },
    {
      name: "Month spines & calendar buckets",
      why: "The annual effort heatmap is a month-keyed spine — SUBSTR(created_at, 1, 7) over 14 buckets from 2024-01 to 2025-02 — and every trend report here starts by building it correctly. '%m' alone merges January 2024 with January 2025; half-open date windows keep the last night's uploads; the calendar is where heatmap screens go wrong.",
      slugs: ["convert-date-format", "the-latest-login-in-2020", "rising-temperature", "new-users-daily-count", "rolling-7d-actives"],
    },
    {
      name: "Windows over the activity stream",
      why: "Engagement is window math: month-over-month upload deltas with LAG, running effort totals per athlete, rolling averages over training weeks. The first row's LAG is NULL by definition — the baseline, never a zero — and frame semantics decide whether a cumulative effort walk steps row by row or absorbs tied timestamps in one jump.",
      slugs: ["biggest-window-between-events", "running-total-for-different-genders", "rolling-average-steps", "second-most-recent-activity", "week-over-week-churn", "consecutive-numbers", "user-activity-for-the-past-30-days-ii", "active-users", "dau-wau-stickiness"],
    },
    {
      name: "Set ops & the grand-total stack",
      why: "The month-close packet stacks per-month rows under a labelled TOTAL row — UNION ALL, never UNION, because the dedup can silently eat a month that happens to match. Board packets that stack populations (this quarter beside last, processed beside discarded) live and die on the ALL.",
      slugs: ["team-scores-in-football-tournament", "league-statistics", "the-airport-with-the-most-flights"],
    },
    {
      name: "Billing & cents discipline",
      why: "Processed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the athlete world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning calendar.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule"],
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
    {
      id: "strava-t9",
      q: "Walk me through the three counts — COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) — on the uploads table, and the story each tells the business.",
      a: "COUNT(*) counts rows: 103 uploads booked, no exceptions — the denominator every rate gets judged against. COUNT(shipped_at) counts non-NULL stamps: 82 uploads that cleared ingest — the gap between it and COUNT(*) is exactly the 14 queued plus 7 discarded, which makes the gap itself a queue-and-discard read. COUNT(DISTINCT customer_id) folds the 103 uploads back to 16 athletes — the installed base behind the load. Three counts, three grains: events, processed events, people. The trap is letting one query imply all three: a dashboard that labels COUNT(*) 'athletes active' is a 6× lie. On this db the three counts are 103, 82 and 16 — and a strong candidate can say, unprompted, which of those the slide in front of them is actually showing.",
      tag: "aggregation",
    },
    {
      id: "strava-t10",
      q: "You need split-level detail beside upload-level effort totals. How do you join order_items for the splits without triple-counting the effort book?",
      a: "Name the two grains and never aggregate across them in one expression. The upload grain (orders) holds the effort total — 34,833.28 over 103 rows; the line grain (order_items) holds 251 split records. Join them for detail and SUM(o.total) on the joined rows re-adds each upload's effort once per line — 103,244.55 on this db, roughly triple the book. The fixes, in order of preference: aggregate effort at the upload grain FIRST (CTE or derived table), then join the fold to line detail; or aggregate at the line grain (SUM(quantity × unit_price)) and never touch orders.total in the same query. What you never do is SUM an upload-grain column after the fan-out 'because the join was convenient'. The interviewer's follow-up — 'one row per what?' — is the whole defense: if the answer is not one row per upload, the effort number is already wrong.",
      tag: "joins",
    },
    {
      id: "strava-t11",
      q: "When do you reach for a window with PARTITION BY instead of GROUP BY in the engagement reporting?",
      a: "When the row must survive. GROUP BY folds: 103 uploads become 16 per-athlete rows, and every other column has to be an aggregate or disappear. PARTITION BY annotates: COUNT(*) OVER (PARTITION BY customer_id) stamps each upload with its athlete's total — 24 beside every one of Alice's activities — while the rows stay intact. The engagement reads that need the annotated shape: each upload beside its athlete's running effort, each activity beside the club's average, each athlete beside their market's upload count. The decision test is 'does the output keep one row per activity?' If yes, windows; if the deliverable IS the fold, GROUP BY. They compose: GROUP BY builds the per-athlete fold, then a window over the fold ranks it — which is the CTE-then-rank shape this kit's leaderboard case runs.",
      tag: "windows",
    },
    {
      id: "strava-t12",
      q: "Growth wants week-over-week deltas and a 'streak of green weeks' flag on the upload spine. Where do LAG and LEAD each belong, and what do you do about the edge rows?",
      a: "LAG reads the previous row — week-over-week deltas, this-week-versus-last, the churn denominator; LEAD reads the next — 'what happened the week after this spike', the forward-looking view for cohort notes. Both return NULL at the edges: the first week has no prior, the last has no next, and the policy is to report the NULL as 'baseline' or 'incomplete week', never to coalesce it to zero — a zero delta on the spine's first row reads as a flat week that never happened. Streak flags stack on top: compute the delta in a CTE (window output is not visible to WHERE in the same SELECT), then a second window counts consecutive positive deltas — gaps-and-islands over the green rows. The one structural requirement: the spine must be complete. A missing week silently shifts every LAG pair, so build the spine from a calendar dimension or prove the gaps away first.",
      tag: "windows",
    },
    {
      id: "strava-t13",
      q: "strftime, SUBSTR and julianday — which date tool for which job on TEXT timestamps, and where does each one bite?",
      a: "Three jobs. Bucketing: SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 spine buckets on this db; '%m'-style slices merge January 2024 with January 2025, which is how heatmaps become fiction. Calendar math: julianday(shipped_at) − julianday(created_at) — the ingest-latency read, 2.98 days on this db's stamped 82; julianday converts the TEXT stamp to a float day count so subtraction is honest arithmetic. Formatting and extraction: strftime('%W', created_at) for week numbers, '%Y' for the year — the strftime toolkit answers 'which calendar unit does this stamp belong to' without slicing strings by eye. The bites: BETWEEN against a bare date string drops the last night's timestamps (use half-open ranges — >= start AND < the day after end); string comparison only works because ISO dates sort lexicographically, so any non-ISO format in the column poisons every range filter silently.",
      tag: "dates",
    },
    {
      id: "strava-t14",
      q: "COALESCE, IFNULL and NULLIF — give the policy for each in a telemetry pipeline, with one place each earns its keep.",
      a: "COALESCE(a, b, c…) walks a fallback list — the display policy: COALESCE(shipped_at, 'not yet stamped') prints an honest sentinel for the queue instead of a blank that reads as broken. IFNULL is the two-argument twin — same job, shorter; use it for single fallbacks and COALESCE when the fallback chain is real. NULLIF(a, b) is the opposite move: it returns NULL when the two agree — the divide-by-zero guard. Every per-athlete ratio in this kit (kudos per upload, intensity per market) is one empty-club away from division by zero, and NULLIF(denominator, 0) turns that from a crash or an infinity into a NULL the dashboard labels 'n/a'. The policy line that separates a strong candidate: COALESCE and IFNULL change what MISSING data displays as; NULLIF manufactures a missing value to protect a computation. They are not interchangeable, and 'I coalesce everything to zero' is the answer that ends the screen.",
      tag: "nulls",
    },
    {
      id: "strava-t15",
      q: "The close packet stacks fourteen monthly rows under a labelled TOTAL row. Design the stack so nothing can silently vanish.",
      a: "Four decisions, each defensible in review. UNION ALL, never UNION: the dedupe pass a bare UNION runs is a correctness bet you don't need — a monthly row that byte-matches the TOTAL row's prefix (or another month) collapses silently, and the packet loses a month with no error. A distinguishing label: the second branch emits 'TOTAL' in the month column, so no two rows can ever collide — the label is not decoration, it is the dedupe-proof. One sort key that puts the TOTAL last: ORDER BY month with the label 'TOTAL' works because 'T' sorts after every '2…' month key, but the strong answer says WHY that works instead of hoping. Matching column lists: both branches project the same columns in the same order — uploads, effort, discards — because UNION branches bind by position. Then the receipt: the packet foots to 103 uploads, 34,833.28 effort, 7 discards, and the reviewer can re-add any row's four stage columns to its market count. A stack that cannot explain its own arithmetic is not a close packet, it is a screenshot.",
      tag: "set-ops",
    },
    {
      id: "strava-t16",
      q: "Your dashboard needs per-market effort, each market's share of the book, and a rank — three layers deep. How do you stage that without one unreadable query?",
      a: "A CTE chain, one grain per step. Step one folds uploads to markets: SELECT region, SUM(total) AS effort … GROUP BY region — the census grain. Step two layers the ratios: share = 100.0 × effort / SUM(effort) OVER () — the book total as a window over the fold — and DENSE_RANK() OVER (ORDER BY effort DESC) for the ladder; both windows read the same folded rows, so they live in the same SELECT. The outer query then filters or presents — 'markets above 10% share', say. Why not one query: window functions cannot sit in WHERE, aggregates cannot see each other's output, and nesting subqueries three deep makes the definition unreviewable. The CTE names are the documentation — market_effort, market_shares — and each is a checkpoint you can SELECT from while debugging. The performance note: CTEs are logical staging, not guaranteed materialization, so keep each step's filter early. This is the exact shape of the leaderboard case in this kit: fold in a CTE, rank over the fold, present from the outside.",
      tag: "ctes",
    },
    {
      id: "strava-t17",
      q: "EXISTS, IN, or a derived table — pick one for 'athletes with at least one discarded upload' and defend it.",
      a: "EXISTS, and the defense is threefold. Semantics: the ask is an existence probe — at least ONE row — which is exactly what EXISTS(short-circuits on the first match) answers; IN materializes the whole status list and compares membership. NULL safety: EXISTS never trips on NULLs; NOT IN over a column that ever carries one returns an empty result silently — the staging-table failure mode this kit's screens drill. Scale behavior: the semi-join shape (EXISTS against a filtered subquery) lets the engine probe an index instead of building a list. The derived table wins when the subquery is itself an aggregation — 'athletes with 2+ discards' needs a GROUP BY customer_id HAVING COUNT(*) >= 2 staged first, then a join. So the honest answer names the boundary: existence → EXISTS; aggregated property → derived table or CTE; IN → small static lists only. Saying 'they all work' is true and beside the point — the screen is about which one survives the NULL and the scale.",
      tag: "subqueries",
    },
    {
      id: "strava-t18",
      q: "How does GROUP BY treat NULLs — and why does the status census still reconcile to 103 by construction?",
      a: "GROUP BY treats NULL as its own group: all NULL values fold into one bucket, the same way a status would — which is why a stamp census (COUNT by shipped_at presence) puts the 21 unstamped uploads in one visible 'no stamp' group instead of scattering them. The status census reconciles because status is NOT NULL — every one of the 103 uploads carries exactly one of the four stage labels, so the four conditional counts (SUM(CASE …) arms with ELSE 0) partition the table with no remainder: 52 + 30 + 14 + 7 = 103 by construction, not by audit luck. The two census traps: an arm set with a typo ('cancelld') doesn't error — it silently prints 0 and the total comes up 96, so the reconciliation check IS the typo alarm; and counting with COUNT(column) instead of COUNT(*) shrinks the denominator on sparse columns, breaking the identity. The strong answer states the identity out loud — arms exhaustive, ELSE 0, COUNT(*) denominator — because that identity is what makes the dashboard trustworthy at a glance.",
      tag: "groupby",
    },
    {
      id: "strava-t19",
      q: "The leaderboard needs a top-5 cut. What does LIMIT do to a tie, and how do you cut a top-N fairly?",
      a: "LIMIT is positional and blind to ties: ORDER BY uploads DESC LIMIT 5 keeps Alice 24, Emma 17, Grace 14, Maya 13, Chloe 5 — and the four athletes tied at 4 are simply absent, with no say in which five rows 'won'. If two athletes tied ON the cut boundary — say two at 5 — LIMIT picks one arbitrarily (or by whatever physical order the plan found), which is a silent judgment call wearing a ranking. The fair cuts, in order of preference: rank windows — RANK() OVER (ORDER BY uploads DESC) <= 5 keeps tied peers on shared rungs, so a tie at the boundary admits six athletes, visibly; or an explicit, named tie-breaker — ORDER BY uploads DESC, athlete ASC LIMIT 5 — which is deterministic and states its politics. What never passes review: LIMIT without an ORDER BY (undefined), or LIMIT with a silent tie. Segment leaderboards trained this product's users to expect shared crowns; the SQL cut should be able to say out loud what it does with a tie.",
      tag: "pipeline",
    },
    {
      id: "strava-t20",
      q: "EU and APAC both discarded 3 uploads. Same numerator — why does the review treat the two markets differently, and how do you compute the rate so it survives scrutiny?",
      a: "Because the denominator is the story: 3 of 45 uploads in EU is 6.7%, 3 of 37 in APAC is 8.1% — APAC's discard posture is worse on a per-upload basis, and the raw counts hide exactly that. The rate's construction rules: state the denominator BEFORE computing (all uploads booked, including queued — the house rule from the ingest-share read), force real arithmetic with 100.0 * numerator / COUNT(*) so integer division cannot truncate 6.7 to 6, and round at the display edge, not inside the ratio. Then the honesty layer: small denominators get caveats — LATAM's 0% discard share is 0 of 2, which is arithmetic, not safety — and the census identity backs the number (arms exhaustive, reconciles to 103 by construction). The interview follow-up is always 'what changed the denominator?' — a filter that drops cancelled rows before the rate, for instance, turns the metric into 'discard share of non-discarded uploads', which is a different (and quietly self-flattering) claim.",
      tag: "ratios",
    },
    {
      id: "strava-t21",
      q: "Athlete names and city keys arrive messy — '  london ', 'LONDON'. What's the SQL hygiene kit, and which fields must never be cleaned after the join?",
      a: "The kit: TRIM for padding, UPPER or LOWER for case-folding, REPLACE for junk characters, SUBSTR/LENGTH for structural checks — and the order matters: trim, then fold, then join. The invariant: any column used as a JOIN or GROUP BY key gets normalized on BOTH sides in the same vocabulary — joining c.city to a feed table's city fails silently if one side is 'London' and the other 'LONDON', because string equality is byte equality. Display columns can keep their case; key columns cannot. The rule that trips candidates: never clean AFTER aggregating — GROUP BY ran on the un-normalized keys, so 'LONDON' and 'London' are already two rows and the market census is quietly double-counted; the fix lives before the fold or not at all. And the test: after hygiene, re-run the distinct count — if COUNT(DISTINCT LOWER(TRIM(city))) is smaller than COUNT(DISTINCT city), you had split keys, and every historical number that grouped the raw column inherits the split.",
      tag: "strings",
    },
    {
      id: "strava-t22",
      q: "One-pass censuses: FILTER (WHERE …), SUM(CASE WHEN …), and GROUP BY — when does each win, and can they coexist?",
      a: "GROUP BY wins when the output shape is rows-per-group and nothing needs to sit beside the groups — the region×status detail read. The two conditional-aggregation shapes win when every count must share one row (the one-pass census the dashboards want): SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable classic — works on any engine back a decade; COUNT(*) FILTER (WHERE status = 'delivered') is the modern SQLite/Postgres form that states the predicate as a predicate instead of arithmetic — same numbers, more legible definition, and it composes with ROUND and division without nesting CASE inside CASE. They coexist freely in one SELECT, and the choice is house style plus engine support. The discipline both shapes demand: arms exhaustive (ELSE 0), denominators COUNT(*), and the reconciliation identity — four stage counts summing to 103 — checked in the same query. A census that can't prove its own arms are exhaustive is a screenshot, not a metric.",
      tag: "filters",
    },
    {
      id: "strava-t23",
      q: "How do you version a metric definition like 'processed-and-public' so three dashboards don't drift into three different numbers?",
      a: "Treat the definition as a table, not a vibe. The registry entry states: the grain (one row per upload), the filter (status = 'delivered' — NOT 'not cancelled', which quietly admits pending), the denominator it reports against (all 103 booked, not just stamped), and the owner. Every dashboard queries the registry's canonical query — or better, the table it materializes — instead of re-deriving the filter from memory, which is where drift is born: someone writes status != 'cancelled', the number moves from 52 to 96, and three teams present for a week before anyone notices. The audit query reconciles on every run: the four stage arms must sum to COUNT(*) — 52 + 30 + 14 + 7 = 103 by construction — and any miss is an incident, not a rounding note. Version changes are announced, dated, and run side-by-side for a cycle, because 'public uploads' moving its definition silently invalidates every trend line that quoted it. The interview signal: candidates who say 'the definition ships WITH the number' have worked in a shop where it didn't.",
      tag: "quality",
    },
    {
      id: "strava-t24",
      q: "Cumulative effort, moving average, and the tie problem: build both from the same window, and explain when the default frame betrays you.",
      a: "Same walk, different frames. Cumulative: SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at) — the default frame RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW accumulates from the athlete's first activity. Moving 7-activity average: AVG(total) OVER (PARTITION BY customer_id ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — the frame must be stated, because the default never stops looking backwards. The betrayal is RANGE vs ROWS: RANGE includes PEERS — rows tied on the ORDER BY key enter the cumulative together, so two uploads sharing a start second jump the running total twice at once; ROWS walks strictly one row at a time. On a month spine ties are rare; at upload grain, mass-synced devices guarantee them, and the honest choice is ROWS (or accepting that a tie is one simultaneous event). The expert flourish: with a date axis, RANGE peers 7 DAYS back while ROWS peers 7 ROWS back — if a day is missing, only one of those is the trend the stakeholder asked for.",
      tag: "windows",
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
    {
      id: "strava-mcq-11",
      prompt: "The dashboard needs all four stage counts — 52 public, 30 processing, 14 queued, 7 discarded — in ONE row from ONE scan. Which pattern delivers that shape?",
      choices: [
        "Four separate GROUP BY status queries pasted side by side",
        "Four SUM(CASE WHEN status = … THEN 1 ELSE 0 END) columns in a single SELECT",
        "COUNT(DISTINCT status) beside COUNT(*)",
        "GROUP BY status with COUNT(*)",
      ],
      answer: 1,
      why: "Conditional aggregation folds each status into its own column in one pass — the one-row census shape the grid needs, with the reconciliation identity visible (52 + 30 + 14 + 7 = 103). GROUP BY status computes the same numbers as four ROWS, which then have to be pivoted by hand.",
      notes: [
        { choice: 3, why: "Correct counts, wrong shape: four rows that a dashboard then transposes. The ask fixed the shape — one row — and conditional aggregation is the tool that obeys." },
        { choice: 2, why: "COUNT(DISTINCT status) counts status labels (4), not uploads per status. A column count wearing a census name." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-12",
      prompt: "Growth wants the single highest-effort activity, and two uploads can tie at the top. Which read returns the NUMBER safely regardless of ties?",
      choices: [
        "SELECT MAX(total) FROM orders",
        "SELECT id, total FROM orders ORDER BY total DESC LIMIT 1",
        "SELECT id, total FROM orders WHERE total = MAX(total)",
        "SELECT TOP 1 total FROM orders",
      ],
      answer: 0,
      why: "MAX(total) aggregates to the value itself — ties change nothing about the number. ORDER BY … LIMIT 1 returns one arbitrary row among tied peaks (fine for 'show me A row', wrong when you promised THE number), and mixing an aggregate into a row-level WHERE is a syntax error.",
      notes: [
        { choice: 1, why: "LIMIT 1 works until the tie: SQLite then picks one arbitrarily — you presented one activity as THE peak when two share the crown. For a row, add a named tie-breaker and say so." },
        { choice: 3, why: "TOP is SQL Server syntax — SQLite errors on sight. Knowing the engine's vocabulary is part of the screen." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-13",
      prompt: "The effort heatmap must bucket 2024-01 and 2025-01 into DIFFERENT months. Which month key does that?",
      choices: [
        "SUBSTR(created_at, 6, 2)",
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 1, 4)",
        "UPPER(created_at)",
      ],
      answer: 1,
      why: "Positions 1–7 keep YYYY-MM — 14 distinct spine buckets on this db from 2024-01 to 2025-02. The 6,2 slice keeps only month digits and merges the two Januarys into one fake bucket; 1–4 keeps only the year and collapses the spine to two rows.",
      notes: [
        { choice: 0, why: "Month-only keys are the '%m' trap: Jan 2024 and Jan 2025 fold together, the heatmap doubles some months and invents a 13-month year." },
        { choice: 2, why: "A year key is a 2-bucket chart — not a trend read. Bucket granularity is a decision, and the wrong one here erases seasonality." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-14",
      prompt: "Billing prints dollars from INTEGER-cent money. Why is the house read amount_cents / 100.0 and not amount_cents / 100?",
      choices: [
        "Identical today — cents are always whole dollars, so the .0 is decoration",
        "/ between two INTEGERs truncates the sub-dollar remainder — harmless on this book's whole-dollar rows, silently wrong the day an odd-cent settlement lands",
        "/ 100 rounds to the nearest dollar",
        "SQLite cannot divide two INTEGERs",
      ],
      answer: 1,
      why: "Integer ÷ integer is integer division: 12,349 cents prints 123, not 123.49. On this db every ledger sum happens to be a whole multiple of 100, so the bug is invisible today — which is exactly why the /100.0 convention is drilled: the discipline has to hold before the data turns odd.",
      notes: [
        { choice: 0, why: "True today, and that is the trap — the convention exists for the odd-cent row that arrives next quarter, not for the rows that made the rule." },
        { choice: 2, why: "Nothing rounds: integer division discards. 12,399 / 100 is 123, not 124 — ROUND is a separate, later step." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-15",
      prompt: "The partner audit counts Nordic Gadgets' catalog listings. The suppliers → products → order_items chain folds 43 line records touching Nordic gear. Which expression reads 3 — the true listing count?",
      choices: [
        "COUNT(oi.id)",
        "COUNT(DISTINCT p.id)",
        "COUNT(DISTINCT oi.id)",
        "SUM(p.id)",
      ],
      answer: 1,
      why: "The line-record grain fans each listing out to every split that references it — 43 rows covering 3 SKUs. COUNT(DISTINCT p.id) folds back to catalog SKUs; everything counting oi rows reports activity volume wearing a listings name.",
      notes: [
        { choice: 0, why: "43 — one per split record. A real number answering 'how active is this gear', not 'how wide is the catalog'. The audit's grain decision, stated." },
        { choice: 3, why: "SUM over ids adds key values — a meaningless figure that changes when a SKU re-registers. Aggregates over keys are category errors." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-16",
      prompt: "The review keeps only markets carrying at least 3,000 total effort. Where does that rule live?",
      choices: [
        "WHERE SUM(total) >= 3000",
        "HAVING SUM(total) >= 3000 after GROUP BY c.region",
        "ORDER BY SUM(total) >= 3000",
        "WHERE total >= 3000",
      ],
      answer: 1,
      why: "Total effort is a per-market aggregate — it exists only after GROUP BY folds the uploads, so its threshold lives in HAVING. WHERE total >= 3000 is a different, row-level rule: it keeps individual activities above 3,000 and then mislabels the survivors' sum as a market census.",
      notes: [
        { choice: 0, why: "Aggregate in WHERE is a syntax error — groups do not exist yet at filter time. The pipeline order is the whole lesson." },
        { choice: 3, why: "This runs, and that is the danger: it answers 'markets whose BIGGEST uploads are big', not 'markets whose TOTAL crosses 3,000'. Small-but-consistent markets vanish." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-17",
      prompt: "Count Q1 uploads — January 1 through March 31, last night included. Which WHERE clause keeps them all?",
      choices: [
        "WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "WHERE MONTH(created_at) BETWEEN 1 AND 3",
        "WHERE created_at LIKE '2024-0%'",
      ],
      answer: 1,
      why: "Timestamps carry a time-of-day, so '2024-03-31' as an upper bound excludes everything after midnight — exactly when the long month-end rides land. The half-open range [Jan 1, Apr 1) keeps all of March including its final hours.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends against a bare date string — '2024-03-31T18:22' sorts after '2024-03-31' and drops out of the bucket silently." },
        { choice: 3, why: "The pattern matches April through September too — '2024-0%' is a coincidence of digits, not a calendar. It over-counts by six months." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-18",
      prompt: "The WoW spine opens at 2024-01 (8 uploads) and its delta column reads NULL for that first row. What ships?",
      choices: [
        "COALESCE it to 0 so the chart has no gaps",
        "Report it as NULL / 'baseline' — there is no prior month to differ from",
        "Drop the row so the chart starts at February",
        "Fill it with the average delta across the spine",
      ],
      answer: 1,
      why: "The first month's delta is NULL by definition — no prior row, no baseline, no change. Coalescing to 0 invents a flat January and corrupts every downstream 'streak of growth' check that treats 0 as a real reading.",
      notes: [
        { choice: 0, why: "0 is a factual claim — 'no change' — about a month that had nothing to change against. This is exactly how fake flat months are born." },
        { choice: 2, why: "Dropping the row amputates January's 8 uploads and shifts every LAG pair — February would then compare against nothing, and the spine no longer reconciles to 13 buckets." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-19",
      prompt: "Billing's dunning draft uses a LEFT JOIN from invoices to payments but returns only 22 statements — the 6 never-collected are gone. What happened?",
      choices: [
        "The LEFT JOIN is buggy — it dropped unmatched rows",
        "A WHERE on a payments column (like p.method = 'card') filtered the NULL payloads away, silently downgrading the LEFT JOIN to an INNER JOIN",
        "GROUP BY collapsed the 6 unmatched rows into one",
        "Rows with no payments cannot appear in any join",
      ],
      answer: 1,
      why: "The classic silent downgrade: a WHERE predicate on the right table's column kills every NULL-payload row (NULL = anything is UNKNOWN), and 28 − 6 = 22 is exactly the inner-join result. The fix is moving the predicate into the ON clause — or testing p.id IS NULL when the dunning rows are the point.",
      notes: [
        { choice: 3, why: "Backwards — unmatched rows are precisely what a LEFT JOIN preserves; they arrive with NULL right-side columns. Deleting them is the WHERE's doing, not the join's." },
        { choice: 0, why: "The join behaved exactly as written. The WHERE clause did the damage; fixing the join type would only hide the filter that caused it." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-20",
      prompt: "Trust & safety wants each market's monitored cities as one comma-separated cell. Which aggregate folds city ROWS into that string?",
      choices: [
        "CONCAT(city, ',')",
        "GROUP_CONCAT(DISTINCT city)",
        "STRING_AGG(city, ',')",
        "city || ','",
      ],
      answer: 1,
      why: "GROUP_CONCAT is SQLite's row-to-string fold: GROUP_CONCAT(DISTINCT city) per region returns 'Berlin,Lyon,…' as one cell. CONCAT and || join values inside a single row's expression — they cannot fold 8 city rows into one.",
      notes: [
        { choice: 2, why: "STRING_AGG is the Postgres/standard name — SQLite answers to GROUP_CONCAT. The vocabulary trip between engines is the point of the question." },
        { choice: 0, why: "CONCAT operates per row — it appends a comma to each city individually, producing eight strings, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-21",
      prompt: "Settlement days = issue-to-payment. Five invoices settled on TWO legs (two payment rows, different days). Which read keeps the average honest at 28.4 days over the 20 statements that carry legs?",
      choices: [
        "AVG(julianday(p.paid_on) − julianday(i.issued_on)) over the invoices ⋈ payments join",
        "First fold to the FIRST leg per invoice — MIN(p.paid_on) — then average the per-statement days",
        "AVG over payments rows only, ignoring statements with no legs",
        "Use MAX(p.paid_on) so no statement is ever underestimated",
      ],
      answer: 1,
      why: "The join fans each two-leg statement into two rows, so the naive join average weights those five statements twice — their second legs dragging the number. Folding to MIN(paid_on) restores the statement grain first; then the average reads time-to-first-settlement, which is the metric the 28.4 figure names.",
      notes: [
        { choice: 0, why: "25+ payment rows over 20 paying statements — the five split statements contribute two rows each and the average drifts toward their later legs. A grain bug, not a rounding issue." },
        { choice: 3, why: "MAX measures 'when did we finish collecting' — a different metric (the dunning clock), not time to first settlement. Naming the metric pins the fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-22",
      prompt: "A teammate joins order_items to fetch split records and reports total effort as 103,244.55 — nearly triple the book's 34,833.28. Diagnosis?",
      choices: [
        "order_items.total holds a different effort scale",
        "The join fanned each upload out to its split records — SUM(o.total) then re-added each upload's effort once per line (251 lines over 103 uploads)",
        "SUM ignores NULL totals, inflating the rest",
        "Rounding accumulated across the 251 rows",
      ],
      answer: 1,
      why: "Joining the line-record grain multiplies each upload row by its split count, and SUM over the fattened rows re-adds each upload's effort per line — the ~3× inflation. Aggregate effort at the upload grain BEFORE joining for detail, or fold at the line grain (quantity × unit_price) and never touch orders.total in the same query.",
      notes: [
        { choice: 2, why: "Totals are NOT NULL — NULL handling changes nothing here. The inflation factor is the fan-out, which is structural, not value-dependent." },
        { choice: 3, why: "This book's cent sums land on whole multiples; a 3× jump is a shape problem, not floating-point noise. Rounding never triples anything." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-23",
      prompt: "A pipeline retry double-booked an athlete's upload — same customer_id, same created_at, different id. Which fragment keeps exactly the freshest copy?",
      choices: [
        "SELECT DISTINCT customer_id, created_at FROM orders",
        "ROW_NUMBER() OVER (PARTITION BY customer_id, created_at ORDER BY id DESC) = 1 — keep rn = 1",
        "GROUP BY customer_id HAVING COUNT(*) > 1, then delete both copies",
        "ROW_NUMBER() OVER (ORDER BY created_at) = 1",
      ],
      answer: 1,
      why: "PARTITION BY the natural key (athlete + start time) with ORDER BY id DESC numbers each duplicate group newest-first; keeping rn = 1 removes exactly one copy and keeps the activity's history intact. DISTINCT collapses copies into a projection, and the HAVING approach flags groups but a delete keyed on it removes BOTH copies.",
      notes: [
        { choice: 0, why: "DISTINCT dedupes the projection, not the table — and destroys every column you didn't project. It reports; it never repairs." },
        { choice: 2, why: "COUNT(*) > 1 finds the groups, but the delete that follows loses the activity entirely — the athlete's history now has a hole where a legit upload lived." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-24",
      prompt: "The monthly upload ladder reads 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 6, 6, 6. What rank do the 6-upload months carry under RANK()?",
      choices: ["9", "11", "6", "4"],
      answer: 1,
      why: "RANK shares rungs and skips: the two 9s take ranks 1–2, the four 8s take 3–6, the four 7s take 7–10 — so the first 6 lands on rank 11, and all three 6-upload months share it. DENSE_RANK would say 4; ROW_NUMBER would split them 11, 12, 13.",
      notes: [
        { choice: 3, why: "That is DENSE_RANK — no gaps, the 6s are the 4th tier. The gap version (RANK) is what segment boards print, and the count of skipped rungs is the count of tied rows above." },
        { choice: 0, why: "9 is the LAST rank the 7-block occupies, not the next rung handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-25",
      prompt: "COUNT(*) FILTER (WHERE status = 'delivered') — what does the FILTER clause buy over SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)?",
      choices: [
        "It is faster because it skips the CASE compiler",
        "Same count, cleaner statement of intent — the predicate lives inside the aggregate, so one scan carries many labeled counts without nested CASE logic",
        "It excludes NULL statuses from the denominator",
        "It returns one row per status instead of one column",
      ],
      answer: 1,
      why: "FILTER is conditional aggregation with the condition attached to the aggregate: COUNT(*) FILTER (WHERE …) counts matching rows in the same pass, and the numbers match the CASE-SUM version exactly. What it buys is legibility — the metric's definition reads as a predicate, not as arithmetic sleight-of-hand.",
      notes: [
        { choice: 2, why: "NULL status rows fail the predicate in BOTH shapes equally — FILTER changes readability, not NULL semantics." },
        { choice: 3, why: "One row per status is GROUP BY's job. FILTER stacks COLUMNS into one row — the census shape the dashboard wants." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-26",
      prompt: "The region×status grid must show LATAM's discarded column. LATAM has 0 discards. Which construction prints the 0 instead of dropping the cell?",
      choices: [
        "GROUP BY c.region, o.status — unobserved combos just don't appear",
        "Conditional aggregation: SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) per region — every region row carries every status column, zeros included",
        "INNER JOIN from a statuses list to uploads, then COALESCE the misses",
        "HAVING SUM(CASE …) IS NOT NULL",
      ],
      answer: 1,
      why: "GROUP BY region, status enumerates only OBSERVED pairs — LATAM-cancelled never occurred, so the row vanishes and the grid lies by omission. The pivot shape fixes the columns up front, and ELSE 0 turns 'no such rows' into an honest 0.",
      notes: [
        { choice: 2, why: "INNER JOIN deletes exactly the empty combos you promised to show — COALESCE never sees a row to fix. The fix is the arm set, not the join." },
        { choice: 3, why: "SUM of zero rows returns 0, not NULL — the filter removes nothing and adds nothing. The columns had to exist first; HAVING is downstream of the whole problem." },
      ],
      difficulty: "hard",
    },
    {
      id: "strava-mcq-27",
      prompt: "The dashboard walks cumulative effort per athlete. Which clause makes the running total RESTART for each new athlete?",
      choices: [
        "ORDER BY created_at",
        "PARTITION BY customer_id",
        "GROUP BY customer_id",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      ],
      answer: 1,
      why: "PARTITION BY customer_id gives every athlete their own window: the running SUM accumulates within it and resets at the next athlete. Without it, one global walk mixes everyone's effort into a single company-wide running total.",
      notes: [
        { choice: 0, why: "ORDER BY sets the walk's direction and order INSIDE each partition — it never scopes one. Direction without scope is the half-built window." },
        { choice: 3, why: "That frame fixes ROWS-vs-RANGE tie behavior within a partition; it does not create partitions. Frame and partition are different dials." },
      ],
      difficulty: "easy",
    },
    {
      id: "strava-mcq-28",
      prompt: "The feed dashboard prints the ingest stamp as text; queued uploads have no stamp yet. Which display line is honest?",
      choices: [
        "COALESCE(shipped_at, 'not yet stamped')",
        "COALESCE(shipped_at, '1970-01-01')",
        "COALESCE(julianday(shipped_at), 0)",
        "COALESCE(shipped_at, created_at)",
      ],
      answer: 0,
      why: "The stamp is missing, and 'missing' has a name: a readable sentinel that says the queue owns these rows. Epoch dates and 0-day latencies invent data points; falling back to created_at claims a stamp the pipeline never wrote.",
      notes: [
        { choice: 1, why: "1970 sorts first and, if it leaks into arithmetic, computes a ~19,000-day latency — sentinel dates poison every average they touch." },
        { choice: 3, why: "created_at is the activity start, not the ingest stamp — this claims every queued upload cleared processing instantly, which is the exact lie the latency metric exists to catch." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-29",
      prompt: "SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders) — what does it return on this book (mean 338.19)?",
      choices: [
        "0 — no activity beats a mean that includes it",
        "42 — the uploads strictly above the mean",
        "103 — every row compares true against an average",
        "NULL — a scalar subquery cannot feed a comparison",
      ],
      answer: 1,
      why: "42 of 103 activities clear the 338.19 mean — the right-skew read: a few ultras (up to 1,088.44) drag the mean above where most activities sit, yet 42 rows still clear it. The scalar subquery returns exactly one value, so the comparison is well-formed.",
      notes: [
        { choice: 0, why: "That is the median confusion — the mean sits ABOVE most activities precisely because the big ultras pull it; 42 rows remain above it. Right-skew, not paradox." },
        { choice: 2, why: "Strict > excludes every upload at or below 338.19 — 61 of them. The comparison is per-row against one constant, not a blanket true." },
      ],
      difficulty: "medium",
    },
    {
      id: "strava-mcq-30",
      prompt: "On the uploads table, COUNT(*) returns 103 and COUNT(shipped_at) returns 82. What is the 21-row gap?",
      choices: [
        "Discarded uploads only",
        "Uploads with no ingest stamp yet — the 14 queued plus the 7 discarded",
        "Duplicate pipeline retries",
        "Pending uploads only",
      ],
      answer: 1,
      why: "COUNT(*) counts rows; COUNT(shipped_at) counts non-NULL stamps — the 21 unstamped rows are exactly the 14 queued plus the 7 discarded (a thrown-out file never clears ingest either). The gap is a population read: queue plus waste, in one number.",
      notes: [
        { choice: 3, why: "Pending alone is 14 — the discarded 7 also lack stamps. Half the answer is a whole-category miss." },
        { choice: 2, why: "Retries would appear as duplicate rows WITH stamps — they inflate both counts equally and never open a gap between the two COUNTs." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-strava-3",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The dunning anti-join",
      brief:
        "Month-close brief, in-world: billing refreshes the dunning list before a single subscription reminder fires — every statement with NO settlement rows in the payments book. Probed on the storefront db: 6 of 28 statements carry zero payment rows, worth 15,217 in dollars — INV-2025-024 at 4,937 tops the list, then 3,562 and 2,794, and sitting fourth is the anomaly: #28 at 1,756, a statement marked 'paid' with no settlement rows anywhere. The query's 1,756 floor is deliberate — it keeps that paid-status lie on the list so the close can walk it line by line, alongside the three biggest open balances.",
      ask:
        "Return statement number, status and dollar balance for every statement with no settlement rows and a balance of at least 1,756 dollars, biggest first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents / 100.0 AS dollars\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2}\n  AND i.amount_cents / 100.0 >= {3}\nORDER BY dollars DESC;",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 with no payment rows a NULL payload for the WHERE to catch. INNER JOIN deletes exactly those 6 rows — the dunning list would come back empty while looking perfectly correct.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-settlement probe",
          why: "p.id IS NULL selects the unmatched side: 6 statements, zero settlement rows — including #28, whose paid status makes the anti-join the only honest test. '= NULL' is never true (a comparison against NULL is UNKNOWN), so the whole list would silently vanish.",
        },
        {
          answer: "1756",
          kind: "number",
          label: "the anomaly-keeping floor",
          why: "The floor at 1,756 keeps the four biggest balances — 4,937, 3,562, 2,794 and #28's 1,756 — so the paid-status anomaly stays on the memo billing walks line by line. Lowering it to 1,295 admits two more open statements and buries the anomaly two rows deeper; raising it past 1,756 would amputate the lie this list exists to expose.",
        },
      ],
      distractors: ["INNER", "= NULL", "1295", "ASC"],
      walkthrough:
        "An anti-join with an anomaly in its pocket. The LEFT JOIN preserves every statement — 22 match payment rows, 6 arrive with a NULL payload — and WHERE p.id IS NULL keeps only the unmatched: the dunning list, 15,217 in dollars across 6 statements. The dollar read is amount_cents / 100.0 because the ledger stores INTEGER cents, the house money rule. The 1,756 floor is the anomaly pin: it keeps the three biggest open statements (4,937, 3,562, 2,794) plus #28 — marked 'paid' with zero settlement rows, a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Swap LEFT for INNER and the join deletes the very rows the memo exists to list; '= NULL' empties it with no error anywhere; 1,295 floods the memo with two more open statements. Billing reconciles the rest of the close against this list — 21 exact settlements, 1 partial — or nothing ships.",
    },
    {
      id: "cs-strava-4",
      tier: "medium",
      topic: "x2",
      universe: "growth",
      title: "The one-pass market census",
      brief:
        "Growth-board brief, in-world: the weekly review opens with the market census — uploads, processed-and-public uploads, discards and the discard share per market, all in one pass so the stage counts can never drift apart between dashboard tiles. Probed on the storefront db: EU carries 45 uploads (24 public, 3 discards, 6.7%), APAC 37 (21, 3, 8.1%), US 19 (5, 1, 5.3%); the 10-upload floor drops LATAM, whose 2 uploads and 0 discards would read as a fake-clean market on a slide. Every FILTER clause scans the same 103-row book, so the census reconciles to 103 by construction.",
      ask:
        "Return region, upload count, processed-and-public count, discard count and discard share per market with at least 10 uploads, busiest market first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS uploads,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS processed_public,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS discarded,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), 1) AS discard_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY uploads {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the public-stage literal",
          why: "Processed-and-public is status 'delivered' — 24 in EU, 21 in APAC. 'shipped' recounts the 30 processing uploads as public and inflates every market's live-feed story exactly where the ingest pipeline has not finished.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the census floor",
          why: "The 10-upload floor keeps EU (45), APAC (37) and the US (19) and drops LATAM's 2 — a market whose 0% discard share is two uploads away from noise. The floor judges a per-market aggregate, which is why it lives in HAVING, not WHERE.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The review reads biggest market first: EU 45, APAC 37, US 19. ASC would open on the US and bury the concentration story — same numbers, opposite narrative.",
        },
      ],
      distractors: ["'shipped'", "WHERE", "ASC", "2"],
      walkthrough:
        "One scan, four lenses. The join attaches each upload to its athlete's market (all 103 match), GROUP BY c.region folds them into four buckets, and the FILTER clauses count delivered, cancelled and the percentage in the same pass — 45/24/3/6.7 for EU, 37/21/3/8.1 for APAC, 19/5/1/5.3 for the US, all from one read of the table. The discard share is 100.0 × discards ÷ uploads, the multiplier BEFORE the division so integer arithmetic cannot truncate 6.7 to 6. HAVING COUNT(*) >= 10 drops LATAM: 2 uploads, 0 discards — a 0% share that is arithmetic, not safety, and the review says so out loud instead of printing a fake-clean market. 'shipped' in the public-stage literal rebrands the 30 processing uploads as live; WHERE in the floor slot errors because aggregates do not exist before groups form; ASC buries the leaders; 2 re-admits LATAM. One pass, one denominator, every stage count reconciling to 103 by construction.",
    },
    {
      id: "cs-strava-5",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The upload leaderboard tie",
      brief:
        "Growth-board brief, in-world: the engagement leaderboard ranks athletes by uploads, and the tie policy is under review — four athletes sit at 4 uploads each and the product team wants to see exactly how the rungs land before they ship a change. Probed on the storefront db: the ladder reads 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), 5 (Chloe Dubois), then the four-way tie at 4 — Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez. RANK gives the tie shared rungs at 6, and the next distinct count (3) would land on rank 10 — the gap behavior segment KOM boards print, which is precisely the policy being argued.",
      ask:
        "Return athlete, upload count and RANK rung for every athlete with at least 4 uploads, shared rungs first and ties broken alphabetically by name.",
      template:
        "WITH uploads AS (\n  SELECT c.name AS athlete,\n         COUNT(*) AS activities,\n         RANK() OVER (ORDER BY COUNT(*) {1}) AS board_rank\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT athlete, activities, board_rank\nFROM uploads\nWHERE activities >= {2}\nORDER BY board_rank, {3};",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first window order",
          why: "RANK() OVER (ORDER BY COUNT(*) DESC) crowns the biggest upload count rank 1 — Alice's 24. ASC hands rank 1 to the two 1-upload athletes and the board reads upside down while every number stays technically correct.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the tie-visible gate",
          why: "The gate at 4 keeps all nine athletes the policy debate is about — five singles plus the four-way tie, whose shared rung 6 prints four times. A floor of 5 amputates the tie and the meeting loses its subject; the figure 4 appears in the output as both activities and board_rank.",
        },
        {
          answer: "athlete",
          kind: "keyword",
          label: "the named tie-breaker",
          why: "Ordering the tie block by name is a stated policy — Isabella, Keiko, Noah, Pedro — instead of engine luck. The tie-breaker must be a column the outer query can see; created_at exists only in the CTE's source tables, not its output, so the reference errors.",
        },
      ],
      distractors: ["ASC", "5", "created_at", "DESC"],
      walkthrough:
        "A leaderboard where the tie is the point. The CTE folds 103 uploads to 16 athletes, counts each, and RANK() OVER (ORDER BY COUNT(*) DESC) stamps shared rungs with gaps: 24 → 1, 17 → 2, 14 → 3, 13 → 4, 5 → 5, then the four-way tie at 4 consuming rank 6 four times — Isabella, Keiko, Noah and Pedro share it, ordered by the named tie-breaker. The outer query filters activities >= 4 so the whole contested block stays visible. Under RANK semantics the next distinct count (3) would land on rank 10, implying five phantom rungs that do not exist — exactly the gap behavior segment boards print, and the reason DENSE_RANK (tie reads 4, 4, 4, 4 with the next tier 5th in sequence) and ROW_NUMBER (arbitrary split of four peers) answer a different policy. ASC inverts the ladder; a 5 gate deletes the tie; ordering by an out-of-scope column errors on sight. Nine rows, ranks 1 through 6 with the tie intact — the policy argument starts from the real board.",
    },
    {
      id: "cs-strava-6",
      tier: "easy",
      topic: "s7",
      universe: "fraud",
      title: "The trust grid",
      brief:
        "Trust & safety brief, in-world: before any leaderboard trust call, the team reads the status×market grid — one row per market, four stage columns, so a market's whole discard posture sits on one line. Probed on the storefront db: EU runs 24 public / 12 processing / 6 queued / 3 discarded (45 uploads), APAC 21 / 8 / 5 / 3 (37), US 5 / 10 / 3 / 1 (19), LATAM 2 / 0 / 0 / 0 (2). The zeros are the point — LATAM shows no discards because it has uploads and no cancels, not because the cell vanished. Every row's four columns sum to its market's upload count, so the grid reconciles to 103 by construction.",
      ask:
        "Return one row per market with the four stage counts — processed-and-public, processing, queued, discarded — busiest public stage first.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS processed_public,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 {2} 0 END) AS processing,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS queued,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS discarded\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY processed_public {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the public-stage literal",
          why: "The first column counts status 'delivered' — 24, 21, 5, 2 across the four markets. 'shipped' would recount the 30 processing uploads as public and reorder the grid around a stage that is not live on the feed.",
        },
        {
          answer: "ELSE",
          kind: "keyword",
          label: "the zero branch",
          why: "ELSE 0 turns 'no such rows' into an honest zero — LATAM's processing and queued cells read 0 because the arms are exhaustive. Dropping the ELSE leaves the arms returning NULL on no-match, and the grid prints NULLs where the truth is zero.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The trust read opens on the biggest public book: EU 24, APAC 21, US 5, LATAM 2. ASC would lead with LATAM's 2 and frame the smallest market as the headline.",
        },
      ],
      distractors: ["'shipped'", "WHEN", "COUNT", "ASC"],
      walkthrough:
        "A pivot that refuses to lie. Each stage column is a conditional SUM: CASE WHEN status = <stage> THEN 1 ELSE 0 END folds every upload into exactly one arm, and the four columns sum to the market's upload count — EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2+0+0+0 = 2 — reconciling to 103 by construction. The ELSE 0 branch is what makes LATAM's zeros real zeros instead of NULLs: an exhaustive arm set is the difference between 'no discards' and 'no data'. GROUP BY c.region alone with a status column would enumerate only observed pairs and silently delete the LATAM-cancelled combination — the grid would lie by omission, which is the exact failure a trust review cannot afford. 'shipped' in the public literal rebrands processing as live; WHEN or COUNT in the ELSE slot breaks the CASE grammar; ASC flips the story to start on LATAM. One scan, four columns, zeros where zeros belong.",
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
    { slug: "funnel-step-conversion", why: "Stage-to-stage conversion with honest denominators — booked, stamped, public. The funnel discipline Strava's growth screens open with, before any per-market cut." },
    { slug: "fifteen-days-of-learning", why: "Athletes active on 15+ distinct days inside their first month — the habit-formation gate that predicts subscription conversion. DISTINCT-day counting inside a bounded window." },
    { slug: "popularity-percentage", why: "The share of athletes who follow the average athlete — a ratio with a stated denominator and the 100.0 discipline. Two-grain census math in percentage clothing." },
    { slug: "find-the-team-size", why: "Club size attached to every member row via COUNT() OVER (PARTITION BY …) — window enrichment that never collapses the roster. The shape behind every club-level load read." },
    { slug: "top-percentile-fraud", why: "The implausible-effort screen — the top percentile of the effort distribution feeds trust & safety's cheating queue. Percentile cut plus anti-context, exactly how segment boards stay credible." },
    { slug: "friend-requests-ii-who-has-the-most-friends", why: "Most-followed athletes — the social-graph leaderboard. Same rank-window discipline as the upload ladder, different edge table, same tie policy argument." },
    { slug: "compute-the-rank-as-a-percentage", why: "Rank expressed as a percent of the field — the leaderboard line athletes screenshot. PERCENT_RANK-style windows over tie-heavy data." },
    { slug: "create-a-session-bar-chart", why: "Bucket activities into labeled length bars with CASE — the exhaustive-arms pivot the training page renders as a histogram. Arms that miss a bucket print holes." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest activity touching each gear SKU — the recency audit the partnerships team runs before renewing a placement. Argmax per group, window or join-back." },
    { slug: "average-selling-price", why: "ASP per SKU from line records — revenue ÷ units with the fan-out guarded. Every gear-partnership pricing call starts from this fold." },
    { slug: "new-users-daily-count", why: "First-upload dates by day — the activation curve. Date-bucketed counting is the warm-up half of every cohort screen here." },
    { slug: "rolling-7d-actives", why: "The rolling-weekly actives curve — the engagement pulse growth pins above every other chart. A date spine plus a window, built from scratch on demand in screens." },
    { slug: "second-most-recent-activity", why: "Each athlete's second-newest upload via a ranked window — the 'prior workout' read behind training-load comparisons, and the classic LIMIT-OFFSET trap on ties." },
    { slug: "week-over-week-churn", why: "WoW churn on the upload spine — LAG the weekly actives, guard the first row's NULL, state the denominator. The retention read this team ships every Monday." },
    { slug: "consecutive-numbers", why: "At-least-three-in-a-row detection on a numeric column — the seed of every streak query, from kudos days to threshold-beating weeks." },
    { slug: "ar-aging-schedule", why: "AR aging buckets from issued_on against the close date — cents-safe CASE banding that turns the dunning list into a calendar." },
  ],
};
