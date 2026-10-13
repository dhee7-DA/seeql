// Deliveroo — kit 5 of the Food & Quick-commerce domain (Batch E).
// UK/EU food delivery with a rider-supply spine: shift-covered zones, a
// delivery promise measured in SLA compliance, and a Plus subscription layer
// billed like clockwork. Pool provenance: Deliveroo has 0 tagged rows in the
// band — all 16 problems and 30 topic slugs are THEME-CURATED from the sql
// rows in scripts/company-pools.md to Deliveroo's known screen themes (the
// Hopper driver trio for rider-supply censuses, the overlapping-shifts pair
// for roster math, subscription/AR reads for Plus billing). Case studies run
// on the storefront db with probed figures from scripts/company-facts.md,
// mapped honestly: orders = delivery orders, order_items = plate lines,
// shipped_at = rider drop-off timestamp, suppliers = restaurant partners,
// region = zone, invoices/payments = Plus subscription billing runs and
// settlement rows, expenses = rider-and-ops spend.

import type { CompanyKit } from "../types";

export const deliverooKit: CompanyKit = {
  id: "deliveroo",
  domainId: "food",
  name: "Deliveroo",
  tagline: "UK/EU delivery, rider shifts and SLAs",
  accent: "text-sky-500",

  brief: [
    "Deliveroo is the UK/EU-headquartered food delivery network built on a three-sided promise: restaurants cook, riders ride, customers eat inside a delivery window. The company's signature artifacts are the **rider shift model** (supply booked in advance, zones covered by rostered riders rather than pure gig flocking), the **delivery SLA** (the promise the app quotes is a compliance number someone owns), and **Deliveroo Plus**, the subscription layer that turns delivery fees into recurring billing. The analytics reality every analyst internalizes: an order is a promise with timestamps at both ends — placed and dropped — and on this kit's proxy ledger **82 of 103** orders carry a drop timestamp while 14 sit pending and 7 cancelled. Latency across the 82 completes averages **2.98 days** inside a 2-to-4 range, and the zone split is where the SLA conversation starts: LATAM 3.50, US 3.07, EU 2.94, APAC 2.93.",
    "The data org runs zone-shaped ops plus a product layer. Zone leads open on delivery health: orders placed versus dropped versus cancelled (this ledger: 52 delivered, 30 shipped, 14 pending, 7 cancelled — a **6.8% cancellation share**), drop latency against promise, and rider supply versus order flow. The subscription side runs on billing hygiene: 28 invoices on this ledger split into 21 paid ($66,443.00), 6 open ($19,609.00) and 1 void ($925.00), with settlement running about **28.4 days** from issue on paid invoices — and the `reconciliation anomalies` table (a void-but-paid invoice at $925.00, a paid invoice with zero payment rows) is exactly the kind of truth SQL has to catch. Partner health rounds it out: the 4.5-plus rating bench holds 2 of 6 restaurant partners, and the demand trend buckets into **14 months** from 2024-01 to 2025-02.",
    "Interview style is compliance-flavored and denominator-first. A screen typically opens with a warm-up join (attach zones to their orders, partners to their plate lines), escalates into conditional aggregation with a status or SLA rule ({emerald:within-promise} shares, cancellation rates with exclusions), then either an interval question (**overlapping shifts, concurrent deliveries** — the roster math riders actually live) or a rate question where the trap is integer division, a filter that shrinks the denominator, or a census written as three queries instead of one. Follow-ups are spoken out loud: 'does a cancelled order count in your denominator?', 'is that promise inclusive of the boundary?', 'what happens to a rider who covered zero orders?'. Candidates who narrate **population and boundary** before writing SQL consistently outperform.",
    "Preparation strategy: Deliveroo has no tagged rows in the band, so this kit is theme-curated — every problem mirrors a workflow Deliveroo screens are known to probe: the `immediate-food-delivery` pair for kept-share denominators, the Hopper trio for rider-supply censuses (monthly spines, per-driver rates, city bucketing), the overlapping-shifts pair for roster intervals, and the subscription/AR reads for Plus billing. The two case studies run on the live storefront db, mapped honestly onto delivery: orders are delivery orders, `shipped_at` is the rider drop-off timestamp, suppliers are restaurant partners, invoices and payments are Plus billing runs and settlements. One case rebuilds the SLA census the zone review opens with; the other rebuilds the Plus settlement census the month-close demands. Both are mechanically audited against the probed db figures.",
  ],

  dayInLife: [
    "**08:25 —** The day starts on the zone board — overnight orders placed versus dropped versus cancelled, drop latency against the promise, and the roster sheet: which zones were covered by how many rider shifts. The first query is almost always a reconciliation: did the order stream land completely, do drop-timestamp counts tie to the delivered-plus-shipped rollup (**82** on this ledger), do billing runs tie to settlements. The analyst who can write the two-sided diff — which zone lost rows, which invoice gained a payment without a matching status, since when — is the one the zone lead pings first. While the riders log on, the SLA strip goes out: one census, completed orders bucketed {emerald:within-promise} versus {rose:late} per zone, because *the intervention targets the bucket, not the average*.",
    "**12:20 —** The lunch crest stresses the promise and a latency drift goes red. The drill-down splits by zone — **LATAM 3.50 against APAC 2.93** on this ledger — by month, by partner: was it a supply gap, a kitchen backlog, or a data hole? The rule holds mid-incident: 'SLA share = within-promise ÷ completed', and pending orders have no latency YET — *the population statement is part of the answer, not a footnote*. Mitigation ships before the dinner prep window; the RCA lands in the writeup.",
    "**14:50 —** Deep work, two tracks. A shift question needs interval math: which rider shifts overlapped, which zones ran concurrent coverage, what span-versus-sum actually costs. A Plus question needs the billing census in one pass — **paid, open, void with values**, no three-query dance — plus the anomaly chase: the **$925.00** void invoice carrying a payment row, the paid invoice with none. Every track ends the same way: the definition written next to the number, because a compliance number without its population is a rumor that survives until the regulator does.",
    "**17:30 —** Stakeholder cycles into the dinner rush. The monthly close wants the Plus settlement census and the demand trend side by side — **14 month buckets peaking at $3,731.97 in 2024-01**, troughing at $1,193.86 in 2024-07 — each with its definition stamped beside it. Partner teams want the 4.5-plus bench (**2 of 6 partners, rated 4.6 and 4.8**) folded with revenue contribution, not vibes. The last hour is the EOD writeup — what drifted, which definitions held, what tomorrow's reconciliation must tie — because *Deliveroo SQL exists to keep the promise, the roster and the billing honest in the same query, at the hour the dinner rush lands*.",
  ],

  metrics: [
    { name: "SLA compliance", what: "Completed deliveries inside the promise window ÷ completed deliveries. This ledger's drop latency averages 2.98 days over a 2-to-4 range; the zone census against a 3-day promise splits the 82 completes 57 within / 25 late — rebuilt and verified in this kit's first case." },
    { name: "Order-fate mix", what: "Delivered 52 / shipped 30 / pending 14 / cancelled 7 across 103 placed orders. The status census everything else hangs on — and the reason every rate here has to name its denominator." },
    { name: "Zone cancellation share", what: "Cancelled ÷ placed per zone: APAC 3 of 37 = 8.1% worst, EU 6.7%, US 5.3%, LATAM 0%. The compliance-adjacent read that decides where rider supply gets steered." },
    { name: "Drop latency", what: "Placed-to-dropped delta averaged over completed orders only, per zone: LATAM 3.50, US 3.07, EU 2.94, APAC 2.93. The population statement (82 of 103 have latency) IS the metric." },
    { name: "Plus settlement health", what: "Billing runs vs settlements: 21 of 28 invoices paid ($66,443.00), 6 open ($19,609.00), 1 void ($925.00) — with the void-but-paid anomaly caught by reconciliation, not by averages." },
    { name: "Settlement days", what: "Days from Plus billing issue to first settlement on paid invoices: average 28.4, spread 13 to 84. The cash-conversion read the finance partner quotes every close." },
    { name: "Partner rating bench", what: "Restaurant partners at or above the 4.5 floor: 2 of 6 (4.6, 4.8). Supply quality reads — a WHERE filter when the rating lives on the partner row." },
    { name: "Zone demand census", what: "Orders, buyers and revenue per zone: EU 45 orders from 8 buyers ($15,089.23), APAC 37/5, US 19/2, LATAM 2/1. The two-grain census — orders versus buyers — that opens every zone review." },
  ],

  topics: [
    {
      name: "Order-fate & kept shares",
      why: "Every Deliveroo read starts from order fate: delivered, shipped, pending, cancelled — folded with a CASE flag so kept-shares and cancellation shares share one denominator. The immediate-food-delivery pair is this exact muscle in textbook clothing.",
      slugs: ["immediate-food-delivery-ii", "immediate-food-delivery-i", "queries-quality-and-percentage"],
    },
    {
      name: "Rider shift interval math",
      why: "Rosters are intervals: overlapping shifts, concurrent coverage, span-versus-sum on logged hours. The overlapping-shifts pair is the interview shape — self-joins on start/end boundaries where off-by-one inclusivity decides who gets paid.",
      slugs: ["find-overlapping-shifts", "find-overlapping-shifts-ii", "employee-task-duration-and-concurrent-tasks"],
    },
    {
      name: "Rider-supply censuses",
      why: "Supply reads are monthly spines: riders signed up versus riders active, per-zone headcounts, last-active stamps for the fleet. The Hopper trio drills the signup-to-activity pipeline Deliveroo supply teams live in.",
      slugs: ["hopper-company-queries-i", "daily-leads-and-partners", "bikes-last-time-used"],
    },
    {
      name: "Cancellation & acceptance rates",
      why: "Two-sided rates with exclusions — cancellation share with banned accounts removed, acceptance rate where unmatched ids coalesce to zero. Trips-and-users is the canonical screen; confirmation-rate is its LEFT JOIN cousin.",
      slugs: ["trips-and-users", "confirmation-rate", "hopper-company-queries-ii"],
    },
    {
      name: "Latency & idle windows",
      why: "Latency pairs two timestamps of one order; idle windows measure the gap between an order landing and the next. Date-diff durations and LEAD-based gap reads decide where rider supply leans against demand.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "biggest-window-between-events"],
    },
    {
      name: "Partner growth & rolling demand",
      why: "The demand trend is a rolling read: 7-day average daily revenue for the restaurant-partner review, month buckets for the close, trailing actives for zones. The 2024-01 peak ($3,731.97) against the 2024-07 trough is the shape these smooth.",
      slugs: ["restaurant-growth", "monthly-transactions-i", "rolling-7d-actives"],
    },
    {
      name: "Plus subscription & billing reads",
      why: "Plus turns delivery fees into invoices: signup conversion from trial-ish activity, invoice generation per cycle, AR aging on the unpaid tail. These three drill the exact billing reads this kit's settlement case rebuilds.",
      slugs: ["analyze-subscription-conversion", "generate-the-invoice", "ar-aging-schedule"],
    },
    {
      name: "Winback & churn",
      why: "Subscriber churn shows up as billing gaps, not app deletes: week-over-week churn reads, dormant reactivation risk, winback windows. The discipline is defining churn from BILLING events, where the NULLs are the signal.",
      slugs: ["winback-recovery", "week-over-week-churn", "dormant-reactivation"],
    },
    {
      name: "NULL policy & fleet hygiene",
      why: "The drop timestamp is NULL until the order lands; rider records carry holes that COUNT(col) silently skips. NULL audits, COUNT-col-versus-star drift, and keep-latest dedupe are the hygiene layer every compliance dashboard stands on.",
      slugs: ["null-blank-audit", "books-with-null-ratings", "keep-latest-dedupe"],
    },
    {
      name: "Escalation shapes: set ops & CASE",
      why: "Screens close with composed asks: UNION-ALL stacks that stitch two populations into one table, CASE buckets that classify in one pass, status pivots. The escalation is composition — a census that would take three queries becomes one.",
      slugs: ["team-scores-in-football-tournament", "count-salary-categories", "weather-type-in-each-country"],
    },
  ],

  theory: [
    {
      id: "deliveroo-t1",
      q: "Orders attach to zones on one key and to restaurant partners through a two-hop chain. When do you insist on a LEFT JOIN in a delivery read, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is order-shaped — SLA share, cancellation rate, plate mix — the order table is the spine and INNER joins that attach zone and partner attributes are right, because every unmatched row would distort a rate built on order counts. If the question is supply-shaped — which rostered zones logged shifts that covered zero orders, which partners carried menus that never sold — the supply table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER would drop exactly the rows you're hunting for. The Deliveroo-specific discipline is doing both directions deliberately: demand reads join from orders outward, roster reads join from shifts inward, and 'which side is the spine' is a sentence you say out loud before the FROM clause. On this kit's proxy ledger every order resolves to a zone and every plate line to a partner, so INNER and LEFT coincide — which is precisely why the interviewer asks you to reason about the shape instead of leaning on the data to save you.",
      tag: "joins",
    },
    {
      id: "deliveroo-t2",
      q: "Rank zones by weekly order volume. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one do you hand the ops floor?",
      a: "They disagree exactly where volumes tie. RANK gives both tied zones the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing zone that doesn't exist. DENSE_RANK gives the tie the same rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like zone id, which makes it the dedupe tool, not the leaderboard tool. The ops floor gets DENSE_RANK: zone rankings are read as 'who's nth', and a skipped rung generates a meeting about a zone that was never there. On a 103-order ledger ties are constant — weekly volumes land within an order or two of each other — and the LIMIT-1-OFFSET-1 'second place' habit breaks on every tie. The honest second place is DENSE_RANK = 2, and if two zones share it, the staffing decision is 'both', not 'whichever the engine sorted first'.",
      tag: "windows",
    },
    {
      id: "deliveroo-t3",
      q: "On this ledger — 103 orders, 82 with a drop timestamp, 6 zones-worth of partners — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return, and where each belongs.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every placed order, the denominator grain of cancellation and kept shares. COUNT(shipped_at) is 82 — the completed subset, because COUNT skips NULLs; that column is the numerator grain for SLA reads, and the gap between 103 and 82 IS the pending-plus-cancelled picture (14 pending, 7 cancelled). COUNT(DISTINCT customer_id) is 16 — repeat orders folded back to people, the audience grain behind the zone census (EU: 45 orders from just 8 buyers). The compliance trap is reporting one grain under another's name: an SLA share computed over DISTINCT customers, or a 'completed' count quoted as COUNT(*) — 103 instead of 82 — overstates delivery performance by a quarter. The strong answer assigns a grain to each form out loud — rows, non-null rows, distinct entities — and refuses to let them blur. That assignment habit is the single most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "deliveroo-t4",
      q: "The drop timestamp is NULL until the rider completes the delivery. What is your NULL policy for an SLA metric, and what does AVG do about the NULLs whether you ask or not?",
      a: "AVG ignores NULLs silently — so AVG(drop_ts - placed_ts) over ALL orders is already 'average latency of completed deliveries', a population chosen by NULL semantics rather than by you. On this ledger that's the 82 completed rows averaging 2.98 days; the 21 rows without a timestamp (14 pending, 7 cancelled) have no latency YET — which is a different statement from 'they're late', and the distinction regulators ask about. The policy is to make that choice explicit: latency exists only for completed deliveries, so filtering the NULLs in WHERE is correct — and then the report's subtitle says so. Three behaviors to narrate: in filters, NULL fails both = and != comparisons; in joins, NULL keys never match; in aggregates, COUNT(col) skips them while COUNT(*) keeps the row. What you never do is COALESCE a fake zero into the latency column — a pending order with zero latency reads as a promise kept in the zone review, which is worse than a hole. Guard the population, not the decoration.",
      tag: "nulls",
    },
    {
      id: "deliveroo-t5",
      q: "'Zones whose SLA share fell below 80%' — WHERE or HAVING, and why can't the other clause see the share at all?",
      a: "HAVING, because the SLA share is a group fact: it exists only after GROUP BY zone folds the completed orders and the conditional SUM divides by COUNT(*). Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the share literally does not exist yet; the engine throws 'no such column', and that error is the pipeline order teaching itself. The split that predicts every placement: row predicates in WHERE (shipped_at IS NOT NULL — the population guard belongs here, before the fold), group predicates in HAVING (share thresholds, volume floors). The one subtlety worth saying out loud: pushing a within-promise condition into WHERE as a row filter would be a definition change, not an optimization — it would shrink the denominator to within-promise-only orders and every zone would read 100%. Filter rows before the fold, filter groups after, and never let a WHERE do a HAVING's definitional work.",
      tag: "pipeline",
    },
    {
      id: "deliveroo-t6",
      q: "You need orders whose total sits above the network average. Walk me through the scalar subquery contract — and what happens on a filtered population where the inner query returns empty.",
      a: "A scalar subquery is contractually one column, zero-or-one rows. One row: its value joins the comparison — WHERE total > (SELECT AVG(total) FROM orders) runs the fold once and keeps the 42 above-average orders on this ledger (network average 338.19). Zero rows: it yields NULL, not an error, and total > NULL is UNKNOWN — the report ships empty with no complaint, which is the dangerous outcome on filtered populations (one zone, one month, one partner tier) where the inner fold legitimately can come back empty. Two follow-ups separate seniors: the correlated cousin — WHERE o.total > (SELECT AVG(i.total) FROM orders i WHERE i.zone = o.zone) — re-runs per outer row and answers 'above MY zone's average', a different promise with a real cost profile; and the NULL-poisoning rule that NOT IN over a nullable inner list empties everything, while EXISTS or a LEFT JOIN anti-join survives. Saying which population the inner fold covers, and what happens when it's empty, is what this follow-up fishes for.",
      tag: "subqueries",
    },
    {
      id: "deliveroo-t7",
      q: "Delivery events carry TEXT timestamps, and shifts are logged as start/end pairs. How do you bucket orders by month, diff them into latencies, and detect overlapping shifts — and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month spine; '%m' alone merges January 2024 with January 2025 into one phantom bucket, and this ledger spans 2024-01 to 2025-02 so the trap is live. Durations: JULIANDAY(drop_ts) - JULIANDAY(placed_ts) returns fractional days — the 2.98-day average with a 2-to-4 range is exactly that, rounded once at the end, never per row. Intervals: two shifts overlap when a.start < b.end AND b.start < a.end — strict inequalities both ways, because touching boundaries (one shift ends at 18:00, the next starts at 18:00) are legal handoffs, not double-coverage. The deeper break: these strings carry no timezone contract, and the NULL drop timestamp means every latency fold needs its population stated first — completed orders only. State the convention and the population, then query; never the reverse.",
      tag: "dates",
    },
    {
      id: "deliveroo-t8",
      q: "Billing runs can carry anomalies — a void invoice holding a payment row, a paid invoice holding none. How do you census invoice state in one pass, and how do you prove the census caught the anomalies?",
      a: "One pass, conditional arms. The census shape is FILTER (WHERE …) over the invoice table: COUNT(*) for the population, then per-state COUNT and SUM arms — paid, open, void — each with its value folded in the same scan. On this ledger that returns 28 invoices, 21 paid at $66,443.00, 6 open at $19,609.00, 1 void at $925.00 — and the proof the census caught the anomalies is the reconciliation check: a void invoice HOLDING a payment row (the $925.00 case) can't be found by averaging, only by joining payments to invoices and comparing status against the existence of settlement rows. The COUNT-then-SUM discipline matters because COUNT(col) skips NULLs silently — a payment table with NULL amounts would shrink the value arms without shrinking the count arms, and the census would disagree with itself. One scan, every state, anomalies chased by join — that's the month-close shape, and the three-queries-and-a-spreadsheet habit it replaces is how anomalies survive to the board.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "deliveroo-mcq-1",
      prompt: "82 of 103 orders carry a drop timestamp. Which expression computes the completed-order share, 79.6%?",
      choices: [
        "100 * COUNT(shipped_at) / COUNT(*)",
        "COUNT(shipped_at) / COUNT(*) * 100.0",
        "100.0 * COUNT(shipped_at) / COUNT(*)",
        "AVG(shipped_at IS NOT NULL)",
      ],
      answer: 2,
      why: "COUNT(shipped_at) skips NULLs and counts the 82 completed rows; COUNT(*) holds all 103 placed orders; 100.0 meets the numerator before division. All three guards in one expression — 82/103 = 79.6%.",
      notes: [
        { choice: 0, why: "INTEGER 100 first means integer division: 82/103 truncates to 0 before any multiplication. Every sub-1% share prints 0 — the classic silent bug." },
        { choice: 3, why: "AVG over a boolean returns a 0-to-1 fraction (0.796), not a percentage — right numerator, wrong scale, and the dashboard reads it as 0.8%." },
      ],
      difficulty: "easy",
    },
    {
      id: "deliveroo-mcq-2",
      prompt: "The month-close needs paid/open/void invoice counts AND values in one scan. Which construction does it?",
      choices: [
        "Three separate queries with WHERE status = ... each",
        "One query with FILTER (WHERE status = ...) arms per state",
        "One query with GROUP BY status, pasted into the deck manually",
        "A UNION ALL of three single-row queries",
      ],
      answer: 1,
      why: "FILTER (WHERE …) computes every state's count and value in ONE scan over one population — 28 invoices, 21 paid, 6 open, 1 void, no population drift between arms. Three separate queries drift the moment a filter differs by one clause.",
      notes: [
        { choice: 0, why: "Three scans can disagree — a data fix landing between queries shows up as an impossible census. One-pass FILTER exists precisely for this." },
        { choice: 2, why: "GROUP BY works but pasting is manual drift territory — and value arms need SUM beside each count, which the pivot makes fiddly to keep aligned." },
      ],
      difficulty: "easy",
    },
    {
      id: "deliveroo-mcq-3",
      prompt: "The SLA census classifies orders by drop latency against a 3-day promise. Deltas land on whole days (2, 3, 4). Which predicate marks 'within promise'?",
      choices: [
        "JULIANDAY(shipped_at) - JULIANDAY(created_at) < 3",
        "JULIANDAY(shipped_at) - JULIANDAY(created_at) <= 3",
        "JULIANDAY(shipped_at) - JULIANDAY(created_at) <= 'three days'",
        "DATEDIFF(day, created_at, shipped_at) <= 3",
      ],
      answer: 1,
      why: "A 3-day promise includes the third day: <= 3 keeps the 3.0-day drops inside. The strict '<' pushes every 3.0-day order into 'late' — on this ledger that moves a third of completed orders out of compliance in one character.",
      notes: [
        { choice: 0, why: "Boundary inclusivity is the SLA question. With deltas of exactly 3.0, < 3 silently redefines the promise as 2 days — the compliance number drops without any delivery changing." },
        { choice: 3, why: "DATEDIFF is a MySQL reflex — this engine has JULIANDAY. The query errors, and the census ships as an error screenshot." },
      ],
      difficulty: "medium",
    },
    {
      id: "deliveroo-mcq-4",
      prompt: "Zone cancellations: EU 3 of 45, APAC 3 of 37, US 1 of 19, LATAM 0 of 2. Which query returns the single worst zone by cancellation share — and which zone is it?",
      choices: [
        "WHERE status = 'cancelled' GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — ties EU and APAC at 3",
        "GROUP BY region, compute 100.0*SUM(cancelled-flag)/COUNT(*), ORDER BY ... DESC, LIMIT 1 — APAC at 8.1%",
        "GROUP BY region HAVING COUNT(*) > 1 — EU, biggest volume",
        "GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — EU, most orders",
      ],
      answer: 1,
      why: "Share is a group fact: the CASE-SUM numerator over the COUNT(*) denominator of ALL placed orders, sorted descending, cut to one — APAC 3/37 = 8.1%, worst despite tying EU on raw counts (3 each). The denominator is the metric.",
      notes: [
        { choice: 0, why: "Filtering cancelled first shrinks the denominator to the numerator's population — every surviving zone reads 100%, and the tie at 3 breaks arbitrarily. Denominator drift, the compliance report killer." },
        { choice: 2, why: "Raw volume ignores exposure: APAC's 3 cancels came from 37 orders, EU's from 45. Without the share, the intervention targets volume, not risk." },
      ],
      difficulty: "medium",
    },
    {
      id: "deliveroo-mcq-5",
      prompt: "STRFTIME('%m', created_at) buckets the monthly demand trend. What breaks on a ledger spanning 2024-01 to 2025-02?",
      choices: [
        "Nothing — '%m' is the standard month bucket",
        "January 2024 and January 2025 collapse into one bucket, faking a demand spike",
        "The bucket values come out NULL for the 2025 rows",
        "STRFTIME only accepts date columns, not text timestamps",
      ],
      answer: 1,
      why: "'%m' emits the month-of-year alone: '2024-01' and '2025-01' both bucket as '01', so two Januaries sum into one phantom peak. '%Y-%m' keeps the year in the key — the difference between a trend and a hallucination.",
      notes: [
        { choice: 2, why: "STRFTIME returns a value for every row; the failure is silent bucket-merging, not NULLs. Silent is worse — the trend chart looks plausible." },
        { choice: 3, why: "STRFTIME happily takes ISO text timestamps. The trap is the format string, not the input type." },
      ],
      difficulty: "medium",
    },
    {
      id: "deliveroo-mcq-6",
      prompt: "Two rider shifts: A runs 17:00–20:00, B runs 20:00–22:00. Which predicate correctly reports NO overlap?",
      choices: [
        "a.start <= b.end AND b.start <= a.end — inclusive both ways",
        "a.start < b.end AND b.start < a.end — strict both ways",
        "a.start = b.start OR a.end = b.end",
        "a.end > b.start only",
      ],
      answer: 1,
      why: "Strict inequalities on both sides treat touching boundaries (A ends 20:00, B starts 20:00) as a legal handoff, not double coverage. Inclusive comparisons flag every clean handoff in the roster as an overlap — the false-positive that erodes trust in the audit.",
      notes: [
        { choice: 0, why: "The <= variant turns every back-to-back shift into a violation. Boundary semantics are a business decision — for shift handoffs, strict is the honest read." },
        { choice: 3, why: "One-sided checks miss half the geometry — B could start before A does. Overlap needs both directions compared." },
      ],
      difficulty: "medium",
    },
    {
      id: "deliveroo-mcq-7",
      prompt: "Billing runs double-fire on retries. You dedupe with ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY event_at DESC). Two events share a timestamp. What fixes the arbitrary pick?",
      choices: [
        "Add a deterministic tie-breaker: event_id DESC to the ORDER BY",
        "Switch to RANK() — ties share the row",
        "Add DISTINCT to the SELECT",
        "Remove the ORDER BY — ties resolve by insertion order",
      ],
      answer: 0,
      why: "ROW_NUMBER splits ties arbitrarily unless the ORDER BY is deterministic: event_id DESC makes 'latest' reproducible. RANK would return BOTH tied rows (= 1) — a dedupe that doubles the billing row again.",
      notes: [
        { choice: 1, why: "RANK keeps ties — the opposite of dedupe. You'd collapse retries into two invoice rows and bill twice in the census." },
        { choice: 3, why: "Without ORDER BY the window order is engine-arbitrary — 'latest' becomes whatever the planner saw last. Reproducibility IS the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "deliveroo-mcq-8",
      prompt: "The reconciliation flags invoice #11: status 'void', yet one payment row of 925 exists. Which query finds ALL invoices whose payment rows contradict their status?",
      choices: [
        "SELECT i.* FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'paid'",
        "SELECT i.id, i.status, SUM(p.amount_cents) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id HAVING (i.status = 'void' AND SUM(p.amount_cents) IS NOT NULL) OR (i.status = 'paid' AND SUM(p.amount_cents) IS NULL)",
        "SELECT COUNT(*) FROM payments WHERE amount_cents > 0",
        "SELECT i.* FROM invoices i WHERE i.status = 'void'",
      ],
      answer: 1,
      why: "The contradiction is a JOIN + GROUP BY + HAVING read: payment existence compared against status, both directions — void-with-settlement AND paid-without-settlement. That's how the void-but-paid $925.00 and the paid-with-no-payments anomaly surface together.",
      notes: [
        { choice: 0, why: "That returns every paid invoice WITH a payment — the healthy population, not the contradiction. The anomaly lives in the comparison, not the status filter." },
        { choice: 2, why: "Counting payments says nothing about invoice status — no join, no contradiction check. A census of payments is not a reconciliation." },
      ],
      difficulty: "hard",
    },
    {
      id: "deliveroo-mcq-9",
      prompt: "A per-zone SLA fold has zone ties (two zones at 10 late orders). In SUM(late) OVER (ORDER BY late DESC), what does the running total at the FIRST 10-late row include?",
      choices: [
        "Just that one row — running totals add row by row",
        "Both 10-late zones — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by the whole tied group at once. ROWS BETWEEN … CURRENT ROW counts one row. The frames disagree exactly where ties exist, which is every zone leaderboard on a 103-order ledger.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's behavior — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default is RANGE-with-peers." },
        { choice: 3, why: "Windows work fine without explicit frames — they silently pick RANGE, which is precisely the surprise. State the frame; don't inherit it." },
      ],
      difficulty: "hard",
    },
    {
      id: "deliveroo-mcq-10",
      prompt: "The zone review targets the WORST SLA zone first — the zone with the MOST late orders. Which ORDER BY + LIMIT lands the intervention target on row one?",
      choices: [
        "ORDER BY late_orders ASC LIMIT 1 — fewest late on top",
        "ORDER BY late_orders DESC LIMIT 1 — most late on top",
        "ORDER BY completed_orders DESC LIMIT 1 — busiest zone on top",
        "No ORDER BY needed — GROUP BY returns the worst group first",
      ],
      answer: 1,
      why: "Worst-first means most-late first: DESC puts the intervention target on row one. ASC would crown the cleanest zone — a correct query aimed at the opposite end of the map.",
      notes: [
        { choice: 0, why: "That's the healthiest-zone read. Direction is a business decision: the roster conversation starts where the promise broke, not where it held." },
        { choice: 3, why: "GROUP BY returns groups in arbitrary order without ORDER BY. Every 'top N' read needs its direction stated." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-deliveroo-1",
      tier: "medium",
      topic: "s6",
      universe: "supplier",
      title: "The three-day promise census",
      brief:
        "Deliveroo-flavored case on the storefront db (orders = delivery orders, shipped_at = rider drop-off timestamp, region = zone): the zone review opens with the SLA census, and the promise is fixed before the query — a delivery is 'within SLA' when the drop lands by day 3, boundary inclusive, measured over COMPLETED orders only. Probed facts: 82 of 103 orders carry a drop timestamp (the 14 pending and 7 cancelled have no latency YET and stay out of scope); drop latency averages 2.98 days inside a 2-to-4 range; by zone the averages run LATAM 3.50, US 3.07, EU 2.94, APAC 2.93. The ask is a per-zone bucket census — within-promise versus late — because the roster conversation starts where the promise broke.",
      ask: "Return each zone's completed orders bucketed within_sla versus late, ordered by zone then bucket.",
      template:
        "SELECT c.region,\n       CASE WHEN JULIANDAY(o.shipped_at) - JULIANDAY(o.created_at) <= {1} THEN 'within_sla' {2} 'late' END AS sla_bucket,\n       COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS NOT NULL\nGROUP BY c.region, {3}\nORDER BY c.region, sla_bucket;",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the SLA promise in days",
          noVerify: true,
          why: "The promise is 3 days, boundary inclusive: deltas of exactly 3.0 stay within SLA. A 4 would sweep every late order into compliance on a ledger whose worst delta is 4 — the census would report a perfect network.",
        },
        {
          answer: "ELSE",
          kind: "keyword",
          label: "the bucket catch-all",
          why: "ELSE routes every non-within order into 'late' — the bucket census is exhaustive by construction. Without ELSE, late deliveries fall out as NULL and the two buckets stop summing to the zone's completed count.",
        },
        {
          answer: "sla_bucket",
          kind: "keyword",
          label: "the bucket grouping key",
          why: "GROUP BY zone + bucket splits each zone's completed orders into the two rows the review reads. Grouping by the COUNT alias instead would fold by order count — a nonsense key that merges zones arbitrarily.",
        },
      ],
      distractors: ["4", "WHEN", "region", "orders", "THEN"],
      walkthrough:
        "A CASE-classified census where the boundary and the population are the whole test. The WHERE guard keeps the 82 completed orders — pending and cancelled have no latency YET, and saying so is the difference between a definition and a silent filter. The CASE stamps each drop as within_sla when its JULIANDAY delta clears the 3-day promise (inclusive — a 3.0-day drop keeps the promise; strict '<' would reclassify a third of the completed orders as late without a single delivery changing), ELSE routes the rest to 'late', and GROUP BY zone + bucket returns the eight-row census: APAC 20 within / 9 late, EU 26 / 10, US 10 / 5, LATAM 1 / 1 — 57 of 82 within promise network-wide. The distractors encode the classic failures: a 4-day promise sweeps every late order into compliance (the worst delta on this ledger is 4), grouping by 'region' collapses the buckets into one arbitrary-labeled row per zone, grouping by the COUNT alias folds by volume, and a missing ELSE leaks late orders out as NULLs — buckets that no longer sum to the zone's completed count.",
      },
    {
      id: "cs-deliveroo-2",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "Plus billing settlement census",
      brief:
        "Deliveroo-flavored case on the storefront db (invoices = Plus subscription billing runs, payments = settlement rows, amount_cents = billed pennies): the month-close opens with the settlement census, one pass, no three-query dance. Probed facts: 28 billing invoices — 21 paid totaling $66,443.00, 6 open totaling $19,609.00, 1 void at $925.00; settlement averages 28.4 days from issue on paid invoices, and the reconciliation table warns of a void-but-paid invoice ($925.00, one payment row) — which is why 'settled' here means status 'paid', not merely 'has a payment row'. Amounts are stored in INTEGER cents and quoted in dollars.",
      ask: "Return the one-pass census: total invoices, settled count and value, unsettled count and value.",
      template:
        "SELECT COUNT(*) AS invoices,\n       COUNT(*) FILTER (WHERE status = {1}) AS settled,\n       ROUND(SUM({3}) FILTER (WHERE status = 'paid') / 100.0, 2) AS settled_value,\n       COUNT(*) FILTER (WHERE status = {2}) AS unsettled,\n       ROUND(SUM(amount_cents) FILTER (WHERE status = 'open') {4}, 2) AS unsettled_value\nFROM invoices;",
      slots: [
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-status literal",
          why: "Settled means status 'paid' — 21 invoices. Status matching is case-sensitive text equality: 'Paid' matches nothing and the settled arm reads zero while the value arm still reads 66,443.00 — a census that disagrees with itself.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the unsettled-status literal",
          why: "Unsettled here is the 'open' status — 6 invoices still awaiting settlement. The void invoice is deliberately outside both arms; its $925.00 anomaly is a reconciliation story, not a census row.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the billed-value column",
          why: "The value arms fold amount_cents — the INTEGER pennies column. SUM over a wrong name errors out; the census is count-then-value per state, and the value arm must fold the same rows the count arm filtered.",
        },
        {
          answer: "/ 100.0",
          kind: "keyword",
          label: "the cents-to-dollars conversion",
          why: "The column is INTEGER cents: dividing by 100.0 (float, not 100) converts to the dollars the close quotes — $19,609.00. Integer / 100 truncation or a missing conversion would misquote the settlement position by orders of magnitude.",
        },
      ],
      distractors: ["'Paid'", "'void'", "* 100.0", "amount", "'settled'"],
      walkthrough:
        "A one-pass census where FILTER (WHERE …) keeps every arm on the same population: 28 invoices scanned once, each arm filtering its own rows inside the scan — 21 settled at $66,443.00, 6 unsettled at $19,609.00, counts and values from the same pass so they can never drift apart the way three separate queries do. The traps the distractors encode: 'Paid' with a capital P matches nothing — status text is case-sensitive, and the count arm would read 0 while the hardcoded value arm still reads 66,443.00, a self-contradicting census; 'void' swaps the unsettled arm onto the one void invoice and hides the six genuinely open ones; '* 100.0' multiplies pennies into a number a hundred million times too big; 'amount' is not a column (it's amount_cents) and errors the value arm; and 'settled' is a label, not a status — the census reads zero everywhere it should read 21. The close quotes dollars, so the cents-to-dollars division is float — integer division would truncate pennies into fiction, and this is exactly the arithmetic the reconciliation table exists to catch.",
      },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Kept-share ratio where the denominator is the whole test — the SLA-compliance share in textbook clothing. Curated food-delivery pick (DoorDash-tagged row)." },
    { slug: "hopper-company-queries-i", why: "Monthly signup spine with a date spine table — the rider-supply census shape: who joined, when, and who never went active. Curated pick." },
    { slug: "hopper-company-queries-ii", why: "Per-driver cancellation share with a worker who never completed — the two-sided denominator drill behind every rider rate. Curated pick." },
    { slug: "hopper-company-queries-iii", why: "Average trips per driver per city by date bucket — zone-level supply productivity in its cleanest form. Curated pick." },
    { slug: "find-overlapping-shifts", why: "Interval-overlap self-join — the roster audit: which rider shifts covered the same zone at the same time. Curated pick." },
    { slug: "find-overlapping-shifts-ii", why: "Sweep-line overlap counting — concurrent coverage per moment, the staffing-density read. Curated pick." },
    { slug: "trips-and-users", why: "Cancellation share per zone per day with excluded accounts — the canonical delivery screen this kit's compliance reads generalize. Curated pick (Uber-tagged row), included because it IS the interview." },
    { slug: "confirmation-rate", why: "LEFT JOIN acceptance share where unmatched ids coalesce to zero — rider-acceptance reporting in textbook form, NULL policy included. Curated pick." },
    { slug: "restaurant-growth", why: "Rolling 7-day average of daily spend — the moving-average read partner teams use to smooth the dinner-rush noise. Curated pick." },
    { slug: "average-time-of-process-per-machine", why: "Paired timestamps self-joined into durations per unit — placed-to-dropped latency in its cleanest form. Curated pick." },
    { slug: "analyze-subscription-conversion", why: "LEFT JOIN NULL-arm conversion read — Plus signup conversion from activity, where the unmatched rows ARE the answer. Curated pick." },
    { slug: "generate-the-invoice", why: "Argmax-composed invoice generation — the billing-run build: line items folded into one customer invoice. Curated pick." },
    { slug: "ar-aging-schedule", why: "Aging buckets on the unpaid tail — the Plus receivables ladder the month-close quotes. Curated pick." },
    { slug: "bikes-last-time-used", why: "MAX per group for last-active stamps — fleet hygiene: which riders (and bikes) went quiet. Curated pick." },
    { slug: "server-utilization-time", why: "Span versus summed intervals — logged shift hours versus wall-clock span, the payroll reconciliation read. Curated pick." },
    { slug: "winback-recovery", why: "Winback-window reactivation — lapsed subscribers who returned inside the window, churn reads built on billing events. Curated pick." },
  ],
};
