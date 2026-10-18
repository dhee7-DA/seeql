// Brex — wave-10 (Task 100-brex), fintech domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12, wave-8+9 canonical cells 2026-10-16).
// Startup corporate cards + spend management: the storefront db read as a founder-friendly
// underwriting book — customers are startup accounts (region = the market buckets the venture
// cohort reads through), orders are card/billing cycles (delivered = settled statements 52,
// shipped = in-flight with shipped_at as the cycle stamp 30, pending = awaiting approval 14,
// cancelled = declined/voided 7), order_items are transaction line records, products are
// card/plan SKUs (price = the underwritten limit — max 199.99, the premium band >= 200 is
// empty), suppliers are merchant/network partners, invoices are statement cycles (finance
// tables INTEGER cents — the dollar read is amount_cents/100.0; orders.total and
// order_items.unit_price are REAL dollars), payments are settlement rails (card/wire),
// expenses are platform opex, ledger_entries are the GL. Angle kept DISTINCT from ramp
// (policy enforcement + vendor savings): Brex = limit-underwriting economics (the limit
// ladder, the 199.99 ceiling), founder-friendly underwriting vs policy gates, rewards
// economics read through the band ladder, and bill-pay statement reconciliation.
// Pool provenance: company-pools.md carries NO Brex section (0 tagged rows, grep-verified) —
// all 10 topic slug sets and all 16 problems are theme-curated from the pools file's theme
// menu (sql rows only, no w*/d*/f* rows) and say so in brief P4. Extended to full depth (30/24/6/32).
// Case briefs quote probed figures; both case fills were probe-verified against a readonly
// copy of db/custom.db (distractor x slot matrices 0 ambiguous); every case slot is
// mechanically audited by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const brexKit: CompanyKit = {
  id: "brex",
  domainId: "fintech",
  name: "Brex",
  tagline: "Startup corporate cards: limit underwriting, policy controls, bill pay",
  accent: "text-emerald-300",

  brief: [
    "**Brex** is the corporate card and spend platform built for startups — limits underwritten from the company's venture backing and burn rather than a founder's personal credit, every swipe policy-checked, every statement billed and every bill paid off one ledger. The analytics reality is an underwriting engine wearing a growth badge: every card cycle either settles, flies in-flight, waits on approval, or declines, and the account book behind it is where the risk lives. On this storefront db the mapping is honest: the 16 customers rows are startup accounts, the 103 orders are card/billing cycles worth **34,833.28**, and the 251 order_items rows are transaction line records (2.44 lines per cycle). The status map is fixed: delivered = **settled** (52, 50.5%), shipped = **in-flight** with shipped_at as the cycle stamp (30, 29.1%), pending = awaiting approval (14), cancelled = **declined/voided** (7, 6.8%).",
    "The data org splits into underwriting, spend ops, and a bill-pay pod that owns the statement book. Underwriting owns the limit ladder: 16 card/plan SKUs whose price is the assigned limit — the ladder splits **8 budget SKUs averaging 32.06** against **8 mid SKUs averaging 111.50**, and the premium band (>= 200) is honestly empty: no SKU is underwritten past the **199.99** ceiling, and that emptiness is the underwriting story. Bill-pay owns the statements: 28 statement cycles worth 86,977.00 against 27 rail legs, INTEGER cents end to end, with the standing contradictions — statement #11 is {rose:void} yet carries a 925.00 leg, #28 reads {emerald:paid} with nothing behind it (1,756.00), and one sits partial at 4,000.00 of 6,148.00. The rails split card 16 legs / 37,364.00 versus wire 11 / 32,248.00, and the cycle stamp clock reads **82 of 103 cycles** stamped at a 2.98-day average, spread 2–4.",
    "Interview style is underwriting-first, then the denominator. A screen opens with a conditional count (settled share — *of all cycles, or only the 82 stamped?*), moves to the **two-grain cohort census** (EU runs 45 cycles from just 8 accounts while the US runs 19 from 2 — volume versus intensity), escalates into the **limit ladder** where CASE band edges are the boundary someone will argue about, and lands on bill-pay set algebra: which statements carry legs the book does not call paid. The graded habits: state the limit basis before the band, resolve the grain before averaging, and never let a **declined** cycle into a settled-spend total.",
    "Preparation strategy: the pools file carries no Brex section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: underwriting band ladders, two-grain cohort censuses, statement-coverage anti-joins, EXCEPT reconciliation diffs and the cents-safe bill-pay spine. Do the topics in order, drill the thirty MCQs until the stage map and the denominators are reflex, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the **limit-band census** underwriting reads every Monday, the **settled-not-paid registry** bill-pay ships at every close, the merchant spend leaderboard the partner review ranks, the account activity ladder with its four-way tie, the statement coverage census that must read 21 / 1 / 6, and the opex stack with the grand-total row that has to reconcile. The bar to clear: *state the limit basis and the denominator before you compute anything* — then make every status census reconcile to **103 by construction**.",
  ],

  dayInLife: [
    "**08:15 —** The day starts on the cycle funnel. First query is the overnight read: cycles by outcome — 52 of 103 settled all-time, the declined share watched hardest (6.8%, and every decline is an underwriting limit working or a card failing) — then the approval chase: 14 cycles sitting awaiting approval, oldest first. The morning artifact is the stamp check: **82 cycles** carry the shipped_at stamp at a **2.98-day** average (2–4 spread), and a stamp that lands on a cycle still pending approval is *the day's first incident*, not a rounding note. A census that can't reconcile 52 + 30 + 14 + 7 to **103 by construction** gets rebuilt before standup.",
    "**11:30 —** Midday is the limit ladder. The underwriting review re-bands the SKU book: budget under the 50 line, mid to the 200 ceiling, premium — the arm that never fires — checked for a row that should not exist; a SKU crossing **199.99** would page underwriting before pricing. Beside it, the cohort census: EU's 45 cycles from 8 accounts (5.6 intensity) against the US's 19 from 2 (9.5) — *a venture-backed book concentrates, and the ratio is the read* — plus the concentration cut, **63.5% of the book** from accounts over 3,000 lifetime. Each ask is a conditional count, a CASE band and one stated denominator.",
    "**15:30 —** The afternoon belongs to bill-pay. The statement book reconciles first: **21 exact** settlements (65,612.00), 1 partial (4,000.00 of 6,148.00), and 6 statements with no legs at all — **15,217.00** of exposure, one of which (#28, 1,756.00) claims paid with zero settlement rows. The EXCEPT diff runs both directions — settled-but-not-paid (#11 void-but-debited at 925.00, #25 the partial) and claimed-but-never-settled (#28) — because *the status column is a claim and the rails are the ledger of record*. The day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — the close ships or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settled-cycle share", what: "Settled statements ÷ ALL cycles booked: 52 of 103 (50.5%). The top-of-book number underwriting reads every Monday — the 14 awaiting-approval rows are 'not yet', never a silent zero." },
    { name: "Cycle stamp clock", what: "Booking to stamp (created_at → shipped_at) over the 82 stamped cycles only: 2.98-day average, 2–4 spread. Computed over stamped cycles, never over NULL awaiting-approval timestamps." },
    { name: "Decline rate", what: "Declined/voided cycles ÷ ALL cycles: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The underwriting loss map that recalibrates limit bands." },
    { name: "The limit ladder", what: "Card/plan SKUs banded by underwritten limit: 8 budget SKUs @ 32.06 average vs 8 mid SKUs @ 111.50; the premium band (>= 200) is empty — the ceiling holds at 199.99. The band census underwriting opens with." },
    { name: "Cohort concentration", what: "Share of book value from accounts over 3,000 lifetime: 63.5% (71.2% above 2,000); the top account alone carries 24 cycles for 7,262.35. One lost logo moves a quarter — the venture-cohort read." },
    { name: "Statement coverage", what: "Statements classified by settlement coverage: 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 with no legs worth 15,217.00. The anti-join bill-pay refreshes every close." },
    { name: "Rail mix", what: "Settlement legs and dollars per rail: card 16 legs / 37,364.00 vs wire 11 / 32,248.00 — 27 legs against 28 statements. Five statements settle split across both rails." },
    { name: "GL proof", what: "Ledger debits − credits: 0 (181,080 = 181,080 across 80 entries), with platform opex folded alongside — 36 lines worth 25,416.00, Rent 14 lines / 16,800.00 leading. The one metric required to be boring." },
  ],

  topics: [
    {
      name: "Cycle outcome counts",
      why: "Every Brex screen opens with the cycle funnel: booked, stamped, settled, declined. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight cycle settled — 30 versus 52 on this db.",
      slugs: ["number-of-rich-customers", "sales-analysis-i", "percentage-of-users-attended-a-contest", "customers-with-maximum-number-of-transactions-on-consecutive-days", "users-with-two-purchases-within-seven-days", "find-third-transaction"],
    },
    {
      name: "Two-grain cohort censuses",
      why: "Cycles and startup accounts are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-employees-who-met-the-target", "net-revenue-retention", "cohort-repeat-revenue", "repeat-purchase-rate"],
    },
    {
      name: "Joining accounts to cycles",
      why: "Accounts carry region and created_at; cycles inherit them through joins, and the join type decides who survives. A cycle without an account is corruption; an account without cycles is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "top-travellers", "uber-first-transaction", "average-selling-price"],
    },
    {
      name: "Limit ladders & CASE bands",
      why: "Underwriting bands are CASE arms evaluated in order: budget under 50, mid to the 200 ceiling, premium beyond. The edges are the argument — a SKU priced exactly 199.99 lands in mid, and a reordered WHEN quietly re-bands the book. The premium arm never fires on this db, and the empty arm IS the ceiling story.",
      slugs: ["type-of-triangle", "calculate-special-bonus", "weather-type-in-each-country", "maximize-items"],
    },
    {
      name: "Underwriting gates & HAVING floors",
      why: "Limit policy is group-level: which accounts carry at least ten cycles, which merchants clear a spend floor. The threshold lives in HAVING after the fold — putting it in WHERE errors, and putting a row-level filter there silently re-populates the gate.",
      slugs: ["managers-with-at-least-5-direct-reports", "classes-more-than-5-students", "actors-and-directors-who-cooperated-at-least-three-times", "consecutive-numbers"],
    },
    {
      name: "Statement-coverage anti-joins",
      why: "The no-leg watchlist — 6 statements worth 15,217.00 — is a LEFT JOIN plus an IS NULL on the rail key. Screens escalate it: NOT EXISTS twins, WHERE-placement traps that convert the anti-join back to an inner fold and delete exactly the exposure you were hunting.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "students-with-invalid-departments", "prepayment-detection", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Billing calendars & month keys",
      why: "The cycle spine buckets by SUBSTR(created_at, 1, 7) — 14 months, 2024-01 to 2025-02, 6–9 cycles each. Half-open windows and zero-padded month keys are the mechanics; '%m' alone merging Januaries across years is the trap that turns a trend into fiction.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "delinquency-buckets"],
    },
    {
      name: "Running folds & reward accruals",
      why: "Rewards economics read as running math: settled dollars accruing over the statement spine, cash-back pacing against a cycle window. SUM(...) OVER (ORDER BY ...) with a stated frame is the shape, and the frame decision — peers folded or row-by-row — is a correctness question, not style.",
      slugs: ["find-cumulative-salary-of-an-employee", "last-person-to-fit-in-the-bus", "account-balance", "daily-balance-interest", "deferred-revenue", "mrr-waterfall"],
    },
    {
      name: "Rank semantics on the cohort ladder",
      why: "The account ladder runs 24, 17, 14, 13, 5 cycles, then FOUR accounts tie at 4 — and the rank trio disagrees about who shares a rung and whether gaps follow. RANK, DENSE_RANK and ROW_NUMBER are a policy about peer startups, not syntax.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries"],
    },
    {
      name: "Bill-pay set algebra",
      why: "Two censuses describe one statement book — the status column claims, the rails settle — and EXCEPT is the diff between them: settled-but-not-paid one way, claimed-but-never-settled the other. UNION dedups whole rows silently, which makes it a correctness question, and direction IS the question.",
      slugs: ["monthly-transactions-ii", "team-scores-in-football-tournament", "count-apples-and-oranges"],
    },
  ],

  theory: [
    {
      id: "brex-t1",
      q: "Your account report joins startup accounts to card cycles. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A settled-spend report joins cycles to accounts: a cycle with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no cycles ARE the answer, arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-cycling accounts — all 16 appear in the cycle table somewhere — and proving that zero is itself the analyst's job. The anti-joins that DO return rows live one layer down, on the statement book: 6 statements with no rail legs. Knowing which relationship has whitespace and which doesn't is the senior tell.",
      tag: "joins",
    },
    {
      id: "brex-t2",
      q: "The cohort ladder runs 24, 17, 14, 13, 5 cycles — then FOUR accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie at 4 consumes ranks 6 through 9, and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the success-manager headcount. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer startups (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. At an underwriting shop the stakes are concrete: the ladder feeds limit reviews, and two accounts that differ only by tie policy get different treatment.",
      tag: "windows",
    },
    {
      id: "brex-t3",
      q: "The census shows 103 cycles and 16 accounts; EU shows 45 cycles and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per cycle, so an account with 24 cycles contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 cycles collapse to 8 logos. Neither is wrong: cycles measure load and card momentum, accounts measure installed base and coverage. The ratio — 5.6 cycles per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether the venture-backed cohort is broadening or concentrating; on a founder-friendly book, concentrated intensity is also a risk concentration. The trap that catches candidates is a third grain: join order_items for line records and COUNT(*) silently counts lines, not cycles — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "brex-t4",
      q: "shipped_at is NULL until a cycle stamps. What is your policy for the stamp-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped cycles have a clock, so the report measures booking-to-stamp for the 82 of 103 cycles that carry the timestamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting approval plus 7 declined rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for approvals that have not run. A report whose WHERE clause is doing definitional work without saying so is exactly what a Brex reviewer hunts for; on a spend platform the stamp clock IS the product promise.",
      tag: "nulls",
    },
    {
      id: "brex-t5",
      q: "The underwriting review wants settled value per region for regions carrying at least ten cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, awaiting-approval and declined rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a limit-review line and an error, and between a threshold applied to cycles versus to dollars. The strong answer places every filter by asking: is this a fact about one cycle, or about a region? On this db only the ladder's head — 24, 17, 14, 13 and the 5 — clears a ten-cycle bar per account.",
      tag: "pipeline",
    },
    {
      id: "brex-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce a mean (6.44 cycles per account, and exactly four accounts — the 24, 17, 14 and 13 — clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average limit filter is how it hides. The correlated cousin (compare each cycle to ITS account's average) re-runs per outer row and answers a different question at a different cost — the shape behind per-account limit checks. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "brex-t7",
      q: "The billing trend buckets cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the burn trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's cycles, and quarter-end is exactly when startup swipes land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is underwriting discipline: the spine, the window and the edge row are where burn reports go wrong.",
      tag: "dates",
    },
    {
      id: "brex-t8",
      q: "Bill-pay says a statement is 'paid' but the rails table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN rail legs, keep the NULL side — on this db that returns 6 statements worth 15,217, one of which (#28, 1,756.00) is marked paid with zero legs: a status that lies, which is why rail rows are the ledger of record and the status column is a claim. Then the set algebra: statements that settled but the book does not call paid come out of the opposite EXCEPT — and this db holds two (#11, void-but-debited at 925.00, and #25, the 4,000-of-6,148 partial): the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and rails carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage census must read 21 exact / 1 partial / 6 no-legs, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "brex-t9",
      q: "The two statement censuses — the status column and the rail legs — disagree in both directions on this db. Walk me through reading the diff both ways with set algebra.",
      a: "Two directions, two anomalies. Settled-but-not-claimed: SELECT invoice_id FROM payments EXCEPT SELECT id FROM invoices WHERE status = 'paid' — on this db that returns exactly two rows, #11 (void-but-debited at 925.00) and #25 (the 4,000-of-6,148 partial): money moved on statements the book does not call paid. Claimed-but-never-settled is the mirror: paid EXCEPT legs — #28, the paid statement with zero legs. INTERSECT returns the 20 statements both censuses agree on — the clean book, useful as a reconciliation check, useless as a watchlist. The discipline is saying the direction out loud before writing it: 'legs minus claims' and 'claims minus legs' are different memos to different desks, and one EXCEPT rotated 180 degrees silently re-aims the audit. EXCEPT dedups whole rows like UNION does, so the branches emit ids — one column, no duplicate risk — and the outer query joins back for the dollar read at amount_cents / 100.0. At bill-pay this two-direction diff IS the close's anomaly list.",
      tag: "setops",
    },
    {
      id: "brex-t10",
      q: "The limit ladder bands SKUs under 50, to 200, and premium beyond — and someone reorders the WHEN arms 'for readability'. What actually changes?",
      a: "The banding policy changes, silently. CASE evaluates arms top to bottom and the first true WHEN wins: the ascending ladder — < 50 budget, < 200 mid, ELSE premium — folds the 16 SKUs into 8 budget (32.06 average) and 8 mid (111.50), with premium empty because the ceiling holds at 199.99. Reverse the arms and the < 200 arm fires first, so every sub-50 SKU reads 'mid' — the budget band becomes a dead arm, the ladder re-bands 8 SKUs, and no error announces it. The ELSE is the exhaust valve: nothing falls out of a CASE, it falls INTO the last arm, which is exactly why the empty premium row matters — its absence IS the proof the ceiling held, because GROUP BY cannot emit a group with no rows. The craft answers: publish the edges in a comment, write arms ascending, and reconcile COUNT by band to 16 by construction. On an underwriting desk the band edges are policy; the query must quote them verbatim, the way a pricing page does.",
      tag: "case",
    },
    {
      id: "brex-t11",
      q: "Restated statement rows arrive with newer timestamps — the feed carries duplicates. How do you keep exactly one row per statement, and what makes the choice defensible?",
      a: "ROW_NUMBER with a keep-latest policy. Partition by the statement key — statement number or invoice id — order by the restatement timestamp DESC (and a sequence column if one exists), then keep rn = 1: ROW_NUMBER() OVER (PARTITION BY statement_key ORDER BY updated_at DESC). The defensible parts are the two decisions you say out loud. First, the key: what makes a row 'the same statement' — number alone, or number plus cycle? Get that wrong and you either keep two copies or merge two statements. Second, the policy: keep-latest assumes the newest row supersedes — true for restatements, wrong for append-only event feeds, where you keep all rows and aggregate. RANK would keep tied rows (two restatements stamped the same second both survive), which is either correctness or a bug depending on the feed contract — say which. The audit trailing the dedupe: COUNT before and after, and the delta must equal the number of superseded rows — on a ledger-of-record feed, an unexplained collapse in row count is an incident, not a cleanup.",
      tag: "windows",
    },
    {
      id: "brex-t12",
      q: "The billing spine buckets cycles by SUBSTR(created_at, 1, 7). What does that expression buy you, what breaks if it drifts, and when would you reach for STRFTIME instead?",
      a: "SUBSTR(created_at, 1, 7) slices the ISO timestamp to its first seven characters — '2024-01' — which is a zero-padded year-month key: 14 buckets on this db, 2024-01 through 2025-02, six to nine cycles each. The zero-padding is the whole trick: SUBSTR(created_at, 1, 7) with a non-padded month would sort '2024-10' before '2024-2' as text and the spine scrambles; ISO timestamps are lexicographically ordered, which is why the text slice works at all. The drift to watch: substr lengths — 1,7 is year-month, 1,10 is the day, and a one-character slip turns a monthly census into a daily one that LOOKS fine at a glance. STRFTIME('%Y-%m', created_at) is the equivalent with a parser behind it — reach for it when timestamps might not be clean ISO, or when you also need '%W'/'%j' grain beyond substring arithmetic. The reconciliation habit stays: the spine's buckets must sum to 103 cycles, and a missing month in the output is a key bug, not an empty month.",
      tag: "strings",
    },
    {
      id: "brex-t13",
      q: "Five statements settle on two legs each — 27 legs against 28 statements. What does the fan-out do to a naive SUM, and where does the fold belong?",
      a: "The join fans out one row per leg, so a two-leg statement contributes its face value twice: SUM over the joined rows double-counts exactly the five split statements and the fold stops reconciling to the 28-statement book. The fix is folding at the right grain — legs per statement first: GROUP BY i.id with SUM(p.amount_cents), and only then compare to face value or sum the statement-level results. The tell that you have it backwards: the statement fold sums to MORE than SELECT SUM(amount_cents) FROM invoices — here 22 statements' worth of legs plus five duplicated faces — and no error fires. The same discipline generalizes: any 'per statement' metric must be computed on one-row-per-statement input, either via the inner fold or a DISTINCT-keyed derived table. And the census that proves the shape: 21 exact / 1 partial / 6 with no legs reconciles to 28 statements only when legs are folded per statement first — on raw leg rows the classes don't even exist. Grain first, arithmetic second; at bill-pay that order is the difference between a close and a restatement.",
      tag: "joins",
    },
    {
      id: "brex-t14",
      q: "The close ends at a trial balance — 181,080 debits against 181,080 credits across 80 ledger entries. What proves it, what breaks it, and what is the follow-up when the delta is non-zero?",
      a: "The proof is one two-column fold: SUM(debit_cents)/100.0 and SUM(credit_cents)/100.0 over ledger_entries — 181,080 against 181,080, delta zero, and the close ships. What breaks it is a single line: one journal entry debited without its mirror credit, one duplicated row, one line booked to the wrong account — the delta moves by exactly that amount, which is why a non-zero delta is never rounded away. The follow-up is a gap hunt at account grain: GROUP BY account with SUM(debit_cents) - SUM(credit_cents) finds the account whose balance moved without its mirror — the delta localizes fast because GL accounts are few and the offending balance is the one that should be zero and isn't. The cents rule rides along: ledger_entries is INTEGER cents, so the /100.0 belongs in the read, and a delta measured in cents is still a delta. The culture point the panel grades: the trial balance is required to be boring — 0 is the only interesting value it can produce, and 'close to zero' is a finding, not a pass.",
      tag: "quality",
    },
    {
      id: "brex-t15",
      q: "The underwriting ceiling is enforced in SQL as WHERE price >= (SELECT MAX(price) FROM products). What is that subquery's contract, and what does the ceiling read on this book?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column — MAX over a non-empty table always delivers exactly one row, so the comparison is safe at full scale: the ceiling reads 199.99, and the query returns the SKU(s) sitting AT the ceiling, the ladder's top rung. The failure mode is the empty inner fold: filter the subquery — one category, one supplier, one window — and MAX over zero rows returns NULL, so price >= NULL is UNKNOWN and the report silently empties while looking valid. The strong candidate states the inner fold's population unprompted: 16 SKUs, all priced, so MAX is total; slice it and you owe the reader the empty-case answer. The correlated cousin — compare each SKU to ITS category's max — re-runs per outer row and answers the ladder-within-a-ladder question at a higher cost. And the business read on this book: no SKU crosses 200, so the premium band's emptiness is the ceiling holding — the subquery is how underwriting checks the ladder wasn't breached, not just where its top sits.",
      tag: "subqueries",
    },
    {
      id: "brex-t16",
      q: "Bill-pay ages statements against due dates — current, 1-30, 31+. How does that query shape up, and where do the date-window traps live?",
      a: "Aging is a CASE over a date difference, with half-open windows as the discipline. The spine: days late as julianday(today) - julianday(due_on) (or against a fixed close date so the report is reproducible), then CASE WHEN days <= 0 THEN 'current' WHEN days <= 30 THEN '1-30' ELSE '31+' — arms ordered so every statement lands in exactly one bucket and the buckets sum to 28 by construction. The traps are all boundary work: BETWEEN '2024-01-01' AND '2024-01-31' silently includes midnight on the 31st and double-counts the boundary night's statements — half-open intervals, >= start AND < end, are the fix; and a moving 'today' makes the report non-reproducible, so the close packet pins the date and says so. The wrinkle this book adds: aging a claim is not aging an exposure — the 6 no-leg statements (15,217.00, including the paid-claim #28) need the leg-fold join BEFORE bucketing, because dunning a paid statement is worse than dunning a late one. Reconcile first, bucket second; the aging view inherits whatever the reconciliation proves.",
      tag: "dates",
    },
    {
      id: "brex-t17",
      q: "The funnel census needs booked, settled, in-flight, awaiting and declined counts per region. One pass with FILTER or five queries with WHERE — argue it.",
      a: "One pass, because the deliverable is an identity. COUNT(*) FILTER (WHERE status = 'delivered') beside its three siblings groups each region once and lays the funnel side by side — EU reads 45 cycles with 24 settled, 12 in-flight, 6 awaiting, 3 declined, and the columns sum to the market total by construction; platform-wide they sum to 52 + 30 + 14 + 7 = 103. Five separate WHERE queries run at five moments on five snapshots, and nothing forces their columns to reconcile — an overnight arrival between runs shows up as a funnel that doesn't add up, and nobody can say which pass moved. FILTER is also one scan of the join instead of five, and the rows never leave: each count sees only its own population while the GROUP BY keeps every region in play. The counter-argument — five queries are easier to debug individually — is an exploration argument, not a shipping one. The habit being graded: when rows must sum to a known total, build the table in one statement so the identity is enforced by the shape of the query.",
      tag: "aggregation",
    },
    {
      id: "brex-t18",
      q: "Cohort intensity reads 5.6 cycles per account in EU but 9.5 in the US. How is that ratio computed correctly, and why is averaging per-account counts the wrong fold?",
      a: "The ratio is aggregates over aggregates: EU's 45 cycles from 8 accounts is COUNT(*) / COUNT(DISTINCT customer_id) after the join — 5.6; the US's 19 from 2 is 9.5. Averaging the per-account cycle counts instead (one account's 24, another's 4 …) weights every account equally: a one-cycle founder counts as much as the 24-cycle account, and the result drifts toward the typical account rather than load per account — a coverage metric wearing an intensity label. The same rule at platform grain: 103 cycles from 16 accounts is 6.44 cycles per account, computed from the folds, never from averaging sixteen numbers. The business read the panel wants: intensity is a concentration signal — the US's 9.5 means volume sits in two logos, which is an underwriting question (one lost logo moves a quarter; 63.5% of the book rides on accounts over 3,000 lifetime). Ratio of folds, denominator stated; the average-of-ratios is the trap the follow-up question fishes for.",
      tag: "grain",
    },
    {
      id: "brex-t19",
      q: "Spend controls flag duplicate swipes — same merchant, close together. How does LAG turn that into one query, and what does the first row of every partition give you?",
      a: "LAG makes 'close together' a row-level fact. Order each account's transactions by time — LAG(paid_on) OVER (PARTITION BY customer_id, merchant ORDER BY paid_at) puts the previous swipe's timestamp on the current row, and the flag is the difference: current_ts - prev_ts < interval, same amount optional for a tighter duplicate definition. Partitioning by account AND merchant matters: 'close together' is only meaningful within the same swipe relationship — partitioning by account alone flags a coffee and a SaaS renewal nine minutes apart. The first row of every partition returns NULL from LAG — there is no prior swipe — and NULL arithmetic propagates: the gap column is NULL, the comparison is UNKNOWN, and the first swipe is never flagged, which is correct and free. The tuning knobs are the window and the amount match — and both are policy the controls team publishes, so the query quotes them verbatim the way the limit ladder quotes its edges. One pass, no self-join, and every flagged pair carries its own gap value for the review queue.",
      tag: "windows",
    },
    {
      id: "brex-t20",
      q: "Merchant spend concentrates — the top partner carries a fifth of card volume. What is the query shape for each merchant's share, and why is it a window question?",
      a: "Share is a ratio of two folds at different scopes, and only one of them survives a GROUP BY. The numerator is easy: SUM(quantity * unit_price) per merchant after the suppliers-to-products-to-lines join. The denominator — total platform spend — disappears the moment rows fold, so the window puts it back: SUM(value) OVER () attaches the platform total to every row, and the share is the ratio, deduped to one row per merchant. On this book the shape reproduces the concentration read exactly: the biggest merchant's share, then the top-two cumulation, which is the number the partner review actually quotes. The mental model to say out loud: GROUP BY replaces detail rows with aggregates; windows attach aggregates to detail rows — so any 'X as a share of the whole' metric is the canonical OVER () case. The underwriting angle: share drift is concentration drift, and the runbook reads the top-N cumulation monthly — the window version recomputes it in one pass instead of two queries and a division in a spreadsheet.",
      tag: "windows",
    },
    {
      id: "brex-t21",
      q: "The ledger stores debit_cents and credit_cents as separate columns, often one of them NULL per row. How do the folds behave, and where does COALESCE earn its keep?",
      a: "The NULL pattern is honest bookkeeping — a journal line debits OR credits, rarely both — and the folds lean on aggregate NULL behavior. SUM(debit_cents) ignores the NULL credits entirely, so the two-column trial balance fold works as-is: 181,080 against 181,080. COUNT(debit_cents) counts only the debited lines; COUNT(*) counts everything — the gap is the credit-line population, which is a census, not an error. The traps: NULL in arithmetic spreads — debit_cents - credit_cents on a credit-only row is NULL, so a net-movement column needs COALESCE(debit_cents, 0) - COALESCE(credit_cents, 0); and a per-row net that reads NULL is not zero — the account didn't stand still, it moved one direction only. COALESCE earns its keep at exactly these presentation edges: net columns, display fallbacks, and bucket boundaries in aging views. What it must never do is paper over a reconciliation: IFNULL-ing a missing leg sum to zero makes the no-leg statement read 'settled at zero' — a claim the rails table just contradicted. NULL means the legs said nothing; zero means they said nothing moved. Different sentences.",
      tag: "nulls",
    },
    {
      id: "brex-t22",
      q: "The account ladder prints the top 10 startups by cycle count — and four accounts tie at 4. What does LIMIT 10 actually deliver there, and how do you make the cut defensible?",
      a: "LIMIT 10 delivers ten rows — and no contract about WHICH ten when the sort key ties. On this ladder the head is unique (24, 17, 14, 13, 5) but the four-way tie at 4 sits exactly at the cut, so which account drops is decided by the engine's visit order and can change between runs — a limit review whose bottom row reshuffles is how trust dies. The defensible cut has layers: tie-break the ORDER BY until the key is unique — cycles DESC, booked_value DESC, name ASC — and comment the policy; or switch to a window and take rank <= 10 deliberately, which keeps ties together and can return twelve rows on purpose, a number the reviewer can defend. The RANK-vs-DENSE_RANK choice is the same policy argument the ladder teaches: RANK's gaps tell you how many shared rungs exist (the four-way tie consumes ranks 6-9 and the next count lands on 10 — six phantom positions), DENSE_RANK's don't. LIMIT is a display instruction; the cut is a business policy. Writing the policy down is the senior move.",
      tag: "pipeline",
    },
    {
      id: "brex-t23",
      q: "A board appendix stacks this year's settled spend beside last year's with UNION ALL and a year label. Why the label, why UNION ALL, and what does plain UNION cost you?",
      a: "The label is what makes the stack legible and safe: '2024' / '2025' as a literal column means every row is self-identifying, the two branches can never collapse into each other, and the reader knows which total belongs to which book. UNION ALL is the honest operator — it appends and promises nothing else, and it is what you mean. Plain UNION dedups whole rows silently: with the year label it is harmless here (labelled rows can't be byte-identical across branches), but without one, two branches that emit the same account with the same counts — a startup that spent identically both years — collapse to one row, and the board loses a company with no error anywhere. The discipline generalizes: every stacked report gets a branch-identifying column and UNION ALL, with a comment stating why duplicates are impossible if a reviewer asks; the comment is the correctness argument. And the reconciliation rides along: the stack's totals must sum to each year's independent fold — 103-cycle book split by year must return both year folds unchanged — or a branch lost rows.",
      tag: "setops",
    },
    {
      id: "brex-t24",
      q: "The growth deck classifies each account's year-over-year move — new, expanded, contracted, churned. How does that classification become one query, and what does the CASE order protect?",
      a: "Two year-folds, one comparison, one CASE. The shape: fold spend per account for this year and last year (two GROUP BYs or a conditional fold with FILTER), full-join them on the account key, and classify — last IS NULL AND this > 0 is 'new', both present and this > last is 'expanded', this < last is 'contracted', this IS NULL is 'churned'. The CASE order protects the boundary cases: the new-account arm must fire before any comparison arms, because comparing against NULL is UNKNOWN and a misplaced arm would silently dump every new account into ELSE — the classification's ELSE is a bug bucket, not a catch-all, so arms are written from most-specific to least and the census reconciles: new + expanded + contracted + churned = all 16 accounts, by construction. The movement read feeds the growth story the venture cohort runs on — expansion vs contraction by count AND by dollars, because two expanded accounts can hide a contracted whale (the 24-cycle, 7,262.35 account moving down is a different memo than a 1-cycle account moving up). Classify at the account grain, sum the dollars at the class grain, and let the CASE order carry the edge cases.",
      tag: "case",
    },
  ],

  mcqs: [
    {
      id: "brex-mcq-1",
      prompt: "A card cycle's status reads 'delivered'. In this kit's Brex stage map, what happened?",
      choices: ["Settled — the statement closed and counts as kept", "In-flight — stamped, not yet settled", "Declined — the limit refused the cycle", "Awaiting approval — stamp pending"],
      answer: 0,
      why: "The stage map is fixed: delivered = settled (52 of 103 cycles, 50.5%). It is the only status where the statement has actually closed.",
      notes: [
        { choice: 1, why: "In-flight is 'shipped' — 30 cycles stamped but not settled. Calling them settled inflates the kept share before a single statement closes." },
        { choice: 3, why: "Awaiting approval is 'pending' — 14 cycles with no shipped_at yet. Pending is not declined and not settled; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-2",
      prompt: "Decline rate is declined cycles ÷ which population? The db holds 7 declined, 14 awaiting approval, 30 in-flight and 52 settled of 103 booked.",
      choices: ["Approved cycles only (7/96 = 7.3%)", "All cycles booked (7/103 = 6.8%)", "Settled cycles only (7/52)", "Distinct accounts (7/16)"],
      answer: 1,
      why: "The house definition: declined ÷ ALL cycles booked — awaiting-approval and in-flight rows stay in the denominator because 'not yet decided' is exactly what underwriting watches. 6.8% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 44 undecided cycles inflates the rate to 7.3% by deleting the population still moving through the funnel — the rows underwriting exists to watch." },
        { choice: 2, why: "7/52 mixes a loss count with a settled base — different funnel steps. The decline rate is booked-denominated, full stop." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-3",
      prompt: "EU carries 45 cycles from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 cycles per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not accounts — a third grain nobody asked for. The census is cycles AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to declined cycles only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the decline map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-5",
      prompt: "Keep only accounts carrying at least 10 card cycles. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE cycles >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the ladder's head — 24, 17, 14 and 13 cycles — clears a 10-cycle bar per account.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'cycles' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting-approval cycles double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 cycles.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-7",
      prompt: "The bill-pay registry wants statements that settled but the book does NOT call paid. Which diff is correct?",
      choices: ["SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments", "SELECT invoice_id FROM payments EXCEPT SELECT id FROM invoices WHERE status = 'paid'", "SELECT invoice_id FROM payments UNION SELECT id FROM invoices WHERE status = 'paid'", "SELECT invoice_id FROM payments INTERSECT SELECT id FROM invoices WHERE status = 'paid'"],
      answer: 1,
      why: "EXCEPT is directional: settled-minus-claimed returns the statements carrying legs without a 'paid' status — #11 (void-but-debited, 925.00) and #25 (the 4,000-of-6,148 partial). The reverse direction returns #28, the paid statement with zero legs.",
      notes: [
        { choice: 0, why: "That is the mirror diff — claimed-paid minus settled — which surfaces the paid-status lie (#28, 1,756.00), a different anomaly for a different desk. Direction IS the question." },
        { choice: 3, why: "INTERSECT returns the 20 statements both censuses agree on — the clean book, not the misfits. The registry exists for the exceptions." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-8",
      prompt: "A staging-table watchlist uses account_id NOT IN (SELECT customer_id FROM cycles WHERE status = 'declined') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the watchlist empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every cycle carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty watchlists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-9",
      prompt: "A board stack puts settled cycles under declined cycles in one layout, built with UNION. A reviewer says one account's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same account, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same account, same counts, no region or branch label — collapse into one, and the board loses an account with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-10",
      prompt: "The limit census bands SKUs: WHEN price < 50 'budget', WHEN price < 200 'mid', ELSE 'premium'. A SKU is priced exactly 199.99 — where does it land, and why is the premium row missing from the output?",
      choices: ["mid — the ELSE arm never fires below 200, and GROUP BY cannot emit a group with no rows", "budget — arms re-evaluate until one matches, and budget is the only band with rows on this db", "premium — ELSE catches everything the earlier arms missed, including 199.99", "No row — a price that high falls outside every arm and drops out"],
      answer: 0,
      why: "CASE arms evaluate in order: 199.99 fails < 50, fails < 200, so mid takes it — and the ceiling holds because no SKU reaches 200. The premium arm exists only in the ELSE; with zero rows matching, GROUP BY emits no group — the absence of the row IS the proof the underwriting ceiling held.",
      notes: [
        { choice: 2, why: "ELSE is the arm of last resort: it fires only when every earlier WHEN failed, i.e. at price >= 200. 199.99 fails the < 200 arm, so it is mid — the boundary operator is the whole argument." },
        { choice: 3, why: "CASE is exhaustive by construction — the ELSE catches everything left. Rows never 'fall out' of a CASE; they fall into ELSE, and here ELSE matches nothing." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-11",
      prompt: "The limit ladder reads 8 budget SKUs averaging 32.06 and 8 mid SKUs averaging 111.50. Which fold produces those two numbers?",
      choices: ["SUM(price) per band", "COUNT(price) per band", "AVG(price) per band after CASE banding", "MAX(price) per band"],
      answer: 2,
      why: "The ladder reads band LEVELS: average underwritten limit per band. SUM would print band totals (256.47 / 891.96) — spend-shaped numbers under a policy header; MAX prints the biggest single limit per band (49 / 199.99) and hides the band's shape.",
      notes: [
        { choice: 0, why: "Band totals answer 'how much limit is extended in this tier' — a real question, but not the one the census asks. The average is the level read." },
        { choice: 1, why: "COUNT gives the 8-and-8 split but no level. The census needs count AND average — count alone is a headcount without a policy." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-12",
      prompt: "Merchant spend runs through six partner merchants. Which shape gives each merchant's share of total card volume?",
      choices: ["AVG(quantity * unit_price) per merchant", "SUM(value) OVER (PARTITION BY merchant) / SUM(value) OVER (), one row per merchant", "COUNT(*) per merchant over COUNT(DISTINCT merchant)", "MAX(quantity * unit_price) per merchant"],
      answer: 1,
      why: "Share = merchant value over platform value — two folds at two scopes. The partition window attaches both to every row; the platform OVER () is the stated denominator. Concentration reads are ratio-of-folds, always.",
      notes: [
        { choice: 0, why: "Average line value per merchant is a ticket-size read, not a share. Plausible cell, wrong population." },
        { choice: 2, why: "Count over count-of-merchants is a units chimera — lines per merchant. A share must be value over value." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-13",
      prompt: "The statement book is 28 statements worth 86,977.00; the rails table holds 27 legs. Why do the counts disagree by exactly one?",
      choices: ["One statement was deleted", "Six statements carry no legs, five settle on two legs each — 27 legs spread across 22 of 28 statements, and the arithmetic nets out leg-for-statement, not 1:1", "One leg settled two statements", "The rails table is missing a month"],
      answer: 1,
      why: "Legs and statements are different grains: 22 statements draw exactly one leg, five draw two (27 = 22 + 5), and six draw none — the six-row no-leg watchlist worth 15,217.00. Count differences are structural, not data loss.",
      notes: [
        { choice: 1, why: "The composition is the reconciliation: 22 + 5 + 6 = 28 statements, 22 + 5 = 27 legs. Both censuses reconcile once you name the grains." },
        { choice: 3, why: "Nothing is missing — the fan-out and the anti-join explain the arithmetic completely. 'Missing month' is the reflex to unlearn." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-14",
      prompt: "Statement #25 reads 6,148.00 face with 4,000.00 settled across its legs. Which coverage class is that, and which query finds it?",
      choices: ["Exact — the legs exist", "Partial — the fold-and-compare class: legs folded per statement, SUM(legs) < face", "No-legs — the anti-join class", "Void — the status class"],
      answer: 1,
      why: "Partial needs the comparison the anti-join cannot make: legs folded per statement, SUM(p.amount_cents) < i.amount_cents. #25 is the book's only partial — 4,000.00 of 6,148.00 — and it feeds the settled-not-paid registry beside #11.",
      notes: [
        { choice: 2, why: "No-legs means zero legs — #25 HAS legs, just short. The anti-join sees absence, not shortfall; the CASE census sees both." },
        { choice: 3, why: "Status is a claim, not a class of coverage — #25 reads 'open', which is consistent, not the finding. The finding is the shortfall." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-15",
      prompt: "Platform opex reads Rent 14 lines / 16,800.00 of 25,416.00 total. Which one-pass query gives each category's spend and share?",
      choices: ["GROUP BY category, SUM(amount_cents)/100.0, divided by SUM over ()", "GROUP BY category with COUNT(*)", "WHERE category = 'Rent' per category, run five times", "GROUP BY category with MAX(amount_cents)/100.0"],
      answer: 0,
      why: "Category fold from the GROUP BY, platform denominator from SUM over (), ratio per row — Rent lands at 66.1%. One scan, columns that reconcile: 16,800 + 4,570 + 2,521 + 1,525 = 25,416.00 by construction.",
      notes: [
        { choice: 2, why: "Five queries at five moments lose the reconciliation guarantee — and the fifth run's total may not match the first's. The shipped artifact is one statement." },
        { choice: 3, why: "MAX reads the biggest single rent line, not Rent's total — a share of nothing dressed like the read." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-16",
      prompt: "A prepayment sweep flags statements paid before their due date. Which comparison expresses 'prepaid'?",
      choices: ["due_on > issued_on", "paid_on < due_on — the settlement leg landed before the claim came due", "amount_cents > MAX(amount_cents)", "paid_on IS NOT NULL"],
      answer: 1,
      why: "Prepayment is a date relationship between the leg and the claim: paid_on < due_on. It needs the join — legs carry paid_on, statements carry due_on — and it is the healthy mirror of the aging read, not a bug bucket.",
      notes: [
        { choice: 0, why: "That is terms length — every statement satisfies it. The sweep is about WHEN the leg landed, which lives on the payments side." },
        { choice: 3, why: "Paid-at-all is the covered population, not prepayment. The date comparison is the entire predicate." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-17",
      prompt: "The premium band (>= 200) returns no row in the limit census. What is the correct operational read?",
      choices: ["The query filtered premium out — re-run without the CASE", "No SKU is underwritten at or above 200 — the ceiling holds at 199.99, and the missing row IS the proof", "Premium SKUs exist but have NULL prices", "The band edge is wrong — it should be 199"],
      answer: 1,
      why: "GROUP BY cannot emit a group with no rows, so an empty premium band means the ELSE arm matched nothing — max price 199.99. The absence is the underwriting story: a breached ceiling would print a third row.",
      notes: [
        { choice: 0, why: "The CASE covers all 16 SKUs across its arms — nothing was filtered. Removing it would unband the census, not reveal premium." },
        { choice: 2, why: "Every SKU carries a price — the ladder is complete. NULL prices would surface in the band totals, not hide a band." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-18",
      prompt: "Spend controls flag accounts with two swipes at the same merchant within seven days. Which window shape expresses 'within seven days of THIS account's previous swipe at THIS merchant'?",
      choices: ["LAG(paid_on) OVER (PARTITION BY customer_id, merchant ORDER BY paid_on), gap < 7", "WHERE paid_on BETWEEN paid_on - 7 AND paid_on", "COUNT(*) OVER () < 7", "GROUP BY customer_id HAVING COUNT(*) >= 2"],
      answer: 0,
      why: "LAG puts the previous swipe's timestamp on the current row — partitioned by account AND merchant, so 'previous' means the same swipe relationship — and the gap comparison is the flag. First swipe of every partition reads NULL and never flags, which is correct.",
      notes: [
        { choice: 1, why: "BETWEEN paid_on - 7 AND paid_on compares a column to itself — a self-reference the row-level WHERE cannot see. The prior swipe only exists through a window or a self-join." },
        { choice: 3, why: "Two swipes ever, anywhere — no merchant match, no window. The flag fires on year-old pairs and misses nothing, which is worse than missing something." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-19",
      prompt: "The statement feed carries restatements — same statement, newer timestamp. Which window keeps exactly one row per statement, latest wins?",
      choices: ["RANK() OVER (PARTITION BY statement_key ORDER BY updated_at DESC) kept where rank = 1", "ROW_NUMBER() OVER (PARTITION BY statement_key ORDER BY updated_at DESC) kept where rn = 1", "GROUP BY statement_key with MAX(updated_at)", "DISTINCT on the statement_key column"],
      answer: 1,
      why: "ROW_NUMBER splits ties arbitrarily but guarantees exactly one rn = 1 per statement — keep-latest by contract. RANK would keep BOTH rows of a timestamp tie (two restatements stamped the same second), which the feed contract must explicitly allow.",
      notes: [
        { choice: 0, why: "RANK = 1 keeps every tied row — the dedupe silently fails on timestamp collisions. Same shape, different guarantee: say which one the feed needs." },
        { choice: 2, why: "MAX(updated_at) finds the newest timestamp but not its ROW — the other columns of the surviving row are undefined without a window. Half a dedupe." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-20",
      prompt: "A billing trend buckets by SUBSTR(created_at, 1, 7) and sorts fine — until October. Which cycle would scramble if the key dropped to SUBSTR(created_at, 1, 6)?",
      choices: ["None — six characters is still a valid month key", "'2024-1…' — January and October both start '2024-1', and text sort merges them; the zero-padded '%Y-%m' or 1,7 slice is the fix", "Only December", "All of them — SUBSTR cannot sort dates"],
      answer: 1,
      why: "Six characters keeps year plus first month digit: '2024-10' and '2024-11' both truncate to '2024-1', merging October and November (and '2024-1x' sorts against January's '2024-01' only because of padding). ISO text order works ONLY with the full zero-padded key.",
      notes: [
        { choice: 1, why: "The spine's sort is lexicographic — it survives because ISO pads months. Shorten the key and padding is gone, so text order stops being date order." },
        { choice: 2, why: "December truncates to '2024-1' too — but so do October and November. The merge hits every double-digit month, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-21",
      prompt: "Aging buckets: CASE WHEN days_late <= 0 THEN 'current' WHEN days_late <= 30 THEN '1-30' ELSE '31+' END. What does the ELSE arm promise?",
      choices: ["Nothing — rows can fall out of the CASE", "Every statement older than 30 days lands in '31+' — the CASE is exhaustive, so the buckets must sum to all 28 statements", "Only unpaid statements", "Only statements with NULL due dates"],
      answer: 1,
      why: "CASE is exhaustive by construction: the ELSE catches everything the earlier arms missed, so nothing falls out — the buckets reconcile to the statement book. That exhaustiveness is the aging view's audit property, not a style choice.",
      notes: [
        { choice: 2, why: "The CASE sees paid statements too — bucketing a claim ignores whether the legs settled it. The leg-fold join happens BEFORE aging, not inside it." },
        { choice: 3, why: "NULL due dates would compare UNKNOWN and fall to ELSE — a real subtlety, but the ELSE's job is the over-30 bucket. NULL handling is an upstream guard." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-22",
      prompt: "The growth deck classifies accounts: 'expanded' = this year's spend > last year's, where both years exist. Which arm order keeps new accounts out of 'expanded'?",
      choices: ["Expanded first — it is the common case", "New first: WHEN last_year IS NULL THEN 'new' must fire before any this > last comparison, because NULL comparisons are UNKNOWN and would dump new accounts into ELSE", "Churned first", "Order does not matter — CASE picks the best match"],
      answer: 1,
      why: "last_year > anything is UNKNOWN for a new account, so a comparison arm can never claim it — it falls through to ELSE. Put the NULL-shape arms first ('new', 'churned') and the comparison arms after; ELSE becomes a bug bucket, not a classification.",
      notes: [
        { choice: 0, why: "Frequency is not evaluation order. CASE takes the FIRST true arm — and for new accounts no comparison arm is ever true, so order decides nothing... unless ELSE is mislabeled, which is the bug." },
        { choice: 2, why: "Churned is also a NULL-shape arm (this IS NULL) — it belongs beside 'new' in the front group. The principle is NULL-shapes before comparisons." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-23",
      prompt: "Structuring looks like many swipes just under a policy limit. Which fold makes the pattern visible?",
      choices: ["MAX(amount) per account", "GROUP BY account, merchant, day HAVING COUNT(*) >= 4 AND MAX(amount) < 50 — a volume gate paired with a ceiling check", "AVG(amount) per account over all time", "COUNT(DISTINCT merchant) per account"],
      answer: 1,
      why: "Structuring is a group-level fact — MANY swipes, each SMALL — so both conditions live in HAVING after the fold: count clears the floor, max sits under the limit. Either condition alone is noise; the pair is the pattern.",
      notes: [
        { choice: 0, why: "MAX catches the biggest swipe, not the swarm. A structured account's MAX is exactly the tell that it ISN'T structuring — under the limit." },
        { choice: 2, why: "A long-run average flattens the burst — structuring is a per-day pattern, which is why the fold keys on day, not the account lifetime." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-24",
      prompt: "Duplicate-charge pairs: same account, same merchant, same amount, minutes apart. Which shape pairs the rows without double-counting?",
      choices: ["A self-join orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id with the match conditions and a time window", "GROUP BY customer_id, merchant with COUNT(*) >= 2", "LAG only — pairs cannot exist in a window", "CROSS JOIN of all transactions"],
      answer: 0,
      why: "The self-join with a.id < b.id pairs each transaction with its LATER twin exactly once — no mirrored duplicates — and the ON clause carries the match conditions plus the window. The count fold flags accounts; the pair query produces the evidence rows.",
      notes: [
        { choice: 1, why: "The fold says 'this account has two swipes' without naming them — the review queue needs the pair, with both ids and the gap, which only the join delivers." },
        { choice: 3, why: "CROSS JOIN pairs everything with everything — no match conditions. The ON clause IS the control; without it the pair set is quadratic noise." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-25",
      prompt: "SELECT invoice_id FROM payments INTERSECT SELECT id FROM invoices WHERE status = 'paid' — what does the clean-book INTERSECT return on this db?",
      choices: ["The 2 anomaly statements", "The 20 statements both censuses agree on — legs exist AND the book calls them paid", "All 27 legs", "NULL — INTERSECT needs matching column names"],
      answer: 1,
      why: "INTERSECT keeps rows present in both branches: statements with legs AND a paid claim. 27 legs cover 22 statements; 21 claim paid; the overlap is 20 — the two mirrors (#11, #25 settled-not-paid; #28 paid-not-settled) fall outside it, which is the point.",
      notes: [
        { choice: 0, why: "That is EXCEPT's job, one direction each. INTERSECT is the agreement set — the control group that makes the anomalies countable." },
        { choice: 2, why: "Legs are the input grain, but INTERSECT dedups to distinct values — 22 distinct statement ids, not 27 legs, and only the paid ones survive." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-26",
      prompt: "An amount-anomaly rule uses a z-score against the account's baseline sigma; a policy rule uses HAVING MAX(amount) < 50. What is the operational difference?",
      choices: ["None — both flag outliers", "The z-score adapts to each account's distribution and flags RELATIVE outliers with no threshold published; the HAVING rule is a fixed policy gate every reviewer can recompute — different tools for a fraud desk and a controls desk", "Z-scores require a subquery; HAVING does not", "HAVING is faster"],
      answer: 1,
      why: "The statistical flag needs no published threshold — it moves with the account's own distribution, which is its power and its governance problem (why did THIS row flag? sigma moved). The policy gate is recomputable by anyone. Controls ship the gate; the fraud desk keeps the model.",
      notes: [
        { choice: 0, why: "Both flag rows, but they answer different questions — 'unusual for this account' vs 'violates the published rule'. Auditors treat them differently and so should the query log." },
        { choice: 2, why: "Both shapes can carry subqueries or not — the distinction is adaptive vs fixed, not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-27",
      prompt: "WHERE price >= (SELECT MAX(price) FROM products) — what does the query return on this 16-SKU book, and what does it prove?",
      choices: ["The average SKU — MAX over the fold", "The SKU(s) priced exactly 199.99 — the ladder's top rung, proving where the ceiling sits", "All premium SKUs — the band above the ceiling", "NULL — MAX cannot run in a subquery"],
      answer: 1,
      why: "The scalar subquery returns one row — 199.99 — and the comparison keeps every SKU at or above it: the top of the ladder. On a book where the ceiling holds, that is exactly one rung; a breached ladder would return more.",
      notes: [
        { choice: 2, why: "There is no 'above the ceiling' — the max IS the top. A band query needs the CASE ladder; the scalar answers 'who sits at the max'." },
        { choice: 3, why: "MAX is a standard aggregate in a scalar position — 0-or-1 rows is the contract, and a non-empty table always delivers one. The empty case only appears when the subquery is filtered." },
      ],
      difficulty: "hard",
    },
    {
      id: "brex-mcq-28",
      prompt: "EU runs 45 cycles from 8 accounts; the US runs 19 from 2. A teammate reports 'EU is 2.4x more intense' by dividing the two ratios wrong. What is the intensity pair?",
      choices: ["5.6 vs 9.5 — 45/8 and 19/2, computed from the folds; the US concentrates, the EU broadens", "45/19 and 8/2", "5.6 vs 2.4", "8/45 and 2/19"],
      answer: 0,
      why: "Intensity is cycles per account at each region: 45/8 = 5.6, 19/2 = 9.5. The US's higher ratio is a concentration signal — two logos carry the load — which is an underwriting question, not a growth one.",
      notes: [
        { choice: 1, why: "That divides region by region and accounts by accounts — two more ratios nobody asked for. The metric is within-region load per account." },
        { choice: 3, why: "Accounts per cycle inverts the read — 0.18 accounts per cycle is the same fact, but reporting it that way hides the concentration headline." },
      ],
      difficulty: "easy",
    },
    {
      id: "brex-mcq-29",
      prompt: "Five statements settle on two legs each. SUM(i.amount_cents) over statements-joined-to-legs reads HIGH. By how much, and what is the fix?",
      choices: ["By one leg — the fix is DISTINCT", "By the five split statements' combined face value — each contributes twice; fold legs per statement first (SUM per i.id), then compare or sum", "Not at all — the join is 1:1", "By the six no-leg statements' value"],
      answer: 1,
      why: "The fan-out repeats each split statement's face once per leg: two legs, two contributions. The fix is grain — fold legs per statement, THEN compare to face or sum the statement-level results. DISTINCT hides the bug instead of fixing it.",
      notes: [
        { choice: 2, why: "27 legs against 28 statements is not 1:1 — five statements draw two legs. The fan-out is the whole finding." },
        { choice: 3, why: "No-leg statements contribute nothing to the joined fold — they are the anti-join's population, a different census. The over-count comes from the splits." },
      ],
      difficulty: "medium",
    },
    {
      id: "brex-mcq-30",
      prompt: "The close packet's last line: 181,080.00 debits, 181,080.00 credits, 80 ledger entries. A reviewer asks why the entry COUNT appears in the proof at all. The best answer?",
      choices: ["It doesn't — the count is decoration", "The count is a sanity anchor: a delta-zero balance on 0 entries would be vacuous, and a count that moves between runs means rows appeared or vanished — the balance AND the population must both be stable to ship", "The count proves cents discipline", "80 is the account count"],
      answer: 1,
      why: "Delta zero is necessary but not sufficient — an empty ledger is trivially balanced. The entry count pins the population: same balance, same count, two runs in a row is the reproducibility the close packet demands before it ships.",
      notes: [
        { choice: 1, why: "Balance plus population plus reproducibility — that is the audit triangle. A proof that only checks one number proves one number." },
        { choice: 2, why: "Cents discipline lives in the /100.0 read, not the count. The count's job is population stability." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-brex-1",
      tier: "easy",
      topic: "l8",
      universe: "pricing",
      title: "The underwriting limit census",
      brief:
        "Brex-flavored brief on the storefront db: Monday's underwriting review opens with the limit census — every card/plan SKU banded by its underwritten limit, with the band edges quoted so the boundary argument happens before the query runs. Probed facts: 16 SKUs split 8 budget SKUs averaging 32.06 and 8 mid SKUs averaging 111.50; the premium band (>= 200) is empty — the ceiling holds at 199.99 — so the census returns two rows, and the missing premium row is the proof the ladder was not breached. The review reads biggest average limit first.",
      ask: "Return each limit band with its SKU count and average limit to 2 decimals, biggest average limit first.",
      template:
        "SELECT CASE\n         WHEN price < {1} THEN 'budget'\n         WHEN price < {2} THEN 'mid'\n         ELSE 'premium'\n       END AS band,\n       COUNT(*) AS limit_skus,\n       ROUND({3}(price), 2) AS avg_limit\nFROM products\nGROUP BY band\nORDER BY avg_limit {4};",
      slots: [
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the budget band edge",
          why: "The policy ladder's first edge: budget limits sit under 50. The pricing page publishes the edges, so the query must quote them verbatim — an edge nobody wrote down is a band nobody can defend.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the mid-band ceiling",
          why: "The ceiling edge: mid runs to 200 and premium begins there. No SKU crosses it — max price 199.99 — so this edge is what makes the premium arm honest rather than aspirational.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the band-average fold",
          why: "The review reads the ladder by AVERAGE limit per band: 32.06 budget, 111.50 mid. SUM would add the limits inside each band (256.47 / 891.96), MAX would print the biggest single limit (49 / 199.99) — band sizes, not band levels.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review reads biggest average limit on top: mid 111.50, budget 32.06. ASC would open the meeting on the budget tier — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["SUM", "MAX", "MIN", "ASC", "100", "150"],
      walkthrough:
        "One table, one CASE, one fold. The CASE bands all 16 SKUs by their underwritten limit — the edges 50 and 200 come off the published policy ladder — and GROUP BY band folds each band into a count and an average. The result is two rows: mid 8 SKUs @ 111.50, budget 8 @ 32.06, mid on top by DESC. The premium band produces NO row — the ELSE arm matches nothing because max price is 199.99 — and that absence is the underwriting proof: a breached ceiling would print a third row. The distractors each break differently: SUM folds band totals (256.47 / 891.96) instead of averages, so the ladder reads like spend, not policy; MAX prints the largest single limit per band and hides the band's shape; MIN does the opposite and reads the floor; 100 or 150 in an edge slot re-bands the book silently — edge 150 splits mid and pushes a 199.99 SKU into premium, a third row that should not exist; ASC inverts the read and opens the review on budget. Band edges, fold, direction — the three things underwriting actually argues about.",
    },
    {
      id: "cs-brex-2",
      tier: "medium",
      topic: "s4",
      universe: "month-close",
      title: "The settled-not-paid registry",
      brief:
        "Brex-flavored brief on the storefront db: at every close, bill-pay ships the settled-not-paid registry — statements that carry rail legs but whose status the book does not call paid. Probed facts: 27 rail legs settle 22 of 28 statements; 21 statements claim paid; the two censuses disagree in both directions. The settled-not-paid diff returns exactly two rows — #25 (open, 6,148.00, the 4,000.00 partial) and #11 (void, 925.00, the void-but-debited leg) — while the mirror diff returns #28 (paid, 1,756.00) with zero legs behind it. The registry reads biggest exposure first; amounts read as dollars via the cents divider.",
      ask: "Return each settled-but-not-paid statement with its id, status and dollar amount to 2 decimals, biggest amount first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS amount_dollars\nFROM invoices i\nWHERE i.id IN (\n    SELECT invoice_id\n    FROM payments\n    {2}\n    SELECT id\n    FROM invoices\n    WHERE status = {3}\n  )\nORDER BY amount_dollars {4}, statement_id ASC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements store INTEGER cents; the dollar read is amount_cents / 100.0 — 614800 cents prints 6,148.00. A missing .0 is the classic fintech unit bug: /10.0 prints 61,480 and the registry overstates exposure tenfold.",
        },
        {
          answer: "EXCEPT",
          kind: "keyword",
          label: "the direction of the diff",
          why: "The registry is settled-minus-claimed: rail legs EXCEPT paid status. INTERSECT returns the 20 statements both censuses agree on; UNION stacks both censuses into 23 rows — the clean book, not the misfits.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the claimed-status literal",
          why: "The claim being tested is status = 'paid'. 'void' or 'open' re-aims the diff at a different claim and the registry silently re-populates with statements nobody was chasing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure direction",
          why: "The registry reads biggest exposure first: #25 at 6,148.00 above #11 at 925.00. ASC opens the packet on the smallest misfit — the one that can wait until tomorrow.",
        },
      ],
      distractors: ["UNION", "INTERSECT", "UNION ALL", "'open'", "ASC", "10.0"],
      walkthrough:
        "Two censuses, one diff. The inner set algebra folds the rail book — SELECT invoice_id FROM payments, 27 legs covering 22 statements — against the claim book — statements with status 'paid', 21 of them — and EXCEPT keeps the legs the book does not call paid: exactly #25 (open, 6,148.00 — the 4,000.00 partial) and #11 (void, 925.00 — money that moved on a voided statement). The outer query joins back through IN to print id, status and the dollar read, cents divided by 100.0 and rounded to 2 — 6148 and 925 on the page, ordered biggest-first. The mirror diff (paid EXCEPT settled) is the second packet: #28, the paid claim with zero legs — a status that lies. The distractors each break differently: INTERSECT returns the 20 agreed statements — the clean book, no anomalies; UNION stacks both censuses into 23 rows including every settled statement; 'open' re-aims the claim and drops #25 from its own registry; ASC buries the 6,148.00 exposure under the 925.00; 10.0 in the divider prints 61,480 and 9,250 — the registry that pages nobody because the numbers look plausible. Status is a claim; rails are the ledger of record; EXCEPT is how the two are forced to agree.",
    },
    {
      id: "cs-brex-3",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The merchant spend leaderboard",
      brief:
        "Brex-flavored brief on the storefront db: the partner review ranks merchant/network partners by card volume routed through them — transaction lines folded per merchant, cycles touched beside it. Probed facts: six merchants route the book — Nordic Gadgets AB 11,130.25 over 43 lines (38 cycles), Midwest Hardware Co 9,294.93 over 56 (45), Alpine Audio GmbH 4,765.63 over 40 (34), Shenzhen Electro 3,049.07 over 47 (41), Pacific Textiles 2,980.15 over 40 (35), Andes Naturals SA 3,613.25 over 25. The review applies a volume floor of 40 line records — Andes' 25-line bench drops below it, and the leader-board ships five merchants. Spend reads to cents off REAL dollars; biggest spend first.",
      ask: "Return each merchant carrying at least 40 line records with its line count, distinct cycles touched and routed spend to 2 decimals — biggest spend first.",
      template:
        "SELECT s.name AS merchant,\n       s.region,\n       COUNT(*) AS line_records,\n       COUNT(DISTINCT oi.order_id) AS cycles_touched,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS routed_spend\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name\nHAVING COUNT(*) >= {2}\nORDER BY routed_spend {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Routed spend prints to cents — 11,130.25 / 9,294.93 / 4,765.63 / 3,049.07 / 2,980.15 — so the leaderboard reconciles row-for-row with the value table the partner review quotes. ROUND to 1 prints 11,130.3 and the review packet stops matching its own source.",
        },
        {
          answer: "40",
          kind: "number",
          label: "the volume floor",
          why: "The review's group-level gate: COUNT(*) >= 40 after the fold. Andes' 25-line bench drops below it — 5 merchants ship. 1 in the slot keeps all six and the floor is decorative; the floor is policy, so the query quotes it verbatim.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend direction",
          why: "The review reads concentration on top: Nordic 11,130.25 down to Pacific 2,980.15. ASC opens the packet on the smallest bench player — the opposite of what a concentration review exists to surface.",
        },
      ],
      distractors: ["1", "ASC", "SUM"],
      walkthrough:
        "A three-table chain, one fold, one gate. The join walks merchants to their SKUs to their transaction lines — the fan-out is the point: COUNT(*) reads the line grain (Nordic 43, Midwest 56, Alpine 40, Shenzhen 47, Pacific 40), COUNT(DISTINCT oi.order_id) folds it back to cycles touched (38 / 45 / 34 / 41 / 35), and ROUND(SUM(oi.quantity * oi.unit_price), 2) reproduces the spend board exactly — 11,130.25 / 9,294.93 / 4,765.63 / 3,049.07 / 2,980.15, biggest first. The HAVING carries the policy: the 40-line volume floor is a group-level fact — it exists only after the fold — so it lives in HAVING, and it quietly drops Andes Naturals (25 lines, 3,613.25) from the shipped board; a floor of 1 keeps all six and the gate becomes decoration. The two grains argue the concentration story in one row: Midwest moves 56 lines for 9,294.93 (166.70 per line) while Nordic moves 43 for 11,130.25 (258.84 per line) — bigger tickets, fewer of them. The distractors each break differently: 1 in the floor slot ships all six merchants and erases the gate's decision; ASC inverts the read and opens on Pacific; SUM in the precision slot is a rejected aggregate where a number belongs. Three grains, one gate, and the concentration read the partner review actually ships.",
    },
    {
      id: "cs-brex-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The account activity ladder",
      brief:
        "Brex-flavored brief on the storefront db: the limit review ranks startup accounts by card-cycle count — the ladder underwriting reads before every band recalibration. Probed facts: Alice Chen runs 24 cycles for 7,262.35, Emma Wilson 17 for 6,640.56, Grace Kim 14 for 4,574.23, Maya Patel 13 for 3,644.56, Chloe Dubois 5 for 2,667.93 — then FOUR accounts tie at 4 cycles (Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi, Noah Meyer 737.68) and the next distinct count (3) lands on rank 10. RANK semantics are the policy: shared rungs for peer startups, gaps after the tie block. The cut shows the ladder head — LIMIT 8 — and the tie block is the argument the review actually has.",
      ask: "Return the top accounts by cycle count — name, cycle count, booked value to 2 decimals and rank position — biggest book first, ties sharing rungs.",
      template:
        "SELECT c.name AS account,\n       COUNT(o.id) AS cycles,\n       ROUND(SUM(o.total), {1}) AS booked_value,\n       {2}() OVER (ORDER BY COUNT(o.id) DESC) AS rank_position\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY rank_position\nLIMIT {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the value precision",
          why: "Booked value prints to cents — 7,262.35 / 6,640.56 / 4,574.23 — so the ladder reconciles with the concentration grid underwriting quotes. ROUND to 0 prints 7,262 and the tie-block tie-break (value DESC) loses its cents-precision ordering.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung policy",
          why: "RANK shares rungs and skips after: the four-way tie at 4 consumes ranks 6-9 and the next distinct count lands on 10. ROW_NUMBER splits the tie 6/7/8/9 — an arbitrary pecking order among peer startups; DENSE_RANK would share rungs but hand the next count rank 7, erasing the gap the policy publishes.",
        },
        {
          answer: "8",
          kind: "number",
          noVerify: true,
          label: "the ladder cut",
          why: "LIMIT 8 shows the unique head (ranks 1-5) plus the tie block opening — enough ladder to argue the policy without printing all 16 accounts. LIMIT 5 would cut exactly at the tie and hide the argument the review exists to have.",
        },
      ],
      distractors: ["ROW_NUMBER", "ASC", "0"],
      walkthrough:
        "One join, one fold, one window — and a policy made visible. The join attaches every cycle to its account, GROUP BY c.id folds 103 cycles into 16 rows, and the window ranks by cycle count: Alice 24 / 7,262.35 at rank 1, Emma 17 / 6,640.56, Grace 14, Maya 13, Chloe 5 — then the four-way tie at 4 cycles all sharing rank 6, because RANK gives tied counts the same rung and skips after: the next distinct count (3 cycles) lands on rank 10, implying four phantom positions that do not exist. That gap IS the published policy — shared rungs for peer startups, and the rung arithmetic tells the review how big the tie block is. The value column carries the money read beside the count read: Chloe's 5 cycles hold 2,667.93 while a 4-cycle account holds 737.68 — activity and value disagree, which is why the ladder reports both. The distractors each break differently: ROW_NUMBER splits the tie into 6/7/8/9 — an arbitrary pecking order among peer startups that reshuffles between renders; ASC flips the window's sort so rank 1 becomes the least-active account — the ladder upside down; 0 in the precision slot truncates the cents and breaks the tie-break order; (and LIMIT 0 — the empty ladder — would ship a blank packet). Rank function, precision, cut: three policy decisions wearing SQL syntax.",
    },
    {
      id: "cs-brex-5",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The statement coverage census",
      brief:
        "Brex-flavored brief on the storefront db: bill-pay's close artifact is the coverage census — every statement classified by what the rails actually settled against its face, claims cross-checked against legs. Probed facts: 28 statements split 21 exact worth 65,612.00 (legs folded equal face), 1 partial worth 6,148.00 (#25, 4,000.00 of face settled) and 6 no-legs worth 15,217.00 — the class counts sum to 28 by construction and the class values sum to the 86,977.00 book. The classification folds legs per statement FIRST (SUM per statement id), then CASE-compares the fold to face: zero legs, enough legs, short legs. The census reads biggest class first.",
      ask: "Return each coverage class with its statement count and total face value to 2 decimals — most statements first.",
      template:
        "SELECT coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(face_cents) / {1}, 2) AS face_value\nFROM (\n  SELECT i.id,\n         i.amount_cents AS face_cents,\n         CASE WHEN COUNT(p.id) = 0 THEN {2}\n              WHEN SUM(p.amount_cents) >= i.amount_cents THEN 'exact'\n              ELSE 'partial' END AS coverage\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY statements {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements store INTEGER cents; the dollar read is face_cents / 100.0 — 6,561,200 cents prints 65,612.00. A missing .0 is the unit bug: /10.0 prints 656,120 and the census overstates the book tenfold while looking plausible.",
        },
        {
          answer: "'no-legs'",
          kind: "keyword",
          label: "the zero-leg class label",
          why: "The zero-leg class must name itself: 'no-legs' is the bucket the billing desk memorized (6 statements, 15,217.00). 'paid' in this slot relabels the bucket — the census still sums to 28, but every reader cross-checking against the memorized grid now reads a class that contradicts the status column, and the anomaly hunt starts from a lie.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-class direction",
          why: "The census reads biggest class on top: exact 21, no-legs 6, partial 1. ASC opens the packet on the single partial statement — the one-row arm — and buries the 21-statement clean book that gives the census its shape.",
        },
      ],
      distractors: ["10.0", "ASC", "'paid'"],
      walkthrough:
        "Two grains, one CASE, and the fold-before-compare rule made mechanical. The inner query is the statement grain: invoices LEFT JOIN payments, GROUP BY i.id, legs folded per statement — and the CASE compares the FOLD to the face: COUNT(p.id) = 0 is no-legs (6 statements, 15,217.00 — including #28, the paid claim with nothing behind it), SUM(p.amount_cents) >= face is exact (21 statements, 65,612.00), anything short is partial (exactly #25, 6,148.00 face with 4,000.00 settled). The outer query then folds the classes: COUNT and SUM(face_cents)/100.0 per class — 21 / 6 / 1 statements, 65,612.00 / 15,217.00 / 6,148.00, summing to the 86,977.00 book, class counts summing to 28 statements by construction. The arm order is the correctness argument: the no-legs test must fire before the exact test, because SUM over zero legs is NULL and a misplaced arm would let NULL >= face — UNKNOWN — dump no-leg statements into partial, re-banding the census with no error. The distractors each break differently: 10.0 in the divider prints 656,120.00 — exposure overstated tenfold, the census that pages nobody; ASC opens on the one-row partial arm; 'paid' in the class literal relabels the no-legs bucket — the cells change and the reconciliation the census promises (28 by construction) silently stops being checkable against the billing desk's memorized grid. Fold legs per statement, compare at the statement grain, fold the classes last — the CASE is just the census wearing brackets.",
    },
    {
      id: "cs-brex-6",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The opex stack with the grand total",
      brief:
        "Brex-flavored brief on the storefront db: the close packet's opex page folds platform spend per expense category, then appends the grand-total row the reviewers reconcile against — a UNION ALL stack with the total row labelled TOTAL. Probed facts: 36 expense lines worth 25,416.00 split Rent 14 lines / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00 — and the TOTAL row carries 36 / 25,416.00, which equals the sum of the category rows by construction. Finance tables store INTEGER cents, so every dollar read divides by 100.0; the stack reads biggest spend first, which puts the TOTAL row on top by design — 25,416.00 is the number the page reconciles to.",
      ask: "Return each expense category with its line count and spend to 2 decimals, then append a labelled grand-total row — biggest spend first.",
      template:
        "SELECT category,\n       COUNT(*) AS opex_lines,\n       ROUND(SUM(amount_cents) / {1}, 2) AS spend\nFROM expenses\nGROUP BY category\n{2}\nSELECT {3}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY spend {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Expenses store INTEGER cents; the dollar read is SUM(amount_cents) / 100.0 — 1,680,000 cents prints 16,800.00. /10.0 prints 168,000 and the opex page overstates tenfold while every row still 'reconciles' against the wrong total.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the append operator",
          why: "The stack APPENDS the grand-total row to the category rows — UNION ALL, declared intent, nothing deduped. INTERSECT intersects the two branches (empty — no category row equals the total row); EXCEPT returns the four category rows minus the total, silently deleting the grand row the page exists to reconcile against.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The grand row must label itself: 'TOTAL' makes the appended row self-identifying and the reconciliation visible. An unlabeled branch would print a fifth 'category' that reads like a category — and a reviewer would sum it into the total, double-counting the page.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "ORDER BY spend DESC sorts the whole stack: TOTAL 25,416.00 first, then Rent 16,800.00, Ads 4,570.00, Travel 2,521.00, Tools 1,525.00. The total row leading is by design — it is the number the page reconciles to; ASC would bury it under the smallest category.",
        },
      ],
      distractors: ["INTERSECT", "EXCEPT", "ASC", "10.0"],
      walkthrough:
        "Two branches, one sort, and the grand row that makes the page auditable. The first branch folds the category grain — GROUP BY category over 36 expense lines gives Rent 14 / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00 — and the second branch folds the same table whole: the TOTAL row, 36 lines / 25,416.00. UNION ALL appends without deduping, so the stack carries all five rows, and ORDER BY spend DESC sorts across the union — the TOTAL row leads because 25,416.00 is the largest value on the page, which is the design: the reviewer reads the reconciliation target first, then the categories that build it (16,800.00 + 4,570.00 + 2,521.00 + 1,525.00 = 25,416.00 by construction). The cents divider carries the money rule: INTEGER cents in, /100.0 on the way out, ROUND(..., 2) at the presentation edge. The distractors each break differently: INTERSECT between the branches returns zero rows — no category row equals the total row — an empty page; EXCEPT returns the four categories minus the total, the page missing the very row it reconciles against; ASC buries the TOTAL under Tools and the reviewer sums before they see it; 10.0 in the divider overstates every row tenfold. Append with UNION ALL, label the grand row, sort by the reconciliation — the stack is the close's simplest audit and the template for every total-on-top page in the packet.",
    },
  ],

  problems: [
    { slug: "duplicate-charge-pairs", why: "Spend controls start as duplicate detection: two swipes, same merchant, same window. This self-join window problem is the exact shape of Brex's duplicate-swipe flag before a policy blocks the second leg." },
    { slug: "gl-reconciliation", why: "The card ledger and the GL must agree to the cent. This reconciliation drill mirrors the delta-zero proof the close packet ships with — 181,080 against 181,080 here." },
    { slug: "trial-balance-check", why: "Every Brex close ends at the trial balance. This conditional-sum check is the cheapest audit in SQL and the habit the screens reward most." },
    { slug: "ar-aging-schedule", why: "Bill-pay ages the 6 no-leg statements (15,217.00) against flat 30-day terms. Aging buckets over statement dates are exactly this problem's shape." },
    { slug: "credit-utilization-bands", why: "Limit underwriting reads utilization bands per card. Band-classifying each account's latest state is the limit-review screen, one CASE at a time." },
    { slug: "spend-histogram", why: "The policy desk buckets swipe sizes into bands to tune limits. A histogram fold over line amounts is the same query the ladder tuning meeting opens with." },
    { slug: "card-launch-success", why: "New card programs are judged by approval and activation rates. Rate-per-cohort with the denominator stated is this problem's exact shape." },
    { slug: "budget-pacing", why: "Spend policies pace budgets across the month and page on breaches. Pacing math over a calendar — planned versus actual — is how limit gates stay honest mid-cycle." },
    { slug: "null-blank-audit", why: "The statement feed is the ledger of record, so blanks are incidents. A one-pass null-and-blank audit over key columns is the data-quality screen Brex runs before any close." },
    { slug: "keep-latest-dedupe", why: "Restated statements arrive as duplicate rows with new timestamps. ROW_NUMBER keep-latest dedupe is how the bill-pay feed stays one-row-per-statement." },
    { slug: "amount-anomaly-zscore", why: "Outlier swipes flag themselves statistically. Z-scores against a baseline sigma are the fraud desk's first pass before a policy rule exists." },
    { slug: "ltv-cac-payback", why: "The rewards program is judged at account grain: rebate value versus acquisition cost. Payback math per startup account is exactly this shape." },
    { slug: "structuring-detection", why: "Policy evasion looks like many swipes just under the limit. A HAVING-guard over grouped swipes is the exact counter-move this problem drills." },
    { slug: "chargeback-rate-ranking", why: "Dispute rates rank merchants and programs. Rate HAVING with a ranking window is the partner-review screen, ties handled on purpose." },
    { slug: "balance-rollforward", why: "The statement book walks forward: opens, settles, adjusts, closes. A rollforward fold is how bill-pay proves the walk instead of asserting it." },
    { slug: "growth-accounting", why: "The venture-cohort read classifies each account's book move — new, expanded, contracted, churned. Movement classification over period folds is exactly this problem." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Streaky spenders are a limit signal: day-after-day swiping is either growth or a budget about to blow. Consecutive-day streak logic over transaction dates is the exact screen." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two swipes inside a week at one merchant is the duplicate-pair shape — the first control Brex ships on any card program. Window pairing with the gap stated." },
    { slug: "find-third-transaction", why: "The third swipe is where new accounts differentiate — activation vs dormancy. Nth-transaction logic with a per-account partition is the early-behavior screen." },
    { slug: "uber-first-transaction", why: "First-swipe analysis — when did each account actually start spending. Argmin over a partition with tie handling is the activation read the cohort deck opens with." },
    { slug: "consecutive-numbers", why: "Repeated same-amount swipes are a structuring tell and a data-feed bug at once. Adjacent-row equality over an ordered sequence is the cheapest duplicate detector in SQL." },
    { slug: "daily-balance-interest", why: "Rewards and float read as daily balance math — interest accrued over day-level balances. The end-of-day fold with a rate is exactly this problem's shape." },
    { slug: "delinquency-buckets", why: "Statement aging is bucket policy: current, 1-30, 31+. CASE ladders over days-late that reconcile to the statement book are the delinquency read bill-pay ships." },
    { slug: "prepayment-detection", why: "Prepaid statements are healthy cash — paid_on before due_on. A date-relationship sweep over the leg-to-claim join is the exact anti-aging view." },
    { slug: "deferred-revenue", why: "Annual plans collect cash before earning it. Recognition schedules over billing cycles are the deferred-revenue fold the finance side of the house lives in." },
    { slug: "mrr-waterfall", why: "The subscription-shaped read of the card book: monthly recurring vendor spend walked new, expanded, contracted, churned. Waterfall math over month folds." },
    { slug: "net-revenue-retention", why: "Cohort NRR — does a startup cohort spend more this quarter than last. Ratio-of-folds with the denominator stated is the retention metric underwriting quotes." },
    { slug: "cohort-repeat-revenue", why: "Repeat spend by cohort — which signup month keeps swiping. Cohort-by-period folds are the venture-cohort read this kit keeps teaching." },
    { slug: "repeat-purchase-rate", why: "The share of accounts that come back to the same merchant — merchant stickiness from the card side. Distinct-count shares with stated denominators, exactly this shape." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Accounts that signed but never swiped — the whitespace read. Anti-join over the cycle table is the unfunded-account sweep, and proving the zero is part of the job." },
    { slug: "maximize-items", why: "Buying the most under a hard cap is the limit ladder in miniature — knapsack-flavored maximization over a budget. The underwriting intuition drilled as a query." },
    { slug: "average-selling-price", why: "Average ticket per merchant must be quantity-weighted — SUM(value)/SUM(qty), a ratio of folds. The weighted-average trap is the exact denominator discipline this kit grades." },
  ],
};
