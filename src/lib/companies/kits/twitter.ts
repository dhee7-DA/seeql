// X (Twitter) — kit 11 of the Streaming & Social domain (wave-6, batch C).
// The timeline company: impression funnels, viral cascades (fan-out) and ad
// delivery at firehose scale. Pool provenance: Twitter carries exactly 1
// tagged sql row (invalid-tweets | SQL · Strings) — it leads the problem pool
// and anchors the text-ops topic; the other 15 problem slots + 29 topic slugs
// are theme-curated from the SQL band's feed/ads/graph-shaped problems
// (stated per spec, far below the 16-problem bar). Case studies run on
// db/custom.db with probed figures from scripts/company-facts.md, mapped as:
// orders = tweets, customers = author accounts, regions = audience cohorts,
// order total = impressions per tweet, order status = tweet lifecycle
// (delivered = timeline-delivered, shipped = cascading via fan-out,
// pending = queued by scheduler, cancelled = deleted/withdrawn),
// order_items = engagement-event batches (likes/RTs/replies; quantity =
// events per batch), shipped_at = fan-out completion stamp, invoices/
// payments = ad campaign billing (INTEGER cents ÷ 100), suppliers = media
// partners, expenses = ad spend. Mappings declared in-world, no invented
// firehose numbers.

import type { CompanyKit } from "../types";

