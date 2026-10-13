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
    "Preparation strategy: the registry tags **two problems** for HSBC (`expected-credit-loss`, `structuring-detection` — start there, they map onto the provision and velocity-gate screens), so the pool is mostly theme-curated toward the bank's known reads: corridor chains, UNION ALL stacks, running balances, LAG deltas, FX as-of joins. Then run both case studies on the live storefront db: one rebuilds the {emerald:global ledger stack} its close uses to prove debits equal credits across every account, the other rebuilds the {sky:corridor concentration read} settlement ops opens the day with.",
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
      slugs: ["number-of-trusted-contacts-of-a-customer", "students-and-examinations", "top-competitors"],
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
  ],
};
