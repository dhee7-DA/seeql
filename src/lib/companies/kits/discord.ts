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
//
// EXPANDED to the 3x kit (task 95 expansion, append-only): 6 brief paras,
// 4 day-in-life beats, 12 metrics, 15 topics, 24 theory (t9-t24 added),
// 30 MCQs (11-30 added), 6 cases (cs-discord-3..6 on topic families t7/j7/
// s6/q2 — distinct from the original q5/x2), 32 problems. All appended slugs
// stay THEME-CURATED from the SQL band (Discord is still 0-tagged); figures
// from scripts/company-facts.md plus one read-only probe of db/custom.db.

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
    "Preparation strategy: Discord has **no tagged registry problems**, so this kit theme-curates all sixteen — the session census and first-join canon, streak ladders (`longest-winning-streak`, `fifteen-days-of-learning`), retention cohorts, the Nitro conversion funnel and the silent-majority anti-joins. Then run all six case studies on the live storefront db: one rebuilds the {violet:heavy-habit cohort screen} (a derived per-member fold gated above the **6.44** mean cadence — 4 members carrying **63.5%** of demand), the other rebuilds the {emerald:one-pass engagement census} (FILTER arms per outcome, counts that must reconcile). The storefront mapping is declared, not hidden — orders are open sessions, totals are engagement units, regions are market cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
    "Under the engagement layer sits the money, billed as Nitro & Server-Boost subscriptions in integer cents — `amount_cents / 100.0` at the display edge, never a bare /100. The book is 28 invoices: 21 {emerald:paid} for $66,443.00, 6 open for $19,609.00, 1 void for $925.00, and the coverage fold is the close's spine — 21 exact, 1 partial (4,000 of 6,148), 6 never paid. Card rails carried 16 payments worth $37,364.00 against wire's 11 / $32,248.00, settlement averages **28.4 days** against flat 30-day terms, and the anomalies register stays live: a {rose:void-but-paid} invoice at 925.00, a paid invoice with zero payment rows at 1,756.00. *The ledger still ties 181,080 = 181,080 at every close — reconciliation is the sign-off, not a formality.*",
    "At full depth the kit runs **fifteen topics, twenty-four theory drills, thirty MCQs and six audited case studies** on the storefront db. The originals rebuild the {violet:heavy-habit cohort screen} and the one-pass engagement census; the four additions walk the month-over-month engagement trend (LAG deltas with the July cool-off as the gate), the bot-partner load board (a four-table join folded per integration partner), the Nitro SKU tier census (CASE bands over the product catalog) and the billing outlier screen (a scalar-subquery average printed beside every qualifying invoice). The 32-problem pool stays theme-curated — Discord carries no tagged registry rows — with month-bucket trend walks, set-op digests, leaderboard ties and NULL-safe anti-joins added on top. The bar is unchanged: *state the denominator, keep the census unfiltered, and reconcile every multi-branch total or the board doesn't ship.*",
  ],

  dayInLife: [
    "**08:20 —** The overnight server-health board. The analyst opens telemetry's morning reads: sessions per cohort, the {emerald:voice-completed share} (52 of 103 on the audit window), and the number that gates the day — the {rose:disconnection queue}: which members' last period ended abandoned, and whether the July-style cool-off (**$1,193.86** month, 2 cancels) is repeating. The first query is a fold of the 251 activity batches into per-session event counts, retries deduped keep-latest and stated. A spike in lurking (14 sessions) without voice movement is the day's first fire, and the analyst who can split NEW lurkers from CHRONIC ones — before the community lead pings — owns the morning.",
    "**11:00 —** Heavy-habit deep work. Growth wants the cadence screen rebuilt: fold sessions per member in a derived table, gate above the **6.44** book-wide mean, rank the survivors. The screen returns 4 members — 24, 17, 14, 13 periods — who carry **63.5%** of the book's $34,833.28 engagement, and the regional read beneath it (EU **45 sessions / 8 members**, APAC **37 / 5**, US **19 / 2**) decides which cohort gets the next voice experiment. Each ask is a fold, a gate and an argument about grain — batches versus events, sessions versus members. *A cohort without its denominator is just a bar chart of vibes.*",
    "**15:30 —** Bot-partner and Nitro cycles. The partner review: event batches per bot with plays separated from loads, the {sky:verification-lag} read (**82 of 103 stamped, 2.98-day average, 2–4 range** — the unstamped 21 are lurking-plus-dropped, reported as a state), and the Nitro billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned) with the {amber:split-payment} register (5 invoices, one partial at **4,000 of 6,148** cents) flagged for finance. The afternoon's job is closing loops: yesterday's cadence screen becomes next sprint's onboarding A/B, and every number that leaves the desk carries its population with it — the EOD note pins the SQL beside the figures it produced, because retention re-runs these blind.",
    "**20:30 —** The Nitro close sweep. Billing reconciles in cents first: the 28-invoice book splits {emerald:21 exact / 1 partial / 6 unpaid}, the partial (4,000 of 6,148) gets a dunning note, and the {rose:void-but-paid} invoice at 925.00 stays on the anomalies register until finance kills it. The ledger proof runs last — debits **181,080 = 181,080** credits, cash 44,196, AR 16,440, revenue -86,052 against 25,416 of opex, roughly two-thirds of it rent — and the tie is the sign-off, not a formality. Before logging off, the analyst stages tomorrow's dedupe: a keep-latest ROW_NUMBER pass over the raw batch log so the morning boards fold the clean layer, never the raw one. *The close is the one board that has to survive an auditor reading it alone.*",
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
    { name: "Nitro AR exposure", what: "Open receivables two ways: by status, 6 open invoices worth $19,609.00; by payment evidence, 6 invoices with no payment rows holding $15,217.00 — because #25 is open with a partial 4,000 of 6,148 already landed. Two definitions, two boards; the label names its denominator." },
    { name: "Settlement coverage", what: "Payment coverage classes over the 28-invoice Nitro book: 21 exact, 1 partial, 6 none. The fold finance runs at every close — a class that drifts means a payment landed on the wrong invoice." },
    { name: "Infra spend mix", what: "Expense mix in honest dollars: Rent 14 entries / $16,800.00, Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00 — rent is roughly two-thirds of the $25,416.00 opex book, and the mix decides which cost line the board argues about." },
    { name: "Engagement trend calendar", what: "Fourteen monthly buckets, 2024-01 through 2025-02: a January peak of $3,731.97, the July cool-off of $1,193.86, a $2,390.53 February exit with zero cancels. The spine every month-over-month walk hangs on." },
  ],

  topics: [
    {
      name: "First joins & session counts",
      why: "Every member story starts with a first session, and every board starts with a count: periods per member, first-session attribution, minutes per open. The curated trio drills the first-login fold, the distinct-viewer count and the duration roll-up that opens Discord's server-health screens.",
      slugs: ["game-play-analysis-i", "article-views-i", "find-total-time-spent-by-each-employee", "dau-wau-stickiness", "average-time-of-process-per-machine", "active-users"],
    },
    {
      name: "Return-visit gap math",
      why: "Comeback behavior is window math: LAG over each member's session partition, julianday deltas, the first open's NULL kept as no-previous-session. The trio covers the biggest-gap read, the second-day return and the day+1 comparison that re-engagement alerts hang on.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "rising-temperature", "mrr-waterfall"],
    },
    {
      name: "Streak ladders & consecutive days",
      why: "Daily-server habits are streaks: members who show up day after day, and the day the ladder breaks. The curated trio is the gaps-and-islands canon — the longest streak, the 15-day wall, the loyal-customer islands read that the retention board's headline hangs on.",
      slugs: ["longest-winning-streak", "fifteen-days-of-learning", "find-loyal-customers"],
    },
    {
      name: "Retention cohorts & growth accounting",
      why: "Server retention reads cohort-shaped: which join month keeps its actives, how churn moves week over week, how new minus resurrect minus churn nets to the growth story. The trio is the exact grammar the community team's monthly deck is written in.",
      slugs: ["cohort-retention-matrix", "week-over-week-churn", "growth-accounting", "find-churn-risk-customers", "duplicate-charge-pairs"],
    },
    {
      name: "Nitro conversion funnel",
      why: "Free-to-Nitro is a funnel: trial started, feature used, subscription period paid. These drills build the step-conversion grammar — stage counts, trial-to-paid ratios, subscription-conversion joins — with the denominator at every step stated out loud.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "analyze-subscription-conversion", "reported-posts-ii"],
    },
    {
      name: "One-pass censuses",
      why: "The engagement census counts all four session outcomes in one pass — voice, text, lurking, dropped — and COUNT(CASE …)/FILTER arms are the grammar. The literal snaps census is this read; the trio adds the target-met conditional and the zero-available gate that census reports lean on.",
      slugs: ["snaps-analysis", "number-of-employees-who-met-the-target", "find-books-with-no-available-copies", "immediate-food-delivery-ii", "immediate-food-delivery-i"],
    },
    {
      name: "Surface-split pivots",
      why: "Voice-versus-text is a pivot: one row per cohort, one branch per surface, per geography. The trio drills the column-pivot grammar — outcome per row, weekday per column, geography reshaped — that the surface-split board and its shard cousins are written in.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "students-report-by-geography"],
    },
    {
      name: "Histograms & buckets",
      why: "Events-per-session distributions ship as bar charts: sessions bucketed by event count, engagement by band, orders by interval. These drills cover the bucket grammar — CASE ladders, interval gates, histogram folds — where the bucket edges are the whole audit.",
      slugs: ["create-a-session-bar-chart", "calculate-orders-within-each-interval", "spend-histogram", "transactions-per-visit-histogram"],
    },
    {
      name: "Silent-majority anti-joins",
      why: "Lurkers are defined by absence: members with sessions but no voice events, accounts that never streamed, visitors who never transacted. The trio drills the anti-join shapes — NOT EXISTS, LEFT JOIN IS NULL, visited-but-didn't — that the onboarding team lives in.",
      slugs: ["customer-who-visited-but-did-not-transact", "ad-free-sessions", "number-of-accounts-that-did-not-stream", "customers-who-bought-a-and-b-not-c", "sellers-with-no-sales"],
    },
    {
      name: "Threshold subqueries",
      why: "'Who's still active past the mean?' is a subquery shape: fold per member, compare against the book-wide average, keep the survivors. The trio drills the scalar-average gate, the second-highest read and the above-average-quantity filter that cadence screens are built from.",
      slugs: ["game-play-analysis-iv", "second-highest-salary", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Month buckets & trend walks",
      why: "The engagement book reads month over month — fourteen buckets from 2024-01 to 2025-02, a January peak of 3,731.97 and a July cool-off of 1,193.86. The trio drills the calendar grammar the trend walk needs: '%Y-%m' keys, latest-in-window picks and 30-day rolling windows with the boundaries stated.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "users-with-two-purchases-within-seven-days", "rolling-7d-actives"],
    },
    {
      name: "Set ops for stitched digests",
      why: "Digests stitch populations: voice-completed sessions plus stamped sessions, this month's actives plus last quarter's whales. UNION's dedupe hides double-qualified members while UNION ALL preserves them, and EXCEPT diffs two boards as sets. The trio covers the column-position discipline and the zero-bucket stitch that keeps digests honest.",
      slugs: ["movie-rating", "count-salary-categories", "monthly-transactions-ii", "keep-latest-dedupe", "duplicate-emails"],
    },
    {
      name: "Leaderboards & tie behavior",
      why: "Top members by cadence, top SKUs by events, top partners by engagement — Discord reporting is leaderboard reporting, and ties are everywhere once sixteen members share 103 sessions. The trio drills RANK, DENSE_RANK and ROW_NUMBER until the 1,2,3,4,4,6 gap pattern is a spoken reflex, then adds the top-N-per-group cut.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "NULL arms & fallback policy",
      why: "Members without boosts, sessions without stamps, payments without invoices — the LEFT JOIN NULL arm is half the platform's truth. The trio drills combine-tables-style outer joins, the COALESCE bonus guard and the confirmation-rate pattern where the fallback is a stated policy, never an accident.",
      slugs: ["combine-two-tables", "employee-bonus", "confirmation-rate", "number-of-calls-between-two-persons"],
    },
    {
      name: "Fold-then-join instincts",
      why: "Load control is a query-budget habit: fold sessions per member before joining, count the team with a window over the fold, and never average averages across grains. The trio drills the team-size fold, the department-vs-company average (the avg-of-averages trap in its purest form) and the report-to fold that keeps one row per node.",
      slugs: ["find-the-team-size", "average-salary-of-departments", "the-number-of-employees-which-report-to-each-employee"],
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
    {
      id: "discord-t9",
      q: "The board wants a running engagement total per member across their sessions. Where do window frames change the answer?",
      a: "SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at) defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — RANGE treats peer rows (same ORDER BY value) as one step, so two sessions opened in the same second jump the running total by both at once. ROWS UNBOUNDED PRECEDING splits them row by row, which is what an event-sourced walk usually wants. At Discord the distinction is not pedantry: same-timestamp opens happen when a member re-enters a voice room, and a board that mixes frames shows two different 'running engagement' numbers for the same member. State the frame in the board's footnote; when the ORDER BY key is not unique, decide deliberately whether ties move together or one at a time — and make the whole board agree.",
      tag: "windows",
    },
    {
      id: "discord-t10",
      q: "When does a digest need UNION ALL instead of UNION — and what does UNION silently delete?",
      a: "UNION dedupes whole rows across both arms; UNION ALL appends everything. Stitch a voice-completed arm (52 sessions) with a stamped arm (82) and UNION quietly collapses the 52 into the 82 — every voice-completed session is stamped, so the digest prints 82 while the team assumes 134 rows of evidence walked in. UNION ALL keeps 134 and lets a count of member ids untangle the overlap. EXCEPT is the diff: stamped EXCEPT voice-completed is exactly the 30 text-only sessions. The discipline at Discord: column order must match across arms (position, not name, is the contract), and every stitched digest ships with a 'which arm could double-count?' footnote. *A set op is a population claim — the dedupe decision IS the metric.*",
      tag: "set-ops",
    },
    {
      id: "discord-t11",
      q: "A scalar subquery benchmarks every session against the book-wide average engagement. When is it computed, and what happens when it returns no rows?",
      a: "A non-correlated scalar in WHERE or SELECT computes ONCE — AVG(total) over all 103 orders folds to 338.19 and the planner carries one number. A correlated scalar references the outer row and recomputes per row; fine at 16 members, a load problem at event scale. The edge case is the empty inner query: AVG over zero rows returns NULL, and total > NULL is UNKNOWN — every row fails the comparison silently, the screen returns zero rows, and no error fires. That is why the benchmark's bar is printed as a column beside the results: the board shows the line it drew and the count that cleared it. If the bar can legitimately be empty, wrap it — COALESCE((SELECT …), 0) — but only when zero is the honest fallback, not a reflex.",
      tag: "subqueries",
    },
    {
      id: "discord-t12",
      q: "The partner board keeps only partners above an engagement floor. WHERE or HAVING — and what breaks if you pick wrong?",
      a: "WHERE runs before GROUP BY: it filters rows, and an aggregate like SUM(quantity * unit_price) doesn't exist yet — the query errors, which is the friendly failure. The unfriendly one is sneaking a per-row expression into HAVING instead: SQLite's leniency may evaluate it against an arbitrary row of the group, so the floor gates pre-fold facts rather than partner totals and the board's population changes meaning without changing shape. HAVING is the post-fold gate: one row per partner, compared against its own folded engagement. The board's floor of 4,765.63 keeps three of six partners, and the memo can name exactly which — the floor is a population decision, so it lives at the stage where the population it names exists. At Discord the rule: row filters in WHERE, fold gates in HAVING, and the memo says which one it meant.",
      tag: "pipeline",
    },
    {
      id: "discord-t13",
      q: "Walk the date grammar this kit actually uses: month keys, latency math and term windows.",
      a: "Three tools, three grains. STRFTIME('%Y-%m', created_at) makes sortable month keys — fourteen buckets from 2024-01 to 2025-02; '%m' alone folds the two Februaries and the trend's spine breaks. JULIANDAY diffs give fractional-day latency: julianday(shipped_at) - julianday(created_at) averages 2.98 over the 82 stamped sessions, and the subtraction must happen in julian space — subtracting the ISO text coerces '2024-01-04' to the number 2024 and prints a 0-day lag. DATE(issued_on, '+30 days') builds term windows in calendar space — the modifiers handle month ends a naive julian round-trip can mangle, and the book's flat 30-day terms make it the whole rule. The follow-up is always grain: calendar days, 24-hour gaps or month buckets are three different metrics wearing one column, and the memo names which one it is buying.",
      tag: "dates",
    },
    {
      id: "discord-t14",
      q: "Nitro billing lives in integer cents. Where exactly does the division happen, and why is /100 banned house-wide?",
      a: "Amounts land as INTEGER cents — `amount_cents` — and stay that way through every fold: SUM, filters, partial-payment arithmetic (4,000 paid of 6,148 billed is a cents-to-cents comparison). Division happens once, at the display edge: ROUND(amount_cents / 100.0, 2). The /100 ban is about the failure mode, not this month's data: SUM over integer cents stays integer, and integer/integer in SQLite truncates — the day a non-multiple-of-100 cent amount lands (a proration, a tax line), every odd cent in the book silently vanishes. The partial-settlement register is where it bites: 4,000 against 6,148 is exact in cents and lossy the moment someone 'simplifies' the units. Divide once, divide by 100.0, and print the unit next to the number — *cents inside, dollars at the edge, and the ledger ties 181,080 = 181,080 because nobody rounded mid-pipeline.*",
      tag: "money",
    },
    {
      id: "discord-t15",
      q: "The deck says 50.5% voice-completed; the telemetry board says 79.6% verified. Which number is right?",
      a: "Both — they measure different populations, and the interview question is whether you can say so. Voice-completed share is 52 of ALL 103 sessions (50.5%): the product-behavior read, denominator = every open session. The verification rate is 82 stamped of 103 (79.6%): a pipeline-health read, same denominator but the numerator is 'reached verification', which includes the 30 text-only sessions. The unstamped 21 (14 lurking, 7 dropped) sit outside both numerators and are reported as a state, never imputed to zero. The failure mode is real: someone 'fixes' the gap by coalescing missing stamps to created_at and the verification rate jumps to 100 — the board now claims the dropped tail verifies instantly. KPI work at Discord is denominator archaeology: name the population, print the counts beside the share, and never let two boards share a name with different numerators.",
      tag: "kpi",
    },
    {
      id: "discord-t16",
      q: "LATAM shows the highest engagement per session — 426.22 against a 338.19 book average. What does the concentration read say before anyone celebrates?",
      a: "LATAM is 2 sessions from 1 member — the 426.22 is one person's weekend, not a market signal, and the small-n caveat ships with the number or the deck gets laughed out of the room. The honest concentration read: the top cadence quartet (24, 17, 14, 13 sessions) holds 63.5% of the book's engagement, so 'the average member' is a fiction the mean keeps selling. Two disciplines follow. First, ratio-of-sums over sum-of-ratios: per-session engagement is SUM(total)/COUNT(*) per cohort (EU's 15,089.23 over 45 sessions), never the average of member averages — they differ whenever members contribute unequally, which is always. Second, print the population beside every share: sessions, members, and the share itself, so the reader can see that US's 383.48 rides on 19 sessions from 2 members. *Concentration is the first derivative of every average here.*",
      tag: "kpi",
    },
    {
      id: "discord-t17",
      q: "The unpaid-invoice read: NOT IN, NOT EXISTS or LEFT JOIN … IS NULL — and which one can silently return nothing?",
      a: "NOT IN (SELECT invoice_id FROM payments) has a landmine: if the subquery ever returns a NULL — a payment row with no invoice yet, a refund pending allocation — the outer comparison becomes id NOT IN (…, NULL), which is never TRUE, and the unpaid list empties while the query runs clean. NOT EXISTS is NULL-proof by construction: it asks 'does any payment row exist for this invoice?' and a NULL row simply doesn't match the correlation. LEFT JOIN payments … WHERE payments.invoice_id IS NULL is the same read with the unmatched-arm idiom, and it generalizes when you also want the matched rows' aggregates. On this book all three return the same 6 invoices / 15,217.00 — today. The house rule is NOT EXISTS or the LEFT JOIN idiom precisely because the day a NULL lands in the payment log, the dunning queue must not silently go empty. *Anti-joins are defined by absence; a NULL in the inner set is absence you can't see.*",
      tag: "anti-joins",
    },
    {
      id: "discord-t18",
      q: "The cadence leaderboard: RANK, DENSE_RANK or ROW_NUMBER — and what does each print for the four members tied at 4 sessions?",
      a: "The cadence census reads 24, 17, 14, 13, 5, then four members at 4. RANK gives the tie block 6,6,6,6 and the next members (3 sessions) rank 10 — the gap preserves the count of people ahead, which is what 'ranked 10th of 16' means to a reader. DENSE_RANK gives 6,6,6,6 then 7 — compact tiers, right for band counts, wrong when the board must show how many members cleared the bar. ROW_NUMBER splits the tie arbitrarily — 6,7,8,9 — and prints a leaderboard where membership in the tie block depends on sort-order luck. At Discord the rule is: RANK for reader-facing boards (ties share the rung, the gap is honest), DENSE_RANK for tier and percentile ladders, ROW_NUMBER only with a stated tie-break (id, then timestamp) when a cut must be deterministic. The follow-up question is always 'what happens at the tie?' — a candidate who answers before being asked owns the room.",
      tag: "windows",
    },
    {
      id: "discord-t19",
      q: "When does a cohort board want GROUP_CONCAT, and what are its failure modes?",
      a: "GROUP_CONCAT(member) folds a cohort's roster into one cell — perfect for a review deck where EU's 8 members should be read, not exported. The failure modes are three. Order is nondeterministic unless you ORDER BY inside the aggregate or stage the rows first — a roster that shuffles between runs erodes trust in the whole board. The separator defaults to a comma, so member names containing commas corrupt the cell — pick an impossible separator deliberately. And length is unbounded: folding 103 session ids into one cell works on a book this size and dies at event scale, which is why the fold belongs in a display query, never in a pipeline stage. The census discipline still applies: GROUP_CONCAT is one arm beside the COUNT — the roster cell and the member count must agree, or the fold lied.",
      tag: "aggregation",
    },
    {
      id: "discord-t20",
      q: "The morning boards got slow. What are the first three instincts you check before touching an index?",
      a: "One: sargability — any function wrapped around a filtered or joined column (STRFTIME('%Y-%m', created_at) = …, julianday(a) - julianday(b) < 7) disables index use on that column; rewrite as range predicates on the bare column (created_at >= '2025-01-01' AND created_at < '2025-02-01'). Two: grain — joins that fan out before the fold (103 sessions meeting 251 batches) make the database shuffle three times the rows the answer needs; fold in a derived table first, then join at one-row-per-key, which is a correctness habit that happens to be the performance habit. Three: shape — COUNT(*) for existence checks, EXISTS instead of IN when the inner set could be large or NULL-prone, and no fetching rows to count them in the app. Indexes come last, and only after EXPLAIN QUERY PLAN shows a scan the query shape caused. *Most 'slow database' tickets at Discord are a fold wearing a join's clothes.*",
      tag: "performance",
    },
    {
      id: "discord-t21",
      q: "Define the retention cohort matrix this team ships — and the two definition decisions that change every cell.",
      a: "Members are cohorted by first-session month (their month-0); each later cell is the share of that cohort with at least one session in month N. Decision one: the month-0 denominator — every member who ever opened a session (16 across the book) or only members who survived some activation bar? The bar-less version reports 100% at month-0 by construction and is the honest acquisition view; the gated version reads like retention but has survivorship quietly built in. Decision two: active in month N means any session, or a voice-completed one? The activity definition moves every cell, so it is printed in the board's header, not buried in a CTE. The SQL is a self-fold on member-month keys with a left join onto the cohort spine so empty cells print as zeros, not NULLs — a missing month is zero actives, which is information. *A cohort matrix is a definition document that happens to be a query.*",
      tag: "cohorts",
    },
    {
      id: "discord-t22",
      q: "Per-cohort engagement per member: SUM(total)/COUNT(DISTINCT member) or AVG of the per-member folds — and why do the numbers disagree?",
      a: "They disagree because they answer different questions. SUM(total)/COUNT(DISTINCT customer_id) is engagement per member with every session weighted by its owner's activity — EU's 15,089.23 spread over its 8 members. AVG over a per-member fold first averages each member's sessions, then averages members — the 24-session power user counts exactly as much as the 1-session tourist, and the number stops meaning 'what a member does here' and starts meaning 'the average of member experiences'. Discord boards use the weighted form for capacity and revenue questions (support load, Nitro targeting) and the unweighted form only when the question is explicitly about typical members — and they label which one they printed. The trap is silent swapping: the same board moving between the two forms between sprints because someone 'cleaned up' the query. Ratio-of-sums versus sum-of-ratios is not a style choice; it is two different metrics sharing one name.",
      tag: "ratios",
    },
    {
      id: "discord-t23",
      q: "The finance tables disagree with themselves: a void invoice with a payment, a paid invoice with none. How does the close handle status-versus-evidence conflicts?",
      a: "Status is a claim; payment rows are evidence; the close reconciles the two and reports the delta as findings, not as fixes. The register on this book: invoice 11 is void but carries a 925.00 payment; invoice 28 says paid with zero payment rows at 1,756.00; five invoices settle across two payment rows (splits); invoice 25 is open with a partial 4,000 of 6,148. The read is a coverage fold — invoices LEFT JOIN payments, classified exact / partial / none per status arm — and each conflict keeps its source rows visible: nobody UPDATEs the status to make the fold pretty. The append-only rule is what makes the ledger trustworthy: corrections arrive as new rows with timestamps, so the 925.00 stays explainable forever. The trial balance ties at 181,080 = 181,080 not because the data is perfect but because the conflicts are visible and counted. *A close that hides its anomalies is a fiction with a signature line.*",
      tag: "quality",
    },
    {
      id: "discord-t24",
      q: "The census needs a fold, a window over the fold and a gate over the window. CTE chain or nested derived tables — how do you choose?",
      a: "Mechanically they are the same plan in SQLite for read-only queries — the choice is readability under review. The CTE chain (WITH monthly AS …, walk AS …) names each stage — month fold, LAG walk, gate — so the reviewer can audit one grain per step, and a stage referenced twice (the monthly fold feeding both the delta and the level check) is written once and reused. Nested derived tables hide the same logic three layers deep, where the third alias is always 'm' and nobody remembers what it folds. The house style: CTEs when a stage is reused or named for the board's footnote, derived tables for one-shot stages that would otherwise earn a name nobody uses. What doesn't change: the window still runs after the stage that fixed the population — stage the WHERE first, window second, gate last, or the filtered-timeline lesson bites inside the CTE too. *Multi-stage queries are essays: paragraph breaks are CTEs.*",
      tag: "ctes",
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
    {
      id: "discord-mcq-11",
      prompt: "The verification board wants the count of stamped sessions. The book holds 103 open sessions; 82 carry a member-verification stamp (shipped_at), 21 don't. Which expression returns 82?",
      choices: [
        "COUNT(*) FROM orders",
        "COUNT(shipped_at) FROM orders",
        "COUNT(DISTINCT shipped_at) FROM orders",
        "SUM(shipped_at) FROM orders",
      ],
      answer: 1,
      why: "COUNT(column) counts rows where that column is non-NULL — 82. COUNT(*) counts rows — 103. The 21 unstamped sessions are the lurking-plus-dropped tail, reported as a state, never folded into the stamped total.",
      notes: [
        { choice: 0, why: "103 counts every row including the unstamped tail — the board would overstate verification by 21 sessions." },
        { choice: 2, why: "DISTINCT dedups timestamp VALUES — two members verified in the same instant count once. It measures the stamps' uniqueness, not stamped sessions." },
        { choice: 3, why: "SUM over date stamps adds day-serials together — a giant meaningless number, and the NULLs it silently skips don't save it." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-12",
      prompt: "Keep only each member's latest session: WHERE ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1. What does SQLite actually do?",
      choices: [
        "Returns each member's latest session — windows evaluate before WHERE",
        "Errors — window functions are not allowed in WHERE; number the rows in a CTE or derived table, then filter outside it",
        "Returns all 103 rows, silently ignoring the window predicate",
        "Returns only the globally newest session",
      ],
      answer: 1,
      why: "The logical pipeline runs WHERE before the SELECT list, where windows live — a window reference in WHERE is a compile-time error, not a warning. The fix is staging: number the rows in a CTE, gate in the outer query.",
      notes: [
        { choice: 0, why: "That's the goal, not the behavior — the pipeline order is exactly why the predicate can't sit there." },
        { choice: 2, why: "SQLite refuses loudly; it doesn't silently ignore. The silent failures in this kit live in vocabulary and grain, not here." },
        { choice: 3, why: "Without PARTITION BY the numbering would put 1 only on the global newest row — a different wrong census, and moot: it never runs." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-13",
      prompt: "An engaged-member roster: SELECT customer_id FROM orders WHERE status = 'delivered' UNION SELECT customer_id FROM orders WHERE status = 'shipped'. What changes if UNION becomes UNION ALL?",
      choices: [
        "Nothing — the two surfaces never share a member",
        "Members active on both surfaces could appear twice — UNION ALL skips the dedup UNION performs",
        "UNION ALL errors — set ops require identical aliases",
        "UNION ALL sorts the roster; UNION does not",
      ],
      answer: 1,
      why: "UNION applies distinct-row semantics across both arms; UNION ALL concatenates. The roster's grain is members, so a cross-surface member must collapse to one row — and 'no member overlaps' is an assumption about 16 members, not a guarantee the query makes.",
      notes: [
        { choice: 0, why: "Only safe if no member spans both surfaces — the roster shouldn't depend on an unverified assumption to keep its grain." },
        { choice: 2, why: "Both arms project one column of the same type — the set-op contract is satisfied, and aliases never matter to it." },
        { choice: 3, why: "Neither set op guarantees row order — ORDER BY belongs once, at the end of the compound statement." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-14",
      prompt: "Billing audit: invoice ids that never received a payment row — 6 invoices worth $15,217. SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments works. Why is WHERE id NOT IN (SELECT invoice_id FROM payments) the fragile twin?",
      choices: [
        "NOT IN is slower — same results, different plan",
        "One NULL in the subquery makes every NOT IN comparison UNKNOWN and the audit silently returns empty; EXCEPT's row semantics treat NULLs as comparable, so NULLs can't poison it",
        "EXCEPT ignores NULL rows; NOT IN doesn't",
        "Both raise errors on NULL — the difference is the message",
      ],
      answer: 1,
      why: "NOT IN with a NULL on the right side can never be proven true — the whole predicate goes UNKNOWN and the result set silently empties. EXCEPT compares whole rows under distinct semantics, where NULL equals NULL, so the six unpaid invoices (including paid-status #28 at $1,756.00 with zero payment rows) survive.",
      notes: [
        { choice: 0, why: "The plan isn't the issue — the three-valued logic is. This audit fails loudly in neither case: it just comes back empty." },
        { choice: 2, why: "Backwards: EXCEPT is the NULL-robust one; NOT IN is the operator that breaks." },
        { choice: 3, why: "Neither errors — the NOT IN failure is silent-empty, the worst kind of audit result." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-15",
      prompt: "The 2024 cohort screen needs every session from 2024-01-01 through year end and nothing from 2025. created_at may carry time-of-day. Which predicate is correct even then?",
      choices: [
        "created_at BETWEEN '2024-01-01' AND '2024-12-31'",
        "created_at >= '2024-01-01' AND created_at < '2025-01-01'",
        "STRFTIME('%Y', created_at) = '2024'",
        "YEAR(created_at) = 2024",
      ],
      answer: 1,
      why: "The half-open range [2024-01-01, 2025-01-01) catches '2024-12-31 23:59:59' and everything earlier in the year. BETWEEN with a date-only upper bound excludes any time-stamped moment on Dec 31 — the boundary leak half-open ranges exist to close.",
      notes: [
        { choice: 0, why: "'2024-12-31 14:02:00' > '2024-12-31' as strings — BETWEEN drops the last day's sessions the moment time-of-day exists." },
        { choice: 2, why: "Correct rows, but the column wears a function — the non-sargable shape the dashboard filter avoids." },
        { choice: 3, why: "There is no YEAR() in SQLite — this errors before it can be wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-16",
      prompt: "Average join-to-verified lag reads 2.98 days over the 82 stamped sessions (range 2–4). Which expression produces it?",
      choices: [
        "AVG(shipped_at - created_at)",
        "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at))",
        "CAST(AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) AS INTEGER)",
        "SUM(shipped_at - created_at) / COUNT(*)",
      ],
      answer: 1,
      why: "JULIANDAY converts each stamp to a fractional day serial, so the difference is real days — averaging 2.98 across the 82 stamped rows. String arithmetic coerces each operand to its leading year (2025 − 2025 → 0); CAST AS INTEGER floors 2.98 to 2.",
      notes: [
        { choice: 0, why: "String stamps coerce to their year prefix — every 'gap' reads 0 or 1, never 2.98. Instant verification, confidently wrong." },
        { choice: 2, why: "2.98 floors to 2 — plausible-looking next to the 2–4 range, and quietly wrong by a third of a day." },
        { choice: 3, why: "Same year-coercion trap with a division bolted on — and COUNT(*) divides by 103, not the 82 stamped rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-17",
      prompt: "The dashboard's January-2024 filter must run through the created_at index. Which WHERE clause is sargable?",
      choices: [
        "WHERE STRFTIME('%Y-%m', created_at) = '2024-01'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "WHERE SUBSTR(created_at, 1, 7) = '2024-01'",
        "WHERE DATE(created_at) >= '2024-01-01' AND DATE(created_at) < '2024-02-01'",
      ],
      answer: 1,
      why: "A sargable predicate leaves the bare column on one side of a range comparison so the planner can seek the index. Function-wrapped columns (STRFTIME, SUBSTR, DATE) hide the indexed values and force a scan.",
      notes: [
        { choice: 0, why: "The expression belongs on the literal side; wrapping the column converts an index seek into a full scan." },
        { choice: 2, why: "String surgery on the column — the same non-sargable sin as STRFTIME, with a substring accent." },
        { choice: 3, why: "Right rows, wrong plan — DATE() on the column buries the index exactly the way STRFTIME does." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-18",
      prompt: "7 of 103 sessions were cancelled — the board prints 6.8%. Which expression computes it?",
      choices: [
        "100 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*)",
        "100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*)",
        "COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*) * 100",
        "100 / COUNT(*) * COUNT(*) FILTER (WHERE status = 'cancelled')",
      ],
      answer: 1,
      why: "Integer division truncates the moment it happens: 700/103 → 6, 7/103 → 0, 100/103 → 0. Putting 100.0 on the numerator forces real division first — 6.8 — and the display stays honest.",
      notes: [
        { choice: 0, why: "700/103 integer-divides to 6 — off by nearly a point, printed without ceremony." },
        { choice: 2, why: "7/103 evaluates first and is 0 in integer math — the entire share vanishes." },
        { choice: 3, why: "100/103 evaluates first → 0; multiplication order can't rescue an early truncation." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-19",
      prompt: "A collected-revenue fold: invoices JOIN payments, then SUM(invoices.amount_cents). Five invoices settle across two payment rows each, invoice 25 is a partial (4,000 of 6,148) and void #11 carries a 925.00 payment. What does the fold get wrong?",
      choices: [
        "Nothing — SUM matches the book's paid total",
        "The join fans each split invoice out to two rows, counting its full amount twice — fold payments to invoice grain first, or sum the payment rows themselves",
        "INTEGER cents can't be SUMmed without casting to REAL",
        "SUM(DISTINCT amount_cents) is the required fix",
      ],
      answer: 1,
      why: "One invoice with two payment rows appears twice after the join; its full amount_cents counts twice — the five splits double-book 24,940. Collected value must be folded at invoice grain (21 exact = 65,612, plus the partial 4,000) or read off the payment rows, where each dollar lands once.",
      notes: [
        { choice: 0, why: "The book's 66,443 paid is per-invoice state; the joined SUM inherits the payment-row grain and inflates past it." },
        { choice: 2, why: "Cents sum fine as INTEGER — the bug is relational (grain), not type." },
        { choice: 3, why: "DISTINCT collapses equal amounts across different invoices — it corrupts more than it fixes and is still grain-blind." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-20",
      prompt: "The cadence ladder ranks members by session count: 24, 17, 14, 13, 5, then four members tied at 4, then two at 3. The 5-period member is rank 5. What do the tied-at-4 members get under RANK() vs DENSE_RANK()?",
      choices: [
        "RANK: 5,6,7,8 in member-id order; DENSE_RANK: 6,6,6,6",
        "RANK: 6,6,6,6 with the 3-period members resuming at 10; DENSE_RANK: 6,6,6,6 with the 3s at 7",
        "RANK: 6,7,8,9 — ties fall back to row order",
        "Both: 6,6,6,6 and 7 next — the functions differ only in display",
      ],
      answer: 1,
      why: "Ties share a rank; RANK then skips (6 plus 4 tied rows → the next rank is 10), DENSE_RANK never leaves gaps (next is 7). Neither breaks ties internally — only ROW_NUMBER does, arbitrarily without a tiebreaker.",
      notes: [
        { choice: 0, why: "RANK never enumerates ties — they share one rank. And member-id ordering is ROW_NUMBER's arbitrary game, not RANK's." },
        { choice: 2, why: "RANK has no fall-back ordering; 6,7,8,9 is what ROW_NUMBER prints without a tiebreaker." },
        { choice: 3, why: "The tied rows agree — the difference arrives one row later, and 10 vs 7 is a real discrepancy on a leaderboard." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-21",
      prompt: "A moderation audit note builds each member's session outcomes as a deterministic string — 'cancelled, delivered, pending'. Which GROUP_CONCAT is deterministic?",
      choices: [
        "GROUP_CONCAT(status)",
        "GROUP_CONCAT(status, ', ')",
        "GROUP_CONCAT(status ORDER BY status, ', ') on SQLite >= 3.44 — or rows pre-sorted in a subquery feeding the aggregate",
        "GROUP_CONCAT(DISTINCT status)",
      ],
      answer: 2,
      why: "Concatenation follows row visit order, and the planner owes you no order — the same member can print differently on two runs. ORDER BY inside the aggregate (3.44+) or an explicitly sorted subquery pins the sequence; the separator only formats.",
      notes: [
        { choice: 0, why: "The bare form is the nondeterministic one — the audit note's run-to-run instability is exactly what the reviewer flags." },
        { choice: 1, why: "', ' decides what goes between values, never in what order the values arrive." },
        { choice: 3, why: "DISTINCT dedups values (one outcome each — content changed) and still doesn't order them." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-22",
      prompt: "A running fold over the cadence ladder: SUM(n) OVER (ORDER BY n DESC) with counts ...13, 5, 4, 4, 4, 4, 3... The default frame is RANGE UNBOUNDED PRECEDING AND CURRENT ROW. What prints on the FIRST tied-at-4 row?",
      choices: [
        "Prior total + 4",
        "Prior total + 16 — RANGE includes every peer, so all four 4s enter the frame at once",
        "An error — the frame is invalid with ties",
        "Prior total + 1 — frames always advance one row",
      ],
      answer: 1,
      why: "RANGE frames are value-based: rows tied on the ORDER BY value are peers and ride together, so the running total jumps by the whole tie group (4 × 4 = 16) on each of the four rows. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks row-by-row: 4, 8, 12, 16.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's output — the default RANGE is the surprise." },
        { choice: 2, why: "Valid syntax, valid plan, silently different arithmetic — the most expensive kind of error." },
        { choice: 3, why: "Frames advance by RANGE values, not rows — peers move in packs." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-23",
      prompt: "The engagement census requires every arm to print 0, never NULL. LATAM's 2 sessions are both delivered — its pending arm has nothing to fold. Which arm breaks the contract?",
      choices: [
        "COUNT(*) FILTER (WHERE region = 'LATAM' AND status = 'pending')",
        "SUM(CASE WHEN region = 'LATAM' AND status = 'pending' THEN 1 ELSE 0 END)",
        "SUM(CASE WHEN region = 'LATAM' AND status = 'pending' THEN 1 END)",
        "100.0 * COUNT(*) FILTER (WHERE region = 'LATAM' AND status = 'pending') / COUNT(*)",
      ],
      answer: 2,
      why: "SUM over rows that contribute only NULLs returns NULL — with no ELSE there is nothing to fold. FILTER counts and ELSE-0 sums both bottom out at 0; the bare-THEN arm ships a NULL cell that poisons every rate built on it.",
      notes: [
        { choice: 0, why: "COUNT always returns a number — 0 on an empty match. It passes." },
        { choice: 1, why: "The ELSE 0 is precisely the fix — this arm passes." },
        { choice: 3, why: "Conditional-share arithmetic passes; had it fed from the bare-THEN arm, the NULL would propagate straight through." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-24",
      prompt: "A per-cohort Nitro conversion rate divides boosted members by members — and one cohort's member count is 0. In SQLite, what does x / 0 return?",
      choices: [
        "A runtime error — the query aborts",
        "NULL",
        "0 — the rate reads as nobody converted",
        "Infinity",
      ],
      answer: 1,
      why: "SQLite returns NULL for division by zero rather than raising. House policy makes the guard explicit: NULLIF(denominator, 0) documents the intent, and COALESCE renders 'n/a' at the display edge — the board states the gap instead of shipping a blank nobody can audit.",
      notes: [
        { choice: 0, why: "Other engines raise; SQLite doesn't — the risk is the silent NULL cell, not a crash." },
        { choice: 2, why: "0% conversion is a claim ('nobody converted'); NULL is an absence ('no denominator'). Collapsing one into the other misreports the funnel." },
        { choice: 3, why: "SQLite doesn't produce IEEE infinity here — and an infinity cell is just a louder blank." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-25",
      prompt: "Flag each session above its member's average engagement units. Two forms: (a) a correlated scalar subquery — AVG over orders o2 WHERE o2.customer_id = o.customer_id; (b) a derived per-member fold joined back. What actually differs?",
      choices: [
        "The results — the two forms disagree on which sessions qualify",
        "Only the work: (a) re-evaluates the member average per outer row; (b) folds 16 member averages once and joins — same rows, different cost",
        "Only (a) is legal — derived tables can't carry aggregates",
        "Only (b) respects NULL totals",
      ],
      answer: 1,
      why: "Both compare each session to the same per-member mean; the correlated form recomputes it row by row (fine at 103 rows, a hazard at scale), the derived form folds the 16 members once. Semantics equal, cost different — and a disagreement between them signals a broken correlation, the classic bug.",
      notes: [
        { choice: 0, why: "They agree when the correlated predicate matches the join keys; divergence means the correlation leaked, not that the forms differ." },
        { choice: 2, why: "Derived tables are exactly where aggregates go — you fold, then join. The legality claim is backwards." },
        { choice: 3, why: "AVG skips NULL totals identically in both forms — NULL policy doesn't discriminate between them." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-26",
      prompt: "A roster query: SELECT id FROM orders WHERE status = 'delivered' UNION SELECT id FROM orders WHERE status = 'pending' INTERSECT SELECT id FROM orders WHERE status = 'shipped'. How does SQLite parse it?",
      choices: [
        "(delivered UNION pending) INTERSECT shipped",
        "delivered UNION (pending INTERSECT shipped)",
        "Strictly left to right — set ops have no precedence",
        "It errors — mixing set operators requires parentheses",
      ],
      answer: 1,
      why: "INTERSECT binds tighter than UNION and EXCEPT, so the pending-intersect-shipped arm evaluates first and the delivered arm rides along untouched. The intended (delivered UNION pending) INTERSECT shipped needs explicit parentheses — without them the query runs and means something else.",
      notes: [
        { choice: 0, why: "That's the intended reading, not the parse — precedence silently re-associates the arms." },
        { choice: 2, why: "Precedence governs compound SELECTs the way it governs arithmetic; left-to-right only breaks ties within one operator's chain." },
        { choice: 3, why: "Mixing is legal and runs clean — the danger is that it succeeds with the wrong shape." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-27",
      prompt: "A shortcut replaces JULIANDAY math with bare subtraction: SELECT '2025-03-01' - '2025-02-27' (last ship stamp minus last order stamp). What prints?",
      choices: [
        "3",
        "0",
        "2.98",
        "An error — you can't subtract strings",
      ],
      answer: 1,
      why: "SQLite coerces each operand's leading numeric prefix: 2025 − 2025 = 0. Every date-string 'gap' on this book collapses toward zero because the rows share a century. Only JULIANDAY (or the date functions) computes real day gaps — the 2.98-day average over stamped sessions.",
      notes: [
        { choice: 0, why: "3 is the human answer. SQLite sees year minus year." },
        { choice: 2, why: "2.98 is the JULIANDAY average — this expression never gets within 2.98 of it." },
        { choice: 3, why: "It runs clean — coercion turns '2025-03-01' into the number 2025. That's the trap's teeth." },
      ],
      difficulty: "hard",
    },
    {
      id: "discord-mcq-28",
      prompt: "Book-wide engagement units average 338.19 per session (34,833.28 over 103). A teammate averages the 16 per-member averages instead. What happens?",
      choices: [
        "Same number — an average of averages equals the overall average",
        "A different number: the mean of means weights every member equally, while 338.19 weights every session equally — they coincide only when members carry equal session counts",
        "A syntax error — SQLite refuses nested aggregates",
        "338.19 either way, unless outliers exist",
      ],
      answer: 1,
      why: "338.19 is session-weighted: every one of the 103 sessions contributes equally. The mean of the 16 per-member averages weights every member equally — the 24-period member counts once, same as a one-session member — so whenever cadences differ (they run 1 to 24 here), the two figures diverge. Both compute; only one is the engagement read the board ships.",
      notes: [
        { choice: 0, why: "True only when every member has the same session count — this book spans 1 to 24 periods." },
        { choice: 2, why: "Averaging a derived per-member fold is perfectly legal — the failure is semantic, not syntactic." },
        { choice: 3, why: "'Unless outliers exist' is doing all the work — they always do here; the 24-period member alone outweighs seven one-period members combined." },
      ],
      difficulty: "medium",
    },
    {
      id: "discord-mcq-29",
      prompt: "The cadence board prints each member's gap to previous session; a member's first session has no previous and prints NULL. What's the display policy?",
      choices: [
        "Leave the NULL — users understand blanks",
        "COALESCE the label: 'first session' where the gap is NULL — state the absence, never zero-fill it",
        "COALESCE(days, 0) — zero-fill so columns stay numeric",
        "NULLIF(days, 0) — normalize the zeros",
      ],
      answer: 1,
      why: "COALESCE swaps an absence for an honest label. Zero-filling rewrites 'no previous session' as a 0-day gap — 16 fake zeros that corrupt any downstream average of displayed gaps and every streak read. NULL is a state; 0 is a measurement; the board keeps them distinct.",
      notes: [
        { choice: 0, why: "Blanks export as empty cells the next consumer reads as zero — silence isn't a policy, it's deferred corruption." },
        { choice: 2, why: "0 is a measurement; NULL is an absence. Zero-fill converts one into the other and the gap average quietly drops." },
        { choice: 3, why: "NULLIF zeroes values out — backwards; the board wants a label for the NULL, not more zeros." },
      ],
      difficulty: "easy",
    },
    {
      id: "discord-mcq-30",
      prompt: "Retention cohort 2024-01 = members whose FIRST session falls in 2024-01. The monthly fold says 8 sessions ran that month. What's the cohort size?",
      choices: [
        "8 — one session per member in a cohort month",
        "Not derivable from the monthly fold: 8 counts sessions; the cohort needs each member's first-session month — MIN(created_at) per member, bucketed — then counted",
        "16 — every member debuted in January",
        "The 14-month mean, 103/14 ≈ 7.4, rounds to 8",
      ],
      answer: 1,
      why: "The monthly fold's grain is sessions; the cohort's grain is members gated on their own MIN(created_at). January's 8 sessions can include repeat visits from members who debuted in December, and some January debuts may have run twice that month — the first-touch canon is a different fold entirely.",
      notes: [
        { choice: 0, why: "Sessions ≠ members — repeats and multi-session members break the 1:1 the answer assumes." },
        { choice: 2, why: "Asserted, never derived — the book spans 2024-01 through 2025-02 and debuts spread across it." },
        { choice: 3, why: "Dividing sessions by months is numerology — cohorts come from member-level MIN, not averages of folds." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-discord-3",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The engagement month-close walk",
      brief:
        "Month-close memo, telemetry desk: the engagement close ships as a month-over-month walk — one row per monthly bucket, the book's revenue printed beside its delta against the prior bucket, so the {amber:July cool-off} reads as a number, not a vibe. Probed facts: the **103 open sessions** split into **14 monthly buckets** from 2024-01 through 2025-02; revenue opened at a **3,731.97** January peak, sagged to the **1,193.86** July floor and closed February 2025 at **2,390.53** with zero disconnects. The close carries only buckets clearing the **8-session floor** — a lighter bucket didn't earn a delta — in calendar order, every surviving row kept so the delta chain reads bucket to bucket.",
      ask: "Return each monthly bucket clearing the 8-session floor with its session count, revenue and the MoM revenue delta against the prior bucket, calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR({1}, 1, 7) AS month,\n         COUNT(*) AS sessions,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       sessions,\n       revenue,\n       ROUND(revenue - LAG(revenue) OVER (ORDER BY {2}), 2) AS mom_delta\nFROM monthly\nWHERE sessions >= {3}\nORDER BY month;",
      slots: [
        {
          answer: "created_at",
          kind: "keyword",
          label: "the session clock",
          why: "The bucket clock is the session's created_at — SUBSTR(created_at,1,7) is the house month-bucket shape. shipped_at would bucket by the verification stamp and fold the 21 unstamped sessions into a NULL bucket, shrinking every month's count.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the walk order",
          why: "LAG(revenue) must walk the buckets in calendar order — ORDER BY month inside the window. Ordered by revenue or sessions, the 'previous bucket' becomes an arbitrary neighbor and every delta it prints is fiction.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the bucket floor",
          why: "The memo fixes the floor at 8 sessions — the load a bucket needs to make the close, and the gate is inclusive: a bucket AT 8 survives. The surviving buckets print their 8s as cells; 7 would admit the five seven-session buckets and 9 would keep only the two nines.",
        },
      ],
      distractors: ["shipped_at", "total", "revenue", "sessions", "COUNT(*)", "mom_delta"],
      walkthrough:
        "Stage the buckets, then walk them. The CTE folds orders into one row per month bucket — SUBSTR(created_at,1,7), the house bucket shape — with COUNT(*) as sessions and ROUND(SUM(total),2) as revenue, so the cells land on the probed book: the 3,731.97 January peak and the 1,193.86 July floor. The outer pass keeps buckets at or above the 8-session floor and stamps each with ROUND(revenue - LAG(revenue) OVER (ORDER BY month),2) — the delta chain runs bucket to bucket in calendar order, first row NULL, and the cool-off prints as 1,193.86 beside its MoM delta instead of a bare bar. The floor keeps the six heavy buckets — February's 9 and September's 9, the four 8s — and drops the light tail, each 8 printing as a cell of its own row. The distractors each break a different joint: shipped_at buckets by the verification stamp, dumping the 21 unstamped sessions into a NULL bucket and shrinking every month; total substrs the engagement units into garbage keys; revenue and sessions re-order the window so LAG's 'previous bucket' is an arbitrary neighbor and every delta is fiction; COUNT(*) trips the aggregate guard wherever it lands, and ordering the walk by mom_delta — the very column being computed — is circular and errors before a row prints.",
    },
    {
      id: "cs-discord-4",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The bot-partner load board",
      brief:
        "Partner-review memo, integrations desk: the bot & integration partners (the suppliers table in the declared mapping) each touch open sessions through their Nitro & server-feature SKUs — a four-table chain, partner → SKU → activity batch → session — and the board folds it per partner. Probed facts: **{emerald:Nordic Gadgets AB}** leads the book at **11,130.25** engagement units on **3 listings** at a **4.6** rating, **{sky:Midwest Hardware Co}** follows at **9,294.93** (3 listings, 4.4), and the review floor for the deck is **4,765.63** — a partner at or above it makes the board. Units fold as batch quantity × unit price, sessions count distinct, biggest book first.",
      ask: "Return each partner clearing the 4,765.63-unit floor with its session count, event total and engagement units, biggest book first.",
      template:
        "SELECT s.name,\n       COUNT(DISTINCT o.id) AS sessions,\n       SUM(oi.quantity) AS events,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS units\nFROM suppliers s\nJOIN products p ON p.supplier_id = {1}\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = {2}\nGROUP BY {3}\nHAVING SUM(oi.quantity * oi.unit_price) >= {4}\nORDER BY units DESC;",
      slots: [
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner key",
          why: "The chain anchors on the partner's own key — products.supplier_id = s.id. Anchor on anything else and the chain either fans out (always-true) or goes empty (never-true), and every partner's book is wrong the same way.",
        },
        {
          answer: "oi.order_id",
          kind: "keyword",
          label: "the batch-to-session link",
          why: "Each activity batch hangs off exactly one open session — orders.id = oi.order_id. The link is many-to-one, so the fold multiplies nothing; swap in o.id (always true) and the board re-counts the whole book onto every partner.",
        },
        {
          answer: "s.name",
          kind: "keyword",
          label: "the partner grain",
          why: "The board is one row per integration partner — GROUP BY s.name. Fold per product and the board splits into SKU rows; fold per region and EU's partners merge into one phantom row with a name nobody ships.",
        },
        {
          answer: "4765.63",
          kind: "number",
          label: "the deck floor",
          why: "The memo fixes the review floor at 4,765.63 — Alpine Audio GmbH's book, the smallest partner that makes the deck. The gate is inclusive, so Alpine's own row survives with its units printed as a cell.",
        },
      ],
      distractors: ["s.region", "o.id", "oi.id", "p.name", "o.status", "3613.25"],
      walkthrough:
        "Four tables, one grain, one gate. The chain runs partner → SKU → activity batch → open session, anchored twice: products.supplier_id = s.id and orders.id = oi.order_id — the batch-to-session link is many-to-one, so SUM(oi.quantity * oi.unit_price) folds each partner's book without fan-out and COUNT(DISTINCT o.id) counts each session once no matter how many batches touched it. The probed board: Nordic Gadgets AB 11,130.25 on 3 listings, Midwest Hardware Co 9,294.93, Alpine Audio GmbH 4,765.63 — the HAVING gate at 4,765.63 keeps exactly those three (Andes 3,613.25, Shenzhen 3,049.07 and Pacific 2,980.15 fall under), ordered biggest book first. The distractors each snap a link: s.region or p.name as the anchor key compares numbers to text and empties the board; o.id and oi.id rewire the session link — o.id is always true and re-counts the whole book per partner, oi.id matches batch ids to order ids and prints fiction; p.name or o.status as the fold grain splits or merges partners into phantom rows; and 3,613.25 in the gate waves Andes in — a floor the memo never set.",
    },
    {
      id: "cs-discord-5",
      tier: "easy",
      topic: "s6",
      universe: "catalog",
      title: "The Nitro SKU tier census",
      brief:
        "Catalog memo, monetization review: the Nitro & server-feature SKUs (the products table in the declared mapping) ship in two price tiers and the deck needs the census in ONE pass — one CASE arm per tier, so the bands reconcile to the 16-SKU book by construction. Probed facts: the catalog splits evenly, **8 mid SKUs (50–200) averaging 111.5** against **8 budget SKUs (under 50) averaging 32.06**, and the top SKU prices at **199.99** — the premium band the roadmap keeps promising is empty. Tier edge fixed at **50**: at or above is mid, under is budget. Biggest average first.",
      ask: "Return the two price bands with SKU count and average price, mid arm labeled, budget arm labeled, biggest average first.",
      template:
        "SELECT CASE\n         WHEN price >= {1} THEN {2}\n         ELSE 'budget'\n       END AS band,\n       COUNT(*) AS skus,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY band\nORDER BY avg_price {3};",
      slots: [
        {
          answer: "50",
          kind: "number",
          label: "the tier edge",
          noVerify: true,
          why: "The memo fixes the tier edge at 50 — at or above is mid, under is budget, and the probed split lands 8 and 8. A 60 edge would push the 59.99 speaker into budget and re-cut both averages; 40 would pull the 42.50 stand up into mid.",
        },
        {
          answer: "'mid'",
          kind: "keyword",
          label: "the mid arm label",
          why: "The upper arm prints 'mid' — the facts-file band name. Label it 'budget' and both arms merge into one 16-SKU row; label it 'premium' and the deck claims a band the catalog doesn't have.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the average order",
          why: "Biggest average first per the memo — DESC puts mid's 111.5 over budget's 32.06. ASC ships the deck upside down with the 32.06 band on top.",
        },
      ],
      distractors: ["60", "40", "'premium'", "'budget'", "ASC"],
      walkthrough:
        "One scan, two arms, one reconciliation. The CASE stamps every SKU mid or budget at the fixed 50 edge, GROUP BY folds the two bands, and the census lands on the probed book: mid 8 SKUs averaging 111.50, budget 8 averaging 32.06 — 8 + 8 reconciles to the 16-SKU catalog by construction, and the top SKU at 199.99 is why no premium arm exists to print. ORDER BY avg_price DESC ships mid first. The distractors each break the census: a 60 edge re-cuts the split to 7 and 9 and drags both averages off the probed figures; a 40 edge pulls the 42.50 stand and the 49.00 hub up into mid and does the same from the other side; 'premium' relabels the upper arm into a band the catalog doesn't have; 'budget' collapses both arms into one 16-SKU row and kills the tier split entirely; ASC ships the deck with budget's 32.06 on top — same two rows, wrong story.",
    },
    {
      id: "cs-discord-6",
      tier: "hard",
      topic: "q6",
      universe: "fraud",
      title: "The billing anomaly screen",
      brief:
        "Finance memo, Nitro close sweep: before the ledger tie, the anomalies register gets rebuilt from the billing tables — invoices LEFT JOIN'd to their payment rows so a zero is a COUNT, never a missing row. Probed facts: the **28-invoice** book splits **21 {emerald:paid} / 6 open / 1 {rose:void}**, and the register's two hard anomalies are verified row-level: invoice #28 marked **paid** with **zero payment rows** at **1,756.00**, and invoice #11 marked **void** yet carrying **one payment row** at **925.00**. The screen prints both, biggest exposure first; everything else on the book stays off the register.",
      ask: "Rebuild the anomalies register: return each invoice that is paid with zero payment rows or void with at least one payment row — id, status, billed amount, payment rows, biggest amount first.",
      template:
        "WITH staged AS (\n  SELECT i.id,\n         i.status,\n         ROUND(i.amount_cents / 100.0, 2) AS dollars,\n         {2} AS payment_rows\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT id,\n       status,\n       dollars,\n       payment_rows\nFROM staged\nWHERE {1}\nORDER BY dollars {3};",
      slots: [
        {
          answer: "(status = 'paid' AND payment_rows = 0) OR (status = 'void' AND payment_rows > 0)",
          kind: "keyword",
          label: "the anomaly arms",
          why: "The register has exactly two arms — paid with zero payment rows (#28) and void with at least one (#11). Drop either arm and the register ships half-blind; widen it to payment_rows = 0 alone and the six legitimately-unpaid open invoices get branded anomalous.",
        },
        {
          answer: "COUNT(p.id)",
          kind: "keyword",
          label: "the payment fold",
          why: "LEFT JOIN + COUNT(p.id) counts only real payment rows, so a never-paid invoice reads 0 — the zero is a COUNT, not a missing row. COUNT(*) would count the NULL-extended row itself and turn #28's zero into a one, erasing the anomaly.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "Biggest exposure first per the memo — DESC prints #28's 1,756.00 over #11's 925.00. ASC buries the bigger write-down under the smaller one.",
        },
      ],
      distractors: [
        "status = 'paid' AND payment_rows = 0",
        "payment_rows = 0",
        "status = 'void' AND payment_rows > 0",
        "COUNT(*)",
        "SUM(p.amount_cents)",
        "ASC",
      ],
      walkthrough:
        "Stage, then screen. The CTE LEFT JOINs the 28-invoice book to its payment rows and folds per invoice — COUNT(p.id), not COUNT(*), so a never-paid invoice prints a real 0 — and the dollars cell divides the integer cents at the display edge (amount_cents / 100.0), the house shape for Nitro billing. The outer pass keeps the two register arms — paid with zero payment rows, void with at least one — and the screen lands on the probed anomalies: #28, marked paid, zero payment rows, 1,756.00; #11, marked void, one payment row, 925.00 — biggest exposure first. Everything else stays off: the 6 open invoices are late, not anomalous, and #25's partial (4,000 of 6,148) is a dunning case, not a register row. The distractors each fail differently: either single arm ships the register half-blind; payment_rows = 0 alone brands the six legitimately-unpaid open invoices anomalous; COUNT(*) counts the NULL-extended row and turns #28's zero into a one, erasing the very anomaly the screen exists for; SUM(p.amount_cents) folds dollars into a count column and silently drops the NULL row; ASC buries the 1,756.00 exposure under the 925.00.",
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
    { slug: "game-play-analysis-v", why: "Day-1 retention per join date — the onboarding cohort read: which invite wave came back the day after its first open, the D1 board the community team ships weekly." },
    { slug: "immediate-food-delivery-ii", why: "First-session outcome at scale — what a member's FIRST open became (voice room, text-only, lurk), CTE-staged so the step denominators stay honest." },
    { slug: "immediate-food-delivery-i", why: "The one-pass first-open share — the voice-completed rate on a member's opening session, CASE-arm'd in a single scan." },
    { slug: "average-time-of-process-per-machine", why: "Join-to-verified latency per cohort — the 2.98-day verification window sliced per server, self-join pairing each open with its verified stamp." },
    { slug: "number-of-calls-between-two-persons", why: "Voice minutes between member pairs — the DM-call read: which two members keep a private room alive, folded symmetrically so each pair counts once." },
    { slug: "keep-latest-dedupe", why: "The raw batch-log dedupe — a keep-latest ROW_NUMBER pass so the morning boards fold the clean layer, never the retry-laden raw one." },
    { slug: "reported-posts-ii", why: "The moderation load board — reports per post as a rate with honest denominators, the queue-health read the mod team lives in." },
    { slug: "duplicate-emails", why: "Multi-account detection — duplicate emails across the member table, the moderation screen that runs before any ban wave ships." },
    { slug: "active-users", why: "Consecutive-month actives — the habit ladder across month buckets: who showed up month after month, with the window keys stated, not vibes." },
    { slug: "find-churn-risk-customers", why: "The churn-risk list — members whose last open has gone quiet past the line, anti-join plus date math, the winback team's source list." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Feature-combination screens — members who ran voice AND forums but never streamed, the cross-feature cohort the Nitro pitch targets." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each member's most-used feature — the argmax-per-member read that decides which feature the retention email leads with." },
    { slug: "transactions-per-visit-histogram", why: "The events-per-session histogram with zero buckets printed — a distribution the server-health review ships complete, empty arms and all." },
    { slug: "sellers-with-no-sales", why: "Idle bot partners — integration partners with zero activity in the window, the anti-join the partner review opens with." },
    { slug: "duplicate-charge-pairs", why: "Duplicate Nitro charges — payment rows self-joined inside a window, the billing-fraud pairs finance flags before the close." },
    { slug: "mrr-waterfall", why: "The Nitro MRR waterfall — new, expanded, contracted, churned movement classes per member, LAG-classified so the subscription story reconciles." },
  ],
};
