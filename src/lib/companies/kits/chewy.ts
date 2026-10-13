// Chewy — kit 13 of the E-commerce & Marketplace domain (Batch L, wave 7).
// DTC pet retail: autoship cadence, pharmacy-style claim funnels, pet-profile
// personalization and a retention culture where every rate names its
// denominator. Pool provenance: the Chewy tag set carries 0 tagged LC
// problems in this app's pools — 0 tagged LC — theme-curated: all topic slugs
// and problem fills are curated from scripts/company-pools.md's SQL theme
// menu to mirror the workflows Chewy screens are known to probe (autoship
// repeat rates, claim-vs-rail anti-joins, cadence month buckets, census CASE
// arms, cents discipline). Case studies run on the storefront db with probed
// figures from scripts/company-facts.md — mapped honestly as
// customers=pet households, orders=baskets (autoship + one-off),
// order_items=scanned lines, products=SKUs, suppliers=brand vendors,
// invoices=program & partner claims, payments=payment-rail movements,
// shipped_at=fulfillment scan, regions=market clusters. Extended probe
// receipts (never-settled anti-join rows 24/26/27/28/21/18 summing 15217;
// invoices LEFT JOIN payments = 33 rows / 27 rails / 28 claims / 22 with
// rails; clock census 57/25/21 with 2-day variant 27/55/21) live in the
// worklog.

import type { CompanyKit } from "../types";

