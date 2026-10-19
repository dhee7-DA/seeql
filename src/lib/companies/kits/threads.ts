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
    "Prep is the same discipline this kit drills: conditional counts over the status map, two-grain censuses with COUNT(*) beside COUNT(DISTINCT customer_id), LAG walks with an honest NULL baseline, and cents-aware reads of the statements table. Pool provenance: company-pools.md carries NO Threads section — **0 tagged rows** — so every topic slug set and all 32 problems below are theme-curated from the theme menu's sql rows (none of the audit-forbidden write/schema topic ids), each tied to a workflow this team actually runs: ramp walks, cohort sticks, activation funnels, and the ad-rail close.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Threads' growth org rehearses most: the two-grain ramp census, the monetization spine walk, the ramp-band tiering, the one-pass fate census with `FILTER`, the velocity ladder cut with `RANK`, and the dunning anti-join that guards the ad-rail close. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: each one narrates the failure a wrong chip causes, which is exactly the muscle the 'how do you know?' follow-up tests.",
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
      slugs: ["year-on-year-growth-rate", "biggest-window-between-events", "week-over-week-churn", "find-churn-risk-customers"],
    },
    {
      name: "Two-grain growth censuses",
      why: "Periods and accounts are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded. The ratio (9.5 versus 5.6) is the intensity read that decides where the loop compounds.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "product-sales-analysis-ii", "sales-analysis-i", "queries-quality-and-percentage", "classes-more-than-5-students", "game-play-analysis-i", "immediate-food-delivery-ii", "combine-two-tables", "confirmation-rate"],
    },
    {
      name: "Activation & funnel rates",
      why: "The fate census is Threads' heartbeat: loop-closed, in-flight, onboarding, dormant — and every rate on top of it is a denominator argument. Trials stay in a conversion base and drop out of a cycle-time base, and the panel wants you to say which before writing SQL. Funnel-step conversion over graph-imported accounts is the exact shape.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "percentage-of-users-attended-a-contest", "first-last-touch-attribution", "ab-test-conversion-lift"],
    },
    {
      name: "Growth accounting & status walks",
      why: "Where did the 103 periods come from and where did they go? New, retained, resurrected, churned — LAG status classification over the period spine is growth accounting, and movement waterfalls (adds minus drops minus dormant) are the monetization story in one query. Plan-migration paths are the same walk with a plan dimension.",
      slugs: ["growth-accounting", "mrr-waterfall", "plan-migration-paths"],
    },
    {
      name: "Cohort retention & stickiness",
      why: "A graph-imported account either loops daily or lapses — DAU/WAU stickiness and rolling 7-day actives are how the loop's health is read, and cohort matrices are how the ramp's monthly vintages are judged. Every one of these is a window or a self-join over the same timestamp spine the walk uses.",
      slugs: ["cohort-retention-matrix", "dau-wau-stickiness", "rolling-7d-actives", "active-users", "net-revenue-retention", "ltv-cac-payback", "winback-recovery", "basket-depth-aov"],
    },
    {
      name: "Velocity leaderboards & tie policy",
      why: "Rank windows with guaranteed ties: the order ladder runs 24, 17, 14, 13, 5 and then FOUR accounts sit at 4 periods each. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — a policy about peer accounts, not syntax. Percentile tiles and RFM bands are the same trio pointed at segmentation.",
      slugs: ["rank-scores", "usage-tier-percentiles", "rfm-segmentation", "customer-placing-the-largest-number-of-orders"],
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
    {
      id: "threads-t9",
      q: "UNION versus UNION ALL — when is the dedupe step correct business logic on a growth board stack, and when is it a silent bug?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and the honest default when the branches are logically disjoint, like the board's loop-closed list (52 periods) stacked over the onboarding queue (14). UNION adds a distinct pass over the combined set, and that pass is a decision, not decoration: correct only when overlapping sources must collapse, a silent bug when duplicates are the signal — a double-ingested engagement period vanishing into the dedupe is an incident the stack just hid. Column discipline still applies: both branches need matching column counts and compatible types, with names taken from the first branch. The opinionated version: default to UNION ALL and reach for UNION only when you can say out loud which duplicated rows you are paying to collapse.",
      tag: "set-ops",
    },
    {
      id: "threads-t10",
      q: "EXCEPT and INTERSECT — which ramp questions do they answer more honestly than a join?",
      a: "Diff and overlap questions. 'Which spine months carried onboarding periods but zero loop-closed periods?' is one SELECT of months with pending rows EXCEPT the months with delivered rows — no join gymnastics, no fan-out, the intent reads off the page. INTERSECT answers the mirror: markets present in both this quarter's cohort list and last quarter's. Two discipline points: set operations deduplicate both inputs first, so EXCEPT silently collapses an internally duplicated feed — if duplicate rows are the anomaly you are hunting, the row-honest tool is a LEFT JOIN … IS NULL anti-join on the full multiset; and both sides must share column count and compatible types. Set-level diffs across snapshots, anti-joins for row-level forensics — knowing which question you are answering is the skill.",
      tag: "set-ops",
    },
    {
      id: "threads-t11",
      q: "Where do conditional aggregates — CASE inside SUM and COUNT — beat writing separate queries for this growth team?",
      a: "Anywhere one scan must produce many lenses. The fate census is the clean example: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) per arm prints 52, 30, 14, 7 from the 103 periods in a single pass — four queries' worth of answers sharing one denominator, and the arms reconcile to COUNT(*) = 103 by construction. The shared denominator is the real prize: activation shares built from sibling CASE branches cannot drift, because the branches partition the same rows. Conditional aggregates also build pivot columns (periods by region, stages by month), enforce zero buckets with an explicit ELSE 0 — LATAM's dormant arm must print 0, not vanish — and let HAVING judge business rules (markets whose dormant share exceeds 8%). FILTER (WHERE …) is the modern twin; SUM(CASE …) is the portable one.",
      tag: "case-when",
    },
    {
      id: "threads-t12",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a growth team?",
      a: "Three concrete buys. Readability: a chain of named steps — monthly, walk, flags — reads like the ramp process instead of a Russian-doll subquery, and each CTE is a natural checkpoint to SELECT from while debugging. Reuse: one CTE feeds several later references in the same statement, so the month fold (SUBSTR the spine, GROUP BY month, SUM revenue) is written once, not three times. Correctness under review: naming a CTE loop_closed_periods forces you to state the definition where the reviewer can see it — this team's census culture is the answer to definitions that drift between decks. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step. When a query spans two grains — the fold and the walk — the CTE stops being style and becomes the only way the next analyst can audit your delta.",
      tag: "ctes",
    },
    {
      id: "threads-t13",
      q: "In a growth review you are asked for 'the activation rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the event (a loop-closed period — status 'delivered', 52 of 103?), the denominator (all booked periods 103, or the 82 stamped — the two definitions give 50.5% and 63.4%, a 13-point spread), the time window (trailing month, or the whole 14-month spine?), and whether onboarding periods belong in the base (they do in a conversion read, they do not in a cycle-time read). Then the discipline move: encode the definition as a named CTE — activated AS (SELECT … WHERE status = 'delivered') — so the SQL IS the definition and the reviewer audits it instead of arguing. Threads' census culture punishes vibes-based definitions; the analyst who says 'activation = delivered periods over booked periods, onboarding included, spine-to-date' owns the room.",
      tag: "metrics",
    },
    {
      id: "threads-t14",
      q: "Money and ratios live in mixed types here — INTEGER cents on the statements, REAL dollars on orders.total. Where do numeric bugs bite, and what is your policy?",
      a: "Three bite points. Scale: invoices.amount_cents = 175600 is $1,756.00, and amount_cents / 100 is integer division — 1,756 flat, cents eaten; divide by 100.0 or convert once at the presentation edge. Ratio truncation: 100.0 * SUM(flags) / COUNT(*) promotes to real arithmetic BEFORE the division — placed after, 6.8% reads 0. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the trial balance prove it — this ledger closes at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A number that survives that chain is a number finance will sign.",
      tag: "numbers",
    },
    {
      id: "threads-t15",
      q: "What makes a ramp query cheap — and which habits keep it cheap as the spine grows past this db?",
      a: "Sargability first: a predicate that compares the bare column to a value can use an index — created_at >= '2024-01-01' AND created_at < '2024-02-01' seeks; SUBSTR(created_at, 1, 7) = '2024-01' wraps the column and scans every row for the same 8 answers. Then the compounding habits: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT * so payloads you never read stop crossing the wire; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question rather than joining first and filtering after. The velocity walk is the example: fold 103 periods to 14 months first, then hang windows off the fold — windows over raw periods recompute per row. These are not micro-optimizations; they are the difference between a standup chart that renders and one that times out while the team watches.",
      tag: "performance",
    },
    {
      id: "threads-t16",
      q: "A booked-value SUM doubles after you join periods to interaction lines. Walk me through diagnosing the fan-out and fixing it.",
      a: "Diagnose by counts: COUNT(*) on orders alone reads 103, on the join to order_items it reads 251 — the jump IS the fan-out, lines multiplying periods at 2.44 per period. Confirm with GROUP BY order_id HAVING COUNT(*) > 1 to see which periods carry multiple interaction lines. The fix depends on the grain you owe the reviewer: for period-grain booked value, aggregate lines to period grain first (SUM by order_id in a CTE), then join — or keep orders alone for the money (SUM(total) = 34,833.28) and count lines separately. For line-grain work, keep the join and count entities with COUNT(DISTINCT o.id) while every ratio states its denominator. The trap to name out loud: SUM(o.total) after the join repeats each period's total per line — the fanned sum prints 103,244.55 against the honest 34,833.28, a clean 2.96-fold overcount that executes without a warning. Pre-aggregate-then-join is the muscle; the before-and-after count is the habit.",
      tag: "joins",
    },
    {
      id: "threads-t17",
      q: "How would you compute a running total or a moving average over the ramp — and where does the frame choice bite?",
      a: "Window frames. Running revenue: SUM(revenue) OVER (ORDER BY month) — the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which accumulates in month order. Moving 3-month average: AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). The expert detail: ROWS vs RANGE matters when the ORDER BY key has ties — RANGE includes peers, so rows tied on the same key enter the cumulative together; harmless on a month spine where months are unique, guaranteed to bite the moment the walk drops to day grain and two periods share a timestamp. Write ROWS when you mean row-by-row. And the boundary row's NULL (LAG on 2024-01) stays NULL — a running total is additive, but the baseline is still a baseline, not a zero.",
      tag: "windows",
    },
    {
      id: "threads-t18",
      q: "The period ladder runs 24, 17, 14, 13, 5, then FOUR accounts tie at 4. Explain RANK, DENSE_RANK and ROW_NUMBER — and who decides.",
      a: "The trio disagrees exactly on ties. RANK shares rungs and skips: the tie block reads 6, 6, 6, 6 and the next distinct count (3) lands on 10 — five phantom rungs the leaderboard honestly reports. DENSE_RANK shares rungs without gaps: 6, 6, 6, 6, then 7 — the tiered view. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which tied account gets the expansion email first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment. The second use of ROW_NUMBER is dedupe: PARTITION BY the natural key, ORDER BY updated_at DESC, keep rn = 1 — the pipeline-retry habit every growth data team needs.",
      tag: "windows",
    },
    {
      id: "threads-t19",
      q: "A correlated subquery computes each account's periods versus the platform mean. Why is it slow, and what do you reach for instead?",
      a: "A correlated subquery references the outer row, so the inner fold (per-account period counts, then an average) re-evaluates once per outer row — 16 re-folds here, thousands on a real feed. The set-based twins: a derived table that folds once (SELECT customer_id, COUNT(*) cnt … GROUP BY customer_id) and a comparison against AVG(cnt) computed over that fold — the 6.4375 platform mean — or a window: AVG(COUNT(*)) OVER () after the fold, one pass. Correlated forms stay acceptable for small per-row gates where the inner query is trivial and indexed. What the interviewer actually grades is whether you name the cost model: correlated = per-row re-execution, derived/window = fold-once. On this db the mean gate clears exactly four accounts — 24, 17, 14, 13 periods — and the same answer should arrive from both shapes before you ship it.",
      tag: "subqueries",
    },
    {
      id: "threads-t20",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — when does each give a different answer on this db, and why does it matter?",
      a: "COUNT(*) counts rows — 103 periods, or 251 interaction lines once you join. COUNT(column) skips NULLs: COUNT(shipped_at) reads 82, and the 21-row gap to COUNT(*) is exactly the unstamped population — 14 onboarding plus 7 dormant — a feature when the gap IS the story. COUNT(DISTINCT column) folds repeats to entities: COUNT(DISTINCT customer_id) turns 45 EU periods into 8 accounts, the two-grain census. The Threads-flavored trap is quoting a number without its grain: after joining order_items, COUNT(*) counts lines, not periods, and SUM(o.total) fans 34,833.28 into 103,244.55. Saying 'one row per what?' for every COUNT — and proving the fold foots — is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "threads-t21",
      q: "Why is NOT IN over a nullable join key dangerous, and what is the NULL-safe replacement?",
      a: "x NOT IN (…, NULL) can never be TRUE: the comparison is UNKNOWN, and NOT UNKNOWN is still UNKNOWN — one stray NULL in the subquery list silently empties the result while the query looks valid. On staging copies where customer_id can arrive NULL from a half-loaded feed, the reactivation list built with NOT IN ships empty and nobody notices. The NULL-proof shape is NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND …) — an existence probe that short-circuits on the first match and never materializes a NULLable list. The mirror habit for value comparisons: = NULL matches nothing (the equality is itself NULL); membership in the NULL set is IS NULL. State the policy per predicate: EXISTS for presence, IS NULL for absence, and never NOT IN over a column that has not been NULL-guarded.",
      tag: "nulls",
    },
    {
      id: "threads-t22",
      q: "How do you bucket the spine into months and cut a month without losing its last night — and why are half-open intervals the professional default?",
      a: "Month buckets: SUBSTR(created_at, 1, 7) on the ISO timestamp yields 'YYYY-MM', and the quiet superpower is that those strings sort in spine order with no date logic. Elapsed days: julianday(shipped_at) - julianday(created_at) — fractional days, the loop-closure clock's 2.98 average over the 82 stamped rows. Period filters: half-open ranges — created_at >= '2024-01-01' AND created_at < '2024-02-01' — because they catch the last second of January with no boundary judgment, compose cleanly at month ends, and never double-count midnight. BETWEEN '2024-01-01' AND '2024-01-31' silently drops everything after midnight on the 31st — and month-end is exactly when windows stamp. The professional tell is stating the boundary policy before writing the WHERE clause; date bugs are boundary bugs, not function bugs.",
      tag: "dates",
    },
    {
      id: "threads-t23",
      q: "The ramp dashboard number moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream number. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of period foreign keys against the account dimension to catch reference-integrity breaks. NULL spikes: COUNT(shipped_at) versus COUNT(*) — a stamp column that went 0% to 40% NULL empties every conditional count built on it. On this storefront that ritual is how the paid-status statement with zero settlement legs (#28) would surface: the label says paid, the legs say nothing. The deliverable is not 'it looks fine' — it is which check passed and when it last ran.",
      tag: "quality",
    },
    {
      id: "threads-t24",
      q: "Walk me through the logical evaluation order of a SELECT — and name the ramp bug each stage explains.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters the groups; SELECT computes output expressions including window functions; ORDER BY sorts; LIMIT cuts. Every classic screen bug is a stage violation: an alias like periods referenced in WHERE (it does not exist yet — SELECT runs later), an aggregate in WHERE (groups do not exist yet — the judgment belongs in HAVING), a filter on LAG() or RANK() output in WHERE (windows run in SELECT — stage the query in a CTE), and the flip side that ORDER BY CAN use SELECT aliases because it runs after them. The ramp walk is the recurring example: you cannot keep 'months with the biggest delta' in the same SELECT that computes the delta — stage the walk, filter outside. Saying the order out loud before writing is the cheapest debugging tool an analyst has, and it is exactly the narration the panel listens for.",
      tag: "pipeline",
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
    {
      id: "threads-mcq-11",
      prompt: "The market map needs the distinct market buckets, not rows. What does `SELECT DISTINCT region FROM customers` return?",
      choices: ["4 rows — EU, APAC, US, LATAM", "16 rows — one per account", "3 rows — the markets with more than one account", "45 rows — one period per market"],
      answer: 0,
      why: "DISTINCT collapses the 16 accounts to their value set: 4 market buckets. LATAM holds exactly one account and still earns a row — a value-set census never drops a category for being small.",
      notes: [
        { choice: 1, why: "16 is COUNT(*) — the row count. DISTINCT folds duplicate regions; the whole point is the collapse." },
        { choice: 2, why: "LATAM's single account makes it easy to forget, and forgetting it is how one-account markets vanish from coverage decks." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-12",
      prompt: "The onboarding-queue pull needs the 14 periods with no window-open stamp. Which WHERE finds them?",
      choices: ["WHERE shipped_at = NULL", "WHERE shipped_at IS NULL", "WHERE NOT shipped_at", "WHERE shipped_at LIKE '%NULL%'"],
      answer: 1,
      why: "NULL is 'no clock yet', not a value: shipped_at = NULL compares against UNKNOWN and matches nothing, silently returning an empty queue. IS NULL is the membership test that finds exactly the 14 unstamped periods.",
      notes: [
        { choice: 0, why: "The equality is itself NULL — the filter empties while looking valid. This is the classic silent-empty bug." },
        { choice: 3, why: "LIKE treats N-U-L-L as text to match; no timestamp contains those four letters. Wrong tool, quiet zero." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-13",
      prompt: "orders has 103 rows; shipped_at (the window-open stamp) is set on 82 of them. What does `SELECT COUNT(*), COUNT(shipped_at) FROM orders` return?",
      choices: ["103, 82", "103, 103", "82, 82", "103, 21"],
      answer: 0,
      why: "COUNT(*) counts every row (103); COUNT(shipped_at) skips the 21 NULL stamps. The 21-row gap IS the unstamped population — 14 onboarding plus 7 dormant — and reading it out loud is the census discipline.",
      notes: [
        { choice: 1, why: "COUNT(column) is not COUNT(*) — NULLs are invisible to it. The stamp column cannot count what was never stamped." },
        { choice: 3, why: "21 is the count of NULLs, which neither function returns. To count them, subtract — or SUM(CASE WHEN shipped_at IS NULL …)." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-14",
      prompt: "The expansion pod wants the quietest market on top. Which query returns LATAM (2 periods) instead of the biggest base?",
      choices: ["ORDER BY periods ASC LIMIT 1", "ORDER BY periods DESC LIMIT 1", "ORDER BY periods DESC OFFSET 1", "LIMIT 1 ORDER BY periods ASC"],
      answer: 0,
      why: "ASC walks the sorted list from the bottom — LATAM's 2 periods. DESC serves the biggest base (EU 45); OFFSET 1 skips past the quietest to the runner-up; and clause order is fixed — ORDER BY must precede LIMIT.",
      notes: [
        { choice: 1, why: "DESC answers the opposite question — EU on top. Sort direction is meaning, not presentation." },
        { choice: 2, why: "OFFSET 1 keeps the sort but skips its first row — you get the second-busiest market, a near-miss that looks right in a screenshot." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-15",
      prompt: "Which shape finds accounts that have never run a dormant (cancelled) period — without losing accounts that match no cancelled row at all?",
      choices: [
        "LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL",
        "LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'cancelled'",
        "INNER JOIN orders o ON o.customer_id = c.id WHERE o.status != 'cancelled'",
        "JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL",
      ],
      answer: 0,
      why: "The status filter lives in the ON clause so unmatched accounts survive with NULL payloads, and WHERE o.id IS NULL keeps only the never-cancelled — 12 of 16 accounts on this db. Filtering the right table in WHERE after a LEFT JOIN kills the NULL rows and silently inner-joins.",
      notes: [
        { choice: 1, why: "That WHERE turns the LEFT into an INNER and returns the complement — accounts WITH a cancelled period. Exactly the wrong list." },
        { choice: 2, why: "INNER JOIN cannot see accounts with zero matches — the population the anti-join exists to name disappears by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-16",
      prompt: "The board stack appends the 14-row onboarding queue under the 52-row loop-closed list; the two populations share zero accounts. UNION or UNION ALL — and why?",
      choices: [
        "UNION — stacked results must always be deduplicated",
        "UNION ALL — the branches are disjoint, so UNION's dedupe pass is paid work that can never fire; keep the raw concatenation",
        "They return the same rows, so the choice is cosmetic",
        "UNION ALL — it also sorts the stack, which UNION does not",
      ],
      answer: 1,
      why: "Disjoint branches make UNION ALL the honest concatenation — 66 rows, no dedupe pass. UNION is a business decision, correct only when overlap must collapse; here it would silently delete future duplicates if the branches ever drift, hiding an incident instead of surfacing it.",
      notes: [
        { choice: 0, why: "Nothing to dedupe — and a dedupe that fires on a re-ingested period HIDES the retry instead of exposing it." },
        { choice: 2, why: "Same rows today, different contract tomorrow. The discipline is naming why duplicates are impossible; the comment is the correctness argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-17",
      prompt: "The market card wants each region's account names folded into ONE cell. Which expression does it?",
      choices: ["GROUP_CONCAT(c.name)", "STRING_AGG(c.name)", "LISTAGG(c.name) WITHIN GROUP (ORDER BY c.name)", "MAX(c.name)"],
      answer: 0,
      why: "SQLite's fold-into-string aggregate is GROUP_CONCAT — one comma-joined cell per region. STRING_AGG and LISTAGG belong to other engines and fail to compile here; MAX returns a real aggregate but keeps only the alphabetically-last name.",
      notes: [
        { choice: 1, why: "Valid in Postgres, not SQLite — the query errors on first run. Know which engine's vocabulary you are speaking." },
        { choice: 3, why: "MAX is the dangerous distractor: it runs, returns one name, and looks like a fold. Silent data loss is worse than an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-18",
      prompt: "Interaction lines band via CASE WHEN quantity >= 3 THEN 'peak' WHEN quantity >= 2 THEN 'steady' ELSE 'light' END. A teammate moves the >= 2 arm ABOVE the >= 3 arm. What happens?",
      choices: [
        "Same output — WHEN arms are interchangeable",
        "The 3-unit peak lines label 'steady' — the first matching arm wins, so the peak tier becomes unreachable",
        "Error — arms must be ordered ascending",
        "Only the 2-unit lines change",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and stops at the first match. With >= 2 first, every 3-unit line is caught as 'steady' before the >= 3 arm is ever tested — the peak tier silently empties while the query runs clean.",
      notes: [
        { choice: 0, why: "The band counts shift — peak reads 0 — and nothing announces it. Exhaustive, ordered arms are the contract." },
        { choice: 2, why: "No syntax rule enforces arm order; the engine cannot know your intent. That is why band order is a review gate, not a style note." },
      ],
      difficulty: "easy",
    },
    {
      id: "threads-mcq-19",
      prompt: "Count the periods opened in January 2024 — all of them, including the last night. Which WHERE survives month-end?",
      choices: [
        "WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "WHERE SUBSTR(created_at, 1, 7) = '2024-01' AND created_at <= '2024-01-31'",
        "WHERE MONTH(created_at) = 1",
      ],
      answer: 1,
      why: "Timestamps carry times: BETWEEN '…01-31' means midnight on the 31st and drops every evening signup. The half-open range [Jan 1, Feb 1) catches the last second, composes cleanly at month ends, and is the boundary policy to state out loud. January 2024 holds 8 periods.",
      notes: [
        { choice: 0, why: "'2024-01-31' is the stroke of midnight — anything stamped later that night vanishes. Boundary bugs, not function bugs." },
        { choice: 3, why: "MONTH() does not exist in SQLite — the query fails to compile. Even elsewhere, a bare month number merges Januaries across years." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-20",
      prompt: "The graph-pairing read pairs each account with its market-mates exactly once. Which join does it?",
      choices: [
        "JOIN customers c2 ON c2.region = c1.region",
        "JOIN customers c2 ON c2.region = c1.region AND c2.id < c1.id",
        "JOIN customers c2 ON c2.region = c1.region AND c2.id != c1.id",
        "JOIN customers c2 ON c2.id = c1.id",
      ],
      answer: 1,
      why: "Same-region match plus a strict id ordering keeps each pair once — EU's 8 accounts yield 28 pairs, not 64. Drop the ordering and every pair appears twice (A-B and B-A); drop the region and every account pairs across markets.",
      notes: [
        { choice: 2, why: "!= removes self-pairs but keeps both directions — the 28 pairs read as 56 and every downstream count doubles." },
        { choice: 3, why: "id = id pairs each account with itself — the degenerate self-join every pairing report ships once by accident." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-21",
      prompt: "The loop-closure clock needs days between created_at and shipped_at. Which pair is right — the honest expression and what the naive DATE() version prints?",
      choices: [
        "julianday(shipped_at) - julianday(created_at); DATE(shipped_at) - DATE(created_at) coerces both timestamps to year numbers and prints 0",
        "julianday(shipped_at) - julianday(created_at); DATE() returns NULL on every row",
        "STRFTIME('%d', shipped_at) - STRFTIME('%d', created_at) — day-of-month difference, correct everywhere",
        "CAST(shipped_at AS INTEGER) - CAST(created_at AS INTEGER) — equivalent to julianday",
      ],
      answer: 0,
      why: "julianday turns TEXT timestamps into fractional day numbers — the loop-closure clock's 2.98-day average over the 82 stamped rows. Text minus text coerces each side to its leading number (2024 − 2024 = 0); %d slices day-of-month and breaks across month boundaries; CAST to INTEGER keeps only the year.",
      notes: [
        { choice: 1, why: "DATE() never returns NULL on valid timestamps — the failure is a silent 0, which is far worse because it reads as same-day closure." },
        { choice: 2, why: "Works within one month, then prints -29 across a boundary. Tests that only exercise January bless it; the spine does not." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-22",
      prompt: "`SELECT c.region, COUNT(*) AS periods … GROUP BY c.region ORDER BY periods DESC` runs fine. Moving `periods DESC` into WHERE — what happens?",
      choices: [
        "Works — SELECT aliases are visible everywhere",
        "Error — the alias is born in SELECT, and WHERE runs before SELECT, so periods does not exist yet",
        "Silently ignores the unknown column and returns every region",
        "Runs but reverses the sort direction",
      ],
      answer: 1,
      why: "Pipeline order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. ORDER BY is the one clause that CAN see SELECT aliases because it runs after them. The aggregate twin — WHERE COUNT(*) — fails for the same stage reason; judging groups belongs in HAVING.",
      notes: [
        { choice: 2, why: "Engines reject unknown columns loudly — the error IS the pipeline lesson, not a quirk to route around." },
        { choice: 3, why: "Nothing executes at all. Wishful stage order is the single most common 'weird database behavior' report." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-23",
      prompt: "The ramp filter WHERE SUBSTR(created_at, 1, 7) = '2024-01' scans all 103 rows. Which predicate returns the same 8 rows but can seek an index on created_at?",
      choices: [
        "WHERE strftime('%Y-%m', created_at) = '2024-01'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "WHERE CAST(created_at AS TEXT) LIKE '2024-01%'",
        "WHERE created_at - '2024-01-01' < 31",
      ],
      answer: 1,
      why: "The half-open range compares the bare column to constants — the only shape an index can seek. Every wrapped-column variant (strftime, CAST, arithmetic) forces a full scan for identical rows; same answer, different plan class.",
      notes: [
        { choice: 0, why: "Identical rows, wrong plan — the classic accidental full scan that shows up the day the spine grows past memory." },
        { choice: 3, why: "created_at - '2024-01-01' coerces the timestamp to a year number (2024 − 2024 = 0), so the predicate is always true — a wrong answer that scans AND lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-24",
      prompt: "The reactivation list wants accounts with zero loop-closed periods, run against a staging copy where customer_id can arrive NULL. Which shape survives the NULLs?",
      choices: [
        "WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE status = 'delivered')",
        "WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')",
        "WHERE customer_id != ALL (SELECT customer_id FROM orders WHERE status = 'delivered')",
        "WHERE customer_id NOT LIKE (SELECT customer_id FROM orders WHERE status = 'delivered')",
      ],
      answer: 1,
      why: "One NULL in the NOT IN list poisons every comparison — x NOT IN (…, NULL) is UNKNOWN forever — and the list silently empties. NOT EXISTS probes row-by-row, short-circuits on the first match, and never materializes a NULLable list. ALL and LIKE are not SQLite vocabulary.",
      notes: [
        { choice: 0, why: "The confident-zero trap: looks valid, returns nothing on a dirty feed, and ships as 'no reactivation targets' — a business decision made by a NULL." },
        { choice: 2, why: "ALL is another engine's keyword; even where it exists it inherits the same NULL semantics as NOT IN." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-25",
      prompt: "Expansion targeting: accounts whose period count beats the platform mean (6.44). The correlated shape re-folds per outer row. The set-based fix is:",
      choices: [
        "Keep the correlated subquery — SQLite caches it automatically",
        "Fold once in a derived table (GROUP BY customer_id), then compare against AVG(cnt) computed over that fold — or AVG(COUNT(*)) OVER () after the fold",
        "Move the subquery into the SELECT list — position changes evaluation cost",
        "AVG(customer_id) over the whole orders table",
      ],
      answer: 1,
      why: "The mean is a property of the per-account fold, not of any single row: compute the fold once, take AVG(cnt) = 6.4375 over its 16 rows, then judge — one pass instead of one re-fold per account. On this db the gate clears exactly four accounts (24, 17, 14, 13 periods) and both shapes must agree before it ships.",
      notes: [
        { choice: 0, why: "No such cache guarantee — the cost model is per-row re-execution, and naming that cost is what the interviewer grades." },
        { choice: 3, why: "AVG of ids is a meaningless number wearing a mean's name — the grain trap one more time." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-26",
      prompt: "The period-health card shows booked value BESIDE interaction-line count per period. A teammate joins orders to order_items and SUMs o.total — the booked column reads high. The fix:",
      choices: [
        "SUM(DISTINCT o.total)",
        "Pre-aggregate lines to period grain (GROUP BY order_id in a CTE), then join — or take the money from orders alone and count lines with COUNT(DISTINCT o.id)",
        "Divide the summed column by 2.44",
        "Join on created_at instead of id",
      ],
      answer: 1,
      why: "The join fans 103 periods to 251 lines and repeats each period's total per line — the fanned SUM prints 103,244.55 against the honest 34,833.28, a clean 2.96-fold overcount with no warning. Pre-aggregate one grain, then join; COUNT(DISTINCT o.id) guards the count at the same time.",
      notes: [
        { choice: 0, why: "DISTINCT totals collapse legitimately-equal period values — still wrong, just differently wrong. Fix the grain, not the symptom." },
        { choice: 2, why: "2.44 is the average fan-out, not a universal divisor — some periods carry 1 line, some 5." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-27",
      prompt: "The ops board wants loop-closed, in-flight, onboarding and dormant counts in ONE row, one scan. Which shape branches the aggregates?",
      choices: [
        "Four separate SELECTs stacked with UNION",
        "COUNT(*) FILTER (WHERE status = 'delivered') … — one scan, four conditional counts, COUNT(*) as the shared denominator",
        "COUNT(status = 'delivered')",
        "GROUP BY status — four rows is one pass too",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is the one-scan conditional count: 52 / 30 / 14 / 7 beside COUNT(*) = 103, all sharing a denominator — the reconciliation identity lives inside the row. SUM(CASE WHEN …) is the portable twin.",
      notes: [
        { choice: 2, why: "COUNT takes one expression and counts non-NULLs — a boolean predicate is a different idiom that reads 103 here, not 52." },
        { choice: 3, why: "Rows are honest but the board card is columnar — reshaping statuses into columns downstream is exactly where censuses drift." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-28",
      prompt: "The period ladder runs 24, 17, 14, 13, 5, then FOUR accounts tie at 4, then two at 3. Under RANK(), what rank do the 3-period accounts carry?",
      choices: ["7", "10", "9", "6"],
      answer: 1,
      why: "RANK shares rungs then skips: the tie block consumes 6, 6, 6, 6, so the next distinct count lands on 10 — the five phantom rungs are the honest leaderboard. DENSE_RANK would say 7; ROW_NUMBER would split the 3s arbitrarily.",
      notes: [
        { choice: 0, why: "That is DENSE_RANK's answer — shared rungs, no gaps. This ladder's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the last consumed rung, not the next one handed out — the off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "threads-mcq-29",
      prompt: "The velocity deck wants only the month with the biggest MoM jump (+1,158.21 into August). Writing WHERE mom_delta = MAX(mom_delta) fails. Why, and what is the shape?",
      choices: [
        "Windows can be filtered in WHERE if wrapped in MAX()",
        "Window output does not exist at WHERE time — stage the LAG walk in a CTE, then filter or sort the staged result in the outer query",
        "Use LIMIT 1 without ORDER BY — SQLite preserves insertion order",
        "Compute the delta inline in WHERE with LAG",
      ],
      answer: 1,
      why: "Windows evaluate in the SELECT stage, after WHERE — the delta is not filterable where it is born. The staged shape (walk CTE, then WHERE delta = (SELECT MAX(delta) …) or ORDER BY delta DESC LIMIT 1 outside) is the pattern, and it survives review because the delta definition lives in one named stage.",
      notes: [
        { choice: 2, why: "Insertion order is not a sort contract — the answer changes with the query plan. The August row must be selected, not assumed." },
        { choice: 3, why: "Same stage violation one level deeper: LAG cannot see the aggregate, and WHERE cannot see the window." },
      ],
      difficulty: "hard",
    },
    {
      id: "threads-mcq-30",
      prompt: "The board card wants the four fate counts as COLUMNS in one row. Which shape builds it?",
      choices: [
        "GROUP BY status",
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) … — one conditional per stage, four columns, COUNT(*) as the fifth",
        "COUNT(delivered)",
        "Four LIMIT 1 queries pasted together",
      ],
      answer: 1,
      why: "Conditional SUMs fold the 103 rows into the 52 / 30 / 14 / 7 column set in one pass, sharing the COUNT(*) denominator — the row reconciles to 103 by construction. FILTER (WHERE …) is the modern spelling of the same move.",
      notes: [
        { choice: 0, why: "Rows, not columns — an honest census in the wrong shape; the card then needs reshaping somewhere drift lives." },
        { choice: 2, why: "COUNT doesn't take a boolean predicate — COUNT(delivered) counts a column named delivered, which does not exist." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-threads-3",
      tier: "easy",
      topic: "s6",
      universe: "growth",
      title: "The ramp-band tiering",
      brief:
        "Threads-flavored brief on the storefront db: the growth board wants the 14-month spine (2024-01 to 2025-02) banded by signup pace before the velocity deck ships — 'peak' months, 'steady' months, and everything else named honestly. Probed figures: 103 periods across the spine; the two 9-period months (2024-02, 2024-09) are the peaks, the four 8-period months (2024-01, -03, -05, -07) are steady, and the remaining eight months run 6-to-7 — the band policy is peak >= 9, steady >= 8, else trough, and the bands must read first-match, in that order.",
      ask: "Return each spine month with its period count and its ramp band (peak / steady / trough), in spine order.",
      template:
        "SELECT SUBSTR(created_at, 1, 7) AS month,\n       COUNT(*) AS periods,\n       CASE\n         WHEN COUNT(*) >= {1} THEN 'peak'\n         WHEN COUNT(*) >= {2} THEN 'steady'\n         ELSE '{3}'\n       END AS ramp_band\nFROM orders\nGROUP BY month\nORDER BY month;",
      slots: [
        {
          answer: "9",
          kind: "number",
          label: "the peak threshold",
          why: "Peak starts at 9 — exactly 2024-02 and 2024-09 clear it. Setting 8 here swallows the four steady months into peak and the band census stops matching the deck; setting 6 or 7 peaks the quiet months and the ramp reads uniformly hot.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the steady threshold",
          why: "Steady is the 8-band — January, March, May and July 2024, four months. Drop it to 7 and the five 7-period months (2024-04, -08, -10, -12, 2025-02) get rebranded steady; the trough tier must keep every month the policy says it keeps.",
        },
        {
          answer: "trough",
          kind: "keyword",
          label: "the else label",
          why: "The ELSE arm is the honest name for 6-and-7 months — eight of the fourteen. Labeling it 'flat' or leaving it '' rebrands the soft months the retro calendar targets; an empty ELSE also prints empty strings instead of a band the board can read.",
        },
      ],
      distractors: ["7", "6", "flat"],
      walkthrough:
        "A census, then a label. GROUP BY month folds 103 periods into 14 monthly buckets via the SUBSTR key, COUNT(*) is the pace number, and the CASE reads like the policy top-down: >= 9 is peak (2024-02, 2024-09 — the two spikes), >= 8 is steady (2024-01, -03, -05, -07), and the ELSE catches the remaining eight months at 6-to-7 periods as trough. First-match matters: swap the two numeric arms and every 8- and 9-period month lands in steady — the peak tier empties with no error anywhere. The bands reconcile by construction: 2 + 4 + 8 = 14 months. The board reads the trough list first — it is the retro calendar — which is why the ELSE label is a real word, not an empty string, and why the thresholds are probed figures, not round-number guesses.",
    },
    {
      id: "cs-threads-4",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Threads-flavored brief on the storefront db: the ops board's funnel card wants the four fate counts in ONE row, ONE scan — loop-closed, in-flight, onboarding, dormant — beside the total, so every share on the card shares a denominator. Probed figures: 103 periods; delivered 52, shipped 30, pending 14, cancelled 7 — the arms reconcile to 103 by construction. The census is per market: EU 45 periods (24 closed / 12 in-flight / 6 backlog / 3 dormant), APAC 37 (21 / 8 / 5 / 3), US 19 (5 / 10 / 3 / 1), LATAM 2 (2 / 0 / 0 / 0) — and LATAM's zero arms must print zeros, not vanish.",
      ask: "Return each region with its period count and the four fate counts as FILTER columns, biggest base first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS periods,\n       COUNT(*) {1} (WHERE o.status = 'delivered') AS loop_closed,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS in_flight,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS backlog,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS dormant\nFROM orders o\nJOIN customers c ON {2}\nGROUP BY c.region\nORDER BY periods {3};",
      slots: [
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the conditional-count keyword",
          why: "COUNT(*) FILTER (WHERE …) branches the aggregate inside one scan — 52 / 30 / 14 / 7 sharing the COUNT(*) denominator. SUM or CASE in that position is a syntax error: the filter clause belongs to the aggregate, and the conditional-SUM twin is a different spelling, not a mix.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the graph edge",
          why: "The join keys each period to its account's market: c.id (account key) to o.customer_id (the account foreign key). c.id = c.id is always true and pairs every period with every account — 1,648 rows instead of 103 — and the census explodes before the fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-base-first direction",
          why: "The board reads the largest base on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the card on LATAM's two periods — a correct query aimed at the wrong end of the funnel, with the zero-armed row leading.",
        },
      ],
      distractors: ["SUM", "CASE", "c.id = c.id", "ASC"],
      walkthrough:
        "One scan, one denominator, four arms. The join attaches every period to its market, GROUP BY region folds 103 rows into four buckets, and FILTER (WHERE …) branches the counts inside the fold: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — with COUNT(*) alongside as the shared denominator, so every share on the card divides sibling cells and cannot drift. The reconciliation identity holds by construction: 24+12+6+3 = 45, and the four arms sum to 103 platform-wide. LATAM's zero arms are the honesty check — a FILTER arm with no matching rows prints 0, not a missing column or a NULL. The distractors fail loudly where they fail at all: SUM or CASE inside the FILTER slot is a syntax error, the degenerate join edge pairs 1,648 rows, and ASC reads the funnel upside down. Four queries would answer the same question with four chances to drift; one scan with shared cells is the census this team ships.",
    },
    {
      id: "cs-threads-5",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The velocity ladder cut",
      brief:
        "Threads-flavored brief on the storefront db: the expansion pod's one-pager opens with the velocity ladder — every account ranked by engagement periods, ties sharing rungs the way the community board publishes them. Probed figures: 103 periods across 16 accounts; the ladder runs Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5, then a FOUR-way tie at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), then a two-way tie at 3 (Farid Nasser, Hiro Tanaka). The published policy is RANK semantics — shared rungs, gaps included — and the cut shows eleven accounts so the tie block's aftermath stays visible.",
      ask: "Return each account with its period count and ladder rank under RANK semantics, busiest first, ties sharing a rung, top eleven accounts.",
      template:
        "SELECT c.name,\n       COUNT(*) AS periods,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY ladder, periods DESC, c.name\nLIMIT {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rungs rank function",
          why: "RANK gives the four 4-period accounts rung 6 together and jumps to 10 for the 3-period pair — gaps included, the published policy. DENSE_RANK would stamp the pair 7 and invent a gapless tier list; ROW_NUMBER would split the tie arbitrarily and hand the expansion email to whichever row the plan read first.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Rung 1 must be the 24-period account, so the window sorts periods descending. ASC crowns the 1-period accounts — a correct query answering the opposite question, and the ladder's whole narrative inverts.",
        },
        {
          answer: "11",
          kind: "number",
          noVerify: true,
          label: "the ladder cut",
          why: "LIMIT 11 shows nine named accounts plus the 3-period pair — the rows where RANK and DENSE_RANK finally disagree (10 versus 7). Cut at 9 and the tie block's aftermath is invisible; cut at 11 and the policy difference is on the page.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "10"],
      walkthrough:
        "A fold, a window, a policy. GROUP BY the account folds 103 periods into 16 rows; RANK() OVER (ORDER BY COUNT(*) DESC) ranks the folded counts: 24 → 1, 17 → 2, 14 → 3, 13 → 4, 5 → 5, then the four-way tie shares rung 6, and the 3-period pair lands on rung 10 — the gap from 6 to 10 is the four consumed rungs, printed honestly. The outer ORDER BY (ladder, periods DESC, c.name) makes the tie block deterministic instead of plan-luck, and LIMIT 11 keeps the disagreement visible: DENSE_RANK would have stamped the pair 7, ROW_NUMBER 9 and 10 — three rank functions, three publications, one policy call. This is why tie semantics are a business decision: the ladder is public, and an arbitrary split is a ranking decided by scan order. The cut matters as much as the function — LIMIT 10 would amputate exactly the row where the policy shows its work.",
    },
    {
      id: "cs-threads-6",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The dunning anti-join",
      brief:
        "Threads-flavored brief on the storefront db: before the close ships, the ad-rail dunning list refreshes — every statement with ZERO settlement legs, because nothing has been collected on them and the follow-up email goes out tonight. Probed figures: 28 statements, 27 payment legs; the anti-join returns 6 statements worth 15,217.00 — Emma Wilson's INV-2025-024 (4,937.00, open), Liam O'Brien's INV-2025-026 (3,562.00, open), Isabella Rossi's INV-2025-027 (2,794.00, open), Hiro Tanaka's INV-2025-028 (1,756.00, PAID — the status that lies), Chloe Dubois's INV-2024-021 (1,295.00), Pedro Alvarez's INV-2024-018 (873.00). The join must preserve the statements no leg ever matched — that is the whole list.",
      ask: "Return each never-settled statement with its account name, statement number, status and billed cents, biggest exposure first.",
      template:
        "SELECT c.name AS account,\n       i.number,\n       i.status,\n       i.amount_cents AS billed_cents\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nJOIN customers c ON {2}\nWHERE p.id {3}\nORDER BY billed_cents {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 unmatched ones a NULL leg payload. INNER JOIN deletes exactly those 6 rows — the anti-join's answer set — including paid-status #28, the anomaly the close exists to expose.",
        },
        {
          answer: "c.id = i.customer_id",
          kind: "keyword",
          label: "the account edge",
          why: "The dunning email needs a name, so statements join their account: c.id to i.customer_id. c.id = c.id is always true and pairs all 6 statements with all 16 accounts — 96 rows of wrong recipients.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-leg test",
          why: "IS NULL keeps the NULL-payload statements — the never-settled six. IS NOT NULL flips the list to the 27 settled legs; p.id = NULL matches nothing and ships an empty dunning run that looks like a clean book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure order",
          why: "Dunning works the list top-down by exposure: 4,937.00 on top, 873.00 last. ASC would start tonight's outreach at the smallest balance — the correct query aimed at the wrong end of the work queue.",
        },
      ],
      distractors: ["INNER", "c.id = c.id", "IS NOT NULL", "ASC"],
      walkthrough:
        "An anti-join, read out loud. The LEFT JOIN keeps every statement; the 22 that carry legs match their payment rows (27 legs — five statements paid in two), and the 6 that carry none survive with a NULL payload, which WHERE p.id IS NULL filters FOR. The account join attaches the name the email needs, and ORDER BY billed_cents DESC lines the work queue up by exposure: 4,937.00 / 3,562.00 / 2,794.00 / 1,756.00 / 1,295.00 / 873.00 — 15,217.00 of never-collected billing. The list's headline is the row the status column would have hidden: #28 says PAID and has zero legs, which is why the census reads evidence (legs), never labels (status). The distractors damage different promises: INNER deletes the answer set; the degenerate edge multiplies recipients; IS NOT NULL inverts the list to the settled 22 statements; ASC starts the night at the smallest balance. Every anti-join is a survival rule — this one survives statements no money ever met.",
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
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain census at month grain — periods beside accounts per spine month, the exact COUNT(*) versus COUNT(DISTINCT …) pairing this kit's market card is built on." },
    { slug: "year-on-year-growth-rate", why: "The ramp walk escalated twelve months — same LAG mechanics, NULL baseline and direction traps, at the offset the annual review reads." },
    { slug: "growth-accounting", why: "New, retained, resurrected, churned — LAG status classification over the period spine is this team's movement waterfall, drilled at practice scale." },
    { slug: "cohort-retention-matrix", why: "Monthly vintages of the ramp judged side by side — the challenge board's cohort read, offset arithmetic over the same 14-month spine." },
    { slug: "dau-wau-stickiness", why: "The loop's daily-versus-weekly engage ratio — stickiness is the health number behind the ramp, and this problem drills the ratio's denominator." },
    { slug: "funnel-step-conversion", why: "Activation-funnel steps over graph-imported accounts — stage-to-stage conversion with the denominator argument this kit's screens escalate into." },
    { slug: "trial-to-paid-funnel", why: "Onboarding-queue (14) to loop-closed (52) conversion — the fate funnel's two ends, and the population-definition drill the panel grades." },
    { slug: "active-users", why: "Consecutive-engagement runs via windows — the loop's streak read, gaps-and-islands over the same timestamp spine the velocity walk uses." },
    { slug: "rolling-7d-actives", why: "Trailing-window actives without collapsing rows — the rolling-census shape behind the growth team's trend lines." },
    { slug: "week-over-week-churn", why: "Dormancy deltas at week grain — the velocity walk at finer resolution, where RANGE-versus-ROWS frame traps start to bite." },
    { slug: "mrr-waterfall", why: "Monetization movement: adds minus drops minus dormant — the ad-rail revenue story in one movement query, the close pack's core chart." },
    { slug: "bank-account-summary-ii", why: "Statement rails in INTEGER cents — card versus wire legs, /100.0 dollar reads. The cents discipline the ad-rail close runs on, drilled at practice scale." },
    { slug: "monthly-transactions-i", why: "Per-month statement legs versus billed — the coverage census at month grain, the same fold the dunning run refreshes nightly." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share-of-base reads with an honest denominator — the activation-rate question in miniature, 50.5% versus 63.4% depending on the base you state." },
    { slug: "spend-histogram", why: "Period-value bands via CASE — the engagement-tier fold the review re-cuts weekly, zero buckets printed not dropped." },
    { slug: "transactions-per-visit-histogram", why: "Lines-per-period as a zero-filled histogram — the 2.44 depth read with its empty buckets printed, the honest-funnel discipline." },
  ],
};
