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
  ],

  dayInLife: [
    "**08:30 —** The day opens on the autoship board, and the first query is the household reconciliation: does the status census tie to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** — and does the repeat census still read **14 of 16 households with 2+ baskets**? The clock tile is next: **2.98 days average over the 82 fulfilled baskets**, and the analyst's eye goes to the pending pile, because 14 baskets with no fulfillment scan is tomorrow's missed-cadence story. *A pending basket is 'not yet', not 'late' — the population note rides in the subtitle or the forecast inherits a backlog it can't name.*",
    "**11:00 —** Mid-morning is the deep-work block. The billing lead's ask lands: reconcile the claims ledger against the payment rails — the anti-join says **6 claims worth 15217.00 never moved a rail**, while the open-status ledger names a different 6 worth 19609, and the difference is the story: the partial rail on one claim (4000.00 of 6148.00) keeps it out of the anti-join, while a 'paid'-status claim worth **1756.00 has zero rails** and lands in it. The analyst writes both numbers side by side, then files the contradiction: *ledger status is an opinion, the rail is a fact, and a paid claim with no money movement is a ticket, not a rounding error.*",
    "**15:30 —** The afternoon tilts to the retention review. The CRM lead wants the week's one-pass clock census — **57 fulfilled baskets inside the window, 25 late, 21 with no clock at all** — and the heavy-household fold beside it: spenders over 3000 lifetime dollars carry **63.5% of demand**, so the autoship nudge list writes itself from the tier floor down. The close is the ship-with-query ritual: every figure leaves with its SQL attached, rails folded as `amount_cents / 100.0`, split rails (five claims paying in two movements) flagged for the finance handoff. *In a retention business the next shift inherits your denominators — write them down or the forecast writes its own.*",
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
  ],
};
