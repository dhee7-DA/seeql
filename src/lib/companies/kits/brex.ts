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
// menu (sql rows only, no w*/d*/f* rows) and say so in brief P4.
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
    "Preparation strategy: the pools file carries no Brex section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: underwriting band ladders, two-grain cohort censuses, statement-coverage anti-joins, EXCEPT reconciliation diffs and the cents-safe bill-pay spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the **limit-band census** underwriting reads every Monday, the other rebuilds the **settled-not-paid registry** bill-pay ships at every close. The bar to clear: *state the limit basis and the denominator before you compute anything* — then make every status census reconcile to **103 by construction**.",
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
      slugs: ["number-of-rich-customers", "sales-analysis-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain cohort censuses",
      why: "Cycles and startup accounts are different grains of the same join, and every census here reports both: EU runs 45 cycles from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-employees-who-met-the-target"],
    },
    {
      name: "Joining accounts to cycles",
      why: "Accounts carry region and created_at; cycles inherit them through joins, and the join type decides who survives. A cycle without an account is corruption; an account without cycles is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "top-travellers"],
    },
    {
      name: "Limit ladders & CASE bands",
      why: "Underwriting bands are CASE arms evaluated in order: budget under 50, mid to the 200 ceiling, premium beyond. The edges are the argument — a SKU priced exactly 199.99 lands in mid, and a reordered WHEN quietly re-bands the book. The premium arm never fires on this db, and the empty arm IS the ceiling story.",
      slugs: ["type-of-triangle", "calculate-special-bonus", "weather-type-in-each-country"],
    },
    {
      name: "Underwriting gates & HAVING floors",
      why: "Limit policy is group-level: which accounts carry at least ten cycles, which merchants clear a spend floor. The threshold lives in HAVING after the fold — putting it in WHERE errors, and putting a row-level filter there silently re-populates the gate.",
      slugs: ["managers-with-at-least-5-direct-reports", "classes-more-than-5-students", "actors-and-directors-who-cooperated-at-least-three-times"],
    },
    {
      name: "Statement-coverage anti-joins",
      why: "The no-leg watchlist — 6 statements worth 15,217.00 — is a LEFT JOIN plus an IS NULL on the rail key. Screens escalate it: NOT EXISTS twins, WHERE-placement traps that convert the anti-join back to an inner fold and delete exactly the exposure you were hunting.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "students-with-invalid-departments"],
    },
    {
      name: "Billing calendars & month keys",
      why: "The cycle spine buckets by SUBSTR(created_at, 1, 7) — 14 months, 2024-01 to 2025-02, 6–9 cycles each. Half-open windows and zero-padded month keys are the mechanics; '%m' alone merging Januaries across years is the trap that turns a trend into fiction.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Running folds & reward accruals",
      why: "Rewards economics read as running math: settled dollars accruing over the statement spine, cash-back pacing against a cycle window. SUM(...) OVER (ORDER BY ...) with a stated frame is the shape, and the frame decision — peers folded or row-by-row — is a correctness question, not style.",
      slugs: ["find-cumulative-salary-of-an-employee", "last-person-to-fit-in-the-bus", "account-balance"],
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
  ],
};
