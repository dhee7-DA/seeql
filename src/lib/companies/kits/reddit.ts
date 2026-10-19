// Reddit — kit 6 of the Streaming & Social domain (Batch D).
// The vote-telemetry company: subreddits as cohorts, vote funnels, comment
// depth and the moderation-ratio questions its data teams live in. Pool
// provenance: Reddit carries only 3 registry-tagged sql rows (reported-posts,
// number-of-comments-per-post, reported-posts-ii) — ALL 3 are used first in
// topics and problems, and the remaining 13 problem slots + topic slugs are
// theme-curated from the SQL band (stated per spec, far below the 16-problem
// bar). Case studies run on db/custom.db with probed figures from
// scripts/company-facts.md (orders = posts, customers = redditors, regions =
// tracked subreddit cohorts, orders.total = karma per post, shipped_at =
// front-page promotion stamp, order_items = comment events, products =
// threads — mappings declared in-world, no invented telemetry numbers).
//
// EXPANDED to the 3x kit (batch D expansion, append-only): 6 brief paras,
// 5 day-in-life beats, 12 metrics, 15 topics, 24 theory (t1-t24), 30 MCQs,
// 6 cases (cs-rdt-3..6 added on topic families t7/s6/q2/x2 — distinct from
// the original j7/t5), 32 problems. The 3 tagged sql rows stay consumed by
// the original pool; the 16 appended problems and all new topic slugs are
// theme-curated from the theme menu in scripts/company-pools.md (sql rows
// only). New-case figures come from scripts/company-facts.md; the finance
// mapping is declared in-world: invoices/payments/expenses/ledger carry
// INTEGER cents (dollar read = amount / 100.0).

import type { CompanyKit } from "../types";

