// MongoDB — kit 11 of the SaaS & Enterprise domain (wave-6, task 92-c-saas).
// Atlas usage-and-support SQL: the storefront db read as a managed-database
// sandbox — customers are Atlas organizations, orders are clusters with a
// lifecycle state (delivered = running/healthy, shipped = scaling,
// pending = provisioning, cancelled = terminated), shipped_at = the
// ready-since stamp, order_items = metered ops/storage lines, products =
// instance sizes, regions = org footprints. Invoices/payments are the
// per-org Atlas bills — and the support cases that follow them — in INTEGER
// cents (/100.0). Angle: cluster usage billing, support-ticket themes,
// conversion from free tier. Pool provenance: 0 tagged LC rows for MongoDB —
// the whole pool is theme-curated to known Atlas screen shapes and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const mongodbKit: CompanyKit = {
  id: "mongodb",
  domainId: "saas",
  name: "MongoDB",
  tagline: "The database company: Atlas usage and support",
  accent: "text-green-400",

  brief: [
    "**MongoDB** sells the database developers already chose — and Atlas, its managed cloud, turns every deployment into a consumption meter. The analytics reality is fleet assurance: how many clusters are healthy, how fast they come up, what each organization actually burns. On this storefront db the mapping is honest: 16 Atlas organizations run 103 clusters metered across 251 ops/storage lines, and the lifecycle mix reads like a fleet dashboard — 52 {emerald:running} (50.5%), 30 scaling (29.1%), 14 {amber:provisioning} (13.6%), 7 {rose:terminated} (6.8%). The conversion story rides the same ledger: **63.5%** of usage value sits above the 3,000 line — the free-tier-to-paid question every earnings call asks.",
    "The data org splits three ways. Usage analytics owns the metered folds: ops lines joined to instance sizes and aggregated per cluster — the top instance-size family logs **97 lines** worth 11,744.01, the broadest family touches 54 distinct clusters. Capacity owns lifecycle and time-to-ready: 82 of 103 clusters carry a ready-since stamp, averaging **2.98 days** from creation to first heartbeat, range 2 to 4 — and the 21 without stamps are provisioning-plus-terminated, the fleet's honest backlog. The support-and-billing desk owns 28 cases against 27 settlements, INTEGER cents throughout: 6 never-settled bills worth 15,217, one of them (#28, 1,756.00) claiming {emerald:paid} with zero settlement rows — and its mirror twin, a void bill (#11, 925.00) WITH a payment row.",
    "Interview style is census-then-denominator, then the support join. A screen opens with a one-pass lifecycle census — `COUNT(*) FILTER (WHERE …)` — because five separate queries is five chances to disagree; escalates into a two-grain footprint read (EU carries 45 clusters from just 8 orgs; the US, 19 from 2); then the support desk: cases with no settlement behind them (the anti-join), and settlement speed — 20 settled cases in **28.4 days** on average, fastest 13, slowest 84, against uniform 30-day terms. Candidates who state the population before computing are the ones who get callbacks.",
    "Preparation strategy: the registry tags zero SQL problems for MongoDB — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems mirror known Atlas screens — fleet censuses, lifecycle conditional counting, instance-size pricing, conversion concentration, support anti-joins and bill reconciliation. Then run both case studies on the live db: one rebuilds the one-pass cluster-state census the fleet dashboard is drawn from, the other rebuilds the region billing census capacity closes the month with. The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
  ],

  dayInLife: [
    "**08:15 —** The morning starts on fleet health. A usage analyst opens the lifecycle dashboard before the capacity standup: did last night's provisioning queue drain, does the {emerald:running} count (52 of 103) reconcile with what billing invoiced, and did any footprint's terminated share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a one-pass census — `COUNT(*) FILTER (WHERE …)` per lifecycle state against the billing snapshot — and the numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is support-desk surgery. The billing-and-support desk wants the open-case list refreshed — bills LEFT JOIN settlements, keep the NULLs: 6 never-settled bills worth 15,217, including #28, which *claims paid with zero settlement rows* and goes to the anomaly queue, not the dunning queue. A capacity planner wants the two-grain footprint re-cut (EU: 45 clusters from 8 orgs — intensity 5.6); an instance-size owner wants metered lines and dollars side by side, because 'the fleet is growing' means nothing until lines price into burn. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:00 —** The afternoon tilts toward the instance catalog and stakeholder cycles. The size review walks the instance table with SQL attached to every bar — which sizes meter the most lines, which burn most, where the mid-price band (8 sizes averaging 111.5) sits against the budget band (8 at 32.06) and why the premium band at 200-plus is empty; finance walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the bill base?* This is the hour cluster numbers meet the customers who pay for them.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The open-case query ships with its survival rule in the comment (bills whose join finds no settlement ARE the list; an INNER JOIN here deletes the customer, not the bug); the anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the void bill with one (#11, 925.00); and tomorrow's follow-ups are queued per org. The rhythm to internalize: MongoDB SQL exists to prove that the fleet and the bill agree — *the meter and the invoice are the same story told at two grains.*",
  ],

  metrics: [
    { name: "Fleet size", what: "Clusters and metered lines on the calendar: 103 clusters, 251 lines across 16 orgs. The volume read every capacity and revenue claim starts from." },
    { name: "Healthy share", what: "Running ÷ ALL clusters: 52 of 103 (50.5%). The denominator is the interview — 52 of 96 live (54.2%) is a different metric with a different name." },
    { name: "Time-to-ready", what: "Days from creation to ready-since stamp on stamped clusters: 82 of 103, averaging 2.98 days, range 2 to 4. The provisioning SLA the fleet dashboard charts." },
    { name: "Terminated share", what: "Terminated ÷ all: 7 of 103 (6.8%). Cut by footprint: APAC 8.1% highest, LATAM 0 — the churn map leadership reads first." },
    { name: "Org footprint mix", what: "Clusters and orgs per region — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The two-grain census separating fleet load from installed base." },
    { name: "Conversion concentration", what: "Share of usage value from the heaviest orgs: 63.5% sits above the 3,000 line, 71.2% above 2,000. The free-tier-to-paid story in one number." },
    { name: "Unsettled bills & open cases", what: "Bills with no settlement rows: 6 worth 15,217 — and one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the support desk runs on." },
    { name: "Support settlement speed", what: "Days from case open to first settlement on settled cases: 20 settle in 28.4 days on average, fastest 13, slowest 84 — against uniform 30-day terms." },
  ],

  topics: [
    {
      name: "Cluster & org censuses",
      why: "Every MongoDB screen opens with a fold: clusters, orgs, metered lines — grouped and counted without letting the grain blur. COUNT(*) counts clusters, COUNT(DISTINCT customer_id) counts orgs; 103 clusters come from just 16 orgs, and the census is where candidates prove which grain they're standing on.",
      slugs: ["product-sales-analysis-ii", "find-followers-count", "top-earners"],
    },
    {
      name: "Lifecycle-state conditional counting",
      why: "Running, scaling, provisioning, terminated — every rate here is a conditional count over a lifecycle flag, and the interviewer's first question is 'what's in the denominator?'. One-pass FILTER censuses and SUM(CASE WHEN …) folds are the shapes that survive scrutiny.",
      slugs: ["count-salary-categories", "calculate-orders-within-each-interval", "weather-type-in-each-country"],
    },
    {
      name: "Joining orgs to clusters",
      why: "Clusters inherit org attributes through joins to the orgs table, and the join type decides who survives: a cluster with no org is corruption; an org with no cluster is a free-tier signup that never converted. Choosing INNER versus LEFT is a business statement.",
      slugs: ["employee-bonus", "sales-analysis-ii", "confirmation-rate"],
    },
    {
      name: "Instance-size & storage mix",
      why: "Metered lines carry instance sizes, and the catalog story is a join-then-weigh fold: lines × unit_price per line, the top family burning 11,744.01 on 97 lines. The per-size census is what capacity planning and pricing pages are built on — and the premium band (200-plus) is empty here, which is itself a finding.",
      slugs: ["average-selling-price", "product-sales-analysis-iii", "rearrange-products-table"],
    },
    {
      name: "The usage-billing calendar",
      why: "Burn is calendar arithmetic: STRFTIME('%Y-%m') buckets over clusters against the 3,731.97 peak and the 1,193.86 floor. MongoDB drills the month-bucket idiom because every cost-trend chart hangs on that spine — and a '%m'-without-year fold merges two years into one lie.",
      slugs: ["friday-purchases-i", "monthly-transactions-i", "convert-date-format"],
    },
    {
      name: "Conversion & spend concentration",
      why: "The free-tier question is a concentration fold: 63.5% of usage value above the 3,000 line, 71.2% above 2,000, one org carrying 24 clusters and 7,262.35. Tier-band CASEs and histogram buckets turn that story into a query — with the denominator stated before the share is computed.",
      slugs: ["number-of-rich-customers", "spend-histogram", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Support-case anti-joins",
      why: "Silence reads are anti-joins: bills with no settlements (6 on this db), orgs with no clusters (0 — the honest free-tier zero is worth proving, not assuming). The survival rule of the join IS the query; an INNER JOIN here deletes the finding, not the bug.",
      slugs: ["customers-who-never-order", "ad-free-sessions", "employees-with-missing-information"],
    },
    {
      name: "Ops leaderboards & usage tiering",
      why: "Fleet boards rank orgs by burn and tier them by usage — and ties are real (four orgs at 4 clusters). RANK, NTILE and the percentile shapes here are business decisions about shared rungs and tile edges, not syntax trivia.",
      slugs: ["rank-scores", "usage-tier-percentiles", "second-highest-salary"],
    },
    {
      name: "Above-average spend screens",
      why: "Screens escalate into nested logic: clusters above the platform-average burn, orgs clearing a spend threshold. Scalar and HAVING-gated shapes each carry an empty-inner-query answer you are expected to give unprompted — the silent-zero-rows bug ships on staging tables.",
      slugs: ["orders-with-maximum-quantity-above-average", "find-expensive-cities", "department-highest-salary"],
    },
    {
      name: "Bills, support cases & cents discipline",
      why: "The meter is not the money: 28 bills against 27 settlements, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where Atlas interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "gl-reconciliation", "account-balance"],
    },
  ],

  theory: [
    {
      id: "mdb-t1",
      q: "Your free-tier report joins orgs to their clusters. When do you INNER and when do you LEFT — and what silently breaks if you filter a cluster column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A fleet report joins clusters to orgs: a cluster with no org is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A never-converted report must be LEFT from orgs: the orgs with no clusters ARE the finding — a free-tier signup that never deployed is the conversion-funnel leak — arriving with NULL cluster columns. The classic break: filtering status = 'delivered' in WHERE after a LEFT JOIN kills every NULL-payload org row — the LEFT JOIN quietly became an INNER and the never-converted orgs vanished. The fix is moving the predicate into ON or an outer query. On this db the never-deployed anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "mdb-t2",
      q: "The fleet census shows 103 clusters, 16 orgs and 251 metered lines. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts metered rows — 251; COUNT(DISTINCT o.id) folds them back to clusters — 103; COUNT(DISTINCT customer_id) folds further to orgs — 16. None is wrong: lines measure ops-level burn, clusters measure the fleet, orgs measure the installed base. The ratios are the reads — 2.4 lines per cluster, 6.4 clusters per org — and they decide whether growth is broadening (more orgs deploying) or deepening (more clusters per org), which is the Atlas land-and-expand question. The trap that catches candidates is quoting a line count as a cluster count in a trend; one cluster with three metered lines is one fleet row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "mdb-t3",
      q: "The capacity review wants regions carrying at least twenty clusters. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The lifecycle rule is a row-level fact — status = 'running' discards terminated and provisioning clusters before any fold, in WHERE; putting it in HAVING is impossible because states no longer exist once rows are grouped. The twenty-cluster floor is a group-level fact — HAVING COUNT(*) >= 20 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a footprint line and an error, and between a threshold applied to clusters versus to orgs. On this db only EU (45) and APAC (37) clear a twenty-cluster bar. The strong answer places every filter by asking: is this a fact about one metered line, or about a region's whole fold?",
      tag: "pipeline",
    },
    {
      id: "mdb-t4",
      q: "You tier Atlas orgs by monthly burn into usage bands. Walk me through RANK versus NTILE versus a CASE band — and who decides where the edges go?",
      a: "Three tools, three contracts. RANK orders orgs and shares rungs on ties — the four orgs tied at 4 clusters all read the same rank, and the next distinct count skips. NTILE(4) force-quarters the population into four tiles regardless of ties — the tile edge can split orgs with identical burn, which is a policy you must own, not a rounding detail. A CASE band uses fixed thresholds — 2,000 and 3,000 lines, say — and its edges are business decisions: on this db the 3,000 line is where 63.5% of usage value concentrates, so the edge IS the conversion story. The wrong answer is picking a function; the right answer is picking a contract — ranked peer pressure, forced quartiles, or fixed pricing bands — and stating which orgs sit on each edge. Every fleet-tiering report is auditable only if the edge policy is written down.",
      tag: "windows",
    },
    {
      id: "mdb-t5",
      q: "A cluster sits 'provisioning' with no ready-since stamp yet. What is your NULL policy for the time-to-ready report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only clusters with a ready-since stamp have a provisioning latency, so the report measures stamped clusters and says so — on this db 82 of 103 carry a stamp, averaging 2.98 days, range 2 to 4; 14 are still provisioning, 7 terminated without ever readying. Then mechanics: AVG ignores NULLs, so AVG over ALL clusters returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(ready_since) counts the ready subset; the gap between it and COUNT(*) IS the not-yet-ready count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant provisioning for clusters still coming up, and an SLA report built that way is a lie with decimals.",
      tag: "nulls",
    },
    {
      id: "mdb-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 clusters always produce an average. On filtered staging tables — one region, one instance size, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each cluster to ITS org's average burn) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "mdb-t7",
      q: "The burn trend buckets clusters by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the burn curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's provisioning, and month-end is exactly when fleet changes land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a burn walk. The spine's headline is probed: 2024-01 opens at 8 clusters and 3,731.97 of usage value.",
      tag: "dates",
    },
    {
      id: "mdb-t8",
      q: "The support desk says a paid Atlas bill has no settlement rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 4,937.00 print into 4,937 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the meter and the bill, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "mdb-mcq-1",
      prompt: "A cluster row's status column reads 'pending'. In Atlas lifecycle language, what is it?",
      choices: ["Running and healthy", "Scaling — resizing in place", "Provisioning — created, not yet ready", "Terminated"],
      answer: 2,
      why: "This kit's lifecycle map is fixed: delivered = running (52 of 103 clusters), shipped = scaling (30), pending = provisioning (14), cancelled = terminated (7). 'Pending' is the cluster that exists but hasn't sent its first heartbeat.",
      notes: [
        { choice: 1, why: "Scaling is 'shipped' — 30 clusters that already run and are resizing. Counting provisioning as scaling inflates every capacity-readiness number." },
        { choice: 3, why: "Terminated is 'cancelled' — 7 clusters. Provisioning clusters are still coming; terminated clusters left the fleet. Confusing them flips the churn story." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-2",
      prompt: "Healthy share is defined as running ÷ which population? The db holds 52 running and 7 terminated of 103 clusters.",
      choices: ["Running + terminated only (52/59 = 88.1%)", "All clusters (52/103 = 50.5%)", "Scaling clusters only", "Distinct orgs (52/16)"],
      answer: 1,
      why: "The house definition: running ÷ ALL clusters, provisioning and scaling included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the LIVE-fleet health rate — a legitimate separate metric, but calling it 'the healthy share' inflates 50.5% to 88.1% by quietly deleting 14 provisioning and 30 scaling clusters. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is running clusters per org — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-3",
      prompt: "EU carries 45 clusters from 8 orgs. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cluster rows (45); COUNT(DISTINCT customer_id) folds repeats back to orgs (8). The gap between the columns — 5.6 clusters per org — is the land-and-expand read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cluster has an org. Without DISTINCT both columns read 45 and the census loses the expansion story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts footprints, not orgs — a third grain nobody asked for. The census is clusters AND orgs." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-4",
      prompt: "An Atlas bill row reads amount_cents = 493700. Which expression prints its dollar value?",
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
      id: "mdb-mcq-5",
      prompt: "COUNT(*) FILTER (WHERE status = 'terminated') runs over the whole orders table. What does it return for a status value that matches zero rows?",
      choices: ["NULL — the filter found nothing to count", "0 — COUNT over an empty set is zero, never NULL", "An error — FILTER cannot yield an empty set", "The total row count — the filter is ignored"],
      answer: 1,
      why: "FILTER zeroes the row set before COUNT runs, and COUNT's empty-case contract is 0. That is exactly why one-pass censuses use COUNT(*) FILTER — every state column lands populated, including the zeros a five-query version would render as blanks.",
      notes: [
        { choice: 0, why: "SUM returns NULL on empty sets; COUNT returns 0. The two aggregates have different empty-case contracts — confusing them is how dashboards print NULL where a zero belongs." },
        { choice: 3, why: "The FILTER clause is load-bearing: drop it and the predicate disappears, returning the full count. 'void' matching nothing is not the same as the filter not existing." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-6",
      prompt: "100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued clusters", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, COUNT/COUNT of two integers is integer division — every footprint's healthy share truncates toward 0 and the whole fleet map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (COUNT/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-7",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'void') runs against a staging table where the 'void' filter matches nothing. What does the report return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total clusters"],
      answer: 1,
      why: "The empty inner fold yields NULL, total > NULL is UNKNOWN, and WHERE passes nothing — an above-average report that ships empty-looking-but-valid. On filtered staging tables this bug is routine, which is why the inner fold's population is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the report LOOKS fine. Stricter engines error; the portable answer is to check the inner fold." },
        { choice: 2, why: "No comparison against NULL ever defaults to true — UNKNOWN is discarded by WHERE in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-8",
      prompt: "The open-case list is built as bills LEFT JOIN settlements WHERE the settlement id IS NULL. What happens if a teammate rewrites it with INNER JOIN?",
      choices: ["Same list, faster — INNER JOIN is equivalent here", "Empty list — the bills with no settlements fail the join and vanish", "All 28 bills — the join direction flips", "An error — INNER JOIN needs an ON clause with IS NULL"],
      answer: 1,
      why: "The open-case list IS the anti-join: bills whose join finds no settlement survive only under LEFT JOIN + IS NULL. INNER JOIN drops exactly those rows — the six never-settled bills disappear and the support desk works from an empty queue.",
      notes: [
        { choice: 0, why: "INNER and LEFT differ precisely on the unmatched rows — which are the entire answer here. The rewrite deletes the finding, not the bug; 15,217 of AR goes invisible." },
        { choice: 2, why: "Join type never flips direction — it changes row survival. All 28 would need a CROSS JOIN, a different (and wrong) tool." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-9",
      prompt: "Keep only regions carrying at least 20 clusters. Where does the threshold live — and which regions survive on this db?",
      choices: ["WHERE COUNT(*) >= 20 — EU and APAC survive", "GROUP BY region HAVING COUNT(*) >= 20 — EU (45) and APAC (37) survive; US (19) and LATAM (2) drop", "WHERE clusters >= 20 on the raw table — all regions survive", "HAVING before GROUP BY — nothing survives"],
      answer: 1,
      why: "A cluster-count floor is a group-level fact: HAVING follows GROUP BY. On this db the census is EU 45, APAC 37, US 19, LATAM 2 — so a 20 floor keeps exactly EU and APAC, and the US misses it by one.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself, regardless of which regions would qualify." },
        { choice: 2, why: "There is no 'clusters' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-10",
      prompt: "A coverage CASE classifies bills: WHEN SUM(p.amount_cents) < i.amount_cents THEN 'partial' ... ELSE 'exact' — and the no-payment arm runs SECOND. What happens to a bill with zero settlement rows?",
      choices: ["Classified 'partial' — SUM is 0, which is less than the amount", "Falls through as NULL — SUM of no rows is NULL, NULL < amount is UNKNOWN, so it lands in ELSE as 'exact'", "An error — SUM cannot run on an empty group", "Classified 'partial' only if the bill is also marked paid"],
      answer: 1,
      why: "A bill with no settlement rows yields SUM(p.amount_cents) = NULL, and NULL < amount is UNKNOWN — the partial arm never fires, so the bill falls to ELSE and reads 'exact'. That is why the no-payment arm (p.id IS NULL) must be checked FIRST — #28, marked paid at 1,756.00 with no settlements, is the standing proof.",
      notes: [
        { choice: 0, why: "SUM over zero rows is NULL, not 0 — the empty-group fold is the trap. COUNT returns 0 on empty groups; SUM returns NULL. The two aggregates have different empty-case contracts." },
        { choice: 3, why: "The CASE never sees the status column — arm order and NULL semantics decide, not the claimed status. A 'paid' label with zero settlement rows still folds to NULL." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mdb-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass cluster-state census",
      brief:
        "MongoDB-flavored brief on the storefront db: the fleet dashboard's headline strip is a one-pass lifecycle census — every state counted from the same scan, because five separate queries are five chances to disagree at different moments. Probed facts: 103 clusters total, 52 running (50.5% of the fleet), 30 scaling, 14 provisioning, 7 terminated. The census prints running / scaling / terminated counts, the still-provisioning count, and the healthy share of the whole fleet at one decimal — the denominator being every cluster raised, not just the live ones.",
      ask: "Return the full lifecycle census in one row: total clusters, running, scaling, provisioning, terminated, and the healthy percentage of the whole fleet.",
      template:
        "SELECT COUNT(*) AS clusters,\n       COUNT(*) {1} AS running,\n       COUNT(*) {2} AS scaling,\n       COUNT(*) FILTER (WHERE status = 'pending') AS provisioning,\n       COUNT(*) {3} AS terminated,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), 1) AS healthy_pct\nFROM orders;",
      slots: [
        {
          answer: "FILTER (WHERE status = 'delivered')",
          kind: "keyword",
          label: "the running census",
          why: "Running is the delivered lifecycle — 52 clusters. Swapping in 'pending' prints 14 under running and the dashboard misleads at a glance; dropping FILTER entirely is a syntax break, not a shorthand.",
        },
        {
          answer: "FILTER (WHERE status = 'shipped')",
          kind: "keyword",
          label: "the scaling census",
          why: "Scaling is the shipped lifecycle — 30 clusters resizing in place. 'pending' would double-book the provisioning queue into the scaling column and the capacity read collapses.",
        },
        {
          answer: "FILTER (WHERE status = 'cancelled')",
          kind: "keyword",
          label: "the terminated census",
          why: "Terminated is the cancelled lifecycle — 7 clusters. 'void' matches no lifecycle value, and the column would read 0 — a churn story silently erased from the dashboard.",
        },
      ],
      distractors: ["WHERE status = 'delivered'", "FILTER (WHERE status = 'pending')", "FILTER (WHERE status = 'void')"],
      walkthrough:
        "One scan, five numbers, zero drift. COUNT(*) folds the whole fleet — 103 clusters — and each FILTER clause carves one lifecycle state from the same rows: running 52, scaling 30, provisioning 14, terminated 7, with the healthy share dividing the delivered count by everything: 100.0 × 52 / 103 = 50.5%, the probed platform figure. The census's whole point is single-scan consistency — five separate queries could straddle a provisioning event and print states that never coexisted. The distractors each break differently: a bare WHERE inside COUNT(*) is a syntax error, not a shorthand — FILTER is the grammar; 'pending' in the running or scaling slot misplaces 14 clusters and the capacity read lies at a glance; 'void' matches no lifecycle value, so the terminated column prints 0 and the churn story vanishes. The lesson under the lesson: a census is trustworthy when every column comes from one scan — and when COUNT's empty-set contract (0, never NULL) is understood well enough to trust the zeros it prints.",
    },
    {
      id: "cs-mdb-2",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The region billing census with the gate",
      brief:
        "MongoDB-flavored brief on the storefront db: month-close ends with the region billing census — clusters, orgs, usage value and average cluster spend per footprint, gated so the review argues about real footprints. Probed facts: EU carries 45 clusters from 8 orgs worth 15,089.23 (avg 335.32); APAC 37 from 5 worth 11,605.45 (avg 313.66); US 19 from 2 worth 7,286.16 (avg 383.48 — the highest per-cluster burn); LATAM 2 from 1 worth 852.44. The gate is a twenty-minus-one cluster floor: the region sitting exactly ON the floor stays, proving the gate is inclusive, and the smallest footprint drops below it.",
      ask: "Return each qualifying region with cluster count, distinct orgs, usage value and average cluster spend — biggest spend first.",
      template:
        "SELECT c.region AS org_region,\n       COUNT(*) AS clusters,\n       COUNT(DISTINCT o.customer_id) AS orgs,\n       ROUND(SUM(o.total), 2) AS usage_spend,\n       ROUND(AVG(o.total), 2) AS avg_cluster_spend\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nHAVING COUNT(*) >= {1}\nORDER BY usage_spend {3};",
      slots: [
        {
          answer: "19",
          kind: "number",
          label: "the minimum-cluster gate",
          why: "The nineteen-cluster floor keeps EU (45), APAC (37) and the US — sitting exactly ON the floor at 19 — while LATAM's 2 drops. A 20 gate amputates the floor region; the inclusive edge is the whole point of the gate.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the org join key",
          why: "Clusters carry the org foreign key — c.id = o.customer_id is the only grain-honest join. c.id = o.id pairs cluster ids against org ids (garbage counts); c.id = c.region compares an integer id to text and matches nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The review reads the burn leader first: EU at 15,089.23. ASC would open on the US at 7,286.16 — the smallest gated footprint with, ironically, the highest per-cluster spend (383.48).",
        },
      ],
      distractors: ["20", "c.region", "ASC"],
      walkthrough:
        "One join, two grains, one gate with an inclusive edge. Clusters join to orgs on the foreign key and fold per region: clusters via COUNT(*), orgs via COUNT(DISTINCT customer_id) — 45 from 8, 37 from 5, 19 from 2 — usage value via SUM to the probed 15,089.23 / 11,605.45 / 7,286.16, and average cluster spend via AVG, where the US leads at 383.48 despite the smallest gated footprint. The gate at 19 keeps the three real footprints and drops LATAM (2 clusters, 852.44) — and the US surviving exactly at the floor proves the gate is >=, not >. The distractors each break differently: a 20 gate amputates the floor region and the census loses its edge case; c.region in the join key compares integer ids to region text — in SQLite's type ordering the comparison is never equal, so the census empties; ASC flips the read to lead with the smallest burn. The lesson under the lesson: gates are business decisions — where the floor sits, and whether the floor is inclusive, decide which regions the review is allowed to argue about.",
    },
  ],

  problems: [
    { slug: "count-salary-categories", why: "A CASE-band census stacked with UNION ALL — the lifecycle-state census in textbook clothing: running / scaling / provisioning / terminated, each band counted from one fold." },
    { slug: "number-of-rich-customers", why: "Above-threshold conversion counts — the free-tier question: how many orgs clear the paid line, with the 63.5% concentration figure as the sanity check." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Above-average screens via subquery — the empty-inner-query trap in textbook clothing, and the follow-up every Atlas panel is fishing for." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly census at two grains: clusters AND orgs active per month — fleet load versus installed base in one query, the way capacity reviews open." },
    { slug: "average-selling-price", why: "Per-unit pricing joins with time-window filters — the instance-size pricing shape that turns metered lines into burn, 97 lines into 11,744.01." },
    { slug: "bank-account-summary-ii", why: "Per-org debit/credit folds with NULL-safe arms — the per-org billing rollup the support-and-billing desk runs before any dunning cycle." },
    { slug: "gl-reconciliation", why: "Ledger-grade reconciliation — counts and sums agreeing between the meter and the bill, the culture this kit's anomaly list enforces." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself: LEFT JOIN + IS NULL as a survival rule — the never-deployed-org hunt, where proving a confident zero is the job." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before any fleet leaderboard ships, with the four-way tie at 4 clusters named out loud." },
    { slug: "confirmation-rate", why: "Completion-rate joins with NULL-safe division — the support-callback shape: resolved cases ÷ raised cases, org by org." },
    { slug: "usage-tier-percentiles", why: "NTILE usage tiers — the org-tiering shape where tile edges are policy: who lands in the top quartile of burn decides where expansion calls go." },
    { slug: "employees-with-missing-information", why: "Missing-contact hygiene via FULL-style LEFT JOIN checks — the support desk's first data-quality gate before any outbound cycle." },
    { slug: "the-latest-login-in-2020", why: "Last-heartbeat per cluster — the most-recent-activity read ops uses to find clusters whose telemetry went quiet." },
    { slug: "calculate-orders-within-each-interval", why: "Interval-band CASE buckets — the storage-band histogram: how many clusters sit in each size band, with the premium band's emptiness as the punchline." },
    { slug: "combine-two-tables", why: "Org enrichment LEFT JOIN — org attributes attached to every cluster, NULL-safe for rows the fleet hasn't touched." },
    { slug: "monthly-transactions-i", why: "Month-bucketed conditional folds — the burn-calendar idiom where '%Y-%m' versus '%m' is the difference between a trend and two merged years." },
  ],
};
