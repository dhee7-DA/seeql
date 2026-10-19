// Lloyds Bank — Wave-9 (Task 98-lloyds), banking domain, 0 tagged LC — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12). Standard wave-8 volume.
// The UK's biggest retail bank: the black-horse high-street network, the current
// accounts & mortgages engine (Halifax / Bank of Scotland siblings), and the
// group-wide story of a digital-first pivot — branch closures, app-first money,
// PPI legacy resolved, motor-finance review era, cost programs. Distinct from
// barclays (the UK sibling but IB-heavy) and santander (multi-country): THIS kit
// is the single-market domestic retail read.
// Storefront db mapping (banking-honest, kept consistent across every section):
//   customers = personal-banking customers (region = the four UK franchise
//     clusters carried as the db's EU/APAC/US/LATAM codes — EU the England &
//     Wales heartland, APAC Scotland, US the dense metro cluster, LATAM the thin
//     offshore/Channel-Islands pilot book),
//   orders = transactions (REAL dollars — delivered = settled clean 52, shipped =
//     captured-and-settling 30 with shipped_at as the settlement stamp, pending =
//     awaiting capture 14, cancelled = declined/reversed 7),
//   order_items = itemized lines, products = the product shelf (current accounts,
//     mortgages, savings, cards across the seven family codes; max shelf price
//     199.99 — the premium band is empty and the kit says so),
//   suppliers = six mortgage-intermediary & processing partners (sandbox names),
//   invoices = statement cycles (28; INTEGER pence — the dollar read is always
//     amount_cents / 100.0), payments = payment rails (card = the instant
//     Faster-Payments-style rail, wire = the direct-debit/Bacs-style rail),
//   expenses = opex (the branch network), ledger_entries = the GL.
// Pool provenance: company-pools.md carries NO Lloyds section (0 tagged rows) —
// all 10 topic slug sets and all 16 problems are theme-curated from the theme
// menu's sql rows (no w*/d*/f* rows) and say so.
// Case figures: scripts/company-facts.md only, probe-verified cell-for-cell by
// scripts/tmp-probe-98-lloyds.ts (deleted after use); every slot mechanically
// audited by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: lloyds is NOT yet in registry
// COMPANY_META — wire id "lloyds", domainId "banking", name "Lloyds Bank",
// tagline "UK retail banking at mass scale: mortgages, apps, branch economics",
// accent "text-emerald-300" (unused by all 17 banking siblings).

import type { CompanyKit } from "../types";