export const chewyKit: CompanyKit = {
  id: "chewy",
  domainId: "ecom",
  name: "Chewy",
  tagline: "Pet e-commerce: autoship, pharmacy, pet profiles",
  accent: "text-amber-300",

  brief: [
    "**Chewy** is the DTC pet retailer that turned replenishment into a relationship — autoship cadences, pharmacy-style claim funnels and pet profiles that make every household a longitudinal panel rather than a one-off cart. On this kit's proxy db the census reads **16 pet households**, **103 baskets** fanning into **251 scanned lines**, $34,833.28 total demand at an average basket of **$338.19** — a db you can hold in your head, shaped exactly like the retention read a Florida analyst runs before the autoship forecast locks.",
    "The data org is denominator-first and rails-obsessed. Status is the funnel: **52 delivered**, **30 shipped**, **14 pending**, {rose:7 cancelled} — and the fulfillment clock averages **2.98 days** over the 82 baskets carrying `shipped_at`. Money moves on two rails: {amber:card} settles **16 payments / 37364.00** and {violet:wire} settles **11 / 32248.00**, against 28 program claims whose coverage reads **21 exact**, **1 partial** (a 4000.00 rail against a 6148.00 bill) and **6 never-settled** worth 15217.00. *The ledger and the rails disagree on purpose — 6 open claims worth 19609 is an opinion, 6 claims with zero rails worth 15217.00 is a fact, and reconciling the two is the job.*",
    "Interview style is retention-flavored and anti-join-heavy. Screens open with a warm-up join (baskets to households, lines to SKUs), escalate into a repeat census (14 of 16 households place 2+ baskets; the top household at 24), then land on the two Chewy signatures: a **claim-vs-rail anti-join** (which claims never moved — and why the paid-status one is the scandal) or a **one-pass clock census** (within-window, late, not-yet — with the population rule stated before the CASE). Follow-ups are spoken: 'is that per basket or per household?', 'does a cancelled basket age in your pending pile?', 'what does your coverage class count?'",
    "Preparation strategy: Chewy carries **0 tagged LC problems** in this app's registry — the pool is theme-curated from the SQL band: anti-join shapes, cadence month buckets, repeat-rate denominators, one-pass censuses, and cents discipline (`amount_cents / 100.0` — every claim and rail is INTEGER cents). The two case studies run on the live db: one rebuilds the **never-settled claim screen** the billing lead runs at close, the other rebuilds the **fulfillment clock census** ops ships every week. Both are mechanically audited against the probed figures.",
    "The vendor side reads like the retention side: 6 brand vendors carry the catalog, the top one holding **32%** of scanned revenue and the second 26.7%, while the {emerald:trusted bench} (rating 4.5 and up) holds exactly 2 vendors. The KPI wall names denominators the way the org does — an {sky:autoship fill rate} counted over baskets due (82 of 103 carry a fulfillment scan), a {rose:cadence-lapse churn} counted over households (2 of 16 never place a second basket), and basket depth folded from 251 lines back to 103 baskets. *The definition is negotiated before the query runs — a rate that can't name its denominator doesn't ship.*",
    "Screens go deeper than the census once you clear it: window frames running cumulative demand across the 14 month buckets, set-op stacks folding {amber:card} and {violet:wire} rails into one close, CTEs staging the month census before `LAG` diffs it. The bar never moves — name the grain, name the population, then write the SQL — so preparation drills frame semantics (`ROWS` versus the default `RANGE`), UNION dedupe behavior and `NULLIF` guards on rate denominators. *Chewy's follow-ups live where the syntax is quiet about being wrong.*",
  ],

  dayInLife: [
    "**08:30 —** The day opens on the autoship board, and the first query is the household reconciliation: does the status census tie to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** — and does the repeat census still read **14 of 16 households with 2+ baskets**? The clock tile is next: **2.98 days average over the 82 fulfilled baskets**, and the analyst's eye goes to the pending pile, because 14 baskets with no fulfillment scan is tomorrow's missed-cadence story. *A pending basket is 'not yet', not 'late' — the population note rides in the subtitle or the forecast inherits a backlog it can't name.*",
    "**11:00 —** Mid-morning is the deep-work block. The billing lead's ask lands: reconcile the claims ledger against the payment rails — the anti-join says **6 claims worth 15217.00 never moved a rail**, while the open-status ledger names a different 6 worth 19609, and the difference is the story: the partial rail on one claim (4000.00 of 6148.00) keeps it out of the anti-join, while a 'paid'-status claim worth **1756.00 has zero rails** and lands in it. The analyst writes both numbers side by side, then files the contradiction: *ledger status is an opinion, the rail is a fact, and a paid claim with no money movement is a ticket, not a rounding error.*",
    "**15:30 —** The afternoon tilts to the retention review. The CRM lead wants the week's one-pass clock census — **57 fulfilled baskets inside the window, 25 late, 21 with no clock at all** — and the heavy-household fold beside it: spenders over 3000 lifetime dollars carry **63.5% of demand**, so the autoship nudge list writes itself from the tier floor down. The close is the ship-with-query ritual: every figure leaves with its SQL attached, rails folded as `amount_cents / 100.0`, split rails (five claims paying in two movements) flagged for the finance handoff. *In a retention business the next shift inherits your denominators — write them down or the forecast writes its own.*",
    "**19:30 —** The evening closes on the CS read. The {sky:NPS} pile needs its denominator before anyone quotes it — surveys answered over the delivered baskets, not over all 103 placed — and the two one-off households from the repeat census get one last look before the {rose:churn} label sticks: cadence lapse or gone-for-good? The analyst drafts tomorrow's nudge list in DENSE_RANK order, checks that every rate on the page names its base — fill rate over due baskets, churn over due households — and pins the never-settled claim ticket for the billing lead. *The last query of the day becomes the morning standup's first slide; make it a census, not an anecdote.*",
  ],

  metrics: [
    { name: "Autoship repeat rate", what: "Share of households with 2+ baskets — 14 of 16 here, top household at 24 baskets. The cadence KPI the whole retention org is paid on, and a HAVING-gated census in interview form." },
    { name: "Kept-basket share", what: "Non-cancelled baskets over placed — 7 of 103 cancel (6.8%). The denominator rule (cancelled stays in the placed base) is the whole test, and the forecast base is the kept fold." },
    { name: "Fulfillment clock", what: "Days from basket to `shipped_at` on the 82 fulfilled baskets — 2.98 average, 2-to-4 range. Population stated first: pending baskets have no latency YET." },
    { name: "Claim coverage ladder", what: "Per-claim rail coverage — 21 exact, 1 partial (4000.00 of 6148.00), 6 none (15217.00). The classes finance close reads, and the census every Chewy screen eventually becomes." },
    { name: "Rail mix", what: "Card vs wire on the payment rails — 16 card payments / 37364.00 against 11 wires / 32248.00. The mix decides which reconciliation runs first at close." },
    { name: "Average basket", what: "Revenue per basket — 338.19 across 103 baskets (34833.28 total). The number every autoship retro argues against: did the nudge lift baskets, value, or neither." },
    { name: "Heavy-household concentration", what: "Share of demand from households over 3000 lifetime dollars — 63.5% (71.2% over the 2000 line). The tier-floor read that aims every nudge and pharmacy refill campaign." },
    { name: "Clock census", what: "One-pass fulfillment buckets — 57 in-window (3 days or less), 25 late, 21 not-yet (14 pending + 7 cancelled). The weekly ops census, and a CASE-arm-order drill in interview form." },
    { name: "Autoship fill rate", what: "Share of due autoship baskets that ship complete — the scan census reads 82 of 103 baskets carrying shipped_at. Pending (14) is 'not yet', cancelled (7) never counts as filled; the denominator is baskets due, never baskets opened." },
    { name: "Cadence-lapse churn", what: "Households that never place a second basket — 2 of 16 on this book. Churn denominators are households due for a cycle, not baskets placed, and a lapse is diagnosed from the gap between baskets, not from a status column." },
    { name: "Basket depth", what: "Scanned lines per basket — 251 lines folded back to 103 baskets at the basket grain (COUNT(DISTINCT) after the fan-out). The attach-rate read: Accessories touched 54 baskets, Audio 46 — depth by category, not by line count." },
    { name: "Vendor concentration", what: "Share of scanned revenue per brand vendor — 32% for the top vendor, 26.7% for the second. The trusted bench (rating 4.5 and up) holds 2 vendors, and every renewal negotiation starts from this fold." },
  ],

  topics: [
    {
      name: "Autoship cadence and repeat reads",
      why: "Chewy's core motion is the re-order, so the screens drill repeat mechanics: order frequency per household, consecutive-cycle logic, cohort revenue over time. The drill is grouped counting with a stated grain — baskets per household, not per basket — because 14 of 16 households repeating is a population statement, and a median-of-baskets answer flunks it.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "cohort-repeat-revenue"],
    },
    {
      name: "Retention denominators",
      why: "Every Chewy rate names its population out loud: repeat share over 16 households, kept share over 103 placed baskets, delivery rates over the fulfilled subset. The drills pair a ratio with a COALESCE guard — the confirmation-rate shape where a NULL denominator silently deletes a household from the book instead of counting it as zero.",
      slugs: ["confirmation-rate", "immediate-food-delivery-ii", "hopper-company-queries-ii"],
    },
    {
      name: "The unfilled-claim anti-join",
      why: "'Claims that never moved a rail' is a LEFT JOIN + IS NULL screen, and it is THE Chewy case study: 6 claims worth 15217.00, including a 'paid'-status claim the ledger swears by. The drills force the shape — INNER silently drops exactly the rows you hunt — plus the anti-join's cousins: sellers with no sales, visitors with no cart, accounts with no stream.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Claim-settlement rails",
      why: "Program claims settle through card and wire rails — 16 card / 37364.00 against 11 wire / 32248.00 — and the screens drill the settlement stack: monthly transaction folds with cancelled arms, per-account summaries, reconciliation folds that tie the ledger to the rails. The house rule: `amount_cents / 100.0`, divided once, at the display edge.",
      slugs: ["monthly-transactions-ii", "bank-account-summary-ii", "gl-reconciliation"],
    },
    {
      name: "Pet-profile hygiene",
      why: "Personalization runs on profiles, and profiles rot: names in random cases, emails with drifting domains, blanks that JOIN on happily and match nothing. The drills are string shaping — TRIM/UPPER normalization, domain extraction, a null-and-blank audit — because a pet-profile fold that case-mismatches silently loses households from a retention denominator.",
      slugs: ["fix-names-in-a-table", "find-all-unique-email-domains", "null-blank-audit"],
    },
    {
      name: "Replenishment month buckets",
      why: "Autoship cadence is a calendar read: STRFTIME month keys over 103 baskets, distinct baskets AND distinct households per month, month-over-month transaction folds with the cancelled arm beside the count. The trap is bucket-key drift — '%m' merges January-2024 with January-2025 and the cadence curve lies by collision.",
      slugs: ["friday-purchase-iii", "monthly-transactions-i", "unique-orders-and-customers-per-month"],
    },
    {
      name: "The fulfillment clock",
      why: "`JULIANDAY(shipped_at) − JULIANDAY(created_at)` on the 82 fulfilled baskets, and every screen asks which population the average covers. The drills pair golden-hour speed reads with process-time folds across paired timestamps — the self-join start/end shape — plus the within-N-days cohort test the ops census is built from.",
      slugs: ["find-golden-hour-customers", "average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Lifestage CASE tiers",
      why: "Pet households segment by lifestage and spend band, and the db speaks CASE: member categories from spend, loan-style classifications repurposed as tier arms, salary-band censuses as household bands. The drill is arm ORDER — a truthy arm before the specific one silently re-buckets the book, and the tier counts move without an error.",
      slugs: ["the-category-of-each-member-in-the-store", "loan-types", "count-salary-categories"],
    },
    {
      name: "LTV ladders and heavy households",
      why: "Spenders over 3000 lifetime dollars carry 63.5% of demand, so the screens drill ranking windows and cohort frames: RANK with tiebreaks, spend histograms, retention matrices that keep every cohort month on the grid. The follow-up is always the denominator — 63.5% of WHAT (the 34833.28 book), over WHICH population (16 households).",
      slugs: ["rank-scores", "spend-histogram", "cohort-retention-matrix"],
    },
    {
      name: "One-pass censuses",
      why: "The Chewy census is one scan, many arms: per-group FILTER counts, experiment-style tallies, interval buckets that keep zero-rows visible. The drills train the conditional-aggregation habit — count delivered, cancelled and pending in a single fold — because three passes over 103 baskets is three chances for three different WHERE clauses to disagree.",
      slugs: ["snaps-analysis", "count-the-number-of-experiments", "calculate-orders-within-each-interval"],
    },
    {
      name: "Window frames and running totals",
      why: "Cumulative demand across the 14 month buckets is a running frame; the flat 'average month' is a whole-partition fold — and the default OVER (ORDER BY …) frame silently gives the first when you asked for the second. The drills pair running sums with trailing 7-day averages, the frame discipline behind every cadence-smoothing deck.",
      slugs: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "restaurant-growth"],
    },
    {
      name: "Churn cohorts and winback",
      why: "Subscription churn is behavioral: a cadence gap that outlives its cycle window, not a status column. The drills stage growth accounting (new, retained, resurrected, churned) with LAG flags, week-over-week churn folds and winback-recovery windows — the retention org's weekly read on the 2-of-16 lapse cohort.",
      slugs: ["week-over-week-churn", "growth-accounting", "winback-recovery"],
    },
    {
      name: "Percentile tiles and spend tiers",
      why: "Spenders over 3000 lifetime dollars carry 63.5% of demand, so tiering is a percentile question: NTILE quintiles over 16 households, PERCENT_RANK tier floors, RFM segmentation on recency-frequency-monetary reads. The drills train tile arithmetic — where the remainder rows land — and the tier floor that aims each nudge wave.",
      slugs: ["rfm-segmentation", "usage-tier-percentiles", "top-percentile-fraud"],
    },
    {
      name: "Calendar spines and zero-fill",
      why: "A census that omits empty buckets makes claims the data never made: a household-month grid is 16 × 14 = 224 cells, most of them legitimately zero. The drills build spines (monthly via generated ranges, histograms with empty arms visible) and LEFT JOIN events onto them, so a skipped cycle reads as a zero, not an absence.",
      slugs: ["hopper-company-queries-i", "transactions-per-visit-histogram", "create-a-session-bar-chart"],
    },
    {
      name: "Set ops at the close",
      why: "The close stacks card and wire rails into one read (UNION ALL, 16/37364.00 over 11/32248.00), and the reconciliation questions are set ops: INTERSECT for both-rails payers, EXCEPT for wire-only settlements. The drills train dedupe semantics — UNION collapses duplicate rows, UNION ALL never — and the row-wise NULL law that differs from WHERE comparison.",
      slugs: ["movie-rating", "league-statistics", "customers-who-bought-a-and-b-not-c"],
    },
  ],

  theory: [
    {
      id: "chewy-t1",
      q: "Claims connect to payment rails through one key, and the question is 'which claims never moved'. When do you insist on the LEFT JOIN + IS NULL shape, and what does an INNER join do to that question?",
      a: "The shape follows the spine. If the spine is 'claims with no rails' — the never-settled screen — the claim table is the driver and LEFT JOIN payments + WHERE p.id IS NULL is the only honest form: an INNER join keeps only matched rows, which deletes exactly the population the question asks for, and the result ships empty while looking like a clean reconciliation. On this db the anti-join is the finding: 6 claims worth 15217.00, including one the ledger marks 'paid' at 1756.00 — the contradiction IS the row. The cousins worth naming: NOT IN with a NULL rail id poisons the whole list (returns nothing), NOT EXISTS is the NULL-safe twin, and COUNT on the left table beside COUNT on the right quantifies the gap (28 claims, 22 with rails). Say the spine out loud before the FROM clause — that sentence is the screen.",
      tag: "joins",
    },
    {
      id: "chewy-t2",
      q: "Rank households by lifetime baskets for the autoship nudge list. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one ships to CRM?",
      a: "They disagree exactly where the metric ties, and household metrics tie constantly on a 16-household book — counts of 2, 3 and 4 baskets repeat across members. RANK gives tied rows the same rung and skips the next, implying a missing household that doesn't exist; DENSE_RANK shares the rung and keeps the sequence compact; ROW_NUMBER splits ties arbitrarily unless you add a deterministic tiebreak like household id, which makes it the dedupe tool, not the list tool. CRM ships DENSE_RANK with an explicit tiebreak: a nudge list is read as 'who's in tier n', a skipped rung generates a meeting about a household that was never there, and the tiebreak keeps the list identical between the Monday run and the Thursday re-run. The LIMIT-1-OFFSET-1 'next household' habit breaks on every tie; the honest next tier is DENSE_RANK = next, ties included. At the top of this book the ladder is unambiguous — 24, 17, 14, 13 — but the middle ties are where the silent split happens.",
      tag: "windows",
    },
    {
      id: "chewy-t3",
      q: "Invoices LEFT JOIN payments: 28 claims, 27 rails, some claims carrying two. Narrate what COUNT(*), COUNT(p.id) and COUNT(DISTINCT i.id) each return on the joined result, and which grain each serves.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 33 — joined rows, because the five split-settlement claims fan two rails each (27 rails + 6 unmatched claims). COUNT(p.id) is 27 — the rail rows, since COUNT skips the NULLs the LEFT JOIN left on unmatched claims. COUNT(DISTINCT i.id) is 28 — claims folded back to the claim grain, the denominator the coverage census needs. The Chewy trap is reporting one grain under another's name: 'average paid per claim' computed over the 33-row join double-counts every split claim's bill; computed over 27 it drops the six never-settled claims entirely; the honest fold is per-claim aggregation (GROUP BY i.id) or COUNT(DISTINCT) with the population stated. And after the fold the coverage classes emerge — 21 exact, 1 partial (4000.00 of 6148.00), 6 none — which is the number finance actually reads. Assign a grain to every COUNT out loud; the 33/27/28 spread is the proof the discipline matters.",
      tag: "aggregation",
    },
    {
      id: "chewy-t4",
      q: "A claim sits in the ledger with status 'paid' but has zero payment rails. What is your NULL policy for the coverage metric, and how do you present a contradiction like that one?",
      a: "Define coverage by the rails, not the status column, and present the contradiction as a row, not a footnote. The coverage census is a LEFT JOIN with a classified arm: exact when rails sum to the bill (21 claims), partial when 0 < paid < billed (1 claim — 4000.00 of 6148.00), none when no rail exists (6 claims, 15217.00). The 'paid'-status claim with zero rails lands in 'none' — and the honest deck prints it as the anomaly it is: status says one thing, the rails say another, and the reconciliation ticket writes itself. Three NULL behaviors to narrate while you do it: filters (NULL fails = and !=), aggregates (COUNT(col) skips, COUNT(*) keeps — the 33/27/28 spread), comparisons (paid >= billed is UNKNOWN when paid is NULL). The trap being graded is the COALESCE-laundered version — folding NULL paid to 0 and calling it 'none' is fine; folding it to the billed amount and calling it settled is how a 1756.00 hole survives to the board meeting.",
      tag: "nulls",
    },
    {
      id: "chewy-t5",
      q: "'Only show claims where the ledger status is open' — before or after the anti-join, and what does that filter do to the never-settled finding?",
      a: "The order is a decision, and the wrong order deletes the finding. Filter status BEFORE the join and the anti-join returns 5 claims — the 'paid'-status claim with zero rails (1756.00) never survives to be found, because WHERE ran on the ledger's opinion before the rails could contradict it. Run the anti-join on all 28 claims first and the finding is 6 claims worth 15217.00, contradiction included. Logical evaluation backs this: WHERE executes before GROUP BY and HAVING, and ON executes before WHERE in an outer join — so a WHERE on the right-table column after a LEFT JOIN silently converts the join to INNER, the classic way an anti-join collapses to empty. The pipeline split worth reciting: row predicates that shrink the fold's input in WHERE, group predicates (coverage classes, count floors) in HAVING, and contradiction-hunting predicates LAST — after the join that can surface them. On a retention book the sequence is the difference between a clean-looking ledger and the truth.",
      tag: "pipeline",
    },
    {
      id: "chewy-t6",
      q: "You need claims that have at least one card rail but no wire rail. Walk me through the EXISTS shape — and what happens to NOT IN when the rail table holds a NULL?",
      a: "Two semi-joins with opposite polarity. The card leg is EXISTS: SELECT 1 FROM payments p WHERE p.invoice_id = i.id AND p.method = 'card' — a correlated existence test that stops at the first match and never fans out. The no-wire leg is NOT EXISTS: SELECT 1 FROM payments p WHERE p.invoice_id = i.id AND p.method = 'wire' with NOT in front — NULL-safe by construction, because EXISTS only asks whether any row survived, and no row surviving is a clean FALSE. NOT IN is the landmine: NOT IN (SELECT amount FROM rails WHERE …) returns nothing at all the moment the subquery yields one NULL, because x NOT IN (…, NULL) can never be TRUE — UNKNOWN poisons every row. On this db the rail table is NOT NULL on its keys, so NOT IN happens to work, and that's exactly why the interviewer asks: the habit that survives is NOT EXISTS, and being able to say WHY it survives is the follow-up's whole point. Semi-joins also sidestep the fan-out — 27 rails against 28 claims never duplicates a claim row.",
      tag: "subqueries",
    },
    {
      id: "chewy-t7",
      q: "Autoship cadence lives on timestamps stored as TEXT. How do you bucket re-orders by month, measure the gap between cycles, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give '2025-01', and the SUBSTR shortcut works only while the format stays fixed-width ISO; the '%m' shortcut is the standing trap, because it merges January-2024 with January-2025 and the cadence curve lies by collision. Gaps: JULIANDAY between consecutive orders needs LAG over an ordered-per-household stream — stage the per-household sequence in a CTE, then diff; the first cycle has no prior and LAG returns NULL, which is data, not a bug. Windows: half-open predicates — created_at >= '2025-01-01' AND < '2025-02-01' — never BETWEEN on the last day, which double-counts midnight re-orders on cycle boundaries. The deeper breaks: shipped_at is NULL until fulfillment, so any clock fold states its population first (82 of 103), and cadence averages over mixed cohorts mix 24-basket households with one-off baskets into a number nobody can act on.",
      tag: "dates",
    },
    {
      id: "chewy-t8",
      q: "Claims, rails and expenses all store INTEGER cents, and coverage must reconcile to the ledger. How do you keep the fold honest?",
      a: "Two disciplines. Units: every dollar read is amount_cents / 100.0 — the .0 promotes to real arithmetic before the division, because integer over integer truncates and a 4937-cent claim prints as 49 dollars; divide once, at the display edge, after the fold. Classification: coverage is a per-claim fold — GROUP BY the claim, sum the rails, then CASE the sum against the bill: exact (21 claims), partial (1 — a 4000.00 rail against 6148.00, a 2148.00 shortfall), none (6 claims, 15217.00). Collapsing split rails before classifying is a DECISION, not a default: five claims pay in two movements and folding them hides nothing only because both legs are genuine part-payments of one bill — the honest version classifies first, dedupes the display layer after, and says which rows it discarded. The anomaly classes to hunt on every close: void-but-paid (925.00 moved against a voided claim) and paid-with-no-rails (1756.00, status opinion contradicted by the fact). The ledger-vs-rails reconciliation — 19609 of open-status claims against 15217.00 of never-settled — is the number the close ships.",
      tag: "quality",
    },
    {
      id: "chewy-t9",
      q: "Your cumulative-demand query uses SUM(revenue) OVER (ORDER BY month) and looks right — then a teammate swaps AVG in to get 'the monthly average' and the numbers drift month over month. What is the default frame doing, and how do you get the flat average?",
      a: "The default frame when ORDER BY is present is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a running frame. SUM over it is the cumulative curve you wanted; AVG over it is the cumulative average, which drifts toward the whole-book mean as months accumulate but never IS the flat mean, and reporting it as 'the monthly average' mislabels every row. The flat per-row average needs the whole partition: an empty OVER() (no ORDER BY, no frame) or an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. The Chewy read: cumulative demand across the 14 month buckets is a running frame by default, while 'the average month' (34833.28 spread over 14 buckets) is a whole-partition fold — two different questions wearing the same OVER keyword. Say which frame you mean; the engine won't ask.",
      tag: "frames",
    },
    {
      id: "chewy-t10",
      q: "The ops census needs fulfilled, late and clock-less baskets counted in ONE pass over orders. Show the FILTER shape — and what you fall back to when the engine lacks it?",
      a: "One scan, many arms: COUNT(*) FILTER (WHERE JULIANDAY(shipped_at) - JULIANDAY(created_at) <= 3) AS in_window, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL AND JULIANDAY(shipped_at) - JULIANDAY(created_at) > 3) AS late, COUNT(*) FILTER (WHERE shipped_at IS NULL) AS not_yet — no GROUP BY, one table read, and the arms cannot disagree because they share the population. The fallback is conditional aggregation: SUM(CASE WHEN … THEN 1 ELSE 0 END) — same one-pass semantics, portable everywhere, slightly noisier to read. What the FILTER form buys at Chewy is auditability: the clock census (57 in-window, 25 late, 21 clock-less) and the fill-rate scan census (82 with a scan, 21 without) read as named arms over one population instead of five subqueries that could each carry a different WHERE. The trap both forms share: an arm that filters the population (WHERE before the census) instead of branching it — the cancelled baskets must reach the census to be counted as not_yet.",
      tag: "census",
    },
    {
      id: "chewy-t11",
      q: "Card rails and wire rails both settle claims — when do you stack them with UNION ALL, when does UNION matter, and what do INTERSECT and EXCEPT do with NULLs?",
      a: "UNION ALL concatenates and preserves everything — 16 card movements worth 37364.00 stacked over 11 wires worth 32248.00 is the close's rail mix, and both arms survive even if they were identical. UNION dedupes exact duplicate ROWS — on these two distinct arms it changes nothing, but the habit matters because a stack of per-month arms with overlapping rows silently collapses under UNION and the total drops without an error. INTERSECT keeps rows present in both sets; EXCEPT keeps left-not-right — and both treat NULLs as equal for row matching (IS-NOT-DISTINCT semantics), unlike the = operator in WHERE, and both dedupe within each set first. At Chewy these are reconciliation questions: card households INTERSECT wire households is 'who pays on both rails', settled EXCEPT card-settled is 'who settled without a card', and the UNION ALL stack is the ledger itself. Name the dedupe semantics out loud — it is the difference between a stack and a silent fold.",
      tag: "setops",
    },
    {
      id: "chewy-t12",
      q: "Household lifetime spend must sit beside every basket row. Correlated scalar subquery or staged CTE — how do you choose, and what does each cost?",
      a: "The correlated shape — (SELECT SUM(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — reads cleanly and returns exactly one scalar per outer row, but it re-executes once per row: 103 baskets is nothing, a million-basket book is a million re-scans. The staged shape — a CTE folding spend per household, then joined back — scans once and is reusable, and it generalizes the moment you need the spend bucket NEXT to the row (a CASE on the folded value, the 63.5%-concentration tier). The rule I state: correlated for point lookups keyed tightly to the outer row, derived/CTE for anything the query reuses, and a hard contract either way — a scalar subquery that can return two rows (a tie the key didn't exclude) breaks the query, so the inner key must be the household itself. The follow-up worth volunteering: which shape does the plan choose, and can you prove it with EXPLAIN?",
      tag: "subqueries",
    },
    {
      id: "chewy-t13",
      q: "Autoship nudges fire on a 7-day window and the deck wants weekday reads. Beyond the '%Y-%m' bucket key, what date machinery do you reach for — and where does each piece break?",
      a: "Four tools. Weekly buckets: STRFTIME('%Y-%W', created_at) — same collision law as '%m': a week number without the year merges January 2024's week 1 with 2025's. Weekday flags: STRFTIME('%w', created_at) returns '0' for Sunday through '6' for Saturday — TEXT, so compare to strings, and the weekend census is IN ('0','6'). Arithmetic: DATE(created_at, '+7 days') walks the nudge window without JULIANDAY's rounding drift. Anchoring: DATE('now') makes the query non-reproducible — every rerun drifts, so a backtest pins the anchor (a literal date, or MAX(created_at)). The trap that ties them together: created_at is TEXT, so lexicographic range predicates work ('2024-01-01' <= created_at AND created_at < '2024-02-01') but BETWEEN '2024-01-01' AND '2024-01-31' silently drops January 31 timestamps ('2024-01-31 08:00' sorts after '2024-01-31') — half-open ranges, always.",
      tag: "dates",
    },
    {
      id: "chewy-t14",
      q: "A rate's denominator can be zero (a cluster with no kept baskets) and its inputs can be NULL. What is your guard set, and where does COALESCE belong?",
      a: "Three guards, in order. Division: NULLIF(denominator, 0) — the zero becomes NULL and the rate computes to NULL (data), not an engine error; the LATAM cluster with 2 baskets teaches this the day a filter empties it. NULL propagation: any NULL input silently drops out of SUM and CASE chains — a NULL quantity line contributes nothing to revenue and hides its own defect, so an audit arm (COUNT(*) FILTER (WHERE quantity IS NULL)) rides along on every close. COALESCE placement: at the display edge, once — COALESCE(rate, 0) prints a zero the meeting can read, but COALESCE in the middle of the fold launders a missing population into a real-looking number, the same sin as folding never-settled rails into a settled total. The policy sentence I say out loud: NULL is a population fact until the last SELECT column, then it becomes a presentation choice — and the deck footnote says which.",
      tag: "nulls",
    },
    {
      id: "chewy-t15",
      q: "You need months whose revenue clears a floor and vendors whose revenue clears another. Where does each filter live — WHERE, HAVING, or an outer query — and what breaks when it's misplaced?",
      a: "Row-level facts go in WHERE (status = 'cancelled' excluded from kept revenue — those rows never reach the fold); group-level facts go in HAVING (SUM(total) >= 4000 after GROUP BY month — the fold exists before it can be judged). The traps are symmetrical. An aggregate in WHERE fails to parse — COUNT(*) doesn't exist before GROUP BY. A row predicate in HAVING parses fine and quietly computes over an arbitrary row per group — HAVING status = 'delivered' on a grouped query is a coin flip wearing a filter. And a RATIO gate (kept share >= 0.9) can't reference a SELECT alias in HAVING on every engine — repeat the folded numerator and denominator, or stage the ratio in a CTE and filter outside. The Chewy discipline: state which population the floor judges — placed revenue and kept revenue are different floors — then put the predicate where that population exists.",
      tag: "pipeline",
    },
    {
      id: "chewy-t16",
      q: "Your month census groups by an alias and a teammate's by ordinal — GROUP BY 1. What actually happens in each engine, and what's the house rule?",
      a: "GROUP BY resolves three ways: the column name, the SELECT alias (SQLite and Postgres accept it — GROUP BY month works when month is STRFTIME('%Y-%m', created_at) AS month), and the ordinal (GROUP BY 1 means 'first SELECT column'). The ordinal is the one I refuse in shipped SQL: it survives column reordering silently — insert a column at position one and every GROUP BY 1 in the file now groups by the wrong expression, no error, a different census — and some engines reject ordinals outright, so it is both a correctness and a portability hazard. The alias form has its own limit: grouping by the alias of an AGGREGATE fails everywhere, because the alias is computed after the fold. The house rule reads like the denominator rule: group by the expression or its alias, spell it out, and let the query survive a column insert — the 14-bucket cadence census is read by people who edit the SELECT list.",
      tag: "grouping",
    },
    {
      id: "chewy-t17",
      q: "Pet profiles get edited — addresses, pet ages, preferred brands — and every edit is a new row, not an update. How do you resolve 'the current profile' per household, and what makes the pick deterministic?",
      a: "ROW_NUMBER() OVER (PARTITION BY household_id ORDER BY updated_at DESC, id DESC) = 1, then keep rn = 1 — one row per household, the newest edit, and the id DESC tiebreak is what makes it deterministic: two edits stamped in the same second resolve by ingest order instead of engine mood. The alternatives all leak. MAX(updated_at) joined back returns BOTH same-second rows — the household count doubles downstream. DISTINCT household_id picks an arbitrary survivor. A bare ORDER BY without the partition dedupes the whole table to one row. At Chewy this is the pet-profile join-back personalization runs on — nudge emails keyed to a stale address are the benign failure, double-counted households in the 16-household denominator are the expensive one. The follow-up I expect: what happens to households with exactly one profile row — rn is still 1, and they survive by construction.",
      tag: "dedupe",
    },
    {
      id: "chewy-t18",
      q: "Define basket depth the way you'd defend it in a metrics review — and show the SQL shape that keeps the fold honest on a 251-line, 103-basket book.",
      a: "Basket depth is scanned lines per basket: 251 lines folded over 103 baskets — and the defense is the grain. The honest fold joins order_items to orders and counts both grains in one pass: COUNT(*) AS lines, COUNT(DISTINCT o.id) AS baskets — depth is the ratio of those two, never AVG over the fanned join (which averages lines over LINES and reads 1.0) and never a COUNT(*) reported as baskets. The category attach read is the same discipline per category: Accessories touched 54 distinct baskets, Audio 46 — a co-purchase signal for refill bundles, not a line count. The review question I preempt: does a multi-line basket count once? Yes — DISTINCT folds the fan. And does the denominator include cancelled baskets? State it: placed baskets, because attach measures what was chosen, not what shipped.",
      tag: "kpis",
    },
    {
      id: "chewy-t19",
      q: "Define autoship fill rate precisely enough that two analysts compute the same number — including what you do with pending and cancelled baskets.",
      a: "Fill rate = baskets with a completed fulfillment scan over baskets DUE in the window. On this book the scan census reads 82 of 103 baskets carrying shipped_at — but the honest denominator is not blindly 103: cancelled baskets (7) were never fillable, so they leave the denominator under a stated rule, and pending baskets (14) are 'not yet', not 'failed' — they age into the rate or out of the window, never into the failure bucket by default. The numerator is scan-complete baskets: on a line-level build, a basket fills when ALL its lines scan — a partial fill is a fill-rate miss and a backorder signal at once, which is why the metric computes at the basket grain after the lines fan out (COUNT(DISTINCT basket) under a completion condition), never averaged over lines. The interview form is the population sentence first, the CASE arms second: due, filled, pending-not-failed, cancelled-excluded — 82 scans over 103 placed with the cancelled rule stated is the shape, and the exact base is the argument, so state yours.",
      tag: "kpis",
    },
    {
      id: "chewy-t20",
      q: "Define subscription churn for the autoship book — and explain why you'd never read it off a status column.",
      a: "Subscription churn is households whose cadence lapsed over households due. A household is due when its cycle window has passed since the last basket; it has lapsed when the next basket never arrived. The measure is behavioral: LAG over each household's baskets dates the gaps, and a gap beyond the cycle window is the lapse event — the 2 one-off households in this 16-household book are the standing example, and the 24-basket power household is the counterexample nobody needs a status column to find. Reading churn off a status column fails twice: statuses describe ORDERS (7 cancelled baskets are demand decisions, not subscription states), and the column says nothing about the household that simply stopped — no row, no churn flag, no signal. The cohort cut makes it defensible: churn over households acquired in the same month, due windows aligned, so a 24-basket veteran is not judged against a first-month adopter. Denominator sentence included, or the number is decoration.",
      tag: "kpis",
    },
    {
      id: "chewy-t21",
      q: "The cadence grid drops the months where a household bought nothing — skipped cycles vanish and the retention line lies. How do you keep empty cells on the grid?",
      a: "Build a spine and LEFT JOIN the events onto it. The spine is every cell the read claims — for a cadence grid that's households crossed with months (16 × 14 = 224 cells, most of them legitimately empty), for a calendar walk a recursive date CTE — and the fold is COUNT(o.id) over the LEFT JOIN, which reads 0 for empty cells instead of omitting them. The histogram version has the same disease: a census arm with zero rows missing reads as 'no low-value baskets', which is a claim, not a gap. What the spine buys at Chewy is honest cadence: the light 6-basket months (June 2024, November 2024, January 2025) stay visible next to the 9-basket peaks, and a household that skipped a cycle shows as a zero, not an absence. The follow-up I expect: the fold counts the RIGHT side's key (COUNT(o.id)), never COUNT(*) — the spine's own rows would fake a basket; and COALESCE the NULL folds to 0 at the display edge, with the footnote that the spine is synthetic.",
      tag: "calendar",
    },
    {
      id: "chewy-t22",
      q: "Which SKU pairs ride in the same basket most often? Walk the self-join shape and the one correctness detail everyone forgets.",
      a: "Join order_items to itself on the basket key with a strict inequality between the product keys: FROM order_items a JOIN order_items b ON a.order_id = b.order_id AND a.product_id < b.product_id — the strict < is the correctness detail: it kills the a = a self-pair AND the a,b / b,a mirror, so each pair counts once in one canonical order. Without it, every pair double-counts and every single-line basket pairs with itself. Then GROUP BY the canonical pair, COUNT, ORDER BY count DESC — the bundle shortlist falls out. At Chewy this is the co-purchase read behind refill bundles: accessories that ride with audio SKUs, or the treats-plus-food pairing the subscription team wants to attach to autoship. The follow-up worth naming: fan-out — a 5-line basket self-joins to 20 ordered pairs (5×4/2 undirected), so counts measure pair co-occurrences across the book, and raw popularity can masquerade as affinity unless you compare against each SKU's base rate.",
      tag: "pairs",
    },
    {
      id: "chewy-t23",
      q: "The packing-slip preview needs each basket's SKUs folded into one readable string. What does GROUP_CONCAT give you, what does it NOT promise, and how do you keep it from lying?",
      a: "GROUP_CONCAT(name) folds one row per group into a delimited string — GROUP_CONCAT(name, ', ') over scan lines per basket turns 251 lines into one readable cell per basket. What it does NOT promise: order. Without an explicit ORDER BY inside the aggregate (supported in recent SQLite; otherwise stage rows in a subquery and accept engine-specific scan order), the concatenation order is arbitrary — fine for a packing list, a lie for anything narrative ('Keyboard, Mouse' vs 'Mouse, Keyboard' in an A/B email subject). Length is the second trap: the 24-basket household's SKU list is unbounded, so the fold can produce a cell no dashboard renders. And NULLs drop silently — a line with a NULL name vanishes from the string, so the line count and the list length can disagree. My policy: GROUP_CONCAT for display edges only, delimiter explicit, order stated or guaranteed, and the CSV never feeds a downstream fold — parse it back and you have built a stringly-typed join.",
      tag: "strings",
    },
    {
      id: "chewy-t24",
      q: "The db is small — 103 baskets. What performance instincts do you still practice, and which habits does the small book let you fake?",
      a: "The small book forgives almost anything, which is exactly why I keep the instincts. Sargable predicates: don't wrap the filtered column in a function — SUBSTR(created_at,1,7) = '2024-01' scans the whole table while created_at >= '2024-01-01' AND created_at < '2024-02-01' can use an index. Filter before the join when the predicate is row-level on one side: pushing status = 'cancelled' into the driver table shrinks the join, not the report. Foreign keys get indexes (customer_id, product_id, invoice_id — every join in this book runs on one), SELECT * is a handoff hazard, and COUNT over the whole table to 'check something' is a habit that becomes a full scan on a 30-million-basket book. The habit the small book lets you fake: correlated subqueries per row. 103 re-executions are invisible; the same shape in production is the top entry in the slow query log. I write the scalable shape from the start, because the migration never waits for a refactor.",
      tag: "performance",
    },
  ],

  mcqs: [
    {
      id: "chewy-mcq-1",
      prompt: "Invoices LEFT JOIN payments on the claim key: 28 claims, 27 rails, five claims carrying two rails each. What does COUNT(*) return on the joined result?",
      choices: [
        "28 — one row per claim",
        "27 — one row per rail",
        "33 — 27 matched rows plus 6 unmatched claims",
        "55 — every claim paired with every rail",
      ],
      answer: 2,
      why: "LEFT JOIN keeps every claim: the 22 claims with rails contribute their 27 rail rows (five splits fan two each) and the 6 never-settled claims contribute one NULL-padded row each — 33 rows total.",
      notes: [
        { choice: 0, why: "28 is COUNT(DISTINCT i.id) — the claim grain after the fold. The join itself fans split claims, so raw row count runs higher." },
        { choice: 1, why: "27 is COUNT(p.id) — rails only. The LEFT JOIN's whole point is the 6 NULL-padded rows an INNER join would drop; counting only rails erases them." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-2",
      prompt: "A never-settled claim reads 493700 in the invoices table. Which expression prints the dollar figure?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 100",
        "ROUND(amount_cents, 2)",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before the division; rounding once at the display edge keeps 4937.00. Claims, rails and expenses all store INTEGER cents on this db.",
      notes: [
        { choice: 0, why: "Integer over integer truncates in SQLite — fine on whole-dollar rows, silently wrong the first time an odd-cent claim lands. The .0 is the fix, not a style choice." },
        { choice: 2, why: "Multiplying turns cents into 49370000 — units inverted. Magnitude-check every money fold: dollars are smaller than cents, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-3",
      prompt: "The status census reads 52 delivered, 30 shipped, 14 pending, 7 cancelled. Which denominator does the kept-basket share use?",
      choices: [
        "52 delivered baskets",
        "82 fulfilled baskets",
        "103 placed baskets",
        "96 non-pending baskets",
      ],
      answer: 2,
      why: "Kept share = non-cancelled over PLACED: (103 − 7) / 103. The placed base keeps every basket that entered the funnel — the denominator rule is decided before the ratio, not after the meeting.",
      notes: [
        { choice: 0, why: "Delivered-only denominators flatter the rate by dropping shipped, pending and cancelled — a fulfillment outcome, not a demand base." },
        { choice: 1, why: "82 is the fulfilled population — right for latency, wrong for kept share. Populations travel with their metrics; 2.98 days and 6.8% live on different bases." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-4",
      prompt: "The anti-join says 6 claims never moved a rail (15217.00). A teammate adds WHERE i.status = 'open'. What happens to the finding?",
      choices: [
        "Nothing — every never-settled claim is open",
        "It drops to 5 claims — the 'paid'-status claim with zero rails (1756.00) is filtered out",
        "It grows — closed claims re-enter the fold",
        "The query errors — status can't be filtered after a LEFT JOIN",
      ],
      answer: 1,
      why: "One of the 6 never-settled claims carries status 'paid' with zero rails — the ledger-vs-rails contradiction. A status filter applied before the anti-join deletes the contradiction and the finding reads 5 claims, a clean-looking 13461.00.",
      notes: [
        { choice: 0, why: "That's the trap: the ledger SAYS every unsettled claim is open, and one claim proves otherwise. The contradiction only survives if the anti-join runs on all claims." },
        { choice: 3, why: "Status filters after a LEFT JOIN are legal SQL — the danger is semantic (they can silently convert the join to INNER), not syntactic. The query runs and quietly lies." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-5",
      prompt: "Rails settle as 16 card payments / 37364.00 and 11 wires / 32248.00. Which read is a RATE, not a count?",
      choices: [
        "27 total rail movements",
        "Card share of rail VALUE: 37364.00 / 69612.00",
        "11 wire movements",
        "16 card payments",
      ],
      answer: 1,
      why: "A rate divides one measure by a compatible total: card value share = 37364.00 / (37364.00 + 32248.00) — rails' dollars over rails' dollars. Counts (27, 16, 11) are populations, and mixing count bases with value bases is the classic Chewy screen trap.",
      notes: [
        { choice: 0, why: "27 is a population count — a denominator candidate, not a rate. Every rate needs a stated numerator AND denominator before it's a number." },
        { choice: 2, why: "11 is a count of wire rows. 'Wire share' quoted as 11/27 counts movements, not dollars — a different rate that must name its base out loud." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-6",
      prompt: "You bucket 103 baskets with STRFTIME('%m', created_at). What does the cadence curve show for 'January'?",
      choices: [
        "January 2025 only — 6 baskets",
        "January 2024 only — 8 baskets",
        "Both Januaries merged — 14 baskets under one key",
        "An error — '%m' is not a valid STRFTIME specifier",
      ],
      answer: 2,
      why: "'%m' emits the month number only, so 2024-01 and 2025-01 collapse into one '01' key — 8 + 6 = 14 baskets under a label that looks like a single month. The year-safe key is '%Y-%m'.",
      notes: [
        { choice: 0, why: "That's what '%Y-%m' shows for the newest January. '%m' has no year component — it can't separate the two Januaries, it merges them into one key." },
        { choice: 3, why: "'%m' is a valid STRFTIME specifier (month number) — the query runs clean and the curve bends exactly where two years collide. Bucket-key drift is silent, which is what makes it dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-7",
      prompt: "The nudge list gates at '2+ lifetime baskets'. 14 of 16 households qualify. Which clause applies the gate?",
      choices: [
        "WHERE COUNT(*) >= 2",
        "HAVING COUNT(*) >= 2",
        "LIMIT 2",
        "WHERE baskets > 2",
      ],
      answer: 1,
      why: "The basket count is a group fact — it exists only after GROUP BY household folds the 103 baskets, so the gate is HAVING. That keeps the 14 repeat households and drops the 2 one-off baskets' owners.",
      notes: [
        { choice: 0, why: "WHERE runs before groups form — COUNT(*) doesn't exist yet and the engine rejects it. The error message is the pipeline order teaching itself." },
        { choice: 3, why: "Strict > drops every 2-basket household — exactly the re-activating cohort the nudge list exists to catch. Boundary operators quietly delete the target population." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-8",
      prompt: "A teammate rewrites the never-settled screen as WHERE i.id NOT IN (SELECT invoice_id FROM payments). What can silently break it?",
      choices: [
        "Nothing — NOT IN is the canonical anti-join",
        "One NULL invoice_id in payments returns ZERO rows — UNKNOWN poisons every comparison",
        "It returns every claim twice — the fan-out doubles",
        "It only breaks on PostgreSQL, not SQLite",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: each comparison yields UNKNOWN, the OR-chain never fires, and the anti-join ships empty. NOT EXISTS asks only 'did any row survive' and is NULL-safe by construction — the habit that survives every schema drift.",
      notes: [
        { choice: 0, why: "It works today because this rail table keeps invoice_id NOT NULL — the schema happens to save you. The screen is one nullable backfill away from silently returning nothing." },
        { choice: 2, why: "NOT IN is a semi-join filter on the outer rows — it never duplicates them. Fan-out is the JOIN's disease; NOT IN's disease is the empty set." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-9",
      prompt: "Baskets join to scanned lines: 103 baskets fan into 251 rows. On the joined result, which fold still counts BASKETS?",
      choices: [
        "COUNT(*) — it always counts the primary entity",
        "COUNT(DISTINCT o.id) — folding the fan-out back to the basket grain",
        "COUNT(o.id) — NULLs are skipped automatically",
        "SUM(o.id) — ids sum to the row count",
      ],
      answer: 1,
      why: "After the fan-out, only COUNT(DISTINCT o.id) folds lines back to baskets — COUNT(*) counts 251 rows. COUNT(o.id) skips only NULLs; with a NOT NULL key it counts 251 too.",
      notes: [
        { choice: 0, why: "COUNT(*) counts ROWS of the joined result — the fan-out IS the result. 'Primary entity' is a hope, not semantics; DISTINCT is the fold." },
        { choice: 3, why: "SUM over ids is a meaningless number that happens to be huge. Sanity-check magnitude: basket counts are smaller than line counts, never larger." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-10",
      prompt: "The clock census bands ALL 103 baskets with CASE WHEN latency <= 3 THEN 'in_window' WHEN shipped_at IS NOT NULL THEN 'late' ELSE 'not_yet' END. A teammate swaps the second arm to WHEN 1 = 1 THEN 'late'. What ships?",
      choices: [
        "Same census — 57 / 25 / 21",
        "57 in_window, 46 late, no not_yet — the 21 clock-less baskets vanish into 'late'",
        "57 in_window, 21 not_yet, no late",
        "An error — a constant WHEN arm is illegal",
      ],
      answer: 1,
      why: "Arm order is the census: with 'late' gated on shipped_at IS NOT NULL, the 21 clock-less baskets (14 pending + 7 cancelled) fall to ELSE and read 'not_yet'. A truthy constant arm catches everything the first arm missed — 25 late + 21 swept = 46 — and 'not yet' silently becomes 'late'.",
      notes: [
        { choice: 0, why: "That's the census WITH the population guard. The constant arm parses fine and re-buckets 21 rows without an error — the quietest way an ops deck starts lying." },
        { choice: 2, why: "That's the labels-swapped variant (arm 2 = shipped_at IS NULL), which keeps the 57/25/21 counts but renames the buckets. A truthy constant instead merges two buckets' counts." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-11",
      prompt: "The close's rail stack is two arms joined by UNION ALL — card 16 movements / 37364.00, wire 11 / 32248.00. A teammate swaps in bare UNION to 'make it cleaner'. What ships?",
      choices: [
        "An error — UNION cannot combine aggregate arms",
        "The same two rows — the arms differ, so UNION has nothing to dedupe",
        "One row — UNION collapses both arms into a single total",
        "Two rows sorted by movement count instead of arm order",
      ],
      answer: 1,
      why: "UNION removes exact duplicate rows; these two arms differ in every column, so the stack is unchanged. The cleanup is cosmetic — and the guard matters the day two arms CAN produce identical rows and silently collapse into one.",
      notes: [
        { choice: 0, why: "UNION happily combines aggregate arms — it's a set operation on result rows, indifferent to how the rows were computed. The error trap is invented." },
        { choice: 2, why: "UNION never aggregates across rows — folding to one total is a rollup's job. A set op dedupes or drops rows; it never sums them." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-12",
      prompt: "monthly holds 14 buckets. SELECT month, AVG(revenue) OVER (ORDER BY month) FROM monthly — the teammate expects the flat 14-month average. What do they get?",
      choices: [
        "The flat average — identical on every row",
        "A running average that drifts as months accumulate — the default frame is UNBOUNDED PRECEDING to CURRENT ROW",
        "An error — AVG cannot be used with OVER (ORDER BY)",
        "The next month's average — window functions default to LEAD semantics",
      ],
      answer: 1,
      why: "With ORDER BY present, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW: each row's AVG covers that month and all before it. The flat whole-partition average needs an empty OVER() or an explicit UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING frame.",
      notes: [
        { choice: 0, why: "That's the SUM intuition misapplied — SUM over that frame IS the running total the analyst wanted, which is exactly why the AVG drift goes unnoticed until someone re-derives the flat mean." },
        { choice: 2, why: "Any aggregate accepts an OVER clause; the frame, not the function, decides the population the aggregate sees." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-13",
      prompt: "One pass over orders must count fulfilled baskets (scan exists) and clock-less baskets (no scan) side by side. Which line is the FILTER-clause form?",
      choices: [
        "COUNT(*) FILTER (WHERE shipped_at IS NOT NULL)",
        "FILTER (COUNT(*), WHERE shipped_at IS NOT NULL)",
        "COUNT(shipped_at) FILTER (*)",
        "COUNT(*) WHERE FILTER (shipped_at IS NOT NULL)",
      ],
      answer: 0,
      why: "FILTER (WHERE …) attaches to the aggregate: COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) counts scan-bearing rows without a second query. The census reads as named arms over one population — 82 with a clock, 21 without — and the arms cannot disagree.",
      notes: [
        { choice: 1, why: "The predicate rides INSIDE FILTER (WHERE …) attached AFTER the aggregate — putting FILTER first is a syntax error, and the census ships as an error message." },
        { choice: 2, why: "COUNT(shipped_at) already skips NULLs — wrapping it in a bare FILTER(*) is redundant syntax that documents nothing and isn't the census shape asked for." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-14",
      prompt: "A conversion rate divides matched households by due households: matched / due. A segment can have zero due households. Which guard ships?",
      choices: [
        "WHERE due > 0 — drop the empty segments",
        "matched / NULLIF(due, 0) — empty segments read NULL, not an error",
        "COALESCE(due, 1) — treat missing as one",
        "CAST(matched AS REAL) / due — casting fixes division",
      ],
      answer: 1,
      why: "NULLIF(due, 0) turns the zero into NULL, so the rate computes to NULL — a visible 'no denominator' instead of a division error or a fabricated number. The display layer decides later whether NULL prints as '—' or as 0.",
      notes: [
        { choice: 0, why: "Dropping empty segments deletes the finding — a segment with zero due and zero matched is a real row of the census, and WHERE due > 0 hides it." },
        { choice: 2, why: "A denominator of 1 fabricates a rate from nothing — the segment now reports 0/1 = 0% as if it were measured." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-15",
      prompt: "Why does the house style ban GROUP BY 1 in shipped SQL even though the engine accepts it?",
      choices: [
        "It groups by the literal number 1 — every row collapses into one group",
        "It silently re-targets when the SELECT list changes, and some engines reject it outright",
        "It only works on TEXT columns",
        "It forces an index scan on the first column",
      ],
      answer: 1,
      why: "GROUP BY 1 means 'first SELECT column'. Insert a column at position one and every GROUP BY 1 in the file now groups by the wrong expression — no error, a different census. Spell the expression or its alias; the query must survive a column insert.",
      notes: [
        { choice: 0, why: "GROUP BY 1 is an ordinal reference to the first output column, not the constant 1 — it parses, runs, and lies only after the SELECT list evolves." },
        { choice: 2, why: "Ordinals are type-blind — they reference position, which is precisely why they're fragile, not type-limited." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-16",
      prompt: "Household lifetime spend rides beside each basket via a scalar subquery in SELECT. What guarantees it doesn't blow up?",
      choices: [
        "Nothing special — scalar subqueries always return one row",
        "The inner query must be keyed to the outer row so it folds to at most one value — a scalar context holds exactly one value, or the query errors",
        "It needs LIMIT 1 to be safe",
        "It must be wrapped in COALESCE to avoid fan-out",
      ],
      answer: 1,
      why: "A scalar subquery in SELECT must produce one value per outer row. Keyed on customer_id with an aggregate inside, it folds that household's baskets to one number; unkeyed or tied, it returns multiple rows and the engine raises 'subquery returns more than one row'.",
      notes: [
        { choice: 0, why: "The one-row guarantee comes from the aggregate plus key, not the syntax — an unkeyed SELECT customer_id FROM orders inside a scalar context is the classic blow-up." },
        { choice: 2, why: "LIMIT 1 masks the tie instead of resolving it — the spend shown becomes an arbitrary survivor's, and the bug ships silently." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-17",
      prompt: "claim_settled EXCEPT card_settled — claims that moved any rail, minus claims that moved a card rail. What population is left?",
      choices: [
        "Claims with no rails at all",
        "Claims settled by wire only — rails exist, none of them card",
        "Every claim — EXCEPT ignores the key",
        "Claims with both card and wire rails",
      ],
      answer: 1,
      why: "EXCEPT keeps left-not-right: settled claims minus card-settled claims are the wire-only settlements. INTERSECT would give the both-rails claims, and the anti-join (LEFT JOIN + IS NULL) gives the never-settled 6 — three reconciliations from three different set shapes.",
      notes: [
        { choice: 0, why: "Never-settled claims appear in NEITHER set, so they can't survive an EXCEPT of two settled populations — that's the anti-join's job." },
        { choice: 3, why: "Both-rails claims are IN card_settled, so EXCEPT removes them — that's INTERSECT's population, not EXCEPT's." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-18",
      prompt: "Pet profiles append on every edit. Which expression reliably yields the current profile per household?",
      choices: [
        "GROUP BY household with MAX(updated_at) in SELECT",
        "ROW_NUMBER() OVER (PARTITION BY household ORDER BY updated_at DESC, id DESC) = 1, keep those rows",
        "SELECT DISTINCT household_id FROM profiles",
        "ORDER BY updated_at DESC LIMIT 1",
      ],
      answer: 1,
      why: "ROW_NUMBER with the id DESC tiebreak picks exactly one survivor per household — deterministic even when two edits share a timestamp. The MAX join-back returns BOTH same-second rows; DISTINCT returns only ids; LIMIT 1 returns one household total.",
      notes: [
        { choice: 0, why: "MAX(updated_at) in a grouped SELECT shows the latest stamp but not the latest ROW — you still need a join-back, and a timestamp tie fans it to two rows per household." },
        { choice: 2, why: "DISTINCT folds to a list of households — every profile column is gone, so 'current profile' is undefined." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-19",
      prompt: "STRFTIME('%w', created_at) drives the weekend census. Which predicate catches the weekend?",
      choices: [
        "IN ('0', '6') — '%w' returns '0' Sunday through '6' Saturday",
        "BETWEEN 1 AND 5 — the busy-shopping days",
        "IN ('SAT', 'SUN') — '%w' returns day names",
        "= 'WEEKEND' — SQLite has a weekend specifier",
      ],
      answer: 0,
      why: "'%w' emits the weekday as a single TEXT digit: '0' Sunday through '6' Saturday. The weekend is IN ('0','6'), and the values are strings — comparing to numbers relies on type coercion that works in SQLite but reads wrong everywhere else.",
      notes: [
        { choice: 1, why: "1–5 is Monday–Friday — the weekday census wearing the weekend's name; the basket mix on the two arms differs enough to break the forecast." },
        { choice: 2, why: "'%w' has no name mode — that predicate matches nothing and the weekend census reads zero baskets." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-20",
      prompt: "NTILE(5) OVER (ORDER BY lifetime_spend DESC) tiles the 16-household book into spend quintiles. What are the tile sizes?",
      choices: [
        "4 / 3 / 3 / 3 / 3 — the remainder rows go to the earliest tiles",
        "3 / 3 / 3 / 3 / 4 — the remainder lands in the last tile",
        "16 / 16 / 16 / 16 / 16 — NTILE repeats the population per tile",
        "All tiles get 3 and one household is dropped",
      ],
      answer: 0,
      why: "NTILE distributes as evenly as possible and gives the leftover rows to the LEADING tiles: 16 = 5×3 + 1, so tile 1 holds 4 households and tiles 2–5 hold 3. The top spenders tier is one household fatter than the rest — by specification, not accident.",
      notes: [
        { choice: 1, why: "The remainder goes front, not back — reading tile 1 as 'the pure top tier' miscounts the nudge list's first ring." },
        { choice: 3, why: "NTILE never drops rows — every household lands in exactly one tile; the census total stays 16." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-21",
      prompt: "Gap-to-previous-basket per household: LAG(created_at) OVER (PARTITION BY household ORDER BY created_at). What is the cleanest handling of the first row?",
      choices: [
        "COALESCE the gap to 0 — the first basket starts the clock",
        "Leave the NULL and let the census arms treat it as 'no prior' — first baskets have no gap",
        "Filter WHERE created_at IS NOT NULL",
        "Use LEAD instead so no row is NULL",
      ],
      answer: 1,
      why: "The first basket genuinely has no prior — NULL is the honest value. Downstream, gap censuses either exclude it explicitly or count it as the 'new cadence' arm; silently COALESCEing to 0 files a fake zero-day gap into the fastest bucket.",
      notes: [
        { choice: 0, why: "A 0-day gap for every household's first basket poisons the gap histogram — the 'same-day reorder' bucket fills with first baskets that reordered nothing." },
        { choice: 2, why: "created_at is never NULL — the filter matches nothing and teaches nothing; the NULL you meant is the LAG output, one column over." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-22",
      prompt: "The cadence grid crosses households with months: 16 households × the 14 observed month buckets. How many spine rows?",
      choices: [
        "224",
        "30 — a CROSS JOIN adds",
        "103 — the spine snaps to the orders table",
        "256 — padded to a power of two",
      ],
      answer: 0,
      why: "CROSS JOIN is the Cartesian product: 16 × 14 = 224 cells, one per household-month, and the LEFT JOINed basket counts fill most of them with 0. That zero-fill IS the point — a skipped cycle reads as a zero, not an absence.",
      notes: [
        { choice: 1, why: "CROSS JOIN multiplies, it doesn't concatenate — 30 is the UNION ALL spine, which serves a different census." },
        { choice: 2, why: "103 is the basket count — the spine is synthetic and deliberately larger; joining it to orders fills cells, it doesn't define them." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-23",
      prompt: "A packing-slip preview folds basket lines with GROUP_CONCAT(name, ', '). What does the order of names in the string depend on?",
      choices: [
        "Nothing — GROUP_CONCAT sorts alphabetically by contract",
        "The scan order of the rows unless an ORDER BY inside the aggregate is supported — otherwise it's unspecified",
        "The product_id order, always",
        "The delimiter — commas force ascending order",
      ],
      answer: 1,
      why: "GROUP_CONCAT gives no order guarantee without an explicit ORDER BY inside the aggregate (recent SQLite) or a staged subquery whose scan order you control. For a packing slip the risk is cosmetic; for an email subject line it's a different A/B arm every run.",
      notes: [
        { choice: 0, why: "Alphabetical-by-contract is the trap — no such contract exists; two runs can legally differ, which is why deterministic order must be written down." },
        { choice: 2, why: "product_id order is what you'd ASK for, not what you get by default — hope is not an ORDER BY." },
      ],
      difficulty: "easy",
    },
    {
      id: "chewy-mcq-24",
      prompt: "The cancellation share reads 6.8% (7 of 103 baskets). Which expression prints it — and which one prints 0?",
      choices: [
        "ROUND(100.0 * SUM(status = 'cancelled') / COUNT(*), 1)",
        "ROUND(SUM(status = 'cancelled') / COUNT(*) * 100, 1)",
        "ROUND(COUNT(*) / SUM(status = 'cancelled'), 1)",
        "ROUND(SUM(status = 'cancelled') * COUNT(*) / 100, 1)",
      ],
      answer: 0,
      why: "In SQLite, 7 / 103 is integer division = 0, so multiplying by 100 AFTER the division prints 0.0 — the .0 must promote before the divide (100.0 * …). The boolean SUM counts cancelled rows; COUNT(*) is the placed base.",
      notes: [
        { choice: 1, why: "The classic integer-division bug — SUM/COUNT evaluates first in integer math and truncates to 0; the *100 multiplies an already-dead zero." },
        { choice: 2, why: "Inverted ratio — 103/7 ≈ 14.7, 'baskets per cancellation', wearing the cancellation-share name." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-25",
      prompt: "SELECT o.id, (SELECT customer_id FROM customers) FROM orders o — why does this shape error, and what's the fix?",
      choices: [
        "Scalar subqueries cannot reference other tables",
        "The inner query is unkeyed and returns 16 rows — a scalar context holds one value; key it (WHERE c.id = o.customer_id) or wrap it in an aggregate",
        "It needs a JOIN, not a subquery",
        "SQLite allows it and returns the first row",
      ],
      answer: 1,
      why: "A scalar position demands exactly one value. Unkeyed, the inner SELECT returns one row per customer (16 here) and the engine raises 'subquery returns more than one row'. Keying to the outer row — or wrapping in an aggregate like MAX — restores the one-value contract.",
      notes: [
        { choice: 2, why: "A JOIN is the set-based alternative, not the fix for a scalar — the scalar's contract is one row, and only the key or an aggregate delivers it." },
        { choice: 3, why: "Some engines tolerate it with an implicit LIMIT 1 — SQLite is not one of them, and 'first row' semantics would be nondeterministic anyway." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-26",
      prompt: "created_at is ISO TEXT. Which month predicate silently drops orders placed during the last day of January?",
      choices: [
        "created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "created_at BETWEEN '2024-01-01' AND '2024-01-31'",
        "SUBSTR(created_at, 1, 7) = '2024-01'",
        "STRFTIME('%Y-%m', created_at) = '2024-01'",
      ],
      answer: 1,
      why: "'2024-01-31 08:00' sorts AFTER '2024-01-31' as a string, so BETWEEN with the bare date excludes that day's timestamps — the last day leaks out of the bucket. Half-open ranges ('2024-01-01' <= t < '2024-02-01') or the month-key forms are the safe shapes.",
      notes: [
        { choice: 2, why: "SUBSTR month-keying is safe here — every January timestamp shares the '2024-01' prefix; its cost is an index-hostile scan, not a wrong answer." },
        { choice: 0, why: "Half-open is the fix, not the bug — '2024-01-31 08:00' < '2024-02-01' lexicographically, so the last day is fully included." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-27",
      prompt: "How do INTERSECT and EXCEPT treat NULL values during row comparison?",
      choices: [
        "NULLs never match — rows containing NULL never survive",
        "NULLs match NULLs — set ops compare rows with IS-NOT-DISTINCT semantics",
        "Rows with NULLs raise an error",
        "NULLs sort first, which changes membership",
      ],
      answer: 1,
      why: "Set operations compare whole rows with IS-NOT-DISTINCT semantics: NULL equals NULL for membership, so two NULL-bearing duplicate rows dedupe under UNION and match under INTERSECT. That's unlike = in a WHERE, where NULL compares as UNKNOWN — the same value, two different comparison laws.",
      notes: [
        { choice: 0, why: "That's the WHERE law applied to the wrong operator — inside set ops, NULL-bearing rows participate fully, and forgetting it inflates or deflates the reconciliation." },
        { choice: 2, why: "No error — set ops are total on rows; the NULL handling is defined, just different from scalar comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "chewy-mcq-28",
      prompt: "The nudge list tiers households by lifetime baskets. Two households tie for the second-highest count. How do RANK and DENSE_RANK disagree?",
      choices: [
        "They don't — ties resolve identically in both",
        "RANK gives both 2 and skips to 4 next; DENSE_RANK gives both 2 and continues to 3",
        "RANK averages the tied values; DENSE_RANK picks the first",
        "They differ only when an ORDER BY sits inside a PARTITION",
      ],
      answer: 1,
      why: "RANK skips rungs after a tie (2, 2, 4 — a missing rung that implies a household that doesn't exist); DENSE_RANK keeps the sequence compact (2, 2, 3). For a nudge tier read as 'who is in tier n', DENSE_RANK with a deterministic tiebreak is the shippable form.",
      notes: [
        { choice: 0, why: "Identical only when NO ties exist — and household counts tie constantly on a 16-household book, which is precisely where the rung gap appears." },
        { choice: 2, why: "Neither function averages or picks — ties share a rung; ROW_NUMBER is the function that splits them, arbitrarily unless you add a tiebreak." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-29",
      prompt: "SELECT *, ROW_NUMBER() OVER (PARTITION BY household ORDER BY updated_at DESC) rn FROM profiles WHERE rn = 1 — what happens?",
      choices: [
        "It returns the latest profile per household",
        "It errors — window functions evaluate after WHERE, so rn doesn't exist yet; stage in a CTE or subquery and filter outside",
        "It returns every row with rn = 1 evaluated per partition in place",
        "It silently ignores the WHERE and returns everything",
      ],
      answer: 1,
      why: "WHERE runs before window functions compute, so the alias rn is invisible to it — the engine raises 'misuse of window function' or 'no such column'. The fix is staging: wrap the windowed SELECT in a CTE or derived table, then WHERE rn = 1 outside.",
      notes: [
        { choice: 0, why: "That's the intent, not the execution — the pipeline order (WHERE before SELECT) is exactly what kills the filter, and the error is the pipeline teaching itself." },
        { choice: 2, why: "No in-place evaluation exists — windows compute over the post-WHERE rowset, which is why the filter must live one query later." },
      ],
      difficulty: "medium",
    },
    {
      id: "chewy-mcq-30",
      prompt: "Invoices LEFT JOIN payments: 28 claims, 27 rails, five claims carrying two rails each. What does SUM(i.amount_cents) over the joined rows do?",
      choices: [
        "Ties the ledger exactly — the join is lossless",
        "Overstates the bill total by the five split claims' bills — each pays double",
        "Understates by the six never-settled claims' bills — NULLs subtract",
        "Returns NULL — any NULL rail poisons the SUM",
      ],
      answer: 1,
      why: "The five split-settlement claims appear on two joined rows each, so their bills sum twice — SUM over the fanned side inflates the claim-side total by exactly those five bills. SUM ignores NULLs, so the six unmatched claims contribute zero, not an error.",
      notes: [
        { choice: 0, why: "The join is claim-preserving but not fold-safe — COUNT(DISTINCT i.id) is 28, but SUM sees 33 rows; the fan-out is invisible to DISTINCT counts and loud in SUMs." },
        { choice: 2, why: "SUM skips NULLs rather than subtracting — the understatement risk lives in COUNT(p.id) (27, rails only), not in a SUM of the claim side." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-chewy-1",
      tier: "easy",
      topic: "j5",
      universe: "refund-audit",
      title: "The claim that never moved",
      brief:
        "Chewy-flavored case on the storefront db (invoices = program & partner claims, payments = payment-rail movements; amounts live as INTEGER cents): the close review found a contradiction — the open-status ledger names 6 claims worth 19609, but the rails only ever moved 15217.00 against claims that never settled at all. The billing lead is explicit: 'a claim counts as never-settled only if NO payment rail exists for it; the ledger's status is an opinion, the rail is a fact — pull me the single biggest never-settled claim straight from the rails, dollars to 2 decimals.' Probed facts: the never-settled anti-join holds 6 claims worth 15217.00 — 4937, 3562, 2794, 1756, 1295, 873 — and one of them carries ledger status 'paid' with zero rails; the partial rail on the open 6148.00 claim (4000.00 moved) keeps it OUT of this stack.",
      ask: "Return the single largest never-settled claim: claim id, ledger status, and dollar amount to 2 decimals.",
      template:
        "SELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS dollars\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2}\nORDER BY dollars DESC\nLIMIT {3};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the claim-preserving join",
          why: "The question is claims with NO rails, so the claim table must survive unmatched: LEFT JOIN keeps all 28 claims and NULL-pads the 6 without rails. INNER would keep only matched rows — deleting exactly the population the screen hunts for — and the result ships empty while looking like a clean reconciliation.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the unmatched-rail arm",
          why: "p.id IS NULL is the anti-join signature: keep claims whose LEFT JOIN left no rail row. IS NOT NULL flips the screen to the 22 settled claims — the opposite finding wearing the same query.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-claim cut",
          noVerify: true,
          why: "The ask is the single biggest never-settled claim, so LIMIT 1 keeps exactly the 4937.00 row (claim 24). LIMIT 2 would drag the 3562.00 claim into a one-claim story and dilute the billing escalation.",
        },
      ],
      distractors: ["INNER", "IS NOT NULL", "2", "3"],
      walkthrough:
        "A never-settled screen is one anti-join and two disciplines. The LEFT JOIN keeps all 28 claims and NULL-pads the 6 that never moved; WHERE p.id IS NULL keeps exactly those 6 — the stack reads 4937, 3562, 2794, 1756, 1295, 873, summing to 15217.00 — and ORDER BY dollars DESC LIMIT 1 hands the billing lead claim 24 at 4937.00. The finding is the contradiction: that stack includes a claim whose ledger status says 'paid' with zero rails, and excludes the open 6148.00 claim because a 4000.00 partial rail exists (19609 − 6148 + 1756 = 15217.00 — the ledger and the rails disagree by exactly the two claims that cross sides). The distractors encode the screen's classic failures: INNER deletes every unmatched claim and ships an empty result dressed as a clean close; IS NOT NULL flips the screen to the 22 settled claims; LIMIT 2 or 3 turns the single escalation into a list the meeting will argue about instead of act on. Population, polarity, cut — three decisions, one claim on the hook.",
    },
    {
      id: "cs-chewy-2",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The fulfillment clock census",
      brief:
        "Chewy-flavored case on the storefront db (orders = baskets; shipped_at = the fulfillment clock): the ops close needs a one-pass census of the clock, and the ops lead states the population rule before any SQL: 'fulfilled baskets live on the clock — in-window or late; pending and cancelled baskets have NO clock yet, and they get their own bucket — I will not have my backlog labeled late.' Probed facts: shipped_at is non-NULL for 82 of 103 baskets (52 delivered + 30 shipped); latency averages 2.98 days over those 82 with a 2-to-4 range; 57 of the 82 land inside the 3-day window and 25 sit at 4 days; the remaining 21 baskets (14 pending + 7 cancelled) carry no clock at all.",
      ask: "One pass, three buckets — in_window (3 days or less), late (fulfilled but over), not_yet (no clock) — with basket counts, biggest bucket first.",
      template:
        "SELECT CASE\n         WHEN JULIANDAY(shipped_at) - JULIANDAY(created_at) <= {1} THEN 'in_window'\n         WHEN {2} THEN 'late'\n         ELSE 'not_yet'\n       END AS bucket,\n       COUNT(*) AS baskets\nFROM orders\nGROUP BY bucket\nORDER BY baskets {3};",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the window threshold in days",
          noVerify: true,
          why: "The ops promise is 3 days, and latency days are whole numbers here (2, 3, or 4), so <= 3 tallies 57 in-window. A 2-day gate slashes the bucket to 27 and reads a promise nobody keeps; a 4-day gate reads 82 — a promise nobody misses is a promise nobody believes.",
        },
        {
          answer: "shipped_at IS NOT NULL",
          kind: "keyword",
          label: "the population guard on the late arm",
          why: "The 'late' arm must be gated on a clock existing: shipped_at IS NOT NULL keeps only fulfilled baskets in the late bucket. A truthy constant arm catches everything the first arm missed — 25 late plus all 21 clock-less baskets = 46 — and the backlog silently relabels itself 'late'.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The census leads with the biggest population: 57 in-window first. ASC would open the close on not_yet (21) and the meeting would start on the backlog wearing the headline, before anyone sees the 57-basket compliance base.",
        },
      ],
      distractors: ["2", "4", "shipped_at IS NULL", "1 = 1", "ASC"],
      walkthrough:
        "A clock census is a CASE whose arm order IS the population policy. The first arm computes JULIANDAY latency and catches the 57 baskets within 3 days; the second arm — shipped_at IS NOT NULL — catches the 25 fulfilled-but-over baskets; ELSE catches the 21 baskets with no clock (14 pending + 7 cancelled), which is data, not a bug. GROUP BY bucket folds the 103 rows into 57 / 25 / 21 and ORDER BY baskets DESC leads with the compliance base. The distractors encode the census's classic failures: a 2-day window shrinks in-window to 27 and swells late to 55 — a self-inflicted breach; a 4-day window reads 82 of 82 and the promise stops meaning anything; 'shipped_at IS NULL' as the late arm swaps the labels — 21 clock-less baskets read 'late' while the 25 genuinely late read 'not_yet', the same counts wearing the wrong names; a truthy '1 = 1' arm merges late and not_yet into 46 and the backlog disappears into the breach; ASC opens the deck on the smallest bucket. Threshold, guard, order — three decisions, one honest census.",
    },
    {
      id: "cs-chewy-3",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The trusted-vendor bench",
      brief:
        "Chewy-flavored case on the storefront db (suppliers = brand vendors, products = SKUs, order_items = scanned lines): the vendor review gates on the trusted bench — rating 4.5 and up — before any renewal conversation. The sourcing lead states the definitions first: 'revenue is scanned dollars, skus is distinct SKUs on the shelf, biggest revenue first.' Probed facts: the bench holds exactly 2 vendors — Nordic Gadgets AB (rating 4.6, 3 SKUs, 11130.25 scanned) and Alpine Audio GmbH (4.8, 2 SKUs, 4765.63) — while the full book spans 6 vendors and 34833.28, so the bench is 2 of 6 on rating, not on size; the top bench vendor alone carries 32% of all scanned revenue.",
      ask: "One query: the trusted bench (rating >= 4.5) with vendor name, rating, distinct SKU count, and scanned revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name,\n       s.rating,\n       COUNT(DISTINCT p.id) AS skus,\n       ROUND({1}(oi.quantity * oi.unit_price), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.rating >= {2}\nGROUP BY s.name\nORDER BY revenue {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the revenue fold",
          why: "Revenue is a fold over scanned lines: SUM(quantity * unit_price) per vendor. COUNT folds scan-line activity (43 and 40 lines) and AVG folds dollars-per-line (258.84 and 119.14) — neither is the revenue the scorecard budgets.",
        },
        {
          answer: "4.5",
          kind: "number",
          label: "the trusted-bench rating gate",
          noVerify: true,
          why: "The bench is a rating gate: >= 4.5 keeps Nordic (4.6) and Alpine (4.8) — exactly the probed 2-of-6 bench. A gate of 4 admits Midwest, Andes and Shenzhen (5 vendors); a gate of 4.8 keeps Alpine alone and drops the anchor vendor.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bench-first direction",
          why: "The review leads with the biggest bench revenue: Nordic's 11130.25. ASC opens on Alpine's 4765.63 and the sourcing call starts from the smaller name before anyone has seen the anchor spend.",
        },
      ],
      distractors: ["AVG", "COUNT", "4", "4.8", "ASC"],
      walkthrough:
        "A vendor bench is a three-table fold with one gate. The chain runs suppliers → products → order_items, revenue folds as SUM(quantity * unit_price) over scanned lines, and the rating gate keeps exactly 2 vendors: Nordic Gadgets AB (4.6, 3 SKUs, 11130.25) and Alpine Audio GmbH (4.8, 2 SKUs, 4765.63) — 2 of 6 on rating while the full book scans 34833.28, and the bench's anchor alone is 32% of it. ORDER BY revenue DESC leads with the anchor. The distractors encode the classic failures: AVG folds dollars-per-line (258.84 and 119.14 — a unit nobody budgets in); COUNT folds scan lines (43 and 40), mistaking activity for value; 4 admits Midwest, Andes and Shenzhen and the bench swells to 5 vendors that don't earn it; 4.8 keeps Alpine alone and the scorecard loses its biggest vendor; ASC opens the review on the smallest name. Join grain, gate, direction — three decisions, one defensible bench.",
    },
    {
      id: "cs-chewy-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month demand ledger",
      brief:
        "Chewy-flavored case on the storefront db (orders = baskets; created_at = the cadence clock): the growth board wants the demand ledger the way the cadence team reads it — each month's placed revenue with the PRIOR month's revenue beside it, so the board sees the step and not just the level. Probed facts: 14 month buckets run 2024-01 through 2025-02; 2024-01 opened at 3731.97 and 2024-02 stepped back to 3609.64; the book peaks at 9 baskets (2024-02 and 2024-09). Population rule, stated before any SQL: cancelled baskets stay in the ledger — these are placed dollars, not kept dollars.",
      ask: "Stage the 14-month census in a CTE, then show the first two months with the prior month's revenue in a prev_revenue column.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       revenue,\n       {1}(revenue) OVER ({2} BY month {3}) AS prev_revenue\nFROM monthly\nORDER BY month\nLIMIT {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month window",
          why: "prev_revenue is the PRIOR month's fold: LAG(revenue) OVER (ORDER BY month). LEAD would show January a next-month value as its prior — the delta column lies at every row, and the board funds the wrong month.",
        },
        {
          answer: "ORDER",
          kind: "keyword",
          label: "the window's sequence clause",
          why: "The window's sequence clause is ORDER BY month — LAG follows it row by row. GROUP inside OVER (…) is a syntax error, and without a sequence clause LAG has nothing to walk and the ledger cannot compile.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the ascending month walk",
          why: "Months walk ascending so LAG returns the immediately prior bucket and the first row is honestly NULL. DESC reverses the walk — LAG then reports the NEXT month, the same lie LEAD tells, with a plausible-looking 3609.64 beside January.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the two-month opening cut",
          noVerify: true,
          why: "The ask is the opening pair — January 2024 (3731.97 beside NULL) and February (3609.64 beside 3731.97). LIMIT 4 drags March and April into a two-month read and the board debates months nobody asked about.",
        },
      ],
      distractors: ["LEAD", "SUM", "GROUP", "DESC", "4"],
      walkthrough:
        "A month-over-month ledger is a staged census plus one window. The CTE folds 14 buckets of placed revenue — 2024-01 opens at 3731.97 — and LAG(revenue) OVER (ORDER BY month ASC) sets prev_revenue to the prior bucket, NULL on the first row because January 2024 has no prior, which is data, not a bug. LIMIT 2 shows the opening pair: 3731.97 beside NULL, then 3609.64 beside 3731.97 — the board reads the step, not just the level. The distractors encode the ledger's classic failures: LEAD reports the NEXT month on every row, handing January a fake 3609.64 prior; DESC reverses the walk so LAG silently becomes LEAD; SUM turns prev_revenue into a running total (7341.61 by February) wearing a prior-month name; GROUP breaks the frame syntax outright; LIMIT 4 drags March (2617.08) and April (2468.91) into a two-month ask. Stage, orient, cut — three decisions, one honest delta.",
    },
    {
      id: "cs-chewy-5",
      tier: "easy",
      topic: "s1",
      universe: "month-close",
      title: "The rail mix, stacked",
      brief:
        "Chewy-flavored case on the storefront db (payments = payment-rail movements, INTEGER cents): the close opens with the rail mix — card versus wire — stacked into one result the CFO reads top-down. Probed facts: 16 card movements settle 37364.00; 11 wire movements settle 32248.00; 27 rails total, all attached to program claims. The billing lead's rules are fixed: movements are a population COUNT, dollars are cents folded once at the edge (amount_cents / 100.0), each arm filters and folds its own rail, and the stack must lead with the bigger movement count.",
      ask: "Two arms stacked into one result with a rail label, movement count and dollars to 2 decimals, biggest movement count first.",
      template:
        "SELECT 'card' AS rail,\n       {1}(*) AS movements,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS dollars\nFROM payments\nWHERE method = 'card'\n{2}\nSELECT 'wire' AS rail,\n       COUNT(*) AS movements,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS dollars\nFROM payments\nWHERE method = {3}\nORDER BY movements {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the movement count fold",
          why: "Movements are a population count: COUNT(*) per rail arm — 16 card, 11 wire. SUM(*) is a wrong-arity error; the dollars fold is the SUM, the movement count is the COUNT, and swapping them swaps the units.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the arm-preserving seam",
          why: "The seam must preserve both arms: UNION ALL concatenates the card and wire rows untouched. INTERSECT empties the stack (no row is both rails) and EXCEPT keeps only card — either way a rail disappears from the close without an error.",
        },
        {
          answer: "'wire'",
          kind: "keyword",
          label: "the second arm's rail filter",
          why: "The second arm filters its own rail: method = 'wire' folds the 11 wire movements / 32248.00. 'card' would duplicate the card row — two identical rails double-reported in one ledger, and the mix reads 32 movements instead of 27.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "The stack leads with the bigger movement count: card (16) above wire (11). ASC opens on the smaller rail and the CFO reads the exception arm first, before the mix has established the base.",
        },
      ],
      distractors: ["SUM", "INTERSECT", "EXCEPT", "'card'", "ASC"],
      walkthrough:
        "A rail stack is two folds and one seam. Each arm filters its rail — card, then wire — and folds movements as COUNT(*) and dollars as ROUND(SUM(amount_cents) / 100.0, 2): 16 movements / 37364.00 over 11 / 32248.00, 27 rails total, all attached to program claims. UNION ALL is the seam that preserves both arms; ORDER BY movements DESC leads with the bigger rail. The distractors encode the close's classic failures: SUM(*) is a wrong-arity error — SUM folds a column, not a star; INTERSECT intersects the two arms into an empty set (no row is both card and wire); EXCEPT keeps only the card arm and the wire rail vanishes from the close; 'card' in the wire arm duplicates the card row — two identical rails, a ledger that double-reports; ASC leads with the smaller rail and the close opens on the exception. Filter, fold, seam, order — four decisions, one rail mix.",
    },
    {
      id: "cs-chewy-6",
      tier: "hard",
      topic: "t4",
      universe: "funnel",
      title: "The nine-basket cadence floor",
      brief:
        "Chewy-flavored case on the storefront db (orders = baskets, created_at = the cadence clock): the funnel review wants the peak cadence months — buckets that clear the nine-basket floor — to argue for forecast capacity. Probed facts: the month census reads 14 buckets from 2024-01 to 2025-02; exactly two months carry 9 baskets (2024-02 at 3609.64, 2024-09 at 3116.04); four months sit at 8, five at 7, three at 6. The bucket key must be year-safe — '%Y-%m', never bare '%m', or the two Januaries merge into one bucket and the cadence curve lies by collision.",
      ask: "Bucket baskets by month with STRFTIME, keep months with at least 9 baskets, oldest month first.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS baskets,\n       ROUND(SUM(total), 2) AS revenue\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {2}\nORDER BY month {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the year-safe bucket key",
          why: "The bucket key must be year-safe: '%Y-%m' separates 2024-01 from 2025-01. Bare '%m' merges the two Januaries into one 14-basket bucket and the cadence curve lies by collision; '%Y' collapses the book to two buckets.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the cadence floor",
          why: "The floor is the nine-basket bar the funnel review argues from: exactly 2024-02 and 2024-09 carry 9 baskets (3609.64 and 3116.04 revenue). A floor of 8 admits the four 8-basket months and the peak story dilutes to six rows.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first direction",
          why: "The deck reads the trend left to right: oldest peak month first, so ORDER BY month ASC. DESC hands the meeting the newest peak first and the cadence story runs backwards from the forecast it is meant to inform.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "8", "DESC"],
      walkthrough:
        "A cadence floor is a bucket key, a gate, and a direction. STRFTIME('%Y-%m', created_at) makes the year-safe key over 103 baskets; HAVING COUNT(*) >= 9 keeps exactly the peak months — 2024-02 (9 baskets, 3609.64) and 2024-09 (9, 3116.04); ORDER BY month ASC reads oldest first. The distractors encode the census's classic failures: '%m' drops the year and merges the two Januaries — 14 baskets under one key (5401.47 of revenue) and a curve that lies by collision; '%Y' collapses the book to two buckets (90 and 13 baskets); 8 lets the four 8-basket months through and the 'peak' story dilutes to six rows; DESC hands the deck its newest peak first and the trend reads backwards. Key, gate, direction — three decisions, one defensible floor.",
    },
  ],

  problems: [
    { slug: "combine-two-tables", why: "The pet-profile LEFT JOIN: baskets attached to household records where profile fields run NULL — the warm-up shape behind every personalization board. Curated fill." },
    { slug: "employees-with-missing-information", why: "Two-sided profile completeness — households missing names XOR missing contact data, the data-quality read before any nudge campaign ships. Curated fill." },
    { slug: "article-views-ii", why: "HAVING-gated census — content touched by enough households to matter, the reach floor behind the education-content calendar. Curated fill." },
    { slug: "classes-more-than-5-students", why: "The count-floor class filter — breed-class cohorts gated at a minimum size, the HAVING shape behind every segment the CRM ships. Curated fill." },
    { slug: "second-highest-salary", why: "The second-tier read via subquery — spend rank two without a window, the household-ladder question in its portable NOT-IN clothing. Curated fill." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Subquery-plus-HAVING gate — SKUs with enough re-order events to earn a reorder-point review, the heavy-tail screen in managerial clothing. Curated fill." },
    { slug: "game-play-analysis-i", why: "First-event pairing — each household's first basket beside its earliest activity, the adoption-to-first-autoship read in game-analytics clothing. Curated fill." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Trailing-window census — activity counts over the last 30 days with the endpoint handled explicitly, the cadence read behind every nudge window. Curated fill." },
    { slug: "top-travellers", why: "Join-aggregate leaderboard — households ranked by folded spend, the lifetime-value ladder that aims the retention team's week. Curated fill." },
    { slug: "the-number-of-employees-which-report-to-each-employee", why: "Join-then-count warm-up — SKUs per brand vendor folded through the catalog chain, the assortment-depth read before any brand review. Curated fill." },
    { slug: "biggest-single-number", why: "The singleton hunt via HAVING — households with exactly one basket, the one-off cohort the autoship motion exists to convert. Curated fill." },
    { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "The 3+ threshold census — household-SKU pairs that repeated three times, the loyal-pairing read behind refill bundles. Curated fill." },
    { slug: "product-sales-analysis-ii", why: "SKU demand fold — units and revenue per product across the scan lines, the catalog warm-up before any replenishment forecast. Curated fill." },
    { slug: "find-customer-referee", why: "NULL-safe filtering on a referral column — the profile field that NULLs legitimately, and the = filter that silently deletes those households from the denominator. Curated fill." },
    { slug: "find-users-with-high-token-usage", why: "Heavy-user screen with a threshold — households whose order volume crosses the ops ceiling, the pharmacy-capacity read in usage clothing. Curated fill." },
    { slug: "second-day-confirmation", why: "Day-2 return test — households back the day after their first order, the D1 retention shape that autoship forecasts are calibrated against. Curated fill." },
    { slug: "project-employees-ii", why: "Allocation fold — scanning effort spread across a household's SKU programs, the weighted-demand read behind replenishment forecasts. Curated fill." },
    { slug: "top-earners", why: "Spend leaderboard with ties handled explicitly — the household-ladder read that aims the autoship nudge week, tiebreak included. Curated fill." },
    { slug: "sales-analysis-iii", why: "SKUs never scanned — the catalog dead-weight screen; on this book every SKU has moved, so the honest answer is an empty set and the analyst says so. Curated fill." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax household — the 24-basket power household behind the loyalty-tier design, argmax with a stated tie rule. Curated fill." },
    { slug: "the-most-recent-three-orders", why: "Trailing-window pick — each household's last three baskets for the next-cycle forecast, a per-group top-N. Curated fill." },
    { slug: "maximum-transaction-each-day", why: "Daily peak fold — peak basket value per day for the demand-smoothing deck, MAX with the population named. Curated fill." },
    { slug: "active-users", why: "Consecutive-activity reads — households active in enough months to keep their cadence, the stickiness screen behind the churn forecast. Curated fill." },
    { slug: "game-play-analysis-iv", why: "First-event retention — households returning the day after adoption, the D1 read autoship forecasts calibrate against. Curated fill." },
    { slug: "market-analysis-i", why: "Buyer-vs-registered census — households with baskets beside those without, the adoption-gap anti-join in market clothing. Curated fill." },
    { slug: "students-with-invalid-departments", why: "Referential-integrity screen — baskets pointing at households that don't resolve, the pre-close hygiene check. Curated fill." },
    { slug: "count-student-number-in-departments", why: "LEFT JOIN census with zero rows kept — brand vendors with no scans stay on the scorecard at zero, never dropped. Curated fill." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Role-flip census — households as claim payers vs rail receivers, the two-sided book read the finance close runs. Curated fill." },
    { slug: "daily-leads-and-partners", why: "Distinct-per-day pairs — daily claim counts by rail and partner, the close's daily grain before any monthly fold. Curated fill." },
    { slug: "find-total-time-spent-by-each-employee", why: "Duration fold — engagement time per household folded from paired events, the session-clock read behind CS staffing. Curated fill." },
    { slug: "ratings-histogram", why: "Bucket census with zero buckets visible — review-score histogram where empty arms still show, the NPS wall's shape. Curated fill." },
    { slug: "percentage-of-users-attended-a-contest", why: "Rate with the .0 guard — share of households touching a category, integer-division-proof by construction. Curated fill." },
  ],
};