export const twitterKit: CompanyKit = {
  id: "twitter",
  domainId: "media",
  name: "X (Twitter)",
  tagline: "Timelines, virality and ads at firehose scale",
  accent: "text-slate-300",

  brief: [
    "X is the firehose: every second a timeline is rendered, an engagement event lands, a cascade either ignites or dies, and an ad either delivers or doesn't. The unit of analysis is the **tweet**, stamped with an author account, an audience cohort and a lifecycle state — {emerald:timeline-delivered}, {sky:cascading via fan-out}, queued by the scheduler, or {rose:deleted/withdrawn}. Everything the business decides — what trends, which campaigns paced, where inauthentic amplification clusters — hangs on queries that fold engagement batches into tweet lifecycles, lifecycles into **cohort censuses**, and cohorts into the ads ledger. The SQL reality is firehose-shaped: the grain changes three times between raw events and the board, and the candidate who can't say which grain a number is in has already failed the screen.",
    "The data org runs three engines. Feed telemetry folds the engagement log — 251 engagement-event batches against **103 tweets** from 16 author accounts on the audit db — into the impression boards: **338.19 average impressions per tweet**, with the above-bar read deciding what counts as viral. Growth analytics runs the cohort census: tweets and accounts per audience cohort, where *45 tweets from 8 accounts is a different object from 19 from 2* — concentration is the story, not noise. And the ads group reads campaign billing, where amounts are INTEGER cents, `amount_cents / 100.0` is the only legal conversion, and **21 settled campaigns ($66,443.00)** against 6 open ($19,609.00) is the delivery ledger's first line.",
    "Interview screens are funnel- and fan-out-heavy. A typical loop opens with a fold (engagement events per tweet, tweets per cohort), escalates into a **threshold subquery** — which tweets beat the firehose average, computed once over the whole population — and lands on either a **fan-out census** (events and distinct tweets per cohort, ratio computed from the same fold) or an ads pacing read (running spend against a daily budget). The follow-ups are definition probes: *per what?* — events or batches, tweets or accounts, impressions delivered or impressions cascaded. Candidates who narrate the fold-then-join order and keep the denominator stated consistently outperform.",
    "Preparation strategy: this kit leads with **Twitter's one tagged registry problem** (invalid-tweets — the length-validation read behind every compose box) and theme-curates the rest from the SQL band's feed-shaped material: trending-hashtag tokenizers, follower-graph joins, ads performance and pacing, engagement-velocity bursts, experiment-ratio integrity. Then run both case studies on the live storefront db: one rebuilds the {violet:viral-bar census} (a scalar-subquery threshold plus a cohort gate), the other rebuilds the {sky:cascade fan-out census} (a 3-table chain with the ratio computed honestly). The storefront mapping is declared, not hidden — orders are tweets, order totals are impressions, regions are the four audience cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
  ],

  dayInLife: [
    "**07:45 —** The impression board. The analyst opens the morning firehose reads: tweets per cohort, {emerald:timeline-delivered rate} (**52 of 103, 50.5%**), and — the number that gates the day — the **viral bar**: which tweets cleared the **338.19-impression average** overnight. The first query is the threshold read: average computed once over the whole population, then the above-bar census cut by cohort. A cascade igniting before dawn is the day's first fire, and the analyst who can name its cohort and its fan-out — before the growth lead pings — owns the morning.",
    "**10:30 —** Cascade deep work. The growth team wants the **fan-out census** rebuilt: engagement events and DISTINCT tweets per cohort, with the events-per-tweet ratio computed from the same fold so the two columns can never disagree; trust & safety wants the deleted-tweet arm watched (**7 of 103, 6.8%** — withdrawn after delivery, the integrity read); a partner wants reply threads per tweet without the join fanning the tweet columns. Each ask is a fold, a join and an argument about grain — events versus batches, tweets versus accounts. *A fan-out number without its grain is just a bigger number.*",
    "**14:00 —** Ads-delivery stakeholder cycles. The campaign review: **21 campaigns settled for $66,443.00**, 6 open worth $19,609.00, 1 voided at $925.00 — and the rails split (**card 16 payments / $37,364.00** vs wire 11 / $32,248.00) for finance. Pacing gets the running-spend read against daily budgets; the AR side gets the **6 campaigns without any payment ($15,217.00)** flagged, with the **28.4-day average settlement** (13 fastest, 84 slowest) as context. The afternoon's job is closing loops: yesterday's under-paced line becomes next week's bid change, and every number that leaves the desk carries its population with it.",
    "**17:15 —** The writeup ritual. The EOD note is one screen: which cohort moved, which cascade needed a tie-break rule instead of vibes, which ad line breached pacing and why. Query definitions get pinned beside the numbers they produced — the ads team re-runs them blind, so the SQL is the contract. The best-prepared candidate knows the rhythm: X SQL exists to defend **feed stories under firehose stress**, and the threshold subquery plus the fan-out census are the tools the defense is built with.",
  ],

  metrics: [
    { name: "Impressions per tweet", what: "order total as impressions — 338.19 average across the audit window. The firehose's base rate, and the bar every 'viral' claim is measured against." },
    { name: "Viral-bar share", what: "Tweets above the population average — 42 of 103 on the audit db. The threshold read behind every trending board, computed once as a scalar subquery." },
    { name: "Fan-out ratio", what: "Engagement events per tweet — 251 batches against 103 tweets. The cascade's shape read: events without DISTINCT tweets is just volume." },
    { name: "Timeline delivery rate", what: "Delivered tweets ÷ all tweets — 52 of 103 (50.5%). The funnel's headline, with the denominator stated before any share is believed." },
    { name: "Withdrawal rate", what: "Deleted/withdrawn tweets ÷ all tweets — 7 of 103 (6.8%). The integrity arm trust & safety watches, cut by cohort before it's reported." },
    { name: "Ad delivery fill", what: "Campaigns with billing settled — 21 of 28 charges ($66,443.00) against 6 open ($19,609.00) and 1 voided ($925.00). The delivery ledger's census, cents converted at the edge." },
    { name: "Settlement pace", what: "Days from campaign issue to first payment on paid campaigns — 28.4 average, 13 fastest, 84 slowest. The cash-flow read the ads P&L hangs on." },
    { name: "Pacing breach", what: "Running daily spend against budget via a cumulative window — the flag that fires when a line item overspends before noon. Drilled with the budget-pacing shape." },
  ],

  topics: [
    {
      name: "Impression counting & follower census",
      why: "Everything at X starts with a count: views per tweet, followers per account, distinct readers per article-shaped object. The curated trio drills the distinct-view fold, the view roll-up and the follower census that every audience board opens with.",
      slugs: ["find-followers-count", "article-views-i", "article-views-ii"],
    },
    {
      name: "Firehose aggregates & quality ratios",
      why: "The feed board is ratios at scale: engagement quality per tweet, top posters by volume, heavy-usage accounts for API audits. These drills cover the percentage fold, the top-N volume read and the usage-threshold census — each with the denominator stated.",
      slugs: ["queries-quality-and-percentage", "top-earners", "find-users-with-high-token-usage"],
    },
    {
      name: "Follower-graph joins",
      why: "The social graph is relational: replies per tweet, pairs of accounts with shared followers, mutual-graph reads. The curated trio drills the reply-census join, the common-follower pairing and the mutual-friend gate — the exact shapes 'who sees this cascade' queries are built from.",
      slugs: ["number-of-comments-per-post", "all-the-pairs-with-the-maximum-number-of-common-followers", "strong-friendship"],
    },
    {
      name: "Ads delivery & ROAS",
      why: "The ads ledger is ratio-shaped: CTR per placement, funnel stages per campaign, return per dollar. The curated trio is the ads canon — the performance ratio, the impression-to-click funnel and the ROAS fold — with the denominator trap in every one of them.",
      slugs: ["ads-performance", "ads-funnel", "roas-by-campaign"],
    },
    {
      name: "Budget pacing & running sums",
      why: "Ad delivery is a running-total problem: spend accumulates through the day and the pacing flag fires when the cumulative curve crosses the line. The trio drills the pacing breach read, the running balance and the running total by segment — window frames doing the work GROUP BY can't.",
      slugs: ["budget-pacing", "account-balance", "running-total-for-different-genders"],
    },
    {
      name: "Filtering the timeline",
      why: "Timeline queries live and die on WHERE discipline: multi-predicate filters, ratio gates, ordering with exclusions. The curated trio drills the compound filter, the two-flag product scan and the low-quality ratio gate — the everyday hygiene of a firehose query.",
      slugs: ["not-boring-movies", "recyclable-and-low-fat-products", "low-quality-problems"],
    },
    {
      name: "Trending text ops",
      why: "Trending is text-shaped: tweet length validation, hashtag tokenization, keyword counting. The tagged invalid-tweets is the compose-box rule verbatim; the trio adds the trending-hashtag tokenizer and the occurrence counter that trend boards run on.",
      slugs: ["invalid-tweets", "find-trending-hashtags", "count-occurrences-in-text"],
    },
    {
      name: "Threshold subqueries",
      why: "'Which tweets beat the firehose average?' is a scalar-subquery question, and X asks it constantly — viral bars, runner-up peaks, per-cohort maximums. The trio covers the department-peak fold, the paired-investment dedupe and the new-vs-repeat market gate.",
      slugs: ["department-highest-salary", "investments-in-2016", "market-analysis-i"],
    },
    {
      name: "The 14-month firehose calendar",
      why: "Feed trends are calendar-shaped: 14 months from 2024-01 to 2025-02, weekday posting patterns, dual leaderboards (most-posting author AND most-engaged tweet). The trio drills date formatting, weekday filters and the UNION-shaped double leaderboard.",
      slugs: ["convert-date-format", "friday-purchases-i", "movie-rating"],
    },
    {
      name: "Dedupe & integrity at scale",
      why: "A firehose ships dirt: retried event batches, stale duplicate rows, bot-farm duplicates. The trio drills the keep-latest dedupe, the latest-row fold and the duplicate detector — the integrity grammar that keeps engagement counts honest.",
      slugs: ["keep-latest-dedupe", "find-latest-salaries", "duplicate-emails"],
    },
  ],

  theory: [
    {
      id: "twitter-t1",
      q: "A growth report joins tweets to engagement-event batches and reports impressions next to engagement per tweet. What does the raw join do to the numbers, and what's the fold-then-join fix?",
      a: "The raw join fans out: 103 tweets meeting 251 engagement batches on the tweet key repeat every tweet-level column once per batch row — a tweet with four event batches carries its impressions four times, and SUM(total) over the join overcounts impressions by each tweet's own event count. The fix is fold first: GROUP BY tweet in a derived table with SUM(quantity) for engagement, one row per tweet, then join — grain is tweets on both sides and every aggregate is honest. If the outer query counts tweets anyway, COUNT(DISTINCT tweet_id) is the seatbelt, but the seatbelt hides the fan-out instead of fixing it. At X the question 'events or tweets?' decides the board — say the grain before the join, or the join will say it for you, wrong.",
      tag: "joins",
    },
    {
      id: "twitter-t2",
      q: "The trending board ranks tweets by engagement and two tie. What do RANK, DENSE_RANK and ROW_NUMBER print after the tie — and which one does a public board owe its readers?",
      a: "RANK shares the rung and skips ahead: 1, 2, 3, 3, 5 — the gap preserves how many tweets sit ahead, which is why public boards owe readers the gap. DENSE_RANK compacts: 1, 2, 3, 3, 4 — right for tier bands, wrong for 'what place is this tweet'. ROW_NUMBER prints 1 through 5 — a tie broken by engine whim, which on a public trending board is a claim about reality that SQL has no evidence for. X's rule: RANK for public boards, ROW_NUMBER only with a stated deterministic tie-break (tweet id, ingest order) when one row per slot is contractual, DENSE_RANK for tier buckets. And when a tie straddles the cut line, LIMIT is the wrong tool — rank-filter instead, with the tie policy printed next to the query. PERCENT_RANK is the fourth read: the fraction of the field below you, which is what 'top 1%' actually computes.",
      tag: "windows",
    },
    {
      id: "twitter-t3",
      q: "The morning board prints average impressions per tweet as 338.19. Walk the fold — and why does ROUND belong at the display edge and nowhere earlier?",
      a: "The fold is AVG(total) over the tweet table — 338.19 across the 103-tweet audit window — and the pipeline carries full precision until the print: ROUND(AVG(total), 2) at the display edge only. Round earlier and every downstream aggregate inherits the rounding error: cohort averages built from rounded tweet averages compound the drift, and a share computed from rounded cells can disagree with the same share computed from raw ones. CAST to INTEGER would floor to 338 — a 0.19-impression leak per tweet, scaled by the firehose. The companion discipline is the denominator: AVG over tweets, not over engagement batches — join first and the average silently becomes per-batch, 251-row arithmetic wearing tweet clothing. State the grain, round at the edge, print the count beside the average.",
      tag: "aggregation",
    },
    {
      id: "twitter-t4",
      q: "21 of 103 tweets carry no fan-out completion stamp. Who are they, how should reads treat them — and what does COALESCE do to the story?",
      a: "The unstamped 21 are exactly the 14 scheduler-queued plus 7 deleted/withdrawn tweets — tweets that never completed a cascade, which is the state the integrity report exists to surface. Delivery reads run over the 82 stamped tweets (2.98-day average stamp lag, 2–4 range) with the stamped count printed beside every average so the denominator is visible. COALESCE(stamp, created_at) would fold the queued and deleted arms into zero-day cascades — the report now claims withdrawn tweets fan out instantly, and the deletion signal, the whole point of the read, dissolves. The policy: filter IS NOT NULL deliberately and say so, count the NULLs as their own arm, never let a fallback invent a measurement. At X, *a missing stamp is a tweet that hasn't cascaded or was pulled — both are news; a coalesced stamp is neither.*",
      tag: "nulls",
    },
    {
      id: "twitter-t5",
      q: "A cohort board wants cohorts with at least ten above-average tweets AND an engagement ratio above 2.0. Where does each condition live, and why does the order matter?",
      a: "Pipeline order decides. WHERE runs before the fold, so it takes row-level predicates — the above-average tweet filter (total > scalar subquery) lives there, deciding which rows the fold ever sees. HAVING runs after GROUP BY, so it takes folded predicates — COUNT(*) >= 10 is a group property and dies with a syntax error in WHERE. The ratio condition folds numerator and denominator from the same rows (conditional SUM over the fold), so it lives in HAVING too, computed from the same population as the count gate — never from a sub-fold that quietly shrank. The classic failure is pushing the cohort gate into WHERE as a row condition — it doesn't compile — or filtering tweets by status first and wondering why the cohort census reconciles to 96 instead of 103. Filter rows, fold, gate the fold: at X that order is the interview.",
      tag: "pipeline",
    },
    {
      id: "twitter-t6",
      q: "'Which tweets beat the firehose average?' — walk the scalar subquery shape, and what breaks if the average is written as a plain aggregate beside the comparison?",
      a: "The bar is a population property, so it computes in its own query: WHERE total > (SELECT AVG(total) FROM orders) — on this db the bar is 338.19 and 42 of 103 tweets clear it. Write total > AVG(total) and the engine refuses: aggregates can't sit in WHERE, because WHERE runs before groups exist. AVG() OVER () would execute — every row compared against the grand average — but it drags the whole table through a window before the filter, and on a firehose table that's the expensive way to spell the same predicate. The scalar subquery states the definition once, computes it once, and keeps the outer query a plain filtered fold that the cohort GROUP BY can build on. That separation — population property inside, row filter outside — is why the viral-bar read is the canonical first screen here.",
      tag: "subqueries",
    },
    {
      id: "twitter-t7",
      q: "The growth deck buckets 14 months of tweets by month and calls out the peak and the trough. Which bucket expression is calendar-safe, and what does the trend actually show here?",
      a: "STRFTIME('%Y-%m', created_at) is the spine — 14 distinct buckets, '2024-01' through '2025-02', sorting chronologically as text. Month-only formats fold two Februaries into one bucket and the year-over-year story dies. On this db the fold shows **8 tweets and 3,731.97 impression-units in 2024-01** at the top and **1,193.86 in 2024-07** at the trough — the read the deck prints beside the buckets. Weekday cuts ride on STRFTIME('%w'): '5' is Friday, and posting-pattern questions ('does the timeline slow on weekends?') are one filtered fold away. The deeper habit is stating the grain before choosing the expression — day-grain for the live board, month-grain for the deck — because the bucket definition IS the trend, and retrofitting it after the deck ships is how two teams inherit two truths.",
      tag: "dates",
    },
    {
      id: "twitter-t8",
      q: "Trust & safety suspects bot-farm amplification: the same engagement batch appearing many times. How do you dedupe without losing real repeat engagements, and what else ships dirty in a firehose?",
      a: "Dedupe on identity, not appearance: duplicates are rows agreeing on tweet, account, event type and timestamp — real repeat engagements differ in at least one. The keep-latest pattern is ROW_NUMBER() OVER (PARTITION BY tweet_id, account_id, event_type, ts ORDER BY ingested_at DESC) = 1, keep the survivor — newest ingestion wins and the duplicate trail stays auditable. A bare GROUP BY with MAX glues arbitrary columns from different rows into a Frankenstein record; DISTINCT only works when every column truly matches. The second dirt vector is vocabulary: 'paid', 'open', 'void' belong to the ads-billing state space, 'delivered'/'shipped'/'pending'/'cancelled' to tweet lifecycle — a join that matches them ships a board of silent zeros. And money stays INTEGER cents until ROUND(x/100.0, 2) at the edge — integer division floors every odd cent. At X the integrity read is three habits: identity-based dedupe, vocabularies kept apart, cents kept integer.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "twitter-mcq-1",
      prompt: "The morning board prints average impressions per tweet. The tweets table's total column carries impressions. Which expression prints 338.19?",
      choices: [
        "ROUND(AVG(total), 2) over the tweets table",
        "AVG(total) over tweets JOIN engagement batches",
        "CAST(AVG(total) AS INTEGER)",
        "ROUND(SUM(total)) / COUNT(batches)",
      ],
      answer: 0,
      why: "AVG(total) over the tweet grain rounds to 338.19 at the display edge — the population is 103 tweets, and the average is a tweet-grain property.",
      notes: [
        { choice: 1, why: "Joining batches first fans the grain to 251 rows — the 'average' silently becomes per-batch and every downstream read inherits the wrong denominator." },
        { choice: 2, why: "CAST to INTEGER floors to 338 — the 0.19 leak per tweet compounds through every cohort average built on top." },
        { choice: 3, why: "Mixing SUM of one grain with COUNT of another is neither average — it's a new, undefined number with a confident decimal." },
      ],
      difficulty: "easy",
    },
    {
      id: "twitter-mcq-2",
      prompt: "In the tweet-lifecycle mapping, which status arm is the deleted/withdrawn population, and how big is it on the audit db?",
      choices: [
        "'pending' — 14",
        "'cancelled' — 7 (6.8% of 103)",
        "'shipped' — 30",
        "'void' — 1",
      ],
      answer: 1,
      why: "'cancelled' is the withdrawn arm — 7 tweets, 6.8%. 'void' is ads-billing vocabulary and doesn't exist in the tweet state space at all.",
      notes: [
        { choice: 0, why: "'pending' is the scheduler queue — tweets that haven't been delivered yet, not tweets that were pulled." },
        { choice: 2, why: "'shipped' is the cascading arm — the healthy fan-out population, the opposite of withdrawn." },
        { choice: 3, why: "'void' lives in the billing tables — matching it against tweet status folds the arm to a silent zero, the classic vocabulary crossing." },
      ],
      difficulty: "easy",
    },
    {
      id: "twitter-mcq-3",
      prompt: "The growth deck buckets the firehose by month across 2024-01 through 2025-02. Which expression is calendar-safe?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 1, 7)",
        "created_at",
      ],
      answer: 1,
      why: "'%Y-%m' prints 14 distinct, chronologically sortable buckets. SUBSTR(1,7) produces the same strings here, but '%Y-%m' states intent and survives timestamp format changes; month-only variants fold two Februaries.",
      notes: [
        { choice: 0, why: "'%m' drops the year — 12 buckets, February-2024 merged into February-2025, the year-over-year read destroyed." },
        { choice: 2, why: "SUBSTR(1,7) happens to match on this format, but it's string surgery with no format contract — the moment the timestamp gains a timezone suffix, it silently shifts." },
        { choice: 3, why: "The raw timestamp is one bucket per day — hundreds of buckets where the deck expects 14 months." },
      ],
      difficulty: "easy",
    },
    {
      id: "twitter-mcq-4",
      prompt: "The viral bar: total > (SELECT AVG(total) FROM orders). Why can't the analyst just write WHERE total > AVG(total)?",
      choices: [
        "They can — it's just slower",
        "Aggregates can't sit in WHERE — WHERE runs before groups exist",
        "It works but returns NULL rows",
        "AVG needs a GROUP BY clause to be legal",
      ],
      answer: 1,
      why: "WHERE filters rows before the fold, so an aggregate has nothing to aggregate over yet — the engine rejects it. The scalar subquery computes the population average once, then the outer filter compares rows against it.",
      notes: [
        { choice: 0, why: "It's not a performance question — the form is illegal SQL, a parse-time rejection, which is the friendly outcome." },
        { choice: 2, why: "It doesn't run at all — there are no NULL rows to return because the statement never executes." },
        { choice: 3, why: "AVG over the whole table needs no GROUP BY — that's exactly what the scalar subquery form expresses." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitter-mcq-5",
      prompt: "Tweets (103) join engagement batches (251) on tweet id. What does COUNT(*) return, and what counts tweets?",
      choices: [
        "COUNT(*) = 103; tweets need no adjustment",
        "COUNT(*) = 251; tweets need COUNT(DISTINCT tweet_id)",
        "COUNT(*) = 354; the counts add",
        "COUNT(*) is undefined after joins",
      ],
      answer: 1,
      why: "The one-to-many join fans to the batch grain — 251 rows — so COUNT(*) reads engagement rows. Tweet counts need COUNT(DISTINCT tweet_id), or better, a fold-then-join that keeps the grain at tweets.",
      notes: [
        { choice: 0, why: "The fan-out replaced the base count — 103 was true before the join, and after it the row grain is batches." },
        { choice: 2, why: "Joins don't add unrelated tables' rows — the fan-out substitutes, it doesn't sum." },
        { choice: 3, why: "The count is perfectly defined — it counts rows in the joined grain. The question is whether that's the grain you meant." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitter-mcq-6",
      prompt: "CTR per placement = clicks ÷ impressions, computed from a join of click events and impression events. The naive version returns inflated CTRs. Why?",
      choices: [
        "Clicks are heavier than impressions",
        "Joining clicks to impressions fans rows out — impressions repeat per click, so the denominator overcounts and the ratio drifts",
        "CTR must be computed in HAVING",
        "Impressions are TEXT and don't divide",
      ],
      answer: 1,
      why: "One-to-many joins duplicate the many side's parent rows: each click row carries a full impression row, so SUM(impressions) counts impressions once per click. The fix is folding each side separately (or counting DISTINCT) before the ratio.",
      notes: [
        { choice: 0, why: "Weight isn't the issue — the arithmetic of the join is: duplicated parent rows inflate whichever side sits in the numerator or denominator." },
        { choice: 2, why: "HAVING gates groups after aggregation — it can't repair a fan-out that happened before the fold." },
        { choice: 3, why: "Impressions are numeric here — and a TEXT denominator would error loudly, which is the honest failure compared to the silent inflation." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitter-mcq-7",
      prompt: "Pacing: flag the day a campaign's cumulative spend first crosses its daily budget. Which shape computes the running total?",
      choices: [
        "GROUP BY campaign with SUM(spend)",
        "SUM(spend) OVER (PARTITION BY campaign, day ORDER BY hour) compared against budget",
        "MAX(spend) per campaign",
        "A scalar subquery per row summing all spend",
      ],
      answer: 1,
      why: "The running total is a window frame: partition by campaign-day, order by hour, SUM over the frame — then compare each row's cumulative to the budget and keep the first crossing. GROUP BY collapses the timeline and destroys the 'when' the flag exists to name.",
      notes: [
        { choice: 0, why: "GROUP BY gives the day's total — it can't tell you WHEN the line crossed, which is the entire deliverable." },
        { choice: 2, why: "MAX finds the biggest hour, not the crossing hour — a campaign can breach at 10am with a smaller peak at 6pm." },
        { choice: 3, why: "A correlated subquery per row re-scans the table for every hour — correct but O(n²), and the window frame does the same job in one pass." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitter-mcq-8",
      prompt: "The trending board ranks by engagement; two tweets tie at rank 3, and the board shows exactly 5 rows. The analyst used ROW_NUMBER. What's wrong?",
      choices: [
        "Nothing — ties don't matter on a 5-row board",
        "ROW_NUMBER broke the tie by engine whim — two tweets with identical engagement get different public ranks",
        "ROW_NUMBER is slower than RANK",
        "The board should use LIMIT instead",
      ],
      answer: 1,
      why: "ROW_NUMBER assigns 1-5 regardless of ties — a public claim that the 4th tweet out-engaged the 3rd when the data says they tied. RANK prints 1, 2, 3, 3, 5 and tells the truth; ROW_NUMBER is only defensible with a stated deterministic tie-break.",
      notes: [
        { choice: 0, why: "Ties are exactly what a public leaderboard must not fudge — the audience can see both counts." },
        { choice: 2, why: "Performance is irrelevant at board scale — the issue is a correctness claim the engine can't back." },
        { choice: 3, why: "LIMIT doesn't rank — it truncates. The tie handling comes from the ranking function, and the cut should respect it." },
      ],
      difficulty: "hard",
    },
    {
      id: "twitter-mcq-9",
      prompt: "A cohort gate keeps cohorts with COUNT(*) >= 10 after the fold. A teammate moves the condition into WHERE as total >= 10 'for speed'. What happens?",
      choices: [
        "Same results, faster",
        "Error — or worse if rewritten as a row filter: the population shrinks before the fold and the cohort counts change",
        "The gate silently doubles",
        "Only NULL cohorts drop",
      ],
      answer: 1,
      why: "COUNT(*) can't sit in WHERE (parse error), and the 'equivalent' row-level rewrite filters tweets before the fold — a different population, different cohort counts, and a reconciliation that no longer closes against 103.",
      notes: [
        { choice: 0, why: "It's not a speed trade — WHERE and HAVING filter different objects (rows vs groups), and the row version changes the answer." },
        { choice: 2, why: "Nothing doubles — the failure is a shifted denominator, which reads as plausible numbers, the most dangerous failure mode." },
        { choice: 3, why: "NULL handling isn't involved — the gate is about group counts versus row values." },
      ],
      difficulty: "hard",
    },
    {
      id: "twitter-mcq-10",
      prompt: "Ads billing stores amounts as INTEGER cents. Which expression prints a campaign's billed total with 2 decimals?",
      choices: [
        "SUM(amount_cents)/100",
        "ROUND(SUM(amount_cents)/100.0, 2)",
        "ROUND(SUM(amount_cents), 2)/100",
        "SUM(CAST(amount_cents AS REAL))",
      ],
      answer: 1,
      why: "Divide by 100.0 for real division, ROUND(…, 2) at the display edge. Integer cents stay integer through the pipeline; only the print converts.",
      notes: [
        { choice: 0, why: "Integer division truncates every odd cent — a 250-cent line reads 2 instead of 2.50, and the truncation compounds through every cohort roll-up." },
        { choice: 2, why: "Rounding raw cents first still leaves a figure 100× too large — the /100 after ROUND doesn't rescue the misplaced divisor." },
        { choice: 3, why: "Casting to REAL before SUM prints raw cents with a decimal point — still 100× too large, now with false precision." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-twt-1",
      tier: "easy",
      topic: "q2",
      universe: "growth",
      title: "The viral-bar census",
      brief:
        "Growth memo, Monday: the viral board reads tweets that beat the firehose average, cut by audience cohort, with a sample floor so a 1-tweet cohort stops impersonating a trend. The db mapping is declared: orders are tweets, order total = impressions per tweet, customers are author accounts, regions are the four audience cohorts. Probed facts: **103 tweets** averaging **338.19 impressions**; the bar is computed ONCE over the whole population (a scalar subquery), and the memo fixes the cohort floor at **10 above-bar tweets** — a cohort under the floor stays off the trending read. The board ships cohorts, above-bar tweet counts and the above-bar average, most viral first.",
      ask: "Return each cohort clearing the 10-tweet floor with its above-average tweet count and above-average impressions (2 decimals), most above-bar tweets first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS viral_tweets,\n       ROUND(AVG(o.total), 2) AS viral_avg\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (SELECT {1}(total) FROM orders)\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY viral_tweets {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the firehose bar",
          why: "AVG(total) over the whole tweet population sets the bar once — 338.19. SUM or MAX would push the bar past every tweet (empty board); COUNT would set it at 103 impressions, a different question entirely.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the cohort floor",
          why: "The memo's sample floor: a cohort needs ten above-bar tweets before its average means anything. The floor is verified in the output — the smallest kept cohort sits exactly at 10 — while 1 would wave the 1-tweet shard through and 20 would empty the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-viral-first order",
          why: "The board leads with the cohort carrying the most above-bar tweets. ASC would open the review with the floor's minimum — a correct query aimed at the wrong end of the leaderboard.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "20", "ASC"],
      walkthrough:
        "Population property inside, row filter outside, cohort gate after the fold. The scalar subquery computes the firehose bar once — AVG(total) = 338.19 over all 103 tweets — and the outer WHERE keeps only the 42 tweets above it, folded by cohort: 18 in the biggest cohort (averaging 605.50), then 13 (521.85) and 10 (587.36), with the 1-tweet shard dropping to the HAVING floor. The floor's cell is verifiable in the output — the last kept cohort sits exactly at 10 — and the ORDER BY viral_tweets DESC opens the board with the 18. SUM in the bar slot lifts the threshold past every tweet and ships an empty board; MAX does the same through the 1,088.44 maximum; COUNT sets the bar at 103 impressions and answers a different question. 1 in the floor slot admits the single-tweet shard the memo exists to exclude; 20 empties it; ASC reads the board upside down. One definition, one computation, stated floors — the viral-bar read in full.",
    },
    {
      id: "cs-twt-2",
      tier: "medium",
      topic: "j3",
      universe: "fraud",
      title: "The cascade fan-out census",
      brief:
        "Integrity memo, Thursday: trust & safety reads the firehose for inauthentic amplification — cohorts whose engagement fan-out looks engineered. The db mapping is declared: order_items are engagement-event batches, orders are tweets, customers are author accounts, regions are the four audience cohorts. Probed facts: **251 engagement batches across 103 tweets**; the census wants, per cohort: total engagement events, DISTINCT tweets actually engaged, and the events-per-tweet ratio computed from the SAME fold so the columns can never disagree. The integrity question is the ratio: a healthy firehose runs ~2.4 events per tweet, and a cohort drifting far off that band — high or low — is where the manual review goes. Biggest engagement load first.",
      ask: "Return each audience cohort with engagement events, distinct tweets engaged, and events per tweet (2 decimals), biggest engagement load first.",
      template:
        "SELECT c.region,\n       {1}(*) AS engagement_events,\n       COUNT({2} o.id) AS tweets_fanned,\n       ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT o.id), 2) AS events_per_tweet\nFROM order_items e\nJOIN orders o ON o.id = e.order_id\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY engagement_events {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the event counter",
          why: "COUNT(*) counts the engagement rows folded into each cohort — 105, 88, 53, 5. SUM(*) and AVG(*) don't exist as SQL and fail loudly, which is the honest failure.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the tweet-fold",
          why: "COUNT(DISTINCT o.id) folds repeat batches back to tweets — the biggest cohort's 105 events collapse to 45 tweets, and the ratio reads 2.33. Without DISTINCT both columns read the same and the census loses the signal entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the load-first order",
          why: "Integrity review starts at the biggest engagement load. ASC would open with the 5-event shard — a correct query pointed at the quietest corner of the firehose.",
        },
      ],
      distractors: ["SUM", "AVG", "ALL", "ASC"],
      walkthrough:
        "One fold, two counters, one ratio — the fan-out census. The 3-table chain walks engagement batches to tweets to author accounts, GROUP BY folds the four cohorts, and the two counters read different grains from the same rows: COUNT(*) is events (105 / 88 / 53 / 5), COUNT(DISTINCT o.id) is tweets (45 / 37 / 19 / 2), and the ratio divides the first by the second with * 1.0 forcing real division — 2.33, 2.38, 2.79, 2.5. ALL in the DISTINCT slot is the subtle one: COUNT(ALL o.id) is legal SQL and silently returns the event count as the tweet count — the ratio reads 1.0 everywhere and the anomaly signature vanishes, which is precisely the failure the census exists to catch. SUM and AVG error in the counter slots; ASC points the review at the quietest cohort. The integrity read compares each cohort's ratio against the firehose band (~2.4): drift marks the manual-review queue, and the fold-then-divide discipline is what keeps numerator and denominator from ever being computed over different populations.",
    },
  ],

  problems: [
    { slug: "invalid-tweets", why: "Twitter's one tagged problem, and the compose box verbatim: tweet-length validation — the text-ops read every feed-integrity query starts from." },
    { slug: "ads-performance", why: "CTR per placement — the ads ratio with the denominator trap: clicks folded against impressions from the same population, not a fan-out ghost." },
    { slug: "ads-funnel", why: "The impression-to-click funnel per campaign — staged counts that must reconcile against the delivery ledger." },
    { slug: "roas-by-campaign", why: "Return per dollar per campaign — the ROAS fold the ads P&L ships weekly, revenue and spend folded from the same grain." },
    { slug: "budget-pacing", why: "The pacing-breach flag — running spend against daily budget via a cumulative window; the exact shape of the delivery desk's morning alarm." },
    { slug: "find-trending-hashtags", why: "Trending hashtags — tokenizing the firehose and ranking the tokens, the trend board's core query." },
    { slug: "find-trending-hashtags-ii", why: "Trending hashtags by distinct authors — the integrity cut: a hashtag pushed by one account is spam, by many is a trend." },
    { slug: "number-of-comments-per-post", why: "Replies per tweet — the thread-depth census that feed ranking and integrity both key on." },
    { slug: "article-views-i", why: "Distinct readers per tweet-shaped object — the impression dedupe that separates reach from reloads." },
    { slug: "article-views-ii", why: "View roll-ups with HAVING — the audience-share read: which tweets cleared their own author's bar." },
    { slug: "queries-quality-and-percentage", why: "Quality ratios at scale — percentage folds with the population stated, the firehose's everyday hygiene." },
    { slug: "reported-posts-ii", why: "The report ratio per category — moderation analytics with the denominator trap front and center." },
    { slug: "transaction-velocity", why: "Velocity bursts — engagement arriving too fast to be human, the time-bucket flag that pre-screens inauthentic amplification." },
    { slug: "ab-sample-ratio-mismatch", why: "Sample-ratio mismatch on feed experiments — the integrity check that decides whether an A/B read is trustworthy at all." },
    { slug: "compute-the-rank-as-a-percentage", why: "Rank as a percentage of the field — the 'top 1%' read behind trending eligibility, windows doing the work." },
    { slug: "second-degree-follower", why: "Two-hop follower reach — the cascade's audience shape: who sees a retweet of a retweet, the graph join virality hangs on." },
  ],
};
