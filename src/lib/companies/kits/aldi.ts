// ALDI — Wave-11 (Task 102), food domain, no tagged pool — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12, incl. the wave-8+9
// probe-derived canonical cells).
// Hard-discount grocery at maximum leanness: the storefront db read as an ALDI
// trading sandbox — customers are shoppers (region = the four market buckets,
// carried as the db's EU/APAC/US/LATAM codes), orders are baskets (delivered =
// paid and out the door 52, shipped = curbside/delivery run dispatched with
// shipped_at as the dispatch stamp 30, pending = basket being picked 14,
// cancelled = abandoned basket 7), order_items are basket lines (quantity =
// units, unit_price = the line price paid), products are THE CURATED
// ASSORTMENT — 16 SKUs is the whole range, and that number is the ALDI thesis,
// suppliers are the own-label partners (6; every product is private label by
// construction — extreme concentration IS the ALDI story), invoices are
// supplier settlement statements, payments are settlement rails (card/wire),
// expenses are store opex (Rent vs the famously tiny Ads line), ledger_entries
// is the GL. orders.total and order_items.unit_price are REAL dollars; finance
// tables store INTEGER cents — the dollar read is amount_cents / 100.0. Angle
// kept DISTINCT from tesco (Clubcard promo bands), kroger (national-brand vs
// Our Brands bench + fuel points) and waitrose (premiumization ladder): ALDI's
// angle is LEANNESS — fewer SKUs, deeper supplier dependency, lean baskets.
// Pool provenance: company-pools.md carries NO ALDI section (0 tagged rows,
// none SQL-graded), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu — sql rows only, no w*/d*/f*
// rows — and say so. Case briefs quote probed figures from
// scripts/company-facts.md; the case-2 cumulative-share cells (32 → 58.6 →
// 72.3 → 82.7 → 91.4 → 100) and the aisle-census cells were probe-verified
// readonly against db/custom.db by this kit's probes; every case slot is
// mechanically verified against the db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: aldi is NOT yet in registry
// COMPANY_META (wave-11 unwired) — wire id "aldi", domainId "food",
// name "ALDI", tagline "Hard-discount leanness: one-deep aisles, own-label
// concentration, basket depth", accent "text-cyan-400" to match this header
// exactly.
//
// 3x EXPANSION (Task 103-aldi) — appended below this header, every original
// entry byte-identical. New probe-derived cells (this task's probes, readonly
// against db/custom.db): cs-aldi-4's mean monthly book 2,488.09 with trough gap
// cells -1,294.23 / -839.29 / -818.59 / -440.66; cs-aldi-6's trolley line-count
// distribution 26/29/25/23 with the 4-line ceiling holding 23 baskets and
// ceiling-basket spend cells 945.21 / 845.92 / 826.03 / 752.96 / 705.39.
// cs-aldi-3 and cs-aldi-5 quote facts-file cells only (status×region grid,
// expenses by category). Topics 11-15 and problems 17-32 stay theme-curated
// (company-pools.md carries no ALDI section) — sql rows only, no w*/d*/f* rows.

import type { CompanyKit } from "../types";

