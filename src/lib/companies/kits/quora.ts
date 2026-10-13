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
    "Preparation strategy: Quora carries **zero tagged registry problems**, so this kit theme-curates all sixteen — the ask-graph joins, upvote-rate ratios, moderation reads, streak ladders and the Quora+ billing folds. Then run both case studies on the live storefront db, where the mapping is declared, not hidden: orders are ask-to-answer sessions, {emerald:delivered} means the answer posted, order totals are engagement units, regions are market cohorts. One rebuilds the {violet:topic-authority board} (a joined fold over the topic graph, gated by a session floor), the other the {sky:ask-to-answer triage grid} (four session outcomes per cohort, one CASE pass). The bar: *state the denominator before you compute it.*",
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
      slugs: ["article-views-i", "game-play-analysis-i", "find-followers-count"],
    },
    {
      name: "Two-grain censuses",
      why: "'Sessions AND users per cohort' is the opening read of every Quora business review — and the trap is counting both at the same grain. COUNT(*) counts session rows; COUNT(DISTINCT customer_id) counts people. The trio drills exactly this census, monthly and daily, until the two-grain discipline is reflexive.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "article-views-ii"],
    },
    {
      name: "Upvote & quality signals",
      why: "Upvotes and downvotes are the crowd's quality signal, and every quality read is a conditional count or a rate. These drills cover flagged counts, per-item quality percentages and the 100.0-before-division habit that keeps Quora's quality shares honest.",
      slugs: ["reported-posts", "ads-performance", "queries-quality-and-percentage"],
    },
    {
      name: "Answer-rate ratios",
      why: "'Which questions get answered?' is a rate question, and the denominator is the whole test: requests picked up, not requests that existed. The trio drills the answer-rate argmax, acceptance-rate folds and participation percentages — Quora's ratio grammar in textbook form.",
      slugs: ["get-highest-answer-rate-question", "friend-requests-i-overall-acceptance-rate", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Moderation & flagged content",
      why: "Trust & safety lives in queues: reported posts per day, the share that gets removed, text that fails validation. These drills cover the moderation-rate ratio, string validation and keyword counting — the exact reads the spam/moderation screens are written in.",
      slugs: ["reported-posts-ii", "invalid-tweets", "count-occurrences-in-text"],
    },
    {
      name: "Writer leaderboards: ranking windows",
      why: "Top writers by engagement, top families by answers, second-highest per cohort — Quora reporting is leaderboard reporting, and ties are everywhere once 16 users share 103 sessions. The trio drills RANK, DENSE_RANK and ROW_NUMBER until the 1,2,3,4,4,6 pattern is a spoken reflex.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries"],
    },
    {
      name: "Return visits & digest windows",
      why: "Digest emails are built on return behavior: did the reader come back the next day, how big was the gap, what happened in the last 30 days. The trio covers the D+1 comparison, the biggest-gap LEAD read and the 30-day activity window the email team lives in.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "The follow graph: self-joins & two hops",
      why: "The follow graph is Quora's distribution engine: who follows whom, who follows the followers, which pairs are mutual. The trio drills the second-degree walk, the mutual-strength self-join and the two-hop popularity percentage that topic-feed ranking is built on.",
      slugs: ["second-degree-follower", "strong-friendship", "popularity-percentage"],
    },
    {
      name: "Streaks & consecutive-day habits",
      why: "Writing habits are streaks: users who show up day after day, and the day the ladder breaks. The trio is the gaps-and-islands canon — the longest streak, the 15-day wall, the consecutive-period actives read that the retention board's headline hangs on.",
      slugs: ["longest-winning-streak", "active-users", "fifteen-days-of-learning"],
    },
    {
      name: "Digest funnels & Quora+ conversion",
      why: "Reader-to-subscriber is a funnel: digest opened, question answered, Quora+ started. These drills build the step-conversion grammar — email engagement stages, funnel pivots and trial-to-paid joins — with the denominator at every step stated out loud.",
      slugs: ["email-engagement-funnel", "funnel-step-conversion", "trial-to-paid-funnel"],
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
  ],
};