export const lloydsKit: CompanyKit = {
  id: "lloyds",
  domainId: "banking",
  name: "Lloyds Bank",
  tagline: "UK retail banking at mass scale: mortgages, apps, branch economics",
  accent: "text-emerald-300",

  brief: [
    "**Lloyds Bank** is the UK's biggest retail bank — the black horse on the high street, the current-accounts-and-mortgages engine that also runs {sky:Halifax} and Bank of Scotland, and a franchise several years into a {emerald:digital-first} pivot that has closed branches and moved everyday money into the app. This kit reads the storefront db as that domestic retail book: 16 customers across the four region clusters, 103 transactions worth **34833.28** (avg 338.19, spread 25.47 to 1088.44), and 251 itemized lines behind them. The status map is fixed and every read hangs off it: delivered = settled clean (52, 50.5%), shipped = captured-and-settling with shipped_at as the settlement stamp (30), pending = awaiting capture (14), cancelled = {rose:declined or reversed} (7, 6.8%). A transaction placed is not a transaction kept — the decline share differs by region, and the denominator question is the interview.",
    "The money sits one layer down, in INTEGER pence — the dollar read is always `amount_cents / 100.0`. Invoices are the 28 statement cycles the retail book bills on (21 paid exact for 66443.00, 6 open at 19609.00, 1 void at 925.00); payments clear them on two rails — {amber:card}, the instant Faster-Payments-style rail (16 legs / 37364.00), and {violet:wire}, the direct-debit/Bacs-style rail (11 / 32248.00) — and the two mixtures must tie to the cash book. Expenses are the branch-network cost lines the Group's cost programs argue about (Rent at 14 flat 1200.00 lease lines), and ledger_entries is the double-entry book of record: **181080.00 debits against 181080.00 credits, delta 0** across 80 entries. The house rule: *a status column claims, a rail leg proves* — settlement evidence beats labels, which is the data-quality culture the motor-finance review era hardened.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain census** — EU runs 45 transactions from just 8 customers (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a declined transaction count in your base?'*), then into the relationship ladder where four customers sit tied at 4 transactions and rank semantics become a business decision. The settlement clock is the favourite timestamp probe: **82 of 103** rows carry the stamp, averaging **2.98 days** in a 2–4 day spread, and the 21 unstamped rows are *a population definition, not a cleanup job*. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries **no Lloyds section** — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: status-aware settlement counts, two-grain censuses, honest-denominator rates, CASE banding, the 14-month transaction spine and the cents-safe billing layer. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {amber:branch cost footing} the Group cost program opens with, the {rose:no-evidence watchlist} the review era runs at every close, the premier ladder with its four-way tie, the settlement-stage month grid, the cluster settlement clock, and the one-pass close census. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 and every money fold tie back to the GL by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the proof, not the dashboard. A retail-banking analyst opens the morning pack: the ledger tie-out must read **181080.00 against 181080.00, delta 0** across the 80 GL entries, then the one-pass status census — 52 settled clean + 30 settling + 14 awaiting + 7 declined = **103 by construction**; a branch that fails that identity is *the day's first incident*, not a rounding note. The rail census follows — {amber:card} 16 legs / 37364.00, wire 11 / 32248.00 — cross-footed against the cash book, and if the 2.98-day settlement clock drifts off its 2–4 band, the ops queue gets pulled before the regional call.",
    "**11:30 —** Midday is the deep-dive block. The cost pack refreshes first: the branch-network fold reads {rose:Rent} at 14 flat 1200.00 lines, Ads at 14 / 4570.00, and the month buckets that peak at **3210.00** in 2024-08 — the read the Group cost program actually argues with. Then the concentration cut for the relationship team: **63.5%** of the book sits with customers whose lifetime spend crosses 3,000 (71.2% above 2,000), and the ladder above the four-way tie at 4 transactions gets its rank policy re-stated. Each ask is a join, a conditional aggregate and one judgment call about statuses — *the analyst writes the query twice: once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts to the close. The no-evidence watchlist refreshes before a single dunning letter goes out: **6 statement cycles worth 15217.00** with zero rail legs — including cycle #28, status {rose:paid} at 1756.00 with nothing behind it, the claim-without-evidence row the review era taught everyone to hunt. The coverage census ships beside it — **21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none** — with its denominator on the slide, because *a coverage number without its population is a rumor*. The day ends the way every close does: the ledger proof, the watchlist, the definitions — or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Transaction book", what: "Value and count of customer transactions: 103 worth 34833.28, average 338.19 against a 25.47 to 1088.44 spread. The headline every retail read starts from — and the spread IS the tiering story." },
    { name: "Settlement status mix", what: "Delivered = settled clean (52, 50.5%), shipped = captured-and-settling (30, 29.1%), pending = awaiting capture (14, 13.6%), cancelled = declined/reversed (7, 6.8%). Four branches that must reconcile to 103 by construction." },
    { name: "Settlement clock", what: "created_at to shipped_at over the 82 stamped transactions: 2.98-day average, range 2 to 4. The population ships with the number — the 21 unstamped rows have no cycle yet and must not dilute it." },
    { name: "Decline share by region", what: "Declined/reversed transactions ÷ ALL placed in the region: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0%. The denominator is placements — the first thing any interviewer checks." },
    { name: "Statement-cycle book", what: "28 cycles billed on flat 30-day terms: 21 paid exact for 66443.00, 6 open at 19609.00, 1 void at 925.00. Coverage reads 21 exact / 1 partial (4000.00 of 6148.00) / 6 none (15217.00)." },
    { name: "Rail mix", what: "Settlement legs per rail — card (instant Faster-Payments-style) 16 legs / 37364.00, wire (direct-debit/Bacs-style) 11 / 32248.00. 27 legs covering 22 distinct cycles: five cycles ride two legs each." },
    { name: "Branch cost lines", what: "Opex by category: Rent 14 entries / 16800.00 (flat 1200.00 lease lines), Ads 14 / 4570.00, Travel 3 / 2521.00, Tools 5 / 1525.00 — monthly buckets peaking at 3210.00 in 2024-08. The cost program's home read." },
    { name: "Ledger proof delta", what: "Total debits minus total credits across the 80-entry GL: 181080.00 against 181080.00, delta 0. Cash runs 69612.00 in / 25416.00 out; a nonzero delta pages the close, not a footnote." },
  ],

  topics: [
    {
      name: "Status-aware settlement counts",
      why: "Every retail read at Lloyds starts from the status map — settled clean, settling, awaiting capture, declined/reversed — and each stage is a conditional count over a status or timestamp. The trap is calling a settling transaction 'settled': 30 versus 52 on this book, and the whole kept-value story moves.",
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "percentage-of-users-attended-a-contest", "prepayment-detection"],
    },
    {
      name: "Two-grain customer censuses",
      why: "Transactions and customers are different grains of the same join, and every regional census here reports both: EU runs 45 transactions from 8 customers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Joining the shelf to the book",
      why: "Product-level reporting means attaching shelf attributes — the current accounts, mortgages, savings and cards families — to every transaction line through joins that can be missing or stale. Lloyds' follow-up is always about what survives: does a line whose product row went missing still count in the family fold?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier", "point-in-time-asof"],
    },
    {
      name: "Intermediary folds & concentration",
      why: "The mortgage story is an intermediary story: six partner firms carry the shelf, and concentration reads (63.5% of the book from 3,000-plus customers) decide where the relationship teams go. GROUP BY folds with HAVING gates and per-partner totals are the exact drills.",
      slugs: ["product-sales-analysis-ii", "top-earners", "classes-more-than-5-students"],
    },
    {
      name: "Ranking the relationship ladder",
      why: "Ladders are rank-window reporting where ties are guaranteed — four customers sit at 4 transactions on this book, right under the 24/17/14/13/5 run of the heavy Relationships. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer customers, not syntax.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries", "chargeback-rate-ranking"],
    },
    {
      name: "Anti-joins & missing evidence",
      why: "The review era's core skill: find the rows with NO evidence behind them. Cycles with no rail leg, customers with no transactions (this db's confident zero — proving it is part of the job), partners with no activity. The LEFT JOIN + IS NULL shape and its NOT EXISTS twin are the watchlist's grammar.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "employees-with-missing-information", "settlement-fails-aging", "suspicious-bank-account-transactions"],
    },
    {
      name: "Rates with honest denominators",
      why: "Decline shares, settlement percentages, adoption rates — the retail ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price", "risk-based-pricing"],
    },
    {
      name: "CASE banding & risk tiers",
      why: "Retail banking bands everything — ticket-size tiers, risk buckets, premier-versus-standard treatment — and each band is a CASE arm with fixed, published edges. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk report, and a reordered WHEN quietly re-bands the book.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "triangle-judgement", "delinquency-buckets", "credit-utilization-bands", "structuring-detection"],
    },
    {
      name: "Month spines & date math",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the trend read's home turf: month buckets via STRFTIME or SUBSTR, half-open windows that never drop month-end traffic, and julianday clocks rounded once. Settlement latency, not terms, is where the interesting date math lives here.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "rising-temperature", "vintage-default-curves", "daily-balance-interest"],
    },
    {
      name: "Cents discipline & the GL",
      why: "Retail is a cents game: cycles, rails and opex carry INTEGER pence, so every dollar read is amount_cents / 100.0 and the missing .0 is how a 1200.00 lease line prints as 12. The GL proof — 181080.00 against 181080.00, delta 0 — is the close's final gate, and reconciliation reads are the closest thing this kit has to a finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "npv-queries", "ar-aging-schedule", "account-balance", "balance-rollforward", "gl-reconciliation", "journal-gap-detection"],
    },
  ],

  theory: [
    {
      id: "lloyds-t1",
      q: "You report statement cycles with their settlement legs — LEFT JOIN or INNER JOIN, and what breaks if you then filter a payments column in WHERE?",
      a: "Decide from the survival rule the question implies. A settled-value report joins cycles to their rail legs: a leg with no cycle is corruption, so INNER is honest — and worth a data-quality flag, not a silent inner join. The watchlist report must be LEFT from invoices: the cycles with no rail leg ARE the answer, arriving with NULL leg columns — on this db that is 6 cycles worth 15217.00, one of which claims paid status with zero legs. The classic break: filtering p.method = 'card' in WHERE after the LEFT JOIN kills every NULL-payload cycle row — the LEFT quietly became an INNER and the uncollected exposure vanished from the very report that exists to show it. The fix is moving the predicate into ON, or accepting inner semantics deliberately and saying so. 'LEFT JOIN is safer' is the wrong answer; join type is a decision about who survives, and at a retail bank the unmatched side is where the review-era exposure lives.",
      tag: "joins",
    },
    {
      id: "lloyds-t2",
      q: "The relationship ladder ranks customers by transaction count, and four customers tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this book the ladder above the tie runs 24, 17, 14, 13, 5 transactions, then four customers tied at 4: RANK gives them the same rung and skips — the tie consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — 6, 6, 6, 6, then 7. ROW_NUMBER splits the tie arbitrarily, a silent judgment about which relationship manager's book looks bigger. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer customers (RANK or DENSE_RANK), or an explicitly named tie-breaker such as lifetime spend, then customer id, written into the query comment. Premier letters go out by ladder position: the semantics ARE the treatment.",
      tag: "windows",
    },
    {
      id: "lloyds-t3",
      q: "The region census shows EU 45 transactions from 8 customers and the US 19 from 2. Why do the columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts transaction rows after the join — one row per transaction, so a customer with 24 transactions contributes 24. COUNT(DISTINCT customer_id) folds repeats back to people — EU's 45 collapse to 8 customers. Neither is wrong: transactions measure load on the rails and the branch network, customers measure the installed base, and the ratio between them is the intensity signal the retail bank actually manages — 5.6 transactions per EU customer versus 9.5 in the US, which says the US book is thin and concentrated while EU's is broad. The trap that catches candidates is a third grain: join order_items for the itemized lines and COUNT(*) silently counts lines, not transactions — 251 of them. Saying 'one row per what?' for every COUNT in the query is the habit the panel grades; on a 16-customer book the two grains diverge fast.",
      tag: "aggregation",
    },
    {
      id: "lloyds-t4",
      q: "shipped_at is NULL until a transaction settles. What is your policy for the settlement-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only settled and settling transactions carry a stamp, so the clock measures creation-to-settlement for the 82 of 103 rows that have one — averaging 2.98 days, range 2 to 4 — and the population ships in the report title. Then mechanics: AVG ignores NULLs, so AVG over ALL transactions returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name, and the reason the WHERE shipped_at IS NOT NULL line exists even when the printed number does not change. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting-capture plus 7 declined-or-reversed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for captures that have not happened. The 21 unstamped rows are a population definition, not a cleanup job.",
      tag: "nulls",
    },
    {
      id: "lloyds-t5",
      q: "The decline-share read needs regional cancelled counts, placed denominators, and a floor of 20 transactions per region. Where does each piece live, and why does the wrong clause either error or lie?",
      a: "Three placements, one pipeline. The decline flag is a row-level fact — CASE WHEN status = 'cancelled' folds to 1/0 inside the aggregate, in SELECT, after WHERE has already chosen the population. The share needs both sides in one fold: 100.0 * SUM(flag) / COUNT(*) GROUP BY region — filter the declined rows out in WHERE and the denominator stops counting placements, turning the share into nonsense. The 100.0 sits before the division so the arithmetic is real before truncation; EU reads 6.7, not 6. The twenty-transaction floor is a group-level fact — HAVING COUNT(*) >= 20 after GROUP BY; placing it in WHERE errors because COUNT does not exist before groups form, and on this book the floor keeps exactly EU (45) and APAC (37). The order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia; it is the difference between a share and an error. Place every piece by asking: is this a fact about one transaction, or about a region?",
      tag: "pipeline",
    },
    {
      id: "lloyds-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full book it is theoretical — 103 transactions always produce the 338.19 mean — but on staging tables filtered to one region, one month or one status, the empty-inner bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin — compare each transaction to ITS region's average — re-runs per outer row and answers a different question: 'above my cluster's average' is a US story (383.48 average against 313.66 in APAC) that the platform mean would miss entirely. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "lloyds-t7",
      q: "Statement cycles bill on flat 30-day terms and transactions arrive with TEXT timestamps. How do you bucket by month, measure the settlement clock, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month buckets every trend read hangs on; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction. The clock: JULIANDAY(shipped_at) - JULIANDAY(created_at) returns fractional days — this book's 2.98-day average is exactly that, rounded once at the end, never per row. Windows: half-open intervals — created_at >= '2025-01-01' AND < '2025-02-01' — because BETWEEN on the last day silently drops month-end traffic, which is precisely when retail money moves. The LAG: on a month-ordered spine the first row's prior value is NULL — the baseline, reported as NULL or labelled, never coalesced to zero, which would read as a flat month. Terms are fixed 30 days on every cycle here, so a due-date fold has no tenor variance to debug — the interesting latency is settlement, not terms.",
      tag: "dates",
    },
    {
      id: "lloyds-t8",
      q: "Finance says a statement cycle is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break.",
      a: "First the anti-join: invoices LEFT JOIN payments, grouped per cycle, keeping the zero-leg rows — on this db that returns 6 cycles worth 15217.00, and one of them (#28, 1756.00) is marked paid with zero legs: a status that lies. The mirror image sits on the other side — void cycle #11 carries a 925.00 leg, a void that settled — which is why the coverage census, not the status column, is the ledger of record: 21 exact for 65612.00, 1 partial (4000.00 of 6148.00), 6 none. Both error modes reconcile to row-level evidence, not to vibes. The money rule: cycles and rails carry INTEGER pence, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats pence on every odd-cent row. And the close ships only when the GL proof lands: 181080.00 debits against 181080.00 credits across 80 entries, delta 0. A nonzero delta pages the close; a status mismatch gets a ticket and a row-level query.",
      tag: "quality",
    },
    {
      id: "lloyds-t9",
      q: "The ops pack wants a rolling average of ticket size across the settlement stream. How do you build the frame, and where do ROWS and RANGE disagree?",
      a: "AVG(total) OVER (ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) averages the previous six rows plus the current one. The expert detail is the frame keyword: ROWS counts physical rows, RANGE counts peers of the ORDER BY value — and on a 103-transaction book with same-day clusters, RANGE sweeps in every transaction sharing those dates, so the window's row count jumps on busy days. If the axis should be calendar-true ('the previous 7 days'), use a RANGE frame on a date value or join to a date spine; if it should be rows-true, ROWS with the tie behavior stated in the comment. On this book the two frames genuinely disagree — which is exactly why the pack footnotes which one it uses.",
      tag: "windows",
    },
    {
      id: "lloyds-t10",
      q: "UNION versus UNION ALL — when does the dedupe silently cost you a month, and what shape rule do the arms obey?",
      a: "UNION ALL concatenates; UNION dedups whole rows across branches. The failure is silent: two branches that emit byte-identical rows — same month, same counts, no status label — collapse into one, and a monthly packet loses a row with no error anywhere. The house rule is UNION ALL plus a comment stating why duplicates are impossible. The arms must match in column count and type family; SQLite rejects mismatches at prepare time rather than padding. INTERSECT answers shared membership — the five cycles (1, 5, 12, 19, 22) settled on both rails; EXCEPT is set subtraction — months that booked volume but logged no decline. And as sets they collapse duplicates within each arm: these are set operations, not bags.",
      tag: "setops",
    },
    {
      id: "lloyds-t11",
      q: "A banding report must print every ticket-size band — including the empty ones. How do you zero-fill honestly?",
      a: "A report that omits empty buckets lies by omission. Three tools: build the band dimension (a VALUES list or a recursive CTE), LEFT JOIN the facts onto it and COALESCE the counts to 0; run the conditional-count fold so every group's row exists with zeros in the empty arms — the one-pass census pattern, where LATAM's declined arm prints 0 rather than a missing row; or UNION ALL literal zero-buckets onto the observed groups. What not to do: filter first and let GROUP BY decide what survives — April through June logged no declined transactions, and a decline report that drops those months reads as a clean quarter instead of a quiet one.",
      tag: "groupby",
    },
    {
      id: "lloyds-t12",
      q: "Above-average tickets — derived table, correlated subquery or window function. Which do you reach for, and what does each actually answer?",
      a: "All three answer it differently. The correlated form — total > the average of MY cluster — re-runs per outer row: correct but expensive, and it answers 'above my cluster's mean', which is a US story (383.48) not a book story (338.19). The derived-table form stages per-cluster means once and joins back: the set-based workhorse, one pass, readable. The window form — AVG(total) OVER (PARTITION BY region) — carries the partition mean on every row without collapsing grain, and the outer query stages it in a CTE because WHERE runs before windows. Name the population out loud: above the BOOK mean keeps a different set than above the CLUSTER mean, and the follow-up is always which one the memo meant.",
      tag: "subqueries",
    },
    {
      id: "lloyds-t13",
      q: "You suspect duplicate rail legs. Why does the pair-hunting self-join need a.id < b.id, and what legitimate shape must it not drown in?",
      a: "A self-join on the business key pairs every row with itself — a.amount = b.amount is true when a IS b — and the unordered join emits both (a,b) and (b,a), double-counting every genuine pair. a.id < b.id fixes both failure modes at once: no self-pairs, one canonical orientation per pair. On this book the legitimate multi-leg shape is real: five cycles settle across two legs by design, so the screen hunts ILLEGITIMATE pairs — same cycle, same amount, same rail, days apart — without flagging sanctioned splits. The strong answer names both exclusions (self-pairing and mirror-pairing) and states what the surviving pairs will be investigated as.",
      tag: "joins",
    },
    {
      id: "lloyds-t14",
      q: "The staging dunning list uses NOT IN (SELECT invoice_id FROM payments) and returns zero rows. What replaced it, and why?",
      a: "NOT IN is UNKNOWN-poisoned the moment the subquery yields a NULL: every outer comparison becomes UNKNOWN and the list empties with no error. The review-era habit is NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — an existence probe that short-circuits on the first match and never trips on NULLs. On the clean core db both return the same six cycles worth 15217.00; in staging, where NULLs are a WHEN not an IF, only one of them is trustworthy. Say the trade out loud: NOT IN reads nicely for small static lists; for correlated existence tests against columns that can carry NULLs, NOT EXISTS is the defensible shape — and that is exactly the shape the no-evidence watchlist ships as.",
      tag: "nulls",
    },
    {
      id: "lloyds-t15",
      q: "The settlement clock: julianday diffs, NULL stamps, and the population discipline that keeps the 2.98 honest. Walk me through it.",
      a: "JULIANDAY(shipped_at) − JULIANDAY(created_at) is fractional days by contract — the 2.98-day average over the 82 stamped transactions is exactly that, rounded once at display, never per row. The stamps are NULL until capture starts, so the population is WHERE shipped_at IS NOT NULL, stated in the report even though AVG's NULL-skip would print the same number — an unnamed 82-row population is exactly the silent-shrink failure the NULL policy exists to prevent. The 21 unstamped rows (14 awaiting capture, 7 declined) are a population definition, not a cleanup job, and IFNULL-ing them to zero invents same-day settlements for captures that have not happened. Range and average ship together: 2 to 4 days, 2.93 in the APAC cluster to 3.5 offshore.",
      tag: "dates",
    },
    {
      id: "lloyds-t16",
      q: "Customer names arrive as 'acme corp', 'Acme Corp' and 'ACME CORP'. What breaks downstream, and what is the hygiene pass?",
      a: "The GROUP BY fold sees three customers where the book has one — every per-customer census, ladder rank and concentration read doubles or splits silently, and no error ever fires. The hygiene pass runs before the join and fold keys are built: TRIM the padding, UPPER (or INITCAP) to one canonical case, and strip honorific noise with REPLACE where the feed carries it. Better still, normalize once into a clean dimension and join on the canonical key, so the fix lives in one place instead of every query. The interview point: string hygiene is not cosmetics, it is join-key integrity — the discipline that keeps a 16-customer book from reading as twenty and a premier list from missing its own members.",
      tag: "strings",
    },
    {
      id: "lloyds-t17",
      q: "NTILE, PERCENT_RANK and the quartile cut — how do you tier the transaction book defensibly?",
      a: "NTILE(4) OVER (ORDER BY total) distributes 103 transactions as evenly as possible: 26, 26, 26, 25 — the earlier buckets absorb the remainder, and the biggest ticket (1,088.44) lands in quartile 4 alongside everything from 507.24 up. PERCENT_RANK gives each row its 0-to-1 position, the right tool when band edges must survive a row-count change — a quartile of a 103-row book and of a 16-row book are different animals. The traps: assuming NTILE splits evenly (103 does not divide by 4), and quoting a 'top-quartile cutoff' without stating the ORDER BY and tie policy — ties at a bucket edge land deterministically only when the sort is fully specified. Premier banding is a published edge list, not a mood.",
      tag: "windows",
    },
    {
      id: "lloyds-t18",
      q: "The close census must count all four settlement stages in one pass and reconcile to 103 by construction. How?",
      a: "One scan, four conditional arms: COUNT(*) FILTER (WHERE status = 'delivered') — or its pre-3.30 twin SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — for settled clean (52), settling (30), awaiting (14) and declined (7), beside COUNT(*) for placed (103). The reconciliation IS the deliverable: 52+30+14+7 = 103, and a branch that fails the identity is the day's first incident, not a rounding note. Four sequential queries can each be individually right and still disagree — different run times, different WHERE drift; one pass cannot. Know the FILTER idiom and its SUM(CASE) twin, because the fleet runs both engines, and the census must reconcile on either.",
      tag: "aggregation",
    },
    {
      id: "lloyds-t19",
      q: "'The biggest ticket in each cluster' — what is wrong with ORDER BY total DESC LIMIT 1 per cluster, and what is the defensible shape?",
      a: "LIMIT 1 resolves ties by whatever order the plan stumbles into — two runs, two winners, no error — and at book scale ties are guaranteed. The defensible argmax is ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC, created_at, id) = 1: the partition scopes the competition, the ORDER BY names the primary rule, and the trailing tie-breakers make the winner reproducible. The policy is reviewable — swapping created_at for lifetime spend changes a business decision, which is exactly why it lives in the SQL where the reviewer can read it. Say it out loud: argmax is a decision, decisions need tie policies, and 'the planner's mood' is not a policy.",
      tag: "windows",
    },
    {
      id: "lloyds-t20",
      q: "The monthly cost pack filters opex with SUBSTR(spent_on, 1, 7) = '2024-08' and the index on spent_on never engages. Diagnose and fix.",
      a: "Sargability: an index serves a predicate on the bare column, not on f(column) — wrapping spent_on in SUBSTR hides it from the planner and forces a scan of every opex line. The fix keeps the column bare and moves the function to the constant side: spent_on >= '2024-08-01' AND spent_on < '2024-09-01' — a half-open range that also keeps August's last evening, which BETWEEN's bare-date upper bound silently drops. EXPLAIN QUERY PLAN is the receipt: SCAN before, SEARCH … USING INDEX after. On 36 opex lines you will never feel the difference; at franchise scale the scan is the monthly pack's outage, and the reviewer asks for the plan, not the result.",
      tag: "indexes",
    },
    {
      id: "lloyds-t21",
      q: "Why does every production ORDER BY in this kit end with a unique key, and what goes wrong without it?",
      a: "Reproducibility is the deliverable: a close pack, a regulator extract or a dunning list must be byte-identical between the analyst's run and the reviewer's. ORDER BY on a non-unique key — month, total, even status — leaves tie blocks to the planner's mood: two runs, two row orders, and the diff review reads a phantom change. The house shape is ORDER BY primary metric, then created_at, then id — the trailing unique key costs nothing and makes every run identical. The same discipline underpins OFFSET pagination, whose page boundaries drift unless the sort is fully deterministic. 'It looked right once' is not an ordering; determinism is a property you build into the query, not observe in one run.",
      tag: "quality",
    },
    {
      id: "lloyds-t22",
      q: "The watchlist's settled column prints NULL for the zero-leg cycles even though the fold is SUM(p.amount_cents). Where does the COALESCE go, and why there?",
      a: "SUM ignores NULL inputs, and a group with no non-NULL input has no sum — SQL returns NULL, not 0 — so the six zero-leg cycles print NULL and the review committee reads 'unknown', not 'zero exposure'. The guard wraps the FOLD, not the rows: COALESCE(SUM(p.amount_cents), 0). Per-row IFNULL(p.amount_cents, 0) happens to work on this watchlist because every leg row is NULL — but it survives only that shape; a partially populated group (one real leg plus NULLs) is where the fold-level wrap proves it is the guard and the row-level sprinkle is decoration. Guard the fold, then the display: that ordering is what keeps the 15217.00 footing intact.",
      tag: "nulls",
    },
    {
      id: "lloyds-t23",
      q: "Walk me through the month-end close ritual on this book — what reconciles before anything ships?",
      a: "Four proofs, in order. The status census: 52 settled + 30 settling + 14 awaiting + 7 declined = 103 by construction — a failed branch is an incident. The rail cross-foot: card 16 legs / 37364.00 plus wire 11 / 32248.00 = 27 legs / 69612.00 against the cash book, with the five split-plan cycles and the two status anomalies (#28 paid with zero legs, #11 void with one) walked line by line. The AR coverage: 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — the dunning denominator on the slide. And the GL: 181080.00 debits against 181080.00 credits across 80 entries, delta 0 — a nonzero delta pages the close. Every number ships with its population, because a coverage figure without its denominator is a rumor.",
      tag: "quality",
    },
    {
      id: "lloyds-t24",
      q: "The decline share moved from 6.7% to 8.1% overnight. Before anyone reacts, what do you check?",
      a: "The definition first. Is the denominator PLACED transactions in the region — the house rule, because only placed transactions can decline — or did someone quietly switch it to kept transactions or the platform-wide base? EU reads 6.7 (3 of 45) and APAC 8.1 (3 of 37): a 'move' can be a population switch, not a risk event. Then the edges: did the month window go half-open to closed so a re-ingested month-end batch double-counts, and did the status vocabulary drift — a new 'reversed' label landing outside the cancelled arm. Definitions are versioned like code here: the analyst answers by pointing at the definition, not by re-running the query. The habit the panel grades is stating the population and the denominator before computing anything.",
      tag: "pipeline",
    },
  ],

  mcqs: [
    {
      id: "lloyds-mcq-1",
      prompt: "A transaction row's status reads 'shipped'. In this kit's settlement map, what happened?",
      choices: [
        "Settled clean — the money is done moving",
        "Captured and settling — the settlement stamp is on it, but it is not clean yet",
        "Declined or reversed by risk controls",
        "Awaiting capture — nothing has moved yet",
      ],
      answer: 1,
      why: "The stage map is fixed: shipped = captured-and-settling (30 of 103 transactions), with shipped_at as the settlement stamp. Settled clean is 'delivered' — 52 rows.",
      notes: [
        { choice: 0, why: "Settled clean is 'delivered' — 52 transactions. Calling the 30 settling rows settled inflates the clean book before settlement finishes." },
        { choice: 3, why: "Awaiting capture is 'pending' — 14 rows with no stamp, no latency, no settlement. Pending is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-2",
      prompt: "EU ran 45 transactions, 3 of them declined or reversed. What is the region's decline share?",
      choices: [
        "3 / 42 — declined over kept = 7.1%",
        "3 / 45 — declined over ALL placed = 6.7%",
        "45 / 3 — placements per decline",
        "3 / 103 — declined over the whole book = 2.9%",
      ],
      answer: 1,
      why: "The house definition: declined ÷ ALL transactions placed in the region. EU reads 6.7 — and the placed denominator is the first thing an interviewer checks.",
      notes: [
        { choice: 0, why: "Dividing by kept demand shrinks the base and inflates the share to 7.1 — the declined rows are exactly the rows that must stay in the denominator." },
        { choice: 3, why: "The platform-wide denominator dilutes a regional read into 2.9. The census is per region — 45 placements, not 103." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-3",
      prompt: "The region census must show transactions AND distinct customers side by side. EU reads 45 transactions from 8 customers. Which column pair does that?",
      choices: [
        "COUNT(*) and COUNT(DISTINCT customer_id)",
        "COUNT(*) and COUNT(customer_id)",
        "SUM(total) and COUNT(*)",
        "COUNT(DISTINCT region) and COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts transaction rows (45); COUNT(DISTINCT customer_id) folds repeats back to customers (8). The gap — 5.6 per customer — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every transaction carries a customer. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts clusters, not customers — a third grain nobody asked for. The census is transactions AND customers." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-4",
      prompt: "Card legs are 16 of the 27 rail legs. Which expression prints the card share, 59.3?",
      choices: [
        "ROUND(100 * 16 / 27, 1)",
        "ROUND(100.0 * 16 / 27, 1)",
        "ROUND(16 / 27, 1) * 100",
        "ROUND(100.0, 1) * 16 / 27",
      ],
      answer: 1,
      why: "100.0 * 16 / 27 promotes to real arithmetic BEFORE the division and rounds once at the end: 59.3. Every other shape truncates or rounds at the wrong stage.",
      notes: [
        { choice: 0, why: "Integer ÷ integer in SQLite truncates: 1600/27 = 59, and the share prints 59.0. The .0 is the whole fix — promote before you divide." },
        { choice: 2, why: "16/27 truncates to 0 before ROUND ever sees it, so the expression prints 0. Scaling after rounding (choice 3's cousin) drifts to 60.0 — both are stage errors." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-5",
      prompt: "The relationship read keeps only customers carrying at least 10 transactions. Where does the threshold live?",
      choices: [
        "WHERE COUNT(*) >= 10, before GROUP BY",
        "GROUP BY customer_id HAVING COUNT(*) >= 10",
        "WHERE transactions >= 10 on the raw table",
        "HAVING COUNT(*) >= 10 placed before GROUP BY",
      ],
      answer: 1,
      why: "A transaction-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this book only the ladder customers — 24, 17, 14, 13 — clear 10.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'transactions' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-6",
      prompt: "The no-evidence watchlist: invoices LEFT JOIN payments, GROUP BY cycle, WHERE pay.id IS NULL. What does it return on this db?",
      choices: [
        "28 cycles — every statement cycle",
        "22 cycles — the ones with a rail leg",
        "6 cycles worth 15217.00 — the ones with no leg at all",
        "1 cycle — the paid-status lie",
      ],
      answer: 2,
      why: "The anti-join keeps the unmatched left rows: 6 cycles / 15217.00 — and one of them, #28, claims 'paid' at 1756.00 with zero legs. 22 is the settled complement.",
      notes: [
        { choice: 1, why: "That's the IS NOT NULL read — the settled side. Flip the predicate and you have shipped the opposite list to the review committee." },
        { choice: 3, why: "#28 is IN the six, not the only one — the other five are open cycles (873.00 to 4937.00). Void #11 is NOT on the list: it actually settled 925.00 on one leg." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-7",
      prompt: "The settlement clock must read 2.98 days over the 82 stamped transactions. Which WHERE clause belongs in the report?",
      choices: [
        "None — AVG skips NULLs anyway, so the number comes out right regardless",
        "WHERE shipped_at IS NOT NULL — the population, stated",
        "WHERE status = 'shipped'",
        "WHERE shipped_at > 0",
      ],
      answer: 1,
      why: "The no-WHERE version prints the same 2.98 over a silently unnamed 82-row population — a real number wearing the wrong name. Stating the population is the review's bar.",
      notes: [
        { choice: 0, why: "The number matches and the report still fails review — an unnamed population is exactly the silent-shrink failure the NULL policy exists to prevent." },
        { choice: 2, why: "status = 'shipped' keeps only the 30 in-flight rows and drops the 52 settled ones — a different cohort and a different clock wearing the same title." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-8",
      prompt: "A staging table's decline list uses customer_id NOT IN (SELECT customer_id FROM transactions WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: [
        "No customer ever transacted — the zero is correct",
        "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties",
        "NOT IN cannot take a subquery; it needs a literal list",
        "The outer query needs DISTINCT before the comparison works",
      ],
      answer: 1,
      why: "x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over an unguarded column.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — the clean core db has no NULL customer_ids. But staging tables are exactly where NULLs sneak in, and empty lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-9",
      prompt: "A month-close stack puts declined transactions under kept transactions in one layout, built with UNION. A reviewer says one month's row vanished. Diagnosis?",
      choices: [
        "UNION ALL is only a performance choice — the results would be identical",
        "The branches forgot the distinguishing column, so two identical rows (same month, same counts) collapsed — UNION dedups whole rows silently",
        "UNION truncates the stack to the first branch's row count",
        "UNION cannot stack two SELECTs over the same table",
      ],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same month, same counts, no status or branch label — collapse into one, and the close loses a month with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On a stack where a legitimate tie exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-10",
      prompt: "Statuses run 52 / 30 / 14 / 7 over 103 transactions. Which expression does NOT return the 7 declined?",
      choices: [
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)",
        "COUNT(*) FILTER (WHERE status = 'cancelled')",
        "COUNT(status = 'cancelled')",
        "AVG(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * COUNT(*)",
      ],
      answer: 2,
      why: "SQLite evaluates status = 'cancelled' to 0/1 per row — and COUNT counts NON-NULL values, so all 103 rows count: it returns 103, not 7. SUM over the flag, the FILTER clause and the AVG-times-COUNT identity all isolate the 1s correctly.",
      notes: [
        { choice: 0, why: "SUM over the 1/0 indicator IS the decline count — the portable conditional-count idiom, and the pre-3.30 replacement for FILTER." },
        { choice: 1, why: "FILTER (WHERE …) is one-pass conditional counting — 7 here, computed in the same scan as its sibling aggregates; the censuses reconcile to 103 by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-11",
      prompt: "Transactions join to itemized lines and the row count fans out from 103 to 251. Which expression still reports 16 — the customer count?",
      choices: ["COUNT(*)", "COUNT(customer_id)", "COUNT(DISTINCT customer_id)", "SUM(customer_id)"],
      answer: 2,
      why: "DISTINCT folds the fan-out back to people: 251 itemized lines collapse to 16 customers. COUNT(*) and COUNT(customer_id) both read 251 — the line grain, not the customer grain — and SUM adds ids, a number with no business meaning.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the joined rows — 251 lines. The join didn't create customers; it created lines, and the census must say which grain it reports." },
        { choice: 1, why: "COUNT(customer_id) skips NULLs but counts repeats — every line carries a customer_id, so it reads 251 too. Without DISTINCT both counts are line-grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-12",
      prompt: "The intermediary report folds each partner's shelf into one cell with `GROUP_CONCAT(p.name)`. A partner lists three SKUs. What comes back?",
      choices: [
        "The first SKU's name only",
        "Three rows, one per SKU",
        "One comma-joined string of all three names, in scan order",
        "A count of 3",
      ],
      answer: 2,
      why: "GROUP_CONCAT folds every value in the group into one string cell — 'Alpha Current Account,Beta Saver,Gamma Card' — one row per partner with the roster inside. The order within the string is scan order, not guaranteed, which is the caveat the report footnotes.",
      notes: [
        { choice: 0, why: "That would be MAX or an arbitrary pick — GROUP_CONCAT carries the WHOLE group. A manifest missing two SKUs understates the intermediary bench." },
        { choice: 3, why: "COUNT returns the 3 — a number, not the names. The whole point of the fold is evidence-per-row: the roster rides with the partner without a second query." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-13",
      prompt: "The void cycle carries 925 INTEGER pence. What do `amount_cents / 100` and `amount_cents / 100.0` print, respectively?",
      choices: ["9.25 and 9.25 — identical", "9 and 9.25 — the integer form truncates the pence", "9 and 9 — both truncate", "925.00 and 925.00 — the division is display-only"],
      answer: 1,
      why: "Integer ÷ integer is integer division in SQLite: 925/100 truncates to 9. The 100.0 promotes the arithmetic to real division and prints 9.25 — which is why the house rule is that every pence read is amount_cents / 100.0, the .0 doing the promotion.",
      notes: [
        { choice: 0, why: "They differ the moment pence are odd — and statement cycles are nothing but odd pence. The missing .0 is the classic 'why is the book short 25p per row' bug." },
        { choice: 2, why: "100.0 makes the divisor REAL, which promotes the whole division — 9.25 exactly. Only the all-integer form truncates." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-14",
      prompt: "`SELECT DISTINCT method FROM payments` runs on this book. What returns?",
      choices: ["27 rows — one per leg", "2 rows — card, wire", "22 rows — one per settled cycle", "1 row — 'payment'"],
      answer: 1,
      why: "DISTINCT collapses the 27 legs to their unique values: the two rails — card (the instant Faster-Payments-style rail, 16 legs) and wire (the direct-debit/Bacs-style rail, 11). 27 would be the raw row count, 22 the settled-cycle count — different grains entirely.",
      notes: [
        { choice: 0, why: "That's the table without DISTINCT. The whole point of DISTINCT is the fold back to vocabulary — and this book's payment vocabulary is two rails long." },
        { choice: 2, why: "22 is COUNT(DISTINCT invoice_id) — the settled-cycle grain. DISTINCT method folds on the method column, not the cycle." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-15",
      prompt: "`SELECT id, total FROM orders LIMIT 5` ships as 'the five most recent transactions'. What is wrong?",
      choices: [
        "Nothing — LIMIT 5 returns the newest rows",
        "It returns an arbitrary five rows — without ORDER BY, LIMIT promises no particular rows",
        "It needs GROUP BY to work over dates",
        "LIMIT 5 is invalid — LIMIT needs an OFFSET",
      ],
      answer: 1,
      why: "LIMIT caps the count; it does not sort. Without ORDER BY created_at DESC the engine hands back whatever rows the plan touches first — 'most recent' is a claim the query never made. The fix is one phrase: ORDER BY created_at DESC before the LIMIT.",
      notes: [
        { choice: 0, why: "The belief ships broken recency rails every week. Newest only if the ORDER BY says so — LIMIT is a ceiling, not a sort." },
        { choice: 3, why: "LIMIT stands alone fine; OFFSET is optional. The missing piece is ordering, not syntax." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-16",
      prompt: "Two settlements sit 36 hours apart. What does `julianday(later) - julianday(earlier)` return?",
      choices: ["36", "1.5", "2", "0.5"],
      answer: 1,
      why: "JULIANDAY returns fractional days — 36 hours is 1.5 of them. On this book the stamps land on whole-day boundaries (the 2–4 day spread), but the function is fractional by contract, which is why the settlement-clock report rounds once at the end and never per row.",
      notes: [
        { choice: 0, why: "36 would be hours — julianday diffs are DAYS, fractional. Reading the diff as hours inflates the clock 24×." },
        { choice: 2, why: "2 is the date-only truncation — it silently invents a 12-hour error per row. Fractional julianday is the honest clock; round once at display." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-17",
      prompt: "A trend read buckets transactions with `STRFTIME('%m', created_at)` and prints 12 buckets for a book spanning 2024-01 to 2025-02. Diagnosis?",
      choices: [
        "The book really has 12 active months",
        "'%m' carries month-only keys — January 2024 and January 2025 merge into one bucket and the trend is fiction",
        "STRFTIME needs a GROUP BY to work",
        "The fix is COUNT(DISTINCT month)",
      ],
      answer: 1,
      why: "'%m' emits '01'…'12' with no year, so the two Januaries fold into one 15-transaction bucket. The spine is '%Y-%m' — 14 buckets on this book — or SUBSTR(created_at, 1, 7) on fixed-width ISO text.",
      notes: [
        { choice: 0, why: "14 months of transactions is a probed fact; a 12-bucket output means two months share a key. A bucket count matching the calendar instead of the data is the collision telling on itself." },
        { choice: 3, why: "COUNT(DISTINCT month) counts the buckets, it doesn't fix the keys. The bug is the format string, not the aggregation." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-18",
      prompt: "The rail audit wants cycles settled on BOTH rails. Which query returns them — and how many cycles is that on this book?",
      choices: [
        "cycles-with-card-legs UNION cycles-with-wire-legs — 27",
        "cycles-with-card-legs INTERSECT cycles-with-wire-legs — 5",
        "cycles-with-card-legs EXCEPT cycles-with-wire-legs — 11",
        "cycles-with-card-legs JOIN cycles-with-wire-legs ON method — 0",
      ],
      answer: 1,
      why: "INTERSECT is shared membership: cycles appearing in both the card-rail set and the wire-rail set — the five split-settled cycles (1, 5, 12, 19, 22), each carrying one leg per rail. UNION would merge the sets (27 legs' worth of cycles), EXCEPT subtracts, and the join-on-method matches nothing — methods never equal each other.",
      notes: [
        { choice: 0, why: "UNION answers 'either rail' — the union of the two sets, not the overlap. The split-plan question is exactly the intersection." },
        { choice: 2, why: "EXCEPT answers 'card-rail only' — the complement of the split plans. Direction matters: swapping the arms flips the audit to wire-only." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-19",
      prompt: "A lapse read runs `SELECT month FROM booked_months EXCEPT SELECT month FROM decline_months`. What comes back, and what shape rule do the arms obey?",
      choices: [
        "Months in both sets; shapes may differ — the engine pads with NULLs",
        "Months in the first set but not the second; both arms must match in column count and type family or the query errors",
        "All months from both sets; shapes must match exactly",
        "Nothing — EXCEPT requires a JOIN",
      ],
      answer: 1,
      why: "EXCEPT is set subtraction — months that booked volume but logged no decline, the quiet-month read. Set operators demand matching shapes (same column count, compatible types); SQLite rejects mismatches at prepare rather than padding. And as sets they collapse duplicates — these are sets, not bags.",
      notes: [
        { choice: 0, why: "That's INTERSECT's answer with fantasy padding. No set operator pads — the shape mismatch is a hard error, which is the friendly failure mode." },
        { choice: 2, why: "That's UNION. Flipping EXCEPT to UNION turns the lapse read into an inventory of every month — a different report wearing the same title." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-20",
      prompt: "The watchlist's settled column prints NULL for the six zero-leg cycles even though the fold is `SUM(p.amount_cents)`. Why, and the fix?",
      choices: [
        "NULL legs count as 0 automatically — the NULL signals a bug elsewhere",
        "SUM over an all-NULL (or empty) group returns NULL — wrap the fold: COALESCE(SUM(p.amount_cents), 0)",
        "The display layer's /100.0 NULLs the column",
        "IFNULL(p.amount_cents, 0) on the raw column fixes the aggregate",
      ],
      answer: 1,
      why: "SUM ignores NULL inputs, and a group with no non-NULL input has no sum — SQL returns NULL, not 0. The fix wraps the FOLD, not the rows: COALESCE(SUM(...), 0) prints the honest 0 the six-cycle watchlist foots with. (Per-row IFNULL happens to work here — every leg row is NULL — but the fold-level wrap is the guard that survives partially-populated groups too.)",
      notes: [
        { choice: 0, why: "NULL is not zero in aggregates — it's absence. A watchlist whose settled column reads NULL reads as 'unknown', and the review committee reads missing data, not zero exposure." },
        { choice: 2, why: "The /100.0 division promotes arithmetic type; it doesn't create NULLs. NULL in, NULL out — the guard belongs at the fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-21",
      prompt: "The cost pack filters opex with `SUBSTR(spent_on, 1, 7) = '2024-08'` and the index on spent_on never engages. Why, and the fix?",
      choices: [
        "SUBSTR returns text the index can't store — switch to date types",
        "The predicate wraps the indexed column in a function, hiding it from the planner — rewrite as a half-open range: spent_on >= '2024-08-01' AND spent_on < '2024-09-01'",
        "The index needs a REBUILD after the month's loads",
        "Text comparisons never use indexes",
      ],
      answer: 1,
      why: "Sargability: an index serves a predicate on the bare column, not f(column). Wrapping spent_on in SUBSTR forces a scan of every opex line. The range rewrite keeps the column bare — and it's half-open, so August's last day survives the filter.",
      notes: [
        { choice: 0, why: "SUBSTR is deterministic on text; the problem is WHERE it sits. Move the function to the constant side and the index works again." },
        { choice: 2, why: "Rebuilds fix bloat, not predicate shapes. On 36 opex lines you'll never feel it — at network scale the scan is the monthly pack's outage." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-22",
      prompt: "Cluster average tickets read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 — their unweighted average is 364.67, but the book average is 338.19. Why?",
      choices: [
        "Rounding drift across four decimals",
        "The average-of-averages weights every cluster equally; the book average weights every transaction — 45 EU tickets versus 2 LATAM ones",
        "The cluster averages should have been DISTINCT",
        "One of the four cluster numbers is wrong",
      ],
      answer: 1,
      why: "A mean of means is the true mean only when every group weighs the same. EU carries 45 transactions, LATAM 2 — the unweighted 364.67 lets a 2-ticket cluster speak as loudly as a 45-ticket one. The book average folds all 103 tickets once: 338.19.",
      notes: [
        { choice: 0, why: "The gap is 26.48 — no rounding artifact. It's a weighting bug, fixed by computing at the transaction grain, not by averaging cluster cells." },
        { choice: 3, why: "Every cluster number is probe-honest. The composite is what lies — which is why the review asks 'average of WHAT?' before quoting any mean." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-23",
      prompt: "Premier banding runs standard / affluent / premier with edges at 1,000 and 3,000 lifetime spend. A teammate reorders the CASE arms — WHEN spend >= 1000 first. What happens to a 4,500 customer?",
      choices: [
        "It stays premier — CASE arms are independent",
        "It falls into whichever arm matches FIRST — the reordered arms mis-band the whole book",
        "The query errors on overlapping ranges",
        "It drops out of every band",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and takes the first match — overlapping edges make arm ORDER part of the business rule. A 4,500 spend hits '>= 1000' immediately and lands in the affluent label, silently re-banding every premier customer. Published edges need ordered, non-overlapping arms (or descending edges with < guards).",
      notes: [
        { choice: 0, why: "Arms are not independent — first match wins and evaluation stops. Overlap plus reordering is how a premier list quietly changes with zero errors." },
        { choice: 2, why: "Overlapping ranges are legal SQL; the engine never checks band logic. The damage is silent by construction — which is why the arms cite the published edge list in a comment." },
      ],
      difficulty: "medium",
    },
    {
      id: "lloyds-mcq-24",
      prompt: "In the one-pass status grid, LATAM's declined arm holds zero transactions. What does `SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)` print for LATAM?",
      choices: ["NULL", "0", "The row is omitted entirely", "It errors on the empty arm"],
      answer: 1,
      why: "The CASE zeroes every non-matching row and SUM adds the flags — zero transactions declined sums to 0, and the LATAM row still appears with its settled 2 and zeros elsewhere. The zero is the grid's honesty: a two-transaction cluster is IN the read, not vanished from it.",
      notes: [
        { choice: 0, why: "SUM over flags never returns NULL while the group has rows — the ELSE 0 arm guarantees a number. NULL would mean the group itself had no rows." },
        { choice: 2, why: "GROUP BY keeps every group the input produces — LATAM has 2 transactions, so its row survives with zeros in the empty arms. Omitting the quiet cluster lies by omission." },
      ],
      difficulty: "easy",
    },
    {
      id: "lloyds-mcq-25",
      prompt: "A trend board writes `SELECT month, LAG(collected) OVER (ORDER BY month) AS prev FROM ... WHERE prev IS NOT NULL`. What happens?",
      choices: [
        "It returns only months that have a predecessor",
        "It errors — window results are computed after WHERE, so the alias is invisible ('misuse of aliased window function')",
        "It silently treats prev as 0 for the first month",
        "It returns every row but with prev NULL everywhere",
      ],
      answer: 1,
      why: "WHERE runs before the window is evaluated — the LAG output doesn't exist when the filter applies, and SQLite says so: 'misuse of aliased window function'. The fix is staging: fold and walk in a CTE, filter in the outer query — the two-step every month-over-month board in this kit uses.",
      notes: [
        { choice: 0, why: "That's the intended semantics, but the engine refuses to deliver it through WHERE. Row-filtering happens before windowing, by contract — the pipeline order IS the error message." },
        { choice: 2, why: "No silent coercion exists — the reference is rejected outright. The error is the friendly version; shipping it silently would be worse." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-26",
      prompt: "A rolling read computes `AVG(total) OVER (ORDER BY created_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. Several transactions share the same created_at day. What changes if ROWS becomes RANGE?",
      choices: [
        "Nothing — ROWS and RANGE are synonyms here",
        "RANGE sweeps in EVERY transaction sharing those dates, not just 2 rows — the window's row count jumps on same-day ties",
        "RANGE reverses the order of the frame",
        "RANGE only works on numeric columns",
      ],
      answer: 1,
      why: "ROWS counts physical rows — exactly 3 in this frame. RANGE counts peers by the ORDER BY value: on a day with five transactions, RANGE sweeps them all in. Same-day ties are guaranteed on a 103-transaction book — 45 EU transactions across 14 months — so the two frames genuinely disagree here.",
      notes: [
        { choice: 0, why: "Synonyms only while the ORDER BY key is unique. Same-day transactions break uniqueness — the exact condition this book guarantees." },
        { choice: 2, why: "Neither frame reverses anything — direction lives in the ORDER BY. The ROWS/RANGE axis is 'which rows count as neighbors', not 'which way the window faces'." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-27",
      prompt: "Two clusters tie on their biggest ticket, and the argmax read is `ORDER BY total DESC LIMIT 1` per cluster. What is the defect?",
      choices: [
        "None — LIMIT 1 is the definition of argmax",
        "LIMIT 1 breaks ties arbitrarily and silently — the defensible argmax names its tie-break (ROW_NUMBER with created_at then id) in the SQL",
        "Argmax requires a correlated subquery",
        "The tie makes the query non-deterministic but harmless",
      ],
      answer: 1,
      why: "Ties are guaranteed at book scale, and LIMIT 1 resolves them by whatever order the plan stumbles into — two runs, two 'winners', no error. The defensible shape is ROW_NUMBER() OVER (PARTITION BY cluster ORDER BY total DESC, created_at, id) with the tiebreak stated, so the winner is reproducible and the tie policy is reviewable.",
      notes: [
        { choice: 0, why: "Argmax is a decision, not a row count — and decisions need tie policies. LIMIT 1 delegates the policy to the query planner's mood." },
        { choice: 3, why: "Non-determinism in a bank's reporting is never harmless — the relationship team acts on 'the biggest customer in the cluster', and a flippy answer costs the argument." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-28",
      prompt: "The ingest feed double-delivers rows. Which expression keeps exactly the freshest transaction per customer?",
      choices: [
        "RANK() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) = 1",
        "MAX(created_at) GROUP BY customer_id",
        "SELECT DISTINCT customer_id FROM orders",
      ],
      answer: 1,
      why: "ROW_NUMBER assigns a strict 1..n inside each customer with a fully-specified order — created_at DESC, id DESC breaks same-timestamp ties deterministically — so rn = 1 is exactly one row per customer. RANK would keep EVERY row tied on the newest timestamp, re-admitting the duplicates it exists to remove.",
      notes: [
        { choice: 0, why: "RANK shares rank 1 among all ties — two same-timestamp transactions both survive. The dedupe needs strict numbering, which is ROW_NUMBER's contract." },
        { choice: 2, why: "MAX finds the newest timestamp but the query still returns every row carrying it — the filter needs HAVING or a join back, and the tie policy is still unnamed." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-29",
      prompt: "The audit hunts duplicate payment legs: same cycle, same amount, same rail, days apart. The shape self-joins payments a to payments b. Why does it need `a.id < b.id`?",
      choices: [
        "To sort the pairs by id",
        "Without it every row pairs with itself, and each true pair appears twice — once as (a,b), once as (b,a)",
        "Because ids are never equal across cycles",
        "It doesn't — the amount equality already excludes self-pairs",
      ],
      answer: 1,
      why: "a.amount = b.amount is true when a IS b — every row pairs with itself. And the unordered join emits both (a,b) and (b,a), double-counting every genuine pair. a.id < b.id fixes both at once: no self-pairs, one canonical orientation per pair. On this book the five dual-rail cycles are the legitimate multi-leg shape — the screen is about hunting ILLEGITIMATE pairs without drowning in legitimate ones.",
      notes: [
        { choice: 0, why: "Sorting is ORDER BY's job. The inequality is about which pairs exist, not their presentation." },
        { choice: 3, why: "Amount equality is TRUE for a row against itself — self-pairing is the default, not the exception. The inequality is the fix, not decoration." },
      ],
      difficulty: "hard",
    },
    {
      id: "lloyds-mcq-30",
      prompt: "`NTILE(4) OVER (ORDER BY total)` buckets the 103-ticket book. How do the quartiles split, and where does the 1,088.44 ticket land?",
      choices: [
        "26 / 26 / 26 / 25 — the biggest ticket sits in quartile 4 (507.24–1,088.44)",
        "25 / 26 / 26 / 26 — remainder goes to the last bucket",
        "34 / 34 / 35 — NTILE(4) merges small buckets",
        "26 / 26 / 26 / 26 — NTILE always splits evenly",
      ],
      answer: 0,
      why: "NTILE distributes as evenly as possible: 103 = 3 × 26 + 25, and the earlier buckets absorb the remainder — 26, 26, 26, 25. The 1,088.44 maximum is the last row of the ORDER BY, so it lands in quartile 4 alongside everything from 507.24 up.",
      notes: [
        { choice: 1, why: "Backwards — NTILE fills front-to-back with the larger counts first, so the tail bucket is the short one. Getting the remainder direction wrong skews every 'top-quartile' cutoff." },
        { choice: 3, why: "103 doesn't divide by 4. NTILE never drops rows to force even buckets — it spreads the remainder across the earliest groups." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-lloyds-1",
      tier: "easy",
      topic: "x3",
      universe: "expense",
      title: "The branch cost footing",
      brief:
        "Lloyds-flavored brief on the storefront db: the Group cost program opens every quarter with the branch-network cost pack, and the pack's rule is that the category lines must foot to the ledger. Probed facts: 36 opex lines fold into four categories — Rent 14 entries / 16800.00 (fourteen flat 1200.00 branch-lease lines), Ads 14 / 4570.00, Travel 3 / 2521.00, Tools 5 / 1525.00 — for a 25416.00 total that ties to the GL's operating_expenses debit fold of 25416.00 (80-entry ledger, 181080.00 = 181080.00). Finance wants one deliverable: each category with its entry count and spend, plus a TOTAL footing row, biggest line first — the footing row leading the read so nobody mistakes a category line for the whole.",
      ask: "Return each cost line with its entry count and spend to 2 decimals, plus a TOTAL footing row, biggest first (footing row leads).",
      template:
        "SELECT category, {1}(*) AS entries, ROUND({2}(amount_cents) / 100.0, 2) AS spend\nFROM expenses\nGROUP BY category\nUNION ALL\nSELECT {3}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY spend {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-line counter",
          why: "COUNT(*) counts the opex rows folded into each category — Rent 14, Ads 14, Travel 3, Tools 5. SUM(*), AVG(*) and MAX(*) are not SQL: only COUNT takes the star, so the wrong chip errors instead of lying.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the spend folder",
          why: "SUM(amount_cents) folds the pence per category — Rent 1680000 pence prints 16800.00 after the /100.0 dollar read. MAX would print the single biggest line (Rent's 1200.00), not the category total; MIN and AVG read smaller wrong numbers still.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the footing label",
          why: "The grand row is labelled 'TOTAL' so every reader knows row one is the footing, not a fifth category. 'ALL' would relabel it mid-quarter and break every diff against last month's pack — the label is part of the deliverable.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC leads with the footing row (25416.00) and then Rent (16800.00) — the line the cost program argues about. ASC flips the read so Tools at 1525.00 opens the pack, burying the headline under the tail.",
        },
      ],
      distractors: ["MAX", "MIN", "AVG", "ASC", "'ALL'"],
      walkthrough:
        "Two populations, one layout. The branch fold groups 36 opex lines by category and prices them in one expression — SUM(amount_cents) / 100.0, the cents-to-dollars promotion the whole finance layer hangs on — reading Rent 14 / 16800.00, Ads 14 / 4570.00, Travel 3 / 2521.00, Tools 5 / 1525.00. The UNION ALL'd second branch folds the WHOLE table with no GROUP BY: COUNT(*) reads 36 and SUM reads 25416.00, so the TOTAL row is an independent footing check — if a category edit ever double-counts, the stack stops tying to the GL's operating_expenses fold of 25416.00 and the pack refuses to ship. The distractors each break differently: MAX or MIN in the counter slot is not SQL (only COUNT takes the star); in the spend slot MAX prints the single biggest line — Rent's 1200.00, not 16800.00 — and AVG prints per-entry means; 'ALL' relabels the footing row; ASC flips the read so the smallest line opens the pack. The ordering is deterministic because no two categories tie on spend.",
    },
    {
      id: "cs-lloyds-2",
      tier: "medium",
      topic: "j4",
      universe: "refund-audit",
      title: "The no-evidence watchlist",
      brief:
        "Lloyds-flavored brief on the storefront db: in the motor-finance review era the watchword is evidence — every settlement must show a rail leg, and the review committee wants the statement cycles that claim money with nothing behind them. Probed facts: 28 statement cycles on the book (21 paid exact for 66443.00, 6 open at 19609.00, 1 void at 925.00); the coverage census reads 21 exact / 65612.00, 1 partial (4000.00 of 6148.00), and 6 cycles with no rail leg at all, worth 15217.00. One of the six claims 'paid' (cycle #28, 1756.00) — a status with zero legs, exactly the claim-without-evidence pattern the era is about. The watchlist ships biggest-first, each row carrying its zero-leg count as proof.",
      ask: "Return each no-evidence cycle with its id, status, amount to 2 decimals and zero-leg proof, biggest amount first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS amount,\n       {2}(p.id) AS rail_legs\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nGROUP BY i.id\nORDER BY amount {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the pence divider",
          noVerify: true,
          why: "Statement cycles carry INTEGER pence — cycle 24's 493700 pence prints 4937.00 only after the /100.0 real-division promotion. These watchlist amounts happen to be whole dollars, so the integer-division leak hides here; the .0 is still policy, not decoration.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the zero-leg proof",
          why: "COUNT(p.id) counts the matched legs per cycle — 0 on every watchlist row, which is the evidence the committee asked for. SUM or MAX over the all-NULL right side prints NULL, not 0, and a NULL proof column reads as missing data.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survivor rule",
          why: "LEFT JOIN keeps all 28 cycles and lets the WHERE pick the unmatched six. INNER would keep matched rows only — the watchlist would arrive empty, the worst possible thing to hand a review committee. RIGHT flips to the payments side, which has no unmatched rows at all.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first order",
          why: "DESC leads with cycle 24 at 4937.00 — the biggest uncollected exposure. ASC would open on the 873.00 tail and bury the headline the committee acts on first.",
        },
      ],
      distractors: ["INNER", "RIGHT", "ASC", "SUM", "MAX", "1000"],
      walkthrough:
        "An anti-join with a proof column. The LEFT JOIN keeps all 28 statement cycles; WHERE p.id IS NULL keeps only the six with no rail leg, and GROUP BY i.id folds each cycle to one row where COUNT(p.id) reads 0 — the zero-leg proof. The watchlist reads: cycle 24 open at 4937.00, 26 open at 3562.00, 27 open at 2794.00, then #28 — status 'paid' at 1756.00 with zero legs, the claim-without-evidence row — then 21 open at 1295.00 and 18 open at 873.00. The amounts foot to 15217.00, tying to the AR anti-join figure, of which 13461.00 is the open cohort and 1756.00 the paid-status lie. The near-misses stay OFF the list, and the walkthrough says why: #25 is partial (4000.00 of 6148.00 settled — it has a leg) and void #11 actually settled 925.00 (one leg) — both drop out of the IS NULL sieve. The distractors: INNER empties the list (matched rows only); RIGHT flips to the payments side and returns nothing; SUM or MAX in the proof slot print NULL instead of 0; 1000 mis-scales every amount; ASC buries the headline.",
    },
    {
      id: "cs-lloyds-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The premier ladder",
      brief:
        "Lloyds-flavored brief on the storefront db: the relationship team ranks the retail book for premier treatment, and the published policy is that peer customers SHARE a rung with no gaps — DENSE_RANK, not RANK, because a skipped rung implies customers who do not exist. Probed facts: 103 transactions across 16 customers; the ladder runs 24 / 17 / 14 / 13 / 5 (Alice Chen 24 for 7262.35 lifetime, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5), then FOUR customers tied at 4 (Pedro Alvarez 1686.17, Keiko Sato 1098.60, Isabella Rossi 985.65, Noah Meyer 737.68), then two tied at 3. The floor deliberately keeps the pair of 3-transaction customers in the output — the gap-versus-no-gap difference only becomes visible with the rows behind the tie present.",
      ask: "Return every customer with at least 3 transactions — name, cluster, transaction count and a no-gap ladder rank — busiest first.",
      template:
        "SELECT c.name AS customer,\n       c.region AS cluster,\n       COUNT(*) AS transactions,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.region\nHAVING COUNT(*) >= {3}\nORDER BY ladder_rank;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK shares rungs without gaps: ranks 1–5, then the four-way tie reads 6, 6, 6, 6, and the two 3-transaction customers land on 7 — the published premier policy. RANK would stamp the pair 10 and 10, implying five phantom customers between the tie and the tail; ROW_NUMBER would split the four-way tie arbitrarily, silently deciding whose premier letter goes out first.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Ladder rank 1 is the MOST transactions, so the window ORDER BY runs descending — Alice Chen's 24 takes rank 1. ASC would crown the two 3-transaction customers as rank 1 and hand the anchor customer the bottom rung: a correct-looking query answering the opposite question, with the premier list inverted.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "HAVING COUNT(*) >= 3 keeps all 11 customers from 24 down through the two 3s — the rows where RANK's gap (…6, 6, 6, 6, then 10) diverges from DENSE_RANK's no-gap tail (…then 7). A floor of 4 drops exactly the rows that expose the difference and the policy debate disappears from the output.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A census, a floor, and a tie policy. The join attaches each transaction to its customer and GROUP BY c.id folds 103 transactions into 16 customers; COUNT(*) is the ladder metric; HAVING COUNT(*) >= 3 keeps eleven rows — 24, 17, 14, 13, 5, the four-way tie at 4, and the two 3s. The window ranks the folded counts with DENSE_RANK OVER (ORDER BY COUNT(*) DESC): ranks 1 through 5, the tie block reading 6, 6, 6, 6 (Pedro Alvarez 1686.17, Keiko Sato 1098.60, Isabella Rossi 985.65, Noah Meyer 737.68 — the ladder does not care about their lifetime spend, only the count), then 7, 7 for Farid Nasser and Hiro Tanaka at 3. That is the policy: peers share a rung and no rank is skipped, because the premier mailing must not invent five customers who do not exist. RANK would hand the tail 10 and 10 — a gap with nothing in it; ROW_NUMBER would number the tied four 6 through 9, a silent judgment about which relationship manager's book looks bigger. Flip the window direction to ASC and the 3-transaction customers take rank 1. When the tie-break matters (it does for the mailing), the tie-breaker is a named second sort key — lifetime spend, then customer id — written into the query, not left to the planner.",
    },
    {
      id: "cs-lloyds-4",
      tier: "medium",
      topic: "s7",
      universe: "month-close",
      title: "The settlement-stage month grid",
      brief:
        "Month-close brief, in-world: the close pack opens with the settlement-stage grid — one row per month of the 14-month spine (2024-01 to 2025-02), the four stages as columns, built in ONE pass so no two queries can disagree. Probed on the storefront db: placed counts run 8 / 9 / 8 / 7 / 8 / 6 / 8 / 7 / 9 / 7 / 6 / 7 / 6 / 7 and every month's four arms must reconcile to its placed count by construction. The honest zeros carry the story: April through June logged no declined transactions, October and November no settling rows, and the two worst decline months stand out — 2024-07 and 2024-11 at 2 each — while 2024-09 is the cleanest peak (7 of 9 settled clean). The ELSE 0 arm is what keeps those zeros printed instead of vanishing.",
      ask: "Return one row per month — month key, settled clean, settling, awaiting capture, declined, placed — chronological, with every empty stage printing 0.",
      template:
        "SELECT {1} AS month,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS settled_clean,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS settling,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS declined,\n       COUNT(*) AS placed\nFROM orders o\nGROUP BY month\nHAVING COUNT(*) >= {4}\nORDER BY month {5};",
      slots: [
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month key",
          why: "The spine is the 7-character ISO prefix: SUBSTR(created_at, 1, 7) yields 14 buckets from 2024-01 to 2025-02. STRFTIME('%m', created_at) emits month-only keys and merges the two Januaries into one 12-row fiction; o.status re-groups by pipeline stage — four rows about the wrong thing, with no month anywhere.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled-clean literal",
          why: "Settled clean is status 'delivered' — 52 across the book, reading 7 in the 2024-09 peak. 'shipped' prints the captured-and-settling stage into the column and the grid stops describing the stage it claims; the 30 settling rows are a different population from the 52 clean ones, and mixing them moves the kept story.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the declined literal",
          why: "Declined/reversed is status 'cancelled' — 7 across the book, concentrated at 2 in 2024-07 and 2 in 2024-11. 'pending' would print the awaiting-capture queue (14 rows) into the declined column and the pack would flag quiet fulfillment months as risk events — the wrong incident called entirely.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the full-spine floor",
          why: "HAVING COUNT(*) >= 6 keeps all 14 months — the quietest months book exactly 6, so the floor is a no-op guard that documents the spine's minimum while leaving the trend intact. A floor of 8 amputates to 6 rows and the two 2-decline months (July and November, both 6-to-8-transaction months) drop out of the very grid that exists to show them.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month grid is chronological: ASC keeps 2024-01 on top so the reviewer reads the spine forward and every month-over-month comparison matches the slide order. DESC presents the newest month first — the numbers survive, the story reads backwards, and the diff against last month's pack stops lining up row for row.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "STRFTIME('%m', created_at)", "o.status", "DESC", "8"],
      walkthrough:
        "One scan, four arms, one grid. The SUBSTR month key folds 103 transactions into 14 monthly buckets; each SUM(CASE …) arm counts one stage inside the same fold — settled clean 52, settling 30, awaiting 14, declined 7 — and every row reconciles to its placed COUNT(*) by construction (2024-01: 2+3+2+1 = 8). The ELSE 0 is the honesty mechanism: April through June print a declined 0 instead of dropping the stage, and October/November print settling 0 — a report that omits empty stages reads as a clean quarter instead of a quiet one. The two-decline-month pattern (2024-07, 2024-11) is the row the risk review quotes, and 2024-09's 7-of-9 clean is the operational peak beside it. The distractors each break differently: 'shipped' and 'pending' swap pipeline stages into the wrong columns; the '%m' key merges the two Januaries into a 12-row trend; o.status re-groups by stage and the months vanish; 8 in the floor amputates the spine to six rows and hides the decline months; DESC ships the pack reading backwards. Four sequential status queries could each be right and still disagree — one pass cannot.",
    },
    {
      id: "cs-lloyds-5",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The settlement clock, by cluster",
      brief:
        "Month-close brief, in-world: ops reads the settlement clock by cluster before the regional call — creation to settlement over the stamped rows only, because the 21 unstamped rows (14 awaiting capture, 7 declined) have no clock yet and must not dilute the average. Probed on the storefront db: 82 of 103 rows carry the shipped_at stamp; the network reads 2.98 days in a 2–4 day band, and by cluster APAC runs 29 stamped at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5 (spread 3 to 4). The two-decimal precision is load-bearing: at one decimal APAC's 2.93 rounds to 2.9 beside EU's 2.94 and the cluster ordering becomes a coin toss the pack cannot defend.",
      ask: "Return each cluster with its stamped transaction count and average creation-to-settlement days to 2 decimals — fastest cluster first.",
      template:
        "SELECT c.region AS cluster,\n       COUNT(*) AS stamped,\n       ROUND(AVG({1} - JULIANDAY(o.created_at)), {2}) AS avg_days,\n       ROUND(MIN(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS fastest,\n       ROUND(MAX(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS slowest\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at {3}\nGROUP BY c.region\nORDER BY avg_days {4};",
      slots: [
        {
          answer: "JULIANDAY(o.shipped_at)",
          kind: "keyword",
          label: "the settlement endpoint",
          why: "The clock measures creation TO settlement, so the endpoint is JULIANDAY(o.shipped_at) — the stamp that only settling and settled rows carry. JULIANDAY(o.created_at) in the endpoint slot measures creation against itself: every diff reads 0.0 and the clock reports a network that settles instantly — a real query printing a fiction.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the clock precision",
          why: "Two decimals keep the cluster ordering defensible: 2.93 versus 2.94 is a real ordering, while one decimal collapses both to 2.9 and the fastest-cluster claim becomes a tie the data cannot settle. The 2 also lands in the output as LATAM's stamped count — a two-transaction cluster whose 3.5-day average rides on just 2 rows, which the readout must caveat.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the population guard",
          why: "Only stamped rows have a clock, so the population is WHERE shipped_at IS NOT NULL — stated, not implied. IS NULL flips the report to the 21 unstamped rows and every average prints NULL; dropping the filter entirely still prints 2.98 (AVG skips NULLs) but over an unnamed population — the silent-shrink failure the review rejects.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the fastest-first direction",
          why: "The readout opens on the fastest cluster — APAC 2.93 — because the regional call starts with what is working. DESC leads with LATAM's 3.5 on a two-transaction sample: not wrong arithmetic, the wrong headline, and the pack's fastest-cluster claim silently inverts.",
        },
      ],
      distractors: ["JULIANDAY(o.created_at)", "IS NULL", "DESC", "0", "1"],
      walkthrough:
        "A clock with a population attached. The join attaches each transaction to its cluster; WHERE shipped_at IS NOT NULL keeps the 82 stamped rows — the 21 without a stamp are a population definition, not a cleanup job, and IFNULL-ing their latency to zero would invent same-day settlements. JULIANDAY(shipped_at) − JULIANDAY(created_at) is fractional days by contract, AVG folds it per cluster, and ROUND(…, 2) prints APAC 29 / 2.93, EU 36 / 2.94, US 15 / 3.07, LATAM 2 / 3.5 — fastest and slowest columns confirming the 2-to-4 band everywhere except LATAM's 3-to-4. The two-decimal precision is what keeps 2.93 ahead of 2.94; at one decimal the ordering ties and the fastest-cluster headline is a coin toss. The read: the network clock is healthy (2.98 inside the band), the APAC/EU clusters are a hair apart, and LATAM's 3.5 is directionally interesting but rests on two rows — say so before the regional call does. The distractors: the created_at endpoint zeroes the clock, IS NULL reports the unstamped and prints NULLs, 0 or 1 in the precision slot flattens the ordering, and DESC inverts the headline.",
    },
    {
      id: "cs-lloyds-6",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass close census",
      brief:
        "Month-close brief, in-world: the close's first gate is the status census, and the pack rule is ONE scan — all four settlement stages counted beside each other so no two queries can disagree. Probed on the storefront db: 103 placed transactions; 52 settled clean + 30 settling + 14 awaiting capture + 7 declined = 103 by construction; average ticket 338.19 against the 25.47-to-1088.44 spread; decline share 6.8% over the PLACED base. FILTER (WHERE …) counts each stage in the same scan as COUNT(*) — the fleet's pre-3.30 engines run the SUM(CASE) twin — and a branch that fails the identity is the day's first incident, not a rounding note.",
      ask: "Return one row: placed transactions, the four settlement-stage counts in one pass, average ticket to 2 decimals, and the decline share over placed.",
      template:
        "SELECT COUNT(*) AS placed,\n       COUNT(*) {1} AS settled_clean,\n       COUNT(*) {2} AS settling,\n       COUNT(*) {3} AS awaiting,\n       COUNT(*) {4} AS declined,\n       ROUND(AVG(total), {5}) AS avg_ticket,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*), 1) AS decline_pct\nFROM orders;",
      slots: [
        {
          answer: "FILTER (WHERE status = 'delivered')",
          kind: "keyword",
          label: "the settled-clean arm",
          why: "Delivered is settled clean — 52 of 103. Swapping in another stage's filter prints that stage into the column and the census stops reconciling: 30 (settling) or 14 (awaiting) or 7 (declined) in this slot breaks the 52+30+14+7 = 103 identity the close ships on, and the failed branch is the incident the pack exists to catch.",
        },
        {
          answer: "FILTER (WHERE status = 'shipped')",
          kind: "keyword",
          label: "the settling arm",
          why: "Shipped is captured-and-settling — 30 rows with the stamp on but the settlement not clean. Counting 'delivered' here double-counts the settled book into the in-flight column and the grid prints 52 twice; the 30 must stand alone or the in-flight queue the ops team works from is fiction.",
        },
        {
          answer: "FILTER (WHERE status = 'pending')",
          kind: "keyword",
          label: "the awaiting arm",
          why: "Pending is awaiting capture — 14 rows with no stamp, no latency, no settlement yet. They stay IN the census (and in the placed denominator) as 'not yet', not as failures; mislabeling them declined inflates the risk queue, and mislabeling them settling invents a dispatch stamp 14 rows do not have.",
        },
        {
          answer: "FILTER (WHERE status = 'cancelled')",
          kind: "keyword",
          label: "the declined arm",
          why: "Cancelled is declined/reversed — 7 rows, the numerator of the 6.8% decline share and the only stage that leaves the kept book. Any other stage here breaks both the identity and the share: the decline_pct fold divides this same arm by COUNT(*), so the column and the rate must read the same population by construction.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Money prints to two decimals — 338.19, not 338.2 or 338 — because the ticket average is reconciled against the 25.47-to-1088.44 spread and the cents digit is part of the figure. One decimal rounds the average away from the book's own two-decimal grain; zero decimals turns a money read into a count-shaped number.",
        },
      ],
      distractors: ["FILTER (WHERE total > 0)", "FILTER (WHERE status = 'refused')", "0", "3", "SUM(total)"],
      walkthrough:
        "One scan, four arms, one identity. COUNT(*) reads the placed book — 103; each FILTER (WHERE status = …) arm counts one stage in the SAME scan: 52 settled clean, 30 settling, 14 awaiting, 7 declined — and 52+30+14+7 = 103 by construction, the reconciliation the close ships on. The money column folds ROUND(AVG(total), 2) to 338.19, and the decline share divides the cancelled arm by the placed base in one expression — 100.0 before the division, 6.8 — with the denominator visible on the slide because a share without its base is a rumor. FILTER is the portable idiom; the SUM(CASE WHEN … THEN 1 ELSE 0 END) twin computes the same four numbers for engines without it, and the census must reconcile on either. The distractors each break differently: a total > 0 filter counts every row into the stage columns (103 everywhere) and the identity collapses; 'refused' matches no status vocabulary in this book and prints zeros across the arms; 0 or 3 in the precision slot misprints the money figure; SUM(total) in a count slot is not SQL. Four sequential queries can each be right and still disagree — one pass cannot.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "The settlement-promptness share: transactions that settled within the promised window versus late ones — a conditional rate over a timestamp comparison, the same shape as the settlement-clock screens." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read: who transacts most, decided on a grouped count — the customer-side twin of the relationship ladder, where the 24-transaction anchor sits." },
    { slug: "game-play-analysis-iv", why: "First-event cohort logic: customers whose FIRST transaction landed in the window — the digital-first migration cohort definition, computed not asserted." },
    { slug: "active-businesses", why: "One-pass status censuses: settled, settling, awaiting, declined in a single scan whose branches must reconcile to 103. Four sequential queries drift; one pass cannot." },
    { slug: "total-traveled-distance", why: "Conditional SUM over a flag — settled-value versus declined-value splits, the same CASE-SUM muscle as the decline map." },
    { slug: "fix-names-in-a-table", why: "Customer-name hygiene before any join: the personal-banking book arrives title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one customer into two." },
    { slug: "fix-product-name-format", why: "Shelf-name normalization on the product feed — the current-accounts/mortgages/savings/cards catalog must join clean or the family folds double-count." },
    { slug: "monthly-transactions-ii", why: "Declined-versus-kept month packets via UNION — the two-population report the retail book ships monthly, stitched not joined." },
    { slug: "count-salary-categories", why: "Ticket-band census with UNION ALL totals — the 25.47-to-1088.44 spread banded into tiers whose grand row must reconcile against COUNT(*)." },
    { slug: "managers-with-at-least-5-direct-reports", why: "HAVING-gated subquery — intermediaries with 3+ shelf listings, customers with 10+ transactions: the gating pattern before any concentration read ships." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Above-average line reads: which transactions carry itemized lines beyond the book's average — the two-stage fold behind the premium-ticket screens." },
    { slug: "students-and-examinations", why: "Three-table coverage census — customer × shelf × transactions: which customers touched which product families, the cross-sell read the retail side runs weekly." },
    { slug: "the-most-recent-three-orders", why: "Per-customer latest-3 via window — the relationship manager's recent-activity rail: ROW_NUMBER with a PARTITION and a deterministic tie-break." },
    { slug: "movie-rating", why: "The multi-part report: argmax by one rule, per-person aggregates by another — composition under pressure for the screen's final act." },
    { slug: "market-analysis-i", why: "New-in-window joins — customers whose first transaction predates or postdates the digital pivot: the before-or-after fork the migration story asks weekly." },
    { slug: "customer-order-frequency", why: "HAVING frequency gates — recurring monthly behavior on the transaction book: the direct-debit rhythm read that decides which customers get which treatment." },
    { slug: "ar-aging-schedule", why: "Statement cycles bucketed by age — the AR aging ladder collections re-runs every close over the open book (6 cycles at 19609.00 on this db), biggest exposure first." },
    { slug: "settlement-fails-aging", why: "Unsettled legs aged by days outstanding — the review-era evidence screen: money claimed but not yet proven, bucketed before a single chase letter ships." },
    { slug: "delinquency-buckets", why: "Days-past-due banding with fixed, published edges — the arrears book's home read, where a reordered CASE arm quietly re-buckets the delinquent population." },
    { slug: "vintage-default-curves", why: "Cohort decline curves by booking month over the 14-month spine — vintage analysis is the window-and-bucket drill that tells a 2024-07 wobble from a book-wide trend." },
    { slug: "prepayment-detection", why: "Early-payoff screens on a flat-30-day book — spotting cycles that cleared before terms is the mortgage prepayment read in miniature, evidence over labels." },
    { slug: "credit-utilization-bands", why: "CASE banding around utilization edges — premier-versus-standard treatment is a published edge list, and this drills arms that are exhaustive and ordered." },
    { slug: "risk-based-pricing", why: "Rates computed per risk tier with the denominator stated first — the pricing-desk habit: 100.0 before the division, the base decided before the ratio." },
    { slug: "suspicious-bank-account-transactions", why: "Pattern screens over transaction streams — the review-era evidence habit: flags are claims, row-level queries are the proof, exactly like the paid-status lie." },
    { slug: "structuring-detection", why: "Just-under-threshold bursts via conditional counts and windows — threshold games are banding logic in motion, and this is the drill that catches them." },
    { slug: "account-balance", why: "Running balance via window sums — the ledger walk per account, the same cumulative arithmetic the 80-entry GL proof hangs from." },
    { slug: "balance-rollforward", why: "Opening plus movement minus closing — the rollforward identity is the GL walk in one query, and a rollforward that doesn't tie is the close's first page." },
    { slug: "gl-reconciliation", why: "The trial-balance proof as a drill: 181080.00 debits against 181080.00 credits, delta 0 — this slug IS the close's final gate, rehearsed at practice scale." },
    { slug: "journal-gap-detection", why: "Sequence gaps in the journal — islands-and-gaps over entry ids on the 80-entry GL: a missing journal line is a reconciliation break waiting to be found." },
    { slug: "daily-balance-interest", why: "Interest accrued over date-bounded daily balances — the date-math discipline (half-open windows, stated conventions) on the money layer." },
    { slug: "point-in-time-asof", why: "The balance in force on a statement date, not today's — as-of reads are the slowly-changing-dimension instinct every cycle reconciliation assumes." },
    { slug: "chargeback-rate-ranking", why: "Reversal rates ranked per cluster — the decline share's sibling, computed on placed denominators and ranked with the tie policy named." },
  ],
};
