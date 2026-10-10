// Deep-dives — Warehouse Trust B file: SCD2 build, late-arriving restatement
// and snapshot delta detect (3 problems: 2 Hard, 1 Medium; all three are
// order:"exact" with a real ORDER BY). The one money column in the family,
// balance_cents, is INTEGER cents; no REAL columns exist here — dates are
// plain TEXT labels and counts are INTEGERs. Own tables, own seeds, original
// phrasing — never copied problem text.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8064 scd2-build ·
// 8065 late-arriving-restatement · 8066 snapshot-delta-detect.
import type { LcSqlDive } from "../types";

export const SQL_DF_WH_B: LcSqlDive[] = [
  {
    slug: "scd2-build",
    statement:
      "A change feed logs every recorded city for a customer: customer_changes holds (change_id, customer_id, city, changed_date), one row per recorded change, where a no-op re-affirmation is the same city recorded again on a later date. Build the SCD2 dimension the analytics layer queries: one row per (customer_id, city) version, carrying valid_from (the changed_date that STARTED this city value), valid_to (the changed_date of the next genuine change, or the sentinel '9999-12-31' while the version is still open) and is_current (1 on the open version, 0 otherwise). The pinned pipeline: per customer ordered by changed_date, FIRST drop every row whose city equals the previous row's city (LAG compare, the first row always survives), THEN take valid_to = LEAD over the surviving rows with the sentinel on the last. Report customer_id, city, valid_from, valid_to, is_current, ordered by customer_id then valid_from.",
    examples: [
      {
        input:
          "customer 2 — the feed records Boston on 2026-02-01, then Boston again on 2026-04-15 (the same city recorded twice)",
        output: "2 · Boston · 2026-02-01 · 9999-12-31 · 1",
        explanation:
          "The second Boston row repeats the previous city, so the LAG compare drops it before any window runs: one version survives, opening 2026-02-01 with no successor, so it takes the 9999-12-31 sentinel and is_current 1.",
      },
      {
        input:
          "customer 3 — the feed records Austin 2026-01-05, Dallas 2026-02-10, then Austin again 2026-05-30 (the bounce back)",
        output:
          "3 · Austin · 2026-01-05 · 2026-02-10 · 0 | 3 · Dallas · 2026-02-10 · 2026-05-30 · 0 | 3 · Austin · 2026-05-30 · 9999-12-31 · 1",
        explanation:
          "All three rows survive because every adjacent pair differs: the return to Austin is a genuine change, so a second Austin version opens 2026-05-30 and runs to the sentinel — the bounce is preserved as two separate Austin rows.",
      },
    ],
    constraints: [
      "every column here is INTEGER or a plain TEXT date in YYYY-MM-DD form; the problem carries no money and no REAL output — the shape is pure dimension plumbing",
      "PINNED pipeline: per customer ordered by changed_date, FIRST drop rows whose city equals the previous row's city (LAG compare; the first row per customer always survives), THEN compute valid_to = LEAD over the SURVIVING rows only",
      "PINNED sentinel: the last surviving row per customer reads valid_to '9999-12-31' with is_current 1; every earlier row reads valid_to = the next surviving valid_from with is_current 0",
      "consecutive same-city rows are no-ops and must NOT create versions, while a return to an earlier city (a bounce) IS a genuine change and opens a new version; ORDER BY customer_id ASC, valid_from ASC",
    ],
    primer: {
      hook:
        "Every report that rebuilds the past — what city did this customer live in last March — reads a slowly changing dimension, and this problem is the job of building one from a raw change feed.",
      concept: [
        "A data warehouse keeps two kinds of tables: facts, the events that happen (orders, rides, payments), and dimensions, the descriptive context around them (who the customer is, what the product is, where it ships). The lazy way to maintain a dimension is to overwrite: when a customer moves from Austin to Denver, UPDATE the row and move on. That one UPDATE destroys history forever — every old report that joins the dimension now claims the customer always lived in Denver, and nobody can prove otherwise. Finance, support and fraud teams all need yesterday's truth, not just today's.",
        "The slowly changing dimension type 2 — SCD2 for short — refuses to overwrite. Instead, every value change inserts a NEW row, and each row carries a validity window: valid_from, the date the value became true, and valid_to, the date it stopped being true. Reading the dimension as of any date d means picking the row whose window covers d — valid_from <= d and d < valid_to — so the past stays queryable forever. A customer who moved twice is simply two rows with adjacent windows.",
        "Building one from a raw change feed is a two-step dance, and the order is everything. Step one dedupes: feeds re-affirm the current value constantly (a nightly sync rewrites Austin over Austin), and those no-ops must not mint fake versions — comparing each row's city with the PREVIOUS row's city (LAG) flags exactly the rows to drop. Step two windows: over the surviving rows, LEAD pairs each version's start with the next version's start, and that next start becomes the previous version's valid_to.",
        "The last surviving row has no next change, so it is still open: it takes the far-future sentinel date '9999-12-31' as its valid_to and an is_current flag of 1. The sentinel looks cosmetic but is load-bearing — range filters and sorts treat a NULL valid_to badly, while '9999-12-31' compares cleanly against any real date. One more subtlety: a customer who moves Austin to Dallas and BACK to Austin gets two separate Austin rows, because each direction is a genuine change — dedupe compares consecutive rows only, never history.",
      ],
      worked: [
        "One customer records Austin on Jan 5, Austin again on Jan 9, Dallas on Feb 10 and Austin on May 30 — four raw feed rows.",
        "The Jan 9 row repeats the previous city, so the LAG compare drops it; the other three rows survive, including the first row whose previous city is NULL.",
        "LEAD over the three survivors pairs each start with the next: Austin runs Jan 5 to Feb 10, Dallas runs Feb 10 to May 30.",
        "The May 30 Austin has no next start, so it takes the '9999-12-31' sentinel with is_current 1 — and it is a SECOND Austin version, not a merge with the first, because the bounce back is a genuine change.",
      ],
      glossary: [
        { term: "slowly changing dimension (SCD2)", def: "a dimension table keeping one row per value version, each with its validity window" },
        { term: "dimension", def: "the descriptive side of a warehouse: customers, products, places" },
        { term: "validity window", def: "the half-open date range from valid_from up to (not including) valid_to a version was true" },
        { term: "no-op re-affirmation", def: "a feed row repeating the current value, carrying no new version" },
        { term: "sentinel date", def: "the far-future 9999-12-31 stamped on the still-open version" },
        { term: "is_current flag", def: "1 on the open version, 0 on every closed one" },
      ],
      reallife: [
        "Analytics engineers own this build at every company with a customer dimension worth defending. Modern warehouses automate the tail end — dbt snapshots and merge statements can stamp validity windows on a schedule — but the raw feed upstream still needs the dedupe, and CRM exports are notorious for re-affirming the same address on every sync. Teams that skip the dedupe watch the dimension grow a version per sync until the table drowns in duplicate-validity rows, and every downstream as-of query slows down with it.",
        "What breaks in practice is almost always the window edges. A builder who swaps the sentinel for NULL watches every current customer vanish from range-filtered reads, because NULL fails comparisons silently. A builder who windows before deduping closes a still-open version on a no-op's date, and the next as-of report files the customer under a city they had already left. The decisions downstream are concrete: support reads the address as it stood when the ticket opened, fraud re-checks the city at transaction time, and finance restates last quarter's tax geography.",
      ],
      where:
        "Analytics engineers, data platform teams and BI developers build these dimensions daily, and SQL interviews at Shopify, Lyft, Instacart and Netflix hand candidates a raw change feed and ask for exactly this versioned output.",
    },
    breakdown: [
      "A dimension that overwrites in place — UPDATE the city, keep one row — is fast and blind: the moment the write lands, last March is unrecoverable. The SCD2 answer is to never update, only insert: each new value opens a row with valid_from set to its start date, and the previous row closes on that same date. Two kinds of rows result — closed versions with a real valid_to, and the one open version per customer stamped with the far-future sentinel and is_current 1. Reads then pick a version by date: a report as of d takes the row with valid_from <= d AND d < valid_to, the half-open convention that keeps adjacent windows from overlapping.",
      "The pinned pipeline has an order, and the order is the whole difficulty. Dedupe FIRST: LAG(city) over each customer's changed_date order marks the rows that repeat the previous city, and the WHERE drops them — the first row per customer always survives because its LAG hands back NULL. Window SECOND: LEAD(changed_date) runs over the SURVIVORS, so a no-op's date can never leak into a validity window. In SQLite the WHERE clause is evaluated before the SELECT-list window functions, which is exactly why the two steps live in separate CTEs — one filters after LAG, the next windows the filtered rows with LEAD. Collapse the two into one pass and the no-op customer's surviving row inherits the dropped row's date as its valid_to, a still-open version marked closed.",
      "The final projection is mechanical: COALESCE(next_start, '9999-12-31') stamps the sentinel, CASE WHEN next_start IS NULL THEN 1 ELSE 0 END stamps is_current, and changed_date AS valid_from names the start. The bounce customer shows why dedupe compares CONSECUTIVE rows only: Austin to Dallas to Austin keeps all three rows because every adjacent pair differs, and the two Austin versions stay separate with different windows. ORDER BY customer_id, valid_from hands back the dimension in read order — history per customer, oldest version first.",
    ],
    edges: [
      "Skip the LAG dedupe and ship one SCD2 row per raw change: the report reads 9 rows instead of 8, and customer 2 carries two OVERLAPPING Boston versions — valid_from 2026-02-01 with valid_to 2026-04-15, then valid_from 2026-04-15 with the sentinel — both claiming to be the truth.",
      "Compute LEAD before dedupe and customer 2's surviving Boston row reads valid_to 2026-04-15 with is_current 0 — the no-op's date leaks into the window and the still-open version is marked closed.",
      "Replace the sentinel with NULL and sort by valid_to instead of valid_from: SQLite orders NULLs first, so every customer's is_current row jumps ABOVE its history — customer 1 reads Seattle, Austin, Denver instead of Austin, Denver, Seattle.",
      "Filter with city <> prev_city and forget the IS NULL escape: NULL compares fail, every customer's first row drops, and the report ships 4 rows with customer 2 (whose second row is a no-op) vanishing entirely.",
    ],
    ladder: [
      { title: "Brute force — hand-write the versions", body: "Sort each customer's feed rows on paper, cross out repeats, and write one line per version with its window. Four customers is manageable; four million rows synced nightly is not, and the cross-out rule is exactly what LAG encodes." },
      { title: "The pattern — dedupe, then window", body: "LAG(city) flags consecutive repeats, a WHERE keeps the survivors, and a second CTE runs LEAD(changed_date) over only those survivors to cut the windows. COALESCE stamps the sentinel and CASE stamps is_current in the same projection." },
      { title: "The optimal idea — one pass per customer, order fixed forever", body: "O(n log n) over the n change rows — one sort per partition per window function, then a linear projection. The durable rules: dedupe on CONSECUTIVE rows only, window AFTER filtering, and never let a NULL sentinel reach a comparison." },
    ],
    approach:
      "LAG city-dedupe CTE first, then LEAD validity windows over the surviving rows, COALESCE '9999-12-31' sentinel plus CASE is_current, ORDER BY customer_id, valid_from",
    schema: {
      ddl: `CREATE TABLE customer_changes (
  change_id    INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  city         TEXT NOT NULL,
  changed_date TEXT NOT NULL        -- 'YYYY-MM-DD', the day the change was recorded
);`,
      seed: `-- 9 recorded changes across 4 customers: a 3-move mover, a no-op repeater
-- (same city twice — one row must die), an Austin-Dallas-Austin bounce, and
-- a single-change customer. 8 SCD2 versions should come out.
INSERT INTO customer_changes (change_id, customer_id, city, changed_date) VALUES
  (1, 1, 'Austin',  '2026-01-10'),
  (2, 1, 'Denver',  '2026-03-05'),
  (3, 1, 'Seattle', '2026-06-20'),
  (4, 2, 'Boston',  '2026-02-01'),
  (5, 2, 'Boston',  '2026-04-15'),  -- no-op re-affirmation: must NOT open a version
  (6, 3, 'Austin',  '2026-01-05'),
  (7, 3, 'Dallas',  '2026-02-10'),
  (8, 3, 'Austin',  '2026-05-30'),  -- the bounce back: a genuine second Austin version
  (9, 4, 'Miami',   '2026-03-15');`,
      tables: [
        { name: "customer_changes", note: "9 rows across 4 customers — a 3-move mover, a 2-row no-op repeater (1 row dies), an Austin-Dallas-Austin bounce, a single-change customer" },
      ],
    },
    code: `WITH ordered AS (
    -- one row per recorded change, stamped with the PREVIOUS city per customer
    -- in changed_date order: the first row of each customer gets a NULL prev
    SELECT
        customer_id,
        city,
        changed_date,
        LAG(city) OVER (PARTITION BY customer_id ORDER BY changed_date) AS prev_city
    FROM customer_changes
),
versions AS (
    -- the PINNED pipeline, in order: dedupe FIRST (drop rows repeating the
    -- previous city), THEN window the survivors — the WHERE runs before the
    -- SELECT-list LEAD, so no no-op date can leak into a validity window
    SELECT
        customer_id,
        city,
        changed_date,
        LEAD(changed_date) OVER (PARTITION BY customer_id ORDER BY changed_date) AS next_start
    FROM ordered
    WHERE prev_city IS NULL OR city <> prev_city
)
SELECT
    customer_id,
    city,
    changed_date AS valid_from,
    -- the sentinel stamps the still-open version: is_current rides the same NULL
    COALESCE(next_start, '9999-12-31') AS valid_to,
    CASE WHEN next_start IS NULL THEN 1 ELSE 0 END AS is_current
FROM versions
ORDER BY customer_id ASC, valid_from ASC;`,
    walkthrough: [
      "The ordered CTE takes all 9 feed rows and stamps prev_city per customer in changed_date order: customer 1's Denver row reads Austin, customer 2's second Boston row reads Boston, and every first row reads NULL. The versions CTE's WHERE keeps 8 of the 9 — exactly one row dies, the 2026-04-15 Boston re-affirmation whose city equals its prev_city. Everything else survives, including customer 3's second Austin, whose previous row is Dallas.",
      "Over those 8 survivors, LEAD(changed_date) cuts the windows per customer: Austin 01-10 hands its end to Denver's 03-05, Denver hands 06-20 to Seattle, and Seattle finds no successor. Customer 3 reads Austin 01-05 to 02-10, Dallas 02-10 to 05-30, Austin 05-30 to nothing. The projection stamps 4 sentinels — Seattle, Boston, the second Austin and Miami — each with is_current 1, and 4 closed rows with real valid_to dates and is_current 0.",
      "The engine ships 8 rows in customer_id, valid_from order: (1, Austin, 2026-01-10, 2026-03-05, 0), (1, Denver, 2026-03-05, 2026-06-20, 0), (1, Seattle, 2026-06-20, 9999-12-31, 1), (2, Boston, 2026-02-01, 9999-12-31, 1), (3, Austin, 2026-01-05, 2026-02-10, 0), (3, Dallas, 2026-02-10, 2026-05-30, 0), (3, Austin, 2026-05-30, 9999-12-31, 1) and (4, Miami, 2026-03-15, 9999-12-31, 1). Nine raw rows went in and eight versions came out — the single no-op was the only casualty. The check script runs four wrong variants against this exact sequence and pins each wrong answer.",
    ],
    time: "O(n log n) over the n change rows — one sort per customer partition for the LAG read and one for the LEAD window, then a linear projection",
    space: "O(n) — the ordered and deduped row sets materialize before the final projection",
    followUps: [
      "Two changes for one customer land on the SAME changed_date — which deterministic tiebreak (change_id?) restores a stable window order, and what does the dimension read while the tie stands?",
      "Version TWO attributes at once, city and plan_tier, where either can move alone — does the dedupe become per-attribute, and how do the row counts change when the city moves but the plan does not?",
    ],
    related: ["balance-rollforward", "journal-gap-detection", "sessionize-events"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "late-arriving-restatement",
    statement:
      "The events table logs (event_id, event_date, processed_date): the day an event HAPPENED and the day the pipeline actually ingested it, with processed_date >= event_date always and lateness being the gap between the two. A daily aggregate that counts same-day arrivals gets a day wrong whenever events land late, and the restatement report tells the team which event dates must be re-counted and by how much. Report per event_date: event_date, true_events (COUNT grouped by event_date), counted_same_day (COUNT of those with processed_date = event_date) and restatement_delta = true_events - counted_same_day, for every event_date whose delta is strictly greater than 0. ORDER BY event_date ascending.",
    examples: [
      {
        input:
          "2026-09-10 — three events happened that day: two were processed 2026-09-14 and one 2026-09-15, none on the day itself",
        output: "2026-09-10 · 3 · 0 · 3",
        explanation:
          "The same-day counter caught none of the three, so the day's published aggregate undercounted by the full 3 — a backfill day needing complete restatement, the loudest row on the report.",
      },
      {
        input:
          "2026-09-14 — two events happened that day: one processed the same day, one processed 2026-09-21, a full week late",
        output: "2026-09-14 · 2 · 1 · 1",
        explanation:
          "The day looked half right — the counter caught 1 of 2 — but the week-late straggler still opens a +1 restatement a week after the day closed; the strict delta > 0 gate is what keeps such a day on the report.",
      },
    ],
    constraints: [
      "processed_date >= event_date holds for every row (PINNED — an event is never processed before it happens); lateness is the gap between the two dates and all dates are plain TEXT in YYYY-MM-DD form",
      "no money and no REAL columns: the four output columns are one TEXT date and three INTEGER counts",
      "PINNED definitions: true_events = COUNT(*) grouped by event_date; counted_same_day = COUNT of the group with processed_date = event_date; restatement_delta = true_events - counted_same_day",
      "PINNED filter: only event dates with restatement_delta > 0 (STRICT) report — delta 0 days are already correct and are excluded; ORDER BY event_date ASC",
    ],
    primer: {
      hook:
        "Yesterday's dashboard printed 412 events, this morning the truth is 419, and the restatement report is how a data team admits the count was wrong and by exactly how much.",
      concept: [
        "Pipelines that look incremental all share one habit: they count what exists at run time and move on. A daily aggregate built during the night of day d can only see rows ingested by then — and events have a habit of showing up later. Mobile apps queue events offline and replay them when connectivity returns, partner APIs retry failed pushes, upstream loads slip a batch. None of that changes WHEN the event happened; it only changes WHEN the pipeline saw it.",
        "That gap has a vocabulary: event_date is when the event happened, processed_date is when the pipeline ingested it, and lateness is the difference. A same-day count is what the daily dashboard printed while the day was live; the true count is what the day looks like once every straggler has landed. When the two differ, the published number is not slightly imperfect — it is wrong on the record, and the correction has a name: a restatement.",
        "Restatements are a first-class report, not an apology. Per event date it reads three numbers: the truth, what was counted, and the delta between them — the amount the published aggregate must move. Days with delta 0 need nothing; days with a positive delta go on the report, loudest first, because a backfill that lands forty late events on one day is a different operational problem than a nightly straggler.",
        "The deep habit this problem trains is separating two clocks. Every aggregation keyed on processed_date answers how much work the pipeline did; every aggregation keyed on event_date answers what actually happened in the world. Restatement thinking is the bridge between them: keep both counts, compare them per day, and surface exactly the days where the bridge sags. Incremental dbt models, stream watermarks and month-end closes all live on this bridge.",
      ],
      worked: [
        "A day takes 3 events: 2 processed the same day, 1 processed three days later.",
        "true_events reads 3 — the COUNT by event_date never asks when rows arrived.",
        "counted_same_day reads 2 — only those two match processed_date = event_date.",
        "restatement_delta = 3 - 2 = 1, so the day goes on the report; the next day, all same-day, computes delta 0 and ships no row at all.",
      ],
      glossary: [
        { term: "event date", def: "the day the event actually happened in the world" },
        { term: "processed date", def: "the day the pipeline ingested the row" },
        { term: "late arrival", def: "an event whose processed date falls after its event date" },
        { term: "same-day count", def: "what the daily aggregate printed while the day was live" },
        { term: "restatement", def: "a published correction moving a past aggregate to its true value" },
        { term: "watermark", def: "the processed-date frontier a pipeline trusts as complete" },
      ],
      reallife: [
        "Data platform teams at analytics-heavy companies run restatement monitors as part of the morning sweep. The report ranks the damage: a delta of 1 or 2 is a trickle the on-call notes and moves past, while a backfill day — a partner replaying a week of events at once — can move a dashboard by double digits and deserves a message to every consumer of the number. The same report doubles as a health metric: if deltas cluster on Mondays, some upstream weekend job is slipping.",
        "What breaks is silence. A dashboard that never restates looks confident and is quietly wrong — analysts memorize numbers that later move without explanation, and month-end finance closes on counts that shift afterward. The decisions the report drives are operational: when to freeze a watermark and stop accepting events for a day, when to republish downstream marts, and whether a suspicious spike is real demand or one client replaying its queue.",
      ],
      where:
        "Data platform engineers and analytics engineers on ingestion teams run these monitors daily, and SQL interviews at Snowflake, Databricks, Stripe and Uber probe exactly this true-versus-counted thinking.",
    },
    breakdown: [
      "The GROUP BY key is the whole problem in miniature. Group by event_date and every late event flows home to the day it happened: the backfill day with zero same-day arrivals reads true 3, counted 0, delta 3, and the week-late straggler drags its day onto the report. Group by processed_date instead and the report re-keys itself to ingestion days — several true days collapse into one row keyed by when they happened to land, and dates appear that no correct report contains. One word in the GROUP BY separates the world's clock from the pipeline's clock.",
      "The counted side is a conditional SUM inside the same grouped rows: SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) counts the agreements, and delta = COUNT(*) minus that SUM. No self-join and no second pass is needed — both numbers live in one aggregate per event_date. The strict gate then does the editorial work: WHERE delta > 0 keeps only the days whose published number is actually wrong. A delta 0 day is not evidence of virtue — it is evidence the day got lucky — but it needs no action, so it must not ride along.",
      "The seed plants all three shapes of lateness so the report has texture. Clean days (all three events same-day on 2026-09-07, both on 2026-09-15, the single one on 2026-09-18) compute delta 0 and stay off the report. The backfill day 2026-09-10 is the loudest row — true 3, counted 0, delta 3 — and the trickle days 2026-09-09, 2026-09-11, 2026-09-14 and 2026-09-16 each read delta 1. Summing the report's delta column gives 7, and 7 is exactly the number of events whose processed_date differs from their event_date — the closing sanity check.",
    ],
    edges: [
      "Group by processed_date instead of event_date and the report re-keys to ingestion days: 5 rows reading (2026-09-11, 2, 1, 1), (2026-09-14, 3, 1, 2), (2026-09-15, 4, 2, 2), (2026-09-18, 2, 1, 1) and (2026-09-21, 1, 0, 1) — the real backfill day 2026-09-10 vanishes and a 2026-09-21 row no correct report contains appears.",
      "Drop the strict filter and every clean day rides along: 8 rows instead of 5, with 2026-09-07 publishing (3, 3, 0) — a day that was never wrong dressed up as a restatement.",
      "Flip the sign (counted - true) and the report empties: 0 rows, because processed_date >= event_date guarantees counted_same_day <= true_events on every grouping — a negative delta is arithmetically impossible here, which is itself the tell.",
      "Pre-filter with WHERE processed_date <> event_date and count per event_date: 5 rows of late counts — (2026-09-09, 1), (2026-09-10, 3), (2026-09-11, 1), (2026-09-14, 1), (2026-09-16, 1) — that match the delta column but have lost true_events and counted_same_day, so the report can no longer show what the day actually printed.",
    ],
    ladder: [
      { title: "Brute force — two queries and a spreadsheet", body: "Run one COUNT by event_date, another grouped by event_date filtered to same-day rows, paste both into a sheet and subtract. Works once; breaks the morning someone re-runs it and the two queries disagree on which days exist." },
      { title: "The pattern — one grouped pass, conditional SUM, strict gate", body: "GROUP BY event_date computes true and counted side by side, the delta is their difference, and WHERE delta > 0 keeps the report honest. One CTE, one filter, one sort." },
      { title: "The optimal idea — key on the world's clock, count both clocks", body: "O(n log n) over the n events — one sort to group plus one linear pass. The durable rules: aggregate on event_date, conditionally count processed_date = event_date, and never let delta 0 days onto a restatement report." },
    ],
    approach:
      "conditional SUM counts same-day arrivals per event_date, strict delta > 0 gate keeps the wrong days only, ORDER BY event_date",
    schema: {
      ddl: `CREATE TABLE events (
  event_id       INTEGER PRIMARY KEY,
  event_date     TEXT NOT NULL,      -- 'YYYY-MM-DD', the day the event HAPPENED
  processed_date TEXT NOT NULL       -- 'YYYY-MM-DD', the day the pipeline INGESTED it
);`,
      seed: `-- 17 events over 8 event dates spanning two weeks (2026-09-07 .. 2026-09-18).
-- Shapes planted: clean days (delta 0, excluded), the 2026-09-10 backfill day
-- (all 3 events late), trickle days (delta 1), and one week-late straggler
-- landing on otherwise-clean 2026-09-14. 7 of the 17 events are late.
INSERT INTO events (event_id, event_date, processed_date) VALUES
  ( 1, '2026-09-07', '2026-09-07'),  -- clean day: 3 on-time
  ( 2, '2026-09-07', '2026-09-07'),
  ( 3, '2026-09-07', '2026-09-07'),
  ( 4, '2026-09-09', '2026-09-09'),  -- trickle: 1 of 2 on-time
  ( 5, '2026-09-09', '2026-09-11'),
  ( 6, '2026-09-10', '2026-09-14'),  -- backfill day: all 3 late
  ( 7, '2026-09-10', '2026-09-14'),
  ( 8, '2026-09-10', '2026-09-15'),
  ( 9, '2026-09-11', '2026-09-11'),  -- trickle: 1 of 2 on-time
  (10, '2026-09-11', '2026-09-15'),
  (11, '2026-09-14', '2026-09-14'),  -- 1 of 2 on-time + the week-late straggler
  (12, '2026-09-14', '2026-09-21'),
  (13, '2026-09-15', '2026-09-15'),  -- clean day: 2 on-time
  (14, '2026-09-15', '2026-09-15'),
  (15, '2026-09-16', '2026-09-16'),  -- trickle: 1 of 2 on-time
  (16, '2026-09-16', '2026-09-18'),
  -- clean day closes the seed: 1 on-time
  (17, '2026-09-18', '2026-09-18');`,
      tables: [
        { name: "events", note: "17 rows over 8 event dates 2026-09-07..2026-09-18 — 7 arrive late and 5 days report a restatement" },
      ],
    },
    code: `WITH per_day AS (
    -- one row per event_date: the true count and how many of those the
    -- same-day counter actually caught while the day was live
    SELECT
        event_date,
        COUNT(*) AS true_events,
        SUM(CASE WHEN processed_date = event_date THEN 1 ELSE 0 END) AS counted_same_day
    FROM events
    GROUP BY event_date
)
SELECT
    event_date,
    true_events,
    counted_same_day,
    -- the correction the published aggregate owes: PINNED strict — only days
    -- that are actually wrong report, delta 0 days are already true
    true_events - counted_same_day AS restatement_delta
FROM per_day
WHERE true_events - counted_same_day > 0
ORDER BY event_date ASC;`,
    walkthrough: [
      "The per_day CTE collapses 17 events into 8 event dates: 2026-09-07 holds 3, 2026-09-09 holds 2, 2026-09-10 holds 3, 2026-09-11 holds 2, 2026-09-14 holds 2, 2026-09-15 holds 2, 2026-09-16 holds 2 and 2026-09-18 holds 1. The conditional SUM counts agreements inside each group: 3, 1, 0, 1, 1, 2, 1, 1 respectively — 2026-09-10 caught nothing because all three of its events were processed on the 14th and the 15th. Both aggregates read the same 17 rows, so the two counts can never disagree about which days exist — only about how many of each day's rows arrived on time.",
      "Subtracting gives the deltas in event_date order: 0, 1, 3, 1, 1, 0, 1, 0. The strict WHERE keeps exactly the five positive days and drops the three clean ones — 2026-09-07, 2026-09-15 and 2026-09-18 — whose published numbers already matched their truth. Nothing was rounded, joined or deduplicated: the whole report is one grouped pass plus one filter.",
      "The engine ships 5 rows: (2026-09-09, 2, 1, 1), (2026-09-10, 3, 0, 3), (2026-09-11, 2, 1, 1), (2026-09-14, 2, 1, 1) and (2026-09-16, 2, 1, 1). The delta column sums to 7, matching the 7 late events planted in the seed (event ids 5, 6, 7, 8, 10, 12 and 16). The check script re-keys the aggregate four wrong ways and pins each wrong answer against this exact report.",
    ],
    time: "O(n log n) over the n events — one sort to group plus one linear aggregate pass",
    space: "O(d) — one aggregate row per distinct event_date before the strict filter",
    followUps: [
      "Add a lateness column — the AVG of processed_date minus event_date in days per restated event_date — and check which day carries the worst average lag on this seed.",
      "Reissue the corrected running total: produce one row per event_date with the TRUE cumulative count of the window so far, and count how many early days a single week-late event forces the pipeline to republish.",
    ],
    related: ["gl-reconciliation", "vintage-default-curves", "growth-accounting"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "snapshot-delta-detect",
    statement:
      "Two nightly snapshots of the same account ledger sit side by side: snap_yesterday and snap_today, each (acct_key, balance_cents) with one row per account. Overnight the pipeline inserted accounts, removed accounts and moved balances, and the morning job must say which of the four things happened and how often. Report exactly 4 rows — status, row_count — with status one of inserted (key only in today), removed (key only in yesterday), changed (in both, balance_cents different) and unchanged (in both, balance_cents equal), built with a FULL OUTER JOIN on acct_key plus COALESCE and IS-NULL classification. ORDER BY status ascending, so the four counts read alphabetically.",
    examples: [
      {
        input:
          "the three keys present in both snapshots with different balances — A-101 moves 50000 to 61250, A-102 moves 320000 to 297500, A-104 moves 120000 to -8500 (the sign flip)",
        output: "changed · 3",
        explanation:
          "All three pair up in the FULL OUTER JOIN with differing balance_cents, so the CASE ladder stamps each one changed — the overnight overdraw is direction-blind to the comparison and counts like any other move.",
      },
      {
        input: "the whole seed — 6 accounts yesterday, 7 today, 5 keys shared",
        output: "changed · 3 | inserted · 2 | removed · 1 | unchanged · 2",
        explanation:
          "A-109 and A-110 exist only in today (inserted), A-103 only in yesterday (removed), A-105 and A-106 pair with equal balances (unchanged), and ORDER BY status reads the four counts alphabetically.",
      },
    ],
    constraints: [
      "money is INTEGER cents: balance_cents is INTEGER NOT NULL in both snapshots and may be negative (an overdrawn account); the output carries no REAL columns — one TEXT status and one INTEGER row_count per row",
      "PINNED classification: inserted = key only in snap_today; removed = key only in snap_yesterday; changed = key in both with different balance_cents; unchanged = key in both with equal balance_cents",
      "PINNED shape: exactly 4 rows, one per status in (changed, inserted, removed, unchanged), and the seed guarantees every count >= 1; the join is a FULL OUTER JOIN on acct_key with a COALESCE key and IS-NULL classification",
      "ORDER BY status ASC — plain alphabetical, so the report reads changed, inserted, removed, unchanged",
    ],
    primer: {
      hook:
        "Every warehouse morning starts with one paranoid question — what changed since yesterday's load — and the four-bucket answer is the change-detection check the whole platform leans on.",
      concept: [
        "A snapshot is a full copy of a table's state at one moment: last night's account balances, frozen. Snapshots trade storage for simplicity — instead of tracking every UPDATE as it happens, a job copies the whole state on a schedule, and comparing two consecutive snapshots tells you everything that moved. Payments ledgers, inventory tables and customer records all get this treatment, usually nightly.",
        "Comparing two snapshots by key has exactly four outcomes. A key present only in today's snapshot was inserted overnight; a key present only in yesterday's was removed; a key in both with different attribute values changed; a key in both with equal values stayed unchanged. Every data-quality conversation starts by forcing the world into these four buckets — most keys are unchanged, and the interesting few are the other three.",
        "SQL's tool for this compare is the FULL OUTER JOIN, the one join that keeps unmatched rows from BOTH sides. Matched pairs line the two balances up side by side; an inserted key carries a NULL on the yesterday side; a removed key carries a NULL on the today side. Reading those NULLs is the classification: they are signals, not accidents, and the CASE ladder must test them FIRST, because NULL comparisons fail silently — NULL = NULL is NULL, not true — so an equality-first ladder dumps every unmatched key into its ELSE branch.",
        "The final step is compression: one classified row per key collapses into four counts with a GROUP BY. The report is tiny — four rows — but it is the morning smoke test for an entire pipeline: a removed count that should be zero, a changed count that triples overnight, or an inserted spike all mean someone should start reading logs before the dashboards do. Four numbers, one glance, and the whole platform knows whether last night's load can be trusted.",
      ],
      worked: [
        "Yesterday holds keys K1, K2 and K3; today holds K2, K3 and K4.",
        "The FULL OUTER JOIN pairs K2 and K3, leaves K4 with a NULL yesterday side and K1 with a NULL today side.",
        "K2 reads 100 on both sides — unchanged; K3 reads 100 then -50 — changed, sign flip included.",
        "The report compresses to four rows: changed 1, inserted 1 (K4), removed 1 (K1), unchanged 1.",
      ],
      glossary: [
        { term: "snapshot", def: "a full copy of a table's state frozen at one moment" },
        { term: "change data capture", def: "the discipline of detecting inserts, removes and updates between two states" },
        { term: "FULL OUTER JOIN", def: "the join keeping unmatched rows from both sides, padding the missing side with NULLs" },
        { term: "unmatched row", def: "a key present on one side only — the inserted or removed signal" },
        { term: "NULL-safe compare", def: "an equality check that handles NULL deliberately instead of failing silently" },
        { term: "delta report", def: "the per-bucket counts summarizing what moved between two snapshots" },
      ],
      reallife: [
        "Ledger and payments teams run this diff nightly as the first read of the day. A removed row that should not exist is an account vanishing from the books; a spike in changed rows is a mass update, a migration or a bug; inserted rows get reconciled against the day's account openings. The four counts go to a channel the whole data org reads, because the numbers decide whether the day starts normally or with an incident.",
        "What breaks is the join, not the idea. An INNER JOIN diff silently goes blind to inserted and removed — the two buckets that carry the real incidents — and reports a calm world. Equality checks that ignore NULL semantics dump unmatched keys into changed, and a COALESCE placed before the IS-NULL guard misclassifies removed rows as changed. The decisions downstream are real money: recon teams block deploys on an unexplained removed count, and risk teams alarm on sign flips — overdrawn balances appearing overnight.",
      ],
      where:
        "Ledger, payments and data-quality engineers run this diff nightly, and SQL interviews at Stripe, Adyen, PayPal and Coinbase open with exactly this two-snapshot compare.",
    },
    breakdown: [
      "The FULL OUTER JOIN is the diff engine, and COALESCE(y.acct_key, t.acct_key) is its key ring: matched rows share the key, while a today-only row survives on its own key with a NULL yesterday balance and a yesterday-only row is the mirror image. Five of the seed's 8 distinct keys pair up; A-109 and A-110 exist only in today; A-103 exists only in yesterday. Every classification the report makes is a read of those NULLs followed by one balance comparison.",
      "The CASE ladder order is load-bearing. The IS-NULL checks come first because they identify the unmatched rows; only then can y_balance <> t_balance classify changed versus unchanged on matched pairs. Drop the IS-NULL guards entirely and NULL = NULL fails, so all three unmatched keys fall into ELSE and changed miscounts as 6. Place a COALESCE(t_balance, 0) comparison before the removed check and A-103 (15000 against a COALESCEd 0) reads changed instead of removed — the removed group empties out of the report and it prints 3 rows instead of 4. The ladder must test the missing side BEFORE it compares.",
      "The compression is a plain GROUP BY status with COUNT(*), and ORDER BY status ASC pins the alphabetical read: changed 3, inserted 2, removed 1, unchanged 2. The seed's sign flip is deliberate — A-104 moves 120000 to -8500, an overdraw appearing overnight — and the SQL treats it as an ordinary changed row because numeric comparison is direction-blind. Making sign flips LOUD is a follow-up concern (a WHERE on the delta), not a reason to complicate the four-bucket contract.",
    ],
    edges: [
      "Swap FULL OUTER JOIN for INNER JOIN and the unmatched keys never pair: the report ships 2 rows — changed 3, unchanged 2 — and the 2 inserted plus 1 removed keys vanish without a trace.",
      "Drop the IS-NULL guards and classify on equality alone: NULL = NULL is NULL, so all three unmatched keys fall into ELSE and the report reads changed 6, unchanged 2 — changed triple-counts by swallowing inserted and removed.",
      "Place COALESCE(t_balance, 0) before the removed check and A-103 (15000 versus a COALESCEd 0) misreads as changed: changed reads 4 and the removed group empties out of the GROUP BY entirely — the report prints 3 rows instead of 4, so the broken shape itself announces the bug.",
      "Flip the two IS-NULL labels — reading the yesterday-side NULL as removed and the today-side NULL as inserted — and the counts swap: inserted 1, removed 2, a report that accuses the pipeline of the exact opposite of what happened.",
    ],
    ladder: [
      { title: "Brute force — four queries and a clipboard", body: "Run NOT EXISTS both ways for inserted and removed, join for changed and unchanged, and assemble the four numbers by hand. Four queries drift apart the first time the schema grows a column, and none of them survives a review asking for one deterministic statement." },
      { title: "The pattern — FULL OUTER JOIN, NULL-led CASE, GROUP BY", body: "One FULL OUTER JOIN pairs the snapshots, COALESCE rebuilds the key, a CASE ladder led by IS-NULL checks names the bucket, and GROUP BY status compresses to four counts. One statement, four rows, no blind spots." },
      { title: "The optimal idea — treat NULLs as signals, not accidents", body: "O(y + t) over the y yesterday and t today rows — one hash join plus one linear classification. The durable rules: unmatched rows are the interesting rows, IS-NULL checks lead the ladder, and every count is only as trustworthy as the join that fed it." },
    ],
    approach:
      "FULL OUTER JOIN on acct_key with COALESCE keying, IS-NULL-led CASE classification into four buckets, GROUP BY status, alphabetical ORDER BY status",
    schema: {
      ddl: `CREATE TABLE snap_yesterday (
  acct_key      TEXT PRIMARY KEY,
  balance_cents INTEGER NOT NULL    -- INTEGER cents, negative = overdrawn
);
CREATE TABLE snap_today (
  acct_key      TEXT PRIMARY KEY,
  balance_cents INTEGER NOT NULL    -- INTEGER cents, negative = overdrawn
);`,
      seed: `-- 6 accounts yesterday, 7 today, 5 shared keys. Planted exactly:
-- changed 3 (A-101, A-102, and A-104 which flips sign to overdrawn),
-- unchanged 2 (A-105, A-106 — itself overdrawn both nights), inserted 2
-- (A-109, A-110), removed 1 (A-103 closes overnight). 8 distinct keys total.
INSERT INTO snap_yesterday (acct_key, balance_cents) VALUES
  ('A-101',  50000),
  ('A-102', 320000),
  ('A-103',  15000),  -- removed overnight: no row in today
  ('A-104', 120000),
  ('A-105', 725000),
  ('A-106', -45000);
INSERT INTO snap_today (acct_key, balance_cents) VALUES
  ('A-101',  61250),  -- changed
  ('A-102', 297500),  -- changed
  ('A-104',  -8500),  -- changed: flips sign, the overdraw appears
  ('A-105', 725000),  -- unchanged
  ('A-106', -45000),  -- unchanged (stays overdrawn)
  -- the two inserts close the seed
  ('A-109',  27300),
  ('A-110',  98000);`,
      tables: [
        { name: "snap_yesterday", note: "6 accounts — includes the removed A-103" },
        { name: "snap_today", note: "7 accounts — includes the 2 inserted A-109 and A-110" },
      ],
    },
    code: `WITH paired AS (
    -- FULL OUTER JOIN keeps the unmatched rows of BOTH sides: an inserted key
    -- carries a NULL yesterday balance, a removed key a NULL today balance
    SELECT
        COALESCE(y.acct_key, t.acct_key) AS acct_key,
        y.balance_cents AS y_balance,
        t.balance_cents AS t_balance
    FROM snap_yesterday y
    FULL OUTER JOIN snap_today t ON t.acct_key = y.acct_key
),
classified AS (
    -- the IS-NULL checks MUST lead the CASE ladder: NULL = NULL is NULL (not
    -- true), so an equality-first ladder would dump unmatched rows into ELSE
    SELECT
        CASE
            WHEN y_balance IS NULL THEN 'inserted'
            WHEN t_balance IS NULL THEN 'removed'
            WHEN y_balance <> t_balance THEN 'changed'
            ELSE 'unchanged'
        END AS status
    FROM paired
)
SELECT
    status,
    COUNT(*) AS row_count
FROM classified
GROUP BY status
-- alphabetical: the four rows always read changed, inserted, removed, unchanged
ORDER BY status ASC;`,
    walkthrough: [
      "The paired CTE FULL OUTER JOINs 6 yesterday rows against 7 today rows on acct_key and produces 8 distinct keys: 5 matched pairs (A-101, A-102, A-104, A-105, A-106), 2 rows with a NULL yesterday side (A-109, A-110) and 1 row with a NULL today side (A-103). COALESCE rebuilds the key for the unmatched three, so nothing is lost at the join. The paired set is the complete universe — every key that existed on either night, exactly once.",
      "The classified CTE reads each row: A-101 compares 50000 against 61250 and reads changed; A-102 compares 320000 against 297500 and reads changed; A-104 compares 120000 against -8500 and reads changed — the sign flip is just another difference. A-105 (725000 versus 725000) and A-106 (-45000 versus -45000) read unchanged, A-109 and A-110 read inserted off their NULL yesterday balances, and A-103 reads removed off its NULL today balance. Five of the eight keys compare balances, and exactly three of those comparisons differ.",
      "GROUP BY status compresses the 8 classified rows into 4 counts and ORDER BY status ships them alphabetically: (changed, 3), (inserted, 2), (removed, 1), (unchanged, 2). The counts sum to 8 — the number of distinct keys across both snapshots — which is the closing sanity check. The check script blinds the join three different ways and pins each wrong report against this one.",
    ],
    time: "O(y + t) over the y yesterday and t today rows — one hash join plus one linear classification pass",
    space: "O(y + t) — the paired and classified row sets materialize before the GROUP BY",
    followUps: [
      "Emit the per-account detail beside the counts — acct_key, the old balance, the new balance and delta_cents for every changed key — and check which changed account moves the most cents on this seed.",
      "Diff THREE nightly snapshots (T-1, T and T+1) and classify accounts that changed and changed back (flip-flops) — which join shape scales the four-bucket logic past two tables?",
    ],
    related: ["trial-balance-check", "week-over-week-churn", "balance-rollforward"],
    order: "exact",
    xp: 20,
  },
];
