// Lesson 67 — SCD problems: Type 1 corrections, Type 2 history, as-of joins.

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["The current census", "Type 2 dimensions carry a 'now' flag. Count current versions per region — sixteen buyers, one current row each, grouped by their region today.", ["WHERE is_current = 1, GROUP BY region.", "Every buyer has exactly one current version — the invariant."], "easy",
    `SELECT region, COUNT(*) AS buyers
FROM dim_customer
WHERE is_current = 1
GROUP BY region
ORDER BY region;`,
    [["valid_from", "The flag answers 'now' — no window predicate needed for the current census."], ["all\\s+rows|no\\s+where", "Without the filter, moved buyers count in two regions — history leaks into today."]], true],
  ["Region at sale", "The fact's customer_key already froze the region at sale time. Net dollars per region — the as-of join is just one equality on the surrogate.", ["JOIN dim_customer ON customer_sk = customer_key; GROUP BY region.", "No date logic — the key resolved it at load."], "easy",
    `SELECT c.region,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_customer c ON c.customer_sk = f.customer_key
GROUP BY c.region
ORDER BY net_dollars DESC;`,
    [["customer_id", "The natural key fans out moved buyers across versions — join on the surrogate."], ["is_current", "Filtering current rows would re-date history to today — the fact's key already picked the era."]], true],
  ["Bruno's two eras", "customer_id 2 sold under two versions. Count fact lines and net dollars per customer_sk for Bruno — history made countable.", ["Join fact to dim on sk, filter customer_id = 2, GROUP BY sk (or region).", "Both eras appear: pre-move LATAM, post-move US."], "medium",
    `SELECT f.customer_key AS sk, c.region,
       COUNT(*) AS lines,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_customer c ON c.customer_sk = f.customer_key
WHERE c.customer_id = 2
GROUP BY f.customer_key, c.region
ORDER BY sk;`,
    [["where.*sale", "The as-of resolution lives in the key — no window predicate needed for region-at-sale."], ["region\\s+only", "Group by the sk too: the two eras are the point; region alone would merge if he ever moved back."]], true],
  ["The movers", "Five buyers carry more than one version. List them: customer_id, name, version count, earliest valid_from, latest valid_to — history's roll call.", ["GROUP BY customer_id, name HAVING COUNT(*) > 1.", "Aggregate windows: MIN(valid_from), MAX(valid_to)."], "medium",
    `SELECT customer_id, name,
       COUNT(*) AS versions,
       MIN(valid_from) AS history_from,
       MAX(valid_to) AS history_to
FROM dim_customer
GROUP BY customer_id, name
HAVING COUNT(*) > 1
ORDER BY customer_id;`,
    [["is_current\\s*=\\s*1", "Filtering to current rows makes version counts 1 everywhere — the movers live in ALL rows."], ["where\\s+count", "HAVING filters groups; WHERE filters rows — version counts are group-level."]], true],
  ["The invariant", "A healthy SCD dimension: exactly one current version per buyer. Count violators — buyers whose SUM(is_current) ≠ 1. The answer must be zero.", ["GROUP BY customer_id HAVING SUM(is_current) <> 1, wrapped in COUNT(*).", "A scalar subquery keeps the verdict one row."], "medium",
    `SELECT COUNT(*) AS broken_buyers
FROM (
  SELECT customer_id
  FROM dim_customer
  GROUP BY customer_id
  HAVING SUM(is_current) <> 1
);`,
    [["sum\\(is_current\\)\\s*=\\s*1", "The HEALTHY case is exactly one — count the violations (<> 1), not the rule-followers."], ["distinct", "The GROUP BY already dedupes buyers; DISTINCT would double-count nothing but add nothing."]]],
  ["Window sanity", "Two structural checks in one row: rows where valid_from >= valid_to (impossible windows) and current rows whose valid_to isn't the sentinel. Both must read zero.", ["Two scalar subqueries with the broken predicates.", "The sentinel is '9999-12-31'."], "medium",
    `SELECT (SELECT COUNT(*) FROM dim_customer WHERE valid_from >= valid_to) AS inverted_windows,
       (SELECT COUNT(*) FROM dim_customer
         WHERE is_current = 1 AND valid_to != '9999-12-31') AS unclosed_currents;`,
    [["valid_to\\s+is\\s+null", "This design never uses NULL — the sentinel '9999-12-31' keeps the half-open predicate uniform."], ["between", "BETWEEN has nothing to check here — the check is structural, not as-of."]]],
  ["As-of census, mid-history", "The board asks: 'regional mix as of 2024-07-01, over sales to that date'. Two steps: resolve each buyer's version AT 2024-07-01 (window predicate), then sum that buyer's earlier sales under it.", ["CTE: fact lines + the buyer id from their sk; then join the dim on customer_id with the window predicate for the fixed date.", "The window predicate is >= valid_from AND < valid_to — half-open, as always."], "hard",
    `WITH lines AS (
  SELECT f.net_cents, f.date_key, c.customer_id
  FROM fact_sales f
  JOIN dim_customer c ON c.customer_sk = f.customer_key
)
SELECT dc.region,
       ROUND(SUM(l.net_cents) / 100.0, 2) AS net_dollars
FROM lines l
JOIN dim_customer dc
  ON dc.customer_id = l.customer_id
 AND '2024-07-01' >= dc.valid_from
 AND '2024-07-01' < dc.valid_to
WHERE l.date_key < 20240701
GROUP BY dc.region
ORDER BY net_dollars DESC;`,
    [["customer_sk\\s*=\\s*customer_key\\s+and.*2024-07-01", "The fact's sk is region-AT-SALE; the census wants region-AT-2024-07-01 — resolve the buyer id first, then the fixed-date version."], ["date_key\\s*<=\\s*20240701", "Sales 'to that date' exclude July 1 itself? The brief says 'to' — but the boundary matters: state it; here <= would add July 1st lines to a snapshot labeled mid-year. < is the honest cut."]], true],
  ["Type 1: the correction", "The feed mislabeled Keiko Sato: her account was never inactive. Apply the Type 1 correction — UPDATE every Keiko version to active = 1, overwriting the wrong flag everywhere. Verify: one row changed (she has one version).", ["UPDATE dim_customer SET active = 1 WHERE customer_id = 11 — all versions.", "Type 1 = fix in place; no history of the mistake."], "medium",
    `UPDATE dim_customer SET active = 1
WHERE customer_id = 11;`,
    [["is_current", "Type 1 corrections hit ALL versions — the flag was wrong in every era, not just now."], ["insert", "Corrections update; they don't add rows — that's Type 2's job."]], true, undefined, true],
  ["Type 2: the move", "Maya Patel (customer_id 13, APAC) moves to US effective 2025-02-01. Perform the Type 2 change: close her current version at the move date, insert the new US version with a fresh surrogate. Verify with an as-of probe at 2025-02-15: US.", ["UPDATE … SET valid_to = '2025-02-01', is_current = 0 WHERE customer_id = 13 AND is_current = 1;", "INSERT … SELECT MAX(customer_sk) + 1 … valid_from = '2025-02-01', valid_to = '9999-12-31', is_current = 1."], "hard",
    `UPDATE dim_customer
SET valid_to = '2025-02-01', is_current = 0
WHERE customer_id = 13 AND is_current = 1;

INSERT INTO dim_customer (customer_sk, customer_id, name, region, active, valid_from, valid_to, is_current)
SELECT MAX(customer_sk) + 1, customer_id, name, 'US', active, '2025-02-01', '9999-12-31', 1
FROM dim_customer
WHERE customer_id = 13;`,
    [["set\\s+valid_to\\s*=\\s*null", "The closed version keeps a REAL end date — NULL would break the half-open predicate for history probes."], ["update.*valid_from", "Never move the OLD version's start — only close its end. Rewriting starts erases the era it recorded."], ["customer_sk\\s*=\\s*13", "The new version needs a NEW surrogate — MAX(customer_sk) + 1; reusing 13 would collide with a different buyer."]], false,
    `SELECT region FROM dim_customer
WHERE customer_id = 13
  AND '2025-02-15' >= valid_from AND '2025-02-15' < valid_to;`, true],
  ["Type 2: the third era", "Bruno moves again: US → EU effective 2025-01-01. Close his current version, insert the EU one — then he carries three versions and the as-of probe at 2025-02-15 reads EU.", ["Same pattern: UPDATE close (is_current = 1 AND customer_id = 2), then INSERT SELECT MAX(sk) + 1 with valid_from = '2025-01-01'.", "Verify counts 3 versions afterward — the verify SELECT returns the probe region."], "hard",
    `UPDATE dim_customer
SET valid_to = '2025-01-01', is_current = 0
WHERE customer_id = 2 AND is_current = 1;

INSERT INTO dim_customer (customer_sk, customer_id, name, region, active, valid_from, valid_to, is_current)
SELECT MAX(customer_sk) + 1, customer_id, name, 'EU', active, '2025-01-01', '9999-12-31', 1
FROM dim_customer
WHERE customer_id = 2;`,
    [["where\\s+customer_sk\\s*=\\s*4", "Close by customer_id + is_current — the sk of 'current' changes as history grows."], ["insert.*values\\s*\\(", "Hardcoding the new sk invites collisions — derive it: MAX(customer_sk) + 1."]], false,
    `SELECT region FROM dim_customer
WHERE customer_id = 2
  AND '2025-02-15' >= valid_from AND '2025-02-15' < valid_to;`, true],
  ["The as-of probe, three dates", "Bruno's history in one row: region at 2024-01-15, 2024-09-15, 2025-02-15 — three scalar probes against the half-open windows. (He moves to EU on 2025-01-01 only in the sandboxed problem; this read uses the seeded two-era state.)", ["Three scalar subqueries with >= valid_from AND < valid_to.", "Expected: LATAM, US, US."], "medium",
    `SELECT
  (SELECT region FROM dim_customer WHERE customer_id = 2
     AND '2024-01-15' >= valid_from AND '2024-01-15' < valid_to) AS region_january,
  (SELECT region FROM dim_customer WHERE customer_id = 2
     AND '2024-09-15' >= valid_from AND '2024-09-15' < valid_to) AS region_september,
  (SELECT region FROM dim_customer WHERE customer_id = 2
     AND '2025-02-15' >= valid_from AND '2025-02-15' < valid_to) AS region_february;`,
    [["between", "Inclusive both ends — on 2024-08-01 it would match two versions and error on the probe."], ["order\\s+by", "Scalar subqueries return values, not rowsets — no ordering applies."]]],
  ["Late-arriving facts", "A sale from 2024-07-20 arrives late for Bruno. Which version owns it? Answer with the as-of predicate — and note the fact's stored key would NOT need touching: late ARRIVAL, not late DATA, is what re-loads fix.", ["SELECT region FROM dim_customer WHERE customer_id = 2 AND '2024-07-20' >= valid_from AND '2024-07-20' < valid_to;", "Expected: LATAM — before the 2024-08-01 move."], "easy",
    `SELECT region
FROM dim_customer
WHERE customer_id = 2
  AND '2024-07-20' >= valid_from
  AND '2024-07-20' < valid_to;`,
    [["is_current", "'Now' logic would say US — the sale happened in the LATAM era."], ["valid_to\\s+is\\s+null", "The sentinel design keeps one predicate for every date, past or present."]]],
  ["Version cost, counted", "Type 2 isn't free: it grows the dimension. Return the dim's total rows, current rows, and the buyers' count — the overhead is 5 extra rows for 5 moves over 16 buyers.", ["Three scalar aggregates: COUNT(*), COUNT WHERE is_current = 1, COUNT(DISTINCT customer_id).", "21 − 16 = 5: one row per move."], "easy",
    `SELECT COUNT(*) AS dimension_rows,
       SUM(is_current) AS current_rows,
       COUNT(DISTINCT customer_id) AS buyers
FROM dim_customer;`,
    [["where", "All three numbers come from the whole dim — filtering would flatten the overhead story."], ["count\\(\\*\\)\\s+as\\s+buyers", "COUNT(*) counts versions; buyers need COUNT(DISTINCT customer_id)."]]],
];
