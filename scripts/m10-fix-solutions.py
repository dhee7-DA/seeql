#!/usr/bin/env python3
# Task 41 — fix the 32 window solutions that referenced GROUP BY aliases
# inside window specs (SQLite rejects them). Pattern: stage the rollup in a
# CTE, then apply the window to the clean columns. Also rewrites each fixed
# row's "Shape:" hint to match honestly.

import re, io

BASE = "src/lib/curriculum/lessons/banks/"

def ml(s: str) -> str:
    return s  # multiline python string -> source keeps \n via escape below

def src(s: str) -> str:
    return s.replace("\n", "\\n")

def esc_re(s: str) -> str:
    return re.escape(src(s))

def fix(fname: str, title: str, old_sql: str, new_sql: str) -> None:
    path = BASE + fname
    text = open(path).read()
    tidx = text.find('["' + title + '"')
    assert tidx >= 0, (fname, title, "title not found")
    nxt = text.find('\n  ["', tidx)
    if nxt == -1:
        nxt = text.rfind("];")
    row = text[tidx:nxt]
    if src(new_sql) in row:
        print("skip (already fixed)", fname, title)
        return
    # difficulty-anchored solution swap: diff + solution string
    pat = re.compile(r'("(?:easy|medium|hard)",\s*\n\s*")(?:[^"\\]|\\.)*(")', re.S)
    row2, n = pat.subn(lambda m: m.group(1) + src(new_sql) + m.group(2), row, count=1)
    assert n == 1, (fname, title, "solution swap failed")
    oneline = new_sql.replace("\n", " ")
    row2, hn = re.subn(r'Shape: [^"]*?(?="\])', 'Shape: ' + oneline.rstrip(";") + ' ', row2, count=1, flags=re.S)
    if hn != 1:
        row2 = row2.replace("Shape: ", "Shape: see worked solution. ", 1)
    text = text[:tidx] + row2 + text[nxt:]
    open(path, "w").write(text)
    print("fixed", fname, title)

M = "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, SUM(total) AS rev\n  FROM orders\n  GROUP BY month\n)"

