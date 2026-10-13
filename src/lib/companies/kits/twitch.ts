// Twitch — kit 9 of the Streaming & Social domain (wave-6, batch C).
// The live-ops company: concurrent viewers, chat velocity, sub funnels and
// the session-level window questions a live product asks every second.
// Pool provenance: Twitch carries exactly 1 tagged sql row (usage-tier-
// percentiles | SQL · PERCENT_RANK tiers) — it leads the problem pool and
// anchors the window topic; the other 15 problem slots + 29 topic slugs are
// theme-curated from the SQL band's live/streaming-shaped problems (stated
// per spec, far below the 16-problem bar). Case studies run on db/custom.db
// with probed figures from scripts/company-facts.md, mapped as:
// orders = live-viewing sessions, customers = viewers, regions = tracked
// viewer cohorts, order status = session state (delivered = watched-to-end,
// shipped = still live, pending = queued in lobby, cancelled = dropped),
// order_items = chat-line batches (quantity = lines in the burst),
// order total = watch-time units per session, shipped_at = live-out/VOD
// stamp, invoices/payments = sub charges and rails (INTEGER cents ÷ 100),
// suppliers = content partners, expenses = ops spend. Mappings declared
// in-world, no invented telemetry numbers.

import type { CompanyKit } from "../types";

