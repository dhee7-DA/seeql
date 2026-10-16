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
// all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f*-initial rows) and say so in
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
    "Preparation strategy: the pools file carries no Venmo section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: payer-band CASE folds, split-graph conditional counts, co-split pair queries, request-to-settle clocks, rank ladders with ties, and the cents-safe statement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:payer-band census} the growth board opens with, the other rebuilds the {emerald:rail-roster walk} payments ops reads at every close. The bar to clear: *state the population and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["calculate-special-bonus", "type-of-triangle", "evaluate-boolean-expression"],
    },
    {
      name: "Split-graph conditional counts",
      why: "'Who paid what' is a conditional count: COUNT(DISTINCT CASE WHEN quantity >= 2 THEN order_id END) turns legs into split-touching flows — 86 of 103. The trap is grain: COUNT(*) counts legs (251), COUNT(DISTINCT o.id) counts flows (103), SUM(quantity) counts people (498) — three honest numbers that answer three different questions, and the interviewer wants you to say which one you are shipping.",
      slugs: ["number-of-rich-customers", "unique-orders-and-customers-per-month", "actors-and-directors-who-cooperated-at-least-three-times"],
    },
    {
      name: "Co-split pair graphs",
      why: "The social graph is a self-join: which accounts keep landing on the same request, which pairs split together twice or more. Venmo's feed ranking and its friend-suggestion model both start from co-occurrence counts over pairs, and symmetric-pair canonicalization (a,b) versus (b,a) is the correctness argument the panel listens for.",
      slugs: ["number-of-calls-between-two-persons", "most-common-course-pairs", "strong-friendship"],
    },
    {
      name: "Request-to-settle clocks",
      why: "Every ops screen opens with the clock: request raised at created_at, settlement stamped at shipped_at, delta averaged over stamped rows only — 82 of 103, 2.98 days. Each stage is a conditional count or average over a timestamp, and the first interview question is what the denominator holds — the 14 float rows have no stamp by definition, not by error.",
      slugs: ["average-time-of-process-per-machine", "immediate-food-delivery-ii", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Request ladders & rank ties",
      why: "The power-account ladder runs 24, 17, 14, 13, 5 flows and then THREE accounts tie at 4 — RANK, DENSE_RANK and ROW_NUMBER disagree about shared rungs and gaps, and on a social feed a leaderboard policy about ties is a product statement. Venmo's own growth reviews publish the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Float & fate censuses",
      why: "The ops board gets settled, settling, float and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin; four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Rails & statement reads",
      why: "Money lives one layer down: 28 merchant statements against 27 rail legs, card = instant debit (16 / 37,364.00) and wire = bank transfer (11 / 32,248.00), INTEGER cents everywhere. Coverage is one CASE away — 21 exact, 1 partial, 6 none — and the rails matter because five statements settle on both rails at once.",
      slugs: ["monthly-transactions-ii", "bank-account-summary-ii", "transaction-velocity"],
    },
    {
      name: "Month walks & feed trends",
      why: "The 14-month flow spine (2024-01 to 2025-02) is the engagement call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Declined requests concentrate in July and November, 2 each of 7.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "count-the-number-of-experiments"],
    },
    {
      name: "Nested staging & gates",
      why: "Screens escalate into staging: fold per-account flow counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted; growth targeting is exactly 'which accounts run above the platform's cadence'.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary"],
    },
    {
      name: "Receipt rosters & GROUP_CONCAT",
      why: "The feed receipt is a string fold: one row per flow or statement, every leg's rail or payer count folded into one readable cell — GROUP_CONCAT is how 'card,wire' prints on a split-rail statement. Ordering inside the fold, the NULL-empty-set behavior and the COALESCE label are the three details that separate a real roster from a broken one.",
      slugs: ["group-sold-products-by-the-date", "concatenate-the-name-and-the-profession", "the-pads"],
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
  ],
};
