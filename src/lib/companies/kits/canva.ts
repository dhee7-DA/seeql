// Canva — kit 14 of the SaaS & Enterprise domain (Batch L, wave 7).
// Design-SaaS SQL: the storefront db read as a design-team ledger —
// customers are design teams, orders are design cycles (delivered =
// published, shipped = exported and awaiting review, pending = still
// drafting, cancelled = abandoned), shipped_at = the publish/export stamp,
// order_items = template-use lines, products = template SKUs (price =
// pro-tier list), suppliers = content partners, regions = team cohorts.
// Invoices/payments are team billings in INTEGER cents (/100.0). Angle:
// template adoption, team collaboration depth, education-vs-pro tiers,
// engagement depth.
// Pool provenance: Canva carries 0 tagged pool rows in company-pools.md —
// all 77 sql slugs in this kit (45 topic + 32 problem) are theme-curated
// from the theme menu (the menu's ltv-cac-payback row does carry a Canva
// tag — it leads the problem list) and say so. Case briefs quote probed
// figures from scripts/company-facts.md (probed 2026-10-12), re-probed per
// slot against db/custom.db; every case slot is mechanically verified by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const canvaKit: CompanyKit = {
  id: "canva",
  domainId: "saas",
  name: "Canva",
  tagline: "Design SaaS: teams, templates and usage",
  accent: "text-fuchsia-300",

  brief: [
    "**Canva** is design SaaS at consumer scale: templates that pull teams in, collaboration that keeps them, and usage that either deepens or goes dark. The analytics reality is the *adoption ledger* — which teams keep publishing, which templates actually get used, and which drafts silently die. On this storefront db the mapping is honest: 16 design teams generate 103 design cycles folded from 251 template-use lines, worth 34,833.28 of billed value at a 338.19 average. The engagement mix reads like the adoption funnel it is — 52 {emerald:published} (50.5%), 30 exported-awaiting-review (29.1%), 14 {amber:still drafting} (13.6%), 7 {rose:abandoned} (6.8%).",
    "The data org splits three ways. Adoption analytics owns the template fold: the top family logs **97 uses** worth 11,744.01, the broadest family's lines touch 54 distinct cycles — gallery decisions price on that census. Growth owns engagement depth: the cycle ladder runs 24, 17, 14, 13 deep before a four-way tie at 4, and **63.5%** of billed value sits above the 3,000 line — the expansion cohort every board deck prices. Monetization owns the tier ladder: 8 education-friendly templates average 32.06, 8 pro templates average 111.5, and the premium band above 200 is empty — the catalog ceiling is 199.99, so tier memos state the ceiling honestly. Billing owns the team book: 28 `invoices` against 27 `payments`, INTEGER cents throughout, with 6 never-settled bills worth 15,217 — one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it.",
    "Interview style is census-then-denominator, then the template join. A screen opens with a two-grain census (EU carries 45 design cycles from just 8 teams; the US, 19 from 2), escalates into a conditional-count publish rate with the denominator asked out loud ('do {rose:abandoned} cycles sit in your base?'), then the family board — where uses and uses-times-list-price must both appear, because 'the gallery is popular' means nothing until uses price into value. Follow-ups probe the month spine (2024-01 opens at 8 cycles and **3,731.97** of billed value; 2024-07 floors at 1,193.86) and the cents rule on every team bill.",
    "Preparation strategy: the pools carry **0 tagged rows for Canva** — every one of this kit's 46 slugs is theme-curated to known design-SaaS screens: two-grain team censuses, template-family folds, adoption floors, tier banding and team-billing reconciliation. Then run all six case studies on the live db: one rebuilds the template-variety board the growth review runs on Mondays, the other rebuilds the one-pass family census the catalog review is drawn from, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
    "The expanded screens push past folds into the **time and shape** tools. Windows run the adoption spine: `LAG` month deltas across the 3,731.97-peak / 1,193.86-floor walk, running totals that accumulate to 34,833.28, quartiles over the seven-family gallery — with the frame question attached (RANGE's peer-inclusion versus ROWS' hard row count). Set ops stack the boards: the 52 {emerald:published} and 30 exported censuses ride a `UNION ALL` pair, and `EXCEPT` finds the teams active one month and silent the next. Subquery shapes get the same drill: scalar comparisons against the 338.19 account mean, `NOT IN` lists a single NULL silences, correlated per-cohort reads. *The panel is not collecting syntax — it is watching whether the shape matches the question's grain.*",
    "The new KPI definitions are graded like syntax, so learn them cold. The {emerald:template-to-publish funnel} is created → stamped → published — 103 → 82 → 52 — and every stage rate names its denominator out loud. {sky:Team-seat expansion} reads the depth ladder (24, 17, 14, 13, then four teams tied at 4): expansion is movement up the ladder, not new logos. The {amber:print attach rate} has no print table on this db — the honest proxy is family fan-out (the Accessories family touches 54 of 103 cycles), named as a proxy in the memo. {violet:Free-to-paid conversion} prices the tier split — 8 education-friendly templates at 32.06 average against 8 pro at 111.5, ceiling 199.99 — and guards its empty-cohort divisions with `NULLIF`. *Definitions first, SQL second — the panels ask for the metric before they ask for the query.*",
  ],

  dayInLife: [
    "**08:40 —** The morning starts on adoption health. A product analyst opens the gallery dashboard before the growth standup: did last night's exported cohort clear its review queue, does the {emerald:published} count (52 of 103) reconcile with what team billing invoiced, and did any cohort's abandon share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — publish counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:30 —** Midday is template surgery. The gallery review wants the family board refreshed — use lines folded from `order_items`, uses and uses-times-list-price side by side, gated to real adoption floors and ranked heaviest-first: the crown family at **97 uses / 11,744.01**, the broadest touching 54 distinct cycles. A regional lead wants the two-grain census re-cut (EU: 45 cycles from 8 teams — intensity 5.6); a catalog owner wants variety and volume separated, because 'the team is busy' means nothing until lines split into distinct templates. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**16:15 —** The afternoon tilts toward the tier memo and the writeup that keeps tomorrow's numbers defensible. The education-vs-pro review walks the price ladder — 8 budget templates at 32.06 average against 8 pro templates at 111.5, with the honest sentence that nothing prices above the 199.99 ceiling — and billing close walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected worth 15,217 — asking *do the classes sum back to the invoice base?* The anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the {rose:void} bill with one (#11, 925.00) — and the ledger tie prints 181,080 = 181,080. The rhythm to internalize: Canva SQL exists to prove that adoption, engagement and billing agree — *the template-use line and the team invoice are the same story told at two grains.*",
    "**18:20 —** The writeup hour closes the loop. Three boards ship reconciled — the gallery census, the regional stamp-speed verdict, the AR anti-join — each with its denominator printed beside the number; the AR read's 6 unsettled bills worth 15,217 carry a footnote naming the {rose:paid ghost} (#28, 1,756.00) so nobody re-litigates it at tomorrow's standup. The ledger tie prints 181,080 = 181,080 and *that sentence ships inside the doc*, because a close that doesn't prove balance is a claim, not a close. The last pass is tomorrow's defense: `LAG` deltas re-run on the month spine, the NULL policy restated — {amber:pending} stays out of latency, `IFNULL` stays out of averages — and the open question ('is the US cohort's 3.07 drift or noise?') is written as a question, not a finding. *End every day one query ahead of the meeting that will ask for it.*",
  ],

  metrics: [
    { name: "Publish rate", what: "Published ÷ ALL design cycles: 52 of 103 (50.5%). The denominator is the interview — 52 of 89 engaged cycles is a different metric with a different name." },
    { name: "Template adoption crown", what: "Use lines joined to the catalog: the top family logs 97 uses worth 11,744.01; the broadest family's lines touch 54 distinct cycles. Gallery decisions price on this fold." },
    { name: "Two-grain team census", what: "Cycles AND teams per cohort — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Load versus audience in one query." },
    { name: "Time-to-publish", what: "Days from cycle start to publish/export stamp: 82 of 103 cycles stamped, avg 2.98, range 2-to-4 — US cohort slowest at 3.07, APAC fastest at 2.93." },
    { name: "Engagement-depth ladder", what: "Cycles per team: 24, 17, 14, 13, 5, then four teams tied at 4. Depth is the adoption pipeline — the ladder growth reviews every Monday." },
    { name: "Design-value concentration", what: "Share of billed value from the deepest teams: 63.5% above the 3,000 line, 71.2% above 2,000. Where seat-expansion revenue actually lives." },
    { name: "Education-vs-pro tier ladder", what: "8 budget templates average 32.06; 8 pro templates average 111.5; the premium band above 200 is empty at the 199.99 ceiling. Tier memos state the void honestly." },
    { name: "Unsettled team AR", what: "Bills with no payment rows: 6 worth 15,217 — one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the dunning cycle runs on." },
    { name: "Export review backlog", what: "Stamped-but-unreviewed cycles: 30 of 103 (29.1%) carry a publish/export stamp awaiting team sign-off. The queue the review pod burns down — and a population that sits INSIDE every latency average while still counting as un-published." },
    { name: "Draft stall share", what: "Cycles still drafting: 14 of 103 (13.6%) — no stamp, no review, no billed value yet. The top-of-funnel leak; a climbing stall share means templates are being opened and abandoned before export." },
    { name: "Settlement mix", what: "28 team bills classified by settlement rows: 21 exact, 1 partial (4,000 of 6,148), 6 with nothing — 16 settled by card, 11 by wire. The classes must sum back to the invoice base or the close is wrong." },
    { name: "Repeat-team share", what: "14 of 16 teams run more than one design cycle (only 2 one-time accounts). Depth over logos: the ladder 24 / 17 / 14 / 13 / 5 with four teams tied at 4 is where seat-expansion revenue actually lives." },
  ],

  topics: [
    {
      name: "Adoption censuses & floors",
      why: "Every Canva screen opens with a fold: use lines, design cycles, teams — grouped, counted and gated without letting the grain blur. COUNT(*) counts lines, COUNT(DISTINCT customer_id) counts teams; 251 lines come from just 103 cycles across 16 teams, and HAVING floors decide which families or teams are 'real adoption'.",
      slugs: ["article-views-ii", "classes-more-than-5-students", "activity-participants", "customers-who-bought-all-products", "active-users"],
    },
    {
      name: "Publish-rate conditional counts",
      why: "Published, exported, drafting, abandoned — every rate here is a conditional count over an engagement state, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL cycles, with the 100.0 before the division, is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-i", "friend-requests-i-overall-acceptance-rate", "get-highest-answer-rate-question", "trial-to-paid-funnel", "email-engagement-funnel", "analyze-subscription-conversion", "occupations-pivot"],
    },
    {
      name: "Joining teams to design cycles",
      why: "Design cycles inherit team attributes through joins to the teams table, and the join type decides who survives: a cycle with no team is corruption; a team with no cycle is an idle seat. Choosing INNER versus LEFT is a business statement about the installed base.",
      slugs: ["combine-two-tables", "top-travellers", "product-sales-analysis-i", "viewers-turned-streamers"],
    },
    {
      name: "Per-template value folds",
      why: "Use lines carry template SKUs and list prices, and the gallery story is a join-then-weigh fold: quantity × unit_price per line, the top family logging 97 uses worth 11,744.01. The per-family census is what gets a template featured, repriced or retired.",
      slugs: ["product-sales-analysis-iii", "products-worth-over-invoices", "average-selling-price", "feature-adoption-windows"],
    },
    {
      name: "The design calendar",
      why: "Design activity is calendar arithmetic: STRFTIME('%Y-%m') buckets over cycles against the 3,731.97 peak and the 1,193.86 floor. Canva drills the month-bucket idiom because every launch chart hangs on that spine — and a '%m'-without-year fold merges two Januaries into one lie.",
      slugs: ["monthly-transactions-i", "user-activity-for-the-past-30-days-i", "the-latest-login-in-2020", "cohort-retention-matrix", "median-time-to-convert", "plan-migration-paths"],
    },
    {
      name: "Engagement depth & variety",
      why: "Collaboration is a two-sided read: cycles per team (depth) against distinct templates per team (variety). The shapes here — lines per cycle, templates per team, depth-versus-breadth ratios — separate the teams that deep-dive one template from the teams exploring the whole gallery.",
      slugs: ["students-and-examinations", "find-the-team-size", "user-activity-for-the-past-30-days-ii", "ltv-cac-payback", "basket-depth-aov", "ab-test-conversion-lift"],
    },
    {
      name: "Dormant teams & abandoned drafts",
      why: "Silence reads are anti-joins: teams with no recent cycle, team bills with no payments (6 on this db). On this db the never-used-team anti-join returns 0 — and proving a confident zero is the job. The survival rule of the join IS the query.",
      slugs: ["customer-who-visited-but-did-not-transact", "customers-who-never-order", "dormant-reactivation", "winback-recovery", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Adoption leaderboards & tie policy",
      why: "Growth boards rank teams by cycle depth and templates by uses, and ties are real: four teams sit at exactly 4 cycles. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "top-earners", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Education-vs-pro tiering",
      why: "The catalog splits into education-friendly and pro tiers by price, and every tier memo is a CASE band with the boundaries stated out loud. The honest wrinkle: the premium band above 200 is empty — the ceiling is 199.99 — so tiering work is about proving a band's void, not inventing one.",
      slugs: ["the-category-of-each-member-in-the-store", "the-winner-university", "calculate-special-bonus", "funnel-step-conversion", "dau-wau-stickiness", "rfm-segmentation", "usage-tier-percentiles"],
    },
    {
      name: "Team billing & cents discipline",
      why: "Design usage is not revenue until the team book closes: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where design-SaaS interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "account-balance", "net-revenue-retention"],
    },
    {
      name: "Window frames & running math",
      why: "Expansion reads are temporal: running billed value down the 14-month spine, 7-day rolling publish curves, LAG deltas against the 3,731.97 peak. Frames decide what each row's window sees — the default RANGE frame silently includes peers, and a tie in the ORDER BY column double-counts rows into every running total. Canva drills ROWS versus RANGE because an expansion walk that absorbs a peer month is a number the board repeats for a quarter.",
      slugs: ["restaurant-growth", "find-cumulative-salary-of-an-employee", "rolling-average-steps", "growth-accounting", "repeat-purchase-rate", "rolling-7d-actives", "sessionize-events", "mrr-waterfall", "week-over-week-churn"],
    },
    {
      name: "Set-op boards",
      why: "Two censuses, one board: published (52) and exported-awaiting-review (30) fold into stacked reports, and the stacking op is a business statement. UNION ALL keeps both arms and any accidental overlap; UNION dedupes and hides the overlap — the difference between an auditable stack (82 stamped rows) and a quietly collapsed one. EXCEPT and INTERSECT answer the movement questions: which teams were active last month but silent this one.",
      slugs: ["monthly-transactions-ii", "league-statistics", "count-salary-categories", "keep-latest-dedupe"],
    },
    {
      name: "Subquery shapes",
      why: "Screens escalate from folds to comparisons: which design cycles price above the 338.19 account average, which templates clear their family's mean, which teams carry any abandoned cycle. Each shape — scalar, IN, EXISTS, correlated — carries its own population and its own cost, and the NOT IN version dies silently when the inner fold returns one NULL. Choosing the shape is choosing the question's population; the syntax is the easy part.",
      slugs: ["orders-with-maximum-quantity-above-average", "second-highest-salary", "managers-with-at-least-5-direct-reports", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Catalog text hygiene",
      why: "Template names arrive messy — casing drifts, spacing rots, SKU labels grow suffixes — and every GROUP BY on a text column inherits the mess as phantom families. The text toolkit (UPPER/LOWER, TRIM, REPLACE, SUBSTR, INSTR) is data-quality work: normalize before folding so the gallery census doesn't split one family into three. Email-domain extraction from team-owner addresses is the same muscle at a different column.",
      slugs: ["fix-product-name-format", "invalid-tweets", "find-all-unique-email-domains"],
    },
    {
      name: "Date math & freshness",
      why: "Freshness reads are date arithmetic: which teams published within seven days of their invite, which cycled the day after a template launch, which weekday the gallery moves on. The traps are arithmetic-shaped — 'date minus date' on TEXT columns coerces to zero, and '+7 days' modifiers chain differently than people expect. On a db where latency averages 2.98 days, a wrong date idiom doesn't error — it prints a confident zero.",
      slugs: ["rising-temperature", "users-with-two-purchases-within-seven-days", "tasks-count-in-the-weekend", "find-zombie-sessions"],
    },
  ],

  theory: [
    {
      id: "canva-t1",
      q: "Your dormant-teams report joins design teams to their design cycles. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An activity report joins cycles to teams: a cycle with no team is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from teams: the teams with no recent cycles ARE the finding — a seat that stopped publishing is the churn signal — arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload team row — the LEFT JOIN quietly became an INNER and the dormant teams vanished. The fix is moving the predicate into ON or an outer query. On this db the never-used anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "canva-t2",
      q: "The adoption census shows 251 template-use lines, 103 design cycles and 16 teams. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts template-use lines — 251; COUNT(DISTINCT o.id) folds them back to design cycles — 103; COUNT(DISTINCT customer_id) folds further to teams — 16. None is wrong: lines measure gallery-touch volume, cycles measure the collaboration calendar, teams measure the installed base. The ratios are the reads — 2.4 lines per cycle, 6.4 cycles per team — and they decide whether growth is broadening (more teams) or deepening (more design per team), which is THE design-SaaS question. The trap that catches candidates is quoting a line count as a cycle count in a trend; one cycle with three template lines is one collaboration row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "canva-t3",
      q: "The gallery review wants template families with at least fifty uses. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The engagement-state rule is a row-level fact — status = 'delivered' discards drafting and abandoned cycles before any fold, in WHERE; putting it in HAVING is impossible because states no longer exist once rows are grouped. The fifty-use floor is a group-level fact — HAVING SUM(quantity) >= 50 after GROUP BY; putting it in WHERE errors because SUM does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an adoption-qualified board and an error, and between a threshold applied to lines versus to uses. On this db six of seven families clear a 53-use floor — only Fitness, at 27 uses, falls below. The strong answer places every filter by asking: is this a fact about one use line, or about a family's whole fold?",
      tag: "pipeline",
    },
    {
      id: "canva-t4",
      q: "You rank templates by total uses and three of them tie at exactly 30. RANK, DENSE_RANK or ROW_NUMBER for the gallery board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied templates the same rank and skips — the trio at 30 uses shares one rung, and the next distinct use count skips ahead by three, implying phantom templates that do not exist. DENSE_RANK shares rungs without gaps — the tie reads as three consecutive rows at one rank and the next distinct count follows immediately. ROW_NUMBER splits ties arbitrarily, which silently decides which template gets the gallery feature slot first. On this db the tie is structural — the units ladder runs 47, 46, 38, then a pair at 36 and a trio at 30. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer templates, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "canva-t5",
      q: "A design cycle is still drafting with no publish stamp yet. What is your NULL policy for the time-to-publish report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped cycles have a publish latency, so the report measures the stamped population and says so — on this db 82 of 103 cycles carry a stamp (52 published plus 30 exported-awaiting-review), averaging 2.98 days from start to stamp, range 2 to 4; 14 are still drafting, 7 abandoned. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) IS the unstamped backlog, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant design for cycles still drafting, and an engagement report built that way is a lie with decimals.",
      tag: "nulls",
    },
    {
      id: "canva-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce the 338.19 average. On filtered staging tables — one cohort, one template family, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each cycle to ITS team's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "canva-t7",
      q: "The adoption trend buckets design cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; SUBSTR to month-only would merge January 2024 with January 2025 and the launch curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's publishes, and month-end is exactly when template launches land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in an adoption walk. The spine's headline is probed: 2024-01 opens at 8 cycles and 3,731.97 of billed value.",
      tag: "dates",
    },
    {
      id: "canva-t8",
      q: "The billing desk says a paid team invoice has no settlement rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1756 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the adoption ledger and the team book — the trial balance ties 181,080 to 181,080 — and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "canva-t9",
      q: "Growth wants running billed value down the monthly spine and a rolling publish average. Walk me through the window frame you pick — and what the default frame does when two months tie.",
      a: "Two decisions, both explicit. The running walk: SUM(SUM(o.total)) OVER (ORDER BY month) — legal because window functions evaluate after GROUP BY — but the default frame with an ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes PEERS: two months with equal fold values would both land inside each other's window and the walk double-counts them. The honest running total is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — exactly the rows traversed, no peer absorption. The rolling average wants a bounded frame — ROWS BETWEEN 6 PRECEDING AND CURRENT ROW over a month-ordered spine — and the boundary rows (the first six months) legitimately average fewer buckets unless you pad the spine or say so in the footnote. On this db the walk starts at 3,731.97 and ends at 34,833.28, and the peer trap is real in the cycles fold (8, 9, 8 — ties everywhere). Say the frame out loud in the interview; the panel is listening for RANGE-versus-ROWS, not for syntax recall.",
      tag: "windows",
    },
    {
      id: "canva-t10",
      q: "The Monday board stacks the published census (52) on the exported-awaiting-review census (30). UNION or UNION ALL — and what does the wrong pick cost?",
      a: "UNION ALL, and the reasoning matters more than the keyword. ALL concatenates: 52 + 30 = 82 rows, the auditable stamped population, and no dedupe pass runs. A bare UNION sorts and deduplicates the combined set — harmless ONLY while the arms are disjoint by construction, which here they are (a cycle carries exactly one status). The day the filters overlap — published-in-January stacked on all-published — UNION launders the duplicate into one row and the board undercounts with no error anywhere. The rules that ship with it: both arms must agree on column count and position (names come from the first arm), a literal label column ('published', 'exported') makes the stack sliceable, and one ORDER BY at the very end sorts the whole stack — ORDER BY inside an arm is illegal. The Canva habit: stack with ALL, label the arms, and reserve bare UNION for the queries whose SPEC is dedupe — never as a default.",
      tag: "setops",
    },
    {
      id: "canva-t11",
      q: "Which teams published a cycle last month but have gone silent this month? Give me the set-op shape and defend its direction.",
      a: "Two month-keyed team sets and a directional difference: SELECT customer_id FROM orders WHERE month = last EXCEPT SELECT customer_id FROM orders WHERE month = this. Direction IS the question — A EXCEPT B returns last-month-active teams missing this month (the at-risk list the retention pod works), B EXCEPT A returns this-month newcomers (the expansion list), and INTERSECT returns the retained middle. Swap the arms and you ship the wrong list to the wrong pod with a correct-looking query. The semantics: EXCEPT is set semantics — it deduplicates each side first, so a team with five published cycles and a team with one enter the comparison identically; keys must be NULL-clean because NULL = NULL is UNKNOWN and NULL keys slide through EXCEPT as if they never matched. On this db the movement walk is the growth review's first page — new, retained, resurrected, churned — and EXCEPT plus INTERSECT build two of its four quadrants. Name the arms, name the direction, then run it.",
      tag: "setops",
    },
    {
      id: "canva-t12",
      q: "You compute publish_rate with an alias in SELECT, then try WHERE publish_rate > 0.5. What happens, and what does that teach about the pipeline?",
      a: "It errors — because WHERE runs before SELECT: at filter time the alias does not exist and the rows are still raw. The logical pipeline is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, and each stage only sees what earlier stages produced: aggregates don't exist at WHERE (that's what HAVING is for), aliases don't exist until SELECT (which is why HAVING can sometimes use them and WHERE never can), and ORDER BY — last before LIMIT — is the one clause allowed to reference SELECT aliases. The same order explains the classic traps: LIMIT without ORDER BY returns arbitrary rows (top-of-spine reads shuffle run to run), and a WHERE on the wrong grain silently reshapes the denominator before any fold happens. Portability footnote the panel likes: SQLite and MySQL permit alias reuse in HAVING; PostgreSQL rejects it — write the expression out when the query will travel. Canva habit: aliases for humans, expressions for the engine, and the pipeline recited before the query is written.",
      tag: "pipeline",
    },
    {
      id: "canva-t13",
      q: "NOT IN versus NOT EXISTS versus LEFT JOIN … IS NULL for 'teams with no stamped cycle this quarter' — what separates them, and which one has a NULL landmine?",
      a: "NOT IN carries the landmine. WHERE id NOT IN (SELECT customer_id FROM staging_drafts) returns ZERO rows if the inner fold contains even one NULL — every comparison becomes UNKNOWN and nothing survives: an empty report that reads as good news. NOT EXISTS is NULL-safe by construction (the correlation simply fails to match) and says the intent out loud: 'no matching row exists'. LEFT JOIN … IS NULL is the same read with the join's survival rule doing the work — the house anti-join — and it composes with aggregates (COUNT the NULL payloads) where EXISTS cannot. The performance shape at Canva scale is irrelevant (251 use lines), but the HABIT isn't: at template-line volume the correlated NOT EXISTS re-scans per outer row and wants its inner key indexed, while NOT IN over a static fold evaluates once. The interview answer: state the NULL behavior of each form, pick NOT EXISTS or the anti-join, and never ship NOT IN against a fold you haven't proven NULL-free.",
      tag: "subqueries",
    },
    {
      id: "canva-t14",
      q: "The template-variety board needs a fold (cycles, lines, distinct templates, value per team) gated and then ranked. Derived table or CTE — and what does staging buy you?",
      a: "Stage it, by either name — the discipline matters more than the keyword. WITH team_fold AS (the GROUP BY fold) then SELECT … FROM team_fold WHERE distinct_templates >= 10 ORDER BY design_value DESC reads top-down in the order the analyst thinks; the derived-table version buries the fold in FROM parentheses and reads inside-out. What staging buys: one fold, many consumers (the gate, the rank, and a percent-of-total share can all read the same CTE without re-folding), a named grain you can put in a comment — 'one row per team' — and a place for the population check (SELECT COUNT(*) FROM team_fold prints 16 and proves the fold didn't blur). The SQLite footnote: a referenced-once CTE is inlined, a multiply-referenced one materializes — so the reuse is free, not a tax. The Canva-shaped win: the variety board, the depth ladder and the concentration read (63.5% of value above the 3,000 line) can share one staged fold and stay definitionally in sync. When two boards disagree, the fix is usually that they fold twice.",
      tag: "ctes",
    },
    {
      id: "canva-t15",
      q: "Time-to-publish averages 2.98 days on this db. How do you compute that from TEXT timestamps, and where does the arithmetic quietly lie?",
      a: "JULIANDAY both sides, then subtract: JULIANDAY(shipped_at) - JULIANDAY(created_at) converts each TEXT stamp to a fractional day number, so the delta is real days — here whole days, averaging 2.98 across the 82 stamped cycles, range 2 to 4. The quiet lies: writing shipped_at - created_at on TEXT makes SQLite coerce the leading '2024' digits and return 0 — a confident zero with no error; DATE(shipped_at) - DATE(created_at) lies the same way because DATE returns TEXT. Rounding is the second lie: ROUND(avg, 2) is presentation — the underlying sum of days over 82 cycles is the fact, and quoting '3 days flat' erases the 2.98 that separates cohorts (US 3.07 from APAC 2.93 — the rounding step is bigger than the gap). Third: modifiers and bounds — DATE(created_at, '+7 days') for invite-followup windows, and half-open range filters (>= start AND < end) over BETWEEN, because BETWEEN's inclusive upper bound is where the last night's publishes go missing the day timestamps gain a clock. The habit: convert to a number the moment arithmetic begins, and say the population — stamped only — before the average.",
      tag: "dates",
    },
    {
      id: "canva-t16",
      q: "Your conversion rate divides by a cohort count that can be zero. What's your guard, and what's your policy on COALESCE-ing a computed NULL to zero?",
      a: "The guard is NULLIF on the denominator: SUM(CASE WHEN converted THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) — division by zero errors or returns NULL depending on the engine, and NULLIF turns the empty cohort into an honest NULL, which reads as 'undefined' instead of a fabricated 0.0%. The policy is stricter than the guard: COALESCE(rate, 0) is a CLAIM — 'zero teams converted' — and for an empty education cohort that's a lie with decimals; the honest render is NULL or the string 'n/a' with a footnote. The same discipline runs the rest of the NULL policy: COUNT(col) skips NULLs while COUNT(*) does not (after a LEFT JOIN, the gap IS the unmatched population — 6 bills with no settlements on this db), aggregates ignore NULLs silently (AVG over the stamped 82, not the full 103), and a NULL in a NOT IN list zeroes the whole screen. Canva habit: every rate query ships with its zero-cohort behavior named in the comment — 'empty cohort renders NULL, not 0' — because a dashboard showing 0.0% gets read as 'we tried and failed', not 'we never ran'.",
      tag: "nulls",
    },
    {
      id: "canva-t17",
      q: "Define the template-to-publish funnel for me — stages, denominators, and the number a bad denominator produces.",
      a: "Three stages, one event spine. Created: 103 design cycles. Stamped: 82 carry a publish/export stamp (52 published plus 30 exported-awaiting-review) — stamp-to-create is 79.6%. Published: 52 sign-offs — publish-to-create is 50.5%, and that denominator is the interview: published ÷ ALL cycles is the adoption read; published ÷ stamped (52 of 82, 63.4%) is the review-pass read; published ÷ resolved (52 of 59) is a different metric with a different name. The bad denominator produces confident inflation: quoting 88.1% (resolved-only) as 'the publish rate' deletes 44 cycles — every draft and every abandonment — from the story exactly where the leak lives. Drop-off is the complement read at each stage: 14 still drafting and 7 abandoned are the created-but-never-stamped gap; 30 exported are the stamped-but-unsigned gap. Canva habit: every funnel number ships as 'X of Y' with the denominator's definition in the same breath, because the gallery team, the review pod and the board all say 'publish rate' and mean three different fractions.",
      tag: "kpi",
    },
    {
      id: "canva-t18",
      q: "What does 'team-seat expansion' mean as a metric here, and how do you measure it without confusing it with acquisition?",
      a: "Expansion is depth, not breadth: existing teams running MORE design cycles over time — the ladder, not the logo count. The measurement: cycles per team over a window, diffed against the same team's prior window — LAG per team with PARTITION BY customer_id, or a growth-accounting pivot (new / retained / resurrected / churned). On this db the depth ladder reads 24, 17, 14, 13, 5, then four teams tied at 4 — and the tie is the honesty test: the median team sits at 3-to-4 cycles while the top four sit at 13-to-24, so a MEAN expansion rate is a top-four story wearing a whole-book name. That's why the concentration read travels with it — 63.5% of billed value sits above the 3,000 line — and why seat expansion is priced off the ladder's movement, not off new-team adds (this book: 16 teams, 2 of them one-time). The trap to refuse: counting template-use LINES as expansion — 251 lines fold to 103 cycles, and lines-per-cycle is fan-out intensity, a different lever. Say which grain you're growing — team-depth, cycle-fan-out, or team-count — or the expansion number will quietly claim all three.",
      tag: "kpi",
    },
    {
      id: "canva-t19",
      q: "Leadership wants a print attach rate. This db has no print-order table. What do you say, and what do you build instead?",
      a: "First, say it plainly: the metric as defined needs a print-order event this db does not carry, and inventing one would be fabrication. Then build the honest proxy and label it: the attach ANALOGUE is the share of design cycles that touch the merchandise-oriented family — on this db, the Accessories family's lines fan out to 54 of 103 cycles (52.4%), Audio to 46, Electronics to 40. The shape is a conditional distinct count with the denominator named: COUNT(DISTINCT CASE WHEN family = 'Accessories' THEN order_id END) divided by COUNT(DISTINCT order_id) — distinct because one cycle can carry three Accessories lines and attach counts CYCLES, not lines. The definition conversation is the deliverable: attach to WHAT (cycles? teams?), over WHAT window, in WHICH denominator — and the memo states that the proxy rides family fan-out until the print event lands in the schema. Canva habit: proxy metrics get proxy names ('accessories-fan-out share'), and the day the real print table arrives, the query changes but the denominator discipline doesn't.",
      tag: "kpi",
    },
    {
      id: "canva-t20",
      q: "How would you define free-to-paid conversion for the education-to-pro tier ladder, and where does the definition usually get gamed?",
      a: "Definition first: conversion = teams whose usage crosses pro-priced SKUs ÷ all ACTIVE teams in the window — active defined, denominator stated, window fixed. The catalog prices the tiers: 8 education-friendly templates average 32.06, 8 pro templates average 111.5, and the premium band above 200 is empty at the 199.99 ceiling — so 'pro usage' is a price-band definition, and the memo states the band boundaries instead of gesturing at 'premium'. Where it gets gamed: the denominator shrinking (counting only teams that OPENED a pro template as the base converts 100% of nothing into a hero number), the window sliding (a quarter-long window catches a seasonal spike as trend), and the numerator counting TRIPS to pro SKUs instead of teams — one team's five pro lines is adoption intensity, not five conversions. The honest version reports the band mix (8 and 8), the conversion fraction, and the empty premium band as an explicit zero with the 199.99 ceiling cited — proving a confident zero is part of the job, not an admission of failure.",
      tag: "kpi",
    },
    {
      id: "canva-t21",
      q: "GROUP_CONCAT — where does it earn its seat in a design-SaaS audit, and what does it refuse to promise?",
      a: "It earns its seat wherever a fold needs to show its WORK: the AR audit's GROUP_CONCAT(i.id) prints '18,21,24,26,27' for the open unpaid class and '28' for the paid ghost — bill ids IN the cell turn 'five open invoices' from a claim into a list someone can pull up. Same move for the variety board: the templates behind '15 distinct' as a comma-joined cell, so the gallery review sees WHICH 15. What it refuses to promise: ORDER — concatenation order is unspecified unless you sort inside the aggregate (ORDER BY within GROUP_CONCAT on modern SQLite) or feed it from an ordered subquery; SEPARATOR defaults to a bare comma and takes an explicit second argument to change; and LENGTH — giant folds bloat rows and clip in BI tools, so cap the population with WHERE or HAVING before you fold. The discipline: GROUP_CONCAT is an audit column, not a data model — it makes one cell carry a list, which is a report, not a join target. The Canva habit: fold the ids, label the class, and let the cell itself be the evidence.",
      tag: "folds",
    },
    {
      id: "canva-t22",
      q: "The db is tiny — 251 order lines. Why do performance instincts still get graded, and which ones?",
      a: "Because the db is a rehearsal: the habits are graded on the query SHAPE you would ship at 251 million template lines, not on this machine's milliseconds. The four that matter. Filter before fold: WHERE the cohort down in every staging step — a fold over 14 months when the memo asks about one is wasted work and a drifted denominator. Sargability: wrapping the indexed column in a function (WHERE STRFTIME('%Y', created_at) = '2024') walks the whole table; write the range (created_at >= '2024-01-01' AND created_at < '2025-01-01') and the index survives. Select only the columns the board reads — SELECT * over a three-table join ships rows fat with payloads nobody consumes. And know the plan: EXPLAIN QUERY PLAN is the read that says SCAN versus SEARCH — the difference between a table walk and a keyed lookup. The honest footnote the panel wants to hear: at 251 lines every version is instant, which is EXACTLY why the instinct is the deliverable — the query that scales is indistinguishable from the one that doesn't until the data arrives, and by then it is an incident.",
      tag: "performance",
    },
    {
      id: "canva-t23",
      q: "A junior joins orders to order_items and reports average cycle value well above the board's 338.19. Who's wrong, and what's the diagnosis move?",
      a: "The join is. order_items fans out — 251 lines against 103 cycles — so AVG(o.total) after the join weights every cycle by its line count: a three-template cycle counts three times, and the average drifts to a line-weighted number wearing the cycle-grain name. The correct 338.19 is AVG(total) over orders alone, one row per cycle. The diagnosis move: check the grain before you average — COUNT(*) on the joined set (251) against the base (103) prints the fan-out, and any aggregate computed over the fanned rows inherits it; SUM of o.total over the join inflates the same way, because each cycle's total repeats once per line. The rule that prevents all of it: aggregate at the grain you NAME — fold order_items to cycle grain first (SUM(quantity), SUM(quantity * unit_price) per order), then join, or aggregate orders alone and keep the line-level reads in a separate query. Canva habit: every headline average ships with its grain printed beside it — '338.19 per cycle', never just 'the average' — because a line-weighted number and a cycle-weighted number are both real and only one is the metric.",
      tag: "quality",
    },
    {
      id: "canva-t24",
      q: "The tier memo wants usage quartiles across the seven template families — and the premium band above 200 is empty. What do NTILE and friends actually tell you here, and what do they refuse to?",
      a: "NTILE(4) OVER (ORDER BY uses DESC) splits the seven families as evenly as the math allows — 7 rows into 4 tiles gives 2, 2, 2, 1, with the remainder scattered to the earliest buckets, so the top tile holds two families and the bottom holds one; a different row count and the boundaries move, which is why the memo prints the bucket BOUNDARIES, not just the bucket numbers. NTILE refuses three things: it refuses meaning (quartiles of a seven-row fold are arithmetic, not strategy — the crown family's 97 uses versus Fitness's 27 is the story, the bucket is the packaging); it refuses stability (insert one family and every boundary can shift — tier assignments churn without any team changing behavior); and it refuses empty-band honesty — a quantile read over the 16 template SKUs always prints four buckets, but the price ceiling is 199.99 and the premium band above 200 is EMPTY, which no NTILE will volunteer. The Canva habit: quantiles for framing, thresholds for policy — the 53-use adoption floor is a definition the business set, and definitions survive; statistical buckets drift.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "canva-mcq-1",
      prompt: "A design cycle's status column reads 'shipped'. In this kit's adoption funnel, what is it?",
      choices: ["Published to the team", "Exported — awaiting review", "Still drafting", "Abandoned"],
      answer: 1,
      why: "The funnel map is fixed: delivered = published (52 of 103 cycles), shipped = exported with the stamp already applied, awaiting review (30), pending = still drafting (14), cancelled = abandoned (7). 'Shipped' is the exported-but-unreviewed state — the work exists and carries a stamp, but the team hasn't signed off.",
      notes: [
        { choice: 0, why: "Published is 'delivered' — 52 cycles. Counting exported-unreviewed as published inflates every adoption number on the board." },
        { choice: 2, why: "Drafting is 'pending' — 14 cycles that carry NO stamp. Exported-awaiting-review is a different, later stage; confusing them corrupts the time-to-publish denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-2",
      prompt: "Publish rate is defined as published ÷ which population? The db holds 52 published and 7 abandoned of 103 design cycles.",
      choices: ["Published + abandoned only (52/59 = 88.1%)", "All design cycles (52/103 = 50.5%)", "Exported cycles only", "Distinct teams (52/16)"],
      answer: 1,
      why: "The house definition: published ÷ ALL cycles, drafting and exported included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-funnel publish rate — a legitimate separate metric, but calling it 'the publish rate' inflates 50.5% to 88.1% by quietly deleting 14 drafts and 30 exported cycles. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is published cycles per team — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-7",
      prompt: "The tier memo asks how many templates price in the premium band (200 and above). The catalog ceiling is the 199.99 template. What does the honest query return?",
      choices: ["8 — the pro band", "0 — the band is empty, and the memo must say so", "16 — all templates", "It errors — CASE cannot band an empty set"],
      answer: 1,
      why: "The premium band is genuinely empty: 8 education-friendly templates average 32.06, 8 pro templates average 111.5, and the priciest SKU stops at 199.99. Returning zero rows is the finding — the memo states the ceiling honestly instead of inventing a tier the catalog cannot staff.",
      notes: [
        { choice: 0, why: "The pro band (50 up to but not including 200) holds the 8 templates averaging 111.5 — but 'premium 200+' is a different band, and it holds nothing. Band boundaries are definitions; sliding them silently re-segments the catalog." },
        { choice: 3, why: "CASE bands an empty set just fine — it returns zero rows for that arm, which is exactly the honest answer. Expecting an error is how people convince themselves the band must exist." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-3",
      prompt: "EU carries 45 design cycles from 8 teams. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 1,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to teams (8). The gap between the columns — 5.6 cycles per team — is the intensity read that separates load from audience.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has a team. Without DISTINCT both columns read 45 and the census loses the spread story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts cohorts, not teams — a third grain nobody asked for. The census is cycles AND teams." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued cycles", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every cohort's publish share truncates toward 0 and the whole funnel map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-5",
      prompt: "Keep only template families with at least 53 total uses (uses = SUM of line quantities). Where does the threshold live?",
      choices: ["WHERE SUM(quantity) >= 53, before GROUP BY", "GROUP BY category HAVING SUM(quantity) >= 53", "WHERE uses >= 53 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A uses floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db six of seven families clear the 53-use bar — only Fitness, at 27 uses, falls below — and 53 lands exactly on Wearables' own uses cell.",
      notes: [
        { choice: 0, why: "SUM(quantity) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'uses' column on the raw table — the fold only materializes at GROUP BY. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-6",
      prompt: "A team invoice row reads amount_cents = 175600. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 1,756.00 — the exact value on the infamous #28 bill. The .0 is the entire fix; integer ÷ integer truncates, and every odd-cent team bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "175600 / 100 is integer division = 1756 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 17,560,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-8",
      prompt: "One query must return, per template family: total uses AND published uses. Why is SUM(quantity) FILTER (WHERE status = 'delivered') the right tool instead of WHERE status = 'delivered'?",
      choices: ["FILTER is just faster syntax for the same thing", "WHERE filters rows before the fold — total uses would collapse to published-only; FILTER conditional-aggregates inside one scan", "FILTER can only be used on TEXT columns", "They differ only when the table is empty"],
      answer: 1,
      why: "WHERE discards rows before GROUP BY, so every aggregate in the query would fold the published subset only — total uses becomes published uses and the census loses its denominator. FILTER (WHERE …) branches per aggregate inside one pass: total over all rows, published over delivered rows, one scan, two truths.",
      notes: [
        { choice: 0, why: "They are NOT the same thing — one filters the input rows for every aggregate, the other filters per aggregate. The whole one-pass census idiom lives in that difference." },
        { choice: 3, why: "The divergence shows on any table with mixed states — which is every real cycle table. The empty-table case is the least of it." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-9",
      prompt: "The template-variety board ranks teams by distinct templates used: the top two teams both show 15, the next shows 14. What rank does the 14-template team hold under RANK()?",
      choices: ["2", "3", "1", "Whatever ROW_NUMBER assigned it"],
      answer: 1,
      why: "RANK gives tied rows the same rank and skips: the pair at 15 shares rank 1, and the next distinct count lands at rank 3 — rank 2 is reserved for a 15-template team that doesn't exist. The shared rung and the gap are both the policy, not a bug.",
      notes: [
        { choice: 0, why: "Rank 2 would imply the pair split — that's ROW_NUMBER behavior, an arbitrary ordering of peers. If you use it, name the tie-breaker." },
        { choice: 2, why: "Rank 1 belongs only to tied rows AT the top count. Handing rank 1 to the 14-template team erases the tie and the gap in one move." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-10",
      prompt: "A teammate builds the monthly adoption trend with SUBSTR(created_at, 6, 2) AS month. The db spans 2024-01 to 2025-02. What does the chart show?",
      choices: ["A correct 14-bucket trend", "12 buckets — every January merged into one, every February merged into one", "14 buckets but sorted wrong", "An error — SUBSTR cannot parse timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) grabs the two-digit month with no year: January 2024 (8 cycles, 3,731.97) and January 2025 (6 cycles, 1,669.50) collapse into one bucket. The spine must be '%Y-%m' — year plus zero-padded month — or the seasonality curve is fiction.",
      notes: [
        { choice: 0, why: "The db spans two calendar years — month-only bucketing silently merges same-month pairs. 14 real months compress to 12 fictional ones." },
        { choice: 3, why: "SUBSTR parses fine — that's the trap. The bug is semantic (lost year), not mechanical, so nothing errors and the chart just quietly lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-11",
      prompt: "The billing memo adds a print-refund leg: SELECT AVG(amount_cents) FROM invoices WHERE status = 'refunded'. The invoice book only carries open, paid and void. What does the cell print?",
      choices: ["0 — an average of nothing is zero", "NULL — the cell renders empty, and the memo must say 'no refunds exist yet'", "It errors — AVG refuses an empty set", "The full 28-bill average — WHERE drops nothing on an unknown status"],
      answer: 1,
      why: "The status filter matches zero rows, and AVG over an empty set is NULL — the absence of an answer, not an answer of zero. SUM behaves the same; COUNT is the only aggregate that returns 0 over nothing. The memo must distinguish 'no refunds yet' (NULL) from 'refunds average zero dollars' (0) — different claims, and only an explicit COALESCE chooses between them.",
      notes: [
        { choice: 0, why: "Printing 0 asserts the average refund is zero dollars; printing NULL says the question has no data yet. COALESCE(AVG(...), 0) is how you choose the zero story — silently letting 0 print is how phantoms become facts." },
        { choice: 3, why: "An impossible status filters to an empty set — a normal, error-free result. Expecting an error is exactly how a phantom leg survives three review cycles unchallenged." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-12",
      prompt: "WHERE total > AVG(total) throws 'misuse of aggregate'. The one-line fix, and the reason behind it?",
      choices: ["Move the comparison into HAVING", "WHERE total > (SELECT AVG(total) FROM orders) — WHERE runs before any fold exists, so the platform average (338.19) must be computed in its own scalar subquery", "Add GROUP BY total", "Cast AVG(total) to REAL"],
      answer: 1,
      why: "WHERE filters rows before groups exist — AVG(total) has nothing to average at that pipeline stage. The scalar subquery folds all 103 cycles once (34,833.28 / 103 = 338.19) as its own little aggregate, then the outer WHERE compares each row to that line, row by row.",
      notes: [
        { choice: 0, why: "HAVING filters groups after the fold; there are no groups here, and the question is row-versus-platform, not group-versus-group. Right keyword, wrong job." },
        { choice: 2, why: "GROUP BY total makes one group per distinct total — ninety-plus singleton groups, and the comparison still isn't row-versus-platform. Pipeline order, not grouping, is the wall." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-13",
      prompt: "Your scorecard owns print attach rate — how much finished design work converts into print orders. The book: 103 design cycles, 52 published. Which population does the house definition divide by?",
      choices: ["All 103 design cycles", "The 52 published cycles — print can only attach to work that has actually been finished and published", "The 16 design teams", "The 251 template-use lines"],
      answer: 1,
      why: "Attach rate is print orders over published cycles: the population at risk of printing is the 52 published designs. Drafts (14) and abandoned cycles (7) can never print, and exported-awaiting-review (30) hasn't produced its final artifact — folding them in measures funnel leakage, not attach. Same numbers, different metric name it separately.",
      notes: [
        { choice: 0, why: "103 as the denominator quietly redefines attach as publish-then-print conversion — a real metric under a different name. Denominators are definitions; sliding them rebrands the KPI without telling anyone." },
        { choice: 2, why: "Teams is a count of accounts, not designs — orders over teams is an intensity ratio. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-14",
      prompt: "A PM asks for the draft-to-export step rate. The db stores one status per cycle — 14 pending, 30 shipped, 52 delivered, 7 cancelled. What can you honestly return?",
      choices: ["30/14 — exports over today's drafts", "30/103 = 29.1% — the exported share of the book, plus a note that true step rates need stage-entry events this snapshot schema doesn't keep", "30/52 — exports over publishes", "52/30 — publishes over exports"],
      answer: 1,
      why: "Statuses are a snapshot of where each cycle sits now, not a log of when it entered each stage; a cycle that skipped drafting is invisible. The only computable rate is stage share — 30 of 103 cycles (29.1%) sit exported. Inventing 30/14 assumes every export passed through today's pending pool, which nothing in the schema can prove.",
      notes: [
        { choice: 0, why: "Today's 14 drafts are not the cohort that exported — timing is unknown. The ratio fabricates a funnel the schema can't support, and it moves every time someone starts a draft." },
        { choice: 2, why: "Exports-over-publishes is review-queue pressure — a legitimate separate read, but the PM asked for the draft-to-export step, and this isn't it." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-15",
      prompt: "A teammate measures cycle latency as created_at - shipped_at directly on the TEXT dates. January rows print exactly 3, and they ship it. Why is 3 a coincidence?",
      choices: ["TEXT dates can't subtract — those rows silently error", "SQLite coerces '2024-01-04' - '2024-01-01' into 20240104 - 20240101 = 3 — right by accident inside one month, garbage across boundaries (Feb 27 to Mar 01 prints 74); julianday() differences give the honest 2.98-day average", "created_at is UTC and shipped_at is local", "Subtraction needs ROUND to be exact"],
      answer: 1,
      why: "Date-looking strings coerce to their digits: YYYYMMDD arithmetic happens to agree with real day math for same-month pairs, then lies the moment a range crosses a month or year boundary. The real latency read is julianday(shipped_at) - julianday(created_at): 82 stamped cycles averaging 2.98 days, range 2 to 4.",
      notes: [
        { choice: 0, why: "It doesn't error — silent success is the danger. Wrong numbers that print cleanly are how 74-day 'latencies' reach the deck undetected." },
        { choice: 2, why: "Timezone drift is a different bug class entirely; here even identical clocks produce the 74. The digits, not the clocks, are what lie." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-16",
      prompt: "The never-settled bills list — 6 bills worth 15,217 — returns exactly 6 rows. A teammate adds WHERE p.method = 'card' to isolate card settlements and the list shrinks. What broke?",
      choices: ["LEFT JOINs cap their unmatched rows", "The WHERE runs after the join — NULL-extended rows fail the predicate, collapsing the LEFT JOIN into an INNER JOIN; the method filter belongs in the ON clause", "p.method is spelled wrong", "Six rows is the driver's fetch limit"],
      answer: 1,
      why: "Bills with no settlement rows get NULL for every payments column; WHERE p.method = 'card' discards those NULL rows — and the never-settled bucket, the whole point of the list, evaporates. Filtering a right-table column belongs in the ON clause (LEFT JOIN payments p ON p.invoice_id = i.id AND p.method = 'card'), which keeps unmatched bills with their NULL settlements intact.",
      notes: [
        { choice: 0, why: "Nothing caps at six — the shrink IS the collapse. The list got shorter because the anti-join it exists to surface was quietly destroyed." },
        { choice: 2, why: "method IS NULL on the unmatched bills is precisely the signal you're preserving. The fix keeps those rows; it doesn't test them." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-17",
      prompt: "SELECT COUNT(*), COUNT(shipped_at) FROM orders prints 103 and 82. Why do the columns disagree?",
      choices: ["COUNT(shipped_at) has a parser quirk", "COUNT(column) skips NULLs — shipped_at is stamped only on the 82 exported-plus-published cycles; the 14 drafts and 7 abandoned carry no stamp", "COUNT(*) double-counts rows", "The engine deduplicated 21 rows"],
      answer: 1,
      why: "COUNT(*) counts rows; COUNT(column) counts non-NULL values. shipped_at exists only where the export/publish stamp has been applied — 30 + 52 = 82 of 103. The 21-row gap IS the stamp-coverage read: draft and abandoned work never gets one, so the two columns together measure how much of the book has left the draft stage.",
      notes: [
        { choice: 0, why: "Not syntax — the disagreement is by design and it's the metric. Two counts that always agreed would tell you nothing about stamping." },
        { choice: 2, why: "COUNT(*) is one per row, once. Nothing doubles; the delta is NULLs, not duplicates." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-18",
      prompt: "A teammate audits team billings with invoices JOIN payments, SUMming i.amount_cents — bill #1 (4,860, settled in two rows) prints 9,720. What happened?",
      choices: ["The account is double-billed — file a fraud ticket", "The join fanned out — one invoice row times two payment rows counts the bill twice; SUM the payments side or pre-aggregate settlements before joining", "amount_cents needs /100.0", "SUM ignored NULLs and padded the difference"],
      answer: 1,
      why: "Joins multiply rows and aggregates inherit the multiplication: #1's two settlement rows make the invoice row exist twice, so its 4,860 counts twice. The honest settle-side read sums p.amount_cents (4,860 total) or folds payments per invoice first. The five split-payment bills — 1, 5, 12, 19, 22 — all inflate the same way.",
      notes: [
        { choice: 0, why: "The ledger is fine — one bill, two settlements summing exactly to it. The query lied, not the money; a fraud ticket would investigate a bug that lives in the SQL." },
        { choice: 2, why: "/100.0 fixes units, not duplication — the bug prints 9,720.00 with perfect decimal places, which is why it survives review." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-19",
      prompt: "A running-uses column — SUM(uses) OVER (ORDER BY uses) — hits a tie: two template families log 61 uses each, and both rows print the same running total that includes BOTH families. Which frame fact explains it, and what fixes the per-row walk?",
      choices: ["The default frame is RANGE up to CURRENT ROW — ORDER BY peers share one frame step; ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW advances one row at a time, with a deterministic tie-breaker", "RANGE only counts DISTINCT values", "Add DISTINCT inside the SUM", "Windows cannot sum tied rows"],
      answer: 0,
      why: "With ORDER BY uses, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — tied sort keys are peers, so each tied row's frame swallows the whole tie group and both print the group-inclusive total. ROWS mode steps row-by-row, so the walk accumulates per row; pair it with a deterministic ORDER BY tie-breaker or the two tied rows still fight over position.",
      notes: [
        { choice: 1, why: "RANGE includes every peer row's value — the totals aren't deduplicated, they're grouped by peer step. DISTINCT is a values filter, not a frame rule." },
        { choice: 2, why: "DISTINCT inside SUM changes nothing here — the values differ; the frame, not the values, is what lumps the tie together." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-20",
      prompt: "One query must carry, per template family, the family's publish share AND the platform-wide share side by side. Which shape, and what's the instinct behind it?",
      choices: ["A correlated scalar subquery — it re-probes the table once per outer row; correct at 16-family scale, but the shape that dies on a million-row event log", "Window shapes: the family arm rides a PARTITION BY category window and the platform arm an empty OVER () — both denominators computed in one pass alongside each row", "A self-join on category — joins are always the cheapest comparison shape", "GROUP BY category alone — the platform number needs no separate mechanism"],
      answer: 1,
      why: "Windows evaluate after the fold: SUM(...) OVER (PARTITION BY category) attaches the family total to each row, and SUM(...) OVER () attaches the grand total to the same rows — one scan, both denominators, share = family over platform. A correlated scalar re-executes the inner fold for every outer row: invisible at 16 families, a load incident at event-log scale.",
      notes: [
        { choice: 0, why: "It IS correct on this db — the objection is the instinct. Reaching for correlated-first is how dashboards quietly acquire 40-second loads nobody can trace." },
        { choice: 3, why: "GROUP BY category returns family rows but cannot carry the platform-wide column without another shape — the platform denominator lives outside every single group." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-21",
      prompt: "The board deck's team-seat expansion cell — which formula is the KPI monetization actually prices?",
      choices: ["Gross seats added this period", "Seats added minus seats removed this period — net seat growth inside existing accounts", "New teams signed this period", "Total seats on the books at period end"],
      answer: 1,
      why: "Expansion is net movement: adds minus removals inside accounts that already exist. Education teams shed seats at term-end the same quarter other teams add them — gross adds flatter the number, and a period-end total can't tell growth from standstill. Net seats is the only version the expansion thesis survives.",
      notes: [
        { choice: 0, why: "A team adding 5 seats and dropping 4 nets +1; reporting 5 inflates expansion five-fold and the board prices a boom that didn't happen." },
        { choice: 2, why: "New teams are new-logo acquisition — a different line of the same deck. Folding them into expansion hides whether existing teams are actually growing." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-22",
      prompt: "A team's template-list cell — GROUP_CONCAT(p.name) — reads in a different order on two runs of the same query. The fix?",
      choices: ["CAST the cell to TEXT", "Pin the order: GROUP_CONCAT(p.name, ', ' ORDER BY p.name) on SQLite 3.44+ — on older engines sort upstream in a CTE and verify, because pre-3.44 fold order is engine-internal, not a contract", "Add DISTINCT inside GROUP_CONCAT", "Compare LENGTHs to detect the drift"],
      answer: 1,
      why: "Fold order is not guaranteed before 3.44 — identical rows, different cell strings between runs, and any downstream string-compare or diff dashboard flips with them. The modern form orders inside the fold; the legacy hedge stages sorted input and re-checks the output, because 'usually alphabetical' is not a spec.",
      notes: [
        { choice: 0, why: "Casting changes the type, not the sequence — the order was decided at fold time and CAST just preserves whatever it was." },
        { choice: 2, why: "DISTINCT dedupes values; a deduplicated shuffle is still a shuffle. Ordering is the missing contract, not uniqueness." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-23",
      prompt: "The quarter-close deck needs the latest three months of design cycles; the book runs 2024-01 through 2025-02. Which shape returns 2025-02, 2025-01, 2024-12?",
      choices: ["ORDER BY month ASC LIMIT 3", "ORDER BY month DESC LIMIT 3", "LIMIT 3 written before ORDER BY month", "WHERE month > 3"],
      answer: 1,
      why: "DESC puts the newest month first — 2025-02 — and LIMIT 3 keeps 2025-02, 2025-01, 2024-12. ASC plus LIMIT 3 keeps the OLDEST three (2024-01 through 2024-03): the classic direction flip that ships January's board in the March close and nobody notices because the query 'works'.",
      notes: [
        { choice: 0, why: "ASC-LIMIT grabs the head of the timeline. The query runs clean and answers a question nobody asked — the worst kind of wrong." },
        { choice: 3, why: "'month > 3' is a within-year numeric filter on TEXT months — it doesn't encode recency, and comparing '2024-…' strings to a number drifts straight into nonsense." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-24",
      prompt: "The MoM revenue walk uses ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY month), 2). 2024-01 prints NULL and a teammate COALESCEs it to 0. What's wrong with that?",
      choices: ["Nothing — the first month's delta is zero by definition", "LAG on the first row returns NULL because there is no predecessor; 0 asserts 'flat versus last month' — a fabricated fact. Keep NULL, or exclude month one from the delta column", "LAG requires PARTITION BY to produce row one", "The delta needs /100.0"],
      answer: 1,
      why: "NULL from LAG means 'no prior row exists' — information, not a defect. COALESCE to 0 manufactures a flat-month claim about a month with nothing to compare against, and the deck reads 'revenue held flat in 2024-01' as if it had been measured. Missing history and a measured zero are different cells.",
      notes: [
        { choice: 0, why: "Unknowable and zero are not the same. The COALESCE converts missing history into a fake measurement — the worst data-quality bug because it looks intentional." },
        { choice: 2, why: "PARTITION BY splits the walk into per-group walks; it has nothing to do with the missing predecessor at the boundary." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-25",
      prompt: "'Teams with both drafts AND exports but no publish' — why is the INTERSECT/EXCEPT chain the preferred membership test over joins?",
      choices: ["INTERSECT is always faster", "Membership is set logic: two DISTINCT team-id sets intersected, then EXCEPT the published set — no row multiplication and no DISTINCT-after-join cleanup; a three-way join pairs rows and re-collapses them, one drift away from a wrong list", "Joins cannot express two conditions at once", "EXCEPT automatically removes NULL teams"],
      answer: 1,
      why: "Set operators compare value sets directly — each leg dedupes to team ids, and the answer is set algebra with no fan-out to clean up. Joins compare row pairs: a team with 3 drafts and 2 exports pairs 6 times, and every added condition multiplies the collapse you must redo with DISTINCT — each cleanup is a fresh chance to drop or double a team.",
      notes: [
        { choice: 0, why: "At 16 teams both shapes run instantly; the argument is correctness under growth and legible intent, not raw speed." },
        { choice: 2, why: "Joins express anything — the issue is row multiplication and the DISTINCT crutch, not expressiveness." },
        { choice: 3, why: "EXCEPT removes rows present in the second set; NULL handling is the NOT IN trap only when NULLs enter the compared columns. It is not a built-in NULL filter." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-26",
      prompt: "Cohort revenue share in one query: ROUND(SUM(o.total) / SUM(SUM(o.total)) OVER (), 4) over a region GROUP BY. What does the empty OVER () do?",
      choices: ["Sorts the rows by total", "Runs after the fold: it sums the per-region SUMs into the 34,833.28 grand total and attaches that denominator to every row — region over grand prints the share (EU 15,089.23 is 43.3%)", "Removes duplicate regions", "Nothing — empty OVER () is invalid; a window needs PARTITION BY or ORDER BY"],
      answer: 1,
      why: "Windows evaluate after GROUP BY, so SUM(SUM(total)) OVER () folds the already-grouped region sums into the platform grand total and stamps it on every row. Dividing the two gives each region's share of the book — EU's 15,089.23 over 34,833.28 is 43.3% — in one scan, with no self-join back to the aggregated table.",
      notes: [
        { choice: 0, why: "OVER () orders nothing — an empty window declares the whole result set one partition; sorting is ORDER BY's job, outside the window." },
        { choice: 3, why: "The empty window is the canonical total-denominator idiom in SQLite — no PARTITION BY, no ORDER BY, on purpose." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-27",
      prompt: "Bill #25 shows 4,000 settled against 6,148 billed. What settlement coverage does the memo print?",
      choices: ["65.1%", "153.7%", "34.9%", "Open status means 0% — open bills never settle"],
      answer: 0,
      why: "Coverage is settled over billed: 4,000 / 6,148 = 65.1% — both cells verbatim off the #25 bill, the book's lone partial settlement. The 34.9% complement is the shortfall share, a different number with a different name, and the memo must not conflate the two.",
      notes: [
        { choice: 1, why: "153.7% is the division inverted (6,148 over 4,000) — coverage cannot clear 100% on a partially settled bill; the impossible percentage is the tell." },
        { choice: 2, why: "34.9% is the unpaid shortfall, not the coverage. Label the numerator and denominator or the memo contradicts its own ledger." },
        { choice: 3, why: "The book status is the label the team wrote, not the settlement state the payments table proves — 4,000 settled says otherwise. Status describes intent; coverage is measured." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-28",
      prompt: "WHERE c.id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') has returned a stable list for months — today it returns ZERO rows. What most plausibly changed?",
      choices: ["The customers table grew", "A cancelled cycle now carries a NULL customer_id — one NULL makes every NOT IN comparison UNKNOWN, so no row survives; use NOT EXISTS or filter NULLs inside the subquery", "NOT IN needs DISTINCT to stay stable", "The alias c collided with a new column"],
      answer: 1,
      why: "x NOT IN (a set containing NULL) can never evaluate to TRUE — the comparison against NULL is UNKNOWN, and UNKNOWN fails WHERE. One NULL-poisoned row silently empties the anti-join: the data grew a NULL, the query didn't change, and nothing errored.",
      notes: [
        { choice: 0, why: "Size is irrelevant — one NULL is enough among ten million clean rows. The failure mode is categorical, not volumetric." },
        { choice: 2, why: "DISTINCT changes the row count, not the NULL semantics — the poisoned set stays poisoned either way." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-29",
      prompt: "A 4-week rolling load chart: AVG(uses) OVER (ORDER BY week ROWS BETWEEN 3 PRECEDING AND CURRENT ROW). What does week 1's cell honestly show?",
      choices: ["The 4-week average — NULLs pad the missing weeks", "The average of week 1 alone — ROWS frames truncate at the partition edge, so weeks 1 through 3 are averages of 1, 2 and 3 weeks; annotate the ramp or start the chart at week 4", "It errors — the frame reaches past the partition", "Zero — no predecessors means no average"],
      answer: 1,
      why: "ROWS frames don't fabricate padding: at week 1 the frame is just the current row, at week 2 two rows, and so on — the early cells are honest averages over whatever exists. Presenting them as true 4-week averages mislabels the ramp; analysts either annotate the boundary or window the chart to start at week 4.",
      notes: [
        { choice: 0, why: "Windows never invent pad rows — the average shrinks truthfully. '4-week average' on a 1-row frame is a labeling lie, not an engine one." },
        { choice: 2, why: "Partial frames at boundaries are standard semantics — nothing errors, which is exactly why the ramp ships unnoticed." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-30",
      prompt: "Keep only the months ranked first on the momentum board: WHERE momentum_rank = 1 fails — the rank is computed in the same SELECT. The fix?",
      choices: ["Move the filter to HAVING", "Stage it: wrap the ranked query in a CTE or derived table and filter momentum_rank = 1 in the OUTER query — windows evaluate after WHERE and HAVING, so their output only exists one level up", "Write WHERE RANK() OVER (...) = 1 inline", "ORDER BY momentum_rank LIMIT 1 — same thing, cleaner"],
      answer: 1,
      why: "The pipeline is FROM, WHERE, GROUP BY, HAVING, SELECT (windows live here), ORDER BY. A window's value doesn't exist when WHERE runs, so the filter must happen one query level later — the ranked set becomes a table (CTE or derived) the outer WHERE filters like any column.",
      notes: [
        { choice: 0, why: "HAVING also runs before SELECT — same wall, later spelling. SQLite's alias leniency in GROUP BY and ORDER BY does not extend to filtering on window output." },
        { choice: 3, why: "LIMIT 1 returns one row globally — with ties (two months at rank 1) it arbitrarily keeps one. Different question, silent data loss." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-canva-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The template-variety board",
      brief:
        "Canva-flavored brief on the storefront db: Monday's growth review opens with the template-variety board — every team with its design cycles, raw template-use lines, DISTINCT templates used and billed design value, gated to real adoption. Probed facts: 251 use lines fold into 103 design cycles across 16 teams worth 34,833.28; the cycle ladder runs 24, 17, 14, 13; the variety ladder is a different ranking — 15, 15, 14, 13 distinct templates for the top four, while Chloe Dubois runs 10 templates on just 5 cycles and Pedro Alvarez squeezes 11 into 4. The board gates at 10+ distinct templates so one-off experiments never set policy.",
      ask: "Return each qualifying team with its design cycles, template lines, distinct templates and design value — heaviest value first.",
      template:
        "SELECT c.name AS team,\n       COUNT({3} o.id) AS design_cycles,\n       COUNT(*) AS template_lines,\n       COUNT(DISTINCT oi.product_id) AS distinct_templates,\n       ROUND(SUM({4}), 2) AS design_value\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.id, c.name\nHAVING COUNT(DISTINCT oi.product_id) >= {1}\nORDER BY design_value {2};",
      slots: [
        {
          answer: "10",
          kind: "number",
          label: "the variety floor",
          why: "The 10-template floor keeps exactly the six boards-qualified teams — Alice 15, Emma 15, Grace 14, Maya 13, Pedro 11, Chloe 10 — and 10 appears as Chloe's own distinct_templates cell. An 11 floor amputates Chloe; a 5 floor admits thirteen teams and the board becomes the whole account list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The board ranks billed design value descending — 7,262.35 takes row 1. ASC would crown the smallest book (Olivia Brown's 444.80) as the top adopter and the expansion conversation would start from the wrong end of the ladder.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the distinct-cycle fold",
          why: "COUNT(*) and COUNT(ALL o.id) both count template-use lines — 50 for Alice — while COUNT(DISTINCT o.id) folds them back to the 24 design cycles that actually carried them. Dropping DISTINCT makes the two grains identical and the board loses its collaboration-cadence read.",
        },
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the design-value fold",
          why: "Billed value is usage weighed by list price — quantity times unit_price per line, summed. Quantity alone prints raw units untethered from pricing; unit_price alone prints list-price sums that ignore how much of each template a team actually used.",
        },
      ],
      distractors: ["11", "5", "ASC", "ALL", "oi.quantity", "oi.unit_price"],
      walkthrough:
        "Two grains, one fold, one gate — with variety as the star column. Use lines join to cycles and to teams, fold per team, and the HAVING floor at 10 keeps six rows: Alice Chen (EU) at 24 distinct cycles but 50 raw lines and 15 templates for 7,262.35; Emma Wilson (US) at 17, 46, 15 for 6,640.56; Grace Kim (APAC) at 14, 34, 14 for 4,574.23; Maya Patel (APAC) at 13, 30, 13 for 3,644.56; Chloe Dubois (EU) at 5, 14, 10 for 2,667.93; Pedro Alvarez (EU) at 4, 13, 11 for 1,686.17. The read the board exists for: Pedro is the collage experimenter — 11 templates across only 4 cycles — while Maya runs 13 templates across 13 cycles, and Alice's 50-lines-versus-24-cycles gap (2.1 lines per cycle) is the fan-out intensity. Alice and Emma tie at 15 templates, so a ranked variant needs its tie policy named. The distractors each break differently: an 11 floor drops Chloe; a 5 floor floods the board; ASC crowns the 444.80 book; ALL makes cycles a copy of lines; quantity prints units as value; unit_price prints list sums untethered from usage. The lesson under the lesson: depth and variety are different adoption stories — a board that reports only one answers only half the growth question.",
    },
    {
      id: "cs-canva-2",
      tier: "hard",
      topic: "x2",
      universe: "catalog",
      title: "The one-pass template census",
      brief:
        "Canva-flavored brief on the storefront db: the catalog review needs a one-query census of template families — template lines, total uses, published uses and distinct teams — without folding four times and risking four drifting denominators. Probed facts: Audio is the crown family at 97 uses worth 11,744.01; Accessories is the workhorse at 121 uses; Fitness is the smallest at 27 uses. The review keeps families carrying at least 53 uses — a boundary that lands exactly on Wearables, the premium-list family whose ceiling SKU prices at 199.99.",
      ask: "Return each qualifying family with its template lines, total uses, published uses and distinct teams — heaviest use count first.",
      template:
        "SELECT p.category AS template_family,\n       COUNT(*) AS template_lines,\n       SUM(oi.quantity) AS uses,\n       SUM(oi.quantity) FILTER (WHERE o.status = {3}) AS published_uses,\n       COUNT(DISTINCT o.customer_id) AS teams\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nHAVING SUM(oi.quantity) >= {1}\nORDER BY uses {2};",
      slots: [
        {
          answer: "53",
          kind: "number",
          label: "the adoption floor",
          why: "The 53-use floor keeps six of the seven families and 53 appears as Wearables' own uses cell — the gate value shows up in the result. A 54 floor amputates Wearables too; a 27 floor admits all seven; a 61 floor keeps only the four heaviest.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The census ranks families by total uses descending — Accessories at 121 takes row 1. ASC would open on Fitness's 27 uses and the catalog conversation would start from the smallest family on the shelf.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the published-state marker",
          why: "Published is the delivered status — 52 of 103 cycles platform-wide. 'shipped' counts exported-awaiting-review as published and inflates every family by its review queue; 'cancelled' zeroes the column and the census loses its adoption read.",
        },
      ],
      distractors: ["54", "27", "61", "ASC", "'shipped'", "'cancelled'"],
      walkthrough:
        "One scan, many truths. Use lines join to cycles and to the catalog, fold per family, and FILTER (WHERE status = 'delivered') conditional-aggregates the published arm inside the same pass. The 53-use floor keeps six rows: Accessories 62 lines / 121 uses / 48 published / 14 teams, Audio 51 / 97 / 56 / 14, Electronics 44 / 85 / 40 / 12, Video 32 / 61 / 34 / 11, Apparel 24 / 54 / 30 / 10, Wearables 25 / 53 / 15 / 12 — Fitness gated out at 13 lines / 27 uses / 7 teams. The reads the review came for: Audio publishes the most (56 of 97) while Wearables — the premium-list family under the 199.99 ceiling — publishes just 15 of its 53 uses, and Accessories touches all 14 teams with the largest line count but only the second-largest published share. The distractors each break differently: 54 drops Wearables on the boundary, 27 re-admits Fitness, 61 halves the board, ASC opens on the smallest family, 'shipped' refiles review queues as published, 'cancelled' zeroes the arm. The lesson under the lesson: conditional aggregation is the census idiom — one scan, several denominators, and every arm's state named out loud.",
    },
    {
      id: "cs-canva-3",
      tier: "easy",
      topic: "x3",
      universe: "funnel",
      title: "The funnel-stage census with a grand row",
      brief:
        "Canva-flavored brief on the storefront db: Friday's funnel review needs the adoption ladder in one query — every stage of the 103-cycle design book with its cycle count, its team reach and its share of the book, plus a grand row so the 103 denominator is printed, not implied. Probed facts: 52 published cycles (50.5%), 30 exported-awaiting-review (29.1%), 14 still drafting (13.6%), 7 abandoned (6.8%); the published stage touches 15 of the 16 teams while abandoned touches only 4. The grand row must read TOTAL and the shares must divide by the full book — drafts and abandoned included — or the ladder quietly rebrands itself.",
      ask: "Return every funnel stage with its cycle count, distinct teams and share of the 103-cycle book — plus one TOTAL grand row, heaviest stage first.",
      template:
        "SELECT o.status AS stage,\n       COUNT(*) AS cycles,\n       COUNT({1} o.customer_id) AS teams,\n       ROUND(100.0 * COUNT(*) / {2}, 1) AS share_pct\nFROM orders o\nGROUP BY o.status\nUNION ALL\nSELECT {3} AS stage, COUNT(*) AS cycles, COUNT(DISTINCT customer_id) AS teams, 100.0 AS share_pct\nFROM orders\nORDER BY cycles {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the team fold",
          why: "COUNT(DISTINCT o.customer_id) folds repeats back to teams — delivered touches 15 of 16, abandoned only 4. ALL (or a bare column) makes teams a copy of cycles (52 versus 15) and the census loses its reach story: the stage-team pairs sum to 37 against 16 real teams, and only the DISTINCT fold keeps that straight.",
        },
        {
          answer: "103",
          kind: "number",
          label: "the book divisor",
          why: "Shares divide by the full 103-cycle book — 50.5, 29.1, 13.6, 6.8, the probed ladder exactly. 100 rescales them to 52.0/30.0/14.0/7.0 and the board stops matching every other funnel read; 82 divides by the stamped book only and silently drops drafts and abandoned from the denominator — the metric rebrands itself.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The stack's fifth row must read TOTAL so the 103 denominator is visible at the top of the deck. 'delivered' as the label prints a second delivered row worth 103 and the stage column sums to fiction; an unlabeled or mislabeled grand row is a claim about scope nobody can audit.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "ORDER BY cycles DESC puts TOTAL (103) on top, then published (52), exported (30), drafting (14), abandoned (7) — the deck leads with the denominator and the win. ASC leads with the 7-cycle leak, and the funnel conversation starts from its smallest stage.",
        },
      ],
      distractors: ["'delivered'", "'shipped'", "ALL", "o.id", "ASC", "100"],
      walkthrough:
        "One stack, two legs, one denominator. The first leg folds 103 cycles by current stage — 52 published touching 15 of the 16 teams, 30 exported touching 10, 14 drafts touching 8, 7 abandoned touching 4; the second leg appends the grand row: 103 cycles, all 16 teams once, 100.0 share. ORDER BY cycles DESC puts TOTAL on top (103 outranks 52) and the share column reproduces the probed ladder — 50.5, 29.1, 13.6, 6.8. The reads the deck came for: the book is half-published (50.5%) yet abandonment touches only 4 teams, so the leak is concentrated, not ambient; and the stage-team pairs sum to 37 against 16 distinct teams — the DISTINCT fold is what keeps reach from being double-counted. The distractors each break differently: 'delivered' or 'shipped' as the grand-row label prints a second stage row worth 103 and the column sums to fiction; ALL unfolds teams into cycle counts (delivered would read 52 teams); o.id in the grand leg errors on a missing alias; ASC leads the deck with the 7-cycle leak; 100 rescales every share to 52.0/30.0/14.0/7.0 and the board stops matching the probed ladder. The lesson under the lesson: a grand row is a claim about scope — label it, fold it distinctly, and divide by the book you say you are dividing by.",
    },
    {
      id: "cs-canva-4",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The settlement ledger",
      brief:
        "Canva-flavored brief on the storefront db: month-close needs the settlement ledger classified per team bill — billed versus settled, one row per bill, coverage named exact, partial or never settled. Probed facts: 28 bills in INTEGER cents; 21 settled to the cent summing 65,612; one partial, #25, settled 4,000 of 6,148; six bills with no settlement rows at all, worth 15,217. The book's status column lies twice — #11 is void yet carries a matching 925 settlement, and #28 claims paid with zero payment rows behind it — so coverage is measured from the payments table, never read off status.",
      ask: "Return every team bill with billed, settled and a coverage class — exact, partial or never settled — heaviest billed first.",
      template:
        "SELECT i.id AS bill_id,\n       i.status AS book_status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed,\n       ROUND(COALESCE(SUM({1}), 0) / 100.0, 2) AS settled,\n       CASE\n         WHEN SUM(p.amount_cents) IS NULL THEN {2}\n         WHEN SUM(p.amount_cents) {3} i.amount_cents THEN 'partial'\n         ELSE 'exact'\n       END AS coverage\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{4}\nGROUP BY i.id\nORDER BY billed DESC;",
      slots: [
        {
          answer: "p.amount_cents",
          kind: "keyword",
          label: "the settlement fold",
          why: "Settled money is the payments side folded per bill. A bare amount_cents is ambiguous — both tables carry the column — so the query refuses to run; SUM(i.amount_cents) settles every bill with itself (21 exact bills, zero AR); SUM(p.id) folds row numbers, not money. Only p.amount_cents measures what actually landed.",
        },
        {
          answer: "'never settled'",
          kind: "keyword",
          label: "the empty-arm label",
          why: "A NULL SUM means zero payment rows — the 6-bill, 15,217 AR bucket. 'partial' would blur never-settled bills into the #25 shortfall story and the AR list dissolves; 'exact' hides the bucket entirely. The label names the arm so the close can route it: chase, write off, or investigate (#28 claims paid with no rows at all).",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the shortfall test",
          why: "Partial means settled strictly under billed — exactly one bill qualifies, #25 at 4,000 of 6,148. <= relabels all 21 exact bills partial (equal sums pass the test); > fires for no bill on this book and drops #25 into exact, erasing the only shortfall the close exists to catch.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the bill-side join key",
          why: "p.invoice_id = i.id is the settlement grain: one fold per bill. Joining on i.customer_id matches payment rows against team ids — wrong sums on bills that happen to collide; joining on i.amount_cents matches nothing and every bill reads never settled, inventing 28 bills of AR overnight.",
        },
      ],
      distractors: ["customer_id", "amount_cents", "p.id", "<=", ">", "'partial'"],
      walkthrough:
        "One pass, three coverage classes, two status lies. Invoices LEFT JOIN payments and fold per bill: SUM(p.amount_cents) IS NULL marks the empty arm — 6 bills worth 15,217 with zero settlement rows; SUM short of the bill marks the shortfall arm — exactly one bill, #25, settled 4,000 of 6,148; everything else lands exact — 21 bills summing 65,612, including the five split-payment bills (1, 5, 12, 19, 22) whose two rows fold back to one settled figure. The wrinkle the memo exists for: book status lies twice — #11 is void yet settled to the cent (925), and #28 claims paid with no payment rows behind it — so coverage is measured from payments, never read from status. COALESCE(..., 0) prints 0.00 for the empty arm so the sort stays numeric and the AR rows still lead by billed size. The distractors each break differently: joining on customer_id settles bills against the wrong rows; the bare amount_cents is ambiguous (both tables carry it) and the query refuses to run; SUM(i.amount_cents) settles every bill with itself; SUM(p.id) folds row numbers, not money; <= relabels all 21 exact bills partial; > fires for no bill and drops #25 into exact; 'partial' as the empty-arm label blurs the 15,217 AR bucket into the shortfall story. The lesson under the lesson: LEFT JOIN plus a conditional fold is the coverage idiom — keep the unmatched rows, classify by settlement evidence, and let status be a claim you verify, not a number you read.",
    },
    {
      id: "cs-canva-5",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "Above the platform average",
      brief:
        "Canva-flavored brief on the storefront db: the tier team wants every design cycle billed above the platform average, with the average computed — never hardcoded — and carried alongside for context. Probed facts: 103 cycles, 34,833.28 of billed value, a 338.19 average, a 25.47 floor and a 1,088.44 ceiling. The ceiling belongs to cycle #74 (Farid Nasser) and must lead the list; the average has to survive as its own column so every reviewer sees the line each bill clears.",
      ask: "Return every design cycle billed above the computed platform average, carrying the average as its own column — heaviest bill first.",
      template:
        "SELECT o.id AS cycle_id,\n       c.name AS team,\n       ROUND(o.total, 2) AS billed_value,\n       ROUND((SELECT AVG(total) FROM orders), 2) AS platform_avg\nFROM orders o\nJOIN customers c ON c.id = o.{1}\nWHERE o.total > {2}\nORDER BY billed_value {3};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the team-join key",
          why: "c.id = o.customer_id ties each cycle to the team that owns it — the tier conversation is had with teams, not cycle ids. Joining on o.id pairs customers with whatever cycle shares their row number: 16 mismatched rows of noise, and Farid's 1,088.44 ceiling may not even survive the join.",
        },
        {
          answer: "(SELECT AVG(total) FROM orders)",
          kind: "keyword",
          label: "the average probe",
          why: "The benchmark must be computed, not typed: the scalar subquery folds all 103 cycles once (34,833.28 / 103 = 338.19) and serves twice — unrounded here as the comparison line, rounded in the display column. AVG(total) bare in WHERE is the pipeline violation the error message names; 34,833.28 or 1,088.44 as the line returns zero rows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The list must lead with the 1,088.44 ceiling (#74, Farid Nasser), then 945.21 and 845.92 — the tier conversation starts at the top of the book. ASC opens on the smallest bill above the line and the review begins at the boundary instead of the ceiling.",
        },
      ],
      distractors: ["34833.28", "1088.44", "25.47", "AVG(total)", "ASC", "o.id"],
      walkthrough:
        "One average, two jobs. The scalar subquery folds all 103 cycles once — 34,833.28 over 103 = 338.19 — and serves twice: unrounded inside the WHERE as the comparison line, rounded into the display column so every row carries its benchmark. The book above the line runs 42 cycles, led by #74 (Farid Nasser) at the 1,088.44 ceiling, then 945.21 (Chloe Dubois) and 845.92 (Emma Wilson); DESC puts the ceiling first, which is the order the tier conversation needs. The join key matters: customer_id ties each cycle to its team — join on o.id and teams pair with arbitrary cycles, 16 rows of noise. The distractors each break differently: 34,833.28 compares against the whole book's value and returns zero rows; 1,088.44 compares against the maximum and also returns zero; 25.47 compares against the minimum and returns the entire book; AVG(total) bare in WHERE is the pipeline violation — aggregates don't exist at filter time; ASC opens on the smallest bill above the line instead of the ceiling; o.id as the join key produces 16 mismatched rows. The lesson under the lesson: a benchmark computed in a scalar subquery is one fold serving two jobs — compute it once, round it for display, compare against it raw.",
    },
    {
      id: "cs-canva-6",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The monthly momentum board",
      brief:
        "Canva-flavored brief on the storefront db: the growth review ranks months by design-cycle volume, gated at 8-plus cycles so trough months never set policy. Probed facts: 2024-02 and 2024-09 tie at the top with 9 cycles; a four-way tie at 8 (2024-01, 2024-03, 2024-05, 2024-07); five months sit at 7 and three at 6. Ranks must honor ties the way the board signed them — shared rank, gap included — and ties break by calendar order for display. Same volume, different value: the two peak months billed 3,609.64 and 3,116.04, and July's 8 cycles carried only 1,193.86.",
      ask: "Return every month with at least 8 design cycles, its cycle count and tie-aware momentum rank — heaviest volume first, calendar order breaking ties.",
      template:
        "SELECT SUBSTR(o.created_at, 1, 7) AS month,\n       COUNT(*) AS cycles,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS momentum_rank\nFROM orders o\nGROUP BY SUBSTR(o.created_at, 1, 7)\nHAVING COUNT(*) >= {3}\nORDER BY cycles DESC, month;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-aware rank",
          why: "The board's signed policy is shared rank with the gap: both 9-cycle months take rank 1, rank 2 stays empty, the 8-cycle quartet lands rank 3. DENSE_RANK closes the gap and hands the quartet rank 2 — a different policy the deck never approved; ROW_NUMBER arbitrarily crowns one peak month over its exact tie.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the peak-first direction",
          why: "Ranks order by cycle count descending — the peaks rank 1, the quartet 3. ASC inverts the OVER ordering: the 8s rank 1 through 4 and the 9s land at 5, while the display still leads with the peaks — a rank column that contradicts the rows it sits on.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the volume floor",
          why: "The 8-plus gate keeps exactly the six board months — the two 9s and the four 8s — and 8 appears as the tied cells themselves. A 9 gate amputates the quartet; a 7 gate re-admits five 7-cycle months (2024-04, 2024-08, 2024-10, 2024-12, 2025-02) and the board loses the floor the policy exists for.",
        },
      ],
      distractors: ["7", "9", "DENSE_RANK", "ROW_NUMBER", "ASC"],
      walkthrough:
        "Volume rank with the tie policy on the label. The month fold groups 103 cycles into 14 monthly buckets; the 8-plus gate keeps six — the peak pair (2024-02, 2024-09) at 9 cycles and the quartet (2024-01, 2024-03, 2024-05, 2024-07) at 8 — and RANK over the grouped COUNT gives the tie-aware ladder: both 9s share rank 1, rank 2 stays empty, the quartet lands rank 3 in calendar order. Same volume, different value: 2024-02 billed 3,609.64 while 2024-09 billed 3,116.04, and July's 8 cycles carried only 1,193.86 — volume ranks design load, never dollars. The distractors each break differently: a 9 gate amputates the quartet; a 7 gate re-admits five 7-cycle months and the board loses its floor; DENSE_RANK closes the gap and hands the quartet rank 2 — a policy the deck didn't sign; ROW_NUMBER arbitrarily crowns 2024-02 over its exact tie; ASC inverts the OVER ordering so the 8s rank above the 9s while the display still leads with the peak. The lesson under the lesson: windows evaluate after the fold — rank the grouped COUNT, name the tie policy out loud, and never let a ranking function choose it for you.",
    },
  ],

  problems: [
    { slug: "ltv-cac-payback", why: "The theme menu tags this row Canva — LTV against CAC with payback months: the education-to-pro unit-economics question the monetization deck is built on." },
    { slug: "trial-to-paid-funnel", why: "Education-to-pro conversion counted conditionally with the denominator named — the upgrade funnel the tier ladder exists to price." },
    { slug: "funnel-step-conversion", why: "Funnel pivot with FIRST_VALUE — draft, export, publish step rates per team: the collaboration pipeline the growth review opens with." },
    { slug: "email-engagement-funnel", why: "Invite-to-collaboration funnel — team invites that convert to shared designs: the viral-loop read Canva's growth model runs on." },
    { slug: "growth-accounting", why: "LAG status pivot — new, retained, resurrected, churned teams month over month: the movement walk the board deck is drawn from." },
    { slug: "cohort-retention-matrix", why: "Cohort offset matrix — team signup cohorts tracked against their publish behavior months later: the retention surface every template launch is judged on." },
    { slug: "winback-recovery", why: "Winback window — dormant teams that resume publishing inside the recovery window: the reactivation list the education tier is priced to refill." },
    { slug: "net-revenue-retention", why: "Cohort revenue retention — billed value this period versus last per team cohort: the NRR read design boards price expansion on." },
    { slug: "median-time-to-convert", why: "Median emulation — the middle team's draft-to-publish clock, not the mean the outliers drag: the honest latency read for the 82-of-103 stamped book." },
    { slug: "keep-latest-dedupe", why: "Keep-latest ROW_NUMBER dedupe — one current engagement state per team from a messy cycle history, the dedupe the adoption board runs nightly." },
    { slug: "plan-migration-paths", why: "LAG tier transitions — teams moving education to pro across cycle history: the upgrade path that justifies the two-tier catalog." },
    { slug: "customers-who-bought-all-products", why: "Relational division — full-gallery adoption: teams that have used every template family, the completeness check behind the 'whole-team deployment' claim." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-template adoption logic — teams with drafts AND exports but no publish: the stuck-in-review list the gallery pod works on Mondays." },
    { slug: "feature-adoption-windows", why: "Adoption windows measure the gap between team start and sustained use — the time-to-publish read (2.98-day average, 2-to-4 range) at query shape." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV — template lines per design cycle against the 338.19 average: the attach-depth read behind every engagement board." },
    { slug: "repeat-purchase-rate", why: "Repeat purchase rate — teams returning cycle over cycle: the renewal share the team book is actually graded on." },
    { slug: "active-users", why: "Weekly active seats — seats that design at least once in the period: the denominator every engagement wall on the adoption board is cut from." },
    { slug: "dau-wau-stickiness", why: "Daily actives over weekly actives: the stickiness ratio that separates teams living in the editor from teams dropping in for a single export." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives smooth the school-term weekend dips — the smoothing the education-cohort dashboards run before any trend call is made." },
    { slug: "sessionize-events", why: "Stitch raw edit events into design sessions on a gap rule: the sessionization pass every design-time and collaboration metric is cut from." },
    { slug: "find-zombie-sessions", why: "Sessions opened and never resumed: the abandoned-draft census behind the 7-of-103 abandoned read the funnel review opens with." },
    { slug: "viewers-turned-streamers", why: "Browsers who become publishers — template viewers whose first publish lands: the activation moment the template-to-publish funnel exists to count." },
    { slug: "analyze-subscription-conversion", why: "Free-to-paid conversion by cohort with the denominator named: the upgrade read the education tier's pricing is defended with." },
    { slug: "ab-test-conversion-lift", why: "Lift between paywall variants on the template gallery: the experiment read behind every free-to-paid conversion tweak." },
    { slug: "mrr-waterfall", why: "The MRR bridge — new, seat-expansion, contraction, churn: the movement walk monetization presents at the monthly board." },
    { slug: "week-over-week-churn", why: "Week-over-week seat churn after term-end: the education-lapse signal that sets the winback calendar." },
    { slug: "rfm-segmentation", why: "Recency, frequency, monetary on the design-cycle ledger: the segmentation that decides which teams get the pro-tier push." },
    { slug: "usage-tier-percentiles", why: "Usage percentiles per seat: the threshold-finding query that decides where education ends and pro begins." },
    { slug: "prepayment-detection", why: "Bills settled before their due date: the early-payment read on the 28-bill team book, 21 of which settle to the cent." },
    { slug: "duplicate-charge-pairs", why: "Duplicate settlements against one bill: the payment-audit pattern that keeps 27 payment rows honest against 28 invoices." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest print order per template SKU: the reorder queue print operations works from, one row per design." },
    { slug: "occupations-pivot", why: "Seat roster pivoted by role — educator, student, designer: the education-plan census the seat-expansion deck is built on." },
  ],
};
