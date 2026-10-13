// Zendesk — kit 13 of the SaaS & Enterprise domain (Batch L, wave 7).
// Support-SaaS SQL: the storefront db read as a support-desk ledger —
// customers are support accounts, orders are ticket periods (delivered =
// resolved, shipped = first response sent, awaiting resolution, pending =
// unresponded — the SLA clock running, cancelled = closed as spam/invalid),
// shipped_at = the first-response stamp, order_items = ticket event lines,
// products = support plan SKUs (price = plan list), suppliers = integration
// partners, regions = account cohorts. Invoices/payments are support
// contract billings in INTEGER cents (/100.0). Angle: first-response SLAs,
// ticket backlogs, agent-workload censuses, plan upgrades.
// Pool provenance: Zendesk carries 0 tagged LC rows in company-pools.md —
// all 46 sql slugs in this kit (30 topic + 16 problem) are theme-curated
// from the theme menu and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12), re-probed per slot against
// db/custom.db; every case slot is mechanically verified by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const zendeskKit: CompanyKit = {
  id: "zendesk",
  domainId: "saas",
  name: "Zendesk",
  tagline: "Support SaaS: tickets, SLAs, agent workloads",
  accent: "text-emerald-300",

  brief: [
    "**Zendesk** is support SaaS in its purest form: a ticket pipeline sold to accounts that either get answered fast or escalate loudly. The analytics reality is the *support ledger* — which tickets carry a first response, which are silently aging past SLA, and which accounts are quietly piling backlog. On this storefront db the mapping is honest: 16 support accounts generate 103 ticket periods folded from 251 ticket-event lines, worth 34,833.28 of billed contract value at a 338.19 average. The pipeline mix reads like the SLA funnel it is — 52 {emerald:resolved} (50.5%), 30 responded-awaiting-resolution (29.1%), 14 {amber:unresponded — SLA clock running} (13.6%), 7 {rose:closed invalid} (6.8%).",
    "The data org splits three ways. The SLA desk owns response latency: 82 of 103 periods carry a first-response stamp, averaging **2.98 days** from open to first response with a 2-to-4 range — the US cohort the slowest at 3.07, APAC the fastest at 2.93. Workload analytics owns the account census: the two-grain read (EU carries 45 ticket periods from just 8 accounts; the US, 19 from 2) and the concentration read — **63.5%** of billed value sits above the 3,000 line, the expansion cohort every renewals deck prices. Billing owns the contract book: 28 `invoices` against 27 `payments`, INTEGER cents throughout, with 6 never-settled bills worth 15,217 — one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it.",
    "Interview style is census-then-denominator, then the latency join. A screen opens with a two-grain census (EU: 45 periods from 8 accounts — intensity 5.6; US: 19 from 2), escalates into a conditional-count first-response rate with the denominator asked out loud ('do {amber:unresponded} tickets sit in your base?'), then the backlog read — where `COUNT(shipped_at)` against `COUNT(*)` IS the unanswered queue. Follow-ups probe the month spine (2024-01 opens at 8 periods and **3,731.97** of billed value; 2024-07 floors at 1,193.86) and the cents rule on every contract bill.",
    "Preparation strategy: the pools carry **0 tagged rows for Zendesk** — every one of this kit's 46 slugs is theme-curated to known support-desk screens: two-grain ticket censuses, first-response ratios, latency math on JULIANDAY, backlog anti-joins and contract-billing reconciliation. Then run both case studies on the live db: one rebuilds the first-response latency spine the SLA desk reviews monthly, the other rebuilds the regional support-health matrix the QBR is drawn from. The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
  ],

  dayInLife: [
    "**08:20 —** The morning starts on the SLA board. A support analyst opens the response dashboard before the desk standup: did last night's responded cohort clear its band, does the {emerald:resolved} count (52 of 103) reconcile with what contract billing invoiced, and did the unresponded queue drift — **14 tickets** with no first-response stamp is the line on the slide? The first query is almost always a reconciliation — pipeline counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:15 —** Midday is latency surgery. The SLA review wants the response spine refreshed — months folded with `COUNT(shipped_at)` beside `COUNT(*)`, average JULIANDAY latency rounded to 2 decimals, gated to the busy months so the trend isn't driven by two-ticket weeks. A regional lead wants the two-grain census re-cut (EU: 45 periods from 8 accounts — intensity 5.6); a capacity planner wants event lines and billed value side by side, because 'the account is chatty' means nothing until lines price into contract value. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:30 —** The afternoon tilts toward the contract book and the writeup that keeps tomorrow's numbers defensible. Billing close walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected worth 15,217 — and asks the only question that matters at close: *do the classes sum back to the invoice base?* The anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the {rose:void} bill with one (#11, 925.00) — and the ledger tie prints 181,080 = 181,080. The rhythm to internalize: Zendesk SQL exists to prove that pipeline, SLA and billing agree — *the first-response stamp and the contract invoice are the same story told at two grains.*",
  ],

  metrics: [
    { name: "First-response coverage", what: "Stamped ÷ ALL ticket periods: 82 of 103 (79.6%). The denominator is the interview — 82 of 89 engaged periods is a different metric with a different name." },
    { name: "First-response latency", what: "Days from ticket open to first-response stamp: avg 2.98, range 2-to-4. US cohort slowest at 3.07, EU 2.94, APAC 2.93, LATAM 3.5 on a 2-ticket base." },
    { name: "Ticket-pipeline mix", what: "52 resolved / 30 responded-awaiting-resolution / 14 unresponded / 7 closed-invalid. The funnel state map every conditional count hangs on." },
    { name: "Two-grain account census", what: "Periods AND accounts per cohort — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Load versus audience in one query." },
    { name: "Support-value concentration", what: "Share of billed value from the heaviest accounts: 63.5% above the 3,000 line, 71.2% above 2,000. Where renewal revenue actually lives." },
    { name: "Escalation calendar", what: "Monthly spine over ticket periods: 2024-01 opens at 8 periods and 3,731.97 of billed value; 2024-07 floors at 1,193.86. The seasonality read every staffing plan borrows." },
    { name: "Unsettled contract AR", what: "Bills with no payment rows: 6 worth 15,217 — one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the dunning cycle runs on." },
    { name: "Contract settlement speed", what: "Days from issue to first payment on settled bills: 20 settle in 28.4 days on average, fastest 13, slowest 84 — against uniform 30-day terms." },
  ],

  topics: [
    {
      name: "Ticket-census grains",
      why: "Every Zendesk screen opens with a fold: event lines, ticket periods, accounts — grouped and counted without letting the grain blur. COUNT(*) counts lines, COUNT(DISTINCT customer_id) counts accounts; 251 event lines come from just 103 periods across 16 accounts, and the census is where candidates prove which grain they're standing on.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "number-of-rich-customers"],
    },
    {
      name: "First-response ratios",
      why: "Resolved, responded, unresponded, closed-invalid — every rate here is a conditional count over a pipeline state, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL periods, with the 100.0 before the division, is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "ads-performance"],
    },
    {
      name: "Joining accounts to ticket periods",
      why: "Ticket periods inherit account attributes through joins to the accounts table, and the join type decides who survives: a period with no account is corruption; an account with no period is an inactive seat. Choosing INNER versus LEFT is a business statement about the installed base.",
      slugs: ["employee-bonus", "students-and-examinations", "confirmation-rate"],
    },
    {
      name: "SLA latency & date math",
      why: "Response latency is JULIANDAY arithmetic — stamped open-to-response deltas averaged over the 82 stamped periods, 2.98 days platform-wide. The desk drills the idiom because every SLA report hangs on it, and a reversed operand prints negative latency with no error at all.",
      slugs: ["users-that-actively-request-confirmation-messages", "rising-temperature", "find-golden-hour-customers"],
    },
    {
      name: "The ticket calendar",
      why: "Ticket volume is calendar arithmetic: STRFTIME('%Y-%m') buckets over periods against the 3,731.97 peak and the 1,193.86 floor. Zendesk drills the month-bucket idiom because every staffing chart hangs on that spine — and a '%m'-without-year fold merges two Januaries into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "tasks-count-in-the-weekend"],
    },
    {
      name: "Agent-workload two-grain reads",
      why: "Support capacity is a two-sided read: periods per account (depth) against accounts per cohort (spread). The two-grain shapes here — event lines per account, accounts per region, depth-versus-breadth ratios — are how staffing gets measured without double-counting.",
      slugs: ["find-the-team-size", "linkedin-power-creators", "calculate-compressed-mean"],
    },
    {
      name: "Backlog & silence anti-joins",
      why: "Silence reads are anti-joins: accounts with no recent period, contract bills with no payments (6 on this db). On this db the never-used-account anti-join returns 0 — and proving a confident zero is the job. The survival rule of the join IS the query.",
      slugs: ["customer-who-visited-but-did-not-transact", "find-the-quiet-students-in-all-exams", "unpopular-books"],
    },
    {
      name: "Workload leaderboards & tie policy",
      why: "Desk boards rank months and accounts by load, and ties are real: four months sit at exactly 8 periods. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "find-active-users", "group-employees-of-the-same-salary"],
    },
    {
      name: "Plan upgrades & LAG transitions",
      why: "Upsell is a state-history read: accounts moving starter to enterprise across period history, response patterns spacing out before renewal risk. Both are LAG/LEAD work — ordered, partitioned, NULL-aware — and the 2.98-day latency average is itself a between-stamps read.",
      slugs: ["plan-migration-paths", "second-day-confirmation", "consecutive-numbers"],
    },
    {
      name: "Contract billing & cents discipline",
      why: "Support is not revenue until the contract book closes: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where support-SaaS interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "count-salary-categories"],
    },
  ],

  theory: [
    {
      id: "zendesk-t1",
      q: "Your backlog report joins support accounts to their ticket periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An SLA activity report joins periods to accounts: a period with no account is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A backlog report must be LEFT from accounts: the accounts whose recent windows hold no first-response stamps ARE the finding — an account aging past SLA is the churn signal — arriving with NULL stamp columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT JOIN quietly became an INNER and the backlog vanished. The fix is moving the predicate into ON or an outer query. On this db the never-used anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "zendesk-t2",
      q: "The desk census shows 251 ticket-event lines, 103 ticket periods and 16 support accounts. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts ticket-event lines — 251; COUNT(DISTINCT o.id) folds them back to ticket periods — 103; COUNT(DISTINCT customer_id) folds further to accounts — 16. None is wrong: events measure desk touch volume, periods measure the ticket calendar, accounts measure the installed base. The ratios are the reads — 2.4 events per period, 6.4 periods per account — and they decide whether growth is broadening (more accounts) or deepening (more tickets per account), which is THE support-CapEff question. The trap that catches candidates is quoting an event count as a ticket count in the SLA trend; one period with three event lines is one ticket row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "zendesk-t3",
      q: "The SLA review wants months with at least eight ticket periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The pipeline-state rule is a row-level fact — status = 'delivered' discards unresponded and closed-invalid periods before any fold, in WHERE; putting it in HAVING is impossible because states no longer exist once rows are grouped. The eight-period floor is a group-level fact — HAVING COUNT(*) >= 8 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a review-qualified spine and an error, and between a threshold applied to event lines versus to periods. On this db only six months — the four at 8 periods plus the two at 9 — clear the eight-period bar. The strong answer places every filter by asking: is this a fact about one event line, or about a month's whole fold?",
      tag: "pipeline",
    },
    {
      id: "zendesk-t4",
      q: "You rank months by ticket volume on the 14-month spine and four of them tie at exactly 8 periods. RANK, DENSE_RANK or ROW_NUMBER for the staffing board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied months the same rank and skips — the quartet at 8 periods (2024-01, -03, -05, -07) shares rank 3 behind the two 9-ticket months, and the next distinct volume lands at rank 7, implying phantom months that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 3, 3, 3, 3 and the next distinct volume is 4. ROW_NUMBER splits ties arbitrarily, which silently decides which tied month gets flagged for a staffing review first. On this db the tie is structural — 9, 9, 8, 8, 8, 8 down the spine. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer months, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "zendesk-t5",
      q: "A ticket period has no first-response stamp yet. What is your NULL policy for the response-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only responded periods have a latency, so the report measures the responded population and says so — on this db 82 of 103 periods carry a stamp (52 resolved plus 30 responded-awaiting-resolution), averaging 2.98 days from open to first response, range 2 to 4; 14 are unresponded, 7 closed-invalid. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the responded subset; the gap between it and COUNT(*) IS the unresponded backlog, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant response for tickets still sitting in the queue, and an SLA report built that way is a lie with decimals.",
      tag: "nulls",
    },
    {
      id: "zendesk-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce the 338.19 average. On filtered staging tables — one cohort, one plan SKU, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each period to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "zendesk-t7",
      q: "The ticket trend buckets periods by month on TEXT timestamps, and SLA latency is a between-stamps delta. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; SUBSTR to month-only would merge January 2024 with January 2025 and the staffing curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's tickets, and month-end is exactly when escalations land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a volume walk. And latency is JULIANDAY(shipped_at) - JULIANDAY(created_at) — reversed operands print negative days with no error, which is why every SLA query gets an assertion row.",
      tag: "dates",
    },
    {
      id: "zendesk-t8",
      q: "The billing desk says a paid contract invoice has no settlement rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1756 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the ticket pipeline and the contract book — the trial balance ties 181,080 to 181,080 — and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "zendesk-mcq-1",
      prompt: "A ticket period's status column reads 'pending'. In this kit's support funnel, what is it?",
      choices: ["Resolved and closed", "First response sent — awaiting resolution", "Unresponded — the SLA clock is running", "Closed as spam / invalid"],
      answer: 2,
      why: "The pipeline map is fixed: delivered = resolved (52 of 103 periods), shipped = first response sent, in-resolution (30), pending = unresponded with the SLA clock running (14), cancelled = closed invalid (7). 'Pending' is the queue state — the ticket exists but no agent has touched it.",
      notes: [
        { choice: 1, why: "Responded-in-resolution is 'shipped' — 30 periods that DO carry a first-response stamp. Counting the queue as responded zeroes every latency number's denominator." },
        { choice: 3, why: "Closed-invalid is 'cancelled' — 7 periods. Unresponded tickets are still owed a response; closed-invalid ones left the pipeline. Confusing them flips the backlog read." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-2",
      prompt: "First-response coverage is defined as stamped ÷ which population? The db holds 82 stamped and 7 closed-invalid of 103 ticket periods.",
      choices: ["Stamped + closed-invalid only (82/89 = 92.1%)", "All ticket periods (82/103 = 79.6%)", "Resolved periods only", "Distinct accounts (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods, unresponded and closed-invalid included in the denominator. 79.6% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-funnel coverage rate — a legitimate separate metric, but calling it 'the coverage rate' inflates 79.6% to 92.1% by quietly deleting 14 unresponded and 7 closed periods. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "82/16 is stamped periods per account — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-3",
      prompt: "EU carries 45 ticket periods from 8 support accounts. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between the columns — 5.6 periods per account — is the intensity read that separates load from audience.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has an account. Without DISTINCT both columns read 45 and the census loses the spread story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts cohorts, not accounts — a third grain nobody asked for. The census is periods AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued periods", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every cohort's resolution share truncates toward 0 and the whole pipeline map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-5",
      prompt: "Keep only months with at least 8 ticket periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 8, before GROUP BY", "GROUP BY month HAVING COUNT(*) >= 8", "WHERE periods >= 8 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only six months clear such a bar — the four at 8 periods (2024-01, -03, -05, -07) plus the two at 9 (2024-02, -09).",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'periods' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-6",
      prompt: "A contract invoice row reads amount_cents = 175600. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 1,756.00 — the exact value on the infamous #28 bill. The .0 is the entire fix; integer ÷ integer truncates, and every odd-cent contract bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "175600 / 100 is integer division = 1756 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 17,560,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-7",
      prompt: "A teammate reports 'average first-response latency: 2.98 days' computed as AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over ALL 103 ticket periods. What is the honest critique?",
      choices: ["It is wrong — AVG should treat unresponded tickets as 0 days", "The value is right but the label lies — AVG skips NULL stamps, so it is the average over the 82 responded periods only", "It errors — AVG cannot handle NULL stamps", "It is the average over 103 periods — unresponded tickets pull it down"],
      answer: 1,
      why: "AVG ignores NULLs: the 21 unstamped periods (14 unresponded + 7 closed-invalid) contribute nothing, so 2.98 is the responded-population average — 82 of 103. The number is fine; naming it 'over all tickets' is the lie the SLA desk audits for.",
      notes: [
        { choice: 0, why: "IFNULL-ing latency to zero publishes instant response for tickets nobody touched — an SLA report built that way is a lie with decimals." },
        { choice: 3, why: "NULLs don't pull averages down — they drop out entirely. Believing they participate is exactly how a shrunken denominator gets quoted as a full-population number." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-8",
      prompt: "A teammate builds the monthly ticket trend with SUBSTR(created_at, 6, 2) AS month. The db spans 2024-01 to 2025-02. What does the chart show?",
      choices: ["A correct 14-bucket trend", "12 buckets — every January merged into one, every February merged into one", "14 buckets but sorted wrong", "An error — SUBSTR cannot parse timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) grabs the two-digit month with no year: January 2024 (8 periods, 3,731.97) and January 2025 (6 periods, 1,669.50) collapse into one bucket. The spine must be '%Y-%m' — year plus zero-padded month — or the seasonality curve is fiction.",
      notes: [
        { choice: 0, why: "The db spans two calendar years — month-only bucketing silently merges same-month pairs. 14 real months compress to 12 fictional ones." },
        { choice: 3, why: "SUBSTR parses fine — that's the trap. The bug is semantic (lost year), not mechanical, so nothing errors and the chart just quietly lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-9",
      prompt: "SELECT COUNT(*) FROM invoices LEFT JOIN payments ON payments.invoice_id = invoices.id — this db has 28 invoices, 27 payment legs, and 6 invoices with no payment rows. What does the COUNT print?",
      choices: ["28", "27", "33", "22"],
      answer: 2,
      why: "27 settlement legs land on 22 invoices (the 21 exact-covered plus the 4000-of-6148 partial) because five bills (#1, #5, #12, #19, #22) pay in two legs. The LEFT JOIN keeps every invoice row and fans out the split ones: 27 matched legs + 6 unmatched invoices = 33 rows. COUNT(*) on a fanned join is a leg count, not an invoice count.",
      notes: [
        { choice: 0, why: "28 would require one row per invoice — that's COUNT(DISTINCT invoices.id) after the join, or no join at all. The fan-out is the whole lesson." },
        { choice: 1, why: "27 is the payment-row count — true on the payments table alone, wrong under the LEFT JOIN, which must also keep the 6 unmatched invoice rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-10",
      prompt: "A month-over-month ticket walk uses LAG(revenue) OVER (ORDER BY month) on the 14-month spine. What is honest to do with the first row's NULL delta?",
      choices: ["Coalesce it to 0 — the first month has no growth", "Coalesce it to the first month's revenue — that's the baseline", "Report it as NULL or label it 'baseline' — there is no prior month to differ from", "Drop the first row entirely so no NULL appears"],
      answer: 2,
      why: "The first row's prior value does not exist: LAG returns NULL and the delta is NULL by definition, not by failure. Coalescing to zero fabricates a flat month into a growth walk; dropping the row hides the spine's opening (2024-01: 8 periods, 3,731.97).",
      notes: [
        { choice: 0, why: "Zero means 'no change from last month' — a factual claim about a month that has no last month. Baseline is a label, not a zero." },
        { choice: 1, why: "Setting the delta equal to the month's own revenue invents a +100% growth month. The edge row is where volume walks most often lie." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-zendesk-1",
      tier: "medium",
      topic: "t4",
      universe: "funnel",
      title: "The first-response latency spine",
      brief:
        "Zendesk-flavored brief on the storefront db: the SLA desk's monthly review opens with the response-latency spine — per month, tickets opened, first responses sent (stamp count) and average days from open to first response. Probed facts: 82 of 103 ticket periods carry a first-response stamp; platform latency averages 2.98 days with a 2-to-4 range; the month spine runs 2024-01 to 2025-02, and the heaviest months are 2024-02 and 2024-09 at 9 tickets each. The desk reviews only months carrying at least 8 tickets, so two-ticket weeks never set policy.",
      ask: "Return each qualifying month with its ticket count, first responses sent and average response days — calendar order.",
      template:
        "SELECT {2} AS month,\n       COUNT(*) AS tickets,\n       COUNT(shipped_at) AS responded,\n       ROUND(AVG({3}), 2) AS avg_first_response_days\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {1}\nORDER BY month;",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the SLA-review floor",
          why: "The eight-ticket floor keeps exactly the six review months — the four at 8 periods (2024-01, -03, -05, -07) plus the two at 9 (2024-02, -09) — and 8 appears as the kept months' own ticket cells. A 9 floor keeps only the two 9-ticket months; a 6 floor admits all 14 and the review loses its busy-months framing.",
        },
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month key",
          why: "The '%Y-%m' shape keeps January 2024 and January 2025 as separate buckets — 14 honest months. SUBSTR(created_at, 6, 2) merges the two Januaries into one row and the SLA trend reads as fiction with no error raised.",
        },
        {
          answer: "JULIANDAY(shipped_at) - JULIANDAY(created_at)",
          kind: "keyword",
          label: "the latency expression",
          why: "Response latency is days from ticket open to first-response stamp, averaged over the stamped periods. Reversing the operands prints negative days with no error; bare string subtraction coerces timestamps to year prefixes and averages near-zero noise.",
        },
      ],
      distractors: ["9", "6", "SUBSTR(created_at, 6, 2)", "created_at", "JULIANDAY(created_at) - JULIANDAY(shipped_at)", "shipped_at - created_at"],
      walkthrough:
        "A spine where the responded column carries the backlog story. Months fold with the '%Y-%m' key and the HAVING floor at 8 keeps six rows: 2024-01 (8 tickets, 5 responded, 3.0 days), 2024-02 (9, 8, 3.25), 2024-03 (8, 5, 2.8), 2024-05 (8, 8, 3.0), 2024-07 (8, 5, 2.4), 2024-09 (9, 9, 2.89). Read the responded column against tickets: 2024-09 is the only full-coverage month (9 of 9), while 2024-07 sits on 3 unanswered of 8 — the gap column IS the unresponded queue, and the latency average is computed over responded tickets only (the 82-of-103 population, 2.98 platform-wide). The distractors each break differently: a 9 floor amputates the review to two months; a 6 floor admits all 14 and dilutes it; the month-only key merges the Januaries (8+6 tickets) into one bucket; a bare created_at key shatters months into raw timestamps; reversed JULIANDAY operands print negative latency; string subtraction silently averages zeros. The lesson under the lesson: on SLA spines, the stamp count is a population statement — say which tickets the average covers, or the number is a claim.",
    },
    {
      id: "cs-zendesk-2",
      tier: "hard",
      topic: "s7",
      universe: "growth",
      title: "The support health matrix",
      brief:
        "Zendesk-flavored brief on the storefront db: the quarterly business review wants a regional support-health matrix — per region, ticket periods, resolved count, awaiting-first-response count and average billed value per period. Probed facts: EU carries 45 periods (24 resolved, 6 awaiting) from 8 accounts; APAC 37 (21, 5) from 5; the US just 19 (5, 3) from 2 — on the platform's richest periods at a 383.48 average; LATAM 2 (2, 0). The review gates at 19+ periods so LATAM's two-ticket base never sets policy, and platform-wide the pipeline sits at 52 resolved against 14 unresponded.",
      ask: "Return each qualifying region with ticket periods, resolved count, awaiting-first-response count and average period value — busiest region first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS ticket_periods,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS resolved,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS awaiting_first_response,\n       ROUND(AVG(o.total), 2) AS avg_period_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {1}\nORDER BY ticket_periods {4};",
      slots: [
        {
          answer: "19",
          kind: "number",
          label: "the QBR gate",
          why: "The 19-period gate keeps EU (45), APAC (37) and the US (19) — and 19 appears as the US row's own ticket_periods cell, so the gate value shows up in the result. A 2 gate admits LATAM's two-ticket base; a 20 gate drops the US — the very region the review exists to discuss.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the resolved-state marker",
          why: "Resolved is the delivered status — 52 of 103 periods platform-wide, 24 in the EU alone. 'shipped' counts responded-awaiting-resolution as resolved and inflates every region; 'cancelled' zeroes the column and the matrix loses its quality read.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting-first-response marker",
          why: "Awaiting first response is the pending state — 14 periods platform-wide, the SLA-clock queue. 'delivered' mirrors the two arms and reads resolved tickets as unresponded; 'shipped' counts in-resolution tickets as backlog and doubles the apparent queue.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The QBR opens on the heaviest region — EU at 45 periods. ASC would open on the US row's 19 and frame the review around the smallest qualifying book before anyone sees the platform's shape.",
        },
      ],
      distractors: ["2", "20", "37", "'shipped'", "'cancelled'", "ASC"],
      walkthrough:
        "A pivot where every arm names its own pipeline state. Ticket periods join to accounts, fold per region, and two conditional sums branch on status: resolved (delivered) and awaiting first response (pending). The HAVING gate at 19 keeps three rows — EU 45 periods / 24 resolved / 6 awaiting / 335.32 average, APAC 37 / 21 / 5 / 313.66, US 19 / 5 / 3 / 383.48 — and gates out LATAM (2 periods, both resolved, no queue). The headline the review came for: the US resolves 5 of 19 (26.3%) on the richest periods on the platform — a two-account cohort carrying 383.48 average value with a first-response queue attached. The distractors each break differently: a 2 gate admits LATAM and hands policy to a two-ticket base; 20 and 37 drop the US; 'shipped' refiles 30 in-resolution periods as resolved; 'cancelled' zeroes the arm; ASC inverts the read. The lesson under the lesson: CASE pivots branch per row, so each arm must name its own state — swap two literals and the matrix still runs, printing confident nonsense in every cell.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "A conditional-count delivery rate over a CTE — the first-response-rate question in textbook clothing: 82 of 103 periods stamped, with the denominator named out loud." },
    { slug: "find-churn-risk-customers", why: "Anti-join plus date math — accounts whose last interaction ages past the window: the renewal-risk list the customer-success pod works on Mondays." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-state adoption logic — accounts with tickets AND responses but no resolved period: the stuck-in-queue list the escalation review exists for." },
    { slug: "keep-latest-dedupe", why: "Keep-latest ROW_NUMBER dedupe — one current pipeline state per ticket from a messy event history, the dedupe the desk board runs nightly." },
    { slug: "mrr-waterfall", why: "LAG movement waterfall — new, expanded, contracted, churned contract value month over month: the growth walk the finance pod rebuilds every close." },
    { slug: "net-revenue-retention", why: "Cohort revenue retention — billed value this period versus last per account cohort: the NRR read support boards price expansion on." },
    { slug: "trial-to-paid-funnel", why: "Trial-to-paid conversion — support-plan upgrades counted conditionally with the denominator named: the upsell metric the renewals deck opens with." },
    { slug: "analyze-subscription-conversion", why: "LEFT JOIN + IS NULL conversion grammar — accounts whose join finds no upgraded plan are the upgrade backlog, the exact shape of the anti-join." },
    { slug: "active-businesses", why: "Per-group averages against the global mean — accounts whose ticket intensity beats the 338.19 average: the workload flag staffing is planned against." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — response-day actives against weekly actives per account: the engagement-depth read that separates live desks from parked seats." },
    { slug: "week-over-week-churn", why: "Week-over-week churn walk — closed-invalid periods tracked as a movement rate: the early-warning line the quality pod watches." },
    { slug: "null-blank-audit", why: "Null & blank audit — account records missing region or plan attributes: the data-quality sweep before any cohort census is believed." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV — event lines per ticket period against the 338.19 average: the attach-depth read behind every workload board." },
    { slug: "repeat-purchase-rate", why: "Repeat purchase rate — accounts renewing ticket periods period over period: the renewal share the contract book is actually graded on." },
    { slug: "usage-tier-percentiles", why: "PERCENT_RANK workload tiers — accounts sliced into load bands by billed value: the tiering the staffing plan is drawn from." },
    { slug: "gl-reconciliation", why: "General-ledger reconciliation — the support ledger folding to 181,080 = 181,080: the delta-zero assertion every close ships with." },
  ],
};
