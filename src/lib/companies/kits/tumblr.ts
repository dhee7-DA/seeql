// Tumblr — Wave-10 (Task 100), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Fandom-era microblog SQL: the storefront db read as a reblog-graph + monetization sandbox.
// customers = users (free + subscribed; region = market), orders = engagement/billing cycles as the
// platform books them (delivered = active/paid cycle 52, shipped = in-flight with shipped_at as the
// open stamp 30, pending = queued 14, cancelled = churned/abandoned 7), order_items = engagement/
// billing line records (quantity = note units, unit_price = per-unit feature bucket), products =
// creator features/subscriptions/ad SKUs (Post+ tiers, ad-free passes, Blaze boosts), suppliers =
// creator/brand partners, invoices = advertiser or subscription billing statements, payments =
// payment rails (card/wire — finance tables store INTEGER cents, dollar read = amount_cents / 100.0;
// orders.total and order_items.unit_price are REAL dollars), expenses = platform opex,
// ledger_entries = GL. Pool provenance: company-pools.md carries NO Tumblr section — 0 tagged rows —
// so all 10 topic slug sets and all 32 problems are theme-curated from the theme menu's sql rows
// (no w*/d*/f* rows) and say so. Case briefs quote probed figures from scripts/company-facts.md
// (probed 2026-10-12) plus this kit's own probe cells (the five split-rail leg pairs and the
// 45-cycle / 24,507.66 above-own-baseline fold); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const tumblrKit: CompanyKit = {
  id: "tumblr",
  domainId: "media",
  name: "Tumblr",
  tagline: "The reblog graph: fandom depth, Post+ and the ad load",
  accent: "text-blue-300",

  brief: [
    "**Tumblr** is the fandom-era microblog — the platform where a post is not a broadcast but a thread starter: reblog chains accrete commentary as they travel, notes pile up per post, and communities form around tags rather than follow graphs. Monetization runs on three rails at once: {sky:Post+} creator subscriptions, ad-free browsing passes, and an ad platform whose load users feel in the feed — which makes every growth number a fight between engagement depth and the ad break. This kit maps the storefront db onto that world: the 16 customers rows are users (free and subscribed), the 103 orders are engagement/billing cycles worth **34,833.28**, and the 251 order_items rows are note lines — reblog/like/reply batches where quantity = units and unit_price = the per-unit feature bucket. The status map is fixed: delivered = {emerald:active/paid cycle} (52, 50.5%), shipped = in-flight with shipped_at as the open stamp (30, 29.1%), pending = queued (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org runs three loops off the same spine. Engagement telemetry owns the reblog graph: a cycle books at created_at, and `shipped_at` is stamped the day it actually goes live — **82 of 103 cycles** carry the stamp, averaging **2.98 days** with a 2–4 day spread, and the 14 pending rows are the queue, a population definition, not a cleanup job. Creator partnerships own the Post+ stables and the ad-SKU shelf — six partners carry the 16-SKU catalog, and the top partner alone pulls **32%** of the book. Money sits one layer down: 28 advertiser/subscription statements and 27 settlement legs in INTEGER cents, where the dollar read is amount_cents / 100.0 — card rails moved 37,364.00 across 16 legs, wire rails 32,248.00 across 11, and five statements settle across both rails at once. Concentration is the third story: **63.5%** of the book sits with users whose lifetime spend crosses 3,000 (71.2% above 2,000) — one superfan lapsing moves a quarter.",
    "Interview screens are census-then-denominator, with a fandom twist. A typical loop opens with a **two-grain market census** — EU runs 45 cycles from just 8 users (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a queued cycle count in your base?'*), then into the fandom ladder where four users sit tied at 4 cycles each and rank semantics become a community-policy call. Late rounds walk the {sky:14-month cycle spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or dip into the statement book where a paid-status statement with zero settlement legs (#28, 1,756.00) is waiting to be caught. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Tumblr section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: cycle funnels, two-grain censuses, tie-heavy fandom ladders, note-line depth folds, CASE ad-load bands, the month spine and the cents-safe statement book. Do the topics in order, then run the **six case studies** on the live storefront db: the {emerald:split-rail statement sweep} finance runs before every ad close, the {sky:fandom baseline board} growth reads to separate superfans from the platform mean, the cycle-open spine walk with its LAG baseline, the rail-totals stack the close packet ships with, the never-collected sweep billing sends from, and the go-live speed census the syndication pod watches. This expanded kit is built for spaced practice rather than one sitting — run each case, then re-run it a week later from a blank editor; *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every statement fold foot to the 28-statement book.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the chain refresh. An engagement analyst opens the fandom dashboard before standup: did overnight reblog chains land, is any user's cycle stuck between created_at and its `shipped_at` stamp, does the one-pass status census reconcile — 52 active/paid + 30 in-flight + 14 queued + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If cycle-open latency drifts off the **2.98-day** norm — or the queue climbs past its 14-cycle steady state — the syndication pipeline gets pulled before the ad-load read ships.",
    "**11:30 —** Midday is the depth read. Growth wants the fandom ladder with the four-way tie at 4 handled honestly — shared rungs, named policy, *because fandom leaderboards train users to expect exactly that*; partnerships wants the Post+ stable re-cut (the top partner still carries **32%** of the book); a market lead wants cycles beside users (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the leaderboard-policy argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before billing sends a single ad reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; the rails mix reads card 16 legs / 37,364.00 against wire 11 / 32,248.00 for the finance note. Then the anomaly walk, line by line: a void-but-debited statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Active/paid cycle share", what: "Delivered ÷ ALL cycles booked: 52 of 103 (50.5%). The top-of-feed number growth reads every Monday — the only status where the cycle is live and monetizable, whether that is a Post+ month or an ad-free pass." },
    { name: "Cycle-open latency", what: "Booking to go-live (created_at → shipped_at) over stamped cycles only: 82 of 103, averaging 2.98 days with a 2–4 day spread. The population definition ships with the number — queued cycles have no latency yet." },
    { name: "Fandom ladder", what: "Per-user cycle ladder: 24, 17, 14, 13, 5, then a four-way tie at 4. The top user alone runs 24 cycles worth 7,262.35 — the argmax-with-ties shape behind every superfan and winback cut." },
    { name: "Note-line depth", what: "Note lines ÷ cycles: 251 order_items across 103 cycles (2.44 per cycle), max line quantity 3, 498 note units total. Reblog depth shows up here first — each line carries units × the per-unit feature bucket." },
    { name: "Market intensity", what: "Cycles per user by market: EU 45-from-8 (5.6) versus US 19-from-2 (9.5). Concentration rides alongside: 63.5% of the book sits with users spending 3,000-plus lifetime (71.2% above 2,000)." },
    { name: "Churn & abandon map", what: "Cancelled share of booked cycles: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 — and by month: 2 land in July and 2 in November. The churn cohort map that drives winback and the ad-free pitch." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00. The AR anti-join the billing pod refreshes every close." },
    { name: "Rails & settlement", what: "Card carries 16 legs / 37,364.00 against wire's 11 / 32,248.00, and 5 statements settle across BOTH rails; settled statements average 28.4 days (fastest 13, slowest 84) against flat 30-day terms. The rail mix that decides which reminder fires first." },
  ],

  topics: [
    {
      name: "The cycle funnel & conditional counts",
      why: "Every Tumblr growth screen opens with the funnel: cycles booked, active/paid, stamped in-flight. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight cycle 'active/paid' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Cycles and users are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 users while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining users to cycles",
      why: "Users carry market and signup date; cycles inherit them through joins, and the join type decides who survives. A cycle without a user is corruption; a user without cycles is a lapsed lurker — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Fandom ladders & rank policy",
      why: "Fandom leaderboards are rank-window reporting where ties are guaranteed — four users sit at 4 cycles each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a community policy, not syntax. Tumblr ships tier badges; encoding the tie rule is a product decision you will be asked to write.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary-ii"],
    },
    {
      name: "Note-line depth & co-engagement",
      why: "Engagement depth lives at the line grain: 251 note lines across 103 cycles, and the co-engagement read — which feature SKUs get engaged inside the same cycle — is a self-join over lines sharing an order. The three-grain trap (cycles versus users versus lines) is exactly what the 2.44-lines-per-cycle ratio exists to teach.",
      slugs: ["number-of-comments-per-post", "most-frequently-ordered-product-per-customer", "students-and-examinations", "find-trending-hashtags"],
    },
    {
      name: "CASE banding for tiers & ad load",
      why: "Post+ tiers, ad-free passes and Blaze boost bands are CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the ad-load forecast, and a reordered WHEN quietly re-bands every user.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "ad-free-sessions"],
    },
    {
      name: "Month spines & calendar buckets",
      why: "The 14-month cycle spine (2024-01 to 2025-02) is the trend call's home turf — SUBSTR(created_at, 1, 7) over buckets carrying 6–9 cycles each. '%m' alone merges January 2024 with January 2025; half-open date windows keep the last night's cycles; the calendar is where heatmap screens go wrong.",
      slugs: ["convert-date-format", "the-latest-login-in-2020", "rising-temperature", "cohort-retention-matrix", "week-over-week-churn"],
    },
    {
      name: "Windows over the reblog stream",
      why: "Engagement is window math: month-over-month cycle deltas with LAG, running book totals per user, rolling averages over posting weeks. The first row's LAG is NULL by definition — the baseline, never a zero — and frame semantics decide whether a cumulative walk steps row by row or absorbs tied timestamps in one jump.",
      slugs: ["biggest-window-between-events", "running-total-for-different-genders", "rolling-average-steps", "find-bursty-behavior"],
    },
    {
      name: "Set ops & the grand-total stack",
      why: "The month-close packet stacks per-month rows under a labelled TOTAL row — UNION ALL, never UNION, because the dedup can silently eat a month that happens to match. Board packets that stack populations (this quarter beside last, paid beside churned) live and die on the ALL.",
      slugs: ["team-scores-in-football-tournament", "league-statistics", "the-airport-with-the-most-flights"],
    },
    {
      name: "Statement & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the fandom world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning calendar.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ads-performance", "ar-aging-schedule"],
    },
  ],

  theory: [
    {
      id: "tumblr-t1",
      q: "Your user report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A monetization report joins cycles to users: a cycle with no user row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A lapsed-lurker report must be LEFT from users: the users with no cycles ARE the answer, arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload user row — the LEFT quietly became an INNER and the lurker cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-cycling users — all 16 users appear in the cycle table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table silently returns nothing the moment a NULL sneaks in. Say the survival rule out loud before you pick the join type; the panel is grading the habit, not the keyword.",
      tag: "joins",
    },
    {
      id: "tumblr-t2",
      q: "Four users tie at 4 cycles on the fandom ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which user's badge tier gets promoted. Tumblr communities notice: a leaderboard that hands one of four tied users a unique crown reads as a bug in the tag page. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer users (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment so the next analyst inherits the rule, not the mystery.",
      tag: "windows",
    },
    {
      id: "tumblr-t3",
      q: "The census shows 103 cycles and 16 users; EU shows 45 cycles and 8 users. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per cycle, so a user with 24 cycles contributes 24. COUNT(DISTINCT customer_id) folds those rows back to users — EU's 45 cycles collapse to 8 logos. Neither is wrong: cycles measure load and monetization momentum, users measure installed base and coverage. The ratio — 5.6 cycles per user in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the note lines and COUNT(*) silently counts note lines, not cycles — 251 of them, 2.44 per cycle. On a reblog platform that confusion is not academic: note lines are where engagement depth actually lives, and counting them as billing events misstates both the funnel and the ad-load story. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "tumblr-t4",
      q: "shipped_at is NULL until a cycle goes live. What is your policy for the cycle-open latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only live cycles have a latency, so the report measures booking-to-stamp for the 82 of 103 cycles that carry the mark — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 churned rows, which is a feature, not a bug: those cycles have no live window by definition. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day activations for syndication that never ran, and on an ad-loaded feed it makes the queue look like instant launches. The 14 pending rows are the queue, a population the dashboard exists to watch; folding them into an average is how a pipeline problem hides for a quarter. A report whose WHERE clause is doing definitional work without saying so is exactly what a Tumblr reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "tumblr-t5",
      q: "The growth review wants active/paid value per market for markets carrying at least ten cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, queued and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to cycles versus to dollars. On this db the ten-cycle floor keeps EU (45), APAC (37) and the US (19) and drops only LATAM's 2 — a survivor set the review should name out loud before the query runs, because a floor that quietly deletes the one market your deck discusses is a floor you did not think about. The strong answer places every filter by asking: is this a fact about one cycle, or about a market?",
      tag: "pipeline",
    },
    {
      id: "tumblr-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce a mean — 338.19 on this db. But the correlated cousin is where Tumblr screens live: compare each cycle to ITS user's average (AVG over o2 WHERE o2.customer_id = o.customer_id) and the subquery re-runs per outer row, answering 'who beats their own baseline' — a superfan read, not a platform read. The two boards differ materially: the platform-mean cut and the own-baseline cut disagree on users, counts and dollars, and the interviewer wants you to say which question each one answers. Filter the staging table to a user with one cycle and the inner fold still returns a row — but a user with zero cycles makes it empty, the comparison goes UNKNOWN, and that user silently drops off the board. The strong candidate states the inner fold's population and its empty-case behavior unprompted.",
      tag: "subqueries",
    },
    {
      id: "tumblr-t7",
      q: "The trend report buckets cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's cycles, and month-end is exactly when fandom spikes land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Then the shape of the story the spine tells: the book opens at 3,731.97 in January 2024, troughs at 1,193.86 in July, and no month carries fewer than 6 cycles — a floor your WHERE filters should never breach silently. Date discipline is trend discipline: the spine, the window and the edge row are where these reports go wrong.",
      tag: "dates",
    },
    {
      id: "tumblr-t8",
      q: "Finance says an advertiser statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. Check the partial too: statement #25 settled 4,000.00 of its 6,148.00, and five statements split across card and wire legs — coverage is a census (21 exact / 1 partial / 6 none), not a vibe. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "tumblr-t9",
      q: "A syndication retry duplicated some reblog chain rows. Walk me through the keep-latest dedupe you write — and the tie-breaker question you must answer before it is safe.",
      a: "ROW_NUMBER() OVER (PARTITION BY chain_key ORDER BY updated_at DESC, id DESC) AS rn, keep rn = 1. Two decisions make it safe: what the natural key is (the ingested id, or the chain's business key if ids collide across retries) and the tie-breaker — two copies sharing an updated_at make 'freshest' undefined unless id DESC settles it. Detect first with GROUP BY the key HAVING COUNT(*) > 1 so the repair ships with a receipt. On this core db every cycle row is unique; the shape exists for the staging tables where retries actually land, and the same three lines guard the note-line double-counts that would silently double a creator's payout.",
      tag: "windows",
    },
    {
      id: "tumblr-t10",
      q: "Cycles, users, note lines — the census counts three things over the same two tables. Which COUNT do you reach for in each, and what does each number mean to the community team?",
      a: "COUNT(*) at the cycle grain reads 103 booked cycles — load and monetization momentum. COUNT(DISTINCT customer_id) folds the repeats back to users — 16 platform-wide, 8 in EU against its 45 cycles — which is coverage. Join order_items and COUNT(*) silently becomes 251 note lines, a third grain: engagement depth. The ratios only mean something once the grains are named: 45/8 = 5.6 cycles per user is EU's intensity signal, 251/103 = 2.44 note lines per cycle is the depth read the tag pages are judged by. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "tumblr-t11",
      q: "The winback list needs users with no churned cycles. IN, NOT IN, EXISTS, NOT EXISTS — which is safe here, and what is the trap?",
      a: "NOT EXISTS is the safe shape: correlated, NULL-immune, and it reads as the sentence the lifecycle team asked for. NOT IN over a subquery that returns even one NULL customer_id turns every comparison UNKNOWN and the winback list silently empties — a report that parses fine and mails nobody. IN is fine for positive existence tests. On this clean core db every orders.customer_id is populated, so NOT IN works today — staging tables are where it detonates. And the core db's own anti-join returns a confident zero never-cycling users (all 16 users appear in the cycle table somewhere); proving that zero, then choosing the NULL-safe shape for staging, is the complete answer.",
      tag: "subqueries",
    },
    {
      id: "tumblr-t12",
      q: "Cycle-open latency: how do you compute the average, state the population, and build the day buckets — and why do the buckets reconcile to the population?",
      a: "Population first: only the 82 of 103 cycles with a shipped_at stamp have a latency — the 14 queued cycles have no go-live yet, and that is a definition, not missing data. AVG(julianday(shipped_at) - julianday(created_at)) over that population reads 2.98 days. Buckets: CAST(julianday(shipped_at) - julianday(created_at) AS INT) — on this db every latency is an exact whole-day 2, 3 or 4, so the buckets read 27 / 30 / 25 and foot to 82 by construction. State the population in the report title, and never COALESCE a NULL latency to zero — that invents same-day activations for syndication that never ran.",
      tag: "dates",
    },
    {
      id: "tumblr-t13",
      q: "Billing wants the never-collected statement numbers that are NOT falsely marked paid. Which set operator, and what does each wrong one return?",
      a: "EXCEPT: the left set is the 6 never-collected numbers, the right set is the paid-status numbers, and EXCEPT keeps left rows that never appear on the right — the 5 honestly-open numbers (INV-2025-024/026/027, INV-2024-021/018). The paid-status #28 (1,756.00 with zero legs) drops out because it IS in the right set — and it is exactly the anomaly the close chases on its own row-level walk. INTERSECT returns #28 alone (the in-both set), UNION merges everything back, and both answer a different question. Set operators dedupe whole rows by default — harmless here because statement numbers are unique, and worth saying out loud.",
      tag: "setops",
    },
    {
      id: "tumblr-t14",
      q: "Post text arrives with stray whitespace and 500-character chains from a partner feed. What breaks, and how do you normalize text in SQL without breaking the key you group on?",
      a: "Length and whitespace break segmentation: a post that is all spaces is not empty by LENGTH's lights (it counts the spaces), and padded titles split one tag into two buckets the tag page reports separately. Normalize at the edge, once: TRIM then UPPER (or LOWER — pick one and write it down) into a staging column before any join or GROUP BY. For chain folds, GROUP_CONCAT decides the separator — the default comma breaks the moment a post title contains one — and pre-3.44 the fold's order is not guaranteed, so order through a subquery when the display matters. The invalid-tweets-style checks (LENGTH guards, SUBSTR slicing) are this platform's native string drill.",
      tag: "strings",
    },
    {
      id: "tumblr-t15",
      q: "Post+ tiers and Blaze boost bands are CASE-classified at fixed edges (100 / 250 / 500). Walk me through writing the CASE so the ad-load forecast cannot silently re-band.",
      a: "Ordered, exhaustive arms straight from the pricing page, most-specific first: WHEN total >= 500 THEN 'top', WHEN total >= 250 THEN 'boost', WHEN total >= 100 THEN 'plus', ELSE 'free' — on this db that reads 25 / 34 / 29 / 15 cycles and foots to 103. The ELSE is the exhaustiveness guarantee: a missing arm prints NULL bands and the forecast's counts stop footing without a single error. Every bound is half-open in intent — a 499.99 cycle is boost, a 500.00 cycle is top — and no cycle lands exactly on an edge on this book to mask an off-by-one. Reordering the arms is the quiet bug: first match wins, so the same bands in the wrong order re-band every user while the query stays green.",
      tag: "case",
    },
    {
      id: "tumblr-t16",
      q: "Annotate every cycle row with its market's book value, without collapsing rows. Why a window and not GROUP BY?",
      a: "SUM(total) OVER (PARTITION BY region) computes each market's fold once and stamps it on every row: all 45 EU cycles carry EU's 15,089.23 book, and the 103 rows survive. GROUP BY would return 4 rows and destroy the columns the memo needs beside the annotation — user, status, cycle id. The two shapes answer different asks: 'one row per market' is a GROUP BY question; 'every row, annotated' is a window question. The same shape powers follower-count enrichment and per-partner stable size on the Post+ side, and it costs one extra pass rather than a join.",
      tag: "windows",
    },
    {
      id: "tumblr-t17",
      q: "The co-engagement read wants feature pairs engaged inside the SAME cycle. Why is a self-join the tool, and what does the guard buy you?",
      a: "order_items meets itself on order_id — two note lines from the same cycle — so the pairing lives inside one table and no join to a pairs table is needed. Without an orientation guard every pair prints twice (A,B and B,A); o2.id > o1.id keeps exactly one row per unordered pair and the strict inequality rules out a line pairing with itself. Then the feature comparison (same product? different?) classifies the pairs the tag pages want. Swap the guard to >= and every line pairs with itself — a self-engagement the community team would read as a bot signal, which is exactly the false positive the guard exists to prevent.",
      tag: "joins",
    },
    {
      id: "tumblr-t18",
      q: "How do you detect duplicate note lines before they inflate a creator's payout fold — detect AND repair?",
      a: "Detect at the line's natural key: GROUP BY order_id, product_id HAVING COUNT(*) > 1 — the receipt finance can look at before anyone touches data. Repair with the window dedupe: ROW_NUMBER() OVER (PARTITION BY order_id, product_id ORDER BY id DESC), keep rn = 1 — never a bare DELETE, which removes both copies. The payout fold SUM(quantity * unit_price) is exactly where a duplicated line silently doubles creator money: the honest fold foots to 34,833.28 over 251 note lines, and every reconciliation starts by proving that population. Detection without a keep-newest tie-breaker is half the job; the other half is writing the tie-breaker down where the next analyst inherits the rule, not the mystery.",
      tag: "quality",
    },
    {
      id: "tumblr-t19",
      q: "The close packet wants per-rail rows plus a labelled TOTAL row in one result. How do you build it, and why that way?",
      a: "Two branches over the same table, stacked with UNION ALL: the detail branch GROUP BY method (card 16 legs / 37,364.00, wire 11 / 32,248.00), the TOTAL branch re-scanning the unfiltered table with a literal 'TOTAL' label — 27 legs, 69,612.00. UNION ALL, never UNION: the branches cannot collide here, and ALL states that argument instead of asking a dedupe pass to silently enforce it. The outer ORDER BY sorts the stack — the TOTAL row carries the biggest settled figure and floats to the top. Keep the arithmetic in INTEGER cents end to end and divide by 100.0 only at the display layer; the grand row is where a hundredfold inflation hides best.",
      tag: "aggregation",
    },
    {
      id: "tumblr-t20",
      q: "COALESCE, IFNULL, NULLIF — three NULL tools. Where does each earn its keep in the coverage fold and the share calculation?",
      a: "COALESCE(SUM(legs), 0) makes the settled column a total function: the 6 never-collected statements read 0 and classify into 'no payment' instead of drifting into 'partial' as NULLs. IFNULL is the two-argument twin — same job, shorter signature. NULLIF(x, 0) guards division: the platform-wide churn share divides by COUNT(*) which cannot be 0 here, but a per-market share on a staging slice can be — NULLIF turns the division-by-zero error into a NULL you then label honestly. The policy line interviewers wait for: COALESCE is for reporting defaults, never for laundering meaning — a NULL latency or NULL delta means something, and zeroing it erases the meaning.",
      tag: "nulls",
    },
    {
      id: "tumblr-t21",
      q: "The month-over-month cycle pulse needs monthly folds, then a window over the folds. Why stage in a CTE instead of one flat query?",
      a: "Because window output is not visible to WHERE or to sibling expressions in the same SELECT — the fold and the LAG cannot legally share a layer. The CTE computes the 14 monthly folds once (SUBSTR(created_at,1,7) month key, COUNT(*), SUM(total)); the outer SELECT layers LAG(cycles) OVER (ORDER BY month) and the delta over the folded grain. One fold, one window layer, and the pipeline reads top-down: FROM, fold, window, cut. Nested derived tables work too but read bottom-up — the wrong direction for a reviewer mid-close. On the spine the first row's LAG is NULL by definition; the CTE boundary is where you decide to label it 'baseline' rather than coalesce it.",
      tag: "pipeline",
    },
    {
      id: "tumblr-t22",
      q: "Growth wants a 3-month rolling booked-value average over the cycle spine. Write the frame, and explain ROWS versus RANGE here.",
      a: "AVG(booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — a three-row frame over the monthly fold. Spine months are unique, so ROWS and RANGE agree row-for-row here; they diverge when the ORDER BY key ties — RANGE absorbs all peers into one step (calendar-true on duplicate timestamps), ROWS counts rows and needs a tie-breaker to be deterministic. Say which you chose and why; that sentence is the interview. And narrate the edges: the first two rows have partial windows, so either label them honestly or accept that a '3-month average' over one row is just that row wearing a trend name.",
      tag: "windows",
    },
    {
      id: "tumblr-t23",
      q: "The cycle mean is 338.19; the mean of per-user averages is 370.15. Which belongs on the slide, and what is the trap?",
      a: "They answer different questions, so the slide names the grain. 338.19 is the cycle-grain mean — 34,833.28 over 103 cycles — where superfans' 24 cycles weigh 24 times, dragging the mean toward the heavy side. 370.15 is the user-grain mean — the average of the 16 per-user averages — where every user weighs once, a community-experience read. The trap is averaging averages silently: (SUM of user means)/16 is NOT SUM(total)/SUM(n) — it is a different statistic that happens to be computable. Pick by question: monetization momentum and funnel reads take the cycle grain; winback and experience reads take the user grain — and the slide says which.",
      tag: "aggregation",
    },
    {
      id: "tumblr-t24",
      q: "A staging month with zero cycles drops out of the GROUP BY spine and the trend lies by omission. How do you guarantee a continuous 14-month spine?",
      a: "A recursive CTE date spine: seed the minimum month, add one month per iteration until the maximum, LEFT JOIN the folds onto the spine, COALESCE the counts and sums to 0. On this db every spine month carries 6 to 9 cycles, so the omission never shows — but filter to one status or slice to a staging table and a zero-month vanishes, and the chart invents a smooth decline where the truth is a gap. Zero-fill is the honesty rule for every trend the dashboard publishes: the same rule fills the funnel's empty stages and the ad-load bands' empty tiers. The audit question that catches it: do the row counts foot, and are the month buckets consecutive?",
      tag: "dates",
    },
  ],

  mcqs: [
    {
      id: "tumblr-mcq-1",
      prompt: "A cycle row's status reads 'shipped'. In this kit's Tumblr stage map, what happened?",
      choices: ["In-flight — stamped live via shipped_at, not yet an active/paid cycle", "Active/paid — the cycle completed and monetized", "Churned — abandoned mid-cycle", "Queued — still waiting to go live"],
      answer: 0,
      why: "The stage map is fixed: shipped = in-flight with shipped_at as the open stamp — 30 of 103 cycles. The cycle is running but has not completed; only 'delivered' (52) is an active/paid cycle.",
      notes: [
        { choice: 1, why: "Active/paid is 'delivered' — 52 cycles. Calling the 30 in-flight cycles paid inflates the monetized core before a single cycle completes." },
        { choice: 3, why: "Queued is 'pending' — 14 cycles with no shipped_at yet. Pending is not in-flight and not churned; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-2",
      prompt: "Cycle-open rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 stamped, 14 queued and 7 churned of 103 booked.",
      choices: ["Stamped + churned only (82/89 = 92.1%)", "All cycles booked (82/103 = 79.6%)", "Delivered cycles only (52/82)", "Distinct users (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL cycles booked — the 14 queued stay in the denominator because 'not yet live' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 queued inflates the rate to 92.1% by deleting the population still in the pipeline — the rows the gauge exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is active/paid, shipped_at is the go-live stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-3",
      prompt: "EU carries 45 cycles from 8 users. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to users (8). The gap between them — 5.6 cycles per user — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has a user. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not users — a third grain nobody asked for. The census is cycles AND users." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-4",
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
      id: "tumblr-mcq-5",
      prompt: "Keep only markets carrying at least 10 cycles (the ladder reads EU 45, APAC 37, US 19, LATAM 2). Where does the threshold live, and who survives?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY — all four survive", "GROUP BY region HAVING COUNT(*) >= 10 — EU, APAC and US survive; LATAM drops", "WHERE cycles >= 10 on the raw table — all four survive", "HAVING before GROUP BY, wherever it fits — only EU survives"],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US (19) clear the bar; LATAM's 2 cycles drop.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 3, why: "HAVING cannot precede GROUP BY — the fold does not exist yet. And the floor keeps three of four markets, not one; misreading the survivor set is how decks lose LATAM." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-6",
      prompt: "The fandom ladder runs 24, 17, 14, 13, 5 cycles, then FOUR users tied at 4. Under RANK, what rank do the two 3-cycle users carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-cycle users share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The community page's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The queued cycles double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 cycles.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-8",
      prompt: "A staging-table lapsed-user list uses user_id NOT IN (SELECT customer_id FROM orders WHERE created_at >= '2025-01-01') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the lapsed list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every cycle carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-9",
      prompt: "An ops board stacks active/paid cycles under churned cycles in one layout, built with UNION. A reviewer says one user's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same user, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same user, same counts, no market or branch label — collapse into one, and the board loses a user with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-10",
      prompt: "A colleague builds 'cycles above the user's own average' as WHERE total > (SELECT AVG(total) FROM orders) — the uncorrelated version. What is actually wrong?",
      choices: ["Nothing — a cycle above the platform average is always above its user's average too", "The scalar version compares every cycle to the platform mean of 338.19, not to its own user's baseline — a different question that promotes heavy users and erases per-user context", "The scalar version errors because AVG cannot run inside a comparison", "Wrapping it in a correlated subquery would return NULL for every row"],
      answer: 1,
      why: "The uncorrelated scalar computes one platform-wide mean — 338.19 on this db — and compares every cycle to it. The correlated form re-runs AVG per user's own cycles and answers 'who beats their own baseline': on this db the two boards disagree on 14 versus 16 users and on every per-user count. Same syntax shape, different question.",
      notes: [
        { choice: 0, why: "Below-average users with modest baselines have cycles that beat their own norm while sitting under 338.19 — the platform cut deletes exactly those fandom-depth wins the correlated board surfaces." },
        { choice: 3, why: "A correlated AVG over the user's own cycles returns a real number whenever the user has cycles; it goes NULL only when the inner fold is empty, and that empties just that user's rows, not the board." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-11",
      prompt: "The finance note quotes card 37,364.00 against wire 32,248.00. Which query produces the two-row rail fold from the legs table?",
      choices: ["SELECT method, COUNT(*) FROM payments GROUP BY method", "SELECT method, ROUND(SUM(amount_cents)/100.0, 2) FROM payments GROUP BY method", "SELECT method, SUM(amount_cents) FROM payments LIMIT 2", "SELECT DISTINCT method, amount_cents FROM payments"],
      answer: 1,
      why: "The rail fold is GROUP BY method with the cents-safe SUM(amount_cents)/100.0 — 16 legs for card, 11 for wire. COUNT prints leg counts (16/11) in a dollars column, DISTINCT smears rows, and the /100.0 keeps INTEGER cents from printing as 3,736,400.",
      notes: [
        { choice: 0, why: "COUNT(*) is the leg counter, not the settled total — the note's figures are money, and legs are 28 rows wearing a sum's name." },
        { choice: 2, why: "SUM without GROUP BY folds all 27 legs into one row; LIMIT 2 cannot manufacture the per-method split." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-12",
      prompt: "The cycle spine runs 2024-01 to 2025-02. A teammate buckets cycles with SUBSTR(created_at, 6, 2) AS month. What does the trend chart show?",
      choices: ["14 monthly buckets, one per spine month", "12 buckets — January 2024 and January 2025 merge into one '01' bucket", "13 buckets — February is dropped as malformed", "One bucket — SUBSTR returns NULL on TEXT timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) keeps only the month digits and amputates the year, so the 14 spine months fold into 12 — January 2024's 3,731.97 merges with January 2025's 1,669.50 and the fandom trend becomes fiction. The spine key is SUBSTR(created_at, 1, 7).",
      notes: [
        { choice: 0, why: "14 buckets require the 7-character key. The 6-character month key cannot distinguish the two Januaries it merges." },
        { choice: 2, why: "Nothing is malformed — SQLite groups '01' twice without complaint. The damage is silent mis-merging, not an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-13",
      prompt: "'Users who never cycled' runs customers LEFT JOIN orders ... WHERE o.id IS NULL and returns ZERO rows on the core db. The honest read?",
      choices: ["The query is broken — every user base has at least one lurker", "Zero is the answer: all 16 users carry at least one cycle — lapsed lurkers are proven absent, not assumed", "LEFT JOIN cannot return zero rows; switch to NOT IN", "The join key is wrong — customers.id never matches anything"],
      answer: 1,
      why: "On this db every one of the 16 users appears in orders at least once, so the anti-join legitimately returns nothing. A confident zero is a result — prove it (count both sides), and re-prove it on staging tables where one NULL customer_id can turn a real lurker cohort into a fake zero.",
      notes: [
        { choice: 0, why: "This is the reflex the screen tests: reading an empty result as a bug instead of auditing the population. Zero is the db's truth here." },
        { choice: 2, why: "LEFT JOIN + IS NULL returns zero rows whenever no unmatched rows exist. NOT IN would be the fragile version, not the fix." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-14",
      prompt: "The depth census joins orders to order_items, then reports COUNT(*) per market as 'cycles'. Platform-wide the true cycle count is 103. What does the query actually count?",
      choices: ["103 — the join is one-to-one", "251 — one row per note line; the join fans cycles out to lines", "16 — one row per user", "It errors — COUNT(*) is ambiguous after a join"],
      answer: 1,
      why: "order_items fans each cycle out to its note lines — 251 platform-wide, 2.44 per cycle — so COUNT(*) counts lines, not cycles. The line join is legitimate for SUM(quantity), the note-units fold; the census must count at the cycle grain and keep the line join out of it.",
      notes: [
        { choice: 0, why: "Joins multiply when the right side repeats — no clause collapses the fan-out back. The 103 becomes 251 the moment the join lands." },
        { choice: 2, why: "16 is the user grain, reached with COUNT(DISTINCT customer_id). Adding customers does not change what COUNT(*) counts after the line fan-out." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-15",
      prompt: "The concentration memo needs the single heaviest engagement cycle on the book. Which query returns it?",
      choices: ["SELECT MAX(COUNT(*)) FROM orders", "SELECT id, total FROM orders ORDER BY total DESC LIMIT 1", "SELECT id, total FROM orders WHERE total = AVG(total)", "SELECT customer_id FROM orders GROUP BY customer_id LIMIT 1"],
      answer: 1,
      why: "ORDER BY total DESC LIMIT 1 is the argmax shape — it lands on the 1,088.44 cycle. The alternatives aggregate without grouping, compare every row to the mean, or return an arbitrary group's first row — none is 'the biggest single cycle'.",
      notes: [
        { choice: 0, why: "MAX(COUNT(*)) nests an aggregate without GROUP BY — a syntax error, and even the intended form returns the max cycle COUNT (24), not the heaviest value." },
        { choice: 2, why: "total = AVG(total) is the exactly-average cohort (nobody hits 338.19 exactly) — a filter, not an argmax." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-16",
      prompt: "The badge system wants the top 3 users PER MARKET by cycle count, badges attached, ties sharing a rung. Which shape delivers it?",
      choices: ["GROUP BY region with LIMIT 3 inside the aggregate", "DENSE_RANK() OVER (PARTITION BY region ORDER BY COUNT(*) DESC) on the per-user fold, then filter rank <= 3 and join back for names", "ORDER BY cycles DESC LIMIT 3 over the whole table", "ROW_NUMBER() OVER (ORDER BY region) <= 12"],
      answer: 1,
      why: "Per-market top-N is a two-stage build: fold cycles per user, rank with a PARTITION BY region window (DENSE_RANK so ties share a rung — the community policy), filter rank <= 3, join back to customers for names. LIMIT inside a group is not SQL; a global LIMIT 3 returns three users total, not three per market.",
      notes: [
        { choice: 0, why: "LIMIT does not nest in GROUP BY — that syntax fails, and even the windowed version needs the fold staged before the rank." },
        { choice: 2, why: "A global top-3 returns three users from (probably) one market — the other three markets' badges silently vanish." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-17",
      prompt: "Growth wants Q1-2024 only (January through March). Which WHERE clause keeps March 31's late-night cycles?",
      choices: ["WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'", "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'", "WHERE SUBSTR(created_at,1,7) IN ('2024-01','2024-02')", "WHERE created_at LIKE '2024-0%'"],
      answer: 1,
      why: "Half-open intervals — >= Jan 1 AND < Apr 1 — keep every timestamp on March 31 including 23:59:59. BETWEEN '2024-03-31' compares against that day-prefix as midnight, so the last night's cycles sort after it and vanish — and month-end is exactly when fandom spikes land.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive at both ends, but '2024-03-31' means '2024-03-31 00:00:00' — the day itself is amputated from below." },
        { choice: 2, why: "Drops March entirely — a quarter is three months, and the missing month is invisible unless you reconcile counts to the platform census." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-18",
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
      id: "tumblr-mcq-19",
      prompt: "The fandom ladder under a HAVING COUNT(*) >= 4 floor keeps 24, 17, 14, 13, 5, then four users tied at 4. Under which function pair is the OUTPUT identical — and why?",
      choices: ["RANK and DENSE_RANK — the tie block sits at the bottom, so the gap RANK would leave never materializes", "RANK and ROW_NUMBER — no ties survive the floor", "DENSE_RANK and ROW_NUMBER — both are gapless by construction", "All three agree — ties never change ranks when ORDER BY is deterministic"],
      answer: 0,
      why: "RANK only skips when a LATER distinct value exists to receive the skipped rank. With the tie at the bottom, RANK prints 1,2,3,4,5,6,6,6,6 — identical to DENSE_RANK. Lower the floor to 3 and the two 3-cycle users expose the difference: RANK 10,10 versus DENSE_RANK 7,7.",
      notes: [
        { choice: 1, why: "Four users tie at 4 — the floor does not remove ties, it removes everything AFTER them, which is exactly why RANK and DENSE_RANK converge." },
        { choice: 2, why: "ROW_NUMBER splits the four-way tie arbitrarily as 6,7,8,9 — never identical when a tie exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-20",
      prompt: "Blaze boost bands classify at fixed edges: plus from 100, boost from 250, top from 500. A cycle books at 499.99. Which band — and what does the bug look like when it goes wrong?",
      choices: ["top — 499.99 rounds to 500 at display time", "boost — the edge is half-open in intent: 499.99 < 500, and the bug is an arm written as total > 250 instead of >= 250, which drops every 250.00 cycle into plus", "plus — anything under 500 is plus", "NULL — edge values have no band until the page is republished"],
      answer: 1,
      why: "The CASE runs most-specific first — >= 500 top, >= 250 boost, >= 100 plus, ELSE free — so 499.99 lands in boost. The classic bug is the wrong comparator on the LOWER edges: > 250 instead of >= 250 silently drops every cycle that books exactly on an edge into the band below, and no error ever fires.",
      notes: [
        { choice: 0, why: "Display rounding never feeds back into classification — the CASE sees the stored 499.99, and 499.99 >= 500 is false." },
        { choice: 2, why: "The arms are ordered: 499.99 fails the 500 arm but matches the 250 arm — plus only starts at 100." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-21",
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
      id: "tumblr-mcq-22",
      prompt: "The churned-user roster runs GROUP_CONCAT(c.name) per market over churned cycles. Alice Chen churns three times in EU. What does the EU roster cell show — and the one-token fix?",
      choices: ["'Alice Chen' once — GROUP_CONCAT dedups by default", "'Alice Chen,Alice Chen,Alice Chen' — GROUP_CONCAT concatenates every row; GROUP_CONCAT(DISTINCT c.name) is the fix", "NULL — three identical values collapse to NULL", "'Alice Chen' — SQLite errors on repeated values"],
      answer: 1,
      why: "GROUP_CONCAT folds every row's value with a comma separator — three churned cycles print the same name three times. The DISTINCT variant folds to the distinct churned users: EU just Alice Chen, APAC 'Maya Patel,Keiko Sato', US 'Emma Wilson' — 4 people from the 7 churned cycles.",
      notes: [
        { choice: 0, why: "Dedup is never the default — COUNT needs DISTINCT explicitly and so does GROUP_CONCAT. The repetition is data: she really churned three times." },
        { choice: 2, why: "Aggregates never collapse valid text to NULL; they skip NULL inputs, and 'Alice Chen' is not NULL." },
      ],
      difficulty: "easy",
    },
    {
      id: "tumblr-mcq-23",
      prompt: "'Users beating their own average' runs WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id). What is the cost profile, and the set-based fix at scale?",
      choices: ["One scan — the optimizer hoists the subquery", "The subquery re-runs per outer row; the fix folds per-user averages once in a CTE (or AVG() OVER (PARTITION BY customer_id)) and joins back", "Correlated subqueries are always faster — fewer rows touched", "The fix is DISTINCT — duplicates are the cost problem"],
      answer: 1,
      why: "The correlation re-executes the inner AVG once per outer cycle — 103 evaluations here, millions at fandom scale. A GROUP BY customer_id CTE computes each baseline once; AVG(total) OVER (PARTITION BY customer_id) attaches it without collapsing rows. Same answer, one pass — and the case study in this kit rebuilds both boards to show they disagree.",
      notes: [
        { choice: 0, why: "Only a decorrelating optimizer hoists — never assume it. Narrate the per-row re-run; that narration IS the interview answer." },
        { choice: 2, why: "Backwards: correlation trades repetition for expressiveness — clarity on small data, a scalability problem at note-stream scale." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-24",
      prompt: "A running book total runs SUM(total) OVER (ORDER BY created_at). Two cycles share the same created_at timestamp. What does the default frame do?",
      choices: ["ROWS semantics — each row accumulates separately in arbitrary tie order", "RANGE semantics — tied timestamps are peers: the frame absorbs all of them at once and both rows print the same running total through the tie", "The query errors — ORDER BY keys must be unique for window frames", "The later rowid wins; SQLite breaks ties silently by rowid"],
      answer: 1,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY peers as one step — both tied cycles print the total including each other. Switch to ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (plus an id tie-breaker) to accumulate row by row deterministically.",
      notes: [
        { choice: 0, why: "That is explicit-ROWS behavior, not the default. The silent surprise IS that the default is RANGE." },
        { choice: 3, why: "SQLite does not secretly re-order the frame; peers are peers until you change the frame or add a tie-breaker to the ORDER BY." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-25",
      prompt: "Billing wants the never-collected statement numbers EXCLUDING the one falsely marked paid. 6 statements never collected; #28 (1,756.00) carries status 'paid'. Which query returns the 5 honest opens?",
      choices: ["never_collected INTERSECT paid_status", "never_collected EXCEPT paid_status", "never_collected UNION paid_status", "never_collected WHERE number NOT LIKE 'INV-2025%'"],
      answer: 1,
      why: "EXCEPT keeps left-side rows absent from the right: 6 never-collected minus the paid-status #28 leaves the 5 open numbers (INV-2025-024/026/027, INV-2024-021/018). #28 is the anomaly the close chases separately, not a member of the honest list.",
      notes: [
        { choice: 0, why: "INTERSECT answers 'in both' — here that is precisely the lying statement you are excluding, returned alone." },
        { choice: 2, why: "UNION merges both sides — the anomaly walks back in, the opposite of the ask." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-26",
      prompt: "A syndication retry ingested some reblog-chain rows twice. Keep the freshest copy per chain. Which snippet is the keep-latest dedupe?",
      choices: ["SELECT DISTINCT chain_id FROM chains", "ROW_NUMBER() OVER (PARTITION BY chain_key ORDER BY updated_at DESC) rn ... WHERE rn = 1", "GROUP BY chain_id HAVING COUNT(*) > 1, then DELETE both copies", "RANK() OVER (ORDER BY updated_at DESC) = 1"],
      answer: 1,
      why: "ROW_NUMBER per natural key, newest first, keep rn = 1 — exactly one survivor per key and it is the freshest ingest. The GROUP BY form detects duplicates but deleting both copies destroys good data; RANK ranks globally, not per key; DISTINCT collapses columns and loses the row entirely.",
      notes: [
        { choice: 0, why: "DISTINCT deduplicates values, not copies-with-history — you lose every attribute of the row you were trying to keep." },
        { choice: 2, why: "Detection is half the job. A deletion with no keep-newest tie-breaker is the bug this drill exists to prevent." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-27",
      prompt: "On a one-market staging table, 'cycles above the platform average' returns zero rows — but the market has expensive cycles. First diagnosis?",
      choices: ["The market genuinely has no above-average cycles", "The staging fold is empty or filtered: the scalar subquery returned NULL, total > NULL is UNKNOWN, and every row silently dropped — audit the inner AVG's population first", "AVG over REAL totals is unsupported; CAST the column", "The WHERE clause needs DISTINCT to compare fairly"],
      answer: 1,
      why: "A scalar subquery over an empty or fully-filtered fold returns NULL, and any comparison with NULL is UNKNOWN — the report empties while parsing fine. On the full book the mean is 338.19 and the above-average cohort is real; on staging, state the inner population and its empty case before trusting an empty result.",
      notes: [
        { choice: 0, why: "Possible on a deliberately cheap slice — but 'empty because TRUE' is the conclusion you reach after auditing the subquery, never the assumption you start from." },
        { choice: 2, why: "AVG over REAL is bread-and-butter SQLite. The failure is three-valued logic, not typing." },
      ],
      difficulty: "hard",
    },
    {
      id: "tumblr-mcq-28",
      prompt: "The market memo wants every cycle row annotated with its market's book value, all 103 rows intact. Which shape delivers it?",
      choices: ["GROUP BY region with the annotation in SELECT", "SUM(total) OVER (PARTITION BY region) — the window folds and stamps without collapsing rows", "A CROSS JOIN of orders to regions, filtered later", "DISTINCT region, total — one row per market is fine"],
      answer: 1,
      why: "SUM(total) OVER (PARTITION BY region) computes each market's fold once and stamps every row: all 45 EU cycles carry EU's 15,089.23, and the 103 rows survive. GROUP BY answers 'one row per market' — a different ask that destroys the columns the memo needs.",
      notes: [
        { choice: 0, why: "GROUP BY delivers 4 rows — cycle id, user and status are gone, which is exactly the collapse the memo ruled out." },
        { choice: 2, why: "A cross join multiplies 103 x 4 and only becomes correct with an equality filter — which is a join wearing a disguise, at worse cost." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-29",
      prompt: "Cycle-open latency averages 2.98 days over the 82 stamped cycles; the bucket report reads 27 / 30 / 25 for days 2 / 3 / 4. Why do the buckets foot to 82 while no bucket shows a 2.98?",
      choices: ["CAST rounds each latency to the nearest day, so buckets and average disagree", "Every latency is an exact whole-day 2, 3 or 4, so the buckets count them cleanly — the 2.98 average lives BETWEEN buckets, a property of the population, not of any row", "The 21 unstamped cycles quietly fill a missing bucket", "The buckets are wrong — they should read 28 / 30 / 24 to average 2.98"],
      answer: 1,
      why: "julianday diffs on this db are whole days — 27 cycles go live at day 2, 30 at day 3, 25 at day 4 — so CAST truncates nothing and the buckets foot to 82 by construction. The 2.98 is a population-level average: no single cycle runs 2.98 days, and expecting it in a bucket is a grain confusion.",
      notes: [
        { choice: 0, why: "Nothing rounds — the diffs are already whole days. And even with fractional diffs, CAST truncates toward zero; it does not round." },
        { choice: 2, why: "Unstamped cycles have NULL latency and land in no bucket — COUNT over the bucket query proves the 82-row population, which is the audit." },
      ],
      difficulty: "medium",
    },
    {
      id: "tumblr-mcq-30",
      prompt: "The split-rail sweep self-joins payments on invoice_id to find two-leg statements. Why must the join carry p2.id > p1.id on top of the statement key?",
      choices: ["It speeds the join by pre-sorting legs", "Without it every pair prints twice in both orientations (A,B and B,A) — and the strict inequality also rules out a leg pairing with itself", "It filters NULL legs that would crash the fold", "It enforces that both legs use the same payment method"],
      answer: 1,
      why: "An unguarded self-join pairs every leg with every leg on the same statement: each split reports twice, and the self-pair reports once more with >=. The orientation guard p2.id > p1.id keeps exactly one row per unordered pair — the 5 split statements (1, 5, 12, 19, 22) this kit's sweep case rebuilds. Cross-rail versus same-rail is decided separately by comparing methods.",
      notes: [
        { choice: 0, why: "The guard changes the RESULT, not the plan — 5 rows instead of 10 (15 with >=). Performance is not the point; correctness is." },
        { choice: 3, why: "Method comparison is the fraud test in the WHERE clause. The orientation guard is pure pair-deduplication and knows nothing about rails." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-tumblr-1",
      tier: "easy",
      topic: "j6",
      universe: "fraud",
      title: "The split-rail statement sweep",
      brief:
        "Tumblr-flavored brief on the storefront db: before the ad-billing close ships, finance runs the duplicate-charge sweep — payment legs paired on the same advertiser statement, split or double-billed. Probed facts: 28 statements carry 27 settlement legs — card 16 legs / 37,364.00 against wire 11 / 32,248.00; exactly 5 statements settle on two legs (statements 1, 5, 12, 19, 22), and every one of those pairs is cross-rail, a card leg plus a wire leg. Each pair foots to its billed amount — 4,860.00 / 5,284.00 / 4,723.00 / 5,614.00 / 4,459.00 — and every split divides the bill exactly in half, so the finding is five legitimate splits and zero same-rail duplicates. The sweep reads biggest settled total first.",
      ask: "Return each two-leg statement with both rails, both leg amounts and the settled total in dollars to 2 decimals, biggest settled total first.",
      template:
        "SELECT p1.invoice_id AS statement_id,\n       p1.method AS rail_1,\n       ROUND(p1.amount_cents / {1}, 2) AS leg_1,\n       p2.method AS rail_2,\n       ROUND(p2.amount_cents / 100.0, 2) AS leg_2,\n       ROUND((p1.amount_cents + p2.amount_cents) / 100.0, 2) AS settled\nFROM payments p1\nJOIN payments p2 ON p2.invoice_id = {2} AND p2.id {3} p1.id\nWHERE p1.method {4} p2.method\nORDER BY settled {5};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Legs carry INTEGER cents; the dollar read is amount_cents / 100.0. Fill it wrong and leg_1 prints raw cents while leg_2 and settled stay in dollars — the row stops footing to its billed amount and the sweep is unreadable.",
        },
        {
          answer: "p1.invoice_id",
          kind: "keyword",
          label: "the statement key",
          why: "Legs attach to their own statement: p2.invoice_id = p1.invoice_id. p2.invoice_id there is a tautology — the join stops filtering statements and every cross-rail pair with a higher id (176 of them) floods the sweep.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the orientation guard",
          why: "p2.id > p1.id keeps exactly one row per pair. Drop the guard and every split reports twice in both orientations; the self-pair noise the weaker guards reintroduce is exactly the double-count the sweep exists to rule out.",
        },
        {
          answer: "<>",
          kind: "keyword",
          label: "the cross-rail test",
          why: "A legitimate split bills two different rails; a duplicate charge re-runs the same rail. = answers the fraud half directly and returns zero rows — the finding IS that no same-rail duplicates exist on this book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The sweep reads biggest settled total first: 5,614.00 / 5,284.00 / 4,860.00 / 4,723.00 / 4,459.00. ASC opens on the smallest split and buries the statement finance argues about first.",
        },
      ],
      distractors: ["=", "NOT", "p2.invoice_id", "ASC", "AND"],
      walkthrough:
        "Self-join, one pair per row. payments p1 meets payments p2 on the same statement key with p2.id > p1.id keeping one orientation, and the cross-rail test keeps only mixed pairs — five rows, one per split statement: statement 19 settles 2,807.00 card + 2,807.00 wire = 5,614.00; statement 5 2,642.00 twice = 5,284.00; statement 1 2,430.00 twice = 4,860.00; statement 12 2,361.50 twice = 4,723.00; statement 22 2,229.50 twice = 4,459.00. Every split divides its bill exactly in half, and every pair foots to the billed amount from the anomaly list — so the sweep's finding is five legitimate splits, zero duplicate charges. The distractors fail honestly: = in the rail test returns zero rows, which is the same-rail duplicate question and its empty answer is the audit's clean bill; NOT breaks the comparison and errors; p2.invoice_id as the statement key is a tautology that floods the sweep with 176 cross-rail pairs; ASC opens on the smallest split; AND in any expression slot is a syntax error. The cents rule holds throughout: legs are INTEGER cents, /100.0 makes them dollars, and the pair must foot to billed or the close does not ship.",
    },
    {
      id: "cs-tumblr-2",
      tier: "medium",
      topic: "q4",
      universe: "growth",
      title: "The fandom baseline board",
      brief:
        "Tumblr-flavored brief on the storefront db: the growth board wants the fandom baseline read — which users' engagement cycles beat their OWN average, not the platform's, because a superfan running 24 cycles and a lurker running 2 should be measured against different baselines. Probed facts: the platform mean cycle is 338.19 across the 34,833.28 book, but the per-user fold matters: 45 of the 103 cycles beat their own user's average, worth 24,507.66, spread across 14 of the 16 users. Alice Chen clears her own bar 8 times in 24 cycles (worth 4,721.66), Emma Wilson and Maya Patel also clear 8, and the two single-cycle users never appear — a user's only cycle IS their own average. The board reads heaviest clear-count first, alphabetical within ties.",
      ask: "Return each user with market, count of cycles above their own average and that value in dollars to 2 decimals, heaviest clear-count first, alphabetical within ties.",
      template:
        "SELECT c.name AS user,\n       c.region AS market,\n       COUNT(*) AS cycles_above_baseline,\n       ROUND(SUM(o.total), {1}) AS value_above\nFROM orders o\nJOIN customers c ON {2} = o.customer_id\nWHERE o.total > (\n  SELECT {3}(o2.total) FROM orders o2\n  WHERE o2.customer_id = {4}\n)\nGROUP BY o.customer_id\nORDER BY cycles_above_baseline {5}, user;",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the value precision",
          why: "Dollar folds report to 2 decimals — Alice's 4,721.66 against the 24,507.66 board total. Precision 0 flattens the fold to whole dollars and the rows stop reconciling with the figures the brief quotes.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the user join key",
          why: "Cycles attach to their user through c.id = o.customer_id. Fill 1 there and every cycle joins to user 1 only — the whole board reads Alice Chen in every row and the market column lies.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the baseline fold",
          why: "The baseline is the user's mean cycle. MAX sets an unbeatable bar — nothing exceeds its own maximum — and SUM fails the same way; COUNT turns the baseline into a row count and the board fills with nonsense survivors.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the correlated key",
          why: "The subquery must re-run per outer user: o2.customer_id = o.customer_id. Fill o2.customer_id there and the predicate is always true — the baseline silently becomes the platform's 338.19 mean, a different question with a different board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The board reads heaviest clear-count first with the name tiebreak: Alice Chen, Emma Wilson, Maya Patel at 8, down to the six users at 1. ASC opens on the singles and inverts the superfan story.",
        },
      ],
      distractors: ["1", "0", "MAX", "SUM", "o2.customer_id", "ASC"],
      walkthrough:
        "Correlated, staged in one query. The join attaches every cycle to its user; the correlated subquery re-runs per row — AVG(o2.total) over that user's own cycles — so the WHERE keeps only cycles strictly above their user's mean, and GROUP BY o.customer_id folds the survivors to 14 users: Alice Chen 8 of 24 worth 4,721.66, Emma Wilson 8 of 17 (5,090.02), Maya Patel 8 of 13 (2,948.02), down to six users clearing once — including Farid Nasser, whose single above-baseline cycle is the platform's 1,088.44 maximum. Across the board that is 45 of 103 cycles worth 24,507.66 of the 34,833.28 book. The two single-cycle users are structurally absent: their only cycle IS their average, and the comparison is strict. The distractors each break differently: 1 or 0 in the precision slot flattens the dollar folds; MAX or SUM as the baseline fold sets an unbeatable bar and empties the board; o2.customer_id as the correlated key turns the test into the platform-mean read — 16 rows led by Emma Wilson at 9 — a real report answering the wrong question; ASC inverts the board. The scalar platform mean (338.19) is the trap the whole case exists to catch: same syntax, different baseline, different board.",
    },
    {
      id: "cs-tumblr-4",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The rail-totals stack",
      brief:
        "Month-close brief, in-world: the close packet's first page stacks the settlement rails — card against wire — with a labelled TOTAL row underneath, one query, no spreadsheet math. Probed on the storefront db: 27 legs over 28 statements; card carries 16 legs for 37,364.00, wire 11 for 32,248.00, so the TOTAL row reads 27 legs and 69,612.00. Five statements settle across both rails at once (the split-rail pair this kit's fraud sweep rebuilds), which is why the stack reads rails and not statements. The packet reads biggest settled figure first, and the TOTAL row must land on top.",
      ask: "Return each settlement rail with its leg count and settled total in dollars to 2 decimals, plus a labelled TOTAL row for the whole ledger, biggest settled first.",
      template:
        "SELECT method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / {1}, 2) AS settled\nFROM payments\nGROUP BY method\nUNION ALL\nSELECT {2}, {3}, ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY settled {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Legs carry INTEGER cents; the dollar read is amount_cents / 100.0. Divide by 1 and card prints 3,736,400 raw cents beside a TOTAL row still in dollars — one stack, two units, unusable in the packet.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The TOTAL branch needs its literal label: SELECT 'TOTAL', so the grand row reads as the ledger's own line, not a third rail. 'card' in the slot would put a second card row in the stack and the packet's reader cannot tell the grand total from a rail.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the all-in leg counter",
          why: "The TOTAL row must count the whole ledger — 27 legs, not one rail's 16 or 11 — because its settled column is the 69,612.00 grand total. SUM in the slot would print 6,961,200 cents in a legs column and the row contradicts itself.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The packet reads biggest settled first: TOTAL 69,612.00 on top, then card 37,364.00, then wire 32,248.00. ASC buries the grand total under the wire row — the one figure the close exists to defend.",
        },
      ],
      distractors: ["1", "SUM", "'card'", "ASC"],
      walkthrough:
        "Two branches, one stack. The detail branch GROUPs BY method and folds each rail's legs and settled dollars: card 16 / 37,364.00, wire 11 / 32,248.00. The TOTAL branch re-scans the unfiltered payments table: 27 legs, 69,612.00 — the grand total the detail rows must foot to (37,364.00 + 32,248.00 = 69,612.00, by construction). UNION ALL is the join between grains — no dedupe pass, and the outer ORDER BY settled DESC floats the TOTAL row to the top where the packet's first page expects it. The cents rule holds in both branches: /100.0 makes INTEGER cents into dollars, and the legs column stays a count. The distractors fail honestly: 1 in the divider prints raw cents on the rail rows while the TOTAL row keeps dollars — a mixed-unit stack; SUM in the legs slot prints 6,961,200 inside a count column; 'card' labels the grand row as a rail and the packet reads three rails; ASC opens the packet on wire and buries the total.",
    },
    {
      id: "cs-tumblr-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The never-collected sweep",
      brief:
        "Month-close brief, in-world: before billing fires a single ad reminder, the AR sweep lists every advertiser/subscription statement with ZERO settlement legs — the never-collected book the dunning calendar is built from. Probed on the storefront db: 6 statements worth 15,217.00 — INV-2025-024 (4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2024-021 (1,295.00), INV-2024-018 (873.00), and the anomaly INV-2025-028 (1,756.00), which carries status 'paid' with no legs: a status that lies, which is why leg rows are the ledger of record. The sweep reads biggest outstanding first.",
      ask: "Return each statement number, its status, and its billed amount in dollars to 2 decimals, for statements with no settlement legs, biggest billed first.",
      template:
        "SELECT i.number,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS billed\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY billed {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Statements carry INTEGER cents; the dollar read is amount_cents / 100.0 — INV-2025-024 prints 4,937.00, not 493,700. The raw-cents read inflates the whole dunning letter a hundredfold.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 legless ones a NULL payload the WHERE catches. INNER JOIN would keep only matched statements and the never-collected book — the entire deliverable — silently deletes itself.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg test",
          why: "p.id IS NULL is the anti-join's signature: a legless statement produces no joined row, so p.id is NULL exactly there. IS NOT would invert the sweep into the 22 collected statements — the opposite list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-outstanding direction",
          why: "The dunning queue works biggest first: 4,937.00 / 3,562.00 / 2,794.00 / 1,756.00 / 1,295.00 / 873.00. ASC would open the queue on the 873.00 statement and bury the 4,937.00 the finance note quotes.",
        },
      ],
      distractors: ["INNER", "0", "IS NOT", "ASC"],
      walkthrough:
        "The anti-join, straight up. invoices LEFT JOIN payments on the statement key keeps all 28 statements; the 22 with legs match, and the 6 without arrive carrying a NULL payload — p.id IS NULL keeps exactly those: INV-2025-024 (4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00), INV-2024-021 (1,295.00), INV-2024-018 (873.00) — 15,217.00 outstanding, footed against the 28-statement book. The sweep's headline anomaly rides in the list: #28 is marked 'paid' yet has zero legs, which is the whole reason leg rows are the ledger of record and status columns are claims. The distractors fail honestly: INNER JOIN keeps only matched statements and returns zero rows — the deliverable deletes itself; 0 divides every billed amount into NULL (division by zero in SQLite) and the queue empties of figures; IS NOT NULL flips the sweep to the 22 collected statements; ASC opens the dunning queue at the bottom.",
    },
    {
      id: "cs-tumblr-6",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "The go-live speed census",
      brief:
        "Syndication-pod brief, in-world: the feed team watches how fast booked cycles go live — the CASE buckets each stamped cycle's booking-to-live latency into fast (day 2), standard (day 3) and slow (day 4), so the syndication calendar knows which latency band carries the load. Probed on the storefront db: of the 82 stamped cycles (the 14 queued have no go-live yet and sit outside this census by definition), 27 go live on day 2, 30 on day 3 and 25 on day 4 — the diffs are exact whole days, so the buckets foot to 82 by construction and the 2.98-day average lives between them, a property of the population rather than any row.",
      ask: "Return each go-live speed band with its cycle count, biggest band first.",
      template:
        "SELECT CASE CAST(julianday(shipped_at) - julianday(created_at) AS INT)\n         WHEN {1} THEN 'fast'\n         WHEN 3 THEN 'standard'\n         ELSE 'slow' END AS open_speed,\n       COUNT(*) AS cycles\nFROM orders\nWHERE shipped_at IS NOT {2}\nGROUP BY open_speed\nORDER BY cycles {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the fast-day arm",
          noVerify: true,
          why: "Day 2 is the fast band: 27 cycles. Drop the arm (or set it to a day that never occurs) and the 2-day cycles fall into ELSE 'slow' — the slow band reads 52 and the syndication calendar staffs the wrong queue.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the stamped-only guard",
          why: "IS NOT NULL keeps the 82 stamped cycles — the only rows with a latency. IS NOT 0 or IS NOT 'shipped' would also pass all 82 rows today, but the honest guard names the definition: NULL is 'no go-live yet', and the census exists for the stamped population.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first direction",
          why: "The pod reads the biggest band first: standard 30, fast 27, slow 25. ASC would open on the slow band — presenting the tail as the load and mis-staffing the calendar at a glance.",
        },
      ],
      distractors: ["shipped_at", "ASC", "MAX", "COUNT"],
      walkthrough:
        "One scan, one CASE, one census. The WHERE keeps the 82 stamped cycles — the 14 queued have no shipped_at and belong to no latency band by definition; the CASE operand CASTs the julianday diff to an INT and the simple-CASE arms classify: day 2 reads 'fast' (27), day 3 'standard' (30), and everything ELSE — the day-4 cycles — reads 'slow' (25). The buckets foot to 82 by construction, which is the census's reconciliation: no band hides a cycle, no cycle wears two bands. The simple CASE needs the explicit 2-arm because the ELSE is the catch-all, not a third named day. The distractors fail honestly: shipped_at as the CASE arm matches no integer latency, so fast empties and slow absorbs 52 — the calendar staffs the wrong queue; ASC opens the read on the 25-cycle slow band; MAX and COUNT as the day literal are parse errors, and the census ships nothing.",
    },
    {
      id: "cs-tumblr-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The cycle-open spine walk",
      brief:
        "Growth-board brief, in-world: the review opens with the 14-month cycle spine — cycles booked per month, the prior month beside each, and the month-over-month delta — so the trend narrative writes itself from the table. Probed on the storefront db: the spine runs 2024-01 through 2025-02 carrying all 103 cycles; it opens at 8, jumps to 9 in February 2024, and the first six months read 8 → 9 → 8 → 7 → 8 → 6 — the May→June fade costing two cycles. LAG carries the prior month, and the first row's delta is honestly NULL: no baseline exists yet.",
      ask: "Return month, cycle count, the prior month's count, and the month-over-month delta, for the first six months of the spine.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS cycles\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       cycles,\n       {1}(cycles) OVER (ORDER BY month) AS prev_cycles,\n       cycles - LAG(cycles) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(cycles) walks the window backwards one row — February's prev_cycles is January's 8. LEAD would read forward and hand February March's count, silently re-labeling the future as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC would present the newest month first with its baseline below — the numbers survive, the story doesn't.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 6 returns the spine's first six months — the run the deck opens with, ending on the May→June fade. The figure 6 is also the June cycle count sitting in the output, and the -2 delta is the row the narrative quotes.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "3"],
      walkthrough:
        "Staged windows over the fandom spine. The CTE folds all 103 cycles into 14 monthly buckets via the SUBSTR month key; the outer query reads each month beside its neighbor: LAG(cycles) OVER (ORDER BY month) brings January's 8 into February's row, and the delta subtracts the same LAG — NULL, +1, -1, -1, +1, -2 across the first six months, with the -2 fade the growth call quotes. The first month's delta is NULL by design: no prior row, no baseline, no invented zero. The two-step matters — window output isn't visible to sibling expressions or to LIMIT's row selection, so the CTE stages the grain and the outer SELECT layers the windows before the cut. LEAD would read the future (February's prev would be March's 8); SUM would pile a running total into prev_cycles; DESC tells the story backwards; LIMIT 3 amputates the fade the memo quotes.",
    },
  ],

  problems: [
    { slug: "game-play-analysis-i", why: "First post per user — the onboarding moment every activation curve starts from. This problem drills the earliest-event fold the fandom team runs to time first-post dates and tag-page handoffs." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The most prolific poster — on this db one user runs 24 cycles while the median runs 3. Finding the volume leader is the superfan screen, asked in every engagement round." },
    { slug: "article-views-ii", why: "Posts whose engagement clears a threshold is the HAVING gate behind every 'trending on your dashboard' cut — the digest the content team ships weekly." },
    { slug: "find-followers-count", why: "Follower counts per user feed the recommendation and badge systems — a plain GROUP BY with community meaning attached, and the first social-graph query this team hands you." },
    { slug: "reported-posts", why: "Flagged posts — trust & safety's harassment screen. Reblog chains amplify content fast; the moderation count that feeds the review queue is this exact conditional count." },
    { slug: "reported-posts-ii", why: "Flag rate per market — where reports cluster relative to volume. A ratio with an honest denominator, exactly how the moderation load is argued in review." },
    { slug: "find-churn-risk-customers", why: "Dormant fandom — no recent post, no note momentum. The winback list the lifecycle team mails every week is this anti-join with a freshness window bolted on." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Consecutively growing note counts across a chain — LAG-flag logic over the engagement stream, the virality signal the content team actually brag about." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "The 30-day activity window — engagement health over a rolling month. Date-filtered conditional counts are the weekly pulse report for the whole growth org." },
    { slug: "active-users", why: "Streaking users — consecutive-day posters. Streak detection over the posting stream is both a retention feature and the window-function screen this team loves." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU-style stickiness for posting: daily actives over weekly actives. The ratio that decides whether growth is broadening the base or deepening the obsession of the same fandoms." },
    { slug: "growth-accounting", why: "Growth accounting — new, retained, resurrected and churned users by cycle month. LAG over the month spine, the exact quick-and-dirty view behind the quarterly engagement board." },
    { slug: "bank-account-summary", why: "The billing LEFT JOIN: statements with and without settlement legs, folded per user. The cents-safe summary that anchors every AR conversation at close." },
    { slug: "null-blank-audit", why: "Post metadata hygiene before any join: untitled or untagged catalog rows silently split reads in every per-post report — the audit that runs before any tag-page cut." },
    { slug: "invalid-tweets", why: "Post-length validation is Tumblr-native: SUBSTR/LENGTH checks on microblog text before it enters the index. The string-hygiene screen every content-integrity round reaches for." },
    { slug: "duplicate-charge-pairs", why: "Legs paired on the same statement — the self-join sweep this kit's fraud case rebuilds. Duplicate detection over shared keys is the ad-billing team's weekly hygiene run." },
    { slug: "trial-to-paid-funnel", why: "Queue-to-active/paid with the denominator stated: the cycle funnel in miniature, and the interviewer's first question is always whether the 14 queued cycles count in the base." },
    { slug: "ad-free-sessions", why: "Ad-free browsing passes are a product line here — sessions filtered against an entitlement is the conditional-count shape behind every monetization mix read." },
    { slug: "ads-performance", why: "Ad platform spend beside engagement load — a two-table fold with a guarded denominator, the exact shape of the feed's engagement-versus-ads fight." },
    { slug: "find-trending-hashtags", why: "Tag velocity is Tumblr-native: which tags are accelerating right now is a window-with-burst shape, and the tag pages live or die by it." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before the fandom-ladder escalation. Say the 1,1,3 pattern out loud; the ladder ties are real on this db." },
    { slug: "top-earners", why: "The Post+ payout ladder — per-creator folds ranked with ties sharing rungs. Finding the top k earners is the partner-team screen in every round." },
    { slug: "second-highest-salary-ii", why: "Second-highest with duplicates in play: the LIMIT-OFFSET candidate breaks, the DENSE_RANK candidate passes — the badge-cutoff drill behind tier promotions." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of users clearing a threshold, denominator stated — the co-engagement read the community team quotes for every tag event." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain census: cycles beside users per month (EU 45-from-8 versus US 19-from-2) — this kit's signature COUNT(*) / COUNT(DISTINCT) drill." },
    { slug: "find-bursty-behavior", why: "Fandom bursts: posting that spikes then fades is the bursty signal the content team brags about — window math over the note stream." },
    { slug: "cohort-retention-matrix", why: "Cohorts by signup month, retained by cycle month — the matrix view behind every 'which fandom cohort stuck' question this kit's spine supports." },
    { slug: "week-over-week-churn", why: "LAG churn: churned cycles week over week is the winback trigger — a lag-flag shape the retention pod ships every Monday." },
    { slug: "weather-type-in-each-country", why: "CASE labeling inside a join: translate codes into community words per market — the readout-friendly column every tag-page deck wants." },
    { slug: "count-salary-categories", why: "CASE bands that must print empty tiers as zero — the top-band-is-empty lesson generalized, exactly this kit's ad-load band shape." },
    { slug: "monthly-transactions-ii", why: "Per-month folds with a charged-back CASE branch — the coverage split (21 exact / 1 partial / 6 none) is one CASE away from the dunning calendar." },
    { slug: "ar-aging-schedule", why: "Statements bucketed by age outstanding — the dunning calendar's source query, and this kit's 28-statement book is the practice ledger." },
  ],
};