export const redditKit: CompanyKit = {
  id: "reddit",
  domainId: "media",
  name: "Reddit",
  tagline: "Communities, karma and engagement telemetry",
  accent: "text-orange-400",

  brief: [
    "Reddit is the internet's conversation layer — hundreds of thousands of communities (subreddits) where every post lives or dies by the vote. The unit of analysis is not the campaign or the session: it is the **post**, stamped with an author, a community and a fate — {emerald:front-paged}, climbing, sitting in new, or {rose:removed by mods}. Everything the business decides — which communities get resourced, where the moderators are drowning, which cohorts are thriving — hangs on queries that fold votes into post fates, fates into **cohort health**, and cohorts into the karma economy. The SQL reality is cohort- and ratio-shaped: the questions that decide staffing are 'which subreddit is growing' and 'what share of posts actually survived the queue'.",
    "The data org splits into three engines. Engagement telemetry folds the vote log — posts, comments, upvote batches — into the health boards community teams read every morning. Moderation analytics runs the {rose:removal-rate} and {violet:reported-share} reads that decide where mod tooling goes next. And the growth group watches **cohort censuses**: posts per cohort, authors per cohort, karma per cohort — with the population stated before any share is computed, because a subreddit with 2 posts and a subreddit with 45 are not the same story. *An analyst here who cannot say 'per what?' for their own metric is food for the comment section.*",
    "Interview screens are cohort- and funnel-heavy. A typical loop opens with a fold (posts per subreddit cohort, comments per thread), escalates into a **self-join** — comment-to-parent threading, author-to-author pairings — and lands on either a CASE-driven {violet:vote funnel} (delivered / shipped / pending / removed with shares that must reconcile to 100) or a ranked leaderboard with **tie behavior** on the boundary. The follow-ups are definition probes: 'is that share of posts or of authors?', 'what happens to a cohort with one post?', 'does a removed post count in the denominator?'. Candidates who narrate the GROUP BY grain and the denominator out loud consistently outperform.",
    "Preparation strategy: this kit consumes **all 3 of Reddit's tagged registry problems** — the reported-posts census, the comments-per-post self-join and the reported-posts-ii ratio read — then theme-curates the rest from the SQL band's conversation-shaped material: cohort thresholds, threading self-joins, reply-tree recursion, cadence gaps and trend buckets. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: one rebuilds the {violet:subreddit cohort health board} (a JOIN + HAVING floor), another rebuilds the upvote leaderboard (a RANK with an honest tie gap). The storefront mapping is declared, not hidden — orders are posts, order totals are karma, regions are the four tracked cohort shards — because making the stand-in explicit is itself the habit Reddit's screens reward.",
    "Under the dashboard layer sits the platform reality, and it prices every read. The vote log lands as batched events — 103 posts carrying 251 comment events — so fold-before-join is not style, it is load control. The money side is the ads business: advertiser billing sits in the finance tables as **INTEGER cents**, and the house read is `amount_cents / 100.0` — skip the .0 and a 19,609-cent open-AR invoice prints as 196 instead of 196.09, the truncation the reconciliation layer exists to catch (a void-but-paid invoice at 925.00 and a partial settlement of 4,000 against 6,148 are the standing tripwires here). The promotion pipeline carries its own honesty rule: `shipped_at` is the front-page stamp, non-NULL on 82 of 103 posts and averaging a **2.98-day climb** — *and the stamp, not the status label, is what the latency metrics fold over.*",
    "Preparation at full depth: the kit now runs **fifteen topics, twenty-four theory drills, thirty MCQs and six audited case studies** on the storefront db. The two originals rebuild the cohort health board and the upvote leaderboard; the four additions walk a **comeback-gap board** (LAG-staged silences behind a posting-habit floor), the labeled fate census (a CASE fold whose shares reconcile to 100), a trust-and-safety **karma outlier screen** (posts above the 338.19 site bar, with the bar printed beside every row) and a one-scan close census (FILTER branches counting the 103 / 82 / 2.98 story in a single pass). The 32-problem pool keeps Reddit's 3 tagged rows first, then theme-curates the rest — bursty-posting detection, DAU/WAU stickiness, keep-latest dedupes, trending-term reads and cents-safe AR folds among them. The bar to clear before the interview: *state the denominator before you compute the share*, and reconcile every multi-branch total against a `COUNT(*)`.",
  ],

  dayInLife: [
    "**08:30 —** The overnight vote board. The analyst opens the community-health dashboards: posts per cohort, {emerald:front-page rate}, and — the number that gates the morning — the {rose:removal rate}: **7 of 103 posts removed, 6.8%**, with the per-cohort split beside it. The first query of the day is almost always the fate census: one CASE fold, four stages, shares that must sum to 100. A spike in removed posts is the day's first fire, and the analyst who can isolate WHICH cohort and WHICH vertical the removals cluster in — before the mod-lead pings — owns the conversation.",
    "**11:00 —** Comment-depth deep work. A community lead wants the **comment census per thread** — the self-join that walks comment to parent and counts depth without fanning out; the growth team wants the **cohort floor board** rebuilt with a minimum-sample rule so a 2-post cohort stops impersonating a trend; a mod team wants the {violet:reported-share} by vertical, denominator stated. Each ask is a join, a HAVING gate and an argument about grain — posts versus authors, comments versus threads. The query gets written twice: once to answer, once with the population printed beside it, because at Reddit *a share without its denominator is just a hot take*.",
    "**15:00 —** Stakeholder cycles. The cohort health review: **45 posts from 8 authors earning 15,089.23 karma** in the biggest cohort against **2 posts from 1 author** in the smallest — and the floor rule that keeps the thin cohort off the trend lines. Moderation ops gets the removal queue priced by vertical; the karma-concentration read goes to comms (**63.5% of karma from authors above the 3,000 lifetime bar**). The afternoon's job is closing loops: yesterday's flagged cohort becomes next week's resourcing decision, and every number that leaves the desk carries its grain with it.",
    "**17:30 —** The writeup ritual. The EOD note is one screen: which cohort moved, which vertical is bleeding removals, which leaderboard tie needed a tie-break rule instead of vibes. Query definitions get pinned next to the numbers they produced — the mod teams re-run them blind, so the SQL is the contract. The best-prepared candidate knows the rhythm: Reddit SQL exists to defend **cohort stories under grain stress**, and the CASE fold plus the HAVING floor are the tools the defense is built with.",
    "**21:00 —** The after-hours close. Advertiser billing reconciles in cents first: the open-AR read divides by `100.0` before it prints — 6 open invoices worth 19,609 cents, or 196.09 dollars — and the {rose:void-but-paid} invoice at 925.00 stays on the anomalies list until finance kills it. Then the bursty sweep: the brigade read flags authors whose posting rate spikes past their own baseline, the signal that catches vote brigades before the front page amplifies them. The last query of the night is a keep-latest dedupe over the restated comment log — ROW_NUMBER over ingest order, rn = 1 — because tomorrow's boards fold the deduped layer, not the raw one. *The night shift inherits queries, not mysteries.*",
  ],

  metrics: [
    { name: "Front-page rate", what: "Share of posts that hit the delivered state — 52 of 103 here. The vote funnel's headline, computed as a conditional SUM over the full post population with the denominator stated." },
    { name: "Removal rate", what: "Posts removed by mods ÷ all posts — 7 of 103 (6.8%) on this db. The moderation-load signal that decides where mod tooling goes, always cut by cohort before it's believed." },
    { name: "Cohort health census", what: "Posts, authors and karma per subreddit cohort — EU's 45 posts from 8 authors against LATAM's 2 from 1. The board this kit's first case computes end to end, floor rule included." },
    { name: "Comment depth", what: "Comments per thread via the parent-child self-join — how deep the conversation runs below a post. The threading grammar Reddit screens are famous for." },
    { name: "Karma concentration", what: "Share of karma from authors above a lifetime bar — 63.5% from the 3,000-plus club here. The top-heavy read that separates community health from a handful of power posters." },
    { name: "Reported share", what: "Reported posts ÷ total posts, per vertical. The moderation-ratio read with the denominator trap: reports per post and reports per removal are different numbers entirely." },
    { name: "Posting cadence", what: "Days between an author's consecutive posts, via LAG over their partition. The habit read that separates daily regulars from one-drop authors — gap NULLs included." },
    { name: "Upvote leaderboard", what: "Threads ranked by comment upvotes with RANK semantics — where the 36/36 tie pushes the next thread to rank 6, not 5. Tie behavior is the interview, not the sort." },
    { name: "Promotion latency", what: "Days from post stamp to front-page stamp — julianday(shipped_at) minus julianday(created_at), averaging 2.98 days over the 82 stamped posts. Every average ships with its row count: AVG silently skips the 21 unstamped, so the label says 'per stamped post'." },
    { name: "DAU/WAU stickiness", what: "Daily actives over weekly actives — the ratio that separates a posting habit from a one-day spike. Both populations must come from the same window or the ratio invents engagement; computing it without drift is the screen." },
    { name: "Burst index", what: "How far an author's posting rate spikes past their own baseline — the brigade-and-spam signal mod teams page on. A self-versus-self read, which makes it a LAG comparison before it is ever a threshold." },
    { name: "Cents-safe AR", what: "Advertiser receivables read from integer-cent invoices — 6 open invoices worth 19,609 cents, or 196.09 dollars after the /100.0. The read that fails silently the moment someone divides by 100 instead of 100.0." },
  ],

  topics: [
    {
      name: "Folding the vote log",
      why: "Everything at Reddit starts by folding the post log: posts per cohort, comments per thread, authors per week. The screens warm up with GROUP BY + HAVING at event scale, and the trap is always the same — counting post rows when the business object is a person. The tagged reported-posts census is this fold with a moderation flag attached.",
      slugs: ["reported-posts", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "Subreddit cohort censuses",
      why: "Cohort health is a threshold read: which communities clear a participation bar, which authors carry a vertical, which cohorts deserve the floor treatment. These problems drill the census grammar — participation shares, size gates, top-poster argmaxes — that Reddit asks whenever a 2-post cohort tries to pass for a trend.",
      slugs: ["percentage-of-users-attended-a-contest", "classes-more-than-5-students", "customer-placing-the-largest-number-of-orders", "cohort-retention-matrix", "growth-accounting", "top-percentile-fraud"],
    },
    {
      name: "Comment-depth self-joins",
      why: "A comment replies to a comment that replies to a post — the thread is a tree, and the depth count is a self-join. Reddit drills it because moderation and ranking both key on depth: a 40-comment chain is a different object from 40 top-level replies. The tagged comments-per-post is the canonical drill; tree-node and the follower pair are the graph siblings.",
      slugs: ["number-of-comments-per-post", "tree-node", "second-degree-follower", "daily-leads-and-partners", "game-play-analysis-i", "find-trending-hashtags"],
    },
    {
      name: "Moderation ratio reads",
      why: "The mod dashboards are ratios with teeth: reported share per vertical, removal rate per cohort, front-page rate per day. The tagged reported-posts-ii is exactly this shape — a share where the denominator choice changes the story — and the curated pair drills the 100.0-before-division and NULL-coalesce habits every honest rate here needs.",
      slugs: ["reported-posts-ii", "queries-quality-and-percentage", "confirmation-rate"],
    },
    {
      name: "Vote funnels with CASE",
      why: "Post fate is a funnel: front-paged, climbing, sitting in new, removed — and the census must reconcile to 100. CASE-driven conditional SUMs are the grammar, with the two classic traps: filtering the funnel stage in WHERE (denominator drift) and letting the ELSE arm swallow a stage silently. The curated trio covers the share fold, the per-surface ratio and the classification wall.",
      slugs: ["immediate-food-delivery-i", "ads-performance", "weather-type-in-each-country", "median-time-to-convert"],
    },
    {
      name: "Posting cadence & gaps",
      why: "Cadence is LAG math: days between an author's consecutive posts, the longest silence before a comeback, the second-day return that marks a habit forming. Reddit drills the gap grammar because churn in communities is silence, and silence is a window function away from being measurable. NULL on the partition's first row is the edge case every follow-up probes.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Thread leaderboards & ties",
      why: "Top threads by upvotes, top authors by karma, the second-most-upvoted post per cohort — Reddit reporting is leaderboard reporting, and ties are everywhere when hundreds of threads sit near the same count. The rank trio (RANK, DENSE_RANK, ROW_NUMBER) is drilled until the 1,2,3,4,4,6 gap pattern is a spoken reflex, not a lookup.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries", "the-most-recent-three-orders", "second-most-recent-activity", "the-most-recent-orders-for-each-product", "restaurant-growth", "human-traffic-of-stadium"],
    },
    {
      name: "Ghost-post anti-joins",
      why: "The empty-result discipline: cohorts with no posts in a window, authors gone quiet past the reactivation bar, accounts that never posted at all. On this db the never-posted census returns ZERO — every author has posts — and knowing that cold is itself the test: the anti-join shape matters even when the count is 0, because the day it isn't zero is the day the query is already written.",
      slugs: ["customers-who-never-order", "dormant-reactivation", "number-of-accounts-that-did-not-stream", "customers-who-bought-all-products"],
    },
    {
      name: "Reply-tree recursion",
      why: "Comment chains are trees and mod hierarchies are trees — the WITH RECURSIVE grammar walks both. Reddit asks it when depth matters beyond one join: the full chain under a comment, every account below a moderator, the missing ids in a reply sequence. The curated trio drills the recursive spine, the org walk and the gap hunt that recursion frames best.",
      slugs: ["ceo-subordinate-hierarchy", "find-the-missing-ids", "analyze-organization-hierarchy"],
    },
    {
      name: "Engagement trend buckets",
      why: "The engagement trend is a month-bucketed fold — 14 months of posts and karma from 2024-01 to 2025-02, with the January peak of 3,731.97 karma and the July trough of 1,193.86 anchoring the story. '%Y-%m' bucketing, latest-activity folds and 30-day windows are the three tools; the year-collision trap (month-only buckets folding two Februaries) is the follow-up.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "dau-wau-stickiness", "rolling-7d-actives", "find-bursty-behavior", "sessionize-events"],
    },
    {
      name: "One-pass moderation censuses",
      why: "The dashboards are query-budgeted: the fate census, the stamp census and the slow-lane census each get one scan, not three sequential passes. FILTER (WHERE …) and conditional SUM count every branch in a single fold, and the audit is that branch counts reconcile to COUNT(*) — 52 + 30 + 14 + 7 must equal 103. The kit's close case builds the whole promotion picture in one pass.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "number-of-rich-customers", "not-boring-movies"],
    },
    {
      name: "Subquery shapes under the fold",
      why: "Screens escalate into nested logic: which posts clear the site-average bar, which authors beat their cohort's mean, which threads out-comment their vertical. IN, EXISTS, scalar and derived shapes each carry an edge case, and the follow-up is always the same — what does this return when the inner query is empty? A NULL scalar makes the comparison UNKNOWN and rows vanish without an error.",
      slugs: ["game-play-analysis-iv", "managers-with-at-least-5-direct-reports", "market-analysis-i"],
    },
    {
      name: "Ad-billing money math",
      why: "The ads business bills in integer cents — invoices, payments, expenses, ledger — so every dollar read is amount_cents / 100.0 and every ratio sits one misplaced integer away from truncation. Reconciliation reads (partial settlements, void-but-paid rows, trial-balance eyes over the ledger) are this kit's finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "products-worth-over-invoices"],
    },
    {
      name: "Text hygiene on community keys",
      why: "Community and author keys arrive messy — casing drift, 'r/' prefixes, stray whitespace — and a join on a dirty key fails silently: near-duplicate keys fan out, real matches never land. LOWER/TRIM/SUBSTR normalization staged once before the fold is the habit; the screens probe whether you clean at the join key or only at the display.",
      slugs: ["fix-names-in-a-table", "fix-product-name-format", "find-all-unique-email-domains"],
    },
    {
      name: "Set ops for stitched digests",
      why: "Weekly digests stitch populations: front-paged plus high-karma, this month plus last, removed plus reported. UNION's dedupe hides double-qualified posts, UNION ALL preserves them, EXCEPT diffs cohorts as sets. The drills cover the column-position discipline that keeps stacks type-safe and the dedupe semantics that decide whether an overlap shows up or vanishes.",
      slugs: ["count-salary-categories", "monthly-transactions-ii", "team-scores-in-football-tournament"],
    },
  ],

  theory: [
    {
      id: "rdt-t1",
      q: "The community board needs posts, distinct authors and karma per subreddit cohort. Walk me through the fold — and why COUNT(*) alone would ship a wrong board.",
      a: "Three folds, three business objects. COUNT(*) is posts — the load the community produced. COUNT(DISTINCT customer_id) is authors — the people behind the posts, which is the number staffing decisions actually key on, because 45 posts from 2 authors is a duo with a bot, not a community. ROUND(SUM(total), 2) is karma — the earned currency. The GROUP BY key is the cohort (region in the storefront mapping), and the HAVING floor is a sampling decision, not a filter: on this db a 19-post floor keeps three of four cohorts and drops a 2-post, 1-author shard whose averages would wobble on a single person. The trap that ends interviews: joining comments (order_items) in and counting post rows after the fan-out — 251 comment rows wearing post clothing, every per-cohort count inflated by a different factor. Say 'one row per WHAT?' before every COUNT, and the board holds.",
      tag: "aggregation",
    },
    {
      id: "rdt-t2",
      q: "You're counting comment depth: a comment replies to a parent comment that replies to a post. How does the self-join work, and where does it silently double-count?",
      a: "The canonical shape walks the table against itself: FROM comments c JOIN comments parent ON parent.id = c.parent_id, folding counts per root thread or per parent. Two fan-outs are waiting. First, joining comments to posts raw — a post with 12 comments multiplies every post-level column by 12, so any post COUNT downstream inflates by its own comment count; pre-aggregate comments per post in a derived table, then join the fold. Second, NULL parents: a top-level comment's parent_id is NULL, and an INNER JOIN drops it silently — your depth census loses every conversation starter and reports only reply chains. LEFT JOIN keeps them, with NULL parent columns you count as depth-zero deliberately. The tagged number-of-comments-per-post is this exact walk, and the senior tell is stating which side of the tree the join keeps before writing it.",
      tag: "joins",
    },
    {
      id: "rdt-t3",
      q: "The fate census must show front-paged, climbing, in-new and removed with shares. Why is the CASE fold written over the whole population, and what does a WHERE filter do to the shares?",
      a: "The census is one conditional aggregate: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) beside COUNT(*), per group — numerator and denominator fold from the SAME rows, so the shares are shares of the actual population: 52 of 103 front-paged (50.5), 30 climbing (29.1), 14 in-new (13.6), 7 removed (6.8). Put status = 'delivered' in WHERE and the denominator drifts to match the numerator — every remaining row reads 100%, a census that screams health exactly where it should scream concern. The ELSE arm is the other trap: it names the exhaust stage (removed), and pointing it at a surviving stage merges two funnels into one number that reconciles to nothing. Fold-first, filter never: the stage is a column you compute, not a row you delete. That single discipline is the difference between Reddit's fate board and a rumor with a pie chart.",
      tag: "aggregation",
    },
    {
      id: "rdt-t4",
      q: "A mod-analytics query does posts LEFT JOIN removals, then someone adds WHERE removals.mod_id IS NOT NULL to 'clean it up'. What actually happened?",
      a: "The WHERE executed the cleanup with a shovel. Unmatched posts — the ones with NO removal — carry NULL mod_id, and NULL IS NOT NULL is false, so every unmatched row is discarded: the LEFT JOIN collapsed to an INNER and the query now reports only removed posts, which is the exact opposite of the report's job. On a db where every post has a removal this even LOOKS fine for a while — that's why the bug ships. The honest patterns: keep the NULL-detection purpose and write IS NULL when you WANT the unmatched (the anti-join), or move the predicate into the ON clause when you want the join filtered but every post kept, or accept INNER semantics deliberately and say so out loud. 'LEFT JOIN is safer' is the wrong lesson — join type is a decision about who survives, and a mod-fairness report that survives only removed posts is a decision nobody made.",
      tag: "joins",
    },
    {
      id: "rdt-t5",
      q: "Threads are ranked by comment upvotes and two threads tie. What do RANK, DENSE_RANK and ROW_NUMBER each print after the tie — and which one does a leaderboard owe its readers?",
      a: "With counts 47, 46, 38, 36, 36, 33: RANK prints 1, 2, 3, 4, 4, 6 — the gap preserves the count of threads outranking the 33, which is why LIMIT 6 returns five distinct ranks and a hole. DENSE_RANK prints 1, 2, 3, 4, 4, 5 — compact tiers, right for 'how many price bands', wrong when the reader needs to know how many threads sit ahead. ROW_NUMBER prints 1 through 6 — a tie broken by engine whim, which on a leaderboard is a public lie about which thread is '5th'. Reddit's answer: RANK for public boards (readers deserve the gap), ROW_NUMBER only with a stated deterministic tie-break (ingest order, then id) when exactly one row per position is contractually required, DENSE_RANK for tiering. The follow-up that ends loops: when a tie straddles the cut, LIMIT stops being the answer — RANK plus a rank filter, and a stated definition of what 'top 6' owes a tied thread.",
      tag: "windows",
    },
    {
      id: "rdt-t6",
      q: "A report filters 'authors whose post count beats their cohort's average author'. Which clause does the cohort average live in, and where do SELECT aliases actually exist?",
      a: "Two grains, two homes. Per-AUTHOR gating ('more than 4 posts') is HAVING COUNT(*) > 4 — a judgment on folded groups, after GROUP BY. The COHORT average is a different grain: a scalar subquery — HAVING COUNT(*) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) cnt FROM orders GROUP BY customer_id)) — because the comparison target is computed across all authors, not carried per row. The pipeline order explains the alias rules: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Aliases are born at SELECT, so they exist for ORDER BY but never for WHERE; SQLite pragmatically resolves them in GROUP BY and HAVING too, but the portable habit is writing the underlying expression everywhere except ORDER BY. The senior tell is staging the average in a CTE with its grain named — 'average posts per author across all cohorts' — instead of nesting parentheses and hoping the engine guesses your population.",
      tag: "pipeline",
    },
    {
      id: "rdt-t7",
      q: "Correlated subquery: 'posts whose karma beats that author's own average post.' How does it run, and what happens for an author with a single post?",
      a: "WHERE p.total > (SELECT AVG(i.total) FROM orders i WHERE i.customer_id = p.customer_id) — the inner fold re-runs per outer row, scoped to that author's own history. Cost is one aggregation per author, fine at this scale, a window rewrite at Reddit scale (AVG(total) OVER (PARTITION BY customer_id) computes every author's average in one pass). The edge case IS the interview: a one-post author's average IS their post, so karma > own-average is never true — they drop out, correctly, because 'better than their typical' is undefined for a single observation. The silent-empty cousin: if the inner query filters to a window (say, posts this quarter) an author with no posts there yields a NULL scalar, the comparison is UNKNOWN, and the row vanishes without an error. Saying who the inner fold covers, and what NULL does on the boundary, is the whole follow-up — and on a site of one-post authors, it's not a corner case, it's the population.",
      tag: "subqueries",
    },
    {
      id: "rdt-t8",
      q: "The vote log has missing parent ids, NULL removal stamps and authors who post once. What's your data-quality policy before any cohort board ships?",
      a: "Audit before aggregate, and state the policy per column. NULL removal stamps mean NOT YET removed — the same policy as shipped_at's 82 of 103: filter only with the disclosure ('delivered-or-removed posts only; in-flight excluded by definition'), never silently. Missing parent ids break the depth self-join — count them first (a LEFT JOIN + IS NULL census on parent_id), then decide whether orphans are a feed bug or top-level posts by definition; the answer changes the depth metric, so it's a stakeholder decision, not an analyst one. One-post authors are a population, not dirt: the 2-buyers-at-1-post census on this db means any per-author average quietly carries them, and the floor rule exists to say so out loud. The reflex being graded: a COUNT(*) against COUNT(col) per column before the board ships — the 30-second audit that catches the fan-out, the NULL drift and the ghost stage before a mod-lead screenshots your dashboard into a meeting.",
      tag: "data-quality",
    },
    {
      id: "rdt-t9",
      q: "Running karma per author across their posts in post order. How do you write it — and what does the default window frame do when two posts share a timestamp?",
      a: "SUM(o.total) OVER (PARTITION BY o.customer_id ORDER BY o.created_at) is the shape — one pass, every row kept. The trap is the default frame: RANGE UNBOUNDED PRECEDING TO CURRENT ROW, which folds PEERS — rows sharing the ORDER BY value — into the same running value. Two posts stamped at the same timestamp jump together, and the running-karma chart shows a plateau that never happened, skipping the intermediate step. The fix is explicit: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — one row at a time, ties broken by o.id. Reddit's vote log arrives in batches, so timestamp collisions are the norm, not the edge; the senior candidate writes the frame, names the tie-breaker, and says why out loud.",
      tag: "windows",
    },
    {
      id: "rdt-t10",
      q: "The weekly digest stitches 'front-paged posts' and 'high-karma posts' into one list. UNION or UNION ALL — and what silently changes the deliverable?",
      a: "UNION dedupes whole rows before returning; UNION ALL appends everything. A post that is both front-paged AND high-karma appears once under UNION and twice under UNION ALL — and which is right depends on the deliverable: a reading list wants dedupe, an overlap census wants the double. The silent failure is choosing UNION by default: the dedupe erases exactly the double-qualification signal the digest existed to surface. Set ops also compare by column POSITION, not name — both arms must project the same shape in the same order — and the ORDER BY after the last arm sorts the whole stack. At Reddit the digest header states the operator, 'UNION (deduped)' or 'UNION ALL (raw)', because the row count is part of the claim.",
      tag: "set-ops",
    },
    {
      id: "rdt-t11",
      q: "'Authors who posted in every tracked vertical.' Which shape — and what does NOT IN do when the inner list carries a NULL?",
      a: "The fold is a double NOT EXISTS — authors for whom no vertical lacks a post — or GROUP BY author HAVING COUNT(DISTINCT vertical) = the vertical census. What NOT the shape: NOT IN. One NULL in the inner list poisons every comparison — x NOT IN (1, 2, NULL) is never TRUE, because x <> NULL is UNKNOWN — and the query returns nothing, silently, on a data bug. NOT EXISTS is NULL-safe: the correlated probe just never matches, and the unmatched author survives to be counted. The Reddit-flavored rule: membership checks on columns that can carry NULL — watchlists, removal stamps, region overrides — get EXISTS semantics or an explicit IS NOT NULL guard, and the candidate who says 'NOT IN with a NULL returns the empty set' before the interviewer asks is the one who has shipped this bug and patched it.",
      tag: "subqueries",
    },
    {
      id: "rdt-t12",
      q: "Time-to-front-page is julianday(shipped_at) - julianday(created_at), 2.98 days on average. What are the units — and where does date math go wrong here?",
      a: "julianday returns a fractional day number, so the difference is in DAYS with intraday precision — the 2.98 average is real, not a rounding artifact. The classic wrong move is subtracting date STRINGS: string subtraction is numeric arithmetic on text and whole-day grain besides — it would print 2 or 3 and lose the fraction the 2.98 carries. The other tripwires: STRFTIME('%s', …) / 86400 gives the same span in seconds-then-days, a different unit trap at the division, and '%Y-%m' bucketing is for grouping, never for spans — a bucket boundary is not a duration. At Reddit the latency board states its unit on the axis ('days, fractional'), because a 2.98 that someone assumes is hours is a 71x misread of pipeline health.",
      tag: "dates",
    },
    {
      id: "rdt-t13",
      q: "A stakeholder wants cohorts with no pending posts to read 0, not blank. Where does COALESCE belong — and where does it lie?",
      a: "COALESCE belongs at the display edge, never inside the fold. After a GROUP BY every cohort gets a row, and COUNT-style aggregates already return 0 — the blank shows up when the value comes from a LEFT JOIN payload or a window on an empty frame, and that NULL means 'no such event', which is information. Coalesce it to 0 for the exec board if you must, with the footnote that 0 is a fill, not a measurement — the difference between 'no pending posts' and 'pending count unknown'. The lie is coalescing a filter or join column: WHERE COALESCE(removal_id, 0) = 0 doesn't just display, it redefines the join and kills the index. Reddit's policy line: NULL is an absence, zero is a measurement, and the board's footnote names which one the reader is looking at.",
      tag: "nulls",
    },
    {
      id: "rdt-t14",
      q: "The cohort board joins posts to their comment events and every per-post count is inflated. Fix the shape.",
      a: "Aggregate before the join. The fan-out is arithmetic: 103 posts touching 251 comment events join to 251 rows, and every post-level COUNT after that counts comments wearing post clothing. Stage the fold in a derived table or CTE — comment events grouped to one row per post — then join the fold to the post grain; 251 rows collapse to 103 and every downstream count is honest. The window twin computes per-post comment counts without any join at all. The rule generalizes: whenever two tables at different grains meet, one of them must fold first, and the candidate who says which grain survives the join — 'one row per post, comments already folded' — before writing FROM is the one the board trusts with the cohort numbers.",
      tag: "joins",
    },
    {
      id: "rdt-t15",
      q: "A mod dashboard filters WHERE julianday(created_at) >= date('now', '-30 days') and the reviewer flags it as slow. Why, and what's the rewrite?",
      a: "The function wraps the column, and a predicate on f(column) cannot use an index on the bare column — the engine computes julianday for every row, then compares. The range-preserving rewrite moves the function to the constant side: created_at >= date('now', '-30 days') — same semantics, sargable, index-friendly. The same instinct covers LIKE '%term' (leading wildcard, unindexable) versus 'term%', and implicit casts on join keys. The honest coda at this db's scale: 103 rows scan in microseconds either way — performance instincts are trained here, not measured here — but the candidate who writes the sargable form unprompted is signaling they have watched a warehouse crawl under a function-wrapped filter, which is exactly the habit Reddit's dashboards need at production scale.",
      tag: "performance",
    },
    {
      id: "rdt-t16",
      q: "Leadership asks for 'the front-page rate'. Deliver it — and defend the denominator.",
      a: "Two defensible definitions, and the number moves 29 points between them. By final fate: delivered over all posts — 52 of 103, 50.5%. By promotion stamp: shipped_at IS NOT NULL over all posts — 82 of 103, 79.6%, because the stamp marks entry to the promotion pipeline (delivered AND shipped both carry it) while 'delivered' marks the landing. Neither is wrong; the deliverable is the definition, stated on the board and frozen across weeks — a rate that drifts definitions week to week is unauditable. The follow-up runs the same reflex on the window: is the population all 103 posts, or only posts old enough to have resolved — the 14 still-pending arguably have not had their chance yet? State the population, state the window, and the share becomes a fact instead of a fight.",
      tag: "definitions",
    },
    {
      id: "rdt-t17",
      q: "The advertiser-billing tables keep money in integer cents. Where does the naive read leak money?",
      a: "Everywhere the .0 is missing. amount / 100 in SQLite is INTEGER division — a 19,609-cent open-AR invoice prints 196, not 196.09 — and the leak compounds across every row of a 28-invoice ledger. The house read is amount / 100.0, which promotes to real arithmetic; SUM first, divide once at the display edge, because sum-of-dollars and dollars-of-sum disagree by accumulated truncation. The reconciliation layer exists because cents still hide in comparisons: a void-but-paid invoice at 925.00 that moved money anyway, a partial settlement of 4,000 against a 6,148 invoice, split payments across two rows — none visible in a naive dollar read. The candidate who says 'cents in, cents out, divide once' has the finance instinct Reddit's ads analytics runs on.",
      tag: "money",
    },
    {
      id: "rdt-t18",
      q: "Community keys arrive as 'r/AskReddit', 'askreddit', ' AskReddit '. What's the hygiene pass before any join?",
      a: "Normalize once, staged, at the key: TRIM the whitespace, strip the 'r/' prefix with REPLACE or SUBSTR, LOWER the case — then join on the clean column and display the original beside it. A join on a dirty key fails two ways, both silent: the fan-out, where near-duplicate keys match twice and the census inflates, and the miss, where rows that should match never land and the census quietly shrinks. Inline the hygiene five times in one query and someone eventually forgets one occurrence; stage it in a CTE named clean_keys and the definition is written once, read by everyone. The Reddit angle: community identity IS the key — a fold that splits one subreddit into two spellings invents a cohort that does not exist, and no board reader can see it.",
      tag: "text",
    },
    {
      id: "rdt-t19",
      q: "Give me the single most-upvoted thread per vertical. Two shapes — and where do ties and empty verticals bite?",
      a: "Shape one: ROW_NUMBER() OVER (PARTITION BY category ORDER BY upvotes DESC) = 1 — exactly one row per vertical, the tie split arbitrarily unless a deterministic tie-break (id, ingest order) is added. Shape two: the correlated match, WHERE upvotes = (SELECT MAX(…) …) — ties BOTH survive, which is either a bug or the honest answer to 'which threads hold the record'. Empty groups bite the second shape from the LEFT JOIN side: an unmatched vertical's NULL upvotes never equals a MAX, so the vertical vanishes from the report instead of showing as empty. At Reddit the pick is a definition: a highlight rail wants ROW_NUMBER plus a stated tie-break; an audit wants the = MAX shape that surfaces ties. Say which one you shipped and why — that sentence is the interview.",
      tag: "argmax",
    },
    {
      id: "rdt-t20",
      q: "The vote log restates events — the same comment lands twice with different ingest timestamps. How do you keep the latest row per comment?",
      a: "ROW_NUMBER() OVER (PARTITION BY comment_id ORDER BY ingested_at DESC) staged in a CTE, then rn = 1 — newest restatement per comment, one deterministic winner, ties broken by a secondary key if the ingest clock can collide. The NOT EXISTS twin — no later ingest exists for this comment — is the set-shaped equivalent. What you do not do is DELETE the dupes: the raw log is the truth of what arrived and when, and read-side dedupe keeps the audit trail while the boards fold the clean layer. The Reddit discipline: dedupe BEFORE the fold, because a census that counts both restatements does not just double a comment, it double-counts every aggregate built on it — and the error is invisible until someone reconciles the comment census back to the deduped count.",
      tag: "dedupe",
    },
    {
      id: "rdt-t21",
      q: "Average promotion latency prints 2.98 days. What population is that average over — and what does COUNT(*) beside it tell you?",
      a: "The 82 stamped posts — AVG ignores the NULL diffs of the 21 unstamped posts entirely, so 2.98 is 'average climb of promoted posts', not 'average climb per post placed'. Pair the AVG with COUNT(*) FILTER over the same predicate and the coverage prints itself: 82 of 103, with the 21 exclusions visible instead of silent. The failure mode is the unlabeled reframe: multiplying 2.98 by 82/103 gives 2.37, a per-post-placed figure — a legitimate DIFFERENT definition only if labeled as such; otherwise it is two populations wearing one number. Reddit's board rule: every AVG ships with its row count, and the label names the population ('per stamped post') — because the stakeholder who assumes per-post-placed will budget against a number that was never the metric.",
      tag: "aggregation",
    },
    {
      id: "rdt-t22",
      q: "The leaderboard query nests three levels deep and nobody can modify it but its author. Restructure it.",
      a: "WITH stages, one per business step, named for the step: vote_fold (comment events grouped per thread), thread_ranks (the window over the fold), rail_cut (the LIMIT and the tie rule). Three flat stages read top to bottom like the memo they implement; the nested version reads inside-out and breaks at every edit. CTEs evaluate once and can be reused — the fold computed twice inline is two chances to drift — and each stage is independently runnable, which is how you debug: run vote_fold, eyeball the counts, build up. The naming IS the documentation: 'thread_ranks' says what it is where a subquery's alias says nothing. Reddit's house style: if a query needs a paragraph comment, it wanted a CTE chain — and the candidate who refactors on the whiteboard mid-answer is showing the habit the dashboards are maintained with.",
      tag: "ctes",
    },
    {
      id: "rdt-t23",
      q: "You need each author's next post timestamp beside every post. LAG or LEAD — and what changes on the boundary rows?",
      a: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) — it fetches the next row where LAG fetches the previous. The boundary mirrors the LAG case: the author's LAST post has no next, the column is NULL, and that NULL is the 'open silence' still running — never coalesce it to zero, label it. The gap math flips sign with the choice: next minus current is positive, current minus next is negative, and mixing the direction silently turns the cadence board into a ledger of negative gaps whose MAX is the least-silent moment. NTILE is the cousin worth naming: it splits authors into posting quartiles for the cohort boards. Say the direction, say the boundary, and the cadence family is yours — LAG, LEAD, and the NULL that means the story is not over.",
      tag: "windows",
    },
    {
      id: "rdt-t24",
      q: "Before the weekly community digest ships, what do you reconcile?",
      a: "Everything that can drift, against a denominator printed on the same page. The fate shares sum to 100 — 50.5 + 29.1 + 13.6 + 6.8 — because the four CASE branches partition the population; a missing ELSE arm shows up as a sum short of 100. Branch counts reconcile to COUNT(*) — the FILTER census's 52 + 30 + 14 + 7 must equal 103. Row-count canaries hold: 103 posts, 251 comment events, 16 authors — a jump means a fan-out or a restatement landed unannounced. The money fold balances: ledger debits equal credits, delta 0, and the standing anomalies (the void-but-paid 925.00, the paid-with-no-payments 1,756.00) stay on the tripwire list until resolved. Reconciliation is the difference between a digest and a rumor — the digest is a claim, the reconciliations are the receipts, and they ship in the same artifact.",
      tag: "reconciliation",
    },
  ],

  mcqs: [
    {
      id: "rdt-mcq-1",
      prompt: "The post log has 103 rows from 16 authors. Which expression returns 16 — the author count the cohort board keys on?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT customer_id)",
        "COUNT(shipped_at)",
        "COUNT(status)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT customer_id) folds 103 post rows back to the 16 people behind them — the author count every cohort and staffing metric is built on.",
      notes: [
        { choice: 0, why: "COUNT(*) is the post count — 103. That's load, not community; reporting it as 'authors' inflates the base by the repeat-poster factor." },
        { choice: 2, why: "COUNT(shipped_at) counts non-NULL promotion stamps — 82 on this db. That's 'front-page-eligible posts', a third thing, not the audience." },
        { choice: 3, why: "COUNT(status) counts non-NULL statuses — every row, so 103. Status is never NULL, so this COUNT can't distinguish anything." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-2",
      prompt: "The fate census computes front-page share as 52 of 103 (50.5%). A teammate adds WHERE status = 'delivered' before the fold. What prints?",
      choices: [
        "50.5 — correct",
        "100.0 — the denominator shrank to the numerator's population",
        "0.0 — the filter empties the numerator",
        "An error — you can't filter before a CASE fold",
      ],
      answer: 1,
      why: "Filtering delivered rows first makes COUNT(*) count delivered posts — the denominator drifts to match the numerator and every group reads 100%. Both sides must fold from the same unfiltered population: conditional SUM numerator, COUNT(*) denominator.",
      notes: [
        { choice: 0, why: "The honest 50.5 needs the full 103 under the fold — the WHERE discarded 51 rows before any division happened." },
        { choice: 2, why: "Nothing empties the numerator — delivered rows are all that's LEFT. That's exactly the drift: the share saturates at 100, not zero." },
        { choice: 3, why: "It runs fine and ships a perfect-looking number — denominator drift is the most confident-looking bug in moderation analytics." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-3",
      prompt: "Two threads tie at 36 upvotes; the next thread has 33. LIMIT 6 over RANK() (upvotes DESC) returns which rank sequence?",
      choices: [
        "1, 2, 3, 4, 5, 6",
        "1, 2, 3, 4, 4, 6",
        "1, 2, 3, 4, 4, 5",
        "1, 2, 3, 4, 4, 4",
      ],
      answer: 1,
      why: "RANK gives both tied threads rank 4 and the next distinct value rank 6 — the gap preserves the count of threads ahead. LIMIT 6 therefore returns ranks 1,2,3,4,4,6: six rows, five distinct ranks, one honest hole.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER — ties split arbitrarily, a public lie about which thread is 5th." },
        { choice: 2, why: "That's DENSE_RANK — compact tiers. Right for tier counts, wrong when readers need to know how many threads sit ahead." },
        { choice: 3, why: "Rank 4 for the 33 needs it to tie with the 36s — it doesn't. Only the top two share." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-4",
      prompt: "A cohort board adds HAVING COUNT(*) >= 19. On this db (EU 45, APAC 37, US 19, LATAM 2 posts), what does the floor do?",
      choices: [
        "Keeps all four cohorts — 19 is a low bar",
        "Keeps EU, APAC and US; LATAM's 2-post cohort drops",
        "Keeps EU only",
        "Errors — HAVING can't reference COUNT",
      ],
      answer: 1,
      why: "HAVING judges folded groups: 45, 37 and 19 clear the 19-post floor; LATAM's 2 posts don't. The floor is a sampling rule — a 1-author cohort's averages wobble on a single person, and the board says so instead of quietly trendlining it.",
      notes: [
        { choice: 0, why: "LATAM's 2 posts fail the bar — the floor exists precisely to exclude it, and the walkthrough names the dropped cohort." },
        { choice: 2, why: "37 >= 19 is true — APAC and US ride with EU. Only thresholds above 37 would isolate EU." },
        { choice: 3, why: "HAVING exists to judge aggregates — COUNT(*) >= n is its textbook use." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-5",
      prompt: "Comment depth joins comments to their parents. A top-level comment's parent_id is NULL and the query uses an INNER JOIN on parent_id. What happened to the census?",
      choices: [
        "Nothing — NULLs join as themselves",
        "Every conversation starter vanished — the census counts only reply chains",
        "The NULL comments double-counted",
        "The query errored on the NULL key",
      ],
      answer: 1,
      why: "NULL parent_id never matches in an INNER JOIN, so every top-level comment silently drops out — the depth census reports only replies and misses the start of every conversation. LEFT JOIN keeps them; depth-zero becomes a stated definition, not a bug.",
      notes: [
        { choice: 0, why: "NULL fails every equality test, including against another NULL — that's precisely why the rows vanish." },
        { choice: 2, why: "NULLs can't match, so they can't multiply — the failure is silent loss, not duplication." },
        { choice: 3, why: "A join on a NULL key is legal SQL — it just matches nothing. The silence is the bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-6",
      prompt: "Posts LEFT JOIN removals; the analyst adds WHERE r.mod_id IS NOT NULL 'to clean it up'. The report was supposed to show ALL posts with removal status. What now?",
      choices: [
        "Same rows, cleaner output",
        "Only removed posts survive — the LEFT JOIN collapsed to INNER",
        "Only unremoved posts survive",
        "The query errors on the NULL check",
      ],
      answer: 1,
      why: "Unmatched posts carry NULL mod_id and fail IS NOT NULL, so every not-yet-removed post is discarded — the join silently became INNER and the report now shows the removed pile as if it were the whole log. Predicates on the right table belong in ON, or the collapse must be a stated decision.",
      notes: [
        { choice: 0, why: "The predicate deletes exactly the rows the LEFT JOIN existed to keep — the report's population changed, invisibly." },
        { choice: 2, why: "The inverse anti-join would need IS NULL — and would still be the wrong report. IS NOT NULL keeps the matched (removed) side." },
        { choice: 3, why: "IS NOT NULL is perfectly legal — that's the danger. The report ships, just answering a different question." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-7",
      prompt: "Karma per post averages 338.1879611650485. The cohort board needs 338.19. Which shape is correct?",
      choices: [
        "ROUND(AVG(total), 2)",
        "CAST(AVG(total) AS INTEGER)",
        "ROUND(AVG(total))",
        "SUBSTR(AVG(total), 1, 6)",
      ],
      answer: 0,
      why: "ROUND to 2 decimal places at the display edge — the one place rounding belongs. The pipeline carries full precision; only the print is rounded.",
      notes: [
        { choice: 1, why: "CAST to INTEGER truncates to 338 — a 0.19-karma leak per post, compounded across every cohort average built on top." },
        { choice: 2, why: "ROUND without a digit count rounds to integer — 338, not the two decimals the board specifies." },
        { choice: 3, why: "SUBSTR string-slices to '338.18' — truncation disguised as rounding, and now the cell is TEXT that downstream arithmetic mishandles." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-8",
      prompt: "The engagement trend buckets posts by month over 14 months (2024-01 through 2025-02). Which bucket expression is calendar-safe?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "created_at",
      ],
      answer: 1,
      why: "'%Y-%m' prints '2024-01' … '2025-02' — 14 distinct buckets that sort chronologically as text. Month-only variants fold February-2024 and February-2025 into one bucket; the raw date is day-grain, not month-grain.",
      notes: [
        { choice: 0, why: "'%m' drops the year — the 14-month trend collapses to 12 buckets and the year-over-year story disappears." },
        { choice: 2, why: "SUBSTR 6,2 extracts the same month-only slice — same fold, same loss, just string surgery." },
        { choice: 3, why: "The raw created_at is one bucket per DAY — hundreds of buckets where the trend expects 14. Grain, stated first, chooses the expression." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-9",
      prompt: "Cadence math: julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)). For which row is the gap NULL?",
      choices: [
        "Each author's first post — no previous row exists in the partition",
        "Posts that were removed — status is 'cancelled'",
        "Every row — LAG without an explicit frame returns NULL",
        "Posts on the log's first date only",
      ],
      answer: 0,
      why: "LAG has nothing to look back at on the partition's first row, so the gap is NULL — which is why cadence reports must treat NULL as 'no previous post', not as zero days.",
      notes: [
        { choice: 1, why: "The gap runs on created_at, the post time — removal status is a different column and a different definition entirely." },
        { choice: 2, why: "LAG is fully legal with a bare OVER; only the partition's first row lacks a previous value." },
        { choice: 3, why: "The log's first date matters for one author only — per-partition firsts produce the NULLs, and there are 16 of those." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-10",
      prompt: "A mod report joins posts to comment batches, then counts rows. Posts carry up to 24 comments each; the log has 103 posts and 251 comment rows. What does COUNT(*) return after the join?",
      choices: [
        "103 — joins never change row counts",
        "251 — the comment grain won",
        "354 — posts plus comments",
        "Depends on the join key — and that's the point",
      ],
      answer: 3,
      why: "Join grain is decided by the key: join post-to-author (one-to-one) and COUNT(*) stays 103; join post-to-comment-batches (one-to-many) and it fans to 251. The count answers 'rows in what grain', and stating the grain out loud is the whole discipline.",
      notes: [
        { choice: 0, why: "One-to-many joins fan out by definition — 103 posts touching 251 comment rows cannot stay 103 after an INNER join on the batch key." },
        { choice: 1, why: "251 is the fan-out count — but only if the join actually keys post-to-comment. With a different key it's neither number; that's why the grain is stated, not assumed." },
        { choice: 2, why: "Joins don't add unrelated tables' rows — the fan-out replaces the base count, it doesn't sum with it." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-11",
      prompt: "The promotion census must count posts that entered the front-page pipeline — the ones carrying a promotion stamp. Which expression returns 82?",
      choices: [
        "COUNT(*)",
        "COUNT(shipped_at)",
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "SUM(total)",
      ],
      answer: 1,
      why: "COUNT(shipped_at) counts non-NULL stamps — 82 of 103 (52 delivered plus 30 shipped). COUNT(*) counts every row, and the FILTER-delivered branch stops at the 52 that finished the climb.",
      notes: [
        { choice: 0, why: "COUNT(*) is 103 — the whole log, unstamped posts included. The stamp is the definition, and the star ignores it." },
        { choice: 2, why: "FILTER-delivered counts only the 52 that landed — the 30 still climbing carry stamps too, and a pipeline census wants all 82." },
        { choice: 3, why: "SUM(total) adds karma — 34,833.28, a number from a different metric family entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-12",
      prompt: "The removal share should print 6.8 (7 of 103). A teammate writes 100 * 7 / 103 instead of 100.0 * 7 / 103. What prints?",
      choices: [
        "6.8 — multiplication promotes to real math",
        "6 — integer division truncates before the display",
        "7 — SQLite rounds to the numerator",
        "0 — the division underflows",
      ],
      answer: 1,
      why: "SQLite evaluates 100 * 7 = 700 as integers, then 700 / 103 as integer division: 6. The .8 rides on the 100.0 — the one-character fix that keeps every share honest.",
      notes: [
        { choice: 0, why: "Multiplication of two integers stays integer — the promotion only happens when 100.0 enters the expression." },
        { choice: 2, why: "Nothing rounds here — the 0.79 remainder is truncated away, not rounded." },
        { choice: 3, why: "Underflow is the OTHER order's bug: 7 / 103 * 100 evaluates 7/103 = 0 first and prints 0. Both orderings trap; only 100.0-first survives." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-13",
      prompt: "The latency board shows an average climb of 2.98. julianday(shipped_at) - julianday(created_at) returns what unit?",
      choices: [
        "Whole days only",
        "Fractional days — the intraday part is real",
        "Seconds since epoch",
        "Hours",
      ],
      answer: 1,
      why: "julianday returns a fractional day number, so differences carry intraday precision — the 2.98 average is genuine, not a rounding artifact of day-grain math.",
      notes: [
        { choice: 0, why: "Whole-day math is what date-STRING subtraction gives — it would print 2 or 3, never 2.98." },
        { choice: 2, why: "Seconds-since-epoch is strftime('%s', …) — the same span, 250,000-odd units, a very different axis label." },
        { choice: 3, why: "Hours would read the average 24x off — exactly why the board states its unit." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-14",
      prompt: "Inside the fate census: ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1). What does SUM(COUNT(*)) OVER () return for each row?",
      choices: [
        "The group's own count — 52 for front-paged",
        "The grand total across groups — 103",
        "An error — aggregates can't nest",
        "NULL — the frame is empty",
      ],
      answer: 1,
      why: "The window runs over the grouped counts: every row sees the sum of all four stage counts, 103 — which is what makes each row's share a share of the whole funnel rather than of itself.",
      notes: [
        { choice: 0, why: "That's bare COUNT(*). The OVER () frame is the whole partition — every group's total, not the row's own." },
        { choice: 2, why: "SQLite nests group aggregates inside window aggregates by design — this is the canonical share-of-total shape." },
        { choice: 3, why: "An empty frame would mean a partition with no groups — with four stages folded, the frame holds 103." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-15",
      prompt: "Growth diffs two audience sets: this month's posters EXCEPT last month's — the new-poster read. Which statement about EXCEPT is true?",
      choices: [
        "It keeps duplicate rows from the left side",
        "It removes duplicates before comparing — set semantics",
        "It requires identical column names on both sides",
        "It is always faster than NOT EXISTS",
      ],
      answer: 1,
      why: "EXCEPT is set math: both sides are deduped, then the remainder is returned — 'distinct posters this month who were not distinct posters last month', which is exactly the new-poster grain.",
      notes: [
        { choice: 0, why: "Duplicates survive EXCEPT ALL — which SQLite doesn't offer; plain EXCEPT folds them." },
        { choice: 2, why: "Names are free — positions and types are the contract; 'SELECT id' can sit against 'SELECT author'." },
        { choice: 3, why: "'Always faster' is the tell of someone who hasn't profiled — index geometry decides, and correlated NOT EXISTS often wins." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-16",
      prompt: "The digest UNIONs 'front-paged' and 'high-karma' post lists — a post qualifying for both should appear twice. Which operator shipped, and what should it be?",
      choices: [
        "UNION shipped; UNION ALL was meant",
        "UNION ALL shipped; UNION was meant",
        "INTERSECT shipped; EXCEPT was meant",
        "The ORDER BY collapsed the rows",
      ],
      answer: 0,
      why: "UNION dedupes whole rows — the double-qualified post appears once and the overlap signal the digest existed to surface is silently gone. UNION ALL preserves both rows.",
      notes: [
        { choice: 1, why: "Reversed: UNION ALL appends everything — it can't be the operator that lost a row." },
        { choice: 2, why: "INTERSECT keeps only posts in BOTH lists — the opposite cut entirely." },
        { choice: 3, why: "ORDER BY sorts; it never dedupes — the collapse happened at the set operator." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-17",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) prints 2.98. Which population does that average cover?",
      choices: [
        "All 103 posts",
        "The 82 stamped posts — NULLs are ignored",
        "The 21 unstamped posts",
        "Whichever rows the frame includes",
      ],
      answer: 1,
      why: "Unstamped posts produce NULL diffs and AVG skips NULLs entirely — 2.98 is the average climb of promoted posts. Pairing the AVG with a COUNT over the same predicate prints the coverage: 82 of 103.",
      notes: [
        { choice: 0, why: "That's the silent drift — the 21 unstamped contribute nothing, so the average runs over 82, not 103." },
        { choice: 2, why: "The unstamped posts are excluded, not averaged — a '0-day climb' fill would drag the mean down and lie differently." },
        { choice: 3, why: "No frame here — the exclusion lives in the NULL skips, which is exactly what the COUNT beside it exposes." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-18",
      prompt: "Running karma: SUM(total) OVER (PARTITION BY author ORDER BY created_at). Two posts share a timestamp. What does the default frame do?",
      choices: [
        "Splits the tie arbitrarily",
        "Folds peers — both rows print the same running total",
        "Errors on the duplicate ORDER BY value",
        "Follows the index order",
      ],
      answer: 1,
      why: "The default frame is RANGE … CURRENT ROW, which includes PEERS — rows sharing the ORDER BY value. Both same-stamp posts jump to the same cumulative figure, and the intermediate step never appears on the chart.",
      notes: [
        { choice: 0, why: "Deterministic, not arbitrary — peers fold together every time; that determinism is what makes the plateau a lie rather than noise." },
        { choice: 2, why: "Perfectly legal SQL — the frame absorbs the tie instead of rejecting it." },
        { choice: 3, why: "Index order isn't semantics — the frame definition is, and the fix is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-19",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'held') — a teammate invented a 'held' stage, so the inner query is empty. What does the outer query return?",
      choices: [
        "An error — empty subqueries are illegal",
        "No rows — the scalar is NULL and total > NULL is UNKNOWN",
        "Every row — NULL reads as no filter",
        "Only rows with NULL total",
      ],
      answer: 1,
      why: "An empty scalar subquery returns NULL, and any comparison with NULL is UNKNOWN — every row fails the WHERE silently. The typo doesn't crash, doesn't warn; it just empties the report.",
      notes: [
        { choice: 0, why: "Legal SQL, silently empty — that's what makes this the classic production ghost." },
        { choice: 2, why: "NULL isn't 'no filter' — UNKNOWN rows never survive a WHERE, whichever way the reader wishes it worked." },
        { choice: 3, why: "NULL totals compare UNKNOWN too — but the log has none; the whole 103-row population drops." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-20",
      prompt: "The cadence rewrite uses julianday(created_at) - julianday(LEAD(created_at) OVER (PARTITION BY author ORDER BY created_at)). What sign are the gaps?",
      choices: [
        "Positive — same as LAG",
        "Negative — LEAD fetches the next post, so current minus next is below zero",
        "NULL on every row without PARTITION BY",
        "Zero except at partition edges",
      ],
      answer: 1,
      why: "LEAD points forward: the fetched timestamp is the NEXT post's, so current minus next is negative — and MAX over negatives returns the least-negative value, so the board reports the shortest gap as the 'longest silence'. The fix is LAG, or flipping the subtraction.",
      notes: [
        { choice: 0, why: "Positive gaps are LAG's geometry — LAG fetches the previous post, so current minus previous is the forward gap." },
        { choice: 2, why: "LEAD is legal bare; NULLs appear only on each partition's last row — the open silences." },
        { choice: 3, why: "Zero needs an exact timestamp collision; the real failure is the sign, and it corrupts every row." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-21",
      prompt: "The never-posted author census: customers LEFT JOIN orders … WHERE o.id IS NULL. On this db, what returns?",
      choices: [
        "2 — the one-post authors",
        "0 — every author has posted",
        "16 — the full author count",
        "NULL — the join found nothing",
      ],
      answer: 1,
      why: "The anti-join returns zero rows: all 16 redditors have at least one post. The shape still ships — the day a ghost account appears, the query is already written and the count moves off zero.",
      notes: [
        { choice: 0, why: "One-post authors are the opposite end: they HAVE posted once. The anti-join counts authors with none — zero here." },
        { choice: 2, why: "16 is the author population — the census exists to find the gap in it, and the gap is empty." },
        { choice: 3, why: "A zero-row result set, not a NULL — and zero is a finding, not an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-22",
      prompt: "COUNT(DISTINCT c.region) over the 103-post log returns — ?",
      choices: ["103", "16", "4", "2"],
      answer: 2,
      why: "Four tracked cohort shards — EU, APAC, US, LATAM. The distinct-count folds 103 post rows (and 16 authors) down to the four communities the boards read.",
      notes: [
        { choice: 0, why: "103 is the post count — DISTINCT region folds far below it." },
        { choice: 1, why: "16 is the author count — a different fold again; three counts, three grains." },
        { choice: 3, why: "2 is LATAM's post count — one region's load, not the cohort universe." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-23",
      prompt: "Community keys arrive as 'r/AskReddit', 'askreddit', ' AskReddit '. Which expression makes them join-safe?",
      choices: [
        "UPPER(TRIM(key))",
        "LOWER(TRIM(REPLACE(key, 'r/', '')))",
        "SUBSTR(key, 1, 3)",
        "key || ''",
      ],
      answer: 1,
      why: "Trim the whitespace, strip the 'r/' prefix, lower the case — one pass leaves every spelling as the same key, and the join matches what the display keeps distinct.",
      notes: [
        { choice: 0, why: "UPPER normalizes case but keeps the prefix — 'R/ASKREDDIT' still isn't 'ASKREDDIT'." },
        { choice: 2, why: "That slices off the first three characters as the key — every community's key becomes 'r/A'." },
        { choice: 3, why: "Concatenating an empty string changes nothing — the fan-out and the misses survive intact." },
      ],
      difficulty: "easy",
    },
    {
      id: "rdt-mcq-24",
      prompt: "A filter excludes watchlisted authors: WHERE author NOT IN (SELECT author FROM watchlist). The watchlist carries one row with a NULL author. What returns?",
      choices: [
        "Everything except the watchlisted authors",
        "Nothing — NOT IN with a NULL never matches",
        "Only the NULL-author rows drop",
        "An error — NOT IN rejects NULL lists",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) is never TRUE: the NULL member makes every comparison UNKNOWN, so the WHERE discards every row. The fix is NOT EXISTS, or an explicit WHERE author IS NOT NULL on the inner query.",
      notes: [
        { choice: 0, why: "That's the intended read — and the silent-empty reality is the most-shipped NOT IN bug in the wild." },
        { choice: 2, why: "The NULL doesn't poison just its own row — it poisons every comparison against the list." },
        { choice: 3, why: "Perfectly legal SQL; the list just behaves like a set nobody can be provably outside of." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-25",
      prompt: "Keep-latest dedupe over the restated comment log: ROW_NUMBER() OVER (PARTITION BY comment_id ORDER BY ingested_at DESC) AS rn. Which filter keeps the newest restatement?",
      choices: ["rn = 1", "rn = COUNT(*)", "rn IS NULL", "rn > 1"],
      answer: 0,
      why: "DESC puts the newest ingest first, so rn = 1 is the latest restatement per comment — the winner the boards fold. rn = 2..n are the older versions the dedupe exists to retire.",
      notes: [
        { choice: 1, why: "COUNT(*) isn't in scope per row — and even read as partition size, size isn't recency." },
        { choice: 2, why: "ROW_NUMBER never returns NULL — every partition row gets a position." },
        { choice: 3, why: "rn > 1 keeps exactly the STALE restatements — the dedupe inverted." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-26",
      prompt: "An open advertiser invoice reads 19609 (integer cents). Which read prints 196.09 dollars?",
      choices: [
        "amount / 100",
        "amount / 100.0",
        "ROUND(amount / 100)",
        "SUBSTR(amount, 3)",
      ],
      answer: 1,
      why: "The .0 promotes to real division: 196.09. amount / 100 is integer division — 196 — and the leak compounds across every odd-cent row of a 28-invoice ledger.",
      notes: [
        { choice: 0, why: "Integer division truncates to 196 — the classic cents leak, invisible until invoices reconcile short." },
        { choice: 2, why: "Rounds the already-truncated integer — still 196, and the rounding hides that the truncation happened first." },
        { choice: 3, why: "String surgery on a number — '609', neither cents nor dollars, and downstream arithmetic chokes on it." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-27",
      prompt: "A window query carries ORDER BY created_at inside OVER(…) and ORDER BY max_gap DESC outside. Which clause orders the final result set?",
      choices: [
        "The window's ORDER BY",
        "The outer ORDER BY — the window's only feeds the frame",
        "Both, interleaved",
        "Neither — engine choice",
      ],
      answer: 1,
      why: "The window ORDER BY defines each partition's row sequence for the window computation (and the frame); the outer ORDER BY orders the output rows. The last word on display order is always the outer clause.",
      notes: [
        { choice: 0, why: "Common confusion — the window order governs LAG/LEAD and frame math inside the computation, then evaporates." },
        { choice: 2, why: "They govern different layers and don't interleave — outer wins for output." },
        { choice: 3, why: "SQL defines this: with no outer ORDER BY the output order is engine-dependent, but with one present, it's authoritative." },
      ],
      difficulty: "medium",
    },
    {
      id: "rdt-mcq-28",
      prompt: "The fate census groups by a CASE alias. A teammate labels the delivered arm 'climbing' too. What happens?",
      choices: [
        "Nothing — labels are cosmetic",
        "The two stages fold into one row — 82 posts, shares re-normalized over a three-stage funnel",
        "The query errors on the duplicate label",
        "The removed count doubles",
      ],
      answer: 1,
      why: "GROUP BY folds on the computed label, so delivered (52) and shipped (30) merge into one 'climbing' row of 82 — the census prints three stages whose shares still sum to 100 over the wrong population.",
      notes: [
        { choice: 0, why: "The label IS the group key here — relabeling is refolding, not restyling." },
        { choice: 2, why: "Duplicate display labels are legal SQL; the fold happens quietly instead." },
        { choice: 3, why: "Nothing doubles — rows merge, and the missing stage is the tell the audit catches." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-29",
      prompt: "NTILE(4) OVER (ORDER BY karma DESC) splits the above-bar posts into quartiles. For a 103-post population, the tile sizes are — ?",
      choices: [
        "26 / 26 / 26 / 25",
        "25 / 25 / 25 / 28",
        "34 / 34 / 35",
        "An error — 103 isn't divisible by 4",
      ],
      answer: 0,
      why: "NTILE distributes as evenly as possible and hands the remainder to the LEADING tiles: 103 = 3×26 + 25, so 26, 26, 26, 25 — the top quartile is the fullest.",
      notes: [
        { choice: 1, why: "Remainder-first is the rule — the tail tile is the thin one, not the head." },
        { choice: 2, why: "That's NTILE(3) arithmetic — the tile count changed, not just the sizes." },
        { choice: 3, why: "Remainders are NTILE's whole job — non-divisible counts are the normal case." },
      ],
      difficulty: "hard",
    },
    {
      id: "rdt-mcq-30",
      prompt: "Per-author average karma beside every post: a correlated scalar subquery vs AVG(total) OVER (PARTITION BY author). Which is true?",
      choices: [
        "They can disagree when an author has one post",
        "Same numbers — but the window computes all authors in one pass",
        "The window requires a GROUP BY to work",
        "The correlated version is always faster",
      ],
      answer: 1,
      why: "Both fold to the same per-author average — AVG semantics, NULLs ignored, the one-post author's average is their own post in both shapes. The difference is execution: the correlated fold re-runs per outer row; the window makes one pass over the whole log.",
      notes: [
        { choice: 0, why: "The one-post case agrees in both — average of one post is that post; the divergence claim is the trap." },
        { choice: 2, why: "Windows and GROUP BY are independent — no GROUP BY is wanted here, the rows must survive." },
        { choice: 3, why: "'Always faster' is the lie — at 16 authors both are instant; at Reddit scale the per-row re-execution is the correlated cost." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-rdt-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The subreddit cohort health board",
      brief:
        "Community-ops memo, Monday: the cohort health board reads subreddits the way Reddit's growth desk reads communities — posts, distinct authors and karma per cohort, with a sampling floor so a 2-post shard stops impersonating a trend. The db mapping is declared: orders are posts, orders.total is karma earned, customers are redditors, and regions are the four tracked subreddit cohorts. Probed facts: 103 posts from 16 authors; the biggest cohort shows 45 posts from 8 authors worth 15,089.23 karma (335.32 per post), then 37 posts / 5 authors / 11,605.45, and 19 posts / 2 authors / 7,286.16 — while the floor's job is the 2-post, 1-author shard at 852.44. The board's rule: cohorts must clear a 19-post volume floor.",
      ask: "Return each cohort clearing the 19-post floor with post count, distinct authors, total karma (2 decimals) and karma per post (2 decimals), biggest karma first.",
      template:
        "SELECT c.region AS subreddit,\n       COUNT(*) AS posts,\n       COUNT(DISTINCT o.customer_id) AS authors,\n       ROUND(SUM(o.total), 2) AS karma,\n       ROUND(AVG(o.total), 2) AS avg_karma\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {1}\nHAVING COUNT(*) >= {2}\nORDER BY karma {3};",
      slots: [
        {
          answer: "c.region",
          kind: "keyword",
          label: "the cohort key",
          why: "GROUP BY c.region folds posts into the four subreddit cohorts the board reads. Grouping on c.id makes every author their own cohort (16 shards of one person); grouping on o.status folds by post fate — a moderation census, not a community one.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the sampling floor",
          why: "The memo fixes the board's volume floor at 19 posts — cohorts below it stay off the trend lines because a 2-post, 1-author shard makes every average a single anecdote. 20 would drop the 19-post cohort too; 30 would leave one cohort standing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-karma-first direction",
          why: "The board leads with the heaviest karma earner — 15,089.23 on top. ASC would open the review with the smallest cohort, a correct query answering the opposite question, and the exact mistake a rushed ORDER BY makes.",
        },
      ],
      distractors: ["c.id", "o.status", "20", "30", "ASC"],
      walkthrough:
        "One join, one fold, one floor — and the floor is where the analytics lives. The join attaches each of the 103 posts to its author's cohort; GROUP BY c.region folds them into four shards; the three folds answer three different questions — COUNT(*) is posts (45, 37, 19, 2), COUNT(DISTINCT o.customer_id) is authors (8, 5, 2, 1), ROUND(SUM(o.total), 2) is karma (15,089.23, 11,605.45, 7,286.16, 852.44). HAVING COUNT(*) >= 19 is the sampling decision: LATAM's 2 posts from 1 author drop, and the walkthrough says so — the floor exists so a single author's week can't masquerade as a community trend. DESC puts the 15,089.23 cohort on top, avg_karma beside it (335.32 / 313.66 / 383.48 — note the 2-author cohort posts heaviest per post). The distractors break exactly where the craft lives: c.id shatters the board into 16 one-person cohorts, o.status re-folds the same rows into a fate census, 20 silently drops the 19-post cohort, 30 reduces the board to one line, and ASC inverts the read. Count per WHAT, floor at WHAT, biggest first — the board is the briefing.",
    },
    {
      id: "cs-rdt-2",
      tier: "hard",
      topic: "t5",
      universe: "catalog",
      title: "The upvote leaderboard and the tie gap",
      brief:
        "Product-analytics memo: the discovery team ranks threads by comment upvotes for the weekly highlight rail, and the tie behavior at the boundary is the deliverable, not an edge case. The db mapping is declared: order_items are comment events, quantity is the upvote batch carried per comment, products are threads, and product categories are the seven content verticals. Probed facts: 251 comment events across 103 posts; the upvote census reads 47, 46, 38 for the top three threads, then a tie — 36 and 36 — with the next thread at 33. The rail asks for the top 6 by RANK: the tie occupies ranks 4 and 4, so the sixth row carries rank 6 and rank 5 simply doesn't exist — the leaderboard shows the gap or it lies.",
      ask: "Return the top 6 threads by total comment upvotes: thread name, vertical, upvote count and upvote rank — rank order, ties sharing a rank with a gap after.",
      template:
        "SELECT p.name AS thread,\n       p.category AS vertical,\n       SUM(oi.quantity) AS upvotes,\n       {1}() OVER (ORDER BY SUM(oi.quantity) {2}) AS upvote_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nORDER BY upvote_rank\nLIMIT {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-preserving rank",
          why: "RANK gives the tied 36s both rank 4 and hands the 33 rank 6 — the gap counts how many threads sit ahead, which is what a public leaderboard owes its readers. DENSE_RANK would print 5 and hide the tie's cost; ROW_NUMBER would split the tie by engine whim.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-upvoted-first direction",
          why: "A leaderboard reads best-first: 47, 46, 38, 36, 36, 33 descending. ASC would rank the catalog's loneliest threads — a correct query answering the opposite question, and the exact mistake a rushed window ORDER BY makes.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the rail cut",
          why: "The ask fixes the rail at 6 rows — and the tie makes the cut itself the lesson: six rows carry ranks 1, 2, 3, 4, 4, 6, so the number 6 appears as a rank cell with no rank 5 above it. A cut of 5 would still be inside the tie (1,2,3,4,4); a cut of 3 would miss it entirely.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "5", "3"],
      walkthrough:
        "A fold, a window, a cut — and the tie conversation that makes it a Reddit question. GROUP BY p.id folds each thread's 251-comment-event fan-out into one upvote total (SUM(quantity), since each comment event carries an upvote batch), and RANK() OVER (ORDER BY SUM DESC) stamps the ladder: Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 38, then the tie — Laptop Stand Aluminum and Wireless Mouse M3 both at 36, sharing rank 4 — and Running Socks at 33 wearing rank 6. LIMIT 6 returns six rows whose ranks read 1, 2, 3, 4, 4, 6: the sixth row proves the gap exists, and Accessories owns three of the six slots. The distractors each break a different joint: DENSE_RANK prints 5 after the tie and erases the hole the leaderboard exists to show; ROW_NUMBER splits the tie arbitrarily — one 36 is '4th' by engine luck; ASC serves the least-upvoted threads; 5 truncates mid-tie; 3 never reaches it. When a tie straddles the cut, LIMIT stops being the answer — RANK plus a rank filter and a stated definition of what the rail owes a tied thread.",
    },
    {
      id: "cs-rdt-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The comeback-gap board",
      brief:
        "Community-health memo: churn in communities is silence, and the growth desk wants the silence measured. The db mapping is declared: orders are posts, created_at is the post stamp, customers are redditors, and the gap is the distance between an author's consecutive stamps. Probed facts: 103 posts from 16 authors spanning 2024-01 through 2025-02 — one author posts 24 times, two post exactly once, and the repeat-poster census is what the floor rule leans on. The board only trusts a posting habit: authors with at least 3 posts qualify, so a two-data-point anecdote can't headline the churn read. The deliverable is each qualifying author's longest silence, in days, longest first, top 5.",
      ask: "Return the five longest silences among authors with 3 or more posts: author, post count, longest gap in days (2 decimals), longest first.",
      template:
        "SELECT c.name AS author,\n       COUNT(*) AS posts,\n       ROUND(MAX(g.gap), 2) AS max_gap_days\nFROM (SELECT o.customer_id AS cid,\n             julianday(o.created_at) - julianday({1}(o.created_at) OVER (PARTITION BY o.customer_id ORDER BY o.created_at, o.id)) AS gap\n      FROM orders o) g\nJOIN customers c ON c.id = g.cid\nGROUP BY g.cid\nHAVING COUNT(*) >= {2}\nORDER BY max_gap_days {3}\nLIMIT {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward look",
          why: "LAG fetches the PREVIOUS stamp, so current minus previous is a positive forward gap — the silence behind each post. LEAD points the other way and turns every gap negative, and MAX over negatives hands the board the least-silent moment as the 'longest silence'.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the posting-habit floor",
          why: "The memo fixes the habit floor at 3 posts: 11 of 16 authors qualify, and the board keeps authors whose silence pattern is a track record. A floor of 2 admits the one-gap anecdotes; 5 drops the 3-post author holding the board's top gap entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the longest-first direction",
          why: "The board leads with the deepest silence — the churn read opens on the author who went quiet longest. ASC would open on the shortest gaps, a churn board that reads like a loyalty report — a correct query answering the opposite question.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the board cut",
          why: "The ask fixes the board at five rows. A cut of 2 is a headline without a distribution; 10 is a wall nobody screens.",
        },
      ],
      distractors: ["LEAD", "ROW_NUMBER", "2", "10", "ASC"],
      walkthrough:
        "Stage, fold, floor, cut — the t7 shape with a governance rule on top. The derived table walks each author's partition in stamp order and computes the gap to the previous post (LAG; the partition's first row is NULL and MAX ignores it); GROUP BY folds to one row per author; the HAVING floor keeps the 11 authors with 3+ posts. The board reads: Hiro Tanaka, 3 posts, 299 days silent; Keiko Sato, 4 posts, 241; Noah Meyer, 155; Pedro Alvarez, 130; Maya Patel, 13 posts, 120 — a power poster with a 120-day hole in the middle of her log, which is exactly the story the floor exists to keep on the board. The distractors break where the craft lives: LEAD inverts the geometry, every gap goes negative, and MAX serves the least-silent moment as the 'longest silence'; ROW_NUMBER subtracts row indices from julian days; a floor of 2 admits Jamal Wright's 129-day, two-data-point anecdote at rank 5; a floor of 10 keeps only the marathoners and drops the 299; and ASC opens the churn board on the habit stars.",
    },
    {
      id: "cs-rdt-4",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The fate census, labeled",
      brief:
        "Mod-ops memo: the vote funnel ships to the dashboard with stage labels the community teams actually read — front-paged, climbing, in-new, removed — and the census must reconcile: counts sum to 103, shares to 100. Probed facts: 52 posts landed (delivered), 30 are climbing (shipped), 14 sit in-new (pending), 7 were removed (cancelled) — 50.5 / 29.1 / 13.6 / 6.8 percent. The ELSE arm is the exhaust stage: it must catch removed, the fate that ends the funnel, or two stages silently merge. Shares print at one decimal — the facts-file precision — and the board reads biggest stage first.",
      ask: "Return the four post fates with post counts and share of all posts (1 decimal), biggest stage first.",
      template:
        "SELECT CASE o.status\n         WHEN 'delivered' THEN '{1}'\n         WHEN 'shipped' THEN 'climbing'\n         WHEN 'pending' THEN 'in-new'\n         ELSE '{2}'\n       END AS fate,\n       COUNT(*) AS posts,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), {3}) AS share_pct\nFROM orders o\nGROUP BY fate\nORDER BY posts {4};",
      slots: [
        {
          answer: "front-paged",
          kind: "keyword",
          label: "the delivered stage's label",
          why: "The mapping fixes delivered = front-paged — the fate that finished the climb. Label it 'climbing' or 'in-new' and two stages share one label: GROUP BY folds them into a single 82- or 66-post row and the funnel loses a stage while its shares still read 100.",
        },
        {
          answer: "removed",
          kind: "keyword",
          label: "the ELSE exhaust stage",
          why: "ELSE catches cancelled — the 7 removed posts that end the funnel. Pointing ELSE at a surviving label merges the exhaust into it: 'climbing' folds cancelled into shipped's 30, 'in-new' folds it into pending's 14, and the removed stage vanishes from the census.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "One decimal matches the facts-file shares: 50.5 / 29.1 / 13.6 / 6.8. Two decimals prints 50.51 — display drift the dashboard spec doesn't carry; zero rounds the census to integers and 6.8 becomes 7.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-stage-first direction",
          why: "The board opens on the 52-post front-paged stage. ASC opens on the 7-post removed stage — a correct query answering the opposite question, and the exact mistake a rushed ORDER BY makes.",
        },
      ],
      distractors: ["climbing", "in-new", "pending", "ASC", "2", "0"],
      walkthrough:
        "One fold, four branches, one denominator. The CASE relabels each status into dashboard language; GROUP BY fate folds the 103 posts into four stages; SUM(COUNT(*)) OVER () carries the grand total into every row so each share is a share of the whole funnel. DESC orders the read: front-paged 52 (50.5), climbing 30 (29.1), in-new 14 (13.6), removed 7 (6.8) — the shares sum to 100 because the four branches partition the population. The distractors each commit a different census crime: 'climbing' in the delivered arm folds 52 + 30 into one 82-post stage — a three-row funnel whose shares still reconcile, which is what makes it dangerous; 'in-new' folds 52 + 14; 'pending' in the ELSE arm doesn't collide but renames the exhaust stage, so the mod queue reads a funnel with no removed stage; 'climbing' or 'in-new' in the ELSE arm collides outright; 2 prints 50.51 and 0 prints 50; ASC inverts the read. The label is the group key here — relabeling is refolding.",
    },
    {
      id: "cs-rdt-5",
      tier: "hard",
      topic: "q2",
      universe: "fraud",
      title: "The karma outlier screen",
      brief:
        "Trust-and-safety memo: vote-manipulation screens start where the distribution ends — posts whose karma clears the site bar. The bar is the site-wide average karma per post, 338.19, computed inside the query and printed beside every row so the board always shows the line it draws. Probed facts: 103 posts averaging 338.19 karma, the heaviest at 1,088.44. The screen returns the heaviest qualifiers first, cut at ten rows for the human review queue; every returned row carries the bar in its own cells, so a reviewer can check each post against the line without a second query.",
      ask: "Return posts whose karma clears the site-average bar: post id, author, karma (2 decimals) and the site average beside it, heaviest first, top 10.",
      template:
        "SELECT o.id AS post_id,\n       c.name AS author,\n       ROUND(o.total, 2) AS karma,\n       COUNT(*) OVER () AS qualifiers,\n       (SELECT ROUND({1}(total), 2) FROM orders) AS site_avg\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > {2}\nORDER BY karma {3}\nLIMIT {4};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the bar's own fold",
          why: "The bar is the MEAN: AVG(total) over all 103 posts folds to 338.19. SUM prints 34,833.28 as the 'average' and COUNT prints 103 — either way the board carries a bar that isn't a central tendency and every row self-contradicts.",
        },
        {
          answer: "338.19",
          kind: "number",
          label: "the site-average bar",
          why: "The threshold is the site average to two decimals — and the query prints it in site_avg, with the qualifier census beside it. A bar of 400 drops the queue to 34 qualifiers, 300 inflates it to 49: the bar's own consequences print on every row, so the drift is visible, not silent.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "A review queue starts at the worst offender: 1,088.44 on top. ASC serves the bottom of the qualifier list — the mildest cases first, a triage inversion nobody asked for.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the review-queue cut",
          why: "The memo fixes the queue at ten rows for the human review pass. Five truncates before Emma Wilson's third entry; twenty is a meeting, not a queue.",
        },
      ],
      distractors: ["SUM", "COUNT", "400", "300", "ASC", "1000"],
      walkthrough:
        "A scalar subquery as a threshold, and the threshold printed as a receipt. The inner fold runs once: AVG(total) over all 103 posts is 338.19, the outer WHERE keeps the posts above it — 42 of 103, the top two-fifths of the log — and COUNT(*) OVER () prints that census on every row. DESC + LIMIT 10 serves the queue: post 74, Farid Nasser, 1,088.44; then 945.21 (Chloe Dubois), 845.92, 785.79 and 725.34 — Emma Wilson lands three of the ten — and rank 10 sits at 705.23 with 684.53 next, so the cut is clean, no tie straddles it. The distractors each break a different joint: SUM puts 34,833.28 in the bar column of every row; COUNT puts 103 there — a population wearing an average's name; 400 drops the qualifier census to 34 with the same top rows — the board now lies about how many posts it screened; 300 inflates it to 49; a bar of 1000 leaves one lonely qualifier; ASC serves the mildest offenders. Printing site_avg and qualifiers beside every row is the discipline: the bar and its reach travel with the result, so the board can't silently change definitions.",
    },
    {
      id: "cs-rdt-6",
      tier: "medium",
      topic: "x2",
      universe: "month-close",
      title: "The one-scan close census",
      brief:
        "Month-close memo: the close checklist wants the community period census in ONE scan — four counters, zero sequential passes, because the close runs this fold against every board the desk owns. The db mapping is declared: orders are posts, shipped_at is the front-page promotion stamp. Probed facts: 103 posts placed; 82 carry a promotion stamp (52 delivered plus 30 shipped by status — the two censuses must agree); the average stamp-to-post latency is 2.98 days; and the close flags slow promotions past a 3.5-day bar. One row, four numbers, one pass — and the counters must reconcile against the status census or the close doesn't sign.",
      ask: "Return one row: total posts, stamped promotions, average promotion days (2 decimals) and promotions slower than 3.5 days.",
      template:
        "SELECT COUNT(*) AS posts,\n       COUNT(*) FILTER (WHERE g.stamp IS NOT NULL) AS promoted,\n       ROUND({2}(julianday(g.stamp) - julianday(g.created)) FILTER (WHERE g.stamp IS NOT NULL), 2) AS avg_days,\n       COUNT(*) FILTER (WHERE julianday(g.stamp) - julianday(g.created) > {3}) AS slow_promotions\nFROM (SELECT o.created_at AS created, o.{1} AS stamp FROM orders o) g;",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the promotion stamp column",
          why: "The stamp is shipped_at — non-NULL on exactly the 82 posts that entered the pipeline. created_at is never NULL: the promoted counter would read 103 and the latency math would subtract a date from itself, 0.0 days — a census declaring instant promotion.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the latency fold",
          why: "The close wants the AVERAGE climb: 2.98 days over the stamped posts. MAX returns 4.0 — the worst day wearing an average's name; SUM returns 244 — cumulative days, not a latency.",
        },
        {
          answer: "3.5",
          kind: "number",
          noVerify: true,
          label: "the slow-promotion bar",
          why: "The memo fixes the slow lane at 3.5 days: 25 promotions clear it and get flagged for the close. A bar of 0 flags all 82 — the whole pipeline 'slow'; 2.5 flags 55, more than double the true queue.",
        },
      ],
      distractors: ["created_at", "status", "MAX", "SUM", "0", "2.5"],
      walkthrough:
        "One pass, four counters, one receipt. The derived table stages created_at and the stamp once; COUNT(*) counts the 103 posts; the first FILTER branch counts the 82 stamped (52 delivered + 30 shipped by status — the stamp census and the status census must agree, and they do); the AVG over the same FILTER predicate folds 2.98 days, skipping the 21 unstamped NULL diffs, which is why the FILTER clause repeats on both branches — same population, stated twice on purpose; the slow lane counts 25 promotions past the 3.5-day bar. The distractors each break a different joint: created_at makes every post 'promoted' with 0.0-day latency — a census declaring a perfect instant pipeline; status feeds text into julianday, which returns NULL, and the census collapses to zeros and a NULL average; MAX reports 4.0, the worst day; SUM reports 244, cumulative days in an average's clothing; 0 flags all 82 as slow; 2.5 flags 55. The close signs because the numbers reconcile: 82 + 21 = 103, and the branch counts sum to the whole.",
    },
  ],

  problems: [
    { slug: "reported-posts", why: "Reddit's tagged mod census: reports per post per day with the removal flag read beside it — the moderation-queue fold this kit's fate census generalizes." },
    { slug: "number-of-comments-per-post", why: "Reddit's tagged threading drill: comment counts per post across two tables without fanning the post grain — the depth grammar of the comment-tree self-join." },
    { slug: "reported-posts-ii", why: "Reddit's tagged ratio read: reported share per day with the denominator choice as the whole test — the mod-analytics rate where per-post and per-removal diverge." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly active census: posts AND distinct authors per month, side by side — the engagement board's opening fold, grain stated for both counts." },
    { slug: "percentage-of-users-attended-a-contest", why: "Participation share of a cohort that showed up at least once — the subreddit-activation rate where the denominator is every eligible author, not the eager ones." },
    { slug: "classes-more-than-5-students", why: "The cohort-size gate: groups clearing a threshold — the HAVING floor this kit's case study ships, drilled in its cleanest form." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The power-poster argmax: which author carries a cohort — the concentration read behind the karma-concentration metric, with tie handling." },
    { slug: "tree-node", why: "Root, leaf or inner node per row — reply-tree classification in miniature: top-level posts, conversation starters, and the chains beneath them." },
    { slug: "second-degree-follower", why: "Second-degree reach in a follow graph — the community-discovery read: who's one hop from whom, and why the feed cares." },
    { slug: "queries-quality-and-percentage", why: "Two ratios folded in one pass with the 100.0-before-division fix — the honest-denominator muscle behind every moderation rate Reddit ships." },
    { slug: "biggest-window-between-events", why: "LEAD's finest hour: the longest silence per author — the cadence metric's forward twin, pointing the lookback past the last post." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,2,3,4,4,6 pattern said out loud before any leaderboard ships to the front page." },
    { slug: "the-most-recent-three-orders", why: "Per-author latest-3 via partitioned ROW_NUMBER — the 'recent posts' rail with a depth cut and a deterministic tie-break." },
    { slug: "dormant-reactivation", why: "NOT EXISTS over a reactivation window — the lurker-winback variant of the silence read, pointed at who's worth a notification." },
    { slug: "second-most-recent-activity", why: "The second-most-recent post per author — the argmax grammar with its famous one-activity edge case, drilled before the follow-up asks for it." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status-conditional count alongside — the engagement calendar the trend walk opens with, '%Y-%m' and all." },
    { slug: "daily-leads-and-partners", why: "The two-grain daily census: posts AND distinct authors per day, side by side — the DAU-style board the engagement walk opens with, both grains stated before any share." },
    { slug: "game-play-analysis-i", why: "Each author's first post — the acquisition read: when a redditor entered the community and which cohort they landed in. Earliest-activity argmax at its cleanest." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest activity per thread — the 'last comment' rail. Per-group argmax over the comment-event log; the query that decides which threads look alive on the front page." },
    { slug: "customers-who-bought-all-products", why: "Authors present in every tracked vertical — the superfan census. A double-NOT-EXISTS (or COUNT DISTINCT fold) that returns quietly empty on this db, and knowing why is the point." },
    { slug: "restaurant-growth", why: "Rolling 7-day average karma — the smoothed growth curve leadership reads instead of the spiky daily one. A window running average over the post log's 14 months." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU — THE stickiness metric. The ratio's two populations must come from the same window or it invents engagement; computing it without drift is the drill." },
    { slug: "rolling-7d-actives", why: "The rolling actives spine — a 7-day window over the activity log that feeds every trend line on the community board, boundary days named." },
    { slug: "cohort-retention-matrix", why: "The retention grid: author cohorts by first-post month, active in each later month — the census that separates a healthy subreddit from a churn-and-replace machine." },
    { slug: "growth-accounting", why: "New, returning and churned authors per month — the accounting identity every growth deck reconciles to. The parts must sum to the population or a cohort leaked." },
    { slug: "find-trending-hashtags", why: "Trending terms over a window — the discovery read. Rate-of-rise over raw volume: a term can be big without trending, and the window math separates them." },
    { slug: "find-bursty-behavior", why: "Bursty posting detection — the brigade-and-spam signal. Authors whose posting rate spikes past their own baseline, flagged before the front page amplifies them." },
    { slug: "human-traffic-of-stadium", why: "Consecutive-day streaks of 3 or more — the habit streak read. Gaps-and-islands over posting days: who shows up daily, and when the streak broke." },
    { slug: "not-boring-movies", why: "The mod-queue triage warm-up: filter on a flag, exclude a term, order by a rating — WHERE/ORDER BY discipline on a catalog the queue reads from." },
    { slug: "top-percentile-fraud", why: "Percentile flagging with NTILE — the trust-and-safety cut: posts above the kth percentile of report counts go to human review. Tile arithmetic on a non-divisible population included." },
    { slug: "sessionize-events", why: "Sessionization: comment events stitched into visits by inactivity gaps — the read that turns the raw event log into sessions the funnel can fold. LAG, gaps, and a stated timeout." },
    { slug: "median-time-to-convert", why: "Median time from first post to first promotion — the latency median beside the 2.98-day mean, because a skewed tail makes the mean lie. Percentile math over the promotion pipeline." },
  ],
};
