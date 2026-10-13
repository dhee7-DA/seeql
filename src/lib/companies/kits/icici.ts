// ICICI Bank — kit 14 of the Banking & Capital Markets domain (Batch L, wave 7).
// India's private bank: retail, cards, UPI-scale flows — where the retail book
// moves on two rails (the card retail rail and the interbank wire rail),
// branches carry their own cost lines, and settlement hygiene is an audit
// trail: a status column is a claim, a rail hit is evidence. The storefront db
// maps on honestly: invoices are client fee billings (statement cycles, card
// annual fees, loan notices — the receivables the branch books carry),
// payments are settlement legs (method card / wire), ledger_entries is the
// double-entry book of record (the branch audit trail), expenses are
// branch-and-ops opex lines, customers are clients across four circle books
// (EU / US / APAC / LATAM standing in for the circle network), orders are
// booked fee events (REAL dollars — the one table where money is already
// dollars), products are account and card products. Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: ICICI has 0 tagged sql rows in the band (checked
// company-pools.md for icici / ICICI variants) — 0 tagged LC — theme-curated:
// every topic and problem slug is curated from the theme menu to ICICI's known
// question families (circle-book folds, card-portfolio health, coverage
// censuses, rails, branch audit trails, settlement hygiene), provenance
// stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12), case cells
// re-probed against db/custom.db (read-only) before authoring.

import type { CompanyKit } from "../types";

