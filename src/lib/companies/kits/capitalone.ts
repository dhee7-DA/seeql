// Capital One — kit 3 of the Banking & Capital Markets domain (Batch G).
// The tech-forward bank: credit cards and consumer lending run like a
// technology company — cloud-native analytics, machine-learning credit
// decisions, and interviews that read like data science screens.
// Pool provenance: 8 tagged sql rows in scripts/company-pools.md
// (product-sales-analysis i/ii/iii, sales-analysis i/ii/iii,
// delinquency-buckets, vintage-default-curves) used heavily + theme-curated
// fills from the theme menu — every problem mirrors a workflow Capital One's
// credit-risk, card and platform teams are known to probe.
// Case studies run on the storefront db, mapped honestly as
// customers = card holders / borrowers (region = market),
// invoices = the credit book (statement facilities; status = paid / open /
// void), payments = settlements arriving on card vs wire rails
// (INTEGER CENTS — the dollar read is amount_cents / 100.0),
// ledger_entries = the double-entry core — with probed figures from
// scripts/company-facts.md only.

import type { CompanyKit } from "../types";

export const capitaloneKit: CompanyKit = {
  id: "capitalone",
  domainId: "banking",
  name: "Capital One",
  tagline: "The tech-forward bank: data-first interviews",
  accent: "text-cyan-300",

  brief: [
    "Capital One is the bank that behaves like a technology company — a top-tier US credit-card lender and consumer bank that was early to cloud, early to machine learning, and open about the fact that it competes on data. The business reality: millions of card accounts and credit lines, decisions priced risk-first, and a {rose:loss curve} watched by **vintage cohort** like a vital sign. The analyst's daily tension is that pairing — growth SQL that moves at product speed, and credit SQL where a bucket boundary or a denominator drift is a *loss-forecast error*. Every read here sits on top of a double-entry ledger that must {emerald:tie}, and a settlement rail system where money arrives as card or wire and the mix between them is itself a managed number.",
    "The data org is engineering-adjacent by design. Platform teams own the lakehouse-style estate, credit-risk analytics owns {amber:delinquency buckets}, roll rates and vintage curves, and card/business teams own the funnel reads — approvals, utilizations, spend. The schema habits are bank-grade: money lands as **INTEGER cents** (a card rail that settled 3736400 cents prints as 37364 dollars only after the `/100.0`), and the books carry the kinds of anomalies that make reconciliation a craft — a {rose:voided} facility that still received its 925 dollars, a paid facility with no settlement rows at all, a facility settled in installments that never finished.",
    "Interview style is data-first, true to the brand. A typical screen walks from a warm-up join to a conditional aggregate with a business rule attached (which rail funded the book, which facilities carry split settlements), then escalates into either a **window ranking** (exposure ladders, per-market concentration) or a rate question where **the denominator is the whole test**. Follow-ups probe definitions out loud: 'is that per settlement or per borrower?', 'what happens to a facility that never settled — is it in your denominator?'. Candidates who narrate the grain before writing the join consistently outperform; *the interviewer is a technologist and is listening for engineering habits, not luck*.",
    "Preparation strategy: the registry tags **eight problems** for Capital One — the Product/Sales Analysis ladder, the Sales Analysis trio, and two credit-risk classics (`delinquency-buckets`, `vintage-default-curves`) — start there, because they map one-to-one onto the aggregation, bucketing and cohort screens. The rest of the pool is theme-curated toward the bank's known reads: honest-denominator rates, anti-join exposure hunts, cents-safe money math. Then run both case studies on the live storefront db: one rebuilds the {sky:settlement-rail census} its card ops open the month-close with, the other rebuilds the {amber:credit-book triage} finance signs off before any loss number ships.",
  ],

  dayInLife: [
    "**08:30 —** the day starts with the overnight settlement check. Card ops opens the rail board first: did last night's card and wire settlements land, does settled value tie to the ledger's cash account, and does the rail mix sit inside its expected band? The first query of the day is almost always a two-sided reconciliation — settlements versus the credit book, ledger debits versus credits (**181,080 against 181,080, delta zero** before anyone opens a dashboard). A mismatch here is the day's first {rose:fire}, and the analyst who can write the diff — which facility is short, by how many cents, on which rail — is the one the ops channel waits on. All money math runs in integer cents; the dollar read happens once, at display, with an explicit `/100.0`.",
    "**11:00 —** midday is the credit-book deep-dive. A coverage audit: every facility classified exact / partial / nothing — **21 exact facilities totalling $65,612.00**, six with no settlement totalling **$15,217.00**, one partial at 4000 of 6148 dollars — and the known wrinkles the classification must be allowed to surface: {rose:voided} #11 received its $925.00, paid #28 has zero settlement rows. This is the hour where the chase list and the proof are the same query.",
    "**14:00 —** next, the split-settlement census. Five facilities **(#1, 5, 12, 19, 22)** carry two payment rows each, and any naive join double-counts them — so the money side gets pre-aggregated to one row per facility before it touches the book. This is the hour where grain discipline is the entire job: a {rose:fan-out} never crashes a query, it just quietly doubles five facilities' money and waits.",
    "**16:00 —** the afternoon tilts toward stakeholder cycles. Credit policy wants the {amber:delinquency bucket} counts and the vintage curve refresh; the card team wants the rail mix by market with the denominators spelled out; finance wants the month-close triage — settled, open exposure, void review — signed with its SQL attached. There are rituals: a weekly risk review where every headline number carries its definition, and a cloud-native habit that surprises new joiners — metric changes go through review *like code changes*, with the query diff attached. The EOD writeup lands with the triage: Capital One SQL exists to defend numbers to engineers, auditors and regulators at the same time.",
  ],

  metrics: [
    { name: "Rail mix", what: "Settled dollars split card vs wire — card 16 settlements / $37,364.00 against wire 11 / $32,248.00 on the probed book. The funding-mix read every card review opens with, and a GROUP BY whose denominators (settlements vs borrowers vs dollars) are three different grains." },
    { name: "Book triage split", what: "Paid / open / void facilities with dollar totals: 21 paid ($66,443.00), 6 open ($19,609.00), 1 void ($925.00). The month-close status census — a CASE-classified fold where every branch must reconcile to the 28-facility total." },
    { name: "Coverage classification", what: "Every facility sorted exact / partial / nothing against money received: 21 exact ($65,612.00), 6 nothing ($15,217.00), 1 partial (#25 at 4000 of 6148 dollars). The chase list and the proof the machine works, in one query." },
    { name: "Uncovered exposure", what: "Facilities with zero settlement rows — 6 facilities carrying $15,217.00. The anti-join read: the unmatched rows ARE the answer, and a WHERE in the wrong clause silently deletes them." },
    { name: "First-payment latency", what: "Days from facility issue to first settlement on the paid book: average 28.4, fastest 13, slowest 84. A julianday-delta read where the population rule (paid facilities with payments — 20 of the 21) is the definition." },
    { name: "Terms adherence", what: "Issue-to-due spread is a uniform 30 days on this book — so every late-settlement day is real slippage against a fixed clock, and latency math needs no per-facility terms lookup." },
    { name: "Split-settlement census", what: "Facilities settled in installments — five of them (#1, 5, 12, 19, 22) carry two payment rows each. The fan-out watchlist: after any join, one row is a facility-payment pair, not a facility." },
    { name: "Ledger proof", what: "Debits equal credits across the double-entry core — 181,080 against 181,080, delta zero. The trial-balance identity that gates every close; if it breaks, nothing downstream ships." },
  ],

  topics: [
    {
      name: "Aggregation over the credit book",
      why: "Every Capital One screen opens by folding rows into business objects: settlements per rail, facilities per status, dollars per bucket. The bank probes whether you can aggregate without losing the population — a fold that silently drops a status or double-counts a split settlement is a loss-number error, not a style issue.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "top-earners"],
    },
    {
      name: "Two-grain censuses",
      why: "Settlements and borrowers are different populations sitting in the same rows: the card rail's 16 settlements came from a smaller set of people. COUNT(*) counts money events; COUNT(DISTINCT customer_id) counts humans — and the gap between the columns is the intensity signal the risk teams actually manage.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations"],
    },
    {
      name: "Status-aware conditional counts",
      why: "Paid, open, void — the credit book's statuses behave like COD cancellations do at a marketplace: exclude them wrongly and the exposure is wrong. Conditional counting (SUM over a 1/0 CASE flag, COUNT FILTER) keeps numerator and denominator folded from the same rows, which is exactly what the triage case in this kit builds.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "product-sales-analysis-iii"],
    },
    {
      name: "Join enrichment across borrower and facility",
      why: "Facility-level reporting means attaching borrower attributes — market, name, status — to every settlement row. The join is N:1 here, but the habit that matters is asking what survives: does a settlement whose facility is void still appear in the funded total? (It did — that's anomaly #11.)",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "sales-analysis-ii"],
    },
    {
      name: "DPD buckets & CASE segmentation",
      why: "Delinquency work is CASE work: days-past-due arms that must be exhaustive and non-overlapping, because a bucket boundary that double-counts or drops a day silently moves loss between buckets. The tagged problem delinquency-buckets is the exact muscle; the bank's follow-up is always 'which arm catches the boundary value?'",
      slugs: ["delinquency-buckets", "count-salary-categories", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Vintage curves & running sums",
      why: "Credit performance reads are cohort reads: origination month on the x-axis, cumulative loss climbing on the y. Vintage-default-curves (tagged) drills the window-cumsum shape; running totals and frame discipline turn a flat table into the curve a risk committee actually reads.",
      slugs: ["vintage-default-curves", "game-play-analysis-iii", "sales-analysis-iii"],
    },
    {
      name: "Risk-concentration ladders",
      why: "Top exposures per market, largest facilities per rail, worst buckets per vintage — concentration reporting is leaderboard reporting. The bank drills the rank trio because ties are real (facilities share dollar amounts) and LIMIT-with-OFFSET habits break exactly there.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "Honest-denominator rates",
      why: "Card share of settled value, coverage rates, latency distributions — every ratio here punishes integer division and careless filters. The house habit: 100.0 before the division, the population decided before the ratio, rounding only at the very end — card is 37364 of 69612 settled dollars, and the share is meaningless if the denominator drifts.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price"],
    },
    {
      name: "Anti-joins: exposure without coverage",
      why: "The question risk asks weekly: which facilities have NO settlement rows? The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is the exposure hunt — six facilities, $15,217.00 on the probed book — and the classic failure is filtering the right table in WHERE, which converts the anti-join into an inner join and deletes the answer.",
      slugs: ["customers-who-never-order", "customer-who-visited-but-did-not-transact", "sellers-with-no-sales"],
    },
    {
      name: "Money math on integer cents",
      why: "The finance tables here — invoices, payments, ledger — keep money in integer cents, so every dollar read is amount_cents / 100.0 and every ratio sits one misplaced integer away from a truncation leak. Trial-balance eyes and per-account folds are the closest thing this kit has to a controls round, and they are graded like it.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "npv-queries"],
    },
  ],

  theory: [
    {
      id: "cap1-t1",
      q: "INNER JOIN or LEFT JOIN when you attach settlements to the credit book — how do you decide, and what does each choice do to the exposure report?",
      a: "Decide from the survival rule the question implies, and say it out loud before writing the join. A funded-value report INNER-joins honestly: settlements only exist where money moved. An exposure report must LEFT-join from facilities — the six facilities with no settlement rows ARE the answer ($15,217.00 of uncovered book), arriving as NULL payloads. The Capital One trap is the silent downgrade: filter the payments side in WHERE (p.method = 'wire') and every NULL-payload row fails the test, the LEFT JOIN collapses to an INNER, and the exposure report ships with its answer deleted — looking correct the whole time. The fix is moving the predicate into ON, or admitting inner-join semantics deliberately and labeling the number 'settled facilities only'. Join type is a claim about who survives, not a habit.",
      tag: "joins",
    },
    {
      id: "cap1-t2",
      q: "Your rail census shows 16 card settlements. Why is COUNT(DISTINCT i.customer_id) a different number, and when does the business want each?",
      a: "Because they count at different grains on the same rows. COUNT(*) counts settlement events — 16 card rails hits; COUNT(DISTINCT i.customer_id) folds repeat settlements back to distinct borrowers, a smaller population. Neither is wrong: settlements measures load on the settlement rails, borrowers measures how many people the book actually touches, and the ratio is concentration — one borrower settling five times on card is a very different credit story from five borrowers settling once. The trap that catches candidates is a third count: after the payments-to-invoices join, COUNT(*) counts facility-payment pairs, and with five split-settled facilities in the book the pair count is not the facility count either. 'One row per what?' said out loud for every COUNT is the habit the interview is grading.",
      tag: "aggregation",
    },
    {
      id: "cap1-t3",
      q: "Where does a status filter live in a query that reports settled dollars — and what breaks when it's in the wrong clause?",
      a: "Status is a ROW-level fact, so it lives in WHERE: status = 'paid' discards open and void rows before aggregation touches them. Once folded, the states no longer exist per row — HAVING can only judge group-level aggregates, and no post-aggregation clause can un-mix void dollars you already summed. The classic failure on this book: summing all facilities and trying to subtract the void in HAVING — voided #11's $925.00 is already inside every total, and worse, it actually RECEIVED its $925.00 in settlements, so label-based and movement-based reads disagree unless the filter placement is deliberate. The strong answer states the pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and asks 'is this a fact about one row or about a group?' for every predicate.",
      tag: "pipeline",
    },
    {
      id: "cap1-t4",
      q: "You need a top-exposures ladder where two facilities can owe the same amount. Which ranking function, and what does each of the three actually promise?",
      a: "ROW_NUMBER, RANK and DENSE_RANK answer three different business questions. ROW_NUMBER guarantees exactly one rank-1 — it breaks ties with an arbitrary (or tie-broken) order, right for 'I need one name per rung'. RANK gives tied values the same rank and leaves a gap after the tie — right when the gap is honest ('two facilities tie for 4th, next is 6th'). DENSE_RANK shares the rung and numbers the next distinct value consecutively — right for tier ladders where a phantom gap reads as a missing facility. On a credit book, dollar ties are routine, so the wrong choice silently invents or erases exposure rungs. The Capital One habit: pick the rank by asking who shares a rung and what the next rung is called — and always add a deterministic tie-breaker (id or date) so the result is reproducible.",
      tag: "windows",
    },
    {
      id: "cap1-t5",
      q: "NOT IN, LEFT JOIN + IS NULL, NOT EXISTS — which do you reach for when hunting facilities with no settlements, and why does the choice have NULL consequences?",
      a: "The exposure hunt must be NULL-safe, and the three shapes are not. LEFT JOIN + IS NULL keeps every facility and lets the unmatched ones surface with NULL payloads — readable, and the NULL rows ARE the six-facility, $15,217.00 answer. NOT EXISTS is equivalent in result and states the intent ('no settlement row exists') without the join vocabulary. NOT IN (SELECT invoice_id FROM payments) is the dangerous one: if the subquery ever returns one NULL, x NOT IN (…, NULL) can never be TRUE — every comparison is UNKNOWN, NOT UNKNOWN is still UNKNOWN, and the entire result silently empties. On a book where anomaly #28 is literally a paid facility with zero settlement rows, a hunt that can return nothing without erroring is a controls failure. Reach for NOT EXISTS or the LEFT JOIN arm; if you must use NOT IN, guard the column.",
      tag: "nulls",
    },
    {
      id: "cap1-t6",
      q: "Classify every facility exact / partial / nothing against money received. Walk me through the shape — and why does a bare join misclassify this book?",
      a: "Pre-aggregate, then join one-to-one, then branch exhaustively. The money side folds first: a derived table (or CTE) computes SUM(amount_cents) per invoice_id — because five facilities carry two settlement rows each, a bare join fans them out and any per-row coverage test sees a partial where the book is exact. The LEFT JOIN from facilities keeps the six with no money (NULL totals), and the CASE arms classify: NULL → 'no payment', equality with amount_cents → 'exact', everything else → 'partial'. Exhaustiveness is the audit: 21 exact ($65,612.00), 6 nothing ($15,217.00), 1 partial (#25 at 4000 of 6148). The ELSE arm is not a convenience — it is the guarantee that no facility silently vanishes from the classification, which is exactly what the interviewer is listening for.",
      tag: "subqueries",
    },
    {
      id: "cap1-t7",
      q: "Paid facilities settled in 28.4 days on average. How do you compute that correctly, and what does 'correctly' mean when five facilities settled twice?",
      a: "Name the population and the date pair first, because both are definitions. Days-to-settle is julianday(paid_on) − julianday(issued_on) per settlement — but the probed metric is issue to FIRST payment over the 20 paid facilities that have payments, so the money side folds to MIN(paid_on) per facility before any averaging; average per-payment latency would let second installments drag the number, and a facility that settled in two hits would count twice. Date arithmetic lives on real types here: julianday for deltas, STRFTIME('%Y-%m', …) for the month spine, and half-open intervals ([start, next_start)) for windows — BETWEEN on a date literal loses everything after midnight on the last day. With a uniform 30-day terms clock, every day past 30 is real slippage; the number is only as honest as its population rule.",
      tag: "dates",
    },
    {
      id: "cap1-t8",
      q: "The books must tie before anything ships. What does a data-quality pass on this ledger actually check — and what can a query never prove?",
      a: "It checks identities, in order of cheapness. The trial-balance identity: SUM(debit_cents) equals SUM(credit_cents) — 181,080 against 181,080, delta zero — one conditional fold, and if it breaks, nothing downstream is read. The census identity: branch counts reconcile to COUNT(*) — paid + open + void is 28 facilities, exact + partial + none is 28 facilities, and a classification whose branches don't sum has a hole. The label-versus-movement check: status says void but #11 received its $925.00; status says paid but #28 has zero settlement rows — the query can surface both mismatches, which is exactly why they're findable. What SQL cannot prove is which one is RIGHT — a query flags that label and movement disagree; deciding whether the void or the money is the error is a human, process judgment. Saying that boundary out loud is the data-quality answer interviewers remember.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "cap1-mcq-1",
      prompt: "amount_cents stores INTEGER cents. SQLite evaluates 1521750 / 100 and 1521750 / 100.0 as…",
      choices: [
        "15217.5 in both — the values are equal",
        "15217 and 15217.5 — integer division truncates",
        "15218 and 15217.5 — integer division rounds",
        "1521750/100 errors; only /100.0 is valid",
      ],
      answer: 1,
      why: "INTEGER / INTEGER in SQLite is integer division: 1521750 / 100 truncates to 15217. The .0 promotes REAL division and keeps the 50 cents. The house rule — /100.0, once, at display — exists because odd-cent rows are a when, not an if.",
      notes: [
        { choice: 0, why: "This is the truncation leak: INTEGER/INTEGER drops the fractional part before anyone rounds. The dollar read silently loses cents on every odd-cent row." },
        { choice: 2, why: "SQLite never rounds integer division — it truncates toward zero. The cents aren't rounded away, they're discarded." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-2",
      prompt: "The card rail shows 16 settlement rows. Which expression counts the distinct borrowers behind them?",
      choices: [
        "COUNT(*)",
        "COUNT(i.customer_id)",
        "COUNT(DISTINCT i.customer_id)",
        "SUM(i.customer_id) / 16",
      ],
      answer: 2,
      why: "COUNT(DISTINCT i.customer_id) folds repeat settlements back to people — 16 card hits came from a smaller set of borrowers. COUNT(i.customer_id) counts non-NULL FKs = 16 again; the DISTINCT is the fold.",
      notes: [
        { choice: 1, why: "Without DISTINCT this equals COUNT(*) on a NOT NULL FK — it counts events, not people. The fold keyword is the entire answer." },
        { choice: 3, why: "Summing primary keys produces a number with no meaning in any census. Borrower count is a COUNT of distinct values, never a SUM." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-3",
      prompt: "The exposure report runs: facilities LEFT JOIN settlements WHERE settlements.method = 'wire'. What silently happened to the six facilities with no settlement rows?",
      choices: [
        "Nothing — LEFT JOIN keeps unmatched facilities",
        "They disappeared — the WHERE turned it into an INNER JOIN",
        "They appear with NULL method values",
        "They moved to the wire rail automatically",
      ],
      answer: 1,
      why: "Unmatched facilities carry NULL on every settlements column; NULL = 'wire' is UNKNOWN, so the WHERE discards them — the LEFT JOIN collapsed to an INNER and the $15,217.00 exposure answer was deleted by a filter that looks harmless.",
      notes: [
        { choice: 2, why: "NULL payloads only survive if no WHERE predicate touches the right table's columns. The moment one does, the survival rule changed." },
        { choice: 0, why: "LEFT-ness lives only in the ON clause. A WHERE on the right table's column re-decides who survives — and decided wrong." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-4",
      prompt: "invoice_id is a nullable FK. Why is `WHERE i.id NOT IN (SELECT invoice_id FROM payments)` the wrong shape for the exposure hunt?",
      choices: [
        "It's slower than a LEFT JOIN on this book size",
        "It deduplicates facilities silently",
        "One NULL invoice_id in payments empties the entire result",
        "It counts facilities instead of summing dollars",
      ],
      answer: 2,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL in the settlement side returns zero rows while looking reasonable. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof hunt.",
      notes: [
        { choice: 0, why: "Performance is beside the point — the failure is correctness. The report ships empty, and an empty exposure report reads as 'good news'." },
        { choice: 3, why: "The shape is a filter, not an aggregate — it returns rows, not counts. The poison is the NULL membership test, not the arithmetic." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-5",
      prompt: "Card settled $37,364.00 of $69,612.00 total. Which expression computes card's share correctly?",
      choices: [
        "100 * 37364 / 69612",
        "100.0 * 37364 / 69612",
        "37364 / 32248 * 100",
        "100.0 * 37364 / 37364 + 32248",
      ],
      answer: 1,
      why: "100.0 forces real division before truncation: 53.7%. The denominator is total settled dollars (37364 + 32248 = 69612) — numerator and denominator from the same fold, the honest-denominator rule.",
      notes: [
        { choice: 0, why: "INTEGER 100 keeps the division integer: 37364*100/69612 truncates toward 0 — sub-1% shares collapse to zero, and even this share loses its decimal." },
        { choice: 2, why: "That's card ÷ wire — a rail-to-rail ratio (115.9%), not a share of the book. The denominator is the whole test." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-6",
      prompt: "You LAG() over settlements per facility to measure the gap between installments. What does LAG return on each facility's first settlement row?",
      choices: [
        "Zero — the first row lags itself",
        "NULL — there is no previous row in the partition",
        "The facility's average gap",
        "It errors — LAG needs a frame clause",
      ],
      answer: 1,
      why: "LAG looks one row back within PARTITION BY facility; on the first row there is nothing behind it, so it returns NULL — and any gap math must COALESCE or explicitly filter that row, or the facility's first settlement silently drops out of the latency average.",
      notes: [
        { choice: 0, why: "Zero would fake a same-day gap and pollute the average downward. NULL is the honest 'no predecessor' signal the query must handle deliberately." },
        { choice: 3, why: "LAG takes an optional offset, never a required frame. It compiles fine — the danger is the NULL it legitimately returns." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-7",
      prompt: "Five facilities carry two settlement rows each. A coverage query joins facilities to settlements and tests each row's paid total. What's wrong?",
      choices: [
        "Nothing — the join preserves all the money",
        "The test sees each split facility twice, once per partial row — pre-aggregate per facility first",
        "The join drops the second settlement row of each split",
        "CASE cannot compare two columns",
      ],
      answer: 1,
      why: "After the join, one row is a facility-payment pair; a per-row total test judges each installment separately and mislabels exact books as partial. The money side folds to one row per facility (SUM … GROUP BY invoice_id) BEFORE the join, making the classification one-to-one.",
      notes: [
        { choice: 0, why: "The money is preserved but the grain is broken — five facilities appear twice, and the coverage label on each fragment is wrong. Grain, not arithmetic, is the bug." },
        { choice: 2, why: "INNER semantics would drop the six unfunded facilities too — but even a LEFT join mislabels, because the fan-out survives either way." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-8",
      prompt: "Which WHERE clause captures every settlement in March 2024 on a TEXT timestamp column, including March 31 23:59:59?",
      choices: [
        "WHERE paid_on BETWEEN '2024-03-01' AND '2024-03-31'",
        "WHERE paid_on >= '2024-03-01' AND paid_on < '2024-04-01'",
        "WHERE STRFTIME('%d', paid_on) <= '31'",
        "WHERE paid_on LIKE '2024-03-__'",
      ],
      answer: 1,
      why: "The half-open interval [Mar 1, Apr 1) admits every timestamp in the month — '2024-03-31 23:59:59' < '2024-04-01' is TRUE. Settlement windows live and die on this shape: BETWEEN drops the last night's hits.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — timestamps after midnight on the 31st exceed the bound and vanish. End-of-month settlement runs are exactly that night." },
        { choice: 3, why: "LIKE matches the text shape, defeats indexes, and silently misses '2024-3-…' padding variants. Range comparison is correct and sargable." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-9",
      prompt: "You want only the facilities carrying 2+ settlement rows (the split-settlement watchlist). Where does that condition live?",
      choices: [
        "WHERE COUNT(*) >= 2",
        "HAVING COUNT(*) >= 2",
        "ORDER BY COUNT(*) DESC LIMIT 2",
        "SELECT COUNT(*) >= 2 AS is_split",
      ],
      answer: 1,
      why: "The condition judges a GROUP (count of settlement rows per facility), so it lives in HAVING — evaluated after the fold. WHERE runs before aggregation, when the per-facility count doesn't exist yet.",
      notes: [
        { choice: 0, why: "Aggregate functions can't be judged in WHERE — the fold hasn't happened. This errors out rather than silently passing, which at least makes it a loud bug." },
        { choice: 2, why: "That sorts and truncates the ladder — it returns the two biggest groups, not the set of groups with 2+. Different question entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-10",
      prompt: "invoices (28 rows) LEFT JOIN payments (27 rows) — 22 invoices have payments, five facilities carry two rows each. What does COUNT(*) return on the joined rows?",
      choices: [
        "28",
        "27",
        "33",
        "55",
      ],
      answer: 2,
      why: "One row per match plus one row per unmatched facility: 27 matched facility-payment pairs + 6 unpaid facilities = 33. COUNT(DISTINCT i.id) folds back to 28 facilities; COUNT(p.id) counts 27 settlements — three different truths from one join.",
      notes: [
        { choice: 0, why: "28 is the facility count — COUNT(DISTINCT i.id)'s answer. The bare COUNT(*) counts join rows, and the fan-out adds five." },
        { choice: 1, why: "27 is COUNT(p.id)'s answer — settlements only. The six unpaid facilities contribute rows too (with NULL payloads); bare COUNT(*) counts them." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-capitalone-1",
      tier: "easy",
      topic: "j7",
      universe: "month-close",
      title: "The settlement-rail census",
      brief:
        "Capital One month-close brief on the storefront db: the card ops review opens with the rail census — settlements arrive on card rails and wire rails, and the mix is a managed number, so the fold needs BOTH grains: settlement events and distinct borrowers per rail. The treasury lead is explicit: '16 card hits is load; the people behind them is concentration. I need both or I can't see the risk.' Probed facts: 27 settlements totalling $69,612.00 (integer cents / 100.0), split card 16 settlements / $37,364.00 vs wire 11 / $32,248.00. Every settlement rides against a credit-book facility, so the join is N:1 — no fan-out — and the borrowers column must fold repeat settlements back to people.",
      ask: "Return each settlement rail with settlement count, distinct borrowers, and settled dollars (2 decimals), biggest rail first.",
      template:
        "SELECT p.method AS rail,\n       {1}(*) AS settlements,\n       COUNT({2} i.customer_id) AS borrowers,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_dollars\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nGROUP BY p.method\nORDER BY settled_dollars {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the settlement counter",
          why: "COUNT(*) counts the settlement rows folded into each rail — 16 card, 11 wire, the probed mix. SUM(*) doesn't exist and MAX(*) is a syntax error: only COUNT takes the star to count rows rather than values.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the borrower fold",
          why: "COUNT(DISTINCT i.customer_id) folds repeat settlements back to distinct borrowers per rail — the concentration column. Without DISTINCT it reads 16/11 again and the census loses the people-behind-the-money signal entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "The review opens with the dominant rail: card's $37,364.00 above wire's $32,248.00. ASC would lead with wire — a correct query opening the month-close with the smaller book.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC"],
      walkthrough:
        "One join, two grains, one direction. The N:1 join attaches each settlement to its facility's borrower — all 27 survive — and GROUP BY method folds them into two rails: card 16 settlements / $37,364.00, wire 11 / $32,248.00, reconciling to the probed 27 and $69,612.00 total. The /100.0 is the cents-to-dollars read: money is stored as INTEGER cents, and the conversion happens once, at display. Inside each rail the census counts twice: COUNT(*) at the settlement grain (load on the rails) and COUNT(DISTINCT i.customer_id) at the borrower grain (concentration behind the load) — the gap between the columns is the intensity signal treasury manages. ORDER BY settled_dollars DESC opens the review with card. Drop the DISTINCT and the borrowers column silently becomes a second settlements column — the most common two-grain census bug, and the reason this bank drills COUNT(DISTINCT …) as a reflex.",
    },
    {
      id: "cs-capitalone-2",
      tier: "medium",
      topic: "s6",
      universe: "fraud",
      title: "The credit-book triage",
      brief:
        "Capital One risk brief on the storefront db: before any loss number ships, finance triages the credit book by label — settled (paid), open exposure, void review — because each bucket gets a different treatment: the settled book is the performance story, the open book is the exposure story, and the void bucket is where label-versus-movement anomalies live. Probed facts: 28 facilities — 21 paid totalling 66443 cents ($66,443.00), 6 open totalling 19609 cents ($19,609.00), 1 void for 925 cents ($925.00). The known wrinkle the triage must be allowed to surface: voided facility #11 still RECEIVED its $925.00 in settlements — the void review bucket exists precisely so a human asks whether the label or the money is wrong. Arms must be exhaustive: every facility lands in exactly one bucket.",
      ask: "Return each book bucket with facility count and book dollars (2 decimals), biggest bucket first.",
      template:
        "SELECT CASE WHEN i.status = {1} THEN 'settled'\n         WHEN i.status = {2} THEN 'open exposure'\n         ELSE 'void review' END AS book,\n       COUNT(*) AS accounts,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS book_dollars\nFROM invoices i\nGROUP BY book\nORDER BY book_dollars {3};",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-bucket flag",
          why: "The first CASE arm names the paid label — 21 facilities / $66,443.00 land here. Unquoted paid would be read as a column reference and error before the fold ever runs.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the exposure-bucket flag",
          why: "6 open facilities / $19,609.00 are the live exposure. 'void' here would hijack the anomaly row #11 into the exposure bucket and misfile the 21 paid facilities into the ELSE arm.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "Finance reads performance first: settled $66,443.00, then open exposure $19,609.00, then void review $925.00. ASC would open the triage with the single voided facility — the tail, not the story.",
        },
      ],
      distractors: ["'void'", "'closed'", "ASC"],
      walkthrough:
        "One CASE, three buckets, zero holes. The status predicate splits 28 facilities at the label level: paid → settled (21 / $66,443.00), open → open exposure (6 / $19,609.00), everything else → void review (1 / $925.00) — the ELSE arm is the exhaustiveness guarantee, not a convenience: if a fourth status ever lands, it surfaces in the review bucket instead of vanishing. COUNT(*) and SUM fold the same rows per bucket, so count and dollars can never disagree about population; /100.0 converts cents to dollars exactly once, at display. The bucket the auditor stares at is void review: #11 is labeled void yet its $925.00 arrived in settlements — the triage's job is to surface that disagreement for a human ruling, not to hide it. Swap the first arm's literal to 'void' and the book re-files itself — settled becomes the anomaly row, and 21 paid facilities land in void review: a valid query reporting a fictional bank.",
    },
  ],

  problems: [
    { slug: "delinquency-buckets", why: "Tagged for Capital One. DPD bucketing — the collections spine: how many facilities sit 1-30, 31-60, 61-90 days past due, in CASE arms that must be exhaustive." },
    { slug: "vintage-default-curves", why: "Tagged for Capital One. Vintage cohort curves with window cumsums — the loss-curve shape every credit-risk screen here orbits." },
    { slug: "product-sales-analysis-i", why: "Tagged for Capital One. The plain fold: per-facility totals from event rows — the warm-up before every risk read." },
    { slug: "product-sales-analysis-ii", why: "Tagged for Capital One. Per-entity aggregates with filters — the facility census Capital One analysts run before any bucket review." },
    { slug: "product-sales-analysis-iii", why: "Tagged for Capital One. Per-entity totals split by period — the before/after comparison shape vintage reviews are built on." },
    { slug: "sales-analysis-i", why: "Tagged for Capital One. Aggregation plus a window alongside — the two-grain census muscle the kit's first case study exercises." },
    { slug: "sales-analysis-ii", why: "Tagged for Capital One. The anti-join read — buyers without a second purchase; here, facilities without follow-on settlements." },
    { slug: "sales-analysis-iii", why: "Tagged for Capital One. Date-filtered aggregation — the settlement-window read that feeds latency and vintage cuts." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger proof (181080 vs 181080 here) that gates every close before a dashboard ships." },
    { slug: "ar-aging-schedule", why: "Aging buckets over the receivables book — the exposure ladder finance signs each close: current, 30, 60, 90+, with no facility counted twice." },
    { slug: "credit-utilization-bands", why: "Latest-row banding per entity — the utilization read: each borrower's most recent band, no double-counting across statement cycles." },
    { slug: "delinquency-roll-rates", why: "State-to-state transition rates between buckets — the roll-rate grid risk committees read: how much of 1-30 slipped to 31-60 this cycle." },
    { slug: "risk-based-pricing", why: "Band joins between risk tiers and price points — the pricing read that ties a borrower's bucket to the rate they were offered." },
    { slug: "settlement-fails-aging", why: "T+2 aging over failed settlements — the ops read that turns a settlement exception into a day-counted worklist." },
    { slug: "duplicate-charge-pairs", why: "Self-join on near-identical money events — the duplicate-settlement hunt: two hits, same facility, same day, one of them shouldn't exist." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe keeping the latest row — the statement-cycle fold: one facility, many cycles, only the current exposure counts." },
  ],
};
