// Threads — Wave-11 (Task 102), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Growth-loop velocity SQL: the storefront db read as a signup-ramp + monetization sandbox riding the Instagram graph.
// customers = accounts (region = market bucket; the follow graph rides in with the account), orders = engagement/
// monetization periods (delivered = loop-closed and monetized 52, shipped = in-flight with shipped_at as the
// loop-closure stamp 30, pending = onboarding queue 14, cancelled = dormant 7), order_items = interaction lines
// (quantity = interaction units, unit_price = per-unit feature bucket), products = plan SKUs (ad-free passes, boosts,
// creator tools; db category codes = SKU families), suppliers = creator/agency partners, invoices/payments =
// ad-statement rails (card = self-serve ads, wire = managed/agency; finance tables store INTEGER cents, dollar read =
// amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars), expenses = platform opex (the paid
// side of the loop), ledger_entries = GL. Angle kept DISTINCT from twitter (incumbent firehose), snapchat (ephemeral
// sessions) and tumblr (reblog graph): Threads' story is the fastest signup ramp in the db, told via the 14-month order
// spine (2024-01..2025-02), LAG month walks with the NULL baseline, and two-grain censuses (periods vs accounts per
// market — US 19-from-2 intensity 9.5 against EU 45-from-8 at 5.6, platform mean 6.44 with exactly 4 accounts above).
// Pool provenance: company-pools.md carries NO Threads section — 0 tagged rows — so all 10 topic slug sets and all 16
// problems are theme-curated from the theme menu's sql rows (cases run read-only topics j7 + t7 — none of the
// audit-forbidden write/schema/finance topic ids) and say so in brief P4.
// Case briefs quote probed figures from scripts/company-facts.md (monthly spine, region census, coverage census) plus
// this kit's probe-verified walk deltas (+1,158.21 into August, -1,326.87 into November); every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.
// Accent: text-zinc-400 — verified unused by every media sibling (twitter slate-300, snapchat yellow-300, tumblr
// blue-300, youtube/netflix red-400 double-held, medium lime-300, substack orange-300, meta sky-400, …); cross-domain
// hold amtrak is the established per-domain rule.
// NOTE for the wave-11 registry wiring agent: threads is NOT yet in registry COMPANY_META — wire id "threads",
// domainId "media", name "Threads", tagline "Growth-loop velocity on the Instagram graph: ramp, retention, creator
// rollout", accent "text-zinc-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const threadsKit: CompanyKit = {
  id: "threads",
  domainId: "media",
  name: "Threads",
  tagline: "Growth-loop velocity on the Instagram graph: ramp, retention, creator rollout",
  accent: "text-zinc-400",

  brief: [
    "**Threads** is the text-first social app that rides the Instagram graph — every new account imports its follows on day one, which is why the platform owns the fastest signup ramp consumer software has ever run. The product's whole economics are a loop: an account activates, posts into a graph that already knows it, engages, and monetizes through an ad and creator rollout that is being turned on market by market. This kit maps the storefront db onto that world: the 16 customers rows are accounts, the 103 orders are **engagement/monetization periods** worth 34,833.28, and the 251 order_items rows are interaction lines — quantity = interaction units, unit_price = the per-unit feature bucket. The status map is fixed: delivered = {emerald:loop-closed and monetized} (52, 50.5%), shipped = {sky:in-flight on the graph} (30, 29.1%), pending = onboarding queue (14, 13.6%), cancelled = {rose:dormant} (7, 6.8%).",
    "The data org runs three engines off one spine. Growth telemetry owns the ramp: the 14-month order spine (2024-01 to 2025-02) is walked month by month with LAG deltas, because the velocity number the VP reads is the delta column, not the level — the {amber:+1,158.21} jump into August off the 1,193.86 July trough is the shape being defended. Graph analytics owns the two-grain census: EU runs 45 periods from 8 accounts while the US runs 19 from just 2, and *the ratio, not the count, decides where the loop is working*. Monetization owns the ad-statement rails — 28 statements and 27 payment legs in INTEGER cents, where `amount_cents / 100.0` is the only legal dollar read and card legs (16, 37,364.00) mean self-serve while wire legs (11, 32,248.00) mean managed.",
    "Interview screens are census-then-walk, in that order. A loop opens with the two-grain census (45-from-8 versus 19-from-2 — say which column is load and which is coverage), escalates into a rate where the denominator is the whole question (*does an onboarding period count in your activation base?*), then into the month walk where the first row's NULL and the ORDER BY direction are the traps being graded. The strongest candidates state the population before writing SQL: **82 of 103** periods carry the loop-closure stamp, the 14 onboarding rows have no clock yet, and a walk that COALESCEs its baseline to zero has already {rose:lied on slide one}.",
    "Prep is the same discipline this kit drills: conditional counts over the status map, two-grain censuses with COUNT(*) beside COUNT(DISTINCT customer_id), LAG walks with an honest NULL baseline, and cents-aware reads of the statements table. Pool provenance: company-pools.md carries NO Threads section — **0 tagged rows** — so every topic slug set and all 16 problems below are theme-curated from the theme menu's sql rows (none of the audit-forbidden write/schema topic ids), each tied to a workflow this team actually runs: ramp walks, cohort sticks, activation funnels, and the ad-rail close.",
  ],

  dayInLife: [
    "**08:10 —** The day starts on the ramp walk. The growth analyst refreshes the month walk before standup: 14 spine months, prior month beside current, delta rounded — and the first row's NULL must still be a NULL, *because a COALESCE'd zero reads as a crash the product never had*. The fate census has to reconcile out loud — 52 loop-closed + 30 in-flight + 14 onboarding + 7 dormant = **103 by construction** — and any branch that drifts from that identity is the morning's first incident, not a rounding note. If the **2.98-day** loop-closure clock drifts, the onboarding queue gets pulled before the velocity deck ships.",
    "**11:45 —** Midday is the two-grain read. A regional review wants periods beside accounts on one slide — EU 45-from-8 at 5.6 intensity against US 19-from-2 at 9.5 — and the platform gate (**6.44 periods per account, exactly 4 accounts above it**) decides which logos get the expansion pod. The midday deep-dive is the walk argument: growth wants LEAD semantics for the forecast, the close pack wants LAG for the actuals, and the analyst who cannot explain that *DESC on the window flips prior into next* loses the room. Every query goes out twice — once to answer, once with the population spelled out so the delta survives review.",
    "**15:30 —** The afternoon is the close. The ad-rail coverage census refreshes first — **21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00** — before dunning sends a single email; the anomaly list gets walked line by line: a paid-status statement with zero settlement legs (#28, 1,756.00) and a void-but-debited leg (#11, 925.00). Rails split on the way out: card 16 legs at 37,364.00 self-serve, wire 11 legs at 32,248.00 managed. The day ends the way every close does: the ledger must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Signup-ramp pace", what: "New periods per month across the 14-month spine (2024-01 to 2025-02): a 6-to-9 band, peaking at 9 in 2024-02 and 2024-09, bottoming at 6 three times (2024-06, 2024-11, 2025-01). The ramp never flatlines and never explodes — velocity is read from the walk, not the level." },
    { name: "MoM ramp deltas", what: "LAG walk on monthly revenue: biggest jump +1,158.21 into August off the 1,193.86 July trough, biggest drop -1,326.87 into November. The delta column is the velocity number the board reads; the level column is context." },
    { name: "Period fate census", what: "52 loop-closed-and-monetized, 30 in-flight on the graph, 14 onboarding, 7 dormant — 103 by construction. Every stage is a conditional count over a status or timestamp, and the denominator question ('do onboarding periods count?') is the whole interview." },
    { name: "Two-grain market census", what: "Periods beside accounts per region: EU 45 from 8 (5.6 per account), APAC 37 from 5 (7.4), US 19 from 2 (9.5), LATAM 2 from 1. The platform mean is 6.44 with exactly 4 accounts above it — the expansion pod's actual target list." },
    { name: "Loop-closure clock", what: "Period open to loop-closure stamp (created_at to shipped_at) over stamped rows only: 82 of 103, 2.98-day average, 2-to-4 spread. APAC closes fastest at 2.93, LATAM slowest at 3.5 — the population definition ships with the number, because the 14 onboarding periods have no clock yet." },
    { name: "Interaction-line depth", what: "251 interaction lines across 103 periods — 2.44 lines per period, 498 interaction units total, max 3 units on a line. The loop's engagement depth shows up here first: mid-period re-engagement is a new line record, not a new period." },
    { name: "Book concentration", what: "Total booked value 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread; 63.5% of the book sits with accounts spending 3,000-plus lifetime (71.2% above 2,000). Alice Chen alone runs 24 periods worth 7,262.35 — one lapsing graph anchor moves a quarter." },
    { name: "Ad-rail statement coverage", what: "Billed versus settled on 28 statements: 21 exact (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00. Rails split self-serve from managed: card 16 legs at 37,364.00, wire 11 legs at 32,248.00 — against net-30 terms and a 28.4-day average settlement (13 fastest, 84 slowest)." },
  ],

  topics: [
    {
      name: "LAG month walks",
      why: "The 14-month spine is this team's home screen: prior month beside current, delta rounded, first row NULL by definition — the baseline, never a zero. The traps being graded are direction (DESC quietly redefines 'prior' as 'later') and the COALESCE-to-zero lie. Year-on-year shapes and biggest-gap windows ride the same walk mechanics.",
      slugs: ["year-on-year-growth-rate", "biggest-window-between-events", "week-over-week-churn"],
    },
    {
      name: "Two-grain growth censuses",
      why: "Periods and accounts are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded. The ratio (9.5 versus 5.6) is the intensity read that decides where the loop compounds.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Activation & funnel rates",
      why: "The fate census is Threads' heartbeat: loop-closed, in-flight, onboarding, dormant — and every rate on top of it is a denominator argument. Trials stay in a conversion base and drop out of a cycle-time base, and the panel wants you to say which before writing SQL. Funnel-step conversion over graph-imported accounts is the exact shape.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Growth accounting & status walks",
      why: "Where did the 103 periods come from and where did they go? New, retained, resurrected, churned — LAG status classification over the period spine is growth accounting, and movement waterfalls (adds minus drops minus dormant) are the monetization story in one query. Plan-migration paths are the same walk with a plan dimension.",
      slugs: ["growth-accounting", "mrr-waterfall", "plan-migration-paths"],
    },
    {
      name: "Cohort retention & stickiness",
      why: "A graph-imported account either loops daily or lapses — DAU/WAU stickiness and rolling 7-day actives are how the loop's health is read, and cohort matrices are how the ramp's monthly vintages are judged. Every one of these is a window or a self-join over the same timestamp spine the walk uses.",
      slugs: ["cohort-retention-matrix", "dau-wau-stickiness", "rolling-7d-actives"],
    },
    {
      name: "Velocity leaderboards & tie policy",
      why: "Rank windows with guaranteed ties: the order ladder runs 24, 17, 14, 13, 5 and then FOUR accounts sit at 4 periods each. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — a policy about peer accounts, not syntax. Percentile tiles and RFM bands are the same trio pointed at segmentation.",
      slugs: ["rank-scores", "usage-tier-percentiles", "rfm-segmentation"],
    },
    {
      name: "Engagement bands with CASE",
      why: "Bands are CASE-classified everywhere: interaction lines fold into feature buckets, periods into engagement tiers, accounts into spend bands (the 63.5% concentration read is a band fold over lifetime spend). The arms must be exhaustive and ordered — a hole in the CASE is a hole in the ramp story, and a reordered WHEN quietly re-bands the base.",
      slugs: ["the-category-of-each-member-in-the-store", "calculate-special-bonus", "spend-histogram"],
    },
    {
      name: "Nested growth gates",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Expansion targeting is exactly this: which accounts run above the platform's cadence.",
      slugs: ["managers-with-at-least-5-direct-reports", "investments-in-2016", "department-highest-salary"],
    },
    {
      name: "One-pass loop censuses",
      why: "The ops board wants loop-closed, in-flight, onboarding and dormant in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. Histogram folds (buckets of periods per account) are the same one-pass discipline.",
      slugs: ["active-businesses", "count-the-number-of-experiments", "transactions-per-visit-histogram"],
    },
    {
      name: "Ad-statement cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the growth loop meets money. Every dollar read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the rail split (card self-serve versus wire managed) decides who gets the dunning email.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "number-of-rich-customers"],
    },
  ],

  theory: [
    {
      id: "threads-t1",
      q: "Your ramp census joins periods to accounts. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A two-grain census joins periods to accounts: a period with no account is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: accounts with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'shipped' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-engaging accounts — all 16 accounts appear in the period table somewhere — and proving that zero is the analyst's job, because a confident zero you did not verify is how whitespace reports die in review.",
      tag: "joins",
    },
    {
      id: "threads-t2",
      q: "Walk me through the month walk. What does LAG give you on the first spine month, why must it stay NULL, and what does flipping the window's ORDER BY do?",
      a: "LAG(revenue) OVER (ORDER BY month) walks the spine backwards one row at a time, and on 2024-01 there is no earlier row — the result is NULL, and that NULL is the baseline, not a missing value. COALESCE(delta, 0) on the first row is a lie with consequences: zero reads as 'flat month' on slide one, and a zero delta at the spine's head is indistinguishable from a genuine flat month in the middle. Direction is the second trap: the pair (function, order) defines the look, so LAG under DESC reads the NEXT month exactly like LEAD under ASC — every delta flips sign and the 1,193.86 trough suddenly reads as a rally into August. There is a third layer for senior candidates: the default frame with ORDER BY is RANGE, so rows tied on the same sort key enter a running sum together — harmless on a month spine where months are unique, guaranteed to bite the moment the walk drops to day grain. The right answer names the population (13 deltas off 14 months), keeps the NULL, and writes the direction into the query comment.",
      tag: "windows",
    },
    {
      id: "threads-t3",
      q: "The census says 45 periods from 8 accounts in the EU and 19 from 2 in the US. Why do the two columns disagree, and what does each mean to the growth team?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per engagement/monetization period, so an account with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and cadence, accounts measure installed base and coverage. The ratio — 9.5 periods per account in the US against EU's 5.6, on a platform mean of 6.44 with exactly four accounts above it — is the intensity signal that decides whether the loop is compounding inside a small base or spreading across a broad one. The trap that catches candidates is a third grain: join order_items for interaction lines and COUNT(*) silently counts lines, not periods — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the habit the growth board's census slide is built on.",
      tag: "aggregation",
    },
    {
      id: "threads-t4",
      q: "14 onboarding periods have no loop-closure stamp. How do NULLs move through your filters, your averages and your walks — and where does a COALESCE turn into a lie?",
      a: "NULL is 'no clock yet', not zero and not a row you may quietly drop. Filters: status = 'pending' and shipped_at IS NULL are the same 14 rows here, but = NULL as a predicate matches nothing — the equality is itself NULL, and the filter silently empties. Aggregates: AVG skips NULLs, so the loop-closure clock's 2.98-day average is computed over the 82 stamped rows only — the population definition ships with the number, because quoting 2.98 against 103 implies the onboarding rows have a cycle they do not have. Walks: the first spine month's LAG is NULL by definition and stays NULL; COALESCEing it to zero fabricates a flat month, and COALESCEing prev_revenue to zero in the delta turns the baseline row into revenue-minus-zero — a number nobody asked for. The honest moves: IS NULL guards in filters, explicit populations in metric definitions, and NULLs left visible in walk baselines so the reader can see where measurement starts.",
      tag: "nulls",
    },
    {
      id: "threads-t5",
      q: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit before the division, and where do WHERE and HAVING each live in the pipeline?",
      a: "The 100.0 is an arithmetic-type move, not cosmetics: SUM of 0/1 flags over COUNT is integer division in a strict engine, and integer division truncates — the dormant share reads 0 everywhere instead of 6.8 platform-wide and 8.1 in APAC. Multiplying by 100.0 first promotes the division to real arithmetic before any truncation can happen; on this db it is the difference between a churn map and a blank page. Pipeline order is the second half of the question: FROM and JOIN assemble rows, WHERE filters rows before grouping, GROUP BY folds them, HAVING judges the groups, the SELECT projects, and window functions evaluate after the fold — which is why COUNT(*) does not exist at WHERE time and a per-month floor like 'at least 8 periods' must live in HAVING. The Threads-flavored version: a WHERE keeps the spine's rows honest (stamped only), a HAVING keeps the census's groups honest (bases worth reading), and the panel listens for which one you reach for before you type it.",
      tag: "pipeline",
    },
    {
      id: "threads-t6",
      q: "You need the month walk staged before the delta. Derived table, CTE, or correlated subquery — how do you choose, and what does each shape answer when the inner query is empty?",
      a: "Choose by staging need, not fashion. The month fold (SUBSTR the spine, GROUP BY month, SUM the revenue) is a derived table or CTE by construction — you cannot walk months that do not exist yet, so the LAG layer must consume the fold's output. A CTE wins when the fold gets reused or the reviewer needs to read the stages; a derived table wins for a one-shot walk; a correlated subquery is the wrong tool here — it re-runs per outer row and belongs in per-row gates like 'this account's periods versus the platform mean of 6.44'. Empty-inner semantics is where the shapes genuinely differ and where the panel pushes: a scalar subquery returning no row yields NULL (the comparison dies quietly), an IN against an empty set filters everything out (a confident zero), a NOT IN against an empty set passes everything through — three different failures wearing one symptom. On this db the mean gate clears exactly four accounts, and being able to say what the query returns on the day it clears zero is the difference between an analyst and a query typist.",
      tag: "subqueries",
    },
    {
      id: "threads-t7",
      q: "The spine buckets are built with SUBSTR(created_at, 1, 7). Why that and not MONTH(), and when do julianday and strftime each earn their place?",
      a: "SUBSTR(created_at, 1, 7) cuts 'YYYY-MM' out of the timestamp, and the quiet superpower is that 'YYYY-MM' strings sort correctly as text — 2024-11 sorts after 2024-02 without any date logic, which is why the walk's ORDER BY month is safe. MONTH() does not exist in SQLite and would not sort correctly anywhere as a bare number (3 after 11). The trade-off to name: SUBSTR relies on the stored format being zero-padded ISO text, so the query carries a format assumption you should verify once, not per run. julianday() is the other half of the toolkit — it turns TEXT timestamps into fractional day numbers so the loop-closure clock computes shipped_at minus created_at as a real number of days (the 2.98-day average), where DATE() would coerce to a string that arithmetic mangles into nonsense. strftime('%Y-%m', created_at) is the format-aware twin of the SUBSTR slice and earns its place when the bucket key needs to change — weeks, quarters — without rewriting the slice width. Pick one bucket key, state it, and keep it consistent across the deck.",
      tag: "dates",
    },
    {
      id: "threads-t8",
      q: "A paid-status statement shows zero settlement legs and the coverage census still foots. How do you design queries that catch a status that lies?",
      a: "Trust legs over labels. The statement table claims statuses; the payment table is the ledger of record — 28 statements, 27 legs, INTEGER cents, /100.0 to dollars. The coverage census classifies at statement grain by folding SUM(p.amount_cents) per statement and comparing to billed cents: legs equal billed is 'exact' (21 — including the void-but-debited #11 at 925.00, whose one leg matches its billed cents), legs at zero is 'no payment' (6, including paid-status #28 at 1,756.00 — the status that lies), else 'partial' (1 — #25 at 4,000.00 of 6,148.00). The census catches the lie precisely because it never reads the status column. The second habit is reconciliation identities that must hold by construction: the fate census 52 + 30 + 14 + 7 = 103, and the ledger trial balance 181,080 debits against 181,080 credits with delta zero — a branch that breaks the identity is an incident, not a rounding note. State the grain, classify from evidence, and give every headcount a second, independent way to foot.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "threads-mcq-1",
      prompt: "The ramp census needs month keys that sort in spine order. Which expression buckets created_at into 'YYYY-MM'?",
      choices: ["SUBSTR(created_at, 1, 7)", "MONTH(created_at)", "SUBSTR(created_at, 6, 2)", "strftime('%d', created_at)"],
      answer: 0,
      why: "SUBSTR(created_at, 1, 7) cuts the zero-padded 'YYYY-MM' prefix, and 'YYYY-MM' strings sort correctly as text — 2024-11 lands after 2024-02 with no date logic. The whole 14-month walk rides on that property.",
      notes: [
        { choice: 1, why: "MONTH() does not exist in SQLite — the query errors on the first run. Even where it exists, a bare month number sorts 3 after 11 and scrambles the spine." },
        { choice: 2, why: "Characters 6-7 are the day-of-month, not the month — every period in the first week of each month collapses into one bucket and the ramp reads as 31 fake months." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-2",
      prompt: "One row per market must show BOTH the period count and the account count. Which column pair does that?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (EU 45); COUNT(DISTINCT customer_id) folds repeats back to accounts (EU 8). The gap between them — 5.6 periods per account — is the intensity read the expansion pod targets.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL foreign keys — 45 again, since every period carries an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not accounts — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-3",
      prompt: "The fate census reads 52 / 30 / 14 / 7 across 103 periods. Which arm is the 52 — and what is the census's reconciliation identity?",
      choices: ["Loop-closed-and-monetized; branches must sum to COUNT(*) = 103", "In-flight on the graph; branches must sum to the account count = 16", "Onboarding queue; branches must sum to 82 stamped periods", "Dormant; branches must sum to the booked value 34,833.28"],
      answer: 0,
      why: "Delivered maps to loop-closed-and-monetized: 52 of 103 (50.5%). The identity is additive across statuses — 52 + 30 + 14 + 7 = 103 — and a branch that breaks it is an incident, not a rounding note.",
      notes: [
        { choice: 1, why: "In-flight (shipped) is 30, not 52 — and the census sums to 103 periods, not 16 accounts. Mixing grains is exactly the two-grain trap." },
        { choice: 2, why: "82 is the STAMPED count (52 + 30) — the onboarding 14 have no clock. Summing arms to 82 silently drops both the onboarding and dormant populations." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-4",
      prompt: "Dormant share by market: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*). Why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters the query to dormant periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "SUM of 0/1 flags over COUNT is integer division in a strict engine — it truncates toward zero and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-5",
      prompt: "In the month walk, 2024-01 has no prior month, so LAG returns NULL. A teammate writes COALESCE(revenue - prev_revenue, 0) 'to clean up the report'. What actually happened?",
      choices: ["A harmless formatting fix — the delta column now shows 0 for the baseline", "The baseline was fabricated: a zero delta reads as a flat month and is indistinguishable from a genuine flat month mid-spine", "The walk now starts at 2024-02 and the spine lost a month", "The NULL propagated into every later delta and the walk is all zeros"],
      answer: 1,
      why: "The first row's NULL is the baseline — measurement starts here. COALESCEing it to zero puts a fake 'flat month' on slide one that no reader can distinguish from a real flat month like the 6-period troughs. The honest walk keeps the NULL and states the population: 13 deltas off 14 months.",
      notes: [
        { choice: 2, why: "The row is not dropped — it is still there with a 0 delta. The damage is semantic (a fabricated reading), not structural: 14 rows in, 14 rows out." },
        { choice: 3, why: "NULL only lives on the first row — LAG returns real values from 2024-02 on. The walk's other 13 deltas are untouched by the COALESCE." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-6",
      prompt: "Keep only spine months carrying at least 8 signup periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 8, before GROUP BY", "GROUP BY month HAVING COUNT(*) >= 8", "WHERE periods >= 8 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A per-month floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db that gate keeps the six 8-and-9 months (2024-01, -02, -03, -05, -07, -09) and drops the eight 6-and-7 months.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-7",
      prompt: "LEAD(revenue) OVER (ORDER BY month ASC) versus LAG(revenue) OVER (ORDER BY month DESC) — what do these two return?",
      choices: ["Different columns — LEAD always looks forward regardless of sort order", "The same rows — both read the NEXT month; the look direction is a property of the (function, order) pair", "The same rows — both read the PRIOR month", "Only LAG is valid; LEAD cannot be used with an ORDER BY window"],
      answer: 1,
      why: "The pair defines the look. LAG under DESC looks one row back in DESCENDING month order — which is the next calendar month — exactly what LEAD under ASC reads. Flip either half and every delta in the walk changes sign; the 1,193.86 trough reads as a rally.",
      notes: [
        { choice: 0, why: "Sort order is half the definition — a function alone has no direction. This is how 'the walk flipped sign' incidents actually ship: someone reversed the ORDER BY and kept calling it prior-month." },
        { choice: 3, why: "LEAD is a first-class window function and pairs with any ORDER BY. The engine has no opinion about which direction is 'forward' — the sort does." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-8",
      prompt: "A day-grain engagement walk uses SUM(units) OVER (ORDER BY created_at). Two periods share the same created_at second and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at day grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-9",
      prompt: "Payment legs store INTEGER cents. The average leg prints as ROUND(AVG(amount_cents) / 100.0, 2) = 2,578.22. Which variant silently corrupts a per-statement dollars fold?",
      choices: ["ROUND(SUM(amount_cents) / 100.0, 2) — same convention, safe", "ROUND(AVG(amount_cents) / 100, 2) — the bare 100 truncates and every dollar figure drops its cents", "ROUND(SUM(amount_cents) / 100.0, 0) — a display choice, no corruption", "SUM(amount_cents / 100) — integer division per row before the fold"],
      answer: 3,
      why: "amount_cents / 100 inside the SUM is integer division applied per row — each leg truncates its own cents before folding, so a two-leg statement loses up to 2 dollars of cents and the statement total stops reconciling against the ledger's 69,612.00 cash credit. Divide the folded cents once, by 100.0, then round.",
      notes: [
        { choice: 1, why: "AVG already returns a REAL even over integer inputs, so /100 versus /100.0 changes nothing here — the trap is real only when the division happens over INTEGER operands, which is choice 3's per-row form." },
        { choice: 2, why: "ROUND(..., 0) is honest about being a whole-dollar view — coarse, but not silently wrong. The corruption in this question is per-row truncation, not display precision." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-10",
      prompt: "The walk stages a months CTE (SUBSTR + GROUP BY + SUM) and then applies LAG in a second SELECT. A teammate insists LAG must run 'inside' the grouping query. What is the true ordering rule?",
      choices: ["LAG cannot read aggregated values — the CTE is mandatory", "Window functions evaluate AFTER grouping, so LAG can run in the same SELECT as the fold — the CTE is for readability, not correctness", "Window functions evaluate BEFORE grouping, so LAG would see raw rows", "Either order works but the results differ — the CTE version double-counts periods"],
      answer: 1,
      why: "Windows sit late in the pipeline: FROM, WHERE, GROUP BY, HAVING, then windows, then ORDER BY/LIMIT. So SELECT month, SUM(total) AS revenue, LAG(SUM(total)) OVER (ORDER BY month) in one level is legal — the window sees the folded rows. The CTE staging is a readability and reuse choice, not a correctness requirement.",
      notes: [
        { choice: 0, why: "The window reads the SELECT list's aggregate output, which exists after the fold — LAG(SUM(total)) OVER (...) is legal SQLite and the audit-grade one-liner version of the walk." },
        { choice: 2, why: "If windows ran before grouping there would be nothing to aggregate over — the engine would reject the query. The ordering rule is exactly why the one-level version works." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-threads-1",
      tier: "easy",
      topic: "j7",
      universe: "growth",
      title: "The two-grain ramp census",
      brief:
        "Threads-flavored brief on the storefront db: Tuesday's growth board opens with the two-grain market census — engagement periods per market beside the accounts that ran them — because 45 periods from 8 accounts (EU) and 19 from 2 (US) are different growth stories at the same table. Probed figures: 103 periods worth 34,833.28 across 16 accounts; EU 45 periods from 8 accounts worth 15,089.23, APAC 37 from 5 worth 11,605.45, US 19 from 2 worth 7,286.16, LATAM 2 from 1 worth 852.44. The board reads the biggest period base first.",
      ask: "Return each region with its engagement period count, distinct account count and total booked value to 2 decimals, biggest period base first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS periods,\n       COUNT({1}) AS accounts,\n       ROUND(SUM(o.total), {2}) AS book\nFROM orders o\nJOIN customers c ON {3}\nGROUP BY c.region\nORDER BY periods {4};",
      slots: [
        {
          answer: "DISTINCT c.id",
          kind: "keyword",
          label: "the account deduplicator",
          why: "COUNT(DISTINCT c.id) folds repeat periods back to accounts: EU reads 8, not 45. COUNT(customer_id) without the DISTINCT reads 45 — the period count wearing an account label — and the aggregate distractors (SUM, COUNT) error out as misuse, because a fold cannot nest inside a fold.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the book precision",
          why: "The book reports to 2 decimals — EU's 15,089.23 against the 34,833.28 platform total. ROUND(…, 1) prints 15,089.2 and the board's reconciliation against the platform total stops footing.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the graph edge",
          why: "The join keys each period to its account's market: c.id (the account key) to o.customer_id (the account foreign key on the period). o.id = c.id matches only accidental id collisions and the census collapses; c.id = c.id is always true and pairs every period with every account.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-base-first direction",
          why: "The board reads the largest period base on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the deck on LATAM's 2 periods — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "COUNT", "1", "ASC"],
      walkthrough:
        "Two grains in one fold. The join keys every period to its account's market, GROUP BY region collapses to four rows, and the two counts tell different stories at the same time: COUNT(*) reads the period base — EU 45, APAC 37, US 19, LATAM 2 — while COUNT(DISTINCT c.id) folds repeats back to accounts — EU 8, APAC 5, US 2, LATAM 1. The pairing is the growth read: the US runs 19 periods from just 2 accounts (9.5 per account) against EU's 45 from 8 (5.6) — US intensity is concentrated, EU's is broad — and LATAM's 2 periods from 1 account at a 426.22 average is the smallest base with the richest period. Book totals at 2 decimals foot upward to the platform's 34,833.28. The distractors fail honestly: SUM and COUNT in the deduplicator slot are aggregate misuses the engine refuses — a fold cannot nest inside a fold; 1 in the precision slot rounds the book to one decimal so it stops footing; 1 in the graph-edge slot is always true and pairs all 103 periods with all 16 accounts before the fold; ASC opens the board on LATAM.",
    },
    {
      id: "cs-threads-2",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The monetization spine walk",
      brief:
        "Threads-flavored brief on the storefront db: every close, finance walks the 14-month monetization spine — 2024-01 through 2025-02 — as a month-over-month delta, because the ramp's velocity is the delta column, not the level. Probed figures: 103 periods worth 34,833.28 across the spine; July 2024 is the 1,193.86 trough and August recovers to 2,352.07; the deepest single-month drop lands into November 2024 at 1,648.80. The spine's first month has no prior — the baseline walks in as NULL, never zero.",
      ask: "Return each spine month with its revenue, prior-month revenue and month-over-month delta to 2 decimals, in spine order.",
      template:
        "WITH months AS (\n  SELECT {1}(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY 1\n),\nwalk AS (\n  SELECT month,\n         revenue,\n         {2}(revenue) OVER (ORDER BY month {3}) AS prev_revenue\n  FROM months\n)\nSELECT month,\n       revenue,\n       prev_revenue,\n       ROUND(revenue - {4}, {5}) AS mom_delta\nFROM walk\nORDER BY month;",
      slots: [
        {
          answer: "SUBSTR",
          kind: "keyword",
          label: "the month-bucket slice",
          why: "SUBSTR(created_at, 1, 7) cuts the zero-padded 'YYYY-MM' key, and 'YYYY-MM' text sorts in true spine order — the whole walk rides on that. UPPER takes three arguments it does not have and errors; MAX(created_at, 1, 7) is the scalar max of three values and silently buckets by the raw timestamp.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookback",
          why: "LAG(revenue) looks one row back in month order — that is prev_revenue. LEAD looks one row forward and every delta flips sign; SUM over the window returns the running total and the prior-month column starts reading the whole book.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the walk direction",
          why: "The walk is defined on ascending months — prior means earlier. DESC quietly redefines prior as later: the deltas flip sign and the November trough reads as a rally. The spine's first row is 2024-01 only under ASC.",
        },
        {
          answer: "prev_revenue",
          kind: "keyword",
          label: "the delta subtrahend",
          why: "mom_delta is revenue minus prev_revenue. Subtracting revenue from itself zeroes the column and the ramp reads flat; subtracting month coerces '2024-02' into 2024.0 and prints a nonsense number nobody can reconcile.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the delta precision",
          why: "Deltas report to 2 decimals — -122.33 into February, +1,158.21 into August. One decimal drops the cents the close reconciles against the monthly ledger, and 1,158.2 does not match the close pack.",
        },
      ],
      distractors: ["LEAD", "SUM", "MAX", "DESC", "1"],
      walkthrough:
        "Stage the spine, then walk it. The months CTE buckets 103 periods into 14 months with SUBSTR(created_at, 1, 7) and folds SUM(total) at 2 decimals — 3,731.97 in January down to the 1,193.86 July trough and back up to 2,390.53. The walk CTE layers LAG(revenue) OVER (ORDER BY month ASC): 2024-01 enters with NULL prev_revenue — the baseline, not a zero — and every later row carries the month before it. The delta column is revenue minus prev_revenue at 2 decimals: -122.33 into February, -992.56 into March, then the story the board actually reads — +1,158.21 into August off the trough, +763.97 into September, the deepest drop -1,326.87 into November, +721.03 into the spine's last month. Distractor damage: LEAD or a DESC window redefines 'prior' as 'later' and every delta flips sign; SUM turns the prior-month column into a running total; MAX turns it into a running high-water mark; revenue minus itself zeroes the walk; 1 decimal drops the cents the close reconciles on. The NULL first row is the definition check the panel listens for.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-period interaction-line revenue is the monetization pod's first chart — fold line records to SKU grain and rank. This problem drills the exact fold the feature-bucket report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Plan-SKU revenue beside units sold is how the rollout page gets defended — 498 interaction units across 251 lines is this problem's shape at db scale." },
    { slug: "queries-quality-and-percentage", why: "Loop quality reads as a ratio with a stated denominator — average clock days beside a percentage of stamped periods. Same division-discipline drill, Threads flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in expansion targeting — which accounts carry at least N periods, which months clear the 8-period ramp bar. This problem drills the group-level gate." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period account (Alice Chen, 7,262.35) is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "game-play-analysis-i", why: "First touch per account — the day the graph import went live — anchors every ramp cohort Threads builds. MIN-over-grouping is the shape." },
    { slug: "immediate-food-delivery-ii", why: "Share of loop closures stamped inside the promised window versus late — the activation-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "combine-two-tables", why: "Accounts LEFT JOINed to periods: the whitespace read. An account with no period is whitespace, a period with no account is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Graph-import signals arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. This drills the activation-funnel denominator." },
    { slug: "find-churn-risk-customers", why: "Dormancy risk is an anti-join over recency — accounts with no recent engagement against a dated cutoff. The same shape drives the re-activation calendar for the 7 dormant periods." },
    { slug: "net-revenue-retention", why: "NRR is the metric the growth board actually manages — cohort revenue walks with expansion and dormancy netted. This problem is that walk at practice scale." },
    { slug: "ltv-cac-payback", why: "The loop's unit economics — lifetime value against the paid acquisition that feeds it (the 4,570.00 Ads line) — is payback math over cohort folds, exactly this problem's shape." },
    { slug: "winback-recovery", why: "Dormant-to-active recoveries are the ramp's cheapest wins — LAG status transitions with a winback window, the re-activation story in one query." },
    { slug: "first-last-touch-attribution", why: "Every account arrives with an Instagram-graph first touch — first and last touch attribution over the event spine is how the loop's entry points get ranked." },
    { slug: "ab-test-conversion-lift", why: "The rollout is one long experiment — activation lift between feature-on and feature-off markets is a two-population rate comparison, this problem's exact shape." },
    { slug: "basket-depth-aov", why: "Interaction depth 2.44 lines per period beside the 338.19 average period value — the depth-and-value pairing the engagement review opens with, drilled at practice scale." },
  ],
};
