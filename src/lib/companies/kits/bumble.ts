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
    "Preparation strategy: Bumble has **no tagged registry problems**, so this kit theme-curates all sixteen — golden-hour openers, reply-window pair scans, the Premium trial funnel and the matched-but-never-messaged anti-joins. Then run all six case studies on the live storefront db: one rebuilds the {violet:cohort first-move funnel} (a join-and-fold with a HAVING gate — EU, APAC and US survive the floor, LATAM does not), the other rebuilds the {emerald:response-window board} (CASE bands over the 82 stamped matches — inside 48 hours vs the slow lane), with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The storefront mapping is declared, not hidden — orders are matches, totals are engagement units, regions are market cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
    // --- 3x expansion (Task 95): brief paras 5-6, dayInLife beat 4, metrics 9-12, topics 11-15,
    // theory t9-t24, mcqs 11-30, cases cs-bumble-3..6, problems 17-32 — appended below; every
    // pre-existing entry stays byte-identical. Same facts source, same pool provenance (theme-curated).
    "Growth's KPI wall is where the screens turn definitional. The {violet:match rate} is a denominator argument before it is a number — matches over swipe sessions, not over members, or the 24-match whale distorts every cohort read — and the {emerald:first-message send rate within 24h} only means anything beside its stamped denominator: **82 of 103 matches** carry a first-move stamp on the audit clock (2.98-day average, 2–4 range), so the live product's 24-hour ruler and the snapshot's coarse clock ship as two labeled instruments, never one. Session health is a set ratio, not an event ratio — {sky:DAU/WAU stickiness} divides distinct daily actives by distinct weekly actives, and summing swipes instead inflates it with the heavy end. The written screens love the moves that defend these definitions: UNION ALL stacks for the billing rails, EXCEPT and INTERSECT for set-membership probes, the Nth-rank question that must print NULL when the podium is short, and the ledger tie — **181,080 = 181,080** — that gates every close.",
    "Preparation strategy, part two: the four expansion cases run the reads this kit adds. The {emerald:engagement leaderboard} rebuilds a RANK() window with a top-5 cut (Alice Chen's 7,262.35 leads the 34,833.28 book); the {violet:premium line} compares each cohort's average engagement against the market's 338.19 through a scalar subquery — LATAM 426.22 and US 383.48 clear it while EU's 335.32 and APAC's 313.66 sit under; the {rose:unpaid chase list} is a double LEFT JOIN anti-join over Premium & Boost billing — 6 invoices, 15,217.00 with no payment leg at all, ghost #28 among them; and the {sky:one-pass census} folds all four conversation outcomes with FILTER arms — 52 replied, 30 unanswered, 14 unopened, 7 expired, reconciling to 103 before anyone argues. Then the instincts the follow-ups probe: keep predicates sargable (`SUBSTR(created_at,1,7)` reads nicely and murders the index), never coalesce a missing stamp into a measurement, and state the denominator before the number — *the same discipline, one layer deeper.*",
  ],

  dayInLife: [
    "**08:20 —** The overnight conversation-health board. The analyst opens telemetry's morning reads: matches per cohort, the {emerald:replied share} (52 of 103 on the audit window), and the number that gates the day — the {rose:expired-window queue}: which matches hit the end of their first-move window untouched, and whether the July-style cool-off (**$1,193.86** month, 2 cancels) is repeating. The first query is a LAG walk over each member's match partitions, gaps in julianday days, NULL on each member's first match kept and labeled. A spike in expiries without a reply-rate lift is the day's first fire, and the analyst who can split NEW expirers from CHRONIC ones — before the product lead pings — owns the morning.",
    "**11:30 —** First-move deep work. Growth wants the cohort funnel rebuilt: join matches to members, fold per market, gate above the volume floor. The board reads EU **45 matches / 36 first moves / 2.94-day** average opener lag, APAC **37 / 29 / 2.93**, US **19 / 15 / 3.07** — LATAM's 2 matches ride below every floor and stay in the appendix. Each ask is a fold, a gate and an argument about grain — batches versus events, matches versus members. *A funnel without its population is just a bar chart of vibes.*",
    "**15:30 —** Prompt-partner and Premium cycles. The partner review: prompt packs ranked by reply lift, the {sky:first-move lag} read (**82 of 103 stamped, 2.98-day average, 2–4 range** — the unstamped 21 are unopened-plus-expired, reported as a state), and the billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned) with the {amber:split-payment} register (5 invoices, one partial at **4,000 of 6,148** cents) flagged for finance. The afternoon's job is closing loops: yesterday's funnel becomes next sprint's window experiment, and every number that leaves the desk carries its denominator with it — the EOD note pins the SQL beside the figures it produced, because growth re-runs these blind.",
    "**18:45 —** The close-out memo. The analyst pins the day's three reconciliations at the top: the census identity (**52 + 30 + 14 + 7 = 103**, every arm cut from one population), the chase list (**6 invoices / 15,217.00** with no payment leg at all, ghost #28 flagged for finance), and the ledger tie (**181,080 = 181,080**) that says the books balanced before anyone argued about funnels. Below them, tomorrow's experiment brief: the {violet:window-copy test} for the cohort whose opener lag drifted, and the {emerald:stickiness cut} that decides whether Boost spend buys new sessions or re-bills old ones. The note ships with its SQL attached, because a number without its denominator is a rumor with a decimal point.",
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
    { name: "First-message send rate (24h)", what: "Share of matches where the opener fires inside the first-move window. On the audit clock the stamps run 2–4 days (82 of 103 stamped, 2.98 average), so the 24-hour rate is a live-product definition — reported beside its stamped denominator, never against the coarser snapshot." },
    { name: "Session stickiness (DAU/WAU)", what: "Weekly actives who showed up daily, as a ratio of distinct-member sets — not swipes over swipes. The habit read that decides whether Boost impressions buy new sessions or just re-bill existing ones." },
    { name: "Unpaid chase queue", what: "Invoices with no payment leg at all: 6 outstanding at 15,217.00, including the paid-status ghost #28 (1,756.00). The AR list finance works every close, anti-join first." },
    { name: "Ledger tie gate", what: "Debits vs credits at close: 181,080 = 181,080, or the deck doesn't ship. The census identity (52+30+14+7 = 103) is its telemetry-side twin — populations reconcile before opinions publish." },
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
      slugs: ["email-engagement-funnel", "ads-funnel", "median-time-to-convert", "trial-to-paid-funnel", "analyze-subscription-conversion"],
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
      slugs: ["customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "number-of-accounts-that-did-not-stream", "transactions-per-visit-histogram"],
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
    {
      name: "Swipe-session stickiness",
      why: "Session stickiness is a set ratio — distinct daily actives over distinct weekly actives — and Bumble's growth wall reads it per market cohort, because a sticky cohort converts Boost impressions into sessions while a lurky one just re-bills. The trio drills the trailing-window fold, the rolling distinct count and the consecutive-day streak scan the habit boards are cut from.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "active-users", "friend-requests-ii-who-has-the-most-friends"],
    },
    {
      name: "Acceptance & reply rates",
      why: "Like-to-match and opener-to-reply are rate reads with denominator traps: a member with zero openers must print a clean 0.00, not a division error and not a NULL that leaks into the average. The trio drills the overall acceptance rate, the per-member confirmation rate and the answer-rate argmax the reply boards ship.",
      slugs: ["friend-requests-i-overall-acceptance-rate", "confirmation-rate", "get-highest-answer-rate-question"],
    },
    {
      name: "Rank ladders & Nth probes",
      why: "Leaderboards and Nth-ranked probes are where tie policy gets honest — RANK, DENSE_RANK or ROW_NUMBER, and what prints when the podium is short. The trio drills the gap-ranking board, the per-cohort argmax and the second-place read that must return NULL, not zero, when only one member qualifies.",
      slugs: ["second-highest-salary", "department-highest-salary", "rank-scores", "number-of-comments-per-post"],
    },
    {
      name: "Running totals & rolling windows",
      why: "Engagement accrues and smooths: running totals over ordered partitions, 7-day rolling averages that survive a single SuperSwipe spike. The trio drills the cumulative fold, the moving-frame average and the running-sum roll-up the trend boards reuse — with the RANGE-vs-ROWS tie behavior waiting in the follow-ups.",
      slugs: ["running-total-for-different-genders", "restaurant-growth", "game-play-analysis-iii"],
    },
    {
      name: "Trust, safety & log hygiene",
      why: "The match log ships only after a hygiene pass: NULL and blank sweeps, retry dedupe, and the daily removal-rate read trust & safety lives in. The trio drills the quality audit, the keep-latest dedupe and the per-day rate fold that flags abuse without inventing denominators.",
      slugs: ["reported-posts-ii", "null-blank-audit", "keep-latest-dedupe"],
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
    {
      id: "bumble-t9",
      q: "An analyst filters a cohort query with WHERE matches > 19 where matches is the SELECT-list alias for COUNT(*). Why does that fail, and where do aliases become visible?",
      a: "WHERE runs before SELECT in the logical pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT — so the alias doesn't exist yet when the filter evaluates, and the engine errors on the unknown name. Aliases are born at SELECT time: visible to ORDER BY always, and to GROUP BY and HAVING in SQLite's courtesy extension, but never to WHERE. The fix is honest repetition — filter on the bare aggregate HAVING COUNT(*) > 19 — or a CTE that materializes the alias first, then filters outside. The follow-up is always the same: so where do window functions run? At SELECT time, after HAVING — which is why a window inside WHERE is a hard error and a filtered rank needs the CTE dance. Candidates who can recite the pipeline under pressure write funnel SQL that survives review; candidates who can't ship queries that work only until someone reorders the SELECT list.",
      tag: "pipeline",
    },
    {
      id: "bumble-t10",
      q: "Three counts walk into a census: COUNT(*), COUNT(shipped_at), COUNT(DISTINCT customer_id). What does each print over the match log, and when is each the right tool?",
      a: "COUNT(*) counts rows — 103 matches, no exceptions, the population count. COUNT(shipped_at) skips NULLs — 82 first-moved matches — which makes it the funnel's second stage for free, and the identity COUNT(*) - COUNT(shipped_at) = 21 is the unopened-plus-expired tail without a second scan. COUNT(DISTINCT customer_id) collapses the fan-out to 16 members — the read you want when the question is reach, not volume. The traps are symmetrical: COUNT(*) on a joined log counts the many side (251 batches wearing match clothing), and COUNT(column) on a nullable column silently shrinks the denominator — a feature in the funnel, a bug in a rate. The house rule is that every count ships with its grain spelled out — rows, stamped rows, or members — because 'count' alone is where denominators go to die, and the census board prints all three side by side precisely so nobody has to guess.",
      tag: "aggregation",
    },
    {
      id: "bumble-t11",
      q: "Same predicate, two homes: amount_cents > 50000 in the ON clause of a LEFT JOIN versus in the WHERE. Are they the same query?",
      a: "For an INNER JOIN, yes — the optimizer folds both into one filter plan and the rows agree. For a LEFT JOIN they are different queries, and the difference is the bug. The predicate in ON: every member row survives, only the qualifying invoices attach, the rest show NULL columns — a left-plus-matching shape that preserves the population. The predicate in WHERE: NULL invoice columns fail the comparison, those rows are discarded, and the LEFT JOIN has silently become an INNER JOIN — the members you meant to keep are gone without an error. The billing chase list depends on ON placement; the paid-only read depends on WHERE. The senior tell is stating which shape you're building before writing the join — *placement is semantics in outer joins, and the interviewer knows it* — then proving it by running both and naming who dropped.",
      tag: "joins",
    },
    {
      id: "bumble-t12",
      q: "A running engagement total uses SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at) with no frame clause. Same-timestamp matches exist. What does the default frame do at ties, and how do ROWS and RANGE differ?",
      a: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY ties as one peer group: every same-timestamp match's total jumps into the running sum at once, so each tied row shows the full day's total — right for 'engagement so far today', wrong for row-by-row accumulation. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts physical rows: tied rows split the day's total across the tie in scan order. Neither is correct in the abstract — they answer different questions, and the memo picks. The follow-up trap is the empty frame: ORDER BY inside OVER with no frame clause is not 'no frame', it's the RANGE default, and the tie behavior only shows on busy days. At Bumble the habit is naming the frame beside the metric — running totals and peer-group totals look identical on sparse data and diverge exactly on the match-heavy days the deck zooms into.",
      tag: "windows",
    },
    {
      id: "bumble-t13",
      q: "The category board ranks spend where two prompt packs tie. Walk RANK versus DENSE_RANK versus ROW_NUMBER — and which one does a top-3 cut actually want?",
      a: "ROW_NUMBER breaks ties arbitrarily — 1, 2, 3, 4 — deterministic only if you add an explicit tie-breaker to the ORDER BY. RANK gives ties the same rank and skips — 1, 1, 3, 4 — preserving the 'how many strictly beat me' semantics. DENSE_RANK gives ties the same rank and packs — 1, 1, 2, 3 — preserving 'how many tiers sit above me'. A top-3 cut is the policy question: with RANK, a two-way tie at the top admits four rows into a three-slot deck; with ROW_NUMBER it silently drops one tied row, and someone's tie becomes someone's lost visibility. The honest pattern is RANK for competitive boards with the tie handled in the memo, DENSE_RANK for tier ladders, ROW_NUMBER only with a deterministic tie-breaker named. On this db the expense fold hands you the live case — two categories tie at 14 entries and the board prints 1, 1, 3 under RANK; the gap is the story, not a bug.",
      tag: "windows",
    },
    {
      id: "bumble-t14",
      q: "A scalar subquery sits in the SELECT list: (SELECT AVG(total) FROM orders) AS market_avg. When does it run, and what does it return if the inner query matches no rows?",
      a: "An uncorrelated scalar runs once for the whole query; a correlated one runs per outer row — and that cost story is what the interviewer is really asking about. When the inner query returns no rows, the scalar returns NULL: not zero, not an error, not an empty cell. That NULL is a live grenade — a comparison or HAVING against it is never true, so the downstream filter empties silently. The defensive pattern is wrapping at the display edge with COALESCE only when zero is the honest value, and asserting row-existence when it isn't. The premium-line read uses exactly this shape: the market average computes once over the 103-match population, prints in every surviving row so the board can see the margin, and the per-cohort HAVING does the gating. Candidates who can say 'once, and NULL when empty' — and then say what that NULL does downstream — pass this screen; the ones who guess 'it errors' haven't shipped real reports.",
      tag: "subqueries",
    },
    {
      id: "bumble-t15",
      q: "NOT IN versus NOT EXISTS for 'members with no payment leg'. When does NOT IN lie to you?",
      a: "NOT IN lies the moment the subquery yields a NULL: x NOT IN (1, 2, NULL) can never be true, because x = NULL is unknown and NOT unknown is still unknown — the result set empties silently, and the chase list ships blank. One nullable column in the inner table and the anti-join is dead. NOT EXISTS doesn't evaluate membership, it probes for a row — NULLs are irrelevant — and it short-circuits at the first hit, which is why it's the house default for anti-joins, with LEFT JOIN … WHERE right.key IS NULL as the readable twin. The discipline is two questions: before trusting a NOT IN, what do the inner column's NULLs do; before trusting a NOT EXISTS, is the correlation on the right key. The unpaid-invoice read survives on exactly this decision — the day payments' invoice_id goes nullable, every NOT IN version of the chase list starts returning nothing, and nobody gets an error to debug.",
      tag: "subqueries",
    },
    {
      id: "bumble-t16",
      q: "UNION versus UNION ALL on a stacked report: what does UNION cost you, and when are INTERSECT or EXCEPT the right arms?",
      a: "UNION dedupes across arms — an implicit DISTINCT over the combined rows — which costs a sort and, more expensively, silently collapses two arms that happen to print identical rows. A billing stack that unions card and wire rails is safe only while the label columns differ; the day both rails print the same (count, cents) pair, one row vanishes and the register undercounts without an error. UNION ALL appends honestly and is the default — dedupe deliberately, never incidentally. INTERSECT and EXCEPT are set operators too: they dedupe their inputs, they're asymmetric (A EXCEPT B is not B EXCEPT A — swap the operands and you've answered the opposite question), and NULLs compare as equal inside them, the one place SQL treats two NULLs as the same. At Bumble the stacks — rail stacks, census arms, cohort-vs-cohort probes — ship UNION ALL with a literal label column per arm, because the label is what makes the fold auditable.",
      tag: "setops",
    },
    {
      id: "bumble-t17",
      q: "julianday('2025-03-01') - julianday('2025-02-27') — walk the mechanics, and why not just subtract day-of-month?",
      a: "JULIANDAY converts the timestamp to a fractional day count — a real number — so the difference is elapsed days with time-of-day carried in the fraction: 2.0 across that month boundary. Naive day-of-month arithmetic reads 1 - 27 = -26 and ships a negative lag; string comparison happens to work on ISO-8601 (lexical order is chronological order) but breaks the moment the format drifts or you need arithmetic. The pairing reads on this kit ride julianday: the match-to-opener lag (2.98-day average, 2–4 range over the 82 stamped matches), and the log's bookend — last order 2025-02-27, last ship 2025-03-01 — is a 2.0-day gap that date-part subtraction would have mangled. The follow-ups write themselves: fractional vs whole days (BETWEEN 0 AND 7 includes same-day), and rounding only at the display edge. Date math is where off-by-ones hide, so the expression ships with its definition or it doesn't ship.",
      tag: "dates",
    },
    {
      id: "bumble-t18",
      q: "The monthly trend shows February 2025 at 7 matches against February 2024's 9. What has to be checked before that becomes a decline slide?",
      a: "Whether the two buckets span the same clock. The log runs through 2025-02-27 — February 2025 is a partial month, days short of its sibling, and a 7-vs-9 read is a truncated month losing to a full one. The like-for-like fix is truncating the comparison window to the newer bucket's span (both Februaries through the 27th) or stating the missing days beside the delta. The general lesson outruns months: any trailing bucket in a trend is partial until its end date is verified, and dashboards lie loudest at the right edge — the same discipline catches the inverse, a 'hot' current week that's really one big day. At Bumble the trend decks print the bucket end beside every bucket — SUBSTR(created_at,1,7) for the fold, MAX(created_at) for the watermark — and 'partial' is a label the deck carries, not a caveat someone remembers after the slide ships. Trend reads are comparisons; comparisons need equal clocks.",
      tag: "dates",
    },
    {
      id: "bumble-t19",
      q: "status <> 'cancelled' and NOT (status = 'cancelled') — same filter? And what's the policy for the unstamped matches?",
      a: "On this log they agree, because status is NOT NULL — 52 delivered, 30 shipped, 14 pending, 7 cancelled over 103 rows, no unknowns; the cancelled filter drops exactly 7 and keeps 96. But the habit matters for the columns that aren't so clean: a three-valued comparison against NULL yields unknown, unknown is filtered out by both WHERE arms, and rows vanish without an error. The unstamped matches are the case study: shipped_at IS NULL is the 21-row unopened-plus-expired tail, a state to report — shipped_at <> '2025-01-01' would silently exclude them, and COALESCE(shipped_at, created_at) would fabricate zero-day openers. The policy: IS NULL / IS NOT NULL for state reads, explicit COALESCE only when the fallback is a real definition, and a census that reconciles to the population (52+30+14+7 = 103) before it publishes. *NULL handling here is a stated policy, not a per-query improvisation.*",
      tag: "nulls",
    },
    {
      id: "bumble-t20",
      q: "What does 'the books tie' mean in this kit's SQL terms, and why do we gate publication on it?",
      a: "Two identities, checked before anyone argues: the ledger's SUM(debits) = SUM(credits) — 181,080 = 181,080 on this db — and the telemetry census summing to its population, 52 + 30 + 14 + 7 = 103. If either drifts, the funnel numbers are secondary, because a population that doesn't reconcile means the fold lost rows somewhere: a filter drifted, a join fanned, an arm merged into a NULL ELSE. The gate is cheap — one conditional aggregate per bank — and it catches the failure class dashboards hide, where every individual read looks plausible and the whole is short seven rows. The senior habit is printing the reconciliation beside the read, not running it once in a backlog job: the memo shows the identity, then the insight. When a stakeholder challenges a number, the analyst who answers with the reconciliation wins the room; the one who answers with a re-run buys another meeting.",
      tag: "quality",
    },
    {
      id: "bumble-t21",
      q: "Define Bumble's match rate the way you'd defend it in a review. What's the denominator, and what breaks if you pick the wrong one?",
      a: "Match rate is matches over swipe sessions — sessions, not members and not raw swipes. Sessions normalize exposure: a member who swipes 400 times in one sitting and one who swipes 20 across a week deserve equal footing per unit of activity, and per-member rates collapse the whale into the average (the log's top member carries 24 matches against a 16-member population — a 6.44 mean nobody believes). Per-swipe rates swing on like-order effects and punish the browsy end of the funnel. The session denominator also composes: stickiness, send rate and reply rate all hang off the same session spine, so one definition feeds three boards without three arguments. The failure mode is real, not theoretical: pick the member denominator and cohort comparisons invert whenever activity skews — you'd 'fix' a healthy cohort or fund a dead one. Every rate ships as rate over stated denominator, or it's a vibe with a decimal point.",
      tag: "kpis",
    },
    {
      id: "bumble-t22",
      q: "The board wants 'first-message send rate within 24 hours.' What's the definition, and what does this snapshot's clock do to it?",
      a: "The live definition: of matches made in a window, the share where the opener fired within 24 hours — stamped matches over matches, with the clock named. The audit snapshot can't print it honestly: its first-move stamps run 2–4 days (82 of 103 stamped, 2.98-day average, minimum 2), so a strict 24-hour cut returns zero — a true statement about the snapshot's coarser clock and a lie about the product. The policy is to report the probed lag as probed (2.98-day average beside its 82-match denominator) and hold the 24-hour cut for the live feed, labeling which clock each number rode. The unstamped 21 are never folded in as instant openers — they're the unopened-plus-expired states, and folding them into the denominator without the stamp count is how a send rate quietly becomes a match rate. Definitions are the deliverable; the number is just the definition evaluated.",
      tag: "kpis",
    },
    {
      id: "bumble-t23",
      q: "What is DAU/WAU stickiness, why is it a ratio of sets and not of events, and where does the trailing window trip teams up?",
      a: "Stickiness is the share of weekly actives who also showed up daily — COUNT(DISTINCT daily actives) averaged over COUNT(DISTINCT weekly actives). It's a ratio of sets because the question is about people: sum swipes over sum swipes and the heavy swipers — the ones the Boost shelf monetizes — inflate the number without anyone new forming a habit. The trailing-window trap is overlap: a 7-day window slides, so one super-user appears in multiple daily buckets while the weekly denominator shifts as it slides; comparing a rolling week against a calendar week mixes populations and the trend lies. The honest build fixes the weekly set first, then reads daily membership inside it — the drill is exactly the DAU/WAU stickiness problem. At Bumble the metric gates the Boost story: impressions convert better into sticky sessions than into one-off swipes, and an event-ratioed stickiness line will claim the shelf works a week after it stopped.",
      tag: "kpis",
    },
    {
      id: "bumble-t24",
      q: "The month fold runs SUBSTR(created_at, 1, 7) = '2025-01'. What does that do at scale, and what's the index-friendly rewrite?",
      a: "The function wraps the column, so any index on created_at can't be used — the engine evaluates SUBSTR row by row, a full scan dressed as a filter. The sargable rewrite keeps the column bare: created_at >= '2025-01-01' AND created_at < '2025-02-01' — a range predicate the index seeks directly. Same rows, same January fold on this db, wildly different plans at scale. The instinct generalizes: UPPER(name) = 'ALICE' and julianday(created_at) - julianday(x) < 7 are each functions on the column killing the seek, and each has a range or generated-column rewrite. On a 103-row snapshot the difference is invisible, which is exactly why interviewers ask — they want the candidate who writes for the table it becomes, not the table it is. The house pattern: bare columns in predicates, functions at the display edge, EXPLAIN when the board slows — not after the review escalates it.",
      tag: "performance",
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
    {
      id: "bumble-mcq-11",
      prompt: "A cohort query filters with WHERE matches > 19 where matches is the SELECT alias for COUNT(*). What happens?",
      choices: [
        "Error — the alias doesn't exist yet when WHERE evaluates",
        "All rows pass — the alias is ignored",
        "Zero rows — the comparison reads NULL",
        "It works — aliases are visible to every clause",
      ],
      answer: 0,
      why: "WHERE runs before SELECT in the logical pipeline, so the SELECT-list alias isn't born yet — the engine errors on the unknown name. The gate belongs in HAVING (after the fold) or on the bare aggregate.",
      notes: [
        { choice: 1, why: "Unknown names are a hard error, not a permissive pass — the failure is loud, which is the honest kind." },
        { choice: 3, why: "SQLite allows aliases in GROUP BY/HAVING/ORDER BY as a courtesy — never in WHERE, the one clause that runs before SELECT." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-12",
      prompt: "The funnel's second stage counts first moves over the 103-row match log with COUNT(o.shipped_at). What prints?",
      choices: [
        "103 — column COUNT counts rows too",
        "82 — NULL stamps drop out of a column COUNT",
        "21 — column COUNT counts the NULLs",
        "NULL — the column contains NULLs",
      ],
      answer: 1,
      why: "COUNT(column) skips NULLs: 82 stamped matches, with COUNT(*) − COUNT(shipped_at) = 21 as the unopened-plus-expired tail for free, no second scan.",
      notes: [
        { choice: 0, why: "That's COUNT(*) — 103 is the population, not the stamped count the funnel stage needs." },
        { choice: 2, why: "21 is the complement — exactly what COUNT(*) − COUNT(shipped_at) returns, not what a column COUNT prints." },
      ],
      difficulty: "easy",
    },
    {
      id: "bumble-mcq-13",
      prompt: "The staging copy of payments loaded three legs with invoice_id = NULL. SELECT ... FROM invoices WHERE id NOT IN (SELECT invoice_id FROM payments) now returns…",
      choices: [
        "All invoices without a payment leg — same as before",
        "Nothing — one NULL in the NOT IN list makes every comparison unknown",
        "Only the 6 unpaid invoices",
        "An error — NULLs are illegal inside NOT IN",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: each x = NULL test is unknown, NOT unknown is still unknown, and WHERE keeps only TRUE — the anti-join silently empties. NOT EXISTS or a NULL-guarded inner query is the fix.",
      notes: [
        { choice: 0, why: "That's the pre-corruption answer — the NULL legs are precisely what kills NOT IN, and the failure ships silent." },
        { choice: 2, why: "6 is the clean-db unpaid count; with a NULL in the list even those rows fail the membership test." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-14",
      prompt: "A settlement stack arms card and wire per-day counts with UNION (not UNION ALL). Both rails happen to print an identical (day, count) row once. What ships?",
      choices: [
        "Both rows — UNION keeps duplicates",
        "One row — UNION dedupes across arms and the register undercounts",
        "An error — UNION needs identical column aliases",
        "The card row only — UNION keeps the first arm's copy",
      ],
      answer: 1,
      why: "UNION applies an implicit DISTINCT over the combined result: two identical rows from different arms collapse to one, and the stack undercounts silently. UNION ALL appends honestly — the label column is what makes the fold auditable.",
      notes: [
        { choice: 0, why: "That's UNION ALL's contract — plain UNION dedupes, and that dedupe is its entire difference." },
        { choice: 2, why: "UNION needs matching column counts and compatible types, not identical aliases — it runs fine and lies quietly." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-15",
      prompt: "The category fold reads Rent 14, Ads 14, Tools 5, Travel 3. Which window function prints ranks 1, 1, 2, 3?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY n DESC)",
        "RANK() OVER (ORDER BY n DESC)",
        "DENSE_RANK() OVER (ORDER BY n DESC)",
        "COUNT(*) OVER (ORDER BY n DESC)",
      ],
      answer: 2,
      why: "DENSE_RANK gives ties the same rank and packs the next — 1, 1, 2, 3. RANK skips after a tie (1, 1, 3, 4); ROW_NUMBER breaks ties arbitrarily (1, 2, 3, 4).",
      notes: [
        { choice: 1, why: "RANK is 1, 1, 3, 4 — the gap after the tie is its signature; the question asked for packed ranks." },
        { choice: 0, why: "ROW_NUMBER needs a deterministic tie-breaker or it splits the tie by scan order — never 1, 1." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-16",
      prompt: "SELECT (SELECT MAX(total) FROM orders WHERE status = 'returned') AS probe runs against the match log. What does probe print?",
      choices: [
        "0",
        "NULL — an empty scalar subquery yields NULL, not zero and not an error",
        "An error — 'returned' is not a real status",
        "The maximum over all statuses",
      ],
      answer: 1,
      why: "'returned' matches none of the four real statuses (delivered/shipped/pending/cancelled), so the inner query returns no rows — and a scalar subquery over an empty set is NULL. Any downstream comparison against it silently filters everything.",
      notes: [
        { choice: 0, why: "Zero is the COALESCE'd display value someone might bolt on — the raw scalar is NULL, and that difference is the trap." },
        { choice: 2, why: "A status value that matches nothing is a data condition, not a syntax error — the query runs and prints NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-17",
      prompt: "Members LEFT JOIN invoices. The predicate i.amount_cents > 50000 goes in the WHERE instead of the ON. What happens to members whose only invoices are small?",
      choices: [
        "They stay with NULL invoice columns — placement doesn't matter",
        "They vanish — the WHERE fails on NULLs and the LEFT JOIN silently became an INNER JOIN",
        "They appear twice — the predicate doubles the match",
        "A syntax error — outer joins can't take predicates",
      ],
      answer: 1,
      why: "For a LEFT JOIN, ON-placement keeps every left row and attaches only qualifying partners; WHERE-placement discards rows where the NULL columns fail the predicate — converting the outer join to an inner one without an error. Population lost, query green.",
      notes: [
        { choice: 0, why: "ON-placement does exactly that — which is why the two homes are different queries for LEFT JOINs and identical only for INNER." },
        { choice: 2, why: "Nothing doubles — fan-out comes from one-to-many keys, not predicate placement." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-18",
      prompt: "The log's last order is 2025-02-27 and its last first-move stamp is 2025-03-01. julianday('2025-03-01') − julianday('2025-02-27') prints…",
      choices: [
        "−26 — the day-of-month subtraction",
        "2.0 — julianday is a day count, month boundaries included",
        "74 — days since January 1",
        "An error — you can't subtract across months",
      ],
      answer: 1,
      why: "JULIANDAY converts timestamps to fractional day counts, so the difference is elapsed days with month rollover handled: 2.0. Day-of-month arithmetic reads 1 − 27 and ships a negative lag.",
      notes: [
        { choice: 0, why: "That's naive date-part subtraction — exactly the bug julianday exists to prevent." },
        { choice: 2, why: "That's a different window entirely — the expression measures the two timestamps it was given." },
      ],
      difficulty: "easy",
    },
    {
      id: "bumble-mcq-19",
      prompt: "February 2025 folds to 7 matches against February 2024's 9. Before the decline slide ships, the analyst must check…",
      choices: [
        "That 2025-02 is partial — the log ends 2025-02-27, so the buckets span different clocks",
        "Nothing — same month label, same length, fair fight",
        "That AVG(total) was used instead of SUM",
        "That the fold used SUBSTR(created_at, 6, 2)",
      ],
      answer: 0,
      why: "The log runs through 2025-02-27 — the newer bucket is a truncated month losing to a full one. Like-for-like means truncating both spans or stating the watermark; trailing buckets are partial until their end date is verified.",
      notes: [
        { choice: 1, why: "Same label, different spans — the right edge of every trend is where it lies until checked." },
        { choice: 2, why: "The aggregate choice doesn't change the population — the clock mismatch is the story." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-20",
      prompt: "Chasing the unstamped tail: WHERE shipped_at = NULL returns how many of the 103 matches?",
      choices: [
        "21 — the unopened-plus-expired matches",
        "0 — NULL comparisons are unknown; the read needs IS NULL",
        "82 — the stamped complement",
        "103 — the filter is ignored",
      ],
      answer: 1,
      why: "= NULL evaluates to unknown for every row, and WHERE keeps only TRUE — the tail needs shipped_at IS NULL, which returns the 21 unopened-plus-expired matches.",
      notes: [
        { choice: 0, why: "21 is the IS NULL count — the equality form is the classic silent zero." },
        { choice: 2, why: "82 is IS NOT NULL's count — the opposite arm, same comparison disease." },
      ],
      difficulty: "easy",
    },
    {
      id: "bumble-mcq-21",
      prompt: "A running engagement total uses SUM(o.total) OVER (PARTITION BY customer_id ORDER BY created_at) — no frame clause. On a member's two same-timestamp matches, the running sum…",
      choices: [
        "Jumps by both totals on each tied row — the default RANGE frame treats ORDER BY ties as peers",
        "Adds one total per row — the default frame is ROWS",
        "Errors — frames are mandatory with ORDER BY",
        "Returns NULL on the second tied row",
      ],
      answer: 0,
      why: "ORDER BY with no frame clause defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes all ORDER BY ties — both rows show the full day's total. ROWS would split the day's total one row at a time.",
      notes: [
        { choice: 1, why: "ROWS is the explicit override — the default is RANGE, and the difference only shows on ties." },
        { choice: 2, why: "Frames are optional — omitting one is how the RANGE default sneaks into the board." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-22",
      prompt: "Growth computes stickiness as SUM(daily swipes) / SUM(weekly swipes) for a week where three members swiped 90% of all sessions. The read…",
      choices: [
        "Is fine — stickiness is swipe volume over swipe volume",
        "Overstates habit — stickiness is distinct daily actives over distinct weekly actives, a set ratio; heavy swipers inflate the event version",
        "Underrates habit — sets always beat events",
        "Errors — the two sums have different grains",
      ],
      answer: 1,
      why: "DAU/WAU is a ratio of distinct-member sets: of the week's actives, how many showed up daily. Event ratios monetize the whale — three heavy members move the number while nobody new forms a habit.",
      notes: [
        { choice: 0, why: "That's an engagement-intensity read — a real KPI, but not stickiness, and it moves when whales move." },
        { choice: 2, why: "Sets aren't always bigger — the point is that people, not events, define a habit." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-23",
      prompt: "The match-rate memo must fix a denominator. Which choice keeps cohorts comparable when one member carries 24 of the 103 matches?",
      choices: [
        "Matches per member — members are the population",
        "Matches per swipe session — sessions normalize exposure; the member view lets the whale distort every cohort read",
        "Matches per match — the only self-consistent base",
        "Matches per day — calendar fairness",
      ],
      answer: 1,
      why: "Sessions are the exposure unit: activity skew (a 24-match member against a 6.44 mean) is exactly what a per-member rate fails to neutralize. The session spine also feeds stickiness and send-rate reads, so one definition powers three boards.",
      notes: [
        { choice: 0, why: "Per-member collapses the whale into the average — cohorts with one heavy member invert the comparison." },
        { choice: 2, why: "Matches over matches is 1 by construction — a definition, not a rate." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-24",
      prompt: "An analyst runs the strict 24-hour first-message rate on the audit snapshot's 82 stamped matches and prints 0.0%. The stamps average 2.98 days (2–4 range). The right read…",
      choices: [
        "Ship it — zero is zero, the funnel is broken",
        "Label the clock — the snapshot's stamps are too coarse for a 24-hour cut; report the probed 2.98-day lag beside the live product's definition, never the 0.0% alone",
        "Drop the unstamped 21 from the denominator to fix it",
        "Divide by members instead — the rate will turn positive",
      ],
      answer: 1,
      why: "A true statement about the wrong clock is still a misread: the minimum stamp is 2 days, so a 24-hour cut returns zero by construction. The metric definition lives on the live feed; the snapshot reports the lag it actually has, with its stamped denominator.",
      notes: [
        { choice: 0, why: "0.0% says the snapshot's clock is coarse — publishing it as funnel truth is exactly the two-clocks-from-one-table failure." },
        { choice: 2, why: "That changes the question — the unstamped 21 are unopened-plus-expired states, not slow openers." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-25",
      prompt: "SELECT c.region, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY 1 — what does the 1 mean, and why does house style ban it?",
      choices: [
        "The first output column — it works today and breaks the moment the SELECT list reorders, so it's banned",
        "The first table's key — it fails here",
        "A literal constant — the fold returns one row",
        "The row number — same as ROW_NUMBER",
      ],
      answer: 0,
      why: "GROUP BY 1 is an ordinal reference to the first SELECT item (region, here) — legal in SQLite, invisible to readers, and silently wrong after any column reorder. House style groups by the named column; never GROUP BY an ordinal.",
      notes: [
        { choice: 1, why: "It resolves against the SELECT list, not the FROM tables — that's why the reorder hazard exists." },
        { choice: 2, why: "A constant in GROUP BY folds everything into one group — not what the ordinal does." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-26",
      prompt: "Members-with-2024-matches EXCEPT members-with-2025-matches — which claim about EXCEPT is true?",
      choices: [
        "It's symmetric — A EXCEPT B equals B EXCEPT A",
        "It dedupes both inputs and is asymmetric — 2024-only members, with NULLs comparing as equal inside the set",
        "It keeps duplicates like UNION ALL",
        "It errors when the two arms select differently named columns",
      ],
      answer: 1,
      why: "EXCEPT is a set operator: inputs dedupe, the result is rows in A not in B — order matters, A EXCEPT B ≠ B EXCEPT A — and within set semantics two NULLs compare as equal, the one place SQL does that.",
      notes: [
        { choice: 0, why: "Asymmetry is the point — swapping operands answers the opposite retention question." },
        { choice: 2, why: "That's UNION ALL's contract; EXCEPT is set semantics all the way down." },
      ],
      difficulty: "hard",
    },
    {
      id: "bumble-mcq-27",
      prompt: "SELECT SUM(amount_cents) FROM payments WHERE method = 'paypal' — the rails are card and wire only. What returns?",
      choices: [
        "0 — empty folds sum to zero",
        "One row with NULL — an empty SUM is NULL, not zero",
        "No rows — empty input means empty output",
        "An error — 'paypal' is not a method",
      ],
      answer: 1,
      why: "An aggregate over zero rows still emits one row, and SUM of nothing is NULL. The display edge wraps it — COALESCE(SUM(...), 0) — but only when zero is the honest value; NULL-vs-0 is the difference between 'no such rail' and 'a rail with no money'.",
      notes: [
        { choice: 0, why: "Zero is the coalesced shape — the raw fold is NULL, and conflating them hides 'no data' states." },
        { choice: 2, why: "Without GROUP BY, aggregates always return one row — even over empty input." },
      ],
      difficulty: "easy",
    },
    {
      id: "bumble-mcq-28",
      prompt: "The census needs the replied arm: COUNT(*) FILTER (WHERE status = 'delivered') versus SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END). On this log…",
      choices: [
        "They print the same 52 — FILTER is the readable shape and skips the ELSE ceremony",
        "FILTER counts NULLs too — it reads 103",
        "SUM(CASE) reads 82 — CASE sees the stamped rows only",
        "Only SUM(CASE) is legal outside a CTE",
      ],
      answer: 0,
      why: "Both fold the delivered arm from the same 103-row population: 52. FILTER (WHERE …) is the one-pass census grammar — no ELSE arm to miswrite — while SUM(CASE …) is the portable classic; they disagree only when a CASE loses its ELSE and the empty-arm SUM turns NULL.",
      notes: [
        { choice: 1, why: "FILTER's condition qualifies rows for the count — NULLs never enter it; 103 is the unfiltered population." },
        { choice: 2, why: "The stamped 82 is the first-moved business — the delivered fold reads 52 under either grammar." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-29",
      prompt: "WHERE COUNT(*) > 19 inside a cohort fold — what does the engine say?",
      choices: [
        "It works — WHERE sees the fold",
        "Error — aggregates aren't allowed in WHERE; the gate belongs in HAVING, which runs after the fold",
        "Silently 0 rows — the comparison is NULL",
        "Only the biggest cohort returns",
      ],
      answer: 1,
      why: "WHERE evaluates before grouping, so aggregates don't exist yet — it's a hard error. HAVING is the post-fold gate: COUNT(*) >= 19 keeps EU 45, APAC 37 and US 19 exactly on the line.",
      notes: [
        { choice: 0, why: "That's the pipeline illusion — the fold hasn't happened when WHERE runs." },
        { choice: 2, why: "Wrong failure mode — it's a loud semantic error, not a silent empty set." },
      ],
      difficulty: "medium",
    },
    {
      id: "bumble-mcq-30",
      prompt: "An analyst filters a rank inline: WHERE RANK() OVER (ORDER BY total DESC) <= 5 to cut a leaderboard. What happens, and what's the fix?",
      choices: [
        "Works — windows filter like columns",
        "Error — window functions evaluate at SELECT time, after WHERE; the fix stages the rank in a CTE or derived table, then filters rn <= 5 outside",
        "Returns 5 rows silently — SQLite permits it",
        "Returns all rows — the predicate is ignored",
      ],
      answer: 1,
      why: "Windows run after WHERE in the pipeline, so they can't appear in WHERE — a loud error, not a silent wrong. The fix is staging: a CTE (or derived table) computes the rank, the outer query filters rn <= 5 and keeps the top cut honest.",
      notes: [
        { choice: 0, why: "That's the mental-model bug — windows keep every row; filtering happens in the enclosing query." },
        { choice: 2, why: "SQLite is strict here — the error is the feature that forces the staging the pipeline implies." },
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
    {
      id: "cs-bumble-3",
      tier: "easy",
      topic: "t5",
      universe: "catalog",
      title: "The in-app store shelf ladder",
      brief:
        "Catalog memo, Wednesday: the in-app store — {violet:Boost packs}, {sky:Spotlight bundles}, SuperSwipe packs and prompt bundles — needs its price ladder for the shelf review: each SKU ranked top-down by price, the top of the shelf first. The db mapping is declared: products are the store SKUs, price is the shelf price in dollars. Probed facts: **16 SKUs on the shelf**, priced 14.99 to a **199.99** ceiling (Smart Watch S at the top; the 200+ premium band is structurally empty — mid band 8 SKUs at 111.50 average, budget band 8 at 32.06). The memo fixes the cut at the **top 8** — the shelf's featured half — and wants the rank printed beside every SKU. No ties exist in the price column, so the ladder is total.",
      ask: "Return the top 8 store SKUs with price and category, each carrying its price rank (1 = most expensive), top of the shelf first.",
      template:
        "SELECT p.name,\n       p.price,\n       p.category,\n       RANK() OVER (ORDER BY p.{1} {2}) AS shelf_rank\nFROM products p\nORDER BY shelf_rank {3}\nLIMIT {4};",
      slots: [
        {
          answer: "price",
          kind: "keyword",
          label: "the shelf measure",
          why: "The ladder ranks by price — the memo's shelf measure. stock would rank the warehouse, name would rank the alphabet, id would rank ingestion order: all three run and print a confident, wrong ladder.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the top-down order",
          why: "Rank 1 is the most expensive SKU — ORDER BY price DESC inside the window. ASC would crown the 14.99 HDMI cable king of the shelf while the 199.99 top seller sinks to rank 16.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the read order",
          why: "The board reads top-of-shelf first: rank 1, then down. DESC on the outer ORDER BY flips the board to rank 16 first — a correct query aimed at the wrong end of the shelf.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the featured cut",
          why: "The memo fixes the featured half at 8 — the shelf prints ranks 1 through 8, ending on Bluetooth Speaker Mini at 59.99. 16 would print the whole catalog and 5 would cut the ladder before the mid band.",
        },
      ],
      distractors: ["stock", "category", "name", "id", "16"],
      walkthrough:
        "One table, one window, one cut. RANK() OVER (ORDER BY price DESC) prices the shelf top-down — Smart Watch S 199.99 at rank 1, then the Noise-Canceling Headset 149.99, the 4K Webcam 129, the Studio Mic 119, the Keyboard 89.99, the Fitness Band 79, the Cycling Jersey 65, and Bluetooth Speaker Mini 59.99 at rank 8, the featured half's floor. The outer ORDER BY shelf_rank ASC reads top-first and LIMIT 8 makes the cut; ranks are gapless here because no two prices tie. stock in the measure slot ranks the warehouse instead of the shelf; category and name produce alphabet ladders; id produces an ingestion ladder — every one runs clean and answers a different memo. ASC in the window order crowns the cheapest SKU; DESC on the outer order opens the board at rank 16; LIMIT 16 prints the whole catalog and kills the cut. The 200+ premium band stays empty on this db — the ladder tops at 199.99, and the memo says so.",
    },
    {
      id: "cs-bumble-4",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The premium engagement line",
      brief:
        "Pricing memo, Thursday: Premium tiering is priced per market, and the pricing board wants the cohorts whose average engagement clears the market's own average — the line a tier price has to beat. The db mapping is declared: orders are matches, order total is engagement units per match, regions are the four market cohorts. Probed facts: the market average sits at **338.19** engagement units per match over the 34,833.28 book; cohort averages read **EU 335.32**, **APAC 313.66**, **US 383.48**, **LATAM 426.22**. The memo defines the line as the market average computed over the whole population — once, in a scalar subquery — and cohorts clear it strictly. Biggest premium first.",
      ask: "Return each market cohort whose average engagement clears the 338.19 market line, with its cohort average and the market average, biggest average first.",
      template:
        "SELECT c.region,\n       ROUND(AVG(o.total), 2) AS region_avg,\n       ROUND((SELECT {1}(total) FROM orders), 2) AS market_avg\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING AVG(o.total) > {2}\nORDER BY region_avg {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the market bar",
          why: "The line is the market's average engagement — AVG(total) over all 103 matches, computed once: 338.19. SUM would price the bar at the whole 34,833.28 book and empty the board; COUNT would set it at 103 units, a bar every cohort clears for the wrong reason.",
        },
        {
          answer: "338.19",
          kind: "number",
          label: "the premium line",
          why: "The memo fixes the line at the market average, probed at 338.19 — and the query prints that same figure in every row it keeps, so the board sees the margin. 300 would admit EU (335.32) and APAC (313.66); 500 would clear nobody.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the premium order",
          why: "Biggest average first, per the memo — LATAM 426.22 leads, US 383.48 follows. ASC would open the board on US and bury the biggest premium market at the bottom.",
        },
      ],
      distractors: ["SUM", "COUNT", "ASC", "300", "500"],
      walkthrough:
        "One population, one computed line, one gate. The scalar subquery computes the market bar once — AVG(total) = 338.19 over all 103 matches — and prints it beside every surviving cohort, so the board sees the margin, not just the verdict. The HAVING gate keeps the cohorts strictly above the line: LATAM 426.22 and US 383.48 clear it; EU 335.32 misses by 2.87 and APAC 313.66 by 24.53 — the near-miss is the deck's footnote. SUM in the bar slot lifts the threshold to the whole 34,833.28 book and empties the board; COUNT sets the bar at 103 units, which everything clears — a different question. 300 in the line slot admits EU and APAC to a premium tier their averages don't support; 500 clears nobody. ASC inverts the read and opens on US. Two decimals, one line, stated margins — the pricing board's whole argument.",
    },
    {
      id: "cs-bumble-5",
      tier: "hard",
      topic: "j4",
      universe: "month-close",
      title: "The unpaid Premium chase list",
      brief:
        "Month-close memo from finance: Premium & Boost billing closed the period at **28 invoices against 27 payment legs** — five split-payment invoices settled in two legs, one partial sits at 4,000 of 6,148, and the anti-join reads **6 invoices with no payment leg at all, 15,217.00** outstanding. One of the six is a ghost: invoice #28 carries {rose:paid} status with zero legs behind it. The db mapping is declared: invoices are Premium & Boost bills (INTEGER cents), payments are the settlement legs, customers are members. The chase list ships per member — unpaid count and cents due — floor at one unpaid invoice, biggest exposure first.",
      ask: "Return each member holding at least one no-leg invoice with their unpaid count and cents due, biggest exposure first.",
      template:
        "SELECT c.name,\n       c.region,\n       COUNT(i.id) AS unpaid_invoices,\n       SUM(i.amount_cents) AS due_cents\nFROM customers c\nLEFT JOIN invoices i ON i.customer_id = c.{1}\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.invoice_id {2} AND i.id IS NOT NULL\nGROUP BY c.name, c.region\nHAVING COUNT(i.id) >= {3}\nORDER BY due_cents {4};",
      slots: [
        {
          answer: "id",
          kind: "keyword",
          label: "the member key",
          why: "Invoices attach to members through customers.id — the account key the whole chain hangs on. c.customer_id doesn't exist; any wrong column in that position pairs an integer key against the wrong field and empties the chase list while the query runs green.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-leg filter",
          why: "The chase list is the anti-join arm: keep invoice rows where no payment leg attached (p.invoice_id IS NULL). IS NOT NULL returns the 22 billed invoices — the paid book — and = 0 never matches, because a NULL key is unknown, not zero.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the chase floor",
          why: "The floor is one unpaid invoice — every member on this list holds exactly one, so the board prints all six holders. 2 would empty the list: the split-payment invoices keep their legs paid in full and never land here.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "Biggest cents due first — the collector works the top down. ASC would open on the smallest balance and spend the morning on the tail.",
        },
      ],
      distractors: ["IS NOT NULL", "= 0", "2", "ASC"],
      walkthrough:
        "Two LEFT JOINs and one honest arm. The first join hangs each member's invoices on the account key; the second hangs each invoice's payment legs under it; the WHERE keeps rows with a real invoice (i.id IS NOT NULL) and no leg (p.invoice_id IS NULL) — the 6 no-leg bills, 15,217.00 all told. The fold prints six members at one unpaid invoice each: the biggest exposure 493,700 cents, then 356,200, 279,400, the ghost #28 at 175,600 cents under paid status, 129,500 and 87,300 — summing to the probed 1,521,700 cents. The floor at 1 keeps everyone; 2 empties the list because the splits and the partial all carry legs. IS NOT NULL in the leg filter returns the paid book instead of the chase list; = 0 is never true against a NULL key. ASC reads the tail first. Reconciliation closes the memo: 22 invoices with legs + 6 without = 28, and 27 legs cover 17 singles, 5 splits and 1 partial.",
    },
    {
      id: "cs-bumble-6",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass outcome census",
      brief:
        "Conversation-health memo: the product review opens with the outcome census — all four match outcomes folded in one pass, per market cohort, arms that reconcile to the population by construction. The db mapping is declared: orders are matches, status is the conversation outcome ({emerald:delivered} = opener sent & replied, {sky:shipped} = sent & unanswered, {violet:pending} = sitting unopened, {rose:cancelled} = expired unopened). Probed facts: over 103 matches the census reads 52 replied / 30 unanswered / 14 unopened / 7 expired; per cohort the replied arm reads EU 24, APAC 21, US 5, LATAM 2. The memo fixes the board floor at **21 replied** — a cohort must clear it to make the review (the gate is >=, so a cohort sitting exactly on 21 stays). Most replies first.",
      ask: "Return each cohort clearing the 21-reply floor with its four outcome counts in one pass — replied, unanswered, unopened, expired — most replies first.",
      template:
        "SELECT c.region,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS replied,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS unanswered,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS unopened,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS expired\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nHAVING COUNT(*) FILTER (WHERE o.status = 'delivered') >= {3}\nORDER BY replied {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the replied arm",
          why: "The replied arm counts delivered matches — openers answered. 'shipped' would print the unanswered arm under the replied label and the board would certify stalled conversations as wins.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the cohort key",
          why: "Matches reach their market through the member: c.id = o.customer_id. Joining on o.id pairs match row-ids against member ids — nonsense keys that empty the census while it runs clean.",
        },
        {
          answer: "21",
          kind: "number",
          label: "the review floor",
          why: "The memo fixes the floor at 21 — APAC's exact count, so the gate keeps EU (24) and APAC (21) and drops US (5) and LATAM (2). 22 would trim APAC off its own boundary; 5 would wave US through.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the review order",
          why: "Most replies first, per the memo — EU's 24 opens the review. ASC would open on APAC's 21 and bury the biggest census arm at the bottom.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "product_id", "22", "5"],
      walkthrough:
        "One scan, four arms, zero drift. The join reaches each match's cohort through the member key, and four FILTER arms count every outcome from the same 103-row population: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — each row summing to its cohort's match count, so the arms reconcile by construction. The HAVING floor at 21 keeps EU and APAC and drops the rest. 'shipped' in the replied slot prints the unanswered arm under the replied label — 12 and 8 instead of 24 and 21 — and the review certifies stalled conversations as wins; 'pending' empties the board entirely, since no cohort clears 21 unopened. product_id isn't on the match table and errors. 22 trims APAC at its own boundary, 5 admits US, and ASC reads the board upside down. The kept cohorts carry 45 of the 52 replied matches on 82 of the 103 — the floor is doing real work, and the census says so in one pass.",
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
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — the swipe-session habit read: weekly actives who return daily, as a ratio of distinct-member sets; the board that decides whether Boost buys new sessions or re-bills old ones." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the trailing-window fold the stickiness denominator is cut from; windows that slide over the match log instead of snapping to calendar months." },
    { slug: "active-users", why: "Active Users — consecutive-day swipe streaks via LAG plus date math: who opens the app every day of a week, the retention tail the winback team wants back." },
    { slug: "game-play-analysis-v", why: "Game Play Analysis V — day-1 retention by first-match date: which match cohorts come back the next day, the drill behind the replied-share follow-up." },
    { slug: "friend-requests-i-overall-acceptance-rate", why: "Friend Requests I — the overall acceptance rate: like-to-match conversion with NULL-safe arithmetic in the denominator, the funnel's top rung." },
    { slug: "confirmation-rate", why: "Confirmation Rate — the per-member reply ratio with the zero-leg guard: members with no openers yet must read 0.00, not NULL and not a division error." },
    { slug: "friend-requests-ii-who-has-the-most-friends", why: "Friend Requests II — the most-connected member: argmax with ties kept, the popularity read that seeds Spotlight placement." },
    { slug: "number-of-comments-per-post", why: "Number of Comments Per Post — self-join thread pairing: replies counted per opener, the conversation-depth read behind every prompt-pack review." },
    { slug: "second-highest-salary", why: "Second Highest Salary — the Nth-rank probe that must print NULL when the podium is short: the second-biggest match day, honestly empty." },
    { slug: "department-highest-salary", why: "Department Highest Salary — top engagement per market cohort: the correlated argmax the cohort decks are built from." },
    { slug: "running-total-for-different-genders", why: "Running Total — cumulative folds over ordered partitions: engagement accruing across the match log, the running-sum shape the trend boards reuse." },
    { slug: "restaurant-growth", why: "Restaurant Growth — the 7-day rolling average over a moving frame: smoothed engagement per member without letting one SuperSwipe spike redraw the line." },
    { slug: "keep-latest-dedupe", why: "Keep-Latest Dedupe — ROW_NUMBER = 1 over retry duplicates: the match log's ingestion hygiene, batch twins collapsed to the newest leg." },
    { slug: "null-blank-audit", why: "Null & Blank Audit — the NULL/blank sweep the match log gets before any board ships: unstamped windows are states, never zeros." },
    { slug: "reported-posts-ii", why: "Reported Posts II — the removal rate per day: trust & safety's daily read, blocks and reports folded into one rate with the denominator stated." },
    { slug: "transactions-per-visit-histogram", why: "Transactions per Visit Histogram — swipes per session bucketed in one pass: the session-depth histogram the stickiness story hangs on." },
  ],
};
