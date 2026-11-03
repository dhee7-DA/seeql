// Lesson 69 — triage problems. All numbers verified by scripts/warehouse-facts.ts:
// 627 raw · 89 drifted · 26 anonymous · 17 bots · 584 known · 163 whitespace
// 9→4 actions · 8→6 pages · 5 broken money · $32,171.47 integer money · 582/45 split.

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["The raw count", "The vendor's log lands: one month (January 2025). Count it — 627 rows, the number every later census is measured against.", ["COUNT(*) on events_dirty — the whole-table verdict.", "No filters: the census counts EVERYTHING that arrived."], "easy",
    `SELECT COUNT(*) AS raw_rows
FROM events_dirty;`,
    [["where", "No WHERE — triage counts what arrived, before any judgment."], ["distinct", "Duplicates are a finding, not a preprocessing step — count them raw."]]],
  ["The format census", "Two timestamp formats coexist: ISO with 'T' and a drifted space variant. Count the drifted rows — 89 rows arrived with a space instead of the T.", ["LIKE '% %' matches the space format — the ISO side has none.", "The count is a triage number, not a fix."], "easy",
    `SELECT COUNT(*) AS drifted_rows
FROM events_dirty
WHERE event_ts LIKE '% %';`,
    [["replace", "Standardization is lesson 70 — triage only measures."], ["julianday", "Parsing comes next; this census is about the FORMAT class."]]],
  ["The parse probe", "Before standardizing, prove both formats PARSE: count rows where julianday of the space-to-T fix is NULL. The answer — zero — is the license lesson 70's one-line REPLACE runs on.", ["julianday(REPLACE(event_ts, ' ', 'T')) IS NULL — count them.", "Zero NULLs means both formats are real timestamps underneath."], "medium",
    `SELECT COUNT(*) AS unparseable
FROM events_dirty
WHERE julianday(REPLACE(event_ts, ' ', 'T')) IS NULL;`,
    [["julianday\\(event_ts\\)", "Raw space-format strings don't parse — the REPLACE is the probe; that's the point."], ["count.*null\\s*=\\s*null", "COUNT(*) counts rows; the predicate keeps only unparseable ones."]]],
  ["The anonymous class", "Traffic with no user at all: count rows where user_id IS NULL — 26 anonymous events, kept and counted, never silently dropped.", ["IS NULL — the classic probe.", "Anonymous ≠ broken: it's a class with an owner."], "easy",
    `SELECT COUNT(*) AS anonymous_rows
FROM events_dirty
WHERE user_id IS NULL;`,
    [["=\\s*null", "= NULL never matches — IS NULL is the only probe that sees these rows."], ["coalesce", "Substituting 0 would HIDE the class — triage counts it first."]]],
  ["The bot orphans", "User ids 900+ match no customer: bot orphans. Count them (17) and list the distinct bot ids — the class the web team owns.", ["WHERE user_id >= 900; COUNT(*) and COUNT(DISTINCT user_id).", "One row, both numbers."], "easy",
    `SELECT COUNT(*) AS bot_rows,
       COUNT(DISTINCT user_id) AS distinct_bots
FROM events_dirty
WHERE user_id >= 900;`,
    [["join.*customers", "The orphan PROOF is a join away — the census just counts ids ≥ 900."], ["user_id\\s+in", "17 distinct ids — a range predicate beats listing them."]]],
  ["The known class", "Everyone else: count rows with a real, sub-900 user id — 584 known rows. Raw class census: 584 + 26 + 17 = 627.", ["user_id IS NOT NULL AND user_id < 900.", "The three classes PARTITION the log — the counts must sum to the raw count."], "easy",
    `SELECT COUNT(*) AS known_rows
FROM events_dirty
WHERE user_id IS NOT NULL AND user_id < 900;`,
    [["<=\\s*899", "Same set, but the 900 boundary is the design — state it the way the load does."], ["between", "BETWEEN with NULLs: NULL user rows fail BETWEEN silently — the IS NOT NULL guard is explicit here."]]],
  ["The spelling census", "Four business actions arrived in NINE spellings. Count DISTINCT action values — then the canonical count via lower(trim()) — 9 raw vs 4 real. Both numbers, one row.", ["COUNT(DISTINCT action) and COUNT(DISTINCT lower(trim(action))).", "The delta (9 → 4) is the canonicalization workload."], "medium",
    `SELECT COUNT(DISTINCT action) AS raw_spellings,
       COUNT(DISTINCT lower(trim(action))) AS canonical_actions
FROM events_dirty;`,
    [["distinct\\s+action\\s*$", "One number isn't the census — the pair shows the drift."], ["replace", "No replacements yet — lower and trim PROBE the canonical form."]]],
  ["The page census", "Pages drifted by whitespace: 8 spellings, 6 canonical, 163 rows carrying padded values. Return all three numbers — spellings, canonical, padded rows.", ["COUNT(DISTINCT page), COUNT(DISTINCT trim(page)), COUNT WHERE page != trim(page).", "Three aggregates, one row — the class in numbers."], "medium",
    `SELECT COUNT(DISTINCT page) AS raw_spellings,
       COUNT(DISTINCT trim(page)) AS canonical_pages,
       COUNT(CASE WHEN page != trim(page) THEN 1 END) AS padded_rows
FROM events_dirty;`,
    [["where\\s+page", "The spelling counts want the WHOLE table — the padded count rides along as a conditional COUNT."], ["like\\s+'\\s*%'", "LIKE can't see trailing whitespace reliably — the inequality probe is exact."]]],
  ["Broken money", "Five checkout amounts arrived as TEXT — '12,500', 'n/a', '3,140.50', '—', '980'. Type-census the column: integer rows vs text rows, and list nothing else. 59 + 5 = 64 non-null amounts.", ["GROUP BY typeof(amount_cents) over non-null rows.", "typeof sees what the column really carries — the mixed-type proof."], "medium",
    `SELECT typeof(amount_cents) AS stored_as,
       COUNT(*) AS rows
FROM events_dirty
WHERE amount_cents IS NOT NULL
GROUP BY typeof(amount_cents);`,
    [["cast", "Casting BEFORE the census destroys the evidence — triage measures the damage first."], ["sum", "The money total is the NEXT census; this one is about TYPES."]], true],
  ["The money census", "The purchase money that's real: SUM over INTEGER-typed amounts only — 3,217,147 cents, or $32,171.47. The CASE guard is what keeps text rows from being coerced into the sum.", ["SUM(CASE WHEN typeof(amount_cents) = 'integer' THEN amount_cents END).", "A bare SUM would coerce '980' → 980 and '12,500' → 12 — silent money theft."], "hard",
    `SELECT SUM(CASE WHEN typeof(amount_cents) = 'integer'
                THEN amount_cents END) AS money_cents
FROM events_dirty;`,
    [["sum\\(amount_cents\\)", "Bare SUM silently coerces text ('12,500' reads as 12) — the CASE guard is the census."], ["where\\s+typeof", "Filtering works too, but the CASE keeps the answer one row with the NULL made visible."]]],
  ["The duplicate census", "Exact duplicate rows: group by EVERY column and count groups with more than one row. The shape: 38 pairs and one burst of 8 — 45 surplus rows in 39 groups.", ["GROUP BY event_ts, user_id, action, page, amount_cents HAVING COUNT(*) > 1; then census the group sizes.", "Wrap it: COUNT(*) over groups, or GROUP BY the group size for the shape."], "hard",
    `SELECT n_copies, COUNT(*) AS groups
FROM (
  SELECT event_ts, user_id, action, page, amount_cents, COUNT(*) AS n_copies
  FROM events_dirty
  GROUP BY event_ts, user_id, action, page, amount_cents
  HAVING COUNT(*) > 1
)
GROUP BY n_copies
ORDER BY n_copies;`,
    [["distinct", "DISTINCT would collapse and LOSE the group sizes — the shape (38+1) is the finding."], ["row_number", "Windows come next lesson — the raw GROUP BY is the triage tool."]], true],
  ["The fingerprint, defined", "'Same event' = same timestamp, same user, same CANONICAL action, same TRIMMED page, same amount. Count distinct fingerprints — 582, the clean set's size before a single row is touched.", ["COUNT(DISTINCT event_ts || '|' || user_id || '|' || lower(trim(action)) || '|' || trim(page) || '|' || amount_cents).", "The concatenation key IS the fingerprint."], "hard",
    `SELECT COUNT(DISTINCT
       event_ts || '|' || COALESCE(user_id, -1) || '|' ||
       lower(trim(action)) || '|' || trim(page) || '|' || COALESCE(amount_cents, 'none')
     ) AS fingerprints
FROM events_dirty;`,
    [["distinct\\s+event_ts", "Timestamp alone isn't identity — two users share seconds; the fingerprint is the conjunction."], ["null", "COALESCE is exactly how NULL users keep their own fingerprints instead of collapsing into one NULL key."]]],
  ["The burst", "One fingerprint arrived EIGHT times. Find it: event_ts, user_id, canonical action — the 8-copy group. (It belongs to user 5, the whale.)", ["GROUP BY all columns HAVING COUNT(*) = 8.", "lower(trim()) inside the GROUP BY canonicalizes on the spot."], "medium",
    `SELECT event_ts, user_id, lower(trim(action)) AS action, COUNT(*) AS copies
FROM events_dirty
GROUP BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
HAVING COUNT(*) = 8;`,
    [["having\\s+count.*>\\s*1\\s*$", "That returns all 39 duplicate groups — the burst is the = 8 one."], ["limit\\s+1", "LIMIT is luck — the HAVING states the fact: exactly 8 copies."]]],
  ["The whale", "User 5 dominates the raw log. Top five users by raw row count — the whale's row count INCLUDES its replays; the clean count comes next lesson.", ["GROUP BY user_id (non-null, sub-900) ORDER BY count DESC LIMIT 5.", "user 5: 145 raw rows — 138 real + the burst."], "medium",
    `SELECT user_id, COUNT(*) AS raw_events
FROM events_dirty
WHERE user_id IS NOT NULL AND user_id < 900
GROUP BY user_id
ORDER BY raw_events DESC, user_id
LIMIT 5;`,
    [["distinct", "Row count, not distinct events — the raw whale includes its replays."], [">=\\s*900", "Bots excluded — the whale census is about the known class."]], true],
  ["Classes overlap", "Dirt classes aren't disjoint: count rows that are BOTH drifted-timestamp AND whitespace-page — the intersection the triage board must dedupe mentally. (Classes classify FINDINGS, not rows.)", ["Two predicates ANDed: LIKE '% %' AND page != trim(page).", "The overlap is small — but the census must know it exists."], "medium",
    `SELECT COUNT(*) AS overlap_rows
FROM events_dirty
WHERE event_ts LIKE '% %'
  AND page != trim(page);`,
    [["or", "OR unions the classes — the intersection needs AND."], ["case", "No branching needed — a two-predicate count."]]],
  ["The triage board", "The whole census, one row: raw 627, drifted 89, anonymous 26, bots 17, known 584, padded 163, spellings 9→4, money $32,171.47. Build it — the board that lesson 70's pipeline must reproduce.", ["Scalar subqueries, one per census number.", "Money via the CASE-guarded SUM; spellings via the two DISTINCTs."], "hard",
    `SELECT
  (SELECT COUNT(*) FROM events_dirty) AS raw_rows,
  (SELECT COUNT(*) FROM events_dirty WHERE event_ts LIKE '% %') AS drifted,
  (SELECT COUNT(*) FROM events_dirty WHERE user_id IS NULL) AS anonymous,
  (SELECT COUNT(*) FROM events_dirty WHERE user_id >= 900) AS bots,
  (SELECT COUNT(*) FROM events_dirty
     WHERE user_id IS NOT NULL AND user_id < 900) AS known,
  (SELECT COUNT(*) FROM events_dirty WHERE page != trim(page)) AS padded,
  (SELECT COUNT(DISTINCT action) FROM events_dirty) AS raw_spellings,
  (SELECT COUNT(DISTINCT lower(trim(action))) FROM events_dirty) AS canonical_actions,
  (SELECT SUM(CASE WHEN typeof(amount_cents) = 'integer'
                THEN amount_cents END) FROM events_dirty) AS money_cents;`,
    [["group\\s+by", "One board row — scalar subqueries, no grouping."], ["where", "Each census carries its own predicate INSIDE its subquery."]]],
];
