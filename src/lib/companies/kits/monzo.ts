// Monzo — Wave-8 (Task 96), fintech domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Coral-card neobanking SQL: the storefront db read as a money-movement sandbox —
// customers are account holders (region = market), orders are card authorizations
// (delivered = settled clean, shipped = settled with the settlement stamp, pending =
// pre-auth in flight, cancelled = declined by fraud/risk controls), order_items are
// the itemized basket lines behind each authorization (quantity = units, unit_price =
// shelf price), products are the merchant catalog SKUs, suppliers are the six
// savings-marketplace partner providers (rating = in-app stars, listings = products
// offered), invoices are bill-pot obligations, payments are the funding legs against
// them (INTEGER cents — the dollar read is amount_cents / 100.0), expenses are ops
// spend and ledger_entries are the double-entry core. Pool provenance:
// company-pools.md carries NO Monzo section — 0 tagged LC rows (dormant-reactivation
// is the lone Monzo-named slug, used in the problem pool) — so all 10 topic slug
// sets and the 32-problem pool are theme-curated from the theme menu and
// say so. Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const monzoKit: CompanyKit = {
  id: "monzo",
  domainId: "fintech",
  name: "Monzo",
  tagline: "Coral-card neobanking, pot by pot",
  accent: "text-rose-300",

  brief: [
    "**Monzo** is the coral-card neobank that turned the current account into software: savings live in pots, the salary sorter splits payday into bills and spending the moment money lands, and bill pots hold exactly enough for each upcoming bill. Around that core sit paid tiers (Plus, Perks, Max), a savings marketplace of partner providers, overdrafts, and a fraud stack that freezes the card in one tap. This kit maps the storefront db onto that world: 16 customers rows are account holders, 103 orders are **card authorizations** worth 34,833.28, and 251 order_items rows are the itemized basket lines behind them. The status map is fixed: delivered = {emerald:settled} (52, 50.5%), shipped = settled-with-stamp (30, 29.1%), pending = pre-auth in flight (14), cancelled = {rose:declined} (7, 6.8%).",
    "The data org reads one money spine at three grains. An authorization books at created_at and stamps shipped_at the day it settles against the balance — **82 of 103** carry the stamp, averaging **2.98 days** to settle with a 2–4 day spread, and the 14 pending rows have none yet (*a population definition, not a cleanup job*). Money sits one layer down: bill-pot obligations in invoices, funding legs in payments, both INTEGER cents — the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of spend sits with holders whose lifetime spend crosses 3,000 (71.2% above 2,000), which is why the Plus/Perks/Max upsell queue is a SQL artifact before it is a marketing one.",
    "Interview screens are census-then-denominator, and the interviewer asks the denominator out loud. A typical loop opens with a **two-grain market census** — EU runs 45 authorizations from 8 holders (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a decline share where the base is the whole test (*'does a pre-auth count in your denominator?'*), then into the engagement ladder where four holders sit tied at 4 authorizations and rank semantics become a product decision. Late rounds walk the {sky:14-month spend spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the base before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Monzo section — 0 tagged LC rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: authorization funnels, decline maps, pot-coverage classification, tie-heavy ladders and the cents-safe bill book. Do the topics in order, then run all six case studies on the live storefront db: the {rose:decline map} the fraud pod opens Monday with, the {emerald:split-settlement ladder} and the never-funded queue the month-close pod reads at every close, the pot-coverage bands, the month-over-month spend walk and the opex gate. Thirty MCQs, twenty-four theory probes, six cases and thirty-two problems are built for spaced practice rather than one sitting — rotate a topic block, then a case, and let the review intervals do the compounding. The bar to clear: *state the denominator and the definition before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:45 —** The day starts with the settlement feed. The analyst opens the money dashboard before standup: did the overnight funding legs post, does the one-pass status census reconcile — 52 settled + 30 stamped + 14 pre-auth + 7 declined = **103 by construction**? A branch that breaks that identity is *the day's first incident*, not a rounding note. If settlement latency drifts off the **2.98-day** norm, the {sky:pre-auth backlog} gets pulled before the risk standup, because a growing in-flight queue is either a rail problem or a fraud-hold problem and the SQL has to say which.",
    "**11:30 —** Midday tilts toward risk and product. The fraud pod wants the decline map re-cut — {rose:8.1% of APAC authorizations declined} against 5.3 in the US — with velocity windows beside it; the pots squad wants the concentration re-read, {amber:63.5% of spend} from 3,000-plus holders; the marketplace pod wants per-provider reads joined through to the bill book. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes every query twice — *once to answer, once with the denominator spelled out so the number survives the risk-review argument*.",
    "**15:30 —** The afternoon belongs to the close. The AR anti-join refreshes first — **6 never-funded bills worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-funded bill (#11, 925.00) and a paid-status bill with zero funding legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settlement latency", what: "Authorization to settle (created_at → shipped_at) over the 82 of 103 authorizations that carry the stamp: 2.98-day average, 2–4 spread. The population definition ships with the number — pre-auth rows have no cycle yet and must not dilute it." },
    { name: "Decline rate", what: "Cancelled share of booked authorizations: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The fraud stack's first read every Monday, and a conditional count whose denominator is the whole interview." },
    { name: "Card spend (GTV)", what: "Total authorized value: 34,833.28 across 103 authorizations, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — the tail is where Plus, Perks and Max live." },
    { name: "Pre-auth backlog", what: "Authorizations with no settlement stamp yet: 14 of 103 (13.6%). 'Not yet' is a population definition, never a silent zero — the 13.6% queue is either a rail delay or a fraud hold, and the census must say which." },
    { name: "Holder concentration", what: "Share of spend from holders whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The number that staffs the premium pod and sizes the paid-tier upsell queue." },
    { name: "Bill-pot coverage", what: "Funded versus billed: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-funded worth 15,217. The AR anti-join the bill-pot pod refreshes at every close." },
    { name: "Split-settlement share", what: "Bills funded by more than one pot-sweep leg: 5 of 28, each with exactly 2 legs. The multi-sweep pattern the salary-sorter plumbing review confirms at every close." },
    { name: "Ledger integrity", what: "Trial balance: 181,080 debits against 181,080 credits, delta zero. A branch here is a page, not a shrug — the close does not ship until the identity holds." },
  ],

  topics: [
    {
      name: "Authorization funnels & honest denominators",
      why: "Every Monzo screen opens with the money funnel: authorizations booked, settled with a stamp, declined by the fraud stack. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a pre-auth 'settled' — 14 versus 82 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "find-third-transaction", "structuring-detection"],
    },
    {
      name: "Two-grain market censuses",
      why: "Authorizations and cardholders are different grains of the same join, and every census here reports both: EU runs 45 authorizations from 8 holders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "customer-order-frequency"],
    },
    {
      name: "Joining holders to authorizations",
      why: "Holders carry market and join date; authorizations inherit them through joins, and the join type decides who survives. An authorization without a holder is corruption; a holder without authorizations is dormancy — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "students-and-examinations", "wash-trade-detection"],
    },
    {
      name: "Tie-heavy engagement ladders",
      why: "Ladders are rank-window reporting where ties are guaranteed — four holders sit at 4 authorizations each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about who gets the paid-tier call first.",
      slugs: ["rank-scores", "top-earners", "the-most-recent-three-orders", "rfm-segmentation"],
    },
    {
      name: "Tier banding with CASE",
      why: "Paid tiers are CASE-classified — Plus, Perks, Max — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the tier P&L, and a reordered WHEN quietly re-bands the base.",
      slugs: ["the-winner-university", "the-category-of-each-member-in-the-store", "weather-type-in-each-country", "delinquency-buckets", "ar-aging-schedule"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month spend spine (2024-01 to 2025-02) is the money review's home turf: prior month beside current, delta rounded, the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "average-time-of-process-per-machine", "second-day-confirmation", "maximum-transaction-each-day", "late-arriving-restatement", "consecutive-transactions-with-increasing-amounts", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled under declined, this month beside last — and EXCEPT answers 'which funded bills never settled clean'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "league-statistics"],
    },
    {
      name: "Nested folds & average gates",
      why: "Screens escalate into staging: fold ticket sizes, then judge them against the computed platform mean (338.19 here). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets settled, stamped, pre-auth and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "calculate-orders-within-each-interval", "odd-and-even-transactions"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not funded — the finance tables (28 bills, 27 legs, INTEGER cents) are where the account world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/never-funded coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "gl-reconciliation", "balance-rollforward", "journal-gap-detection", "prepayment-detection"],
    },
  ],

  theory: [
    {
      id: "monzo-t1",
      q: "Your account report joins holders to card authorizations. When do you INNER and when do you LEFT — and what silently breaks if you filter a settlement column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A spend report joins authorizations to holders: an authorization with no holder row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from holders: the holders with no authorizations ARE the answer, arriving with NULL authorization columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload holder row — the LEFT quietly became an INNER and the dormant cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the holder anti-join returns a confident zero — all 16 holders authorize somewhere — and proving that zero rather than assuming it is exactly the instinct a Monzo reviewer is grading.",
      tag: "joins",
    },
    {
      id: "monzo-t2",
      q: "Four holders tie at 4 authorizations on the engagement ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which silently decides whose pot gets the paid-tier upsell call first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer holders (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment, because at Monzo the ladder feeds a real call queue.",
      tag: "windows",
    },
    {
      id: "monzo-t3",
      q: "The census shows 103 authorizations and 16 holders; EU shows 45 authorizations and 8 holders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts authorization rows after the join — one row per authorization, so a holder with 24 authorizations contributes 24. COUNT(DISTINCT customer_id) folds those rows back to holders — EU's 45 authorizations collapse to 8 logos. Neither is wrong: authorizations measure load and engagement, holders measure installed base and coverage. The ratio — 5.6 authorizations per holder in EU versus 9.5 in the US on this db — is the intensity signal that decides whether the coral card is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for basket lines and COUNT(*) silently counts basket lines, not authorizations — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "monzo-t4",
      q: "shipped_at is NULL until an authorization settles. What is your policy for the settlement-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only settled authorizations have a latency, so the report measures booking-to-settlement for the 82 of 103 authorizations that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL authorizations returns the settled-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the settled subset; the gap between it and COUNT(*) is exactly the 14 pre-auth plus 7 declined rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for authorizations that have not even completed. A report whose WHERE clause is doing definitional work without saying so is exactly what a Monzo reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "monzo-t5",
      q: "The risk review wants decline share per market for markets carrying at least ten authorizations. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards settled and pre-auth rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-authorization floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; on this db it keeps EU (45), APAC (37) and the US (19) and drops LATAM's 2 — a stated scope, not a silent one. Putting the floor in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a risk line and an error, and between a threshold applied to authorizations versus to value. The strong answer places every filter by asking: is this a fact about one authorization, or about a market?",
      tag: "pipeline",
    },
    {
      id: "monzo-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 authorizations always produce a mean (338.19 platform-wide on this db). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average gate is how it hides. The correlated cousin (compare each authorization to ITS holder's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "monzo-t7",
      q: "The spend trend buckets authorizations by month on TEXT timestamps. How do you build the spine, cut a month without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The month window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-08-01' — because BETWEEN '2024-07-01' AND '2024-07-31' silently drops the last night's authorizations, and payday is exactly when they land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is money discipline: the spine, the window and the edge row are where spend trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "monzo-t8",
      q: "Finance says a bill is 'paid' but the funding-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: bills LEFT JOIN legs, keep p.id IS NULL — on this db that returns 6 never-funded bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why funding legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: bills and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-funded, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "monzo-t9",
      q: "The ops board gets settled, stamped, pre-auth and declined in one pass. Compare COUNT(*) FILTER (WHERE …) with the SUM(CASE …) twin — and what identity must hold before either ships?",
      a: "Both are single-scan branches over the same rows. COUNT(*) FILTER (WHERE status = 'delivered') counts only the branch's rows and is the readable native form; SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs on every engine, at the cost of more text. What they must never be is four separate queries — four scans can drift apart mid-run, and the census is defined by its identity: 52 + 30 + 14 + 7 = 103, the whole book, by construction. At Monzo a branch that breaks that identity is the day's first incident, so the reconciliation line goes in the query comment next to the fold itself.",
      tag: "aggregation",
    },
    {
      id: "monzo-t10",
      q: "Paid tiers and pot-coverage bands are both CASE classifications. What makes a banding CASE trustworthy — and why must the coverage arms key on funding legs, not on the status column?",
      a: "Three properties: the arms are exhaustive (an ELSE catches whatever the edges miss), they are ordered so later WHENs cannot silently shadow earlier ones, and every edge is a published constant, not a magic number. The pot-coverage census classifies each bill — exact when funded cents equal billed cents, partial when funding lands between zero and the bill, never-funded when no legs exist — and it must key on SUM(p.amount_cents) from the legs table because the status column is a claim, not a ledger. This db proves the point twice: bill #28 claims paid with zero legs and #11 claims void with one. Key the arms on the money that moved and the anomalies classify themselves into the buckets where the close can see them.",
      tag: "case",
    },
    {
      id: "monzo-t11",
      q: "The disputes queue wants duplicate-charge candidates: same holder, same total, close together. Walk me through the self-join and the predicate that keeps it honest.",
      a: "A self-join is the table joined to itself under two aliases — o1 and o2 — with the pairing predicate doing all the work: same customer_id, same total, o2.created_at within two days of o1.created_at, and o1.id < o2.id. The strict inequality is the honesty clause: it breaks symmetry so each pair appears once in one orientation, and it rules out the self-pair (A,A) that <= would leak in. Without it every candidate doubles and the queue double-contacts every customer. The follow-up the panel wants: pair-counting is a different grain from authorization-counting — 103 rows can produce far more pairs — so the report says 'suspect pairs', never 'suspect authorizations'.",
      tag: "joins",
    },
    {
      id: "monzo-t12",
      q: "An authorization's basket is itemized in order_items. What happens to every aggregate when you join it in — and how do you keep the money math correct at line grain?",
      a: "The join fans out: one authorization with three basket lines becomes three rows, so COUNT(*) now counts lines (251 across the book) where it used to count authorizations (103), and SUM(o.total) counts each authorization's total once per line — the spend total triples for three-line baskets. The discipline is to name the grain and aggregate at it. Line-level money is SUM(oi.quantity * oi.unit_price) — computed from the line's own columns, never from the parent's total. Authorization-level money is either aggregated before joining (fold lines to one row per order first) or folded per order with COUNT(DISTINCT o.id) for the census and the parent total kept out of the sum entirely.",
      tag: "joins",
    },
    {
      id: "monzo-t13",
      q: "How does a correlated subquery differ from a plain scalar one, and when would you reach for it in Monzo's screens?",
      a: "A plain scalar subquery folds once and its single value judges every row — the platform-mean gate, 338.19. A correlated subquery references the outer row, so the inner fold re-runs per row with a different scope each time: each authorization judged against ITS holder's own average ticket, holder 1 against roughly 302.60, a single-authorization holder against their only ticket. That answers questions the platform mean cannot — 'above whose baseline?' — which is the shape the amount-anomaly screens use. The cost is one fold per outer row, fine at 103 rows and a design conversation at scale; the empty-inner case returns NULL and makes the comparison UNKNOWN, so the population definition ships with the query.",
      tag: "subqueries",
    },
    {
      id: "monzo-t14",
      q: "The month-close packet stages folds before judging them. Walk me through the derived-table pattern — and what a CTE buys over it.",
      a: "The pattern is two stages with names. Inner stage: fold the raw grain — STRFTIME('%Y-%m', created_at) keys, COUNT(*) tickets, SUM(total) spend per month. Outer stage: judge the staged columns — gate on computed average ticket, rank, or diff against the prior month with LAG, all legal now because the computed columns are real columns of the derived table. The same SELECT alias that errors in WHERE is a plain column one level up. A CTE buys the identical semantics with named, reusable stages: WITH monthly AS (…) reads like the close packet's table of contents, can be referenced twice without recomputing, and keeps a four-stage build legible. Mechanically they are the same tool; editorially the CTE is self-documenting, which is why the close pods standardize on it.",
      tag: "subqueries",
    },
    {
      id: "monzo-t15",
      q: "How do PARTITION BY windows differ from GROUP BY folds, and where does the paid-tier team need the partition form?",
      a: "GROUP BY collapses — one row per group, detail gone. PARTITION BY keeps every row and attaches an aggregate computed over the row's partition: each authorization still visible, now carrying its holder's running spend (SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at)) or its rank inside the holder's own history. The paid-tier queue needs exactly that: flag authorizations that cross a holder's lifetime thresholds while keeping the authorization rows themselves, or rank each holder's tickets against their own baseline. The classic failure is dropping the PARTITION BY — the frame silently spans the whole table and every row reports the 34,833.28 grand total, which is a report of nothing.",
      tag: "windows",
    },
    {
      id: "monzo-t16",
      q: "The upsell queue is built from spend quartiles, not fixed thresholds. How does NTILE do that, and what does the panel expect you to say about its edge behavior?",
      a: "NTILE(4) OVER (ORDER BY total) deals the 103 authorizations into four near-equal buckets by spend — the top tile is the upsell queue, no hand-picked edges to defend. What you say out loud: tiles are positional, so 'quartile' means a quarter of the ROWS, not a quarter of the value range — the tail concentrates money far beyond a quarter of spend, which is precisely the 63.5%-from-3,000-plus-holders concentration this kit quotes. With ties at a boundary, NTILE assigns arbitrarily within the tied block, so the queue needs a stated tie-breaker (created_at, then id) to be reproducible. And like every window, it lives in a derived table if a later WHERE must filter on the tile number.",
      tag: "windows",
    },
    {
      id: "monzo-t17",
      q: "The settlement clock is julianday(shipped_at) - julianday(created_at). What does SQLite give you here, and where do date math and payday discipline meet?",
      a: "julianday converts a TEXT timestamp to a real day number, so the difference is fractional days — the settled book averages 2.98 with a 2-to-4 spread. STRFTIME('%Y-%m', created_at) builds the 14-month spine, DATE(created_at, '+1 month') walks boundaries, and half-open windows (>= start AND < next start) keep the last night in the right month — BETWEEN silently drops it, and payday lands exactly there. The panel also expects the population rule stated with the math: only the 82 stamped rows have a latency; averaging over all 103 silently shrinks the population while printing the same number. Date discipline and population discipline are the same discipline at Monzo — the query says both out loud.",
      tag: "dates",
    },
    {
      id: "monzo-t18",
      q: "Close packets stack and subtract populations. When do you reach for UNION, UNION ALL, INTERSECT and EXCEPT — and what does each one silently do?",
      a: "UNION ALL appends everything — the census stack (four status branches plus a TOTAL row) uses it because the branches are disjoint by construction, and the argument is written in the comment. UNION appends then dedups whole rows silently — safe only when duplicates are impossible, dangerous when a legitimate repeat looks identical. INTERSECT keeps rows present in both branches — holders settled in both January and February, say. EXCEPT keeps left-not-right rows — which funded bills never settled clean — and it is order-sensitive: A EXCEPT B is not B EXCEPT A. All four compare column lists positionally, so the branches must project the same columns in the same order or the comparison is fiction. The set-op audit at Monzo: every stack states its disjointness, every EXCEPT states its direction.",
      tag: "sets",
    },
    {
      id: "monzo-t19",
      q: "Merchant names arrive as 'AMZN MKTP', 'Amzn Mktp' and 'amzn mktp'. What is the hygiene pass before any join or GROUP BY, and why does Monzo treat it as money-critical?",
      a: "The pass is deterministic shaping before comparison: TRIM the padding, UPPER (or LOWER) for case-insensitive grouping, REPLACE for the known noise patterns, and a LENGTH/INSTR guard for malformed rows — the same family as fix-names-in-a-table. Unshaped, one merchant splits into three and every category budget splits with it; a JOIN on raw names quietly drops the mismatched halves. Monzo calls it money-critical because card analytics are merchant-keyed: the duplicate-charge check, the category budget, the fraud pattern 'A and B but never C' all break on identity, not on math. The rule the panel wants: shape once, in a staging step everyone shares — not ad hoc inside each analyst's query, where two analysts get two different merchants.",
      tag: "strings",
    },
    {
      id: "monzo-t20",
      q: "NULLIF and COALESCE both guard money math. Give the house rules for each — and the bug each one prevents.",
      a: "NULLIF(x, 0) is the divide-by-zero guard: it turns a fatal zero into NULL so the division returns NULL instead of erroring — a per-bill coverage ratio on bill #28 (zero legs) reads NULL, meaning 'no funding event', which is a different finding from a genuine 0.00. COALESCE(a, b, …) is the display-edge fallback: it substitutes a value for display, with the rule that the fallback must be a real business statement, not a habit — IFNULL(latency, 0) invents same-day settlements for authorizations that never settled, the exact bug the settlement-latency report forbids. The pair composes: NULLIF first to protect the arithmetic, COALESCE last to label the display. What never ships is a silent default in the middle of the pipeline, where the substitution happens before anyone can see it.",
      tag: "nulls",
    },
    {
      id: "monzo-t21",
      q: "WHERE can't see SELECT aliases, but ORDER BY can. Why the asymmetry — and what is the Monzo-legal workaround?",
      a: "It is pipeline order, not engine whim: FROM and WHERE run before SELECT computes its expressions, so an alias does not exist yet where WHERE evaluates; ORDER BY runs last, after the list exists, so it can use the alias. The same rule explains why aggregates are HAVING-only and why window functions are banned from WHERE entirely. The Monzo-legal workaround is staging: wrap the fold in a derived table or CTE so the computed column becomes a real column of the next stage, then filter it with a plain WHERE — the two-grain market census, the month gate and the top-N-per-market ladder all ship in that shape. Repeating the full expression in WHERE also works but fails the review: the expression must stay defined in exactly one place.",
      tag: "pipeline",
    },
    {
      id: "monzo-t22",
      q: "An analyst reports '103 authorizations, 251 basket lines' in one row. What went wrong with the grain, and what is the recovery?",
      a: "They joined orders to order_items and folded without naming the grain: COUNT(*) counted the fan-out rows — 251 lines, not 103 authorizations — and any SUM over a parent column (total) multiplied each authorization by its line count. The recovery is choosing the grain first and saying it in the column name: authorization grain keeps the parent table alone (COUNT(*) = 103, SUM(total) = 34,833.28), or folds lines per order first (COUNT over a per-order derived table); basket grain uses the line's own columns (SUM(quantity), SUM(quantity * unit_price)). COUNT(DISTINCT o.id) is the patch that rescues a fanned-out census, but the panel grades the upstream decision, not the patch: one row per WHAT, stated before the fold.",
      tag: "aggregation",
    },
    {
      id: "monzo-t23",
      q: "What is the audit-first habit at Monzo — what gets checked before any number leaves the analyst's laptop?",
      a: "Three checks, in order. Reconciliation: every status census must sum to the whole — 52 + 30 + 14 + 7 = 103 — and every money fold must reconcile to the book, 34,833.28. Anomaly walk: the standing row-level list gets read line by line, bill #11 (void, yet carries a 925.00 leg) and bill #28 (paid, zero legs) being the canonical pair — one is a status that lies about money that moved, the other about money that never did. Population statement: the title or comment says who is inside the number — the 2.98-day latency is over the 82 stamped rows, not the book. Only then does the number travel. The habit exists because at a bank a number is a decision: the decline map tunes step-up rules the same afternoon it is built.",
      tag: "quality",
    },
    {
      id: "monzo-t24",
      q: "The status census scans slowly at production scale. What does the panel expect you to know about indexes here — and about EXPLAIN QUERY PLAN?",
      a: "First, that low-cardinality columns are poor bare indexes: status has four values, so a plain index on it rarely beats a scan — the useful composite is (customer_id, created_at) or (status, created_at), which serves both the per-holder walks and the filtered census as a covering index, so the query answers from the index without touching the table. Second, that you verify with EXPLAIN QUERY PLAN rather than folklore: it prints SCAN versus SEARCH and whether the index is used, and the panel wants you to read it before claiming a speedup. Third, honest scoping: at 103 rows none of this matters — index design is a production-scale answer, and saying 'at this size, measure first' is itself the strong answer.",
      tag: "performance",
    },
  ],

  mcqs: [
    {
      id: "monzo-mcq-1",
      prompt: "An authorization row's status reads 'cancelled'. In this kit's Monzo stage map, what happened?",
      choices: ["The fraud/risk rules declined it — refused at authorization", "It settled but the ledger has not posted it yet", "It is a pre-auth check awaiting capture", "The cardholder reversed it after settlement"],
      answer: 0,
      why: "The stage map is fixed: cancelled = declined (7 of 103 authorizations, 6.8%) — the fraud stack or risk rules refused the authorization, so nothing settles.",
      notes: [
        { choice: 1, why: "That stage does not exist here — the db's pending is pre-auth IN FLIGHT (14 rows), not post-settlement lag. Inventing stages is how reconciliations drift." },
        { choice: 2, why: "Pre-auth is 'pending' — 14 rows carrying no stamp. Pre-auth is not declined; it stays in the denominator as 'not yet'." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-2",
      prompt: "Settlement share is stamped authorizations ÷ which population? The db holds 82 stamped, 14 pre-auth and 7 declined of 103 booked.",
      choices: ["Stamped + declined only (82/89 = 92.1%)", "All authorizations booked (82/103 = 79.6%)", "Delivered captures only (52/82)", "Distinct cardholders (82/16)"],
      answer: 1,
      why: "The house definition: settled ÷ ALL authorizations booked — the 14 pre-auth rows stay in the denominator because 'not yet settled' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pre-auth inflates the rate to 92.1% by deleting the population still in flight — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two stages into one rate — delivered is the clean-capture bucket, the stamp marks settlement. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-3",
      prompt: "EU carries 45 authorizations from 8 cardholders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts authorization rows (45); COUNT(DISTINCT customer_id) folds repeats back to holders (8). The gap between them — 5.6 authorizations per holder — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every authorization carries a holder. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not holders — a third grain nobody asked for. The census is authorizations AND cardholders." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to declined authorizations only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the decline map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-5",
      prompt: "Keep only markets carrying at least 10 authorizations. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE authorizations >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "An authorization-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US (19) clear a 10-authorization bar; LATAM's 2 do not.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'authorizations' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 authorizations, then FOUR holders tied at 4. Under RANK, what rank do the two 3-authorization holders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-authorization holders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The ladder's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pre-auth authorizations double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the settled-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 authorizations.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-8",
      prompt: "A staging-table fraud list uses holder_id NOT IN (SELECT customer_id FROM authorizations WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every authorization carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty fraud reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-9",
      prompt: "A close packet puts settled authorizations under declined authorizations in one layout, built with UNION. A reviewer says one holder's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same holder, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same holder, same counts, no market or branch label — collapse into one, and the packet loses a holder with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-10",
      prompt: "A dashboard walks pot balance leg by leg: SUM(amount) OVER (ORDER BY posted_at). Two legs share a posted_at second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on posted_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly leg by leg. On a day spine ties are rare; at funding-leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-11",
      prompt: "The settlement census runs WHERE shipped_at IS NOT NULL and counts 82 authorizations. Which statuses are inside that population?",
      choices: ["delivered and shipped — settled clean plus settled-with-stamp", "delivered only — the stamp marks clean captures", "shipped only — the stamp IS the settlement event", "delivered, shipped and pending — everything still in flight"],
      answer: 0,
      why: "The stamp lives on shipped_at, and both settled stages carry it: delivered (52) and shipped (30) = 82. Pending (14) and cancelled (7) carry no stamp — 82 + 14 + 7 reconciles to 103 by construction.",
      notes: [
        { choice: 1, why: "Delivered alone is 52 — the clean-capture bucket. Dropping the 30 stamped-settled rows misnames the metric and the 2.98-day latency average loses a third of its population." },
        { choice: 2, why: "Shipped alone is 30 — one stage, not the settled population. The census must reconcile upward, and 30 never does." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-12",
      prompt: "A month spine is built with STRFTIME('%m', created_at) and returns 12 buckets instead of the expected 14. What happened?",
      choices: ["Three months had zero authorizations and were dropped", "'%m' prints the month without the year — January 2024 and January 2025 merge into one bucket", "The timestamps are stored in UTC and lost a day", "GROUP BY collapses buckets with equal spend"],
      answer: 1,
      why: "'%m' is month-only, so 2024-01 and 2025-01 fold together — the 14-month spine (2024-01 to 2025-02) becomes 12 merged buckets and every month-over-month delta is fiction. The spine key is '%Y-%m': year plus zero-padded month.",
      notes: [
        { choice: 0, why: "Every month on this db carries at least 6 authorizations — there are no empty months to drop. A wrong key changing the bucket COUNT is the tell, not the data." },
        { choice: 3, why: "GROUP BY groups by the key you give it — it merged exactly what you asked it to. The bug is in the key, not the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-13",
      prompt: "The opex roll-up prints the Rent category at 16,800.00 from 1,680,000 stored cents. Which expression is the cents-safe read?",
      choices: ["SUM(amount_cents) / 100 — integer math is exact on whole euros", "ROUND(SUM(amount_cents) / 100, 2)", "SUM(amount_cents) / 100.0 — promotes to real arithmetic before dividing", "SUM(amount_cents) — cents are the honest unit for a report"],
      answer: 2,
      why: "The house rule: divide by 100.0 exactly once, at the display edge. The .0 promotes the division to real arithmetic, so odd-cent rows keep their pence; integer / 100 truncates them silently.",
      notes: [
        { choice: 0, why: "Whole-euro totals hide the leak — the first odd-cent category loses its remainder with no error anywhere. Rent happens to be whole; the rule exists for the rows that are not." },
        { choice: 3, why: "Cents are the honest STORAGE unit, not the honest REPORT unit — the money desk reads euros, and 1,680,000 on a slide is a units error." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-14",
      prompt: "The dormancy report LEFT JOINs holders to authorizations and keeps the unmatched side — zero rows return. What is the correct read?",
      choices: ["The join is broken — holders always survive a LEFT JOIN", "Zero dormant holders is a finding: all 16 holders carry at least one authorization — state it, then prove it with a COUNT", "The query needs DISTINCT before the NULL test works", "Anti-joins cannot legitimately return zero — rerun on a bigger sample"],
      answer: 1,
      why: "A confident zero is still a result. On this db every one of the 16 holders authorizes somewhere, so the anti-join is genuinely empty — the strong answer names the population (16 holders), the predicate (p.id IS NULL), and the proof (a count that reconciles).",
      notes: [
        { choice: 0, why: "LEFT JOINs keep unmatched left rows — but if there ARE no unmatched rows, zero is exactly right. Distrusting a correct zero is as bad as trusting a broken one." },
        { choice: 2, why: "DISTINCT dedups rows; it has nothing to do with the NULL test. Sprinkling DISTINCT to 'fix' a zero is cargo-cult SQL." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-15",
      prompt: "Keep only markets whose average ticket beats the platform's 338.19 — but avg_ticket is not in the SELECT list. Which clause can still judge it?",
      choices: ["WHERE AVG(total) > 338.19", "HAVING AVG(total) > 338.19 — aggregates are judgeable after GROUP BY whether or not they are projected", "ORDER BY AVG(total) > 338.19", "It is impossible without projecting the column first"],
      answer: 1,
      why: "HAVING evaluates after groups form, so it can fold any aggregate over the group — projected or not. On this db the gate keeps LATAM (426.22) and the US (383.48) and drops APAC (313.66) and EU (335.32).",
      notes: [
        { choice: 0, why: "WHERE runs before GROUP BY — aggregates do not exist yet, and the engine rejects the query. Pipeline order is the lesson, not a style rule." },
        { choice: 3, why: "Projection is presentation; HAVING is judgment. Requiring the column in SELECT confuses the two — and would bloat every gated report." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-16",
      prompt: "A holder-by-holder running authorization walk uses SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at). What breaks if the PARTITION BY is dropped?",
      choices: ["Nothing — PARTITION BY is cosmetic when ORDER BY is present", "The frame stops working entirely and the query errors", "Every row carries the same grand total instead of its holder's running spend — the partition is what scopes the frame per holder", "The walk deduplicates repeat authorizations"],
      answer: 2,
      why: "PARTITION BY scopes the window per holder: each walk restarts at that holder's first authorization. Drop it and the frame spans the whole table — every row prints the 34,833.28 grand total, a report of nothing.",
      notes: [
        { choice: 0, why: "ORDER BY alone still orders the frame — over ALL rows. The walk looks plausible row by row and is wrong everywhere; that is what makes the missing partition dangerous." },
        { choice: 2, why: "The frame still works without a partition — it just works over the wrong scope. Errors are easier to catch than silently-wrong scopes." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-17",
      prompt: "The fraud pod wants each heavy holder's distinct statuses in one cell: GROUP_CONCAT(DISTINCT o.status). What does the DISTINCT guarantee — and what does it not?",
      choices: ["Distinct values, guaranteed alphabetical order", "Distinct values, no order guarantee — the comma order is whatever the scan produced", "All values including repeats, sorted ascending", "Distinct values, semicolon-separated"],
      answer: 1,
      why: "DISTINCT folds repeats — a holder touching delivered, shipped and pending reads 'delivered,shipped,pending' — but GROUP_CONCAT's order is an implementation detail, not a contract. A report that parses position out of that cell is parsing luck; deterministic order needs an ordered subquery feeding the fold.",
      notes: [
        { choice: 0, why: "SQLite commonly happens to emit sorted values on small sets, which is exactly why this myth survives — and why it breaks on bigger tables. 'It looked sorted' is not a specification." },
        { choice: 3, why: "The default separator is a comma; a semicolon needs the two-argument form GROUP_CONCAT(x, '; '). Both facts are checkable, neither is what DISTINCT controls." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-18",
      prompt: "The ops board's one-pass census uses COUNT(*) FILTER (WHERE status = 'cancelled'). A teammate must port it to a warehouse that lacks FILTER. What is the portable twin?",
      choices: ["SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)", "COUNT(status = 'cancelled')", "AVG(CASE WHEN status = 'cancelled' THEN 1 END)", "MAX(CASE WHEN status = 'cancelled' THEN 1 END)"],
      answer: 0,
      why: "SUM over a 0/1 CASE flag is the portable one-pass pattern — same scan, same reconciliation to 103, runs on every engine. FILTER (WHERE …) is nicer syntax where it exists; the CASE twin is the fallback that always exists.",
      notes: [
        { choice: 1, why: "COUNT takes an expression and counts non-NULL results — 'status = cancelled' is 0 or 1, never NULL, so this counts every row. The census would read 103 in every branch." },
        { choice: 2, why: "AVG of a 1-when-CASE returns the share, not the count — 0.068, not 7. A subtly different metric wearing the same name; the risk deck's totals would stop reconciling." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-19",
      prompt: "A payday analysis pulls July's authorizations with created_at BETWEEN '2024-07-01' AND '2024-07-31'. What is wrong with the window?",
      choices: ["Nothing — BETWEEN is inclusive on both ends by design", "Timestamps carry time components, so '2024-07-31 09:41:00' sorts after '2024-07-31' and the whole last day drops — the window must be half-open: >= '2024-07-01' AND < '2024-08-01'", "BETWEEN cannot compare TEXT timestamps", "The year must be included in both bounds"],
      answer: 1,
      why: "The stored values are full timestamps, and string comparison puts anything after midnight on the 31st outside the BETWEEN bound — payday is exactly when those rows land. Half-open intervals [start, next-start) are the house discipline: the upper bound is the FIRST instant you want to exclude.",
      notes: [
        { choice: 0, why: "Inclusiveness is the bug, not the fix: BETWEEN is inclusive of an upper bound that is really a day-start, silently truncating the period's tail." },
        { choice: 2, why: "TEXT ISO-8601 timestamps compare correctly lexicographically — the format is sortable by construction. The failure is the bound, not the comparison." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-20",
      prompt: "Flag authorizations above THEIR holder's own average ticket: total > (SELECT AVG(t2.total) FROM orders t2 WHERE t2.customer_id = o.customer_id). What does this query do?",
      choices: ["It fails — you cannot reference the outer table inside a subquery", "It runs: the inner fold re-runs per outer row, comparing each authorization to its own holder's baseline — a different question from the platform-mean gate, at a per-row cost", "It silently compares everything to the platform average of 338.19", "It returns each holder's average instead of the flagged rows"],
      answer: 1,
      why: "The correlated reference is the whole point: each outer row re-runs the inner fold scoped to ITS holder. Holder 1's average (7,262.35 over 24 authorizations ≈ 302.60) judges holder 1's rows; the platform mean never enters. The cost is one fold per row — fine at 103 rows, a design decision at millions.",
      notes: [
        { choice: 0, why: "Correlated references are exactly what makes a subquery correlated — the feature, not a bug. Confusing scalar-subquery rules with correlation rules is the trap." },
        { choice: 3, why: "A WHERE clause filters rows; it does not project aggregates. The query returns the above-baseline authorizations — one row per flag, not one row per holder." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-21",
      prompt: "The growth deck gates months by computed average ticket: the filter avg_ticket > 338.19 sits OUTSIDE the derived month spine. Why can it not live inside?",
      choices: ["WHERE cannot reference SELECT-list aliases of the same query — the fold must materialize first, then the outer query filters the staged result", "It could — HAVING works fine there", "Derived tables cannot be filtered once built", "The 338.19 constant is only visible outside a subquery"],
      answer: 0,
      why: "A WHERE clause in the same SELECT evaluates before the SELECT list computes — the alias does not exist yet, so gating on it errors. Staging the fold in a derived table (or CTE) makes the computed column a real column the outer WHERE can judge. That two-stage shape is the standard Monzo escalation.",
      notes: [
        { choice: 1, why: "HAVING filters groups, and could judge AVG(total) directly — but 'the computed alias' in HAVING has the same visibility problem. The staging answer is the general one." },
        { choice: 2, why: "Filtering derived tables is their main job. The restriction is about WHEN an alias exists, not WHERE the table sits." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-22",
      prompt: "The duplicate-charge check pairs same-holder authorizations of equal total within two days: orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id. Why the o1.id < o2.id?",
      choices: ["It forces the optimizer onto an index", "It breaks symmetry: without it every match returns twice — (A,B) and (B,A) — and with <= on ids the self-pair (A,A) leaks in, double-counting the queue", "It deduplicates the statuses before pairing", "It is cosmetic; the DISTINCT keyword removes the extras"],
      answer: 1,
      why: "A self-join pairs every row with every row, so each true pair appears in both orders and every row pairs with itself. The strict inequality keeps exactly one orientation of each pair and no self-pairs — the disputes queue reads each suspect once. DISTINCT cannot fix a pairing that is wrong at the join.",
      notes: [
        { choice: 0, why: "Nothing about the predicate hints the optimizer; it is a correctness constraint. Perf answers to EXPLAIN, correctness answers to the predicate." },
        { choice: 3, why: "DISTINCT dedups whole result rows — but (A,B) and (B,A) differ in column order, so they are different rows and both survive. The duplicates here are structural." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-23",
      prompt: "The close packet stacks four single-status census branches plus a 'TOTAL' row with UNION ALL. Why UNION ALL rather than UNION?",
      choices: ["UNION ALL is just faster — the results are identical either way", "The branches are disjoint by construction, but UNION silently dedups byte-identical rows — if two branches ever tie, a real row vanishes without a whisper; UNION ALL plus a stated disjointness argument is the auditable choice", "UNION cannot stack more than two branches", "UNION ALL preserves row order, UNION does not"],
      answer: 1,
      why: "The four branches partition by status, so no cross-branch duplicates can exist — and saying WHY is the correctness argument the reviewer wants written down. UNION would also return the same rows today, but it turns 'disjoint by construction' into an assumption the engine silently enforces by deleting data.",
      notes: [
        { choice: 0, why: "'Identical results today' is exactly the trap — UNION's dedup is invisible until two branches collide, and then it deletes a true row. Speed is the footnote; dedup semantics are the story." },
        { choice: 3, why: "Neither UNION nor UNION ALL guarantees order — the stack needs its own ORDER BY. Sort stability is a different (and also unguaranteed) claim." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-24",
      prompt: "On the 103-authorization book, what does COUNT(shipped_at) return — and why?",
      choices: ["103 — COUNT counts rows regardless of content", "82 — it counts non-NULL values only: the 14 pre-auth and 7 declined rows carry no stamp", "89 — settled plus declined", "16 — one per holder"],
      answer: 1,
      why: "COUNT(column) skips NULLs; COUNT(*) counts rows. The 21-row gap between COUNT(shipped_at) and COUNT(*) is exactly the pre-auth backlog plus declines — the census uses that gap on purpose.",
      notes: [
        { choice: 0, why: "That is COUNT(*). The column form is how the census counts settlement events without a WHERE clause — the same scan serves both numbers." },
        { choice: 2, why: "Declined rows never settle, so their stamp stays NULL forever — they are outside COUNT(shipped_at) by definition. 89 mixes two populations into the count." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-25",
      prompt: "The growth deck wants the three biggest tickets per market. A teammate writes WHERE total <= (SELECT third-biggest...) and it collapses. What is the fix?",
      choices: ["It works — the subquery just needs LIMIT 1", "Per-group ranking cannot live in WHERE — rank inside a derived table with ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC), then filter rn <= 3 in the outer query", "LIMIT 3 applies per group — add it to the inner query", "Move the filter to HAVING"],
      answer: 1,
      why: "Top-N-per-group is a window shape: the rank only exists after grouping, and window functions are not allowed in WHERE at all. Stage the ranking in a derived table, then the outer WHERE filters a plain column — the same two-stage escalation as every other computed gate in this kit.",
      notes: [
        { choice: 0, why: "Third-biggest differs per market — one scalar subquery cannot know which market the outer row belongs to without correlating, and even then ties at the boundary break it. The window form handles ties explicitly." },
        { choice: 2, why: "LIMIT applies to the whole result set, once — 3 rows total, not 3 per market. It cannot see the groups at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-26",
      prompt: "The savings-marketplace pod wants the partner with the highest in-app stars. Which single-table fold returns it?",
      choices: ["SELECT name, rating FROM suppliers ORDER BY rating DESC LIMIT 1 — Alpine Audio GmbH at 4.8", "SELECT MAX(name) FROM suppliers", "SELECT name FROM suppliers WHERE rating = AVG(rating)", "SELECT name, COUNT(rating) FROM suppliers GROUP BY name"],
      answer: 0,
      why: "Highest-rating is a sort-then-take read over the six partner rows — ORDER BY rating DESC LIMIT 1. Alpine Audio GmbH tops the ladder at 4.8, ahead of Nordic Gadgets at 4.6.",
      notes: [
        { choice: 1, why: "MAX over names returns the alphabetically-last name — a string fold answering a numeric question. MAX(rating) would return the value but not the partner." },
        { choice: 2, why: "An aggregate cannot appear in WHERE — the engine rejects it, and even if it ran, rating = average would return the mid-table partner, not the top." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-27",
      prompt: "The merchant catalog groups into spend categories. Which fold returns the category names with their SKU counts?",
      choices: ["SELECT category, COUNT(*) FROM products GROUP BY category", "SELECT DISTINCT category FROM orders", "SELECT SUM(category) FROM products", "SELECT category, COUNT(*) FROM products GROUP BY supplier_id"],
      answer: 0,
      why: "Group the catalog by its own category column and count rows: seven categories on this db — Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables. The fold is the catalog census every pricing review opens with.",
      notes: [
        { choice: 1, why: "orders has no category column — categories live on products, reached through order_items. DISTINCT over the wrong table is a schema-reading error." },
        { choice: 3, why: "Grouping by supplier_id counts SKUs per partner — a different census entirely (six partners, not seven categories). Grain discipline starts with naming the grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-28",
      prompt: "The close gate: the ledger trial balance must read debits against credits with the delta printed. Which query IS the gate?",
      choices: ["SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — the close reads the delta, not a boolean", "SELECT SUM(debit_cents) = SUM(credit_cents) AS balanced FROM ledger_entries", "SELECT account, SUM(debit_cents) FROM ledger_entries GROUP BY account", "SELECT COUNT(debit_cents), COUNT(credit_cents) FROM ledger_entries"],
      answer: 0,
      why: "The gate is the three-fold: 181,080 debits, 181,080 credits, delta 0. A boolean (choice B) says balanced-but-not-by-how-much when it breaks — useless at 23:45 on close night. The delta column turns every failure into a magnitude the incident can be opened against.",
      notes: [
        { choice: 1, why: "True/false with no magnitude is the classic close-night trap: the page says 'unbalanced', the on-call asks 'by how much', and nobody knows until someone runs the real query." },
        { choice: 2, why: "Per-account folds are the diagnostic AFTER the gate fails. The gate itself is one scan over the whole ledger, both sums side by side." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-29",
      prompt: "A coverage ratio divides funded cents by bill cents per bill — but bill #28 has zero funding legs. Which guard divides safely?",
      choices: ["funded_cents / NULLIF(legs, 0) — NULLIF returns NULL on the zero, the division returns NULL, and the row reports NULL instead of erroring", "COALESCE(funded_cents / legs, 0) — zero is the honest coverage for an unfunded bill", "IFNULL inside aggregates is not allowed", "AVG(funded_cents) / COUNT(*) — aggregates cannot divide"],
      answer: 0,
      why: "NULLIF(x, 0) turns the fatal zero into NULL and the division follows — the ratio reads NULL, which says 'no funding event', distinct from a genuine 0.00-of-something. On this db #28 is exactly the row the guard exists for: paid-status, zero legs, and a coverage figure that must NOT read as a clean zero.",
      notes: [
        { choice: 1, why: "Zero coverage and NO coverage are different findings — one is a small bill, the other is bill #28 lying about its own status. Coalescing to 0 erases the anomaly the close needs to see." },
        { choice: 3, why: "IFNULL/COALESCE are scalar functions — they compose with aggregates fine. The objection is invented; the real issue is what the guarded value should BE." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-30",
      prompt: "Three shapes find holders with NO declined authorizations: NOT IN (subquery), LEFT JOIN … WHERE p.id IS NULL, and NOT EXISTS. Which is the house pick, and why?",
      choices: ["NOT IN — it is the shortest to write and read", "NOT EXISTS — the correlated probe short-circuits on first match, and a NULL in the probed column cannot poison the whole result the way it can with NOT IN", "LEFT JOIN IS NULL — it is always the fastest", "They are identical in result and cost on every input"],
      answer: 1,
      why: "NOT IN empties the entire result the moment the subquery yields one NULL — three-valued logic, silently. NOT EXISTS asks 'is there even one declined row for this holder?' and stops at the first hit, and NULLs simply fail the probe row-by-row without poisoning anything. On a clean core db all three agree; on staging tables only NOT EXISTS is safe by construction.",
      notes: [
        { choice: 0, why: "Shortest is not safest — this is the same NOT IN NULL trap as the fraud-list query, now on the happy side of the predicate. One NULL and the cohort reads empty." },
        { choice: 2, why: "The anti-join shape is correct and NULL-safe too — 'always fastest' is the wrong reason and usually false; planners turn NOT EXISTS into the same anti-join anyway. Pick shapes for semantics, then measure." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-monzo-1",
      tier: "easy",
      topic: "j7",
      universe: "fraud",
      title: "The decline map",
      brief:
        "Monzo-flavored brief on the storefront db: Monday's risk review opens with the decline map — card authorizations, distinct cardholders and the share the fraud stack refused, per market. Probed facts: 103 authorizations worth 34,833.28; 7 declined platform-wide (6.8%), and the market split reads EU 45 authorizations from 8 cardholders at a 335.32 average ticket with 6.7% declined, APAC 37 from 5 at 313.66 with 8.1%, US 19 from 2 at 383.48 with 5.3%, LATAM 2 from 1 at 426.22 with none. The review reads the biggest authorization book first.",
      ask: "Return each market with its authorization count, distinct cardholder count, average ticket to 2 decimals and decline share to 1 decimal, biggest book first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS authorizations,\n       COUNT({1} o.customer_id) AS cardholders,\n       ROUND(AVG(o.total), {2}) AS avg_ticket,\n       ROUND(100.0 * SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) / COUNT(*), {4}) AS decline_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY authorizations {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the cardholder deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat authorizations back to holders: EU reads 8, not 45. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the ticket precision",
          why: "Average tickets report to 2 decimals — EU's 335.32. ROUND(…, 1) prints 335.3 and the market map stops reconciling with the 338.19 platform average the review quotes on the same slide.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the declined literal",
          why: "Declined authorizations are status 'cancelled' — 7 on the db, 3 of them APAC. 'delivered' would count the 52 settled captures into the decline column and the fraud map reads an invented 53.3% crisis exactly where the card worked.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Decline shares report to 1 decimal — APAC 8.1, EU 6.7, US 5.3. ROUND(…, 0) collapses the ladder to 8 / 7 / 5 and the APAC-versus-US gap the risk pod acts on disappears.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads the biggest authorization book on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's 2 rows — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "'delivered'", "0", "ASC"],
      walkthrough:
        "One join, one fold, four columns. The join attaches every authorization to its holder's market and GROUP BY folds them into four rows where COUNT(*) reads the book (EU 45, APAC 37, US 19, LATAM 2), COUNT(DISTINCT o.customer_id) reads holder coverage (8 / 5 / 2 / 1), ROUND(AVG(o.total), 2) reads the average ticket (335.32 / 313.66 / 383.48 / 426.22) and the CASE share reads declines (6.7 / 8.1 / 5.3 / 0) — all straight from the probed census, and the decline column reconciles upward to 7 of 103 platform-wide. The distractors fail honestly: SUM in the holder slot adds customer ids together and MAX reports the largest id — a census of nothing; 0 as either precision truncates the ticket to whole units and the share ladder to 7 / 8 / 5; 'delivered' counts the 52 settled captures as declines and invents a 53.3% crisis in EU; ASC opens the review on LATAM's 2 rows. The two-grain pairing is the read: EU's 45-from-8 (5.6 authorizations per holder) is breadth, the US's 19-from-2 (9.5) is concentration — one query, two different growth stories for the coral card.",
    },
    {
      id: "cs-monzo-2",
      tier: "medium",
      topic: "t5",
      universe: "month-close",
      title: "The split-settlement ladder",
      brief:
        "Monzo-flavored brief on the storefront db: the bill-pot pod's month-close wants the split-settlement ladder — bills funded by MORE THAN ONE pot-sweep leg, biggest first — to confirm the multi-sweep plumbing is doing its job. Probed facts: the book holds 28 bills against 27 funding legs, money in INTEGER cents; exactly 5 bills settled in 2 legs — ids 1, 5, 12, 19, 22 — at 4,860.00 / 5,284.00 / 4,723.00 / 5,614.00 / 4,459.00; the traps are known: bill #28 claims paid with ZERO legs (1,756.00) and bill #11 claims void yet carries one leg (925.00). The ladder reads biggest amount first.",
      ask: "Return each split-settled bill with its status, dollar amount to 2 decimals, funding-leg count and a RANK ordered by amount, biggest first.",
      template:
        "SELECT i.id AS bill_id,\n       i.status AS status,\n       ROUND(i.amount_cents / {1}.0, 2) AS amount,\n       COUNT(p.id) AS settlement_legs,\n       RANK() OVER (ORDER BY i.amount_cents {2}) AS split_rank\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE i.status = {3}\nGROUP BY i.id\nHAVING COUNT(p.id) > {4}\nORDER BY split_rank;",
      slots: [
        {
          answer: "100",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "Bills carry INTEGER cents, so the dollar read is amount_cents / 100.0 — bill #19 prints 5,614.00. / 10.0 would print 56,140.00 and / 1000.0 would print 561.40; neither reconciles against anything on the ledger.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "The close reads the ladder biggest amount first: 5,614.00 down to 4,459.00. ASC hands the review the smallest bill on rank 1 and the review order inverts while every other cell stays true.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the paid-book scope",
          why: "The ladder reads the paid book — but status is a claim, legs are the truth: bill #28 says paid with zero legs and #11 says void with one. 'open' empties the ladder to zero rows; the legs gate, not the status, defines a split settlement.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the split gate",
          why: "HAVING COUNT(p.id) > 1 keeps exactly the bills funded by more than one pot-sweep leg — the five split settlements (1, 5, 12, 19, 22), each with 2 legs. > 2 empties the ladder; > 0 floods it with every paid bill carrying any leg at all.",
        },
      ],
      distractors: ["10", "1000", "'open'", "ASC", "2"],
      walkthrough:
        "Two stages in one pass: scope the paid book, then rank it. The LEFT JOIN attaches every funding leg to its bill, GROUP BY folds legs per bill, and the legs gate keeps only bills funded by more than one pot sweep — exactly the five split settlements the probe knows, ids 1, 5, 12, 19, 22, each with 2 legs — while RANK() OVER (ORDER BY amount_cents DESC) hands the close a biggest-first ladder: 5,614.00, 5,284.00, 4,860.00, 4,723.00, 4,459.00. The cents rule does the money: amount_cents / 100.0, because the raw book is INTEGER cents — the missing .0 is how a bill prints a hundredth of its value. The status scope is belt-and-braces, and the walkthrough says why: #28 claims paid with zero legs and #11 claims void with one — status is a claim, legs are the ledger, so the split definition lives in the legs gate. The distractors each break differently: / 10.0 and / 1000.0 reprice every bill by ten times or a tenth; 'open' empties the ladder to zero rows; ASC hands rank 1 to the 4,459.00 bill; and > 2 dissolves the split cohort entirely — the multi-sweep pattern this close exists to confirm would be reported as nonexistent.",
    },
    {
      id: "cs-monzo-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month spend walk",
      brief:
        "Monzo-flavored brief on the storefront db: the growth review reads the 14-month spend spine (2024-01 to 2025-02) with each month's prior value beside it, because the salary-sorter argument is about direction, not levels. Probed facts: the spine carries 6-to-9 authorizations per month; the book opens at 3,731.97 in 2024-01 (no prior month — the delta is NULL by definition), slides to the 1,193.86 July trough, then snaps 2024-08 to 2,352.07. The biggest single drop is 2024-11 at 1,648.80 (-1,326.87 against October) and the biggest jump is 2024-08 (+1,158.21). The review reads the spine chronologically.",
      ask: "Return each month with its authorization count, spend to 2 decimals, and the month-over-month delta rounded to 2 decimals, chronological order.",
      template:
        "SELECT m AS month,\n       tickets,\n       ROUND(value, {1}) AS spend,\n       ROUND(value - {3}(value) OVER (ORDER BY m), 2) AS mom_delta\nFROM (\n  SELECT STRFTIME({2}, created_at) AS m,\n         COUNT(*) AS tickets,\n         SUM(total) AS value\n  FROM orders\n  GROUP BY m\n)\nORDER BY m;",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the spend precision",
          why: "Spend prints to 2 decimals to reconcile with the ledger — 3,731.97, 1,193.86. ROUND(…, 0) prints whole units and the packet stops reconciling with the 34,833.28 book total quoted on the same slide.",
        },
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key",
          why: "'%Y-%m' keys year plus zero-padded month — 14 buckets, 2024-01 to 2025-02. '%m' alone merges January 2024 with January 2025 into one bucket and every delta on the spine becomes fiction.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookup",
          why: "LAG(value) OVER (ORDER BY m) reads the previous month's spend so the delta is current-minus-prior. LEAD reads the NEXT month and silently flips every sign — drops read as jumps, and the growth deck argues the opposite of the data.",
        },
      ],
      distractors: ["'%m'", "DESC", "LEAD"],
      walkthrough:
        "Two stages: build the spine, then walk it. The inner fold buckets 103 authorizations by month key — STRFTIME('%Y-%m', created_at), 14 buckets from 2024-01 to 2025-02, each carrying its ticket count (6 to 9) and spend. The outer query attaches LAG(value) OVER (ORDER BY m) — the prior month's spend — and the delta is current minus prior, rounded to 2 decimals: the book opens at 3,731.97 with a NULL delta (no prior row — the baseline, never a zero), slides through the 1,193.86 July trough (-853.57 against June), snaps +1,158.21 into August, and posts its deepest drop in November at -1,326.87. The first row's NULL is a definition, not a gap; IFNULL-ing it to 0 would read as a 3,731.97 crash in month one. The distractors each break differently: '%m' merges the two Januaries into one bucket and corrupts every delta; LEAD flips every sign so the November crash reads as a surge; DESC reverses the spine and the review argues the year backwards.",
    },
    {
      id: "cs-monzo-4",
      tier: "hard",
      topic: "s7",
      universe: "month-close",
      title: "The pot-coverage bands",
      brief:
        "Monzo-flavored brief on the storefront db: the bill-pot pod's close classifies every bill by what the funding legs actually did — exact (funded to the penny), partial (some money moved, not enough), never-funded (no leg at all). Probed facts: 28 bills against 27 legs, INTEGER cents; the classification reads 21 exact worth 65,612.00 funded in full, 1 partial — bill #25 at 4,000.00 of its 6,148.00 — and 6 never-funded worth 15,217.00 with 0.00 moved, including paid-status #28 (1,756.00) whose status lies. The close reads the band with the most bills first.",
      ask: "Return each coverage band with its bill count, billed total and funded total, both to 2 decimals, biggest bill count first.",
      template:
        "SELECT coverage,\n       COUNT(*) AS bills,\n       ROUND(SUM(billed_cents) / {1}, 2) AS billed,\n       ROUND(SUM(funded_cents) / 100.0, 2) AS funded\nFROM (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         COALESCE(SUM(p.amount_cents), 0) AS funded_cents,\n         CASE\n           WHEN SUM(p.amount_cents) IS NULL THEN {2}\n           WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact'\n           ELSE 'partial'\n         END AS coverage\n  FROM invoices i\n  {3} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY bills DESC;",
      slots: [
        {
          answer: "100",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "The raw book is INTEGER cents, so the dollar read is cents / 100. / 1000 reprices the whole book to thousandths — the 65,612 band reads 6,561.2 — and / 10 inflates it tenfold; neither reconciles against anything the ledger prints.",
        },
        {
          answer: "'never_funded'",
          kind: "keyword",
          label: "the no-leg arm's label",
          why: "The arm fires when SUM(p.amount_cents) IS NULL — the LEFT JOIN found no legs — and it must be LABELLED for what it is: 6 bills, 15,217.00 billed, 0.00 funded. A mislabeled arm buries the dunning queue inside a band the close reads as ordinary.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "The LEFT JOIN keeps the 6 legless bills alive so their NULL legs can trigger the never-funded arm. INNER deletes them before the CASE ever runs — the 15,217.00 hole vanishes from the close exactly where the anomaly lives.",
        },
      ],
      distractors: ["10", "1000", "'partial'", "'void'", "INNER"],
      walkthrough:
        "Stage one folds per bill, stage two folds per band — and the CASE is where the policy lives. The inner SELECT joins bills to their funding legs with a LEFT JOIN (the 6 legless bills must survive), folds legs per bill with SUM(p.amount_cents), COALESCEs the legless sums to 0 for the funded column, and CASE-classifies: legs IS NULL means never_funded, legs equal to the bill means exact, anything between means partial. Stage two groups by the band and prints bills, billed and funded: 21 exact at 65,612.00 on both sides, 1 partial (4,000.00 of 6,148.00), 6 never_funded at 15,217.00 billed and 0.00 funded — and #28's paid status contributes nothing because the arms key on legs, the ledger of record, not the status claim. The distractors each break differently: / 10 and / 1000 reprice every band by an order of magnitude; 'partial' relabels the never-funded arm so 7 bills read partial and the dunning queue hides; 'void' invents a band no ledger reports; INNER deletes the 6 legless bills before classification, so the close never sees its own hole.",
    },
    {
      id: "cs-monzo-5",
      tier: "easy",
      topic: "l8",
      universe: "expense",
      title: "The opex gate",
      brief:
        "Monzo-flavored brief on the storefront db: the ops-spend review gates the opex roll-up to categories carrying at least five entries, so one-off lines cannot argue policy. Probed facts: the expenses table is INTEGER cents and folds into four categories — Rent 14 entries at 16,800.00, Ads 14 at 4,570.00, Tools 5 at 1,525.00, Travel 3 at 2,521.00. The gate keeps the first three and drops Travel's 3-entry sample — a stated scope, not a silent one, and the dropped 2,521.00 is named in the packet footnote. The review reads biggest spend first.",
      ask: "Return each category passing the five-entry gate with its entry count and spend to 2 decimals, biggest spend first.",
      template:
        "SELECT category,\n       COUNT(*) AS entries,\n       ROUND(SUM(amount_cents) / {1}, 2) AS spend\nFROM expenses\nGROUP BY {4}\nHAVING COUNT(*) >= {2}\nORDER BY spend {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Expenses are INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 promotes real division. The bare integer happens to read true only while every group total is a whole number of euros; one odd-cent row and the truncation starts eating pence.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the entry gate",
          why: "HAVING COUNT(*) >= 5 keeps Rent (14), Ads (14) and Tools (5) and drops Travel's 3-entry sample. A gate of 3 lets the one-off category argue policy; a gate of 14 keeps only the two monthly heavyweights.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The review reads biggest spend on top: Rent 16,800.00, Ads 4,570.00, Tools 1,525.00. ASC opens the meeting on Tools and the cost conversation starts at the bottom of the ladder.",
        },
        {
          answer: "category",
          kind: "keyword",
          label: "the fold grain",
          why: "GROUP BY category is the grain the gate judges — the four opex lines. GROUP BY on a column the expenses table does not carry errors out; grouping on a fact-grain like amount_cents shards every line into its own row and the gate judges amounts, not categories. Name the grain, then gate it.",
        },
      ],
      distractors: ["10.0", "1000.0", "3", "14", "ASC", "region"],
      walkthrough:
        "One table, one fold, one gate — the census shape every review opens with. GROUP BY category folds the opex book into its four lines, the cents rule prints spend as SUM(amount_cents) / 100.0, and HAVING COUNT(*) >= 5 applies the group-level gate AFTER groups form: Rent and Ads sail through at 14 entries, Tools squeaks in at exactly 5, and Travel's 3 entries drop — the packet footnotes the dropped 2,521.00 so the scope is stated, not hidden. The gate is a HAVING resident by definition: at WHERE time no groups exist, so COUNT(*) is not yet a thing to judge. The distractors each break differently: 10.0 and 1000.0 rescale every line by a factor of ten; a gate of 3 lets Travel in and 14 evicts Tools; ASC reads the ladder bottom-up; and grouping on a column the table does not carry (region) fails outright — the grain is named once, in the GROUP BY, and everything downstream inherits it.",
    },
    {
      id: "cs-monzo-6",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-funded queue",
      brief:
        "Monzo-flavored brief on the storefront db: the AR anti-join refreshes before billing sends a single reminder — bills whose id never appears in the funding-legs table. Probed facts: the book holds 28 bills against 27 legs, and the anti-join returns exactly 6 never-funded bills worth 15,217.00 — #24 (4,937.00), #26 (3,562.00), #27 (2,794.00), #21 (1,295.00), #18 (873.00), and the standing anomaly #28 (1,756.00), whose status claims 'paid' with zero legs to show for it. The queue reads biggest amount first, and the anomaly is walked line by line, never buried.",
      ask: "Return each never-funded bill with its status, dollar amount to 2 decimals and funding-leg count, biggest amount first.",
      template:
        "SELECT i.id AS bill_id,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS amount,\n       COUNT(p.id) AS settlement_legs\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {2}\nGROUP BY i.id\nHAVING COUNT(p.id) = {3}\nORDER BY amount {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "The LEFT JOIN keeps every bill and hands NULL leg columns to the legless ones — that is the whole mechanism. INNER deletes the 6 never-funded bills before the WHERE can catch them, and the queue reports an empty book the week 15,217.00 goes unfunded.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched-side test",
          why: "p.id IS NULL keeps exactly the bills the join failed to match — the anti-join. IS NOT NULL flips it to the 22 funded bills and the dunning list chases money that already moved.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the zero-leg gate",
          why: "HAVING COUNT(p.id) = 0 is the belt-and-braces restatement of the NULL test — all 6 survivors carry exactly zero legs. A gate of 1 reads the 17 single-leg bills; a gate of 2 reads the 5 split settlements the month-close ladder owns.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The queue reads biggest exposure on top: 4,937.00 down to 873.00, with #28's 1,756.00 sitting third. ASC buries the largest unfunded bill at the bottom of the page the dunning pod reads top-down.",
        },
      ],
      distractors: ["INNER", "NOT NULL", "1", "2", "ASC"],
      walkthrough:
        "The anti-join is one LEFT JOIN and one NULL test — the join keeps every bill, the test keeps only the bills no leg ever matched. The NULL leg columns make COUNT(p.id) read 0 for the six survivors, so the HAVING gate and the WHERE predicate agree by construction: #24 (4,937.00), #26 (3,562.00), #27 (2,794.00), #28 (1,756.00), #21 (1,295.00), #18 (873.00) — 15,217.00 of never-funded exposure, biggest first. The walkthrough names the anomaly out loud: #28 claims paid with zero legs, so the status column is a claim and the legs are the ledger — the row stays in the queue precisely because the query never trusted the claim. The distractors each break differently: INNER erases the queue entirely (the 6 bills never match, so an inner join drops them before any test); NOT NULL flips the report to the 22 funded bills; a gate of 1 or 2 reads a different cohort of bills altogether; ASC hides the biggest exposure at the bottom of the page.",
    },
  ],

  problems: [
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heavy-user census: which account holders authorize the most. The concentration read (63.5% of spend from 3,000-plus holders) starts exactly here — one fold, one ORDER BY, one honest tie policy." },
    { slug: "queries-quality-and-percentage", why: "Decline shares and ticket quality are ratios with denominators — this problem drills the weighted-percentage shape the fraud pod ships weekly, integer-division traps included." },
    { slug: "dormant-reactivation", why: "Dormancy is Monzo's silent churn: a holder whose last authorization slides away drifts off the card. This problem IS the reactivation-risk read — an existence test over the activity spine." },
    { slug: "find-churn-risk-customers", why: "Savings-marketplace partners and pots go stale quietly. Anti-join risk lists are how the lifecycle pod picks its winback batch before the overdraft becomes a loss." },
    { slug: "duplicate-charge-pairs", why: "Self-join over the authorization feed to catch the same merchant charging twice — the duplicate-charge check every Monzo support escalation starts with." },
    { slug: "suspicious-bank-account-transactions", why: "Velocity bursts are the fraud stack's first alarm: too many authorizations inside a sliding window. This problem is that alarm at practice scale." },
    { slug: "amount-anomaly-zscore", why: "Declines and fraud both live in the tails: amount anomalies against a holder's own baseline are a Z-score away, and this problem drills exactly that fold." },
    { slug: "bank-account-summary", why: "A pot is a running story of money in and money out — this LEFT JOIN summary is the balance-per-account shape the pots squad ships every sprint." },
    { slug: "account-balance", why: "Running totals over a ledger of credits and debits — the daily pot-balance walk, NULL-safe ordering included." },
    { slug: "total-traveled-distance", why: "Conditional SUM over grouped movement — exactly how bill-pot funding is folded: sweeps in, bills out, per holder per month." },
    { slug: "monthly-transactions-i", why: "The bill book buckets by month on TEXT timestamps — SUBSTR month keys over the INTEGER-cents tables are this problem, cents rule included." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Fraud patterns are set logic: holders who hit merchant A and B but never C. Conditional aggregation over presence-and-absence is the pattern the risk team codes weekly." },
    { slug: "keep-latest-dedupe", why: "Settlement feeds resend rows; ROW_NUMBER dedupe keeps the latest leg. The transaction feed's hygiene problem, every single day." },
    { slug: "fix-names-in-a-table", why: "Merchant name hygiene before any join: 'AMZN MKTP' versus 'Amzn Mktp' silently splits one merchant into two and breaks every category budget." },
    { slug: "null-blank-audit", why: "The audit-first habit: a NULL and blank sweep across the account tables before anyone aggregates. Monzo treats a NULL policy as a design decision, not an accident." },
    { slug: "trial-balance-check", why: "The close gate: debits must equal credits — 181,080 against 181,080, delta zero. This problem IS that conditional-SUM check at practice scale." },
    { slug: "balance-rollforward", why: "Opening balance, movements in, closing balance — the pot rollforward the close packet ships every month, where a NULL-safe join decides whether a pot with no movement still reports." },
    { slug: "gl-reconciliation", why: "Sub-ledger to GL tie-out is the close's reflex: bills and funding legs against the double-entry core, delta zero or the close does not ship — the reconciliation shape at practice scale." },
    { slug: "ar-aging-schedule", why: "The never-funded 15,217.00 bucketed by age is exactly an AR aging schedule — ordered CASE bands over days outstanding, the dunning cadence's source query." },
    { slug: "delinquency-buckets", why: "Banding delinquency into current / 1-30 / 31-60 buckets — the same ordered-CASE discipline as the pot-coverage census, with the 4,000-of-6,148 partial as the live case." },
    { slug: "prepayment-detection", why: "Funded-before-billed is the mirror anomaly: legs that land with no obligation yet. EXISTS probes over date pairs are how the money desk catches them." },
    { slug: "structuring-detection", why: "Velocity just under reporting thresholds is the classic fraud tell — burst flags over sliding windows, the same alarm the card stack runs on the authorization feed." },
    { slug: "odd-and-even-transactions", why: "Conditional aggregation on a computed flag — the same reflex the pot-coverage CASE uses, drilled at practice scale with the cents rule attached." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LEAD comparisons over ordered authorizations — escalating amounts in a window read as a savings nudge or a fraud tell depending on who asks, and the query is identical." },
    { slug: "maximum-transaction-each-day", why: "Per-day MAX over the authorization feed — the daily peak ticket the fraud pod tracks against holder baselines before the risk standup." },
    { slug: "find-third-transaction", why: "Ordinal filtering per holder — the third-authorization read that separates newly-active holders from one-tap wonders, ROW_NUMBER discipline included." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Monotonic spend per holder across the 14-month spine — directional trend detection with LEAD, the engagement ladder's growth-side cousin." },
    { slug: "settlement-fails-aging", why: "Stuck settlement legs bucketed by age — the 2.98-day norm with a 2-to-4 spread makes any leg older than the spread an incident, and this problem is that aging query." },
    { slug: "wash-trade-detection", why: "Self-joined pairs that cancel out — the same o1.id < o2.id pairing discipline as the duplicate-charge check, pointed at circular money instead of double charges." },
    { slug: "journal-gap-detection", why: "Sequence gaps in the double-entry core — the completeness check that runs before anyone trusts the 181,080 trial balance." },
    { slug: "late-arriving-restatement", why: "A settlement stamp lands days late and the month changes retroactively — restatement handling that keeps the 14-month spine LAG-safe." },
    { slug: "rfm-segmentation", why: "Recency, frequency, monetary in one fold — the holder-segmentation standard that feeds the Plus/Perks/Max upsell queue from the engagement ladder." },
  ],
};
