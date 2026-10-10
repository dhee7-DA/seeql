// Deep-dives — Warehouse A file: keep-latest dedupe, data-quality audit and
// point-in-time as-of reads (3 problems: 2 Easy, 1 Medium; dives 1 and 3
// order:"exact", dive 2 single-row order:"any"). This family has no money
// columns — statuses, dates and counts only; dates are 'YYYY-MM-DD' strings
// that compare correctly as strings. Own tables, own seeds, original phrasing.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8061 keep-latest-dedupe ·
// 8062 null-blank-audit · 8063 point-in-time-asof.
import type { LcSqlDive } from "../types";

export const SQL_DF_WH_A: LcSqlDive[] = [
  {
    slug: "keep-latest-dedupe",
    statement:
      "An order-status feed fires one event every time an order moves — placed, paid, shipped, delivered, cancelled — and the status_feed table logs (event_id, order_id, status, updated_at). Writers append freely and retries happen, so an order accumulates many events and two writers can even stamp the same second. The fulfillment dashboard wants exactly ONE row per order — its latest status. Latest is PINNED as the highest (updated_at, event_id) pair: the newest timestamp wins, and on a timestamp tie the higher event_id is the later writer. Report order_id, status and updated_at per order, ORDER BY order_id ascending.",
    examples: [
      {
        input:
          "order 102 fires two events in the same second — event 3 paid and event 4 shipped, both stamped 2026-09-02 11:30:00, after event 8 placed at 2026-09-01 16:45:00",
        output: "102 · shipped · 2026-09-02 11:30:00",
        explanation:
          "The two 11:30:00 stamps tie, so the rule reads the (updated_at, event_id) pair: 4 beats 3, the later writer is shipped, and the placed event from the day before never competes.",
      },
      {
        input:
          "order 103 sees event 6 shipped at 2026-09-02 14:20:00 land first, then a backfill inserts event 9 placed at 2026-09-01 09:00:00 afterward",
        output: "103 · shipped · 2026-09-02 14:20:00",
        explanation:
          "Insertion order is irrelevant: the backfill carries an EARLIER timestamp, so ranking by (updated_at, event_id) keeps shipped — ranking by event_id instead would flip the order to placed.",
      },
    ],
    constraints: [
      "PINNED tiebreak: latest = the highest (updated_at, event_id) pair per order — newest timestamp wins, and on a timestamp tie the HIGHER event_id is the later writer",
      "updated_at strings are 'YYYY-MM-DD HH:MM:SS' and compare correctly as strings; ranking runs on the timestamp with event_id as tiebreak — never on event_id alone, never on insertion order",
      "exactly one output row per order (6 orders), columns order_id, status, updated_at; every order in the feed ships a row, including the single-event order 105",
      "event_id is the primary key and unique, so the (updated_at, event_id) pair is always a total order and the winner is unambiguous; ORDER BY order_id ASC",
    ],
    primer: {
      hook: "The most common warehouse transformation is also the most common warehouse bug: turning an append-only feed of many-events-per-thing into exactly one current row per thing.",
      concept: [
        "Operational systems do not update — they append. Every time an order moves from placed to paid to shipped, the upstream service fires an event, and the warehouse keeps every one of them because the history is the audit trail. Analysts, though, ask questions about the present: how many orders are shipped right now? Answering that means collapsing each key's pile of events down to exactly one row — the keep-latest dedupe — and doing it wrong silently miscounts the business.",
        "Latest needs a definition, because events can tie. The house rule is a lexicographic pair: compare timestamps first, and when two events carry the exact same second, compare the event id — higher means the later writer, because ids are handed out monotonically as writers append. With that pair defined, latest is unambiguous: the event with the highest (timestamp, id) pair. Any other tiebreak — lower id, insertion order, alphabetical status — can silently pick an event that was superseded within the same second.",
        "The tempting shortcut is GROUP BY the key with MAX(updated_at) and the other columns bare. Some engines forbid it outright; SQLite allows it and then leaves the bare columns undefined whenever the maximum is tied — the timestamp can pair with a status from a different event. The safe tool is a window function: ROW_NUMBER numbers the events within each key from newest to oldest, and filtering rn = 1 keeps exactly the pinned winner. Other dialects spell it QUALIFY or arg-max; the shape is identical everywhere.",
        "The same transformation powers far more than order feeds: the latest balance per account, the latest location per driver, the latest price per product, the latest scan per parcel. Wherever an append-only stream meets a current-state question, keep-latest is the hinge — which is why warehouse loading jobs (building current-day snapshots, deduplicating retry storms, picking the latest rate) all run some version of it hourly. Interviewers love it for the same reason: it looks trivial until the tie shows up.",
      ],
      worked: [
        "Take a mini feed where one order logs three events: id 10 placed at 09:00:00, id 11 packed at 09:00:00, id 12 shipped the next morning at 08:30:00.",
        "Shipped's timestamp is strictly the newest, so it wins outright — the tie never comes into play.",
        "Now hide the shipped event: packed and placed share 09:00:00, so the rule falls to the second key and 11 beats 10 — packed is the latest.",
        "Ranking by the id alone would agree here by luck, but the seed's backfill rows prove the point: a higher id with an OLDER timestamp must lose to the newer timestamp.",
      ],
      glossary: [
        { term: "status feed", def: "append-only event stream where each row records one state change of a business object" },
        { term: "dedupe", def: "collapsing many rows per key down to exactly one chosen row" },
        { term: "ROW_NUMBER", def: "window function stamping 1, 2, 3 within each partition under a given order" },
        { term: "tiebreak", def: "the second sort key that decides winners when the first key ties" },
        { term: "lexicographic pair", def: "comparison that reads (a, b) tuples like dictionary words — first a, then b" },
        { term: "bare-column quirk", def: "SQLite behavior where a GROUP BY bare column takes an arbitrary row's value when the lone MAX or MIN is tied" },
      ],
      reallife: [
        "At a ride-hailing or delivery platform the order-status feed is one of the highest-volume tables in the warehouse, and the operations dashboard reads its keep-latest view every few minutes. The transformation usually lives in the load job that materializes a current-state table from the raw stream, and a wrong tiebreak there propagates into every downstream metric — live order counts, courier supply, delivery ETAs. When support escalates an order whose dashboard state looks impossible, the first suspect is a dedupe that picked the wrong event.",
        "What breaks in practice is exactly this seed's traps: retries that stamp two events in the same second, backfills that insert yesterday's event after today's, and hand-written GROUP BY queries that pair the max timestamp with whatever status the engine feels like. The decisions downstream are real — payments reconcile against the paid state, refunds against cancelled — so a one-row mismatch is a support ticket with money attached. Teams that pin the (timestamp, id) rule in one shared view never argue about it again; teams that do not, do.",
      ],
      where: "Analytics engineers and backend-leaning data scientists own this pattern daily, and SQL screens at Uber, Airbnb, Lyft and DoorDash hand candidates an append-only feed asking for exactly one current row per key.",
    },
    breakdown: [
      "A status feed is append-only: writers add rows, nothing is updated in place, so an order's history is a pile of events and the dashboard must reconstruct the present from the pile. The naive read — GROUP BY order_id with MAX(updated_at) — gets the timestamp right and then asks the engine to guess which status pairs with it, and SQLite answers with a bare column from an arbitrary row: on this seed order 102's tie pairs the max stamp with paid instead of shipped. One row per order is easy; one row per order with the RIGHT status is the actual problem.",
      "The pinned rule reads latest as a lexicographic pair: compare updated_at first, and only on an exact tie compare event_id, higher wins. Event ids are assigned by the writer at insert time, so among rows stamped with the same second the higher id is genuinely the later writer — that is why the tiebreak is honest rather than arbitrary. Insertion order itself is useless: order 103's backfill (event 9, placed at 09:00 the day before) arrived after the shipped event but describes an older moment, so ranking must run on the timestamp.",
      "The safe shape is rank-then-filter: ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC, event_id DESC) numbers every event within its order newest-first, and rn = 1 is exactly the pinned winner. Filtering rn = 1 keeps one row per partition — six partitions, six rows — and ORDER BY order_id ships them in key order. Every alternative that skips the explicit tiebreak (bare-column GROUP BY, ranking by id alone, ascending sorts) fails a different one of the seed's planted rows.",
    ],
    edges: [
      "GROUP BY order_id with a bare status and MAX(updated_at) pairs the max stamp with an arbitrary tied row: this engine pins order 102 as (102, paid, 2026-09-02 11:30:00) instead of shipped — the other five orders only look right because their max timestamp is unique. Verified in the real engine before pinning.",
      "Break the tie by the LOWER event_id (event_id ASC) and order 102 flips to paid (event 3) — one wrong row, no error, just a silently older truth.",
      "Rank by event_id DESC instead of updated_at and exactly two orders flip to their backfilled rows: 102 reads placed 2026-09-01 16:45:00 (event 8) and 103 reads placed 2026-09-01 09:00:00 (event 9).",
      "Sort ascending instead of descending and five of six orders report their EARLIEST event — 101 placed 09:15:00, 102 placed 2026-09-01 16:45:00, 103 placed 09:00:00, 104 placed 10:10:00, 106 paid 09:00:00 — only the single-event order 105 survives.",
    ],
    ladder: [
      { title: "Brute force — eyeball the feed", body: "Pull every event for one order, sort by timestamp, read the top row, repeat per order. Six orders is a coffee break; six million is why the pattern exists, and the hand version has no answer for ties at all." },
      { title: "The pattern — rank, then keep rn 1", body: "ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC, event_id DESC) stamps every event, and WHERE rn = 1 keeps the winner per partition. One statement, deterministic ties, one row per key." },
      { title: "The optimal idea — latest is a two-key contract", body: "O(n log n) over the n events — one sort per partition — and the durable rules: rank by the timestamp with the id as tiebreak, never pair a bare column with an aggregate, never trust insertion order. State the tiebreak out loud in an interview; the probe proves it changes the answer." },
    ],
    approach: "ROW_NUMBER ranked CTE over (PARTITION BY order_id ORDER BY updated_at DESC, event_id DESC), filter rn = 1, ORDER BY order_id",
    schema: {
      ddl: `CREATE TABLE status_feed (
  event_id   INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL,
  status     TEXT NOT NULL,
  updated_at TEXT NOT NULL      -- 'YYYY-MM-DD HH:MM:SS'
);`,
      seed: `-- 6 orders, 13 events, appended in event_id order (ids are the writer's clock).
-- Order 102 carries the TIE: events 3 and 4 share 2026-09-02 11:30:00, and the
-- higher id 4 is the later writer. Order 103 carries the backfill: event 9 is
-- inserted AFTER event 6 but stamps an EARLIER moment. Order 105 has one event.
INSERT INTO status_feed (event_id, order_id, status, updated_at) VALUES
  (1,  101, 'placed',    '2026-09-02 09:15:00'),
  (2,  101, 'paid',      '2026-09-02 10:40:00'),
  (3,  102, 'paid',      '2026-09-02 11:30:00'),
  (4,  102, 'shipped',   '2026-09-02 11:30:00'),  -- TIE with event 3 — id 4 wins
  (5,  101, 'shipped',   '2026-09-03 08:05:00'),
  (6,  103, 'shipped',   '2026-09-02 14:20:00'),
  (7,  104, 'placed',    '2026-09-03 10:10:00'),
  (8,  102, 'placed',    '2026-09-01 16:45:00'),
  (9,  103, 'placed',    '2026-09-01 09:00:00'),  -- backfill: older moment, later id
  (10, 104, 'cancelled', '2026-09-04 09:30:00'),
  (11, 105, 'placed',    '2026-09-04 12:00:00'),
  (12, 106, 'paid',      '2026-09-05 09:00:00'),
  (13, 106, 'delivered', '2026-09-05 17:25:00');`,
      tables: [
        { name: "status_feed", note: "13 events across 6 orders — order 102 carries the timestamp tie (events 3 and 4), order 103 the out-of-order backfill (event 9), order 105 the single event" },
      ],
    },
    code: `WITH ranked AS (
    -- one number per event: rank by the PINNED pair — newest timestamp first,
    -- and on a timestamp tie the HIGHER event_id is the later writer
    SELECT
        order_id,
        status,
        updated_at,
        ROW_NUMBER() OVER (
            PARTITION BY order_id
            ORDER BY updated_at DESC, event_id DESC
        ) AS rn
    FROM status_feed
)
SELECT order_id, status, updated_at
FROM ranked
WHERE rn = 1              -- exactly the latest (updated_at, event_id) pair per order
ORDER BY order_id ASC;`,
    walkthrough: [
      "The ranked CTE stamps one number per event: ROW_NUMBER partitions by order_id and sorts by updated_at descending with event_id descending as the pinned tiebreak. Walking the seed: order 101's three events sort shipped (09-03 08:05) ahead of paid (09-02 10:40) ahead of placed (09-02 09:15), so shipped takes rn 1 outright. Order 102's two 11:30:00 stamps tie, and the second key reads 4 before 3 — shipped takes rn 1 and paid takes rn 2. Order 103 sorts by timestamp, not arrival: shipped (09-02 14:20, event 6) outranks the backfilled placed (09-01 09:00, event 9) no matter which row the feed stored later.",
      "The WHERE rn = 1 keeps exactly one row per partition and ORDER BY order_id ships them in key order: 101 shipped 2026-09-03 08:05:00, 102 shipped 2026-09-02 11:30:00, 103 shipped 2026-09-02 14:20:00, 104 cancelled 2026-09-04 09:30:00, 105 placed 2026-09-04 12:00:00 and 106 delivered 2026-09-05 17:25:00. Six partitions in, six rows out — order 105 proves the shape survives a single-event partition. Every output cell comes straight from one real event row; nothing is aggregated or invented.",
      "The alternative shapes are the traps this seed was built to catch: SELECT order_id, status, MAX(updated_at) with GROUP BY order_id asks SQLite to pair a bare column with an aggregate, and on order 102's tie the engine answers paid — verified in this engine, pinned in the edges. Ranking by event_id alone flips orders 102 and 103 to their backfilled placed rows, and an ascending sort ships every order's first event instead of its last. The ranked-then-filter shape is the only one where the tiebreak is explicit, deterministic and pinned.",
    ],
    time: "O(n log n) over the n events — one sort per partition for the ROW_NUMBER ranking",
    space: "O(n) — the ranked CTE holds one row per event before the rn = 1 filter",
    followUps: [
      "The dashboard also wants the PREVIOUS status beside the latest — which window trick (LAG over the ranked rows, or keeping rn = 2 beside rn = 1) stays one statement, and what does the previous row read for the tie order?",
      "A feed can regress — cancelled events arriving after delivered ones. Should the dedupe still read the latest event, or the latest TERMINAL status? Re-state the ranking rule and check what changes on order 104.",
    ],
    related: ["fx-exposure-report", "credit-utilization-bands", "duplicate-charge-pairs"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "null-blank-audit",
    statement:
      "Before a dashboard goes live its owner runs the data-quality sweep: how bad is this table, and does it pass the gate? The customers_raw table holds (customer_id, email, phone, city, updated_at) and is seeded with genuine NULLs, empty strings, whitespace strings and valid values. Write ONE audit row — total_rows, null_emails, blank_emails, null_phone, blank_phone, null_city, stale_rows, pass. PINNED: blank = the cell is present (NOT NULL) AND TRIM of it equals the empty string, so NULL and blank count in separate buckets. PINNED: stale = updated_at < '2026-09-01' (strict) read against the as-of date '2026-09-30', and pass = 1 only when null_emails + blank_emails + null_phone + blank_phone + null_city all read zero AND stale_rows reads zero, else 0.",
    examples: [
      {
        input:
          "the whole customers_raw table: 8 rows seeded with genuine NULLs (rows 2 and 6), an empty-string email (row 3), whitespace email and phone (rows 4 and 5), a stale-but-valid row (7) and a clean boundary row (8) at exactly 2026-09-01",
        output: "8 · 1 · 2 · 1 · 1 · 1 · 1 · 0",
        explanation:
          "total_rows 8; null_emails 1 (row 2); blank_emails 2 (rows 3 and 4); null_phone 1 and blank_phone 1 (rows 6 and 5); null_city 1 (row 6); stale_rows 1 (row 7) — and the gate sums the five null-or-blank buckets to 6, so pass reads 0.",
      },
      {
        input:
          "row 4 stores email as three spaces with phone 555-0104; row 2 stores email NULL with phone 555-0102",
        output: "blank_emails 2 · null_emails 1",
        explanation:
          "Three spaces TRIM to the empty string, so row 4 lands in blank_emails beside row 3's empty string; row 2's NULL is a missing value in a different bucket — counting it as blank would print 3 and break the gate.",
      },
    ],
    constraints: [
      "PINNED blank predicate: blank = col IS NOT NULL AND TRIM(col) = '' — NULL and blank are separate buckets and a NULL never counts as blank",
      "PINNED freshness: stale = updated_at < '2026-09-01' (strict) against the as-of date '2026-09-30'; the boundary row at exactly 2026-09-01 is fresh",
      "PINNED gate: pass = 1 when null_emails + blank_emails + null_phone + blank_phone + null_city = 0 AND stale_rows = 0, else 0",
      "ONE row total — no GROUP BY split; every output cell is an INTEGER count and the row ships even when every count reads 0",
    ],
    primer: {
      hook: "Every dashboard owner learns the same lesson once: the number was wrong because the data was wrong, and a five-minute audit query would have caught it before the meeting.",
      concept: [
        "A data-quality audit is a checklist run against a table before anyone trusts what the table says. The checklist is mechanical: how many rows, how many missing values, how many values that are present but empty, how old is the newest data. Each check produces a count, and the counts roll up into one verdict — pass or fail. That verdict is a gate: dashboards, models and finance reports either ship or get held.",
        "The audit's sharpest distinction is NULL versus blank, because they are different defects with different fixes. NULL means the value was never collected — the field was skipped or the source system did not have it; blank means the value WAS collected but holds nothing visible — an empty string, a stray tab, three spaces someone typed to get past a required field. TRIM strips whitespace, so a blank is defined as a present cell whose TRIM is the empty string; the present part matters, because a NULL has no TRIM at all and must not leak into the blank count. Two buckets, two owners, two fixes.",
        "Freshness is the third axis: even a complete table is worthless if it is stale. Audits compare update timestamps against a cutoff — here, anything older than 2026-09-01 is stale relative to the as-of date 2026-09-30 — and the compare is strict, so a row stamped exactly on the cutoff counts as fresh. Conventions like that are arbitrary but must be pinned, because one day of drift changes the verdict.",
        "The pass gate turns seven counts into one bit, and the honest gates are all-or-nothing: any single NULL email, blank phone or stale row fails the table. That severity is deliberate — downstream joins silently drop NULL keys and silently miscount blanks, so a table that is 95 percent clean is not 95 percent useful. Modern tooling such as dbt tests packages exactly these checks; the SQL behind them is the one you write here.",
      ],
      worked: [
        "Take a mini table of three rows: r1 email ada@x with phone 555, r2 email NULL with phone three spaces, r3 email three spaces with phone NULL.",
        "NULL buckets ask the cell itself: null_emails 1 (r2) and null_phone 1 (r3).",
        "Blank buckets ask present cells that trim to nothing: blank_emails 1 (r3) and blank_phone 1 (r2) — the NULLs stay out of the blank buckets.",
        "Freshness: r1 updated 2026-09-05, r2 2026-08-20, r3 2026-09-01 — against the strict cutoff 2026-09-01, only r2 is stale.",
        "Gate: 1 + 1 + 1 + 1 problems with 1 stale row, so pass 0 — and the fix list is already written: backfill r2's email, reject r3's spaces.",
      ],
      glossary: [
        { term: "data-quality audit", def: "a fixed set of counts and a verdict that decide whether a table is safe to read" },
        { term: "NULL", def: "a missing value — the field exists but no value was ever stored in it" },
        { term: "blank string", def: "a present value made of nothing visible — an empty string or pure whitespace" },
        { term: "TRIM", def: "the function that strips leading and trailing whitespace so blanks reveal themselves" },
        { term: "freshness", def: "how recently a table's rows were updated relative to a pinned cutoff date" },
        { term: "pass gate", def: "the all-or-nothing rule that turns the audit counts into a single 1 or 0 verdict" },
      ],
      reallife: [
        "At a streaming platform or a subscription business, the customers table feeds billing, recommendations and lifecycle email, and an analytics engineer owns its quality checks the way a controller owns the books. The checks run on schedule — nightly loads trigger the audit, and a failing gate pages before the morning dashboards do. The counts are not trivia: null_phone spikes mean a signup form regression, blank_email spikes mean a partner feed is padding fields, and a stale updated_at column means the ingestion job died silently.",
        "What breaks is the convention, not the SQL: one team counts NULL as blank and suddenly two dashboards disagree about how many emails exist, while another team compares freshness inclusively and a boundary day of dead data sails through. The decisions the audit drives are loud — hold the finance export, block the model retrain, reopen the intake form — and every one of them depends on the buckets being pinned and disjoint. Hand-rolled or tool-generated, the checks here are the same seven numbers.",
      ],
      where: "Analytics engineers, data-quality engineers and BI developers run these pre-flight checks daily, and interviews at Netflix, Spotify and Uber hand candidates exactly this null-versus-blank audit shape.",
    },
    breakdown: [
      "Nulls and blanks are two different diseases. A NULL email was never collected — the field is missing — while an empty or whitespace email was collected wrong; the fixes differ (backfill the source versus reject at the form), so the audit counts them in separate buckets. The pinned blank predicate is col IS NOT NULL AND TRIM(col) = '': present, and made of nothing but whitespace.",
      "Freshness is a strict compare against the pinned cutoff: updated_at < '2026-09-01' marks a row stale, and the boundary row at exactly 2026-09-01 is planted fresh to catch the <= variant. The pass gate is all-or-nothing — five null-or-blank buckets (null and blank email, null and blank phone, null city) must all read zero AND stale_rows must read zero — so a single dirty cell sinks the whole table. On this seed the buckets sum to 6, so pass reads 0.",
      "The SQL is one aggregate pass with no GROUP BY: seven conditional SUM(CASE) expressions over the whole table, wrapped in a CTE so the gate can recompute the five bucket sums without a second scan. The predicates are disjoint by construction — email IS NULL and email IS NOT NULL AND TRIM(email) = '' can never both fire — so no row counts twice. Exactly one row ships and every cell is an INTEGER count; this family has no REAL and no money.",
    ],
    edges: [
      "Count NULL as blank (COALESCE(TRIM(email), '') = '' with no NOT NULL guard) and blank_emails reads 3 instead of 2 while blank_phone reads 2 instead of 1 — the same row counted in two buckets.",
      "Forget TRIM and compare email = '' alone and blank_emails reads 1 instead of 2 (blank_phone 0 instead of 1) — whitespace rows slip the net.",
      "Compare freshness with <= instead of < and stale_rows reads 2 instead of 1 — the boundary row at exactly 2026-09-01 exists to catch this.",
      "Write the blank check as TRIM(email) = '' with no COALESCE and this seed HAPPENS TO AGREE (blank_emails 2, blank_phone 1) because NULL = '' is never true — the pinned IS NOT NULL guard is what stops the COALESCE variant from double-counting, and that variant is the one to fear.",
    ],
    ladder: [
      { title: "Brute force — eyeball every cell", body: "Open the table, walk column by column, tally NULLs and blanks on paper, then check dates by hand. The tally is exactly seven numbers, which is why the audit automates so cleanly." },
      { title: "The pattern — one pass, conditional counts", body: "SUM(CASE WHEN) turns each quality rule into one aggregate over the whole table, and a CTE lets the pass gate reuse the five bucket sums. No GROUP BY means exactly one row leaves the query." },
      { title: "The optimal idea — buckets that cannot overlap", body: "O(n) — one scan, predicates disjoint by construction (IS NOT NULL on the blank side, IS NULL on the other), strict freshness compare, gate recomputed from the same sums. The durable rules: NULL and blank are different defects, boundaries compare strictly, and the gate is all-or-nothing." },
    ],
    approach: "one GROUP-less aggregate pass of disjoint conditional SUMs (null and blank buckets), strict stale compare against the pinned cutoff, CTE feeds the all-or-nothing pass gate",
    schema: {
      ddl: `CREATE TABLE customers_raw (
  customer_id INTEGER PRIMARY KEY,
  email       TEXT,              -- genuine NULLs, empty strings and whitespace strings
  phone       TEXT,
  city        TEXT,
  updated_at  TEXT NOT NULL      -- 'YYYY-MM-DD'
);`,
      seed: `-- 8 rows planted to cover every bucket: genuine NULLs (rows 2 and 6), an
-- empty-string email (row 3), whitespace email and phone (rows 4 and 5), a
-- stale-but-valid row (7) and the fresh boundary row (8) at exactly 2026-09-01
-- (must NOT count as stale under the strict compare).
INSERT INTO customers_raw (customer_id, email, phone, city, updated_at) VALUES
  (1, 'ada@example.com',   '555-0101', 'Lisbon',  '2026-09-02'),
  (2, NULL,                '555-0102', 'Porto',   '2026-09-03'),
  (3, '',                  '555-0103', 'Faro',    '2026-09-04'),
  (4, '   ',               '555-0104', 'Braga',   '2026-09-05'),
  (5, 'grace@example.com', '   ',      'Coimbra', '2026-09-06'),
  (6, 'linus@example.com', NULL,       NULL,      '2026-09-07'),
  (7, 'hedy@example.com',  '555-0107', 'Aveiro',  '2026-08-15'),
  (8, 'kim@example.com',   '555-0108', 'Setubal', '2026-09-01');`,
      tables: [
        { name: "customers_raw", note: "8 rows — genuine NULLs (rows 2 and 6), empty and whitespace strings (rows 3, 4 and 5), a stale row (7) and the fresh boundary row (8) at exactly 2026-09-01" },
      ],
    },
    code: `WITH audit AS (
    -- one GROUP-less pass over the whole table — the null and blank buckets are
    -- DISJOINT by construction (IS NOT NULL guards the blank side)
    SELECT
        COUNT(*) AS total_rows,
        SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) AS null_emails,
        SUM(CASE WHEN email IS NOT NULL AND TRIM(email) = '' THEN 1 ELSE 0 END) AS blank_emails,
        SUM(CASE WHEN phone IS NULL THEN 1 ELSE 0 END) AS null_phone,
        SUM(CASE WHEN phone IS NOT NULL AND TRIM(phone) = '' THEN 1 ELSE 0 END) AS blank_phone,
        SUM(CASE WHEN city IS NULL THEN 1 ELSE 0 END) AS null_city,
        -- strict compare: the boundary row at exactly 2026-09-01 stays fresh
        SUM(CASE WHEN updated_at < '2026-09-01' THEN 1 ELSE 0 END) AS stale_rows
    FROM customers_raw
)
SELECT
    total_rows,
    null_emails,
    blank_emails,
    null_phone,
    blank_phone,
    null_city,
    stale_rows,
    -- the gate: all five null-or-blank buckets empty AND nothing stale
    CASE WHEN null_emails + blank_emails + null_phone + blank_phone + null_city = 0
              AND stale_rows = 0 THEN 1 ELSE 0 END AS pass
FROM audit;`,
    walkthrough: [
      "The audit CTE aggregates the whole table in one pass — no GROUP BY, so exactly one row leaves it. The NULL buckets count cells that are missing outright: email on row 2, phone and city on row 6. The blank buckets count cells that are present and trim to nothing: email rows 3 (empty string) and 4 (three spaces), phone row 5 (three spaces). The predicates are disjoint by construction — email IS NULL and email IS NOT NULL AND TRIM(email) = '' can never both fire — so no row lands in two buckets.",
      "The stale bucket is a strict string compare: row 7 at 2026-08-15 is below the cutoff and counts, while row 8 at exactly 2026-09-01 does not. Row 2 is the only NULL email and row 6 is the only row carrying two missing cells, so every bucket traces to named rows. The counts land at total_rows 8, null_emails 1, blank_emails 2, null_phone 1, blank_phone 1, null_city 1 and stale_rows 1 — seven numbers, nothing estimated.",
      "The gate recomputes the five null-or-blank sums inside the CASE: 1 + 2 + 1 + 1 + 1 = 6, so pass reads 0 no matter how the stale compare lands. The engine ships the single row 8, 1, 2, 1, 1, 1, 1, 0, every cell an INTEGER — this dive has no REAL and no money. A positive-control check (delete rows 2 through 7, leave the two clean rows) makes the same query print 2, 0, 0, 0, 0, 0, 0, 1 — the gate's pass branch is real and reachable, just not on the dirty seed.",
    ],
    time: "O(n) — one linear scan with seven conditional aggregates over the n rows",
    space: "O(1) — the audit CTE collapses the whole table into a single row",
    followUps: [
      "Add a per-column pass bit beside the overall gate — how does the CTE reshape when the contract wants one verdict per bucket, and which buckets fail on this seed?",
      "Freshness here is table-level; extend the audit to per-customer staleness and report the stale customer_ids — which aggregate becomes a window function, and does the gate survive?",
    ],
    related: ["trial-balance-check", "gl-reconciliation", "journal-gap-detection"],
    order: "any",
    xp: 10,
  },
  {
    slug: "point-in-time-asof",
    statement:
      "Reports get rebuilt: a stakeholder asks what the dashboard said LAST month, and the dimension behind it has since changed. The dim_customers table is a type-2 slowly changing dimension — one row per attribute version (customer_id, city, valid_from, valid_to, is_current) — where valid_from is inclusive, valid_to is EXCLUSIVE (the half-open [valid_from, valid_to) convention, PINNED) and the current row carries the far-future sentinel '9999-12-31' with is_current 1. Rebuild the report AS OF the PINNED date '2026-07-15': report customer_id, city_asof, valid_from and valid_to for the version whose window contains the as-of date — valid_from <= '2026-07-15' AND '2026-07-15' < valid_to. One row per customer, ORDER BY customer_id ascending.",
    examples: [
      {
        input:
          "customer 202 lived in Madrid from 2026-01-01 until 2026-09-01 and in Barcelona from 2026-09-01 on; the as-of is 2026-07-15",
        output: "202 · Madrid · 2026-01-01 · 2026-09-01",
        explanation:
          "Madrid's window [2026-01-01, 2026-09-01) contains the as-of; Barcelona only starts 09-01, so the current flag's favorite is a decoy — the report must show what stood THEN.",
      },
      {
        input:
          "customer 204's Munich row ends exactly at valid_to 2026-07-15 and the Stuttgart row starts exactly at valid_from 2026-07-15",
        output: "204 · Stuttgart · 2026-07-15 · 9999-12-31",
        explanation:
          "The seam date belongs to the NEW row only: valid_to is exclusive so Munich's window excludes 07-15, while valid_from is inclusive so Stuttgart's includes it — BETWEEN would wrongly keep Munich too.",
      },
    ],
    constraints: [
      "PINNED as-of date: '2026-07-15'; PINNED convention: validity windows are half-open [valid_from, valid_to) — valid_from inclusive, valid_to EXCLUSIVE; the match predicate is valid_from <= '2026-07-15' AND '2026-07-15' < valid_to",
      "PINNED sentinel: the current row carries valid_to '9999-12-31' and is_current 1 — as-of reads match on the window, never on is_current",
      "one row per customer whose window contains the as-of (5 customers), columns customer_id, city_asof, valid_from, valid_to; ORDER BY customer_id ASC",
      "date columns are 'YYYY-MM-DD' strings and compare correctly as strings; no date functions are needed",
    ],
    primer: {
      hook: "Every table that changes quietly rewrites history unless an engineer builds the one table that remembers — the type-2 dimension — and the as-of query is how you read it.",
      concept: [
        "Dimensions — the customer table, the store table, the product table — look constant but never are: customers move cities, products change categories, stores get remodeled. Overwrite the row and every old report silently re-reads the NEW value as if it had always been true; last quarter's numbers shift under your feet. The fix is to stop overwriting and start versioning: when an attribute changes, close the old row, open a new one, and keep both.",
        "The versioned layout is called a slowly changing dimension of type 2, or SCD2. Each row carries a validity window: valid_from says when this version started (inclusive), valid_to says when it ended (exclusive — the half-open [valid_from, valid_to) convention), and the still-current version carries a far-future sentinel like 9999-12-31 so that every row has a comparable end. Half-open is not pedantry: at a seam date the old window is already false and the new one already true, so exactly one version matches any instant and no special cases are ever needed.",
        "An as-of query rebuilds the past: give it a date and it returns each key's attribute AS THE WINDOWS SAY, not as the current flag says. The flag is_current answers only NOW — filter on it and you read today, no matter which date you claim to reconstruct. The window predicate answers THEN, and it is always the same two comparisons: started on or before the date, and not ended before it.",
        "The same predicate scales up to the hardest version of the question — joining facts to history. An order placed on some date should be attributed to the customer's city AS OF that order's date, which is the same two comparisons with the order date in place of the pinned as-of. Once the convention is in your hands, point-in-time reads stop being scary and start being mechanical.",
      ],
      worked: [
        "Give one customer two versions: Hamburg valid from 2026-03-01 to 2026-08-01, and Berlin from 2026-08-01 to the sentinel 9999-12-31.",
        "As-of 2026-07-15: Hamburg's window contains it (03-01 <= 07-15 and 07-15 < 08-01), so the answer is Hamburg.",
        "Berlin fails the first comparison — it had not started — so tomorrow's truth stays out of yesterday's report.",
        "Move the as-of to exactly 2026-08-01 and the roles flip: 08-01 < 08-01 is false so Hamburg is closed, while 08-01 <= 08-01 admits Berlin — the seam date belongs to the new version, always.",
      ],
      glossary: [
        { term: "slowly changing dimension (SCD2)", def: "a dimension stored as versions, one row per period an attribute value was true" },
        { term: "validity window", def: "the half-open date range [valid_from, valid_to) during which a version was the truth" },
        { term: "half-open interval", def: "a range that includes its start and excludes its end, so adjacent ranges never overlap" },
        { term: "as-of query", def: "a read that reconstructs every attribute as it stood on a given past date" },
        { term: "sentinel", def: "the far-future end date 9999-12-31 that marks the still-current version" },
        { term: "point-in-time correctness", def: "the guarantee that a rebuilt report matches what was actually known on its date" },
      ],
      reallife: [
        "At a marketplace or delivery platform, city and address dimensions feed courier routing, pricing zones and tax reporting, and an analytics engineer owns the SCD2 build while every analyst owns the as-of reads. The quarterly restatement is the ritual: finance asks what the books said on the close date, and only a windowed dimension can answer without a time machine. Teams that skip SCD2 and overwrite instead discover the cost later — last quarter's cohort report re-reads this quarter's cities and nothing reconciles.",
        "What breaks is convention drift: one pipeline stores NULL instead of the sentinel and every valid_to > date read loses its current rows, another writer uses BETWEEN and seam dates double-count two versions, and a third filters is_current for an as-of question and ships today's world into last month's report. The decisions downstream are structural — tax filings, zone pricing, cohort definitions — so a one-day seam error is a reconciliation meeting. Pinning the half-open rule in one shared view is the cheapest insurance in the warehouse.",
      ],
      where: "Analytics engineers build these dimensions and the analysts querying them read them, and SQL screens at Airbnb, DoorDash, Lyft and Booking ask candidates to reconstruct a past state from versioned rows.",
    },
    breakdown: [
      "A type-2 dimension stores history as versions: when an attribute changes, the old row is closed (valid_to stamped) and a new row opens (valid_from stamped), so the table is a set of half-open windows [valid_from, valid_to). Half-open is what makes the seams unambiguous: at the seam date the old window is already false (its valid_to is exclusive) and the new window is already true (its valid_from is inclusive) — exactly one row can match any instant. The current row is just the window whose valid_to is the far-future sentinel '9999-12-31'.",
      "An as-of read must ignore is_current entirely: the flag answers NOW, the window predicate answers THEN, and they disagree the moment history is involved. Customer 202 is the decoy — the current flag says Barcelona, but on 2026-07-15 the truth was Madrid, whose window ends 2026-09-01. The two seam customers pin the convention: 203's only row starts exactly on the as-of (inclusive valid_from lets it in) and 204's Munich row ends exactly on it (exclusive valid_to keeps it out).",
      "The query is one WHERE with two comparisons and nothing else: valid_from <= '2026-07-15' AND '2026-07-15' < valid_to. No date function runs — 'YYYY-MM-DD' strings compare correctly — and the sentinel is never special-cased, which is why the same predicate keeps working for any as-of date, past or future. The classic wrong reads are BETWEEN (re-opens the closed Munich row: 6 rows), a match by customer_id alone (every version ships: 8 rows) and filtering is_current = 1 (reads today: 202 flips to Barcelona).",
    ],
    edges: [
      "Swap the half-open predicate for BETWEEN (both ends inclusive) and 6 rows ship instead of 5 — the closed Munich row (204, Munich, 2026-02-01, 2026-07-15) returns beside Stuttgart.",
      "Store NULL instead of the sentinel on current rows and read valid_to > as-of, and NULL semantics kill every current row: only (202, Madrid, 2026-01-01, 2026-09-01) survives — 1 row instead of 5. The pinned sentinel is load-bearing.",
      "Filter is_current = 1 and the read answers TODAY: customer 202 flips to (202, Barcelona, 2026-09-01, 9999-12-31), the decoy the seed plants.",
      "Match the dimension by customer_id alone with no window predicate and every version ships — 8 rows instead of 5.",
    ],
    ladder: [
      { title: "Brute force — walk the versions by hand", body: "For each customer, list their windows on paper, find the one containing the as-of date, copy its city. Five customers is fine; a quarter of rebuilt reports makes the two-comparison predicate the only sane tool." },
      { title: "The pattern — two comparisons, no special cases", body: "WHERE valid_from <= as-of AND as-of < valid_to — inclusive start, exclusive end — matches at most one version per customer when the windows are well-formed. The sentinel makes the current row an ordinary interval, so no OR and no is_current anywhere." },
      { title: "The optimal idea — half-open seams and a total order", body: "O(n) for the filtered scan, O(log n) per customer with an index on (customer_id, valid_from), and the durable rules: never BETWEEN on validity windows, never filter is_current for as-of reads, keep the sentinel so every row has a comparable valid_to. Half-open is what lets a seam date belong to exactly one version." },
    ],
    approach: "half-open window predicate valid_from <= '2026-07-15' AND '2026-07-15' < valid_to on dim_customers, sentinel keeps the current row an ordinary interval, ORDER BY customer_id",
    schema: {
      ddl: `CREATE TABLE dim_customers (
  customer_id INTEGER NOT NULL,
  city        TEXT NOT NULL,
  valid_from  TEXT NOT NULL,     -- inclusive start of this version
  valid_to    TEXT NOT NULL,     -- EXCLUSIVE end — '9999-12-31' sentinel on the current row
  is_current  INTEGER NOT NULL,  -- 1 on the current version, 0 otherwise
  PRIMARY KEY (customer_id, valid_from)
);`,
      seed: `-- 5 customers, 8 version rows. Half-open windows [valid_from, valid_to): the
-- current row carries the sentinel 9999-12-31 and is_current 1. Customer 203
-- opens exactly on the as-of (inclusive start) and customer 204 closes exactly
-- on it (exclusive end) — the seam pair that decides the convention.
INSERT INTO dim_customers (customer_id, city, valid_from, valid_to, is_current) VALUES
  (201, 'Lisbon',    '2026-01-01', '2026-03-01', 0),
  (201, 'Porto',     '2026-03-01', '9999-12-31', 1),
  (202, 'Madrid',    '2026-01-01', '2026-09-01', 0),
  (202, 'Barcelona', '2026-09-01', '9999-12-31', 1),  -- decoy: starts AFTER the as-of
  (203, 'Berlin',    '2026-07-15', '9999-12-31', 1),  -- valid_from == as-of, counts
  (204, 'Munich',    '2026-02-01', '2026-07-15', 0),  -- valid_to == as-of, excluded
  (204, 'Stuttgart', '2026-07-15', '9999-12-31', 1),
  (205, 'Vienna',    '2026-01-01', '9999-12-31', 1);`,
      tables: [
        { name: "dim_customers", note: "8 version rows across 5 customers — customers 203 and 204 carry the seam edges at exactly the as-of date 2026-07-15" },
      ],
    },
    code: `SELECT
    customer_id,
    city AS city_asof,
    valid_from,
    valid_to
FROM dim_customers
WHERE valid_from <= '2026-07-15'   -- the version had started by the as-of (inclusive)
  AND '2026-07-15' < valid_to      -- and had not ended yet (valid_to EXCLUSIVE —
                                   -- the '9999-12-31' sentinel is just a far-future end)
ORDER BY customer_id ASC;`,
    walkthrough: [
      "The predicate does all the work: a version matches when it had already started (valid_from <= 2026-07-15) and had not yet ended (2026-07-15 < valid_to, strict because valid_to is exclusive). Walking the seed: customer 201's Lisbon row ended 2026-03-01, before the as-of, so Porto's window [2026-03-01, 9999-12-31) contains it; customer 202's Barcelona row starts 2026-09-01, after the as-of, so Madrid's window [2026-01-01, 2026-09-01) is the match — the current flag's favorite never enters the read. Neither customer needed the is_current flag at any point: the windows alone settle both.",
      "The seam customers decide the convention: customer 203's only row starts exactly 2026-07-15, and the inclusive valid_from lets it in; customer 204's Munich row ends exactly 2026-07-15, and the exclusive valid_to keeps it out while Stuttgart's row starts exactly on the date and matches. Customer 205's single long-lived window [2026-01-01, 9999-12-31) trivially contains the as-of. Every customer matches exactly one row because the windows are half-open — a closed-world guarantee BETWEEN would break.",
      "Five rows ship in customer order: 201 Porto 2026-03-01 to 9999-12-31, 202 Madrid 2026-01-01 to 2026-09-01, 203 Berlin 2026-07-15 to 9999-12-31, 204 Stuttgart 2026-07-15 to 9999-12-31 and 205 Vienna 2026-01-01 to 9999-12-31. The alias city_asof keeps the output self-describing: the cell is the city as it stood, not the city as it stands. No date function ran anywhere — 'YYYY-MM-DD' strings compare correctly — and the sentinel is never special-cased, which is exactly why the same predicate keeps working when the as-of moves to any other day.",
    ],
    time: "O(n) over the n dimension rows for one filtered scan (O(log n) per customer with an index on customer_id, valid_from)",
    space: "O(k) — one output row per customer whose window contains the as-of (k = 5 here)",
    followUps: [
      "Join an orders table to the dimension AS OF each order's own date instead of one global as-of — why does the two-comparison predicate survive the per-row dates while is_current silently corrupts the attribution?",
      "Build the forward twin: for each version, report the date its city stopped being true (LEAD over valid_from, with the sentinel rule on the last row) — where does the half-open convention earn its keep?",
    ],
    related: ["ar-aging-schedule", "dividend-income-calendar", "daily-balance-interest"],
    order: "exact",
    xp: 20,
  },
];
