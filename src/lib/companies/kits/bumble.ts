// Bumble — kit 13 of the Streaming & Social domain (Batch L, wave 7).
// The women-first dating company: matches, the 24-hour first-move window,
// opening lines and the Premium upgrade that monetizes the whole thing. Pool
// provenance: Bumble carries ZERO tagged registry problems (0 tagged LC —
// theme-curated, stated per spec) — all 16 problem slots and all 30 topic
// slugs are THEME-CURATED from the SQL band's funnel/window/billing-shaped
// problems. Case studies run on db/custom.db with probed figures from
// scripts/company-facts.md, mapped as: orders = matches (each opens a
// first-move window), customers = Bumble members, regions = the four market
// cohorts, order status = conversation outcome (delivered = opener sent &
// replied, shipped = opener sent & unanswered, pending = sitting unopened in
// its window, cancelled = expired unopened), order_items = in-match event
// batches (quantity = events per batch), order total = engagement units per
// match, shipped_at = the first-move stamp, products = Boost/Spotlight/
// SuperSwipe SKUs & prompt packs, suppliers = prompt & icebreaker content
// partners, invoices/payments = Premium & Boost billing (INTEGER cents ÷
// 100), expenses = trust-&-safety and growth spend. Mappings declared
// in-world, no invented telemetry; every figure probed against db/custom.db
// (read-only).

import type { CompanyKit } from "../types";

