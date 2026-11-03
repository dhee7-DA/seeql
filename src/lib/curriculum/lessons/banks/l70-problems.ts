// Lesson 70 — cleaning at scale. Verified: 582 clean · 45 quarantined (38 pairs
// + burst 7) · classes 584/26/17 → 539/26/17 · money $32,171.47 both sides ·
// user 5: 145 → 138 · replay classes cart 20 / product 13 / page 12.

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["The clean count", "The staging SELECT in read-only form: one row per fingerprint, keep-first by id. The census predicted 582 — confirm it.", ["ROW_NUMBER() OVER (PARTITION BY fingerprint ORDER BY id) = 1, wrapped in COUNT(*).", "Fingerprint = event_ts, user, canonical action, trimmed page, amount."], "hard",
    `SELECT COUNT(*) AS clean_events
FROM (
  SELECT ROW_NUMBER() OVER (
    PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
    ORDER BY id) AS rn
  FROM events_dirty
) WHERE rn = 1;`,
    [["group\\s+by.*limit", "The window ranks every row in its group — LIMIT would truncate, not dedupe."], ["partition\\s+by\\s+id", "Partitioning by id makes every row its own group — the fingerprint columns are the group."], ["order\\s+by\\s+event_ts", "Keep-first orders by id (arrival), not by timestamp — first ARRIVAL wins."]]],
  ["Build the clean table", "Make it real: CREATE TABLE stg_events holding one canonical row per fingerprint — id, standardized ts, user, canonical action, trimmed page, amount. The verify census must read 582.", ["CREATE TABLE … AS SELECT with ROW_NUMBER = 1; REPLACE(event_ts, ' ', 'T') standardizes in the same pass.", "lower(trim(action)) and trim(page) canonicalize at birth."], "hard",
    `CREATE TABLE stg_events AS
SELECT id,
       REPLACE(event_ts, ' ', 'T') AS event_ts,
       user_id,
       lower(trim(action)) AS action,
       trim(page) AS page,
       amount_cents
FROM (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
           ORDER BY id) AS rn
  FROM events_dirty
)
WHERE rn = 1;`,
    [["delete.*from\\s+events_dirty", "Never clean in place — raw is the court of appeal; staging derives."], ["order\\s+by\\s+event_ts", "Keep-first is by ARRIVAL (id) — the vendor's first claim wins."]], false,
    `SELECT COUNT(*) AS clean_events FROM stg_events;`, true],
  ["Quarantine the replays", "The other half of the split: CREATE TABLE events_quarantine holding the 45 surplus rows — every replay, kept and countable. Verify: 45.", ["Same ROW_NUMBER build, WHERE rn > 1 — the mirror image of the clean insert.", "Both tables derive from raw; raw itself never changes."], "medium",
    `CREATE TABLE events_quarantine AS
SELECT id, event_ts, user_id, action, page, amount_cents
FROM (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
           ORDER BY id) AS rn
  FROM events_dirty
)
WHERE rn > 1;`,
    [["where\\s+rn\\s*=\\s*1", "That's the clean side — quarantine is the complement (rn > 1)."],
     ["delete.*from\\s+events_dirty", "Exclusion happens in the staging SELECT — raw keeps every row it ever received."]],
    false,
    `SELECT COUNT(*) AS quarantined FROM events_quarantine;`, true],
  ["The replay classes", "Which canonical actions did the 45 surplus rows duplicate? Group the quarantined set by canonical action — the replay burden per feature. (The quarantine is a derivation: rebuild it inline from raw.)", ["The rn > 1 rows of raw, grouped by lower(trim(action)).", "Expected: add_to_cart 20 · product_view 13 · page_view 12 — the burst's 7 ride inside add_to_cart."], "medium",
    `SELECT lower(trim(action)) AS action,
       COUNT(*) AS replays
FROM (
  SELECT id, action
  FROM (
    SELECT id, event_ts, user_id, action, page, amount_cents,
           ROW_NUMBER() OVER (
             PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
             ORDER BY id) AS rn
    FROM events_dirty
  )
  WHERE rn > 1
)
GROUP BY action
ORDER BY replays DESC, action;`,
    [["from\\s+events_quarantine", "The quarantine table only exists inside a sandboxed build — derive it inline from raw; that's the staging pattern's whole point."],
     ["having", "Nothing to filter — classes with zero replays simply don't appear; absence is the answer."]], true],
  ["Flag the classes", "The flagged build: CREATE TABLE stg_events_flagged adding user_class — 'anonymous' (NULL user), 'bot' (id ≥ 900), 'known' (the rest). Verify with the class census: 539 known · 26 anonymous · 17 bot.", ["CASE WHEN user_id IS NULL THEN 'anonymous' WHEN user_id >= 900 THEN 'bot' ELSE 'known' END.", "Same dedupe underneath — flag AFTER keep-first, on the clean set."], "hard",
    `CREATE TABLE stg_events_flagged AS
SELECT id,
       REPLACE(event_ts, ' ', 'T') AS event_ts,
       user_id,
       lower(trim(action)) AS action,
       trim(page) AS page,
       amount_cents,
       CASE WHEN user_id IS NULL THEN 'anonymous'
            WHEN user_id >= 900 THEN 'bot'
            ELSE 'known' END AS user_class
FROM (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
           ORDER BY id) AS rn
  FROM events_dirty
)
WHERE rn = 1;`,
    [["delete.*anonymous|delete.*bot", "Flagged, not filtered — every per-user metric states its population via the flag."],
     ["case.*before.*row_number", "Flag the CLEAN rows — flagging raw would label replays too."]], false,
    `SELECT user_class, COUNT(*) AS events FROM stg_events_flagged
GROUP BY user_class ORDER BY events DESC;`, true],
  ["The class delta", "Known-class rows: 584 raw → 539 clean. The delta is 45 — EXACTLY the quarantine. Prove the arithmetic: both counts and the difference, one row.", ["Two scalar subqueries (raw known, clean known) and the subtraction.", "Clean known = keep-first rows with 0 < user_id < 900."], "medium",
    `SELECT
  (SELECT COUNT(*) FROM events_dirty
     WHERE user_id IS NOT NULL AND user_id < 900) AS raw_known,
  (SELECT COUNT(*) FROM (
     SELECT user_id FROM (
       SELECT id, user_id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn = 1)
   WHERE user_id IS NOT NULL AND user_id < 900) AS clean_known,
  (SELECT COUNT(*) FROM (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn > 1) WHERE id IS NOT NULL) AS quarantined;`,
    [["585|578", "Those were another warehouse's numbers — this log's contract is 584 → 539, delta 45."],
     ["is_current", "Wrong schema — the class arithmetic is fingerprint-based, not SCD-based."]]],
  ["The money gate", "Money preserved: the guarded sum on the CLEAN set must equal the raw baseline — $32,171.47 both sides. One row, two sums.", ["The same CASE-guarded SUM, run twice: once on raw, once on the keep-first set.", "typeof = 'integer' keeps the text rows out on BOTH sides."], "hard",
    `SELECT
  (SELECT SUM(CASE WHEN typeof(amount_cents) = 'integer'
                THEN amount_cents END) FROM events_dirty) AS raw_money_cents,
  (SELECT SUM(CASE WHEN typeof(amount_cents) = 'integer'
                THEN amount_cents END)
     FROM (
       SELECT amount_cents FROM (
         SELECT id, amount_cents, ROW_NUMBER() OVER (
           PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
           ORDER BY id) AS rn
         FROM events_dirty) WHERE rn = 1)
     WHERE typeof(amount_cents) = 'integer') AS clean_money_cents;`,
    [["sum\\(amount_cents\\)", "A bare SUM coerces text into the arithmetic — the gate's whole point is the guarded comparison."],
     ["distinct\\s+amount", "Dedupe is by FINGERPRINT, not by amount — distinct amounts would destroy the count."]]],
  ["The format gate", "Zero non-standard timestamps may ship: in the clean set, count rows where the ts still carries a space. The answer must be 0 — the REPLACE ran on every kept row.", ["Inline the keep-first build; count WHERE event_ts LIKE '% %'.", "The gate is a census, not a fix — the fix ran in the staging SELECT."], "medium",
    `SELECT COUNT(*) AS format_violations
FROM (
  SELECT REPLACE(event_ts, ' ', 'T') AS event_ts
  FROM (
    SELECT id, event_ts, ROW_NUMBER() OVER (
      PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
      ORDER BY id) AS rn
    FROM events_dirty
  ) WHERE rn = 1
) WHERE event_ts LIKE '% %';`,
    [["without.*replace", "Without standardizing first, the gate counts 89 — the gate tests the BUILD, not the raw log."],
     ["update\\s+events_dirty", "Raw is immutable — the gate reads the derived set."]]],
  ["The grain gate", "One row per fingerprint, provable: clean rows (582) must equal distinct fingerprints (582) on the clean set — the staging output's own grain receipt.", ["COUNT(*) over the keep-first set; COUNT(DISTINCT fingerprint) over the same set.", "Equality is the gate; inequality means the window filtered wrong."], "medium",
    `SELECT
  (SELECT COUNT(*) FROM (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn = 1)) AS clean_rows,
  (SELECT COUNT(DISTINCT
       event_ts || '|' || COALESCE(user_id, -1) || '|' ||
       lower(trim(action)) || '|' || trim(page) || '|' || COALESCE(amount_cents, 'none'))
     FROM events_dirty) AS fingerprints;`,
    [["distinct\\s+id", "ids are unique already — the fingerprint is the grain, not the id."],
     ["582\\s*=\\s*582", "Don't hardcode — COMPUTE both sides; the gate is the comparison."]]],
  ["The whale, cleaned", "Top five users in the CLEAN set — the burst's deflation shows: user 5 lands at 138 (was 145 raw). The ledger's first honest ranking.", ["Keep-first rows, non-null sub-900 users, GROUP BY user_id ORDER BY count DESC LIMIT 5.", "Compare with lesson 69's raw ranking — the delta is the burst."], "medium",
    `SELECT user_id, COUNT(*) AS clean_events
FROM (
  SELECT user_id FROM (
    SELECT id, user_id, ROW_NUMBER() OVER (
      PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
      ORDER BY id) AS rn
    FROM events_dirty) WHERE rn = 1
)
WHERE user_id IS NOT NULL AND user_id < 900
GROUP BY user_id
ORDER BY clean_events DESC, user_id
LIMIT 5;`,
    [["145", "145 is the raw number — the clean ranking deflates the whale by its burst."],
     [">=\\s*900", "Bots stay excluded from the per-user leaderboard — they're flagged, not ranked."]], true],
  ["The quarantine ledger", "Explain the exclusion: per duplicate group, the kept id and how many were dropped — biggest drop first. The burst's group (7 dropped) heads the review queue.", ["Group raw by fingerprint; kept = MIN(id), dropped = COUNT(*) − 1; ORDER BY dropped DESC, kept ASC LIMIT 3.", "The ledger is the audit trail — every excluded row explainable."], "hard",
    `SELECT MIN(id) AS kept_id,
       COUNT(*) - 1 AS dropped,
       lower(trim(action)) AS action
FROM events_dirty
GROUP BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
HAVING COUNT(*) > 1
ORDER BY dropped DESC, kept_id ASC
LIMIT 3;`,
    [["max\\(id\\)", "Keep-FIRST: MIN(id) survives — MAX would keep the last arrival, an undeclared rule change."],
     ["limit\\s+1", "The ledger lists groups — the top 3, not the single biggest."]], true],
  ["The rebuild proof", "Idempotence: derive the clean set twice in one query — two identical keep-first counts side by side. Same raw in, same stg out: the pipeline is a function, not a procedure.", ["Two scalar subqueries running the same window count.", "582 = 582 is the point — determinism, not luck."], "easy",
    `SELECT
  (SELECT COUNT(*) FROM (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn = 1)) AS first_run,
  (SELECT COUNT(*) FROM (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn = 1)) AS second_run;`,
    [["random|now\\(", "Nondeterminism anywhere breaks the rebuild proof — the fingerprint is pure."],
     ["distinct", "The keep-first window is the deterministic build; DISTINCT would also work here but loses provenance."]]],
  ["The scorecard", "The publish gate as one row: raw 627 · clean 582 · quarantined 45 · money 3,217,147 · format violations 0. Five numbers — the build ships only when all five hold.", ["Five scalar subqueries: raw count, keep-first count, rn > 1 count, guarded money on clean, format violations.", "Every number reproduces the triage board — that's the gate."], "hard",
    `SELECT
  (SELECT COUNT(*) FROM events_dirty) AS raw_rows,
  (SELECT COUNT(*) FROM (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn = 1)) AS clean_rows,
  (SELECT COUNT(*) FROM (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn > 1)) AS quarantined,
  (SELECT SUM(CASE WHEN typeof(amount_cents) = 'integer'
                THEN amount_cents END)
     FROM (
       SELECT amount_cents FROM (
         SELECT id, amount_cents, ROW_NUMBER() OVER (
           PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
           ORDER BY id) AS rn
         FROM events_dirty) WHERE rn = 1)) AS money_cents,
  (SELECT COUNT(*) FROM (
     SELECT REPLACE(event_ts, ' ', 'T') AS ts FROM (
       SELECT id, event_ts, ROW_NUMBER() OVER (
         PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
         ORDER BY id) AS rn
       FROM events_dirty) WHERE rn = 1) WHERE ts LIKE '% %') AS format_violations;`,
    [["where.*627|having.*582", "No hardcoded verdicts — the scorecard COMPUTES the gate; humans read it."],
     ["join", "Five independent censuses — scalar subqueries, one row."]]],
  ["The watermark preview", "Incremental loads start from a watermark: count clean events after 2025-01-20 — the batch the next run would carry instead of rebuilding January.", ["Keep-first build + WHERE event_ts >= '2025-01-20' (post-standardization string compare works).", "The watermark is a timestamp, not a row count — re-deriving is always safe."], "medium",
    `SELECT COUNT(*) AS tail_events
FROM (
  SELECT event_ts FROM (
    SELECT id, event_ts, ROW_NUMBER() OVER (
      PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
      ORDER BY id) AS rn
    FROM events_dirty) WHERE rn = 1
)
WHERE event_ts >= '2025-01-20';`,
    [["limit", "A row-count page isn't a watermark — time defines the increment."],
     ["delete.*before", "Watermarks ADD new tails; they never trim history."]]],
];
