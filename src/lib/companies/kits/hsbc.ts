// HSBC — kit 5 of the Banking & Capital Markets domain (Batch G).
// Global banking: cross-border flows, correspondent settlement, multi-
// currency quoting — one institution, many markets, and books that must
// prove they tie from Hong Kong to London.
// Pool provenance: 2 tagged sql rows in scripts/company-pools.md
// (expected-credit-loss, structuring-detection) — the pool is mostly
// theme-curated, and the brief says so honestly: every problem mirrors a
// workflow HSBC's settlement ops, corridor analytics and financial-crime
// data teams are known to probe.
// Case studies run on the storefront db, mapped honestly as
// customers = institutional clients (region = home market / corridor),
// invoices = trade & credit facilities (status = paid / open / void),
// payments = settlements on card vs wire rails (INTEGER CENTS — the dollar
// read is amount_cents / 100.0), ledger_entries = the global double-entry
// core — with probed figures from scripts/company-facts.md only.

import type { CompanyKit } from "../types";

export const hsbcKit: CompanyKit = {
  id: "hsbc",
  domainId: "banking",
  name: "HSBC",
  tagline: "Global banking, cross-border flows",
  accent: "text-red-300",

  brief: [
    "HSBC is the world's 'local bank' at planetary scale — a global bank anchored in **Hong Kong and London**, moving money across borders for corporations, institutions and governments, and settling through a correspondent network that never fully sleeps. The business reality is flows, not balances: money that arrives on one rail and leaves on another, markets that open and close in sequence around the clock, and a double-entry core that has to prove — to regulators on several continents at once — that every debit has its credit. The analyst's daily tension is **scale versus proof**: {sky:corridor} volumes are aggregated across markets whose calendars differ, while the underlying books must tie to the cent, everywhere, simultaneously.",
    "The data org is global-function shaped. Settlement operations owns the rail boards — card versus wire, {rose:fail queues}, day-counted {amber:aging}; corridor teams own market-aligned reads — which home markets fund which flows, and how concentrated the book is; financial-crime analytics owns velocity and structuring gates; the global ledger function owns the **trial balance** that gates the close in every jurisdiction. The schema habits are bank-grade: money lands as **INTEGER cents** (a wire rail that settled 3224800 cents prints as 32248 dollars only after the `/100.0`), and the books carry the anomalies that keep global audit interesting — a voided facility that still received its $925.00, a paid facility with zero settlement rows, an installment plan that never finished.",
    "Interview style is global-flavored and set-op heavy. A typical screen walks from a multi-table chain (client → facility → settlement) to a corridor read with a survival rule, then escalates into either a stacked report (two populations, one layout, a grand-total row that must {emerald:reconcile}) or a window sequence (settlement deltas, running balances). Follow-ups probe grain and geography out loud: 'is that per settlement or per client?', 'which {sky:corridor} is your denominator — home market or booking market?'. Candidates who state the fold and the population before the syntax consistently outperform; *the interviewer is watching for someone who can defend a number that three time zones will read before breakfast*.",
    "Preparation strategy: the registry tags **two problems** for HSBC (`expected-credit-loss`, `structuring-detection` — start there, they map onto the provision and velocity-gate screens), so the pool is mostly theme-curated toward the bank's known reads: corridor chains, UNION ALL stacks, running balances, LAG deltas, FX as-of joins. Then run the **six case studies** on the live storefront db: the {emerald:global ledger stack} the close proves with, the {sky:corridor concentration read} settlement ops opens the day with, the no-settlement watchlist the break queue works from, the rail-mix census, the per-corridor whale board and the installment-gap walk.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks HSBC desks rehearse most: the {emerald:global ledger stack} that proves debits equal credits with a TOTAL row riding the detail, the {sky:corridor concentration read} that crowns the market funding the flow, the {rose:no-settlement watchlist} whose six unfunded facilities carry $15,217.00, the {amber:rail-mix census} financial-crime runs one pass per corridor, the whale board that ranks each corridor's largest single hit, and the installment-gap walk the five split plans owe the latency metric. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below; thirty MCQs and twenty-four theory answers round the kit, and the walkthroughs narrate the failure each wrong chip causes — the exact muscle a number that three time zones will read before breakfast demands.",
  ],

  dayInLife: [
    "**07:30 —** the day starts with the corridor boards, in market order. Settlement ops opens the rail mix first: **card settled $37,364.00 across 16 hits**, wire **$32,248.00 across 11** — 27 settlements and $69,612.00 total, which must equal the cash account's debit side before anyone opens a dashboard. Then the global ledger proof: **debits 181,080 against credits 181,080, delta zero**, one conditional SUM per jurisdiction. A mismatch here is a {rose:fire} that spans time zones — the analyst who can write the diff (which account, which corridor, how many cents) before the European desk wakes up owns the day. All money math runs in integer cents; the dollar read happens once, at display, with an explicit /100.0.",
    "**11:00 —** midday is {sky:corridor} deep-dive, and concentration goes first. Settlements fold by client home market, with the board asking the denominator question — share of settled dollars, share of settlement count, share of funded clients, *three different truths from the same rows*. Each share ships with its denominator printed beside it, because on this board the denominator is the metric.",
    "**14:00 —** the coverage census runs next. Every facility is classified exact / partial / nothing against money received — **21 exact totalling $65,612.00**, six with nothing totalling **$15,217.00**, one partial at 4000 of 6148 — and the anomalies the classification must be allowed to surface ({rose:voided} #11 received its $925.00; paid #28 has zero settlements). The fan-out rule is recited like a litany: **five facilities** carry two settlement rows each, so the money side pre-aggregates before it joins, or the corridor double-counts.",
    "**15:30 —** the afternoon is stakeholder cycles that circle the planet. Financial-crime analytics wants the velocity gate rerun — {amber:structuring}-detection shapes with `HAVING` thresholds that must be defensible to a regulator. The global ledger function wants the account stack with its TOTAL row: per-account debits and credits plus the one grand row that must read **181,080 / 181,080, delta zero**, in the same breath as the per-account detail. Trade finance wants settlement latency — **28.4 days** average against a uniform 30-day clock — by corridor, with the population rule stated. Every number ships with its SQL attached, because the defense of a global number is a reproducible query, not a slide.",
  ],

  metrics: [
    { name: "Corridor concentration", what: "Settlements folded by client home market — count, dollars and funded clients per corridor. The board's opening read: which markets fund the flow, and how much of the book rides on the top one." },
    { name: "Rail mix", what: "Settled dollars split card vs wire — card 16 settlements / $37,364.00 against wire 11 / $32,248.00. Client-initiated rails versus correspondent wires; the mix is a managed number in every market review." },
    { name: "Global ledger proof", what: "Debits equal credits across the double-entry core — 181,080 against 181,080, delta zero. The identity the close proves in every jurisdiction; a nonzero delta stops the world." },
    { name: "Per-account flow fold", what: "Each ledger account's debits, credits and net — cash $69,612.00 in / $25,416.00 out, receivables $86,052.00 / $69,612.00. The stack whose TOTAL row must reconcile to the global proof." },
    { name: "Cross-book coverage", what: "Every facility classified exact / partial / nothing: 21 exact ($65,612.00), 6 nothing ($15,217.00), 1 partial (#25 at 4000 of 6148). The coverage census that survives every audit." },
    { name: "Settlement latency", what: "Days from facility issue to first settlement on the paid book — average 28.4, fastest 13, slowest 84 — against a uniform 30-day clock. Cross-border cash-cycle speed, measured per corridor." },
    { name: "Split-settlement incidence", what: "Facilities settled in installments — five of them (#1, 5, 12, 19, 22) carry two payment rows each. The fan-out watchlist behind every corridor SUM: pre-aggregate or double-count." },
    { name: "Label-vs-movement flags", what: "Facilities where the label and the money disagree: voided #11 received ($925.00), paid #28 unfunded ($1,756.00). The flags financial-crime and audit both watch, from different angles." },
  ],

  topics: [
    {
      name: "Corridor chains across three tables",
      why: "Every corridor read is a chain — client → facility → settlement — and the chain's grain is the whole test: one join row is a client-facility-settlement triple, and COUNTs at three different grains disagree the moment a client repeats. HSBC opens screens here because global reporting lives or dies on join discipline.",
      slugs: ["number-of-trusted-contacts-of-a-customer", "students-and-examinations", "top-competitors", "customers-who-never-order"],
    },
    {
      name: "Settlement stacks & grand totals",
      why: "Global close reporting stitches populations into one layout — per-account detail plus a TOTAL row — with UNION ALL, not UNION: the grand row must survive, and column positions must line up or the stack silently mislabels two businesses. Branch totals reconciling to the grand row is the audit the close runs on itself.",
      slugs: ["count-salary-categories", "team-scores-in-football-tournament", "monthly-transactions-ii"],
    },
    {
      name: "Set ops across markets",
      why: "Corridor work is set work: markets that settled card but not wire, clients present in two rails, facilities in one jurisdiction and not another. UNION, INTERSECT and EXCEPT each answer a different global question — and dedupe semantics matter when the same settlement can surface from two feeds.",
      slugs: ["movie-rating", "the-airport-with-the-most-flights", "league-statistics"],
    },
    {
      name: "Settlement sequences & windows",
      why: "Flow analytics keeps every row: the latest settlement per facility, the day's largest transaction, the most recent three hits per corridor. Windows beat GROUP BY here because the board wants detail and rank together — and ties are routine when thousands of settlements share a day.",
      slugs: ["maximum-transaction-each-day", "the-most-recent-three-orders", "biggest-window-between-events"],
    },
    {
      name: "Running balances across the day",
      why: "Settlement ops thinks in running money: the cash account's balance as hits land, cumulative flow per corridor, cumulative settled value per market. Frame discipline — ROWS vs RANGE — decides whether the running total matches the auditor's replay of the day.",
      slugs: ["account-balance", "game-play-analysis-iii", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "LAG & LEAD flow deltas",
      why: "Cross-border flows are judged by deltas: days between installments, value moved since the last hit, the gap between a facility's settlements. LAG partitions per facility and returns NULL on the first row — the NULL the analyst must handle deliberately, not accidentally.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "year-on-year-growth-rate", "second-day-confirmation"],
    },
    {
      name: "Velocity gates & structuring shapes",
      why: "The tagged problem structuring-detection is the archetype: HAVING-guarded thresholds over grouped money movement, where the gate must be defensible line by line. Velocity bursts and aggregate gates are the financial-crime screen — and the wrong threshold placement silently waves the real pattern through.",
      slugs: ["structuring-detection", "transaction-velocity", "suspicious-bank-account-transactions"],
    },
    {
      name: "Provision & risk-weighted folds",
      why: "The tagged problem expected-credit-loss is the shape: exposure weighted by loss factor per band, summed to a provision that must tie across jurisdictions. Weighted folds punish integer division and mis-scoped denominators — the arithmetic regulators rerun first.",
      slugs: ["expected-credit-loss", "risk-based-pricing", "value-at-risk"],
    },
    {
      name: "FX & as-of joins",
      why: "Multi-currency quoting is as-of discipline: which rate was in force at settlement time, not at report time. Point-in-time joins and latest-rate lookups are the FX muscle — and the classic failure is joining to today's rate, restating yesterday's flows in a currency they never traded in.",
      slugs: ["fx-exposure-report", "product-price-at-a-given-date", "point-in-time-asof"],
    },
    {
      name: "Money math on integer cents",
      why: "The global books keep money in integer cents, so every dollar read is amount_cents / 100.0 — once, at display — and every ratio sits one misplaced integer away from a truncation leak that reads differently in each market's report. Trial-balance eyes are the culture here, not a module.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "npv-queries"],
    },
  ],

  theory: [
    {
      id: "hsbc-t1",
      q: "A corridor report chains clients to facilities to settlements. What is one row of that join, and how do you count clients, facilities and settlements correctly in the same query?",
      a: "One join row is a client-facility-settlement triple — the fan-out multiplies with every level, so 'a row' is the first thing to say out loud. Then count at three grains on the same fold: COUNT(DISTINCT c.id) for clients, COUNT(DISTINCT i.id) for facilities, COUNT(p.id) for settlements. On the probed book that's 27 settlements against fewer distinct facilities (five of them carry two payment rows) against fewer still clients — three honest numbers that answer three different questions: load, book depth, breadth of relationships. The failure interviewers set up is bare COUNT(*), which reads 33 on this book (27 matches + 6 unfunded facilities) and silently calls facility-payment pairs 'corridor volume'. Corridor reporting without grain discipline isn't conservative or aggressive — it's just a different, fictional bank.",
      tag: "joins",
    },
    {
      id: "hsbc-t2",
      q: "Your close stack needs per-account detail plus one grand-total row. Walk me through the shape — and why UNION ALL, not UNION?",
      a: "Two folds, one layout, stacked: the per-account SELECT groups ledger_entries by account and folds SUM(debit_cents), SUM(credit_cents); the grand SELECT folds the whole table and labels itself 'TOTAL'; UNION ALL glues them. UNION ALL because the two branches are different populations and deduplication would be a bug wearing a keyword's clothes — if an account's totals ever exactly equal the grand totals (a single-account book), UNION would silently delete the detail row and the close would ship one line short. The discipline that makes stacks auditable: identical column lists in identical order (position, not name, is what the database checks), and the TOTAL row reconcilable against the detail — 181,080 against 181,080, delta zero, provable in the same breath as the per-account read. ORDER BY on the stacked result then places the grand row deliberately, not accidentally.",
      tag: "aggregation",
    },
    {
      id: "hsbc-t3",
      q: "You fold settlements by corridor and the board asks for each corridor's share of settled value. Where do the denominators come from, and what breaks if you filter corridors first?",
      a: "Share needs a global denominator: total settled value across ALL corridors — on the probed book $69,612.00 (card $37,364.00 + wire $32,248.00) — which comes from a SUM over the whole population, delivered via a window (SUM(…) OVER ()) or a CTE, not from the corridor's own group. The classic break is filtering corridors in WHERE and then 'computing a share': the denominator shrinks to the surviving corridors and every share silently renormalizes — the corridor you dropped doesn't read zero, it reads as if it never existed. Also name the population choice out loud: share of settled dollars, share of settlement count, and share of funded clients are three different concentrations and can disagree — a corridor can hold many small settlements or few large ones. The board gets the one it asked for, labeled, with the other two a follow-up away.",
      tag: "pipeline",
    },
    {
      id: "hsbc-t4",
      q: "Settlement ops wants the days between each facility's installments. Build it — and what does LAG hand you on the first row of every partition?",
      a: "Window per facility: LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on) puts each settlement beside its predecessor, and julianday(paid_on) − julianday(prev_paid_on) is the installment gap in days. The first row of every partition has no predecessor, so LAG returns NULL — the honest signal, not an error, and the branch point: COALESCE the gap against the facility's issue date when the walk should start at billing, or filter the NULL explicitly when the metric is strictly installment-to-installment. On this book five facilities carry two settlement rows each, so the gaps are real money movement — a corridor latency metric built without handling the first row would either drop those facilities' openings or average NULLs into silence. The strong answer names the partition key, the order, the NULL policy and the population it leaves behind — in that order.",
      tag: "windows",
    },
    {
      id: "hsbc-t5",
      q: "In a coverage classification, why does the LEFT JOIN's NULL arm matter more here than an ELSE branch ever could?",
      a: "Because the NULL arm catches a population the ELSE branch never sees: facilities with no settlement rows at all. The money side pre-aggregates to one row per facility and LEFT-joins; the six unfunded facilities arrive with NULL totals — and NULL is not zero, not unknown-by-choice, it's 'no money moved', which is exactly the coverage class 'nothing' ($15,217.00 across six facilities on the probed book). If the fold inner-joins or the WHERE touches the right table, those rows vanish before any CASE runs, and the classification reports only the funded world: 21 exact + 1 partial = 22 of 28 facilities, with the exposure silently missing. The ELSE branch's job is different — it guarantees the funded facilities land in some named class ('partial' when totals disagree). Two different exhaustiveness guarantees: the LEFT JOIN arm guarantees who ENTERS the classification; the ELSE guarantees everyone who entered gets a label. A regulator-facing census needs both.",
      tag: "nulls",
    },
    {
      id: "hsbc-t6",
      q: "A velocity gate flags clients whose settlement count crosses a threshold in a window. Where does the threshold live, and what's the failure mode of putting it in the wrong clause?",
      a: "The gate judges a folded group — settlements per client per window — so it lives in HAVING, after GROUP BY, on the aggregate itself: HAVING COUNT(*) >= 5 means five or more settlement events folded. WHERE runs before the fold and can only judge single rows; a threshold there either errors (aggregates aren't visible yet) or — worse — filters rows first and the gate then counts a trimmed population, waving through a pattern it was built to catch. That second failure is the dangerous one because it's silent and directionally wrong: a structuring pattern that splits money into bursts survives a gate whose denominator the WHERE already shrank. The strong answer also pins the window definition — calendar day, rolling 7-day, or settlement-session — because the same HAVING threshold means three different things on those three clocks, and financial-crime thresholds are only defensible when their clock is written down.",
      tag: "pipeline",
    },
    {
      id: "hsbc-t7",
      q: "Markets settle on different calendars but the books close in one instant. How do you bucket cross-border settlements into a comparable timeline?",
      a: "Pick one clock and state it. The house shapes: STRFTIME('%Y-%m', paid_on) folds TEXT timestamps into month buckets on UTC — comparable across corridors, and the '%Y-%m' literal is the whole contract; julianday() turns any settlement into a real number for latency math (issue to first payment averaged 28.4 days here against a uniform 30-day terms clock); half-open intervals ([window_start, window_end)) for windows, because BETWEEN on a date literal loses everything after midnight — and the settlement that posts at 23:59 in Hong Kong is exactly the one a BETWEEN loses. The trap that bites global teams is mixing clocks: booking-market dates against settlement-market dates, or a report rerun 'now' instead of against a stamped reference date — buckets shift retroactively and the corridor trend becomes unreproducible. One clock, stamped, in the query, is the discipline regulators can replay.",
      tag: "dates",
    },
    {
      id: "hsbc-t8",
      q: "How do you prove, in SQL, that a global book with anomalies is healthy — and where does the query's authority end?",
      a: "Prove the identities, then surface the exceptions, then stop. Identity one: the trial balance — SUM(debit_cents) equals SUM(credit_cents), 181,080 against 181,080, delta zero, one conditional fold. Identity two: the census — every classification's branches sum to the whole: 28 facilities as paid/open/void and as exact/partial/none; 27 settlements folding from 22 funded facilities plus six unfunded. Exception hunt: label versus movement — status says void but #11 received its $925.00; status says paid but #28 has zero settlement rows; #25 sits at 4000 of 6148 partial. A healthy book with a documented anomaly list is a defensible book; a clean-looking book with no anomaly query is just unaudited. Where the authority ends: SQL can prove arithmetic consistency and surface disagreements — it cannot rule which side is TRUE. Whether the void label or the received $925.00 is the error is a human, jurisdictional judgment. Saying that boundary is what makes the rest of the answer credible.",
      tag: "quality",
    },
    {
      id: "hsbc-t9",
      q: "Markets that settled on the card rail but never on wire — build the read. When does EXCEPT beat the LEFT JOIN + IS NULL arm?",
      a: "Two folds, one set shape: SELECT corridor FROM legs WHERE method = 'card' EXCEPT SELECT corridor FROM legs WHERE method = 'wire'. EXCEPT answers 'in the left population, never in the right' at set grain — corridors, deduped; on this book it reads US alone, the corridor whose five legs all cleared card while EU and APAC rode both rails. The LEFT JOIN + IS NULL arm answers the same question at row grain and wins when the surviving rows must carry columns a set op won't keep — facility numbers, amounts, the corridor detail. Say the two differences out loud: EXCEPT dedupes, which a corridor list wants, and EXCEPT is NULL-safe where NOT IN collapses to silence on one NULL — the set op just compares rows.",
      tag: "setops",
    },
    {
      id: "hsbc-t10",
      q: "The corridor census needs settled, in-flight, pending and fallen counts side by side from one scan. Walk me through the conditional-aggregation shape.",
      a: "One GROUP BY corridor, four conditional folds: SUM(CASE WHEN status = 'settled' THEN 1 ELSE 0 END) per state, aliased with the state's own name. One scan, one shared population, and every corridor row complete — a state with no rows prints 0, not a missing column, because an absent cell reads as 'no settlements' to a regulator who then asks why the corridor exists at all. FILTER (WHERE …) is the same intent with cleaner syntax when the engine speaks it; CASE is the portable shape every desk can read. The discipline neither tool provides is population: a WHERE that trims the book first shrinks every column at once — gates run after the census, never inside it.",
      tag: "aggregation",
    },
    {
      id: "hsbc-t11",
      q: "The running-balance replay of the cash account: two settlements share a timestamp. Which window frame matches the auditor's walk, and why?",
      a: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — every row steps the balance once, and the replay ties to the ledger line by line. RANGE, the default, treats same-timestamp rows as peers: both hits show one combined cumulative value, a two-leg jump printed as one step, and the walk no longer matches the books. Ties are routine on a book that clears in rail batches, so the frame keyword is load-bearing, not style. The strong answer states the replay contract first — one row, one balance step — and lets the frame fall out of it.",
      tag: "windows",
    },
    {
      id: "hsbc-t12",
      q: "How do you prove, inside one query, that a stacked report's TOTAL row reconciles to the detail rows above it?",
      a: "By construction and by check: the grand SELECT scans the same table the detail folded, so its cells equal the column sums of the detail whenever the fold is complete — that's the construction UNION ALL preserves. The check is arithmetic in the open: per-account debits beside the grand row, delta = grand − SUM(detail) computed as data, delta zero ships, nonzero stops the close. The failure mode is UNION: on a single-account book the detail row equals the grand row, dedup deletes it, and the reconciliation proves nothing because one side silently vanished. A stack that can't be reconciled from its own rows isn't a close report — it's a screenshot.",
      tag: "quality",
    },
    {
      id: "hsbc-t13",
      q: "Trade finance wants facility-to-first-settlement latency against the 30-day terms clock. Build it — and what does the population rule say?",
      a: "Two moves. Pre-fold the money side: MIN(paid_on) per facility, because 27 settlements ride 22 facilities and five carry two rows — latency is a facility metric, not a leg metric. Then julianday(first_hit) − julianday(issued_on) is the latency in days: fastest 13, slowest 84, against a uniform 30-day terms clock. The population rule: the average covers facilities WITH a first settlement — unfunded facilities have no latency, they have an exposure, and mixing the two populations invents a number that ties to nothing. Ship the band read beside the mean: the corridor whose slowest hit drifts past terms is a working-capital call, not a footnote.",
      tag: "dates",
    },
    {
      id: "hsbc-t14",
      q: "The provision fold: exposure weighted by loss factor per band, summed across jurisdictions. Where does the arithmetic bite?",
      a: "Two places, both classic. Integer division: SUM(exposure_cents * loss_bp) must divide by 10000.0 once at the edge — dividing per row by 10000 truncates every band's cents away, and bands are exactly where the cents live, so the provision drifts low by construction. Band scoping: the loss factor is a property of the BAND, so the weight must join from the band's own row; weighting exposures with a neighboring band's factor produces a provision that still balances to a number — just not to anything true. Regulators rerun this band by band, so the defensible query ships the per-band rows beside the total and states the fold's grain before its syntax.",
      tag: "aggregation",
    },
    {
      id: "hsbc-t15",
      q: "Multi-currency reporting: each settlement must restate at the rate in force when it cleared, not today's. Build the as-of join.",
      a: "The as-of shape: JOIN rates r ON r.currency = p.currency AND r.effective_on = (SELECT MAX(effective_on) FROM rates r2 WHERE r2.currency = p.currency AND r2.effective_on <= p.paid_on) — the latest rate that went live at or before the settlement. The failure interviewers set up is joining to today's rate: yesterday's corridor flow restates in a currency it never traded in, and the restatement is silent — the FX read and the books disagree with no error anywhere. State the boundary convention out loud: effective_on <= paid_on keeps a rate that went live the same day, which is a house policy to declare, not a detail to discover mid-review. The as-of rule is the whole answer; the syntax is its transcription.",
      tag: "subqueries",
    },
    {
      id: "hsbc-t16",
      q: "Concentration tiers for the corridor board: ties must share a rung with no missing tier beneath. Which ranking function, and why?",
      a: "DENSE_RANK() OVER (ORDER BY settled_dollars DESC) — tied corridors share rung 1 and the next tier reads rung 2, no gaps. RANK is honest but gappy: 1, 1, 3 invents a missing tier 2 no corridor occupies, and the board reads a hole. ROW_NUMBER splits the tie by plan order — rerun the query and the crowned corridor can swap; nondeterminism on a board the whole desk reads is the one thing worse than a gap. Tier reads also ship the tie visible rather than hidden: two corridors at one rung IS the concentration story, and DENSE_RANK is the only function that prints it without editorializing.",
      tag: "windows",
    },
    {
      id: "hsbc-t17",
      q: "A velocity gate flags clients crossing a settlement-count threshold. Why does the clock definition matter as much as the threshold?",
      a: "Because the same HAVING number is three different gates on three clocks: calendar-day COUNT >= 5 buckets on the date key and resets at midnight; a rolling 7-day gate needs a frame (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) and drifts with the data; a settlement-session gate follows the market calendar. A pattern that bursts at 23:50 and 00:10 is one gate's single event and another gate's two — the threshold's defense lives in the clock, not the number. The defensible answer names clock, population and threshold in one sentence, because a gate the analyst can't restate is a gate the regulator can't rerun.",
      tag: "pipeline",
    },
    {
      id: "hsbc-t18",
      q: "One board needs the card census and the wire census stacked. What does UNION ALL demand from the two branches, and what fails silently?",
      a: "Positional contract: same number of columns, same order, compatible types — column names come from the FIRST branch only, and the engine checks nothing beyond that. The silent failure is swapped positions: a branch that lists dollars, count under a header that says count, dollars ships with no error and a cross-foot that can't tie. The hygiene that makes stacks auditable: identical SELECT lists written side by side for visual diffing, a literal rail column so every row self-identifies which population it came from, and the cross-foot — card dollars + wire dollars must tie to the settled total — run in the same breath as the read, not the next morning.",
      tag: "setops",
    },
    {
      id: "hsbc-t19",
      q: "COUNT(*) FILTER (WHERE …) versus the CASE fold — when does each earn its place in a corridor census?",
      a: "They're the same census: COUNT(*) FILTER (WHERE status = 'settled') and SUM(CASE WHEN status = 'settled' THEN 1 ELSE 0 END) — one scan, per-corridor columns, empty states printing 0. FILTER reads like the metric it computes and keeps the CASE machinery out of wide censuses with six or eight state columns; CASE is the portable shape every engine and every reviewer knows. What neither fixes is the population: FILTER counts rows that survived WHERE, so a WHERE trimming the book first shrinks every column at once and the group totals stop reproducing. The census discipline is one scan of the full population — gates afterwards, in HAVING, where they're visible.",
      tag: "aggregation",
    },
    {
      id: "hsbc-t20",
      q: "The desk wants the corridor book quartiled by settled dollars. How does NTILE work, and what's the follow-up question you should answer before it's asked?",
      a: "NTILE(4) OVER (ORDER BY settled_dollars DESC) deals the corridors into four near-equal COUNT buckets — quartiles by rank, not by value. The follow-up is definitional: quartiles by count mean the top bucket holds as many corridors as the bottom, so 'top-quartile corridor' is a rank claim, not a severity claim — value concentration shows up as the top bucket's share of settled dollars, printed beside the bucket number. Banding by VALUE thresholds needs CASE instead; NULLs sort last in the window order, so decide whether unfunded corridors enter the deal or sit out, and say which. NTILE answers 'who's in which quarter of the book'; it never answers 'how much of the book is that quarter'.",
      tag: "windows",
    },
    {
      id: "hsbc-t21",
      q: "Why do the day-board buckets use half-open intervals instead of BETWEEN — and what does BETWEEN actually get wrong?",
      a: "BETWEEN on timestamps includes the upper bound: paid_on BETWEEN '2025-01-28' AND '2025-01-29' claims both days' midnights, so the settlement that batch-posts at 2025-01-29 00:00:00 counts in BOTH windows — volume neither market owns, invented at the seam. Half-open predicates — paid_on >= '2025-01-28' AND paid_on < '2025-01-29' — tile the timeline with no overlap and no gap, which is what a board read simultaneously in Hong Kong and London needs. Date-only columns can BETWEEN safely because the upper bound is the day's last instant; the moment the column carries a time, the predicate must say which world it's in. The trap is silent: no error, just two days sharing one settlement.",
      tag: "dates",
    },
    {
      id: "hsbc-t22",
      q: "Keep only corridors whose settled share beats 40%. Why stage the fold in a CTE, and what does filtering without staging do?",
      a: "Two passes the pipeline won't fuse: the fold computes each corridor's share beside a window denominator — SUM(amount_cents) OVER () over the whole book, $69,612.00 here — and WHERE cannot see that output, because windows evaluate after WHERE. Stage the fold in a CTE, filter outside: WHERE share > 0.4 with the denominator still printed beside every surviving row. Filter the corridors first and compute share over the survivors and the denominator silently renormalizes — the corridor you dropped doesn't read zero, it reads as if it never existed, and every remaining share inflates. Staging isn't ceremony; it's the difference between a share and a vibes read.",
      tag: "pipeline",
    },
    {
      id: "hsbc-t23",
      q: "In the coverage census, three tools touch NULLs: the LEFT JOIN arm, the ELSE branch, and COALESCE. Keep their jobs straight.",
      a: "Three jobs, three tools. The LEFT JOIN arm decides who ENTERS the census — the six unfunded facilities arrive with NULL totals, and that NULL is the fact 'no money moved'. The ELSE branch decides how everyone who entered gets LABELED — 'partial' when money-in disagrees with billed. COALESCE decides what PRINTS — 0.00 at the display edge instead of NULL on a regulator's page. Swap the jobs and the census breaks silently: COALESCE before the CASE turns no-leg rows into zero-paid rows that some arm misreads, and the $15,217.00 nothing-book joins the funded world without a trace. Membership sees NULL; labels see the ELSE; the page sees COALESCE — and the order ships in the caption.",
      tag: "nulls",
    },
    {
      id: "hsbc-t24",
      q: "The break queue ships a roll-call cell: every facility number in one text column. How do you fold it — and where does the fold's honesty end?",
      a: "GROUP_CONCAT(i.number) per corridor, with ORDER BY inside the fold so the cell reproduces run over run, and DISTINCT where split settlements repeat a number. Treat it as text, not math: the cell proves MEMBERSHIP — who's in the bucket — while the SUM column beside it proves VALUE; a corridor of five tiny facilities and one of two whales produce the same cell width. The honesty ends at arithmetic: nothing about the cell aggregates, orders money, or survives a currency question, so it never substitutes for the fold beside it. Roll-call and census ship together; the text is the evidence, the number is the finding.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "hsbc-mcq-1",
      prompt: "The close stack needs per-account detail plus one 'TOTAL' row. Which operator appends it without any risk of silently dropping a detail row?",
      choices: [
        "UNION — dedupe keeps the stack clean",
        "UNION ALL — no deduplication, both branches survive",
        "INTERSECT — keeps only rows in both branches",
        "JOIN ON account = 'TOTAL'",
      ],
      answer: 1,
      why: "UNION ALL stacks two different populations verbatim — detail plus grand row, nothing deduplicated. The grand row must survive by construction, and on a single-account book UNION could delete the detail row that happens to equal the total.",
      notes: [
        { choice: 0, why: "UNION dedupes across branches: if one account's totals equal the grand total, the detail row silently vanishes and the close ships a line short." },
        { choice: 2, why: "INTERSECT returns rows BOTH branches share — here that's almost always nothing, the opposite of a stack." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-2",
      prompt: "The wire rail settled 3224800 cents across its rows. Which expression prints the dollar figure once, correctly?",
      choices: [
        "SUM(amount_cents) / 100",
        "SUM(amount_cents) / 100.0",
        "SUM(amount_cents / 100)",
        "ROUND(SUM(amount_cents))",
      ],
      answer: 1,
      why: "Fold the cents first, then divide by 100.0 once at the display edge — REAL division preserves every cent (32248.0). The /100.0 is the house conversion because INTEGER/INTEGER truncates on the first odd-cent row.",
      notes: [
        { choice: 0, why: "Fine while every row is whole dollars — and silently truncating the day one isn't. The .0 is the control, not a style preference." },
        { choice: 2, why: "Dividing per row before the fold re-enters integer arithmetic early; drift compounds row by row into the SUM." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-3",
      prompt: "Clients ⋈ facilities ⋈ settlements: 27 settlements, 22 facilities carry them, five of those have two settlements each. What does COUNT(p.id) return per corridor fold?",
      choices: [
        "The number of distinct facilities in the corridor",
        "The number of settlement rows — 27 across all corridors",
        "The number of client-facility pairs",
        "COUNT(*) minus NULL rows",
      ],
      answer: 1,
      why: "COUNT(p.id) counts matched settlement rows — the load on the rails, 27 total. Facilities need COUNT(DISTINCT i.id) (22), clients COUNT(DISTINCT c.id) — three grains, three truths from one join.",
      notes: [
        { choice: 0, why: "Facility count needs DISTINCT — bare COUNT(p.id) counts the split facilities' second rows too, reading 27 where the facility census reads 22." },
        { choice: 3, why: "There are no NULL p.id rows in an INNER chain — COUNT(p.id) equals COUNT(*) here, so 'minus NULLs' describes a difference that doesn't exist." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-4",
      prompt: "The ledger stack orders by account with the grand row labeled 'TOTAL'. With ORDER BY account DESC, where does the TOTAL row land — and why?",
      choices: [
        "First — uppercase sorts before lowercase",
        "Last — DESC reverses alphabetical order, and 'TOTAL' sorts before lowercase names",
        "In the middle — NULL accounts sort last",
        "Wherever it was inserted — ORDER BY ignores the stacked row",
      ],
      answer: 1,
      why: "In SQLite's binary collation uppercase letters sort before lowercase, so 'TOTAL' sorts ahead of 'accounts_receivable', 'cash', etc. — meaning ASC puts the grand row first and DESC puts it last, after the detail. The placement is a collation fact, not a convention.",
      notes: [
        { choice: 0, why: "That's ASC's behavior — uppercase-first collation puts TOTAL at the top of an ascending sort. DESC flips it to last." },
        { choice: 3, why: "ORDER BY applies to the stacked result as a whole — the grand row is just a row with a label, and it sorts by the same collation as everything else." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-5",
      prompt: "Flag corridors carrying at least 5 settlements. Which clause holds the gate?",
      choices: [
        "WHERE COUNT(*) >= 5",
        "HAVING COUNT(*) >= 5",
        "LIMIT 5",
        "ORDER BY COUNT(*) >= 5",
      ],
      answer: 1,
      why: "The condition judges a folded group, so it lives in HAVING after GROUP BY — evaluated on the per-corridor count. WHERE runs before the fold and can't see aggregates; LIMIT truncates rows, it doesn't filter groups.",
      notes: [
        { choice: 0, why: "Aggregates aren't visible to WHERE — this errors. The subtler version of this mistake (filtering rows first, then gating) doesn't error; it just polices a smaller population." },
        { choice: 2, why: "LIMIT 5 returns the first five rows — a row-count cap, not a threshold on settlement counts. Different question entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-6",
      prompt: "You LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on) to measure installment gaps. On each facility's first settlement row, LAG returns…",
      choices: [
        "The facility's issue date",
        "Zero days",
        "NULL — there is no previous row in the partition",
        "The last settlement of any facility",
      ],
      answer: 2,
      why: "LAG looks one row back within the partition; the first row has nothing behind it, so it returns NULL. The gap math must COALESCE (against issue date, if the walk starts at billing) or filter that row explicitly — silence is not an option.",
      notes: [
        { choice: 0, why: "LAG never reaches outside its partition for a fallback — issue date would have to be COALESCE'd in deliberately. Unhandled, the value is NULL, not the issue date." },
        { choice: 3, why: "PARTITION BY fences the lookup — LAG can never see across facilities. The window's whole point is per-facility continuity." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-7",
      prompt: "Five facilities carry two settlement rows each. A coverage query joins facilities straight to settlements and tests money per row. What must change?",
      choices: [
        "Add DISTINCT to the SELECT",
        "Pre-aggregate the money side to one row per facility, then join one-to-one",
        "Switch to a CROSS JOIN to see every combination",
        "Cast the amounts to REAL before joining",
      ],
      answer: 1,
      why: "After the bare join, one row is a facility-payment pair, and each split facility gets judged once per installment — exact books mislabel as partial. Fold first (SUM … GROUP BY invoice_id), then join one-to-one, then classify; the probed coverage census (21 / 1 / 6) depends on it.",
      notes: [
        { choice: 0, why: "DISTINCT dedupes identical rows — two unequal installments are still two rows. The fan-out survives DISTINCT because the rows differ." },
        { choice: 2, why: "CROSS JOIN multiplies every facility by every settlement — the maximal fan-out, moving exactly the wrong direction. Grain discipline means fewer rows per facility, not more." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-8",
      prompt: "The settlement feed's invoice_id can contain NULLs. Which hunt for unfunded facilities silently returns zero rows when one appears?",
      choices: [
        "LEFT JOIN payments … WHERE p.id IS NULL",
        "WHERE i.id NOT IN (SELECT invoice_id FROM payments)",
        "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "A LEFT JOIN with the IS NULL arm in ON",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — UNKNOWN propagates and the entire result empties, with no error. On a global book a silently-empty exception report reads as 'every corridor funded', which is precisely the failure auditors probe for.",
      notes: [
        { choice: 0, why: "The LEFT JOIN arm is NULL-proof by construction — unmatched rows surface whatever the feed contains. It's the house shape for exactly this reason." },
        { choice: 2, why: "NOT EXISTS is NULL-safe: the EXISTS test simply returns FALSE when no matching row exists, NULLs included. It reports the right unfunded set." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-9",
      prompt: "You need corridors whose settled value beats the all-corridor average. Which shape computes that honestly?",
      choices: [
        "WHERE settled_dollars > AVG(settled_dollars)",
        "HAVING settled_dollars > (SELECT AVG(t.settled) FROM (…all corridors…) t)",
        "HAVING settled_dollars > AVG(settled_dollars)",
        "WHERE settled_dollars > MAX(settled_dollars) / 2",
      ],
      answer: 1,
      why: "The average is over the whole population, so it's computed in an inner fold over all corridors and compared in HAVING — a scalar subquery (or window AVG() OVER ()). The group's own aggregate can't serve as its own benchmark.",
      notes: [
        { choice: 0, why: "WHERE can't see aggregates at all — and even conceptually, the average must come from every corridor, not be computed mid-fold." },
        { choice: 3, why: "Half the maximum is not the average — on a concentrated book the two diverge wildly, and the gate silently changes meaning." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-10",
      prompt: "Which fold produces one row per client home market with its settled dollar total?",
      choices: [
        "SELECT c.region, SUM(p.amount_cents) … GROUP BY c.region",
        "SELECT c.region, SUM(p.amount_cents) … ORDER BY c.region",
        "SELECT c.region, p.amount_cents … GROUP BY c.region",
        "SELECT DISTINCT c.region, p.amount_cents",
      ],
      answer: 0,
      why: "GROUP BY region folds every settlement into its corridor and SUM aggregates the cents — the corridor fold every board here opens with (then /100.0 for dollars). DISTINCT dedupes identical pairs; it never aggregates.",
      notes: [
        { choice: 1, why: "ORDER BY sorts — without GROUP BY, SUM over the mixed rows isn't a legal aggregate query with the bare region column alongside it." },
        { choice: 3, why: "DISTINCT returns unique (region, amount) pairs — dozens of rows, one per distinct amount. The fold that makes one row per market is GROUP BY." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-11",
      prompt: "Financial-crime wants the corridors that cleared card legs but show no wire leg at all. Which set operation answers 'card corridors minus wire corridors'?",
      choices: [
        "UNION — merges both rail folds",
        "EXCEPT — rows in the first fold that never appear in the second",
        "INTERSECT — corridors present on both rails",
        "UNION ALL — stacks both folds raw",
      ],
      answer: 1,
      why: "EXCEPT is the minus: every row of the left fold that has no counterpart in the right. On this book card-minus-wire reads US alone — five card legs, zero wire — while UNION would list every rail corridor and INTERSECT would list the both-rails corridors, the opposite of the ask.",
      notes: [
        { choice: 0, why: "UNION answers 'corridors on EITHER rail' — a universe, not a difference. The exclusion the ask names is EXCEPT's whole job." },
        { choice: 2, why: "INTERSECT keeps what both folds SHARE — EU and APAC, the corridors that rode both rails. The ask wants the one that didn't." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-12",
      prompt: "One pass over the settlement legs must print card legs and wire legs as two columns per corridor. Which shape does it without two scans?",
      choices: [
        "GROUP BY method — one column, two rows per corridor",
        "SUM(CASE WHEN method = 'card' THEN 1 ELSE 0 END), SUM(CASE WHEN method = 'wire' THEN 1 ELSE 0 END) beside GROUP BY corridor",
        "A self-join of the legs table on method = method",
        "Two scalar subqueries per corridor row",
      ],
      answer: 1,
      why: "Conditional aggregation is the pivot: each CASE folds one rail's rows into its own column over the same GROUP BY — one scan, states side by side, a corridor with no wire legs printing 0 rather than vanishing. GROUP BY method stacks the rails as rows; the board reads columns.",
      notes: [
        { choice: 0, why: "That's the stacked shape — two rows per corridor that a reader must mentally unstack. The census ask is one row per corridor, columns beside each other." },
        { choice: 2, why: "A self-join on method = method pairs card rows with wire rows and multiplies — fan-out in the direction the board never asked for." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-13",
      prompt: "Trade finance measures facility-to-first-settlement latency. issued_on and paid_on are TEXT dates. Which computes the gap in days?",
      choices: [
        "paid_on - issued_on",
        "julianday(paid_on) - julianday(issued_on)",
        "DATEDIFF(day, issued_on, paid_on)",
        "julianday(paid_on) - issued_on",
      ],
      answer: 1,
      why: "julianday() converts each date to a real day number, so the difference IS days — on the paid book this runs from 13 fastest to 84 slowest against the 30-day terms clock. TEXT minus TEXT is not date arithmetic, and DATEDIFF is another dialect's function.",
      notes: [
        { choice: 0, why: "SQLite evaluates '2024-03-05' - '2024-02-20' as number-minus-number of two non-numeric strings — 0, not days. Silent and wrong." },
        { choice: 3, why: "One side converted, one side raw: the raw TEXT coerces to a year-like integer and the 'latency' measures millennia. Both arms convert or neither does." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-14",
      prompt: "The whale board ranks corridors by their largest settlement; two corridors tie at the top and the board refuses to invent a missing tier 2. Which function?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY dollars DESC)",
        "RANK() OVER (ORDER BY dollars DESC)",
        "DENSE_RANK() OVER (ORDER BY dollars DESC)",
        "NTILE(4) OVER (ORDER BY dollars DESC)",
      ],
      answer: 2,
      why: "DENSE_RANK packs ties with no gaps: 1, 1, then 2 — tiers without a hole. RANK stamps 1, 1, 3 and invents a missing tier 2; ROW_NUMBER splits the tie by plan order, so the crowned corridor can swap on a rerun.",
      notes: [
        { choice: 1, why: "RANK is honest about the tie but prints the gap — a tier 2 no corridor occupies, which the board reads as a missing stratum." },
        { choice: 3, why: "NTILE deals count buckets, not tiers — quartiles by rank, not 'share rung one'. Different question entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-15",
      prompt: "The board wants each corridor's share of the $69,612.00 settled total. Which window call delivers the global denominator beside every corridor row?",
      choices: [
        "SUM(amount_cents) OVER ()",
        "SUM(amount_cents) OVER (PARTITION BY region)",
        "AVG(amount_cents)",
        "COUNT(*) OVER (ORDER BY region)",
      ],
      answer: 0,
      why: "The empty OVER () is the whole-book fold: $69,612.00 repeated beside every corridor, so share = corridor ÷ denominator computes row by row. PARTITION BY region shrinks the denominator to the corridor itself — every share reads 100%.",
      notes: [
        { choice: 1, why: "The partition is the trap: the denominator must be the WHOLE book for a share. Partitioned, each corridor is 100% of itself — true and useless." },
        { choice: 2, why: "AVG is the average leg, not the total — a different denominator with a different meaning. Shares divide by SUM, printed, not by vibes." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-16",
      prompt: "One scan must print settled, in-flight, pending and fallen counts as four columns per corridor. Which count syntax is purpose-built for it?",
      choices: [
        "COUNT(*) FILTER (WHERE status = '…') per state",
        "COUNT(WHERE status = '…')",
        "SUM(COUNT(*)) per state",
        "Four separate queries UNIONed with their counts",
      ],
      answer: 0,
      why: "FILTER (WHERE …) is the purpose-built census arm: COUNT(*) FILTER per state over one GROUP BY corridor — one scan, four columns, empty states printing 0. It's the cleaner spelling of the CASE fold, not a different population.",
      notes: [
        { choice: 1, why: "COUNT takes an expression, not a WHERE — syntax error. The filter lives in the FILTER clause or inside a CASE." },
        { choice: 3, why: "Four scans stacked by UNION works but re-reads the table four times and invites positional mismatches — the census wants one pass." },
      ],
      difficulty: "easy",
    },
    {
      id: "hsbc-mcq-17",
      prompt: "In the coverage fold, unfunded facilities arrive with NULL paid totals. Which COALESCE prints their money-received as 0 without touching the funded math?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0)",
        "SUM(COALESCE(p.amount_cents, 0))",
        "COALESCE(SUM(p.amount_cents), -1)",
        "IFNULL(p.amount_cents, 0)",
      ],
      answer: 0,
      why: "The NULL lives on the GROUP side — an empty fold — so the COALESCE wraps the SUM: an unfunded facility's fold is NULL, and COALESCE prints 0.00. The $15,217.00 nothing-book then reads as zeros per facility while the corridor fold still ties.",
      notes: [
        { choice: 1, why: "COALESCE inside fixes per-row NULLs, not no-rows: an unfunded facility has no payment ROWS at all, so the SUM is still NULL. Wrong tool, same NULL." },
        { choice: 3, why: "IFNULL on the raw column touches rows that don't exist for these facilities — the fold-level NULL survives untouched." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-18",
      prompt: "The running-balance replay of the cash account hits two settlements sharing one timestamp. Which frame replays the auditor's line-by-line walk?",
      choices: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
      ],
      answer: 0,
      why: "ROWS steps every row: each hit moves the balance once, and the replay ties to the ledger line by line. RANGE treats same-timestamp rows as peers — both hits show one combined step, a two-leg jump printed as one row, and the walk stops matching the books.",
      notes: [
        { choice: 2, why: "UNBOUNDED FOLLOWING makes every row's 'running' value the final balance — a constant column, not a replay." },
        { choice: 3, why: "A one-row window is a delta, not a cumulative balance — the auditor's walk is unbounded behind, stepped row by row." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-19",
      prompt: "The corridor trend buckets settlements by month. Which key puts 2025-01-28 and 2025-02-03 in different buckets?",
      choices: [
        "strftime('%Y-%m', paid_on)",
        "strftime('%Y', paid_on)",
        "strftime('%M', paid_on)",
        "SUBSTR(paid_on, 1, 4)",
      ],
      answer: 0,
      why: "'%Y-%m' is the month key — 14 calendar buckets across the book, quiet months riding the axis. '%Y' alone folds a year into one bar; '%M' is MINUTES in strftime — every settlement lands in a bucket named 00..59 and the trend becomes a clock.",
      notes: [
        { choice: 1, why: "Annual buckets answer a different question — the corridor trend dissolves into one bar per year." },
        { choice: 3, why: "Width 4 is the year trap wearing SUBSTR's clothes — same fold as '%Y', twelve months per bucket." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-20",
      prompt: "The no-settlement watchlist LEFT JOINs facilities to legs; a colleague adds WHERE p.method = 'wire' to focus the read. What ships?",
      choices: [
        "The watchlist, wire legs only",
        "An empty watchlist — the right-table predicate converts the LEFT JOIN into an INNER join and the unfunded facilities vanish",
        "The watchlist with unfunded rows preserved",
        "A syntax error — WHERE cannot reference the right table",
      ],
      answer: 1,
      why: "Unfunded facilities have NULL right-table columns; 'wire' never equals NULL, the NULL-extended rows fail the filter, and the six facilities carrying $15,217.00 leave the read. The IS NULL arm IS the anti-join — a rail focus belongs in the ON clause or the inner semantics must be accepted knowingly.",
      notes: [
        { choice: 0, why: "There are no legs at all on these facilities — wire or otherwise. The rows the watchlist exists for fail the filter first." },
        { choice: 3, why: "It parses and runs fine; the failure is silent shape-shifting — an outer join laundered into an inner one, which is the bug auditors probe for." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-21",
      prompt: "Which pair of shapes is logically equivalent for the hunt for facilities with zero settlement rows?",
      choices: [
        "LEFT JOIN … WHERE p.id IS NULL and NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "NOT IN (SELECT invoice_id FROM payments) and LEFT JOIN … IS NULL",
        "INTERSECT and NOT EXISTS",
        "UNION and LEFT JOIN … IS NULL",
      ],
      answer: 0,
      why: "Both the IS NULL arm and NOT EXISTS survive NULLs in the feed and report the true unfunded set — they are the two NULL-safe anti-join spellings. NOT IN is the famous third spelling that silently empties on one NULL invoice_id.",
      notes: [
        { choice: 1, why: "That equivalence breaks the moment the subquery yields a NULL: NOT IN returns nothing while the LEFT JOIN arm keeps reporting. One NULL away from a blind control." },
        { choice: 2, why: "INTERSECT is a matching operator, not a missing-data operator — it finds overlap, the opposite of the unfunded set." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-22",
      prompt: "The settlement board's top-hit read reruns overnight and two $4,015.00 hits trade places between runs. The reproducibility fix?",
      choices: [
        "Add a tiebreaker column: ORDER BY amount_cents DESC, invoice_id",
        "Switch the aggregate to COUNT",
        "Remove the ORDER BY and let the engine decide",
        "LIMIT 2 to cap the board",
      ],
      answer: 0,
      why: "Ties without a tiebreaker are dealt in plan order, which can change between runs — a board that reshuffles is a coin flip with formatting. A deterministic secondary key (id) pins the order so the rerun reproduces the board row for row.",
      notes: [
        { choice: 2, why: "Removing ORDER BY doesn't remove the tie — it guarantees plan-order luck on every run. Determinism is declared, not defaulted." },
        { choice: 3, why: "LIMIT caps rows; it doesn't order them. The two tied hits still trade places inside the cap." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-23",
      prompt: "Card-markets-minus-wire-markets, two ways: EXCEPT over the rail folds, or NOT IN over the wire-corridor subquery. The wire fold contains one NULL corridor. What survives?",
      choices: [
        "EXCEPT returns US; NOT IN returns nothing at all",
        "Both return US",
        "NOT IN returns US; EXCEPT errors",
        "Both return empty",
      ],
      answer: 0,
      why: "EXCEPT compares rows and is NULL-safe — US survives the difference. x NOT IN (…, NULL) can never be TRUE: UNKNOWN propagates, the entire result empties, and the silent-empty exception report reads as 'every corridor funded' — precisely the failure auditors probe for.",
      notes: [
        { choice: 2, why: "Backwards on both halves: EXCEPT doesn't error on NULLs, and NOT IN is the one that empties — all-or-nothing, no error, no hint." },
        { choice: 3, why: "EXCEPT is row-comparison, not membership testing: one NULL on the right side removes only NULL rows, not the result." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-24",
      prompt: "The provision fold: SUM(exposure_cents * loss_bp) where loss_bp is an INTEGER basis-point factor. Which read survives the regulator's rerun?",
      choices: [
        "SUM(exposure_cents * loss_bp) / 10000 — integer all the way",
        "SUM(exposure_cents * loss_bp) / 10000.0 — fold in cents, convert once at the edge",
        "SUM((exposure_cents / 10000) * loss_bp)",
        "SUM(exposure_cents * loss_bp / 10000.0)",
      ],
      answer: 1,
      why: "Fold the integer cents, divide by 10000.0 ONCE — REAL division at the display edge preserves every cent of the weighted fold. Dividing per row (choice 3) re-enters per-row REAL math that's survivable but drifts the audit trail; dividing by INTEGER 10000 truncates, and choice 2 truncates before weighting even starts.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER truncates on the first odd cent — the provision reads low by construction, band by band, exactly where the cents live." },
        { choice: 2, why: "Dividing exposure BEFORE weighting destroys the band granularity the whole fold exists to preserve — truncation multiplied by factors." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-25",
      prompt: "FX restatement: each settlement must restate at the rate in force ON paid_on. Which join is the honest as-of shape?",
      choices: [
        "JOIN rates r ON r.currency = p.currency AND r.effective_on = (SELECT MAX(effective_on) FROM rates r2 WHERE r2.currency = p.currency AND r2.effective_on <= p.paid_on)",
        "JOIN rates r ON r.currency = p.currency",
        "CROSS JOIN rates r WHERE r.currency = p.currency",
        "JOIN rates r ON r.effective_on = p.paid_on",
      ],
      answer: 0,
      why: "As-of means latest-at-or-before: the correlated MAX(effective_on) <= paid_on pins the rate that was in force when the leg cleared. Joining on currency alone multiplies every settlement by every historical rate; joining on exact date equality misses every day a rate didn't reset.",
      notes: [
        { choice: 1, why: "Currency match without a date rule fans out across the rate history — the settlement restates N times, once per rate version." },
        { choice: 3, why: "Exact-date equality only matches settlements on rate-change days — every other leg drops out of the restatement entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-26",
      prompt: "Risk wants the corridor book dealt into four equal-count size bands. Which window call does it?",
      choices: [
        "NTILE(4) OVER (ORDER BY settled_dollars DESC)",
        "ROUND(settled_dollars / 4)",
        "DENSE_RANK() OVER (ORDER BY settled_dollars) / 4",
        "CASE WHEN settled_dollars > AVG(settled_dollars) THEN 1 ELSE 2 END",
      ],
      answer: 0,
      why: "NTILE(4) deals rows into four near-equal-count buckets by rank — the quartile read. The follow-up it forces: buckets are by COUNT, so value concentration shows as the top bucket's share of dollars, printed beside the bucket number.",
      notes: [
        { choice: 2, why: "Integer division on a rank — you get 0s and 1s, not quartiles. Ranks and bands are different deals." },
        { choice: 3, why: "A two-arm CASE against the average is a median-ish split at best — and the window/aggregate mix errors in WHERE anyway." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-27",
      prompt: "The break queue ships a roll-call cell: every facility number in one text column per corridor. Which fold?",
      choices: [
        "GROUP_CONCAT(i.number)",
        "CONCAT(i.number)",
        "SUM(i.number)",
        "STRING_AGG(i.number, ',') — in SQLite",
      ],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's text fold: one row per corridor, facility numbers comma-joined into a cell. It proves membership — who's in the bucket — while the SUM column beside it proves value; the cell never substitutes for the fold.",
      notes: [
        { choice: 2, why: "SUM of numbers-as-text folds their numeric ids — a meaningless integer that changes when a facility re-registers. Text folding and money folding are different tools." },
        { choice: 3, why: "STRING_AGG is PostgreSQL's name — SQLite speaks GROUP_CONCAT. Dialect fluency is part of the read." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-28",
      prompt: "Keep only corridors whose settled share beats 40%. Why does the share computation need staging before the filter?",
      choices: [
        "WHERE can't see window output computed in the same SELECT — stage the fold, filter outside it",
        "CTEs run faster than window functions",
        "HAVING cannot compare to a constant",
        "Shares require a recursive CTE by definition",
      ],
      answer: 0,
      why: "The pipeline order is the reason: WHERE runs before SELECT computes anything, so the share (corridor ÷ SUM() OVER ()) doesn't exist yet at filter time. Stage the fold in a CTE and filter outside — with the denominator still printed beside every surviving share.",
      notes: [
        { choice: 2, why: "HAVING compares aggregates to constants happily — it's the wrong clause here for a different reason: it runs before windows too." },
        { choice: 3, why: "No recursion anywhere — a share is one fold plus one window. Recursion is for chains, not ratios." },
      ],
      difficulty: "medium",
    },
    {
      id: "hsbc-mcq-29",
      prompt: "The day board counts settlements in [2025-01-28, 2025-01-29). Which predicate is honest?",
      choices: [
        "paid_on >= '2025-01-28' AND paid_on < '2025-01-29'",
        "paid_on BETWEEN '2025-01-28' AND '2025-01-29'",
        "paid_on = '2025-01-28'",
        "SUBSTR(paid_on, 1, 10) = '2025-01-29'",
      ],
      answer: 0,
      why: "Half-open intervals tile the timeline with no overlap: the settlement batch-posting at 2025-01-29 00:00 belongs to the NEXT day and the predicate says so. BETWEEN's inclusive upper bound claims that same row for both days — volume neither market owns.",
      notes: [
        { choice: 1, why: "BETWEEN on timestamps double-claims the seam — the 00:00:00 hit counts in both windows. Silent, structural, and found by reconciliation not by testing." },
        { choice: 3, why: "Wrong day entirely — the string carves out January 29 while the ask is January 28. Off-by-one-day, board-visible." },
      ],
      difficulty: "hard",
    },
    {
      id: "hsbc-mcq-30",
      prompt: "The corridor fold needs each corridor's settlement count AND a density rank of those counts. Which shape compiles and is honest?",
      choices: [
        "SELECT region, COUNT(*), DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) … GROUP BY region — windows evaluate after the fold",
        "DENSE_RANK() OVER (ORDER BY COUNT(*)) inside WHERE",
        "SELECT region, DENSE_RANK() OVER (ORDER BY COUNT(*)) with no GROUP BY",
        "Two separate queries because windows can never see aggregates",
      ],
      answer: 0,
      why: "Windows evaluate after GROUP BY, so the window can rank the fold's own aggregates — count and rank in one SELECT. The trap is believing windows and aggregates never mix: they can't mix in WHERE (choice 1 errors) but they compose cleanly in the SELECT list.",
      notes: [
        { choice: 1, why: "Pipeline order: WHERE precedes the fold AND the window — COUNT(*) isn't visible yet. Loud error, not silent wrongness." },
        { choice: 3, why: "The never-mix belief costs you the one-SELECT fold-and-rank — the exact shape the corridor board ships. Over-caution is still a wrong answer." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-hsbc-1",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The global ledger stack",
      brief:
        "HSBC global-close brief on the storefront db: the ledger function closes with the account stack — every ledger account's debits and credits in dollars, plus ONE grand row labeled TOTAL — because the close must prove both things in the same breath: the per-account detail (where the money moved) and the global identity (that it all balances). Probed facts: 80 ledger entries across four accounts — cash 69612 / 25416, accounts_receivable 86052 / 69612, operating_expenses 25416 / 0, sales_revenue 0 / 86052 (debits / credits in dollars from integer cents) — and the trial balance: 181080 debits against 181080 credits, delta zero. The stack is UNION ALL, not UNION: the TOTAL row must survive, and its two cells must reconcile against the detail's column sums, or the close doesn't ship.",
      ask: "Return each ledger account with debits and credits in dollars (2 decimals), plus a TOTAL grand row, account name descending so the grand row closes the stack.",
      template:
        "SELECT account,\n       ROUND(SUM(debit_cents) / 100.0, 2) AS debits_dollars,\n       ROUND(SUM(credit_cents) / 100.0, 2) AS credits_dollars\nFROM ledger_entries\nGROUP BY account\nUNION ALL\nSELECT {1} AS account,\n       ROUND({2}(debit_cents) / 100.0, 2) AS debits_dollars,\n       ROUND(SUM(credit_cents) / 100.0, 2) AS credits_dollars\nFROM ledger_entries\nORDER BY account {3};",
      slots: [
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The literal 'TOTAL' names the appended row so the close reads detail then identity. Unquoted TOTAL would be parsed as a column reference and error; a different label breaks every reader that greps for the grand row.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the debit fold",
          why: "SUM(debit_cents) over the whole table gives the grand debit total — 181080 dollars after /100.0, the probed figure. COUNT would divide a row count by 100 and print 0.80: cents-shaped noise on the identity row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the grand-row-last direction",
          why: "Uppercase 'TOTAL' sorts before lowercase account names, so DESC closes the stack with the identity row after the four accounts. ASC would open the close with the summary — the answer read before its evidence.",
        },
      ],
      distractors: ["'GRAND'", "COUNT", "MAX", "ASC"],
      walkthrough:
        "One table, two folds, one stack. The first SELECT groups 80 ledger entries by account and folds dollars per account — cash 69612 / 25416, accounts_receivable 86052 / 69612, operating_expenses 25416 / 0, sales_revenue 0 / 86052, all /100.0 from integer cents. The second SELECT folds the same table whole and labels itself 'TOTAL': 181080 / 181080 — the trial balance, delta zero, printed as data. UNION ALL is load-bearing: the branches are different populations, and UNION's dedupe could silently delete a detail row that happens to equal the grand totals. The reconciliation the close runs on itself: the TOTAL row's cells must equal the column sums of the detail above it — they do, by construction, which is why this stack doubles as the audit evidence. ORDER BY account DESC reads on the collation fact that uppercase sorts before lowercase, landing TOTAL after the four accounts. COUNT or MAX in either fold slot produces a grand row that no longer proves anything — the identity is arithmetic, and only SUM carries it.",
    },
    {
      id: "cs-hsbc-2",
      tier: "hard",
      topic: "j3",
      universe: "growth",
      title: "The corridor concentration read",
      brief:
        "HSBC settlement-ops brief on the storefront db: the corridor board folds every settlement through its facility to the client's home market — a three-table chain — and asks the concentration question: which home market funds the most settled value? One row, the top corridor, because the board's risk eye goes to concentration first. Probed facts: 27 settlements totalling $69,612.00 ride against facilities whose clients sit in the bank's markets; the rail mix beneath them runs card 16 settlements / $37,364.00 vs wire 11 / $32,248.00; every settlement is a facility-payment pair and every facility belongs to exactly one client, so the chain is N:1 all the way down — but the fold's grain (settlements per corridor) is still the whole test, and the tie between the fold's total and the probed $69,612.00 is the sanity check the board runs first.",
      ask: "Return the single top corridor by settled dollars: its market, settlement count, and settled dollars (2 decimals).",
      template:
        "SELECT c.region AS corridor,\n       {1}(p.id) AS settlements,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_dollars\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.id = i.customer_id\nGROUP BY c.region\nORDER BY settled_dollars {2}\nLIMIT {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the settlement counter",
          why: "COUNT(p.id) counts matched settlement rows per corridor — the load grain, summing to the probed 27 across markets. SUM(p.id) would add up primary keys: a number with no meaning on any board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the concentration-first direction",
          why: "The board wants the TOP corridor by settled value, so descending puts the leader on the single row. ASC would crown the smallest market — a correct query answering the inverse question.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-corridor cut",
          noVerify: true,
          why: "The ask names ONE corridor. LIMIT 1 keeps exactly the leader; LIMIT 2 would hand the board a runner-up it didn't request and dilute the concentration read.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC", "2"],
      walkthrough:
        "A three-table chain where grain is the entire deliverable. Payments join invoices N:1 (each settlement rides one facility) and invoices join clients N:1 (each facility has one home market) — no fan-out, all 27 settlements survive — then GROUP BY region folds them into corridor buckets. COUNT(p.id) is the settlement count per corridor (reconciling to the probed 27 overall) and SUM(amount_cents)/100.0 is settled dollars, reconciling to the probed $69,612.00 total; those two identities are the sanity check the board runs before reading the ranking. ORDER BY settled_dollars DESC + LIMIT 1 crowns the top corridor; ASC crowns the smallest market instead — the concentration question asked upside down. SUM in the counter slot sums primary keys into a meaningless number; MAX returns the single biggest id; LIMIT 2 dilutes a single-corridor ask into a podium. The follow-up the board always asks: share of settled dollars, share of settlement count, and share of funded clients are three different concentrations — this fold answers the first, and the other two need their own denominators.",
    },
    {
      id: "cs-hsbc-3",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The no-settlement watchlist",
      brief:
        "HSBC break-queue brief on the storefront db: the coverage census counts money in versus money billed, but the first read the break queue works from is simpler and sharper — which facilities have NO settlement rows at all. Probed facts: 6 of the 28 facilities carry zero payment rows, totalling $15,217.00 billed and untouched — INV-2025-024 at $4,937.00, INV-2025-026 at $3,562.00, INV-2025-027 at $2,794.00, INV-2025-021 at $1,295.00, INV-2024-018 at $873.00 — and the anomaly the watchlist exists to surface: INV-2025-028 at $1,756.00, whose status column says PAID while the rails say nothing moved. Every one is a client-facility join with a NULL settlement payload; the LEFT JOIN's NULL arm is the whole control.",
      ask: "Return each unfunded facility: facility number, status label, client corridor, and billed dollars (2 decimals) — biggest exposure first, all six rows.",
      template:
        "SELECT i.number AS facility,\n       i.status AS label,\n       c.region AS corridor,\n       ROUND(i.amount_cents / 100.0, 2) AS billed_dollars\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2}\nORDER BY billed_dollars {3}\nLIMIT {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the facility-preserving join",
          why: "LEFT JOIN keeps all 28 facilities and hands the six unfunded ones a NULL settlement payload. INNER JOIN deletes those six rows before any filter runs — including the paid-status anomaly #28, the one row this watchlist exists to catch.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the anti-join arm",
          why: "p.id IS NULL is the fingerprint of 'no settlement rows exist' — the NULL-extended arm is the anti-join. IS NOT NULL flips the read to the funded book and '= 0' matches nothing (ids never equal zero), emptying the queue.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure-first direction",
          why: "The break queue works biggest-first: $4,937.00 on top, the anomaly $1,756.00 fourth. ASC opens the day on the $873.00 tail — a correct query reading the queue upside down.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the full-census cut",
          noVerify: true,
          why: "Six facilities sit unfunded — probed: $4,937.00, $3,562.00, $2,794.00, $1,756.00, $1,295.00, $873.00, summing to the $15,217.00 the coverage census quotes. LIMIT 6 ships the whole queue; LIMIT 3 silently amputates the anomaly from the board.",
        },
      ],
      distractors: ["INNER", "IS NOT NULL", "ASC", "3"],
      walkthrough:
        "An anti-join is a join with a verdict, not a filter. The client-facility chain is grain-safe (each facility belongs to one client), so the LEFT JOIN preserves all 28 facilities and attaches settlement payloads where legs exist — 22 facilities match, 6 arrive NULL-extended. The WHERE p.id IS NULL arm is the verdict: keep exactly the rows the join failed to match, which is the definition of unfunded. What ships: six facilities, $15,217.00 of billed exposure — INV-2025-024 at $4,937.00 down to INV-2024-018 at $873.00 — and one row that justifies the whole control: INV-2025-028, status 'paid', zero legs, $1,756.00 claimed but never moved. The distractors fail honestly: INNER JOIN deletes the six rows before the filter can judge them; IS NOT NULL flips the read to the funded book; ASC inverts the work order; LIMIT 3 ships a queue missing its own anomaly. The census rule this case rehearses: the NULL arm decides who enters the watchlist — no ELSE branch and no COALESCE can recover a row the join type already deleted.",
    },
    {
      id: "cs-hsbc-4",
      tier: "easy",
      topic: "s7",
      universe: "fraud",
      title: "The rail-mix census",
      brief:
        "HSBC financial-crime brief on the storefront db: rail mix is a managed number — client-initiated card legs versus correspondent wire legs, read per corridor in one pass. Probed facts: 27 settlement legs, $69,612.00 — EU 14 legs (8 card / 6 wire, $37,261.00), APAC 8 legs (3 card / 5 wire, $20,613.00), US 5 legs (5 card / 0 wire, $11,738.00) — and LATAM appears nowhere: its clients hold facilities but have never settled a leg, which is itself the finding the census must be able to print. The pivot is conditional aggregation: one scan, two rail columns, zeros where a rail is silent — US's wire column reading 0 is the structuring-screen's honest baseline, not missing data.",
      ask: "Return the rail census: corridor, card legs, wire legs, and settled dollars (2 decimals) — biggest settled book first.",
      template:
        "SELECT c.region AS corridor,\n       SUM(CASE WHEN p.method = {1} THEN 1 ELSE 0 END) AS card_legs,\n       SUM(CASE WHEN p.method = 'wire' THEN {2} ELSE 0 END) AS wire_legs,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_dollars\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.id = i.customer_id\nGROUP BY corridor\nORDER BY settled_dollars {3};",
      slots: [
        {
          answer: "'card'",
          kind: "keyword",
          label: "the card rail literal",
          why: "The pivot's first arm names the rail it counts: p.method = 'card'. 'wire' would swap the two columns' contents (EU reading 6 card / 8 wire) — a census that cross-foots but mislabels every rail, the silent failure class set-piece reports die of.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the per-leg counting convention",
          noVerify: true,
          why: "One per wire leg is the counting contract: ELSE 0 outside, THEN 1 inside, so wire_legs reads 6/5/0 and US's zero is probed honest. THEN 2 doubles the wire book to 12/10/0 and the cross-foot against the rail board fails; THEN 0 erases the wire rail and the census prints a card-only world.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first order",
          why: "The screen reads exposure top-down: EU $37,261.00, APAC $20,613.00, US $11,738.00. ASC opens on the smallest book — the census reads upside down and the rail anomaly hides in the tail.",
        },
      ],
      distractors: ["'wire'", "'debit'", "2", "ASC"],
      walkthrough:
        "A pivot is CASE machinery over an ordinary fold. The three-table chain is grain-safe — 27 legs survive — and GROUP BY corridor folds them into three rows: EU 8/6/$37,261.00, APAC 3/5/$20,613.00, US 5/0/$11,738.00. Each SUM(CASE …) is a conditional count: one per matching leg, zero otherwise — the ELSE 0 is load-bearing, because it's what lets US's wire column print 0 instead of NULL, and a NULL in a surveillance baseline reads as 'not measured' where 0 reads as 'measured, nothing there'. The cross-foot is the census's self-audit: 8+6=14, 3+5=8, 5+0=5 — 27 legs — and $37,261.00 + $20,613.00 + $11,738.00 = $69,612.00, the settled total the corridor board quotes. LATAM's absence is structural: no legs means no row, and the corridor fold cannot print a corridor it never saw — which is exactly why the no-settlement watchlist (the LEFT JOIN arm) exists as a separate control. The distractors mislabel rails ('wire' in the card slot), manufacture rails that never cleared ('debit'), inflate wire counts (ELSE 1), and invert the reading order (ASC) — each a different way to ship a census that looks right and isn't.",
    },
    {
      id: "cs-hsbc-5",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The corridor whale board",
      brief:
        "HSBC settlement-ops brief on the storefront db: concentration reads single hits, not just totals — the whale board ranks each corridor's LARGEST single settlement within its own book, so no corridor's biggest hit hides behind another's volume. Probed facts: the three funded corridors crown US INV-2024-008 at $4,015.00, EU INV-2025-025 at $4,000.00, and APAC INV-2024-014 at $3,512.00 — the US whale is the day's largest single hit overall, and EU's runner-up ($3,896.00) is close enough that a global ladder would read EU's book as deeper than it is. LATAM holds no legs, so it holds no rung — the board is a three-row read, and the rung assignment must survive ties and reruns.",
      ask: "Return each corridor's whale: corridor, facility number, and settled dollars (2 decimals) — the board keeps every rung at $3,512.00 or above.",
      template:
        "WITH legs AS (\n  SELECT c.{1} AS corridor,\n         i.number AS facility,\n         p.amount_cents AS cents\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n),\nranked AS (\n  SELECT corridor, facility, ROUND(cents / 100.0, 2) AS dollars,\n         RANK() OVER (PARTITION BY corridor ORDER BY cents {2}) AS rk\n  FROM legs\n)\nSELECT corridor, facility, dollars\nFROM ranked\nWHERE rk = 1 AND dollars >= {3}\nORDER BY dollars DESC;",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the corridor partition",
          why: "PARTITION BY corridor is the whole board: each corridor ranks within its own book, so every funded corridor gets a rung 1. Partitioning by client name gives 27 single-row partitions — every settlement its own whale — and by city re-titles the board at street grain.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the whale-first direction",
          why: "RANK on cents DESC makes rung 1 the LARGEST hit — the whale. ASC crowns each corridor's smallest settlement, a correct query answering the inverse question, and the concentration read inverts.",
        },
        {
          answer: "3512",
          kind: "number",
          label: "the whale cut",
          why: "3512 is APAC's whale in dollars — the cut that keeps all three funded corridors on one board (US 4015, EU 4000, APAC 3512). The threshold at 4000 silently drops APAC's rung; at 4016 the board empties and the read ships blind.",
        },
      ],
      distractors: ["city", "name", "ASC", "4000", "4016"],
      walkthrough:
        "A whale board is a window rank staged so the fold stays clean. The legs CTE carries the raw chain — 27 legs, grain-safe — and the ranked CTE assigns RANK() OVER (PARTITION BY corridor ORDER BY cents DESC): each corridor's biggest hit is rung 1 of its own book. The outer filter keeps rk = 1 AND dollars >= 3512, so the board reads three rows: US INV-2024-008 at $4,015.00, EU INV-2025-025 at $4,000.00, APAC INV-2024-014 at $3,512.00. Why RANK and not ROW_NUMBER: ties share a rung under RANK, and the board's contract is that a tie at the top is VISIBLE — ROW_NUMBER would deal the tie by plan order and the rerun could swap who's crowned. Why stage at all: the WHERE needs the rank output, and WHERE can't see window results computed in its own SELECT — the CTE is the pipeline, not ceremony. The distractors fail honestly: city and name partitions shred the corridor read into 27 private boards; ASC crowns minnows; the cut at 4000 erases APAC's rung while 4016 empties the board. LATAM teaches the last lesson silently: no legs, no rung — a corridor the fold never sees is the watchlist's problem, not the whale board's.",
    },
    {
      id: "cs-hsbc-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The installment-gap walk",
      brief:
        "HSBC settlement-ops brief on the storefront db: five facilities (#1, 5, 12, 19, 22) settled on split plans — two legs each — and the latency metric owes them an installment-gap read: how far apart did the money land? Probed facts: the gaps are 15 days (INV pair on facility 5, 2024-04-22 → 2024-05-07), 15 days (facility 22, 2025-01-13 → 2025-01-28), 14 days (facility 1, 2024-02-20 → 2024-03-05), and 10 days twice (facilities 12 and 19) — average 12.8 days between installments. LAG partitions per facility and hands each leg its predecessor; the first leg of every pair has no predecessor and reads NULL by definition — the walk must keep that NULL honest, not average it into silence.",
      ask: "Return each second leg: facility id, second-hit date, and the installment gap in whole days — widest gap first.",
      template:
        "WITH legs AS (\n  SELECT invoice_id,\n         paid_on,\n         {1}(paid_on) OVER (PARTITION BY {2} ORDER BY paid_on) AS prev_hit\n  FROM payments\n)\nSELECT invoice_id,\n       paid_on AS second_hit,\n       CAST(julianday(paid_on) - julianday(prev_hit) AS INT) AS gap_days\nFROM legs\nWHERE prev_hit IS NOT NULL\nORDER BY gap_days {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the predecessor reader",
          why: "LAG(paid_on) puts each leg beside the leg before it within the partition — the gap is current minus previous. LEAD reads forward: every 'gap' prints negative, a correct-shaped query walking time backwards.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the per-facility fence",
          why: "PARTITION BY invoice_id fences the walk per facility — LAG can never see across facilities. Partitioning by id makes every row its own partition (all NULLs, empty result); by amount_cents fences at the money, a partition no facility definition supports.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the widest-gap-first order",
          why: "The ops read hunts the longest dry spell: 15, 15, 14, then the two 10s. ASC leads with the tightest installment cycle — the watch-the-cashflow read inverted.",
        },
      ],
      distractors: ["LEAD", "MAX", "id", "amount_cents", "ASC"],
      walkthrough:
        "A delta read is a window staged before any filter, because the filter depends on the window's output. The legs CTE walks every settlement leg with LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on): each leg carries its predecessor's date, and the first leg of every partition carries NULL — the honest 'nothing before this'. The outer query computes the gap as julianday arithmetic cast to whole days, and WHERE prev_hit IS NOT NULL keeps exactly the rows that HAVE a predecessor — the five second-legs: 15, 15, 14, 10, 10 days. That filter placement is the case's hard part: filtering inside the walk (a WHERE on the CTE's input) would trim legs before LAG ran and every gap would measure against the wrong baseline. The all-payments population matters too: the 22 single-leg facilities arrive with NULL predecessors and drop out naturally — no special-casing, the NULL arm IS the split-plan selector. The distractors fail honestly: LEAD walks backwards and prints negative gaps; MAX as the window makes prev_hit the running maximum (the leg's own date — zero-day gaps across all 27 legs); id and amount_cents partitions fence at the wrong grain and the result empties or inverts; ASC leads with the tightest cycle. What the board ships: five gaps averaging 12.8 days — the split plans' rhythm, measured, not assumed.",
    },
  ],

  problems: [
    { slug: "expected-credit-loss", why: "Tagged for HSBC. Exposure weighted by loss factor per band, summed to a provision — the ECL screen regulators rerun first, band by band." },
    { slug: "structuring-detection", why: "Tagged for HSBC. HAVING-guarded velocity thresholds over grouped money movement — the structuring gate that must be defensible line by line." },
    { slug: "fx-exposure-report", why: "Normalize balances at the latest rate as of each moment — the multi-currency quote discipline: which rate was in force when, not which rate is in force now." },
    { slug: "transaction-velocity", why: "Burst detection over money movement — the velocity read that flags corridors whose rhythm changed before the totals did." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window money patterns per account — the financial-crime screen where the window definition is as load-bearing as the threshold." },
    { slug: "circular-transfers", why: "Mutual transfer pairs with canonical ordering — the flow-graph read: which corridors send money to each other and back." },
    { slug: "account-balance", why: "Running balance over transaction order — the settlement replay: the cash account's balance as every hit lands, matching the auditor's walk." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the global ledger proof (181080 vs 181080 here) every jurisdiction's close re-runs." },
    { slug: "gl-reconciliation", why: "Two sides of one book compared row by row — the recon break hunt across markets: what the feed says versus what the books say." },
    { slug: "settlement-fails-aging", why: "T+2 aging over failed settlements — the day-counted fail queue settlement ops works down, corridor by corridor." },
    { slug: "balance-rollforward", why: "Opening + movements = closing, walked per account — the rollforward that proves the global books' continuity across the period." },
    { slug: "maximum-transaction-each-day", why: "Per-day argmax with window discipline — the settlement board's 'largest hit per market per day' read, ties handled honestly." },
    { slug: "the-most-recent-three-orders", why: "Latest-N per entity via ROW_NUMBER — the 'recent settlements' rail per facility, deterministic even when timestamps tie." },
    { slug: "year-on-year-growth-rate", why: "LAG against the prior-year fold — the corridor growth read: same market, same month, last year versus now, in one column." },
    { slug: "bank-account-summary-ii", why: "Money-in/money-out per account with the net folded honestly — the nostro-style statement: every account, both directions, one row." },
    { slug: "duplicate-charge-pairs", why: "Self-join on near-identical money events — the duplicate-settlement hunt across rails: two hits, same facility, one of them shouldn't exist." },
    { slug: "monthly-transactions-ii", why: "UNION ALL stacks with grand-total reconciliation — the close-board shape: per-account detail, TOTAL row, and a stack that must tie to its own parts." },
    { slug: "count-salary-categories", why: "UNION ALL with zero buckets — states with no rows print 0, not vanish; the rail census and the coverage board both live or die by it." },
    { slug: "team-scores-in-football-tournament", why: "CASE-weighted folds with draw rules — the conditional-SUM drill behind every one-pass corridor census this bank ships." },
    { slug: "movie-rating", why: "Multi-part set-op report — argmax by one rule, per-entity aggregates by another; two grains composed in one query." },
    { slug: "the-airport-with-the-most-flights", why: "Set ops over grouped counts — which corridor carries the flow, with UNION/INTERSECT/EXCEPT semantics drilled until reflex." },
    { slug: "league-statistics", why: "One-pass CASE pivot with side conditions — matches won/drawn/lost per team is the corridor × rail census in sports clothing." },
    { slug: "customers-who-never-order", why: "The anti-join hunt for clients with zero settlement rows — the no-settlement watchlist's textbook shape, NULL-safe by construction." },
    { slug: "game-play-analysis-iii", why: "Running sums with window frames — cumulative settled flow per corridor as hits land, framed deliberately (ROWS, not luck)." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Running total cut at a capacity limit — the settlement replay's 'last hit that fits the day's window' logic, stepped row by row." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LAG-chained comparisons across consecutive hits — the installment-pattern screen financial-crime reruns before any total moves." },
    { slug: "second-day-confirmation", why: "Day-after confirmation via LAG plus date diff — the T+1 follow-through read on settlement legs, first rows NULL by definition." },
    { slug: "biggest-window-between-events", why: "Gaps between consecutive events per entity — the longest dry spell between installments on the split plans, measured honestly." },
    { slug: "risk-based-pricing", why: "Exposure-weighted folds by risk band — the provision arithmetic regulators rerun band by band, one misplaced integer away from a finding." },
    { slug: "value-at-risk", why: "Percentile folds over loss distributions — the tail read provisions and corridor limits both hang on." },
    { slug: "product-price-at-a-given-date", why: "As-of lookups — the rate in force on the settlement date, not today's; the FX restatement instinct every corridor report assumes." },
    { slug: "point-in-time-asof", why: "Point-in-time joins — which rate was effective when the leg cleared; the as-of discipline drilled until it's reflex." },
  ],
};
