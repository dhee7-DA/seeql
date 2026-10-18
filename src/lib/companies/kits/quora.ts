// Quora — kit 15 of the Streaming & Social domain (Wave-8 (Task 96), media
// domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md).
// The Q&A-graph company: ask-to-answer sessions, upvote/downvote signals,
// topic-authority ranking, digest emails, spam/moderation queues and the
// Quora+ subscription that monetizes the graph. Pool provenance: Quora carries
// ZERO tagged registry problems (0 tagged LC — theme-curated, stated per
// spec) — all 16 problem slots and all 30 topic slugs are THEME-CURATED from
// the SQL band's graph/ratio/moderation-shaped theme menu. Case studies run
// on db/custom.db with probed figures from scripts/company-facts.md, mapped
// as: orders = ask-to-answer sessions (one row per session a user picks up),
// order status = session outcome (delivered = answer posted, shipped = queued
// into the digest, pending = draft still open, cancelled = request dismissed),
// shipped_at = the answer-posted stamp (NULL until the session produces a
// posted or queued answer), order total = engagement units earned (upvote-
// weighted points), order_items = question batches (quantity = answers per
// batch), products = topic bundles, product category = topic family,
// customers = users, region = market cohort, suppliers = content-partner
// programs (Spaces & publisher feeds), invoices/payments = Quora+ billing
// (INTEGER cents ÷ 100), expenses = infra & growth spend. Mappings declared
// in-world, no invented telemetry; every figure probed against db/custom.db.

import type { CompanyKit } from "../types";

