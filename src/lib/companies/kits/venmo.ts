// Venmo — Wave-11 (Task 102), fintech domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Social-P2P SQL on a SPLIT-graph angle (distinct from wise's transfer-leg/corridor framing and remitly's
// remittance-funnel framing): the storefront db read as a split-the-bill sandbox — customers are P2P accounts
// (region = market bucket), orders are payment flows (created_at = request raised, shipped_at = settlement
// stamp; the 2.98-day latency = request-to-settle; delivered = settled to balance 52, shipped = settling 30,
// pending = parked in balance float 14, cancelled = declined/expired requests 7), order_items are split legs
// (quantity = payers on the leg, unit_price = per-payer amount), products = payment purposes/SKUs, suppliers =
// banking/network partners per market, invoices = merchant-profile statements, payments = rails (card = instant
// debit, wire = bank transfer), expenses = chargeback/opex, ledger_entries = GL. Finance tables store INTEGER
// cents — dollar read = amount_cents/100.0; orders.total and order_items.unit_price are REAL dollars.
// Pool provenance: company-pools.md carries NO Venmo section — 0 tagged rows — so all 10 topic slug sets and
// all 32 problems are theme-curated from the theme menu's sql rows (no w*/d*/f*-initial rows) and say so in
// brief P4. Case briefs quote probed figures from scripts/company-facts.md (incl. the wave-8+9 canonicalized
// cells); probe-derived cells declared here: payer-band split (solo legs 93/93 slots vs split legs 158/405),
// payer-quantity ladder 93x1/69x2/89x3, legs-per-flow 26/29/25/23, per-market split-flow counts 37/30/17/2
// (= 86 of 103), per-fold rail buckets card-only 11/24,894.00, wire-only 6/21,926.00, two-leg 5/24,940.00 with
// roster 'card,wire'. Every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: venmo is NOT yet in registry COMPANY_META (wave-11 unwired).
// Wire id "venmo", domainId "fintech", name "Venmo",
// tagline "Split-the-bill SQL: split legs, balance float, feed engagement", accent "text-blue-200"
// to match this header exactly.

import type { CompanyKit } from "../types";