export const bumbleKit: CompanyKit = {
  id: "bumble",
  domainId: "media",
  name: "Bumble",
  tagline: "Women-first dating: swipes, matches, conversations",
  accent: "text-amber-200",

  brief: [
    "Bumble is the women-first dating app — the match is the product's atomic unit and the 24-hour first-move window is its ticking clock. The unit of analysis is the **match**: one member pair, one window, one outcome — {emerald:opener sent & replied}, {sky:opener sent & unanswered}, sitting unopened, or {rose:expired unopened}. Everything the product teams argue about — whether a prompt redesign lifted real conversations, which cohort lets matches die in the window, why July cooled — hangs on queries that fold **251 in-match event batches** into **103 matches** from **16 members** across four market cohorts, with a **$34,833.28** engagement book behind them. The population behind every ratio gets stated before it's believed.",
    "The data org runs three engines. Match telemetry folds the event-batch log into the conversation-health boards the messaging team reads at 08:20 sharp. First-move analytics runs the window math: **82 of 103 matches carry a first-move stamp**, a **2.98-day average** match-to-opener lag with a 2–4 day range on the audit clock — the storefront stand-in runs a slower clock than Bumble's live 24-hour window, and the kit reports the probed figures as probed — and the unstamped 21 are the unopened-plus-expired tail, reported as a state, never as zero. Monetization reads Premium & Boost billing, where amounts live as INTEGER cents and `amount_cents / 100.0` at the display edge is house style — card rails ran **16 payments / $37,364.00** against wire rails at **11 / $32,248.00**, and the ledger ties at **181,080 = 181,080** every close.",
    "Interview screens are funnel- and window-shaped. A typical loop opens with a fold (events per match, matches per cohort — `SUM(quantity)`, not `COUNT(*)`, because batches carry retries), escalates into a **cohort fold with a HAVING gate** — which market cohorts clear the volume floor, and what does the opener lag read per market — and lands on either a **CASE band board** (first-moves bucketed inside vs outside the response window) or a threshold subquery (*who messaged back within 7 days of the opener?*). The follow-ups are definition probes: per what — batches or events, matches or members, calendar days or the live 24-hour window? Candidates who state the denominator and keep the census unfiltered consistently outperform.",
    "Preparation strategy: Bumble has **no tagged registry problems**, so this kit theme-curates all sixteen — golden-hour openers, reply-window pair scans, the Premium trial funnel and the matched-but-never-messaged anti-joins. Then run both case studies on the live storefront db: one rebuilds the {violet:cohort first-move funnel} (a join-and-fold with a HAVING gate — EU, APAC and US survive the floor, LATAM does not), the other rebuilds the {emerald:response-window board} (CASE bands over the 82 stamped matches — inside 48 hours vs the slow lane). The storefront mapping is declared, not hidden — orders are matches, totals are engagement units, regions are market cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
  ],

  dayInLife: [
    "**08:20 —** The overnight conversation-health board. The analyst opens telemetry's morning reads: matches per cohort, the {emerald:replied share} (52 of 103 on the audit window), and the number that gates the day — the {rose:expired-window queue}: which matches hit the end of their first-move window untouched, and whether the July-style cool-off (**$1,193.86** month, 2 cancels) is repeating. The first query is a LAG walk over each member's match partitions, gaps in julianday days, NULL on each member's first match kept and labeled. A spike in expiries without a reply-rate lift is the day's first fire, and the analyst who can split NEW expirers from CHRONIC ones — before the product lead pings — owns the morning.",
    "**11:30 —** First-move deep work. Growth wants the cohort funnel rebuilt: join matches to members, fold per market, gate above the volume floor. The board reads EU **45 matches / 36 first moves / 2.94-day** average opener lag, APAC **37 / 29 / 2.93**, US **19 / 15 / 3.07** — LATAM's 2 matches ride below every floor and stay in the appendix. Each ask is a fold, a gate and an argument about grain — batches versus events, matches versus members. *A funnel without its population is just a bar chart of vibes.*",
    "**15:30 —** Prompt-partner and Premium cycles. The partner review: prompt packs ranked by reply lift, the {sky:first-move lag} read (**82 of 103 stamped, 2.98-day average, 2–4 range** — the unstamped 21 are unopened-plus-expired, reported as a state), and the billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned) with the {amber:split-payment} register (5 invoices, one partial at **4,000 of 6,148** cents) flagged for finance. The afternoon's job is closing loops: yesterday's funnel becomes next sprint's window experiment, and every number that leaves the desk carries its denominator with it — the EOD note pins the SQL beside the figures it produced, because growth re-runs these blind.",
  ],

  metrics: [
    { name: "Matches per member", what: "103 matches across 16 members on the audit window, mean cadence 6.44. The frequency read every conversation-health board is cut from, always with the market cohort stated." },
    { name: "Replied share", what: "Matches where the opener got an answer: 52 of 103 (50.5%), the delivered arm. The product's core behavior read — the arm the messaging team ships weekly." },
    { name: "First-move lag", what: "Match-to-opener window where stamped: 82 of 103 matches, 2.98-day average, 2–4 range. The unstamped 21 are the unopened-plus-expired tail — a state to report, never a zero to invent." },
    { name: "Expired-window share", what: "Unopened (14) plus expired (7) = 20.4% of matches. The counterweight to every engagement headline, and the source list for window-mechanics experiments." },
    { name: "Engagement per match", what: "Engagement units — 338.19 average against the 34,833.28 book (range 25.47 to 1,088.44). SUM(total) over the fold, not COUNT(*): batches are not events." },
    { name: "Opener lag by cohort", what: "EU 2.94 days (36 stamped), APAC 2.93 (29), US 3.07 (15), LATAM 3.5 (2). The market read that decides where window-copy experiments get shelf space." },
    { name: "Premium rail mix", what: "Billing rails in honest dollars: card 16 payments / $37,364.00 vs wire 11 / $32,248.00. The mix that decides which payment-partner review gets escalated." },
    { name: "Boost settlement clock", what: "Settlement days — 28.4 average (13–84 range) against flat 30-day terms, with 5 split-payment invoices and one partial (4,000 of 6,148 cents). The finance-team latency board." },
  ],

  topics: [
    {
      name: "First matches & session counts",
      why: "Every member story starts with a first match, and every board starts with a count: matches per member, first-match attribution, minutes of activity per match. The curated trio drills the first-login fold, the distinct-viewer count and the duration roll-up that opens Bumble's conversation-health screens.",
      slugs: ["game-play-analysis-i", "article-views-i", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "Opener windows & reply scans",
      why: "First-move behavior is window math: openers fired right after the match, replies inside 7 days, second-day follow-through. The trio covers the golden-hour join, the two-events-in-a-window pair scan and the day+1 comparison the reply-rate board hangs on.",
      slugs: ["second-day-verification", "users-with-two-purchases-within-seven-days", "find-golden-hour-customers"],
    },
    {
      name: "CASE boards & response bands",
      why: "The response-window board is a CASE ladder: first-moves bucketed inside the 48-hour window vs the slow lane, one row per market cohort. These drills cover the branch grammar — classify, band, label — where a mis-sorted arm order silently mislabels the funnel.",
      slugs: ["type-of-triangle", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Premium & Boost conversion funnels",
      why: "Free-to-Premium is a funnel: match made, feature used, subscription paid. These drills build the step-conversion grammar — engagement funnels, ad-path funnels and the median-time-to-convert read that prices how long members sit before upgrading.",
      slugs: ["email-engagement-funnel", "ads-funnel", "median-time-to-convert"],
    },
    {
      name: "Match cohorts & winback",
      why: "Conversation retention reads cohort-shaped: which join month keeps its conversationalists, and which lapsed members came back inside the winback window. The trio is the cohort matrix, the dormant-risk scan and the winback recovery read the re-engagement team lives in.",
      slugs: ["cohort-retention-matrix", "dormant-reactivation", "winback-recovery"],
    },
    {
      name: "Prompt-pack content boards",
      why: "Prompts and icebreakers are content with a supply chain: packs per member, packs used in a period, each member's favorite feature. The trio drills the warehouse fold, the period catalog read and the per-member argmax the prompt-partner review is written from.",
      slugs: ["warehouse-manager", "most-frequently-ordered-product-per-customer", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Silent-match anti-joins",
      why: "Expired matches are defined by absence: members with matches but no first move, accounts that never opened a chat. The trio drills the anti-join shapes — visited-but-didn't, quiet-student NOT EXISTS, never-streamed — that the window-mechanics team lives in.",
      slugs: ["customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Billing & settlement discipline",
      why: "Premium billing reconciles like a bank: cents stored as INTEGERs, settlements split across rails, invoices that never got a payment leg. The trio drills the conditional fold, the account-summary reconciliation and the AR aging board finance closes the month with.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "ar-aging-schedule"],
    },
    {
      name: "Cohort folds & HAVING gates",
      why: "Cohort boards ship with volume floors: share-of-members percentages, cohorts above a match-count gate, members who ordered in consecutive periods. The trio drills the ratio fold, the HAVING gate and the consecutive-period stamina read the funnel deck is gated by.",
      slugs: ["percentage-of-users-attended-a-contest", "classes-more-than-5-students", "customer-order-frequency"],
    },
    {
      name: "One-pass opener censuses",
      why: "The opener census counts events by kind in one pass — openers, replies, prompt taps — and COUNT(CASE …) is the grammar. The literal snaps census is this read; the trio adds the target-met conditional and the zero-available gate that census reports lean on.",
      slugs: ["snaps-analysis", "number-of-employees-who-met-the-target", "find-books-with-no-available-copies"],
    },
  ],

  theory: [
    {
      id: "bumble-t1",
      q: "A conversation-health report joins matches to in-match event batches and reports engagement per match. What does the raw join do to the numbers, and what's the fold-then-join fix?",
      a: "The raw join fans out: 103 matches meeting 251 event batches on the match key repeat every match-level column once per batch row — a match with four event batches carries its engagement unit four times, and SUM(total) over the join re-prices the 34,833.28 book at 103,244.55. The fix is to fold first: GROUP BY match in a derived table with SUM(quantity) for events, one row per match, then join. Now the grain is matches on both sides and every aggregate is honest; COUNT(DISTINCT match_id) is the seatbelt, but the seatbelt hides the fan-out instead of fixing it. The senior tell is naming the grain before writing the join — at Bumble the question 'matches or events?' is the interview's first turn, and it decides everything downstream.",
      tag: "joins",
    },
    {
      id: "bumble-t2",
      q: "The re-engagement board needs days between a member's consecutive matches. Walk the LAG shape — and what does the first match's NULL mean?",
      a: "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) hangs the previous match beside each row; the gap is julianday(created_at) - julianday(prev), and the partition's first row has nothing to look back at — prev is NULL. That NULL is information: no previous match, not a zero-day gap, and COALESCE(prev, created_at) would fabricate 16 fake zero-gaps and crush the average. The honest board filters WHERE prev IS NOT NULL for gap stats — 87 real gaps across the 16 members on the audit db — and reports the 16 first matches as their own population. LEAD is the same walk pointed forward; mixing orientations on one board is how re-match shares silently become dormancy tails. State the orientation and the threshold next to every number the board prints.",
      tag: "windows",
    },
    {
      id: "bumble-t3",
      q: "The match-outcome census needs all four outcomes with counts that reconcile to the population. Why conditional aggregates, and what does filtering the outcome in WHERE break?",
      a: "One pass, four branches: COUNT(CASE WHEN status = 'delivered' THEN 1 END) beside its siblings folds 52 replied, 30 unanswered-opener, 14 unopened, 7 expired from the same 103 rows — numerator and denominator from one population, so 52+30+14+7 = 103 is an identity the board checks before publishing. Put status = 'delivered' in WHERE and the denominator drifts to match the numerator: every kept branch now reads against 82, the shares inflate, and the reconciliation identity dies silently. The ELSE arm matters too — a NULL-ELSE merges unopened into expired, and the window team loses the leading indicator exactly when it matters. Conditional aggregates keep the population whole and the definition printed; that discipline is the census.",
      tag: "aggregation",
    },
    {
      id: "bumble-t4",
      q: "21 of 103 matches carry no first-move stamp. How should the opener-lag report treat them, and what does COALESCE(stamp, created_at) do?",
      a: "The unstamped 21 are the 14 unopened plus 7 expired matches — matches that never saw a first move, which is precisely the state the report exists to surface. The lag metric is julianday(stamp) - julianday(created_at) over the 82 stamped matches only (2.98-day average, 2–4 range), with the stamped count printed beside the average so the denominator is visible. COALESCE(stamp, created_at) would fold every unstamped match into a zero-day opener — the report now claims the expired tail moves instantly, and the 2.98 average collapses into a fiction. The policy: filter IS NOT NULL deliberately and say so, count the NULLs as their own arm, and never let a fallback invent a measurement. In a first-move product, *a missing stamp is the story; a coalesced one is the cover-up.*",
      tag: "nulls",
    },
    {
      id: "bumble-t5",
      q: "A cohort read filters to replied matches in WHERE, then computes LAG gaps per member. Why do the gaps lie — and where does the status filter belong?",
      a: "Windows run after WHERE. Filter to replied matches and each member's partition now contains only the surviving rows — the LAG chain bridges across the deleted unanswered, unopened and expired matches, so a member who matches daily but gets replies weekly reads as a tight streak of 1-day gaps. The gaps are computed over a population the filter silently rewrote, which is the most honest-looking lie in funnel SQL. The fix depends on the question: if the cadence definition is matches regardless of outcome, compute gaps first (CTE over all matches), then classify; if the read is genuinely replied-only, the filter is the definition — stated, with the denominator becoming replied matches. At Bumble the rule is spoken: *filter after the window, or filter as a stated definition — never as an accident of clause order.*",
      tag: "pipeline",
    },
    {
      id: "bumble-t6",
      q: "'Which matches got a message back within 7 days of the opener?' — how does the threshold query work, and why is it a subquery shape rather than a plain filter?",
      a: "The condition is relational, not scalar: a match qualifies if ANY later event of the pair exists inside the window — EXISTS (SELECT 1 FROM orders later WHERE later.customer_id = o.customer_id AND julianday(later.created_at) - julianday(o.created_at) BETWEEN 0 AND 7). A plain filter can't see another row; the correlated subquery can. The reply-window share is then qualified matches over all matches — and the denominator choice (103 matches, or the 82 stamped, or 16 members) is the follow-up that separates candidates. The BETWEEN edges matter: 0 includes same-day replies, 7 is the window's closed end — off-by-one here moves matches across the reply line silently. On this db the pair-count shape is exactly the users-with-two-purchases-within-seven-days drill, and the EXISTS form wins on readability and short-circuits at scale.",
      tag: "subqueries",
    },
    {
      id: "bumble-t7",
      q: "Window definitions: is the '24-hour first-move window' clock time or calendar days? How does the SQL differ, and why does the choice move the metric?",
      a: "Clock-time windows compare julianday(stamp) - julianday(created_at) <= 1 — elapsed hours, fractional days. Calendar-day windows bucket by STRFTIME('%Y-%m-%d', created_at) and compare bucket adjacency — an 23:50 match and a 00:10 opener are consecutive days but 20 minutes apart, so the two definitions disagree exactly at midnight. Same matches, different board: the definition IS the metric, which is why the memo prints its definition next to the number. The month buckets run STRFTIME('%Y-%m') across 2024-01 through 2025-02 — 14 buckets, year included or two Februaries fold into one. The audit db's stamps run on a 2–4 day clock, so this kit reports the probed lag as probed and keeps the 24-hour framing as the live product's definition; conflating the two clocks is how teams inherit two truths from one table.",
      tag: "dates",
    },
    {
      id: "bumble-t8",
      q: "Client retries can ship the same event batch twice into the match log. How do you dedupe without losing real repeats?",
      a: "Dedupe on identity, not appearance: two batches are duplicates when match, event kind and timestamp agree — real repeats have distinct timestamps by definition. The keep-latest pattern is ROW_NUMBER() OVER (PARTITION BY match_id, event_type, ts ORDER BY ingested_at DESC) = 1 in a CTE, then filter to the survivor — the newest ingestion wins and the audit trail of duplicates stays queryable. A plain GROUP BY with MAX would silently pick arbitrary columns from different duplicate rows (Frankenstein rows), and DISTINCT on the whole row only works when every column truly matches. The census consequence: 251 raw batches on the audit db is the RETRY-INCLUSIVE count, so the events-per-match fold runs on the deduped set and states the pre-dedupe count beside it. *Deduplication is a definition before it is a query* — and at Bumble the definition ships in the memo, not in folklore.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "bumble-mcq-1",
      prompt: "The match-outcome census over 103 matches returns: 52 delivered, 30 shipped, 14 pending, 7 cancelled. In the declared mapping, how many matches ended with the opener answered?",
      choices: [
        "52",
        "82 — delivered plus shipped",
        "30",
        "7 — the rest expired",
      ],
      answer: 0,
      why: "'delivered' is the replied arm — 52 matches where the opener got an answer. 'shipped' is the opener-sent-but-unanswered arm, a different outcome in the same census.",
      notes: [
        { choice: 1, why: "82 is the stamped-match count (both first-moved arms) — an opener-lag denominator, not a replied count." },
        { choice: 2, why: "30 is opener-sent-but-unanswered — the reply-rate read exists precisely because that arm stalled after the first move." },
        { choice: 3, why: "7 is the expired arm — matches that never saw a first move at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "bumble-mcq-2",
      prompt: "The event log stores 251 BATCHES with quantity = events per batch. Which query returns total in-match events?",
      choices: [
        "SELECT COUNT(*) FROM order_items",
        "SELECT SUM(quantity) FROM order_items",
        "SELECT AVG(quantity) FROM order_items",
        "SELECT COUNT(DISTINCT quantity) FROM order_items",
      ],
      answer: 1,
      why: "SUM(quantity) folds per-batch counts into total events — the engagement volume. COUNT(*) is 251 batches, the retry-inclusive row count.",
      notes: [
        { choice: 0, why: "251 is the batch grain — the opener census needs events, and batches ≠ events the moment quantity > 1." },
        { choice: 2, why: "AVG gives batch richness (events per batch) — a different KPI the telemetry team also ships, but not volume." },
        { choice: 3, why: "DISTINCT quantity counts distinct VALUES — 1, 2, 3, 4 — not events." },
      ],
      difficulty: "easy",
    },
    {
      id: "bumble-mcq-3",
      prompt: "The match trend buckets matches by month over 2024-01 through 2025-02. Which expression is calendar-safe?",
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
      id: "bumble-mcq-4",
      prompt: "Re-match gap SQL: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). For which row is prev NULL?",
      choices: [
        "Every row — LAG needs an explicit frame",
        "Each member's first match — nothing precedes it in the partition",
        "Expired matches only",
        "Only the log's globally earliest match",
      ],
      answer: 1,
      why: "LAG looks one row back within the partition; the first row of each member's partition has no previous — 16 such NULLs on this db, reported as 'no previous match', not zero-day gaps.",
      notes: [
        { choice: 0, why: "LAG works with a bare OVER — only the partition's head row lacks a previous value." },
        { choice: 2, why: "Expired matches still carry created_at — outcome never affects the window's input rows." },
        { choice: 3, why: "Every member's first match NULLs (16 rows), not just the log's earliest — partitions, not the table, define the window." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-5",
      prompt: "An analyst filters WHERE status = 'delivered' in a CTE, THEN computes LAG gaps per member in the outer query. What happened to the re-match gaps?",
      choices: [
        "Nothing — filters commute with windows",
        "The LAG chains bridge across filtered-out matches, so gaps skip the unanswered and expired rows and cadence looks tighter than reality",
        "The query errors — windows can't follow WHERE",
        "Only the first match per member is affected",
      ],
      answer: 1,
      why: "Windows run on the rows that survive WHERE: the deleted unanswered, unopened and expired matches vanish from each partition and LAG bridges straight across them — a daily matcher whose replies land weekly reads as a clean replied-only streak.",
      notes: [
        { choice: 0, why: "Clause order is the whole point — the window sees the filtered set, and the filter rewrote each member's timeline." },
        { choice: 2, why: "It compiles and runs — that's exactly why it ships. The lie is silent, not syntactic." },
        { choice: 3, why: "Every gap in the partition changes, not just the head — each surviving row's 'previous' may now be days further back." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-6",
      prompt: "The cohort funnel gates HAVING COUNT(*) >= 19 over regional folds of EU 45, APAC 37, US 19, LATAM 2. Which cohorts make the board?",
      choices: [
        "EU and APAC only — a strict floor trims everything at 19",
        "EU, APAC and US — the gate is >=, so US's 19 sits on the line and stays",
        "All four — LATAM's 2 matches still count toward the population",
        "None — the gate must reference an aggregate, not a constant",
      ],
      answer: 1,
      why: "HAVING COUNT(*) >= 19 keeps every cohort whose fold is at least 19: EU 45, APAC 37, US 19. LATAM's 2 falls below and drops to the appendix — the boundary case the memo's wording exists for.",
      notes: [
        { choice: 0, why: ">= is inclusive — US's 19 clears the line exactly; a strict > gate would be the trim that drops it." },
        { choice: 2, why: "The gate filters the FOLDED rows — LATAM's 2 matches fold into a count of 2, which is below any real floor." },
        { choice: 3, why: "Constants in HAVING are fine — COUNT(*) >= 19 compares the fold to the memo's floor every time." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-7",
      prompt: "Matches (103) join event batches (251) on match id; the outer query counts matches with COUNT(*). What does it actually count?",
      choices: [
        "103",
        "251 — the batch grain won",
        "354",
        "The distinct member count",
      ],
      answer: 1,
      why: "The one-to-many join fans every match out to its batches — COUNT(*) reads 251, the batch grain. Match counts need COUNT(DISTINCT match_id) or, better, a fold-then-join so the grain never leaves match level.",
      notes: [
        { choice: 0, why: "103 was true before the join; after a one-to-many fan-out the row count is the many side." },
        { choice: 2, why: "Joins don't add the two tables' counts — the fan-out replaces the base, it doesn't sum with it." },
        { choice: 3, why: "Members were never the grain of the joined rows — the count is batches wearing match clothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-8",
      prompt: "The partial Boost invoice holds 6,148 cents. An analyst computes amount_cents/100 to print dollars. What prints?",
      choices: [
        "61.48",
        "61 — integer division truncates the cents",
        "0.6148",
        "An error — cents are TEXT and can't divide",
      ],
      answer: 1,
      why: "INTEGER / INTEGER in SQLite is integer division: 6148/100 = 61, and the 48 cents vanish before any rounding. The house pattern is amount_cents / 100.0 (real division), then ROUND(…, 2) at the display edge: 61.48.",
      notes: [
        { choice: 0, why: "61.48 is what SHOULD print — but /100 on two integers truncates first; only the .0 denominator makes the division real." },
        { choice: 2, why: "That's dividing by 10,000 — the amount shrinks a hundredfold. The denominator is 100, not 10,000." },
        { choice: 3, why: "SQLite happily divides INTEGERs — the danger is that it succeeds and prints a confident, wrong 61." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-9",
      prompt: "A conversation-health memo reads engagement of 103,244.55 for a book the facts price at 34,833.28. The query is SELECT SUM(o.total) FROM matches o JOIN event_batches b ON b.match_id = o.id. What happened?",
      choices: [
        "The event log double-counts retries and must be deduped first",
        "The one-to-many join repeated each match's total once per event batch — SUM over the fan-out tripled-plus the book",
        "ROUND collapsed the units",
        "The join should have been on customer_id instead",
      ],
      answer: 1,
      why: "SUM(o.total) over a match-to-batch fan-out sums the match total once per batch row — 251 rows against 103 matches inflates the book to exactly the 103,244.55 the memo printed. Fold batches per match first, then join at match grain.",
      notes: [
        { choice: 0, why: "Retries would double-count events, but the inflated figure comes from the match total repeating per batch — a grain problem, not a dedupe problem." },
        { choice: 2, why: "No rounding is involved — the raw SUM already reads 103,244.55 before any display shaping." },
        { choice: 3, why: "Joining on customer_id would fan out differently but still inflate — the fix is folding before joining, not re-keying." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-10",
      prompt: "Finance needs Boost invoices with NO payment rows at all: 28 invoices, 27 payment legs, 5 split-payment invoices paying in two legs. Which read returns the true unpaid queue (6 invoices, 15,217.00)?",
      choices: [
        "INNER JOIN payments … GROUP BY i.id HAVING COUNT(*) = 0",
        "LEFT JOIN payments p ON p.invoice_id = i.id … WHERE p.invoice_id IS NULL",
        "WHERE i.amount_cents IS NULL",
        "JOIN payments … WHERE p.paid_on > 0",
      ],
      answer: 1,
      why: "Unpaid invoices are an anti-join: LEFT JOIN every payment leg and keep the rows where no leg attached (p.invoice_id IS NULL) — 6 invoices, 15,217.00, including the paid-but-unmoved #28 (1,756.00).",
      notes: [
        { choice: 0, why: "An INNER JOIN drops exactly the rows with no partner — the queue it's hunting is gone before HAVING ever runs; the result is empty." },
        { choice: 2, why: "amount_cents is never NULL — the invoice side is always populated; the missing side is the payment, so the test must be on p's key." },
        { choice: 3, why: "A positive paid_on proves payment — that returns the PAID invoices, the exact complement of the queue." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-bumble-1",
      tier: "medium",
      topic: "j7",
      universe: "funnel",
      title: "The cohort first-move funnel",
      brief:
        "Growth memo, Monday: the first-move funnel ships per market cohort — matches, first moves, and the match-to-opener lag, gated to cohorts with real volume. The db mapping is declared: orders are matches, customers are members, shipped_at is the first-move stamp. Probed facts: **103 matches from 16 members** across 2024-01 through 2025-02; the regional folds read **EU 45 matches / 36 stamped / 2.94-day** average opener lag, **APAC 37 / 29 / 2.93**, **US 19 / 15 / 3.07**, **LATAM 2 / 2 / 3.5**. The memo fixes the deck floor at **19 matches** — a cohort must clear it to make the board (the gate is >=, so a cohort sitting exactly on 19 stays). Biggest cohort first.",
      ask: "Return each market cohort clearing the 19-match floor with its match count, first-move count and average opener lag (2 decimals), biggest cohort first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS matches,\n       COUNT(o.{1}) AS first_moves,\n       ROUND(AVG(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS avg_open_days\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY matches {4};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the first-move stamp",
          why: "COUNT(o.shipped_at) counts only the matches that carry the first-move stamp — 82 overall, 36 in the biggest cohort — because NULLs drop out of COUNT(column). COUNT(o.created_at) would count every match and print a 100% first-move funnel.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the join key",
          why: "Matches attach to their market cohort through the member: c.id = o.customer_id. Joining on o.id pairs match row-ids against member ids — a nonsense key that empties the funnel while the query still runs.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the volume floor",
          why: "The memo fixes the deck floor at 19 matches — exactly the US cohort's count, so the gate keeps three cohorts and drops LATAM's 2. 37 would wave only EU and APAC through; 20 would drop US on the boundary.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the funnel order",
          why: "Biggest cohort first, per the memo — DESC. ASC would ship the board upside down and the deck would open on the 2-match appendix instead of EU's 45.",
        },
      ],
      distractors: ["created_at", "status", "city", "product_id", "37", "ASC"],
      walkthrough:
        "Two tables, one grain, one gate. The join attaches each match to its member's cohort, GROUP BY region folds the four markets, COUNT(o.shipped_at) counts stamped matches only (NULL stamps drop out of a column COUNT — 45/36/2.94, 37/29/2.93, 19/15/3.07), and the HAVING floor at 19 keeps EU, APAC and US while LATAM's 2 falls to the appendix. The AVG leg is pinned to julianday(shipped_at) - julianday(created_at) so the lag column stays honest regardless of the count slot. created_at in the count slot prints 45/37/19 — a 100% funnel that erases the 21 unstamped matches; status and city don't exist on the right side and error; product_id errors. 37 in the gate trims US, and ASC inverts the read — the deck opens on LATAM, the exact cohort the floor exists to exclude.",
    },
    {
      id: "cs-bumble-2",
      tier: "easy",
      topic: "s6",
      universe: "growth",
      title: "The response-window board",
      brief:
        "Window-mechanics memo: the response board ships per market cohort over first-moved matches only — how many openers fired inside the 48-hour lane, how many landed in the slow lane. The db mapping is declared: orders are matches, shipped_at is the first-move stamp, and the probed clock runs **2–4 days** (82 stamped of 103; average 2.98). Probed regional folds: **EU 36 stamped / 12 inside 48h / 10 slow**, **APAC 29 / 11 / 9**, US 15 / 4 / 5. The memo fixes the inside-lane line at **<= 2 days** and a deck floor of **29 stamped matches** — cohorts below the floor stay in the appendix. Deterministic read order: biggest stamped cohort first.",
      ask: "Return each market cohort clearing the 29-stamped floor with its first-moved count, inside-48h count and slow-lane count, biggest cohort first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS first_moved,\n       SUM(CASE WHEN JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at) <= {1} THEN 1 ELSE 0 END) AS inside_48h,\n       SUM(CASE WHEN JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at) >= 4 THEN 1 ELSE 0 END) AS slow_lane\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at {2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY first_moved {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the inside-lane line",
          why: "The memo fixes inside-48h at <= 2 days on the probed 2–4 day clock. 3 would swallow the mid-lane openers and read 26/20 — the board would certify a fast cohort the clock doesn't support; the line is a definition, stated in the memo.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the stamped filter",
          why: "The board reads first-moved matches only: WHERE shipped_at IS NOT NULL keeps the 82 stamped rows. IS NULL would flip to the 21 unstamped matches — the unopened-plus-expired tail, the exact population this board exists to exclude.",
        },
        {
          answer: "29",
          kind: "number",
          label: "the deck floor",
          why: "The memo fixes the floor at 29 stamped matches — exactly the APAC cohort's count, so the gate keeps EU and APAC and drops US (15) and LATAM (2). 15 would wave US through; 37 keeps EU only.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the board order",
          why: "Biggest stamped cohort first, per the memo — DESC. ASC would open the board on APAC's 29 and bury EU's 36 under it, inverting the read the review argues from.",
        },
      ],
      distractors: ["3", "1", "IS NULL", "'sent'", "15", "37"],
      walkthrough:
        "One scan, two bands, one population. The WHERE arm keeps only the 82 stamped matches, the join attaches each to its cohort, and the two SUM(CASE …) arms band every opener by the probed clock: EU reads 36 stamped | 12 inside 48h | 10 slow, APAC 29 | 11 | 9, with US 15 | 4 | 5 and LATAM 2 | 0 | 1 below the floor. The HAVING gate at 29 keeps exactly EU and APAC. The threshold slot is a definition — 3 collapses the lane to 26/20 and overstates speed, 1 empties it — which is why it carries noVerify and the memo prints it. IS NULL flips the board to the 21 unstamped matches the window team deliberately excluded; 'sent' is billing vocabulary that satisfies nothing; 15 admits US to a deck it was floored out of; 37 drops APAC; ASC inverts the order. Every branch still reconciles: inside + mid + slow = stamped, per cohort, by construction.",
    },
  ],

  problems: [
    { slug: "find-golden-hour-customers", why: "The opener right after the match — golden-hour messaging is the reply-rate lever Bumble's messaging team A/Bs first; this drill is the match-to-first-message join." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two events inside a 7-day window — the reply-window scan: which matches produced a message back fast enough to call a conversation." },
    { slug: "second-day-verification", why: "Second-day follow-through — the D2 read for new matches: did the conversation survive past the opener, LEAD over the pair's own timeline." },
    { slug: "median-time-to-convert", why: "Median time-to-convert — the match-to-first-move clock with an honest median, the latency stat the window team quotes instead of a fragile average." },
    { slug: "email-engagement-funnel", why: "Step-by-step funnel conversion — swipe to match to message to reply, the funnel grammar the growth team's weekly deck is written in." },
    { slug: "trial-to-paid-funnel", why: "Trial-to-paid — the Premium conversion step count with honest step denominators, the funnel monetization ships monthly." },
    { slug: "analyze-subscription-conversion", why: "Subscription conversion with the LEFT JOIN NULL arm — who never upgraded, the non-payer list inside the Premium billing data." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Matched-but-never-messaged — the silent-match anti-join: presence in the queue but no first move, the window team's source list." },
    { slug: "customer-order-frequency", why: "Members active in consecutive periods — conversation stamina: who keeps matches alive week over week, not just once." },
    { slug: "cohort-retention-matrix", why: "The cohort retention matrix — which join month keeps its conversationalists, the board the replied share feeds." },
    { slug: "winback-recovery", why: "Winback recovery — lapsed members who re-engaged inside the winback window, the re-match campaign's evidence read." },
    { slug: "snaps-analysis", why: "The one-pass event census — conditional COUNT DISTINCT over opener kinds, the grammar the conversation-mix board is written in." },
    { slug: "weather-type-in-each-country", why: "CASE boards per geography — the response-window bands per market cohort, one row per cohort, one branch per band." },
    { slug: "list-the-products-ordered-in-a-period", why: "Prompt packs used in a period — the content-mix read the prompt-partner review opens with." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each member's favorite feature — argmax per member over Boost, Spotlight and SuperSwipe usage, deduped honestly." },
    { slug: "bank-account-summary-ii", why: "Billing reconciliation — credits and debits folded per account, the Premium ledger roll-up finance closes the month with." },
  ],
};
