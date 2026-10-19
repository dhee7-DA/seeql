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
    "Preparation strategy: the pools file carries no Databricks section — exactly one co-tagged SQL row exists (`late-arriving-restatement`, shared with Snowflake) and it anchors the problem pool — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: burn folds, two-grain censuses, CASE-banded billing mixes, cents-safe billing spines and watermark hygiene. Do the topics in order, then run all six case studies on the live storefront db: the {orange:workload burn census} the platform review opens with and the {sky:billing-basis mix board} the CFO reads quarterly, then the usage-tier bench, the one-pass fate census, the platform opex stack and the usage-window latency board that fill out the spaced-practice set. The bar to clear: *state the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["product-sales-analysis-ii", "unique-orders-and-customers-per-month", "find-followers-count", "dau-wau-stickiness", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "The burn calendar",
      why: "Consumption is calendar arithmetic: month buckets over created_at, then trend reads against the 3,731.97 peak and the 1,193.86 trough. Databricks screens drill the '%Y-%m' spine because every burn chart in the business hangs on it — and a '%m'-without-year fold merges January 2024 with January 2025 into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "sessionize-events", "rolling-7d-actives", "rolling-average-steps"],
    },
    {
      name: "Workload-line joins",
      why: "Workload lines carry no family names — the burn-by-SKU read is a join to the rate card, and the join type decides who survives. A line without a SKU is corruption; a SKU without lines is dead catalog space — though on this db every SKU burns somewhere, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "top-travellers", "number-of-accounts-that-did-not-stream", "feature-adoption-windows"],
    },
    {
      name: "Concentration and skew",
      why: "63.5% of the book sits with accounts over 3,000 lifetime — skew is the business model, and screens make you compute it: top accounts, their share of the whole, the count behind the share. The denominator is the entire test; a concentration ratio over the wrong base flatters nobody honestly.",
      slugs: ["number-of-rich-customers", "top-earners", "winning-candidate", "portfolio-concentration-hhi"],
    },
    {
      name: "Blended-rate economics",
      why: "Per-DBU rate cards are weighted folds: burn divided by units, per family, per tier — Audio's 11,744.01 on 97 units reads a very different rate than Accessories' 3,294.29 on 121. Ratio shapes with honest numerators and denominators are the pricing-screen grammar.",
      slugs: ["average-selling-price", "queries-quality-and-percentage", "low-quality-problems"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets committed, on-demand, queued and killed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "find-bursty-behavior"],
    },
    {
      name: "CASE banding & billing-basis mixes",
      why: "Billing basis is CASE-classified — committed, on-demand, queued, killed — with the arms pivoting into columns for the CFO's mix board. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue story, and a reordered WHEN quietly re-labels the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "spend-histogram"],
    },
    {
      name: "Share-of-book windows",
      why: "Market shares are window reads: each period's burn beside its market's total via SUM() OVER (PARTITION BY cloud_market), or each account's share of the 34,833.28 book. Databricks drills the partition idiom because consumption shares are computed at line grain and defended at board grain.",
      slugs: ["find-the-team-size", "portfolio-weights", "project-employees-iii", "compute-the-rank-as-a-percentage", "usage-tier-percentiles"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 statements, 27 legs, INTEGER cents) are where the lakehouse world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "budget-pacing", "mrr-waterfall"],
    },
    {
      name: "Late data, watermarks & governance",
      why: "A lakehouse whose customers bill off the same feeds the dashboards read treats late data as a first-class event: a watermark per feed, restated periods instead of silent appends, and keep-latest dedupe on the staging tables. Governance closes the kit because Unity Catalog's audit trails are queries too — who touched what, and which rows changed after the fact.",
      slugs: ["keep-latest-dedupe", "snapshot-delta-detect", "null-blank-audit", "week-over-week-churn", "second-day-confirmation"],
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
    {
      id: "databricks-t9",
      q: "The platform review wants a 4-week moving average of DBU burn across the 14-month spine. How do you build the frame, and where do ROWS and RANGE disagree?",
      a: "AVG(burn) OVER (ORDER BY week ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) is the rows-true 4-bucket average, computed after the CTE folds 103 consumption periods into monthly (or weekly) buckets. The disagreement is ties and gaps: the default frame is RANGE, which admits peers on the ordering key — harmless on a one-row-per-month spine, wrong the moment the axis is usage-window stamps where periods tie. And ROWS peers 3 ROWS back, not 3 PERIODS back: if a week has no consumption rows, the window silently averages a different calendar than the one you named. The lakehouse discipline is zero-fill the spine first — a calendar CTE LEFT JOINed to the fold, COALESCE the burn to 0, because a zero-burn week is a fact (the cluster was idle) while an absent week is a lie — then window over the complete spine. Say the frame in the notebook comment; the reviewer reads frames the way capacity reads autoscaling bounds.",
      tag: "windows",
    },
    {
      id: "databricks-t10",
      q: "A billing-mix stack combines committed-billed and on-demand periods per cloud market with UNION, and a reviewer says one market row vanished. Diagnose, and state the discipline you ship instead.",
      a: "UNION deduplicates whole rows across branches: two branches that emit byte-identical rows — same market, same counts, no branch label — collapse into one, and the board loses a market with no error anywhere. The diagnosis is to add a branch-label column ('committed', 'on-demand') and re-run: the vanished row reappears labeled. The discipline is UNION ALL for arms that are logically disjoint (a period cannot be both committed-billed and on-demand), plus the label column and a comment stating WHY duplicates are impossible — the comment is the correctness argument the pricing review audits. When branches genuinely overlap — the same period restated twice by a late-arriving feed — UNION's dedupe is the business logic, and you say which duplicated rows you are collapsing. Column discipline holds either way: matching column counts, compatible types, names taken from the first branch.",
      tag: "set-ops",
    },
    {
      id: "databricks-t11",
      q: "The mix board must show LATAM even though its on-demand arm counts zero. How do you keep empty buckets honest in SQL?",
      a: "A missing row and a printed zero are different claims: a missing row reads 'no such market', a zero reads 'the market exists and burned nothing on this basis' — and LATAM exists (2 periods, both committed). Inside the GROUP BY over the period book, every market present in the data gets a row and its zero arms come from SUM(CASE) ELSE 0 or FILTER — the arms are exhaustive by construction. The dishonest shape is filtering first: WHERE status = 'shipped' before the fold deletes every market with no on-demand periods entirely. When the bucket axis is a dimension that might not appear at all — a freshly signed workspace region with zero periods — LEFT JOIN from the accounts dimension and COALESCE the counts to 0, or UNION ALL zero-buckets for fixed bands (burn-tier histograms must print their empty bins). The rule the board lives by: the CFO must never confuse 'nothing metered' with 'we forgot to look'.",
      tag: "aggregation",
    },
    {
      id: "databricks-t12",
      q: "'Show me periods above their cloud market's average burn.' Correlated subquery, derived table, or window function — compare all three and pick one for the platform review.",
      a: "Three correct answers with different costs. The correlated form — WHERE total > (SELECT AVG(total) FROM orders o2 WHERE o2's market matches) — re-runs the average once per outer row: clearest to read, slowest at scale, and necessary because one global bar (the 338.19 platform mean) mis-flags markets that burn differently. The derived-table form folds per market in a CTE and joins back on region: set-based, one pass, and the CTE name documents the population. The window form — total > AVG(total) OVER (PARTITION BY c.region) — computes each market's average once and keeps every row, which is what you want when the below-average rows must stay visible for the capacity narrative. On the platform review I ship the window: derived-table cost with correlated-form output, and the PARTITION BY is the market definition spelled out where the pricing reviewer can see it.",
      tag: "subqueries",
    },
    {
      id: "databricks-t13",
      q: "Billing ops wants every pair of payment legs that share a statement — the double-bill hunt. How do you self-join without counting each pair twice?",
      a: "The pairwise self-join with an ordered key: FROM payments a JOIN payments b ON a.invoice_id = b.invoice_id AND a.id < b.id. The < guard keeps exactly one orientation of each pair, so a two-leg split settlement (statements 1, 5, 12, 19, 22 on this db) yields one pair, not two, and a three-leg statement yields three, not six. Drop the guard and every pair doubles plus a degenerate self-pair appears. Then judge on the business rule: same amount_cents within days is a suspected double-bill — a refund job before the customer notices; different amounts on one statement is the legitimate split this db runs. The same pair-once grammar powers workspace co-burn pairs and SKU-affinity reads. Say 'a.id < b.id is the dedupe' out loud — the candidate who writes the equality join ships both orientations to the refunds queue.",
      tag: "joins",
    },
    {
      id: "databricks-t14",
      q: "Rewrite the never-billed audit with NOT EXISTS. What does it buy over NOT IN, and what must the inner predicate pin down?",
      a: "Shape: SELECT i.number … FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — on this db that returns the 6 never-collected statements worth 15,217, #28 among them. What it buys: NOT EXISTS is an existence probe that short-circuits on the first matching leg and never trips on NULLs, where NOT IN materializes the leg list and goes UNKNOWN for every row the moment one NULL invoice_id enters it — the audit empties silently and dunning ships a false all-clear. The inner predicate must correlate on the exact key and nothing more unless the business rule says so: a 'never billed in the last 30 days' audit adds the date predicate inside the EXISTS, not outside, or the population drifts. State the empty-case behavior unprompted: on this db's clean core a confident zero is a real answer — but only when the query can prove the zero came from data, not from three-valued logic.",
      tag: "nulls",
    },
    {
      id: "databricks-t15",
      q: "Usage windows open when the warehouse starts and stamp shipped_at. How do you build the latency metric without letting queued periods pollute it — and what does AVG do with the NULLs?",
      a: "Policy first: only stamped periods have a usage window, so the metric is julianday(shipped_at) - julianday(created_at) over the 82 of 103 periods that carry the stamp — averaging 2.98 days with a 2–4 spread — and the title says so. Mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name, which is worse than an error because it ships. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly 21 — 14 queued awaiting warehouse startup plus 7 killed before any window — and that gap is the capacity queue, a feature. What is never acceptable is IFNULL-ing the latency to zero: that invents same-day windows for periods still waiting on startup, and the capacity team plans against fiction. A WHERE clause doing definitional work says so out loud — that is the reviewer's hunt.",
      tag: "dates",
    },
    {
      id: "databricks-t16",
      q: "Workspace names arrive as ' acme analytics' from one feed and 'Acme Analytics' from another. What breaks in the governance audit, and what is the hygiene?",
      a: "Every join and GROUP BY keyed on the raw name splits one workspace into two — the access audit grants 'acme analytics' what 'Acme Analytics' owns, the burn census grows a phantom account, and the concentration read loses a logo — and nothing errors because both strings are valid text. The hygiene is normalize-once-in-a-staged-CTE: TRIM(name) kills the padding, UPPER() or INITCAP() fixes the register, and every later fold keys on the cleaned name — not inline TRIM(UPPER(…)) sprinkled through six notebooks, which is six chances to miss one. The lakehouse framing: a name is a join key and a join key is a contract; normalization happens once at the ingestion boundary (the Delta bronze table), the contract is the staged view's name (workspaces_clean), and the raw value survives in the source table so the cleanup is auditable. Unity Catalog governs tables; the analyst governs the keys underneath them. Fix it at the port, not in every query.",
      tag: "casing",
    },
    {
      id: "databricks-t17",
      q: "Capacity wants the 16 accounts cut into four usage tiles of four, heaviest burner first. How does NTILE behave, and where does PERCENT_RANK read better than RANK?",
      a: "NTILE(4) OVER (ORDER BY periods DESC) chops the ranked ladder into four tiles as evenly as row counts allow — 16 accounts become four tiles of exactly 4, and the top tile is the capacity pod's A-list (the 24, 17, 14, 13 ladder). The behavior to narrate: NTILE respects row counts, not tie values — the four-way tie at 4 periods can straddle a tile boundary, and which tied account lands where follows the window's ORDER BY, so the tie-break must be named (periods DESC, customer_id ASC) or the tiles shuffle run to run. PERCENT_RANK reads better when the stakeholder wants relative standing rather than buckets: 0-to-1 across the ladder, which feeds scatter plots and 'top decile of burners' cuts that survive adding an account. The policy call: tiles for capacity assignments, percentiles for peer benchmarks — and neither silently splits a tie that RANK or DENSE_RANK would have shared.",
      tag: "windows",
    },
    {
      id: "databricks-t18",
      q: "One scan, four billing-basis counts: FILTER (WHERE …) versus SUM(CASE …). Which do you ship for the fate census, and why does the census have to be one scan at all?",
      a: "Both are the one-pass census: COUNT(*) FILTER (WHERE status = 'delivered') and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) fold 103 periods into 52 committed + 30 on-demand + 14 queued + 7 killed in a single scan, reconciling to 103 by construction. FILTER is the modern idiom — the intent reads at a glance and there is no ELSE bookkeeping to get wrong; SUM(CASE) is the portable twin that runs on any engine the platform still certifies. The reason it must be one scan is drift control: four sequential queries are four chances for four WHERE clauses to disagree — one status list edited and not the others, and the census stops reconciling to 103 with nothing announcing it. Whichever ships, the identity check belongs in the same query — a CASE that prints 'OK' or 'BROKEN' comparing the four arms to COUNT(*). The census audits itself or it is not a census.",
      tag: "aggregation",
    },
    {
      id: "databricks-t19",
      q: "The Unity Catalog audit takes each table's most recent access event, and two service principals logged the same timestamp. How do you pick deterministically — and why not join to MAX(event_time)?",
      a: "ROW_NUMBER() OVER (PARTITION BY table_id ORDER BY event_time DESC, principal, event_id) numbered newest-first, then keep rn = 1. The named tie-break is the answer: when two principals stamp the same second, the window assigns distinct numbers in an order you chose — so tomorrow's audit reproduces today's, which is the property a compliance readout lives on. Join-to-MAX(event_time) is the shape it replaces, and it fails exactly here: the join to the max stamp matches BOTH tied rows, doubling the access record for that table, and the doubling is silent. The same argmax-with-tie-break pattern picks each workspace's latest job run and each SKU's latest rate. The policy lives in the comment: tie order = principal, then event_id — because a deterministic tie-break nobody can name is a bias nobody can audit. An access audit that cannot reproduce itself is not an audit.",
      tag: "windows",
    },
    {
      id: "databricks-t20",
      q: "The burn spine gets month-filtered by every dashboard. Why does WHERE SUBSTR(created_at, 1, 7) = '2024-07' defeat the index, and what is the sargable form?",
      a: "Sargability: an index on created_at stores whole values in order, and a predicate wrapped around the column — SUBSTR(created_at, 1, 7), UPPER(name), CAST on the key — forces the engine to compute the function per row and scan, because the index is ordered on created_at, not on its substring. The sargable form is the half-open range: created_at >= '2024-07-01' AND created_at < '2024-08-01' — bounds the index can seek, and half-open so July 31's late-night usage rows are not dropped the way BETWEEN '2024-07-01' AND '2024-07-31' drops them (month-end is exactly when warehouse loads land). EXPLAIN QUERY PLAN is the receipt: SEARCH … USING INDEX for the range form, SCAN for the wrapped form. On the demo db the scan is cheap; on a production lakehouse with billions of rows it is the dashboard missing its SLA. The habit: never wrap the indexed column — wrap the constant — and read the plan once before the query ships.",
      tag: "indexes",
    },
    {
      id: "databricks-t21",
      q: "A board pack must reproduce byte-for-byte next quarter. What is your ordering discipline, and where does nondeterminism sneak in?",
      a: "Every ORDER BY ends with a unique key. A pack sorted by COUNT(*) DESC alone shuffles whenever counts tie — the four-way account tie at 4 periods means today's pack orders Rossi, Sato, Meyer, Alvarez and tomorrow's orders the reverse — and an exec diffing two runs sees churn that is not in the business. The discipline: ORDER BY metric DESC, then a stable unique key ASC (customer_id, or statement number) — total order, same rows, same order, every run. Nondeterminism also sneaks in through ROW_NUMBER and NTILE over tied keys (the named tie-break inside OVER fixes it), through GROUP_CONCAT without ORDER BY inside the aggregate, and through LIMIT without ORDER BY (an arbitrary top-N — the most common 'why did my top-10 change' ticket). The SaaS framing: reproducibility is a governance requirement, not aesthetics — a pack whose row order drifts teaches reviewers to stop reading diffs, and that is exactly when a real revenue change slips through unnoticed.",
      tag: "pipeline",
    },
    {
      id: "databricks-t22",
      q: "Where does COALESCE belong in the billing read, and where does it turn into a lie?",
      a: "COALESCE belongs at the display layer, converting a structural NULL into a stated default: the LEFT JOIN to payment legs hands the 6 never-collected statements a NULL payload, and COALESCE(SUM(p.amount_cents), 0) prints their paid cents as 0 — a real fact, correctly rendered. It becomes a lie when it rewrites evidence into fiction: IFNULL-ing the usage-window latency to 0 invents same-day starts for periods still queued on warehouse startup and corrupts the capacity plan; COALESCE around a LAG baseline fabricates a prior month and the burn walk prints a -3,731.97 crash that never happened; IFNULL(status, 'delivered') upgrades unknowns into committed revenue — the exact lie the #28 anomaly (paid-status, zero legs) exists to catch. The test to say out loud: does the NULL mean 'nothing, and zero is the honest rendering' (display sums) or 'unknown, and a number would be invented' (latencies, baselines, statuses)? The first gets COALESCE; the second gets IS NULL filters or a printed blank — and a footnote.",
      tag: "nulls",
    },
    {
      id: "databricks-t23",
      q: "Walk me through your month-close proof chain for the billing book — the queries you run before the close ships.",
      a: "Four proofs, one query each, reconciling by construction. One: the coverage split — statements LEFT JOIN legs folded per statement reads 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-collected (15,217), and the arms must sum to 28. Two: the rails foot — card legs 16 for 37,364 plus wire legs 11 for 32,248 must equal the cash account's 27 debits of 69,612; a split payment counted twice or a leg dropped breaks the foot. Three: the trial balance — 181,080 debits against 181,080 credits, delta zero, or nothing downstream is worth reading. Four: the AR anti-join walked line by line, because the anomalies live at row level: #11 void-but-billed (925.00) never appears in the anti-join, #28 paid-with-zero-legs (1,756.00) appears in it claiming to be paid. Each proof is one deterministic query with the population stated; the close ships when all four reconcile the same day. The candidate who can narrate the chain — and what a broken link smells like — is the candidate billing analytics hires.",
      tag: "quality",
    },
    {
      id: "databricks-t24",
      q: "Committed-billed mix: is it 52 of 103 or 52 of 89 — and how do you keep the denominator honest when the CFO quotes the number?",
      a: "The denominator IS the definition. 52 of 103 (50.5%) is the committed mix over ALL consumption periods — including the 14 queued and 7 killed that never burned a metered window; it answers 'what share of the platform's activity lands on contract?'. 52 of 89 is the conditional over the 82 stamped plus whatever you did with queued — a different question that quietly deletes the queue. The dishonest versions all drop rows: excluding queued flatters the mix; excluding killed too (denominator 82) makes the reliability problem vanish from the revenue read. Queued and killed stay in the base — 'not yet started' and 'killed' are both outcomes the platform owns. The habit the panel grades: name the metric after its denominator ('committed mix over all periods'), print COUNT(*) beside the rate so the base is visible on the slide, and when the CFO asks 'does a killed query count in your base?' the answer is already in the title.",
      tag: "aggregation",
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
    {
      id: "databricks-mcq-11",
      prompt: "Capacity asks for the top 5 consumption periods by burn. A teammate writes SELECT id, total FROM orders LIMIT 5 and gets five plausible rows. What is wrong?",
      choices: ["Nothing — LIMIT 5 always returns the five largest", "Nothing — period ids are already in burn order", "LIMIT without ORDER BY returns an arbitrary five rows — scan-order luck, not a leaderboard", "LIMIT must be written FETCH FIRST 5 ROWS ONLY or it silently returns all 103"],
      answer: 2,
      why: "LIMIT caps the row count; without ORDER BY the engine may return ANY five rows — whatever order the table happens to scan. The real leaders (1,088.44 down through the spread) only surface through ORDER BY total DESC before the LIMIT.",
      notes: [
        { choice: 0, why: "The rows looked plausible because small tables often scan in id order — but id order is booking order, not burn order. The query must declare its ordering to own its answer." },
        { choice: 3, why: "FETCH FIRST is the SQL-standard spelling of the same clause — a portability note, not a correctness fix. The missing ORDER BY is the bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-12",
      prompt: "A teammate buckets the burn calendar with STRFTIME('%m', created_at) AS month and reports January 2024 and January 2025 as one bucket. Which expression is the honest spine key?",
      choices: ["SUBSTR(created_at, 1, 7)", "STRFTIME('%m', created_at)", "STRFTIME('%d', created_at)", "CAST(created_at AS INTEGER)"],
      answer: 0,
      why: "SUBSTR(created_at, 1, 7) keeps year plus zero-padded month — '%Y-%m' — giving the 14 distinct buckets from 2024-01 to 2025-02. Any '%m'-style key merges the two Januaries into one lie and every burn chart downstream inherits it.",
      notes: [
        { choice: 2, why: "'%d' is the day of month — 31 buckets that merge across years AND months. The spine needs the year-month text key." },
        { choice: 3, why: "Casting a '2024-01-15 …' text stamp to integer yields 2024 (or garbage) — one bucket per year at best. The spine is a text-key fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-13",
      prompt: "The book holds 103 consumption periods and 251 workload line records. A report joins order_items to orders and prints COUNT(*) AS periods_per_market. What does the column actually count?",
      choices: ["Periods — the join preserves one row per period", "Workload lines — 251 rows at line grain, wearing a period's name", "Accounts — the join folds to 16", "Rate-card SKUs — the join folds to 16 products"],
      answer: 1,
      why: "The join's grain is line records: every period with multiple workload lines contributes multiple rows, so COUNT(*) reads 251 across the book. Periods require COUNT(DISTINCT o.id) or a fold before the join — 'one row per what?' is the question that column never answered.",
      notes: [
        { choice: 0, why: "The join multiplies; it never preserves. Any period with three workload lines appears three times, and the market census grows lines where the review expects periods." },
        { choice: 2, why: "COUNT(*) never folds to accounts — that is COUNT(DISTINCT customer_id)'s job, and even then the column must say 'accounts', not 'periods'." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-14",
      prompt: "The platform digest wants each workload family's SKU roster on one row — family name plus a comma-separated list of its SKUs. Which fold prints that roster?",
      choices: ["GROUP_CONCAT(p.name) after GROUP BY p.category", "CONCAT(p.name) after joining products", "SUM(p.name) grouped by category", "LISTAGG is the only function that folds to strings"],
      answer: 0,
      why: "GROUP_CONCAT is SQLite's fold-to-string: GROUP BY p.category, SELECT GROUP_CONCAT(p.name) prints Audio's three SKUs on one row. It exists exactly because stakeholders read one row per family, not one row per SKU.",
      notes: [
        { choice: 1, why: "CONCAT joins two given values, not a group — over the rate card it concatenates row by row and the roster never folds." },
        { choice: 3, why: "LISTAGG is the ANSI name; SQLite's native fold is GROUP_CONCAT. Vocabulary check, not a different answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-15",
      prompt: "Catalog hygiene asks: which rate-card SKUs never appear in a workload line this quarter — a set difference between the SKU list and the burned list. Which operator reads most honestly?",
      choices: ["INNER JOIN on sku name", "EXCEPT between SELECT DISTINCT sku queries", "UNION ALL of both lists", "LEFT JOIN with a COALESCE default"],
      answer: 1,
      why: "EXCEPT answers 'in the rate card, not in the burn' — SELECT DISTINCT sku FROM rate-card side EXCEPT SELECT DISTINCT sku FROM line side — with the intent readable straight off the page. On this db the result is a confident zero (all 16 SKUs burn somewhere), and proving that zero is the hygiene check.",
      notes: [
        { choice: 0, why: "An INNER JOIN answers co-occurrence, not absence — SKUs with no lines vanish, which is the opposite of the question." },
        { choice: 2, why: "UNION ALL concatenates and keeps everything — a pile where a subtraction was asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-16",
      prompt: "The usage-window latency metric averages 2.98 days. Two teammates query it: one filters WHERE shipped_at IS NOT NULL, one runs AVG over all 103 periods — and both print 2.98. Why does the filter still belong in the query?",
      choices: ["It does not — the two queries are equivalent in every way", "AVG silently skips NULLs, so the unrestricted average coincidentally matches — but the stated filter makes the 82-of-103 population visible instead of hidden", "The filter makes the query faster", "Without the filter, COUNT(*) would also return 82"],
      answer: 1,
      why: "AVG ignores NULLs, so both queries return the same number today — but only the filtered one states its population. The unfiltered version's meaning changes silently the moment a queued period gets a stamp or a backfill lands; the filter is the definition, written where the reviewer can see it.",
      notes: [
        { choice: 0, why: "Numerically identical today, semantically different forever. A number whose population is implied is a number whose drift nobody will notice." },
        { choice: 2, why: "The filter may or may not change the plan — that is not the point. The point is that population definitions ship inside the query, not in tribal memory." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-17",
      prompt: "A review flags 'periods above their cloud market's average burn'. A teammate writes WHERE total > (SELECT AVG(total) FROM orders) — what does the engine compare against?",
      choices: ["Each period's own market average", "The whole-platform average, 338.19 — one bar for every market", "The market's median", "Nothing — scalar subqueries cannot contain aggregates"],
      answer: 1,
      why: "An uncorrelated scalar subquery folds once over the whole table — every row is compared to 338.19. The business question was per-market: markets burn at different averages, so one global bar mis-flags both the heavy and the light market. The fix is correlation, a PARTITION BY window, or a market-folded CTE join.",
      notes: [
        { choice: 0, why: "Correlation requires referencing the outer row inside the subquery — without it the fold is global. The market definition must appear in the subquery's WHERE or the window's PARTITION BY." },
        { choice: 3, why: "Aggregates in scalar subqueries are exactly how the 338.19 baseline is computed. The bug is scope, not legality." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-18",
      prompt: "Capacity wants the 16 accounts cut into four usage tiles of four, heaviest burner first. Which window call does that?",
      choices: ["NTILE(4) OVER (ORDER BY COUNT(*) DESC)", "RANK() OVER (ORDER BY COUNT(*) DESC) mod 4", "QUARTILE(COUNT(*), 4)", "PERCENT_RANK() OVER (ORDER BY COUNT(*)) / 4"],
      answer: 0,
      why: "NTILE(4) chops the ranked 16 into four tiles as evenly as row counts allow — four tiles of exactly 4 here — and the top tile is the A-list: the 24, 17, 14, 13 ladder. The window ORDER BY must name its tie-break or the four-way tie at 4 periods shuffles between tiles run to run.",
      notes: [
        { choice: 1, why: "RANK returns 1, 2, 3, 4, 5, 6, 6, 6, 6, 10, 10… — taking it mod 4 is numerology, and the rank gaps make tile sizes drift." },
        { choice: 2, why: "QUARTILE is a spreadsheet function, not SQLite window grammar. The tile call is NTILE with the tile count as its argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-19",
      prompt: "The governance audit wants each table's most recent access event, and two service principals logged the same event_time. What makes the pick defensible?",
      choices: ["MAX(event_time) joined back — ties resolve themselves", "ROW_NUMBER() OVER (PARTITION BY table_id ORDER BY event_time DESC, principal, event_id) kept at rn = 1", "LIMIT 1 grouped per table", "Any row — the tie means the choice does not matter"],
      answer: 1,
      why: "ROW_NUMBER with a named tie-break assigns distinct numbers even on tied stamps, so the same row wins every run — reproducible, auditable, the property a compliance readout lives on. MAX(event_time) joined back matches BOTH tied rows and doubles the table's access record silently.",
      notes: [
        { choice: 3, why: "The rows differ — different principals, different actions — so the choice changes the audit. An unnamed tie-break is a bias nobody can audit." },
        { choice: 2, why: "LIMIT 1 applies to the whole result set, not per table; without a window or a correlated fold, 'per table' never materializes." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-20",
      prompt: "A bronze-stage feed loads '  acme analytics' with padding and lowercase while the governance table stores 'Acme Analytics'. What breaks first if you GROUP BY name across both?",
      choices: ["The query errors — mixed case cannot group", "One workspace splits into two rows — the burn census grows a phantom account and the concentration read loses it from the real one", "Both rows collapse into one automatically", "NULLs propagate through every aggregate"],
      answer: 1,
      why: "GROUP BY is byte-exact: padded and differently-cased strings are different keys, so one workspace becomes two rows. The fix is normalize-once in a staged CTE — TRIM + UPPER — and key every later fold on the cleaned name.",
      notes: [
        { choice: 0, why: "Nothing errors: both are valid text. The failure is silent — which is why name hygiene is an ingestion-boundary job, not a report-time patch." },
        { choice: 2, why: "Grouping never folds near-matches. If it did, genuinely different names would merge too, and the engine does not gamble." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-21",
      prompt: "The never-billed audit is rewritten as WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id). What does NOT EXISTS buy over NOT IN here?",
      choices: ["It runs faster on every dataset, guaranteed", "It is NULL-safe — a NULL invoice_id in the legs table can never silently empty the audit", "It returns the first matching leg instead of all of them", "It avoids the need for the join key correlation"],
      answer: 1,
      why: "NOT EXISTS is an existence probe: it short-circuits on the first match and its three-valued logic can never turn a NULL into 'no match anywhere'. NOT IN materializes the list and goes UNKNOWN for every row once a NULL enters — the audit empties while looking valid. The 6/15,217 result must be provable, not lucky.",
      notes: [
        { choice: 0, why: "Plans vary; NOT IN can be faster on tiny literal lists. The reason for the policy is correctness under NULLs, not a speed guarantee." },
        { choice: 2, why: "Both forms filter outer rows; neither changes how many legs match. EXISTS just stops probing after the first — a plan detail, not the semantics being bought." },
      ],
      difficulty: "medium",
    },
    {
      id: "databricks-mcq-22",
      prompt: "A 4-week moving average over the usage-window axis 'smears': two periods sharing one stamp enter the window together, and an idle week drags the average across a phantom gap. Which pair of fixes is correct?",
      choices: ["Sort in the notebook layer and widen the frame", "ROWS BETWEEN for a strict row-by-row walk, plus zero-fill the calendar spine before windowing", "RANGE BETWEEN 4 PRECEDING AND CURRENT ROW, and drop idle weeks", "Replace AVG with SUM — sums cannot smear"],
      answer: 1,
      why: "Two distinct bugs, two distinct fixes. ROWS BETWEEN 3 PRECEDING AND CURRENT ROW counts rows, so tied stamps stop entering as a lump; the zero-filled spine (calendar CTE LEFT JOINed to the fold, COALESCE to 0) gives every week a row so the '4-week' window is calendar-true across the gap. An idle week is a fact — the cluster burned zero — and it must occupy a row, not a hole.",
      notes: [
        { choice: 2, why: "RANGE peers over VALUES, changing the metric to a daily-rate read — and dropping idle weeks is the smear's cause, not its cure." },
        { choice: 3, why: "SUM changes the metric; the frame semantics — and the missing-week hole — stay broken underneath either aggregate." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-23",
      prompt: "A teammate adds WHERE mom_pct > 20 to the burn walk and gets 'misuse of window function' (or an unknown column). Why, and what is the fix?",
      choices: ["Windows must be wrapped in COALESCE before filtering", "Window output does not exist at WHERE time — stage the walk in a CTE or subquery and filter in the outer query", "The alias needs AS mom_pct repeated in WHERE", "WHERE cannot compare computed columns — move the condition to HAVING"],
      answer: 1,
      why: "The logical pipeline runs WHERE before SELECT, so the window's output is not yet materialized where WHERE lives — the engine rejects it. The fix is staging: compute LAG and the pct inside a CTE, then SELECT … FROM staged WHERE mom_pct > 20 in the outer query.",
      notes: [
        { choice: 3, why: "HAVING filters groups after aggregation — window functions still evaluate after HAVING. The clause swap errors differently, not correctly." },
        { choice: 0, why: "COALESCE changes NULLs, not evaluation order. The window is evaluated in the SELECT stage regardless of what wraps it." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-24",
      prompt: "The review quotes 'average burn per market' by averaging each market's mean. The true platform average is 338.19. Why do the two disagree?",
      choices: ["They never disagree — both are the same fold", "Rounding error compounded across four markets", "Averaging averages weights every market equally regardless of size — LATAM's 2 periods count as much as EU's 45", "The true average must also be computed per market"],
      answer: 2,
      why: "The average-of-averages re-weights the platform: EU's 45 periods and LATAM's 2 get equal say in the market-mean-of-means, while the true 338.19 weighs every period once. With markets this unbalanced (45/37/19/2), the gap is material — quote the period-weighted fold, or label the equal-weighted one as exactly that.",
      notes: [
        { choice: 1, why: "Rounding moves cents; the weighting moves the number. Even at full precision the two folds differ whenever market sizes differ." },
        { choice: 0, why: "They disagree by construction — one is SUM(total)/COUNT(*) over rows, the other is AVG(per-group means) over groups. Same word 'average', different denominators." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-25",
      prompt: "The spine query runs WHERE SUBSTR(created_at, 1, 7) = '2024-07' on an indexed created_at and the plan shows a full SCAN. What is the sargable rewrite, and what does EXPLAIN QUERY PLAN show after it?",
      choices: ["WHERE created_at LIKE '2024-07%' — SEARCH using the index", "WHERE created_at >= '2024-07-01' AND created_at < '2024-08-01' — SEARCH using the index, with July 31's late-night usage rows intact", "WHERE YEAR(created_at) = 2024 AND MONTH(created_at) = 7 — SEARCH using the index", "Add ORDER BY created_at to force index usage — SEARCH"],
      answer: 1,
      why: "Wrapping the column in a function defeats the index's ordering; the half-open range keeps the column bare so the index can seek. It is also the only form here that keeps the last night's usage — BETWEEN '2024-07-01' AND '2024-07-31' drops everything stamped on the 31st after midnight, and month-end is when warehouse loads land.",
      notes: [
        { choice: 0, why: "LIKE with a prefix can use the index in some engines, but the range predicate is the type-safe shape that survives a timestamp-typed column and a plan you can read." },
        { choice: 3, why: "ORDER BY influences scan strategy, not predicate sargability — the WHERE function-wrap still forces per-row computation before any sort." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-26",
      prompt: "The fate census must run on a certified engine vintage that predates FILTER (WHERE …). Which is the portable twin for COUNT(*) FILTER (WHERE status = 'shipped')?",
      choices: ["COUNT(status = 'shipped')", "SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END)", "COUNT(*) WHERE status = 'shipped'", "SUM(IF(status = 'shipped', 1))"],
      answer: 1,
      why: "SUM(CASE WHEN … THEN 1 ELSE 0 END) is the universal one-pass census arm — the ELSE 0 keeps every row counted so the four arms reconcile to 103 by construction. It predates and outlives every engine vintage the platform certifies.",
      notes: [
        { choice: 0, why: "COUNT(expr) counts non-NULL results of the expression — a boolean true/false, so it counts every row including the false ones. The census reads 103 in every column." },
        { choice: 2, why: "WHERE is a clause, not an aggregate argument — the syntax fails to parse. The one-pass idea needs conditional aggregation, not a second pass." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-27",
      prompt: "The concentration memo wants each account's share of the DBU book AND the running share of the top 5. Which pair of windows builds it in one pass?",
      choices: ["Share: total / SUM(total) OVER (); running: SUM(total) OVER (ORDER BY total DESC) / SUM(total) OVER ()", "Share: total / MAX(total) OVER (); running: total - LAG(total) OVER ()", "Share: PERCENT_RANK() OVER (ORDER BY total); running: NTILE(5) OVER (ORDER BY total DESC)", "Both come from GROUP BY — windows cannot produce shares"],
      answer: 0,
      why: "The empty OVER () sums the whole book (34,833.28) beside every row, so share divides the row by the book; ordering the running sum by total DESC accumulates from the largest account down, giving the top-5 cumulative share — the 63.5% that lives above the 3,000 line. One scan, two windows, no self-join.",
      notes: [
        { choice: 1, why: "MAX is a ceiling, not a base — shares would read against the single largest period. And LAG produces deltas, not accumulations." },
        { choice: 2, why: "PERCENT_RANK returns 0-to-1 rank-based standing, not value share; NTILE returns bucket numbers. Neither divides value by value." },
      ],
      difficulty: "hard",
    },
    {
      id: "databricks-mcq-28",
      prompt: "The mix board's LATAM row must show on-demand usage even though the arm counts zero. What does the query print if built with SUM(CASE) arms over the market fold?",
      choices: ["The LATAM row is missing — CASE cannot fabricate rows", "The LATAM row prints with zero on-demand and two committed — 'exists, metered nothing on-demand', the honest read", "The LATAM row prints with NULL arms — indistinguishable from a data hole", "An error — SUM over no matching rows is undefined"],
      answer: 1,
      why: "SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) folds LATAM's two periods and the ELSE 0 prints the empty arm as zero. Zero is the claim 'we looked and nothing metered' — a missing row would claim the market does not exist.",
      notes: [
        { choice: 2, why: "CASE with ELSE 0 never produces NULL arms — that is the point of the ELSE. Leaving it off would print NULLs; the honest board prints zeros." },
        { choice: 3, why: "SUM over zero matching rows returns 0 (empty sum), legally. Nothing errors; the discipline is in the rendering." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-29",
      prompt: "Dunning wants statements where SOME money has landed but the position is short. Where does the 'some money' test live in the coverage query?",
      choices: ["WHERE SUM(p.amount_cents) > 0 next to the other WHERE conditions", "In HAVING after GROUP BY i.id — the folded paid total only exists once legs are grouped", "In the SELECT as a flag column only", "In a subquery per row — HAVING cannot compare sums"],
      answer: 1,
      why: "Paid-to-date is a per-statement fold: after statements LEFT JOIN legs GROUP BY i.id, the partial test — SUM(p.amount_cents) > 0 AND < amount_cents — judges a group, so it lives in HAVING. That fold is what isolates the book's one partial statement (#25: 4,000 of 6,148).",
      notes: [
        { choice: 0, why: "SUM in WHERE errors — aggregates do not exist before grouping. The clause order FROM → WHERE → GROUP BY → HAVING is the grammar doing the work." },
        { choice: 2, why: "A SELECT flag prints the information but does not filter — dunning still gets every statement. Flags report; HAVING selects." },
      ],
      difficulty: "easy",
    },
    {
      id: "databricks-mcq-30",
      prompt: "The burn walk's first row prints NULL for prev_burn — January's 3,731.97 has no prior month. What does the board do with it?",
      choices: ["COALESCE to 0 so the column is numeric end to end", "Leave it NULL and label it 'baseline' — a fabricated zero would print a -3,731.97 crash that no market experienced", "Drop the first row so no NULL ships", "Replace it with the 14-month average"],
      answer: 1,
      why: "The first month's NULL is structural — there IS no prior month, and NULL is the honest encoding of 'no baseline'. Coalescing it to zero invents a step from zero down to January; dropping the row silently shrinks the spine to 13 months and the board stops reconciling to the calendar.",
      notes: [
        { choice: 0, why: "Zero means 'the prior month burned nothing' — a factual claim about a month that did not exist in the window. Structural NULLs are not display problems." },
        { choice: 2, why: "Dropping the row hides the opening level entirely — the walk loses its start line. The baseline row is the anchor every later percentage leans on." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-databricks-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The usage-tier bench",
      brief:
        "The capacity board tiers accounts on DENSE_RANK semantics — shared rungs, no gaps — and the bench keeps every account carrying at least three consumption periods so the tie policy stays visible. Probed facts: the 16-account book folds to a ladder of 24, 17, 14, 13, 5 periods (Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5), then FOUR accounts tied at 4 (Rossi, Sato, Meyer, Alvarez), then TWO tied at 3 (Farid Nasser, Hiro Tanaka). DENSE_RANK shares the tie at rung 6 (6, 6, 6, 6) and hands the two 3-period accounts rung 7 — ten named tiers collapse to seven; RANK would read 10, 10 with the four skipped rungs published as phantom positions. The 3-floor keeps 11 of 16 accounts.",
      ask: "Return each account with at least 3 consumption periods: name, period count, and its usage tier under DENSE_RANK semantics — heaviest first, ties sharing a rung.",
      template:
        "SELECT c.name AS account,\n       COUNT(*) AS periods,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS usage_tier\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY usage_tier, account;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK gives the four-way tie at 4 periods rung 6 and the two 3-period accounts rung 7 — tiers without gaps, so the bench reads 'seven tiers' and every rung is occupied. RANK would stamp the 3s as rank 10, inventing four phantom rungs (7-9) no account occupies — a different policy the board did not adopt.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "Tier 1 is the biggest burner — Alice Chen's 24 periods — so the window ORDER BY runs descending. ASC would crown the two 3-period accounts tier 1 and hand Alice Chen tier 11: a correct query publishing an inverted capacity hierarchy.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 accounts — the 24/17/14/13/5 head, the four-way tie at 4, and the two 3s whose tier (7) only exists because the tie above them shared rung 6 without consuming it. A floor of 4 amputates rung 7 and the no-gap property reads as a bug instead of a choice.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A tier is a policy, and this board's policy is DENSE_RANK. The join attaches every period to its account, GROUP BY c.id folds 103 consumption periods into 16 account rows, and the window tiers the folded counts: DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) shares rungs among equals AND never skips — Alice Chen 24 at tier 1, Emma Wilson 17 at 2, Grace Kim 14 at 3, Maya Patel 13 at 4, Chloe Dubois 5 at 5, then the four-way tie at 4 all lands on rung 6, and the next distinct count (3) gets rung 7 — no gap, because the tie consumed rungs without spending them. That is the entire difference from RANK, which skips to 10: the bench reads 'seven tiers', the ladder reads 'ten rungs', and the two policies answer different questions about peer accounts. HAVING COUNT(*) >= 3 keeps both the tie and the two 3s visible. The distractors are the other policies wearing a rank function's name: RANK prints 10, 10 — the gap-as-policy memo; ROW_NUMBER splits the four-way tie arbitrarily, silently picking which account's capacity review runs first; ASC inverts the bench; and the floor of 4 amputates exactly the rows that make the no-gap property visible.",
    },
    {
      id: "cs-databricks-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Platform-review brief, in-world: the ops board's first gate is the billing-basis census, and the rule is ONE scan — all four bases counted beside each other so no two queries can disagree. Probed on the storefront db: 103 consumption periods; 52 committed-billed + 30 on-demand + 14 queued + 7 killed = 103 by construction; average burn 338.19 against the 25.47-to-1,088.44 spread; killed share 6.8% over the all-periods base. FILTER (WHERE …) counts each basis in the same scan as COUNT(*) — the platform's certified engines that predate FILTER run the SUM(CASE) twin — and a branch that fails the identity is the day's first incident, not a rounding note.",
      ask: "Return one row: periods, the four billing-basis counts in one pass, average burn to 2 decimals, and the killed share over all periods.",
      template:
        "SELECT COUNT(*) AS periods,\n       COUNT(*) FILTER (WHERE status = {1}) AS committed,\n       COUNT(*) FILTER (WHERE status = {2}) AS on_demand,\n       COUNT(*) FILTER (WHERE status = {3}) AS queued,\n       COUNT(*) FILTER (WHERE status = {4}) AS killed,\n       ROUND(AVG(total), {5}) AS avg_burn,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*), 1) AS killed_pct\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the committed arm",
          why: "Delivered is committed-contract usage — 52 of 103, the book's billing backbone. Swapping in another basis prints that basis into the committed column and the 52 + 30 + 14 + 7 = 103 identity breaks: the census stops being a proof and becomes four opinions.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the on-demand arm",
          why: "Shipped is on-demand metered usage — 30 periods with a usage-window stamp but no contract commitment. Counting 'delivered' here double-books the committed book into the metered column and the mix board inflates contract revenue that does not exist.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the queued arm",
          why: "Pending is queued awaiting warehouse startup — 14 rows, none carrying a usage-window stamp yet. They stay IN the census (and in the denominators) as 'not yet', not as failures; mislabeling them killed inflates the reliability queue, mislabeling them metered invents usage 14 rows never burned.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the killed arm",
          why: "Cancelled is killed queries — 7 rows, the numerator of the 6.8% killed share and the reliability read capacity plans against. The killed_pct fold divides this same basis by COUNT(*), so the column and the rate must read the same population by construction.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the burn precision",
          why: "Average burn prints to 2 decimals — 338.19 — so the census reconciles against the 34,833.28 book to the cent. Rounding to 1 or 0 decimals drifts the print and the reconciliation against the workload-line fold stops footing.",
        },
      ],
      distractors: ["1", "0", "MAX(status)", "COUNT(*)"],
      walkthrough:
        "Four FILTER arms and a denominator, all in one pass. COUNT(*) reads 103 periods; the arms read committed 52 ('delivered'), on-demand 30 ('shipped'), queued 14 ('pending'), killed 7 ('cancelled') — and the identity holds by construction because every arm counts rows of the same scan: 52 + 30 + 14 + 7 = 103. ROUND(AVG(total), 2) prints the 338.19 average burn beside the counts, and the killed share divides the same cancelled arm by the same 103 — 6.8% over the all-periods base, queued and killed included, because 'not yet started' and 'killed' are both outcomes the platform owns. The distractors fail honestly: 1 and 0 compare text status against integers, so the arm they land in reads zero and its population silently vanishes; MAX(status) puts an aggregate inside a FILTER clause and the census errors outright; COUNT(*) in a status slot is both a syntax error and a category mistake — a row count wearing a status literal's name. The census audits itself or it is not a census.",
    },
    {
      id: "cs-databricks-5",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The platform opex stack",
      brief:
        "Spend-report brief, in-world: the ops partner wants the fixed-cost platform categories (Rent, Ads) pulled out of the expense ledger with a grand TOTAL row underneath — one query, one stack, no spreadsheet math. Probed on the storefront db: 36 expenses totaling 25,416.00; Rent runs 14 entries for 16,800.00 and Ads 14 for 4,570.00, so the two fixed categories carry 21,370.00 of the 25,416.00 (84.1%); the program spend — Tools 5 entries for 1,525.00, Travel 3 for 2,521.00 — stays out of the memo. Finance stores expenses as INTEGER cents, and the TOTAL branch must scan the unfiltered ledger.",
      ask: "Return entries and dollars per fixed-cost category, plus a labelled TOTAL row for the whole ledger, biggest dollars first.",
      template:
        "SELECT category, COUNT(*) AS entries, ROUND(SUM(amount_cents) / 100.0, 2) AS dollars\nFROM expenses\nWHERE category IN {1}\nGROUP BY category\n{2}\nSELECT 'TOTAL', {3}, ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY dollars DESC;",
      slots: [
        {
          answer: "('Rent', 'Ads')",
          kind: "keyword",
          label: "the fixed-cost pair",
          why: "The pair keeps exactly the two fixed categories — 28 of the 36 entries, Rent 14 for 16,800.00 and Ads 14 for 4,570.00. Swapping in the program pair ('Tools','Travel') serves the spend the stakeholder explicitly excluded, and a single-category list silently drops one leg of the memo.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the category rows without a dedupe pass — the honest stack for a report where every row belongs. EXCEPT would return only the detail rows, dropping the TOTAL the ask requires, and a bare UNION adds a distinct sort for nothing.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the all-in entry counter",
          why: "The TOTAL row must count the whole ledger — 36 expense entries, not the filtered 28 — because its dollars column (25,416.00) is the unfiltered grand total. COUNT(*) re-scanning expenses keeps the row honest even if the detail filter upstream changes.",
        },
      ],
      distractors: ["('Tools', 'Travel')", "EXCEPT", "SUM(amount_cents)", "ASC"],
      walkthrough:
        "Two branches, one stack. The detail branch filters to the fixed-cost pair with IN and GROUP BY category folds 28 entries into two rows — Rent 14 entries at 16,800.00, Ads 14 at 4,570.00, dollars printed through the cents rule (SUM(amount_cents) / 100.0). The TOTAL branch re-scans the unfiltered expenses table: 36 entries and 25,416.00, so the memo shows the fixed categories against the whole ledger (21,370.00 fixed = 84.1% of spend) without a second query. UNION ALL is the join between grains — no dedupe, and the outer ORDER BY dollars DESC floats the TOTAL row (25,416.00) to the top above Rent. The distractors fail honestly: ('Tools','Travel') serves the program spend instead of the fixed costs; EXCEPT subtracts and returns only the detail rows, quietly deleting the TOTAL the ask requires; SUM(amount_cents) in the counter slot prints 2,541,600 raw cents where 36 belongs — a ledger wearing a row count's name; ASC in any value slot is a syntax error, and as a direction it would flip the stack to smallest-first. Every distractor breaks a different promise of the memo.",
    },
    {
      id: "cs-databricks-6",
      tier: "medium",
      topic: "t3",
      universe: "month-close",
      title: "The usage-window latency board",
      brief:
        "Month-close brief, in-world: capacity reads the usage-window clock by cloud market before the regional call — booking to usage-window stamp over the stamped rows only, because the 21 unstamped rows (14 queued awaiting warehouse startup, 7 killed) have no window yet and must not dilute the average. Probed on the storefront db: 82 of 103 periods carry the shipped_at stamp; the platform reads 2.98 days in a 2–4 day band, and by market APAC runs 29 stamped at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5 (spread 3 to 4). The two-decimal precision is load-bearing: at one decimal APAC's 2.93 rounds to 2.9 beside EU's 2.94 and the fastest-market claim becomes a coin toss the board cannot defend.",
      ask: "Return each cloud market with its stamped period count and average booking-to-window days to 2 decimals — fastest market first.",
      template:
        "SELECT c.region AS cloud_market,\n       COUNT(*) AS stamped,\n       ROUND(AVG({1} - JULIANDAY(o.created_at)), {2}) AS avg_window_days,\n       ROUND(MIN(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS fastest,\n       ROUND(MAX(JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at)), 2) AS slowest\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at {3}\nGROUP BY c.region\nORDER BY avg_window_days {4};",
      slots: [
        {
          answer: "JULIANDAY(o.shipped_at)",
          kind: "keyword",
          label: "the window endpoint",
          why: "The clock measures booking TO usage-window, so the endpoint is JULIANDAY(o.shipped_at) — the stamp only stamped periods carry. JULIANDAY(o.created_at) in the endpoint slot measures booking against itself: every diff reads 0.0 and the board reports a platform that opens windows instantly — a real query printing a fiction.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the clock precision",
          why: "Two decimals keep the market ordering defensible: 2.93 versus 2.94 is a real ordering, while one decimal collapses both to 2.9 and the fastest-market claim becomes a tie the data cannot settle. The 2 also lands in the output as LATAM's stamped count — a two-period market whose 3.5-day average rides on just 2 rows, which the readout must caveat.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the population guard",
          why: "Only stamped periods have a window, so the population is WHERE shipped_at IS NOT NULL — stated, not implied. IS NULL flips the report to the 21 unstamped rows and every average prints NULL; dropping the filter entirely still prints 2.98 (AVG skips NULLs) but over an unnamed population — the silent-shrink failure the review rejects.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the fastest-first direction",
          why: "The board opens on the fastest market — APAC 2.93 — because the regional call starts with what is working. DESC leads with LATAM's 3.5 on a two-period sample: not wrong arithmetic, the wrong headline, and the fastest-market claim silently inverts.",
        },
      ],
      distractors: ["JULIANDAY(o.created_at)", "IS NULL", "DESC", "0", "1"],
      walkthrough:
        "A clock with a population attached. The join attaches each consumption period to its market; WHERE shipped_at IS NOT NULL keeps the 82 stamped periods — the 21 without a stamp are a population definition, not a cleanup job, and IFNULL-ing their latency to zero would invent same-day windows for periods still queued on warehouse startup. JULIANDAY(shipped_at) − JULIANDAY(created_at) is fractional days by contract, AVG folds it per market, and ROUND(…, 2) prints APAC 29 / 2.93, EU 36 / 2.94, US 15 / 3.07, LATAM 2 / 3.5 — fastest and slowest columns confirming the 2-to-4 band everywhere except LATAM's 3-to-4. The two-decimal precision is what keeps 2.93 ahead of 2.94; at one decimal the ordering ties and the fastest-market headline is a coin toss. The read: the platform clock is healthy (2.98 inside the band), APAC and EU are a hair apart, and LATAM's 3.5 is directionally interesting but rests on two rows — say so before the regional call does. The distractors: the created_at endpoint zeroes the clock, IS NULL reports the unstamped and prints NULLs, 0 or 1 in the precision slot flattens the ordering, and DESC inverts the headline.",
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
    { slug: "sessionize-events", why: "Usage arrives as raw events and sessions are a 30-minute-gap fold — the same gaps-and-islands logic the lakehouse applies to warehouse sessions before any burn rollup is trusted." },
    { slug: "find-bursty-behavior", why: "Bursty accounts burn unevenly and break linear capacity plans — the burst screen over the period spine is how autoscaling policy gets its evidence." },
    { slug: "rolling-7d-actives", why: "Weekly active burners is the adoption metric a consumption business reports instead of logins — a rolling window over the burn spine with the population stated." },
    { slug: "dau-wau-stickiness", why: "Daily-over-weekly active ratio is the stickiness read on burning accounts — the same census at two grains, and the denominator fight is identical." },
    { slug: "second-day-confirmation", why: "Accounts that burn two days running behave differently forever after — the day-2 return read that seeds every expansion-forecast model on the platform." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two burn windows inside seven days is the repeat-usage signal — the co-occurrence fold that separates committed trajectories from one-off spikes." },
    { slug: "rolling-average-steps", why: "Smoothed burn steps expose trend under spike noise — the moving-frame fold the capacity review reads instead of the raw calendar." },
    { slug: "compute-the-rank-as-a-percentage", why: "Percentile ranks beside raw burn put every account on one comparable scale — the peer-benchmark column usage analytics ships weekly." },
    { slug: "usage-tier-percentiles", why: "Tier cut-offs from percentiles, not vibes — the same banding logic the rate card uses, drilled over the 16-account ladder." },
    { slug: "spend-histogram", why: "Burn banded into spend buckets with every bin printed — the histogram that shows where the 34,833.28 book actually concentrates, empty bins included." },
    { slug: "portfolio-concentration-hhi", why: "A concentration index over the account book is the one-number skew summary beside the 63.5% share — squared weights, one fold, board-ready." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Accounts with zero usage in the window is the dormant-logo read — an anti-join that on this db returns a confident zero, and proving the zero is the maturity test." },
    { slug: "week-over-week-churn", why: "Week-over-week churn on burning accounts is the earliest revenue warning the platform gets — a LAG walk over the same spine the burn chart rides." },
    { slug: "feature-adoption-windows", why: "Adoption measured inside fixed windows after first use — the feature-launch read that decides which workloads earn serverless capacity." },
    { slug: "budget-pacing", why: "Committed spend paced against elapsed time is the consumption business's run-rate read — pacing math over the burn spine, flagged before the invoice does." },
    { slug: "mrr-waterfall", why: "New, expansion, contraction and churned billing decomposed per period — the waterfall fold that turns 103 periods into the revenue story the CFO quotes." },
  ],
};