export const iciciKit: CompanyKit = {
  id: "icici",
  domainId: "banking",
  name: "ICICI Bank",
  tagline: "India's private bank: retail, cards, UPI-scale flows",
  accent: "text-rose-300",

  brief: [
    "**ICICI Bank** is India's private bank — retail banking at India scale, where card portfolios, UPI-scale payment flows and a branch network's cost lines all land in one warehouse. On this training db the mapping is honest: `orders` are booked fee events (REAL dollars — the one table where money is already dollars), clients sit across four {sky:circle books}, and every fee the retail engine bills — statement cycle, card annual fee, loan notice — lands as a receivable. Probed scale: **103 booked fee events worth 34833.28**, the busiest household holding **24 events for 7262.35**, with the circles reading EU 45 events / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44.",
    "The money tables are where ICICI screens live, and they are integer cents — the dollar read is always `amount_cents / 100.0`. Invoices carry the fee billings: 21 paid for 66443.00, 6 open at 19609.00, 1 void at 925.00. Payments are the settlement legs that clear them on two rails — {emerald:card}, the retail card rail (16 legs for 37364.00), and {sky:wire}, the interbank rail (11 legs for 32248.00) — and five billings were settled on split plans that cross both rails. The ledger is the branch audit trail: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. *A circle number that can't tie back to the books is a rumor, not a read.*",
    "The SQL screens are settlement-hygiene screens. A warm-up per-circle fold, then the two questions the audit culture is famous for: the {emerald:coverage census} — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — where membership is rail evidence, not the status column, and the {rose:anomaly pair} — a void billing that still drew its **925.00** rail hit, and a paid-status billing at **1756.00** with no rail hit at all. Follow-ups probe the denominator ('open-status or no-leg — which six?') and the fan-out ('leg count or billing count — one billing can take two rail hits').",
    "Prep the way the screens run. Drill conditional folds and `FILTER (WHERE …)` censuses, strftime month buckets across the 2024-01 to 2025-02 window, the branch cost reads (Rent at 14 lines / **16800.00**, monthly opex peaking **3210.00** in 2024-08), and the settlement clock — billings average **28.4 days** to first settlement, fastest 13, slowest 84, against flat 30-day terms. Then practice the sentence that gets hired at a house that clears UPI-scale flow: *same product, different circle — the definition travels, the evidence stays local, and every census names its denominator.*",
  ],

  dayInLife: [
    "**08:15 —** the circle proof before the branch calls. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: card **16 legs / 37364.00**, wire 11 / 32248.00, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: one void billing that still drew **925.00**, one paid-status billing with no rail hit at **1756.00**. The branch heads dial in at 08:45; the books tie before they do.",
    "**11:30 —** deep work: the collections worklist, cut per circle. Billings `LEFT JOIN`ed to their settlement legs, the no-leg six isolated — **EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00** — with the APAC row being the paid-status billing whose trail shows no leg ever moved. LATAM's book prints nothing at all, and the instinct being trained is that {rose:absence is not zero} — a clean circle prints no row, and the worklist counts *billings*, never leg rows, because the five cross-rail splits would double-count exactly the billings worth arguing about.",
    "**16:45 —** circle review prep and the EOD writeup. The pack ships three reads with definitions attached: card-portfolio health against the rail census, the opex calendar (Rent at 14 lines / **16800.00**, the 3210.00 peak in 2024-08), and the settlement clock — **28.4 days** average against flat 30-day terms, fastest 13, slowest 84. Tomorrow's ask is queued for the audit-trail board: the paid-unmoved **1756.00**, waiting on the source system's own explanation. *The review doesn't argue with evidence; it argues with definitions — so the definitions go in writing.*",
  ],

  metrics: [
    { name: "Booked fee events by circle", what: "Fee events with value per circle book — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every retail read starts from." },
    { name: "Billing-state mix", what: "Fee billings by state — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00. The circle total is believed only after the split reproduces it." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). Membership is rail evidence (folded legs vs billed), never the status column." },
    { name: "Rail mix", what: "Settlement legs per rail — card 16 / 37364.00 (retail card rail), wire 11 / 32248.00 (interbank). 27 legs fold onto 22 billings: the five splits cross rails, so only the total shows the squeeze." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Anomaly pair watch", what: "The two breaks every audit review opens with: void-but-drawn (925.00) and paid-with-no-leg (1756.00). State paired with rail evidence, quantified in dollars, routed — never deleted." },
    { name: "Branch cost lines", what: "Branch-and-ops spend by category and month — Rent 14 lines / 16800.00 (the branch leases), Ads 14 / 4570.00, monthly opex peaking 3210.00 in 2024-08, biggest single line 1680.00. The cost read behind every branch conversation." },
    { name: "Settlement lag", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The collections tempo, per circle." },
  ],

  topics: [
    {
      name: "Circle-book folds",
      why: "The circle number only exists if the network split reproduces it: billings, value and clients GROUP BY circle, with group-versus-circle benchmarks and per-circle ratio reads doing the tie-back check. This is the warm-up every ICICI screen opens with, and the denominators stay local on purpose.",
      slugs: ["countries-you-can-safely-invest-in", "find-expensive-cities", "average-salary-of-departments"],
    },
    {
      name: "Card-portfolio health",
      why: "The card rail is the retail engine: velocity bursts, duplicate-charge pair screens and chargeback-style rate rankings are how the cards desk watches 16 legs a close behave. Portfolio health is read at leg grain — a billing can ride both rails, so the rail view and the billing view are different truths that must both tie.",
      slugs: ["transaction-velocity", "duplicate-charge-pairs", "chargeback-rate-ranking"],
    },
    {
      name: "UPI-scale flow cadence",
      why: "Retail flow breathes on paydays: weekday and month-end cadence reads, spend clustering and short-window repeat behavior decide when branches staff and when pushes fire. The drill is finding the rhythm in event timestamps — the same machinery that reads UPI bursts at scale.",
      slugs: ["users-with-two-purchases-within-seven-days", "friday-purchases-i", "friday-purchases-ii"],
    },
    {
      name: "Coverage & partial settlements",
      why: "A billing can be open AND received: the 4000.00 leg against the 6148.00 balance is the case study every circle review cites. Coverage folds legs per billing and compares to billed — the classification is computed from evidence, never stored as a status.",
      slugs: ["bank-account-summary", "monthly-transactions-ii", "immediate-food-delivery-ii"],
    },
    {
      name: "Branch & opex cost lines",
      why: "Branches are the cost story: category folds over opex lines (Rent at 14 lines / 16800.00), pacing against plan and month-bucketed spend peaking 3210.00 in 2024-08 are the reads behind every branch-footprint conversation. Count-only reads flatten the story — 14 Rent lines and 14 Ads lines are wildly different dollars.",
      slugs: ["spend-histogram", "budget-pacing", "friday-purchase-iii"],
    },
    {
      name: "Anomaly & fraud screens",
      why: "Settlement hygiene pairs state with evidence: void-but-drawn, paid-unmoved, amount outliers. Sliding-window checks, z-score amount screens and percentile-ranked suspicion are the screens that catch the 925.00 break before the regulator's read does.",
      slugs: ["suspicious-bank-account-transactions", "amount-anomaly-zscore", "top-percentile-fraud"],
    },
    {
      name: "Branch audit trails & reconciliation",
      why: "The ledger ties or nothing ships: trial-balance folds (181080.00 against 181080.00, delta 0), ledger-versus-rail reconciliation and balance rollforwards are the proof drills behind every close call. The trail records what happened — including mistakes — so the trial balance alone is never proof of correctness.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
    {
      name: "Collections & delinquency watch",
      why: "Fee receivables age like credit exposures: days-past-terms buckets, aging schedules and vintage default curves are the language the collections desk runs in — built on the no-leg anti-join (6 billings / 15217.00) and flat 30-day terms.",
      slugs: ["delinquency-buckets", "ar-aging-schedule", "vintage-default-curves"],
    },
    {
      name: "Circle window boards",
      why: "Circles compete for the review's attention: top billings per circle, most-recent cycles per client and per-partition counts are the boards the monthly read ships — each circle ranked within itself, never one global ladder where EU owns every rung.",
      slugs: ["department-top-three-salaries", "the-most-recent-three-orders", "find-the-team-size"],
    },
    {
      name: "Client activity & cadence",
      why: "Relationship managers read households, not events: repeat-fee frequencies, loyal-client screens and completion-rate reads decide who gets the call — and the 24-event household is exactly the record this drill finds first.",
      slugs: ["customer-order-frequency", "find-loyal-customers", "confirmation-rate"],
    },
  ],

  theory: [
    {
      id: "icici-t1",
      q: "You join fee billings to their settlement legs and the per-circle billing counts stop summing to the 28-billing book. What broke?",
      a: "Fan-out: five billings were settled on split plans — two legs each — so the join prints 33 rows and every COUNT(*) on that result counts rail hits, not billings. The fix is grain discipline: fold the legs per billing first (derived table or CTE), or protect the census with COUNT(DISTINCT i.id). The ICICI twist that catches even careful candidates: the splits cross rails — one card leg, one wire leg — so per-rail counts look perfectly clean (16 legs / 16 billings card, 11 / 11 wire) and only the total shows 22 billings under 27 legs. The circle tie-back rule exists exactly for this: the split must reproduce the whole, and a fold at leg grain breaks that identity by exactly the five cross-rail splits.",
      tag: "joins",
    },
    {
      id: "icici-t2",
      q: "The circle review wants each circle's biggest fee billings ranked within its own book. Build that board in one query.",
      a: "Windows with PARTITION BY: RANK() OVER (PARTITION BY circle ORDER BY amount_cents DESC) gives every circle book its own rung 1, and ORDER BY circle, rung on the outside makes the board read circle by circle. Without the partition you get one global ladder where EU owns the top five rungs outright (6148.00, 5614.00, 5284.00, 4860.00, 4723.00) and three circles' managers read boards with no top of them. I keep the tie policy explicit — RANK shares rungs on ties, ROW_NUMBER doesn't — and pin a deterministic tiebreaker inside the window so the branch head's rerun reproduces the board row for row. A retail bank never ranks one circle's whales against another's minnows.",
      tag: "windows",
    },
    {
      id: "icici-t3",
      q: "Build the coverage census — exact, partial, no rail — so the audit review can argue with real numbers.",
      a: "Fold settlement legs per billing, then classify, then fold again per circle: LEFT JOIN billings to legs, GROUP BY billing id, COALESCE the receipt sum to 0, and CASE arms — no leg is the none arm, SUM < billed is partial, equal is exact. The follow-ups are where candidates die: open status is not the no-leg book (19609.00 versus 15217.00 — the open 4000.00-partial has a leg and leaves the anti-join, while a paid-status 1756.00 has none and stays), and the legs join fans split billings, so the census counts DISTINCT billings. I quote the actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and insist the circle split reproduce them before the pack ships.",
      tag: "aggregation",
    },
    {
      id: "icici-t4",
      q: "A stakeholder says 'the uncollected book is the open book — both are six billings.' Where does that identity fail?",
      a: "At membership, which the coincidental count hides. The open-status census carries 19609.00; the no-leg anti-join carries 15217.00 — the 4392.00 gap is two honest anomalies: an open billing with a 4000.00 partial settlement (evidence exists, so it leaves the watch) and a paid-status billing at 1756.00 with no rail hit (a claim without evidence, so it stays). The lesson: the anti-join's IS NULL on the right-side key defines 'never settled', and a status column is a claim about a state machine the branch can't see. On a settlement-hygiene book I name both lists per circle before choosing which one the review works — and the two lists can diverge differently per circle, which is why the tie-back rule exists.",
      tag: "nulls",
    },
    {
      id: "icici-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites in a per-circle fold.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects, ORDER BY and LIMIT run last. The bites: the 'circles with a live uncollected book' gate is HAVING, because the fold doesn't exist at WHERE time; a WHERE on circle is a row predicate and belongs above the fold; SELECT aliases are usable in GROUP BY and ORDER BY in SQLite but not in WHERE. On the retail board I keep the circle filter in WHERE, the small-book gate in HAVING, and I narrate the order out loud — interviewers here are checking whether pipeline order is a mental model, because branch reporting is folds and gates landing in the right clause, every close, across every circle.",
      tag: "pipeline",
    },
    {
      id: "icici-t6",
      q: "One circle's book looks expensive per billing versus the network average. Scalar subquery, window, or CTE for the benchmark?",
      a: "By how much definition the benchmark needs. A scalar subquery — WHERE billed > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one network-wide line. AVG() OVER (PARTITION BY circle) is the better shape when the review wants each billing beside its own circle's mean, because the benchmark travels with the row. A CTE earns its keep when the benchmark gets a definition — 'network average over open-and-paid billings, void excluded' — because a named, commented fold is auditable across four circle books and a nested one-liner isn't. Retail benchmarks always grow per-circle definitions here, so I stage the CTE earlier than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "icici-t7",
      q: "The collections read needs billing-cohort months and days-past-terms. How do you handle dates in SQLite for both?",
      a: "Two tools. Cohort buckets with strftime('%Y-%m', issued_on) — a '2024-10' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Aging needs instant arithmetic: julianday(reference) - julianday(due_on) per billing, against flat 30-day terms — and the trap I name out loud: julianday over a missing or malformed date NULLs the row silently, so the watch's denominator drifts unless the NULL arm is handled on purpose. The settled billings' own clock runs 28.4 days average billing-to-settlement (fastest 13, slowest 84), which is why 'terms are flat 30' is a definition worth verifying — min and max terms both print 30 here, so any spread in the lag is behavior, not contract.",
      tag: "dates",
    },
    {
      id: "icici-t8",
      q: "A void billing still drew a 925.00 settlement, and a paid billing shows no rail hit at all. What's the break policy?",
      a: "Detect, quantify, route — per circle, then as a network. Detect by pairing state with evidence: status = 'void' AND a settlement leg exists (the 925.00 break), status = 'paid' AND no leg (the 1756.00 break) — a one-pass FILTER (WHERE …) census counts both arms on the same scan so every circle's numbers come from one query. Quantify in dollars; route to the desk that owns the source system; never delete, never silently re-status — the audit trail is the product. Then reconcile to the book of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened, breaks included. The trial balance alone is never sufficient evidence of correctness — that sentence is the audit culture here.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "icici-mcq-1",
      prompt: "The morning proof needs the rail census: settlement legs and dollars per rail. Which query delivers it?",
      choices: [
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM payments GROUP BY method",
        "SELECT method, COUNT(amount_cents) FROM payments",
        "SELECT method, SUM(amount_cents) FROM invoices GROUP BY method",
        "SELECT rail, COUNT(*) FROM payments GROUP BY rail",
      ],
      answer: 0,
      why: "Legs live on payments; fold per rail with COUNT(*) for legs and SUM(amount_cents)/100.0 for dollars — card 16 / 37364.00, wire 11 / 32248.00, cross-footing to 69612.00.",
      notes: [
        { choice: 2, why: "Invoices have no method column — the query errors before it lies. Rails are a property of settlement legs, not of billings." },
        { choice: 3, why: "'rail' isn't the column name — the db calls it method. A wrong identifier errors, and the morning proof ships late rather than wrong." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-2",
      prompt: "A settlement leg is stored as amount_cents = 236150. What's the correct dollar read on the rail report?",
      choices: [
        "amount_cents / 100.0, rounded once at the edge",
        "amount_cents / 100",
        "amount_cents, formatted with two decimals",
        "ROUND(amount_cents) / 1000",
      ],
      answer: 0,
      why: "Money is integer cents; divide by 100.0 (float) and round once — 236150 cents reads 2361.50. The /100 integer read truncates the odd-cent legs this book actually carries.",
      notes: [
        { choice: 1, why: "Integer division drops the remainder — the 2361.50 leg prints 2361 and the cross-foot against the cash book's 69612.00 misses by the half-dollars." },
        { choice: 2, why: "Formatting doesn't divide — 236150 formatted is still two hundred thirty-six thousand one hundred fifty cents. The unit conversion has to happen in the math." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-3",
      prompt: "The collections cohort card buckets fee billings by issue month ('2024-11', '2025-01', …). Which expression builds the key?",
      choices: [
        "strftime('%Y-%m', issued_on)",
        "strftime('%M', issued_on)",
        "SUBSTR(issued_on, 9, 2)",
        "YEAR(issued_on)",
      ],
      answer: 0,
      why: "strftime('%Y-%m', issued_on) prints the '2024-11' month key the cohort card buckets on — and the keys sort correctly as text across the 2024-01 to 2025-02 window.",
      notes: [
        { choice: 1, why: "%M is MINUTES in SQLite, not month — every billing buckets by wallclock minute 00–59. The classic strftime trap, and the cohort card dissolves into forty buckets." },
        { choice: 2, why: "Characters 9–10 are the day of month — a 31-bucket calendar, not a monthly cohort. Month keys start at character 1 with length 7." },
      ],
      difficulty: "easy",
    },
    {
      id: "icici-mcq-4",
      prompt: "A billings-to-legs join for the per-circle split returns 33 rows on a 28-billing book. The honest per-circle billing count is:",
      choices: [
        "COUNT(*) per circle — 33 is the book now",
        "COUNT(DISTINCT i.id) per circle — five split-plan billings carry two legs each",
        "27 per circle — the void billing vanished",
        "Whatever the join returns — counts never need protecting",
      ],
      answer: 1,
      why: "Five split-plan billings ride two legs each, so the join prints 33 rows at leg grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain whose circle split must reproduce the 28-billing book.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rail hits — the split then exceeds the whole by exactly the five cross-rail splits, and nobody can explain why the parts outrun the book." },
        { choice: 2, why: "The void billing is still a billing on the book — it holds its place in the census whether or not a rail ever hit it. Dropping it conflates the billing book with the settlement feed." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-5",
      prompt: "The board keeps only circles whose uncollected book exceeds zero. Where does that gate go?",
      choices: [
        "WHERE uncollected > 0",
        "HAVING SUM(p.amount_cents) > 0",
        "LIMIT 1",
        "WHERE method IS NOT NULL",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the settlement fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — uncollected isn't born yet at row-filter time. It either errors or filters something else entirely." },
        { choice: 2, why: "LIMIT 1 keeps one row, not the qualifying rows — a gate and a cap are different sentences, and this one silently deletes three of the four circles." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-6",
      prompt: "One billing was billed 6148.00 and took a 4000.00 leg. Which read classifies it partial?",
      choices: [
        "WHERE status = 'partial'",
        "Fold legs per billing and compare: SUM(receipts) < billed",
        "WHERE amount_cents = 614800",
        "GROUP BY status and eyeball the open row",
      ],
      answer: 1,
      why: "Coverage is evidence across two tables: fold the billing's settlement legs, compare to billed — 4000.00 against 6148.00 is partial. No such status exists in the book; the state is computed, never stored.",
      notes: [
        { choice: 0, why: "The billing still says open while carrying 4000.00 of legs — filtering on a status that doesn't exist returns an empty census and the partial never surfaces." },
        { choice: 2, why: "Hardcoding one amount finds one billing today and nothing next quarter. The definition is the comparison — every partial, present and future, falls out of SUM(receipts) < billed." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-7",
      prompt: "The settlement clock reads 28.4 days average issue-to-first-settlement. Which expression computes each settled billing's lag?",
      choices: [
        "julianday(paid_on) - julianday(issued_on), averaged over billings with legs",
        "julianday(due_on) - julianday(issued_on), averaged over all billings",
        "paid_on - issued_on, averaged as text",
        "AVG(paid_on) over the payments feed",
      ],
      answer: 0,
      why: "Lag is behavior: the date the leg actually moved minus the date the billing was issued, over settled billings — 20 billings averaging 28.4, fastest 13, slowest 84. The terms clock (due minus issue) is a contract, flat 30, and would print exactly 30 every time.",
      notes: [
        { choice: 1, why: "Due minus issue is the terms definition, not the settlement clock — against this book it prints 30.0 flat and hides the 13-to-84 behavioral spread the review is asking about." },
        { choice: 2, why: "Text subtraction of 'YYYY-MM-DD' strings isn't date math — SQLite coerces the leading year and the lag collapses to near-zero. julianday is the instant arithmetic that survives." },
      ],
      difficulty: "medium",
    },
    {
      id: "icici-mcq-8",
      prompt: "Which read isolates the void billing that still drew a 925.00 rail hit — per circle?",
      choices: [
        "WHERE status = 'void', grouped by circle",
        "Pair state with evidence: status='void' AND an EXISTS settlement leg, grouped by circle",
        "WHERE method = 'void' on the settlement feed",
        "The no-leg anti-join, grouped by circle",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a leg that exists. The paired read proves the rail hit should never have cleared and attributes it to the circle whose book absorbed the 925.00; status alone shows the void but not the drawn leg.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — the settlement feed carries card and wire only. The query errors and the break stays invisible in the pack." },
        { choice: 3, why: "The anti-join finds NEVER-settled billings — the opposite evidence. The void-but-drawn row HAS a leg, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-9",
      prompt: "Two sixes again: the open-status census reads 6 billings / 19609.00; the no-leg anti-join reads 6 billings / 15217.00. The 4392.00 gap is:",
      choices: [
        "Rounding drift between cents and dollars",
        "Membership: the open 4000.00-partial has a leg (out of the anti-join), and a paid-status 1756.00 has none (in it)",
        "The anti-join excludes void billings",
        "Nothing — same six billings, same dollars",
      ],
      answer: 1,
      why: "Same count, different sets — the anti-join keys on rail evidence, not status. The swing is exactly the two honest anomalies in the book, and per circle they sit differently (the 1756.00 lands in APAC's worklist), which is why the tie-back rule exists.",
      notes: [
        { choice: 3, why: "If the sets were identical the dollars would tie too — they don't. Equal counts with unequal dollars is the signature of different membership, not of agreement." },
        { choice: 0, why: "Both reads divide by 100.0 the same way. 'Rounding' is the excuse that stops the investigation one step before the actual finding." },
      ],
      difficulty: "hard",
    },
    {
      id: "icici-mcq-10",
      prompt: "The ledger proves 181080.00 debits against 181080.00 credits, delta 0. What does that proof NOT establish?",
      choices: [
        "That every settlement leg posted to cash",
        "That billings were classified correctly — a void-but-drawn 925.00 still balances",
        "That the cash account's debit fold is 69612.00",
        "That the ledger has 80 entries",
      ],
      answer: 1,
      why: "Double-entry records what happened, including mistakes: the void-but-drawn 925.00 and the paid-unmoved 1756.00 both balance perfectly. The trial balance proves symmetry, never correctness of classification — that's what the anomaly census is for.",
      notes: [
        { choice: 0, why: "It does establish posting symmetry — the cash fold (69612.00 debits) ties to the rail census line for line. The gap is classification, not posting." },
        { choice: 2, why: "The cash account's 69612.00 debit fold is part of what ties. The proof's blind spot is whether each posting was RIGHT, not whether it happened." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-icici-1",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The collections worklist, per circle",
      brief:
        "ICICI-flavored memo on the storefront db (invoices = client fee billings, payments = settlement legs, customers = clients across four circle books): the circle collections review wants the no-leg worklist — every billing the rails never touched, cut per circle — so the branch desks work evidence, not status claims. Probed facts: the no-rail watch reads **6 billings / 15217.00**, landing as EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00 — and the APAC row is the paid-status billing whose audit trail shows no leg ever moved. LATAM's book is clean and must print nothing: *absence, not zero, and membership is rail evidence.*",
      ask: "Return the worklist: circle, no-leg billing count, collections book (2dp) — biggest book first.",
      template:
        "SELECT c.{1} AS circle,\n       COUNT(*) AS worklist_rows,\n       ROUND(SUM(i.{2}) / {3}, 2) AS collections_book\nFROM invoices i\nJOIN customers c ON c.id = i.{4}\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nGROUP BY c.region\nORDER BY collections_book {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the circle label",
          why: "c.region is the circle book — the label the review reads and the GROUP BY's key. The city column would relabel rows at street grain under a region fold: real values, wrong geography for a circle review.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the billed-money column",
          why: "Collections dollars are the billings' own amounts — SUM(i.amount_cents), integer cents. Folding the id column sums primary keys: the probe prints a 0.92 'book' for EU, which is six row numbers divided by a hundred.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "The dollar read is amount_cents / 100.0 — float division, rounded once. Divide by 1000 and every book prints a tenth its size (EU reads 852.40 instead of 8524.00); the integer-100 habit matters book-wide because the rails carry odd-cent legs like 2361.50 that truncate silently.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the circle join key",
          why: "Each billing points at its client's primary key — c.id = i.customer_id. Joining on the billing's own id pairs by row-number coincidence, and the unpaid six (ids 18–28) have no customer rows at that number, so the worklist empties to nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "DESC headlines the biggest collections book — the desks work top-down from EU's 8524.00. ASC opens on APAC's 1756.00 row and buries the live exposure under the small books.",
        },
      ],
      distractors: ["city", "i.id", "1000", "ASC"],
      walkthrough:
        "A collections worklist is an anti-join with the evidence rule attached. The LEFT JOIN keeps every billing and hands unmatched billings NULL legs; WHERE p.id IS NULL keeps exactly the never-settled six — 15217.00 landing as EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00 — and the APAC row is the book's famous anomaly: status claims paid, the trail shows no leg, and it stays on the list because membership is evidence, not the status column. GROUP BY c.region folds per circle, SUM(i.amount_cents)/100.0 — rounded once — sizes each book, and LATAM prints no row at all: a clean book is an absence, not a zero line. The distractors fail honestly: 'city' relabels rows at street grain under a region fold, 'i.id' as the join key pairs by row-number coincidence and the six (ids 18–28) lose their customer rows — the worklist empties; as the money column it sums primary keys into a 0.92 'book'; 1000 prints every book a tenth its size; ASC buries EU under APAC. The habit being graded: the IS NULL arm IS the metric — the watch is defined by what never moved.",
    },
    {
      id: "cs-icici-2",
      tier: "hard",
      topic: "x3",
      universe: "refund-audit",
      title: "The rail audit stack",
      brief:
        "ICICI-flavored memo on the storefront db (payments = settlement legs, method card/wire = the two rails): the rails desk wants the settlement stack at close — legs, distinct billings touched and settled dollars per rail, plus a TOTAL banner row to cross-foot against the cash book before the pack ships. Probed facts: card cleared **16 legs / 37364.00**, wire **11 / 32248.00**, and the TOTAL row reads **27 legs / 69612.00** — tying the cash book's debit fold line for line. The squeeze: 27 legs fold onto only 22 billings, because five billings rode split plans that cross rails. *The banner must mean the whole feed, folded the same way as the rails beneath it.*",
      ask: "Return the stack: rail, settlement legs, billings touched, settled dollars (2dp) — plus a TOTAL banner row cross-footing the book, biggest dollars first.",
      template:
        "SELECT p.{1} AS rail,\n       COUNT(*) AS settlement_legs,\n       COUNT(DISTINCT p.invoice_id) AS billings_touched,\n       ROUND(SUM(p.{2}) / {3}, 2) AS dollars\nFROM payments p\nGROUP BY rail\n\nUNION ALL\n\nSELECT '{4}',\n       COUNT(*),\n       COUNT(DISTINCT invoice_id),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY dollars {5};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail grouping key",
          why: "p.method is the rail — card and wire, the two settlement paths the census names. Grouping on paid_on re-folds the book per settlement date and on invoice_id per billing: the two-rail census shreds into a calendar or a billing list.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the settled-money column",
          why: "Settled dollars are the legs' own amounts — SUM(p.amount_cents), integer cents. SUM(p.id) sums primary keys and SUM(p.paid_on) sums date strings (the probe prints 323.87 — sixteen years divided by a hundred) — neither is money.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "The dollar read is amount_cents / 100.0 — float division, rounded once. The rails carry odd-cent legs (2361.50 on card, 2229.50 on wire), so an integer-100 read truncates them until the cross-foot misses the cash book's 69612.00 by half-dollars.",
        },
        {
          answer: "TOTAL",
          kind: "keyword",
          label: "the banner literal",
          why: "The UNION ALL banner row must label itself TOTAL — the row the close cross-foots against the cash book. Any other literal plants a mystery line at total grain (a 'card' banner would sit beside the real card rail at 27 legs / 69612.00, and the stack lies by structure).",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first order",
          why: "ORDER BY dollars DESC puts the TOTAL banner on top with the rails beneath by size — banner, then card 37364.00, then wire 32248.00. ASC reads the stack upside-down: the rails first, the cross-foot buried at the bottom where nobody checks it.",
        },
      ],
      distractors: ["invoice_id", "paid_on", "1000", "ASC"],
      walkthrough:
        "A rail audit stack is two folds of the same feed at two grains, stacked by UNION ALL. The upper SELECT folds legs per method: card 16 legs / 16 billings / 37364.00, wire 11 / 11 / 32248.00 — per-rail billing counts look clean because the five split billings each ride one leg per rail; the lower SELECT folds the whole feed and labels itself TOTAL: 27 legs, 22 billings, 69612.00. The squeeze — five more legs than billings — is visible only at total grain, and it is the cross-rail split story the rails desk lives in. The cross-foot is the point: 37364.00 + 32248.00 = 69612.00, tying the cash book's debit fold line for line, with ROUND(.../100.0, 2) converting cents exactly once at the edge. UNION ALL, not UNION — the rows are distinct anyway and nothing needs deduping. The distractors fail honestly: 'invoice_id' or 'paid_on' in the rail slot shreds the census into 22 billing rows or a per-day calendar; the wrong divisor truncates the odd-cent legs (2361.50, 2229.50) until the cross-foot misses; a relabeled banner breaks the TOTAL contract; ASC buries the banner. The habit being graded: a grand-total row is a definition — same feed, same fold, said out loud.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "T+2-style aging buckets over unsettled items: the no-leg watch (6 billings / 15217.00) aged against flat 30-day terms — the circle collections ladder in textbook shape." },
    { slug: "journal-gap-detection", why: "Sequence gaps in a journal: the ledger's 80 entries audited for missing post dates — the branch-audit control that catches a feed that dropped a day." },
    { slug: "delinquency-roll-rates", why: "State-to-state roll rates: how billings move open-to-partial-to-settled between cycles — the movement read behind the coverage census." },
    { slug: "expected-credit-loss", why: "Weighted provision folds over exposure bands: probability-weighted dollars on the receivables book — the provision read behind the watch." },
    { slug: "loan-amortization-schedule", why: "EMI recursion over a payment spine: the retail loan schedule the branch desk rebuilds every disbursement — payments, interest split, balance walk." },
    { slug: "credit-utilization-bands", why: "Card utilization bands: the card-portfolio health read — utilization buckets the cards desk watches before limits move." },
    { slug: "structuring-detection", why: "Threshold-hugging HAVING guards: the rails desk's screen for value parked just under reporting lines — settlement hygiene at flow scale." },
    { slug: "circular-transfers", why: "Round-trip pair screens: value that leaves a household and returns — the wire-rail hygiene screen for round-tripped flow." },
    { slug: "wash-trade-detection", why: "Mirror-leg detection: split-plan legs that mirror each other across rails — the cross-rail screen the 27-into-22 squeeze teaches." },
    { slug: "prepayment-detection", why: "Early-settlement flags against a schedule: billings settled before day 30 of flat terms — the 13-day fastest settlement found mechanically." },
    { slug: "second-most-recent-activity", why: "Argmax with rank: each household's second-latest fee event — the relationship manager's lapsed-cycle screen, windows drilled properly." },
    { slug: "daily-balance-interest", why: "Day-weighted balance math on a date spine: interest over the cash book — where the 69612.00 fold earns its keep." },
    { slug: "fx-exposure-report", why: "Latest-rate joins normalizing currencies: the international circle's read, where branch books must land in one reporting currency." },
    { slug: "risk-based-pricing", why: "Band joins between exposure and price tables: card pricing that steps by band — the billing-cycle engine as a join problem." },
    { slug: "split-adjusted-position", why: "One economic event, several recorded legs: the split-plan billing read in miniature — normalize before you sum." },
    { slug: "portfolio-concentration-hhi", why: "Concentration indices over the book: the 63.5% of value the top households carry, computed the way the risk review quotes it." },
  ],
};
