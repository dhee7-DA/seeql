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
    "Preparation strategy: the registry tags **eight problems** for Capital One — the Product/Sales Analysis ladder, the Sales Analysis trio, and two credit-risk classics (`delinquency-buckets`, `vintage-default-curves`) — start there, because they map one-to-one onto the aggregation, bucketing and cohort screens. The rest of the pool is theme-curated toward the bank's known reads: honest-denominator rates, anti-join exposure hunts, cents-safe money math. Then run the **six case studies** on the live storefront db: the settlement-rail census and credit-book triage that open the month-close, plus a market-concentration census, a slippage ladder, a one-pass controls scan and an installment-gap walk. Re-run each a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the thirty-question MCQ bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the definition-probing follow-up tests.",
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
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "top-earners", "transaction-velocity", "daily-balance-interest", "settlement-fails-aging"],
    },
    {
      name: "Two-grain censuses",
      why: "Settlements and borrowers are different populations sitting in the same rows: the card rail's 16 settlements came from a smaller set of people. COUNT(*) counts money events; COUNT(DISTINCT customer_id) counts humans — and the gap between the columns is the intensity signal the risk teams actually manage.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations", "portfolio-weights"],
    },
    {
      name: "Status-aware conditional counts",
      why: "Paid, open, void — the credit book's statuses behave like COD cancellations do at a marketplace: exclude them wrongly and the exposure is wrong. Conditional counting (SUM over a 1/0 CASE flag, COUNT FILTER) keeps numerator and denominator folded from the same rows, which is exactly what the triage case in this kit builds.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "product-sales-analysis-iii", "prepayment-detection", "ar-aging-schedule", "risk-based-pricing"],
    },
    {
      name: "Join enrichment across borrower and facility",
      why: "Facility-level reporting means attaching borrower attributes — market, name, status — to every settlement row. The join is N:1 here, but the habit that matters is asking what survives: does a settlement whose facility is void still appear in the funded total? (It did — that's anomaly #11.)",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "sales-analysis-ii", "bank-account-summary", "duplicate-charge-pairs", "keep-latest-dedupe"],
    },
    {
      name: "DPD buckets & CASE segmentation",
      why: "Delinquency work is CASE work: days-past-due arms that must be exhaustive and non-overlapping, because a bucket boundary that double-counts or drops a day silently moves loss between buckets. The tagged problem delinquency-buckets is the exact muscle; the bank's follow-up is always 'which arm catches the boundary value?'",
      slugs: ["delinquency-buckets", "count-salary-categories", "the-category-of-each-member-in-the-store", "loan-types", "usage-tier-percentiles", "credit-utilization-bands"],
    },
    {
      name: "Vintage curves & running sums",
      why: "Credit performance reads are cohort reads: origination month on the x-axis, cumulative loss climbing on the y. Vintage-default-curves (tagged) drills the window-cumsum shape; running totals and frame discipline turn a flat table into the curve a risk committee actually reads.",
      slugs: ["vintage-default-curves", "game-play-analysis-iii", "sales-analysis-iii", "loan-amortization-schedule", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Risk-concentration ladders",
      why: "Top exposures per market, largest facilities per rail, worst buckets per vintage — concentration reporting is leaderboard reporting. The bank drills the rank trio because ties are real (facilities share dollar amounts) and LIMIT-with-OFFSET habits break exactly there.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary", "portfolio-concentration-hhi", "chargeback-rate-ranking", "top-percentile-fraud"],
    },
    {
      name: "Honest-denominator rates",
      why: "Card share of settled value, coverage rates, latency distributions — every ratio here punishes integer division and careless filters. The house habit: 100.0 before the division, the population decided before the ratio, rounding only at the very end — card is 37364 of 69612 settled dollars, and the share is meaningless if the denominator drifts.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price", "amount-anomaly-zscore", "delinquency-roll-rates"],
    },
    {
      name: "Anti-joins: exposure without coverage",
      why: "The question risk asks weekly: which facilities have NO settlement rows? The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is the exposure hunt — six facilities, $15,217.00 on the probed book — and the classic failure is filtering the right table in WHERE, which converts the anti-join into an inner join and deletes the answer.",
      slugs: ["customers-who-never-order", "customer-who-visited-but-did-not-transact", "sellers-with-no-sales", "suspicious-bank-account-transactions"],
    },
    {
      name: "Money math on integer cents",
      why: "The finance tables here — invoices, payments, ledger — keep money in integer cents, so every dollar read is amount_cents / 100.0 and every ratio sits one misplaced integer away from a truncation leak. Trial-balance eyes and per-account folds are the closest thing this kit has to a controls round, and they are graded like it.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "npv-queries", "structuring-detection"],
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
    {
      id: "cap1-t9",
      q: "Walk me through ROW_NUMBER, RANK and DENSE_RANK on a credit ladder where dollar ties are common — which do you pick, and what breaks with the wrong one?",
      a: "Pick by asking two questions: who shares a rung, and what is the next rung called? ROW_NUMBER numbers every row distinctly — right when the deliverable is exactly one name per rung, wrong the moment a tie should be visible, because it breaks ties arbitrarily. RANK shares rungs and leaves a gap after a tie (1, 1, 3) — the honest ladder for exposures, where a skipped rank is the tie made visible. DENSE_RANK shares rungs with no gaps (1, 1, 2) — right for policy tiers like utilization bands, where a phantom gap would read as a missing band. On this book the ties are real — dollar amounts repeat and latency days collide — so the wrong choice either invents a winner (ROW_NUMBER) or erases a rung the risk committee expected to see (DENSE_RANK where a gap was true). Always add a deterministic tie-breaker (id, date) to any ROW_NUMBER so reruns are reproducible.",
      tag: "windows",
    },
    {
      id: "cap1-t10",
      q: "UNION versus UNION ALL for stacking a grand-total row under a detail report — what actually differs, and which belongs in a close deliverable?",
      a: "UNION concatenates and then dedupes — a distinct pass over the stacked result; UNION ALL concatenates and stops. For a close deliverable the stack's rows are all legitimate and distinct by construction (detail rows plus one TOTAL row), so the dedupe pass is pure cost — and worse, it's a silent hazard: if a detail row ever exactly equals the TOTAL row (possible with a single-row ledger), UNION deletes it and the stack undercounts the very report that was supposed to prove completeness. The house habit is UNION ALL for stacks, UNION only when the ask genuinely wants distinct SETS — say, the union of two populations where overlap must collapse. Name the cost and the hazard and the answer is complete.",
      tag: "sets",
    },
    {
      id: "cap1-t11",
      q: "What is a correlated subquery, why does it scale badly, and what is the set-based rewrite on a book this size?",
      a: "A correlated subquery references the outer row, so it re-evaluates per outer row — 'facilities where billed exceeds their MARKET's average' re-runs the market average once per facility unless the engine decorrelates. It's readable and often correct, which is why screens use it as a warm-up; the follow-up is always the rewrite. Two set-based shapes: join the outer table to a derived table of per-group averages (a CTE computing AVG(amount_cents) GROUP BY region, joined back on region — the fold happens once), or a window: AVG(i.amount_cents) OVER (PARTITION BY c.region) as a column, then compare against it — same single pass, and every row survives. The strong answer names the trade: correlated for clarity on small data, CTE-join or window for the warehouse-sized books this team actually runs.",
      tag: "subqueries",
    },
    {
      id: "cap1-t12",
      q: "EXISTS or IN for the settlement-presence checks — where does each fail, and what does the NULL in the feed do to each?",
      a: "IN is a membership test against a materialized list: fine for the positive check, poisoned for the negative one — x NOT IN (…, NULL) is never TRUE because every comparison is UNKNOWN, so one stray NULL invoice_id empties the entire exposure report with no error. EXISTS is an existence probe: it short-circuits on the first matching row, never builds a list, and NULLs can't poison it — a NULL key simply matches nothing, so the probe is FALSE and the facility correctly shows as unfunded. On this book, where the settlement feed is exactly the kind of messy upstream that carries NULLs, the house shapes are EXISTS for presence/absence checks and LEFT JOIN + IS NULL when the report wants the unmatched rows visible as rows. Say the NULL semantics out loud — that's the part the interviewer is grading.",
      tag: "subqueries",
    },
    {
      id: "cap1-t13",
      q: "Why stage a CTE before a window function — for instance the coverage walk that shows settled cents accumulating per facility?",
      a: "Because the window needs a clean input grain and the business needs the fold staged in readable steps. The walk is: fold nothing yet — payments stay at leg grain — then SUM(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on) accumulates each facility's installments beside every leg, so #1 reads 243000 then 486000 and #25 stalls at 400000 of its 614800 bill. Stage the base in a CTE (legs filtered, dates cast) and the outer SELECT stays about the window, not about plumbing. The other reason is reusability and testability: the CTE is a named grain the reviewer can run alone — one row per what? — before trusting the window built on it. Windows can't be filtered by WHERE in the same SELECT (window output isn't visible to WHERE), so any threshold on the walk forces a second layer anyway — the CTE is that layer.",
      tag: "windows",
    },
    {
      id: "cap1-t14",
      q: "What is your NULL policy for a settlement report — where do you COALESCE, where do you report NULL as a finding, and where do you filter with a stated reason?",
      a: "Name a policy per column, never a global habit. Display columns get COALESCE: an unfunded facility's settled cents print as 0 in the board view because the reader needs a number, not a hole. Finding columns keep the NULL: a NULL settled total on the exposure list IS the finding — coalescing it away deletes the six-row, $15,217.00 answer. Filters state their reason: WHERE status IS NOT NULL documents that unlabeled rows are excluded and counted separately, versus the classic accident where NULL simply fails both = and != silently. And remember the aggregate behavior that backs all of it: SUM and AVG ignore NULL inputs, COUNT(col) shrinks, COUNT(*) keeps rows — so 'how many facilities lack settlements' is COUNT of the IS NULL arm, never an AVG that quietly divided by the wrong denominator.",
      tag: "nulls",
    },
    {
      id: "cap1-t15",
      q: "The triage CASE has arms for paid and open and an ELSE for void. Defend the ELSE — and what happens the day a new status lands?",
      a: "The ELSE arm is the exhaustiveness guarantee. Every facility lands in exactly one bucket: 21 paid, 6 open, 1 void — 28, reconciling to COUNT(*) on sight; that reconciliation is the audit the classification exists to pass. The day a fourth status lands, the ELSE catches it visibly — the bucket census goes 28 = 21 + 6 + (1 + new) — and the anomaly surfaces in a review instead of vanishing. Drop the ELSE and the new status falls through to NULL: the row survives, unlabeled, and every branch count now sums short of 28 with nothing pointing at the cause. That's why bank-grade CASE work treats fall-through as a finding, not a default: write ELSE with a label like 'unmapped review' when you can't enumerate the world, and let the branch census prove the query, not the bank.",
      tag: "casework",
    },
    {
      id: "cap1-t16",
      q: "How do you compute settlement latency on TEXT dates, and where do BETWEEN-style windows go wrong?",
      a: "Convert, don't compare: julianday(paid_on) − julianday(issued_on) gives REAL-valued days (fractions included), CAST to INT when the deliverable is whole days. The book's first-payment latency averages 28.4 days — fastest 13, slowest 84 — and every one of those numbers is a julianday delta folded to MIN(paid_on) per facility before averaging. BETWEEN is the trap on windows: paid_on BETWEEN '2024-03-01' AND '2024-03-31' is inclusive at both ends, so '2024-03-31 23:59:59' — the end-of-month settlement run — exceeds the bound and silently vanishes. The half-open interval [start, next_start) — >= '2024-03-01' AND < '2024-04-01' — admits everything in the month and nothing outside it. State the boundary rule before writing the predicate; that's the habit being graded.",
      tag: "dates",
    },
    {
      id: "cap1-t17",
      q: "The rail calendar folds settlements onto months. Walk the bucketing — and what breaks if the month key is built by text surgery?",
      a: "STRFTIME('%Y-%m', paid_on) renders the month spine — '2024-08', sortable, one bucket per calendar month — and GROUP BY that key gives the calendar: counts per month, cents per month, reconciling to the 27-settlement total. The text-surgery twin, SUBSTR(paid_on, 1, 7), happens to agree while the feed's format is exactly 'YYYY-MM-DD' — and then a padded or reordered date lands and the buckets silently split or merge. Prefer the calendar function: it parses the date, survives format drift, and fails loudly rather than bucketing garbage. Second trap: '%m' alone merges August 2024 with August 2025 — the year lives in the key. And '%Y' alone collapses everything into two year-long buckets — a valid query that no longer contains a month. The format literal is the whole read.",
      tag: "dates",
    },
    {
      id: "cap1-t18",
      q: "Ops asks for each facility's settlement rails in one readable cell — 'card, card' for a split pair. How do you fold text, and what does the cell tell the reviewer?",
      a: "GROUP_CONCAT is the text aggregate: GROUP_CONCAT(p.method, ', ') over a per-facility partition stacks each facility's rail labels into one comma-joined cell — 'card' for single-rail facilities, 'card, card' or 'card, wire' for the splits. The reviewer reads the mix without a second query: five facilities on this book carry two legs, and the concatenated cell makes each one scannable in the ops feed. Two disciplines: ORDER BY inside the aggregate (SQLite 3.44+ supports GROUP_CONCAT(x ORDER BY y), or fold a subquery sorted first) so the cell order is deterministic — 'wire, card' and 'card, wire' should not alternate between runs; and remember it folds AFTER grouping, so it belongs at the same grain as the COUNT and SUM beside it. Text folds never replace numeric censuses — they annotate them.",
      tag: "aggregation",
    },
    {
      id: "cap1-t19",
      q: "The close's query budget is tight: prove the book in one pass. What does the FILTER census look like, and why is it audit-grade?",
      a: "One scan, one row, every population a column: SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'paid'), COUNT(*) FILTER (WHERE status = 'open'), COUNT(*) FILTER (WHERE status = 'void'), SUM(amount_cents) FILTER (WHERE status = 'paid') / 100.0 FROM invoices — 28 facilities, 21 settled ($66,443.00), 6 open, 1 void, all from a single read. It's audit-grade for three reasons: the populations are judged from the same rows, so numerator and denominator can never disagree; the branch counts reconcile to COUNT(*) on sight, which is the census identity; and the single scan is reproducible — rerun it and every column moves together or the feed changed. FILTER (WHERE …) is SQLite's standard conditional aggregate; the CASE-when-1-else-0 SUM twin works identically. Which you reach for is style; the one-pass property is the requirement.",
      tag: "aggregation",
    },
    {
      id: "cap1-t20",
      q: "Before any loss number ships, what does your reconciliation pass on the double-entry core check — and in what order?",
      a: "Cheapest identities first, and nothing downstream reads until they pass. One: the trial balance — SUM(debit_cents) equals SUM(credit_cents) across the ledger, 181,080 against 181,080, delta zero; one conditional fold, stop-the-world if it breaks. Two: the account census — per-account folds (cash 69,612 in / 25,416 out; receivables 86,052 / 69,612; revenue 86,052 credited; operating expenses 25,416) must re-sum to the global totals, proving the global fold didn't eat a row. Three: the label-versus-movement sweep — status says paid but #28 has zero settlement rows, status says void but #11 received its $925.00; both are findable in queries and both are exactly what a consent-order examiner reruns first. What SQL can't decide is which side is right when label and movement disagree — that ruling is human. The pass finds; the process decides.",
      tag: "quality",
    },
    {
      id: "cap1-t21",
      q: "The settlement feed is retried by the pipeline. How do you detect duplicate money, and how do you dedupe without losing a legitimate second installment?",
      a: "Detect with a fold: GROUP BY the natural key (facility + paid_on + amount_cents) HAVING COUNT(*) > 1 — that lists suspicious pairs, and on this book the split facilities (two legs, same facility, different days or amounts) must NOT match, which is exactly why the key includes date and amount. Dedupe with the window: ROW_NUMBER() OVER (PARTITION BY invoice_id, paid_on, amount_cents ORDER BY id) numbers duplicates newest-first, keep rn = 1. The discipline that keeps legitimate installments alive: choose the PARTITION BY key as the business definition of 'same money event' — facility + day + amount — not facility alone, which would collapse the five genuine two-installment splits into 'duplicates' and delete half their money. Say the key out loud, explain what each column excludes, and the answer is complete.",
      tag: "windows",
    },
    {
      id: "cap1-t22",
      q: "Audit wants facility pairs that share a market AND a billed amount. Why is that a self-join, and what keeps it from matching everything to itself?",
      a: "Pairing is a comparison of every row against every other row — that's a join of the table to itself under two aliases: FROM invoices a JOIN invoices b ON a.amount_cents = b.amount_cents AND a customer's region equals b's, WHERE a.id < b.id. The strict inequality is the load-bearing piece: it kills the self-match (a.id = b.id) and each pair's mirror image (b,a), so every pair prints once, in a canonical order. Without it you get self-rows and doubles; with a.id <> b.id alone you still get both orderings. This is the duplicate-settlement hunt shape too — two legs, same facility, same day, near-identical amounts, joined with a tolerance instead of equality. The interviewer's follow-up is always scale: self-joins are O(n²) on the pair keys, so state that the production shape pre-filters by market or amount bucket before joining.",
      tag: "joins",
    },
    {
      id: "cap1-t23",
      q: "Top-N reads: when is ORDER BY + LIMIT honest, and when does it have to be a window?",
      a: "ORDER BY + LIMIT answers 'the top N overall' — one leaderboard, no partitions: the three biggest facilities on the book, full stop. It breaks the moment the ask carries a per-group dimension ('top three per market', 'worst bucket per vintage'), because LIMIT applies AFTER the whole result is built — you'd get three rows total, not three per group. The window shape, ROW_NUMBER() OVER (PARTITION BY market ORDER BY dollars DESC), computes the ladder inside each partition and a predicate on rn keeps exactly the requested depth per group. And LIMIT has a second, subtler failure: ties at the cut line are broken arbitrarily, so two facilities tied at the Nth dollar get one survivor — a decision the query made silently. On a book where dollar ties are routine, the tie-honest answer is RANK or DENSE_RANK with a threshold, not a LIMIT.",
      tag: "windows",
    },
    {
      id: "cap1-t24",
      q: "Interviewer: your settlement total moved 37 cents between reruns. Walk me through the integer-cents discipline that makes that impossible.",
      a: "Money stays INTEGER cents end to end, and the conversion happens once, at the display edge. The leaks are all division-shaped: INTEGER/INTEGER truncates (1521750/100 prints 15217, half a dollar gone), so every dollar read is /100.0 — the .0 promotes REAL division and keeps the tail. Ratios put 100.0 before the multiplication: 100 * x / y keeps integer division and collapses any share under 1% to zero — 'tiny' and 'zero' become indistinguishable in a recon metric. Folds divide at the END, not per row: SUM the cents (exact integer arithmetic), convert once, round once at display. A 37-cent drift between reruns is the signature of float math introduced mid-pipeline — a per-row ROUND, a REAL column, a cast — and the whole point of the cents design is that the error class simply doesn't exist until someone converts too early. Name the failure and the fix in one sentence; that's the senior answer.",
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
    {
      id: "cap1-mcq-11",
      prompt: "Risk wants the slippage ladder: facilities ranked by days-past-due, and two facilities that tie must share a rank. Which function?",
      choices: ["ROW_NUMBER", "RANK", "COUNT", "SUM OVER"],
      answer: 1,
      why: "RANK gives tied values the same rank and leaves a gap after the tie — two facilities tied at 4th are both rank 4 and the next one is rank 6. The gap is honest: a rank nobody occupies is the tie made visible.",
      notes: [
        { choice: 0, why: "ROW_NUMBER guarantees distinct numbers, so it silently breaks the tie arbitrarily — one tied facility outranks the other for no business reason. Tie-breaking needs a stated rule, not a default." },
        { choice: 2, why: "COUNT isn't a ranking function — it folds rows into one number per group. The ladder needs one row per facility, which is what window functions preserve." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-12",
      prompt: "Seven facilities tie for the 8th rung of an exposure ladder ranked with DENSE_RANK(). What rank does the next facility below them get?",
      choices: ["15", "9", "8", "NULL"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: the seven tied facilities are all rank 8 and the next distinct value is rank 9. RANK would say 15 — the honest gap; DENSE_RANK compresses it for tier ladders where the tier count matters.",
      notes: [
        { choice: 0, why: "15 is RANK's answer (8 tied + 7 rungs skipped). Choosing it when the ask says 'no-gap tier' inverts the whole selection." },
        { choice: 2, why: "Rank 8 would put the next facility INSIDE the tie — that's not a ranking function, that's a bug. Ties claim their rungs; newcomers move past them." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-13",
      prompt: "A coverage fold gives NULL settled cents for the six unfunded facilities. Which expression prints 0 for them instead?",
      choices: [
        "SUM(p.amount_cents) + 0",
        "COALESCE(SUM(p.amount_cents), 0)",
        "NULLIF(SUM(p.amount_cents), 0)",
        "SUM(p.amount_cents) IS NOT NULL",
      ],
      answer: 1,
      why: "COALESCE substitutes its first non-NULL argument: NULL folds become 0, matched folds keep their sum. NULL + 0 is still NULL — NULL is contagious through arithmetic, which is exactly the leak the wrapper exists to stop.",
      notes: [
        { choice: 0, why: "NULL + 0 = NULL. Adding zero touches nothing; the display still shows a hole where the exposure report wants a zero." },
        { choice: 2, why: "NULLIF goes the other way — it turns a matching value INTO NULL. This would blank out genuinely-zero folds, the opposite of the fix." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-14",
      prompt: "A facility has no settlement rows, so its payment fold is empty. What does SUM(p.amount_cents) return for it in the joined result?",
      choices: ["0", "NULL", "It errors", "The facility's billed amount"],
      answer: 1,
      why: "SUM over zero rows is NULL, not 0 — the aggregate has nothing to add and reports that honestly. Every downstream comparison must plan for it: paid_cents = amount_cents is UNKNOWN, so the row lands in the ELSE arm, not the exact arm.",
      notes: [
        { choice: 0, why: "Zero is the COALESCE'd display value, not the raw fold. Confusing the two is how 'no payment' rows sneak into 'exact' buckets." },
        { choice: 3, why: "The billed amount lives on the facility row — SUM only sees the payment side, which is empty. Nothing invents a number." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-15",
      prompt: "Card ops wants settlements bucketed by month for the rail calendar. Which expression builds the bucket key from a TEXT paid_on column?",
      choices: [
        "STRFTIME('%Y-%m', paid_on)",
        "MONTH(paid_on)",
        "paid_on / 100",
        "SUBSTR(paid_on, 5, 2)",
      ],
      answer: 0,
      why: "STRFTIME('%Y-%m', …) renders '2024-08' — the month spine the whole close calendar hangs on. SUBSTR(5,2) grabs only the month digits, merging August 2024 with August 2025 into one bucket.",
      notes: [
        { choice: 1, why: "MONTH() doesn't exist in SQLite — this errors immediately. Date functions here are STRFTIME, DATE, and JULIANDAY." },
        { choice: 3, why: "Text surgery works while the format cooperates and silently lies the moment the year matters. The %Y-%m pattern is the calendar function's job." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-16",
      prompt: "You're stacking per-rail settlement rows with a labelled ALL-RAILS total row underneath. Why UNION ALL rather than UNION?",
      choices: [
        "UNION ALL is faster because it skips the dedupe sort",
        "UNION would silently drop a rail whose row duplicated an existing one",
        "UNION ALL keeps both branches — UNION errors on different column counts",
        "They're identical here; UNION is just older syntax",
      ],
      answer: 0,
      why: "UNION ALL concatenates without a distinct pass — cheaper, and every stacked row belongs. UNION dedupes, so it wastes a sort and, worse, could collapse a genuine duplicate row into one, undercounting the stack it was supposed to total.",
      notes: [
        { choice: 1, why: "True in principle — a duplicated stack row would vanish — but the primary reason is that the dedupe pass is pure cost here. The stack's semantics demand ALL." },
        { choice: 2, why: "Both forms need matching column counts; that's not the difference. The difference is the dedupe pass and what it could delete." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-17",
      prompt: "Audit wants pairs of facilities in the same market carrying the same billed amount. Which shape finds them?",
      choices: [
        "GROUP BY region HAVING COUNT(*) > 1",
        "Self-join invoices a, b ON same amount, same customer's region, a.id < b.id",
        "SELECT DISTINCT amount_cents FROM invoices",
        "Window LAG over amounts ordered by id",
      ],
      answer: 1,
      why: "A pairing question is a self-join: alias the table twice, match on the shared attributes, and a.id < b.id keeps each pair once without matching a facility to itself. The strict inequality is the whole trick.",
      notes: [
        { choice: 0, why: "That finds markets with several facilities — not pairs that MATCH on amount. A census of groups answers a different question." },
        { choice: 3, why: "LAG compares each facility to its NEIGHBOR in some order — adjacent rows only. True pairing must compare all rows to all rows, which is a join." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-18",
      prompt: "Which shape lists facilities that have at least ONE settlement row — safely, whatever the settlement feed contains?",
      choices: [
        "WHERE i.id IN (SELECT invoice_id FROM payments)",
        "WHERE EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "WHERE i.id = ANY (SELECT invoice_id FROM payments)",
        "JOIN payments and COUNT(*) >= 1",
      ],
      answer: 1,
      why: "EXISTS probes for a matching row and short-circuits on the first hit — and it can't be poisoned: a NULL in the feed makes the probe FALSE, not 'everything UNKNOWN'. IN inherits the NULL trap; EXISTS doesn't.",
      notes: [
        { choice: 0, why: "IN works for the POSITIVE test even with NULLs present — the poison is NOT IN. Still, EXISTS states the intent and scales better; the house habit is EXISTS." },
        { choice: 2, why: "ANY/SOME isn't SQLite syntax — this fails to parse. Know the dialect you're writing in." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-19",
      prompt: "Settlement latency is julianday(paid_on) − julianday(issued_on). The book's average prints 28.4375. What does the same delta WITHOUT julianday produce on TEXT dates?",
      choices: [
        "The same number",
        "Zero — TEXT dates compare equal",
        "String subtraction errors out",
        "Integer day counts without the fraction",
      ],
      answer: 2,
      why: "TEXT minus TEXT isn't date math — SQLite coerces both operands to numbers, gets 0 for non-numeric strings, and returns 0.0 rather than erroring. julianday is the conversion that makes the delta real days, fraction included.",
      notes: [
        { choice: 3, why: "That's backwards: julianday yields the REAL-valued day count; the raw TEXT subtraction yields garbage coerced from strings." },
        { choice: 0, why: "Only if both columns were already numeric. '2024-03-05' - '2024-02-20' coerces to 0 - 0. Silent, wrong, and it averages to zero across the book." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-20",
      prompt: "The census ends ORDER BY settled_dollars DESC, where settled_dollars is a SELECT alias for ROUND(SUM(...)/100.0, 2). What is SQLite actually sorting by?",
      choices: [
        "The raw SUM before rounding — aliases aren't visible to ORDER BY",
        "The computed alias — ORDER BY can reference SELECT aliases",
        "The column's position number 2",
        "It errors — ORDER BY needs a real column",
      ],
      answer: 1,
      why: "ORDER BY runs after SELECT, so output aliases are in scope — the sort follows the rounded, converted value. WHERE and HAVING cannot see those aliases; they run earlier in the pipeline.",
      notes: [
        { choice: 0, why: "That's the pipeline-order confusion: only ORDER BY (and DISTINCT-ish output stages) can see the SELECT list's names. Here it sorts the display value, cents converted." },
        { choice: 2, why: "Positional ORDER BY 2 would also work — but the query says the alias, and the alias is what runs. Both are legal; they're not the same expression." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-21",
      prompt: "ROUND(15217.555, 2) and ROUND(SUM(amount_cents)/100.0, 2) — which is the defensible money read?",
      choices: [
        "Both — rounding is rounding",
        "Only the second — fold integer cents first, convert once, then round",
        "Only the first — round each row before aggregating",
        "Neither — never round money",
      ],
      answer: 1,
      why: "The house rule: SUM the integer cents (exact), convert once with /100.0, round only at display. Rounding per row before a fold compounds each row's error into the total — the drift the cents design exists to kill.",
      notes: [
        { choice: 0, why: "Order of operations is the whole game: rounding early bakes error into every subsequent sum, and recon differences become unreproducible." },
        { choice: 3, why: "Display needs rounding — a board deck can't print 15217.555. The rule is WHERE it happens (the edge), not whether." },
      ],
      difficulty: "easy",
    },
    {
      id: "cap1-mcq-22",
      prompt: "A 7-day settlement trend uses AVG(daily_cents) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Why does ROWS vs RANGE matter here?",
      choices: [
        "ROWS is faster; RANGE is deprecated",
        "ROWS peers 6 ROWS back; if a day is missing from the feed, the window silently spans more than 7 calendar days",
        "RANGE would include future rows",
        "They differ only when the ORDER BY column has NULLs",
      ],
      answer: 1,
      why: "ROWS counts physical rows; RANGE counts the ORDER BY value's span. With a missing day in the spine, 6 preceding ROWS reach back past a week of calendar. Honest trend math on gappy feeds joins a date spine or uses the calendar-true frame deliberately.",
      notes: [
        { choice: 0, why: "Both are first-class; neither is deprecated. The difference is semantics, and on date axes semantics is correctness." },
        { choice: 3, why: "NULLs in the sort key are a real problem but a different one. The ROWS/RANGE fork bites on ties and gaps in the axis itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-23",
      prompt: "Facilities where the billed amount beats THEIR MARKET's average — which rewrite avoids the per-row correlated subquery?",
      choices: [
        "Move the subquery into SELECT",
        "AVG(i.amount_cents) OVER (PARTITION BY c.region) compared to i.amount_cents",
        "MAX(amount_cents) with GROUP BY region",
        "DISTINCT region, amount_cents",
      ],
      answer: 1,
      why: "A partition window computes each market's average once and keeps every row, so the comparison is a plain column-vs-column test. The correlated form re-runs an average per facility — correct, but the wrong shape on a million-row book.",
      notes: [
        { choice: 0, why: "That's still correlated — moving it doesn't decorrelate it. The fix is computing the partition aggregate as its own column." },
        { choice: 2, why: "MAX collapses to one row per market — the facilities don't survive the fold, so there's nothing left to filter by comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-24",
      prompt: "A CASE classifies status into 'settled' and 'open' — no ELSE arm. A fourth status somehow lands in the table. What does the classification print for it?",
      choices: [
        "It errors — unmapped input",
        "'unknown'",
        "NULL — the row survives with a NULL label and vanishes from every named bucket",
        "Zero",
      ],
      answer: 2,
      why: "CASE without ELSE yields NULL on fall-through — the row isn't lost, it's silently unlabeled, and every branch census that sums to COUNT(*) will now come up short. The ELSE arm is the exhaustiveness guarantee, not a convenience.",
      notes: [
        { choice: 0, why: "CASE never errors on fall-through — that's precisely why the hole is dangerous. Silent NULL beats loud error only in the bug's favor." },
        { choice: 1, why: "'unknown' would require you to write it. Nothing invents labels; the engine's silence IS the finding." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-25",
      prompt: "The split-settlement watchlist: facilities carrying two or more payment rows. Why is COUNT(*) FILTER (WHERE …) over payments GROUP BY invoice the wrong grain?",
      choices: [
        "FILTER isn't supported inside GROUP BY queries",
        "It isn't — folded per invoice, a count of 2+ IS the watchlist",
        "FILTER counts NULLs",
        "You need HAVING, not FILTER, to reach 2+",
      ],
      answer: 1,
      why: "Trick question — the grain is right: GROUP BY invoice folds to one row per facility and COUNT(*) FILTER or a bare COUNT reads installments per facility. The watchlist is WHERE that folded count >= 2, i.e. HAVING COUNT(*) >= 2.",
      notes: [
        { choice: 2, why: "FILTER (WHERE …) counts matching rows like COUNT does — it skips NULLs on the counted expression, which is the same behavior as COUNT, not a bug." },
        { choice: 3, why: "Right clause, wrong complaint: the threshold 2+ does belong in HAVING after the fold — but FILTER itself was never the problem." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-26",
      prompt: "One scan of invoices must output paid / open / void counts side by side. Which is the one-pass shape?",
      choices: [
        "Three separate queries pasted into a spreadsheet",
        "COUNT(*) FILTER (WHERE status = 'paid'), … for each status",
        "GROUP BY status — that's the same thing",
        "SUM(DISTINCT status)",
      ],
      answer: 1,
      why: "FILTER (WHERE …) branches inside the aggregate: one scan, one row, one column per population. GROUP BY status produces one row PER status — a different shape, not a same-row census — and three round-trips waste the close's query budget.",
      notes: [
        { choice: 2, why: "Close, but the deliverable differs: a GROUP BY gives a row-per-bucket report; the FILTER census gives one row whose columns reconcile to COUNT(*) on sight." },
        { choice: 3, why: "SUM over text statuses is meaningless — it coerces labels to 0. Conditional counting needs CASE or FILTER, never arithmetic on text." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-27",
      prompt: "Ops wants each facility's settlement methods readable in one cell — 'card, card' for the split pairs. Which fold?",
      choices: [
        "SUM(p.method)",
        "GROUP_CONCAT(p.method, ', ') over the per-facility partition",
        "CONCAT(p.method) with DISTINCT",
        "CAST(p.method AS TEXT)",
      ],
      answer: 1,
      why: "GROUP_CONCAT is the string fold: it aggregates a text column across group rows into one comma-joined cell — 'card, card', 'wire, wire', or plain 'card'. SUM is numeric-only; CONCAT isn't an aggregate and touches one row.",
      notes: [
        { choice: 0, why: "SUM coerces text to 0 — the fold returns zeros wearing a methods name. Strings need the string aggregate." },
        { choice: 2, why: "CONCAT isn't an aggregate in SQL — it joins its arguments per row. Without GROUP_CONCAT there is no fold to stack rows into one cell." },
      ],
      difficulty: "medium",
    },
    {
      id: "cap1-mcq-28",
      prompt: "The coverage walk for a split facility shows settled cents after each installment: 243000, then 486000. Which expression produces that running column?",
      choices: [
        "SUM(amount_cents) — the plain fold",
        "SUM(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on)",
        "SUM(amount_cents) OVER (ORDER BY invoice_id)",
        "LAG(amount_cents) OVER (PARTITION BY invoice_id)",
      ],
      answer: 1,
      why: "Partition by facility, order by paid_on, and the default frame accumulates from the partition's start — a running total per facility. Drop the PARTITION and facility #2's installments pile onto facility #1's total.",
      notes: [
        { choice: 0, why: "The plain fold collapses to one row per facility — the walk needs every leg with the accumulation beside it. Windows keep rows; aggregates delete them." },
        { choice: 3, why: "LAG shows the previous leg's amount, not the accumulated position. The walk is a sum, not a lookup." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-29",
      prompt: "You need all 28 facilities WITH per-facility settled cents, NULL where unfunded. Which shape is correct?",
      choices: [
        "INNER JOIN payments p ON p.invoice_id = i.id GROUP BY i.id",
        "LEFT JOIN (SELECT invoice_id, SUM(amount_cents) s FROM payments GROUP BY invoice_id) f ON f.invoice_id = i.id",
        "LEFT JOIN payments p ON p.invoice_id = i.id, then SUM(amount_cents) GROUP BY i.id",
        "WHERE i.id IN (SELECT invoice_id FROM payments)",
      ],
      answer: 1,
      why: "Pre-aggregate the money side to one row per facility, then LEFT JOIN — one row per facility in, NULL sums where no settlement exists. Joining the raw payments and summing afterwards double-counts the five split facilities' facility-side columns.",
      notes: [
        { choice: 0, why: "The INNER join deletes the six unfunded facilities before any fold — the exposure answer dies first. Population is decided at the join, not the filter." },
        { choice: 2, why: "The money total survives, but i.amount_cents (the billed side) fans out — sum IT after this join and five facilities double-count. Pre-aggregation fixes the grain, not just the number." },
      ],
      difficulty: "hard",
    },
    {
      id: "cap1-mcq-30",
      prompt: "The rail census is ordered by the alias settled_dollars. A reviewer asks: why does the window in the exposure ladder need its own ORDER BY inside OVER (...)?",
      choices: [
        "It doesn't — the outer ORDER BY does both jobs",
        "The window's ORDER BY defines the ranking sequence inside the partition; the outer ORDER BY only sorts the final output",
        "The window ORDER BY replaces GROUP BY",
        "Both clauses must match or the query errors",
      ],
      answer: 1,
      why: "Two sorts, two jobs: the window's ORDER BY ranks rows (DESC for biggest-first ladders), the outer ORDER BY presents them. They can disagree freely — rank by dollars descending, then print alphabetically — and neither substitutes for the other.",
      notes: [
        { choice: 0, why: "Without the window ORDER BY the ranking is arbitrary — RANK over an unordered partition numbers rows by whatever order the engine visits them." },
        { choice: 3, why: "No rule ties them — in fact the classic read ranks DESC and displays ASC to put the tail on top for review. Independent clauses, independent jobs." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-capitalone-3",
      tier: "easy",
      topic: "j1",
      universe: "month-close",
      title: "The market book census",
      brief:
        "Capital One month-close brief on the storefront db: before the concentration deck ships, card ops wants the credit book split by MARKET — borrower region is the market field, and every facility rides against exactly one borrower, so the fold is a clean N:1 join from facilities to customers. Probed facts: the 28-facility book totals $86,977.00 and splits EU 14 facilities / $47,933.00, APAC 8 / $22,369.00, US 6 / $16,675.00 — the top two markets carry 22 of 28 facilities and $70,302.00 of the book, a 80.8% concentration the risk committee quotes. The deck opens with the two biggest markets only, so the census needs a biggest-first sort and a two-row cut.",
      ask: "Return the two markets carrying the most credit-book facilities: market, facility count, and book dollars (2 decimals), biggest first.",
      template:
        "SELECT c.region AS market,\n       {1}(*) AS facilities,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS book_dollars\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nGROUP BY c.region\nORDER BY book_dollars {2}\nLIMIT {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the facility counter",
          why: "COUNT(*) counts the facility rows folded into each market — 14, 8, 6, the probed census. SUM(*) doesn't exist and MAX(*) is a syntax error: only COUNT takes the star to count rows rather than fold values.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The concentration deck leads with EU's $47,933.00 above APAC's $22,369.00. ASC would open with US — the smallest market — a correct query presenting the tail of the distribution as the headline.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the top-two cut",
          why: "The ask is the top TWO markets, so LIMIT 2 keeps exactly EU and APAC — 22 of 28 facilities and 80.8% of the book. Probed: together they carry $70,302.00 of the $86,977.00 total.",
        },
      ],
      distractors: ["SUM", "ASC", "1", "3"],
      walkthrough:
        "One N:1 join, one fold, one cut. The join attaches each of the 28 facilities to its borrower's market — every facility matches, so nothing is lost — and GROUP BY region folds them into three buckets: EU 14 facilities / $47,933.00, APAC 8 / $22,369.00, US 6 / $16,675.00. COUNT(*) is the census counter and SUM(amount_cents)/100.0 the money fold, converted once at display per the house cents rule. ORDER BY book_dollars DESC puts the concentration story first and LIMIT 2 performs the business cut — EU and APAC together are 22 of 28 facilities, $70,302.00 of $86,977.00, the 80.8% the deck quotes. Flip the direction and the review opens with the quietest market; widen the cut to 3 and the 'top two' claim silently becomes the whole book — a different sentence in front of the risk committee.",
    },
    {
      id: "cs-capitalone-4",
      tier: "medium",
      topic: "t5",
      universe: "month-close",
      title: "The slippage ladder",
      brief:
        "Capital One collections brief on the storefront db: the 30-day terms clock is uniform on this book, so every day past the first settlement is real slippage — and the collections review opens with the ladder of worst offenders. Probed facts: 20 paid facilities carry settlements; first-payment latency spans 13 to 84 days with a 28.4 average, and the ladder's middle is tie-heavy — four facilities sit at 26 days and seven at 25, so ties are not an edge case, they are the body of the read. The threshold in the query keeps the 22-day-and-worse cohort: 16 facilities, ranked biggest-first with ties sharing a rung and the gap after a tie kept honest.",
      ask: "Return each paid facility with 22+ days to first settlement: facility, days, and a tie-honoring slippage rank, worst first.",
      template:
        "WITH latency AS (\n  SELECT i.id AS facility,\n         CAST(julianday(MIN(p.paid_on)) - julianday(i.issued_on) AS INT) AS days\n  FROM invoices i\n  JOIN payments p ON p.invoice_id = i.id\n  WHERE i.status = 'paid'\n  GROUP BY i.id, i.issued_on\n)\nSELECT facility,\n       days,\n       {1}() OVER (ORDER BY days {2}) AS slippage_rank\nFROM latency\nWHERE days >= {3}\nORDER BY slippage_rank, days DESC, facility;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-honoring ranker",
          why: "RANK shares rungs on ties and keeps the gap: 84 → rank 1, 55 → 2, 40 → 3, then the four 26-day facilities all rank 4 and the seven 25-day facilities rank 8 — the missing 5-7 are the tie made visible. ROW_NUMBER would split the tie arbitrarily, DENSE_RANK would erase the gap.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "Slippage ranks the LATE end first, so the window orders days descending. ASC would crown facility #5 — 13 days, the fastest payer — as the worst offender: a correct query pointing the collections queue at the wrong end.",
        },
        {
          answer: "22",
          kind: "number",
          label: "the slippage threshold",
          why: "22 days keeps the 16-facility cohort — 84 down to 22 — so both the 26-day four-way tie and the 25-day seven-way tie stay in the output and the rank behavior is visible against them. The threshold filters the CTE's rows, after the fold.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "25"],
      walkthrough:
        "Stage the fold, then rank it. The CTE folds each paid facility to its first settlement — MIN(paid_on) per facility, julianday delta to issue — producing 20 rows from 13 to 84 days; the outer query keeps the 22-and-worse cohort (16 facilities) and ranks it with the window: RANK() OVER (ORDER BY days DESC). The output shows why RANK is the collections answer: ranks run 1, 2, 3, then 4, 4, 4, 4 (the 26-day tie), then 8, 8, 8, 8, 8, 8, 8 (the 25-day tie), then 15, 16 — the gap after each tie is the honest statement that four (then seven) facilities share the rung. DENSE_RANK would print 5 where the business expects to see the size of the tie; ROW_NUMBER would number the tied facilities 4 through 7 as if the engine knew which one slipped first. Raise the threshold to 25 and the read amputates the 22- and 24-day rows — a different cohort, a different queue.",
    },
    {
      id: "cs-capitalone-5",
      tier: "medium",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass controls scan",
      brief:
        "Capital One controls brief on the storefront db: the close's query budget is one scan, and the deliverable is a single row whose columns prove the book — total facilities, settled count, open count, void count, settled dollars — with the branch census reconciling to the total on sight. Probed facts: 28 facilities total; 21 settle as paid ($66,443.00), 6 sit open, 1 is void ($925.00, the anomaly #11 that still received its money). The check the reviewer runs first: 21 + 6 + 1 = 28 — the classification has no hole. FILTER (WHERE …) branches inside each aggregate so every population is judged from the same rows in the same pass.",
      ask: "Return one row: total facilities, settled count, open-exposure count, void-review count, and settled dollars (2 decimals).",
      template:
        "SELECT COUNT(*) AS facilities,\n       COUNT(*) FILTER (WHERE i.status = {1}) AS settled,\n       COUNT(*) FILTER (WHERE i.status = 'open') AS open_exposure,\n       COUNT(*) FILTER (WHERE i.status = {2}) AS void_review,\n       {3}(i.amount_cents) FILTER (WHERE i.status = 'paid') / 100.0 AS settled_dollars\nFROM invoices i;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-bucket flag",
          why: "The paid literal fills the settled arm — 21 of 28 facilities, the probed census. Unquoted paid would be read as a column reference and error before the fold; 'open' here would swap the arms and print 6 as the settled count.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the void-review flag",
          why: "The void literal fills the anomaly arm — exactly 1 facility, the #11 row whose $925.00 arrived despite the label. 'paid' here would print 21 in the void column and the branch census would read 21 + 6 + 21 = 48 against a 28-row book.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-money fold",
          why: "SUM folds the paid facilities' cents — 6,644,300 cents printing as 66443.0 dollars after the once-at-display /100.0. COUNT would return 21/100 = 0.21, a row count wearing a dollar read; MAX would print only the largest single facility.",
        },
      ],
      distractors: ["'open'", "'paid'", "COUNT"],
      walkthrough:
        "One scan, one row, every population a column. FILTER (WHERE …) branches inside each aggregate: the same 28 invoice rows feed COUNT(*) (28), the paid arm (21), the open arm (6), and the void arm (1) — and the branch census reconciles to the total on sight, which is the identity the reviewer checks before reading any other number. The money column folds only the paid rows' cents: 6,644,300 becomes 66443.0 dollars at the display edge, per the house rule that conversion happens once. The one-row shape is the deliverable: a GROUP BY status would produce a row per bucket — fine for a detail feed, wrong for a controls line whose columns must add up in view. Swap an arm's literal and the census contradicts itself (21 in the void column, 48 branches against 28 rows); swap SUM for COUNT and the dollars become a headcount divided by a hundred — the exact class of number this bank refuses to ship.",
    },
    {
      id: "cs-capitalone-6",
      tier: "hard",
      topic: "t7",
      universe: "fraud",
      title: "The installment-gap walk",
      brief:
        "Capital One fraud-and-ops brief on the storefront db: five facilities settled in two installments (#1, 5, 12, 19, 22), and the fraud screen wants the RHYTHM of the money — how far apart the legs landed — because duplicate-leg and stair-step patterns live in the gaps, not in the totals. Probed facts, walking each pair of legs: #12 and #19 both run a 10-day gap, #1 runs 14, #5 and #22 both run 15. The first leg of every facility has no predecessor — LAG returns NULL there, and the metric (installment-to-installment only) excludes that row deliberately, leaving exactly 5 gap rows from 27 settlements. Sort the walk shortest-gap first so the tightest rhythms lead the screen.",
      ask: "Return each second installment's facility and its gap in days from the previous installment, tightest gap first.",
      template:
        "WITH legs AS (\n  SELECT invoice_id,\n         paid_on,\n         {1}(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on) AS prev_paid\n  FROM payments\n)\nSELECT invoice_id,\n       CAST(julianday(paid_on) - julianday(prev_paid) AS INT) AS gap_days\nFROM legs\nWHERE prev_paid IS NOT {2}\nORDER BY gap_days {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the predecessor reader",
          why: "LAG(paid_on) walks one row back within each facility's partition — the second leg sees the first leg's date. LEAD would read forward, hand the FIRST leg its successor's date, and print the gaps negative — the rhythm read upside down.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-predecessor filter",
          why: "IS NOT NULL keeps only rows with a real predecessor — the 5 second legs. IS NOT 0 would pass all 27 rows, because IS-comparison is null-safe and NULL IS NOT 0 is TRUE: 22 first legs would enter the walk with NULL gaps.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the tightest-first direction",
          why: "The fraud screen leads with the tightest rhythms: #12 and #19 at 10 days, then 14, then the two 15s. DESC would open with the loosest — the staircase pattern least suggestive of a duplicate-leg chase.",
        },
      ],
      distractors: ["LEAD", "0", "DESC"],
      walkthrough:
        "Windows over money, partitioned per facility. The CTE walks the 27 settlement legs with LAG(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on): each leg carries its predecessor's date, and each facility's FIRST leg carries NULL — the honest no-predecessor signal, not an error. The metric is installment-to-installment, so WHERE prev_paid IS NOT NULL keeps exactly the 5 second legs, and julianday deltas print the rhythm: 10, 10, 14, 15, 15 days — #12 (Aug 25 → Sep 4, 2024) and #19 (Nov 25 → Dec 5) tightest, #5 and #22 loosest at 15. The trap the distractors stage: IS NOT 0 looks like a defensive rewrite but IS-comparison is null-safe, so the 22 first legs survive with NULL gaps — a 27-row walk where five numbers hide among twenty-two holes. LEAD reads the future (gaps go negative); DESC presents the loosest rhythm first. One partitioned walk, and the fraud screen reads the money's tempo instead of its totals.",
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
    { slug: "bank-account-summary", why: "Per-account activity with quiet accounts kept visible — the card-side statement fold: every borrower's line, zero or not, no silent deletion." },
    { slug: "bank-account-summary-ii", why: "The two-sided account view — debits and credits per account with quiet ones kept: the statement fold card ops reads before any risk dashboard." },
    { slug: "daily-balance-interest", why: "Interest off a daily balance walk — the accrual muscle behind every card APR read: day-weighted folds where a missing day is mispriced money." },
    { slug: "loan-amortization-schedule", why: "Payment-by-payment principal/interest splits — the amortization walk Capital One's lending teams treat as table stakes: running balance, per-period fold, tie to the schedule." },
    { slug: "prepayment-detection", why: "Spot balances retired ahead of the clock — prepayment is a revenue event on a card book: which facilities paid off early, and what that does to the yield curve." },
    { slug: "loan-types", why: "Census by product type with zero-buckets printed — the product-mix read: cards vs loans vs lines, and the empty buckets a board deck must still show." },
    { slug: "portfolio-concentration-hhi", why: "Concentration via squared shares — the HHI read risk committees quote: how top-heavy the book is, in one number, with the arithmetic shown." },
    { slug: "portfolio-weights", why: "Each exposure as a share of the book — the weight column under every concentration and vintage cut: numerator, denominator, and the /100.0 discipline." },
    { slug: "transaction-velocity", why: "Hits per account per window — the intensity read card fraud teams open with: settlements per facility, spread per borrower, the two-grain census at speed." },
    { slug: "structuring-detection", why: "Amounts patterned just under a threshold — the classic screen: bins that pile up below a reporting line are a CASE-arms exercise with stakes." },
    { slug: "suspicious-bank-account-transactions", why: "Rule-based exception lists from raw money events — the fraud-analyst loop: define suspicious, filter, and defend every row that survived the rule." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Streak logic over money events — installment ladders and escalating-charge hunts: LAG comparisons and gap discipline on the settlement feed." },
    { slug: "chargeback-rate-ranking", why: "Dispute rates ranked per entity — the chargeback ladder ops reviews weekly: conditional numerator, honest denominator, ranking that respects ties." },
    { slug: "top-percentile-fraud", why: "Percentile cuts over scored events — the top-decile readout fraud models feed: NTILE/percentile windows where the boundary row is the debate." },
    { slug: "amount-anomaly-zscore", why: "Deviations from the mean in sigma units — the anomaly screen behind the split-settlement watchlist: AVG, deviation, and a threshold you can defend." },
    { slug: "usage-tier-percentiles", why: "Band placements by percentile — utilization-tier assignment at scale: CASE arms that must be exhaustive plus the percentile logic that seeds them." },
  ],
};
