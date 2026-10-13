// Telegram — Wave-8 (Task 96), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Messaging-at-scale SQL: the storefront db read as a messaging-graph sandbox — customers are
// broadcast channels, orders are channel posts (delivered = read by the audience, shipped =
// delivered-but-unread with shipped_at as the fan-out completion stamp, pending = scheduled
// for a later slot, cancelled = deleted by an admin), order_items are the attachment lines on
// each post (quantity = copies carried, unit_price = per-attachment value), products are the
// media-format catalog behind attachments, and the billing tables (INTEGER cents) sit under
// Telegram Premium — invoices are subscription invoices, payments are renewals settled by
// card or app-store wire. Read receipts, unread walls, scheduled queues, admin/moderation
// censuses, tie-heavy channel leaderboards, the 14-month posting spine and Premium billing
// discipline. Pool provenance: company-pools.md carries NO Telegram section — 0 tagged LC —
// so all 10 topic slug sets and all 16 problems are theme-curated from the pools file's theme
// menu and say so. Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const telegramKit: CompanyKit = {
  id: "telegram",
  domainId: "media",
  name: "Telegram",
  tagline: "Messaging at scale: chats, channels and bots",
  accent: "text-cyan-300",

  brief: [
    "**Telegram** is the cloud-messaging platform where {sky:channels} broadcast to subscriber bases, groups converse thread by thread, and bots automate everything in between — with Premium subscriptions, sticker packs and admin/moderation tooling riding on top. This kit maps the storefront db onto that world: the 16 customers rows are broadcast channels, the 103 orders are channel posts worth **34,833.28** in ad-attributed reach value, and the 251 order_items rows are attachment lines — quantity = copies carried, unit_price = per-attachment value. The status map is fixed: delivered = {emerald:read} (52, 50.5%), shipped = delivered-but-unread (30, 29.1%), pending = scheduled for a later slot (14), cancelled = {rose:deleted} (7, 6.8%).",
    "The data org splits into growth, messaging telemetry and a monetization pod, and all three read the same post spine at different grains. Every post books at created_at, and `shipped_at` is stamped the moment fan-out to the channel completes — **82 of 103 posts** carry the stamp, averaging **2.98 days** to fan out with a 2–4 day spread, and the 14 scheduled posts have none yet (a population definition, not a cleanup job). The unread wall is the product's daily tension: 30 posts sit delivered-but-unread, and whether they belong in a 'seen' denominator is the first question every reviewer asks. Money sits one layer down — Premium invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0` — and concentration is the third story: **63.5%** of the reach book sits with channels whose lifetime value crosses 3,000.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain channel census** — EU runs 45 posts from just 8 channels (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a deleted post count in your base?'*), then into the engagement leaderboard where four channels sit tied at 4 posts each and rank semantics become a product decision about the {sky:top-channels} shelf. Late rounds walk the 14-month posting spine (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Telegram section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: read-receipt conditional counts, unread/NULL policy, two-grain censuses, tie-heavy leaderboards, moderation set algebra and the cents-safe Premium spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:moderation census} the admin-tools team opens Monday with, the other rebuilds the {sky:EU channel leaderboard} growth reads for the top-channels shelf. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the post-telemetry refresh. A messaging-telemetry analyst opens the delivery dashboard before standup: did overnight posts land, did any channel get its `shipped_at` stamp without a scheduled slot ever existing, does the one-pass status census reconcile — 52 read + 30 unread + 14 scheduled + 7 deleted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If fan-out latency drifts off the **2.98-day** norm, the delivery queue gets pulled before the growth pod's weekly read ships.",
    "**11:30 —** Midday tilts toward moderation and the leaderboard. The admin-tools team wants the deletion census re-cut by region — {rose:7 deleted posts} at 8.1% of APAC volume versus 6.7% in EU and 5.3% in the US — while growth wants the top-channels shelf rebuilt with the four-way tie at 4 posts handled honestly: shared rungs, named policy. A regional VP wants posts per channel beside channel counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the shelf-review argument*.",
    "**15:30 —** The afternoon belongs to Premium money. The AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before billing sends a single dunning message; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the renewal-risk list; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Read rate", what: "Posts marked read ÷ ALL posts booked: 52 of 103 (50.5%). The headline telemetry number — and the denominator fight (scheduled and deleted posts included?) is the whole interview." },
    { name: "Unread wall", what: "Delivered-but-unread posts: 30 of 103 (29.1%). shipped = delivered, not read — collapsing it into the read rate overstates engagement by more than half." },
    { name: "Scheduled queue", what: "Posts waiting on a future slot: 14 (13.6%). They carry no shipped_at yet and no read state — 'not yet', never a silent zero in any funnel." },
    { name: "Deletion share", what: "Admin-deleted posts ÷ booked: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%. The moderation-load map that staffs the admin-tools team." },
    { name: "Fan-out latency", what: "created_at → shipped_at over the 82 stamped posts: 2.98-day average, range 2–4. The population definition ships with the number — scheduled posts have no fan-out yet and must not dilute it." },
    { name: "Reach value per post", what: "Ad-attributed value across the book: 34,833.28 over 103 posts, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the channel-tiering story — one 1,088.44 post outweighs the smallest 42 combined." },
    { name: "Regional load", what: "Posts beside channels per region: EU 45-from-8, APAC 37-from-5, US 19-from-2, LATAM 2-from-1. The intensity gap (5.6 vs 9.5 posts per channel) decides where growth is broadening or concentrating." },
    { name: "Premium collections", what: "Renewed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217; card brings 37,364 against wire's 32,248. The AR anti-join billing refreshes every close." },
  ],

  topics: [
    {
      name: "Read receipts & conditional counts",
      why: "Every Telegram telemetry screen opens with receipt counts: posts read, posts delivered-but-unread, posts scheduled, posts deleted. Each stage is a conditional count over a status, and the interviewer's first question is what the denominator holds. The trap is calling a delivered-but-unread post 'read' — 30 versus 52 on this db.",
      slugs: ["reported-posts", "percentage-of-users-attended-a-contest", "immediate-food-delivery-i"],
    },
    {
      name: "Unread walls & NULL policy",
      why: "Scheduled posts carry no shipped_at and no read state, so the telemetry tables are full of meaningful NULLs. COUNT(shipped_at) versus COUNT(*) is the gap between fanned-out and booked posts — 82 versus 103 here — and AVG over a NULL-bearing column silently shrinks its population. Writing NULL policy down before writing SQL is the habit being graded.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "invalid-tweets-ii"],
    },
    {
      name: "Two-grain channel censuses",
      why: "Posts and channels are different grains of the same join, and every census here reports both: EU runs 45 posts from 8 channels while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining channels to posts",
      why: "Channels carry region and created_at; posts inherit them through joins, and the join type decides who survives. A post with no channel is corruption; a channel with no posts is a dead shelf — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Engagement leaderboards",
      why: "The top-channels shelf is rank-window reporting where ties are guaranteed — four channels sit at 4 posts each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a product policy about the shelf, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month posting spine (2024-01 to 2025-02) is the growth review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "average-time-of-process-per-machine"],
    },
    {
      name: "Moderation set algebra",
      why: "Admin packets stack populations — deleted under scheduled, this quarter beside last — and EXCEPT answers 'which channels posted but never got deleted into'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "movie-rating", "customers-who-never-order"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-channel post counts, then judge them against a computed platform mean (6.44 here — exactly four channels clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The admin board gets read, unread, scheduled and deleted in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Premium billing & cents discipline",
      why: "Renewed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the Premium world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "telegram-t1",
      q: "Your channel report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a post column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A reach report joins posts to channels: a post with no channel row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A shelf-health report must be LEFT from channels: channels with no posts ARE the answer, arriving with NULL post columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload channel row — the LEFT quietly became an INNER and the dead shelf vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-posting channels, and proving that zero is itself the analyst's job: all 16 channels appear in the post table somewhere.",
      tag: "joins",
    },
    {
      id: "telegram-t2",
      q: "Four channels tie at 4 posts each on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a product decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose channel sits higher on the top-channels shelf. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer channels (RANK or DENSE_RANK), or an explicitly named tie-breaker like reach value, then channel id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "telegram-t3",
      q: "The census shows 103 posts and 16 channels; EU shows 45 posts and 8 channels. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts post rows after the join — one row per post, so a channel with 24 posts contributes 24. COUNT(DISTINCT customer_id) folds those rows back to channels — EU's 45 posts collapse to 8 shelves. Neither is wrong: posts measure load and publishing momentum, channels measure installed base and coverage. The ratio — 5.6 posts per channel in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for attachment lines and COUNT(*) silently counts attachments, not posts — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "telegram-t4",
      q: "shipped_at is NULL until a post finishes fanning out. What is your policy for the fan-out latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only fanned-out posts have a latency, so the report measures booking-to-delivery for the 82 of 103 posts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL posts returns the fanned-out-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 scheduled plus 7 deleted posts, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day fan-outs for posts that have not been queued. A report whose WHERE clause is doing definitional work without saying so is exactly what a Telegram reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "telegram-t5",
      q: "The telemetry review wants read-post value per region for regions carrying at least ten posts. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards unread, scheduled and deleted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-post floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a regional line and an error, and between a threshold applied to posts versus to reach value. The strong answer places every filter by asking: is this a fact about one post, or about a region?",
      tag: "pipeline",
    },
    {
      id: "telegram-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 posts always produce a mean (6.4375 posts per channel, 6.44 rounded — exactly four channels clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each post to ITS channel's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "telegram-t7",
      q: "The posting trend buckets broadcasts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's posts, and quarter-end is exactly when scheduled broadcasts fire. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is telemetry discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "telegram-t8",
      q: "Billing says a Premium invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent Premium renewal. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "telegram-mcq-1",
      prompt: "A post row's status reads 'shipped'. In this kit's Telegram status map, what happened?",
      choices: ["Read — the audience opened it", "Delivered but still unread", "Scheduled for a later slot", "Deleted by an admin"],
      answer: 1,
      why: "The status map is fixed: shipped = delivered-but-unread (30 of 103 posts, 29.1%). Fan-out completed — shipped_at is stamped — but the read receipt never arrived.",
      notes: [
        { choice: 0, why: "Read is 'delivered' — 52 posts. Calling the 30 unread posts read inflates the read rate before a single receipt lands." },
        { choice: 2, why: "Scheduled is 'pending' — 14 posts with no shipped_at yet. Pending is not unread and not deleted; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-2",
      prompt: "Read rate is delivered (read) posts ÷ which population? The db holds 52 read, 30 unread, 14 scheduled and 7 deleted of 103 booked.",
      choices: ["Read ÷ fanned-out posts only (52/82 ≈ 63.4%)", "Read ÷ ALL posts booked (52/103 = 50.5%)", "Read ÷ read plus unread (52/82 ≈ 63.4%)", "Read ÷ distinct channels (52/16)"],
      answer: 1,
      why: "The house definition: read ÷ ALL posts booked — scheduled and deleted stay in the denominator because 'booked' is what the post funnel produced. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 21 unstamped posts inflates the rate to 63.4% by deleting the population still in flight — the rows the funnel exists to watch. (Choices 0 and 2 land on the same wrong number from different cuts — both redefine the base.)" },
        { choice: 3, why: "52/16 divides posts by channels — a third grain nobody asked for. The read rate is a per-post rate, not a per-shelf one." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-3",
      prompt: "EU carries 45 posts from 8 channels. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts post rows (45); COUNT(DISTINCT customer_id) folds repeats back to channels (8). The gap between them — 5.6 posts per channel — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every post has a channel. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not channels — a third grain nobody asked for. The census is posts AND shelves." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to deleted posts only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the deletion share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the moderation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-5",
      prompt: "Keep only channels carrying at least 10 posts. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY channel HAVING COUNT(*) >= 10", "WHERE posts >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A post-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the heavy roster — 24, 17, 14 and 13 posts — clears a 10-post bar per channel.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'posts' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 posts, then FOUR channels tied at 4, then two channels at 3. Under DENSE_RANK, what rank do the two 3-post channels carry?",
      choices: ["7", "10", "6", "9"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: 1, 2, 3, 4, 5, then the four-way tie reads 6, so the two 3-post channels share dense rank 7. No phantom positions are skipped.",
      notes: [
        { choice: 1, why: "10 is the RANK answer — shared rungs WITH gaps (the tie block consumes 6 through 9, so the next distinct count lands on 10). The shelf's published policy is DENSE_RANK." },
        { choice: 2, why: "6 is the tie block's own dense rank (the four 4-post channels), not the next rung handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The scheduled posts double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the fanned-out-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 posts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-8",
      prompt: "A staging-table moderation list uses channel_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every post carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty moderation reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-9",
      prompt: "An admin packet stacks the deleted-post census under the scheduled-post census in one layout, built with UNION. A reviewer says one channel's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same channel, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same channel, same counts, no region or branch label — collapse into one, and the packet loses a channel with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-10",
      prompt: "A dashboard walks reach value post by post: SUM(total) OVER (ORDER BY created_at). Two posts share a created_at second, and the cumulative 'jumps two posts at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict post-by-post walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at post grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-telegram-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The moderation census",
      brief:
        "Telegram-flavored brief on the storefront db: Monday's admin-tools review opens with the moderation census — post volume, deleted posts, and the read share per region — and telemetry is explicit that the read percentage is computed over ALL booked posts, deleted included, with the population stated on the slide. Probed facts: 103 posts; the status split reads 52 read (delivered), 30 delivered-but-unread (shipped), 14 scheduled (pending) and 7 deleted (cancelled); the regional grid reads EU 45 posts with 3 deleted and 24 read, APAC 37 with 3 and 21, US 19 with 1 and 5, LATAM 2 with 0 and 2 — deletion shares 8.1% APAC, 6.7% EU, 5.3% US. The review reads biggest volume first.",
      ask: "Return each region with its post count, deleted-post count and read share to 1 decimal, biggest volume first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS posts,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS deleted_posts,\n       ROUND(100.0 * SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) / COUNT(*), {3}) AS read_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY posts {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the deleted-post literal",
          why: "Deleted posts are status 'cancelled' — 7 on the db, landing 3 in APAC, 3 in EU, 1 in the US. 'shipped' would count the 30 unread posts into the deleted column and the moderation map invents a purge exactly where delivery succeeded.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the read-receipt literal",
          why: "Read posts are status 'delivered' — 52 of 103. 'cancelled' in this slot re-keys the share to the deletion rate (the 8.1 / 6.7 / 5.3 map) and the slide's headline flips from engagement to enforcement.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the percentage precision",
          why: "Read shares report to 1 decimal — EU's 53.3. ROUND(…, 2) prints 53.33 and stops reconciling with the 1-dp cancellation shares (8.1 / 6.7 / 5.3) telemetry quotes on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-volume-first direction",
          why: "The review reads biggest volume on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on LATAM's 2 posts — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "2", "0", "ASC"],
      walkthrough:
        "One join, one fold, a CASE column per branch. The join attaches every post to its channel's region and GROUP BY region folds 103 posts into four rows: COUNT(*) reads volume (45 / 37 / 19 / 2), the deleted branch reads the moderation load (3 / 3 / 1 / 0 — 7 total), and ROUND(100.0 * read-flags / COUNT(*), 1) reads the share over ALL booked posts — EU 53.3, APAC 56.8, US 26.3, LATAM a flat 100 on 2-of-2 — reconciling upward to 52 of 103 platform-wide. The 30 unread and 14 scheduled posts stay in every denominator by definition. The distractors fail honestly: 'shipped' counts the 12 / 8 / 10 / 0 unread rows as deletions and re-keys the slide to the unread map; 'pending' counts the 6 / 5 / 3 / 0 scheduled rows instead; 2 shifts the shares to two decimals and breaks the 1-dp house convention; 0 rounds to whole numbers (53 / 57 / 26 / 100); ASC opens the review on LATAM. The read is the pairing: APAC reads 56.8% of a heavy 37-post book while the US reads only 26.3% of 19 — load and receipt quality move independently.",
    },
    {
      id: "cs-telegram-2",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The EU channel leaderboard",
      brief:
        "Telegram-flavored brief on the storefront db: the growth board wants the top-channels shelf rebuilt for EU — every EU channel ranked by broadcast volume, reach value carried to the cent, and ties sharing rungs with the next distinct count skipping (RANK policy, published on the shelf). Probed facts: EU runs 45 posts from 8 channels worth 15,089.23; the roster reads Alice Chen 24 posts / 7,262.35 reach, Chloe Dubois 5 / 2,667.93, then THREE channels tied at 4 posts — Pedro Alvarez 1,686.17, Isabella Rossi 985.65, Noah Meyer 737.68 — then Dmitri Volkov 2 / 599.26 and the two 1-post shelves Liam O'Brien 705.39 and Olivia Brown 444.80.",
      ask: "Return each EU channel with its post count, reach value and RANK by posts, biggest first.",
      template:
        "WITH volume AS (\n  SELECT c.name AS channel,\n         c.region AS region,\n         COUNT(o.id) AS posts,\n         ROUND(SUM(o.total), {1}) AS reach\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  WHERE c.region = {2}\n  GROUP BY c.id\n)\nSELECT channel,\n       region,\n       posts,\n       reach,\n       {3}() OVER (ORDER BY posts {4}) AS post_rank\nFROM volume\nORDER BY post_rank, channel;",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the reach precision",
          why: "Reach reports to the cent — Alice's 7262.35. ROUND(…, 1) prints 7262.4 and the shelf stops reconciling with the regional ledger (EU reach sums to 15,089.23 only at cent precision).",
        },
        {
          answer: "'EU'",
          kind: "keyword",
          label: "the region scope",
          why: "The shelf is scoped to EU — 8 channels from 45 posts. 'US' would collapse the roster to 2 shelves and hide the three-way tie that makes the rank policy visible.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "The shelf's published policy is RANK: the three-way tie at 4 posts consumes ranks 3-5 and Dmitri's 2-post channel lands on 6 — the gap IS the tie made visible. DENSE_RANK compresses him to 4 and ROW_NUMBER would hand 3, 4, 5 out arbitrarily.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Leaderboards read biggest first: 24, 5, 4, 4, 4, 2, 1, 1. ASC crowns the two 1-post shelves at rank 1 and drops Alice Chen — 24 posts and 7,262.35 of reach — to the bottom of her own shelf.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "1", "0"],
      walkthrough:
        "Two stages: fold the roster, then rank it. The CTE joins channels to posts, keeps the EU rows — 45 posts from 8 channels — and folds per channel: COUNT(o.id) reads posts and ROUND(SUM(o.total), 2) reads reach to the cent, reconciling to the 15,089.23 EU total. The outer SELECT ranks by posts DESC under the published RANK policy: Alice Chen 24 posts / 7,262.35 takes rank 1, Chloe Dubois 5 / 2,667.93 rank 2, then the three-way tie at 4 — Isabella Rossi, Noah Meyer, Pedro Alvarez sharing rank 3 and consuming ranks 3 through 5 — so Dmitri Volkov's 2 posts land on 6 and the two 1-post shelves share 7. The tie block IS the story: a shelf that hides the gap between rank 3 and rank 6 is hiding that three channels posted identically. The distractors each break differently: DENSE_RANK silently compresses the ladder (Dmitri to 4, the 1-post shelves to 5) and misstates the published policy; ROW_NUMBER hands the tied trio arbitrary positions; ASC flips the shelf so 705.39 outranks 7,262.35; 1 or 0 in the precision slot truncates the cent read (7262.4 / 7262) and the roster stops footing to 15,089.23.",
    },
  ],

  problems: [
    { slug: "reported-posts", why: "The moderation queue is Telegram's admin-log read — flags per post per day. This problem drills the per-post/per-day conditional count the deleted-post census uses every Monday." },
    { slug: "reported-posts-ii", why: "Spam share per author is a ratio with the denominator stated — exactly how telemetry measures paid-promotion share per channel before the admin-tools team acts." },
    { slug: "number-of-comments-per-post", why: "Discussion groups live on replies per post. Comments-per-post is the engagement fold under every channel broadcast on this db." },
    { slug: "find-followers-count", why: "The subscriber rollup is the first widget on every channel dashboard — COUNT grouped per channel, the same shape as the two-grain census." },
    { slug: "article-views-i", why: "Post views with per-viewer dedup are read receipts at practice scale — distinct viewers per post, exactly the read-state query this kit's funnel opens with." },
    { slug: "percentage-of-users-attended-a-contest", why: "Quiz bots measure entrants per contest out of all users — a distinct-count share with the denominator stated, the participation pulse behind bot campaigns." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain census — posts broadcast AND channels active per month — is the chart telemetry opens every review with; this problem is that chart at practice scale." },
    { slug: "combine-two-tables", why: "Channels LEFT JOINed to posts: the dead-shelf read. A channel with no post is a dead shelf, a post with no channel is corruption — choosing the join type is the business statement." },
    { slug: "rank-scores", why: "The top-channels shelf ranks with guaranteed ties — four channels sit at 4 posts on this db. Shared rungs versus gaps is a product policy this problem forces you to make." },
    { slug: "biggest-window-between-events", why: "Dormancy detection: the largest gap between consecutive posts flags channels going silent before subscribers drift — window math over broadcast timestamps." },
    { slug: "active-businesses", why: "One-pass status censuses: read, unread, scheduled, deleted in a single scan whose branches must reconcile to COUNT(*). Four sequential queries drift; one pass cannot." },
    { slug: "trial-to-paid-funnel", why: "Free-to-Premium conversion is the monetization pod's headline funnel — signed up, Premium active, renewed. Conditional counts over funnel stages are exactly this shape." },
    { slug: "ad-free-sessions", why: "Premium's promise is an ad-free feed — which users ran sessions with no ad rows at all is a NOT EXISTS test over entitlements, the same anti-shape as the billing audit." },
    { slug: "bank-account-summary-ii", why: "The Premium billing rollup: per-user credits and debits in INTEGER cents. The /100.0 rule makes this exact practice for the settlement true-up reports." },
    { slug: "invalid-tweets", why: "Message-length validation before any join: captions and display names that breach limits break downstream parsers — text hygiene is a Telegram intake gate." },
    { slug: "keep-latest-dedupe", why: "Contact imports collide and profile states churn — keeping the latest row per user is the ROW_NUMBER dedupe the identity pod runs before any engagement join." },
  ],
};