export const twitchKit: CompanyKit = {
  id: "twitch",
  domainId: "media",
  name: "Twitch",
  tagline: "Live streaming: viewers, chats, subs",
  accent: "text-violet-400",

  brief: [
    "Twitch is live streaming at firehose scale — millions of channels broadcasting right now, an audience that arrives and leaves by the second, and a chat that is the product as much as the video is. The unit of analysis is not the campaign or the catalog: it is the **live session**, stamped with a viewer, a cohort, a state — {emerald:watched-to-end}, {sky:still live}, queued in lobby, or {rose:dropped mid-stream}. Everything the business decides — where moderation goes, which raids get amplified, what the sub funnel did this hour — hangs on queries that fold chat-line batches into session states, sessions into **cohort health**, and cohorts into the monetization story. The SQL reality is live-ops shaped: bursty, state-aware, and allergic to stale denominators.",
    "The data org runs on three engines. Live telemetry folds the chat firehose — **251 chat-line batches** against **103 sessions** on the audit db — into the velocity boards live ops watches minute by minute. Monetization analytics reads the sub ledger: charges issued, converted, opened, retracted — with amounts stored as INTEGER cents, so `amount_cents / 100.0` is a reflex, not a cleanup. And the creator group watches **cohort censuses**: sessions and watch-time per viewer cohort, where *a cohort with 2 sessions and a cohort with 45 are not the same story* — sampling floors exist because a thin cohort's average is one person's afternoon.",
    "Interview screens are concurrency- and funnel-heavy. A typical loop opens with a fold (chat lines per session, sessions per cohort), escalates into a **window ranking** — the chat-velocity leaderboard where ties share a rung — and lands on either a CASE census of session states or a threshold read ('which sessions beat the average watch-time?'). The follow-ups are definition probes: *per what?* — lines or bursts, sessions or viewers, charged or settled. Candidates who say the grain out loud and keep the cents as cents until the display edge consistently outperform.",
    "Preparation strategy: this kit leads with **Twitch's one tagged registry problem** (usage-tier-percentiles — PERCENT_RANK tiering, the percentile read behind CCV tier boards) and theme-curates the rest from the SQL band's live-shaped material: concurrency intervals, sessionization, streak actives, burst detection, the viewers-turned-streamers gate. Then run both case studies on the live storefront db: one rebuilds the {violet:chat-velocity leaderboard} (a RANK with an honest tie block), the other rebuilds the {emerald:sub-funnel census} (a CASE fold over charge states, cents to dollars at the edge). The storefront mapping is declared, not hidden — orders are sessions, order totals are watch-time units, regions are the four tracked viewer cohorts — because making the stand-in explicit is itself the habit live-ops SQL rewards.",
  ],

  dayInLife: [
    "**08:15 —** The overnight session board. The analyst opens live ops' morning reads: sessions per cohort, {emerald:watched-to-end rate}, and — the number that gates the day — the **session-state census**: 52 of 103 watched through, 30 still live, 14 queued, 7 dropped (6.8%). The first query is always the CASE fold: one pass, four states, counts that must reconcile to 103. A spike in dropped sessions is the day's first fire, and the analyst who can isolate WHICH cohort it clusters in — before the live-ops lead pings — owns the morning.",
    "**11:00 —** Chat-firehose deep work. A moderation lead wants the **chat-velocity leaderboard** rebuilt with honest tie semantics — the six-way tie just below the top two has to share rank 3, not be split by engine whim; a partner manager wants sessions-per-viewer with a sampling floor so a one-session account stops impersonating a habit; the platform team wants the concurrent-interval read (`employee-task-duration-and-concurrent-tasks` on loop). Each ask is a fold, a window and an argument about grain — bursts versus lines, sessions versus viewers. *A velocity number without its window is just noise with a decimal.*",
    "**15:00 —** Sub-funnel stakeholder cycles. The monetization review: **21 charges settled for $66,443.00**, 6 open invites worth $19,609.00, 1 retracted at $925.00 — and the cents discipline that keeps every figure honest (`amount_cents / 100.0`, never integer division). The rails split goes to finance (**card 16 payments / $37,364.00** against wire 11 / $32,248.00); the gift-and-resub read goes to the creator team. The afternoon's job is closing loops: yesterday's funnel dip becomes next week's pricing test, and every number that leaves the desk carries its population with it.",
    "**17:30 —** The writeup ritual. The EOD note is one screen: which cohort moved, which hour bled drops, which leaderboard tie needed a stated tie-break instead of vibes. Query definitions get pinned beside the numbers they produced — live ops re-runs them blind between streams, so the SQL is the contract. The best-prepared candidate knows the rhythm: Twitch SQL exists to defend **session stories under concurrency stress**, and the CASE census plus the ranked leaderboard are the tools the defense is built with.",
  ],

  metrics: [
    { name: "CCV (concurrent viewers)", what: "Viewers watching at the same instant — the interval-overlap count that defines 'live'. Drilled with the concurrent-tasks sweep-line: start events minus end events over a sorted timeline." },
    { name: "Chat velocity", what: "Chat lines per session per minute — 251 line batches across 103 sessions on the audit db. The moderation-load signal, always cut by cohort and by hour before it's believed." },
    { name: "Session-state census", what: "One-pass CASE fold over session states: 52 watched-to-end, 30 still live, 14 queued, 7 dropped (6.8%). The board live ops reads first, and the four cells must reconcile to 103." },
    { name: "Sub-funnel census", what: "Charges by state — 21 settled ($66,443.00), 6 open invites ($19,609.00), 1 retracted ($925.00). Conditional SUMs over the full charge population, cents divided at the display edge only." },
    { name: "Watch-time per session", what: "order total as watch-time units — average 338.19 across the audit window. The threshold read ('above the average session') is the viral-bar question in streaming clothes." },
    { name: "Raid lift", what: "Session and chat delta in the minutes after a raid, measured against the session's own pre-raid baseline via LAG. The read that decides whether raids become a product surface." },
    { name: "Live-out lag", what: "Sessions with a live-out/VOD stamp: 82 of 103; the stamped lag averages 2.98 days with a 2–4 range. The unbilled tail — 21 sessions with no stamp — is the pending-plus-dropped population, never invented as zero." },
    { name: "Percentile tiers", what: "PERCENT_RANK/NTILE banding of viewers by watch-time or gift volume — the tagged usage-tier-percentiles problem is this read verbatim. Tiers feed gift targeting and partner payouts." },
  ],

  topics: [
    {
      name: "Folding the session log",
      why: "Everything at Twitch starts by folding the session log: sessions per cohort, chat batches per session, viewers per hour. The screens warm up with GROUP BY + HAVING at event scale, and the trap is always the same — counting chat batches when the business object is a session. The curated trio drills the volume fold, the participation share and the per-user census that a live board opens with.",
      slugs: ["top-five-artists", "percentage-of-users-attended-a-contest", "challenges"],
    },
    {
      name: "Leaderboard ranking & ties",
      why: "Chat velocity, watch-time, gift volume — live reporting is leaderboard reporting, and ties are everywhere when hundreds of sessions sit near the same count. The tagged usage-tier-percentiles adds the percentile read CCV tiering runs on. The rank trio is drilled until the 1,2,3,3,3,3,3,3 tie block is a spoken reflex, not a lookup.",
      slugs: ["rank-scores", "usage-tier-percentiles", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "PARTITION BY session math",
      why: "Windows at Twitch partition by viewer and by session: each session's share of a viewer's watch-time, each viewer's running total across the night, team-size folds for raid squads. The curated trio drills per-partition averages, running aggregates and cumulative session math — the grammar every per-viewer board here hangs on.",
      slugs: ["find-the-team-size", "project-employees-iii", "game-play-analysis-iii"],
    },
    {
      name: "Graph joins: viewers, partners, raids",
      why: "The live graph is relational: viewer-to-viewer raid reach is a two-hop join, partner-to-partner earnings comparisons are the out-earning shape, and confirmation reads gate whether a raid actually landed. These drills cover the join grammar Twitch screens use when the question is 'who reached whom, and did it confirm?'",
      slugs: ["confirmation-rate", "second-degree-follower", "employees-earning-more-than-their-managers"],
    },
    {
      name: "Chat-health gates (HAVING)",
      why: "Moderation staffing keys on thresholds: chat rooms above a line, activity that repeats, cadence gates that separate a habit from a burst. HAVING is where the threshold lives — after the fold, before the display — and the classic trap is writing the gate in WHERE and silently reshaping the population the fold saw.",
      slugs: ["classes-more-than-5-students", "activity-participants", "customer-order-frequency"],
    },
    {
      name: "Sub funnels with CASE",
      why: "Charge state is a funnel: settled, open invite, retracted — and the census must reconcile against COUNT(*) over the whole charge table. CASE-driven conditional aggregates are the grammar, with the two classic traps: filtering the funnel stage in WHERE (denominator drift) and letting the ELSE arm swallow a stage. The curated trio covers tier banding, gift eligibility and the partner-program gate.",
      slugs: ["the-category-of-each-member-in-the-store", "calculate-special-bonus", "the-winner-university"],
    },
    {
      name: "Streaks & consecutive-day sessions",
      why: "Habit is the product: viewers who show up day after day are the ones subs follow. Consecutive-day logic — LAG flags, streak islands, the five-day-active gate — is drilled until 'is this streak real?' has a query, not a vibe. The curated trio is the streak canon: the consecutive gate, the winning-streak islands and the LAG pair.",
      slugs: ["active-users", "longest-winning-streak", "consecutive-numbers"],
    },
    {
      name: "Threshold subqueries",
      why: "'Which sessions beat the average watch-time?' is a scalar subquery question, and Twitch asks it constantly — viral bars, return-visit gates, runner-up peaks. The curated trio covers the D1-return rate read, the managers-with-mods shape and the second-peak fold that a naive LIMIT 1 OFFSET 1 gets wrong under ties.",
      slugs: ["game-play-analysis-iv", "managers-with-at-least-5-direct-reports", "second-highest-salary"],
    },
    {
      name: "The live calendar & hour buckets",
      why: "Live-ops trends are calendar-shaped: 14 months of sessions from 2024-01 to 2025-02, weekend raid spikes, the latest-session fold that powers 'last seen' boards. '%Y-%m' bucketing, weekend filters and latest-login reads are the three tools; the year-collision trap (month-only buckets folding two Februaries) is the follow-up.",
      slugs: ["user-activity-for-the-past-30-days-i", "tasks-count-in-the-weekend", "the-latest-login-in-2020"],
    },
    {
      name: "Data quality on the firehose",
      why: "A firehose ships dirt: NULL stamps on sessions that never ended cleanly, blank memos, duplicate bursts from retried clients. The never-stamped census on this db is 21 sessions (14 queued + 7 dropped) — knowing NULL is a state, not a zero, is the discipline. The curated trio drills the NULL audit, the NULL-safe filter and the COUNT-column-vs-star distinction.",
      slugs: ["null-blank-audit", "find-customer-referee", "books-with-null-ratings"],
    },
  ],

  theory: [
    {
      id: "twitch-t1",
      q: "The chat-velocity board needs lines per session. The db has 251 chat-line batches whose quantity column carries the lines per burst. Walk me through the fold — and why COUNT(*) alone ships a wrong board.",
      a: "Two grains, two counters. COUNT(*) over the batch table counts bursts — 251 rows — which is a client-retry census, not a chat-volume one. SUM(quantity) is the actual line count, and it is the number moderation keys on. The fold is FROM chat_batches GROUP BY session_id with SUM(quantity) AS lines, and the follow-up is the fan-out warning: join that fold to sessions and you're back at batch grain unless the fold happened first — pre-aggregate, then join, then COUNT(DISTINCT session_id) if the outer query counts sessions. On this db the sessions table holds 103 rows and the batch table 251, so a raw join inflates every session-level count by that viewer's own burst count. Say 'one row per WHAT?' before every aggregate — at Twitch that question is the interview.",
      tag: "aggregation",
    },
    {
      id: "twitch-t2",
      q: "The chat-velocity leaderboard has a six-way tie just below the top two. What do RANK, DENSE_RANK and ROW_NUMBER each print — and which one does a live board owe its readers?",
      a: "With volumes 11, 10 and six sessions at 9: RANK prints 1, 2, 3, 3, 3, 3, 3, 3 — the tie shares a rung and the next distinct value would land at 9, preserving how many sessions sit ahead. DENSE_RANK prints the same head but would compact the tail to 4 — right for tier bands, wrong when readers count the field. ROW_NUMBER prints 1 through 8 — a tie broken by engine whim, which on a live board is a public lie about which session is '4th'. Twitch's answer: RANK for public boards, ROW_NUMBER only with a stated deterministic tie-break (session id) when exactly one row per slot is contractual, DENSE_RANK for tiering. And when a tie straddles the cut, LIMIT stops being the answer — RANK plus a rank filter, with the tie policy written next to the query.",
      tag: "windows",
    },
    {
      id: "twitch-t3",
      q: "'Which sessions beat the average watch-time?' — how does the scalar subquery shape work, and what breaks if you write the average as a plain aggregate next to the filter?",
      a: "The average is computed over the whole population, so it must be its own query: WHERE total > (SELECT AVG(total) FROM orders). On this db that bar is 338.19 watch-time units and 42 of 103 sessions clear it — the fold the viral-bar report prints. Write WHERE total > AVG(total) and the engine refuses: aggregates can't sit in WHERE, because WHERE runs before groups exist. A window AVG() OVER () would execute but then the comparison runs per-row against the grand average — legal, heavier, and it drags every row through the window before the filter. The scalar subquery states the definition once, computes it once, and keeps the outer query a plain filtered fold — which is why it stays the default shape on the threshold boards here.",
      tag: "subqueries",
    },
    {
      id: "twitch-t4",
      q: "21 of 103 sessions carry no live-out stamp (shipped_at IS NULL). How should reports treat those NULLs — and what does COALESCE(ship_time, 0) do to the lag metric?",
      a: "NULL here is a state, not a zero: the unstamped population is 14 queued sessions plus 7 dropped ones — sessions that never ended cleanly, which is exactly what the report exists to surface. The lag metric is julianday(stamp) - julianday(start) over the 82 stamped sessions only (2.98-day average, 2–4 range), and the honest report prints the stamped count beside the average so the denominator is visible. COALESCE(ship_time, 0) would fold 21 NULLs into the epoch — 1970 timestamps drag the average into nonsense and the report now claims every dropped session 'shipped instantly'. The policy: filter the stamp IS NOT NULL deliberately and SAY so, count the NULLs as their own column, and never let a fallback invent a measurement. At Twitch, *an unstamped session is information; a coalesced one is a lie.*",
      tag: "nulls",
    },
    {
      id: "twitch-t5",
      q: "A chat-health query wants cohorts with more than 20 sessions AND above-average chat volume. Where does each condition live — WHERE, HAVING, or a window — and why does the order matter?",
      a: "Pipeline order decides. WHERE runs before the fold, so it takes row-level predicates: status, dates, the rows the fold will even see. HAVING runs after GROUP BY, so it takes folded predicates: COUNT(*) > 20 is a group property and dies with a syntax error in WHERE. The above-average-volume condition is population-level, so it's either a scalar subquery in HAVING (HAVING SUM(lines) > (SELECT AVG(...))) or a window computed after the fold. The classic failure is pushing the session-count gate into WHERE as a row condition — it doesn't compile — or filtering sessions by status in WHERE and then wondering why the funnel census reconciles to 96 instead of 103. At Twitch the rule is spoken out loud: *filter rows first, fold second, gate the fold third* — and the gate's denominator is the population the fold actually saw.",
      tag: "pipeline",
    },
    {
      id: "twitch-t6",
      q: "The live calendar buckets 14 months of sessions (2024-01 through 2025-02). Which bucket expression is calendar-safe, and how do weekend raid spikes get isolated?",
      a: "STRFTIME('%Y-%m', created_at) is the spine: it prints '2024-01' … '2025-02', 14 distinct buckets that sort chronologically as text. Month-only formats ('%m' or SUBSTR 6,2) fold February-2024 into February-2025 — the year-over-year story vanishes into 12 buckets, and on a product that lives on annual cycles that's the trend destroyed. Weekend isolation is STRFTIME('%w', created_at): '0' and '6' are Sunday and Saturday, and raid spikes concentrate there — the tasks-count-in-the-weekend drill is exactly this filter. The deeper habit is stating the grain before choosing the expression: day-grain for the live board, month-grain for the quarterly read, and never a bucket the business can't name out loud.",
      tag: "dates",
    },
    {
      id: "twitch-t7",
      q: "A partner manager wants watch-time per session next to each session's chat lines. What happens when you join sessions to chat batches directly — and what's the fix?",
      a: "The join fans out. 103 sessions meet 251 chat batches on the session key, and every session-level column — watch-time, viewer name, cohort — now repeats once per batch row: a session with 4 bursts carries its watch-time four times, and SUM(total) over the join overcounts watch-time by each session's own burst count. The fix is fold-then-join: pre-aggregate batches per session in a derived table (GROUP BY order_id with SUM(quantity)), then join that one-row-per-session fold to the session table. Now the grain is sessions on both sides and every aggregate is honest. If the outer query still counts sessions, COUNT(DISTINCT session_id) is the seatbelt — but the seatbelt hides the fan-out instead of fixing it, and the senior tell is naming the grain before writing the join, not patching the count after.",
      tag: "joins",
    },
    {
      id: "twitch-t8",
      q: "Sub amounts are stored as INTEGER cents. Where do the cents become dollars, and what does SUM(amount_cents)/100 ship instead?",
      a: "At the display edge, and only there: ROUND(SUM(amount_cents) / 100.0, 2). The pipeline carries integer cents end to end — integer money doesn't accumulate float drift, and the facts file's figures ($66,443.00 settled across 21 charges) are cent-exact. Write /100 with integer operands and SQLite's integer division truncates: 6,644,300 cents reads $66,443 fine, but a 250-cent item reads $2 instead of $2.50, and every per-viewer average built on top inherits the floor. The /100.0 forces real division before ROUND caps the print. The companion discipline is vocabulary: 'paid', 'open', 'void' live in the charge table's state space; 'delivered', 'shipped', 'pending', 'cancelled' live in the session space — cross-matching them ships a board of silent zeros. At Twitch, *cents stay integers until the reader's eye, and status vocabularies never travel between tables.*",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "twitch-mcq-1",
      prompt: "The chat table stores line BATCHES: 251 rows, with quantity = lines per burst. What does SUM(quantity) return?",
      choices: [
        "251 — the batch count",
        "The total chat lines across all bursts",
        "The average batch size",
        "NULL — quantity can't be summed",
      ],
      answer: 1,
      why: "SUM(quantity) folds the per-burst counts into total chat lines — the moderation-load number. COUNT(*) is 251 batches, a different object entirely: retries and bursts, not lines.",
      notes: [
        { choice: 0, why: "251 is COUNT(*) — the batch grain. The board asked for lines, and batches ≠ lines the moment quantity > 1." },
        { choice: 2, why: "The average would be AVG(quantity) — and it's a different KPI: batch richness, not volume." },
        { choice: 3, why: "quantity is NOT NULL by schema — SUM is well-defined and folds every row." },
      ],
      difficulty: "easy",
    },
    {
      id: "twitch-mcq-2",
      prompt: "Sub charges are INTEGER cents; the settled population is 21 charges. Which expression prints the settled dollar total for the funnel board?",
      choices: [
        "SUM(amount_cents)/100",
        "ROUND(SUM(amount_cents)/100.0, 2)",
        "CAST(SUM(amount_cents) AS TEXT)",
        "ROUND(SUM(amount_cents), 2)",
      ],
      answer: 1,
      why: "Divide by 100.0 to force real division, ROUND(…, 2) at the display edge — the settled total prints $66,443.00 exactly as the ledger states it.",
      notes: [
        { choice: 0, why: "Integer division truncates every non-even cent — a 250-cent charge reads $2, and the truncation compounds through every average built on top." },
        { choice: 2, why: "CAST to TEXT prints raw cents — 6644300 — with no decimal point at all." },
        { choice: 3, why: "ROUND of raw cents rounds cents, not dollars — the figure is 100× too large and the board now lies loudly." },
      ],
      difficulty: "easy",
    },
    {
      id: "twitch-mcq-3",
      prompt: "How many of the 103 sessions carry a live-out stamp (shipped_at IS NOT NULL), and who are the unstamped?",
      choices: [
        "103 — every session ends",
        "82 — 52 watched-to-end plus 30 still-live; the 21 unstamped are the 14 queued and 7 dropped",
        "52 — only watched-to-end sessions stamp",
        "30 — only still-live sessions stamp",
      ],
      answer: 1,
      why: "The stamp exists for 82 sessions (watched-to-end 52 + still-live 30). The unstamped 21 are precisely the queued (14) and dropped (7) populations — the report's denominator must say which it uses.",
      notes: [
        { choice: 0, why: "14 queued and 7 dropped never ended cleanly — they have no stamp, and pretending otherwise invents lag measurements for sessions that never finished." },
        { choice: 2, why: "Still-live sessions stamp too — the stamp marks the live-out event, not completion." },
        { choice: 3, why: "The watched-to-end 52 stamp as well; 30 is just the still-live share of the 82." },
      ],
      difficulty: "easy",
    },
    {
      id: "twitch-mcq-4",
      prompt: "The velocity leaderboard shows volumes 11, 10, then six sessions tied at 9. The query uses RANK() OVER (ORDER BY msgs DESC). What prints in the rank column?",
      choices: [
        "1, 2, 3, 4, 5, 6, 7, 8",
        "1, 2, 3, 3, 3, 3, 3, 3",
        "1, 2, 3, 3, 3, 3, 3, 4",
        "1, 2, 9, 9, 9, 9, 9, 9",
      ],
      answer: 1,
      why: "RANK shares the rung on ties and skips ahead after — the six 9s all read 3, and the next distinct volume would land at rank 9. Within the LIMIT 8 board that's exactly 1, 2, then six 3s.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER — it breaks the tie by engine whim, which a public leaderboard must not do without a stated tie-break." },
        { choice: 2, why: "That mix has no rank function behind it: DENSE_RANK would print 4 after the tie block, RANK would print 9 — neither prints 4 after a six-way 3." },
        { choice: 3, why: "RANK ranks positions, not values — the tie sits at position 3, so it reads 3, not the value 9." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitch-mcq-5",
      prompt: "A cohort board wants cohorts with more than 20 sessions. The analyst writes WHERE COUNT(*) > 20. What happens?",
      choices: [
        "It works — filters are filters",
        "Syntax error — aggregates can't sit in WHERE",
        "It silently returns all cohorts",
        "It returns only the first cohort",
      ],
      answer: 1,
      why: "WHERE runs before GROUP BY, so COUNT(*) doesn't exist yet at filter time — the engine rejects it. Group-level gates live in HAVING, after the fold.",
      notes: [
        { choice: 0, why: "The pipeline order is WHERE → GROUP BY → HAVING; a folded value cannot filter rows that haven't been folded." },
        { choice: 2, why: "It doesn't fail soft — this is a hard syntax error, which is the friendly outcome. The dangerous variant is the gate that does compile but filters the wrong grain." },
        { choice: 3, why: "Nothing about WHERE limits rows returned — the error fires at parse time, before any row is read." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitch-mcq-6",
      prompt: "Cadence math uses LAG(created_at) OVER (PARTITION BY viewer ORDER BY created_at). For which row is the gap NULL?",
      choices: [
        "Every row — LAG returns NULL without a frame",
        "Each viewer's first session — no earlier row exists in the partition",
        "Sessions that were dropped mid-stream",
        "Only the log's globally first session",
      ],
      answer: 1,
      why: "LAG looks one row back within the partition; the partition's first row has nothing to look at, so prev is NULL and the gap must be reported as 'no previous session' — 16 such rows on this db, one per viewer.",
      notes: [
        { choice: 0, why: "LAG is fully legal with a bare OVER; only the partition's head row lacks a previous value." },
        { choice: 2, why: "Dropped sessions still have timestamps — the gap runs on created_at regardless of how the session ended." },
        { choice: 3, why: "The global first row is just one of the 16 partition heads — every viewer's first session NULLs, not only the log's earliest." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitch-mcq-7",
      prompt: "The CCV tier board bands viewers into quartiles by watch-time. Which expression assigns each row a 1–4 tier?",
      choices: [
        "NTILE(4) OVER (ORDER BY watch_time DESC)",
        "ROUND(watch_time/4)",
        "MOD(ROW_NUMBER(), 4)",
        "PERCENT_RANK() * 4",
      ],
      answer: 0,
      why: "NTILE(4) deals rows into exactly four ranked buckets — the canonical tiering window. PERCENT_RANK would need an extra bucketing step on top to become tiers.",
      notes: [
        { choice: 1, why: "Dividing a measure by 4 is arithmetic on the value, not a rank — a 400-hour viewer and a 100-hour viewer can land in the same 'tier'." },
        { choice: 2, why: "MOD of a row number cycles 0-3 across the whole table regardless of watch-time — tiers by row position, not by value." },
        { choice: 3, why: "PERCENT_RANK returns 0–1 fractions; multiplying by 4 gives continuous fractions, not integer tiers, unless you then bucket — which is NTILE's job." },
      ],
      difficulty: "medium",
    },
    {
      id: "twitch-mcq-8",
      prompt: "Sessions (103 rows) join chat batches (251 rows) on session id; then COUNT(*) runs. What does the count report?",
      choices: [
        "103 — the session grain survives joins",
        "251 — the batch grain won",
        "498 — sessions plus batches",
        "Depends on the join key — grain is decided by the key, and that's the point",
      ],
      answer: 3,
      why: "Join grain is decided by the key: session-to-viewer (one-to-one) keeps 103; session-to-chat-batches (one-to-many) fans to 251. Stating the grain out loud before the join is the discipline the question is really testing.",
      notes: [
        { choice: 0, why: "One-to-many joins fan out by definition — 103 sessions cannot stay 103 after meeting their 251 batches on the session key." },
        { choice: 1, why: "251 is right only for that specific key; a different key yields neither number — which is why 'depends, and I'll state which' is the strong answer." },
        { choice: 2, why: "Joins don't add unrelated tables' rows — the fan-out replaces the base count, it doesn't sum with it." },
      ],
      difficulty: "hard",
    },
    {
      id: "twitch-mcq-9",
      prompt: "The funnel census must show all four session states with shares. The analyst adds WHERE status IN ('delivered','shipped') 'to keep it clean'. What ships?",
      choices: [
        "A tighter, better census",
        "Queued and dropped rows leave the population — the shares now read against 82, not 103, and no longer reconcile",
        "The query errors — you can't filter statuses",
        "Only the dropped share changes",
      ],
      answer: 1,
      why: "Filtering the funnel stage in WHERE shrinks the denominator to match the numerator — the classic denominator drift. Shares computed over the filtered population overstate every kept stage and can't reconcile to the true 103.",
      notes: [
        { choice: 0, why: "It's not tighter, it's a different census: the population changed silently, which is exactly what the reconciliation check exists to catch." },
        { choice: 2, why: "Filtering statuses is legal SQL — the failure is silent, not syntactic, which is what makes it dangerous." },
        { choice: 3, why: "Every share moves, not just the dropped one: all four stages are now shares of 82 instead of 103." },
      ],
      difficulty: "hard",
    },
    {
      id: "twitch-mcq-10",
      prompt: "A tier read uses PERCENT_RANK() OVER (ORDER BY watch_time). A viewer's row returns 0.5. What does that mean?",
      choices: [
        "Half the maximum watch-time",
        "A rank of 5 out of 10",
        "Half the other rows rank strictly below this viewer's watch-time",
        "The viewer is in tier 5",
      ],
      answer: 2,
      why: "PERCENT_RANK returns (rank − 1)/(rows − 1): the fraction of the partition ranking strictly below. 0.5 means half the field sits below — the raw percentile behind the tier bands.",
      notes: [
        { choice: 0, why: "It's a rank fraction, not a value fraction — watch-time 50% of max and 0.5 percent-rank are unrelated facts." },
        { choice: 1, why: "The ratio depends on partition size: 0.5 with 10 rows usually means rank 5.5-ish territory, not literally '5 of 10' in every partition." },
        { choice: 3, why: "Tiers are NTILE's output — PERCENT_RANK gives the continuous fraction the tiering step then buckets." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-twitch-1",
      tier: "medium",
      topic: "t5",
      universe: "funnel",
      title: "The chat-velocity leaderboard",
      brief:
        "Live-ops memo, stream night: the moderation desk reads the chat-velocity leaderboard every hour — sessions ranked by chat lines sent — and it must be tie-honest, because two sessions with the same volume share a rung or the mods stop trusting the board. The db mapping is declared: orders are viewing sessions, order_items are chat-line batches with quantity = lines per burst, customers are viewers, regions are the tracked cohorts. Probed facts: **251 chat-line batches** across **103 sessions**; the batch grain is 1–4 bursts per session, so the fold must be SUM(quantity) per session before any ranking. The board wants the top **8** sessions, viewers named, ranks shared on ties, loudest first.",
      ask: "Return the top 8 sessions by total chat lines: rank (ties share a rung), viewer name, and total lines, best first.",
      template:
        "SELECT {1}() OVER (ORDER BY msgs {2}) AS velocity_rank,\n       c.name AS viewer,\n       s.msgs\nFROM (\n  SELECT oi.order_id AS session_id,\n         SUM(oi.quantity) AS msgs\n  FROM order_items oi\n  GROUP BY oi.order_id\n) s\nJOIN orders o ON o.id = s.session_id\nJOIN customers c ON c.id = o.customer_id\nORDER BY velocity_rank, s.session_id\nLIMIT {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "RANK gives both tied sessions the same rung and lets the next distinct volume skip ahead — leaderboard semantics mods trust. ROW_NUMBER would split the tie by engine whim; AVG() is a syntax error in that slot.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the loudest-first direction",
          why: "Rank 1 must be the loudest session, so the window orders by msgs descending. ASC crowns the quietest session in the log — a correct query answering the opposite question, and moderation would staff against it.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the board depth",
          noVerify: true,
          why: "The memo fixes the board at 8 sessions deep — enough to show the tie block in full. LIMIT 5 would slice through the tie and hide exactly the behavior the desk asked to see.",
        },
      ],
      distractors: ["ROW_NUMBER", "AVG", "ASC", "5"],
      walkthrough:
        "Fold first, rank second, tie policy always. The derived table folds 251 chat batches to one line-count row per session — 11 at the top, 10 next, then a six-way tie at 9 — and the window ranks the fold: RANK() OVER (ORDER BY msgs DESC) prints 1, 2, 3, 3, 3, 3, 3, 3, with ties sharing rung 3 and the next distinct volume landing at 9 (off-board). The join back to orders and customers is safe because the fold happened first — one row per session on both sides, no fan-out. ROW_NUMBER as the distractor prints 1 through 8, splitting a six-way tie by engine whim — the exact 'mods stop trusting the board' failure the memo bans; AVG errors in the rank slot; ASC crowns the quietest session; LIMIT 5 slices through the tie and ships a board that hides its own headline behavior. LIMIT is a constant (noVerify): 8 is the memo's board depth, not a measured figure.",
    },
    {
      id: "cs-twitch-2",
      tier: "easy",
      topic: "s6",
      universe: "growth",
      title: "The sub-funnel census",
      brief:
        "Monetization memo, month close: the sub funnel reads charges in one pass — settled subs, open invites, retracted charges — and every figure must land in dollars with the cents discipline intact. The db mapping is declared: invoices are subscription charges, `amount_cents` is INTEGER cents, and the states live in the charge vocabulary: {emerald:paid} = converted sub, {sky:open} = invite outstanding, {rose:void} = retracted. Probed facts: **21 charges settled for $66,443.00**, **6 open invites worth $19,609.00**, **1 retracted at $925.00** — a funnel where the settled arm dwarfs the open arm, which is exactly the story the growth review wants to defend. One row, three branches, no status filtered out of the population first.",
      ask: "Return one row: settled dollar total (2 decimals), count of open invites, and count of retracted charges — from a single pass over the charges table.",
      template:
        "SELECT ROUND(SUM(CASE WHEN status = {1} THEN amount_cents ELSE 0 END) / 100.0, 2) AS converted_usd,\n       COUNT(CASE WHEN status = {2} THEN 1 END) AS open_invites,\n       COUNT(CASE WHEN status = {3} THEN 1 END) AS voided\nFROM invoices;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-state flag",
          why: "The settled arm sums amount_cents only where status = 'paid' — 21 charges, $66,443.00 after the cents division. 'refunded' or 'cancelled' live in other tables' vocabularies and would fold the arm to 0.0 silently.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the open-invite flag",
          why: "6 open invites is the funnel's in-flight arm. 'settling' isn't a charge state here — the branch would read 0 and the review would conclude the funnel has no pipeline, the worst kind of wrong.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the retracted flag",
          why: "Exactly 1 retracted charge ($925.00) closes the census: 21 + 6 + 1 = 28 reconciles against COUNT(*) over invoices. 'cancelled' is a SESSION state, not a charge state — the vocabulary crossing this census exists to catch.",
        },
      ],
      distractors: ["'refunded'", "'settling'", "'cancelled'"],
      walkthrough:
        "One scan, three conditional aggregates, one reconciliation identity. SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) folds the settled cents — 6,644,300 — and the /100.0 converts at the display edge to 66,443.00 dollars; the COUNT branches read 6 open and 1 void, and the three arms must reconcile against the charge table's 28 rows before the review publishes. The classic failures are all vocabulary crossings: 'refunded', 'settling' and 'cancelled' are states from OTHER tables' lifecycles, and each one folds its branch to a silent zero — a funnel with no pipeline is a growth review's worst surprise. The ELSE 0 arm is what keeps SUM honest over the full population; filtering status in WHERE would shrink the denominator and break the 21+6+1=28 identity. Cents stay integer until ROUND(…, 2) prints them — integer division (/100) would floor every odd-cent charge on the way.",
    },
  ],

  problems: [
    { slug: "usage-tier-percentiles", why: "Twitch's one tagged problem, and the CCV tier board verbatim: band viewers into percentile tiers by watch-time — PERCENT_RANK/NTILE grammar the gift-targeting and partner-payout boards run daily." },
    { slug: "top-five-artists", why: "Top channels by volume streamed — the leaderboard fold Twitch's discovery surface reranks every hour, with the tie behavior left honest." },
    { slug: "find-followers-count", why: "Follower counts per channel — the audience-size read that anchors every partner pitch and raid-target decision." },
    { slug: "active-users", why: "The 5-consecutive-day active gate — Twitch's habit read: which viewers showed up day after day, the population subs actually convert from." },
    { slug: "employee-task-duration-and-concurrent-tasks", why: "Concurrent-task intervals — the sweep-line that computes concurrent viewership: start events minus end events over a sorted session timeline." },
    { slug: "find-zombie-sessions", why: "Zombie session detection — live ops' ghost hunt: sessions that look open but stopped producing events, the exact state a live product must close out." },
    { slug: "viewers-turned-streamers", why: "The first-event gate — the viewer-to-creator funnel is Twitch's origin story, and this is the 'who crossed the line' query that measures it." },
    { slug: "sessionize-events", why: "Sessionization from raw events — the chat firehose arrives as unordered pings and the session boundaries have to be rebuilt with gaps-and-islands before any fold." },
    { slug: "find-bursty-behavior", why: "Burst detection — chat raids are bursts by definition; peak-versus-average is the flag that separates a raid from a busy night." },
    { slug: "find-peak-calling-hours-for-each-city", why: "Peak-hour argmax per cohort — the hour the raid always lands, per viewer cohort, argued with a MAX over hourly folds instead of vibes." },
    { slug: "median-time-to-convert", why: "Median time-to-convert — how long an open invite takes to become a settled sub, the funnel's pace read behind the census counts." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the sticky-audience trend line live ops reads instead of single-day CCV spikes." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — the ratio that says whether the audience is a habit or a rotation, computed with honest weekly denominators." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Accounts with no stream events — the anti-join that finds registered-but-quiet creators, the reactivation pipeline's source list." },
    { slug: "calculate-compressed-mean", why: "Weighted mean from compressed pairs — viewer-hours stored as (hours, weight) pairs fold to honest averages without exploding rows." },
    { slug: "game-play-analysis-v", why: "First-session attribution — which device/context a viewer's first session ran on, the acquisition-read that 'where do good viewers come from' hangs on." },
  ],
};
