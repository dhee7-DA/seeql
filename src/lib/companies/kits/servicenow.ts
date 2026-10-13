// ServiceNow — kit 9 of the SaaS & Enterprise domain (wave-6, task 92-c-saas).
// Enterprise workflow / ITSM SQL: the storefront db read as an incident-
// management sandbox — customers are enterprise accounts, orders are incident
// tickets (delivered = resolved, shipped = fix applied and awaiting
// verification, pending = awaiting requester, cancelled = closed unresolved),
// shipped_at = the work-completion stamp, order_items = work-log lines,
// products = service-catalog items, regions = territory/datacenter cohorts.
// Invoices/payments are the account billing book in INTEGER cents (/100.0).
// Angle: ticket aging, SLA breach counts, resolution funnels.
// Pool provenance: 0 tagged LC rows for ServiceNow — the whole pool is
// theme-curated to known ITSM screen shapes and says so. Case briefs quote
// probed figures from scripts/company-facts.md (probed 2026-10-12); every
// case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const servicenowKit: CompanyKit = {
  id: "servicenow",
  domainId: "saas",
  name: "ServiceNow",
  tagline: "Enterprise workflow platform: ITSM analytics",
  accent: "text-lime-300",

  brief: [
    "**ServiceNow** is the workflow layer of the enterprise — ITSM first (incident, problem, change), then HR, security and customer service, all running on one task-based data model where every record is a ticket with a state, an assignee and a clock. The analytics reality is *assurance under SLA*: how much is open, how old is it, and did we beat the clock. On this storefront db the mapping is honest: 16 enterprise accounts raise 103 incident tickets folded from 251 work-log lines, and the status mix reads like a resolution ledger — 52 {emerald:resolved} (50.5%), 30 fix-applied-in-verification (29.1%), 14 {amber:awaiting requester} (13.6%), 7 {rose:closed unresolved} (6.8%).",
    "The data org splits three ways. Service-ops analytics owns the volume folds: work-log lines joined to catalog items and aggregated per ticket — the busiest catalog family carries 121 lines across 54 tickets, the highest-billing family closes 97 lines worth **11,744.01**. Delivery analytics owns the aging math: 82 of 103 tickets carry a work-completion stamp, averaging **2.98 days** from raise to fix, range 2 to 4 — and the other 21 are the backlog the review actually argues about. Billing analytics owns the account book: 28 `invoices` against 27 `payments`, INTEGER cents throughout, with 6 never-settled bills worth 15,217 — one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it.",
    "Interview style is aging-then-denominator, then the reconciliation join. A screen opens with a two-grain census (EU carries 45 tickets from just 8 accounts; the US, 19 from 2), escalates into a conditional-count resolution rate with the denominator asked out loud ('does an {rose:unresolved} ticket sit in your base?'), then the aging board — `julianday(shipped_at) - julianday(created_at)` with the NULL policy stated before the average is computed. Follow-ups probe the anti-join that finds tickets with no work logged, and why RANK's shared rungs matter when four accounts tie. Candidates who state the population before computing are the ones who get callbacks.",
    "Preparation strategy: the registry tags zero SQL problems for ServiceNow — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems mirror known ITSM screens — ticket censuses, resolution-rate counting, catalog demand, aging windows, backlog anti-joins and billing reconciliation. Then run both case studies on the live db: one rebuilds the aging board the service review opens with, the other rebuilds the resolution-funnel census leadership signs the quarter with. The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
    "**The economics under the queue** explain the interview's obsession with concentration. Lifetime ticket value is **34,833.28** across the 103 raised, averaging 338.19 — and it piles up fast: 63.5% of value sits with accounts above the 3,000 lifetime line, 71.2% above 2,000. Territory tells the same story at another grain — EU bills 15,089.23 from 8 accounts, APAC 11,605.45 from 5, the US 7,286.16 from just 2, LATAM 852.44 from 1 — so a `GROUP BY region` and a `COUNT(DISTINCT customer_id)` are two different claims about the same map. The billing book closes the loop: 28 invoices, 66,443 settled in full against 15,217 never touched, card settlements (16 worth 37,364) edging wire (11 worth 32,248), and a ledger tying out at 181,080 on both sides — {violet:revenue} only balances because every anomaly (#25's partial 4,000 of 6,148, #28's paid-with-nothing) is chased to the row.",
    "Preparation now runs in two passes. **Pass one** is the denominator gym: rebuild the resolution census (52 of 103), the two-grain territory fold (EU 45 from 8, US 19 from 2), and the stamped-only aging board (82 tickets at 2.98 days) until each ships with its population stated in a comment. **Pass two** is the case gauntlet — six rebuilds spanning the four added families: a scalar-subquery above-average screen, the month-bucketed incident calendar, a `DENSE_RANK()` leaderboard with its tie policy argued aloud, and a one-pass `FILTER` census of the invoice book. The upgrade this expansion drills is *consequence thinking*: every distractor you reject should break for a reason you can name — a swapped denominator, a merged year, a shared rung, a missed cent.",
  ],

  dayInLife: [
    "**08:00 —** The morning starts on SLA health. A service-ops analyst opens the aging dashboard before the standup: did last night's fixes get stamped, does the {emerald:resolved} count (52 of 103) reconcile with what billing invoiced, and did any territory's unresolved share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — status counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is aging surgery. The service review wants the board refreshed — tickets joined to accounts, work stamp required, `julianday(shipped_at) - julianday(created_at)` averaged per account with the NULL policy spelled out: 82 of 103 tickets carry a stamp, the 21 without it are *the backlog, not a rounding error*. An account lead wants the two-grain census re-cut (EU: 45 tickets from 8 accounts — intensity 5.6); a catalog owner wants work lines and dollars side by side, because 'volume is up' means nothing until lines price into effort. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:00 —** The afternoon tilts toward the change board and stakeholder cycles. The catalog review walks the service table with SQL attached to every bar — which families carry the most lines, which bill most, where the mid-price band (8 SKUs averaging 111.5) sits against the budget band (8 at 32.06); the billing desk walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the invoice base?* This is the hour ticket numbers meet the people who fund them.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The backlog query ships with its survival rule in the comment (rows whose join finds no work-log ARE the finding); the anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the void bill with one (#11, 925.00); and tomorrow's follow-ups are queued per account. The rhythm to internalize: ServiceNow SQL exists to prove that resolution and billing agree — *the ticket and the invoice are the same story told at two grains.*",
    "**21:30 —** The late shift is trust-but-verify on automation. Before signing off, the analyst re-runs the day's scheduled jobs by hand against a fresh snapshot: the aging rollup, the AR anti-join (still 6 bills, 15,217 — and #28 still claiming {emerald:paid} with no settlements behind it), and the one-pass invoice census whose classes must sum back to 28 bills. Overnight the workflow engine stamps whatever it stamps; *the point of the 21:30 re-run is that tomorrow's 08:00 reconciliation starts from a baseline someone proved by hand.* The last query written each night is the invariant check — counts and sums, both grains, no exceptions.",
  ],

  metrics: [
    { name: "Open incident load", what: "Tickets and work-log lines on the calendar: 103 tickets, 251 lines from 16 accounts. The volume read every capacity and staffing claim starts from." },
    { name: "Resolution rate", what: "Resolved ÷ ALL tickets: 52 of 103 (50.5%). The denominator is the interview — 52 of 89 worked (58.4%) is a different metric with a different name." },
    { name: "Ticket aging", what: "Days from raise to work stamp on stamped tickets: 82 of 103, averaging 2.98 days, range 2 to 4. The SLA clock the whole review argues with." },
    { name: "Unresolved share", what: "Closed-unresolved ÷ all: 7 of 103 (6.8%). Cut by territory: APAC 8.1% highest, LATAM 0 — the breach map leadership reads first." },
    { name: "Territory cohort mix", what: "Tickets and accounts per territory — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The two-grain census separating load from audience." },
    { name: "Worked-account concentration", what: "Share of ticket value from the heaviest accounts: 63.5% sits above the 3,000 line, 71.2% above 2,000. Where the aging board's risk actually lives." },
    { name: "Unsettled AR", what: "Bills with no payment rows: 6 worth 15,217 — and one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the billing standup runs on." },
    { name: "Settlement speed", what: "Days from issue to first payment on settled bills: 20 settle in 28.4 days on average, fastest 13, slowest 84 — against uniform 30-day terms." },
    { name: "Monthly cadence band", what: "Raised volume holds a 6-to-9 corridor across 14 closed months; the 3,731.97-effort January 2024 peak and the 1,193.86 July floor frame the staffing envelope every capacity claim walks inside." },
    { name: "Settlement classes", what: "Every bill lands in exactly one class — 21 exact, 1 partial (4,000 of 6,148), 6 never touched — and the classes must sum back to the 28-bill base or the close stops." },
    { name: "Payment channel mix", what: "Card settles 16 bills worth 37,364; wire settles 11 worth 32,248 — the split the billing desk reconciles before any dunning cycle fires." },
    { name: "Silent-zero confidence", what: "The anti-joins that return zero on purpose: 0 accounts without tickets, 0 catalog items never worked. A confident zero, proven rather than assumed, is the baseline every backlog claim leans on." },
  ],

  topics: [
    {
      name: "Ticket-volume censuses",
      why: "Every ServiceNow screen opens with a fold: tickets, accounts, work-log lines — grouped and counted without letting the grain blur. COUNT(*) counts tickets, COUNT(DISTINCT customer_id) counts accounts; 103 tickets come from just 16 accounts, and the census is where candidates prove which grain they're standing on.",
      slugs: ["unique-orders-and-customers-per-month", "find-followers-count", "classes-more-than-5-students"],
    },
    {
      name: "Resolution-status conditional counting",
      why: "Resolved, in verification, awaiting requester, closed unresolved — every rate here is a conditional count over a state flag, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL tickets is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "reported-posts-ii"],
    },
    {
      name: "Joining accounts to incidents",
      why: "Tickets inherit account attributes through joins to the accounts table, and the join type decides who survives: a ticket with no account is corruption; an account with no ticket is a silent customer. Choosing INNER versus LEFT is a business statement.",
      slugs: ["combine-two-tables", "top-travellers", "employees-with-missing-information"],
    },
    {
      name: "Catalog demand & per-item effort",
      why: "Work-log lines carry catalog items, and the catalog story is a join-then-weigh fold: lines × unit_price per line, the top family billing 11,744.01 on 97 lines. The per-family census is how tooling and staffing decisions get funded.",
      slugs: ["product-sales-analysis-iii", "most-frequently-ordered-product-per-customer", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "The incident calendar",
      why: "Loads are calendar arithmetic: STRFTIME('%Y-%m') buckets over tickets against the 3,731.97-effort peak and the 1,193.86 floor. ServiceNow drills the month-bucket idiom because every staffing chart hangs on that spine — and a '%m'-without-year fold merges two years into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "tasks-count-in-the-weekend"],
    },
    {
      name: "Aging & SLA latency math",
      why: "The SLA clock is julianday arithmetic: work stamp minus raise stamp, 2.98 days on average across the 82 stamped tickets, range 2 to 4. The age-and-rank shapes here are how breach lists and oldest-first queues get built.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Backlog anti-joins",
      why: "Silence reads are anti-joins: tickets with no work logged, accounts with no tickets (0 on this db — and proving a confident zero is the job). The survival rule of the join IS the query; an INNER JOIN here deletes the finding, not the bug.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "SLA leaderboards & tie policy",
      why: "Aging boards rank accounts by load, and ties are real: four accounts sit at 4 tickets, two at 3. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "find-longest-calls", "department-top-three-salaries"],
    },
    {
      name: "Breach screens via subqueries",
      why: "Screens escalate into nested logic: tickets above the platform-average effort, accounts clearing a workload threshold. Scalar and HAVING-gated shapes each carry an empty-inner-query answer you are expected to give unprompted — the silent-zero-rows bug ships on staging tables.",
      slugs: ["orders-with-maximum-quantity-above-average", "second-highest-salary", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "Billing anomalies & cents discipline",
      why: "The row-level anomaly list is the source of truth: a void bill WITH a payment (#11, 925.00), a paid bill with none (#28, 1,756.00), one partial at 4,000 of 6,148. Every dollar read is amount_cents / 100.0 — the missing .0 eats cents on every odd-cent bill.",
      slugs: ["bank-account-summary-ii", "gl-reconciliation", "ar-aging-schedule"],
    },
    {
      name: "Multi-flag cohort screens",
      why: "Adoption-gap reads are set algebra over flags: accounts that filed through service family A and B but never through C are an EXCEPT / double-IN screen, and the flags here are catalog families, not booleans. The duplicate-investor shape — accounts appearing twice against the same holding — is the same census run in reverse: find the repetition, not the gap.",
      slugs: ["customers-who-bought-a-and-b-not-c", "investments-in-2016", "recyclable-and-low-fat-products"],
    },
    {
      name: "CASE pivots & band maps",
      why: "Every board this org ships is a CASE pivot: statuses into funnel stages, ticket ages into breach bands, weekdays into load columns. The salary-categories shape — CASE bands folded into a census — is the aging-band query in textbook clothing, and the weekday pivot is how every staffing chart in the review deck gets built.",
      slugs: ["count-salary-categories", "sales-by-day-of-the-week", "weather-type-in-each-country"],
    },
    {
      name: "Consecutive-day streaks",
      why: "Availability language is streak language: how many consecutive days did a territory stay clear of {rose:closed-unresolved} tickets, and on which date did the chain break. Contiguous-date folding — the gaps-and-islands trick of ordering days and subtracting row numbers — is the advanced shape behind every uptime chart ops publishes.",
      slugs: ["report-contiguous-dates", "patients-with-a-condition", "game-play-analysis-v"],
    },
    {
      name: "Latest-per-key reads",
      why: "Queues are constantly asked for each account's most recent touch — and the second-most-recent is the sharper question, because the ticket before last is the one whose verification slipped. MAX-then-join-back and keep-latest-dedupe are the two idioms drilled here until the fold-then-join grain is reflex.",
      slugs: ["second-most-recent-activity", "keep-latest-dedupe", "game-play-analysis-i"],
    },
    {
      name: "Catalog text hygiene",
      why: "Catalog items and requester addresses arrive messy, and every join downstream inherits the mess: TRIM/UPPER normalization before matching, rule-based validation before import. The product-name-format and valid-email shapes are this org's intake-quality screens — the queries that run before any of the others are allowed to trust a key.",
      slugs: ["fix-product-name-format", "invalid-tweets", "find-users-with-valid-e-mails"],
    },
  ],

  theory: [
    {
      id: "now-t1",
      q: "Your backlog report joins accounts to their incident tickets. When do you INNER and when do you LEFT — and what silently breaks if you filter a ticket column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A worked-ticket report joins tickets to accounts: a ticket with no account is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A silence report must be LEFT from accounts: the accounts with no tickets ARE the finding — a enterprise account that stopped filing is a churn signal — arriving with NULL ticket columns. The classic break: filtering status = 'delivered' in WHERE after a LEFT JOIN kills every NULL-payload account row — the LEFT JOIN quietly became an INNER and the silent accounts vanished. The fix is moving the predicate into ON or an outer query. On this db the never-ticketed anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "now-t2",
      q: "The ops census shows 103 tickets, 16 accounts and 251 work-log lines. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts work-log rows — 251; COUNT(DISTINCT o.id) folds them back to tickets — 103; COUNT(DISTINCT customer_id) folds further to accounts — 16. None is wrong: lines measure touch-level effort, tickets measure the incident queue, accounts measure the installed base. The ratios are the reads — 2.4 lines per ticket, 6.4 tickets per account — and they decide whether workload is broadening (more accounts filing) or deepening (more lines per ticket). The trap that catches candidates is quoting a line count as a ticket count in a trend; one ticket with three work-log lines is one queue row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "now-t3",
      q: "The service review wants accounts carrying at least ten open tickets. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'pending' discards resolved and in-verification tickets before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-ticket floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a backlog line and an error, and between a threshold applied to tickets versus to accounts. The strong answer places every filter by asking: is this a fact about one work-log line, or about an account's whole fold?",
      tag: "pipeline",
    },
    {
      id: "now-t4",
      q: "You rank accounts by ticket load and four of them tie. RANK, DENSE_RANK or ROW_NUMBER for the board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied accounts the same rank and skips — the four-way tie at 4 tickets reads 5, 5, 5, 5 and the next distinct count would land at 9, implying phantom accounts that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 5, 5, 5, 5 and the next distinct count is 6. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which account gets flagged first in the ops queue. On this db ties are structural: the ladder runs 24, 17, 14, 13, 5, then four accounts at 4. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "now-t5",
      q: "A ticket sits 'pending' with no work stamp yet. What is your NULL policy for the aging report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only tickets with a work-completion stamp have an age, so the report measures stamped tickets and says so — on this db 82 of 103 carry a stamp, averaging 2.98 days, range 2 to 4; 14 await the requester, 7 closed unresolved. Then mechanics: AVG ignores NULLs, so AVG over ALL tickets returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) IS the backlog count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the age to zero to 'fix' the average — that publishes instant resolution for tickets still waiting, and an SLA report built that way is a lie with decimals. A report whose WHERE clause is doing definitional work without saying so is exactly what a ServiceNow reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "now-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 tickets always produce an average. On filtered staging tables — one territory, one catalog family, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each bill to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "now-t7",
      q: "The load trend buckets tickets by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the load curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's tickets, and month-end is exactly when backlog lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a load walk. Date discipline is capacity discipline: the spine, the window and the edge row are where ITSM reports go wrong.",
      tag: "dates",
    },
    {
      id: "now-t8",
      q: "The billing desk says a paid invoice has no payment rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 4,937.00 print into 4,937 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between systems, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "now-t9",
      q: "The adoption-gap ask: accounts that filed through the Audio service family but never through Accessories. EXCEPT, NOT IN, or NOT EXISTS — and which NULL trap comes with which?",
      a: "All three can say 'in the first set and not the second', and the differences are the interview. EXCEPT compares full projected rows and dedupes both sides — honest for set-of-accounts questions, wasteful if you select * and accidentally compare columns you never meant. NOT IN dies silently when the inner list can contain NULL: x NOT IN (1, NULL) is never TRUE, so one NULL catalog id empties the whole screen — the classic outage report that returns zero rows and looks like good news. NOT EXISTS is the NULL-safe default and reads the survival rule out loud. On this db every catalog item has work logged, so the excluded side can legitimately be empty — and the strong answer states what an empty right side MEANS before shipping the query: an empty gap screen is either a clean bill of health or a broken predicate, and the query comment says which one it claims to be.",
      tag: "set-ops",
    },
    {
      id: "now-t10",
      q: "You add a running ticket-load column with SUM(COUNT(*)) OVER (ORDER BY month). What frame is the engine using when you omit the ROWS clause, and when does that default lie?",
      a: "With ORDER BY inside OVER and no frame clause, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — peers included. On a month spine that is what you want: every row of the current month shares the same running total. It lies when the ORDER BY key has duplicates you did not intend as peers — two tickets sharing a created_at timestamp both absorb each other's load at that boundary, and the running sum double-counts the step. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW pins the frame to physical rows and kills the peer effect. The ServiceNow habit: the running backlog column, the moving-average column and the cumulative-effort column all name their frame in a comment, because a frame nobody named is a number nobody can defend when the board is challenged in the review.",
      tag: "windows",
    },
    {
      id: "now-t11",
      q: "COUNT(*) FILTER (WHERE status = 'delivered') versus SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — same answer, so why does the census standard prefer FILTER?",
      a: "Same number, different readability and different failure surface. The CASE idiom repeats the status literal once per measure, so a six-column census carries six chances to paste the wrong literal — and ELSE 0 means a typo'd arm silently returns zeros instead of erroring. FILTER (WHERE ...) names the predicate once per aggregate, keeps the aggregate and its population on one line, and is the one-pass shape the reconciliation census uses: bills, open, paid, void and the dollar sums in a single scan of the invoice table — 28 bills, 6 open worth 19,609, 21 paid worth 66,443, 1 void. The honest caveat: FILTER is the newer grammar and some engines in the estate still want the CASE form, so the standard is FILTER-first, CASE-fallback — and the release check proves the two agree cell for cell before either ships.",
      tag: "aggregation",
    },
    {
      id: "now-t12",
      q: "The billing desk's invoice total came back high after joining payments. What happened, and what is the fix?",
      a: "Fan-out: five invoices on this db settle in two payments (the split set 1, 5, 12, 19, 22), so invoices JOIN payments multiplies those rows — SUM(amount_cents) counts the invoice amount once per settlement row. On a joined grain, COUNT(*) counts settlement rows, not bills: 27 payments against 28 invoices, and only a pre-aggregated fold keeps them straight. The fix is fold-then-join: aggregate payments per invoice first (SUM and COUNT — the split set visible as n > 1), then join the one-row-per-invoice rollup; or aggregate after a join that provably does not multiply. The tells that you fanned out: a SUM that changes when you add a column to the SELECT, and a total that differs between two queries that should agree. Reconciliation culture says the disagreement IS the deliverable — the query that shows which invoices split is what gets attached to the close.",
      tag: "joins",
    },
    {
      id: "now-t13",
      q: "Correlated EXISTS versus a JOIN with DISTINCT versus IN — for 'accounts that filed at least one high-value ticket', which do you reach for and why?",
      a: "EXISTS is the semantic fit: 'there exists a qualifying ticket' short-circuits on the first match, never multiplies rows, and needs no DISTINCT repair. The JOIN version silently fans out — an account with five qualifying tickets appears five times — and the DISTINCT you bolt on is a confession that the join changed the grain. IN is fine when the inner list is small and NULL-free, but it materializes the whole inner set and carries the NOT IN NULL trap the moment the screen flips to its negative. On this db a 'high-value' bar against the 1,088.44 max or the 338.19 average is a per-row predicate — EXISTS states it once, inside, where the reviewer can see the population. The answer the panel wants: EXISTS for existence, JOIN for contribution (counts, sums), and never both at once in the same query.",
      tag: "subqueries",
    },
    {
      id: "now-t14",
      q: "created_at and shipped_at are TEXT timestamps. Where does date arithmetic go wrong on this schema, and what is your checklist?",
      a: "Four places. Unit confusion: julianday() yields fractional days — the 2.98-day aging average — while naive subtraction of two TEXT stamps does string arithmetic or yields nonsense; never mix the two clocks. Truncation: SUBSTR(created_at,1,7) is the month spine (14 buckets, 2024-01 through 2025-02); '%m' alone merges two Januaries into one lie. Window edges: BETWEEN '2024-03-01' AND '2024-03-31' drops the last night's tickets — half-open intervals (>= start AND < next boundary) are the house rule, because month-end is exactly when backlog lands. Sorting: ISO TEXT stamps sort correctly, the one free lunch here — but the moment a writer stores a locale format, ORDER BY becomes fiction. The checklist ships as a comment on every date query: unit, spine, window edge, sort order — and the reviewer checks the comment before the numbers.",
      tag: "dates",
    },
    {
      id: "now-t15",
      q: "A staging load leaves one customer_id NULL in a temp table. Which of tomorrow's reports break — and which break silently?",
      a: "Every NOT IN against that temp table breaks silently: x NOT IN (SELECT id FROM tmp) with one NULL in the list returns zero rows — not an error, just an empty board that reads as 'no backlog', the most dangerous shape in ITSM reporting. IN survives (x IN (..., NULL) still matches non-NULL members) but its NOT twin does not, which is why the two are never treated as symmetric here. JOIN-based reports degrade gracefully — the NULL row simply fails the equality and drops out of an INNER, rides along with NULL payloads in an OUTER — visible if you look, invisible if you don't. The house defenses: NOT EXISTS instead of NOT IN, a COUNT(*)/COUNT(id) gap check on any temp table before it feeds a board, and a rule that silent emptiness gets escalated like a crash. The zero that arrives without its proof query is a bug wearing a clean shirt.",
      tag: "nulls",
    },
    {
      id: "now-t16",
      q: "SELECT COUNT(*) AS tickets ... HAVING tickets >= 9 works, but WHERE tickets >= 9 does not. Why — and why is relying on it a portability bet?",
      a: "The logical pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — aliases are born in SELECT, so WHERE (which runs before) cannot see them, while HAVING and ORDER BY (which run after) can, in SQLite. The portable discipline: aggregate expressions are written out where they are judged (HAVING COUNT(*) >= 9), aliases reserved for ORDER BY and for outer query layers where they are real columns. Relying on SQLite's HAVING-alias leniency is a bet that every future engine — the warehouse the billing copy lands in, the CI linter, the reader's REPL — shares its parser, and that bet loses the day the query is ported. On this db the 9-gate keeps the 24/17/14/13/9 ladder intact, and the query comment names the gate and the clause it lives in. The strong answer gives the pipeline order first, then the dialect caveat, then the portable rewrite.",
      tag: "pipeline",
    },
    {
      id: "now-t17",
      q: "What is an 'invariant query' in this org's reporting culture, and which two run every night on the billing book?",
      a: "An invariant query is a check whose expected answer is a constant — the query exists to prove the constant, and any other result is an incident, not a number. The two nightly billing invariants: the class-sum check (exact 21 + partial 1 + untouched 6 must equal the 28-bill base, with the dollar folds re-adding to the book) and the status-versus-rows check (no bill claims 'paid' with zero payment rows, no void bill carries one — #28 at 1,756.00 and #11 at 925.00 are the canonical breaches). Invariants differ from dashboards in failure semantics: a dashboard drifting starts a conversation, an invariant failing pages someone. The craft is choosing checks that are cheap (one scan), grain-safe (pre-aggregated against fan-out), and that fail loudly — one row, one boolean, not a chart someone might not open. If the failure needs interpretation, it is a dashboard wearing a uniform.",
      tag: "quality",
    },
    {
      id: "now-t18",
      q: "The aging report slowed down after someone 'optimized' it. What are the first three things you look for?",
      a: "First: predicates that hide the column — WHERE julianday(shipped_at) - julianday(created_at) > 3 wraps both columns in functions, so no index on either can serve the filter; the sargable rewrite compares raw stamps against a computed boundary and lets the index work. Second: a JOIN whose drive direction changed — joining all 251 work-log lines to tickets before filtering statuses scans lines that were never candidates; filter early, join late, and check the plan says so. Third: a DISTINCT or GROUP BY bolted on to repair a fan-out the join should never have created — the dedupe costs a sort on every run and hides a grain bug. On a 103-ticket db these are teaching scales, but the instinct is the interview: run the plan, find the step whose row count does not drop, and say what you would index (status, created_at) and why the planner might still refuse it at this size.",
      tag: "performance",
    },
    {
      id: "now-t19",
      q: "Two dashboards report different resolution rates for the same quarter — 50.5% on one, 58.4% on the other. Walk me through your first fifteen minutes.",
      a: "The numbers reveal the definitions: 52 of 103 (all raised) versus 52 of 89 (the worked subset — resolved plus in-verification, awaiting excluded). So the first fifteen minutes are definition archaeology, not debugging: read both queries, name each denominator out loud, and confirm both computations are correct for their definitions — they usually are. Then the decisions: which definition does leadership sign (the house one — all raised, 50.5%), where did the second come from (usually a filter added for one meeting that calcified), and what is the fix — one canonical versioned query both dashboards call, or a metric registry entry that states the denominator in the name ('worked-ticket resolution rate'). The interview point: a metric disagreement is almost never an arithmetic bug; it is an unstated denominator that finally met its twin. Candidates who re-compute before reading definitions spend fifteen minutes proving two right answers disagree.",
      tag: "metrics",
    },
    {
      id: "now-t20",
      q: "The close packet stacks three regional rosters with UNION, and the packet's row count is short. What changed, and what is the stack rule?",
      a: "UNION dedupes across the whole stack and sorts — so a row appearing in two regional rosters collapses to one, and the packet's arithmetic no longer sums to its parts. The rule: UNION ALL for stacks whose parts are meant to add up — regional rosters, month slices, the grand-total row appended under a detail list — and UNION only when 'the set of distinct things' is literally the question. The stack discipline on this db: every branch projects the same column list in the same order (account, tickets, region), a literal tags each branch so the packet reads top-down, and the grand-total branch is labelled so it cannot be mistaken for a detail row. UNION's implicit DISTINCT also costs a sort the packet never asked for. The failure signature of the wrong choice: the whole is less than the sum of the parts, and nobody can name which rows vanished — which is exactly the meeting you do not want at close.",
      tag: "set-ops",
    },
    {
      id: "now-t21",
      q: "The review wants accounts in load quartiles. NTILE(4) over the 16 accounts — how do the buckets land, and when does NTILE beat CASE bands?",
      a: "NTILE(4) orders the 16 accounts by ticket load and deals them into four buckets of exactly 4 — 24, 17, 14, 13 in the top tile, the 4-ticket tier sliding down — with no thresholds chosen by hand. It beats CASE bands when the bands must be population-defined rather than value-defined: 'worst quartile' survives a data change, while a CASE written against today's 24-ticket max silently stops marking anyone once loads drop. CASE wins when the bands are business constants — SLA breach at more than 3 days is a contract, not a quartile — and when the band edges must be printed in the report. The trap with NTILE is ties: accounts with equal counts straddle tile boundaries by internal row order, so a quartile claim about the 4-ticket tier needs the tie policy named. The strong answer asks which question is being asked — relative standing (NTILE) or contractual bands (CASE) — before writing either.",
      tag: "windows",
    },
    {
      id: "now-t22",
      q: "A stakeholder wants each ticket's work-log rendered as one line of text. GROUP_CONCAT — what works, what bites, and what do you ship instead?",
      a: "GROUP_CONCAT(line) folds the work-log rows into one separator-joined cell, and it is genuinely useful for review artifacts — one row per ticket, history visible without a page break. What bites: the order of concatenation is unspecified unless the query forces it (newer SQLite accepts ORDER BY inside the aggregate; older builds need a pre-sorted subquery — and 'unspecified' means it can change between runs), a comma separator collides with commas inside work notes, and long transcripts can hit length caps that truncate silently. So the ship decision: GROUP_CONCAT for human-readable packets, with an explicit separator and a comment naming the order dependency; a rows-per-ticket result (or JSON aggregation) for anything a process will parse. The interview point is that the fold is presentational — the grain underneath is still one row per work-log line, 251 of them, and no census may ever be run on the folded copy.",
      tag: "aggregation",
    },
    {
      id: "now-t23",
      q: "You want only the top-ranked rung per territory — filtering WHERE load_rank = 1 fails. Why, and what are the two honest fixes?",
      a: "Because window functions are evaluated at SELECT time — after WHERE — so the rank column does not exist yet when the filter runs; the query errors, or in dialects that allow alias reuse it silently filters on something else. Fix one is the derived-table wrap: compute ranks in an inner SELECT, filter the alias in the outer WHERE — exactly the leaderboard shape of rank-accounts-by-tickets, then gate tickets >= 3 outside. Fix two is the CTE: stage the ranked set, filter in the following SELECT — same semantics, better readability for multi-step boards, and the CTE name documents the stage. What is never honest: recomputing the rank inside WHERE, or hand-waving a MAX-based substitute that changes the tie semantics. The ServiceNow flavor: per-territory oldest ticket, per-queue top talker, per-account first response — every top-per-group board is this pattern, and the wrap layer is where its tie policy lives in writing.",
      tag: "windows",
    },
    {
      id: "now-t24",
      q: "The same bill prints 4,937 on the close report and 4,937.00 on the audit copy. Where did the cents go, and what is the type discipline?",
      a: "The cents went into integer division: amount_cents is an INTEGER, 493700 / 100 is integer arithmetic = 4937, and the .0 promotion (/100.0) that yields 4,937.00 was skipped somewhere in one pipeline. The discipline: money stays INTEGER cents end to end — sums, comparisons, joins — and conversion to dollars happens exactly once, at the presentation edge, always as cents / 100.0 with ROUND(..., 2). REAL money columns are the alternative everyone regrets: binary floats make 0.1 a liar, and two paths that sum the same bills can disagree in the twelfth decimal — a reconciliation nightmare. Mixed types are worse: a CASE that returns cents in one arm and dollars in another compiles fine and audits wrong. On this db the invoice and payment books are INTEGER cents — the 86,977-cent book ties to the 925.00 void bill only if you divide once, correctly. The rule stated as an invariant: convert once, at the edge, with the .0.",
      tag: "types",
    },
  ],

  mcqs: [
    {
      id: "now-mcq-1",
      prompt: "A ticket's status column reads 'pending'. In ITSM workflow language, what is it?",
      choices: ["Resolved and verified", "Fix applied, awaiting verification", "Awaiting the requester — the clock is on the user", "Closed without resolution"],
      answer: 2,
      why: "This kit's status map is fixed: delivered = resolved (52 of 103 tickets), shipped = fix applied and awaiting verification (30), pending = awaiting requester (14), cancelled = closed unresolved (7). 'Pending' is the state where the ball is in the user's court.",
      notes: [
        { choice: 1, why: "Fix-applied-but-unverified is 'shipped' — 30 tickets with work stamps already on them. Counting awaiting-user tickets as worked inflates every throughput number." },
        { choice: 3, why: "Closed-unresolved is 'cancelled' — 7 tickets. Pending tickets are still open and still count in the SLA population; closed-unresolved left it." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-2",
      prompt: "Resolution rate is defined as resolved ÷ which population? The db holds 52 resolved and 7 closed-unresolved of 103 tickets.",
      choices: ["Resolved + closed-unresolved only (52/59 = 88.1%)", "All tickets raised (52/103 = 50.5%)", "In-verification tickets only", "Distinct accounts (52/16)"],
      answer: 1,
      why: "The house definition: resolved ÷ ALL tickets, awaiting-user and in-verification traffic included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the WORKED-tickets resolution rate — a legitimate separate metric, but calling it 'the resolution rate' inflates 50.5% to 88.1% by quietly deleting 14 awaiting and 30 in-verification tickets. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is resolved tickets per account — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-3",
      prompt: "EU carries 45 tickets from 8 accounts. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts ticket rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between the columns — 5.6 tickets per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ticket has an account. Without DISTINCT both columns read 45 and the census loses the coverage story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is tickets AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued tickets", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every territory's resolution share truncates toward 0 and the whole map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-5",
      prompt: "Keep only accounts carrying at least 10 tickets. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE tickets >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A ticket-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded ladder — 24, 17, 14, 13 tickets — clears such a bar per account.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'tickets' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-6",
      prompt: "An invoice row reads amount_cents = 493700. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 4,937.00. The .0 is the entire fix — integer ÷ integer truncates, and every odd-cent bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "493700 / 100 is integer division = 4937 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 49,370,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-7",
      prompt: "The backlog list is built as accounts LEFT JOIN tickets WHERE the ticket id IS NULL. What happens if a teammate rewrites it with INNER JOIN?",
      choices: ["Same list, faster — INNER JOIN is equivalent here", "Empty list — the accounts with no tickets fail the join and vanish", "All 16 accounts — the join direction flips", "An error — INNER JOIN needs an ON clause with IS NULL"],
      answer: 1,
      why: "The backlog list IS the anti-join: accounts whose join finds no ticket survive only under LEFT JOIN + IS NULL. INNER JOIN drops exactly those rows — on this db that list is empty (every account has filed), and the rewrite hides the fact that the check ran at all.",
      notes: [
        { choice: 0, why: "INNER and LEFT differ precisely on the unmatched rows — which are the entire answer here. The rewrite deletes the finding, not the bug; a confident zero still needs the LEFT JOIN to be believable." },
        { choice: 2, why: "Join type never flips direction — it changes row survival. All 16 would need a CROSS JOIN, a different (and wrong) tool." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-8",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'void') runs against a staging table where the 'void' filter matches nothing. What does the report return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total tickets"],
      answer: 1,
      why: "The empty inner fold yields NULL, total > NULL is UNKNOWN, and WHERE passes nothing — an above-average report that ships empty-looking-but-valid. On filtered staging tables this bug is routine, which is why the inner fold's population is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the report LOOKS fine. Stricter engines error; the portable answer is to check the inner fold." },
        { choice: 2, why: "No comparison against NULL ever defaults to true — UNKNOWN is discarded by WHERE in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-9",
      prompt: "An analyst runs AVG(julianday(shipped_at) - julianday(created_at)) over ALL 103 tickets without filtering. What number comes back — and what is it called honestly?",
      choices: ["An error — julianday of NULL crashes", "The stamped-only average (2.98-ish) over a silently shrunken population — name it 'average age of stamped tickets'", "Zero — NULLs count as 0 days", "Exactly 2.98 over all 103 — NULLs don't matter"],
      answer: 1,
      why: "julianday(NULL) is NULL and AVG skips NULLs, so the average is computed over the 82 stamped tickets only — a real number wearing the wrong name unless the report says 'stamped tickets' (or filters shipped_at IS NOT NULL and says it).",
      notes: [
        { choice: 0, why: "julianday handles NULL by returning NULL — no crash, which is exactly why the bug is quiet. The report looks fine and measures a different population than it claims." },
        { choice: 2, why: "IFNULL-ing ages to zero is the 'fix' that publishes instant resolution — 14 awaiting and 7 unresolved tickets would drag the average toward zero and fake an SLA win." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-10",
      prompt: "An aging-band CASE runs WHEN julianday(shipped_at) - julianday(created_at) > 3 THEN 'breached' ... ELSE 'on time', over ALL tickets including never-stamped ones. Where do the 21 unstamped tickets land?",
      choices: ["'breached' — no stamp means overdue", "'on time' — the NULL comparison is UNKNOWN, so they fall to ELSE", "An error — CASE cannot compare NULL", "A separate NULL band is created automatically"],
      answer: 1,
      why: "For unstamped tickets the delta is NULL, NULL > 3 is UNKNOWN, no arm fires, and the row falls to ELSE — a breach report that files the backlog as 'on time'. That is why the no-stamp arm (shipped_at IS NULL) must be checked FIRST.",
      notes: [
        { choice: 0, why: "NULL is not 'overdue' — it is UNKNOWN, and UNKNOWN never satisfies a WHEN. Arm order is the only thing standing between the backlog and a clean bill of health." },
        { choice: 3, why: "CASE has no automatic NULL band — ELSE is the only catch-all, and it is already labeled 'on time'. Unstated ELSE semantics are the oldest CASE trap there is." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-11",
      prompt: "The adoption-gap screen: accounts that filed through the Audio service family but never through Accessories. Which construct is the honest set difference?",
      choices: ["EXCEPT over the two account sets", "INNER JOIN between the two family rosters", "UNION of the two family rosters", "COUNT(DISTINCT) across both families"],
      answer: 0,
      why: "EXCEPT keeps rows present in the first set with no match in the second — exactly 'filed A and not B'. A join keeps accounts in BOTH families (the opposite of the ask), UNION merges the populations, and COUNT(DISTINCT) loses the membership list entirely.",
      notes: [
        { choice: 1, why: "An INNER JOIN on account answers 'filed through both families' — the intersection, which is the complement of the gap screen. Set subtraction needs EXCEPT, NOT EXISTS or the double-negative IN form." },
        { choice: 2, why: "UNION answers 'who touched either family' — it merges audiences instead of subtracting them, and an account in both sets appears once rather than being excluded as not-a-gap." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-12",
      prompt: "Why does the close packet stack month slices with UNION ALL rather than UNION?",
      choices: ["UNION ALL is faster to type", "UNION dedupes across branches — identical-looking rows from different slices would collapse, and the packet stops summing to its parts", "UNION cannot stack more than two branches", "They are interchangeable for this packet"],
      answer: 1,
      why: "The packet's arithmetic depends on every branch's rows surviving. UNION's implicit DISTINCT removes legitimately repeated rows across branches and sorts as a hidden cost; UNION ALL keeps the parts additive.",
      notes: [
        { choice: 0, why: "Typing speed is not a correctness argument — the packet comes up short precisely because UNION removed rows, not keystrokes. The dedupe is the bug, not a feature." },
        { choice: 2, why: "UNION chains any number of branches; the two-branch limit is fiction. The real difference is dedupe semantics, not arity." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-13",
      prompt: "GROUP_CONCAT folds a ticket's work-log lines into one text cell. What is the honest caveat on the shipped report?",
      choices: ["It errors when a ticket has more than one line", "Concatenation order is unspecified unless the query forces it — and the fold is presentational, never a census base", "It only works on numeric columns", "It replaces the need for the work-log table"],
      answer: 1,
      why: "The fold is a display convenience: the census still counts 251 work-log lines at their own grain, and without an explicit ORDER BY the line order inside the cell is not guaranteed between runs.",
      notes: [
        { choice: 0, why: "GROUP_CONCAT folds any number of rows — one line or twenty — into the cell; multiplicity is the point, not an error condition." },
        { choice: 2, why: "It aggregates text natively; numbers are the side that needs casting. The real risks are order, separators and silent truncation on long transcripts." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-14",
      prompt: "NOT IN (SELECT customer_id FROM staging) returns zero rows after a staging load. First suspicion?",
      choices: ["The outer table is empty", "The inner list contains a NULL — x NOT IN (..., NULL) can never be TRUE, so the whole screen empties", "NOT IN is deprecated syntax", "The comparison collation flipped"],
      answer: 1,
      why: "One NULL in the inner list poisons NOT IN for every row: the comparison becomes UNKNOWN instead of TRUE. The fix is NOT EXISTS or a NULL guard on the inner table — and the silent-zero shape is why emptiness gets escalated like an error here.",
      notes: [
        { choice: 0, why: "The outer table rarely empties itself, and 'outer empty' would be visible in the source census. A NULL-poisoned inner list explains a zero that arrives without a cause — which is the dangerous direction." },
        { choice: 2, why: "NOT IN is standard SQL — the problem is NULL semantics, not deprecation. Swapping constructs without understanding the trap just relocates it." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-15",
      prompt: "SUM(COUNT(*)) OVER (ORDER BY month) builds a running load. Two adjacent months tie on the ORDER BY key. What does the default frame do?",
      choices: ["Splits the tie arbitrarily", "RANGE semantics include peers — both rows absorb each other's load at the boundary, and the running total double-counts that step", "Errors — ORDER BY keys must be unique", "Skips the duplicate rows"],
      answer: 1,
      why: "With ORDER BY and no frame clause the window is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — peers ride together. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW pins it to physical rows when the tie is not intended as a peer group.",
      notes: [
        { choice: 0, why: "Arbitrary splitting is ROW_NUMBER's habit, not the frame's — RANGE's peer inclusion is defined behavior, which is exactly why it double-counts instead of guessing." },
        { choice: 2, why: "Duplicate ORDER BY keys are legal — that is precisely when the default frame's peer inclusion shows up and the running total lurches at the tie." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-16",
      prompt: "The one-pass invoice census uses COUNT(*) FILTER (WHERE status = 'open'). Which CASE idiom must agree with it cell-for-cell?",
      choices: ["SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)", "COUNT(status = 'open')", "SUM(status = 'open')", "COUNT(*) WHERE status = 'open'"],
      answer: 0,
      why: "SUM of a 1/0 CASE is the classic pre-FILTER idiom and returns the same 6. COUNT(boolean) counts non-NULL booleans — TRUE and FALSE are both non-NULL, so it counts all 28; SUM(boolean) is a nonportable accident; and WHERE cannot attach to a single aggregate that way.",
      notes: [
        { choice: 1, why: "COUNT(expr) counts rows where expr is non-NULL — a FALSE comparison is still non-NULL, so this returns 28, not 6. The ELSE 0 of the CASE idiom exists precisely so zeros are countable by SUM." },
        { choice: 3, why: "WHERE filters rows before aggregation — a bare COUNT(*) with a WHERE needs its own pass over the table. FILTER (WHERE ...) exists to do per-aggregate filtering in one pass." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-17",
      prompt: "Compare each account's average ticket to the platform's 338.19 average. The uncorrelated scalar subquery — what does it guarantee?",
      choices: ["It recomputes the average per account for accuracy", "It computes once — one population (all 103 tickets), one number, printable as its own column beside the comparison", "It requires a JOIN to customers", "It only works inside HAVING"],
      answer: 1,
      why: "With no outer reference inside the subquery, the engine evaluates it once. Printing it as a column puts the denominator on the report itself, and the HAVING compares each account's AVG against that fixed population.",
      notes: [
        { choice: 0, why: "Recompute-per-row is the CORRELATED pattern — an outer reference inside the subquery. Without one there is nothing to re-evaluate; that is the efficiency and the honesty point." },
        { choice: 2, why: "The platform average needs only the tickets table — a JOIN adds grain without adding meaning. Correlation is about the outer reference, not about joining." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-18",
      prompt: "SELECT COUNT(*) AS tickets ... WHERE tickets >= 9. What happens and why?",
      choices: ["Works — aliases are visible everywhere", "Errors in standard SQL: WHERE runs before SELECT, so the alias does not exist yet; HAVING and ORDER BY run after and may see it", "Works only with a GROUP BY", "Returns NULL for tickets"],
      answer: 1,
      why: "The pipeline order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — aliases are born in SELECT, so WHERE cannot reference them. SQLite's HAVING-alias leniency is a dialect gift, not a guarantee; the portable form writes the aggregate out in HAVING.",
      notes: [
        { choice: 0, why: "Every engine that accepts this is doing you a favor it may withdraw in the next upgrade or linter pass. The safe query spells COUNT(*) in the HAVING and keeps the alias for ORDER BY." },
        { choice: 2, why: "A GROUP BY neither creates aliases earlier nor extends WHERE's visibility — the gate belongs in HAVING regardless of grouping." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-19",
      prompt: "Two accounts tie at 4 tickets and sit on a quartile boundary under NTILE(4) over 16 accounts. What is guaranteed about their placement?",
      choices: ["Both land in the lower tile — ties always fall down", "Nothing relative: NTILE deals by internal row order, so tied accounts can straddle tiles unless the tie policy is named", "NTILE errors on ties", "Both get the same tile number, like DENSE_RANK"],
      answer: 1,
      why: "NTILE is a distribution function, not a ranking function: it counts rows and deals them into buckets, using internal order to break ties — an accident, not a policy. A quartile claim about tie straddles needs an explicit tie-breaker inside the OVER.",
      notes: [
        { choice: 0, why: "There is no fall-down rule — the dealing order decides, and it is not contractual. A quartile report whose boundary placement can flip between runs is not a report." },
        { choice: 3, why: "That is RANK/DENSE_RANK semantics — shared rungs. NTILE never shares a boundary; it deals rows out one by one, which is exactly why ties straddle." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-20",
      prompt: "The aging band uses CASE WHEN delta > 3 THEN 'breached', but the review asks for 'worst quartile' instead. What changes conceptually?",
      choices: ["Nothing — quartile is a synonym for the > 3 band", "CASE bands are value constants (contract terms); NTILE quartiles are population-relative (recomputed from the data) — different definitions that diverge as the distribution moves", "Quartiles require a self-join", "CASE cannot produce four bands"],
      answer: 1,
      why: "The breach line at 3 days is a contract: it stays 3 when the data changes. A quartile recomputes — today's worst 25% is not tomorrow's. Choosing wrong either freezes a relative claim or relativizes a contractual one, and both drift silently.",
      notes: [
        { choice: 0, why: "They coincide today by luck of the 2-to-4-day range and diverge the moment loads shift — the classic definition drift this kit hunts in its metric-archaeology drill." },
        { choice: 2, why: "NTILE OVER is a window function — no self-join needed. The change is band semantics (relative versus contractual), not mechanics." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-21",
      prompt: "Invoices (28) join payments (27): five invoices settle across two payments each. What does COUNT(*) over the join return — and what counts bills?",
      choices: ["28 — joins never multiply", "33 — the five split invoices contribute two rows each; COUNT(DISTINCT invoice_id) counts the 28 bills", "27 — payments are the grain", "55 — every row doubles"],
      answer: 1,
      why: "Fan-out: each split invoice contributes two rows, 28 + 5 = 33 joined rows. The bill census needs the DISTINCT fold or a pre-aggregated payments-per-invoice rollup — the same fold-then-join rule the settlement classes use (21 exact, 1 partial, 6 none).",
      notes: [
        { choice: 0, why: "Joins multiply exactly when the right side repeats — the definition of a one-to-many fan-out. A too-high invoice total and a 33-row count are the same bug at two grains." },
        { choice: 2, why: "27 is the settlement-row count — a real grain, but 'bills' means invoices. The classes must sum back to 28, not 27, before the close signs." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-22",
      prompt: "The month spine is built with STRFTIME('%Y-%m', created_at). A teammate uses '%m'. What breaks?",
      choices: ["Nothing — both give 14 buckets", "'%m' merges January 2024 with January 2025 — the spine collapses to 12 buckets and two years read as one", "'%m' errors on TEXT timestamps", "'%Y-%m' rounds the dates"],
      answer: 1,
      why: "'%m' is month-without-year: 2024-01 and 2025-01 fold into one bucket, and the load curve halves its length while doubling its peaks. Year plus zero-padded month is the only honest spine on a multi-year table.",
      notes: [
        { choice: 0, why: "The bucket count is the tell: 12 versus 14 on this db. A spine that merges years turns any year-over-year read into fiction." },
        { choice: 2, why: "STRFTIME consumes TEXT timestamps natively — that is why this db needs no casting. The failure is semantic (bucket merge), not mechanical." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-23",
      prompt: "COUNT(status) versus COUNT(DISTINCT status) over the ticket table returns, respectively:",
      choices: ["103 and 4 — rows versus distinct workflow states", "4 and 103", "103 and 103", "4 and 4"],
      answer: 0,
      why: "COUNT(column) counts non-NULL rows — 103 tickets; COUNT(DISTINCT column) folds to distinct values — delivered, shipped, pending, cancelled = 4. The census column and the vocabulary column answer different questions.",
      notes: [
        { choice: 1, why: "Reversed — a fold always shrinks or holds, never grows. 103 rows cannot fold up to more than 103 distinct values." },
        { choice: 2, why: "Equality would require every ticket to carry a unique status — the four-state workflow is the whole point of the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-24",
      prompt: "Aging is julianday(shipped_at) - julianday(created_at). Why julianday and not direct date subtraction?",
      choices: ["julianday is faster", "The stamps are TEXT — direct subtraction does string arithmetic; julianday converts each stamp to a fractional day number, so 2.98-day averages and 2-to-4 ranges are real math", "julianday handles timezones", "date subtraction is deprecated"],
      answer: 1,
      why: "The stamps are TEXT. Subtracting TEXT yields nonsense or zero; julianday maps each ISO stamp to a real number where subtraction measures days — the SLA clock the whole review argues with. Fractional days are a feature: half-day aging survives the conversion.",
      notes: [
        { choice: 0, why: "Speed is irrelevant at this scale and beside the point — julianday is chosen for unit correctness, not performance." },
        { choice: 2, why: "The stamps are naive (no zone) — julianday neither adds nor fixes timezone semantics. The aging math is unit-correct, not zone-correct." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-25",
      prompt: "DENSE_RANK the 16 accounts by ticket count. The four accounts tied at 4 tickets share rank 6. What rank does the 3-ticket tier get?",
      choices: ["7 — dense ranks share rungs without gaps", "10 — RANK skips past the four tied rows", "11 — counting all rows", "6 — ties share everything"],
      answer: 0,
      why: "DENSE_RANK: 1 through 5 for 24, 17, 14, 13, 5 tickets, then 6,6,6,6 for the 4-tier, then 7 for the 3-tier — shared rungs, no gaps. RANK would give the 3-tier 10 (five distinct values before it, plus four tied rows). The board ships with its function named because the two ladders disagree exactly at ties.",
      notes: [
        { choice: 1, why: "That is RANK's answer — shared rungs WITH gaps. The point of naming the function is that 7 and 10 are both correct for different policies." },
        { choice: 3, why: "Ties share a rung, but the next distinct value still advances — dense or not. A ladder that never advances is a GROUP BY, not a ranking." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-26",
      prompt: "'Accounts with no delivered ticket' — LEFT JOIN + IS NULL versus NOT EXISTS. When are they equivalent?",
      choices: ["Never — one is always faster", "When the EXISTS predicate matches the join condition exactly and the keys are NULL-safe — both return the same account list", "Only with a GROUP BY", "Only in SQLite"],
      answer: 1,
      why: "Both are anti-joins and agree when the EXISTS predicate mirrors the join condition. NOT EXISTS is preferred as policy because it is NULL-safe by construction and states 'no qualifying row exists' in the grammar itself.",
      notes: [
        { choice: 0, why: "Performance is engine-dependent and not the equivalence question — semantics first, plan second. At 16 accounts both plans are instant anyway." },
        { choice: 2, why: "No grouping is involved in an anti-join — the ask is membership, not aggregation. GROUP BY appears after the anti-join, when the survivors get counted." },
      ],
      difficulty: "medium",
    },
    {
      id: "now-mcq-27",
      prompt: "AVG(amount_cents) / 100 versus AVG(amount_cents / 100.0) on the settled bills. Which is right, and what does the other do?",
      choices: ["Identical — division distributes over averages", "The divide-by-100.0 discipline is right: converting inside keeps REAL math — dividing an integer-cent average by bare 100 keeps the truncation habit that sheds cents on odd-cent books", "The first is right — averages are already dollars", "Both error — you cannot average cents"],
      answer: 1,
      why: "AVG over INTEGER cents promotes to REAL, but the /100 habit truncates on any non-integer result and on mixed paths. The invariant: money stays cents end to end and converts once, at the print edge, with 100.0 — the rule that makes the 925.00 void bill print as 925.00.",
      notes: [
        { choice: 0, why: "Division distributes over scaling, not over truncation — integer division loses the fraction before the scale ever sees it. Order of operations is the bug's home address." },
        { choice: 2, why: "AVG(amount_cents) is in CENTS — 65,612-class numbers, not dollars. The unit read is the first thing the audit checks." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-28",
      prompt: "One query must show each account's ticket count AND each account's share of its territory's total. Why does this need a window, not a GROUP BY?",
      choices: ["GROUP BY cannot compute counts", "The two measures live at different grains — the territory fold collapses accounts; a PARTITION BY region window keeps every account row while printing the territory total beside it", "Windows are faster", "GROUP BY requires a JOIN"],
      answer: 1,
      why: "A GROUP BY returns one row per territory — the account-level share has nowhere to live. SUM(tickets) OVER (PARTITION BY region) overlays the fold on the detail grain: 45 EU tickets printed next to each of the 8 EU accounts. Share = account tickets / partition total, one pass.",
      notes: [
        { choice: 0, why: "GROUP BY computes counts fine — it just cannot keep the rows it folded. The requirement is detail-plus-fold, which is the window contract." },
        { choice: 2, why: "Speed is not the axis — a window often costs more than the fold. The axis is output grain: 4 territory rows versus 16 account rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "now-mcq-29",
      prompt: "ORDER BY 2 in the census query means:",
      choices: ["Order by the literal 2 — a no-op", "Order by the second output column — the count, which reads biggest-first without naming the alias", "A syntax error", "Order by column number 2 of the underlying table"],
      answer: 1,
      why: "Positional ORDER BY references the SELECT list — column 2. It works and is terse, but the house style prefers the alias (ORDER BY tickets DESC) because positions silently shift when a column is added.",
      notes: [
        { choice: 0, why: "A constant ORDER BY is legal and does nothing — row order stays wherever the engine left it, not the read order the board needs." },
        { choice: 2, why: "Positional references are valid SQL — older style, deprecated in some shops, but not an error. The risk is fragility, not syntax." },
      ],
      difficulty: "easy",
    },
    {
      id: "now-mcq-30",
      prompt: "The nightly invariant says classes must sum back: 21 exact + 1 partial + 6 none = 28 bills. What makes the check an invariant and not a chart?",
      choices: ["It returns the 21 rows for review", "It returns one row whose value must be a constant (zero drift) — any other result pages someone, because the expected answer is fixed, not monitored", "It plots the classes weekly", "It counts payments instead of invoices"],
      answer: 1,
      why: "An invariant's expected output is a constant; the query exists to prove it. 'Classes sum to base' returning FALSE is an incident — unlike a dashboard, where drift starts a conversation. The check rides the settlement census's grain (28 bills, one class each, no fan-out).",
      notes: [
        { choice: 0, why: "Returning the offending rows is the drill-down AFTER the invariant fails — the invariant itself must be the boolean gate, or nothing pages." },
        { choice: 2, why: "A trend chart is the opposite commitment — it watches drift instead of declaring a constant. Invariants fail loudly; charts drift quietly." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-now-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The aging board for the service review",
      brief:
        "ServiceNow-flavored brief on the storefront db: the quarterly service review opens with the aging board — every account's ticket load and average raise-to-fix age, stamped tickets only, heaviest account first. Probed facts: 82 of 103 tickets carry a work-completion stamp (52 resolved + 30 fix-applied-in-verification); aging averages 2.98 days across them, range 2 to 4; the 21 unstamped tickets are the backlog and are excluded by an explicit filter, not by luck. The board gates at a nine-ticket floor so the review argues about real bookmakers, and the floor is inclusive — the account sitting exactly on it stays on the board.",
      ask: "Return each qualifying account with its ticket count and average aging in days — busiest account first, ties broken by the shorter average age.",
      template:
        "SELECT c.name AS account,\n       COUNT(*) AS tickets,\n       ROUND(AVG({1}), 2) AS avg_days_to_close\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE {2}\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY tickets {4}, avg_days_to_close ASC;",
      slots: [
        {
          answer: "julianday(o.shipped_at) - julianday(o.created_at)",
          kind: "keyword",
          label: "the aging expression",
          why: "Aging is the julian-day distance from raise to work stamp. Reversing the subtraction yields negative ages; using either bare TEXT timestamp yields a nonsense constant — the julianday pair is the only expression that measures the SLA clock.",
        },
        {
          answer: "o.shipped_at IS NOT NULL",
          kind: "keyword",
          label: "the stamped-only filter",
          why: "Only stamped tickets have an age — 82 of 103. The explicit filter states the population; relying on AVG's silent NULL-skipping measures the same rows while claiming all of them, which is exactly what the review rejects.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the minimum-ticket gate",
          why: "The nine-ticket floor keeps the four bookmaker accounts — 18, 13, 13 and 9 tickets — and the account sitting exactly ON the floor stays, proving the gate is inclusive. A 13 floor drops the 9-ticket account; a 10 floor drops it too.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The review reads the heaviest account first: 18 tickets aging 2.78 days on average. ASC would open the meeting on the smallest bookmaker — the least representative row of the queue.",
        },
      ],
      distractors: ["julianday(o.created_at)", "o.shipped_at IS NULL", "13", "ASC"],
      walkthrough:
        "One join, one honest clock. Tickets join to accounts, the WHERE keeps only the 82 tickets with a work stamp — the 21 unstamped (14 awaiting requester, 7 closed unresolved) are the backlog, excluded by a stated filter rather than AVG's silent NULL-skipping — and aging is julianday(shipped_at) - julianday(created_at), averaged per account against the probed 2.98-day platform mean and 2-to-4 range. The gate at 9 keeps four accounts: Alice's 18 tickets aging 2.78, Grace's 13 at 2.92, Emma's 13 at 3.08, Maya's 9 at 2.67 — the floor account proving the gate is inclusive, and the 13-13 tie broken by the shorter age. The distractors each break differently: julianday(o.created_at) ages tickets against the 1970 epoch — giant constant 'ages'; o.shipped_at IS NULL flips the population to the 21 unstamped and the board becomes the backlog it was built to contextualize; a 13 gate amputates the floor account; ASC opens the review on the smallest book.",
    },
    {
      id: "cs-now-2",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The resolution-funnel census",
      brief:
        "ServiceNow-flavored brief on the storefront db: leadership signs the quarter with a four-stage resolution funnel — every ticket classified resolved / in progress / awaiting requester / closed unresolved, with each stage's share of the 103-ticket base printed beside its count. Probed facts: 52 resolved (50.5%), 30 fix-applied-in-verification (29.1%), 14 awaiting requester (13.6%), 7 closed unresolved (6.8%). The census reads most-populous stage first, the share's denominator is the whole raised base (never the worked subset), and the CASE arms must map statuses in an order that lets each stage catch exactly its own rows.",
      ask: "Return each funnel stage with its ticket count and share of all raised tickets, biggest stage first.",
      template:
        "SELECT CASE\n         WHEN status = {1} THEN 'resolved'\n         WHEN status = 'shipped' THEN 'in progress'\n         WHEN status = {2} THEN 'awaiting requester'\n         ELSE 'closed unresolved'\n       END AS stage,\n       COUNT(*) AS tickets,\n       ROUND(100.0 * COUNT(*) / 103.0, 1) AS share\nFROM orders\nGROUP BY stage\nORDER BY tickets {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the resolved marker",
          why: "Resolved is the delivered status — 52 tickets. Substituting 'shipped' double-books work-in-progress as resolved (and starves the in-progress arm); 'cancelled' labels the 7 unresolved as the wins; 'void' matches nothing and dumps 30 tickets into ELSE.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting-requester marker",
          why: "Awaiting requester is the pending status — 14 tickets. 'void' matches nothing so pending falls to ELSE and inflates closed-unresolved to 21; an always-true arm like status = status swallows the whole base into one stage.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-stage-first direction",
          why: "Leadership reads the funnel biggest stage first: resolved 52, in progress 30, awaiting 14, closed 7. ASC would open on the 7 unresolved tickets — the smallest stage in the book.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "'void'", "status", "ASC"],
      walkthrough:
        "One fold, four arms, one denominator said out loud. The CASE maps each status to its funnel stage — delivered to resolved (52), shipped to in progress (30), pending to awaiting requester (14), and everything left — cancelled — to closed unresolved (7); the share column divides by the full 103-ticket base, printed at one decimal: 50.5, 29.1, 13.6, 6.8. The audit the close demands is that the stages sum back: 52 + 30 + 14 + 7 = 103. The distractors each break differently: 'shipped' double-books work-in-progress as resolved, zeroing the in-progress arm and swelling closed-unresolved to 59; 'cancelled' crowns the 7 failures as the wins and dumps all 52 resolved into ELSE; 'void' matches nothing, so the 14 awaiting collapse into ELSE and the funnel loses a stage; status = status is always true and the whole base lands in one bucket; ASC flips the read to lead with the smallest stage. The lesson under the lesson: shares are claims until the denominator is stated — 52 of 103 and 52 of 82 are both 'resolution rates' and only one of them is honest.",
    },
    {
      id: "cs-now-3",
      tier: "easy",
      topic: "q2",
      universe: "growth",
      title: "The above-average value screen",
      brief:
        "ServiceNow-flavored brief on the storefront db: the growth board wants the accounts whose average ticket value beats the platform mean — with the mean printed on the board itself so the denominator is never arguable. Probed facts: the platform average across all 103 tickets is 338.19; seven accounts clear it, led by Liam O'Brien's single 705.39 ticket and Chloe Dubois at 533.59 across 5, while Alice Chen — the 24-ticket load leader at 7,262.35 lifetime — averages only about 302.60 and does not qualify. The screen is a scalar subquery: one population, one number, computed once.",
      ask: "Return each account that beats the platform-average ticket value with its ticket count, average and the platform mean — highest average first.",
      template:
        "SELECT c.name AS account,\n       COUNT(*) AS tickets,\n       ROUND(AVG(o.total), 2) AS avg_ticket,\n       (SELECT ROUND(AVG(total), 2) FROM orders) AS platform_avg\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING {1} > {2}\nORDER BY avg_ticket {3};",
      slots: [
        {
          answer: "AVG(o.total)",
          kind: "keyword",
          label: "the per-account mean",
          why: "The per-account mean ticket value is the measure being screened — AVG over each account's fold. SUM would test lifetime spend (every account clears 338.19), MAX would test the single biggest ticket; both are real metrics wearing this metric's name.",
        },
        {
          answer: "(SELECT AVG(total) FROM orders)",
          kind: "keyword",
          label: "the platform-average subquery",
          why: "The scalar subquery fixes the denominator: all 103 tickets, computed once. Swapping it to MAX(total) (1,088.44) empties the board — no account averages above it; SUM(total) (34,833.28) empties it harder; both are honest numbers answering a different question.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-average-first direction",
          why: "The read opens on the highest average — Liam's 705.39 single-ticket account, the exact row that proves averages and loads disagree. ASC buries the headline under the 390.62 tail.",
        },
      ],
      distractors: ["SUM(o.total)", "MAX(o.total)", "(SELECT MAX(total) FROM orders)", "(SELECT SUM(total) FROM orders)", "ASC"],
      walkthrough:
        "Two averages, one denominator. Each account's AVG(total) is compared against the platform mean printed as its own column — 338.19 over all 103 tickets — and the HAVING keeps the seven accounts that beat it: Liam O'Brien's single 705.39 ticket, Chloe Dubois at 533.59 across 5, Farid Nasser 486.32 across 3, Olivia Brown 444.8, Bruno Silva 426.22, Pedro Alvarez 421.54, Emma Wilson 390.62 across 17. The lesson the board teaches: value-per-ticket and load are different ladders — Alice Chen's 24 tickets average only about 302.60 and do not appear. The distractors each break differently: SUM(o.total) in the comparison passes every account (all lifetime spends clear 338.19) and the screen stops screening; MAX(o.total) asks whether one big ticket beat the mean — a different, easier bar; swapping the subquery to MAX(total) empties the board (no account averages above 1,088.44), to SUM(total) empties it harder (34,833.28); ASC opens the read on the smallest average instead of the headline.",
    },
    {
      id: "cs-now-4",
      tier: "medium",
      topic: "t4",
      universe: "expense",
      title: "The incident calendar at the staffing bar",
      brief:
        "ServiceNow-flavored brief on the storefront db: the capacity review reads the incident calendar — every month bucketed by STRFTIME('%Y-%m'), with raised volume, resolutions and never-stamped backlog per month, gated at the 8-ticket staffing bar so the meeting argues about the heavy months. Probed facts: raised volume runs a 6-to-9 corridor across 14 months (2024-01 through 2025-02); six months sit at or above the bar — 2024-01, 2024-02, 2024-03, 2024-05, 2024-07, 2024-09 — carrying 8, 9, 8, 8, 8, 9 tickets and 2, 4, 4, 4, 2, 7 resolutions. The gate is inclusive: the month sitting exactly on 8 stays on the board.",
      ask: "Return each month at or above the staffing bar with its raised, resolved and never-stamped counts — calendar order.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       COUNT(*) AS raised,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS resolved,\n       SUM(CASE WHEN {2} THEN 1 ELSE 0 END) AS never_stamped\nFROM orders o\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY month {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the resolved marker",
          why: "Resolved is the delivered status — per month 2, 4, 4, 4, 2, 7 across the gated months. 'shipped' counts fix-applied-in-verification (a different stage), 'cancelled' counts the failures as wins.",
        },
        {
          answer: "o.shipped_at IS NULL",
          kind: "keyword",
          label: "the never-stamped test",
          why: "The never-stamped column is the backlog read: tickets with no work-completion stamp — 3, 1, 3, 0, 3, 0 across the gated months. IS NOT NULL flips it into the worked count; a status test measures workflow state, not the missing stamp.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the staffing-bar gate",
          why: "The 8-ticket bar keeps the six heavy months, and the months sitting exactly on 8 stay — the gate is inclusive. 7 adds four light months, 9 keeps only the two 9-ticket months, 6 floods the board with all 14.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "Calendar order — the spine reads top-down through time, which is how capacity is argued. DESC opens on 2025-02, the month with no runway behind it.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "6", "7", "9", "DESC"],
      walkthrough:
        "One spine, three folds, one gate. STRFTIME('%Y-%m') builds 14 monthly buckets; the CASE arms land per bucket: resolved via the delivered status (2, 4, 4, 4, 2, 7 across the six gated months) and never-stamped via the NULL shipped_at test (3, 1, 3, 0, 3, 0 — May and September ran clean, and April stayed clean but under the bar). The HAVING gate at 8 keeps 2024-01, 2024-02, 2024-03, 2024-05, 2024-07 and 2024-09 — six rows whose raised counts (8, 9, 8, 8, 8, 9) all appear on the board, including the two months sitting exactly on the bar. Distractor consequence: 'shipped' re-labels the in-verification stage as wins and starves the resolved arm; 'cancelled' crowns the failures; gates 6, 7 and 9 redraw the meeting's agenda to 14, 10 and 2 rows; DESC reads the calendar backwards.",
    },
    {
      id: "cs-now-5",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The SLA leaderboard and its tie policy",
      brief:
        "ServiceNow-flavored brief on the storefront db: the ops leaderboard ranks accounts by ticket load with an explicit tie policy — DENSE_RANK over the ordered counts, printed beside each account's lifetime effort, gated at the 3-ticket line so the board shows every multi-ticket tier. Probed facts: the load ladder runs 24, 17, 14, 13, 5, then four accounts tied at 4, then two tied at 3; effort follows the same names until the tiers blur — Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56. Inside the 4-ticket tier the effort order is Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi 985.65, Noah Meyer 737.68. The tie policy is the deliverable: shared rungs, no gaps — the 3-tier lands on rung 7.",
      ask: "Return each account at or above the 3-ticket gate with its ticket count, lifetime effort and dense load rank — rank first, effort breaking ties.",
      template:
        "SELECT * FROM (\n  SELECT c.name AS account,\n         COUNT(*) AS tickets,\n         {1} AS load,\n         {2}() OVER (ORDER BY {3}) AS load_rank\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nWHERE tickets >= {4}\nORDER BY load_rank ASC, load DESC;",
      slots: [
        {
          answer: "ROUND(SUM(o.total), 2)",
          kind: "keyword",
          label: "the effort column",
          why: "Lifetime effort is the summed ticket total, rounded to cents for the board — 7,262.35 for the top account. Unrounded SUM skips the cents discipline; MAX(o.total) silently swaps effort for the single biggest ticket.",
        },
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the shared-rungs ranker",
          why: "DENSE_RANK shares rungs without gaps — the 4-tier reads 6,6,6,6 and the 3-tier lands on 7. RANK shares rungs with gaps (the 3-tier reads 10); ROW_NUMBER splits the ties arbitrarily. The function choice IS the tie policy.",
        },
        {
          answer: "COUNT(*) DESC",
          kind: "keyword",
          label: "the load ordering",
          why: "Ranks are ordered by ticket count, biggest first — COUNT(*) DESC. Ordering by SUM(o.total) DESC ranks by dollars instead: Farid's 3 tickets outrank Keiko's 4, and every shared rung dissolves.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the multi-ticket gate",
          why: "The 3-ticket gate keeps 11 accounts — every multi-ticket tier, including the two accounts sitting exactly ON the line. 4 drops the 3-tier (9 rows), 2 floods the board to 14.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "SUM(o.total) DESC", "MAX(o.total)", "4", "2"],
      walkthrough:
        "A leaderboard is a policy wearing SQL. The inner fold groups 103 tickets to 16 accounts; the window DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) pins the ladder: 1 through 5 for 24, 17, 14, 13, 5 tickets, then shared rung 6 across the 4-ticket tier (Pedro 1,686.17, Keiko 1,098.60, Isabella 985.65, Noah 737.68 — effort breaking the tie in the read order), then rung 7 for the 3-tier (Farid 1,458.97, Hiro 829.09). The outer gate tickets >= 3 keeps all 11 multi-ticket rows, the two sitting exactly at 3 included, and the load column is ROUND(SUM(o.total), 2) — effort in dollars, cents preserved. Distractor consequence: RANK renumbers the 3-tier to 10 (shared rungs with gaps) and the board's rung story changes; ROW_NUMBER hands out 11 unique rungs and the tie policy quietly dies; ordering the window by SUM(o.total) DESC re-ranks by dollars so Farid jumps Keiko; MAX(o.total) swaps effort for peak ticket; gates 4 and 2 redraw the board to 9 or 14 rows.",
    },
    {
      id: "cs-now-6",
      tier: "hard",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass invoice census",
      brief:
        "ServiceNow-flavored brief on the storefront db: the month-close packet opens with a one-pass census of the invoice book — every status class counted and dollar-summed in a single scan, no joins, no fan-out. Probed facts: 28 bills; 6 open worth 19,609.00; 21 paid worth 66,443.00; 1 void worth 925.00; five invoices settle across two payments each (1, 5, 12, 19, 22), one carries a partial 4,000 of 6,148, and #28 claims 'paid' with zero settlement rows behind it. The census is FILTER-driven so each measure names its own population, and integer cents divide by 100.0 exactly once at the print edge.",
      ask: "Return the bill base plus the open and void class counts and the open dollar total — one pass, no GROUP BY.",
      template:
        "SELECT {1} AS bills,\n       COUNT(*) FILTER (WHERE status = {2}) AS open_bills,\n       COUNT(*) FILTER (WHERE status = {3}) AS void_bills,\n       ROUND(SUM(amount_cents) FILTER (WHERE status = 'open') / {4}, 2) AS open_dollars\nFROM invoices;",
      slots: [
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the bill base",
          why: "The bill base is a plain row count — 28. COUNT(DISTINCT status) counts the vocabulary (3 classes), SUM(amount_cents) counts cents (86,977) — both real numbers at the wrong grain.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the open-status marker",
          why: "Open is the 'open' status — 6 bills. 'refunded' matches nothing and prints a confident zero; 'paid' silently relabels the class and the census reports 21 open bills worth 66,443.00 — every downstream dunning decision inherits the lie.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the void-status marker",
          why: "Void is the 'void' status — the single 925.00 bill that also carries a payment row, the mirror anomaly of #28. 'cancelled' matches nothing (invoices have no cancelled class); 'paid' inflates void to 21.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "INTEGER cents divide by 100.0 once, at the print edge: 1,960,900 cents print as 19,609.00. The bare 100 keeps the truncation habit, 10.0 or 1000.0 shifts the decimal — each prints a board that cannot reconcile.",
        },
      ],
      distractors: ["'refunded'", "'paid'", "'cancelled'", "10.0", "1000.0", "SUM(amount_cents)"],
      walkthrough:
        "One scan, four measures, zero joins. COUNT(*) is the base — 28 bills, the denominator every class must sum back to (6 + 21 + 1 = 28). FILTER (WHERE ...) names each class's population per measure: open 6 worth 19,609.00, void 1 worth 925.00 — and void's lone bill (#11) is the anomaly a status-only census never catches, because it also carries a payment row. The dollar fold is SUM(amount_cents) FILTER (...) / 100.0 — 1,960,900 integer cents promoted once, printed 19,609.00. Distractor consequence: 'refunded' or 'cancelled' invent a class and print confident zeros; 'paid' swaps populations (open becomes 21 bills worth 66,443.00 — the paid class's clothes on the open body); 10.0 and 1000.0 move the decimal and the board stops reconciling; SUM(amount_cents) in the base column prints 86,977 cents where 28 bills belong.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — the resolution-rate question in textbook clothing: 52 of 103 raised, not 52 of 89 worked." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across accounts — the percentage of enterprise accounts an adoption wave touched, with the 100.0-before-division fix this kit drills." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly census at two grains: tickets AND accounts active per month — load versus audience in one query, the way the service review opens." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself: LEFT JOIN + IS NULL as a survival rule — the exact shape of the no-work-log backlog hunt, drilled until it's reflex." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency folds — the aging read (2.98-day average, 2-to-4 range) grouped by the account or queue doing the work." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before any SLA leaderboard ships, with the four-way tie at 4 tickets named out loud." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Above-average screens via subquery — the empty-inner-query trap in textbook clothing, and the follow-up every ServiceNow panel is fishing for." },
    { slug: "bank-account-summary-ii", why: "Per-account debit/credit folds with NULL-safe arms — the per-account billing rollup the workflow finance desk runs before any dunning cycle." },
    { slug: "ar-aging-schedule", why: "Aging buckets over money — the invoice-aging schedule that mirrors the ticket-aging board, both measured against a stated reference date." },
    { slug: "confirmation-rate", why: "Callback completion joins with NULL-safe division — the fix-verification shape: verifications ÷ stamped tickets, account by account." },
    { slug: "combine-two-tables", why: "Account enrichment LEFT JOIN — account attributes attached to every ticket, NULL-safe for rows the workflow hasn't touched." },
    { slug: "the-latest-login-in-2020", why: "Last-touch per account — the most-recent-ticket read ops uses to find accounts whose queue went quiet." },
    { slug: "tasks-count-in-the-weekend", why: "Weekend load distribution — the staffing question: are tickets raised evenly across the week or bunched where nobody is on rotation?" },
    { slug: "gl-reconciliation", why: "Ledger-grade reconciliation — counts and sums agreeing between the ticket system and the invoice, the culture this kit's anomaly list enforces." },
    { slug: "find-longest-calls", why: "Argmax over durations — the oldest-open-per-queue shape ops uses to find which backlog items age worst, not just on average." },
    { slug: "monthly-transactions-i", why: "Month-bucketed conditional folds — the incident-calendar idiom where '%Y-%m' versus '%m' is the difference between a trend and two merged years." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax over a fold — the top-of-leaderboard read: which account carries the most tickets, with ties handled by an explicit policy rather than luck." },
    { slug: "customer-order-frequency", why: "Order-count thresholds per account — the engagement-band query behind dunning cadence: who files often enough to warrant a named owner." },
    { slug: "movie-rating", why: "Split-audience surveys — two populations answered in one pass with conditional folds, the way the review packet answers accounts and catalog items at once." },
    { slug: "daily-leads-and-partners", why: "Distinct-pair census — COUNT(DISTINCT) across two dimensions at once, the make-and-model shape of every territory-by-catalog coverage table." },
    { slug: "game-play-analysis-iv", why: "First-touch conversion per cohort — tickets resolved on the first working day as a share of the day's intake, the signup-day funnel in ITSM clothing." },
    { slug: "biggest-window-between-events", why: "Max-gap per key — the quiet-account detector: which account's tickets have stretched furthest apart, the aging read at its extreme rather than its average." },
    { slug: "product-price-at-a-given-date", why: "As-of lookups — the catalog price that applied when the ticket was raised, the temporal-join shape behind every backdated bill." },
    { slug: "immediate-food-delivery-i", why: "First-touch share — tickets worked immediately versus queued, the same conditional ratio the resolution funnel prints at one decimal." },
    { slug: "monthly-transactions-ii", why: "Per-territory monthly folds — two grouping keys and a status condition, the exact shape of the territory-by-month capacity grid." },
    { slug: "not-boring-movies", why: "Rule-based exclusion screens — filter on an attribute, order by the business key: the intake-hygiene screen that keeps malformed tickets off the boards." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT per day — the work-log transcript fold: one row per date, lines joined in a controlled order, never a census base." },
    { slug: "number-of-rich-customers", why: "Threshold counts — bills or tickets above a value line, the simplest conditional count and the one the close packet leans on hardest." },
    { slug: "article-views-i", why: "Distinct-author dedupe — the same account touching a queue twice counts once per read, the COUNT DISTINCT discipline at single-table scale." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Windowed activity census — tickets raised inside a rolling window, the time-boxed population statement every SLA report opens with." },
    { slug: "sales-analysis-ii", why: "Buyers-with-purchases screen — accounts with at least one qualifying ticket via INNER join semantics, the positive-side twin of the backlog anti-join." },
    { slug: "team-scores-in-football-tournament", why: "Conditional points over outcomes — win/draw/loss arithmetic as CASE folds, the resolution-funnel scoring pattern with different labels." },
  ],
};
