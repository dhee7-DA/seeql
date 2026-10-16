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
// so all 10 topic slug sets and all 16 problems are theme-curated from the theme menu's sql rows
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
    "Preparation strategy: the pools file carries no Tumblr section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: cycle funnels, two-grain censuses, tie-heavy fandom ladders, note-line depth folds, CASE ad-load bands, the month spine and the cents-safe statement book. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:split-rail statement sweep} finance runs before every ad close, the other rebuilds the {sky:fandom baseline board} growth reads to separate superfans from the platform mean. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every statement fold foot to the 28-statement book.",
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
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Note-line depth & co-engagement",
      why: "Engagement depth lives at the line grain: 251 note lines across 103 cycles, and the co-engagement read — which feature SKUs get engaged inside the same cycle — is a self-join over lines sharing an order. The three-grain trap (cycles versus users versus lines) is exactly what the 2.44-lines-per-cycle ratio exists to teach.",
      slugs: ["number-of-comments-per-post", "most-frequently-ordered-product-per-customer", "students-and-examinations"],
    },
    {
      name: "CASE banding for tiers & ad load",
      why: "Post+ tiers, ad-free passes and Blaze boost bands are CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the ad-load forecast, and a reordered WHEN quietly re-bands every user.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month spines & calendar buckets",
      why: "The 14-month cycle spine (2024-01 to 2025-02) is the trend call's home turf — SUBSTR(created_at, 1, 7) over buckets carrying 6–9 cycles each. '%m' alone merges January 2024 with January 2025; half-open date windows keep the last night's cycles; the calendar is where heatmap screens go wrong.",
      slugs: ["convert-date-format", "the-latest-login-in-2020", "rising-temperature"],
    },
    {
      name: "Windows over the reblog stream",
      why: "Engagement is window math: month-over-month cycle deltas with LAG, running book totals per user, rolling averages over posting weeks. The first row's LAG is NULL by definition — the baseline, never a zero — and frame semantics decide whether a cumulative walk steps row by row or absorbs tied timestamps in one jump.",
      slugs: ["biggest-window-between-events", "running-total-for-different-genders", "rolling-average-steps"],
    },
    {
      name: "Set ops & the grand-total stack",
      why: "The month-close packet stacks per-month rows under a labelled TOTAL row — UNION ALL, never UNION, because the dedup can silently eat a month that happens to match. Board packets that stack populations (this quarter beside last, paid beside churned) live and die on the ALL.",
      slugs: ["team-scores-in-football-tournament", "league-statistics", "the-airport-with-the-most-flights"],
    },
    {
      name: "Statement & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the fandom world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning calendar.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
