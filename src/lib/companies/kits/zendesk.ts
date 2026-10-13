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
// all 77 sql slugs in this kit (45 topic + 32 problem) are theme-curated
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
    "Health is read in the tails, not the means. A 2.98-day average first response tells the desk almost nothing about the 14 tickets nobody has touched — so the deeper reviews track {rose:reopen rate} (resolved tickets that come back within a named window, divided by the 52 resolved — the premature-close tax), backlog aging (the unresponded queue bucketed 2, 3, 4-plus days against that 2.98 average), and the {violet:CSAT low-tail} — the share of surveys scoring 2 or worse, because *a 4.x mean hides the exact customers who churn*. The billing ledger carries the same shape: 21 exact settlements, 1 partial at 4,000 of 6,148, 6 never-collected — **a distribution, not a number**, which is precisely how the desk reads satisfaction.",
    "The deeper screens go past the census. Expect window frames (a rolling billed-value spine across the 14 months), set-op stacks (the {rose:escalation list} folding 14 unresponded with 7 closed-invalid — and whether `UNION` is the honest fold there), the silent zero of a `NOT IN` that meets a NULL, and one-pass censuses with `FILTER (WHERE …)`. The four new case files drill exactly those moves: the event-mix census per plan category, the 3,000-line concentration fold — 4 heavy accounts holding **63.5%** of billed value — the second-half movement walk, and the one-pass settlement census (28 bills, 6 unbacked, 1 partial). *Same bar as always: name the denominator before the number.*",
  ],

  dayInLife: [
    "**08:20 —** The morning starts on the SLA board. A support analyst opens the response dashboard before the desk standup: did last night's responded cohort clear its band, does the {emerald:resolved} count (52 of 103) reconcile with what contract billing invoiced, and did the unresponded queue drift — **14 tickets** with no first-response stamp is the line on the slide? The first query is almost always a reconciliation — pipeline counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:15 —** Midday is latency surgery. The SLA review wants the response spine refreshed — months folded with `COUNT(shipped_at)` beside `COUNT(*)`, average JULIANDAY latency rounded to 2 decimals, gated to the busy months so the trend isn't driven by two-ticket weeks. A regional lead wants the two-grain census re-cut (EU: 45 periods from 8 accounts — intensity 5.6); a capacity planner wants event lines and billed value side by side, because 'the account is chatty' means nothing until lines price into contract value. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:30 —** The afternoon tilts toward the contract book and the writeup that keeps tomorrow's numbers defensible. Billing close walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected worth 15,217 — and asks the only question that matters at close: *do the classes sum back to the invoice base?* The anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the {rose:void} bill with one (#11, 925.00) — and the ledger tie prints 181,080 = 181,080. The rhythm to internalize: Zendesk SQL exists to prove that pipeline, SLA and billing agree — *the first-response stamp and the contract invoice are the same story told at two grains.*",
    "**17:45 —** The EOD writeup closes the loop before the numbers go stale. The analyst files the day's three reads — pipeline counts against billing, the regional census, the movement walk — into the review doc, then runs the quiet watches: is the {rose:reopen watchlist} empty (no account showing a pending period after a delivered one), and did the low-tail sweep flag anything — *one mixed settlement at 4,000 of 6,148 sits in the gray band* the mean would swallow? The last pass is data quality: every {amber:unresponded} count re-derived from `shipped_at IS NULL`, never from the status column alone, because **status is a claim and the stamp is a fact**. Tomorrow's standup inherits a doc where every denominator is named — that is the whole discipline.",
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
    { name: "Reopen rate", what: "Resolved tickets that come back within the window, divided by the 52 resolved — the premature-close tax. This db's row-level mirror: bill #28 claims paid with zero settlement rows behind it; claims are checked against events, not taken at face value." },
    { name: "Backlog aging", what: "Age of the 14 unresponded tickets measured from open against the 2.98-day average response — bucketed 2, 3, 4-plus days. The oldest bucket, not the average, is what the SLA review actually escalates." },
    { name: "CSAT low-tail", what: "Share of surveys scoring 2 or worse — the tail a 4.x mean hides. The billing ledger carries the same shape: 21 exact, 1 partial at 4,000 of 6,148, 6 never — a distribution the desk reads, not a single number." },
    { name: "Agent-day span", what: "First touch to last touch per account-day, folded from the 251 event lines behind the 103 periods — the coverage window the staffing plan maps shifts against. Gaps in the span are the quiet hours desks quietly pay for." },
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
    {
      name: "Backlog-aging buckets",
      why: "Aging is banding: every open ticket belongs in a 0-2, 3-4, 5-plus day bucket the moment it is counted, and the SLA review escalates buckets, not averages. The CASE-banded fold here — bucket boundaries off date deltas, counts per band — is the shape of every aging schedule the desk ships, and a boundary written >= where <= belongs is a silent reclassification of the queue.",
      slugs: ["delinquency-buckets", "calculate-orders-within-each-interval", "settlement-fails-aging"],
    },
    {
      name: "State-drift roll rates",
      why: "Reopen analysis is a state-history read: what did the account's next period look like after this one, and did a resolved state drift back toward pending. LAG/LEAD transitions over ordered history — roll rates from state to state — are how the desk separates genuine resolution from premature closure, and they double as the churn early-warning read.",
      slugs: ["growth-accounting", "delinquency-roll-rates", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Agent-scorecard pivots",
      why: "Desk scorecards are pivots: pipeline states turned into side-by-side columns per account or month, so a stakeholder reads one row instead of four filters. The row-to-column shapes here — reformat folds, day-of-week bands, seasonal CASE splits — are the reporting grammar every QBR slide is built from.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "seasonal-sales-analysis"],
    },
    {
      name: "CSAT tails & histograms",
      why: "Satisfaction is a distribution, and the low tail is the whole story: histograms and bar-chart folds per score band beat any average the survey tool prints. The bucket-count shapes here — rating histograms, spend bands, session bar charts — are how the desk builds its low-tail read without a stats package.",
      slugs: ["ratings-histogram", "spend-histogram", "create-a-session-bar-chart"],
    },
    {
      name: "Concurrency & shift overlap",
      why: "Coverage questions are overlap questions: which agent-hours collide with ticket arrivals, how many events run concurrent, where the shift map leaves the queue uncovered. Interval-overlap SQL — shifted starts, task spans, sessionization — is the analyst's staffing calculus, and it is where date math stops being cosmetic.",
      slugs: ["find-overlapping-shifts", "employee-task-duration-and-concurrent-tasks", "sessionize-events"],
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
    {
      id: "zendesk-t9",
      q: "The SLA filter `WHERE unresponded = 1` against a SELECT alias — why does it break, and what are the two honest ways to count 'no response yet'?",
      a: "Because the logical pipeline runs WHERE before SELECT: the alias does not exist yet when rows are filtered, so the reference is a rejection (SQLite's leniency in HAVING and ORDER BY is an exception that trains a bad habit). The two honest counts are row-level and group-level. Row-level: `shipped_at IS NULL` in WHERE — the 14 unresponded periods live, before any fold. Group-level: `HAVING COUNT(shipped_at) = 0` after folding — an account or month whose whole fold carries no stamp. They answer different questions — a ticket nobody touched versus a cohort that went silent — and conflating them is how backlog reports end up counting the wrong thing. The desk's rule: alias for humans, expression for filters — repeat the expression in WHERE, and say which of the two silences you measured.",
      tag: "pipeline",
    },
    {
      id: "zendesk-t10",
      q: "Build the running billed-value spine over the 14 months. What frame does SUM(...) OVER (ORDER BY month) actually use, and when do you override it?",
      a: "With an ORDER BY and no frame clause, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — cumulative through the current row, but RANGE includes peers: any row tying the current ORDER BY value joins the sum. On a month spine the ORDER BY is the month key itself, so the running value is well-defined — but the moment the ORDER BY becomes a measure (rank months by volume, run a cumulative sum over that), the tied quartet at 8 periods folds into one shared rung and the cumulative read breaks silently. The override is explicit: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-wise running total, or ROWS BETWEEN 2 PRECEDING AND CURRENT ROW for the trailing three-month smoothing the close pack wants. On this db the spine runs 2024-01 (3,731.97) to 2025-02 (2,390.53); say the frame out loud or the reviewer will.",
      tag: "windows",
    },
    {
      id: "zendesk-t11",
      q: "The escalation review wants unresponded and closed-invalid tickets as one list. UNION or UNION ALL — and what does the wrong choice do to the 14-plus-7 read?",
      a: "UNION ALL. The two arms are disjoint pipeline states — 14 unresponded, 7 closed-invalid — so the honest fold is 21 rows, and UNION ALL keeps every one of them cheaply. UNION dedupes across the whole stack: any two rows identical on all selected columns (same account, region, state-day shape) collapse into one, and the escalation list silently understates — 20 rows where 21 exist, with no error to catch it. Dedupe is a claim that needs a reason; disjoint states are not one. The other stack rules are contract terms: both arms must select the same column count with compatible types, and the ORDER BY that sorts the review belongs once, at the very end — sort each arm and the merge order is whatever the engine feels like. Say '21, because the states are disjoint' and the panel stops worrying.",
      tag: "setops",
    },
    {
      id: "zendesk-t12",
      q: "Which accounts have an unresponded ticket but never a resolved one — and why is EXCEPT the wrong tool the moment you need row detail?",
      a: "EXCEPT answers set membership cleanly: SELECT customer_id FROM orders WHERE status = 'pending' EXCEPT SELECT customer_id FROM orders WHERE status = 'delivered' — the left set minus the right, duplicates collapsed, one account per row, no order promised. It is the right shape for a count or a roster. It is the wrong tool the moment the deliverable is detail: EXCEPT compares whole rows on both sides, so selecting extra columns changes the answer, and the surviving accounts carry none of the aging, region or billed-value context the outreach email needs. For detail, the anti-join shape — LEFT JOIN on the resolved arm and keep the NULLs, or NOT EXISTS — preserves full rows from the pending side. Set ops compare sets; joins compare and carry. Knowing which deliverable you are holding is the interview question underneath the syntax.",
      tag: "setops",
    },
    {
      id: "zendesk-t13",
      q: "WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE total > 1000) — when does NOT IN silently return zero rows, and what do you reach for instead?",
      a: "When the inner query yields even one NULL: x NOT IN (1, 2, NULL) can never be true — the comparison against NULL is UNKNOWN, the predicate degrades, and the outer query returns nothing while looking perfectly valid. On this db customer_id never runs NULL, but the pattern ships anyway: any inner filter that LEFT JOINs or COALESCEs badly manufactures a NULL, and the not-in list quietly erases the report. The desk reaches for NOT EXISTS — WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.total > 1000) — which is NULL-immune the way existence logic should be, or LEFT JOIN + IS NULL when the plan is explicit. If you must keep NOT IN, add WHERE customer_id IS NOT NULL to the inner query and say why out loud. The interviewer is not testing syntax; they are testing whether you know this query lies.",
      tag: "subqueries",
    },
    {
      id: "zendesk-t14",
      q: "Find accounts whose average period value beats the platform's 338.19. Correlated subquery or derived table — and what changes at ten million rows?",
      a: "Both are correct; they differ in shape and cost. The correlated form — compare each account's average to a per-account re-computation — re-runs the inner fold once per outer row: honest on 16 accounts, punishing on ten million, and it reads upside-down (outer row first, inner re-run second). The derived form stages the fold once — per-account sums in a CTE or subquery, then one comparison against the platform aggregate or a join of two stagings — which is what the desk ships at scale. On this db the 63.5% concentration read (4 accounts above the 3,000 lifetime line) is exactly the derived shape: fold, filter, share. The instinct to name in the interview: correlated for row-local questions, derived for set-level ones — and the habit of asking how many times the inner fold runs before you commit to it.",
      tag: "subqueries",
    },
    {
      id: "zendesk-t15",
      q: "The two-grain census (periods per account, then accounts per region) needs two folds. Walk me through staging it — and why not one giant query?",
      a: "Stage it like the review agenda: CTE one folds orders per account (COUNT(*), SUM(total)); CTE two folds that staging per region (COUNT(*) accounts, SUM(periods), average depth); the outer select presents. Each stage has one grain and one name, and the grain blur that ruins ad-hoc censuses — events, periods, accounts — never gets a chance to mix, because every fold is a checkpoint someone can spot-check: 251 lines to 103 periods to 16 accounts. One giant query with nested aggregates either errors (an aggregate of an aggregate needs a subquery anyway) or hides the grain in cleverness nobody can audit at review time. The staged version also survives change: adding a first-response column to stage one does not rewrite the region rollup. Staging is not ceremony here — it is the difference between a census the reviewer trusts and one they re-run.",
      tag: "ctes",
    },
    {
      id: "zendesk-t16",
      q: "Reopen watch: an account shows a pending ticket AFTER a delivered one. How do you detect that in SQL, and what is the edge-row policy?",
      a: "State drift is a LEAD question, not a WHERE question: LEAD(status) OVER (PARTITION BY customer_id ORDER BY created_at) pairs each period with the account's next one, and the reopen signal is current-state delivered with next-state pending — a resolved account drifting back toward the queue. PARTITION BY is the whole trick: without it the timeline is global and every account's last row pairs with the next account's first, manufacturing transitions that never happened. The edge row — an account's final period — has no next state, so LEAD returns NULL: report it as 'no follow-up yet', never coalesce it to 'closed', which fabricates an ending the data does not contain. On this ledger the pending-after-delivered pattern is exactly the reopen watchlist the customer-success pod works on Mondays, and the same query with LAG reads the mirror question — what preceded this queue state.",
      tag: "windows",
    },
    {
      id: "zendesk-t17",
      q: "Payment terms run 30 days flat. How do you compute the due date and classify settlement speed — and where do string comparisons quietly break it?",
      a: "Due date is calendar arithmetic: DATE(issued_on, '+30 days') — on this db terms are uniform, 30/30/30, so the spread is pure issue-date arithmetic. Settlement speed is a between-stamps delta: JULIANDAY(paid_on) - JULIANDAY(issued_on), which averages 28.4 days over 20 settled bills, fastest 13, slowest 84 — that 84 is the aged outlier the dunning report exists for. The breaks: string comparison works only for ISO-format timestamps and only at whole-day boundaries — BETWEEN '2024-01-01' AND '2024-01-31' silently drops the last night's rows, and month-end is exactly when escalations land. And a computed due date in WHERE is a per-row function call — fine at 28 invoices, a range predicate at scale. Say the unit (days), say the reference (issue date), and the number survives review.",
      tag: "dates",
    },
    {
      id: "zendesk-t18",
      q: "The settlement report divides paid by billed per bill. Where do NULLs and zero denominators bite, and what is the guard?",
      a: "Three bites. Unsettled bills: the LEFT JOIN leaves SUM(p.amount_cents) NULL — NULL, not zero — so COALESCE(SUM(...), 0) before any arithmetic, or the six unpaid bills (15,217) drop out of ratios instead of showing as zero-paid. Division: SQLite returns NULL for x/0 rather than an error, so a zero base silently NULLs the share — NULLIF(denominator, 0) converts that accident into a deliberate NULL the outer COALESCE can label 'n/a', and it is portable: the same query on engines where division by zero errors stops crashing. Arithmetic: one NULL operand poisons the whole expression — amount_cents + NULL is NULL — so guards go on every LEFT-JOIN payload, not just the first one. On the partial bill (#25, 4,000 of 6,148) the share prints at all only because the guard kept the denominator real. Guard, label, then compute — in that order.",
      tag: "nulls",
    },
    {
      id: "zendesk-t19",
      q: "Define first-reply SLA the way this desk reports it. Why is the 2.98-day average the wrong headline, and what number ships instead?",
      a: "The SLA read is a breach share, not an average: of the periods that should have been answered, what fraction carries a first-response stamp within the published target window. The 2.98-day average (over the 82 stamped of 103) describes the typical ticket; it says nothing about the tail — and SLA is a tail instrument, the way outage reporting is uptime, not mean-time. The shipped number has three parts, each a denominator decision: the population (all 103 periods makes coverage 79.6 percent; responded-only makes it a different metric with a different name), the target (a threshold in days — the desk publishes it, the data does not imply it), and the breach share against that threshold. Averages move a slide; breach shares move headcount. If a candidate reports one number without naming its denominator and threshold, the interview is already over — politely.",
      tag: "kpi",
    },
    {
      id: "zendesk-t20",
      q: "What does 'backlog aging' mean here, and why is the as-of date the first thing you ask for?",
      a: "Backlog aging is the age of open tickets: reference date minus created_at, computed only for tickets still in the queue — the 14 unresponded periods on this db — and bucketed (0-2, 3-4, 5-plus days) rather than averaged, because the review escalates the oldest bucket, not the mean. The as-of date is the first question because age without one is undefined: this facts ledger anchors aging to MAX(paid_on) in payments — the reference is a fact of the data, not 'today', or every re-run of the report rewrites history. The second discipline: closed tickets are excluded from aging but counted in the population statement — aging the 14 while acknowledging 103 total is honest; aging 14 and calling it 'the backlog of 103' is the shrunken-denominator lie in a new outfit. Buckets beat averages for the same reason SLA uses breach shares: tails drive action.",
      tag: "kpi",
    },
    {
      id: "zendesk-t21",
      q: "Define reopen rate and defend the denominator. What is the gaming risk, and what is this db's row-level mirror of it?",
      a: "Reopen rate is resolved tickets that come back — a pending state after a resolved one for the same account within the window (7 or 30 days, named) — divided by resolved tickets, the 52, not by all 103 periods: the denominator is the population at risk of reopening. The gaming risk is premature resolution: mark tickets resolved at first touch and the reopen rate catches it — that is the metric's whole job, which is why support teams bonused on resolution speed get audited on reopens. This db carries the row-level mirror: bill #28 claims paid with zero settlement rows behind it — a status that lies until reconciled against events, exactly like a resolution claimed while the follow-up queue stays dirty. The desk checks claims against the ledger of record — settlement rows, response stamps, state history — and the rate is only as honest as that reconciliation.",
      tag: "kpi",
    },
    {
      id: "zendesk-t22",
      q: "Why does this desk report a CSAT low-tail instead of an average satisfaction score?",
      a: "Because the decisions are made in the tail. A 4.x mean is a smoothing function: one delighted account at 5 washes out the furious one at 1, and the churned account is invisible in a number the deck celebrates. The low-tail share — surveys scoring 2 or worse, over surveys sent — is a countable, actionable rate: it names how many accounts the desk failed, and it moves when process moves. The denominators cascade and each is a statement: surveys over resolved (52 on this db) measures the ask rate; low-tail over surveys measures the fail rate; conflating them inflates or deflates the read by the response bias. This ledger carries the same shape in billing: 21 exact, 1 partial at 4,000 of 6,148, 6 none — the partial is the 'mixed' middle the average swallows, and the never-settled are the silent churn the mean never sees. Distribution, then tail, then denominator — in that order.",
      tag: "kpi",
    },
    {
      id: "zendesk-t23",
      q: "This db is 103 orders — why would anyone care about sargability or indexes here? Make the performance case anyway.",
      a: "Because habits are built on toy data and executed on production. The desk's real table is millions of tickets, and the query that scans fine here dies there for one reason: a function wrapped around the indexed column. STRFTIME('%Y-%m', created_at) = '2024-01' cannot use an index on created_at — the engine computes the function per row; the range form created_at >= '2024-01-01' AND created_at < '2024-02-01' seeks. Same answer, two plans, two orders of magnitude. The other instincts: join on indexed keys (customer_id, invoice_id — the foreign-key columns every report here joins through), select named columns instead of SELECT * so coverings can happen, and filter early so windows and folds run on survivors. The interview point is not that SQLite on 103 rows cares — it is that the candidate writes the ten-million-row version by reflex, because nobody rewrites a quarter's worth of dashboards after the first incident.",
      tag: "performance",
    },
    {
      id: "zendesk-t24",
      q: "The billing close says the settlement fold disagrees with the fanned join. What is the class of bug, and what is the reconciliation pattern that catches it?",
      a: "Fan-out double counting: joining invoices to payments multiplies each bill by its settlement legs — 27 legs land on 22 invoices because five bills (#1, #5, #12, #19, #22) pay in two legs — and any SUM over the fanned rows counts those five twice. The catch is grain discipline: fold each side to one row per invoice first (payments per invoice in a CTE or derived table), then join, then aggregate — or COUNT(DISTINCT invoices.id) before believing any total. The reconciliation pattern the desk ships: class the bills (exact 21, partial 1 at 4,000 of 6,148, none 6), assert the classes sum back to the base of 28, and chase the two mirror anomalies by name — #28 paid with zero settlement rows, #11 void with one at 925.00 — because the trial balance tying 181,080 to 181,080 proves nothing about row-level truth. Totals agree; rows testify. Every audit query here ends with 'show me the rows that disagree'.",
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
    {
      id: "zendesk-mcq-11",
      prompt: "A teammate's census uses GROUP BY 1 to fold ticket periods by month. The desk's review edits the SELECT list before shipping. What is the risk?",
      choices: ["None — GROUP BY 1 always tracks the first column", "The fold silently follows a different column after the edit — ordinal grouping binds to position, not meaning", "GROUP BY 1 is invalid SQL and errors", "It doubles the counts"],
      answer: 1,
      why: "GROUP BY 1 is a positional reference to the first SELECT column. Reorder or replace the SELECT list and the fold follows the new first column with no error — the census re-buckets onto whatever moved into position one. The desk's rule: group by named keys (`STRFTIME('%Y-%m', created_at) AS month`, then GROUP BY month), so the fold's meaning travels with the column, not with its seat.",
      notes: [
        { choice: 0, why: "Positional grouping is exactly as stable as the SELECT list — a reordering is a silent re-bucketing. Meaning must live in the expression, not the seat." },
        { choice: 2, why: "SQLite accepts GROUP BY 1 — that is the trap. It runs, it is wrong under edits, and nothing flags it." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-12",
      prompt: "The escalation list stacks the 14 unresponded tickets with the 7 closed-invalid ones. Which fold keeps all 21 rows?",
      choices: ["UNION — it combines both queries", "UNION ALL — no dedupe pass across the arms", "INTERSECT — the shared accounts", "Either — the arms are disjoint so both print 21"],
      answer: 1,
      why: "The arms are disjoint pipeline states, so the honest count is 21 and UNION ALL ships it cheapest. UNION runs a dedupe pass across the merged stack: any two rows identical on every selected column collapse to one, silently understating the review list — 20 rows where 21 exist, no error raised.",
      notes: [
        { choice: 0, why: "UNION combines, then dedupes — the dedupe is the hidden edit. Disjoint states do not license it; identical-looking rows across arms are still two tickets." },
        { choice: 2, why: "INTERSECT returns rows present in BOTH arms — an account would have to be simultaneously unresponded and closed-invalid. The result is a near-empty set, not the escalation list." },
        { choice: 3, why: "Disjoint states protect against cross-arm dedupe only if every selected column differs; shared account/region/state shapes still collapse under UNION. Don't bet the review on it." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-13",
      prompt: "SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE plan_flag = 'X') returns zero rows on a db where the inner query is nearly empty. First suspicion?",
      choices: ["No customers match — correct result", "The inner query returned a NULL, and x NOT IN (…, NULL) is never TRUE — the whole list self-destructs", "NOT IN is deprecated", "The outer table is empty"],
      answer: 1,
      why: "One NULL in the inner set poisons NOT IN: the comparison against NULL is UNKNOWN, so no row can satisfy the predicate — zero rows, silently, with valid-looking SQL. The fix is NOT EXISTS (NULL-immune), or an explicit IS NOT NULL on the inner query with the reason stated.",
      notes: [
        { choice: 0, why: "That is exactly what the bug looks like — a plausible business answer. The empty result is arithmetic, not fact." },
        { choice: 2, why: "NOT IN is fine — the NULL semantics are the bug. Swapping syntax without removing the NULL changes nothing." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-14",
      prompt: "The close pack wants a trailing 3-month average of billed value on the month spine (2024-01: 3,731.97 … 2025-02: 2,390.53). Which frame clause computes it?",
      choices: ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "UNBOUNDED PRECEDING (the default frame — close enough)", "ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING", "No frame — ORDER BY alone gives the trailing window"],
      answer: 0,
      why: "AVG over the spine with ROWS BETWEEN 2 PRECEDING AND CURRENT ROW averages exactly the current month and the two before it — a rolling three-month window that starts honest at month one. The default frame is UNBOUNDED PRECEDING: a running average since January, not a trailing one.",
      notes: [
        { choice: 1, why: "Unbounded is the running total — every month from the spine's start. It is a different metric wearing the same alias, and the trend line flattens into a smooth lie." },
        { choice: 2, why: "That looks AHEAD — a leading window. In a close pack it prints future months next to a settlement report." },
        { choice: 3, why: "ORDER BY without a frame still has a default frame (RANGE UNBOUNDED PRECEDING TO CURRENT ROW) — you get the running shape, not the trailing one." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-15",
      prompt: "RANK() OVER (ORDER BY COUNT(*) DESC) over the month spine, then a gate keeping only months with 8+ periods. Which months does the rank see?",
      choices: ["All 14 — ranks are computed before filters", "Only the 6 qualifying months — WHERE/HAVING run before window functions, so ranks are computed over survivors and renumber from there", "Only the top month", "Depends on the tier"],
      answer: 1,
      why: "Window functions are evaluated after WHERE and GROUP BY/HAVING in the logical pipeline: filtered-out months (the 6- and 7-period months) never enter the ranking, so the two 9-ticket months rank 1-2 and the 8-ticket quartet shares rank 3 over survivors only. Add a month back and every rank below it shifts — which is why the desk ships the gate and the rank in one query and says the population out loud.",
      notes: [
        { choice: 0, why: "Windows see the post-filter set, not the table. 'Ranks computed on all months' is the mental model behind filter-then-rank double-counting bugs." },
        { choice: 2, why: "RANK assigns ties the same rung — the two 9s tie at 1; nothing collapses to one row. Row-limiting is a different clause entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-16",
      prompt: "A teammate folds invoices with payments and reports SUM(amount_cents) over the join. The ledger says 27 settlement legs land on 22 invoices; five bills (#1, #5, #12, #19, #22) pay in two legs. What is wrong?",
      choices: ["Nothing — SUM over the join is the settlement total", "The invoice-side sum counts the five two-leg bills twice — fold invoices to one row per bill (a CTE) before aggregating", "The sum needs ROUND to 2 decimals", "Two-leg bills must be excluded"],
      answer: 1,
      why: "Each two-leg bill appears on two joined rows, so any SUM of invoice-side columns multiplies those bills by 2 — the fan-out tax. The fix is grain discipline: fold payments per invoice in a staging step, join one-to-one, then sum. Same disease as COUNT(*) printing 33 on a 28-invoice table.",
      notes: [
        { choice: 0, why: "SUM over a fanned join is a leg-weighted sum — it reconciles to nothing the ledger carries. The number prints; the audit fails." },
        { choice: 2, why: "Rounding is cosmetic; the double count is structural. Two-leg bills at ~5,000 each shift totals by five figures in cents." },
        { choice: 3, why: "Split payments are legitimate — excluding them deletes real settlements. Aggregate at the right grain instead." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-17",
      prompt: "Terms are 30 days flat (min, avg, max all 30). Settled bills average 28.4 days to pay, fastest 13, slowest 84. Which expression computes the due date?",
      choices: ["issued_on + 30", "DATE(issued_on, '+30 days')", "JULIANDAY(issued_on) + 30", "STRFTIME('%d', issued_on) + 30"],
      answer: 1,
      why: "DATE(issued_on, '+30 days') is calendar arithmetic — month lengths and year boundaries included. Plain addition coerces the timestamp to its leading numeric prefix (issued_on + 30 lands 30 years out); JULIANDAY yields a float day-count, not a date; STRFTIME('%d', …) extracts a day-of-month string, and '31' + 30 is 61 — a day that does not exist.",
      notes: [
        { choice: 0, why: "SQLite coerces '2024-01-05' + 30 by parsing the leading digits — you get 2054, a year. Silent nonsense is the worst kind." },
        { choice: 3, why: "Day-of-month plus 30 overflows every long month. Calendar math needs the calendar function." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-18",
      prompt: "In SQLite, SELECT 1 / 0 prints — what? And what does the desk ship instead?",
      choices: ["An error — division by zero aborts", "NULL — so the guard is NULLIF(denominator, 0) plus a COALESCE label, making the silent NULL a deliberate 'n/a'", "Infinity", "0"],
      answer: 1,
      why: "SQLite returns NULL for division by zero — no error, a blank cell where a rate was promised. The desk's guard: NULLIF(COUNT(...), 0) turns a zero base into a NULL by intent, COALESCE(..., 'n/a') labels it for humans, and the same query survives porting to engines where x/0 actually errors.",
      notes: [
        { choice: 0, why: "On strict engines yes — but SQLite's silence is the trap: the report ships with holes nobody signed off on." },
        { choice: 3, why: "Zero would be a fabricated 0% rate — a factual claim about a population that has no denominator. 'n/a' and 0 are different statements." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-19",
      prompt: "CSAT low-tail is defined as which of these?",
      choices: ["Average survey score (4.x) minus 2", "Share of surveys scoring 2 or worse, over surveys sent", "Surveys sent over resolved tickets (52)", "Resolved tickets over surveys"],
      answer: 1,
      why: "The low-tail is a fail-rate: bad scores divided by the scored population. The 4.x mean is the smoothing function that hides exactly those accounts; the share names them and moves when process moves. Surveys-over-resolved is the ask-rate — a different denominator for a different statement.",
      notes: [
        { choice: 0, why: "Mean-minus-two is still a mean — same blindness, new costume. The tail is a count of failures, not a shifted average." },
        { choice: 2, why: "That is the response/ask rate — response bias lives there, and reporting it as the low-tail inflates satisfaction by dropping the accounts who did not answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-20",
      prompt: "First-reply SLA ships as one number. Which is it?",
      choices: ["Average latency 2.98 days over the 82 stamped periods", "Breach share: the fraction of the defined population stamped later than the published target — denominator named, threshold published", "Median of the 2-to-4 day range", "82, the stamped count"],
      answer: 1,
      why: "SLA is a tail instrument: the desk publishes a target in days and reports the breach share against it, over a population it names (all 103 periods makes coverage 79.6% — a different metric from the responded-only read). The 2.98 average describes the typical ticket and hides the 14 nobody touched — the exact tickets the SLA exists for.",
      notes: [
        { choice: 0, why: "The average is context, not the SLA — the tail drives it, and the denominator (82 of 103) is itself a claim needing a name." },
        { choice: 2, why: "The median of a 2-to-4 range is trivia about the stamped population; it says nothing about breach." },
        { choice: 3, why: "A raw count without a population is a numerator looking for a denominator — the classic shrunken-base lie." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-21",
      prompt: "Backlog aging needs an as-of date. This ledger anchors it to what?",
      choices: ["Today() — the wall clock at query time", "MAX(paid_on) from payments — a reference date that is a fact of the data, so every re-run reproduces the same ages", "The first order date (2024-01-01)", "No date — ages are counted in tickets"],
      answer: 1,
      why: "Age without a reference date is undefined, and 'today' makes every re-run rewrite history. The ledger anchors aging to the latest observed settlement stamp — MAX(paid_on) — so the open bills' aging (6 bills, 15,217) is reproducible and reviewable. Reproducibility is the property being tested, not the specific date.",
      notes: [
        { choice: 0, why: "Query-time clock is fine for dashboards, fatal for close packs: two runs on two days print two truths and neither can be audited." },
        { choice: 3, why: "Aging is a duration — it needs two time points. Ticket counts are the population statement, a different line of the report." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-22",
      prompt: "Reopen rate divides by which population?",
      choices: ["All 103 ticket periods", "The 52 resolved tickets — the population at risk of reopening", "The 14 unresponded", "The 82 stamped"],
      answer: 1,
      why: "Only resolved tickets can reopen; the rate is returns over the at-risk base — 52. Dividing by 103 dilutes the read with tickets that never reached the state, and by 82 mixes in the still-open queue. Denominators are definitions: this one makes the premature-resolution tax visible, which is the metric's job.",
      notes: [
        { choice: 0, why: "All periods is the coverage denominator — a different metric. Reusing it here quietly halves the reported reopen pressure." },
        { choice: 2, why: "Unresponded tickets cannot reopen — they have not closed anything. Their backlog belongs to the aging report." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-23",
      prompt: "One-pass census: 28 bills classed as exact / partial / never-settled in a single query. The idiomatic clause is —",
      choices: ["COUNT(*) FILTER (WHERE …) per class — one scan, one row, three columns", "Three separate queries stacked with UNION", "GROUP BY status — the status column already knows", "DISTINCT on the coverage class"],
      answer: 0,
      why: "COUNT(*) FILTER (WHERE payment_rows = 0) — and its siblings — fold every class in one pass over the per-bill staging: 6 never-settled, 1 partial (4,000 of 6,148), 28 base. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin; FILTER is the readable one. Three queries triple the scan and invite three different as-of moments.",
      notes: [
        { choice: 1, why: "A UNION stack works but re-scans per arm and re-derives the base each time — the classic place where arms disagree on filters and the classes stop summing to 28." },
        { choice: 2, why: "The status column claims; the payment rows testify. #28 says paid with zero rows — classing on status ships the lie." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-24",
      prompt: "SELECT customer_id FROM orders WHERE status = 'delivered' EXCEPT SELECT customer_id FROM orders WHERE status = 'pending' — what prints, and what is EXCEPT's contract?",
      choices: ["Accounts with a pending period after a delivered one, in order", "Accounts with at least one delivered period and no pending one — left set minus right, duplicates collapsed, no row order promised", "All accounts — EXCEPT is a comment", "An error — EXCEPT needs identical column names"],
      answer: 1,
      why: "EXCEPT is set subtraction: members of the left set not present in the right, deduped like a DISTINCT, order undefined unless the trailing ORDER BY says so. Here it is the never-queued cohort — delivered-only accounts. It answers membership; it does not preserve the rows' detail.",
      notes: [
        { choice: 0, why: "That is sequence logic — LEAD over state history. EXCEPT has no memory of which came first; sets are unordered." },
        { choice: 3, why: "Columns must match in count and type compatibility; names may differ. The contract is positional, like all set ops." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-25",
      prompt: "Find the 6 contract bills with no settlement rows. Which shapes do it — and which survives multi-leg payments unharmed?",
      choices: ["LEFT JOIN payments, keep IS NULL — and WHERE NOT EXISTS; both are existence checks that ignore leg counts", "INNER JOIN on invoice_id, filter paid = 0", "GROUP BY invoice HAVING COUNT(*) = 0", "UNION of both tables"],
      answer: 0,
      why: "Both test existence: LEFT JOIN + IS NULL keeps the 6 unmatched bills, and WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) answers the same question NULL-free. Existence is about legs being zero, not how many — both shapes count zero legs correctly, which is why the desk standardizes on NOT EXISTS for readability.",
      notes: [
        { choice: 1, why: "An inner join drops the unmatched rows before any filter — the 6 bills you are hunting never reach the WHERE. The anti-join's entire point is keeping them." },
        { choice: 2, why: "COUNT(*) = 0 groups that exist cannot happen — empty groups do not materialize. The 6 are absent from the fold, silently." },
        { choice: 3, why: "UNION merges row sets; it does not compare them. Nothing about a union isolates non-matches." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-26",
      prompt: "RANK() OVER (ORDER BY billed_value DESC) without PARTITION BY, on a per-account fold — what does the desk get?",
      choices: ["Per-region ranks", "One global ranking across all 16 accounts — the partition reset never happens, so regional boards misread", "An error", "Random ranks"],
      answer: 1,
      why: "No PARTITION BY means one partition: the whole fold. Every account competes against the platform — which is fine for a global board, wrong for a regional one. The fix is PARTITION BY region: ranks restart per cohort, and the EU board's rank 1 is not silently the platform's rank 1. Window scope is a scope decision, not syntax.",
      notes: [
        { choice: 0, why: "Ordering by value is not partitioning by region — the two clauses do different jobs. Conflating them is the classic mis-scope." },
        { choice: 2, why: "It runs — that is the problem. A plausible-looking global board ships to a regional reviewer and nobody notices the scope." },
      ],
      difficulty: "easy",
    },
    {
      id: "zendesk-mcq-27",
      prompt: "A scalar subquery in SELECT returns two rows for one outer row. What happens?",
      choices: ["It returns the first row", "Runtime error — 'more than one row returned by a subquery used as an expression'; the scalar contract is 0-or-1 rows", "It returns NULL", "It concatenates"],
      answer: 1,
      why: "The scalar contract is 0-or-1 rows: zero gives NULL (comparisons degrade quietly), one drives the value, two is a hard error. The bug ships when the inner fold loses its grouping — a second row appears for one account and the report crashes in production instead of in review. Guard the inner query with its own GROUP BY and MAX/MIN when 'the' value is meant to be an extreme.",
      notes: [
        { choice: 0, why: "First-row behavior is an engine's leniency, not a contract — relying on it is how a demo becomes an outage on a stricter engine." },
        { choice: 3, why: "Nothing concatenates. Multi-row scalar results are an error condition, not a feature." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-28",
      prompt: "A teammate computes response latency as shipped_at - created_at on the TEXT timestamps and gets 0 for every ticket. Why?",
      choices: ["The tickets are answered instantly", "SQLite coerces both TEXT timestamps to their leading numeric prefix (the year) — 2024 - 2024 = 0; the honest delta is JULIANDAY(shipped_at) - JULIANDAY(created_at)", "Subtraction is not defined on TEXT", "The columns are swapped"],
      answer: 1,
      why: "Timestamp strings minus timestamp strings is numeric coercion of the year prefix — zero, printed confidently. The desk's latency (2.98 days average, range 2 to 4) comes from JULIANDAY on both stamps, in open-to-response order — reversed operands print negative days instead, which at least fails visibly. Coercion failures are the quiet ones.",
      notes: [
        { choice: 0, why: "Nobody answers 103 tickets in zero days — the number is the bug, not the service. A flat zero column is the signature of prefix coercion." },
        { choice: 2, why: "SQLite defines subtraction on TEXT by coercing to numeric — that is exactly why it runs and lies. 'Undefined' would at least error." },
      ],
      difficulty: "medium",
    },
    {
      id: "zendesk-mcq-29",
      prompt: "A movement walk uses LAG(ticket_periods) OVER (ORDER BY month) but ships without a final ORDER BY. What does the reviewer see?",
      choices: ["Rows sorted by month — the window's ORDER BY governs output order too", "No guaranteed order — the window ORDER BY sequences the function's computation only; presentation order needs its own ORDER BY", "An error — two ORDER BYs required", "Reverse chronological"],
      answer: 1,
      why: "The window's ORDER BY defines the row sequence the LAG walks — it never promises the result set's display order. Without the final ORDER BY month, row order is whatever the plan yields, and the walk reads scrambled even though every delta is correct. Two ORDER BYs, two jobs: one computes, one presents.",
      notes: [
        { choice: 0, why: "It often looks sorted (small tables, scan luck) — which is how the bug survives the demo and dies in review. Luck is not a contract." },
        { choice: 2, why: "One ORDER BY inside OVER plus one final clause is the correct pair; the audit is that both exist, not that they collide." },
      ],
      difficulty: "hard",
    },
    {
      id: "zendesk-mcq-30",
      prompt: "The per-bill staging LEFT JOINs payments; six bills match none. SUM(p.amount_cents) prints NULL for them. What does the desk wrap it in, and why?",
      choices: ["Nothing — NULL is the honest print", "COALESCE(SUM(p.amount_cents), 0) — unpaid must read as zero-paid so ratios and CASE classes behave; NULL poisons every expression it touches", "IFNULL(SUM(p.amount_cents), 'none')", "ROUND to hide it"],
      answer: 1,
      why: "NULL is not zero: amount_cents + NULL is NULL, paid-share ratios NULL out, and CASE comparisons with NULL never fire — the 6 unpaid bills (15,217) silently vanish from every downstream fold. COALESCE to 0 states the business fact (no settlements = zero paid) and keeps the arithmetic alive. The classes then read exact 21 / partial 1 / none 6 and sum to the 28-bill base.",
      notes: [
        { choice: 0, why: "NULL is honest for display and fatal for math — the report's job is to make unpaid bills countable, not merely visible." },
        { choice: 2, why: "Mixing a text fallback into a numeric column breaks types downstream — 0 is the numeric fact; 'none' belongs in a label." },
        { choice: 3, why: "Rounding cannot touch NULL — it propagates. The guard is COALESCE, upstream of any formatting." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-zendesk-3",
      tier: "medium",
      topic: "j7",
      universe: "catalog",
      title: "The event-mix census",
      brief:
        "Zendesk-flavored brief on the storefront db: the desk's ops review wants the event mix — which plan-SKU categories generate the ticket-event lines agents actually work. Probed facts: 251 event lines across 103 ticket periods fold into 7 categories; the heaviest by tickets touched are Accessories (54 distinct periods), Audio (46), Electronics (40) and Video (30), with Wearables (23), Apparel (22) and Fitness (13) below the review gate. Audio carries 11,744.01 of event value on 97 units — the deep-work category — while Accessories' 121 units are shallow, one-line touches. The review keeps only categories touching at least 30 distinct periods, so thin categories never set staffing policy.",
      ask: "Return each qualifying category with distinct ticket periods touched, units of events and event value — richest first.",
      template:
        "SELECT p.category AS category,\n       COUNT(DISTINCT oi.order_id) AS tickets_touched,\n       SUM({1}) AS units,\n       ROUND(SUM(oi.quantity * {2}), 2) AS event_value\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nHAVING COUNT(DISTINCT oi.order_id) >= {3}\nORDER BY event_value {4};",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the units fold",
          why: "Units is SUM(quantity) over the event lines — the work-volume read (Accessories 121, Audio 97). p.id folds surrogate keys into a meaningless census, and a constant per line just re-prints the line count with no volume story.",
        },
        {
          answer: "oi.unit_price",
          kind: "keyword",
          label: "the per-line event price",
          why: "Event value is units times the line's own unit_price from order_items — the price stamped on the event. p.id prices events by catalog id and produces noise; units re-multiplies the fold's own output alias and errors, because an alias is not an input column.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the review gate on distinct periods",
          why: "The 30-period gate keeps the four busy categories — Accessories 54, Audio 46, Electronics 40 and Video 30, whose own cell shows the gate. 40 or 31 drops Video and loses the shallow-deep contrast; 13 admits Wearables (23), Apparel (22) and Fitness (13) and hands staffing policy to the tail.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first direction",
          why: "The review opens on Audio's 11,744.01 — the deep-work queue. ASC would open on Accessories' 3,294.29 and frame the mix around shallow one-line touches before anyone sees where value concentrates.",
        },
      ],
      distractors: ["13", "31", "40", "p.id", "units", "ASC"],
      walkthrough:
        "An event-mix fold where the gate is also a result cell. Event lines join plan SKUs, fold per category into three reads — distinct periods touched, units, value — and the gate at 30 keeps four rows: Accessories 54 periods / 121 units / 3,294.29, Audio 46 / 97 / 11,744.01, Electronics 40 / 85 / 4,818.61, Video 30 / 61 / 5,198.41, ordered richest-first. The headline: Audio is 46 of the 170 kept periods yet carries 11,744.01 — nearly half the kept event value — the deep-work queue; Accessories touches the most periods (54) at the thinnest value per event. The distractors each break differently: a 40 or 31 gate drops Video (30) and the mix loses its contrast row; a 13 gate admits the three tail categories and hands staffing policy to two-ticket categories; p.id folds product ids into the units column and the census reads as garbage sums; units as the value multiplier errors the fold — an output alias is not an input column; ASC opens the review on the shallowest category. The lesson under the lesson: a census gate is a claim about the result — here Video's own 30 proves the threshold was honest.",
    },
    {
      id: "cs-zendesk-4",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The 3,000-line concentration fold",
      brief:
        "Zendesk-flavored brief on the storefront db: the renewals deck prices expansion off the heavy accounts — those whose lifetime billed value crosses 3,000. Probed facts: platform billed value is 34,833.28 across 103 ticket periods; lifetime value concentrates hard — accounts above the 3,000 line carry 63.5% of it (71.2% above the 2,000 line). The top spenders are Alice Chen at 7,262.35 over 24 periods, Emma Wilson 6,640.56 over 17, Grace Kim 4,574.23 over 14 and Maya Patel 3,644.56 over 13 — the only four above the line; the next account sits at 2,667.93. The deck needs the count and the share in one row, computed from the fold, not copied from last quarter's slide.",
      ask: "Return the heavy-account count and their share of platform billed value — one row, share rounded to 1 decimal.",
      template:
        "SELECT COUNT(*) AS heavy_accounts,\n       ROUND(100.0 * SUM(billed_value) / (SELECT {1} FROM orders), 1) AS value_share\nFROM (\n  SELECT customer_id, SUM(total) AS billed_value\n  FROM orders\n  GROUP BY {2}\n  HAVING SUM(total) >= {3}\n);",
      slots: [
        {
          answer: "SUM(total)",
          kind: "keyword",
          label: "the platform base",
          why: "The share's denominator is ALL billed value — SUM(total) over orders, 34,833.28. AVG(total) would divide by the 338.19 average and print a meaningless five-digit 'share'; COUNT(*) would divide by 103 periods and mix grains — dollars over tickets.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the fold's grain",
          why: "The staging fold is one row per account: GROUP BY customer_id with SUM(total) AS billed_value. GROUP BY created_at folds to one row per timestamp — no account crosses 3,000 in a single period (max 1,088.44) and the census comes back empty; region is not a column of orders, so that fold errors before it lies.",
        },
        {
          answer: "3000",
          kind: "number",
          noVerify: true,
          label: "the concentration line",
          why: "The 3,000 line is the deck's definition of heavy — it keeps exactly four accounts (7,262.35, 6,640.56, 4,574.23, 3,644.56) and their 63.5 share prints in the result. A 2,000 line is a different deck: five accounts, 71.2. A 4,000 line amputates Maya Patel and the story loses its tail.",
        },
      ],
      distractors: ["COUNT(*)", "AVG(total)", "region", "created_at", "2000", "4000"],
      walkthrough:
        "A two-stage fold: stage one collapses 103 periods to 16 accounts with lifetime billed_value; stage two filters to the 3,000 line and reads the platform share. The correct fill keeps four accounts and prints heavy_accounts 4, value_share 63.5 — the probed concentration read (71.2 above the 2,000 line, for contrast). The denominator is staged once: (SELECT SUM(total) FROM orders) returns 34,833.28 and the scalar contract holds — one row. The distractors each break differently: AVG(total) as the base divides dollars by 338.19 and prints a five-digit 'share'; COUNT(*) mixes grains the same way; GROUP BY created_at folds per timestamp and — with max single-period value 1,088.44 — empties the census; GROUP BY region errors because orders carry no region; 2000 redefines the deck (five accounts, 71.2) and 4000 cuts the tail account. The lesson under the lesson: a share is a fraction of a named base — stage the numerator, name the base, then print.",
    },
    {
      id: "cs-zendesk-5",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The second-half movement walk",
      brief:
        "Zendesk-flavored brief on the storefront db: the close pack opens with the ticket movement walk — month by month, periods opened, the prior month's count beside it, and the movement between. Probed facts for the review window (months from 2024-07 on): the spine reads 8, 7, 9, 7, 6, 7, 6, 7 periods from 2024-07 to 2025-02, and the platform's full spine is 14 months. The desk reads movement, not levels — the +2 jump into 2024-09 (9 periods) and the slide to 6 in 2024-11 are the staffing notes. The first row of the window has no prior month inside the review, and the pack wants that honesty visible, not zero-filled.",
      ask: "Return each review-window month with its period count, prior count and movement — calendar order, first prior as NULL.",
      template:
        "SELECT month, ticket_periods, prior_periods,\n       ticket_periods - prior_periods AS movement\nFROM (\n  SELECT month, ticket_periods,\n         {2}(ticket_periods) OVER (ORDER BY {3}) AS prior_periods\n  FROM (\n    SELECT {1} AS month, COUNT(*) AS ticket_periods\n    FROM orders\n    GROUP BY month\n  )\n  WHERE month >= {4}\n)\nORDER BY month;",
      slots: [
        {
          answer: "STRFTIME('%Y-%m', created_at)",
          kind: "keyword",
          label: "the month key",
          why: "The '%Y-%m' bucket keeps 14 honest months and sorts as text. Raw created_at would group per timestamp and shatter the fold; a month-only SUBSTR key merges the two Januaries — and inside a windowed walk a wrong key reorders the LAG itself.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-state function",
          why: "The walk pairs each month with its PREDECESSOR: LAG. LEAD pairs with the successor — the column would print next month's count (7 for 2024-07 instead of NULL) and every movement inverts. One word, opposite direction, plausible output.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the walk's ordering key",
          why: "LAG must walk calendar order: OVER (ORDER BY month). Ordering the window by ticket_periods ranks by volume and pairs unrelated months — 2024-11's prior reads as the earlier 6-count month, not 2024-10. The window's ORDER BY computes; it does not present.",
        },
        {
          answer: "'2024-07'",
          kind: "keyword",
          label: "the review-window start",
          why: "The window literal keeps months from 2024-07 on — 8 rows, first prior honestly NULL. An unquoted 2024-07 compares text to a number and lets every row through; a later literal truncates the window the pack asked for.",
        },
      ],
      distractors: ["LEAD", "SUBSTR(created_at, 6, 2)", "created_at", "ticket_periods", "COUNT(*)"],
      walkthrough:
        "A staged walk: fold periods per month, gate to the review window, then pair with LAG in calendar order and subtract. The correct fill prints 8 rows — 2024-07 (8, NULL, NULL) through 2025-02 (7, 6, 1) — with movements -1, +2, -2, -1, +1, -1, +1 after the honest NULL opener. The desk's read: the +2 into 2024-09 (9 periods) is the staffing spike; 2024-11's slide to 6 is the quiet month. The distractors each break differently: LEAD walks forward — 2024-07's prior would print 7 and every movement inverts; SUBSTR month-only keys shrink to '07'…'12' and the >= '2024-07' comparison empties the window; raw created_at shatters the fold into per-timestamp groups; ordering the window by ticket_periods pairs unrelated months — 2024-11's prior becomes the earlier 6-count month, not 2024-10; COUNT(*) in the WHERE errors, because aggregates have no life before the fold. The lesson under the lesson: window functions compute in their own ORDER BY and display in the final one — two clauses, two jobs — and the NULL edge row is the report telling the truth.",
    },
    {
      id: "cs-zendesk-6",
      tier: "hard",
      topic: "x2",
      universe: "refund-audit",
      title: "The one-pass settlement census",
      brief:
        "Zendesk-flavored brief on the storefront db: billing close wants the contract settlement census in one pass — per class, not per query. Probed facts: 28 contract bills; 21 settle exact (65,612), 1 pays partial (4,000 of 6,148), 6 never settle (15,217); the anomaly log names both mirror modes — bill #28 claims paid with zero settlement rows (1,756.00) and bill #11 is void yet carries one (925.00); settled dollars total 69,612 (16 card legs 37,364, 11 wire legs 32,248). The census must count bills, never settlement legs — five bills (#1, #5, #12, #19, #22) pay in two legs and the fanned join counts them twice.",
      ask: "Return bills, never-settled, partial, paid-but-unbacked and settled dollars — one row, one scan.",
      template:
        "SELECT COUNT(*) AS bills,\n       COUNT(*) FILTER (WHERE payment_rows = {1}) AS never_settled,\n       COUNT(*) FILTER (WHERE payment_rows = {2} AND paid_cents < amount_cents) AS partial_bills,\n       COUNT(*) FILTER (WHERE status = {3} AND payment_rows = 0) AS paid_but_unbacked,\n       ROUND(SUM(paid_cents) / {4}, 2) AS settled_dollars\nFROM (\n  SELECT i.id, i.amount_cents, i.status,\n         COUNT(p.id) AS payment_rows,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  {5} payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n);",
      slots: [
        {
          answer: "0",
          kind: "number",
          noVerify: true,
          label: "the no-legs marker",
          why: "Never-settled means zero payment legs: payment_rows = 0. The audit flags this constant rather than the result — 6 is the printed cell, and 0 is the predicate's definition, the same convention as LIMIT constants.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the partial-legs marker",
          why: "The partial class is one settlement leg short of the bill: payment_rows = 1 AND paid under face. Bill #25 (4,000 of 6,148) is the only such row, and 1 prints as the partial_bills cell; the two-leg bills (#1, #5, #12, #19, #22) all settle exact and must not class as partial.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the claim under test",
          why: "The anomaly arm tests the CLAIM: status = 'paid' with zero legs. #28 is the hit — 1,756.00 claimed, nothing settled. 'void' finds nothing here: #11 carries a leg, which is exactly why it is the mirror anomaly; 'open' with zero legs is just the dunning list — 6 rows, not an anomaly.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Ledger amounts are INTEGER cents: divide by 100.0 to land on the probed 69,612 dollars. A bare 100 divides in integer space — correct only while the fold happens to be even; the .0 is the discipline, not the luck.",
        },
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the survival rule",
          why: "LEFT JOIN keeps all 28 bills; the 6 with no legs survive with NULL payloads and COALESCE turns those into zero-paid. An INNER JOIN deletes them before the census — never_settled would print 0 and the dunning list would look clean.",
        },
      ],
      distractors: ["JOIN", "CROSS JOIN", "'open'", "'void'", "payment_rows", "10"],
      walkthrough:
        "One scan, five cells: stage the per-bill fold (legs per bill, paid cents per bill, COALESCE to 0), then class with FILTER arms. The correct fill prints bills 28, never_settled 6, partial 1, paid_but_unbacked 1 (#28, 1,756.00 claimed with nothing behind it), settled_dollars 69,612 — and the classes reconcile: 21 exact + 1 partial + 6 none = 28. The distractors each break differently: an INNER JOIN amputates the six no-leg bills — never_settled prints 0 and the dunning list lies by omission; CROSS JOIN pairs every bill with every leg and the fold becomes noise; 'open' re-labels the dunning list as the anomaly (6, not 1); 'void' finds nothing — #11 carries a leg, which is why it is the mirror anomaly; payment_rows = payment_rows is always true, so the partial arm re-counts #28 and prints 2; a bare 10 divisor moves the decimal. The lesson under the lesson: claims are tested against rows — the census counts bills, the payments table testifies.",
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
    { slug: "first-and-last-call-on-the-same-day", why: "MIN and MAX stamps per account-day — first touch to last touch: the coverage-window read the staffing plan maps shifts against." },
    { slug: "customers-who-bought-all-products", why: "Relational division — accounts that hit every pipeline state: the full-funnel adoption audit the QBR opens with." },
    { slug: "restaurant-growth", why: "Trailing 7-day frame over a fold — rolling response load: the smoothing the staffing chart is actually drawn from." },
    { slug: "running-total-for-different-genders", why: "Running totals within a partition — cumulative billed value per account cohort: the concentration walk the renewals deck quotes." },
    { slug: "biggest-window-between-events", why: "LEAD gaps between consecutive events — the longest silence per account: the dormancy window the customer-success pod works." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT per day — event types folded into one cell per ticket day: the desk-mix read for the ops review." },
    { slug: "books-with-null-ratings", why: "COUNT(col) versus COUNT(*) — stamped versus all periods: the first-response coverage read where NULL policy IS the metric." },
    { slug: "median-time-to-convert", why: "Median emulation — time-to-resolve without AVG's smoothing: the percentile the SLA report should quote instead of the 2.98 mean." },
    { slug: "second-most-recent-activity", why: "Second-latest per group — the second touch after the first response: the follow-through audit that catches one-and-done desks." },
    { slug: "department-highest-salary", why: "Argmax via subquery — the accounts inside the max-loaded cohort: the overload list capacity planning starts from." },
    { slug: "employees-with-missing-information", why: "Missing-rows join — accounts present in one ledger, absent in the other: the account-versus-billing mismatch sweep." },
    { slug: "find-the-start-and-end-number-of-continuous-ranges", why: "Gaps-and-islands over days — consecutive-day response streaks: the consistency read behind 'reliable desk' claims." },
    { slug: "account-balance", why: "Running settlement balance per bill — the five two-leg split payments walked leg by leg: the partial-payment tracker." },
    { slug: "ar-aging-schedule", why: "Aging buckets pivot — contract bills banded by days outstanding: the dunning schedule billing close ships." },
    { slug: "snapshot-delta-detect", why: "FULL OUTER snapshot delta — pipeline states this month versus last: the movement audit that names new, closed and stalled." },
    { slug: "find-peak-calling-hours-for-each-city", why: "Hour argmax per cohort — peak ticket hours per region: the shift-boundary read the staffing plan defends." },
  ],
};