export const aldiKit: CompanyKit = {
  id: "aldi",
  domainId: "food",
  name: "ALDI",
  tagline: "Hard-discount leanness: one-deep aisles, own-label concentration, basket depth",
  accent: "text-cyan-400",

  brief: [
    "**ALDI** runs the leanest shelf in mainstream grocery — a hard discounter whose range is a deliberately narrow few thousand SKUs where a full-spectrum supermarket stocks thirty thousand, sold without background music, elaborate fixtures or a meaningful advertising budget. Leanness is not a constraint here; it is the commercial thesis. Every SKU must earn its slot by throughput, and the ~90% own-label share means the supplier list is short, deep and strategically precious — a negotiation with one partner moves whole aisles. This kit maps the storefront db onto that world: the 16 products rows ARE the curated assortment, the 6 suppliers rows are the own-label partners who make everything, the 103 orders are baskets worth **34,833.28**, and the 251 order_items rows are basket lines — quantity = units, unit_price = the line price paid. The basket-fate map is fixed: delivered = {emerald:paid and out the door} (52, 50.5%), shipped = {sky:curbside run dispatched} (30, 29.1%, shipped_at = the dispatch stamp), pending = basket being picked (14, 13.6%), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org is small and the questions are lean with it. Assortment analytics owns the range review: aisle productivity folds (Audio turns **11,744.01** from just 3 SKUs; one-SKU Fitness still moves 27 units for 863.91), and the price-band audit — 8 budget SKUs averaging **32.06** against 8 mid-band at 111.5, ceiling 199.99 with the premium band provably EMPTY. Supply analytics owns the partner book: six own-label partners carry the entire shelf, the top two hold 32% and 26.7% of the book, and the trusted bench at rating 4.5-plus is {amber:exactly two of six} (Nordic 4.6, Alpine 4.8). Ops owns the dispatch clock — 82 of 103 baskets carry the shipped_at stamp, averaging **2.98 days** with a 2–4 spread. Finance ops closes the settlement spine: 28 supplier statements and 27 legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator, leanness-flavored. A typical loop opens with a **two-grain market read** — one bucket runs 45 baskets from just 8 shoppers (intensity 5.6) while another runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does an abandoned basket count in your base?'*), then into the throughput ladder where tie blocks at 36, 30 and 21 units make rank semantics a shelf-slot policy, not syntax. Late rounds band the range at a price line with `CASE`, walk the {sky:14-month trading spine} (2024-01 to 2025-02, July trough 1,193.86) with `LAG` deltas, or audit the settlement book where a paid-status statement with zero legs (#28, 1,756.00) is the standing trap. Candidates who state the definition and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no ALDI section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: basket-fate censuses, two-grain shopper reads, aisle productivity folds, honest-tie throughput ladders, partner-dependency windows and the cents-safe settlement spine. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {emerald:one-deep aisle census} the range review opens with, the other rebuilds the {amber:partner-dependency ladder} buying walks into every negotiation, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the definition and the denominator before you compute anything* — then make every basket-fate census reconcile to 103 by construction.",
    "Round three is where the lean format shows its teeth. The screens stop asking what and start asking **how many passes**: a fate census rebuilt as one scan with {sky:FILTER} (WHERE …) arms instead of four grouped queries that can drift between runs, a below-average trough audit staged through a derived table so the fold's grain is pinned — one row per month — before any comparison runs, and a co-occurrence read where basket pairs must be canonicalized on `a.id < b.id` or every pair prints twice. Set ops enter here too: `UNION ALL` stacks the fate arms without touching them, while a bare `UNION` dedupes whole rows and can silently collapse tied arms the census meant to keep. The leanness thread never breaks — on a 16-SKU shelf a duplicated pair row is not noise, it is a finding.",
    "Preparation at depth means drilling the shapes the standard kit only introduces. Run every census twice — once grouped, once one-pass with {emerald:FILTER} — and reconcile both to the same 103 baskets before trusting either; stage every ladder in a CTE or derived table and say the grain out loud (`one row per partner`, `one row per month`); practice the confident empty result — the premium band above 199.99, the never-ordered SKU — until *'this returns zero rows and that is the finding'* is a reflex, not a defense. Then sit with the two numbers that look like failures and are actually the story: the **6 never-settled statements worth 15,217**, and the 4-line trolley ceiling holding 23 of the 103 baskets. Senior loops grade the analyst who holds a lean denominator and a rich fold in one query without letting either drift.",
  ],

  dayInLife: [
    "**08:10 —** The day starts with the range review pack. An assortment analyst opens the trading dashboard before the aisle meeting: did overnight curbside runs get their `shipped_at` dispatch stamps, is any basket aging while being picked, does the one-pass fate census reconcile — 52 paid-and-out + 30 dispatched + 14 picking + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. The aisle census refreshes next — the 16-SKU range folded to seven aisles, Audio's 11,744.01 checked against its 97 units — and if dispatch latency drifts off the **2.98-day** norm (EU 2.94, APAC 2.93, US 3.07), the pick-queue gets pulled before the range read ships.",
    "**11:30 —** Midday is the partner read. Buying wants the dependency ladder re-run before a negotiation: revenue folded per own-label partner, share of the whole book beside the cumulative walk — 32 → 58.6 → **72.3** by the third partner — because *the cumulative line, not the single share, is what the negotiation hangs on*. Supply quality wants the bench re-cut at the 4.5 rating floor — exactly two of six partners survive it — and assortment wants the band audit: 8 budget SKUs at 32.06 against 8 mid at 111.5, with the 200-plus band reported EMPTY rather than silently zero. Each ask is a join, a window and one judgment call about grain; the analyst writes the query twice — *once to answer, once with the denominator spelled out so the number survives the buying argument*.",
    "**15:30 —** The afternoon tilts toward the settlement book and store opex. The AR anti-join refreshes first — **6 never-settled statements worth 15,217** — before supplier services sends a single reminder; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled), and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). The lean-opex read closes the loop — Rent 14 entries at 16,800, Ads just 4,570 (the no-advertising model in one line), Tools 1,525, Travel 2,521 — and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**19:40 —** The day closes the way a lean close should: writing. The analyst pins the pack's definitions into the readout header — delivered means paid-and-out (52), the dispatch clock runs on the 82 `shipped_at`-stamped baskets only, the settlement census foots 21 exact + 1 partial + 6 none = 28 — because *a number without its population is a rumor*. One last pass over the deep-trolley census: **23 baskets sit at the 4-line ceiling**, and the pick-path lead gets the board sorted by spend (945.21 down) with the ceiling itself printed on it, since a 5-line trolley tomorrow would mean the db's shape changed, not that someone shopped big. Last act: the ledger trial balance — **181,080 against 181,080**, delta zero — and the pack ships with every denominator spelled out.",
  ],

  metrics: [
    { name: "Range count", what: "SKUs on the shelf: 16 in this db — the whole assortment on one screen, seven aisles deep. The count itself is the ALDI KPI: a full-spectrum grocer stocks thousands; here every addition is a range-review fight and every slot must pay for itself in throughput." },
    { name: "Aisle productivity", what: "Revenue per aisle against SKUs behind it: Audio 11,744.01 from 3 SKUs, Wearables 6,929.12 from 2, Fitness 863.91 from 1. The one-deep discipline read — few SKUs, high turn — and the first chart the range review opens with." },
    { name: "Basket book & AOV", what: "Total basket value 34,833.28 across 103 baskets, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the lean-basket story — a fixed small range still produces a 42x spread between the lightest and heaviest trolley." },
    { name: "Basket leanness", what: "251 lines across 103 baskets = 2.44 lines per basket, max 3 units on any line, 498 units total. Depth, not breadth: the narrow range shows up as few lines per basket with tight quantity caps — the anti-trolley metric." },
    { name: "Partner concentration", what: "Share of the 34,833.28 book by own-label partner: Nordic 32% (rated 4.6), Midwest 26.7% (4.4), and the cumulative read 32 → 58.6 → 72.3 down the ladder. Six partners make everything; the top three carry 72.3% — supplier dependency in one query." },
    { name: "Abandoned-basket share", what: "Cancelled baskets ÷ all, per market: EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0.0. The honest-denominator metric — numerator and denominator must fold over the same 103-basket base, and the interviewer asks for that base out loud." },
    { name: "Dispatch clock", what: "Created_at to shipped_at over stamped baskets only: 82 of 103, 2.98-day average, range 2–4. The curbside promise read — the 14 picking and 7 abandoned baskets have no stamp yet, and the population ships with the number." },
    { name: "Store opex & the close", what: "Store opex: Rent 14 entries / 16,800, Ads 14 / 4,570 (the no-advertising model in one line), Tools 5 / 1,525, Travel 3 / 2,521. AR 6 unpaid / 15,217; ledger trial balance 181,080 = 181,080, delta zero — the close ships or it is an incident." },
    { name: "Top-shopper concentration", what: "Share of the 34,833.28 book from shoppers whose lifetime spend crosses 3,000: 63.5% (71.2% at the 2,000 line). Alice Chen alone runs 24 baskets / 7,262.35 — the lean format's demand is concentrated in few households, and the intensity read (5.6 versus 9.5 baskets per shopper by market) lives right beside it." },
    { name: "Settlement clock", what: "Paid statements settle in 28.4 days on average — 13 fastest, 84 slowest — against flat 30-day terms across the whole book. The working-capital read: terms are uniform, behavior is not, and the 84-day outlier is the chase list the reminder queue is built from." },
    { name: "Settlement rail mix", what: "Card carries 16 legs / 37,364.00 against wire's 11 legs / 32,248.00, and five statement cycles settle on BOTH rails. The rails read is the audit trail — which leg settled which statement is the per-rail fold the pack runs before any reminder fires." },
    { name: "Ledger net positions", what: "The GL at a glance: cash net 44,196, AR net 16,440, sales revenue a -86,052 credit — all footing to the 181,080 = 181,080 trial balance, delta zero. The close ships on this identity or the next morning starts with an incident." },
  ],

  topics: [
    {
      name: "Basket-fate conditional counting",
      why: "Every ALDI trading read starts from the same fold: paid-and-out, dispatched, picking, abandoned — one status column, four business meanings. Each branch is a conditional count, and the interviewer's first question is what the denominator holds. The trap is calling a dispatched curbside run 'paid and out' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "monthly-transactions-i", "sales-by-day-of-the-week", "tasks-count-in-the-weekend"],
    },
    {
      name: "Two-grain shopper reads",
      why: "Baskets and shoppers are different grains of the same join, and every market census here reports both: one bucket runs 45 baskets from 8 shoppers while another runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio (5.6 versus 9.5) is the intensity read that decides where a lean format can actually grow.",
      slugs: ["unique-orders-and-customers-per-month", "number-of-rich-customers", "sales-analysis-i", "basket-depth-aov", "customers-who-never-order", "most-frequently-ordered-product-per-customer", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Assortment HAVING gates",
      why: "Leanness is policed with group-level gates: which SKUs turn at least 30 units, which baskets carry at least 4 lines, which members reordered often enough to keep a slot. A throughput floor is a group-level fact — it lives in HAVING after GROUP BY, and the candidate who puts it in WHERE has written a syntax error that also fails the interview. The gate IS the range-review question.",
      slugs: ["classes-more-than-5-students", "article-views-ii", "customer-order-frequency", "winning-candidate", "find-churn-risk-customers"],
    },
    {
      name: "Aisle productivity joins",
      why: "The one-deep census joins the 16-SKU products table to its 251 basket lines and folds to seven aisles — SKUs beside units beside baskets-touched beside revenue. Two grains per row is the point: Audio's 97 units from 3 SKUs against Accessories' 121 units from 3 is the difference between revenue-heavy and traffic-heavy aisles, and fan-out (46 baskets versus 54) is what slotting decisions actually read.",
      slugs: ["product-sales-analysis-i", "average-selling-price", "top-travellers", "sales-analysis-iii", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Throughput ladders with honest ties",
      why: "The units ladder runs 47, 46, 38, then a two-way tie at 36 and a three-way tie at 30 — tie blocks are guaranteed at this scale, and RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow. At ALDI this is a shelf-slot policy: tied SKUs share a rung and the next distinct count skips, and the analyst defends the choice in the range review, not the syntax doc.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary", "customer-placing-the-largest-number-of-orders", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Price-line CASE bands",
      why: "The range splits at price lines — 8 budget SKUs averaging 32.06 against 8 mid-band at 111.5 — and the arms must be exhaustive and ordered, because a hole in the CASE is a hole in the band audit and a reordered WHEN quietly re-bands the base. The premium band above 199.99 must be reported EMPTY, not silently dropped: proving the emptiness is part of the read.",
      slugs: ["calculate-special-bonus", "the-winner-university", "the-category-of-each-member-in-the-store", "repeat-purchase-rate", "gl-reconciliation", "rfm-segmentation"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month trading spine (2024-01 to 2025-02) is the lean-seasonality call's home turf: prior month beside current, delta rounded, the July trough (1,193.86, with 2 of the 7 cancellations) and the November dip (1,648.80, also 2 cancellations) named. LAG drives the walk; the first row's NULL is the baseline by definition, never a coalesced zero.",
      slugs: ["biggest-window-between-events", "year-on-year-growth-rate", "second-day-confirmation", "maximum-transaction-each-day", "growth-accounting", "null-blank-audit"],
    },
    {
      name: "Running-share windows",
      why: "The partner-dependency ladder is a window over an aggregate: fold revenue per partner, then SUM(revenue) OVER (ORDER BY revenue DESC) beside the whole-book denominator to print share and cumulative share on one row. The cumulative read — 32 → 58.6 → 72.3 — is the negotiation slide, and the default RANGE frame's treatment of tied revenues is a policy the analyst must state before the walk runs.",
      slugs: ["running-total-for-different-genders", "last-person-to-fit-in-the-bus", "game-play-analysis-iii", "product-sales-analysis-ii", "rolling-average-steps", "restaurant-growth", "ar-aging-schedule"],
    },
    {
      name: "Staged folds & computed bars",
      why: "Screens escalate into staging: fold per-partner revenue, then judge each against the platform mean (5,805.55 here — exactly two of six partners clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted, and the CTE stage is where the fold grain gets pinned before any window runs over it.",
      slugs: ["market-analysis-i", "average-salary-of-departments", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "Cents-safe settlement math",
      why: "Own-label means the settlement book IS the supplier relationship: 28 statements and 27 legs in INTEGER cents, where every dollar read is amount_cents / 100.0. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away, the rails matter (card 16 legs / 37,364.00, wire 11 / 32,248.00), and the missing .0 is how a settlement quietly leaks cents on every odd-cent line.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "monthly-transactions-ii", "immediate-food-delivery-ii"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "Month-close needs four counts and two money folds over the same book at one timestamp; four grouped queries can drift apart on a book that just took a posting. FILTER (WHERE …) arms fold every census cell in one scan — one population, one read point — and the close demands that contract. The drill: rebuild a grouped report as one pass, then reconcile the two to the same 103 baskets before trusting either.",
      slugs: ["active-businesses", "find-books-with-no-available-copies", "snaps-analysis", "product-price-at-a-given-date"],
    },
    {
      name: "Set-op stack reports",
      why: "Some packs append rather than fold: a fate stack, a TOTAL row under a folded book, two cohorts side by side. UNION ALL preserves every stacked row; a bare UNION silently dedupes and can collapse tied arms the census meant to keep — and a stack that stops footing is the bug that hides best. INTERSECT and EXCEPT answer the overlap family: who bought A and also B, who never came back.",
      slugs: ["the-airport-with-the-most-flights", "league-statistics", "friend-requests-ii-who-has-the-most-friends", "trial-balance-check", "bank-account-summary"],
    },
    {
      name: "Derived-table staging",
      why: "The trough audit compares each month to the mean month — a fold compared to a fold, which means the grain must be pinned before any comparison runs. Derived tables and CTEs are where that pinning happens: fold once, name it, compare outside. The scalar-subquery empty case and the fold-inside-versus-outside mistake are the two traps this family drills on every slice.",
      slugs: ["second-highest-salary", "investments-in-2016", "game-play-analysis-iv"],
    },
    {
      name: "Pair self-joins & co-occurrence",
      why: "Which categories share a basket is the adjacency question behind slotting: pair the 251 basket lines to themselves on order_id and fold. The discipline is canonicalization — a.id < b.id — or every pair prints twice and the diagonal pollutes the read; the probed census carries 27 raw pairs with 6 multi-SKU diagonals, and the mirrored duplicates are exactly what the inequality exists to kill.",
      slugs: ["most-common-course-pairs", "symmetric-pairs", "strong-friendship", "unpopular-books", "count-apples-and-oranges", "count-salary-categories"],
    },
    {
      name: "Shelf-label text hygiene",
      why: "Names arrive with stray casing and whitespace, and a join on a dirty label forks the aisle census into phantom aisles — 'audio' and 'Audio ' group separately and the 7-aisle fold reads 9. TRIM, UPPER, SUBSTR and LENGTH are the canonicalization pass, run at read time in a staged layer on a read-only book. The month spine's SUBSTR(created_at, 1, 7) is the same family doing date work.",
      slugs: ["fix-product-name-format", "invalid-tweets", "fix-names-in-a-table", "group-sold-products-by-the-date", "calculate-orders-within-each-interval"],
    },
  ],

  theory: [
    {
      id: "aldi-t1",
      q: "Your aisle census joins the 16-SKU products table to basket lines. When do you INNER and when do you LEFT — and what silently breaks if you filter a line column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An aisle productivity census joins products to order_items: a product with no basket line would be a range-review finding, not corruption — but on this db the anti-join returns a confident zero (all 16 SKUs have sold), and proving that zero is part of the analyst's job before the census ships. A waste-and-returns read must be LEFT from products: the SKUs with no lines ARE the answer, arriving with NULL line columns. The classic break: filtering a line attribute in WHERE after the LEFT JOIN kills every NULL-payload product row — the LEFT quietly became an INNER and the dead-slot list vanished. The fix is moving the predicate into ON or an outer query. On a range this narrow, a silent drop is catastrophic in a different way than at a full-spectrum grocer: with 16 SKUs, one vanished row is six percent of the shelf, and the reviewer will count.",
      tag: "joins",
    },
    {
      id: "aldi-t2",
      q: "The partner-dependency ladder needs revenue per partner plus a running cumulative share. Write the window — and tell me when RANGE versus ROWS changes the answer.",
      a: "Stage first: a CTE folds line money to partner grain (SUM(quantity * unit_price) GROUP BY partner), because windows run after folding and you cannot window a fold that has not happened. Then the walk: SUM(revenue) OVER (ORDER BY revenue DESC) divided by SUM(revenue) OVER () gives the cumulative share — 32 → 58.6 → 72.3 → 82.7 → 91.4 → 100 on this book. The RANGE/ROWS question is real: with ORDER BY, the default frame is RANGE, so rows TIED on the ORDER BY key enter the running sum together — one combined step, one shared cumulative value. This book's six partner revenues are distinct, so RANGE and ROWS read identical today; the moment two partners tie, a row-by-row dependency argument breaks silently. The strong answer names the frame explicitly — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — when the walk must be strictly row-by-row, and says WHY: policy, not syntax.",
      tag: "windows",
    },
    {
      id: "aldi-t3",
      q: "One bucket shows 45 baskets from 8 shoppers; the US shows 19 from 2. Why do those column pairs disagree, and what does each mean to a lean format like ALDI?",
      a: "They disagree because they count at different grains. COUNT(*) counts basket rows after the join — one row per basket, so a 24-basket household contributes 24. COUNT(DISTINCT customer_id) folds repeats back to shoppers — 45 baskets collapse to 8 households. Neither is wrong: baskets measure load and traffic, shoppers measure installed base. The ratio — 5.6 baskets per household in one market versus 9.5 in the US — is the intensity signal, and for a lean format it is THE growth question: ALDI does not win by stocking more, it wins by households returning to the same narrow shelf more often, so intensity moving while coverage stays flat is the good story. The trap that catches candidates is a third grain: join order_items and COUNT(*) silently counts basket LINES — 251 of them, or 498 units if you sum quantity. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "aldi-t4",
      q: "shipped_at is NULL until a curbside run is dispatched. What is your policy for the dispatch-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped baskets have a dispatch latency, so the report measures created-to-dispatch for the 82 of 103 baskets carrying the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. The 14 picking and 7 abandoned baskets have no stamp and no clock yet: a population definition, not a cleanup job. Then mechanics: AVG ignores NULLs, so AVG over ALL baskets returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly 21 rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for baskets still being picked, and it poisons the 2.98 baseline every market drift alert keys off. State the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "aldi-t5",
      q: "The range review wants SKUs turning at least 30 units, and the abandoned-share column must read 6.8, not 0. Where do each of those filters and folds live?",
      a: "Two placements, two clauses. The throughput floor is a group-level fact — SUM(quantity) >= 30 judged per SKU, so it lives in HAVING after GROUP BY; putting it in WHERE errors because the fold does not exist before groups form, and on this db the gate keeps exactly 10 of 16 SKUs. The abandoned share is a ratio over the SAME fold: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — and the 100.0 must sit BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and truncates toward zero; on this db it is the difference between 6.8 and a displayed 0, which reads as 'abandonment eliminated' — the most dangerous kind of wrong. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a shelf-slot decision and an error, and between a real share and a flat lie.",
      tag: "pipeline",
    },
    {
      id: "aldi-t6",
      q: "The supply read flags partners whose revenue beats the own-label average. What is the scalar subquery allowed to return, and what happens when its inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and revenue > NULL is UNKNOWN, so the above-average list silently returns nothing while looking valid. On the full book that is theoretical: six partners always produce a mean (34,833.28 / 6 = 5,805.55, and exactly two partners — Nordic and Midwest — clear it). On staged slices — one region, one rating band, one month — the empty-inner-query bug ships regularly, and the above-average gate is how it hides. The correlated cousin (compare each partner to the average of ITS region) re-runs per outer row and answers a different question at a different cost, inheriting the same empty-case behavior on thin slices. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. State the inner fold's population and its empty-case behavior unprompted — that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "aldi-t7",
      q: "The trading trend buckets baskets by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trading trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's baskets, and for a dispatch-stamped business the edge nights are exactly when curbside runs land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July with 2 of the 7 cancellations, and dips again to 1,648.80 in November. Date discipline is trading discipline.",
      tag: "dates",
    },
    {
      id: "aldi-t8",
      q: "Finance says a settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 none — footing to 28 or the close does not ship. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent line. Close culture: the ledger trial balance must land at 181,080 debits against 181,080 credits, delta zero.",
      tag: "quality",
    },
    {
      id: "aldi-t9",
      q: "The trading pack wants a 3-month rolling average of the monthly book beside each month. Write the window — and tell me exactly what the average holds in the spine's first two rows.",
      a: "Stage the month fold in a CTE, then walk it with an explicit frame: AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). The frame matters because the default is RANGE with UNBOUNDED PRECEDING — a cumulative average, not a rolling one. With ROWS 2 PRECEDING, March averages (3,731.97 + 3,609.64 + 2,617.08) / 3 = 3,319.56; but January's window holds ONE row and February's holds TWO — the average is honest, yet its population shrinks at the spine's edge, and the pack must disclose that rather than pad with zero-revenue months, because padding invents troughs that never traded. RANGE versus ROWS bites again if two months tie on the ORDER BY key: RANGE takes the peers together in one step. Name the frame and name the edge behavior — a rolling average that hides its window is worse than none.",
      tag: "windows",
    },
    {
      id: "aldi-t10",
      q: "Finance asks for delivered, shipped, pending and cancelled baskets in one report, and someone proposes four SELECTs stacked with UNION. What do you reach for, and what does UNION do that UNION ALL does not?",
      a: "First reach: don't stack — fold. Four conditional SUM(CASE …) arms in one GROUP BY give the fate census in one pass with one denominator, and the arms reconcile to 103 by construction. When stacking is genuinely right — appending a TOTAL row under a fold, combining two differently-shaped reads — UNION ALL is the tool: it preserves every row. UNION dedupes whole rows, so two stacked arms that coincidentally print identical tuples collapse to one and the stack stops footing — a silent drop, the worst kind. INTERSECT and EXCEPT answer the overlap family: shoppers with a delivered basket who ALSO have a cancelled one, shoppers with no pending basket at all. Set ops compare columns positionally, so both arms must project the same shapes, and NULLs compare as equal under set-op dedupe — a NULL region matches a NULL region.",
      tag: "set-ops",
    },
    {
      id: "aldi-t11",
      q: "Band the assortment at a price line — budget, mid, premium — for the range review. Walk me through writing the CASE so the band audit cannot be quietly wrong.",
      a: "Three disciplines. Exhaustive arms: budget under 50, mid 50 to under 200, premium 200-plus — with the ELSE arm as the audit arm, because a hole in the CASE sends rows to NULL and the folds silently skip them; on this shelf the premium arm is the honest-empty case, ceiling 199.99, and the audit REPORTS the empty band rather than dropping it — proving emptiness is part of the read. Ordered arms: WHEN clauses evaluate first-match, so reordering >= 50 above the budget arm swallows all 8 budget SKUs (averaging 32.06) into the mid band (8 SKUs at 111.5) and the 8/8 split — the leanness read itself — quietly becomes 16/0. One grain: band the products table's price, not the line price — a SKU's band never changes from basket to basket, and mixing the two grains is how a band audit becomes a spend audit by accident.",
      tag: "case",
    },
    {
      id: "aldi-t12",
      q: "COUNT(*), COUNT(col), COUNT(DISTINCT col) — walk me through all three on the settlement book, where the differences actually bite.",
      a: "28 statements, 27 payment legs. COUNT(*) counts rows: 28 statements. COUNT(p.invoice_id) on a LEFT JOIN from invoices to payments counts non-NULL matches only — the 6 no-leg statements drop out and the read lands on 22 statements carrying legs, which is a different population wearing the same report name. COUNT(DISTINCT p.invoice_id) folds the 27 legs back to statements — also 22, because 5 of them paid on two legs (the split-payment cycles): legs and statements are different grains, and 27 versus 22 is the fan-out talking, not an error. Same discipline on baskets: COUNT(*) is 103 baskets, COUNT(DISTINCT customer_id) is 16 shoppers, SUM(quantity) is 498 units — three counts, three grains, one careless column choice apart. The interview answer is the habit: before any count ships, say 'one row per what?' — rows, non-NULLs, and distinct keys are three different questions.",
      tag: "aggregation",
    },
    {
      id: "aldi-t13",
      q: "Now the month walk is per-partner: each own-label partner's line money against ITS prior month. What changes in the window — and how many NULLs does the walk print?",
      a: "One clause: PARTITION BY partner ORDER BY month inside the OVER. LAG(revenue) now computes within each partner's own timeline — six independent walks, not one — and the answer to the NULL question is six: every partition's first month prints a NULL prior, one baseline per partner, and each is a baseline by definition, never a coalesced zero. The frame resets at partition edges too: a running SUM restarts per partner, so a cumulative that silently ignores PARTITION BY reports one partner's February against the whole book's January — a number that looks plausible and means nothing. LEAD mirrors the walk and moves each partner's NULL to its last month; pick the direction from the question ('versus prior month' is LAG, 'into next month' is LEAD), not from whichever prints first. Partitioned walks are how a six-partner dependency book becomes six negotiation timelines.",
      tag: "windows",
    },
    {
      id: "aldi-t14",
      q: "Product names arrive with stray casing and whitespace — 'noise-Canceling headset '. What is your canonicalization pass, and where do you run it?",
      a: "TRIM, UPPER or LOWER, and SUBSTR are the workhorses, and the rule is: canonicalize KEYS, decorate labels. A join or GROUP BY on a dirty category forks the aisle census into phantom aisles — 'audio' and 'Audio ' group separately and the 7-aisle fold reads 9; wrapping the key in UPPER(TRIM(col)) at read time, inside a staged CTE, fixes the fold without touching the table, which matters on a read-only book where you cannot UPDATE your way clean. SUBSTR is the same family doing date work: SUBSTR(created_at, 1, 7) is the month spine. LENGTH is the guard rail — a label that grew a trailing tab shows up as a length anomaly before it shows up as a wrong total. The tell of a strong candidate: canonicalization lives in ONE staged layer so every downstream read sees the same clean keys — not a different TRIM in every query.",
      tag: "text",
    },
    {
      id: "aldi-t15",
      q: "Give me every basket that contains at least one Wearables line. Why EXISTS here — and when do you flip to NOT EXISTS?",
      a: "EXISTS reads as the business sentence: 'at least one line in this basket'. It is a semi-join — the inner probe stops at the first matching line per basket, so on a 251-line book it does less work than materializing an IN list — and it is NULL-safe where IN has its famous hole: NOT IN against a list containing one NULL poisons every comparison and empties the report while looking valid. The flip is the anti-join that stays honest: baskets with NO Wearables line is NOT EXISTS (SELECT 1 … WHERE the line matches the basket) — and on this shelf that is a real census question, not a corner case, because Wearables is 2 of 16 SKUs and the adjacency read wants the complement. IN with a literal list is fine for constants; the moment the list comes from a query, EXISTS or JOIN beats it on both semantics and cost. Say the empty-case behavior out loud: EXISTS over an empty inner returns false, NOT EXISTS returns true — that asymmetry is the whole bug class.",
      tag: "subqueries",
    },
    {
      id: "aldi-t16",
      q: "The ops board wants each trading day's SKUs folded into one cell. What does GROUP_CONCAT promise, and what does it not?",
      a: "It promises: one cell per group, comma-separated by default (the second argument overrides), NULLs skipped. It does NOT promise order — the sequence inside the cell is unspecified unless the input is pre-sorted in a staged subquery — and it does not promise arity: a day that sold 3 SKUs and a day that sold 9 both print one innocent-looking string, which is why the fold travels with a COUNT beside it. Length is unbounded, so a busy day can produce a cell no dashboard renders. The placement rule: GROUP_CONCAT is a display edge — fold at the LAST layer, never filter or aggregate on the folded string (strings do not fold back), and never let it hide a grain change: the day row that now carries a list is no longer the row the rollup promised. On a 16-SKU shelf the cells stay short enough to read — which is exactly why the board asks for them.",
      tag: "folds",
    },
    {
      id: "aldi-t17",
      q: "orders.total is REAL dollars; the finance tables are INTEGER cents. Where do floats and units bite, and what is your rounding policy?",
      a: "Two unit systems, one policy. REAL dollars are already dollars — quantity * unit_price folds without conversion, and the penny-round happens at the fold: ROUND(SUM(…), 2), so the aisle revenues foot to the probed 34,833.28 book and comparisons run rounded-to-rounded, never raw-float against a printed figure. INTEGER cents carry their unit in the column name: amount_cents / 100.0 — the '.0' is not decoration, it is the difference between real division and integer division; on odd-cent lines the missing .0 leaks cents on every row, and / 1000 mis-scales the whole book by a tenth while still printing plausible digits. Precision is a display contract: ROUND(x, 2) for money, ROUND(x, 1) for shares — the pack picks one per column and keeps it, because a share printing 2 decimals beside a cumulative printing 1 stops reconciling on the same page. Never round a join key: rounding is for display and comparison, not identity.",
      tag: "numerics",
    },
    {
      id: "aldi-t18",
      q: "Why is AOV computed from orders.total and not from the basket lines — and what does the line join do to every count you write?",
      a: "Grain. orders is one row per basket — 103 rows, AOV = 34,833.28 / 103 = 338.19 computed at the grain the metric names. Join to order_items and the row multiplies to 251: SUM(o.total) now counts each basket's total once per line, inflating the book 2.44x, and COUNT(*) counts lines, not baskets — the classic silent fan-out. The defensive habits: aggregate at the grain you name (money per basket from orders, line money from order_items), and when the join is unavoidable, count back with COUNT(DISTINCT o.id) — Audio touches 46 baskets and Accessories 54, which is a distinct-order read, not a COUNT(*). Same discipline on units: 498 units is SUM(quantity) over lines, 251 is line count, 103 is baskets — three numbers, three grains, one careless join away from each other. The AOV question is really a modeling question: name the grain, then make the SQL live at it.",
      tag: "modeling",
    },
    {
      id: "aldi-t19",
      q: "Is HAVING without GROUP BY legal? And why does ORDER BY accept a SELECT alias that WHERE rejects?",
      a: "Both are pipeline questions. HAVING without GROUP BY is legal — it folds the whole table into one group, so 'does the entire book clear 30,000?' is a one-row answer; forgetting that it implies a fold is how analysts mistake a 1-row result for a bug. The alias rule: the logical pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. WHERE and HAVING execute before SELECT, so an alias — and anything computed in the SELECT list, a window especially — does not exist yet and the reference errors; ORDER BY runs after SELECT, so aliases are legal there. That asymmetry is the pipeline made visible, not engine quirkiness. The robust pattern is staging: fold and compute in a CTE or derived table, then filter the outer query on the named column — the only shape that filters on a window, and it reads the same at every scale. On this book the shape is small; the habit is not.",
      tag: "pipeline",
    },
    {
      id: "aldi-t20",
      q: "A share column divides by a base that can be empty — a thin region × category slice can hold zero baskets. How do you keep the ratio honest?",
      a: "Decide what 'no base' means before the engine does. x / 0 errors or yields NULL depending on engine mood; 0.0% printed over an empty base is a lie of a specific kind — it claims a real base with zero conversions, when the truth is there was no base at all. The guard is NULLIF(denominator, 0): the share reads NULL, and NULL in a share column is a pronounceable fact — 'no baskets in this slice' — that the pack labels at the display edge (COALESCE only there, with a dash or 'n/a', never a bare 0). The discipline pairs with the kit's population habits: a share is numerator and denominator over the SAME fold, the 100.0 sits before the division, and an empty slice is a row you KEEP with a NULL share, not a row you drop — dropping it erases the slice from the board and the reviewer stops asking why the region is blank. On a 16-SKU shelf, thin slices are the norm; the guard is not defensive coding, it is the definition.",
      tag: "nulls",
    },
    {
      id: "aldi-t21",
      q: "This db is 103 baskets and 16 SKUs. Does performance instinct matter here at all, and what would you still practice?",
      a: "Honesty first: at this scale every query is instant, and theater — indexes on 16 rows, query hints — is noise. What matters is the habits that port when the shelf is 16,000 SKUs and the book is 103 million baskets. Filter early: a WHERE before the fold shrinks what the GROUP BY ever touches. Stay sargable: SUBSTR(created_at, 1, 7) = '2024-07' cannot use an index on created_at, while created_at >= '2024-07-01' AND created_at < '2024-08-01' can — same basket set, one is index-friendly. Count the rows a fold must touch before writing it (251 lines, not 'the data'); avoid SELECT * in anything that ships; stage a fold once in a CTE rather than recomputing it in four scalar subqueries. The ALDI parallel is the point: a lean operation watches every slot's cost, a lean query watches every scan's. The instinct is trainable on a small db; the crisis is not the place to learn it.",
      tag: "performance",
    },
    {
      id: "aldi-t22",
      q: "Finance reads 'revenue' as 34,833.28; ops reads 'completed revenue' as something smaller. Who is right, and how do you write a pack that survives both?",
      a: "Both — they are different KPIs with different denominators, and the pack fails when it lets one word carry two. Booked revenue is 34,833.28 over all 103 baskets: everything that entered the till flow, including the 7 cancelled and the 14 still picking. Completed revenue is a delivered-only read over the 52 — smaller by definition, and the honest way to say it is to name the denominator in the column itself (booked_book, completed_book), not in a footnote. The same discipline resolves the abandoned share (7 / 103 = 6.8% over the booked base, not 7 / 96 over some cleaned population), the dispatch clock (82 stamped baskets, stated in the title), and the settlement census (21 exact + 1 partial + 6 none footing to 28). The rule the panel grades: every rate names its base in the same breath; every pack defines its KPIs once, in writing, before the first query. Whoever owns the definition owns the number.",
      tag: "definitions",
    },
    {
      id: "aldi-t23",
      q: "Global share says APAC carries a third of the book; the regional board wants each aisle's share WITHIN its region. What changes in the window — and what breaks if you mix the two?",
      a: "One clause and one denominator discipline. Global share: 100.0 * revenue / SUM(revenue) OVER () — the whole 34,833.28 book behind every row. Within-region share: SUM(revenue) OVER (PARTITION BY region) — the denominator resets at each partition edge, so Audio's line reads 5,102.40 against EU's 15,089.23 regional book, not against the whole shelf. Both lines are true; they answer different questions — global share answers concentration (who owns the book), partition share answers mix (what a market's shelf looks like) — and the classic bug is printing both under one column name, where a reviewer reads a within-region line as concentration and re-slots shelves on the wrong denominator. The tell to state out loud: with PARTITION BY, every window aggregate re-bases per partition — running sums restart, LAG crosses only its own region's rows, and a 'top aisle per region' ranking ranks inside walls. Name the denominator a column carries, or the board will name it for you.",
      tag: "windows",
    },
    {
      id: "aldi-t24",
      q: "Which categories co-occur in the same basket? Write the pair query — and tell me how you keep every pair from printing twice.",
      a: "Self-join the line table to itself on order_id, then canonicalize: oi1.product_id < oi2.product_id in the ON clause. The inequality does three jobs at once — it kills the mirror pair ((a,b) and (b,a) are different rows to the engine but one fact to the business), it kills the self-paired diagonal, and it makes the pair key deterministic so GROUP BY folds cleanly: one row per unordered pair with baskets-touched as the count. The probed read on this shelf: 27 raw category pairs with 6 multi-SKU diagonals — and the diagonal family has its own honesty rule, because a one-SKU aisle (Fitness) cannot pair with itself, which the inequality proves for free. Without the canonicalization the same query prints every adjacency twice and the co-occurrence board doubles — on a 16-SKU shelf that is obvious; on 16,000 SKUs it is a quietly wrong merchandising feed. Pairs are unordered facts; write the inequality that says so.",
      tag: "self-join",
    },
  ],

  mcqs: [
    {
      id: "aldi-mcq-1",
      prompt: "A basket's status reads 'shipped'. In this kit's ALDI fate map, what happened?",
      choices: ["A curbside/delivery run was dispatched — shipped_at is the dispatch stamp", "The basket was paid and walked out the door", "The basket was abandoned before payment", "The basket is still being picked on the shop floor"],
      answer: 0,
      why: "The fate map is fixed: shipped = dispatched run (30 of 103 baskets), with shipped_at as the dispatch stamp. It is out the door — but 'paid and out' is 'delivered' (52), and the 2.98-day clock runs to the stamp, not the till.",
      notes: [
        { choice: 1, why: "Paid-and-out is 'delivered' — 52 baskets. Calling dispatched runs completed inflates the completed base before the run has even returned a proof." },
        { choice: 3, why: "Being picked is 'pending' — 14 baskets with no shipped_at yet. Pending is not dispatch and not abandonment; it is 'not yet', and it stays out of the latency base." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-2",
      prompt: "How many SKUs does this db's ALDI assortment hold, and which number is the trap?",
      choices: ["16 SKUs — 251 is basket LINES, 498 is units, 7 is aisles", "251 SKUs — one per basket line", "498 SKUs — one per unit sold", "7 SKUs — one per aisle"],
      answer: 0,
      why: "The range is 16 products rows — the whole assortment. 251 counts basket lines (a SKU appears on many lines), 498 sums units (quantity), and 7 counts aisles (category values). Grain discipline: products = SKUs, order_items = lines, SUM(quantity) = units.",
      notes: [
        { choice: 1, why: "251 is the line count — joining products to order_items multiplies each SKU by its basket appearances. The one-deep thesis would read as a 15-fold wider range than it is." },
        { choice: 3, why: "7 is the aisle count (distinct categories). An aisle holds up to 3 SKUs here — collapsing the fold one level too far erases the one-deep story entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-3",
      prompt: "Basket depth: 251 order_items across 103 baskets. What is lines per basket, and what is NOT it?",
      choices: ["2.44 — lines ÷ baskets; 4.83 (498/103) is units per basket, a different metric", "4.83 — units ÷ baskets", "15.7 — lines ÷ SKUs", "3 — the max quantity on any line"],
      answer: 0,
      why: "Depth is 251 lines over 103 baskets = 2.44. The 498-unit fold answers units per basket (4.83), not lines per basket — numerator and denominator must be the same grain, and the max line quantity (3) is a cap, not a mean.",
      notes: [
        { choice: 1, why: "498/103 mixes units over baskets — a units-per-trip read wearing the depth name. Both numbers matter; only one is depth." },
        { choice: 2, why: "251/16 divides by SKUs, not baskets — that is lines per SKU (≈15.7), the productivity mirror image, not basket depth." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It promotes the division to real arithmetic before integer truncation", "It rounds the result to a percentage", "It filters to abandoned baskets only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 0,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandoned share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 1, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandonment map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-5",
      prompt: "Keep only SKUs turning at least 30 units. Where does the threshold live?",
      choices: ["GROUP BY sku HAVING SUM(oi.quantity) >= 30", "WHERE SUM(oi.quantity) >= 30, before GROUP BY", "WHERE quantity >= 30 on the raw lines", "HAVING before GROUP BY, wherever it fits"],
      answer: 0,
      why: "A units-turn floor is a group-level fact: the fold must exist before it can be judged, so HAVING follows GROUP BY. On this db the gate keeps exactly 10 of 16 SKUs — the fast-turning core the range review protects.",
      notes: [
        { choice: 1, why: "SUM(oi.quantity) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "Filtering raw lines on quantity >= 30 caps UNITS PER LINE (max is 3 here — nothing survives) instead of units per SKU. Same words, completely different question." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-6",
      prompt: "The units ladder runs 47, 46, 38, then TWO SKUs tied at 36, then 33, 31, then THREE tied at 30, 28, 27. Under RANK, what rank does the 27-unit SKU carry?",
      choices: ["12", "9", "11", "10"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, then the 36-tie consumes ranks 4 and 5, 33 lands on 6, 31 on 7, the 30-tie consumes 8 through 10, 28 lands on 11 — so 27 carries rank 12. The tie blocks eat two ranks before 27 is reached.",
      notes: [
        { choice: 1, why: "9 is the DENSE_RANK answer — shared rungs without gaps. The range review's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "11 is the rank of the 28-unit SKU — the row directly above. Off-by-one across a tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The abandoned baskets double-counted their open day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 baskets.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-8",
      prompt: "The dependency ladder walks SUM(revenue) OVER (ORDER BY revenue DESC). A reviewer asks: when does the default RANGE frame bite?",
      choices: ["When rows tie on the ORDER BY key — RANGE folds peers into one cumulative step; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Always — RANGE and ROWS differ on every query", "Only when the window has no PARTITION BY", "Never — ORDER BY inside OVER always implies ROWS"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on revenue join the cumulative in one step with one shared value. This book's six partner revenues are distinct, so RANGE and ROWS read identical today; the guard is writing the frame explicitly when the walk must be row-by-row.",
      notes: [
        { choice: 1, why: "They differ only when ties exist — saying 'always' fails the read of this exact book, where the six revenues are distinct and the walk is currently tie-free." },
        { choice: 2, why: "PARTITION BY scopes the frame, it does not change RANGE versus ROWS semantics. The tie behavior is about the ORDER BY key, not partitioning." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-9",
      prompt: "The AR anti-join returns statements with no settlement legs. Which statement appears there DESPITE being marked 'paid'?",
      choices: ["#28 — 1,756.00, a status that lies", "#11 — 925.00, the void-but-settled one", "#25 — 6,148.00, the partial", "None — 'paid' guarantees legs"],
      answer: 0,
      why: "The anti-join (LEFT JOIN payments, p.id IS NULL) returns 6 statements worth 15,217.00, and #28 sits inside it marked 'paid' with zero legs — payment rows are the ledger of record; the status column is a claim.",
      notes: [
        { choice: 1, why: "#11 is the mirror anomaly: void status WITH a 925.00 leg. It never appears in the no-legs anti-join — the two error modes point in opposite directions." },
        { choice: 2, why: "#25 HAS a leg — 4,000.00 of 6,148.00 settled. Partial is not no-legs; it lands in the coverage census's middle bucket, not the AR anti-join." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-10",
      prompt: "SELECT partner, share_pct FROM book WHERE share_pct >= 10 errors the moment share_pct is a window alias. Why, and what is the fix?",
      choices: ["Windows resolve after WHERE — gate the fold in a CTE or derived table, then filter the outer query", "Use HAVING share_pct >= 10 instead", "Cast share_pct to TEXT and compare", "Move the window into the WHERE clause directly"],
      answer: 0,
      why: "The logical pipeline runs WHERE before SELECT: the alias (and the window behind it) does not exist yet at filter time, so the reference errors. The fix is staging — fold and window in a CTE/derived table, filter in the outer query. On this db the 10%-share gate keeps four of six partners (32, 26.7, 13.7, 10.4).",
      notes: [
        { choice: 1, why: "HAVING filters groups, and window functions are equally absent there — windows resolve after both WHERE and HAVING. Same error, later clause." },
        { choice: 3, why: "You cannot inline a window into WHERE at all — it is a SELECT-list construct by grammar. The stage-then-filter shape is not a style choice; it is the only legal one." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-11",
      prompt: "In the status × region grid, how many EU baskets were paid and out the door (delivered)?",
      choices: ["24 — EU runs 24 delivered of 45 booked", "45 — every EU basket completed", "12 — the EU run count", "21 — APAC's delivered count"],
      answer: 0,
      why: "The grid's EU row reads delivered 24, shipped 12, pending 6, cancelled 3 over 45 booked. 45 is the booked total, 12 is the dispatched-run column, 21 belongs to APAC.",
      notes: [
        { choice: 1, why: "45 is EU's booked denominator — calling it completed erases the 6 picking and 3 abandoned baskets from the fate story." },
        { choice: 2, why: "12 is EU's shipped column — dispatched curbside runs, not paid-and-out; the fate map keeps them apart." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-12",
      prompt: "The range splits 8 budget / 8 mid at the 50 price line. What does the band ABOVE 200 return?",
      choices: ["Zero rows — the premium band is provably EMPTY, ceiling 199.99", "2 SKUs — the Wearables pair", "8 SKUs — mirroring the other bands", "1 SKU — Smart Watch S"],
      answer: 0,
      why: "Max price on the shelf is 199.99, so the 200-plus arm returns zero rows — and the band audit reports the EMPTY band rather than dropping it. Proving emptiness is part of the read.",
      notes: [
        { choice: 3, why: "Smart Watch S sits at 199.99 — UNDER the 200 line. The premium band's emptiness survives its most expensive SKU." },
        { choice: 1, why: "Wearables is 2 SKUs at 199.99 and 79 — both mid-band. Band membership follows the price line, not the category." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-13",
      prompt: "WHERE rating >= 4.5 on the six own-label partners keeps how many?",
      choices: ["Exactly 2 — Nordic 4.6 and Alpine 4.8", "4 — everyone at 4.4 or better", "6 — the whole partner book", "3 — Nordic, Alpine and Midwest"],
      answer: 0,
      why: "The trusted bench at the 4.5 floor is exactly two of six: Nordic Gadgets AB (4.6) and Alpine Audio GmbH (4.8). Midwest's 4.4 misses by 0.1 — a floor is a floor.",
      notes: [
        { choice: 1, why: "4.4 < 4.5 — Midwest Hardware is the near-miss that keeps the bench small. Rounding the floor to 'about 4.4' doubles the bench on a whim." },
        { choice: 2, why: "Six is the unfiltered partner book — the count before the gate, not after. The bench being 2 of 6 IS the supply-quality read." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-14",
      prompt: "LATAM reads 2 baskets, 1 buyer, 852.44, both delivered, cancel share 0.0. What is the honest read of the 0.0?",
      choices: ["A small-N artifact — 2 baskets cannot evidence a zero rate", "LATAM has no abandonment problem", "The region never cancels by policy", "The grid is broken — shares can't be 0"],
      answer: 0,
      why: "0 of 2 is arithmetic, not evidence: the share prints 0.0 because the sample is two baskets, and the report says 'small-N' out loud. The board gates LATAM behind a volume floor for exactly this reason.",
      notes: [
        { choice: 1, why: "Two baskets is an anecdote wearing a percentage. The 6.7–8.1% cancellation range elsewhere is measured on 37–45 booked baskets." },
        { choice: 2, why: "Nothing in the data supports a policy claim — policy lives in documents, not in a two-row sample." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-15",
      prompt: "Which settlement rail carries more legs — and does the money agree?",
      choices: ["Card: 16 legs / 37,364.00 — more legs AND more money than wire's 11 / 32,248.00", "Wire: 11 legs / 32,248.00 beats card on both counts", "Tied — both rails carry the same money", "Card leads legs, wire leads money"],
      answer: 0,
      why: "Card carries 16 legs totaling 37,364.00; wire carries 11 legs totaling 32,248.00. Card leads both columns — and five statement cycles split across both rails, which is where the per-rail audit actually earns its keep.",
      notes: [
        { choice: 1, why: "Wire's 32,248.00 is LESS than card's 37,364.00 — the swap reads plausibly only if the two columns blur together." },
        { choice: 3, why: "Legs and money agree here; the split-rail cycles are where they diverge, and that is the audit's real target." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-16",
      prompt: "Store opex: Rent 14 entries / 16,800; Ads 14 entries / 4,570. What is the lean-model read?",
      choices: ["Same line count, ~27% of Rent's money — the no-advertising model in two rows", "Ads outspend Rent on store marketing", "Equal entries mean equal cost", "Rent runs 4,570 across 14 entries"],
      answer: 0,
      why: "4,570 against 16,800 is ~27% — the same 14 entries with a 3.7x money gap. The lean model shows up as a line-count tie with a money canyon: ads are posted as often as rent is, at a fraction of the cost.",
      notes: [
        { choice: 2, why: "Entries count postings, not dollars — 14 postings of very different sizes. Line count and money are different grains, the kit's fan-out lesson in miniature." },
        { choice: 3, why: "Swapped the columns — Rent is 16,800 / 14, Ads 4,570 / 14. The canyon runs the other way." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-17",
      prompt: "A statement totals 6,148.00 dollars = 614,800 cents. Which read prints the right dollar figure?",
      choices: ["amount_cents / 100.0 → 6,148.00 — real division keeps the cents", "amount_cents / 100 — integer division, cents dropped", "amount_cents / 1000 → 614.8", "amount_cents * 100"],
      answer: 0,
      why: "The finance columns are INTEGER cents; / 100.0 is the dollar read. On whole-multiple sums a bare / 100 coincidentally matches — which is exactly why the bug ships silently and then leaks cents on every odd-cent line.",
      notes: [
        { choice: 1, why: "614,800 / 100 = 6,148 exactly on THIS statement — the coincidence that hides the bug. The next odd-cent line prints short." },
        { choice: 2, why: "/ 1000 mis-scales by a tenth (614.80) while still printing plausible digits — the unit slip the facts file warns about." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-18",
      prompt: "COUNT(shipped_at) versus COUNT(*) on the orders table — what is the gap, and what does it mean?",
      choices: ["103 − 82 = 21 — the picking and abandoned baskets carry no dispatch stamp", "0 — both count every row", "82 — COUNT(*) skips NULLs too", "7 — only cancelled baskets lack stamps"],
      answer: 0,
      why: "shipped_at is non-NULL for delivered (52) + shipped (30) = 82; pending (14) + cancelled (7) = 21 unstamped. COUNT(shipped_at) counts the stamped subset; the gap to COUNT(*) is the unstamped population, and the dispatch clock reports on the 82.",
      notes: [
        { choice: 2, why: "COUNT(col) skips NULLs, COUNT(*) does not — that asymmetry IS the 21-row gap. Both reading 103 would mean no NULLs existed." },
        { choice: 3, why: "Cancelled (7) also lacks stamps — pending alone (14) understates the unstamped base by the abandonment column." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-19",
      prompt: "STRFTIME('%m', created_at) buckets the trading spine — what did that format string lose?",
      choices: ["The year — '%m' merges January 2024 with January 2025 into one bucket; '%Y-%m' keeps the 14-month spine", "Nothing — '%m' is the correct spine format", "The month — it returns years only", "Half the buckets — it drops every other month"],
      answer: 0,
      why: "'%m' returns the two-digit month alone: 12 buckets, with the two Januaries (2024-01's 3,731.97 and 2025-01's 1,669.50) folded into one. The spine is SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', …) — 14 buckets, 2024-01 to 2025-02.",
      notes: [
        { choice: 1, why: "14 buckets is the '%Y-%m' answer. '%m' merging years is the classic trend-fiction bug — the July trough lands in the wrong year's story." },
        { choice: 2, why: "Month numbers still print — the year axis is what vanished. A 12-bucket trend that claims 14 months of data is the tell." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-20",
      prompt: "The month walk's first row prints a NULL delta. The PM asks you to 'fix' it to 0. What do you say?",
      choices: ["NULL is the baseline by definition — a coalesced 0 reads as 'flat versus an imaginary prior month'", "Coalesce to 0 — cleaner dashboards", "Coalesce the prior value to the current month's revenue", "Drop the first row from the walk"],
      answer: 0,
      why: "2024-01 has no prior month; LAG returns NULL and the walk's head is NULL on purpose. A 0.00 delta claims 'no movement versus last month' — a claim about a month that does not exist. Report NULL or label it 'baseline'.",
      notes: [
        { choice: 2, why: "Coalescing the prior to the current value manufactures a 0.00 delta — the same lie, one step earlier in the pipeline." },
        { choice: 3, why: "Dropping the row loses the walk's opening cell — 2024-01's 3,731.97 is the highest month on the spine and the baseline every delta leans on." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-21",
      prompt: "Stack the four fate arms into one report: why UNION ALL and not UNION?",
      choices: ["UNION dedupes whole rows — two stacked arms that coincidentally print identical tuples collapse, and the stack stops footing", "UNION ALL is just faster", "UNION sorts the stack", "No semantic difference on this book"],
      answer: 0,
      why: "UNION ALL preserves every stacked row; UNION runs a dedupe over the full tuples. A fate stack must foot to 103 — any silent collapse breaks the identity while every surviving row still LOOKS plausible.",
      notes: [
        { choice: 1, why: "Speed is a side effect, not the reason. The semantic difference — dedupe — is the correctness risk." },
        { choice: 2, why: "UNION's dedupe may incidentally sort on some engines; ordering is not its contract, and relying on it is how stacks quietly reorder." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-22",
      prompt: "Four grouped queries versus one pass with COUNT(*) FILTER (WHERE …). Why does month-close demand the one-pass census?",
      choices: ["One scan, one population, one timestamp — four grouped queries can drift apart on a book that just took a posting", "FILTER is the only legal syntax in SQLite", "Grouped queries return wrong numbers", "One pass is required for GROUP BY"],
      answer: 0,
      why: "The close needs its census cells consistent at a single read point: 36 expense lines folded once — lines, spend, sideways FILTER arms — cannot disagree with itself. Four queries run minutes apart can straddle a posting and reconcile to different books.",
      notes: [
        { choice: 1, why: "FILTER (WHERE …) is legal standard SQLite — but not mandatory. The mandate is the one-pass contract, not the keyword." },
        { choice: 2, why: "Grouped queries are individually correct — the failure is temporal drift between runs, not arithmetic." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-23",
      prompt: "Pick exactly one row per statement — its latest settlement leg. Which window guarantees exactly one?",
      choices: ["ROW_NUMBER() — strictly one row per partition, ties broken arbitrarily unless pinned", "RANK() — ties share rungs", "DENSE_RANK() — shared rungs, no gaps", "COUNT(*) OVER (PARTITION BY …)"],
      answer: 0,
      why: "ROW_NUMBER assigns 1, 2, 3… with no shared rungs, so rn = 1 keeps exactly one row per statement even when two legs share a paid_on. RANK and DENSE_RANK hand both tied legs rank 1 — two rows survive the filter and the 'latest leg' report doubles.",
      notes: [
        { choice: 1, why: "Two legs paid the same day both take rank 1 under RANK — the dedupe silently fails. Pin the tie-break (leg id) or use ROW_NUMBER." },
        { choice: 3, why: "COUNT is not a selector — it tells you how many legs a statement has, useful context, not a pick." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-24",
      prompt: "Basket-pair co-occurrence: how do you keep (Audio, Video) and (Video, Audio) from both printing?",
      choices: ["Join with oi1.product_id < oi2.product_id — the inequality canonicalizes the unordered pair", "SELECT DISTINCT collapses the mirrors", "GROUP BY both orderings", "They can't both print — joins never mirror"],
      answer: 0,
      why: "The mirrored pair is a DIFFERENT row (different line ids, swapped values), so DISTINCT sees two legitimate rows and keeps both. The a < b inequality admits exactly one orientation per pair — the canonical one — and kills the self-paired diagonal for free.",
      notes: [
        { choice: 1, why: "DISTINCT dedupes identical tuples only — ('Audio','Video') is not ('Video','Audio'). The board doubles while every row looks unique." },
        { choice: 3, why: "A self-join on the same join column is exactly the query that mirrors — every pair meets itself swapped. The inequality is the fix, not an optimization." },
      ],
      difficulty: "medium",
    },
    {
      id: "aldi-mcq-25",
      prompt: "March's baskets: WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'. What is wrong?",
      choices: ["The last night drops — timestamps carry a time component, so '2024-03-31 21:14' > '2024-03-31'; the honest cut is created_at >= '2024-03-01' AND created_at < '2024-04-01'", "Nothing — BETWEEN is inclusive on both ends", "Strings cannot compare to each other", "BETWEEN needs JULIANDAY around both literals"],
      answer: 0,
      why: "BETWEEN '2024-03-01' AND '2024-03-31' compares against midnight at the START of March 31 — every basket created later that day silently falls out of the quarter read. Half-open intervals [start, next-start) are the date discipline; the edge nights are exactly when curbside runs land.",
      notes: [
        { choice: 1, why: "Inclusive is the trap: inclusive of midnight, exclusive of the day's remaining 23 hours 59 minutes. The dropped rows never error — they just never appear." },
        { choice: 3, why: "JULIANDAY converts for arithmetic (the 2.98-day clock); it is not the fix for a boundary. The boundary fix is the interval, not the cast." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-26",
      prompt: "A fate pivot omits ELSE on its CASE arms — SUM(CASE WHEN status = 'delivered' THEN 1 END). What does the grid print?",
      choices: ["NULL where nothing matched — SUM skips NULLs so thin arms read NULL, and the arms-sum-to-booked identity dies", "0 — CASE defaults to 0", "A syntax error — ELSE is mandatory", "The engine coalesces NULLs to 0 automatically"],
      answer: 0,
      why: "CASE without ELSE yields NULL on non-matches; SUM over an all-NULL arm returns NULL, not 0 — LATAM's shipped column reads NULL instead of 0, and 24 + 12 + 6 + NULL is NULL, not 45. ELSE 0 is what keeps every denominator honest and every identity checkable.",
      notes: [
        { choice: 1, why: "CASE's default is ELSE NULL — the 0 must be written. The identity (arms sum to booked) is the audit that catches the missing arm." },
        { choice: 3, why: "SUM ignores NULLs rather than coalescing them — an all-NULL fold is NULL. The engine's silence here is the bug's camouflage." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-27",
      prompt: "The 3-month rolling book — AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). What does the average hold in the spine's first two rows?",
      choices: ["A 1-row window, then a 2-row window — the frame shrinks at the edge, and the pack must disclose the shrinking population", "Always 3 rows — the engine pads with zeros", "NULL for both rows", "The full-spine average until 3 rows exist"],
      answer: 0,
      why: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW starts at one row: January averages itself (3,731.97), February averages two rows, and March is the first true 3-row average (3,319.56). The average is honest at every row — but its population shrinks at the edge, and zero-padding would invent troughs that never traded.",
      notes: [
        { choice: 1, why: "Zero-padding fabricates 0-revenue months — a phantom January enters the average and drags it down. Disclosure beats padding." },
        { choice: 3, why: "The full-spine average is a DIFFERENT metric — a level, not a trend. Rolling means the window moves, including its size at the edges." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-28",
      prompt: "A region × category slice can be zero rows, and a share column divides by that slice's basket base. What is the fix?",
      choices: ["NULLIF(base, 0) — the share reads NULL, pronounced 'no base', never a fake 0.0", "COALESCE(share, 0) — zero is cleaner on the board", "Drop every row whose base is 0", "Cast the share to TEXT"],
      answer: 0,
      why: "0.0% over an empty base claims a real population with zero conversions; NULL says there was no population — different claims, and only one is true. NULLIF guards the division at the data layer; COALESCE belongs at the display edge, with a label.",
      notes: [
        { choice: 1, why: "Coalescing at the data layer erases the no-base signal — the reviewer can no longer tell 'no conversions' from 'no data'. The label belongs on the board, not in the math." },
        { choice: 2, why: "Dropping rows hides thin slices entirely — the region goes blank and nobody asks why. Keep the row, print the NULL, say why." },
      ],
      difficulty: "hard",
    },
    {
      id: "aldi-mcq-29",
      prompt: "GROUP_CONCAT(DISTINCT sku) folds a trading day's SKUs into one cell. Which of these is NOT a promise it makes?",
      choices: ["Order — the cell's sequence is unspecified unless the input is pre-sorted", "NULLs are skipped", "Comma is the default separator", "One cell per group"],
      answer: 0,
      why: "The fold promises one comma-joined cell per group with NULLs dropped — it does NOT promise the order inside the cell. When the board reads left-to-right, pre-sort in a staged subquery; an unordered fold can print the same day differently on two runs.",
      notes: [
        { choice: 1, why: "NULL-skipping is real — which is why the fold travels with a COUNT beside it: the string's arity is invisible." },
        { choice: 2, why: "Comma is the default; a second argument overrides it. The promise list is exactly why the cell can't be re-parsed into data." },
      ],
      difficulty: "easy",
    },
    {
      id: "aldi-mcq-30",
      prompt: "The anti-join for statements with no settlement legs: someone moves the p.id IS NULL check from WHERE into the LEFT JOIN's ON clause. What happens?",
      choices: ["The unpaid list floods — every statement survives the LEFT JOIN, so all 28 come back with their leg columns nulled", "Same result — ON and WHERE are interchangeable here", "Syntax error — IS NULL cannot live in ON", "The join silently becomes an INNER JOIN"],
      answer: 0,
      why: "ON is evaluated per match: p.id IS NULL is false for every real match, so all matches are suppressed and every left row returns with NULL right-side columns — the anti-join's 6-row answer becomes the whole 28-statement book. WHERE runs after the join and can filter on the post-join NULL; the two placements are the entire difference.",
      notes: [
        { choice: 1, why: "Interchangeable is exactly wrong here — placement changes the population. Match conditions belong in ON; post-join filters belong in WHERE." },
        { choice: 3, why: "No INNER flip — LEFT JOIN keeps every left row regardless. The flood IS the LEFT JOIN doing its job with a broken match condition." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-aldi-1",
      tier: "easy",
      topic: "j1",
      universe: "catalog",
      title: "The one-deep aisle census",
      brief:
        "ALDI-flavored brief on the storefront db: the range review opens with the aisle census — 16 SKUs is the whole assortment, and every aisle must earn its shelf on throughput, not variety. Probed facts: the basket book is 34,833.28 over 103 baskets and 251 lines; Audio carries 11,744.01 from just 3 SKUs (97 units, 46 baskets touched), Accessories moves the most units (121 over 54 baskets) for 3,294.29, and one-SKU Fitness still turns 27 units for 863.91. Revenue reads as line money — quantity x unit_price — rounded to the penny. The review reads biggest aisle first.",
      ask: "Return each aisle with its SKU count, units sold, baskets touched and revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT p.category AS aisle,\n       COUNT({5} p.id) AS skus,\n       {1}(oi.quantity) AS units,\n       COUNT(DISTINCT oi.order_id) AS baskets,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS revenue\nFROM products p\nJOIN order_items oi ON oi.product_id = {3}\nGROUP BY p.category\nORDER BY revenue {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the unit fold",
          why: "SUM(oi.quantity) totals units per aisle: Audio 97, Accessories 121. COUNT would count basket LINES instead — Audio 51, Accessories 62 — a traffic read wearing the units name; AVG and MAX collapse the fold entirely.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Revenue prints to the penny — Audio 11,744.01 against the 34,833.28 book. ROUND(…, 1) prints 11,744.0 and the aisle totals stop footing to the probed category crowns; ROUND(…, 0) rounds the shelf to whole dollars.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the join key",
          why: "The join maps each basket line to its SKU on products.id. Joining on p.category compares an integer to text — every comparison fails and the census returns zero rows; joining on oi.order_id maps lines to the wrong dimension entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-aisle-first direction",
          why: "The review reads biggest revenue on top: Audio 11,744.01 leads, Fitness 863.91 trails. ASC opens the meeting on the smallest aisle — a correct query aimed at the wrong end of the range debate.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds repeated basket lines back to SKUs: Audio reads 3, not its line count. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
      ],
      distractors: ["COUNT", "0", "1", "ASC", "p.category"],
      walkthrough:
        "One join, one fold, four columns at three grains. The join attaches each of the 251 basket lines to its SKU, GROUP BY aisle folds seven rows, and the correct fill reads: Audio 3 SKUs / 97 units / 46 baskets / 11,744.01; Wearables 2 / 53 / 23 / 6,929.12; Video 2 / 61 / 30 / 5,198.41; Electronics 3 / 85 / 40 / 4,818.61; Accessories 3 / 121 / 54 / 3,294.29; Apparel 2 / 54 / 22 / 1,984.93; Fitness 1 / 27 / 13 / 863.91 — every figure a probed category-crown cell, and the revenues foot to the 34,833.28 book. The leanness read is the SKU column against everything else: three SKUs carry 11,744.01 while three different SKUs move 121 units — revenue-heavy versus traffic-heavy aisles, and both earn their slots. The distractors fail honestly: COUNT in the unit slot counts lines (Audio 51, not 97); 0 and 1 in the precision slot round to whole dollars and one decimal, breaking the foot to the probed crowns; 1 in the join slot leaves one product's lines in the census; p.category in the join slot compares integer to text and the census empties; ASC opens the review on Fitness. Baskets-touched beside units is the fan-out read: Accessories touches 54 baskets at 3,294.29 — the traffic aisle — while Audio touches 46 at 11,744.01.",
    },
    {
      id: "cs-aldi-2",
      tier: "hard",
      topic: "t8",
      universe: "supplier",
      title: "The partner-dependency ladder",
      brief:
        "ALDI-flavored brief on the storefront db: buying walks into every range negotiation with the partner-dependency ladder — six own-label partners make the entire assortment, and the cumulative share line is the slide the negotiation hangs on. Probed facts: Nordic Gadgets AB 11,130.25 (32%), Midwest Hardware Co 9,294.93 (26.7%), Alpine Audio GmbH 4,765.63 (13.7%), Andes Naturals SA 3,613.25 (10.4%), Shenzhen Electro 3,049.07 (8.8%), Pacific Textiles 2,980.15 (8.6%); the probe-verified cumulative read runs 32 → 58.6 → 72.3 → 82.7 → 91.4 → 100. Shares print to 1 decimal; revenue to the penny.",
      ask: "Return each partner with revenue to 2 decimals, its share of the whole book and the cumulative share down the ladder, each to 1 decimal, biggest partner first.",
      template:
        "WITH book AS (\n  SELECT s.name AS partner,\n         SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = s.id\n  JOIN order_items oi ON oi.product_id = {1}\n  GROUP BY {2}\n)\nSELECT partner,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (), {3}) AS share_pct,\n       ROUND(100.0 * SUM(revenue) OVER (ORDER BY {4} {5}) / SUM(revenue) OVER (), 1) AS cum_pct\nFROM book\nORDER BY revenue DESC;",
      slots: [
        {
          answer: "p.id",
          kind: "keyword",
          label: "the line-to-SKU key",
          why: "Partner money folds through products: each basket line joins to its SKU on products.id, and the SKU carries the supplier. Joining on s.id maps lines to partner ids 1–6 and folds the wrong grain; joining on p.category compares integer to text and the book empties.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner fold key",
          why: "The CTE folds one row per partner: GROUP BY s.id. Folding by s.region collapses six partners into four regional buckets and the ladder loses rungs; folding by p.category re-grains to seven aisles — a different book entirely.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "Shares print to 1 decimal — Nordic 32.0 against Midwest 26.7 is the gap the negotiation reads. ROUND(…, 2) prints 31.95 and 26.68, precision the probed ladder never carried, and the slide stops reconciling with the cumulative line beside it.",
        },
        {
          answer: "revenue",
          kind: "keyword",
          label: "the running-order column",
          why: "The walk must descend the revenue ladder: SUM(revenue) OVER (ORDER BY revenue DESC). Ordering by partner walks the book alphabetically and the cumulative line stops meaning 'top-N dependency'; ordering by cum_pct references an alias that does not exist yet and errors.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the descending walk",
          why: "The dependency read runs biggest-partner-first: 32 → 58.6 → 72.3 → 82.7 → 91.4 → 100. ASC computes the walk from the smallest partner up — Pacific first — and every cumulative cell reads a different number (100 for Nordic, not 32).",
        },
      ],
      distractors: ["s.region", "p.category", "ASC", "2", "AVG"],
      walkthrough:
        "Two stages: fold the book to partner grain, then window the shares. The CTE joins 251 basket lines to their SKUs and through supplier_id to six partners, folding SUM(quantity * unit_price) per s.id; the outer SELECT carries the whole-book denominator twice — share = 100.0 * revenue / SUM(revenue) OVER (), cumulative = 100.0 * SUM(revenue) OVER (ORDER BY revenue DESC) / SUM(revenue) OVER (). The probe-verified ladder: Nordic 11,130.25 / 32 / 32; Midwest 9,294.93 / 26.7 / 58.6; Alpine 4,765.63 / 13.7 / 72.3; Andes 3,613.25 / 10.4 / 82.7; Shenzhen 3,049.07 / 8.8 / 91.4; Pacific 2,980.15 / 8.6 / 100 — foots to the 34,833.28 book, and the third cumulative cell is the headline: top-3 partners carry 72.3% of everything ALDI sells. The distractors each break differently: s.region and p.category in the fold slots re-grain the book (four regional buckets, seven aisles) or empty it in the join slot; 2 in the precision slot prints 31.95 and desyncs the slide; AVG in any slot is either a syntax error or misuse of aggregate; ASC walks the ladder bottom-up so Nordic's cumulative reads 100 — the exact opposite of the dependency argument. The policy note the panel listens for: the default frame is RANGE, and with six distinct revenues it reads identical to ROWS today — the explicit frame is written when tie behavior must be pinned.",
    },
    {
      id: "cs-aldi-3",
      tier: "medium",
      topic: "s7",
      universe: "growth",
      title: "The regional fate pivot",
      brief:
        "ALDI-flavored brief on the storefront db: the growth board opens on the regional fate pivot — one row per market, one conditional column per basket fate. Probed cells: EU runs 24 paid-and-out / 12 dispatched / 6 picking / 3 abandoned over 45 booked; APAC 21 / 8 / 5 / 3 over 37; US 5 / 10 / 3 / 1 over 19; LATAM sits at 2 / 0 / 0 / 0 and is too thin to board. The board's floor is three booked baskets per market, and every arm must count from ALL booked baskets in its region — the ELSE 0 arm is what keeps each column's denominator honest. Cancel share prints to 1 decimal.",
      ask: "Return the per-region fate pivot — paid-out, dispatched, picking and cancel share side by side — for markets with at least 3 booked baskets, biggest paid-out book on top.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS paid_out,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS dispatched,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS picking,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY paid_out {3};",
      slots: [
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the dispatched arm's status literal",
          why: "The dispatched column counts curbside runs: 'shipped' is the fate map's dispatch stamp (EU 12, APAC 8, US 10). 'delivered' would print the paid-out counts twice and the dispatch story vanishes; 'cancelled' folds abandonment into a run column.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the booked-basket floor",
          why: "The floor keeps EU (45 booked), APAC (37) and US (19) and drops LATAM's two-basket sample — its 0/0/0 row and 0.0 share are small-N artifacts, not findings. The floor's value shows up in the surviving grid (US picking 3), so the board self-checks.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The board leads with the biggest paid-out book: EU 24, APAC 21, US 5. ASC opens the review on the US's five completed baskets — a correct grid aimed at the wrong end of the debate.",
        },
      ],
      distractors: ["'delivered'", "'cancelled'", "1", "ASC"],
      walkthrough:
        "Four conditional arms over one named population. The pivot joins orders to customers and folds per region; each arm is SUM(CASE WHEN status = … THEN 1 ELSE 0 END) counting from ALL booked baskets, so the arms reconcile to the booked total — EU 24 + 12 + 6 + 3 = 45, APAC 21 + 8 + 5 + 3 = 37, US 5 + 10 + 3 + 1 = 19. The correct fill reads EU 24 / 12 / 6 / 6.7, APAC 21 / 8 / 5 / 8.1, US 5 / 10 / 3 / 5.3 — cancel share over the same booked base, rounded once, and LATAM (2 booked, delivered 2, everything else 0) never boards because HAVING COUNT(*) >= 3 drops the sample. The distractors each break differently: 'delivered' in the dispatched slot prints the paid-out counts twice and the dispatch story vanishes; 'cancelled' folds abandonment into a run column; a floor of 1 re-admits LATAM's two-basket sample whose 0.0 share is a small-N artifact; ASC opens the board on the US's five paid-out baskets. The habit on trial: a pivot is exhaustive arms over a named population — say the population, then let the arms-sum-to-booked identity prove the grid.",
    },
    {
      id: "cs-aldi-4",
      tier: "hard",
      topic: "q5",
      universe: "month-close",
      title: "The trough audit at the mean",
      brief:
        "ALDI-flavored brief on the storefront db: month-close wants the trough audit — every month's book against the mean month, worst first. Probed cells: the 14-month spine runs 2024-01 (3,731.97) to 2025-02 (2,390.53) and the mean monthly book probes at 2,488.09; eight of fourteen months sit below it, and the four deepest troughs are 2024-07 at 1,193.86, 2024-11 at 1,648.8, 2025-01 at 1,669.5 and 2024-06 at 2,047.43 — gaps of -1,294.23, -839.29, -818.59 and -440.66. The audit stages the monthly fold in a derived table so the grain is pinned (one row per month) before the comparison runs, and reads worst-trough-first.",
      ask: "Return the four deepest trough months with revenue and the gap to the mean monthly book, both to 2 decimals, deepest first.",
      template:
        "SELECT month,\n       revenue,\n       ROUND(revenue - (SELECT SUM(total) / COUNT(DISTINCT SUBSTR(created_at, 1, 7)) FROM orders), {1}) AS gap_to_mean\nFROM (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n) monthly\nWHERE revenue {2} (SELECT SUM(total) / COUNT(DISTINCT SUBSTR(created_at, 1, 7)) FROM orders)\nORDER BY revenue {3}\nLIMIT {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the gap's display precision",
          why: "Gaps print to the penny — July's -1,294.23 is the number the pack reads. ROUND(…, 1) prints -1,294.2 and the audit's cells stop reconciling with the probed trough table; the precision is a display constant, not a data fact, hence unverifiable-by-cells.",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the below-mean comparison",
          why: "Trough months sit BELOW the mean month: revenue < mean keeps the eight sub-mean months. '>' flips the audit to the six above-average months and reports the boom months as troughs; '=' returns an empty set — no month lands exactly on the mean.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the deepest-first direction",
          why: "The audit reads worst first: 1,193.86 (July) on top, 2,047.43 (June) fourth. DESC inverts the audit and opens on the shallowest below-mean month — right query, wrong story.",
        },
        {
          answer: "4",
          kind: "number",
          noVerify: true,
          label: "the pack's row budget",
          why: "The close pack carries the four deepest troughs — the audit's headline block, not the full eight-row sub-mean population. Widening to 8 floods the pack with the tail; the budget is a display constant, hence unverifiable-by-cells.",
        },
      ],
      distractors: [">", "=", "DESC", "8"],
      walkthrough:
        "Stage the fold, then compare fold to fold. The derived table buckets the 103 baskets by SUBSTR(created_at, 1, 7) — the 14-month spine — and pins the grain at one row per month with revenue rounded to the penny; the mean monthly book is the scalar SUM(total) / COUNT(DISTINCT month) = 34,833.28 / 14 = 2,488.09, computed over the same base so the comparison is honest. The correct fill reads, deepest first: 2024-07 at 1,193.86 with gap -1,294.23; 2024-11 at 1,648.8 with -839.29; 2025-01 at 1,669.5 with -818.59; 2024-06 at 2,047.43 with -440.66 — four of the eight sub-mean months (the six above-mean months run from 2,617.08 up to 3,731.97 and never enter this report). The distractors each break differently: '>' flips the audit to the boom months and reports 2,617.08 as a trough; '=' returns an empty set because no month lands exactly on the mean; DESC inverts the read and opens on June's -440.66, the shallowest gap in the pack; a LIMIT of 8 floods the pack with the full tail. The habit on trial: a threshold read is a definition — below WHAT mean, computed over WHICH base, printed to WHICH precision.",
    },
    {
      id: "cs-aldi-5",
      tier: "easy",
      topic: "x2",
      universe: "expense",
      title: "The store-opex one-pass census",
      brief:
        "ALDI-flavored brief on the storefront db: month-close folds the store-opex book in ONE pass — 36 expense lines, every amount in INTEGER cents. Probed cells: Rent 14 lines / 16,800, Ads 14 / 4,570 (the no-advertising model in one line), Travel 3 / 2,521, Tools 5 / 1,525. The census keeps every category with at least 3 lines, folds spend as SUM(amount_cents) / 100.0, and carries a sideways FILTER arm that counts the Rent lines — one scan, one population, one timestamp, so the cells of each category can never drift apart between runs.",
      ask: "Return one row per expense category with at least 3 lines: line count, spend to 2 decimals and the Rent line count folded sideways, biggest spend first.",
      template:
        "SELECT category,\n       COUNT(*) AS lines,\n       ROUND(SUM(amount_cents) / {1}, 2) AS spend,\n       COUNT(*) FILTER (WHERE category = {2}) AS rent_lines\nFROM expenses\nGROUP BY category\nHAVING COUNT(*) >= {3}\nORDER BY spend DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "The book is INTEGER cents: / 100.0 prints Rent 16,800.00. Divide by 1000 and the same book re-prices at a tenth (1,680.00) while still summing 'cleanly' — which is why the divisor is named, not tasted.",
        },
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the rent arm's category literal",
          why: "The sideways arm counts the lease lines: FILTER (WHERE category = 'Rent') reads 14 on the Rent row, 0 elsewhere. 'Travel' would count the 3 travel lines into the rent column — a census whose arm lies about what it counted.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the line-count floor",
          why: "The floor keeps all four categories — Tools (5 lines) and Travel (3) clear it — and the floor's value shows up in Travel's own line cell, so the census self-checks. A floor of 4 amputates Travel and re-shapes the story around three rows.",
        },
      ],
      distractors: ["1000.0", "'Travel'", "4"],
      walkthrough:
        "One scan of the opex book, four census cells per category. The census folds 36 INTEGER-cent lines per category: lines = COUNT(*), spend = ROUND(SUM(amount_cents) / 100.0, 2), and the sideways arm COUNT(*) FILTER (WHERE category = 'Rent') counts the lease lines without a second query. The correct fill reads Rent 14 / 16,800.00 / 14, Ads 14 / 4,570.00 / 0, Travel 3 / 2,521.00 / 0, Tools 5 / 1,525.00 / 0 — the 14-versus-14 line tie between Rent and Ads with a 3.7x money gap is the no-advertising model in two rows, and HAVING COUNT(*) >= 3 keeps all four categories, with Travel's own line count proving the floor. The distractors each break differently: 1000.0 in the divisor slot re-prices the whole book at a tenth (Rent 1,680.00) while still summing cleanly; 'Travel' in the FILTER arm counts the 3 travel lines into the rent column — an arm that lies about what it counted; a floor of 4 amputates Travel and re-shapes the read around three rows. The one-pass contract is the point: four grouped queries can drift apart on a book that just took a posting; this census cannot.",
    },
    {
      id: "cs-aldi-6",
      tier: "medium",
      topic: "l8",
      universe: "inventory",
      title: "The 4-line trolley ceiling",
      brief:
        "ALDI-flavored brief on the storefront db: pick-path ops wants the deep-trolley census — and the probe found a ceiling. No basket on this book carries more than 4 lines: the line-count distribution runs 26 baskets at 1 line, 29 at 2, 25 at 3 and 23 at 4, so the 4-line trolley is the hard ceiling, not a tail. The census gates at the ceiling (COUNT(*) >= 4) and returns exactly the 23 ceiling baskets — order 43 tops the spend board at 945.21 over 9 units, then 39 at 845.92, 15 at 826.03, 6 at 752.96 and 20 at 705.39. A 5-line trolley on tomorrow's floor means the db's shape changed, not that someone shopped big.",
      ask: "Return the ceiling baskets — those carrying at least 4 lines — with line count, units and basket spend to 2 decimals, biggest spend first.",
      template:
        "SELECT order_id,\n       COUNT(*) AS lines,\n       SUM(quantity) AS units,\n       ROUND(SUM(quantity * unit_price), {1}) AS basket_spend\nFROM order_items\nGROUP BY order_id\nHAVING COUNT(*) >= {2}\nORDER BY basket_spend {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the spend precision",
          why: "Spend prints to the penny — order 43 at 945.21 leads the board. ROUND(…, 1) prints 945.2 and the cells stop matching the probed pick-path list; the precision is a display constant, hence unverifiable-by-cells.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the line ceiling gate",
          why: "The census gates at the ceiling: 23 baskets carry 4 lines, and the gate's value shows up in every surviving row's lines column — the census self-checks. A gate of 3 admits the 25 three-line trolleys (48 rows); a gate of 5 returns an empty board, which is itself the honest read that no trolley exceeds 4 lines.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "Pick-path walks the board by spend: 945.21 down to 233.95. ASC opens on the lightest ceiling basket — a correct census aimed at the wrong end of the route.",
        },
      ],
      distractors: ["1", "0", "ASC"],
      walkthrough:
        "A ceiling census — the gate IS the finding. The fold groups 251 basket lines per order: lines = COUNT(*), units = SUM(quantity), spend = ROUND(SUM(quantity * unit_price), 2). The probe found no basket beyond 4 lines — the distribution runs 26 baskets at 1 line, 29 at 2, 25 at 3, 23 at 4 — so HAVING COUNT(*) >= 4 returns exactly the 23 ceiling trolleys, and the gate's value shows up in every surviving row's lines column: the census self-checks. The correct fill reads, biggest spend first: order 43 at 4 lines / 9 units / 945.21, order 39 at 4 / 11 / 845.92, order 15 at 4 / 9 / 826.03, order 6 at 4 / 10 / 752.96, order 20 at 4 / 7 / 705.39 — down to order 92 at 233.95. The distractors each break differently: 1 or 0 in the precision slot rounds the penny off the board (945.2, then 945); a gate of 1 or 0 floods the census with all 103 baskets and the ceiling story vanishes; ASC walks the pick route lightest-basket-first. A 5-line trolley on tomorrow's floor means the db's shape changed — the empty result at a gate of 5 is the honest read, not a bug.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Lines per basket beside value per basket is the lean-trolley read: 251 lines over 103 baskets at 2.44, average 338.19. This problem drills the two-metric fold the range review opens with — depth and value, denominators stated." },
    { slug: "repeat-purchase-rate", why: "A lean format wins on return trips, not range breadth: share of shoppers with 2+ baskets in a window is the repeat rate that justifies the narrow shelf. A distinct-count ratio with the denominator stated — exactly this problem's shape." },
    { slug: "unpopular-books", why: "Which SKUs barely turn is the range-review kill list — the one-deep shelf has no room for passengers. This problem drills the low-circulation read over the 16-SKU assortment, where proving a slot earns its place is the whole argument." },
    { slug: "count-apples-and-oranges", why: "Stock versus sold per SKU (260 stocked vs 47 sold on the desk mat; 40 vs 23 on the watch) is the shelf-cover read. This problem drills counting one fact and summing another in one pass — the exact pair the availability audit runs." },
    { slug: "customers-who-never-order", why: "Shoppers who registered but never bought would be the dead-demand alarm — on this db the anti-join returns a confident zero, and proving that zero is part of the job. The LEFT JOIN + IS NULL shape behind every whitespace report." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-basket household is the intensity crown on this db — 7,262.35 of lifetime spend from one shopper. Argmax with a subquery guard is exactly how the top-of-ladder read is written for the loyalty conversation ALDI's model demands." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Staples are the lean-format engine: which SKU each household buys most often is the habitual-basket query. Per-shopper argmax over basket lines — the personalization read a range this narrow still owes its best households." },
    { slug: "sales-by-day-of-the-week", why: "The till rhythm decides staffing and curbside slots: a day-of-week pivot over basket dates. CASE columns per weekday over a grouped fold — exactly the traffic-shape query store ops runs weekly on the 103-basket book." },
    { slug: "immediate-food-delivery-ii", why: "Share of curbside runs dispatched inside the promised window versus late — the service promise is a conditional rate over a timestamp comparison. Same shape as the 2.98-day dispatch clock, sliced at the promise line." },
    { slug: "product-price-at-a-given-date", why: "Shelf price as-of a date, when a promo overwrites the ticket: the latest price at or before the window. A window-argmax over price history — the effective-price audit's favorite escalation on a range where every price is public." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Range-complement reads: shoppers who buy staples A and B but never C are the gap the next range review prices — did the assortment create a hole, or a choice? Conditional aggregation over basket lines, exactly this problem." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT folds each trading day's SKUs into one cell — the ops board's day-by-day activity strip over a 16-SKU range, where one missing staple in a day's list is visible at a glance. The exact aggregate this problem drills." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Dormancy is the leak a lean format cannot afford: shoppers with no basket in the trailing window, counted honestly against the active base. A date-bounded conditional count — the winback calendar's first query." },
    { slug: "trial-balance-check", why: "The close discipline ALDI runs lean on: debits must equal credits — 181,080 against 181,080, delta zero, or the close does not ship. Conditional SUM over the ledger, the same fold this problem drills at practice scale." },
    { slug: "count-salary-categories", why: "Basket-value band stacks — how many baskets land in each value tier — feed the slotting debate in one layout. CASE classification plus a UNION ALL stack is the exact move the trading pack uses." },
    { slug: "calculate-orders-within-each-interval", why: "Basket-value intervals per market: how many of the 103 baskets sit in each spend band, folded with CASE buckets. The distribution read behind every 'our baskets are small but frequent' claim ALDI's model makes." },
    { slug: "product-sales-analysis-ii", why: "Per-SKU money and units beside the shelf price is the range-review drill at its base grain: 47 units on the desk mat, 46 on the headset, money as quantity x unit_price. The SKU-level census the aisle fold aggregates from — with the fold's grain stated." },
    { slug: "sales-analysis-iii", why: "Products with no sales would be the range-review kill list — on this db the anti-join returns a confident zero across all 16 SKUs, and proving that zero is the analyst's job. This problem drills the empty-result discipline the lean shelf demands." },
    { slug: "list-the-products-ordered-in-a-period", why: "February 2025 (2,390.53) is the spine's latest bucket; the period-window read — which SKUs moved in exactly that window — is the monthly range heartbeat. Date-bounded grouping over the 14-month spine, the exact shape." },
    { slug: "game-play-analysis-i", why: "First basket per shopper is the acquisition date: when each household's ALDI habit started. MIN over a grouped fold — the cohort spine every retention and winback read builds on." },
    { slug: "winning-candidate", why: "The 24-basket household (7,262.35 lifetime) is the intensity crown; argmax-over-an-aggregate is how the crown is found without ORDER BY/LIMIT luck. This problem drills the subquery-guarded max the loyalty conversation needs." },
    { slug: "find-churn-risk-customers", why: "Shoppers whose baskets stop coming are the leak a lean format cannot paper over with range breadth: the anti-join over recent activity is the winback list's first query, and the 6.8% abandoned share says the leak is real." },
    { slug: "bank-account-summary", why: "Per-shopper money in and money out with zero-fill for shoppers missing one side — the LEFT JOIN zero-fill the household P&L read runs on. NULL arms stay visible instead of vanishing into an INNER join." },
    { slug: "maximum-transaction-each-day", why: "The biggest basket per trading day is the till-feed headline: a window argmax over a grouped fold, where any tie for the top basket is a policy call the analyst must state — exactly this problem's shape." },
    { slug: "rolling-average-steps", why: "The 3-month rolling book smooths the July trough (1,193.86) against its neighbors; a RANGE-frame rolling average over a month spine is precisely this problem's drill — frame semantics and edge honesty included." },
    { slug: "restaurant-growth", why: "A 7-day running window over daily baskets is the pacing read store ops checks weekly; the moving frame over a date spine — trailing windows, shrinking edge populations — is exactly this problem." },
    { slug: "tasks-count-in-the-weekend", why: "Weekend versus weekday split via STRFTIME('%w') is the till-rhythm read that sets staffing and curbside slots. This problem drills the weekday-code fold on timestamp text — the same family as the month spine." },
    { slug: "growth-accounting", why: "Fate transitions — a basket that was picking yesterday and abandoned today — are the movement story behind the static 52/30/14/7 census. LAG over status per basket, the exact move this problem drills." },
    { slug: "gl-reconciliation", why: "The close culture: ledger debits must foot to credits — 181,080 against 181,080 — before anything ships. This problem drills the reconciliation fold the ALDI-style close runs every single month." },
    { slug: "ar-aging-schedule", why: "The 6 never-settled statements worth 15,217 age differently — dunning order is an aging-bucket fold over the AR book. This problem builds the aging schedule the reminders queue from." },
    { slug: "null-blank-audit", why: "The shelf data's hygiene pass: NULL and blank checks across the columns the censuses depend on — shipped_at's 21 gaps being the famous one. COUNT(col) versus COUNT(*), drilled at practice scale." },
    { slug: "rfm-segmentation", why: "Recency, frequency, money in NTILE tiles over the 16-shopper book: the lean format's tiny customer base makes every tile a named household — segmentation at ALDI scale is this problem's exact fold." },
  ],
};
