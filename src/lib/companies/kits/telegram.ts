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
// so all 10 topic slug sets and all 32 problems are theme-curated from the pools file's theme
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
    "Preparation strategy: the pools file carries no Telegram section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: read-receipt conditional counts, unread/NULL policy, two-grain censuses, tie-heavy leaderboards, moderation set algebra and the cents-safe Premium spine. This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the reads Telegram teams rehearse most: the {emerald:moderation census} the admin-tools team opens Monday with, the {sky:EU channel leaderboard} behind the top-channels shelf, the Premium AR anti-join billing refreshes before a single dunning message, the APAC context read that pins each channel's share of its region, the 14-month posting spine walked with `LAG`, and the Premium settlement stack with its TOTAL row. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool**, the thirty-MCQ bank and the theory bank below. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["find-customer-referee", "books-with-null-ratings", "invalid-tweets-ii", "invalid-tweets", "keep-latest-dedupe"],
    },
    {
      name: "Two-grain channel censuses",
      why: "Posts and channels are different grains of the same join, and every census here reports both: EU runs 45 posts from 8 channels while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining channels to posts",
      why: "Channels carry region and created_at; posts inherit them through joins, and the join type decides who survives. A post with no channel is corruption; a channel with no posts is a dead shelf — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "reported-posts-ii", "number-of-comments-per-post", "find-followers-count", "article-views-i"],
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
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "trial-to-paid-funnel"],
    },
    {
      name: "One-pass status censuses",
      why: "The admin board gets read, unread, scheduled and deleted in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "ad-free-sessions"],
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
    {
      id: "telegram-t9",
      q: "COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) — what does each return on the post table, and when does telemetry want each?",
      a: "Three grains, one table. COUNT(*) counts rows — 103 posts booked, scheduled and deleted included. COUNT(shipped_at) counts non-NULL stamps — 82 posts that finished fanning out — and the 21-row gap (14 scheduled, 7 deleted) is a feature: it is the population still in flight, not dirt. COUNT(DISTINCT customer_id) folds the table back to channels — 16 — which is the coverage number beside the load number. Saying which grain each form counts, out loud, is the habit the panel grades, because every read-rate argument in the building is a denominator argument in disguise.",
      tag: "aggregation",
    },
    {
      id: "telegram-t10",
      q: "A reach SUM doubles after you join order_items to orders. Walk me through diagnosing the fan-out and fixing it.",
      a: "Diagnose by counts: 103 posts alone, 251 attachment lines after the join — the jump IS the fan-out, each post's total repeating once per attachment line. Confirm with GROUP BY order_id HAVING COUNT(*) > 1 to see which posts carry multiple lines. The fix depends on the grain owed: post-grain revenue means pre-aggregating lines per order (SUM by order_id in a CTE) before joining, or staying at line grain and counting entities with COUNT(DISTINCT o.id) while every ratio states its denominator. On this db the careless join inflates the 34,833.28 book by roughly 2.4x — 251 lines over 103 posts — and the wrong number still looks plausible, which is what makes it dangerous.",
      tag: "joins",
    },
    {
      id: "telegram-t11",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a messaging team?",
      a: "Three concrete buys. Readability: a chain named monthly, stamped_posts, channel_totals reads like the telemetry pipeline instead of a Russian-doll subquery, and each step is a checkpoint to SELECT from while debugging. Reuse: one CTE feeds several downstream references, so the per-channel fold is written once. Definition-as-code: naming a CTE fanned_out_posts forces the population (shipped_at IS NOT NULL, 82 of 103) to live where the reviewer can see it — which is exactly how the 2.98-day fan-out number survives its review. Filter early inside each step; CTEs are logical staging, not guaranteed materialization.",
      tag: "ctes",
    },
    {
      id: "telegram-t12",
      q: "Admin packets stack and diff populations. Where are UNION, UNION ALL and EXCEPT each the honest tool?",
      a: "UNION ALL concatenates and is the default: the deleted-post census stacked under the scheduled-post census are disjoint populations and every row belongs. UNION adds a distinct pass — correct only when duplicated rows would double-count, and a silent bug when a legitimate repeat (same channel, same counts, no branch label) collapses; that vanishing row is how packets lose channels with no error anywhere. EXCEPT diffs sets: which channels posted but never got deleted into — both inputs dedupe first, so if the duplicate itself is the signal (a double-ingested post), the row-honest diff is a LEFT JOIN … IS NULL anti-join instead. The discipline is saying out loud which duplicates you are paying to collapse.",
      tag: "set-ops",
    },
    {
      id: "telegram-t13",
      q: "Where do conditional aggregates — CASE inside SUM and COUNT — beat writing separate queries?",
      a: "Anywhere one scan must produce many lenses. The status census is the canonical one: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) per region prints read 52, unread 30, scheduled 14, deleted 7 from 103 posts in a single pass, and the branches reconcile to COUNT(*) by construction — four queries' worth of answers that cannot drift apart because they share one denominator. The same shape builds read-share percentages (the 100.0 fix included), pivot columns, and explicit zero buckets for regions with no deletions. Separate queries stitched in a spreadsheet lose the shared grain, and the numbers stop adding up on exactly the slide everyone screenshots.",
      tag: "case-when",
    },
    {
      id: "telegram-t14",
      q: "How do LAG and LEAD power the posting-spine walk — and where do candidates usually stumble?",
      a: "LAG(column) OVER (ORDER BY month) puts the previous month's count beside the current one — February's 9 next to January's 8; LEAD reads forward and would silently re-label the future as history. The first row's LAG is NULL, and that NULL is honest: no baseline exists, so the first delta is 'unknown', never zero. The two classic stumbles: filtering window output in WHERE, which fails because windows evaluate in the SELECT stage — stage the LAG in a CTE and filter outside; and forgetting PARTITION BY on per-entity series, where one global window smears one region's month into the next region's. Windows over a GROUP BY are legal — the fold happens first, the window walks the folded rows.",
      tag: "windows",
    },
    {
      id: "telegram-t15",
      q: "How do you bucket posts into months, cut a quarter without losing its last night, and measure fan-out in days?",
      a: "The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets here from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction. The quarter cut: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night, and scheduled posts cluster exactly at month boundaries. Fan-out: julianday(shipped_at) − julianday(created_at) over the 82 stamped posts — 2.98 days average, 2-to-4 spread — with the population stated, because AVG ignores NULLs and would quietly report the same number over an unnamed 82-row base. Date bugs are boundary bugs; state the policy before the WHERE clause.",
      tag: "dates",
    },
    {
      id: "telegram-t16",
      q: "Money lives in integer cents in the Premium tables. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: amount_cents = 87300 is $873.00, and amount_cents / 100 is integer division — 873 flat; divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. Float drift: REALs accumulate IEEE error, integer cents don't. The policy I state in reviews: aggregate in cents, convert once, round at the edge — and let the ledger prove it, because the trial balance landing at 181,080 debits against 181,080 credits, delta zero, is only checkable when nothing was rounded away en route.",
      tag: "numbers",
    },
    {
      id: "telegram-t17",
      q: "What keeps a telemetry query cheap at messaging-platform scale?",
      a: "Sargability first: compare the bare column to a value. WHERE SUBSTR(created_at, 1, 7) = '2024-03' scans every row; the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' reads the same rows through an index. Then the compounding habits: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT *; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question rather than joining first and filtering after. On a platform where every read is a funnel census over millions of posts, these are not micro-optimizations — they are the difference between a dashboard that renders and one that times out during the review.",
      tag: "performance",
    },
    {
      id: "telegram-t18",
      q: "In a review you are asked for 'the read rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator (status 'delivered' — 52 posts), the denominator (ALL posts booked — 103 — because 'booked' is what the funnel produced; excluding the 30 unread inflates the read to 63.4%, excluding scheduled and deleted inflates it further), the window (calendar month or trailing 30 days), and the deleted-post policy (in the base or out, stated either way). Then the discipline move: encode the definition as a named CTE so the SQL IS the definition and the reviewer audits it instead of arguing with you. The analyst who says 'read means delivered over booked, deleted included, trailing month' owns the room.",
      tag: "metrics",
    },
    {
      id: "telegram-t19",
      q: "How do NULLs behave in filters, joins and aggregates — and what is the NULL policy for scheduled posts?",
      a: "Three behaviors to narrate. In filters, NULL fails both x = value and x != value — WHERE status != 'deleted' silently drops NULL-status rows; add OR status IS NULL if they should survive. In joins, NULL keys never match: a post with no channel vanishes from an INNER JOIN and survives a LEFT JOIN only on the left. In aggregates, NULL inputs are ignored — AVG over all posts returns the fanned-out-only 2.98-day average over an unnamed 82-row base, and COUNT(shipped_at) shrinks to 82 while COUNT(*) stays 103. The policy for scheduled posts: they are 'not yet', never zero — report them as their own bucket, never IFNULL their latency to 0, and treat NOT IN over an unguarded column as a bug (one NULL empties the result; NOT EXISTS is the safe shape).",
      tag: "nulls",
    },
    {
      id: "telegram-t20",
      q: "Walk me through the logical evaluation order of a SELECT — and name the bug each stage explains.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters groups; SELECT computes output expressions including windows; ORDER BY sorts; LIMIT cuts. Every classic screen bug is a stage violation: an alias referenced in WHERE (it does not exist yet), COUNT(*) in WHERE (groups do not exist yet), a filter on LAG output in WHERE (windows run in SELECT — wrap the query), and the flip side that ORDER BY can use SELECT aliases because it runs after them. The less-known sibling: a SELECT alias is also invisible to its sibling expressions, which is why a spine's delta repeats the LAG instead of referencing prev_posts. Saying the order out loud before writing is the cheapest debugging tool an analyst has.",
      tag: "pipeline",
    },
    {
      id: "telegram-t21",
      q: "IN (SELECT …) versus EXISTS versus a derived table — which do you reach for on the messaging graph, and what is the empty-inner contract?",
      a: "EXISTS is an existence probe — it short-circuits on the first match and never trips on NULLs, which is why NOT EXISTS is the safe anti-join; NOT IN over a column carrying one NULL silently empties the report. IN is a membership test, fine for small static sets. A derived table is neither — it stages a new grain (per-channel post counts, per-month buckets) the outer query joins to, exactly like the tier-gate reads: fold, then judge against the fold. The contract to state unprompted: a scalar subquery returns 0-or-1 rows, and zero rows yield NULL — so an above-average gate over an empty staging fold passes nobody while looking valid. On filtered staging tables that bug ships regularly; the strong candidate names the inner fold's population and its empty case.",
      tag: "subqueries",
    },
    {
      id: "telegram-t22",
      q: "A stakeholder says the telemetry dashboard moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises alone. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream number. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of fact keys against the dimension to catch reference-integrity breaks. NULL spikes: COUNT(column) versus COUNT(*) — a column that went 0% to 40% NULL empties every conditional count built on it. On this storefront that ritual is exactly how the paid-no-settlements invoice (#28, 175,600 cents) surfaces: status says paid, payment rows say zero. The deliverable is not 'it looks fine' — it is which check passed and when.",
      tag: "quality",
    },
    {
      id: "telegram-t23",
      q: "Why is an average of averages wrong, and what do you compute instead?",
      a: "Because it weights every group equally regardless of size. The regional intensity reads are EU 5.6 posts per channel (45 over 8), APAC 7.4 (37 over 5), US 9.5 (19 over 2) and LATAM 2.0 (2 over 1) — averaging those four gives 6.13, a platform that does not exist. The honest intensity re-aggregates from the base: 103 posts over 16 channels = 6.44, where LATAM's two posts barely register and EU's 45 carry real weight. The honest blends are re-aggregation from base rows or a weighted average — SUM(intensity * channels) / SUM(channels) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: equal weights are a claim you should have to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "telegram-t24",
      q: "When is DISTINCT a bug report rather than a feature?",
      a: "When it is papering over a fan-out nobody diagnosed. SELECT DISTINCT channel_name, post_total FROM … returning sane-looking rows usually means the join multiplied posts by attachment lines and DISTINCT is de-duplicating the damage — while the revenue SUM next to it is still wrong. The honest sequence: notice the DISTINCT, run the counts with and without it, find the multiplicity (GROUP BY the key HAVING COUNT(*) > 1), fix the join or pre-aggregate. Legitimate DISTINCT exists: collapsing a dimension's value set — 16 channels, 4 regions on this db — or de-duplicating a deliberately over-joined enrichment. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
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
    {
      id: "telegram-mcq-11",
      prompt: "order_items holds 251 attachment lines across the 103 posts. What does `SELECT COUNT(DISTINCT order_id) FROM order_items` return?",
      choices: ["251 — one per attachment line", "103 — the posts carrying at least one attachment", "16 — the channels", "498 — the copies carried"],
      answer: 1,
      why: "DISTINCT folds the line-item fan-out back to the post grain: 103 posts carry at least one attachment. COUNT(*) would count 251 lines — the fan-out is exactly why COUNT and SUM disagree after this join, and why every census here states its grain.",
      notes: [
        { choice: 0, why: "251 is COUNT(*)'s answer — the raw line count. DISTINCT is what folds lines back to posts." },
        { choice: 3, why: "498 is SUM(quantity) — copies carried, a third grain nobody asked for in a post census." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-12",
      prompt: "A telemetry query buckets posts by month: created_at reads '2025-02-11 08:14:00'. What does `SUBSTR(created_at, 1, 7)` return for that row?",
      choices: ["'2025-2'", "'2025-02'", "'2025-02-11'", "'02-11'"],
      answer: 1,
      why: "SUBSTR is character-based and 1-indexed: positions 1 through 7 of an ISO-8601 timestamp are exactly the 'YYYY-MM' bucket. It's the trick behind the 14-month posting spine (2024-01 through 2025-02) every trend read in this kit walks on.",
      notes: [
        { choice: 0, why: "SUBSTR slices stored characters — no reformatting happens. The stored string already carries the zero-padded month." },
        { choice: 2, why: "Positions 1–10 give the full date; length 7 stops right after the month." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-13",
      prompt: "The AR ledger LEFT JOINs payments to invoices; the 6 never-collected invoices show a NULL paid column. The dunning deck wants those displayed as 0. What's the fix?",
      choices: ["WHERE paid_cents IS NOT NULL", "COALESCE(SUM(p.amount_cents), 0)", "SUM(IFNULL(p.amount_cents, 100))", "Switch to INNER JOIN"],
      answer: 1,
      why: "COALESCE wraps the aggregate AFTER it returns: the NULL sum of the 6 no-settlement invoices (1,521,700 cents booked) displays as 0 while the rows stay in the report. Filtering or inner-joining deletes exactly the rows dunning needs; IFNULL inside SUM fabricates settlements.",
      notes: [
        { choice: 0, why: "That deletes the never-collected rows from the report — the opposite of showing them with a 0." },
        { choice: 2, why: "IFNULL inside SUM turns each missing settlement into 100 cents of fake money. Guard the aggregate's result, not its inputs." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-14",
      prompt: "invoices.amount_cents reads 87300 (invoice INV-2024-018). Which expression prints the booked value in dollars?",
      choices: ["amount_cents / 100", "amount_cents / 100.0", "ROUND(amount_cents)", "CAST(amount_cents AS TEXT) || ' dollars'"],
      answer: 1,
      why: "INTEGER / 100 is integer division: 87300/100 = 873. Dividing by the float literal 100.0 forces real division: 873.00. Every Premium read — invoices, payments, the ledger's 181,080-cent trial balance — is integer cents, so the .0 literal is the house rule.",
      notes: [
        { choice: 0, why: "873 dollars, not $873.00 — the cents are gone. The .0 literal is the whole fix." },
        { choice: 3, why: "CAST to TEXT concatenates a label onto the integer; no scale conversion happens at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-15",
      prompt: "created_at is TEXT like '2025-02-11 08:14:00'. Does `ORDER BY created_at` give chronological order?",
      choices: ["Yes — ISO-8601 timestamps sort lexicographically into chronological order while the format stays uniform", "No — text always sorts alphabetically, never chronologically", "Only if you CAST to INTEGER first", "Only with julianday() — text dates are unordered"],
      answer: 0,
      why: "The ISO-8601 layout is big-endian — year, then month, then day — so string order and time order coincide. The real risk is format drift (mixed date-only and full-timestamp rows), which is a data-quality question, not an ORDER BY one.",
      notes: [
        { choice: 3, why: "julianday is for arithmetic — the 2.98-day fan-out latency — not for ordering uniform ISO strings." },
        { choice: 1, why: "Alphabetical IS chronological here; that is the entire point of the ISO format. 'Feb 11, 2025' would break it." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-16",
      prompt: "Which query lists the Premium invoices that never collected a settlement row — including the paid-status anomaly #28?",
      choices: [
        "SELECT i.number FROM invoices i INNER JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents IS NULL",
        "SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "SELECT i.number FROM invoices WHERE payment_id IS NULL",
        "SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id",
      ],
      answer: 1,
      why: "The anti-join: LEFT JOIN keeps all 28 invoices and hands the 6 unmatched a NULL payload; WHERE p.id IS NULL keeps exactly them — 5 open invoices plus #28, marked paid while carrying zero payment rows. This is the query billing refreshes before a single dunning message goes out.",
      notes: [
        { choice: 0, why: "INNER JOIN discards the unmatched rows before the WHERE can see them — the result is empty, since settlement amounts are never NULL." },
        { choice: 3, why: "The bare LEFT JOIN returns every invoice once per settlement — the 22 matched invoices come along for the ride." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-17",
      prompt: "The spine CTE computes prev_posts with LAG, then you filter: `... FROM monthly WHERE delta < 0`. It fails. Why?",
      choices: ["LAG cannot appear next to COUNT(*)", "Window output is computed in the SELECT stage — WHERE runs first; stage the window and filter outside", "delta must be re-aliased with AS", "LAG needs PARTITION BY to compute deltas"],
      answer: 1,
      why: "Logical evaluation order: WHERE executes before SELECT, and window functions are SELECT-stage work — delta doesn't exist yet at filter time. The fix is the two-step every spine read uses: compute the LAG in a CTE or derived table, apply the threshold outside.",
      notes: [
        { choice: 0, why: "LAG over COUNT(*) is legal — windows evaluate after GROUP BY, which is why the spine works at all." },
        { choice: 3, why: "PARTITION BY is for per-entity series. The posting spine is one global series ordered by month." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-18",
      prompt: "`SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'pending')` returns 0 — the pending staging fold is empty. What happened?",
      choices: ["Pending posts have the highest totals, so nothing clears them", "An empty scalar subquery returns NULL; total > NULL is UNKNOWN, so every row fails and the report empties silently", "COUNT(*) cannot run over a comparison", "AVG over an empty set errors and aborts the query"],
      answer: 1,
      why: "A scalar subquery contracts to 0-or-1 rows; zero rows yield NULL, and comparisons against NULL are UNKNOWN — the above-average filter passes nobody while looking valid. This is the empty-inner-query bug, and it ships regularly on filtered staging tables.",
      notes: [
        { choice: 0, why: "The mechanism is NULL, not a high bar — any empty staging fold produces it, regardless of what the totals would have been." },
        { choice: 2, why: "AVG of no rows is NULL, not an error — the failure is silent by design, which is exactly what makes it dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-19",
      prompt: "You join order_items to orders and run AVG(o.total). The db holds 103 posts and 251 attachment lines. What did you actually compute?",
      choices: ["The true per-post average — joins don't change averages", "An order average weighted by attachment-line count — heavy posts count more than once", "The average line value, not the post average", "NULL — AVG cannot run across a join"],
      answer: 1,
      why: "The join fans 103 posts out to 251 lines, so o.total repeats once per attachment and AVG divides by 251, not 103 — multi-attachment posts dominate. Compute the per-post average on orders alone, or pre-aggregate lines per order before averaging.",
      notes: [
        { choice: 2, why: "AVG(o.total) still averages the POST total column, just over fanned-out rows; line value would be AVG(unit_price * quantity)." },
        { choice: 3, why: "Joins don't inject NULLs here — totals are NOT NULL. The distortion is duplication, not NULL drift." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-20",
      prompt: "Contact imports churn: the same channel_id appears many times with different profile states. Which query keeps exactly the freshest row per channel, even when two imports share a timestamp?",
      choices: [
        "SELECT DISTINCT channel_id FROM imports",
        "ROW_NUMBER() OVER (PARTITION BY channel_id ORDER BY updated_at DESC, id DESC) = 1 in a CTE, keep rn = 1",
        "GROUP BY channel_id with MAX(*)",
        "ORDER BY updated_at DESC LIMIT 1",
      ],
      answer: 1,
      why: "ROW_NUMBER with a deterministic tie-breaker (id DESC after updated_at) keeps exactly one row per channel even on timestamp ties — the pipeline-safe dedupe. The identity pod runs this shape before any engagement join, because profile states churn.",
      notes: [
        { choice: 0, why: "DISTINCT returns one id per channel but drops every other column — the profile state you needed is gone." },
        { choice: 2, why: "MAX(*) isn't valid SQL, and even MAX(updated_at) joined back returns both rows when timestamps tie." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-21",
      prompt: "A scheduled send fires at '2025-02-28 23:59:59'. Which WHERE clause keeps it in February's cadence read?",
      choices: [
        "WHERE created_at BETWEEN '2025-02-01' AND '2025-02-28'",
        "WHERE created_at >= '2025-02-01' AND created_at < '2025-03-01'",
        "WHERE SUBSTR(created_at, 6, 2) = '02'",
        "WHERE MONTH(created_at) = 2",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) catches every timestamp in the month: '2025-02-28 23:59:59' < '2025-03-01' is TRUE. BETWEEN '2025-02-01' AND '2025-02-28' compares string-wise and drops everything after midnight on the 28th — precisely when scheduled sends cluster.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends — the last night's posts vanish from February and land in no month at all." },
        { choice: 2, why: "SUBSTR works but wraps the column in a function — format-fragile and index-hostile. The range comparison is sargable." },
      ],
      difficulty: "medium",
    },
    {
      id: "telegram-mcq-22",
      prompt: "The admin packet wants each region's channel roster as one cell — 'Alice Chen,Chloe Dubois,…' per region. Which fold builds it?",
      choices: ["GROUP_CONCAT(name) with GROUP BY region", "CONCAT(name) with GROUP BY region", "STRING_AGG is the only aggregate that folds text in SQLite", "SUM(name) with GROUP BY region"],
      answer: 0,
      why: "GROUP_CONCAT folds a group's values into one comma-joined string — the roster cell. EU's eight channels become one label the packet can print without a second pass. Plain CONCAT joins fixed arguments per row, and SUM coerces text to 0.",
      notes: [
        { choice: 1, why: "CONCAT concatenates its arguments for each row — it never folds a group of rows into one value." },
        { choice: 3, why: "SUM over text yields 0 — arithmetic cannot fold names." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-23",
      prompt: "The census reads 52 read, 30 unread, 14 scheduled, 7 deleted of 103. In the same one-pass scan, what does `COUNT(*) FILTER (WHERE status = 'delivered')` compute?",
      choices: ["52", "51", "82", "0 — FILTER needs a GROUP BY"],
      answer: 0,
      why: "FILTER (WHERE …) is a conditional count: rows failing the predicate aren't counted for that aggregate — the 52 read posts, beside the 103 total from COUNT(*). It's the cleaner twin of SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END): one scan, per-status buckets, no drift.",
      notes: [
        { choice: 1, why: "51 is what the negated predicate counts — status <> 'delivered'. The FILTER selects the rows IN the count." },
        { choice: 3, why: "FILTER is an aggregate modifier, not a grouping rule — it works with or without GROUP BY." },
      ],
      difficulty: "easy",
    },
    {
      id: "telegram-mcq-24",
      prompt: "Engagement screen: posts whose reach beats THEIR OWN channel's average. Which shape re-evaluates per outer row — and what replaces it at scale?",
      choices: [
        "A correlated subquery re-runs per post; AVG(total) OVER (PARTITION BY customer_id) computes each channel's average once and keeps every row",
        "GROUP BY channel with HAVING total > AVG(total)",
        "A CROSS JOIN of posts to channels",
        "DISTINCT on (channel_id, total)",
      ],
      answer: 0,
      why: "The correlated form compares each post to a per-channel average recomputed row by row — correct, but it re-scans per outer row. The window partition computes every channel's average once and keeps every row, which is exactly the enrichment shape telemetry ships on.",
      notes: [
        { choice: 1, why: "HAVING judges groups, not rows — it cannot keep individual above-average posts; it filters whole channels." },
        { choice: 2, why: "CROSS JOIN pairs every post with every channel — a fan-out, not a filter." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-25",
      prompt: "The cadence read filters `WHERE SUBSTR(created_at, 1, 7) = '2024-03'` and times out on the full post table. What's the sargable twin?",
      choices: [
        "WHERE created_at LIKE '2024-03%'",
        "WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "WHERE CAST(created_at AS DATE) BETWEEN '2024-03-01' AND '2024-03-31'",
        "Add an index on SUBSTR(created_at, 1, 7)",
      ],
      answer: 1,
      why: "Wrapping the column in a function forces a scan of every row; the half-open range compares the bare column and can use an index — same rows, same boundary semantics (the last night of March included), a fraction of the cost. Sargability is a functional-index conversation you rarely get to have.",
      notes: [
        { choice: 0, why: "LIKE still applies a pattern over the raw column — closer, but not a range; the half-open interval is the professional default." },
        { choice: 2, why: "CAST wraps the column again, and BETWEEN still drops the last night of the month." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-26",
      prompt: "Admin packets diff two scheduled-post feeds: Feed A carries 30 post ids, two of them exact duplicates of each other; Feed B carries 25 ids and shares 20 with A. What does `SELECT id FROM a EXCEPT SELECT id FROM b` return?",
      choices: ["10 rows", "8 rows — EXCEPT deduplicates A first, so the internal duplicate collapses before the diff", "12 rows — duplicates count twice", "An error — EXCEPT requires unique keys"],
      answer: 1,
      why: "EXCEPT is a set operation: both inputs are deduplicated first — A's 28 distinct ids minus the 20 shared = 8. If the duplicate ingest itself is the anomaly being hunted, the row-honest diff is a LEFT JOIN … IS NULL anti-join on the full multiset, not EXCEPT.",
      notes: [
        { choice: 0, why: "10 is the multiset answer. Sets collapse duplicates before comparing: 28 distinct − 20 shared = 8." },
        { choice: 3, why: "EXCEPT happily takes duplicates — that is exactly the behavior being tested. No uniqueness requirement exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-27",
      prompt: "The ledger closes at debits 181,080 and credits 181,080, delta zero. Which rounding policy makes that provable in SQL?",
      choices: [
        "Round every intermediate SUM to 2 decimals so the ledger looks tidy",
        "Aggregate in integer cents, convert to dollars once at the presentation edge, round only what a human reads",
        "Store dollars as REAL and round at the end",
        "TRUNCATE every amount before summing",
      ],
      answer: 1,
      why: "Cents are integers — summing them is exact, so a trial balance that lands at 181,080 against 181,080 is proof, not luck. Mid-pipeline rounding discards precision a later SUM still needed; the /100.0 conversion happens once, at the edge, on what a human reads.",
      notes: [
        { choice: 0, why: "Rounding mid-pipeline is how ledgers stop reconciling — the delta becomes your bug, discovered during the close." },
        { choice: 2, why: "REAL dollars accumulate IEEE drift across millions of rows; integer cents don't drift." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-28",
      prompt: "Tier banding: `CASE WHEN total < 100 THEN 'boost' WHEN total < 3000 THEN 'standard' ELSE 'flagship' END`. A 1,088.44 post lands as 'standard' and the deck is wrong. Why?",
      choices: [
        "CASE requires an ELSE on every branch",
        "CASE arms evaluate top-down and stop at the first match — the arm order doesn't match the published tier edges",
        "Comparing REAL to INTEGER fails silently",
        "CASE cannot appear outside WHERE",
      ],
      answer: 1,
      why: "First match wins: 1,088.44 clears the < 3000 arm before any flagship tier can fire. Banding bugs are almost always arm order — the fix is publishing the edges in one direction (free, standard, flagship) and testing the boundary values, not adding more arms.",
      notes: [
        { choice: 0, why: "ELSE is optional — it defaults to NULL. A missing ELSE hides rows; it doesn't mis-band them." },
        { choice: 2, why: "SQLite compares numeric storage classes fine. The arm order is the entire story." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-29",
      prompt: "`LAG(COUNT(*)) OVER (ORDER BY month)` on a GROUP BY month query runs fine and returns the prior month's post count. Why is that legal?",
      choices: [
        "It isn't — window functions cannot sit on aggregates; the result is undefined",
        "Windows evaluate after GROUP BY, so each window sees one row per month with COUNT(*) already folded",
        "SQLite silently rewrites the window as a self-join",
        "LAG only works on INTEGER columns and COUNT returns INTEGER",
      ],
      answer: 1,
      why: "The pipeline folds rows in GROUP BY first; the window stage then walks the folded rows — one per month — so LAG reads the previous month's count. That ordering is exactly why the posting spine computes deltas without staging a second CTE.",
      notes: [
        { choice: 0, why: "Aggregate-then-window is the supported order — it's how every grouped trend read in this kit is written." },
        { choice: 2, why: "No rewrite happens; the logical pipeline (GROUP BY, then windows) is the guarantee you're standing on." },
      ],
      difficulty: "hard",
    },
    {
      id: "telegram-mcq-30",
      prompt: "A growth analyst argues: 'EU runs 5.6 posts per channel (45/8), APAC 7.4 (37/5), US 9.5 (19/2), LATAM 2.0 (2/1) — so the platform average is the mean of those four.' What's wrong?",
      choices: [
        "Nothing — regional intensities average cleanly",
        "It's an average of averages: each region weighted equally regardless of size; the honest platform read re-aggregates from the base — 103 posts over 16 channels = 6.44",
        "The per-region ratios are computed wrong",
        "6.44 is the median, not the mean",
      ],
      answer: 1,
      why: "The four-region mean weights LATAM's 2-post book as heavily as EU's 45-post book — it averages to 6.13, describing a platform that doesn't exist. The honest intensity is SUM(posts)/SUM(channels) over the base rows: 103/16 = 6.44, the exact fold this kit quotes — and the bar exactly four channels clear.",
      notes: [
        { choice: 2, why: "The regional ratios are right — the crime is blending them unweighted." },
        { choice: 3, why: "6.44 is the arithmetic fold over the base, not a median of anything." },
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
    {
      id: "cs-telegram-3",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The Premium AR anti-join",
      brief:
        "Month-close brief, in-world: the monetization pod refreshes the Premium AR anti-join before a single dunning message goes out — every subscription invoice that has never collected a settlement row, status claims notwithstanding. Probed on the storefront db: 28 invoices carry 8,697,700 cents of booked value; 22 match settlement rows, and 6 never collected — 5 sitting open plus the paid-status anomaly #28 at 175,600 cents (a status that lies; settlement rows are the ledger of record). The six hold 1,521,700 cents ($15,217) of claimed-but-unbanked Premium value. Amounts live in the db as integer cents; this read prints cents.",
      ask: "Return one row: how many Premium invoices have never collected a settlement, and their total booked value in cents.",
      template:
        "SELECT COUNT(*) AS never_collected,\n       {1}(i.amount_cents) AS cents_booked\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the booked-value adder",
          why: "SUM folds the six unmatched invoices' amount_cents into the 1,521,700 total. COUNT would print 6 — a row count wearing a cents name — and the dunning queue would quote a six-cent book instead of $15,217.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices and hands the 6 unmatched a NULL payload for WHERE to catch. INNER JOIN deletes them before the WHERE can see them — anomaly #28 included — and the report reads clean while 15,217 sits unbanked.",
        },
        {
          answer: "p.id IS NULL",
          kind: "keyword",
          label: "the unmatched-row filter",
          why: "The NULL payload IS the signal: no settlement row ever matched, so p.id is NULL on exactly the 6 never-collected invoices. Filtering i.id IS NULL matches nothing — ids are never NULL — and returns an empty report that reads as good news.",
        },
      ],
      distractors: ["COUNT", "INNER", "i.id IS NULL", "'open'"],
      walkthrough:
        "The anti-join is the AR ritual: invoices LEFT JOIN payments keeps every invoice; the 22 that settled carry payload rows, the 6 that never collected carry NULLs, and WHERE p.id IS NULL keeps exactly those — 5 open invoices plus #28, which claims 'paid' while carrying zero settlement rows. That status-versus-ledger gap is why settlement rows are the ledger of record and the status column is a claim. SUM(i.amount_cents) folds the six booked values — 87,300 + 129,500 + 493,700 + 356,200 + 279,400 + 175,600 — into 1,521,700 cents, the figure billing quotes before any dunning message goes out. The distractors each break the ritual differently: COUNT prints 6, a count wearing a cents name; INNER JOIN deletes the six rows and reports a clean book that isn't; i.id IS NULL filters on a column that can never be NULL and returns nothing; and WHERE 'open' is a truthy-string gamble that empties the set. One query, one honest number, and the close can defend every cent.",
    },
    {
      id: "cs-telegram-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The posting-spine walk",
      brief:
        "Growth-board brief, in-world: the review walks the posting spine — each month's broadcast count with the prior month's beside it — so the cadence narrative writes itself from the table. Probed on the storefront db: 14 months of posts from 2024-01 to 2025-02 over 103 posts; the spine opens at 8, jumps to 9 in Feb 2024, and the first six months run 8 → 9 → 8 → 7 → 8 → 6, with the May→June fade costing -2 posts. LAG carries the prior month; the first row's prev is honestly NULL — no baseline exists. Windows over a GROUP BY are legal here because the fold happens first and the window walks the folded rows.",
      ask: "Return the first six months of the posting spine: month, post count, and the prior month's count.",
      template:
        "SELECT SUBSTR(created_at, 1, 7) AS month,\n       COUNT(*) AS posts,\n       {1}(COUNT(*)) OVER (ORDER BY SUBSTR(created_at, 1, 7)) AS prev_posts\nFROM orders\nGROUP BY month\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(COUNT(*)) walks the folded months backwards one row — February's prev_posts is January's 8. LEAD reads forward and hands February March's count, silently re-labeling the future as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A spine walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC presents the newest month first with its baseline underneath — the numbers survive, the story doesn't.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 6 returns the opening run the deck quotes — 8 → 9 → 8 → 7 → 8 → 6 — ending on the May→June fade of -2. The figure 6 is also June's post count sitting in the output, and the fade is the row the narrative cites.",
        },
      ],
      distractors: ["LEAD", "DESC", "3"],
      walkthrough:
        "A fold, then a walk. GROUP BY month folds 103 posts into 14 monthly buckets via the SUBSTR month key; COUNT(*) is the cadence counter; and because windows evaluate after GROUP BY, LAG(COUNT(*)) OVER (ORDER BY month) legally reads the previous folded row — January 8, February 9 with prev 8, then 8, 7, 8, 6 across the first six months, verified on the live db. The first row's prev_posts is NULL by design: no prior month, no baseline, no invented zero. The two-step matters — the window can't be filtered in WHERE (it doesn't exist yet at filter time), which is why spine reads stage their deltas outside the fold. LEAD would read the future, so February's baseline becomes March's 8; DESC tells the story backwards; LIMIT 3 amputates the fade the memo quotes. Every chip changes what the cadence review would conclude.",
    },
    {
      id: "cs-telegram-5",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The APAC context read",
      brief:
        "Growth brief, in-world: the regional pod reads APAC channel by channel, but no shelf row means anything without its regional context — each channel's broadcast load beside the region's total, and the share of the region that channel carries. Probed on the storefront db: APAC runs 37 posts from 5 channels — Grace Kim 14, Maya Patel 13, Keiko Sato 4, Farid Nasser 3, Hiro Tanaka 3 — so the top two shelves carry 27 of 37 regional posts (73.0%). SUM(COUNT(*)) OVER (PARTITION BY region) is the context engine: the fold happens per channel, the window re-aggregates per region without collapsing rows.",
      ask: "Return the five APAC channels with post count, the region's total posts, and each channel's share of the region to 1 decimal.",
      template:
        "SELECT c.name AS channel,\n       c.region AS region,\n       COUNT(*) AS posts,\n       SUM(COUNT(*)) OVER (PARTITION BY c.region) AS region_posts,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY c.region), {1}) AS share_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY region, posts {2}\nLIMIT {3};",
      slots: [
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "Shares report to 1 decimal — Grace Kim's 37.8. ROUND(…, 2) prints 37.84 and the cells stop reconciling with the 1-dp concentration figures (63.5% of the book) the pod quotes on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The shelf reads biggest load first: 14, 13, 4, 3, 3. ASC buries Grace Kim — 37.8% of the region — at the bottom of her own context read.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the regional cut",
          why: "LIMIT 5 is exactly the APAC roster: the region sorts first alphabetically and its five channels occupy rows one through five — a complete regional cut, not an arbitrary one. The same query re-scoped is a one-word change.",
        },
      ],
      distractors: ["ASC", "3", "2"],
      walkthrough:
        "Two aggregates, two grains, one row each. GROUP BY c.id folds 103 posts into 16 channel rows; the window then re-aggregates the folded counts per region — SUM(COUNT(*)) OVER (PARTITION BY c.region) stamps every APAC row with the region's 37 without collapsing the shelf back to one row, which is the whole point of the partition window. The share divides each channel's count by that regional context: Grace Kim 14/37 = 37.8%, Maya Patel 35.1%, Keiko Sato 10.8%, and the two 3-post shelves at 8.1% each — the concentration pair (73.0% in two channels) the regional pod manages. ORDER BY region, posts DESC with LIMIT 5 lands exactly the APAC cut because APAC sorts first alphabetically. The chips each break the read: ASC reorders the shelf so the 3-post tail leads; 3 amputates the roster mid-region; 2 shifts the shares to two decimals and the slide stops footing with the 1-dp house numbers.",
    },
    {
      id: "cs-telegram-6",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The Premium settlement stack",
      brief:
        "Month-close brief, in-world: the finance readout wants the Premium book stacked by invoice status — paid, open, void — with a labelled TOTAL row underneath, one query, no spreadsheet math. Probed on the storefront db: 28 invoices carry 8,697,700 cents of booked value; 21 read paid (6,644,300), 6 sit open (1,960,900) and 1 is void (92,500 — the void-but-settled anomaly #11, which carries a settlement row despite its status). The TOTAL branch must scan the unfiltered invoice table so the stack foots to the full 8,697,700 no matter what the detail branch filters.",
      ask: "Return runs and booked cents per invoice status, plus a labelled TOTAL row for the whole Premium book.",
      template:
        "SELECT status,\n       COUNT(*) AS runs,\n       SUM(amount_cents) AS cents\nFROM invoices\nGROUP BY status\n{1}\nSELECT {2}, {3}, SUM(amount_cents)\nFROM invoices\nORDER BY cents DESC;",
      slots: [
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the status rows without a dedupe pass — the honest stack for a report where every row belongs. EXCEPT would return only the detail rows, deleting the TOTAL the ask requires, and INTERSECT of disjoint branches is an empty stack.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The label makes the branch self-describing — a row that says TOTAL, 28, 8,697,700. Any status-looking label (like 'open') reads as a second census row and double-counts the eye, even though the numbers differ.",
        },
        {
          answer: "28",
          kind: "number",
          label: "the all-in run count",
          why: "The TOTAL row must count the whole book — 28 invoices, not the 21 paid — because its cents column (8,697,700) is the unfiltered grand total. Pinning the count keeps the row honest even if the detail filter upstream changes.",
        },
      ],
      distractors: ["EXCEPT", "INTERSECT", "'open'", "21"],
      walkthrough:
        "Two branches, one stack. The detail branch folds 28 invoices into three status rows — paid 21 / 6,644,300, open 6 / 1,960,900, void 1 / 92,500 — and the TOTAL branch re-scans the unfiltered invoices table: 28 runs, 8,697,700 cents, so the readout shows the statuses against the whole book without a second query. UNION ALL is the join between grains — no dedupe pass — and the outer ORDER BY cents DESC floats the TOTAL row to the top, then paid, open, void. The void row is the anomaly the close walks: #11 carries 92,500 cents of settlement despite its void status, which is why status is a claim and settlement rows are the ledger. The distractors each break a different promise: EXCEPT returns only the detail rows and quietly deletes the TOTAL; INTERSECT intersects disjoint branches into an empty stack; 'open' in the label slot prints a second open-looking row and the eye double-counts; 21 undercounts the runs column to the paid tier's size while the cents still claim the whole book.",
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
    { slug: "find-customer-referee", why: "Referee-less rows are the unread-wall drill: NULL fails = comparisons, and the report must say 'no referee' without dropping the channel. Telegram screens open here." },
    { slug: "books-with-null-ratings", why: "Ratings that never arrived are read receipts that never landed — AVG and COUNT shrink silently. This problem rehearses naming the population before quoting the number." },
    { slug: "invalid-tweets-ii", why: "The stricter caption gate: length plus content rules validated before any join — intake hygiene for bot-mediated posts at platform scale." },
    { slug: "daily-leads-and-partners", why: "Two grains in one daily row — posts and channels active — the census shape telemetry opens every standup with, drilled at practice scale." },
    { slug: "number-of-rich-customers", why: "Channels clearing a reach threshold per month: distinct counting with a stated bar — the concentration read behind the 63.5% headline." },
    { slug: "top-earners", why: "The top shelf by value: max-with-ties and the LIMIT-1 trap — exactly how the top-channels card gets built and argued over." },
    { slug: "department-top-three-salaries", why: "Top three per region with a join back for names — the leaderboard escalation, with a NULL-group twist that mirrors region-less channels." },
    { slug: "movie-rating", why: "A two-part report — argmax by one rule, aggregates by another — the composition test behind every engagement readout in the review." },
    { slug: "customers-who-never-order", why: "The dead-shelf anti-join. On this db the answer is a confident zero, and proving the zero — not assuming it — is part of the job." },
    { slug: "team-scores-in-football-tournament", why: "Standings folded with conditional wins/draws/losses — the moderation-census shape: conditional counts whose branches must reconcile to the total." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Fold per channel, judge against a tier — HAVING on a derived count, the tier-gate escalation every Telegram screen runs before the leaderboard." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Attachments above the platform mean — nested folds where the empty-inner-query answer is expected unprompted, exactly the t6/telemetry follow-up." },
    { slug: "average-time-of-process-per-machine", why: "Fan-out latency per channel: AVG over stamped posts only, with the population definition shipping beside the number — the 2.98-day norm in miniature." },
    { slug: "second-day-confirmation", why: "Receipts confirmed on day two — first-event-then-return logic, the read-receipt funnel in miniature and the drill behind delivery-promise reads." },
    { slug: "monthly-transactions-ii", why: "Premium renewals per month split by status with zero-buckets printed — the billing census the finance pod ships monthly, in INTEGER cents." },
    { slug: "products-worth-over-invoices", why: "Media-format value versus the Premium book: formats whose cumulative value clears an invoice — set comparison at two grains, the monetization pod's cross-check." },
  ],
};