export const quoraKit: CompanyKit = {
  id: "quora",
  domainId: "media",
  name: "Quora",
  tagline: "The Q&A graph: questions, answers and expertise",
  accent: "text-red-300",

  brief: [
    "**Quora** is the internet's question-and-answer graph — {violet:questions} pull {sky:answers} out of the people who've actually lived them, and the upvote button is how the crowd decides which answers deserve authority. The unit of analysis is the **ask-to-answer session**: a user picks up a request and the session ends *posted*, queued into a digest, stalled in draft, or declined. Most of the analytics here folds 251 question batches into 103 sessions written by 16 users, with engagement units — upvote-weighted points — averaging 338.19 per session.",
    "The data org runs three engines. {emerald:Graph telemetry} folds the batch log into the boards the product teams read at 08:15 — sessions per cohort, answers per batch, the 50.5% answered share. **Trust & safety** lives in the moderation queue: flagged-content rates, stale-draft sweeps, and the {rose:dismissed} tail (7 of 103 sessions) that every funnel denominator must still count. Monetization runs Quora+ billing, where amounts live as INTEGER cents and `amount_cents / 100.0` at the display edge is house style — card rails carried 16 payments worth $37,364.00 against wire's 11 / $32,248.00.",
    "Interview screens are fold-rank-rate shaped. A typical loop opens with a fold (answers per session — `SUM(quantity)`, not a row count, because batches carry quantities), escalates into a ranking window for the writer leaderboard, and lands on a rate question **where the denominator is the whole test** — dismissed sessions counted, stamped population named. The follow-ups are definition probes: *'does a declined request count in your funnel?'*, *'is that per session or per user?'*. Post-latency math (the **2.98-day** average start-to-post window over the 82 stamped sessions) is the usual date-arithmetic closer.",
    "Preparation strategy: Quora carries **zero tagged registry problems**, so this kit theme-curates all thirty-two — the ask-graph joins, upvote-rate ratios, moderation reads, streak ladders and the Quora+ billing folds. Then run all six case studies on the live storefront db, where the mapping is declared, not hidden: orders are ask-to-answer sessions, {emerald:delivered} means the answer posted, order totals are engagement units, regions are market cohorts. The opening pair rebuilds the {violet:topic-authority board} (a joined fold over the topic graph, gated by a session floor) and the {sky:ask-to-answer triage grid} (four session outcomes per cohort, one CASE pass); four more run the writer ladder (competition ranks per market cohort), the digest planning census (one FILTER pass per month), the engagement bar (sessions clearing the 338.19 platform average, annotated on every row) and the clean-hands register (the anti-join that finds who never dismissed). The whole drill is built for spaced practice rather than one sitting. The bar: *state the denominator before you compute it.*",
  ],

  dayInLife: [
    "**08:15 —** The day opens with the freshness check and the moderation sweep. The analyst folds the overnight batch log into per-session counts — did the 103-session book land cleanly, are the 251 batches deduped keep-latest — then opens the {rose:flagged-content queue}: what got reported overnight, which stale drafts (14 pending sessions) need a nudge or a sweep. The first real query is almost always a reconciliation: sessions versus batches, stamped versus unstamped (**82 of 103** carry the posted stamp), engagement totals versus the digest tracker. A mismatch is the day's first fire, and the analyst who can write the diff query owns the morning.",
    "**11:30 —** Midday is the authority deep-dive. Discovery wants the {violet:topic-authority board} rebuilt — sessions and answers folded per topic family, gated by a 30-session floor so thin families stop impersonating trends — while the community team re-ranks the {emerald:writer leaderboard}: lifetime engagement, ties sharing a rung, deterministic to the id. Each ask is a join, a fold and an argument about grain: batches versus answers, sessions versus users. *A leaderboard without its tie rule is a coin flip dressed as data*, so the query gets written twice — once to answer, once with the definition attached.",
    "**15:30 —** The afternoon is stakeholder cycles. The digest team ships its email picks — top-voted answers per reader, the {sky:recent-3 rail} with tie-breaks documented — while growth reviews the ask-to-answer funnel: 52 posted, 30 queued, 14 drafting, 7 {rose:declined}, and whether the July-style cool-off (a **$1,193.86** trough month) is repeating. Billing closes the loop: the Quora+ book reconciles in cents first, the {amber:split-payment} register (5 invoices, one partial at 4,000 of 6,148) gets its dunning note, and every number that leaves the desk carries its population with it — the EOD note pins the SQL beside the figures it produced.",
  ],

  metrics: [
    { name: "Answered-session share", what: "Sessions that ended with a posted answer: 52 of 103 (50.5%) — the {emerald:delivered} arm of the ask-to-answer funnel and the number every digest-planning meeting opens with." },
    { name: "Ask-to-answer decline rate", what: "Requests dismissed without an answer: 7 of 103 (6.8%). The refusal signal that calibrates how aggressively the ask-to-answer matcher targets writers — always computed over ALL picked-up sessions." },
    { name: "Engagement per session", what: "Upvote-weighted points a session earns: 338.19 average against a 34,833.28 book (range 25.47 to 1,088.44). SUM(total) per fold — engagement, not session count, is what the authority boards rank on." },
    { name: "Post latency", what: "Session start to answer-posted stamp, where stamped: 82 sessions averaging 2.98 days, range 2–4. The responsiveness read the ask-to-answer team manages weekly." },
    { name: "Stamp coverage", what: "82 of 103 sessions carry the posted stamp; the unstamped 21 are drafting-plus-dismissed, reported as a state. COUNT(*) minus COUNT(shipped_at) is the census — never coalesced to zero." },
    { name: "Topic-authority concentration", what: "The Audio topic family carries 11,744.01 engagement over 46 sessions and 97 answers; the Accessories family writes the most answers (121) on the most sessions (54). Concentration here decides which families the matcher invests in." },
    { name: "Heavy-contributor cohort", what: "Users above the mean cadence: the top four (24, 17, 14, 13 sessions) hold 63.5% of all engagement. The concentration read that decides where writer-recruitment experiments get shelf space." },
    { name: "Quora+ rail mix", what: "Billing rails in honest dollars: card 16 payments / $37,364.00 vs wire 11 / $32,248.00, settlement averaging 28.4 days against flat 30-day terms — with 5 split-payment invoices and one partial (4,000 of 6,148 cents) on the anomalies register." },
  ],

  topics: [
    {
      name: "The ask graph: first joins & counts",
      why: "Every Quora story starts with a first session, and every board starts with a count: sessions per user, first-pickup attribution, answers per batch. This trio drills the first-event fold, the distinct-viewer count and the duration roll-up that the ask-to-answer health screens are built from.",
      slugs: ["article-views-i", "game-play-analysis-i", "find-followers-count", "find-the-quiet-students-in-all-exams"],
    },
    {
      name: "Two-grain censuses",
      why: "'Sessions AND users per cohort' is the opening read of every Quora business review — and the trap is counting both at the same grain. COUNT(*) counts session rows; COUNT(DISTINCT customer_id) counts people. The trio drills exactly this census, monthly and daily, until the two-grain discipline is reflexive.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "article-views-ii", "actors-and-directors-who-cooperated-at-least-three-times"],
    },
    {
      name: "Upvote & quality signals",
      why: "Upvotes and downvotes are the crowd's quality signal, and every quality read is a conditional count or a rate. These drills cover flagged counts, per-item quality percentages and the 100.0-before-division habit that keeps Quora's quality shares honest.",
      slugs: ["reported-posts", "ads-performance", "queries-quality-and-percentage", "find-books-with-polarized-opinions", "number-of-comments-per-post"],
    },
    {
      name: "Answer-rate ratios",
      why: "'Which questions get answered?' is a rate question, and the denominator is the whole test: requests picked up, not requests that existed. The trio drills the answer-rate argmax, acceptance-rate folds and participation percentages — Quora's ratio grammar in textbook form.",
      slugs: ["get-highest-answer-rate-question", "friend-requests-i-overall-acceptance-rate", "percentage-of-users-attended-a-contest", "confirmation-rate"],
    },
    {
      name: "Moderation & flagged content",
      why: "Trust & safety lives in queues: reported posts per day, the share that gets removed, text that fails validation. These drills cover the moderation-rate ratio, string validation and keyword counting — the exact reads the spam/moderation screens are written in.",
      slugs: ["reported-posts-ii", "invalid-tweets", "count-occurrences-in-text", "top-percentile-fraud"],
    },
    {
      name: "Writer leaderboards: ranking windows",
      why: "Top writers by engagement, top families by answers, second-highest per cohort — Quora reporting is leaderboard reporting, and ties are everywhere once 16 users share 103 sessions. The trio drills RANK, DENSE_RANK and ROW_NUMBER until the 1,2,3,4,4,6 pattern is a spoken reflex.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries"],
    },
    {
      name: "Return visits & digest windows",
      why: "Digest emails are built on return behavior: did the reader come back the next day, how big was the gap, what happened in the last 30 days. The trio covers the D+1 comparison, the biggest-gap LEAD read and the 30-day activity window the email team lives in.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "user-activity-for-the-past-30-days-i", "users-that-actively-request-confirmation-messages", "second-day-verification", "rolling-average-steps"],
    },
    {
      name: "The follow graph: self-joins & two hops",
      why: "The follow graph is Quora's distribution engine: who follows whom, who follows the followers, which pairs are mutual. The trio drills the second-degree walk, the mutual-strength self-join and the two-hop popularity percentage that topic-feed ranking is built on.",
      slugs: ["second-degree-follower", "strong-friendship", "popularity-percentage", "friend-requests-ii-who-has-the-most-friends", "friends-with-no-mutual-friends", "all-the-pairs-with-the-maximum-number-of-common-followers", "page-recommendations", "page-recommendations-ii"],
    },
    {
      name: "Streaks & consecutive-day habits",
      why: "Writing habits are streaks: users who show up day after day, and the day the ladder breaks. The trio is the gaps-and-islands canon — the longest streak, the 15-day wall, the consecutive-period actives read that the retention board's headline hangs on.",
      slugs: ["longest-winning-streak", "active-users", "fifteen-days-of-learning"],
    },
    {
      name: "Digest funnels & Quora+ conversion",
      why: "Reader-to-subscriber is a funnel: digest opened, question answered, Quora+ started. These drills build the step-conversion grammar — email engagement stages, funnel pivots and trial-to-paid joins — with the denominator at every step stated out loud.",
      slugs: ["email-engagement-funnel", "funnel-step-conversion", "trial-to-paid-funnel", "transactions-per-visit-histogram", "customers-who-bought-a-and-b-not-c"],
    },
  ],

  theory: [
    {
      id: "quora-t1",
      q: "Sessions join to users and topic bundles for the authority boards. INNER or LEFT — how do you decide, and what silently breaks a LEFT JOIN here?",
      a: "Decide from the survival rule the question implies. An engagement report joins sessions to users and bundles: a session with no user row is corruption, so INNER is honest — and worth a data-quality flag, not a silent shrug. A 'registered users who never picked up a request' read must be LEFT from users — the unmatched users ARE the answer — though on this db every user carries at least one session, so the interesting read is intensity, not existence. The Quora trap is filtering the right table's column in WHERE (o.status = 'delivered'): that predicate silently converts the LEFT JOIN into an INNER and deletes exactly the rows the ask-to-answer funnel needs to count. The strong answer states, per join, who survives and why — join type is a decision about the population, not a habit.",
      tag: "joins",
    },
    {
      id: "quora-t2",
      q: "251 question batches fold into 103 sessions written by 16 users. Narrate what COUNT(*) counts at each stage — and why answers are a SUM, not a COUNT.",
      a: "Three grains, and every COUNT must say which one it means. COUNT(*) after the batches join counts batch rows — 251; COUNT(DISTINCT o.id) folds the fan-out back to sessions — 103; COUNT(DISTINCT o.customer_id) folds back to people — 16. None is wrong; each answers a different question: content load, session volume, audience size. The Quora-flavored trap is answers: SUM(oi.quantity), not COUNT(*), because a batch row carries a quantity of answers, and counting rows undercounts by exactly the batching factor. The habit the interviewer listens for is saying 'one row per what?' out loud for every aggregate in the query — the fan-out census that prints 251 in a sessions column is the most common grain bug in the wild, and the one this screen is designed to catch.",
      tag: "aggregation",
    },
    {
      id: "quora-t3",
      q: "shipped_at stays NULL until an answer posts. What is your policy for the 21 unstamped sessions in a latency report?",
      a: "NULL here is a state, not a zero. The stamp lands when a session posts or queues an answer, so the unstamped 21 (14 drafting, 7 dismissed) are live rows whose stamp simply doesn't exist yet. Filters: NULL fails both x = value and x != value, so WHERE shipped_at < cutoff silently drops the unstamped — sometimes right, always a definitional choice to state. Aggregates: AVG and COUNT(shipped_at) skip NULLs while COUNT(*) keeps the row — so AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over all 103 rows still returns the 2.98-day average, computed over the 82 stamped only. The policy: define the population first — 'this latency read covers the 82 stamped sessions; drafts and dismissals are out of scope' — and let COUNT(*) minus COUNT(shipped_at) be the unstamped census. A report whose WHERE clause does definitional work without saying so is the thing Quora's reviewers hunt for.",
      tag: "nulls",
    },
    {
      id: "quora-t4",
      q: "The moderation read filters dismissed sessions and gates families by session floor. Where does each filter live, and why does the wrong clause break the number?",
      a: "Status is a row-level fact, so it lives in WHERE — filtering to posted sessions before any fold touches them. Once rows are folded, the states no longer exist per row, and HAVING can only judge group-level facts like COUNT or SUM; the classic failure is summing engagement over all rows and trying to subtract dismissed sessions in HAVING — the dismissed units are already inside every total, and no post-aggregation clause can un-mix them. The floor is the mirror image: 'keep only topic families with 30+ sessions' is a group fact, so it's HAVING after GROUP BY — put it in WHERE and the engine rejects it, because sessions-per-family doesn't exist yet. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the moderation read's skeleton: every filter placed by asking 'is this a fact about one row, or about a group?'",
      tag: "pipeline",
    },
    {
      id: "quora-t5",
      q: "The writer leaderboard must survive ties. Walk me through RANK versus DENSE_RANK versus ROW_NUMBER — and the per-cohort variant.",
      a: "The leaderboard is a window problem because ties are the norm, not the edge case. RANK gives tied writers the same rung and gaps the next (1, 2, 4, 4, 6); DENSE_RANK shares the rung without the gap (1, 2, 4, 4, 5); ROW_NUMBER splits ties arbitrarily — the silent erasure a community lead will catch. The business question decides: 'top N regardless of ties' wants ROW_NUMBER with a deterministic tie-breaker (ORDER BY engagement DESC, id DESC); 'everyone who earned rank N' wants RANK or DENSE_RANK. The Quora twist: PARTITION BY region gives each market cohort its own leaderboard from one scan, and an empty OVER() attaches the platform-average engagement (338.19) to every writer without collapsing rows — annotate, don't amputate. Saying the tie rule out loud before writing the window is the habit this screen rewards.",
      tag: "windows",
    },
    {
      id: "quora-t6",
      q: "You need sessions that beat the platform-average engagement (338.19), and a moderation queue of users with any dismissed session. Which subquery shapes, and what breaks?",
      a: "Three shapes, three jobs. The scalar subquery computes a population property once: WHERE o.total > (SELECT AVG(total) FROM orders) sets the quality bar at 338.19 and filters against it — but it discards every below-bar session. The window twin, AVG(total) OVER (), attaches 338.19 to every row and keeps all 103 — annotate, don't amputate. EXISTS versus IN is the moderation-queue read: per user, 'has at least one flagged session' short-circuits at the first hit, while IN materializes the whole flagged set first; and NOT IN carries the NULL trap — one NULL in the inner list and the whole NOT IN returns nothing. The interviewer's follow-up is always the same: what does this return if the inner query is empty? Say the empty-case answer out loud before you ship the query.",
      tag: "subqueries",
    },
    {
      id: "quora-t7",
      q: "The digest calendar and the post-latency metric both run on date math. What does your date toolkit look like on this data?",
      a: "The digest calendar hangs on the '%Y-%m' spine: STRFTIME('%Y-%m', created_at) builds the 14 month buckets from 2024-01 to 2025-02, one row per month, the grain every trend walk here shares. Latency math is JULIANDAY: julianday(shipped_at) - julianday(created_at) gives fractional days, and the 2.98-day average over the 82 stamped sessions is the post-latency the ask-to-answer team manages. The traps are boundary traps: BETWEEN on timestamps loses the last night of the window — half-open intervals (>= start AND < next start) are the honest shape; and '%Y' alone would collapse the calendar into two year-long buckets, a valid query that no longer contains a month. State the grain and the boundary before you write either — the interviewer is checking whether the calendar is a decision or an accident.",
      tag: "dates",
    },
    {
      id: "quora-t8",
      q: "Tell me how Quora's data org treats data quality — walk me through a reconciliation you'd run on the billing book.",
      a: "Quora's culture is reconciliation-first, and the billing tables prove it. The ledger ties at 181,080 = 181,080 every close — a trial-balance eye run as a reflex, not a formality. The anomalies register stays live because detection is mechanical: invoice 11 is void but carries a 925.00 payment; invoice 28 is marked paid with zero payment rows (1,756.00); five invoices settle as split payments, one partial at 4,000 of 6,148. The same eye applies to identity data — duplicate-email detection via GROUP BY email HAVING COUNT(*) > 1, case-normalized names before any per-person fold, because a join on a dirty key is a silent fan-out nobody catches until the census doubles. The strong answer treats a mismatch as a page, not a shrug: 'the numbers disagree' is a finding, and the diff query — which side is missing rows, and by how much — is the deliverable.",
      tag: "quality",
    },
    {
      id: "quora-t9",
      q: "The clean-hands register LEFT JOINs users to dismissed sessions, then someone adds WHERE o.status = 'cancelled' to 'make it explicit'. What breaks?",
      a: "The register empties by half — silently. A predicate on the right table's column in WHERE can only evaluate on rows that matched, so every user with no dismissed session (the NULL-extended rows the LEFT JOIN preserved) fails the comparison and drops out: the anti-join becomes an INNER join, and the register now lists the accused instead of the clean. The fix is placement: the status belongs in the ON clause — LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' — so the dismissal filter shapes the match while unmatched users survive with NULLs, and the WHERE keeps only o.id IS NULL. The habit the reviewer listens for: after every LEFT JOIN, say where each predicate lives — ON shapes the match, WHERE shapes the survival.",
      tag: "joins",
    },
    {
      id: "quora-t10",
      q: "'Users who never dismissed a request' — walk me through the three shapes: LEFT JOIN IS NULL, NOT EXISTS, NOT IN. Which survives production?",
      a: "LEFT JOIN orders ON the user key AND status = 'cancelled', keep WHERE o.id IS NULL — the unmatched users ARE the answer, twelve of sixteen here. NOT EXISTS (SELECT 1 FROM orders WHERE customer_id = c.id AND status = 'cancelled') is the same population with per-row probing; both survive NULLs. NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') is the one that explodes: customer_id is NOT NULL on this table so it squeaks by today, but the day the inner list carries one NULL — a nullable key, a drifting population — the whole NOT IN returns nothing and the register reads clean. The production answer: LEFT JOIN IS NULL or NOT EXISTS, never bare NOT IN over a column that can go NULL; and state the empty-case behavior out loud — here an empty register means nobody was dismissed, which is a finding, not a bug.",
      tag: "joins",
    },
    {
      id: "quora-t11",
      q: "Answer revisions pile up in the raw log — the clean layer must keep the newest revision per answer. What's the shape, and where do nondeterministic versions fail?",
      a: "Keep-latest is a staged window fold: ROW_NUMBER() OVER (PARTITION BY answer_id ORDER BY created_at DESC, id DESC) in an inner query, then filter rn = 1 outside — window results can't be filtered in WHERE, same wall as every window read. The id tiebreak is what makes it deterministic: two revisions stamped the same second resolve by id instead of engine mood, and the clean layer rebuilds identically every run. The failures: MIN(id) keeps the OLDEST revision; a bare MAX(created_at) returns the timestamp, not the row; and GROUP BY answer_id without the window picks an arbitrary survivor. On the ask-graph the deduped layer is the substrate for every engagement fold — a dedupe that isn't reproducible corrupts every number downstream of it.",
      tag: "windows",
    },
    {
      id: "quora-t12",
      q: "Writing habits are streaks. Walk me through the gaps-and-islands fold that turns active days into consecutive runs — and what it must NOT be confused with.",
      a: "Two stages. Inner: ROW_NUMBER() OVER (ORDER BY day) numbers the active days; day minus that row number is the island key — it advances by one per row and one per calendar day, so consecutive days share a value and every gap breaks it. Outer: GROUP BY user and island key, COUNT the days per run, and the longest streak is an argmax over run lengths. The confusion to name out loud: session stitching also 'groups activity' but measures TIME BETWEEN EVENTS with a LAG threshold — a 30-minute cut — while streaks measure CALENDAR ADJACENCY. Conflating them is how 'a 7-day writing streak' quietly becomes '7 sessions' or '7 events' on a retention board.",
      tag: "windows",
    },
    {
      id: "quora-t13",
      q: "The digest team wants the biggest gap between a reader's consecutive sessions. Which window computes it, and what does the first row read?",
      a: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) — or LAG, same read mirrored — gives each session its successor; the gap is julianday(next) - julianday(created_at), and MAX over that per reader is the biggest window. The first row of every partition reads NULL — there is no successor — and the honest options are explicit: treat NULL as 'not yet returned' and keep it out of the max (aggregates skip it naturally), or COALESCE it only when the business definition says 'still open' counts. The stage-then-filter rule applies: the gap column doesn't exist until SELECT, so the max lives in an outer query or the window rides in a CTE. This is the read the win-back email cadence is tuned against — a biggest-gap that silently drops first sessions biases toward readers who already came back.",
      tag: "windows",
    },
    {
      id: "quora-t14",
      q: "The digest email needs each reader's topics as one cell. How do you fold rows into a string, and what's the order hazard?",
      a: "GROUP_CONCAT(topic) with GROUP BY reader — but the cell's order is engine-arbitrary unless you make it deliberate: feed the aggregate from a pre-ordered derived table (ORDER BY inside the CTE) or accept that the email reads differently on every run. Separators are the second parameter — GROUP_CONCAT(topic, ', ') — and length is the third hazard: a heavy reader with forty topics produces a cell that breaks the template, so cap the input rows before the fold, not the string after. The two-grain rule still applies: one row per reader, many topics folded inside — and the fold must never be asked to do the ranking's job; pick WHICH topics before the string forms, because GROUP_CONCAT cannot dedupe, filter, or sort after the fact.",
      tag: "aggregation",
    },
    {
      id: "quora-t15",
      q: "Mutual-follow pairs must not double-count. How does the self-join canonicalize, and what does the graph census count at each grain?",
      a: "The self-join pairs the follow table with itself — f1 JOIN f2 ON f1.follower = f2.followed AND f1.followed = f2.follower — and the canonicalization predicate (f1.follower < f1.followed, or ordered by id) keeps ONE row per unordered pair instead of two mirror rows. Without it, every mutual pair doubles and the 'mutual follows' census inflates by exactly 2x — the silent fan-out that self-joins are famous for. The grain discipline: the paired rows count RELATIONSHIPS, COUNT(DISTINCT ...) folds back to people, and the a != b guard excludes self-follows before any of it. On the ask-graph this same shape powers co-answer pairs — who answers alongside whom — where the threshold (pairs with 3+ shared sessions) is a HAVING gate on the folded pair count.",
      tag: "joins",
    },
    {
      id: "quora-t16",
      q: "The digest calendar needs 14 monthly buckets — including months with zero sessions. What does the spine look like?",
      a: "GROUP BY STRFTIME('%Y-%m', created_at) builds the buckets traffic touched — 2024-01 through 2025-02 — but a zero month simply doesn't exist in the sessions table, so the fold drops it and the calendar reads a hole as calm. The honest spine is a CTE (or table) listing all 14 month keys, LEFT JOINed to the session fold, COALESCE(COUNT(*), 0) for the empties — because zero months ARE the story in digest planning: a flat month is a delivery decision, not an absence of rows. Name the boundary convention too: month keys as text sort correctly across years, while julianday ranges need half-open edges (>= month start AND < next month start) or the BETWEEN swallows the boundary.",
      tag: "dates",
    },
    {
      id: "quora-t17",
      q: "The Quora+ book stores INTEGER cents. Walk me through the display policy — and the two places the cents leak.",
      a: "Fold in cents, divide once at the display edge: ROUND(SUM(amount_cents) / 100.0, 2). The .0 is the whole policy — integer / integer truncates, so 69,612 cents printed by bare /100 reads 696 dollars and silently eats the 12 cents. Leak one: dividing PER ROW — SUM(amount_cents / 100) truncates every odd-cent amount before the sum, and the error compounds across rows instead of canceling. Leak two: rounding at every layer — the query rounds, the dashboard rounds, the deck rounds, and the book stops tying to 181,080. The close works because cents stay INTEGER through every fold and reconciliation, and the conversion to dollars happens exactly once, at the edge, with ROUND(..., 2). The same discipline covers the split-payment register: partial payments reconcile in cents or they don't reconcile.",
      tag: "quality",
    },
    {
      id: "quora-t18",
      q: "NOT IN, NOT EXISTS, LEFT JOIN IS NULL — for the moderation sweep, which do you reach for and what does each return when the inner list is empty or NULL-carrying?",
      a: "Empty inner list: NOT IN returns EVERYTHING (nothing to be in), NOT EXISTS returns everything too — they agree, and the result is usually the intended 'nobody flagged'. NULL-carrying list: NOT IN collapses to nothing — x NOT IN (…, NULL) can never be proven true — while NOT EXISTS and the LEFT JOIN IS NULL anti-join still answer correctly, because EXISTS per row and IS NULL per row don't need to prove a universal negative. That asymmetry is the whole decision: NOT IN is the only shape whose correctness depends on the inner list's NULL discipline, which is a property of data you don't control. For the sweep — 'users with at least one dismissed session' and its negation — EXISTS for the positive, LEFT JOIN IS NULL or NOT EXISTS for the negative, and say the empty-case answer before running.",
      tag: "subqueries",
    },
    {
      id: "quora-t19",
      q: "Every writer row must carry the platform-average engagement beside their own. Annotate or amputate — what's the difference, and when is each right?",
      a: "Annotate: AVG(total) OVER () attaches 338.19 to every row without collapsing it — the writer list stays whole and each writer sits beside the platform bar they're measured against. Amputate: WHERE total > (SELECT AVG(total) FROM orders) filters to the 42 sessions above the bar — a different deliverable that silently deletes the below-bar population the comparison was about. The business ask decides: a ranking report annotates (every writer, with the bar as context); a qualification list amputates (only who cleared it, stated as such). The failure the interviewer hunts: an amputation wearing an annotation's name — a report titled 'all writers vs the average' that quietly shipped 42 of 103 rows. Same subquery, same number, opposite deliverable.",
      tag: "windows",
    },
    {
      id: "quora-t20",
      q: "Two reader rows: 'Alice Chen' and 'alice  chen', 'A@x.com' and 'a@x.com'. How does identity hygiene keep the graph census honest?",
      a: "Normalize at the key, before any fold or join: LOWER(email) for identity comparisons — case is not identity on this graph — and TRIM plus whitespace collapse for names, because 'alice  chen' and 'alice chen' are one reader wearing two strings. Then the dedupe census is mechanical: GROUP BY LOWER(email) HAVING COUNT(*) > 1 surfaces the collision set, and the fold keys on the normalized form so a join on email can't silently fan out. The order matters: normalize FIRST, dedupe SECOND — deduping raw strings merges nobody and the census doubles. The reviewer's follow-up is always the same: what's the canonical form, and where does normalization happen — once in a cleaned layer every query reads, or re-implemented per query until two queries disagree about who the reader is.",
      tag: "quality",
    },
    {
      id: "quora-t21",
      q: "Engagement per ANSWER, not per session: batches carry quantities. Why is the honest ratio a ratio of folds, and what does AVG of per-batch values get wrong?",
      a: "The ask is total engagement over total answers: SUM(oi.quantity * oi.unit_price) / SUM(oi.quantity) — both folds over the same rows, the numerator pricing every answer, the denominator counting every answer, batches weighted by their size. AVG(oi.quantity * oi.unit_price) computes the mean per BATCH: a two-answer batch and a nine-answer batch weigh the same, so the number skews toward small batches and answers the question 'how big is a typical batch's value', not 'what does an answer earn'. The distinction is a weighting decision, and it's invisible in the output — both print a plausible per-unit number. The spoken habit: say the unit of the denominator out loud — answers, sessions, batches — before trusting any per-X metric on this graph.",
      tag: "aggregation",
    },
    {
      id: "quora-t22",
      q: "The authority board gates topic families by an answered-share floor of 60%. Why can't you write HAVING answered_share >= 60, and what are the fixes?",
      a: "Because SELECT aliases are assigned after HAVING evaluates — at gate time answered_share doesn't exist yet, only the folds do. Fix one: repeat the expression — HAVING 100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) >= 60 — single pass, verbose, portable. Fix two: stage it — fold per family in a CTE, then WHERE answered_share >= 60 outside, which reads like the metric the memo named. The deeper probe: HAVING judges group facts and WHERE judges row facts, and a share is a group fact built from two folds over identical rows — the gate belongs after the fold whichever syntax carries it. And the denominator discipline rides along: the share's denominator is ALL sessions in the family, dismissed included, or the floor quietly redefines the funnel.",
      tag: "pipeline",
    },
    {
      id: "quora-t23",
      q: "The digest window is 'Jan 1–7'. A colleague writes created_at BETWEEN '2025-01-01' AND '2025-01-07'. What's the latent bug, and the durable shape?",
      a: "BETWEEN is closed at both ends, and text comparison makes '2025-01-07 09:14' sort AFTER '2025-01-07' — so the right edge excludes the very day it names the moment stamps carry time-of-day. Today's midnight-pure stamps make it look correct; the first intraday write shrinks the window silently, and the digest never knows. The durable shape is half-open: created_at >= '2025-01-01' AND created_at < '2025-01-08' — the right edge is the start of the day AFTER the last one wanted, which survives time-of-day, time zones, and stamp granularity forever. The habit: day windows are always [start, next-start), and BETWEEN is reserved for genuinely closed ranges — counts and quantities, not the calendar.",
      tag: "dates",
    },
    {
      id: "quora-t24",
      q: "The ledger ties at 181,080 every close — until it doesn't. Walk me through the reconciliation query you'd reach for first.",
      a: "A two-sided diff, not a sum check: the sum says 'off by N' but not WHERE. LEFT JOIN the two ledgers on their shared key both ways — rows on the ledger side with no payment (NULL on the right) and rows on the payment side with no ledger match — and the mismatches name themselves. The UNION ALL shape generalizes it: tag each side with a source literal, UNION ALL, GROUP BY the key, and any key whose branch counts disagree (or that appears once) is the orphan — invoice 11, void but carrying a 925.00 payment, surfaces as exactly that shape. The discipline: reconcile in the storage units (cents), run both directions so orphans on either side surface, and treat the diff list — not the total — as the deliverable. 'Off by 925' is an alert; 'invoice 11, void, one payment' is a fix.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "quora-mcq-1",
      prompt: "The EU cohort shows 45 ask-to-answer sessions from 8 users. After joining sessions to users, what does COUNT(DISTINCT o.customer_id) return for EU — and what was the 45?",
      choices: [
        "8 — the fold to people; 45 was the session rows",
        "45 — the join preserves every session",
        "16 — every user on the book",
        "8 — and 45 was never a real count",
      ],
      answer: 0,
      why: "COUNT(DISTINCT customer_id) folds repeat sessions back to people: EU's 45 rows collapse to 8 users. COUNT(*) reads 45 — network load; the DISTINCT reads 8 — audience. The gap between the columns is the intensity signal.",
      notes: [
        { choice: 1, why: "COUNT(*) counts the 45 joined rows — that's the sessions column, not the users column; without DISTINCT the census prints the same number twice and loses the audience read." },
        { choice: 2, why: "16 is the whole user book; the cohort fold happens after GROUP BY region — 8 is EU's share, not the platform's." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-2",
      prompt: "Sessions split 52 posted / 30 queued / 14 drafting / 7 dismissed. How many rows carry the answer-posted stamp (shipped_at IS NOT NULL)?",
      choices: [
        "52 — only posted answers are stamped",
        "82 — posted plus queued sessions are stamped",
        "103 — every session gets a stamp",
        "44 — posted plus dismissed",
      ],
      answer: 1,
      why: "The stamp lands when an answer posts or is queued for distribution: 52 + 30 = 82 of 103. The unstamped 21 are the drafting-plus-dismissed tail — reported as a state, never as zero.",
      notes: [
        { choice: 0, why: "52 is the posted arm only; queued sessions carry the stamp too — the digest already received the answer." },
        { choice: 2, why: "103 counts every session; 21 of them have no stamp yet — COUNT(shipped_at) is the stamped census, COUNT(*) the full book." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-3",
      prompt: "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) runs over all 103 sessions. How many rows take the ELSE branch?",
      choices: [
        "7 — the dismissed rows",
        "96 — posted, queued and drafting rows all land in ELSE",
        "103 — ELSE fires on every row",
        "0 — ELSE never fires when a WHEN exists",
      ],
      answer: 1,
      why: "ELSE catches every row no WHEN claimed: 103 − 7 = 96 rows contribute 0. Reading ELSE as a named status is how funnel arms leak into each other.",
      notes: [
        { choice: 0, why: "Dismissed is 7 of the 96 — the WHEN branch; ELSE is 'everything else', and its width only grows as statuses multiply." },
        { choice: 2, why: "ELSE fires 96 times here, not 103 — the WHEN claims the 7 dismissed first." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-4",
      prompt: "Invoice #11 — the void-but-paid anomaly — holds 925 cents. Which expression prints 9.25?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 100",
        "ROUND(amount_cents, 2)",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic: 9.25 dollars. The .0 is the whole fix — 925 / 100 in integer math truncates to 9, silently eating the quarter on every odd-cent row.",
      notes: [
        { choice: 0, why: "Integer ÷ integer in SQLite truncates: 925/100 = 9. Whole-dollar rows hide the leak; the first odd-cent payment exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying turns cents into 92,500 — units inverted. Dollars are smaller than cents; sanity-check the magnitude before shipping." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-5",
      prompt: "Monthly sessions run 6–9 across the 14-month calendar; six months reach 8 or more. Which query keeps only those months?",
      choices: [
        "WHERE COUNT(*) >= 8 … GROUP BY month",
        "GROUP BY month HAVING COUNT(*) >= 8",
        "GROUP BY month WHERE COUNT(*) >= 8",
        "SELECT month, COUNT(*) AS n … WHERE n >= 8",
      ],
      answer: 1,
      why: "A count is a group fact — it exists only after folding, so the filter is HAVING, after GROUP BY. Six months qualify on this db: 2024-01, 02, 03, 05, 07 and 09.",
      notes: [
        { choice: 0, why: "WHERE runs before groups form — COUNT(*) doesn't exist yet, so the engine rejects it. The rejection is the pipeline-order lesson teaching itself." },
        { choice: 3, why: "Filtering on the alias in WHERE fails the same way — row filters run before the fold produces the alias, so there's nothing to compare yet." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-6",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) runs over all 103 sessions with no WHERE clause. What comes back?",
      choices: [
        "2.98 — AVG skips the 21 NULL stamps and averages the 82 stamped",
        "NULL — one NULL poisons the whole average",
        "2.98/103 — AVG divides by every row including NULLs",
        "An error — you can't subtract NULL dates",
      ],
      answer: 0,
      why: "Aggregate functions ignore NULLs: the average is computed over the 82 stamped sessions and returns 2.98. The WHERE shipped_at IS NOT NULL version returns the same number — it just states the population the arithmetic already assumed.",
      notes: [
        { choice: 1, why: "NULL propagation applies to arithmetic (NULL - x is NULL), not to aggregates — AVG drops the NULL rows and averages the rest." },
        { choice: 2, why: "AVG's denominator is the non-NULL count, 82 — the unstamped 21 never enter either side of the division." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-7",
      prompt: "Two topic bundles tie at 36 answers on the authority ladder. What does DENSE_RANK() OVER (ORDER BY answers DESC) hand the pair — and the next bundle?",
      choices: [
        "Both rank 4; the next bundle gets 5 — ties share a rung, no gaps",
        "Both rank 4; the next gets 6 — the gap is honest",
        "4 and 5 — ties must not share a rank",
        "Both rank 5 — ties rank last",
      ],
      answer: 0,
      why: "DENSE_RANK shares the rung and hands the next distinct value the very next rank: 3, 4, 4, 5. RANK would gap to 6; ROW_NUMBER would split the tie 4/5 arbitrarily.",
      notes: [
        { choice: 1, why: "That's RANK's behavior — the gap after a tie implies a missing ladder position that doesn't exist. DENSE_RANK is the no-gap sibling." },
        { choice: 2, why: "ROW_NUMBER splits ties by arbitrary engine order — exactly the silent erasure the community lead will catch in review." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-8",
      prompt: "'Users with at least one dismissed session', evaluated per user over a huge sessions table. Why does a senior reach for EXISTS over IN?",
      choices: [
        "EXISTS reads better in code review",
        "EXISTS short-circuits at the first dismissed row per user; IN materializes the full dismissed set before comparing",
        "IN can't handle duplicates",
        "EXISTS is the only form that survives NULLs",
      ],
      answer: 1,
      why: "The EXISTS probe per outer row quits at the first hit — average work is one match, not the whole set. IN builds (or hash-builds) the entire value list before comparing. Identical results here; different cost profile.",
      notes: [
        { choice: 2, why: "Duplicates are fine for both — IN over a multiset and EXISTS over duplicates agree. The choice is evaluation strategy, not dedupe." },
        { choice: 3, why: "Backwards: it's NOT IN that breaks on NULLs — one NULL in the inner list empties the result. Plain IN and EXISTS both survive." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-9",
      prompt: "The dismissed-share report reads 0.0 for every cohort — but the dismissed counts themselves are healthy in the raw table. Which bug does that signature point to?",
      choices: [
        "The dismissed rows were filtered out in WHERE before the ratio — the denominator population no longer contains the event",
        "Integer division truncating shares below 1%",
        "An ASC/DESC flip in the ORDER BY",
        "A missing DISTINCT inflating the numerator",
      ],
      answer: 0,
      why: "Filter the dismissed rows out in WHERE and the conditional SUM over the flag returns 0 in every group — 0 ÷ anything is 0.0. The numerator died upstream of the ratio; the share column is honest arithmetic over an amputated population.",
      notes: [
        { choice: 1, why: "Integer division truncates toward zero but rarely to a flat 0.0 across all cohorts while counts stay healthy — and 100.0 * fixes it anyway." },
        { choice: 2, why: "Sort direction changes row order, never values — a 0.0-everywhere report is a population bug, not a presentation bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-10",
      prompt: "You join sessions to their question batches to count sessions per cohort, and COUNT(*) reads 251. What happened?",
      choices: [
        "The join fanned sessions out to batch grain — one row per batch, 251 of them; fold with COUNT(DISTINCT o.id) or aggregate sessions first",
        "COUNT(*) is broken on joins — use COUNT(1)",
        "251 is correct — the book has 251 sessions",
        "The join duplicated the users table",
      ],
      answer: 0,
      why: "Sessions-to-batches is a one-to-many join: 103 sessions fan out to 251 batch rows, and COUNT(*) counts the fan-out. COUNT(DISTINCT o.id) folds back to the session grain — or fold sessions first and join the aggregate.",
      notes: [
        { choice: 2, why: "103 is the session count; 251 is the batch count — the grain changed mid-query and nobody said so. That's the alarm, not a finding." },
        { choice: 3, why: "The duplication came from the sessions-to-batches direction; users were never touched. Trace the fan-out to the one-to-many edge." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-11",
      prompt: "The clean-hands register LEFT JOINs users to dismissed sessions. A reviewer adds WHERE o.status = 'cancelled' to 'make the filter explicit'. What ships?",
      choices: [
        "The same register, just clearer",
        "An INNER join on dismissal — the clean users vanish and the register lists the accused",
        "Every user twice",
        "A syntax error",
      ],
      answer: 1,
      why: "A WHERE predicate on the right table can only evaluate on matched rows, so the NULL-extended survivors fail it and drop out — the anti-join silently becomes an INNER join. The status belongs in the ON clause; WHERE keeps only o.id IS NULL.",
      notes: [
        { choice: 0, why: "The register halves in size and inverts in meaning — 12 clean users become 4 dismissed-havers — with zero errors raised." },
        { choice: 2, why: "Doubling needs a join-condition change; this one only re-filters. The quiet conversions are the dangerous ones." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-12",
      prompt: "STRFTIME('%Y-%m', created_at) buckets the 103 sessions for the digest calendar. How many buckets — and what does '%Y' build instead?",
      choices: [
        "14 monthly buckets; '%Y' builds 2 year-long buckets",
        "2 buckets; '%Y' builds 14",
        "12 monthly buckets; '%Y' builds 12",
        "14 monthly buckets; '%Y' errors",
      ],
      answer: 0,
      why: "2024-01 through 2025-02 is 14 distinct month keys — the digest calendar's spine. '%Y' runs fine and collapses the calendar into 2024 and 2025: a valid query that no longer contains a month.",
      notes: [
        { choice: 1, why: "Inverted — the %Y-%m spine is the granular one; the year is the collapse." },
        { choice: 2, why: "12 would merge January-2024 with January-2025 — that's '%m' alone, a different bucketing bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-13",
      prompt: "The digest email carries each reader's three freshest sessions. Which shape is right?",
      choices: [
        "ORDER BY created_at DESC LIMIT 3",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) staged in a CTE, then rn <= 3",
        "GROUP BY customer_id LIMIT 3",
        "TOP 3 PER customer",
      ],
      answer: 1,
      why: "'Per reader' is a PARTITION — the window numbers sessions inside each reader, and the outer rn <= 3 keeps the three freshest per partition. The recent-3 rail is the digest's backbone and this is its exact shape.",
      notes: [
        { choice: 0, why: "LIMIT 3 is global — three users would own the entire email and everyone else's rail reads empty." },
        { choice: 2, why: "LIMIT inside GROUP BY isn't SQL — and grouping alone collapses each reader to one arbitrary row." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-14",
      prompt: "Answer revisions pile up in the raw log. The clean layer keeps the NEWEST revision per answer — reproducibly. Which fold?",
      choices: [
        "GROUP BY answer_id with MAX(created_at)",
        "ROW_NUMBER() OVER (PARTITION BY answer_id ORDER BY created_at DESC, id DESC), then rn = 1",
        "GROUP BY answer_id with MIN(id)",
        "ORDER BY created_at LIMIT 1",
      ],
      answer: 1,
      why: "Keep-latest is a staged window: rank revisions inside each answer, newest first, with the id tiebreak so same-second revisions resolve deterministically — the clean layer rebuilds identically every run.",
      notes: [
        { choice: 0, why: "MAX(created_at) returns the timestamp, not the row — and without the tiebreak, same-second revisions resolve by engine mood." },
        { choice: 2, why: "MIN(id) keeps the OLDEST revision — the exact opposite of the clean layer's contract." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-15",
      prompt: "Writing streaks: which expression is the island key — constant inside a run of consecutive days, jumping at every gap?",
      choices: [
        "julianday(day) - LAG(julianday(day)) OVER (ORDER BY day)",
        "day - ROW_NUMBER() OVER (ORDER BY day)",
        "COUNT(*) OVER (ORDER BY day)",
        "STRFTIME('%w', day)",
      ],
      answer: 1,
      why: "Day minus row-number advances one per row and one per calendar day — consecutive days share the value, every gap breaks it. GROUP BY user and island key, COUNT for run length: the gaps-and-islands canon behind the habit board.",
      notes: [
        { choice: 0, why: "That's the session-stitch gap measure — it detects a break, it doesn't key the run. Neighboring drill, wrong tool." },
        { choice: 3, why: "Weekday buckets merge every Monday in history — no adjacency survives." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-16",
      prompt: "The sweep writes WHERE shipped_at NOT IN (SELECT shipped_at FROM orders). The inner list carries 21 NULLs. What returns?",
      choices: [
        "The 21 unstamped sessions",
        "No rows — one NULL in the list defeats every NOT IN comparison",
        "All 103 sessions",
        "A type error",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be proven true — every comparison with NULL is unknown. The audit ships empty and reads as good news; NOT EXISTS or an inner IS NOT NULL filter is the fix.",
      notes: [
        { choice: 0, why: "That's the intent — and precisely why the bug survives code review: an empty register looks like nobody was flagged." },
        { choice: 2, why: "Backwards: plain IN over NULLs yields what it can prove; NOT IN over NULLs yields nothing at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-17",
      prompt: "The Quora+ book sums to 69,612 cents across both rails. Which fold prints honest dollars at the display edge?",
      choices: [
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "SUM(amount_cents / 100)",
        "SUM(CAST(amount_cents AS TEXT))",
      ],
      answer: 1,
      why: "Fold in INTEGER cents, convert once at the edge with the .0 promotion: 69,612 / 100.0 = 696.12. House style exists because the other shapes leak — cents are the storage unit and the reconciliation unit.",
      notes: [
        { choice: 0, why: "Integer division: 69,612 / 100 = 696 — the register prints $696 and eats the 12 cents on every close." },
        { choice: 2, why: "Per-row truncation: every odd-cent amount loses its cents BEFORE the sum — the error compounds across rows instead of canceling." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-18",
      prompt: "Digest window 'Jan 1–7' is written created_at BETWEEN '2025-01-01' AND '2025-01-07'. Stamps are midnight-pure today. The latent bug?",
      choices: [
        "None — BETWEEN is the recommended day-window shape",
        "The closed right edge: any time-of-day on Jan 7 sorts AFTER '2025-01-07' and leaks out once stamps gain intraday time — the durable shape is >= '2025-01-01' AND < '2025-01-08'",
        "BETWEEN excludes Jan 1",
        "BETWEEN errors on text timestamps",
      ],
      answer: 1,
      why: "Text comparison: '2025-01-07 09:14' > '2025-01-07', so the closed edge drops the day it names. Half-open [start, next-start) survives time-of-day, time zones and stamp granularity forever.",
      notes: [
        { choice: 0, why: "It works only while stamps stay midnight-pure — a latent bug that fires silently the first time the event store writes a real clock time." },
        { choice: 2, why: "BETWEEN is inclusive on the LEFT end too — the flaw is specifically the closed right edge." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-19",
      prompt: "Mutual-follow pairs must not double-count in the graph census. Which predicate canonicalizes the self-join?",
      choices: [
        "f1.follower < f1.followed — one row per unordered pair",
        "f1.follower != f1.followed",
        "f1.follower = f1.followed",
        "SELECT DISTINCT *",
      ],
      answer: 0,
      why: "The ordered-pair predicate keeps one direction of each mutual pair — without it, every mutual pair appears twice and the census inflates by exactly 2x, the self-join's signature silent fan-out.",
      notes: [
        { choice: 1, why: "a != b excludes self-follows but keeps BOTH directions of each mutual pair — the doubling survives." },
        { choice: 3, why: "DISTINCT dedupes identical rows, but the two directions are distinct rows — dedupe can't fix a join-shape bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-20",
      prompt: "The digest template needs each reader's topics as one cell. What's the order hazard with GROUP_CONCAT?",
      choices: [
        "GROUP_CONCAT returns the topics in engine-arbitrary order unless the aggregate is fed from a pre-ordered derived table",
        "GROUP_CONCAT sorts alphabetically by default",
        "GROUP_CONCAT errors on more than three items",
        "Order is irrelevant — the cell is a set",
      ],
      answer: 0,
      why: "The fold preserves no order you didn't force: feed it from a CTE with ORDER BY, or the email reads differently on every run. Picking WHICH topics (cap, dedupe, rank) happens before the string forms — the aggregate can't do it after.",
      notes: [
        { choice: 1, why: "No default sort — the order follows the scan, which changes with the plan." },
        { choice: 3, why: "The cell is a presentation artifact: 'TopWriter, AskGraph, Digest' vs 'Digest, AskGraph, TopWriter' read differently to humans and to tests." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-21",
      prompt: "'Users who never dismissed a request', against a dismissals list that may carry NULLs tomorrow. Which shape survives?",
      choices: [
        "NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')",
        "LEFT JOIN orders ON the user key AND status = 'cancelled', keep WHERE o.id IS NULL — or NOT EXISTS",
        "Both are equally NULL-safe",
        "IN (SELECT customer_id FROM orders WHERE status = 'cancelled')",
      ],
      answer: 1,
      why: "The anti-join shapes answer per row and don't need to prove a universal negative; NOT IN collapses to nothing the day one NULL enters the inner list. The register stays trustworthy under data drift.",
      notes: [
        { choice: 0, why: "Correct today — customer_id is NOT NULL — and wrong the first time the list carries a NULL. Fragility is the disqualification." },
        { choice: 3, why: "IN finds who DID dismiss — the register's complement, the accused instead of the clean." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-22",
      prompt: "Every writer row must carry the platform-average engagement (338.19) beside their own total. Which shape?",
      choices: [
        "WHERE total > (SELECT AVG(total) FROM orders)",
        "AVG(total) OVER () as a passenger column on the writer fold",
        "GROUP BY platform_average",
        "JOIN to a small averages table",
      ],
      answer: 1,
      why: "The window annotates without collapsing: all writers stay, each beside the bar they're measured against. The scalar-in-WHERE shape amputates — 42 of 103 sessions above the bar, the below-bar population deleted from a report titled 'all writers vs the average'.",
      notes: [
        { choice: 0, why: "That's the qualification read — a different deliverable wearing the same subquery. Annotate vs amputate is decided by the ask, not the syntax." },
        { choice: 2, why: "There's no platform entity to group by — and grouping would collapse the writers, the opposite of the annotation ask." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-23",
      prompt: "'Most engaged topic per reader' is built with ORDER BY engagement DESC LIMIT 1 per reader. What breaks?",
      choices: [
        "Ties — LIMIT 1 picks arbitrarily; a rank window with a deterministic tiebreak is the honest shape",
        "Nothing — LIMIT 1 is the argmax",
        "Only performance",
        "An aggregation error",
      ],
      answer: 0,
      why: "Two topics tied at the top resolve by engine mood — rerun and a different topic wears the badge. ROW_NUMBER with an explicit tiebreak (engagement DESC, topic ASC) makes the argmax reproducible, which is what a badge needs.",
      notes: [
        { choice: 1, why: "It IS an argmax — an unstable one. Determinism is part of the definition, not polish." },
        { choice: 2, why: "The cost is fine; the correctness isn't. A tie is a data shape, not a workload problem." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-24",
      prompt: "Engagement per ANSWER — sessions carry question batches, batches carry quantities. Which ratio is honest?",
      choices: [
        "AVG(oi.quantity * oi.unit_price)",
        "SUM(oi.quantity * oi.unit_price) / SUM(oi.quantity)",
        "AVG(oi.unit_price)",
        "SUM(oi.unit_price) / COUNT(*)",
      ],
      answer: 1,
      why: "A ratio of folds over the same rows: total engagement priced over total answers — batches weighted by their size. The per-batch average weighs a two-answer batch the same as a nine-answer batch, skewing toward small ones.",
      notes: [
        { choice: 0, why: "That's the mean per BATCH, not per answer — a plausible number that answers a different question, with the skew invisible in the output." },
        { choice: 3, why: "SUM of unit prices ignores quantities entirely — the answers dimension vanishes from both folds." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-25",
      prompt: "The dedupe sweep must catch 'Alice@x.com' and 'alice@x.com'. Which census finds them?",
      choices: [
        "GROUP BY email HAVING COUNT(*) > 1",
        "GROUP BY LOWER(email) HAVING COUNT(*) > 1",
        "SELECT DISTINCT email",
        "WHERE email = UPPER(email)",
      ],
      answer: 1,
      why: "Case is not identity on this graph — normalize the key FIRST, then count: the two spellings fold to one key and the collision surfaces. Grouping the raw strings merges nobody and the census reports clean.",
      notes: [
        { choice: 0, why: "The exact miss the sweep exists to catch — raw grouping treats case as identity and passes the duplicates through." },
        { choice: 2, why: "DISTINCT lists unique spellings — it never compares them, so it can't find the collision either." },
      ],
      difficulty: "hard",
    },
    {
      id: "quora-mcq-26",
      prompt: "Two reader rows differ only by case: 'Alice@x.com' and 'alice@x.com'. The join-safe habit is…",
      choices: [
        "LOWER() both sides before any comparison or join",
        "UPPER() only the smaller table",
        "TRIM() is sufficient",
        "Cast both to INTEGER",
      ],
      answer: 0,
      why: "Normalize BOTH sides — a join on unnormalized keys silently fans out or drops matches depending on which spelling landed where. One canonical form, applied at every comparison point, ideally once in a cleaned layer.",
      notes: [
        { choice: 1, why: "Normalizing one side only guarantees the mismatch you were trying to fix." },
        { choice: 2, why: "TRIM fixes surrounding whitespace, not case — 'Alice@x.com' and 'alice@x.com' survive a trim untouched." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-27",
      prompt: "Digest trend: month-over-month delta across the 14-bucket calendar. Why can't LAG(COUNT(*)) OVER (ORDER BY month) be written in the same SELECT as the GROUP BY?",
      choices: [
        "Aggregates fold before windows evaluate — stage the fold in a CTE, then LAG the folded column outside",
        "LAG can't order by text columns",
        "COUNT(*) is not allowed inside windows",
        "It works, but only with PARTITION BY",
      ],
      answer: 0,
      why: "The window would compute over pre-aggregation rows — the engine rejects the mixed grain. Two stages: fold sessions per month in the CTE, then LAG(sessions) OVER (ORDER BY month) over the folded rows, and the delta is a subtraction away.",
      notes: [
        { choice: 3, why: "PARTITION BY doesn't fix a grain conflict — the issue is WHEN windows run, not which partition they see." },
        { choice: 1, why: "LAG orders by any sortable column — text month keys order correctly. The wall is the aggregate, not the type." },
      ],
      difficulty: "medium",
    },
    {
      id: "quora-mcq-28",
      prompt: "Stamp coverage: the census of sessions still missing the posted stamp, out of 103. Which expression?",
      choices: [
        "COUNT(*) - COUNT(shipped_at)",
        "COUNT(shipped_at) - COUNT(*)",
        "SUM(shipped_at)",
        "AVG(shipped_at IS NULL)",
      ],
      answer: 0,
      why: "COUNT(*) keeps every row (103), COUNT(shipped_at) skips NULLs (82) — the difference, 21, IS the unstamped census: drafting plus dismissed, reported as a state, never coalesced to zero.",
      notes: [
        { choice: 1, why: "Negative 21 — the folds are backwards. Right instinct, inverted subtraction." },
        { choice: 3, why: "AVG of the flag gives the share (0.204), not the census — a rate where a count was asked." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-29",
      prompt: "'Answers written per session' — question batches carry a quantity column. Which fold counts answers?",
      choices: [
        "COUNT(*) over the joined batch rows",
        "SUM(oi.quantity)",
        "COUNT(DISTINCT oi.quantity)",
        "AVG(o.total)",
      ],
      answer: 1,
      why: "A batch row represents quantity answers — SUM(quantity) folds 251 batch rows into the answers census. COUNT(*) counts batches and undercounts by exactly the batching factor; the session grain needs COUNT(DISTINCT o.id).",
      notes: [
        { choice: 0, why: "251 — that's the batch census, not answers. The quantity column exists precisely because rows aren't answers." },
        { choice: 2, why: "Distinct quantity VALUES (1, 2, 3…) is a tiny histogram, not a census — a category count wearing a SUM's clothes." },
      ],
      difficulty: "easy",
    },
    {
      id: "quora-mcq-30",
      prompt: "The billing close must surface invoices marked void that still carry payments. Which query finds them?",
      choices: [
        "WHERE i.status = 'void' on the invoices table alone",
        "Invoices INNER JOIN payments WHERE i.status = 'void' — the join is what proves the payment exists",
        "GROUP BY status",
        "HAVING SUM(payments) = 0",
      ],
      answer: 1,
      why: "Void is a label on invoices; the anomaly is the JOIN — a payment row attached to a void invoice (invoice 11, 925.00). Only the join exposes money moving against a closed document.",
      notes: [
        { choice: 0, why: "That lists every void invoice — most are legitimately unpaid. The census can't separate the 925.00 anomaly from clean closures." },
        { choice: 3, why: "Sum-zero finds unpaid PAID invoices — the mirror anomaly, not this one. Both belong on the register; neither is this query." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-quora-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The topic-authority board",
      brief:
        "Quora-flavored brief on the storefront db: the discovery team's topic-authority board wants the topic families that actually carry the ask-graph — sessions that touched them, answers written, engagement earned — gated so thin families stop impersonating trends. The db mapping is declared: orders are ask-to-answer sessions, order_items are question batches (quantity = answers), products are topic bundles, category is the topic family. Probed facts: 251 batches fold to Audio 46 sessions / 97 answers / 11,744.01 engagement, Accessories 54 / 121 / 3,294.29, Video 30 / 61 / 5,198.41 and Electronics 40 / 85 / 4,818.61 — with Wearables (23), Apparel (22) and Fitness (13) below the memo's 30-session authority floor. The board ships the survivors, heaviest engagement first.",
      ask: "Return each topic family clearing the 30-session floor with sessions, answers and engagement (2 decimals), heaviest engagement first.",
      template:
        "SELECT p.category,\n       COUNT(DISTINCT {1}) AS sessions,\n       SUM(oi.quantity) AS answers,\n       ROUND(SUM({2}), 2) AS engagement\nFROM order_items oi\nJOIN products p ON {3}\nGROUP BY p.category\nHAVING COUNT(DISTINCT oi.order_id) >= {4}\nORDER BY engagement {5};",
      slots: [
        {
          answer: "oi.order_id",
          kind: "keyword",
          label: "the session key",
          why: "COUNT(DISTINCT oi.order_id) folds the batch fan-out back to sessions — Audio's batch rows collapse to 46 distinct sessions. Folding on quantity or a constant would count batches-in-disguise and the board loses the session grain.",
        },
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the engagement expression",
          why: "Engagement is answers × per-answer value, folded per family: Audio 11,744.01. SUM(oi.quantity) alone re-prices the board in raw answers (Audio 97) — a real-looking number that isn't engagement.",
        },
        {
          answer: "p.id = oi.product_id",
          kind: "keyword",
          label: "the bundle join",
          why: "Each batch attaches to its topic bundle on the product key — the only join that lands answers on the right family. Matching p.id to the session id scrambles every fold onto wrong families.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the authority floor",
          why: "The memo fixes the floor at 30 sessions — exactly Video's count, so the gate keeps Audio (46), Accessories (54), Electronics (40) and Video (30) and drops Wearables (23), Apparel (22) and Fitness (13). 13 would wave all seven families through; 40 would drop Video on its own boundary.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the engagement-first order",
          why: "The board leads with the heaviest family: Audio 11,744.01, then Video 5,198.41, Electronics 4,818.61, Accessories 3,294.29. ASC would open with Accessories' 3,294.29 — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "ASC", "oi.quantity", "p.id = oi.order_id", "13", "40"],
      walkthrough:
        "A join-fold-gate board. The join attaches every one of the 251 batch rows to its bundle's family; GROUP BY folds them per family; inside each fold, COUNT(DISTINCT oi.order_id) counts sessions (46 / 54 / 40 / 30 among survivors), SUM(oi.quantity) counts answers (97 / 121 / 85 / 61), and ROUND(SUM(quantity × unit_price), 2) prices engagement — Audio 11,744.01 leads, then Video 5,198.41, Electronics 4,818.61, Accessories 3,294.29. The HAVING floor keeps families with ≥ 30 sessions: Video sits exactly on 30, so the floor's own number is visible in the output, while 23, 22 and 13 drop. ORDER BY engagement DESC puts Audio on top. SUM in the key slot errors out loud; oi.quantity in the engagement slot quietly re-prices the board in raw answers; the wrong join key (p.id = oi.order_id) matches bundles to session ids and scrambles every fold; 13 in the floor waves all seven families through; 40 drops Video on the boundary; ASC flips the board to the thinnest survivor first. Grain, key, gate, order — the four checks every authority board must survive.",
    },
    {
      id: "cs-quora-2",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The ask-to-answer triage grid",
      brief:
        "Quora-flavored brief on the storefront db: the trust-and-safety review opens with the ask-to-answer triage grid — one row per market cohort, one column per session outcome, because a funnel that hides its declines isn't a funnel. The mapping is declared: orders are ask-to-answer sessions, status is the outcome — delivered = answer posted, shipped = queued into the digest, pending = draft still open, cancelled = request dismissed. Probed facts, per cohort: EU 24 posted / 12 queued / 6 drafting / 3 dismissed of 45 sessions; APAC 21 / 8 / 5 / 3 of 37; US 5 / 10 / 3 / 1 of 19; LATAM 2 / 0 / 0 / 0 of 2. The grid must reconcile: the four arms sum to the cohort's session count by construction, and the vocabulary stays session-side — invoice states like void and paid do not exist here.",
      ask: "Return one row per market cohort: posted, queued, drafting and dismissed session counts plus total sessions, heaviest posted count first.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS posted,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS queued,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS drafting,\n       SUM(CASE WHEN o.status = {4} THEN 1 ELSE 0 END) AS dismissed,\n       COUNT(*) AS sessions\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY posted {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the posted flag",
          why: "The delivered status means the answer posted: EU 24, APAC 21, US 5, LATAM 2. Unquoted delivered would be read as a column reference and error — the literal needs its quotes.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the queued flag",
          why: "30 sessions queued answers into the digest — 12 of them in EU. 'paid' would read 0 forever: that's an invoice state, not a session outcome, and cross-table vocabularies are exactly the mix-up this grid guards against.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the drafting flag",
          why: "14 drafts still open — 6 in EU, 5 in APAC, 3 in US. 'void' reads 0 here: void is an invoice status, and a branch holding it ships a silent hole where the drafting queue should be.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the dismissed flag",
          why: "7 dismissed requests — 3 EU, 3 APAC, 1 US. The arm must stay in the grid: the decline rate's denominator is ALL picked-up sessions, and hiding the declines makes the funnel lie by omission.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the posted-first order",
          why: "The review leads with the cohort carrying the most posted answers: EU 24, APAC 21, US 5, LATAM 2. ASC would open with LATAM's 2 — a correct query aimed at the wrong end of the funnel.",
        },
      ],
      distractors: ["'void'", "'paid'", "''", "ASC"],
      walkthrough:
        "Four CASE arms, one pass, one reconciliation. The join stamps every session with its cohort; the CASE inside each SUM turns status into a 1/0 flag per row — SUM adds the 1s: EU 24 posted / 12 queued / 6 drafting / 3 dismissed, APAC 21 / 8 / 5 / 3, US 5 / 10 / 3 / 1, LATAM 2 / 0 / 0 / 0 — while COUNT(*) holds the cohort totals (45 / 37 / 19 / 2). The identity is the audit: the four arms sum to sessions in every row, so any arm reading 0 where the facts say otherwise is a vocabulary leak, not a quiet cohort. ORDER BY posted DESC opens the review with EU. The classic failure is the finance-vocabulary leak: 'void' and 'paid' are invoice statuses, not session outcomes — a branch holding one reads 0 forever and the grid ships with a hole where a queue should be; the empty literal does the same. ASC flips the board to LATAM-first. The CASE-SUM twin of the FILTER census — same population, same reconciliation, one scan.",
    },
    {
      id: "cs-quora-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The writer ladder, cohort by cohort",
      brief:
        "Quora-flavored brief on the storefront db: the community team ships the writer leaderboard partitioned by market cohort — every region gets its own ladder from one scan, because comparing a 45-session cohort against a 2-session cohort on one ladder is how small markets get invisible. The mapping is declared: orders are ask-to-answer sessions, customers are users, regions are cohorts. Probed facts: platform-wide the leaders are Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, then the mid-tail at 5, 4, 4, 4, 4, 3, 3 and the 2/2/2/1/1 floor. The roster keeps active writers only — at least two sessions — and ranks with competition semantics inside each cohort: ties share a rung, the next rung skips, and the gap is the feature the community lead checks first (EU's three-way 4-session tie pushes the next writer to rank 6, and a dense ladder would have said rank 4 — a different story about how many writers the tie displaced).",
      ask: "Return per writer: name, cohort, session count and competition rank within their cohort (ties shared, gaps kept) for writers with at least two sessions, ordered by cohort then rank.",
      template:
        "WITH per_user AS (\n  SELECT c.name AS name,\n         c.region AS region,\n         COUNT(*) AS sessions\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name, c.region\n)\nSELECT name, region, sessions, {1}() OVER (PARTITION BY region ORDER BY sessions {2}) AS ladder\nFROM per_user\nWHERE sessions >= {3}\nORDER BY region, ladder, name;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the competition rank",
          why: "RANK shares the rung and skips: EU's three 4-session writers all take rank 3 and Dmitri's 2 sessions take rank 6 — the gap is the ladder reporting that a tie displaced positions. DENSE_RANK would print 4 and imply nobody was displaced.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "Each cohort's ladder opens at its leader — Alice's 24 in EU, Emma's 17 in US, Grace's 14 in APAC. ASC would rank each cohort's quietest writer first: a correct query aimed at the wrong end of every partition.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the activity floor",
          why: "The roster keeps active writers — at least two sessions — so the floor is 2: Jamal Wright, Dmitri Volkov and Bruno Silva sit exactly ON it (their 2s appear in the output) while Olivia Brown and Liam O'Brien (one session each) drop. A 5 would cut the roster to five writers and erase the tie story entirely.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "5"],
      walkthrough:
        "Fold, gate, partition-rank — the leaderboard in three moves. The CTE folds sessions per writer (one row per user, 103 sessions to 16 writers); the WHERE floor at 2 keeps the fourteen active writers — Jamal, Dmitri and Bruno sit exactly on the bar, so the gate audits itself against visible 2s; then the window ranks INSIDE each cohort with competition semantics. EU reads Alice 24 (1), Chloe 5 (2), Pedro/Noah/Isabella sharing 4 (3, 3, 3), Dmitri 2 (6) — the 6 is the whole lesson: the three-way tie displaced three rungs, and a dense ladder's 4 would have hidden that. APAC reads Grace 14 (1), Maya 13 (2), Keiko 4 (3), Hiro and Farid sharing 3 (4, 4) — a terminal tie, where RANK and DENSE_RANK agree, which is exactly why the check must run per cohort, not once globally. DENSE_RANK is the near-miss that changes EU's story; ROW_NUMBER is the silent erasure — 3, 4, 5 across the tie by engine mood, a different writer at each rung on every rerun. ASC inverts every partition. The floor at 5 guts the roster. The interview point: the tie rule and the floor are definitions stated BEFORE the window — and the outer ORDER BY region, ladder, name is the deterministic tiebreak that keeps the packet reproducible.",
    },
    {
      id: "cs-quora-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The digest planning census",
      brief:
        "Quora-flavored brief on the storefront db: the digest team plans its monthly send off a one-pass census — sessions, posted answers and queued answers per month, folded with FILTER so the arms share one scan and can never drift from the total. Probed facts across the 14-month calendar (2024-01 to 2025-02): every month carried 6 to 9 sessions; the 9-session peaks are 2024-02 (4 posted, 4 queued) and 2024-09 (7 posted, 2 queued); the six 8-session months are 2024-01, 03, 05, 07; the three 6-session floor months are 2024-06, 2024-11, 2025-01. The planning review keeps the carrying months — seven or more sessions — and reads newest-first, because the next send is planned against the freshest bucket. The arms must reconcile: posted plus queued plus drafting plus dismissed equals the month's census, by construction.",
      ask: "Return per month: total sessions, posted answers and queued answers — for months carrying at least 7 sessions, newest first.",
      template:
        "SELECT STRFTIME('%Y-%m', created_at) AS month,\n       COUNT(*) AS sessions,\n       COUNT(*) FILTER (WHERE status = {1}) AS posted,\n       COUNT(*) FILTER (WHERE status = {2}) AS queued\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY month {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the posted literal",
          why: "Posted means the session produced an answer — the event store spells that 'delivered' (7 of 2024-09's nine sessions). 'pending' is the drafting state: the branch compiles and reads zero forever, shipping a digest plan with no answers in it.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the queued literal",
          why: "Queued into the digest is the 'shipped' state — 4 of the 2024-02 peak. 'paid' is an invoice state from another table's vocabulary: legal SQL, a silent zero, and the classic cross-table leak this census guards against.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the carrying floor",
          why: "The floor keeps the eleven months carrying 7-plus sessions and drops the three 6-session months (2024-06, 2024-11, 2025-01) — and 7 is visible in the output on the boundary months (2024-04, 08, 10, 12, 2025-02), so the gate audits itself. A 9 would keep only the two peaks and the plan would lose the carrying trend.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first direction",
          why: "The next send is planned against the freshest bucket: 2025-02 leads the packet. ASC would open on January 2024 — a correct census aimed thirteen months away from the decision.",
        },
      ],
      distractors: ["'pending'", "'paid'", "9", "ASC"],
      walkthrough:
        "One scan, three folds, one reconciliation — the digest calendar in a single pass. The %Y-%m spine buckets the 103 sessions into 14 months; COUNT(*) folds the load; the two FILTER arms fold posted and queued from the same rows — 2024-09 reads 9 sessions / 7 posted / 2 queued while 2024-02 reads 9 / 4 / 4, and because the arms never left the scan they cannot disagree with the census the way two separate queries can. The HAVING floor at 7 keeps the carrying months — the three 6-session troughs drop, and the boundary months wear their 7 in the output so the gate is self-auditing. ORDER BY month DESC reads newest-first for the send planning. The September-versus-February peak is the planning story: the same 9-session load delivered 7 posted answers once and 4 the other time — capacity, not volume, is what moved. The vocabulary distractors are the funnel's classic holes: 'pending' is the drafting state (a real status, the WRONG arm — posted reads zero and the plan ships answerless), 'paid' is invoice vocabulary leaking across tables. The floor at 9 dissolves the trend into two data points. ASC aims the packet at the oldest month. Filter-vs-FILTER is the last beat: the arms must stay conditional aggregates over ALL rows — a WHERE on status would rebuild the population and every month would read 100% posted, the denominator-drift failure this one-pass census is built to make impossible.",
    },
    {
      id: "cs-quora-5",
      tier: "medium",
      topic: "q2",
      universe: "growth",
      title: "The engagement bar",
      brief:
        "Quora-flavored brief on the storefront db: the growth review qualifies sessions against the platform-average engagement bar — 338.19 upvote-weighted points, the mean of the whole 103-session book — and ships the qualifying list with the bar annotated on every row, so the number is never separated from the population it came from. Probed facts: 42 of 103 sessions clear the bar; the book's range runs 25.47 to 1,088.44, so the qualifying list opens with the 1,088.44 session and closes near the bar itself. The read is ordered heaviest-first, and the LIMIT is a tripwire set at 42 — the count the review expects: if a rerun ever returns a 43rd row, the bar moved or the population drifted, and the tripwire fails loudly instead of silently re-baselining. The annotation column is computed once as a scalar over the same table the filter reads — one definition of the average, used twice.",
      ask: "Return every session clearing the platform-average engagement: session id, engagement (total), writer name, and the platform average annotated on each row — heaviest first, capped at the expected 42.",
      template:
        "SELECT o.id,\n       o.total,\n       c.name,\n       ROUND((SELECT AVG(total) FROM orders), 2) AS platform_avg\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (SELECT {1}(total) FROM orders)\nORDER BY o.total {2}\nLIMIT {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the bar's fold",
          why: "The bar IS the platform mean — AVG(total) evaluated once over the whole book. SUM(total) compiles and returns 34,833.28: a bar nothing clears, shipping an empty qualification list that reads as a brutal quarter instead of a broken query.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The qualification list opens with the book's heaviest session — 1,088.44. ASC would open at the bar itself with the marginal 339-point session leading a list the review reads as a leaderboard.",
        },
        {
          answer: "42",
          kind: "number",
          label: "the tripwire cap",
          noVerify: true,
          why: "Exactly 42 sessions clear the bar — the LIMIT is the expected count, set so a 43rd row fails loudly: a fifth row appearing means the bar moved or the population drifted, and the tripwire turns a silent re-baseline into a visible incident.",
        },
      ],
      distractors: ["SUM", "ASC", "40"],
      walkthrough:
        "One scalar, two uses, one tripwire. The scalar subquery (SELECT AVG(total) FROM orders) evaluates the platform mean once — 338.19 — and the query uses it twice: as the filter (WHERE o.total > that value) and as the annotation (the platform_avg column rides on every row), so the qualifying 42 sessions ship WITH the bar they cleared instead of a number detached from its population. 42 of 103 clear it; ordered DESC the list opens at 1,088.44 and tapers toward the bar. The LIMIT 42 is the tripwire — the review's expected count, and the one guard that turns population drift into a visible failure rather than a quietly re-baselined metric. SUM in the fold slot is the silent killer: 34,833.28 is a legal bar that nothing exceeds, and the qualification list ships empty — a quarter that reads as collapse. ASC flips the list to marginal sessions first. The cap at 40 is the tripwire firing early: two legitimate qualifiers dropped, the review's arithmetic off by exactly the drift it exists to catch. The interview point: an average used as a threshold should be COMPUTED, not hardcoded — hardcoding 338.19 survives until the book changes, then the bar lies forever.",
    },
    {
      id: "cs-quora-6",
      tier: "medium",
      topic: "j5",
      universe: "fraud",
      title: "The clean-hands register",
      brief:
        "Quora-flavored brief on the storefront db: trust-and-safety ships the clean-hands register — every user who has NEVER dismissed an ask-to-answer request — because the moderation sweep works from the complement of the dismissal log, and the complement is the part that vanishes if the join is written carelessly. The mapping is declared: orders are ask-to-answer sessions, status 'cancelled' means the request was dismissed. Probed facts: 7 of 103 sessions were dismissed, spread across 4 users — which leaves 12 of 16 users on the clean register: Bruno Silva (LATAM), Chloe Dubois, Dmitri Volkov, Isabella Rossi, Liam O'Brien, Noah Meyer, Olivia Brown, Pedro Alvarez (EU), Farid Nasser, Grace Kim, Hiro Tanaka (APAC), Jamal Wright (US). The register is alphabetical, and the join must survive its own empty side: a user with no dismissed session produces a NULL-extended row, and those NULLs ARE the answer.",
      ask: "Return the clean-hands register: name and region for every user with no dismissed session, alphabetical by name.",
      template:
        "SELECT c.name,\n       c.region\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = {1} AND o.status = {2}\nWHERE o.id IS {3}\nORDER BY c.name;",
      slots: [
        {
          answer: "c.id",
          kind: "keyword",
          label: "the user join key",
          why: "Sessions attach to users on the customer edge — o.customer_id = c.id, qualified on both sides. An unqualified customer_id resolves to the orders column and becomes a tautology: every order matches every user, the register empties to nothing. Matching o.id instead scrambles dismissals onto whichever users share id space.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the dismissal literal",
          why: "Dismissed is spelled 'cancelled' in the session store — 7 of 103. 'pending' is the drafting state: joining on it finds users with no DRAFT instead of no DISMISSAL, a different register wearing the same shape. The literal must come from the session outcome vocabulary, not the nearest status column.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched-row test",
          why: "o.id IS NULL keeps exactly the users whose dismissal probe found nothing — the 12 clean hands. IS NOT flips the register to the 4 users who DID dismiss; IS TRUE keeps matched rows only and empties the complement. The unmatched side is the answer; the test must keep it.",
        },
      ],
      distractors: ["'pending'", "NOT", "TRUE", "order_id"],
      walkthrough:
        "An anti-join where the empty side IS the deliverable. The LEFT JOIN probes each user for dismissed sessions — the key is qualified both sides (o.customer_id = c.id: an unqualified customer_id collapses into a tautology that matches every order to every user and ships an empty register) and the status literal lives in the ON clause so it shapes the match without amputating the unmatched; users with a dismissal match to their 7 cancelled sessions, users without survive as NULL-extended rows, and WHERE o.id IS NULL keeps exactly those survivors: twelve names, alphabetical, the register the sweep clears first. The two failure modes this case is built to separate: put the status in WHERE instead of ON and the predicate kills the NULL rows — the register silently inverts to the 4 dismissed-havers, the accused wearing the clean's report; flip IS NULL to IS NOT and the register lists the guilty on purpose, which at least errors in the direction of visibility. 'pending' in the literal slot finds non-drafters instead of non-dismissers — a same-shaped query over the wrong outcome. The wrong key (o.id = c.id) is the nastiest: both id columns are integers, the join runs, and dismissals scatter onto coincidental id matches — a register that's wrong in a way no row count reveals. TRUE in the survival slot empties the complement entirely. The interview point: anti-joins are decided by three placements — the literal in ON, the key on the user edge, NULL in the survival test — and every one of them is the difference between the clean register and the accused list.",
    },
  ],

  problems: [
    { slug: "finding-the-topic-of-each-post", why: "Topic tagging from free text: the topic graph is built by classifying raw question text — this LIKE-driven classifier is the seed of every topic-authority rollup." },
    { slug: "find-trending-hashtags", why: "Trending-topic extraction: digest emails lead with what's surging — count the tokens, rank them, cut the top of the fold exactly as the email team does." },
    { slug: "winning-candidate", why: "Vote argmax: the top-voted answer wins the session — a grouped max fold with the winner named, which is how the 'best answer' badge is computed." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Volume argmax on users: who picked up the most ask-to-answer requests this period — the contributor-load read the community team opens with." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-user argmax with ties: each reader's most-engaged topic family, tie-proofed — because habit graphs tie constantly and LIMIT-1 breaks silently on them." },
    { slug: "the-most-recent-three-orders", why: "The recent-3 rail: digest emails carry each reader's three freshest sessions — ROW_NUMBER with a PARTITION and a deterministic tie-break, the kit's ladder discipline in graded form." },
    { slug: "keep-latest-dedupe", why: "Edit dedupe: answers are revised in place, so the raw log keeps every revision — keep-latest ROW_NUMBER is how the clean layer gets built before any fold." },
    { slug: "new-users-daily-count", why: "First-question cohorts: daily counts of users whose FIRST session landed that day — the acquisition spine of the growth deck, computed not asserted." },
    { slug: "same-day-sale", why: "Same-session closes: ask posted and answered inside one calendar day — the responsiveness stat the ask-to-answer team brags about in the monthly review." },
    { slug: "market-analysis-i", why: "New-in-window reads: users whose first session landed inside the digest window — cohort membership as a query, the exact fork growth asks weekly." },
    { slug: "students-and-examinations", why: "The zero-participation fold: questions asked with no answer attempts attached — LEFT JOIN plus COALESCE over the ask-graph's quiet corners." },
    { slug: "customer-order-frequency", why: "Frequency gates: users who picked up requests in enough distinct periods to call it a habit — HAVING is the habit test before any contributor list ships." },
    { slug: "the-category-of-each-member-in-the-store", why: "Contributor tiers: classify each writer by lifetime engagement band — CASE tiers that feed the authority badges and the recruiter's shortlist." },
    { slug: "calculate-orders-within-each-interval", why: "Engagement bands: sessions bucketed into answer-volume intervals — the histogram behind 'how much does a typical session actually answer?'." },
    { slug: "books-with-null-ratings", why: "NULL counting discipline: COUNT(col) versus COUNT(*) on half-empty vote columns — the difference between 'no votes yet' and 'zero votes', which moderation triage lives on." },
    { slug: "find-zombie-sessions", why: "Zombie detection: sessions opened but never advancing to a posted stamp — the stale-draft queue the trust-and-safety team clears weekly, found with window logic." },
    { slug: "friend-requests-ii-who-has-the-most-friends", why: "The graph argmax: who carries the most edges — the follow-read the ask-to-answer matcher ranks candidate writers by." },
    { slug: "friends-with-no-mutual-friends", why: "Zero-mutual tails — the graph's quiet corners found by a self-join that must survive empty matches, the recruitment shortlist's complement." },
    { slug: "all-the-pairs-with-the-maximum-number-of-common-followers", why: "Common-neighbor pairs at the maximum — a two-hop fold with a tie rule, topic-affinity ranking in embryo." },
    { slug: "page-recommendations", why: "Recommendations from co-engagement — one hop from the target set: the 'readers of X also answered Y' query the digest's suggestion rail runs on." },
    { slug: "page-recommendations-ii", why: "The recommendation read with exclusion logic — candidates minus existing edges, the anti-join half of every recommender." },
    { slug: "confirmation-rate", why: "Rate-per-entity with the denominator welded on — acceptance-style ratios, the answer-rate grammar in its purest form." },
    { slug: "users-that-actively-request-confirmation-messages", why: "Opt-in behavior census — who asks for the extra touch, a participation read with the population stated before the count." },
    { slug: "second-day-verification", why: "D+1 return verification — the next-day habit check the digest team's open-rate story leans on." },
    { slug: "number-of-comments-per-post", why: "Engagement per question — the grouped count with the zero-engagement LEFT JOIN tail preserved." },
    { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "Repeated-pair detection at a threshold — co-answer graphs and the HAVING-gated collaboration reads the authority boards cite." },
    { slug: "find-books-with-polarized-opinions", why: "Polarization reads — upvote/downvote splits that flag contested answers, moderation's engagement-adjacent queue." },
    { slug: "find-the-quiet-students-in-all-exams", why: "Never-participated census — users absent from every attempt, found by the anti-join that survives empty matches." },
    { slug: "transactions-per-visit-histogram", why: "Visits-to-action histogram — the digest conversion distribution, bucketed honestly before anyone quotes an average." },
    { slug: "rolling-average-steps", why: "Moving baselines — the rolling average that turns noisy daily activity into a trend the growth read can cite." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Behavioral segments: did-A-and-B-but-not-C — the multi-condition cohort shape digest experiments recruit from." },
    { slug: "top-percentile-fraud", why: "Percentile-gated queues — flag the top percent of a risk score, the moderation triage's window logic." },
  ],
};
