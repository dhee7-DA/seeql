// Discord — kit 12 of the Streaming & Social domain (Batch L, wave 7).
// The community-server company: voice rooms, text activity, lurking and the
// Nitro subscription that monetizes the whole thing. Pool provenance: Discord
// carries ZERO tagged registry problems (0 tagged LC — theme-curated, stated
// per spec) — all 16 problem slots and all 30 topic slugs are THEME-CURATED
// from the SQL band's session/streak/funnel-shaped problems. Case studies run
// on db/custom.db with probed figures from scripts/company-facts.md, mapped
// as: orders = member activity periods (open sessions), customers = Discord
// members, regions = the four market cohorts, order status = session outcome
// (delivered = voice room joined & completed, shipped = text-and-forum only,
// pending = lurking, cancelled = disconnected/abandoned), order_items =
// activity batches (quantity = events per batch), order total = engagement
// units per period, shipped_at = member-verification stamp, products = Nitro
// & server-feature SKUs, suppliers = bot & integration partners,
// invoices/payments = Nitro & Server-Boost billing (INTEGER cents ÷ 100),
// expenses = infra & growth spend. Mappings declared in-world, no invented
// telemetry; every figure probed against db/custom.db (read-only).

import type { CompanyKit } from "../types";

export const discordKit: CompanyKit = {
  id: "discord",
  domainId: "media",
  name: "Discord",
  tagline: "Servers, voice rooms and Nitro subscriptions",
  accent: "text-indigo-200",

  brief: [
    "Discord is the community layer of the internet — servers that behave like towns, voice rooms that behave like kitchens, and a Nitro subscription that pays for all of it. The unit of analysis is the **open session**: one member, one period, one outcome — {emerald:voice room joined & completed}, {sky:text-and-forum only}, lurking, or {rose:disconnected}. Everything the product teams argue about — whether the voice redesign lifted real participation, which cohort lurks instead of talks, why July cooled — hangs on queries that fold **251 activity batches** into **103 open sessions** from **16 members** across four market cohorts, and the population behind every ratio gets stated before it's believed.",
    "The data org runs three engines. Session telemetry folds the activity-batch log into the server-health boards the voice team reads at 08:20 sharp. Verification & retention runs the gap math: **82 of 103 sessions carry a member-verification stamp**, a **2.98-day average** join-to-verified window with a 2–4 day range — and the unstamped 21 are the lurking-plus-dropped tail, reported as a state, never as zero. Monetization reads Nitro & Server-Boost billing, where amounts live as INTEGER cents and `amount_cents / 100.0` at the display edge is house style — card rails ran **16 payments / $37,364.00** against wire rails at **11 / $32,248.00**, and the ledger ties at **181,080 = 181,080** every close.",
    "Interview screens are fold-and-window shaped. A typical loop opens with a fold (events per session, sessions per cohort — `SUM(quantity)`, not `COUNT(*)`, because batches carry retries), escalates into a **LAG gap read** over each member's session partition, and lands on either a one-pass **FILTER census** whose four arms must reconcile to 103 or a threshold subquery (*who's still active past the mean cadence?*). The follow-ups are definition probes: per what — batches or events, sessions or members, calendar months or rolling 28s? Candidates who state the denominator and keep the census unfiltered consistently outperform.",
    "Preparation strategy: Discord has **no tagged registry problems**, so this kit theme-curates all sixteen — the session census and first-join canon, streak ladders (`longest-winning-streak`, `fifteen-days-of-learning`), retention cohorts, the Nitro conversion funnel and the silent-majority anti-joins. Then run both case studies on the live storefront db: one rebuilds the {violet:heavy-habit cohort screen} (a derived per-member fold gated above the **6.44** mean cadence — 4 members carrying **63.5%** of demand), the other rebuilds the {emerald:one-pass engagement census} (FILTER arms per outcome, counts that must reconcile). The storefront mapping is declared, not hidden — orders are open sessions, totals are engagement units, regions are market cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
  ],

  dayInLife: [
    "**08:20 —** The overnight server-health board. The analyst opens telemetry's morning reads: sessions per cohort, the {emerald:voice-completed share} (52 of 103 on the audit window), and the number that gates the day — the {rose:disconnection queue}: which members' last period ended abandoned, and whether the July-style cool-off (**$1,193.86** month, 2 cancels) is repeating. The first query is a fold of the 251 activity batches into per-session event counts, retries deduped keep-latest and stated. A spike in lurking (14 sessions) without voice movement is the day's first fire, and the analyst who can split NEW lurkers from CHRONIC ones — before the community lead pings — owns the morning.",
    "**11:00 —** Heavy-habit deep work. Growth wants the cadence screen rebuilt: fold sessions per member in a derived table, gate above the **6.44** book-wide mean, rank the survivors. The screen returns 4 members — 24, 17, 14, 13 periods — who carry **63.5%** of the book's $34,833.28 engagement, and the regional read beneath it (EU **45 sessions / 8 members**, APAC **37 / 5**, US **19 / 2**) decides which cohort gets the next voice experiment. Each ask is a fold, a gate and an argument about grain — batches versus events, sessions versus members. *A cohort without its denominator is just a bar chart of vibes.*",
    "**15:30 —** Bot-partner and Nitro cycles. The partner review: event batches per bot with plays separated from loads, the {sky:verification-lag} read (**82 of 103 stamped, 2.98-day average, 2–4 range** — the unstamped 21 are lurking-plus-dropped, reported as a state), and the Nitro billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned) with the {amber:split-payment} register (5 invoices, one partial at **4,000 of 6,148** cents) flagged for finance. The afternoon's job is closing loops: yesterday's cadence screen becomes next sprint's onboarding A/B, and every number that leaves the desk carries its population with it — the EOD note pins the SQL beside the figures it produced, because retention re-runs these blind.",
  ],

  metrics: [
    { name: "Open sessions per member", what: "Activity periods per Discord member — 103 sessions across 16 members on the audit window, mean cadence 6.44. The frequency read every server-health board is cut from, always with the cohort stated." },
    { name: "Voice-completed share", what: "Sessions that ended in a completed voice room: 52 of 103 (50.5%), the {emerald:delivered} arm. The product's core behavior read — and the arm the camera… er, microphone team ships weekly." },
    { name: "Verification lag", what: "Join-to-verified window where stamped: 82 of 103 sessions, 2.98-day average, 2–4 range. The unstamped 21 are the lurking-plus-dropped tail — a state to report, never a zero to invent." },
    { name: "Silent-majority share", what: "Lurking (14) plus dropped (7) = 20.4% of sessions. The counterweight to every engagement headline, and the source list for onboarding experiments." },
    { name: "Engagement per period", what: "Session engagement units — 338.19 average against a 34,833.28 book (range 25.47 to 1,088.44). SUM(total) over the fold, not COUNT(*): batches are not events." },
    { name: "Heavy-habit cohort", what: "Members above the 6.44 mean cadence: 4 of 16, holding 63.5% of demand. The concentration read that decides where Nitro experiments get shelf space." },
    { name: "Nitro rail mix", what: "Billing rails in honest dollars: card 16 payments / $37,364.00 vs wire 11 / $32,248.00. The mix that decides which payment partner review gets escalated." },
    { name: "Boost payout clock", what: "Server-Boost settlement days — 28.4 average (13–84 range) against flat 30-day terms, with 5 split-payment invoices and one partial (4,000 of 6,148 cents). The finance-team latency board." },
  ],

  topics: [
    {
      name: "First joins & session counts",
      why: "Every member story starts with a first session, and every board starts with a count: periods per member, first-session attribution, minutes per open. The curated trio drills the first-login fold, the distinct-viewer count and the duration roll-up that opens Discord's server-health screens.",
      slugs: ["game-play-analysis-i", "article-views-i", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "Return-visit gap math",
      why: "Comeback behavior is window math: LAG over each member's session partition, julianday deltas, the first open's NULL kept as no-previous-session. The trio covers the biggest-gap read, the second-day return and the day+1 comparison that re-engagement alerts hang on.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "rising-temperature"],
    },
    {
      name: "Streak ladders & consecutive days",
      why: "Daily-server habits are streaks: members who show up day after day, and the day the ladder breaks. The curated trio is the gaps-and-islands canon — the longest streak, the 15-day wall, the loyal-customer islands read that the retention board's headline hangs on.",
      slugs: ["longest-winning-streak", "fifteen-days-of-learning", "find-loyal-customers"],
    },
    {
      name: "Retention cohorts & growth accounting",
      why: "Server retention reads cohort-shaped: which join month keeps its actives, how churn moves week over week, how new minus resurrect minus churn nets to the growth story. The trio is the exact grammar the community team's monthly deck is written in.",
      slugs: ["cohort-retention-matrix", "week-over-week-churn", "growth-accounting"],
    },
    {
      name: "Nitro conversion funnel",
      why: "Free-to-Nitro is a funnel: trial started, feature used, subscription period paid. These drills build the step-conversion grammar — stage counts, trial-to-paid ratios, subscription-conversion joins — with the denominator at every step stated out loud.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "analyze-subscription-conversion"],
    },
    {
      name: "One-pass censuses",
      why: "The engagement census counts all four session outcomes in one pass — voice, text, lurking, dropped — and COUNT(CASE …)/FILTER arms are the grammar. The literal snaps census is this read; the trio adds the target-met conditional and the zero-available gate that census reports lean on.",
      slugs: ["snaps-analysis", "number-of-employees-who-met-the-target", "find-books-with-no-available-copies"],
    },
    {
      name: "Surface-split pivots",
      why: "Voice-versus-text is a pivot: one row per cohort, one branch per surface, per geography. The trio drills the column-pivot grammar — outcome per row, weekday per column, geography reshaped — that the surface-split board and its shard cousins are written in.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "students-report-by-geography"],
    },
    {
      name: "Histograms & buckets",
      why: "Events-per-session distributions ship as bar charts: sessions bucketed by event count, engagement by band, orders by interval. These drills cover the bucket grammar — CASE ladders, interval gates, histogram folds — where the bucket edges are the whole audit.",
      slugs: ["create-a-session-bar-chart", "calculate-orders-within-each-interval", "spend-histogram"],
    },
    {
      name: "Silent-majority anti-joins",
      why: "Lurkers are defined by absence: members with sessions but no voice events, accounts that never streamed, visitors who never transacted. The trio drills the anti-join shapes — NOT EXISTS, LEFT JOIN IS NULL, visited-but-didn't — that the onboarding team lives in.",
      slugs: ["customer-who-visited-but-did-not-transact", "ad-free-sessions", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Threshold subqueries",
      why: "'Who's still active past the mean?' is a subquery shape: fold per member, compare against the book-wide average, keep the survivors. The trio drills the scalar-average gate, the second-highest read and the above-average-quantity filter that cadence screens are built from.",
      slugs: ["game-play-analysis-iv", "second-highest-salary", "orders-with-maximum-quantity-above-average"],
    },
  ],

  theory: [
    {
      id: "discord-t1",
      q: "A server-health report joins open sessions to activity batches and reports engagement per session. What does the raw join do to the numbers, and what's the fold-then-join fix?",
      a: "The raw join fans out: 103 sessions meeting 251 activity batches on the session key repeats every session-level column once per batch row — a member with four message batches carries their engagement unit four times, and SUM(total) over the join overcounts by each session's own batch count. The fix is to fold first: GROUP BY session_id in a derived table with SUM(quantity) for events, one row per session, then join. Now the grain is sessions on both sides and every aggregate is honest; COUNT(DISTINCT session_id) is the seatbelt, but the seatbelt hides the fan-out instead of fixing it. The senior tell is naming the grain before writing the join — at Discord the question 'sessions or batches?' is the interview's first turn, and it decides everything downstream.",
      tag: "joins",
    },
    {
      id: "discord-t2",
      q: "The retention board needs days between a member's consecutive sessions. Walk the LAG shape — and what does the first session's NULL mean?",
      a: "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) hangs the previous session beside each row; the gap is julianday(created_at) - julianday(prev), and the partition's first row has nothing to look back at — prev is NULL. That NULL is information: no previous session, not a zero-day gap, and COALESCE(prev, created_at) would fabricate 16 fake zero-gaps and crush the average. The honest board filters WHERE prev IS NOT NULL for gap stats — 87 real gaps across the 16 members on the audit db — and reports the 16 first sessions as their own population. LEAD is the same walk pointed forward; mixing orientations on one board is how alive-shares silently become cold-tails. State the orientation and the threshold next to every number the board prints.",
      tag: "windows",
    },
    {
      id: "discord-t3",
      q: "The engagement census needs all four session outcomes with counts that reconcile to the population. Why conditional aggregates, and what does filtering the outcome in WHERE break?",
      a: "One pass, four branches: COUNT(CASE WHEN status = 'delivered' THEN 1 END) beside its siblings folds 52 voice-completed, 30 text-only, 14 lurking, 7 dropped from the same 103 rows — numerator and denominator from one population, so 52+30+14+7 = 103 is an identity the board checks before publishing. Put status = 'delivered' in WHERE and the denominator drifts to match the numerator: every kept branch now reads against 82, the shares inflate, and the reconciliation identity dies silently. The ELSE arm matters too — a NULL-ELSE merges lurking into dropped, and the community team loses the onboarding signal exactly when it matters. Conditional aggregates keep the population whole and the definition printed; that discipline is the census.",
      tag: "aggregation",
    },
    {
      id: "discord-t4",
      q: "21 of 103 sessions carry no verification stamp. How should the lag report treat them, and what does COALESCE(stamp, created_at) do?",
      a: "The unstamped 21 are the 14 lurking plus 7 dropped sessions — sessions that never reached verification, which is precisely the state the report exists to surface. The lag metric is julianday(stamp) - julianday(created_at) over the 82 stamped sessions only (2.98-day average, 2–4 range), with the stamped count printed beside the average so the denominator is visible. COALESCE(stamp, created_at) would fold every unstamped session into a zero-day verification — the report now claims the dropped tail verifies instantly, and the 2.98 average collapses into a fiction. The policy: filter IS NOT NULL deliberately and say so, count the NULLs as their own arm, and never let a fallback invent a measurement. In a community product, *a missing stamp is the story; a coalesced one is the cover-up.*",
      tag: "nulls",
    },
    {
      id: "discord-t5",
      q: "A cohort read filters to voice-completed sessions in WHERE, then computes LAG gaps. Why do the gaps lie — and where does the status filter belong?",
      a: "Windows run after WHERE. Filter to voice-completed sessions and each member's partition now contains only the surviving rows — the LAG chain bridges across the deleted text-only and lurking sessions, so a member who shows up daily but voices weekly reads as a 7-day streak of 1-day gaps. The gaps are computed over a population the filter silently rewrote, which is the most honest-looking lie in retention SQL. The fix depends on the question: if the cadence definition is sessions regardless of outcome, compute gaps first (CTE over all sessions), then classify; if the streak is genuinely voice-only, the filter is the definition — stated, with the denominator becoming voice-completed sessions. At Discord the rule is spoken: *filter after the window, or filter as a stated definition — never as an accident of clause order.*",
      tag: "pipeline",
    },
    {
      id: "discord-t6",
      q: "'Which members re-entered a server within 7 days of a session?' — how does the threshold query work, and why is it a subquery shape rather than a plain filter?",
      a: "The condition is relational, not scalar: a member qualifies if ANY later session of theirs exists inside the window — EXISTS (SELECT 1 FROM orders later WHERE later.customer_id = o.customer_id AND julianday(later.created_at) - julianday(o.created_at) BETWEEN 0 AND 7). A plain filter can't see another row; the correlated subquery can. The re-entry share is then qualified members over all members — and the denominator choice (16 members here, or sessions) is the follow-up that separates candidates. The BETWEEN edges matter: 0 includes same-day re-entries, 7 is the window's closed end — off-by-one here moves members across the habit line silently. On this db the pair-count shape is exactly the users-with-two-purchases-within-seven-days drill, and the EXISTS form wins on readability and short-circuits at scale.",
      tag: "subqueries",
    },
    {
      id: "discord-t7",
      q: "Streak definitions: is a 'daily streak' calendar days or 24-hour gaps? How does the SQL differ, and why does the choice move the metric?",
      a: "Calendar-day streaks bucket by STRFTIME('%Y-%m-%d', created_at) and compare bucket adjacency — a 23:50 open and a 00:10 open are consecutive days. 24-hour gaps compare julianday deltas ≤ 1 — the same pair is a 20-minute gap, trivially alive. Same member, same sessions, different streak: the definition IS the metric, which is why the board prints its definition next to the number. The month buckets run STRFTIME('%Y-%m') across 2024-01 through 2025-02 — 14 buckets, year included or two Februaries fold into one. The julianday form is the tool for gap magnitudes, the bucket form for streak ladders; the senior candidate states which one the community team means before writing either, because retro-fitting a definition after the dashboard ships is how two teams inherit two truths from one table.",
      tag: "dates",
    },
    {
      id: "discord-t8",
      q: "Client retries can ship the same activity batch twice into the session log. How do you dedupe without losing real repeats?",
      a: "Dedupe on identity, not appearance: two batches are duplicates when member, session, event kind and timestamp agree — real repeats have distinct timestamps by definition. The keep-latest pattern is ROW_NUMBER() OVER (PARTITION BY session_id, event_type, ts ORDER BY ingested_at DESC) = 1 in a CTE, then filter to the survivor — the newest ingestion wins and the audit trail of duplicates stays queryable. A plain GROUP BY with MAX would silently pick arbitrary columns from different duplicate rows (Frankenstein rows), and DISTINCT on the whole row only works when every column truly matches. The census consequence: 251 raw batches on the audit db is the RETRY-INCLUSIVE count, so the events-per-session fold runs on the deduped set and states the pre-dedupe count beside it. *Deduplication is a definition before it is a query* — and at Discord the definition ships in the memo, not in folklore.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "discord-mcq-1",
      prompt: "The session-outcome census over 103 open sessions returns: 52 delivered, 30 shipped, 14 pending, 7 cancelled. In the declared mapping, how many sessions ended in a completed voice room?",
      choices: [
        "52",
        "82 — delivered plus shipped",
        "30",
        "7 — the rest were abandoned",
      ],
      answer: 0,
      why: "'delivered' is the voice-completed arm — 52 sessions that joined and finished a voice room. 'shipped' is the text-and-forum-only arm, a different surface in the same census.",
      notes: [
        { choice: 1, why: "82 is the stamped-session count (both ended arms) — a verification-lag denominator, not a voice count." },
        { choice: 2, why: "30 is text-and-forum only — the surface split exists precisely because that arm never touched a voice room." },
        { choice: 3, why: "7 is the dropped arm — the opposite outcome from completing a room." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-2",
      prompt: "The activity log stores 251 BATCHES with quantity = events per batch. Which query returns total in-session events?",
      choices: [
        "SELECT COUNT(*) FROM order_items",
        "SELECT SUM(quantity) FROM order_items",
        "SELECT AVG(quantity) FROM order_items",
        "SELECT COUNT(DISTINCT quantity) FROM order_items",
      ],
      answer: 1,
      why: "SUM(quantity) folds per-batch counts into total events — the engagement volume. COUNT(*) is 251 batches, the retry-inclusive row count.",
      notes: [
        { choice: 0, why: "251 is the batch grain — the bot-play census needs events, and batches ≠ events the moment quantity > 1." },
        { choice: 2, why: "AVG gives batch richness (events per batch) — a different KPI the telemetry team also ships, but not volume." },
        { choice: 3, why: "DISTINCT quantity counts distinct VALUES — 1, 2, 3, 4 — not events." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-3",
      prompt: "The retention trend buckets sessions by month over 2024-01 through 2025-02. Which expression is calendar-safe?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "created_at",
      ],
      answer: 1,
      why: "'%Y-%m' prints 14 distinct, chronologically-sortable buckets. Month-only variants fold February-2024 into February-2025 and destroy the year-over-year read.",
      notes: [
        { choice: 0, why: "'%m' drops the year — 12 buckets, two Februaries merged, the trend's spine broken." },
        { choice: 2, why: "SUBSTR(6,2) is the same month-only slice via string surgery — same fold, same loss." },
        { choice: 3, why: "The raw timestamp is day-grain — one bucket per day where the trend expects 14 months." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-4",
      prompt: "Gap SQL: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). For which row is prev NULL?",
      choices: [
        "Every row — LAG needs an explicit frame",
        "Each member's first session — nothing precedes it in the partition",
        "Dropped sessions only",
        "Only the log's globally earliest session",
      ],
      answer: 1,
      why: "LAG looks one row back within the partition; the first row of each member's partition has no previous — 16 such NULLs on this db, reported as 'no previous session', not zero-day gaps.",
      notes: [
        { choice: 0, why: "LAG works with a bare OVER — only the partition's head row lacks a previous value." },
        { choice: 2, why: "Dropped sessions still carry created_at — outcome never affects the window's input rows." },
        { choice: 3, why: "Every member's first session NULLs (16 rows), not just the log's earliest — partitions, not the table, define the window." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-5",
      prompt: "The engagement census groups sessions by market cohort with one FILTER arm per outcome. What guarantees the EU cells (24, 12, 6) reconcile to EU's session count?",
      choices: [
        "ORDER BY inside each arm",
        "All arms fold the same unfiltered rows — counts from one population sum to its COUNT(*)",
        "Adding DISTINCT to each COUNT",
        "The arm order in the SELECT",
      ],
      answer: 1,
      why: "Conditional counts over the same GROUP BY population are additive by construction: 24+12+6 = 42 voice/text/lurking, plus 3 dropped = EU's 45 sessions. The reconciliation identity is the census's built-in audit.",
      notes: [
        { choice: 0, why: "ORDER BY arranges display, not arithmetic — reconciliation comes from shared population, not sort order." },
        { choice: 2, why: "DISTINCT would UNDERCOUNT members with multiple same-outcome sessions — the cells would stop summing to the population." },
        { choice: 3, why: "Arm order is cosmetic — the identity lives in the shared fold and survives any permutation." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-6",
      prompt: "An analyst filters WHERE status = 'delivered' in a CTE, THEN computes LAG gaps per member in the outer query. What happened to the cadence?",
      choices: [
        "Nothing — filters commute with windows",
        "The LAG chains bridge across filtered-out sessions, so gaps skip the text-only opens and streaks look longer/cleaner than reality",
        "The query errors — windows can't follow WHERE",
        "Only the first session per member is affected",
      ],
      answer: 1,
      why: "Windows run on the rows that survive WHERE: the deleted text-only and lurking sessions vanish from each partition and LAG bridges straight across them — a daily opener who lurks most days reads as a clean voice-only streak.",
      notes: [
        { choice: 0, why: "Clause order is the whole point — the window sees the filtered set, and the filter rewrote each member's timeline." },
        { choice: 2, why: "It compiles and runs — that's exactly why it ships. The lie is silent, not syntactic." },
        { choice: 3, why: "Every gap in the partition changes, not just the head — each surviving row's 'previous' may now be days further back." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-7",
      prompt: "Sessions (103) join activity batches (251) on session id; the outer query counts sessions with COUNT(*). What does it actually count?",
      choices: [
        "103",
        "251 — the batch grain won",
        "354",
        "The distinct member count",
      ],
      answer: 1,
      why: "The one-to-many join fans every session out to its batches — COUNT(*) reads 251, the batch grain. Session counts need COUNT(DISTINCT session_id) or, better, a fold-then-join so the grain never leaves session level.",
      notes: [
        { choice: 0, why: "103 was true before the join; after a one-to-many fan-out the row count is the many side." },
        { choice: 2, why: "Joins don't add the two tables' counts — the fan-out replaces the base, it doesn't sum with it." },
        { choice: 3, why: "Members were never the grain of the joined rows — the count is batches wearing session clothing." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-8",
      prompt: "The cadence screen gates members above the book-wide mean. 103 sessions across 16 members — how many members clear a strict > 6.44 gate?",
      choices: [
        "4 — the 24/17/14/13-period power users",
        "9 — everyone with 4 or more periods",
        "12",
        "16 — everyone beats the mean",
      ],
      answer: 0,
      why: "The mean cadence is 6.44; only the 24, 17, 14 and 13-period members clear a strict > 6.44 — the heavy-habit quartet holding 63.5% of demand.",
      notes: [
        { choice: 1, why: "9 is the ≥ 4-period count — a looser gate that admits the four 4-period members the mean excludes." },
        { choice: 2, why: "No gate at 12 exists in the book — 13 is the next real cadence below 14." },
        { choice: 3, why: "Half the book sits below the mean by definition — means don't work that way." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-9",
      prompt: "Nitro billing stores amounts as INTEGER cents. Which expression prints a per-session billed average with 2 decimals?",
      choices: [
        "AVG(amount_cents)/100",
        "ROUND(AVG(amount_cents)/100.0, 2)",
        "ROUND(AVG(amount_cents), 2)",
        "CAST(AVG(amount_cents) AS TEXT)",
      ],
      answer: 1,
      why: "Divide by 100.0 for real division, then ROUND(…, 2) at the display edge. The pipeline keeps integer cents; only the print converts.",
      notes: [
        { choice: 0, why: "AVG of cents is REAL, so /100 divides a float here — but the pattern is fragile: the moment someone swaps AVG for integer SUM, /100 truncates every odd cent." },
        { choice: 2, why: "Rounding raw cents prints a figure 100× too large — the board would overstate Nitro billing by two orders of magnitude." },
        { choice: 3, why: "CAST to TEXT keeps raw cents with no decimal point — string money that downstream arithmetic can't use." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-10",
      prompt: "A bot-partner census counts voice-completed sessions with COUNT(*) FILTER (WHERE status = 'delivered'). A teammate swaps in 'paid'. What does the arm read?",
      choices: [
        "52 — same thing",
        "0 — 'paid' is billing vocabulary, not session vocabulary, and the fold returns a silent zero column",
        "An error — the query refuses to run",
        "7 — it falls back to cancelled",
      ],
      answer: 1,
      why: "'paid' exists in the invoices/payments state space, not the orders status space — the FILTER arm matches nothing and quietly counts zeros while the query runs clean, which is exactly the failure the reconciliation identity exists to catch.",
      notes: [
        { choice: 0, why: "The vocabularies look interchangeable in a storefront-shaped db — that's the trap; the arms must use the session quartet delivered/shipped/pending/cancelled." },
        { choice: 2, why: "SQLite happily counts an empty match as 0 — the danger is that it succeeds and ships a confident, wrong board." },
        { choice: 3, why: "No fallback exists — a non-matching literal yields 0, not the next arm's count." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-discord-1",
      tier: "medium",
      topic: "q5",
      universe: "growth",
      title: "The heavy-habit cohort screen",
      brief:
        "Growth memo, Monday: Nitro experiments need a fixed target list — the members whose session cadence is genuinely above the book's habit line, not just active. The db mapping is declared: orders are open sessions, customers are Discord members, order totals are engagement units. Probed facts: **103 open sessions from 16 members** across 2024-01 through 2025-02, so the book-wide mean cadence is **6.44** sessions per member — compute the fold, don't average the averages. The memo fixes the gate as a strict **greater-than 6.44** screen, members only (a member, not a session, is the unit), biggest cadence first. Last quarter this same screen surfaced the quartet that holds **63.5%** of the book's engagement, so the population definition matters as much as the SQL.",
      ask: "Return the members whose session count is strictly above 6.44 — member id and session count, biggest cadence first.",
      template:
        "SELECT fold.member,\n       fold.sessions\nFROM (\n  SELECT customer_id AS member, COUNT(*) AS sessions\n  FROM orders\n  GROUP BY {1}\n) AS fold\nWHERE fold.sessions > {2}\nORDER BY fold.sessions {3};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the fold key",
          why: "The unit is the MEMBER, so the derived fold groups by customer_id — one row per member with their session count. Grouping by anything else (or by row id) dissolves the member grain and the gate reads a fiction.",
        },
        {
          answer: "6.44",
          kind: "number",
          label: "the cadence gate",
          noVerify: true,
          why: "The memo fixes the gate at the probed book-wide mean: 103 sessions ÷ 16 members = 6.4375, stated as 6.44. It's a definition from the memo, not a result cell — and a strict > gate, so the four 4-period members stay out.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the cadence order",
          why: "Biggest cadence first, per the memo — DESC. ASC would ship the list upside down and the experiment team would A/B the wrong quartet first.",
        },
      ],
      distractors: ["region", "o.id", "13", "3", "24.5", "ASC"],
      walkthrough:
        "Two stages, one grain. The derived table folds orders to one row per member — GROUP BY customer_id, COUNT(*) as sessions — which is the member grain the memo demands; the outer query gates fold.sessions > 6.44 and orders DESC. The screen returns 4 rows: member 1 with 24 sessions, member 5 with 17, member 7 with 14, member 13 with 13 — the heavy-habit quartet whose lifetime engagement the facts file prices at 63.5% of the $34,833.28 book. GROUP BY region errors (orders carries no region) and o.id folds to one row per session, where nothing clears the gate; a gate of 13 trims the list to 14/17/24 (member 13's 13 ties the line and a strict > drops it — the boundary case the memo's 'strictly above' wording exists for), 3 admits the whole 9-member ≥ 4 tail, and 24.5 empties the screen. ASC ships the quartet bottom-up — same rows, wrong story.",
    },
    {
      id: "cs-discord-2",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass engagement census",
      brief:
        "Community memo, redesign review: the voice-versus-text census ships per market cohort in ONE pass — one row per cohort, one FILTER arm per outcome, counts that reconcile to the population by construction. The db mapping is declared: orders are open sessions, customers are members, regions are the four market cohorts, and the status vocabulary maps {emerald:delivered} = voice room joined & completed, {sky:shipped} = text-and-forum only, {violet:pending} = lurking, {rose:cancelled} = dropped. Probed facts: **103 sessions** split **52 / 30 / 14 / 7**, and the volume floor for this review is **45 sessions** — a cohort must clear it to make the deck. Unfiltered population, deterministic gate: cohorts at or above the floor only.",
      ask: "Return each market cohort clearing the 45-session floor with its session count and three FILTER arms — voice-completed, text-only, lurking.",
      template:
        "SELECT c.region,\n       COUNT(*) AS sessions,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS voice_rooms,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS text_only,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS lurking\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the voice-completed flag",
          why: "delivered is the session vocabulary for a voice room joined and completed — 52 overall, 24 in the surviving cohort. 'paid' belongs to the billing tables' state space and folds the arm to silent zeros.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the text-only flag",
          why: "shipped marks text-and-forum sessions — 30 overall, and the cohort's 12 against 24 voice-completed is the surface split the redesign review is arguing about. 'void' is billing vocabulary; crossing it zeroes the arm invisibly.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the lurking flag",
          why: "pending is the lurking arm — 14 sessions the onboarding team watches. 'refunded' isn't a session state; the branch would read zero and the review would lose its leading indicator.",
        },
        {
          answer: "45",
          kind: "number",
          label: "the volume floor",
          why: "The memo fixes the deck floor at 45 sessions — exactly the biggest cohort's count, so the gate keeps one cohort and drops the rest. 37 would wave APAC through too; 52 empties the deck.",
        },
      ],
      distractors: ["'paid'", "'void'", "'refunded'", "37", "52"],
      walkthrough:
        "One scan, four arms, one population. The join attaches each session to its market cohort, GROUP BY folds the four cohorts, and each COUNT(*) FILTER (WHERE …) arm counts its outcome from the SAME rows — so the surviving cohort reads EU | 45 | 24 | 12 | 6, and 24+12+6+3(dropped) = 45 reconciles the row against its own COUNT(*). The HAVING gate at 45 keeps exactly EU: APAC's 37, US's 19 and LATAM's 2 fall below the floor. The distractors are vocabulary crossings from the billing tables — 'paid', 'void', 'refunded' are not session states — and each folds its arm to a column of silent zeros while the query runs clean, which is exactly the failure the reconciliation identity exists to catch. 37 in the floor admits APAC as a second row, and 52 empties the deck; no WHERE filter on status anywhere — filtering the outcome first would shrink the population and kill the reconciliation.",
    },
  ],

  problems: [
    { slug: "game-play-analysis-iv", why: "First session after the join — the onboarding read that decides whether a new member's first day became a habit, drilled with the install-to-first-play shape." },
    { slug: "game-play-analysis-ii", why: "Join-back to the next event — what a member did immediately after their first open, the follow-through read acquisition teams live by." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two sessions inside a 7-day window — the re-entry habit gate: which members came back fast enough for a server routine to form." },
    { slug: "cohort-retention-matrix", why: "The cohort retention matrix — which join month keeps its actives, the board the verification-lag read feeds." },
    { slug: "week-over-week-churn", why: "Week-over-week churn via LAG — the dropped-arm trend: how the disconnected population moves week to week." },
    { slug: "growth-accounting", why: "New minus resurrect minus churn — the growth identity the community team reconciles before any headline ships." },
    { slug: "longest-winning-streak", why: "Longest streak via gaps-and-islands — the canonical consecutive-days read the daily-server-habit headline hangs on." },
    { slug: "fifteen-days-of-learning", why: "The 15-day activity wall — a long-horizon habit audit: who showed up day after day, and when the ladder broke." },
    { slug: "biggest-window-between-events", why: "The biggest gap between a member's sessions — the silence finder, LEAD over each partition with the max gap named." },
    { slug: "second-day-confirmation", why: "Second-day return — the D2 read that decides whether a first session became a routine, LEAD over the member's own timeline." },
    { slug: "trial-to-paid-funnel", why: "Trial-to-paid — the Nitro conversion step count with honest step denominators, the funnel the monetization team ships monthly." },
    { slug: "analyze-subscription-conversion", why: "Subscription conversion with the LEFT JOIN NULL arm — who never converted, the silent-majority list inside the billing data." },
    { slug: "create-a-session-bar-chart", why: "Sessions bucketed into a bar chart — the events-per-session histogram the server-health review ships, bucket edges as stated definitions." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Visited-but-didn't-transact — the lurker anti-join: sessions with presence but no voice activity, the onboarding team's source list." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — is the server a habit or a rotation, computed with honest weekly denominators." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the trailing-window trend line the community team reads instead of single-day spikes." },
  ],
};
