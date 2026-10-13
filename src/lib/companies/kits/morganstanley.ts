// Morgan Stanley — kit 10 of the Banking & Capital Markets domain (Batch J, wave 6).
// Wealth management and institutional markets: the advisor-book read, where
// the same firm bills client households for advisory relationships, carries
// the fee receivable, and settles on retail or institutional rails. The
// storefront db maps on honestly: invoices are client fee billings (advisory
// and management-fee invoices — the receivables the wealth book carries),
// payments are the fee receipts on two rails (method card / wire — card is
// the retail brokerage debit rail, wire the institutional wire rail),
// ledger_entries is the double-entry book of record, expenses are platform
// and branch cost lines, customers are client households across four booking
// markets, orders are booked flows (REAL dollars — the one table where money
// is already dollars). Money in invoices/payments/expenses/ledger is INTEGER
// cents — the dollar read is always amount_cents / 100.0.
// Pool provenance: Morgan Stanley has 0 tagged sql rows in the band (checked
// company-pools.md for morganstanley / Morgan Stanley variants) — 0 tagged LC
// — theme-curated: every topic and problem slug is curated from the theme
// menu to MS's known question families (book rollups, fee schedules, as-of
// reads, concentration, risk dispersion), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const morganstanleyKit: CompanyKit = {
  id: "morganstanley",
  domainId: "banking",
  name: "Morgan Stanley",
  tagline: "Wealth management and institutional markets",
  accent: "text-slate-400",

  brief: [
    "**Morgan Stanley** is the wealth machine: an advisor force that bills client households for relationships, an institutional arm that moves institutional flows, and a platform that has to prove both, daily. On this training db the mapping is honest: `orders` are booked flows (REAL dollars — the one table where money is already dollars), customers are client households across four booking markets, and every fee the wealth book bills — advisory, management, planning — lands as a receivable. Probed scale: **103 booked flows worth 34833.28**, and the busiest household alone carries **24 flows for 7262.35** — with spenders over the 3000 line holding 63.5% of all booked value. *A book this concentrated is read one household at a time, and the SQL is how it's read.*",
    "The money tables are the desk's spine. `invoices` are the client fee billings — 28 on the book, of which 21 settled exact for 66443.00, 6 sit open at 19609.00, and 1 went void at 925.00. `payments` are the fee receipts on two rails — card, the retail brokerage debit rail (16 receipts for 37364.00), and wire, the institutional rail (11 for 32248.00) — and `ledger_entries` is the double-entry book where every settled dollar posts twice, integer cents, dollar read always cents / 100.0. The daily proof: **181080.00 debits against 181080.00 credits across 80 entries, delta 0** — and the fee-receivable watch carries **6 billings / 15217.00** against flat 30-day terms.",
    "The SQL screens are book-rollup screens. A warm-up fold (fee billings per household, receipts per rail), then the two questions this firm is famous for: the {sky:advisor-book board} — households ranked by billing frequency within booking market, lifetime billed beside, ties shared on purpose — and the {rose:fee-receivable watch} — a LEFT-join anti-join where the interesting rows are the billings with no receipt at all, plus the pair-read that catches a void billing which still drew its **925.00**. Follow-ups probe the denominator ('booked flows or billed fees?') and the tie policy ('who shares rung 3, and says who?').",
    "Prep the way the screens run. Drill per-household folds and the window grammar that ranks them (`PARTITION BY` the market, ties shared on purpose), as-of reads for the fee schedule in force at billing time, month buckets via `SUBSTR(issued_on, 1, 7)` across the 2024-01 to 2025-02 window, and settlement-lag math — the book's settled billings average **28.4 days** to first receipt against fastest 13 and slowest 84. Then practice the sentence that gets hired: *the book is billed, the book is received, and those are two different numbers until the rail proves otherwise.*",
  ],

  dayInLife: [
    "**08:00 —** the books before the markets. First query proves the ledger — **181080.00 debits against 181080.00 credits, delta 0** across 80 entries — then the receipt census: **card 16 / 37364.00, wire 11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: a void billing that drew **925.00**, a paid-status billing with no receipt at **1756.00**. Advisors call at 08:15; the books have to be provable before they do.",
    "**10:30 —** deep work: the advisor-book board. Households folded to lifetime billed, ranked by billing frequency {emerald:within booking market} — a `PARTITION BY region` board where two households at two billings share rung 3 by design, and the tiebreak column is the one the advisor will defend. Beside it, the concentration read: the 3000-plus tier holding **63.5%** of booked value. The instinct being trained: rank the relationships, not the noise.",
    "**13:30 —** the collections sit-down: the fee-receivable watch — **6 billings / 15217.00** — aged against flat 30-day terms (min 30, max 30; the terms are a definition, not a distribution), with settlement lag beside it: 20 settled billings, **28.4 days** average, fastest 13, slowest 84. The watch's awkward member gets named out loud: a paid-status billing with no receipt row is in the list, and the void-but-received **925.00** is not — *membership is evidence, not status.*",
    "**16:30 —** stakeholder cycle: the platform review — cost lines against plan, Rent at 14 entries / **16800.00**, Ads at 14 / **4570.00** — then the EOD writeup, where every board ships with its definitions attached: what counts as billed, who stays in the base, which rung ties share. Tomorrow's ask is queued: an as-of join so the fee schedule in force at billing time, not today's, prices the dispute. *The read goes out; the denominators travel with it.*",
  ],

  metrics: [
    { name: "Billed fee book", what: "Client fee billings and their state mix — 28 on the book, 21 settled exact for 66443.00. The top line every advisor conversation starts from." },
    { name: "Fee-receivable watch", what: "Billings with no receipt row at all — 6 carrying 15217.00, aged against flat 30-day terms. The list the collections sit-down works, membership by evidence not status." },
    { name: "Billing-state mix", what: "Open 6 / 19609.00, paid 21 / 66443.00, void 1 / 925.00. States are claims; the mix is read beside the receipt census before anyone believes either." },
    { name: "Rail mix", what: "Fee receipts per rail — card 16 / 37364.00 (retail debit), wire 11 / 32248.00 (institutional). The pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages someone." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). The partial is the interesting row: open AND received." },
    { name: "Settlement lag", what: "Days from billing to first receipt on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84. The tempo read behind every collections promise." },
    { name: "Book concentration", what: "Share of booked value from households over a lifetime line — 63.5% from the 3000-plus tier, top household 24 flows for 7262.35. Tells the desk how thin the book's base is." },
  ],

  topics: [
    {
      name: "Household book rollups",
      why: "The advisor book IS a rollup: lifetime billed per household, receipts beside each name, and a LEFT JOIN that keeps households honest when a billing has no receipt. Bonus-style left joins and top-by-value boards are the core drills.",
      slugs: ["employee-bonus", "top-travellers", "bank-account-summary-ii"],
    },
    {
      name: "Fee-billing states",
      why: "Billings live in states — paid, open, void — and the desk counts them separately without letting any state leak out of the denominator. CASE classification and HAVING-gated frequency folds are the daily shape.",
      slugs: ["weather-type-in-each-country", "customer-order-frequency", "immediate-food-delivery-iii"],
    },
    {
      name: "Book concentration & shares",
      why: "A wealth book is read as weights: each household's share of billed value, the concentration index, and how much sits above a lifetime line — 63.5% over 3000 here. Share-of-partition windows are the exact muscle.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "AUM-movement windows",
      why: "Flows and balances are read through windows: peak activity per day, second-largest relationships, top earners by value — ranking and argmax boards the desk reviews every morning.",
      slugs: ["maximum-transaction-each-day", "second-highest-salary", "top-earners"],
    },
    {
      name: "Fee schedules & tiers",
      why: "Advisory fees are tiered, and the tier a household lands in decides the invoice: CASE ladders over folded value, spend-band classification, and risk-based band joins where the boundary operator is the dispute.",
      slugs: ["the-category-of-each-member-in-the-store", "customer-purchasing-behavior-analysis", "risk-based-pricing"],
    },
    {
      name: "As-of & point-in-time reads",
      why: "Fee disputes are settled with the schedule that WAS in force at billing time, not today's — as-of price logic, point-in-time joins and latest-rate lookups are exactly how the desk proves it.",
      slugs: ["product-price-at-a-given-date", "point-in-time-asof", "fx-exposure-report"],
    },
    {
      name: "Net flows & running cash",
      why: "Money moves daily and the book is a walk: running balances, movement waterfalls (new, redeemed, net) and year-on-year growth rates over the flow calendar are the accumulation-read drills.",
      slugs: ["daily-balance-interest", "mrr-waterfall", "year-on-year-growth-rate"],
    },
    {
      name: "Fee-collection hygiene",
      why: "The receivable is worked, not assumed: AR aging schedules, ledger-versus-receipt reconciliation and settlement-fails aging are the collection drills — 6 billings / 15217.00 is the watch this kit keeps returning to.",
      slugs: ["ar-aging-schedule", "gl-reconciliation", "settlement-fails-aging"],
    },
    {
      name: "Risk & dispersion reads",
      why: "Institutional markets asks the dispersion questions: value-at-risk cuts, Sharpe-style ratios over return series, beta versus benchmark — portfolio-statistics SQL the wealth platform surfaces next to every board.",
      slugs: ["value-at-risk", "sharpe-ratio", "beta-benchmark"],
    },
    {
      name: "Audit trails & NULL policy",
      why: "The books of record are evidence: journal-gap detection (no missing entries, ever), balance rollforwards and snapshot-delta reads keep the ledger provable — and NULL handling decides what 'no receipt' honestly means.",
      slugs: ["journal-gap-detection", "balance-rollforward", "snapshot-delta-detect"],
    },
  ],

  theory: [
    {
      id: "ms-t1",
      q: "The advisor asks for billed fees per household, and your join of billings to receipts returns 33 rows for a 28-billing book. What's the grain problem and the fix?",
      a: "The join changed grain: five billings settled on the split plan carry two receipt rows each, so billings joined to receipts print 33 rows and every fold on that result counts receipts, not billings. The fix is to declare the grain first — per household, per billing — and fold accordingly: either aggregate receipts to billing level in a derived table before joining up, or protect the count with COUNT(DISTINCT i.id). On Morgan Stanley screens this is the opening trap: the advisor wants relationship-level truth, and a fold at receipt grain quietly reports 33 settled billings where only 26 billing relationships ever received a dollar.",
      tag: "joins",
    },
    {
      id: "ms-t2",
      q: "Two households in the same market both show two billings. Build the book board so the tie is visible and defensible — which window function, and why?",
      a: "RANK with an explicit ORDER BY: tied frequencies share a rung and the next rank skips, so the board shows two households at rung 3 and the next at rung 5 — the tie is visible, which is the point. ROW_NUMBER would hand one of them rung 3 by plan order and look authoritative while being arbitrary; DENSE_RANK numbers rungs consecutively when the desk wants 'third-highest frequency tier' instead of 'third place'. I PARTITION BY booking market so each market's board is independent, and the tiebreak inside the window is lifetime billed — a column someone can defend on a call. On this book the tie policy is a business decision: the advisor emails 'everyone at rung 3', so RANK it is.",
      tag: "windows",
    },
    {
      id: "ms-t3",
      q: "How would you compute the coverage census — exact, partial, no receipt — so it survives the collections sit-down?",
      a: "As a per-billing fold, not a status read. LEFT JOIN billings to receipts, GROUP BY the billing, classify: no receipt row is the no-rail arm, SUM(receipts) < billed is the partial arm, else exact — then fold the classes for the board. The follow-ups are where candidates die: why isn't 'open' the unpaid book? Because open carries 19609.00 over 6 billings while the no-receipt watch carries 15217.00 over 6 — one open billing took a 4000.00 partial against 6148.00, and one paid-status billing has no receipt at all. I quote the actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and say the definition: coverage is evidence across two tables, never a status string.",
      tag: "aggregation",
    },
    {
      id: "ms-t4",
      q: "A junior says the fee-receivable watch is just 'status = open'. Both count six — where does that break?",
      a: "At membership. The open-status census carries 19609.00; the no-receipt anti-join carries 15217.00 — and the 4392.00 gap is exactly two honest anomalies: the open billing with a 4000.00 partial receipt (it HAS evidence, so it drops out of the watch) and the paid-status billing at 1756.00 with no receipt row (it HAS a claim, so it rides in). The lesson generalizes: IS NULL on the LEFT JOIN's right-side key is the definition of 'never received', and a status column is a claim about the world, not the world. I name both lists out loud — open-not-necessarily-unreceived, unreceived-not-necessarily-open — before choosing which one the ask means.",
      tag: "nulls",
    },
    {
      id: "ms-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites on a book-rollup query.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects (windows compute here, after HAVING), ORDER BY and LIMIT run last. The bites: the household-count gate is HAVING because the fold doesn't exist at WHERE time; window functions see post-HAVING rows, so a HAVING gate changes both the ranks and any COUNT(*) OVER () book-size column; and SELECT-born aliases are usable in ORDER BY but not WHERE. On the book board I keep the market filter in WHERE, the minimum-billings gate in HAVING, and I say the split out loud — the interviewer is checking whether pipeline order is a mental model or a recited list.",
      tag: "pipeline",
    },
    {
      id: "ms-t6",
      q: "Fee review wants every billing larger than the book's average billing. Scalar subquery, window, or CTE — and how do you choose?",
      a: "By how much definition the benchmark carries. A scalar subquery — WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for a single book-wide line. AVG() OVER () prints the same benchmark while keeping every billing visible, which is better when the review also wants each billing's premium versus the mean. A CTE earns its keep the moment the benchmark gets a definition — 'average over open-and-paid billings, void excluded, per booking market' — because a named, commented fold is auditable and a nested one-liner isn't. Wealth benchmarks always grow definitions mid-review, so I stage the CTE earlier here than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "ms-t7",
      q: "The desk wants billing volume by month and settlement lag per billing. How do you handle dates in SQLite for both?",
      a: "Two tools. Monthly volume buckets with SUBSTR(issued_on, 1, 7) — a '2025-01' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Lag needs instant arithmetic: julianday(first receipt) - julianday(issued_on) per billing, folded once and rounded at the edge — the book's settled billings run 28.4 days average, fastest 13, slowest 84, against terms that are flat 30. The traps I name: julianday over a missing receipt NULLs the lag (that's the definition — the no-receipt watch has no lag, not a zero one), and a '30-day terms' claim is a definition check — min and max terms both print 30 here, which is why the lag spread of 13 to 84 is a behavior story, not a terms story.",
      tag: "dates",
    },
    {
      id: "ms-t8",
      q: "Controls flagged a void billing that still received 925.00 and a paid billing with no receipt. What's your policy for breaks like these?",
      a: "Detect, quantify, route — evidence over claims, always. Detect by pairing state with receipt presence: void AND a receipt exists (925.00), paid AND no receipt (1756.00) — a one-pass census with FILTER (WHERE …) counts both arms on the same join so nobody reruns five queries at close. Quantify in dollars; adjectives don't route work. Route to the desk that owns the fix; never delete, never silently re-status. Then reconcile to the books of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened, and the journal sequence proves nothing was edited out. That's exactly why the trial balance alone is never sufficient evidence of correctness.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "ms-mcq-1",
      prompt: "The collections sit-down needs billings with NO receipt row at all. Which query finds them?",
      choices: [
        "SELECT … FROM invoices WHERE status = 'open'",
        "SELECT … FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "SELECT … FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents IS NULL",
        "SELECT … FROM invoices WHERE amount_cents > 0",
      ],
      answer: 1,
      why: "The anti-join is definitional: LEFT JOIN keeps billings without receipts (all payment columns NULL), and p.id IS NULL keeps exactly those — the 6-billing / 15217.00 watch.",
      notes: [
        { choice: 0, why: "Close but wrong membership: open carries 19609.00 while the no-receipt watch carries 15217.00 — the 4000.00-partial open billing has a receipt, and a paid-status billing with none rides in the watch instead." },
        { choice: 2, why: "An INNER JOIN drops the very rows you're hunting — billings with no receipt match nothing and vanish before the WHERE ever sees them." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-2",
      prompt: "The deck needs billings bucketed by billing month ('2024-10', '2024-12', …). Which expression builds the key?",
      choices: [
        "SUBSTR(issued_on, 1, 7)",
        "SUBSTR(issued_on, 1, 10)",
        "issued_on / 100",
        "STRFTIME(issued_on)",
      ],
      answer: 0,
      why: "SUBSTR(issued_on, 1, 7) slices '2024-10-14 …' to '2024-10' — the month key the 2024-01 to 2025-02 window is bucketed on, and it sorts correctly as text.",
      notes: [
        { choice: 1, why: "Ten characters is the full date — every billing becomes its own bucket and the monthly rollup dissolves into 28 rows of one." },
        { choice: 3, why: "STRFTIME needs a format string as its first argument; called bare it returns NULL and every billing lands in one NULL bucket." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-3",
      prompt: "The book board must read biggest billed first within each market. Which clause orders the board correctly?",
      choices: [
        "ORDER BY lifetime_billed",
        "ORDER BY lifetime_billed DESC",
        "ORDER BY market ASC",
        "SORT BY lifetime_billed DESC",
      ],
      answer: 1,
      why: "DESC puts the largest fold first — the board reads top-down by value. The default ORDER BY is ASC, which would headline the smallest household and invert the entire review.",
      notes: [
        { choice: 0, why: "Ascending by default — the board would open on the smallest book. Direction is part of the definition; leaving it to the default is how the smallest name tops the deck." },
        { choice: 2, why: "Ordering by market groups the rows alphabetically but says nothing about value — within each market the order is arbitrary. 'SORT BY' isn't SQL at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "ms-mcq-4",
      prompt: "A billing-to-receipt join for the book rollup returns 33 rows on a 28-billing book. The honest count of billings settled is:",
      choices: [
        "COUNT(*) = 33 — that's the settled count now",
        "COUNT(DISTINCT i.id) — five split-plan billings carry two receipt rows each",
        "27 — receipts, not billings",
        "28 — the join never changes row counts",
      ],
      answer: 1,
      why: "Split-plan billings carry two receipt rows, so the join prints 33 rows at receipt grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain the advisor conversation actually runs on.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the join's rows — receipt grain. Reporting 33 settled billings inflates the book by exactly the five split plans and misstates every coverage ratio downstream." },
        { choice: 3, why: "Joins absolutely change row counts — that's the fan-out. Grain is decided by the join, and the fix is a deliberate DISTINCT, not an assumption." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-5",
      prompt: "The board should keep only households whose lifetime billed crosses 5000.00. Where does that gate live?",
      choices: [
        "WHERE lifetime_billed >= 5000",
        "HAVING SUM(amount_cents) / 100.0 >= 5000",
        "LIMIT 5000",
        "ORDER BY lifetime_billed >= 5000",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — the column doesn't exist yet at filter time. Most engines reject it; the ones that tolerate it are computing something else." },
        { choice: 2, why: "LIMIT caps output rows, not values — 5000 rows of everything is not 'households over 5000 dollars'. The gate and the cap are different sentences entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-6",
      prompt: "The book board ranks households within each booking market. What does PARTITION BY region change versus no partition?",
      choices: [
        "Nothing — ORDER BY already sorts by market",
        "Each market's households rank 1..n independently, instead of one global ladder across all four",
        "It deduplicates households per market",
        "It converts the query into a GROUP BY",
      ],
      answer: 1,
      why: "PARTITION BY restarts the rank per market — every market gets its own rung 1. Without it, one global ORDER BY ranks all 11 billing-carrying households 1..11 and the per-market boards the advisors read disappear.",
      notes: [
        { choice: 0, why: "Sorting by market orders rows; partitioning renumbers ranks per market. A globally-ranked board shows rung 1 exactly once — one market's advisor reads a board with no top of it." },
        { choice: 2, why: "Windows never deduplicate — every billing-carrying household keeps its row. The partition changes the numbering, not the membership." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-7",
      prompt: "Settlement lag: days from billing to first receipt, averaged over 'paid' billings. The correct base is:",
      choices: [
        "All 21 paid billings",
        "All 27 receipt rows",
        "The 20 paid billings that carry a receipt — 28.4 days average",
        "All 28 billings on the book",
      ],
      answer: 2,
      why: "Lag needs both endpoints: one paid billing (1756.00) has no receipt, so its julianday diff is NULL and AVG skips it — the honest base is 20 paid-with-receipt billings, averaging 28.4 days against flat 30-day terms.",
      notes: [
        { choice: 0, why: "The 21st paid billing has no receipt — its lag is NULL and drops out of AVG silently. Quoting a 21-billing base on the slide misstates the denominator the number was computed over." },
        { choice: 1, why: "Receipt rows are the wrong grain — five split billings count twice. An average over rows, not relationships, is quietly weighted by payment behavior." },
      ],
      difficulty: "medium",
    },
    {
      id: "ms-mcq-8",
      prompt: "The watch has 6 billings / 15217.00; the open-status census has 6 billings / 19609.00. What explains the 4392.00 gap?",
      choices: [
        "A units error — one of them forgot to divide by 100",
        "Different membership: the open 4000.00-partial billing has a receipt (out of the watch), and a paid-status 1756.00 billing has none (in it)",
        "The watch excludes void billings; the census includes them",
        "Nothing — both lists are the same six billings",
      ],
      answer: 1,
      why: "Same count, different sets. The anti-join keys on receipt presence, not status — so the open billing with a 4000.00 partial against 6148.00 drops out, and the paid-status billing at 1756.00 rides in. Membership is evidence, not a status string.",
      notes: [
        { choice: 3, why: "The counts coinciding is the trap, not the proof — if the sets were identical the dollars would tie too. They don't, and the two anomalies in this book are the entire gap." },
        { choice: 2, why: "Neither read filters void explicitly — the anti-join never mentions status. Inventing a void filter explains a gap the data doesn't have." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-9",
      prompt: "Two EU households each show two billings. RANK and ROW_NUMBER over (frequency DESC, value DESC) return:",
      choices: [
        "Identical boards — ties always render the same",
        "RANK: 3, 3, then 5 — ROW_NUMBER: 3, 4, then 5",
        "RANK: 3, 4 — ROW_NUMBER: 3, 3",
        "RANK: 4, 4, then 5 — ROW_NUMBER: 3, 5",
      ],
      answer: 1,
      why: "RANK gives tied rows the same rung and skips — 3, 3, then 5. ROW_NUMBER breaks the tie arbitrarily — 3, 4 — and hands the rung to whichever row the plan read first. Same data, different boards; only one is defensible on an advisor call.",
      notes: [
        { choice: 0, why: "Ties are exactly where the two diverge — 'always the same' is the assumption that ships a randomly-tied board to the desk that emails 'everyone at rung 3'." },
        { choice: 2, why: "That's DENSE_RANK's shape (consecutive rungs, ties share) mislabeled twice — neither function prints 3, 4 for a tie. Knowing which policy you're looking at is the whole point." },
      ],
      difficulty: "hard",
    },
    {
      id: "ms-mcq-10",
      prompt: "Which read proves the void billing that still received 925.00?",
      choices: [
        "SELECT … FROM invoices WHERE status = 'void'",
        "Pair state with evidence: status='void' AND an EXISTS receipt row",
        "SELECT … FROM payments WHERE method = 'void'",
        "Anti-join: billings with NO receipt rows",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a receipt that exists. Status alone shows the void but hides the 925.00 hit; the paired read is the evidence that a settlement cleared against a cancelled billing.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — payments carry card and wire only. The query errors, and the break stays invisible through close." },
        { choice: 3, why: "The anti-join finds NEVER-received billings — the opposite evidence. The void-but-received row HAS a receipt, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ms-1",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The household book board",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (invoices = client fee billings, customers = client households): the growth review wants the advisor-book board — every billing-carrying household ranked by billing frequency within its booking market, lifetime billed beside each name. The desk is explicit about the tie: 'frequencies tie all the time on a wealth book — the board shows the tie, and the tie policy is a decision someone signs.' Probed facts: the book holds **28 billings**; the busiest household carries **24** booked flows for **7262.35**; the 3000-plus tier holds **63.5%** of booked value. Markets rank independently — a household is rung 1 of its market, not of the planet.",
      ask: "Return the board: household, market, billing count, lifetime billed (2dp), book rank — ties sharing rungs, most billings first.",
      template:
        "SELECT c.name,\n       c.region AS market,\n       COUNT(*) AS billings,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS lifetime_billed,\n       {1}() OVER (PARTITION BY c.{2} ORDER BY COUNT(*) {3}) AS book_rank\nFROM invoices i\nJOIN customers c ON c.id = i.{4}\nGROUP BY i.customer_id\nORDER BY market, book_rank;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "RANK gives tied frequencies the same rung and skips the next — two households at two billings both show rung 3. ROW_NUMBER would hand the rung to one of them by plan order and the board would look authoritative while being arbitrary.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the market partition",
          why: "PARTITION BY c.region restarts the rank per booking market — every market gets its own rung 1. Partition by name or id and each household becomes its own board, all reading rank 1.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the frequency order",
          why: "DESC ranks most-billing households first within each market — the board reads top-down by relationship activity. ASC inverts it and hands rung 1 to the quietest book on the desk.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the household key",
          why: "The join runs on c.id = i.customer_id: every billing attaches to its billing household. Joining on row id pairs billings with whichever household shares the number — a different book entirely.",
        },
      ],
      distractors: ["ROW_NUMBER", "DENSE_RANK", "ASC", "id", "name"],
      walkthrough:
        "A book board is a fold, a partition, and a tie policy — in that order. The join attaches each of the 28 billings to its household; GROUP BY i.customer_id folds per household (COUNT(*) as billing frequency, SUM(amount_cents)/100.0 as lifetime billed riding beside); PARTITION BY c.region makes each market's board independent; RANK() OVER (ORDER BY COUNT(*) DESC) numbers them with ties sharing rungs — the desk's stated policy, and frequency ties are real on this book: two EU households sit at two billings and two more at one, so rungs 3 and 5 are each shared. Lifetime billed is deliberately NOT in the window's ORDER BY — the tie is the board's point, and the value column is context, not a silent tiebreaker that would fake uniqueness. The distractors all break it honestly: ROW_NUMBER breaks the tie arbitrarily (3, 4, 5 — a different board the desk didn't ask for), DENSE_RANK renumbers rungs consecutively (a tier ladder, not a placement), ASC inverts the frequency order, partitioning by name or id makes every household its own rung-1 board, and the wrong join key pairs billings with strangers. The habit being graded: ties are a policy decision, the partition is the board's boundary, and the rank function you pick is the tie policy you ship.",
    },
    {
      id: "cs-ms-2",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The fee-receivable watchlist",
      brief:
        "Morgan Stanley-flavored memo on the storefront db (receipts = fee receipts, billings = fee billings): the collections sit-down opens on the fee-receivable watchlist — every billing with NO receipt row at all, biggest first, so the desk works the biggest exposures first. Probed facts: the watch carries **6 billings / 15217.00** against flat 30-day terms (min 30, max 30 — terms are a definition here, not a distribution). One member is awkward on purpose: a **1756.00** paid-status billing with no receipt anywhere rides the list, which is exactly why membership is evidence, not the status column.",
      ask: "Return the watchlist: billing reference, status, billed dollars (2dp) — biggest exposure first.",
      template:
        "SELECT i.{1} AS billing_ref,\n       i.status AS state,\n       ROUND(i.amount_cents / 100.0, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{2}\nWHERE p.id IS NULL\nORDER BY billed {3};",
      slots: [
        {
          answer: "number",
          kind: "keyword",
          label: "the billing reference",
          why: "i.number is the human-facing billing reference the desk works from. An id prints a number nobody can act on, and status duplicates the state column beside it.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key (billing side)",
          why: "The anti-join keys on p.invoice_id = i.id — a receipt points at its billing's primary key. Joining on anything else pairs receipts with strangers or empties the join, and the IS NULL test stops meaning 'never received'.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "DESC headlines the biggest exposure — the desk works top-down. ASC opens on the smallest and the meeting burns its hour on the wrong rows.",
        },
      ],
      distractors: ["id", "status", "customer_id", "ASC"],
      walkthrough:
        "A watchlist is an anti-join with an opinion about order. FROM invoices LEFT JOIN payments ON p.invoice_id = i.id keeps every billing and attaches whatever receipts exist; WHERE p.id IS NULL keeps exactly the billings where no receipt matched — the definition of never-received, 6 billings carrying 15217.00. The LEFT JOIN is load-bearing: an inner join would drop the very rows the meeting is about, because billings without receipts match nothing. ORDER BY billed DESC is the working order — biggest exposure first. The result's membership is the lesson: a paid-status billing at 1756.00 sits on the list because status is a claim and the receipt census is evidence, while an open billing with a 4000.00 partial against 6148.00 stays off because it has evidence. The distractors fail honestly: joining on id pairs receipts to same-numbered billings and silently shrinks the watch, customer_id isn't a payments column, status duplicates the state column, and ASC turns the desk's hour into a bottom-up crawl. The habit being graded: the IS NULL arm IS the definition, and the order is part of the deliverable.",
    },
  ],

  problems: [
    { slug: "employee-bonus", why: "LEFT JOIN a bonus onto the base and keep the NULLs: the advisor-book rollup shape — households with no receipt row are the watch, and this drill keeps them visible." },
    { slug: "top-travellers", why: "Fold value per relationship and rank the top of the book: the lifetime-billed board the advisor conversation actually runs on." },
    { slug: "bank-account-summary-ii", why: "Balance-and-count summary per account: the household snapshot card — billed, received, outstanding in one fold, exactly the desk's weekly read." },
    { slug: "weather-type-in-each-country", why: "CASE classification per group: the billing-state ladder — which market prints which state mix, one conditional fold at a time." },
    { slug: "customer-order-frequency", why: "HAVING-gated frequency per relationship: which households bill often enough to matter — the book board's gate in textbook form." },
    { slug: "immediate-food-delivery-iii", why: "Monthly promised-versus-actual shares: the settled-versus-billed cadence by month — a conditional fold whose denominator is ALL billings." },
    { slug: "portfolio-weights", why: "Each position's share of the book via window sums: the household-weight read — 63.5% over the 3000 line is this drill's business question." },
    { slug: "portfolio-concentration-hhi", why: "Concentration index over folded value: how thin the wealth book's base really is, computed the way the risk committee quotes it." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of distinct relationships per group: the market-penetration fold — distinct households over the book, percentage arithmetic done honestly." },
    { slug: "maximum-transaction-each-day", why: "Peak activity per day via a window fold: the flows-desk morning read — the day's biggest movement, every day, one query." },
    { slug: "second-highest-salary", why: "Second-largest value under NULL traps: the second-biggest relationship read — the classic NULL-when-no-second case the desk actually hits." },
    { slug: "top-earners", why: "Top earners by value with tie handling: the fee-contributor board — RANK versus ROW_NUMBER as a tie policy, drilled on a leaderboard." },
    { slug: "the-category-of-each-member-in-the-store", why: "Tier classification over folded spend: the fee-tier ladder — which band a household lands in decides the invoice, so the boundary operator is the dispute." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend-tier bands over lifetime value: the household-band read the fee schedule prices against — tiers are definitions someone owns." },
    { slug: "risk-based-pricing", why: "Band join between value and schedule ranges: risk-based fee assignment in SQL — the boundary join where tier disputes are settled." },
    { slug: "product-price-at-a-given-date", why: "The price that WAS live at event time, not today's: as-of logic is exactly how fee-schedule disputes are proved at the desk." },
  ],
};