fix("l58-problems.ts", "The record so far",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS revenue,\n  ROUND(MAX(SUM(total)) OVER (ORDER BY month), 2) AS best_so_far\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS revenue,\n  ROUND(MAX(rev) OVER (ORDER BY month), 2) AS best_so_far\nFROM m\nORDER BY month;")

fix("l58-problems.ts", "The floor so far",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS revenue,\n  ROUND(MIN(SUM(total)) OVER (ORDER BY month), 2) AS worst_so_far\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS revenue,\n  ROUND(MIN(rev) OVER (ORDER BY month), 2) AS worst_so_far\nFROM m\nORDER BY month;")

fix("l58-problems.ts", "The revenue spine",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS revenue,\n  ROUND(SUM(SUM(total)) OVER (ORDER BY month), 2) AS run\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS revenue,\n  ROUND(SUM(rev) OVER (ORDER BY month), 2) AS run\nFROM m\nORDER BY month;")

fix("l58-problems.ts", "Counting the months",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  COUNT(*) AS n,\n  COUNT(*) OVER (ORDER BY month) AS run_n\nFROM orders\nGROUP BY month\nORDER BY month;",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n)\nSELECT month, n, COUNT(*) OVER (ORDER BY month) AS run_n\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "The month neighbor",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(LAG(SUM(total)) OVER (ORDER BY month), 2) AS prev_rev\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(LAG(rev) OVER (ORDER BY month), 2) AS prev_rev\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "The growth line",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY month), 2) AS delta\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(rev - LAG(rev) OVER (ORDER BY month), 2) AS delta\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "Growth in percent",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(100.0 * (SUM(total) - LAG(SUM(total)) OVER (ORDER BY month)) / LAG(SUM(total)) OVER (ORDER BY month), 1) AS pct\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(100.0 * (rev - LAG(rev) OVER (ORDER BY month))\n        / LAG(rev) OVER (ORDER BY month), 1) AS pct\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "The biggest jump",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    SUM(total) AS rev,\n    SUM(total) - LAG(SUM(total)) OVER (ORDER BY month) AS delta\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(delta, 2) AS delta\nFROM m\nWHERE delta IS NOT NULL\nORDER BY delta DESC\nLIMIT 1;",
    M + ", d AS (\n  SELECT month, rev - LAG(rev) OVER (ORDER BY month) AS delta\n  FROM m\n)\nSELECT month, ROUND(delta, 2) AS delta\nFROM d\nWHERE delta IS NOT NULL\nORDER BY delta DESC\nLIMIT 1;")

fix("l60-problems.ts", "Steepest slide",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    SUM(total) - LAG(SUM(total)) OVER (ORDER BY month) AS delta\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(delta, 2) AS delta\nFROM m\nWHERE delta IS NOT NULL\nORDER BY delta ASC\nLIMIT 1;",
    M + ", d AS (\n  SELECT month, rev - LAG(rev) OVER (ORDER BY month) AS delta\n  FROM m\n)\nSELECT month, ROUND(delta, 2) AS delta\nFROM d\nWHERE delta IS NOT NULL\nORDER BY delta ASC\nLIMIT 1;")

fix("l60-problems.ts", "Up or down",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  CASE\n    WHEN SUM(total) > LAG(SUM(total)) OVER (ORDER BY month) THEN 'up'\n    WHEN SUM(total) < LAG(SUM(total)) OVER (ORDER BY month) THEN 'down'\n    ELSE 'flat'\n  END AS dir\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  CASE WHEN rev > LAG(rev) OVER (ORDER BY month) THEN 'up'\n       WHEN rev < LAG(rev) OVER (ORDER BY month) THEN 'down'\n       ELSE 'flat' END AS dir\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "Counting the pulse",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  COUNT(*) AS n,\n  COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY month) AS delta_n\nFROM orders\nGROUP BY month\nORDER BY month;",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n)\nSELECT month, n, n - LAG(n) OVER (ORDER BY month) AS delta_n\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "The month I skipped",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    COUNT(*) AS n,\n    LAG(COUNT(*)) OVER (ORDER BY month) AS prev_n\n  FROM orders\n  GROUP BY month\n)\nSELECT month, n, prev_n\nFROM m WHERE n < prev_n\nORDER BY month;",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n), w AS (\n  SELECT month, n, LAG(n) OVER (ORDER BY month) AS prev_n\n  FROM m\n)\nSELECT month, n, prev_n\nFROM w WHERE n < prev_n\nORDER BY month;")

fix("l60-problems.ts", "Two-month lookback",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(LAG(SUM(total), 2) OVER (ORDER BY month), 2) AS rev_2ago\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(LAG(rev, 2) OVER (ORDER BY month), 2) AS rev_2ago\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "Quarter-compare",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(LAG(SUM(total), 3) OVER (ORDER BY month), 2) AS rev_3ago\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(LAG(rev, 3) OVER (ORDER BY month), 2) AS rev_3ago\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "Next month preview",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(LEAD(SUM(total)) OVER (ORDER BY month), 2) AS next_rev\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(LEAD(rev) OVER (ORDER BY month), 2) AS next_rev\nFROM m\nORDER BY month;")

fix("l60-problems.ts", "The growth streak",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno,\n    SUM(total) AS rev,\n    SUM(total) - LAG(SUM(total)) OVER (ORDER BY month) AS delta\n  FROM orders\n  GROUP BY month\n), f AS (\n  SELECT mno,\n    CASE WHEN delta > 0 THEN 1 ELSE 0 END AS up,\n    ROW_NUMBER() OVER (ORDER BY mno) AS rn\n  FROM m WHERE delta IS NOT NULL\n), i AS (\n  SELECT mno, mno - rn AS island\n  FROM f WHERE up = 1\n), c AS (\n  SELECT island, COUNT(*) AS cnt, MAX(mno) AS last_mno\n  FROM i GROUP BY island\n)\nSELECT COALESCE(MAX(cnt), 0) AS streak\nFROM c\nWHERE last_mno = (SELECT MAX(mno) FROM f WHERE up = 1);",
    M + ", d AS (\n  SELECT month, rev - LAG(rev) OVER (ORDER BY month) AS delta\n  FROM m\n), f AS (\n  SELECT month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno,\n    CASE WHEN delta > 0 THEN 1 ELSE 0 END AS up\n  FROM d WHERE delta IS NOT NULL\n), u AS (\n  SELECT month, mno,\n    mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM f WHERE up = 1\n), c AS (\n  SELECT island, COUNT(*) AS cnt, MAX(mno) AS last_mno\n  FROM u GROUP BY island\n)\nSELECT COALESCE(MAX(cnt), 0) AS streak\nFROM c\nWHERE last_mno = (SELECT MAX(mno) FROM f WHERE up = 1);")

fix("l60-problems.ts", "Islands of quiet months",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno,\n    COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n), q AS (\n  SELECT month, mno,\n    mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM m WHERE n <= 7\n)\nSELECT MIN(month) AS island_start, MAX(month) AS island_end,\n  COUNT(*) AS n_months\nFROM q\nGROUP BY island\nORDER BY island_start;",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n), q1 AS (\n  SELECT month, ROW_NUMBER() OVER (ORDER BY month) AS mno\n  FROM m WHERE n <= 7\n), q AS (\n  SELECT month, mno, mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM q1\n)\nSELECT MIN(month) AS island_start, MAX(month) AS island_end,\n  COUNT(*) AS n_months\nFROM q\nGROUP BY island\nORDER BY island_start;")

fix("l60-problems.ts", "Momentum, smoothed",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND((LAG(SUM(total), 1) OVER (ORDER BY month) + LAG(SUM(total), 2) OVER (ORDER BY month)) / 2.0, 2) AS prev2_avg\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + ", w AS (\n  SELECT month, rev,\n    LAG(rev, 1) OVER (ORDER BY month) AS p1,\n    LAG(rev, 2) OVER (ORDER BY month) AS p2\n  FROM m\n)\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND((p1 + p2) / 2.0, 2) AS prev2_avg\nFROM w\nORDER BY month;")

fix("l60-problems.ts", "Same-day repeats",
    "SELECT customer_id, created_at, same_day_no\nFROM n WHERE same_day_no > 1\nORDER BY customer_id, created_at, id;",
    "SELECT customer_id, created_at, same_day_no\nFROM n WHERE same_day_no > 1\nORDER BY customer_id, created_at;")

fix("l60-problems.ts", "The month that flipped",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    SUM(total) - LAG(SUM(total)) OVER (ORDER BY month) AS delta\n  FROM orders\n  GROUP BY month\n), f AS (\n  SELECT month, delta,\n    LAG(delta) OVER (ORDER BY month) AS prev_delta\n  FROM m WHERE delta IS NOT NULL\n)\nSELECT month, ROUND(delta, 2) AS delta\nFROM f\nWHERE delta < 0 AND prev_delta > 0\nORDER BY month\nLIMIT 1;",
    M + ", d AS (\n  SELECT month, rev - LAG(rev) OVER (ORDER BY month) AS delta\n  FROM m\n), f AS (\n  SELECT month, delta,\n    LAG(delta) OVER (ORDER BY month) AS prev_delta\n  FROM d WHERE delta IS NOT NULL\n)\nSELECT month, ROUND(delta, 2) AS delta\nFROM f\nWHERE delta < 0 AND prev_delta > 0\nORDER BY month\nLIMIT 1;")

