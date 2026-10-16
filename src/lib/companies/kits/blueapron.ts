// Blue Apron — Wave-10 (Task 100), food domain, NO tagged pool — theme-curated; facts from
// scripts/company-facts.md (+ its "Probe-derived canonical cells — wave-8+9 agent dumps" section).
// Meal-kit subscription SQL: the storefront db read as a weekly-box sandbox — customers are
// subscriber households (region = the four market rollups carried as the db's EU/APAC/US/LATAM
// codes), orders are weekly box cycles (delivered = delivered box 52, shipped = in-cold-chain
// with shipped_at as the dispatch stamp 30, pending = paused/queued week 14, cancelled =
// skipped/churned 7), order_items are box line records (quantity = portions, unit_price =
// per-portion price), products are recipe/meal SKUs, suppliers are farm & protein partners,
// invoices are subscription billing statements, payments are the card/wire payment rails,
// expenses are fulfillment/ingredient opex, ledger_entries are the GL. Finance tables store
// INTEGER cents (dollar read = amount_cents / 100.0); orders.total and order_items.unit_price
// are REAL dollars. Angles kept DISTINCT from hellofresh.ts: per-portion waste economics
// (pantry surplus = planned stock minus boxed portions), pause-vs-churn divergence (a pause is
// a decision, a skip is a verdict), and the box-size ladder at household and recipe grain.
// Pool provenance: company-pools.md carries NO Blue Apron section — 0 tagged rows — so all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's SQL theme menu
// (sql rows only, no w*/d*/f* rows) and say so in brief P4. Case briefs quote probed figures
// from scripts/company-facts.md; every case slot is mechanically verified against db/custom.db
// by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const blueapronKit: CompanyKit = {
  id: "blueapron",
  domainId: "food",
  name: "Blue Apron",
  tagline: "Weekly box economics at per-portion grain",
  accent: "text-teal-300",

  brief: [
    "**Blue Apron** pioneered the US meal kit: households pick a plan, recipes and pre-portioned ingredients ship weekly, and the whole P&L is a portion game — every week is planned pantry portions versus boxed portions, and the gap is either a sold-out menu or an ingredient-waste write-off. On the training db that world is small enough to hold in your head: **16 subscriber households**, **103 weekly box cycles** worth 34,833.28, and **251 box line records** — recipes × portions at a per-portion price — across a 16-recipe menu sourced from 6 farm and protein partners.",
    "The data org splits along the portion. Lifecycle analytics owns cadence — the box ladder, pause durations, the week-5 drop-off everyone chases; supply analytics owns the pantry — recipe velocity, planned-versus-boxed portions, the surplus ledger that becomes waste dollars; billing ops owns the renewal queue, where money is INTEGER cents and a missing `/100.0` is a 100x incident. The culture is SQL-first, and the box stream is the raw material every review folds: {emerald:delivered} 52, {sky:in-cold-chain} 30 with shipped_at as the dispatch stamp, {amber:paused} 14, {rose:skipped} 7 — and the honest read is that a pause is a decision you can win back while a skip is a verdict.",
    "Interviews are hands-on SQL against a storefront-shaped schema in a plain editor, and the screens are the business in miniature: the pause-churn split per market (EU's 45 boxes carry 6 paused weeks against 3 skipped, US 3 against 1), the per-portion price bands (portions under 55 a box carry **268 portions at a 31.01 average**, 55-plus carry 230 at 115.85), the pantry surplus fold, and the billing anti-join — **6 statements / 15,217.00** with no settlement, one of them marked {emerald:paid} with zero payment rows (anomaly #28 at 1,756.00). Dispatch latency reads `shipped_at - created_at`: **82 of 103** cycles stamped, averaging 2.98 days on a 2..4 spread.",
    "Prep like a portion economist, not a generic SQL student. Drill the box ladder until HAVING gates are reflex (the ladder reads **24/17/14/13/5** with a tie at 4 below), drill pause-versus-churn as two separate conditional counts with denominators said out loud, and drill the pantry ledger — planned stock minus boxed portions, folded per recipe before it folds per menu family — because surplus is where this business bleeds. The problem pool here carries **no tagged Blue Apron section**: every topic set and every problem below is **theme-curated** from the SQL band, each one mapped to a workflow Blue Apron screens are known to probe.",
  ],

  dayInLife: [
    "**08:15 —** open the box-health board before the supply standup: last week's 103 placed cycles, the {amber:paused} column beside the {rose:skipped} column — 14 versus 7 network-wide, and the split is the whole story — plus the ladder: the four power households at **24/17/14/13/5** boxes and the tie at 4 underneath. A market's pause share looks off; before pinging anyone you re-run the census yourself — `COUNT(*)` for boxes beside a distinct customer count for households — because a market read that quotes boxes when the deck says households is the bug that survives to the board.",
    "**11:30 —** deep work: the pantry surplus ledger before next week's menu locks. You stage the per-recipe fold in a `pantry` CTE — stock staged against portions actually boxed — then roll it to menu families: Accessories 940 planned against 121 boxed is **819 surplus portions** of exposure, Audio 315 against 97 is 218, and the one-recipe Fitness family gets flagged for a dedicated sourcing review. The supply lead wants the fold ranked worst-first and wants the single-recipe families separated, because *a surplus you cannot spread across a family is a sourcing decision, not a forecasting rounding error*.",
    "**15:30 —** billing-ops cycle on the renewal queue. The anti-join prints **6 statements / 15,217.00** with no settlement legs, one marked {emerald:paid} with zero payment rows — a reconciliation finding, not a dunning case — and the partial (4,000 of 6,148) goes on its own worklist. You walk the dunning lead through the cents rule one more time: finance tables are integer cents, the dollar read is `amount_cents / 100.0`, divide once and round once. The EOD note is one page — pause-churn split, surplus ledger, dunning queue — *because the queries are the exhibit and every figure traces to a fold you can re-run on demand*.",
  ],

  metrics: [
    {
      name: "Box ladder",
      what: "Box cycles per household, banded: 2 one-box households, 10 at 2-5 boxes, and 4 power households whose ladder reads 24/17/14/13/5. The cadence engine is the growth story, so the bands are watched weekly — never the average.",
    },
    {
      name: "Pause-vs-churn census",
      what: "{amber:paused} weeks (14 of 103 placed = 13.6%) tracked BESIDE {rose:skipped} weeks (7 = 6.8%) — APAC pauses 13.5 of its book while churning 8.1. A pause is a decision, a skip is a verdict, and boards that merge them misread winback inventory as lost demand.",
    },
    {
      name: "Dispatch latency",
      what: "Dispatch minus order time over cycles that HAVE a stamp: 82 of 103 (52 delivered + 30 in-cold-chain), avg 2.98 days on a 2..4 range. The 14 paused and 7 skipped carry no stamp — a population definition, not a cleanup job.",
    },
    {
      name: "Box value (AOV)",
      what: "Box value ÷ boxes: 34,833.28 ÷ 103 = **338.19**, from a 25.47 minimum to a 1,088.44 family plan. Markets above and below the 338.19 baseline are the scalar-subquery comparison every screen drills.",
    },
    {
      name: "Per-portion price bands",
      what: "Portions priced under 55 a box: 268 portions at a 31.01 average line price. Portions at 55-plus: 230 at 115.85. The two bands are the menu's economy-versus-premium split, and the band edge is a definition nobody moves mid-quarter.",
    },
    {
      name: "Pantry surplus ledger",
      what: "Planned stock minus boxed portions per recipe, folded to menu families: Accessories 940 planned vs 121 boxed = 819 surplus, Audio 315 vs 97 = 218, Fitness 220 vs 27 = 193 on a single recipe. Surplus is the ingredient-waste line before a crate spoils.",
    },
    {
      name: "Dunning exposure",
      what: "Renewal statements with no settlement: 6 statements, **15,217.00** — one marked {emerald:paid} with zero payment rows (anomaly #28 at 1,756.00) and one partial (4,000 of 6,148). The queue is an anti-join — LEFT JOIN … IS NULL — not a status filter.",
    },
    {
      name: "Partner concentration",
      what: "Menu value per farm/protein partner: Nordic **32.0%** (11,130.25) and Midwest 26.7% (9,294.93) — two names carry 58.7% of partner-sourced value, and the trusted bench (rating 4.5-plus) is exactly two partners. Supply reads pair volume with rating, never revenue alone.",
    },
  ],

  topics: [
    {
      name: "Box cadence & the order ladder",
      why: "Blue Apron is a cadence business, and the first screen is always the ladder: box cycles per household, banded, gated with HAVING. The trap is grain — COUNT(*) counts cycles, COUNT(DISTINCT customer_id) folds repeat demand back to the 16 households, and the gap between them is boxes per household per window.",
      slugs: ["customer-order-frequency", "repeat-purchase-rate", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Pause, skip & kept demand",
      why: "The lifecycle board's most-watched pair is {amber:paused} 14 beside {rose:skipped} 7 of 103 placed, and both are conditional counts before they are percentages: SUM(CASE WHEN status = …) over the same COUNT(*) that divides. Screens drill the split until nobody merges a winnable pause into a churn verdict — and until kept-demand shares quote the placed denominator out loud.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "week-over-week-churn"],
    },
    {
      name: "The two-grain census",
      why: "'Boxes AND households per market' opens every lifecycle review: EU 45 cycles from 8 households, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug that turns a household read into a box count.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Pause windows & reactivation",
      why: "A paused household is winback inventory with a clock on it: pause durations, two-purchases-within-a-window style re-engagement tests, and the dormant list before the pause becomes a skip. Screens drill date-diff windows, first/last-event subqueries and the anti-join that finds households reachable but untouched.",
      slugs: ["users-with-two-purchases-within-seven-days", "find-churn-risk-customers", "dormant-reactivation"],
    },
    {
      name: "Billing anti-joins & the dunning queue",
      why: "Billing ops lives on absence: renewal statements with no settlement, settlements with no statement. On this db every household has ordered (never-ordered = 0 — the subscriber anti-join is empty), so the honest drill is billing: 6 statements worth 15,217.00 including the {emerald:paid}-with-no-legs anomaly #28 — LEFT JOIN … IS NULL and NOT EXISTS until reflex.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Box economics & CASE bands",
      why: "Plans and portion bands are CASE histograms: the per-portion fold reads 268 budget portions at 31.01 against 230 family portions at 115.85, and the band edge is a published definition. Screens drill the CASE arm until the ELSE arm's absence reads as a finding — an empty premium band means the ladder tops out, not that the query is broken.",
      slugs: ["the-category-of-each-member-in-the-store", "spend-histogram", "calculate-orders-within-each-interval"],
    },
    {
      name: "Portion ladders & the rank trio",
      why: "The recipe portion ladder runs 47 down to 21 with ties everywhere — 36 twice, 30 three times, 21 three times — and ladder reporting is leaderboard reporting. ROW_NUMBER, RANK and DENSE_RANK differ exactly at those ties, and 'why does my top-10 return 12 recipes' is the tie policy you were supposed to state before the query ran.",
      slugs: ["rank-scores", "top-earners", "usage-tier-percentiles"],
    },
    {
      name: "Menu-family economics & the supply join",
      why: "The supply fold chains farm partners → recipe SKUs → box lines, and per-portion economics is a join-and-ratio fold: realized per-portion price against list, value per partner, each household's most-cooked recipe. The argmax shapes ride the same chain, and the tie policy is part of the definition, not a footnote.",
      slugs: ["average-selling-price", "top-travellers", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Waste ledgers & running math",
      why: "Surplus is stock minus boxed, and the ledger must stage the per-recipe fold before it rolls to families — exactly the two-stage shape derived tables and CTEs exist for. Screens drill cumulative portion staging, running-capacity gates and the frame semantics that decide whether a tie jumps the running total.",
      slugs: ["game-play-analysis-iii", "find-cumulative-salary-of-an-employee", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "Data quality & the NULL pantry",
      why: "The pantry punishes optimism: menu names arrive case-broken and split one recipe into two, COUNT(shipped_at) silently shrinks the population to the 82 stamped cycles, and NULL-safe filters decide whether the paused-but-never-skipped list is honest. The house rule — every fold states its NULL arm — is drilled as reflex, not policy memo.",
      slugs: ["null-blank-audit", "find-customer-referee", "books-with-null-ratings"],
    },
  ],

  theory: [
    {
      id: "blueapron-t1",
      q: "The box census joins cycles to households; the pantry ledger joins recipes to box lines. When do you fold at box grain versus line grain, and what does the 251-over-103 fan-out do to each aggregate?",
      a: "Decide from what one row of the output means. At box grain, one row is a weekly cycle: COUNT(*) over orders reads 103, SUM(o.total) reads 34,833.28, and joining customers only paints region on — no fan-out, because the join key is the row grain. At line grain, one row is a recipe-line inside a box: the join to order_items fans 103 cycles into 251 lines, and that fan-out is the POINT for exactly one aggregate family — SUM(oi.quantity) reads the 498 portions actually boxed, and SUM(oi.quantity * oi.unit_price) reads line value, because each line deserves to be counted once. The trap is everything else: COUNT(*) after the join reads 251 while the deck says 103 boxes, COUNT(DISTINCT o.customer_id) must fold the lines back to households before any household rate divides, and SUM(o.total) after the join repeats each box's total once per line — revenue inflates by the 2.44 lines-per-box ratio and the number is wrong in a way that still looks plausible. The house fix is staging: fold per recipe (or per box) first in a CTE, then roll to the family grain — the pantry surplus ledger is built exactly that way, because SUM(p.stock) joined straight to lines counts every recipe's pantry once per line record and Accessories' 940 planned portions become a fictional number.",
      tag: "joins",
    },
    {
      id: "blueapron-t2",
      q: "Supply wants every recipe kept on the ledger but painted with its family's context and its ladder rank. Why is GROUP BY the wrong paint and a window function the right one?",
      a: "GROUP BY folds: 16 recipes become 7 menu families and the recipe detail is gone — fine for the family rollup, fatal when the ledger wants each recipe beside its family baseline. SUM(...) OVER (PARTITION BY menu_family) keeps every row and paints the family total onto it, so per-recipe share is one expression: recipe portions minus the family window, or the ratio against it. Ranking is the same discipline: RANK() OVER (ORDER BY portions DESC) keeps all 16 recipes and hands out rungs — on this menu the ladder reads 47, 46, 38, then a two-way tie at 36 sharing rank 4 and skipping 5, then 33, 31, and a three-way tie at 30 consuming ranks 8 through 10, so the next recipe lands on 11. The tie policy is a business decision and you say it out loud: RANK with gaps is the published board semantics, DENSE_RANK compacts the rungs, ROW_NUMBER breaks ties arbitrarily unless you add a tiebreaker column. My rule for the ledger: windows to paint and rank, GROUP BY to fold — and when a review asks for both, the CTE folds per recipe first, the outer query paints with windows, and nobody mixes the two in one SELECT.",
      tag: "windows",
    },
    {
      id: "blueapron-t3",
      q: "The lifecycle board prints 'boxes placed' and 'households covered' side by side — EU reads 45 boxes from 8 households. Why do the columns disagree, and where do pause and churn counts live in the same fold?",
      a: "They disagree because they count at different grains in the same SELECT. COUNT(*) counts box cycles after the join — one row per cycle, so a household running 24 boxes contributes 24. COUNT(DISTINCT o.customer_id) folds those rows back to households — EU's 45 cycles collapse to 8 logos, APAC 37 to 5, US 19 to 2, LATAM 2 to 1. The gap between the columns is the cadence metric: boxes per household, which is the whole subscription story. Pause and churn live in the same fold as conditional counts over the SAME population: SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) reads the 14 paused weeks, the cancelled arm reads the 7 skipped, and both shares divide by COUNT(*) over all placed cycles — never by a pre-filtered denominator. The definition I pin before the fold: a paused week is a decision (winback inventory), a skipped week is a verdict (churn), and the churn share reads 6.7 in EU, 8.1 in APAC, 5.3 in US against the full placed book, paused weeks included. Merge the two arms into one 'lost demand' column and the board can no longer tell a winnable household from a gone one — which is exactly the merge this business cannot afford.",
      tag: "aggregation",
    },
    {
      id: "blueapron-t4",
      q: "shipped_at is NULL until a box dispatches. What is your NULL policy for the dispatch-latency read, and how do COUNT and AVG actually behave on that column?",
      a: "Policy first, mechanics second. The policy: only dispatched cycles have a latency, so the read measures order-to-dispatch for the 82 of 103 cycles that carry a stamp — 52 delivered plus 30 in-cold-chain — and says so in the title; the 14 paused and 7 skipped cycles have no stamp because no dispatch happened, which is a population definition, not a data-quality ticket. The mechanics: COUNT(*) counts all 103 rows, COUNT(shipped_at) counts only the 82 non-null stamps, and AVG(julianday(shipped_at) - julianday(created_at)) ignores NULLs automatically — it returns 2.98 days over the stamped 82 with a 2..4 range, whether or not you wrote the WHERE clause, which is exactly why the silent-shrink trap is dangerous: the no-WHERE version prints the same 2.98 wearing the wrong population name. What I never do is COALESCE the latency to zero for the unstamped 21 — that drags paused cycles into the average as same-day dispatches and flatters the fulfillment network precisely where nothing shipped. The honest shapes: COUNT(*) and COUNT(shipped_at) side by side so the stamped share is visible, the AVG with its population stated, and the unstamped 21 reported as their own census arm rather than laundered through a default value.",
      tag: "nulls",
    },
    {
      id: "blueapron-t5",
      q: "The pantry ledger keeps only families carrying at least two recipes; the box census keeps only delivered cycles. Where does each filter live in the evaluation pipeline, and what breaks when it moves?",
      a: "Two filters, two clauses, and the pipeline explains why: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. The status rule is a row-level fact — status = 'delivered' discards paused, cold-chain and skipped rows before any fold exists, so it lives in WHERE; moving it to HAVING is impossible because individual statuses no longer exist once rows are grouped. The two-recipe family floor is a group-level fact — COUNT(*) >= 2 judges families that only exist after GROUP BY, so it lives in HAVING; moving it to WHERE fails outright because COUNT(*) references a fold that has not happened, and SQLite rejects the alias too since SELECT's names are created after WHERE runs. On this db the HAVING floor drops exactly the one-recipe Fitness family — 220 planned portions against 27 boxed — which is a definition the supply lead chose so single-recipe families get a dedicated sourcing review instead of hiding in the family fold, and I can defend it as policy, not query convenience. The audit shape I run before shipping: every filter named with its clause and its grain — row-level in WHERE, group-level in HAVING — because a floor that silently moves clauses does not error; it just changes who survives the ledger.",
      tag: "pipeline",
    },
    {
      id: "blueapron-t6",
      q: "The pantry surplus ledger stages a per-recipe fold before it rolls to menu families. Why does that want a CTE, and what is the scalar subquery's contract when you compare against it?",
      a: "Because you cannot fold twice in one SELECT: the per-recipe grain (pantry stock, portions boxed, the surplus arithmetic) is itself an aggregate, and the family rollup aggregates those aggregates — SQLite will not let one SELECT group by recipe and family simultaneously. WITH pantry AS (SELECT p.id, p.category, p.stock, SUM(oi.quantity) … GROUP BY p.id) stages the recipe fold once, names it, and the outer SELECT rolls it: COUNT(*) reads recipes per family, SUM(pantry_portions) and SUM(portions_boxed) roll the planned-versus-boxed story, and the surplus is their difference — Accessories 940 against 121, Apparel 510 against 54. The same staging discipline powers the household ladder: per-household folds first, the gate second. The scalar subquery is the single-row cousin of this pattern, and its contract is 0-or-1 rows, 1 column: one row drives the comparison (the 338.19 network AOV painted beside every market), zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently empties while looking valid. My selection rule: scalar when I need one value per outer row, IN when testing membership in a set, EXISTS when existence itself is the question — and a CTE whenever the staging needs a name, because 'pantry' reads like the memo while a nested derived table reads like the plumbing.",
      tag: "subqueries",
    },
    {
      id: "blueapron-t7",
      q: "Box cycles carry TEXT timestamps. How do you compute dispatch latency and build the weekly menu spine without lying about either?",
      a: "Latency is julianday(shipped_at) - julianday(created_at), computed only where shipped_at IS NOT NULL — 82 of 103 cycles, averaging 2.98 days on a 2..4 range. The db stores whole days at this scale; production streams the identical query in hours against the cold-chain SLA, and I say the unit out loud so the number is never misread as minutes. Month buckets are SUBSTR(created_at, 1, 7): the '%Y-%m' slice sorts lexicographically, groups cleanly, and carries the 2024-01 through 2025-02 spine — 3,731.97 in the January peak against 1,193.86 in the July trough. Weeks are where the substring lies: a week straddles two months, '%W' is not ISO, and no slice of the date gives you week 7 of a year — so the weekly menu spine snaps each cycle to its week start with date(created_at, 'weekday 0', '-6 days') or uses strftime('%Y-%W', created_at) with its caveats stated. One grain rule carries all of it: placed-time buckets (created_at) and dispatched-time buckets (shipped_at) are different spines — demand was placed in January and dispatched in January here, but a paused cycle that dispatches late crosses buckets, and merging the two grains is how a fulfillment slip gets reported as a demand dip. The bucket key, the unit and the timestamp column are all part of the metric definition.",
      tag: "dates",
    },
    {
      id: "blueapron-t8",
      q: "Month-close hands you the billing book before the dunning queue ships. What are the checks you run, and what does the reconciliation anomaly teach about status columns?",
      a: "Three checks, in the order they burn. Cents: finance tables store INTEGER cents, so every dollar read is amount_cents / 100.0 — divide once at the read boundary, round once for display, never mid-pipeline; the dunning queue reads 15,217.00 dollars, not 1,521,700 cents, and integer division anywhere in the fold is the 100x incident. Grain: every number states its population — 103 cycles placed, 82 stamped, 14 paused, 7 skipped, 6 statements unpaid — and any join to box lines pre-aggregates or the 251-line fan-out inflates the fold. Absence: the dunning queue is an anti-join, invoices LEFT JOIN payments WHERE the payment side IS NULL, because the queue's definition IS missing settlement rows — 6 statements, 15,217.00, including #28 at 1,756.00, which is marked 'paid' with zero payment rows. That last one is the lesson the status column teaches: status is a label someone wrote, payments are the ledger of record, and the two disagree exactly once on this book — a paid-status statement with no legs is a reconciliation finding, not a dunning case, and it goes to a different worklist than the partial (#25, 4,000 of 6,148). The trial balance (181,080 debits against 181,080 credits, delta zero) proves double-entry held at write time and proves nothing about classification — the anomaly balances perfectly and is still wrong.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "blueapron-mcq-1",
      prompt: "A box cycle's status reads 'pending'. In this kit's Blue Apron stage map, what happened?",
      choices: [
        "Paused — the household queued or skipped this week's box without churning",
        "In cold chain — the box dispatched with a shipped_at stamp",
        "Skipped/churned — the household quit the plan",
        "Delivered — the box landed complete",
      ],
      answer: 0,
      why: "The stage map is fixed: pending = paused/queued week — 14 of 103 placed cycles (13.6%). It is the winnable middle state between an active cadence and a churn verdict.",
      notes: [
        { choice: 1, why: "In-cold-chain is 'shipped' — 30 cycles with a dispatched stamp. Calling paused weeks cold-chain inflates dispatch volume and hides the households you can still win back." },
        { choice: 2, why: "Skipped/churned is 'cancelled' — 7 cycles (6.8%). Merging the 14 pauses into churn nearly triples the verdict count and torches the winback list." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-2",
      prompt: "COUNT(shipped_at) runs over all 103 box cycles. What does it return?",
      choices: ["82 — only delivered and in-cold-chain cycles carry a dispatch stamp", "103 — COUNT never skips rows", "14 — only the unstamped paused cycles matter", "NULL — because some stamps are missing"],
      answer: 0,
      why: "COUNT(column) counts non-NULL values only: the 52 delivered + 30 cold-chain cycles = 82 stamps; the 14 paused and 7 skipped carry no dispatch and are excluded by design.",
      notes: [
        { choice: 1, why: "That is COUNT(*) — it counts rows. COUNT(column) counts values, and the 82-vs-103 gap IS the stamped-share metric." },
        { choice: 3, why: "Aggregates skip NULLs rather than returning them — COUNT of an all-NULL column is 0, never NULL. The danger is a number that looks right over a silently shrunken population." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-3",
      prompt: "The APAC pause share should read 13.5 (5 paused of 37 boxes) but the dashboard prints 13. Which line is the culprit?",
      choices: [
        "100 * SUM(paused_flag) / COUNT(*) — integer division truncates 13.5 to 13 before anyone rounds",
        "The paused flag excludes some pending boxes",
        "The 100 belongs after the division",
        "APAC's paused count is wrong — it should be 5.0",
      ],
      answer: 0,
      why: "SUM of 0/1 flags over COUNT is integer arithmetic in SQLite: 500/37 evaluates as integer division and lands on 13. The fix is 100.0 before the division — real arithmetic first, ROUND only for display.",
      notes: [
        { choice: 1, why: "The flag arm is fine — COUNT of pending in APAC is exactly 5. The damage is the division's TYPE, not its numerator." },
        { choice: 2, why: "Moving it makes it worse: (5/37)*100 truncates 0.13 to 0 first, then scales — every market would print 0." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-4",
      prompt: "The pantry ledger must keep only menu families carrying at least 2 recipes. Where does that floor live?",
      choices: [
        "HAVING COUNT(*) >= 2, after GROUP BY menu_family",
        "WHERE COUNT(*) >= 2, before GROUP BY menu_family",
        "WHERE recipes >= 2 against the per-recipe pantry CTE",
        "HAVING recipes >= 2, placed before the GROUP BY so it runs early",
      ],
      answer: 0,
      why: "A recipe-count floor is a group-level fact: families exist only after GROUP BY, so HAVING judges them. On this menu the floor drops exactly the one-recipe Fitness family (220 planned vs 27 boxed) into a dedicated sourcing review.",
      notes: [
        { choice: 1, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "The pantry CTE is recipe-grain: there is no per-recipe 'recipes' column, and even filtering the CTE cannot express 'the family has 2+ recipes' — it would drop individual recipes instead of judging families." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-5",
      prompt: "The recipe portion ladder reads 47, 46, 38, 36, 36, 33, 31, then THREE recipes tied at 30 portions. Under RANK() OVER (ORDER BY portions DESC), what rank do the three 30s share, and where does the next recipe (28 portions) land?",
      choices: ["8 — and the 28 lands on 11", "8 — and the 28 lands on 9", "10 — and the 28 lands on 11", "9 — RANK averages the tie block"],
      answer: 0,
      why: "RANK shares rungs and then skips: the two 36s consume ranks 4-5, and the three-way 30 tie consumes ranks 8, 9 and 10 — so the next distinct count hands out rank 11. Both behaviors are the definition of RANK.",
      notes: [
        { choice: 1, why: "That is DENSE_RANK — shared rungs without gaps. The published board semantics are RANK, gaps included, and the 11 is the tell." },
        { choice: 2, why: "10 is the LAST rank the tie block occupies, not the rank the tie shares. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-6",
      prompt: "A teammate computes planned portions per family as SELECT p.category, SUM(p.stock), SUM(oi.quantity) FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.category — and Accessories' pantry column towers far above the true 940. Diagnosis?",
      choices: [
        "SUM(p.stock) fans out — each recipe's stock row re-joins once per order line, so stock is counted once per line record before it aggregates",
        "Stock is stored in cents and needs /100.0",
        "The join should be INNER JOIN — some recipes have no lines",
        "GROUP BY p.id is missing, so families collapse into each other",
      ],
      answer: 0,
      why: "Stock is product-grain; the join is line-grain. Summing a product-grain column after a line-grain join multiplies each recipe's pantry by its line count. The fix stages the per-recipe fold first (a pantry CTE), THEN rolls to families — exactly the cs-blueapron-2 shape.",
      notes: [
        { choice: 1, why: "Units are fine — stock is portions, not money; no cents rule applies here. The distortion is purely the fan-out." },
        { choice: 2, why: "INNER vs LEFT changes nothing on this menu — never-ordered recipes are 0 — and neither join type fixes a double-counted stock column." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-7",
      prompt: "Winback wants households with a paused week and no skipped box: customer_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') returns ZERO rows on a staging export. First suspicion?",
      choices: [
        "One NULL customer_id in the subquery poisons every comparison — three-valued logic silently empties the whole NOT IN",
        "The two tables genuinely share no ids — the zero is correct",
        "NOT IN cannot take a subquery; it needs a literal list",
        "The outer query needs DISTINCT before the comparison works",
      ],
      answer: 0,
      why: "x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison set — one NULL customer_id makes every outer row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 1, why: "On the clean core db every cycle carries a customer_id, so zero is never correct here — a paused-but-never-skipped cohort definitely exists. Staging exports are exactly where NULLs sneak in." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic — which is why the house pattern is NOT EXISTS." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-8",
      prompt: "The weekly box-value tile runs SUM(total) OVER (ORDER BY created_at). Two cycles landed the same day and the cumulative jumps two boxes at once. What is happening?",
      choices: [
        "The default frame is RANGE — tied rows share the boundary and enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk",
        "LAG should be used instead of SUM for running totals",
        "The frame must extend to UNBOUNDED FOLLOWING to absorb the ties",
        "Rounding accumulated on the tied rows and doubled the step",
      ],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so same-day cycles join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row.",
      notes: [
        { choice: 1, why: "LAG fetches the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 2, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-9",
      prompt: "A board layout stacks paused weeks and skipped weeks per market with UNION, and a reviewer says one market's row vanished. Diagnosis?",
      choices: [
        "Both branches emitted byte-identical rows (same market, same counts) and UNION deduped whole rows silently — UNION ALL plus a comment stating why duplicates are impossible is the discipline",
        "UNION truncates the stack to the first branch's row count",
        "UNION ALL is only a performance choice — the results would be identical",
        "Set operators cannot mix two different statuses",
      ],
      answer: 0,
      why: "UNION dedupes whole rows across branches. Two branches that emit identical rows — same market, same counts, no branch label — collapse into one, and the board loses a market with no error anywhere. UNION ALL keeps both lives visible.",
      notes: [
        { choice: 1, why: "UNION never truncates by count — it collapses only exact duplicate rows, which is worse, because nothing announces the loss." },
        { choice: 2, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate repeat exists, UNION is the bug, not the optimization." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-10",
      prompt: "The dunning queue reads 6 statements worth 15,217.00. The SQL behind it sums invoices.amount_cents. Which read produced the dollar figure?",
      choices: [
        "SUM(amount_cents) / 100.0 — finance tables store INTEGER cents, one divide at the read boundary",
        "The column stores dollars already — no conversion",
        "CAST(SUM(amount_cents) AS DECIMAL) — a cast is the conversion",
        "SUM(amount_cents) — 15,217 is the cent total",
      ],
      answer: 0,
      why: "1,521,700 cents = 15,217.00 dollars: the divide-once, round-once rule at the read boundary. orders.total and order_items.unit_price are REAL dollars, but invoices/payments/expenses/ledger are integer cents — the two money grains are the trap.",
      notes: [
        { choice: 3, why: "That reads 1,521,700 where the memo says 15,217.00 — a 100x exposure overstatement that survives any eyeball check on a small queue." },
        { choice: 2, why: "A CAST changes the type, not the scale — 1,521,700 stays 1,521,700. Only the /100.0 divide converts cents to dollars." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-blueapron-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The pause-churn split",
      brief:
        "Blue Apron-flavored brief on the storefront db: Monday's lifecycle review opens with the pause-churn split — every box cycle read once per market with its paused weeks (status pending) beside its skipped/churned weeks (status cancelled), because a paused household is winback inventory you can still reach and a skipped one is a verdict. Probed facts: 103 box cycles worth 34,833.28; the regional grid reads EU 45 = 24 delivered + 12 in-cold-chain + 6 paused + 3 skipped, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0; the churn share reads 6.7 / 8.1 / 5.3 / 0 with the denominator ALL boxes placed in that market, paused weeks included. Household coverage rides the same fold: EU 8, APAC 5, US 2, LATAM 1.",
      ask: "Return each market with its box count, household count, in-cold-chain count, paused count, delivered count and the churn share to 1 decimal, biggest box count first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS boxes_placed,\n       COUNT({1} o.customer_id) AS households,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS in_cold_chain,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS paused_week,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS delivered_boxes,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = {3}) / COUNT(*), {4}) AS churn_share\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY boxes_placed {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the household deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat cycles back to households: EU reads 8, not 45. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census, and the churn share's denominator story needs the household grain beside the box grain.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered-box literal",
          why: "Delivered is the box-on-the-porch status — 52 cycles, reading EU 24 / APAC 21 / US 5 / LATAM 2. 'shipped' would re-key the column to the cold chain (12 / 8 / 10 / 0) and the census stops being a delivery read; 'pending' turns it into the pause queue.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the skipped-week literal",
          why: "The share's numerator is skipped/churned cycles — 3 in EU, 3 in APAC, 1 in US, 0 in LATAM. 'pending' would print the pause share (13.3 / 13.5 / 15.8) where the verdict belongs and the board reads an invented churn wave exactly where households are merely resting.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the churn-share precision",
          why: "The share prints to 1 decimal — 6.7 / 8.1 / 5.3 / 0 — matching the facts-file cancellation table verbatim. ROUND(…, 2) prints 6.67 / 8.11 / 5.26 and the census stops tying to every other deck that quotes 6.7.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest book on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on LATAM's 2 boxes — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "ASC", "2", "SUM"],
      walkthrough:
        "One join, one fold, four FILTER arms plus a share — the whole split in a single pass. The join paints every cycle with its market, GROUP BY folds four rows, and the arms read the cold chain (EU 12 / APAC 8 / US 10 / LATAM 0), the pause queue (6 / 5 / 3 / 0) and the delivered boxes (24 / 21 / 5 / 2) beside totals 45 / 37 / 19 / 2 and household coverage 8 / 5 / 2 / 1. The churn share divides the cancelled arm by ALL placed cycles — 6.7, 8.1, 5.3, 0 — the denominator ops quotes, pauses included; the pause share (13.3 / 13.5 / 15.8 / 0) is the column the review reads BESIDE it, because a pause is a decision and a skip is a verdict. Every distractor fails loudly: 'shipped' in the delivered slot re-keys the column to dispatch counts, 'pending' in the churn slot prints the pause share as churn, precision 2 prints 6.67 / 8.11 / 5.26 and decouples the slide from the facts table, ASC opens on LATAM's 2 boxes, and SUM inside COUNT(DISTINCT …) is a syntax error before the fold even runs.",
      },
    {
      id: "cs-blueapron-2",
      tier: "medium",
      topic: "q6",
      universe: "inventory",
      title: "The pantry surplus ledger",
      brief:
        "Blue Apron-flavored brief on the storefront db: before next week's menu locks, supply planning wants the pantry surplus ledger — for every recipe, the pantry portions staged against the portions actually boxed, then folded per menu family, because surplus is the ingredient-waste line item before a single crate spoils. Probed facts: the menu carries 16 recipes; the family fold reads Accessories 940 planned vs 121 boxed (819 surplus), Apparel 510/54 (456), Electronics 505/85 (420), Audio 315/97 (218), Video 220/61 (159), Wearables 135/53 (82), and the one-recipe Fitness family 220/27 (193). The published ledger keeps only families carrying at least 2 recipes — single-recipe families go to a dedicated sourcing review instead of hiding inside a family average.",
      ask: "Return each menu family with its recipe count, pantry portions, boxed portions and surplus, biggest surplus first.",
      template:
        "WITH pantry AS (\n  SELECT p.id,\n         p.category AS menu_family,\n         p.stock AS pantry_portions,\n         SUM({1}) AS portions_boxed\n  FROM products p\n  JOIN order_items oi ON {2}\n  GROUP BY p.id\n)\nSELECT menu_family,\n       COUNT(*) AS recipes,\n       SUM(pantry_portions) AS pantry_portions,\n       SUM(portions_boxed) AS portions_boxed,\n       SUM(pantry_portions) - SUM(portions_boxed) AS surplus\nFROM pantry\nGROUP BY menu_family\nHAVING COUNT(*) >= {3}\nORDER BY surplus {4};",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the boxed-portions counter",
          why: "Box lines record recipes × portions: SUM(oi.quantity) per recipe reads the 498 portions actually boxed. SUM(oi.unit_price) prints a dollar total where a portion count belongs, and SUM(oi.id) sums line ids — a number with no unit at all.",
        },
        {
          answer: "oi.product_id = p.id",
          kind: "keyword",
          label: "the recipe join key",
          why: "The line's product_id must equal the recipe's id — that is the whole linkage. ON oi.product_id alone is a truthy expression that joins every line to every recipe and explodes the fold; ON p.id does the same from the other side.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the family-recipe floor",
          why: "The published ledger keeps families with at least 2 recipes — the floor drops the one-recipe Fitness family (220 planned vs 27 boxed) to a dedicated sourcing review. 1 keeps it inside the family fold; 3 amputates every two-recipe family and the ledger reads three rows of nothing but giants.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-surplus-first direction",
          why: "The supply lead reads the exposure ranked worst-first: Accessories 819, Apparel 456, Electronics 420. ASC opens the review on Wearables' 82 — the smallest problem — and the meeting runs out of time before the real surplus is discussed.",
        },
      ],
      distractors: ["oi.unit_price", "1", "COUNT", "oi.id", "3", "ASC"],
      walkthrough:
        "Two stages: stage the pantry at recipe grain, then roll it to families. The CTE joins every box line to its recipe and folds per recipe — SUM(oi.quantity) is the only aggregate that WANTS the 251-line fan-out, because each line records portions — and p.stock rides along untouched at product grain, which is why the CTE exists: summing stock after the join would count every recipe's pantry once per line and inflate Accessories past 940 into fiction. The outer fold groups the 16 staged recipes into families: Accessories reads 3 recipes / 940 planned / 121 boxed / 819 surplus, Apparel 2/510/54/456, Electronics 3/505/85/420, Audio 3/315/97/218, Video 2/220/61/159, Wearables 2/135/53/82 — and HAVING COUNT(*) >= 2 drops the single-recipe Fitness family (220/27/193) by definition, not by bug. ORDER BY surplus DESC puts the waste exposure where the meeting starts. The distractors all bite: SUM(oi.unit_price) re-prices portions as dollars, ON oi.product_id fan-outs the pantry into nonsense, a floor of 1 re-admits Fitness and a floor of 3 empties half the ledger, and ASC ranks the smallest surplus first.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Box depth is the subscription read: 251 line records over 103 boxes = 2.44 recipes per box, and the depth-vs-value fold is how the menu team prices the family plan. This problem drills exactly that basket fold." },
    { slug: "cohort-retention-matrix", why: "Week-N retention per signup cohort is the cadence scoreboard: which month's households are still placing boxes five weeks later. Cohort offsets over the box spine are this problem's shape." },
    { slug: "immediate-food-delivery-iii", why: "Boxes promised in the week versus delivered in the week, split by month — the delivery-promise share Blue Apron publishes per cycle. A monthly conditional-rate fold, mirrors the fulfillment SLA read." },
    { slug: "trial-to-paid-funnel", why: "First box to steady cadence is the funnel this business lives on: signed, first box shipped, week-5 retained. The step-conversion drill is the onboarding funnel at practice scale." },
    { slug: "net-revenue-retention", why: "Households expanding from 2 boxes to family plans versus households pausing to zero — the revenue walk Blue Apron's board actually manages. Cohort revenue movement with LAG is exactly this shape." },
    { slug: "mrr-waterfall", why: "New, expansion, contraction, churned — every renewal movement classified between months. The pause-versus-churn split in this kit's census is the same movement taxonomy at cycle grain." },
    { slug: "weeks-of-supply", why: "Pantry portions on hand divided by the boxed run-rate — the surplus-coverage metric supply planning watches before the menu locks. Trailing-rate math over stock and lines, this kit's waste ledger in miniature." },
    { slug: "fifo-inventory-cogs", why: "Ingredient lots consumed oldest-first — the layer-consumption fold behind the pantry's waste accounting. The staged CTE discipline matches the surplus ledger's two-grain build." },
    { slug: "duplicate-charge-pairs", why: "Two card legs on one statement inside the same billing window — the renewal double-charge pattern the payments rail actually throws. Self-join window pairs, exactly the reconciliation drill." },
    { slug: "bank-account-summary-ii", why: "Statements beside their settlements in one row — the dunning queue's raw material. The LEFT JOIN keeps the no-settlement statements visible, which is the whole queue." },
    { slug: "monthly-transactions-i", why: "The billing cycle filter: statements issued in one month, folded with cents-safe arithmetic. The /100.0 dollar read and the month bucket are the exact house mechanics." },
    { slug: "gl-reconciliation", why: "Debits against credits until the delta reads zero — the ledger check behind every close (181,080 = 181,080 here). The anomaly hunt after the balance is the real lesson." },
    { slug: "keep-latest-dedupe", why: "Households move and plans change; the address row that wins is the latest. ROW_NUMBER dedupe over event time is the pre-census hygiene step before any household count divides." },
    { slug: "confirmation-rate", why: "Partner ratings arrive with gaps, and the trusted bench (rating 4.5-plus) must not silently drop a farm to NULL. COALESCE-guarded ratios over a join — the supply bench's honest fold." },
    { slug: "weather-type-in-each-country", why: "CASE-classifying every market by its mix — pause-heavy, churn-heavy, healthy — with exhaustive ordered arms. The same classification shape the lifecycle board publishes." },
    { slug: "group-sold-products-by-the-date", why: "The weekly menu sheet: recipes shipped per cycle week, folded into one cell. GROUP_CONCAT over the box lines is how the ops review prints the week's assortment." },
  ],
};
