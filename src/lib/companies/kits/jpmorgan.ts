// JPMorgan Chase — kit 2 of the Banking & Capital Markets domain (Batch H).
// The consumer bank meets institutional scale: card rails and deposit books on
// one side, wires and treasury operations on the other. The storefront db maps
// on honestly: payments are the settlement rails (method card / wire — card is
// the consumer read, wire the institutional one), invoices are the booked
// confirmations they clear against, ledger_entries is the double-entry ledger,
// expenses are op-cost lines on the treasury calendar. Money in those tables
// is INTEGER cents — the dollar read is always amount_cents / 100.0.
// Pool provenance: JPMorgan has 2 tagged sql rows in the band
// (countries-you-can-safely-invest-in, structuring-detection); the rest of the
// pool and topic slugs are theme-curated from company-pools.md — provenance
// stated per problem below. Case figures: scripts/company-facts.md
// (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const jpmorganKit: CompanyKit = {
  id: "jpmorgan",
  domainId: "banking",
  name: "JPMorgan Chase",
  tagline: "Consumer banking meets institutional scale",
  accent: "text-cyan-500",

  brief: [
    "JPMorgan Chase runs two businesses at once and the SQL reflects both: **Chase**, the consumer bank — branches, cards, deposits, the biggest consumer book in the country — and the institutional side, where treasury services, markets and payments move value that makes the consumer numbers look like rounding errors. The in-house data platform (**COIN**) and the blockchain rail (**Kinexys**) exist because at this scale the firm's edge is how fast a fact about money becomes a queryable fact. The interview culture follows the same split: you will be asked to fold a consumer book AND to defend an institutional control, *often in the same hour*.",
    "The data org sits close to the books of record. Every booked confirmation carries an amount the settlement rails must clear — card on the consumer read, wire on the institutional one — and every settled dollar posts twice into the double-entry ledger, debit and credit, stored as INTEGER cents with the dollar read always `cents / 100.0`. The rails reconcile to the confirmations before anything publishes: **27 settlement rows against 28 booked confirmations**, card carrying 16 of them for **37364.00** and wire 11 for **32248.00**. Op-cost lines run on a treasury calendar — 36 lines, Rent 16800.00 of a 25416.00 total, a monthly band from 1440.00 to 3210.00 — and the month's walk, this month beside last month, is the artifact treasury actually reviews.",
    "Interview style is threshold-minded and exceptions-first. Screens start with a fold — rail volumes and values, coverage classes, cost buckets by month — then escalate into a guard: a `HAVING` wall that flags counts crossing a review threshold (the {amber:structuring-detection} pattern), a CASE ladder with a boundary someone will argue about, an anti-join that defines {violet:dormancy}. The follow-ups are about denominators and edge rows: 'does that share include the partial?', 'which arm catches exactly 90 days?'. Candidates who state the filter's population and the bucket's boundary before writing SQL do well; *the interviewers have all shipped a report where a boundary was silent and it mattered*.",
    "Preparation strategy: JPMorgan has **two tagged problems** in this app's band — the country-investment ratio screen and the structuring-detection `HAVING` wall — and the rest of the pool is theme-curated to its known question families: rail folds, CASE buckets, dormancy anti-joins, month walks, LAG transitions and threshold screens (provenance stated per problem). Do the topics in order, then run the **six case studies** on the live storefront database: the {sky:two-rail settlement census} the ops review opens with, the {amber:op-cost calendar walk} treasury runs every month, the account-level ledger proof the close signs, the one-pass confirmation census, the structuring wall, and the two-rail concentration board — then re-run each a week later from a blank editor, *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the follow-up question tests.",
  ],

  dayInLife: [
    "**08:30 —** the day opens on the rails dashboard. Overnight settlements post in two streams — **card**, the consumer read, and **wire**, the institutional one — and the first queries reconcile both against the booked confirmations they clear: 27 rail hits against 28 bookings, zero orphans, and the coverage exceptions (one partial cover at 4000.00 of 6148.00, six confirmations with no rail hit at all) classified before the ops standup. The morning read is a pair of numbers per rail — count and value, **16 and 37364.00** on card, **11 and 32248.00** on wire — because volume is load and value is exposure, and the ops floor manages them with different muscles.",
    "**11:30 —** midday is exceptions and threshold work. The {amber:structuring}-style screens run: fold the small-ticket counts, judge them against the review wall in `HAVING`, route the flags. The {violet:dormancy} anti-join refreshes — which books show no activity this cycle — and the CASE bucket ladders rebuild with their boundaries documented, because the account at exactly **90 days** is the one the review argues about.",
    "**14:30 —** then the treasury walk takes its hour. 36 op-cost lines folded onto the `'%Y-%m'` spine, `LAG` parking last month beside this one, the 2024-08 peak of **3210.00** explained in one sentence before anyone asks. Each query ships with its definition attached — the wall's threshold, the bucket's operator, the walk's window order — because *a number without its definition is a rumor at this firm too*.",
    "**17:00 —** the afternoon closes with stakeholders on both sides of the bank. The consumer teams want the card book's cost lines by category and month; the institutional side wants the wire coverage pack and the exception queue {amber:aged} against terms. There are rituals: a weekly ops review where every rail number carries its query, a cost review where the walk's deltas are pre-annotated, and a standing rule that the display layer never launders a NULL into a zero the business will act on. The rhythm to internalize: *fold, guard, walk, defend* — and know which clause each step lives in.",
  ],

  metrics: [
    { name: "Card spend", what: "The consumer rail's volume and value — 16 settlements for 37364.00 here. Count is load on the card network, value is consumer exposure; the review reads them as a pair." },
    { name: "Wire value", what: "The institutional rail's settled value — 11 settlements for 32248.00. Fewer, larger movements: the rail where a single row moves consumer-scale money." },
    { name: "Rail coverage", what: "Settlements that reconcile to booked confirmations — 27 of 27 rail hits attached, with the exception queue (1 partial at 4000.00 of 6148.00, 6 untouched at 15217.00) aged and owned." },
    { name: "Op-cost run rate", what: "Monthly operating cost against its band — 1440.00 to 3210.00 across the 14-month calendar, Rent carrying 16800.00 of the 25416.00 total. The number treasury defends line by line." },
    { name: "MoM cost delta", what: "This month's cost beside last month's, from a LAG walk over the '%Y-%m' spine. The 2024-08 step-up (+1416.00 against July) is the kind of move the walk exists to surface." },
    { name: "Threshold flags", what: "Counts that cross a review wall — the structuring-detection pattern: fold, then HAVING. Every flag ships with its threshold printed beside it." },
    { name: "Dormancy count", what: "Books with no activity this cycle — the anti-join population. Dormant is not closed: the count decides outreach, not write-offs, and the definition (zero rows, not zero dollars) is the metric." },
    { name: "Precision index", what: "Cents-vs-dollars integrity across consumer reports — integer cents in, /100.0 reads out, ROUND at the edge. The cross-foot that catches a 373.64 where the card book meant 37364.00." },
  ],

  topics: [
    {
      name: "Folds on the consumer book",
      why: "The consumer read starts with GROUP BY folds: activity per account, spend per month, counts per bucket. JPMorgan screens drill the two-grain habit early — volume (COUNT(*)) and value (SUM of cents, read in dollars) are different numbers about the same rows, and the interviewer listens for which one you are quoting.",
      slugs: ["number-of-rich-customers", "monthly-transactions-i", "unique-orders-and-customers-per-month", "deferred-revenue", "maximum-transaction-each-day", "transaction-velocity"],
    },
    {
      name: "Rails and confirmations joins",
      why: "Every settlement must reconcile to a booked confirmation, so the join is a control before it is an enrichment. The two-table fold — rails folded beside the books they clear — is the opening query of the ops review, and its cardinality (many-to-one) is the reason the totals survive it.",
      slugs: ["bank-account-summary-ii", "employee-bonus", "combine-two-tables", "duplicate-charge-pairs", "keep-latest-dedupe", "circular-transfers"],
    },
    {
      name: "CASE buckets: coverage and delinquency",
      why: "Bucket ladders are everywhere in consumer banking: coverage classes (exact / partial / none), aging buckets, spend tiers. The skill is boundary discipline — first matching arm wins, the ELSE arm is exhaustiveness, and the account sitting exactly on a boundary is the one the review argues about.",
      slugs: ["count-salary-categories", "delinquency-buckets", "loan-types", "credit-utilization-bands", "expected-credit-loss", "delinquency-roll-rates"],
    },
    {
      name: "Dormancy anti-joins",
      why: "Dormancy is 'no activity rows', not 'zero activity' — an anti-join definition. LEFT JOIN plus IS NULL on the join key (and its NOT EXISTS twin) is the shape, and the classic WHERE-placement trap that silently converts it to an INNER is the bug this screen exists to catch.",
      slugs: ["customers-who-never-order", "dormant-reactivation", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Statement-cycle date math",
      why: "Statement cycles run on calendar months and the '%Y-%m' key is the spine. Screens probe the edges: half-open intervals that keep the cycle's last day, SUBSTR versus STRFTIME on TEXT dates, and the weekday and window filters that decide what a 'cycle' even contains.",
      slugs: ["friday-purchases-i", "the-latest-login-in-2020", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Running balances and walks",
      why: "Deposits and cost books are read as walks: running balance per account, cumulative spend per month. Window running sums with explicit frames — and the frame discipline that keeps same-timestamp rows from double-counting — is the daily muscle here.",
      slugs: ["account-balance", "restaurant-growth", "running-total-for-different-genders", "balance-rollforward", "loan-amortization-schedule", "trial-balance-check", "daily-balance-interest"],
    },
    {
      name: "LAG and LEAD state transitions",
      why: "Movement analysis is LAG/LEAD work: month-over-month deltas, transaction-to-transaction checks, status flips between cycles. The window's ORDER BY is the direction of time and the display's ORDER BY is not — screens love the gap between the two.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "second-day-confirmation", "growth-accounting", "second-most-recent-activity", "monthly-transactions-ii", "suspicious-bank-account-transactions"],
    },
    {
      name: "Rates with honest denominators",
      why: "Acceptance rates, coverage shares, utilization — consumer banking is ratios, and ratios here are 100.0-before-division discipline. The denominator's population is decided before the ratio exists; integer division that prints 0 is the classic shipped bug.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest", "chargeback-rate-ranking", "risk-based-pricing", "portfolio-concentration-hhi"],
    },
    {
      name: "HAVING walls and threshold screens",
      why: "The structuring-detection pattern is the firm's signature screen: fold small-ticket counts per customer, then judge the fold against a review wall in HAVING. WHERE cannot see the count, ON fires pre-fold, and the wall's threshold is a printed constant someone signed off on.",
      slugs: ["structuring-detection", "customer-order-frequency", "managers-with-at-least-5-direct-reports", "value-at-risk", "wash-trade-detection", "countries-you-can-safely-invest-in"],
    },
    {
      name: "KYC-grade text hygiene",
      why: "Consumer data arrives messy — names in ALL CAPS, emails with free-text noise — and a join on a dirty key is a silent fan-out or a silent miss. Screens warm up with SUBSTR/UPPER/TRIM reshaping because 'know your customer' begins with 'match your customer'.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "find-all-unique-email-domains"],
    },
  ],

  theory: [
    {
      id: "jpm-t1",
      q: "Card and wire live in one payments table. Fold the rails for the ops review — and tell me what each rail's pair of numbers means.",
      a: "One GROUP BY, two rows, four numbers with two meanings each. SELECT method, COUNT(*), SUM(amount_cents)/100.0 folded per rail reads card 16 / 37364.00 and wire 11 / 32248.00. The COUNT is load — how many settlements the rail processed, the number that sizes ops queues — and the SUM is exposure — what value moved, the number the risk side defends. They are different metrics about the same rows and the review reads them as a pair; quoting one and calling it 'rail volume' is how value gets discussed in unit-less meetings. The fold also carries a built-in cross-check: 37364.00 + 32248.00 = 69612.00, which must equal the cash account's debit side in the ledger — if the rails and the books disagree, the fold's input population is wrong, not the ledger. And the units rule rides along: the column stores integer cents, the /100.0 happens inside the fold, and 373.64 — a row count divided by a hundred — is the signature of someone who divided the wrong aggregate.",
      tag: "aggregation",
    },
    {
      id: "jpm-t2",
      q: "Dormancy is 'accounts with no activity this cycle'. LEFT JOIN or INNER — and where does the activity filter go?",
      a: "LEFT, and the activity predicate goes in the ON clause — this is the question's whole point. The dormant population IS the unmatched population: accounts LEFT JOINed to activity that returns no rows carry NULL activity columns, and WHERE activity_id IS NULL names them. Put the activity filter in WHERE instead — WHERE activity_date >= cycle_start — and every NULL-payload row fails the comparison (NULL >= anything is UNKNOWN), the LEFT JOIN silently becomes an INNER, and the dormancy report ships with zero dormant accounts on the exact day the review needed them. The two honest shapes: keep the filter in ON (ON a.account_id = b.account_id AND b.date >= cycle_start) so the LEFT-ness survives, or wrap the filtered activity in a derived table and anti-join against that. The consumer-bank stakes are real: dormant is not closed — the count drives outreach and escheatment timelines — so a definition that quietly excludes its own population is a control failure. Say the survival rule out loud: who survives this join, and where does each filter live.",
      tag: "joins",
    },
    {
      id: "jpm-t3",
      q: "Treasury wants month-over-month deltas on the op-cost calendar. LAG or LEAD — and where does the window's order come from?",
      a: "LAG, over the calendar order — and the two ORDER BYs in the query are different objects. The window's ORDER BY defines the direction of time: LAG(SUM(amount_cents)) OVER (ORDER BY month_key) reaches one bucket back and parks last month beside this one, so the delta is current minus LAG and the first month carries NULL — the honest 'no prior'. LEAD points forward: it computes next month and labels it 'prior', flipping every delta's sign and sending the review chasing phantom swings. The trap that catches seniors: the display's ORDER BY is independent. ORDER BY month DESC prints the walk newest-first while the window still walks oldest-first — the numbers are right and the read is disorienting, which is why the window's ORDER BY is written out in full, never inherited, never abbreviated to position. On the '%Y-%m' spine the buckets sort as a calendar (year-first, zero-padded), the LAG pairs are the 14 months of the book, and the peak month's delta — 3210.00 against 1794.00 — is the sentence the walk exists to produce. Window order is time; display order is layout. Confusing them is not a style bug.",
      tag: "windows",
    },
    {
      id: "jpm-t4",
      q: "The structuring wall: flag customers whose small-ticket count crosses the review threshold. WHERE or HAVING — and why does the compiler care?",
      a: "HAVING, because the threshold judges a folded count — a group-level fact that does not exist until GROUP BY runs. The pipeline order is the explanation: FROM builds rows, WHERE filters rows pre-fold (WHERE COUNT(*) >= 5 fails to compile — aggregates have no meaning row-by-row), GROUP BY folds, HAVING judges the folded groups, SELECT projects, ORDER BY displays. The structuring screen is exactly this shape: filter the small tickets in WHERE (cheap, row-level — date window, channel), GROUP BY customer, then HAVING COUNT(*) >= wall so only the populations that crossed the threshold survive. The consumer-bank nuance worth saying: the wall's threshold is a printed, owned constant — it belongs in the query as a literal with a comment, not in someone's memory. And the anti-pattern to name: bolting the threshold into the join's ON clause, which fires pre-fold per row pair and filters the wrong population entirely. The interviewer is testing whether you know WHEN each fact becomes true in the engine — because that is when it can be judged.",
      tag: "pipeline",
    },
    {
      id: "jpm-t5",
      q: "First-deposit cohort: customers whose FIRST transaction landed in the promo window. What subquery shapes get you there, and what breaks each one?",
      a: "Three shapes, one trap. The IN shape: WHERE customer_id IN (SELECT customer_id FROM txns GROUP BY customer_id HAVING MIN(txn_date) >= promo_start) — fold first-transaction dates per customer, then membership-test them; readable and set-shaped. The EXISTS/NOT EXISTS shape: customers with a txn in the window AND NO txn before it — two membership tests instead of one fold; it survives NULLs better and scales differently. The correlated scalar: txn_date = (SELECT MIN(txn_date) FROM txns t2 WHERE t2.customer_id = t.customer_id) — 'this row IS their first txn' — re-runs per outer row and is the clearest to read and the most expensive to run. The shared trap: the scalar shape is contractually 0-or-1 rows, and an empty inner fold yields NULL — the comparison is UNKNOWN and the cohort silently empties on staging data where the customer has no txns yet. Tie-handling is the follow-up: two txns on the same first date are both 'first', so the IN and EXISTS shapes return the customer once while the correlated shape can return two rows — dedupe or accept it, but say it. Cohort definitions are denominators for the promo's entire ROI story; the shape that quietly changes the population changes the story.",
      tag: "subqueries",
    },
    {
      id: "jpm-t6",
      q: "Statement cycles run on calendar months. Build the month key, the cycle-over-cycle delta, and keep February whole while you do it.",
      a: "The key is STRFTIME('%Y-%m', txn_date) — year-first, zero-padded: '2025-02'. That string sorts as a calendar, which is what makes every walk and every GROUP BY on this spine trustworthy. The alternatives fail in instructive ways: '%m-%Y' prints '02-2025' and string order sorts '01-2025' before '02-2024' — the walk reads backwards across the year boundary; SUBSTR(txn_date, 6, 2) is a bare month and merges Februaries across years; and on TEXT timestamps the half-open interval is the boundary discipline — txn_date >= '2025-02-01' AND < '2025-03-01' keeps February's last day whole, while BETWEEN '2025-02-01' AND '2025-02-28' drops the evening of the 28th, which on a card book is the dinner rush. The delta is LAG over the same key, computed once, rounded once. And the population statement rides on top: this cycle's fold counts POSTED activity — pending authorizations are a different table and a different metric. Date conventions are definitions here; the month key is the smallest unit of trust in a consumer report.",
      tag: "dates",
    },
    {
      id: "jpm-t7",
      q: "Dormant accounts show NULL balances after the LEFT JOIN; the letter campaign wants 0.00. Where does COALESCE belong, and where must it never go?",
      a: "COALESCE is a display decision: wrap the SELECT expression at the report's edge — COALESCE(balance, 0.00) — so the letter prints a number while the pipeline above keeps NULL, the honest 'no activity this cycle'. What must never happen is coalescing mid-pipeline: WHERE COALESCE(cnt, 0) > 0 confuses 'no rows' with 'zero-valued rows' — two populations the bank keeps apart, because one is outreach and the other is a data-quality question — and a COALESCE'd count that flows into a ratio silently changes the denominator's population. The companion guard is NULLIF for division: balance / NULLIF(months, 0), so an empty-tenure row yields NULL (the honest gap) instead of a database-specific zero-or-error. The discipline the interviewer wants stated: NULL means unknown-or-absent and survives until the display edge; 0 means measured-zero and is a claim about the world. The letter campaign can print 0.00; the pipeline that computed it never lost the distinction. At this firm that sentence is the difference between a report and a rumor.",
      tag: "nulls",
    },
    {
      id: "jpm-t8",
      q: "Money is stored as integer cents here. Walk me through every place a precision bug can enter a consumer-bank report.",
      a: "Five doors, one policy. Integer division: amount_cents / 100 truncates — 92500 happens to survive, 486150 prints 4861 and the report is half a dollar light on every odd-cent row; the read is / 100.0, the .0 promoting real arithmetic at the first operation. Unit swaps: dividing a COUNT by 100 because the SUM nearby did — 373.64 where the card book meant 37364.00 — is the signature of copy-pasted arithmetic with the wrong aggregate. Ordering: ROUND only at the display edge; rounding per row then re-summing compounds the drift, and shares computed from rounded parts no longer sum to 100. Population: the fold's denominator decided before the ratio exists — partial covers (4000.00 of 6148.00) in or out of the coverage rate is a definition, printed beside the number. Cross-footing: the cheap test that catches all of it — card 37364.00 plus wire 32248.00 must equal the ledger's cash debit side of 69612.00, and the trial balance's 181080.00-equals-181080.00 proof must hold underneath. The policy: integer cents end to end, one conversion at the edge, one rounding at the edge, and a cross-foot on every report that money will move on. A candidate who enumerates the doors is describing the controls this firm actually runs.",
      tag: "quality",
    },
    {
      id: "jpm-t9",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — run all three on the confirmations-joined-to-legs result and tell me what each number means.",
      a: "Four numbers, four different books, one query. Confirmations LEFT JOIN legs returns 33 rows: 27 matched pairs plus the 6 no-leg confirmations carrying NULL payloads. COUNT(*) reads 33 — rows in the result, matched or not. COUNT(p.id) reads 27 — the legs that exist; NULL payloads are invisible to it. COUNT(DISTINCT p.invoice_id) reads 22 — the confirmations the rails actually covered. COUNT(DISTINCT i.id) reads 28 — the whole booked book. The ops review misquotes any of these under the wrong name: '27 confirmations settled' is wrong twice over (27 is legs; 22 is covered confirmations), and the 6-row gap between COUNT(*) and COUNT(p.id) is exactly the receivables watchlist. A candidate who says 'which grain does each form count' out loud is describing the reconciliation, not just syntax.",
      tag: "aggregation",
    },
    {
      id: "jpm-t10",
      q: "The concentration board ranks settlement legs per rail. ROW_NUMBER, RANK or DENSE_RANK — and what does each do to a tie?",
      a: "ROW_NUMBER deals every row a distinct number and breaks ties by whatever the engine chose — deterministic on today's plan, different after a stats refresh, which on a risk board means the crowned counterparty can swap between reruns. RANK gives tied rows the same rung and then skips: two legs tied at the top both read rung 1 and the next reads 3 — honest about the tie, gappy beneath it. DENSE_RANK packs ties with no gaps: 1, 1, then 2 — the tier function when the report counts tiers rather than positions. The house rule is not the function; it is the declared policy: partition by rail, order by amount DESC, and pin a deterministic tiebreaker (leg id) inside the window so the rerun reproduces the board row for row. A board that reshuffles overnight is not a ranking choice — it is a finding.",
      tag: "windows",
    },
    {
      id: "jpm-t11",
      q: "The nostro replay steps the cash account leg by leg, and two legs batch-posted at the same timestamp. What does the default window frame do to the walk, and which frame fixes it?",
      a: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY ties as peers: both same-timestamp legs enter the running balance together, so the replay prints one combined jump where the ledger posts two — and the replay stops matching the books a re-run of the cash fold would produce. The fix is the frame keyword: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW accumulates row by row, every leg moves the balance once, and the walk ties to the ledger line by line. The expert answer states the contract first — one row, one balance step — and lets the frame follow; ties are routine when rails batch-post, so the keyword is load-bearing, not style. Same discipline on any running SUM here: the deposits book's balance walk and the op-cost cumulative both name their frame explicitly.",
      tag: "windows",
    },
    {
      id: "jpm-t12",
      q: "The month packet stacks the settled fold and the unsettled fold into one result with a source label. UNION or UNION ALL — and what does the wrong pick cost?",
      a: "UNION ALL, always, for this packet. The branches are disjoint by construction — one filters legs that exist, one filters confirmations with none — so a dedupe pass buys nothing and risks plenty: a bare UNION collapses byte-identical rows across branches, and two months with identical counts and values are a coincidence, not a duplicate. The loss announces itself nowhere — the packet just foots short, and the cross-foot against the ledger fails an hour later with no hint which branch ate the row. The shape that ships: each branch carries a literal label column ('settled' / 'unsettled') so every row self-identifies, matching column lists written side by side for visual diffing, and UNION ALL as the glue. Reach for bare UNION only when you can say out loud which duplicated rows you are paying to collapse — at this firm that sentence is usually the sign you are deduping evidence.",
      tag: "set-ops",
    },
    {
      id: "jpm-t13",
      q: "Fraud ops wants each counterparty's LATEST settlement leg. Sketch the correlated-scalar version, then say what you would ship instead.",
      a: "The correlated form reads clean: WHERE p.paid_on = (SELECT MAX(p2.paid_on) FROM payments p2 JOIN invoices i2 ON i2.id = p2.invoice_id WHERE i2.customer_id = i.customer_id) — 'this row IS their latest leg'. It re-evaluates the inner MAX once per outer row, which is fine at demo scale and dies at book scale. What I ship: a derived table folding the latest paid_on per counterparty once (GROUP BY customer_id), joined back one-to-one — set-based, one pass over payments. The follow-up that separates candidates is ties: two legs on the same latest date both satisfy the join-back and the correlated form, so the counterparty appears twice in the 'latest' report; ROW_NUMBER() OVER (PARTITION BY customer ORDER BY paid_on DESC, p.id) with a deterministic tiebreaker returns exactly one. Say which behavior you shipped — 'latest, ties both' and 'latest, one row' are different deliverables the desk will ask for by name.",
      tag: "subqueries",
    },
    {
      id: "jpm-t14",
      q: "Duplicate charges: same counterparty, same cents, same day. How do you detect them, dedupe them, and how do you avoid deleting the legitimate split plans?",
      a: "Detect with a fold: GROUP BY counterparty, amount_cents, paid_on and HAVING COUNT(*) > 1 — the grouping key IS the duplicate definition, so state it before writing it. Dedupe with the window pattern: ROW_NUMBER() OVER (PARTITION BY counterparty, amount_cents, paid_on ORDER BY p.id) numbers each duplicate group, and you keep rn = 1 — the earliest leg — never deleting both copies. The trap that matters here: the five split-plan receivables carry two legs each, and they are NOT duplicates — different amounts, different timestamps, one client arrangement. Partition on the full natural key and the splits survive with rn = 1 and rn = 2; partition on counterparty alone and the dedupe eats half the split legs, which is a reconciliation break you created yourself. The alert queue and the books stay honest only if the definition and the partition key are the same sentence.",
      tag: "windows",
    },
    {
      id: "jpm-t15",
      q: "The break desk pairs claims with evidence using EXCEPT. Build both directions and say why set grain keeps the counts honest.",
      a: "Two folds, two mirrors. The claims fold: SELECT id FROM invoices WHERE status = 'paid' — confirmations that promise settlement. The legs fold: SELECT DISTINCT invoice_id FROM payments — confirmations the rails actually touched. Claims EXCEPT legs hands back the paid-with-no-leg population (the 1756.00 confirmation whose status promises money the rails never moved); legs EXCEPT claims hands back cash that moved with no live claim (the void confirmation's 925.00 leg). Set grain is the quiet win: EXCEPT deduplicates both inputs first, so the five split plans — two legs each — cannot fan the counts, and the result is one row per confirmation no matter how many legs it drew. EXCEPT is also NULL-safe where NOT IN empties the queue on one stray NULL — and an empty break queue at a bank reads as peace when it is blindness. The pair ships together, quantified, routed to the desk that owns each direction.",
      tag: "set-ops",
    },
    {
      id: "jpm-t16",
      q: "The rails scan is slow. Walk me through making the predicates sargable and the query cheap.",
      a: "Sargable means the predicate compares the bare column to a value so an index can serve it. The monthly-bucket habit — SUBSTR(paid_on, 1, 7) = '2025-01' — wraps the column in a function and forces a scan of every settlement row; the sargable twin is the half-open range paid_on >= '2025-01-01' AND paid_on < '2025-02-01', same rows, index-usable. The habits that compound on top: filter early inside each CTE so later folds carry fewer rows (the small-ticket definition belongs in WHERE before the GROUP BY, not after it); name columns instead of SELECT * so payloads you never read stop crossing the wire; probe with LIMIT before committing to the full fold; and aggregate on the smallest table that answers the question rather than joining first and filtering after. On the rails these are not micro-optimizations — they are the difference between the overnight reconciliation finishing and the ops standup starting blind.",
      tag: "performance",
    },
    {
      id: "jpm-t17",
      q: "Walk me through the logical evaluation order of a SELECT — and name the artifact each stage violation breaks here.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING judges the folds; SELECT computes output expressions including windows; ORDER BY sorts; LIMIT cuts. Every classic screen bug is a stage violation wearing a report's name: an aggregate in WHERE — the structuring wall written as WHERE COUNT(*) >= 5 — fails to compile because folds do not exist yet; a SELECT alias referenced in WHERE — the coverage share filtered by settled_pct — fails because aliases are born in SELECT; a window result filtered in WHERE — the whale board trimmed with WHERE rung <= 2 inline — fails because windows compute in the SELECT stage, so the board stages in a CTE and filters outside. The flip side: ORDER BY CAN use SELECT aliases because it runs after them. The narration is the interview answer — say where each fact becomes true in the engine, because that is the only moment it can be judged.",
      tag: "pipeline",
    },
    {
      id: "jpm-t18",
      q: "The deck quotes an 'average settlement' per rail and then averages the two rails' numbers. Why is that wrong, and what do you compute instead?",
      a: "Because it weights every group equally regardless of size. Card averages 37364.00 over 16 legs — 2335.25 per leg; wire averages 32248.00 over 11 — 2931.64. Averaging those two numbers prints 2633.45, which describes a book where card and wire carry equal weight. They do not: the true blended average over all 27 legs is 69612.00 / 27 = 2578.22, where wire's bigger legs pull harder precisely because the fold weights by legs, not by rails. The honest blends: re-aggregate from the base rows (SUM of values divided by SUM of counts) or a weighted average — SUM(rail_avg * rail_count) / SUM(rail_count) — the same arithmetic one level up. The interview move is naming WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and on two rails with 16 and 11 legs that claim is false on its face.",
      tag: "aggregation",
    },
    {
      id: "jpm-t19",
      q: "The mismatch report runs WHERE p.amount_cents <> i.amount_cents and the no-leg confirmations vanish. Explain the three-valued logic and the fix.",
      a: "SQL predicates return TRUE, FALSE, or UNKNOWN, and WHERE keeps only TRUE. A no-leg confirmation's p.amount_cents is NULL after the LEFT JOIN, and NULL <> anything evaluates to UNKNOWN — so the row fails the filter and the 15217.00 of never-collected confirmations silently exits the mismatch report, the one report whose job is to list them. The same logic empties the NOT IN anti-join when the subquery carries one NULL, and drops rows from WHERE status <> 'cancelled' when status itself is NULL. The fixes, in order of honesty: IS DISTINCT FROM — p.amount_cents IS DISTINCT FROM i.amount_cents is TRUE when exactly one side is NULL; an explicit OR arm — OR p.id IS NULL — that names the no-leg population; or split the report into the matched-mismatch and the anti-join watch. The rule the desk prints: a comparison against NULL is a question with no answer, and a control built on unanswered questions is a blind control.",
      tag: "nulls",
    },
    {
      id: "jpm-t20",
      q: "A teammate's rail report returns sane-looking rows only because of a SELECT DISTINCT. When is DISTINCT a bug report?",
      a: "When it is papering over a fan-out nobody diagnosed. The tell: confirmations joined to legs returning 33 rows, DISTINCTed down to 28 that look clean — while the SUM beside them still double-counts every split leg and the coverage share still divides by the wrong denominator. The honest sequence when you see a DISTINCT: remove it, count what comes back (33 versus 28 — the jump IS the fan-out), find the multiplicity with GROUP BY the key HAVING COUNT(*) > 1, and fix the join or pre-aggregate — fold the legs per confirmation first, then join one-to-one. Legitimate DISTINCT exists here: collapsing the rail name set (card, wire) or the account list in the ledger — a dimension's value set, not a fact's rows. The test is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query, and the reviewer will file it again in the pack review.",
      tag: "joins",
    },
    {
      id: "jpm-t21",
      q: "Give me three ways to answer 'the biggest settlement leg per counterparty' — and how each behaves on ties.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY counterparty ORDER BY amount_cents DESC, p.id) = 1 inside a CTE — exactly one row per counterparty even when two legs tie, because the second key breaks the tie deterministically. Join-back on the maximum: fold MAX(amount_cents) per counterparty in a derived table, join back — honest, but it returns BOTH tied legs, which is either a feature (report co-leaders) or double-counted counterparties depending on the ask. Correlated filter: WHERE amount_cents = (SELECT MAX(…) for that counterparty) — the same tie behavior as the join-back with per-row re-evaluation cost. On this book the easy case is a counterparty like Alice Chen with many legs of different sizes; the tie case is where the three shapes diverge, and naming the divergence — ROW_NUMBER decides, join-back reports, correlated simplifies — is the complete answer. Risk boards want the ROW_NUMBER contract stated out loud: one row, declared tiebreak, reproducible rerun.",
      tag: "windows",
    },
    {
      id: "jpm-t22",
      q: "Settlement latency feeds a consumer report. How do you compute elapsed days, and why are half-open intervals the boundary policy?",
      a: "Elapsed days are julianday arithmetic: julianday(paid_on) - julianday(issued_on) parses both TEXT dates into fractional day numbers, so a leg that cleared in 2.5 days prints 2.5 — raw TEXT subtraction coerces each string's leading number (the year) and lands near zero, which is the bug you are avoiding, not a slow path. The boundary policy is half-open ranges: issued_on >= '2025-01-01' AND issued_on < '2025-02-01' keeps every moment of January including the last evening, with no BETWEEN judgment call — BETWEEN '2025-01-01' AND '2025-01-31' string-compares and drops everything after midnight on the 31st, which on a card book is the dinner rush. The discipline the reviewer grades: state the boundary policy before writing the WHERE clause, because date bugs are almost never function bugs — they are boundary bugs, and the disputed transactions live exactly on the boundaries.",
      tag: "dates",
    },
    {
      id: "jpm-t23",
      q: "The ops review asks for 'our coverage rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator's population — confirmations with at least one settlement leg (22 of 28 on this book), which counts the partial 4000.00-of-6148.00 as covered because legs exist; the denominator — all booked confirmations including the void (28), or live confirmations only (27), and the two definitions disagree by exactly the row the review argues about; the evidence rule — coverage is a rail hit, never the status column, because status is the claim and the legs are the proof; and the window — this cycle, lifetime, or since issue. Then the discipline move: encode the definition as a named CTE — covered AS (SELECT DISTINCT invoice_id FROM payments) — so the SQL IS the definition and the reviewer audits it instead of arguing with you. The number ships with its definition printed beside it: '22 of 28 booked confirmations carry at least one leg; partials count as covered; voids in the denominator'. A rate without that sentence is a rumor.",
      tag: "metrics",
    },
    {
      id: "jpm-t24",
      q: "The rails dashboard moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(paid_on) per rail — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's settlement count versus the trailing average, because a half-loaded rail halves every downstream number, and the card-versus-wire split tells you which side to page. Keys: GROUP BY counterparty, amount, paid_on HAVING COUNT(*) > 1 for pipeline-retry duplicates — the charge-double that inflates the wire fold. Orphans: the FULL OUTER orphan check, settlements with no confirmation and confirmations with no settlement — the both-directions control. NULL spikes: COUNT(amount_cents) versus COUNT(*) on the joined book — a column that went 0% to 40% NULL will empty every conditional count built on it, and the no-leg watchlist is the first casualty. On this storefront that ritual is exactly how the paid-no-leg confirmation (#28, 1756.00) surfaces: status says paid, leg rows say zero. The deliverable is not 'it looks fine' — it is which check passed, when, and on what population.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "jpm-mcq-1",
      prompt: "The ops review needs each rail's volume and value. Which fold prints card 16 / 37364.00 and wire 11 / 32248.00?",
      choices: [
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM payments GROUP BY method",
        "SELECT method, SUM(*), ROUND(COUNT(amount_cents)/100.0, 2) FROM payments GROUP BY method",
        "SELECT method, COUNT(*) FROM payments WHERE method",
        "SELECT method, COUNT(*), SUM(amount_cents) FROM payments",
      ],
      answer: 0,
      why: "GROUP BY method folds the two rails; COUNT(*) reads volume (16, 11) and SUM(amount_cents)/100.0 reads value in dollars (37364.00, 32248.00). Count and value, one pass, one fold.",
      notes: [
        { choice: 1, why: "SUM(*) is not SQL, and COUNT(amount_cents)/100.0 divides a ROW COUNT by 100 — '16' would print as 0.16. The aggregates are swapped; the units follow them." },
        { choice: 2, why: "WHERE method compares a column to itself and no value is given — the statement is malformed. Filters need a predicate, not a column name." },
        { choice: 3, why: "No GROUP BY: the fold collapses all 27 rows into one rail-less row. The rails disappear exactly when the review needs them." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-2",
      prompt: "Settlements join confirmations many-to-one (each settlement sits on one booking). What does the join do to the card rail's 37364.00 total?",
      choices: [
        "Doubles it — joins always fan out",
        "Leaves it at 37364.00 — each settlement matches exactly one confirmation",
        "Halves it — the join deduplicates",
        "NULLs it — cross-table SUMs are illegal",
      ],
      answer: 1,
      why: "Fan-out needs many-to-many. Here each settlement row matches exactly one confirmation, so the fold's input is unchanged: card still sums 37364.00. The dangerous direction is the reverse join — confirmations to settlements fans split bookings to two rows each.",
      notes: [
        { choice: 0, why: "'Joins always fan out' is the instinct this question exists to break — cardinality and direction decide, not the JOIN keyword." },
        { choice: 2, why: "Joins never deduplicate. INNER merely drops non-matches; with referential integrity there are none to drop." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-3",
      prompt: "A coverage CASE reads: WHEN days_late >= 90 THEN '90+' WHEN days_late >= 31 THEN '31-89' ELSE 'current' END. An account sits at exactly 90 days. Where does it land — and what would re-bucket it?",
      choices: [
        "'31-89' — only a swapped arm order would move it",
        "'90+' — first matching arm wins; swapping >= to > on the first arm is what would move it",
        "NULL — boundary values belong to no arm",
        "'current' — CASE evaluates all arms and takes the last match",
      ],
      answer: 1,
      why: "CASE returns the FIRST true arm in written order: 90 satisfies days_late >= 90 and stops. The silent re-bucketing bug is the boundary operator — >= versus > on the first arm shifts exactly the boundary accounts (90, 60, 30) into the wrong bucket.",
      notes: [
        { choice: 0, why: "Arm order is top-down; the 31-89 arm never sees a 90. What moves boundary accounts is the operator, not the order." },
        { choice: 2, why: "CASE with a terminating ELSE has no NULLs — 90 matches the first arm and stops there." },
        { choice: 3, why: "CASE is first-match, not last-match. The ELSE arm exists precisely for everything the WHENs missed." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-4",
      prompt: "spent_on is TEXT like '2025-01-17'. Which expression builds the calendar spine key '2025-01'?",
      choices: [
        "STRFTIME('%Y-%m', spent_on)",
        "SUBSTR(spent_on, 6, 7)",
        "STRFTIME('%m-%Y', spent_on)",
        "MONTH(spent_on)",
      ],
      answer: 0,
      why: "'%Y-%m' prints year-first, zero-padded: '2025-01' — the key that sorts as a calendar and folds 36 lines into 14 buckets. This is the spine every month walk here rides.",
      notes: [
        { choice: 1, why: "SUBSTR(spent_on, 6, 7) grabs 7 characters from position 6 — '01-17' plus overflow. The month alone is SUBSTR(spent_on, 6, 2), and a bare month loses the year." },
        { choice: 2, why: "'%m-%Y' prints '01-2025' — and string order sorts '01-2025' before '02-2024'. The walk would read backwards across the year boundary." },
        { choice: 3, why: "There is no MONTH() in SQLite. STRFTIME, SUBSTR and friends are the toolkit — portability is part of the answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-5",
      prompt: "The treasury walk shows each month's spend beside the PRIOR month's. Which window does that?",
      choices: [
        "LAG(SUM(x)) OVER (ORDER BY month)",
        "LEAD(SUM(x)) OVER (ORDER BY month)",
        "LAG(SUM(x)) OVER ()",
        "SUM(x) OVER (ORDER BY month)",
      ],
      answer: 0,
      why: "LAG reaches one row back in the window's order — the prior month rides beside the current one. The window's ORDER BY is the calendar; the first month carries NULL, the honest 'no prior'.",
      notes: [
        { choice: 1, why: "LEAD points forward — next month mislabeled as prior. Every delta flips sign and the review chases phantom swings." },
        { choice: 2, why: "No ORDER BY means no defined order — the 'prior' row is engine-arbitrary and the walk is noise. LAG without direction is not a walk." },
        { choice: 3, why: "That is a running total, not a prior read: each row carries the cumulative sum so far. A walk and a cumulative are different deliverables." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-6",
      prompt: "The structuring screen flags any customer whose small-ticket count crosses the review threshold. Where does COUNT(*) >= 5 live?",
      choices: [
        "HAVING COUNT(*) >= 5, after the fold",
        "WHERE COUNT(*) >= 5, before the fold",
        "In the ON clause of the join",
        "LIMIT 5 on the result",
      ],
      answer: 0,
      why: "The threshold judges a folded count — a group-level fact — so it lives in HAVING, which runs after GROUP BY. WHERE judges rows before the fold and cannot see COUNT; the engine throws a misuse-of-aggregate error.",
      notes: [
        { choice: 1, why: "WHERE filters rows before grouping; aggregates do not exist yet. This fails to compile — and the concept fails even where it compiles." },
        { choice: 2, why: "ON runs during the join, per row pair — pre-fold. Thresholds on folded counts have one home: HAVING." },
        { choice: 3, why: "LIMIT truncates output rows; it never judges groups. The screen would ship five arbitrary customers, not the five-time ones." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-7",
      prompt: "The clean-merchant screen runs `WHERE merchant_id NOT IN (SELECT id FROM watchlist)`. One watchlist row has id = NULL. What ships?",
      choices: [
        "The clean list, minus NULL merchants",
        "An empty result — silently",
        "Only rows whose merchant_id is NULL",
        "Every merchant — NULL fails the IN, so NOT IN passes",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN stays UNKNOWN. One NULL id empties the screen while the query looks healthy. The consumer-bank-safe shape is NOT EXISTS or LEFT JOIN + IS NULL.",
      notes: [
        { choice: 0, why: "NOT IN does not skip NULLs; one NULL contaminates every row's test. The result is not smaller — it is gone." },
        { choice: 3, why: "Backwards: NULL fails IN, but NOT UNKNOWN is still UNKNOWN, so NOT IN fails too. Both directions collapse on the same NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-8",
      prompt: "The dormancy LEFT JOIN leaves inactive accounts with NULL activity counts; the letter campaign wants 0.00. Where does COALESCE go?",
      choices: [
        "At the display edge — wrap the final SELECT expression only",
        "Inside WHERE, to filter NULLs early",
        "Inside the ON clause, to pre-fill the join",
        "Coalesce the column in the table once, at load",
      ],
      answer: 0,
      why: "COALESCE is a display decision: wrap the SELECT expression so reports print 0.00, while the pipeline above keeps NULL — the honest 'no activity'. Coalescing mid-pipeline launders missing data into fake zeros that read as 'active at zero'.",
      notes: [
        { choice: 1, why: "WHERE COALESCE(x, 0) = 0 confuses 'no activity' with 'zero activity' — outreach versus data-quality, two populations the bank keeps apart. Filter on IS NULL if you mean missing." },
        { choice: 2, why: "ON joins on keys; COALESCE there fabricates join keys and attaches wrong matches. The join stays honest and unmatched." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-9",
      prompt: "Confirmations LEFT JOIN settlements returns 33 rows: 27 matched, 6 unmatched. What do COUNT(*) and COUNT(p.id) read?",
      choices: [
        "33 and 27",
        "27 and 33",
        "33 and 33",
        "6 and 27",
      ],
      answer: 0,
      why: "COUNT(*) counts rows — all 33, matched or not. COUNT(p.id) skips NULLs — the 6 unmatched rows carry NULL settlement ids — so it reads 27, the settled subset. The 6-row gap IS the receivables watchlist.",
      notes: [
        { choice: 1, why: "Inverted. The star is NULL-blind to nothing; the column is NULL-blind by design. Both orderings exist in the wild — only one reconciles to the books." },
        { choice: 2, why: "That would mean no unmatched rows exist — the anti-join said otherwise. COUNT(p.id) is NULL-blind, not NULL-proof." },
        { choice: 3, why: "6 is the unmatched subset — COUNT(*) FILTER (WHERE p.id IS NULL) or a SUM(CASE …) flag reads it, not the plain COUNT pair." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-10",
      prompt: "Folding settlements back onto the confirmations they clear — which pair is the join key?",
      choices: [
        "payments.invoice_id = invoices.id",
        "payments.id = payments.invoice_id",
        "payments.method = invoices.status",
        "payments.paid_on = invoices.issued_on",
      ],
      answer: 0,
      why: "The settlement's invoice_id references the confirmation's primary key — that equality is the books' referential spine: 27 settlements, zero orphans. Every census on this pair inherits its honesty from this one predicate.",
      notes: [
        { choice: 1, why: "That compares a settlement's own id to its invoice reference — two different identifier spaces. It matches rows by accident of numbering, which is worse than not matching." },
        { choice: 2, why: "Method is a rail name ('card'/'wire'); status is a booking state ('paid'/'open'). Cross-domain keys match nothing and the census ships empty." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-11",
      prompt: "Coverage rate = settled confirmations over booked confirmations. Why does 100.0 * COUNT(DISTINCT p.invoice_id) / COUNT(*) precede the division?",
      choices: [
        "The multiplier forces real arithmetic before integer division truncates the share toward zero",
        "It converts cents to dollars before the ratio",
        "It deduplicates the settlements before counting",
        "It is a display convention — 100 * works identically",
      ],
      answer: 0,
      why: "COUNT returns integers; COUNT/COUNT is integer division and a coverage of 22/28 truncates to 0 — the report ships a flat zero. 100.0 promotes the division to real arithmetic first, and the share prints 78.6.",
      notes: [
        { choice: 1, why: "The cents-to-dollars conversion is the /100.0 on amount_cents — a different column and a different rule. The leading 100.0 is about the TYPE of the division, not the units." },
        { choice: 3, why: "100 * 22 / 28 evaluates left-to-right in integer arithmetic: 2200/28 = 78 — truncation already happened. The .0 is the type switch; moving or dropping it changes the digits." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-12",
      prompt: "Card settles 37364.00 and wire 32248.00. What does the 69612.00 sum buy you before the census publishes?",
      choices: [
        "A cross-foot — it must equal the cash account's debit side in the ledger, or the fold's input population is wrong",
        "The total revenue booked for the month",
        "The credit limit the two rails share",
        "Nothing — rails are independent books that never reconcile",
      ],
      answer: 0,
      why: "The rails-fold is only trustworthy if it ties to the books: 37364.00 + 32248.00 = 69612.00 must equal the cash account's debit side in ledger_entries. If the cross-foot breaks, the ledger is not wrong first — the fold's WHERE population is, and the census publishes nothing until it foots.",
      notes: [
        { choice: 1, why: "Settlement value is money moved through the rails, not revenue — conflating them is the kind of unit-less claim the review exists to catch." },
        { choice: 3, why: "Independent books that never reconcile is exactly how a phantom break ships to the controller. At this firm every report that moves money carries a cross-foot." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-13",
      prompt: "The ticket ladder reads: WHEN amount_cents < 150000 THEN 'under-1500' WHEN amount_cents < 300000 THEN '1500-2999' ELSE '3000-plus' END. A leg settles at exactly 300000 cents. Where does it land?",
      choices: [
        "'3000-plus' — the second arm fails at equality and the ELSE catches it",
        "'1500-2999' — < means less-than-or-equal in SQLite",
        "NULL — boundary values belong to no arm",
        "The query errors on the boundary",
      ],
      answer: 0,
      why: "300000 < 300000 is false, so the second arm misses and ELSE catches the leg into '3000-plus'. The boundary legs (150000, 300000) are exactly where the review argues — the arm ORDER and the operators are the documented policy, and silent re-bucketing lives in >= versus >.",
      notes: [
        { choice: 1, why: "Strict < excludes equality everywhere in SQL. Someone who believes this has shipped buckets that shift exactly the boundary legs — the population the surveillance desk watches." },
        { choice: 2, why: "A terminating ELSE has no NULLs — every leg exits through some arm. The ELSE is the exhaustiveness guarantee, not a gap." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-14",
      prompt: "The deposits book needs a running balance per ACCOUNT, not a grand running total. Which window spec does that?",
      choices: [
        "SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date)",
        "SUM(amount) OVER (ORDER BY txn_date)",
        "SUM(amount) OVER (PARTITION BY txn_date)",
        "SUM(amount) OVER ()",
      ],
      answer: 0,
      why: "PARTITION BY account_id restarts the accumulation at each account and ORDER BY txn_date gives it time direction — every account gets its own balance walk. Without the partition, balances bleed across accounts; partitioning by date restarts every row.",
      notes: [
        { choice: 1, why: "That is the firm-wide running total — account 2's deposit lands in account 1's 'balance'. The overnight reconciliation would catch it, after the letter campaign printed it." },
        { choice: 2, why: "PARTITION BY txn_date makes each timestamp its own partition — every 'balance' equals that row's amount. The two window clauses answer different questions and swapping them is a classic." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-15",
      prompt: "A confirmation carries 6148.00 billed; its payment legs sum to 4000.00. In the coverage CASE, which arm catches it and why?",
      choices: [
        "'partial' — legs exist and sum to less than billed; the arm between 'none' and 'exact'",
        "'none' — the legs do not fully cover the billed cents",
        "'exact' — 4000.00 rounds to the billed figure at display precision",
        "NULL — partial coverage has no bucket",
      ],
      answer: 0,
      why: "The census classifies on money: legs present (SUM IS NOT NULL) but SUM < billed is partial — this db's one partial, 4000.00 of 6148.00. It stays in the receivables exception queue precisely because the definition, printed beside the bucket, says legs-below-billed.",
      notes: [
        { choice: 1, why: "'None' means no legs at all — the anti-join population (6 statements worth 15217.00). Erasing the partial into 'none' hides a negotiating position the ops desk owns." },
        { choice: 2, why: "The comparison runs on INTEGER cents before any display rounding — 400000 < 614800, full stop. Rounding happens once, at the edge, after classification." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-16",
      prompt: "The exception pack wants each statement's payment legs as one cell — 'card 2000.00; wire 2000.00'. Which aggregate builds it, and what decides the order?",
      choices: [
        "GROUP_CONCAT over the joined legs, folded per invoice — order taken from an ordered subquery, since GROUP_CONCAT's order is unspecified",
        "CONCAT per row — it folds naturally under GROUP BY",
        "SUM of the method strings, sorted by amount",
        "JSON_ARRAYAGG — GROUP_CONCAT cannot carry two fields per leg",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds the leg descriptions into one cell at statement grain — the memo the reviewer reads without expanding rows. Its concatenation order is engine-unspecified unless the fold runs over an ordered subquery, and 'unspecified order' is not acceptable in a pack someone reconciles line by line.",
      notes: [
        { choice: 1, why: "CONCAT is a row-level function — under GROUP BY it errors or returns one row's value, never the fold. The folding aggregate is GROUP_CONCAT." },
        { choice: 2, why: "SUM coerces TEXT to 0 — a memo of zeros. Strings fold with string aggregates; the type system is the first reviewer." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-17",
      prompt: "Which customers moved money on BOTH rails this cycle? Which shape answers in one predicate, and why do the others misfire?",
      choices: [
        "INTERSECT of the card-customer set and the wire-customer set — set membership, each customer once",
        "JOIN payments to itself ON customer_id WHERE method <> method",
        "WHERE method = 'card' AND method = 'wire' on one row",
        "UNION of the two rail sets with DISTINCT",
      ],
      answer: 0,
      why: "Two memberships, one intersection: fold each rail's customer set, INTERSECT, and every dual-rail customer arrives exactly once. The row-level AND is never true — one column cannot hold two values — and UNION answers 'either rail', the wrong population for a dual-relationship question.",
      notes: [
        { choice: 1, why: "The self-join shape works but returns pair-grain — one row per (card, wire) settlement pair — so a customer with three card legs and two wire legs appears six times. It needs a DISTINCT the INTERSECT gives free." },
        { choice: 3, why: "UNION is the either-or merge: it answers 'touched any rail' — the outreach list, not the dual-relationship list. Set operators differ by exactly this much and the panel grades the difference." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-18",
      prompt: "Promo cohort: customers whose FIRST activity landed inside the promo window. Which shape survives NULLs and dedupes for free?",
      choices: [
        "EXISTS an activity in the window AND NOT EXISTS any activity before it",
        "WHERE MIN(txn_date) >= promo_start with no grouping",
        "A correlated scalar txn_date = (SELECT MIN(...) ...) with no dedup",
        "WHERE txn_date = promo_start",
      ],
      answer: 0,
      why: "The two-EXISTS shape tests membership twice — 'has an in-window first' — without materializing a list, so a NULL in the activity stream cannot poison it the way it poisons NOT IN. The IN-fold shape (GROUP BY customer HAVING MIN(date) in window) is the readable twin; the correlated scalar re-runs per row and can return two rows for a same-day tie.",
      notes: [
        { choice: 1, why: "MIN without GROUP BY folds the WHOLE table to one date — the query returns everyone or nobody. The fold needs a per-customer GROUP BY or the EXISTS shape." },
        { choice: 2, why: "The scalar is 0-or-1 rows by contract; two txns sharing the first date make the comparison match twice and the cohort double-counts that customer. Dedup or use the set shapes." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-19",
      prompt: "Fraud ops flags duplicate charges: same customer, same cents, same day. Sketch the self-join that returns each pair ONCE.",
      choices: [
        "payments a JOIN payments b ON a.customer_id = b.customer_id AND a.amount_cents = b.amount_cents AND a.paid_on = b.paid_on AND a.id < b.id",
        "payments JOIN payments ON customer_id — same customer is enough",
        "payments a JOIN payments b ON a.id = b.id AND a.amount_cents = b.amount_cents",
        "payments a LEFT JOIN payments b ON a.id < b.id",
      ],
      answer: 0,
      why: "The self-join pairs rows of one table; a.id < b.id is the ordering trick that yields each unordered pair once and kills self-pairs. Dropping it doubles every pair and pairs every settlement with itself; requiring id equality collapses to self-pairs only.",
      notes: [
        { choice: 1, why: "Same customer alone pairs every settlement a customer ever made — the alert queue fills with history, not duplicates. The duplicate definition needs all three equalities plus the ordering." },
        { choice: 3, why: "That pairs EVERY pair of rows in the table twice (once each direction) with no predicate at all — a cartesian product with a filter. The wall-clock cost alone fails the review." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-20",
      prompt: "The walk needs THIS month beside LAST month per expense category — the reset per category, the calendar order inside it. Which window spec?",
      choices: [
        "LAG(spend) OVER (PARTITION BY category ORDER BY month_key)",
        "LAG(spend) OVER (ORDER BY month_key)",
        "LEAD(spend) OVER (PARTITION BY category ORDER BY month_key)",
        "LAG(spend) OVER (PARTITION BY month_key ORDER BY category)",
      ],
      answer: 0,
      why: "PARTITION BY category restarts the walk per cost line and ORDER BY month_key gives it calendar direction — Rent's February carries Rent's January as its prior. The unpartitioned version lets Rent's prior read Ads' December; LEAD labels next month 'prior' and flips every delta.",
      notes: [
        { choice: 1, why: "No partition means one walk across categories interleaved by month — each category's 'prior month' is whatever row sorts before it, usually another category's. The deltas are noise that still sums plausibly." },
        { choice: 3, why: "Partition and order are swapped: this walks categories inside a month, so 'prior' is the alphabetically-previous category — a nonsense comparison that compiles clean. The window spec IS the definition." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-21",
      prompt: "Weekend surveillance: purchases between Saturday 00:00 and Monday 00:00. Which WHERE keeps the boundary honest on TEXT timestamps?",
      choices: [
        "purchased_at >= '2025-03-01' AND purchased_at < '2025-03-03'",
        "BETWEEN '2025-03-01' AND '2025-03-02'",
        "purchased_at >= '2025-03-01' AND purchased_at <= '2025-03-03'",
        "STRFTIME('%w', purchased_at) IN ('6', '0') with no time bounds",
      ],
      answer: 0,
      why: "The half-open interval keeps every moment of Saturday and Sunday and excludes Monday's first instant — the upper bound is exclusive. BETWEEN with date-only strings includes Monday 00:00:00 at best and, with time components in the data, silently includes or drops the boundary night; the surveillance window's edges are exactly where the disputed transactions land.",
      notes: [
        { choice: 2, why: "<= '2025-03-03' sweeps all of Monday into the weekend bucket — the weekday mix shifts and the velocity baseline drifts. Close the interval at the boundary you mean, exclusively." },
        { choice: 3, why: "The weekday filter works but answers a different frame — it needs the date range anyway to mean a SPECIFIC weekend. The two shapes compose; they do not substitute." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-22",
      prompt: "A merged KYC feed mixed cases and padding: 'Alice.Chen@…' beside 'alice.chen@… '. The customer-match join misses. First move?",
      choices: [
        "Join on UPPER(TRIM(a.email)) = UPPER(TRIM(b.email)) — normalize the key on both sides",
        "JOIN on name — names are cleaner than emails",
        "SELECT DISTINCT to collapse the duplicates that do match",
        "WHERE email IS NOT NULL and retry",
      ],
      answer: 0,
      why: "Equality is byte-for-byte; the fix lives in the key expression, applied to both sides, so 'Alice.Chen@x' and 'alice.chen@x ' resolve to the same key. This is the KYC-grade hygiene drill: 'know your customer' begins with 'match your customer', and a missed match is a customer the bank treats as two.",
      notes: [
        { choice: 1, why: "Names collide harder than emails — and the dedupe question is identity, not display. Normalize the key the source systems actually share." },
        { choice: 2, why: "DISTINCT hides the rows that matched twice and does nothing for the rows that never matched — the miss survives downstream where the manifest still shows two customers." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-23",
      prompt: "The structuring wall flags customers with 5+ small tickets THIS CYCLE. Where does each filter live: the small-ticket definition, the 5-count wall, the cycle dates?",
      choices: [
        "Small-ticket and cycle dates in WHERE (row-level, pre-fold); the 5-count in HAVING (post-fold)",
        "All three in WHERE — filters are filters",
        "Small-ticket in HAVING; the count in WHERE; dates anywhere",
        "The count in the ON clause so it applies during the join",
      ],
      answer: 0,
      why: "Row-level facts filter rows (WHERE): the ticket-size rule and the cycle window, applied before the fold — cheap and population-honest. The wall judges a folded count that does not exist until GROUP BY — HAVING. The ON clause fires per row-pair during the join, pre-fold, and would filter the wrong population entirely.",
      notes: [
        { choice: 1, why: "WHERE COUNT(*) >= 5 fails to compile — aggregates do not exist row-by-row. The pipeline order is not style; it is when each fact becomes judgeable." },
        { choice: 3, why: "That is the classic shipped bug: an ON-clause threshold silently evaluates per joined pair, keeping customers whose JOIN happened to cross 5 rows — a different population wearing the same report name." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-24",
      prompt: "The controller wants every orphan in one query: settlements with no confirmation AND confirmations with no settlement. Which join returns both orphan directions?",
      choices: [
        "FULL OUTER JOIN invoices i ON i.id = p.invoice_id, keeping i.id IS NULL or p.id IS NULL",
        "LEFT JOIN from payments, keeping NULLs",
        "LEFT JOIN from invoices, keeping NULLs",
        "INNER JOIN — orphans cannot survive it",
      ],
      answer: 0,
      why: "FULL OUTER JOIN keeps unmatched rows from BOTH sides — the 27-settlement side and the 28-confirmation side — and the NULL-test surfaces both orphan directions in one pass. A single LEFT JOIN sees one direction only; the other side's orphans vanish exactly where the reconciliation needs them.",
      notes: [
        { choice: 1, why: "Payments-first catches a rail hit with no booking — but the confirmation with no rail hit (the receivables watchlist) never appears. Half a control is how a phantom break ships." },
        { choice: 3, why: "INNER JOIN deletes exactly the rows the control exists to find. Orphan-hunting is the anti-join family; INNER is its opposite." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-25",
      prompt: "Risk wants accounts bucketed into quartiles by exposure — and the tie policy published. Which window, and what does the policy decide?",
      choices: [
        "NTILE(4) OVER (ORDER BY exposure) — ties straddle buckets, so the published policy names the tie-breaker",
        "RANK() OVER (ORDER BY exposure) divided by 4 in the display layer",
        "ROW_NUMBER() OVER (ORDER BY exposure) with no tie handling",
        "PERCENT_RANK() OVER () rounded to buckets",
      ],
      answer: 0,
      why: "NTILE(4) is the bucketing window — it deals rows into four near-equal groups by the ordering. Ties at a bucket edge straddle, which is why the desk publishes the policy: same-exposure accounts land together or the tie-breaker (account id, then opened date) is written into the ORDER BY. Silent arbitrary tie-breaking is a risk-reporting finding, not a style note.",
      notes: [
        { choice: 1, why: "RANK/4 divides a rank by a constant — rank 2 of 40 is not quartile 1 of 10. The arithmetic looks plausible and buckets the wrong rows at every boundary." },
        { choice: 2, why: "ROW_NUMBER breaks ties by whatever the engine chose — deterministic on today's plan, different after a stats refresh. Risk buckets must not shuffle when the query plan does." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-26",
      prompt: "The month packet needs settled and unsettled confirmations as ONE result with a labelled source column. Which shape, and what does it protect?",
      choices: [
        "UNION ALL of two folded branches with a literal label — every row survives, provenance is explicit",
        "UNION — the dedup keeps the packet clean",
        "One query with OR — the label comes from CASE",
        "Two queries pasted into the deck",
      ],
      answer: 0,
      why: "UNION ALL appends both folds with the label column ('settled'/'unsettled') carrying provenance; nothing is silently deduped and the packet foots to the whole book. UNION would collapse byte-identical rows across branches — two months with identical counts is a coincidence, not a duplicate, and the loss announces itself nowhere.",
      notes: [
        { choice: 1, why: "The dedup is the bug: identical (month, count) rows across the settled and unsettled folds are legitimate, and UNION deletes one without a trace. Label + UNION ALL is the audit-proof shape." },
        { choice: 2, why: "CASE-with-OR works when the populations share a table — here the folds have different WHERE populations and the branch structure IS the report. Forcing one SELECT obscures the two populations the review reads separately." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-27",
      prompt: "27 settlement legs touch how many distinct confirmations — and which aggregate answers it?",
      choices: [
        "COUNT(DISTINCT p.invoice_id) — 22 confirmations covered, 6 with no legs",
        "COUNT(p.invoice_id) — it deduplicates by default",
        "COUNT(*) over the join — the fan-out is the point",
        "SUM(p.invoice_id) / COUNT(*) — the average confirmation",
      ],
      answer: 0,
      why: "Legs and confirmations are different grains: 27 legs sit on 22 distinct confirmations (one partial has legs, some confirmations have none), and COUNT(DISTINCT) is the aggregate that collapses the leg grain to confirmation grain. The 28-minus-22 gap is the exception queue before any classification runs.",
      notes: [
        { choice: 1, why: "COUNT(p.invoice_id) counts non-NULL leg rows — 27, the leg count wearing a confirmation costume. The fan-out survives it because each leg is its own row." },
        { choice: 2, why: "COUNT(*) over payments-joined-invoices counts pairs — 27 here only because each leg has one confirmation; the number means legs, and the report asked for confirmations covered." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-28",
      prompt: "The deck shows monthly spend rounded to cents. Where does ROUND go — and what does per-row rounding buy?",
      choices: [
        "ROUND once at the display edge, after the fold — per-row rounding compounds drift and shares stop summing to 100",
        "ROUND per row, then SUM the rounded values — the deck foots exactly",
        "ROUND inside the GROUP BY so the fold is exact",
        "Never round — cents are sacred at every layer",
      ],
      answer: 0,
      why: "The fold is exact in integer cents; one ROUND at the edge turns dollars into presentation. Rounding per row then re-summing bakes drift into the total — each rounded part is off by up to half a cent and the sum of the parts stops equaling the rounded whole, which is the discrepancy the controller's tie-out exists to catch.",
      notes: [
        { choice: 1, why: "'Foots exactly' is achieved by making the parts wrong — the total is right but every reconciliation against source data now disagrees by fractions the audit must explain." },
        { choice: 3, why: "Cents ARE sacred in the pipeline — the argument is about the display edge. Storage and arithmetic stay integer; presentation rounds once, visibly, with the rule documented." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-29",
      prompt: "The mismatch report runs WHERE p.amount_cents <> i.amount_cents — and the 6 confirmations with NO legs vanish from it. Why?",
      choices: [
        "Their p.amount_cents is NULL; NULL <> anything is UNKNOWN, so the row fails the filter — the mismatch report is missing its biggest population",
        "The join dropped them for having no legs",
        "<> excludes equality only; NULL legs are equal",
        "The report is correct — no legs means no mismatch",
      ],
      answer: 0,
      why: "Three-valued logic: a NULL in the comparison makes the predicate UNKNOWN, and WHERE keeps only TRUE — so 'no legs' (the never-collected 15217.00) silently exits a report whose job is to list mismatches. The NULL-safe shapes: (p.amount_cents IS DISTINCT FROM i.amount_cents) or an explicit OR p.id IS NULL arm.",
      notes: [
        { choice: 1, why: "The LEFT JOIN kept them — the WHERE killed them. Placement again: the anti-join population survived the join and died at the filter." },
        { choice: 3, why: "That is precisely the shipping error: 'no legs' is the largest possible mismatch — money billed, nothing settled. The report that excludes it reads 1 exception where the book holds 7." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-30",
      prompt: "'Dormant' accounts for the outreach list. Which definition survives review?",
      choices: [
        "No activity ROWS this cycle — an anti-join count; a zero balance with activity is NOT dormant",
        "Balance equals zero — the books say so",
        "Account not touched in the ledger this year, by ledger date only",
        "No card settlements — the consumer rail is the only activity that counts",
      ],
      answer: 0,
      why: "Dormancy is defined by absent rows, not zero values: the anti-join population (no activity rows this cycle) drives outreach, while a zero-balance account with rows is a different population entirely — measured-zero versus no-evidence. The definition prints beside the count, because 'zero rows, not zero dollars' is the sentence the review grades.",
      notes: [
        { choice: 1, why: "Zero balance plus activity is churn-in-progress or a cleared account — outreach treats it differently, and conflating the two misroutes the whole campaign." },
        { choice: 3, why: "One rail is not the book: wire activity, fees and interest rows all count as activity. A rail-scoped dormancy definition quietly reclassifies institutional-only accounts as dormant." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-jpm-1",
      tier: "easy",
      topic: "j1",
      universe: "month-close",
      title: "The two-rail settlement census",
      brief:
        "JPMorgan-flavored memo on the storefront db: the payments book moves on two rails — card, the consumer-bank read, and wire, the institutional one — and the weekly ops review opens with both folded side by side. Probed facts: 27 settlement rows in total; card carries 16 of them worth 37364.00 and wire carries 11 worth 32248.00 (37364.00 + 32248.00 = 69612.00, the cash ledger's debit side). Every settlement must sit on a booked confirmation — the join to the confirmations table is the control that proves no rail hit dangles before the census folds. Rail first, biggest settled value first.",
      ask: "Return each settlement rail with its settlement count and settled value in dollars (2 decimals), biggest value first.",
      template:
        "SELECT p.method,\n       {1}(*) AS settlements,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled\nFROM payments p\nJOIN invoices i ON i.id = p.{2}\nGROUP BY p.method\nORDER BY settled {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-rail settlement counter",
          why: "COUNT(*) counts the settlement rows folded into each rail — 16 card, 11 wire. SUM would try to fold a star and error; the count is the volume read, the SUM below it is the value read.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the rail-to-confirmation key",
          why: "p.invoice_id = i.id is the control join: every settlement must reconcile to a booked confirmation before it counts. p.method is TEXT against an integer id and matches nothing — the census would ship empty.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "Card's 37364.00 leads the read, wire's 32248.00 follows. ASC would open the ops review with the institutional rail — a correct fold with the emphasis inverted.",
        },
      ],
      distractors: ["SUM", "status", "AVG", "method"],
      walkthrough:
        "The consumer bank reads card, the institutional side reads wire — one fold, two rows, no drama. The join is the control: payments.invoice_id → invoices.id attaches all 27 settlement rows to booked confirmations with zero orphans, which is what licenses the census. GROUP BY p.method folds the rails: card 16 settlements / 37364.00, wire 11 / 32248.00 — and the pair cross-foots to 69612.00, the value the cash account's debit side carries in the ledger, so the census reconciles before it publishes. The cents rule holds: the column stores integer cents, so the /100.0 happens once, inside the fold, before the ROUND. Swap the join key to method and the TEXT-versus-integer comparison matches nothing — an empty census, shipped silently. COUNT(*) and SUM live at the same grain here: 16 and 37364.00 both describe the card rail — count and value, load and exposure — and the review reads them as a pair.",
    },
    {
      id: "cs-jpm-2",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The op-cost calendar walk",
      brief:
        "JPMorgan-flavored memo on the storefront db: treasury runs the op-cost calendar on a month spine and reviews it as a walk — this month beside last month, deltas visible, no month skipped. Probed facts: 36 expense lines across 14 months, 2024-01 (1719.00) through 2025-02 (1650.00); the calendar peaks at 2024-08 with 3210.00 against July's 1794.00, and the month buckets ride the '%Y-%m' key. The walk is a window job: each month carries the PRIOR month's total beside it, computed over the calendar order — not the display order. All 14 months on the walk, oldest first.",
      ask: "Return the 14-month op-cost walk: '%Y-%m' month, spend and prior-month spend in dollars (2 decimals), calendar order.",
      template:
        "SELECT STRFTIME({1}, e.spent_on) AS month,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend,\n       ROUND({2}(SUM(e.amount_cents)) OVER (ORDER BY STRFTIME('%Y-%m', e.spent_on)) / 100.0, 2) AS prior_month\nFROM expenses e\nGROUP BY month\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket key",
          why: "'%Y-%m' prints '2024-08' — the year-first key that sorts as a calendar. '%Y' collapses the walk to two year rows; '%m' merges Januaries with Februaries across years.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking window",
          why: "LAG hands each month the row before it in the window's order — the prior month's fold. LEAD would point forward and label NEXT month as 'prior'; the first row carries NULL, the honest 'no prior'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar order",
          why: "Oldest first is how a walk reads: 2024-01 on top through 2025-02. DESC would print the calendar backwards — and the LAG column would still reference the true prior month, exposing the mismatch.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the full-calendar cut",
          why: "The spine has exactly 14 buckets, 2024-01 through 2025-02 — the walk ships complete or it hides a month. Any shorter LIMIT truncates the calendar mid-year.",
        },
      ],
      distractors: ["'%Y'", "LEAD", "DESC", "7"],
      walkthrough:
        "A walk is a fold plus a window, and the two orders are different things. The fold: STRFTIME('%Y-%m', spent_on) buckets 36 expense lines into 14 month keys, SUM(amount_cents)/100.0 prices each — 1719.00 to open, a 3210.00 peak at 2024-08, 1650.00 to close. The window: LAG(SUM(…)) OVER (ORDER BY the same '%Y-%m' key) reaches one bucket back IN CALENDAR ORDER and parks that total beside the current month — so 2024-09 carries 3210.00 as its prior, the clearest step-down on the walk, and August's own prior reads July's 1794.00, the +1416.00 move the review annotates. The first row's prior_month is NULL: no bucket exists before 2024-01, and NULL is the honest print. The LIMIT 14 is the audit that the spine is complete. Note the trap the display order sets: ORDER BY month DESC would reverse the rows while the window still walks forward — the numbers would not move, but the read would lie, which is why the window's ORDER BY is written out in full and never inherited from the display.",
    },
    {
      id: "cs-jpm-3",
      tier: "medium",
      topic: "l8",
      universe: "month-close",
      title: "The account-level ledger proof",
      brief:
        "Month-close brief, in-world: before the pack publishes, the controller folds the double-entry ledger per account — entries, debit side, credit side, net — and reads it biggest debit side first. Probed on the storefront db: ledger_entries holds 80 entries across 4 accounts; accounts_receivable folds 26 entries at 86052.00 debited / 69612.00 credited, cash 27 at 69612.00 / 25416.00, operating_expenses 14 at 25416.00 / 0.00, sales_revenue 13 at 0.00 / 86052.00 — and the grand proof is 181080.00 debits against 181080.00 credits, delta 0. The pack keeps only accounts carrying at least **14** entries, so the sales_revenue fold (13 entries) waits for the revenue review while the pack argues from material books. Money is integer cents; the dollar read is / 100.0.",
      ask: "Return each account with at least 14 entries: account, entry count, debits and credits in dollars (2 decimals), and net — biggest debit side first.",
      template:
        "SELECT account,\n       COUNT(*) AS entries,\n       ROUND({1}(debit_cents) / 100.0, 2) AS debits,\n       ROUND(SUM(credit_cents) / 100.0, 2) AS credits,\n       ROUND((SUM(debit_cents) - SUM(credit_cents)) / 100.0, 2) AS net\nFROM ledger_entries\nGROUP BY account\nHAVING COUNT(*) >= {2}\nORDER BY debits {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the debit-side adder",
          why: "SUM(debit_cents) folds each account's debit rows into the side the trial balance reads — 86052.00 on receivables, 69612.00 on cash. COUNT would return the entry count wearing a dollars name (26, 27), and the pack's cross-foot against the rails would compare row counts to money.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the materiality gate",
          why: "HAVING COUNT(*) >= 14 keeps the three material books — receivables 26, cash 27, operating_expenses exactly 14, which is why 14 is verifiably in the output — and drops sales_revenue's 13-entry fold to the revenue review. The gate judges a folded count, so it lives in HAVING; 13 would wave the sales book back in.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-debit-first direction",
          why: "The controller reads exposure top-down: receivables 86052.00, cash 69612.00, opex 25416.00. ASC would open the pack on the smallest book and bury the fold the cross-foot actually needs.",
        },
      ],
      distractors: ["COUNT", "13", "ASC", "AVG"],
      walkthrough:
        "The close's first query is a fold and a proof. GROUP BY account folds the 80 ledger entries into four account books; SUM(debit_cents)/100.0 and SUM(credit_cents)/100.0 price both sides in dollars, and the net column carries the account's standing — receivables net +16440.00 (billed more than collected this cycle), cash net +44196.00, opex net +25416.00, and sales_revenue net −86052.00 waiting below the gate. The gate is the pack's materiality rule: HAVING COUNT(*) >= 14 keeps accounts whose fold is big enough to argue from, and the boundary is live — operating_expenses sits exactly on 14, which is why the threshold is a printed constant someone signed off, not a vibe. The debits read DESC because the review opens on the biggest exposure. Cross-foot the survivors and the proof holds underneath: 86052.00 + 69612.00 + 25416.00 on the debit side, and the grand ledger still ties at 181080.00 against 181080.00, delta 0. Swap SUM for COUNT and every dollars column becomes a row count; drop the gate to 13 and the pack argues from a book it meant to set aside; flip the sort and the review reads upside down.",
    },
    {
      id: "cs-jpm-4",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass confirmation census",
      brief:
        "Month-close brief, in-world: the ops review opens with the confirmation census, and it ships as ONE query — one scan of the booked confirmations, every state counted in the same pass, so no two queries can disagree about the population. Probed on the storefront db: 28 booked confirmations — 21 carry status 'paid' for 66443.00 billed, 6 sit 'open' for 19609.00, 1 is 'void' at 925.00 — and the surveillance arm flags the large tickets (billed at 5000.00 or more): 2 of the paid book, 1 of the open, none of the void. Status is the claim; the census counts claims first and the evidence pass (which confirmations drew settlement legs) comes next. Values are integer cents read out at / 100.0.",
      ask: "Return one row per confirmation state: state, count, billed value in dollars (2 decimals), and the count of large tickets (billed at 5000.00+) — all from one scan, biggest billed book first.",
      template:
        "SELECT i.status,\n       {1}(*) AS confirmations,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed,\n       COUNT(*) {2} (WHERE i.amount_cents >= {3}) AS large_book\nFROM invoices i\nGROUP BY i.status\nORDER BY billed {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the state counter",
          why: "COUNT(*) counts the rows folded into each status — 21 paid, 6 open, 1 void. SUM would try to fold a star and error; the count is the population read, and the SUM beside it is the value read from the same rows.",
        },
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the conditional-count keyword",
          why: "COUNT(*) FILTER (WHERE …) is the one-pass census arm: rows failing the predicate simply don't enter that count, so the large-ticket column rides beside the totals from one scan. Writing the predicate as a plain WHERE would filter the WHOLE census — the state rows would shrink and the totals would lie about the population.",
        },
        {
          answer: "500000",
          kind: "number",
          noVerify: true,
          label: "the large-ticket threshold",
          why: "The surveillance arm is a printed constant someone signed off: 500000 cents is 5000.00 billed, and at that line the arm reads 2 paid, 1 open, 0 void — the tickets a second reviewer looks at. Lower it and the arm stops being surveillance; raise it and it goes quiet.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review opens on the paid book (66443.00 billed), then the open book (19609.00), then the void (925.00). ASC would open on the one-row void and bury the state the review exists to read.",
        },
      ],
      distractors: ["SUM", "WHERE", "200000", "ASC"],
      walkthrough:
        "One scan, three state rows, four columns, no second query to disagree with the first. GROUP BY i.status folds the 28 confirmations into their states, and each row carries a pair of readings from the same rows: COUNT(*) is the population (21 / 6 / 1) and SUM(amount_cents)/100.0 is the billed value (66443.00 / 19609.00 / 925.00 — 86977.00 total, the AR debit side plus the void's noise). The fourth column is the census trick: COUNT(*) FILTER (WHERE amount_cents >= 500000) is a conditional count — the 2 paid, 1 open, 0 void large tickets ride beside their state totals from the same scan, so the surveillance arm can never disagree with the census it belongs to. ORDER BY billed DESC makes the review read top-down by exposure. The traps are quiet ones: a plain WHERE instead of FILTER would shrink every state row to its large tickets only — a census of 3 rows claiming to be the book; a threshold of 200000 widens the arm to 20 tickets and the surveillance read dissolves; ASC buries the paid book under the void. The census counts claims; the next query — the coverage join — tests which claims the rails proved.",
    },
    {
      id: "cs-jpm-5",
      tier: "hard",
      topic: "j7",
      universe: "fraud",
      title: "The structuring wall",
      brief:
        "Fraud-surveillance brief, in-world: the financial-crime screen is the firm's signature pattern — fold small-ticket settlement legs per counterparty, then judge the fold against a review wall in HAVING. 'Small ticket' is a printed constant someone signed off: legs under 5000.00 (500000 cents). Probed on the storefront db through the rails (payments joined to confirmations to counterparties): at that line, Alice Chen carries 9 small legs worth 24481.00 and Maya Patel carries 5 worth 11542.00 — the only two counterparties whose small-ticket count reaches the wall of **5**; the next names sit at 3 (Grace Kim, Emma Wilson). The screen returns the flagged book with count and value, so the case review sees both how often and how much.",
      ask: "Return each counterparty with at least 5 small-ticket legs (under 5000.00): name, small-ticket count, and small-ticket value in dollars (2 decimals) — busiest counterparty first.",
      template:
        "SELECT c.name AS counterparty,\n       COUNT(*) AS small_tickets,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS small_value\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.id = i.{1}\nWHERE p.amount_cents < 500000\nGROUP BY c.name\n{2} COUNT(*) >= {3}\nORDER BY small_tickets {4}, counterparty;",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the counterparty join key",
          why: "c.id = i.customer_id attaches each confirmation to its counterparty — the reference spine the fold groups by. c.id = i.id pairs counterparties with whichever confirmation shares their row number: rows that join by accident of numbering, counts that mean nothing.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the post-fold wall",
          why: "The wall judges a folded count — a group-level fact that does not exist until GROUP BY runs — so it lives in HAVING. WHERE COUNT(*) fails to compile (no groups yet), and an ON-clause threshold fires per joined row pair, silently filtering a different population.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the review wall",
          why: "The wall is 5, and 5 is verifiably in the output — Maya Patel's flagged count. It keeps exactly the two counterparties at or above the line: Alice Chen at 9, Maya Patel at 5 — and drops the 3-leg names (Grace Kim, Emma Wilson) whose counts never crossed. A wall of 9 would flag Alice alone.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The case review reads the flags top-down by count: Alice Chen's 9 small legs open the memo, Maya Patel's 5 follow. ASC would lead with the quietest flagged counterparty and bury the pattern the screen exists to escalate.",
        },
      ],
      distractors: ["id", "WHERE", "9", "ASC"],
      walkthrough:
        "The structuring screen is three moves in pipeline order, and each move has exactly one home. The row-level filter comes first: WHERE amount_cents < 500000 keeps the small legs and drops the big ones before any folding — cheap, population-honest, and the definition of 'small ticket' lives here as a printed literal. The fold comes second: the two joins ride the reference spine (each leg to its confirmation, each confirmation to its counterparty), GROUP BY c.name folds the small legs per counterparty, and COUNT(*) is the frequency read while SUM/100.0 is the value read. The wall comes third: HAVING COUNT(*) >= 5 judges the folded count — Alice Chen 9 / 24481.00, Maya Patel 5 / 11542.00 — and the boundary is live, with Grace Kim and Emma Wilson sitting at 3, exactly why the threshold prints beside the results. Swap the join key to i.id and the fold groups an accidental population; write the wall in WHERE and the query stops compiling, which is the grammar teaching you the pipeline; write it in the ON clause and it fires per row pair pre-fold, flagging a different book entirely; drop the wall to a LIMIT and you ship five arbitrary names, not the five-time ones. The screen's output is a case file: counts, values, threshold, definition — everything a reviewer needs to re-run it.",
    },
    {
      id: "cs-jpm-6",
      tier: "medium",
      topic: "t5",
      universe: "month-close",
      title: "The two-rail concentration board",
      brief:
        "Month-close brief, in-world: the risk read opens on concentration — per rail, which counterparties hold the biggest single settlement legs. The board ranks legs WITHIN each rail (card and wire keep separate ladders: 16 legs and 11 legs are different books with different thresholds) and keeps the top two rungs per rail. Probed on the storefront db: card's biggest legs are Emma Wilson at 4015.00 and Olivia Brown at 3076.00; wire's are Alice Chen at 4000.00 and Isabella Rossi at 3896.00 — no ties at the top, so the board's ROW_NUMBER tiebreaker (leg id) never has to arbitrate, and it is pinned anyway so the rerun reproduces the board row for row.",
      ask: "Return the top-2 legs per rail: rail, counterparty, rung (1 or 2), and leg value in dollars (2 decimals) — rails A-to-Z, rung 1 first within each.",
      template:
        "WITH ranked AS (\n  SELECT p.method,\n         c.name AS counterparty,\n         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY p.amount_cents {2}, p.id) AS rung,\n         ROUND(p.amount_cents / 100.0, 2) AS leg_value\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n)\nSELECT method, counterparty, rung, leg_value\nFROM ranked\nWHERE rung <= {3}\nORDER BY method, rung;",
      slots: [
        {
          answer: "p.method",
          kind: "keyword",
          label: "the rail partition",
          why: "PARTITION BY p.method gives card and wire separate ladders — each rail's rung 1 is its own biggest leg. Partitioning by confirmation id or counterparty would hand every row its own partition: every rung reads 1, the WHERE keeps everything, and the board prints all 27 legs as if each were its own rail.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first window order",
          why: "Ranking exposure means the biggest leg is rung 1, so the window's ORDER BY runs descending — 4015.00 leads card, 4000.00 leads wire. ASC crowns each rail's SMALLEST leg: a correct query answering the opposite question, and the concentration review would read the quietest legs as the riskiest.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the top-rungs cut",
          why: "WHERE rung <= 2 keeps the two biggest legs per rail — 4 rows, and 2 is verifiably in the output as the rung column's second value. The cut filters the WINDOW's output, which is why the board stages in a CTE first: rung does not exist until the window computes, and WHERE rung <= 2 written inline fails.",
        },
      ],
      distractors: ["i.id", "ASC", "3", "c.id"],
      walkthrough:
        "A concentration board is a window rank staged, then cut. The CTE joins the rails to their confirmations and counterparties — 27 legs, each attached to the name that owns it — and the window does the ranking: PARTITION BY p.method deals the legs into two ladders, ORDER BY amount_cents DESC with p.id as the pinned tiebreaker numbers each ladder biggest-first, and ROW_NUMBER guarantees exactly one rung per number even if two legs ever tie. The outer query cuts with WHERE rung <= 2 — card keeps Emma Wilson's 4015.00 and Olivia Brown's 3076.00, wire keeps Alice Chen's 4000.00 and Isabella Rossi's 3896.00 — and the two-step is not style: window output is SELECT-stage work, invisible to a WHERE written in the same SELECT, so the CTE is the only honest staging. Partition by i.id or c.id and every row becomes its own rung-1 partition — the WHERE keeps all 27 legs and the board prints the whole book wearing a top-2 name; flip the window to ASC and the review crowns the smallest legs; widen the cut to 3 and the board ships six rows where the memo promised four. The board reads rail by rail because risk reads rail by rail — the partition clause IS the business rule.",
    },
  ],

  problems: [
    { slug: "countries-you-can-safely-invest-in", why: "Tagged JPMorgan problem: the ratio screen with a deduped, gated population — eligible-before-percentage logic that mirrors the bank's coverage-share reads." },
    { slug: "structuring-detection", why: "Tagged JPMorgan problem: the HAVING wall over small-ticket counts — the structuring screen in textbook form, threshold judged after the fold." },
    { slug: "delinquency-buckets", why: "DPD-style CASE buckets — the aging ladder with a boundary someone will argue about; exactly-90-days discipline in graded form." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the double-entry read: money in, money out, net per book, cents read honestly." },
    { slug: "trial-balance-check", why: "The one-query proof that debits equal credits — the control under every consumer report this firm ships." },
    { slug: "dormant-reactivation", why: "Dormancy as a NOT-EXISTS read — 'no activity rows, not zero activity' — the anti-join definition behind the outreach list." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — the coverage census (exact / partial / none) where branch totals must reconcile to the whole." },
    { slug: "account-balance", why: "Running totals per account — the balance walk with explicit frames, the deposits-book daily read." },
    { slug: "running-total-for-different-genders", why: "Cumulative folds over population segments — the monthly spend walk shape treasury rides, one bucket at a time." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the honest-denominator drill with the NULL policy attached." },
    { slug: "monthly-transactions-ii", why: "Two-population month packets via UNION — settled versus unsettled by month, the stitched exception-report shape." },
    { slug: "daily-balance-interest", why: "Interest over a daily balance spine — the calendar-complete walk where a missing day silently under-accrues." },
    { slug: "fix-names-in-a-table", why: "KYC-grade name normalization — ALL-CAPS feeds fold to proper case before any per-customer match can work." },
    { slug: "customers-who-never-order", why: "The anti-join watchlist in textbook form — books with no rail hit are this query with the table names swapped." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window screening over transaction streams — the surveillance read that pairs with the structuring wall." },
    { slug: "transaction-velocity", why: "Burst detection over timestamps — velocity counts in time buckets, the consumer-fraud twin of the HAVING threshold screen." },
    { slug: "credit-utilization-bands", why: "CASE tiers over utilization ratios — the card-portfolio banding read: boundary operators are the documented policy, and the account sitting exactly on a line is the one the review argues about." },
    { slug: "chargeback-rate-ranking", why: "Rate computed per merchant, then ranked — the card-portfolio dispute read where the denominator's population is decided before the ratio exists." },
    { slug: "duplicate-charge-pairs", why: "Self-joined leg pairs with the ordering trick — each duplicate pair prints once, and the legitimate split plans stay out of the alert queue." },
    { slug: "expected-credit-loss", why: "Exposure folded per band, weighted by loss factor — the provision arithmetic where integer division and band scoping are the two places it lies." },
    { slug: "delinquency-roll-rates", why: "State-to-state movement rates between cycles — the LAG read that turns the aging ladder into a flow, exactly how the credit review narrates deterioration." },
    { slug: "loan-amortization-schedule", why: "Running balance with scheduled draws and payments — the deposits-adjacent walk where the frame discipline keeps every step tied to the books." },
    { slug: "portfolio-concentration-hhi", why: "Concentration folded from squared shares — the single-counterparty risk number the whale board feeds, computed from shares that must sum to the whole book." },
    { slug: "value-at-risk", why: "Tail quantiles over a loss distribution — the risk screen where percentile windows and the NULL policy decide what the desk reports as the number." },
    { slug: "balance-rollforward", why: "Opening balance plus movement lines equals closing — the rollforward identity every consumer report must reproduce before the pack publishes." },
    { slug: "deferred-revenue", why: "Money received before it is earned — the liability fold that keeps the confirmation book honest about what is billed versus what is banked." },
    { slug: "keep-latest-dedupe", why: "Keep-newest with a declared tiebreak — the restatement drill when a rail re-sends a leg: the newest copy wins, the removed rows are printed." },
    { slug: "second-most-recent-activity", why: "Per-counterparty argmax at rank 2 — the 'who lapsed since last cycle' screen the relationship desks live by, tie-breaker declared." },
    { slug: "maximum-transaction-each-day", why: "Per-day largest leg with tie discipline — the treasury surveillance board: biggest single movement per day, never decided by plan order." },
    { slug: "risk-based-pricing", why: "Rates joined to risk bands with an as-of rule — the pricing read where the band's own row supplies the factor and the boundary convention is policy." },
    { slug: "wash-trade-detection", why: "Offsetting-pair detection over one book — the surveillance self-join that flags legs moving against themselves, each pair printed once." },
    { slug: "circular-transfers", why: "Chain-following over movement legs — the treasury loop check: value that returns to its origin, found with self-joins and set logic, not by eyeball." },
  ],
};
