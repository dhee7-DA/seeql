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
    "The economics underneath the fleet are a billing engine, and the org reads it three ways. The bill base is **28 invoices** in INTEGER cents — 21 settled worth 66,443, 6 {amber:open} worth 19,609, 1 {rose:void} at 925 — settled by 27 payment rows split across two rails: card 16 for 37,364, wire 11 for 32,248. Settlement runs *fast on average, slow at the tail*: 20 settled bills clear in **28.4 days** on average (fastest 13, slowest 84) against uniform 30-day terms — the average hides the breach tail. The expense side is 36 lines totaling 25,416, with Rent alone at 16,800 — about two-thirds of spend — against Ads 4,570, Travel 2,521, Tools 1,525. And the whole story closes on a proof: ledger debits **181,080** against credits 181,080, delta 0, cash netting 44,196 and AR 16,440 — *the trial balance is the receipt that the meter, the bill and the books agree.*",
    "Preparation roadmap for the expanded kit: run the **15 topics** in study order — census folds and conditional counting first, then the join-survival rules, the calendar spine, CASE bands and scalar subqueries — then drill **24 theory** questions and 30 MCQs before touching the 6 case files, which now end in two {sky:hard} builds: the collections calendar (month buckets over pre-aggregated settlements, where one bill can carry two settlement rows) and the above-average burn screen (a scalar subquery whose empty case is part of the answer). Every figure here is probe-backed — the **2.98-day** time-to-ready, the 63.5% concentration line, the 15,217 of AR — so there is no excuse for inventing a number. The bar to clear is unchanged: *state the denominator, the join's survival rule and the cents rule before you compute anything* — now also for the money tables, not just the fleet.",
  ],

  dayInLife: [
    "**08:15 —** The morning starts on fleet health. A usage analyst opens the lifecycle dashboard before the capacity standup: did last night's provisioning queue drain, does the {emerald:running} count (52 of 103) reconcile with what billing invoiced, and did any footprint's terminated share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a one-pass census — `COUNT(*) FILTER (WHERE …)` per lifecycle state against the billing snapshot — and the numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is support-desk surgery. The billing-and-support desk wants the open-case list refreshed — bills LEFT JOIN settlements, keep the NULLs: 6 never-settled bills worth 15,217, including #28, which *claims paid with zero settlement rows* and goes to the anomaly queue, not the dunning queue. A capacity planner wants the two-grain footprint re-cut (EU: 45 clusters from 8 orgs — intensity 5.6); an instance-size owner wants metered lines and dollars side by side, because 'the fleet is growing' means nothing until lines price into burn. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:00 —** The afternoon tilts toward the instance catalog and stakeholder cycles. The size review walks the instance table with SQL attached to every bar — which sizes meter the most lines, which burn most, where the mid-price band (8 sizes averaging 111.5) sits against the budget band (8 at 32.06) and why the premium band at 200-plus is empty; finance walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the bill base?* This is the hour cluster numbers meet the customers who pay for them.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The open-case query ships with its survival rule in the comment (bills whose join finds no settlement ARE the list; an INNER JOIN here deletes the customer, not the bug); the anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the void bill with one (#11, 925.00); and tomorrow's follow-ups are queued per org. The rhythm to internalize: MongoDB SQL exists to prove that the fleet and the bill agree — *the meter and the invoice are the same story told at two grains.*",
    "**20:30 —** The late shift is month-end close on the money tables. The collections calendar gets rebuilt one last time — month buckets over the bill spine, settlements pre-aggregated to one row per bill so a split payment can't double-count the fold — and the newest aging bucket is the headline: 2025-02 shows **3 bills worth 8,112 with zero settlements**, which is not corruption but recency, while the gate at three keeps exactly the months the review argues about. The cash walk gets its final read — card 37,364 against wire 32,248 — and the ledger closes on the only proof that matters: *debits 181,080, credits 181,080, delta 0.* If the trial balance doesn't tie, nobody signs; {emerald:the fleet and the books close together or not at all}.",
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
    { name: "Invoice mix", what: "The bill base at a glance: 28 invoices — 21 paid worth 66,443, 6 open worth 19,609, 1 void at 925. Coverage classes (exact / partial / none) must sum back to 28 or the classifier is broken." },
    { name: "Payment rails", what: "How the money lands: card 16 settlements for 37,364, wire 11 for 32,248 — 27 rows total. Rail mix matters because wire settle slower and reconcile differently than card." },
    { name: "Expense concentration", what: "36 expense lines totaling 25,416 — Rent is 14 of them worth 16,800 (about two-thirds of spend), Ads 4,570, Travel 2,521, Tools 1,525. Fixed-cost gravity the unit-economics math cannot ignore." },
    { name: "Ledger proof", what: "The close gate: ledger debits 181,080 = credits 181,080, delta 0; cash nets 44,196, AR 16,440. A non-zero delta stops the close — the trial balance is the receipt." },
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
    {
      name: "AR aging & collections",
      why: "The money side has its own silence: 6 bills worth 15,217 have no settlement rows, and the newest aging bucket (2025-02: 3 bills, 8,112, zero settled) is recency, not fraud. Anti-joins over the bill tables, concentration cuts and per-bill ratios are how the collections desk works — with the #28 mirror anomaly as the standing edge case.",
      slugs: ["sellers-with-no-sales", "market-analysis-i", "queries-quality-and-percentage"],
    },
    {
      name: "The billing calendar & date math",
      why: "Bills live on a calendar: issued_on buckets from 2024-02 to 2025-02, uniform 30-day terms, settlement windows 13 to 84 days. The month-bucket idiom ('%Y-%m', never bare '%m' — it merges the two Februaries) and date-window filters are the spine of every aging and trend report this desk ships.",
      slugs: ["sales-analysis-iii", "list-the-products-ordered-in-a-period", "fix-product-name-format"],
    },
    {
      name: "Windows over the fleet",
      why: "Fleet reads that keep every row — running billed totals down the month spine, COUNT OVER for org-size context, per-footprint partitions — are the Atlas reporting layer. Frames and partitions decide whether a total is cumulative or reset, and the wrong frame ships a chart that quietly lies.",
      slugs: ["find-the-team-size", "project-employees-iii", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "Set ops & reconciliation stacks",
      why: "Month close stacks views: a running-clusters cut UNION ALL a terminated cut, EXCEPT for rows on one side of the ledger only. Set ops are the reconciliation grammar — but UNION's dedupe pass hides overlap, and column-order drift silently corrupts an EXCEPT diff.",
      slugs: ["team-scores-in-football-tournament", "movie-rating", "capital-gain-loss"],
    },
    {
      name: "Subquery shapes on the org tree",
      why: "The growth board screens orgs against platform averages: seven orgs clear the 338.19 average cluster spend via a scalar subquery in HAVING. Scalar, IN and EXISTS shapes each carry an empty-case contract you state unprompted — the silent-zero-rows bug ships on staging tables.",
      slugs: ["managers-with-at-least-5-direct-reports", "game-play-analysis-iv", "customer-placing-the-largest-number-of-orders"],
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
    {
      id: "mdb-t9",
      q: "Month close stacks a running-clusters view on top of a terminated-clusters view. When is UNION wrong and UNION ALL right — and what does plain UNION cost you?",
      a: "UNION ALL concatenates and keeps everything; UNION runs a full dedupe pass over the stacked result. When the two cuts are provably disjoint — running and terminated are different lifecycle states, a cluster cannot be both — the dedupe is wasted work at Atlas scale and, worse, a lie detector you never calibrated: if the bands ever DO overlap because someone redefined a status, plain UNION silently deletes the overlap and the close still 'balances'. The house rule is default to UNION ALL and earn the dedupe: if duplicates are the bug you are hunting, keep them visible and count them. On this db the disjoint stack is 52 + 7 rows; if a UNION of the two ever returns fewer than 59, the overlap is the incident.",
      tag: "set-ops",
    },
    {
      id: "mdb-t10",
      q: "You want 'bills issued this quarter that never settled' as an EXCEPT query instead of the LEFT JOIN / IS NULL anti-join. What breaks first?",
      a: "EXCEPT compares whole rows, not keys: both SELECTs must produce the same number of columns, in the same order, with comparable types — so you build two narrow key lists (the bill ids) rather than diffing wide rows. The anti-join keys on ONE named column (p.invoice_id IS NULL) and survives column reorders; the EXCEPT version silently changes meaning if someone inserts a column into one arm. Then NULL semantics: EXCEPT treats NULLs as equal for diffing, which the anti-join reaches differently. And the readability contract differs — the anti-join states its survival rule in the WHERE; EXCEPT states it in set membership. On this db both must return the same 6 unpaid bills worth 15,217; if the answers diverge, column drift is the first suspect.",
      tag: "except",
    },
    {
      id: "mdb-t11",
      q: "One Atlas bill can carry two settlement rows (split payments — this db has five such bills). How do you stage the collections calendar so the fan-out cannot double-count anything?",
      a: "Pre-aggregate the many-side to one row per bill before joining: a CTE or derived table — SELECT invoice_id, MIN(paid_on) AS first_paid FROM payments GROUP BY invoice_id — then LEFT JOIN bills to THAT. Now COUNT(DISTINCT i.id) and COUNT(*) agree, and SUM(i.amount_cents) bills each amount exactly once: 28 bills, 13 months, sums like December's 8,830 stay clean. Joining invoices straight to payments fans the fold out — 28 bills against 27 payment rows with five bills doubled — and every SUM over the join inflates by the split amounts while COUNT quietly overcounts bills. The lesson generalizes: whenever a fold follows a join, ask 'one row per what?' — and if the answer is not the grain you're folding at, stage the pre-aggregation in a CTE first.",
      tag: "cte",
    },
    {
      id: "mdb-t12",
      q: "The finance deck wants a cumulative billed curve down the 13-month calendar spine. Which window frame gives that, what is the default frame without it, and why does the distinction matter?",
      a: "Cumulative needs ORDER BY bill_month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW inside the OVER — every month from the first through the current row. Drop the frame and the default (RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) happens to look similar on a unique, ordered spine — but the moment the ORDER BY key has ties, RANGE lumps peers into the same window and the curve plateaus wrong; ROWS counts physical rows and never merges. The other classic: BETWEEN 1 PRECEDING AND 1 FOLLOWING is a three-row rolling window, not a running total. On this db the spine runs 2024-02 (7,003 billed) to 2025-02 (8,112) and the cumulative curve ends at the probed bill base — if the final cell is not the total of all thirteen months, the frame is wrong.",
      tag: "frames",
    },
    {
      id: "mdb-t13",
      q: "The org leaderboard ties four orgs at 4 clusters (then 3, 3, 2, 2, 2). Walk me through what RANK, DENSE_RANK and ROW_NUMBER print for the orgs after that block.",
      a: "RANK shares the rung and skips: the four 4-cluster orgs all read rank 6, the next org (3 clusters) reads 10. DENSE_RANK shares the rung and does not skip: after the tie block the next org reads 7. ROW_NUMBER forces distinct integers and, without a tiebreaker, chooses arbitrarily among equals — which is a nondeterminism bug wearing a feature's clothes. The business reading: RANK says 'six orgs are at or above you', DENSE_RANK says 'you are the seventh-largest cohort', ROW_NUMBER says 'the sort crashed one of four equals'. On this db the tie block is real (four orgs at 4 clusters) and the fleet board picks RANK when the question is position among ALL orgs, DENSE_RANK when it is tier membership — and always adds an explicit tiebreaker before ROW_NUMBER ships.",
      tag: "ranking",
    },
    {
      id: "mdb-t14",
      q: "28 bills, 27 settlement rows — yet a joined SUM of billing somehow reports more than the bill base. Walk me through the arithmetic.",
      a: "The join fans out: five bills on this db settled via two payment rows each (split payments), so bills LEFT JOIN payments returns 28 + 5 = 33 rows, not 28. COUNT(*) over that join prints 33 'bills'; SUM over it double-counts each split bill's amount — a 5,284 bill reads 10,568 — and every per-month rollup inherits the lie. The honest reads: COUNT(DISTINCT i.id) folds back to 28; SUM lives on the bills side only, or on a pre-aggregated one-row-per-bill settlement CTE; and COUNT(p.id) counts settlement rows and is named accordingly. The reconciliation culture: 28 bills and 27 settlements are both TRUE numbers at their own grains — the bug is never the join, it is quoting a fan-out count at the wrong grain. State the grain before the fold, every time.",
      tag: "fanout",
    },
    {
      id: "mdb-t15",
      q: "This db stores money as INTEGER cents, prices as REAL, and dates as TEXT. What type discipline does that force on every query you write?",
      a: "Three disciplines. Money: amount_cents / 100.0 — the .0 forces real division, because integer ÷ integer truncates and odd-cent bills silently lose their cents; compare in cents, display in dollars, never mix. Prices: REAL arithmetic is already real, but equality against REALs is still approximate — band edges use >= against clean literals (50, 200) and the empty premium arm (nothing reaches 200) is a fact, not a rounding artifact. Dates: TEXT in ISO order means string comparison IS chronological — created_at >= '2024-01-01' AND created_at < '2024-04-01' is a correct half-open window — but any format drift breaks the sort, and bare '%m' merges the two Februaries. The Atlas-grade habit: name the storage type of every column you touch and state what the conversion costs before you compute.",
      tag: "types",
    },
    {
      id: "mdb-t16",
      q: "The daily digest wants each org's cluster states as one string cell — 'running, running, provisioning'. How do you build it, and what are the three caveats?",
      a: "GROUP_CONCAT over the joined rows, grouped by org: GROUP_CONCAT(status) with a chosen separator. The caveats: order is nondeterministic in SQLite unless you ORDER BY inside the aggregate (GROUP_CONCAT(status ORDER BY created_at)) — a digest that reshuffles daily reads broken even when it is right; NULLs are skipped silently, so an org with a NULL status column shows fewer entries than it has clusters — the fan-out and the NULL policy interact; and unbounded concatenation is a length bomb — an org with 24 clusters (this db's largest) is fine, an org with 24,000 is not. Atlas-grade answer: name the separator, force the order, decide the NULL rendering explicitly, and cap the cell — a string fold is a display convenience, never a measurement.",
      tag: "text",
    },
    {
      id: "mdb-t17",
      q: "The census runs as five separate COUNT queries today. What does one-pass FILTER buy, and what performance instinct do you apply when the fleet is millions of rows instead of 103?",
      a: "One pass, one truth: COUNT(*) FILTER (WHERE …) per state folds every lifecycle count from a single scan — five queries are five scans and five moments in time that can straddle a provisioning event and disagree. At this db's size performance is moot; the instinct is what Atlas grades: minimize scans over the big table, keep predicates sargable (a function wrapped around the indexed column — WHERE STRFTIME('%Y', created_at) = '2024' — defeats the index while created_at >= '2024-01-01' AND created_at < '2025-01-01' uses it), and let a covering index on (customer_id, status, created_at) answer the per-org census without touching the table. One-pass censuses and sargable windows are the same instinct: touch the fleet once, touch it cheaply.",
      tag: "perf",
    },
    {
      id: "mdb-t18",
      q: "Two dashboards print 'fleet health': one says 50.5%, another says 54.2%. Both are the same 52 running clusters. Reconcile them.",
      a: "Different denominators, different names. 50.5% is running ÷ ALL clusters raised (52 of 103) — provisioning and terminated included; 54.2% is running ÷ LIVE clusters (52 of 96) — terminated dropped, because a terminated cluster cannot be healthy by construction. Neither is wrong; quoting either without its denominator is. The Atlas discipline is to name the metric after its population: fleet health (all raised) versus live-fleet health (deployed only), and to refuse charts that print the number without the label. The same rule sizes every ratio here — 2.4 metered lines per cluster, 6.4 clusters per org, 8.1% APAC terminated share — each is a fraction whose denominator is a business decision, and the strong candidate writes the denominator into the metric name before anyone can weaponize the gap.",
      tag: "kpi",
    },
    {
      id: "mdb-t19",
      q: "A HAVING gate keeps regions with at least 19 clusters. What is the edge policy you must verify before the review trusts the census — and what is the plateau trap?",
      a: "The edge: HAVING COUNT(*) >= 19 is inclusive, and this db proves it — the US sits exactly ON the floor at 19 clusters and survives while LATAM (2) drops; a reviewer who assumed > (strict) amputates the floor region and changes the census. The plateau trap: thresholds only matter where the population actually steps — between 19 and 20 there is nothing (EU 45, APAC 37, US 19, LATAM 2), so a gate of 19 or 20 prints the SAME three regions and the difference is invisible on this data; you probe the sorted counts before debating the edge. The Atlas-grade habit: before any gate ships, run the census ungated, sort it, and state which groups sit between every candidate threshold — a gate whose edge no group occupies is a gate that only looks like a decision.",
      tag: "gates",
    },
    {
      id: "mdb-t20",
      q: "The billed walk goes December 8,830 → January 11,085 → February 8,112. How do you build the month-over-month delta query, and what does the first row print?",
      a: "LAG over the ordered spine: billed - LAG(billed) OVER (ORDER BY bill_month) — December vs November, January +2,255 over December, February -2,973 over January. The first row has no prior month, so its delta is NULL by definition — print NULL or the literal 'baseline', never COALESCE it to zero, which reads as 'flat month' in a walk that had no prior month at all. The deeper discipline: LAG consumes the spine's order, so the spine must already be honest — '%Y-%m' buckets, gate applied before the window, and any month with no bills (this calendar has none, but a filtered view might) must appear as a zero or the deltas stride across the gap and overstate momentum. A MoM query is only as trustworthy as the rows the window walks.",
      tag: "trends",
    },
    {
      id: "mdb-t21",
      q: "Your settlement-count column shows NULL for six bills. Teammate COALESCEs it to 0 for the report. When is that right, when is it a lie?",
      a: "It depends which layer the COALESCE lives in. Display layer: the report's consumers read tables, not NULL semantics — IFNULL(settlement_count, 0) turning 'no settlement rows' into a printed 0 is honest, because zero settlement rows is exactly the fact. Measure layer: the lie is COALESCEing a quantity whose absence is not zero — IFNULL(days_to_settle, 0) publishes instant settlement for bills that never settled (this db's six unpaid bills would read as 0-day speedsters), and any AVG built on that column inherits the zeros and collapses. The contract: NULL means 'not yet' or 'never' — render it as 0 only when 0 is the true count of the thing (rows), never when it is a fabricated value of a measurement (days, dollars, latency). Name the layer, and the COALESCE decides itself.",
      tag: "display",
    },
    {
      id: "mdb-t22",
      q: "The unpaid-bill anti-join is famous. What is its mirror image, and why does a reconciliation desk run BOTH directions?",
      a: "The mirror is the orphan check: settlements LEFT JOIN bills, keep the bills-side NULL — payments pointing at no invoice. The unpaid anti-join reads silence on the bills side (6 bills, 15,217 of AR, nothing behind them); the orphan anti-join reads silence on the money side — cash that landed without a bill, which is how duplicate charges and misposted wires hide. Both directions must be run because the ledger's proof is symmetric: this db ties at 181,080 debits and credits, but the trial balance can tie while a payment lands on the wrong invoice — the delta only catches sum-level errors, not row-level misposting. The desk's standing rule: every money row must resolve to its document and every document to its money — two anti-joins, run both ways, every close.",
      tag: "orphans",
    },
    {
      id: "mdb-t23",
      q: "Month close runs eleven figures that must agree: the census, the calendar, the coverage classes, the rails, the trial balance. How do you package that so it is reproducible?",
      a: "As a named reporting layer, not a chat-history of ad-hoc SQL: one query per figure, each stating its own denominator and survival rule in a comment, staged as CTEs so the month spine and the pre-aggregated settlements are defined exactly once and every downstream figure consumes the same definitions. The contract each figure signs: counts and sums must reconcile across grains — 28 bills = 21 exact + 1 partial + 6 none; the calendar's 13 months sum back to the bill base; the ledger ties at 181,080 = 181,080 with delta 0. Ad-hoc SQL drifts — someone's WHERE gains a clause, a '%m' replaces a '%Y-%m' — and the close argues about numbers instead of the business. The Atlas-grade answer: the close is a query set with a reconciliation invariant, versioned, and the invariant is the deliverable.",
      tag: "reporting",
    },
    {
      id: "mdb-t24",
      q: "You quote 2.4 metered lines per cluster and 6.4 clusters per org. When does 'just average the ratios' go wrong?",
      a: "Ratio of sums versus sum of ratios: 251 lines ÷ 103 clusters (2.44) and 103 clusters ÷ 16 orgs (6.44) fold the WHOLE population — averaging each org's personal lines-per-cluster prints a different, quietly wrong number, because small orgs with one line drag the mean while carrying almost no fleet weight. The honest chain is top-down: fold the numerator and denominator across all rows, divide once, and only then say 'on average'. Same discipline for the footprint intensities — EU 45 clusters from 8 orgs is 5.6, but the US is 19 from 2 (9.5) and quoting the platform-average 6.4 for the US erases its two-org concentration risk. Atlas-grade habit: every 'average of a ratio' claim gets re-derived as 'ratio of the folds' before it ships; the gap between the two is where the two-grain story lives.",
      tag: "ratios",
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
    {
      id: "mdb-mcq-11",
      prompt: "The settlements split across two rails: card 16 payments worth 37,364, wire 11 worth 32,248. Which sentence is TRUE?",
      choices: ["Wire dominates — 32,248 is bigger than 16", "Card leads on both count and value: 16 of 27 settlements, 37,364 of the money", "The rails split evenly — 13.5 settlements each", "Card is 16% of settlements"],
      answer: 1,
      why: "27 settlement rows split card 16 / wire 11, and card also carries more money: 37,364 against wire's 32,248. The rail read needs BOTH grains — row count and value — because each answers a different ops question (volume vs cash weight).",
      notes: [
        { choice: 0, why: "That compares a SUM against a COUNT — 11 wire ROWS against 16 card rows, and 32,248 against 37,364. Never let a value beat a count in the same sentence; grains must match before comparisons mean anything." },
        { choice: 3, why: "16 is a row count, not a percentage — card is 16 of 27 rows (59.3%). Quoting a raw count as a share inflates nothing visible but corrupts every downstream mix chart." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-12",
      prompt: "The trial balance prints total_debits 181,080, total_credits 181,080, delta 0. What does that actually prove?",
      choices: ["All 80 ledger entries cancel each other out", "Debits equal credits — the books balance, but nothing about whether each entry is classified into the right account", "Cash on hand is 181,080", "181,080 invoices were issued"],
      answer: 1,
      why: "Delta 0 is the sum-level proof: every debit has a matching credit somewhere. It says nothing about row-level correctness — a payment can post to the wrong invoice and the balance still ties, which is why the close also runs the row-level anti-joins.",
      notes: [
        { choice: 0, why: "Entries don't cancel pairwise — accounts carry net balances: cash nets 44,196, AR 16,440. 'Balance' means the two columns sum equal, not that rows annihilate." },
        { choice: 2, why: "Cash is one account inside the ledger, netting 44,196 — not the 181,080 turnover. Confusing a flow total with an account balance is the oldest close-room error there is." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-13",
      prompt: "Expenses total 25,416 across 36 lines; Rent is 14 lines worth 16,800. Roughly what share of spend is Rent?",
      choices: ["About 34% — Rent is a minority line", "About 66% — 16,800 ÷ 25,416", "About 88% — 14 of the 16 expense categories", "About 12% — total ÷ Rent"],
      answer: 1,
      why: "16,800 of 25,416 is 66.1% — Rent is two-thirds of spend, the fixed-cost gravity every unit-economics conversation starts from. The 14 is a line COUNT; the share is a value ratio.",
      notes: [
        { choice: 2, why: "That divides a count by a count across different grains (14 of 36 lines is 38.9%, and '16 categories' isn't even the right denominator). Shares divide dollars by dollars." },
        { choice: 3, why: "Inverted division: 25,416 ÷ 16,800 ≈ 1.5, not 12%. A share above 100% or wildly below the obvious visual (Rent dwarfs the other bars) should trigger a denominator check." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-14",
      prompt: "251 metered lines across 103 clusters gives 2.4 lines per cluster. What grain is that ratio measuring?",
      choices: ["Orgs per cluster — the installed-base read", "Metered lines per cluster — ops volume per fleet row", "Clusters per org — the land-and-expand read", "Monthly burn per cluster"],
      answer: 1,
      why: "Lines ÷ clusters folds ops-level rows down to fleet rows: 2.4 metered lines per cluster. Its siblings are clusters ÷ orgs (6.4, the expansion read) and lines ÷ orgs — each pairs a numerator grain with a denominator grain, and the pairing IS the metric's meaning.",
      notes: [
        { choice: 0, why: "Orgs-per-cluster would divide 16 by 103 and read 0.16 — the ratio's direction is baked into which table sits on top. Lines (251) over clusters (103) is an ops-density read." },
        { choice: 2, why: "That's the INVERSE family: 103 ÷ 16 = 6.4 clusters per org. Quoting 2.4 as an expansion intensity understates fleet depth by 2.7x and misleads the capacity review." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-15",
      prompt: "Bill #5 (5,284) was settled by TWO payment rows. Invoices LEFT JOIN payments, then SUM(amount) per bill — what prints for #5?",
      choices: ["5,284 — joins dedupe automatically", "10,568 — the bill amount counted once per settlement row", "2 — the join returns the payment count", "NULL — two rows break the fold"],
      answer: 1,
      why: "The join fans out: #5 appears twice in the joined result, so SUM over the joined rows doubles its amount to 10,568. SUM must live on the bills side alone, or on a pre-aggregated one-row-per-bill settlement CTE — the fan-out tax is the whole lesson.",
      notes: [
        { choice: 0, why: "Joins never dedupe — they multiply. Only COUNT(DISTINCT i.id) folds back to the bill grain; a bare SUM trusts the join's row count blindly." },
        { choice: 2, why: "That's COUNT(p.id)'s answer — a different aggregate, a different name. Printing 2 under a 'settled_dollars' header is exactly the mislabeled-fold bug this kit audits for." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-16",
      prompt: "The collections calendar shows 2025-02 with 3 bills, 8,112 billed, ZERO settlements. What is the right first interpretation?",
      choices: ["Corruption — the settlement rows were deleted", "The newest aging bucket — recent bills that simply haven't reached settlement yet", "Those bills must have been voided", "The cents rule truncated the sums to zero"],
      answer: 1,
      why: "2025-02 is the calendar's freshest month; zero settlements there is recency, not fraud — the aging curve EXPECTS the newest bucket to run light on settlements. The anomaly queue is for silence that contradicts a claim (a 'paid' bill with no rows), not for buckets that are simply young.",
      notes: [
        { choice: 0, why: "Deleting three settlement rows while keeping the bills is possible, but the standing rule is to check the claim-versus-rows pattern first — #28 (paid with no rows) is the fraud shape, and none of February's bills claims paid." },
        { choice: 2, why: "Void bills are rare (this db has exactly one, #11 at 925) and void-with-payment is the anomaly. Assuming void from silence inverts the desk's evidence discipline." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-17",
      prompt: "A teammate buckets the bill calendar with STRFTIME('%m', issued_on). What happens to the 13-month spine?",
      choices: ["Nothing — the month number is all the calendar needs", "Same months from different years merge — 2024-02's 2 bills and 2025-02's 3 fold into one '02' bucket of 5", "The months sort numerically, which is a fix", "The day component is dropped, which is the intended grain"],
      answer: 1,
      why: "'%m' prints month-of-year only, so February 2024 and February 2025 become one bucket — 13 months collapse toward 12 and the trend becomes fiction. The spine is '%Y-%m': year plus zero-padded month, one bucket per calendar month that actually exists.",
      notes: [
        { choice: 2, why: "Sorting was never the problem — bucket identity was. Five '02' bills from two different years sitting in one row is a lie even when it sorts neatly." },
        { choice: 3, why: "The day was already absent from '%Y-%m'. The format change didn't drop granularity — it dropped the YEAR, which is a different and much worse loss." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-18",
      prompt: "In the coverage classifier, which arm can actually CATCH bill #28 — claimed 'paid', zero settlement rows?",
      choices: ["The partial arm — SUM is 0, which is less than the amount", "The no-payment arm (p.id IS NULL) — SUM of no rows is NULL, so every amount comparison is UNKNOWN and only the IS NULL check fires", "The ELSE arm — 'exact' by default", "None — #28 needs a query outside the classifier"],
      answer: 1,
      why: "A bill with no settlement rows folds SUM(p.amount_cents) to NULL; NULL < amount is UNKNOWN, so partial never fires and ELSE mislabels the bill 'exact'. The only arm that sees the truth is the no-payment arm keyed on p.id IS NULL — which is why arm order puts it first.",
      notes: [
        { choice: 0, why: "SUM over zero rows is NULL, not 0 — the empty-group contract. COUNT returns 0 on empty sets; SUM returns NULL. The classifier that assumes 0 mislabels every unpaid bill as partial-or-exact." },
        { choice: 3, why: "The IS NULL arm catches it in-query — that is the point of ordering the arms. Shipping #28 to an outer query is how it gets lost between reports." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-19",
      prompt: "Cluster counts sort 24, 17, 14, 13, 5, then four orgs tied at 4, then 3. Under RANK versus DENSE_RANK, what does the first 3-cluster org print?",
      choices: ["RANK 10, DENSE_RANK 7", "RANK 7, DENSE_RANK 10", "Both print 10", "Both print 7"],
      answer: 0,
      why: "The tie block starts at rank 6 (after 24, 17, 14, 13, 5). Four orgs share rank 6; RANK then skips to 10 (6 + 4 tied peers), DENSE_RANK advances to 7 (the seventh distinct value). Same block, different contract — position-among-all versus tier-membership.",
      notes: [
        { choice: 1, why: "Inverted: DENSE_RANK never skips (it's the denser of the two). RANK is the one that pays the tie tax — four peers cost it three rungs." },
        { choice: 2, why: "Only RANK skips. If both printed 10, the tie block would have to be six wide — count the peers before trusting either number." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-20",
      prompt: "Which OVER clause produces a cumulative billed total down the ordered month spine?",
      choices: ["OVER (ORDER BY bill_month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)", "OVER (PARTITION BY bill_month)", "OVER (ORDER BY bill_month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)", "OVER () — no ORDER BY"],
      answer: 0,
      why: "Cumulative = every row from the first through the current one: UNBOUNDED PRECEDING AND CURRENT ROW. The other frames either reset per month (PARTITION), roll a 3-row window (1 PRECEDING / 1 FOLLOWING), or sum the whole table onto every row (empty OVER).",
      notes: [
        { choice: 1, why: "Partitioning BY the month resets the sum inside each month — every month totals itself and the 'curve' is a flat staircase of month totals, not a running sum." },
        { choice: 2, why: "That's a rolling 3-month window — the billing analog of a moving average. Legitimate, but a different chart; labeling it 'cumulative' misreads every inflection." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-21",
      prompt: "On the org leaderboard, four orgs tie at 4 clusters. What does ROW_NUMBER guarantee about them?",
      choices: ["They share one number, like RANK", "Distinct consecutive integers — but WHICH org gets which number is arbitrary without an explicit tiebreaker", "The numbers skip after the tie, like RANK", "They all print NULL until the tie is broken"],
      answer: 1,
      why: "ROW_NUMBER forces distinct, consecutive integers — 6, 7, 8, 9 across the tie block — and SQLite assigns them in whatever order the plan produces when no tiebreaker exists. Same query, different day, different org ranked '6th': nondeterminism wearing a rank badge.",
      notes: [
        { choice: 0, why: "That's RANK's contract. ROW_NUMBER exists precisely to break ties — the question is whether YOU break them (ORDER BY org_id) or the engine does (silently)." },
        { choice: 2, why: "Skipping is RANK's behavior. ROW_NUMBER never skips — its hazard is the opposite: fabricated precision between rows that are genuinely equal." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-22",
      prompt: "The fleet runs 103 clusters across 16 orgs — 6.4 clusters per org. 'Deepening' growth means which movement?",
      choices: ["More orgs deploying their first cluster", "Existing orgs running MORE clusters each — the ratio climbs while the org count holds", "More regions appearing on the map", "The healthy share climbing quarter over quarter"],
      answer: 1,
      why: "Deepening = 6.4 climbs because existing orgs add clusters; broadening = more orgs (the 16 grows). Same 103 clusters can be either story, and the land-and-expand narrative Atlas tells investors depends entirely on which ratio moved.",
      notes: [
        { choice: 0, why: "That's broadening — installed-base growth. It LOWERS clusters-per-org if clusters hold steady. Confusing the two flips the expansion slide's headline." },
        { choice: 2, why: "Region count is a footprint read, not an intensity read. LATAM sits in one region with 2 clusters; 'more regions' says nothing about clusters per org." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-23",
      prompt: "EU carries 45 clusters from 8 orgs (intensity 5.6); the US, 19 clusters from 2 orgs. Which claim is honest?",
      choices: ["The US is the biggest footprint", "The US has the highest intensity — 9.5 clusters per org — but a two-org base is concentration risk, not market depth", "The US has the most orgs", "LATAM leads on both grains"],
      answer: 1,
      why: "19 ÷ 2 = 9.5, the highest load per org on the map — but it rests on TWO orgs, so one churn event moves the whole footprint. EU's 45 from 8 is a broader base at lower intensity. Both grains must ship together or the read is propaganda.",
      notes: [
        { choice: 0, why: "EU is the biggest footprint (45 clusters). The US is third by load — its claim to fame is intensity, and intensity on two orgs is a fragile crown." },
        { choice: 2, why: "EU has the most orgs (8); the US has 2. Counting orgs and clusters as the same statistic is the two-grain error this kit opens with." },
      ],
      difficulty: "easy",
    },
    {
      id: "mdb-mcq-24",
      prompt: "20 settled bills average 28.4 days to settle against uniform 30-day terms. What does '28.4 < 30' prove — and what does it hide?",
      choices: ["The SLA is met universally — every bill settled inside terms", "On average the desk beats terms, but the range runs 13 to 84 days — the 84-day bill breached terms by 54, and the average buries it", "Settlements are effectively instant", "The 30-day terms are violated by definition"],
      answer: 1,
      why: "An average under terms is a summary, not a guarantee: fastest 13, slowest 84 — the slow tail breaches terms badly while the average stays comfortable. Distribution reads (min/max, the tail) are the desk's real SLA evidence; the average is the press release.",
      notes: [
        { choice: 0, why: "The 84-day settlement alone falsifies 'universally'. Averages answer 'typically'; SLAs are decided at the tail — that's why min and max ship beside every mean." },
        { choice: 3, why: "Terms are 30 days of allowance; 28.4 beats them on average. Nothing in the average violates anything — the violations live in individual rows the average cannot show." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-25",
      prompt: "Bill #25: 6,148 owed, ONE settlement row of 4,000 landed, status still 'open'. The coverage classifier (no-payment / partial / exact) prints what?",
      choices: ["'exact' — a payment exists", "'partial' — at least one settlement row AND paid 4,000 < owed 6,148", "'no payment' — it isn't fully settled", "'void' — open bills can't be classified"],
      answer: 1,
      why: "Coverage is a three-way classification, not a paid/not-paid flag: #25 has settlement rows (so the no-payment arm's p.id IS NULL misses it) and SUM(paid) 4,000 < 6,148, which lands it in 'partial' — the arm that exists precisely for split settlements like this one.",
      notes: [
        { choice: 0, why: "A payment row proves activity, not completion: 4,000 of 6,148 is short by 2,148. 'Exact' requires the sums to match — the classifier's whole reason to exist." },
        { choice: 2, why: "The no-payment arm is keyed on p.id IS NULL — #25 HAS a payment row, so it fails that arm and falls through to the partial comparison. Mislabeling it 'no payment' erases 4,000 of collected cash from the dunning story." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-26",
      prompt: "GROUP_CONCAT builds each org's cluster-state string from a LEFT JOIN that can carry NULL payloads. What does SQLite do with the NULLs?",
      choices: ["Prints them as the text 'NULL' in the list", "Skips them silently — the list can be shorter than the org's cluster count", "Errors — CONCAT cannot fold NULLs", "Converts them to empty strings, preserving the comma count"],
      answer: 1,
      why: "GROUP_CONCAT skips NULL values by default — an org with 5 clusters and one NULL status prints 4 entries with no warning. That silence interacts with the anti-join mindset: if the NULL payload rows are the point (unmapped clusters), the fold just deleted them.",
      notes: [
        { choice: 0, why: "That's the human-readable wish, not the engine behavior — and IFNULL(status, 'unknown') is how you'd actually get it. Relying on the engine to render NULLs prints nothing where a marker belongs." },
        { choice: 2, why: "SQLite's GROUP_CONCAT tolerates NULLs by skipping. The error-free behavior is exactly what makes the row loss invisible — no stack trace, just a shorter list." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-27",
      prompt: "You stack a running-clusters cut on a terminated-clusters cut. The lifecycle states are provably disjoint. What does plain UNION cost over UNION ALL?",
      choices: ["Nothing — identical results and identical cost when disjoint", "A full dedupe pass over the stack — wasted work here, and a silent lie detector you never calibrated if the bands ever overlap", "It errors on disjoint sets", "It doubles the row count"],
      answer: 1,
      why: "UNION dedupes the stacked result — on disjoint sets the answer is identical but the work is real (sort/hash over every row), and worse: if someone later redefines a status so the bands overlap, UNION silently deletes the overlap rows and the close still 'balances'. Default UNION ALL; earn the dedupe.",
      notes: [
        { choice: 0, why: "Results match today; cost never does — dedupe is a sort/hash pass. And 'today' is exactly the assumption whose silent failure UNION was supposed to catch." },
        { choice: 3, why: "Set ops never multiply rows — UNION ALL concatenates, UNION concatenates-then-dedupes. Doubling is a fan-out bug, a different disease entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-28",
      prompt: "You rewrite 'bills issued this quarter that never settled' as bills EXCEPT settled-bill-keys. What is the first thing that can silently change the meaning?",
      choices: ["EXCEPT errors when row counts differ between arms", "Column drift — EXCEPT compares whole rows positionally, so an inserted or reordered column in one arm changes the diff without any error", "EXCEPT keeps duplicates on the left", "EXCEPT ignores NULLs on both sides"],
      answer: 1,
      why: "EXCEPT diffs entire row tuples by position: same column count, same order, comparable types. Narrow both arms to the bill key and the diff is honest; leave them wide and one ALTER TABLE turns the reconciliation into a different question — no error, just new 'answers'.",
      notes: [
        { choice: 2, why: "SQLite's EXCEPT removes duplicates from the result (it's EXCEPT DISTINCT by default) — the duplicate behavior is the opposite of 'keeps'. But duplicates aren't the silent hazard; positional column comparison is." },
        { choice: 3, why: "EXCEPT treats NULLs as equal when diffing — it doesn't ignore them. The anti-join's NULL logic (p.id IS NULL) is a different mechanism with the same destination." },
      ],
      difficulty: "hard",
    },
    {
      id: "mdb-mcq-29",
      prompt: "Each region's report line carries (SELECT MAX(total) FROM orders) as a benchmark column. How many times does an UNCORRELATED scalar subquery like this logically run?",
      choices: ["Once — its result is constant across the whole query (engines cache it)", "Once per row of the orders table", "Never — uncorrelated scalars return NULL", "Once per output row, recomputed from scratch every time"],
      answer: 0,
      why: "No correlation means the subquery's value cannot change between rows: it evaluates once (or is cached) and every region reads the same constant — here the 1,088.44 fleet maximum. The cost story changes the moment you reference an outer column; then it re-runs per row.",
      notes: [
        { choice: 3, why: "That's the CORRELATED contract — and the reason correlated shapes are graded on cost. Uncorrelated scalars are constants; treat them like one and hoist them into a CTE when the plan doesn't cache." },
        { choice: 1, why: "Per-table-row evaluation would make every scalar a full-table re-scan — the thing query planners exist to avoid. The per-row cost story belongs to correlated subqueries only." },
      ],
      difficulty: "medium",
    },
    {
      id: "mdb-mcq-30",
      prompt: "LAG(billed) OVER (ORDER BY bill_month) runs down the 13-month spine. What does the FIRST row's MoM delta print?",
      choices: ["0 — the walk starts flat", "NULL — there is no prior month, and NULL is the honest baseline", "An error — LAG needs a PARTITION BY first", "The spine's average billed value"],
      answer: 1,
      why: "The first month (2024-02) has no predecessor, so LAG yields NULL and the delta is NULL by definition — print NULL or label it 'baseline'. COALESCEing it to 0 publishes 'flat month' for a month whose walk simply hadn't started.",
      notes: [
        { choice: 0, why: "Zero is a measurement claim ('no change from the prior month') — but no prior month exists. The NULL is information; erasing it fabricates a comparison." },
        { choice: 2, why: "PARTITION BY is optional for LAG — without it the window is the whole ordered set, which is exactly what a spine walk wants. The first-row NULL is contractual, not an error." },
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
    {
      id: "cs-mdb-3",
      tier: "medium",
      topic: "j5",
      universe: "fraud",
      title: "The unpaid-bill anti-join with the mirror anomaly",
      brief:
        "MongoDB-flavored brief on the storefront db: the anomaly queue opens with the anti-join — bills whose join finds NO settlement row. Probed facts: 28 bills against 27 settlement rows; 6 never-settled bills worth 15,217 — ids 18, 21, 24, 26, 27 and #28, and #28 (1,756.00) claims 'paid' with zero settlement rows, the mirror twin of void bill #11 (925.00) which HAS a settlement. The desk reads them with the claimed-paid anomaly leading the list, gated at the #28 line so the mirror itself survives the cut.",
      ask: "Return bill id, claimed status and dollar amount for every never-settled bill of 1,756.00 or more — the claimed-paid anomaly leading.",
      template:
        "SELECT i.id AS bill_id,\n       i.status AS claimed_status,\n       i.amount_cents / 100.0 AS bill_dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {1}\nWHERE p.id IS {2} AND i.amount_cents / 100.0 >= {3}\nORDER BY claimed_status {4};",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the bill join key",
          why: "Settlements point at bills — p.invoice_id = i.id is the only honest key. Joining on i.customer_id pairs payment rows against org ids: on this db nothing survives the NULL check that way, and the queue silently empties.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join survival rule",
          why: "p.id IS NULL keeps exactly the bills whose join found no settlement — the unpaid list. IS NOT NULL flips the read to the settled rows and the queue fills with bills that already paid.",
        },
        {
          answer: "1756",
          kind: "number",
          label: "the mirror-line gate",
          why: "The gate converts to dollars first (cents / 100.0) and sits at the #28 line: 1,756.00 keeps bills 24, 26, 27 and 28 — so the paid-claimed anomaly sits IN the result, not below it. 1757 would amputate the very anomaly the desk is hunting; comparing raw cents would pass every unpaid bill at once.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the anomaly-first direction",
          why: "Sorting claimed_status DESC leads with 'paid' — #28, the bill that lies about itself, tops the queue and gets worked first. ASC buries the anomaly under the three open bills, and the desk triages backwards.",
        },
      ],
      distractors: ["i.customer_id", "IS NOT NULL", "1757", "ASC"],
      walkthrough:
        "One LEFT JOIN, one survival rule, one gate with a mirror riding it. The join runs bills to settlements on the foreign key; p.id IS NULL keeps the six never-settled bills — 873, 1,295, 1,756, 2,794, 3,562 and 4,937 dollars, the probed 15,217 of AR — the gate at 1,756 dollars — the cents converted with the / 100.0 rule before comparing — keeps the four largest, and the status sort leads with the lie: #28 reads 'paid' against zero settlement rows — the status is a claim, the rows are the ledger — before the three open bills follow at 4,937.00, 3,562.00 and 2,794.00. The distractors each break differently: i.customer_id in the join key matches payment rows against org ids and the queue empties to nothing; IS NOT NULL inverts the anti-join into the settled list (27 rows) — the mirror read, useful, but not what was asked; 1757 in the gate amputates #28, the mirror anomaly, from its own queue; ASC buries the one bill that lies about its own status under the three open rows. The lesson under the lesson: the anti-join's survival rule IS the finding — change the key, the polarity or the gate and you change which silence the desk is allowed to see.",
    },
    {
      id: "cs-mdb-4",
      tier: "hard",
      topic: "t4",
      universe: "month-close",
      title: "The collections calendar over the bill spine",
      brief:
        "MongoDB-flavored brief on the storefront db: month-close rebuilds the collections calendar — one row per issue month: bills issued, dollars billed, settlements landed — clean at the BILL grain even though settlements are one-to-many (five bills carry two payment rows each). Probed facts: 28 bills issued 2024-02 through 2025-02; the three-bill months are 2024-10 (6,187 billed, 2 settled), 2024-12 (8,830 billed, 2 settled) and 2025-02 (8,112 billed, 0 settled — the newest aging bucket, recency not fraud). The spine is '%Y-%m': bare '%m' merges the two Februaries into one lying bucket.",
      ask: "Return each issue month with bill count, dollars billed and settled-bill count, gated to the months carrying at least three bills, in calendar order.",
      template:
        "SELECT STRFTIME({1}, i.issued_on) AS bill_month,\n       COUNT(*) AS bills,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed,\n       COUNT(p.invoice_id) AS settled_bills\nFROM invoices i\nLEFT JOIN (SELECT invoice_id, MIN(paid_on) AS first_paid FROM payments GROUP BY invoice_id) p\n  ON p.invoice_id = i.id\nGROUP BY bill_month\nHAVING COUNT(*) >= {2}\nORDER BY bill_month {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the calendar spine format",
          why: "Year plus zero-padded month makes one bucket per calendar month — 13 of them here. Bare '%m' folds February 2024's two bills into February 2025's three: a five-bill month that never existed.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the three-bill gate",
          why: "Exactly three months carry three bills — 2024-10, 2024-12, 2025-02 — and they are the review's agenda. A gate of 2 floods the calendar with the six two-bill months; 4 empties it entirely.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar order",
          why: "An aging read walks forward in time: 2024-10 first, 2025-02 — the bucket with zero settlements — last, where the eye lands. DESC would open the review on the newest, thinnest month instead of the trend.",
        },
      ],
      distractors: ["'%m'", "2", "4", "DESC"],
      walkthrough:
        "A spine, a pre-aggregation, a gate — and a fan-out that never gets to lie. The derived table folds settlements to ONE row per bill (MIN(paid_on) per invoice_id) before the join, so bills count 2 / 2 / 1 / ... / 3 cleanly and SUM bills each amount exactly once — December reads 3 bills and 8,830, not a split-inflated fiction. The '%Y-%m' spine makes 13 honest months; COUNT(p.invoice_id) counts settled bills (2024-10: two of three; 2024-12: two of three; 2025-02: zero of three, the newest aging bucket). The gate at 3 keeps exactly the three-bill months — the inclusive edge is provable because every month's count is an integer step apart. The distractors each break differently: '%m' merges the two Februaries into one phantom five-bill bucket; a gate of 2 drowns the review in two-bill months, a gate of 4 returns nothing at all; DESC flips the walk to newest-first and the zero-settlement tail opens the meeting. The lesson under the lesson: pre-aggregate the many-side before you fold, and never let the format string decide what a month is.",
    },
    {
      id: "cs-mdb-5",
      tier: "easy",
      topic: "s6",
      universe: "catalog",
      title: "The instance-size band census with the empty arm",
      brief:
        "MongoDB-flavored brief on the storefront db: the catalog review walks the 16 instance sizes with SQL attached to every bar, banded by price. Probed facts: the mid band (50 up to 200) holds 8 sizes averaging 111.50; the budget band (under 50) holds 8 averaging 32.06; the premium arm at 200-plus matches NOTHING — the catalog tops out at 199.99 — and the empty band is itself the finding. The floor at 8 keeps both live bands and proves the census is balanced eight-and-eight.",
      ask: "Return each price band with its instance-size count and average price — highest average first — keeping only bands with at least eight sizes.",
      template:
        "SELECT CASE WHEN price >= {1} THEN 'premium'\n            WHEN price >= {2} THEN 'mid'\n            ELSE 'budget' END AS band,\n       COUNT(*) AS sizes,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY band\nHAVING COUNT(*) >= {3}\nORDER BY avg_price {4};",
      slots: [
        {
          answer: "200",
          kind: "number",
          label: "the premium edge",
          noVerify: true,
          why: "The premium arm sits at 200 — and NOTHING reaches it (the catalog maxes at 199.99), so the band vanishes from the census: an empty arm is a finding, not a bug. Dropping the edge to 150 would manufacture a one-size premium band out of the 199.99 flagship.",
        },
        {
          answer: "50",
          kind: "number",
          label: "the mid edge",
          noVerify: true,
          why: "The mid band starts at 50 — 8 sizes averaging 111.50. Push the edge to 100 and mid collapses to the four sizes at 100-plus while budget swallows twelve — same catalog, different census.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the balanced-band floor",
          why: "Both live bands carry exactly 8 sizes, so the floor at 8 keeps everything and doubles as proof the census is balanced eight-and-eight. Nine amputates the whole catalog — the gate's edge sits exactly on the data.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-band-first direction",
          why: "The review argues pricing top-down: mid at 111.50 opens, budget at 32.06 closes. ASC would lead with the cheapest band and invert the pricing conversation.",
        },
      ],
      distractors: ["150", "100", "9", "ASC"],
      walkthrough:
        "CASE arms in order, a gate that sits exactly on the data, and an empty band that is the headline. The arms fire top-down: nothing clears the 200 premium edge (max 199.99), eight sizes land in mid (50–199.99, averaging 111.50) and eight in budget (under 50, averaging 32.06) — the probed two-band census, balanced eight-and-eight, which the floor at 8 keeps intact. The distractors each break differently: 150 in the premium edge manufactures a one-size premium band (the 199.99 flagship), 100 in the mid edge re-cuts mid to four sizes and stuffs budget with twelve; 9 in the floor deletes BOTH bands — the whole census amputated by a gate set one past the data; ASC inverts the read to budget-first. The lesson under the lesson: CASE arm order and edge placement ARE the census — and an empty premium band, honestly reported, is a pricing-strategy fact no amount of re-banding should be allowed to hide.",
    },
    {
      id: "cs-mdb-6",
      tier: "hard",
      topic: "q2",
      universe: "growth",
      title: "Orgs burning above the platform average",
      brief:
        "MongoDB-flavored brief on the storefront db: the growth board screens for orgs whose average cluster spend beats the platform average. Probed facts: platform average cluster spend is 338.19 over 103 clusters; seven orgs clear it — org 12 at 705.39 (EU, 1 cluster), org 3 at 533.59 (EU, 5), org 6 at 486.32 (APAC, 3), org 15 at 444.80 (EU, 1), org 2 at 426.22 (LATAM, 2), org 16 at 421.54 (EU, 4) and org 5 at 390.62 (US, 17). The comparison is a scalar subquery — AVG(total) over ALL orders — and its empty-case contract (NULL, then nothing passes) is part of the answer.",
      ask: "Return region, org id, cluster count and average cluster spend for every org whose average spend beats the platform average — highest burn first.",
      template:
        "SELECT c.region AS org_region,\n       o.customer_id AS org_id,\n       COUNT(*) AS clusters,\n       ROUND(AVG(o.total), 2) AS avg_cluster_spend\nFROM orders o\nJOIN customers c ON c.id = {1}\nGROUP BY c.region, o.customer_id\nHAVING AVG(o.total) > (SELECT {2}(total) FROM orders)\nORDER BY avg_cluster_spend {3};",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the org join key",
          why: "Clusters carry the org foreign key — c.id = o.customer_id groups the fleet under real orgs. c.id = o.id pairs org ids against cluster ids: on this db eight phantom groups survive with completely different spend figures.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the platform-average fold",
          why: "AVG(total) over ALL 103 orders is the 338.19 benchmark. MAX (1,088.44) or SUM (34,833.28) towers over every org's average, and the screen silently returns zero rows — the empty-inner-query bug with the whole board missing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-burn-first direction",
          why: "The board leads with org 12 at 705.39 — the one-cluster org burning the most per cluster. ASC opens on org 5 at 390.62, the seventeen-cluster workhorse, and buries the spend-per-cluster story.",
        },
      ],
      distractors: ["o.id", "c.id", "MAX", "ASC"],
      walkthrough:
        "A scalar subquery sets the bar, and the join key decides whose burn is being judged. Clusters join to orgs on the foreign key and fold per (region, org): org 12 leads at 705.39 on a single cluster, org 5 clears the bar at 390.62 across seventeen — seven orgs beat the probed 338.19 platform average, computed once by the uncorrelated scalar AVG(total). The distractors each break differently: o.id in the join key pairs org ids to cluster ids and manufactures eight phantom orgs (752.96 at the top — a board reading fiction); c.id = c.id matches every org to every order, fanning the fold to a cross-join blob; MAX in the subquery sets the bar at the fleet maximum 1,088.44 and the screen returns nothing — the silent-empty bug this kit drills; ASC buries the one-cluster outlier that opens the expansion conversation. The lesson under the lesson: state the inner fold's population and its empty case unprompted — a benchmark nobody can see is a benchmark nobody trusts.",
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
    { slug: "sales-person", why: "Anti-join over a rep table — the never-terminated-footprint hunt in textbook clothing: LEFT JOIN + IS NULL, where proving a confident zero (this db's never-ordered orgs) is the job." },
    { slug: "article-views-ii", why: "HAVING above the platform average — the footprint floor screen: which regions clear the average cluster load, denominator stated before the gate fires." },
    { slug: "classes-more-than-5-students", why: "The strict > floor gate — the twenty-cluster bar's stricter cousin: US 19 misses it, EU 45 clears it, and the edge policy is the entire exercise." },
    { slug: "immediate-food-delivery-i", why: "CASE WHEN ratio over a lifecycle — the ready-since share: stamped clusters ÷ ALL raised, 82 of 103, with the unstamped backlog named." },
    { slug: "immediate-food-delivery-ii", why: "The same delivery share cut with windows and CTEs — the calendar-sliced time-to-ready: provisioning speed per month bucket, not just fleet-wide." },
    { slug: "game-play-analysis-v", why: "Consecutive-activity windows with a CTE — fleet telemetry streaks: which clusters have heartbeated N days running, the ops watchlist shape." },
    { slug: "department-top-three-salaries", why: "DENSE_RANK partitioned podiums — the top instance-size families per footprint, where tie handling decides which lineages share the podium." },
    { slug: "reformat-department-table", why: "Pivot via CASE — the dashboard strip in one fold: running / scaling / provisioning / terminated as columns, each state a conditional count." },
    { slug: "primary-department-for-each-employee", why: "First-non-null CASE picks — each org's primary footprint read: which region carries the org's heaviest clusters when the fleet spans several." },
    { slug: "top-travellers", why: "Join, SUM, ORDER BY — the org burn leaderboard in its plainest form: 7,262.35 at the top, ties resolved by an explicit secondary key." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share-of-population census — the healthy-share idiom: COUNT DISTINCT over the fold, 100.0 before the division, the denominator in the metric's name." },
    { slug: "average-time-of-process-per-machine", why: "Self-joined paired latency — the ship-latency shape: 2.98 days creation-to-heartbeat, computed per cluster pair, averaged per footprint." },
    { slug: "duplicate-emails", why: "Duplicate detection via GROUP BY/HAVING — bill-number and contact hygiene: the dunning cycle's first data-quality gate before anything ships." },
    { slug: "fix-names-in-a-table", why: "CONCAT/UPPER contact hygiene — the support desk's outbound prep: org names normalized before any dunning or callback cycle touches them." },
    { slug: "product-price-at-a-given-date", why: "As-of-date pricing with windows — the bill priced as of issued_on: which rate schedule applied when, the time-travel join billing teams live in." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT by day — the daily digest cell: each org's cluster states folded into one ordered string, NULL policy decided explicitly." },
  ],
};
