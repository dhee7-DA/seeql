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
  ],

  dayInLife: [
    "**08:00 —** The morning starts on SLA health. A service-ops analyst opens the aging dashboard before the standup: did last night's fixes get stamped, does the {emerald:resolved} count (52 of 103) reconcile with what billing invoiced, and did any territory's unresolved share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — status counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is aging surgery. The service review wants the board refreshed — tickets joined to accounts, work stamp required, `julianday(shipped_at) - julianday(created_at)` averaged per account with the NULL policy spelled out: 82 of 103 tickets carry a stamp, the 21 without it are *the backlog, not a rounding error*. An account lead wants the two-grain census re-cut (EU: 45 tickets from 8 accounts — intensity 5.6); a catalog owner wants work lines and dollars side by side, because 'volume is up' means nothing until lines price into effort. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:00 —** The afternoon tilts toward the change board and stakeholder cycles. The catalog review walks the service table with SQL attached to every bar — which families carry the most lines, which bill most, where the mid-price band (8 SKUs averaging 111.5) sits against the budget band (8 at 32.06); the billing desk walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the invoice base?* This is the hour ticket numbers meet the people who fund them.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The backlog query ships with its survival rule in the comment (rows whose join finds no work-log ARE the finding); the anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the void bill with one (#11, 925.00); and tomorrow's follow-ups are queued per account. The rhythm to internalize: ServiceNow SQL exists to prove that resolution and billing agree — *the ticket and the invoice are the same story told at two grains.*",
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
  ],
};