export const venmoKit: CompanyKit = {
  id: "venmo",
  domainId: "fintech",
  name: "Venmo",
  tagline: "Split-the-bill SQL: split legs, balance float, feed engagement",
  accent: "text-blue-200",

  brief: [
    "**Venmo** is the social payments app — one request, many legs, and a feed where the split itself is the product. The analytics reality is a graph, not a ledger: a Friday dinner is one request that fans out into per-payer legs, a rent split recurs monthly, and a meaningful share of money sits parked in balance float between request and settlement. This kit maps the storefront db onto that world: the 16 customers rows are P2P accounts, the 103 orders are payment flows worth 34,833.28, and the 251 order_items rows are split legs — quantity = payers on the leg, unit_price = the per-payer amount, for **498 payer slots** in total. The status map is fixed: delivered = {emerald:settled to balance} (52, 50.5%), shipped = settling (30, 29.1%) with shipped_at as the settlement stamp, pending = parked in {amber:balance float} (14, 13.6%), cancelled = {rose:declined or expired} (7, 6.8%).",
    "The data org splits into growth (feed and graph analytics), payments ops (rails and float), and a small finance pod reading merchant-profile statements — all three walk the same flow spine at different grains. The graph heartbeat is the payer-band fold: **93 legs ride solo** (one payer, 93 slots) while **158 legs are true splits** carrying 405 of the 498 payer slots — 62.9% of legs, 81.3% of the people, and 86 of 103 flows touch at least one multi-payer leg. The clock is the second story: a flow opens at created_at and settles at shipped_at — **82 of 103 flows** carry the stamp, averaging **2.98 days** request-to-settle with a 2–4 spread, while the 14 float rows have none (a population definition, not a cleanup job). Money sits one layer down: statements and rail legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator with a graph accent. A typical loop opens with a **two-grain flow census** — EU runs 45 flows from just 8 accounts (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into the split band where the interviewer asks what `SUM(quantity)` actually counts (*'is that legs or people?'* — 251 versus 498, the whole test), then into the request ladder where the top accounts run 24, 17, 14, 13, 5 flows and three accounts tie at 4, making rank semantics a policy call about peer accounts. Rails close the loop: {sky:instant debit} (card) carries **16 legs / 37,364.00** against bank transfer (wire) 11 / 32,248.00 — and five merchant statements settle on BOTH rails, which is where the feed's split logic meets money.",
    "Preparation strategy: the pools file carries no Venmo section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: payer-band CASE folds, split-graph conditional counts, co-split pair queries, request-to-settle clocks, rank ladders with ties, and the cents-safe statement spine. Do the topics in order, then run all six case studies on the live storefront db, spaced across a week rather than one sitting: the {violet:payer-band census} the growth board opens with, the {emerald:rail-roster walk} payments ops reads at every close, the payer-slot month walk, the one-pass fate census, the never-collected dunning queue, and the request ladder with its tie-block policy call. The bar to clear: *state the population and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:20 —** The day starts with the float-and-feed refresh. A growth analyst opens the engagement dashboard before standup: did overnight requests land, did any settle overnight, does the one-pass fate census reconcile — 52 settled + 30 settling + 14 float + 7 declined = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the **2.98-day** request-to-settle average drifts — the US already runs 3.07 against APAC's 2.93 — the payments-ops nudge queue gets pulled before the feed report ships, and the 14 {amber:float} rows get aged, because a request that sits unpaid is a friend who stops asking.",
    "**11:40 —** Midday is the split-graph deep-dive. Growth wants the payer-band re-cut — **93 solo legs against 158 split legs**, 405 of 498 payer slots riding multi-payer requests — beside the split-flow share (**86 of 103 flows** touch at least one multi-payer leg); a market VP wants flows per account beside account counts (EU 45-from-8 versus US 19-from-2); the feed pod wants the co-split pairs — *which accounts keep landing on the same request*. Each ask is a join, a conditional aggregate and one judgment call about quantities. The analyst writes the query twice — *once to answer, once with 'quantity = payers, not legs' spelled out so the number survives the growth-review argument*.",
    "**16:05 —** The afternoon tilts toward money. The merchant-statement roster refreshes first — **6 no-leg statements worth 15,217.00** — before dunning goes out; the roster is walked line by line: a paid-status statement with zero rail legs (#28, 1,756.00 — a status that lies), a void statement that still shows a {sky:card} debit leg (#11, 925.00), and the five split-rail receipts (#1, 5, 12, 19, 22) where instant debit and bank transfer share one statement. The chargeback/opex register (rent-heavy at 16,800.00 of the book) goes out beside it, and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Split-flow coverage", what: "Share of payment flows touching at least one multi-payer leg: 86 of 103 (83.5%), split per market as EU 37, APAC 30, US 17, LATAM 2. The engagement headline — the feed exists because one request fans out, and this is the share of the graph that actually fans out." },
    { name: "Payer-band mix", what: "93 solo legs (93 payer slots) against 158 split legs (405 slots) across 251 legs and 498 payer slots total. One CASE fold — quantity = 1 versus quantity >= 2 — and the first chart the growth board re-cuts every week, because splits are the product." },
    { name: "Request-to-settle clock", what: "Flow open (created_at) to settlement stamp (shipped_at) over stamped flows only: 82 of 103, 2.98-day average, range 2–4. The population definition ships with the number — the 14 float rows have no stamp and no cycle yet." },
    { name: "Settle clock by market", what: "Stamped flows and average settle days per region: LATAM 2 at 3.5, US 15 at 3.07, EU 36 at 2.94, APAC 29 at 2.93. The drift map that decides where the nudge queue gets pulled before the feed report ships." },
    { name: "Balance float census", what: "14 pending flows parked between request and settlement — EU 6, APAC 5, US 3, LATAM 0 — against 52 settled, 30 settling and 7 declined, reconciling to 103 by construction. Float is stored value waiting to happen; its census is a conditional count, and its aging is a dated filter." },
    { name: "Rail mix", what: "Instant debit (card) 16 legs / 37,364.00 against bank transfer (wire) 11 legs / 32,248.00, with five merchant statements settling on both rails. The rails read decides where instant-transfer fee revenue lives and where settlement risk concentrates." },
    { name: "Statement coverage", what: "Merchant-profile statements versus the legs that settled them: 21 exact (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against a 28.4-day average settlement, fastest 13, slowest 84. The AR anti-join finance refreshes every close." },
    { name: "Feed-graph intensity", what: "Flows per account: EU 45-from-8 (5.6) versus US 19-from-2 (9.5); the request ladder runs 24, 17, 14, 13, 5 with a three-way tie at 4; 63.5% of the book sits with accounts over 3,000 lifetime. One lost power account moves the graph." },
  ],

  topics: [
    {
      name: "Payer-band CASE folds",
      why: "The split band is Venmo's first-class citizen: every leg is quantity = 1 (solo) or quantity >= 2 (a split), and the growth board's headline chart is that fold — 93 solo legs against 158 split legs. The arms must be exhaustive and ordered, because a hole in the CASE is a hole in the engagement story, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-special-bonus", "type-of-triangle", "evaluate-boolean-expression", "credit-utilization-bands", "average-selling-price"],
    },
    {
      name: "Split-graph conditional counts",
      why: "'Who paid what' is a conditional count: COUNT(DISTINCT CASE WHEN quantity >= 2 THEN order_id END) turns legs into split-touching flows — 86 of 103. The trap is grain: COUNT(*) counts legs (251), COUNT(DISTINCT o.id) counts flows (103), SUM(quantity) counts people (498) — three honest numbers that answer three different questions, and the interviewer wants you to say which one you are shipping.",
      slugs: ["number-of-rich-customers", "unique-orders-and-customers-per-month", "actors-and-directors-who-cooperated-at-least-three-times", "customer-who-visited-but-did-not-transact", "active-users"],
    },
    {
      name: "Co-split pair graphs",
      why: "The social graph is a self-join: which accounts keep landing on the same request, which pairs split together twice or more. Venmo's feed ranking and its friend-suggestion model both start from co-occurrence counts over pairs, and symmetric-pair canonicalization (a,b) versus (b,a) is the correctness argument the panel listens for.",
      slugs: ["number-of-calls-between-two-persons", "most-common-course-pairs", "strong-friendship", "dau-wau-stickiness"],
    },
    {
      name: "Request-to-settle clocks",
      why: "Every ops screen opens with the clock: request raised at created_at, settlement stamped at shipped_at, delta averaged over stamped rows only — 82 of 103, 2.98 days. Each stage is a conditional count or average over a timestamp, and the first interview question is what the denominator holds — the 14 float rows have no stamp by definition, not by error.",
      slugs: ["average-time-of-process-per-machine", "immediate-food-delivery-ii", "users-with-two-purchases-within-seven-days", "convert-date-format"],
    },
    {
      name: "Request ladders & rank ties",
      why: "The power-account ladder runs 24, 17, 14, 13, 5 flows and then THREE accounts tie at 4 — RANK, DENSE_RANK and ROW_NUMBER disagree about shared rungs and gaps, and on a social feed a leaderboard policy about ties is a product statement. Venmo's own growth reviews publish the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Float & fate censuses",
      why: "The ops board gets settled, settling, float and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin; four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "daily-balance-interest", "balance-rollforward", "budget-pacing"],
    },
    {
      name: "Rails & statement reads",
      why: "Money lives one layer down: 28 merchant statements against 27 rail legs, card = instant debit (16 / 37,364.00) and wire = bank transfer (11 / 32,248.00), INTEGER cents everywhere. Coverage is one CASE away — 21 exact, 1 partial, 6 none — and the rails matter because five statements settle on both rails at once.",
      slugs: ["monthly-transactions-ii", "bank-account-summary-ii", "transaction-velocity", "ar-aging-schedule", "deferred-revenue", "queries-quality-and-percentage"],
    },
    {
      name: "Month walks & feed trends",
      why: "The 14-month flow spine (2024-01 to 2025-02) is the engagement call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Declined requests concentrate in July and November, 2 each of 7.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "count-the-number-of-experiments", "monthly-transactions-i", "consecutive-numbers"],
    },
    {
      name: "Nested staging & gates",
      why: "Screens escalate into staging: fold per-account flow counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted; growth targeting is exactly 'which accounts run above the platform's cadence'.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary", "amount-anomaly-zscore"],
    },
    {
      name: "Receipt rosters & GROUP_CONCAT",
      why: "The feed receipt is a string fold: one row per flow or statement, every leg's rail or payer count folded into one readable cell — GROUP_CONCAT is how 'card,wire' prints on a split-rail statement. Ordering inside the fold, the NULL-empty-set behavior and the COALESCE label are the three details that separate a real roster from a broken one.",
      slugs: ["group-sold-products-by-the-date", "concatenate-the-name-and-the-profession", "the-pads", "count-occurrences-in-text"],
    },
  ],

  theory: [
    {
      id: "venmo-t1",
      q: "Your feed report joins P2P accounts to payment flows and split legs. When do you INNER and when do you LEFT — and what silently breaks if you filter a flow column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A split-graph report joins flows to legs to accounts: a flow with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-account report must be LEFT from accounts: the accounts with no flows ARE the answer, arriving with NULL flow columns. On this db both anti-joins return a confident zero — all 16 accounts appear in the flow table and all 103 flows carry legs — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how dormant-account reports die in review. The classic break: filtering status = 'pending' in WHERE after a LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query.",
      tag: "joins",
    },
    {
      id: "venmo-t2",
      q: "The request ladder runs 24, 17, 14, 13, 5 flows, then THREE accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the three-way tie consumes ranks 6 through 8 and the next distinct count (3) lands on 9, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the growth pod's attention first. There is a second layer Venmo candidates get asked: the same tie problem shows up inside a running balance walk — SUM OVER (ORDER BY created_at) uses a default RANGE frame, so flows tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "venmo-t3",
      q: "The split census shows 251 legs, 103 flows and 498 payer slots. How do three honest counts come from one join — and which one does the business actually mean?",
      a: "They are three grains of the same join, and the fan-out is the whole lesson. COUNT(*) after the legs join counts leg rows — 251. COUNT(DISTINCT o.id) folds repeats back to flows — 103. SUM(oi.quantity) counts payer slots, because quantity IS the payer count on a leg — 498. None is wrong: legs measure split complexity, flows measure requests, payer slots measure people. The ratio — 2.44 legs per flow, 1.98 payers per leg — is the graph-intensity read that decides whether growth is broadening or deepening. The trap that catches candidates is a fourth grain: join invoices for merchant statements and COUNT(*) silently counts statements, not flows — 28 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and on a split-graph product it is the difference between '251 legs' and '498 people' — a factor of two the CFO will catch.",
      tag: "aggregation",
    },
    {
      id: "venmo-t4",
      q: "shipped_at is NULL until a flow settles — the 14 float rows have none. What is your policy for the settle-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped flows have a settle time, so the report measures request-to-settlement for the 82 of 103 flows that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL flows returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 float plus 7 declined rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for float that has not moved, and it poisons the 2.98 baseline every market drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Venmo reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "venmo-t5",
      q: "The growth review wants split flows per market for markets carrying at least ten flows. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The band rule is a row-level fact — the CASE arm quantity >= 2 classifies each leg before any fold, in the SELECT or a staging CTE; putting a band label in WHERE after GROUP BY is impossible because the label no longer exists per row. The ten-flow floor is a group-level fact — HAVING COUNT(DISTINCT o.id) >= 10 after GROUP BY; putting it in WHERE errors because the count does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an engagement line and an error. One more placement rule Venmo screens love: the percentage — 100.0 * SUM(CASE WHEN quantity >= 2 THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the split share truncates toward zero; on this db it is the difference between 62.9 and a displayed 0. The strong answer places every filter by asking: is this a fact about one leg, or about a market?",
      tag: "pipeline",
    },
    {
      id: "venmo-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 flows always produce a mean (6.4375 flows per account, 6.44 rounded — exactly four accounts clear it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each flow to ITS account's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when an account's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole feed report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "venmo-t7",
      q: "The engagement trend buckets flows by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the engagement trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's requests, and month-end is exactly when dinner splits land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is engagement discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "venmo-t8",
      q: "Finance says a merchant statement is 'paid' but the rails table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero rail legs: a status that lies, which is why rail rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a rail leg (this db has one, #11 at 925.00 on the card roster) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The split-rail receipts are the third fixture: five statements (#1, 5, 12, 19, 22) settle on BOTH card and wire — GROUP_CONCAT(method) prints 'card,wire' and any census that assumes one rail per statement miscounts them. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "venmo-t9",
      q: "One join, three counts: 251 legs, 103 flows, 498 payer slots. Write the query that prints all three beside each other — and defend which one the feed report ships.",
      a: "SELECT COUNT(*) AS legs, COUNT(DISTINCT o.id) AS flows, SUM(oi.quantity) AS payer_slots FROM orders o JOIN order_items oi ON oi.order_id = o.id — one scan, three grains, and the fan-out (2.44 legs per flow, 1.98 payers per leg) reads right off the row. The feed report ships payer slots when the story is people and legs when the story is complexity, and it says which in the title. The trap is a fourth grain sneaking in: join invoices and COUNT(*) starts counting 28 statements, not flows. And the per-market version must dedupe — COUNT(DISTINCT o.id) per region — or a flow with four legs counts four times and the market census stops footing to 103.",
      tag: "groupby",
    },
    {
      id: "venmo-t10",
      q: "The close needs two populations stacked: never-collected statements and split-rail statements. UNION, UNION ALL, or EXCEPT — which tool for which job, and what is the correctness argument?",
      a: "EXCEPT answers the subtraction: statements with rail legs EXCEPT statements settled by card leaves the wire-only book, and EXCEPT (SELECT … never-collected) FROM (SELECT … all statements) is the wrong direction — set order matters and the panel watches you get it right. UNION ALL stacks disjoint populations for the packet — never-collected beside split-rail — and is safe exactly because the branches partition the book; write the WHY-no-duplicates comment anyway. Bare UNION is the hazard: it dedups whole rows silently, and two branches printing identical rows (same statement id, same dollars) collapse into one with no error — a statement vanishes from the close. The rule: EXCEPT for subtraction, UNION ALL for stacking, bare UNION only when dedup is the requirement — and the comment is the correctness argument either way.",
      tag: "sets",
    },
    {
      id: "venmo-t11",
      q: "A staging filter reads WHERE method = 'CARD' and the instant-debit rail reads empty. The rails desk swears the rail exists. What is going on?",
      a: "Case sensitivity. SQLite's = compares strings byte-by-byte — no default case folding — and payments.method stores lowercase literals: 'card' and 'wire'. 'CARD' matches nothing, the rail reads zero legs, and the report prints a bank-transfer-only book while running clean. The same trap hides in IN lists and CASE arms — an arm keyed on 'Wire' is dead code that silently routes every instant-debit leg to ELSE. LIKE is case-INsensitive for ASCII by default, so method LIKE 'CARD%' matches 'card' — which makes the two predicates disagree about case and the mismatch its own bug. Normalize once (LOWER(method) = 'card' or a literal contract), then use exact lowercase everywhere and prove the rail census still foots to 27 legs.",
      tag: "casing",
    },
    {
      id: "venmo-t12",
      q: "Merchant statements carry numbers like 'INV-2024-001'. The close pack wants the issue year beside every statement. How do you extract it — and what makes the slice safe or dangerous?",
      a: "SUBSTR(i.number, 5, 4) reads the four characters after the fixed 'INV-' prefix, and CAST(SUBSTR(i.number, 5, 4) AS INTEGER) = 2024 if arithmetic follows. The safety argument is the format contract: the prefix is fixed-width, so a positional slice is honest — the moment the contract drifts ('INV2024-1', a two-letter prefix), the slice returns garbage with no error, which is why a guard (number LIKE 'INV-____-%') belongs in the same query. INSTR(i.number, '-') generalizes across prefix widths at the cost of readability. Either way, state the contract out loud: text slicing is only as safe as the format it assumes, and the guard is what turns an assumption into a check.",
      tag: "strings",
    },
    {
      id: "venmo-t13",
      q: "The fan-out join — orders to order_items — runs on every feed report. What index carries it, and what does EXPLAIN QUERY PLAN tell you to expect?",
      a: "order_items(order_id) is the index that matters: each of the 103 flows probes its legs through it instead of scanning 251 rows per flow, and because the probe reads only order_id and row id, the index nearly covers the join. The statement spine wants payments(invoice_id) the same way — the anti-join and the roster walk both probe legs per statement. On this db the tables are small, so the plan may show scans either way; the interview answer is the SHAPE: a one-to-many join keyed on the fan-out column, probed per parent row, is the canonical index case — and naming the expected plan (SCAN orders; SEARCH order_items USING INDEX) is what separates an engineer from a guesser. The second-order point: the index also orders by order_id, which is why GROUP BY order_id folds often come out pre-sorted — a convenience, never a contract.",
      tag: "indexes",
    },
    {
      id: "venmo-t14",
      q: "The feed receipt folds a statement's rails into one cell — 'card,wire' on the split-rail receipts. How does GROUP_CONCAT behave, and what three details separate a real roster from a broken one?",
      a: "GROUP_CONCAT(p.method) walks each statement's leg rows and joins the values with a comma — 'card,wire' on all five split-rail receipts (#1, 5, 12, 19, 22). Detail one: ordering — without an ORDER BY inside the aggregate the list order is scan order, so pin it (GROUP_CONCAT(p.method ORDER BY p.method)) or the roster reshuffles after maintenance. Detail two: the empty set — GROUP_CONCAT over zero legs returns NULL, not an empty string, so the 6 never-collected statements print NULL until COALESCE(GROUP_CONCAT(…), 'no rails') names them. Detail three: the grain — GROUP_CONCAT outside a GROUP BY folds the whole result into one cell; with GROUP BY i.id it folds per statement, which is the roster. A fold this lossy belongs on the presentation edge — the reconciliation layer still counts 27 legs, 28 statements, and the roster never gets to change those numbers.",
      tag: "groupby",
    },
    {
      id: "venmo-t15",
      q: "The float report walks each account's parked value in request order. What does PARTITION BY buy, and what does the wrong frame do to the walk?",
      a: "PARTITION BY customer_id restarts the cumulative per account: SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at) is each account's own float walk, which is what the balance view means. Drop the partition and one cumulative runs across all 103 flows — account 2's row prints a number polluted by account 1's float, a plausible total that reconciles to nothing. The frame rides the same choice: ORDER BY inside OVER defaults to RANGE, so flows tied on the same created_at second enter the cumulative together — at flow grain that happens, and ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the strict per-flow walk if the balance must move one request at a time. Partition, order, frame — say all three out loud; that triple is the walk's semantics, and a reviewer who hears it hears an engineer.",
      tag: "windows",
    },
    {
      id: "venmo-t16",
      q: "Request-to-settle latency is created_at to shipped_at in days. Walk me through the timestamp math — and where TEXT columns try to hurt you.",
      a: "JULIANDAY(shipped_at) - JULIANDAY(created_at) gives fractional days — the honest clock — and ROUND(…, 2) is display, never storage. On this db the stamped population is 82 of 103 flows averaging 2.98 days in a 2-to-4 spread, and the market drift map (US 3.07 against APAC's 2.93, LATAM's 3.5 on just 2 flows) reads off the same expression with a GROUP BY region. The TEXT trap: these columns are ISO-8601 strings that compare correctly lexicographically — half-open windows (created_at >= '2024-01-01' AND created_at < '2024-04-01') work — but arithmetic needs JULIANDAY first, and a non-ISO format would produce silent NULLs instead of errors. Subtracting the raw strings evaluates to integer-day luck on some rows and NULL on others — that is the answer to never give. Bucket with STRFTIME, measure with JULIANDAY, never mix the two in one expression.",
      tag: "dates",
    },
    {
      id: "venmo-t17",
      q: "The 14 float flows have no shipped_at stamp, and a draft report IFNULLs their latency to zero to 'complete' the settle-time picture. Defend or kill the fix.",
      a: "Kill it. IFNULL(JULIANDAY(shipped_at) - JULIANDAY(created_at), 0) invents same-day settlement for float that has not moved: fourteen fake zero-day cycles drag the 2.98-day baseline down to roughly 2.37 and every market drift alert keyed to that baseline fires wrong. The honest shapes: aggregate over the stamped population only — WHERE shipped_at IS NOT NULL, 82 of 103, stated in the title — or split the report into stamped latency beside a float census (14 rows, EU 6 / APAC 5 / US 3 / LATAM 0) with aging on created_at instead. The mechanics matter too: AVG already ignores NULLs, so the no-filter version silently returns the stamped average over a shrunken population — a real number wearing the wrong name. Float is 'not yet', not 'zero days'; a report that blurs that line is the one a Venmo reviewer rejects.",
      tag: "nulls",
    },
    {
      id: "venmo-t18",
      q: "Growth wants accounts that have split at least once. Compare EXISTS, IN and the HAVING gate — which do you ship and why?",
      a: "Two questions, two tools. 'Accounts with at least one multi-payer leg' is a HAVING gate over the fan-out: join legs, GROUP BY account, HAVING SUM(CASE WHEN quantity >= 2 THEN 1 ELSE 0 END) >= 1 — the fold carries the band logic. 'Accounts that appear on any request at all' is an existence test: EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) — short-circuits on the first match, reads like the business question, immune to NULLs. The NOT IN twin is the trap: one NULL customer_id in the subquery list turns every comparison UNKNOWN and the split-account list silently empties — the clean core db hides the bug, staging tables ship it. Ship EXISTS or the HAVING gate, state the empty-inner and NULL behavior unprompted, and prove the census: 86 of 103 flows touch a multi-payer leg, and every one of the 16 accounts appears in the flow book — a confident zero you verified, not assumed.",
      tag: "subqueries",
    },
    {
      id: "venmo-t19",
      q: "The split band averages 2.6 payers per leg, solo 1.0. Why is AVG(quantity) per band not the same as SUM(quantity)/COUNT(*) — and when does the difference bite?",
      a: "On integers they coincide — AVG is defined as the sum over the count, so 405/158 and AVG(quantity) over the split band both read 2.56, rounding to 2.6. The distinction the panel wants is weighting one level up: the average payers per FLOW is not the average per LEG (498 slots over 103 flows is 4.83 against 1.98 per leg), and an average of per-market averages is not the platform average when markets carry different flow counts. The bite comes from the denominator: quoting '2.6 payers per leg' as '2.6 payers per flow' overstates nothing — it is simply a different metric — but quoting per-leg where the board asked per-flow is the factor-of-two-class error the CFO catches. State the unit in the column name: avg_payers_per_leg beside payers_per_flow, and both numbers survive review.",
      tag: "aggregation",
    },
    {
      id: "venmo-t20",
      q: "Which accounts keep landing on the same request — the co-split pair graph. What join shape answers it, and what does the inequality in the ON clause buy?",
      a: "A self-join over the fan-out, staged first: WITH legs AS (SELECT o.customer_id AS account, oi.order_id AS flow FROM orders o JOIN order_items oi ON oi.order_id = o.id). Then legs a JOIN legs b ON a.flow = b.flow AND a.account < b.account — the strict less-than canonicalizes the pair: each duo appears once as (a, b), never as (b, a), and no account pairs with itself. Without the inequality you double-count every pair and add self-pairs, and the co-split census inflates by construction. Fold with COUNT(DISTINCT a.flow) — pairs that shared more than one request rank above one-time overlaps, which is the friend-suggestion signal. And dedupe before pairing if an account can appear twice on one flow (a leg with the same payer twice is a data defect, but the query should not multiply it). 'One row per pair per flow' is the grain sentence that earns the callback.",
      tag: "joins",
    },
    {
      id: "venmo-t21",
      q: "Close checklist: prove no merchant statement number is duplicated. Write the check and defend what an empty result means.",
      a: "GROUP BY the natural key and gate on the count: SELECT number, COUNT(*) FROM invoices GROUP BY number HAVING COUNT(*) > 1 — duplicates print rows, a clean book prints nothing. The interview point: the empty result is the PASS. The analyst who reads emptiness as breakage reruns without the HAVING and prints the whole book — the same data in a different shirt — instead of pairing the check with its population (COUNT(*) = 28 statements scanned) so the packet proves the check ran over the full book and not an empty staging slice that vacuously passed. The same shape guards every natural key on this desk: statement numbers, flow ids, ledger entry pairs. State the population, then let the zero be the finding — that is close culture.",
      tag: "quality",
    },
    {
      id: "venmo-t22",
      q: "ORDER BY payer_slots DESC LIMIT 5 — what does LIMIT actually cut, and why is the top-5 not a guarantee?",
      a: "LIMIT runs last — after WHERE, GROUP BY, HAVING and ORDER BY — and truncates the final result set; it does not pick 'the biggest five' in any semantic sense. On ties it is nondeterministic: two accounts at 4 flows and a LIMIT that cuts inside the tie block returns an arbitrary member, and a different one after a plan change or vacuum. The defensible shapes: a named tie-breaker (ORDER BY payer_slots DESC, lifetime DESC, id) written into the query and the deck, or RANK() OVER (ORDER BY payer_slots DESC) keeping every tied row and letting the policy say who ships. 'The dashboard's top-5 changed overnight' is a tie problem, not a mystery — and the growth board's leaderboard policy exists precisely because LIMIT alone cannot make that call.",
      tag: "pipeline",
    },
    {
      id: "venmo-t23",
      q: "The ops board wants settled, settling, float and declined in ONE scan. Show the FILTER form, the portable twin, and the identity that proves the scan is right.",
      a: "One pass, four branches: COUNT(*) FILTER (WHERE status = 'delivered') for settled 52, the same for 'shipped' 30, 'pending' 14, 'cancelled' 7 — each aggregate carries a private WHERE and the 103-row scan happens once. The portable twin is SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) for engines without FILTER. The correctness argument is the reconciliation identity: 52 + 30 + 14 + 7 = 103 = COUNT(*), and if a fifth status ever appears the identity breaks loudly instead of the census silently undercounting — exactly what you want from a number the ops board opens with. Four sequential queries are four scans, four chances for the status list to drift, and no identity to catch it. One scan, one COUNT(*), branches that must foot — that is the whole pattern.",
      tag: "groupby",
    },
    {
      id: "venmo-t24",
      q: "The growth board wants each market's share of payer slots beside its slot count. Build it with a window — and defend why not with a self-join.",
      a: "Percent of total is a window one-liner: 100.0 * SUM(oi.quantity) OVER () / SUM(oi.quantity) OVER (PARTITION BY c.region) beside the per-market fold — OVER () is the grand total (498 slots), OVER (PARTITION BY …) the local one, and the ratio is the share with no second pass. The 100.0 sits before the division or integer truncation flattens every share to zero. A self-join answer — fold per market, then cross-join the grand total back — works but scans and aggregates twice and reads like two queries stapled together; the reviewer asks why. The subtlety worth naming: in a grouped query the window runs AFTER the fold, so shares are exact at market grain — one of the few places windows and GROUP BY compose cleanly. EU 37 of the 86 split-touching flows, APAC 30, US 17, LATAM 2 — denominators stated, every share auditable.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "venmo-mcq-1",
      prompt: "A payment flow's status reads 'pending'. In this kit's Venmo stage map, what happened?",
      choices: ["Parked in balance float — the request is raised but not yet settled", "Settled to balance — the money landed", "Settling — the settlement stamp shipped_at has landed", "Declined or expired — the request will never settle"],
      answer: 0,
      why: "The stage map is fixed: pending = balance float (14 of 103 flows) — money parked between request and settlement, with no shipped_at stamp and no cycle yet. It is the float the float-report ages.",
      notes: [
        { choice: 1, why: "Settled-to-balance is 'delivered' — 52 flows. Calling float settled inflates the landed base before a single dollar moves." },
        { choice: 2, why: "Settling is 'shipped' — 30 flows, and it carries the shipped_at settlement stamp. Pending has no stamp by definition; that is what makes it float." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-2",
      prompt: "The db holds 251 split legs. How many payer slots do they carry, and which expression reads it?",
      choices: ["251 — COUNT(*), one payer per leg by definition", "498 — SUM(quantity), because quantity is the payer count on each leg", "753 — 251 legs x max quantity 3", "93 — COUNT of the solo band"],
      answer: 1,
      why: "quantity = payers on the leg, so SUM(quantity) across the 251 legs reads 498 payer slots — the people count behind the leg count. The band split: 93 solo legs (93 slots) and 158 split legs (405 slots).",
      notes: [
        { choice: 0, why: "COUNT(*) reads legs, not people — on a split-graph product that halves the story (251 versus 498) and the growth board will catch it." },
        { choice: 2, why: "Multiplying by the max assumes every leg rides 3 payers — the ladder is 93x1, 69x2, 89x3, not 251x3. Invented uniformity, wrong sum." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-3",
      prompt: "Flows JOIN split legs, then COUNT(*) and COUNT(DISTINCT o.id) disagree. What does each read?",
      choices: ["251 legs versus 103 flows — row count versus deduplicated requests", "103 versus 251 — the join shrank the table", "Both read 103 — DISTINCT is cosmetic after a join", "Both read 251 — every flow has exactly one leg"],
      answer: 0,
      why: "The fan-out is real: 103 flows fan into 251 legs (2.44 per flow). COUNT(*) counts the fan-out (251); COUNT(DISTINCT o.id) folds it back to requests (103). Legs versus flows is the two-grain census the whole kit stands on.",
      notes: [
        { choice: 2, why: "DISTINCT is never cosmetic after a one-to-many join — it is the fold that turns leg grain into flow grain. Dropping it doubles every per-market flow count." },
        { choice: 3, why: "The leg distribution is 26 flows with 1 leg, 29 with 2, 25 with 3, 23 with 4 — one-leg flows are the minority, so the counts diverge immediately." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN quantity >= 2 THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to split legs only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the split share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 62.9% of legs riding splits and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.629 to 0 first, then scales — the split-share map reads zero everywhere, including EU's 60 legs." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-5",
      prompt: "Keep only payment flows carrying at least 3 split legs. Where does the threshold live, and what does it return on this db?",
      choices: ["WHERE legs >= 3 on the raw orders table — returns 48 flows", "GROUP BY o.id HAVING COUNT(oi.id) >= 3 — returns 48 flows (25 with 3, 23 with 4)", "HAVING before GROUP BY, wherever it fits — returns 103", "WHERE COUNT(oi.id) >= 3 before the join — returns 23"],
      answer: 1,
      why: "A leg-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the distribution is 26/29/25/23 flows at 1/2/3/4 legs — the >= 3 gate keeps 25 + 23 = 48 flows.",
      notes: [
        { choice: 0, why: "There is no 'legs' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
        { choice: 3, why: "COUNT does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-6",
      prompt: "The request ladder runs 24, 17, 14, 13, 5 flows, then THREE accounts tie at 4. Under RANK, what rank do the 3-flow accounts carry?",
      choices: ["9", "7", "8", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the three-way tie consumes ranks 6 through 8, so the next distinct count (3 flows) lands on 9. Both 3-flow accounts share rank 9.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The growth board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "8 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The float flows double-counted their request day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 flows.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 x 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-8",
      prompt: "A triage list uses account_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every flow carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-9",
      prompt: "A board stack puts float flows under declined flows in one layout, built with UNION. A reviewer says one account's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same account, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same account, same counts, no market or band label — collapse into one, and the board loses an account with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-10",
      prompt: "A dashboard walks float value flow by flow: SUM(total) OVER (ORDER BY created_at). Two flows share a created_at second, and the cumulative 'jumps two flows at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at flow grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-11",
      prompt: "The legs-per-flow distribution reads 26 flows with 1 leg, 29 with 2, 25 with 3, 23 with 4. How many flows carry at least 3 legs, and where does that filter live?",
      choices: ["48 — GROUP BY o.id HAVING COUNT(oi.id) >= 3", "50 — WHERE legs >= 3 on the raw orders table", "25 — only the 3-leg flows count", "103 — every flow has legs"],
      answer: 0,
      why: "25 flows at 3 legs plus 23 at 4 legs = 48, and the floor is a group-level fact — HAVING after GROUP BY o.id. The count only materializes once the legs join and groups form; it does not exist on the raw orders row.",
      notes: [
        { choice: 1, why: "There is no 'legs' column on orders — the same error as choosing WHERE, wearing a number. The 48 is right, the clause is not." },
        { choice: 2, why: "The floor is 'at least 3' — the 23 four-leg flows clear it too. Off-by-one on the bar drops a fifth of the qualifying population." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-12",
      prompt: "The payer ladder reads 93 legs x 1 payer, 69 legs x 2, 89 legs x 3. Which fold returns the split band's payer-slot total, and what is it?",
      choices: ["SUM(quantity) over legs with quantity >= 2 — 405", "COUNT(*) over legs with quantity >= 2 — 158", "MAX(quantity) — 3", "SUM(quantity) over all legs — 498"],
      answer: 0,
      why: "The split band is legs with quantity >= 2, and SUM(quantity) totals their payer slots: 69x2 + 89x3 = 138 + 267 = 405 of the 498 total — 81.3% of the people riding 62.9% of the legs. The solo band carries the other 93 slots, one per leg.",
      notes: [
        { choice: 1, why: "158 is the leg count of the band, not the people count — quoting legs where the board asked for payers understates the split graph by 2.6x." },
        { choice: 3, why: "498 is the whole book including the 93 solo slots. The split-band read is exactly the population the CASE arm carves out." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-13",
      prompt: "Split-flow coverage reads 86 of 103 flows. The fold is COUNT(DISTINCT CASE WHEN oi.quantity >= 2 THEN o.id END). Why is the DISTINCT load-bearing?",
      choices: ["A flow with two split legs would count twice without it — the fan-out inflates the numerator", "DISTINCT dedups the status column", "COUNT cannot take a CASE without DISTINCT", "It forces the join to run once per flow"],
      answer: 0,
      why: "The CASE emits o.id once per SPLIT leg, and a flow can carry several split legs (the distribution runs 26/29/25/23 at 1/2/3/4 legs) — without DISTINCT a two-split flow contributes two rows to the count and 86 becomes an inflated fiction that no longer denominates against 103 flows. DISTINCT folds the legs back to flow grain, which is exactly the two-grain discipline the whole kit drills.",
      notes: [
        { choice: 1, why: "Status never enters this fold — the band is quantity, not status. A right keyword attached to the wrong column is still wrong." },
        { choice: 2, why: "COUNT works fine over a CASE — the DISTINCT is about grain, not syntax. The engine accepts both; only one answers the question." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-14",
      prompt: "The settle-clock drift map reads US 3.07 days on 15 stamped flows, APAC 2.93 on 29, LATAM 3.5 on 2. Which row should the nudge queue trust least, and why?",
      choices: ["LATAM — 3.5 is the slowest rate but it rests on 2 stamped flows, the thinnest base on the map", "APAC — the lowest rate means the biggest problem", "US — the biggest dollar book always wins the queue", "All equal — the rates are comparable as printed"],
      answer: 0,
      why: "The rate and its denominator ship together: LATAM's 3.5 comes from 2 stamped flows — one slow settlement moves it a full 0.5 days. APAC's 2.93 rests on 29 stamps and US's 3.07 on 15; both are more stable than LATAM's headline. A drift map without its denominators is how the queue chases noise.",
      notes: [
        { choice: 1, why: "Low is good here — 2.93 is the FASTEST rate. Reading the sign backwards sends the nudge queue at the healthiest market." },
        { choice: 3, why: "Equal-looking rates are not equal evidence — 2 stamps versus 29 is the whole difference between a signal and a coin flip." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-15",
      prompt: "The float census reads 14 parked flows: EU 6, APAC 5, US 3, LATAM 0. What does LATAM's zero mean, and which query shape proves it?",
      choices: ["No LATAM flows are parked — a conditional count (COUNT FILTER WHERE status='pending') per market returns a real zero, and proving it is part of the job", "LATAM flows never park — a schema rule", "The query dropped LATAM rows — fix with a RIGHT JOIN", "Zero float means zero LATAM flows exist"],
      answer: 0,
      why: "LATAM carries 2 flows (both settled — the market has legs, just no parked ones), so the float census reads a genuine 0.0 there. The honest shape is the one-pass census with per-market FILTER branches or a GROUP BY region over status — a zero you can print beside its population, not a market missing from the output.",
      notes: [
        { choice: 2, why: "Nothing was dropped — the zero is in the data. Adding a RIGHT JOIN to force LATAM's row is cosmetics; the conditional count already proves the zero." },
        { choice: 3, why: "LATAM's flow book is 2 flows, both settled. Confusing 'no float' with 'no flows' is the missing-market error the census exists to prevent." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-16",
      prompt: "The finance pod ages never-collected statements — fastest 13 days, slowest 84, average 28.4. Which date pair drives the age, and what does the banding fold look like?",
      choices: ["Close date minus issued_on (or due_on, per policy), banded by CASE into 0-30 / 31-60 / 60+ — a dated-diff with a stated as-of date", "created_at minus shipped_at — the settle clock", "The statement id difference", "COUNT of rail legs per statement"],
      answer: 0,
      why: "AR age is a business-policy datediff: the as-of date (the close) minus the statement's issue or due date — the policy choice must be named because it moves every bucket. The banding is one CASE over that diff; the settle clock (created_at to shipped_at) is a different metric about flows, not statements, and never belongs in the AR ladder.",
      notes: [
        { choice: 1, why: "The settle clock measures flow-to-settlement for stamped flows — a payments-ops metric. Aging statements with it conflates two different books and two different denominators." },
        { choice: 3, why: "Leg counts measure coverage, not age — the 6 never-collected statements have zero legs and infinite age by definition, which is exactly why the datediff drives the ladder." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-17",
      prompt: "A rail leg stores amount_cents = 561400. The roster prints 5,614.00. Which expression produced the dollar read, and what does the bare /100 print?",
      choices: ["amount_cents / 100.0 — real division; the bare /100 keeps INTEGER arithmetic and truncates odd cents", "amount_cents / 100 — same thing, cleaner", "CAST(amount_cents AS TEXT) / 100", "ROUND(amount_cents, 2)"],
      answer: 0,
      why: "INTEGER / INTEGER in SQLite is integer division: 561400 / 100 = 5614 exactly here, but any odd-cent book (a 5,614.50 leg) truncates the cents away. The .0 promotes the division to real arithmetic — fold in cents, divide once, display in dollars.",
      notes: [
        { choice: 1, why: "'Same thing' is true only while every value divides evenly — the contract breaks on the first odd-cent leg and the close eats cents silently." },
        { choice: 3, why: "ROUND changes precision, not units — ROUND(561400, 2) prints 561400 cents, a 100x error the CFO catches before the coffee lands." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-18",
      prompt: "The coverage census reads 21 exact, 1 partial, 6 none. Statement #25 bills 6,148.00 with a single 4,000.00 rail leg against it. Which CASE arm catches it, and what makes the arms safe?",
      choices: ["The 'partial' arm — legs cover part of the billed value; the arms are safe because they partition by leg presence and coverage, and every statement lands in exactly one", "The 'exact' arm — a leg exists", "The 'none' arm — one leg is effectively zero", "#25 is excluded — partial statements leave the census"],
      answer: 0,
      why: "#25 has legs and the legs do not cover the bill — the partial bucket exists precisely for it (4,000.00 of 6,148.00). The census is safe because the arms are exhaustive and mutually exclusive: no legs → none, legs equal bill → exact, legs short of bill → partial — 28 statements in, 28 classifications out.",
      notes: [
        { choice: 1, why: "Presence is not coverage — that is the 'exact' arm's bug. Waving 2,148.00 of shortfall into the exact book is how a close overstates by the shortfall." },
        { choice: 3, why: "Nothing excludes #25 — partial statements are the census's middle bucket. Excluding them hides the exact population the dunning follow-up targets." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-19",
      prompt: "The chargeback/opex register buckets by category: Rent 16,800.00, Ads 4,570.00, Travel 2,521.00, Tools 1,525.00. What share does Rent carry of the 25,416.00 book, and which expression reads it?",
      choices: ["About 66% — 100.0 * SUM(amount_cents) FILTER (WHERE category='Rent') / SUM(amount_cents)", "About 34% — the non-Rent share", "About 18% — the Ads share", "Cannot be computed without a budget table"],
      answer: 0,
      why: "16,800.00 over 25,416.00 is 66.1% — the register is rent-heavy and the board quotes it that way. The one-scan fold puts the 100.0 before the division (real arithmetic, no truncation) and keeps both SUMs in one pass; the denominator is the whole book, stated.",
      notes: [
        { choice: 1, why: "34% is everyone else. Quoting the complement as the share is the classic denominator flip — and the pacing argument inverts with it." },
        { choice: 3, why: "The share of actual spend needs no budget table — pacing against plan does. The question as asked is fully answerable from the register alone." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-20",
      prompt: "The statement roster folds GROUP_CONCAT(p.method) per statement, and the 6 never-collected statements print NULL instead of an empty roster. Why NULL, and what is the fix?",
      choices: ["GROUP_CONCAT over zero rows returns NULL — wrap it: COALESCE(GROUP_CONCAT(p.method), 'no rails')", "The method column is NULL on those rows", "GROUP_CONCAT returns an empty string that prints as NULL", "The JOIN dropped the rows — switch to INNER"],
      answer: 0,
      why: "Every aggregate over an empty set returns NULL — GROUP_CONCAT included — so the LEFT JOIN's six unmatched statements fold to NULL rosters. COALESCE names the empty set ('no rails'), which is what the dunning list sorts and filters on. The rows are present thanks to the LEFT JOIN; only the cell needs the label.",
      notes: [
        { choice: 2, why: "An empty string is a value; NULL is the absence of one — aggregates return the absence. The distinction is why the COALESCE belongs outside the aggregate." },
        { choice: 3, why: "The LEFT JOIN is what kept the six rows alive — INNER would drop the never-collected book entirely, turning a labeling bug into a missing-book bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-21",
      prompt: "The two-grain flow census: EU runs 45 flows from 8 accounts, the US runs 19 from 2. Which market is more intense per account, and what does the fold look like?",
      choices: ["The US — 9.5 flows per account against the EU's 5.6; COUNT(*) beside COUNT(DISTINCT customer_id) per region", "The EU — 45 flows beats 19", "Tied — both average about 6", "Intensity needs the dollar book, not counts"],
      answer: 0,
      why: "Intensity is flows per account: 19/2 = 9.5 versus 45/8 = 5.6. The EU carries more load, the US more intensity — the smallest book by rows is the densest by behavior. The fold prints both grains in one scan and lets the ratio argue where growth pushes next.",
      notes: [
        { choice: 1, why: "Raw load is the first grain, not the ratio — quoting 45 versus 19 without the account denominator is exactly the fold the census exists to prevent." },
        { choice: 3, why: "Intensity is a count ratio, answerable from the census alone; dollar-weighting is a different read with a different denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-22",
      prompt: "The kit quotes 2.44 legs per flow and 1.98 payers per leg. Which two fractions produce them, and why is neither 498/103?",
      choices: ["251/103 and 498/251 — each ratio pairs adjacent grains; 498/103 is payers per FLOW (4.83), a third metric", "Both are 498/103 rounded differently", "251/498 and 103/251 — the reciprocals", "103/251 and 251/498 — legs per payer and payers per flow"],
      answer: 0,
      why: "Grain adjacency is the rule: legs per flow = 251 legs over 103 flows = 2.44; payers per leg = 498 slots over 251 legs = 1.98. 498/103 = 4.83 is payers per FLOW — a real third metric, not a rounding of either. Multiplying the two adjacent ratios returns you to the top: 2.44 x 1.98 ≈ 4.83.",
      notes: [
        { choice: 1, why: "Rounding never turns 4.83 into 2.44 — quoting one number as three is the grain error the CFO catches first." },
        { choice: 2, why: "The reciprocals read 0.41 legs... inverted units — direction matters as much as the numbers." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-23",
      prompt: "Growth wants accounts that have split at least once. Which query shape does the desk ship, and what kills the NOT IN twin?",
      choices: ["EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = c.id AND oi.quantity >= 2) — immune to NULLs; NOT IN empties silently if the subquery list carries one NULL", "NOT IN (SELECT customer_id FROM orders WHERE quantity >= 2) — fastest and safe", "A LEFT JOIN with DISTINCT — the only correct shape", "COUNT(*) > 0 in the outer query"],
      answer: 0,
      why: "EXISTS short-circuits on the first matching split leg and answers 'at least once' exactly. NOT IN compares against a materialized list where one NULL makes every row UNKNOWN — the whole list empties while looking valid; quantity also lives on legs, not orders, so the NOT IN twin is doubly broken. The clean core db hides the NULL bug; staging tables ship it.",
      notes: [
        { choice: 1, why: "Two defects: quantity is not an orders column, and NOT IN over an unguarded list is one NULL away from an empty answer that looks true." },
        { choice: 2, why: "A LEFT JOIN … IS NULL shape answers the NEGATION (accounts that never split). For the positive test it is the wrong polarity, and DISTINCT does not fix direction." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-24",
      prompt: "A staging pull filters WHERE status = 'Delivered' and returns zero flows. The ops board's settled count is 52. What is the defect class?",
      choices: ["Case-sensitive literal mismatch — = compares bytes, the column stores 'delivered', and the filter empties silently", "The status column is NULL on all rows", "The staging table lost its rows", "Delivered needs a TRIM, not a case fix"],
      answer: 0,
      why: "SQLite's = is byte-exact — 'Delivered' never equals 'delivered' — so the filter matches nothing and the report reads an empty settled book while running clean. The census that should foot to 103 instead foots to 51 (103 minus the 52 vanished rows), and only the reconciliation identity catches it. Normalize once, compare lowercase, prove the census.",
      notes: [
        { choice: 1, why: "If the column were NULL everywhere, COUNT(*) would still read 103 — and the fate census would catch it. The silent empty FILTER is the tell." },
        { choice: 3, why: "TRIM fixes whitespace, not case — the right repair for the wrong diagnosis. LOWER() or a literal contract is the fix that survives review." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-25",
      prompt: "The feed trend buckets flows with STRFTIME('%m', created_at) and gets 12 buckets instead of the expected 14. Why?",
      choices: ["'%m' emits month only — January 2024 and January 2025 collapse into one bucket", "STRFTIME drops empty months", "The data covers only 12 months", "'%m' must be uppercase to include the year"],
      answer: 0,
      why: "The spine needs year AND month — STRFTIME('%Y-%m', created_at) — because '%m' alone merges every January into one bucket and the 2024-01 to 2025-02 window reads as a 12-point loop. Zero-padding is the other half of the fix: without it '2024-10' sorts before '2024-2'.",
      notes: [
        { choice: 1, why: "STRFTIME buckets what it receives — this book has all 14 year-months present; the collapse is the format string, not the data." },
        { choice: 2, why: "The flow book spans 2024-01 to 2025-02 — 14 distinct year-months. A 12-point trend over a 14-month book is fiction with a straight face." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-26",
      prompt: "A Q1 pull uses created_at BETWEEN '2024-01-01' AND '2024-03-31' and counts one flow short of the monthly spine. What happened?",
      choices: ["BETWEEN on ISO TEXT includes '2024-03-31' at midnight only — the last night's requests are dropped", "The spine double-counts March", "BETWEEN cannot compare TEXT dates", "The spine counts declined flows, BETWEEN does not"],
      answer: 0,
      why: "created_at carries a time component, so the literal '2024-03-31' means midnight at the START of that day — every request stamped later that night falls outside. Month-end is exactly when dinner splits land, so the fix is the half-open window: created_at >= '2024-01-01' AND created_at < '2024-04-01'.",
      notes: [
        { choice: 3, why: "Both queries read the same status column — the discrepancy is a boundary artifact, and blaming the fate census is how the real bug survives review." },
        { choice: 2, why: "ISO-8601 text compares correctly with BETWEEN because zero-padded fields sort lexicographically — the endpoint, not the comparison, is the bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "venmo-mcq-27",
      prompt: "The engagement walk computes slots - LAG(slots) OVER (ORDER BY month). What does the 2024-01 row print in the delta column?",
      choices: ["NULL — there is no prior month; the baseline is not a zero", "0 — the delta defaults to zero", "50 — the opening slot count", "The query errors on the first row"],
      answer: 0,
      why: "LAG reads the previous row's value and the first row has none — the delta is NULL by definition. Desk policy: label it 'baseline' or leave the NULL, never COALESCE it to zero — a zero delta reads as a flat month and poisons every downstream average of deltas.",
      notes: [
        { choice: 1, why: "COALESCE(delta, 0) is the exact laundering the panel hunts — 'no movement' and 'no prior month' are different facts wearing the same zero." },
        { choice: 2, why: "That is the slots column's job. Printing the level in the delta column double-reports the open and breaks the column's meaning." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-28",
      prompt: "The float walk runs SUM(total) OVER (ORDER BY created_at) without PARTITION BY customer_id. Account 2's third row prints a balance polluted by account 1's float. What went wrong?",
      choices: ["Without the partition, one cumulative runs across ALL 103 flows — each account's walk includes every other account's money", "The ORDER BY needs DESC", "The frame must be ROWS, not RANGE", "created_at ties double-count flows"],
      answer: 0,
      why: "PARTITION BY customer_id is what restarts the walk per account; drop it and the window runs one global cumulative, so account 2's balance includes account 1's parked value. Frame and tie behavior are real refinements — but neither restores a partition. The walk is answering the wrong question entirely.",
      notes: [
        { choice: 2, why: "ROWS vs RANGE changes tie granularity — second-order. Partition first, frame second; no frame fixes cross-account pollution." },
        { choice: 3, why: "RANGE absorbs tied created_at rows together — a deliberate semantic, still per-partition. The polluted balance is a missing-partition symptom." },
      ],
      difficulty: "hard",
    },
    {
      id: "venmo-mcq-29",
      prompt: "New hire, first week: the feed report joins orders to order_items on every run. Which index carries the fan-out probe, and why that one?",
      choices: ["order_items(order_id) — each flow probes its own legs through the fan-out key instead of scanning 251 rows", "orders(customer_id) — the account index", "No index — the join is too small to matter", "order_items(quantity) — the band column"],
      answer: 0,
      why: "The join is one-to-many on order_id: 103 parents probing 251 children. An index on the child's foreign key (order_items.order_id) turns each probe into a lookup — the canonical fan-out index. customer_id indexes the account join, not the leg join, and quantity is a value, not a key.",
      notes: [
        { choice: 1, why: "That index carries flows-per-account reads, not the fan-out — the right index for a different query is the classic tuning miss." },
        { choice: 2, why: "Size is the wrong lens — the shape (one-to-many probe per parent row) is what the index answers, and the same shape scales with the product." },
      ],
      difficulty: "easy",
    },
    {
      id: "venmo-mcq-30",
      prompt: "The winback pod takes the top 10 accounts by flow count. Two accounts tie at 3 flows and LIMIT 10 cuts inside the tie. What makes the cut defensible?",
      choices: ["A named deterministic tie-breaker — ORDER BY COUNT(*) DESC, lifetime DESC, id — written into the query and the deck", "LIMIT is deterministic — same data, same rows", "RANK() with the tie sharing a rank fixes it", "Increasing LIMIT to 11 removes the ambiguity"],
      answer: 0,
      why: "The engine may return tied rows in any order, so a LIMIT that cuts inside the tie keeps an arbitrary member unless a tie-breaker is stated. The policy answer: name the secondary sort so the same data always yields the same pod — and the deck carries the policy, not just the rows. RANK surfaces the tie but keeps both rows; a bigger LIMIT just moves the arbitrary cut.",
      notes: [
        { choice: 1, why: "ORDER BY on tied keys guarantees nothing among the tied rows — the same data can legally reorder after a plan change, silently swapping who gets the winback." },
        { choice: 2, why: "RANK keeps every tied row — no cut, no pod of ten — which is a different report. It labels the tie honestly but does not choose the ten." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-venmo-1",
      tier: "easy",
      topic: "s6",
      universe: "growth",
      title: "The payer-band census",
      brief:
        "Venmo-flavored brief on the storefront db: the growth board opens with the payer-band census — every split leg banded solo (one payer) versus split (multiple payers), because the split graph IS the product. Probed facts: 251 legs carry 498 payer slots (quantity = payers on the leg); the band fold reads 93 solo legs / 93 slots against 158 split legs / 405 slots — 62.9% of legs ride multi-payer requests; the payer ladder is 93x1, 69x2, 89x3. The board reads the split band first.",
      ask: "Return each payer band with its leg count, payer-slot total and average payers per leg to 1 decimal, busiest band first.",
      template:
        "SELECT CASE WHEN quantity {1} 1 THEN {2}\n            ELSE 'split' END AS leg_band,\n       COUNT(*) AS legs,\n       {3}(quantity) AS payers,\n       ROUND({4}(quantity), 1) AS avg_payers\nFROM order_items\nGROUP BY leg_band\nORDER BY legs DESC;",
      slots: [
        {
          answer: "=",
          kind: "keyword",
          label: "the solo boundary",
          why: "quantity = 1 is the solo arm — exactly one payer on the leg (93 legs). >= or < collapse the census into one band of 251 (every leg 'solo' or every leg 'split'), and <> swaps the labels so the 158 multi-payer legs wear 'solo'.",
        },
        {
          answer: "'solo'",
          kind: "keyword",
          label: "the one-payer label",
          why: "The quantity = 1 band is 'solo' — 93 legs, 93 slots, average 1.0. 'split' in this arm collapses both arms into one band and the census loses the 93/158 contrast it exists to show.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the payer-slot fold",
          why: "SUM(quantity) totals payer slots per band: 93 solo, 405 split — the people behind the legs. COUNT would re-print the leg counts (93/158), MAX the biggest leg (1/3), MIN the smallest (1/2) — three wrong stories in one column.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the payers-per-leg rate",
          why: "AVG(quantity) reads 1.0 solo versus 2.6 split (405/158 = 2.56, rounded) — the graph-intensity read. SUM here would print the slot totals again (93/405), COUNT the leg counts, MAX the leg ceiling (3) — none is a rate.",
        },
      ],
      distractors: [">=", "<", "<>", "'split'", "MAX", "MIN"],
      walkthrough:
        "One table, one CASE, four columns at two grains. The CASE bands each of the 251 legs by its payer count: quantity = 1 lands in 'solo' (93 legs, 93 slots, average 1.0) and everything else in 'split' (158 legs, 405 slots, average 2.6 — 405/158 = 2.56 rounded to one decimal), ordered busiest-band-first: split 158 on top, solo 93 below. The totals reconcile upward to the probed book — 251 legs, 498 payer slots (93x1 + 69x2 + 89x3) — and the split band carries 62.9% of legs but 81.3% of slots, which is the growth board's whole argument: the feed's engagement lives in the multi-payer band. The distractors fail honestly: >= or < in the boundary slot collapse the census to one row of 251 (every leg 'solo', or every leg 'split'); <> swaps the fold so the 158 split legs wear the solo label; 'split' in the label slot collapses both arms into one band; MAX as the slot fold reads the biggest leg per band (1 and 3) instead of the slot total; MIN reads the smallest (1 and 2); SUM in the rate slot re-prints the slot totals and AVG's graph-intensity read disappears. The definition to state out loud: quantity is payers, not legs — 251 versus 498 is the factor-of-two the CFO catches.",
    },
    {
      id: "cs-venmo-2",
      tier: "hard",
      topic: "x1",
      universe: "month-close",
      title: "The rail-roster walk",
      brief:
        "Venmo-flavored brief on the storefront db: at every close, payments ops walks the merchant-profile statement roster — each statement with the rails that actually settled it, no-leg statements included and labelled, because status is a claim and rail rows are the ledger of record. Probed facts: 28 statements against 27 rail legs (card = instant debit 16 legs / 37,364.00; wire = bank transfer 11 / 32,248.00); leg distribution 0x6, 1x17, 2x5; the five two-leg statements are the split-rail receipts #1, 5, 12, 19, 22 (4,860.00 + 5,284.00 + 4,723.00 + 5,614.00 + 4,459.00 = 24,940.00), each rostering 'card,wire'. Statement tables carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return every merchant statement with its billed dollars, rail-leg count and rail roster — no-leg statements labelled, busiest roster first.",
      template:
        "WITH roster AS (\n  SELECT i.id AS statement_id,\n         i.status AS status,\n         ROUND(i.amount_cents / {1}, 2) AS billed,\n         COUNT(p.id) AS legs,\n         COALESCE({2}(p.method), {3}) AS rails\n  FROM invoices i\n  {4} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT statement_id, status, billed, legs, rails\nFROM roster\nORDER BY legs {5}, billed DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 5,614.00 instead of 561,400. The .0 matters — bare 100 keeps integer arithmetic, and 10 or 1000 move the decimal the wrong way.",
        },
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the rail-roster fold",
          why: "GROUP_CONCAT(p.method) folds a statement's legs into one roster cell — 'card,wire' on all five split-rail receipts. COUNT folds legs into counts, MAX keeps only the last rail ('wire'), SUM/AVG coerce method text to 0.0 — a roster of nothing.",
        },
        {
          answer: "'no rails'",
          kind: "keyword",
          label: "the empty-roster label",
          why: "GROUP_CONCAT over an empty set returns NULL, so the 6 never-collected statements need the COALESCE label — 'no rails'. Any other label changes those six cells; without COALESCE they print NULL and the dunning list loses its handle.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-every-statement join",
          why: "LEFT JOIN preserves the 6 statements with zero rail legs — they must survive into the roster with 'no rails'. INNER drops them (22 rows, not 28) and the never-collected book vanishes from the close; CROSS cannot carry an ON clause at all.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-roster-first direction",
          why: "The close reads busiest roster on top: the five two-leg receipts (5,614.00 down to 4,459.00), then the 17 single-leg statements, then the 6 'no rails'. ASC opens the close on the empty rosters — a correct query aimed at the wrong end of the book.",
        },
      ],
      distractors: ["COUNT", "MAX", "SUM", "INNER", "CROSS", "none"],
      walkthrough:
        "Two stages: roster per statement, then walk. The CTE LEFT JOINs all 28 statements to their rail legs, folds GROUP_CONCAT(method) into a roster cell with a COALESCE label for the empty set, and converts cents to dollars on the /100.0 read. Ordered legs DESC then billed DESC, the walk reads: the five split-rail receipts first — #19 at 5,614.00, #5 at 5,284.00, #1 at 4,860.00, #12 at 4,723.00, #22 at 4,459.00, each rostering 'card,wire' (24,940.00 of book settling on both rails) — then 17 single-leg statements, including void-but-debited #11 (925.00, card roster) and partial #25 (6,148.00 billed, one 4,000.00 wire leg against it), then the 6 'no rails' statements — 15,217.00 never collected, among them paid-status #28 at 1,756.00, a status that lies. The distractors each break differently: COUNT in the fold slot prints leg counts where rosters belong; MAX keeps one rail per statement and the split-rail receipts read 'wire'; SUM and AVG coerce the method text to 0.0; INNER drops the six no-leg statements and the never-collected book disappears; the wrong COALESCE label rewrites six cells; ASC opens the close on the empty rosters. The census rule holds: every statement appears exactly once — 28 rows or the close does not ship.",
    },
    {
      id: "cs-venmo-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The payer-slot month walk",
      brief:
        "Venmo-flavored brief on the storefront db: the growth board's engagement call walks PEOPLE, not dollars — payer slots (SUM of leg quantity) bucketed by month, prior month beside current, delta named. Probed facts: the spine runs 14 buckets from 2024-01 to 2025-02 and sums to all 498 payer slots; the book opens at 50 slots (January 2024), peaks at 51 in February, troughs at 22 in July 2024, jumps +18 into August, and takes its steepest drop, -11, into March (51 to 40) — tied by October's 44 to 33. February 2025 closes the spine at 33 slots. Quantity is REAL people-count on each leg; the walk reads slots, never legs.",
      ask: "Return each month with its payer-slot total, the prior month's total and the delta — baseline row dropped, spine in calendar order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({1}, o.created_at) AS month,\n         SUM({2}) AS slots\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  GROUP BY month\n),\nwalked AS (\n  SELECT month, slots,\n         LAG(slots) OVER (ORDER BY month) AS prior_month\n  FROM spine\n)\nSELECT month, slots, prior_month,\n       ({3} - prior_month) AS delta\nFROM walked\nWHERE prior_month {4}\nORDER BY month;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the spine format",
          why: "Year plus zero-padded month keeps the two Januaries apart and sorts correctly — 14 buckets from 2024-01 to 2025-02. '%m' alone merges January 2024 with January 2025 into one bucket and the 14-point spine reads as a 12-point loop with double-weighted months.",
        },
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the payer-slot fold",
          why: "SUM(oi.quantity) counts PEOPLE — 498 slots across the 251 legs, because quantity is the payer count on each leg. o.total rides the flow grain through the fan-out join and repeats each flow's total once per leg — a slot spine inflated by the fan-out itself.",
        },
        {
          answer: "slots",
          kind: "keyword",
          label: "the current-month side",
          why: "The delta reads current minus prior — slots minus prior_month. Swapping the sides flips every sign: August prints -18 and the biggest jump of the year becomes a slump, a plausible trend pointing the wrong way.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the baseline gate",
          why: "The first row's LAG is NULL by definition — the baseline, not a zero. WHERE prior_month IS NOT NULL drops exactly that row; IS NULL returns the baseline alone, and a bare string comparison returns nothing at all, because a real slot total never equals a literal.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "o.total", "1", "IS NULL", "0"],
      walkthrough:
        "Two stages, one walk, one grain choice. The spine joins flows to legs — the fan-out is the point, because slots count people — and folds 251 legs into 14 month buckets summing to all 498 payer slots. The window stage hands each month its calendar neighbor's total; LAG makes the first row NULL by definition, and the WHERE IS NOT NULL gate drops it: thirteen walked months, baseline labeled upstream, never zero-filled. The delta is current minus prior — slots - prior_month — and the story it tells: open 50, peak 51 in February, the summer sag bottoms at 22 in July, the largest jump — +18 — lands into August, and the steepest drop, -11, lands into March with October tying it at -11 (44 to 33). The distractors each break differently: '%m' merges the two Januaries and the spine reads 12 points; o.total rides the fan-out and the 'slots' column inflates into repeated flow totals; '1' re-folds the spine into a legs-per-month census; '0' zeroes every month; IS NULL returns the baseline alone and '%Y' collapses the spine to two year-rows. The discipline: people-grain walking means the join must survive into the spine — walk legs and you count requests, walk slots and you count the feed.",
    },
    {
      id: "cs-venmo-4",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Venmo-flavored brief on the storefront db: the ops board wants the flow fate census in ONE scan — settled, settling, float, declined — with the float share beside it, because float is the number the nudge queue watches. Probed facts: 103 flows total; delivered = settled to balance 52, shipped = settling 30, pending = {amber:balance float} 14, cancelled = declined or expired 7 — the branches foot to 103 by construction, which is the reconciliation identity the census exists to enforce. Statuses live on orders.status as lowercase literals; the share math needs the 100.0 guard before the division or integer truncation prints a flat zero. One table, no joins.",
      ask: "Return one row: total flows, settled, settling, float, declined counts, and the float percentage to 2 decimals — gated so the row only prints when the census foots to 103.",
      template:
        "SELECT COUNT(*) AS all_flows,\n       COUNT(*) FILTER (WHERE {1}) AS settled,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS settling,\n       COUNT(*) FILTER (WHERE status = 'pending') AS float_parked,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS declined,\n       ROUND({2} * COUNT(*) FILTER (WHERE status = 'pending') / COUNT(*), 2) AS float_pct\nFROM orders\nHAVING COUNT(*) = {3};",
      slots: [
        {
          answer: "status = 'delivered'",
          kind: "keyword",
          label: "the settled branch",
          why: "Settled-to-balance is the 'delivered' literal — 52 of 103. 'shipped' in the arm returns the 30 settling flows wearing the settled name; 'complete' or 'DELIVERED' match nothing and the branch prints 0 while the query runs clean.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share guard",
          why: "100.0 * 14 / 103 is real division — 13.59. The bare 100 forces integer arithmetic after the multiply: 1,400 / 103 truncates to 13, and the float share prints a flat 13 while every analyst copies it into the nudge-queue deck.",
        },
        {
          answer: "103",
          kind: "number",
          label: "the reconciliation gate",
          why: "HAVING COUNT(*) = 103 makes the census assert its own total: the row prints only when the book holds exactly 103 flows. 104 or 102 gate to zero rows — a loud empty result that says the population moved, instead of a plausible row that says nothing.",
        },
      ],
      distractors: ["status = 'complete'", "status = 'shipped'", "status = 'DELIVERED'", "100", "104"],
      walkthrough:
        "One scan, four branches, one identity. FILTER (WHERE …) hangs a private WHERE off each aggregate: delivered counts 52 settled, shipped 30 settling, pending 14 float, cancelled 7 declined — and COUNT(*) prints 103 beside them so the reader can check 52+30+14+7 = 103 without opening a second tab. The float share rides the same scan: 100.0 * 14 / 103 = 13.59, the .0 guarding real division — and float is the branch the nudge queue watches, because a parked request is a friend who stops asking. The HAVING gate is the census's self-check — the aggregate query has no GROUP BY, so HAVING judges the single fold, and any drift in the population prints an empty grid instead of a stale row. The distractors each break differently: 'complete' and 'DELIVERED' match no literal and settled reads 0; 'shipped' fills the settled branch with the 30 settling flows and the funnel's top stage shrinks by 58%; the bare 100 truncates the share to 13; 104 silences the whole row. The portable twin is SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) — same numbers, no FILTER keyword, same identity to defend.",
    },
    {
      id: "cs-venmo-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The never-collected dunning queue",
      brief:
        "Venmo-flavored brief on the storefront db: before the dunning email goes out, the queue runs — merchant-profile statements with zero rail legs, folded by market. Probed facts: six statements never received a rail leg, worth 15,217.00: the EU carries four (873.00, 1,295.00, 3,562.00, 2,794.00 — 8,524.00), the US one (4,937.00), APAC one (#28 at 1,756.00 — the statement that reads 'paid' with nothing behind it, the paid-status lie). The queue prints biggest exposure first so the collections call goes out in priority order. Statement tables carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each market with its count of never-collected statements and total dunning dollars to 2 decimals — biggest exposure first, keeping markets with at least one legless statement.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS legless_statements,\n       ROUND(SUM({1}) / 100.0, 2) AS dunning_dollars\nFROM invoices i\nJOIN customers c ON {2}\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {3}\nGROUP BY c.region\nHAVING COUNT(*) >= {4}\nORDER BY dunning_dollars DESC;",
      slots: [
        {
          answer: "i.amount_cents",
          kind: "keyword",
          label: "the exposure fold",
          why: "Dunning exposure is what the statement CLAIMS — the invoice's amount_cents. p.amount_cents over an unmatched LEFT JOIN is all NULLs, so the fold prints NULL dollars for a queue that owns 15,217.00 — exposure silently erased.",
        },
        {
          answer: "i.customer_id = c.id",
          kind: "keyword",
          label: "the statement-to-market key",
          why: "A statement reaches its market through the account that holds it: i.customer_id = c.id. c.id = i.id pairs statement 1 with account 1 by id coincidence — some pairs happen to match and the market split comes out plausible and wrong.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the anti-join gate",
          why: "The LEFT JOIN keeps every statement; p.id IS NULL keeps exactly the ones where no rail leg matched — the anti-join. IS NOT NULL flips the query to the 22 SETTLED statements, and a bare comparison matches nothing because ids start at 1 — a silent empty queue on collections day.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the queue floor",
          why: "The queue keeps markets carrying at least one legless statement — every market that qualifies on this book (EU 4, US 1, APAC 1) clears the bar, and the count 1 appears in the output. A floor of 2 silently drops the US and APAC rows and the 4,937.00 plus 1,756.00 exposure never reaches the collections call.",
        },
      ],
      distractors: ["p.amount_cents", "c.id = i.id", "IS NOT NULL", "2", "p.customer_id = c.id"],
      walkthrough:
        "Three tables, one anti-join, one queue. The inner join to customers stamps each statement with its market; the LEFT JOIN to payments offers each statement its rail legs; WHERE p.id IS NULL keeps only the offers that came back empty — six statements, and no COALESCE anywhere to launder them back in. GROUP BY region folds the six into three queue rows: EU 4 statements / 8,524.00, US 1 / 4,937.00, APAC 1 / 1,756.00, ordered so the biggest exposure leads the call. The APAC row IS the finding: #28 reads 'paid' in the status column and still lands in the dunning queue, because rail rows — not claims — are the ledger of record. The distractors each break differently: p.amount_cents sums NULLs into a NULL dollar column; c.id = i.id mispairs statements to accounts by id coincidence; IS NOT NULL flips the query into the settled book (22 statements) and the dunning email goes out to merchants who already got paid; 2 on the floor drops two of three markets; p.customer_id = c.id reaches for a column the payments table does not have and dies before it runs. The close rule: the anti-join IS the answer, the arithmetic stays integer until one /100.0, and a paid status with no legs is a finding, not a filter.",
    },
    {
      id: "cs-venmo-6",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The request ladder and the tie block",
      brief:
        "Venmo-flavored brief on the storefront db: the growth board's power-account ladder ranks accounts by flow count — and the tie block is the policy decision. Probed facts: the ladder runs 24, 17, 14, 13, 5 flows (account 1 leads at 7,262.35 lifetime), then FOUR accounts tie at 4 flows (lifetimes 1,686.17 / 1,098.60 / 985.65 / 737.68) — RANK awards the tie block rank 6 four times and the next distinct count lands on rank 10. Lifetime values are REAL dollars on orders.total. The board wants shared rungs for peer accounts and the ladder ordered by rank, then by lifetime within ties — and the membership bar IS the pod's rule, so no LIMIT cuts inside the tie.",
      ask: "Return every account at or above the tie block with flow count, lifetime dollars to 2 decimals and a shared rank — ties share the rung, biggest lifetime first within ties.",
      template:
        "SELECT customer_id AS account,\n       COUNT(*) AS flows,\n       ROUND(SUM(total), {1}) AS lifetime,\n       RANK() OVER (ORDER BY COUNT(*) {2}) AS rk\nFROM orders\nGROUP BY customer_id\nHAVING {3}\nORDER BY rk, lifetime DESC;",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the lifetime precision",
          why: "Lifetimes are money — 7,262.35 reads to 2 decimals or the ladder stops matching the deck. ROUND(…, 0) prints 7,262 and the whale's exact lifetime — the number the winback budget defends — is gone from the report.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the ladder direction",
          why: "The board reads the biggest book on top: 24 flows at rank 1. ASC hands rank 1 to the two-flow account and the pod's top row becomes its bottom — a correct window aimed at the wrong end of the ladder.",
        },
        {
          answer: "COUNT(*) >= 4",
          kind: "keyword",
          label: "the tie bar",
          why: "The bar keeps exactly the accounts at or above the tie block — 24, 17, 14, 13, 5 and the four 4s: nine accounts, the whole tie block present and sharing rank 6. A bar of 5 drops all four tied accounts and the shared rung vanishes; equality on the count alone keeps only the peers and loses the ladder above them.",
        },
      ],
      distractors: ["0", "1", "ASC", "COUNT(*) >= 5", "COUNT(*) = 4"],
      walkthrough:
        "One fold, one window, one policy. GROUP BY customer_id folds 103 flows to 16 account counts; the HAVING bar keeps the nine accounts at or above the tie block; RANK() OVER (ORDER BY COUNT(*) DESC) stamps shared rungs — 1, 2, 3, 4, 5, then 6, 6, 6, 6 — and the lifetime DESC tie-break orders the tied peers by book size: 1,686.17, 1,098.60, 985.65, 737.68. The tie block is the interview: RANK (gaps follow — the next count below 4 lands at rank 10), DENSE_RANK (no gaps — rank 7) and ROW_NUMBER (arbitrary 6, 7, 8, 9) are three different policies about peer accounts, and the board publishes which one it chose. No LIMIT sits under this report — the HAVING bar IS the pod's membership rule, so no cutoff can silently evict a tied peer the way LIMIT 8 would. The distractors each break differently: 0 in the precision slot prints whole-dollar lifetimes and 1 shaves the second decimal; ASC flips the ladder so the dormant tail leads; the bar at 5 drops the entire tie block and its shared rank 6; the equality bar keeps only the four peers and loses the whales above them; and the bare 0 or 1 predicates on HAVING either empty the grid or flood it with all sixteen accounts.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-flow split-leg revenue is the growth pod's first chart — fold leg records to purpose grain and rank. This problem drills the exact fold the payer-band report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Purpose-SKU revenue beside units moved is how the merchant-profile page gets defended — 405 of 498 payer slots riding splits is this problem's shape at db scale." },
    { slug: "percentage-of-users-attended-a-contest", why: "Split participation is a share with a stated denominator — payers on a request over accounts invited. Same division-discipline drill, Venmo flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in growth targeting — which flows carry at least N legs, which accounts carry at least N requests. This problem drills the group-level gate." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-flow account is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "combine-two-tables", why: "Accounts LEFT JOINed to flows: the dormant-feed read. An account with no flow is whitespace, a flow with no account is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Request outcomes arrive with gaps — COALESCE turns missing response data into an explicit rate instead of a silent NULL. It drills the settle-funnel denominator." },
    { slug: "customers-who-never-order", why: "The dormant-account anti-join is how the re-engagement calendar starts — accounts with no requests against a dated cutoff. The same shape drives Venmo's winback reads." },
    { slug: "game-play-analysis-i", why: "First request per account — the feed's first split — anchors every cohort Venmo builds. MIN-over-window is the shape." },
    { slug: "number-of-employees-who-met-the-target", why: "Accounts hitting settle targets is a conditional count against a bar — the engagement report's weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "capital-gain-loss", why: "Balance float in versus money out nets to the movement number the treasury board reads. This problem drills ordered buy/sell folds — the same add/drain algebra the float walk uses." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Who-paid-what conditional logic — paid A and B but never C — is the split-graph's signature screen. This problem is the conditional anti-join pattern Venmo screens live on." },
    { slug: "top-travellers", why: "The payer ladder beside per-account totals is how power accounts get defended — 24/17/14/13/5 at db scale is this problem's exact shape." },
    { slug: "account-balance", why: "Balance float is a running balance — every request in, every settlement out, ordered by time. This problem drills the ordered cumulative the float report is built on." },
    { slug: "repeat-purchase-rate", why: "The repeat-request rate is the feed's stickiness read — accounts that split twice or more. This problem drills the repeat-cohort fold the growth review re-cuts weekly." },
    { slug: "chargeback-rate-ranking", why: "Chargebacks against merchant profiles are a rate with a stated denominator — disputes per settled statement. This problem drills the ratio-ranking read the risk pod ships." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Initiated-but-never-settled is the 14 float rows in problem form — requests raised, money parked. The funnel's whitespace read, drilled exactly." },
    { slug: "active-users", why: "Feed actives are the two-grain census at platform grain — accounts that moved money beside the total book. This problem drills the distinct-activity fold the growth board opens with." },
    { slug: "monthly-transactions-i", why: "Per-account monthly flow counts are the intensity fold behind the 5.6-vs-9.5 market ratio. This problem drills the month-bucketed per-account census the feed report re-cuts." },
    { slug: "consecutive-numbers", why: "Consecutive-month moves on the slot spine are streak logic over the LAG walk. This problem drills the window-self-comparison shape the engagement call leans on." },
    { slug: "average-selling-price", why: "Volume-weighted average ticket per payer band is the pricing read beside the 2.6-payers-per-leg rate — 498 slots folding into a weighted mean, exactly this problem's divide-by-the-sum shape." },
    { slug: "credit-utilization-bands", why: "CASE bands over per-payer amounts — under 10, 10-50, 50+ — are the denomination health read the ticket-size report runs. This problem drills the banded fold." },
    { slug: "convert-date-format", why: "Feed timestamps arrive ISO and print human — the display-layer date reshaping every Venmo receipt and settle-clock report leans on. This problem drills the format conversion." },
    { slug: "daily-balance-interest", why: "Day-weighted float math is the treasury board's parked-value read — ordered flows, per-day folds, cents-safe. This problem drills the cumulative-then-weight shape." },
    { slug: "balance-rollforward", why: "Opening float plus ordered movements equals closing — the reconciliation identity behind the balance view. This problem drills the rollforward fold the close pack ships." },
    { slug: "budget-pacing", why: "Chargeback/opex versus plan is the register's pacing read — Rent at 16,800.00 of 25,416.00 is the shape at db scale. This problem drills the actual-versus-bar fold." },
    { slug: "ar-aging-schedule", why: "Aging buckets for the 15,217.00 never-collected book — 13 days fastest, 84 slowest — are CASE bands over datediffs. This problem drills the receivables ladder the collections call reads from." },
    { slug: "deferred-revenue", why: "Money claimed but not rail-settled is exactly the #28 paid-status lie and the legless book. This problem drills the claim-versus-ledger reconciliation shape." },
    { slug: "queries-quality-and-percentage", why: "Settlement quality reads as a ratio with a stated denominator — 2.98 days beside a share of stamped flows. Same division-discipline drill, Venmo flavor." },
    { slug: "amount-anomaly-zscore", why: "Fat tickets against the flow mean are the risk desk's first flag — the 2.98-day book has outliers the standardize-and-flag fold surfaces. This problem drills the anomaly screen." },
    { slug: "count-occurrences-in-text", why: "Feed receipts and rail rosters are string folds — occurrences inside a folded cell mirror GROUP_CONCAT's lossy edge. This problem drills the text-fold discipline." },
    { slug: "dau-wau-stickiness", why: "Daily-versus-weekly actives is the feed's stickiness heartbeat — the co-occurrence graph at platform grain. This problem drills the distinct-activity ratio the growth review re-cuts weekly." },
  ],
};
