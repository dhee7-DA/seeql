// Twilio — kit 8 of the SaaS & Enterprise domain (Batch K).
// CPaaS usage SQL: the storefront db read as a communications-API sandbox —
// customers are messaging accounts, orders are billing periods of metered
// traffic (delivered = confirmed delivery, shipped = sent in flight, pending
// = queued, cancelled = failed/never delivered), order_items are metered
// message/call lines, products are channel products, and invoices/payments
// are the per-account usage bills in INTEGER cents. Delivery-status rates,
// channel mixes, dunning anti-joins and settlement-coverage censuses.
// Pool provenance: 0 tagged LC rows for Twilio — the whole pool is
// theme-curated to known CPaaS screen shapes and says so. Case briefs quote
// probed figures from scripts/company-facts.md (probed 2026-10-12); every
// case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

// Expansion (Task 92-f-twilio, 3x append-only): brief 4->6, dayInLife 4->5,
// metrics 8->12, topics 10->15, theory tw-t9..t24, mcqs tw-mcq-11..30, cases
// cs-tw-3..6 (t7/x2/q2/s3 — four topic families new to the kit), problems
// 16->32. Every new slug is a theme-curated `free=true` sql row from
// scripts/company-pools.md (Twilio stays 0-tagged); new case figures were
// re-probed against db/custom.db and every slot is verified by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const twilioKit: CompanyKit = {
  id: "twilio",
  domainId: "saas",
  name: "Twilio",
  tagline: "Communications APIs: messages, calls, usage",
  accent: "text-red-400",

  brief: [
    "Twilio is the CPaaS layer under the internet's customer conversations — SMS, voice, WhatsApp and email exposed as metered APIs where every call is a billable event and every status callback is a delivery fact. The analytics reality is traffic assurance: volumes by channel, {emerald:delivered} versus {rose:failed}, and the per-account billing that follows the meter. On this storefront db the mapping is honest: 16 messaging accounts generate 103 billing periods worth **34,833.28**, folded from 251 metered lines; the status mix behaves like the delivery ledger it is — 52 delivered (50.5%), 30 sent in flight (29.1%), 14 queued (13.6%), 7 failed before delivery (6.8%).",
    "The data org splits three ways. Usage analytics owns the volume folds: metered lines joined to channel products and aggregated per billing period (one channel's lines bill **11,744.01**, another 6,929.12 — units times `unit_price`, never units alone). Billing analytics owns the per-account runs — 28 `invoices` against 27 `payments`, INTEGER cents throughout — where the AR anti-join is a standing artifact: 6 never-settled bills worth 15,217, and one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it. Delivery analytics owns the status mix per region: APAC runs the highest failure share at 8.1%, LATAM the lowest at 0.",
    "Interview style is rate-then-denominator, then the billing join. A screen opens with a two-grain census (EU carries 45 billing periods from just 8 accounts; the US, 19 from 2), escalates into a conditional-count delivery rate with the denominator asked out loud ('does a {rose:failed} message count in your base?'), and lands on the money question — which accounts have bills with no payments behind them, and what does `amount_cents / 100.0` actually print. Follow-ups probe the anti-join's shape and the CASE arm ordering that separates exact settlements from partials. Candidates who state the denominator before computing are the ones who get callbacks.",
    "Preparation strategy: the registry tags zero SQL problems for Twilio — this kit is **0 tagged LC, theme-curated**: all 61 topic slugs and 32 problems are chosen to mirror known CPaaS screens — delivery-rate counting, channel mixes, per-account usage billing, dunning anti-joins and settlement coverage. Then run all six case studies on the live db — built for spaced practice rather than one sitting: one rebuilds the dunning anti-join the billing desk runs before reminders go out, another rebuilds the settlement-coverage census finance closes the month with. The bar to clear: state the denominator, the join's survival rule, and the cents rule before you compute anything.",
    "The senior screens go one layer past the anti-join. Windows keep every row while ranking and walking: per-region latency leaderboards against the **2.98-day** platform average, and month-over-month walks where a LAG column prints each delta — the {rose:November sag} of -1,326.87 against August's +1,158.21 rebound. One-pass censuses fold the whole status mix in a single scan via `FILTER (WHERE …)` — 103 periods, 52 delivered, 7 failed — and set ops close the loop on trust: an EXCEPT sweep proves claimed status against the settlement ledger, where 21 bills claim {emerald:paid} and exactly **one** (#28) has no payment rows behind it.",
    "Prep beyond the anti-join is three rebuilds on the live db. The walk: a LAG delta spine over the 14 monthly buckets, the first row reading NULL because January has no prior. The census: one `FILTER (WHERE …)` pass printing 103 periods, 52 {emerald:delivered}, 7 {rose:failed}, and the 50.5 share they imply. The ledger proof: debit and credit folds of **181,080** cents each — a delta of zero that proves balance, not correctness. Each rebuild ends the same way: state the grain, the survival rule and the cents rule out loud, *because a number is only as defensible as the denominator behind it.*",
  ],

  dayInLife: [
    "**08:00 —** The morning starts on delivery health. A usage analyst opens the status dashboard before the ops standup: did last night's traffic settle, does the {emerald:delivered} count (52 of 103) reconcile with what billing invoiced, and did any account's failure share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — status counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is per-account billing surgery. The billing desk wants the dunning list refreshed — invoices LEFT JOIN payments, keep the NULLs: 6 never-settled bills worth 15,217, including #28, which *claims paid with zero settlement rows* and goes to the anomaly queue, not the reminder queue. A growth partner wants the two-grain census re-cut (EU: 45 periods from 8 accounts — intensity 5.6); a channel owner wants units and dollars side by side because 'volume is up' means nothing until units price into spend. Each ask is a join, a conditional aggregate and one stated denominator — *written twice: once to answer, once with the definition spelled out so the number survives the argument.*",
    "**15:00 —** The afternoon tilts toward channel mix and stakeholder cycles. The channel review walks the product table with SQL attached to every bar — which channels bill most, which meter the most lines, where the mid-price band (8 SKUs averaging 111.5) sits against the budget band (8 at 32.06); finance walks the settlement census — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the invoice base?* This is the hour traffic numbers meet their audiences.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The dunning query ships with its survival rule in the comment (NULL-kept rows ARE the list; an INNER JOIN here deletes the customer, not the bug); the anomaly log carries both mirror modes — the void bill with a payment (#11, 925.00) and the paid bill with none (#28, 1,756.00); and tomorrow's follow-ups are queued per account. The rhythm to internalize: Twilio SQL exists to prove that delivery and billing agree — *the meter and the invoice are the same story told at two grains.*",
    "**20:30 —** The late shift closes the loop before the carriers roll their day. The nightly pass reruns the three artifacts morning will quote: the status census (103 periods, 52 {emerald:delivered}, 7 {rose:failed}) against the billing snapshot, the walk's newest delta — February prints **-122.33** against January's 3,731.97, the first month where a LAG column has anything to say — and the dunning list, re-checked after the day's new bills landed. *Traffic assurance is a 24/7 claim; the 20:30 pass is what makes the 08:00 dashboard boring — and boring is the KPI.*",
  ],

  metrics: [
    { name: "Metered traffic volume", what: "Billing periods and metered lines on the calendar: 103 periods, 251 lines from 16 accounts. The volume read every capacity and revenue claim starts from." },
    { name: "Delivery rate", what: "Delivered ÷ ALL periods: 52 of 103 (50.5%). The denominator is the interview — 52 of 59 resolved (88.1%) is a different metric with a different name." },
    { name: "Failed-traffic share", what: "Cancelled ÷ all periods: 7 of 103 (6.8%) — demand that never delivered. Cut by region: APAC 8.1% highest, LATAM 0." },
    { name: "Region traffic mix", what: "Periods and accounts per region — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The two-grain census separating load from audience." },
    { name: "Billed usage", what: "34,833.28 across the calendar, averaging 338.19 per period against a 25.47 to 1,088.44 spread. The revenue line that IS the meter." },
    { name: "Unsettled AR", what: "Bills with no payment rows: 6 worth 15,217 — and one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the dunning cycle runs on." },
    { name: "Settlement speed", what: "Days from issue to first payment on settled bills: 20 settle in 28.4 days on average, fastest 13, slowest 84 — against uniform 30-day terms." },
    { name: "Payment-method mix", what: "Card versus wire on usage bills: card 16 payments totaling 37,364, wire 11 totaling 32,248. The self-serve/enterprise split, visible in one GROUP BY." },
    { name: "In-flight exposure", what: "30 sent + 14 queued = 44 periods (42.7% of the calendar) with delivery callbacks outstanding — the delivery ledger's open work, and the denominator gap that separates 50.5% delivered from 88.1% resolved." },
    { name: "Exact-settlement share", what: "21 of the 22 payment-backed bills settle to the cent (95.5%); the 22nd — #25 — runs partial at 4,000 of 6,148. Coverage quality in one ratio." },
    { name: "Split-settlement watch", what: "5 bills settle across two payment rows (1, 5, 12, 19, 22) plus the partial — 6 bills where one row wasn't the whole story. The duplicate-settlement hunt's feeding ground." },
    { name: "Volume swing", what: "3,731.97 peak (2024-01) against a 1,193.86 floor (2024-07) — a 3.1x band the capacity plan must absorb; the walk's LAG deltas are this metric, month by month." },
  ],

  topics: [
    {
      name: "Traffic-volume censuses",
      why: "Every Twilio screen opens with a fold: billing periods, messaging accounts, metered lines — grouped and counted without letting the grain blur. COUNT(*) counts periods, COUNT(DISTINCT customer_id) counts accounts; 103 periods come from just 16 accounts, and the census is where candidates prove which grain they're standing on.",
      slugs: ["product-sales-analysis-ii", "unique-orders-and-customers-per-month", "find-followers-count", "number-of-rich-customers", "queries-quality-and-percentage", "active-businesses"],
    },
    {
      name: "Delivery-status conditional counting",
      why: "Delivered, sent, queued, failed — every rate here is a conditional count over a status flag, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL periods is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "confirmation-rate", "weather-type-in-each-country"],
    },
    {
      name: "Joining accounts to traffic",
      why: "Traffic inherits account attributes through joins to the accounts table, and the join type decides who survives: a period with no account is corruption; an account with no traffic is a silent customer. Choosing INNER versus LEFT is a business statement.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers", "game-play-analysis-i", "daily-leads-and-partners", "employee-bonus"],
    },
    {
      name: "Channel mix & per-product usage",
      why: "Metered lines carry channel products, and the channel story is a join-then-weigh fold: units × unit_price per line, one channel billing 11,744.01 on 97 units. The per-channel census is how product decisions get funded.",
      slugs: ["average-selling-price", "product-sales-analysis-iii", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "The traffic calendar",
      why: "Volumes are calendar arithmetic: STRFTIME('%Y-%m') buckets over billing periods against the 3,731.97 peak and the 1,193.86 floor. Twilio drills the month-bucket idiom because every capacity chart hangs on that spine — and a '%m'-without-year fold merges two years into one lie.",
      slugs: ["friday-purchase-iii", "monthly-transactions-i", "the-latest-login-in-2020"],
    },
    {
      name: "Per-account usage billing",
      why: "The meter is not the money: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where CPaaS interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "gl-reconciliation", "trial-balance-check"],
    },
    {
      name: "Failed-traffic anti-joins",
      why: "Dunning and silence reads are anti-joins: bills with no payments (6 on this db), accounts with no traffic (0 — and proving a confident zero is the job). The survival rule of the join IS the query; an INNER JOIN here deletes the finding, not the bug.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Throughput & latency windows",
      why: "Delivery performance is a ranking question: longest calls per account, slowest delivery paths, throughput leaderboards with honest ties. RANK and friends are a business decision about shared rungs, not syntax trivia.",
      slugs: ["find-longest-calls", "average-time-of-process-per-machine", "rank-scores", "customer-placing-the-largest-number-of-orders", "most-frequently-ordered-product-per-customer", "second-most-recent-activity", "biggest-window-between-events"],
    },
    {
      name: "Subquery screens",
      why: "Screens escalate into nested logic: periods above the platform average, accounts clearing a traffic threshold. Scalar and HAVING-gated shapes each carry an empty-inner-query answer you are expected to give unprompted — the silent-zero-rows bug ships on staging tables.",
      slugs: ["orders-with-maximum-quantity-above-average", "second-highest-salary", "game-play-analysis-iv"],
    },
    {
      name: "Billing anomalies & cents discipline",
      why: "The row-level anomaly list is the source of truth: a void bill WITH a payment (#11, 925.00), a paid bill with none (#28, 1,756.00), one partial at 4,000 of 6,148. Every dollar read is amount_cents / 100.0 — the missing .0 eats cents on every odd-cent bill.",
      slugs: ["duplicate-charge-pairs", "ar-aging-schedule", "monthly-transactions-ii", "chargeback-rate-ranking"],
    },
    {
      name: "Recurring usage & continuity",
      why: "CPaaS revenue is recurring by design: an account that metered traffic last month and again this month is the healthy account, and consecutive-month detection is the query that proves it. Screens ask for accounts whose usage recurred month over month, and the honest failure modes are a silent INNER join or a month spine that merges two years into one bucket.",
      slugs: ["customer-order-frequency", "find-loyal-customers", "report-contiguous-dates", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "E.164 & identity hygiene",
      why: "Every destination number, sender ID and webhook identifier is text, and the delivery ledger only reconciles when identities are canonical. Screens drill SUBSTR/REPLACE/UPPER shaping and format assertions — length checks, leading-plus checks — the CPaaS-native version of data-quality filtering.",
      slugs: ["fix-names-in-a-table", "fix-product-name-format", "find-users-with-valid-e-mails", "null-blank-audit", "keep-latest-dedupe"],
    },
    {
      name: "Call-pair self-joins",
      why: "Voice is a conversation: pairing callers with callees, bridging legs, and de-duplicating A-B versus B-A is self-join grammar. The strict-inequality join (a.id < b.id) that kills self-pairs and mirror duplicates is a Twilio specialty question, and it feeds the mutual-traffic census ops reads weekly.",
      slugs: ["number-of-calls-between-two-persons", "circular-transfers", "most-common-course-pairs"],
    },
    {
      name: "Channel-stack pivots",
      why: "Accounts run channel stacks — SMS plus voice plus WhatsApp — and the commercial question is who runs the stack and who runs a single channel. A-and-B-but-not-C pivots and GROUP_CONCAT folds turn metered lines into per-account channel portfolios, which is how bundle upsells get targeted.",
      slugs: ["customers-who-bought-a-and-b-not-c", "user-purchase-platform", "group-sold-products-by-the-date"],
    },
    {
      name: "Dormancy & winback reads",
      why: "A messaging account that went quiet is a churn signal, and the winback list is a gap query: biggest window between events, last-activity ranking, reactivation after silence. These reads keep every anti-join honest about WHO survived and WHEN they left — the dunning list's traffic-side twin.",
      slugs: ["find-churn-risk-customers", "dormant-reactivation", "winback-recovery", "transactions-per-visit-histogram"],
    },
  ],

  theory: [
    {
      id: "tw-t1",
      q: "Your dunning report joins accounts to their billing periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a traffic column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A billed-traffic report joins periods to accounts: a period with no account is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A silence report must be LEFT from accounts: the accounts with no traffic ARE the finding — a messaging account that went quiet is a churn signal — arriving with NULL traffic columns. The classic break: filtering status = 'delivered' in WHERE after a LEFT JOIN kills every NULL-payload account row — the LEFT JOIN quietly became an INNER and the silent accounts vanished. The fix is moving the predicate into ON or an outer query. On this db the never-traffic anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "tw-t2",
      q: "The traffic census shows 103 periods, 16 accounts and 251 metered lines. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts metered rows — 251; COUNT(DISTINCT o.id) folds them back to billing periods — 103; COUNT(DISTINCT customer_id) folds further to accounts — 16. None is wrong: lines measure message-level load, periods measure the billing calendar, accounts measure the installed base. The ratios are the reads — 2.4 lines per period, 6.4 periods per account — and they decide whether growth is broadening (more accounts) or deepening (more traffic per account). The trap that catches candidates is quoting a line count as a period count in a volume trend; one account-period with three metered lines is one invoice row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "tw-t3",
      q: "The ops review wants accounts whose delivered traffic is at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards failed and in-flight traffic before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a delivery-health line and an error, and between a threshold applied to messages versus to accounts. The strong answer places every filter by asking: is this a fact about one metered event, or about an account's whole fold?",
      tag: "pipeline",
    },
    {
      id: "tw-t4",
      q: "You rank accounts by billed traffic and two accounts tie. RANK, DENSE_RANK or ROW_NUMBER for the board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied bills the same rank and skips — 1, 2, 3, then a tie at 3, and the next distinct count lands two positions later, implying a phantom account that does not exist. DENSE_RANK shares rungs without gaps — the tie reads 3, 3 and the next distinct count is 4. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which account gets flagged first in the ops queue. On this db ties are real: the traffic ladder has accounts tied at 4 periods and at 3, so every leaderboard ships with its policy named. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "tw-t5",
      q: "A message sits 'sent' with no delivery callback yet. What is your NULL policy for the delivery-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only completed deliveries have a latency, so the report measures delivered traffic and says so — on this db 82 of 103 periods carry a completion timestamp, averaging 2.98 days, range 2 to 4; 14 are still queued, 7 failed outright. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the delivered-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(completion_ts) counts the settled subset; the gap between it and COUNT(*) IS the in-flight count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant delivery for messages still in flight, and an SLA report built that way is a lie with decimals. A report whose WHERE clause is doing definitional work without saying so is exactly what a Twilio reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "tw-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce an average. On filtered staging tables — one region, one channel, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each bill to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "tw-t7",
      q: "The volume trend buckets traffic by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the volume curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's traffic, and month-end is exactly when billing-period traffic lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a volume walk. Date discipline is capacity discipline: the spine, the window and the edge row are where traffic reports go wrong.",
      tag: "dates",
    },
    {
      id: "tw-t8",
      q: "The billing desk says a paid invoice has no payment rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 4,937.00 print into 4,937 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between systems, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "tw-t9",
      q: "The status census needs a TOTAL row appended under its four arms. UNION or UNION ALL — and what does the wrong pick cost you?",
      a: "UNION ALL, and the reason is semantic honesty plus cost. The four status arms are distinct by construction — a period carries exactly one status — and the TOTAL row is distinct by its label, so there is nothing to dedup; UNION would spend a sort-and-hash pass comparing five rows for zero benefit, and at traffic scale that pass is real money. Worse, UNION's dedup is a silent contract: two regions that happen to fold to identical counts would collapse into one row, and the census would undercount its own arms with no error raised. The rule worth saying out loud: UNION ALL when the branches are disjoint by definition, UNION only when you genuinely need set semantics — and if you reach for UNION, be able to name the duplicate you are killing.",
      tag: "set-ops",
    },
    {
      id: "tw-t10",
      q: "EXCEPT and LEFT JOIN … IS NULL both find 'rows with no match'. When does each mislead you on a billing audit?",
      a: "EXCEPT compares whole rows as sets: equal column counts, type-loose matching, duplicates silently collapsed. LEFT JOIN … IS NULL is a row-level filter that keeps the payload and the duplicates. On this db the fraud sweep — paid-claim ids EXCEPT payment-backed ids — returns exactly {28}: one paid claim with no settlement rows. The join idiom returns the same row plus its payload, which is usually what the memo needs. EXCEPT misleads three ways: it dedups (a list that should repeat won't), it hard-errors on column-count mismatch instead of warning, and it hides which side produced a surviving row. The join idiom misleads one way: forget the IS NULL and you have written the opposite list. For audits I take the join — the survival rule is visible in the text and the payload rides along; EXCEPT is the right tool when the question is purely set membership and both sides are already at one grain.",
      tag: "set-ops",
    },
    {
      id: "tw-t11",
      q: "Your running revenue over the traffic calendar jumps on some months and not others. What is the default window frame doing, and when do you override it?",
      a: "With an ORDER BY in OVER and no frame clause, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats peers as one unit: rows sharing the ORDER BY value all join the frame together, so the running sum includes the whole peer group at once. On the 14-month spine that is harmless because month keys are unique — RANGE and ROWS coincide. Order by anything non-unique — status, region, a rounded latency — and the running total jumps by entire peer groups. The override is explicit: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when you want row-by-row accumulation. And the inverse trap: drop the ORDER BY entirely and the frame becomes the whole partition — every row shows the grand total, 34,833.28 on this db, which reads like a running total and is not one. Frame semantics are the difference between a trend and a lie that sorts.",
      tag: "windows",
    },
    {
      id: "tw-t12",
      q: "You rank accounts by billed traffic within their region and the board comes back with a global 1-to-16 list. What broke, and what does the fix look like?",
      a: "The PARTITION BY is missing — RANK() OVER (ORDER BY spend DESC) ranks the whole platform; RANK() OVER (PARTITION BY region ORDER BY spend DESC) resets the ladder inside each region, which is the board the ops review actually reads. The distinction matters because the sort stays global either way: the output ORDER BY decides row order, the partition decides where ranks reset, and conflating them is the classic bug. On this db the shapes differ visibly — globally, Alice Chen's 7,262.35 owns rank 1 and every EU account crowds the top; partitioned, each region's biggest local spender starts at 1. The company twist: regional health means comparing each region's leader to ITS region, not to the platform — a LATAM account at 852.44 leads its region while ranking 10th globally, and both facts are true at once. A leaderboard that cannot say which grain it ranks is not a leaderboard; it is a sort.",
      tag: "windows",
    },
    {
      id: "tw-t13",
      q: "The settlement census is a two-stage query — classify per bill, then fold per class. Derived table or CTE, and when does the choice stop being stylistic?",
      a: "Stylistically they plan the same on small data; the CTE names the stage, which is worth real money in review — WITH classified AS reads like the memo's own vocabulary. The choice stops being stylistic the moment a stage is needed twice: a derived table can only be referenced where it is written, but a CTE can be joined to itself — settled versus unsettled, this month's spine against last month's. Second trigger: depth. Three nested derived tables stack parentheses nobody can review; three named CTEs read as three paragraphs. The discipline I would enforce on the billing desk: one stage per CTE, the grain named in a comment, and the final SELECT small enough to see whole — the settlement census is 28 bills classified and folded into three classes; if the query is harder to read than the audit it performs, the query is wrong.",
      tag: "ctes",
    },
    {
      id: "tw-t14",
      q: "FILTER (WHERE …) versus SUM(CASE WHEN …) — same numbers. What does FILTER actually buy on a one-pass census?",
      a: "One scan, several counts: COUNT(*) FILTER (WHERE status='delivered') alongside the same shape for cancelled, pending and shipped prints the whole status mix — 52, 7, 14, 30 on this db — in a single pass over 103 periods. FILTER's contract is narrower and safer than SUM(CASE): you cannot forget the ELSE 0 (the aggregate simply never sees non-matching rows — no arm-ordering semantics, no NULL leakage from a missing ELSE), and it composes uniformly with COUNT, SUM and AVG. The honest caveat is portability: FILTER is SQLite 3.30+ and modern Postgres; older engines want SUM(CASE WHEN … THEN 1 ELSE 0 END), which is why candidates should be fluent in both and able to say which one they would ship. I ship FILTER where it exists and cite the CASE fallback unprompted — that sentence is the interview point, because it proves you know the two shapes compile to the same plan and carry different review risk.",
      tag: "census",
    },
    {
      id: "tw-t15",
      q: "Destination numbers arrive '+15551234567', '(555) 123-4567' and bare. Where does text shaping belong, and what does GROUP BY do with a normalized expression?",
      a: "GROUP BY groups by the VALUE of the expression, not the column — GROUP BY REPLACE(REPLACE(phone,'(',''),')','') folds the display variants into one canonical bucket, which is exactly how a duplicate-destination census works. In a screen, shaping in SQL is the expected move: SUBSTR to slice country codes, UPPER for case-folding identifiers, LENGTH to assert the E.164 shape — 15 digits, leading plus. The production answer goes one step further: at CPaaS scale you shape at ingest, once, with a tested normalizer — because two analysts with two ad-hoc REPLACE chains produce two different 'canonical' forms, and the reconciliation against the carrier's ledger fails on formatting, not on money. So: shape in SQL to answer, shape in the pipeline to keep answering, and be able to say out loud which mode you are in.",
      tag: "strings",
    },
    {
      id: "tw-t16",
      q: "invoices carry INTEGER cents, orders carry REAL dollars. Why the split, and what is the rule when one report crosses both?",
      a: "The ledger side is INTEGER because meters tick in whole cents — money arithmetic in INTEGER cannot drift no matter how many rows accumulate. The usage side is REAL because prices are born as decimals: 338.19 averages out of 103 REAL totals. The crossing rule: never mix the two grains in one expression, and convert explicitly at the boundary — SUM(amount_cents) / 100.0 promotes the INTEGER fold to REAL after it, which is exact; dividing each row first is harmless mathematically but invites someone to drop the .0 later, and integer division eats cents on every odd-cent bill. ROUND placement follows the same logic: aggregate first, ROUND once at the print edge — ROUND(SUM(x),2), never SUM(ROUND(x,2)) — because rounding inside the fold throws away information the total legitimately owns. The cents rule is not pedantry; it is the difference between a ledger that reconciles and one that leaks.",
      tag: "money",
    },
    {
      id: "tw-t17",
      q: "The volume trend wraps created_at in SUBSTR for every bucket. What's the performance instinct, and when do you deliberately override it?",
      a: "The instinct is sargability: a predicate that wraps the column in a function — WHERE SUBSTR(created_at,1,7) = '2024-01' — cannot use an index on created_at, while the range form (>= '2024-01-01' AND < '2024-02-01') can. But the grouping side differs from the filtering side: GROUP BY month-bucket needs the expression regardless of indexes, because the bucket IS the requested grain — there is no index-friendly month without a stored column. So the honest answer has three beats: for filters, prefer half-open ranges; for the bucket spine, accept the expression or persist the bucket as a column at ingest; and state the scale out loud — on 103 periods the whole question is academic, and an interviewer who hears 'at this size I would measure before optimizing' hears an engineer, not a pattern-matcher. Instincts scale; row counts do not.",
      tag: "perf",
    },
    {
      id: "tw-t18",
      q: "Define the delivered rate for the exec dashboard — the number the CEO will quote in the board meeting. What goes in the numerator and denominator, and why does the definition memo matter?",
      a: "Numerator: billing periods with status delivered — 52 on this db. Denominator: ALL periods that entered the platform — 103 — because queued and in-flight traffic is real demand that has not resolved yet, not demand that does not exist. That prints 50.5%. The rival reading — 52 of 59 resolved periods, 88.1% — is a legitimate different metric (a resolution success rate) with a different name, and the memo is what keeps them from wearing each other's clothes. The memo pins four contracts: the status map (shipped = sent awaiting callback, pending = queued, cancelled = failed), the grain (periods, not metered lines), the calendar (all 14 months, no cherry-picked window), and the promotion rule (100.0 before the division). Without it, two dashboards quote 50.5 and 88.1, both 'correct', and the CEO quotes whichever one flattered the deck.",
      tag: "kpis",
    },
    {
      id: "tw-t19",
      q: "NOT IN (SELECT customer_id FROM staging_extract) returns zero rows, though the extract visibly has customers. Walk me through the trap and the rewrite.",
      a: "The extract contains NULL customer_ids — three rows of it, say — and NOT IN against a set containing NULL is never TRUE: x NOT IN (1, 2, NULL) evaluates each equality, x = NULL is UNKNOWN, so the chain is UNKNOWN-or-FALSE for every row and WHERE discards everything. Zero rows, valid plan, no error — the worst failure mode a staging report has. The NULL-proof rewrites are NOT EXISTS (semantically checked row by row; NULLs simply never match) and the LEFT JOIN … WHERE s.id IS NULL anti-join, which this kit's dunning list already uses. The diagnostic habit: before trusting any NOT IN, run SELECT COUNT(*) FROM (subquery WHERE key IS NULL) — on this db orders.customer_id is NOT NULL so the trap is theoretical, but staging extracts with nullable keys ship this bug weekly, and the analyst who checks owns the incident-free quarter.",
      tag: "nulls",
    },
    {
      id: "tw-t20",
      q: "Your billed-revenue total doubles after you join billing periods to metered lines. What happened, and what are the two honest fixes?",
      a: "Fan-out. The period header (103 rows) joined to its line detail (251 rows) multiplies each header by its line count — 2.4 lines per period on this db — and SUM over the join re-charges every header measure per line: the probe prints 103,244.55 against a true 34,833.28. The general law: never sum a column from the one side of a join while the many side fans the rows out. Fix one is fold-then-join: aggregate the lines to the header grain first (units per order), then join — each period appears exactly once. Fix two is fold-in-a-subquery: wrap the line aggregation so the outer SUM only ever sees header grain. What is NOT a fix: DISTINCT (it will not un-multiply unequal rows) or dividing by a hardcoded 2.4 (the ratio varies per period). The revenue number that survives review is the one whose grain was defended before the SUM was written.",
      tag: "joins",
    },
    {
      id: "tw-t21",
      q: "Delivery latency is julianday(shipped_at) - julianday(created_at). Why julianday and not plain subtraction, and where do the decimals bite?",
      a: "The timestamps are TEXT, and TEXT minus TEXT is either an error or nonsense — the engine will not parse the interval for you. julianday converts to a fractional day count, so the difference IS the latency in days: this db's 82 settled periods average 2.98, spanning 2 to 4. The decimals bite three ways. Truncation: CAST the difference to INTEGER before averaging and you bias the mean systematically low — every 3.5-day order floors to 3, and the bias accumulates instead of canceling. Format: julianday returns NULL silently on a non-ISO string, and AVG over all-NULL prints NULL — a blank report, which is at least a visible failure. Presentation: round once at the edge, ROUND(AVG(diff),2), never inside the fold. And the NULL policy rides on top: only completed deliveries carry a latency, so the report's WHERE clause is doing definitional work and must say so in its own comment.",
      tag: "dates",
    },
    {
      id: "tw-t22",
      q: "Regional delivery rates read APAC 56.8, EU 53.3, US 26.3, LATAM 100 — yet the platform rate is 50.5. Why doesn't averaging the regions reproduce it?",
      a: "Because an unweighted mean of rates weights every region equally, and the regions are nothing like equal: LATAM's 100% stands on 2 periods, APAC's 56.8 on 37. Average the four published rates and you get 59.1 — a number that answers 'what does a typical region look like' and nothing else. The platform rate re-derives from sums: 52 delivered over 103 periods, where LATAM contributes 2 numerator rows and 2 denominator rows — its opinion shrinks to its size. The rule: ratios re-derive from sums at the top grain, never average the ratios; if you must publish regional rates, publish them beside their denominators so nobody averages them. The small-denominator flip is the general disease — a 100% region on 2 periods is a headline waiting to mislead — and Twilio's regional SLA board reads every percentage with its base attached.",
      tag: "aggregation",
    },
    {
      id: "tw-t23",
      q: "ORDER BY accepts a SELECT alias but WHERE rejects it. Why, and where does that bite in a ranked report?",
      a: "The logical pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY: WHERE evaluates while rows are still raw, before any alias exists; ORDER BY runs after SELECT materializes, so the alias is visible. The bite arrives the moment you want to filter on a computed column: WHERE delivered_pct > 50 errors, and the fixes are shape-dependent — repeat the expression (ugly, drifts), or stage it: a CTE or derived table computes the column, and the outer query filters on the plain name. Windows make it worse: RANK() OVER (…) in WHERE errors too — window functions evaluate at SELECT time — and SQLite has no QUALIFY clause, so the stage-then-filter pattern is not optional for 'top N per group'. The discipline being tested: know which pipeline stage each name comes into existence at, and reach for the CTE the moment the filter references anything computed.",
      tag: "pipeline",
    },
    {
      id: "tw-t24",
      q: "The anomaly log caught a paid bill with no payment rows last close. Beyond the query itself, what makes that audit trustworthy next month?",
      a: "Reproducibility first: the query is deterministic — a tie-broken ORDER BY (balance DESC, id), so the same data always prints the same order — and idempotent in definition: 'payment rows are the ledger of record; the status column is a claim' lives in the query comment, not in someone's head. Provenance second: the audit cites the probed anomaly list (the void-but-paid #11 at 925.00, the paid-with-no-rows #28 at 1,756.00, the partial at 4,000 of 6,148) instead of recomputing from memory, so drift between systems is a finding, not a footnote. Third, the negative results ship too: never-ordered accounts = 0 on this db, and a confident zero with its query attached is a finding. Last, the deliverable is the query that shows WHICH rows disagree — versioned with the close and rerun before every sign-off. Trust is a property of the rerun, not of the first run.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "tw-mcq-1",
      prompt: "A billing period's status column reads 'cancelled'. In delivery-callback language, what is it?",
      choices: ["Delivered and confirmed", "Sent, awaiting the callback", "Failed — traffic that never delivered", "Queued at the carrier"],
      answer: 2,
      why: "This kit's status map is fixed: delivered = confirmed delivery (52 of 103 periods), shipped = sent in flight (30), pending = queued (14), cancelled = failed (7). 'Cancelled' is the only status that never delivered.",
      notes: [
        { choice: 1, why: "In-flight is 'shipped' — 30 periods with callbacks still pending. Counting in-flight traffic as delivered inflates every SLA number." },
        { choice: 3, why: "Queued is 'pending' — 14 periods awaiting a carrier. Failed and queued are opposite ends of the delivery ledger; confusing them flips the failure rate's sign." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-2",
      prompt: "Delivery rate is defined as delivered ÷ which population? The db holds 52 delivered and 7 cancelled of 103 periods.",
      choices: ["Delivered + cancelled only (52/59 = 88.1%)", "All periods entered (52/103 = 50.5%)", "In-flight periods only", "Distinct accounts (52/16)"],
      answer: 1,
      why: "The house definition: delivered ÷ ALL periods, queued traffic included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-traffic delivery rate — a legitimate separate metric, but calling it 'the delivery rate' inflates 50.5% to 88.1% by quietly deleting queued traffic. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is delivered periods per account — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-3",
      prompt: "EU carries 45 billing periods from 8 accounts. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between the columns — 5.6 periods per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has an account. Without DISTINCT both columns read 45 and the census loses the coverage story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is periods AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued traffic", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every region's delivery share truncates toward 0 and the whole map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-5",
      prompt: "Keep only accounts carrying at least 10 billing periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded ladder — 24, 17, 14, 13 periods — clears such a bar per account.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'periods' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-6",
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
      id: "tw-mcq-7",
      prompt: "The dunning list is built as invoices LEFT JOIN payments WHERE p.id IS NULL. What happens if a teammate rewrites it with INNER JOIN?",
      choices: ["Same list, faster — INNER JOIN is equivalent here", "Empty list — the bills with no payments fail the join and vanish", "All 28 invoices — the join direction flips", "An error — INNER JOIN needs an ON clause with IS NULL"],
      answer: 1,
      why: "The dunning list IS the anti-join: bills whose join finds no payment row survive only under LEFT JOIN + IS NULL. INNER JOIN drops exactly those rows — the six never-settled bills disappear and the reminder cycle runs on nobody.",
      notes: [
        { choice: 0, why: "INNER and LEFT differ precisely on the unmatched rows — which are the entire answer here. The rewrite deletes the finding, not the bug." },
        { choice: 2, why: "Join type never flips direction — it changes row survival. All 28 would need a CROSS JOIN, a different (and wrong) tool." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-8",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE region = 'LATAM') runs against a staging table where the LATAM filter matches nothing. What does the report return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total rows"],
      answer: 1,
      why: "The empty inner fold yields NULL, total > NULL is UNKNOWN, and WHERE passes nothing — an above-average report that ships empty-looking-but-valid. On filtered staging tables this bug is routine, which is why the inner fold's population is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the report LOOKS fine. Stricter engines error; the portable answer is to check the inner fold." },
        { choice: 2, why: "No comparison against NULL ever defaults to true — UNKNOWN is discarded by WHERE in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-9",
      prompt: "An analyst reports 'the failure rate is 0.068' and a second reports 'the delivery rate is 50.5'. Both used the same table. What explains the pair?",
      choices: ["A bug — the two rates must sum to 100", "Different denominators and different numerators: 7/103 failed, 52/103 delivered — the rest (30 shipped, 14 pending) is neither", "One of them used DISTINCT", "The rates measure different years"],
      answer: 1,
      why: "The status mix has four arms — 52 delivered, 30 shipped, 14 pending, 7 cancelled — so delivery and failure are complementary only if you pretend in-flight and queued don't exist. Both numbers are correct; neither sums to 100 with the other.",
      notes: [
        { choice: 0, why: "Rates from overlapping-but-incomplete arms don't sum to 100 — 50.5 + 6.8 = 57.3, and the missing 42.7% is the in-flight and queued traffic. Insisting they sum is the denominator error in disguise." },
        { choice: 2, why: "DISTINCT changes counts of entities, not status shares — both analysts folded the same 103 rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-10",
      prompt: "A coverage CASE classifies bills: WHEN SUM(p.amount_cents) < i.amount_cents THEN 'partial' ... runs BEFORE the no-payment arm. What happens to a bill with zero payment rows?",
      choices: ["Classified 'partial' — SUM is 0, which is less than the amount", "Falls through as NULL — SUM of no rows is NULL, NULL < amount is UNKNOWN, so it lands in the ELSE arm", "An error — SUM cannot run on an empty group", "Classified 'partial' only if the bill is also marked paid"],
      answer: 1,
      why: "A bill with no payment rows yields SUM(p.amount_cents) = NULL, and NULL < amount is UNKNOWN — the partial arm never fires, so the bill falls to ELSE and reads 'exact'. That is exactly why the no-payment arm (p.id IS NULL) must be checked FIRST.",
      notes: [
        { choice: 0, why: "SUM over zero rows is NULL, not 0 — the empty-group fold is the trap. COUNT returns 0 on empty groups; SUM returns NULL. The two aggregates have different empty-case contracts." },
        { choice: 3, why: "The CASE never sees the status column — arm order and NULL semantics decide, not the claimed status. #28 proves it: 'paid' with zero rows still folds to NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-11",
      prompt: "The status census needs a TOTAL row appended under its four arms: SELECT status, COUNT(*) … GROUP BY status UNION ALL SELECT 'TOTAL', COUNT(*) FROM orders. Why UNION ALL and not UNION?",
      choices: ["UNION dedups the four arms and would delete legitimate rows", "UNION ALL appends without a dedup pass — the arms are disjoint by construction, so there is nothing to merge", "UNION cannot mix a literal with a column", "They are equivalent here; UNION is just slower to type"],
      answer: 1,
      why: "The four status arms are disjoint by construction and the TOTAL row is distinct by its label — UNION ALL appends 4 + 1 rows with no dedup pass. UNION would spend a sort-and-hash pass proving what construction already guarantees.",
      notes: [
        { choice: 0, why: "UNION dedups only IDENTICAL full rows — the arms differ in status, so nothing would be deleted. The real costs are the wasted dedup pass and the silent contract that bites the day two branches fold to identical rows." },
        { choice: 2, why: "SQLite happily mixes literals and columns in a compound SELECT — the 'TOTAL' label is a constant expression and the query runs as written." },
        { choice: 3, why: "They are not equivalent: UNION performs a dedup pass over the combined set — same rows today, different semantics the first day two branches collide." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-12",
      prompt: "A teammate writes: SELECT id FROM invoices WHERE status='paid' EXCEPT SELECT invoice_id, amount_cents FROM payments. What happens?",
      choices: ["It returns the paid claims with no settlements", "It returns every paid invoice — EXCEPT ignores extra columns", "It errors — compound SELECTs require the same number of columns on both sides", "It returns the payment-backed paid invoices"],
      answer: 2,
      why: "EXCEPT is a set operation: both sides must project the same column count. Two columns against one is a hard error before any rows are compared.",
      notes: [
        { choice: 0, why: "That is the intended audit — but it never runs; the column-count mismatch fails at prepare time. Fix the shape first: one column per side." },
        { choice: 1, why: "SQLite is type-loose but not count-loose — the column COUNT must match exactly. The extra amount_cents is a prepare-time error, not an ignored column." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-13",
      prompt: "SELECT month, SUM(revenue) OVER (ORDER BY month) FROM month_spine — on the 14-bucket traffic spine, what does the window column print?",
      choices: ["Each month's own revenue", "The running cumulative revenue, ending at 34,833.28 in 2025-02", "The next month's revenue", "The month-over-month delta"],
      answer: 1,
      why: "With ORDER BY month and no frame clause, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — on a unique month key that is every row so far: a running total that reaches 34,833.28 on the last row.",
      notes: [
        { choice: 0, why: "Own revenue is plain SUM(revenue) GROUP BY month — no OVER() needed. The default frame with ORDER BY accumulates everything so far, which is the running total." },
        { choice: 2, why: "Next month's value is LEAD(revenue) OVER (ORDER BY month) — a different column with a different name and the same spine." },
        { choice: 3, why: "The delta is LAG's job — notably the only one of these that prints NULL on the first row; a running sum never goes NULL mid-spine." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-14",
      prompt: "RANK() OVER (ORDER BY lifetime_spend DESC) returns a global 1-to-16 leaderboard. What does the regional board need?",
      choices: ["ORDER BY region, lifetime_spend DESC", "RANK() OVER (PARTITION BY region ORDER BY lifetime_spend DESC)", "GROUP BY region before ranking", "DENSE_RANK() instead of RANK()"],
      answer: 1,
      why: "PARTITION BY region resets the rank inside each region while keeping every row — the board each ops team reads. The outer ORDER BY only sorts output; it never resets rank counters.",
      notes: [
        { choice: 0, why: "Ordering the output by region sorts the GLOBAL ranks — Alice Chen's EU-leading spend still prints rank 1 platform-wide, not rank 1 within EU. Sort is not partition." },
        { choice: 2, why: "GROUP BY collapses rows to one per region — there is nothing left to rank. Windows exist precisely to rank WITHOUT collapsing." },
        { choice: 3, why: "DENSE_RANK changes tie handling, not partition scope — the ladder would still run 1-to-16 across the whole platform." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-15",
      prompt: "COUNT(*) FILTER (WHERE status = 'delivered') is exactly equivalent to which classic shape?",
      choices: ["COUNT(status = 'delivered')", "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)", "COUNT(DISTINCT status)", "SUM(status = 'delivered')"],
      answer: 1,
      why: "Both count delivered rows in one pass: the CASE arms 1 for matches and 0 otherwise, FILTER simply restricts the aggregate's input. Same number, same scan.",
      notes: [
        { choice: 0, why: "COUNT counts NON-NULL values, and status = 'delivered' is never NULL — it is 0 or 1 — so this counts every row, not the matches. The classic boolean-COUNT trap." },
        { choice: 3, why: "Same trap in SUM's clothing: the boolean is never NULL, so this sums 1 for every row — all 103, not the 52 delivered." },
        { choice: 2, why: "COUNT(DISTINCT status) counts distinct statuses (4), not delivered rows — a different census entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-16",
      prompt: "GROUP_CONCAT(channel, ', ') folds each account's channels into one cell. What is guaranteed about the output?",
      choices: ["Channels appear alphabetically", "Membership only — the order of names inside the cell is not guaranteed", "Channels appear in usage order", "It errors if a group has more than one channel"],
      answer: 1,
      why: "GROUP_CONCAT guarantees membership and the separator — nothing about order. If the cell feeds a diff or a memo, sort deliberately (e.g. over a subquery with ORDER BY) or accept the nondeterminism explicitly.",
      notes: [
        { choice: 0, why: "No ORDER BY exists inside the aggregate — SQLite's GROUP_CONCAT takes only the separator — so alphabetical output is coincidence, not contract." },
        { choice: 2, why: "Usage order would require the rows to arrive pre-sorted in the plan — an implementation detail that silently changes between engine versions." },
        { choice: 3, why: "Multi-row groups are the entire point — a one-channel group just prints that channel with no separator." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-17",
      prompt: "Latency = julianday(shipped_at) - julianday(created_at), averaging 2.98 over 82 settled periods. What does CASTing each difference to INTEGER before averaging do to the mean?",
      choices: ["Nothing — truncation is symmetric across orders", "It biases the mean systematically low — every fractional day is floored before the fold", "It biases the mean high", "It errors — you cannot CAST a day difference"],
      answer: 1,
      why: "Truncation floors EVERY order toward zero before the fold, so the average of the floored values is systematically below 2.98 — a bias, not noise. The discipline: aggregate in full precision, ROUND once at the print edge.",
      notes: [
        { choice: 0, why: "The bias is one-directional (floor only goes down), so it accumulates instead of canceling — the report reads faster than reality every month." },
        { choice: 3, why: "The subtraction and CAST run fine — which is exactly why the bug is dangerous: a number prints, it is just quietly wrong." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-18",
      prompt: "invoices LEFT JOIN payments on invoice_id yields 33 rows; COUNT(*) = 33 but COUNT(p.id) = 27. What is the 6-row gap?",
      choices: ["Six duplicate payments", "The six never-settled bills — NULL-filled rows that COUNT(p.id) skips", "Six voided invoices", "A join bug — the two counts must agree"],
      answer: 1,
      why: "27 payment rows matched; the 6 unmatched invoices arrive NULL-filled. COUNT(*) counts all 33 rows, COUNT(p.id) counts non-NULL payment ids — the 6-row difference IS the dunning list, computed by an aggregate.",
      notes: [
        { choice: 0, why: "The matched rows are the 27 actual payments — duplicates would show as MORE than 27, not fewer. The gap is unmatched invoices, pure and simple." },
        { choice: 3, why: "The disagreement is the feature: COUNT(*) versus COUNT(nullable column) is the standard instrument for measuring unmatched rows in a LEFT JOIN." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-19",
      prompt: "NOT IN (SELECT customer_id FROM staging_extract) returns zero rows although the extract clearly holds customers — and three rows with NULL customer_id. Why?",
      choices: ["The subquery returned no rows", "x NOT IN (…, NULL, …) is never TRUE — one NULL in the set poisons every comparison to UNKNOWN", "NOT IN requires a JOIN", "The outer query's WHERE clause was dropped"],
      answer: 1,
      why: "x NOT IN (1, 2, NULL) evaluates each equality; x = NULL is UNKNOWN, so the NOT IN chain is UNKNOWN for every row and WHERE discards everything. Zero rows, valid plan, silent — the staging-table classic.",
      notes: [
        { choice: 0, why: "If the subquery were EMPTY, NOT IN would return EVERY outer row — the opposite failure. The zero-rows signature points at a NULL inside the set, not an empty set." },
        { choice: 2, why: "NOT IN needs no join — that is its appeal and its danger. The fixes are NOT EXISTS or the LEFT JOIN … IS NULL anti-join, both NULL-proof." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-20",
      prompt: "SUM(amount_cents)/100 truncates cents, yet AVG(amount_cents)/100.0 and AVG(amount_cents) never truncate. Why the asymmetry?",
      choices: ["AVG rounds automatically", "SQLite's AVG always returns REAL — while SUM over INTEGERs stays INTEGER, and INTEGER/INTEGER truncates", "amount_cents is REAL in disguise", "AVG refuses to run on INTEGER columns"],
      answer: 1,
      why: "Aggregate return types differ: SUM of INTEGER stays INTEGER (division by 100 then truncates), while AVG converts to REAL by contract. The cents rule — promote before dividing — exists precisely because SUM does not promote for you.",
      notes: [
        { choice: 0, why: "AVG never rounds — it returns the full REAL mean. The asymmetry is type promotion inside the aggregate, not rounding." },
        { choice: 2, why: "The column is declared INTEGER and stored as INTEGER — typeof(amount_cents) prints 'integer'; the promotion happens only inside AVG." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-21",
      prompt: "LATAM's delivery rate prints 100% — 2 delivered of 2 periods. APAC prints 56.8% on 37. Which statement belongs in the SLA board memo?",
      choices: ["LATAM is the best-performing region", "LATAM's rate carries a 2-period denominator — publish it only beside its base, and re-derive the platform rate (50.5) from sums, never by averaging regions", "Averaging the four regional rates gives the platform rate", "Region rates should be hidden from the board"],
      answer: 1,
      why: "The unweighted mean of 56.8 / 53.3 / 26.3 / 100 is 59.1, not the platform's 50.5 — LATAM's 2 periods would weigh the same as EU's 45. Rates re-derive from sums; small bases ride beside their denominators.",
      notes: [
        { choice: 0, why: "Two periods is a coin flip away from 50% — crowning LATAM on n=2 is the small-denominator headline that detonates in the next board meeting." },
        { choice: 2, why: "That average prints 59.1 — real math, wrong question. Only 52/103 re-derived at the top grain is the platform rate." },
        { choice: 3, why: "Hide nothing — publish rates WITH their bases. The board needs the split; it needs the denominators attached even more." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-22",
      prompt: "Which line correctly computes 'bills above the platform average'?",
      choices: ["WHERE total > AVG(total)", "WHERE total > (SELECT AVG(total) FROM orders)", "HAVING total > AVG(total)", "WHERE total > MAX(total)"],
      answer: 1,
      why: "Aggregates cannot run in WHERE (no groups exist yet), so the average is computed by a scalar subquery — one row, one column — and compared per row.",
      notes: [
        { choice: 0, why: "'Misuse of aggregate' — AVG(total) has no rows to average until GROUP BY forms, and WHERE runs before any fold. The subquery is the fix, not syntax sugar." },
        { choice: 2, why: "HAVING filters GROUPS — wrapping the whole table as one group changes the question and still cannot reference the bare alias this way." },
        { choice: 3, why: "Nothing exceeds the maximum — the query is valid and returns zero rows, the above-average report's quiet cousin." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-23",
      prompt: "orders (103 rows) joins order_items (251 rows) on order_id. SUM(o.total) over the join prints 103,244.55, not 34,833.28. What happened?",
      choices: ["The join dropped rows", "Fan-out: each period's total re-charges once per metered line — SUM over the fanned rows multi-counts headers", "order_items contains refunds", "Floating-point drift accumulated"],
      answer: 1,
      why: "The header measure repeats per line: SUM over the 251-row join sums each period's total once per line. The honest fold is fold-then-join — aggregate lines to the header grain first, then sum headers.",
      notes: [
        { choice: 0, why: "Joins multiply, they do not drop — 251 result rows proves every line found its header. Dropping would show FEWER rows, not 3x the dollars." },
        { choice: 3, why: "The overshoot is 3x, not epsilon — float drift is cents-on-millions territory. This is structural multi-counting, visible in the row count." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-24",
      prompt: "Pairing each of an account's periods with every OTHER period of the same account uses ON a.customer_id = b.customer_id AND a.id < b.id. Why the strict < ?",
      choices: ["It speeds the join up", "Without it every period pairs with itself, and each true pair appears twice — (a,b) and (b,a)", "It deduplicates the output", "It makes the pair count deterministic"],
      answer: 1,
      why: "The strict inequality removes self-pairs AND halves the mirrored pairs — each unordered pair survives exactly once. != still admits (b,a), doubling the census.",
      notes: [
        { choice: 0, why: "No index trick is implied — the < is pure set logic. The pair count from a.id != b.id is exactly double the honest one." },
        { choice: 3, why: "Determinism needs a tie-broken ORDER BY; the < governs which pairs EXIST — a different problem entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-25",
      prompt: "SELECT id, total, (SELECT AVG(total) FROM orders) AS ref FROM orders — the inner fold is UNCORRELATED. How often does it run, and what changes if you correlate it?",
      choices: ["Once per row either way", "Uncorrelated: evaluated once and reused; correlated: re-evaluated per outer row — a different question and a different cost", "Only once, correlated or not", "It errors without GROUP BY"],
      answer: 1,
      why: "An uncorrelated scalar subquery is a constant — engines evaluate it once; a correlated one (WHERE customer_id = o.customer_id inside) re-runs per outer row and answers 'versus MY account's average' instead. Cost and meaning change together.",
      notes: [
        { choice: 0, why: "That is the correlated cost applied to the uncorrelated case — engines cache the uncorrelated fold; the interview point is knowing WHICH kind you wrote." },
        { choice: 3, why: "A scalar subquery in the SELECT list needs no GROUP BY — it is an expression per row and executes fine." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-26",
      prompt: "WITH spine AS (SELECT SUBSTR(created_at,1,7) AS month, ROUND(SUM(total),2) AS revenue FROM orders GROUP BY month) SELECT * FROM spine WHERE revenue > 3000 — how many rows print?",
      choices: ["1", "3 — 2024-01 (3,731.97), 2024-02 (3,609.64), 2024-09 (3,116.04)", "7", "14"],
      answer: 1,
      why: "The spine folds 103 periods into 14 monthly buckets; three clear the 3,000 bar — the January open (3,731.97), February (3,609.64) and the September bump (3,116.04). The CTE stages the grain; the outer WHERE filters the fold.",
      notes: [
        { choice: 0, why: "One is the count above 3,500 — moving the bar changes membership, not the shape of the answer. At 3,000 it is three." },
        { choice: 3, why: "14 is the spine itself — forgetting the WHERE is the classic 'built the stage, shipped the rehearsal' bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "tw-mcq-27",
      prompt: "WHERE RANK() OVER (ORDER BY total DESC) <= 10 — what happens in SQLite?",
      choices: ["It returns the top 10 bills", "It errors — window functions are not allowed in WHERE; stage the ranking in a CTE or derived table, then filter", "It returns all rows ranked", "It silently returns NULL rows"],
      answer: 1,
      why: "Windows evaluate at SELECT time, after WHERE — referencing RANK() there is a prepare-time error. The fix is the stage-then-filter pattern: WITH ranked AS (…) SELECT … WHERE rk <= 10.",
      notes: [
        { choice: 0, why: "Even if it ran, 'top 10 by rank' is not LIMIT 10 the moment ties exist — but it never runs: the parser rejects window functions in WHERE outright." },
        { choice: 2, why: "SELECT-level windows keep all rows — but this line is in WHERE, and WHERE is where it dies. All-rows output is the CTE stage's job." },
      ],
      difficulty: "hard",
    },
    {
      id: "tw-mcq-28",
      prompt: "A leaderboard tied at 4 periods prints in one order on your laptop and another in production. The fix?",
      choices: ["RANK instead of ROW_NUMBER", "A deterministic tie-breaker: ORDER BY periods DESC, account_id — ties need a named second key", "LIMIT to hide the ties", "ORDER BY periods only, but cast to INTEGER"],
      answer: 1,
      why: "Ties without a secondary key make row order plan-dependent — different engines, different orders, same data. Reproducibility is a query property: name the tie-breaker in the ORDER BY and the report reruns identically.",
      notes: [
        { choice: 0, why: "Rank functions share rungs but do not order the OUTPUT — the printed order of equal-rank rows is still plan-dependent without the tie-break." },
        { choice: 2, why: "LIMIT truncates the board — the ties remain, and now the cut line between ranks is also nondeterministic. Worse, not better." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-29",
      prompt: "SELECT SUM(debit_cents), SUM(credit_cents) FROM ledger_entries returns 18,108,000 and 18,108,000 — delta zero. What does that prove?",
      choices: ["Every account balance is correct", "The books balance in aggregate — necessary for correctness, not sufficient; per-account and row-level checks still run", "The ledger has no anomalies", "Debits and credits are duplicated"],
      answer: 1,
      why: "A zero global delta proves debits equal credits in TOTAL — double-entry's necessary condition. It says nothing about whether cash's 44,196-cent net or accounts_receivable's 16,440-cent net are right; those need per-account folds and the row-level anomaly list.",
      notes: [
        { choice: 0, why: "Two wrong entries can balance each other perfectly — the global check is a sanity gate, never the audit itself. The per-account balances carry the real signal." },
        { choice: 2, why: "This db's anomaly list (void-but-paid #11, paid-with-no-rows #28, one partial) coexists with a perfectly balanced trial balance — balance and anomaly are orthogonal." },
      ],
      difficulty: "medium",
    },
    {
      id: "tw-mcq-30",
      prompt: "Banding bills: CASE WHEN total < 100 THEN 'sub-100' WHEN total < 300 THEN '100-299' ELSE '300+' END splits 103 periods into 15 / 39 / 49. A teammate reorders the arms, putting WHEN total < 300 first. What happens?",
      choices: ["Nothing — CASE arms are order-independent", "Every bill under 300 lands in the first arm — sub-100 prints 0 and the middle band inflates to 54 (15 + 39); 300+ survives on ELSE", "It errors — arms must ascend", "Only the 300+ band changes"],
      answer: 1,
      why: "CASE evaluates arms in order and takes the first TRUE: with '< 300' first, a 24.99 bill matches it and never reaches '< 100' — sub-100 prints 0, the middle band swells to 54, and 300+ stays 49. Arm order IS the definition.",
      notes: [
        { choice: 0, why: "That is the trap stated as fact — CASE is explicitly sequential; reordering arms re-partitions the base whenever arms overlap, and these do." },
        { choice: 3, why: "The top band is the only one bounded by ELSE, so it survives — but sub-100 collapsing to zero and the middle swelling to 54 silently re-defines every other band." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-tw-1",
      tier: "medium",
      topic: "j5",
      universe: "fraud",
      title: "The dunning anti-join",
      brief:
        "Twilio-flavored brief on the storefront db: before the reminder cycle goes out, the billing desk runs the anti-join — every usage bill with NO payment row behind it — and treats the output as the dunning list, not a report. Probed facts: 6 bills never settled, worth 15,217 in balance; one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows, so it routes to the anomaly queue instead of the reminder queue; the mirror anomaly exists too — a void bill (#11, 925.00) WITH a payment row. The desk reads the list biggest-balance-first, and the survival rule is explicit: rows whose join finds no payment ARE the answer, so the join must keep them.",
      ask: "Return every bill that has no settlement row — id, claimed status and billed cents — biggest balance first.",
      template:
        "SELECT i.id AS invoice_id,\n       i.status AS claimed_status,\n       i.amount_cents AS billed_cents\nFROM invoices i\n{1} payments p ON p.invoice_id = i.id\nWHERE p.id {2}\nORDER BY billed_cents {3};",
      slots: [
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the survival rule",
          why: "LEFT JOIN keeps every bill and NULL-fills the ones with no settlement — that NULL row IS the dunning list. INNER JOIN would drop exactly the six unpaid bills and the reminder cycle would run on nobody.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the unmatched-row filter",
          why: "p.id IS NULL selects the NULL-filled survivors — the never-settled bills. IS NOT NULL returns the opposite list (all settled bills) and dunning would email customers who already paid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-balance-first direction",
          why: "The desk works largest exposure first: 493,700 cents down to 87,300. ASC would put the smallest balance on top and the bill that matters most — 493,700 cents — would sit at the bottom of the queue.",
        },
      ],
      distractors: ["INNER JOIN", "IS NOT NULL", "ASC", "COUNT"],
      walkthrough:
        "One anti-join, read as an operational list. LEFT JOIN invoices to payments on invoice_id — every one of the 28 bills survives, the 22 with settlements carrying payment payloads and the 6 without arriving NULL-filled — and p.id IS NULL keeps exactly the unmatched rows: #24 at 493,700 cents, #26 at 356,200, #27 at 279,400, #28 at 175,600, #21 at 129,500, #18 at 87,300, ordered biggest-first. The list is the money story the desk acts on: 6 bills, 15,217 in balance, and the #28 row is the fraud flag — status claims 'paid' while the join found no settlement, so it routes to the anomaly queue beside its mirror image, the void bill #11 that DID receive a 925.00 payment. The distractors each break a different way: INNER JOIN (and plain JOIN) deletes the unmatched rows and returns an empty list — the bills vanish precisely because they are the answer; IS NOT NULL flips the list to settled bills and the reminder cycle emails paid customers; ASC buries the largest exposure; COUNT in the comparison slot is a syntax break. This is why the survival rule gets stated before the query is written: on an anti-join, the join type is the business decision.",
    },
    {
      id: "cs-tw-2",
      tier: "hard",
      topic: "s6",
      universe: "month-close",
      title: "The settlement-coverage census",
      brief:
        "Twilio-flavored brief on the storefront db: month-end close ends with the settlement-coverage census — every bill classified exact / partial / never-collected, with the classes summing back to the invoice base before the close signs. Probed facts: 28 bills split 21 exact (65,612 billed), 6 never-collected (15,217), 1 partial (#25: 6,148 billed, 4,000 settled); payment rows are the ledger of record, so a claimed status of 'paid' with zero rows (#28, 1,756.00) lands in never-collected regardless of its label. The census reads most-populous class first, and the arm order is the contract: the no-payment arm must fire before any SUM comparison, or NULL semantics will misclassify the never-collected class as exact.",
      ask: "Return each coverage class with its bill count and total billed dollars, most-populous class first.",
      template:
        "SELECT coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(billed_cents) / 100.0, 2) AS billed_dollars\nFROM (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         CASE WHEN {2} THEN 'never collected'\n              WHEN SUM({3}) < i.amount_cents THEN 'partial'\n              ELSE 'exact' END AS coverage\n  FROM invoices i\n  {1} payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY invoices {4};",
      slots: [
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the keep-unpaid-bills join",
          why: "LEFT JOIN lets the six never-settled bills reach the classification with NULL payment columns. INNER JOIN deletes them before the CASE runs and the close would sign with 15,217 of AR invisible.",
        },
        {
          answer: "p.id IS NULL",
          kind: "keyword",
          label: "the no-payment arm",
          why: "The first arm must catch zero-row bills explicitly: SUM over no rows is NULL and NULL comparisons never fire, so a bill with no settlements would otherwise fall to ELSE and read 'exact'. #28 — 1,756.00 claimed paid — is the standing proof.",
        },
        {
          answer: "p.amount_cents",
          kind: "keyword",
          label: "the settled-side fold",
          why: "Partial means settlements BEHIND the bill: SUM(p.amount_cents) < billed. Folding the bill's own amount against itself can never trail (x < x is false) and the partial class — #25's 4,000 of 6,148 — disappears.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-populous-first direction",
          why: "The close reads the biggest class first: exact 21, never-collected 6, partial 1. ASC would open on the single partial bill — the least representative row of the base.",
        },
      ],
      distractors: ["INNER JOIN", "p.id IS NOT NULL", "i.amount_cents", "ASC"],
      walkthrough:
        "Two stages: classify per bill, then fold per class. The inner query LEFT JOINs 28 bills to their payment rows and groups by bill id; the CASE fires in contract order — p.id IS NULL catches the six never-collected bills first (including 'paid'-claiming #28, because the payment rows outrank the label), then SUM(p.amount_cents) < i.amount_cents catches #25 (4,000 settled of 6,148 billed) as partial, and everything else — 21 bills — lands exact. The outer fold prints one row per class: exact 21 / 65,612.00, never-collected 6 / 15,217.00, partial 1 / 6,148.00 — and the audit the close demands is that 21 + 6 + 1 = 28 bills and 65,612 + 15,217 + 6,148 = the invoice base. The distractors each break a different way: INNER JOIN deletes the never-collected class before classification; p.id IS NOT NULL inverts the first arm, labeling every settled bill 'never collected' and letting the unpaid six fall through to ELSE as 'exact'; i.amount_cents in the fold self-compares and the partial class vanishes; ASC flips the census to lead with the lone partial. The arm-order lesson is the CASE's NULL contract: SUM is NULL on empty groups while COUNT is 0 — one aggregate, two different empty-case behaviors, and the whole census hangs on knowing which.",
    },
    {
      id: "cs-tw-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The traffic walk, month over month",
      brief:
        "Twilio-flavored brief on the storefront db: the capacity meeting opens on the traffic walk — every billing period bucketed by month, revenue folded to two decimals, and a LAG column printing the month-over-month delta so the room sees motion, not levels. Probed facts: the 14-month spine runs 2024-01 (3,731.97) to 2025-02 (2,390.53); the deepest sag is 2024-11 at -1,326.87 (1,648.80 against October's 2,975.67); the sharpest rebound is 2024-08 at +1,158.21 (2,352.07 off July's 1,193.86 floor). The first row's delta is NULL by construction — January has no prior month — and the desk reads that NULL as baseline, never as zero. The walk ships oldest month first, one row per month, 14 rows total.",
      ask: "Return the 14-month traffic walk — month, revenue and the month-over-month delta — oldest month first.",
      template:
        "SELECT month,\n       revenue,\n       ROUND(revenue - {1}, 2) AS delta\nFROM (\n  SELECT {2} AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nORDER BY {3};",
      slots: [
        {
          answer: "LAG(revenue) OVER (ORDER BY month)",
          kind: "keyword",
          label: "the prior-month column",
          why: "LAG ordered by month pairs each month with its predecessor — the delta's whole meaning. LEAD flips the sign (every sag prints as a rebound); SUM(revenue) OVER turns the walk into running-total arithmetic and every delta into nonsense.",
        },
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month spine",
          why: "The '%Y-%m' slice keeps the 14 buckets distinct across both years. The (6,2) month-only slice merges January 2024 with January 2025 into one bucket — 12 rows where 14 belong, and every delta pairs the wrong months.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the oldest-first order",
          why: "The desk reads the walk left to right in calendar order; a delta only means something beside its own neighbors. Ordering by revenue scrambles months against deltas and the story collapses even though every number is technically present.",
        },
      ],
      distractors: ["LEAD(revenue) OVER (ORDER BY month)", "SUBSTR(created_at, 6, 2)", "created_at", "DESC"],
      walkthrough:
        "One spine, one window, one order — the walk is three decisions deep. The spine slices created_at to '%Y-%m' and folds 103 periods into 14 monthly revenues: 3,731.97 opening, down to the 1,193.86 July floor, back to 2,390.53 in 2025-02. LAG(revenue) OVER (ORDER BY month) then pairs each month with its predecessor: February -122.33, March -992.56, May +441.40, the August rebound +1,158.21, the November sag -1,326.87 — and January's delta is NULL because nothing precedes it, which the desk labels baseline rather than zero (coalescing it to 0 would print a phantom flat month). ORDER BY month ships it oldest-first. The distractors each break differently: LEAD pairs every month with its SUCCESSOR and inverts every sign; the (6,2) slice merges both Januaries and both Februaries into shared buckets — 12 rows of wrong pairs; raw created_at refuses to fold, yielding 103 month 'buckets' and a 103-row walk; DESC reverses the calendar so the room reads the ending first. Window discipline is the lesson: the OVER clause's ORDER BY defines the pairings, the frame defines the arithmetic, and neither may be borrowed from the outer ORDER BY.",
    },
    {
      id: "cs-tw-4",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass SLA census",
      brief:
        "Twilio-flavored brief on the storefront db: the SLA board is a per-region census taken in a single pass — every region's billing periods, its delivered count, its delivered share, and the dollars the delivered traffic billed, all via FILTER (WHERE …) so one scan answers four questions. Probed facts: 103 periods split EU 45 / APAC 37 / US 19 / LATAM 2; delivered runs EU 24, APAC 21, US 5, LATAM 2 — shares 53.3 and 56.8 on the two regions that clear the board's 37-period materiality floor. The floor is stated in the memo because it is doing real work: this week the US (19) and LATAM (2) fall off the page. The delivered share re-derives from sums with 100.0 promoted before the division — the platform rate is 50.5, an average of regional rates would print 59.1, and only the weighted fold is the truth.",
      ask: "Return the SLA board — region, periods, delivered count, delivered share and delivered revenue — for regions clearing the 37-period floor, biggest book first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS periods,\n       COUNT(*) FILTER (WHERE o.status = 'delivered') AS delivered,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'delivered') / COUNT(*), 1) AS delivered_pct,\n       ROUND(SUM({1}) FILTER (WHERE o.status = 'delivered'), 2) AS delivered_revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY periods {3};",
      slots: [
        {
          answer: "o.total",
          kind: "keyword",
          label: "the revenue fold",
          why: "Delivered dollars means summing the period's billed total over delivered rows — orders.total is REAL dollars, summed directly. o.customer_id folds foreign keys into garbage; o.unit_price does not exist on orders and dies at prepare.",
        },
        {
          answer: "37",
          kind: "number",
          label: "the materiality floor",
          why: "The memo's floor: regions carrying at least 37 billing periods make the board. EU (45) and APAC (37) clear it; the US (19) and LATAM (2) fall off. The threshold is a stated business constant, not a computed one.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first order",
          why: "The board leads with the largest book: EU 45, then APAC 37. ASC would open on the smallest qualifying region and bury the headline row the room came to see.",
        },
      ],
      distractors: ["o.customer_id", "o.unit_price", "38", "ASC"],
      walkthrough:
        "One scan, four answers, one floor. The join inherits region onto every period; FILTER (WHERE o.status = 'delivered') restricts each aggregate to delivered rows without collapsing the census — EU prints 45 periods, 24 delivered, 53.3%, 6,656.18 delivered revenue; APAC prints 37, 21, 56.8%, 6,617.68. The HAVING floor >= 37 then drops the US (19 periods, 5 delivered) and LATAM (2, 2) — a stated materiality cut, not a data judgment. ORDER BY periods DESC leads with EU. The distractors each break differently: SUM(o.customer_id) folds foreign keys — big numbers, zero meaning; o.unit_price is not a column of orders and the query dies at prepare; floor 38 silently evicts APAC (37 < 38) and the board ships with one region; ASC flips the lead to APAC. The share column is the quiet lesson: 100.0 * delivered / COUNT(*) re-derives the rate from sums — 52 of 103 platform-wide is 50.5, while averaging the regional rates would print 59.1 — and the weighted fold is the only one that survives a finance review.",
    },
    {
      id: "cs-tw-5",
      tier: "easy",
      topic: "q2",
      universe: "pricing",
      title: "Above the platform average",
      brief:
        "Twilio-flavored brief on the storefront db: the pricing desk screens for big-traffic periods — every billing period whose bill clears the platform's own average, biggest first. Probed facts: the platform average bill is 338.19 across the 25.47-to-1,088.44 spread; 42 periods clear it, carrying 24,309.68 — 69.8% of the 34,833.28 platform total inside 40.8% of the rows. The definition is the deliverable: 'above average' means above the average of ALL 103 periods — queued and failed traffic included in the base — and the scalar subquery that computes it must keep its contract: one row, one column. The reference line belongs in the memo, because a screen's output is meaningless until the reader knows what it is measured against.",
      ask: "Return every period billing above the platform average — id, status and bill — biggest bill first.",
      template:
        "SELECT o.id AS period_id,\n       o.status,\n       o.total AS billed\nFROM orders o\nWHERE {1} > (SELECT AVG(total) FROM orders)\nORDER BY {2} {3};",
      slots: [
        {
          answer: "o.total",
          kind: "keyword",
          label: "the compared column",
          why: "The screen compares each period's BILL to the average bill — o.total, the billed dollars. o.id compares row ids (max 103) against a 338.19 threshold and the report ships empty; o.created_at compares TEXT against a number, and in SQLite every text beats every number, so all 103 rows pass.",
        },
        {
          answer: "billed",
          kind: "keyword",
          label: "the ordering column",
          why: "Biggest bill first means ordering by the bill itself — the billed alias. Ordering by period_id ranks rows by row number, which is admin order, not commercial order.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC puts the 1,088.44 head of the book on top, where the pricing desk reads it first. ASC opens on the smallest above-average bill and buries the headline.",
        },
      ],
      distractors: ["o.id", "o.created_at", "period_id", "ASC"],
      walkthrough:
        "One scalar, one comparison, one order — the entry-level subquery screen. The inner fold computes the platform average: SUM(total)/COUNT over all 103 periods, 338.19, queued and failed included in the base because the definition says ALL periods. The outer WHERE keeps the 42 periods whose bill clears it — from the 1,088.44 head down — and those 42 carry 24,309.68, 69.8% of platform dollars in 40.8% of the rows; ORDER BY billed DESC ships the head first. The scalar's contract is the teaching point: one row, one column — an empty inner fold (a filtered staging table, say) returns NULL, total > NULL is UNKNOWN, and the report ships zero rows while looking valid. The distractors each break differently: o.id compares integers 1-103 against 338.19 — nothing survives, an empty report with valid syntax; o.created_at is TEXT, and text outranks numbers in SQLite's type order, so ALL 103 rows pass; ordering by period_id prints admin order instead of commercial order; ASC opens on the smallest qualifying bill. State the denominator — the average of ALL periods — before writing the subquery, because that sentence is the definition.",
    },
    {
      id: "cs-tw-6",
      tier: "hard",
      topic: "s3",
      universe: "fraud",
      title: "Paid claims, no evidence",
      brief:
        "Twilio-flavored brief on the storefront db: the month-end fraud sweep asks one set question — which bills CLAIM paid but have no settlement rows behind them? The status column is a claim; the payment rows are the ledger of record. Probed facts: 21 bills carry the paid label; 22 distinct bills are payment-backed (the partial #25 is open but backed by 4,000 of 6,148); the set difference — paid claims EXCEPT backed ids — returns exactly one row: #28, the 1,756.00 bill whose status lies. Its mirror image, the void bill #11 that DID receive a 925.00 payment, stays invisible to this sweep — a different anomaly for a different query. The sweep must tolerate payload differences and duplicate rows on the backed side, which is why the id-only set shape is the contract.",
      ask: "Return the id of every bill whose status claims paid but which has no settlement row — the paid-claims-without-evidence set.",
      template:
        "SELECT id AS flagged_invoice\nFROM invoices\nWHERE status = {1}\n{2}\nSELECT {3}\nFROM payments;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the claimed-status filter",
          why: "The sweep tests the PAID claim — that is the fraud surface. Filtering 'open' instead yields the five open bills with no payments (18, 21, 24, 26, 27) — a dunning list, not a fraud list — and 'void' yields nothing because the void bill #11 IS backed.",
        },
        {
          answer: "EXCEPT",
          kind: "keyword",
          label: "the set difference",
          why: "Paid claims minus payment-backed ids: the difference IS the answer. INTERSECT returns the 20 honest paid bills; UNION merges both sides into 23 ids and the one fraud flag drowns in the middle of them.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the backed-side key",
          why: "The right side must project the same grain: payments.invoice_id, the bill each settlement backs. Any other column changes the comparison set — paid_on compares TEXT dates against INTEGER ids, nothing matches, and the sweep floods with all 21 paid claims.",
        },
      ],
      distractors: ["'open'", "INTERSECT", "UNION", "paid_on"],
      walkthrough:
        "A set operation is the honest tool when the question is 'claimed minus evidenced'. The left side projects the 21 paid claims; the right side projects the 22 distinct backed invoice ids — 22, not 27, because five bills settle across two payment rows and duplicates collapse in a set. EXCEPT returns exactly {28}: one flagged invoice, the 1,756.00 bill claiming paid with zero settlement rows, which routes to the anomaly queue beside its mirror image — void #11 with a 925.00 payment, invisible to this sweep because its status is not the one being tested. The distractors each break differently: filtering 'open' runs a dunning query (five rows: 18, 21, 24, 26, 27) and never touches the paid-claim fraud surface; INTERSECT returns the 20 paid bills that ARE backed — the honest list, the opposite of the ask; UNION merges 21 claims with 22 backed ids into 23 rows and the one flag you need is buried; paid_on on the right side compares TEXT dates against INTEGER ids — nothing matches, and the sweep returns all 21 paid claims, flooding the queue with honest bills. Grain discipline is the lesson: both sides must project the same key at the same grain, or the set algebra computes a confident answer to a question nobody asked.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — the delivery-rate question in textbook clothing: 52 of 103 entered, not 52 of 59 resolved." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across accounts — the percentage of messaging accounts a campaign touched, with the 100.0-before-division fix this kit drills." },
    { slug: "confirmation-rate", why: "Confirmation-rate joins with NULL-safe division — the delivery-callback shape: confirmations ÷ attempts, account by account." },
    { slug: "combine-two-tables", why: "Account enrichment LEFT JOIN — account attributes attached to every billing period, NULL-safe for rows the traffic hasn't touched." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly census at two grains: billing periods AND accounts active per month — load versus audience in one query, the way ops reviews open." },
    { slug: "average-selling-price", why: "Per-unit channel economics — the join-then-weigh pattern that prices metered units into channel spend, 97 units into 11,744.01." },
    { slug: "bank-account-summary-ii", why: "Per-account debit/credit folds with NULL-safe arms — the per-account billing rollup CPaaS billing desks run before any dunning cycle." },
    { slug: "gl-reconciliation", why: "Ledger-grade reconciliation — counts and sums agreeing between the meter and the invoice, the culture this kit's settlement census enforces." },
    { slug: "number-of-accounts-that-did-not-stream", why: "The silent-accounts anti-join — accounts with zero traffic. On this db the honest answer is 0, and proving a confident zero is the analyst's job." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself: LEFT JOIN + IS NULL as a survival rule — the exact shape of the dunning list, drilled until it's reflex." },
    { slug: "find-longest-calls", why: "Argmax over traffic durations — the throughput-leaderboard shape ops uses to find the slowest delivery paths per account." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency folds — the delivery-latency read (2.98-day average, 2-to-4 range) grouped by the account or region doing the work." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before any throughput leaderboard ships, with the shared-rung policy said out loud." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Above-average screens via subquery — the empty-inner-query trap in textbook clothing, and the follow-up every CPaaS panel is fishing for." },
    { slug: "duplicate-charge-pairs", why: "Self-join anomaly detection on billing rows — the duplicate-settlement hunt that pairs naturally with this db's split-payment invoices." },
    { slug: "monthly-transactions-i", why: "Month-bucketed conditional folds — the traffic-calendar idiom where '%Y-%m' versus '%m' is the difference between a trend and two merged years." },
    { slug: "game-play-analysis-i", why: "First-traffic date per account — the activation read: which messaging account lit up first, the MIN(created_at) fold every cohort story starts from." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Trailing-window traffic census — activity between two dates; the rolling read ops uses for the last-30-days version of the 103-period calendar." },
    { slug: "daily-leads-and-partners", why: "Per-day status counts with a percentage column — the daily delivery-health shape: counts, shares, and the 100.0-promotion discipline in one query." },
    { slug: "number-of-rich-customers", why: "Threshold census — accounts whose billing clears a band; the plain-WHERE version of the big-traffic screen (42 periods above 338.19 on this db)." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax by period count — the account carrying the most billing periods; ORDER BY + LIMIT with the tie policy said out loud, not assumed." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Top channel per account — per-group argmax, the channel-stack read: every account's dominant metered product, ranked." },
    { slug: "queries-quality-and-percentage", why: "Ratio plus percentage with ROUND discipline — the quality-share shape behind delivery-rate columns, printed to one decimal against a stated denominator." },
    { slug: "weather-type-in-each-country", why: "CASE buckets joined to regions — weather classes map to status bands: the joined-conditional-census grammar of the SLA board." },
    { slug: "null-blank-audit", why: "Callback-completeness audit — COUNT the NULLs that shouldn't exist; the shipped-with-no-callback hunt is this problem in CPaaS clothing." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe — keep the LATEST callback per message; the exact anti-duplicate move a status-ledger rebuild needs." },
    { slug: "second-most-recent-activity", why: "Second-latest event per entity — the penultimate settlement per bill; offset-window reading without collapsing the account." },
    { slug: "employee-bonus", why: "LEFT JOIN with NULL payload — bills and their settlements where absence must survive; the coverage-census join in miniature." },
    { slug: "transactions-per-visit-histogram", why: "Histogram with a zero-bucket — visits without transactions map to periods without deliveries; the empty-band row that proves a confident zero." },
    { slug: "biggest-window-between-events", why: "Max gap between events per account — the dormancy metric: days of silence between metered lines, per messaging account." },
    { slug: "chargeback-rate-ranking", why: "Rate computation plus HAVING-gated ranking — the failure-rate leaderboard per account, denominator defended before the ORDER BY." },
    { slug: "active-businesses", why: "Thirty-day-active threshold census — accounts clearing an activity bar in a window; the materiality-floor shape this kit's SLA board uses." },
  ],
};
