// Databricks — Wave-9 (Task 98), saas domain. NEW kit, standard wave-8 volume.
// The lakehouse as the product: Delta Lake open tables, SQL warehouses
// (serverless + classic), Unity Catalog governance, notebooks/jobs/streams —
// monetized in DBUs (Databricks Units), consumption pricing. This kit writes
// its OWN angle (open lakehouse + DBU burn by workload, warehouse usage,
// governance), distinct from the Snowflake sibling's closed-credits read.
// Storefront db mapping (stated, honest): customers = workspace accounts
// (region = cloud market), orders = DBU consumption periods (delivered =
// committed/contracted usage billed, shipped = on-demand usage with shipped_at
// as the usage-window stamp, pending = queued awaiting warehouse startup,
// cancelled = killed queries), order_items = workload line records
// (quantity = units, unit_price = per-DBU rate by tier), products = workload
// SKUs, suppliers = cloud marketplace partners (AWS/Azure/GCP resellers),
// invoices = consumption billing statements, payments = billing rails,
// expenses = platform opex, ledger_entries = GL. Money tables are INTEGER
// cents (/100.0); orders.total and unit_price are REAL dollars.
// Pool provenance: company-pools.md carries NO Databricks section — exactly
// one co-tagged SQL row exists (late-arriving-restatement, shared with
// Snowflake) and it anchors the problem pool; the other 45 slugs are
// theme-curated from the pools file's SQL theme menu (sql rows only, no
// w*/d*/f* rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const databricksKit: CompanyKit = {
  id: "databricks",
  domainId: "saas",
  name: "Databricks",
  tagline: "Lakehouse consumption economics: DBUs, Delta, Unity Catalog",
  accent: "text-red-300",

  brief: [
    "**Databricks** is the lakehouse company — the platform that merged the data warehouse and the data lake into one open architecture: {orange:Delta Lake} tables with ACID guarantees, SQL warehouses that scale serverless, Unity Catalog governing every table and query, and notebooks, jobs and streams running the workloads in between. It monetizes consumption, not seats: customers burn Databricks Units (DBUs) per second of warehouse compute, per job run, per endpoint hour — so the company's usage telemetry IS its income statement, and the Snowflake-rival story is told in burn rates, not license counts. This kit maps the storefront db onto that world honestly: the 16 customers rows are workspace accounts (region = cloud market), the 103 orders are **DBU consumption periods worth 34,833.28**, and the 251 order_items rows are workload line records — quantity = units, unit_price = per-DBU rate by tier — across 16 workload SKUs. The status map is fixed: delivered = {emerald:committed-billed} (52, 50.5%), shipped = on-demand (30, 29.1%), pending = queued awaiting warehouse startup (14, 13.6%), cancelled = {rose:killed queries} (7, 6.8%).",
    "The data org models the platform from the inside, and three pods own the spine. Usage analytics owns the burn fold: workload lines joined to the rate card and aggregated per period, per family, per cloud market — the calendar runs **2024-01 to 2025-02** with a 3,731.97 burn peak and a 1,193.86 trough, and **82 of 103 periods** carry a usage-window stamp (shipped_at) averaging **2.98 days** with a 2–4 day spread. Billing analytics owns the statements book — 28 invoices against 27 payment legs in INTEGER cents, where the dollar read is `amount_cents / 100.0` — and the reconciliation culture is ledger-grade: the trial balance closes at **181,080 against 181,080** or the close does not ship. Governance analytics owns the Unity Catalog angle: lineage, access, and the audit trails that say who queried what, when.",
    "Interview screens are census-then-denominator, with consumption economics as the accent. A typical loop opens with a **two-grain market census** — EU runs 45 periods from 8 accounts (15,089.23) while the US runs 19 from 2 (7,286.16) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a killed query count in your base?'* — 7 of 103, or 8.1% in APAC versus 5.3% in the US), then into the concentration read: **63.5%** of the book sits with accounts whose lifetime spend crosses 3,000 (71.2% above 2,000). Late rounds walk the {orange:billing-basis mix} — committed versus on-demand per market — and probe NULL policy on the 14 queued periods that have no usage window yet. Candidates who narrate the fold and the filter placement before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Databricks section — exactly one co-tagged SQL row exists (`late-arriving-restatement`, shared with Snowflake) and it anchors the problem pool — so the other 45 slugs here are **theme-curated** to this kit's known screen shapes: burn folds, two-grain censuses, CASE-banded billing mixes, cents-safe billing spines and watermark hygiene. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {orange:workload burn census} the platform review opens with, the other rebuilds the {sky:billing-basis mix board} the CFO reads quarterly. The bar to clear: *state the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**09:00 —** The day starts on the burn dashboard. A usage analyst opens the overnight fold before standup: did last night's jobs and warehouse loads land, does the one-pass fate census reconcile — 52 committed + 30 on-demand + 14 queued + 7 killed = **103 by construction** — and did the serverless queue drain, or are the **14 pending** periods still waiting on warehouse startup? The first query of the day is almost always a reconciliation: line records against the 251-row expectation, burn against the 34,833.28 book. A killed-query spike — {rose:7 on the book}, but concentrated 8.1% in APAC versus 5.3% in the US — is *the day's first incident*, not a rounding note.",
    "**12:30 —** Midday is the rate-card deep-dive. A platform partner wants blended per-DBU rates by workload family — {orange:Audio's 11,744.01} on 97 units against Accessories' 3,294.29 on 121 — to argue which SKUs deserve serverless capacity; finance wants the {emerald:committed-versus-on-demand mix} re-cut per cloud market (the US is the one market where metered out-burns contract, 10 periods to 5); a regional VP wants concentration beside coverage — EU's 45 periods from 8 accounts versus the US's 19 from 2. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pricing-review argument*.",
    "**16:00 —** The afternoon tilts toward money and governance. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before billing sends a reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-billed statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). Then the Unity Catalog hour: an access audit walks which service principals touched which tables, and the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "DBU burn", what: "Consumption per period folded from workload lines: 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread. The headline every capacity and revenue review starts from — and the total every fold must reconcile to." },
    { name: "Billing-basis mix", what: "Committed-contract usage versus on-demand metered usage: 52 delivered-billed (50.5%) versus 30 shipped (29.1%) of 103 periods. The commercial mix board — the US is the only market where on-demand out-runs committed, 10 periods to 5." },
    { name: "Warehouse-startup queue", what: "Periods queued awaiting warehouse startup: 14 of 103 (13.6%), none carrying a usage-window stamp yet. The capacity-latency signal — 'not yet' is a population definition, never a silent zero." },
    { name: "Killed-query share", what: "Killed periods ÷ all periods: 7 of 103 (6.8%), sliced by cloud market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The reliability read that drives warehouse sizing and autoscaling policy." },
    { name: "Usage-window latency", what: "Booking to usage-window stamp (created_at → shipped_at) over stamped periods only: 82 of 103, averaging 2.98 days with a 2–4 day spread. The population ships with the number — queued periods have no window yet and must not dilute it." },
    { name: "Account concentration", what: "Share of the book from accounts spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The skew metric a consumption business reports instead of a logo count — one lost account moves a quarter." },
    { name: "Billing-run coverage", what: "Statements settled versus billed: 21 exact, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join finance refreshes every close before dunning goes out." },
    { name: "Ledger close identity", what: "Trial balance 181,080 debits against 181,080 credits, delta zero; the rails behind it run card 16 legs / 37,364 versus wire 11 / 32,248. A close that cannot reproduce the identity is an incident, not a note." },
  ],

  topics: [
    {
      name: "Consumption-period censuses",
      why: "Every Databricks review opens with a fold: periods, accounts, burn — grouped and counted without letting the grain blur. COUNT(*) counts consumption periods, COUNT(DISTINCT customer_id) counts workspace accounts; the calendar's 103 periods come from just 16 accounts, and the census is where candidates prove they know which grain they're standing on.",
      slugs: ["product-sales-analysis-ii", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "The burn calendar",
      why: "Consumption is calendar arithmetic: month buckets over created_at, then trend reads against the 3,731.97 peak and the 1,193.86 trough. Databricks screens drill the '%Y-%m' spine because every burn chart in the business hangs on it — and a '%m'-without-year fold merges January 2024 with January 2025 into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Workload-line joins",
      why: "Workload lines carry no family names — the burn-by-SKU read is a join to the rate card, and the join type decides who survives. A line without a SKU is corruption; a SKU without lines is dead catalog space — though on this db every SKU burns somewhere, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "top-travellers"],
    },
    {
      name: "Concentration and skew",
      why: "63.5% of the book sits with accounts over 3,000 lifetime — skew is the business model, and screens make you compute it: top accounts, their share of the whole, the count behind the share. The denominator is the entire test; a concentration ratio over the wrong base flatters nobody honestly.",
      slugs: ["number-of-rich-customers", "top-earners", "winning-candidate"],
    },
    {
      name: "Blended-rate economics",
      why: "Per-DBU rate cards are weighted folds: burn divided by units, per family, per tier — Audio's 11,744.01 on 97 units reads a very different rate than Accessories' 3,294.29 on 121. Ratio shapes with honest numerators and denominators are the pricing-screen grammar.",
      slugs: ["average-selling-price", "queries-quality-and-percentage", "low-quality-problems"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets committed, on-demand, queued and killed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "CASE banding & billing-basis mixes",
      why: "Billing basis is CASE-classified — committed, on-demand, queued, killed — with the arms pivoting into columns for the CFO's mix board. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue story, and a reordered WHEN quietly re-labels the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Share-of-book windows",
      why: "Market shares are window reads: each period's burn beside its market's total via SUM() OVER (PARTITION BY cloud_market), or each account's share of the 34,833.28 book. Databricks drills the partition idiom because consumption shares are computed at line grain and defended at board grain.",
      slugs: ["find-the-team-size", "portfolio-weights", "project-employees-iii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 statements, 27 legs, INTEGER cents) are where the lakehouse world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Late data, watermarks & governance",
      why: "A lakehouse whose customers bill off the same feeds the dashboards read treats late data as a first-class event: a watermark per feed, restated periods instead of silent appends, and keep-latest dedupe on the staging tables. Governance closes the kit because Unity Catalog's audit trails are queries too — who touched what, and which rows changed after the fact.",
      slugs: ["keep-latest-dedupe", "snapshot-delta-detect", "null-blank-audit"],
    },
  ],

  theory: [
    {
      id: "databricks-t1",
      q: "Your burn report joins workload lines to the rate card and statements to payment legs. When is INNER honest, when must it be LEFT — and what does joining statements to legs do to your counts?",
      a: "Decide from the survival rule the question implies, then watch the grain. A burn-by-family report joins workload lines to SKUs: a line with no SKU is corruption, so INNER is honest — and worth a data-quality flag rather than a silent filter. A dead-catalog report must be LEFT from products: SKUs with no lines ARE the answer, arriving with NULL line columns — though on this db the anti-join returns a confident zero, and proving that zero is the analyst's job. The statements join is the fan-out trap: 28 statements against 27 payment legs means the join produces 27 rows, not 28 — five split-payment statements (ids 1, 5, 12, 19, 22) contribute two legs each and get counted twice, while the paid-status statement #28 with zero legs vanishes from an INNER join entirely. Fold legs per statement BEFORE joining, or state loudly that you are reading legs, not statements. 'One row per what?' is the question the panel is grading.",
      tag: "joins",
    },
    {
      id: "databricks-t2",
      q: "The board wants each account's share of the DBU book and each period's share of its cloud market. How do you build share columns with window functions, and what does the default frame do on ties?",
      a: "Two windows, two grains. Share of the whole book is the line or period measure divided by SUM(measure) OVER () — an empty partition clause means the whole result set. Share of market is measure divided by SUM(measure) OVER (PARTITION BY cloud_market) — every row keeps its identity while carrying its market's total alongside, which is exactly the column a mix board wants beside the raw burn. The frame trap: with an ORDER BY inside OVER, the default frame is RANGE, and RANGE includes peers — rows tied on the ordering key enter a running sum together. On a market partition with no ORDER BY the trap is dormant, but the moment someone adds ORDER BY created_at for a cumulative walk, tied timestamps double-count in one step; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when a strict row-by-row walk is meant. On this db the account ladder runs 24, 17, 14, 13, 5 then four accounts tied at 4 — ranking windows share rungs there, and RANK versus DENSE_RANK versus ROW_NUMBER is a policy about peer accounts, not syntax.",
      tag: "windows",
    },
    {
      id: "databricks-t3",
      q: "The census says 251 workload lines, 103 consumption periods, 16 accounts. Why do all three numbers describe the same book, and which do you use where?",
      a: "They are three grains of one fold, and the habit of naming the grain is the whole answer. COUNT(*) over order_items counts workload lines — 251, the atom of consumption. Fold lines by period (order_id) and COUNT(*) reads 103 periods; fold by account and it reads 16 workspaces; the burn column folds alongside — SUM(quantity * unit_price) lands on 34,833.28 at every grain, which is the reconciliation identity that makes the ladder trustworthy. The units column is the subtlety: SUM(quantity) reads 498 units while COUNT(*) reads 251 lines, because quantities above one exist — Audio burns 97 units on just 51 lines, Accessories 121 units on 62. Say 'one row per what?' out loud for every COUNT and every SUM: lines measure workload volume, periods measure billing cadence, accounts measure installed base. A report that mixes them — counting lines but calling them periods — is the most common bug in consumption analytics, and it survives every review until a reconciliation catches it.",
      tag: "aggregation",
    },
    {
      id: "databricks-t4",
      q: "Queued periods have no usage-window stamp yet — shipped_at is NULL on 14 rows. What is your NULL policy for the latency report, and what do NULLs do inside the aggregates it uses?",
      a: "Policy first: only stamped periods have a usage window, so the report measures booking-to-window for the 82 of 103 periods that carry shipped_at — averaging 2.98 days with a 2–4 spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name, which is worse than an error because it ships. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly 21 rows — 14 queued plus 7 killed — and that gap is a feature, the funnel's open work. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average: that invents same-day windows for periods still waiting on warehouse startup, and the capacity team plans against fiction. A WHERE clause doing definitional work must say so out loud — that is the Databricks reviewer's hunt.",
      tag: "nulls",
    },
    {
      id: "databricks-t5",
      q: "The platform review wants committed-billed burn per market for markets carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses, and the pipeline order is not trivia — it is the difference between a number and an error. The billing-basis rule is a row-level fact: status = 'delivered' discards on-demand, queued and killed rows before any fold, so it lives in WHERE (or inside a CASE arm if the mix is being pivoted rather than filtered). Putting a status in HAVING is impossible — statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact: HAVING COUNT(*) >= 10 after GROUP BY cloud_market; on this db only EU (45) and APAC (37) clear it — the US runs 19 and LATAM 2, so a mis-placed floor either errors (COUNT before groups) or silently reshapes the market map. The order FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY is the grammar: WHERE filters rows, HAVING filters folds, and a candidate who can say which is which, per filter, is the candidate who gets the take-home.",
      tag: "pipeline",
    },
    {
      id: "databricks-t6",
      q: "Capacity wants the months whose burn cleared the platform baseline. Where does the baseline live in the query, and what happens when the inner fold comes back empty?",
      a: "The baseline is a scalar subquery — SELECT AVG(total) FROM orders — sitting in HAVING or WHERE, comparing each month's folded burn against the platform-wide bar. The interview's real question is the empty case: a scalar subquery is contractually 0-or-1 rows, and zero rows return NULL — not an error — so burn > NULL is UNKNOWN for every month and the spike screen silently returns nothing while looking valid. On the full table it is theoretical: 103 periods always produce a mean. On filtered staging — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-baseline filter is exactly where it hides. The NOT IN cousin is nastier still: one NULL in the inner list poisons every comparison and empties the report for a reason nobody can see; EXISTS reads existence honestly and NULL-safely. State the inner fold's population and its empty-case behavior unprompted — that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "databricks-t7",
      q: "The burn trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG walk?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when warehouse loads land. The walk: LAG(SUM(burn)) OVER (ORDER BY month) fetches each bucket's predecessor so the delta is row-local — the 3,731.97 January peak and the 1,193.86 July trough only mean something beside their neighbors. The first row's delta is NULL by definition: there is no prior month, and NULL is the baseline — never coalesce it to zero, which reads as a fabricated -3,731.97 crash into month one. Latency math is the same discipline: julianday(shipped_at) - julianday(created_at), over stamped rows, 2.98 average, stated population.",
      tag: "dates",
    },
    {
      id: "databricks-t8",
      q: "Finance says a statement is 'paid' but the payment-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN legs, keep leg id IS NULL — on this db that returns 6 statements worth 15,217 cents, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list: five split-payment statements (1, 5, 12, 19, 22) with two legs each, one partial (4,000 of 6,148 settled on #25). The coverage split must read 21 exact / 1 partial / 6 never-collected, and the trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 truncates 15,217 to 152 and quietly eats cents on every odd-cent row.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "databricks-mcq-1",
      prompt: "A consumption period's status reads 'delivered'. In this kit's Databricks stage map, what happened?",
      choices: ["Committed-contract usage — billed to the contract", "On-demand usage — metered, not yet committed", "Killed — the query was cancelled", "Queued — awaiting warehouse startup"],
      answer: 0,
      why: "The stage map is fixed: delivered = committed-billed usage, 52 of 103 periods (50.5%). It is the only status where contract billing has actually taken the burn.",
      notes: [
        { choice: 1, why: "On-demand is 'shipped' — 30 periods metered with a usage-window stamp but not committed to contract. Calling them committed inflates the contracted base before billing lands." },
        { choice: 2, why: "Killed is 'cancelled' — 7 periods (6.8%). Killed queries are reliability signal, not revenue, and they stay in the denominator of every share you compute." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-2",
      prompt: "Usage-window latency averages 2.98 days. Over which population is that number honest?",
      choices: ["All 103 periods — queued periods count as zero days", "The 82 periods carrying a shipped_at stamp", "The 52 committed periods only", "Distinct accounts (82 ÷ 16)"],
      answer: 1,
      why: "Latency exists only where a usage-window stamp exists: the 82 stamped periods, averaging 2.98 days with a 2–4 spread. The population definition ships with the number.",
      notes: [
        { choice: 0, why: "The 14 queued periods have no stamp — counting them as zero days would drag the average to roughly 2.98 × 82/103 ≈ 2.37 and invent same-day starts that never happened." },
        { choice: 2, why: "Committed-only (52) is a different question — it excludes the 30 on-demand periods that legitimately have usage windows. Funnel steps must not be collapsed." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-3",
      prompt: "EU runs 45 consumption periods from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap — 5.6 periods per account — is the intensity read the review actually discusses.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL foreign keys — 45 again, since every period carries an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not accounts — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to killed periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the killed share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the killed-query map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-5",
      prompt: "Keep only accounts carrying at least 10 consumption periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the ladder clears the bar four times — 24, 17, 14 and 13 periods per account.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-6",
      prompt: "COUNT(shipped_at) returns 82 while COUNT(*) returns 103 on the periods table. What is the 21-row gap?",
      choices: ["21 duplicate period rows that need deduplication", "The 14 queued periods plus the 7 killed ones — rows with no usage-window stamp", "21 periods whose shipped_at landed in the next month", "A join fan-out — 21 periods matched two accounts"],
      answer: 1,
      why: "COUNT(shipped_at) skips NULLs, so the gap is exactly the rows with no stamp: 14 queued awaiting warehouse startup plus 7 killed before any usage window. That gap is the funnel's open work, not dirt.",
      notes: [
        { choice: 0, why: "Deduplicating would delete real periods. The db holds 103 genuine periods; NULLs are a stage of life, not duplicates." },
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the latency average would read about 2.37, not 2.98. The 2.98 matching the stamped-only average is exactly the trap." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-7",
      prompt: "Statements carry INTEGER cents: 6 never-collected statements sum to 15,217 cents. Which expression prints the honest dollar figure?",
      choices: ["SUM(amount_cents) / 100", "SUM(amount_cents) / 100.0", "ROUND(SUM(amount_cents), 2)", "SUM(amount_cents) * 100.0"],
      answer: 1,
      why: "The /100.0 forces real division before any truncation: 15,217 cents reads 152.17 dollars. The INTEGER-cents rule makes the missing .0 the most expensive typo in billing SQL.",
      notes: [
        { choice: 0, why: "Integer ÷ integer truncates: 15217/100 = 152 — a 17-cent read that quietly under-states every unpaid dollar line in the dunning queue." },
        { choice: 2, why: "ROUND arrives after the damage — SUM(amount_cents) is still an integer count of cents, so rounding it to 2 decimals prints 15217, not 152.17." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-8",
      prompt: "A teammate joins the 28 billing statements to the 27 payment legs and reports '27 statements settled'. What actually happened?",
      choices: ["The join is fine — 28 minus 1 void statement equals 27", "COUNT(*) on the join counts legs, not statements: the 5 split-payment statements were counted twice and the paid-status statement with zero legs vanished", "SQLite capped the result at 27 rows", "The join needs DISTINCT to restore the 28"],
      answer: 1,
      why: "The join's grain is legs: five split-payment statements (ids 1, 5, 12, 19, 22) contribute two rows each, and statement #28 — paid-status with zero legs — contributes none. 27 rows is a leg count wearing a statement name.",
      notes: [
        { choice: 0, why: "The void statement (#11, 925.00) actually HAS a leg — the one that vanished is the paid-status #28 with zero legs. The mirror anomalies are how reconciliation catches both lies." },
        { choice: 3, why: "DISTINCT cannot repair a fan-out — the duplicated statement rows differ in leg columns, so DISTINCT keeps both copies and the count stays wrong." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-9",
      prompt: "A Unity Catalog staging table feeds workspace_id NOT IN (SELECT account_id FROM grants WHERE scope = 'table') and the audit returns ZERO rows. First suspicion?",
      choices: ["No workspace lacks table-scope grants — the zero is correct", "One NULL account_id in the subquery poisons every NOT IN comparison — the whole audit silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN materializes the inner list and compares every outer row against it; x NOT IN (…) is UNKNOWN the moment a NULL enters the list — one NULL account_id makes every row UNKNOWN and the audit empties while looking clean. Policy: EXISTS for existence tests, and never NOT IN over an unguarded column.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries an account. But staging tables are exactly where NULLs sneak in, and governance audits ship from staging." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-10",
      prompt: "The burn walk uses LAG(monthly_burn) OVER (ORDER BY month). A teammate wraps it in COALESCE(delta, 0) and the chart now opens with a -3,731.97 'crash' into month one. What went wrong?",
      choices: ["LAG fetched the wrong row — LEAD fixes it", "The first month has no prior month, so the true delta is NULL; coalescing it to 0 makes the chart fabricate a step from zero down to January's 3,731.97", "The ORDER BY direction is backwards", "COALESCE must wrap the burn column, not the delta"],
      answer: 1,
      why: "LAG on the first row returns NULL by definition — there is no prior bucket. January's burn is 3,731.97, so a zero baseline invents a -3,731.97 step that never happened. Report the first delta as NULL or label it 'baseline'; never coalesce a structural NULL into a number.",
      notes: [
        { choice: 0, why: "LEAD looks forward and flips every delta's sign for all 13 real months — a bigger lie, not a fix. The first row's NULL is structural, not a lookup miss." },
        { choice: 3, why: "Coalescing the burn column replaces January's real 3,731.97 wherever it is NULL — which it is not. The NULL lives in the delta, and it means 'no predecessor', not 'zero'." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-databricks-1",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The workload burn census",
      brief:
        "Databricks-flavored brief on the storefront db: Monday's platform review opens with the workload burn census — DBU units and burn folded per workload family from the 251 workload line records, joined to the 16-SKU rate card. Probed facts: the burn foots to 34,833.28 across 103 consumption periods; the family ladder reads Audio 11,744.01 on 97 units, Wearables 6,929.12 on 53, Video 5,198.41 on 61, Electronics 4,818.61 on 85, Accessories 3,294.29 on 121, Apparel 1,984.93 on 54, Fitness 863.91 on 27; SKU counts run 3/2/2/3/3/2/1 and line records 51/25/32/44/62/24/13. The review reads biggest burn first.",
      ask: "Return each workload family with its SKU count, line-record count, DBU units and burn to 2 decimals, biggest burn first.",
      template:
        "SELECT p.category AS workload_family,\n       COUNT(DISTINCT p.id) AS skus,\n       COUNT(*) AS line_records,\n       SUM(oi.{1}) AS dbu_units,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS dbu_burn\nFROM order_items oi\nJOIN products p ON p.id = oi.{3}\nGROUP BY p.category\nORDER BY dbu_burn {4};",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the DBU units column",
          why: "SUM(oi.quantity) folds units — Audio reads 97 units across its 51 line records. SUM(oi.id) folds line identifiers instead, a census of nothing; SUM(oi.unit_price) sums rates and reads a number with no unit story.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the burn precision",
          why: "Burn reports to 2 decimals — Audio's 11,744.01 — so family rows reconcile against the 34,833.28 book to the cent. ROUND to 1 or 0 decimals drifts every cell (11,744 vs 11,744.01) and the reconciliation fails quietly.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the SKU join key",
          why: "ON p.id = oi.product_id attaches each workload line to its rate-card SKU. Joining p.id to oi.id pairs line identifiers with SKU identifiers — garbage pairs — and the fold reads families that do not exist.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-burn-first direction",
          why: "The review reads biggest burn on top: Audio 11,744.01 down to Fitness 863.91. ASC would open the meeting on the smallest family — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["1", "0", "id", "ASC"],
      walkthrough:
        "One join, one fold, five columns at two grains. The join attaches every workload line to its rate-card SKU — ON p.id = oi.product_id — and GROUP BY p.category folds the 251 lines into seven family rows where COUNT(DISTINCT p.id) reads SKUs (Audio 3, Wearables 2, Video 2, Electronics 3, Accessories 3, Apparel 2, Fitness 1), COUNT(*) reads line records (51/25/32/44/62/24/13), SUM(oi.quantity) reads DBU units (97/53/61/85/121/54/27) and ROUND(SUM(quantity * unit_price), 2) reads burn — the probed ladder from Audio's 11,744.01 down to Fitness's 863.91, footing to the 34,833.28 book. ORDER BY dbu_burn DESC opens on Audio, and the pairing is the read: Audio burns 11,744.01 on 97 units (a 121.07 blended per-unit rate) while Accessories burns 3,294.29 on 121 units (27.23) — exactly the serverless-versus-job rate story the platform team tells. The distractors fail honestly: 1 or 0 in the units slot names a column order_items does not have and the engine rejects; id in that slot folds line identifiers instead of units — a census of nothing; 1 and 0 in the precision slot round to 1 or 0 decimals so burn cells drift off the cents-exact fold; id in the precision slot is an ambiguous column and errors; id in the join slot pairs line ids against SKU ids; ASC in any value slot is a syntax error, and in the direction slot it flips the board to Fitness-first.",
    },
    {
      id: "cs-databricks-2",
      tier: "medium",
      topic: "s7",
      universe: "growth",
      title: "The billing-basis mix board",
      brief:
        "Databricks-flavored brief on the storefront db: the CFO's quarterly deck wants the billing-basis mix per cloud market — how much of the 34,833.28 DBU book sits in committed-contract usage versus on-demand metered usage, and how much never got there at all. Probed facts: 103 consumption periods split 52 committed-billed / 30 on-demand / 14 queued / 7 killed (50.5 / 29.1 / 13.6 / 6.8 percent); the market grid reads EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0; market burn runs EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. The board reads biggest market burn first.",
      ask: "Return each cloud market with committed, on-demand, queued and killed period counts plus market burn to 2 decimals, biggest market burn first.",
      template:
        "SELECT c.region AS cloud_market,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS committed,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS on_demand,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS queued,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS killed,\n       ROUND(SUM(o.total), {4}) AS market_burn\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY market_burn DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the committed literal",
          why: "Committed-contract usage is status 'delivered' — 52 periods, led by EU's 24 and APAC's 21. 'shipped' would move the on-demand column into the committed slot and the CFO reads contract revenue that does not exist.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the on-demand literal",
          why: "On-demand metered usage is status 'shipped' — 30 periods, and the US runs 10 of them against 5 committed, the only market where metered out-burns contract. 'pending' would count the warehouse-startup queue as billable metered usage.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the queued literal",
          why: "Queued periods awaiting warehouse startup are status 'pending' — 14 rows, none carrying a usage-window stamp yet. They are open work in the capacity story, not burn and not churn.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the burn precision",
          why: "Market burn reports to 2 decimals — EU's 15,089.23 — so the board's mix rows reconcile against the 34,833.28 book to the cent. Rounding to 1 or 0 decimals breaks that reconciliation silently.",
        },
      ],
      distractors: ["'cancelled'", "'open'", "1", "ASC", "city"],
      walkthrough:
        "Four CASE arms and a fold, all in one pass. The join attaches every consumption period to its market, GROUP BY c.region folds the 103 periods into four rows, and the arms count billing bases: committed reads 24/21/5/2 (EU/APAC/US/LATAM), on-demand 12/8/10/0, queued 6/5/3/0, killed 3/3/1/0, and ROUND(SUM(o.total), 2) reads market burn 15,089.23 / 11,605.45 / 7,286.16 / 852.44 — the probed grid, footing to the 34,833.28 book, ORDER BY market_burn DESC opening on EU. The commercial read sits in the US column: 10 on-demand periods against 5 committed is the only market where metered out-runs contract, while LATAM's single account sits entirely in committed. The reconciliation rule holds — each market's arms must sum to its period count (45/37/19/2) and the book to 103. The distractors fail honestly: 'cancelled' in a status arm re-labels the killed column into that arm (committed would read 3/3/1/0, the mirror image of reality); 'open' matches no status on this book and that arm silently reads zero for every market; 1 compares text status against an integer and empties the arm the same way; city in a status arm compares statuses to city names and zeroes it, and in the precision slot it coerces to 0 decimals (15,089 instead of 15,089.23) so the board stops reconciling; ASC in any value slot is a syntax error, and in the precision slot it rounds the same way city does.",
    },
  ],

  problems: [
    { slug: "late-arriving-restatement", why: "The one co-tagged problem (shared with Snowflake) and the lakehouse's signature incident: late-arriving usage lands after a period closed and the burn must be restated, not appended. Watermark discipline is how a consumption business stays billable and honest at once." },
    { slug: "product-sales-analysis-iii", why: "Rate-card changes across period boundaries: which SKUs sold at which price in which window. Reading per-DBU rates as they changed mid-stream is exactly the price-versioning read Databricks billing analytics runs." },
    { slug: "average-time-of-process-per-machine", why: "Usage-window latency per workload: started to stamped, averaged per engine. The 2.98-day platform average on this db is computed per warehouse family exactly this way before anyone quotes it." },
    { slug: "immediate-food-delivery-i", why: "Committed-versus-later delivery shares per window: the same conditional-rate shape as the billing-basis mix — how much burn landed where it was promised, and how much slipped." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of accounts with burn in a window, denominator stated: the adoption read usage analytics ships weekly — active burning accounts over all signed accounts." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest-burning account: argmax over period counts with ties possible. Concentration questions start here — one account at 24 of 103 periods is a board-level fact." },
    { slug: "rank-scores", why: "Ranking with shared rungs: the account ladder runs 24, 17, 14, 13, 5, then four accounts tied at 4. RANK versus DENSE_RANK is a policy about peer accounts, and this problem forces the call." },
    { slug: "customers-who-never-order", why: "The never-burning account anti-join. On this db it returns a confident zero — every account burns somewhere — and proving that zero instead of shipping a fake whitespace list is the maturity being tested." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Periods whose burn clears the platform average: the spike screen. A two-stage fold — compute the baseline, filter against it — is exactly the capacity-review shape." },
    { slug: "second-highest-salary", why: "The runner-up read: second-heaviest market or second-highest burn month. Argmax is easy; the runner-up with duplicates handled honestly is where candidates slip." },
    { slug: "bank-account-summary", why: "Statements LEFT JOINed to settlement legs with NULL-filled months: the coverage read. Statements with no legs are the AR story — this problem drills the LEFT JOIN that keeps them visible." },
    { slug: "list-the-products-ordered-in-a-period", why: "Workload SKUs burned inside a fixed window with a fold and a sort: the weekly platform digest's first query. Window boundaries on text timestamps are the hidden test." },
    { slug: "find-the-missing-ids", why: "Gaps in the calendar spine: which period keys never materialized. A lakehouse that bills off its own feeds treats a missing period key as an incident, and recursive spines are how you prove the gap." },
    { slug: "fix-names-in-a-table", why: "Catalog name hygiene before any join: workspace and SKU names arrive title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one account into two in every governance audit." },
    { slug: "employees-with-missing-information", why: "Records missing on one side of a pair: workspaces missing a region or a rate-card entry missing a tier. FULL-OUTER-shaped gap detection is the Unity Catalog onboarding audit's daily bread." },
    { slug: "transaction-velocity", why: "Burn bursts: periods clustered denser than the norm. The same burst-detection grammar flags warehouse hot spots and runaway jobs before the invoice does — consumption analytics at its most operational." },
  ],
};