fix("l60-problems.ts", "Consecutive up-months, listed",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno,\n    SUM(total) - LAG(SUM(total)) OVER (ORDER BY month) AS delta\n  FROM orders\n  GROUP BY month\n), u AS (\n  SELECT month, mno,\n    mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM m WHERE delta > 0\n)\nSELECT MIN(month) AS run_start, MAX(month) AS run_end,\n  COUNT(*) AS n_months\nFROM u\nGROUP BY island\nORDER BY run_start;",
    M + ", d AS (\n  SELECT month, rev - LAG(rev) OVER (ORDER BY month) AS delta\n  FROM m\n), f AS (\n  SELECT month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno\n  FROM d WHERE delta > 0\n), u AS (\n  SELECT month, mno, mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM f\n)\nSELECT MIN(month) AS run_start, MAX(month) AS run_end,\n  COUNT(*) AS n_months\nFROM u\nGROUP BY island\nORDER BY run_start;")

fix("l60-problems.ts", "The full pulse report",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(LAG(SUM(total)) OVER (ORDER BY month), 2) AS prev_rev,\n  ROUND(SUM(total) - LAG(SUM(total)) OVER (ORDER BY month), 2) AS delta,\n  ROUND(LEAD(SUM(total)) OVER (ORDER BY month), 2) AS next_rev\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + ", w AS (\n  SELECT month, rev,\n    LAG(rev) OVER (ORDER BY month) AS prev,\n    LEAD(rev) OVER (ORDER BY month) AS nxt\n  FROM m\n)\nSELECT month, ROUND(rev, 2) AS rev, ROUND(prev, 2) AS prev_rev,\n  ROUND(rev - prev, 2) AS delta, ROUND(nxt, 2) AS next_rev\nFROM w\nORDER BY month;")

