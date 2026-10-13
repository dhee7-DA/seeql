// Substack — Wave-8 (Task 96), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Publishing-economics SQL: the storefront db read as a newsletter graph — customers are
// publications, orders are posts booked onto the publishing calendar (delivered = landed in
// every inbox and the archive, shipped = sent with shipped_at as the send stamp, pending =
// scheduled for a future slot, cancelled = killed before send), order_items are the tier
// lines each post ships across (free list, paid list — quantity = sends, unit_price = tier
// price), and the finance tables are the payout rails (28 payout runs, 27 settlements,
// INTEGER cents) under "landed". Delivery-funnel censuses, two-grain publication reads,
// tie-heavy cadence leaderboards, the 14-month publishing spine. Pool provenance:
// company-pools.md carries NO Substack section — 0 tagged rows — so all 10 topic slug sets
// and all 16 problems are theme-curated from the pools file's theme menu and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12); every case
// slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const substackKit: CompanyKit = {
  id: "substack",
  domainId: "media",
  name: "Substack",
  tagline: "Writer economics across publications and posts",
  accent: "text-orange-300",

  brief: [
    "**Substack** turned the newsletter into a business: writers own the list, readers pay the author, and the platform rides along on the fee. Every growth number in the building is a conditional count over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are publications, the 103 orders are posts booked onto the publishing calendar worth **34,833.28** in subscription revenue, and the 251 order_items rows are the tier lines each post ships across — free list, paid list. The status map is fixed: delivered = {emerald:landed} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%), pending = scheduled (14), cancelled = {rose:killed} (7, 6.8%).",
    "The data org splits into growth (the {orange:recommendations network}, publishing cadence), monetization (free-versus-paid tiers, the platform fee) and a small payouts pod, and all three read the same spine at different grains. The cadence funnel is the heartbeat: a post books at created_at as a draft, and shipped_at is stamped the day the send actually fires — **82 of 103 posts** carry the stamp, averaging **2.98 days** of draft-to-send with a 2–4 day spread, and the 14 scheduled posts have none yet (a population definition, not a cleanup job). Money sits one layer down: payout runs and settlements in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with publications whose lifetime revenue crosses 3,000 (71.2% above 2,000) — one writer going dormant moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain publication census** — EU runs 45 posts from just 8 publications (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a killed post count in your base?'*), then into the cadence leaderboard where four publications sit tied at 4 posts and rank semantics become a business decision. Late rounds walk the {sky:14-month publishing spine} (2024-01 to 2025-02) with `LAG` deltas — the **1,193.86** July trough, the +1,158.21 August jump — and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Substack section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: delivery-funnel censuses, two-grain publication reads, tie-heavy cadence leaderboards, tier-band CASE logic and the cents-safe payout spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:delivery census} publishing ops opens Monday with, the other rebuilds the {violet:above-the-mean read} monetization takes into every pricing review. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:40 —** The day starts with the delivery-funnel refresh. A growth analyst opens the publishing dashboard before standup: did overnight sends fire, did any post get its `shipped_at` stamp without a send-slot owner, does the one-pass status census reconcile — 52 landed + 30 in flight + 14 scheduled + 7 killed = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If draft-to-send latency drifts off the **2.98-day** norm, the cadence queue gets pulled before the morning Letter ships.",
    "**11:30 —** Midday is the network read. The recommendations team wants the cadence leaderboard with the four-way tie at 4 posts handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus publications; a regional VP wants posts per publication beside publication counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the metrics-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The payouts anti-join refreshes first — **6 never-settled payout runs worth 15,217** — before a single writer reminder goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled run (#11, 925.00) and a paid-status run with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Send rate", what: "Posts with shipped_at stamped ÷ all posts booked: 82 of 103 (79.6%). The top-of-funnel number growth reads every Monday — the 14 scheduled rows are 'not yet', never a silent zero." },
    { name: "Draft-to-send latency", what: "Booking to send (created_at → shipped_at) over sent posts only: 2.98-day average, range 2–4. The population definition ships with the number — scheduled posts have no cycle yet and must not dilute it." },
    { name: "Landed rate", what: "Delivered ÷ ALL posts booked: 52 of 103 (50.5%). 'Landed' is a status-filtered conditional count, and the denominator — in-flight sends included — is the whole interview." },
    { name: "Kill rate", what: "Cancelled share of booked posts: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%. The churn cohort map that drives the win-back and reactivation calendars." },
    { name: "Subscription book", what: "Total revenue booked: 34,833.28 across 103 posts, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — free-list volume at one end, a 1,088.44 flagship issue at the other." },
    { name: "Tier lines per post", what: "Send lines ÷ posts: 251 order_items across 103 posts — the free-list and paid-list lines each issue ships across. Paid expansion shows up here first: a post added to a paid tier is a new line, not a new post." },
    { name: "Publication concentration", what: "Share of the book from publications with 3,000-plus lifetime revenue: 63.5% (71.2% above 2,000). The number that staffs writer partnerships and sizes the top-writer pod." },
    { name: "Payout coverage", what: "Booked versus settled: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The payouts anti-join the finance pod refreshes every close." },
  ],

  topics: [
    {
      name: "Send-funnel counts",
      why: "Every Substack growth screen opens with the funnel: posts booked, sent (shipped_at stamped), landed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight send 'landed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i"],
    },
    {
      name: "Two-grain publication censuses",
      why: "Posts and publications are different grains of the same join, and every census here reports both: EU runs 45 posts from 8 publications while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is volume and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-i", "number-of-rich-customers"],
    },
    {
      name: "Joining publications to posts",
      why: "Publications carry region and created_at; posts inherit them through joins, and the join type decides who survives. A post without a publication is corruption; a publication without posts is a dormant blog — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employee-bonus"],
    },
    {
      name: "Cadence leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four publications sit at 4 posts each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer writers, not syntax.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries"],
    },
    {
      name: "Tier banding with CASE",
      why: "Subscription tiers are CASE-classified — paid, free, founding — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the list.",
      slugs: ["triangle-judgement", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month publishing spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — landed under killed, this quarter beside last — and EXCEPT answers 'which booked posts never sent'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: fold per-publication post counts, then judge them against a computed platform mean (6.44 posts here — exactly four publications clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets landed, in-flight, scheduled and killed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "snaps-analysis"],
    },
    {
      name: "Payout rails & cents discipline",
      why: "Landed is not paid — the finance tables (28 payout runs, 27 settlements, INTEGER cents) are where the publication world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "substack-t1",
      q: "Your publication report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a post column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins posts to publications: a post with no publication row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from publications: the publications with no posts ARE the answer (a dormant blog), arriving with NULL post columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload publication row — the LEFT quietly became an INNER and the dormant list vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-posting publications, and proving that zero is itself the analyst's job: all 16 publications appear in the posts table somewhere.",
      tag: "joins",
    },
    {
      id: "substack-t2",
      q: "Four publications tie at 4 posts on the cadence leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose publication gets the recommendation boost. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer publications (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "substack-t3",
      q: "The census shows 103 posts and 16 publications; EU shows 45 posts and 8 publications. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts post rows after the join — one row per post, so a publication with 24 posts contributes 24. COUNT(DISTINCT customer_id) folds those rows back to publications — EU's 45 posts collapse to 8 mastheads. Neither is wrong: posts measure publishing volume and cadence, publications measure installed base and coverage. The ratio — 5.6 posts per publication in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for tier lines and COUNT(*) silently counts send lines, not posts — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "substack-t4",
      q: "shipped_at is NULL until a send fires. What is your policy for the draft-to-send report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only sent posts have a latency, so the report measures booking-to-send for the 82 of 103 posts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL posts returns the sent-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the sent subset; the gap between it and COUNT(*) is exactly the 14 scheduled plus 7 killed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day sends for drafts that have not entered a send slot. A report whose WHERE clause is doing definitional work without saying so is exactly what a Substack reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "substack-t5",
      q: "The growth review wants landed revenue per region for regions carrying at least ten posts. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, scheduled and killed rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-post floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to posts versus to dollars. The strong answer places every filter by asking: is this a fact about one post, or about a region?",
      tag: "pipeline",
    },
    {
      id: "substack-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 posts always produce a mean (6.44 posts per publication, and exactly four publications clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each post to ITS publication's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "substack-t7",
      q: "The publishing trend buckets posts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's posts, and newsletter sends cluster exactly at month boundaries. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's story here: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August — those deltas are how cadence conversations start.",
      tag: "dates",
    },
    {
      id: "substack-t8",
      q: "Finance says a payout run is 'paid' but the settlements table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: payout runs LEFT JOIN settlements, keep the settlement id NULL — on this db that returns 6 runs worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void run WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: payout runs and settlements carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "substack-mcq-1",
      prompt: "A post row's status reads 'delivered'. In this kit's Substack stage map, what happened?",
      choices: ["Landed — the send completed and counts as fully delivered", "In flight — sent, not yet confirmed", "Killed — pulled before send", "Scheduled — queued for a future send slot"],
      answer: 0,
      why: "The stage map is fixed: delivered = landed (52 of 103 posts, 50.5%). It is the only status where the send has completed end to end.",
      notes: [
        { choice: 1, why: "In flight is 'shipped' — 30 posts sent but not confirmed landed. Calling them landed inflates the delivery rate before a single send confirms." },
        { choice: 3, why: "Scheduled is 'pending' — 14 posts with no shipped_at yet. Scheduled is not killed and not landed; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-2",
      prompt: "Send rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 sent, 14 scheduled and 7 killed of 103 booked.",
      choices: ["Sent + killed only (82/89 = 92.1%)", "All posts booked (82/103 = 79.6%)", "Landed posts only (52/82)", "Distinct publications (82/16)"],
      answer: 1,
      why: "The house definition: sent ÷ ALL posts booked — scheduled drafts stay in the denominator because 'not yet sent' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 scheduled inflates the rate to 92.1% by deleting the population still queued — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — landed is delivery completion, shipped_at is the send firing. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-3",
      prompt: "EU carries 45 posts from 8 publications. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts post rows (45); COUNT(DISTINCT customer_id) folds repeats back to publications (8). The gap between them — 5.6 posts per publication — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every post has a publication. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not publications — a third grain nobody asked for. The census is posts AND mastheads." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to killed posts only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the kill share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the kill map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-5",
      prompt: "Keep only publications carrying at least 10 posts. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY publication HAVING COUNT(*) >= 10", "WHERE posts >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A post-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 posts — clears a 10-post bar per publication.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'posts' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-6",
      prompt: "The cadence ladder runs 24, 17, 14, 13, 5 posts, then FOUR publications tied at 4. Under RANK, what rank do the two 3-post publications carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-post publications share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The network board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The scheduled posts double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the sent-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 posts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-8",
      prompt: "A staging win-back list uses publication_id NOT IN (SELECT customer_id FROM posts WHERE status = 'killed') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the win-back list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every post carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-9",
      prompt: "A board stack puts in-flight posts under killed posts in one layout, built with UNION. A reviewer says one publication's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same publication, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same publication, same counts, no region or branch label — collapse into one, and the board loses a publication with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-10",
      prompt: "A dashboard walks subscription revenue issue by issue: SUM(total) OVER (ORDER BY published_at). Two posts share a published_at second, and the cumulative 'jumps two posts at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on published_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at post grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-substack-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The one-pass delivery census",
      brief:
        "Publishing-ops memo on the storefront db: Monday's review opens with the delivery census — per region, posts landed, in flight, scheduled and killed in ONE scan, and the four branches must reconcile to the region's post total by construction. Probed facts: 103 posts booked; the platform split reads 52 delivered / 30 shipped / 14 pending / 7 cancelled; by region it is EU 24 / 12 / 6 / 3 of 45, APAC 21 / 8 / 5 / 3 of 37, US 5 / 10 / 3 / 1 of 19, LATAM 2 / 0 / 0 / 0 of 2 — every LATAM post landed, none still queued. The board reads biggest publishing volume first.",
      ask: "Return each region with landed, in-flight, scheduled and killed post counts plus the region total, biggest volume first.",
      template:
        "SELECT c.region AS region,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS landed,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS scheduled,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS killed,\n       COUNT(*) AS all_posts\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nORDER BY {3} {4};",
      slots: [
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight status literal",
          why: "In-flight posts are status 'shipped' — 12 in EU, 8 in APAC, 10 in US, 0 in LATAM. 'sent' matches no status on this db, so the column zeroes out; 'delivered' duplicates the landed column and the census double-counts its own sends.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the publication join column",
          why: "Posts attach to publications through o.customer_id = c.id. Joining on o.id pairs each post with whoever shares its row number and silently reassigns every region's counts — a census of nothing that still adds up per row.",
        },
        {
          answer: "all_posts",
          kind: "keyword",
          label: "the volume-first sort key",
          why: "The board reads biggest publishing volume first — 45, 37, 19, 2. Sorting by region alphabetizes the census and the biggest market scrolls off the top; sorting by a status column re-frames the whole meeting around one stage.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC puts EU's 45 posts on top. ASC would open the meeting on LATAM's 2 posts — a correct query aimed at the wrong end of the board, with the market that pays for the meeting buried in row four.",
        },
      ],
      distractors: ["'sent'", "'delivered'", "o.id", "ASC", "region"],
      walkthrough:
        "One scan, four CASE branches, one reconciliation identity. The join attaches every post to its publication's region; the four SUM(CASE …) branches count delivered (52 platform-wide → EU 24, APAC 21, US 5, LATAM 2), shipped (30 → 12, 8, 10, 0), pending (14 → 6, 5, 3, 0) and cancelled (7 → 3, 3, 1, 0), and COUNT(*) prints the totals — 45, 37, 19, 2 — that each row must sum back to: 24+12+6+3 = 45 by construction, and LATAM's 2+0+0+0 = 2 explains why no reactivation budget goes there. The chips each guard a failure: 'sent' matches no status and zeroes the in-flight column; 'delivered' in the in-flight slot duplicates the landed column so sends double-count; o.id joins posts to whoever shares their row number and reassigns every region; region alphabetizes the census; and ASC opens the meeting on LATAM's 2 posts instead of EU's 45. The read underneath: the US is the only region where in-flight (10) outruns landed (5) — a delivery-confirmation backlog, not a publishing gap.",
    },
    {
      id: "cs-substack-2",
      tier: "hard",
      topic: "q2",
      universe: "pricing",
      title: "The above-the-mean read",
      brief:
        "Monetization memo on the storefront db: the pricing review opens with the above-the-mean read — which publications' average issue revenue clears the platform-wide mean — because the recommendations network should be boosting writers the economics already reward. Probed facts: 103 posts worth 34,833.28, so the mean issue books 338.19; the spread runs 25.47 to 1,088.44; the top publication by lifetime book books 7,262.35 over 24 posts while a 17-post publication books 6,640.56. Definitions are pinned: the mean is the platform fold (SELECT AVG(total) FROM orders), not the filtered base's.",
      ask: "Return each publication above the platform mean with its post count and average issue value to 2 decimals, highest average first.",
      template:
        "SELECT c.name AS publication,\n       c.region AS region,\n       COUNT(*) AS posts,\n       ROUND(AVG(o.total), {1}) AS avg_issue_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING AVG(o.total) > (SELECT {3}(total) FROM orders)\nORDER BY avg_issue_value {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the average's precision",
          why: "Issue-value reports read to 2 decimals — 390.62, 533.59. ROUND(…, 1) prints 390.6 and the cells stop reconciling with the 338.19 mean monetization quotes on the same slide.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the publication grouping key",
          why: "GROUP BY c.id folds posts to their publication — 16 groups before the gate. GROUP BY o.id makes every post its own group, so the average equals the post's own total and the mean-comparison becomes a tautology.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the mean-issue fold",
          why: "The platform mean is AVG(total) — 338.19 over all 103 posts. SUM returns the whole 34,833.28 book and the gate empties; MIN returns 25.47 and everything passes; MAX returns 1,088.44 and nothing does.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-average-first order",
          why: "The review reads best economics first: 705.39, 533.59, 486.32, down to 390.62. ASC would open on the barely-above-mean tail instead of the head the recommendations network should boost.",
        },
      ],
      distractors: ["0", "MIN", "c.customer_id", "SUM", "ASC"],
      walkthrough:
        "A fold, a gate, a scalar. The join folds each publication's posts into one row — post count beside average issue value rounded to 2 decimals — and the HAVING gate compares each publication's average to the platform fold (SELECT AVG(total) FROM orders): 338.19, the mean over ALL 103 posts, not the filtered base's. Seven publications clear it: 705.39 on a single post, 533.59 over 5, 486.32 over 3, 444.8 over 1, 426.22 over 2, 421.54 over 4, and 390.62 over 17 — the only high-volume masthead in the head, which is why the network pod reads this list before boosting. The chips each break differently: 0 in the precision slot truncates to whole dollars and the cells stop reconciling with the 338.19 slide; GROUP BY anything but c.id re-partitions the base so the comparison stops comparing publications; c.customer_id is no column and errors; SUM in the scalar returns the 34,833.28 book so the gate empties; MIN returns 25.47 so all sixteen pass; ASC reads the tail first. The scalar subquery's contract is the point: 0-or-1 rows, 1 column — and on a filtered staging table an empty inner fold returns NULL, so the gate passes nobody while looking valid.",
    },
  ],

  problems: [
    { slug: "analyze-subscription-conversion", why: "Free list to paid conversion via LEFT JOIN with the NULL arm named: readers who never upgrade are the answer, not an artifact — the exact shape of the tier-conversion read." },
    { slug: "email-engagement-funnel", why: "Open and click stages with denominators printed per step — the open-rate funnel email ops ships weekly; the drop-off between send and open is the deliverability story." },
    { slug: "winback-recovery", why: "Writers who stopped publishing and came back — the win-back window measured over timestamps, the reactivation calendar's core query." },
    { slug: "cohort-retention-matrix", why: "Subscribers bucketed by signup month and tracked forward — the retention matrix that decides whether a publication's paid tier is compounding or leaking." },
    { slug: "week-over-week-churn", why: "Unsubscribes walked week over week with LAG — the churn pulse that fires the win-back campaign before a list goes cold." },
    { slug: "growth-accounting", why: "New, retained and resurrected readers reconciled in one pass — Substack-style growth accounting where the identity must close to the total or the board deck ships wrong." },
    { slug: "net-revenue-retention", why: "Paid-tier expansion versus churn rolled into NRR — the number the monetization pod actually manages, cohort revenue walked with LAG." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU as a habit read — for a newsletter, opens-per-week is the stickiness curve, and the ratio drill is identical." },
    { slug: "rolling-7d-actives", why: "Rolling distinct reader counts over a 7-day frame — the notes-feed engagement read: distinct counting over a moving window, drift-proof by construction." },
    { slug: "article-views-ii", why: "Posts above a view threshold with HAVING — the viral-issue census; the filter lives after the fold or it does not exist." },
    { slug: "invalid-tweets", why: "Length-gated content validation — notes carry a character budget, enforced with LENGTH before anything joins." },
    { slug: "fix-names-in-a-table", why: "Publication name hygiene before any join: imports arrive title-case-broken, and 'the morning ledger' versus 'The Morning Ledger' silently splits one masthead into two." },
    { slug: "find-followers-count", why: "Subscriber counts per publication — the audience-size leaderboard's raw fold, one GROUP BY away from the network board." },
    { slug: "number-of-comments-per-post", why: "Comment threads folded per post — the engagement-depth read that decides which issues the recommendations network amplifies." },
    { slug: "ltv-cac-payback", why: "Writer acquisition spend versus lifetime paid revenue — the payback window that prices the recommendations program." },
    { slug: "mrr-waterfall", why: "Paid-subscriber movement decomposed — new, churned, downgraded — the subscription-revenue waterfall beneath every number this kit quotes." },
  ],
};
