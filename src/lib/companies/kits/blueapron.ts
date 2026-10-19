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
    "Prep like a portion economist, not a generic SQL student. Drill the box ladder until HAVING gates are reflex (the ladder reads **24/17/14/13/5** with a tie at 4 below), drill pause-versus-churn as two separate conditional counts with denominators said out loud, and drill the pantry ledger — planned stock minus boxed portions, folded per recipe before it folds per menu family — because surplus is where this business bleeds. The problem pool here carries **no tagged Blue Apron section**: all thirty-two problems and every topic set below are **theme-curated** from the SQL band, each one mapped to a workflow Blue Apron screens are known to probe.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Blue Apron interviewers rehearse most: the pause-churn split, the pantry surplus ledger, the partner bench read at menu value, the per-portion price bands, the recipe velocity tiers, and the LAG-driven portion run-rate walk that ends at the 22-portion July trough. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the grain follow-up ('one row per what?') tests.",
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
      slugs: ["customer-order-frequency", "repeat-purchase-rate", "customer-placing-the-largest-number-of-orders", "basket-depth-aov"],
    },
    {
      name: "Pause, skip & kept demand",
      why: "The lifecycle board's most-watched pair is {amber:paused} 14 beside {rose:skipped} 7 of 103 placed, and both are conditional counts before they are percentages: SUM(CASE WHEN status = …) over the same COUNT(*) that divides. Screens drill the split until nobody merges a winnable pause into a churn verdict — and until kept-demand shares quote the placed denominator out loud.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "week-over-week-churn", "immediate-food-delivery-iii", "duplicate-charge-pairs", "monthly-transactions-i"],
    },
    {
      name: "The two-grain census",
      why: "'Boxes AND households per market' opens every lifecycle review: EU 45 cycles from 8 households, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Two columns at two grains in one SELECT is the house census, and mixing the grains is the classic bug that turns a household read into a box count.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Pause windows & reactivation",
      why: "A paused household is winback inventory with a clock on it: pause durations, two-purchases-within-a-window style re-engagement tests, and the dormant list before the pause becomes a skip. Screens drill date-diff windows, first/last-event subqueries and the anti-join that finds households reachable but untouched.",
      slugs: ["users-with-two-purchases-within-seven-days", "find-churn-risk-customers", "dormant-reactivation", "cohort-retention-matrix", "net-revenue-retention", "gl-reconciliation"],
    },
    {
      name: "Billing anti-joins & the dunning queue",
      why: "Billing ops lives on absence: renewal statements with no settlement, settlements with no statement. On this db every household has ordered (never-ordered = 0 — the subscriber anti-join is empty), so the honest drill is billing: 6 statements worth 15,217.00 including the {emerald:paid}-with-no-legs anomaly #28 — LEFT JOIN … IS NULL and NOT EXISTS until reflex.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Box economics & CASE bands",
      why: "Plans and portion bands are CASE histograms: the per-portion fold reads 268 budget portions at 31.01 against 230 family portions at 115.85, and the band edge is a published definition. Screens drill the CASE arm until the ELSE arm's absence reads as a finding — an empty premium band means the ladder tops out, not that the query is broken.",
      slugs: ["the-category-of-each-member-in-the-store", "spend-histogram", "calculate-orders-within-each-interval", "mrr-waterfall", "weather-type-in-each-country"],
    },
    {
      name: "Portion ladders & the rank trio",
      why: "The recipe portion ladder runs 47 down to 21 with ties everywhere — 36 twice, 30 three times, 21 three times — and ladder reporting is leaderboard reporting. ROW_NUMBER, RANK and DENSE_RANK differ exactly at those ties, and 'why does my top-10 return 12 recipes' is the tie policy you were supposed to state before the query ran.",
      slugs: ["rank-scores", "top-earners", "usage-tier-percentiles", "keep-latest-dedupe"],
    },
    {
      name: "Menu-family economics & the supply join",
      why: "The supply fold chains farm partners → recipe SKUs → box lines, and per-portion economics is a join-and-ratio fold: realized per-portion price against list, value per partner, each household's most-cooked recipe. The argmax shapes ride the same chain, and the tie policy is part of the definition, not a footnote.",
      slugs: ["average-selling-price", "top-travellers", "most-frequently-ordered-product-per-customer", "confirmation-rate", "group-sold-products-by-the-date"],
    },
    {
      name: "Waste ledgers & running math",
      why: "Surplus is stock minus boxed, and the ledger must stage the per-recipe fold before it rolls to families — exactly the two-stage shape derived tables and CTEs exist for. Screens drill cumulative portion staging, running-capacity gates and the frame semantics that decide whether a tie jumps the running total.",
      slugs: ["game-play-analysis-iii", "find-cumulative-salary-of-an-employee", "last-person-to-fit-in-the-elevator", "bank-account-summary-ii"],
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
    {
      id: "blueapron-t9",
      q: "Walk me through the farm-partner → recipe → box-line chain. Where does the fan-out live, and which aggregates survive it untouched?",
      a: "The fan-out lives at the recipe-to-line hop: one menu SKU joins once per box line, so the chain's finest grain is the line record. Menu value survives untouched because SUM(oi.quantity * oi.unit_price) counts each line once — Nordic's 11,130.25 (32.0% of partner-sourced value) is built from 3 recipes' lines and every line earns its seat. Recipe count must fold the fan-out back: COUNT(DISTINCT p.id) reads 3, where COUNT(*) reads Nordic's line count wearing a recipe's name. The silent killer is a product-grain column: SUM(p.stock) after the join counts each recipe's pantry once per line and inflates planned portions into fiction. The fix is staging — fold per recipe in a pantry CTE, then roll to the partner or family — which is exactly how the surplus ledger is built.",
      tag: "joins",
    },
    {
      id: "blueapron-t10",
      q: "Your running portion tile breaks with SUM(oi.quantity) OVER (ORDER BY month) on a query that already folds per month. Explain the failure and the fix.",
      a: "Windows evaluate after grouping, and once GROUP BY month folds the lines, the row-level quantities no longer exist to reference — the only values in scope are the group aggregates. The fix is to aggregate inside the window: SUM(SUM(oi.quantity)) OVER (ORDER BY month) — the inner SUM folds lines into months, the outer SUM walks the fold into a running ledger, opening at January's 50 portions. It reads odd and it is exactly correct. Say the frame while you are there: the default with ORDER BY is RANGE, which pulls tied peers into the same step — fine at month grain, dangerous at line grain where same-day cycles guarantee ties, so ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the strict walk. And answer the grain question out loud: one row per month, running over monthly portion sums.",
      tag: "windows",
    },
    {
      id: "blueapron-t11",
      q: "When is GROUP_CONCAT the right shape for a Blue Apron read, and what does the fold cost you?",
      a: "It is right when the consumer wants an assortment in one glance — the weekly menu sheet folds each cycle week's recipes into a comma-joined cell, one row per week, and the ops review prints exactly that. What it costs is everything folded away: box boundaries vanish (recipes from different households merge into one cell), counts inside the cell are invisible, and string order is engine-dependent unless the build supports GROUP_CONCAT(name ORDER BY name) — on older SQLite the append order is whatever the scan produced, so the same query can print two different sheets. The discipline: GROUP_CONCAT is a presentation fold, not a data model — keep the GROUP BY grain honest (the cycle week, not 'everything'), state the separator, and never join on the folded cell afterward. If a stakeholder asks 'how many recipes ran?', that is COUNT(DISTINCT product_id) at the pre-fold grain, not a comma count on the string.",
      tag: "aggregation",
    },
    {
      id: "blueapron-t12",
      q: "What is your COALESCE policy — when is a default a display guard and when is it a definition change?",
      a: "COALESCE is a display guard when the NULL is legitimately absent and the business asks for a printable zero — a statement with no settlement shows 0.00 in the dunning memo, that is presentation. It becomes a definition change the moment the default feeds a metric: COALESCE(julianday(shipped_at) - julianday(created_at), 0) invents same-day dispatches for the 21 unstamped cycles — 14 paused, 7 skipped — and flatters the 2.98-day cold-chain clock precisely where nothing shipped. The honest shape is separate census arms: COUNT(*) and COUNT(shipped_at) side by side so the 82-stamped population is visible, and the unstamped 21 reported as their own column, not laundered through a default. The one place a default IS the definition is NULLIF for division guards — NULLIF(denominator, 0) turns a divide-by-zero into a deliberate NULL — and even then you say so in the query comment.",
      tag: "nulls",
    },
    {
      id: "blueapron-t13",
      q: "The pause-churn census must reconcile to the placed book by construction. How do you build a census whose arms cannot drift?",
      a: "One pass, one population, arms over the same scan. The market census folds 103 placed cycles with FILTER (WHERE …) arms — or the SUM(CASE …) twin — reading 52 delivered, 30 in-cold-chain, 14 paused, 7 skipped from the same COUNT(*) population, so the arms sum to 103 by construction: the identity is the query's shape, not a coincidence to check afterward. The churn share then divides its cancelled arm by that same unfiltered COUNT(*) — 6.7 in EU, 8.1 in APAC — never by a pre-filtered denominator. The failure modes are all drift: four sequential queries are four chances for a different WHERE clause to enter; a missing CASE arm zero-fills silently; a HAVING floor computed before the arms breaks reconciliation for the markets it drops. The discipline I ship: arms, total, and the identity in a comment, so the next analyst inherits the invariant, not just the numbers.",
      tag: "pipeline",
    },
    {
      id: "blueapron-t14",
      q: "IN versus EXISTS — how do you choose between them for the winback and dormant lists, and what breaks each one?",
      a: "IN tests membership against a materialized list, so it shines when the set is small and static — status IN ('pending', 'cancelled') over four known cycle fates is the clearest filter you can write. Its failure mode is the NULL set: x NOT IN (subquery) goes UNKNOWN for every row the moment one NULL enters the list, silently emptying the winback report — the fix is NOT EXISTS, which asks a per-row existence question and never compares against a poisoned set. EXISTS wins when the subquery is large and the outer small, because it probes per row and stops at the first match instead of materializing anything. The scalar subquery is the third sibling with a 0-or-1-row contract: the 338.19 network AOV painted beside every market works as a scalar; an empty staging fold returns NULL and the above-average report empties quietly. My rule: membership = IN over a guarded list, existence = EXISTS, one value = scalar with its population stated, staging = a named CTE.",
      tag: "subqueries",
    },
    {
      id: "blueapron-t15",
      q: "Box cycles carry TEXT timestamps. How do you build the weekly menu spine without lying about weeks?",
      a: "Months are easy: SUBSTR(created_at, 1, 7) — the '%Y-%m' slice sorts lexicographically and carries the 2024-01 to 2025-02 spine, 14 buckets. Weeks are where the substring lies: a week straddles two months, '%W' is not ISO, and no slice of the date gives you week 7 of a year — so the weekly menu spine snaps each cycle to its week start with date(created_at, 'weekday 0', '-6 days') or uses strftime('%Y-%W', created_at) with its caveats stated out loud. The bounds stay half-open — created_at >= '2024-01-01' AND created_at < '2024-01-08' for a week window — because BETWEEN stops at midnight on the last day and a Monday-dated bound is how the final Sunday's boxes vanish. And one grain rule: placed-time buckets use created_at, dispatched-time buckets use shipped_at — merging the two spines is how a cold-chain slip gets reported as a demand dip. The bucket key, the unit, and the timestamp column are all part of the metric definition.",
      tag: "dates",
    },
    {
      id: "blueapron-t16",
      q: "The billing book must reconcile before the dunning queue ships. What does the trial balance prove, and what does it miss?",
      a: "It proves the plumbing: SUM(debit_cents) = SUM(credit_cents) — 181,080 against 181,080, delta zero — means every entry that touched one side touched the other, so double-entry held at write time. It proves nothing about classification: a payment booked against the wrong statement still balances perfectly, which is exactly the anomaly #28 — status 'paid', 1,756.00 billed, zero payment rows — a record the trial balance waves through and the anti-join catches. So the close is two artifacts: the trial balance for the plumbing, and the coverage split — 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217.00 — plus the row-level anomaly list for judgment calls. The cents rule rides under all of it: finance stores INTEGER cents, the dollar read is amount_cents / 100.0, divide once and round once at the read boundary — integer division anywhere in the fold is the 100x incident.",
      tag: "quality",
    },
    {
      id: "blueapron-t17",
      q: "You LEFT JOIN households to cycles, then filter status = 'shipped' in WHERE. What silently breaks, and what are the two fixes?",
      a: "The WHERE on the right table's column kills the NULL-payload rows: a household with no cycles carries NULL status, NULL = 'shipped' evaluates UNKNOWN, and the row is discarded — the LEFT JOIN quietly became an INNER JOIN and the dormant households your report exists to find are gone, with no error anywhere. Fix one: move the predicate into the ON clause — ON o.customer_id = h.id AND o.status = 'shipped' — which filters the match, not the survival. Fix two: wrap the LEFT JOIN in an outer query and filter there, when the predicate genuinely belongs after the join. The exception that proves the rule: the anti-join — LEFT JOIN … WHERE the right side IS NULL — filters NULL-ness on purpose because NULL-ness IS the answer; on this db the never-ordered-household anti-join returns a confident zero (every one of the 16 households has placed a box), and proving that zero is part of the deliverable, because an acquisition wave with zero conversion would look identical to a bug until you run it and state the denominator.",
      tag: "joins",
    },
    {
      id: "blueapron-t18",
      q: "RANK, DENSE_RANK, ROW_NUMBER — the portion ladder is tie-heavy. Write the tie policy, not just the pick.",
      a: "The ladder runs 47, 46, 38, then a two-way tie at 36 sharing rank 4 and skipping 5, then 33, 31, then a three-way tie at 30 consuming ranks 8 through 10 — ties are structural on this menu, so the policy IS the metric. RANK shares rungs and keeps gaps: the next recipe after the 30s lands on 11, implying phantom positions that hold no recipe. DENSE_RANK shares rungs without gaps: the 30s all read tier 8 and the next recipe is 9. ROW_NUMBER splits ties arbitrarily — a silent judgment about which recipe 'wins' — unless you name a tiebreaker (recipe name, then id) and make the pick reproducible. The answer is a policy stated before the query runs: peer recipes share rungs on the published board (RANK, gaps included, or DENSE_RANK — pick one and say why), selection uses ROW_NUMBER with a named tiebreak, and the policy goes in the query comment so the weekly menu export reproduces byte for byte.",
      tag: "windows",
    },
    {
      id: "blueapron-t19",
      q: "Why are four sequential COUNT queries four ways to drift, and what is the one-pass alternative for the lifecycle board?",
      a: "Each sequential query re-scans the cycles with its own WHERE clause, so each is a fresh chance for a different filter, a missed market, or a stale extract to enter — and the four results carry no structural promise of summing to anything. The one-pass census folds once: GROUP BY region with FILTER (WHERE status = …) arms — or the SUM(CASE …) twin — reading delivered, cold-chain, paused and skipped from the same population so 52 + 30 + 14 + 7 = 103 by construction. The same discipline extends to keyed counts: COUNT(DISTINCT CASE WHEN status = 'cancelled' THEN region END) reads the markets that carry skips in the same pass, because the CASE maps skips to their market and COUNT skips the NULL arms. Reviewers here read the reconciliation identity first — if the arms cannot drift, the board cannot lie; if they can, no amount of eyeballing saves the deck.",
      tag: "aggregation",
    },
    {
      id: "blueapron-t20",
      q: "Build the dispatch read so the population gap shows instead of hides. What do COUNT(*) and COUNT(shipped_at) each tell the ops room?",
      a: "Side by side, always: COUNT(*) reads 103 placed cycles, COUNT(shipped_at) reads 82 dispatched ones, and the 21-row gap is not missing data — it is the 14 paused and 7 skipped cycles that have no stamp because no dispatch happened. That gap IS a metric: it is the winnable-plus-gone population lifecycle watches, printed as its own column so nobody subtracts tiles under pressure. The AVG rides the stamped population with or without a WHERE clause — AVG ignores NULLs, so the WHERE-less version returns the same 2.98-day average wearing the wrong name, which is why the WHERE ships anyway: not to change the number, but to state the population in code. What never ships is COALESCE to zero — it invents 21 same-day dispatches and flatters the cold chain exactly where nothing moved. Population in the title, gap as a column, average over the stated 82: that read survives the ops review.",
      tag: "nulls",
    },
    {
      id: "blueapron-t21",
      q: "The pantry ledger keeps only families with at least two recipes, and the census keeps only delivered cycles. Place every filter by grain, and say what breaks when one moves.",
      a: "Two facts, two clauses, one pipeline order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. The status rule is a row-level fact — status = 'delivered' discards paused, cold-chain and skipped cycles before any fold exists — so it lives in WHERE; moving it to HAVING is impossible because statuses no longer exist once rows are grouped. The two-recipe floor is a group-level fact — COUNT(*) >= 2 judges families that only exist after GROUP BY — so it lives in HAVING; putting it in WHERE errors because COUNT references a fold that has not happened, and the SELECT alias is not visible there either. On this db the floor drops exactly the one-recipe Fitness family — 220 planned portions against 27 boxed — which is policy the supply lead chose so single-recipe families get a dedicated sourcing review instead of hiding inside a family average. I can defend it as policy, not query convenience — and I can name every filter with its clause and its grain, because a floor that silently moves clauses does not error; it just changes who survives the ledger.",
      tag: "pipeline",
    },
    {
      id: "blueapron-t22",
      q: "Correlated versus derived subqueries — how do cost and semantics differ on the portion work, and when do you reach for each?",
      a: "A correlated subquery re-runs per outer row: 'each line beside ITS recipe's average price' executes the inner fold once per line, answering a per-context question at a per-row cost — line context, not menu context. A derived table or CTE folds once and joins: the pantry CTE stages per-recipe stock, boxed portions and surplus in one pass, then the outer query rolls to menu families — you cannot fold twice in one SELECT, so the staging is not a style choice, it is the only way to aggregate aggregates. Semantically the correlated form answers 'compared to MY recipe's habit' and the derived form answers 'compared to a named population' — different business questions wearing similar SQL. The traps ride both: an empty correlated inner returns NULL comparisons silently, and a derived table that pre-filters differently from the outer query produces a plausible wrong number. My rule: correlation for genuine per-row context, CTE when the staging deserves a name the memo can cite — 'pantry' reads like the ledger, a nested derived table reads like plumbing.",
      tag: "subqueries",
    },
    {
      id: "blueapron-t23",
      q: "Dispatch latency on this db: compute it, state its population, and name its unit — what does the strong answer cover?",
      a: "Compute: AVG(julianday(shipped_at) - julianday(created_at)) over the cycles that carry a stamp — 82 of 103 (52 delivered plus 30 in-cold-chain), averaging 2.98 days on a 2-to-4 spread. Population: the 14 paused and 7 skipped cycles are excluded by definition, not by cleanup — no dispatch, no latency — and the WHERE shipped_at IS NOT NULL ships with the query to say so in code even though AVG would skip the NULLs anyway. Unit: julianday returns fractional days, and on date-only TEXT stamps the differences are whole calendar days, so 2.98 is days — say it in the title, because production streams the identical query in hours against the cold-chain SLA and a misread unit is a 24x error. The follow-ups write themselves: why not COALESCE to zero (it invents same-day dispatches), and what changes if the spine buckets by shipped_at instead of created_at — a different report at a different grain.",
      tag: "dates",
    },
    {
      id: "blueapron-t24",
      q: "Two payment legs land on one renewal statement. How do you detect it, and when is it a finding versus a design?",
      a: "Detection is a self-join with a strict inequality: payments p1 JOIN payments p2 ON p1.invoice_id = p2.invoice_id AND p1.id < p2.id — the id guard pairs each split once and never a row with itself. On this db it surfaces five statements (1, 5, 12, 19, 22), each carrying a card leg and a wire leg — and that is the judgment call the query cannot make for you: split settlement across two rails is legitimate design here, which is why 27 legs settle 28 statements without alarm. The actual finding lives elsewhere: #28, marked 'paid' with zero legs — a status disagreeing with row reality, a reconciliation finding routed to a different worklist than the dunning queue, while the partial (#25, 4,000 of 6,148) stays a dunning case. The discipline: detection SQL is mechanical and reruns nightly, but every detected pair gets a classification step — expected split, duplicate capture, or anomaly — because a detector without a classifier pages billing ops for the five healthy splits and misses the quiet lie. And pairs change the arithmetic: COUNT(p.id) counts legs, so paid cents must SUM, or split statements flip coverage class.",
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
    {
      id: "blueapron-mcq-11",
      prompt: "What share of the 103 placed box cycles actually landed — and what is the denominator lifecycle quotes?",
      choices: [
        "52 of 82 — delivered over everything stamped, 63.4%",
        "52 of 103 — delivered over ALL placed cycles, paused and skipped included, 50.5%",
        "82 of 103 — everything stamped, 79.6%",
        "52 of 16 — delivered boxes over households",
      ],
      answer: 1,
      why: "The house definition: delivered ÷ ALL cycles placed — 52/103 = 50.5%. The 14 paused and 7 skipped weeks stay in the denominator because 'not yet delivered' is exactly what the lifecycle board watches.",
      notes: [
        { choice: 0, why: "Dropping the 21 unstamped cycles inflates the rate to 63.4% by deleting the rows the board exists to watch — denominator engineering, not analysis." },
        { choice: 3, why: "52/16 mixes grains — boxes over households. Per-household rates are a different metric with a different name." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-12",
      prompt: "251 box line records fan out of 103 cycles. What does SUM(oi.quantity) return on the joined table, and why does the fan-out NOT hurt it?",
      choices: [
        "103 — the join preserves the left table's grain",
        "498 — each line records recipes × portions, and summing portions is the one aggregate that WANTS the line grain",
        "251 — SUM flattens to a row count",
        "It errors — quantity cannot be summed after a join",
      ],
      answer: 1,
      why: "SUM(oi.quantity) reads the 498 portions actually boxed — every line's portions deserve to be counted once, so the fan-out is the point. The trap is every OTHER grain: COUNT(*) reads 251, and SUM(o.total) after the join repeats each cycle's total once per line.",
      notes: [
        { choice: 2, why: "SUM never flattens to a count — 251 is COUNT(*)'s answer. Confusing the two is how a portion ledger becomes a line ledger." },
        { choice: 3, why: "No error anywhere — quantity sums fine after the join. The danger was never the error, it was the aggregates that quietly double-count." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-13",
      prompt: "The menu spine buckets cycles with SUBSTR(created_at, 1, 7). How many buckets does the 2024-01 to 2025-02 log produce, and why not slice the month alone?",
      choices: [
        "14 buckets — the '%Y-%m' key keeps the year, so no two months collide",
        "14 buckets either way — the year is implied by sort order",
        "2 buckets — one per year",
        "24 buckets — one per month name",
      ],
      answer: 0,
      why: "The year-plus-month slice yields 14 buckets (2024-01 … 2025-02) that sort lexicographically. Slicing month alone folds 2024-01 into 2025-01 and the trend halves its history — silently, because the short key still executes.",
      notes: [
        { choice: 1, why: "Sort order can't repair a collision: '01' < '02' merges the two Januarys into one row before any sort happens." },
        { choice: 3, why: "Month names repeat every year — 12 distinct keys max, not 24, and the two logs interleave into fiction." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-14",
      prompt: "SELECT COUNT(DISTINCT p.category) FROM products — what does it read on this menu, and what does the number tell supply?",
      choices: [
        "16 — one per recipe",
        "7 — the recipe menu folds into 7 menu families, the grain the surplus ledger rolls to",
        "6 — one per farm partner",
        "498 — one per boxed portion",
      ],
      answer: 1,
      why: "16 recipes carry 7 distinct category values — Accessories, Apparel, Electronics, Audio, Video, Wearables, Fitness — which is the family grain the pantry surplus ledger rolls to before it reports. The fold is the reporting grain, not a detail.",
      notes: [
        { choice: 0, why: "16 is the pre-DISTINCT recipe count; recipes within a family collapse. That is exactly the fold the ledger's second stage performs." },
        { choice: 2, why: "Partners are a different dimension entirely — 6 suppliers across regions, orthogonal to menu families." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-15",
      prompt: "COUNT(*) reads 103 placed cycles; COUNT(shipped_at) reads 82. What are the 21 rows in the gap?",
      choices: [
        "Data-quality bugs — 21 cycles lost their dispatch stamp",
        "The 14 paused and 7 skipped cycles — no dispatch happened, so no stamp exists",
        "The 30 in-cold-chain cycles",
        "Duplicate cycle rows the pipeline should dedupe",
      ],
      answer: 1,
      why: "The gap is definitional, not dirty: paused weeks (14) and skipped weeks (7) never dispatch, so they carry no shipped_at. Printing the gap as its own column turns a silent population shrink into a watched metric.",
      notes: [
        { choice: 0, why: "Calling the 21 'bugs' triggers a pointless cleanup sprint — the stamps are absent because the boxes never moved. Definition beats repair." },
        { choice: 2, why: "The 30 cold-chain cycles DO carry stamps — they are inside the 82, not the gap." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-16",
      prompt: "Lifecycle wants recipes with zero boxes ever ordered. What does SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL return on this db — and what must you state with it?",
      choices: [
        "3 recipes — the three lowest-velocity SKUs",
        "0 rows — every one of the 16 recipes has sold at least once; the honest zero is part of the deliverable",
        "16 recipes — every recipe lacks orders",
        "The query errors — LEFT JOIN needs a WHERE on the left table",
      ],
      answer: 1,
      why: "All 16 recipes appear in box lines, so the anti-join returns a confident zero. Stating the zero with its denominator is the job: '0 of 16 recipes unsold' proves the menu has no dead weight — and would immediately expose a broken product feed if the menu ever grew without sales.",
      notes: [
        { choice: 0, why: "Velocity is a different read — this is existence, not volume. A zero-velocity recipe would still appear here only if it had zero lines, and none do." },
        { choice: 2, why: "That is the INNER-join answer inverted — the LEFT JOIN keeps every product row; the IS NULL guard keeps only the unmatched ones." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-17",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) reads 2.98. What is the unit, and what does the number actually measure?",
      choices: [
        "Hours — the cold-chain SLA is measured in hours",
        "Days — booking to dispatch over the 82 stamped cycles, on date-only TEXT stamps",
        "Weeks — the weekly box cadence",
        "It is unitless — a ratio of two text columns",
      ],
      answer: 1,
      why: "julianday returns fractional days, and on date-only TEXT stamps the differences are whole calendar days — so 2.98 is days from order placed to box dispatched, over the 82 of 103 cycles that carry a stamp. Production streams the identical query in hours; a misread unit is a 24x error.",
      notes: [
        { choice: 0, why: "The SLA may be quoted in hours, but this expression computes days — julianday's unit is days regardless of how the business reads it." },
        { choice: 2, why: "No week conversion happens — that would need a /7, and quoting 0.43 'weeks' is how units drift into decks." },
      ],
      difficulty: "easy",
    },
    {
      id: "blueapron-mcq-18",
      prompt: "The per-portion band fold runs CASE WHEN oi.unit_price < 55 THEN 'budget' ELSE 'family' END. A new line prices at exactly 55.00. Where does it land?",
      choices: [
        "budget — 55 is the band edge",
        "family — the WHEN arm is strictly < 55, so the edge value falls to the ELSE",
        "NULL — the edge is unmapped",
        "The fold errors on the boundary value",
      ],
      answer: 1,
      why: "55.00 fails unit_price < 55 and falls through to the ELSE 'family' arm. Band edges are published definitions — 'under 55' is 268 portions at a 31.01 average, '55-plus' is 230 at 115.85 — and a silent re-edge mid-quarter decouples every deck that quotes the bands.",
      notes: [
        { choice: 0, why: "That is the >= reading, not the written one. The arms and the edge belong to the definition, not to the reader's intuition." },
        { choice: 2, why: "CASE never returns NULL just because an edge is exact — with an ELSE present, everything uncaught lands there by design." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-19",
      prompt: "The box ladder bands households by cycles placed: 1 box, 2-5 boxes, 6-plus. What does the band census read on this db?",
      choices: [
        "2 one-box households, 10 at 2-5, 4 power households (24/17/14/13/5)",
        "16 one-box households — every household starts somewhere",
        "8/8 — the menu's budget/core split re-read at household grain",
        "4/12 — power households dominate",
      ],
      answer: 0,
      why: "The ladder reads 24, 17, 14, 13 at the top, one 5, ten households at 2-5, and 2 one-box households — the cadence engine is the growth story, so the bands are watched weekly, never the average. The 4 power households carry the concentration risk.",
      notes: [
        { choice: 1, why: "Signup counts are not placement counts — the ladder is cycles PLACED, and 14 of the 16 households have reordered at least once." },
        { choice: 3, why: "4/12 inverts nothing real — the middle band (2-5) is where the base lives, and losing it to a two-band read hides the churn frontier." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-20",
      prompt: "created_at is date-only TEXT today ('2024-03-08'); the production feed migrates to full timestamps. Which one-week window still counts every cycle in the week after the migration?",
      choices: [
        "BETWEEN '2024-03-04' AND '2024-03-10'",
        "created_at >= '2024-03-04' AND created_at < '2024-03-11'",
        "created_at LIKE '2024-03%'",
        "SUBSTR(created_at, 1, 7) = '2024-03'",
      ],
      answer: 1,
      why: "Half-open bounds survive the migration: < '2024-03-11' includes every moment of the final Sunday, where the BETWEEN upper bound stops at midnight. On date-only data both read the same — the trap fires only after the timestamps land, on the exact week the menu locked.",
      notes: [
        { choice: 0, why: "It happens to match today because the stamps carry no time. Bound conventions are for the data you will have — and week windows straddle months, where the bug hides longest." },
        { choice: 2, why: "LIKE '2024-03%' is a whole-month filter wearing a week-window's name — and it cannot use an index after the migration." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-21",
      prompt: "The board paints the 338.19 network AOV beside every market. Which markets read ABOVE the baseline?",
      choices: [
        "EU and APAC — the biggest books lead",
        "US (383.48) and LATAM (426.22) — the small books run hot",
        "All four — 338.19 is the minimum",
        "None — every market sits below its own network mean",
      ],
      answer: 1,
      why: "EU reads 335.32 and APAC 313.66 — below; the US at 383.48 and LATAM at 426.22 sit above the 338.19 scalar. The scalar subquery comparison is the drill: per-market averages beside a network constant, and the small-market heat is the story the board tells.",
      notes: [
        { choice: 0, why: "Volume and value are different dials — the biggest books run the coolest boxes here, which is exactly why the comparison is worth painting." },
        { choice: 3, why: "A network mean cannot sit above every member unless one member is negative — the 338.19 baseline is the average of these four, so it must split them." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-22",
      prompt: "'Each household's most-cooked recipe' feeds the personalization seed, and two recipes tie for several households. What makes the export defensible?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY portions) — the engine picks one, that's fine",
        "ROW_NUMBER() with a named tiebreaker (portions DESC, recipe name, id) — the pick is deterministic and reproducible",
        "MAX(recipe_name) — alphabetical wins",
        "AVERAGE the tied recipes' ids",
      ],
      answer: 1,
      why: "An unbroken ROW_NUMBER tie resolves by scan luck — rerun and the household's 'usual' changes. A named tiebreaker makes the argmax reproducible; MAX over text picks 'Zucchini…' for everyone; averaging ids produces a recipe nobody ordered.",
      notes: [
        { choice: 0, why: "'The engine picks one' is exactly the silent judgment call the panel hunts — the tie policy is part of the definition, not a footnote." },
        { choice: 2, why: "MAX is an aggregate wearing an argmax's clothes — it answers 'alphabetically last', a question nobody asked." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-23",
      prompt: "The weekly menu sheet runs GROUP_CONCAT(p.name) with GROUP BY cycle week. A stakeholder asks 'how many recipes ran that week?'. What do you compute?",
      choices: [
        "COUNT commas in the folded cell + 1",
        "COUNT(DISTINCT oi.product_id) at the pre-fold grain — the fold is presentation, the count is an aggregate",
        "LENGTH of the cell divided by average recipe-name length",
        "COUNT(*) on the folded result rows",
      ],
      answer: 1,
      why: "GROUP_CONCAT is a presentation fold — order inside the cell is engine-dependent and recipes repeat across boxes, so parsing the string is guesswork. The honest count is a DISTINCT at the pre-fold grain, one aggregate away from the sheet.",
      notes: [
        { choice: 0, why: "Comma-counting breaks on every separator edge case and on repeats — and it silently assumes the fold was ordered, which older SQLite does not guarantee." },
        { choice: 2, why: "Length arithmetic depends on the name distribution — a heuristic wearing a metric's name." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-24",
      prompt: "The coverage fold reads: CASE WHEN COUNT(p.id) = 0 THEN 'none' WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact' ELSE 'partial' END. Statement #25 bills 6,148 with a 4,000 leg. Where does it land — and why is the ELSE load-bearing?",
      choices: [
        "exact — a payment exists, so the statement counts as settled",
        "partial — the ELSE is the bucket that catches money-in-but-short, and rebranding it folds the shortfall into a clean bucket",
        "none — the leg is less than the bill, so it counts as absent",
        "The fold errors — two aggregates cannot share a CASE",
      ],
      answer: 1,
      why: "4,000 ≠ 6,148 and COUNT(p.id) = 1, so the row falls to the ELSE: 'partial'. The ELSE arm is the honest bucket — label it anything cleaner and the close overstates settled AR by exactly the shortfall nobody chased.",
      notes: [
        { choice: 0, why: "'A payment exists' is not the definition — equality is. Presence without equality is the partial state the arm exists for." },
        { choice: 2, why: "The leg is real money against a real bill — the none bucket is for zero legs, and merging partials into it invents dunning letters for households that already paid half." },
      ],
      difficulty: "medium",
    },
    {
      id: "blueapron-mcq-25",
      prompt: "SUM(oi.quantity) OVER (PARTITION BY p.category) paints family totals onto every box line. What does a line in the Accessories family show, and what happened to the other lines?",
      choices: [
        "121 — its family's boxed portions; every other line still exists, painted with its own family total",
        "121 — and the result collapsed to one row per family",
        "498 — PARTITION BY is ignored without ORDER BY",
        "The line's own portions only — other families vanish",
      ],
      answer: 0,
      why: "PARTITION BY computes the family aggregate and paints it on each member row: Accessories lines each read 121, Audio lines each read 97 — no folding, every line survives. It is per-family context without the collapse, which is how per-line share divides: this line's portions over 121, not over 498.",
      notes: [
        { choice: 1, why: "Collapsing to one row per family is GROUP BY's job — windows exist precisely to keep rows while carrying the group's context." },
        { choice: 2, why: "ORDER BY changes the window's sequencing, not the partition's existence — the sum is computed over the partition either way." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-26",
      prompt: "A cold-chain capacity gate wants every cycle where the RUNNING box value stays under a van limit: SELECT …, SUM(total) OVER (ORDER BY created_at) AS running FROM cycles WHERE running <= 500. It fails. Why?",
      choices: [
        "SUM cannot be used in a window",
        "Window output is not visible to WHERE — WHERE runs before the window computes; the gate must stage the windowed fold in a CTE or subquery, then filter",
        "The van limit needs a JOIN to a capacity table",
        "ORDER BY created_at is not allowed with SUM",
      ],
      answer: 1,
      why: "The pipeline evaluates WHERE before SELECT, and windows compute in SELECT — so 'running' does not exist at filter time. The fix is staging: wrap the windowed fold in a CTE and apply WHERE running <= 500 in the outer query. This is the two-step every running-gate reads takes.",
      notes: [
        { choice: 0, why: "SUM over a window is fine — the failure is evaluation order, not the aggregate's legality." },
        { choice: 2, why: "Capacity may live in a table, but the query fails before any join matters — the reference to an unbuilt column is the error." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-27",
      prompt: "The portion walk uses LAG(portions) OVER (ORDER BY month). A teammate sorts the window DESC 'to show the newest month first'. What happens to prev_portions?",
      choices: [
        "Nothing — LAG is direction-agnostic",
        "Every row's prev becomes the NEWER month — the walk silently reads the future and every delta flips sign",
        "The first row errors out",
        "The NULL edge moves to the last row and the deltas stay correct",
      ],
      answer: 1,
      why: "LAG reads the previous row of the window's own ordering — reorder the window and 'previous' means newer. February's prev becomes March's 40 and every month-over-month delta inverts; the output's ORDER BY cannot repair a window ordered backwards.",
      notes: [
        { choice: 0, why: "LAG is ordering-dependent by definition — the window's ORDER BY is the metric's timeline, not a presentation choice." },
        { choice: 2, why: "No error anywhere — a smooth, plausible, backwards walk. The worst failure mode a review can face." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-28",
      prompt: "Week-5 retention needs each household's FIRST cycle month, then a check of which households ordered in weeks 2-5. Why does this want staged folding, not one SELECT?",
      choices: [
        "It doesn't — a single SELECT with two windows handles it",
        "The first-event fold is itself an aggregate (MIN/first cycle), and the week-offset check compares later cycles against that per-household constant — two grains that cannot fold in one SELECT, so stage the firsts in a CTE and join back",
        "Windows cannot reference MIN",
        "Retention requires a recursive CTE by definition",
      ],
      answer: 1,
      why: "You cannot fold per household (first cycle) and then compare later cycles to that fold in one SELECT — the comparison needs the aggregate materialized. WITH firsts AS (SELECT customer_id, MIN(created_at) …) stages the baseline; the outer query joins later cycles and computes offsets. This is the same two-stage shape as the pantry ledger.",
      notes: [
        { choice: 0, why: "One SELECT would need window functions over a fold that hasn't happened — the engine cannot compute the first-event baseline and read against it simultaneously." },
        { choice: 3, why: "Recursive CTEs solve self-referential iteration, not cohort offsets — the recursion would be decorative complexity." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-29",
      prompt: "The payments self-join p1.invoice_id = p2.invoice_id AND p1.id < p2.id surfaces 5 statements, each carrying a card leg and a wire leg. What is the correct classification?",
      choices: [
        "Duplicate captures — refund four of them immediately",
        "Expected splits — card-plus-wire is the split-settlement design here; the detector flags, the classifier judges",
        "A join bug — the id guard inverted the pairing",
        "Ledger corruption — the trial balance must now fail",
      ],
      answer: 1,
      why: "The detector is mechanical — pairs per statement, each split counted once by the id guard. Judgment lives in the classifier: five card-plus-wire pairs match the split-settlement design (27 legs over 28 statements), so they page nobody. The real anomaly is #28 — 'paid' with ZERO legs — which pairs with nothing and never appears in this self-join at all.",
      notes: [
        { choice: 0, why: "Refunding legitimate splits creates the incidents the detector was built to prevent — detection without classification is noise generation." },
        { choice: 3, why: "The trial balance checks the plumbing, not the pairing — splits balance perfectly. The anomaly that matters is a status lying about legs that never existed." },
      ],
      difficulty: "hard",
    },
    {
      id: "blueapron-mcq-30",
      prompt: "The ledger trial balance reads 181,080 debits against 181,080 credits — delta zero. The paid-claim anomaly #28 (status 'paid', zero payment legs) sits inside it. What does this prove and not prove?",
      choices: [
        "The anomaly is fine — a zero delta means every row is classified correctly",
        "Double-entry held at write time; it proves nothing about classification — the anomaly balances perfectly and is still wrong",
        "The ledger needs a re-import",
        "Delta zero means #28's 1,756.00 was paid twice",
      ],
      answer: 1,
      why: "The trial balance is a plumbing check: every debit met a credit. Classification is a different layer — a remittance booked against the wrong statement still balances — which is why the close ships two artifacts: the trial balance AND the coverage census (21 exact / 1 partial / 6 never-remitted) with its anomaly list.",
      notes: [
        { choice: 0, why: "Balance is necessary but nowhere near sufficient — 'it balances' is how a paid-status lie survives six closes." },
        { choice: 3, why: "Delta zero says nothing about count or pairing — #28 has no legs at all, and the delta cannot see it." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-blueapron-3",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The partner bench read",
      brief:
        "Supplier-review brief, in-world: the supply lead wants the farm and protein bench read at menu value — every partner with their rating, recipe count, and the box-line value their SKUs generated, cut to the trusted tier. Probed on the storefront db: 6 farm/protein partners source the 16-recipe menu; at a rating floor of 4.0 the bench reads Nordic Gadgets AB 4.6 (3 recipes, 11,130.25), Midwest Hardware Co 4.4 (3, 9,294.93), Alpine Audio GmbH 4.8 (2, 4,765.63), Andes Naturals SA 4.0 (2, 3,613.25) and Shenzhen Electro 4.1 (3, 3,049.07) — 31,853.13 of partner-sourced value, 91.4% of the 34,833.28 book. Pacific Textiles (3.9) drops below the floor — the watchlist partner the read exists to name. The chain is suppliers → products → order_items, and the line hop is where the fan-out lives.",
      ask: "Return partner name, rating, recipe count and menu value for every partner rated 4.0 or better, biggest menu value first.",
      template:
        "SELECT s.name AS partner,\n       s.rating,\n       COUNT(DISTINCT p.id) AS recipes,\n       ROUND(SUM({1} * oi.unit_price), 2) AS menu_value\nFROM suppliers s\n{2} products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.rating >= {3}\nGROUP BY s.id, s.name\nORDER BY menu_value {4};",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the line-value multiplier",
          why: "Menu value is portions × per-portion price per line: SUM(oi.quantity * oi.unit_price) reads 11,130.25 for Nordic. SUM(oi.unit_price * oi.unit_price) prices the line twice and invents dollars, and SUM(oi.id) adds line ids — a number with no unit at all.",
        },
        {
          answer: "JOIN",
          kind: "keyword",
          label: "the chain linker",
          why: "The bench is a three-table chain — suppliers to products to box lines — and each hop needs its own JOIN … ON. LEFT alone before the table name is a syntax error, and every partner here has recipes, so the plain INNER JOIN is the honest linker.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the trusted-tier floor",
          why: "The rating floor keeps Nordic (4.6), Midwest (4.4), Alpine (4.8), Andes (4.0) and Shenzhen (4.1) — five partners, 91.4% of value — and drops Pacific Textiles (3.9) to the watchlist. A floor of 3.9 re-admits Pacific and the read stops being a trusted tier at all.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bench-first sort",
          why: "The supply lead reads exposure ranked by value: Nordic 11,130.25 on top, Midwest 9,294.93 behind it — the two names that carry 58.7% of partner-sourced value. ASC opens the review on Shenzhen's 3,049.07 and runs out of time before the concentration risk is discussed.",
        },
      ],
      distractors: ["oi.unit_price", "oi.id", "LEFT", "INNER", "3.9", "ASC"],
      walkthrough:
        "A three-table chain with the fan-out discipline on display. Suppliers join products at the recipe hop and products join order_items at the line hop — and the line hop is where every recipe fans into many records, which is why the two aggregates disagree on grain: COUNT(DISTINCT p.id) folds the fan-out back to recipes (Nordic reads 3, not its line count), while SUM(oi.quantity * oi.unit_price) is the one aggregate that WANTS the fan-out, because each line's value counts exactly once — Nordic's 11,130.25 is 32.0% of the book on its own. The rating floor is a row-level fact about suppliers, so it filters in WHERE before any fold: Pacific Textiles at 3.9 drops, and the bench reads five partners worth 31,853.13 — 91.4% of the 34,833.28 book — with ORDER BY menu_value DESC putting the two-name concentration (Nordic plus Midwest, 58.7%) where the meeting starts. The distractors all bite: re-pricing the line as unit_price² invents dollars, oi.id sums line ids, a bare LEFT or INNER before the table name errors the chain, 3.9 quietly re-admits the watchlist partner, and ASC buries the concentration story under the smallest bench row.",
    },
    {
      id: "cs-blueapron-4",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The per-portion price bands",
      brief:
        "Pricing-review brief, in-world: the menu team prices the plan ladder at per-portion grain, and the two published bands are the economy-versus-premium split — portions priced under 55 a box are 'budget', everything 55 and above is 'family'. Probed on the storefront db: 251 box line records fold into budget 133 lines carrying 268 portions at a 31.01 average line price, and family 118 lines carrying 230 portions at 115.85 — the family band moves half the value on fewer lines, which is the pricing story in two rows. The band edge is a published definition: the WHEN arm is strictly under 55 and the ELSE catches the edge, and the fold reads biggest band first by portions so the economy base leads the review.",
      ask: "Return the two per-portion bands with line count, boxed portions and average line price to 2 decimals, biggest portion base first.",
      template:
        "SELECT CASE WHEN oi.unit_price {1} 55 THEN '{2}' ELSE 'family' END AS band,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS portions,\n       ROUND(AVG(oi.unit_price), 2) AS avg_line_price\nFROM order_items oi\nGROUP BY band\nORDER BY portions {3};",
      slots: [
        {
          answer: "<",
          kind: "keyword",
          label: "the band-edge comparison",
          why: "Strictly under 55 is the published economy edge: flip it to > and the two bands swap names wholesale — budget reads 230/115.85 and family reads 268/31.01 — while the board still quotes the old numbers.",
        },
        {
          answer: "budget",
          kind: "keyword",
          label: "the economy-band label",
          why: "'budget' names the under-55 arm — 133 lines, 268 portions, 31.01 average. Any other label (or 'premium', a band that does not exist at portion grain) ships a taxonomy the menu team's plan ladder cannot reconcile.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-base-first sort",
          why: "The review leads with the portion base: budget 268, then family 230. ASC opens on family's 230 and inverts the story — the economy base that anchors the plan ladder reads second.",
        },
      ],
      distractors: [">", "premium", "ASC", "MAX"],
      walkthrough:
        "One fold, two bands, the menu's economy split in a single pass. The CASE maps each of the 251 lines to its band — unit_price < 55 to 'budget', everything else (the edge included) to 'family' — and GROUP BY band folds them: budget reads 133 lines, 268 portions, 31.01 average; family reads 118 lines, 230 portions, 115.85. That asymmetry is the pricing story: the economy band moves MORE portions (268 of 498) on MORE lines but a fraction of the value, while the family band carries the plan-ladder revenue on fewer, pricier lines. ORDER BY portions DESC leads with the base that defines the ladder. The distractors fail cleanly: > swaps the two bands' names wholesale while keeping every number — the quietest, most dangerous re-edge; 'premium' invents a taxonomy that does not exist at portion grain; ASC inverts the lead; and MAX in the comparison position errors the CASE outright. One definition, two rows, and every number traces to the fold.",
    },
    {
      id: "cs-blueapron-5",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The recipe portion tiers",
      brief:
        "Catalog brief, in-world: the menu team publishes a recipe velocity ladder — every recipe ranked by portions actually boxed — and the tie policy is part of the definition: tied recipes share a tier and no phantom tiers may appear, because a tier gap implies a velocity nobody cooked. Probed on the storefront db: the ladder runs Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 38, then a two-way tie at 36 (Laptop Stand, Wireless Mouse), 33, 31, then a THREE-way tie at 30 (Fitness Band X2, Ring Light, Studio Desktop Mic). The published cut keeps recipes with at least 30 boxed portions — 10 recipes — so the tie block stays visible and the tier arithmetic can be checked against the menu board. DENSE_RANK is the published semantics: shared tiers, no gaps.",
      ask: "Return recipe name, boxed portions, and a no-gap velocity tier for every recipe with at least 30 portions, biggest first with a deterministic name tiebreak.",
      template:
        "SELECT p.name AS recipe,\n       SUM({1}) AS portions,\n       DENSE_RANK() OVER (ORDER BY SUM(oi.quantity) {2}) AS tier\nFROM order_items oi\nJOIN products p ON {3}\nGROUP BY p.id, p.name\nHAVING SUM(oi.quantity) >= {4}\nORDER BY portions DESC, recipe;",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the portion counter",
          why: "Box lines record recipes × portions, so SUM(oi.quantity) per recipe reads the 47-portion Desk Mat ladder. SUM(oi.unit_price) prints a dollar total where a portion count belongs — velocity is units, not revenue.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the velocity direction",
          why: "Tier 1 is the most-boxed recipe, so the window ORDER BY runs descending. ASC crowns the 21-portion tail tier 1 and buries the Desk Mat's 47 — a correct-looking query answering the opposite question.",
        },
        {
          answer: "oi.product_id = p.id",
          kind: "keyword",
          label: "the recipe join key",
          why: "The line's product_id must equal the recipe's id — that is the whole linkage. oi.id = p.id joins on the line's own id and produces garbage velocities; a truthy half-key like oi.product_id alone fan-outs every line to every recipe.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the velocity cut",
          why: "HAVING SUM(oi.quantity) >= 30 keeps exactly 10 recipes — down to the three-way 30 tie — so the tie block is visible and the tier arithmetic auditable. A cut of 21 keeps all 16 recipes and the board loses the 'velocity tier' idea entirely.",
        },
      ],
      distractors: ["oi.unit_price", "ASC", "oi.id = p.id", "21", "COUNT"],
      walkthrough:
        "A census, a cut, and a tie policy at recipe grain. The join links every box line to its recipe through oi.product_id = p.id, GROUP BY the recipe grain folds 251 lines into 16 recipes with SUM(oi.quantity) — the aggregate that WANTS the line fan-out — and HAVING SUM(oi.quantity) >= 30 keeps the published 10: 47, 46, 38, the two 36s, 33, 31, then the three-way 30 tie. DENSE_RANK with the descending window reads 1, 2, 3, 4, 4, 6, 7, 8, 8, 8 — the 36s share tier 4 and skip to 6, the 30s all share tier 8 — gap-free by policy, with the name tiebreak making row order reproducible. That is the whole point: RANK would print the same tiers here only because the cuts happen to sit where they sit, but the board publishes DENSE_RANK because it cannot manufacture a phantom tier on any menu, and ROW_NUMBER would split three genuinely tied recipes by scan luck. The distractors all bite: unit_price re-prices velocity as dollars; ASC crowns the tail; oi.id = p.id joins lines to the wrong keys and prints garbage velocities; a cut of 21 erases the tier idea; COUNT in any slot errors the fold or the gate.",
    },
    {
      id: "cs-blueapron-6",
      tier: "hard",
      topic: "t7",
      universe: "inventory",
      title: "The portion run-rate walk",
      brief:
        "Supply-planning brief, in-world: before next week's pantry order locks, supply wants the monthly boxed-portion walk — each month's portions beside the prior month's, with the delta — because surplus is planned minus boxed, and the boxed run-rate IS the demand signal the pantry buys against. Probed on the storefront db: 498 portions across 14 monthly buckets from 2024-01 to 2025-02; the walk opens at 50, bumps to 51 in February, then fades — 40, 34, 45, 27, 22 — with the July trough of 22 portions marking the year's low water and the −18 June delta marking the biggest single fade. LAG carries the prior month; the first month's delta is honestly NULL — no baseline exists. The walk is chronological, all 14 buckets, because the recovery months matter as much as the fade.",
      ask: "Return month, boxed portions, the prior month's portions, and the month-over-month delta, for all 14 months.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         SUM(oi.quantity) AS portions\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  GROUP BY month\n)\nSELECT month,\n       portions,\n       {1}(portions) OVER (ORDER BY {2}) AS prev_portions,\n       portions - LAG(portions) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY month {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(portions) walks the window backwards one row — February's prev is January's 50. LEAD would read forward and hand February March's 40, re-labeling the future as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the chronological sort key",
          why: "The window must walk the calendar: ORDER BY month hands each month its predecessor. ORDER BY portions walks the velocity ladder instead — every 'previous' becomes a different month and the deltas read fiction that still sums plausibly.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the forward-walk direction",
          why: "A run-rate walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it, ending at 2025-02. DESC presents the newest month first with its baseline below — the numbers survive, the supply story doesn't.",
        },
      ],
      distractors: ["LEAD", "portions", "DESC", "SUM"],
      walkthrough:
        "Staged windows at the portion grain. The CTE joins every box line to its cycle and folds 251 lines into 14 monthly buckets — SUM(oi.quantity) is the one aggregate that WANTS the fan-out, reading 50, 51, 40, 34, 45, 27, 22, 40, 44, 33, 25, 30, 24, 33 (498 total). The outer query reads each month with its neighbor: LAG(portions) OVER (ORDER BY month) brings January's 50 into February's row, and the delta subtracts that same LAG — +1, then -11 into March, -6, +11, -18 into June's 27, and -5 into the 22-portion July trough, the low water the pantry memo names before the +18 August restock swings back. The first month is NULL by design: no prior row, no baseline, no invented zero. The two-step matters — window output isn't visible to sibling expressions in the same SELECT, so the CTE stages the grain and the outer SELECT layers the windows. LEAD would read the future (February's prev becomes March's 40); ordering the window by portions walks the velocity ladder instead of the calendar; DESC tells the story backwards from the trough; SUM would pile a running total into prev_portions. Every chip changes what supply would buy next week.",
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
    { slug: "customer-order-frequency", why: "HAVING gates on cadence frequency — which households ordered in enough cycles to join the steady-cadence cohort. Frequency gates are how the winback calendar is actually built here." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The cadence argmax: which household places the most boxes. Ties on the argmax are the follow-up, because 'the power household' must resolve to one logo." },
    { slug: "week-over-week-churn", why: "Churn deltas week over week — the skipped-week verdict tracked as movement, not a stock number. The pause-vs-churn census in this kit is the same taxonomy at cycle grain." },
    { slug: "immediate-food-delivery-ii", why: "The kept-share drill: delivered over ALL placed cycles with the denominator argued out loud — 52 of 103 here, paused and skipped weeks defended, not dropped." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain census at its native grain: boxes beside households per market — EU 45 from 8, APAC 37 from 5 — the load-versus-coverage pair every lifecycle review opens with." },
    { slug: "daily-leads-and-partners", why: "Two counts at two grains in one pass — boxes and households per day. The census shape until it is reflex, because mixing the grains is the classic bug that survives to the board." },
    { slug: "dormant-reactivation", why: "Households reachable but untouched — the winback list before a pause hardens into a skip. First/last-event logic and the anti-join that finds the reachable middle." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Re-engagement windows: two placements inside a sliding week — the reactivation test lifecycle runs before writing a household off. Window-bounded pairing over the box stream." },
    { slug: "customers-who-never-order", why: "The subscriber anti-join — which returns a confident ZERO here (every household has ordered), and proving that zero with its denominator is the honest drill." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Absence counting at scale: accounts with no activity in a window, the billing-ops shape behind 'statements with no settlement' (6 of 28 here)." },
    { slug: "spend-histogram", why: "Band histograms with honest empty buckets — the per-portion band fold (268 at 31.01 versus 230 at 115.85) is this shape, and a band that prints no row is a lie." },
    { slug: "the-category-of-each-member-in-the-store", why: "CASE-classifying every household by its cadence — power, steady, fragile — with exhaustive ordered arms. The same classification the lifecycle board publishes." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before the portion-ladder escalation. The menu's ladder is tie-heavy by construction." },
    { slug: "usage-tier-percentiles", why: "Percentile tiers over usage — velocity bands at recipe grain, the tier vocabulary the menu board publishes. Percentile math over the portion fold." },
    { slug: "find-cumulative-salary-of-an-employee", why: "Running sums over an ordered fold — the cumulative discipline behind the portion walk and the cold-chain capacity gates. Frame semantics decide whether a tie jumps the total." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Running-sum capacity gates: order the boxes, accumulate the value, cut at the van limit — cold-chain loading is this problem in this kit's clothing." },
  ],
};