fix("l61-problems.ts", "The three-order mover",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(SUM(SUM(total)) OVER (ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS roll3\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(SUM(rev) OVER (ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS roll3\nFROM m\nORDER BY month;")

fix("l61-problems.ts", "Three-month average",
    "SELECT SUBSTR(created_at, 1, 7) AS month,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(AVG(SUM(total)) OVER (ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM orders\nGROUP BY month\nORDER BY month;",
    M + "\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(AVG(rev) OVER (ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM m\nORDER BY month;")

fix("l61-problems.ts", "Quarterly roller",
    "SELECT\n  (SUBSTR(created_at, 1, 4) || '-Q' ||\n    ((CAST(SUBSTR(created_at, 6, 2) AS INTEGER) + 2) / 3)) AS quarter,\n  ROUND(SUM(total), 2) AS rev,\n  ROUND(SUM(SUM(total)) OVER (ORDER BY quarter\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS roll3q\nFROM orders\nGROUP BY quarter\nORDER BY quarter;",
    "WITH q AS (\n  SELECT (SUBSTR(created_at, 1, 4) || '-Q' ||\n    ((CAST(SUBSTR(created_at, 6, 2) AS INTEGER) + 2) / 3)) AS quarter,\n    SUM(total) AS rev\n  FROM orders\n  GROUP BY quarter\n)\nSELECT quarter, ROUND(rev, 2) AS rev,\n  ROUND(SUM(rev) OVER (ORDER BY quarter\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS roll3q\nFROM q\nORDER BY quarter;")

fix("l63-problems.ts", "Busy-month islands",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno,\n    COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n), q AS (\n  SELECT month, mno,\n    mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM m WHERE n >= 8\n)\nSELECT MIN(month) AS run_start, MAX(month) AS run_end,\n  COUNT(*) AS n_months\nFROM q\nGROUP BY island\nORDER BY run_start;",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, COUNT(*) AS n\n  FROM orders\n  GROUP BY month\n), q1 AS (\n  SELECT month, ROW_NUMBER() OVER (ORDER BY month) AS mno\n  FROM m WHERE n >= 8\n), q AS (\n  SELECT month, mno, mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM q1\n)\nSELECT MIN(month) AS run_start, MAX(month) AS run_end,\n  COUNT(*) AS n_months\nFROM q\nGROUP BY island\nORDER BY run_start;")

fix("l63-problems.ts", "Customer sessions",
    "SELECT customer_id, created_at,\n  SUM(new_session) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS session_no\nFROM g\nORDER BY customer_id, created_at, id;",
    "SELECT customer_id, created_at,\n  SUM(new_session) OVER (PARTITION BY customer_id ORDER BY created_at) AS session_no\nFROM g\nORDER BY customer_id, created_at;")

fix("l63-problems.ts", "Sessions per customer",
    "SELECT customer_id, created_at,\n    SUM(ns) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS session_no\n  FROM g\n)",
    "SELECT customer_id, created_at,\n    SUM(ns) OVER (PARTITION BY customer_id ORDER BY created_at) AS session_no\n  FROM g\n)")

fix("l63-problems.ts", "2025 vs 2024 months",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    SUM(total) AS rev,\n    LAG(SUM(total), 12) OVER (ORDER BY month) AS yago\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(yago, 2) AS rev_2024\nFROM m\nWHERE SUBSTR(month, 1, 4) = '2025'\nORDER BY month;",
    M + ", y AS (\n  SELECT month, rev, LAG(rev, 12) OVER (ORDER BY month) AS yago\n  FROM m\n)\nSELECT month, ROUND(rev, 2) AS rev,\n  ROUND(yago, 2) AS rev_2024\nFROM y\nWHERE SUBSTR(month, 1, 4) = '2025'\nORDER BY month;")

fix("l63-problems.ts", "Quiet-month islands, revisited",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n    ROW_NUMBER() OVER (ORDER BY month) AS mno,\n    SUM(total) AS rev\n  FROM orders\n  GROUP BY month\n), q AS (\n  SELECT month, mno,\n    mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM m WHERE rev < 2500\n)\nSELECT MIN(month) AS run_start, MAX(month) AS run_end,\n  COUNT(*) AS n_months\nFROM q\nGROUP BY island\nORDER BY run_start;",
    M.replace("FROM m\nORDER BY month;", "") + "\nSELECT MIN(month) AS run_start, MAX(month) AS run_end,\n  COUNT(*) AS n_months\nFROM (\n  SELECT month, mno, mno - ROW_NUMBER() OVER (ORDER BY mno) AS island\n  FROM (\n    SELECT month, ROW_NUMBER() OVER (ORDER BY month) AS mno\n    FROM m WHERE rev < 2500\n  )\n)\nGROUP BY island\nORDER BY run_start;")

fix("l63-problems.ts", "Average session length",
    "SELECT customer_id, created_at,\n    SUM(ns) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS sess\n  FROM g\n)",
    "SELECT customer_id, created_at,\n    SUM(ns) OVER (PARTITION BY customer_id ORDER BY created_at) AS sess\n  FROM g\n)")

fix("l63-problems.ts", "Up-months, counted",
    "WITH m AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month, SUM(total) AS rev\n  FROM orders\n  GROUP BY month\n)\nSELECT SUM(CASE WHEN rev > LAG(rev) OVER (ORDER BY month)\n                THEN 1 ELSE 0 END) AS up_moves\nFROM m;",
    M + ", d AS (\n  SELECT month, rev - LAG(rev) OVER (ORDER BY month) AS delta\n  FROM m\n)\nSELECT SUM(CASE WHEN delta > 0 THEN 1 ELSE 0 END) AS up_moves\nFROM d;")

print("ALL FIXES APPLIED")
